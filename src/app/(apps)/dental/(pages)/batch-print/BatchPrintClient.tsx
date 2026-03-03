'use client'

import { useState, useMemo } from 'react'
import { Button } from '@cm/components/styles/common-components/Button'
import { Card, CardContent } from '@shadcn/ui/card'
import type { Facility, Patient } from '@app/(apps)/dental/lib/types'

type DocumentItem = {
  id: number
  patientId: number
  patientName: string
  facilityId: number
  facilityName: string
  templateId: string
  templateName: string
  pdfUrl: string
  createdAt: string
  visitDate: string
}

type Props = {
  documents: DocumentItem[]
  facilities: Facility[]
  patients: Patient[]
}

const BatchPrintClient = ({ documents, facilities, patients }: Props) => {
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [filterFacility, setFilterFacility] = useState('')
  const [filterPatient, setFilterPatient] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [merging, setMerging] = useState(false)

  const filtered = useMemo(() => {
    return documents.filter(doc => {
      if (filterDateFrom && doc.visitDate < filterDateFrom) return false
      if (filterDateTo && doc.visitDate > filterDateTo) return false
      if (filterFacility && doc.facilityId !== Number(filterFacility)) return false
      if (filterPatient && doc.patientId !== Number(filterPatient)) return false
      return true
    })
  }, [documents, filterDateFrom, filterDateTo, filterFacility, filterPatient])

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

  /** pdf-lib を使用してPDFを結合してダウンロード */
  const handleMergePrint = async () => {
    const selected = filtered.filter(d => selectedIds.has(d.id) && d.pdfUrl)
    if (selected.length === 0) {
      window.alert('PDF保存済みの文書を選択してください。')
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
      a.download = `一括印刷_${today}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('PDF結合失敗:', e)
      window.alert('PDF結合に失敗しました')
    } finally {
      setMerging(false)
    }
  }

  // 患者リスト（フィルタ用: 文書に存在する患者のみ）
  const patientOptions = useMemo(() => {
    const ids = new Set(documents.map(d => d.patientId))
    return patients.filter(p => ids.has(p.id))
  }, [documents, patients])

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-4">履歴・一括印刷</h1>

      {/* フィルタ */}
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs text-gray-600 mb-1">開始日</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={e => setFilterDateFrom(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">終了日</label>
              <input
                type="date"
                value={filterDateTo}
                onChange={e => setFilterDateTo(e.target.value)}
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
              <label className="block text-xs text-gray-600 mb-1">患者</label>
              <select
                value={filterPatient}
                onChange={e => setFilterPatient(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm"
              >
                <option value="">すべて</option>
                {patientOptions.map(p => (
                  <option key={p.id} value={p.id}>{p.lastName} {p.firstName}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 操作ボタン */}
      <div className="flex gap-2 mb-4">
        <Button size="sm" onClick={handleSelectAll}>
          {selectedIds.size === filtered.length && filtered.length > 0 ? '全解除' : '全選択'}
        </Button>
        <Button
          size="sm"
          onClick={handleMergePrint}
          disabled={selectedIds.size === 0 || merging}
        >
          {merging ? '結合中...' : `一括印刷 (${selectedIds.size}件を1つのPDFに結合)`}
        </Button>
      </div>

      {/* 文書一覧 */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            <p className="text-lg mb-2">対象文書がありません</p>
            <p className="text-sm">フィルタ条件を変更してください。</p>
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
                  <th className="px-3 py-2 text-left">作成日</th>
                  <th className="px-3 py-2 text-left w-16">PDF</th>
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
                        disabled={!doc.pdfUrl}
                      />
                    </td>
                    <td className="px-3 py-2 font-medium">{doc.templateName}</td>
                    <td className="px-3 py-2">{doc.patientName}</td>
                    <td className="px-3 py-2">{doc.facilityName}</td>
                    <td className="px-3 py-2">{doc.visitDate}</td>
                    <td className="px-3 py-2 text-gray-500">{doc.createdAt}</td>
                    <td className="px-3 py-2">
                      {doc.pdfUrl ? (
                        <a href={doc.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                          表示
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs">なし</span>
                      )}
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

export default BatchPrintClient
