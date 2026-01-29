'use client'

import { useState, useCallback } from 'react'
import { Package, Truck, CheckCircle, Building2 } from 'lucide-react'
import { Button } from '@shadcn/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/ui/card'
import { Badge } from '@shadcn/ui/badge'
import { Checkbox } from '@shadcn/ui/checkbox'
import { Tabs, TabsList, TabsTrigger } from '@shadcn/ui/tabs'
import { updateOrderStatus } from '../../_actions/order-actions'
import { MEAL_TYPES, DIET_TYPES, type MealTypeCode } from '../../lib/constants'
import type { KgOrderWithRelations, KgFacilityMaster } from '../../types'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

type Props = {
  initialOrders: KgOrderWithRelations[]
  facilities: KgFacilityMaster[]
}

export const PackingClient = ({ initialOrders, facilities }: Props) => {
  const { toggleLoad } = useGlobal()
  const [orders, setOrders] = useState(initialOrders)
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())

  // 日付でフィルタリング
  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.deliveryDate).toISOString().split('T')[0]
    return orderDate === selectedDate
  })

  // 施設ごとにグループ化
  const ordersByFacility = filteredOrders.reduce(
    (acc, order) => {
      const facilityId = order.facilityId ?? 0
      if (!acc[facilityId]) {
        acc[facilityId] = []
      }
      acc[facilityId].push(order)
      return acc
    },
    {} as Record<number, KgOrderWithRelations[]>
  )

  // チェック切り替え
  const handleCheckToggle = useCallback((key: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }, [])

  // 配送完了
  const handleComplete = useCallback(
    async (orderId: number) => {
      toggleLoad(async () => {
        await updateOrderStatus(orderId, 'completed')
        setOrders((prev) =>
          prev.map((order) => (order.id === orderId ? { ...order, status: 'completed' } : order))
        )
      })
    },
    [toggleLoad]
  )

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
          <h2 className="text-2xl font-bold text-slate-800">梱包・配送</h2>
          <p className="text-slate-500 text-sm">施設別の梱包準備・配送管理</p>
        </div>
      </div>

      {/* 日付選択タブ */}
      <Tabs value={selectedDate} onValueChange={setSelectedDate}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          {dateOptions.map((date) => {
            const d = new Date(date)
            const isToday = date === new Date().toISOString().split('T')[0]
            const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]

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
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

      {/* 施設ごとの梱包リスト */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-400">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>この日の配送予定はありません</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {Object.entries(ordersByFacility).map(([facilityIdStr, facilityOrders]) => {
            const facilityId = parseInt(facilityIdStr)
            const facility = facilities.find((f) => f.id === facilityId)
            const allItems = facilityOrders.flatMap((order) =>
              order.KgOrderLine.map((line) => ({
                orderId: order.id,
                lineId: line.id,
                mealType: line.mealType as MealTypeCode,
                dietTypeId: line.dietTypeId,
                quantity: line.quantity,
              }))
            )

            const totalByMeal = (['breakfast', 'lunch', 'dinner'] as const).map((mealType) => ({
              mealType,
              total: allItems
                .filter((item) => item.mealType === mealType)
                .reduce((sum, item) => sum + item.quantity, 0),
            }))

            const isAllChecked = allItems.every((item) =>
              checkedItems.has(`${item.orderId}-${item.lineId}`)
            )

            return (
              <Card key={facilityId}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-slate-400" />
                      {facility?.name ?? '未登録施設'}
                    </span>
                    {isAllChecked && (
                      <Badge className="bg-emerald-100 text-emerald-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        準備完了
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* 食事区分ごとの数量 */}
                    <div className="grid grid-cols-3 gap-2">
                      {totalByMeal.map(({ mealType, total }) => (
                        <div
                          key={mealType}
                          className="text-center p-2 bg-slate-50 rounded"
                        >
                          <div className="text-xs text-slate-500">
                            {MEAL_TYPES[mealType].name}
                          </div>
                          <div className="text-lg font-bold">
                            {total}
                            <span className="text-xs font-normal text-slate-400 ml-1">
                              食
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 詳細チェックリスト */}
                    <div className="space-y-2">
                      {allItems.map((item) => {
                        const key = `${item.orderId}-${item.lineId}`
                        const dietType = Object.values(DIET_TYPES).find(
                          (dt) => dt.code === Object.keys(DIET_TYPES).find(
                            (k) => item.dietTypeId === item.dietTypeId
                          )
                        )

                        return (
                          <div
                            key={key}
                            className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded"
                          >
                            <Checkbox
                              id={key}
                              checked={checkedItems.has(key)}
                              onCheckedChange={() => handleCheckToggle(key)}
                            />
                            <label
                              htmlFor={key}
                              className={`flex-1 text-sm cursor-pointer ${
                                checkedItems.has(key) ? 'line-through text-slate-400' : ''
                              }`}
                            >
                              {MEAL_TYPES[item.mealType].name} - {item.quantity}食
                            </label>
                          </div>
                        )
                      })}
                    </div>

                    {/* アクションボタン */}
                    <div className="flex items-center gap-2 pt-2">
                      {facilityOrders.map((order) => (
                        <Button
                          key={order.id}
                          size="sm"
                          className="flex-1"
                          variant={order.status === 'completed' ? 'secondary' : 'default'}
                          disabled={order.status === 'completed'}
                          onClick={() => handleComplete(order.id)}
                        >
                          <Truck className="w-4 h-4 mr-2" />
                          {order.status === 'completed' ? '配送済' : '配送完了'}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
