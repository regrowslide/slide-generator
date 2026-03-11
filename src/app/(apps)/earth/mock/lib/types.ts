// 型定義

export type Owner = {
  id: string
  name: string
  category: '個人' | '法人'
  phone: string
  email: string
  contractType: '受託管理' | 'サブリース'
  propertyCount: number
}

export type Property = {
  id: string
  ownerId: string
  name: string
  address: string
  type: string
  totalUnits: number
  vacantUnits: number
  assignees: string[]
}

export type Tenant = {
  id: string
  propertyId: string
  room: string
  name: string
  rent: number
  contractStart: string
  contractEnd: string
  status: '入居中' | '退去予定' | '空室'
}

export type ActionItem = {
  id: string
  propertyId: string
  title: string
  category: '修繕' | '募集' | '契約' | '報告' | '管理' | 'クレーム' | 'その他'
  status: '未着手' | '進行中' | '完了'
  priority: '高' | '中' | '低'
  dueDate: string
  assignee: string
  description: string
}

export type RepairRecord = {
  id: string
  propertyId: string
  category: '水漏れ' | '補修' | '電気' | 'その他'
  content: string
  status: '未着手' | '対応中' | '完了'
  dueDate: string
  createdAt: string
  repairVendorId?: string
  logs: RepairLog[]
}

export type RepairLog = {
  date: string
  comment: string
}

export type StoredFile = {
  id: string
  propertyId: string
  name: string
  type: 'PDF' | '画像' | '動画' | 'Word' | 'Excel' | 'その他'
  size: string
  uploadedAt: string
  uploadedBy: string
}

export type ChatMessage = {
  id: string
  propertyId: string
  chatType: 'internal' | 'owner' | 'tenant' | 'vendor'
  senderRole: 'staff' | 'owner' | 'tenant' | 'vendor'
  senderName: string
  message: string
  timestamp: string
  scheduledAt?: string
  tenantId?: string
  vendorId?: string
  repairRequestId?: string
}

export type BlobFile = {
  id: string
  propertyId: string
  name: string
  url: string
  size: number
  uploadedAt: string
  uploadedBy: string
}

export type RepairVendor = {
  id: string
  name: string
  phone: string
  email: string
  specialty: string
}

export type RepairRequest = {
  id: string
  repairRecordId: string
  propertyId: string
  vendorId: string
  status: '依頼中' | '受注' | '完了'
  estimateMessage?: string
  logs: { date: string; comment: string }[]
}

export type MonthlySales = {
  month: string
  revenue: number
}

export type PortalType = 'staff' | 'owner' | 'vendor'

export type CurrentUser = {
  name: string
  role: PortalType
  ownerId?: string
  vendorId?: string
}
