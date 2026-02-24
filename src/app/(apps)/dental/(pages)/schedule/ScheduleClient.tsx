'use client'

import {useState, useMemo, useCallback} from 'react'
import {useRouter} from 'next/navigation'
import {DndContext, DragOverlay, MouseSensor, useSensor, useSensors, useDraggable, useDroppable} from '@dnd-kit/core'
import type {DragEndEvent, DragStartEvent} from '@dnd-kit/core'
import {HREF} from '@cm/lib/methods/urls'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useModal from '@cm/components/utils/modal/useModal'
import {createDentalVisitPlan, updateDentalVisitPlan} from '@app/(apps)/dental/_actions/visit-plan-actions'
import {generateCalendarDays, formatDate} from '@app/(apps)/dental/lib/helpers'
import type {Facility, VisitPlan, CalendarDay} from '@app/(apps)/dental/lib/types'

type VisitPlanWithFacilityName = VisitPlan & {facilityName: string}

type Props = {
  facilities: Facility[]
  visitPlans: VisitPlanWithFacilityName[]
  clinicId: number
}

// ドロップ可能な日付セル
const DroppableDayCell = ({dateStr, children}: {dateStr: string; children: React.ReactNode}) => {
  const {isOver, setNodeRef} = useDroppable({id: dateStr})
  return (
    <div ref={setNodeRef} className={`transition-colors ${isOver ? 'bg-blue-50 ring-1 ring-blue-300' : ''}`}>
      {children}
    </div>
  )
}

// ドラッグ可能な訪問計画ボタン
const DraggablePlanItem = ({
  plan,
  onClick,
  label,
}: {
  plan: VisitPlanWithFacilityName
  onClick: () => void
  label: string
}) => {
  const {attributes, listeners, setNodeRef, isDragging} = useDraggable({id: plan.id, data: {plan}})
  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`w-full text-left px-1 py-0.5 text-xs bg-slate-100 text-slate-700 rounded truncate hover:bg-slate-200 cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-30' : ''
      }`}
    >
      {label}
    </button>
  )
}

const ScheduleClient = ({facilities, visitPlans, clinicId}: Props) => {
  const router = useRouter()
  const {query} = useGlobal()
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedFacilityId, setSelectedFacilityId] = useState('')
  const visitPlanModal = useModal()

  // DnD
  const sensors = useSensors(useSensor(MouseSensor, {activationConstraint: {distance: 5}}))
  const [activePlan, setActivePlan] = useState<VisitPlanWithFacilityName | null>(null)

  const handleDragStart = (event: DragStartEvent) => {
    const plan = event.active.data.current?.plan as VisitPlanWithFacilityName | undefined
    setActivePlan(plan ?? null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActivePlan(null)
    const {active, over} = event
    if (!over) return

    const planId = active.id as number
    const newDate = over.id as string
    const plan = visitPlans.find(p => p.id === planId)
    if (!plan || plan.visitDate === newDate) return

    await updateDentalVisitPlan(planId, {visitDate: newDate})
    router.refresh()
  }

  // フォーム状態
  const [formDate, setFormDate] = useState('')
  const [formFacilityId, setFormFacilityId] = useState('')

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const calendarDays = useMemo(() => generateCalendarDays(year, month), [year, month])

  const filteredPlans = useMemo(() => {
    if (!selectedFacilityId) return visitPlans
    return visitPlans.filter(p => p.facilityId === Number(selectedFacilityId))
  }, [visitPlans, selectedFacilityId])

  const getPlansByDate = useCallback(
    (date: Date) => {
      const dateStr = formatDate(date)
      return filteredPlans.filter(p => p.visitDate === dateStr)
    },
    [filteredPlans]
  )

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const handleCreatePlan = async () => {
    if (!formDate || !formFacilityId) return
    await createDentalVisitPlan({
      dentalClinicId: clinicId,
      dentalFacilityId: Number(formFacilityId),
      visitDate: formDate,
      status: 'planned',
    })
    visitPlanModal.handleClose()
    setFormDate('')
    setFormFacilityId('')
    router.refresh()
  }

  const handleSelectPlan = (plan: VisitPlanWithFacilityName) => {
    router.push(HREF(`/dental/visit-detail`, {visitPlanId: plan.id}, query))
  }

  const weekDays = ['日', '月', '火', '水', '木', '金', '土']

  return (
    <div className="p-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">訪問計画スケジュール</h2>
        <div className="flex items-center gap-2">
          <select
            value={selectedFacilityId}
            onChange={e => setSelectedFacilityId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">全ての施設</option>
            {facilities.map(f => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => visitPlanModal.handleOpen()}
            className="px-4 py-2 bg-slate-700 text-white rounded-md text-sm hover:bg-slate-800"
          >
            + 新規作成
          </button>
        </div>
      </div>

      {/* カレンダー */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {/* 月ナビゲーション */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded text-gray-600">
            &lt;
          </button>
          <h3 className="text-lg font-semibold text-gray-900">
            {year}年 {month + 1}月
          </h3>
          <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded text-gray-600">
            &gt;
          </button>
        </div>

        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 mb-1">
          {weekDays.map((day, i) => (
            <div
              key={day}
              className={`text-center text-xs font-medium py-1 ${
                i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* カレンダー本体 */}
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200">
            {calendarDays.map((dayInfo: CalendarDay, index: number) => {
              const dateStr = formatDate(dayInfo.date)
              const plans = getPlansByDate(dayInfo.date)
              const dayOfWeek = dayInfo.date.getDay()
              return (
                <DroppableDayCell key={index} dateStr={dateStr}>
                  <div className={`bg-white min-h-[80px] p-1 ${!dayInfo.isCurrentMonth ? 'bg-gray-50' : ''}`}>
                    <div
                      className={`text-xs font-medium mb-1 ${
                        !dayInfo.isCurrentMonth
                          ? 'text-gray-400'
                          : dayOfWeek === 0
                            ? 'text-red-500'
                            : dayOfWeek === 6
                              ? 'text-blue-500'
                              : 'text-gray-900'
                      }`}
                    >
                      {dayInfo.date.getDate()}
                    </div>
                    <div className="space-y-0.5">
                      {plans.map(plan => (
                        <DraggablePlanItem
                          key={plan.id}
                          plan={plan}
                          onClick={() => handleSelectPlan(plan)}
                          label={plan.facilityName || facilities.find(f => f.id === plan.facilityId)?.name || ''}
                        />
                      ))}
                    </div>
                  </div>
                </DroppableDayCell>
              )
            })}
          </div>

          {/* ドラッグ中のプレビュー */}
          <DragOverlay>
            {activePlan ? (
              <div className="px-2 py-1 text-xs bg-slate-200 text-slate-800 rounded shadow-lg border border-slate-300">
                {activePlan.facilityName}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* 新規作成モーダル */}
      <visitPlanModal.Modal title="新規訪問計画">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">訪問日</label>
            <input
              type="date"
              value={formDate}
              onChange={e => setFormDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">施設</label>
            <select
              value={formFacilityId}
              onChange={e => setFormFacilityId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">選択してください</option>
              {facilities.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={visitPlanModal.handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleCreatePlan}
              className="px-4 py-2 bg-slate-700 text-white rounded-md text-sm hover:bg-slate-800"
            >
              作成
            </button>
          </div>
        </div>
      </visitPlanModal.Modal>
    </div>
  )
}

export default ScheduleClient
