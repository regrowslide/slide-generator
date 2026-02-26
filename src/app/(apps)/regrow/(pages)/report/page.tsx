import {initServerComopnent} from 'src/non-common/serverSideFunction'
import {getAvailableMonths, getMonthlyReport} from '../../_actions/monthly-report-actions'
import {getStaffs} from '../../_actions/staff-actions'
import {getCurrentYearMonth} from '../../lib/storage'
import RegrowReportClient from './RegrowReportClient'

export default async function RegrowReportPage(props: {searchParams: Promise<any>}) {
  const query = await props.searchParams
  const {session} = await initServerComopnent({query})

  const availableMonths = await getAvailableMonths()
  const defaultYearMonth = availableMonths[0] || getCurrentYearMonth()
  const monthlyData = await getMonthlyReport(defaultYearMonth)
  const staffs = await getStaffs()

  return (
    <RegrowReportClient
      initialMonths={availableMonths}
      initialYearMonth={defaultYearMonth}
      initialData={monthlyData}
      initialStaffMaster={staffs}
    />
  )
}
