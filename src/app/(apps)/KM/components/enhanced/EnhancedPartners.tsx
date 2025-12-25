'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Building2, GraduationCap, Users } from 'lucide-react'
import { cn } from '@cm/shadcn/lib/utils'
import { ImageLabel } from '@cm/components/styles/common-components/ImageLabel'

export const EnhancedPartners = ({ kaizenClient }: { kaizenClient: any[] }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  // 顧客を種類別に分類
  const categories = [
    {
      icon: Building2,
      title: '企業様',
      color: 'from-blue-600 to-blue-800',
      bgColor: 'from-blue-50/50 to-blue-100/30',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-700',
      clients: kaizenClient.filter(c => c.category === 'company' || !c.category),
    },
    {
      icon: GraduationCap,
      title: '大学・研究機関',
      color: 'from-purple-600 to-purple-800',
      bgColor: 'from-purple-50/50 to-purple-100/30',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-700',
      clients: kaizenClient.filter(c => c.category === 'university'),
    },
    {
      icon: Users,
      title: '個人事業主様',
      color: 'from-amber-600 to-amber-800',
      bgColor: 'from-amber-50/50 to-amber-100/30',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-700',
      clients: kaizenClient.filter(c => c.category === 'individual'),
    },
  ].filter(cat => cat.clients.length > 0) // クライアントがいるカテゴリーのみ表示


  // アニメーション用にクライアントリストを複製（シームレスループのため）
  const duplicatedClients = [...kaizenClient, ...kaizenClient]

  return (
    <div ref={ref} className="space-y-6">
      {/* ヘッダー統計 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="mb-6 text-center"
      >

      </motion.div>

      {/* カテゴリー別表示 */}


      {/* マーキー（横スクロール）コンテナ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-50 via-white to-slate-50 py-6"
      >
        {/* 左右のグラデーションオーバーレイ */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-slate-50 to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-slate-50 to-transparent" />

        {/* マーキーアニメーション - framer-motion使用 */}
        <motion.div
          className="flex w-max"
          animate={{
            x: ['0%', '-50%']
          }}
          transition={{
            x: {
              duration: 70,
              repeat: Infinity,
              ease: 'linear',
            }
          }}
        >
          {duplicatedClients.map((p, index) => (
            <PartnerMarqueeItem key={`${p.id || index}-${index}`} p={p} index={index % kaizenClient.length} />
          ))}
        </motion.div>
      </motion.div>

      {/* 補足メッセージ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="mt-6 text-center"
      >
        <p className="text-sm text-gray-600">業界・規模を問わず、様々なお客様の業務改善をサポートしております</p>
      </motion.div>
    </div>
  )
}


// マーキー用の個別アイテムコンポーネント
const PartnerMarqueeItem = ({ p, index }: { p: any; index: number }) => {
  const hasIcon = p?.iconUrl && p?.iconUrl !== ''
  const colors = [
    'from-blue-400 to-blue-600',
    'from-purple-400 to-purple-600',
    'from-emerald-400 to-emerald-600',
    'from-amber-400 to-amber-600',
    'from-rose-400 to-rose-600',
    'from-cyan-400 to-cyan-600',
  ]
  const colorClass = colors[index % colors.length]

  return (
    <div className="mx-2 flex-shrink-0">
      <div
        className={cn(
          'group flex min-w-[180px] items-center gap-3 rounded-xl border border-gray-200 bg-white px-2 py-1 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg'
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
          <div>
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${colorClass}`}>
              <span className="text-base font-bold text-white">{p?.name?.substring(0, 1) || '?'}</span>
            </div>
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
