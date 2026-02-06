import {
 fetchEigyoshoHikakuData,
 CustomerSalesRecord,
 EigyoshoHikakuData,
} from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchEigyoshoHikakuData'

import { C_Stack, FitMargin } from '@cm/components/styles/common-components/common-components'
import NewDateSwitcher from '@cm/components/utils/dates/DateSwitcher/NewDateSwitcher'
import Redirector from '@cm/components/utils/Redirector'
import { dateSwitcherTemplate } from '@cm/lib/methods/redirect-method'
import { Card } from '@cm/shadcn/ui/card'
import { NumHandler } from '@cm/class/NumHandler'
import { cn } from '@cm/shadcn/lib/utils'
import AutoGridContainer from '@cm/components/utils/AutoGridContainer'

import { initServerComopnent } from 'src/non-common/serverSideFunction'

export default async function Page(props) {
 const query = await props.searchParams
 const { session, scopes } = await initServerComopnent({ query })
 const { redirectPath, whereQuery } = await dateSwitcherTemplate({ query })

 if (redirectPath) return <Redirector {...{ redirectPath }} />

 const eigyoshoHikakuDataList = await fetchEigyoshoHikakuData({
  firstDayOfMonth: whereQuery.gte,
  whereQuery,
 })

 return (
  <FitMargin className={`p-4`}>
   <C_Stack>
    <div>
     <NewDateSwitcher {...{ monthOnly: true }} />
     <div className="mb-2 text-xs text-gray-600">
      <ul className="list-disc pl-4">
       <li>
        <b>営業所ごとの売上比較：</b>荷主ごとの請求額（通行料 + 運賃）を営業所別に表示
       </li>
      </ul>
     </div>
    </div>

    <AutoGridContainer
     className={cn(
      'border p-2 w-full items-start overflow-x-auto max-w-[95vw] mx-auto h-[85vh] divide-x-2'
     )}
    >
     {eigyoshoHikakuDataList.map((data) => (
      <EigyoshoCard key={data.tbmBase.id} data={data} />
     ))}
    </AutoGridContainer>
   </C_Stack>
  </FitMargin>
 )
}

function EigyoshoCard({ data }: { data: EigyoshoHikakuData }) {
 const { tbmBase, customerSalesRecords, grandTotal } = data

 const tableClassName = cn(
  '[&_th]:!text-[11px]',
  '[&_td]:!text-[11px]',
  '[&_td]:!p-1',
  '[&_td]:!px-1.5',
  '[&_th]:!p-1',
  '[&_th]:!px-1.5',
  'min-w-[400px]'
 )

 return (
  <div className={`px-4`}>
   <h2 className={`mb-4 text-lg font-bold bg-primary-main text-white text-center py-1`}>
    {tbmBase.name}
   </h2>
   {tbmBase.code && <p className={`mb-2 text-sm text-gray-500`}>コード: {tbmBase.code}</p>}

   <Card className="p-0">
    <div className={cn('overflow-auto max-h-[70vh]', tableClassName)}>
     <table className="w-full border-collapse">
      <thead className="sticky top-0 bg-gray-100 z-10">
       <tr className="border-b border-gray-300">
        <th className="text-left font-semibold py-2 px-2">コード</th>
        <th className="text-left font-semibold py-2 px-2">荷主名</th>
        <th className="text-right font-semibold py-2 px-2">通行料（郵便）</th>
        <th className="text-right font-semibold py-2 px-2">通行料（一般）</th>
        <th className="text-right font-semibold py-2 px-2">運賃</th>
        <th className="text-right font-semibold py-2 px-2">小計（税抜）</th>
        <th className="text-right font-semibold py-2 px-2">消費税</th>
        <th className="text-right font-semibold py-2 px-2 bg-blue-50">請求額合計（税込）</th>
       </tr>
      </thead>
      <tbody>
       {customerSalesRecords.length === 0 ? (
        <tr>
         <td colSpan={8} className="text-center py-4 text-gray-500">
          データがありません
         </td>
        </tr>
       ) : (
        customerSalesRecords.map((record, idx) => (
         <SalesRow key={record.customer?.id ?? idx} record={record} />
        ))
       )}
      </tbody>
      <tfoot className="sticky bottom-0 bg-gray-200 font-bold z-10">
       <tr className="border-t-2 border-gray-400">
        <td colSpan={2} className="py-2 px-2 text-center">
         合計
        </td>
        <td className="text-right py-2 px-2">{NumHandler.toPrice(grandTotal.postalFee)}</td>
        <td className="text-right py-2 px-2">{NumHandler.toPrice(grandTotal.generalFee)}</td>
        <td className="text-right py-2 px-2">{NumHandler.toPrice(grandTotal.driverFee)}</td>
        <td className="text-right py-2 px-2">{NumHandler.toPrice(grandTotal.totalExclTax)}</td>
        <td className="text-right py-2 px-2">{NumHandler.toPrice(grandTotal.taxAmount)}</td>
        <td className="text-right py-2 px-2 bg-blue-100">{NumHandler.toPrice(grandTotal.grandTotal)}</td>
       </tr>
      </tfoot>
     </table>
    </div>
   </Card>

   {/* 総合計サマリー */}
   <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
    <div className="grid grid-cols-2 gap-2 text-sm">
     <div className="text-gray-600">荷主数:</div>
     <div className="text-right font-semibold">{customerSalesRecords.length}社</div>
     <div className="text-gray-600">総売上:</div>
     <div className="text-right font-bold text-blue-600">
      ¥{NumHandler.toPrice(grandTotal.grandTotal)}
     </div>
    </div>
   </div>
  </div>
 )
}

function SalesRow({ record }: { record: CustomerSalesRecord }) {
 const { keyValue } = record

 return (
  <tr className="border-b border-gray-200 hover:bg-gray-50">
   <td className="py-1 px-2">{keyValue.code.cellValue as string}</td>
   <td className="py-1 px-2">{keyValue.customerName.cellValue as string}</td>
   <td className="text-right py-1 px-2">{NumHandler.toPrice(Number(keyValue.postalFee.cellValue) || 0)}</td>
   <td className="text-right py-1 px-2">{NumHandler.toPrice(Number(keyValue.generalFee.cellValue) || 0)}</td>
   <td className="text-right py-1 px-2">{NumHandler.toPrice(Number(keyValue.driverFee.cellValue) || 0)}</td>
   <td className="text-right py-1 px-2">{NumHandler.toPrice(Number(keyValue.totalExclTax.cellValue) || 0)}</td>
   <td className="text-right py-1 px-2">{NumHandler.toPrice(Number(keyValue.taxAmount.cellValue) || 0)}</td>
   <td className="text-right py-1 px-2 bg-blue-50 font-medium">
    {NumHandler.toPrice(Number(keyValue.grandTotal.cellValue) || 0)}
   </td>
  </tr>
 )
}

