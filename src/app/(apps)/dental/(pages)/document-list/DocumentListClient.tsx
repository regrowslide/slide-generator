'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { HREF } from '@cm/lib/methods/urls'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import { Button } from '@cm/components/styles/common-components/Button'
import { Card, CardContent } from '@shadcn/ui/card'
import { DOCUMENT_TEMPLATES } from '@app/(apps)/dental/lib/constants'
import { deleteDentalSavedDocument, markDocumentsDownloaded } from '@app/(apps)/dental/_actions/saved-document-actions'
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
  downloadedAt: string | null
  visitDate: string
}

type Props = {
  documents: DocumentItem[]
  facilities: Facility[]
}

/** 状態バッジ */
const StatusBadge = ({ doc }: { doc: DocumentItem }) => {
  if (doc.downloadedAt) {
    return <span className="text-[11px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded">DL済</span>
  }
  if (doc.pdfUrl) {
    return <span className="text-[11px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">清書済</span>
  }
  return <span className="text-[11px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">下書き</span>
}

/** 当月の月初・月末をYYYY-MM-DD形式で返す */
const getMonthRange = () => {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const from = `${y}-${String(m + 1).padStart(2, '0')}-01`
  const lastDay = new Date(y, m + 1, 0).getDate()
  const to = `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return { from, to }
}

const DocumentListClient = ({ documents, facilities }: Props) => {
  const router = useRouter()
  const { query } = useGlobal()
  const defaultRange = useMemo(() => getMonthRange(), [])
  const [filterFacility, setFilterFacility] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState(defaultRange.from)
  const [filterDateTo, setFilterDateTo] = useState(defaultRange.to)
  const [filterPatientName, setFilterPatientName] = useState('')
  const [filterDocType, setFilterDocType] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [merging, setMerging] = useState(false)

  // 施設の選択肢
  const facilityOptions = useMemo(() => {
    const map = new Map<number, string>()
    for (const doc of documents) {
      if (doc.facilityId && doc.facilityName) map.set(doc.facilityId, doc.facilityName)
    }
    return [...map.entries()].map(([id, name]) => ({value: String(id), label: name}))
  }, [documents])

  // 期間が指定されているか
  const hasDateRange = !!filterDateFrom && !!filterDateTo

  const filtered = useMemo(() => {
    if (!hasDateRange) return []
    return documents.filter(doc => {
      if (filterFacility && doc.facilityId !== Number(filterFacility)) return false
      if (doc.visitDate < filterDateFrom || doc.visitDate > filterDateTo) return false
      if (filterPatientName && !doc.patientName.includes(filterPatientName)) return false
      if (filterDocType && doc.templateId !== filterDocType) return false
      return true
    })
  }, [documents, filterFacility, filterDateFrom, filterDateTo, filterPatientName, filterDocType, hasDateRange])

  // チェック対象: 清書済み（pdfUrlあり）のみ
  const selectableIds = useMemo(() => new Set(filtered.filter(d => d.pdfUrl).map(d => d.id)), [filtered])

  const handleToggleSelect = (id: number) => {
    if (!selectableIds.has(id)) return
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSelectAll = () => {
    const currentSelectable = [...selectableIds]
    if (currentSelectable.every(id => selectedIds.has(id))) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(currentSelectable))
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

  // バラバラDL
  const handleBulkDownload = async () => {
    const selected = filtered.filter(d => selectedIds.has(d.id) && d.pdfUrl)
    if (selected.length === 0) {
      window.alert('清書済みの文書を選択してください。')
      return
    }
    selected.forEach(doc => {
      const a = document.createElement('a')
      a.href = doc.pdfUrl
      a.download = `${doc.templateName}_${doc.patientName}.pdf`
      a.target = '_blank'
      a.click()
    })
    // DL済みフラグを記録
    const ids = selected.filter(d => !d.downloadedAt).map(d => d.id)
    if (ids.length > 0) {
      await markDocumentsDownloaded(ids)
      router.refresh()
    }
  }

  // 結合DL（pdf-lib）
  const handleMergeDownload = async () => {
    const selected = filtered.filter(d => selectedIds.has(d.id) && d.pdfUrl)
    if (selected.length === 0) {
      window.alert('清書済みの文書を選択してください。')
      return
    }
    setMerging(true)
    try {
      const { PDFDocument } = await import('pdf-lib')
      const mergedPdf = await PDFDocument.create()
      for (const doc of selected) {
        try {
          const response = await fetch(doc.pdfUrl)
          const pdfBytes = await response.arrayBuffer()
          const pdf = await PDFDocument.load(pdfBytes)
          const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
          pages.forEach(page => mergedPdf.addPage(page))
        } catch (e) {
          console.error(`PDF読み込み失敗 (${doc.templateName}):`, e)
        }
      }
      const mergedBytes = await mergedPdf.save() as any
      const blob = new Blob([mergedBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const today = new Date().toISOString().slice(0, 10)
      a.download = `文書一括_${today}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      // DL済みフラグを記録
      const ids = selected.filter(d => !d.downloadedAt).map(d => d.id)
      if (ids.length > 0) {
        await markDocumentsDownloaded(ids)
        router.refresh()
      }
    } catch (e) {
      console.error('PDF結合失敗:', e)
      window.alert('PDF結合に失敗しました')
    } finally {
      setMerging(false)
    }
  }

  // 利用者別グルーピングDL
  const handleGroupedDownload = async () => {
    const selected = filtered.filter(d => selectedIds.has(d.id) && d.pdfUrl)
    if (selected.length === 0) {
      window.alert('清書済みの文書を選択してください。')
      return
    }
    setMerging(true)
    try {
      const { PDFDocument } = await import('pdf-lib')
      // 利用者（患者）でグルーピング
      const grouped = new Map<number, DocumentItem[]>()
      for (const doc of selected) {
        const list = grouped.get(doc.patientId) || []
        list.push(doc)
        grouped.set(doc.patientId, list)
      }

      for (const [patientId, docs] of grouped) {
        const mergedPdf = await PDFDocument.create()
        for (const doc of docs) {
          try {
            const response = await fetch(doc.pdfUrl)
            const pdfBytes = await response.arrayBuffer()
            const pdf = await PDFDocument.load(pdfBytes)
            const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
            pages.forEach(page => mergedPdf.addPage(page))
          } catch (e) {
            console.error(`PDF読み込み失敗 (${doc.templateName}):`, e)
          }
        }
        const mergedBytes = await mergedPdf.save() as any
        const blob = new Blob([mergedBytes], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        const firstDoc = docs[0]
        const dateStr = (firstDoc.visitDate || new Date().toISOString().slice(0, 10)).replace(/-/g, '')
        const fileName = `${dateStr}_${firstDoc.facilityName}_${firstDoc.patientName}_${patientId}.pdf`
        a.download = fileName
        a.click()
        URL.revokeObjectURL(url)
      }

      // DL済みフラグを記録
      const ids = selected.filter(d => !d.downloadedAt).map(d => d.id)
      if (ids.length > 0) {
        await markDocumentsDownloaded(ids)
        router.refresh()
      }
    } catch (e) {
      console.error('グルーピングDL失敗:', e)
      window.alert('グルーピングDLに失敗しました')
    } finally {
      setMerging(false)
    }
  }

  const documentTypeOptions = Object.entries(DOCUMENT_TEMPLATES).map(([id, t]) => ({
    value: id,
    label: t.name,
  }))

  const selectedCount = selectedIds.size

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
              <label className="block text-xs text-gray-600 mb-1">施設</label>
              <select
                value={filterFacility}
                onChange={e => setFilterFacility(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm min-w-[160px]"
              >
                <option value="">すべて</option>
                {facilityOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">期間（必須）</label>
              <div className="flex items-center gap-1">
                <input
                  type="date"
                  value={filterDateFrom}
                  onChange={e => setFilterDateFrom(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1.5 text-sm"
                />
                <span className="text-gray-400 text-xs">〜</span>
                <input
                  type="date"
                  value={filterDateTo}
                  onChange={e => setFilterDateTo(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1.5 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">患者氏名</label>
              <input
                type="text"
                value={filterPatientName}
                onChange={e => setFilterPatientName(e.target.value)}
                placeholder="氏名で検索"
                className="border border-gray-300 rounded px-2 py-1.5 text-sm min-w-[140px]"
              />
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
              <Button size="sm" onClick={handleSelectAll}>
                {selectableIds.size > 0 && [...selectableIds].every(id => selectedIds.has(id)) ? '全解除' : '全選択'}
              </Button>
              <Button size="sm" onClick={handleBulkDownload} disabled={selectedCount === 0}>
                バラバラDL ({selectedCount}件)
              </Button>
              <Button size="sm" onClick={handleMergeDownload} disabled={selectedCount === 0 || merging}>
                {merging ? '結合中...' : `結合DL (${selectedCount}件)`}
              </Button>
              <Button size="sm" onClick={handleGroupedDownload} disabled={selectedCount === 0 || merging}>
                利用者別DL ({selectedCount}件)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 文書一覧 */}
      {!hasDateRange ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            <p className="text-lg mb-2">期間を指定してください</p>
            <p className="text-sm">開始日と終了日を入力すると文書が表示されます。</p>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            <p className="text-lg mb-2">該当する文書がありません</p>
            <p className="text-sm">指定期間内に保存済み文書がないか、フィルタ条件を確認してください。</p>
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
                      checked={selectableIds.size > 0 && [...selectableIds].every(id => selectedIds.has(id))}
                      onChange={handleSelectAll}
                      className="w-4 h-4 accent-emerald-600"
                    />
                  </th>
                  <th className="px-3 py-2 text-left">状態</th>
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
                  <tr
                    key={doc.id}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(HREF('/dental/document-create', { savedDocumentId: doc.id }, query))}
                  >
                    <td className="px-3 py-2" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(doc.id)}
                        onChange={() => handleToggleSelect(doc.id)}
                        className="w-4 h-4 accent-emerald-600"
                        disabled={!doc.pdfUrl}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <StatusBadge doc={doc} />
                    </td>
                    <td className="px-3 py-2 font-medium">{doc.templateName}</td>
                    <td className="px-3 py-2">{doc.patientName}</td>
                    <td className="px-3 py-2">{doc.facilityName}</td>
                    <td className="px-3 py-2">{doc.visitDate}</td>
                    <td className="px-3 py-2 text-gray-500">{new Date(doc.createdAt).toLocaleString('ja-JP')}</td>
                    <td className="px-3 py-2" onClick={e => e.stopPropagation()}>
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
                          <span className="text-gray-400 text-xs">-</span>
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
