'use client'

import {useState} from 'react'
import {Users, Monitor, Shield} from 'lucide-react'

import UserManagementTab from './components/tabs/UserManagementTab'
import SessionManagementTab from './components/tabs/SessionManagementTab'
import RoleMasterTab from './components/tabs/RoleMasterTab'

type Tab = 'users' | 'sessions' | 'roles'

const tabs: {id: Tab; label: string; icon: typeof Users}[] = [
  {id: 'users', label: 'ユーザー管理', icon: Users},
  {id: 'sessions', label: 'セッション管理', icon: Monitor},
  {id: 'roles', label: '権限マスタ', icon: Shield},
]

const AdminDashboardClient = () => {
  const [activeTab, setActiveTab] = useState<Tab>('users')

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">管理者ダッシュボード</h2>

      {/* タブ */}
      <div className="flex gap-2 border-b">
        {tabs.map(({id, label, icon: Icon}) => (
          <button
            key={id}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setActiveTab(id)}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* タブコンテンツ */}
      {activeTab === 'users' && <UserManagementTab />}
      {activeTab === 'sessions' && <SessionManagementTab />}
      {activeTab === 'roles' && <RoleMasterTab />}
    </div>
  )
}

export default AdminDashboardClient
