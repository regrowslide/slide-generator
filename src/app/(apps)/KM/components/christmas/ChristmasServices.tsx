'use client'

import { MyContainer } from '@cm/components/styles/common-components/common-components'
import { getSecondLayerMenus } from '@app/(apps)/KM/components/common'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Code, GraduationCap, Users2, Snowflake, Star } from 'lucide-react'

const iconMap = {
  manager: Code,
  collaborationWithUniversity: Users2,
  coach: GraduationCap,
}

export const ChristmasServices = ({ kaizenClient }: { kaizenClient: any[] }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const menus = getSecondLayerMenus({ kaizenClient })
  const wrapperClas = ' w-screen-lg max-w-[90vw]'

  return (
    <MyContainer className={`p-2 mx-auto ${wrapperClas}`}>
      <div ref={ref} className="py-4">
        {menus.map((menu, index) => {
          const { value, label, id } = menu
          const Icon = iconMap[id as keyof typeof iconMap] || Code
          const isEven = index % 2 === 0

          return (
            <motion.div
              key={id}
              id={id}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="mb-8 last:mb-0"
            >
              <div>
                <div
                  className={`overflow-hidden rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl relative ${
                    isEven
                      ? 'bg-gradient-to-br from-red-50 via-white to-green-50'
                      : 'bg-gradient-to-br from-green-50 via-white to-red-50'
                  }`}
                >
                  {/* クリスマス装飾 - 角の雪の結晶 */}
                  <div className="absolute top-2 right-2 text-red-200 opacity-50">
                    <Snowflake size={24} />
                  </div>
                  <div className="absolute bottom-2 left-2 text-green-200 opacity-50">
                    <Star size={20} />
                  </div>

                  {/* ヘッダー部分 - クリスマスカラー */}
                  <div
                    className={`p-2 sm:p-5 ${
                      isEven
                        ? 'bg-gradient-to-r from-red-600 via-red-700 to-red-800'
                        : 'bg-gradient-to-r from-green-600 via-green-700 to-green-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* アイコン - クリスマス風 */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={inView ? { scale: 1 } : {}}
                        transition={{ duration: 0.5, delay: index * 0.2 + 0.3, type: 'spring' }}
                        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm sm:h-14 sm:w-14 border-2 border-amber-300/50"
                      >
                        <Icon className="h-6 w-6 text-white sm:h-7 sm:w-7" />
                      </motion.div>

                      {/* タイトル */}
                      <div>
                        <motion.h3
                          initial={{ opacity: 0, x: -20 }}
                          animate={inView ? { opacity: 1, x: 0 } : {}}
                          transition={{ duration: 0.6, delay: index * 0.2 + 0.4 }}
                          className="text-lg font-bold text-white sm:text-xl lg:text-2xl"
                        >
                          {label}
                        </motion.h3>
                      </div>
                    </div>
                  </div>

                  {/* コンテンツ部分 */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.6, delay: index * 0.2 + 0.5 }}
                    className="p-2 sm:p-5"
                  >
                    <div className="prose prose-base max-w-none">{value}</div>
                  </motion.div>

                  {/* 装飾ライン - クリスマスカラー（赤と緑のストライプ風） */}
                  <div className="h-2 w-full relative overflow-hidden">
                    <div
                      className={`h-full w-full ${
                        isEven
                          ? 'bg-gradient-to-r from-red-600 via-amber-400 to-green-600'
                          : 'bg-gradient-to-r from-green-600 via-amber-400 to-red-600'
                      }`}
                    ></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </MyContainer>
  )
}

