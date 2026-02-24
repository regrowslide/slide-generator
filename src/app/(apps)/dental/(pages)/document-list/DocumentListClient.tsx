'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {HREF} from '@cm/lib/methods/urls'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import { Button } from '@cm/components/styles/common-components/Button'
import { Card, CardContent } from '@shadcn/ui/card'
import { DOCUMENT_TEMPLATES } from '@app/(apps)/dental/lib/constants'
import { deleteDentalSavedDocument } from '@app/(apps)/dental/_actions/saved-document-actions'
import { deleteDocumentPdf } from '@app/(apps)/dental/_actions/document-blob-actions'
import type { Facility } from '@app/(apps)/dental/lib/types'

type DocumentItem = {
  id: number
  patientId: number
  patientName: string
  facilityId: number
  facilityName: string
  templateId: string
  templateName: string
  pdfUrl: string
  version: number
  createdAt: string
  visitDate: string
}

type Props = {
  documents: DocumentItem[]
  facilities: Facility[]
}

const DocumentListClient = ({ documents, facilities }: Props) => {
  const router = useRouter()
  const {query} = useGlobal()
  const [filterFacility, setFilterFacility] = useState('')
  const [filterDocType, setFilterDocType] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  const filtered = documents.filter(doc => {
    if (filterFacility && doc.facilityId !== Number(filterFacility)) return false
    if (filterDocType && doc.templateId !== filterDocType) return false
    if (filterMonth && !doc.visitDate.startsWith(filterMonth)) return false
    return true
  })

  const handleToggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map(d => d.id)))
    }
  }

  const handleDelete = async (doc: DocumentItem) => {
    if (!window.confirm(`「${doc.templateName}」（${doc.patientName}）を削除しますか？`)) return
    try {
      if (doc.pdfUrl) await deleteDocumentPdf(doc.pdfUrl)
      await deleteDentalSavedDocument(doc.id)
      router.refresh()
    } catch (e) {
      console.error('削除失敗:', e)
    }
  }

  const handleBulkDownload = () => {
    const selected = filtered.filter(d => selectedIds.has(d.id) && d.pdfUrl)
    if (selected.length === 0) {
      window.alert('ダウンロード可能な文書が選択されていません。')
      return
    }
    selected.forEach(doc => {
      const a = document.createElement('a')
      a.href = doc.pdfUrl
      a.download = `${doc.templateName}_${doc.patientName}.pdf`
      a.target = '_blank'
      a.click()
    })
  }

  const documentTypeOptions = Object.entries(DOCUMENT_TEMPLATES).map(([id, t]) => ({
    value: id,
    label: t.name,
  }))

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">文書管理</h1>
        <Button onClick={() => router.push(HREF('/dental/document-create', {}, query))}>
          新規文書作成
        </Button>
      </div>

      {/* フィルタ */}
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs text-gray-600 mb-1">月</label>
              <input
                type="month"
                value={filterMonth}
                onChange={e => setFilterMonth(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">施設</label>
              <select
                value={filterFacility}
                onChange={e => setFilterFacility(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm"
              >
                <option value="">すべて</option>
                {facilities.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">文書タイプ</label>
              <select
                value={filterDocType}
                onChange={e => setFilterDocType(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm"
              >
                <option value="">すべて</option>
                {documentTypeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedIds.size === filtered.length && filtered.length > 0 ? '全解除' : '全選択'}
              </Button>
              <Button size="sm" onClick={handleBulkDownload} disabled={selectedIds.size === 0}>
                選択した文書をDL ({selectedIds.size}件)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 文書一覧 */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            <p className="text-lg mb-2">保存済み文書がありません</p>
            <p className="text-sm">文書作成画面から文書を作成・保存すると、ここに表示されます。</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2 text-left w-8">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filtered.length && filtered.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 accent-emerald-600"
                    />
                  </th>
                  <th className="px-3 py-2 text-left">文書名</th>
                  <th className="px-3 py-2 text-left">患者</th>
                  <th className="px-3 py-2 text-left">施設</th>
                  <th className="px-3 py-2 text-left">訪問日</th>
                  <th className="px-3 py-2 text-left">作成日時</th>
                  <th className="px-3 py-2 text-left w-24">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(doc => (
                  <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(doc.id)}
                        onChange={() => handleToggleSelect(doc.id)}
                        className="w-4 h-4 accent-emerald-600"
                      />
                    </td>
                    <td className="px-3 py-2 font-medium">{doc.templateName}</td>
                    <td className="px-3 py-2">{doc.patientName}</td>
                    <td className="px-3 py-2">{doc.facilityName}</td>
                    <td className="px-3 py-2">{doc.visitDate}</td>
                    <td className="px-3 py-2 text-gray-500">{new Date(doc.createdAt).toLocaleString('ja-JP')}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        {doc.pdfUrl ? (
                          <a
                            href={doc.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-xs"
                          >
                            PDF
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs">未保存</span>
                        )}
                        <button
                          onClick={() => handleDelete(doc)}
                          className="text-red-500 hover:text-red-700 text-xs ml-2"
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

export default DocumentListClient
