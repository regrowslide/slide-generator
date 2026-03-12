import {redirect} from 'next/navigation'
import {initServerComopnent} from 'src/non-common/serverSideFunction'
import AdminDashboardClient from './AdminDashboardClient'

export default async function AdminPage(props: {searchParams: Promise<any>}) {
  const query = await props.searchParams
  const {session} = await initServerComopnent({query})

  if (session?.role !== 'admin') redirect('/login')

  return (
    <div className="p-4">
      <AdminDashboardClient />
    </div>
  )
}
