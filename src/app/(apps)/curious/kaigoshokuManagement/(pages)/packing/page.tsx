import { Suspense } from 'react'
import { PackingClient } from './PackingClient'
import { getOrders } from '../../_actions/order-actions'
import { getFacilities } from '../../_actions/facility-actions'

export default async function PackingPage() {
  // 今日以降の確認済み・製造中の受注を取得
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [orders, facilities] = await Promise.all([
    getOrders({
      where: {
        deliveryDate: { gte: today },
        status: { in: ['confirmed', 'processing'] },
      },
      orderBy: { deliveryDate: 'asc' },
      take: 50,
    }),
    getFacilities(),
  ])

  return (
    <Suspense fallback={<div className="animate-pulse">読み込み中...</div>}>
      <PackingClient initialOrders={orders} facilities={facilities} />
    </Suspense>
  )
}
