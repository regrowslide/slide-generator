'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Search, List, Upload, AlertTriangle, Link2, X } from 'lucide-react'
import { Button } from '@shadcn/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/ui/card'
import { Badge } from '@shadcn/ui/badge'
import { Input } from '@shadcn/ui/input'
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
import { MEAL_TYPES, type MealTypeCode } from '../../lib/constants'
import {
  getDishDetail,
  getKondateList,
  searchIngredientMasters,
  linkIngredientToMaster,
  type KondateListItem,
} from '../../_actions/kondate-actions'
import { importKondateCsv } from '../../_actions/csv-import-actions'
import type { KgMenuRecipeWithRelations } from '../../types'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useModal from '@cm/components/utils/modal/useModal'

type Props = {
  initialData: KondateListItem[]
  availableYearMonths: { year: number; month: number }[]
  currentFilter: {
    year: number
    month: number
    day?: number
    mealType?: string
    recipeName?: string
  }
}

export const KondateClient = ({
  initialData,
  availableYearMonths,
  currentFilter,
}: Props) => {
  const router = useRouter()
  const { toggleLoad } = useGlobal()

  // フィルター状態
  const [year, setYear] = useState(currentFilter.year)
  const [month, setMonth] = useState(currentFilter.month)
  const [day, setDay] = useState<number | undefined>(currentFilter.day)
  const [mealType, setMealType] = useState<string | undefined>(currentFilter.mealType)
  const [recipeName, setRecipeName] = useState(currentFilter.recipeName ?? '')

  // 材料一覧モーダル（Dish の詳細）
  const dishDetailModal = useModal<KgMenuRecipeWithRelations | null>()

  // インポートログモーダル
  const logModal = useModal<string[]>()

  // 献立取り込み用の日付
  const [importDate, setImportDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )

  // 献立データ（リロード用）
  const [kondateData, setKondateData] = useState(initialData)

  // マスタリンク編集用
  const [editingIngredientId, setEditingIngredientId] = useState<number | null>(null)
  const [masterSearchQuery, setMasterSearchQuery] = useState('')
  const [masterSearchResults, setMasterSearchResults] = useState<
    { id: number; name: string; standardCode: string | null; category: string }[]
  >([])

  // 年リスト（データがある年 + 現在年）
  const years = Array.from(
    new Set([
      ...availableYearMonths.map((ym) => ym.year),
      new Date().getFullYear(),
    ])
  ).sort((a, b) => b - a)

  // 日リスト（1〜31）
  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  // フィルター適用
  const applyFilter = useCallback(() => {
    const params = new URLSearchParams()
    params.set('year', year.toString())
    params.set('month', month.toString())
    if (day) params.set('day', day.toString())
    if (mealType) params.set('mealType', mealType)
    if (recipeName) params.set('recipeName', recipeName)
    router.push(`?${params.toString()}`)
  }, [year, month, day, mealType, recipeName, router])

  // 献立CSV取り込み処理
  const handleKondateCsvUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      if (!importDate) {
        window.alert('取り込み対象の日付を選択してください')
        return
      }

      toggleLoad(async () => {
        const text = await file.text()
        const targetDate = new Date(importDate)
        const result = await importKondateCsv(text, targetDate)

        // ログを表示
        logModal.handleOpen(result.logList)

        if (result.success) {
          // データを再取得
          const newData = await getKondateList({ year, month, day, mealType, recipeName })
          setKondateData(newData)
        }
      })

      // input をリセット
      event.target.value = ''
    },
    [toggleLoad, importDate, year, month, day, mealType, recipeName, logModal]
  )

  // 材料一覧を表示（Dish の詳細）
  const handleShowIngredients = useCallback(
    async (dishId: number) => {
      toggleLoad(async () => {
        const dish = await getDishDetail(dishId)
        if (dish) {
          dishDetailModal.handleOpen(dish)
        }
      })
    },
    [toggleLoad, dishDetailModal]
  )

  // 料理の材料を取得
  const getDishIngredients = (
    dish: KgMenuRecipeWithRelations
  ): KgMenuRecipeWithRelations['KgRecipeIngredient'] => {
    return dish.KgRecipeIngredient
  }

  // マスタ検索
  const handleMasterSearch = useCallback(async (query: string) => {
    setMasterSearchQuery(query)
    if (query.length >= 2) {
      const results = await searchIngredientMasters(query)
      setMasterSearchResults(results)
    } else {
      setMasterSearchResults([])
    }
  }, [])

  // マスタリンク
  const handleLinkMaster = useCallback(
    async (ingredientId: number, masterId: number) => {
      toggleLoad(async () => {
        const result = await linkIngredientToMaster(ingredientId, masterId)
        if (result.success) {
          // Dish詳細を再取得
          if (dishDetailModal.open) {
            const updated = await getDishDetail(dishDetailModal.open.id)
            if (updated) dishDetailModal.setopen(updated)
          }
          // 一覧も更新
          const newData = await getKondateList({ year, month, day, mealType, recipeName })
          setKondateData(newData)
        }
        setEditingIngredientId(null)
        setMasterSearchQuery('')
        setMasterSearchResults([])
      })
    },
    [toggleLoad, dishDetailModal, year, month, day, mealType, recipeName]
  )

  // マスタリンク解除
  const handleUnlinkMaster = useCallback(
    async (ingredientId: number) => {
      toggleLoad(async () => {
        const result = await linkIngredientToMaster(ingredientId, null)
        if (result.success && dishDetailModal.open) {
          const updated = await getDishDetail(dishDetailModal.open.id)
          if (updated) dishDetailModal.setopen(updated)
          const newData = await getKondateList({ year, month, day, mealType, recipeName })
          setKondateData(newData)
        }
      })
    },
    [toggleLoad, dishDetailModal, year, month, day, mealType, recipeName]
  )

  // 日付フォーマット
  const formatDate = (date: Date) => {
    const d = new Date(date)
    return `${d.getMonth() + 1}/${d.getDate()}`
  }

  // 曜日取得
  const getDayOfWeek = (date: Date) => {
    const days = ['日', '月', '火', '水', '木', '金', '土']
    return days[new Date(date).getDay()]
  }

  return (
    <div className="space-y-6">
      {/* ヘッダーエリア */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">献立管理</h2>
          <p className="text-slate-500 text-sm">月別の献立データを管理</p>
        </div>
        {/* 献立CSV取り込み */}
        <div className="flex items-center gap-3 p-3 bg-white border rounded-lg">
          <span className="text-sm text-slate-600 font-medium">献立取込:</span>
          <Input
            type="date"
            value={importDate}
            onChange={(e) => setImportDate(e.target.value)}
            className="w-40"
          />
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleKondateCsvUpload}
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
            </div>

            {/* 日付選択 */}
            <Select
              value={day?.toString() ?? 'all'}
              onValueChange={(v) => setDay(v === 'all' ? undefined : parseInt(v))}
            >
              <SelectTrigger className="w-24">
                <SelectValue placeholder="日" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全日</SelectItem>
                {days.map((d) => (
                  <SelectItem key={d} value={d.toString()}>
                    {d}日
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 食事区分選択 */}
            <Select
              value={mealType ?? 'all'}
              onValueChange={(v) => setMealType(v === 'all' ? undefined : v)}
            >
              <SelectTrigger className="w-28">
                <SelectValue placeholder="食事区分" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全区分</SelectItem>
                {Object.entries(MEAL_TYPES).map(([code, data]) => (
                  <SelectItem key={code} value={code}>
                    {data.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 献立名検索 */}
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="献立名で検索"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                className="w-48"
              />
            </div>

            {/* 検索ボタン */}
            <Button onClick={applyFilter}>
              <Search className="w-4 h-4 mr-2" />
              検索
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 献立一覧 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {year}年{month}月の献立一覧
            <Badge color="gray">{kondateData.length}件</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {kondateData.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <List className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>献立データがありません</p>
              <p className="text-sm mt-2">CSVファイルから献立をインポートしてください</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">日付</TableHead>
                  <TableHead className="w-20">区分</TableHead>
                  <TableHead className="w-28">料理コード</TableHead>
                  <TableHead>料理名</TableHead>
                  <TableHead className="w-32">献立</TableHead>
                  <TableHead className="w-24 text-center">材料</TableHead>
                  <TableHead className="w-32">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kondateData.map((item) => (
                  <TableRow key={`${item.mealSlotId}-${item.dishId}`}>
                    <TableCell>
                      <span className="font-medium">{formatDate(item.menuDate)}</span>
                      <span className="text-slate-400 ml-1">
                        ({getDayOfWeek(item.menuDate)})
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getMealTypeColor(item.mealType as MealTypeCode)}>
                        {item.mealTypeName}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-slate-500">
                      {item.dishCode}
                    </TableCell>
                    <TableCell className="font-medium">{item.dishName}</TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {item.menuName}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Badge color="blue">{item.ingredientCount}</Badge>
                        {item.unlinkedIngredientCount > 0 && (
                          <Badge color="orange" className="flex items-center gap-0.5">
                            <AlertTriangle className="w-3 h-3" />
                            {item.unlinkedIngredientCount}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleShowIngredients(item.dishId)}
                      >
                        <List className="w-4 h-4 mr-1" />
                        材料一覧
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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

      {/* 材料一覧モーダル（Dish の材料表示） */}
      <dishDetailModal.Modal
        title={
          <span className="flex items-center gap-2">
            <List className="w-5 h-5" />
            {dishDetailModal.open?.name} - 材料一覧
            <Badge color="blue">{dishDetailModal?.open?.KgRecipeIngredient?.length ?? 0}材料</Badge>
          </span>
        }
        style={{ maxWidth: '64rem' }}
      >
        {dishDetailModal.open && (
          <div className="space-y-6">
            {/* 料理情報 */}
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span>
                料理コード: <span className="font-mono">{dishDetailModal.open.code}</span>
              </span>
              {dishDetailModal.open.ParentRecipe && (
                <span>| 献立: {dishDetailModal.open.ParentRecipe.name}</span>
              )}
            </div>

            {/* 未リンク警告 */}
            {dishDetailModal.open.KgRecipeIngredient.some((ing) => !ing.RcIngredientMaster) && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-2 text-orange-800">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm">
                  マスタ未登録の材料があります。「リンク」ボタンからマスタを紐付けてください。
                </span>
              </div>
            )}

            {/* 材料テーブル */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">食品コード</TableHead>
                  <TableHead>食材名</TableHead>
                  <TableHead className="w-20 text-right">分量</TableHead>
                  <TableHead className="w-20 text-right">kcal</TableHead>
                  <TableHead className="w-16 text-right">P</TableHead>
                  <TableHead className="w-16 text-right">F</TableHead>
                  <TableHead className="w-16 text-right">C</TableHead>
                  <TableHead className="w-24 text-right">単価</TableHead>
                  <TableHead className="w-32">マスタ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dishDetailModal.open.KgRecipeIngredient.map((ing, i) => (
                  <TableRow key={i} className={!ing.RcIngredientMaster ? 'bg-orange-50' : ''}>
                    <TableCell className="font-mono text-sm text-slate-500">
                      {ing.ingredientCode}
                    </TableCell>
                    <TableCell className="font-medium">
                      {ing.ingredientName}
                      {ing.RcIngredientMaster && (
                        <Badge color="purple" className="ml-2">
                          {ing.RcIngredientMaster.category}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {ing.amountPerServing}
                      {ing.unit}
                    </TableCell>
                    <TableCell className="text-right">{ing.energy?.toFixed(0) ?? '-'}</TableCell>
                    <TableCell className="text-right">{ing.protein?.toFixed(1) ?? '-'}</TableCell>
                    <TableCell className="text-right">{ing.fat?.toFixed(1) ?? '-'}</TableCell>
                    <TableCell className="text-right">{ing.carb?.toFixed(1) ?? '-'}</TableCell>
                    <TableCell className="text-right">
                      {ing.RcIngredientMaster ? (
                        <span>¥{ing.RcIngredientMaster.price.toLocaleString()}/kg</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingIngredientId === ing.id ? (
                        <div className="space-y-2">
                          <Input
                            type="text"
                            placeholder="マスタ検索..."
                            value={masterSearchQuery}
                            onChange={(e) => handleMasterSearch(e.target.value)}
                            className="w-full text-sm"
                            autoFocus
                          />
                          {masterSearchResults.length > 0 && (
                            <div className="absolute z-10 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto w-64">
                              {masterSearchResults.map((master) => (
                                <button
                                  key={master.id}
                                  className="w-full px-3 py-2 text-left hover:bg-slate-100 text-sm"
                                  onClick={() => handleLinkMaster(ing.id, master.id)}
                                >
                                  <div className="font-medium">{master.name}</div>
                                  <div className="text-xs text-slate-500">
                                    {master.standardCode} / {master.category}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingIngredientId(null)
                              setMasterSearchQuery('')
                              setMasterSearchResults([])
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : ing.RcIngredientMaster ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-green-600">リンク済</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => handleUnlinkMaster(ing.id)}
                          >
                            <X className="w-3 h-3 text-slate-400" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-orange-600 border-orange-300"
                          onClick={() => setEditingIngredientId(ing.id)}
                        >
                          <Link2 className="w-3 h-3 mr-1" />
                          リンク
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* 栄養素合計 */}
            <div className="p-4 bg-emerald-50 rounded-lg">
              <h4 className="font-medium mb-2 text-emerald-800">栄養素合計（1人前）</h4>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">エネルギー:</span>{' '}
                  <span className="font-medium">
                    {getDishIngredients(dishDetailModal.open)
                      .reduce((sum, ing) => sum + (ing.energy ?? 0), 0)
                      .toFixed(0)}
                  </span>{' '}
                  kcal
                </div>
                <div>
                  <span className="text-slate-500">たんぱく質:</span>{' '}
                  <span className="font-medium">
                    {getDishIngredients(dishDetailModal.open)
                      .reduce((sum, ing) => sum + (ing.protein ?? 0), 0)
                      .toFixed(1)}
                  </span>{' '}
                  g
                </div>
                <div>
                  <span className="text-slate-500">脂質:</span>{' '}
                  <span className="font-medium">
                    {getDishIngredients(dishDetailModal.open)
                      .reduce((sum, ing) => sum + (ing.fat ?? 0), 0)
                      .toFixed(1)}
                  </span>{' '}
                  g
                </div>
                <div>
                  <span className="text-slate-500">炭水化物:</span>{' '}
                  <span className="font-medium">
                    {getDishIngredients(dishDetailModal.open)
                      .reduce((sum, ing) => sum + (ing.carb ?? 0), 0)
                      .toFixed(1)}
                  </span>{' '}
                  g
                </div>
                <div>
                  <span className="text-slate-500">食塩相当量:</span>{' '}
                  <span className="font-medium">
                    {getDishIngredients(dishDetailModal.open)
                      .reduce((sum, ing) => sum + (ing.salt ?? 0), 0)
                      .toFixed(2)}
                  </span>{' '}
                  g
                </div>
                <div>
                  <span className="text-slate-500">野菜量:</span>{' '}
                  <span className="font-medium">
                    {getDishIngredients(dishDetailModal.open)
                      .reduce((sum, ing) => sum + (ing.vegetableG ?? 0), 0)
                      .toFixed(1)}
                  </span>{' '}
                  g
                </div>
              </div>
            </div>
          </div>
        )}
      </dishDetailModal.Modal>
    </div>
  )
}

// 食事区分の色クラス
const getMealTypeColor = (mealType: MealTypeCode): string => {
  const colors: Record<MealTypeCode, string> = {
    breakfast: 'bg-orange-100 text-orange-800',
    lunch: 'bg-blue-100 text-blue-800',
    snack: 'bg-purple-100 text-purple-800',
    dinner: 'bg-green-100 text-green-800',
  }
  return colors[mealType] ?? 'bg-gray-100 text-gray-800'
}
