'use client'

/**
 * Regrow モック統合ページ
 * 5セクション統合: guidance / import / import-data / manual-input / slides
 */

import React, {useState} from 'react'
import {useDataContext} from '@app/(apps)/regrow/context/DataContext'
import {MonthSelector} from '@app/(apps)/regrow/components/MonthSelector'
import {GuidanceView} from '@app/(apps)/regrow/components/views/GuidanceView'
import {ImportView} from '@app/(apps)/regrow/components/views/ImportView'
import {ImportDataView} from '@app/(apps)/regrow/components/views/ImportDataView'
import {ManualInputView} from '@app/(apps)/regrow/components/views/ManualInputView'
import {SlidesView} from '@app/(apps)/regrow/components/views/SlidesView'
import type {SectionKey} from '@app/(apps)/regrow/types'
import {loadMockData} from './lib/mockData'

interface RegrowMockUnifiedNewProps {
  externalSection?: SectionKey
  onSectionChange?: (section: SectionKey) => void
  hideNavigation?: boolean
  skipDataContext?: boolean
}

const RegrowMockUnifiedNew = ({externalSection, onSectionChange, hideNavigation}: RegrowMockUnifiedNewProps = {}) => {
  const [activeSection, setActiveSection] = useState<SectionKey>('guidance')

  const sections: {key: SectionKey; label: string}[] = [
    {key: 'guidance', label: 'ガイダンス'},
    {key: 'import', label: 'Excel取込'},
    {key: 'import-data', label: 'データ確認'},
    {key: 'manual-input', label: '手動入力'},
    {key: 'slides', label: 'スライド'},
  ]

  React.useEffect(() => {
    if (externalSection && externalSection !== activeSection) {
      setActiveSection(externalSection)
    }
  }, [externalSection])

  const handleSetActiveSection = (section: SectionKey) => {
    setActiveSection(section)
    onSectionChange?.(section)
  }

  return <RegrowMockContent activeSection={activeSection} setActiveSection={handleSetActiveSection} sections={sections} hideNavigation={hideNavigation} />
}

const RegrowMockContent = ({
  activeSection,
  setActiveSection,
  sections,
  hideNavigation,
}: {
  activeSection: SectionKey
  setActiveSection: (section: SectionKey) => void
  sections: {key: SectionKey; label: string}[]
  hideNavigation?: boolean
}) => {
  const {monthlyData} = useDataContext()

  // 手動入力の完了状況をチェック
  const checkManualInputStatus = (): {isComplete: boolean; missingCount: number} => {
    const hasImportedData = monthlyData.importedData !== null

    if (!hasImportedData) {
      return {isComplete: true, missingCount: 0}
    }

    let missingCount = 0

    const stores: ('港北店' | '青葉店' | '中央店')[] = ['港北店', '青葉店', '中央店']
    stores.forEach((storeName) => {
      const kpi = monthlyData.manualData.storeKpis?.find((k) => k.storeName === storeName)
      if (!kpi || kpi.utilizationRate === null) {
        missingCount++
      }
    })

    const staffCount = monthlyData.importedData?.staffRecords.length || 0
    const inputStaffCount = monthlyData.manualData.staffManualData?.length || 0
    if (staffCount > 0 && inputStaffCount < staffCount) {
      missingCount += staffCount - inputStaffCount
    }

    return {
      isComplete: missingCount === 0,
      missingCount,
    }
  }

  const manualInputStatus = checkManualInputStatus()

  // モックデータ読み込みハンドラ
  const handleLoadMockData = async () => {
    loadMockData()
  }

  const renderView = () => {
    switch (activeSection) {
      case 'guidance':
        return <GuidanceView onNavigate={setActiveSection} onLoadMockData={handleLoadMockData} />
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
    <div className={hideNavigation ? '' : 'min-h-screen bg-gray-100'}>
      {!hideNavigation && (
        <>
          <MonthSelector />

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
        </>
      )}

      <div>{renderView()}</div>
    </div>
  )
}

export default RegrowMockUnifiedNew
