'use client'

import { useState, useMemo } from 'react'
import { C_Stack, MyContainer, Padding, R_Stack } from '@cm/components/styles/common-components/common-components'
import { WorkCard } from '@app/(apps)/KM/(public)/top/WorkCard'
import { WorksSearchModal } from './WorksSearchModal'

interface WorksProps {
  works: any[]
}

export const Works = ({ works }: WorksProps) => {
  const publicWorks = useMemo(() => works.filter(row => row.isPublic), [works])
  const [workState, setWorkState] = useState<any[]>(publicWorks)

  const handleFilterChange = (filteredWorks: any[]) => {
    setWorkState(filteredWorks)
  }

  return (
    <MyContainer>
      <Padding className="relative">
        <div className="sticky top-0 w-full pt-16">
          <WorksSearchModal works={publicWorks} onFilterChange={handleFilterChange} />
        </div>

        <C_Stack className="gap-1">
          <R_Stack className="items-start justify-around gap-[100px]">
            {workState
              .filter(work => work.description)
              .map((work, index) => {
                return <WorkCard key={index} work={work} />
              })}
          </R_Stack>
        </C_Stack>
      </Padding>
    </MyContainer>
  )
}
