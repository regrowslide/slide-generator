import type { Owner, Property, Tenant, ActionItem, RepairRecord, StoredFile, ChatMessage, RepairVendor, RepairRequest, MonthlySales, PortalType, CurrentUser } from './types'

export const OWNERS: Owner[] = [
  { id: 'O001', name: '山田太郎', category: '個人', phone: '090-1234-5678', email: 'yamada@example.com', contractType: '受託管理', propertyCount: 2 },
  { id: 'O002', name: '(株)サンライズ不動産', category: '法人', phone: '03-1111-2222', email: 'sunrise@example.com', contractType: 'サブリース', propertyCount: 1 },
  { id: 'O003', name: '佐藤花子', category: '個人', phone: '080-3333-4444', email: 'sato@example.com', contractType: '受託管理', propertyCount: 1 },
  { id: 'O004', name: '(有)グリーンエステート', category: '法人', phone: '045-5555-6666', email: 'green@example.com', contractType: 'サブリース', propertyCount: 2 },
  { id: 'O005', name: '田中一郎', category: '個人', phone: '070-7777-8888', email: 'tanaka@example.com', contractType: '受託管理', propertyCount: 1 },
]

export const PROPERTIES: Property[] = [
  { id: 'P001', ownerId: 'O001', name: 'サンプルマンションA', address: '東京都渋谷区神南1-1-1', type: 'マンション', totalUnits: 12, vacantUnits: 2, assignees: ['佐藤', '田中'] },
  { id: 'P002', ownerId: 'O001', name: 'メゾン山田', address: '東京都世田谷区三軒茶屋2-2-2', type: 'アパート', totalUnits: 6, vacantUnits: 1, assignees: ['高橋'] },
  { id: 'P003', ownerId: 'O002', name: 'サンライズタワー', address: '横浜市西区みなとみらい3-3-3', type: 'マンション', totalUnits: 24, vacantUnits: 3, assignees: ['佐藤', '田中'] },
  { id: 'P004', ownerId: 'O003', name: 'コーポ佐藤', address: '川崎市中原区小杉4-4-4', type: 'アパート', totalUnits: 8, vacantUnits: 0, assignees: ['高橋'] },
  { id: 'P005', ownerId: 'O004', name: 'グリーンハイツ', address: '東京都目黒区自由が丘5-5-5', type: 'マンション', totalUnits: 16, vacantUnits: 2, assignees: ['佐藤'] },
  { id: 'P006', ownerId: 'O004', name: 'グリーンコート', address: '横浜市青葉区美しが丘6-6-6', type: 'アパート', totalUnits: 10, vacantUnits: 1, assignees: ['田中'] },
  { id: 'P007', ownerId: 'O005', name: '田中ビル', address: '東京都新宿区西新宿7-7-7', type: 'ビル', totalUnits: 6, vacantUnits: 1, assignees: ['佐藤'] },
]

export const TENANTS: Tenant[] = [
  { id: 'T001', propertyId: 'P001', room: '101', name: '鈴木健太', rent: 85000, contractStart: '2024-04-01', contractEnd: '2026-03-31', status: '入居中' },
  { id: 'T002', propertyId: 'P001', room: '102', name: '', rent: 80000, contractStart: '', contractEnd: '', status: '空室' },
  { id: 'T003', propertyId: 'P001', room: '201', name: '高橋美咲', rent: 90000, contractStart: '2023-10-01', contractEnd: '2025-09-30', status: '入居中' },
  { id: 'T004', propertyId: 'P001', room: '202', name: '佐々木健', rent: 88000, contractStart: '2025-01-01', contractEnd: '2027-01-31', status: '入居中' },
  { id: 'T005', propertyId: 'P001', room: '301', name: '松本大輔', rent: 92000, contractStart: '2024-07-01', contractEnd: '2026-06-30', status: '退去予定' },
  { id: 'T006', propertyId: 'P001', room: '302', name: '', rent: 90000, contractStart: '', contractEnd: '', status: '空室' },
  { id: 'T007', propertyId: 'P002', room: '101', name: '中村優子', rent: 65000, contractStart: '2024-03-01', contractEnd: '2026-02-28', status: '入居中' },
  { id: 'T008', propertyId: 'P002', room: '102', name: '小林裕太', rent: 63000, contractStart: '2025-05-01', contractEnd: '2027-04-30', status: '入居中' },
  { id: 'T009', propertyId: 'P002', room: '201', name: '', rent: 67000, contractStart: '', contractEnd: '', status: '空室' },
  { id: 'T010', propertyId: 'P003', room: '501', name: '加藤真一', rent: 120000, contractStart: '2024-01-01', contractEnd: '2025-12-31', status: '入居中' },
  { id: 'T011', propertyId: 'P003', room: '502', name: '伊藤裕美', rent: 115000, contractStart: '2025-03-01', contractEnd: '2027-02-28', status: '入居中' },
  { id: 'T012', propertyId: 'P004', room: '101', name: '渡辺拓也', rent: 72000, contractStart: '2023-08-01', contractEnd: '2025-07-31', status: '入居中' },
  { id: 'T013', propertyId: 'P005', room: '301', name: '木村隆', rent: 105000, contractStart: '2024-06-01', contractEnd: '2026-05-31', status: '入居中' },
  { id: 'T014', propertyId: 'P005', room: '302', name: '', rent: 100000, contractStart: '', contractEnd: '', status: '空室' },
  { id: 'T015', propertyId: 'P007', room: '3F', name: '(株)テクノワークス', rent: 180000, contractStart: '2024-04-01', contractEnd: '2027-03-31', status: '入居中' },
]

export const ACTION_ITEMS: ActionItem[] = [
  { id: 'AI001', propertyId: 'P001', title: '外壁塗装の見積依頼', category: '修繕', status: '進行中', priority: '高', dueDate: '2026-03-15', assignee: '佐藤', description: '3社から見積もり取得中' },
  { id: 'AI002', propertyId: 'P001', title: '空室101号室の募集広告作成', category: '募集', status: '未着手', priority: '高', dueDate: '2026-02-28', assignee: '田中', description: '写真撮影と広告文作成' },
  { id: 'AI003', propertyId: 'P001', title: '301号室エアコン故障対応', category: 'クレーム', status: '進行中', priority: '高', dueDate: '2026-03-05', assignee: '佐藤', description: '修理業者手配済み' },
  { id: 'AI004', propertyId: 'P002', title: '給湯器交換の手配', category: '修繕', status: '進行中', priority: '中', dueDate: '2026-03-10', assignee: '高橋', description: 'メーカー在庫確認中' },
  { id: 'AI005', propertyId: 'P003', title: '共用部LED化工事の見積', category: '修繕', status: '未着手', priority: '低', dueDate: '2026-04-30', assignee: '田中', description: '' },
  { id: 'AI006', propertyId: 'P003', title: '月次収支報告書の送付', category: '報告', status: '完了', priority: '高', dueDate: '2026-02-25', assignee: '佐藤', description: '2月分送付済み' },
  { id: 'AI007', propertyId: 'P004', title: '退去者の原状回復確認', category: '管理', status: '完了', priority: '中', dueDate: '2026-01-20', assignee: '高橋', description: '' },
  { id: 'AI008', propertyId: 'P005', title: '消防設備点検の手配', category: '管理', status: '未着手', priority: '中', dueDate: '2026-04-15', assignee: '佐藤', description: '' },
  { id: 'AI009', propertyId: 'P007', title: 'テナント契約更新交渉', category: '契約', status: '進行中', priority: '高', dueDate: '2026-03-01', assignee: '佐藤', description: '条件交渉中' },
]

export const REPAIR_RECORDS: RepairRecord[] = [
  { id: 'RR001', propertyId: 'P001', category: '補修', content: '外壁塗装 — 経年劣化による塗膜剥がれ', status: '対応中', dueDate: '2026-04-30', createdAt: '2026-02-01', repairVendorId: 'RV001', logs: [{ date: '2026-02-10', comment: '現地調査完了' }, { date: '2026-02-20', comment: '見積もり受領' }] },
  { id: 'RR002', propertyId: 'P001', category: '水漏れ', content: '302号室天井漏水 — 上階排水管劣化', status: '完了', dueDate: '2026-02-15', createdAt: '2026-01-25', logs: [{ date: '2026-01-28', comment: '排水管交換完了' }, { date: '2026-02-01', comment: '漏水確認なし' }] },
  { id: 'RR003', propertyId: 'P002', category: '電気', content: '201号室給湯器交換', status: '対応中', dueDate: '2026-03-10', createdAt: '2026-02-15', repairVendorId: 'RV002', logs: [{ date: '2026-02-15', comment: '故障確認、交換手配開始' }] },
  { id: 'RR004', propertyId: 'P003', category: 'その他', content: '共用部害虫駆除', status: '未着手', dueDate: '2026-03-20', createdAt: '2026-02-20', logs: [] },
  { id: 'RR005', propertyId: 'P005', category: '電気', content: '共用部照明ちらつき修理', status: '対応中', dueDate: '2026-03-15', createdAt: '2026-02-12', repairVendorId: 'RV002', logs: [{ date: '2026-02-14', comment: '電気業者点検依頼' }] },
]

export const STORED_FILES: StoredFile[] = [
  { id: 'SF001', propertyId: 'P001', name: '管理委託契約書.pdf', type: 'PDF', size: '2.1MB', uploadedAt: '2024-04-01', uploadedBy: '佐藤' },
  { id: 'SF002', propertyId: 'P001', name: '火災保険証書.pdf', type: 'PDF', size: '1.5MB', uploadedAt: '2024-04-10', uploadedBy: '佐藤' },
  { id: 'SF003', propertyId: 'P001', name: '外観写真.jpg', type: '画像', size: '4.2MB', uploadedAt: '2025-06-15', uploadedBy: '田中' },
  { id: 'SF004', propertyId: 'P001', name: '修繕履歴.xlsx', type: 'Excel', size: '0.8MB', uploadedAt: '2026-01-10', uploadedBy: '佐藤' },
  { id: 'SF005', propertyId: 'P002', name: '管理委託契約書.pdf', type: 'PDF', size: '1.9MB', uploadedAt: '2024-03-01', uploadedBy: '高橋' },
  { id: 'SF006', propertyId: 'P003', name: 'サブリース契約書.pdf', type: 'PDF', size: '3.0MB', uploadedAt: '2024-01-15', uploadedBy: '佐藤' },
  { id: 'SF007', propertyId: 'P007', name: 'テナント契約書.pdf', type: 'PDF', size: '2.5MB', uploadedAt: '2024-04-01', uploadedBy: '佐藤' },
]

export const CHAT_MESSAGES: ChatMessage[] = [
  // 社内チャット
  { id: 'CM001', propertyId: 'P001', chatType: 'internal', senderRole: 'staff', senderName: '佐藤', message: '外壁塗装の見積もり、3社から揃いました。比較資料を作ります。', timestamp: '2026-02-20 10:30' },
  { id: 'CM002', propertyId: 'P001', chatType: 'internal', senderRole: 'staff', senderName: '田中', message: '了解です。来週のMTGで検討しましょう。', timestamp: '2026-02-20 11:00' },
  { id: 'CM003', propertyId: 'P001', chatType: 'internal', senderRole: 'staff', senderName: '佐藤', message: '301号室のエアコン、修理業者が本日午後訪問します。', timestamp: '2026-02-20 11:15' },
  // オーナーチャット
  { id: 'CM004', propertyId: 'P001', chatType: 'owner', senderRole: 'owner', senderName: '山田太郎', message: 'お世話になっております。外壁塗装の見積もり、進捗はいかがでしょうか？', timestamp: '2026-02-20 10:30' },
  { id: 'CM005', propertyId: 'P001', chatType: 'owner', senderRole: 'staff', senderName: '佐藤', message: '山田様、現在3社から見積もりを取得中です。来週中にはご報告できる見込みです。', timestamp: '2026-02-20 11:15' },
  { id: 'CM006', propertyId: 'P001', chatType: 'owner', senderRole: 'owner', senderName: '山田太郎', message: 'ありがとうございます。よろしくお願いいたします。', timestamp: '2026-02-20 11:20' },
  { id: 'CM007', propertyId: 'P002', chatType: 'owner', senderRole: 'staff', senderName: '高橋', message: '山田様、メゾン山田201号室の給湯器交換について、最短3/5に交換可能です。', timestamp: '2026-02-15 14:00' },
  { id: 'CM008', propertyId: 'P002', chatType: 'owner', senderRole: 'owner', senderName: '山田太郎', message: '承知しました。よろしくお願いします。', timestamp: '2026-02-15 15:30' },
  { id: 'CM009', propertyId: 'P003', chatType: 'owner', senderRole: 'staff', senderName: '佐藤', message: 'サンライズ不動産様、2月度の月次収支報告書を25日までにお送りいたします。', timestamp: '2026-02-20 09:00', scheduledAt: '2026-02-20 09:00' },
  // 入居者チャット
  { id: 'CM010', propertyId: 'P001', chatType: 'tenant', senderRole: 'tenant', senderName: '松本大輔(301)', message: 'エアコンが動かなくなりました。確認をお願いできますか？', timestamp: '2026-02-18 20:00', tenantId: 'T005' },
  { id: 'CM011', propertyId: 'P001', chatType: 'tenant', senderRole: 'staff', senderName: '佐藤', message: '松本様、ご連絡ありがとうございます。修理業者を手配いたします。', timestamp: '2026-02-19 09:00', tenantId: 'T005' },
  // 業者チャット
  { id: 'CM012', propertyId: 'P001', chatType: 'vendor', senderRole: 'staff', senderName: '佐藤', message: '修繕依頼をお送りしました。ご確認をお願いいたします。', timestamp: '2026-02-10 10:00', vendorId: 'RV001', repairRequestId: 'REQ001' },
  { id: 'CM013', propertyId: 'P001', chatType: 'vendor', senderRole: 'vendor', senderName: '(株)山本塗装', message: '承知いたしました。現地調査の日程を調整させてください。', timestamp: '2026-02-10 14:00', vendorId: 'RV001', repairRequestId: 'REQ001' },
  { id: 'CM014', propertyId: 'P002', chatType: 'vendor', senderRole: 'staff', senderName: '高橋', message: '給湯器交換の依頼をお願いいたします。', timestamp: '2026-02-15 10:00', vendorId: 'RV002', repairRequestId: 'REQ002' },
]

export const REPAIR_VENDORS: RepairVendor[] = [
  { id: 'RV001', name: '(株)山本塗装', phone: '03-1234-5678', email: 'yamamoto@example.com', specialty: '外壁・塗装' },
  { id: 'RV002', name: '東京電設サービス', phone: '03-2345-6789', email: 'tokyo-densetsu@example.com', specialty: '電気・給排水' },
  { id: 'RV003', name: 'クリーンライフ(株)', phone: '045-3456-7890', email: 'cleanlife@example.com', specialty: '害虫駆除・清掃' },
]

export const REPAIR_REQUESTS: RepairRequest[] = [
  { id: 'REQ001', repairRecordId: 'RR001', propertyId: 'P001', vendorId: 'RV001', status: '受注', estimateMessage: '外壁塗装一式 概算180万円（税別）', logs: [{ date: '2026-02-10', comment: '現地調査実施' }, { date: '2026-02-20', comment: '見積もり提出' }] },
  { id: 'REQ002', repairRecordId: 'RR003', propertyId: 'P002', vendorId: 'RV002', status: '依頼中', logs: [{ date: '2026-02-15', comment: '依頼受付' }] },
  { id: 'REQ003', repairRecordId: 'RR005', propertyId: 'P005', vendorId: 'RV002', status: '受注', logs: [{ date: '2026-02-14', comment: '点検依頼受付' }, { date: '2026-02-16', comment: '点検実施、部品発注' }] },
]

export const MONTHLY_SALES: MonthlySales[] = [
  { month: '2025-07', revenue: 4200000 }, { month: '2025-08', revenue: 4350000 },
  { month: '2025-09', revenue: 4100000 }, { month: '2025-10', revenue: 4500000 },
  { month: '2025-11', revenue: 4400000 }, { month: '2025-12', revenue: 4600000 },
  { month: '2026-01', revenue: 4550000 }, { month: '2026-02', revenue: 4700000 },
]

export const PORTAL_USERS: Record<PortalType, CurrentUser> = {
  staff: { name: '佐藤（管理者）', role: 'staff' },
  owner: { name: '山田太郎', role: 'owner', ownerId: 'O001' },
  vendor: { name: '(株)山本塗装', role: 'vendor', vendorId: 'RV001' },
}
