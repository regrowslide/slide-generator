import prisma from 'src/lib/prisma'
import { ScheduleCC } from './ScheduleCC'
import Redirector from '@cm/components/utils/Redirector'
import { initServerComopnent } from 'src/non-common/serverSideFunction'
import { HREF } from '@cm/lib/methods/urls'


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
  where: { active: true },
  orderBy: { plateNumber: 'asc' },
 })

 // 会社一覧（名称順、担当者も名称順）
 const customers = await prisma.stCustomer.findMany({
  where: { active: true },
  include: {
   StContact: {
    where: { active: true },
    orderBy: { name: 'asc' },
   },
  },
  orderBy: { name: 'asc' },
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
 const { session, scopes: { getSanshoTouristScopes } } = await initServerComopnent({ query })
 const { isSystemAdmin, isEditor, isViewer } = getSanshoTouristScopes()

 // 閲覧者以上の権限が必要
 const hasAccess = isSystemAdmin || isEditor || isViewer

 if (!hasAccess) {
  return (
   <div className="p-8 text-center">
    <div className="text-6xl mb-4">🔒</div>
    <h2 className="text-xl font-bold text-gray-700 mb-2">アクセス権限がありません</h2>
    <p className="text-gray-500">このページへのアクセス権限がありません。管理者に連絡してください。</p>
   </div>
  )
 }

 // 編集可能かどうか（管理者または編集者）
 const canEdit = isSystemAdmin || isEditor

 const { vehicles, customers, drivers, holidays, allUsers } = await getInitialData()

 // 公開範囲設定を取得
 const publishSetting = await prisma.stPublishSetting.findFirst({
  orderBy: { id: 'desc' },
 })

 // 今日の日付
 const today = new Date()
 today.setHours(0, 0, 0, 0)
 const defaultYearMonth = formatYearMonthForQuery(today)

 // monthパラメータがない場合はリダイレクト
 if (!query.month) {
  return <Redirector redirectPath={HREF(`/sanshoTourist/schedule`, { month: defaultYearMonth }, query)} />
 }

 // 年月の妥当性チェック
 const firstDayOfMonth = parseYearMonthFromQuery(query.month)
 if (!firstDayOfMonth) {
  return <Redirector redirectPath={HREF(`/sanshoTourist/schedule`, { month: defaultYearMonth }, query)} />
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
    canEdit={canEdit}
    isSystemAdmin={isSystemAdmin}
    publishEndDate={publishSetting?.publishEndDate ?? null}
   />
  </div>
 )
}
