import prisma from 'src/lib/prisma'
import { initServerComopnent } from 'src/non-common/serverSideFunction'
import { MasterCC } from './MasterCC'

// データ取得
const getInitialData = async () => {
  // 車両一覧（プレートNo順）
  const vehicles = await prisma.stVehicle.findMany({
    where: {active: true},
    orderBy: {plateNumber: 'asc'},
  })

  // 会社一覧（名称順、担当者も名称順）
  const customers = await prisma.stCustomer.findMany({
    where: {active: true},
    include: {
      StContact: {
        where: {active: true},
        orderBy: {name: 'asc'},
      },
    },
    orderBy: {name: 'asc'},
  })

  // 祝日一覧（日付順）
  const holidays = await prisma.stHoliday.findMany({
    orderBy: {date: 'asc'},
  })

  return {
    vehicles,
    customers,
    holidays,
  }
}

export default async function MasterPage(props) {
  const query = await props.searchParams

  // セッションとスコープを取得
  const { session, scopes } = await initServerComopnent({ query })

  const { vehicles, customers, holidays } = await getInitialData()

  return (
    <div className={`mx-auto p-2 w-fit`}>
      <MasterCC
        vehicles={vehicles}
        customers={customers}
        holidays={holidays}
      />
    </div>
  )
}
