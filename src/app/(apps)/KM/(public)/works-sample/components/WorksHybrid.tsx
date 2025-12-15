'use client'

import { useState } from 'react'
import {
  Star,
  Building2,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  MessageCircle,
  Wrench,
  ChevronRight,
  Users,
  X,
} from 'lucide-react'
import { WorkSampleData, sampleWorks } from './sampleData'

export const WorksHybrid = () => {
  const [selectedWork, setSelectedWork] = useState<WorkSampleData | null>(sampleWorks[0])

  return (
    <div className="flex h-[calc(100vh-300px)] min-h-[600px] gap-4">
      {/* 左側: 一覧 */}
      <div className="w-full md:w-2/5 lg:w-1/3 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-4 py-3">
          <h3 className="font-semibold text-white">実績一覧</h3>
          <p className="text-xs text-blue-200">{sampleWorks.length}件の実績</p>
        </div>
        <div className="h-[calc(100%-60px)] overflow-y-auto">
          {sampleWorks.map(work => (
            <WorkListItem
              key={work.id}
              work={work}
              isSelected={selectedWork?.id === work.id}
              onSelect={() => setSelectedWork(work)}
            />
          ))}
        </div>
      </div>

      {/* 右側: 詳細 */}
      <div className="hidden md:block md:w-3/5 lg:w-2/3 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {selectedWork ? (
          <WorkDetail work={selectedWork} onClose={() => setSelectedWork(null)} />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            <p>左の一覧から実績を選択してください</p>
          </div>
        )}
      </div>

      {/* モバイル用モーダル */}
      {selectedWork && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/50" onClick={() => setSelectedWork(null)}>
          <div
            className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white"
            onClick={e => e.stopPropagation()}
          >
            <WorkDetail work={selectedWork} onClose={() => setSelectedWork(null)} isMobile />
          </div>
        </div>
      )}
    </div>
  )
}

// 一覧アイテム
const WorkListItem = ({
  work,
  isSelected,
  onSelect,
}: {
  work: WorkSampleData
  isSelected: boolean
  onSelect: () => void
}) => {
  const mainResult = work.quantitativeResult.split('\n')[0]

  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer border-b border-gray-100 p-4 transition-colors ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50'
        }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium truncate ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
            {work.title}
          </h4>
          <p className="mt-0.5 text-xs text-gray-500 truncate">{work.subtitle}</p>
        </div>
        <ChevronRight className={`h-5 w-5 flex-shrink-0 ${isSelected ? 'text-blue-600' : 'text-gray-300'}`} />
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
          {work.jobCategory}
        </span>
        <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-medium text-purple-700">
          {work.systemCategory}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs font-medium text-green-600 truncate flex-1">{mainResult}</p>
        <div className="flex items-center gap-0.5 flex-shrink-0 ml-2">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="text-xs font-medium text-amber-600">{work.toolPoint}</span>
        </div>
      </div>
    </div>
  )
}

// 詳細表示
const WorkDetail = ({
  work,
  onClose,
  isMobile = false,
}: {
  work: WorkSampleData
  onClose: () => void
  isMobile?: boolean
}) => {
  const StarRating = ({ rating, label }: { rating: number; label: string }) => (
    <div className="text-center">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="flex items-center justify-center gap-1">
        <span className="text-lg font-bold text-amber-600">{rating}</span>
        <div className="flex">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${i < Math.ceil(rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-full flex-col">
      {/* ヘッダー */}
      <div className="sticky top-0 bg-gradient-to-r from-blue-800 via-blue-900 to-blue-950 p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white lg:text-2xl">{work.title}</h2>
            <p className="mt-1 text-sm text-blue-200">{work.subtitle}</p>
          </div>
          {isMobile && (
            <button onClick={onClose} className="rounded-full p-1 hover:bg-white/20">
              <X className="h-5 w-5 text-white" />
            </button>
          )}
        </div>

        {/* タグ */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-200">
            {work.jobCategory}
          </span>
          <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-200">
            {work.systemCategory}
          </span>
          {work.collaborationTool && (
            <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-200">
              {work.collaborationTool}
            </span>
          )}
        </div>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto p-5">
        {/* メタ情報 */}
        <div className="mb-6 grid grid-cols-3 gap-4 rounded-xl bg-gray-50 p-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-500">
              <Building2 className="h-4 w-4" />
              <span className="text-xs">お客様</span>
            </div>
            <div className="mt-1 text-sm font-medium">
              {work.allowShowClient ? work.clientName : '非公開'}
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-500">
              <Users className="h-4 w-4" />
              <span className="text-xs">企業規模</span>
            </div>
            <div className="mt-1 text-sm font-medium">{work.companyScale}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-500">
              <Clock className="h-4 w-4" />
              <span className="text-xs">期間</span>
            </div>
            <div className="mt-1 text-sm font-medium">{work.projectDuration}</div>
          </div>
        </div>

        {/* 成果ハイライト */}
        <div className="mb-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-5 border border-green-200">
          <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
            <TrendingUp className="h-5 w-5" />
            導入効果
          </div>
          <p className="mt-2 whitespace-pre-line text-base font-bold text-green-800">
            {work.quantitativeResult}
          </p>
        </div>

        {/* Before / After */}
        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-red-700">
              <AlertCircle className="h-5 w-5" />
              導入前の課題
            </div>
            <p className="mt-2 text-sm text-gray-700">{work.beforeChallenge}</p>
          </div>
          <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              解決後
            </div>
            <p className="mt-2 text-sm text-gray-700">{work.description}</p>
          </div>
        </div>

        {/* ソリューション詳細 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <Wrench className="h-4 w-4 text-blue-600" />
            提供ソリューション詳細
          </div>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">{work.description}</p>
        </div>

        {/* 技術的工夫 */}
        {work.points && (
          <div className="mb-6">
            <div className="text-sm font-semibold text-gray-800">技術的工夫・ポイント</div>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">{work.points}</p>
          </div>
        )}

        {/* 顧客の声 */}
        {work.customerVoice && (
          <div className="mb-6 rounded-xl bg-amber-50 p-5 border border-amber-200">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
              <MessageCircle className="h-5 w-5" />
              お客様の声
            </div>
            <p className="mt-3 text-sm italic text-gray-700 leading-relaxed">
              「{work.customerVoice}」
            </p>
            {work.reply && (
              <div className="mt-4 border-t border-amber-200 pt-4">
                <div className="text-xs font-medium text-amber-600">改善マニアより</div>
                <p className="mt-1 text-sm text-gray-600">{work.reply}</p>
              </div>
            )}
          </div>
        )}

        {/* 評価 */}
        <div className="flex items-center justify-center gap-8 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 p-4 border border-amber-200">
          <StarRating rating={work.dealPoint} label="取引評価" />
          <div className="h-10 w-px bg-amber-200"></div>
          <StarRating rating={work.toolPoint} label="成果物評価" />
        </div>
      </div>
    </div>
  )
}
