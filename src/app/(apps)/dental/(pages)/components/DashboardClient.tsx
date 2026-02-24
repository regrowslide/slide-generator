'use client'

import Link from 'next/link'
import {Card, CardContent} from '@shadcn/ui/card'
import {HREF} from '@cm/lib/methods/urls'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {EXAMINATION_STATUS} from '@app/(apps)/dental/lib/constants'
import {formatDate} from '@app/(apps)/dental/lib/helpers'
import type {Clinic, VisitPlan, Examination} from '@app/(apps)/dental/lib/types'

type DashboardClientProps = {
  clinic: Clinic | null
  visitPlans: VisitPlan[]
  examinations: Examination[]
}

const DashboardClient = ({clinic, visitPlans, examinations}: DashboardClientProps) => {
  const {query} = useGlobal()
  const todayStr = formatDate(new Date())
  const todayPlans = visitPlans.filter(p => p.visitDate === todayStr)
  const completedExams = examinations.filter(e => e.status === EXAMINATION_STATUS.DONE)

  const cards = [
    {
      id: 'schedule',
      icon: '\u{1F4C5}',
      title: 'Schedule / Visits',
      sub: '訪問計画スケジュール',
      desc: '月間カレンダーで訪問計画を管理',
      stat: `本日の予定: ${todayPlans.length}件`,
      href: HREF('/dental/schedule', {}, query),
    },
    {
      id: 'admin-patients',
      icon: '\u{1F465}',
      title: 'Patient Master',
      sub: '利用者マスタ',
      desc: '利用者の検索・登録・編集・削除を行います',
      href: HREF('/dental/admin/patients', {}, query),
    },
    {
      id: 'individual-input',
      icon: '\u{270F}\u{FE0F}',
      title: 'Individual Input',
      sub: '個別入力',
      desc: '個人を選択して直接入力する場合',
      href: HREF('/dental/individual-input', {}, query),
    },
    {
      id: 'admin-clinic',
      icon: '\u{2699}\u{FE0F}',
      title: 'Master Data Management',
      sub: 'マスタデータ管理',
      desc: 'クリニック設定、施設、スタッフ、テンプレートの管理',
      href: HREF('/dental/admin/clinic', {}, query),
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">ダッシュボード</h2>
        <p className="text-sm text-gray-500 mt-1">
          {clinic?.name || '訪問歯科診療サポートアプリ'}
        </p>
      </div>

      {/* 統計サマリー */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-gray-500">本日の訪問予定</div>
            <div className="text-2xl font-bold text-slate-700">{todayPlans.length} 件</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-gray-500">診察完了</div>
            <div className="text-2xl font-bold text-emerald-600">{completedExams.length} 名</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-gray-500">今日の日付</div>
            <div className="text-lg font-bold text-slate-700">{todayStr}</div>
          </CardContent>
        </Card>
      </div>

      {/* メインナビゲーションカード */}
      <div className="grid grid-cols-2 gap-6 max-w-3xl">
        {cards.map(card => (
          <Link
            key={card.id}
            href={card.href}
            className="text-left p-6 rounded-lg border-2 border-gray-200 bg-white hover:border-slate-400 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
          >
            <div className="text-3xl mb-3">{card.icon}</div>
            <div className="text-base font-bold text-gray-900">{card.title}</div>
            <div className="text-sm font-medium text-slate-600 mt-0.5">{card.sub}</div>
            <div className="text-xs text-gray-500 mt-2">{card.desc}</div>
            {card.stat && <div className="text-xs text-emerald-600 font-medium mt-2">{card.stat}</div>}
          </Link>
        ))}
      </div>

      {/* 直近の訪問計画 */}
      {visitPlans.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-3">今後の訪問予定</h3>
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-gray-200">
                {visitPlans.slice(0, 5).map(plan => (
                  <li key={plan.id} className="px-4 py-3 flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">{plan.visitDate}</span>
                      <span className="text-gray-500 ml-2">施設ID: {plan.facilityId}</span>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        plan.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {plan.status === 'completed' ? '完了' : '予定'}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default DashboardClient
