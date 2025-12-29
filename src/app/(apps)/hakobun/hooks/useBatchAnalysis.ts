'use client'

import {useState, useCallback, useEffect} from 'react'
import {AnalysisResult, BatchAnalyzeResponse, ProposedCategory, TableRow, SentimentType, PendingGeneralCategory, PendingCategory} from '../types'
import {prepareCsvData, generateCsv, downloadCsv} from '../utils/csvExport'

interface UseBatchAnalysisProps {
  clientId: string | undefined
  computeCategoryDiff: (results: AnalysisResult[]) => void
  /** 保留中のカテゴリをDBに一括保存する関数 */
  savePendingCategories: (
    usedGeneralCategories?: Set<string>,
    usedCategories?: Set<string>
  ) => Promise<{
    success: boolean
    savedGeneralCategories: number
    savedCategories: number
    savedGeneralCategoriesList: PendingGeneralCategory[]
    savedCategoriesList: PendingCategory[]
    error?: string
  }>
  /** 保留中のカテゴリをクリアする関数 */
  clearPendingCategories: () => void
}

interface UseBatchAnalysisReturn {
  /** 入力テキスト（改行区切り） */
  rawTexts: string
  /** 入力テキストを更新 */
  setRawTexts: (value: string) => void
  /** カテゴリ生成提案を許可 */
  allowCategoryGeneration: boolean
  /** カテゴリ生成提案の許可を更新 */
  setAllowCategoryGeneration: (value: boolean) => void
  /** 分析中かどうか */
  isAnalyzing: boolean
  /** 分析結果 */
  results: AnalysisResult[]
  /** 提案されたカテゴリ */
  proposedCategories: ProposedCategory[]
  /** テーブル行データ */
  tableRows: TableRow[]
  /** テーブル行を更新 */
  updateTableRow: (rowIndex: number, updates: Partial<TableRow>) => void
  /** 一括保存中かどうか */
  isSavingAll: boolean
  /** 一括分析実行 */
  handleBatchAnalyze: () => Promise<void>
  /** 一括保存 */
  handleSaveAll: () => Promise<void>
  /** 結果をクリア */
  clearResults: () => void
  /** 感情の色クラス取得 */
  getSentimentColor: (sentiment: SentimentType) => string
  /** CSVエクスポート可能かどうか（保存成功後） */
  canExportCsv: boolean
  /** CSVエクスポート実行 */
  exportToCsv: () => void
}

/**
 * 一括分析用hook
 * - 入力管理
 * - 一括分析API呼び出し
 * - テーブル行の管理
 * - 一括保存機能（保留中カテゴリも同時保存）
 */
export default function useBatchAnalysis({
  clientId,
  computeCategoryDiff,
  savePendingCategories,
  clearPendingCategories,
}: UseBatchAnalysisProps): UseBatchAnalysisReturn {
  const [rawTexts, setRawTexts] = useState<string>('')
  const [allowCategoryGeneration, setAllowCategoryGeneration] = useState<boolean>(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<AnalysisResult[]>([])
  const [proposedCategories, setProposedCategories] = useState<ProposedCategory[]>([])
  const [tableRows, setTableRows] = useState<TableRow[]>([])
  const [isSavingAll, setIsSavingAll] = useState(false)
  // CSVエクスポート用：保存成功後のデータ
  const [savedDataForCsv, setSavedDataForCsv] = useState<{
    tableRows: TableRow[]
    results: AnalysisResult[]
    savedGeneralCategories: PendingGeneralCategory[]
    savedCategories: PendingCategory[]
  } | null>(null)

  // テーブル行の更新
  const updateTableRow = useCallback((rowIndex: number, updates: Partial<TableRow>) => {
    setTableRows(prev => {
      const newRows = [...prev]
      const row = newRows[rowIndex]
      if (row) {
        const updated = {...row, ...updates}
        // 変更があるかチェック
        updated.isModified =
          updated.feedbackGeneralCategory !== (row.extract.general_category || 'その他') ||
          updated.feedbackCategory !== row.extract.category ||
          updated.feedbackSentiment !== row.extract.sentiment ||
          updated.feedbackComment.trim() !== ''

        newRows[rowIndex] = updated
      }

      return newRows
    })
  }, [])

  // 結果が更新されたらテーブル行を生成
  useEffect(() => {
    if (results.length > 0) {
      const rows: TableRow[] = []
      results.forEach((result, resultIndex) => {
        result.extracts.forEach((extract, extractIndex) => {
          rows.push({
            resultIndex,
            extractIndex,
            extract,
            voiceId: result.voice_id,
            feedbackGeneralCategory: extract.general_category || 'その他',
            feedbackCategory: extract.category,
            feedbackSentiment: extract.sentiment,
            feedbackComment: '',
            isModified: false,
          })
        })
      })
      setTableRows(rows)

      // カテゴリ差分を計算
      computeCategoryDiff(results)
    }
  }, [results, computeCategoryDiff])

  // 一括分析実行
  const handleBatchAnalyze = useCallback(async () => {
    if (!clientId || !rawTexts.trim()) {
      alert('クライアントが選択されていないか、テキストが入力されていません')
      return
    }

    // 改行区切りでテキストを分割
    const texts = rawTexts
      .split('\n')
      .map(t => t.trim())
      .filter(t => t.length > 0)

    if (texts.length === 0) {
      alert('有効なテキストがありません')
      return
    }

    setIsAnalyzing(true)
    setResults([])
    setProposedCategories([])
    setTableRows([])
    // 保留中のカテゴリもクリア
    clearPendingCategories()

    try {
      const response = await fetch('/api/hakobun/batch-analyze', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          client_id: clientId,
          texts,
          allow_category_generation: allowCategoryGeneration,
        }),
      })

      const data: BatchAnalyzeResponse = await response.json()

      if (data.success && data.results) {
        setResults(data.results)
        if (data.proposed_categories) {
          setProposedCategories(data.proposed_categories)
        }
      } else {
        alert(`分析エラー: ${data.error}`)
      }
    } catch (error) {
      alert(`分析エラー: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsAnalyzing(false)
    }
  }, [clientId, rawTexts, allowCategoryGeneration, clearPendingCategories])

  // 一括保存
  const handleSaveAll = useCallback(async () => {
    if (!clientId || results.length === 0) {
      alert('保存するデータがありません')
      return
    }

    setIsSavingAll(true)

    try {
      // 1. tableRowsから実際に使用されているカテゴリ・一般カテゴリを抽出
      const usedGeneralCategories = new Set<string>()
      const usedCategories = new Set<string>()

      tableRows.forEach((row) => {
        // 修正一般カテゴリが設定されている場合
        if (row.feedbackGeneralCategory) {
          usedGeneralCategories.add(row.feedbackGeneralCategory)
        }
        // 修正カテゴリが設定されている場合
        if (row.feedbackCategory) {
          usedCategories.add(row.feedbackCategory)
        }
      })

      // 2. 実際に使用されている保留中のカテゴリのみをDBに保存
      const pendingResult = await savePendingCategories(usedGeneralCategories, usedCategories)
      if (!pendingResult.success && pendingResult.error) {
        console.error('Failed to save pending categories:', pendingResult.error)
        // エラーがあっても続行（一部保存された可能性がある）
      }

      // 3. 修正があったレコードのみを抽出（Correction保存用）
      const modifiedRows = tableRows.filter(row => row.isModified)

      // 4. batch-save APIを呼び出し
      const response = await fetch('/api/hakobun/batch-save', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          client_id: clientId,
          voices: results.map(result => {
            const firstExtract = result.extracts[0]
            return {
              voice_id: result.voice_id,
              raw_text: firstExtract?.raw_text || '',
              result: result,
            }
          }),
          corrections: modifiedRows.map(row => ({
            voice_id: row.voiceId,
            extract_index: row.extractIndex,
            original_sentence: row.extract.sentence,
            original_general_category: row.extract.general_category || undefined,
            original_category: row.extract.category || undefined,
            original_sentiment: row.extract.sentiment || undefined,
            correct_general_category: row.feedbackGeneralCategory || undefined,
            correct_category: row.feedbackCategory,
            correct_sentiment: row.feedbackSentiment,
            reviewer_comment: row.feedbackComment || undefined,
          })),
        }),
      })

      const data = await response.json()

      if (data.success) {
        // 保存成功後、変更フラグをリセット
        const resetTableRows = tableRows.map(row => ({
          ...row,
          isModified: false,
          feedbackComment: '',
        }))
        setTableRows(resetTableRows)

        // CSVエクスポート用データを保存
        setSavedDataForCsv({
          tableRows: resetTableRows,
          results,
          savedGeneralCategories: pendingResult.savedGeneralCategoriesList,
          savedCategories: pendingResult.savedCategoriesList,
        })

        const messages: string[] = []
        // 保留中カテゴリの保存結果
        if (pendingResult.savedGeneralCategories > 0) {
          messages.push(`一般カテゴリ（新規）: ${pendingResult.savedGeneralCategories}件`)
        }
        if (pendingResult.savedCategories > 0) {
          messages.push(`カテゴリ（新規）: ${pendingResult.savedCategories}件`)
        }
        // Voice/Correction保存結果
        if (data.saved_voices > 0) {
          messages.push(`Voice: ${data.saved_voices}件`)
        }
        if (data.saved_general_categories > 0) {
          messages.push(`一般カテゴリ: ${data.saved_general_categories}件`)
        }
        if (data.saved_categories > 0) {
          messages.push(`カテゴリ: ${data.saved_categories}件`)
        }
        if (data.saved_corrections > 0) {
          messages.push(`修正データ: ${data.saved_corrections}件`)
        }

        alert(`保存完了: ${messages.join('、')}`)
      } else {
        alert(`保存エラー: ${data.error}`)
      }
    } catch (error) {
      alert(`保存エラー: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSavingAll(false)
    }
  }, [clientId, results, tableRows, savePendingCategories])

  // 結果をクリア
  const clearResults = useCallback(() => {
    setResults([])
    setProposedCategories([])
    setTableRows([])
    setSavedDataForCsv(null)
    clearPendingCategories()
  }, [clearPendingCategories])

  // CSVエクスポート実行
  const exportToCsv = useCallback(() => {
    if (!savedDataForCsv) {
      alert('エクスポートするデータがありません')
      return
    }

    const csvData = prepareCsvData(
      savedDataForCsv.tableRows,
      savedDataForCsv.results,
      savedDataForCsv.savedGeneralCategories,
      savedDataForCsv.savedCategories
    )
    const csvContent = generateCsv(csvData)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const filename = `hakobun-batch-export-${timestamp}.csv`
    downloadCsv(csvContent, filename)
  }, [savedDataForCsv])

  // 感情の色クラス取得
  const getSentimentColor = useCallback((sentiment: SentimentType): string => {
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
  }, [])

  return {
    rawTexts,
    setRawTexts,
    allowCategoryGeneration,
    setAllowCategoryGeneration,
    isAnalyzing,
    results,
    proposedCategories,
    tableRows,
    updateTableRow,
    isSavingAll,
    handleBatchAnalyze,
    handleSaveAll,
    clearResults,
    getSentimentColor,
    canExportCsv: savedDataForCsv !== null,
    exportToCsv,
  }
}
