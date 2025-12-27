'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import {
  BatchAnalyzeResponse,
  AnalysisResult,
  ProposedCategory,
  Extract,
  HakobunCategory,
  SentimentType,
} from '../../types'
import { Loader2, Send, Sparkles, AlertCircle, Plus, Save } from 'lucide-react'
import useSelectedClient from '../../(globalHooks)/useSelectedClient'
import useMyNavigation from '@cm/hooks/globalHooks/useMyNavigation'
import useModal from '@cm/components/utils/modal/useModal'
import { cn } from '@cm/shadcn/lib/utils'

// テーブル行用の型
interface TableRow {
  resultIndex: number
  extractIndex: number
  extract: Extract
  voiceId: string
  feedbackGeneralCategory: string
  feedbackCategory: string
  feedbackSentiment: SentimentType
  feedbackComment: string
  isModified: boolean
}

export default function BatchAnalysisPage() {
  const { selectedClient } = useSelectedClient()
  const { getHref } = useMyNavigation()
  const [rawTexts, setRawTexts] = useState<string>('')
  const [allowCategoryGeneration, setAllowCategoryGeneration] = useState<boolean>(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<AnalysisResult[]>([])
  const [proposedCategories, setProposedCategories] = useState<ProposedCategory[]>([])
  const [categories, setCategories] = useState<HakobunCategory[]>([])
  const [tableRows, setTableRows] = useState<TableRow[]>([])
  const [isSavingAll, setIsSavingAll] = useState(false)
  const [industryGeneralCategories, setIndustryGeneralCategories] = useState<{name: string; description: string | null}[]>([])
  const [proposedCategoryGeneralCategories, setProposedCategoryGeneralCategories] = useState<Record<number, string>>({})

  // カテゴリ作成モーダル
  const categoryModal = useModal<number | null>()
  const categoryModalRowIndex = categoryModal.open
  const [newCategoryCode, setNewCategoryCode] = useState('')
  const [newGeneralCategory, setNewGeneralCategory] = useState('')
  const [newSpecificCategory, setNewSpecificCategory] = useState('')
  const [newCategoryDescription, setNewCategoryDescription] = useState('')
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)

  // カテゴリ取得
  useEffect(() => {
    if (selectedClient) {
      fetch(`/api/hakobun/categories?client_id=${selectedClient?.clientId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setCategories(data.categories)
          }
        })
        .catch(error => console.error('Failed to fetch categories:', error))

      // 業種別一般カテゴリ取得
      fetch(`/api/hakobun/clients`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.clients) {
            const client = data.clients.find((c: any) => c.clientId === selectedClient.clientId)
            if (client?.industryId) {
              fetch(`/api/hakobun/industries/${client.industryId}/general-categories`)
                .then(res => res.json())
                .then(industryData => {
                  if (industryData.success) {
                    setIndustryGeneralCategories(industryData.generalCategories)
                  }
                })
                .catch(error => console.error('Failed to fetch industry general categories:', error))
            }
          }
        })
        .catch(error => console.error('Failed to fetch clients:', error))
    }
  }, [selectedClient])

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
    }
  }, [results])

  // 一括分析実行
  const handleBatchAnalyze = useCallback(async () => {
    if (!selectedClient?.clientId || !rawTexts.trim()) {
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

    try {
      const response = await fetch('/api/hakobun/batch-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: selectedClient?.clientId,
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
  }, [selectedClient?.clientId, rawTexts, allowCategoryGeneration])

  // テーブル行の更新
  const updateTableRow = useCallback((rowIndex: number, updates: Partial<TableRow>) => {
    setTableRows(prev => {
      const newRows = [...prev]
      const row = newRows[rowIndex]
      if (row) {
        const updated = { ...row, ...updates }
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

  // 新規カテゴリかどうかを判定
  const isNewCategory = useCallback(
    (categoryName: string) => {
      return !categories.some(c => c.specificCategory === categoryName)
    },
    [categories]
  )

  // 一括保存（新規カテゴリ登録 + フィードバック保存）
  const handleSaveAll = useCallback(async () => {
    if (!selectedClient?.clientId || tableRows.length === 0) {
      alert('保存するデータがありません')
      return
    }

    setIsSavingAll(true)

    try {
      // 修正があったレコードのみを抽出（フィードバック保存用）
      const modifiedRows = tableRows.filter(row => row.isModified)

      // 1. 新規カテゴリを抽出（マスタに存在しないカテゴリ）- 全てのレコードから抽出
      const newCategoriesMap = new Map<string, { generalCategory: string; specificCategory: string }>()
      tableRows.forEach(row => {
        if (isNewCategory(row.feedbackCategory)) {
          if (!newCategoriesMap.has(row.feedbackCategory)) {
            newCategoriesMap.set(row.feedbackCategory, {
              generalCategory: row.feedbackGeneralCategory,
              specificCategory: row.feedbackCategory,
            })
          }
        }
      })

      // 2. 新規カテゴリをマスタ登録
      const createdCategories: HakobunCategory[] = []
      for (const [categoryName, categoryData] of newCategoriesMap.entries()) {
        try {
          const response = await fetch('/api/hakobun/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              client_id: selectedClient.clientId,
              category_code: `CAT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              general_category: categoryData.generalCategory,
              specific_category: categoryData.specificCategory,
              description: null,
            }),
          })

          const data = await response.json()
          if (data.success && data.category) {
            createdCategories.push(data.category)
          }
        } catch (error) {
          console.error(`カテゴリ作成エラー: ${categoryName}`, error)
        }
      }

      // カテゴリ一覧を更新
      if (createdCategories.length > 0) {
        setCategories(prev => [...prev, ...createdCategories])
      }

      // 3. フィードバックをvoiceIdごとにグループ化（修正があったレコードのみ保存）
      let savedCount = 0
      if (modifiedRows.length > 0) {
        const feedbacksByVoiceId = new Map<string, typeof tableRows>()
        modifiedRows.forEach(row => {
          if (!feedbacksByVoiceId.has(row.voiceId)) {
            feedbacksByVoiceId.set(row.voiceId, [])
          }
          feedbacksByVoiceId.get(row.voiceId)!.push(row)
        })

        // 4. 各voiceIdごとにフィードバックを保存
        for (const [voiceId, rows] of feedbacksByVoiceId.entries()) {
          try {
            const response = await fetch('/api/hakobun/feedback', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                client_id: selectedClient.clientId,
                voice_id: voiceId,
                corrections: rows.map(row => ({
                  extract_index: row.extractIndex,
                  original_sentence: row.extract.sentence,

                  // 修正前の情報（日本語名称で記録）
                  original_general_category: row.extract.general_category || 'その他',
                  original_category: row.extract.category,
                  original_sentiment: row.extract.sentiment,

                  // 修正後の情報（日本語名称で記録）
                  correct_general_category: row.feedbackGeneralCategory,
                  correct_category: row.feedbackCategory,
                  correct_sentiment: row.feedbackSentiment,

                  reviewer_comment: row.feedbackComment || undefined,
                })),
              }),
            })

            const data = await response.json()
            if (data.success) {
              savedCount += rows.length
            }
          } catch (error) {
            console.error(`フィードバック保存エラー: ${voiceId}`, error)
          }
        }
      }

      // 5. 保存成功後、変更フラグをリセット
      setTableRows(prev =>
        prev.map(row => ({
          ...row,
          isModified: false,
          feedbackComment: '',
        }))
      )

      // 保存結果メッセージ
      const messages: string[] = []
      if (savedCount > 0) {
        messages.push(`${savedCount}件のフィードバックを保存しました`)
      }
      if (createdCategories.length > 0) {
        messages.push(`新規カテゴリ${createdCategories.length}件を登録しました`)
      }

      if (messages.length > 0) {
        alert(`保存完了: ${messages.join('。')}`)
      } else {
        alert('保存するデータがありませんでした')
      }
    } catch (error) {
      alert(`保存エラー: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSavingAll(false)
    }
  }, [selectedClient?.clientId, tableRows, isNewCategory])

  // カテゴリ作成
  const handleCreateCategory = useCallback(async () => {
    if (!selectedClient?.clientId || !newCategoryCode || !newGeneralCategory || !newSpecificCategory) {
      alert('カテゴリコード、大分類、小分類は必須です')
      return
    }

    setIsCreatingCategory(true)

    try {
      const response = await fetch('/api/hakobun/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: selectedClient?.clientId,
          category_code: newCategoryCode,
          general_category: newGeneralCategory,
          specific_category: newSpecificCategory,
          description: newCategoryDescription || null,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // カテゴリ一覧を更新
        setCategories(prev => [...prev, data.category])
        // 作成したカテゴリを選択状態にする
        if (categoryModalRowIndex !== null) {
          updateTableRow(categoryModalRowIndex, { feedbackCategory: data.category.specificCategory })
        }
        // モーダルを閉じてフォームをリセット
        categoryModal.handleClose()
        setNewCategoryCode('')
        setNewGeneralCategory('')
        setNewSpecificCategory('')
        setNewCategoryDescription('')
        alert('カテゴリを作成しました')
      } else {
        alert(`カテゴリ作成エラー: ${data.error}`)
      }
    } catch (error) {
      alert(`カテゴリ作成エラー: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsCreatingCategory(false)
    }
  }, [selectedClient?.clientId, newCategoryCode, newGeneralCategory, newSpecificCategory, newCategoryDescription])

  // 感情の色分け
  const getSentimentColor = (sentiment: SentimentType) => {
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

  // ポジネガの色分け
  const getPosiNegaColor = (posiNega: string) => {
    switch (posiNega) {
      case 'positive':
        return 'bg-green-100 text-green-800'
      case 'negative':
        return 'bg-red-100 text-red-800'
      case 'neutral':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <C_Stack className="max-w-[1800px] mx-auto gap-6">
        {/* 入力エリア */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <C_Stack className="gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                感想文テキスト（改行区切りで複数入力）
              </label>
              <textarea
                value={rawTexts}
                onChange={e => setRawTexts(e.target.value)}
                placeholder="例：&#10;ランチとは雰囲気が違うしよかったんですが、とにかく音楽がでかい！&#10;ハンバーグが昼とあんまり見栄えに変化がなくて…その分値段の差がちょっとキツいなと感じました。&#10;抹茶チーズケーキ絶品です！"
                className="w-full min-h-[300px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y font-mono text-sm"
                disabled={isAnalyzing}
              />
              <p className="text-xs text-gray-500 mt-2">
                複数の感想文を改行で区切って入力してください。各行が1つの分析対象として処理されます。
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allowCategoryGeneration"
                checked={allowCategoryGeneration}
                onChange={e => setAllowCategoryGeneration(e.target.checked)}
                disabled={isAnalyzing}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="allowCategoryGeneration" className="text-sm text-gray-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                カテゴリ生成提案を許可する（マスターにないカテゴリを提案）
              </label>
            </div>

            <R_Stack className="justify-end">
              <button
                onClick={handleBatchAnalyze}
                disabled={isAnalyzing || !selectedClient?.clientId || !rawTexts.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    一括分析実行
                  </>
                )}
              </button>
            </R_Stack>
          </C_Stack>
        </div>

        {/* 提案カテゴリ */}
        {proposedCategories.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <R_Stack className="items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-bold text-gray-900">提案された新規カテゴリ</h2>
            </R_Stack>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-purple-100 border-b border-purple-300">
                    <th className="text-left text-xs font-medium text-gray-700 uppercase tracking-wider p-3">カテゴリ名</th>
                    <th className="text-left text-xs font-medium text-gray-700 uppercase tracking-wider p-3">一般カテゴリ</th>
                    <th className="text-left text-xs font-medium text-gray-700 uppercase tracking-wider p-3">出現回数</th>
                    <th className="text-left text-xs font-medium text-gray-700 uppercase tracking-wider p-3">登録</th>
                  </tr>
                </thead>
                <tbody>
                  {proposedCategories.map((proposed, index) => {
                    const generalCategory = proposedCategoryGeneralCategories[index] || (industryGeneralCategories.length > 0 ? industryGeneralCategories[0].name : '')
                    return (
                      <tr key={index} className="bg-white border-b border-purple-200 hover:bg-purple-50">
                        <td className="p-3">
                          <div className="font-medium text-gray-900">{proposed.category}</div>
                          <details className="mt-1">
                            <summary className="text-xs text-gray-500 cursor-pointer">使用例を見る</summary>
                            <ul className="text-xs text-gray-500 space-y-1 mt-1 pl-4">
                              {proposed.examples.map((example, i) => (
                                <li key={i}>• {example.substring(0, 80)}...</li>
                              ))}
                            </ul>
                          </details>
                        </td>
                        <td className="p-3">
                          {industryGeneralCategories.length > 0 ? (
                            <select
                              value={generalCategory}
                              onChange={e => setProposedCategoryGeneralCategories({...proposedCategoryGeneralCategories, [index]: e.target.value})}
                              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white w-full"
                            >
                              {industryGeneralCategories.map(gc => (
                                <option key={gc.name} value={gc.name}>{gc.name}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-sm text-gray-500">業種が設定されていません</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            {proposed.count}回
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={async () => {
                              if (!selectedClient?.clientId) {
                                alert('クライアントが選択されていません')
                                return
                              }
                              if (!generalCategory) {
                                alert('一般カテゴリを選択してください')
                                return
                              }
                              try {
                                const response = await fetch('/api/hakobun/categories', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    client_id: selectedClient.clientId,
                                    category_code: `CAT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                    general_category: generalCategory,
                                    specific_category: proposed.category,
                                    description: null,
                                  }),
                                })
                                const data = await response.json()
                                if (data.success) {
                                  alert('カテゴリを登録しました')
                                  setCategories(prev => [...prev, data.category])
                                  setProposedCategories(prev => prev.filter((_, i) => i !== index))
                                  setProposedCategoryGeneralCategories(prev => {
                                    const newState = {...prev}
                                    delete newState[index]
                                    return newState
                                  })
                                } else {
                                  alert(`登録エラー: ${data.error}`)
                                }
                              } catch (error) {
                                console.error('Category registration error:', error)
                                alert('登録に失敗しました')
                              }
                            }}
                            disabled={!generalCategory || industryGeneralCategories.length === 0}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                              !generalCategory || industryGeneralCategories.length === 0
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            <Plus className="w-4 h-4" />
                            登録
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">提案カテゴリについて</p>
                <p>
                  これらのカテゴリは分析結果で使用されましたが、マスターに登録されていません。
                  必要に応じてカテゴリ管理画面で登録するか、フィードバック時に新規作成してください。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 分析結果テーブル */}
        {tableRows.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 p-4 bg-gray-50">
              <R_Stack className="justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">
                  分析結果とフィードバック ({tableRows.length}行)
                  {tableRows.filter(r => r.isModified).length > 0 && (
                    <span className="ml-2 text-sm font-normal text-yellow-600">
                      ({tableRows.filter(r => r.isModified).length}件の変更あり)
                    </span>
                  )}
                  {tableRows.filter(r => r.isModified).length === 0 && tableRows.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      (全てのレコードを保存します)
                    </span>
                  )}
                </h2>
                <button
                  onClick={handleSaveAll}
                  disabled={isSavingAll || tableRows.length === 0}
                  className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${!isSavingAll && tableRows.length > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  {isSavingAll ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      一括保存
                    </>
                  )}
                </button>
              </R_Stack>
            </div>
            <div className={cn(
              //
              '[&_th]:p-2',
              '[&_td]:p-2',
              '[&_td]:min-w-[120px]',
              "overflow-x-auto  ")}>
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {/* 分析結果列 */}
                    <th className=" text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200 min-w-[200px]">
                      原文
                    </th>
                    <th className=" text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200 min-w-[150px]">
                      トピック単位
                    </th>
                    <th className=" text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      一般カテゴリ
                    </th>
                    <th className=" text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      カテゴリ
                    </th>
                    <th className=" text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      感情
                    </th>
                    <th className=" text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r-2 border-gray-300">
                      熱量
                    </th>
                    {/* フィードバック列 */}
                    <th className=" text-left text-xs font-medium text-blue-700 uppercase tracking-wider border-l-2 border-blue-300 bg-blue-50">
                      修正一般カテゴリ
                    </th>
                    <th className=" text-left text-xs font-medium text-blue-700 uppercase tracking-wider bg-blue-50">
                      修正カテゴリ
                    </th>
                    <th className=" text-left text-xs font-medium text-blue-700 uppercase tracking-wider bg-blue-50">
                      修正感情
                    </th>
                    <th className=" text-left text-xs font-medium text-blue-700 uppercase tracking-wider bg-blue-50">
                      コメント
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableRows.map((row, rowIndex) => (
                    <tr
                      key={`${row.resultIndex}-${row.extractIndex}`}
                      className={row.isModified ? 'bg-yellow-50' : 'hover:bg-gray-50'}
                    >
                      {/* 分析結果列 */}
                      <td className=" text-sm text-gray-900 border-r border-gray-200 max-w-[250px]">
                        <div className="break-words text-gray-500 text-xs leading-relaxed">
                          {row.extract.raw_text || '-'}
                        </div>
                      </td>
                      <td className=" text-sm text-gray-900 border-r border-gray-200 max-w-[200px]">
                        <div className="break-words font-medium">{row.extract.sentence}</div>
                      </td>
                      <td className=" text-sm border-r border-gray-200">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {row.extract.general_category || 'その他'}
                        </span>
                      </td>
                      <td className=" text-sm border-r border-gray-200">
                        <span
                          className={cn(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            row.extract.is_new_generated || isNewCategory(row.extract.category)
                              ? 'bg-purple-100 text-purple-800 border-2 border-purple-300'
                              : 'bg-blue-100 text-blue-800'
                          )}
                        >
                          {row.extract.category}
                          {(row.extract.is_new_generated || isNewCategory(row.extract.category)) && (
                            <span className="ml-1 text-purple-600 font-bold" title="新規生成カテゴリ">
                              ✨
                            </span>
                          )}
                        </span>
                      </td>
                      <td className=" text-sm border-r border-gray-200">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSentimentColor(row.extract.sentiment)}`}
                        >
                          {row.extract.sentiment}
                        </span>
                      </td>
                      <td className=" text-sm border-r-2 border-gray-300">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[60px]">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${row.extract.magnitude}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 w-8 text-right">{row.extract.magnitude}</span>
                        </div>
                      </td>
                      {/* フィードバック列 */}
                      <td className=" text-sm border-l-2 border-blue-300 bg-blue-50">
                        <select
                          value={row.feedbackGeneralCategory}
                          onChange={e => updateTableRow(rowIndex, { feedbackGeneralCategory: e.target.value })}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                          <option value="接客・サービス">接客・サービス</option>
                          <option value="店内">店内</option>
                          <option value="料理・ドリンク">料理・ドリンク</option>
                          <option value="備品・設備">備品・設備</option>
                          <option value="値段">値段</option>
                          <option value="立地">立地</option>
                          <option value="その他">その他</option>
                        </select>
                      </td>
                      <td className=" text-sm bg-blue-50">
                        <div className="flex items-center gap-2">
                          <select
                            value={row.feedbackCategory}
                            onChange={e => updateTableRow(rowIndex, { feedbackCategory: e.target.value })}
                            className={cn(
                              'flex-1 text-sm border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white',
                              isNewCategory(row.feedbackCategory)
                                ? 'border-purple-400 border-2 bg-purple-50'
                                : 'border-gray-300'
                            )}
                          >
                            {categories
                              .filter(c => c.enabled)
                              .map(cat => (
                                <option key={cat.id} value={cat.specificCategory}>
                                  {cat.specificCategory}
                                </option>
                              ))}
                            {/* 既存カテゴリにない場合は現在の値を表示 */}
                            {!categories.some(c => c.specificCategory === row.feedbackCategory) && (
                              <option value={row.feedbackCategory}>
                                {row.feedbackCategory} {isNewCategory(row.feedbackCategory) && '✨'}
                              </option>
                            )}
                          </select>
                          <button
                            onClick={() => {
                              const row = tableRows[rowIndex]
                              // 現在のカテゴリ名を初期値として設定
                              setNewSpecificCategory(row.feedbackCategory)
                              setNewGeneralCategory(row.feedbackGeneralCategory)
                              // カテゴリコードは自動生成
                              setNewCategoryCode(`CAT_${Date.now()}`)
                              categoryModal.handleOpen(rowIndex)
                            }}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                            title="新規カテゴリを作成"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className=" text-sm bg-blue-50">
                        <select
                          value={row.feedbackSentiment}
                          onChange={e => updateTableRow(rowIndex, { feedbackSentiment: e.target.value as SentimentType })}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                          <option value="好意的">好意的</option>
                          <option value="不満">不満</option>
                          <option value="リクエスト">リクエスト</option>
                          <option value="その他">その他</option>
                        </select>
                      </td>
                      <td className=" text-sm bg-blue-50">
                        <input
                          type="text"
                          value={row.feedbackComment}
                          onChange={e => updateTableRow(rowIndex, { feedbackComment: e.target.value })}
                          placeholder="コメント（任意）"
                          className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </C_Stack>

      {/* カテゴリ作成モーダル */}
      <categoryModal.Modal
        open={!!categoryModal.open}
        setopen={categoryModal.setopen}
        title="新規カテゴリを作成"
      >
        <C_Stack className="gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリコード *</label>
            <input
              type="text"
              value={newCategoryCode}
              onChange={e => setNewCategoryCode(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例: CAT001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">大分類 *</label>
            <input
              type="text"
              value={newGeneralCategory}
              onChange={e => setNewGeneralCategory(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例: 商品"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">小分類 *</label>
            <input
              type="text"
              value={newSpecificCategory}
              onChange={e => setNewSpecificCategory(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例: 商品の美味しさと安定感"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">説明（任意）</label>
            <textarea
              value={newCategoryDescription}
              onChange={e => setNewCategoryDescription(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="カテゴリの説明"
            />
          </div>
          <R_Stack className="justify-end gap-2">
            <button
              onClick={() => {
                categoryModal.handleClose()
                setNewCategoryCode('')
                setNewGeneralCategory('')
                setNewSpecificCategory('')
                setNewCategoryDescription('')
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isCreatingCategory}
            >
              キャンセル
            </button>
            <button
              onClick={handleCreateCategory}
              disabled={isCreatingCategory || !newCategoryCode || !newGeneralCategory || !newSpecificCategory}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isCreatingCategory ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  作成中...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  作成
                </>
              )}
            </button>
          </R_Stack>
        </C_Stack>
      </categoryModal.Modal>
    </div>
  )
}
