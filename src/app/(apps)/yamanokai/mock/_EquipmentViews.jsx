import {useState} from 'react'
import {EQUIPMENT_CATEGORIES, EQUIPMENT_CONDITIONS, EQUIPMENT_STATUS, formatDate} from './_constants'
import {Modal, Badge, Button, Card, FormField, Input, Select, Textarea} from './_ui'

// =============================================================================
// 管理者: 装備一覧
// =============================================================================

export function AdminEquipmentList({equipment, rentals, members, events, onUpdate, onDelete}) {
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

export function AdminEquipmentDetail({equipment, rentals, members, events}) {
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

export function AdminEquipmentForm({initialData, onSave, onCancel}) {
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

export function MemberEquipmentRental({equipment, rentals, members, events, currentUserId, onRent, onReturn}) {
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

export function RentalForm({equipment, events, onSave, onCancel}) {
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

export function MemberMyRentals({equipment, rentals, events, currentUserId}) {
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
