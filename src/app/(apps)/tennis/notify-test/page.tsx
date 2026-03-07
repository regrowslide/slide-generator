import {initServerComopnent} from 'src/non-common/serverSideFunction'
import Redirector from '@cm/components/utils/Redirector'
import NotifyTestClient from './NotifyTestClient'

export default async function NotifyTestPage(props: any) {
  const query = await props.searchParams
  const {session} = await initServerComopnent({query})

  if (!session?.id) {
    return <Redirector {...{redirectPath: '/tennis/login'}} />
  }

  return <NotifyTestClient userId={session.id} userName={session.name} />
}
