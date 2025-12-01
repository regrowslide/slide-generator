'use client'

import React, { useState } from 'react'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'

export default function TestGeneratePage() {
  const [prompt, setPrompt] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('プロンプトを入力してください')
      return
    }

    setIsGenerating(true)
    setError(null)
    setImageUrl(null)

    try {
      const response = await fetch('/api/image-captioner/test-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      const result = await response.json()

      if (result.success && result.imageUrl) {
        setImageUrl(result.imageUrl)
      } else {
        setError(result.error || '画像の生成に失敗しました')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <C_Stack className="max-w-4xl mx-auto gap-6">
        {/* ヘッダー */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gemini 3 Pro Image テスト</h1>
          <p className="text-gray-600">テキストから画像を生成するテストページ</p>
        </div>

        {/* プロンプト入力 */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <C_Stack className="gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                プロンプト（画像の説明）
              </label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="例: 美しい夕日の風景、山々と湖、プロフェッショナルな写真"
                className="w-full p-3 border rounded-lg min-h-[120px] resize-y"
                disabled={isGenerating}
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? '生成中...' : '画像を生成'}
            </button>
          </C_Stack>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            <p className="font-medium">エラー</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* 生成された画像 */}
        {imageUrl && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">生成された画像</h2>
            <div className="flex justify-center">
              <img
                src={imageUrl}
                alt="Generated"
                className="max-w-full h-auto rounded-lg shadow-md"
                style={{ maxHeight: '80vh' }}
              />
            </div>
            <div className="mt-4 text-center">
              <a
                href={imageUrl}
                download="generated-image.png"
                className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                画像をダウンロード
              </a>
            </div>
          </div>
        )}

        {/* 生成中の表示 */}
        {isGenerating && (
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">画像を生成しています...</p>
            <p className="text-sm text-gray-500 mt-2">しばらくお待ちください</p>
          </div>
        )}
      </C_Stack>
    </div>
  )
}

