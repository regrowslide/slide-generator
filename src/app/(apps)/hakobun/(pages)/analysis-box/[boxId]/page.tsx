'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { Plus, Trash2, Save, X, FileText, ChevronRight, ChevronLeft, ArrowLeft, CheckCircle, Clock, AlertCircle, Loader2, Search, Download } from 'lucide-react'
import useMyNavigation from '@cm/hooks/globalHooks/useMyNavigation'
import Link from 'next/link'
import useModal from '@cm/components/utils/modal/useModal'
import {
  getAnalysisBoxById,
  getAnalysisSessions,
  createAnalysisSession,
  deleteAnalysisSession,
  getBoxRecordsForExport,
} from '../../../_actions/analysis-box-actions'
import type { HakobunAnalysisBox, HakobunAnalysisSession, HakobunAnalysisRecord, AnalysisSessionStatus } from '../../../types'

interface SessionFormData {
  name: string
}

const initialFormData: SessionFormData = {
  name: '',
}

const PAGE_SIZE = 10

// CSV生成ユーティリティ（createdAt順・全体通し連番対応）
const generateCsvContent = (records: HakobunAnalysisRecord[], useCreatedAtOrder = false): string => {
  // ヘッダー
  const headers = ['通し番号', '枝番', 'ステージ', '感情', '一般カテゴリ', 'カテゴリ', 'トピック', '原文']

  // createdAt順でソートする場合
  const sortedRecords = useCreatedAtOrder
    ? [...records].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    : records

  // 原文ごとにグループ化して通し番号を付与
  const rawTextGroups = new Map<string, HakobunAnalysisRecord[]>()
  sortedRecords.forEach(record => {
    const key = record.rawText
    const existing = rawTextGroups.get(key) || []
    existing.push(record)
    rawTextGroups.set(key, existing)
  })

  const rows: string[][] = []
  let mainIndex = 0

  rawTextGroups.forEach((groupRecords) => {
    mainIndex++
    groupRecords.forEach((record, subIndex) => {
      // 修正データがあれば修正データ、なければAI結果を使用
      const stage = record.feedbackStage || record.analysisStage || ''
      const sentiment = record.feedbackSentiment || record.analysisSentiment || ''
      const generalCategory = record.feedbackGeneralCategory || record.analysisGeneralCategory || ''
      const category = record.feedbackCategory || record.analysisCategory || ''
      const topic = record.feedbackTopic || record.analysisTopic || ''
      const rawText = record.rawText

      rows.push([
        String(mainIndex),
        String(subIndex + 1),
        stage,
        sentiment,
        generalCategory,
        category,
        topic,
        rawText,
      ])
    })
  })

  // CSVエスケープ関数
  const escapeCsvCell = (value: string): string => {
    if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  // CSV文字列生成
  const csvLines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map(row => row.map(escapeCsvCell).join(',')),
  ]

  return csvLines.join('\n')
}

// CSVダウンロード関数
const downloadCsv = (content: string, filename: string) => {
  const bom = '\uFEFF' // UTF-8 BOM for Excel
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const getStatusBadge = (status: AnalysisSessionStatus) => {
  switch (status) {
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
          <Clock className="w-3 h-3" />
          待機中
        </span>
      )
    case 'analyzing':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-600">
          <Loader2 className="w-3 h-3 animate-spin" />
          分析中
        </span>
      )
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-600">
          <CheckCircle className="w-3 h-3" />
          完了
        </span>
      )
    case 'error':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-100 text-red-600">
          <AlertCircle className="w-3 h-3" />
          エラー
        </span>
      )
    default:
      return null
  }
}

export default function AnalysisBoxDetailPage() {
  const params = useParams()
  const boxId = Number(params?.boxId)
  const { getHref } = useMyNavigation()

  const [box, setBox] = useState<HakobunAnalysisBox | null>(null)
  const [sessions, setSessions] = useState<(HakobunAnalysisSession & { _count?: { records: number } })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<SessionFormData>(initialFormData)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // モーダル用
  const formModal = useModal()

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  // 分析BOX詳細取得
  const fetchBox = useCallback(async () => {
    if (!boxId) return
    try {
      const result = await getAnalysisBoxById(boxId)
      if (result.success && result.data) {
        setBox(result.data as any)
      }
    } catch (error) {
      console.error('BOX取得エラー:', error)
    }
  }, [boxId])

  // SESSION一覧取得
  const fetchSessions = useCallback(async () => {
    if (!boxId) return
    setIsLoading(true)
    try {
      const result = await getAnalysisSessions({
        analysisBoxId: boxId,
        search: searchQuery || undefined,
        take: PAGE_SIZE,
        skip: (currentPage - 1) * PAGE_SIZE,
      })
      if (result.success && result.data) {
        setSessions(result.data.sessions as any)
        setTotalCount(result.data.totalCount)
      }
    } finally {
      setIsLoading(false)
    }
  }, [boxId, searchQuery, currentPage])

  useEffect(() => {
    fetchBox()
  }, [fetchBox])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  // 検索実行
  const handleSearch = () => {
    setCurrentPage(1)
    setSearchQuery(searchInput)
  }

  // 新規追加モーダルを開く
  const openAddModal = () => {
    setFormData(initialFormData)
    formModal.handleOpen()
  }

  // SESSION作成
  const handleSave = async () => {
    if (!formData.name) {
      alert('名前を入力してください')
      return
    }

    try {
      await createAnalysisSession({
        name: formData.name,
        analysisBoxId: boxId,
      })
      formModal.handleClose()
      setFormData(initialFormData)
      fetchSessions()
    } catch (error) {
      alert('保存に失敗しました')
    }
  }

  // SESSION削除
  const handleDelete = async (id: number) => {
    if (!confirm('このSESSIONを削除しますか？\n関連する分析結果もすべて削除されます。')) return

    try {
      await deleteAnalysisSession(id)
      fetchSessions()
    } catch (error) {
      alert('削除に失敗しました')
    }
  }

  // CSVダウンロード（BOX全体）
  const handleDownloadCsv = useCallback(async () => {
    try {
      const result = await getBoxRecordsForExport(boxId)
      if (!result.success || !result.data) {
        alert('データ取得に失敗しました')
        return
      }

      if (result.data.length === 0) {
        alert('出力するデータがありません')
        return
      }

      const csvContent = generateCsvContent(result.data as HakobunAnalysisRecord[])
      const filename = `分析結果_${box?.name || 'box'}_全SESSION_${new Date().toISOString().split('T')[0]}.csv`
      downloadCsv(csvContent, filename)
    } catch (error) {
      console.error('CSVダウンロードエラー:', error)
      alert('CSVダウンロードに失敗しました')
    }
  }, [boxId, box?.name])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    )
  }

  if (!box) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <p className="text-gray-500">分析BOXが見つかりません</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <C_Stack className="max-w-4xl mx-auto gap-6">
        {/* パンくずリスト */}
        <R_Stack className="items-center gap-2 text-sm">
          <Link href={getHref('/hakobun/analysis-box')} className="text-blue-600 hover:underline flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            分析BOX一覧
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">{box.name}</span>
        </R_Stack>

        {/* ヘッダー */}
        <R_Stack className="justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{box.name}</h1>
            {box.description && (
              <p className="text-sm text-gray-500 mt-1">{box.description}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              SESSION: {sessions.length}件
            </p>
          </div>
          <R_Stack className="gap-2">
            <button
              onClick={handleDownloadCsv}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              title="全セッションのCSVをダウンロード"
            >
              <Download className="w-4 h-4" />
              CSV出力
            </button>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              新規SESSION
            </button>
          </R_Stack>
        </R_Stack>

        {/* 検索 */}
        <R_Stack className="gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="SESSION名で検索..."
            className="flex-1 p-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-1"
          >
            <Search className="w-4 h-4" />
            検索
          </button>
        </R_Stack>

        {/* SESSION一覧 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">SESSION一覧 ({totalCount}件)</h2>
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">SESSIONがまだ登録されていません</p>
              <p className="text-gray-400 text-sm mt-1">「新規SESSION」ボタンから追加してください</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {sessions.map(session => {
                const recordCount = session._count?.records || 0

                return (
                  <div
                    key={session.id}
                    className="border rounded-lg p-4 transition-colors border-gray-200 hover:bg-gray-50"
                  >
                    <Link
                      href={getHref(`/hakobun/analysis-box/${boxId}/session/${session.id}`)}
                      className="flex items-center gap-4 flex-1"
                    >
                      <R_Stack className="justify-between items-center w-full">
                        <R_Stack className="items-center gap-4">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-100">
                            <FileText className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <R_Stack className="items-center gap-2">
                              <p className="font-medium text-gray-900">{session.name}</p>
                              {getStatusBadge(session.status as AnalysisSessionStatus)}
                            </R_Stack>
                            <p className="text-xs text-gray-400 mt-1">
                              レコード: {recordCount}件
                              {session.analyzedAt && (
                                <> / 分析完了: {new Date(session.analyzedAt).toLocaleString('ja-JP')}</>
                              )}
                            </p>
                            {session.errorMessage && (
                              <p className="text-xs text-red-500 mt-1">{session.errorMessage}</p>
                            )}
                          </div>

                        </R_Stack>
                        <R_Stack className="gap-2 items-center">
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleDelete(session.id)
                            }}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {/* <Link href={getHref(`/hakobun/analysis-box/${boxId}/session/${session.id}`)}> */}
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                          {/* </Link> */}
                        </R_Stack>
                      </R_Stack>
                    </Link>
                  </div>
                )
              })}
            </div>
          )}

          {/* ページネーション */}
          {totalPages > 1 && (
            <R_Stack className="justify-center items-center gap-4 mt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                前へ
              </button>
              <span className="text-sm text-gray-600">
                {currentPage} / {totalPages} ページ
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                次へ
                <ChevronRight className="w-4 h-4" />
              </button>
            </R_Stack>
          )}
        </div>
      </C_Stack>

      {/* SESSION追加モーダル */}
      <formModal.Modal
        open={!!formModal.open}
        setopen={formModal.setopen}
        title="新規SESSION"
      >
        <C_Stack className="gap-4 p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SESSION名 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="例: バッチ1、前半データ"
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <R_Stack className="justify-end gap-2">
            <button
              onClick={() => {
                formModal.handleClose()
                setFormData(initialFormData)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
            >
              <Save className="w-4 h-4" />
              保存
            </button>
          </R_Stack>
        </C_Stack>
      </formModal.Modal>
    </div>
  )
}
