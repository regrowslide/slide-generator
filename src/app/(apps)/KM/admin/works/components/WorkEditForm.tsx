'use client'

import { useState, useTransition } from 'react'
import { X, Save, Loader2, Eye } from 'lucide-react'
import { upsertKaizenWork, deleteKaizenWork } from '../actions'
import { WorkPreview } from './WorkPreview'

interface WorkEditFormProps {
  work: any | null
  clients: any[]
  onClose: () => void
  isNew?: boolean
}

const companyScaleOptions = ['1-10名', '11-50名', '51-100名', '100名以上']
const projectDurationOptions = ['1週間', '2週間', '3週間', '1ヶ月', '1.5ヶ月', '2ヶ月', '3ヶ月', '継続中']

export const WorkEditForm = ({ work, clients, onClose, isNew = false }: WorkEditFormProps) => {
  const [isPending, startTransition] = useTransition()
  const [showPreview, setShowPreview] = useState(false)
  const [formData, setFormData] = useState({
    id: work?.id || undefined,
    title: work?.title || '',
    subtitle: work?.subtitle || '',
    date: work?.date ? new Date(work.date).toISOString().split('T')[0] : '',
    status: work?.status || '',
    kaizenClientId: work?.kaizenClientId || '',
    allowShowClient: work?.allowShowClient || false,
    isPublic: work?.isPublic || false,
    jobCategory: work?.jobCategory || '',
    systemCategory: work?.systemCategory || '',
    collaborationTool: work?.collaborationTool || '',
    companyScale: work?.companyScale || '',
    projectDuration: work?.projectDuration || '',
    beforeChallenge: work?.beforeChallenge || '',
    description: work?.description || '',
    quantitativeResult: work?.quantitativeResult || '',
    points: work?.points || '',
    impression: work?.impression || '',
    reply: work?.reply || '',
    dealPoint: work?.dealPoint || '',
    toolPoint: work?.toolPoint || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      const result = await upsertKaizenWork({
        ...formData,
        id: formData.id || undefined,
        kaizenClientId: formData.kaizenClientId ? Number(formData.kaizenClientId) : null,
        dealPoint: formData.dealPoint ? Number(formData.dealPoint) : null,
        toolPoint: formData.toolPoint ? Number(formData.toolPoint) : null,
        date: formData.date || null,
      })

      if (result.success) {
        onClose()
      } else {
        alert('保存に失敗しました: ' + result.error)
      }
    })
  }

  const handleDelete = () => {
    if (!work?.id) return
    if (!confirm('この実績を削除しますか？この操作は取り消せません。')) return

    startTransition(async () => {
      const result = await deleteKaizenWork(work.id)
      if (result.success) {
        onClose()
      } else {
        alert('削除に失敗しました: ' + result.error)
      }
    })
  }

  // プレビュー用のデータを作成
  const previewData = {
    ...formData,
    dealPoint: formData.dealPoint ? Number(formData.dealPoint) : null,
    toolPoint: formData.toolPoint ? Number(formData.toolPoint) : null,
    KaizenClient: clients.find(c => c.id === Number(formData.kaizenClientId)),
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col h-full w-[1000px] text-sm">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">
            {isNew ? '新規実績作成' : '実績編集'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Eye className="h-4 w-4" />
              プレビュー
            </button>

          </div>
        </div>

        {/* フォーム本体 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* 左カラム */}
            <div className="space-y-6">
              {/* 基本情報 */}
              <fieldset className="border border-gray-200 rounded-lg p-4">
                <legend className="text-sm font-semibold text-gray-700 px-2">基本情報</legend>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">サブタイトル</label>
                    <input
                      type="text"
                      name="subtitle"
                      value={formData.subtitle}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
                      <input
                        type="text"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </fieldset>

              {/* クライアント */}
              <fieldset className="border border-gray-200 rounded-lg p-4">
                <legend className="text-sm font-semibold text-gray-700 px-2">クライアント</legend>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">クライアント</label>
                    <select
                      name="kaizenClientId"
                      value={formData.kaizenClientId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">選択してください</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.name}{client.organization ? ` (${client.organization})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="allowShowClient"
                        checked={formData.allowShowClient}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">クライアント名を表示</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="isPublic"
                        checked={formData.isPublic}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">公開する</span>
                    </label>
                  </div>
                </div>
              </fieldset>

              {/* カテゴリ */}
              <fieldset className="border border-gray-200 rounded-lg p-4">
                <legend className="text-sm font-semibold text-gray-700 px-2">カテゴリ</legend>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">業種</label>
                      <input
                        type="text"
                        name="jobCategory"
                        value={formData.jobCategory}
                        onChange={handleChange}
                        placeholder="例: 製造業, 飲食業"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ソリューション</label>
                      <input
                        type="text"
                        name="systemCategory"
                        value={formData.systemCategory}
                        onChange={handleChange}
                        placeholder="例: GAS, Webアプリ"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">連携サービス</label>
                    <input
                      type="text"
                      name="collaborationTool"
                      value={formData.collaborationTool}
                      onChange={handleChange}
                      placeholder="例: Slack, Freee, LINE"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">企業規模</label>
                      <select
                        name="companyScale"
                        value={formData.companyScale}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">選択してください</option>
                        {companyScaleOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">プロジェクト期間</label>
                      <select
                        name="projectDuration"
                        value={formData.projectDuration}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">選択してください</option>
                        {projectDurationOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </fieldset>

              {/* 評価 */}
              <fieldset className="border border-gray-200 rounded-lg p-4">
                <legend className="text-sm font-semibold text-gray-700 px-2">評価</legend>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">取引評価 (1-5)</label>
                    <input
                      type="number"
                      name="dealPoint"
                      value={formData.dealPoint}
                      onChange={handleChange}
                      min="1"
                      max="5"
                      step="0.5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">成果物評価 (1-5)</label>
                    <input
                      type="number"
                      name="toolPoint"
                      value={formData.toolPoint}
                      onChange={handleChange}
                      min="1"
                      max="5"
                      step="0.5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </fieldset>
            </div>

            {/* 右カラム */}
            <div className="space-y-6">
              {/* 課題と成果 */}
              <fieldset className="border border-red-200 rounded-lg p-4 bg-red-50/30">
                <legend className="text-sm font-semibold text-red-700 px-2">導入前の課題</legend>
                <textarea
                  name="beforeChallenge"
                  value={formData.beforeChallenge}
                  onChange={handleChange}
                  rows={4}
                  placeholder="例: 毎月末に3日間かけて手作業で請求書を作成。入力ミスが月平均5件発生..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </fieldset>

              <fieldset className="border border-green-200 rounded-lg p-4 bg-green-50/30">
                <legend className="text-sm font-semibold text-green-700 px-2">定量成果（最重要）</legend>
                <textarea
                  name="quantitativeResult"
                  value={formData.quantitativeResult}
                  onChange={handleChange}
                  rows={4}
                  placeholder="例: 作業時間: 3日→30分（97%削減）&#10;入力ミス: 月5件→0件&#10;年間削減工数: 約350時間"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </fieldset>

              <fieldset className="border border-blue-200 rounded-lg p-4 bg-blue-50/30">
                <legend className="text-sm font-semibold text-blue-700 px-2">提供ソリューション</legend>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="提供したソリューションの詳細を記載"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </fieldset>

              <fieldset className="border border-purple-200 rounded-lg p-4 bg-purple-50/30">
                <legend className="text-sm font-semibold text-purple-700 px-2">技術的工夫</legend>
                <textarea
                  name="points"
                  value={formData.points}
                  onChange={handleChange}
                  rows={3}
                  placeholder="技術的なポイントや工夫点を記載"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </fieldset>

              <fieldset className="border border-amber-200 rounded-lg p-4 bg-amber-50/30">
                <legend className="text-sm font-semibold text-amber-700 px-2">お客様の声</legend>
                <textarea
                  name="impression"
                  value={formData.impression}
                  onChange={handleChange}
                  rows={3}
                  placeholder="お客様からのフィードバック"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">改善マニアより</label>
                  <textarea
                    name="reply"
                    value={formData.reply}
                    onChange={handleChange}
                    rows={2}
                    placeholder="お客様への返信"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </fieldset>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          {!isNew && work?.id ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              削除
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              保存
            </button>
          </div>
        </div>
      </form>

      {/* プレビューモーダル */}
      {showPreview && (
        <WorkPreview work={previewData} onClose={() => setShowPreview(false)} />
      )}
    </>
  )
}
