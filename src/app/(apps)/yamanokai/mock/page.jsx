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

/** 例会ステータス */
const EVENT_STATUS = {
  draft: {id: 'draft', label: '下書き', color: '#6b7280', bgColor: '#f3f4f6'},
  polished: {id: 'polished', label: '清書', color: '#3b82f6', bgColor: '#dbeafe'},
  published: {id: 'published', label: '公開済み', color: '#22c55e', bgColor: '#dcfce7'},
}

/** 記録ステータス */
const RECORD_STATUS = {
  draft: {id: 'draft', label: '下書き', color: '#6b7280'},
  submitted: {id: 'submitted', label: '提出済', color: '#3b82f6'},
  published: {id: 'published', label: '掲載済', color: '#22c55e'},
}

/** 参加申請ステータス */
const APPLICATION_STATUS = {
  pending: {id: 'pending', label: '審査中', color: '#eab308', bgColor: '#fef9c3'},
  approved: {id: 'approved', label: '承認', color: '#22c55e', bgColor: '#dcfce7'},
  rejected: {id: 'rejected', label: '却下', color: '#ef4444', bgColor: '#fee2e2'},
}

/** 装備カテゴリ */

const EQUIPMENT_CATEGORIES = {
  tent: {id: 'tent', name: 'テント', icon: '⛺', color: '#22c55e', bgColor: '#dcfce7'},
  rope: {id: 'rope', name: 'ロープ', icon: '🧵', color: '#3b82f6', bgColor: '#dbeafe'},
  radio: {id: 'radio', name: '無線機', icon: '📻', color: '#a855f7', bgColor: '#f3e8ff'},
  climbing: {id: 'climbing', name: '登攀具', icon: '🧗', color: '#f97316', bgColor: '#ffedd5'},
  cooking: {id: 'cooking', name: '調理器具', icon: '🍳', color: '#eab308', bgColor: '#fef9c3'},
  other: {id: 'other', name: 'その他', icon: '📦', color: '#6b7280', bgColor: '#f3f4f6'},
}

/** 装備状態 */

const EQUIPMENT_CONDITIONS = {
  good: {id: 'good', label: '良好', color: '#22c55e', bgColor: '#dcfce7'},
  needsCheck: {id: 'needsCheck', label: '要点検', color: '#eab308', bgColor: '#fef9c3'},
  repairing: {id: 'repairing', label: '修理中', color: '#ef4444', bgColor: '#fee2e2'},
}

/** 装備ステータス */

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
    status: 'published',
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
    status: 'draft',
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
    status: 'polished',
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
    status: 'published',
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
    status: 'published',
    isDeleted: false,
    createdAt: '2026-11-01',
  },
]

/** 例会記録データ（複数ファイル対応） */
const INITIAL_RECORDS = [
  {
    id: 1,
    eventId: 4,
    title: '雪山ハイキング講座 座学',
    subtitle: '六甲山',
    date: '2026-02-05',
    weather: '晴れ',
    participants: 'CL 永末康史、新井公子、下垣内福世 計3名',
    accessInfo: '集合: JR三ノ宮駅 8:30\n移動: 市バス16系統で摩耶ケーブル下まで',
    courseTime:
      '8:30 出発\n9:15 摩耶ロープウェー\n10:00 掬星台到着\n10:30 六甲山頂出発\n12:00 昼食\n14:00 下山開始\n16:00 摩耶ロープウェー下駅到着',
    content:
      '冬の六甲山で雪山装備の実践講座を行いました。\n\n午前中は座学で雪山の基礎知識、装備の使い方を学び、午後は実際にフィールドで練習しました。天候に恵まれ、参加者全員が安全に講座を修了できました。\n\n初心者の方も多かったですが、経験者のサポートもあり、充実した講座となりました。',
    courseCondition: '道路状況: 市バスは通常運行\n混雑度: ロープウェーは待ち時間なし\n積雪: 山頂付近で5cm程度',
    remarks: 'アイゼン装着時の注意点を再確認しました。次回は3月の実践編を予定しています。',
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
    fileUrl: 'https://picsum.photos/400/300?random=1',
    fileName: '六甲山_山頂.jpg',
    fileType: 'image',
    fileSize: 524288,
    mimeType: 'image/jpeg',
    description: '山頂からの景色',
    sortOrder: 0,
    isPublic: true,
    isDeleted: false,
    createdAt: '2026-02-06',
  },
  {
    id: 2,
    recordId: 1,
    fileUrl: 'https://picsum.photos/400/300?random=2',
    fileName: 'アイゼン装着.jpg',
    fileType: 'image',
    fileSize: 612352,
    mimeType: 'image/jpeg',
    description: 'アイゼン装着の練習',
    sortOrder: 1,
    isPublic: true,
    isDeleted: false,
    createdAt: '2026-02-06',
  },
  {
    id: 3,
    recordId: 1,
    fileUrl: 'https://picsum.photos/400/300?random=3',
    fileName: '集合写真.jpg',
    fileType: 'image',
    fileSize: 734208,
    mimeType: 'image/jpeg',
    description: '参加者全員の集合写真',
    sortOrder: 2,
    isPublic: false,
    isDeleted: false,
    createdAt: '2026-02-06',
  },
]

/** 参加申請データ */
const INITIAL_APPLICATIONS = [
  {
    id: 1,
    eventId: 1,
    memberId: 3,
    comment: '初めての参加です',
    approvalStatus: 'pending',
    rejectionReason: null,
    approvedBy: null,
    actualAttended: false,
    createdAt: '2026-01-18',
    isDeleted: false,
  },
  {
    id: 2,
    eventId: 1,
    memberId: 5,
    comment: '',
    approvalStatus: 'approved',
    rejectionReason: null,
    approvedBy: 1,
    actualAttended: true,
    createdAt: '2026-01-16',
    isDeleted: false,
  },
  {
    id: 3,
    eventId: 1,
    memberId: 8,
    comment: 'よろしくお願いします',
    approvalStatus: 'approved',
    rejectionReason: null,
    approvedBy: 1,
    actualAttended: true,
    createdAt: '2026-01-17',
    isDeleted: false,
  },
  {
    id: 4,
    eventId: 2,
    memberId: 7,
    comment: '',
    approvalStatus: 'rejected',
    rejectionReason: '保険口数が不足しています（8口必要）',
    approvedBy: 2,
    actualAttended: false,
    createdAt: '2026-01-12',
    isDeleted: false,
  },
  {
    id: 5,
    eventId: 4,
    memberId: 3,
    comment: '初参加です、よろしくお願いします',
    approvalStatus: 'approved',
    rejectionReason: null,
    approvedBy: 4,
    actualAttended: true,
    createdAt: '2026-01-25',
    isDeleted: false,
  },
]

/** 装備品マスター */
const INITIAL_EQUIPMENT = [
  // テント
  {
    id: 1,
    name: 'テント 3人用 #1',
    categoryId: 'tent',
    condition: 'good',
    status: 'available',
    purchaseDate: '2023-04-01',
    notes: 'MSR製、軽量モデル',
    isDeleted: false,
  },
  {
    id: 2,
    name: 'テント 3人用 #2',
    categoryId: 'tent',
    condition: 'needsCheck',
    status: 'available',
    purchaseDate: '2022-06-15',
    notes: 'ファスナー要確認',
    isDeleted: false,
  },
  {
    id: 3,
    name: 'テント 4人用',
    categoryId: 'tent',
    condition: 'good',
    status: 'rented',
    purchaseDate: '2024-01-10',
    notes: 'モンベル製',
    isDeleted: false,
  },
  // ロープ
  {
    id: 4,
    name: 'ザイル 50m #1',
    categoryId: 'rope',
    condition: 'good',
    status: 'available',
    purchaseDate: '2024-03-01',
    notes: '直径10mm、ドライ加工',
    isDeleted: false,
  },
  {
    id: 5,
    name: 'ザイル 50m #2',
    categoryId: 'rope',
    condition: 'good',
    status: 'rented',
    purchaseDate: '2024-03-01',
    notes: '直径10mm、ドライ加工',
    isDeleted: false,
  },
  // 無線機
  {
    id: 6,
    name: 'トランシーバー #1',
    categoryId: 'radio',
    condition: 'good',
    status: 'available',
    purchaseDate: '2023-08-01',
    notes: 'アイコム IC-R6',
    isDeleted: false,
  },
  {
    id: 7,
    name: 'トランシーバー #2',
    categoryId: 'radio',
    condition: 'repairing',
    status: 'maintenance',
    purchaseDate: '2023-08-01',
    notes: '電池交換中',
    isDeleted: false,
  },
  // 登攀具
  {
    id: 8,
    name: 'ヘルメット #1',
    categoryId: 'climbing',
    condition: 'good',
    status: 'rented',
    purchaseDate: '2024-05-01',
    notes: 'ペツル製',
    isDeleted: false,
  },
  {
    id: 9,
    name: 'ヘルメット #2',
    categoryId: 'climbing',
    condition: 'good',
    status: 'available',
    purchaseDate: '2024-05-01',
    notes: 'ペツル製',
    isDeleted: false,
  },
  // 調理器具
  {
    id: 10,
    name: 'コッヘルセット 大',
    categoryId: 'cooking',
    condition: 'good',
    status: 'available',
    purchaseDate: '2022-03-01',
    notes: '10人分対応',
    isDeleted: false,
  },
  {
    id: 11,
    name: 'ガスバーナー #1',
    categoryId: 'cooking',
    condition: 'good',
    status: 'available',
    purchaseDate: '2023-09-01',
    notes: 'プリムス製',
    isDeleted: false,
  },
  // その他
  {
    id: 12,
    name: 'ツェルト 2人用',
    categoryId: 'other',
    condition: 'good',
    status: 'available',
    purchaseDate: '2024-02-01',
    notes: '緊急用',
    isDeleted: false,
  },
  {
    id: 13,
    name: 'GPS端末',
    categoryId: 'other',
    condition: 'needsCheck',
    status: 'available',
    purchaseDate: '2021-11-01',
    notes: 'Garmin、ファームウェア更新要',
    isDeleted: false,
  },
]

/** 装備貸出履歴 */
const INITIAL_RENTALS = [
  {
    id: 1,
    equipmentId: 3,
    memberId: 2,
    eventId: 2,
    rentDate: '2026-02-12',
    dueDate: '2026-02-17',
    returnDate: null,
    notes: '西穂高岳で使用',
    isDeleted: false,
  },
  {
    id: 2,
    equipmentId: 5,
    memberId: 5,
    eventId: 2,
    rentDate: '2026-02-12',
    dueDate: '2026-02-17',
    returnDate: null,
    notes: '',
    isDeleted: false,
  },
  {
    id: 3,
    equipmentId: 8,
    memberId: 7,
    eventId: null,
    rentDate: '2026-01-20',
    dueDate: '2026-01-25',
    returnDate: null,
    notes: '個人練習用（期限超過中）',
    isDeleted: false,
  },
  {
    id: 4,
    equipmentId: 4,
    memberId: 3,
    eventId: 1,
    rentDate: '2026-02-01',
    dueDate: '2026-02-08',
    returnDate: '2026-02-08',
    notes: 'クリーンハイクで使用',
    isDeleted: false,
  },
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
  const [activeMenu, setActiveMenu] = useState('member-events')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // データ状態
  const [events, setEvents] = useState(INITIAL_EVENTS)
  const [records, setRecords] = useState(INITIAL_RECORDS)
  const [recordFiles, setRecordFiles] = useState(INITIAL_RECORD_FILES)
  const [equipment, setEquipment] = useState(INITIAL_EQUIPMENT)
  const [rentals, setRentals] = useState(INITIAL_RENTALS)
  const [applications, setApplications] = useState(INITIAL_APPLICATIONS)

  // 有効なデータのみフィルタ（ソフトデリート対応 + 一般会員は公開済みのみ）
  const activeEvents = useMemo(() => {
    let filtered = events.filter(e => !e.isDeleted)
    // 一般会員は公開済みのみ表示
    if (!currentUser?.isAdmin) {
      filtered = filtered.filter(e => e.status === 'published')
    }
    return filtered
  }, [events, currentUser])
  const activeRecords = useMemo(() => records.filter(r => !r.isDeleted), [records])
  const activeRecordFiles = useMemo(() => recordFiles.filter(f => !f.isDeleted), [recordFiles])
  const activeEquipment = useMemo(() => equipment.filter(e => !e.isDeleted), [equipment])
  const activeRentals = useMemo(() => rentals.filter(r => !r.isDeleted), [rentals])
  const activeApplications = useMemo(() => applications.filter(a => !a.isDeleted), [applications])

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
      setRentals(prev => prev.map(r => (r.id === rentalId ? {...r, returnDate: new Date().toISOString().split('T')[0]} : r)))
    }
  }

  // メニュー定義
  const menuItems = [
    {type: 'header', label: '例会'},
    {id: 'admin-event-management', label: '例会設定', icon: '⚙️', adminOnly: true},
    {id: 'export-public', label: '外部公開データ出力', icon: '📤', adminOnly: true},
    {id: 'member-events', label: '例会一覧', icon: '📅'},
    {type: 'divider'},
    {type: 'header', label: '装備品レンタル'},
    {id: 'admin-equipment', label: '装備品マスタ管理', icon: '🎒', adminOnly: true},
    {id: 'member-equipment', label: '装備貸出・返却', icon: '🔄'},
    {id: 'member-my-rentals', label: '貸出履歴', icon: '📝'},
    {type: 'divider'},
    {type: 'header', label: 'システム'},
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
          {/* 管理者: 例会設定（統合ページ） */}
          {activeMenu === 'admin-event-management' && (
            <AdminEventManagement
              events={activeEvents}
              allEvents={events}
              records={activeRecords}
              recordFiles={activeRecordFiles}
              applications={activeApplications}
              members={INITIAL_MEMBERS}
              currentUserId={currentUserId}
              onEventUpdate={(id, data) => setEvents(prev => prev.map(e => (e.id === id ? {...e, ...data} : e)))}
              onEventDelete={id => setEvents(prev => prev.map(e => (e.id === id ? {...e, isDeleted: true} : e)))}
              onEventCreate={data => {
                const newEvent = {
                  ...data,
                  id: generateId(events),
                  createdAt: new Date().toISOString().split('T')[0],
                  isDeleted: false,
                }
                setEvents(prev => [...prev, newEvent])
              }}
              onApprove={appId => {
                setApplications(prev =>
                  prev.map(a => (a.id === appId ? {...a, approvalStatus: 'approved', approvedBy: currentUserId} : a))
                )
              }}
              onReject={(appId, reason) => {
                setApplications(prev =>
                  prev.map(a =>
                    a.id === appId ? {...a, approvalStatus: 'rejected', rejectionReason: reason, approvedBy: currentUserId} : a
                  )
                )
              }}
              onToggleAttended={appId => {
                setApplications(prev => prev.map(a => (a.id === appId ? {...a, actualAttended: !a.actualAttended} : a)))
              }}
              onRecordSave={(data, files) => {
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
              onTogglePublic={fileId => {
                setRecordFiles(prev => prev.map(f => (f.id === fileId ? {...f, isPublic: !f.isPublic} : f)))
              }}
              onRecordDelete={id => setRecords(prev => prev.map(r => (r.id === id ? {...r, isDeleted: true} : r)))}
              onRecordFileDelete={fileId => setRecordFiles(prev => prev.map(f => (f.id === fileId ? {...f, isDeleted: true} : f)))}
            />
          )}

          {/* 外部公開データ出力 */}
          {activeMenu === 'export-public' && (
            <ExportPublicDataView
              events={activeEvents}
              records={activeRecords}
              recordFiles={activeRecordFiles}
              members={INITIAL_MEMBERS}
            />
          )}

          {/* 一般会員: 例会一覧（統合ページ） */}
          {activeMenu === 'member-events' && (
            <MemberEventPage
              events={activeEvents}
              records={activeRecords}
              recordFiles={activeRecordFiles}
              applications={activeApplications}
              members={INITIAL_MEMBERS}
              currentUserId={currentUserId}
              onApply={(eventId, comment) => {
                setApplications(prev => [
                  ...prev,
                  {
                    id: generateId(prev),
                    eventId,
                    memberId: currentUserId,
                    comment,
                    approvalStatus: 'pending',
                    rejectionReason: null,
                    approvedBy: null,
                    actualAttended: false,
                    createdAt: new Date().toISOString().split('T')[0],
                    isDeleted: false,
                  },
                ])
              }}
              onRecordSave={(data, files) => {
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
              onRecordDelete={id => setRecords(prev => prev.map(r => (r.id === id ? {...r, isDeleted: true} : r)))}
              onRecordFileDelete={fileId => setRecordFiles(prev => prev.map(f => (f.id === fileId ? {...f, isDeleted: true} : f)))}
            />
          )}

          {/* 装備品マスタ管理 */}
          {activeMenu === 'admin-equipment' && (
            <AdminEquipmentManagement
              equipment={activeEquipment}
              rentals={activeRentals}
              members={INITIAL_MEMBERS}
              events={activeEvents}
              onUpdate={(id, data) => setEquipment(prev => prev.map(e => (e.id === id ? {...e, ...data} : e)))}
              onDelete={id => setEquipment(prev => prev.map(e => (e.id === id ? {...e, isDeleted: true} : e)))}
              onCreateEquipment={data => {
                const newEquipment = {
                  ...data,
                  id: generateId(equipment),
                  isDeleted: false,
                }
                setEquipment(prev => [...prev, newEquipment])
              }}
            />
          )}

          {/* 装備貸出・返却 */}
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

          {/* 貸出履歴 */}
          {activeMenu === 'member-my-rentals' && (
            <MemberMyRentals
              equipment={activeEquipment}
              rentals={activeRentals}
              events={activeEvents}
              currentUserId={currentUserId}
            />
          )}

          {/* データ構造図 */}
          {activeMenu === 'data-structure' && <DataStructureDiagram />}
        </div>
      </main>
    </div>
  )
}

// =============================================================================
// 管理者: 例会設定（統合ページ）
// =============================================================================

function AdminEventManagement({
  events,
  allEvents,
  records,
  recordFiles,
  applications,
  members,
  currentUserId,
  onEventUpdate,
  onEventDelete,
  onEventCreate,
  onApprove,
  onReject,
  onToggleAttended,
  onRecordSave,
  onTogglePublic,
  onRecordDelete,
  onRecordFileDelete,
}) {
  return (
    <AdminEventList
      events={events}
      applications={applications}
      records={records}
      recordFiles={recordFiles}
      members={members}
      currentUserId={currentUserId}
      onUpdate={onEventUpdate}
      onDelete={onEventDelete}
      onCreate={onEventCreate}
      onApprove={onApprove}
      onReject={onReject}
      onToggleAttended={onToggleAttended}
      onRecordSave={onRecordSave}
      onTogglePublic={onTogglePublic}
    />
  )
}

// =============================================================================
// 一般会員: 例会一覧（統合ページ）
// =============================================================================

function MemberEventPage({
  events,
  records,
  recordFiles,
  applications,
  members,
  currentUserId,
  onApply,
  onRecordSave,
  onRecordDelete,
  onRecordFileDelete,
}) {
  const [activeTab, setActiveTab] = useState('schedule')

  const tabs = [
    {id: 'schedule', label: 'スケジュール', icon: '📅'},
    {id: 'application', label: '申し込み状況', icon: '🙋'},
    {id: 'records', label: '例会記録', icon: '📖'},
  ]

  return (
    <div className="space-y-4">
      {/* タブナビゲーション */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="flex border-b">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* タブコンテンツ */}
      {activeTab === 'schedule' && (
        <MemberCalendar
          events={events}
          applications={applications}
          records={records}
          members={members}
          currentUserId={currentUserId}
          onApply={onApply}
        />
      )}
      {activeTab === 'application' && (
        <MemberApplicationView
          events={events}
          applications={applications}
          members={members}
          currentUserId={currentUserId}
          onApply={onApply}
        />
      )}
      {activeTab === 'records' && (
        <MemberRecords
          events={events}
          records={records}
          recordFiles={recordFiles}
          members={members}
          currentUserId={currentUserId}
          onSave={onRecordSave}
          onDelete={onRecordDelete}
          onDeleteFile={onRecordFileDelete}
        />
      )}
    </div>
  )
}

// =============================================================================
// 管理者: 装備品マスタ管理（統合ページ）
// =============================================================================

function AdminEquipmentManagement({equipment, rentals, members, events, onUpdate, onDelete, onCreateEquipment}) {
  const [activeTab, setActiveTab] = useState('list')

  const tabs = [
    {id: 'list', label: '装備一覧', icon: '🎒'},
    {id: 'create', label: '新規登録', icon: '➕'},
  ]

  return (
    <div className="space-y-4">
      {/* タブナビゲーション */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="flex border-b">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'list' && (
        <AdminEquipmentList
          equipment={equipment}
          rentals={rentals}
          members={members}
          events={events}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      )}
      {activeTab === 'create' && (
        <AdminEquipmentForm
          onSave={data => {
            onCreateEquipment(data)
            setActiveTab('list')
          }}
        />
      )}
    </div>
  )
}

// =============================================================================
// 管理者: 例会一覧
// =============================================================================

function AdminEventList({
  events,
  applications,
  records,
  recordFiles,
  members,
  currentUserId,
  onUpdate,
  onDelete,
  onCreate,
  onApprove,
  onReject,
  onToggleAttended,
  onRecordSave,
  onTogglePublic,
}) {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [editingEvent, setEditingEvent] = useState(null)
  const [creatingEvent, setCreatingEvent] = useState(false)
  const [applicationEvent, setApplicationEvent] = useState(null) // 申し込み管理モーダル用
  const [recordEvent, setRecordEvent] = useState(null) // 例会記録モーダル用
  const [filterDept, setFilterDept] = useState('')
  const [activeTab, setActiveTab] = useState('draft') // draft, polished, published
  const [selectedForPublish, setSelectedForPublish] = useState([]) // 一括公開用の選択

  // タブごとにフィルタ
  const tabFilteredEvents = events.filter(e => e.status === activeTab)
  const filteredEvents = filterDept ? tabFilteredEvents.filter(e => e.departmentId === filterDept) : tabFilteredEvents

  const sortedEvents = [...filteredEvents].sort((a, b) => new Date(a.startDate) - new Date(b.startDate))

  const getApplicationSummary = eventId => {
    const eventApps = applications.filter(a => a.eventId === eventId)
    return {
      total: eventApps.length,
      approved: eventApps.filter(a => a.approvalStatus === 'approved').length,
      pending: eventApps.filter(a => a.approvalStatus === 'pending').length,
      rejected: eventApps.filter(a => a.approvalStatus === 'rejected').length,
    }
  }

  const getMemberName = id => members.find(m => m.id === id)?.name || ''

  // CSV一括ダウンロード
  const handleDownloadCSV = () => {
    const draftEvents = events.filter(e => e.status === 'draft')
    const headers = [
      'id',
      'title',
      'mountainName',
      'altitude',
      'departmentId',
      'clId',
      'slId',
      'startDate',
      'endDate',
      'staminaGrade',
      'skillGrade',
      'rockCategory',
      'requiredInsurance',
      'meetingPlace',
      'meetingTime',
      'course',
      'deadline',
      'notes',
      'status',
    ]
    const csvContent = [
      headers.join(','),
      ...draftEvents.map(e =>
        headers
          .map(h => {
            const value = e[h] ?? ''
            // カンマやダブルクォートを含む場合はエスケープ
            if (String(value).includes(',') || String(value).includes('"')) {
              return `"${String(value).replace(/"/g, '""')}"`
            }
            return value
          })
          .join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'})
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `yamanokai_draft_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // CSVアップロード
  const handleUploadCSV = e => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = event => {
      try {
        const text = event.target.result
        const lines = text.split('\n').filter(l => l.trim())
        const headers = lines[0].split(',')

        const updatedEvents = []
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',')
          const eventData = {}
          headers.forEach((h, idx) => {
            let value = values[idx]?.trim() || ''
            // ダブルクォートのエスケープを解除
            if (value.startsWith('"') && value.endsWith('"')) {
              value = value.slice(1, -1).replace(/""/g, '"')
            }
            eventData[h] = value === '' ? null : value
          })
          // ステータスをpolishedに変更
          eventData.status = 'polished'
          updatedEvents.push(eventData)
        }

        // 既存データを更新
        updatedEvents.forEach(data => {
          if (data.id) {
            onUpdate(Number(data.id), data)
          }
        })

        alert(`${updatedEvents.length}件の例会を清書に更新しました`)
        e.target.value = '' // リセット
      } catch (error) {
        alert('CSVの解析に失敗しました: ' + error.message)
      }
    }
    reader.readAsText(file)
  }

  // 一括公開
  const handleBulkPublish = () => {
    if (selectedForPublish.length === 0) {
      alert('公開する例会を選択してください')
      return
    }
    if (window.confirm(`${selectedForPublish.length}件の例会を一括公開しますか？`)) {
      selectedForPublish.forEach(eventId => {
        onUpdate(eventId, {status: 'published'})
      })
      setSelectedForPublish([])
      alert(`${selectedForPublish.length}件の例会を公開しました`)
    }
  }

  // チェックボックストグル
  const toggleSelect = eventId => {
    setSelectedForPublish(prev => (prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]))
  }

  return (
    <div className="space-y-4">
      {/* タブUI */}
      <Card className="p-0 overflow-hidden">
        <div className="flex border-b">
          {Object.values(EVENT_STATUS).map(status => (
            <button
              key={status.id}
              onClick={() => {
                setActiveTab(status.id)
                setSelectedForPublish([])
              }}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === status.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {status.label}（{events.filter(e => e.status === status.id).length}件）
            </button>
          ))}
        </div>
      </Card>

      {/* フィルターとアクション */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
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

          {/* アクションボタン */}
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setCreatingEvent(true)}>
              ➕ 新規作成
            </Button>
            {activeTab === 'draft' && (
              <>
                <Button size="sm" variant="secondary" onClick={handleDownloadCSV}>
                  📥 CSV一括DL
                </Button>
                <label className="cursor-pointer">
                  <Button size="sm" variant="secondary" as="span">
                    📤 CSVアップロード
                  </Button>
                  <input type="file" accept=".csv" onChange={handleUploadCSV} className="hidden" />
                </label>
              </>
            )}
            {activeTab === 'polished' && selectedForPublish.length > 0 && (
              <Button size="sm" variant="success" onClick={handleBulkPublish}>
                ✅ 選択した{selectedForPublish.length}件を一括公開
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* 例会リスト */}
      <div className="space-y-2">
        {sortedEvents.map(event => {
          const dept = DEPARTMENTS[event.departmentId]
          const summary = getApplicationSummary(event.id)
          const hasRecord = records.some(r => r.eventId === event.id)
          const isSelected = selectedForPublish.includes(event.id)

          return (
            <Card key={event.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                {/* 清書タブの場合はチェックボックス表示 */}
                {activeTab === 'polished' && (
                  <div className="mr-3 pt-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(event.id)}
                      className="w-5 h-5 cursor-pointer"
                    />
                  </div>
                )}

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

                {/* 申し込み状況サマリー */}
                <div className="text-center ml-4">
                  <div className="text-2xl font-bold text-green-600">{summary.approved}</div>
                  <div className="text-xs text-gray-500">承認</div>
                  <div className="text-xs text-gray-400 mt-1">
                    審査中{summary.pending} / 却下{summary.rejected}
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
                  {event.status === 'published' && (
                    <Button size="sm" variant="secondary" onClick={() => setApplicationEvent(event)}>
                      申し込み管理
                    </Button>
                  )}
                  <Button size="sm" variant="secondary" onClick={() => setRecordEvent(event)}>
                    例会記録
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

      {sortedEvents.length === 0 && (
        <Card className="p-8 text-center text-gray-500">
          <p>該当する例会がありません</p>
        </Card>
      )}

      {/* 詳細モーダル */}
      <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="例会詳細" size="lg">
        {selectedEvent && (
          <AdminEventDetail
            event={selectedEvent}
            applications={applications.filter(a => a.eventId === selectedEvent.id)}
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

      {/* 新規作成モーダル */}
      <Modal isOpen={creatingEvent} onClose={() => setCreatingEvent(false)} title="例会の新規作成" size="lg">
        <AdminEventForm
          members={members}
          onSave={data => {
            onCreate(data)
            setCreatingEvent(false)
          }}
          onCancel={() => setCreatingEvent(false)}
        />
      </Modal>

      {/* 申し込み管理モーダル */}
      <Modal
        isOpen={!!applicationEvent}
        onClose={() => setApplicationEvent(null)}
        title={`申し込み管理 — ${applicationEvent?.title || ''}`}
        size="lg"
      >
        {applicationEvent && (
          <AdminApplicationView
            events={events.filter(e => e.id === applicationEvent.id)}
            applications={applications.filter(a => a.eventId === applicationEvent.id)}
            members={members}
            currentUserId={currentUserId}
            onApprove={onApprove}
            onReject={onReject}
            onToggleAttended={onToggleAttended}
            initialEventId={applicationEvent.id}
          />
        )}
      </Modal>

      {/* 例会記録モーダル */}
      <Modal
        isOpen={!!recordEvent}
        onClose={() => setRecordEvent(null)}
        title={`例会記録 — ${recordEvent?.title || ''}`}
        size="lg"
      >
        {recordEvent && (
          <RecordA4View
            events={events.filter(e => e.id === recordEvent.id)}
            records={records.filter(r => r.eventId === recordEvent.id)}
            recordFiles={recordFiles.filter(f => records.some(r => r.eventId === recordEvent.id && r.id === f.recordId))}
            members={members}
            currentUserId={currentUserId}
            onSave={onRecordSave}
            onTogglePublic={onTogglePublic}
            initialEvent={recordEvent}
          />
        )}
      </Modal>
    </div>
  )
}

// =============================================================================
// 管理者: 例会詳細
// =============================================================================

function AdminEventDetail({event, applications, members}) {
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

      {/* 参加申し込み一覧 */}
      <div>
        <h4 className="font-bold text-sm text-gray-500 mb-2">参加申し込み ({applications.length}件)</h4>
        <div className="border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">会員名</th>
                <th className="px-4 py-2 text-left">ステータス</th>
                <th className="px-4 py-2 text-left">コメント</th>
                <th className="px-4 py-2 text-left">申請日</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => {
                const status = APPLICATION_STATUS[app.approvalStatus]
                return (
                  <tr key={app.id} className="border-t">
                    <td className="px-4 py-2">{getMemberName(app.memberId)}</td>
                    <td className="px-4 py-2">
                      <Badge color={status.color} bgColor={status.bgColor}>
                        {status.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-gray-600">{app.comment || '-'}</td>
                    <td className="px-4 py-2 text-gray-500">{formatDate(app.createdAt)}</td>
                  </tr>
                )
              })}
              {applications.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                    まだ申し込みがありません
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

function MemberCalendar({events, applications, records, members, currentUserId, onApply}) {
  const [viewMonth, setViewMonth] = useState(new Date(2026, 1, 1)) // 2026年2月
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [applyModal, setApplyModal] = useState(null)
  const [applyComment, setApplyComment] = useState('')

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

  // ユーザーの申し込みを取得
  const getMyApplication = eventId => {
    return applications.find(a => a.eventId === eventId && a.memberId === currentUserId)
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
                    const myApp = getMyApplication(event.id)
                    const appStatus = myApp ? APPLICATION_STATUS[myApp.approvalStatus] : null

                    return (
                      <div
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className="text-xs p-1 rounded cursor-pointer truncate hover:opacity-80"
                        style={{backgroundColor: dept.bgColor, color: dept.color, borderLeft: `3px solid ${dept.color}`}}
                        title={event.title}
                      >
                        <span className="font-medium">{event.title}</span>
                        {appStatus && (
                          <span className="ml-1" style={{color: appStatus.color}}>
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
          <span className="font-medium">申し込み状況:</span>
          {Object.values(APPLICATION_STATUS).map(st => (
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

            {/* 参加申し込み */}
            <div className="border-t pt-4">
              <h4 className="font-bold mb-3">参加申し込み</h4>
              {(() => {
                const myApp = getMyApplication(selectedEvent.id)
                if (myApp) {
                  const appStatus = APPLICATION_STATUS[myApp.approvalStatus]
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <span>申し込み状況:</span>
                        <Badge color={appStatus.color} bgColor={appStatus.bgColor}>
                          {appStatus.label}
                        </Badge>
                      </div>
                      {myApp.comment && (
                        <p className="text-sm text-gray-600">コメント: {myApp.comment}</p>
                      )}
                      {myApp.approvalStatus === 'rejected' && myApp.rejectionReason && (
                        <div className="text-sm text-red-600 bg-red-50 rounded p-2">
                          却下理由: {myApp.rejectionReason}
                        </div>
                      )}
                    </div>
                  )
                }
                return (
                  <Button size="sm" onClick={() => {
                    setApplyModal(selectedEvent)
                    setApplyComment('')
                  }}>
                    参加申請する
                  </Button>
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

      {/* 参加申請モーダル */}
      <Modal isOpen={!!applyModal} onClose={() => setApplyModal(null)} title="参加申請" size="sm">
        {applyModal && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded p-3 text-sm">
              <p className="font-bold">{applyModal.title}</p>
              <p className="text-gray-600 mt-1">{formatDateRange(applyModal.startDate, applyModal.endDate)}</p>
            </div>
            <FormField label="コメント（任意）">
              <Textarea
                value={applyComment}
                onChange={setApplyComment}
                placeholder="CL/SLへの連絡事項があれば記入してください"
                rows={3}
              />
            </FormField>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setApplyModal(null)}>
                キャンセル
              </Button>
              <Button onClick={() => {
                onApply(applyModal.id, applyComment)
                setApplyModal(null)
                setSelectedEvent(null)
              }}>
                申請を送信
              </Button>
            </div>
          </div>
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
        {selectedRecord && <RecordDetail record={selectedRecord} files={getRecordFiles(selectedRecord.id)} members={members} />}
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

  // 画像ファイルのみ抽出
  const imageFiles = files.filter(f => f.fileType === 'image').slice(0, 4)

  return (
    <div className="space-y-4">
      {/* ヘッダー: ステータス、日付、天候 */}
      <div className="flex items-center gap-2">
        <Badge color={statusInfo.color} bgColor="#f3f4f6">
          {statusInfo.label}
        </Badge>
        <span className="text-gray-500">
          {record.date} / {record.weather}
        </span>
      </div>

      {/* タイトル・サブタイトル */}
      <div>
        <h3 className="text-2xl font-bold">{record.title}</h3>
        {record.subtitle && <p className="text-lg text-gray-500 italic mt-1">{record.subtitle}</p>}
      </div>

      {/* 2カラムレイアウト */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* 左カラム: テキスト情報（70%） */}
        <div className="flex-1 md:w-[70%] space-y-4">
          {/* 参加者 */}
          {record.participants && (
            <div>
              <h4 className="font-bold text-gray-700 mb-2">■ 参加者</h4>
              <p className="text-sm whitespace-pre-wrap">{record.participants}</p>
            </div>
          )}

          {/* アクセス */}
          {record.accessInfo && (
            <div>
              <h4 className="font-bold text-gray-700 mb-2">■ アクセス</h4>
              <p className="text-sm whitespace-pre-wrap">{record.accessInfo}</p>
            </div>
          )}

          {/* コースタイム */}
          {record.courseTime && (
            <div>
              <h4 className="font-bold text-gray-700 mb-2">■ コースタイム</h4>
              <p className="text-sm whitespace-pre-wrap">{record.courseTime}</p>
            </div>
          )}

          {/* 本文 */}
          {record.content && (
            <div>
              <h4 className="font-bold text-gray-700 mb-2">■ 本文</h4>
              <p className="text-sm whitespace-pre-wrap">{record.content}</p>
            </div>
          )}

          {/* コース状況 */}
          {record.courseCondition && (
            <div>
              <h4 className="font-bold text-gray-700 mb-2">■ コース状況</h4>
              <p className="text-sm whitespace-pre-wrap">{record.courseCondition}</p>
            </div>
          )}

          {/* 特記事項 */}
          {record.remarks && (
            <div>
              <h4 className="font-bold text-gray-700 mb-2">■ 特記事項</h4>
              <p className="text-sm whitespace-pre-wrap">{record.remarks}</p>
            </div>
          )}
        </div>

        {/* 右カラム: 写真（30%） */}
        {imageFiles.length > 0 && (
          <div className="w-full md:w-[30%] space-y-4">
            {imageFiles.map(image => (
              <div key={image.id} className="bg-white rounded-lg border overflow-hidden">
                <img src={image.fileUrl} alt={image.fileName} className="w-full h-48 object-cover" />
                {image.description && <div className="p-2 text-xs text-gray-600 text-center border-t">{image.description}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* フッター: 記録者・作成日 */}
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
      subtitle: '',
      date: '',
      weather: '',
      participants: '',
      accessInfo: '',
      courseTime: '',
      content: '',
      courseCondition: '',
      remarks: '',
      status: 'draft',
      authorId: currentUserId,
    }
  )

  // 画像ファイルリスト状態（最大4枚）
  const [images, setImages] = useState(initialFiles.filter(f => f.fileType === 'image'))

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

  // 画像アップロードハンドラ
  const handleImageUpload = e => {
    const files = Array.from(e.target.files || [])
    if (images.length + files.length > 4) {
      alert('写真は最大4枚までアップロードできます')
      return
    }

    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = e => {
        const newImage = {
          id: Date.now() + Math.random(),
          fileName: file.name,
          fileType: 'image',
          fileUrl: e.target?.result,
          preview: e.target?.result,
          fileSize: file.size,
          mimeType: file.type,
          description: `写真${images.length + 1}`,
          sortOrder: images.length,
        }
        setImages(prev => [...prev, newImage])
      }
      reader.readAsDataURL(file)
    })

    // input をリセット（同じファイルを再選択可能にする）
    e.target.value = ''
  }

  // 画像削除
  const handleRemoveImage = id => {
    setImages(prev => prev.filter(img => img.id !== id))
  }

  const handleSubmit = e => {
    e.preventDefault()
    onSave(
      {
        ...form,
        eventId: Number(form.eventId),
        authorId: currentUserId,
      },
      images
    )
  }

  const isValid =
    form.eventId &&
    form.title &&
    form.date &&
    form.weather &&
    form.participants &&
    form.accessInfo &&
    form.courseTime &&
    form.content

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. 基本情報 */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="font-medium mb-3 text-gray-700">1. 基本情報</h4>
        <div className="space-y-4">
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
            <div className="col-span-2">
              <FormField label="タイトル" required>
                <Input value={form.title} onChange={v => updateForm('title', v)} placeholder="例: 六甲山ハイキング" />
              </FormField>
            </div>
            <div className="col-span-2">
              <FormField label="サブタイトル（山名など）">
                <Input value={form.subtitle} onChange={v => updateForm('subtitle', v)} placeholder="例: 六甲山" />
              </FormField>
            </div>
            <FormField label="日程" required>
              <Input type="date" value={form.date} onChange={v => updateForm('date', v)} />
            </FormField>
            <FormField label="天候" required>
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
        </div>
      </div>

      {/* 2. 参加者 */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="font-medium mb-3 text-gray-700">2. 参加者</h4>
        <FormField label="参加者" required>
          <Textarea
            value={form.participants}
            onChange={v => updateForm('participants', v)}
            rows={2}
            placeholder="CL ○○、SL ○○、△△（会計）... 計○名"
          />
        </FormField>
      </div>

      {/* 3. アクセス・行程 */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="font-medium mb-3 text-gray-700">3. アクセス・行程</h4>
        <div className="space-y-4">
          <FormField label="アクセス" required>
            <Textarea
              value={form.accessInfo}
              onChange={v => updateForm('accessInfo', v)}
              rows={4}
              placeholder="集合: JR三ノ宮駅 8:30&#10;移動: 市バス16系統で摩耶ケーブル下まで"
            />
          </FormField>
          <FormField label="コースタイム" required>
            <Textarea
              value={form.courseTime}
              onChange={v => updateForm('courseTime', v)}
              rows={8}
              placeholder="8:30 出発&#10;9:15 摩耶ロープウェー&#10;10:00 掬星台到着&#10;..."
            />
          </FormField>
        </div>
      </div>

      {/* 4. 本文 */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="font-medium mb-3 text-gray-700">4. 本文</h4>
        <FormField label="本文（山行の様子）" required>
          <Textarea
            value={form.content}
            onChange={v => updateForm('content', v)}
            rows={15}
            placeholder="山行の様子を記述してください..."
          />
        </FormField>
      </div>

      {/* 5. 追加情報 */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="font-medium mb-3 text-gray-700">5. 追加情報</h4>
        <div className="space-y-4">
          <FormField label="コース状況">
            <Textarea
              value={form.courseCondition}
              onChange={v => updateForm('courseCondition', v)}
              rows={4}
              placeholder="道路状況、混雑度、積雪状況など"
            />
          </FormField>
          <FormField label="特記事項">
            <Textarea
              value={form.remarks}
              onChange={v => updateForm('remarks', v)}
              rows={4}
              placeholder="安全情報、ヒヤリハット、次回への申し送りなど"
            />
          </FormField>
        </div>
      </div>

      {/* 6. 写真アップロード */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="font-medium mb-3 text-gray-700">
          6. 写真アップロード
          <span className="text-sm font-normal text-gray-500 ml-2">（最大4枚、任意）</span>
        </h4>

        {/* 登録済み画像プレビュー */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            {images.map(image => (
              <div key={image.id} className="relative bg-white rounded-lg border overflow-hidden">
                <img src={image.preview || image.fileUrl} alt={image.fileName} className="w-full h-48 object-cover" />
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{image.fileName}</p>
                  <p className="text-xs text-gray-400">{(image.fileSize / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(image.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 画像アップロード */}
        {images.length < 4 && (
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 cursor-pointer">
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" id="image-upload" />
            <label htmlFor="image-upload" className="cursor-pointer block">
              <span className="text-4xl mb-2 block">📷</span>
              <span className="text-sm text-gray-600">クリックして画像を選択（{images.length}/4枚）</span>
            </label>
          </div>
        )}
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
                      {currentRental.eventId && ` (${getEventTitle(currentRental.eventId)})`} / 返却予定:{' '}
                      {formatDate(currentRental.dueDate)}
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
        <Textarea
          value={form.notes}
          onChange={v => updateForm('notes', v)}
          rows={3}
          placeholder="メーカー名、サイズ、注意事項など"
        />
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
                <div
                  key={rental.id}
                  className={`flex items-center justify-between p-3 rounded border ${isOverdue ? 'border-red-300 bg-red-50' : 'bg-gray-50'}`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span className="font-medium">{eq.name}</span>
                      {isOverdue && (
                        <Badge color="#ef4444" bgColor="#fee2e2">
                          期限超過
                        </Badge>
                      )}
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
          <Card className="p-8 text-center text-gray-400 col-span-2">貸出可能な装備がありません</Card>
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
        <Input type="date" value={dueDate} onChange={setDueDate} min={new Date().toISOString().split('T')[0]} />
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
                        <Badge color="#3b82f6" bgColor="#dbeafe">
                          貸出中
                        </Badge>
                      ) : (
                        <Badge color="#6b7280" bgColor="#f3f4f6">
                          返却済
                        </Badge>
                      )}
                      {isOverdue && (
                        <Badge color="#ef4444" bgColor="#fee2e2">
                          期限超過
                        </Badge>
                      )}
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
// 会員: 例会申し込み（参加申請）
// =============================================================================

function MemberApplicationView({events, applications, members, currentUserId, onApply}) {
  const [applyingEventId, setApplyingEventId] = useState(null)
  const [applyComment, setApplyComment] = useState('')

  const publishedEvents = events.filter(e => e.status === 'published')
  const getMemberName = id => members.find(m => m.id === id)?.name || ''

  const handleSubmitApplication = () => {
    if (!applyingEventId) return
    onApply(applyingEventId, applyComment)
    setApplyingEventId(null)
    setApplyComment('')
  }

  return (
    <div className="space-y-6">
      {/* 公開済み例会一覧 */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">公開中の例会</h3>
        {publishedEvents.length === 0 ? (
          <p className="text-gray-500 text-sm">公開中の例会はありません</p>
        ) : (
          <div className="space-y-3">
            {publishedEvents.map(event => {
              const myApp = applications.find(a => a.eventId === event.id && a.memberId === currentUserId)
              const cl = members.find(m => m.id === event.clId)
              return (
                <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge {...DEPARTMENTS[event.departmentId]}>{DEPARTMENTS[event.departmentId].name}</Badge>
                        <span className="font-bold">{event.title}</span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-0.5">
                        <div>📅 {formatDateRange(event.startDate, event.endDate)}</div>
                        <div>📍 {event.meetingPlace} {event.meetingTime}</div>
                        <div>👤 CL: {cl?.name || '未定'}</div>
                        <div>🏔️ コース: {event.course}</div>
                        <div>⏰ 締切: {formatDate(event.deadline)}</div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      {myApp ? (
                        <div className="text-center">
                          <Badge {...APPLICATION_STATUS[myApp.approvalStatus]}>
                            {APPLICATION_STATUS[myApp.approvalStatus].label}
                          </Badge>
                          {myApp.approvalStatus === 'rejected' && myApp.rejectionReason && (
                            <div className="mt-2 text-xs text-red-600 bg-red-50 rounded p-2 max-w-[200px]">
                              却下理由: {myApp.rejectionReason}
                            </div>
                          )}
                          {myApp.approvalStatus === 'approved' && (
                            <div className="mt-1 text-xs text-green-600">申請済み</div>
                          )}
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => setApplyingEventId(event.id)}>
                          参加申請
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* 自分の申請履歴 */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">自分の申請履歴</h3>
        {(() => {
          const myApps = applications.filter(a => a.memberId === currentUserId)
          if (myApps.length === 0) return <p className="text-gray-500 text-sm">申請履歴はありません</p>
          return (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="py-2 px-2">例会</th>
                  <th className="py-2 px-2">申請日</th>
                  <th className="py-2 px-2">コメント</th>
                  <th className="py-2 px-2">ステータス</th>
                  <th className="py-2 px-2">却下理由</th>
                </tr>
              </thead>
              <tbody>
                {myApps.map(app => {
                  const event = events.find(e => e.id === app.eventId)
                  return (
                    <tr key={app.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2 font-medium">{event?.title || '不明'}</td>
                      <td className="py-2 px-2 text-gray-500">{formatDate(app.createdAt)}</td>
                      <td className="py-2 px-2 text-gray-600">{app.comment || '—'}</td>
                      <td className="py-2 px-2">
                        <Badge {...APPLICATION_STATUS[app.approvalStatus]}>
                          {APPLICATION_STATUS[app.approvalStatus].label}
                        </Badge>
                      </td>
                      <td className="py-2 px-2 text-red-600 text-xs">{app.rejectionReason || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )
        })()}
      </Card>

      {/* 申請モーダル */}
      <Modal isOpen={!!applyingEventId} onClose={() => setApplyingEventId(null)} title="参加申請">
        {applyingEventId && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded p-3 text-sm">
              <p className="font-bold">{events.find(e => e.id === applyingEventId)?.title}</p>
              <p className="text-gray-600 mt-1">
                {formatDateRange(
                  events.find(e => e.id === applyingEventId)?.startDate,
                  events.find(e => e.id === applyingEventId)?.endDate
                )}
              </p>
            </div>
            <FormField label="コメント（任意）">
              <Textarea
                value={applyComment}
                onChange={setApplyComment}
                placeholder="CL/SLへの連絡事項があれば記入してください"
                rows={3}
              />
            </FormField>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setApplyingEventId(null)}>
                キャンセル
              </Button>
              <Button onClick={handleSubmitApplication}>申請を送信</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

// =============================================================================
// 管理者: 申請管理
// =============================================================================

function AdminApplicationView({events, applications, members, currentUserId, onApprove, onReject, onToggleAttended, initialEventId}) {
  const [selectedEventId, setSelectedEventId] = useState(initialEventId || null)
  const [rejectingAppId, setRejectingAppId] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isClosed, setIsClosed] = useState({}) // eventId → boolean

  const getMemberName = id => members.find(m => m.id === id)?.name || ''

  // 例会ごとの申請をグルーピング
  const eventIds = [...new Set(applications.map(a => a.eventId))]
  const eventList = eventIds
    .map(eid => events.find(e => e.id === eid))
    .filter(Boolean)
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))

  const currentEventId = selectedEventId || eventList[0]?.id
  const currentEventApps = applications.filter(a => a.eventId === currentEventId)
  const currentEvent = events.find(e => e.id === currentEventId)

  const handleReject = () => {
    if (!rejectionReason.trim()) return
    onReject(rejectingAppId, rejectionReason)
    setRejectingAppId(null)
    setRejectionReason('')
  }

  return (
    <div className="space-y-4">
      {/* 例会選択（モーダルから開いた場合は非表示） */}
      {!initialEventId && (
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">例会:</label>
          <Select
            value={currentEventId || ''}
            onChange={v => setSelectedEventId(Number(v))}
            options={eventList.map(e => ({value: e.id, label: `${e.title}（${formatDate(e.startDate)}）`}))}
          />
        </div>
      </Card>
      )}

      {currentEvent && (
        <>
          {/* 例会情報サマリー */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg">{currentEvent.title}</h3>
              <div className="flex items-center gap-2">
                {isClosed[currentEventId] ? (
                  <Badge color="#ef4444" bgColor="#fee2e2">申し込みクローズ済</Badge>
                ) : (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setIsClosed(prev => ({...prev, [currentEventId]: true}))}
                  >
                    申し込みクローズ
                  </Button>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-600 flex gap-4 flex-wrap">
              <span>📅 {formatDateRange(currentEvent.startDate, currentEvent.endDate)}</span>
              <span>👤 CL: {getMemberName(currentEvent.clId)}</span>
              <span>🛡️ 必要保険口数: {currentEvent.requiredInsurance}</span>
            </div>
            <div className="mt-3 flex gap-4 text-sm">
              <span className="text-green-600 font-medium">
                承認: {currentEventApps.filter(a => a.approvalStatus === 'approved').length}名
              </span>
              <span className="text-yellow-600 font-medium">
                審査中: {currentEventApps.filter(a => a.approvalStatus === 'pending').length}名
              </span>
              <span className="text-red-600 font-medium">
                却下: {currentEventApps.filter(a => a.approvalStatus === 'rejected').length}名
              </span>
            </div>
          </Card>

          {/* 申請一覧テーブル */}
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-gray-500">
                  <th className="py-3 px-4">申請者</th>
                  <th className="py-3 px-4">保険口数</th>
                  <th className="py-3 px-4">コメント</th>
                  <th className="py-3 px-4">ステータス</th>
                  <th className="py-3 px-4">操作</th>
                  {isClosed[currentEventId] && <th className="py-3 px-4">当日出席</th>}
                </tr>
              </thead>
              <tbody>
                {currentEventApps.length === 0 ? (
                  <tr>
                    <td colSpan={isClosed[currentEventId] ? 6 : 5} className="py-8 text-center text-gray-400">
                      申請はありません
                    </td>
                  </tr>
                ) : (
                  currentEventApps.map(app => {
                    const member = members.find(m => m.id === app.memberId)
                    const insuranceOk = member && member.insuranceKuchi >= currentEvent.requiredInsurance
                    return (
                      <tr key={app.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium">{member?.name || '不明'}</div>
                          <div className="text-xs text-gray-400">{member?.role}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={insuranceOk ? 'text-green-600' : 'text-red-600 font-bold'}>
                            {member?.insuranceKuchi || 0}口
                          </span>
                          {!insuranceOk && (
                            <span className="text-xs text-red-500 ml-1">（{currentEvent.requiredInsurance}口必要）</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-600">{app.comment || '—'}</td>
                        <td className="py-3 px-4">
                          <Badge {...APPLICATION_STATUS[app.approvalStatus]}>
                            {APPLICATION_STATUS[app.approvalStatus].label}
                          </Badge>
                          {app.approvalStatus === 'rejected' && (
                            <div className="text-xs text-red-500 mt-1">{app.rejectionReason}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {app.approvalStatus === 'pending' && !isClosed[currentEventId] && (
                            <div className="flex gap-1">
                              <Button variant="success" size="sm" onClick={() => onApprove(app.id)}>
                                承認
                              </Button>
                              <Button variant="danger" size="sm" onClick={() => setRejectingAppId(app.id)}>
                                却下
                              </Button>
                            </div>
                          )}
                          {app.approvalStatus !== 'pending' && (
                            <span className="text-xs text-gray-400">
                              {getMemberName(app.approvedBy)}が処理
                            </span>
                          )}
                        </td>
                        {isClosed[currentEventId] && (
                          <td className="py-3 px-4">
                            {app.approvalStatus === 'approved' && (
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={app.actualAttended}
                                  onChange={() => onToggleAttended(app.id)}
                                  className="w-4 h-4 rounded"
                                />
                                <span className="text-xs">{app.actualAttended ? '出席' : '未出席'}</span>
                              </label>
                            )}
                          </td>
                        )}
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {/* 却下理由モーダル */}
      <Modal isOpen={!!rejectingAppId} onClose={() => setRejectingAppId(null)} title="却下理由の入力">
        <div className="space-y-4">
          <FormField label="却下理由" required>
            <Textarea
              value={rejectionReason}
              onChange={setRejectionReason}
              placeholder="却下の理由を入力してください（申請者に通知されます）"
              rows={3}
            />
          </FormField>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRejectingAppId(null)}>
              キャンセル
            </Button>
            <Button variant="danger" onClick={handleReject} disabled={!rejectionReason.trim()}>
              却下する
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// =============================================================================
// 例会記録 A4表示・印刷
// =============================================================================

function RecordA4View({events, records, recordFiles, members, currentUserId, onSave, onTogglePublic, initialEvent}) {
  const [selectedRecordId, setSelectedRecordId] = useState(null)
  const [mode, setMode] = useState('list') // list, preview, edit
  const [editData, setEditData] = useState(null)

  const getMemberName = id => members.find(m => m.id === id)?.name || ''

  const selectedRecord = records.find(r => r.id === selectedRecordId)
  const selectedFiles = recordFiles.filter(f => f.recordId === selectedRecordId)

  // 新規記録の初期データを作成
  const createNewRecordData = () => {
    const event = initialEvent || events[0]
    return {
      eventId: event?.id,
      title: event?.title || '',
      date: event?.dateFrom || new Date().toISOString().split('T')[0],
      weather: '',
      participants: event ? members.filter(m => !m.isDeleted).slice(0, 3).map(m => m.name).join('、') : '',
      content: '',
      accessInfo: '',
      courseTime: '',
      courseCondition: '',
      remarks: '',
      authorId: currentUserId,
      status: 'draft',
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-4">
      {/* 印刷用CSS */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            min-height: 297mm;
            padding: 15mm;
            margin: 0;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {mode === 'list' && (
        <>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">例会記録一覧（A4表示対応）</h3>
              <Button
                onClick={() => {
                  setEditData(createNewRecordData())
                  setSelectedRecordId(null)
                  setMode('edit')
                }}
              >
                ＋ 新規作成
              </Button>
            </div>
            {records.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-3">📝</div>
                <p className="text-gray-500 mb-4">この例会の記録はまだありません</p>
                <Button
                  onClick={() => {
                    setEditData(createNewRecordData())
                    setSelectedRecordId(null)
                    setMode('edit')
                  }}
                >
                  記録を作成する
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {records.map(record => {
                  const event = events.find(e => e.id === record.eventId)
                  const files = recordFiles.filter(f => f.recordId === record.id)
                  const publicFiles = files.filter(f => f.isPublic)
                  return (
                    <div
                      key={record.id}
                      className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                      onClick={() => {
                        setSelectedRecordId(record.id)
                        setMode('preview')
                      }}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{record.title}</span>
                          <Badge color={RECORD_STATUS[record.status].color} bgColor="#f3f4f6">
                            {RECORD_STATUS[record.status].label}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {formatDate(record.date)} / 作成者: {getMemberName(record.authorId)} / 写真{files.length}枚（公開{publicFiles.length}枚）
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={e => {
                            e.stopPropagation()
                            setSelectedRecordId(record.id)
                            setMode('preview')
                          }}
                        >
                          A4表示
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={e => {
                            e.stopPropagation()
                            setSelectedRecordId(record.id)
                            setEditData({...record})
                            setMode('edit')
                          }}
                        >
                          編集
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </>
      )}

      {mode === 'preview' && selectedRecord && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 no-print">
            <Button variant="secondary" onClick={() => setMode('list')}>
              ← 一覧に戻る
            </Button>
            <Button onClick={handlePrint}>🖨️ 印刷</Button>
            <Button
              variant="secondary"
              onClick={() => {
                setEditData({...selectedRecord})
                setMode('edit')
              }}
            >
              編集
            </Button>
          </div>

          {/* A4プレビュー */}
          <div className="flex justify-center">
            <div
              className="print-area bg-white shadow-lg border"
              style={{
                width: '210mm',
                minHeight: '297mm',
                padding: '15mm',
                fontFamily: 'serif',
              }}
            >
              {/* ヘッダー */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold mb-1">例会記録</h1>
                <div className="text-sm text-gray-600">神戸勤労者山岳会（KCAC）</div>
              </div>

              {/* 基本情報テーブル */}
              <table className="w-full border-collapse border text-sm mb-6">
                <tbody>
                  <tr>
                    <th className="border px-3 py-1.5 bg-gray-100 text-left w-24">例会名</th>
                    <td className="border px-3 py-1.5" colSpan={3}>{selectedRecord.title}</td>
                  </tr>
                  <tr>
                    <th className="border px-3 py-1.5 bg-gray-100 text-left">日程</th>
                    <td className="border px-3 py-1.5">{selectedRecord.date}</td>
                    <th className="border px-3 py-1.5 bg-gray-100 text-left w-24">天候</th>
                    <td className="border px-3 py-1.5">{selectedRecord.weather}</td>
                  </tr>
                  <tr>
                    <th className="border px-3 py-1.5 bg-gray-100 text-left">参加者</th>
                    <td className="border px-3 py-1.5" colSpan={3}>{selectedRecord.participants}</td>
                  </tr>
                </tbody>
              </table>

              {/* アクセス情報 */}
              {selectedRecord.accessInfo && (
                <div className="mb-4">
                  <h3 className="font-bold text-sm border-b pb-1 mb-2">アクセス</h3>
                  <div className="text-sm whitespace-pre-line">{selectedRecord.accessInfo}</div>
                </div>
              )}

              {/* コースタイム */}
              {selectedRecord.courseTime && (
                <div className="mb-4">
                  <h3 className="font-bold text-sm border-b pb-1 mb-2">コースタイム</h3>
                  <div className="text-sm whitespace-pre-line">{selectedRecord.courseTime}</div>
                </div>
              )}

              {/* 本文 */}
              <div className="mb-4">
                <h3 className="font-bold text-sm border-b pb-1 mb-2">記録</h3>
                <div className="text-sm whitespace-pre-line leading-relaxed">{selectedRecord.content}</div>
              </div>

              {/* コース状況 */}
              {selectedRecord.courseCondition && (
                <div className="mb-4">
                  <h3 className="font-bold text-sm border-b pb-1 mb-2">コース状況</h3>
                  <div className="text-sm whitespace-pre-line">{selectedRecord.courseCondition}</div>
                </div>
              )}

              {/* 備考 */}
              {selectedRecord.remarks && (
                <div className="mb-4">
                  <h3 className="font-bold text-sm border-b pb-1 mb-2">備考</h3>
                  <div className="text-sm whitespace-pre-line">{selectedRecord.remarks}</div>
                </div>
              )}

              {/* 画像 */}
              {selectedFiles.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-bold text-sm border-b pb-1 mb-2">写真</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedFiles.map(file => (
                      <div key={file.id} className="text-center">
                        {file.fileType === 'image' && (
                          <img
                            src={file.fileUrl}
                            alt={file.description || file.fileName}
                            className="w-full h-32 object-cover border rounded"
                          />
                        )}
                        <div className="text-xs text-gray-500 mt-1">{file.description || file.fileName}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* フッター */}
              <div className="text-right text-xs text-gray-400 mt-8 pt-4 border-t">
                作成者: {getMemberName(selectedRecord.authorId)} / 作成日: {selectedRecord.createdAt}
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === 'edit' && editData && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setMode('list')}>
              ← 一覧に戻る
            </Button>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">{editData.id ? '例会記録の編集' : '例会記録の新規作成'}</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="タイトル" required>
                <Input value={editData.title} onChange={v => setEditData(prev => ({...prev, title: v}))} />
              </FormField>
              <FormField label="日付" required>
                <Input type="date" value={editData.date} onChange={v => setEditData(prev => ({...prev, date: v}))} />
              </FormField>
              <FormField label="天候">
                <Input value={editData.weather} onChange={v => setEditData(prev => ({...prev, weather: v}))} />
              </FormField>
              <FormField label="参加者">
                <Input value={editData.participants} onChange={v => setEditData(prev => ({...prev, participants: v}))} />
              </FormField>
            </div>
            <FormField label="アクセス情報">
              <Textarea
                value={editData.accessInfo}
                onChange={v => setEditData(prev => ({...prev, accessInfo: v}))}
                rows={3}
              />
            </FormField>
            <FormField label="コースタイム">
              <Textarea
                value={editData.courseTime}
                onChange={v => setEditData(prev => ({...prev, courseTime: v}))}
                rows={4}
              />
            </FormField>
            <FormField label="記録本文" required>
              <Textarea
                value={editData.content}
                onChange={v => setEditData(prev => ({...prev, content: v}))}
                rows={6}
              />
            </FormField>
            <FormField label="コース状況">
              <Textarea
                value={editData.courseCondition}
                onChange={v => setEditData(prev => ({...prev, courseCondition: v}))}
                rows={3}
              />
            </FormField>
            <FormField label="備考">
              <Textarea
                value={editData.remarks}
                onChange={v => setEditData(prev => ({...prev, remarks: v}))}
                rows={2}
              />
            </FormField>

            {/* ファイル一覧と公開フラグ */}
            {selectedFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="font-bold text-sm mb-2">添付ファイル</h4>
                <div className="space-y-2">
                  {selectedFiles.map(file => (
                    <div key={file.id} className="flex items-center gap-3 border rounded p-2">
                      {file.fileType === 'image' && (
                        <img src={file.fileUrl} alt="" className="w-16 h-12 object-cover rounded" />
                      )}
                      {file.fileType === 'pdf' && (
                        <div className="w-16 h-12 bg-red-50 rounded flex items-center justify-center text-red-500 text-xs">
                          PDF
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-medium">{file.fileName}</div>
                        <div className="text-xs text-gray-500">{file.description}</div>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={file.isPublic || false}
                          onChange={() => onTogglePublic(file.id)}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-sm">外部公開</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ファイルアップロード（モック） */}
            <div className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="text-gray-400 text-3xl mb-2">📎</div>
              <p className="text-sm text-gray-500">ファイルをドラッグ＆ドロップまたはクリックして追加</p>
              <p className="text-xs text-gray-400 mt-1">画像(JPG, PNG) / PDF対応</p>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="secondary" onClick={() => setMode('list')}>
                キャンセル
              </Button>
              <Button
                onClick={() => {
                  onSave(editData, selectedFiles)
                  setMode('preview')
                }}
              >
                保存
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  onSave(editData, selectedFiles)
                  setMode('preview')
                }}
              >
                保存してプレビュー
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// 外部公開データ出力
// =============================================================================

function ExportPublicDataView({events, records, recordFiles, members}) {
  const [selectedRecordIds, setSelectedRecordIds] = useState([])
  const [showCsvPreview, setShowCsvPreview] = useState(false)

  const getMemberName = id => members.find(m => m.id === id)?.name || ''

  const toggleRecord = recordId => {
    setSelectedRecordIds(prev => (prev.includes(recordId) ? prev.filter(id => id !== recordId) : [...prev, recordId]))
  }

  const toggleAll = () => {
    if (selectedRecordIds.length === records.length) {
      setSelectedRecordIds([])
    } else {
      setSelectedRecordIds(records.map(r => r.id))
    }
  }

  // CSV生成
  const generateCsvData = () => {
    const selectedRecords = records.filter(r => selectedRecordIds.includes(r.id))
    const headers = ['例会名', '日程', '天候', '参加者', 'コース', '記録', '作成者', '公開画像数']
    const rows = selectedRecords.map(record => {
      const event = events.find(e => e.id === record.eventId)
      const publicFiles = recordFiles.filter(f => f.recordId === record.id && f.isPublic)
      return [
        record.title,
        record.date,
        record.weather,
        record.participants,
        event?.course || '',
        record.content?.replace(/\n/g, ' ').slice(0, 100) + '...',
        getMemberName(record.authorId),
        publicFiles.length,
      ]
    })
    return {headers, rows}
  }

  const handleExportCsv = () => {
    if (selectedRecordIds.length === 0) return
    const {headers, rows} = generateCsvData()
    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        row
          .map(cell => {
            const s = String(cell)
            if (s.includes(',') || s.includes('"') || s.includes('\n')) {
              return `"${s.replace(/"/g, '""')}"`
            }
            return s
          })
          .join(',')
      ),
    ].join('\n')

    const bom = '\uFEFF'
    const blob = new Blob([bom + csvContent], {type: 'text/csv;charset=utf-8;'})
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `yamanokai_public_records_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const handleExportZip = () => {
    if (selectedRecordIds.length === 0) return
    const selectedRecords = records.filter(r => selectedRecordIds.includes(r.id))
    const publicFilesList = selectedRecords.flatMap(record => {
      const files = recordFiles.filter(f => f.recordId === record.id && f.isPublic && f.fileType === 'image')
      return files.map(f => `${record.title}/${f.fileName}`)
    })
    console.log('ZIP出力（モック）:', publicFilesList)
    // モック：ダウンロードの代わりにログ出力
    const message = [
      `ZIP出力内容（${publicFilesList.length}ファイル）:`,
      '',
      ...publicFilesList.map((f, i) => `  ${i + 1}. ${f}`),
    ].join('\n')
    const blob = new Blob([message], {type: 'text/plain'})
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `yamanokai_public_images_${new Date().toISOString().split('T')[0]}_filelist.txt`
    link.click()
  }

  return (
    <div className="space-y-4">
      {/* 操作パネル */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-lg">外部公開データ出力</h3>
            <span className="text-sm text-gray-500">
              {selectedRecordIds.length > 0
                ? `${selectedRecordIds.length}件選択中`
                : '記録を選択してください'}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowCsvPreview(!showCsvPreview)}
              disabled={selectedRecordIds.length === 0}
            >
              {showCsvPreview ? 'プレビューを閉じる' : 'CSVプレビュー'}
            </Button>
            <Button size="sm" onClick={handleExportCsv} disabled={selectedRecordIds.length === 0}>
              📄 CSV出力
            </Button>
            <Button size="sm" variant="success" onClick={handleExportZip} disabled={selectedRecordIds.length === 0}>
              🗂️ 画像ZIP出力
            </Button>
          </div>
        </div>
      </Card>

      {/* 記録選択テーブル */}
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-gray-500">
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  checked={selectedRecordIds.length === records.length && records.length > 0}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded"
                />
              </th>
              <th className="py-3 px-4">例会名</th>
              <th className="py-3 px-4">日程</th>
              <th className="py-3 px-4">作成者</th>
              <th className="py-3 px-4">ステータス</th>
              <th className="py-3 px-4">写真数</th>
              <th className="py-3 px-4">公開写真数</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400">
                  記録はありません
                </td>
              </tr>
            ) : (
              records.map(record => {
                const files = recordFiles.filter(f => f.recordId === record.id)
                const publicFiles = files.filter(f => f.isPublic)
                return (
                  <tr
                    key={record.id}
                    className={`border-b cursor-pointer ${
                      selectedRecordIds.includes(record.id) ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => toggleRecord(record.id)}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedRecordIds.includes(record.id)}
                        onChange={() => toggleRecord(record.id)}
                        className="w-4 h-4 rounded"
                      />
                    </td>
                    <td className="py-3 px-4 font-medium">{record.title}</td>
                    <td className="py-3 px-4 text-gray-500">{formatDate(record.date)}</td>
                    <td className="py-3 px-4 text-gray-600">{getMemberName(record.authorId)}</td>
                    <td className="py-3 px-4">
                      <Badge color={RECORD_STATUS[record.status].color} bgColor="#f3f4f6">
                        {RECORD_STATUS[record.status].label}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{files.length}枚</td>
                    <td className="py-3 px-4">
                      <span className={publicFiles.length > 0 ? 'text-green-600 font-medium' : 'text-gray-400'}>
                        {publicFiles.length}枚
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </Card>

      {/* CSVプレビュー */}
      {showCsvPreview && selectedRecordIds.length > 0 && (
        <Card className="p-4">
          <h4 className="font-bold text-sm mb-3">CSVプレビュー</h4>
          {(() => {
            const {headers, rows} = generateCsvData()
            return (
              <div className="overflow-x-auto">
                <table className="text-xs border-collapse">
                  <thead>
                    <tr>
                      {headers.map((h, i) => (
                        <th key={i} className="border px-2 py-1 bg-gray-100 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td key={ci} className="border px-2 py-1 whitespace-nowrap max-w-[200px] truncate">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })()}
        </Card>
      )}

      {/* 公開ファイル一覧 */}
      {selectedRecordIds.length > 0 && (
        <Card className="p-4">
          <h4 className="font-bold text-sm mb-3">選択中の記録の公開ファイル</h4>
          {(() => {
            const selectedRecords = records.filter(r => selectedRecordIds.includes(r.id))
            const allPublicFiles = selectedRecords.flatMap(record => {
              const files = recordFiles.filter(f => f.recordId === record.id && f.isPublic)
              return files.map(f => ({...f, recordTitle: record.title}))
            })
            if (allPublicFiles.length === 0) {
              return <p className="text-gray-500 text-sm">公開ファイルはありません</p>
            }
            return (
              <div className="grid grid-cols-4 gap-3">
                {allPublicFiles.map(file => (
                  <div key={file.id} className="border rounded p-2 text-center">
                    {file.fileType === 'image' && (
                      <img src={file.fileUrl} alt="" className="w-full h-20 object-cover rounded mb-1" />
                    )}
                    <div className="text-xs font-medium truncate">{file.fileName}</div>
                    <div className="text-xs text-gray-400 truncate">{file.recordTitle}</div>
                  </div>
                ))}
              </div>
            )
          })()}
        </Card>
      )}
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
      fields: ['id', 'name', 'email', 'phone', 'insuranceKuchi', 'departmentId', 'roleId', 'isAdmin', 'isActive'],
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

    // 参加申し込み・記録データ
    YamanokaiApplication: {
      category: 'application',
      label: '参加申し込み',
      color: '#8b5cf6',
      fields: ['id', 'eventId', 'memberId', 'comment', 'approvalStatus', 'rejectionReason', 'approvedBy', 'actualAttended'],
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
    {from: 'YamanokaiMember', to: 'YamanokaiApplication', label: '1:N', type: 'one-to-many'},
    {from: 'YamanokaiMember', to: 'YamanokaiRecord', label: '1:N', type: 'one-to-many'},
    {from: 'YamanokaiMember', to: 'YamanokaiEquipmentLoan', label: '1:N', type: 'one-to-many'},
    {from: 'YamanokaiMember', to: 'YamanokaiEventPlanParticipant', label: '1:N', type: 'one-to-many'},

    // 講座との関係
    {from: 'YamanokaiCourse', to: 'YamanokaiCourseCompletion', label: '1:N', type: 'one-to-many'},

    // 例会との関係
    {from: 'YamanokaiEvent', to: 'YamanokaiApplication', label: '1:N', type: 'one-to-many'},
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
    {id: 'application', label: '申し込みデータ', color: '#8b5cf6'},
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
        <p className="text-sm text-gray-600 mb-4">Prismaスキーマで定義されたテーブル間の関係性を図示しています。</p>

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
              relations.some(r => (r.from === hoveredTable && r.to === name) || (r.to === hoveredTable && r.from === name))

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
