'use client'

/**
 * 手動入力管理ビュー
 * 店舗KPI、スタッフ稼働率・CS登録数、お客様の声を入力
 */

import React, { useState, useEffect } from 'react'
import { useDataContext } from '../../context/DataContext'
import type { StoreName } from '../../types'

type TabKey = 'store-kpi' | 'staff-utilization' | 'customer-voice'
type StaffManualFieldName = 'utilizationRate' | 'csRegistrationCount' | 'googleReviewCount'

const StaffNumericField = ({
  value,
  fieldName,
  staffName,
  storeName,
  storeId,
  isEditable,
  onSave,
  onUpdate,
}: {
  value: number | null | undefined
  fieldName: StaffManualFieldName
  staffName: string
  storeName: StoreName
  storeId: number
  isEditable: boolean
  onSave: (fn: () => void) => void
  onUpdate: (staffName: string, storeName: StoreName, storeId: number, data: Record<string, number | null>) => void
}) => (
  <input
    type="number"
    value={value ?? ''}
    onBlur={(e) =>
      isEditable &&
      onSave(() =>
        onUpdate(staffName, storeName, storeId, {
          [fieldName]: e.target.value ? Number(e.target.value) : null,
        })
      )
    }
    onChange={(e) =>
      isEditable &&
      onUpdate(staffName, storeName, storeId, {
        [fieldName]: e.target.value ? Number(e.target.value) : null,
      })
    }
    disabled={!isEditable}
    className="w-24 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
  />
)

export const ManualInputView = () => {
  const { monthlyData, updateStoreKpi, updateStaffManualData, updateCustomerVoice, scopes, stores } = useDataContext()


  // storeName → storeId マッピング
  const storeIdMap = new Map(stores.map((s) => [s.name, s.id]))
  const [activeTab, setActiveTab] = useState<TabKey>('store-kpi')
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

  const storeNames = stores.map((s) => s.name)

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

  // 店舗のGoogle口コミ獲得数を計算（スタッフの合計）
  const calculateStoreGoogleReview = (storeName: StoreName): string => {
    const total =
      monthlyData.manualData.staffManualData
        ?.filter((s) => s.storeName === storeName)
        .reduce((sum, s) => sum + (s.googleReviewCount || 0), 0) || 0
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
        {!isEditable && (
          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full border">閲覧専用</span>
        )}
        {saveStatus && (
          <span
            className={`text-sm font-medium ${saveStatus === 'saving' ? 'text-blue-600' : 'text-green-600'
              }`}
          >
            {saveStatus === 'saving' ? '保存中...' : '保存完了 ✅'}
          </span>
        )}
      </div>

      {/* タブ */}
      <div data-guidance="manual-tabs" className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('store-kpi')}
          className={`px-6 py-3 font-medium transition-colors ${activeTab === 'store-kpi'
            ? 'border-b-2 border-red-500 text-red-600'
            : 'text-gray-600 hover:text-gray-800'
            }`}
        >
          店舗KPI
        </button>
        <button
          onClick={() => setActiveTab('staff-utilization')}
          className={`px-6 py-3 font-medium transition-colors ${activeTab === 'staff-utilization'
            ? 'border-b-2 border-red-500 text-red-600'
            : 'text-gray-600 hover:text-gray-800'
            }`}
        >
          スタッフ稼働率・CS登録数
        </button>
        <button
          data-guidance="customer-voice-tab"
          onClick={() => setActiveTab('customer-voice')}
          className={`px-6 py-3 font-medium transition-colors ${activeTab === 'customer-voice'
            ? 'border-b-2 border-red-500 text-red-600'
            : 'text-gray-600 hover:text-gray-800'
            }`}
        >
          お客様の声
        </button>
      </div>

      {/* 店舗KPIタブ */}
      {activeTab === 'store-kpi' && (
        <div data-guidance="store-kpi-form" className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">店舗月次KPI</h2>
          <div className="space-y-6">
            {storeNames.map((store) => {
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Google口コミ獲得数 <span className="text-xs text-gray-500">※自動計算</span>
                      </label>
                      <div className="w-full px-3 py-2 border rounded bg-gray-50 text-gray-700 font-medium">
                        {calculateStoreGoogleReview(store)}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">コメント</label>
                      <textarea
                        value={kpi?.comment ?? ''}
                        onBlur={(e) => isEditable && handleSave(() => updateStoreKpi(store, { comment: e.target.value }))}
                        onChange={(e) => isEditable && updateStoreKpi(store, { comment: e.target.value })}
                        disabled={!isEditable}
                        rows={2}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 resize-none disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
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
        <div>
          <h2 className="text-lg font-bold mb-4">スタッフ稼働率・CS登録数</h2>
          {allStaff.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-gray-500 text-lg">Excelを取り込むとスタッフが自動表示されます</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(
                allStaff.reduce<Record<string, typeof allStaff>>((groups, staff) => {
                  if (!groups[staff.storeName]) groups[staff.storeName] = []
                  groups[staff.storeName].push(staff)
                  return groups
                }, {})
              ).map(([storeName, staffList]) => (
                <div key={storeName} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* 店舗ヘッダー */}
                  <div className="bg-gray-800 text-white px-4 py-3">
                    <h3 className="font-bold text-lg">{storeName}</h3>
                  </div>

                  {/* スタッフテーブル */}
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-3 text-left text-sm font-medium text-gray-700">スタッフ名</th>
                        <th className="p-3 text-left text-sm font-medium text-gray-700">稼働率 (%)</th>
                        <th className="p-3 text-left text-sm font-medium text-gray-700">再来率 (%)</th>
                        <th className="p-3 text-left text-sm font-medium text-gray-700">CS登録数</th>
                        <th className="p-3 text-left text-sm font-medium text-gray-700">Google口コミ獲得数</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffList.map((staff, i) => {
                        const manualData = getStaffManualData(staff.staffName, staff.storeName)
                        const returnRate = calculateStaffReturnRate(staff.staffName, staff.storeName)
                        return (
                          <tr key={i} className={`border-t ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                            <td className="p-3 font-medium">{staff.staffName}</td>
                            <td className="p-3">
                              <StaffNumericField
                                value={manualData?.utilizationRate}
                                fieldName="utilizationRate"
                                staffName={staff.staffName}
                                storeName={staff.storeName}
                                storeId={storeIdMap.get(staff.storeName) ?? 0}
                                isEditable={isEditable}
                                onSave={handleSave}
                                onUpdate={updateStaffManualData}
                              />
                            </td>
                            <td className="p-3">
                              <div className="px-2 py-1 bg-gray-50 text-gray-700 text-sm font-medium rounded">
                                {returnRate}
                              </div>
                            </td>
                            <td className="p-3">
                              <StaffNumericField
                                value={manualData?.csRegistrationCount}
                                fieldName="csRegistrationCount"
                                staffName={staff.staffName}
                                storeName={staff.storeName}
                                storeId={storeIdMap.get(staff.storeName) ?? 0}
                                isEditable={isEditable}
                                onSave={handleSave}
                                onUpdate={updateStaffManualData}
                              />
                            </td>
                            <td className="p-3">
                              <StaffNumericField
                                value={manualData?.googleReviewCount}
                                fieldName="googleReviewCount"
                                staffName={staff.staffName}
                                storeName={staff.storeName}
                                storeId={storeIdMap.get(staff.storeName) ?? 0}
                                isEditable={isEditable}
                                onSave={handleSave}
                                onUpdate={updateStaffManualData}
                              />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* お客様の声タブ */}
      {activeTab === 'customer-voice' && (
        <div data-guidance="customer-voice" className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">お客様の声</h2>
          <textarea
            value={monthlyData.manualData.customerVoice.content}
            onBlur={(e) => isEditable && handleSave(() => updateCustomerVoice(e.target.value))}
            onChange={(e) => isEditable && updateCustomerVoice(e.target.value)}
            disabled={!isEditable}
            rows={12}
            placeholder="お客様からのフィードバックをここに入力してください..."
            className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 resize-none disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
          />
          <p className="text-sm text-gray-500 mt-2">
            ※ この内容はスライド18「お客様の声」に表示されます
          </p>
        </div>
      )}
    </div>
  )
}
