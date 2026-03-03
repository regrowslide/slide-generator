'use client'
import {useState, useCallback, useRef} from 'react'

type UseAutoSaveFieldParams = {
  initialValue: string
  onSave: (value: string) => Promise<void>
}

/**
 * onBlur即時保存 + isDirty管理フック
 * onChange時にisDirty=true（黄色背景トリガー）
 * onBlur時にonSave呼び出し → 成功でisDirty=false
 */
export const useAutoSaveField = ({initialValue, onSave}: UseAutoSaveFieldParams) => {
  const [localValue, setLocalValue] = useState(initialValue)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const lastSavedRef = useRef(initialValue)

  const onChange = useCallback((value: string) => {
    setLocalValue(value)
    if (value !== lastSavedRef.current) {
      setIsDirty(true)
    }
  }, [])

  const onBlur = useCallback(async () => {
    if (localValue === lastSavedRef.current) {
      setIsDirty(false)
      return
    }
    setIsSaving(true)
    try {
      await onSave(localValue)
      lastSavedRef.current = localValue
      setIsDirty(false)
    } finally {
      setIsSaving(false)
    }
  }, [localValue, onSave])

  return {localValue, onChange, onBlur, isDirty, isSaving}
}
