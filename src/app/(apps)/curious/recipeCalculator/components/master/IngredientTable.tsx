'use client'

import { Edit, Trash2 } from 'lucide-react'
import { Button } from '@cm/components/styles/common-components/Button'
import type { RcIngredientMaster } from '../../types'

interface IngredientTableProps {
  data: RcIngredientMaster[]
  onEdit: (item: RcIngredientMaster) => void
  onDelete: (id: number) => void
}

export const IngredientMasterTable = ({ data, onEdit, onDelete }: IngredientTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-500 sticky top-0">
          <tr>
            <th className="px-6 py-3">食材名</th>
            <th className="px-6 py-3">分類</th>
            <th className="px-6 py-3 text-right">単価(円/kg)</th>
            <th className="px-6 py-3 text-right">歩留(%)</th>
            <th className="px-6 py-3">仕入れ先</th>
            <th className="px-6 py-3 text-center">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length === 0 && (
            <tr>
              <td colSpan={6} className="p-12 text-center text-slate-400">
                データがありません
              </td>
            </tr>
          )}
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50">
              <td className="px-6 py-3 font-bold">{item.name}</td>
              <td className="px-6 py-3">
                <span className="bg-slate-100 px-2 py-1 rounded text-xs">{item.category}</span>
              </td>
              <td className="px-6 py-3 text-right">¥{item.price.toLocaleString()}</td>
              <td className="px-6 py-3 text-right">{item.yield}%</td>
              <td className="px-6 py-3 text-slate-500">{item.supplier}</td>
              <td className="px-6 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Button onClick={() => onEdit(item)} className="text-blue-500">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button onClick={() => onDelete(item.id)} className="text-slate-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
