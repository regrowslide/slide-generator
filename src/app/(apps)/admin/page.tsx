import { redirect } from 'next/navigation'
import { initServerComopnent } from 'src/non-common/serverSideFunction'
import AdminDashboardClient from './AdminDashboardClient'
import { isDev } from '@cm/lib/methods/common'

export default async function AdminPage(props: { searchParams: Promise<any> }) {
  const query = await props.searchParams
  const { session } = await initServerComopnent({ query })


  if (session?.role !== 'admin' && !isDev) {
    return <div>You are not authorized to access this page</div>
  }

  return (
    <div className="p-4">
      <AdminDashboardClient />
    </div>
  )
}
