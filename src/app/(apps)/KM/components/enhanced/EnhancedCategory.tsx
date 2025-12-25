'use client'
import { Kaizen } from '@app/(apps)/KM/class/Kaizen'
import Loader from '@cm/components/utils/loader/Loader'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
import { R_Stack } from '@cm/components/styles/common-components/common-components'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Briefcase, Layers, Link as LinkIcon } from 'lucide-react'
import { arr__uniqArray } from '@cm/class/ArrHandler/array-utils/basic-operations'
import { superTrim } from '@cm/lib/methods/common'

const iconMap = {
  jobCategory: Briefcase,
  systemCategory: Layers,
  collaborationTool: LinkIcon,
}

export const EnhancedCategory = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const master = [
    {
      colId: 'jobCategory',
      title: '業界・職種を問わず',
      subtitle: '多様な業界での実績',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-500/30',
      bgColor: 'bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/30',
      tagBg: 'bg-emerald-100/80',
      tagText: 'text-emerald-800',
    },
    // {
    //   colId: 'systemCategory',
    //   title: 'スプレッドシート・WEBアプリなど、各種媒体に対応',
    //   subtitle: '幅広い開発実績',
    //   iconColor: 'text-purple-600',
    //   borderColor: 'border-purple-500/30',
    //   bgColor: 'bg-gradient-to-br from-purple-50/50 via-white to-purple-50/30',
    //   tagBg: 'bg-purple-100/80',
    //   tagText: 'text-purple-800',
    // },
    {
      colId: 'collaborationTool',
      title: '外部サービス・API連携も',
      subtitle: '連携サービス実績',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-500/30',
      bgColor: 'bg-gradient-to-br from-orange-50/50 via-white to-orange-50/30',
      tagBg: 'bg-orange-100/80',
      tagText: 'text-orange-800',
    },
  ]

  return (
    <div ref={ref}>
      <div className={`grid grid-cols-1  gap-6`}>
        {master.map((m, i) => {
          const Icon = iconMap[m.colId as keyof typeof iconMap]
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`group relative overflow-hidden rounded-2xl border-2 ${m.borderColor} ${m.bgColor} p-2 shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
            >
              {/* 左側装飾バー */}
              <div className={`absolute left-0 top-0 h-full w-1.5 ${m.iconColor.replace('text-', 'bg-')}`}></div>

              {/* ヘッダー */}
              <div className="mb-4 flex items-start gap-3 pl-2">
                <div
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${m.iconColor.replace('text-', 'bg-')}/10`}
                >
                  <Icon className={`h-6 w-6 ${m.iconColor}`} />
                </div>
                <div className="flex-1 pt-1">
                  <div className="mb-1 text-base font-bold text-gray-900">{m.title}</div>
                  <div className="text-xs text-gray-600">{m.subtitle}</div>
                </div>
              </div>

              {/* コンテンツ */}
              <div className="pl-2">
                <CategoryTags {...{ categoryColName: m.colId, tagBg: m.tagBg, tagText: m.tagText }} />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export const CategoryTags = (props: { categoryColName: string; tagBg?: string; tagText?: string }) => {
  const { categoryColName = 'jobCategory', tagBg = 'bg-gray-100', tagText = 'text-gray-700' } = props

  const { data: categories } = useDoStandardPrisma('kaizenWork', 'findMany', {
    select: {
      [categoryColName]: true,
    },
    distinct: [categoryColName as any],
    orderBy: [{ [categoryColName]: 'asc' }],
    // orderBy: [{sortOrder: 'asc'}],
  })

  if (!categories) {
    return <Loader />
  }

  const tags = arr__uniqArray(
    categories
      .map(c => c?.[categoryColName])
      .filter(Boolean)
      .map(c => Kaizen.KaizenWork.parseTags(c))
      .flat().map(c => superTrim(c))
  ).sort((a, b) => String(a).localeCompare(String(b)))

  return (
    <div>
      <div>
        <div className="max-w-full">
          <R_Stack className="pb-1 gap-3">
            {tags?.map((value, index) => {
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                >
                  <div
                    className={`rounded-lg ${tagBg} ${tagText} border border-current/20 px-2.5 py-1 text-xs font-medium shadow-sm transition-all hover:scale-105 hover:shadow-md`}
                  >
                    {String(value)}
                  </div>
                </motion.div>
              )
            })}
          </R_Stack>
        </div>
      </div>
    </div>
  )
}
