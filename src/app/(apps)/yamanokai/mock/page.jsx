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
import {
  INITIAL_MEMBERS,
  INITIAL_EVENTS,
  INITIAL_RECORDS,
  INITIAL_RECORD_FILES,
  INITIAL_APPLICATIONS,
  INITIAL_EQUIPMENT,
  INITIAL_RENTALS,
  INITIAL_EQUIPMENT_CHECKLIST_ITEMS,
  INITIAL_EVENT_EQUIPMENT_ITEMS,
  generateId,
} from './_constants'
import {Badge} from './_ui'
import {AdminEventList} from './_AdminEventViews'
import {MemberCalendar} from './_MemberCalendar'
import {MemberRecords} from './_MemberRecords'
import {MemberApplicationView} from './_ApplicationViews'
import {AdminEquipmentList, AdminEquipmentForm, MemberEquipmentRental, MemberMyRentals} from './_EquipmentViews'
import {AdminEquipmentChecklistManagement} from './_EquipmentChecklistViews'
import {ExportPublicDataView} from './_ExportPublicDataView'
import {DataStructureDiagram} from './_DataStructureDiagram'

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
  const [checklistItems, setChecklistItems] = useState(INITIAL_EQUIPMENT_CHECKLIST_ITEMS)
  const [eventEquipmentItems, setEventEquipmentItems] = useState(INITIAL_EVENT_EQUIPMENT_ITEMS)

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
  const activeChecklistItems = useMemo(() => checklistItems.filter(c => !c.isDeleted), [checklistItems])

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

  // 記録保存の共通ハンドラ
  const handleRecordSave = (data, files) => {
    let recordId
    if (data.id) {
      setRecords(prev => prev.map(r => (r.id === data.id ? {...r, ...data} : r)))
      recordId = data.id
    } else {
      recordId = generateId(records)
      setRecords(prev => [...prev, {...data, id: recordId, createdAt: new Date().toISOString().split('T')[0], isDeleted: false}])
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
  }

  // 装備表品目マスター管理ハンドラー
  const handleCreateChecklistItem = data => {
    const newItem = {...data, id: generateId(checklistItems), isDeleted: false}
    setChecklistItems(prev => [...prev, newItem])
  }

  const handleUpdateChecklistItem = (id, data) => {
    setChecklistItems(prev => prev.map(c => (c.id === id ? {...c, ...data} : c)))
  }

  const handleDeleteChecklistItem = id => {
    setChecklistItems(prev => prev.map(c => (c.id === id ? {...c, isDeleted: true} : c)))
  }

  // 例会装備表設定ハンドラー
  const handleSetEventEquipment = (eventId, items) => {
    // 既存の装備リストを削除
    setEventEquipmentItems(prev => prev.filter(e => e.eventId !== eventId))
    // 新しい装備リストを追加
    const newItems = items.map((item, idx) => ({
      id: generateId(eventEquipmentItems) + idx,
      eventId,
      checklistItemId: item.checklistItemId,
      requirementLevel: item.requirementLevel,
    }))
    setEventEquipmentItems(prev => [...prev, ...newItems])
  }

  // メニュー定義
  const menuItems = [
    {type: 'header', label: '例会'},
    {id: 'admin-event-management', label: '例会設定', icon: '⚙️', adminOnly: true},
    {id: 'export-public', label: '外部公開データ出力', icon: '📤', adminOnly: true},
    {id: 'member-events', label: '例会一覧', icon: '📅'},
    {type: 'divider'},
    {type: 'header', label: '装備表'},
    {id: 'admin-equipment-checklist', label: '装備表品目マスタ管理', icon: '📋', adminOnly: true},
    {type: 'divider'},
    {type: 'header', label: '装備品レンタル'},
    {id: 'admin-equipment', label: '装備品マスタ管理', icon: '🎒', adminOnly: true},
    {id: 'member-equipment', label: '装備貸出・返却', icon: '🔄'},
    {id: 'member-my-rentals', label: '貸出履歴', icon: '📝'},
    {type: 'divider'},
    // {type: 'header', label: 'システム'},
    // {id: 'data-structure', label: 'データ構造図', icon: '🗂️'},
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
              onRecordSave={handleRecordSave}
              onTogglePublic={fileId => {
                setRecordFiles(prev => prev.map(f => (f.id === fileId ? {...f, isPublic: !f.isPublic} : f)))
              }}
              onRecordDelete={id => setRecords(prev => prev.map(r => (r.id === id ? {...r, isDeleted: true} : r)))}
              onRecordFileDelete={fileId =>
                setRecordFiles(prev => prev.map(f => (f.id === fileId ? {...f, isDeleted: true} : f)))
              }
              checklistItems={activeChecklistItems}
              eventEquipmentItems={eventEquipmentItems}
              onSetEventEquipment={handleSetEventEquipment}
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

          {/* 装備表品目マスタ管理 */}
          {activeMenu === 'admin-equipment-checklist' && (
            <AdminEquipmentChecklistManagement
              checklistItems={activeChecklistItems}
              onCreate={handleCreateChecklistItem}
              onUpdate={handleUpdateChecklistItem}
              onDelete={handleDeleteChecklistItem}
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
              onRecordSave={handleRecordSave}
              onRecordDelete={id => setRecords(prev => prev.map(r => (r.id === id ? {...r, isDeleted: true} : r)))}
              onRecordFileDelete={fileId =>
                setRecordFiles(prev => prev.map(f => (f.id === fileId ? {...f, isDeleted: true} : f)))
              }
              checklistItems={activeChecklistItems}
              eventEquipmentItems={eventEquipmentItems}
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
// 管理者: 例会設定（統合ページ）— 薄いラッパー
// =============================================================================

function AdminEventManagement({
  events,
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
  checklistItems,
  eventEquipmentItems,
  onSetEventEquipment,
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
      checklistItems={checklistItems}
      eventEquipmentItems={eventEquipmentItems}
      onSetEventEquipment={onSetEventEquipment}
    />
  )
}

// =============================================================================
// 一般会員: 例会一覧（統合ページ）— タブ切り替え
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
  checklistItems,
  eventEquipmentItems,
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
          checklistItems={checklistItems}
          eventEquipmentItems={eventEquipmentItems}
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
// 管理者: 装備品マスタ管理（統合ページ）— タブ切り替え
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
