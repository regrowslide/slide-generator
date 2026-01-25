'use client'

import {Button} from '@shadcn/ui/button'
import type {RcIngredientMaster} from '../../types'

interface IngredientFormProps {
  editingItem: RcIngredientMaster | null
  onSave: (item: {name: string; price: number; yield: number; category: string; supplier: string}) => void
  onClose: () => void
}

export const IngredientForm = ({editingItem, onSave, onClose}: IngredientFormProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newItem = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      price: Number(formData.get('price')),
      yield: Number(formData.get('yield')),
      supplier: formData.get('supplier') as string,
    }
    onSave(newItem)
  }

  return (
    <div className="p-6">
      <h3 className="font-bold text-lg mb-4">{editingItem ? '編集' : '新規登録'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">食材名</label>
          <input name="name" defaultValue={editingItem?.name} placeholder="食材名" required className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">分類</label>
          <input name="category" defaultValue={editingItem?.category} placeholder="分類" className="w-full border p-2 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">単価(円/kg)</label>
            <input
              name="price"
              type="number"
              defaultValue={editingItem?.price}
              placeholder="単価(円/kg)"
              required
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">歩留まり(%)</label>
            <input
              name="yield"
              type="number"
              defaultValue={editingItem?.yield}
              placeholder="歩留まり(%)"
              required
              className="w-full border p-2 rounded"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">仕入れ先</label>
          <input name="supplier" defaultValue={editingItem?.supplier} placeholder="仕入れ先" className="w-full border p-2 rounded" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button type="submit">保存</Button>
        </div>
      </form>
    </div>
  )
}
