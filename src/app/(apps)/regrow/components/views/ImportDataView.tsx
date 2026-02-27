'use client'

/**
 * インポートデータ確認ビュー
 * 取り込んだExcelデータを店舗別タブで表示
 */

import React, {useState} from 'react'
import {useDataContext} from '../../context/DataContext'
import type {StoreName} from '../../types'

export const ImportDataView = () => {
  const {monthlyData, stores} = useDataContext()
  const storeNames = stores.map((s) => s.name)
  const [activeStore, setActiveStore] = useState<StoreName>(storeNames[0] ?? '')

  if (!monthlyData.importedData) {
    return (
      <div className="p-6 max-w-6xl mx-auto text-center">
        <p className="text-gray-500 text-lg">インポートデータがありません</p>
        <p className="text-gray-400 text-sm mt-2">「Excel取込」からファイルをアップロードしてください</p>
      </div>
    )
  }

  const currentStoreData = monthlyData.importedData.staffRecords.filter((r) => r.storeName === activeStore)
  const currentStoreTotal = monthlyData.importedData.storeTotals.find((t) => t.storeName === activeStore)

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
              onClick={() => setActiveStore(store)}
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
