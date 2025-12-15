'use client'

import { C_Stack, MyContainer, Padding } from '@cm/components/styles/common-components/common-components'
import { WorkCard } from '@app/(apps)/KM/(public)/top/WorkCard'
import { Fields } from '@cm/class/Fields/Fields'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import { useState } from 'react'
import BasicModal from '@cm/components/utils/modal/BasicModal'
import { Search, Filter } from 'lucide-react'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Button } from '@cm/components/styles/common-components/Button'

export const EnhancedWorks = ({ works }: { works: any[] }) => {
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
            color="blue"
            className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            <Filter className="h-5 w-5" />
            <span>実績を絞り込む</span>
          </Button>
        }
      >
        <div className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <Search className="h-6 w-6 text-blue-600" />
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
          {/* ヘッダー */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-block rounded-full bg-blue-100 px-4 py-2">
              <span className="text-sm font-semibold uppercase tracking-wide text-blue-700">Works</span>
            </div>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">実績・制作物</h2>
            <p className="mx-auto max-w-2xl text-base text-gray-600 sm:text-lg">様々な業界・業種で業務改善を実現してきました</p>
          </div>

          {/* 実績カードグリッド */}
          <C_Stack className="gap-16  mx-auto">
            {workState.filter(work => work.description).length > 0 ? (
              <div className="items-start justify-center gap-6 sm:gap-8 lg:gap-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-8">
                {workState
                  .filter(work => work.description)
                  .map((work, index) => (
                    <div
                      key={work.id || index}
                      // initial={{opacity: 0, scale: 0.9}}
                      // animate={inView ? {opacity: 1, scale: 1} : {}}
                      // transition={{duration: 0.6, delay: 0.1 * (index % 6)}}
                      className="w-full "
                    >
                      <div className="h-full transform transition-all duration-300 ">
                        <WorkCard {...{ work, works }} />
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-gray-50 p-12 text-center">
                <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="text-lg text-gray-600">該当する実績が見つかりませんでした</p>
                <p className="mt-2 text-sm text-gray-500">別の条件で検索してみてください</p>
              </motion.div>
            )}
          </C_Stack>

          {/* 表示件数 */}
          {workState.filter(work => work.description).length > 0 && (
            <div
              // initial={{opacity: 0}}
              // animate={inView ? {opacity: 1} : {}}
              // transition={{duration: 0.8, delay: 0.6}}
              className="mt-8 text-center"
            >
              <div className="inline-block rounded-full bg-blue-100 px-6 py-3">
                <span className="text-base font-semibold text-blue-700">
                  {workState.filter(work => work.description).length}件の実績を表示中
                </span>
              </div>
            </div>
          )}
        </div>
      </Padding>
    </MyContainer>
  )
}
