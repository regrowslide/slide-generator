import { Suspense } from 'react'
import { ProductionClient } from './ProductionClient'
import { calculateProductionData } from '../../_actions/production-actions'

type Props = {
  searchParams: Promise<{
    year?: string
    month?: string
    day?: string
  }>
}

export default async function ProductionPage(props: Props) {
  const query = await props.searchParams

  const now = new Date()
  const year = query.year ? parseInt(query.year) : now.getFullYear()
  const month = query.month ? parseInt(query.month) : now.getMonth() + 1
  const day = query.day ? parseInt(query.day) : now.getDate()

  // 指定日の製造データを献立×受注から動的に計算
  const targetDate = new Date(year, month - 1, day)
  const productionData = await calculateProductionData(targetDate)

  return (
    <Suspense fallback={<div className="animate-pulse">読み込み中...</div>}>
      <ProductionClient
        productionData={productionData}
        currentFilter={{ year, month, day }}
      />
    </Suspense>
  )
}
