'use client'

import {useState, useCallback} from 'react'
import {v4 as uuidv4} from 'uuid'
import {ImageItem, AppSettings, LogEntry, AppState} from '../types'

const defaultSettings: AppSettings = {
  aspectRatio: '16:9',
  resolution: '1024',
}

export const useImageCaptioner = () => {
  const [state, setState] = useState<AppState>({
    step: 1,
    settings: defaultSettings,
    images: [],
    context: '',
    isProcessing: false,
    logs: [],
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
      logs: [...prev.logs, log],
    }))
  }, [])

  const setStep = useCallback((step: 1 | 2 | 3 | 4) => {
    setState(prev => ({...prev, step}))
  }, [])

  const updateSettings = useCallback((settings: Partial<AppSettings>) => {
    setState(prev => ({
      ...prev,
      settings: {...prev.settings, ...settings},
    }))
  }, [])

  const addImages = useCallback(async (files: File[]) => {
    const newImages: ImageItem[] = await Promise.all(
      files.map(async file => {
        const preview = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        return {
          id: uuidv4(),
          file,
          preview,
          caption: '',
          captionPrompt: '',
          tags: [],
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
      images: prev.images.map(img => (img.id === id ? {...img, ...updates} : img)),
    }))
  }, [])

  const setContext = useCallback((context: string) => {
    setState(prev => ({...prev, context}))
  }, [])

  const setIsProcessing = useCallback((isProcessing: boolean) => {
    setState(prev => ({...prev, isProcessing}))
  }, [])

  const clearLogs = useCallback(() => {
    setState(prev => ({...prev, logs: []}))
  }, [])

  return {
    state,
    setStep,
    updateSettings,
    addImages,
    removeImage,
    updateImage,
    setContext,
    setIsProcessing,
    addLog,
    clearLogs,
  }
}

