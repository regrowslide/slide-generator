import InvoiceViewer from '@app/(apps)/tbm/(components)/InvoiceViewer'
import MeisaiViewer from '@app/(apps)/tbm/(components)/MeisaiViewer'
import CustomerSelector from '@app/(apps)/tbm/(components)/CustomerSelector'
import { getInvoiceData } from '@app/(apps)/tbm/(server-actions)/getInvoiceData'
import { getMeisaiData } from '@app/(apps)/tbm/(server-actions)/getMeisaiData'
import { FitMargin } from '@cm/components/styles/common-components/common-components'
import NewDateSwitcher from '@cm/components/utils/dates/DateSwitcher/NewDateSwitcher'
import Redirector from '@cm/components/utils/Redirector'
import { dateSwitcherTemplate } from '@cm/lib/methods/redirect-method'
import { initServerComopnent } from 'src/non-common/serverSideFunction'
import prisma from 'src/lib/prisma'
import { BillingHandler } from '@app/(apps)/tbm/(class)/TimeHandler'
import { Days } from '@cm/class/Days/Days'
import { toUtc } from '@cm/class/Days/date-utils/calculations'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { getDriveScheduleList } from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoMeisaiData'
import BasicTabs from '@cm/components/utils/tabs/BasicTabs'

export default async function Page(props) {
  const query = await props.searchParams
  const { session, scopes } = await initServerComopnent({ query })

  const { redirectPath, whereQuery } = await dateSwitcherTemplate({ query })





  if (redirectPath) return <Redirector {...{ redirectPath }} />

  // 顧客IDをクエリパラメータから取得（必須）
  const customerId = query.customerId ? parseInt(query.customerId) : undefined

  // 顧客一覧を取得（便設定経由で関連する顧客を取得）
  const customersFromRoutes = await prisma.mid_TbmRouteGroup_TbmCustomer.findMany({
    where: {},
    select: {
      TbmCustomer: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
    distinct: ['tbmCustomerId'],


  })



  // 重複を除去して顧客リストを作成
  const customers = customersFromRoutes
    .map(item => item.TbmCustomer)
    .filter(customer => customer.name) // nameが存在するもののみ
    .sort((a, b) => a.name.localeCompare(b.name))

  // 運行スケジュールデータを1回だけ取得（全顧客・請求書・明細で再利用）
  let driveScheduleList: Awaited<ReturnType<typeof getDriveScheduleList>> | null = null
  if (whereQuery?.gte && whereQuery?.lte) {

    whereQuery.gte = whereQuery.gte ? Days.day.subtract(whereQuery.gte, 1) : undefined

    console.log(whereQuery)  //logs

    driveScheduleList = await getDriveScheduleList({
      firstDayOfMonth: whereQuery.gte,
      whereQuery,
      tbmBaseId: undefined,
      userId: undefined,
    })
  }



  if (!whereQuery?.gte) return
  const firstDayOfMonth = toUtc(new Date(whereQuery.gte.getFullYear(), whereQuery.gte.getMonth() + 1, 1))



  // 取引件数を計算（選択中の月の承認済み運行スケジュール数）
  // メモリ内でフィルタリングして計算
  const getTransactionCount = (customerId: number, scheduleList: typeof driveScheduleList): number => {
    if (!scheduleList || !whereQuery?.gte || !whereQuery?.lte) return 0

    try {

      const filteredSchedules = scheduleList.filter(schedule => {
        const matchesCustomer = schedule.TbmRouteGroup.Mid_TbmRouteGroup_TbmCustomer?.TbmCustomer?.id === customerId

        if (schedule.TbmRouteGroup.name === '下3  土・日曜運行') {
          console.log({ date: schedule.date })  //logs
        }



        if (!matchesCustomer) return false



        const billingMonth = BillingHandler.getBillingMonth(
          firstDayOfMonth,
          schedule.date,
          schedule.TbmRouteGroup.departureTime,
          schedule
        )



        return formatDate(billingMonth, 'YYYYMM') === formatDate(firstDayOfMonth, 'YYYYMM')
        const isBelongsToMonth = !firstDayOfMonth || BillingHandler.belongsToMonth(
          schedule.date,
          schedule.TbmRouteGroup.departureTime,
          schedule.TbmRouteGroup.id,
          firstDayOfMonth
        )
        return isBelongsToMonth
      })








      return filteredSchedules.length
    } catch {
      return 0
    }
  }

  // 各顧客の取引件数を取得（メモリ内で計算）
  const customersWithCount = customers.map(customer => ({
    ...customer,
    transactionCount: getTransactionCount(customer.id, driveScheduleList),
  }))

  // 顧客データが存在しない場合の処理
  if (customers.length === 0) {
    return (
      <FitMargin className="pt-4">
        <div className="mb-4">
          <NewDateSwitcher monthOnly={true} />
        </div>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-yellow-800 font-semibold">顧客データが見つかりません</h3>
          <p className="text-yellow-600 mt-2">
            この営業所に紐づく顧客データが登録されていません。営業所設定で顧客マスタを登録してください。
          </p>
        </div>
      </FitMargin>
    )
  }

  // 顧客が選択されていない場合は選択画面を表示
  if (!customerId) {
    return (
      <FitMargin className="pt-4">
        <div className="mb-4">
          <NewDateSwitcher monthOnly={true} />
        </div>
        <CustomerSelector customers={customersWithCount as any} currentCustomerId={customerId} />
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-blue-800 font-semibold">顧客を選択してください</h3>
          <p className="text-blue-600 mt-2">請求書を作成する顧客を上記のドロップダウンから選択してください。</p>
        </div>
      </FitMargin>
    )
  }

  // whereQueryの型安全性を確保
  if (!whereQuery?.gte || !whereQuery?.lte) {
    throw new Error('日付の設定が不正です')
  }

  // driveScheduleListが取得できていない場合はエラー
  if (!driveScheduleList) {
    throw new Error('運行スケジュールデータの取得に失敗しました')
  }


  // 取得済みのdriveScheduleListを再利用
  const invoiceData = await getInvoiceData({
    whereQuery: { gte: whereQuery.gte, lte: whereQuery.lte },
    customerId,
    driveScheduleList,
  })



  const meisaiData = await getMeisaiData({
    whereQuery: { gte: whereQuery.gte, lte: whereQuery.lte },
    customerId,
    driveScheduleList,
  })




  return (
    <FitMargin className="pt-4">
      <div className="mb-4">
        <NewDateSwitcher monthOnly={true} />
      </div>

      <CustomerSelector customers={customersWithCount as any} currentCustomerId={customerId} />

      <BasicTabs
        id="seikyuTabs"
        showAll={false}
        TabComponentArray={[
          {
            label: '請求書',
            component: (
              <InvoiceViewer
                key={`invoice-${customerId}-${whereQuery.gte?.getTime()}`}
                invoiceData={invoiceData}
                customerId={customerId}
              />
            ),
          },
          {
            label: '請求書用明細',
            component: <MeisaiViewer key={`meisai-${customerId}-${whereQuery.gte?.getTime()}`} meisaiData={meisaiData} />,
          },
        ]}
      />
    </FitMargin>
  )

}
