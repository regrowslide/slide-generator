'use client'

/**
 * 目標売上入力ビュー
 * スタッフ別の目標売上を月次で手動入力し、店舗合計を自動計算
 */

import React, {useState, useMemo} from 'react'
import {useDataContext} from '../../context/DataContext'
import type {StoreName} from '../../types'

export const TargetSalesView = () => {
  const {monthlyData, updateStaffManualData, scopes, stores} = useDataContext()

  const storeIdMap = new Map(stores.map((s) => [s.name, s.id]))
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | null>(null)
  const isEditable = scopes.isAdmin

  const handleSave = (callback: () => void) => {
    setSaveStatus('saving')
    callback()
    setTimeout(() => {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus(null), 2000)
    }, 300)
  }

  // インポートデータからスタッフ一覧を取得
  const allStaff =
    monthlyData.importedData?.staffRecords.map((r) => ({
      staffName: r.staffName,
      storeName: r.storeName,
      actualSales: r.sales,
    })) || []

  // 店舗ごとにグルーピング
  const storeGroups = useMemo(() => {
    const groups: Record<string, typeof allStaff> = {}
    for (const staff of allStaff) {
      if (!groups[staff.storeName]) groups[staff.storeName] = []
      groups[staff.storeName].push(staff)
    }
    return groups
  }, [allStaff])

  // スタッフの目標売上を取得
  const getTargetSales = (staffName: string, storeName: StoreName): number | null => {
    const data = monthlyData.manualData.staffManualData?.find(
      (s) => s.staffName === staffName && s.storeName === storeName
    )
    return data?.targetSales ?? null
  }

  // 店舗の目標合計を計算
  const getStoreTotalTarget = (storeName: StoreName): number => {
    const staffInStore = allStaff.filter((s) => s.storeName === storeName)
    return staffInStore.reduce((sum, s) => {
      const target = getTargetSales(s.staffName, s.storeName)
      return sum + (target ?? 0)
    }, 0)
  }

  // 店舗の実績合計を計算
  const getStoreTotalActual = (storeName: StoreName): number => {
    const staffInStore = allStaff.filter((s) => s.storeName === storeName)
    return staffInStore.reduce((sum, s) => sum + s.actualSales, 0)
  }

  // 全店舗合計
  const grandTotalTarget = Object.keys(storeGroups).reduce((sum, store) => sum + getStoreTotalTarget(store), 0)
  const grandTotalActual = allStaff.reduce((sum, s) => sum + s.actualSales, 0)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">目標売上入力</h1>
        <div className="flex items-center gap-4">
          {!isEditable && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full border">閲覧専用</span>
          )}
          {saveStatus && (
            <span className={`text-sm font-medium ${saveStatus === 'saving' ? 'text-blue-600' : 'text-green-600'}`}>
              {saveStatus === 'saving' ? '保存中...' : '保存完了'}
            </span>
          )}
        </div>
      </div>

      {allStaff.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-500 text-lg">Excelを取り込むとスタッフが自動表示されます</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 全体合計サマリー */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-4 text-white">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm opacity-80">目標合計</p>
                <p className="text-2xl font-bold">¥{grandTotalTarget.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">実績合計</p>
                <p className="text-2xl font-bold">¥{grandTotalActual.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">達成率</p>
                <p className="text-2xl font-bold">
                  {grandTotalTarget > 0 ? `${Math.round((grandTotalActual / grandTotalTarget) * 100)}%` : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* 店舗別テーブル */}
          {Object.entries(storeGroups).map(([storeName, staffList]) => {
            const storeTarget = getStoreTotalTarget(storeName)
            const storeActual = getStoreTotalActual(storeName)
            const storeRate = storeTarget > 0 ? Math.round((storeActual / storeTarget) * 100) : null

            return (
              <div key={storeName} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* 店舗ヘッダー */}
                <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
                  <h2 className="font-bold text-lg">{storeName}</h2>
                  <div className="flex items-center gap-6 text-sm">
                    <span>
                      目標合計: <strong>¥{storeTarget.toLocaleString()}</strong>
                    </span>
                    <span>
                      実績合計: <strong>¥{storeActual.toLocaleString()}</strong>
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        storeRate !== null && storeRate >= 100
                          ? 'bg-green-500'
                          : storeRate !== null
                            ? 'bg-yellow-500'
                            : 'bg-gray-500'
                      }`}
                    >
                      達成率: {storeRate !== null ? `${storeRate}%` : '-'}
                    </span>
                  </div>
                </div>

                {/* スタッフテーブル */}
                <table className="w-full border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left text-sm font-medium text-gray-700">スタッフ名</th>
                      <th className="p-3 text-right text-sm font-medium text-gray-700">目標売上（円）</th>
                      <th className="p-3 text-right text-sm font-medium text-gray-700">実績売上</th>
                      <th className="p-3 text-right text-sm font-medium text-gray-700">達成率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffList.map((staff, i) => {
                      const target = getTargetSales(staff.staffName, staff.storeName)
                      const rate = target && target > 0 ? Math.round((staff.actualSales / target) * 100) : null

                      return (
                        <tr key={i} className={`border-t ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="p-3 font-medium">{staff.staffName}</td>
                          <td className="p-3 text-right">
                            <input
                              type="number"
                              value={target ?? ''}
                              placeholder="0"
                              onBlur={(e) =>
                                isEditable &&
                                handleSave(() =>
                                  updateStaffManualData(
                                    staff.staffName,
                                    staff.storeName,
                                    storeIdMap.get(staff.storeName) ?? 0,
                                    {targetSales: e.target.value ? Number(e.target.value) : null}
                                  )
                                )
                              }
                              onChange={(e) =>
                                isEditable &&
                                updateStaffManualData(
                                  staff.staffName,
                                  staff.storeName,
                                  storeIdMap.get(staff.storeName) ?? 0,
                                  {targetSales: e.target.value ? Number(e.target.value) : null}
                                )
                              }
                              disabled={!isEditable}
                              className="w-32 px-2 py-1 border rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                            />
                          </td>
                          <td className="p-3 text-right text-sm">¥{staff.actualSales.toLocaleString()}</td>
                          <td className="p-3 text-right">
                            {rate !== null ? (
                              <span
                                className={`px-2 py-0.5 rounded text-sm font-bold ${
                                  rate >= 100 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {rate}%
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
