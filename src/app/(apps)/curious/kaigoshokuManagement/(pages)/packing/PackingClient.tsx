'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Package, Building2, Search, UtensilsCrossed } from 'lucide-react'
import { Button } from '@cm/components/styles/common-components/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/ui/card'
import { Badge } from '@shadcn/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shadcn/ui/select'
import type { PackingFacilityData } from '../../_actions/production-actions'

type Props = {
  packingData: PackingFacilityData[]
  currentFilter: {
    year: number
    month: number
    day: number
  }
}

export const PackingClient = ({ packingData, currentFilter }: Props) => {
  const router = useRouter()

  // フィルター状態
  const [year, setYear] = useState(currentFilter.year)
  const [month, setMonth] = useState(currentFilter.month)
  const [day, setDay] = useState(currentFilter.day)

  // 年リスト（現在年 ± 1年）
  const currentYear = new Date().getFullYear()
  const years = [currentYear + 1, currentYear, currentYear - 1]

  // 日リスト（1〜31）
  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  // フィルター適用
  const applyFilter = useCallback(() => {
    const params = new URLSearchParams()
    params.set('year', year.toString())
    params.set('month', month.toString())
    params.set('day', day.toString())
    router.push(`?${params.toString()}`)
  }, [year, month, day, router])

  return (
    <div className="space-y-6">
      {/* ヘッダーエリア */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">梱包・配送</h2>
        <p className="text-slate-500 text-sm">施設別の梱包準備・配送管理</p>
      </div>

      {/* フィルターエリア */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex items-center gap-2">
              <Select
                value={year.toString()}
                onValueChange={(v) => setYear(parseInt(v))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}年
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={month.toString()}
                onValueChange={(v) => setMonth(parseInt(v))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={m.toString()}>
                      {m}月
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={day.toString()}
                onValueChange={(v) => setDay(parseInt(v))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {days.map((d) => (
                    <SelectItem key={d} value={d.toString()}>
                      {d}日
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={applyFilter}>
              <Search className="w-4 h-4 mr-2" />
              検索
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* データなし */}
      {packingData.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-400">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>この日の配送予定はありません</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {packingData.map((facility) => (
            <Card key={facility.facilityId ?? 'none'} className="overflow-hidden">
              {/* 施設ヘッダー */}
              <CardHeader className="pb-3 border-b bg-slate-50/50">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-slate-400" />
                    {facility.facilityName}
                  </span>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">合計</div>
                    <div className="text-xl font-bold text-slate-800">
                      {facility.grandTotal}
                      <span className="text-sm font-normal text-slate-400 ml-1">
                        食
                      </span>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-4">
                <div className="space-y-5">
                  {facility.meals.map((meal) => (
                    <div key={meal.mealType}>
                      {/* 食事区分ヘッダー */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-slate-700">
                          {meal.mealTypeName}
                        </span>
                        <Badge className="bg-slate-100 text-slate-600">
                          {meal.totalQuantity}食
                        </Badge>
                      </div>

                      {/* 料理 × 形態別食数 */}
                      <div className="space-y-3">
                        {meal.dishes.map((dish, i) => (
                          <div key={i}>
                            <div className="flex items-center gap-1.5 mb-1">
                              <UtensilsCrossed className="w-3.5 h-3.5 text-orange-500" />
                              <span className="text-sm font-medium text-slate-700">
                                {dish.dishName}
                              </span>
                            </div>
                            <div className="space-y-1 ml-5">
                              {dish.dietBreakdown.map((diet) => (
                                <div
                                  key={diet.dietTypeId}
                                  className="flex items-center justify-between px-3 py-1 rounded bg-amber-50 border border-amber-100"
                                >
                                  <span className="text-xs text-amber-900">
                                    {diet.dietTypeName}
                                  </span>
                                  <span className="font-bold text-sm text-slate-700">
                                    {diet.quantity}
                                    <span className="text-xs font-normal text-slate-400 ml-1">
                                      食
                                    </span>
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
