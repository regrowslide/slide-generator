'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Calendar, Search, AlertTriangle } from 'lucide-react'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shadcn/ui/select'
import { importOrderCsv } from '../_actions/csv-import-actions'
import { getOrders, updateOrder } from '../_actions/order-actions'
import { MEAL_TYPES } from '../lib/constants'
import type { KgOrderWithRelations, KgFacilityMaster } from '../types'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useModal from '@cm/components/utils/modal/useModal'
import { Button } from '@cm/components/styles/common-components/Button'

type Props = {
  initialOrders: KgOrderWithRelations[]
  facilities: KgFacilityMaster[]
  currentFilter: {
    year: number
    month: number
    day: number
    facilityId?: number
  }
}

export const OrderDashboardClient = ({ initialOrders, facilities, currentFilter }: Props) => {
  const router = useRouter()
  const { toggleLoad } = useGlobal()
  const [orders, setOrders] = useState(initialOrders)

  // フィルター状態
  const [year, setYear] = useState(currentFilter.year)
  const [month, setMonth] = useState(currentFilter.month)
  const [day, setDay] = useState(currentFilter.day)
  const [facilityId, setFacilityId] = useState<number | undefined>(currentFilter.facilityId)

  // RSC再実行時に initialOrders が変わったら同期
  useEffect(() => {
    setOrders(initialOrders)
  }, [initialOrders])

  // 取り込み用施設選択
  const [importFacilityId, setImportFacilityId] = useState<number | undefined>(undefined)

  // インポートログモーダル
  const logModal = useModal<string[]>()

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
    if (facilityId) params.set('facilityId', facilityId.toString())
    router.push(`?${params.toString()}`)
  }, [year, month, day, facilityId, router])

  // 受注CSVアップロード処理
  const handleOrderCsvUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      toggleLoad(async () => {
        const text = await file.text()
        const result = await importOrderCsv(text, importFacilityId)

        logModal.handleOpen(result.logList)

        if (result.success) {
          const dateFrom = new Date(year, month - 1, day)
          dateFrom.setHours(0, 0, 0, 0)
          const dateTo = new Date(year, month - 1, day + 1)

          const newOrders = await getOrders({
            where: { deliveryDate: { gte: dateFrom, lt: dateTo } },
            orderBy: { deliveryDate: 'asc' },
          })
          setOrders(newOrders)
        }
      })

      event.target.value = ''
    },
    [toggleLoad, logModal, year, month, day, importFacilityId]
  )

  // 施設変更処理
  const handleFacilityChange = useCallback(
    async (orderId: number, newFacilityId: number | null) => {
      toggleLoad(async () => {
        await updateOrder(orderId, { facilityId: newFacilityId })
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  facilityId: newFacilityId,
                  KgFacilityMaster: newFacilityId
                    ? facilities.find((f) => f.id === newFacilityId) ?? null
                    : null,
                }
              : order
          )
        )
      })
    },
    [toggleLoad, facilities]
  )

  // 食事区分ごとの集計
  const getMealSummary = (mealType: string) => {
    return orders.reduce((acc, order) => {
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
          <Select
            value={importFacilityId?.toString() ?? 'none'}
            onValueChange={(v) => setImportFacilityId(v === 'none' ? undefined : parseInt(v))}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="取込先施設" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">施設未指定</SelectItem>
              {facilities.map((f) => (
                <SelectItem key={f.id} value={f.id.toString()}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleOrderCsvUpload}
              className="hidden"
            />
            <Button>

              <Upload className="w-4 h-4 " />
              受注取込
            </Button>
          </label>
        </div>
      </div>

      {/* フィルターエリア */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-end gap-3">
            {/* 年月選択 */}
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

            {/* 施設選択 */}
            <Select
              value={facilityId?.toString() ?? 'all'}
              onValueChange={(v) => setFacilityId(v === 'all' ? undefined : parseInt(v))}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="施設" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全施設</SelectItem>
                {facilities.map((f) => (
                  <SelectItem key={f.id} value={f.id.toString()}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 検索ボタン */}
            <Button onClick={applyFilter}>
              <Search className="w-4 h-4 mr-2" />
              検索
            </Button>
          </div>
        </CardContent>
      </Card>

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
            {year}年{month}月{day}日の受注一覧
            <Badge color="gray">{orders.length}件</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
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
                  <TableHead className="text-center">朝食</TableHead>
                  <TableHead className="text-center">昼食</TableHead>
                  <TableHead className="text-center">夕食</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order, i) => {
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
                    <TableRow key={i}>
                      <TableCell className="font-mono text-sm">#{order.id}</TableCell>
                      <TableCell>
                        <Select
                          value={order.facilityId?.toString() ?? 'none'}
                          onValueChange={(v) =>
                            handleFacilityChange(order.id, v === 'none' ? null : parseInt(v))
                          }
                        >
                          <SelectTrigger className="w-36 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">未設定</SelectItem>
                            {facilities.map((f) => (
                              <SelectItem key={f.id} value={f.id.toString()}>
                                {f.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* インポートログモーダル */}
      <logModal.Modal
        title={
          <span className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            インポート結果
          </span>
        }
        style={{ maxWidth: '42rem' }}
      >
        <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-100 overflow-x-auto">
          {logModal.open &&
            logModal.open.map((log, index) => (
              <div key={index} className="py-0.5 whitespace-nowrap">
                {log}
              </div>
            ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => logModal.handleClose()}>閉じる</Button>
        </div>
      </logModal.Modal>
    </div>
  )
}
