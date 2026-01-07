'use client'

import { Fields } from '@cm/class/Fields/Fields'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import BasicModal from '@cm/components/utils/modal/BasicModal'
import { Search } from 'lucide-react'
import { useWorksSearch } from '../hooks/useWorksSearch'

interface WorksSearchModalProps {
  works: any[]
  onFilterChange: (filteredWorks: any[]) => void
}

/**
 * Works検索モーダルコンポーネント
 */
export const WorksSearchModal: React.FC<WorksSearchModalProps> = ({ works, onFilterChange }) => {
  const { getUniqueValues, filterWorks } = useWorksSearch({ works })

  const columns = Fields.transposeColumns([
    { id: 'title', label: 'キーワード検索', type: 'text', form: {} },
    {
      id: 'jobCategory',
      label: '業界・業種',
      forSelect: {
        optionsOrOptionFetcher: getUniqueValues('jobCategory'),
      },
    },
    {
      id: 'systemCategory',
      label: 'ツール種類',
      forSelect: {
        optionsOrOptionFetcher: getUniqueValues('systemCategory'),
      },
    },
    {
      id: 'collaborationTool',
      label: '連携サービス',
      forSelect: {
        optionsOrOptionFetcher: getUniqueValues('collaborationTool'),
      },
    },
  ])

  const { BasicForm, latestFormData } = useBasicFormProps({
    columns,
    onFormItemBlur: props => {
      const { newlatestFormData } = props
      filterWorks(newlatestFormData)
      // フィルタリング結果を親コンポーネントに通知
      const filtered = works.filter(work => {
        const isHit = Object.keys(newlatestFormData).reduce((acc, key) => {
          const input = newlatestFormData[key]
          if (!input) return acc
          const data = String(work[key])
          const hit = data.includes(String(input))
          return acc && hit
        }, true)
        return isHit
      })
      onFilterChange(filtered)
    },
  })

  return (
    <BasicModal
      Trigger={
        <div className={`text-kaizen-cool-main absolute left-0 w-[60px] cursor-pointer`}>
          <Search className={`text-[20px]`} />
        </div>
      }
    >
      <BasicForm {...{ latestFormData, alignMode: 'row' }}></BasicForm>
    </BasicModal>
  )
}

