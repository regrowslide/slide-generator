import {useState, useMemo} from 'react'
import {DEPARTMENTS, APPLICATION_STATUS, formatDate, formatDateRange} from './_constants'
import {Modal, Badge, Button, Card, FormField, Textarea} from './_ui'

// =============================================================================
// 一般会員: カレンダービュー
// =============================================================================

export function MemberCalendar({events, applications, records, members, currentUserId, onApply}) {
  const [viewMonth, setViewMonth] = useState(new Date(2026, 1, 1)) // 2026年2月
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [applyModal, setApplyModal] = useState(null)
  const [applyComment, setApplyComment] = useState('')

  // カレンダー生成
  const calendarDays = useMemo(() => {
    const year = viewMonth.getFullYear()
    const month = viewMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPadding = firstDay.getDay()

    const days = []
    // 前月のパディング
    for (let i = 0; i < startPadding; i++) {
      const d = new Date(year, month, -startPadding + i + 1)
      days.push({date: d, isCurrentMonth: false})
    }
    // 当月
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({date: new Date(year, month, i), isCurrentMonth: true})
    }
    // 次月のパディング（6週分に揃える）
    while (days.length < 42) {
      const d = new Date(year, month + 1, days.length - lastDay.getDate() - startPadding + 1)
      days.push({date: d, isCurrentMonth: false})
    }
    return days
  }, [viewMonth])

  // 日付の例会を取得
  const getEventsForDate = date => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(e => {
      return dateStr >= e.startDate && dateStr <= (e.endDate || e.startDate)
    })
  }

  // ユーザーの申し込みを取得
  const getMyApplication = eventId => {
    return applications.find(a => a.eventId === eventId && a.memberId === currentUserId)
  }

  return (
    <div className="space-y-4">
      {/* 月切り替え */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
          >
            ← 前月
          </Button>
          <h3 className="text-xl font-bold">
            {viewMonth.getFullYear()}年{viewMonth.getMonth() + 1}月
          </h3>
          <Button
            variant="secondary"
            onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
          >
            次月 →
          </Button>
        </div>
      </Card>

      {/* カレンダー */}
      <Card className="overflow-hidden">
        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 bg-gray-50 border-b">
          {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
            <div
              key={day}
              className={`p-2 text-center text-sm font-medium ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : ''}`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* カレンダー本体 */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            const dayEvents = getEventsForDate(day.date)
            const isToday = day.date.toDateString() === new Date().toDateString()

            return (
              <div
                key={idx}
                className={`min-h-[100px] border-b border-r p-1 ${!day.isCurrentMonth ? 'bg-gray-50' : ''} ${isToday ? 'bg-blue-50' : ''}`}
              >
                <div className={`text-sm mb-1 ${!day.isCurrentMonth ? 'text-gray-300' : ''}`}>{day.date.getDate()}</div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => {
                    const dept = DEPARTMENTS[event.departmentId]
                    const myApp = getMyApplication(event.id)
                    const appStatus = myApp ? APPLICATION_STATUS[myApp.approvalStatus] : null

                    return (
                      <div
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className="text-xs p-1 rounded cursor-pointer truncate hover:opacity-80"
                        style={{backgroundColor: dept.bgColor, color: dept.color, borderLeft: `3px solid ${dept.color}`}}
                        title={event.title}
                      >
                        <span className="font-medium">{event.title}</span>
                        {appStatus && (
                          <span className="ml-1" style={{color: appStatus.color}}>
                            ●
                          </span>
                        )}
                      </div>
                    )
                  })}
                  {dayEvents.length > 3 && <div className="text-xs text-gray-400 pl-1">+{dayEvents.length - 3}件</div>}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* 凡例 */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="font-medium">部署:</span>
          {Object.values(DEPARTMENTS).map(dept => (
            <span key={dept.id} className="flex items-center gap-1">
              <span className="w-3 h-3 rounded" style={{backgroundColor: dept.bgColor, border: `1px solid ${dept.color}`}}></span>
              {dept.name}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 text-sm mt-2">
          <span className="font-medium">申し込み状況:</span>
          {Object.values(APPLICATION_STATUS).map(st => (
            <span key={st.id} className="flex items-center gap-1">
              <span style={{color: st.color}}>●</span>
              {st.label}
            </span>
          ))}
        </div>
      </Card>

      {/* 例会詳細モーダル */}
      <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="例会詳細" size="lg">
        {selectedEvent && (
          <div className="space-y-6">
            <MemberEventDetail event={selectedEvent} members={members} />

            {/* 参加申し込み */}
            <div className="border-t pt-4">
              <h4 className="font-bold mb-3">参加申し込み</h4>
              {(() => {
                const myApp = getMyApplication(selectedEvent.id)
                if (myApp) {
                  const appStatus = APPLICATION_STATUS[myApp.approvalStatus]
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <span>申し込み状況:</span>
                        <Badge color={appStatus.color} bgColor={appStatus.bgColor}>
                          {appStatus.label}
                        </Badge>
                      </div>
                      {myApp.comment && (
                        <p className="text-sm text-gray-600">コメント: {myApp.comment}</p>
                      )}
                      {myApp.approvalStatus === 'rejected' && myApp.rejectionReason && (
                        <div className="text-sm text-red-600 bg-red-50 rounded p-2">
                          却下理由: {myApp.rejectionReason}
                        </div>
                      )}
                    </div>
                  )
                }
                return (
                  <Button size="sm" onClick={() => {
                    setApplyModal(selectedEvent)
                    setApplyComment('')
                  }}>
                    参加申請する
                  </Button>
                )
              })()}
            </div>

            {/* 例会記録へのリンク */}
            {records.some(r => r.eventId === selectedEvent.id) && (
              <div className="border-t pt-4">
                <h4 className="font-bold mb-2">例会記録</h4>
                <p className="text-sm text-gray-600">この例会の記録があります。「例会記録」メニューから確認できます。</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 参加申請モーダル */}
      <Modal isOpen={!!applyModal} onClose={() => setApplyModal(null)} title="参加申請" size="sm">
        {applyModal && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded p-3 text-sm">
              <p className="font-bold">{applyModal.title}</p>
              <p className="text-gray-600 mt-1">{formatDateRange(applyModal.startDate, applyModal.endDate)}</p>
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
              <Button variant="secondary" onClick={() => setApplyModal(null)}>
                キャンセル
              </Button>
              <Button onClick={() => {
                onApply(applyModal.id, applyComment)
                setApplyModal(null)
                setSelectedEvent(null)
              }}>
                申請を送信
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

// =============================================================================
// 一般会員: 例会詳細表示
// =============================================================================

export function MemberEventDetail({event, members}) {
  const dept = DEPARTMENTS[event.departmentId]
  const getMemberName = id => members.find(m => m.id === id)?.name || ''

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge color={dept.color} bgColor={dept.bgColor}>
          {dept.name}
        </Badge>
        <span className="text-gray-500">{formatDateRange(event.startDate, event.endDate)}</span>
      </div>

      <h3 className="text-xl font-bold">{event.title}</h3>
      {event.mountainName && (
        <p className="text-gray-600">
          {event.mountainName} {event.altitude}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">CL:</span> {getMemberName(event.clId)}
        </div>
        {event.slId && (
          <div>
            <span className="text-gray-500">SL:</span> {getMemberName(event.slId)}
          </div>
        )}
        <div>
          <span className="text-gray-500">集合:</span> {event.meetingPlace} {event.meetingTime}
        </div>
        <div>
          <span className="text-gray-500">申込期限:</span> {formatDate(event.deadline)}
        </div>
        <div>
          <span className="text-gray-500">グレード:</span> 体力{event.staminaGrade}
          {event.skillGrade !== 'なし' && ` / 技術${event.skillGrade}`}
          {event.rockCategory !== 'なし' && ` / 岩${event.rockCategory}`}
        </div>
        <div>
          <span className="text-gray-500">必要保険:</span> {event.requiredInsurance}口以上
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-500 text-sm">コース</h4>
        <p className="whitespace-pre-wrap">{event.course}</p>
      </div>

      {event.notes && (
        <div>
          <h4 className="font-medium text-gray-500 text-sm">備考</h4>
          <p className="whitespace-pre-wrap">{event.notes}</p>
        </div>
      )}
    </div>
  )
}
