import {getDentalSavedDocuments} from '@app/(apps)/dental/_actions/saved-document-actions'
import {getDentalFacilities} from '@app/(apps)/dental/_actions/facility-actions'
import {getDentalPatients} from '@app/(apps)/dental/_actions/patient-actions'
import {getUserClinicId} from '@app/(apps)/dental/lib/get-user-clinic'
import {toFacility, toPatient} from '@app/(apps)/dental/lib/types'
import {initServerComopnent} from 'src/non-common/serverSideFunction'
import BatchPrintClient from './BatchPrintClient'

export default async function Page(props: {searchParams: Promise<Record<string, string>>}) {
  const query = await props.searchParams
  const {session} = await initServerComopnent({query})
  const clinicId = (await getUserClinicId(session.id)) ?? 0

  const [rawDocuments, rawFacilities, rawPatients] = await Promise.all([
    getDentalSavedDocuments({dentalClinicId: clinicId}),
    getDentalFacilities({dentalClinicId: clinicId}),
    getDentalPatients({dentalClinicId: clinicId}),
  ])

  const facilities = rawFacilities.map(toFacility)
  const patients = rawPatients.map(toPatient)

  const documents = rawDocuments.map(d => ({
    id: d.id,
    patientId: d.dentalPatientId,
    patientName: d.DentalPatient ? `${d.DentalPatient.lastName} ${d.DentalPatient.firstName}` : '',
    facilityId: d.DentalExamination?.DentalVisitPlan?.DentalFacility?.id || 0,
    facilityName: d.DentalExamination?.DentalVisitPlan?.DentalFacility?.name || '',
    templateId: d.templateId,
    templateName: d.templateName,
    pdfUrl: d.pdfUrl || '',
    createdAt: d.createdAt.toISOString().split('T')[0],
    visitDate: d.DentalExamination?.DentalVisitPlan?.visitDate
      ? d.DentalExamination.DentalVisitPlan.visitDate.toISOString().split('T')[0]
      : '',
  }))

  return <BatchPrintClient documents={documents} facilities={facilities} patients={patients} />
}
