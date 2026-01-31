'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, Edit2, Trash2, AlertTriangle, Package, Link2 } from 'lucide-react'
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
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useModal from '@cm/components/utils/modal/useModal'
import {
  type IngredientMasterItem,
  getIngredientMasters,
  createIngredientMaster,
  updateIngredientMaster,
  deleteIngredientMaster,
  getUnlinkedIngredients,
  createMasterFromUnlinked,
} from '../../_actions/ingredient-master-actions'

type Props = {
  initialMasters: IngredientMasterItem[]
  categories: string[]
  currentFilter: {
    search?: string
    category?: string
  }
}

type FormData = {
  name: string
  standardCode: string
  price: string
  yield: string
  category: string
  supplier: string
  energyPer100g: string
  proteinPer100g: string
  fatPer100g: string
  carbPer100g: string
  sodiumPer100g: string
}

const initialFormData: FormData = {
  name: '',
  standardCode: '',
  price: '',
  yield: '100',
  category: '',
  supplier: '',
  energyPer100g: '',
  proteinPer100g: '',
  fatPer100g: '',
  carbPer100g: '',
  sodiumPer100g: '',
}

export const IngredientMasterClient = ({
  initialMasters,
  categories,
  currentFilter,
}: Props) => {
  const router = useRouter()
  const { toggleLoad } = useGlobal()

  // データ
  const [masters, setMasters] = useState(initialMasters)
  const [allCategories, setAllCategories] = useState(categories)

  // フィルター
  const [search, setSearch] = useState(currentFilter.search ?? '')
  const [category, setCategory] = useState(currentFilter.category ?? '')

  // フォームモーダル
  const formModal = useModal()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)

  // 未リンク材料モーダル
  type UnlinkedItem = { ingredientCode: string; ingredientName: string; usageCount: number }
  const unlinkedModal = useModal<UnlinkedItem[]>()
  const [selectedUnlinked, setSelectedUnlinked] = useState<{
    code: string
    name: string
  } | null>(null)

  // フィルター適用
  const applyFilter = useCallback(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category) params.set('category', category)
    router.push(`?${params.toString()}`)
  }, [search, category, router])

  // データ再取得
  const refreshData = useCallback(async () => {
    const result = await getIngredientMasters({
      search: currentFilter.search,
      category: currentFilter.category,
    })
    setMasters(result.masters)
    setAllCategories(result.categories)
  }, [currentFilter])

  // フォーム送信
  const handleSubmit = useCallback(async () => {
    if (!formData.name || !formData.category || !formData.supplier) {
      window.alert('名称、分類、仕入先は必須です')
      return
    }

    toggleLoad(async () => {
      const data = {
        name: formData.name,
        standardCode: formData.standardCode || undefined,
        price: parseFloat(formData.price) || 0,
        yield: parseFloat(formData.yield) || 100,
        category: formData.category,
        supplier: formData.supplier,
        energyPer100g: formData.energyPer100g ? parseFloat(formData.energyPer100g) : undefined,
        proteinPer100g: formData.proteinPer100g ? parseFloat(formData.proteinPer100g) : undefined,
        fatPer100g: formData.fatPer100g ? parseFloat(formData.fatPer100g) : undefined,
        carbPer100g: formData.carbPer100g ? parseFloat(formData.carbPer100g) : undefined,
        sodiumPer100g: formData.sodiumPer100g ? parseFloat(formData.sodiumPer100g) : undefined,
      }

      let result
      if (editingId) {
        result = await updateIngredientMaster(editingId, data)
      } else {
        result = await createIngredientMaster(data)
      }

      if (result.success) {
        formModal.handleClose()
        setFormData(initialFormData)
        setEditingId(null)
        await refreshData()
      } else {
        window.alert(result.message)
      }
    })
  }, [formData, editingId, toggleLoad, refreshData, formModal])

  // 編集開始
  const handleEdit = useCallback(
    (master: IngredientMasterItem) => {
      setFormData({
        name: master.name,
        standardCode: master.standardCode ?? '',
        price: master.price.toString(),
        yield: master.yield.toString(),
        category: master.category,
        supplier: master.supplier,
        energyPer100g: master.energyPer100g?.toString() ?? '',
        proteinPer100g: master.proteinPer100g?.toString() ?? '',
        fatPer100g: master.fatPer100g?.toString() ?? '',
        carbPer100g: master.carbPer100g?.toString() ?? '',
        sodiumPer100g: master.sodiumPer100g?.toString() ?? '',
      })
      setEditingId(master.id)
      formModal.handleOpen()
    },
    [formModal]
  )

  // 削除
  const handleDelete = useCallback(
    async (id: number) => {
      if (!window.confirm('この材料マスタを削除しますか？')) return

      toggleLoad(async () => {
        const result = await deleteIngredientMaster(id)
        if (result.success) {
          await refreshData()
        } else {
          window.alert(result.message)
        }
      })
    },
    [toggleLoad, refreshData]
  )

  // 未リンク材料を表示
  const handleShowUnlinked = useCallback(async () => {
    toggleLoad(async () => {
      const unlinked = await getUnlinkedIngredients()
      unlinkedModal.handleOpen(unlinked)
    })
  }, [toggleLoad, unlinkedModal])

  // 未リンク材料からマスタ作成
  const handleCreateFromUnlinked = useCallback(
    async (code: string, name: string) => {
      setSelectedUnlinked({ code, name })
      setFormData({
        ...initialFormData,
        name,
        standardCode: code,
      })
      unlinkedModal.handleClose()
      formModal.handleOpen()
    },
    [unlinkedModal, formModal]
  )

  // 未リンクからの登録
  const handleSubmitFromUnlinked = useCallback(async () => {
    if (!selectedUnlinked || !formData.category || !formData.supplier) {
      window.alert('分類と仕入先は必須です')
      return
    }

    toggleLoad(async () => {
      const result = await createMasterFromUnlinked(selectedUnlinked.code, selectedUnlinked.name, {
        price: parseFloat(formData.price) || 0,
        yield: parseFloat(formData.yield) || 100,
        category: formData.category,
        supplier: formData.supplier,
      })

      if (result.success) {
        window.alert(result.message)
        formModal.handleClose()
        setFormData(initialFormData)
        setSelectedUnlinked(null)
        await refreshData()
      } else {
        window.alert(result.message)
      }
    })
  }, [selectedUnlinked, formData, toggleLoad, refreshData, formModal])

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">材料マスタ管理</h2>
          <p className="text-slate-500 text-sm">
            献立で使用する材料のマスタデータを管理
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleShowUnlinked}>
            <AlertTriangle className="w-4 h-4 mr-2 text-orange-500" />
            未リンク材料
          </Button>
          <Button
            onClick={() => {
              setFormData(initialFormData)
              setEditingId(null)
              setSelectedUnlinked(null)
              formModal.handleOpen()
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            新規登録
          </Button>
        </div>
      </div>

      {/* フィルター */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-end gap-3">
            <Input
              type="text"
              placeholder="名称・コードで検索"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
            <Select
              value={category || 'all'}
              onValueChange={(v) => setCategory(v === 'all' ? '' : v)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="分類" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全分類</SelectItem>
                {allCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={applyFilter}>
              <Search className="w-4 h-4 mr-2" />
              検索
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 一覧 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            材料マスタ一覧
            <Badge color="gray">{masters.length}件</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {masters.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>材料マスタがありません</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">コード</TableHead>
                  <TableHead>名称</TableHead>
                  <TableHead className="w-24">分類</TableHead>
                  <TableHead className="w-28 text-right">単価(円/kg)</TableHead>
                  <TableHead className="w-20 text-right">歩留(%)</TableHead>
                  <TableHead className="w-24">仕入先</TableHead>
                  <TableHead className="w-20 text-center">使用数</TableHead>
                  <TableHead className="w-24">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {masters.map((master) => (
                  <TableRow key={master.id}>
                    <TableCell className="font-mono text-sm text-slate-500">
                      {master.standardCode ?? '-'}
                    </TableCell>
                    <TableCell className="font-medium">{master.name}</TableCell>
                    <TableCell>
                      <Badge color="purple">{master.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      ¥{master.price.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">{master.yield}%</TableCell>
                    <TableCell className="text-sm">{master.supplier}</TableCell>
                    <TableCell className="text-center">
                      {master.linkedKondateCount > 0 ? (
                        <Badge color="green">{master.linkedKondateCount}</Badge>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(master)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(master.id)}
                          disabled={master.linkedKondateCount > 0}
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

      {/* 登録・編集モーダル */}
      <formModal.Modal
        title={
          selectedUnlinked
            ? '未リンク材料からマスタ登録'
            : editingId
              ? '材料マスタ編集'
              : '材料マスタ新規登録'
        }
        style={{ maxWidth: '42rem' }}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">名称 *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!!selectedUnlinked}
              />
            </div>
            <div>
              <label className="text-sm font-medium">食品コード</label>
              <Input
                value={formData.standardCode}
                onChange={(e) => setFormData({ ...formData, standardCode: e.target.value })}
                disabled={!!selectedUnlinked}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">分類 *</label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="例: 野菜、肉類"
                list="category-list"
              />
              <datalist id="category-list">
                {allCategories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="text-sm font-medium">仕入先 *</label>
              <Input
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">単価(円/kg)</label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">歩留(%)</label>
              <Input
                type="number"
                value={formData.yield}
                onChange={(e) => setFormData({ ...formData, yield: e.target.value })}
              />
            </div>
          </div>

          {!selectedUnlinked && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3">栄養素(100gあたり)</h4>
              <div className="grid grid-cols-5 gap-3">
                <div>
                  <label className="text-xs">エネルギー(kcal)</label>
                  <Input
                    type="number"
                    value={formData.energyPer100g}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        energyPer100g: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs">たんぱく質(g)</label>
                  <Input
                    type="number"
                    value={formData.proteinPer100g}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        proteinPer100g: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs">脂質(g)</label>
                  <Input
                    type="number"
                    value={formData.fatPer100g}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fatPer100g: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs">炭水化物(g)</label>
                  <Input
                    type="number"
                    value={formData.carbPer100g}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        carbPer100g: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs">ナトリウム(mg)</label>
                  <Input
                    type="number"
                    value={formData.sodiumPer100g}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sodiumPer100g: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                formModal.handleClose()
                setSelectedUnlinked(null)
              }}
            >
              キャンセル
            </Button>
            <Button onClick={selectedUnlinked ? handleSubmitFromUnlinked : handleSubmit}>
              {editingId ? '更新' : '登録'}
            </Button>
          </div>
        </div>
      </formModal.Modal>

      {/* 未リンク材料モーダル */}
      <unlinkedModal.Modal
        title={
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            未リンク材料一覧
            <Badge color="orange">{unlinkedModal.open?.length ?? 0}件</Badge>
          </span>
        }
        style={{ maxWidth: '48rem' }}
      >
        <p className="text-sm text-slate-500 mb-4">
          献立に登録されているがマスタ未登録の材料です。「登録」ボタンからマスタを作成できます。
        </p>
        {!unlinkedModal.open || unlinkedModal.open.length === 0 ? (
          <div className="text-center py-8 text-slate-400">未リンクの材料はありません</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">食品コード</TableHead>
                <TableHead>材料名</TableHead>
                <TableHead className="w-20 text-center">使用数</TableHead>
                <TableHead className="w-24">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unlinkedModal.open.map((item, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-sm">{item.ingredientCode}</TableCell>
                  <TableCell className="font-medium">{item.ingredientName}</TableCell>
                  <TableCell className="text-center">
                    <Badge color="blue">{item.usageCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleCreateFromUnlinked(item.ingredientCode, item.ingredientName)
                      }
                    >
                      <Link2 className="w-3 h-3 mr-1" />
                      登録
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </unlinkedModal.Modal>
    </div>
  )
}
