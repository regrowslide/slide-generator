'use client'

import {
  Star,
  Building2,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  MessageCircle,
  Wrench,
  X,
  Users,
} from 'lucide-react'

interface WorkPreviewProps {
  work: any
  onClose: () => void
}

export const WorkPreview = ({ work, onClose }: WorkPreviewProps) => {
  const StarRating = ({ rating, label }: { rating: number; label: string }) => (
    <div className="text-center">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="flex items-center justify-center gap-1 mt-1">
        <span className="text-2xl font-bold text-amber-600">{rating || '-'}</span>
        {rating && (
          <div className="flex">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${i < Math.ceil(rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )

  // 定量成果の最初の行を取得
  const mainResult = work.quantitativeResult?.split('\n')[0] || work.description?.substring(0, 50)

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[95vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* プレビューバッジ */}
        <div className="absolute top-4 left-4 z-10 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white">
          PREVIEW
        </div>

        {/* モーダルヘッダー */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-800 via-blue-900 to-blue-950 p-6 lg:p-8">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4 pt-6">
              <h2 className="text-2xl font-bold text-white lg:text-3xl">{work.title || '無題'}</h2>
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
            {work.jobCategory && (
              <span className="rounded-full bg-emerald-500/30 px-4 py-1.5 text-sm font-medium text-emerald-100">
                {work.jobCategory}
              </span>
            )}
            {work.systemCategory && (
              <span className="rounded-full bg-purple-500/30 px-4 py-1.5 text-sm font-medium text-purple-100">
                {work.systemCategory}
              </span>
            )}
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
                {work.allowShowClient && work.KaizenClient?.name
                  ? work.KaizenClient.name
                  : '非公開'}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <Users className="h-5 w-5" />
                <span className="text-sm">企業規模</span>
              </div>
              <div className="mt-2 text-base font-semibold text-gray-900">
                {work.companyScale || '-'}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <Clock className="h-5 w-5" />
                <span className="text-sm">プロジェクト期間</span>
              </div>
              <div className="mt-2 text-base font-semibold text-gray-900">
                {work.projectDuration || '-'}
              </div>
            </div>
          </div>

          {/* 成果ハイライト */}
          {(work.quantitativeResult || work.description) && (
            <div className="mb-8 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-2 border-green-200">
              <div className="flex items-center gap-3 text-lg font-bold text-green-700">
                <TrendingUp className="h-6 w-6" />
                導入効果
              </div>
              <p className="mt-4 whitespace-pre-line text-xl font-bold leading-relaxed text-green-800">
                {work.quantitativeResult || mainResult}
              </p>
            </div>
          )}

          {/* Before / After */}
          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-5">
              <div className="flex items-center gap-2 text-base font-bold text-red-700">
                <AlertCircle className="h-5 w-5" />
                導入前の課題
              </div>
              <p className="mt-3 text-base leading-relaxed text-gray-700">
                {work.beforeChallenge || '（未入力）'}
              </p>
            </div>
            <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-5">
              <div className="flex items-center gap-2 text-base font-bold text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                解決後の状態
              </div>
              <p className="mt-3 text-base leading-relaxed text-gray-700">
                {work.description || '（未入力）'}
              </p>
            </div>
          </div>

          {/* ソリューション詳細 */}
          {work.description && (
            <div className="mb-8">
              <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <Wrench className="h-5 w-5 text-blue-600" />
                提供ソリューション詳細
              </div>
              <p className="mt-3 text-base leading-relaxed text-gray-600">{work.description}</p>
            </div>
          )}

          {/* 技術的工夫 */}
          {work.points && (
            <div className="mb-8">
              <div className="text-lg font-bold text-gray-900">技術的工夫・ポイント</div>
              <p className="mt-3 text-base leading-relaxed text-gray-600">{work.points}</p>
            </div>
          )}

          {/* 顧客の声 */}
          {work.impression && (
            <div className="mb-8 rounded-2xl bg-amber-50 p-6 border-2 border-amber-200">
              <div className="flex items-center gap-2 text-lg font-bold text-amber-700">
                <MessageCircle className="h-5 w-5" />
                お客様の声
              </div>
              <p className="mt-4 text-lg italic leading-relaxed text-gray-700">
                「{work.impression}」
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
          {(work.dealPoint || work.toolPoint) && (
            <div className="flex items-center justify-center gap-12 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 p-6 border-2 border-amber-200">
              <StarRating rating={work.dealPoint} label="取引評価" />
              <div className="h-16 w-px bg-amber-300"></div>
              <StarRating rating={work.toolPoint} label="成果物評価" />
            </div>
          )}
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
