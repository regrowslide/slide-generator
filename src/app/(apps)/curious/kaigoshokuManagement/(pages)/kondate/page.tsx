import { Suspense } from 'react'
import { KondateClient } from './KondateClient'
import { getKondateList, getAvailableYearMonths } from '../../_actions/kondate-actions'

type Props = {
  searchParams: Promise<{
    year?: string
    month?: string
    day?: string
    mealType?: string
    recipeName?: string
  }>
}

export default async function KondatePage(props: Props) {
  const query = await props.searchParams

  // デフォルトは今月
  const now = new Date()
  const year = query.year ? parseInt(query.year) : now.getFullYear()
  const month = query.month ? parseInt(query.month) : now.getMonth() + 1
  const day = query.day ? parseInt(query.day) : undefined
  const mealType = query.mealType || undefined
  const recipeName = query.recipeName || undefined

  const [kondateList, availableYearMonths] = await Promise.all([
    getKondateList({ year, month, day, mealType, recipeName }),
    getAvailableYearMonths(),
  ])

  return (
    <Suspense fallback={<div className="animate-pulse">読み込み中...</div>}>
      <KondateClient
        initialData={kondateList}
        availableYearMonths={availableYearMonths}
        currentFilter={{ year, month, day, mealType, recipeName }}
      />
    </Suspense>
  )
}
