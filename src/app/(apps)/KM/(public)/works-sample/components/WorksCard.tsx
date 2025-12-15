'use client'

import { useState } from 'react'
import {
  Star,
  Building2,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  MessageCircle,
  Wrench,
  X,
  Users,
  Maximize2,
} from 'lucide-react'
import { WorkSampleData, sampleWorks } from './sampleData'

export const WorksCard = () => {
  const [selectedWork, setSelectedWork] = useState<WorkSampleData | null>(null)

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div className="text-center">
        <div className="mb-2 inline-block rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">
          Works
        </div>
        <h2 className="text-3xl font-bold text-gray-900">実績・制作物</h2>
        <p className="mt-2 text-gray-600">様々な業界・業種で業務改善を実現してきました</p>
      </div>

      {/* カードグリッド */}
      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {sampleWorks.map(work => (
          <WorkCardItem key={work.id} work={work} onOpenDetail={() => setSelectedWork(work)} />
        ))}
      </div>

      {/* 件数表示 */}
      <div className="text-center">
        <span className="inline-block rounded-full bg-blue-100 px-6 py-2 text-sm font-semibold text-blue-700">
          {sampleWorks.length}件の実績
        </span>
      </div>

      {/* 詳細モーダル */}
      {selectedWork && <WorkDetailModal work={selectedWork} onClose={() => setSelectedWork(null)} />}
    </div>
  )
}

const WorkCardItem = ({
  work,
  onOpenDetail,
}: {
  work: WorkSampleData
  onOpenDetail: () => void
}) => {
  const StarRating = ({ rating, label }: { rating: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="flex items-center gap-1">
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

  // 定量成果をパースして最初の項目を取得
  const mainResult = work.quantitativeResult.split('\n')[0]

  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
      {/* ヘッダー */}
      <div className="relative bg-gradient-to-r from-blue-800 via-blue-900 to-blue-950 p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white">{work.title}</h3>
            <p className="mt-1 text-sm text-blue-200">{work.subtitle}</p>
          </div>
        </div>

        {/* タグ */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-200">
            {work.jobCategory}
          </span>
          <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-medium text-purple-200">
            {work.systemCategory}
          </span>
          {work.collaborationTool && (
            <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-medium text-blue-200">
              {work.collaborationTool}
            </span>
          )}
        </div>
      </div>

      {/* 顧客・期間情報 */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-3">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-700">
            {work.allowShowClient ? work.clientName : '匿名のお客様'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            {work.projectDuration}
          </div>
          <span className="rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-600">{work.companyScale}</span>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="p-5">
        {/* 成果ハイライト */}
        <div className="mb-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
            <TrendingUp className="h-5 w-5" />
            導入効果
          </div>
          <div className="mt-2 text-lg font-bold text-green-800">{mainResult}</div>
        </div>

        {/* Before → After（サマリー） */}
        <div className="space-y-3">
          {/* Before */}
          <div className="rounded-lg border border-red-200 bg-red-50/50 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-red-600">
              <AlertCircle className="h-4 w-4" />
              導入前の課題
            </div>
            <p className="mt-1 text-sm text-gray-700 line-clamp-2">{work.beforeChallenge}</p>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <ArrowRight className="h-5 w-5 rotate-90 text-blue-400" />
          </div>

          {/* After */}
          <div className="rounded-lg border border-green-200 bg-green-50/50 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              解決後の成果
            </div>
            <p className="mt-1 whitespace-pre-line text-sm font-medium text-gray-700 line-clamp-3">
              {work.quantitativeResult}
            </p>
          </div>
        </div>

        {/* 詳細を見るボタン */}
        <button
          onClick={onOpenDetail}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Maximize2 className="h-4 w-4" />
          詳細を見る
        </button>
      </div>

      {/* フッター - 評価 */}
      <div className="flex items-center justify-center gap-8 border-t border-gray-100 bg-gradient-to-r from-amber-50 to-yellow-50 px-5 py-3">
        <StarRating rating={work.dealPoint} label="取引評価" />
        <div className="h-8 w-px bg-amber-200"></div>
        <StarRating rating={work.toolPoint} label="成果物評価" />
      </div>
    </div>
  )
}

// 詳細モーダル
const WorkDetailModal = ({ work, onClose }: { work: WorkSampleData; onClose: () => void }) => {
  const StarRating = ({ rating, label }: { rating: number; label: string }) => (
    <div className="text-center">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="flex items-center justify-center gap-1 mt-1">
        <span className="text-2xl font-bold text-amber-600">{rating}</span>
        <div className="flex">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${i < Math.ceil(rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[95vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* モーダルヘッダー */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-800 via-blue-900 to-blue-950 p-6 lg:p-8">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <h2 className="text-2xl font-bold text-white lg:text-3xl">{work.title}</h2>
              <p className="mt-2 text-lg text-blue-200">{work.subtitle}</p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* タグ */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-500/30 px-4 py-1.5 text-sm font-medium text-emerald-100">
              {work.jobCategory}
            </span>
            <span className="rounded-full bg-purple-500/30 px-4 py-1.5 text-sm font-medium text-purple-100">
              {work.systemCategory}
            </span>
            {work.collaborationTool && (
              <span className="rounded-full bg-blue-500/30 px-4 py-1.5 text-sm font-medium text-blue-100">
                {work.collaborationTool}
              </span>
            )}
          </div>
        </div>

        {/* モーダル本文 */}
        <div className="max-h-[calc(95vh-200px)] overflow-y-auto p-6 lg:p-8">
          {/* メタ情報 */}
          <div className="mb-8 grid grid-cols-3 gap-4 rounded-2xl bg-gray-50 p-5">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <Building2 className="h-5 w-5" />
                <span className="text-sm">お客様</span>
              </div>
              <div className="mt-2 text-base font-semibold text-gray-900">
                {work.allowShowClient ? work.clientName : '非公開'}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <Users className="h-5 w-5" />
                <span className="text-sm">企業規模</span>
              </div>
              <div className="mt-2 text-base font-semibold text-gray-900">{work.companyScale}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <Clock className="h-5 w-5" />
                <span className="text-sm">プロジェクト期間</span>
              </div>
              <div className="mt-2 text-base font-semibold text-gray-900">{work.projectDuration}</div>
            </div>
          </div>

          {/* 成果ハイライト */}
          <div className="mb-8 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-2 border-green-200">
            <div className="flex items-center gap-3 text-lg font-bold text-green-700">
              <TrendingUp className="h-6 w-6" />
              導入効果
            </div>
            <p className="mt-4 whitespace-pre-line text-xl font-bold leading-relaxed text-green-800">
              {work.quantitativeResult}
            </p>
          </div>

          {/* Before / After */}
          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-5">
              <div className="flex items-center gap-2 text-base font-bold text-red-700">
                <AlertCircle className="h-5 w-5" />
                導入前の課題
              </div>
              <p className="mt-3 text-base leading-relaxed text-gray-700">{work.beforeChallenge}</p>
            </div>
            <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-5">
              <div className="flex items-center gap-2 text-base font-bold text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                解決後の状態
              </div>
              <p className="mt-3 text-base leading-relaxed text-gray-700">{work.description}</p>
            </div>
          </div>

          {/* ソリューション詳細 */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <Wrench className="h-5 w-5 text-blue-600" />
              提供ソリューション詳細
            </div>
            <p className="mt-3 text-base leading-relaxed text-gray-600">{work.description}</p>
          </div>

          {/* 技術的工夫 */}
          {work.points && (
            <div className="mb-8">
              <div className="text-lg font-bold text-gray-900">技術的工夫・ポイント</div>
              <p className="mt-3 text-base leading-relaxed text-gray-600">{work.points}</p>
            </div>
          )}

          {/* 顧客の声 */}
          {work.customerVoice && (
            <div className="mb-8 rounded-2xl bg-amber-50 p-6 border-2 border-amber-200">
              <div className="flex items-center gap-2 text-lg font-bold text-amber-700">
                <MessageCircle className="h-5 w-5" />
                お客様の声
              </div>
              <p className="mt-4 text-lg italic leading-relaxed text-gray-700">
                「{work.customerVoice}」
              </p>
              {work.reply && (
                <div className="mt-4 border-t-2 border-amber-200 pt-4">
                  <div className="text-sm font-semibold text-amber-600">改善マニアより</div>
                  <p className="mt-2 text-base text-gray-600">{work.reply}</p>
                </div>
              )}
            </div>
          )}

          {/* 評価 */}
          <div className="flex items-center justify-center gap-12 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 p-6 border-2 border-amber-200">
            <StarRating rating={work.dealPoint} label="取引評価" />
            <div className="h-16 w-px bg-amber-300"></div>
            <StarRating rating={work.toolPoint} label="成果物評価" />
          </div>
        </div>

        {/* モーダルフッター */}
        <div className="sticky bottom-0 border-t border-gray-200 bg-gray-50 p-4">
          <button
            onClick={onClose}
            className="mx-auto flex items-center justify-center gap-2 rounded-xl bg-gray-200 px-8 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-300"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}
