'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Briefcase, TrendingUp, Target, DollarSign, AlertTriangle, CheckSquare, Square, ArrowRight, Handshake, Calendar, MapPin } from 'lucide-react'
import { useFrankartMockData } from '../context/MockDataContext'
import { DEAL_STATUS_CONFIG } from './constants'

const DashboardPage: React.FC = () => {
  const router = useRouter()
  const { deals, todos, toggleTodoComplete, meetings } = useFrankartMockData()

  const today = new Date().toISOString().split('T')[0]

  // KPI計算
  const activeDeals = deals.filter((d) => d.status !== 'lost')
  const meetingDeals = deals.filter((d) => d.status === 'meeting')
  const wonDeals = deals.filter((d) => d.status === 'won')
  const lostDeals = deals.filter((d) => d.status === 'lost')
  const winRate = wonDeals.length + lostDeals.length > 0
    ? Math.round((wonDeals.length / (wonDeals.length + lostDeals.length)) * 100)
    : 0
  const totalAmount = activeDeals.reduce((sum, d) => sum + d.amount, 0)

  // フォロー期限切れ
  const overdueDeals = deals.filter(
    (d) => d.nextFollowUp && d.nextFollowUp < today && d.status !== 'won' && d.status !== 'lost'
  )

  // 今週のタスク（簡易: 今日から7日以内のToDo）
  const weekEnd = new Date()
  weekEnd.setDate(weekEnd.getDate() + 7)
  const weekEndStr = weekEnd.toISOString().split('T')[0]
  const weekTodos = todos
    .filter((t) => t.dueDate <= weekEndStr && t.dueDate >= today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))

  // 案件クリック
  const handleDealClick = (dealId: string) => {
    router.push(`/KM/mocks/frankart/deals/${dealId}`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* KPI カード */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: '案件数', value: activeDeals.length, suffix: '件', icon: Briefcase, color: 'from-slate-600 to-slate-800' },
          { label: '商談中', value: meetingDeals.length, suffix: '件', icon: TrendingUp, color: 'from-amber-500 to-amber-600' },
          { label: '受注率', value: winRate, suffix: '%', icon: Target, color: 'from-emerald-500 to-emerald-600' },
          { label: '見込み総額', value: `${(totalAmount / 10000).toLocaleString()}`, suffix: '万円', icon: DollarSign, color: 'from-blue-500 to-blue-600' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-stone-500">{kpi.label}</span>
              <div className={`p-2 bg-gradient-to-r ${kpi.color} rounded-lg`}>
                <kpi.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-stone-800">{kpi.value}</span>
              <span className="text-sm text-stone-500">{kpi.suffix}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 今後の商談 */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm">
        <div className="px-5 py-4 border-b border-stone-100 flex items-center gap-2">
          <Handshake className="w-4 h-4 text-slate-600" />
          <h2 className="font-bold text-stone-800 text-sm">今後の商談</h2>
          {(() => {
            const upcoming = meetings
              .filter((m) => m.date >= today)
              .sort((a, b) => a.date.localeCompare(b.date))
              .slice(0, 5)
            return (
              <span className="ml-auto px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">
                {upcoming.length}件
              </span>
            )
          })()}
        </div>
        <div className="divide-y divide-stone-100">
          {(() => {
            const upcoming = meetings
              .filter((m) => m.date >= today)
              .sort((a, b) => a.date.localeCompare(b.date))
              .slice(0, 5)
            if (upcoming.length === 0) {
              return <div className="px-5 py-8 text-center text-stone-400 text-sm">予定されている商談はありません</div>
            }
            return upcoming.map((mtg) => (
              <button
                key={mtg.id}
                onClick={() => handleDealClick(mtg.dealId)}
                className="w-full px-5 py-3 flex items-center justify-between hover:bg-stone-50 transition-colors text-left"
              >
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span className="text-sm font-medium text-stone-800">{mtg.date} {mtg.time}</span>
                  </div>
                  <p className="text-xs text-stone-600 ml-5.5">{mtg.dealTitle} — {mtg.companyName}</p>
                  <div className="flex items-center gap-1 text-xs text-stone-400 mt-0.5 ml-5.5">
                    <MapPin className="w-3 h-3" />
                    {mtg.location}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 shrink-0" />
              </button>
            ))
          })()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* アラート: フォロー期限切れ */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h2 className="font-bold text-stone-800 text-sm">フォロー期限切れ</h2>
            {overdueDeals.length > 0 && (
              <span className="ml-auto px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                {overdueDeals.length}件
              </span>
            )}
          </div>
          <div className="divide-y divide-stone-100">
            {overdueDeals.length === 0 ? (
              <div className="px-5 py-8 text-center text-stone-400 text-sm">期限切れの案件はありません</div>
            ) : (
              overdueDeals.map((deal) => {
                const overdueDays = Math.ceil(
                  (new Date(today).getTime() - new Date(deal.nextFollowUp).getTime()) / (1000 * 60 * 60 * 24)
                )
                return (
                  <button
                    key={deal.id}
                    onClick={() => handleDealClick(deal.id)}
                    className="w-full px-5 py-3 flex items-center justify-between hover:bg-stone-50 transition-colors text-left"
                  >
                    <div>
                      <p className="text-sm font-medium text-stone-800">{deal.title}</p>
                      <p className="text-xs text-stone-500">{deal.companyName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-600 font-medium">{overdueDays}日超過</span>
                      <ArrowRight className="w-4 h-4 text-stone-400" />
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* 今週のタスク */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-slate-600" />
            <h2 className="font-bold text-stone-800 text-sm">今週のタスク</h2>
            <span className="ml-auto px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">
              {weekTodos.filter((t) => !t.completed).length}/{weekTodos.length}
            </span>
          </div>
          <div className="divide-y divide-stone-100">
            {weekTodos.length === 0 ? (
              <div className="px-5 py-8 text-center text-stone-400 text-sm">今週のタスクはありません</div>
            ) : (
              weekTodos.map((todo) => (
                <div key={todo.id} className="px-5 py-3 flex items-center gap-3">
                  <button onClick={() => toggleTodoComplete(todo.id)} className="shrink-0">
                    {todo.completed ? (
                      <CheckSquare className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Square className="w-5 h-5 text-stone-300" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${todo.completed ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                      {todo.title}
                    </p>
                    <p className="text-xs text-stone-500">{todo.assigneeName} · {todo.dueDate}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
