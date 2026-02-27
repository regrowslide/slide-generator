import {initServerComopnent} from 'src/non-common/serverSideFunction'
import {getAvailableMonths, getMonthlyReport} from '../../_actions/monthly-report-actions'
import {getStaffMaster, getCurrentUserRgRole} from '../../_actions/staff-actions'
import {getStores} from '../../_actions/store-actions'
import {getCurrentYearMonth} from '../../lib/storage'
import RegrowReportClient from './RegrowReportClient'

export default async function RegrowReportPage(props: {searchParams: Promise<any>}) {
  const query = await props.searchParams
  const {session} = await initServerComopnent({query})

  const [availableMonths, staffMaster, stores] = await Promise.all([
    getAvailableMonths(),
    getStaffMaster(),
    getStores(),
  ])
  const defaultYearMonth = availableMonths[0] || getCurrentYearMonth()
  const monthlyData = await getMonthlyReport(defaultYearMonth)

  const userId = typeof session?.id === 'number' ? session.id : null
  const currentUserRole = userId ? await getCurrentUserRgRole(userId) : 'viewer'

  return (
    <RegrowReportClient
      initialMonths={availableMonths}
      initialYearMonth={defaultYearMonth}
      initialData={monthlyData}
      initialStaffMaster={staffMaster}
      initialStores={stores}
      currentUserRole={currentUserRole}
    />
  )
}
