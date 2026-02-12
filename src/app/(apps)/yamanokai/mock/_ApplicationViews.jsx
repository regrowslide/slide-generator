import {useState} from 'react'
import {DEPARTMENTS, APPLICATION_STATUS, formatDate, formatDateRange} from './_constants'
import {Modal, Badge, Button, Card, FormField, Select, Textarea} from './_ui'

// =============================================================================
// 会員: 参加申請
// =============================================================================

export function MemberApplicationView({events, applications, members, currentUserId, onApply}) {
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

export function AdminApplicationView({events, applications, members, currentUserId, onApprove, onReject, onToggleAttended, initialEventId}) {
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
