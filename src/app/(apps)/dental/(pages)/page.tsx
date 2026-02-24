import {getUserDentalClinic} from '@app/(apps)/dental/_actions/clinic-actions'
import {getDentalVisitPlans} from '@app/(apps)/dental/_actions/visit-plan-actions'
import {getDentalExaminations} from '@app/(apps)/dental/_actions/examination-actions'
import {toClinic, toVisitPlan, toExamination} from '@app/(apps)/dental/lib/types'
import {initServerComopnent} from 'src/non-common/serverSideFunction'
import DashboardClient from './components/DashboardClient'

export default async function Page(props: {searchParams: Promise<Record<string, string>>}) {
  const query = await props.searchParams
  const {session} = await initServerComopnent({query})

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const clinicRaw = await getUserDentalClinic(session.id)
  const clinicId = clinicRaw?.id ?? 0

  const [visitPlansRaw, examinationsRaw] = await Promise.all([
    getDentalVisitPlans({where: {visitDate: {gte: today}}, dentalClinicId: clinicId}),
    getDentalExaminations({dentalClinicId: clinicId}),
  ])

  const clinic = clinicRaw ? toClinic(clinicRaw) : null
  const visitPlans = visitPlansRaw.map(toVisitPlan)
  const examinations = examinationsRaw.map(toExamination)

  return <DashboardClient clinic={clinic} visitPlans={visitPlans} examinations={examinations} />
}
