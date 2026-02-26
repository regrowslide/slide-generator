'use client'

import React, {useState} from 'react'
import {DataContextProvider, useDataContext} from '../../context/DataContext'
import {MonthSelector} from '../../components/MonthSelector'
import {GuidanceView} from '../../components/views/GuidanceView'
import {ImportView} from '../../components/views/ImportView'
import {ImportDataView} from '../../components/views/ImportDataView'
import {ManualInputView} from '../../components/views/ManualInputView'
import {SlidesView} from '../../components/views/SlidesView'
import type {SectionKey, YearMonth, MonthlyData, StaffMaster, StoreName, StaffRole} from '../../types'
import type {RgStaff, RgStore} from '@prisma/generated/prisma/client'

type Props = {
  initialMonths: YearMonth[]
  initialYearMonth: YearMonth
  initialData: MonthlyData | null
  initialStaffMaster: (RgStaff & {RgStore: RgStore})[]
}

const RegrowReportClient = ({initialMonths, initialYearMonth, initialData, initialStaffMaster}: Props) => {
  // RgStaff → StaffMaster に変換
  const convertedStaffMaster: StaffMaster[] = initialStaffMaster.map((s) => ({
    staffName: s.staffName,
    storeName: s.RgStore.name as StoreName,
    role: s.role as StaffRole,
    isActive: s.isActive,
  }))

  return (
    <DataContextProvider
      initialMonths={initialMonths}
      initialYearMonth={initialYearMonth}
      initialData={initialData}
      initialStaffMaster={convertedStaffMaster}
    >
      <RegrowReportContent />
    </DataContextProvider>
  )
}

const RegrowReportContent = () => {
  const [activeSection, setActiveSection] = useState<SectionKey>('guidance')
  const {monthlyData} = useDataContext()

  const sections: {key: SectionKey; label: string}[] = [
    {key: 'guidance', label: 'ガイダンス'},
    {key: 'import', label: 'Excel取込'},
    {key: 'import-data', label: 'データ確認'},
    {key: 'manual-input', label: '手動入力'},
    {key: 'slides', label: 'スライド'},
  ]

  // 手動入力の完了状況をチェック
  const checkManualInputStatus = (): {isComplete: boolean; missingCount: number} => {
    const hasImportedData = monthlyData.importedData !== null
    if (!hasImportedData) return {isComplete: true, missingCount: 0}

    let missingCount = 0
    const stores: StoreName[] = ['港北店', '青葉店', '中央店']
    stores.forEach((storeName) => {
      const kpi = monthlyData.manualData.storeKpis?.find((k) => k.storeName === storeName)
      if (!kpi || kpi.utilizationRate === null) missingCount++
    })

    const staffCount = monthlyData.importedData?.staffRecords.length || 0
    const inputStaffCount = monthlyData.manualData.staffManualData?.length || 0
    if (staffCount > 0 && inputStaffCount < staffCount) {
      missingCount += staffCount - inputStaffCount
    }

    return {isComplete: missingCount === 0, missingCount}
  }

  const manualInputStatus = checkManualInputStatus()

  const renderView = () => {
    switch (activeSection) {
      case 'guidance':
        return <GuidanceView onNavigate={setActiveSection} />
      case 'import':
        return <ImportView />
      case 'import-data':
        return <ImportDataView />
      case 'manual-input':
        return <ManualInputView />
      case 'slides':
        return <SlidesView />
      default:
        return <div>Unknown Section</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 月選択UI */}
      <MonthSelector />

      {/* セクションナビゲーション */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {sections.map((section) => (
              <button
                key={section.key}
                data-guidance={`tab-${section.key}`}
                onClick={() => setActiveSection(section.key)}
                className={`px-6 py-3 font-medium transition-colors relative ${
                  activeSection === section.key
                    ? 'border-b-2 border-red-500 text-red-600 bg-red-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  {section.label}
                  {section.key === 'manual-input' && !manualInputStatus.isComplete && (
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                      !
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ビューコンテンツ */}
      <div>{renderView()}</div>
    </div>
  )
}

export default RegrowReportClient
