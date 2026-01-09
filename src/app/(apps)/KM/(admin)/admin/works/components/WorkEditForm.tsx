'use client'

import { useState, useTransition } from 'react'
import { Save, Loader2, Eye } from 'lucide-react'
import { upsertKaizenWork, deleteKaizenWork } from '../actions'
import { R_Stack } from '@cm/components/styles/common-components/common-components'
import { WorkCard } from '@app/(apps)/KM/(public)/top/WorkCard'
import { useWorkForm } from '@app/(apps)/KM/hooks/useWorkForm'
import { BasicInfoFields } from './forms/BasicInfoFields'
import { ClientFields } from './forms/ClientFields'
import { CategoryFields } from './forms/CategoryFields'
import { ContentFields } from './forms/ContentFields'

interface WorkEditFormProps {
  work: any | null
  clients: any[]
  onClose: () => void
  isNew?: boolean
}

export const WorkEditForm = ({ work, clients, onClose, isNew = false }: WorkEditFormProps) => {
  const [isPending, startTransition] = useTransition()
  const [showPreview, setShowPreview] = useState(false)
  const { formData, handleChange } = useWorkForm({ initialWork: work })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      const result = await upsertKaizenWork({
        ...formData,
        id: formData.id || undefined,
        kaizenClientId: formData.kaizenClientId ? Number(formData.kaizenClientId) : null,
        dealPoint: formData.dealPoint ? Number(formData.dealPoint) : null,
        toolPoint: formData.toolPoint ? Number(formData.toolPoint) : null,
        date: formData.date || null,
      })

      if (result.success) {
        onClose()
      } else {
        alert('保存に失敗しました: ' + result.error)
      }
    })
  }

  const handleDelete = () => {
    if (!work?.id) return
    if (!confirm('この実績を削除しますか？この操作は取り消せません。')) return

    startTransition(async () => {
      const result = await deleteKaizenWork(work.id)
      if (result.success) {
        onClose()
      } else {
        alert('削除に失敗しました: ' + result.error)
      }
    })
  }

  // プレビュー用のデータを作成
  const previewData = {
    ...formData,
    dealPoint: formData.dealPoint ? Number(formData.dealPoint) : null,
    toolPoint: formData.toolPoint ? Number(formData.toolPoint) : null,
    KaizenClient: clients.find(c => c.id === Number(formData.kaizenClientId)),
  }

  return (
    <R_Stack className={` flex-nowrap w-[90vw] overflow-auto items-start`}>
      <form onSubmit={handleSubmit} className="flex flex-col h-full min-w-[1000px] text-sm">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">
            {isNew ? '新規実績作成' : '実績編集'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Eye className="h-4 w-4" />
              プレビュー
            </button>

          </div>
        </div>

        {/* フォーム本体 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* 左カラム */}
            <div className="space-y-6">
              <BasicInfoFields formData={formData} onChange={handleChange} />
              <ClientFields formData={formData} clients={clients} onChange={handleChange} />
              <CategoryFields formData={formData} onChange={handleChange} />
            </div>

            {/* 右カラム */}
            <div className="space-y-6">
              <ContentFields formData={formData} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          {!isNew && work?.id ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              削除
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              保存
            </button>
          </div>
        </div>
      </form>

      <div>
        <WorkCard
          work={formData as any} />
      </div>



    </R_Stack>
  )
}
