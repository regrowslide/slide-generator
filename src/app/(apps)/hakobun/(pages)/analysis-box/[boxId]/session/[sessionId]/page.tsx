'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import {
  ArrowLeft,
  Upload,
  Play,
  Save,
  AlertCircle,
  Loader2,
  Edit2,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
  Sparkles,
  BookOpen,
  Download,
} from 'lucide-react'
import Link from 'next/link'
import {
  getAnalysisSessionById,
  getAnalysisRecords,
  updateAnalysisSessionStatus,
  createAnalysisRecords,
  updateAnalysisRecordsFeedback,
  getSessionRecordsForExport,
} from '../../../../../_actions/analysis-box-actions'
import type {
  HakobunAnalysisSession,
  HakobunAnalysisRecord,
  SentimentType,
  UpdateAnalysisRecordFeedbackInput,
} from '../../../../../types'
import useSelectedClient from '../../../../../(globalHooks)/useSelectedClient'
import useCategoryManager from '../../../../../hooks/useCategoryManager'
import useModal from '@cm/components/utils/modal/useModal'
import useMyNavigation from '@cm/hooks/globalHooks/useMyNavigation'
import { Popover, PopoverContent, PopoverTrigger } from '@shadcn/ui/popover'
import { BarChart3, Info } from 'lucide-react'

// ステージ選択肢
const STAGE_OPTIONS = ['認知', '興味', '検討', '購入', '利用', 'リピート', 'その他']

// 感情選択肢
const SENTIMENT_OPTIONS: SentimentType[] = ['好意的', '不満', 'リクエスト', 'その他']

// ページネーション
const RECORD_PAGE_SIZE = 100

// CSV生成ユーティリティ
const generateCsvContent = (records: HakobunAnalysisRecord[]): string => {
  // ヘッダー
  const headers = ['通し番号', '枝番', 'ステージ', '感情', '一般カテゴリ', 'カテゴリ', 'トピック', '原文']

  // 原文ごとにグループ化して通し番号を付与
  const rawTextGroups = new Map<string, HakobunAnalysisRecord[]>()
  records.forEach(record => {
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

interface RecordEditState {
  feedbackStage: string
  feedbackSentiment: string
  feedbackGeneralCategory: string
  feedbackCategory: string
  feedbackTopic: string
  reviewerComment: string
  isModified: boolean
}

// カテゴリ追加モーダルの状態
interface CategoryModalState {
  type: 'general' | 'category'
  recordId: number
  initialName?: string
}

// 原文表示モーダルの状態
interface RawTextModalState {
  rawText: string
  recordIndex: number
}

export default function AnalysisSessionDetailPage() {
  const params = useParams()
  const boxId = Number(params?.boxId)
  const sessionId = Number(params?.sessionId)
  const { getHref } = useMyNavigation()

  const { selectedClient } = useSelectedClient()
  const {
    mergedGeneralCategories,
    createGeneralCategory,
    createCategory,
  } = useCategoryManager({ selectedClient })

  // カテゴリ追加モーダル
  const categoryModal = useModal<CategoryModalState>()
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDescription, setNewCategoryDescription] = useState('')

  // 原文表示モーダル
  const rawTextModal = useModal<RawTextModalState>()

  const [session, setSession] = useState<HakobunAnalysisSession | null>(null)
  const [records, setRecords] = useState<HakobunAnalysisRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const totalPages = Math.ceil(totalCount / RECORD_PAGE_SIZE)

  // CSV/分析関連
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [csvTexts, setCsvTexts] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [allowCategoryGeneration, setAllowCategoryGeneration] = useState(false) // デフォルトはOFF

  // フィードバック編集
  const [editStates, setEditStates] = useState<Map<number, RecordEditState>>(new Map())
  const [isSaving, setIsSaving] = useState(false)

  // 集計統計（useMemo）
  const statistics = useMemo(() => {
    if (records.length === 0) return null

    // フィードバックがあればそちらを優先
    const getValue = (record: HakobunAnalysisRecord, feedbackKey: keyof HakobunAnalysisRecord, analysisKey: keyof HakobunAnalysisRecord) => {
      return (record[feedbackKey] || record[analysisKey] || '') as string
    }

    // 原文のユニーク数
    const uniqueRawTexts = new Set(records.map(r => r.rawText))

    // 各項目の集計
    const countByField = (getter: (r: HakobunAnalysisRecord) => string) => {
      const counts = new Map<string, number>()
      records.forEach(r => {
        const value = getter(r) || '(未設定)'
        counts.set(value, (counts.get(value) || 0) + 1)
      })
      return Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }))
    }

    return {
      rawTextCount: uniqueRawTexts.size,
      topicCount: records.length,
      stages: countByField(r => getValue(r, 'feedbackStage', 'analysisStage')),
      sentiments: countByField(r => getValue(r, 'feedbackSentiment', 'analysisSentiment')),
      generalCategories: countByField(r => getValue(r, 'feedbackGeneralCategory', 'analysisGeneralCategory')),
      categories: countByField(r => getValue(r, 'feedbackCategory', 'analysisCategory')),
    }
  }, [records])

  // SESSION詳細取得
  const fetchSession = useCallback(async () => {
    if (!sessionId) return
    try {
      const result = await getAnalysisSessionById(sessionId)
      if (result.success && result.data) {
        setSession(result.data as any)
      }
    } catch (error) {
      console.error('SESSION取得エラー:', error)
    }
  }, [sessionId])

  // レコード一覧取得
  const fetchRecords = useCallback(async () => {
    if (!sessionId) return
    setIsLoading(true)
    try {
      const result = await getAnalysisRecords({
        sessionId,
        take: RECORD_PAGE_SIZE,
        skip: (currentPage - 1) * RECORD_PAGE_SIZE,
      })
      if (result.success && result.data) {
        setRecords(result.data.records as HakobunAnalysisRecord[])
        setTotalCount(result.data.totalCount)

        // 編集状態を初期化
        const initialEditStates = new Map<number, RecordEditState>()
        result.data.records.forEach((record: HakobunAnalysisRecord) => {
          initialEditStates.set(record.id, {
            feedbackStage: record.feedbackStage || record.analysisStage || '',
            feedbackSentiment: record.feedbackSentiment || record.analysisSentiment || '',
            feedbackGeneralCategory: record.feedbackGeneralCategory || record.analysisGeneralCategory || '',
            feedbackCategory: record.feedbackCategory || record.analysisCategory || '',
            feedbackTopic: record.feedbackTopic || record.analysisTopic || '',
            reviewerComment: record.reviewerComment || '',
            isModified: record.isModified,
          })
        })
        setEditStates(initialEditStates)
      }
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, currentPage])

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  // CSVパース関数（ダブルクォートで囲まれた複数行セルに対応）
  const parseCSV = useCallback((text: string): string[][] => {
    const rows: string[][] = []
    let currentRow: string[] = []
    let currentCell = ''
    let insideQuotes = false

    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      const nextChar = text[i + 1]

      if (insideQuotes) {
        if (char === '"') {
          if (nextChar === '"') {
            // エスケープされたダブルクォート
            currentCell += '"'
            i++ // 次の"をスキップ
          } else {
            // クォート終了
            insideQuotes = false
          }
        } else {
          currentCell += char
        }
      } else {
        if (char === '"') {
          // クォート開始
          insideQuotes = true
        } else if (char === ',') {
          // セル区切り
          currentRow.push(currentCell.trim())
          currentCell = ''
        } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
          // 行区切り
          currentRow.push(currentCell.trim())
          if (currentRow.some(cell => cell.length > 0)) {
            rows.push(currentRow)
          }
          currentRow = []
          currentCell = ''
          if (char === '\r') i++ // \r\nの場合は\nもスキップ
        } else if (char !== '\r') {
          currentCell += char
        }
      }
    }

    // 最後のセルと行を追加
    if (currentCell || currentRow.length > 0) {
      currentRow.push(currentCell.trim())
      if (currentRow.some(cell => cell.length > 0)) {
        rows.push(currentRow)
      }
    }

    return rows
  }, [])

  // CSVファイル読み込み
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const rows = parseCSV(text)

      // ヘッダー行をスキップして1列目を取得
      const texts: string[] = []
      for (let i = 1; i < rows.length; i++) {
        const firstCell = rows[i][0]
        if (firstCell && firstCell.trim()) {
          texts.push(firstCell.trim())
        }
      }
      setCsvTexts(texts)
    } catch (error) {
      alert('CSVファイルの読み込みに失敗しました')
    }

    // input要素をリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [parseCSV])

  // 分析実行
  const handleAnalyze = useCallback(async () => {

    if (!selectedClient?.clientId || csvTexts.length === 0) {
      alert('CSVデータがありません')
      return
    }

    setIsAnalyzing(true)
    setAnalysisError(null)

    try {
      // ステータスを「分析中」に更新
      await updateAnalysisSessionStatus(sessionId, 'analyzing')

      // 一括分析API呼び出し
      const response = await fetch('/api/hakobun/batch-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: selectedClient.clientId,
          texts: csvTexts,
          allow_category_generation: allowCategoryGeneration,
        }),
      })

      const data = await response.json()

      if (data.success && data.results) {
        // 分析結果をレコードとして保存
        const recordInputs = data.results.flatMap((result: any, resultIndex: number) =>
          result.extracts.map((extract: any) => ({
            rawText: extract.raw_text || csvTexts[resultIndex] || '',
            analysisStage: extract.stage || '',
            analysisSentiment: extract.sentiment || '',
            analysisGeneralCategory: extract.general_category || '',
            analysisCategory: extract.category || '',
            analysisTopic: extract.sentence || '',
            sessionId,
          }))
        )

        await createAnalysisRecords(recordInputs)

        // 再取得
        await fetchSession()
        await fetchRecords()
        setCsvTexts([])
      } else {
        setAnalysisError(data.error || '分析に失敗しました')
        await updateAnalysisSessionStatus(sessionId, 'error', data.error)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '分析に失敗しました'
      setAnalysisError(errorMessage)
      await updateAnalysisSessionStatus(sessionId, 'error', errorMessage)
    } finally {
      setIsAnalyzing(false)
    }
  }, [selectedClient?.clientId, csvTexts, sessionId, fetchSession, fetchRecords, allowCategoryGeneration])

  // 編集状態更新
  const updateEditState = useCallback((recordId: number, updates: Partial<RecordEditState>) => {
    setEditStates((prev) => {
      const newMap = new Map(prev)
      const current = newMap.get(recordId)
      if (current) {
        const updated = { ...current, ...updates, isModified: true }
        newMap.set(recordId, updated)
      }
      return newMap
    })
  }, [])

  // 単一レコードの自動保存（onBlur用）
  const handleAutoSave = useCallback(async (recordId: number) => {
    const state = editStates.get(recordId)
    if (!state?.isModified) return

    try {
      const result = await updateAnalysisRecordsFeedback([{
        id: recordId,
        feedback: {
          feedbackStage: state.feedbackStage || undefined,
          feedbackSentiment: state.feedbackSentiment || undefined,
          feedbackGeneralCategory: state.feedbackGeneralCategory || undefined,
          feedbackCategory: state.feedbackCategory || undefined,
          feedbackTopic: state.feedbackTopic || undefined,
          reviewerComment: state.reviewerComment || undefined,
          isModified: true,
        } as UpdateAnalysisRecordFeedbackInput,
      }])

      if (result.success) {
        // 保存成功後、isModifiedをfalseに更新
        setEditStates((prev) => {
          const newMap = new Map(prev)
          const current = newMap.get(recordId)
          if (current) {
            newMap.set(recordId, { ...current, isModified: false })
          }
          return newMap
        })
      }
    } catch (error) {
      console.error('Auto-save error:', error)
    }
  }, [editStates])

  // // 一括保存
  // const handleSaveAll = useCallback(async () => {
  //   const modifiedRecords = records.filter((record) => {
  //     const state = editStates.get(record.id)
  //     return state?.isModified
  //   })

  //   if (modifiedRecords.length === 0) {
  //     alert('変更がありません')
  //     return
  //   }

  //   setIsSaving(true)
  //   try {
  //     const updates = modifiedRecords.map((record) => {
  //       const state = editStates.get(record.id)!
  //       return {
  //         id: record.id,
  //         feedback: {
  //           feedbackStage: state.feedbackStage || undefined,
  //           feedbackSentiment: state.feedbackSentiment || undefined,
  //           feedbackGeneralCategory: state.feedbackGeneralCategory || undefined,
  //           feedbackCategory: state.feedbackCategory || undefined,
  //           feedbackTopic: state.feedbackTopic || undefined,
  //           reviewerComment: state.reviewerComment || undefined,
  //           isModified: true,
  //         } as UpdateAnalysisRecordFeedbackInput,
  //       }
  //     })

  //     const result = await updateAnalysisRecordsFeedback(updates)
  //     if (result.success) {
  //       alert(`${result.data?.count || 0}件のフィードバックを保存しました`)
  //       fetchRecords()
  //     } else {
  //       alert(`保存に失敗しました: ${result.error}`)
  //     }
  //   } catch (error) {
  //     alert('保存に失敗しました')
  //   } finally {
  //     setIsSaving(false)
  //   }
  // }, [records, editStates, fetchRecords])

  // CSVダウンロード（SESSION単位）
  const handleDownloadCsv = useCallback(async () => {
    try {
      const result = await getSessionRecordsForExport(sessionId)
      if (!result.success || !result.data) {
        alert('データ取得に失敗しました')
        return
      }

      const csvContent = generateCsvContent(result.data as HakobunAnalysisRecord[])
      const filename = `分析結果_${session?.name || 'session'}_${new Date().toISOString().split('T')[0]}.csv`
      downloadCsv(csvContent, filename)
    } catch (error) {
      console.error('CSVダウンロードエラー:', error)
      alert('CSVダウンロードに失敗しました')
    }
  }, [sessionId, session?.name])

  // 感情の色
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case '好意的':
        return 'bg-green-100 text-green-800'
      case '不満':
        return 'bg-red-100 text-red-800'
      case 'リクエスト':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // フィードバックセルのスタイル（変更あり: 黄色ハイライト、変更なし: 薄いスタイル）
  const getFeedbackCellStyle = (feedbackValue: string, analysisValue: string | null | undefined) => {
    const hasChanged = feedbackValue !== (analysisValue || '')
    if (hasChanged) {
      return 'bg-yellow-100'
    }
    return 'opacity-50'
  }

  // 原文を省略表示（最大行数と文字数を制限）
  const truncateText = (text: string, maxChars: number = 80, maxLines: number = 2) => {
    const lines = text.split('\n').slice(0, maxLines)
    let truncated = lines.join('\n')
    if (truncated.length > maxChars) {
      truncated = truncated.slice(0, maxChars) + '...'
    } else if (text.split('\n').length > maxLines || text.length > truncated.length) {
      truncated += '...'
    }
    return truncated
  }

  // カテゴリ追加モーダルを開く
  const openCategoryModal = useCallback((type: 'general' | 'category', recordId: number, initialName?: string) => {
    setNewCategoryName(initialName || '')
    setNewCategoryDescription('')
    categoryModal.handleOpen({ type, recordId, initialName })
  }, [categoryModal])

  // 新規一般カテゴリを追加
  const handleCreateGeneralCategory = useCallback(() => {
    if (!newCategoryName.trim()) {
      alert('カテゴリ名を入力してください')
      return
    }
    const success = createGeneralCategory(newCategoryName, newCategoryDescription)
    if (success && categoryModal.open) {
      updateEditState(categoryModal.open.recordId, { feedbackGeneralCategory: newCategoryName })
      categoryModal.handleClose()
      setNewCategoryName('')
      setNewCategoryDescription('')
    }
  }, [newCategoryName, newCategoryDescription, createGeneralCategory, categoryModal, updateEditState])

  // 新規詳細カテゴリを追加
  const handleCreateCategory = useCallback(() => {
    if (!newCategoryName.trim()) {
      alert('カテゴリ名を入力してください')
      return
    }
    if (!categoryModal.open) return
    const state = editStates.get(categoryModal.open.recordId)
    if (!state?.feedbackGeneralCategory) {
      alert('先に一般カテゴリを選択してください')
      return
    }
    const success = createCategory(state.feedbackGeneralCategory, newCategoryName, newCategoryDescription)
    if (success) {
      updateEditState(categoryModal.open.recordId, { feedbackCategory: newCategoryName })
      categoryModal.handleClose()
      setNewCategoryName('')
      setNewCategoryDescription('')
    }
  }, [newCategoryName, newCategoryDescription, createCategory, categoryModal, editStates, updateEditState])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <p className="text-gray-500">SESSIONが見つかりません</p>
      </div>
    )
  }

  const hasRecords = totalCount > 0
  const hasModifiedRecords = Array.from(editStates.values()).some((s) => s.isModified)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <C_Stack className="max-w-[1600px] mx-auto gap-6">
        {/* パンくずリスト */}
        <R_Stack className="items-center gap-2 text-sm">
          <Link href={getHref('/hakobun/analysis-box')} className="text-blue-600 hover:underline">
            分析BOX一覧
          </Link>
          <span className="text-gray-400">/</span>
          <Link
            href={getHref(`/hakobun/analysis-box/${boxId}`)}
            className="text-blue-600 hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            {(session as any).analysisBox?.name || '分析BOX'}
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">{session.name}</span>
        </R_Stack>

        {/* ヘッダー */}
        <R_Stack className="justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{session.name}</h1>
            <p className="text-sm text-gray-500 mt-1">
              レコード: {totalCount}件
              {session.analyzedAt && (
                <> / 分析完了: {new Date(session.analyzedAt).toLocaleString('ja-JP')}</>
              )}
            </p>
          </div>
          <R_Stack className="gap-2">
            {hasRecords && (
              <button
                onClick={handleDownloadCsv}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                CSV出力
              </button>
            )}
            {/* {hasRecords && hasModifiedRecords && (
              <button
                onClick={handleSaveAll}
                disabled={isSaving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:bg-gray-400"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                フィードバック一括保存
              </button>
            )} */}
          </R_Stack>
        </R_Stack>

        {/* CSVアップロード（レコードがない場合） */}
        {!hasRecords && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">CSVアップロード</h2>
            <C_Stack className="gap-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="cursor-pointer inline-flex flex-col items-center gap-2"
                >
                  <Upload className="w-12 h-12 text-gray-400" />
                  <span className="text-gray-600">CSVファイルをクリックして選択</span>
                  <span className="text-sm text-gray-400">1列目に「感想」データが含まれるCSV</span>
                </label>
              </div>

              {csvTexts.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <R_Stack className="justify-between items-center mb-2">
                    <p className="text-sm font-medium text-gray-700">
                      読み込んだデータ: {csvTexts.length}件
                    </p>
                    <button
                      onClick={() => setCsvTexts([])}
                      className="text-sm text-gray-500 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </R_Stack>
                  <div className="max-h-40 overflow-y-auto text-sm text-gray-600">
                    {csvTexts.slice(0, 5).map((text, i) => (
                      <p key={i} className="truncate py-1 border-b border-gray-200">
                        {i + 1}. {text}
                      </p>
                    ))}
                    {csvTexts.length > 5 && (
                      <p className="text-gray-400 pt-2">...他 {csvTexts.length - 5}件</p>
                    )}
                  </div>
                </div>
              )}

              {analysisError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <R_Stack className="items-center gap-2 text-red-600">
                    <AlertCircle className="w-5 h-5" />
                    <span>{analysisError}</span>
                  </R_Stack>
                </div>
              )}

              {/* 分析オプション */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">分析オプション</h3>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowCategoryGeneration}
                      onChange={(e) => setAllowCategoryGeneration(e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <R_Stack className="items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-medium text-gray-800">新規カテゴリの自動提案を許可</span>
                      </R_Stack>
                      <p className="text-xs text-gray-500 mt-1">
                        マスタに該当するカテゴリがない場合に、AIが新しいカテゴリを提案します。
                        提案されたカテゴリは分析後に確認・採用できます。
                      </p>
                    </div>
                  </label>
                  <div className={`text-xs p-2 rounded ${allowCategoryGeneration ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                    <R_Stack className="items-center gap-2">
                      {allowCategoryGeneration ? (
                        <>
                          <Sparkles className="w-3 h-3" />
                          <span>既存カテゴリを優先しつつ、必要に応じて新規カテゴリを提案します</span>
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-3 h-3" />
                          <span>マスタカテゴリのみを使用します（新規カテゴリは生成されません）</span>
                        </>
                      )}
                    </R_Stack>
                  </div>
                </div>
              </div>

              <R_Stack className="justify-end">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || csvTexts.length === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-400"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      分析中...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      分析開始
                    </>
                  )}
                </button>
              </R_Stack>
            </C_Stack>
          </div>
        )}

        {/* 集計サマリー */}
        {hasRecords && statistics && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <R_Stack className="items-center gap-2 mb-3">
              <BarChart3 className="w-5 h-5 text-gray-600" />
              <h2 className="text-base font-bold text-gray-800">集計サマリー</h2>
            </R_Stack>
            <div className="flex flex-wrap gap-3">
              {/* 原文件数 */}
              <div className="bg-gray-50 px-3 py-2 rounded-lg">
                <span className="text-xs text-gray-500">原文</span>
                <p className="text-lg font-bold text-gray-800">{statistics.rawTextCount}件</p>
              </div>
              {/* トピック件数 */}
              <div className="bg-gray-50 px-3 py-2 rounded-lg">
                <span className="text-xs text-gray-500">トピック</span>
                <p className="text-lg font-bold text-gray-800">{statistics.topicCount}件</p>
              </div>
              {/* ステージ */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors text-left">
                    <R_Stack className="items-center gap-1">
                      <span className="text-xs text-blue-600">ステージ</span>
                      <Info className="w-3 h-3 text-blue-400" />
                    </R_Stack>
                    <p className="text-lg font-bold text-blue-800">{statistics.stages.length}種</p>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2">
                  <p className="text-xs font-medium text-gray-600 mb-2">ステージ別件数</p>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {statistics.stages.map(({ name, count }) => (
                      <R_Stack key={name} className="justify-between text-sm">
                        <span className="text-gray-700">{name}</span>
                        <span className="text-gray-500 font-medium">{count}件</span>
                      </R_Stack>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              {/* 感情 */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="bg-green-50 px-3 py-2 rounded-lg hover:bg-green-100 transition-colors text-left">
                    <R_Stack className="items-center gap-1">
                      <span className="text-xs text-green-600">感情</span>
                      <Info className="w-3 h-3 text-green-400" />
                    </R_Stack>
                    <p className="text-lg font-bold text-green-800">{statistics.sentiments.length}種</p>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2">
                  <p className="text-xs font-medium text-gray-600 mb-2">感情別件数</p>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {statistics.sentiments.map(({ name, count }) => (
                      <R_Stack key={name} className="justify-between text-sm">
                        <span className={`px-2 py-0.5 rounded ${getSentimentColor(name)}`}>{name}</span>
                        <span className="text-gray-500 font-medium">{count}件</span>
                      </R_Stack>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              {/* 一般カテゴリ */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="bg-purple-50 px-3 py-2 rounded-lg hover:bg-purple-100 transition-colors text-left">
                    <R_Stack className="items-center gap-1">
                      <span className="text-xs text-purple-600">一般カテゴリ</span>
                      <Info className="w-3 h-3 text-purple-400" />
                    </R_Stack>
                    <p className="text-lg font-bold text-purple-800">{statistics.generalCategories.length}種</p>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-2">
                  <p className="text-xs font-medium text-gray-600 mb-2">一般カテゴリ別件数</p>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {statistics.generalCategories.map(({ name, count }) => (
                      <R_Stack key={name} className="justify-between text-sm">
                        <span className="text-gray-700 truncate flex-1">{name}</span>
                        <span className="text-gray-500 font-medium ml-2">{count}件</span>
                      </R_Stack>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              {/* カテゴリ */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="bg-amber-50 px-3 py-2 rounded-lg hover:bg-amber-100 transition-colors text-left">
                    <R_Stack className="items-center gap-1">
                      <span className="text-xs text-amber-600">カテゴリ</span>
                      <Info className="w-3 h-3 text-amber-400" />
                    </R_Stack>
                    <p className="text-lg font-bold text-amber-800">{statistics.categories.length}種</p>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-2">
                  <p className="text-xs font-medium text-gray-600 mb-2">カテゴリ別件数</p>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {statistics.categories.map(({ name, count }) => (
                      <R_Stack key={name} className="justify-between text-sm">
                        <span className="text-gray-700 truncate flex-1">{name}</span>
                        <span className="text-gray-500 font-medium ml-2">{count}件</span>
                      </R_Stack>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        {/* 分析結果テーブル */}
        {hasRecords && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">分析結果 / フィードバック ({totalCount}件)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-600 w-8">#</th>

                    <th className="px-3 py-2 text-left font-medium text-gray-600 w-[400px]">原文</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600 w-[320px]">トピック</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600 w-24">ステージ</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600 w-24">感情</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600 w-32">一般カテゴリ</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600 w-40">カテゴリ</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => {
                    const state = editStates.get(record.id)
                    if (!state) return null

                    return (
                      <React.Fragment key={record.id}>
                        {/* AI分析結果行 */}
                        <tr className="bg-blue-50/50">
                          <td rowSpan={3} className="px-3 py-2 text-gray-500 align-top border-b">
                            {(currentPage - 1) * RECORD_PAGE_SIZE + index + 1}
                          </td>

                          <td rowSpan={3} className="px-3 py-2  align-top border-b max-w-[300px]">
                            <div className="flex items-start gap-1">
                              <p className="text-gray-800 text-xs flex-1 break-words whitespace-pre-wrap">
                                {truncateText(record.rawText, 80, 2)}
                              </p>
                              {record.rawText.length > 80 && (
                                <button
                                  type="button"
                                  onClick={() => rawTextModal.handleOpen({ rawText: record.rawText, recordIndex: (currentPage - 1) * RECORD_PAGE_SIZE + index + 1 })}
                                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded flex-shrink-0"
                                  title="原文を表示"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-1 ">
                            <span className="text-gray-600 text-xs">{record.analysisTopic || '-'}</span>
                          </td>
                          <td className="px-3 py-1">
                            <span className="text-gray-600 text-xs">{record.analysisStage || '-'}</span>
                          </td>
                          <td className="px-3 py-1">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs ${getSentimentColor(record.analysisSentiment || '')}`}>
                              {record.analysisSentiment || '-'}
                            </span>
                          </td>
                          <td className="px-3 py-1">
                            <span className="text-gray-600 text-xs">{record.analysisGeneralCategory || '-'}</span>
                          </td>
                          <td className="px-3 py-1">
                            <span className="text-gray-600 text-xs">{record.analysisCategory || '-'}</span>
                          </td>
                          <td rowSpan={3} className="px-3 py-2 align-middle border-b">
                            {state.isModified && (
                              <span title="保存中..." className="animate-pulse">
                                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                              </span>
                            )}
                          </td>
                        </tr>
                        {/* フィードバック行 */}
                        <tr className="border-b">

                          <td className={`px-3 py-1 ${getFeedbackCellStyle(state.feedbackTopic, record.analysisTopic)}`}>
                            <textarea
                              value={state.feedbackTopic}
                              onChange={(e) =>
                                updateEditState(record.id, { feedbackTopic: e.target.value })
                              }
                              onBlur={() => handleAutoSave(record.id)}
                              className="w-full p-1 border border-gray-200 rounded text-xs bg-white"
                              placeholder="フィードバック..."
                            />
                          </td>
                          <td className={`px-3 py-1 ${getFeedbackCellStyle(state.feedbackStage, record.analysisStage)}`}>
                            <select
                              value={state.feedbackStage}
                              onChange={(e) => {
                                updateEditState(record.id, { feedbackStage: e.target.value })
                                // selectはonChangeで即保存
                                setTimeout(() => handleAutoSave(record.id), 0)
                              }}
                              className="w-full p-1 border border-gray-200 rounded text-xs bg-white"
                            >
                              <option value="">選択...</option>
                              {STAGE_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className={`px-3 py-1 ${getFeedbackCellStyle(state.feedbackSentiment, record.analysisSentiment)}`}>
                            <select
                              value={state.feedbackSentiment}
                              onChange={(e) => {
                                updateEditState(record.id, { feedbackSentiment: e.target.value })
                                setTimeout(() => handleAutoSave(record.id), 0)
                              }}
                              className={`w-full p-1 border border-gray-200 rounded text-xs bg-white ${getSentimentColor(state.feedbackSentiment)}`}
                            >
                              <option value="">選択...</option>
                              {SENTIMENT_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className={`px-3 py-1 ${getFeedbackCellStyle(state.feedbackGeneralCategory, record.analysisGeneralCategory)}`}>
                            <R_Stack className="gap-1">
                              <select
                                value={state.feedbackGeneralCategory}
                                onChange={(e) => {
                                  updateEditState(record.id, { feedbackGeneralCategory: e.target.value, feedbackCategory: '' })
                                  setTimeout(() => handleAutoSave(record.id), 0)
                                }}
                                className="flex-1 p-1 border border-gray-200 rounded text-xs bg-white"
                              >
                                <option value="">選択...</option>
                                {mergedGeneralCategories.map((gc) => (
                                  <option key={gc.id} value={gc.name}>
                                    {gc.name}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => openCategoryModal('general', record.id)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="新規一般カテゴリを追加"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </R_Stack>
                          </td>
                          <td className={`px-3 py-1 ${getFeedbackCellStyle(state.feedbackCategory, record.analysisCategory)}`}>
                            <R_Stack className="gap-1">
                              <select
                                value={state.feedbackCategory}
                                onChange={(e) => {
                                  updateEditState(record.id, { feedbackCategory: e.target.value })
                                  setTimeout(() => handleAutoSave(record.id), 0)
                                }}
                                className="flex-1 p-1 border border-gray-200 rounded text-xs bg-white"
                              >
                                <option value="">選択...</option>
                                {mergedGeneralCategories
                                  .find((gc) => gc.name === state.feedbackGeneralCategory)
                                  ?.categories?.map((c) => (
                                    <option key={c.id} value={c.name}>
                                      {c.name}
                                    </option>
                                  ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => openCategoryModal('category', record.id)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="新規カテゴリを追加"
                                disabled={!state.feedbackGeneralCategory}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </R_Stack>
                          </td>
                        </tr>
                        {/* 分析考え方行 */}
                        <tr className="border-b bg-amber-50/30">
                          <td colSpan={6} className="px-3 py-1">
                            <div className="flex items-start gap-2">
                              <span className="text-xs text-amber-700 font-medium whitespace-nowrap pt-1">分析考え方:</span>
                              <textarea
                                value={state.reviewerComment?.trim() || ''}
                                onChange={(e) =>
                                  updateEditState(record.id, { reviewerComment: e.target.value })
                                }
                                onBlur={() => handleAutoSave(record.id)}
                                className="flex-1 p-1 border border-amber-200 rounded text-xs bg-white resize-none"
                                placeholder="この分析の考え方やメモを記録..."
                                rows={1}
                              />
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>

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
                  {currentPage} / {totalPages} ページ（全{totalCount}件）
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
        )}
      </C_Stack>

      {/* カテゴリ追加モーダル */}
      <categoryModal.Modal
        open={!!categoryModal.open}
        setopen={categoryModal.setopen}
        title={categoryModal.open?.type === 'general' ? '新規一般カテゴリを追加' : '新規カテゴリを追加'}
      >
        <C_Stack className="gap-4 p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {categoryModal.open?.type === 'general' ? '一般カテゴリ名' : 'カテゴリ名'} *
            </label>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="カテゴリ名を入力"
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">説明（任意）</label>
            <textarea
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
              placeholder="カテゴリの説明を入力"
              rows={2}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <R_Stack className="justify-end gap-2">
            <button
              onClick={() => {
                categoryModal.handleClose()
                setNewCategoryName('')
                setNewCategoryDescription('')
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              onClick={categoryModal.open?.type === 'general' ? handleCreateGeneralCategory : handleCreateCategory}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              追加
            </button>
          </R_Stack>
        </C_Stack>
      </categoryModal.Modal>

      {/* 原文表示モーダル */}
      <rawTextModal.Modal
        open={!!rawTextModal.open}
        setopen={rawTextModal.setopen}
        title={`原文 #${rawTextModal.open?.recordIndex || ''}`}
      >
        <div className="p-4">
          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {rawTextModal.open?.rawText}
          </p>
        </div>
      </rawTextModal.Modal>
    </div>
  )
}
