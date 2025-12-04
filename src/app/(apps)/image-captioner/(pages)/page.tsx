'use client'

import React, { useCallback, useState } from 'react'
import { useImageCaptioner } from '../hooks/useImageCaptioner'
import { Stepper } from '../components/Stepper'
import { ImageUploader, ImageThumbnail } from '../components/ImageUploader'
import { ContextInput } from '../components/ContextInput'
import { ImageCard } from '../components/ImageCard'
import { ProcessLog } from '../components/ProcessLog'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { AnalyzeResponse, GenerateResponse } from '../types'
import { Download, RefreshCw, FileText } from 'lucide-react'
import { saveAs } from 'file-saver'

export default function ImageCaptionerPage() {
  const {
    state,
    setStep,
    updateSettings,
    addImages,
    removeImage,
    updateImage,
    setScenario,
    setIsProcessing,
    addLog,
  } = useImageCaptioner()

  const [analyzingProgress, setAnalyzingProgress] = useState(0)

  const handleAnalyze = useCallback(async () => {
    if (state.images.length === 0) {
      addLog('error', '画像がアップロードされていません')
      return
    }

    setIsProcessing(true)
    setAnalyzingProgress(0)
    addLog('info', `画像分析を開始します（${state.images.length}件）`)

    const pendingImages = state.images.filter(img => img.status === 'pending' || img.status === 'error')
    let successCount = 0
    let errorCount = 0

    // 並列処理用の関数
    const analyzeImage = async (image: typeof state.images[0]) => {
      updateImage(image.id, { status: 'analyzing' })
      addLog('info', `分析開始: ${image.file.name}`, image.id)

      try {
        // API送信時は元の高解像度画像を使用
        const base64Data = image.originalBase64 || image.preview
        const imageSize = base64Data.length
        addLog('info', `画像サイズ: ${Math.round(imageSize / 1024)}KB`, image.id)

        const response = await fetch('/api/image-captioner/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            scenario: state.scenario,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          const errorMessage = `HTTP ${response.status}: ${errorText.substring(0, 200)}`
          updateImage(image.id, {
            status: 'error',
            error: errorMessage,
          })
          addLog('error', `分析失敗: ${image.file.name} - ${errorMessage}`, image.id)
          return { success: false }
        }

        const result: AnalyzeResponse = await response.json()

        if (result.success) {
          // レスポンスの妥当性チェック
          if (!result.annotation) {
            addLog('warning', `分析結果が不完全: ${image.file.name}`, image.id)
          }
          updateImage(image.id, {
            annotation: result.annotation || '画像の分析に失敗しました。',
            annotationPrompt: '', // 画像生成時に自動生成されるため空文字列
            status: 'analyzed',
          })
          addLog('success', `分析完了: ${image.file.name}`, image.id)
          return { success: true }
        } else {
          updateImage(image.id, {
            status: 'error',
            error: result.error || '分析に失敗しました',
          })
          addLog('error', `分析失敗: ${image.file.name} - ${result.error}`, image.id)
          return { success: false }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        const errorStack = error instanceof Error ? error.stack : undefined
        updateImage(image.id, {
          status: 'error',
          error: errorMessage,
        })
        addLog('error', `分析エラー: ${image.file.name} - ${errorMessage}`, image.id)
        if (errorStack) {
          console.error(`[Analyze Error] ${image.file.name}:`, errorStack)
        }
        return { success: false }
      }
    }

    // すべての画像を同時に並列実行
    const results = await Promise.allSettled(pendingImages.map(image => analyzeImage(image)))

    // 結果を集計
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value?.success) {
        successCount++
      } else {
        errorCount++
      }
      // 進捗を更新
      setAnalyzingProgress(Math.round(((index + 1) / pendingImages.length) * 100))
    })

    setIsProcessing(false)
    addLog('success', `分析完了: 成功 ${successCount}件、失敗 ${errorCount}件`)
    setStep(3)
  }, [state.images, state.scenario, setIsProcessing, addLog, updateImage, setStep])

  const handleRegenerate = useCallback(
    async (id: string) => {
      const image = state.images.find(img => img.id === id)
      if (!image) return

      updateImage(id, { status: 'analyzing' })
      addLog('info', `再分析中: ${image.file.name}`, id)

      try {
        // API送信時は元の高解像度画像を使用
        const base64Data = image.originalBase64 || image.preview
        const response = await fetch('/api/image-captioner/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            scenario: state.scenario,
          }),
        })

        const result: AnalyzeResponse = await response.json()

        if (result.success) {
          updateImage(id, {
            annotation: result.annotation,
            annotationPrompt: '', // 画像生成時に自動生成されるため空文字列
            status: 'analyzed',
          })
          addLog('success', `再分析完了: ${image.file.name}`, id)
        } else {
          updateImage(id, {
            status: 'error',
            error: result.error || '分析に失敗しました',
          })
          addLog('error', `再分析失敗: ${image.file.name}`, id)
        }
      } catch (error) {
        updateImage(id, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
        addLog('error', `再分析エラー: ${image.file.name}`, id)
      }
    },
    [state.images, state.scenario, addLog, updateImage]
  )

  const handleGenerate = useCallback(
    async (targetImages?: typeof state.images, event?: React.MouseEvent) => {
      // イベントオブジェクトが渡された場合は無視
      if (event && !targetImages) {
        event.preventDefault()
      }
      const imagesToProcess = targetImages || state.images.filter(img => img.status === 'analyzed' && img.annotation)
      if (imagesToProcess.length === 0) {
        addLog('error', '生成可能な画像がありません')
        return
      }

      setIsProcessing(true)
      addLog('info', `画像生成を開始します（${imagesToProcess.length}件）`)
      setStep(4)

      let successCount = 0
      let errorCount = 0

      // 並列処理用の関数
      const generateImage = async (image: typeof imagesToProcess[0], index: number) => {
        updateImage(image.id, { status: 'generating', error: undefined })
        addLog('info', `生成開始: ${image.file.name} (${index + 1}/${imagesToProcess.length})`, image.id)

        try {
          // API送信時は元の高解像度画像を使用
          const base64Data = image.originalBase64 || image.preview
          const response = await fetch('/api/image-captioner/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64Data,
              annotation: image.annotation,
              aspectRatio: state.settings.aspectRatio,
              resolution: state.settings.resolution,
            }),
          })

          const result: GenerateResponse = await response.json()

          if (result.success) {
            updateImage(image.id, {
              generatedImageUrl: result.imageUrl,
              status: 'completed',
              error: undefined,
            })
            addLog('success', `生成完了: ${image.file.name}`, image.id)
            return { success: true }
          } else {
            updateImage(image.id, {
              status: 'error',
              error: result.error || '生成に失敗しました',
            })
            addLog('error', `生成失敗: ${image.file.name} - ${result.error}`, image.id)
            return { success: false }
          }
        } catch (error) {
          updateImage(image.id, {
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          })
          addLog('error', `生成エラー: ${image.file.name}`, image.id)
          return { success: false }
        }
      }

      // すべての画像を同時に並列実行
      const results = await Promise.allSettled(
        imagesToProcess.map((image, index) => generateImage(image, index))
      )

      // 結果を集計
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value?.success) {
          successCount++
        } else {
          errorCount++
        }
      })

      setIsProcessing(false)
      addLog('success', `生成完了: 成功 ${successCount}件、失敗 ${errorCount}件`)
    },
    [state.images, state.settings, setIsProcessing, addLog, updateImage, setStep]
  )

  const handleRetryFailed = useCallback(async () => {
    const failedImages = state.images.filter(
      img => (img.status === 'error' || img.status === 'analyzed') && img.annotation
    )
    if (failedImages.length === 0) {
      addLog('error', '再生成可能な画像がありません')
      return
    }

    setIsProcessing(true)
    addLog('info', `失敗した画像の再生成を開始します（${failedImages.length}件）`)

    let successCount = 0
    let errorCount = 0

    // 並列処理用の関数
    const retryGenerateImage = async (image: typeof failedImages[0], index: number) => {
      updateImage(image.id, { status: 'generating', error: undefined })
      addLog('info', `再生成開始: ${image.file.name} (${index + 1}/${failedImages.length})`, image.id)

      try {
        // API送信時は元の高解像度画像を使用
        const base64Data = image.originalBase64 || image.preview
        const response = await fetch('/api/image-captioner/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            annotation: image.annotation,
            aspectRatio: state.settings.aspectRatio,
            resolution: state.settings.resolution,
          }),
        })

        const result: GenerateResponse = await response.json()

        if (result.success) {
          updateImage(image.id, {
            generatedImageUrl: result.imageUrl,
            status: 'completed',
            error: undefined,
          })
          addLog('success', `再生成完了: ${image.file.name}`, image.id)
          return { success: true }
        } else {
          updateImage(image.id, {
            status: 'error',
            error: result.error || '生成に失敗しました',
          })
          addLog('error', `再生成失敗: ${image.file.name} - ${result.error}`, image.id)
          return { success: false }
        }
      } catch (error) {
        updateImage(image.id, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
        addLog('error', `再生成エラー: ${image.file.name}`, image.id)
        return { success: false }
      }
    }

    // すべての画像を同時に並列実行
    const results = await Promise.allSettled(
      failedImages.map((image, index) => retryGenerateImage(image, index))
    )

    // 結果を集計
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value?.success) {
        successCount++
      } else {
        errorCount++
      }
    })

    setIsProcessing(false)
    addLog('success', `再生成完了: 成功 ${successCount}件、失敗 ${errorCount}件`)
  }, [state.images, state.settings, setIsProcessing, addLog, updateImage])

  const handleDownloadAll = useCallback(async () => {
    const completedImages = state.images.filter(img => img.status === 'completed' && img.generatedImageUrl)
    if (completedImages.length === 0) {
      addLog('error', 'ダウンロード可能な画像がありません')
      return
    }

    try {
      addLog('info', '画像をダウンロード中...')

      // 個別にダウンロード（ZIPは後で追加可能）
      for (const image of completedImages) {
        if (image.generatedImageUrl) {
          try {
            const response = await fetch(image.generatedImageUrl)
            const blob = await response.blob()
            const fileName = image.file.name.replace(/\.[^/.]+$/, '') + '_annotated.png'
            saveAs(blob, fileName)
            // 少し遅延を入れて連続ダウンロードを避ける
            await new Promise(resolve => setTimeout(resolve, 100))
          } catch (error) {
            addLog('error', `ダウンロード失敗: ${image.file.name}`, image.id)
          }
        }
      }

      addLog('success', `ダウンロードを開始しました（${completedImages.length}件）`)
    } catch (error) {
      addLog('error', `ダウンロードエラー: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, [state.images, addLog])

  const handleGeneratePptx = useCallback(async () => {
    const completedImages = state.images.filter(img => img.status === 'completed' && img.generatedImageUrl)
    if (completedImages.length === 0) {
      addLog('error', '生成済みの画像がありません。先に画像を生成してください。')
      return
    }

    try {
      setIsProcessing(true)
      addLog('info', 'AIがスライド構成を生成中...')

      const response = await fetch('/api/image-captioner/generate-pptx', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          scenario: state.scenario,
          images: state.images
            .filter(img => img.status === 'completed' && img.generatedImageUrl)
            .map(img => ({
              annotation: img.annotation,
              generatedImageUrl: img.generatedImageUrl,
            })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'PPTX生成に失敗しました')
      }

      // Blobとしてダウンロード
      const blob = await response.blob()
      const contentDisposition = response.headers.get('Content-Disposition')
      const fileNameMatch = contentDisposition?.match(/filename="(.+)"/)
      const fileName = fileNameMatch ? decodeURIComponent(fileNameMatch[1]) : 'presentation.pptx'

      saveAs(blob, fileName)
      addLog('success', 'スライド資料の生成が完了しました')
    } catch (error) {
      addLog('error', `スライド生成エラー: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsProcessing(false)
    }
  }, [state.scenario, state.images, setIsProcessing, addLog])

  const handleGeneratePptxClaude = useCallback(async () => {
    const completedImages = state.images.filter(img => img.status === 'completed' && img.generatedImageUrl)
    if (completedImages.length === 0) {
      addLog('error', '生成済みの画像がありません。先に画像を生成してください。')
      return
    }

    try {
      setIsProcessing(true)
      addLog('info', 'Claude APIがスライド構成とデザインを生成中...')

      const response = await fetch('/api/image-captioner/generate-pptx-claude', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          scenario: state.scenario,
          images: state.images
            .filter(img => img.status === 'completed' && img.generatedImageUrl)
            .map(img => ({
              annotation: img.annotation,
              generatedImageUrl: img.generatedImageUrl,
              base64: img.originalBase64 || img.preview,
            })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'PPTX生成に失敗しました')
      }

      // Blobとしてダウンロード
      const blob = await response.blob()
      const contentDisposition = response.headers.get('Content-Disposition')
      const fileNameMatch = contentDisposition?.match(/filename="(.+)"/)
      const fileName = fileNameMatch ? decodeURIComponent(fileNameMatch[1]) : 'presentation-claude.pptx'

      saveAs(blob, fileName)
      addLog('success', 'Claude APIによるスライド資料の生成が完了しました')
    } catch (error) {
      addLog('error', `Claude APIスライド生成エラー: ${error instanceof Error ? error.message : 'Unknown error'}`)
      // エラー時は標準方式にフォールバック
      addLog('info', '標準方式で再試行します...')
      try {
        await handleGeneratePptx()
      } catch (fallbackError) {
        addLog('error', `フォールバック生成エラー: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`)
      }
    } finally {
      setIsProcessing(false)
    }
  }, [state.scenario, state.images, setIsProcessing, addLog, handleGeneratePptx])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <C_Stack className="max-w-7xl mx-auto gap-6">
        {/* ヘッダー */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Image Captioner</h1>
          <p className="text-gray-600">スクリーンショットに注釈（吹き出しなど）を自動付与</p>
        </div>

        {/* ステッパー */}
        <Stepper currentStep={state.step} />

        {/* Step 1: 設定 & アップロード */}
        {state.step === 1 && (
          <C_Stack className="gap-6">
            {/* 設定 */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">画像生成設定</h2>
              <C_Stack className="gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">アスペクト比</label>
                  <select
                    value={state.settings.aspectRatio}
                    onChange={e => updateSettings({ aspectRatio: e.target.value as any })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="16:9">16:9</option>
                    <option value="4:3">4:3</option>
                    <option value="1:1">1:1</option>
                    <option value="21:9">21:9</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">解像度</label>
                  <select
                    value={state.settings.resolution}
                    onChange={e => updateSettings({ resolution: e.target.value as any })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="1024">1024px</option>
                    <option value="2048">2048px</option>
                    <option value="3072">3072px</option>
                    <option value="4K">4K (3840x2160)</option>
                  </select>
                </div>
              </C_Stack>
            </div>

            {/* アップロード */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">画像アップロード</h2>
              <ImageUploader onFilesSelected={addImages} maxFiles={50} />
              {state.images.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">アップロード済み画像 ({state.images.length}件)</h3>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4">
                    {state.images.map(image => (
                      <ImageThumbnail
                        key={image.id}
                        preview={image.preview}
                        fileName={image.file.name}
                        onRemove={() => removeImage(image.id)}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    disabled={state.images.length === 0}
                    className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    次へ: コンテキスト入力
                  </button>
                </div>
              )}
            </div>
          </C_Stack>
        )}

        {/* Step 2: コンテキスト入力 */}
        {state.step === 2 && (
          <C_Stack className="gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <ContextInput
                value={state.scenario}
                onChange={setScenario}
                onAnalyze={handleAnalyze}
                isProcessing={state.isProcessing}
              />
              {analyzingProgress > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>進捗</span>
                    <span>{analyzingProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${analyzingProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </C_Stack>
        )}

        {/* Step 3: 注釈プロンプト確認・編集 */}
        {state.step === 3 && (
          <C_Stack className="gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <R_Stack className="items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">注釈プロンプト確認・編集</h2>
                <button
                  onClick={e => handleGenerate(undefined, e)}
                  disabled={state.isProcessing || state.images.filter(img => img.status === 'analyzed').length === 0}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Nano Banana Proで一括生成
                </button>
              </R_Stack>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
                {state.images.map(image => (
                  <ImageCard key={image.id} image={image} onUpdate={updateImage} onRegenerate={handleRegenerate} />
                ))}
              </div>
            </div>
          </C_Stack>
        )}

        {/* Step 4: 最終生成 */}
        {state.step === 4 && (
          <C_Stack className="gap-6">
            {/* 処理ログ（詳細表示） */}
            {state.logs.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <R_Stack className="items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">処理ログ</h2>
                  {state.images.some(img => img.status === 'error') && !state.isProcessing && (
                    <button
                      onClick={handleRetryFailed}
                      className="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center gap-2"
                    >
                      <RefreshCw className="w-5 h-5" />
                      失敗した画像を再生成
                    </button>
                  )}
                </R_Stack>
                <ProcessLog logs={state.logs} />
              </div>
            )}

            {/* すべての画像を表示（進行状況ログをオーバーレイ） */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <R_Stack className="items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">画像一覧</h2>
                {state.images.some(img => img.status === 'completed') && (
                  <R_Stack className="gap-3">
                    <button
                      onClick={handleGeneratePptxClaude}
                      disabled={state.isProcessing}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <FileText className="w-5 h-5" />
                      Claude APIでスライド生成（高品質デザイン）
                    </button>
                    <button
                      onClick={handleGeneratePptx}
                      disabled={state.isProcessing}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <FileText className="w-5 h-5" />
                      スライド資料を生成（標準）
                    </button>
                    <button
                      onClick={handleDownloadAll}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      一括ダウンロード
                    </button>
                  </R_Stack>
                )}
              </R_Stack>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
                {state.images.map(image => (
                  <div
                    key={image.id}
                    className={`relative${image.status === 'analyzing' || image.status === 'generating' ? ' opacity-50' : ''}`}
                  >
                    <ImageCard image={image} onUpdate={updateImage} onRegenerate={handleRegenerate} />
                    {/* 進行中の画像にはログをオーバーレイ表示 */}
                    {(image.status === 'analyzing' || image.status === 'generating') && (
                      <ProcessLog logs={state.logs.filter(log => log.imageId === image.id)} compact />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </C_Stack>
        )}
      </C_Stack>
    </div>
  )
}

