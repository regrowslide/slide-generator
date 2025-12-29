'use client'

import {useState, useCallback} from 'react'

export type CategoryModalType = 'general' | 'category'

interface CategoryModalState {
  isOpen: boolean
  type: CategoryModalType
  rowIndex: number
}

interface UseCategoryModalReturn {
  /** モーダル状態 */
  modalState: CategoryModalState
  /** カテゴリ名（入力） */
  newCategoryName: string
  /** カテゴリ名を更新 */
  setNewCategoryName: (value: string) => void
  /** 説明（入力） */
  newCategoryDescription: string
  /** 説明を更新 */
  setNewCategoryDescription: (value: string) => void
  /** モーダルを開く */
  openModal: (type: CategoryModalType, rowIndex: number, initialName?: string) => void
  /** モーダルを閉じる */
  closeModal: () => void
  /** 入力をリセット */
  resetInputs: () => void
  /** モーダルが開いているか */
  isOpen: boolean
}

/**
 * カテゴリ作成モーダル用hook
 */
export default function useCategoryModal(): UseCategoryModalReturn {
  const [modalState, setModalState] = useState<CategoryModalState>({
    isOpen: false,
    type: 'general',
    rowIndex: -1,
  })
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDescription, setNewCategoryDescription] = useState('')

  // モーダルを開く
  const openModal = useCallback((type: CategoryModalType, rowIndex: number, initialName?: string) => {
    setModalState({isOpen: true, type, rowIndex})
    setNewCategoryName('')
    setNewCategoryDescription('')
  }, [])

  // モーダルを閉じる
  const closeModal = useCallback(() => {
    setModalState(prev => ({...prev, isOpen: false}))
  }, [])

  // 入力をリセット
  const resetInputs = useCallback(() => {
    setNewCategoryName('')
    setNewCategoryDescription('')
  }, [])

  return {
    modalState,
    newCategoryName,
    setNewCategoryName,
    newCategoryDescription,
    setNewCategoryDescription,
    openModal,
    closeModal,
    resetInputs,
    isOpen: modalState.isOpen,
  }
}
