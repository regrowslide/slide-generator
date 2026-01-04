'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { Database, FileText, MessageSquare, Plus, Clock } from 'lucide-react'
import Link from 'next/link'

export default function LifeOSDashboard() {
 const [stats, setStats] = useState({
  totalLogs: 0,
  totalCategories: 0,
  recentLogs: [] as any[],
  categoryCounts: [] as { category: string; count: number }[],
 })
 const [isLoading, setIsLoading] = useState(true)

 const fetchStats = useCallback(async () => {
  setIsLoading(true)
  try {
   const response = await fetch('/lifeos/api/stats')
   if (response.ok) {
    const data = await response.json()
    if (data.success) {
     setStats(data.stats)
    }
   }
  } catch (error) {
   console.error('Failed to fetch stats:', error)
  } finally {
   setIsLoading(false)
  }
 }, [])

 useEffect(() => {
  fetchStats()
 }, [fetchStats])

 const statCards = [
  {
   title: '総ログ数',
   value: stats.totalLogs,
   icon: Database,
   color: 'bg-blue-100 text-blue-600',
   href: '/lifeos/logs',
  },
  {
   title: 'カテゴリ数',
   value: stats.totalCategories,
   icon: FileText,
   color: 'bg-green-100 text-green-600',
   href: '/lifeos/categories',
  },
  {
   title: '最近のアクティビティ',
   value: stats.recentLogs.length,
   icon: Clock,
   color: 'bg-purple-100 text-purple-600',
   href: '/lifeos/logs',
  },
 ]

 return (
  <div className="min-h-screen bg-gray-50 p-6">
   <C_Stack className="max-w-7xl mx-auto gap-6">
    {/* ヘッダー */}
    <div className="text-center">
     <h1 className="text-3xl font-bold text-gray-900 mb-2">LifeOS ダッシュボード</h1>
     <p className="text-gray-600">自然言語から動的に構造化・管理・可視化するプラットフォーム</p>
    </div>

    {/* 統計カード */}
    <R_Stack className="gap-4 flex-wrap">
     {statCards.map((card, index) => {
      const Icon = card.icon
      return (
       <Link
        key={index}
        href={card.href}
        className="flex-1 min-w-[200px] bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
       >
        <R_Stack className="items-center gap-4">
         <div className={`w-12 h-12 rounded-full ${card.color} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
         </div>
         <div className="flex-1">
          <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          <p className="text-sm text-gray-500">{card.title}</p>
         </div>
        </R_Stack>
       </Link>
      )
     })}
    </R_Stack>

    {/* クイックアクション */}
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
     <h2 className="text-xl font-bold text-gray-900 mb-4">クイックアクション</h2>
     <R_Stack className="gap-4 flex-wrap">
      <Link
       href="/lifeos/chat"
       className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
       <MessageSquare className="w-5 h-5" />
       チャットでログを追加
      </Link>
      <Link
       href="/lifeos/categories"
       className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
      >
       <Plus className="w-5 h-5" />
       カテゴリを管理
      </Link>
      <Link
       href="/lifeos/logs"
       className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
      >
       <FileText className="w-5 h-5" />
       ログを閲覧
      </Link>
     </R_Stack>
    </div>

    {/* 最近のログ */}
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
     <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-gray-900">最近のログ</h2>
      <Link href="/lifeos/logs" className="text-sm text-blue-600 hover:text-blue-700">
       すべて見る →
      </Link>
     </div>
     {stats.recentLogs.length === 0 ? (
      <div className="text-center py-8 text-gray-400">
       <p>まだログがありません</p>
       <Link href="/lifeos/chat" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
        チャットでログを追加する
       </Link>
      </div>
     ) : (
      <C_Stack className="gap-3">
       {stats.recentLogs.map((log) => (
        <div
         key={log.id}
         className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
         <div className="flex items-center justify-between">
          <div className="flex-1">
           <h3 className="font-semibold text-gray-900">{log.category.name}</h3>
           <p className="text-sm text-gray-500 mt-1">
            {new Date(log.createdAt).toLocaleString('ja-JP')}
           </p>
          </div>
          {log.category?.archetypes && log.category.archetypes.length > 0 && (
           <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
            {log.category.archetypes[0]}
           </span>
          )}
         </div>
        </div>
       ))}
      </C_Stack>
     )}
    </div>
   </C_Stack>
  </div>
 )
}

