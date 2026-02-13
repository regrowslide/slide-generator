import { initServerComopnent } from 'src/non-common/serverSideFunction'
import { getPublishedYamanokaiEvents } from '@app/(apps)/yamanokai/_actions/event-actions'
import { getApplicationsByUserId } from '@app/(apps)/yamanokai/_actions/attendance-actions'
import { FitMargin } from '@cm/components/styles/common-components/common-components'
import EventsClient from './EventsClient'

export default async function Page(props) {
  const query = await props.searchParams
  const { session } = await initServerComopnent({ query })

  const [events, applications] = await Promise.all([
    getPublishedYamanokaiEvents(),
    getApplicationsByUserId(session.id),
  ])

  return (
    <FitMargin className='p-2 min-w-[80vw]'>
      <EventsClient {...{ events, applications, userId: session.id }} />
    </FitMargin>
  )
}
