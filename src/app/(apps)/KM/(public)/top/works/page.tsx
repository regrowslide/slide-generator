import { Works } from '@app/(apps)/KM/components/Works'

import prisma from 'src/lib/prisma'
import { MyContainer } from '@cm/components/styles/common-components/common-components'

const WorkPage = async () => {
  const works = await prisma.kaizenWork.findMany({
    include: {
      KaizenWorkImage: {},
      KaizenClient: {},
    },
    orderBy: [
      { sortOrder: 'asc' },
      { date: 'desc' },
    ],
  })

  return (
    <MyContainer>
      <Works {...{ works }} />
    </MyContainer>
  )
}

export default WorkPage
