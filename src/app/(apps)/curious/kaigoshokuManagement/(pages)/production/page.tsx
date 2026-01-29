import { Suspense } from 'react'
import { ProductionClient } from './ProductionClient'
import { getProductionBatches } from '../../_actions/production-actions'

export default async function ProductionPage() {
  // 今日以降の製造バッチを取得
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const batches = await getProductionBatches({
    where: {
      productionDate: { gte: today },
    },
    orderBy: { productionDate: 'asc' },
    take: 20,
  })

  return (
    <Suspense fallback={<div className="animate-pulse">読み込み中...</div>}>
      <ProductionClient initialBatches={batches} />
    </Suspense>
  )
}
