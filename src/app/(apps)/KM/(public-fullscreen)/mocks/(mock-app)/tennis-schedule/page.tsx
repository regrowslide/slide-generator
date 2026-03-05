'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Calendar,
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
  Users,
  Clock,
  MessageCircle,
  HelpCircle,
  LogOut,
  Edit3,
  Trash2,
  ExternalLink,
  CircleDot,
  RotateCcw,
  Navigation,
  LayoutList,
} from 'lucide-react'
import useModal from '@cm/components/utils/modal/useModal'
import {
  SplashScreen,
  useInfoModal,
  GuidanceOverlay,
  GuidanceStartButton,
  MockHeader,
  MockHeaderTitle,
  MockHeaderTab,
  MockHeaderInfoButton,
  usePersistedState,
  generateId,
  resetPersistedData,
  type Feature,
  type TimeEfficiencyItem,
  type OverviewInfo,
  type OperationStep,
  type GuidanceStep,
} from '../../_components'

// ==========================================
// 型定義
// ==========================================

type TabId = 'home' | 'courts'
type HomeViewMode = 'list' | 'calendar'
type AttendanceStatus = '○' | '△' | '×'

interface Member {
  id: string
  name: string
  avatar: string
}

type CourtStatus = '予定' | '予約済み'

interface Court {
  id: string
  name: string
  address: string
  googleMapsUrl: string
  courtNumbers: string[] // コート番号ラベル（例: ["1","2","3"] や ["A","B","C"]）
}

interface EventCourt {
  courtId: string
  courtNumber: string // コート番号ラベル
  status: CourtStatus
}

interface Attendance {
  memberId: string
  status: AttendanceStatus
  comment: string
}

interface TennisEvent {
  id: string
  title: string
  date: string // YYYY-MM-DD
  startTime: string // HH:00
  endTime: string // HH:00
  courts: EventCourt[] // コート選択（場所・番号・ステータス）
  creatorId: string
  attendances: Attendance[]
  memo: string
  createdAt: string
}

// ==========================================
// 定数
// ==========================================

const THEME = 'emerald' as const

// 1時間単位の時刻選択肢
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const h = String(i).padStart(2, '0')
  return { value: `${h}:00`, label: `${h}:00` }
})

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-violet-500',
  'bg-teal-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-orange-500',
  'bg-cyan-500',
  'bg-emerald-500',
  'bg-red-500',
  'bg-sky-500',
  'bg-fuchsia-500',
  'bg-lime-500',
  'bg-yellow-500',
]

const INITIAL_MEMBERS: Member[] = [
  { id: 'm1', name: '田中太郎', avatar: AVATAR_COLORS[0] },
  { id: 'm2', name: '鈴木花子', avatar: AVATAR_COLORS[1] },
  { id: 'm3', name: '佐藤健一', avatar: AVATAR_COLORS[2] },
  { id: 'm4', name: '高橋美咲', avatar: AVATAR_COLORS[3] },
  { id: 'm5', name: '伊藤大輔', avatar: AVATAR_COLORS[4] },
  { id: 'm6', name: '渡辺さくら', avatar: AVATAR_COLORS[5] },
  { id: 'm7', name: '山本翔太', avatar: AVATAR_COLORS[6] },
  { id: 'm8', name: '中村あかり', avatar: AVATAR_COLORS[7] },
  { id: 'm9', name: '小林直樹', avatar: AVATAR_COLORS[8] },
  { id: 'm10', name: '加藤由美', avatar: AVATAR_COLORS[9] },
  { id: 'm11', name: '吉田拓也', avatar: AVATAR_COLORS[10] },
  { id: 'm12', name: '山田麻衣', avatar: AVATAR_COLORS[11] },
  { id: 'm13', name: '松本隆志', avatar: AVATAR_COLORS[12] },
  { id: 'm14', name: '井上真理', avatar: AVATAR_COLORS[13] },
  { id: 'm15', name: '木村浩二', avatar: AVATAR_COLORS[14] },
]

const INITIAL_COURTS: Court[] = [
  {
    id: 'c1',
    name: '県営コート',
    address: '岡山県岡山市北区いずみ町2-1',
    googleMapsUrl: 'https://maps.app.goo.gl/RJ5phkgyTeokPrXc6',
    courtNumbers: ['南1', '南2', '南3', '南4', '南5', '南6', '南7', '南8', '南9', '南10', '北11', '北12', '北13', '北14'],
  },
  {
    id: 'c2',
    name: 'ハチヤ',
    address: '岡山県岡山市北区富原1297',
    googleMapsUrl: 'https://maps.app.goo.gl/wNSdjp45PRAF8tiz9',
    courtNumbers: ['1', '2', '3', '4', '5'],
  },
]

const today = new Date()
const yyyy = today.getFullYear()
const mm = String(today.getMonth() + 1).padStart(2, '0')

const INITIAL_EVENTS: TennisEvent[] = [
  {
    id: 'e1',
    title: '定期練習会',
    date: `${yyyy}-${mm}-${String(Math.min(today.getDate() + 2, 28)).padStart(2, '0')}`,
    startTime: '09:00',
    endTime: '12:00',
    courts: [
      { courtId: 'c1', courtNumber: '南3', status: '予約済み' },
      { courtId: 'c1', courtNumber: '南4', status: '予約済み' },
    ],
    creatorId: 'm1',
    attendances: [
      { memberId: 'm1', status: '○', comment: '' },
      { memberId: 'm2', status: '○', comment: '楽しみ！' },
      { memberId: 'm3', status: '△', comment: '午前中は行けるかも' },
      { memberId: 'm5', status: '×', comment: '仕事です…' },
      { memberId: 'm7', status: '○', comment: '' },
      { memberId: 'm8', status: '○', comment: '' },
    ],
    memo: '初心者歓迎！ラケット貸し出しあり。',
    createdAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'e2',
    title: '週末ダブルス大会',
    date: `${yyyy}-${mm}-${String(Math.min(today.getDate() + 7, 28)).padStart(2, '0')}`,
    startTime: '13:00',
    endTime: '17:00',
    courts: [
      { courtId: 'c1', courtNumber: '北11', status: '予約済み' },
      { courtId: 'c1', courtNumber: '北12', status: '予定' },
      { courtId: 'c2', courtNumber: '3', status: '予定' },
    ],
    creatorId: 'm3',
    attendances: [
      { memberId: 'm3', status: '○', comment: '主催です！' },
      { memberId: 'm1', status: '○', comment: '' },
      { memberId: 'm4', status: '○', comment: '' },
      { memberId: 'm6', status: '△', comment: '午後遅めなら参加できます' },
      { memberId: 'm9', status: '○', comment: '' },
      { memberId: 'm10', status: '○', comment: '' },
      { memberId: 'm11', status: '×', comment: '出張中' },
    ],
    memo: 'ダブルスのペアは当日くじ引きで決定します。',
    createdAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'e3',
    title: '朝練',
    date: `${yyyy}-${mm}-${String(Math.min(today.getDate() + 14, 28)).padStart(2, '0')}`,
    startTime: '07:00',
    endTime: '09:00',
    courts: [{ courtId: 'c2', courtNumber: '1', status: '予約済み' }],
    creatorId: 'm5',
    attendances: [
      { memberId: 'm5', status: '○', comment: '' },
      { memberId: 'm2', status: '○', comment: '早起き頑張ります' },
    ],
    memo: '屋根付きなので雨でもOK！',
    createdAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

const STORAGE_KEYS = {
  loggedInUser: 'tennis-loggedInUser',
  events: 'tennis-events',
  courts: 'tennis-courts',
  activeTab: 'tennis-activeTab',
}

// ==========================================
// 機能説明データ
// ==========================================

const FEATURES: Feature[] = [
  {
    icon: Calendar,
    title: 'カレンダー管理',
    description: '月表示カレンダーで予定を一覧。日付をタップするだけで予定の詳細を確認できます。',
    benefit: '予定の見落としゼロに',
  },
  {
    icon: Users,
    title: 'ワンタップ参加可否',
    description: '○△×をワンタップで入力。コメントも添えられるので「遅れるけど参加」も伝わります。',
    benefit: 'LINE確認の手間を90%削減',
  },
  {
    icon: MapPin,
    title: 'コート場所リンク',
    description: 'コートの場所をタップするだけでGoogle Mapsが開きます。複数コートの予定にも対応。',
    benefit: '場所の問い合わせゼロに',
  },
  {
    icon: Plus,
    title: '誰でも予定作成',
    description: '管理者だけでなく全メンバーが予定を作成可能。急な募集もアプリからすぐに発信。',
    benefit: 'LINEスケジュール作成不要',
  },
]

const TIME_EFFICIENCY: TimeEfficiencyItem[] = [
  { task: 'LINEスケジュール作成・集計', before: '30分/回', after: '3分/回', saved: '27分/回' },
  { task: '参加可否の確認・催促', before: '随時チャット確認', after: 'アプリで即確認', saved: '1時間/月' },
  { task: 'コート場所の共有', before: '毎回LINE送信', after: 'タップで地図表示', saved: '手間ゼロ' },
  { task: '急な募集の周知', before: 'チャットが流れる', after: 'アプリに残る', saved: '見落とし防止' },
]

const CHALLENGES = [
  '毎月LINEスケジュールを立てるのが面倒',
  'チャットが流れて予定が追えなくなる',
  '急な募集がチャットに埋もれる',
  'コートの場所を毎回聞かれる',
]

const OVERVIEW: OverviewInfo = {
  description:
    'テニスサークルの予定管理に特化したカレンダーアプリ。メンバー全員がスケジュールを作成・参加可否を入力でき、LINEスケジュールの煩雑さを解消します。',
  automationPoints: [
    '予定作成→メンバーへの通知を自動化',
    '参加可否の集計を自動化',
    'コート場所のリンクを事前登録',
  ],
  userBenefits: [
    'LINEスケジュールの作成が不要に',
    '過去の予定・参加履歴も確認可能',
    '誰でも予定が立てられるので幹事の負担軽減',
  ],
}

const OPERATION_STEPS: OperationStep[] = [
  { step: 1, action: 'ログイン', detail: 'LINEアカウントでログイン' },
  { step: 2, action: '予定を確認', detail: 'カレンダーで今月の予定を確認' },
  { step: 3, action: '参加可否を入力', detail: '○△×をタップ＋コメント' },
  { step: 4, action: '予定を作成', detail: '日時・コートを選んで作成' },
]

const getGuidanceSteps = (): GuidanceStep[] => [
  {
    targetSelector: '[data-guidance="calendar"]',
    title: 'カレンダー',
    description: '月表示で予定のある日にドットが表示されます。日付タップで予定を確認。',
    position: 'bottom',
  },
  {
    targetSelector: '[data-guidance="event-list"]',
    title: '直近の予定',
    description: '直近の予定がカード形式で一覧表示。タップで詳細を確認。',
    position: 'top',
  },
  {
    targetSelector: '[data-guidance="add-event"]',
    title: '予定作成',
    description: '誰でも新しい予定を作成できます。日時とコートを選んで投稿。',
    position: 'top',
  },
  {
    targetSelector: '[data-guidance="tab-courts"]',
    title: 'コート管理',
    description: 'よく使うコートを事前登録。Google Mapsリンク付き。',
    position: 'bottom',
  },
]

// ==========================================
// ユーティリティ
// ==========================================

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr + 'T00:00:00')
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  return `${d.getMonth() + 1}/${d.getDate()}（${weekdays[d.getDay()]}）`
}

const formatDateFull = (dateStr: string) => {
  const d = new Date(dateStr + 'T00:00:00')
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${weekdays[d.getDay()]}）`
}

const generateCalendarDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startOffset = firstDay.getDay()
  const days: (number | null)[] = []
  for (let i = 0; i < startOffset; i++) days.push(null)
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(d)
  return days
}

const statusConfig: Record<AttendanceStatus, { color: string; bg: string; label: string }> = {
  '○': { color: 'text-emerald-600', bg: 'bg-emerald-100', label: '参加' },
  '△': { color: 'text-amber-600', bg: 'bg-amber-100', label: '未定' },
  '×': { color: 'text-red-500', bg: 'bg-red-100', label: '不参加' },
}

// ==========================================
// 小コンポーネント
// ==========================================

const Avatar = ({ member, size = 'sm' }: { member: Member; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClass = size === 'lg' ? 'w-12 h-12 text-lg' : size === 'md' ? 'w-9 h-9 text-sm' : 'w-7 h-7 text-xs'
  return (
    <div className={`${member.avatar} ${sizeClass} rounded-full flex items-center justify-center text-white font-bold shrink-0`}>
      {member.name.slice(0, 1)}
    </div>
  )
}

const StatusBadge = ({ status, small }: { status: AttendanceStatus; small?: boolean }) => {
  const config = statusConfig[status]
  return (
    <span className={`${config.bg} ${config.color} font-bold rounded-full inline-flex items-center justify-center ${small ? 'w-5 h-5 text-xs' : 'w-7 h-7 text-sm'}`}>
      {status}
    </span>
  )
}

// 時刻セレクト
const HourSelect = ({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 bg-white"
    >
      {HOUR_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
)

// コート番号管理UI（マスタ用）
const CourtNumberEditor = ({
  courtNumbers,
  onChange,
}: {
  courtNumbers: string[]
  onChange: (numbers: string[]) => void
}) => {
  const [input, setInput] = useState('')

  const addNumber = () => {
    const trimmed = input.trim()
    if (!trimmed || courtNumbers.includes(trimmed)) return
    onChange([...courtNumbers, trimmed])
    setInput('')
  }

  const removeNumber = (num: string) => {
    onChange(courtNumbers.filter((n) => n !== num))
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">コート番号（{courtNumbers.length}面）</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {courtNumbers.map((num) => (
          <span key={num} className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-sm font-medium px-2.5 py-1 rounded-full">
            {num}番
            <button type="button" onClick={() => removeNumber(num)} className="text-emerald-400 hover:text-red-500 transition-colors">
              <svg className="w-3.5 h-3.5" viewBox="0 0 12 12"><path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          </span>
        ))}
        {courtNumbers.length === 0 && <span className="text-xs text-slate-400">コート番号を追加してください</span>}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addNumber() } }}
          placeholder="例：1, A, 南"
          className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
        />
        <button
          type="button"
          onClick={addNumber}
          disabled={!input.trim() || courtNumbers.includes(input.trim())}
          className="shrink-0 bg-emerald-500 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          追加
        </button>
      </div>
    </div>
  )
}

// コート複数選択チェックボックス
const CourtMultiSelect = ({
  courts,
  selected,
  onChange,
}: {
  courts: Court[]
  selected: EventCourt[]
  onChange: (courts: EventCourt[]) => void
}) => {
  // コート番号の追加
  const addCourtNumber = (courtId: string, courtNumber: string) => {
    onChange([...selected, { courtId, courtNumber, status: '予定' }])
  }

  // コート番号の削除
  const removeCourtEntry = (courtId: string, courtNumber: string) => {
    onChange(selected.filter((s) => !(s.courtId === courtId && s.courtNumber === courtNumber)))
  }

  // ステータス切り替え
  const toggleStatus = (courtId: string, courtNumber: string) => {
    onChange(
      selected.map((s) =>
        s.courtId === courtId && s.courtNumber === courtNumber
          ? { ...s, status: s.status === '予定' ? '予約済み' : '予定' }
          : s
      )
    )
  }

  const getSelected = (courtId: string) => selected.filter((s) => s.courtId === courtId)

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">コート（複数選択可）</label>
      <div className="space-y-2">
        {courts.map((court) => {
          const courtSelections = getSelected(court.id)
          return (
            <div key={court.id} className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-3 py-2.5 bg-slate-50">
                <span className="font-medium text-sm text-slate-700">{court.name}</span>
                <span className="text-xs text-slate-400 ml-1.5">（{court.courtNumbers.length}面）</span>
              </div>
              <div className="px-3 py-2 space-y-1.5">
                {court.courtNumbers.map((num) => {
                  const entry = courtSelections.find((s) => s.courtNumber === num)
                  return (
                    <div key={num} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => (entry ? removeCourtEntry(court.id, num) : addCourtNumber(court.id, num))}
                        className={`flex items-center gap-2 flex-1 px-2.5 py-2 rounded-lg text-sm text-left transition-all
                          ${entry ? 'bg-emerald-50 text-emerald-700' : 'bg-white text-slate-500 hover:bg-slate-50'}
                        `}
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors
                          ${entry ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}
                        `}>
                          {entry && <svg className="w-3 h-3 text-white" viewBox="0 0 12 12"><path d="M10 3L4.5 8.5 2 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        </div>
                        <span className="font-medium">{num}番コート</span>
                      </button>
                      {entry && (
                        <button
                          type="button"
                          onClick={() => toggleStatus(court.id, num)}
                          className={`shrink-0 text-xs font-bold px-2.5 py-1.5 rounded-full transition-all
                            ${entry.status === '予約済み' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}
                          `}
                        >
                          {entry.status}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      {courts.length === 0 && (
        <p className="text-xs text-slate-400 mt-1">コートが登録されていません。先にコートタブで登録してください。</p>
      )}
    </div>
  )
}

// ==========================================
// ログイン画面
// ==========================================

const LoginScreen = ({ members, onLogin }: { members: Member[]; onLogin: (memberId: string) => void }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col">
      <div className="pt-12 pb-6 px-6 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <CircleDot className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Tennis</h1>
        <p className="text-sm text-slate-500 mt-1">サークルの予定管理をもっとカンタンに</p>
      </div>

      <div className="px-6 mb-6">
        <button disabled className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3.5 shadow-sm opacity-50 cursor-not-allowed">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">

            <rect width="48" height="48" rx="12" fill="#06C755" />

            <path d="M24 9C15.163 9 8 15.089 8 22.6c0 4.698 2.981 8.836 7.5 11.29-.329 1.228-1.19 4.453-1.362 5.146-.214.865.316.853.664.621.274-.183 4.352-2.958 6.113-4.154.99.138 2.01.21 3.085.21 8.837 0 16-6.089 16-13.113C40 15.089 32.837 9 24 9z" fill="white" />

            <circle cx="17" cy="22.5" r="2" fill="#06C755" />
            <circle cx="24" cy="22.5" r="2" fill="#06C755" />
            <circle cx="31" cy="22.5" r="2" fill="#06C755" />
          </svg>
          <span className="text-slate-600 font-medium">LINEアカウントでログイン</span>
        </button>
        <p className="text-xs text-slate-400 text-center mt-2">※デモ版のため下のメンバーを選択してください</p>
      </div>

      <div className="flex-1 bg-white rounded-t-3xl shadow-lg px-4 pt-5 pb-8">
        <p className="text-sm font-medium text-slate-500 mb-3 px-1">ログインするメンバーを選択</p>
        <div className="grid grid-cols-1 gap-2">
          {members.map((member) => (
            <button
              key={member.id}
              onClick={() => onLogin(member.id)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-50 active:bg-emerald-100 transition-colors border border-slate-100"
            >
              <Avatar member={member} size="md" />
              <span className="text-slate-700 font-medium">{member.name}</span>
              <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ==========================================
// メインアプリ
// ==========================================

export default function TennisSchedulePage() {
  const [showSplash, setShowSplash] = useState(true)
  const [showGuidance, setShowGuidance] = useState(false)
  const { InfoModal, openInfo } = useInfoModal({
    theme: THEME,
    systemIcon: CircleDot,
    systemName: 'テニスカレンダー',
    systemDescription: 'テニスサークルの予定管理に特化したカレンダーアプリ。LINEスケジュールの煩雑さを解消し、ワンタップで参加可否を入力できます。',
    features: FEATURES,
    timeEfficiency: TIME_EFFICIENCY,
    challenges: CHALLENGES,
    overview: OVERVIEW,
    operationSteps: OPERATION_STEPS,
  })

  // ログイン状態
  const [loggedInUserId, setLoggedInUserId] = usePersistedState<string | null>(STORAGE_KEYS.loggedInUser, null)

  // データ
  const [events, setEvents] = usePersistedState<TennisEvent[]>(STORAGE_KEYS.events, INITIAL_EVENTS)
  const [courts, setCourts] = usePersistedState<Court[]>(STORAGE_KEYS.courts, INITIAL_COURTS)
  const [activeTab, setActiveTab] = usePersistedState<TabId>(STORAGE_KEYS.activeTab, 'home')

  // ホーム内のビューモード（リストがデフォルト）
  const [homeViewMode, setHomeViewMode] = useState<HomeViewMode>('list')

  // カレンダー状態
  const [calendarDate, setCalendarDate] = useState(() => new Date())

  // モーダル（useModal）
  const dateEventsModal = useModal<string>() // 日付選択モーダル（値は dateStr）
  const eventDetailModal = useModal<string>() // イベント詳細モーダル（値は eventId）
  const createEventModal = useModal()
  const editEventModal = useModal<string>() // 編集中のeventId
  const createCourtModal = useModal()
  const editCourtModal = useModal<string>() // 編集中のcourtId

  // コメント入力
  const [commentInput, setCommentInput] = useState('')
  const [showCommentFor, setShowCommentFor] = useState<string | null>(null)

  // 新規イベントフォーム
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    startTime: '09:00',
    endTime: '12:00',
    courts: [] as EventCourt[],
    memo: '',
  })

  // 編集イベントフォーム
  const [editEvent, setEditEvent] = useState({
    title: '',
    date: '',
    startTime: '09:00',
    endTime: '12:00',
    courts: [] as EventCourt[],
    memo: '',
  })

  // 新規コートフォーム
  const [newCourt, setNewCourt] = useState({ name: '', address: '', googleMapsUrl: '', courtNumbers: ['1', '2'] })

  const members = INITIAL_MEMBERS
  const loggedInUser = members.find((m) => m.id === loggedInUserId) ?? null
  const getMember = useCallback((id: string) => members.find((m) => m.id === id), [])
  const getCourt = useCallback((id: string) => courts.find((c) => c.id === id), [courts])

  // カレンダーデータ
  const calYear = calendarDate.getFullYear()
  const calMonth = calendarDate.getMonth()
  const calendarDays = useMemo(() => generateCalendarDays(calYear, calMonth), [calYear, calMonth])

  // 日付ごとのイベントマップ
  const eventsByDate = useMemo(() => {
    const map: Record<string, TennisEvent[]> = {}
    events.forEach((ev) => {
      if (!map[ev.date]) map[ev.date] = []
      map[ev.date].push(ev)
    })
    return map
  }, [events])

  // 直近の予定（今日以降）
  const upcomingEvents = useMemo(() => {
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    return events
      .filter((ev) => ev.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
  }, [events])

  const selectedEvent = eventDetailModal.open ? events.find((e) => e.id === eventDetailModal.open) : null

  // ==========================================
  // ハンドラー
  // ==========================================

  const handleLogin = (memberId: string) => setLoggedInUserId(memberId)
  const handleLogout = () => setLoggedInUserId(null)

  const handlePrevMonth = () => {
    setCalendarDate(new Date(calYear, calMonth - 1, 1))
  }
  const handleNextMonth = () => {
    setCalendarDate(new Date(calYear, calMonth + 1, 1))
  }

  const handleDateClick = (day: number) => {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    dateEventsModal.handleOpen(dateStr)
  }

  // 出欠登録
  const handleAttendance = (eventId: string, status: AttendanceStatus) => {
    if (!loggedInUserId) return
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventId) return ev
        const existing = ev.attendances.find((a) => a.memberId === loggedInUserId)
        if (existing) {
          if (existing.status === status) {
            return { ...ev, attendances: ev.attendances.filter((a) => a.memberId !== loggedInUserId) }
          }
          return { ...ev, attendances: ev.attendances.map((a) => (a.memberId === loggedInUserId ? { ...a, status } : a)) }
        }
        return { ...ev, attendances: [...ev.attendances, { memberId: loggedInUserId, status, comment: '' }] }
      })
    )
  }

  // コメント保存
  const handleSaveComment = (eventId: string) => {
    if (!loggedInUserId) return
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventId) return ev
        return { ...ev, attendances: ev.attendances.map((a) => (a.memberId === loggedInUserId ? { ...a, comment: commentInput } : a)) }
      })
    )
    setShowCommentFor(null)
    setCommentInput('')
  }

  // イベント作成
  const handleCreateEvent = () => {
    if (!loggedInUserId || !newEvent.title || !newEvent.date || newEvent.courts.length === 0) return
    const event: TennisEvent = {
      id: generateId('ev'),
      title: newEvent.title,
      date: newEvent.date,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      courts: newEvent.courts,
      creatorId: loggedInUserId,
      attendances: [{ memberId: loggedInUserId, status: '○', comment: '' }],
      memo: newEvent.memo,
      createdAt: new Date().toISOString(),
    }
    setEvents((prev) => [...prev, event])
    createEventModal.handleClose()
    setNewEvent({ title: '', date: '', startTime: '09:00', endTime: '12:00', courts: [], memo: '' })
  }

  // イベント削除
  const handleDeleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId))
    eventDetailModal.handleClose()
  }

  // イベント編集開始
  const handleStartEditEvent = (eventId: string) => {
    const ev = events.find((e) => e.id === eventId)
    if (!ev) return
    setEditEvent({
      title: ev.title,
      date: ev.date,
      startTime: ev.startTime,
      endTime: ev.endTime,
      courts: ev.courts,
      memo: ev.memo,
    })
    eventDetailModal.handleClose()
    setTimeout(() => editEventModal.handleOpen(eventId), 150)
  }

  // イベント更新
  const handleUpdateEvent = () => {
    if (!editEventModal.open || !editEvent.title || !editEvent.date || editEvent.courts.length === 0) return
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === editEventModal.open
          ? { ...ev, title: editEvent.title, date: editEvent.date, startTime: editEvent.startTime, endTime: editEvent.endTime, courts: editEvent.courts, memo: editEvent.memo }
          : ev
      )
    )
    editEventModal.handleClose()
  }

  // コート作成
  const handleCreateCourt = () => {
    if (!newCourt.name) return
    const url = newCourt.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(newCourt.address)}`
    setCourts((prev) => [...prev, { id: generateId('ct'), name: newCourt.name, address: newCourt.address, googleMapsUrl: url, courtNumbers: newCourt.courtNumbers }])
    createCourtModal.handleClose()
    setNewCourt({ name: '', address: '', googleMapsUrl: '', courtNumbers: ['1', '2'] })
  }

  // コート更新
  const handleUpdateCourt = () => {
    if (!editCourtModal.open || !newCourt.name) return
    const url = newCourt.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(newCourt.address)}`
    setCourts((prev) => prev.map((c) => (c.id === editCourtModal.open ? { ...c, name: newCourt.name, address: newCourt.address, googleMapsUrl: url, courtNumbers: newCourt.courtNumbers } : c)))
    editCourtModal.handleClose()
    setNewCourt({ name: '', address: '', googleMapsUrl: '', courtNumbers: ['1', '2'] })
  }

  // コート削除
  const handleDeleteCourt = (courtId: string) => {
    setCourts((prev) => prev.filter((c) => c.id !== courtId))
  }

  // ==========================================
  // スプラッシュ
  // ==========================================

  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => setShowSplash(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [showSplash])

  if (showSplash) {
    return <SplashScreen theme={THEME} systemName="Tennis" subtitle="サークルスケジュール管理" />
  }

  if (!loggedInUser) {
    return <LoginScreen members={members} onLogin={handleLogin} />
  }

  // ==========================================
  // 出欠集計ヘルパー
  // ==========================================

  const getAttendanceSummary = (ev: TennisEvent) => {
    const counts = { '○': 0, '△': 0, '×': 0 }
    ev.attendances.forEach((a) => counts[a.status]++)
    return counts
  }

  const getMyAttendance = (ev: TennisEvent): Attendance | undefined => {
    return ev.attendances.find((a) => a.memberId === loggedInUserId)
  }

  // ==========================================
  // 出欠ボタン行（共通）
  // ==========================================

  const renderAttendanceButtons = (ev: TennisEvent) => {
    const myAttendance = getMyAttendance(ev)
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 mr-1">参加：</span>
        {(['○', '△', '×'] as AttendanceStatus[]).map((status) => {
          const isActive = myAttendance?.status === status
          const config = statusConfig[status]
          return (
            <button
              key={status}
              onClick={() => handleAttendance(ev.id, status)}
              className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all
                ${isActive ? `${config.bg} ${config.color} ring-2 ring-offset-1 ${status === '○' ? 'ring-emerald-300' : status === '△' ? 'ring-amber-300' : 'ring-red-300'}` : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}
              `}
            >
              {status}
            </button>
          )
        })}
        {myAttendance && <span className="text-xs text-slate-400 ml-auto">{statusConfig[myAttendance.status].label}</span>}
      </div>
    )
  }

  // コート名表示（複数対応）
  const renderCourtNames = (eventCourts: EventCourt[], compact = false) => {
    if (eventCourts.length === 0) return null
    if (compact) {
      const labels = eventCourts.map((ec) => {
        const court = getCourt(ec.courtId)
        return court ? `${court.name} ${ec.courtNumber}番` : ''
      }).filter(Boolean)
      return <span className="truncate">{labels.join('、')}</span>
    }

    // コート場所ごとにグループ化
    const grouped = new Map<string, EventCourt[]>()
    eventCourts.forEach((ec) => {
      const list = grouped.get(ec.courtId) || []
      list.push(ec)
      grouped.set(ec.courtId, list)
    })

    return (
      <div className="space-y-1">
        {Array.from(grouped.entries()).map(([courtId, entries]) => {
          const court = getCourt(courtId)
          if (!court) return null
          return (
            <div key={courtId}>
              <div className="flex items-center gap-2">
                <span className="text-slate-700">{court.name}</span>
                <a href={court.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 text-xs text-emerald-600 hover:underline">
                  <Navigation className="w-3 h-3" />
                  地図
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <div className="flex flex-wrap gap-1 mt-0.5 ml-1">
                {entries.map((ec) => (
                  <span
                    key={ec.courtNumber}
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${ec.status === '予約済み' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}
                  >
                    {ec.courtNumber}番 {ec.status}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // ==========================================
  // カレンダービュー
  // ==========================================

  const renderCalendar = () => {
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    return (
      <div className="bg-white mx-3 mt-3 rounded-2xl shadow-sm border border-slate-100 overflow-hidden" data-guidance="calendar">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-full">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h3 className="text-base font-bold text-slate-800">{calYear}年{calMonth + 1}月</h3>
          <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-full">
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 border-t border-slate-100">
          {['日', '月', '火', '水', '木', '金', '土'].map((d, i) => (
            <div key={d} className={`text-center text-xs font-medium py-2 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-slate-400'}`}>
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 border-t border-slate-100">
          {calendarDays.map((day, idx) => {
            if (day === null) return <div key={`empty-${idx}`} className="h-12" />
            const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const dayEvents = eventsByDate[dateStr] ?? []
            const isToday = dateStr === todayStr
            const dayOfWeek = new Date(calYear, calMonth, day).getDay()

            return (
              <button key={dateStr} onClick={() => handleDateClick(day)} className="h-12 flex flex-col items-center justify-center relative transition-colors hover:bg-slate-50">
                <span className={`text-sm leading-none
                  ${isToday ? 'bg-emerald-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold' : ''}
                  ${!isToday && dayOfWeek === 0 ? 'text-red-400' : ''}
                  ${!isToday && dayOfWeek === 6 ? 'text-blue-400' : ''}
                  ${!isToday ? 'text-slate-700' : ''}
                `}>
                  {day}
                </span>
                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayEvents.slice(0, 3).map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // ==========================================
  // リストビュー
  // ==========================================

  const renderList = () => (
    <div className="mx-3 mt-3" data-guidance="event-list">
      {upcomingEvents.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 p-6 text-center text-sm text-slate-400">予定はまだありません</div>
      ) : (
        <div className="space-y-2">
          {upcomingEvents.map((ev) => renderEventCard(ev))}
        </div>
      )}
    </div>
  )

  // ==========================================
  // ホームタブ
  // ==========================================

  const renderHome = () => (
    <div className="pb-24">
      {/* サブタブ */}
      <div className="flex mx-3 mt-3 bg-slate-100 rounded-xl p-1">
        <button
          onClick={() => setHomeViewMode('list')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all
            ${homeViewMode === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}
          `}
        >
          <LayoutList className="w-4 h-4" />
          リスト
        </button>
        <button
          onClick={() => setHomeViewMode('calendar')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all
            ${homeViewMode === 'calendar' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}
          `}
        >
          <Calendar className="w-4 h-4" />
          カレンダー
        </button>
      </div>

      {homeViewMode === 'list' && renderList()}
      {homeViewMode === 'calendar' && renderCalendar()}
    </div>
  )

  // ==========================================
  // イベントカード
  // ==========================================

  const renderEventCard = (ev: TennisEvent) => {
    const summary = getAttendanceSummary(ev)

    return (
      <div key={ev.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden active:bg-slate-50 transition-colors">
        <button onClick={() => eventDetailModal.handleOpen(ev.id)} className="w-full text-left p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h5 className="font-bold text-slate-800 text-sm">{ev.title}</h5>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>{formatDate(ev.date)} {ev.startTime}〜{ev.endTime}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {renderCourtNames(ev.courts, true)}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 text-xs">
              <span className="text-emerald-600 font-bold">○{summary['○']}</span>
              <span className="text-amber-600 font-bold">△{summary['△']}</span>
              <span className="text-red-400 font-bold">×{summary['×']}</span>
            </div>
          </div>
        </button>
        <div className="border-t border-slate-50 px-4 py-2.5">
          {renderAttendanceButtons(ev)}
        </div>
      </div>
    )
  }

  // ==========================================
  // コート管理タブ
  // ==========================================

  const renderCourts = () => (
    <div className="pb-24 px-3 pt-3">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-slate-600 px-1">登録コート一覧</h4>
        <button
          onClick={() => {
            setNewCourt({ name: '', address: '', googleMapsUrl: '', courtNumbers: ['1', '2'] })
            createCourtModal.handleOpen()
          }}
          className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          追加
        </button>
      </div>

      <div className="space-y-2">
        {courts.map((court, index) => (
          <div key={index} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h5 className="font-bold text-slate-800 text-sm">{court.name}<span className="text-xs font-normal text-slate-400 ml-1.5">（{court.courtNumbers.length}面）</span></h5>
                <p className="text-xs text-slate-500 mt-1">{court.address}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setNewCourt({ name: court.name, address: court.address, googleMapsUrl: court.googleMapsUrl, courtNumbers: court.courtNumbers })
                    editCourtModal.handleOpen(court.id)
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4 text-slate-400" />
                </button>
                <button onClick={() => handleDeleteCourt(court.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4 text-slate-300 hover:text-red-400" />
                </button>
              </div>
            </div>
            <a href={court.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-2.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors">
              <Navigation className="w-3.5 h-3.5" />
              Google Mapsで開く
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ))}
      </div>

      {courts.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-100 p-8 text-center text-sm text-slate-400">コートが登録されていません</div>
      )}
    </div>
  )

  // ==========================================
  // メインレンダリング
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-50 max-w-lg mx-auto relative">
      {/* ヘッダー */}
      <MockHeader>
        <MockHeaderTitle icon={CircleDot} title="テニスカレンダー" subtitle="" theme={THEME} />
        <div className="flex items-center gap-1">
          <MockHeaderTab label="ホーム" icon={Calendar} active={activeTab === 'home'} onClick={() => setActiveTab('home')} theme={THEME} />
          <MockHeaderTab label="コート" icon={MapPin} active={activeTab === 'courts'} onClick={() => setActiveTab('courts')} theme={THEME} data-guidance="tab-courts" />
        </div>
        <div className="flex items-center gap-1">
          <GuidanceStartButton onClick={() => setShowGuidance(true)} theme={THEME} />
          <MockHeaderInfoButton onClick={openInfo} theme={THEME} />
        </div>
      </MockHeader>

      {/* ユーザー情報バー */}
      <div className="bg-white border-b border-slate-100 px-4 py-2 flex items-center justify-between sticky top-[52px] z-30">
        <div className="flex items-center gap-2">
          <Avatar member={loggedInUser} size="sm" />
          <span className="text-sm font-medium text-slate-700">{loggedInUser.name}</span>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors">
          <LogOut className="w-3.5 h-3.5" />
          ログアウト
        </button>
      </div>

      {/* タブコンテンツ */}
      {activeTab === 'home' && renderHome()}
      {activeTab === 'courts' && renderCourts()}

      {/* FAB */}
      {activeTab === 'home' && (
        <button
          onClick={() => {
            setNewEvent({ title: '', date: '', startTime: '09:00', endTime: '12:00', courts: [], memo: '' })
            createEventModal.handleOpen()
          }}
          data-guidance="add-event"
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-full shadow-lg shadow-emerald-200 flex items-center justify-center hover:shadow-xl hover:scale-105 active:scale-95 transition-all z-40 max-w-lg"
          style={{ right: 'max(1.5rem, calc(50% - 240px + 1.5rem))' }}
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* ==================== モーダル群 ==================== */}

      {/* 日付選択モーダル */}
      <dateEventsModal.Modal title={dateEventsModal.open ? formatDate(dateEventsModal.open) : ''}>
        {dateEventsModal.open && (() => {
          const dateEvents = eventsByDate[dateEventsModal.open] ?? []
          return (
            <div>
              {dateEvents.length === 0 ? (
                <div className="py-8 text-center">
                  <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">この日の予定はありません</p>
                  <button
                    onClick={() => {
                      const d = dateEventsModal.open
                      dateEventsModal.handleClose()
                      setNewEvent({ title: '', date: d, startTime: '09:00', endTime: '12:00', courts: [], memo: '' })
                      createEventModal.handleOpen()
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full hover:bg-emerald-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    予定を作成
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {dateEvents.map((ev) => {
                    const summary = getAttendanceSummary(ev)
                    return (
                      <div key={ev.id} className="bg-slate-50 rounded-xl overflow-hidden">
                        <button
                          onClick={() => {
                            dateEventsModal.handleClose()
                            setTimeout(() => eventDetailModal.handleOpen(ev.id), 150)
                          }}
                          className="w-full text-left p-3 hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-slate-800 text-sm">{ev.title}</h5>
                              <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                                <Clock className="w-3.5 h-3.5 shrink-0" />
                                <span>{ev.startTime}〜{ev.endTime}</span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500">
                                <MapPin className="w-3.5 h-3.5 shrink-0" />
                                {renderCourtNames(ev.courts, true)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 text-xs">
                              <span className="text-emerald-600 font-bold">○{summary['○']}</span>
                              <span className="text-amber-600 font-bold">△{summary['△']}</span>
                              <span className="text-red-400 font-bold">×{summary['×']}</span>
                            </div>
                          </div>
                        </button>
                        <div className="border-t border-slate-200/50 px-3 py-2">
                          {renderAttendanceButtons(ev)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })()}
      </dateEventsModal.Modal>

      {/* イベント詳細モーダル */}
      <eventDetailModal.Modal title="">
        {selectedEvent && (() => {
          const summary = getAttendanceSummary(selectedEvent)
          const myAttendance = getMyAttendance(selectedEvent)
          const creator = getMember(selectedEvent.creatorId)
          const isCreator = selectedEvent.creatorId === loggedInUserId
          const attendanceByStatus: Record<AttendanceStatus, Attendance[]> = { '○': [], '△': [], '×': [] }
          selectedEvent.attendances.forEach((a) => attendanceByStatus[a.status].push(a))

          return (
            <div className="-mt-2 w-72 max-w-[70vw]">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-800">{selectedEvent.title}</h3>
                {creator && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Avatar member={creator} size="sm" />
                    <span className="text-xs text-slate-500">{creator.name} が作成</span>
                  </div>
                )}
              </div>

              <div className="space-y-2.5 mb-5">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-slate-700">{formatDateFull(selectedEvent.date)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-slate-700">{selectedEvent.startTime} 〜 {selectedEvent.endTime}</span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  {renderCourtNames(selectedEvent.courts)}
                </div>
              </div>

              {selectedEvent.memo && (
                <div className="bg-slate-50 rounded-xl p-3 mb-5 text-sm text-slate-600">{selectedEvent.memo}</div>
              )}

              {/* 出欠ボタン */}
              <div className="bg-emerald-50 rounded-xl p-4 mb-5">
                <p className="text-xs font-medium text-emerald-700 mb-2">あなたの参加可否</p>
                <div className="flex items-center gap-2">
                  {(['○', '△', '×'] as AttendanceStatus[]).map((status) => {
                    const isActive = myAttendance?.status === status
                    const config = statusConfig[status]
                    return (
                      <button
                        key={status}
                        onClick={() => handleAttendance(selectedEvent.id, status)}
                        className={`flex-1 py-2.5 rounded-xl text-base font-bold transition-all
                          ${isActive ? `${config.bg} ${config.color} ring-2 ring-offset-1 ${status === '○' ? 'ring-emerald-300' : status === '△' ? 'ring-amber-300' : 'ring-red-300'} shadow-sm` : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-200'}
                        `}
                      >
                        {status} {config.label}
                      </button>
                    )
                  })}
                </div>

                {myAttendance && showCommentFor !== selectedEvent.id && (
                  <button
                    onClick={() => {
                      setCommentInput(myAttendance.comment)
                      setShowCommentFor(selectedEvent.id)
                    }}
                    className="flex items-center gap-1.5 mt-3 text-xs text-emerald-600 hover:underline"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    {myAttendance.comment ? `コメント: ${myAttendance.comment}` : 'コメントを追加'}
                  </button>
                )}

                {showCommentFor === selectedEvent.id && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="一言コメント（任意）"
                      className="flex-1 text-sm border border-emerald-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    />
                    <button onClick={() => handleSaveComment(selectedEvent.id)} className="bg-emerald-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600">
                      保存
                    </button>
                  </div>
                )}
              </div>

              {/* 参加者一覧 */}
              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  参加者一覧
                  <span className="text-xs font-normal text-slate-400 ml-1">{selectedEvent.attendances.length}人回答</span>
                </h4>

                <div className="flex gap-3 mb-3">
                  {(['○', '△', '×'] as AttendanceStatus[]).map((status) => (
                    <div key={status} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusConfig[status].bg} ${statusConfig[status].color}`}>
                      {status} {summary[status]}人
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  {(['○', '△', '×'] as AttendanceStatus[]).map((status) => {
                    const group = attendanceByStatus[status]
                    if (group.length === 0) return null
                    return (
                      <div key={status}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <StatusBadge status={status} small />
                          <span className="text-xs font-medium text-slate-500">{statusConfig[status].label}（{group.length}人）</span>
                        </div>
                        <div className="space-y-1">
                          {group.map((a) => {
                            const member = getMember(a.memberId)
                            if (!member) return null
                            return (
                              <div key={a.memberId} className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg">
                                <Avatar member={member} size="sm" />
                                <span className="text-sm text-slate-700 flex-1">{member.name}</span>
                                {a.comment && <span className="text-xs text-slate-400 max-w-[120px] truncate">💬 {a.comment}</span>}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* 未回答 */}
                {(() => {
                  const respondedIds = new Set(selectedEvent.attendances.map((a) => a.memberId))
                  const notResponded = members.filter((m) => !respondedIds.has(m.id))
                  if (notResponded.length === 0) return null
                  return (
                    <div className="mt-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                          <HelpCircle className="w-3 h-3 text-slate-400" />
                        </div>
                        <span className="text-xs font-medium text-slate-400">未回答（{notResponded.length}人）</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {notResponded.map((m) => (
                          <span key={m.id} className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-full">{m.name}</span>
                        ))}
                      </div>
                    </div>
                  )
                })()}
              </div>

              {isCreator && (
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button onClick={() => handleStartEditEvent(selectedEvent.id)} className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                    <Edit3 className="w-3.5 h-3.5" />
                    この予定を編集
                  </button>
                  <button onClick={() => handleDeleteEvent(selectedEvent.id)} className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                    削除
                  </button>
                </div>
              )}
            </div>
          )
        })()}
      </eventDetailModal.Modal>

      {/* イベント作成モーダル */}
      <createEventModal.Modal title="予定を作成">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">タイトル</label>
            <input
              type="text"
              value={newEvent.title}
              onChange={(e) => setNewEvent((p) => ({ ...p, title: e.target.value }))}
              placeholder="例：定期練習会"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">日付</label>
            <input
              type="date"
              value={newEvent.date}
              onChange={(e) => setNewEvent((p) => ({ ...p, date: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <HourSelect label="開始時間" value={newEvent.startTime} onChange={(v) => setNewEvent((p) => ({ ...p, startTime: v }))} />
            <HourSelect label="終了時間" value={newEvent.endTime} onChange={(v) => setNewEvent((p) => ({ ...p, endTime: v }))} />
          </div>
          <CourtMultiSelect courts={courts} selected={newEvent.courts} onChange={(c) => setNewEvent((p) => ({ ...p, courts: c }))} />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">メモ（任意）</label>
            <textarea
              value={newEvent.memo}
              onChange={(e) => setNewEvent((p) => ({ ...p, memo: e.target.value }))}
              placeholder="初心者歓迎、ラケット貸出あり　など"
              rows={2}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 resize-none"
            />
          </div>
          <button
            onClick={handleCreateEvent}
            disabled={!newEvent.title || !newEvent.date || newEvent.courts.length === 0}
            className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold py-3 rounded-xl hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            作成する
          </button>
        </div>
      </createEventModal.Modal>

      {/* イベント編集モーダル */}
      <editEventModal.Modal title="予定を編集">
        <div className="space-y-4 w-[360px] max-w-[80vw]">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">タイトル</label>
            <input
              type="text"
              value={editEvent.title}
              onChange={(e) => setEditEvent((p) => ({ ...p, title: e.target.value }))}
              placeholder="例：定期練習会"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">日付</label>
            <input
              type="date"
              value={editEvent.date}
              onChange={(e) => setEditEvent((p) => ({ ...p, date: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <HourSelect label="開始時間" value={editEvent.startTime} onChange={(v) => setEditEvent((p) => ({ ...p, startTime: v }))} />
            <HourSelect label="終了時間" value={editEvent.endTime} onChange={(v) => setEditEvent((p) => ({ ...p, endTime: v }))} />
          </div>
          <CourtMultiSelect courts={courts} selected={editEvent.courts} onChange={(c) => setEditEvent((p) => ({ ...p, courts: c }))} />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">メモ（任意）</label>
            <textarea
              value={editEvent.memo}
              onChange={(e) => setEditEvent((p) => ({ ...p, memo: e.target.value }))}
              placeholder="初心者歓迎、ラケット貸出あり　など"
              rows={2}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 resize-none"
            />
          </div>
          <button
            onClick={handleUpdateEvent}
            disabled={!editEvent.title || !editEvent.date || editEvent.courts.length === 0}
            className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold py-3 rounded-xl hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            更新する
          </button>
        </div>
      </editEventModal.Modal>

      {/* コート作成モーダル */}
      <createCourtModal.Modal title="コートを追加">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">コート名</label>
            <input type="text" value={newCourt.name} onChange={(e) => setNewCourt((p) => ({ ...p, name: e.target.value }))} placeholder="例：中央公園テニスコート" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300" />
          </div>
          <CourtNumberEditor
            courtNumbers={newCourt.courtNumbers}
            onChange={(nums) => setNewCourt((p) => ({ ...p, courtNumbers: nums }))}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">住所</label>
            <input type="text" value={newCourt.address} onChange={(e) => setNewCourt((p) => ({ ...p, address: e.target.value }))} placeholder="例：東京都新宿区○○1-2-3" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Google Maps URL（任意）</label>
            <input type="url" value={newCourt.googleMapsUrl} onChange={(e) => setNewCourt((p) => ({ ...p, googleMapsUrl: e.target.value }))} placeholder="空欄の場合は住所から自動生成" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300" />
          </div>
          <button onClick={handleCreateCourt} disabled={!newCourt.name} className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold py-3 rounded-xl hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            追加する
          </button>
        </div>
      </createCourtModal.Modal>

      {/* コート編集モーダル */}
      <editCourtModal.Modal title="コートを編集">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">コート名</label>
            <input type="text" value={newCourt.name} onChange={(e) => setNewCourt((p) => ({ ...p, name: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300" />
          </div>
          <CourtNumberEditor
            courtNumbers={newCourt.courtNumbers}
            onChange={(nums) => setNewCourt((p) => ({ ...p, courtNumbers: nums }))}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">住所</label>
            <input type="text" value={newCourt.address} onChange={(e) => setNewCourt((p) => ({ ...p, address: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Google Maps URL（任意）</label>
            <input type="url" value={newCourt.googleMapsUrl} onChange={(e) => setNewCourt((p) => ({ ...p, googleMapsUrl: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300" />
          </div>
          <button onClick={handleUpdateCourt} disabled={!newCourt.name} className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold py-3 rounded-xl hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            更新する
          </button>
        </div>
      </editCourtModal.Modal>

      {/* データリセットボタン */}
      <div className="fixed bottom-6 left-6 z-40" style={{ left: 'max(1.5rem, calc(50% - 240px + 1.5rem))' }}>
        <button
          onClick={() => resetPersistedData(STORAGE_KEYS)}
          className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm text-slate-400 text-xs px-3 py-2 rounded-full border border-slate-200 hover:bg-white hover:text-slate-600 transition-all shadow-sm"
        >
          <RotateCcw className="w-3 h-3" />
          リセット
        </button>
      </div>

      <InfoModal />

      {/* ガイダンスオーバーレイ */}
      <GuidanceOverlay steps={getGuidanceSteps()} isActive={showGuidance} onClose={() => setShowGuidance(false)} theme={THEME} />
    </div>
  )
}
