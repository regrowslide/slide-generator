'use client'

import { C_Stack, MyContainer, Padding, R_Stack } from '@cm/components/styles/common-components/common-components'
import { WorkCard } from '@app/(apps)/KM/(public)/top/WorkCard'
import { Fields } from '@cm/class/Fields/Fields'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import { useState } from 'react'
import BasicModal from '@cm/components/utils/modal/BasicModal'
import { Search } from 'lucide-react'

export const Works = ({ works }) => {
  works = works.filter(row => row.isPublic)
  const getUniqueValues = ({ works, key }) => {
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

  const [workState, setworkState] = useState<any>(works)
  const Seracher = () => {
    const columns = Fields.transposeColumns([
      { id: 'title', label: 'キーワード検索', type: 'text', form: {} },
      {
        id: 'jobCategory',
        label: '業界・業種',
        forSelect: {
          optionsOrOptionFetcher: getUniqueValues({ works, key: 'jobCategory' }),
        },
      },
      {
        id: 'systemCategory',
        label: 'ツール種類',
        forSelect: {
          optionsOrOptionFetcher: getUniqueValues({ works, key: 'systemCategory' }),
        },
      },
      {
        id: 'collaborationTool',
        label: '連携サービス',
        forSelect: {
          optionsOrOptionFetcher: getUniqueValues({ works, key: 'collaborationTool' }),
        },
      },
    ])
    const { BasicForm, latestFormData } = useBasicFormProps({
      columns,
      onFormItemBlur: props => {
        const { newlatestFormData } = props

        const newWorkState = workState.filter(work => {
          const isHit = Object.keys(newlatestFormData).reduce((acc, key) => {
            const input = newlatestFormData[key]

            const data = String(work[key])
            const hit = data.includes(String(input)) || !input

            return acc && hit
          }, true)

          return isHit
        })

        setworkState(newWorkState)
      },
    })
    return (
      <BasicModal
        Trigger={
          <div className={`text-kaizen-cool-main  absolute left-0 w-[60px] cursor-pointer`}>
            <Search className={` text-[20px] `} />
          </div>
          // <Button className={`  absolute right-0 top-0`} color="gray">
          //   実績検索
          // </Button>
        }
      >
        <BasicForm {...{ latestFormData, alignMode: 'row' }}></BasicForm>
      </BasicModal>
    )
  }

  return (
    <MyContainer>
      <Padding className={`relative `}>
        <div
          className={`  sticky  top-0 w-full
        pt-16`}
        >
          <Seracher />
        </div>

        <C_Stack className={`gap-1`}>
          <R_Stack className={`items-start justify-around gap-[100px]  `}>
            {workState
              .filter(work => work.description)
              .map((work, index) => {
                return <WorkCard key={index} {...{ work, }} />
              })}
          </R_Stack>
        </C_Stack>
      </Padding>
    </MyContainer>
  )
}
