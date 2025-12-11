import prisma from 'src/lib/prisma'
import { ScheduleCC } from './ScheduleCC'
import Redirector from '@cm/components/utils/Redirector'
import { initServerComopnent } from 'src/non-common/serverSideFunction'

// 月の最終日を取得
const getLastDayOfMonth = (date: Date) => {
 return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

// 日付をフォーマット (YYYY-MM)
const formatYearMonthForQuery = (date: Date) => {
 const year = date.getFullYear()
 const month = String(date.getMonth() + 1).padStart(2, '0')
 return `${year}-${month}`
}

// クエリから年月をパース
const parseYearMonthFromQuery = (yearMonthStr: string) => {
 const [year, month] = yearMonthStr.split('-').map(Number)
 if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
  return null
 }
 return new Date(year, month - 1, 1)
}

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

 // 乗務員一覧（UserテーブルからsanshoTouristアプリを持つユーザー）
 const drivers = await prisma.user.findMany({
  where: {
   apps: { has: 'sanshoTourist' },
  },
  select: {
   id: true,
   name: true,
  },
  orderBy: { name: 'asc' },
 })

 // 祝日一覧
 const holidays = await prisma.stHoliday.findMany({
  orderBy: { date: 'asc' },
 })

 // 全ユーザー（点呼者選択用）
 const allUsers = await prisma.user.findMany({
  where: {
   apps: { has: 'sanshoTourist' },
  },
  select: {
   id: true,
   name: true,
  },
  orderBy: { name: 'asc' },
 })

 return {
  vehicles,
  customers,
  drivers,
  holidays,
  allUsers,
 }
}

export default async function SchedulePage(props) {
 const query = await props.searchParams

 // セッションとスコープを取得
 const { session, scopes } = await initServerComopnent({ query })

 const { vehicles, customers, drivers, holidays, allUsers } = await getInitialData()

 // 今日の日付
 const today = new Date()
 today.setHours(0, 0, 0, 0)
 const defaultYearMonth = formatYearMonthForQuery(today)

 // monthパラメータがない場合はリダイレクト
 if (!query.month) {
  return <Redirector redirectPath={`/sanshoTourist/schedule?month=${defaultYearMonth}`} />
 }

 // 年月の妥当性チェック
 const firstDayOfMonth = parseYearMonthFromQuery(query.month)
 if (!firstDayOfMonth) {
  return <Redirector redirectPath={`/sanshoTourist/schedule?month=${defaultYearMonth}`} />
 }

 const lastDayOfMonth = getLastDayOfMonth(firstDayOfMonth)
 const numDays = lastDayOfMonth.getDate()

 return (
  <div>
   <ScheduleCC
    vehicles={vehicles}
    customers={customers}
    drivers={drivers}
    holidays={holidays}
    allUsers={allUsers}
    initialMonth={firstDayOfMonth}
    numDays={numDays}
   />
  </div>
 )
}
