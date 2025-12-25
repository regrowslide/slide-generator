'use client'

import { cl } from '@cm/lib/methods/common'
import { R_Stack } from '@cm/components/styles/common-components/common-components'
import { ImageLabel } from '@cm/components/styles/common-components/ImageLabel'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

export const Partners = ({ kaizenClient }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.05,
  })

  // アニメーション用にクライアントリストを複製（シームレスループのため）
  const duplicatedClients = [...kaizenClient, ...kaizenClient]

  return (
    <div ref={ref} className="relative">
      {/* ヘッダー統計 */}
      {/* <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="mb-6 text-center"
      >
        <div className="mx-auto inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 shadow-lg">
          <Building2 className="h-5 w-5 text-white" />
          <span className="text-lg font-bold text-white">
            {kaizenClient.length}
            <span className="ml-1 text-sm font-normal text-white/90">社との取引実績</span>
          </span>
        </div>
      </motion.div> */}

      {/* マーキー（横スクロール）コンテナ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-50 via-white to-slate-50 py-6"
      >
        {/* 左右のグラデーションオーバーレイ */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-white to-transparent" />

        {/* マーキーアニメーション */}
        <div className="flex animate-marquee hover:[animation-play-state:paused]">
          {duplicatedClients.map((p, index) => (
            <PartnerMarqueeItem key={`${p.id || index}-${index}`} p={p} index={index % kaizenClient.length} />
          ))}
        </div>
      </motion.div>

      {/* 補足メッセージ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="mt-4 text-center"
      >
        <p className="text-sm text-gray-500">業界・規模を問わず、様々なお客様の業務改善をサポートしております</p>
      </motion.div>

      {/* カスタムCSSアニメーション */}
      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  )
}

// マーキー用の個別アイテムコンポーネント
const PartnerMarqueeItem = ({ p, index }: { p: any; index: number }) => {
  const hasIcon = p?.iconUrl && p?.iconUrl !== ''
  const colors = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-emerald-500 to-emerald-600',
    'from-amber-500 to-amber-600',
    'from-rose-500 to-rose-600',
    'from-cyan-500 to-cyan-600',
  ]
  const colorClass = colors[index % colors.length]

  return (
    <div className="mx-3 flex-shrink-0">
      <div
        className={cl(
          'group flex min-w-[180px] items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg'
        )}
      >
        {/* ロゴ/アイコン */}
        {hasIcon ? (
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-50">
            <ImageLabel
              {...{
                style: { width: 40, height: 40, objectFit: 'contain' },
                src: p?.iconUrl,
              }}
            />
          </div>
        ) : (
          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${colorClass}`}>
            <span className="text-base font-bold text-white">{p?.name?.substring(0, 1) || '?'}</span>
          </div>
        )}

        {/* 企業名 */}
        <div className="flex flex-col overflow-hidden">
          {p?.organization && <span className="truncate text-[10px] text-gray-500">{p.organization}</span>}
          <span className="truncate text-sm font-semibold text-gray-800">{p?.name || '---'}</span>
        </div>
      </div>
    </div>
  )
}

export const PartnerBasicInfo = (props: { KaizenClient: any; showWebsite?: boolean }) => {
  const { KaizenClient, showWebsite = true } = props
  const { name, organization, website } = KaizenClient ?? {}
  return (
    <R_Stack className="gap-1.5 leading-tight">
      {organization && <div className="truncate text-xs font-medium ">{organization}</div>}
      <div className="flex items-baseline gap-1">
        {name && <span className="truncate text-sm font-bold ">{name}</span>}
        <div className="flex-shrink-0 text-xs ">様</div>
      </div>
      {showWebsite && website && (
        <Link className="truncate text-xs text-blue-600 hover:underline" target="_blank" href={website}>
          {website}
        </Link>
      )}
    </R_Stack>
  )
}

export const Partner = ({ p, index }) => {
  const hasIcon = p?.iconUrl && p?.iconUrl !== ''

  return (
    <div
      className={cl(
        'group relative h-full overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:border-blue-300 hover:shadow-md'
      )}
      key={index}
    >
      {/* 左側装飾 */}
      <div
        className={cl(
          'absolute left-0 top-0 h-full w-1',
          index % 3 === 0 ? 'bg-blue-600' : index % 3 === 1 ? 'bg-purple-600' : 'bg-emerald-600'
        )}
      ></div>

      <div className="flex items-center gap-3 pl-1">
        {/* アイコン */}
        {hasIcon ? (
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
            <ImageLabel
              {...{
                style: { width: 48, height: 48, objectFit: 'cover' },
                src: p?.iconUrl,
              }}
            />
          </div>
        ) : (
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-blue-200">
            <span className="text-lg font-bold text-blue-700">{p?.name?.substring(0, 1) || '?'}</span>
          </div>
        )}

        {/* 情報 */}
        <div className="flex-1 overflow-hidden">
          <PartnerBasicInfo {...{ KaizenClient: p, showWebsite: false }} />
        </div>
      </div>

      {/* Webサイトリンク（ホバー時表示） */}
      {p?.website && (
        <div className="mt-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Link
            className="block truncate text-xs text-blue-600 hover:text-blue-800 hover:underline"
            target="_blank"
            href={p.website}
          >
            {p.website}
          </Link>
        </div>
      )}
    </div>
  )
}
