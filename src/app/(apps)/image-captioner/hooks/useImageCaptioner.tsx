'use client'

import { useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { ImageItem, AppSettings, LogEntry, AppState } from '../types'

const defaultSettings: AppSettings = {
  aspectRatio: '16:9',
  resolution: '1024',
}

export const useImageCaptioner = () => {
  const [state, setState] = useState<AppState>({
    step: 1,
    settings: defaultSettings,
    images: [],
    scenario: '',
    isProcessing: false,
    logList: [],
  })

  const addLog = useCallback((type: LogEntry['type'], message: string, imageId?: string) => {
    const log: LogEntry = {
      id: uuidv4(),
      timestamp: new Date(),
      type,
      message,
      imageId,
    }
    setState(prev => ({
      ...prev,
      logList: [...prev.logList, log],
    }))
  }, [])

  const setStep = useCallback((step: 1 | 2 | 3 | 4) => {
    setState(prev => ({ ...prev, step }))
  }, [])

  const updateSettings = useCallback((settings: Partial<AppSettings>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...settings },
    }))
  }, [])

  const addImages = useCallback(async (files: File[]) => {
    const newImages: ImageItem[] = await Promise.all(
      files.map(async file => {
        // プレビュー用の低解像度画像（表示用）
        const preview = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            const img = new Image()
            img.onload = () => {
              const canvas = document.createElement('canvas')
              const maxPreviewSize = 800 // プレビュー用の最大サイズ
              let width = img.width
              let height = img.height

              if (width > height) {
                if (width > maxPreviewSize) {
                  height = (height * maxPreviewSize) / width
                  width = maxPreviewSize
                }
              } else {
                if (height > maxPreviewSize) {
                  width = (width * maxPreviewSize) / height
                  height = maxPreviewSize
                }
              }

              canvas.width = width
              canvas.height = height
              const ctx = canvas.getContext('2d')
              if (ctx) {
                ctx.drawImage(img, 0, 0, width, height)
                resolve(canvas.toDataURL('image/jpeg', 0.85))
              } else {
                resolve(reader.result as string)
              }
            }
            img.onerror = () => resolve(reader.result as string)
            img.src = reader.result as string
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        // 元のファイルのBase64（API送信用、高解像度）
        const originalBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        return {
          id: uuidv4(),
          file,
          preview,
          originalBase64,
          annotation: '',
          annotationPrompt: '',
          status: 'pending' as const,
        }
      })
    )

    setState(prev => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }))

    addLog('info', `${files.length}件の画像をアップロードしました`)
  }, [addLog])

  const removeImage = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== id),
    }))
    addLog('info', '画像を削除しました')
  }, [addLog])

  const updateImage = useCallback((id: string, updates: Partial<ImageItem>) => {
    setState(prev => ({
      ...prev,
      images: prev.images.map(img => (img.id === id ? { ...img, ...updates } : img)),
    }))
  }, [])

  const setScenario = useCallback((scenario: string) => {
    setState(prev => ({ ...prev, scenario }))
  }, [])

  const setIsProcessing = useCallback((isProcessing: boolean) => {
    setState(prev => ({ ...prev, isProcessing }))
  }, [])

  const clearLogList = useCallback(() => {
    setState(prev => ({ ...prev, logList: [] }))
  }, [])

  return {
    state,
    setStep,
    updateSettings,
    addImages,
    removeImage,
    updateImage,
    setScenario,
    setIsProcessing,
    addLog,
    clearLogList,
  }
}

