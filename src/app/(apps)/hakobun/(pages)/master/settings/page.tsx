'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { HakobunClient } from '../../../types'
import { Save, Settings, AlertCircle } from 'lucide-react'
import useSelectedClient from '../../../(globalHooks)/useSelectedClient'
import useMyNavigation from '@cm/hooks/globalHooks/useMyNavigation'

interface SettingsFormData {
  inputDataExplain: string
  analysisStartDate: string
  analysisEndDate: string
}

const initialFormData: SettingsFormData = {
  inputDataExplain: '',
  analysisStartDate: '',
  analysisEndDate: '',
}

export default function AISettingsPage() {
  const { selectedClient } = useSelectedClient()
  const { getHref } = useMyNavigation()
  const [client, setClient] = useState<HakobunClient | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<SettingsFormData>(initialFormData)

  // クライアント情報と設定を取得
  const fetchClientSettings = useCallback(async () => {
    if (!selectedClient?.clientId) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/hakobun/clients')
      const data = await res.json()
      if (data.success && data.clients) {
        const foundClient = data.clients.find((c: HakobunClient) => c.clientId === selectedClient.clientId)
        if (foundClient) {
          setClient(foundClient)
          setFormData({
            inputDataExplain: foundClient.inputDataExplain || '',
            analysisStartDate: foundClient.analysisStartDate
              ? new Date(foundClient.analysisStartDate).toISOString().slice(0, 16)
              : '',
            analysisEndDate: foundClient.analysisEndDate
              ? new Date(foundClient.analysisEndDate).toISOString().slice(0, 16)
              : '',
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch client settings:', error)
      alert('設定の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [selectedClient?.clientId])

  useEffect(() => {
    fetchClientSettings()
  }, [fetchClientSettings])

  // 保存
  const handleSave = async () => {
    if (!client?.id) {
      alert('クライアントが選択されていません')
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/hakobun/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: client.id,
          inputDataExplain: formData.inputDataExplain || null,
          analysisStartDate: formData.analysisStartDate || null,
          analysisEndDate: formData.analysisEndDate || null,
        }),
      })

      const data = await res.json()
      if (data.success) {
        alert('設定を保存しました')
        fetchClientSettings()
      } else {
        alert(`保存エラー: ${data.error}`)
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  if (!selectedClient) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <C_Stack className="max-w-4xl mx-auto gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-500">
              <AlertCircle className="w-5 h-5" />
              <p>クライアントを選択してください</p>
            </div>
          </div>
        </C_Stack>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <C_Stack className="max-w-4xl mx-auto gap-6">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <R_Stack className="items-center gap-3 mb-2">
            <Settings className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">AI分析用設定</h1>
          </R_Stack>
          <p className="text-sm text-gray-600">
            クライアント: <span className="font-medium">{selectedClient.name}</span> ({selectedClient.clientId})
          </p>
        </div>

        {/* 設定フォーム */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-500 text-center py-8">読み込み中...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <C_Stack className="gap-6">
              {/* 投稿データの説明 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  投稿説明
                  <span className="ml-2 text-xs text-gray-500 font-normal">
                    （文節分け用ポ回答データの説明）
                  </span>
                </label>
                <textarea
                  value={formData.inputDataExplain}
                  onChange={e => setFormData({ ...formData, inputDataExplain: e.target.value })}
                  placeholder="分析対象となる投稿データの説明を入力してください（例：飲食店のアンケート回答、スポーツ観戦の感想など）"
                  className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y text-sm"
                  rows={3}
                />
                <p className="mt-1 text-xs text-gray-500">
                  AIが投稿データの文脈を理解するための説明文です。
                </p>
              </div>

              {/* 分析期間 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    期間開始日
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.analysisStartDate}
                    onChange={e => setFormData({ ...formData, analysisStartDate: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    期間終了日
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.analysisEndDate}
                    onChange={e => setFormData({ ...formData, analysisEndDate: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                分析対象期間を指定できます（現在は設定のみで、実際のフィルタリング機能は未実装）
              </p>

              {/* 保存ボタン */}
              <R_Stack className="justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  disabled={isSaving || !client}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    isSaving || !client
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? '保存中...' : '設定を保存'}
                </button>
              </R_Stack>
            </C_Stack>
          </div>
        )}
      </C_Stack>
    </div>
  )
}

