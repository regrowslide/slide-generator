import { initServerComopnent } from 'src/non-common/serverSideFunction'
import { getAvailableMonths, getMonthlyReport } from '../../_actions/monthly-report-actions'
import { getStaffMaster } from '../../_actions/staff-actions'
import { getStores } from '../../_actions/store-actions'
import { getCurrentYearMonth } from '../../lib/storage'
import type { MonthlyData, YearMonth } from '../../types'
import RegrowReportClient from './RegrowReportClient'
import Redirector from '@cm/components/utils/Redirector'

export default async function RegrowReportPage(props: { searchParams: Promise<any> }) {
  const query = await props.searchParams
  const { scopes, session, } = await initServerComopnent({ query })
  const regrowScopes = scopes.getRegrowScopes()

  const [availableMonths, staffMaster, stores] = await Promise.all([
    getAvailableMonths(),
    getStaffMaster(),
    getStores(),
  ])
  const defaultYearMonth = availableMonths[0] || getCurrentYearMonth()
  const monthlyData = await getMonthlyReport(defaultYearMonth)

  // 当年分の月次データをプリフェッチ
  const currentYear = defaultYearMonth.split('-')[0]
  const currentYearMonths = availableMonths.filter((m) => m.startsWith(currentYear))
  const monthlyDataResults = await Promise.all(
    currentYearMonths.map(async (ym) => {
      // 既に取得済みのデフォルト月はスキップ
      if (ym === defaultYearMonth && monthlyData) {
        return { yearMonth: ym, data: monthlyData }
      }
      const data = await getMonthlyReport(ym)
      return { yearMonth: ym, data }
    })
  )

  const allMonthlyData: Record<YearMonth, MonthlyData> = {}
  monthlyDataResults.forEach(({ yearMonth, data }) => {
    if (data) {
      allMonthlyData[yearMonth] = data
    }
  })

  if (!session?.id) {
    return <Redirector redirectPath={`/login?rootPath=regrow`} />
  }

  return (
    <RegrowReportClient
      initialMonths={availableMonths}
      initialYearMonth={defaultYearMonth}
      initialData={monthlyData}
      initialStaffMaster={staffMaster}
      initialStores={stores}
      initialAllMonthlyData={allMonthlyData}
      regrowScopes={regrowScopes}
    />
  )
}
