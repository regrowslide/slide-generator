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
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Wrench,
} from 'lucide-react'
import { WorkSampleData, sampleWorks } from './sampleData'

export const WorksCard = () => {
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
          <WorkCardItem key={work.id} work={work} />
        ))}
      </div>

      {/* 件数表示 */}
      <div className="text-center">
        <span className="inline-block rounded-full bg-blue-100 px-6 py-2 text-sm font-semibold text-blue-700">
          {sampleWorks.length}件の実績
        </span>
      </div>
    </div>
  )
}

const WorkCardItem = ({ work }: { work: WorkSampleData }) => {
  const [isExpanded, setIsExpanded] = useState(false)

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

      {/* メインコンテンツ - Before/After */}
      <div className="p-5">
        {/* 成果ハイライト */}
        <div className="mb-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
            <TrendingUp className="h-5 w-5" />
            導入効果
          </div>
          <div className="mt-2 text-lg font-bold text-green-800">{mainResult}</div>
        </div>

        {/* Before → After */}
        <div className="space-y-3">
          {/* Before */}
          <div className="rounded-lg border border-red-200 bg-red-50/50 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-red-600">
              <AlertCircle className="h-4 w-4" />
              導入前の課題
            </div>
            <p className={`mt-1 text-sm text-gray-700 ${!isExpanded ? 'line-clamp-2' : ''}`}>
              {work.beforeChallenge}
            </p>
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
            <p className={`mt-1 whitespace-pre-line text-sm font-medium text-gray-700 ${!isExpanded ? 'line-clamp-3' : ''}`}>
              {work.quantitativeResult}
            </p>
          </div>
        </div>

        {/* 展開部分 */}
        {isExpanded && (
          <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">
            {/* ソリューション詳細 */}
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Wrench className="h-4 w-4 text-blue-600" />
                提供ソリューション
              </div>
              <p className="mt-2 text-sm text-gray-600">{work.description}</p>
            </div>

            {/* 技術的工夫 */}
            {work.points && (
              <div>
                <div className="text-sm font-semibold text-gray-700">技術的工夫</div>
                <p className="mt-1 text-sm text-gray-600">{work.points}</p>
              </div>
            )}

            {/* 顧客の声 */}
            {work.customerVoice && (
              <div className="rounded-lg bg-amber-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
                  <MessageCircle className="h-4 w-4" />
                  お客様の声
                </div>
                <p className="mt-2 text-sm italic text-gray-700">「{work.customerVoice}」</p>
                {work.reply && (
                  <div className="mt-3 border-t border-amber-200 pt-3">
                    <div className="text-xs font-medium text-amber-600">改善マニアより</div>
                    <p className="mt-1 text-xs text-gray-600">{work.reply}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 展開トグル */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 flex w-full items-center justify-center gap-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          {isExpanded ? (
            <>
              閉じる
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              詳細を見る
              <ChevronDown className="h-4 w-4" />
            </>
          )}
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
