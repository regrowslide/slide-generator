'use client'

import { C_Stack, MyContainer, Padding } from '@cm/components/styles/common-components/common-components'
import { WorkCard } from '@app/(apps)/KM/(public)/top/WorkCard'
import { Fields } from '@cm/class/Fields/Fields'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import { useState } from 'react'
import BasicModal from '@cm/components/utils/modal/BasicModal'
import { Search, Filter, Gift, TreePine, Star } from 'lucide-react'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Button } from '@cm/components/styles/common-components/Button'

export const ChristmasWorks = ({ works }: { works: any[] }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.05,
  })

  const publicWorks = works.filter(row => row.isPublic)
  const [workState, setWorkState] = useState<any>(publicWorks)

  const getUniqueValues = ({ works, key }: { works: any[]; key: string }) => {
    const options = works
      .reduce((acc, work) => {
        const dataKey = work[key]
        const isExist = acc.includes(dataKey)
        if (!isExist) acc.push(dataKey)
        return acc
      }, [])
      .filter(val => val)
    return options
  }

  const Searcher = () => {
    const columns = Fields.transposeColumns([
      { id: 'title', label: 'キーワード検索', type: 'text', form: {} },
      {
        id: 'jobCategory',
        label: '業界・業種',
        forSelect: {
          optionsOrOptionFetcher: getUniqueValues({ works: publicWorks, key: 'jobCategory' }),
        },
      },
      {
        id: 'systemCategory',
        label: 'ツール種類',
        forSelect: {
          optionsOrOptionFetcher: getUniqueValues({ works: publicWorks, key: 'systemCategory' }),
        },
      },
      {
        id: 'collaborationTool',
        label: '連携サービス',
        forSelect: {
          optionsOrOptionFetcher: getUniqueValues({ works: publicWorks, key: 'collaborationTool' }),
        },
      },
    ])

    const { BasicForm, latestFormData } = useBasicFormProps({
      columns,
      onFormItemBlur: props => {
        const { newlatestFormData } = props

        const newWorkState = publicWorks.filter(work => {
          const isHit = Object.keys(newlatestFormData).reduce((acc, key) => {
            const input = newlatestFormData[key]
            const data = String(work[key])
            const hit = data.includes(String(input)) || !input
            return acc && hit
          }, true)

          return isHit
        })

        setWorkState(newWorkState)
      },
    })

    return (
      <BasicModal
        Trigger={
          <Button
            color="red"
            className="gap-2 bg-gradient-to-r from-red-600 to-green-600 shadow-lg transition-all hover:scale-105 hover:shadow-xl border-2 border-amber-300"
          >
            <Gift className="h-5 w-5 text-amber-300" />
            <span className="text-white">実績を絞り込む</span>
          </Button>
        }
      >
        <div className="p-6 bg-gradient-to-br from-red-50 to-green-50">
          <div className="mb-6 flex items-center gap-3">
            <Search className="h-6 w-6 text-red-600" />
            <h3 className="text-2xl font-bold text-gray-900">実績検索</h3>
          </div>
          <BasicForm {...{ latestFormData, alignMode: 'row' }}></BasicForm>
        </div>
      </BasicModal>
    )
  }

  return (
    <MyContainer>
      <Padding className="relative">
        <div ref={ref} className="py-8">
          {/* ヘッダー - クリスマステーマ */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-100 to-green-100 px-4 py-2 border border-red-200">
              <TreePine className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold uppercase tracking-wide text-red-700">Works</span>
              <Star className="h-4 w-4 text-amber-500" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
              <span className="bg-gradient-to-r from-red-600 to-green-600 bg-clip-text text-transparent">
                実績・制作物
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-base text-gray-600 sm:text-lg">
              様々な業界・業種で業務改善を実現してきました
            </p>
          </div>

          {/* 実績カードグリッド */}
          <C_Stack className="gap-16 mx-auto">
            {workState.filter(work => work.description).length > 0 ? (
              <div className="items-start justify-center gap-6 sm:gap-8 lg:gap-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-8">
                {workState
                  .filter(work => work.description)
                  .map((work, index) => (
                    <div
                      key={work.id || index}
                      className="w-full"
                    >
                      <div className="h-full transform transition-all duration-300 hover:scale-[1.02] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl border-2 border-transparent hover:border-red-200">
                        <WorkCard {...{ work, works }} />
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl bg-gradient-to-br from-red-50 to-green-50 p-12 text-center border border-red-100"
              >
                <Gift className="mx-auto mb-4 h-12 w-12 text-red-400" />
                <p className="text-lg text-gray-600">該当する実績が見つかりませんでした</p>
                <p className="mt-2 text-sm text-gray-500">別の条件で検索してみてください</p>
              </motion.div>
            )}
          </C_Stack>

          {/* 表示件数 - クリスマステーマ */}
          {workState.filter(work => work.description).length > 0 && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-100 to-green-100 px-6 py-3 border border-amber-200">
                <Gift className="h-5 w-5 text-red-600" />
                <span className="text-base font-semibold text-red-700">
                  {workState.filter(work => work.description).length}件の実績を表示中
                </span>
                <Star className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          )}
        </div>
      </Padding>
    </MyContainer>
  )
}

