'use client'

import {useState, useCallback, useEffect} from 'react'
import {TableRow, SentimentType, Extract, HakobunCorrection} from '../types'

interface UseBatchHistoryProps {
  clientId: string | undefined
}

interface UseBatchHistoryReturn {
  /** 読み込み中かどうか */
  isLoading: boolean
  /** テーブル行データ */
  tableRows: TableRow[]
  /** テーブル行を更新 */
  updateTableRow: (rowIndex: number, updates: Partial<TableRow>) => void
  /** 保存中かどうか */
  isSaving: boolean
  /** 個別保存（Correction更新） */
  handleSaveRow: (rowIndex: number) => Promise<void>
  /** 一括保存（変更された行を全て保存） */
  handleSaveAll: () => Promise<void>
  /** データを再読み込み */
  reload: () => Promise<void>
  /** 感情の色クラス取得 */
  getSentimentColor: (sentiment: SentimentType) => string
}

/**
 * 一括登録記録閲覧用hook
 * - APIからデータを取得
 * - TableRow形式に変換
 * - 編集機能を提供
 * - 更新APIを呼び出す
 */
export default function useBatchHistory({
  clientId,
}: UseBatchHistoryProps): UseBatchHistoryReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [tableRows, setTableRows] = useState<TableRow[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [correctionMap, setCorrectionMap] = useState<Map<number, HakobunCorrection>>(new Map())

  // データを読み込む
  const loadData = useCallback(async () => {
    if (!clientId) {
      setTableRows([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/hakobun/batch-history?client_id=${clientId}`)
      const data = await response.json()

      if (!data.success) {
        console.error('Failed to load batch history:', data.error)
        setTableRows([])
        return
      }

      // CorrectionをMapに変換
      const corrections = (data.corrections || []) as HakobunCorrection[]
      const correctionMap = new Map(corrections.map(c => [c.id, c]))

      // TableRow形式に変換
      const rows: TableRow[] = []
      const results = data.results || []

      results.forEach((result: {voice_id: string; extracts: Array<Extract & {correctionId?: number}>}) => {
        result.extracts.forEach((extract, extractIndex) => {
          const correction = extract.correctionId ? correctionMap.get(extract.correctionId) : null

          // Correctionがある場合は修正後の値を、ない場合は元の値を使用
          const feedbackGeneralCategory = correction?.correctGeneralCategory || extract.general_category || 'その他'
          const feedbackCategory = correction?.correctCategory || extract.category
          const feedbackSentiment = (correction?.correctSentiment || extract.sentiment) as SentimentType
          const feedbackComment = correction?.reviewerComment || ''

          rows.push({
            resultIndex: results.indexOf(result),
            extractIndex,
            extract,
            voiceId: result.voice_id,
            feedbackGeneralCategory,
            feedbackCategory,
            feedbackSentiment,
            feedbackComment,
            isModified: false, // 初期状態では変更なし
            correctionId: extract.correctionId, // CorrectionのIDを保持
          })
        })
      })

      setTableRows(rows)
      setCorrectionMap(correctionMap)
    } catch (error) {
      console.error('Load batch history error:', error)
      setTableRows([])
    } finally {
      setIsLoading(false)
    }
  }, [clientId])

  // 初回読み込み
  useEffect(() => {
    loadData()
  }, [loadData])

  // テーブル行の更新
  const updateTableRow = useCallback((rowIndex: number, updates: Partial<TableRow>) => {
    setTableRows(prev => {
      const newRows = [...prev]
      const row = newRows[rowIndex]
      if (row) {
        const updated = {...row, ...updates}

        // 変更があるかチェック
        // Correctionがある場合は、Correctionの修正後の値と比較
        // Correctionがない場合は、元のextractの値と比較
        const correction = row.correctionId ? correctionMap.get(row.correctionId) : null
        const originalGeneralCategory = correction?.correctGeneralCategory || row.extract.general_category || 'その他'
        const originalCategory = correction?.correctCategory || row.extract.category
        const originalSentiment = (correction?.correctSentiment || row.extract.sentiment) as SentimentType
        const originalComment = correction?.reviewerComment || ''

        updated.isModified =
          updated.feedbackGeneralCategory !== originalGeneralCategory ||
          updated.feedbackCategory !== originalCategory ||
          updated.feedbackSentiment !== originalSentiment ||
          updated.feedbackComment !== originalComment

        newRows[rowIndex] = updated
      }
      return newRows
    })
  }, [correctionMap])

  // 個別保存（Correction更新）
  const handleSaveRow = useCallback(async (rowIndex: number) => {
    const row = tableRows[rowIndex]
    if (!row) {
      alert('レコードが見つかりません')
      return
    }
    if (!row.correctionId) {
      alert('このレコードには修正データがありません。一括登録時に修正がなかったレコードは編集できません。')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/hakobun/corrections/${row.correctionId}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          correct_general_category: row.feedbackGeneralCategory || null,
          correct_category: row.feedbackCategory,
          correct_sentiment: row.feedbackSentiment,
          reviewer_comment: row.feedbackComment || null,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // 更新成功後、変更フラグをリセット
        updateTableRow(rowIndex, {isModified: false})
        alert('保存しました')
      } else {
        alert(`保存エラー: ${data.error}`)
      }
    } catch (error) {
      alert(`保存エラー: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }, [tableRows, updateTableRow])

  // 一括保存（変更された行を全て保存）
  const handleSaveAll = useCallback(async () => {
    const modifiedRows = tableRows.filter(row => row.isModified && row.correctionId)
    if (modifiedRows.length === 0) {
      alert('保存する変更がありません')
      return
    }

    setIsSaving(true)
    try {
      // 全ての変更を並列で保存
      const promises = modifiedRows.map(row =>
        fetch(`/api/hakobun/corrections/${row.correctionId}`, {
          method: 'PATCH',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            correct_general_category: row.feedbackGeneralCategory || null,
            correct_category: row.feedbackCategory,
            correct_sentiment: row.feedbackSentiment,
            reviewer_comment: row.feedbackComment || null,
          }),
        }).then(res => res.json())
      )

      const results = await Promise.all(promises)
      const successCount = results.filter(r => r.success).length
      const failCount = results.length - successCount

      if (failCount === 0) {
        // 全て成功
        setTableRows(prev =>
          prev.map(row => {
            if (row.isModified && row.correctionId) {
              return {...row, isModified: false}
            }
            return row
          })
        )
        alert(`${successCount}件の変更を保存しました`)
      } else {
        alert(`${successCount}件保存成功、${failCount}件保存失敗`)
      }
    } catch (error) {
      alert(`保存エラー: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }, [tableRows])

  // 感情の色クラス取得
  const getSentimentColor = useCallback((sentiment: SentimentType): string => {
    switch (sentiment) {
      case '好意的':
        return 'bg-green-100 text-green-800'
      case '不満':
        return 'bg-red-100 text-red-800'
      case 'リクエスト':
        return 'bg-blue-100 text-blue-800'
      case 'その他':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }, [])

  return {
    isLoading,
    tableRows,
    updateTableRow,
    isSaving,
    handleSaveRow,
    handleSaveAll,
    reload: loadData,
    getSentimentColor,
  }
}

