'use client'

import { useState, useCallback } from 'react'
import { Upload, Calendar, RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@shadcn/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/ui/card'
import { Badge } from '@shadcn/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shadcn/ui/table'
import { Input } from '@shadcn/ui/input'
import { importOrderCsv } from '../_actions/csv-import-actions'
import { getOrders, updateOrderStatus } from '../_actions/order-actions'
import { ORDER_STATUS, MEAL_TYPES, type OrderStatusCode } from '../lib/constants'
import type { KgOrderWithRelations, KgFacilityMaster } from '../types'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

type Props = {
  initialOrders: KgOrderWithRelations[]
  facilities: KgFacilityMaster[]
}

export const OrderDashboardClient = ({ initialOrders, facilities }: Props) => {
  const { toggleLoad } = useGlobal()
  const [orders, setOrders] = useState(initialOrders)
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )

  // 日付でフィルタリング
  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.deliveryDate).toISOString().split('T')[0]
    return orderDate === selectedDate
  })

  // CSVアップロード処理
  const handleCsvUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      toggleLoad(async () => {
        const text = await file.text()
        const result = await importOrderCsv(text)

        if (result.success) {
          window.alert(result.message)
          // 再取得
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const newOrders = await getOrders({
            where: { deliveryDate: { gte: today } },
            orderBy: { deliveryDate: 'asc' },
            take: 50,
          })
          setOrders(newOrders)
        } else {
          window.alert(`エラー: ${result.message}`)
        }
      })

      // input をリセット
      event.target.value = ''
    },
    [toggleLoad]
  )

  // ステータス更新処理
  const handleStatusUpdate = useCallback(
    async (orderId: number, newStatus: string) => {
      toggleLoad(async () => {
        await updateOrderStatus(orderId, newStatus)
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        )
      })
    },
    [toggleLoad]
  )

  // ステータスバッジ
  const StatusBadge = ({ status }: { status: string }) => {
    const statusInfo = ORDER_STATUS[status as OrderStatusCode] ?? ORDER_STATUS.pending
    return (
      <Badge className={statusInfo.colorClass}>
        {status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
        {status === 'confirmed' && <CheckCircle className="w-3 h-3 mr-1" />}
        {status === 'processing' && <RefreshCw className="w-3 h-3 mr-1" />}
        {statusInfo.name}
      </Badge>
    )
  }

  // 日付変更処理
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value)
  }

  // 食事区分ごとの集計
  const getMealSummary = (mealType: string) => {
    return filteredOrders.reduce((acc, order) => {
      const lines = order.KgOrderLine.filter((line) => line.mealType === mealType)
      return acc + lines.reduce((sum, line) => sum + line.quantity, 0)
    }, 0)
  }

  return (
    <div className="space-y-6">
      {/* ヘッダーエリア */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">注文管理</h2>
          <p className="text-slate-500 text-sm">受注データの取込・確認</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              className="hidden"
            />
            <Button variant="outline" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                CSV取込
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* 日付選択 */}
      <div className="flex items-center gap-3">
        <Calendar className="w-5 h-5 text-slate-500" />
        <Input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="w-48"
        />
        <span className="text-sm text-slate-500">
          {(() => {
            const d = new Date(selectedDate)
            const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]
            const isToday = selectedDate === new Date().toISOString().split('T')[0]
            return isToday ? '（今日）' : `（${dayOfWeek}曜日）`
          })()}
        </span>
        <Badge variant="outline">
          {filteredOrders.length}件
        </Badge>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(MEAL_TYPES).map(([code, data]) => {
          const total = getMealSummary(code)
          return (
            <Card key={code}>
              <CardContent className="pt-4">
                <div className="text-sm text-slate-500">{data.name}</div>
                <div className="text-2xl font-bold text-slate-800">
                  {total}
                  <span className="text-sm font-normal text-slate-400 ml-1">食</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 受注リスト */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {selectedDate} の受注一覧
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>この日の受注データはありません</p>
              <p className="text-sm mt-2">CSVファイルをアップロードしてください</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>受注ID</TableHead>
                  <TableHead>施設</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead className="text-center">朝食</TableHead>
                  <TableHead className="text-center">昼食</TableHead>
                  <TableHead className="text-center">夕食</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const breakfastTotal = order.KgOrderLine.filter(
                    (l) => l.mealType === 'breakfast'
                  ).reduce((s, l) => s + l.quantity, 0)
                  const lunchTotal = order.KgOrderLine.filter(
                    (l) => l.mealType === 'lunch'
                  ).reduce((s, l) => s + l.quantity, 0)
                  const dinnerTotal = order.KgOrderLine.filter(
                    (l) => l.mealType === 'dinner'
                  ).reduce((s, l) => s + l.quantity, 0)

                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">#{order.id}</TableCell>
                      <TableCell>
                        {order.KgFacilityMaster?.name ?? (
                          <span className="text-slate-400">未設定</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="text-center">
                        {breakfastTotal > 0 ? breakfastTotal : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {lunchTotal > 0 ? lunchTotal : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {dinnerTotal > 0 ? dinnerTotal : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {order.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                            >
                              確認
                            </Button>
                          )}
                          {order.status === 'confirmed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(order.id, 'processing')}
                            >
                              製造開始
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
