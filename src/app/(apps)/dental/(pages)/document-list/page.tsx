import {getDentalSavedDocuments} from '@app/(apps)/dental/_actions/saved-document-actions'
import {getDentalFacilities} from '@app/(apps)/dental/_actions/facility-actions'
import {getUserClinicId} from '@app/(apps)/dental/lib/get-user-clinic'
import {toFacility} from '@app/(apps)/dental/lib/types'
import {initServerComopnent} from 'src/non-common/serverSideFunction'
import DocumentListClient from './DocumentListClient'

export default async function Page(props: {searchParams: Promise<Record<string, string>>}) {
  const query = await props.searchParams
  const {session} = await initServerComopnent({query})
  const clinicId = (await getUserClinicId(session.id)) ?? 0

  const [rawDocuments, rawFacilities] = await Promise.all([
    getDentalSavedDocuments({dentalClinicId: clinicId}),
    getDentalFacilities({dentalClinicId: clinicId}),
  ])

  const facilities = rawFacilities.map(toFacility)

  const documents = rawDocuments.map(d => ({
    id: d.id,
    patientId: d.dentalPatientId,
    patientName: d.DentalPatient ? `${d.DentalPatient.lastName} ${d.DentalPatient.firstName}` : '',
    facilityId: d.DentalExamination?.DentalVisitPlan?.DentalFacility?.id || 0,
    facilityName: d.DentalExamination?.DentalVisitPlan?.DentalFacility?.name || '',
    templateId: d.templateId,
    templateName: d.templateName,
    pdfUrl: d.pdfUrl || '',
    version: d.version,
    createdAt: d.createdAt.toISOString(),
    downloadedAt: d.downloadedAt?.toISOString() ?? null,
    visitDate: d.DentalExamination?.DentalVisitPlan?.visitDate
      ? d.DentalExamination.DentalVisitPlan.visitDate.toISOString().split('T')[0]
      : '',
  }))

  return <DocumentListClient documents={documents} facilities={facilities} />
}
