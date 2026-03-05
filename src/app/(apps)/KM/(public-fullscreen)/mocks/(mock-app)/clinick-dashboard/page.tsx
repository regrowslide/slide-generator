"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calendar,
  LayoutDashboard,
  PieChart,
  RefreshCcw,
  TrendingUp,
  Users,
  Building2,
  Database,
  Table as TableIcon,
  Search,
  FileText,
  User,
  Check,
  ListFilter,
  ChevronDown,
  ChevronRight,
  LineChart,
  Target,
  Heart,
  LucideIcon,
} from 'lucide-react';
import {
  SplashScreen,
  useInfoModal,
  GuidanceOverlay,
  GuidanceStartButton,
  MockHeader,
  MockHeaderTitle,
  MockHeaderTab,
  MockHeaderInfoButton,
  type Feature,
  type TimeEfficiencyItem,
  type OverviewInfo,
  type OperationStep,
  type GuidanceStep,
} from '../../_components';

/* <aside>
  💡
  「こちらはモックであり、単一ファイルに収まるよう構築されています。このページは最終的に削除するため、本番プロジェクトでは、プロジェクトの設計やルールに従ってページやコンポーネントを分割してください」。
  </aside>
*/

// ==========================================
// Types
// ==========================================

interface Customer {
  customerId: string;
  memberId: string;
  nameKana: string;
  gender: string;
  dob: string;
  [key: string]: unknown;
}

interface Reservation {
  id: string;
  memberId: string;
  createdAt: string;
  visitDate: string;
  status: string;
  regSource: string;
  originalSource: string;
  bookSource: string;
  staff: string;
  clinic: string;
  visitCount: number;
  [key: string]: unknown;
}

interface Treatment {
  id: string;
  customerId: string;
  date: string;
  time: string;
  visitType: string;
  menu: string;
  part: string;
  amount: number;
  consumedAmount: number;
  clinic: string;
  staff: string;
  source: string;
  [key: string]: unknown;
}

interface MockData {
  customers: Customer[];
  reservations: Reservation[];
  treatments: Treatment[];
}

interface TempReservation {
  tempDate: number;
  data: { memberId: string };
}

interface SourcePart {
  name: string;
  count: number;
  amount: number;
}

interface SourceAnalysis {
  name: string;
  totalCount: number;
  totalAmount: number;
  parts: Record<string, SourcePart>;
}

interface Column {
  header: string;
  accessor?: string;
  className?: string;
  render?: (row: Record<string, unknown>) => React.ReactNode;
}

// ==========================================
// Constants & Configuration
// ==========================================

// 院名の一般化
const CLINIC_STAFF_MAP = {
  '東京本院': ['スタッフA', 'スタッフB', 'スタッフC'],
  '横浜院': ['スタッフD', 'スタッフE', 'スタッフF'],
  '大阪院': ['スタッフG', 'スタッフH', 'スタッフI'],
};

const CLINICS = Object.keys(CLINIC_STAFF_MAP);
const ALL_STAFF = Object.values(CLINIC_STAFF_MAP).flat();

const MEDIA_SOURCES = [
  'Tiktok', 'Instagram', 'X', 'LINE',
  '電話', 'メール', '看護師紹介', '友人紹介',
  'CP1', 'CP2'
];

const MENUS = [
  { name: '全身脱毛（顔・VIO含む）', price: 55000, category: '脱毛' },
  { name: '医療ハイフ（全顔）', price: 35000, category: '肌管理' },
  { name: 'ダーマペン4（全顔）', price: 19800, category: '肌管理' },
  { name: 'アートメイク（眉）2回コース', price: 120000, category: 'アートメイク' },
  { name: 'ボトックス（額）', price: 8000, category: '注入系' },
  { name: 'ヒアルロン酸（涙袋）', price: 45000, category: '注入系' },
  { name: '二重埋没法（3点留め）', price: 98000, category: '外科' },
  { name: '脂肪溶解注射（アゴ下）', price: 30000, category: '注入系' },
];

// ==========================================
// Mock Data Generator (Seeding 100 records)
// ==========================================

const generateMockData = (count = 100): MockData => {
  const customers: Customer[] = [];
  const reservations: Reservation[] = [];
  const treatments: Treatment[] = [];

  const today = new Date();
  const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 1);
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const startTimestamp = twoMonthsAgo.getTime();
  const thisMonthStartTimestamp = thisMonthStart.getTime();
  const endTimestamp = today.getTime();

  for (let i = 1; i <= count; i++) {
    // 1. Generate Customer（一般化された形式）
    const gender = Math.random() > 0.2 ? '女性' : '男性';
    const customer: Customer = {
      customerId: `C${10000 + i}`,
      memberId: `M${50000 + i}`,
      nameKana: `顧客 ${String(i).padStart(3, '0')}`,
      gender: gender,
      dob: new Date(startTimestamp - Math.random() * 31536000000 * 30).toISOString().split('T')[0],
    };
    customers.push(customer);

    // 2. Generate Reservations
    const visitCount = Math.floor(Math.random() * 3) + 1;
    const customerReservations: TempReservation[] = [];

    const primarySource = MEDIA_SOURCES[Math.floor(Math.random() * MEDIA_SOURCES.length)];

    for (let j = 0; j < visitCount; j++) {
      let reservationTime: number;
      if (Math.random() > 0.3) {
        reservationTime = thisMonthStartTimestamp + Math.random() * (endTimestamp - thisMonthStartTimestamp);
      } else {
        reservationTime = startTimestamp + Math.random() * (thisMonthStartTimestamp - startTimestamp);
      }

      customerReservations.push({
        tempDate: reservationTime,
        data: { memberId: customer.memberId }
      });
    }

    customerReservations.sort((a, b) => a.tempDate - b.tempDate);

    customerReservations.forEach((res, index) => {
      const visitDate = new Date(res.tempDate);
      const isCompleted = Math.random() > 0.15;
      const status = isCompleted ? '完了' : (Math.random() > 0.5 ? 'キャンセル' : '受付待ち');

      // Select Clinic first
      const clinic = CLINICS[Math.floor(Math.random() * CLINICS.length)];
      // Then select Staff belonging to that clinic
      const clinicStaffList = CLINIC_STAFF_MAP[clinic as keyof typeof CLINIC_STAFF_MAP];
      const staff = clinicStaffList[Math.floor(Math.random() * clinicStaffList.length)];

      const reservation: Reservation = {
        id: `R${100000 + reservations.length + 1}`,
        memberId: customer.memberId,
        createdAt: new Date(res.tempDate - 86400000 * 7).toISOString(),
        visitDate: visitDate.toISOString(),
        status: status,
        regSource: index === 0 ? primarySource : 'リピート',
        originalSource: primarySource,
        bookSource: index === 0 ? 'Web' : 'LINE',
        staff: staff,
        clinic: clinic,
        visitCount: index + 1,
      };
      reservations.push(reservation);

      // 3. Generate Treatment Record
      if (status === '完了') {
        const menu = MENUS[Math.floor(Math.random() * MENUS.length)];
        const partMatch = menu.name.match(/（(.*?)）/);
        const part = partMatch ? partMatch[1] : '-';

        let visitType = '再診';
        if (index === 0) {
          visitType = '新規';
        } else if (menu.category === 'アートメイク') {
          visitType = Math.random() > 0.3 ? 'リタッチ' : '再診';
        }

        const treatment: Treatment = {
          id: `T${200000 + treatments.length + 1}`,
          customerId: customer.customerId,
          date: visitDate.toISOString().split('T')[0],
          time: `${10 + Math.floor(Math.random() * 8)}:00`,
          visitType: visitType,
          menu: menu.name,
          part: part,
          amount: menu.price,
          consumedAmount: menu.price,
          clinic: clinic,
          staff: staff,
          source: primarySource,
        };
        treatments.push(treatment);
      }
    });
  }

  reservations.sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
  treatments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return { customers, reservations, treatments };
};

// ==========================================
// Utils
// ==========================================

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
};

const formatDate = (dateString, withTime = false) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const ymd = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  if (!withTime) return ymd;
  return `${ymd} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const getTodayString = () => new Date().toISOString().split('T')[0];
const getFirstDayOfMonthString = () => {
  const date = new Date();
  date.setDate(1);
  return date.toISOString().split('T')[0];
};

// ==========================================
// Animation Hook - カウントアップアニメーション
// ==========================================

const useCountUp = (end: number, duration = 1000, start = 0): number => {
  const [count, setCount] = useState(start);
  const countRef = useRef(start);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    countRef.current = start;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);

      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.floor(start + (end - start) * easeOut);

      if (currentCount !== countRef.current) {
        countRef.current = currentCount;
        setCount(currentCount);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, start]);

  return count;
};

// ==========================================
// Sub-Components
// ==========================================

interface TabButtonProps {
  active: boolean;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ active, label, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${active
      ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/25'
      : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200 hover:border-rose-200'
      }`}
  >
    <Icon size={18} />
    {label}
  </button>
);

interface ToggleButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  colorClass?: string;
  disabled?: boolean;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ label, isActive, onClick, colorClass = "bg-rose-500", disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 ${isActive
      ? `${colorClass} text-white border-transparent shadow-sm`
      : disabled
        ? 'bg-stone-50 text-stone-300 border-stone-100 cursor-not-allowed'
        : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50 hover:border-rose-200'
      }`}
  >
    {label}
  </button>
);

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  colorClass?: string;
  isAnimated?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subValue, icon: Icon, colorClass = "text-rose-600 bg-rose-50", isAnimated = false }) => {
  const numericValue = typeof value === 'string' ? parseInt(value.replace(/[^0-9]/g, '')) || 0 : value;
  const animatedValue = useCountUp(isAnimated ? numericValue : 0, 1500, 0);
  const displayValue = isAnimated ? `${animatedValue}件` : value;

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-stone-100 flex flex-col justify-between h-full
                    transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-rose-100 group">
      <div className="flex justify-between items-start mb-2">
        <span className="text-stone-500 text-sm font-medium">{title}</span>
        <div className={`p-2.5 rounded-xl ${colorClass} transition-transform duration-300 group-hover:scale-110`}>
          <Icon size={20} />
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-stone-800">{displayValue}</h3>
        {subValue && <p className="text-xs text-stone-500 mt-1">{subValue}</p>}
      </div>
    </div>
  );
};

/**
 * DataTable Component
 */
interface DataTableProps<T> {
  title: string;
  columns: Column[];
  data: T[];
  keyField?: string;
}

function DataTable<T extends Record<string, unknown> = Record<string, unknown>>({ title, columns, data, keyField = 'id' }: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lowerTerm = searchTerm.toLowerCase();
    return data.filter(row =>
      Object.values(row).some(val =>
        String(val).toLowerCase().includes(lowerTerm)
      )
    );
  }, [data, searchTerm]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-stone-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gradient-to-r from-stone-50 to-rose-50/30">
        <div className="flex items-center gap-2">
          <Database size={18} className="text-rose-500" />
          <h3 className="font-bold text-stone-800">{title}</h3>
          <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-medium">
            {filteredData.length}件
          </span>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 text-stone-400" size={16} />
          <input
            type="text"
            placeholder="検索..."
            className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-auto flex-1">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-stone-50 text-stone-500 font-medium border-b border-stone-200 sticky top-0 z-10">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-4 py-3 bg-stone-50">{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-stone-400">
                  データが見つかりません
                </td>
              </tr>
            ) : (
              filteredData.slice(0, 100).map((row, idx) => (
                <tr key={String(row[keyField]) || idx} className="hover:bg-rose-50/50 transition-colors duration-200">
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className={`px-4 py-3 text-stone-700 ${col.className || ''}`}>
                      {col.render ? col.render(row) : col.accessor ? String(row[col.accessor as keyof T] ?? '-') : '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==========================================
// Main Views
// ==========================================

/**
 * Dashboard View
 */
interface DashboardViewProps {
  reservations: Reservation[];
  treatments: Treatment[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ reservations, treatments }) => {
  // --- Filter States ---
  const [dateRange, setDateRange] = useState({
    start: getFirstDayOfMonthString(),
    end: getTodayString()
  });

  // Initialize all clinics and staff selected
  const [selectedClinics, setSelectedClinics] = useState([...CLINICS]);
  const [selectedStaff, setSelectedStaff] = useState([...ALL_STAFF]);

  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});

  // --- Handlers ---

  // Toggle Clinic: Controls both the clinic selection AND its staff
  const toggleClinic = (clinic: string) => {
    const isCurrentlySelected = selectedClinics.includes(clinic);
    const clinicStaff = CLINIC_STAFF_MAP[clinic as keyof typeof CLINIC_STAFF_MAP];

    if (isCurrentlySelected) {
      // Turn OFF: Remove clinic AND remove all its staff
      setSelectedClinics(prev => prev.filter(c => c !== clinic));
      setSelectedStaff(prev => prev.filter(s => !clinicStaff.includes(s)));
    } else {
      // Turn ON: Add clinic AND add all its staff (User friendly default)
      setSelectedClinics(prev => [...prev, clinic]);
      setSelectedStaff(prev => [...prev, ...clinicStaff]);
    }
  };

  // Toggle Staff: Only works if the parent clinic is selected
  const toggleStaff = (staff: string) => {
    setSelectedStaff(prev =>
      prev.includes(staff)
        ? prev.filter(s => s !== staff)
        : [...prev, staff]
    );
  };

  const toggleSourceExpand = (sourceName: string) => {
    setExpandedSources(prev => ({
      ...prev,
      [sourceName]: !prev[sourceName]
    }));
  };

  // --- Filter Logic ---
  const filteredData = useMemo(() => {
    const isWithinRange = (dateStr: string) => {
      if (!dateStr) return false;
      const d = dateStr.split('T')[0];
      return d >= dateRange.start && d <= dateRange.end;
    };

    const filteredReservations = reservations.filter(r =>
      isWithinRange(r.visitDate) &&
      selectedClinics.includes(r.clinic) &&
      selectedStaff.includes(r.staff)
    );

    const filteredTreatments = treatments.filter(t =>
      isWithinRange(t.date) &&
      selectedClinics.includes(t.clinic) &&
      selectedStaff.includes(t.staff)
    );

    return { reservations: filteredReservations, treatments: filteredTreatments };
  }, [reservations, treatments, dateRange, selectedClinics, selectedStaff]);

  // --- Stats Calculation ---
  const stats = useMemo(() => {
    const { reservations: res, treatments: tr } = filteredData;

    // 1. Visit Type Counts
    const visitTypes = { 新規: 0, 再診: 0, リタッチ: 0 };
    tr.forEach(t => {
      if (visitTypes[t.visitType] !== undefined) visitTypes[t.visitType]++;
    });

    // 2. Cancellation Stats
    const totalReservations = res.length;
    const cancelledCount = res.filter(r => r.status === 'キャンセル').length;
    const completedCount = res.filter(r => r.status === '完了').length;
    const cancelRate = totalReservations > 0 ? (cancelledCount / totalReservations) * 100 : 0;

    // 3. Source & Parts Cross Analysis (Hierarchical)
    const sourceAnalysisMap: Record<string, SourceAnalysis> = {};

    // Initialize sources
    MEDIA_SOURCES.forEach(s => {
      sourceAnalysisMap[s] = { name: s, totalCount: 0, totalAmount: 0, parts: {} };
    });

    tr.forEach(t => {
      const source = t.source || '不明';
      if (!sourceAnalysisMap[source]) {
        sourceAnalysisMap[source] = { name: source, totalCount: 0, totalAmount: 0, parts: {} };
      }

      const record = sourceAnalysisMap[source];
      record.totalCount += 1;
      record.totalAmount += t.amount;

      if (!record.parts[t.part]) {
        record.parts[t.part] = { name: t.part, count: 0, amount: 0 };
      }
      record.parts[t.part].count += 1;
      record.parts[t.part].amount += t.amount;
    });

    const sourceAnalysisData = Object.values(sourceAnalysisMap)
      .map(s => ({
        ...s,
        parts: Object.values(s.parts).sort((a, b) => b.count - a.count)
      }))
      .sort((a, b) => b.totalCount - a.totalCount);

    return {
      visitTypes,
      totalReservations,
      cancelledCount,
      completedCount,
      cancelRate,
      sourceAnalysisData
    };
  }, [filteredData]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Filter Section */}
      <div data-guidance="filter-section" className="bg-white p-5 rounded-xl shadow-sm border border-stone-200 space-y-5">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
          <div className="p-2 bg-rose-100 rounded-lg">
            <ListFilter size={18} className="text-rose-600" />
          </div>
          <h2 className="font-bold text-stone-800">集計フィルター</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Date Range */}
          <div className="md:col-span-3">
            <label className="text-xs font-semibold text-stone-500 uppercase mb-2 block">対象期間</label>
            <div className="flex flex-col gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={e => setDateRange(p => ({ ...p, start: e.target.value }))}
                className="w-full text-sm border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
              />
              <div className="flex justify-center text-stone-400 text-xs">⬇</div>
              <input
                type="date"
                value={dateRange.end}
                onChange={e => setDateRange(p => ({ ...p, end: e.target.value }))}
                className="w-full text-sm border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Clinics & Staff (Grouped) */}
          <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CLINICS.map(clinic => {
              const isClinicSelected = selectedClinics.includes(clinic);
              const clinicStaffList = CLINIC_STAFF_MAP[clinic];

              return (
                <div
                  key={clinic}
                  className={`border rounded-xl p-3 transition-all duration-300 ${isClinicSelected
                    ? 'border-rose-200 bg-gradient-to-br from-rose-50/50 to-amber-50/30 shadow-sm'
                    : 'border-stone-100 bg-stone-50/50'
                    }`}
                >
                  {/* Parent: Clinic Toggle */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className={isClinicSelected ? "text-rose-500" : "text-stone-400"} />
                      <span className={`font-bold text-sm ${isClinicSelected ? "text-stone-800" : "text-stone-500"}`}>
                        {clinic}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={isClinicSelected}
                        onChange={() => toggleClinic(clinic)}
                      />
                      <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
                    </label>
                  </div>

                  {/* Children: Staff Toggles */}
                  <div className={`space-y-2 pl-1 transition-opacity duration-300 ${!isClinicSelected ? 'opacity-50 pointer-events-none' : ''}`}>
                    <p className="text-[10px] text-stone-400 font-semibold uppercase mb-1">所属スタッフ</p>
                    <div className="flex flex-wrap gap-2">
                      {clinicStaffList.map(staff => (
                        <ToggleButton
                          key={staff}
                          label={staff}
                          isActive={selectedStaff.includes(staff)}
                          onClick={() => toggleStaff(staff)}
                          disabled={!isClinicSelected}
                          colorClass="bg-rose-500"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* KPI Section: Visit Types */}
      <h3 data-guidance="kpi-section" className="font-bold text-stone-700 mt-8 mb-2 flex items-center gap-2">
        <div className="p-1.5 bg-amber-100 rounded-lg">
          <Users size={18} className="text-amber-600" />
        </div>
        区分別 実施件数
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="新規"
          value={`${stats.visitTypes['新規']}件`}
          icon={User}
          colorClass="text-amber-600 bg-amber-50"
          isAnimated={true}
        />
        <StatCard
          title="再診"
          value={`${stats.visitTypes['再診']}件`}
          icon={RefreshCcw}
          colorClass="text-rose-500 bg-rose-50"
          isAnimated={true}
        />
        <StatCard
          title="リタッチ"
          value={`${stats.visitTypes['リタッチ']}件`}
          icon={Check}
          colorClass="text-pink-500 bg-pink-50"
          isAnimated={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Reservation vs Cancellation */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-stone-100 transition-all duration-300 hover:shadow-lg">
          <h3 className="font-bold text-stone-800 mb-6 flex items-center gap-2">
            <div className="p-1.5 bg-rose-100 rounded-lg">
              <PieChart size={16} className="text-rose-500" />
            </div>
            予約・キャンセル状況
          </h3>
          <div className="flex justify-center mb-6">
            <div className="relative w-40 h-40 rounded-full border-[16px] border-stone-100 flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full border-[16px] border-rose-400 border-l-transparent border-b-transparent border-r-transparent transform -rotate-45"
                style={{ clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%)`, opacity: stats.cancelRate / 100 }}
              />
              <div className="text-center">
                <div className="text-3xl font-bold text-stone-800">{stats.totalReservations}</div>
                <div className="text-xs text-stone-400">総予約数</div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-stone-50 rounded-lg transition-colors hover:bg-rose-50">
              <span className="text-sm font-medium text-stone-600">キャンセル数</span>
              <span className="font-bold text-rose-500">{stats.cancelledCount}件</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-stone-50 rounded-lg transition-colors hover:bg-rose-50">
              <span className="text-sm font-medium text-stone-600">キャンセル率</span>
              <span className="font-bold text-stone-800">{Math.round(stats.cancelRate)}%</span>
            </div>
          </div>
        </div>

        {/* Source Analysis Table (Hierarchical) */}
        <div data-guidance="source-analysis" className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-stone-100 flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg">
          <div className="p-4 border-b border-stone-100 bg-gradient-to-r from-stone-50 to-rose-50/50 flex items-center gap-2">
            <div className="p-1.5 bg-rose-100 rounded-lg">
              <TrendingUp size={16} className="text-rose-500" />
            </div>
            <h3 className="font-bold text-stone-800">流入経路別 パフォーマンス分析</h3>
          </div>

          <div className="overflow-auto flex-1 max-h-[400px]">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-stone-50 text-stone-500 font-medium sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 w-10"></th>
                  <th className="px-4 py-3">流入経路</th>
                  <th className="px-4 py-3 text-right">施術数</th>
                  <th className="px-4 py-3 text-right">売上合計</th>
                  <th className="px-4 py-3 w-32 text-center">構成比</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {stats.sourceAnalysisData.map((row) => {
                  const isExpanded = expandedSources[row.name];
                  const totalTreatments = stats.sourceAnalysisData.reduce((acc, cur) => acc + cur.totalCount, 0);
                  const share = totalTreatments > 0 ? (row.totalCount / totalTreatments) * 100 : 0;

                  return (
                    <React.Fragment key={row.name}>
                      {/* Main Row */}
                      <tr
                        className={`
                          cursor-pointer transition-all duration-200
                          ${isExpanded ? 'bg-rose-50/50' : 'hover:bg-stone-50'}
                        `}
                        onClick={() => toggleSourceExpand(row.name)}
                      >
                        <td className="px-4 py-3 text-center text-stone-400">
                          {row.parts.length > 0 && (
                            <span className="transition-transform duration-200 inline-block">
                              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-stone-700">
                          {row.name}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-stone-800">
                          {row.totalCount}件
                        </td>
                        <td className="px-4 py-3 text-right text-stone-600">
                          {formatCurrency(row.totalAmount)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full transition-all duration-500"
                                style={{ width: `${share}%` }}
                              />
                            </div>
                            <span className="text-xs text-stone-400 w-8 text-right">{Math.round(share)}%</span>
                          </div>
                        </td>
                      </tr>

                      {/* Detail Row (Parts breakdown) */}
                      {isExpanded && (
                        <tr className="bg-stone-50/50 animate-in fade-in slide-in-from-top-1 duration-200">
                          <td colSpan={5} className="p-0">
                            <div className="px-4 py-3 pl-14 pr-8 border-b border-stone-100 shadow-inner bg-stone-50">
                              <div className="text-xs font-bold text-stone-500 mb-2 uppercase tracking-wide flex items-center gap-1">
                                <FileText size={14} />
                                施術部位内訳
                              </div>
                              {row.parts.length === 0 ? (
                                <p className="text-xs text-stone-400 py-2">施術データがありません</p>
                              ) : (
                                <div className="space-y-2">
                                  {row.parts.map((part) => (
                                    <div key={part.name} className="flex items-center text-sm group">
                                      <span className="w-32 text-stone-600 truncate text-xs font-medium">{part.name}</span>
                                      <div className="flex-1 flex items-center gap-3">
                                        <div className="flex-1 h-6 bg-white border border-stone-200 rounded relative overflow-hidden">
                                          <div
                                            className="h-full bg-rose-100 group-hover:bg-rose-200 transition-colors duration-200"
                                            style={{ width: `${(part.count / row.totalCount) * 100}%` }}
                                          />
                                          <span className="absolute inset-0 flex items-center px-2 text-xs text-stone-600">
                                            {part.count}件 ({formatCurrency(part.amount)})
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

/**
 * Data Tables View
 * Allows inspection of the 3 core tables.
 */
interface DataTablesViewProps {
  customers: Customer[];
  reservations: Reservation[];
  treatments: Treatment[];
}

const DataTablesView: React.FC<DataTablesViewProps> = ({ customers, reservations, treatments }) => {
  const [activeTable, setActiveTable] = useState('customers');

  // Customer Columns
  const customerColumns = [
    { header: '顧客ID', accessor: 'customerId', className: 'font-mono text-xs text-stone-500' },
    { header: '会員ID', accessor: 'memberId', className: 'font-mono text-xs font-bold' },
    { header: '氏名（かな）', accessor: 'nameKana' },
    { header: '性別', accessor: 'gender' },
    { header: '生年月日', accessor: 'dob' },
  ];

  // Reservation Columns
  const reservationColumns = [
    { header: '予約ID', accessor: 'id', className: 'font-mono text-xs text-stone-500' },
    { header: '予約日時', accessor: 'visitDate', render: (row) => formatDate(row.visitDate, true) },
    {
      header: 'ステータス', accessor: 'status', render: (row) => (
        <span className={`px-2 py-0.5 rounded text-xs font-bold ${row.status === '完了' ? 'text-emerald-600 bg-emerald-50' :
          row.status === 'キャンセル' ? 'text-rose-600 bg-rose-50' : 'text-stone-500 bg-stone-100'
          }`}>{row.status}</span>
      )
    },
    { header: '登録経路', accessor: 'regSource' },
    { header: '店舗', accessor: 'clinic' },
    { header: 'スタッフ', accessor: 'staff' },
    { header: '回数', accessor: 'visitCount', render: (row) => <span className="font-bold">{row.visitCount}回目</span> },
  ];

  // Treatment Columns
  const treatmentColumns = [
    { header: '施術ID', accessor: 'id', className: 'font-mono text-xs text-stone-500' },
    { header: '実施日', accessor: 'date' },
    {
      header: '来店区分', accessor: 'visitType', render: (row) => (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${row.visitType === '新規' ? 'bg-amber-100 text-amber-700' :
          row.visitType === 'リタッチ' ? 'bg-pink-100 text-pink-700' :
            'bg-stone-100 text-stone-600'
          }`}>
          {row.visitType}
        </span>
      )
    },
    { header: '流入元', accessor: 'source', className: 'text-xs text-stone-500' },
    { header: '診療内容', accessor: 'menu', className: 'max-w-[150px] truncate' },
    { header: '部位', accessor: 'part', render: (row) => <span className="bg-stone-100 px-2 py-0.5 rounded text-xs">{row.part}</span> },
    { header: '契約金額', accessor: 'amount', render: (row) => formatCurrency(row.amount), className: 'text-right font-medium' },
    { header: '店舗', accessor: 'clinic' },
    { header: 'スタッフ', accessor: 'staff' },
  ];

  return (
    <div className="space-y-4 h-[calc(100vh-200px)] flex flex-col">
      {/* Sub-tabs for tables */}
      <div data-guidance="data-sub-tabs" className="flex space-x-2 bg-stone-100 p-1 rounded-lg w-fit">
        {[
          { id: 'customers', label: '顧客マスタ', icon: Users },
          { id: 'reservations', label: '予約一覧', icon: Calendar },
          { id: 'treatments', label: '施術記録一覧', icon: FileText },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTable(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${activeTable === tab.id
              ? 'bg-white text-rose-600 shadow-sm'
              : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50'
              }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table Content */}
      <div className="flex-1 min-h-0">
        {activeTable === 'customers' && (
          <DataTable title="顧客マスタ" columns={customerColumns} data={customers} keyField="customerId" />
        )}
        {activeTable === 'reservations' && (
          <DataTable title="予約一覧" columns={reservationColumns} data={reservations} keyField="id" />
        )}
        {activeTable === 'treatments' && (
          <DataTable title="施術記録一覧" columns={treatmentColumns} data={treatments} keyField="id" />
        )}
      </div>
    </div>
  );
};

// ==========================================
// Main Component
// ==========================================

// Info Sidebar Configuration
const CLINIC_FEATURES: Feature[] = [
  {
    icon: LineChart,
    title: '流入経路分析',
    description: 'SNS・Web・紹介など、どの経路から新規顧客が来ているかを一目で把握。広告費の最適配分に活用できます。',
    benefit: '広告ROIの改善で月20万円以上のコスト削減実績',
  },
  {
    icon: Target,
    title: 'KPI可視化',
    description: '新規数・リピート率・売上などの重要指標をリアルタイムで確認。目標達成状況が常に把握できます。',
    benefit: '数値確認作業を1日30分→5分に短縮',
  },
  {
    icon: Users,
    title: '顧客管理',
    description: '会員情報・来院履歴・施術履歴を一元管理。次回提案や再来促進がスムーズに行えます。',
    benefit: 'リピート率15%向上の実績',
  },
  {
    icon: Calendar,
    title: '予約管理',
    description: 'カレンダー形式で予約状況を可視化。ダブルブッキング防止とスタッフ稼働の最適化を実現。',
    benefit: '予約関連の電話対応を50%削減',
  },
];

const CLINIC_TIME_EFFICIENCY: TimeEfficiencyItem[] = [
  { task: '日次売上レポート作成', before: '45分', after: '自動生成', saved: '45分/日' },
  { task: '流入経路分析', before: '2時間', after: '10分', saved: '110分/週' },
  { task: '顧客情報検索', before: '5分/件', after: '10秒/件', saved: '4時間/日' },
  { task: 'スタッフ別実績集計', before: '1時間', after: '即時表示', saved: '60分/日' },
];

const CLINIC_CHALLENGES = [
  '広告費をかけているが効果が見えない',
  'Excelでの集計作業に時間がかかる',
  '複数院の数値を横断で見たい',
  'スタッフごとの実績を可視化したい',
  'リピート率を改善したい',
];

const CLINIC_OVERVIEW: OverviewInfo = {
  description: '美容医療業界特有のKPI管理・顧客分析に最適化されたダッシュボードです。複数院の一元管理にも対応しています。',
  automationPoints: [
    'SNS・Web・紹介など流入経路別の効果を自動分析',
    '新規/リピート・スタッフ別・院別の売上を自動集計',
    '顧客の来院履歴・施術履歴の自動追跡',
    '予約状況のリアルタイム可視化',
  ],
  userBenefits: [
    '広告費の最適配分でROIを大幅改善',
    'データに基づく経営判断で売上向上',
    'スタッフ教育・評価の客観的指標を提供',
  ],
};

const CLINIC_OPERATION_STEPS: OperationStep[] = [
  { step: 1, action: 'ダッシュボードを確認', detail: '新規数・売上・リピート率など主要KPIを即座に把握' },
  { step: 2, action: '流入経路を分析', detail: 'SNS・紹介・広告など経路別の効果を確認し広告費を最適化' },
  { step: 3, action: 'スタッフ実績を確認', detail: 'スタッフ別・院別の売上と施術件数を比較分析' },
  { step: 4, action: 'データソースを確認', detail: '顧客マスタ・予約・施術の生データを直接確認' },
];

const getClinicGuidanceSteps = (setActiveTab: (tab: string) => void): GuidanceStep[] => [
  { targetSelector: '[data-guidance="dashboard-tab"]', title: 'ダッシュボード', description: '主要KPI・売上推移・流入経路分析をリアルタイムで確認できます。', position: 'bottom', action: () => setActiveTab('dashboard') },
  { targetSelector: '[data-guidance="filter-section"]', title: '集計フィルター', description: '期間・店舗・スタッフを選んで集計対象を絞り込めます。', position: 'bottom', action: () => setActiveTab('dashboard') },
  { targetSelector: '[data-guidance="kpi-section"]', title: 'KPI指標', description: '新規・再診・リタッチの区分別実施件数を確認できます。', position: 'top', action: () => setActiveTab('dashboard') },
  { targetSelector: '[data-guidance="source-analysis"]', title: '流入経路分析', description: 'SNS・Web・紹介など経路別のパフォーマンスを比較分析できます。', position: 'top', action: () => setActiveTab('dashboard') },
  { targetSelector: '[data-guidance="tables-tab"]', title: 'データソース確認', description: '顧客・予約・施術の生データを一覧で確認・検索できます。', position: 'bottom', action: () => setActiveTab('dashboard') },
  { targetSelector: '[data-guidance="data-sub-tabs"]', title: 'データの切替', description: '顧客マスタ・予約一覧・施術記録の各テーブルを切り替えて閲覧できます。', position: 'bottom', action: () => setActiveTab('tables') },
  { targetSelector: '[data-guidance="info-button"]', title: '機能説明', description: 'システムの概要や操作手順、時間削減効果を確認できます。右下のボタンからいつでも開けます。', position: 'bottom', action: () => setActiveTab('tables') },
];

export default function MarketingDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState<MockData>({ customers: [], reservations: [], treatments: [] });
  const [isGenerated, setIsGenerated] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showGuidance, setShowGuidance] = useState(false);
  const { InfoModal, openInfo } = useInfoModal({
    theme: "rose",
    systemIcon: Heart,
    systemName: "美容クリニック専用設計",
    systemDescription: "美容医療業界特有のKPI管理・顧客分析に最適化されたダッシュボードです。複数院の一元管理にも対応しています。",
    features: CLINIC_FEATURES,
    timeEfficiency: CLINIC_TIME_EFFICIENCY,
    challenges: CLINIC_CHALLENGES,
    overview: CLINIC_OVERVIEW,
    operationSteps: CLINIC_OPERATION_STEPS,
  });

  // Initial Data Seeding
  useEffect(() => {
    const generated = generateMockData(200);
    setData(generated);

    // ウェルカムスプラッシュ
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
      setIsGenerated(true);
    }, 1500);

    return () => clearTimeout(splashTimer);
  }, []);

  // スプラッシュ画面
  if (showSplash) {
    return <SplashScreen theme="rose" systemName="Beauty Clinic Hub" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-rose-50/30 font-sans text-stone-900 flex flex-col">
      {/* Header */}
      <MockHeader>
        <MockHeaderTitle icon={LayoutDashboard} title="Beauty Clinic Hub" subtitle="Marketing Dashboard" theme="rose" />

        <div className="flex items-center gap-2">
          <GuidanceStartButton onClick={() => setShowGuidance(true)} theme="rose" />
          <MockHeaderTab
            active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
            icon={LayoutDashboard}
            label="ダッシュボード"
            theme="rose"
            data-guidance="dashboard-tab"
          />
          <MockHeaderTab
            active={activeTab === 'tables'}
            onClick={() => setActiveTab('tables')}
            icon={TableIcon}
            label="データソース確認"
            theme="rose"
            data-guidance="tables-tab"
          />
          <MockHeaderInfoButton onClick={openInfo} theme="rose" />
        </div>
      </MockHeader>

      <InfoModal />
      <GuidanceOverlay
        steps={getClinicGuidanceSteps(setActiveTab)}
        isActive={showGuidance}
        onClose={() => setShowGuidance(false)}
        theme="rose"
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">

        {/* View Switcher */}
        {isGenerated ? (
          activeTab === 'dashboard' ? (
            <DashboardView
              reservations={data.reservations}
              treatments={data.treatments}
            />
          ) : (
            <DataTablesView
              customers={data.customers}
              reservations={data.reservations}
              treatments={data.treatments}
            />
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-stone-500">
            <RefreshCcw className="animate-spin mb-2 text-rose-500" size={32} />
            <p>データを生成中...</p>
          </div>
        )}

      </main>

      {/* Footer / Context */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-stone-200 py-4 shrink-0">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-stone-400">
          <p>Beauty Clinic Hub - Demo System</p>
        </div>
      </footer>
    </div>
  );
}
