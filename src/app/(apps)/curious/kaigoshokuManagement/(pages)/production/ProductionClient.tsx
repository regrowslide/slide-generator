'use client'

import { useState, useCallback } from 'react'
import { Factory, RefreshCw, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { Button } from '@shadcn/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/ui/card'
import { Badge } from '@shadcn/ui/badge'
import { Progress } from '@shadcn/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@shadcn/ui/tabs'
import {
  getProductionBatches,
  generateProductionBatchFromOrders,
  updateProductionBatchStatus,
  updateProductionItemCompleted,
} from '../../_actions/production-actions'
import { MEAL_TYPES, PRODUCTION_STATUS, type ProductionStatusCode } from '../../lib/constants'
import type { KgProductionBatchWithRelations } from '../../types'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

type Props = {
  initialBatches: KgProductionBatchWithRelations[]
}

export const ProductionClient = ({ initialBatches }: Props) => {
  const { toggleLoad } = useGlobal()
  const [batches, setBatches] = useState(initialBatches)
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )

  // 日付でフィルタリング
  const filteredBatches = batches.filter((batch) => {
    const batchDate = new Date(batch.productionDate).toISOString().split('T')[0]
    return batchDate === selectedDate
  })

  // 製造バッチ生成
  const handleGenerateBatch = useCallback(
    async (mealType: string) => {
      toggleLoad(async () => {
        const date = new Date(selectedDate)
        const batch = await generateProductionBatchFromOrders(date, mealType)

        // 既存のバッチを更新または追加
        setBatches((prev) => {
          const index = prev.findIndex((b) => b.id === batch.id)
          if (index >= 0) {
            const updated = [...prev]
            updated[index] = batch
            return updated
          }
          return [...prev, batch]
        })

        window.alert('製造バッチを生成しました')
      })
    },
    [selectedDate, toggleLoad]
  )

  // ステータス更新
  const handleStatusUpdate = useCallback(
    async (batchId: number, status: string) => {
      toggleLoad(async () => {
        await updateProductionBatchStatus(batchId, status)
        setBatches((prev) =>
          prev.map((batch) => (batch.id === batchId ? { ...batch, status } : batch))
        )
      })
    },
    [toggleLoad]
  )

  // 完了数更新
  const handleCompletedUpdate = useCallback(
    async (itemId: number, completedQuantity: number) => {
      toggleLoad(async () => {
        await updateProductionItemCompleted(itemId, completedQuantity)
        // 再取得
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const newBatches = await getProductionBatches({
          where: { productionDate: { gte: today } },
          orderBy: { productionDate: 'asc' },
          take: 20,
        })
        setBatches(newBatches)
      })
    },
    [toggleLoad]
  )

  // ステータスバッジ
  const StatusBadge = ({ status }: { status: string }) => {
    const statusInfo = PRODUCTION_STATUS[status as ProductionStatusCode] ?? PRODUCTION_STATUS.planned
    return (
      <Badge className={statusInfo.colorClass}>
        {status === 'planned' && <Clock className="w-3 h-3 mr-1" />}
        {status === 'in_progress' && <RefreshCw className="w-3 h-3 mr-1" />}
        {status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
        {statusInfo.name}
      </Badge>
    )
  }

  // 日付リスト（今日から7日間）
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return date.toISOString().split('T')[0]
  })

  return (
    <div className="space-y-6">
      {/* ヘッダーエリア */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">製造指示</h2>
          <p className="text-slate-500 text-sm">製造計画の作成・進捗管理</p>
        </div>
      </div>

      {/* 日付選択タブ */}
      <Tabs value={selectedDate} onValueChange={setSelectedDate}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          {dateOptions.map((date) => {
            const d = new Date(date)
            const isToday = date === new Date().toISOString().split('T')[0]
            const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]
            const batchCount = batches.filter(
              (b) => new Date(b.productionDate).toISOString().split('T')[0] === date
            ).length

            return (
              <TabsTrigger
                key={date}
                value={date}
                className="relative flex flex-col items-center px-4 py-2"
              >
                <span className="text-xs text-slate-500">
                  {d.getMonth() + 1}/{d.getDate()}({dayOfWeek})
                </span>
                <span className={`text-sm font-medium ${isToday ? 'text-emerald-600' : ''}`}>
                  {isToday ? '今日' : `${d.getDate()}日`}
                </span>
                {batchCount > 0 && (
                  <Badge color="gray" className="absolute -top-1 -right-1 h-5 px-1.5">
                    {batchCount}
                  </Badge>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

      {/* 食事区分ごとの製造バッチ */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(['breakfast', 'lunch', 'dinner'] as const).map((mealType) => {
          const batch = filteredBatches.find((b) => b.mealType === mealType)
          const mealInfo = MEAL_TYPES[mealType]

          return (
            <Card key={mealType}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Factory className="w-5 h-5 text-slate-400" />
                    {mealInfo.name}
                  </span>
                  {batch && <StatusBadge status={batch.status} />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!batch ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-400 text-sm mb-4">製造バッチなし</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleGenerateBatch(mealType)}
                    >
                      受注から生成
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* 製造品目 */}
                    {batch.KgProductionItem.length === 0 ? (
                      <p className="text-slate-400 text-sm">製造品目なし</p>
                    ) : (
                      <div className="space-y-3">
                        {batch.KgProductionItem.map((item) => {
                          const progress =
                            item.totalQuantity > 0
                              ? (item.completedQuantity / item.totalQuantity) * 100
                              : 0

                          return (
                            <div key={item.id} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium truncate">
                                  {item.KgMenuRecipe.name}
                                </span>
                                <Badge color="blue" className="ml-2 shrink-0">
                                  {item.KgDietTypeMaster.name}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <Progress value={progress} className="flex-1 h-2" />
                                <span className="text-xs text-slate-500 w-16 text-right">
                                  {item.completedQuantity}/{item.totalQuantity}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* アクションボタン */}
                    <div className="flex items-center gap-2 pt-2">
                      {batch.status === 'planned' && (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleStatusUpdate(batch.id, 'in_progress')}
                        >
                          製造開始
                        </Button>
                      )}
                      {batch.status === 'in_progress' && (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleStatusUpdate(batch.id, 'completed')}
                        >
                          製造完了
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGenerateBatch(mealType)}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 必要食材一覧 */}
      {filteredBatches.some((b) => b.KgRequiredIngredient.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>必要食材一覧</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {filteredBatches
                .flatMap((b) => b.KgRequiredIngredient)
                .reduce(
                  (acc, ing) => {
                    const existing = acc.find((a) => a.ingredientCode === ing.ingredientCode)
                    if (existing) {
                      existing.totalAmount += ing.totalAmount
                    } else {
                      acc.push({
                        ingredientCode: ing.ingredientCode,
                        ingredientName: ing.ingredientName,
                        totalAmount: ing.totalAmount,
                        unit: ing.unit,
                      })
                    }
                    return acc
                  },
                  [] as { ingredientCode: string; ingredientName: string; totalAmount: number; unit: string }[]
                )
                .map((ing) => (
                  <div
                    key={ing.ingredientCode}
                    className="flex items-center justify-between p-2 bg-slate-50 rounded"
                  >
                    <span className="text-sm">{ing.ingredientName}</span>
                    <span className="text-sm font-medium">
                      {ing.totalAmount.toFixed(1)}
                      {ing.unit}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
