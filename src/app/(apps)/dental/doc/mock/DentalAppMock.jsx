"use client";

/**
 * 訪問歯科アプリ モックアップ
 *
 * こちらはモックであり、単一ファイルに収まるよう構築されています。
 * このページは最終的に削除するため、本番プロジェクトでは、
 * プロジェクトの設計やルールに従ってページやコンポーネントを分割してください。
 */

import { useState, useMemo, useCallback } from "react";
import useModal from "@cm/components/utils/modal/useModal";

// =============================================================================
// 定数・サンプルデータ
// =============================================================================

/** 施設タイプ */
const FACILITY_TYPES = {
  NURSING_HOME: "特別養護老人ホーム",
  GROUP_HOME: "グループホーム",
  RESIDENTIAL: "居宅",
};

/** スタッフの役割 */
const STAFF_ROLES = {
  DOCTOR: "doctor",
  HYGIENIST: "hygienist",
};

/** 診察ステータス */
const EXAMINATION_STATUS = {
  WAITING: "waiting",
  IN_PROGRESS: "in_progress",
  DONE: "done",
};

/** 初期施設データ */
const INITIAL_FACILITIES = [
  { id: 1, name: "ひまわりケアホーム", address: "東京都世田谷区北沢2-1-1", facilityType: "NURSING_HOME" },
  { id: 2, name: "グループホーム さくら", address: "東京都杉並区高円寺北3-2-5", facilityType: "GROUP_HOME" },
  { id: 3, name: "特別養護老人ホーム 松風", address: "東京都練馬区光が丘1-8-3", facilityType: "NURSING_HOME" },
];

/** 初期利用者データ */
const INITIAL_PATIENTS = [
  { id: 1, facilityId: 1, name: "山田 太郎", nameKana: "ヤマダ タロウ", building: "本館", floor: "2F", room: "201", notes: "嚥下機能低下気味。義歯調整要。" },
  { id: 2, facilityId: 1, name: "鈴木 花子", nameKana: "スズキ ハナコ", building: "本館", floor: "2F", room: "202", notes: "認知症あり。拒否時は無理せず。" },
  { id: 3, facilityId: 1, name: "高橋 健一", nameKana: "タカハシ ケンイチ", building: "本館", floor: "2F", room: "203", notes: "" },
  { id: 4, facilityId: 1, name: "田中 幸子", nameKana: "タナカ サチコ", building: "本館", floor: "2F", room: "205", notes: "家族立ち会い希望あり" },
  { id: 5, facilityId: 1, name: "伊藤 博文", nameKana: "イトウ ヒロフミ", building: "本館", floor: "3F", room: "301", notes: "入れ歯紛失注意" },
  { id: 6, facilityId: 2, name: "佐藤 美咲", nameKana: "サトウ ミサキ", building: "A棟", floor: "1F", room: "101", notes: "" },
  { id: 7, facilityId: 2, name: "渡辺 次郎", nameKana: "ワタナベ ジロウ", building: "A棟", floor: "1F", room: "102", notes: "車椅子使用" },
];

/** 初期スタッフデータ */
const INITIAL_STAFF = [
  { id: 1, name: "田中 医師", role: STAFF_ROLES.DOCTOR },
  { id: 2, name: "山本 医師", role: STAFF_ROLES.DOCTOR },
  { id: 3, name: "佐々木 衛生士", role: STAFF_ROLES.HYGIENIST },
  { id: 4, name: "中村 衛生士", role: STAFF_ROLES.HYGIENIST },
];

/** 初期訪問計画データ */
const INITIAL_VISIT_PLANS = [
  { id: 1, facilityId: 1, visitDate: "2026-01-18", status: "scheduled" },
  { id: 2, facilityId: 1, visitDate: "2026-01-25", status: "scheduled" },
  { id: 3, facilityId: 2, visitDate: "2026-01-20", status: "scheduled" },
];

/** 初期診察データ */
const INITIAL_EXAMINATIONS = [
  {
    id: 1,
    visitPlanId: 1,
    patientId: 2,
    doctorId: 1,
    hygienistId: 3,
    status: EXAMINATION_STATUS.WAITING,
    sortOrder: 1,
    vitalBefore: { bloodPressure: "120/80", spo2: "98" },
    vitalAfter: null,
    treatmentItems: [],
    procedureItems: {}, // オブジェクト形式: { itemId: { categoryId: string } }
    visitCondition: "",
    oralFindings: "",
    treatment: "",
    nextPlan: "",
    drStartTime: null,
    drEndTime: null,
    dhStartTime: null,
    dhEndTime: null,
  },
  {
    id: 2,
    visitPlanId: 1,
    patientId: 1,
    doctorId: 1,
    hygienistId: null,
    status: EXAMINATION_STATUS.WAITING,
    sortOrder: 2,
    vitalBefore: null,
    vitalAfter: null,
    treatmentItems: [],
    procedureItems: {}, // オブジェクト形式: { itemId: { categoryId: string } }
    visitCondition: "",
    oralFindings: "",
    treatment: "",
    nextPlan: "",
    drStartTime: null,
    drEndTime: null,
    dhStartTime: null,
    dhEndTime: null,
  },
];

/** 実施項目マスタ */
const TREATMENT_ITEMS_MASTER = [
  { id: "zaitakukan", name: "在宅管", fullName: "在宅管（管理）", category: "管理" },
  { id: "houeishi", name: "訪衛指", fullName: "訪衛指（指導）", category: "指導" },
  { id: "koukuu", name: "口腔機能", fullName: "口腔機能（検査/訓練）", category: "検査" },
  { id: "shisetsu", name: "施設系", fullName: "施設系（会議等）", category: "その他" },
];

/** 実施項目マスタ（加算用） - 拡張版 */
const PROCEDURE_ITEMS_MASTER = [
  {
    id: "uhou",
    name: "齲訪",
    infoUrl: "/dental/docs/uhou.pdf",
    categories: [
      { id: "1", name: "同一建物1人", points: 1100 },
      { id: "2", name: "同一建物2-9人", points: 361 },
      { id: "3", name: "同一建物10人以上", points: 185 },
    ],
    documents: [{ id: "doc_uhou_1", name: "訪問歯科診療計画書" }],
    autoJudgeCondition: "facilityType", // 自動判定の基準
  },
  {
    id: "houhojo",
    name: "訪補助",
    infoUrl: "/dental/docs/houhojo.pdf",
    categories: [],
    documents: [],
    defaultPoints: 120,
  },
  {
    id: "shizaikan",
    name: "歯在管",
    infoUrl: "/dental/docs/shizaikan.pdf",
    categories: [
      { id: "1", name: "在宅", points: 318 },
      { id: "2", name: "施設入居", points: 270 },
    ],
    documents: [
      { id: "doc_shizaikan_1", name: "歯科疾患在宅療養管理料説明書" },
      { id: "doc_shizaikan_2", name: "管理計画書" },
    ],
    autoJudgeCondition: "patientResidence",
  },
  {
    id: "shizaikan_bunsho",
    name: "歯在管文書提供加算",
    infoUrl: "/dental/docs/shizaikan_bunsho.pdf",
    categories: [],
    documents: [{ id: "doc_bunsho_1", name: "文書提供書" }],
    defaultPoints: 10,
  },
  {
    id: "p_gazou",
    name: "P画像",
    infoUrl: "/dental/docs/p_gazou.pdf",
    categories: [
      { id: "1", name: "10枚法", points: 96 },
      { id: "2", name: "標準型", points: 60 },
    ],
    documents: [],
  },
  {
    id: "zaishikan",
    name: "在歯管",
    infoUrl: "/dental/docs/zaishikan.pdf",
    categories: [
      { id: "1", name: "在宅", points: 294 },
      { id: "2", name: "施設", points: 245 },
    ],
    documents: [{ id: "doc_zaishikan_1", name: "在宅歯科医療管理計画書" }],
    autoJudgeCondition: "patientResidence",
  },
  {
    id: "houeishi",
    name: "訪衛指",
    infoUrl: "/dental/docs/houeishi.pdf",
    categories: [
      { id: "1", name: "同一建物1人", points: 362 },
      { id: "2", name: "同一建物2-9人", points: 326 },
      { id: "3", name: "同一建物10人以上", points: 295 },
    ],
    documents: [{ id: "doc_houeishi_1", name: "訪問歯科衛生指導計画書" }],
    autoJudgeCondition: "facilityType",
  },
  {
    id: "zaikouei",
    name: "在口衛",
    infoUrl: "/dental/docs/zaikouei.pdf",
    categories: [
      { id: "1", name: "在宅", points: 110 },
      { id: "2", name: "施設", points: 100 },
    ],
    documents: [],
    autoJudgeCondition: "patientResidence",
  },
  {
    id: "nst2",
    name: "NST2",
    infoUrl: "/dental/docs/nst2.pdf",
    categories: [],
    documents: [],
    defaultPoints: 100,
  },
  {
    id: "koukuu_kinou",
    name: "口腔機能低下症",
    infoUrl: "/dental/docs/koukuu_kinou.pdf",
    categories: [],
    documents: [{ id: "doc_koukuu_1", name: "口腔機能評価表" }],
    defaultPoints: 100,
  },
  {
    id: "zetsuatsu",
    name: "舌圧",
    infoUrl: "/dental/docs/zetsuatsu.pdf",
    categories: [],
    documents: [],
    defaultPoints: 140,
  },
  {
    id: "kougouatsu1",
    name: "咬合圧１",
    infoUrl: "/dental/docs/kougouatsu.pdf",
    categories: [],
    documents: [],
    defaultPoints: 130,
  },
  {
    id: "kougaiken1",
    name: "口蓋検1",
    infoUrl: "/dental/docs/kougaiken.pdf",
    categories: [],
    documents: [],
    defaultPoints: 50,
  },
  {
    id: "soshaku1",
    name: "咀嚼１",
    infoUrl: "/dental/docs/soshaku.pdf",
    categories: [],
    documents: [],
    defaultPoints: 100,
  },
  {
    id: "shiriha3",
    name: "歯リハ3",
    infoUrl: "/dental/docs/shiriha.pdf",
    categories: [],
    documents: [],
    defaultPoints: 190,
  },
  {
    id: "shiriha1",
    name: "歯リハ1",
    infoUrl: "/dental/docs/shiriha.pdf",
    categories: [],
    documents: [],
    defaultPoints: 185,
  },
  {
    id: "baseup",
    name: "ベースアップ加算",
    infoUrl: "/dental/docs/baseup.pdf",
    categories: [],
    documents: [],
    defaultPoints: 0,
  },
  {
    id: "dx",
    name: "DX加算",
    infoUrl: "/dental/docs/dx.pdf",
    categories: [],
    documents: [],
    defaultPoints: 8,
  },
  {
    id: "joukyo1",
    name: "情共１",
    infoUrl: "/dental/docs/joukyo.pdf",
    categories: [],
    documents: [{ id: "doc_joukyo_1", name: "診療情報提供書" }],
    defaultPoints: 120,
  },
  {
    id: "soui",
    name: "総医",
    infoUrl: "/dental/docs/soui.pdf",
    categories: [],
    documents: [],
    defaultPoints: 100,
  },
  {
    id: "fkyoku_konc",
    name: "F局（根C）",
    infoUrl: "/dental/docs/fkyoku.pdf",
    categories: [],
    documents: [],
    defaultPoints: 120,
  },
  {
    id: "konc_koukan",
    name: "根C管 口管強",
    infoUrl: "/dental/docs/konc.pdf",
    categories: [],
    documents: [],
    defaultPoints: 80,
  },
  {
    id: "saho",
    name: "サホ塗布",
    infoUrl: "/dental/docs/saho.pdf",
    categories: [],
    documents: [],
    defaultPoints: 67,
  },
  {
    id: "p_seiken",
    name: "P精検",
    infoUrl: "/dental/docs/p_seiken.pdf",
    categories: [],
    documents: [],
    defaultPoints: 400,
  },
  {
    id: "p_kiken",
    name: "P基検",
    infoUrl: "/dental/docs/p_kiken.pdf",
    categories: [],
    documents: [],
    defaultPoints: 200,
  },
  {
    id: "spt",
    name: "SPT",
    infoUrl: "/dental/docs/spt.pdf",
    categories: [
      { id: "1", name: "SPT(I)", points: 380 },
      { id: "2", name: "SPT(II)", points: 630 },
    ],
    documents: [],
  },
  {
    id: "koukan_kasan",
    name: "口管強加算",
    infoUrl: "/dental/docs/koukan.pdf",
    categories: [],
    documents: [],
    defaultPoints: 100,
  },
  {
    id: "tounyou",
    name: "糖尿病加算",
    infoUrl: "/dental/docs/tounyou.pdf",
    categories: [],
    documents: [],
    defaultPoints: 100,
  },
  {
    id: "p_juubou",
    name: "P重防",
    infoUrl: "/dental/docs/p_juubou.pdf",
    categories: [],
    documents: [],
    defaultPoints: 270,
  },
  {
    id: "houikou",
    name: "訪移行",
    infoUrl: "/dental/docs/houikou.pdf",
    categories: [],
    documents: [],
    defaultPoints: 150,
  },
  {
    id: "houmon_koukuu_riha",
    name: "訪問口腔リハ",
    infoUrl: "/dental/docs/houmon_riha.pdf",
    categories: [
      { id: "1", name: "同一建物1人", points: 300 },
      { id: "2", name: "同一建物2-9人", points: 250 },
      { id: "3", name: "同一建物10人以上", points: 200 },
    ],
    documents: [],
    autoJudgeCondition: "facilityType",
  },
  {
    id: "houmon_koukuu_riha_kasan",
    name: "訪問口腔リハ加算",
    infoUrl: "/dental/docs/houmon_riha_kasan.pdf",
    categories: [],
    documents: [],
    defaultPoints: 50,
  },
];

// =============================================================================
// ユーティリティ関数
// =============================================================================

/**
 * 日付をYYYY-MM-DD形式にフォーマット
 * @param {Date} date
 * @returns {string}
 */
const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/**
 * 時刻をHH:MM:SS形式にフォーマット
 * @param {Date} date
 * @returns {string}
 */
const formatTime = (date) => {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
};

/**
 * 秒数をMM:SS形式にフォーマット
 * @param {number} seconds
 * @returns {string}
 */
const formatDuration = (seconds) => {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
};

/**
 * カレンダーの日付配列を生成
 * @param {number} year
 * @param {number} month
 * @returns {Array<{date: Date, isCurrentMonth: boolean}>}
 */
const generateCalendarDays = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const days = [];

  // 前月の日付
  for (let i = startDay - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    days.push({ date, isCurrentMonth: false });
  }

  // 当月の日付
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i);
    days.push({ date, isCurrentMonth: true });
  }

  // 次月の日付（6週間分に揃える）
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(year, month + 1, i);
    days.push({ date, isCurrentMonth: false });
  }

  return days;
};

// =============================================================================
// カスタムフック
// =============================================================================

/**
 * 施設管理用カスタムフック
 */
const useFacilityManager = () => {
  const [facilities, setFacilities] = useState(INITIAL_FACILITIES);
  const [isLoading, setIsLoading] = useState(false);

  const addFacility = useCallback((facility) => {
    setIsLoading(true);
    setTimeout(() => {
      setFacilities((prev) => [
        ...prev,
        { ...facility, id: Math.max(...prev.map((f) => f.id)) + 1 },
      ]);
      setIsLoading(false);
    }, 300);
  }, []);

  const updateFacility = useCallback((id, data) => {
    setFacilities((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...data } : f))
    );
  }, []);

  const deleteFacility = useCallback((id) => {
    setFacilities((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return { facilities, isLoading, addFacility, updateFacility, deleteFacility };
};

/**
 * 利用者管理用カスタムフック
 */
const usePatientManager = () => {
  const [patients, setPatients] = useState(INITIAL_PATIENTS);

  const getPatientsByFacility = useCallback(
    (facilityId) => patients.filter((p) => p.facilityId === facilityId),
    [patients]
  );

  const addPatient = useCallback((patient) => {
    setPatients((prev) => [
      ...prev,
      { ...patient, id: Math.max(...prev.map((p) => p.id)) + 1 },
    ]);
  }, []);

  const updatePatient = useCallback((id, data) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    );
  }, []);

  const deletePatient = useCallback((id) => {
    setPatients((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { patients, getPatientsByFacility, addPatient, updatePatient, deletePatient };
};

/**
 * 訪問計画管理用カスタムフック
 */
const useVisitPlanManager = () => {
  const [visitPlans, setVisitPlans] = useState(INITIAL_VISIT_PLANS);

  const addVisitPlan = useCallback((plan) => {
    setVisitPlans((prev) => [
      ...prev,
      { ...plan, id: Math.max(0, ...prev.map((p) => p.id)) + 1, status: "scheduled" },
    ]);
  }, []);

  const deleteVisitPlan = useCallback((id) => {
    setVisitPlans((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { visitPlans, addVisitPlan, deleteVisitPlan };
};

/**
 * 診察管理用カスタムフック
 */
const useExaminationManager = () => {
  const [examinations, setExaminations] = useState(INITIAL_EXAMINATIONS);

  const getExaminationsByVisitPlan = useCallback(
    (visitPlanId) =>
      examinations
        .filter((e) => e.visitPlanId === visitPlanId)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [examinations]
  );

  const addExamination = useCallback((examination) => {
    setExaminations((prev) => {
      const maxId = Math.max(0, ...prev.map((e) => e.id));
      const maxSortOrder = Math.max(
        0,
        ...prev.filter((e) => e.visitPlanId === examination.visitPlanId).map((e) => e.sortOrder)
      );
      return [
        ...prev,
        {
          ...examination,
          id: maxId + 1,
          sortOrder: maxSortOrder + 1,
          status: EXAMINATION_STATUS.WAITING,
          vitalBefore: null,
          vitalAfter: null,
          treatmentItems: [],
          procedureItems: {},
          visitCondition: "",
          oralFindings: "",
          treatment: "",
          nextPlan: "",
          drStartTime: null,
          drEndTime: null,
          dhStartTime: null,
          dhEndTime: null,
        },
      ];
    });
  }, []);

  const updateExamination = useCallback((id, data) => {
    setExaminations((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...data } : e))
    );
  }, []);

  const removeExamination = useCallback((id) => {
    setExaminations((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const reorderExaminations = useCallback((visitPlanId, orderedIds) => {
    setExaminations((prev) =>
      prev.map((e) => {
        if (e.visitPlanId !== visitPlanId) return e;
        const newOrder = orderedIds.indexOf(e.id);
        return newOrder >= 0 ? { ...e, sortOrder: newOrder + 1 } : e;
      })
    );
  }, []);

  return {
    examinations,
    getExaminationsByVisitPlan,
    addExamination,
    updateExamination,
    removeExamination,
    reorderExaminations,
  };
};

// =============================================================================
// 共通UIコンポーネント
// =============================================================================

/**
 * ボタンコンポーネント
 */
const Button = ({ children, onClick, variant = "primary", size = "md", disabled = false, className = "" }) => {
  const baseStyle = "font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    outline: "border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
  };
  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </button>
  );
};

/**
 * バッジコンポーネント
 */
const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    primary: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

/**
 * カードコンポーネント
 */
const Card = ({ children, className = "", ...props }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`} {...props}>
    {children}
  </div>
);

/**
 * 入力フィールドコンポーネント
 */
const Input = ({ label, value, onChange, type = "text", placeholder = "", required = false, className = "" }) => (
  <div className={className}>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
);

/**
 * セレクトコンポーネント
 */
const Select = ({ label, value, onChange, options, placeholder = "選択してください", className = "" }) => (
  <div className={className}>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

/**
 * テキストエリアコンポーネント
 */
const TextArea = ({ label, value, onChange, placeholder = "", rows = 3, className = "" }) => (
  <div className={className}>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
    />
  </div>
);

/**
 * ローディングスピナー
 */
const Spinner = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
  </div>
);

/**
 * 空状態表示
 */
const EmptyState = ({ message = "データがありません" }) => (
  <div className="text-center py-8 text-gray-500">
    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
    <p className="mt-2 text-sm">{message}</p>
  </div>
);

// =============================================================================
// アイコンコンポーネント
// =============================================================================

const IconEdit = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const IconTrash = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const IconPlus = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const IconChevronLeft = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const IconChevronRight = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const IconMic = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

const IconCheck = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const IconUsers = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const IconBuilding = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

// =============================================================================
// 画面コンポーネント
// =============================================================================

/**
 * サイドバーナビゲーション
 */
const Sidebar = ({ currentPage, onNavigate }) => {
  const navItems = [
    { id: "schedule", label: "訪問計画スケジュール", icon: "📅" },
    { id: "admin-facilities", label: "施設マスタ", icon: "🏢" },
    { id: "admin-patients", label: "利用者マスタ", icon: "👥" },
    { id: "admin-staff", label: "スタッフマスタ", icon: "👨‍⚕️" },
    { id: "summary", label: "日次報告", icon: "📊" },
  ];

  return (
    <aside className="w-56 bg-gray-50 border-r border-gray-200 min-h-screen">
      <div className="p-3">
        <h1 className="text-lg font-bold text-blue-600 flex items-center gap-2">
          <span>🦷</span>
          <span>VisitDental Pro</span>
        </h1>
      </div>
      <nav className="mt-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
              currentPage === item.id || currentPage.startsWith(item.id)
                ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

/**
 * 施設フォーム（モーダル用）
 */
const FacilityForm = ({ facility, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: facility?.name || "",
    address: facility?.address || "",
    facilityType: facility?.facilityType || "",
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.address) return;
    onSubmit(formData);
  };

  return (
    <div className="space-y-3">
      <Input
        label="施設名"
        value={formData.name}
        onChange={(v) => setFormData({ ...formData, name: v })}
        required
      />
      <Input
        label="住所"
        value={formData.address}
        onChange={(v) => setFormData({ ...formData, address: v })}
        required
      />
      <Select
        label="施設区分"
        value={formData.facilityType}
        onChange={(v) => setFormData({ ...formData, facilityType: v })}
        options={Object.entries(FACILITY_TYPES).map(([value, label]) => ({ value, label }))}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onClose}>
          キャンセル
        </Button>
        <Button onClick={handleSubmit}>{facility ? "更新" : "追加"}</Button>
      </div>
    </div>
  );
};

/**
 * 施設マスタ画面
 */
const FacilityMasterPage = ({ facilities, onAdd, onUpdate, onDelete }) => {
  const facilityModal = useModal();

  const handleOpenAdd = () => {
    facilityModal.handleOpen({ facility: null });
  };

  const handleOpenEdit = (facility) => {
    facilityModal.handleOpen({ facility });
  };

  const handleSubmit = (formData) => {
    if (facilityModal.open?.facility) {
      onUpdate(facilityModal.open.facility.id, formData);
    } else {
      onAdd(formData);
    }
    facilityModal.handleClose();
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">登録施設一覧</h2>
        <Button onClick={handleOpenAdd}>
          <span className="flex items-center gap-1">
            <IconPlus />
            施設追加
          </span>
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">施設名</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">住所</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">施設区分</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {facilities.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <EmptyState message="施設が登録されていません" />
                  </td>
                </tr>
              ) : (
                facilities.map((facility) => (
                  <tr key={facility.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{facility.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{facility.address}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {FACILITY_TYPES[facility.facilityType] || "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(facility)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <IconEdit />
                        </button>
                        <button
                          onClick={() => onDelete(facility.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <facilityModal.Modal title={facilityModal.open?.facility ? "施設を編集" : "施設を追加"}>
        <FacilityForm
          facility={facilityModal.open?.facility}
          onSubmit={handleSubmit}
          onClose={facilityModal.handleClose}
        />
      </facilityModal.Modal>
    </div>
  );
};

/**
 * 利用者フォーム（モーダル用）
 */
const PatientForm = ({ patient, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: patient?.name || "",
    nameKana: patient?.nameKana || "",
    building: patient?.building || "",
    floor: patient?.floor || "",
    room: patient?.room || "",
    notes: patient?.notes || "",
  });

  const handleSubmit = () => {
    if (!formData.name) return;
    onSubmit(formData);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="氏名"
          value={formData.name}
          onChange={(v) => setFormData({ ...formData, name: v })}
          required
        />
        <Input
          label="ふりがな"
          value={formData.nameKana}
          onChange={(v) => setFormData({ ...formData, nameKana: v })}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Input
          label="建物"
          value={formData.building}
          onChange={(v) => setFormData({ ...formData, building: v })}
          placeholder="本館"
        />
        <Input
          label="フロア"
          value={formData.floor}
          onChange={(v) => setFormData({ ...formData, floor: v })}
          placeholder="2F"
        />
        <Input
          label="部屋番号"
          value={formData.room}
          onChange={(v) => setFormData({ ...formData, room: v })}
          placeholder="201"
        />
      </div>
      <TextArea
        label="申し送り"
        value={formData.notes}
        onChange={(v) => setFormData({ ...formData, notes: v })}
        placeholder="特記事項があれば入力"
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onClose}>
          キャンセル
        </Button>
        <Button onClick={handleSubmit}>{patient ? "更新" : "追加"}</Button>
      </div>
    </div>
  );
};

/**
 * 利用者マスタ画面
 */
const PatientMasterPage = ({ facilities, patients, onAdd, onUpdate, onDelete }) => {
  const [selectedFacilityId, setSelectedFacilityId] = useState(facilities[0]?.id || "");
  const patientModal = useModal();

  const filteredPatients = useMemo(
    () => patients.filter((p) => p.facilityId === Number(selectedFacilityId)),
    [patients, selectedFacilityId]
  );

  const handleOpenAdd = () => {
    patientModal.handleOpen({ patient: null });
  };

  const handleOpenEdit = (patient) => {
    patientModal.handleOpen({ patient });
  };

  const handleSubmit = (formData) => {
    if (patientModal.open?.patient) {
      onUpdate(patientModal.open.patient.id, formData);
    } else {
      onAdd({ ...formData, facilityId: Number(selectedFacilityId) });
    }
    patientModal.handleClose();
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900">利用者マスタ</h2>
          <Select
            value={selectedFacilityId}
            onChange={setSelectedFacilityId}
            options={facilities.map((f) => ({ value: f.id, label: f.name }))}
            placeholder="施設を選択"
          />
        </div>
        <Button onClick={handleOpenAdd} disabled={!selectedFacilityId}>
          <span className="flex items-center gap-1">
            <IconPlus />
            利用者追加
          </span>
        </Button>
      </div>

      <Card>
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">
            利用者マスタ ({filteredPatients.length}名)
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">氏名</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">居場所</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">申し送り</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <EmptyState message="利用者が登録されていません" />
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                        <div className="text-xs text-gray-500">{patient.nameKana}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1">
                        <Badge variant="primary">{patient.building}</Badge>
                        <span className="text-sm text-gray-600">{patient.floor}-{patient.room}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                      {patient.notes || "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(patient)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <IconEdit />
                        </button>
                        <button
                          onClick={() => onDelete(patient.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <patientModal.Modal title={patientModal.open?.patient ? "利用者を編集" : "利用者を追加"}>
        <PatientForm
          patient={patientModal.open?.patient}
          onSubmit={handleSubmit}
          onClose={patientModal.handleClose}
        />
      </patientModal.Modal>
    </div>
  );
};

/**
 * スタッフフォーム（モーダル用）
 */
const StaffForm = ({ staffMember, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: staffMember?.name || "",
    role: staffMember?.role || "",
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.role) return;
    onSubmit(formData);
  };

  return (
    <div className="space-y-3">
      <Input
        label="氏名"
        value={formData.name}
        onChange={(v) => setFormData({ ...formData, name: v })}
        required
      />
      <Select
        label="役割"
        value={formData.role}
        onChange={(v) => setFormData({ ...formData, role: v })}
        options={[
          { value: STAFF_ROLES.DOCTOR, label: "歯科医師" },
          { value: STAFF_ROLES.HYGIENIST, label: "歯科衛生士" },
        ]}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onClose}>
          キャンセル
        </Button>
        <Button onClick={handleSubmit}>{staffMember ? "更新" : "追加"}</Button>
      </div>
    </div>
  );
};

/**
 * スタッフマスタ画面
 */
const StaffMasterPage = () => {
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const staffModal = useModal();

  const handleOpenAdd = () => {
    staffModal.handleOpen({ staffMember: null });
  };

  const handleOpenEdit = (s) => {
    staffModal.handleOpen({ staffMember: s });
  };

  const handleSubmit = (formData) => {
    if (staffModal.open?.staffMember) {
      setStaff((prev) =>
        prev.map((s) => (s.id === staffModal.open.staffMember.id ? { ...s, ...formData } : s))
      );
    } else {
      setStaff((prev) => [...prev, { ...formData, id: Math.max(...prev.map((s) => s.id)) + 1 }]);
    }
    staffModal.handleClose();
  };

  const handleDelete = (id) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
  };

  const doctors = staff.filter((s) => s.role === STAFF_ROLES.DOCTOR);
  const hygienists = staff.filter((s) => s.role === STAFF_ROLES.HYGIENIST);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">スタッフマスタ</h2>
        <Button onClick={handleOpenAdd}>
          <span className="flex items-center gap-1">
            <IconPlus />
            スタッフ追加
          </span>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <span className="text-sm font-medium text-gray-700">歯科医師 ({doctors.length}名)</span>
          </div>
          <ul className="divide-y divide-gray-200">
            {doctors.map((s) => (
              <li key={s.id} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium text-gray-900">{s.name}</span>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenEdit(s)} className="p-1 text-gray-400 hover:text-blue-600">
                    <IconEdit />
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="p-1 text-gray-400 hover:text-red-600">
                    <IconTrash />
                  </button>
                </div>
              </li>
            ))}
            {doctors.length === 0 && <li className="px-4 py-3 text-sm text-gray-500">登録なし</li>}
          </ul>
        </Card>

        <Card>
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <span className="text-sm font-medium text-gray-700">歯科衛生士 ({hygienists.length}名)</span>
          </div>
          <ul className="divide-y divide-gray-200">
            {hygienists.map((s) => (
              <li key={s.id} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium text-gray-900">{s.name}</span>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenEdit(s)} className="p-1 text-gray-400 hover:text-blue-600">
                    <IconEdit />
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="p-1 text-gray-400 hover:text-red-600">
                    <IconTrash />
                  </button>
                </div>
              </li>
            ))}
            {hygienists.length === 0 && <li className="px-4 py-3 text-sm text-gray-500">登録なし</li>}
          </ul>
        </Card>
      </div>

      <staffModal.Modal title={staffModal.open?.staffMember ? "スタッフを編集" : "スタッフを追加"}>
        <StaffForm
          staffMember={staffModal.open?.staffMember}
          onSubmit={handleSubmit}
          onClose={staffModal.handleClose}
        />
      </staffModal.Modal>
    </div>
  );
};

/**
 * 訪問計画フォーム（モーダル用）
 */
const VisitPlanForm = ({ facilities, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    visitDate: "",
    facilityId: "",
  });

  const handleSubmit = () => {
    if (!formData.visitDate || !formData.facilityId) return;
    onSubmit({ visitDate: formData.visitDate, facilityId: Number(formData.facilityId) });
  };

  return (
    <div className="space-y-3">
      <Input
        label="訪問日"
        type="date"
        value={formData.visitDate}
        onChange={(v) => setFormData({ ...formData, visitDate: v })}
        required
      />
      <Select
        label="施設"
        value={formData.facilityId}
        onChange={(v) => setFormData({ ...formData, facilityId: v })}
        options={facilities.map((f) => ({ value: f.id, label: f.name }))}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onClose}>
          キャンセル
        </Button>
        <Button onClick={handleSubmit}>作成</Button>
      </div>
    </div>
  );
};

/**
 * 訪問計画スケジュール（カレンダー）画面
 */
const SchedulePage = ({ facilities, visitPlans, onAddPlan, onSelectPlan }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [selectedFacilityId, setSelectedFacilityId] = useState("");
  const visitPlanModal = useModal();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const calendarDays = useMemo(() => generateCalendarDays(year, month), [year, month]);

  const filteredPlans = useMemo(() => {
    if (!selectedFacilityId) return visitPlans;
    return visitPlans.filter((p) => p.facilityId === Number(selectedFacilityId));
  }, [visitPlans, selectedFacilityId]);

  const getPlansByDate = useCallback(
    (date) => {
      const dateStr = formatDate(date);
      return filteredPlans.filter((p) => p.visitDate === dateStr);
    },
    [filteredPlans]
  );

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleAddPlan = (formData) => {
    onAddPlan(formData);
    visitPlanModal.handleClose();
  };

  const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => onSelectPlan(null)} className="text-gray-400 hover:text-gray-600">
            <IconChevronLeft />
          </button>
          <h2 className="text-xl font-bold text-gray-900">訪問計画スケジュール</h2>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={selectedFacilityId}
            onChange={setSelectedFacilityId}
            options={facilities.map((f) => ({ value: f.id, label: f.name }))}
            placeholder="全ての施設"
          />
          <Button onClick={() => visitPlanModal.handleOpen()}>
            <span className="flex items-center gap-1">
              <IconPlus />
              新規作成
            </span>
          </Button>
        </div>
      </div>

      <Card className="p-4">
        {/* カレンダーヘッダー */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded">
            <IconChevronLeft />
          </button>
          <h3 className="text-lg font-semibold text-gray-900">
            {year}年 {month + 1}月
          </h3>
          <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded">
            <IconChevronRight />
          </button>
        </div>

        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 mb-1">
          {weekDays.map((day, i) => (
            <div
              key={day}
              className={`text-center text-xs font-medium py-1 ${
                i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-500"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* カレンダー本体 */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200">
          {calendarDays.map((dayInfo, index) => {
            const plans = getPlansByDate(dayInfo.date);
            const dayOfWeek = dayInfo.date.getDay();
            return (
              <div
                key={index}
                className={`bg-white min-h-[80px] p-1 ${!dayInfo.isCurrentMonth ? "bg-gray-50" : ""}`}
              >
                <div
                  className={`text-xs font-medium mb-1 ${
                    !dayInfo.isCurrentMonth
                      ? "text-gray-400"
                      : dayOfWeek === 0
                      ? "text-red-500"
                      : dayOfWeek === 6
                      ? "text-blue-500"
                      : "text-gray-900"
                  }`}
                >
                  {dayInfo.date.getDate()}
                </div>
                <div className="space-y-0.5">
                  {plans.map((plan) => {
                    const facility = facilities.find((f) => f.id === plan.facilityId);
                    return (
                      <button
                        key={plan.id}
                        onClick={() => onSelectPlan(plan)}
                        className="w-full text-left px-1 py-0.5 text-xs bg-blue-50 text-blue-700 rounded truncate hover:bg-blue-100"
                      >
                        {facility?.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <visitPlanModal.Modal title="新規訪問計画">
        <VisitPlanForm
          facilities={facilities}
          onSubmit={handleAddPlan}
          onClose={visitPlanModal.handleClose}
        />
      </visitPlanModal.Modal>
    </div>
  );
};

/**
 * ドラッグハンドルアイコン
 */
const IconDragHandle = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
  </svg>
);

/**
 * 訪問計画詳細（並び替え・診察前設定）画面
 */
const VisitPlanDetailPage = ({
  visitPlan,
  facility,
  patients,
  examinations,
  staff,
  onBack,
  onAddExamination,
  onUpdateExamination,
  onRemoveExamination,
  onReorderExaminations,
  onStartConsultation,
}) => {
  const [draggedPatientId, setDraggedPatientId] = useState(null);
  const [draggedExamId, setDraggedExamId] = useState(null);
  const [dragOverExamId, setDragOverExamId] = useState(null);
  const [isDragOverDropZone, setIsDragOverDropZone] = useState(false);

  // 施設の利用者を取得
  const facilityPatients = useMemo(
    () => patients.filter((p) => p.facilityId === facility.id),
    [patients, facility.id]
  );

  // 既に診察リストに追加済みの患者ID
  const addedPatientIds = useMemo(
    () => examinations.map((e) => e.patientId),
    [examinations]
  );

  // 建物×フロアでグループ化
  const groupedPatients = useMemo(() => {
    const groups = {};
    facilityPatients.forEach((p) => {
      const key = `${p.building} - ${p.floor}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });
    return groups;
  }, [facilityPatients]);

  // 患者ドラッグ開始（左カラムから）
  const handlePatientDragStart = (e, patientId) => {
    setDraggedPatientId(patientId);
    e.dataTransfer.effectAllowed = "copy";
  };

  // 診察リストへのドロップ（新規追加）
  const handleDropToList = (e) => {
    e.preventDefault();
    setIsDragOverDropZone(false);
    if (draggedPatientId && !addedPatientIds.includes(draggedPatientId)) {
      onAddExamination({ visitPlanId: visitPlan.id, patientId: draggedPatientId });
    }
    setDraggedPatientId(null);
  };

  // 診察項目のドラッグ開始（並び替え用）
  const handleExamDragStart = (e, examId) => {
    setDraggedExamId(examId);
    e.dataTransfer.effectAllowed = "move";
  };

  // 診察項目へのドラッグオーバー
  const handleExamDragOver = (e, examId) => {
    e.preventDefault();
    if (draggedExamId && draggedExamId !== examId) {
      setDragOverExamId(examId);
    }
  };

  // 診察項目へのドロップ（並び替え）
  const handleExamDrop = (e, targetExamId) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedExamId && draggedExamId !== targetExamId) {
      // 現在の順序を取得
      const currentOrder = examinations.map((ex) => ex.id);
      const draggedIndex = currentOrder.indexOf(draggedExamId);
      const targetIndex = currentOrder.indexOf(targetExamId);

      // 順序を入れ替え
      const newOrder = [...currentOrder];
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedExamId);

      onReorderExaminations(visitPlan.id, newOrder);
    }

    setDraggedExamId(null);
    setDragOverExamId(null);
  };

  // ドラッグ終了
  const handleDragEnd = () => {
    setDraggedPatientId(null);
    setDraggedExamId(null);
    setDragOverExamId(null);
    setIsDragOverDropZone(false);
  };

  const handleAddPatient = (patientId) => {
    if (!addedPatientIds.includes(patientId)) {
      onAddExamination({ visitPlanId: visitPlan.id, patientId });
    }
  };

  const doctors = staff.filter((s) => s.role === STAFF_ROLES.DOCTOR);
  const hygienists = staff.filter((s) => s.role === STAFF_ROLES.HYGIENIST);

  return (
    <div className="p-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="text-gray-400 hover:text-gray-600">
            <IconChevronLeft />
          </button>
          <div>
            <div className="text-xs text-gray-500">{visitPlan.visitDate}</div>
            <h2 className="text-xl font-bold text-gray-900">{facility.name}</h2>
          </div>
        </div>
        <Button variant="success">
          <span className="flex items-center gap-1">
            <IconCheck />
            訪問全体を終了する
          </span>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* 左カラム: 施設登録患者リスト */}
        <Card>
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <IconUsers />
              <span className="text-sm font-medium text-gray-700">施設登録患者リスト</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">右のリストへドラッグ&ドロップして計画を作成</p>
          </div>
          <div className="p-2 max-h-[500px] overflow-y-auto">
            {Object.entries(groupedPatients).map(([groupKey, groupPatients]) => (
              <div key={groupKey} className="mb-3">
                <div className="text-xs font-medium text-gray-500 px-2 py-1 bg-gray-50 rounded">
                  {groupKey}
                </div>
                <ul className="mt-1 space-y-1">
                  {groupPatients.map((patient) => {
                    const isAdded = addedPatientIds.includes(patient.id);
                    return (
                      <li
                        key={patient.id}
                        draggable={!isAdded}
                        onDragStart={(e) => handlePatientDragStart(e, patient.id)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center justify-between px-2 py-2 rounded border transition-all ${
                          isAdded
                            ? "bg-green-50 border-green-200"
                            : draggedPatientId === patient.id
                            ? "bg-blue-100 border-blue-400 opacity-50"
                            : "bg-white border-gray-200 cursor-grab hover:border-blue-300 hover:shadow-sm"
                        }`}
                      >
                        <div>
                          <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                          <div className="text-xs text-gray-500">{patient.room}号室</div>
                        </div>
                        {isAdded ? (
                          <span className="text-green-600">
                            <IconCheck />
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAddPatient(patient.id)}
                            className="text-gray-400 hover:text-blue-600 p-1"
                          >
                            <IconPlus />
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        {/* 右カラム: 本日の訪問・診察リスト */}
        <Card
          onDragOver={(e) => {
            e.preventDefault();
            if (draggedPatientId) setIsDragOverDropZone(true);
          }}
          onDragLeave={() => setIsDragOverDropZone(false)}
          onDrop={handleDropToList}
          className={`transition-all ${isDragOverDropZone ? "ring-2 ring-blue-400 bg-blue-50" : ""}`}
        >
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <IconBuilding />
              <span className="text-sm font-medium text-gray-700">
                本日の訪問・診察リスト ({examinations.length}名)
              </span>
            </div>
          </div>
          <div className="p-2 max-h-[500px] overflow-y-auto">
            {examinations.length === 0 ? (
              <div className={`text-center py-8 border-2 border-dashed rounded-lg ${
                isDragOverDropZone ? "border-blue-400 bg-blue-50" : "border-gray-300"
              }`}>
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">患者をドラッグ&ドロップで追加</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {examinations.map((exam, index) => {
                  const patient = patients.find((p) => p.id === exam.patientId);
                  if (!patient) return null;
                  const isDragging = draggedExamId === exam.id;
                  const isDragOver = dragOverExamId === exam.id;

                  return (
                    <li
                      key={exam.id}
                      draggable
                      onDragStart={(e) => handleExamDragStart(e, exam.id)}
                      onDragOver={(e) => handleExamDragOver(e, exam.id)}
                      onDrop={(e) => handleExamDrop(e, exam.id)}
                      onDragEnd={handleDragEnd}
                      className={`p-3 border rounded-lg transition-all ${
                        isDragging
                          ? "border-blue-400 bg-blue-50 opacity-50"
                          : isDragOver
                          ? "border-blue-500 bg-blue-100 shadow-lg transform scale-[1.02]"
                          : "border-gray-200 bg-white hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {/* ドラッグハンドル */}
                          <span className="cursor-grab text-gray-400 hover:text-gray-600">
                            <IconDragHandle />
                          </span>
                          <Badge variant="primary">{patient.building}</Badge>
                          <span className="text-xs text-gray-600">
                            {patient.floor} - {patient.room}
                          </span>
                          <Badge variant="default">未診察</Badge>
                        </div>
                        <button
                          onClick={() => onRemoveExamination(exam.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          ×
                        </button>
                      </div>
                      <div className="text-sm font-semibold text-gray-900 mb-1">{patient.name}</div>
                      {patient.notes && (
                        <div className="text-xs text-orange-600 mb-2">
                          ⚠ {patient.notes}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">担当医:</div>
                          <div className="flex items-center gap-1">
                            <select
                              value={exam.doctorId || ""}
                              onChange={(e) =>
                                onUpdateExamination(exam.id, {
                                  doctorId: e.target.value ? Number(e.target.value) : null,
                                })
                              }
                              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                            >
                              <option value="">未選択</option>
                              {doctors.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d.name}
                                </option>
                              ))}
                            </select>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onStartConsultation(exam.id, "doctor")}
                              disabled={!exam.doctorId}
                            >
                              診察(医)
                            </Button>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">担当DH:</div>
                          <div className="flex items-center gap-1">
                            <select
                              value={exam.hygienistId || ""}
                              onChange={(e) =>
                                onUpdateExamination(exam.id, {
                                  hygienistId: e.target.value ? Number(e.target.value) : null,
                                })
                              }
                              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                            >
                              <option value="">未選択</option>
                              {hygienists.map((h) => (
                                <option key={h.id} value={h.id}>
                                  {h.name}
                                </option>
                              ))}
                            </select>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onStartConsultation(exam.id, "hygienist")}
                              disabled={!exam.hygienistId}
                            >
                              指導(衛)
                            </Button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

/** バイタルデータの初期値 */
const INITIAL_VITAL = {
  bloodPressureHigh: "",
  bloodPressureLow: "",
  pulse: "",
  spo2: "",
  temperature: "",
  measuredAt: "",
};

/**
 * バイタル入力フォーム（モーダル用）
 */
const VitalForm = ({ vital, type, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    bloodPressureHigh: vital?.bloodPressureHigh || "",
    bloodPressureLow: vital?.bloodPressureLow || "",
    pulse: vital?.pulse || "",
    spo2: vital?.spo2 || "",
    temperature: vital?.temperature || "",
    measuredAt: vital?.measuredAt || new Date().toTimeString().slice(0, 5),
  });

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <div className="space-y-4">
      {/* 血圧と脈拍 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">血圧 (上/下)</label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={formData.bloodPressureHigh}
              onChange={(e) => setFormData({ ...formData, bloodPressureHigh: e.target.value })}
              placeholder="120"
              className="w-20 px-2 py-2 border border-gray-300 rounded-md text-sm text-center"
            />
            <span className="text-gray-500">/</span>
            <input
              type="number"
              value={formData.bloodPressureLow}
              onChange={(e) => setFormData({ ...formData, bloodPressureLow: e.target.value })}
              placeholder="80"
              className="w-20 px-2 py-2 border border-gray-300 rounded-md text-sm text-center"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">脈拍 (bpm)</label>
          <input
            type="number"
            value={formData.pulse}
            onChange={(e) => setFormData({ ...formData, pulse: e.target.value })}
            placeholder="72"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>

      {/* SpO2と体温 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SpO2 (%)</label>
          <input
            type="number"
            value={formData.spo2}
            onChange={(e) => setFormData({ ...formData, spo2: e.target.value })}
            placeholder="98"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">体温 (°C)</label>
          <input
            type="number"
            step="0.1"
            value={formData.temperature}
            onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
            placeholder="36.5"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>

      {/* 測定時刻 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">測定時刻</label>
        <input
          type="time"
          value={formData.measuredAt}
          onChange={(e) => setFormData({ ...formData, measuredAt: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onClose}>
          キャンセル
        </Button>
        <Button onClick={handleSubmit}>記録する</Button>
      </div>
    </div>
  );
};

/**
 * バイタル表示コンポーネント
 */
const VitalDisplay = ({ vital, label, onEdit }) => {
  const hasData = vital && (vital.bloodPressureHigh || vital.spo2 || vital.temperature);

  return (
    <div
      onClick={onEdit}
      className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
    >
      <div className="text-xs text-gray-500 mb-2">{label}</div>
      {hasData ? (
        <div className="space-y-1 text-sm">
          {vital.bloodPressureHigh && (
            <div>血圧: {vital.bloodPressureHigh}/{vital.bloodPressureLow} mmHg</div>
          )}
          {vital.pulse && <div>脈拍: {vital.pulse} bpm</div>}
          {vital.spo2 && <div>SpO2: {vital.spo2}%</div>}
          {vital.temperature && <div>体温: {vital.temperature}°C</div>}
          {vital.measuredAt && <div className="text-gray-400 text-xs">測定: {vital.measuredAt}</div>}
        </div>
      ) : (
        <div className="text-gray-400 text-sm">未記録 (タップで入力)</div>
      )}
    </div>
  );
};

/**
 * 診療画面
 */
const ConsultationPage = ({ examination, patient, staff, onBack, onUpdate }) => {
  const [drSeconds, setDrSeconds] = useState(0);
  const [dhSeconds, setDhSeconds] = useState(0);
  const [drRunning, setDrRunning] = useState(false);
  const [dhRunning, setDhRunning] = useState(false);
  const [vitalBefore, setVitalBefore] = useState(examination.vitalBefore || INITIAL_VITAL);
  const [vitalAfter, setVitalAfter] = useState(examination.vitalAfter || INITIAL_VITAL);
  const [treatmentItems, setTreatmentItems] = useState(examination.treatmentItems || []);
  // procedureItems: { [itemId]: { categoryId: string | null } }
  const [procedureItems, setProcedureItems] = useState(examination.procedureItems || {});
  // 実施記録・所見の4項目
  const [visitCondition, setVisitCondition] = useState(examination.visitCondition || "");
  const [oralFindings, setOralFindings] = useState(examination.oralFindings || "");
  const [treatment, setTreatment] = useState(examination.treatment || "");
  const [nextPlan, setNextPlan] = useState(examination.nextPlan || "");
  const [customTreatment, setCustomTreatment] = useState("");
  const [customTreatments, setCustomTreatments] = useState([]);

  const vitalBeforeModal = useModal();
  const vitalAfterModal = useModal();

  const doctor = staff.find((s) => s.id === examination.doctorId);

  const handleToggleTreatment = (itemId) => {
    setTreatmentItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  // 実施項目のON/OFF切り替え
  const handleToggleProcedure = (itemId) => {
    setProcedureItems((prev) => {
      if (prev[itemId]) {
        // 選択解除
        const { [itemId]: _, ...rest } = prev;
        return rest;
      } else {
        // 選択（初期値はカテゴリなし、自動判定で設定）
        const item = PROCEDURE_ITEMS_MASTER.find((i) => i.id === itemId);
        const defaultCategoryId = item?.categories?.[0]?.id || null;
        return { ...prev, [itemId]: { categoryId: defaultCategoryId } };
      }
    });
  };

  // 該当区分の変更
  const handleSetProcedureCategory = (itemId, categoryId) => {
    setProcedureItems((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], categoryId },
    }));
  };

  // 自動判定（施設タイプや患者の居住状況から判定）
  const handleAutoJudge = (itemId) => {
    const item = PROCEDURE_ITEMS_MASTER.find((i) => i.id === itemId);
    if (!item || !item.categories?.length) return;

    // サンプル: 施設タイプに基づく判定（実際にはpatientやfacilityのデータを使用）
    let categoryId = item.categories[0].id;
    if (item.autoJudgeCondition === "facilityType") {
      // 仮: 施設なら2-9人カテゴリを選択
      categoryId = item.categories.length > 1 ? item.categories[1].id : item.categories[0].id;
    } else if (item.autoJudgeCondition === "patientResidence") {
      // 仮: 施設入居なら2番目のカテゴリ
      categoryId = item.categories.length > 1 ? item.categories[1].id : item.categories[0].id;
    }

    handleSetProcedureCategory(itemId, categoryId);
  };

  // 合計点数の計算
  const calculateTotalPoints = () => {
    let total = 0;
    Object.entries(procedureItems).forEach(([itemId, data]) => {
      const item = PROCEDURE_ITEMS_MASTER.find((i) => i.id === itemId);
      if (!item) return;

      if (item.categories?.length > 0 && data.categoryId) {
        const category = item.categories.find((c) => c.id === data.categoryId);
        total += category?.points || 0;
      } else {
        total += item.defaultPoints || 0;
      }
    });
    return total;
  };

  // 選択された項目の点数を取得
  const getItemPoints = (itemId) => {
    const item = PROCEDURE_ITEMS_MASTER.find((i) => i.id === itemId);
    const data = procedureItems[itemId];
    if (!item || !data) return 0;

    if (item.categories?.length > 0 && data.categoryId) {
      const category = item.categories.find((c) => c.id === data.categoryId);
      return category?.points || 0;
    }
    return item.defaultPoints || 0;
  };

  const handleAddCustomTreatment = () => {
    if (!customTreatment.trim()) return;
    setCustomTreatments((prev) => [...prev, customTreatment.trim()]);
    setCustomTreatment("");
  };

  const handleRemoveCustomTreatment = (index) => {
    setCustomTreatments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onUpdate(examination.id, {
      vitalBefore,
      vitalAfter,
      treatmentItems,
      procedureItems,
      visitCondition,
      oralFindings,
      treatment,
      nextPlan,
      status: EXAMINATION_STATUS.DONE,
    });
    onBack();
  };

  const is20MinOver = drSeconds >= 1200 || dhSeconds >= 1200;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-gray-400 hover:text-gray-600">
            <IconChevronLeft />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="primary">{patient.building}</Badge>
              <span className="text-xs text-gray-600">
                {patient.floor}-{patient.room}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{patient.name} 様</h2>
          </div>
        </div>
        <div className="text-right text-sm">
          <div className="text-gray-500">
            担当: <span className="font-medium text-gray-900">{doctor?.name || "-"}</span>
          </div>
          <div className="text-gray-500">
            モード: <span className="font-medium text-blue-600">歯科医師</span>
          </div>
        </div>
      </div>

      {/* タイマーセクション */}
      <Card className="mb-4 p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Badge variant={drRunning ? "success" : "default"}>DR</Badge>
            <span className={`text-2xl font-mono ${is20MinOver ? "text-red-600" : "text-gray-900"}`}>
              {formatDuration(drSeconds)}
            </span>
            <Button
              size="sm"
              variant={drRunning ? "danger" : "success"}
              onClick={() => setDrRunning(!drRunning)}
            >
              {drRunning ? "終了" : "開始"}
            </Button>
            {drRunning && drSeconds > 0 && (
              <span className="text-xs text-gray-500">計測中 {formatTime(new Date())}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={dhRunning ? "success" : "default"}>DH</Badge>
            <span className={`text-2xl font-mono ${is20MinOver ? "text-red-600" : "text-gray-900"}`}>
              {formatDuration(dhSeconds)}
            </span>
            <Button
              size="sm"
              variant={dhRunning ? "danger" : "success"}
              onClick={() => setDhRunning(!dhRunning)}
            >
              {dhRunning ? "終了" : "開始"}
            </Button>
          </div>
        </div>
        {is20MinOver && (
          <div className="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            ⚠ 20分を超過しています
          </div>
        )}
      </Card>

      {/* バイタル測定 */}
      <Card className="mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          <span className="text-red-500">♥</span>
          <span className="text-sm font-medium text-gray-700">バイタル測定</span>
        </div>
        <div className="p-4 grid grid-cols-2 gap-4">
          <VitalDisplay
            vital={vitalBefore}
            label="処置前"
            onEdit={() => vitalBeforeModal.handleOpen()}
          />
          <VitalDisplay
            vital={vitalAfter}
            label="処置後"
            onEdit={() => vitalAfterModal.handleOpen()}
          />
        </div>
      </Card>

      {/* バイタル入力モーダル */}
      <vitalBeforeModal.Modal title="処置前バイタル入力">
        <VitalForm
          vital={vitalBefore}
          type="before"
          onSubmit={(data) => {
            setVitalBefore(data);
            vitalBeforeModal.handleClose();
          }}
          onClose={vitalBeforeModal.handleClose}
        />
      </vitalBeforeModal.Modal>

      <vitalAfterModal.Modal title="処置後バイタル入力">
        <VitalForm
          vital={vitalAfter}
          type="after"
          onSubmit={(data) => {
            setVitalAfter(data);
            vitalAfterModal.handleClose();
          }}
          onClose={vitalAfterModal.handleClose}
        />
      </vitalAfterModal.Modal>

      {/* 本日の実施項目 */}
      <Card className="mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          <IconCheck />
          <span className="text-sm font-medium text-gray-700">本日の実施項目</span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            {TREATMENT_ITEMS_MASTER.map((item) => (
              <label
                key={item.id}
                className={`flex items-center gap-2 p-3 border rounded cursor-pointer transition-colors ${
                  treatmentItems.includes(item.id)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={treatmentItems.includes(item.id)}
                  onChange={() => handleToggleTreatment(item.id)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-900">{item.fullName}</span>
              </label>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="その他の処置を入力..."
              value={customTreatment}
              onChange={setCustomTreatment}
              className="flex-1"
            />
            <Button onClick={handleAddCustomTreatment}>追加</Button>
          </div>
          {customTreatments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {customTreatments.map((t, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm"
                >
                  {t}
                  <button
                    onClick={() => handleRemoveCustomTreatment(i)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* 実施記録・所見 */}
      <Card className="mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          <span className="text-blue-500">📋</span>
          <span className="text-sm font-medium text-gray-700">実施記録・所見</span>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <div className="text-xs text-gray-600 mb-1">1. 訪問時の様子</div>
            <TextArea
              value={visitCondition}
              onChange={setVisitCondition}
              placeholder="例: ベッド上臥位、覚醒良好..."
              rows={2}
            />
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">2. 口腔内所見</div>
            <TextArea
              value={oralFindings}
              onChange={setOralFindings}
              placeholder="例: 右下残根部発赤あり、PCR 40%..."
              rows={2}
            />
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">3. 処置</div>
            <TextArea
              value={treatment}
              onChange={setTreatment}
              placeholder="例: 義歯調整、口腔ケア、TBI..."
              rows={2}
            />
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">4. 次回予定</div>
            <TextArea
              value={nextPlan}
              onChange={setNextPlan}
              placeholder="例: 1週間後、義歯経過観察..."
              rows={2}
            />
          </div>
        </div>
      </Card>

      {/* 実施項目の選択（加算） */}
      <Card className="mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span className="text-sm font-medium text-gray-700">実施項目の選択（加算）</span>
          </div>
          <div className="text-sm font-bold text-blue-600">
            合計: {calculateTotalPoints().toLocaleString()} 点
          </div>
        </div>
        <div className="p-4 space-y-2">
          {PROCEDURE_ITEMS_MASTER.map((item) => {
            const isSelected = !!procedureItems[item.id];
            const itemData = procedureItems[item.id];
            const points = getItemPoints(item.id);

            return (
              <div key={item.id} className="border rounded-lg overflow-hidden">
                {/* ON/OFFボタン + 項目名 + インフォマーク */}
                <div
                  className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                    isSelected ? "bg-blue-50 border-blue-300" : "bg-white hover:bg-gray-50"
                  }`}
                  onClick={() => handleToggleProcedure(item.id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        isSelected ? "bg-blue-500" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          isSelected ? "translate-x-7" : "translate-x-1"
                        }`}
                      />
                    </div>
                    <span className={`font-medium ${isSelected ? "text-blue-700" : "text-gray-700"}`}>
                      {item.name}
                    </span>
                    {/* インフォマーク（PDF解説リンク） */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(item.infoUrl, "_blank");
                      }}
                      className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-blue-200 hover:text-blue-700 text-xs"
                      title="項目解説を表示"
                    >
                      i
                    </button>
                  </div>
                  {isSelected && points > 0 && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                      +{points}点
                    </span>
                  )}
                </div>

                {/* 選択時のみ表示: 該当区分・自動判定・提供文書 */}
                {isSelected && (
                  <div className="p-3 bg-blue-50 border-t border-blue-200 space-y-3">
                    {/* 該当区分（カテゴリがある場合のみ） */}
                    {item.categories?.length > 0 && (
                      <div>
                        <div className="text-xs text-gray-600 mb-2 flex items-center justify-between">
                          <span>該当区分</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAutoJudge(item.id)}
                          >
                            自動判定
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.categories.map((cat) => (
                            <label
                              key={cat.id}
                              className={`flex items-center gap-2 px-3 py-2 border rounded cursor-pointer transition-colors ${
                                itemData?.categoryId === cat.id
                                  ? "border-blue-500 bg-blue-100"
                                  : "border-gray-300 bg-white hover:border-gray-400"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`category-${item.id}`}
                                checked={itemData?.categoryId === cat.id}
                                onChange={() => handleSetProcedureCategory(item.id, cat.id)}
                                className="w-4 h-4 text-blue-600"
                              />
                              <span className="text-sm">{cat.name}</span>
                              <span className="text-xs text-gray-500">({cat.points}点)</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 必要な提供文書 */}
                    {item.documents?.length > 0 && (
                      <div>
                        <div className="text-xs text-gray-600 mb-2">必要な提供文書</div>
                        <div className="flex flex-wrap gap-2">
                          {item.documents.map((doc) => (
                            <Button
                              key={doc.id}
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // 提供文書ページへ遷移（利用者ID_診察ID_テンプレートID）
                                const url = `/dental/documents/${patient.id}_${examination.id}_${doc.id}`;
                                window.open(url, "_blank");
                              }}
                            >
                              📄 {doc.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* 保存ボタン */}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onBack}>
          キャンセル
        </Button>
        <Button variant="success" onClick={handleSave}>
          診察完了・保存
        </Button>
      </div>
    </div>
  );
};

/**
 * 日次報告（Summary）画面
 */
const SummaryPage = ({ visitPlans, examinations, patients, facilities }) => {
  const today = formatDate(new Date(2026, 0, 18));
  const todayPlans = visitPlans.filter((p) => p.visitDate === today);

  const completedExams = examinations.filter((e) => e.status === EXAMINATION_STATUS.DONE);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">日次報告</h2>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-sm text-gray-500">本日の訪問施設</div>
          <div className="text-2xl font-bold text-gray-900">{todayPlans.length} 件</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">診察完了患者数</div>
          <div className="text-2xl font-bold text-green-600">{completedExams.length} 名</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">概算算定点数</div>
          <div className="text-2xl font-bold text-blue-600">-- 点</div>
          <div className="text-xs text-gray-400">※ 実装予定</div>
        </Card>
      </div>

      <Card>
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">本日の診療一覧</span>
        </div>
        {completedExams.length === 0 ? (
          <EmptyState message="本日の診療記録はありません" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    患者名
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    施設
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    実施項目
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    ステータス
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {completedExams.map((exam) => {
                  const patient = patients.find((p) => p.id === exam.patientId);
                  const plan = visitPlans.find((p) => p.id === exam.visitPlanId);
                  const facility = facilities.find((f) => f.id === plan?.facilityId);
                  return (
                    <tr key={exam.id}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {patient?.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{facility?.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {exam.treatmentItems.length > 0
                          ? exam.treatmentItems
                              .map((id) => TREATMENT_ITEMS_MASTER.find((t) => t.id === id)?.name)
                              .join(", ")
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="success">完了</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

// =============================================================================
// メインアプリケーション
// =============================================================================

/**
 * 訪問歯科アプリ メインコンポーネント
 */
export default function DentalAppMock() {
  // ページ状態
  const [currentPage, setCurrentPage] = useState("schedule");
  const [selectedVisitPlan, setSelectedVisitPlan] = useState(null);
  const [selectedExamination, setSelectedExamination] = useState(null);
  const [consultationMode, setConsultationMode] = useState(null);

  // データ管理
  const { facilities, addFacility, updateFacility, deleteFacility } = useFacilityManager();
  const { patients, addPatient, updatePatient, deletePatient } = usePatientManager();
  const { visitPlans, addVisitPlan, deleteVisitPlan } = useVisitPlanManager();
  const {
    examinations,
    getExaminationsByVisitPlan,
    addExamination,
    updateExamination,
    removeExamination,
    reorderExaminations,
  } = useExaminationManager();

  // ナビゲーション
  const handleNavigate = (page) => {
    setCurrentPage(page);
    setSelectedVisitPlan(null);
    setSelectedExamination(null);
  };

  const handleSelectVisitPlan = (plan) => {
    setSelectedVisitPlan(plan);
    setCurrentPage("visit-detail");
  };

  const handleStartConsultation = (examinationId, mode) => {
    const exam = examinations.find((e) => e.id === examinationId);
    setSelectedExamination(exam);
    setConsultationMode(mode);
    setCurrentPage("consultation");
  };

  const handleBackFromConsultation = () => {
    setSelectedExamination(null);
    setConsultationMode(null);
    setCurrentPage("visit-detail");
  };

  // 現在の訪問計画に紐づく診察一覧
  const currentExaminations = selectedVisitPlan
    ? getExaminationsByVisitPlan(selectedVisitPlan.id)
    : [];

  // 現在の施設
  const currentFacility = selectedVisitPlan
    ? facilities.find((f) => f.id === selectedVisitPlan.facilityId)
    : null;

  // 現在の患者
  const currentPatient = selectedExamination
    ? patients.find((p) => p.id === selectedExamination.patientId)
    : null;

  // ページコンテンツのレンダリング
  const renderContent = () => {
    // 診療画面
    if (currentPage === "consultation" && selectedExamination && currentPatient) {
      return (
        <ConsultationPage
          examination={selectedExamination}
          patient={currentPatient}
          staff={INITIAL_STAFF}
          onBack={handleBackFromConsultation}
          onUpdate={updateExamination}
        />
      );
    }

    // 訪問計画詳細画面
    if (currentPage === "visit-detail" && selectedVisitPlan && currentFacility) {
      return (
        <VisitPlanDetailPage
          visitPlan={selectedVisitPlan}
          facility={currentFacility}
          patients={patients}
          examinations={currentExaminations}
          staff={INITIAL_STAFF}
          onBack={() => handleNavigate("schedule")}
          onAddExamination={addExamination}
          onUpdateExamination={updateExamination}
          onRemoveExamination={removeExamination}
          onReorderExaminations={reorderExaminations}
          onStartConsultation={handleStartConsultation}
        />
      );
    }

    // その他のページ
    switch (currentPage) {
      case "schedule":
        return (
          <SchedulePage
            facilities={facilities}
            visitPlans={visitPlans}
            onAddPlan={addVisitPlan}
            onSelectPlan={handleSelectVisitPlan}
          />
        );
      case "admin-facilities":
        return (
          <FacilityMasterPage
            facilities={facilities}
            onAdd={addFacility}
            onUpdate={updateFacility}
            onDelete={deleteFacility}
          />
        );
      case "admin-patients":
        return (
          <PatientMasterPage
            facilities={facilities}
            patients={patients}
            onAdd={addPatient}
            onUpdate={updatePatient}
            onDelete={deletePatient}
          />
        );
      case "admin-staff":
        return <StaffMasterPage />;
      case "summary":
        return (
          <SummaryPage
            visitPlans={visitPlans}
            examinations={examinations}
            patients={patients}
            facilities={facilities}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="flex-1 overflow-auto">{renderContent()}</main>
    </div>
  );
}
