'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Factory, Search, AlertTriangle, ChefHat } from 'lucide-react'
import { Button } from '@cm/components/styles/common-components/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shadcn/ui/select'
import type { ProductionMealData } from '../../_actions/production-actions'

type Props = {
  productionData: ProductionMealData[]
  currentFilter: {
    year: number
    month: number
    day: number
  }
}

export const ProductionClient = ({ productionData, currentFilter }: Props) => {
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
        <h2 className="text-2xl font-bold text-slate-800">製造指示</h2>
        <p className="text-slate-500 text-sm">料理別の製造計画・必要食材</p>
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

      {/* 献立データなし */}
      {productionData.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-400">この日の献立データはありません</p>
            <p className="text-slate-400 text-sm mt-2">
              献立CSVを取り込んでください
            </p>
          </CardContent>
        </Card>
      ) : (
        // 食事区分ごとのセクション
        productionData.map((meal) => (
          <div key={meal.mealType} className="space-y-4">
            {/* 食事区分ヘッダー */}
            <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
              <Factory className="w-5 h-5 text-slate-400" />
              {meal.mealTypeName}
            </h3>

            {/* 料理カード */}
            {meal.dishes.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-slate-400 text-sm">料理データなし</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {meal.dishes.map((dish) => (
                  <Card key={dish.dishId} className="overflow-hidden">
                    {/* 料理ヘッダー */}
                    <CardHeader className="pb-3 border-b bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            <ChefHat className="w-5 h-5 text-orange-500" />
                            {dish.dishName}
                          </CardTitle>
                          {dish.dishName !== dish.menuName && (
                            <p className="text-xs text-slate-400 mt-1 ml-7">
                              {dish.menuName}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-500">総製造量</div>
                          <div className="text-xl font-bold text-slate-800">
                            {dish.totalServings}
                            <span className="text-sm font-normal text-slate-400 ml-1">
                              食
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 左: 形態別 加工指示 */}
                        <div>
                          <div className="text-xs text-slate-500 mb-2 font-medium">
                            形態別 加工指示
                          </div>
                          {dish.dietBreakdown.length === 0 ? (
                            <p className="text-xs text-slate-400">
                              受注データなし（0食）
                            </p>
                          ) : (
                            <div className="space-y-1">
                              {dish.dietBreakdown.map((diet) => (
                                <div
                                  key={diet.dietTypeId}
                                  className="flex items-center justify-between px-3 py-2 rounded bg-amber-50 border border-amber-100"
                                >
                                  <span className="font-medium text-sm text-amber-900">
                                    {diet.dietTypeName}
                                  </span>
                                  <span className="font-bold text-sm text-slate-700">
                                    {diet.servings}
                                    <span className="text-xs font-normal text-slate-400 ml-1">
                                      食
                                    </span>
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* 右: 必要食材（総量） */}
                        <div>
                          <div className="text-xs text-slate-500 mb-2 font-medium">
                            必要食材（総量）
                          </div>
                          {dish.ingredients.length === 0 ? (
                            <p className="text-xs text-slate-400">
                              食材データなし
                            </p>
                          ) : (
                            <div className="space-y-1">
                              {dish.ingredients.map((ing) => (
                                <div
                                  key={ing.code}
                                  className="flex items-center justify-between px-3 py-1.5"
                                >
                                  <span className="text-sm text-slate-700">
                                    {ing.name}
                                  </span>
                                  <span className="font-bold text-sm text-slate-800">
                                    {ing.totalAmount % 1 === 0
                                      ? ing.totalAmount.toLocaleString()
                                      : ing.totalAmount.toLocaleString(
                                          undefined,
                                          { maximumFractionDigits: 1 }
                                        )}
                                    <span className="text-xs font-normal text-slate-400 ml-1">
                                      {ing.unit}
                                    </span>
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
