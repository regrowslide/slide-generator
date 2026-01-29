import { Suspense } from 'react'
import { MenuMasterClient } from './MenuMasterClient'
import { getDailyMenus } from '../../../_actions/daily-menu-actions'

export default async function MenuMasterPage() {
  // 直近30日分の献立を取得
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const menus = await getDailyMenus({
    where: {
      menuDate: { gte: thirtyDaysAgo },
    },
    orderBy: { menuDate: 'desc' },
    take: 30,
  })

  return (
    <Suspense fallback={<div className="animate-pulse">読み込み中...</div>}>
      <MenuMasterClient initialMenus={menus} />
    </Suspense>
  )
}
