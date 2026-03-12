'use client'

import { useState, useEffect } from 'react'
import useModal from '@cm/components/utils/modal/useModal'
import { Button } from '@cm/components/styles/common-components/Button'
import type { YamanokaiDepartment, User, YamanokaiEvent } from '@prisma/generated/prisma/client'
import {
  createYamanokaiEvent,
  updateYamanokaiEvent,
  bulkUpdateYamanokaiEventStatus,
  deleteYamanokaiEvent,
  type YamanokaiEventFormData,
} from '@app/(apps)/yamanokai/_actions/event-actions'
import {
  getApplicationsByEventId,
  updateYamanokaiApplication,
  toggleActualAttended,
} from '@app/(apps)/yamanokai/_actions/attendance-actions'

// グレード定数
const STAMINA_GRADES = ['(^^)', 'O(-)', 'O', 'O(+)', 'OO', 'OOO', 'OOOO']
const SKILL_GRADES = ['なし', '☆', '☆☆', '☆☆☆']
const ROCK_CATEGORIES = ['なし', 'A', 'B', 'C']

const EVENT_STATUS_MAP = {
  draft: { label: '下書き', color: '#6b7280', bgColor: '#f3f4f6' },
  polished: { label: '清書', color: '#3b82f6', bgColor: '#dbeafe' },
  published: { label: '公開済み', color: '#22c55e', bgColor: '#dcfce7' },
} as const

const APPLICATION_STATUS_MAP = {
  pending: { label: '審査中', color: '#eab308', bgColor: '#fef9c3' },
  approved: { label: '承認', color: '#22c55e', bgColor: '#dcfce7' },
  rejected: { label: '却下', color: '#ef4444', bgColor: '#fee2e2' },
} as const

type StatusKey = keyof typeof EVENT_STATUS_MAP

type EventWithRelations = YamanokaiEvent & {
  YamanokaiDepartment: YamanokaiDepartment
  CL: User
  SL: User | null
}

type ApplicationSummary = Record<number, Record<string, number>>
type ApplicationWithUser = Awaited<ReturnType<typeof getApplicationsByEventId>>[number]

type Props = {
  events: EventWithRelations[]
  departments: YamanokaiDepartment[]
  users: User[]
  canEdit: boolean
  isSystemAdmin: boolean
  applicationSummary: ApplicationSummary
  currentUserId: string
}

// 日付フォーマット
const formatDate = (date: Date | string | null) => {
  if (!date) return ''
  const d = new Date(date)
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}(${weekdays[d.getDay()]})`
}

// input[type=date] 用の値変換
const toDateInputValue = (date: Date | string | null) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const STATUS_KEYS = Object.keys(EVENT_STATUS_MAP) as StatusKey[]

const EventManagementClient = ({
  events: initialEvents,
  departments,
  users,
  applicationSummary: initialSummary,
  currentUserId,
}: Props) => {
  const [events, setEvents] = useState(initialEvents)
  const [applicationSummary, setApplicationSummary] = useState(initialSummary)
  const [activeTab, setActiveTab] = useState<StatusKey>('draft')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)

  const createModal = useModal()
  const editModal = useModal<EventWithRelations | null>()
  const detailModal = useModal<EventWithRelations | null>()
  const applicationModal = useModal<{ event: EventWithRelations; applications: ApplicationWithUser[] } | null>()

  // タブごとにフィルタ
  const filteredEvents = events.filter(e => e.status === activeTab)
  const sortedEvents = [...filteredEvents].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())

  // 選択操作
  const toggleSelect = (eventId: number) => {
    setSelectedIds(prev => (prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]))
  }

  const toggleSelectAll = () => {
    const allIds = sortedEvents.map(e => e.id)
    const isAllSelected = allIds.length > 0 && allIds.every(id => selectedIds.includes(id))
    setSelectedIds(isAllSelected ? [] : allIds)
  }

  // 一括ステータス変更
  const handleBulkStatusChange = async (newStatus: StatusKey) => {
    if (selectedIds.length === 0) return
    const label = EVENT_STATUS_MAP[newStatus].label
    if (!window.confirm(`${selectedIds.length}件を「${label}」に変更しますか？`)) return
    setIsLoading(true)
    await bulkUpdateYamanokaiEventStatus(selectedIds, newStatus)
    setEvents(prev => prev.map(e => (selectedIds.includes(e.id) ? { ...e, status: newStatus } : e)))
    setSelectedIds([])
    setShowStatusMenu(false)
    setIsLoading(false)
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('この例会を削除しますか？')) return
    setIsLoading(true)
    await deleteYamanokaiEvent(id)
    setEvents(prev => prev.filter(e => e.id !== id))
    setIsLoading(false)
  }

  const handleCreate = async (data: YamanokaiEventFormData) => {
    setIsLoading(true)
    const created = await createYamanokaiEvent(data)
    setEvents(prev => [...prev, created])
    createModal.handleClose()
    setIsLoading(false)
  }

  const handleUpdate = async (id: number, data: Partial<YamanokaiEventFormData>) => {
    setIsLoading(true)
    const updated = await updateYamanokaiEvent(id, data)
    setEvents(prev => prev.map(e => (e.id === id ? updated : e)))
    editModal.handleClose()
    setIsLoading(false)
  }

  const handleShowApplications = async (event: EventWithRelations) => {
    const applications = await getApplicationsByEventId(event.id)
    applicationModal.handleOpen({ event, applications })
  }

  const handleApplicationSummaryUpdate = (eventId: number, newSummary: Record<string, number>) => {
    setApplicationSummary(prev => ({ ...prev, [eventId]: newSummary }))
  }

  return (
    <div className='space-y-4'>
      {/* タブ UI */}
      <div className='rounded-lg overflow-hidden border'>
        <div className='flex'>
          {STATUS_KEYS.map(key => {
            const status = EVENT_STATUS_MAP[key]
            const count = events.filter(e => e.status === key).length
            return (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key)
                  setSelectedIds([])
                  setShowStatusMenu(false)
                }}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === key ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {status.label}（{count}件）
              </button>
            )
          })}
        </div>
      </div>

      {/* アクションバー */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <label className='flex items-center gap-1.5 cursor-pointer text-sm text-gray-600'>
            <input
              type='checkbox'
              checked={sortedEvents.length > 0 && sortedEvents.every(e => selectedIds.includes(e.id))}
              onChange={toggleSelectAll}
              className='w-4 h-4'
            />
            全選択
          </label>
          <span className='text-sm text-gray-500'>
            {selectedIds.length > 0 ? `${selectedIds.length}件選択中` : `全${sortedEvents.length}件`}
          </span>
        </div>
        <div className='flex gap-2 items-center'>
          {/* ステータス変更ドロップダウン */}
          {selectedIds.length > 0 && (
            <div className='relative'>
              <Button color='blue' size='sm' onClick={() => setShowStatusMenu(prev => !prev)} disabled={isLoading}>
                ステータス変更
              </Button>
              {showStatusMenu && (
                <div className='absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-10 min-w-[140px]'>
                  {STATUS_KEYS.filter(key => key !== activeTab).map(key => {
                    const { label, color } = EVENT_STATUS_MAP[key]
                    return (
                      <button
                        key={key}
                        onClick={() => handleBulkStatusChange(key)}
                        className='w-full px-4 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg flex items-center gap-2'
                      >
                        <span className='w-2.5 h-2.5 rounded-full' style={{ backgroundColor: color }} />
                        {label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
          <Button color='blue' size='sm' onClick={() => createModal.handleOpen()}>
            新規作成
          </Button>
        </div>
      </div>

      {/* 例会カードリスト */}
      <div className='space-y-2'>
        {sortedEvents.map(event => {
          const dept = event.YamanokaiDepartment
          const isSelected = selectedIds.includes(event.id)

          return (
            <div key={event.id} className={`p-4 border rounded-lg hover:shadow-md transition-shadow bg-white ${isSelected ? 'ring-2 ring-blue-300' : ''}`}>
              <div className='flex items-start justify-between'>
                <div className='mr-3 pt-1'>
                  <input
                    type='checkbox'
                    checked={isSelected}
                    onChange={() => toggleSelect(event.id)}
                    className='w-5 h-5 cursor-pointer'
                  />
                </div>

                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-1'>
                    <span
                      className='text-xs px-2 py-0.5 rounded-full font-medium'
                      style={{ color: dept.color ?? '#6b7280', backgroundColor: dept.bgColor ?? '#f3f4f6' }}
                    >
                      {dept.name}
                    </span>
                    <span className='text-sm text-gray-500'>{formatDate(event.startAt)}</span>
                    {event.mountainName && <span className='text-sm text-gray-500'>{event.mountainName}</span>}
                  </div>
                  <h3 className='font-bold text-lg'>{event.title}</h3>
                  <div className='flex items-center gap-4 mt-2 text-sm text-gray-500'>
                    <span>
                      体力:{event.staminaGrade} 技術:{event.skillGrade}
                      {event.rockCategory !== 'なし' && ` 岩:${event.rockCategory}`}
                    </span>
                    <span>CL: {event.CL.name}</span>
                    {event.SL && <span>SL: {event.SL.name}</span>}
                  </div>
                  <div className='flex items-center gap-4 mt-1 text-sm text-gray-500'>
                    <span>
                      集合: {event.meetingPlace} {event.meetingTime}
                    </span>
                    <span>申込期限: {formatDate(event.deadline)}</span>
                  </div>
                  {/* 申請サマリ */}
                  <ApplicationSummaryRow summary={applicationSummary[event.id]} />
                </div>

                {/* アクションボタン */}
                <div className='flex flex-col gap-1 ml-4'>
                  <Button size='xs' color='gray' onClick={() => detailModal.handleOpen(event)}>
                    詳細
                  </Button>
                  <Button size='xs' color='gray' onClick={() => editModal.handleOpen(event)}>
                    編集
                  </Button>
                  <Button size='xs' color='blue' onClick={() => handleShowApplications(event)}>
                    申請管理
                  </Button>
                  <Button size='xs' color='red' onClick={() => handleDelete(event.id)} disabled={isLoading}>
                    削除
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {sortedEvents.length === 0 && (
        <div className='p-8 text-center text-gray-500 border rounded-lg'>該当する例会がありません</div>
      )}

      {/* 新規作成モーダル */}
      <createModal.Modal title='例会の新規作成'>
        <EventForm departments={departments} users={users} onSave={handleCreate} onCancel={createModal.handleClose} isLoading={isLoading} />
      </createModal.Modal>

      {/* 編集モーダル */}
      <editModal.Modal title='例会編集'>
        {editModal.open && (
          <EventForm
            initialData={editModal.open}
            departments={departments}
            users={users}
            onSave={data => handleUpdate(editModal.open!.id, data)}
            onCancel={editModal.handleClose}
            isLoading={isLoading}
          />
        )}
      </editModal.Modal>

      {/* 詳細モーダル */}
      <detailModal.Modal title='例会詳細'>
        {detailModal.open && <EventDetail event={detailModal.open} />}
      </detailModal.Modal>

      {/* 申請管理モーダル */}
      <applicationModal.Modal title={applicationModal.open ? `申請管理 - ${applicationModal.open.event.title}` : '申請管理'}>
        {applicationModal.open && (
          <ApplicationManagement
            initialApplications={applicationModal.open.applications}
            currentUserId={currentUserId}
            onSummaryChange={summary => handleApplicationSummaryUpdate(applicationModal.open!.event.id, summary)}
          />
        )}
      </applicationModal.Modal>
    </div>
  )
}

export default EventManagementClient

// =============================================================================
// 例会詳細
// =============================================================================

const EventDetail = ({ event }: { event: EventWithRelations }) => {
  const dept = event.YamanokaiDepartment
  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <h4 className='font-bold text-sm text-gray-500'>タイトル</h4>
          <p>{event.title}</p>
          {event.mountainName && (
            <p className='text-gray-600'>
              {event.mountainName} {event.altitude}
            </p>
          )}
        </div>
        <div>
          <h4 className='font-bold text-sm text-gray-500'>担当部</h4>
          <span className='text-xs px-2 py-0.5 rounded-full font-medium' style={{ color: dept.color ?? '#6b7280', backgroundColor: dept.bgColor ?? '#f3f4f6' }}>
            {dept.name}
          </span>
        </div>
        <div>
          <h4 className='font-bold text-sm text-gray-500'>日程</h4>
          <p>
            {formatDate(event.startAt)}
            {event.startAt.toISOString() !== event.endAt.toISOString() && ` 〜 ${formatDate(event.endAt)}`}
          </p>
        </div>
        <div>
          <h4 className='font-bold text-sm text-gray-500'>申込期限</h4>
          <p>{formatDate(event.deadline)}</p>
        </div>
        <div>
          <h4 className='font-bold text-sm text-gray-500'>CL / SL</h4>
          <p>
            {event.CL.name}
            {event.SL && ` / ${event.SL.name}`}
          </p>
        </div>
        <div>
          <h4 className='font-bold text-sm text-gray-500'>グレード</h4>
          <p>
            体力: {event.staminaGrade} / 技術: {event.skillGrade} / 岩: {event.rockCategory}
          </p>
        </div>
        <div>
          <h4 className='font-bold text-sm text-gray-500'>集合</h4>
          <p>
            {event.meetingPlace} {event.meetingTime}
          </p>
        </div>
        <div>
          <h4 className='font-bold text-sm text-gray-500'>必要保険口数</h4>
          <p>{event.requiredInsurance}口以上</p>
        </div>
        {event.capacity && (
          <div>
            <h4 className='font-bold text-sm text-gray-500'>定員</h4>
            <p>{event.capacity}名</p>
          </div>
        )}
      </div>

      {event.course && (
        <div>
          <h4 className='font-bold text-sm text-gray-500'>コース</h4>
          <p className='whitespace-pre-wrap'>{event.course}</p>
        </div>
      )}

      {event.notes && (
        <div>
          <h4 className='font-bold text-sm text-gray-500'>備考</h4>
          <p className='whitespace-pre-wrap'>{event.notes}</p>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// 例会フォーム（新規作成・編集共通）
// =============================================================================

type EventFormProps = {
  initialData?: EventWithRelations
  departments: YamanokaiDepartment[]
  users: User[]
  onSave: (data: YamanokaiEventFormData) => void
  onCancel: () => void
  isLoading: boolean
}

const EventForm = ({ initialData, departments, users, onSave, onCancel, isLoading }: EventFormProps) => {
  const [form, setForm] = useState({
    title: initialData?.title ?? '',
    yamanokaiDepartmentId: initialData?.yamanokaiDepartmentId ?? '',
    clId: initialData?.clId ?? '',
    slId: initialData?.slId ?? '',
    startAt: toDateInputValue(initialData?.startAt ?? null),
    endAt: toDateInputValue(initialData?.endAt ?? null),
    deadline: toDateInputValue(initialData?.deadline ?? null),
    staminaGrade: initialData?.staminaGrade ?? 'O',
    skillGrade: initialData?.skillGrade ?? 'なし',
    rockCategory: initialData?.rockCategory ?? 'なし',
    requiredInsurance: initialData?.requiredInsurance ?? 3,
    mountainName: initialData?.mountainName ?? '',
    altitude: initialData?.altitude ?? '',
    meetingPlace: initialData?.meetingPlace ?? '',
    meetingTime: initialData?.meetingTime ?? '',
    course: initialData?.course ?? '',
    capacity: initialData?.capacity ?? '',
    notes: initialData?.notes ?? '',
  })

  const updateForm = (key: string, value: string | number) => setForm(prev => ({ ...prev, [key]: value }))

  const isValid = form.title && form.yamanokaiDepartmentId && form.clId && form.startAt && form.meetingPlace && form.meetingTime && form.deadline

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    onSave({
      title: form.title,
      yamanokaiDepartmentId: Number(form.yamanokaiDepartmentId),
      clId: form.clId,
      slId: form.slId || null,
      startAt: form.startAt,
      endAt: form.endAt || form.startAt,
      deadline: form.deadline,
      staminaGrade: form.staminaGrade,
      skillGrade: form.skillGrade,
      rockCategory: form.rockCategory,
      requiredInsurance: Number(form.requiredInsurance),
      mountainName: form.mountainName || null,
      altitude: form.altitude || null,
      meetingPlace: form.meetingPlace,
      meetingTime: form.meetingTime,
      course: form.course || null,
      capacity: form.capacity ? Number(form.capacity) : null,
      notes: form.notes || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='grid grid-cols-2 gap-4'>
        <FormFieldWrap label='タイトル' required>
          <input className='w-full border rounded px-3 py-2' value={form.title} onChange={e => updateForm('title', e.target.value)} />
        </FormFieldWrap>
        <FormFieldWrap label='担当部' required>
          <select className='w-full border rounded px-3 py-2' value={form.yamanokaiDepartmentId} onChange={e => updateForm('yamanokaiDepartmentId', e.target.value)}>
            <option value=''>選択してください</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </FormFieldWrap>
        <FormFieldWrap label='山名'>
          <input className='w-full border rounded px-3 py-2' value={form.mountainName} onChange={e => updateForm('mountainName', e.target.value)} placeholder='例: 六甲山系' />
        </FormFieldWrap>
        <FormFieldWrap label='標高'>
          <input className='w-full border rounded px-3 py-2' value={form.altitude} onChange={e => updateForm('altitude', e.target.value)} placeholder='例: 931m' />
        </FormFieldWrap>
        <FormFieldWrap label='CL（チーフリーダー）' required>
          <select className='w-full border rounded px-3 py-2' value={form.clId} onChange={e => updateForm('clId', e.target.value)}>
            <option value=''>選択してください</option>
            {users.map(m => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </FormFieldWrap>
        <FormFieldWrap label='SL（サブリーダー）'>
          <select className='w-full border rounded px-3 py-2' value={form.slId} onChange={e => updateForm('slId', e.target.value)}>
            <option value=''>なし</option>
            {users.map(m => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </FormFieldWrap>
        <FormFieldWrap label='開始日' required>
          <input className='w-full border rounded px-3 py-2' type='date' value={form.startAt} onChange={e => updateForm('startAt', e.target.value)} />
        </FormFieldWrap>
        <FormFieldWrap label='終了日'>
          <input className='w-full border rounded px-3 py-2' type='date' value={form.endAt || form.startAt} onChange={e => updateForm('endAt', e.target.value)} />
        </FormFieldWrap>
        <FormFieldWrap label='体力度グレード' required>
          <select className='w-full border rounded px-3 py-2' value={form.staminaGrade} onChange={e => updateForm('staminaGrade', e.target.value)}>
            {STAMINA_GRADES.map(g => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </FormFieldWrap>
        <FormFieldWrap label='技術度グレード' required>
          <select className='w-full border rounded px-3 py-2' value={form.skillGrade} onChange={e => updateForm('skillGrade', e.target.value)}>
            {SKILL_GRADES.map(g => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </FormFieldWrap>
        <FormFieldWrap label='岩登り区分' required>
          <select className='w-full border rounded px-3 py-2' value={form.rockCategory} onChange={e => updateForm('rockCategory', e.target.value)}>
            {ROCK_CATEGORIES.map(g => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </FormFieldWrap>
        <FormFieldWrap label='必要保険口数'>
          <select className='w-full border rounded px-3 py-2' value={form.requiredInsurance} onChange={e => updateForm('requiredInsurance', e.target.value)}>
            <option value={3}>3口（ハイキング）</option>
            <option value={4}>4口（岩A・沢入門）</option>
            <option value={8}>8口（アルパイン・雪山・岩BC・沢）</option>
          </select>
        </FormFieldWrap>
        <FormFieldWrap label='集合場所' required>
          <input className='w-full border rounded px-3 py-2' value={form.meetingPlace} onChange={e => updateForm('meetingPlace', e.target.value)} placeholder='例: JR新神戸駅' />
        </FormFieldWrap>
        <FormFieldWrap label='集合時間' required>
          <input className='w-full border rounded px-3 py-2' type='time' value={form.meetingTime} onChange={e => updateForm('meetingTime', e.target.value)} />
        </FormFieldWrap>
        <FormFieldWrap label='申込期限' required>
          <input className='w-full border rounded px-3 py-2' type='date' value={form.deadline} onChange={e => updateForm('deadline', e.target.value)} />
        </FormFieldWrap>
        <FormFieldWrap label='定員'>
          <input className='w-full border rounded px-3 py-2' type='number' value={form.capacity} onChange={e => updateForm('capacity', e.target.value)} placeholder='未指定で無制限' />
        </FormFieldWrap>
      </div>

      <FormFieldWrap label='コース'>
        <textarea className='w-full border rounded px-3 py-2' rows={3} value={form.course} onChange={e => updateForm('course', e.target.value)} placeholder='行程を記入' />
      </FormFieldWrap>

      <FormFieldWrap label='備考'>
        <textarea className='w-full border rounded px-3 py-2' rows={3} value={form.notes} onChange={e => updateForm('notes', e.target.value)} placeholder='持ち物、注意事項など' />
      </FormFieldWrap>

      <div className='flex justify-end gap-2'>
        <Button type='button' color='gray' onClick={onCancel}>
          キャンセル
        </Button>
        <Button type='submit' color='blue' disabled={!isValid || isLoading}>
          {initialData ? '更新する' : '作成する'}
        </Button>
      </div>
    </form>
  )
}

// フォームフィールドラッパー
const FormFieldWrap = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div>
    <label className='block text-sm font-medium text-gray-700 mb-1'>
      {label}
      {required && <span className='text-red-500 ml-1'>*</span>}
    </label>
    {children}
  </div>
)

// =============================================================================
// 申請サマリ行
// =============================================================================

const ApplicationSummaryRow = ({ summary }: { summary?: Record<string, number> }) => {
  const approved = summary?.approved ?? 0
  const pending = summary?.pending ?? 0
  const rejected = summary?.rejected ?? 0

  return (
    <div className='flex items-center gap-3 mt-2 text-sm'>
      <span className='text-gray-500'>申請:</span>
      <span style={{ color: '#22c55e' }}>承認:{approved}</span>
      <span style={{ color: '#eab308' }}>審査中:{pending}</span>
      <span style={{ color: '#ef4444' }}>却下:{rejected}</span>
    </div>
  )
}

// =============================================================================
// 申請管理（ステータス・コメントをインライン編集）
// =============================================================================

const ApplicationManagement = ({
  initialApplications,
  currentUserId,
  onSummaryChange,
}: {
  initialApplications: ApplicationWithUser[]
  currentUserId: string
  onSummaryChange: (summary: Record<string, number>) => void
}) => {
  const [applications, setApplications] = useState(initialApplications)
  const [savingIds, setSavingIds] = useState<Set<number>>(new Set())

  const calcSummary = (apps: ApplicationWithUser[]) => {
    const summary: Record<string, number> = {}
    for (const a of apps) {
      summary[a.status] = (summary[a.status] ?? 0) + 1
    }
    return summary
  }

  const handleUpdate = async (appId: number, data: { status?: string; rejectionReason?: string | null; approvedBy?: string | null }) => {
    setSavingIds(prev => new Set(prev).add(appId))
    const updated = await updateYamanokaiApplication(appId, data)
    const newApps = applications.map(a => (a.id === appId ? updated : a))
    setApplications(newApps)
    onSummaryChange(calcSummary(newApps))
    setSavingIds(prev => {
      const next = new Set(prev)
      next.delete(appId)
      return next
    })
  }

  const handleToggleAttended = async (appId: number) => {
    const updated = await toggleActualAttended(appId)
    if (updated) {
      setApplications(prev => prev.map(a => (a.id === appId ? updated : a)))
    }
  }

  return (
    <div className='space-y-4'>
      {/* サマリ */}
      <div className='flex gap-4 text-sm'>
        <span className='text-green-600 font-medium'>承認: {applications.filter(a => a.status === 'approved').length}名</span>
        <span className='text-yellow-600 font-medium'>審査中: {applications.filter(a => a.status === 'pending').length}名</span>
        <span className='text-red-600 font-medium'>却下: {applications.filter(a => a.status === 'rejected').length}名</span>
      </div>

      {/* 申請テーブル */}
      <div className='overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b bg-gray-50 text-left text-gray-500'>
              <th className='py-3 px-4'>申請者</th>
              <th className='py-3 px-4'>コメント</th>
              <th className='py-3 px-4'>ステータス</th>
              <th className='py-3 px-4'>理由/メモ</th>
              <th className='py-3 px-4'>当日出席</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan={5} className='py-8 text-center text-gray-400'>
                  申請はありません
                </td>
              </tr>
            ) : (
              applications.map(app => (
                <ApplicationRow
                  key={app.id}
                  app={app}
                  isSaving={savingIds.has(app.id)}
                  onStatusChange={status =>
                    handleUpdate(app.id, {
                      status,
                      approvedBy: status === 'pending' ? null : currentUserId,
                    })
                  }
                  onReasonBlur={reason => handleUpdate(app.id, { rejectionReason: reason || null })}
                  onToggleAttended={() => handleToggleAttended(app.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// 申請行（インライン編集）
const ApplicationRow = ({
  app,
  isSaving,
  onStatusChange,
  onReasonBlur,
  onToggleAttended,
}: {
  app: ApplicationWithUser
  isSaving: boolean
  onStatusChange: (status: string) => void
  onReasonBlur: (reason: string) => void
  onToggleAttended: () => void
}) => {
  const [reason, setReason] = useState(app.rejectionReason || '')

  // 親から app が更新されたら同期
  useEffect(() => {
    setReason(app.rejectionReason || '')
  }, [app.rejectionReason])

  const handleReasonBlur = () => {
    if (reason !== (app.rejectionReason || '')) {
      onReasonBlur(reason)
    }
  }

  const statusInfo = APPLICATION_STATUS_MAP[app.status as keyof typeof APPLICATION_STATUS_MAP]

  return (
    <tr className='border-b hover:bg-gray-50'>
      <td className='py-3 px-4 font-medium whitespace-nowrap'>{app.User.name}</td>
      <td className='py-3 px-4 text-gray-600 max-w-[200px]'>{app.comment || '—'}</td>
      <td className='py-3 px-4'>
        <select
          className='border rounded px-2 py-1 text-xs font-medium'
          value={app.status}
          onChange={e => onStatusChange(e.target.value)}
          disabled={isSaving}
          style={{ color: statusInfo?.color, borderColor: statusInfo?.color }}
        >
          <option value='pending'>審査中</option>
          <option value='approved'>承認</option>
          <option value='rejected'>却下</option>
        </select>
      </td>
      <td className='py-3 px-4'>
        <textarea
          className='w-full border rounded px-2 py-1 text-xs min-w-[150px] resize-none'
          value={reason}
          onChange={e => setReason(e.target.value)}
          onBlur={handleReasonBlur}
          placeholder='理由/メモ'
          rows={1}
          disabled={isSaving}
        />
      </td>
      <td className='py-3 px-4'>
        {app.status === 'approved' && (
          <label className='flex items-center gap-2 cursor-pointer'>
            <input
              type='checkbox'
              checked={app.actualAttended}
              onChange={onToggleAttended}
              className='w-4 h-4 rounded'
            />
            <span className='text-xs'>{app.actualAttended ? '出席' : '未出席'}</span>
          </label>
        )}
      </td>
    </tr>
  )
}
