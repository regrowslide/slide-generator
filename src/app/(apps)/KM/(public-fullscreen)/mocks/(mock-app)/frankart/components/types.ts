// 案件ステータス（実業務フローに即した10段階）
export type DealStatus =
  | 'entry'        // エントリー済
  | 'pre-meeting'  // 商談準備中
  | 'meeting'      // 商談中
  | 'proposal'     // 提案中
  | 'estimate-sent'// 見積提出
  | 'won'          // 受注
  | 'in-progress'  // 進行中
  | 'completed'    // 完了
  | 'lost'         // 失注
  | 'on-hold'      // 保留

// リード元
export type LeadSource = 'matching' | 'advisor' | 'web' | 'exhibition' | 'cold-call' | 'existing'

// NDA・契約ステータス
export type ContractStatus = 'none' | 'preparing' | 'sent' | 'signed'

// 見積ステータス
export type EstimateStatus = 'draft' | 'sent' | 'approved' | 'rejected'

// ファイル種別
export type FileType = 'estimate' | 'contract' | 'nda' | 'minutes' | 'proposal' | 'rfp' | 'other'

// ページID
export type PageId = 'dashboard' | 'deal-list' | 'deal-room' | 'contacts' | 'settings'

// 担当者
export type Staff = {
  id: string
  name: string
  role: string
}

// 取引先企業
export type Company = {
  id: string
  name: string
  industry: string
  address: string
  phone: string
  contacts: Contact[]
}

// 連絡先
export type Contact = {
  id: string
  name: string
  position: string
  email: string
  phone: string
}

// 顧問
export type Advisor = {
  id: string
  name: string
  specialty: string
  firm: string
  phone: string
  email: string
}

// 案件（営業管理シートの項目を反映）
export type Deal = {
  id: string
  title: string
  companyId: string
  companyName: string
  contactIds: string[]        // 取引先担当者（複数選択）
  industry: string            // 業種
  status: DealStatus
  leadSource: LeadSource
  matchingService: string     // マッチングサービス名（matching時）
  referralAdvisor: string     // 紹介顧問名（advisor時）
  assigneeIds: string[]       // 自社担当者（複数選択）
  amount: number              // 見込み金額
  probability: number         // 受注確度 (0-100)
  entryDate: string           // エントリー日
  nextFollowUp: string        // 次回フォロー日
  thanksEmailDone: boolean    // お礼メール送信済み
  techAttendee: string        // 技術同席者（山口等）
  ndaStatus: ContractStatus   // NDA締結状況
  contractStatus: ContractStatus  // 契約締結状況
  contractRenewalDate: string // 契約更新日
  advisorFeeRequired: boolean // 顧問報酬発生有無
  advisorFeeAmount: number    // 顧問報酬金額
  description: string
  createdAt: string
  updatedAt: string
}

// 商談
export type Meeting = {
  id: string
  dealId: string
  dealTitle: string
  companyName: string
  date: string
  time: string
  location: string
  attendees: string[]
  agenda: string
  minutes: string
  followUpDone: boolean
}

// 見積
export type Estimate = {
  id: string
  dealId: string
  title: string
  status: EstimateStatus
  items: EstimateItem[]
  totalAmount: number
  createdAt: string
  updatedAt: string
}

// 見積品目
export type EstimateItem = {
  id: string
  name: string
  quantity: number
  unitPrice: number
  amount: number
}

// チャットメッセージ
export type ChatMessage = {
  id: string
  dealId: string
  senderId: string
  senderName: string
  content: string
  timestamp: string
}

// ToDo
export type Todo = {
  id: string
  dealId: string
  title: string
  assigneeId: string
  assigneeName: string
  dueDate: string
  completed: boolean
  createdAt: string
}

// ファイルアイテム
export type FileItem = {
  id: string
  dealId: string
  name: string
  type: FileType
  size: string
  uploadedBy: string
  uploadedAt: string
}
