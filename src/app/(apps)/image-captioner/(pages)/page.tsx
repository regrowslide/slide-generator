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
import { Download, RefreshCw } from 'lucide-react'
import { saveAs } from 'file-saver'

export default function ImageCaptionerPage() {
  const {
    state,
    setStep,
    updateSettings,
    addImages,
    removeImage,
    updateImage,
    setContext,
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

    for (let i = 0; i < pendingImages.length; i++) {
      const image = pendingImages[i]
      updateImage(image.id, { status: 'analyzing' })
      addLog('info', `分析中: ${image.file.name}`, image.id)

      try {
        const base64Data = image.preview
        const response = await fetch('/api/image-captioner/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            context: state.context,
          }),
        })

        const result: AnalyzeResponse = await response.json()

        if (result.success) {
          updateImage(image.id, {
            caption: result.caption,
            captionPrompt: result.captionPrompt,
            status: 'analyzed',
          })
          addLog('success', `分析完了: ${image.file.name}`, image.id)
          successCount++
        } else {
          updateImage(image.id, {
            status: 'error',
            error: result.error || '分析に失敗しました',
          })
          addLog('error', `分析失敗: ${image.file.name} - ${result.error}`, image.id)
          errorCount++
        }
      } catch (error) {
        updateImage(image.id, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
        addLog('error', `分析エラー: ${image.file.name}`, image.id)
        errorCount++
      }

      setAnalyzingProgress(Math.round(((i + 1) / pendingImages.length) * 100))
    }

    setIsProcessing(false)
    addLog(
      'success',
      `分析完了: 成功 ${successCount}件、失敗 ${errorCount}件`,
    )
    setStep(3)
  }, [state.images, state.context, setIsProcessing, addLog, updateImage, setStep])

  const handleRegenerate = useCallback(
    async (id: string) => {
      const image = state.images.find(img => img.id === id)
      if (!image) return

      updateImage(id, { status: 'analyzing' })
      addLog('info', `再分析中: ${image.file.name}`, id)

      try {
        const base64Data = image.preview
        const response = await fetch('/api/image-captioner/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            context: state.context,
          }),
        })

        const result: AnalyzeResponse = await response.json()

        if (result.success) {
          updateImage(id, {
            caption: result.caption,
            captionPrompt: result.captionPrompt,
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
    [state.images, state.context, addLog, updateImage]
  )

  const handleGenerate = useCallback(
    async (targetImages?: typeof state.images, event?: React.MouseEvent) => {
      // イベントオブジェクトが渡された場合は無視
      if (event && !targetImages) {
        event.preventDefault()
      }
      const imagesToProcess = targetImages || state.images.filter(img => img.status === 'analyzed' && img.caption)
      if (imagesToProcess.length === 0) {
        addLog('error', '生成可能な画像がありません')
        return
      }

      setIsProcessing(true)
      addLog('info', `画像生成を開始します（${imagesToProcess.length}件）`)
      setStep(4)

      let successCount = 0
      let errorCount = 0

      for (let i = 0; i < imagesToProcess.length; i++) {
        const image = imagesToProcess[i]
        updateImage(image.id, { status: 'generating', error: undefined })
        addLog('info', `生成中: ${image.file.name} (${i + 1}/${imagesToProcess.length})`, image.id)

        try {
          const base64Data = image.preview
          const response = await fetch('/api/image-captioner/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64Data,
              caption: image.caption,
              captionPrompt: image.captionPrompt,
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
            successCount++
          } else {
            updateImage(image.id, {
              status: 'error',
              error: result.error || '生成に失敗しました',
            })
            addLog('error', `生成失敗: ${image.file.name} - ${result.error}`, image.id)
            errorCount++
          }
        } catch (error) {
          updateImage(image.id, {
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          })
          addLog('error', `生成エラー: ${image.file.name}`, image.id)
          errorCount++
        }
      }

      setIsProcessing(false)
      addLog('success', `生成完了: 成功 ${successCount}件、失敗 ${errorCount}件`)
    },
    [state.images, state.settings, setIsProcessing, addLog, updateImage, setStep]
  )

  const handleRetryFailed = useCallback(async () => {
    const failedImages = state.images.filter(
      img => (img.status === 'error' || img.status === 'analyzed') && img.caption
    )
    if (failedImages.length === 0) {
      addLog('error', '再生成可能な画像がありません')
      return
    }

    setIsProcessing(true)
    addLog('info', `失敗した画像の再生成を開始します（${failedImages.length}件）`)

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < failedImages.length; i++) {
      const image = failedImages[i]
      updateImage(image.id, { status: 'generating', error: undefined })
      addLog('info', `再生成中: ${image.file.name} (${i + 1}/${failedImages.length})`, image.id)

      try {
        const base64Data = image.preview
        const response = await fetch('/api/image-captioner/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            caption: image.caption,
            captionPrompt: image.captionPrompt,
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
          successCount++
        } else {
          updateImage(image.id, {
            status: 'error',
            error: result.error || '生成に失敗しました',
          })
          addLog('error', `再生成失敗: ${image.file.name} - ${result.error}`, image.id)
          errorCount++
        }
      } catch (error) {
        updateImage(image.id, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
        addLog('error', `再生成エラー: ${image.file.name}`, image.id)
        errorCount++
      }
    }

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
            const fileName = image.file.name.replace(/\.[^/.]+$/, '') + '_captioned.png'
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <C_Stack className="max-w-7xl mx-auto gap-6">
        {/* ヘッダー */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Image Captioner</h1>
          <p className="text-gray-600">スクリーンショットにAIキャプションを自動付与</p>
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
                value={state.context}
                onChange={setContext}
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

        {/* Step 3: 結果確認・編集 */}
        {state.step === 3 && (
          <C_Stack className="gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <R_Stack className="items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">結果確認・編集</h2>
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

            {/* 失敗した画像 */}
            {state.images.some(img => img.status === 'error') && (
              <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-red-200">
                <h2 className="text-xl font-semibold mb-4 text-red-600">生成に失敗した画像</h2>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
                  {state.images
                    .filter(img => img.status === 'error')
                    .map(image => (
                      <ImageCard key={image.id} image={image} onUpdate={updateImage} onRegenerate={handleRegenerate} />
                    ))}
                </div>
              </div>
            )}

            {/* 成功した画像 */}
            {state.images.some(img => img.status === 'completed') && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <R_Stack className="items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">生成された画像</h2>
                  <button
                    onClick={handleDownloadAll}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    一括ダウンロード
                  </button>
                </R_Stack>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
                  {state.images
                    .filter(img => img.status === 'completed' && img.generatedImageUrl)
                    .map(image => (
                      <ImageCard key={image.id} image={image} onUpdate={updateImage} onRegenerate={handleRegenerate} />
                    ))}
                </div>
              </div>
            )}
          </C_Stack>
        )}
      </C_Stack>
    </div>
  )
}

