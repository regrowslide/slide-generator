'use client'

/**
 * ガイダンスページ
 * YYYY-MM別の資料作成手順を案内
 */

import React from 'react'
import {useDataContext} from '../../context/DataContext'
import {formatYearMonth} from '../../lib/storage'
import {StatusBadge} from '../StatusBadge'
import type {SectionKey, Status, GuidanceStep} from '../../types'

type GuidanceViewProps = {
  onNavigate: (section: SectionKey) => void
}

export const GuidanceView = ({onNavigate}: GuidanceViewProps) => {
  const {currentYearMonth, monthlyData} = useDataContext()

  // Step 1: Excelインポート完了判定
  const step1Completed = monthlyData.importedData !== null && (monthlyData.importedData.storeTotals?.length || 0) >= 3

  // Step 2: 手動入力完了判定
  const step2Completed = (monthlyData.manualData.storeKpis?.length || 0) >= 3 && (monthlyData.manualData.staffManualData?.length || 0) > 0

  // Step 3: スライド準備完了判定
  const step3Completed = step1Completed && step2Completed

  const steps: GuidanceStep[] = [
    {
      step: 1,
      title: 'Excelファイルのインポート',
      description: '担当者別分析表（3店舗分）をアップロードしてください',
      completed: step1Completed,
      actionLabel: 'インポートページへ',
      targetSection: 'import',
    },
    {
      step: 2,
      title: '手動入力データの登録',
      description: '店舗KPI、スタッフ稼働率、ABCD評価などを入力してください',
      completed: step2Completed,
      actionLabel: '手動入力ページへ',
      targetSection: 'manual-input',
    },
    {
      step: 3,
      title: 'スライド資料の確認',
      description: '生成されたスライド資料を確認・印刷してください',
      completed: step3Completed,
      actionLabel: 'スライド閲覧ページへ',
      targetSection: 'slides',
    },
  ]

  const getStatus = (completed: boolean): Status => {
    return completed ? 'completed' : 'incomplete'
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg p-6 mb-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-2">資料作成ガイダンス</h1>
        <p className="text-lg">{formatYearMonth(currentYearMonth)} の月次資料を作成します</p>
      </div>

      {/* ステップ一覧 */}
      <div className="space-y-4 mb-8">
        {steps.map((step) => (
          <div key={step.step} className="bg-white border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              {/* ステップ番号 */}
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold ${
                  step.completed ? 'bg-green-500' : 'bg-gray-400'
                }`}
              >
                {step.step}
              </div>

              {/* ステップ内容 */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-lg font-bold text-gray-800">{step.title}</h2>
                  <StatusBadge status={getStatus(step.completed)} size="sm" />
                </div>
                <p className="text-gray-600 text-sm mb-3">{step.description}</p>

                {/* アクションボタン */}
                <button
                  onClick={() => onNavigate(step.targetSection)}
                  className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
                    step.completed
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {step.actionLabel}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* データステータス一覧 */}
      <div className="bg-gray-50 border rounded-lg p-5">
        <h3 className="text-lg font-bold mb-4 text-gray-800">データステータス</h3>

        <div className="space-y-3">
          {/* インポート済み店舗 */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">インポート済み店舗:</p>
            <div className="flex gap-2 flex-wrap">
              {['新潟西店', '三条店', '新潟中央店'].map((storeName) => {
                const hasData = monthlyData.importedData?.storeTotals.some((t) => t.storeName === storeName)
                return (
                  <span
                    key={storeName}
                    className={`px-3 py-1 rounded text-sm ${
                      hasData ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {storeName} {hasData ? '✅' : '⚠️'}
                  </span>
                )
              })}
            </div>
          </div>

          {/* 手動入力進捗 */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">手動入力進捗:</p>
            <div className="text-sm text-gray-600">
              <span>店舗KPI: {monthlyData.manualData.storeKpis?.length || 0} / 3</span>
              <span className="mx-2">|</span>
              <span>スタッフデータ: {monthlyData.manualData.staffManualData?.length || 0} 件</span>
            </div>
          </div>

          {/* 最終更新日時 */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">最終更新日時:</p>
            <p className="text-sm text-gray-600">{new Date(monthlyData.updatedAt).toLocaleString('ja-JP')}</p>
          </div>
        </div>
      </div>

      {/* 完了メッセージ */}
      {step3Completed && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">🎉 すべてのステップが完了しました！</p>
          <p className="text-green-700 text-sm mt-1">スライド資料を確認して、印刷またはPDF出力してください。</p>
        </div>
      )}
    </div>
  )
}
