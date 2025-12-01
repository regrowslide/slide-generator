import { getDriveInputPageData } from '@app/(apps)/tbm/(pages)/driver/driveInput/driveInput-page-type'
import DriveInputCC from '@app/(apps)/tbm/(pages)/driver/driveInput/DriveInputCC'
import { getMidnight } from '@cm/class/Days/date-utils/calculations'
import { C_Stack, FitMargin, Padding } from '@cm/components/styles/common-components/common-components'
import NewDateSwitcher from '@cm/components/utils/dates/DateSwitcher/NewDateSwitcher'
import Redirector from '@cm/components/utils/Redirector'
import { dateSwitcherTemplate } from '@cm/lib/methods/redirect-method'
import prisma from 'src/lib/prisma'
import { initServerComopnent } from 'src/non-common/serverSideFunction'

export default async function Page(props) {
  const query = await props.searchParams

  const params = await props.params
  const { session, scopes } = await initServerComopnent({ query })

  const { redirectPath, whereQuery } = await dateSwitcherTemplate({
    query,
    defaultWhere: { from: getMidnight() },
  })
  if (redirectPath) return <Redirector {...{ redirectPath }} />

  const { tbmDriveInputUserId } = scopes.getTbmScopes()
  const user = await prisma.user.findUnique({ where: { id: tbmDriveInputUserId } })

  if (!user) {
    return <div>ユーザーが見つかりません</div>
  }

  const driveScheduleList: any = await getDriveInputPageData({
    user,
    whereQuery,
  })

  return (
    <Padding>
      <FitMargin>
        <C_Stack className={` h-full justify-between gap-6`}>
          <NewDateSwitcher {...{}} />

          {/* 入力欄 */}
          <DriveInputCC {...{ driveScheduleList }} />
        </C_Stack>
      </FitMargin>
    </Padding>
  )
}
