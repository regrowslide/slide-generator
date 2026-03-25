'use client'

import React, { useState } from 'react'
import { DataContextProvider, useDataContext } from '../../context/DataContext'
import { MonthSelector } from '../../components/MonthSelector'
import { ImportView } from '../../components/views/ImportView'
import { ImportDataView } from '../../components/views/ImportDataView'
import { ManualInputView } from '../../components/views/ManualInputView'
import { TargetSalesView } from '../../components/views/TargetSalesView'
import { SlidesView } from '../../components/views/SlidesView'
import type { SectionKey, YearMonth, MonthlyData, StaffMaster, RegrowScopes } from '../../types'
import type { RgStore } from '@prisma/generated/prisma/client'

type Props = {
  initialMonths: YearMonth[]
  initialYearMonth: YearMonth
  initialData: MonthlyData | null
  initialStaffMaster: StaffMaster[]
  initialStores: RgStore[]
  initialAllMonthlyData: Record<YearMonth, MonthlyData>
  regrowScopes: RegrowScopes
}

const RegrowReportClient = ({ initialMonths, initialYearMonth, initialData, initialStaffMaster, initialStores, initialAllMonthlyData, regrowScopes }: Props) => {
  return (
    <DataContextProvider
      initialMonths={initialMonths}
      initialYearMonth={initialYearMonth}
      initialData={initialData}
      initialStaffMaster={initialStaffMaster}
      initialStores={initialStores}
      initialAllMonthlyData={initialAllMonthlyData}
      initialScopes={regrowScopes}
    >
      <RegrowReportContent />
    </DataContextProvider>
  )
}

const RegrowReportContent = () => {
  const { scopes } = useDataContext()
  const [activeSection, setActiveSection] = useState<SectionKey>('slides')
  const { monthlyData, stores } = useDataContext()
  const storeNames = stores.map((s) => s.name)

  // タブ一覧（全ロールに全タブを表示）
  const sections: { key: SectionKey; label: string, isVisible: () => boolean }[] = [
    { key: 'import', label: 'Excel取込', isVisible: () => scopes.isAdmin },
    { key: 'import-data', label: 'データ確認', isVisible: () => scopes.isAdmin },
    { key: 'manual-input', label: '手動入力', isVisible: () => scopes.isAdmin },
    { key: 'target-sales', label: '目標売上', isVisible: () => scopes.isAdmin },
    { key: 'slides', label: 'スライド', isVisible: () => true },
  ].filter((section) => section.isVisible()) as { key: SectionKey; label: string, isVisible: () => boolean }[]

  // 手動入力の完了状況をチェック
  const checkManualInputStatus = (): { isComplete: boolean; missingCount: number } => {
    const hasImportedData = monthlyData.importedData !== null
    if (!hasImportedData) return { isComplete: true, missingCount: 0 }

    let missingCount = 0
    storeNames.forEach((storeName) => {
      const kpi = monthlyData.manualData.storeKpis?.find((k) => k.storeName === storeName)
      if (!kpi || kpi.utilizationRate === null) missingCount++
    })

    const staffCount = monthlyData.importedData?.staffRecords.length || 0
    const inputStaffCount = monthlyData.manualData.staffManualData?.length || 0
    if (staffCount > 0 && inputStaffCount < staffCount) {
      missingCount += staffCount - inputStaffCount
    }

    return { isComplete: missingCount === 0, missingCount }
  }

  const manualInputStatus = checkManualInputStatus()

  const renderView = () => {
    switch (activeSection) {
      case 'import':
        return <ImportView />
      case 'import-data':
        return <ImportDataView />
      case 'manual-input':
        return <ManualInputView />
      case 'target-sales':
        return <TargetSalesView />
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
                className={`px-6 py-3 font-medium transition-colors relative ${activeSection === section.key
                  ? 'border-b-2 border-red-500 text-red-600 bg-red-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
              >
                <span className="flex items-center gap-2">
                  {section.label}

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
