'use client'

import { useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { LifeOSData, LogEntry, LifeOSState } from '../types'
import { processNaturalLanguage } from '../actions'

const initialState: LifeOSState = {
  data: [],
  currentInput: '',
  isProcessing: false,
  logs: [],
  selectedCategory: null,
}

export const useLifeOS = () => {
  const [state, setState] = useState<LifeOSState>(initialState)

  const addLog = useCallback((type: LogEntry['type'], message: string) => {
    const log: LogEntry = {
      id: uuidv4(),
      timestamp: new Date(),
      type,
      message,
    }
    setState((prev) => ({
      ...prev,
      logs: [...prev.logs, log],
    }))
  }, [])

  const setInput = useCallback((input: string) => {
    setState((prev) => ({ ...prev, currentInput: input }))
  }, [])

  const processInput = useCallback(async () => {
    if (!state.currentInput.trim() || state.isProcessing) return

    setState((prev) => ({ ...prev, isProcessing: true }))
    addLog('info', '自然言語を処理中...')

    try {
      // Server Actionを呼び出し
      const result = await processNaturalLanguage(state.currentInput)

      if (result.success) {
        addLog('success', 'データの処理が完了しました')
        // TODO: 結果をstateに追加
      } else {
        addLog('error', result.message || '処理に失敗しました')
      }
    } catch (error) {
      addLog('error', error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setState((prev) => ({ ...prev, isProcessing: false, currentInput: '' }))
    }
  }, [state.currentInput, state.isProcessing, addLog])

  const addData = useCallback((data: LifeOSData) => {
    setState((prev) => ({
      ...prev,
      data: [...prev.data, data],
    }))
  }, [])

  const removeData = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      data: prev.data.filter((d) => d.id !== id),
    }))
  }, [])

  const clearLogs = useCallback(() => {
    setState((prev) => ({ ...prev, logs: [] }))
  }, [])

  return {
    state,
    setInput,
    processInput,
    addData,
    removeData,
    addLog,
    clearLogs,
  }
}

