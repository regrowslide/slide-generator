'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import {
  ArrowLeft,
  Upload,
  Play,
  AlertCircle,
  Loader2,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  Clock,
  Check,

  Save,
} from 'lucide-react'
import Link from 'next/link'
import {
  getAnalysisSessionById,
  getAnalysisRecords,
  updateAnalysisSessionStatus,
  createAnalysisRecords,
  updateAnalysisRecordsFeedback,
  getSessionRecordsForExport,
  approveProposedCategory,
  approveProposalOnly,
  rejectProposedCategory,
  toggleAnalysisRecordEnabled,
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

// デフォルトのステージ選択肢（クライアント未設定時のフォールバック）

// 感情選択肢
const SENTIMENT_OPTIONS: SentimentType[] = ['好意的', '不満', 'リクエスト', 'その他']

// ページネーション
const RECORD_PAGE_SIZE = 50

// CSV生成ユーティリティ（createdAt順・全体通し連番対応・無効レコード除外）
const generateCsvContent = (records: HakobunAnalysisRecord[]): string => {
  // ヘッダー
  const headers = ['通し番号', '枝番', 'ステージ', '感情', '一般カテゴリ', 'カテゴリ', 'トピック', '原文']

  // 有効なレコードのみフィルタリングし、createdAt順でソート
  // - isEnabledがfalseのレコードは除外
  // - 提案レコード（isProposedGeneralCategory || isProposedCategory）で未承認（proposalApproved !== true）のレコードも除外
  const enabledRecords = records.filter(r => {
    if (r.isEnabled === false) return false
    // 提案レコードは承認済みのみ有効
    if ((r.isProposedGeneralCategory || r.isProposedCategory) && r.proposalApproved !== true) return false
    return true
  })
  const sortedRecords = [...enabledRecords].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

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

  const { selectedClient, stageOptions } = useSelectedClient()
  const {
    mergedGeneralCategories,
    createGeneralCategory,
    createCategory,
    isPendingGeneralCategory,
    industryId,
    refreshCategories,
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

  // 分析プログレス
  const [analysisProgress, setAnalysisProgress] = useState<{
    total: number
    estimated: number // 推定所要時間（秒）
    startTime: number | null
    elapsed: number
  }>({ total: 0, estimated: 0, startTime: null, elapsed: 0 })

  // 全レコード統計用（ページネーションに関係なく全件で計算）
  const [allRecordsForStats, setAllRecordsForStats] = useState<HakobunAnalysisRecord[]>([])

  // フィードバック編集
  const [editStates, setEditStates] = useState<Map<number, RecordEditState>>(new Map())
  // editStatesの最新値を保持するref（setTimeout内で参照するため）
  const editStatesRef = useRef<Map<number, RecordEditState>>(editStates)

  // 集計統計（useMemo）- 全レコードで計算
  const statistics = useMemo(() => {
    if (allRecordsForStats.length === 0) return null

    // フィードバックがあればそちらを優先
    const getValue = (record: HakobunAnalysisRecord, feedbackKey: keyof HakobunAnalysisRecord, analysisKey: keyof HakobunAnalysisRecord) => {
      return (record[feedbackKey] || record[analysisKey] || '') as string
    }

    // 原文のユニーク数
    const uniqueRawTexts = new Set(allRecordsForStats.map(r => r.rawText))

    // 各項目の集計
    const countByField = (getter: (r: HakobunAnalysisRecord) => string) => {
      const counts = new Map<string, number>()
      allRecordsForStats.forEach(r => {
        const value = getter(r) || '(未設定)'
        counts.set(value, (counts.get(value) || 0) + 1)
      })
      return Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }))
    }

    // 一般カテゴリの統計（マスタ登録済み数と提案データ）
    const generalCategoryStats = {
      total: new Set(allRecordsForStats.map(r => getValue(r, 'feedbackGeneralCategory', 'analysisGeneralCategory')).filter(Boolean)).size,
      registered: 0,
      proposed: {
        total: 0,
        approved: 0,
        rejected: 0,
        pending: 0,
      },
    }
    const gcProposedRecords = allRecordsForStats.filter(r => r.isProposedGeneralCategory)
    generalCategoryStats.proposed.total = gcProposedRecords.length
    generalCategoryStats.proposed.approved = gcProposedRecords.filter(r => r.proposalApproved === true).length
    generalCategoryStats.proposed.rejected = gcProposedRecords.filter(r => r.proposalApproved === false).length
    generalCategoryStats.proposed.pending = gcProposedRecords.filter(r => r.proposalApproved === null || r.proposalApproved === undefined).length
    generalCategoryStats.registered = generalCategoryStats.total - new Set(gcProposedRecords.filter(r => r.proposalApproved !== true).map(r => r.analysisGeneralCategory).filter(Boolean)).size

    // カテゴリの統計（マスタ登録済み数と提案データ）
    const categoryStats = {
      total: new Set(allRecordsForStats.map(r => getValue(r, 'feedbackCategory', 'analysisCategory')).filter(Boolean)).size,
      registered: 0,
      proposed: {
        total: 0,
        approved: 0,
        rejected: 0,
        pending: 0,
      },
    }
    const cProposedRecords = allRecordsForStats.filter(r => r.isProposedCategory)
    categoryStats.proposed.total = cProposedRecords.length
    categoryStats.proposed.approved = cProposedRecords.filter(r => r.proposalApproved === true).length
    categoryStats.proposed.rejected = cProposedRecords.filter(r => r.proposalApproved === false).length
    categoryStats.proposed.pending = cProposedRecords.filter(r => r.proposalApproved === null || r.proposalApproved === undefined).length
    categoryStats.registered = categoryStats.total - new Set(cProposedRecords.filter(r => r.proposalApproved !== true).map(r => r.analysisCategory).filter(Boolean)).size

    return {
      rawTextCount: uniqueRawTexts.size,
      topicCount: allRecordsForStats.length,
      stages: countByField(r => getValue(r, 'feedbackStage', 'analysisStage')),
      sentiments: countByField(r => getValue(r, 'feedbackSentiment', 'analysisSentiment')),
      generalCategories: countByField(r => getValue(r, 'feedbackGeneralCategory', 'analysisGeneralCategory')),
      categories: countByField(r => getValue(r, 'feedbackCategory', 'analysisCategory')),
      generalCategoryStats,
      categoryStats,
    }
  }, [allRecordsForStats])

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

  // 統計用の全レコード取得
  const fetchAllRecordsForStats = useCallback(async () => {
    if (!sessionId) return
    try {
      const result = await getSessionRecordsForExport(sessionId)
      if (result.success && result.data) {
        setAllRecordsForStats(result.data as HakobunAnalysisRecord[])
      }
    } catch (error) {
      console.error('統計用レコード取得エラー:', error)
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
          ; (result.data.records as HakobunAnalysisRecord[]).forEach((record) => {
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
        editStatesRef.current = initialEditStates
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

  // 統計用レコード取得（totalCountが変わったら再取得）
  useEffect(() => {
    if (totalCount > 0) {
      fetchAllRecordsForStats()
    }
  }, [totalCount, fetchAllRecordsForStats])

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

  // 分析プログレスの経過時間更新
  useEffect(() => {
    if (!isAnalyzing || !analysisProgress.startTime) return

    const interval = setInterval(() => {
      setAnalysisProgress(prev => ({
        ...prev,
        elapsed: Math.floor((Date.now() - (prev.startTime || 0)) / 1000),
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [isAnalyzing, analysisProgress.startTime])

  // 分析実行
  const handleAnalyze = useCallback(async () => {
    if (!selectedClient?.clientId || csvTexts.length === 0) {
      alert('CSVデータがありません')
      return
    }

    setIsAnalyzing(true)
    setAnalysisError(null)

    // プログレス初期化（1テキストあたり約2-3秒、同時実行4として計算）
    const concurrency = 4
    const estimatedSeconds = Math.ceil(csvTexts.length / concurrency) * 3
    setAnalysisProgress({
      total: csvTexts.length,
      estimated: estimatedSeconds,
      startTime: Date.now(),
      elapsed: 0,
    })

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
        // マスタの一般カテゴリ名一覧を取得
        const masterGeneralCategoryNames = new Set(mergedGeneralCategories.map(gc => gc.name))
        // マスタのカテゴリ名一覧を取得
        const masterCategoryNames = new Set(
          mergedGeneralCategories.flatMap(gc => gc.categories?.map(c => c.name) || [])
        )

        // 分析結果をレコードとして保存
        const recordInputs = data.results.flatMap((result: any, resultIndex: number) =>
          result.extracts.map((extract: any) => {
            const generalCategoryName = extract.general_category || ''
            const categoryName = extract.category || ''

            // allowCategoryGenerationがONの場合のみ新規提案フラグをセット
            // 一般カテゴリがマスタに存在しない場合、新規提案とみなす（APIのis_new_general_categoryフラグも参照）
            const isProposedGeneralCategory = allowCategoryGeneration &&
              ((generalCategoryName && !masterGeneralCategoryNames.has(generalCategoryName)) ||
                (extract.is_new_general_category === true))
            // カテゴリがマスタに存在しない場合、新規提案とみなす（AIのis_new_generatedフラグも参照）
            const isProposedCategory = allowCategoryGeneration &&
              ((categoryName && !masterCategoryNames.has(categoryName)) ||
                (extract.is_new_generated === true))

            return {
              rawText: extract.raw_text || csvTexts[resultIndex] || '',
              analysisStage: extract.stage || '',
              analysisSentiment: extract.sentiment || '',
              analysisGeneralCategory: generalCategoryName,
              analysisCategory: categoryName,
              analysisTopic: extract.sentence || '',
              isProposedGeneralCategory,
              isProposedCategory,
              sessionId,
            }
          })
        )

        await createAnalysisRecords(recordInputs)

        // 再取得
        await fetchSession()
        await fetchRecords()
        await fetchAllRecordsForStats()
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
      setAnalysisProgress(prev => ({ ...prev, startTime: null }))
    }
  }, [selectedClient?.clientId, csvTexts, sessionId, fetchSession, fetchRecords, fetchAllRecordsForStats, allowCategoryGeneration, mergedGeneralCategories])

  // editStatesの最新値をrefに同期
  useEffect(() => {
    editStatesRef.current = editStates
  }, [editStates])

  // 編集状態更新
  const updateEditState = useCallback((recordId: number, updates: Partial<RecordEditState>) => {
    setEditStates((prev) => {
      const newMap = new Map(prev)
      const current = newMap.get(recordId)
      if (current) {
        const updated = { ...current, ...updates, isModified: true }
        newMap.set(recordId, updated)
      }
      // refも同期的に更新（setTimeoutで呼ばれるhandleAutoSaveで最新値を参照するため）
      editStatesRef.current = newMap
      return newMap
    })
  }, [])

  // 単一レコードの自動保存（onBlur用・onChange用）
  const handleAutoSave = useCallback(async (recordId: number) => {
    // refから最新のstateを取得（setTimeoutで呼ばれた場合でも最新値を参照）
    const state = editStatesRef.current.get(recordId)
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
  }, []) // refを使うので依存配列は空でOK

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

  // 承認処理中のレコードID
  const [processingRecordId, setProcessingRecordId] = useState<number | null>(null)

  // ルール生成関連
  const [isGeneratingRules, setIsGeneratingRules] = useState(false)
  const [ruleDrafts, setRuleDrafts] = useState<any[]>([])
  const [isSavingRules, setIsSavingRules] = useState(false)
  const rulePreviewModal = useModal<{ modifiedRecordsCount: number }>()

  // 新規提案カテゴリを承認
  const handleApproveProposal = useCallback(async (recordId: number) => {
    // マスタに登録するか確認
    const shouldRegisterToMaster = window.confirm(
      '提案されたカテゴリをマスタに登録しますか？\n\n' +
      '「OK」: マスタに登録して承認（今後の分析でも使用可能）\n' +
      '「キャンセル」: 承認のみ（このセッションのみで一時的に使用）'
    )

    setProcessingRecordId(recordId)
    try {
      let result
      if (shouldRegisterToMaster) {
        // マスタに登録して承認
        if (!industryId) {
          alert('業種が設定されていないため、マスタに登録できません。承認のみ実行します。')
          result = await approveProposalOnly(recordId)
        } else {
          result = await approveProposedCategory(recordId, industryId)
        }
      } else {
        // 承認のみ（マスタ登録なし）
        result = await approveProposalOnly(recordId)
      }

      if (result.success) {
        // データを再取得
        await fetchRecords()
        await fetchAllRecordsForStats()
        if (shouldRegisterToMaster && industryId) {
          await refreshCategories()
        }
      } else {
        alert(`承認に失敗しました: ${result.error}`)
      }
    } catch (error) {
      alert('承認処理でエラーが発生しました')
    } finally {
      setProcessingRecordId(null)
    }
  }, [industryId, fetchRecords, fetchAllRecordsForStats, refreshCategories])

  // 新規提案カテゴリを却下（承認済みからの却下も可能）
  const handleRejectProposal = useCallback(async (recordId: number) => {
    if (!window.confirm(
      'この提案を却下しますか？\n\n' +
      '却下すると、該当するカテゴリ/一般カテゴリはクリアされます。\n' +
      '（既にマスタに登録されているカテゴリは削除されません）'
    )) {
      return
    }

    setProcessingRecordId(recordId)
    try {
      const result = await rejectProposedCategory(recordId)
      if (result.success) {
        // データを再取得
        await fetchRecords()
        await fetchAllRecordsForStats()
      } else {
        alert(`却下に失敗しました: ${result.error}`)
      }
    } catch (error) {
      alert('却下処理でエラーが発生しました')
    } finally {
      setProcessingRecordId(null)
    }
  }, [fetchRecords, fetchAllRecordsForStats])

  // レコードの有効/無効切り替え
  const handleToggleEnabled = useCallback(async (recordId: number, currentIsEnabled: boolean) => {
    try {
      const newIsEnabled = !currentIsEnabled
      const result = await toggleAnalysisRecordEnabled(recordId, newIsEnabled)
      if (result.success) {
        // ローカルのrecordsを更新
        setRecords(prev => prev.map(r => r.id === recordId ? { ...r, isEnabled: newIsEnabled } : r))
        // 統計用レコードも更新
        setAllRecordsForStats(prev => prev.map(r => r.id === recordId ? { ...r, isEnabled: newIsEnabled } : r))
      } else {
        alert(`切り替えに失敗しました: ${result.error}`)
      }
    } catch (error) {
      alert('有効/無効の切り替えでエラーが発生しました')
    }
  }, [])

  // 分析ルール生成（プレビュー）
  const handleGenerateRulesPreview = useCallback(async () => {
    if (!selectedClient) {
      alert('クライアントが選択されていません')
      return
    }

    setIsGeneratingRules(true)
    setRuleDrafts([])
    try {
      const response = await fetch('/api/hakobun/rules/generate-from-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          hakobunClientId: selectedClient.id,
          saveRules: false, // プレビューモード
        }),
      })
      const data = await response.json()

      if (data.success) {
        if (data.generatedRules && data.generatedRules.length > 0) {
          setRuleDrafts(data.generatedRules)
          rulePreviewModal.handleOpen({ modifiedRecordsCount: data.modifiedRecordsCount || 0 })
        } else {
          alert(data.message || 'ルールを生成できませんでした。修正されたレコードがないか、有意義なパターンが抽出できませんでした。')
        }
      } else {
        alert(`ルール生成に失敗しました: ${data.error || ''}`)
      }
    } catch (error) {
      console.error('ルール生成エラー:', error)
      alert('ルール生成中にエラーが発生しました')
    } finally {
      setIsGeneratingRules(false)
    }
  }, [selectedClient, sessionId, rulePreviewModal])

  // 分析ルール保存
  const handleSaveRules = useCallback(async () => {
    if (!selectedClient || ruleDrafts.length === 0) return

    setIsSavingRules(true)
    try {
      const response = await fetch('/api/hakobun/rules/generate-from-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          hakobunClientId: selectedClient.id,
          saveRules: true, // 保存モード
        }),
      })
      const data = await response.json()

      if (data.success) {
        alert(
          `ルールを保存しました。\n\n` +
          `新規: ${data.savedCount || 0}件\n` +
          `更新: ${data.mergedCount || 0}件`
        )
        rulePreviewModal.handleClose()
        setRuleDrafts([])
      } else {
        alert(`ルール保存に失敗しました: ${data.error || ''}`)
      }
    } catch (error) {
      console.error('ルール保存エラー:', error)
      alert('ルール保存中にエラーが発生しました')
    } finally {
      setIsSavingRules(false)
    }
  }, [selectedClient, sessionId, ruleDrafts, rulePreviewModal])

  // 新規一般カテゴリを追加（マスタ登録あり）
  const handleCreateGeneralCategory = useCallback(async () => {
    if (!newCategoryName.trim()) {
      alert('カテゴリ名を入力してください')
      return
    }

    // マスタに登録するか確認
    const shouldSaveToMaster = window.confirm(
      `「${newCategoryName}」を一般カテゴリマスタに登録しますか？\n\n登録すると、今後の分析でも選択肢として表示されます。`
    )

    if (shouldSaveToMaster) {
      // industryIdがない場合はエラー
      if (!industryId) {
        alert('業種が設定されていないため、マスタに登録できません。クライアント設定で業種を設定してください。')
        return
      }

      // 直接APIを呼び出してマスタに保存
      try {
        const res = await fetch(`/api/hakobun/industries/${industryId}/general-categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newCategoryName,
            description: newCategoryDescription || null,
            sortOrder: mergedGeneralCategories.length + 1,
          }),
        })
        const data = await res.json()
        if (!data.success) {
          alert('マスタへの登録に失敗しました: ' + (data.error || '不明なエラー'))
          return
        }
        // カテゴリリストを再取得
        await refreshCategories()
      } catch (err) {
        alert('マスタへの登録に失敗しました: ' + (err instanceof Error ? err.message : '不明なエラー'))
        return
      }
    } else {
      // マスタに登録せず、一時的にpendingに追加するだけ
      const success = createGeneralCategory(newCategoryName, newCategoryDescription)
      if (!success) return
    }

    if (categoryModal.open) {
      const recordId = categoryModal.open.recordId
      updateEditState(recordId, { feedbackGeneralCategory: newCategoryName })
      // フィードバックデータとしてDBに保存
      setTimeout(() => handleAutoSave(recordId), 100)
      categoryModal.handleClose()
      setNewCategoryName('')
      setNewCategoryDescription('')
    }
  }, [newCategoryName, newCategoryDescription, createGeneralCategory, categoryModal, updateEditState, industryId, mergedGeneralCategories, refreshCategories, handleAutoSave])

  // 新規詳細カテゴリを追加（マスタ登録あり）
  const handleCreateCategory = useCallback(async () => {
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

    // 親の一般カテゴリがpending状態（まだマスタ未保存）かチェック
    const isParentPending = isPendingGeneralCategory(state.feedbackGeneralCategory)

    // マスタに登録するか確認
    let confirmMessage = `「${newCategoryName}」をカテゴリマスタに登録しますか？\n（親カテゴリ: ${state.feedbackGeneralCategory}）`
    if (isParentPending) {
      confirmMessage += `\n\n※ 親の一般カテゴリ「${state.feedbackGeneralCategory}」も同時にマスタ登録されます。`
    }
    confirmMessage += '\n\n登録すると、今後の分析でも選択肢として表示されます。'

    const shouldSaveToMaster = window.confirm(confirmMessage)

    if (shouldSaveToMaster) {
      // industryIdがない場合はエラー
      if (!industryId) {
        alert('業種が設定されていないため、マスタに登録できません。クライアント設定で業種を設定してください。')
        return
      }

      try {
        let parentGeneralCategoryId: number | null = null

        // 親の一般カテゴリがpendingの場合は先に保存
        if (isParentPending) {
          const gcRes = await fetch(`/api/hakobun/industries/${industryId}/general-categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: state.feedbackGeneralCategory,
              description: null,
              sortOrder: mergedGeneralCategories.length + 1,
            }),
          })
          const gcData = await gcRes.json()
          if (!gcData.success) {
            alert('親カテゴリのマスタ登録に失敗しました: ' + (gcData.error || '不明なエラー'))
            return
          }
          parentGeneralCategoryId = gcData.generalCategory.id
        } else {
          // 既存の一般カテゴリからIDを取得
          const existingGc = mergedGeneralCategories.find(gc => gc.name === state.feedbackGeneralCategory)
          if (!existingGc || existingGc.id < 0) {
            alert('親カテゴリが見つかりません')
            return
          }
          parentGeneralCategoryId = existingGc.id
        }

        // カテゴリを保存
        const cRes = await fetch(`/api/hakobun/industries/${industryId}/general-categories/${parentGeneralCategoryId}/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newCategoryName,
            description: newCategoryDescription || null,
            sortOrder: 1,
          }),
        })
        const cData = await cRes.json()
        if (!cData.success) {
          alert('カテゴリのマスタ登録に失敗しました: ' + (cData.error || '不明なエラー'))
          return
        }

        // カテゴリリストを再取得
        await refreshCategories()
      } catch (err) {
        alert('マスタへの登録に失敗しました: ' + (err instanceof Error ? err.message : '不明なエラー'))
        return
      }
    } else {
      // マスタに登録せず、一時的にpendingに追加するだけ
      const success = createCategory(state.feedbackGeneralCategory, newCategoryName, newCategoryDescription)
      if (!success) return
    }

    if (categoryModal.open) {
      const recordId = categoryModal.open.recordId
      updateEditState(recordId, { feedbackCategory: newCategoryName })
      // フィードバックデータとしてDBに保存
      setTimeout(() => handleAutoSave(recordId), 100)
      categoryModal.handleClose()
      setNewCategoryName('')
      setNewCategoryDescription('')
    }
  }, [newCategoryName, newCategoryDescription, createCategory, categoryModal, editStates, updateEditState, isPendingGeneralCategory, industryId, mergedGeneralCategories, refreshCategories, handleAutoSave])

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
            {/* 分析ルール作成ボタン */}
            {hasRecords && (
              <button
                onClick={handleGenerateRulesPreview}
                disabled={isGeneratingRules}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:bg-gray-400"
              >
                {isGeneratingRules ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    ルール生成中...
                  </>
                ) : (
                  <>

                    分析ルール作成
                  </>
                )}
              </button>
            )}
            {/* CSVエクスポートボタン */}
            {hasRecords && (
              <button
                onClick={handleDownloadCsv}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                CSV出力
              </button>
            )}
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
                      <span className="text-sm font-medium text-gray-800">新規カテゴリの自動提案を許可</span>
                      <p className="text-xs text-gray-500 mt-1">
                        マスタに該当するカテゴリがない場合に、新しいカテゴリを提案します。
                      </p>
                    </div>
                  </label>
                  <div className={`text-xs p-2 rounded ${allowCategoryGeneration ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                    <span>
                      {allowCategoryGeneration
                        ? '既存カテゴリを優先しつつ、必要に応じて新規カテゴリを提案します'
                        : 'マスタカテゴリのみを使用します（新規カテゴリは生成されません）'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 分析プログレス */}
              {isAnalyzing && analysisProgress.startTime && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <R_Stack className="items-center gap-3 mb-3">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-800">
                        分析処理中… {analysisProgress.total}件のデータを処理しています
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        <Clock className="w-3 h-3 inline mr-1" />
                        経過: {Math.floor(analysisProgress.elapsed / 60)}分{analysisProgress.elapsed % 60}秒
                        {' / '}
                        推定: 約{Math.floor(analysisProgress.estimated / 60)}分{analysisProgress.estimated % 60}秒
                      </p>
                    </div>
                  </R_Stack>
                  {/* プログレスバー */}
                  <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.min(100, (analysisProgress.elapsed / analysisProgress.estimated) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-blue-500 mt-2 text-center">
                    処理が完了するまでこのページを閉じないでください
                  </p>
                </div>
              )}

              <R_Stack className="justify-end">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || csvTexts.length === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-400"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      分析中…
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
                <PopoverContent className="w-64 p-2 bg-white">
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
                <PopoverContent className="w-64 p-2 bg-white">
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
                    <p className="text-lg font-bold text-purple-800">
                      {statistics.generalCategoryStats.registered}/{statistics.generalCategoryStats.total}種
                    </p>
                    {statistics.generalCategoryStats.proposed.total > 0 && (
                      <p className="text-xs text-amber-600">

                        提案: {statistics.generalCategoryStats.proposed.approved}/{statistics.generalCategoryStats.proposed.total}
                      </p>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-2 bg-white">
                  <p className="text-xs font-medium text-gray-600 mb-2">一般カテゴリ別件数</p>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {statistics.generalCategories.map(({ name, count }) => (
                      <R_Stack key={name} className="justify-between text-sm">
                        <span className="text-gray-700 truncate flex-1">{name}</span>
                        <span className="text-gray-500 font-medium ml-2">{count}件</span>
                      </R_Stack>
                    ))}
                  </div>
                  {statistics.generalCategoryStats.proposed.total > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs font-medium text-amber-600 mb-1">AI新規提案</p>
                      <p className="text-xs text-gray-600">
                        承認: {statistics.generalCategoryStats.proposed.approved} /
                        却下: {statistics.generalCategoryStats.proposed.rejected} /
                        未処理: {statistics.generalCategoryStats.proposed.pending}
                      </p>
                    </div>
                  )}
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
                    <p className="text-lg font-bold text-amber-800">
                      {statistics.categoryStats.registered}/{statistics.categoryStats.total}種
                    </p>
                    {statistics.categoryStats.proposed.total > 0 && (
                      <p className="text-xs text-amber-600">

                        提案: {statistics.categoryStats.proposed.approved}/{statistics.categoryStats.proposed.total}
                      </p>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-2 bg-white">
                  <p className="text-xs font-medium text-gray-600 mb-2">カテゴリ別件数</p>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {statistics.categories.map(({ name, count }) => (
                      <R_Stack key={name} className="justify-between text-sm">
                        <span className="text-gray-700 truncate flex-1">{name}</span>
                        <span className="text-gray-500 font-medium ml-2">{count}件</span>
                      </R_Stack>
                    ))}
                  </div>
                  {statistics.categoryStats.proposed.total > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs font-medium text-amber-600 mb-1">AI新規提案</p>
                      <p className="text-xs text-gray-600">
                        承認: {statistics.categoryStats.proposed.approved} /
                        却下: {statistics.categoryStats.proposed.rejected} /
                        未処理: {statistics.categoryStats.proposed.pending}
                      </p>
                    </div>
                  )}
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

                    // 有効判定: isEnabledがfalse、または提案レコードで未承認の場合は無効
                    const isProposal = record.isProposedGeneralCategory || record.isProposedCategory
                    const isApproved = record.proposalApproved === true
                    const isEnabled = record.isEnabled !== false && (!isProposal || isApproved)
                    const disabledClass = isEnabled ? '' : 'opacity-40'

                    return (
                      <React.Fragment key={record.id}>
                        {/* AI分析結果行 */}
                        <tr className={`bg-blue-50/50 ${disabledClass}`}>
                          <td rowSpan={3} className="px-3 py-2 text-gray-500 align-top border-b">
                            <div className="flex flex-col items-center gap-1">
                              <span>{(currentPage - 1) * RECORD_PAGE_SIZE + index + 1}</span>
                              {/* 有効/無効トグル */}
                              <button
                                type="button"
                                onClick={() => handleToggleEnabled(record.id, isEnabled)}
                                className={`w-8 h-4 rounded-full relative transition-colors ${isEnabled ? 'bg-green-500' : 'bg-gray-300'
                                  }`}
                                title={isEnabled ? 'クリックで無効化（CSVから除外）' : 'クリックで有効化（CSVに含める）'}
                              >
                                <span
                                  className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isEnabled ? 'right-0.5' : 'left-0.5'
                                    }`}
                                />
                              </button>
                            </div>
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
                            {record.isProposedGeneralCategory ? (
                              <R_Stack className="items-center gap-1">
                                <span className={`text-xs px-1.5 py-0.5 rounded ${record.proposalApproved === true
                                  ? 'bg-green-100 text-green-800'
                                  : record.proposalApproved === false
                                    ? 'bg-red-100 text-red-400 line-through'
                                    : 'bg-amber-100 text-amber-800 animate-pulse'
                                  }`}>

                                  {record.analysisGeneralCategory || '-'}
                                </span>
                              </R_Stack>
                            ) : (
                              <span className="text-gray-600 text-xs">{record.analysisGeneralCategory || '-'}</span>
                            )}
                          </td>
                          <td className="px-3 py-1">
                            {record.isProposedCategory ? (
                              <R_Stack className="items-center gap-1">
                                <span className={`text-xs px-1.5 py-0.5 rounded ${record.proposalApproved === true
                                  ? 'bg-green-100 text-green-800'
                                  : record.proposalApproved === false
                                    ? 'bg-red-100 text-red-400 line-through'
                                    : 'bg-amber-100 text-amber-800 animate-pulse'
                                  }`}>

                                  {record.analysisCategory || '-'}
                                </span>
                              </R_Stack>
                            ) : (
                              <span className="text-gray-600 text-xs">{record.analysisCategory || '-'}</span>
                            )}
                          </td>
                          <td rowSpan={3} className="px-3 py-2 align-middle border-b">
                            <C_Stack className="gap-1 items-center">

                              {/* 新規提案の承認/却下ボタン */}
                              {(record.isProposedGeneralCategory || record.isProposedCategory) && record.proposalApproved === null && (
                                <R_Stack className="gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleApproveProposal(record.id)}
                                    disabled={processingRecordId === record.id}
                                    className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                                    title="承認（マスタに登録）"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRejectProposal(record.id)}
                                    disabled={processingRecordId === record.id}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                                    title="却下（カテゴリをnullに）"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </R_Stack>
                              )}


                              {/* トグル形式で承認/却下切り替え */}
                              {(record.isProposedGeneralCategory || record.isProposedCategory) && record.proposalApproved !== null && (
                                <R_Stack className="gap-1 items-center">
                                  <label className="flex items-center gap-1 cursor-pointer">

                                    <span
                                      onClick={() =>
                                        record.proposalApproved === true
                                          ? handleRejectProposal(record.id)
                                          : handleApproveProposal(record.id)
                                      }
                                      className={`text-xs ${record.proposalApproved === true
                                        ? 'text-green-600'
                                        : 'text-red-400 line-through'
                                        }`}
                                    >
                                      {record.proposalApproved === true ? '承認' : '却下'}
                                    </span>
                                    {processingRecordId === record.id && (
                                      <Loader2 className="w-3 h-3 animate-spin ml-1" />
                                    )}
                                  </label>
                                </R_Stack>
                              )}
                            </C_Stack>
                          </td>
                        </tr>
                        {/* フィードバック行 */}
                        <tr className={`border-b ${disabledClass}`}>

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
                              {stageOptions.map((opt: string) => (
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
                        <tr className={`border-b bg-amber-50/30 ${disabledClass}`}>
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

      {/* ルールプレビューモーダル */}
      <rulePreviewModal.Modal
        open={!!rulePreviewModal.open}
        setopen={rulePreviewModal.setopen}
        title="分析ルールのプレビュー"
      >
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            修正レコード {rulePreviewModal.open?.modifiedRecordsCount || 0}件から、以下のルールが生成されます。
          </p>

          {ruleDrafts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">ルールがありません</p>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {ruleDrafts.map((rule, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${rule.isNew ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'
                    }`}
                >
                  <R_Stack className="justify-between items-start mb-2">
                    <R_Stack className="items-center gap-2">
                      <span className="font-medium text-gray-800">{rule.targetCategory}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${rule.priority === 'High'
                          ? 'bg-red-100 text-red-700'
                          : rule.priority === 'Medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                          }`}
                      >
                        {rule.priority}
                      </span>
                    </R_Stack>
                    <span
                      className={`text-xs px-2 py-1 rounded ${rule.isNew ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'
                        }`}
                    >
                      {rule.isNew ? '新規' : `既存ルール更新 (ID: ${rule.mergedWithRuleId})`}
                    </span>
                  </R_Stack>
                  <p className="text-sm text-gray-700 mb-2">{rule.ruleDescription}</p>
                  {rule.reasoning && (
                    <p className="text-xs text-gray-500 border-t pt-2 mt-2">
                      理由: {rule.reasoning}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <R_Stack className="justify-end gap-2 mt-6 pt-4 border-t">
            <button
              onClick={() => {
                rulePreviewModal.handleClose()
                setRuleDrafts([])
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleSaveRules}
              disabled={isSavingRules || ruleDrafts.length === 0}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center gap-2"
            >
              {isSavingRules ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  ルールを保存 ({ruleDrafts.length}件)
                </>
              )}
            </button>
          </R_Stack>
        </div>
      </rulePreviewModal.Modal>
    </div>
  )
}
