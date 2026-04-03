'use client'

/**
 * インポートデータ確認ビュー
 * 取り込んだExcelデータを店舗別タブで表示
 * isDev時はスタッフ売上の店舗振替機能を表示
 */

import React, {useState} from 'react'
import {useDataContext} from '../../context/DataContext'
import {isDev} from '@cm/lib/methods/common'
import type {StoreName} from '../../types'

export const ImportDataView = () => {
  const {monthlyData, stores, transferStaff} = useDataContext()
  const storeNames = stores.map((s) => s.name)
  const [activeStore, setActiveStore] = useState<StoreName>(storeNames[0] ?? '')
  const [transferTarget, setTransferTarget] = useState<string | null>(null)
  const [transferToStoreId, setTransferToStoreId] = useState<number | null>(null)
  const [isTransferring, setIsTransferring] = useState(false)

  if (!monthlyData.importedData) {
    return (
      <div className="p-6 max-w-6xl mx-auto text-center">
        <p className="text-gray-500 text-lg">インポートデータがありません</p>
        <p className="text-gray-400 text-sm mt-2">「Excel取込」からファイルをアップロードしてください</p>
      </div>
    )
  }

  const activeStoreId = stores.find((s) => s.name === activeStore)?.id
  const currentStoreData = monthlyData.importedData.staffRecords.filter((r) => r.storeName === activeStore)
  const currentStoreTotal = monthlyData.importedData.storeTotals.find((t) => t.storeName === activeStore)
  // 振替先の候補（現在表示中の店舗を除外）
  const transferableStores = stores.filter((s) => s.name !== activeStore && s.isActive)

  const handleTransfer = async (staffName: string) => {
    if (!transferToStoreId || !activeStoreId) return

    const toStore = stores.find((s) => s.id === transferToStoreId)
    if (!toStore) return

    const confirmed = window.confirm(
      `「${staffName}」の売上を「${activeStore}」→「${toStore.name}」に振り替えます。よろしいですか？`
    )
    if (!confirmed) return

    setIsTransferring(true)
    try {
      await transferStaff(staffName, activeStoreId, transferToStoreId)
      setTransferTarget(null)
      setTransferToStoreId(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : '振替に失敗しました'
      alert(message)
    } finally {
      setIsTransferring(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">インポートデータ確認</h1>

      {/* 店舗タブ */}
      <div data-guidance="store-tabs" className="flex border-b mb-6">
        {storeNames.map((store) => {
          const hasData = monthlyData.importedData?.storeTotals.some((t) => t.storeName === store)
          return (
            <button
              key={store}
              onClick={() => {
                setActiveStore(store)
                setTransferTarget(null)
                setTransferToStoreId(null)
              }}
              className={`px-6 py-3 font-medium transition-colors ${
                activeStore === store
                  ? 'border-b-2 border-red-500 text-red-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {store}
              {!hasData && <span className="ml-2 text-xs text-gray-400">（未取込）</span>}
            </button>
          )
        })}
      </div>

      {/* データテーブル */}
      {currentStoreData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">この店舗のデータがありません</p>
        </div>
      ) : (
        <>
          <div data-guidance="data-table" className="overflow-x-auto">
            <table className="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
              <thead className="bg-purple-600 text-white">
                <tr>
                  <th className="p-3 text-left">順位</th>
                  <th className="p-3 text-left">担当者名</th>
                  <th className="p-3 text-right">売上合計</th>
                  <th className="p-3 text-right">客数</th>
                  <th className="p-3 text-right">指名数</th>
                  <th className="p-3 text-right">客単価</th>
                  {isDev && <th className="p-3 text-center">振替</th>}
                </tr>
              </thead>
              <tbody>
                {currentStoreData.map((staff, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-3">{staff.rank}</td>
                    <td className="p-3 font-medium">{staff.staffName}</td>
                    <td className="p-3 text-right">¥{staff.sales.toLocaleString()}</td>
                    <td className="p-3 text-right">{staff.customerCount}</td>
                    <td className="p-3 text-right">{staff.nominationCount}</td>
                    <td className="p-3 text-right">¥{staff.unitPrice.toLocaleString()}</td>
                    {isDev && (
                      <td className="p-3 text-center">
                        {transferTarget === staff.staffName ? (
                          <div className="flex items-center gap-1">
                            <select
                              value={transferToStoreId ?? ''}
                              onChange={(e) => setTransferToStoreId(Number(e.target.value) || null)}
                              className="text-sm border rounded px-2 py-1"
                            >
                              <option value="">選択</option>
                              {transferableStores.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleTransfer(staff.staffName)}
                              disabled={!transferToStoreId || isTransferring}
                              className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 disabled:opacity-50"
                            >
                              {isTransferring ? '...' : '実行'}
                            </button>
                            <button
                              onClick={() => {
                                setTransferTarget(null)
                                setTransferToStoreId(null)
                              }}
                              className="text-xs text-gray-500 hover:text-gray-700 px-1"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setTransferTarget(staff.staffName)}
                            className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
                          >
                            振替
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
                {/* 合計行 */}
                {currentStoreTotal && (
                  <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
                    <td className="p-3" colSpan={2}>
                      合計
                    </td>
                    <td className="p-3 text-right">¥{currentStoreTotal.sales.toLocaleString()}</td>
                    <td className="p-3 text-right">{currentStoreTotal.customerCount}</td>
                    <td className="p-3 text-right">{currentStoreTotal.nominationCount}</td>
                    <td className="p-3 text-right">¥{currentStoreTotal.unitPrice.toLocaleString()}</td>
                    {isDev && <td className="p-3" />}
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* インポート情報 */}
          {monthlyData.importedData && (
            <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded">
              <p>
                インポート日時: {new Date(monthlyData.importedData.importedAt).toLocaleString('ja-JP')}
              </p>
              <p>レコード数: {currentStoreData.length}件</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
