'use client'

import { useState, useCallback } from 'react'
import { Upload, Calendar, ArrowLeft, Eye, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@cm/components/styles/common-components/Button'
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
import { importKondateCsv } from '../../../_actions/csv-import-actions'
import {
  getDailyMenus,
  getDailyMenuWithRelations,
  deleteDailyMenu,
} from '../../../_actions/daily-menu-actions'
import type { KgDailyMenu, KgDailyMenuWithRelations } from '../../../types'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useModal from '@cm/components/utils/modal/useModal'

type Props = {
  initialMenus: KgDailyMenu[]
}

export const MenuMasterClient = ({ initialMenus }: Props) => {
  const { toggleLoad } = useGlobal()
  const [menus, setMenus] = useState(initialMenus)

  // 詳細モーダル（開くときに選択されたメニューを渡す）
  const detailModal = useModal<KgDailyMenuWithRelations | null>()

  // CSVアップロード処理
  const handleCsvUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      toggleLoad(async () => {
        const text = await file.text()
        const result = await importKondateCsv(text)

        if (result.success) {
          window.alert(result.message)
          // 再取得
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          const newMenus = await getDailyMenus({
            where: { menuDate: { gte: thirtyDaysAgo } },
            orderBy: { menuDate: 'desc' },
            take: 30,
          })
          setMenus(newMenus)
        } else {
          window.alert(`エラー: ${result.message}`)
        }
      })

      event.target.value = ''
    },
    [toggleLoad]
  )

  // 詳細表示
  const handleShowDetail = useCallback(
    async (menu: KgDailyMenu) => {
      toggleLoad(async () => {
        const detail = await getDailyMenuWithRelations(menu.id)
        if (detail) {
          detailModal.handleOpen(detail)
        }
      })
    },
    [toggleLoad, detailModal]
  )

  // 削除
  const handleDelete = useCallback(
    async (id: number) => {
      if (!window.confirm('この献立データを削除しますか？')) return

      toggleLoad(async () => {
        await deleteDailyMenu(id)
        setMenus((prev) => prev.filter((m) => m.id !== id))
      })
    },
    [toggleLoad]
  )

  // 日付フォーマット
  const formatDate = (date: Date) => {
    const d = new Date(date)
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}(${dayOfWeek})`
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/curious/kaigoshokuManagement/master">
            <Button >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">献立マスター</h2>
            <p className="text-slate-500 text-sm">日別献立データの管理</p>
          </div>
        </div>
        <label className="cursor-pointer">
          <input
            type="file"
            accept=".csv"
            onChange={handleCsvUpload}
            className="hidden"
          />
          <Button >
            <span>
              <Upload className="w-4 h-4 mr-2" />
              献立CSV取込
            </span>
          </Button>
        </label>
      </div>

      {/* テーブル */}
      <Card>
        <CardContent className="pt-6">
          {menus.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>献立データがありません</p>
              <p className="text-sm mt-2">CSVファイルをアップロードしてください</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日付</TableHead>
                  <TableHead>食数</TableHead>
                  <TableHead>PFC比率</TableHead>
                  <TableHead>野菜量</TableHead>
                  <TableHead>メモ</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menus.map((menu) => (
                  <TableRow key={menu.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {formatDate(menu.menuDate)}
                      </div>
                    </TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>
                      {menu.pfc ? (
                        <Badge color="blue">{menu.pfc}</Badge>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {menu.totalVegetableG ? `${menu.totalVegetableG}g` : '-'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {menu.note ?? '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button

                          onClick={() => handleShowDetail(menu)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button

                          onClick={() => handleDelete(menu.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 詳細モーダル */}
      <detailModal.Modal
        title={detailModal.open ? `${formatDate(detailModal.open.menuDate)} の献立` : ''}
        style={{ maxWidth: '56rem' }}
      >
        {detailModal.open && (
          <div className="space-y-6">
            {detailModal.open.KgMealSlot.map((slot) => (
              <Card key={slot.id}>
                <CardHeader className="py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Badge>{slot.mealTypeName}</Badge>
                    {slot.totalEnergy && (
                      <span className="text-sm font-normal text-slate-500">
                        {slot.totalEnergy}kcal
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  {slot.KgMenuRecipe.length === 0 ? (
                    <p className="text-slate-400 text-sm">レシピなし</p>
                  ) : (
                    <div className="space-y-3">
                      {slot.KgMenuRecipe.map((recipe) => (
                        <div key={recipe.id} className="border-l-2 border-emerald-200 pl-3">
                          <div className="font-medium text-sm">
                            {recipe.code} {recipe.name}
                          </div>
                          {recipe.ChildRecipes && recipe.ChildRecipes.length > 0 && (
                            <div className="ml-4 mt-2 space-y-2">
                              {recipe.ChildRecipes.map((subRecipe) => (
                                <div key={subRecipe.id} className="text-sm">
                                  <div className="text-slate-600">
                                    └ {subRecipe.code} {subRecipe.name}
                                  </div>
                                  {subRecipe.KgRecipeIngredient &&
                                    subRecipe.KgRecipeIngredient.length > 0 && (
                                      <div className="ml-4 text-xs text-slate-400">
                                        {subRecipe.KgRecipeIngredient.map((ing) => (
                                          <span key={ing.id} className="mr-2">
                                            {ing.ingredientName}
                                            {ing.amountPerServing}
                                            {ing.unit}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </detailModal.Modal>
    </div>
  )
}
