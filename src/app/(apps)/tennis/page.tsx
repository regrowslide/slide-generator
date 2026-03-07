const cheerio = require('cheerio')

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@app/api/auth/[...nextauth]/constants/authOptions'
import prisma from 'src/lib/prisma'
import { getCourts } from './_actions/court-actions'
import { getEventsByRange } from './_actions/event-actions'
import { getTennisMembers } from './_actions/member-actions'
import TennisApp from './components/TennisApp'
import { initServerComopnent } from 'src/non-common/serverSideFunction'
import Redirector from '@cm/components/utils/Redirector'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { SCHEDULE_PAGE_OPTIONS } from '@app/(apps)/tennis/lib/constants'


export default async function TennisTopPage(props) {
  const query = await props.searchParams

  const { session, } = await initServerComopnent({ query })



  if (!session?.id) {
    return <Redirector {...{ redirectPath: '/tennis/login' }} />
  }



  // 初期表示期間: 当日〜2ヶ月先
  const now = new Date()
  const initialFrom = formatDate(now, 'YYYY-MM-DD') as string
  const toDate = new Date(now.getFullYear(), now.getMonth() + 2, now.getDate())
  const initialTo = formatDate(toDate, 'YYYY-MM-DD') as string

  const [courts, events, members] = await Promise.all([
    getCourts(),
    getEventsByRange(initialFrom, initialTo),
    getTennisMembers(),
  ])

  // let search = true
  // events.forEach(async e => {
  //   e.TennisEventCourt.forEach(async ec => {
  //     if (ec.TennisCourt.schedulePageKey) {
  //       const schedulePage = SCHEDULE_PAGE_OPTIONS.find((o) => o.key === ec.TennisCourt.schedulePageKey)
  //       if (search && schedulePage) {
  //         const html = await fetch(schedulePage.getSchedulePageUrl(formatDate(e.date, 'YYYY-MM-DD') as string)).then(res => res.text())
  //         const $ = await cheerio.load(html)

  //         const table = $('.AvailabilityFrames_gridTable')



  //         search = false
  //       }
  //     }
  //   })
  // })
  return (
    <TennisApp
      initialEvents={events}
      initialCourts={courts}
      members={members}
      userId={session.id}
      userName={session.name}
      userAvatar={session.avatar}
      initialFrom={initialFrom}
      initialTo={initialTo}
    />
  )
}
