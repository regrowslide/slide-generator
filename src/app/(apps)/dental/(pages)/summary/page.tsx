import {getDentalVisitPlans} from '@app/(apps)/dental/_actions/visit-plan-actions'
import {getDentalFacilities} from '@app/(apps)/dental/_actions/facility-actions'
import {getDentalPatients} from '@app/(apps)/dental/_actions/patient-actions'
import {getDentalSavedDocuments} from '@app/(apps)/dental/_actions/saved-document-actions'
import {getUserClinicId} from '@app/(apps)/dental/lib/get-user-clinic'
import {toFacility, toPatient} from '@app/(apps)/dental/lib/types'
import {initServerComopnent} from 'src/non-common/serverSideFunction'
import SummaryClient from './SummaryClient'

export default async function Page(props: {searchParams: Promise<Record<string, string>>}) {
  const query = await props.searchParams
  const {session} = await initServerComopnent({query})
  const clinicId = (await getUserClinicId(session.id)) ?? 0

  const [rawVisitPlans, rawFacilities, rawPatients, rawDocuments] = await Promise.all([
    getDentalVisitPlans({dentalClinicId: clinicId}),
    getDentalFacilities({dentalClinicId: clinicId}),
    getDentalPatients({dentalClinicId: clinicId}),
    getDentalSavedDocuments({dentalClinicId: clinicId}),
  ])

  const facilities = rawFacilities.map(toFacility)
  const patients = rawPatients.map(toPatient)

  const visitPlans = rawVisitPlans.map(v => ({
    id: v.id,
    facilityId: v.dentalFacilityId,
    facilityName: v.DentalFacility?.name || '',
    visitDate: v.visitDate.toISOString().split('T')[0],
    status: v.status,
    examinations: (v.DentalExamination || []).map(e => ({
      id: e.id,
      patientId: e.dentalPatientId,
      patientName: (() => {
        const p = e.DentalPatient
        return p ? `${p.lastName} ${p.firstName}` : ''
      })(),
      status: e.status,
      procedureItems: (e.procedureItems as Record<string, unknown>) || {},
    })),
  }))

  const documents = rawDocuments.map(d => ({
    id: d.id,
    patientId: d.dentalPatientId,
    templateName: d.templateName,
    createdAt: d.createdAt.toISOString().split('T')[0],
  }))

  return <SummaryClient visitPlans={visitPlans} facilities={facilities} patients={patients} documents={documents} />
}
