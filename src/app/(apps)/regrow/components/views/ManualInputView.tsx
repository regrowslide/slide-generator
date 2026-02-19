'use client'

/**
 * 手動入力管理ビュー
 * 店舗KPI、スタッフ稼働率、ABCD評価、お客様の声を入力
 */

import React, {useState, useEffect} from 'react'
import {useDataContext} from '../../context/DataContext'
import type {StoreName} from '../../types'

type TabKey = 'store-kpi' | 'staff-utilization' | 'customer-voice'

export const ManualInputView = () => {
  const {monthlyData, updateStoreKpi, updateStaffManualData, updateCustomerVoice} = useDataContext()
  const [activeTab, setActiveTab] = useState<TabKey>('store-kpi')
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | null>(null)

  const handleSave = (callback: () => void) => {
    setSaveStatus('saving')
    callback()
    setTimeout(() => {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus(null), 2000)
    }, 300)
  }

  const stores: StoreName[] = ['新潟西店', '三条店', '新潟中央店']

  // スタッフリストを取得（インポートデータから）
  const allStaff =
    monthlyData.importedData?.staffRecords.map((r) => ({
      staffName: r.staffName,
      storeName: r.storeName,
    })) || []

  // 店舗KPI取得/初期化
  const getStoreKpi = (storeName: StoreName) => {
    return monthlyData.manualData.storeKpis?.find((k) => k.storeName === storeName)
  }

  // スタッフ手動入力データ取得
  const getStaffManualData = (staffName: string, storeName: StoreName) => {
    return monthlyData.manualData.staffManualData?.find(
      (s) => s.staffName === staffName && s.storeName === storeName
    )
  }

  // スタッフの再来率を計算
  const calculateStaffReturnRate = (staffName: string, storeName: StoreName): string => {
    const staffRecord = monthlyData.importedData?.staffRecords.find(
      (r) => r.staffName === staffName && r.storeName === storeName
    )
    if (!staffRecord || !staffRecord.customerCount || staffRecord.customerCount === 0) return '-'
    const returningCustomers = (staffRecord.customerCount || 0) - (staffRecord.newCustomerCount || 0)
    const rate = Math.round((returningCustomers / staffRecord.customerCount) * 100 * 10) / 10
    return Number.isNaN(rate) ? '-' : String(rate)
  }

  // 店舗のCS登録数を計算（スタッフの合計）
  const calculateStoreCS = (storeName: StoreName): string => {
    const total =
      monthlyData.manualData.staffManualData
        ?.filter((s) => s.storeName === storeName)
        .reduce((sum, s) => sum + (s.csRegistrationCount || 0), 0) || 0
    return Number.isNaN(total) ? '-' : String(total)
  }

  // 店舗の再来率を計算
  const calculateStoreReturnRate = (storeName: StoreName): string => {
    const storeRecords = monthlyData.importedData?.staffRecords.filter((r) => r.storeName === storeName) || []
    if (storeRecords.length === 0) return '-'
    const totalCustomers = storeRecords.reduce((sum, r) => sum + (r.customerCount || 0), 0)
    const totalNewCustomers = storeRecords.reduce((sum, r) => sum + (r.newCustomerCount || 0), 0)
    if (totalCustomers === 0) return '-'
    const returningCustomers = totalCustomers - totalNewCustomers
    const rate = Math.round((returningCustomers / totalCustomers) * 100 * 10) / 10
    return Number.isNaN(rate) ? '-' : String(rate)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">手動入力管理</h1>
        {saveStatus && (
          <span
            className={`text-sm font-medium ${
              saveStatus === 'saving' ? 'text-blue-600' : 'text-green-600'
            }`}
          >
            {saveStatus === 'saving' ? '保存中...' : '保存完了 ✅'}
          </span>
        )}
      </div>

      {/* タブ */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('store-kpi')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'store-kpi'
              ? 'border-b-2 border-red-500 text-red-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          店舗KPI
        </button>
        <button
          onClick={() => setActiveTab('staff-utilization')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'staff-utilization'
              ? 'border-b-2 border-red-500 text-red-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          スタッフ稼働率・CS登録数
        </button>
        <button
          onClick={() => setActiveTab('customer-voice')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'customer-voice'
              ? 'border-b-2 border-red-500 text-red-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          お客様の声
        </button>
      </div>

      {/* 店舗KPIタブ */}
      {activeTab === 'store-kpi' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">店舗月次KPI</h2>
          <div className="space-y-6">
            {stores.map((store) => {
              const kpi = getStoreKpi(store)
              return (
                <div key={store} className="border rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-3 text-gray-800">{store}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        稼働率 (%) <span className="text-xs text-gray-500">※スタッフ平均で自動計算</span>
                      </label>
                      <div className="w-full px-3 py-2 border rounded bg-gray-50 text-gray-700 font-medium">
                        {(() => {
                          const staffData = monthlyData.manualData.staffManualData?.filter(
                            (s) =>
                              s.storeName === store &&
                              s.utilizationRate !== null &&
                              s.utilizationRate !== undefined
                          ) || []
                          if (staffData.length === 0) return '-'
                          const avg =
                            staffData.reduce((sum, s) => sum + (s.utilizationRate || 0), 0) / staffData.length
                          return `${(Math.round(avg * 10) / 10).toFixed(1)}`
                        })()}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        再来率 (%) <span className="text-xs text-gray-500">※自動計算</span>
                      </label>
                      <div className="w-full px-3 py-2 border rounded bg-gray-50 text-gray-700 font-medium">
                        {calculateStoreReturnRate(store)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CS登録数 <span className="text-xs text-gray-500">※自動計算</span>
                      </label>
                      <div className="w-full px-3 py-2 border rounded bg-gray-50 text-gray-700 font-medium">
                        {calculateStoreCS(store)}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">コメント</label>
                      <textarea
                        value={kpi?.comment ?? ''}
                        onBlur={(e) => handleSave(() => updateStoreKpi(store, {comment: e.target.value}))}
                        onChange={(e) => updateStoreKpi(store, {comment: e.target.value})}
                        rows={2}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* スタッフ稼働率・CS登録数タブ */}
      {activeTab === 'staff-utilization' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">スタッフ稼働率・CS登録数</h2>
          {allStaff.length === 0 ? (
            <p className="text-gray-500">Excelを取り込むとスタッフが自動表示されます</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-purple-600 text-white">
                  <tr>
                    <th className="p-3 text-left">店舗</th>
                    <th className="p-3 text-left">名前</th>
                    <th className="p-3 text-left">稼働率 (%)</th>
                    <th className="p-3 text-left">再来率 (%)</th>
                    <th className="p-3 text-left">CS登録数</th>
                  </tr>
                </thead>
                <tbody>
                  {allStaff.map((staff, i) => {
                    const manualData = getStaffManualData(staff.staffName, staff.storeName)
                    const returnRate = calculateStaffReturnRate(staff.staffName, staff.storeName)
                    return (
                      <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="p-3 text-sm">{staff.storeName}</td>
                        <td className="p-3 font-medium">{staff.staffName}</td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={manualData?.utilizationRate ?? ''}
                            onBlur={(e) =>
                              handleSave(() =>
                                updateStaffManualData(staff.staffName, staff.storeName, {
                                  utilizationRate: e.target.value ? Number(e.target.value) : null,
                                })
                              )
                            }
                            onChange={(e) =>
                              updateStaffManualData(staff.staffName, staff.storeName, {
                                utilizationRate: e.target.value ? Number(e.target.value) : null,
                              })
                            }
                            className="w-24 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </td>
                        <td className="p-3">
                          <div className="px-2 py-1 bg-gray-50 text-gray-700 text-sm font-medium rounded">
                            {returnRate}
                          </div>
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={manualData?.csRegistrationCount ?? ''}
                            onBlur={(e) =>
                              handleSave(() =>
                                updateStaffManualData(staff.staffName, staff.storeName, {
                                  csRegistrationCount: e.target.value ? Number(e.target.value) : null,
                                })
                              )
                            }
                            onChange={(e) =>
                              updateStaffManualData(staff.staffName, staff.storeName, {
                                csRegistrationCount: e.target.value ? Number(e.target.value) : null,
                              })
                            }
                            className="w-24 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* お客様の声タブ */}
      {activeTab === 'customer-voice' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">お客様の声</h2>
          <textarea
            value={monthlyData.manualData.customerVoice.content}
            onBlur={(e) => handleSave(() => updateCustomerVoice(e.target.value))}
            onChange={(e) => updateCustomerVoice(e.target.value)}
            rows={12}
            placeholder="お客様からのフィードバックをここに入力してください..."
            className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
          />
          <p className="text-sm text-gray-500 mt-2">
            ※ この内容はスライド10「お客様の声」に表示されます
          </p>
        </div>
      )}
    </div>
  )
}
