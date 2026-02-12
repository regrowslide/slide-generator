// =============================================================================
// 定数・マスターデータ
// =============================================================================

/** 部署 */
export const DEPARTMENTS = {
  hiking: {id: 'hiking', name: 'ハイキング部', color: '#22c55e', bgColor: '#dcfce7'},
  sanko: {id: 'sanko', name: '山行部', color: '#3b82f6', bgColor: '#dbeafe'},
  education: {id: 'education', name: '教育部', color: '#a855f7', bgColor: '#f3e8ff'},
  nature: {id: 'nature', name: '自然保護部', color: '#eab308', bgColor: '#fef9c3'},
  organization: {id: 'organization', name: '組織部', color: '#6b7280', bgColor: '#f3f4f6'},
}

/** 体力度グレード */
export const STAMINA_GRADES = ['(^^)', 'O(-)', 'O', 'O(+)', 'OO', 'OOO', 'OOOO']

/** 技術度グレード */
export const SKILL_GRADES = ['なし', '☆', '☆☆', '☆☆☆']

/** 岩登り区分 */
export const ROCK_CATEGORIES = ['なし', 'A', 'B', 'C']

/** 例会ステータス */
export const EVENT_STATUS = {
  draft: {id: 'draft', label: '下書き', color: '#6b7280', bgColor: '#f3f4f6'},
  polished: {id: 'polished', label: '清書', color: '#3b82f6', bgColor: '#dbeafe'},
  published: {id: 'published', label: '公開済み', color: '#22c55e', bgColor: '#dcfce7'},
}

/** 記録ステータス */
export const RECORD_STATUS = {
  draft: {id: 'draft', label: '下書き', color: '#6b7280'},
  submitted: {id: 'submitted', label: '提出済', color: '#3b82f6'},
  published: {id: 'published', label: '掲載済', color: '#22c55e'},
}

/** 参加申請ステータス */
export const APPLICATION_STATUS = {
  pending: {id: 'pending', label: '審査中', color: '#eab308', bgColor: '#fef9c3'},
  approved: {id: 'approved', label: '承認', color: '#22c55e', bgColor: '#dcfce7'},
  rejected: {id: 'rejected', label: '却下', color: '#ef4444', bgColor: '#fee2e2'},
}

/** 装備カテゴリ */
export const EQUIPMENT_CATEGORIES = {
  tent: {id: 'tent', name: 'テント', icon: '⛺', color: '#22c55e', bgColor: '#dcfce7'},
  rope: {id: 'rope', name: 'ロープ', icon: '🧵', color: '#3b82f6', bgColor: '#dbeafe'},
  radio: {id: 'radio', name: '無線機', icon: '📻', color: '#a855f7', bgColor: '#f3e8ff'},
  climbing: {id: 'climbing', name: '登攀具', icon: '🧗', color: '#f97316', bgColor: '#ffedd5'},
  cooking: {id: 'cooking', name: '調理器具', icon: '🍳', color: '#eab308', bgColor: '#fef9c3'},
  other: {id: 'other', name: 'その他', icon: '📦', color: '#6b7280', bgColor: '#f3f4f6'},
}

/** 装備状態 */
export const EQUIPMENT_CONDITIONS = {
  good: {id: 'good', label: '良好', color: '#22c55e', bgColor: '#dcfce7'},
  needsCheck: {id: 'needsCheck', label: '要点検', color: '#eab308', bgColor: '#fef9c3'},
  repairing: {id: 'repairing', label: '修理中', color: '#ef4444', bgColor: '#fee2e2'},
}

/** 装備ステータス */
export const EQUIPMENT_STATUS = {
  available: {id: 'available', label: '貸出可', color: '#22c55e', bgColor: '#dcfce7'},
  rented: {id: 'rented', label: '貸出中', color: '#3b82f6', bgColor: '#dbeafe'},
  maintenance: {id: 'maintenance', label: 'メンテナンス中', color: '#ef4444', bgColor: '#fee2e2'},
}

// =============================================================================
// 初期データ
// =============================================================================

/** 会員マスター */
export const INITIAL_MEMBERS = [
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
export const INITIAL_EVENTS = [
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
export const INITIAL_RECORDS = [
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
export const INITIAL_RECORD_FILES = [
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
export const INITIAL_APPLICATIONS = [
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
export const INITIAL_EQUIPMENT = [
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
export const INITIAL_RENTALS = [
  {id: 1, equipmentId: 3, memberId: 2, eventId: 2, rentDate: '2026-02-12', dueDate: '2026-02-17', returnDate: null, notes: '西穂高岳で使用', isDeleted: false},
  {id: 2, equipmentId: 5, memberId: 5, eventId: 2, rentDate: '2026-02-12', dueDate: '2026-02-17', returnDate: null, notes: '', isDeleted: false},
  {id: 3, equipmentId: 8, memberId: 7, eventId: null, rentDate: '2026-01-20', dueDate: '2026-01-25', returnDate: null, notes: '個人練習用（期限超過中）', isDeleted: false},
  {id: 4, equipmentId: 4, memberId: 3, eventId: 1, rentDate: '2026-02-01', dueDate: '2026-02-08', returnDate: '2026-02-08', notes: 'クリーンハイクで使用', isDeleted: false},
]

// =============================================================================
// ユーティリティ
// =============================================================================

/** 日付フォーマット */
export const formatDate = dateStr => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  return `${d.getMonth() + 1}/${d.getDate()}(${weekdays[d.getDay()]})`
}

/** 日付範囲フォーマット */
export const formatDateRange = (start, end) => {
  if (start === end) return formatDate(start)
  return `${formatDate(start)}〜${formatDate(end)}`
}

/** ID生成 */
export const generateId = arr => Math.max(0, ...arr.map(x => x.id)) + 1
