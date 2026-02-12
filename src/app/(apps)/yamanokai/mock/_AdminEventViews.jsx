import {useState} from 'react'
import {DEPARTMENTS, EVENT_STATUS, APPLICATION_STATUS, STAMINA_GRADES, SKILL_GRADES, ROCK_CATEGORIES, formatDate, formatDateRange} from './_constants'
import {Modal, Badge, Button, Card, FormField, Input, Select, Textarea} from './_ui'
import {AdminApplicationView} from './_ApplicationViews'
import {RecordA4View} from './_RecordA4View'
import {EventEquipmentChecklistEditor} from './_EquipmentChecklistViews'

// =============================================================================
// 管理者: 例会リスト
// =============================================================================

export function AdminEventList({
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
  checklistItems,
  eventEquipmentItems,
  onSetEventEquipment,
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
            checklistItems={checklistItems}
            eventEquipmentItems={eventEquipmentItems?.filter(e => e.eventId === selectedEvent.id) || []}
            onSetEventEquipment={onSetEventEquipment}
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

export function AdminEventDetail({event, applications, members, checklistItems, eventEquipmentItems, onSetEventEquipment}) {
  const [activeTab, setActiveTab] = useState('basic')
  const dept = DEPARTMENTS[event.departmentId]
  const getMemberName = id => members.find(m => m.id === id)?.name || ''

  const tabs = [
    {id: 'basic', label: '基本情報', icon: '📋'},
    {id: 'equipment', label: '装備表', icon: '🎒'},
  ]

  return (
    <div className="space-y-4">
      {/* タブナビゲーション */}
      <div className="flex gap-2 border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium ${
              activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* タブコンテンツ */}
      {activeTab === 'basic' && (
        <BasicInfoTab event={event} applications={applications} members={members} dept={dept} getMemberName={getMemberName} />
      )}
      {activeTab === 'equipment' && checklistItems && (
        <EventEquipmentChecklistEditor
          eventId={event.id}
          checklistItems={checklistItems}
          eventEquipmentItems={eventEquipmentItems}
          onSave={items => onSetEventEquipment(event.id, items)}
        />
      )}
    </div>
  )
}

// 基本情報タブ
function BasicInfoTab({event, applications, members, dept, getMemberName}) {
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

export function AdminEventForm({initialData, members, onSave, onCancel}) {
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
