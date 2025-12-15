'use client'

import {useState, useCallback} from 'react'
import {v4 as uuidv4} from 'uuid'
import {
  AppState,
  AnalysisStatus,
  LogEntry,
  AnalysisResult,
  HakobunCategory,
  HakobunRule,
  HakobunCorrection,
  HakobunClient,
  AnalyzeResponse,
  FeedbackResponse,
  ExtractEdit,
  SentimentType,
} from '../types'

const initialState: AppState = {
  selectedClientId: null,
  rawText: '',
  analysisResult: null,
  status: 'idle',
  logs: [],
  categories: [],
  rules: [],
  corrections: [],
}

export const useHakobunAnalysis = () => {
  const [state, setState] = useState<AppState>(initialState)
  const [clients, setClients] = useState<HakobunClient[]>([])
  const [editedExtracts, setEditedExtracts] = useState<ExtractEdit[]>([])

  // ログ追加
  const addLog = useCallback((type: LogEntry['type'], message: string) => {
    const log: LogEntry = {
      id: uuidv4(),
      timestamp: new Date(),
      type,
      message,
    }
    setState(prev => ({
      ...prev,
      logs: [...prev.logs, log],
    }))
  }, [])

  // クライアント一覧取得
  const fetchClients = useCallback(async () => {
    try {
      const response = await fetch('/api/hakobun-analysis/clients')
      const data = await response.json()
      if (data.success) {
        setClients(data.clients)
      } else {
        addLog('error', `クライアント取得エラー: ${data.error}`)
      }
    } catch (error) {
      addLog('error', `クライアント取得エラー: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, [addLog])

  // クライアント選択
  const selectClient = useCallback(
    async (clientId: string) => {
      setState(prev => ({...prev, selectedClientId: clientId}))

      // カテゴリ、ルール、修正事例を取得
      try {
        const [categoriesRes, rulesRes, correctionsRes] = await Promise.all([
          fetch(`/api/hakobun-analysis/categories?client_id=${clientId}`),
          fetch(`/api/hakobun-analysis/rules?client_id=${clientId}`),
          fetch(`/api/hakobun-analysis/feedback?client_id=${clientId}`),
        ])

        const [categoriesData, rulesData, correctionsData] = await Promise.all([
          categoriesRes.json(),
          rulesRes.json(),
          correctionsRes.json(),
        ])

        setState(prev => ({
          ...prev,
          categories: categoriesData.success ? categoriesData.categories : [],
          rules: rulesData.success ? rulesData.rules : [],
          corrections: correctionsData.success ? correctionsData.corrections : [],
        }))

        addLog('info', `クライアント「${clientId}」のデータを読み込みました`)
      } catch (error) {
        addLog('error', `データ取得エラー: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    },
    [addLog]
  )

  // テキスト更新
  const setRawText = useCallback((text: string) => {
    setState(prev => ({...prev, rawText: text}))
  }, [])

  // 分析実行
  const analyze = useCallback(async () => {
    if (!state.selectedClientId || !state.rawText.trim()) {
      addLog('error', 'クライアントとテキストを入力してください')
      return
    }

    setState(prev => ({...prev, status: 'analyzing'}))
    addLog('info', '分析を開始します...')

    try {
      const response = await fetch('/api/hakobun-analysis/analyze', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          client_id: state.selectedClientId,
          raw_text: state.rawText,
        }),
      })

      const data: AnalyzeResponse = await response.json()

      if (data.success && data.result) {
        setState(prev => ({
          ...prev,
          analysisResult: data.result!,
          status: 'completed',
        }))
        addLog('success', `分析完了: ${data.result.segments.length}個のセグメントを検出`)

        // 編集用の初期データを作成
        const initialEdits: ExtractEdit[] = []
        data.result.segments.forEach(segment => {
          segment.extracts.forEach((extract, index) => {
            initialEdits.push({
              segmentId: segment.segment_id,
              extractIndex: index,
              originalExtract: extract,
              editedCategoryCode: extract.category_id,
              editedSentiment: extract.sentiment,
              comment: '',
              isModified: false,
            })
          })
        })
        setEditedExtracts(initialEdits)
      } else {
        setState(prev => ({...prev, status: 'error'}))
        addLog('error', `分析エラー: ${data.error}`)
      }
    } catch (error) {
      setState(prev => ({...prev, status: 'error'}))
      addLog('error', `分析エラー: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, [state.selectedClientId, state.rawText, addLog])

  // 抽出結果の編集
  const updateExtractEdit = useCallback((segmentId: number, extractIndex: number, updates: Partial<ExtractEdit>) => {
    setEditedExtracts(prev =>
      prev.map(edit => {
        if (edit.segmentId === segmentId && edit.extractIndex === extractIndex) {
          const updated = {...edit, ...updates}
          // 変更があるかチェック
          updated.isModified =
            updated.editedCategoryCode !== edit.originalExtract.category_id ||
            updated.editedSentiment !== edit.originalExtract.sentiment ||
            updated.comment.trim() !== ''
          return updated
        }
        return edit
      })
    )
  }, [])

  // フィードバック送信
  const submitFeedback = useCallback(async () => {
    if (!state.selectedClientId || !state.analysisResult) {
      addLog('error', 'フィードバック送信エラー: 分析結果がありません')
      return
    }

    const modifiedEdits = editedExtracts.filter(edit => edit.isModified)
    if (modifiedEdits.length === 0) {
      addLog('warning', '修正された項目がありません')
      return
    }

    addLog('info', `${modifiedEdits.length}件のフィードバックを送信します...`)

    try {
      const response = await fetch('/api/hakobun-analysis/feedback', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          client_id: state.selectedClientId,
          voice_id: state.analysisResult.voice_id,
          corrections: modifiedEdits.map(edit => ({
            segment_id: edit.segmentId,
            extract_index: edit.extractIndex,
            original_text_fragment: edit.originalExtract.text_fragment,
            correct_category_code: edit.editedCategoryCode,
            correct_sentiment: edit.editedSentiment,
            reviewer_comment: edit.comment || undefined,
          })),
        }),
      })

      const data: FeedbackResponse = await response.json()

      if (data.success) {
        addLog('success', `${data.saved_count}件のフィードバックを保存しました`)
        // 修正事例を再取得
        const correctionsRes = await fetch(`/api/hakobun-analysis/feedback?client_id=${state.selectedClientId}`)
        const correctionsData = await correctionsRes.json()
        if (correctionsData.success) {
          setState(prev => ({...prev, corrections: correctionsData.corrections}))
        }
      } else {
        addLog('error', `フィードバック送信エラー: ${data.error}`)
      }
    } catch (error) {
      addLog('error', `フィードバック送信エラー: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, [state.selectedClientId, state.analysisResult, editedExtracts, addLog])

  // リセット
  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      rawText: '',
      analysisResult: null,
      status: 'idle',
      logs: [],
    }))
    setEditedExtracts([])
  }, [])

  // ログクリア
  const clearLogs = useCallback(() => {
    setState(prev => ({...prev, logs: []}))
  }, [])

  return {
    state,
    clients,
    editedExtracts,
    fetchClients,
    selectClient,
    setRawText,
    analyze,
    updateExtractEdit,
    submitFeedback,
    reset,
    addLog,
    clearLogs,
  }
}
