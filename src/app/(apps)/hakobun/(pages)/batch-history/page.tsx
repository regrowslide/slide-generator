'use client'

import React, { useCallback } from 'react'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import useSelectedClient from '../../(globalHooks)/useSelectedClient'
import useCategoryManager from '../../hooks/useCategoryManager'
import useBatchHistory from '../../hooks/useBatchHistory'
import useCategoryModal from '../../hooks/useCategoryModal'
import useModal from '@cm/components/utils/modal/useModal'
import { ResultsTable } from '../../components/BatchResultsTable'
import { CategoryModal } from '../../components/BatchCategoryModal'
import { Loader2, RefreshCw } from 'lucide-react'

export default function BatchHistoryPage() {
  // グローバルクライアント選択
  const { selectedClient } = useSelectedClient()

  // カテゴリ管理（既存カテゴリの取得用）
  const {
    mergedGeneralCategories,
    pendingGeneralCategories,
    pendingCategories,
    categoryDiff,
    isNewGeneratedGeneralCategory,
    isNewGeneratedCategory,
    isPendingGeneralCategory,
    isPendingCategory,
    createGeneralCategory,
    createCategory,
    error: categoryError,
  } = useCategoryManager({ selectedClient })

  // 一括登録記録閲覧
  const {
    isLoading,
    tableRows,
    updateTableRow,
    isSaving,
    handleSaveRow,
    handleSaveAll,
    reload,
    getSentimentColor,
  } = useBatchHistory({
    clientId: selectedClient?.clientId,
  })

  // カテゴリ作成モーダル
  const {
    modalState,
    newCategoryName,
    setNewCategoryName,
    newCategoryDescription,
    setNewCategoryDescription,
    openModal,
    closeModal,
    resetInputs,
  } = useCategoryModal()

  // モーダルUI用
  const newCategoryModalUI = useModal<{ rowIndex: number; type: 'general' | 'category' }>()

  // 新規一般カテゴリ作成ハンドラ（stateに追加、DBには保存しない）
  const handleCreateGeneralCategory = useCallback(() => {
    if (!newCategoryName.trim()) {
      alert('カテゴリ名を入力してください')
      return
    }

    const success = createGeneralCategory(newCategoryName, newCategoryDescription)
    if (success) {
      // 作成成功時、該当レコードの「修正一般カテゴリ」にセット
      const rowIndex = modalState.rowIndex >= 0 ? modalState.rowIndex : newCategoryModalUI.open?.rowIndex ?? -1
      if (rowIndex >= 0 && rowIndex < tableRows.length) {
        updateTableRow(rowIndex, { feedbackGeneralCategory: newCategoryName })
      }
      closeModal()
      newCategoryModalUI.handleClose()
      resetInputs()
    } else if (categoryError) {
      alert(categoryError)
    }
  }, [
    newCategoryName,
    newCategoryDescription,
    createGeneralCategory,
    modalState.rowIndex,
    newCategoryModalUI.open?.rowIndex,
    tableRows.length,
    updateTableRow,
    closeModal,
    newCategoryModalUI,
    resetInputs,
    categoryError,
  ])

  // 新規詳細カテゴリ作成ハンドラ（stateに追加、DBには保存しない）
  const handleCreateCategory = useCallback(() => {
    if (!newCategoryName.trim()) {
      alert('カテゴリ名を入力してください')
      return
    }

    const rowIndex = modalState.rowIndex >= 0 ? modalState.rowIndex : newCategoryModalUI.open?.rowIndex ?? -1
    if (rowIndex < 0 || rowIndex >= tableRows.length) {
      alert('対象レコードが見つかりません')
      return
    }

    const row = tableRows[rowIndex]
    if (!row) return

    const success = createCategory(row.feedbackGeneralCategory, newCategoryName, newCategoryDescription)
    if (success) {
      // 作成成功時、該当レコードの「修正カテゴリ」にセット
      updateTableRow(rowIndex, { feedbackCategory: newCategoryName })
      closeModal()
      newCategoryModalUI.handleClose()
      resetInputs()
    } else if (categoryError) {
      alert(categoryError)
    }
  }, [
    newCategoryName,
    newCategoryDescription,
    createCategory,
    tableRows,
    modalState.rowIndex,
    newCategoryModalUI.open?.rowIndex,
    updateTableRow,
    closeModal,
    newCategoryModalUI,
    resetInputs,
    categoryError,
  ])

  // モーダルを開く（UI連携）
  const handleOpenModal = useCallback(
    (type: 'general' | 'category', rowIndex: number, initialName?: string) => {
      openModal(type, rowIndex, initialName)
      newCategoryModalUI.handleOpen({ rowIndex, type })
    },
    [openModal, newCategoryModalUI]
  )

  // モーダルを閉じる（UI連携）
  const handleCloseModal = useCallback(() => {
    closeModal()
    newCategoryModalUI.handleClose()
    resetInputs()
  }, [closeModal, newCategoryModalUI, resetInputs])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <C_Stack className="max-w-[1800px] mx-auto gap-6">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <R_Stack className="justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">一括登録記録</h1>
              <p className="text-sm text-gray-600 mt-1">
                過去に一括登録したデータを閲覧・編集できます
              </p>
            </div>
            <button
              onClick={reload}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              再読み込み
            </button>
          </R_Stack>
        </div>

        {/* 分析結果テーブル */}
        {tableRows.length > 0 ? (
          <ResultsTable
            tableRows={tableRows}
            results={[]} // 閲覧ページでは不要だが、型の都合で空配列を渡す
            mergedGeneralCategories={mergedGeneralCategories}
            categoryDiff={categoryDiff}
            pendingGeneralCategories={pendingGeneralCategories}
            pendingCategories={pendingCategories}
            isSavingAll={isSaving}
            isNewGeneratedGeneralCategory={isNewGeneratedGeneralCategory}
            isNewGeneratedCategory={isNewGeneratedCategory}
            isPendingGeneralCategory={isPendingGeneralCategory}
            isPendingCategory={isPendingCategory}
            getSentimentColor={getSentimentColor}
            updateTableRow={updateTableRow}
            onSaveAll={handleSaveAll}
            onOpenModal={handleOpenModal}
            canExportCsv={false} // 閲覧ページではCSVエクスポートは不要
            onExportCsv={() => { }}
            onSaveRow={handleSaveRow} // 個別保存
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600">一括登録記録がありません</p>
          </div>
        )}
      </C_Stack>

      {/* 新規カテゴリ作成モーダル */}
      <newCategoryModalUI.Modal
        open={!!newCategoryModalUI.open}
        setopen={newCategoryModalUI.setopen}
        title={modalState.type === 'general' ? '新規一般カテゴリを追加' : '新規詳細カテゴリを追加'}
      >
        <CategoryModal
          type={modalState.type}
          name={newCategoryName}
          setName={setNewCategoryName}
          description={newCategoryDescription}
          // setDescription={setNewCategoryDescription}
          onCancel={handleCloseModal}
          onCreate={modalState.type === 'general' ? handleCreateGeneralCategory : handleCreateCategory}
        />
      </newCategoryModalUI.Modal>
    </div>
  )
}

