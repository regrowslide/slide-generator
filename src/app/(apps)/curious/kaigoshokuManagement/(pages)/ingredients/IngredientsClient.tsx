'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, AlertTriangle, ShoppingCart } from 'lucide-react'
import { Button } from '@cm/components/styles/common-components/Button'
import { Card, CardContent } from '@shadcn/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shadcn/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shadcn/ui/select'
import type { IngredientSummaryItem } from '../../_actions/production-actions'

type Props = {
  ingredients: IngredientSummaryItem[]
  currentFilter: {
    year: number
    month: number
    day: number
  }
}

export const IngredientsClient = ({ ingredients, currentFilter }: Props) => {
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

  // 数値フォーマット
  const formatAmount = (amount: number) => {
    if (amount % 1 === 0) return amount.toLocaleString()
    return amount.toLocaleString(undefined, { maximumFractionDigits: 1 })
  }

  return (
    <div className="space-y-6">
      {/* ヘッダーエリア */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">原材料発注</h2>
        <p className="text-slate-500 text-sm">
          当日の献立・受注から材料別に必要量を集計
        </p>
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

      {/* サマリー */}
      {ingredients.length > 0 && (
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <ShoppingCart className="w-4 h-4" />
          <span>
            {currentFilter.year}年{currentFilter.month}月{currentFilter.day}日 :{' '}
            <strong className="text-slate-800">{ingredients.length}</strong> 種類の食材
          </span>
        </div>
      )}

      {/* データなし */}
      {ingredients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-400">
              この日の献立データまたは受注データがありません
            </p>
            <p className="text-slate-400 text-sm mt-2">
              献立CSVと受注CSVを取り込んでください
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>食材コード</TableHead>
                  <TableHead>食材名</TableHead>
                  <TableHead className="text-right">必要量</TableHead>
                  <TableHead>単位</TableHead>
                  <TableHead>使用料理</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingredients.map((ing) => (
                  <TableRow key={ing.code}>
                    <TableCell className="font-mono text-xs text-slate-500">
                      {ing.code}
                    </TableCell>
                    <TableCell className="font-medium">{ing.name}</TableCell>
                    <TableCell className="text-right font-bold">
                      {formatAmount(ing.totalAmount)}
                    </TableCell>
                    <TableCell className="text-slate-500">{ing.unit}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {ing.usedIn.map((u, i) => (
                          <span
                            key={i}
                            className="inline-block text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                          >
                            {u.mealTypeName}/{u.dishName}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
