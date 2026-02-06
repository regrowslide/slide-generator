'use client'

/**
 * 山の会（KCAC）システム モックアップ v2
 *
 * メニュー構造:
 * ■ 例会（管理者）
 *   - 例会一覧（リスト）
 *   - 例会の新規作成・編集（CRUD）
 *   - 出席回答の確認
 *
 * ■ 例会（一般会員）
 *   - 例会スケジュール（カレンダービュー）
 *   - 出席回答履歴
 *   - 例会記録の閲覧・作成
 *
 * ※ DELETEは全てソフトデリート
 */

import {useState, useMemo} from 'react'

// =============================================================================
// 定数・マスターデータ
// =============================================================================

/** 部署 */
const DEPARTMENTS = {
  hiking: {id: 'hiking', name: 'ハイキング部', color: '#22c55e', bgColor: '#dcfce7'},
  sanko: {id: 'sanko', name: '山行部', color: '#3b82f6', bgColor: '#dbeafe'},
  education: {id: 'education', name: '教育部', color: '#a855f7', bgColor: '#f3e8ff'},
  nature: {id: 'nature', name: '自然保護部', color: '#eab308', bgColor: '#fef9c3'},
  organization: {id: 'organization', name: '組織部', color: '#6b7280', bgColor: '#f3f4f6'},
}

/** 体力度グレード */
const STAMINA_GRADES = ['(^^)', 'O(-)', 'O', 'O(+)', 'OO', 'OOO', 'OOOO']

/** 技術度グレード */
const SKILL_GRADES = ['なし', '☆', '☆☆', '☆☆☆']

/** 岩登り区分 */
const ROCK_CATEGORIES = ['なし', 'A', 'B', 'C']

/** 出席回答ステータス */
const ATTENDANCE_STATUS = {
  pending: {id: 'pending', label: '未回答', color: '#6b7280', bgColor: '#f3f4f6'},
  attending: {id: 'attending', label: '出席', color: '#22c55e', bgColor: '#dcfce7'},
  notAttending: {id: 'notAttending', label: '欠席', color: '#ef4444', bgColor: '#fee2e2'},
  undecided: {id: 'undecided', label: '未定', color: '#eab308', bgColor: '#fef9c3'},
}

/** 記録ステータス */
const RECORD_STATUS = {
  draft: {id: 'draft', label: '下書き', color: '#6b7280'},
  submitted: {id: 'submitted', label: '提出済', color: '#3b82f6'},
  published: {id: 'published', label: '掲載済', color: '#22c55e'},
}

/** 装備カテゴリ */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const EQUIPMENT_CATEGORIES = {
  tent: {id: 'tent', name: 'テント', icon: '⛺', color: '#22c55e', bgColor: '#dcfce7'},
  rope: {id: 'rope', name: 'ロープ', icon: '🧵', color: '#3b82f6', bgColor: '#dbeafe'},
  radio: {id: 'radio', name: '無線機', icon: '📻', color: '#a855f7', bgColor: '#f3e8ff'},
  climbing: {id: 'climbing', name: '登攀具', icon: '🧗', color: '#f97316', bgColor: '#ffedd5'},
  cooking: {id: 'cooking', name: '調理器具', icon: '🍳', color: '#eab308', bgColor: '#fef9c3'},
  other: {id: 'other', name: 'その他', icon: '📦', color: '#6b7280', bgColor: '#f3f4f6'},
}

/** 装備状態 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const EQUIPMENT_CONDITIONS = {
  good: {id: 'good', label: '良好', color: '#22c55e', bgColor: '#dcfce7'},
  needsCheck: {id: 'needsCheck', label: '要点検', color: '#eab308', bgColor: '#fef9c3'},
  repairing: {id: 'repairing', label: '修理中', color: '#ef4444', bgColor: '#fee2e2'},
}

/** 装備ステータス */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const EQUIPMENT_STATUS = {
  available: {id: 'available', label: '貸出可', color: '#22c55e', bgColor: '#dcfce7'},
  rented: {id: 'rented', label: '貸出中', color: '#3b82f6', bgColor: '#dbeafe'},
  maintenance: {id: 'maintenance', label: 'メンテナンス中', color: '#ef4444', bgColor: '#fee2e2'},
}

// =============================================================================
// 初期データ
// =============================================================================

/** 会員マスター */
const INITIAL_MEMBERS = [
  {id: 1, name: '原田 勝次', insuranceKuchi: 8, role: '自然保護部長', isAdmin: true},
  {id: 2, name: '大坪 豊', insuranceKuchi: 8, role: '山行部員', isAdmin: true},
  {id: 3, name: '新井 公子', insuranceKuchi: 4, role: 'ハイキング部員', isAdmin: false},
  {id: 4, name: '永末 康史', insuranceKuchi: 8, role: '教育部長', isAdmin: true},
  {id: 5, name: '河尻 重和', insuranceKuchi: 8, role: '山行部員', isAdmin: false},
  {id: 6, name: '坂東 美碧', insuranceKuchi: 4, role: '自然保護部員', isAdmin: false},
  {id: 7, name: '毛戸 伸悟', insuranceKuchi: 8, role: '山行部員', isAdmin: false},
  {id: 8, name: '下垣内 福世', insuranceKuchi: 4, role: 'ハイキング部員', isAdmin: false},
]

/** 例会マスター */
const INITIAL_EVENTS = [
  {
    id: 1,
    title: 'クリーンハイク',
    mountainName: '六甲山系',
    altitude: null,
    departmentId: 'nature',
    clId: 1,
    slId: 6,
    startDate: '2026-02-08',
    endDate: '2026-02-08',
    staminaGrade: 'O',
    skillGrade: 'なし',
    rockCategory: 'なし',
    requiredInsurance: 3,
    meetingPlace: 'JR新神戸駅',
    meetingTime: '08:50',
    course: '新神戸駅→市ヶ原→あじさい広場→森林植物園東門→桜谷→摩耶山→上野道→神戸高校',
    deadline: '2026-02-07',
    notes: 'お試し参加可。ゴミ袋・ゴミばさみ持参。雨天決行。',
    isDeleted: false,
    createdAt: '2026-01-15',
  },
  {
    id: 2,
    title: '西穂高岳',
    mountainName: '北アルプス・西穂高岳',
    altitude: '2908m',
    departmentId: 'sanko',
    clId: 2,
    slId: 5,
    startDate: '2026-02-14',
    endDate: '2026-02-16',
    staminaGrade: 'OOO',
    skillGrade: '☆☆☆',
    rockCategory: 'なし',
    requiredInsurance: 8,
    meetingPlace: 'JR三ノ宮駅北側',
    meetingTime: '20:30',
    course: '新穂高温泉→ロープウェイ→西穂高口→西穂山荘(幕営)→西穂高岳→下山',
    deadline: '2026-02-01',
    notes: '山行部アイゼントレ&保険8口以上。車の提供希望。',
    isDeleted: false,
    createdAt: '2026-01-10',
  },
  {
    id: 3,
    title: '六甲縦走トレーニング①',
    mountainName: '六甲山系',
    altitude: null,
    departmentId: 'hiking',
    clId: 8,
    slId: null,
    startDate: '2026-02-22',
    endDate: '2026-02-22',
    staminaGrade: 'O',
    skillGrade: 'なし',
    rockCategory: 'なし',
    requiredInsurance: 3,
    meetingPlace: '山陽電鉄 須磨浦公園駅',
    meetingTime: '09:00',
    course: '須磨浦公園駅→旗振山→横尾山→須磨アルプス→高取山→鵯越駅',
    deadline: '2026-02-15',
    notes: 'お試し参加可。ヘッドランプ必携。雨天中止。',
    isDeleted: false,
    createdAt: '2026-01-20',
  },
  {
    id: 4,
    title: '雪山ハイキング講座 座学',
    mountainName: null,
    altitude: null,
    departmentId: 'education',
    clId: 4,
    slId: null,
    startDate: '2026-02-05',
    endDate: '2026-02-05',
    staminaGrade: '(^^)',
    skillGrade: 'なし',
    rockCategory: 'なし',
    requiredInsurance: 3,
    meetingPlace: '会事務所',
    meetingTime: '19:00',
    course: '講義形式',
    deadline: '2026-02-01',
    notes: '雪山ハイキング例会に初めて参加される方は必ず受講してください。',
    isDeleted: false,
    createdAt: '2026-01-05',
  },
  {
    id: 5,
    title: '納山祭',
    mountainName: '市ヶ原',
    altitude: null,
    departmentId: 'organization',
    clId: 2,
    slId: null,
    startDate: '2026-12-13',
    endDate: '2026-12-13',
    staminaGrade: '(^^)',
    skillGrade: 'なし',
    rockCategory: 'なし',
    requiredInsurance: 3,
    meetingPlace: 'JR新神戸駅',
    meetingTime: '09:00',
    course: '新神戸駅→市ヶ原→新神戸駅',
    deadline: '2026-12-06',
    notes: '会費2000円。食器・箸は必ず持参。',
    isDeleted: false,
    createdAt: '2026-11-01',
  },
]

/** 出席回答データ */
const INITIAL_ATTENDANCES = [
  {id: 1, eventId: 1, memberId: 3, status: 'attending', comment: '参加します！', updatedAt: '2026-01-20', isDeleted: false},
  {id: 2, eventId: 1, memberId: 5, status: 'attending', comment: '', updatedAt: '2026-01-21', isDeleted: false},
  {id: 3, eventId: 1, memberId: 6, status: 'attending', comment: '楽しみにしています', updatedAt: '2026-01-22', isDeleted: false},
  {id: 4, eventId: 1, memberId: 7, status: 'undecided', comment: '仕事の都合次第', updatedAt: '2026-01-23', isDeleted: false},
  {id: 5, eventId: 2, memberId: 5, status: 'attending', comment: '', updatedAt: '2026-01-15', isDeleted: false},
  {id: 6, eventId: 2, memberId: 7, status: 'attending', comment: '車出せます', updatedAt: '2026-01-16', isDeleted: false},
  {id: 7, eventId: 3, memberId: 3, status: 'attending', comment: '', updatedAt: '2026-02-01', isDeleted: false},
  {id: 8, eventId: 4, memberId: 3, status: 'attending', comment: '初参加です', updatedAt: '2026-01-28', isDeleted: false},
  {id: 9, eventId: 4, memberId: 8, status: 'attending', comment: '', updatedAt: '2026-01-29', isDeleted: false},
]

/** 例会記録データ（複数ファイル対応） */
const INITIAL_RECORDS = [
  {
    id: 1,
    eventId: 4,
    title: '雪山ハイキング講座 座学',
    date: '2026-02-05',
    weather: '晴れ',
    participants: 'CL 永末康史、新井公子、下垣内福世 計3名',
    status: 'published',
    authorId: 4,
    isDeleted: false,
    createdAt: '2026-02-06',
  },
]

/** 例会記録ファイルデータ（1記録に対して複数ファイルをアップロード可能） */
const INITIAL_RECORD_FILES = [
  {
    id: 1,
    recordId: 1,
    fileUrl: 'https://docs.google.com/document/d/xxxxx/edit',
    fileName: '2026-02-05_雪山ハイキング講座座学_記録.docx',
    fileType: 'google', // "google" | "pdf" | "docx"
    fileSize: null,
    mimeType: null,
    description: '本文',
    sortOrder: 0,
    isDeleted: false,
    createdAt: '2026-02-06',
  },
  {
    id: 2,
    recordId: 1,
    fileUrl: 'https://example.com/uploads/photos.pdf',
    fileName: '2026-02-05_雪山ハイキング講座座学_写真集.pdf',
    fileType: 'pdf',
    fileSize: 2048000,
    mimeType: 'application/pdf',
    description: '写真集',
    sortOrder: 1,
    isDeleted: false,
    createdAt: '2026-02-06',
  },
]

/** 装備品マスター */
const INITIAL_EQUIPMENT = [
  // テント
  {id: 1, name: 'テント 3人用 #1', categoryId: 'tent', condition: 'good', status: 'available', purchaseDate: '2023-04-01', notes: 'MSR製、軽量モデル', isDeleted: false},
  {id: 2, name: 'テント 3人用 #2', categoryId: 'tent', condition: 'needsCheck', status: 'available', purchaseDate: '2022-06-15', notes: 'ファスナー要確認', isDeleted: false},
  {id: 3, name: 'テント 4人用', categoryId: 'tent', condition: 'good', status: 'rented', purchaseDate: '2024-01-10', notes: 'モンベル製', isDeleted: false},
  // ロープ
  {id: 4, name: 'ザイル 50m #1', categoryId: 'rope', condition: 'good', status: 'available', purchaseDate: '2024-03-01', notes: '直径10mm、ドライ加工', isDeleted: false},
  {id: 5, name: 'ザイル 50m #2', categoryId: 'rope', condition: 'good', status: 'rented', purchaseDate: '2024-03-01', notes: '直径10mm、ドライ加工', isDeleted: false},
  // 無線機
  {id: 6, name: 'トランシーバー #1', categoryId: 'radio', condition: 'good', status: 'available', purchaseDate: '2023-08-01', notes: 'アイコム IC-R6', isDeleted: false},
  {id: 7, name: 'トランシーバー #2', categoryId: 'radio', condition: 'repairing', status: 'maintenance', purchaseDate: '2023-08-01', notes: '電池交換中', isDeleted: false},
  // 登攀具
  {id: 8, name: 'ヘルメット #1', categoryId: 'climbing', condition: 'good', status: 'rented', purchaseDate: '2024-05-01', notes: 'ペツル製', isDeleted: false},
  {id: 9, name: 'ヘルメット #2', categoryId: 'climbing', condition: 'good', status: 'available', purchaseDate: '2024-05-01', notes: 'ペツル製', isDeleted: false},
  // 調理器具
  {id: 10, name: 'コッヘルセット 大', categoryId: 'cooking', condition: 'good', status: 'available', purchaseDate: '2022-03-01', notes: '10人分対応', isDeleted: false},
  {id: 11, name: 'ガスバーナー #1', categoryId: 'cooking', condition: 'good', status: 'available', purchaseDate: '2023-09-01', notes: 'プリムス製', isDeleted: false},
  // その他
  {id: 12, name: 'ツェルト 2人用', categoryId: 'other', condition: 'good', status: 'available', purchaseDate: '2024-02-01', notes: '緊急用', isDeleted: false},
  {id: 13, name: 'GPS端末', categoryId: 'other', condition: 'needsCheck', status: 'available', purchaseDate: '2021-11-01', notes: 'Garmin、ファームウェア更新要', isDeleted: false},
]

/** 装備貸出履歴 */
const INITIAL_RENTALS = [
  {id: 1, equipmentId: 3, memberId: 2, eventId: 2, rentDate: '2026-02-12', dueDate: '2026-02-17', returnDate: null, notes: '西穂高岳で使用', isDeleted: false},
  {id: 2, equipmentId: 5, memberId: 5, eventId: 2, rentDate: '2026-02-12', dueDate: '2026-02-17', returnDate: null, notes: '', isDeleted: false},
  {id: 3, equipmentId: 8, memberId: 7, eventId: null, rentDate: '2026-01-20', dueDate: '2026-01-25', returnDate: null, notes: '個人練習用（期限超過中）', isDeleted: false},
  {id: 4, equipmentId: 4, memberId: 3, eventId: 1, rentDate: '2026-02-01', dueDate: '2026-02-08', returnDate: '2026-02-08', notes: 'クリーンハイクで使用', isDeleted: false},
]

// =============================================================================
// ユーティリティ
// =============================================================================

/** 日付フォーマット */
const formatDate = dateStr => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  return `${d.getMonth() + 1}/${d.getDate()}(${weekdays[d.getDay()]})`
}

/** 日付範囲フォーマット */
const formatDateRange = (start, end) => {
  if (start === end) return formatDate(start)
  return `${formatDate(start)}〜${formatDate(end)}`
}

/** ID生成 */
const generateId = arr => Math.max(0, ...arr.map(x => x.id)) + 1

// =============================================================================
// 共通UIコンポーネント
// =============================================================================

/** モーダル */
const Modal = ({isOpen, onClose, title, children, size = 'md'}) => {
  if (!isOpen) return null
  const sizeClass = size === 'lg' ? 'max-w-4xl' : size === 'sm' ? 'max-w-md' : 'max-w-2xl'
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className={`bg-white rounded-lg shadow-xl w-full ${sizeClass} max-h-[90vh] overflow-hidden`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            &times;
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">{children}</div>
      </div>
    </div>
  )
}

/** バッジ */
const Badge = ({children, color, bgColor}) => (
  <span className="px-2 py-0.5 rounded text-xs font-medium" style={{color, backgroundColor: bgColor}}>
    {children}
  </span>
)

/** ボタン */
const Button = ({children, variant = 'primary', size = 'md', onClick, disabled, className = ''}) => {
  const baseClass = 'rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const sizeClass = size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'
  const variantClass = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
  }[variant]
  return (
    <button className={`${baseClass} ${sizeClass} ${variantClass} ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

/** カード */
const Card = ({children, className = ''}) => <div className={`bg-white rounded-lg shadow border ${className}`}>{children}</div>

/** 入力フィールド */
const FormField = ({label, required, children}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
)

/** テキストインプット */
const Input = ({type = 'text', value, onChange, placeholder, className = ''}) => (
  <input
    type={type}
    value={value || ''}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  />
)

/** セレクト */
const Select = ({value, onChange, options, placeholder, className = ''}) => (
  <select
    value={value || ''}
    onChange={e => onChange(e.target.value)}
    className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options.map(opt => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
)

/** テキストエリア */
const Textarea = ({value, onChange, placeholder, rows = 3, className = ''}) => (
  <textarea
    value={value || ''}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  />
)

// =============================================================================
// メインコンポーネント
// =============================================================================

export default function YamanokaiMock() {
  // ログインユーザー（切り替え可能）
  const [currentUserId, setCurrentUserId] = useState(3) // デフォルトは一般会員
  const currentUser = INITIAL_MEMBERS.find(m => m.id === currentUserId)

  // メニュー状態
  const [activeMenu, setActiveMenu] = useState('member-calendar')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // データ状態
  const [events, setEvents] = useState(INITIAL_EVENTS)
  const [attendances, setAttendances] = useState(INITIAL_ATTENDANCES)
  const [records, setRecords] = useState(INITIAL_RECORDS)
  const [recordFiles, setRecordFiles] = useState(INITIAL_RECORD_FILES)
  const [equipment, setEquipment] = useState(INITIAL_EQUIPMENT)
  const [rentals, setRentals] = useState(INITIAL_RENTALS)

  // 有効なデータのみフィルタ（ソフトデリート対応）
  const activeEvents = useMemo(() => events.filter(e => !e.isDeleted), [events])
  const activeAttendances = useMemo(() => attendances.filter(a => !a.isDeleted), [attendances])
  const activeRecords = useMemo(() => records.filter(r => !r.isDeleted), [records])
  const activeRecordFiles = useMemo(() => recordFiles.filter(f => !f.isDeleted), [recordFiles])
  const activeEquipment = useMemo(() => equipment.filter(e => !e.isDeleted), [equipment])
  const activeRentals = useMemo(() => rentals.filter(r => !r.isDeleted), [rentals])

  // 装備貸出処理
  const handleRent = (equipmentId, memberId, dueDate, eventId, notes) => {
    // 装備のステータスを貸出中に変更
    setEquipment(prev => prev.map(e => (e.id === equipmentId ? {...e, status: 'rented'} : e)))
    // 貸出記録を追加
    setRentals(prev => [
      ...prev,
      {
        id: generateId(prev),
        equipmentId,
        memberId,
        eventId: eventId || null,
        rentDate: new Date().toISOString().split('T')[0],
        dueDate,
        returnDate: null,
        notes: notes || '',
        isDeleted: false,
      },
    ])
  }

  // 装備返却処理
  const handleReturn = rentalId => {
    const rental = rentals.find(r => r.id === rentalId)
    if (rental) {
      // 装備のステータスを貸出可に変更
      setEquipment(prev => prev.map(e => (e.id === rental.equipmentId ? {...e, status: 'available'} : e)))
      // 返却日を記録
      setRentals(prev =>
        prev.map(r => (r.id === rentalId ? {...r, returnDate: new Date().toISOString().split('T')[0]} : r))
      )
    }
  }

  // メニュー定義
  const menuItems = [
    {type: 'header', label: '例会（管理者）', adminOnly: true},
    {id: 'admin-list', label: '例会一覧', icon: '📋', adminOnly: true},
    {id: 'admin-create', label: '例会の新規作成', icon: '➕', adminOnly: true},
    {type: 'divider', adminOnly: true},
    {type: 'header', label: '装備品（管理者）', adminOnly: true},
    {id: 'admin-equipment', label: '装備一覧', icon: '🎒', adminOnly: true},
    {id: 'admin-equipment-create', label: '装備の新規登録', icon: '➕', adminOnly: true},
    {type: 'divider', adminOnly: true},
    {type: 'header', label: '例会（一般会員）'},
    {id: 'member-calendar', label: '例会スケジュール', icon: '📅'},
    {id: 'member-attendance', label: '出席回答履歴', icon: '✋'},
    {id: 'member-records', label: '例会記録', icon: '📖'},
    {type: 'divider'},
    {type: 'header', label: '装備品（一般会員）'},
    {id: 'member-equipment', label: '装備貸出・返却', icon: '🎒'},
    {id: 'member-my-rentals', label: '貸出履歴', icon: '📝'},
    {type: 'divider'},
    {type: 'header', label: 'システム情報'},
    {id: 'data-structure', label: 'データ構造図', icon: '🗂️'},
  ]

  // フィルタされたメニュー
  const filteredMenu = menuItems.filter(item => !item.adminOnly || currentUser?.isAdmin)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* サイドバー */}
      <aside
        className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-white border-r transition-all duration-300 overflow-hidden flex-shrink-0`}
      >
        <div className="p-4 border-b">
          <h1 className="text-lg font-bold text-gray-800">🏔️ 山の会（KCAC）</h1>
          <p className="text-xs text-gray-500 mt-1">例会管理システム</p>
        </div>

        {/* ユーザー切り替え */}
        <div className="p-4 border-b bg-gray-50">
          <label className="block text-xs text-gray-500 mb-1">ログインユーザー</label>
          <select
            value={currentUserId}
            onChange={e => setCurrentUserId(Number(e.target.value))}
            className="w-full text-sm border rounded px-2 py-1"
          >
            {INITIAL_MEMBERS.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} {m.isAdmin ? '👑' : ''}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">{currentUser?.isAdmin ? '管理者権限あり' : '一般会員'}</p>
        </div>

        {/* メニュー */}
        <nav className="p-2">
          {filteredMenu.map((item, idx) => {
            if (item.type === 'header') {
              return (
                <div key={idx} className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider mt-4 first:mt-0">
                  {item.label}
                </div>
              )
            }
            if (item.type === 'divider') {
              return <hr key={idx} className="my-2" />
            }
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2 transition-colors ${
                  activeMenu === item.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 overflow-auto">
        {/* ヘッダー */}
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500 hover:text-gray-700">
              {isSidebarOpen ? '◀' : '▶'}
            </button>
            <h2 className="text-xl font-bold">{filteredMenu.find(m => m.id === activeMenu)?.label || 'ダッシュボード'}</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>👤 {currentUser?.name}</span>
            {currentUser?.isAdmin && (
              <Badge color="#3b82f6" bgColor="#dbeafe">
                管理者
              </Badge>
            )}
          </div>
        </header>

        {/* コンテンツエリア */}
        <div className="p-6">
          {activeMenu === 'admin-list' && (
            <AdminEventList
              events={activeEvents}
              attendances={activeAttendances}
              records={activeRecords}
              members={INITIAL_MEMBERS}
              onUpdate={(id, data) => setEvents(prev => prev.map(e => (e.id === id ? {...e, ...data} : e)))}
              onDelete={id => setEvents(prev => prev.map(e => (e.id === id ? {...e, isDeleted: true} : e)))}
            />
          )}
          {activeMenu === 'admin-create' && (
            <AdminEventForm
              members={INITIAL_MEMBERS}
              onSave={data => {
                const newEvent = {
                  ...data,
                  id: generateId(events),
                  createdAt: new Date().toISOString().split('T')[0],
                  isDeleted: false,
                }
                setEvents(prev => [...prev, newEvent])
                setActiveMenu('admin-list')
              }}
            />
          )}
          {activeMenu === 'member-calendar' && (
            <MemberCalendar
              events={activeEvents}
              attendances={activeAttendances}
              records={activeRecords}
              members={INITIAL_MEMBERS}
              currentUserId={currentUserId}
              onAttendanceUpdate={(eventId, status, comment) => {
                const existing = attendances.find(a => a.eventId === eventId && a.memberId === currentUserId && !a.isDeleted)
                if (existing) {
                  setAttendances(prev =>
                    prev.map(a =>
                      a.id === existing.id ? {...a, status, comment, updatedAt: new Date().toISOString().split('T')[0]} : a
                    )
                  )
                } else {
                  setAttendances(prev => [
                    ...prev,
                    {
                      id: generateId(prev),
                      eventId,
                      memberId: currentUserId,
                      status,
                      comment,
                      updatedAt: new Date().toISOString().split('T')[0],
                      isDeleted: false,
                    },
                  ])
                }
              }}
            />
          )}
          {activeMenu === 'member-attendance' && (
            <MemberAttendanceHistory
              events={activeEvents}
              attendances={activeAttendances}
              currentUserId={currentUserId}
              onUpdate={(attendanceId, status, comment) => {
                setAttendances(prev =>
                  prev.map(a =>
                    a.id === attendanceId ? {...a, status, comment, updatedAt: new Date().toISOString().split('T')[0]} : a
                  )
                )
              }}
            />
          )}
          {activeMenu === 'member-records' && (
            <MemberRecords
              events={activeEvents}
              records={activeRecords}
              recordFiles={activeRecordFiles}
              members={INITIAL_MEMBERS}
              currentUserId={currentUserId}
              onSave={(data, files) => {
                let recordId
                if (data.id) {
                  setRecords(prev => prev.map(r => (r.id === data.id ? {...r, ...data} : r)))
                  recordId = data.id
                } else {
                  recordId = generateId(records)
                  setRecords(prev => [
                    ...prev,
                    {...data, id: recordId, createdAt: new Date().toISOString().split('T')[0], isDeleted: false},
                  ])
                }
                // ファイルの保存
                if (files && files.length > 0) {
                  const newFiles = files.map((f, idx) => ({
                    ...f,
                    id: generateId(recordFiles) + idx,
                    recordId,
                    createdAt: new Date().toISOString().split('T')[0],
                    isDeleted: false,
                  }))
                  setRecordFiles(prev => [...prev.filter(f => f.recordId !== recordId), ...newFiles])
                }
              }}
              onDelete={id => setRecords(prev => prev.map(r => (r.id === id ? {...r, isDeleted: true} : r)))}
              onDeleteFile={fileId => setRecordFiles(prev => prev.map(f => (f.id === fileId ? {...f, isDeleted: true} : f)))}
            />
          )}
          {activeMenu === 'admin-equipment' && (
            <AdminEquipmentList
              equipment={activeEquipment}
              rentals={activeRentals}
              members={INITIAL_MEMBERS}
              events={activeEvents}
              onUpdate={(id, data) => setEquipment(prev => prev.map(e => (e.id === id ? {...e, ...data} : e)))}
              onDelete={id => setEquipment(prev => prev.map(e => (e.id === id ? {...e, isDeleted: true} : e)))}
            />
          )}
          {activeMenu === 'admin-equipment-create' && (
            <AdminEquipmentForm
              onSave={data => {
                const newEquipment = {
                  ...data,
                  id: generateId(equipment),
                  isDeleted: false,
                }
                setEquipment(prev => [...prev, newEquipment])
                setActiveMenu('admin-equipment')
              }}
            />
          )}
          {activeMenu === 'member-equipment' && (
            <MemberEquipmentRental
              equipment={activeEquipment}
              rentals={activeRentals}
              members={INITIAL_MEMBERS}
              events={activeEvents}
              currentUserId={currentUserId}
              onRent={handleRent}
              onReturn={handleReturn}
            />
          )}
          {activeMenu === 'member-my-rentals' && (
            <MemberMyRentals
              equipment={activeEquipment}
              rentals={activeRentals}
              events={activeEvents}
              currentUserId={currentUserId}
            />
          )}
          {activeMenu === 'data-structure' && <DataStructureDiagram />}
        </div>
      </main>
    </div>
  )
}

// =============================================================================
// 管理者: 例会一覧
// =============================================================================

function AdminEventList({events, attendances, records, members, onUpdate, onDelete}) {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [editingEvent, setEditingEvent] = useState(null)
  const [filterDept, setFilterDept] = useState('')

  const filteredEvents = filterDept ? events.filter(e => e.departmentId === filterDept) : events

  const sortedEvents = [...filteredEvents].sort((a, b) => new Date(a.startDate) - new Date(b.startDate))

  const getAttendanceSummary = eventId => {
    const eventAttendances = attendances.filter(a => a.eventId === eventId)
    const responded = eventAttendances.length
    return {
      total: members.length,
      responded,
      noResponse: members.length - responded,
      attending: eventAttendances.filter(a => a.status === 'attending').length,
      notAttending: eventAttendances.filter(a => a.status === 'notAttending').length,
      undecided: eventAttendances.filter(a => a.status === 'undecided').length,
    }
  }

  const getMemberName = id => members.find(m => m.id === id)?.name || ''

  return (
    <div className="space-y-4">
      {/* フィルター */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">部署で絞り込み:</label>
          <Select
            value={filterDept}
            onChange={setFilterDept}
            placeholder="すべて"
            options={Object.values(DEPARTMENTS).map(d => ({value: d.id, label: d.name}))}
            className="w-48"
          />
          <span className="text-sm text-gray-500">全{filteredEvents.length}件</span>
        </div>
      </Card>

      {/* 例会リスト */}
      <div className="space-y-2">
        {sortedEvents.map(event => {
          const dept = DEPARTMENTS[event.departmentId]
          const summary = getAttendanceSummary(event.id)
          const hasRecord = records.some(r => r.eventId === event.id)

          return (
            <Card key={event.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge color={dept.color} bgColor={dept.bgColor}>
                      {dept.name}
                    </Badge>
                    <span className="text-sm text-gray-500">{formatDateRange(event.startDate, event.endDate)}</span>
                    {hasRecord && (
                      <Badge color="#22c55e" bgColor="#dcfce7">
                        記録あり
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-bold text-lg">{event.title}</h3>
                  {event.mountainName && (
                    <p className="text-gray-600">
                      {event.mountainName} {event.altitude}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>CL: {getMemberName(event.clId)}</span>
                    {event.slId && <span>SL: {getMemberName(event.slId)}</span>}
                    <span>
                      グレード: {event.staminaGrade}
                      {event.skillGrade !== 'なし' && ` ${event.skillGrade}`}
                    </span>
                  </div>
                </div>

                {/* 出席状況サマリー */}
                <div className="text-center ml-4">
                  <div className="text-2xl font-bold text-green-600">{summary.attending}</div>
                  <div className="text-xs text-gray-500">出席</div>
                  <div className="text-xs text-gray-400 mt-1">
                    未回答{summary.noResponse} / 未定{summary.undecided} / 欠席{summary.notAttending}
                  </div>
                </div>

                {/* アクション */}
                <div className="flex flex-col gap-1 ml-4">
                  <Button size="sm" variant="secondary" onClick={() => setSelectedEvent(event)}>
                    詳細
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setEditingEvent(event)}>
                    編集
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => onDelete(event.id)}>
                    削除
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* 詳細モーダル */}
      <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="例会詳細" size="lg">
        {selectedEvent && (
          <AdminEventDetail
            event={selectedEvent}
            attendances={attendances.filter(a => a.eventId === selectedEvent.id)}
            members={members}
          />
        )}
      </Modal>

      {/* 編集モーダル */}
      <Modal isOpen={!!editingEvent} onClose={() => setEditingEvent(null)} title="例会編集" size="lg">
        {editingEvent && (
          <AdminEventForm
            initialData={editingEvent}
            members={members}
            onSave={data => {
              onUpdate(editingEvent.id, data)
              setEditingEvent(null)
            }}
            onCancel={() => setEditingEvent(null)}
          />
        )}
      </Modal>
    </div>
  )
}

// =============================================================================
// 管理者: 例会詳細
// =============================================================================

function AdminEventDetail({event, attendances, members}) {
  const dept = DEPARTMENTS[event.departmentId]
  const getMemberName = id => members.find(m => m.id === id)?.name || ''

  return (
    <div className="space-y-6">
      {/* 基本情報 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-bold text-sm text-gray-500">山名・タイトル</h4>
          <p>{event.title}</p>
          {event.mountainName && (
            <p className="text-gray-600">
              {event.mountainName} {event.altitude}
            </p>
          )}
        </div>
        <div>
          <h4 className="font-bold text-sm text-gray-500">担当部</h4>
          <Badge color={dept.color} bgColor={dept.bgColor}>
            {dept.name}
          </Badge>
        </div>
        <div>
          <h4 className="font-bold text-sm text-gray-500">日程</h4>
          <p>{formatDateRange(event.startDate, event.endDate)}</p>
        </div>
        <div>
          <h4 className="font-bold text-sm text-gray-500">申込期限</h4>
          <p>{formatDate(event.deadline)}</p>
        </div>
        <div>
          <h4 className="font-bold text-sm text-gray-500">CL / SL</h4>
          <p>
            {getMemberName(event.clId)} {event.slId && `/ ${getMemberName(event.slId)}`}
          </p>
        </div>
        <div>
          <h4 className="font-bold text-sm text-gray-500">グレード</h4>
          <p>
            体力: {event.staminaGrade} / 技術: {event.skillGrade} / 岩: {event.rockCategory}
          </p>
        </div>
        <div>
          <h4 className="font-bold text-sm text-gray-500">集合</h4>
          <p>
            {event.meetingPlace} {event.meetingTime}
          </p>
        </div>
        <div>
          <h4 className="font-bold text-sm text-gray-500">必要保険口数</h4>
          <p>{event.requiredInsurance}口以上</p>
        </div>
      </div>

      <div>
        <h4 className="font-bold text-sm text-gray-500">コース</h4>
        <p className="whitespace-pre-wrap">{event.course}</p>
      </div>

      {event.notes && (
        <div>
          <h4 className="font-bold text-sm text-gray-500">備考</h4>
          <p className="whitespace-pre-wrap">{event.notes}</p>
        </div>
      )}

      {/* 出席回答一覧 */}
      <div>
        <h4 className="font-bold text-sm text-gray-500 mb-2">出席回答一覧 ({attendances.length}件)</h4>
        <div className="border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">会員名</th>
                <th className="px-4 py-2 text-left">ステータス</th>
                <th className="px-4 py-2 text-left">コメント</th>
                <th className="px-4 py-2 text-left">更新日</th>
              </tr>
            </thead>
            <tbody>
              {attendances.map(att => {
                const status = ATTENDANCE_STATUS[att.status]
                return (
                  <tr key={att.id} className="border-t">
                    <td className="px-4 py-2">{getMemberName(att.memberId)}</td>
                    <td className="px-4 py-2">
                      <Badge color={status.color} bgColor={status.bgColor}>
                        {status.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-gray-600">{att.comment || '-'}</td>
                    <td className="px-4 py-2 text-gray-500">{att.updatedAt}</td>
                  </tr>
                )
              })}
              {attendances.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                    まだ回答がありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// 管理者: 例会フォーム（新規作成・編集共通）
// =============================================================================

function AdminEventForm({initialData, members, onSave, onCancel}) {
  const [form, setForm] = useState(
    initialData || {
      title: '',
      mountainName: '',
      altitude: '',
      departmentId: '',
      clId: '',
      slId: '',
      startDate: '',
      endDate: '',
      staminaGrade: 'O',
      skillGrade: 'なし',
      rockCategory: 'なし',
      requiredInsurance: 3,
      meetingPlace: '',
      meetingTime: '',
      course: '',
      deadline: '',
      notes: '',
    }
  )

  const updateForm = (key, value) => setForm(prev => ({...prev, [key]: value}))

  const handleSubmit = e => {
    e.preventDefault()
    onSave({
      ...form,
      clId: Number(form.clId),
      slId: form.slId ? Number(form.slId) : null,
      requiredInsurance: Number(form.requiredInsurance),
    })
  }

  const isValid =
    form.title && form.departmentId && form.clId && form.startDate && form.meetingPlace && form.meetingTime && form.deadline

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="タイトル" required>
          <Input value={form.title} onChange={v => updateForm('title', v)} placeholder="例: クリーンハイク" />
        </FormField>
        <FormField label="担当部" required>
          <Select
            value={form.departmentId}
            onChange={v => updateForm('departmentId', v)}
            placeholder="選択してください"
            options={Object.values(DEPARTMENTS).map(d => ({value: d.id, label: d.name}))}
          />
        </FormField>
        <FormField label="山名">
          <Input value={form.mountainName} onChange={v => updateForm('mountainName', v)} placeholder="例: 六甲山系" />
        </FormField>
        <FormField label="標高">
          <Input value={form.altitude} onChange={v => updateForm('altitude', v)} placeholder="例: 931m" />
        </FormField>
        <FormField label="CL（チーフリーダー）" required>
          <Select
            value={form.clId}
            onChange={v => updateForm('clId', v)}
            placeholder="選択してください"
            options={members.map(m => ({value: m.id, label: m.name}))}
          />
        </FormField>
        <FormField label="SL（サブリーダー）">
          <Select
            value={form.slId}
            onChange={v => updateForm('slId', v)}
            placeholder="なし"
            options={[{value: '', label: 'なし'}, ...members.map(m => ({value: m.id, label: m.name}))]}
          />
        </FormField>
        <FormField label="開始日" required>
          <Input type="date" value={form.startDate} onChange={v => updateForm('startDate', v)} />
        </FormField>
        <FormField label="終了日">
          <Input type="date" value={form.endDate || form.startDate} onChange={v => updateForm('endDate', v)} />
        </FormField>
        <FormField label="体力度グレード">
          <Select
            value={form.staminaGrade}
            onChange={v => updateForm('staminaGrade', v)}
            options={STAMINA_GRADES.map(g => ({value: g, label: g}))}
          />
        </FormField>
        <FormField label="技術度グレード">
          <Select
            value={form.skillGrade}
            onChange={v => updateForm('skillGrade', v)}
            options={SKILL_GRADES.map(g => ({value: g, label: g}))}
          />
        </FormField>
        <FormField label="岩登り区分">
          <Select
            value={form.rockCategory}
            onChange={v => updateForm('rockCategory', v)}
            options={ROCK_CATEGORIES.map(g => ({value: g, label: g}))}
          />
        </FormField>
        <FormField label="必要保険口数">
          <Select
            value={form.requiredInsurance}
            onChange={v => updateForm('requiredInsurance', v)}
            options={[
              {value: 3, label: '3口（ハイキング）'},
              {value: 4, label: '4口（岩A・沢入門）'},
              {value: 8, label: '8口（アルパイン・雪山・岩BC・沢）'},
            ]}
          />
        </FormField>
        <FormField label="集合場所" required>
          <Input value={form.meetingPlace} onChange={v => updateForm('meetingPlace', v)} placeholder="例: JR新神戸駅" />
        </FormField>
        <FormField label="集合時間" required>
          <Input type="time" value={form.meetingTime} onChange={v => updateForm('meetingTime', v)} />
        </FormField>
        <FormField label="申込期限" required>
          <Input type="date" value={form.deadline} onChange={v => updateForm('deadline', v)} />
        </FormField>
      </div>

      <FormField label="コース">
        <Textarea value={form.course} onChange={v => updateForm('course', v)} rows={3} placeholder="行程を記入" />
      </FormField>

      <FormField label="備考">
        <Textarea value={form.notes} onChange={v => updateForm('notes', v)} rows={3} placeholder="持ち物、注意事項など" />
      </FormField>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            キャンセル
          </Button>
        )}
        <Button type="submit" disabled={!isValid}>
          {initialData ? '更新する' : '作成する'}
        </Button>
      </div>
    </form>
  )
}

// =============================================================================
// 一般会員: 例会スケジュール（カレンダービュー）
// =============================================================================

function MemberCalendar({events, attendances, records, members, currentUserId, onAttendanceUpdate}) {
  const [viewMonth, setViewMonth] = useState(new Date(2026, 1, 1)) // 2026年2月
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [attendanceModal, setAttendanceModal] = useState(null)

  // カレンダー生成
  const calendarDays = useMemo(() => {
    const year = viewMonth.getFullYear()
    const month = viewMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPadding = firstDay.getDay()

    const days = []
    // 前月のパディング
    for (let i = 0; i < startPadding; i++) {
      const d = new Date(year, month, -startPadding + i + 1)
      days.push({date: d, isCurrentMonth: false})
    }
    // 当月
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({date: new Date(year, month, i), isCurrentMonth: true})
    }
    // 次月のパディング（6週分に揃える）
    while (days.length < 42) {
      const d = new Date(year, month + 1, days.length - lastDay.getDate() - startPadding + 1)
      days.push({date: d, isCurrentMonth: false})
    }
    return days
  }, [viewMonth])

  // 日付の例会を取得
  const getEventsForDate = date => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(e => {
      return dateStr >= e.startDate && dateStr <= (e.endDate || e.startDate)
    })
  }

  // ユーザーの回答を取得
  const getMyAttendance = eventId => {
    return attendances.find(a => a.eventId === eventId && a.memberId === currentUserId)
  }

  return (
    <div className="space-y-4">
      {/* 月切り替え */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
          >
            ← 前月
          </Button>
          <h3 className="text-xl font-bold">
            {viewMonth.getFullYear()}年{viewMonth.getMonth() + 1}月
          </h3>
          <Button
            variant="secondary"
            onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
          >
            次月 →
          </Button>
        </div>
      </Card>

      {/* カレンダー */}
      <Card className="overflow-hidden">
        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 bg-gray-50 border-b">
          {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
            <div
              key={day}
              className={`p-2 text-center text-sm font-medium ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : ''}`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* カレンダー本体 */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            const dayEvents = getEventsForDate(day.date)
            const isToday = day.date.toDateString() === new Date().toDateString()

            return (
              <div
                key={idx}
                className={`min-h-[100px] border-b border-r p-1 ${!day.isCurrentMonth ? 'bg-gray-50' : ''} ${isToday ? 'bg-blue-50' : ''}`}
              >
                <div className={`text-sm mb-1 ${!day.isCurrentMonth ? 'text-gray-300' : ''}`}>{day.date.getDate()}</div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => {
                    const dept = DEPARTMENTS[event.departmentId]
                    const myAtt = getMyAttendance(event.id)
                    const attStatus = myAtt ? ATTENDANCE_STATUS[myAtt.status] : null

                    return (
                      <div
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className="text-xs p-1 rounded cursor-pointer truncate hover:opacity-80"
                        style={{backgroundColor: dept.bgColor, color: dept.color, borderLeft: `3px solid ${dept.color}`}}
                        title={event.title}
                      >
                        <span className="font-medium">{event.title}</span>
                        {attStatus && (
                          <span className="ml-1" style={{color: attStatus.color}}>
                            ●
                          </span>
                        )}
                      </div>
                    )
                  })}
                  {dayEvents.length > 3 && <div className="text-xs text-gray-400 pl-1">+{dayEvents.length - 3}件</div>}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* 凡例 */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="font-medium">部署:</span>
          {Object.values(DEPARTMENTS).map(dept => (
            <span key={dept.id} className="flex items-center gap-1">
              <span className="w-3 h-3 rounded" style={{backgroundColor: dept.bgColor, border: `1px solid ${dept.color}`}}></span>
              {dept.name}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 text-sm mt-2">
          <span className="font-medium">回答状況:</span>
          {Object.values(ATTENDANCE_STATUS).map(st => (
            <span key={st.id} className="flex items-center gap-1">
              <span style={{color: st.color}}>●</span>
              {st.label}
            </span>
          ))}
        </div>
      </Card>

      {/* 例会詳細モーダル */}
      <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="例会詳細" size="lg">
        {selectedEvent && (
          <div className="space-y-6">
            <MemberEventDetail event={selectedEvent} members={members} />

            {/* 自分の出席回答 */}
            <div className="border-t pt-4">
              <h4 className="font-bold mb-3">出席回答</h4>
              {(() => {
                const myAtt = getMyAttendance(selectedEvent.id)
                const attStatus = myAtt ? ATTENDANCE_STATUS[myAtt.status] : ATTENDANCE_STATUS.pending
                return (
                  <div className="flex items-center gap-4">
                    <span>現在の回答:</span>
                    <Badge color={attStatus.color} bgColor={attStatus.bgColor}>
                      {attStatus.label}
                    </Badge>
                    <Button size="sm" onClick={() => setAttendanceModal({event: selectedEvent, attendance: myAtt})}>
                      {myAtt ? '回答を変更' : '回答する'}
                    </Button>
                  </div>
                )
              })()}
            </div>

            {/* 例会記録へのリンク */}
            {records.some(r => r.eventId === selectedEvent.id) && (
              <div className="border-t pt-4">
                <h4 className="font-bold mb-2">例会記録</h4>
                <p className="text-sm text-gray-600">この例会の記録があります。「例会記録」メニューから確認できます。</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 出席回答モーダル */}
      <Modal isOpen={!!attendanceModal} onClose={() => setAttendanceModal(null)} title="出席回答" size="sm">
        {attendanceModal && (
          <AttendanceForm
            event={attendanceModal.event}
            attendance={attendanceModal.attendance}
            onSave={(status, comment) => {
              onAttendanceUpdate(attendanceModal.event.id, status, comment)
              setAttendanceModal(null)
              setSelectedEvent(null)
            }}
            onCancel={() => setAttendanceModal(null)}
          />
        )}
      </Modal>
    </div>
  )
}

// =============================================================================
// 一般会員: 例会詳細表示
// =============================================================================

function MemberEventDetail({event, members}) {
  const dept = DEPARTMENTS[event.departmentId]
  const getMemberName = id => members.find(m => m.id === id)?.name || ''

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge color={dept.color} bgColor={dept.bgColor}>
          {dept.name}
        </Badge>
        <span className="text-gray-500">{formatDateRange(event.startDate, event.endDate)}</span>
      </div>

      <h3 className="text-xl font-bold">{event.title}</h3>
      {event.mountainName && (
        <p className="text-gray-600">
          {event.mountainName} {event.altitude}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">CL:</span> {getMemberName(event.clId)}
        </div>
        {event.slId && (
          <div>
            <span className="text-gray-500">SL:</span> {getMemberName(event.slId)}
          </div>
        )}
        <div>
          <span className="text-gray-500">集合:</span> {event.meetingPlace} {event.meetingTime}
        </div>
        <div>
          <span className="text-gray-500">申込期限:</span> {formatDate(event.deadline)}
        </div>
        <div>
          <span className="text-gray-500">グレード:</span> 体力{event.staminaGrade}
          {event.skillGrade !== 'なし' && ` / 技術${event.skillGrade}`}
          {event.rockCategory !== 'なし' && ` / 岩${event.rockCategory}`}
        </div>
        <div>
          <span className="text-gray-500">必要保険:</span> {event.requiredInsurance}口以上
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-500 text-sm">コース</h4>
        <p className="whitespace-pre-wrap">{event.course}</p>
      </div>

      {event.notes && (
        <div>
          <h4 className="font-medium text-gray-500 text-sm">備考</h4>
          <p className="whitespace-pre-wrap">{event.notes}</p>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// 出席回答フォーム
// =============================================================================

function AttendanceForm({event, attendance, onSave, onCancel}) {
  const [status, setStatus] = useState(attendance?.status || 'pending')
  const [comment, setComment] = useState(attendance?.comment || '')

  return (
    <div className="space-y-4">
      <p className="text-gray-600">
        {event.title} ({formatDateRange(event.startDate, event.endDate)})
      </p>

      <FormField label="出席">
        <div className="flex gap-2">
          {Object.values(ATTENDANCE_STATUS)
            .filter(s => s.id !== 'pending')
            .map(st => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatus(st.id)}
                className={`flex-1 py-2 rounded border-2 transition-colors ${
                  status === st.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                style={status === st.id ? {borderColor: st.color, backgroundColor: st.bgColor} : {}}
              >
                {st.label}
              </button>
            ))}
        </div>
      </FormField>

      <FormField label="コメント">
        <Textarea value={comment} onChange={setComment} placeholder="コメントがあれば入力" rows={2} />
      </FormField>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          キャンセル
        </Button>
        <Button onClick={() => onSave(status, comment)} disabled={status === 'pending'}>
          回答する
        </Button>
      </div>
    </div>
  )
}

// =============================================================================
// 一般会員: 出席回答履歴
// =============================================================================

function MemberAttendanceHistory({events, attendances, currentUserId, onUpdate}) {
  const [editingId, setEditingId] = useState(null)
  const [editStatus, setEditStatus] = useState('')
  const [editComment, setEditComment] = useState('')

  const myAttendances = attendances.filter(a => a.memberId === currentUserId)

  const getEvent = eventId => events.find(e => e.id === eventId)

  const handleEdit = att => {
    setEditingId(att.id)
    setEditStatus(att.status)
    setEditComment(att.comment)
  }

  const handleSave = () => {
    onUpdate(editingId, editStatus, editComment)
    setEditingId(null)
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <p className="text-gray-600">あなたの出席回答履歴です。回答を変更することもできます。</p>
      </Card>

      <div className="space-y-2">
        {myAttendances.length === 0 ? (
          <Card className="p-8 text-center text-gray-400">まだ出席回答がありません</Card>
        ) : (
          myAttendances.map(att => {
            const event = getEvent(att.eventId)
            if (!event) return null
            const dept = DEPARTMENTS[event.departmentId]
            const status = ATTENDANCE_STATUS[att.status]
            const isEditing = editingId === att.id

            return (
              <Card key={att.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge color={dept.color} bgColor={dept.bgColor}>
                        {dept.name}
                      </Badge>
                      <span className="text-sm text-gray-500">{formatDateRange(event.startDate, event.endDate)}</span>
                    </div>
                    <h4 className="font-bold">{event.title}</h4>

                    {isEditing ? (
                      <div className="mt-3 space-y-3">
                        <div className="flex gap-2">
                          {Object.values(ATTENDANCE_STATUS)
                            .filter(s => s.id !== 'pending')
                            .map(st => (
                              <button
                                key={st.id}
                                type="button"
                                onClick={() => setEditStatus(st.id)}
                                className={`px-3 py-1 rounded border-2 text-sm ${
                                  editStatus === st.id ? 'border-blue-500' : 'border-gray-200'
                                }`}
                                style={editStatus === st.id ? {borderColor: st.color, backgroundColor: st.bgColor} : {}}
                              >
                                {st.label}
                              </button>
                            ))}
                        </div>
                        <Input value={editComment} onChange={setEditComment} placeholder="コメント" />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSave}>
                            保存
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>
                            キャンセル
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 flex items-center gap-4">
                        <Badge color={status.color} bgColor={status.bgColor}>
                          {status.label}
                        </Badge>
                        {att.comment && <span className="text-sm text-gray-600">{att.comment}</span>}
                        <span className="text-xs text-gray-400">更新: {att.updatedAt}</span>
                      </div>
                    )}
                  </div>

                  {!isEditing && (
                    <Button size="sm" variant="secondary" onClick={() => handleEdit(att)}>
                      編集
                    </Button>
                  )}
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

// =============================================================================
// 一般会員: 例会記録
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function MemberRecords({events, records, recordFiles, members, currentUserId, onSave, onDelete, onDeleteFile}) {
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [editingRecord, setEditingRecord] = useState(null)
  const [isCreating, setIsCreating] = useState(false)

  const getMemberName = id => members.find(m => m.id === id)?.name || ''
  const getEvent = eventId => events.find(e => e.id === eventId)
  const getRecordFiles = recordId => recordFiles.filter(f => f.recordId === recordId).sort((a, b) => a.sortOrder - b.sortOrder)

  // 記録がない過去の例会（記録作成候補）
  const pastEventsWithoutRecord = events.filter(e => {
    const isPast = new Date(e.endDate || e.startDate) < new Date()
    const hasRecord = records.some(r => r.eventId === e.id)
    return isPast && !hasRecord
  })

  return (
    <div className="space-y-4">
      <Card className="p-4 flex items-center justify-between">
        <p className="text-gray-600">例会記録の閲覧・作成ができます。</p>
        <Button onClick={() => setIsCreating(true)}>+ 新規作成</Button>
      </Card>

      {/* 記録一覧 */}
      <div className="space-y-2">
        {records.length === 0 ? (
          <Card className="p-8 text-center text-gray-400">まだ例会記録がありません</Card>
        ) : (
          records.map(record => {
            const event = getEvent(record.eventId)
            const dept = event ? DEPARTMENTS[event.departmentId] : null
            const statusInfo = RECORD_STATUS[record.status]
            const files = getRecordFiles(record.id)

            return (
              <Card key={record.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1 cursor-pointer" onClick={() => setSelectedRecord(record)}>
                    <div className="flex items-center gap-2 mb-1">
                      {dept && (
                        <Badge color={dept.color} bgColor={dept.bgColor}>
                          {dept.name}
                        </Badge>
                      )}
                      <span className="text-sm text-gray-500">{record.date}</span>
                      <Badge color={statusInfo.color} bgColor="#f3f4f6">
                        {statusInfo.label}
                      </Badge>
                      {files.length > 0 && (
                        <Badge color="#3b82f6" bgColor="#dbeafe">
                          📎 {files.length}件のファイル
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-bold">{record.title}</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-gray-500">記録者: {getMemberName(record.authorId)}</p>
                    </div>
                    {/* ファイル一覧（サマリー） */}
                    {files.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {files.slice(0, 3).map(file => (
                          <span key={file.id} className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                            {file.fileType === 'google' ? '📄' : file.fileType === 'pdf' ? '📕' : '📘'} {file.fileName}
                          </span>
                        ))}
                        {files.length > 3 && <span className="text-xs text-gray-400">他{files.length - 3}件</span>}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="secondary" onClick={() => setEditingRecord(record)}>
                      編集
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => onDelete(record.id)}>
                      削除
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>

      {/* 記録詳細モーダル */}
      <Modal isOpen={!!selectedRecord} onClose={() => setSelectedRecord(null)} title="例会記録" size="lg">
        {selectedRecord && (
          <RecordDetail record={selectedRecord} files={getRecordFiles(selectedRecord.id)} members={members} />
        )}
      </Modal>

      {/* 記録作成モーダル */}
      <Modal isOpen={isCreating} onClose={() => setIsCreating(false)} title="例会記録の新規作成" size="lg">
        <RecordForm
          events={pastEventsWithoutRecord}
          members={members}
          currentUserId={currentUserId}
          onSave={(data, files) => {
            onSave(data, files)
            setIsCreating(false)
          }}
          onCancel={() => setIsCreating(false)}
        />
      </Modal>

      {/* 記録編集モーダル */}
      <Modal isOpen={!!editingRecord} onClose={() => setEditingRecord(null)} title="例会記録の編集" size="lg">
        {editingRecord && (
          <RecordForm
            initialData={editingRecord}
            initialFiles={getRecordFiles(editingRecord.id)}
            events={events}
            members={members}
            currentUserId={currentUserId}
            onSave={(data, files) => {
              onSave(data, files)
              setEditingRecord(null)
            }}
            onCancel={() => setEditingRecord(null)}
          />
        )}
      </Modal>
    </div>
  )
}

// =============================================================================
// 例会記録詳細
// =============================================================================

function RecordDetail({record, files, members}) {
  const getMemberName = id => members.find(m => m.id === id)?.name || ''
  const statusInfo = RECORD_STATUS[record.status]

  const getFileIcon = fileType => {
    switch (fileType) {
      case 'google':
        return '📄'
      case 'pdf':
        return '📕'
      case 'docx':
        return '📘'
      default:
        return '📎'
    }
  }

  const getFileTypeName = fileType => {
    switch (fileType) {
      case 'google':
        return 'Google ドキュメント'
      case 'pdf':
        return 'PDF'
      case 'docx':
        return 'Word'
      default:
        return 'ファイル'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge color={statusInfo.color} bgColor="#f3f4f6">
          {statusInfo.label}
        </Badge>
        <span className="text-gray-500">
          {record.date} / {record.weather}
        </span>
      </div>

      <h3 className="text-xl font-bold">{record.title}</h3>

      <div className="grid grid-cols-1 gap-3 text-sm">
        <div>
          <span className="text-gray-500 font-medium">参加者:</span>
          <p>{record.participants}</p>
        </div>
      </div>

      {/* 記録ファイル（複数ファイル対応） */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="text-gray-500 font-medium text-sm mb-3">記録ファイル ({files.length}件)</h4>
        {files.length > 0 ? (
          <div className="space-y-2">
            {files.map(file => (
              <div key={file.id} className="flex items-center gap-3 bg-white rounded p-3 border">
                <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                  <span className="text-blue-600 text-lg">{getFileIcon(file.fileType)}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{file.fileName}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{getFileTypeName(file.fileType)}</span>
                    {file.description && (
                      <>
                        <span>•</span>
                        <span>{file.description}</span>
                      </>
                    )}
                    {file.fileSize && (
                      <>
                        <span>•</span>
                        <span>{(file.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                      </>
                    )}
                  </div>
                </div>
                <a
                  href={file.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  開く
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">ファイルが登録されていません</p>
        )}
      </div>

      <div className="text-xs text-gray-400 pt-4 border-t">
        記録者: {getMemberName(record.authorId)} / 作成日: {record.createdAt}
      </div>
    </div>
  )
}

// =============================================================================
// 例会記録フォーム（複数ファイル対応）
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function RecordForm({initialData, initialFiles = [], events, members, currentUserId, onSave, onCancel}) {
  const [form, setForm] = useState(
    initialData || {
      eventId: '',
      title: '',
      date: '',
      weather: '',
      participants: '',
      status: 'draft',
      authorId: currentUserId,
    }
  )

  // ファイルリスト状態（複数ファイル対応）
  const [files, setFiles] = useState(initialFiles)
  const [newFileType, setNewFileType] = useState('google')
  const [newFileUrl, setNewFileUrl] = useState('')
  const [newFileName, setNewFileName] = useState('')
  const [newFileDescription, setNewFileDescription] = useState('')

  const updateForm = (key, value) => setForm(prev => ({...prev, [key]: value}))

  // 例会選択時に自動入力
  const handleEventSelect = eventId => {
    const event = events.find(e => e.id === Number(eventId))
    if (event) {
      updateForm('eventId', eventId)
      updateForm('title', event.title)
      updateForm('date', event.startDate)
    }
  }

  // ファイル追加
  const handleAddFile = () => {
    if (!newFileUrl) return

    const newFile = {
      id: Date.now(), // 一時ID
      fileUrl: newFileUrl,
      fileName: newFileName || newFileUrl.split('/').pop() || 'ファイル',
      fileType: newFileType,
      fileSize: null,
      mimeType: newFileType === 'pdf' ? 'application/pdf' : newFileType === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : null,
      description: newFileDescription,
      sortOrder: files.length,
    }
    setFiles(prev => [...prev, newFile])

    // フォームをリセット
    setNewFileUrl('')
    setNewFileName('')
    setNewFileDescription('')
  }

  // ファイル削除
  const handleRemoveFile = fileId => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  // ファイルアップロードハンドラ（モック）
  const handleFileUpload = e => {
    const file = e.target.files?.[0]
    if (file) {
      const fileType = file.name.endsWith('.pdf') ? 'pdf' : 'docx'
      setNewFileName(file.name)
      setNewFileUrl(`https://example.com/uploads/${file.name}`)
      setNewFileType(fileType)
    }
  }

  const handleSubmit = e => {
    e.preventDefault()
    onSave(
      {
        ...form,
        eventId: Number(form.eventId),
        authorId: currentUserId,
      },
      files
    )
  }

  const isValid = form.eventId && form.title && form.date && files.length > 0

  const getFileIcon = fileType => {
    switch (fileType) {
      case 'google':
        return '📄'
      case 'pdf':
        return '📕'
      case 'docx':
        return '📘'
      default:
        return '📎'
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!initialData && (
        <FormField label="対象の例会" required>
          <Select
            value={form.eventId}
            onChange={handleEventSelect}
            placeholder="選択してください"
            options={events.map(e => ({value: e.id, label: `${formatDate(e.startDate)} ${e.title}`}))}
          />
        </FormField>
      )}

      <div className="grid grid-cols-2 gap-4">
        <FormField label="タイトル" required>
          <Input value={form.title} onChange={v => updateForm('title', v)} />
        </FormField>
        <FormField label="日程" required>
          <Input type="date" value={form.date} onChange={v => updateForm('date', v)} />
        </FormField>
        <FormField label="天候">
          <Input value={form.weather} onChange={v => updateForm('weather', v)} placeholder="例: 晴れ" />
        </FormField>
        <FormField label="ステータス">
          <Select
            value={form.status}
            onChange={v => updateForm('status', v)}
            options={Object.values(RECORD_STATUS).map(s => ({value: s.id, label: s.label}))}
          />
        </FormField>
      </div>

      <FormField label="参加者">
        <Textarea
          value={form.participants}
          onChange={v => updateForm('participants', v)}
          rows={2}
          placeholder="CL ○○、SL ○○、△△（会計）... 計○名"
        />
      </FormField>

      {/* 記録ファイル登録（複数ファイル対応） */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="font-medium mb-3">
          記録ファイル <span className="text-red-500">*</span>
          <span className="text-sm font-normal text-gray-500 ml-2">（複数登録可）</span>
        </h4>

        {/* 登録済みファイル一覧 */}
        {files.length > 0 && (
          <div className="space-y-2 mb-4">
            {files.map(file => (
              <div key={file.id} className="flex items-center gap-3 bg-white rounded p-3 border">
                <span className="text-lg">{getFileIcon(file.fileType)}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{file.fileName}</p>
                  {file.description && <p className="text-xs text-gray-400">{file.description}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(file.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 新規ファイル追加フォーム */}
        <div className="bg-white border rounded-lg p-3 space-y-3">
          <p className="text-sm font-medium text-gray-600">ファイルを追加</p>

          {/* ファイルタイプ選択 */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="newFileType"
                value="google"
                checked={newFileType === 'google'}
                onChange={() => setNewFileType('google')}
                className="w-4 h-4"
              />
              <span className="text-sm">📄 Google Docs</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="newFileType"
                value="pdf"
                checked={newFileType === 'pdf'}
                onChange={() => setNewFileType('pdf')}
                className="w-4 h-4"
              />
              <span className="text-sm">📕 PDF</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="newFileType"
                value="docx"
                checked={newFileType === 'docx'}
                onChange={() => setNewFileType('docx')}
                className="w-4 h-4"
              />
              <span className="text-sm">📘 Word</span>
            </label>
          </div>

          {newFileType === 'google' ? (
            <div className="space-y-2">
              <Input value={newFileUrl} onChange={setNewFileUrl} placeholder="Google ドキュメントのURL" />
              <Input value={newFileName} onChange={setNewFileName} placeholder="表示名（任意）" />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="border-2 border-dashed rounded-lg p-3 text-center hover:bg-gray-50 cursor-pointer">
                <input
                  type="file"
                  accept={newFileType === 'pdf' ? '.pdf' : '.docx,.doc'}
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload-new"
                />
                <label htmlFor="file-upload-new" className="cursor-pointer block">
                  {newFileUrl ? (
                    <span className="text-sm">{newFileName}</span>
                  ) : (
                    <span className="text-sm text-gray-500">クリックしてファイルを選択</span>
                  )}
                </label>
              </div>
            </div>
          )}

          <Input value={newFileDescription} onChange={setNewFileDescription} placeholder="説明（例: 本文、写真集）" />

          <Button type="button" variant="secondary" size="sm" onClick={handleAddFile} disabled={!newFileUrl}>
            + ファイルを追加
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" disabled={!isValid}>
          {initialData ? '更新する' : '作成する'}
        </Button>
      </div>
    </form>
  )
}

// =============================================================================
// 管理者: 装備一覧
// =============================================================================

function AdminEquipmentList({equipment, rentals, members, events, onUpdate, onDelete}) {
  const [selectedEquipment, setSelectedEquipment] = useState(null)
  const [editingEquipment, setEditingEquipment] = useState(null)
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // フィルタリング
  const filteredEquipment = equipment.filter(e => {
    if (filterCategory && e.categoryId !== filterCategory) return false
    if (filterStatus && e.status !== filterStatus) return false
    return true
  })

  // 期限超過の貸出を取得
  const getOverdueRental = equipmentId => {
    const today = new Date().toISOString().split('T')[0]
    return rentals.find(r => r.equipmentId === equipmentId && !r.returnDate && r.dueDate < today)
  }

  // 現在の貸出を取得
  const getCurrentRental = equipmentId => {
    return rentals.find(r => r.equipmentId === equipmentId && !r.returnDate)
  }

  const getMemberName = id => members.find(m => m.id === id)?.name || ''
  const getEventTitle = id => events.find(e => e.id === id)?.title || ''

  return (
    <div className="space-y-4">
      {/* フィルター */}
      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <label className="text-sm font-medium">カテゴリ:</label>
          <Select
            value={filterCategory}
            onChange={setFilterCategory}
            placeholder="すべて"
            options={Object.values(EQUIPMENT_CATEGORIES).map(c => ({value: c.id, label: `${c.icon} ${c.name}`}))}
            className="w-40"
          />
          <label className="text-sm font-medium">ステータス:</label>
          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            placeholder="すべて"
            options={Object.values(EQUIPMENT_STATUS).map(s => ({value: s.id, label: s.label}))}
            className="w-40"
          />
          <span className="text-sm text-gray-500">全{filteredEquipment.length}件</span>
        </div>
      </Card>

      {/* 装備リスト */}
      <div className="space-y-2">
        {filteredEquipment.map(eq => {
          const category = EQUIPMENT_CATEGORIES[eq.categoryId]
          const condition = EQUIPMENT_CONDITIONS[eq.condition]
          const status = EQUIPMENT_STATUS[eq.status]
          const overdue = getOverdueRental(eq.id)
          const currentRental = getCurrentRental(eq.id)

          return (
            <Card key={eq.id} className={`p-4 hover:shadow-md transition-shadow ${overdue ? 'border-red-300 bg-red-50' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{category.icon}</span>
                    <Badge color={category.color} bgColor={category.bgColor}>
                      {category.name}
                    </Badge>
                    <Badge color={status.color} bgColor={status.bgColor}>
                      {status.label}
                    </Badge>
                    <Badge color={condition.color} bgColor={condition.bgColor}>
                      {condition.label}
                    </Badge>
                    {overdue && (
                      <Badge color="#ef4444" bgColor="#fee2e2">
                        ⚠️ 期限超過
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-bold text-lg">{eq.name}</h3>
                  {eq.notes && <p className="text-sm text-gray-600">{eq.notes}</p>}
                  {currentRental && (
                    <div className="mt-2 text-sm text-gray-500">
                      貸出先: {getMemberName(currentRental.memberId)}
                      {currentRental.eventId && ` (${getEventTitle(currentRental.eventId)})`}
                      {' '}/ 返却予定: {formatDate(currentRental.dueDate)}
                    </div>
                  )}
                </div>

                {/* アクション */}
                <div className="flex flex-col gap-1 ml-4">
                  <Button size="sm" variant="secondary" onClick={() => setSelectedEquipment(eq)}>
                    詳細
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setEditingEquipment(eq)}>
                    編集
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => onDelete(eq.id)}>
                    削除
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* 詳細モーダル */}
      <Modal isOpen={!!selectedEquipment} onClose={() => setSelectedEquipment(null)} title="装備詳細" size="lg">
        {selectedEquipment && (
          <AdminEquipmentDetail
            equipment={selectedEquipment}
            rentals={rentals.filter(r => r.equipmentId === selectedEquipment.id)}
            members={members}
            events={events}
          />
        )}
      </Modal>

      {/* 編集モーダル */}
      <Modal isOpen={!!editingEquipment} onClose={() => setEditingEquipment(null)} title="装備編集" size="lg">
        {editingEquipment && (
          <AdminEquipmentForm
            initialData={editingEquipment}
            onSave={data => {
              onUpdate(editingEquipment.id, data)
              setEditingEquipment(null)
            }}
            onCancel={() => setEditingEquipment(null)}
          />
        )}
      </Modal>
    </div>
  )
}

// =============================================================================
// 管理者: 装備詳細
// =============================================================================

function AdminEquipmentDetail({equipment, rentals, members, events}) {
  const category = EQUIPMENT_CATEGORIES[equipment.categoryId]
  const condition = EQUIPMENT_CONDITIONS[equipment.condition]
  const status = EQUIPMENT_STATUS[equipment.status]

  const getMemberName = id => members.find(m => m.id === id)?.name || ''
  const getEventTitle = id => events.find(e => e.id === id)?.title || '-'

  // 貸出履歴をソート（新しい順）
  const sortedRentals = [...rentals].sort((a, b) => new Date(b.rentDate) - new Date(a.rentDate))

  return (
    <div className="space-y-6">
      {/* 基本情報 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-bold text-sm text-gray-500">装備名</h4>
          <div className="flex items-center gap-2">
            <span className="text-xl">{category.icon}</span>
            <p>{equipment.name}</p>
          </div>
        </div>
        <div>
          <h4 className="font-bold text-sm text-gray-500">カテゴリ</h4>
          <Badge color={category.color} bgColor={category.bgColor}>
            {category.name}
          </Badge>
        </div>
        <div>
          <h4 className="font-bold text-sm text-gray-500">ステータス</h4>
          <Badge color={status.color} bgColor={status.bgColor}>
            {status.label}
          </Badge>
        </div>
        <div>
          <h4 className="font-bold text-sm text-gray-500">状態</h4>
          <Badge color={condition.color} bgColor={condition.bgColor}>
            {condition.label}
          </Badge>
        </div>
        <div>
          <h4 className="font-bold text-sm text-gray-500">購入日</h4>
          <p>{equipment.purchaseDate || '-'}</p>
        </div>
        <div>
          <h4 className="font-bold text-sm text-gray-500">備考</h4>
          <p>{equipment.notes || '-'}</p>
        </div>
      </div>

      {/* 貸出履歴 */}
      <div>
        <h4 className="font-bold text-sm text-gray-500 mb-2">貸出履歴 ({sortedRentals.length}件)</h4>
        <div className="border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">貸出日</th>
                <th className="px-4 py-2 text-left">会員名</th>
                <th className="px-4 py-2 text-left">例会</th>
                <th className="px-4 py-2 text-left">返却予定</th>
                <th className="px-4 py-2 text-left">返却日</th>
              </tr>
            </thead>
            <tbody>
              {sortedRentals.map(rental => {
                const isOverdue = !rental.returnDate && rental.dueDate < new Date().toISOString().split('T')[0]
                return (
                  <tr key={rental.id} className={`border-t ${isOverdue ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-2">{rental.rentDate}</td>
                    <td className="px-4 py-2">{getMemberName(rental.memberId)}</td>
                    <td className="px-4 py-2">{getEventTitle(rental.eventId)}</td>
                    <td className="px-4 py-2">
                      {rental.dueDate}
                      {isOverdue && <span className="text-red-500 ml-1">⚠️</span>}
                    </td>
                    <td className="px-4 py-2">{rental.returnDate || '未返却'}</td>
                  </tr>
                )
              })}
              {sortedRentals.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    貸出履歴がありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// 管理者: 装備フォーム（新規作成・編集共通）
// =============================================================================

function AdminEquipmentForm({initialData, onSave, onCancel}) {
  const [form, setForm] = useState(
    initialData || {
      name: '',
      categoryId: '',
      condition: 'good',
      status: 'available',
      purchaseDate: '',
      notes: '',
    }
  )

  const updateForm = (key, value) => setForm(prev => ({...prev, [key]: value}))

  const handleSubmit = e => {
    e.preventDefault()
    onSave(form)
  }

  const isValid = form.name && form.categoryId

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="装備名" required>
          <Input value={form.name} onChange={v => updateForm('name', v)} placeholder="例: テント 3人用 #1" />
        </FormField>
        <FormField label="カテゴリ" required>
          <Select
            value={form.categoryId}
            onChange={v => updateForm('categoryId', v)}
            placeholder="選択してください"
            options={Object.values(EQUIPMENT_CATEGORIES).map(c => ({value: c.id, label: `${c.icon} ${c.name}`}))}
          />
        </FormField>
        <FormField label="状態">
          <Select
            value={form.condition}
            onChange={v => updateForm('condition', v)}
            options={Object.values(EQUIPMENT_CONDITIONS).map(c => ({value: c.id, label: c.label}))}
          />
        </FormField>
        <FormField label="ステータス">
          <Select
            value={form.status}
            onChange={v => updateForm('status', v)}
            options={Object.values(EQUIPMENT_STATUS).map(s => ({value: s.id, label: s.label}))}
          />
        </FormField>
        <FormField label="購入日">
          <Input type="date" value={form.purchaseDate} onChange={v => updateForm('purchaseDate', v)} />
        </FormField>
      </div>

      <FormField label="備考">
        <Textarea value={form.notes} onChange={v => updateForm('notes', v)} rows={3} placeholder="メーカー名、サイズ、注意事項など" />
      </FormField>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            キャンセル
          </Button>
        )}
        <Button type="submit" disabled={!isValid}>
          {initialData ? '更新する' : '登録する'}
        </Button>
      </div>
    </form>
  )
}

// =============================================================================
// 一般会員: 装備貸出・返却
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function MemberEquipmentRental({equipment, rentals, members, events, currentUserId, onRent, onReturn}) {
  const [filterCategory, setFilterCategory] = useState('')
  const [rentalModal, setRentalModal] = useState(null)

  // 貸出可能な装備のみ表示
  const availableEquipment = equipment.filter(e => {
    if (e.status !== 'available') return false
    if (filterCategory && e.categoryId !== filterCategory) return false
    return true
  })

  // 自分が借りている装備
  const myCurrentRentals = rentals.filter(r => r.memberId === currentUserId && !r.returnDate)

  const getEquipment = id => equipment.find(e => e.id === id)
  const getEventTitle = id => events.find(e => e.id === id)?.title || ''

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <p className="text-gray-600">貸出可能な装備を選んで貸出申請を行えます。返却もこちらから行えます。</p>
      </Card>

      {/* 自分の貸出中装備 */}
      {myCurrentRentals.length > 0 && (
        <Card className="p-4">
          <h3 className="font-bold mb-3">現在借りている装備 ({myCurrentRentals.length}件)</h3>
          <div className="space-y-2">
            {myCurrentRentals.map(rental => {
              const eq = getEquipment(rental.equipmentId)
              if (!eq) return null
              const category = EQUIPMENT_CATEGORIES[eq.categoryId]
              const isOverdue = rental.dueDate < new Date().toISOString().split('T')[0]

              return (
                <div key={rental.id} className={`flex items-center justify-between p-3 rounded border ${isOverdue ? 'border-red-300 bg-red-50' : 'bg-gray-50'}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span className="font-medium">{eq.name}</span>
                      {isOverdue && <Badge color="#ef4444" bgColor="#fee2e2">期限超過</Badge>}
                    </div>
                    <p className="text-sm text-gray-500">
                      返却予定: {formatDate(rental.dueDate)}
                      {rental.eventId && ` / ${getEventTitle(rental.eventId)}`}
                    </p>
                  </div>
                  <Button size="sm" variant="success" onClick={() => onReturn(rental.id)}>
                    返却する
                  </Button>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* フィルター */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">カテゴリで絞り込み:</label>
          <Select
            value={filterCategory}
            onChange={setFilterCategory}
            placeholder="すべて"
            options={Object.values(EQUIPMENT_CATEGORIES).map(c => ({value: c.id, label: `${c.icon} ${c.name}`}))}
            className="w-48"
          />
          <span className="text-sm text-gray-500">貸出可能: {availableEquipment.length}件</span>
        </div>
      </Card>

      {/* 貸出可能装備リスト */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableEquipment.map(eq => {
          const category = EQUIPMENT_CATEGORIES[eq.categoryId]
          const condition = EQUIPMENT_CONDITIONS[eq.condition]

          return (
            <Card key={eq.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{category.icon}</span>
                    <Badge color={category.color} bgColor={category.bgColor}>
                      {category.name}
                    </Badge>
                    <Badge color={condition.color} bgColor={condition.bgColor}>
                      {condition.label}
                    </Badge>
                  </div>
                  <h4 className="font-bold">{eq.name}</h4>
                  {eq.notes && <p className="text-sm text-gray-500 mt-1">{eq.notes}</p>}
                </div>
                <Button size="sm" onClick={() => setRentalModal(eq)}>
                  借りる
                </Button>
              </div>
            </Card>
          )
        })}
        {availableEquipment.length === 0 && (
          <Card className="p-8 text-center text-gray-400 col-span-2">
            貸出可能な装備がありません
          </Card>
        )}
      </div>

      {/* 貸出申請モーダル */}
      <Modal isOpen={!!rentalModal} onClose={() => setRentalModal(null)} title="装備貸出申請" size="md">
        {rentalModal && (
          <RentalForm
            equipment={rentalModal}
            events={events}
            onSave={(dueDate, eventId, notes) => {
              onRent(rentalModal.id, currentUserId, dueDate, eventId, notes)
              setRentalModal(null)
            }}
            onCancel={() => setRentalModal(null)}
          />
        )}
      </Modal>
    </div>
  )
}

// =============================================================================
// 貸出申請フォーム
// =============================================================================

function RentalForm({equipment, events, onSave, onCancel}) {
  const category = EQUIPMENT_CATEGORIES[equipment.categoryId]
  const [dueDate, setDueDate] = useState('')
  const [eventId, setEventId] = useState('')
  const [notes, setNotes] = useState('')

  // 今後の例会のみ選択可能
  const futureEvents = events.filter(e => new Date(e.startDate) >= new Date())

  const handleSubmit = e => {
    e.preventDefault()
    onSave(dueDate, eventId ? Number(eventId) : null, notes)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
        <span className="text-2xl">{category.icon}</span>
        <div>
          <p className="font-bold">{equipment.name}</p>
          <p className="text-sm text-gray-500">{category.name}</p>
        </div>
      </div>

      <FormField label="返却予定日" required>
        <Input
          type="date"
          value={dueDate}
          onChange={setDueDate}
          min={new Date().toISOString().split('T')[0]}
        />
      </FormField>

      <FormField label="使用する例会（任意）">
        <Select
          value={eventId}
          onChange={setEventId}
          placeholder="例会を選択（個人利用の場合は空欄）"
          options={futureEvents.map(e => ({value: e.id, label: `${formatDate(e.startDate)} ${e.title}`}))}
        />
      </FormField>

      <FormField label="備考">
        <Textarea value={notes} onChange={setNotes} rows={2} placeholder="使用目的など" />
      </FormField>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" disabled={!dueDate}>
          貸出を申請
        </Button>
      </div>
    </form>
  )
}

// =============================================================================
// 一般会員: 貸出履歴
// =============================================================================

function MemberMyRentals({equipment, rentals, events, currentUserId}) {
  const myRentals = rentals.filter(r => r.memberId === currentUserId)
  const sortedRentals = [...myRentals].sort((a, b) => new Date(b.rentDate) - new Date(a.rentDate))

  const getEquipment = id => equipment.find(e => e.id === id)
  const getEventTitle = id => events.find(e => e.id === id)?.title || '-'

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <p className="text-gray-600">あなたの装備貸出履歴です。</p>
      </Card>

      <div className="space-y-2">
        {sortedRentals.length === 0 ? (
          <Card className="p-8 text-center text-gray-400">貸出履歴がありません</Card>
        ) : (
          sortedRentals.map(rental => {
            const eq = getEquipment(rental.equipmentId)
            if (!eq) return null
            const category = EQUIPMENT_CATEGORIES[eq.categoryId]
            const isActive = !rental.returnDate
            const isOverdue = isActive && rental.dueDate < new Date().toISOString().split('T')[0]

            return (
              <Card key={rental.id} className={`p-4 ${isOverdue ? 'border-red-300 bg-red-50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{category.icon}</span>
                      <Badge color={category.color} bgColor={category.bgColor}>
                        {category.name}
                      </Badge>
                      {isActive ? (
                        <Badge color="#3b82f6" bgColor="#dbeafe">貸出中</Badge>
                      ) : (
                        <Badge color="#6b7280" bgColor="#f3f4f6">返却済</Badge>
                      )}
                      {isOverdue && <Badge color="#ef4444" bgColor="#fee2e2">期限超過</Badge>}
                    </div>
                    <h4 className="font-bold">{eq.name}</h4>
                    <div className="mt-2 text-sm text-gray-500 space-y-1">
                      <p>貸出日: {rental.rentDate}</p>
                      <p>返却予定: {formatDate(rental.dueDate)}</p>
                      {rental.returnDate && <p>返却日: {rental.returnDate}</p>}
                      {rental.eventId && <p>例会: {getEventTitle(rental.eventId)}</p>}
                      {rental.notes && <p>備考: {rental.notes}</p>}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

// =============================================================================
// データ構造図（ER図）
// =============================================================================

function DataStructureDiagram() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [hoveredTable, setHoveredTable] = useState(null)

  // テーブル定義
  const tables = {
    // マスターデータ
    YamanokaiDepartment: {
      category: 'master',
      label: '部署',
      color: '#22c55e',
      fields: ['id', 'code', 'name', 'color', 'bgColor'],
      x: 50,
      y: 50,
    },
    YamanokaiRole: {
      category: 'master',
      label: '役職',
      color: '#3b82f6',
      fields: ['id', 'code', 'name', 'level', 'permissions[]'],
      x: 250,
      y: 50,
    },
    YamanokaiCourse: {
      category: 'master',
      label: '講座',
      color: '#a855f7',
      fields: ['id', 'name', 'description', 'prerequisiteIds[]', 'departmentId'],
      x: 450,
      y: 50,
    },
    YamanokaiEquipment: {
      category: 'master',
      label: '装備',
      color: '#eab308',
      fields: ['id', 'name', 'category', 'totalQuantity'],
      x: 650,
      y: 50,
    },
    YamanokaiInsuranceGrade: {
      category: 'master',
      label: '保険口数',
      color: '#6b7280',
      fields: ['id', 'kuchi', 'name', 'eligibleActivities[]'],
      x: 850,
      y: 50,
    },

    // 会員データ
    YamanokaiMember: {
      category: 'member',
      label: '会員',
      color: '#ef4444',
      fields: [
        'id',
        'name',
        'email',
        'phone',
        'insuranceKuchi',
        'departmentId',
        'roleId',
        'isAdmin',
        'isActive',
      ],
      x: 150,
      y: 220,
    },
    YamanokaiMemberRole: {
      category: 'member',
      label: '役職履歴',
      color: '#f97316',
      fields: ['id', 'memberId', 'roleId', 'departmentId', 'startAt', 'endAt'],
      x: 400,
      y: 220,
    },
    YamanokaiCourseCompletion: {
      category: 'member',
      label: '受講履歴',
      color: '#84cc16',
      fields: ['id', 'memberId', 'courseId', 'eventId', 'completedAt'],
      x: 650,
      y: 220,
    },

    // 例会データ
    YamanokaiEvent: {
      category: 'event',
      label: '例会',
      color: '#0ea5e9',
      fields: [
        'id',
        'title',
        'mountainName',
        'departmentId',
        'clId',
        'slId',
        'startAt',
        'endAt',
        'staminaGrade',
        'skillGrade',
        'status',
      ],
      x: 150,
      y: 400,
    },
    YamanokaiEventPlan: {
      category: 'event',
      label: '計画書',
      color: '#06b6d4',
      fields: ['id', 'eventId', 'detailedCourse', 'escapeRoute', 'status', 'approvedBy'],
      x: 400,
      y: 400,
    },
    YamanokaiEventPlanParticipant: {
      category: 'event',
      label: '計画書参加者',
      color: '#14b8a6',
      fields: ['id', 'eventPlanId', 'memberId', 'role', 'name(snapshot)', 'phone(snapshot)'],
      x: 650,
      y: 400,
    },

    // 出席・記録データ
    YamanokaiAttendance: {
      category: 'attendance',
      label: '出席回答',
      color: '#8b5cf6',
      fields: ['id', 'eventId', 'memberId', 'status', 'comment'],
      x: 150,
      y: 570,
    },
    YamanokaiRecord: {
      category: 'record',
      label: '例会記録',
      color: '#ec4899',
      fields: ['id', 'eventId', 'title', 'recordedAt', 'weather', 'authorId', 'status'],
      x: 400,
      y: 570,
    },
    YamanokaiRecordFile: {
      category: 'record',
      label: '記録ファイル',
      color: '#f43f5e',
      fields: ['id', 'recordId', 'fileUrl', 'fileName', 'fileType', 'description'],
      x: 650,
      y: 570,
    },

    // 装備貸出
    YamanokaiEquipmentLoan: {
      category: 'equipment',
      label: '装備貸出',
      color: '#d97706',
      fields: ['id', 'equipmentId', 'memberId', 'eventId', 'quantity', 'loanAt', 'returnedAt', 'status'],
      x: 850,
      y: 400,
    },
  }

  // リレーション定義
  const relations = [
    // 部署との関係
    {from: 'YamanokaiDepartment', to: 'YamanokaiMember', label: '1:N', type: 'one-to-many'},
    {from: 'YamanokaiDepartment', to: 'YamanokaiEvent', label: '1:N', type: 'one-to-many'},
    {from: 'YamanokaiDepartment', to: 'YamanokaiCourse', label: '1:N', type: 'one-to-many'},

    // 役職との関係
    {from: 'YamanokaiRole', to: 'YamanokaiMember', label: '1:N', type: 'one-to-many'},
    {from: 'YamanokaiRole', to: 'YamanokaiMemberRole', label: '1:N', type: 'one-to-many'},

    // 会員との関係
    {from: 'YamanokaiMember', to: 'YamanokaiMemberRole', label: '1:N', type: 'one-to-many'},
    {from: 'YamanokaiMember', to: 'YamanokaiCourseCompletion', label: '1:N', type: 'one-to-many'},
    {from: 'YamanokaiMember', to: 'YamanokaiAttendance', label: '1:N', type: 'one-to-many'},
    {from: 'YamanokaiMember', to: 'YamanokaiRecord', label: '1:N', type: 'one-to-many'},
    {from: 'YamanokaiMember', to: 'YamanokaiEquipmentLoan', label: '1:N', type: 'one-to-many'},
    {from: 'YamanokaiMember', to: 'YamanokaiEventPlanParticipant', label: '1:N', type: 'one-to-many'},

    // 講座との関係
    {from: 'YamanokaiCourse', to: 'YamanokaiCourseCompletion', label: '1:N', type: 'one-to-many'},

    // 例会との関係
    {from: 'YamanokaiEvent', to: 'YamanokaiAttendance', label: '1:N', type: 'one-to-many'},
    {from: 'YamanokaiEvent', to: 'YamanokaiEventPlan', label: '1:1', type: 'one-to-one'},
    {from: 'YamanokaiEvent', to: 'YamanokaiRecord', label: '1:1', type: 'one-to-one'},
    {from: 'YamanokaiEvent', to: 'YamanokaiCourseCompletion', label: '1:N', type: 'one-to-many'},
    {from: 'YamanokaiEvent', to: 'YamanokaiEquipmentLoan', label: '1:N', type: 'one-to-many'},

    // 計画書との関係
    {from: 'YamanokaiEventPlan', to: 'YamanokaiEventPlanParticipant', label: '1:N', type: 'one-to-many'},

    // 記録との関係
    {from: 'YamanokaiRecord', to: 'YamanokaiRecordFile', label: '1:N', type: 'one-to-many'},

    // 装備との関係
    {from: 'YamanokaiEquipment', to: 'YamanokaiEquipmentLoan', label: '1:N', type: 'one-to-many'},
  ]

  // カテゴリ定義
  const categories = [
    {id: 'all', label: 'すべて', color: '#6b7280'},
    {id: 'master', label: 'マスターデータ', color: '#22c55e'},
    {id: 'member', label: '会員データ', color: '#ef4444'},
    {id: 'event', label: '例会データ', color: '#0ea5e9'},
    {id: 'attendance', label: '出席データ', color: '#8b5cf6'},
    {id: 'record', label: '記録データ', color: '#ec4899'},
    {id: 'equipment', label: '装備データ', color: '#d97706'},
  ]

  // フィルタリング
  const filteredTables =
    selectedCategory === 'all'
      ? Object.entries(tables)
      : Object.entries(tables).filter(([, t]) => t.category === selectedCategory)

  const filteredRelations =
    selectedCategory === 'all'
      ? relations
      : relations.filter(r => {
          const fromTable = tables[r.from]
          const toTable = tables[r.to]
          return fromTable?.category === selectedCategory || toTable?.category === selectedCategory
        })

  // テーブルの幅と高さを計算
  const getTableDimensions = fields => {
    const width = 160
    const height = 30 + fields.length * 18 + 10
    return {width, height}
  }

  // SVGパスを計算（テーブル間の線）
  const calculatePath = (from, to) => {
    const fromTable = tables[from]
    const toTable = tables[to]
    if (!fromTable || !toTable) return ''

    const fromDim = getTableDimensions(fromTable.fields)
    const toDim = getTableDimensions(toTable.fields)

    const fromCenterX = fromTable.x + fromDim.width / 2
    const fromCenterY = fromTable.y + fromDim.height / 2
    const toCenterX = toTable.x + toDim.width / 2
    const toCenterY = toTable.y + toDim.height / 2

    // 接続点を計算
    let fromX, fromY, toX, toY

    // 水平方向の接続
    if (Math.abs(fromCenterX - toCenterX) > Math.abs(fromCenterY - toCenterY)) {
      if (fromCenterX < toCenterX) {
        fromX = fromTable.x + fromDim.width
        toX = toTable.x
      } else {
        fromX = fromTable.x
        toX = toTable.x + toDim.width
      }
      fromY = fromCenterY
      toY = toCenterY
    } else {
      // 垂直方向の接続
      if (fromCenterY < toCenterY) {
        fromY = fromTable.y + fromDim.height
        toY = toTable.y
      } else {
        fromY = fromTable.y
        toY = toTable.y + toDim.height
      }
      fromX = fromCenterX
      toX = toCenterX
    }

    // ベジェ曲線で滑らかに接続
    const midX = (fromX + toX) / 2
    const midY = (fromY + toY) / 2
    return `M ${fromX} ${fromY} Q ${midX} ${fromY}, ${midX} ${midY} Q ${midX} ${toY}, ${toX} ${toY}`
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="font-bold mb-3">山の会（KCAC）データ構造図</h3>
        <p className="text-sm text-gray-600 mb-4">
          Prismaスキーマで定義されたテーブル間の関係性を図示しています。
        </p>

        {/* カテゴリフィルター */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat.id ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={selectedCategory === cat.id ? {backgroundColor: cat.color} : {}}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </Card>

      {/* ER図本体 */}
      <Card className="p-4 overflow-auto">
        <div className="min-w-[1100px] min-h-[700px] relative">
          <svg width="1100" height="700" className="absolute inset-0">
            {/* リレーション線 */}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
              </marker>
            </defs>

            {filteredRelations.map((rel, idx) => {
              const path = calculatePath(rel.from, rel.to)
              const isHighlighted = hoveredTable === rel.from || hoveredTable === rel.to
              return (
                <g key={idx}>
                  <path
                    d={path}
                    fill="none"
                    stroke={isHighlighted ? '#3b82f6' : '#d1d5db'}
                    strokeWidth={isHighlighted ? 2 : 1}
                    markerEnd={rel.type === 'one-to-many' ? 'url(#arrowhead)' : ''}
                    className="transition-all duration-200"
                  />
                </g>
              )
            })}
          </svg>

          {/* テーブルボックス */}
          {filteredTables.map(([name, table]) => {
            const dim = getTableDimensions(table.fields)
            const isHovered = hoveredTable === name
            const isRelated =
              hoveredTable &&
              relations.some(
                r => (r.from === hoveredTable && r.to === name) || (r.to === hoveredTable && r.from === name)
              )

            return (
              <div
                key={name}
                className={`absolute bg-white border-2 rounded-lg shadow-sm overflow-hidden transition-all duration-200 ${
                  isHovered ? 'shadow-lg z-10' : isRelated ? 'shadow-md z-5' : ''
                }`}
                style={{
                  left: table.x,
                  top: table.y,
                  width: dim.width,
                  borderColor: isHovered || isRelated ? table.color : '#e5e7eb',
                }}
                onMouseEnter={() => setHoveredTable(name)}
                onMouseLeave={() => setHoveredTable(null)}
              >
                {/* テーブルヘッダー */}
                <div className="px-2 py-1 text-white text-xs font-bold" style={{backgroundColor: table.color}}>
                  {table.label}
                </div>

                {/* フィールド一覧 */}
                <div className="px-2 py-1">
                  {table.fields.map((field, idx) => (
                    <div
                      key={idx}
                      className={`text-xs py-0.5 ${field === 'id' ? 'font-bold text-gray-800' : 'text-gray-600'} ${
                        field.endsWith('Id') || field.endsWith('Id[]') ? 'text-blue-600' : ''
                      }`}
                    >
                      {field === 'id' ? '🔑 ' : field.endsWith('Id') ? '🔗 ' : ''}
                      {field}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* 凡例 */}
      <Card className="p-4">
        <h4 className="font-bold text-sm mb-3">凡例</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs">🔑</span>
            <span>主キー (id)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">🔗</span>
            <span className="text-blue-600">外部キー (*Id)</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="40" height="20">
              <line x1="0" y1="10" x2="30" y2="10" stroke="#9ca3af" strokeWidth="2" />
              <polygon points="30 5, 40 10, 30 15" fill="#9ca3af" />
            </svg>
            <span>1:N 関係</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="40" height="20">
              <line x1="0" y1="10" x2="40" y2="10" stroke="#9ca3af" strokeWidth="2" />
            </svg>
            <span>1:1 関係</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <h5 className="font-medium text-sm mb-2">リレーション一覧</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
            {relations.map((rel, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-1 p-1 rounded ${
                  hoveredTable === rel.from || hoveredTable === rel.to ? 'bg-blue-50' : ''
                }`}
              >
                <span className="font-medium" style={{color: tables[rel.from]?.color}}>
                  {tables[rel.from]?.label}
                </span>
                <span className="text-gray-400">→</span>
                <span className="font-medium" style={{color: tables[rel.to]?.color}}>
                  {tables[rel.to]?.label}
                </span>
                <span className="text-gray-400 ml-1">({rel.label})</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
