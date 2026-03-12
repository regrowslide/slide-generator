'use client'

/**
 * Excelインポートビュー
 * 年月と店舗を手動選択 → ファイル選択 → プレビュー確認 → DB保存
 */

import React, {useState, useRef, useCallback, useEffect} from 'react'
import {useDataContext} from '../../context/DataContext'
import {parseStaffAnalysisExcel} from '../../lib/excel-parser'
import {createRegrowUser, updateUserRgStore} from '../../_actions/staff-actions'
import type {ExcelParseResult, StoreName, YearMonth} from '../../types'

/** スタッフのDBマッチング結果 */
type StaffMatchStatus = {
  staffName: string
  isMatched: boolean
  isDuplicate: boolean // 同名ユーザーが複数いる場合
  duplicateUsers: {userId: string; name: string; storeName: string}[] // 同名ユーザー一覧
}

export const ImportView = () => {
  const {addImportedData, monthlyData, availableMonths, currentYearMonth, staffMaster, stores, refreshStaffMaster} = useDataContext()
  const [selectedYearMonth, setSelectedYearMonth] = useState<YearMonth>(currentYearMonth)
  const [selectedStore, setSelectedStore] = useState<StoreName | ''>('')
  const [previewData, setPreviewData] = useState<ExcelParseResult | null>(null)
  const [matchStatuses, setMatchStatuses] = useState<StaffMatchStatus[]>([])
  const [nameToUserIdMap, setNameToUserIdMap] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [creatingStaff, setCreatingStaff] = useState<string | null>(null) // 作成中のスタッフ名
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const isFormReady = selectedYearMonth !== '' && selectedStore !== ''

  // スタッフDBマッチングチェック（staffNameのみで比較）
  const checkStaffMatching = useCallback(
    (staffList: ExcelParseResult['staffList']): StaffMatchStatus[] => {
      return staffList.map((staff) => {
        const matchedUsers = staffMaster.filter((m) => m.staffName === staff.staffName)
        const isDuplicate = matchedUsers.length > 1
        return {
          staffName: staff.staffName,
          isMatched: matchedUsers.length > 0,
          isDuplicate,
          duplicateUsers: isDuplicate
            ? matchedUsers.map((m) => ({userId: m.userId, name: m.staffName, storeName: m.storeName}))
            : [],
        }
      })
    },
    [staffMaster]
  )

  // staffMaster変更時にプレビュー中のマッチング状態を再チェック
  useEffect(() => {
    if (previewData) {
      setMatchStatuses(checkStaffMatching(previewData.staffList))
    }
  }, [staffMaster]) // eslint-disable-line react-hooks/exhaustive-deps

  // ファイル選択時: パースしてプレビュー表示（DB保存しない）
  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setError('Excelファイル（.xlsx / .xls）を選択してください')
        return
      }
      if (!isFormReady) return

      setError(null)
      setSuccessMessage(null)
      setPreviewData(null)
      setIsParsing(true)

      try {
        const result = await parseStaffAnalysisExcel(file, selectedStore as StoreName)
        const statuses = checkStaffMatching(result.staffList)
        setPreviewData(result)
        setMatchStatuses(statuses)
        setNameToUserIdMap({})
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setIsParsing(false)
        if (inputRef.current) inputRef.current.value = ''
      }
    },
    [isFormReady, selectedStore, checkStaffMatching]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!isFormReady) return
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile, isFormReady]
  )

  // 「確認して取り込む」ボタン: DB保存
  const handleConfirmImport = useCallback(async () => {
    if (!previewData) return
    setIsSaving(true)
    setError(null)
    try {
      const overrides = Object.keys(nameToUserIdMap).length > 0 ? nameToUserIdMap : undefined
      await addImportedData(previewData, selectedYearMonth, overrides)
      setSuccessMessage(`${selectedStore}（${selectedYearMonth}）のデータを取り込みました`)
      setPreviewData(null)
      setMatchStatuses([])
      setNameToUserIdMap({})
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsSaving(false)
    }
  }, [previewData, addImportedData, selectedYearMonth, selectedStore, nameToUserIdMap])

  // プレビューキャンセル
  const handleCancelPreview = useCallback(() => {
    setPreviewData(null)
    setMatchStatuses([])
    setNameToUserIdMap({})
    setError(null)
  }, [])

  // 未登録スタッフをその場で新規作成
  const handleQuickCreateUser = useCallback(
    async (staffName: string) => {
      if (!selectedStore) return
      setCreatingStaff(staffName)
      setError(null)
      try {
        // ランダムなemail/passwordを生成
        const randomSuffix = Math.random().toString(36).slice(2, 10)
        const email = `rg_${randomSuffix}@auto.local`
        const password = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)

        // ユーザー作成
        const user = await createRegrowUser({name: staffName, email, password})

        // 選択中の店舗を担当店舗にセット
        const store = stores.find((s) => s.name === selectedStore)
        if (store) {
          await updateUserRgStore(user.id, store.id)
        }

        // staffMasterを再取得してマッチング状態を更新
        await refreshStaffMaster()
      } catch (err) {
        setError(`ユーザー「${staffName}」の作成に失敗しました: ${(err as Error).message}`)
      } finally {
        setCreatingStaff(null)
      }
    },
    [selectedStore, stores, refreshStaffMaster]
  )

  const unmatchedCount = matchStatuses.filter((s) => !s.isMatched).length
  // 同名ユーザーのうち、まだドロップダウンで選択されていないもの
  const unresolvedDuplicates = matchStatuses.filter((s) => s.isDuplicate && !nameToUserIdMap[s.staffName])
  const hasUnresolvedDuplicates = unresolvedDuplicates.length > 0
  const importedStores = monthlyData.importedData?.storeTotals.map((t) => t.storeName) || []

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Excel取込</h1>

      {/* STEP 1: 年月・店舗選択 */}
      <div className="mb-6 bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <p className="text-sm font-semibold text-gray-600 mb-4">STEP 1：取込先を選択</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              年月 <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedYearMonth}
              onChange={(e) => {
                setSelectedYearMonth(e.target.value as YearMonth)
                setPreviewData(null)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <option value="">-- 年月を選択 --</option>
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              店舗 <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedStore}
              onChange={(e) => {
                setSelectedStore(e.target.value as StoreName | '')
                setPreviewData(null)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <option value="">-- 店舗を選択 --</option>
              {stores.map((store) => (
                <option key={store.id} value={store.name}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* STEP 2: ファイルアップロード（プレビューが無い場合のみ表示） */}
      {!previewData && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-600 mb-3">STEP 2：Excelファイルを選択（プレビュー確認後に取り込み）</p>
          <div
            data-guidance="upload-area"
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
              !isFormReady
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                : 'border-gray-300 hover:border-red-300 hover:bg-gray-50 cursor-pointer'
            }`}
            onDragOver={(e) => {
              e.preventDefault()
            }}
            onDragLeave={() => {}}
            onDrop={handleDrop}
            onClick={() => isFormReady && inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
              }}
            />

            {isParsing ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-red-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-600 font-medium">解析中...</p>
                <p className="text-gray-500 text-sm">Excelを読み込んでいます。しばらくお待ちください。</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                {!isFormReady ? (
                  <p className="text-gray-400 text-base">年月と店舗を選択してからアップロードできます</p>
                ) : (
                  <>
                    <p className="text-gray-700 text-lg font-medium mb-2">
                      ここにExcelファイルをドラッグ＆ドロップ
                    </p>
                    <p className="text-gray-500 mb-1">またはクリックしてファイルを選択</p>
                    <p className="text-xs text-gray-400">対応形式: .xlsx / .xls</p>
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 rounded-full text-sm text-red-700">
                      <span>取込先:</span>
                      <span className="font-semibold">{selectedYearMonth}</span>
                      <span>/</span>
                      <span className="font-semibold">{selectedStore}</span>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: プレビュー確認（ファイル解析後に表示） */}
      {previewData && (
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-600 mb-3">STEP 2：取込内容を確認してください</p>

          {/* 取込先情報 */}
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
            <span>取込先:</span>
            <span className="font-bold text-red-600">{selectedYearMonth} / {selectedStore}</span>
            {previewData.periodStart && (
              <span className="ml-2 text-gray-500">（集計期間: {previewData.periodStart} 〜 {previewData.periodEnd}）</span>
            )}
          </div>

          {/* 未登録スタッフエラーバナー */}
          {unmatchedCount > 0 && (
            <div className="mb-4 bg-red-50 border border-red-300 rounded-lg p-4">
              <p className="text-red-800 font-semibold">
                未登録スタッフが {unmatchedCount}名 います（インポート不可）
              </p>
              <p className="text-red-700 text-sm mt-1">
                スタッフ一覧の「新規登録」ボタンでその場で登録するか、マスタ管理画面で登録してください。
              </p>
              <div className="mt-2 text-red-700 text-sm">
                未登録: {matchStatuses.filter((s) => !s.isMatched).map((s) => s.staffName).join(', ')}
              </div>
            </div>
          )}

          {/* 同名ユーザー警告バナー */}
          {hasUnresolvedDuplicates && (
            <div className="mb-4 bg-amber-50 border border-amber-300 rounded-lg p-4">
              <p className="text-amber-800 font-semibold">
                同名ユーザーが {unresolvedDuplicates.length}名 います（選択が必要です）
              </p>
              <p className="text-amber-700 text-sm mt-1">
                下のスタッフ一覧で、該当するユーザーをドロップダウンから選択してください。
              </p>
            </div>
          )}

          {/* 店舗合計 */}
          <div className="mb-4 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-700">店舗合計</p>
            </div>
            <div className="grid grid-cols-4 divide-x divide-gray-100 text-center py-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">売上合計</p>
                <p className="text-lg font-bold text-gray-800">¥{previewData.total.sales.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">対応客数</p>
                <p className="text-lg font-bold text-gray-800">{previewData.total.customerCount.toLocaleString()}名</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">指名数</p>
                <p className="text-lg font-bold text-gray-800">{previewData.total.nominationCount.toLocaleString()}件</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">客単価</p>
                <p className="text-lg font-bold text-gray-800">¥{previewData.total.unitPrice.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* スタッフ一覧 */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">スタッフ一覧（{previewData.staffList.length}名）</p>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="text-green-600">✅</span> DB登録済</span>
                <span className="flex items-center gap-1"><span className="text-amber-500">⚠️</span> 未登録</span>
              </div>
            </div>
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {previewData.staffList.map((staff, i) => {
                const status = matchStatuses[i]
                const bgClass = !status?.isMatched ? 'bg-amber-50' : status?.isDuplicate ? 'bg-yellow-50' : ''
                return (
                  <div
                    key={i}
                    className={`flex items-center px-4 py-3 gap-3 ${bgClass}`}
                  >
                    <span className="text-lg">
                      {!status?.isMatched ? '⚠️' : status?.isDuplicate ? (nameToUserIdMap[staff.staffName] ? '✅' : '🔄') : '✅'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-8">#{staff.rank}</span>
                        <span className="font-medium text-gray-800 truncate">{staff.staffName}</span>
                        {!status?.isMatched && (
                          <>
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                              未登録
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleQuickCreateUser(staff.staffName)
                              }}
                              disabled={creatingStaff !== null}
                              className="text-xs bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-2 py-0.5 rounded-full transition-colors"
                            >
                              {creatingStaff === staff.staffName ? '作成中...' : '新規登録'}
                            </button>
                          </>
                        )}
                        {status?.isDuplicate && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full border border-yellow-200">
                            同名ユーザー
                          </span>
                        )}
                      </div>
                      {/* 同名ユーザーのドロップダウン */}
                      {status?.isDuplicate && (
                        <div className="mt-2">
                          <select
                            value={nameToUserIdMap[staff.staffName] ?? ''}
                            onChange={(e) => {
                              const val = e.target.value
                              setNameToUserIdMap((prev) => {
                                if (!val) {
                                  const next = {...prev}
                                  delete next[staff.staffName]
                                  return next
                                }
                                return {...prev, [staff.staffName]: val}
                              })
                            }}
                            className="w-full px-2 py-1 border border-yellow-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          >
                            <option value="">-- ユーザーを選択 --</option>
                            {status.duplicateUsers.map((u) => (
                              <option key={u.userId} value={u.userId}>
                                {u.name}（{u.storeName}）
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-right text-sm text-gray-600 shrink-0">
                      <div>
                        <p className="text-xs text-gray-400">売上</p>
                        <p className="font-medium">¥{staff.sales.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">客数</p>
                        <p className="font-medium">{staff.customerCount}名</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">新規</p>
                        <p className="font-medium">{staff.newCustomerCount}名</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">客単価</p>
                        <p className="font-medium">¥{staff.unitPrice.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* アクションボタン */}
          <div className="mt-5 flex items-center gap-3 justify-end">
            <button
              onClick={handleCancelPreview}
              className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={isSaving || unmatchedCount > 0 || hasUnresolvedDuplicates}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  保存中...
                </>
              ) : (
                <>確認して取り込む</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 成功メッセージ */}
      {successMessage && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">✅ {successMessage}</p>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">❌ エラー</p>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* 取込済みデータ一覧（現在表示中の月） */}
      {importedStores.length > 0 && !previewData && (
        <div data-guidance="imported-list" className="mt-6">
          <h2 className="text-lg font-bold mb-3 text-gray-800">取込済みデータ（{currentYearMonth}）</h2>
          <div className="space-y-3">
            {monthlyData.importedData?.storeTotals.map((total, i) => {
              const staffCount =
                monthlyData.importedData?.staffRecords.filter((r) => r.storeName === total.storeName).length || 0
              return (
                <div key={i} className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg text-gray-800">{total.storeName}</span>
                        <span className="text-green-600 text-sm font-medium">✅ 取込済</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        <span>スタッフ: {staffCount}名</span>
                        <span className="mx-2">|</span>
                        <span>売上合計: ¥{total.sales.toLocaleString()}</span>
                        <span className="mx-2">|</span>
                        <span>客単価: ¥{total.unitPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {monthlyData.importedData && (
            <div className="mt-3 text-sm text-gray-500">
              <p>インポート日時: {new Date(monthlyData.importedData.importedAt).toLocaleString('ja-JP')}</p>
            </div>
          )}
        </div>
      )}

      {/* ファイル要件 */}
      {!previewData && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-medium mb-2">📝 ファイル要件</p>
          <ul className="text-blue-700 text-sm space-y-1 list-disc list-inside">
            <li>担当者別分析表（.xlsx / .xls）をアップロードしてください</li>
            <li>同じ店舗・年月のデータを再度アップロードすると上書きされます</li>
          </ul>
        </div>
      )}
    </div>
  )
}
