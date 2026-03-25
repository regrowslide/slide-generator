'use client'

import KpiCard from './KpiCard'
import RankingCard from './RankingCard'
import SimpleBarChart from './SimpleBarChart'
import {
  calculateDashboardKpi,
  calculateRankings,
  calculateCarrierProfit,
  calculateRoleRoi,
  calculateStaffPl,
  MOCK_CLIENTS,
  MOCK_ASSIGNMENTS,
  MOCK_STAFF_RATES,
} from '../lib/mock-data'

// 金額フォーマット
const formatYen = (value: number) => `¥${value.toLocaleString()}`
const formatPercent = (value: number) => `${value.toFixed(1)}%`

// クライアント別粗利上位を計算
const calculateClientProfit = () => {
  const clientProfitMap = new Map<number, { name: string; profit: number }>()

  for (const assignment of MOCK_ASSIGNMENTS) {
    const client = MOCK_CLIENTS.find((c) => c.id === assignment.clientId)
    const rate = MOCK_STAFF_RATES.find(
      (r) =>
        r.staffId === assignment.staffId &&
        r.clientId === assignment.clientId &&
        r.roleId === assignment.roleId
    )
    if (!client || !rate) continue

    const profit = rate.unitPrice - rate.paymentPrice - assignment.transportCost
    const existing = clientProfitMap.get(client.id)
    if (existing) {
      existing.profit += profit
    } else {
      clientProfitMap.set(client.id, { name: client.name, profit })
    }
  }

  return Array.from(clientProfitMap.values())
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5)
    .map((c) => ({ name: c.name, value: c.profit }))
}

type Props = {
  year: number
  month: number
}

const DashboardTab = ({ year, month }: Props) => {
  const kpi = calculateDashboardKpi()
  const { profitRanking, revenueRanking, workdaysRanking } = calculateRankings()
  const carrierProfit = calculateCarrierProfit()
  const roleRoi = calculateRoleRoi()
  const clientProfit = calculateClientProfit()
  const staffPl = calculateStaffPl()

  // 自社/他社比率
  const inHouseCount = staffPl.filter((s) => s.employmentType === '自社').length
  const outsourceCount = staffPl.filter((s) => s.employmentType === '他社').length

  return (
    <div className="space-y-6">
      {/* メインKPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="総売上" value={formatYen(kpi.totalRevenue)} color="blue" />
        <KpiCard label="総支払" value={formatYen(kpi.totalPayment)} color="red" />
        <KpiCard label="総粗利" value={formatYen(kpi.totalGrossProfit)} color="green" />
        <KpiCard label="粗利率" value={formatPercent(kpi.grossMarginRate)} color="orange" />
      </div>

      {/* サブKPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="総稼働数"
          value={`${kpi.totalWorkingDays}件`}
          color="purple"
        />
        <KpiCard
          label="稼働スタッフ数"
          value={`${kpi.activeStaffCount}名`}
          color="blue"
        />
        <KpiCard
          label="平均ROI"
          value={formatPercent(kpi.averageRoi)}
          color="green"
        />
        <KpiCard
          label="自社/他社"
          value={`${inHouseCount} / ${outsourceCount}`}
          subLabel={`自社率 ${((inHouseCount / (inHouseCount + outsourceCount)) * 100).toFixed(0)}%`}
          color="orange"
        />
      </div>

      {/* ランキング3列 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RankingCard
          title="粗利 TOP10"
          items={profitRanking}
          formatValue={formatYen}
        />
        <RankingCard
          title="売上 TOP10"
          items={revenueRanking}
          formatValue={formatYen}
        />
        <RankingCard
          title="稼働 TOP10"
          items={workdaysRanking}
          formatValue={(v) => `${v}日`}
        />
      </div>

      {/* 分析セクション */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SimpleBarChart
          title="キャリア別 粗利"
          items={carrierProfit}
          color="bg-indigo-500"
        />
        <SimpleBarChart
          title="クライアント別 粗利 TOP5"
          items={clientProfit}
          color="bg-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SimpleBarChart
          title="役割別 ROI"
          items={roleRoi.map((r) => ({ name: r.name, value: r.roi }))}
          formatValue={(v) => `${v.toFixed(1)}%`}
          color="bg-amber-500"
        />
        {/* 粗利率が低いスタッフ */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3">
            粗利率が低いスタッフ
          </h3>
          <div className="space-y-2">
            {staffPl
              .sort((a, b) => a.grossMarginRate - b.grossMarginRate)
              .slice(0, 5)
              .map((s) => (
                <div
                  key={s.staffId}
                  className="flex items-center justify-between py-1.5 border-b border-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      {s.staffName}
                    </span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        s.employmentType === '自社'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {s.employmentType}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      s.grossMarginRate < 15
                        ? 'text-red-600'
                        : s.grossMarginRate < 20
                          ? 'text-orange-600'
                          : 'text-gray-700'
                    }`}
                  >
                    {s.grossMarginRate.toFixed(1)}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardTab
