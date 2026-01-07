'use client'

import { useState } from 'react'
import { FolderTree, Table, PlusCircle, Settings } from 'lucide-react'
import { ClientWorkTree } from './components/ClientWorkTree'
import { BulkEditPanel } from './components/BulkEditPanel'
import { WorkEditForm } from './components/WorkEditForm'
import { useJotaiByKey } from '@cm/hooks/useJotai'

type TabId = 'tree' | 'table' | 'create'

interface Tab {
  id: TabId
  label: string
  icon: React.ReactNode
}

const tabs: Tab[] = [
  { id: 'tree', label: 'ツリー表示', icon: <FolderTree className="h-5 w-5" /> },
  { id: 'table', label: '一覧・一括編集', icon: <Table className="h-5 w-5" /> },
  { id: 'create', label: '新規作成', icon: <PlusCircle className="h-5 w-5" /> },
]

interface WorksAdminCCProps {
  clients: any[]
  works: any[]
}

export const WorksAdminCC = ({ clients, works: initialWorks }: WorksAdminCCProps) => {
  const [activeTab, setActiveTab] = useJotaiByKey<TabId>('worksAdminCC.activeTab', 'tree')
  const [selectedWorkId, setSelectedWorkId] = useState<number | null>(null)
  const [works, setWorks] = useState(initialWorks)

  const selectedWork = works.find(w => w.id === selectedWorkId) || null

  // worksの並び順を更新する関数
  const handleWorksUpdate = (updatedWorks: any[]) => {
    setWorks(updatedWorks)
  }

  return (
    <div className="flex flex-col  ">
      {/* ヘッダー */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white shadow-lg">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6" />
              <h1 className="text-xl font-bold sm:text-2xl">実績管理</h1>
            </div>
            <div className="text-sm text-blue-200">
              {clients.length}件のクライアント / {works.length}件の実績
            </div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="px-4 sm:px-6 lg:px-8 ">
          <nav className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tab.id
                  ? 'bg-white text-blue-900'
                  : 'text-blue-200 hover:text-white hover:bg-blue-700/50'
                  }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 overflow-hidden  bg-white p-2">
        {activeTab === 'tree' && (
          <ClientWorkTree
            clients={clients}
            works={works}
            selectedWorkId={selectedWorkId}
            onSelectWork={setSelectedWorkId}
            onWorksUpdate={handleWorksUpdate}
          />
        )}

        {activeTab === 'table' && (
          <BulkEditPanel clients={clients} works={works} onWorksUpdate={handleWorksUpdate} />
        )}

        {activeTab === 'create' && (
          <div className="h-full overflow-y-auto p-6">
            <WorkEditForm
              work={null}
              clients={clients}
              onClose={() => { }}
              isNew
            />
          </div>
        )}
      </main>
    </div>
  )
}
