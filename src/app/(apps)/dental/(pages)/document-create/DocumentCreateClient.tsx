'use client'

import { useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {HREF} from '@cm/lib/methods/urls'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import { Button } from '@cm/components/styles/common-components/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/ui/card'
import type {
  Examination,
  Patient,
  Clinic,
  Facility,
  TreatmentContentData,
  KanriKeikakuData,
  HygieneGuidanceData,
  OralExamRecordData,
  OralFunctionPlanData,
  OralHygieneManagementData,
  OralFunctionRecord,
} from '@app/(apps)/dental/lib/types'
import { getPatientName, getPatientNameKana, countApplicableItems } from '@app/(apps)/dental/lib/helpers'
import { DOCUMENT_TEMPLATES } from '@app/(apps)/dental/lib/constants'
import { generatePdfBlobFromHtml } from '@app/(apps)/dental/lib/pdf-generator'
import { uploadDocumentPdf } from '@app/(apps)/dental/_actions/document-blob-actions'
import { createDentalSavedDocument } from '@app/(apps)/dental/_actions/saved-document-actions'
import {
  TreatmentContentTemplate,
  getDefaultTreatmentContentData,
  KanriKeikakuTemplate,
  getDefaultKanriKeikakuData,
  HygieneGuidanceTemplate,
  getDefaultHygieneGuidanceData,
  OralExamRecordTemplate,
  OralFunctionPlanTemplate,
  getDefaultOralFunctionPlanData,
  OralHygieneManagementTemplate,
  getDefaultOralHygieneManagementData,
} from '../components/DocumentTemplates'

type Props = {
  examination: Examination | null
  patient: Patient | null
  clinic: Clinic | null
  facilities: Facility[]
  initialTemplateId: string
}

/** 和暦日付を生成 */
const toWareki = (d: Date) => {
  const weekDay = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]
  return `令和${d.getFullYear() - 2018}年${d.getMonth() + 1}月${d.getDate()}日（${weekDay}）`
}

const DocumentCreateClient = ({ examination, patient, clinic, facilities, initialTemplateId }: Props) => {
  const router = useRouter()
  const {query} = useGlobal()
  const [selectedType, setSelectedType] = useState(initialTemplateId || '')
  const previewRef = useRef<HTMLDivElement>(null)
  const [saving, setSaving] = useState(false)

  // 各テンプレートのデータ状態
  const [treatmentData, setTreatmentData] = useState<TreatmentContentData>(getDefaultTreatmentContentData)
  const [kanriData, setKanriData] = useState<KanriKeikakuData>(getDefaultKanriKeikakuData)
  const [hygieneData, setHygieneData] = useState<HygieneGuidanceData>(getDefaultHygieneGuidanceData)
  const [oralFunctionPlanData, setOralFunctionPlanData] = useState<OralFunctionPlanData>(getDefaultOralFunctionPlanData)
  const [oralHygieneData, setOralHygieneData] = useState<OralHygieneManagementData>(getDefaultOralHygieneManagementData)
  const [seimitsuData, setSeimitsuData] = useState<OralExamRecordData>({
    documentNo: '', clinicName: '', patientNameKana: '', patientName: '',
    birthDate: '', age: 0, gender: '', measureDate: '',
    oralFunctionRecord: {
      tongueCoatingPercent: '', tongueCoatingApplicable: false,
      oralMoistureValue: '', salivaAmount: '', oralDrynessApplicable: false,
      biteForceN: '', remainingTeeth: '', biteForceApplicable: false,
      oralDiadochoPa: '', oralDiadochoTa: '', oralDiadochoKa: '', oralMotorApplicable: false,
      tonguePressureKPa: '', tonguePressureApplicable: false,
      masticatoryAbilityMgDl: '', masticatoryApplicable: false,
      swallowingEAT10Score: '', swallowingApplicable: false,
    },
    applicableCount: 0,
  })

  // 自動引用データ生成
  const treatmentQuote = useMemo((): Partial<TreatmentContentData> => {
    const q: Partial<TreatmentContentData> = {}
    if (patient) q.patientName = getPatientName(patient)
    q.visitDate = toWareki(new Date())
    if (examination?.drStartTime) q.startTime = examination.drStartTime
    if (examination?.drEndTime) q.endTime = examination.drEndTime
    if (clinic) {
      q.clinicName = clinic.name
      q.clinicAddress = clinic.address
      q.clinicPhone = clinic.phone
    }
    if (clinic?.representative) q.doctorName = clinic.representative
    return q
  }, [patient, examination, clinic])

  const kanriQuote = useMemo((): Partial<KanriKeikakuData> => {
    const q: Partial<KanriKeikakuData> = {}
    if (patient) q.patientName = getPatientName(patient)
    q.date = toWareki(new Date())
    if (clinic) q.clinicName = clinic.name
    if (clinic?.representative) q.doctorName = clinic.representative
    return q
  }, [patient, clinic])

  const hygieneQuote = useMemo((): Partial<HygieneGuidanceData> => {
    const q: Partial<HygieneGuidanceData> = {}
    if (patient) q.patientName = getPatientName(patient)
    q.date = toWareki(new Date())
    if (clinic) {
      q.clinicName = clinic.name
      q.clinicAddress = clinic.address
      q.clinicPhone = clinic.phone
    }
    if (clinic?.representative) q.doctorName = clinic.representative
    if (examination?.dhStartTime) q.startTime = examination.dhStartTime
    if (examination?.dhEndTime) q.endTime = examination.dhEndTime
    return q
  }, [patient, clinic, examination])

  const seimitsuQuote = useMemo((): Partial<OralExamRecordData> => {
    const q: Partial<OralExamRecordData> = {}
    if (clinic) q.clinicName = clinic.name
    if (patient) {
      q.patientNameKana = getPatientNameKana(patient)
      q.patientName = getPatientName(patient)
      q.birthDate = patient.birthDate
      q.age = patient.age
      q.gender = patient.gender
    }
    if (examination?.oralFunctionRecord) {
      q.oralFunctionRecord = examination.oralFunctionRecord as OralFunctionRecord
      q.applicableCount = countApplicableItems(examination.oralFunctionRecord as OralFunctionRecord)
    }
    return q
  }, [patient, clinic, examination])

  const oralFunctionPlanQuote = useMemo((): Partial<OralFunctionPlanData> => {
    const q: Partial<OralFunctionPlanData> = {}
    if (clinic) q.clinicName = clinic.name
    if (patient) {
      q.patientNameKana = getPatientNameKana(patient)
      q.patientName = getPatientName(patient)
      q.age = patient.age
      q.gender = patient.gender
    }
    q.provideDate = toWareki(new Date())
    return q
  }, [patient, clinic])

  const oralHygieneQuote = useMemo((): Partial<OralHygieneManagementData> => {
    const today = new Date()
    const q: Partial<OralHygieneManagementData> = {}
    q.evaluationDate = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`
    if (clinic) q.clinicName = clinic.name
    if (patient) {
      q.patientName = getPatientName(patient)
      q.patientNameKana = getPatientNameKana(patient)
      q.birthDate = patient.birthDate
      q.gender = patient.gender
      q.careLevel = patient.careLevel
    }
    return q
  }, [patient, clinic])

  // PDF保存処理
  const handleSave = async () => {
    if (saving || !previewRef.current || !selectedType) return
    setSaving(true)
    try {
      const blob = await generatePdfBlobFromHtml(previewRef.current)
      const arrayBuffer = await blob.arrayBuffer()
      const bytes = new Uint8Array(arrayBuffer)
      let binary = ''
      const chunkSize = 8192
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
      }
      const base64 = btoa(binary)
      const template = DOCUMENT_TEMPLATES[selectedType]
      const facility = patient ? facilities.find(f => f.id === patient.facilityId) : null

      const result = await uploadDocumentPdf(base64, {
        clinicId: clinic?.id || 1,
        facilityId: facility?.id || 0,
        patientId: patient?.id || 0,
        examinationId: examination?.id || 0,
        documentType: selectedType,
        documentName: template?.name || '',
        visitDate: new Date().toISOString().slice(0, 10),
      })

      await createDentalSavedDocument({
        dentalClinicId: clinic?.id,
        dentalPatientId: patient?.id || 0,
        dentalExaminationId: examination?.id || 0,
        templateId: selectedType,
        templateName: template?.name || '',
        pdfUrl: result.url,
      })

      router.refresh()
      router.push(HREF('/dental/document-list', {}, query))
    } catch (e) {
      console.error('PDF保存失敗:', e)
      window.alert('PDF保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const templateEntries = Object.entries(DOCUMENT_TEMPLATES)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            ← 戻る
          </Button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">文書作成</h1>
            {patient && <p className="text-sm text-gray-500">患者: {getPatientName(patient)} 様</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>印刷</Button>
          <Button onClick={handleSave} disabled={saving || !selectedType}>
            {saving ? 'PDF保存中...' : '保存して閉じる'}
          </Button>
        </div>
      </div>

      <div className="flex print:block">
        {/* テンプレート選択サイドバー */}
        <div className="w-64 shrink-0 border-r border-gray-200 bg-white p-4 print:hidden">
          <h2 className="text-sm font-bold text-gray-700 mb-3">文書テンプレート</h2>
          <div className="space-y-2">
            {templateEntries.map(([id, t]) => (
              <button
                key={id}
                onClick={() => setSelectedType(id)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${selectedType === id
                    ? 'bg-emerald-100 text-emerald-800 font-medium border border-emerald-300'
                    : 'hover:bg-gray-100 text-gray-700 border border-transparent'
                  }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* プレビュー */}
        <div className="flex-1 p-4 print:p-0 flex justify-center">
          {selectedType ? (
            <div ref={previewRef}>
              {selectedType === 'doc_houmon_chiryou' && (
                <TreatmentContentTemplate data={treatmentData} onChange={setTreatmentData} autoQuoteData={treatmentQuote} />
              )}
              {selectedType === 'doc_kanrikeikaku' && (
                <KanriKeikakuTemplate data={kanriData} onChange={setKanriData} autoQuoteData={kanriQuote} />
              )}
              {selectedType === 'doc_houeishi' && (
                <HygieneGuidanceTemplate data={hygieneData} onChange={setHygieneData} autoQuoteData={hygieneQuote} />
              )}
              {selectedType === 'doc_seimitsu_kensa' && (
                <OralExamRecordTemplate data={seimitsuData} autoQuoteData={seimitsuQuote} onAutoQuoted={setSeimitsuData} />
              )}
              {selectedType === 'doc_koukuu_kanri' && (
                <OralFunctionPlanTemplate data={oralFunctionPlanData} onChange={setOralFunctionPlanData} autoQuoteData={oralFunctionPlanQuote} />
              )}
              {selectedType === 'doc_kouei_kanri' && (
                <OralHygieneManagementTemplate data={oralHygieneData} onChange={setOralHygieneData} autoQuoteData={oralHygieneQuote} />
              )}
            </div>
          ) : (
            <Card className="w-full max-w-md mt-20">
              <CardHeader>
                <CardTitle className="text-center">テンプレートを選択</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 text-center">左のメニューから作成する文書テンプレートを選択してください。</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default DocumentCreateClient
