'use client'

import { useState } from 'react'
import useModal from '@cm/components/utils/modal/useModal'
import { Button } from '@cm/components/styles/common-components/Button'
import type { YamanokaiDepartment, YamanokaiAttendance, User, YamanokaiEvent } from '@prisma/generated/prisma/client'
import { createYamanokaiApplication } from '@app/(apps)/yamanokai/_actions/attendance-actions'

type EventWithRelations = YamanokaiEvent & {
  YamanokaiDepartment: YamanokaiDepartment
  CL: User
  SL: User | null
}

const APPLICATION_STATUS_MAP = {
  pending: { label: '審査中', color: '#eab308', bgColor: '#fef9c3' },
  approved: { label: '承認', color: '#22c55e', bgColor: '#dcfce7' },
  rejected: { label: '却下', color: '#ef4444', bgColor: '#fee2e2' },
} as const

type Props = {
  events: EventWithRelations[]
  applications: YamanokaiAttendance[]
  userId: string
}

// 日付フォーマット
const formatDate = (date: Date | string | null) => {
  if (!date) return ''
  const d = new Date(date)
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}(${weekdays[d.getDay()]})`
}

const EventsClient = ({ events, applications, userId }: Props) => {
  const [isLoading, setIsLoading] = useState(false)
  const [applyComment, setApplyComment] = useState('')

  // 申請状態をローカルで管理
  const [applicationMap, setApplicationMap] = useState<Record<number, YamanokaiAttendance>>(() => {
    const map: Record<number, YamanokaiAttendance> = {}
    for (const a of applications) {
      map[a.yamanokaiEventId] = a
    }
    return map
  })

  const detailModal = useModal<EventWithRelations | null>()
  const applyModal = useModal<EventWithRelations | null>()

  const handleApply = async (eventId: number) => {
    setIsLoading(true)
    const result = await createYamanokaiApplication({
      yamanokaiEventId: eventId,
      userId,
      comment: applyComment || null,
    })
    setApplicationMap(prev => ({ ...prev, [eventId]: result }))
    setApplyComment('')
    applyModal.handleClose()
    setIsLoading(false)
  }

  const isDeadlinePassed = (deadline: Date | string) => new Date(deadline) < new Date()

  return (
    <div className='space-y-4'>
      <h2 className='text-xl font-bold'>例会一覧</h2>

      {events.length === 0 && <div className='p-8 text-center text-gray-500 border rounded-lg'>公開中の例会はありません</div>}

      <div className='space-y-3'>
        {events.map(event => {
          const dept = event.YamanokaiDepartment
          const myApp = applicationMap[event.id]
          const deadlinePassed = isDeadlinePassed(event.deadline)

          return (
            <div key={event.id} className='p-4 border rounded-lg bg-white hover:shadow-md transition-shadow'>
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-1 flex-wrap'>
                    <span
                      className='text-xs px-2 py-0.5 rounded-full font-medium'
                      style={{ color: dept.color ?? '#6b7280', backgroundColor: dept.bgColor ?? '#f3f4f6' }}
                    >
                      {dept.name}
                    </span>
                    <span className='text-sm text-gray-500'>{formatDate(event.startAt)}</span>
                    {event.startAt.toString() !== event.endAt.toString() && (
                      <span className='text-sm text-gray-500'>〜 {formatDate(event.endAt)}</span>
                    )}
                  </div>

                  <h3
                    className='font-bold text-lg cursor-pointer hover:text-blue-600 transition-colors'
                    onClick={() => detailModal.handleOpen(event)}
                  >
                    {event.title}
                    {event.mountainName && <span className='text-base text-gray-600 ml-2'>{event.mountainName}</span>}
                  </h3>

                  <div className='flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap'>
                    <span>
                      体力:{event.staminaGrade} 技術:{event.skillGrade}
                      {event.rockCategory !== 'なし' && ` 岩:${event.rockCategory}`}
                    </span>
                    <span>CL: {event.CL.name}</span>
                    {event.SL && <span>SL: {event.SL.name}</span>}
                  </div>
                  <div className='flex items-center gap-4 mt-1 text-sm text-gray-500 flex-wrap'>
                    <span>
                      集合: {event.meetingPlace} {event.meetingTime}
                    </span>
                    <span>締切: {formatDate(event.deadline)}</span>
                  </div>
                </div>

                {/* 申請ステータス / 申請ボタン */}
                <div className='flex-shrink-0 ml-4'>
                  {myApp ? (
                    <ApplicationStatus app={myApp} />
                  ) : deadlinePassed ? (
                    <span className='text-xs text-red-500'>締切超過</span>
                  ) : (
                    <Button size='sm' color='blue' onClick={() => applyModal.handleOpen(event)}>
                      参加申請
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 詳細モーダル */}
      <detailModal.Modal title='例会詳細'>
        {detailModal.open && <EventDetail event={detailModal.open} />}
      </detailModal.Modal>

      {/* 申請モーダル */}
      <applyModal.Modal title='参加申請'>
        {applyModal.open && (
          <div className='space-y-4'>
            <div className='bg-blue-50 rounded p-3 text-sm'>
              <p className='font-bold'>{applyModal.open.title}</p>
              <p className='text-gray-600 mt-1'>
                {formatDate(applyModal.open.startAt)}
                {applyModal.open.startAt.toString() !== applyModal.open.endAt.toString() &&
                  ` 〜 ${formatDate(applyModal.open.endAt)}`}
              </p>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>コメント（任意）</label>
              <textarea
                className='w-full border rounded px-3 py-2'
                value={applyComment}
                onChange={e => setApplyComment(e.target.value)}
                placeholder='CL/SLへの連絡事項があれば記入してください'
                rows={3}
              />
            </div>
            <div className='flex justify-end gap-2'>
              <Button
                color='gray'
                onClick={() => {
                  setApplyComment('')
                  applyModal.handleClose()
                }}
              >
                キャンセル
              </Button>
              <Button color='blue' onClick={() => handleApply(applyModal.open!.id)} disabled={isLoading}>
                申請を送信
              </Button>
            </div>
          </div>
        )}
      </applyModal.Modal>
    </div>
  )
}

export default EventsClient

// 申請ステータス表示
const ApplicationStatus = ({ app }: { app: YamanokaiAttendance }) => {
  const statusKey = app.status as keyof typeof APPLICATION_STATUS_MAP

  const statusInfo = APPLICATION_STATUS_MAP[statusKey]
  if (!statusInfo) return null

  return (
    <div className='text-center'>
      <span
        className='text-xs px-2 py-0.5 rounded-full font-medium'
        style={{ color: statusInfo.color, backgroundColor: statusInfo.bgColor }}
      >
        {statusInfo.label}
      </span>
      {app.comment && <div className='mt-1 text-xs text-gray-500 max-w-[200px]'>{app.comment}</div>}
      {app.status === 'rejected' && app.rejectionReason && (
        <div className='mt-1 text-xs text-red-600 bg-red-50 rounded p-2 max-w-[200px]'>却下理由: {app.rejectionReason}</div>
      )}
      {app.status === 'approved' && <div className='mt-1 text-xs text-green-600'>参加承認済</div>}
    </div>
  )
}

// 例会詳細コンポーネント
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
          <span
            className='text-xs px-2 py-0.5 rounded-full font-medium'
            style={{ color: dept.color ?? '#6b7280', backgroundColor: dept.bgColor ?? '#f3f4f6' }}
          >
            {dept.name}
          </span>
        </div>
        <div>
          <h4 className='font-bold text-sm text-gray-500'>日程</h4>
          <p>
            {formatDate(event.startAt)}
            {event.startAt.toString() !== event.endAt.toString() && ` 〜 ${formatDate(event.endAt)}`}
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
