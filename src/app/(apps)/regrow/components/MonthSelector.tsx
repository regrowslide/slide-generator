'use client'

/**
 * YYYY-MM選択UI
 * ドロップダウン + 新規作成ボタン
 */

import React, {useState} from 'react'
import {useDataContext} from '../context/DataContext'
import {formatYearMonth, getCurrentYearMonth} from '../lib/storage'
import type {YearMonth} from '../types'

export const MonthSelector = () => {
  const {currentYearMonth, availableMonths, setCurrentYearMonth, createNewMonth} = useDataContext()
  const [isCreating, setIsCreating] = useState(false)
  const [newMonth, setNewMonth] = useState('')

  const handleCreateNew = () => {
    if (!newMonth) {
      alert('YYYY-MM形式で月を入力してください')
      return
    }

    // バリデーション
    const regex = /^\d{4}-\d{2}$/
    if (!regex.test(newMonth)) {
      alert('YYYY-MM形式で入力してください（例: 2026-02）')
      return
    }

    // 既存チェック
    if (availableMonths.includes(newMonth)) {
      alert('既に存在する月です')
      return
    }

    createNewMonth(newMonth)
    setIsCreating(false)
    setNewMonth('')
  }

  return (
    <div className="bg-white border-b shadow-sm p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* 月選択ドロップダウン */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">対象月:</label>
          <select
            value={currentYearMonth}
            onChange={(e) => setCurrentYearMonth(e.target.value as YearMonth)}
            className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {availableMonths.map((month) => (
              <option key={month} value={month}>
                {formatYearMonth(month)}
              </option>
            ))}
          </select>
        </div>

        {/* 新規作成ボタン */}
        <div>
          {!isCreating ? (
            <button
              onClick={() => {
                setIsCreating(true)
                setNewMonth(getCurrentYearMonth())
              }}
              className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium transition-colors"
            >
              + 新規作成
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newMonth}
                onChange={(e) => setNewMonth(e.target.value)}
                placeholder="YYYY-MM"
                className="px-3 py-1.5 border border-gray-300 rounded text-sm w-32 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                onClick={handleCreateNew}
                className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-medium transition-colors"
              >
                作成
              </button>
              <button
                onClick={() => {
                  setIsCreating(false)
                  setNewMonth('')
                }}
                className="px-3 py-1.5 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded text-sm font-medium transition-colors"
              >
                キャンセル
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
