import { getUserDentalClinic } from '@app/(apps)/dental/_actions/clinic-actions'
import { getDentalStaffList } from '@app/(apps)/dental/_actions/staff-actions'
import { toClinic } from '@app/(apps)/dental/lib/types'
import { initServerComopnent } from 'src/non-common/serverSideFunction'
import ClinicSettingsClient from './ClinicSettingsClient'

export default async function Page(props: { searchParams: Promise<Record<string, string>> }) {
  const query = await props.searchParams
  const { session } = await initServerComopnent({ query })

  if (!session.dentalClinicId) {
    return <div>クリニックが見つかりません</div>
  }


  const clinicRaw = await getUserDentalClinic(session.id)
  const clinic = clinicRaw ? toClinic(clinicRaw) : null

  // スタッフ一覧を取得（認証情報セクション用）
  const staffRaw = await getDentalStaffList({ dentalClinicId: session.dentalClinicId })
  const staff = staffRaw.map(s => ({
    id: s.id,
    name: s.name,
    email: s.email,
    type: s.type,
  }))

  const isDev = process.env.NODE_ENV === 'development'

  return <div className='p-4'><ClinicSettingsClient clinic={clinic} staff={staff} isDev={isDev} /></div>
}
