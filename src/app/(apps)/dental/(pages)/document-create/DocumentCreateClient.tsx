'use client'

import { useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { HREF } from '@cm/lib/methods/urls'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import { Button } from '@cm/components/styles/common-components/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/ui/card'
import type {
  Examination,
  Patient,
  Clinic,
  Facility,
  Staff,
  ScoringHistoryItem,
  TreatmentContentData,
  KanriKeikakuData,
  HygieneGuidanceData,
  OralExamRecordData,
  OralFunctionPlanData,
  OralHygieneManagementData,
  OralFunctionRecord,
} from '@app/(apps)/dental/lib/types'
import ConsultationClient from '../consultation/ConsultationClient'
import { getPatientName, getPatientNameKana, countApplicableItems, calculateDocumentRequirements } from '@app/(apps)/dental/lib/helpers'
import { DOCUMENT_TEMPLATES } from '@app/(apps)/dental/lib/constants'
import DocumentTemplateButtons from '../components/DocumentTemplateButtons'
import { generatePdfBlobFromHtml } from '@app/(apps)/dental/lib/pdf-generator'
import { uploadDocumentPdf } from '@app/(apps)/dental/_actions/document-blob-actions'
import { createDentalSavedDocument, updateDentalSavedDocument } from '@app/(apps)/dental/_actions/saved-document-actions'
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
  savedDocumentId?: number | null
  savedTemplateData?: Record<string, unknown> | null
  staff?: Staff[]
  allExaminations?: Examination[]
  scoringHistories?: ScoringHistoryItem[]
  visitPlanId?: number
  visitDate?: string
  savedTemplateIds?: string[]
}

/** 和暦日付を生成 */
const toWareki = (d: Date) => {
  const weekDay = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]
  return `令和${d.getFullYear() - 2018}年${d.getMonth() + 1}月${d.getDate()}日（${weekDay}）`
}

const DocumentCreateClient = ({
  examination, patient, clinic, facilities, initialTemplateId, savedDocumentId, savedTemplateData,
  staff = [], allExaminations = [], scoringHistories = [], visitPlanId = 0, visitDate = '',
  savedTemplateIds: initialSavedTemplateIds = [],
}: Props) => {
  const isEditMode = !!savedDocumentId
  const router = useRouter()
  const { query } = useGlobal()
  const [selectedType, setSelectedType] = useState(initialTemplateId || '')
  const previewRef = useRef<HTMLDivElement>(null)
  const [saving, setSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [currentSavedDocId, setCurrentSavedDocId] = useState<number | null>(savedDocumentId ?? null)
  const [autoSaving, setAutoSaving] = useState(false)
  const [savedTemplateIds, setSavedTemplateIds] = useState<string[]>(initialSavedTemplateIds)

  // 各テンプレートのデータ状態（編集モード時は保存済みデータで初期化）
  const sd = savedTemplateData
  const [treatmentData, setTreatmentData] = useState<TreatmentContentData>(
    sd?.treatmentData ? (sd.treatmentData as TreatmentContentData) : getDefaultTreatmentContentData
  )
  const [kanriData, setKanriData] = useState<KanriKeikakuData>(
    sd?.kanriData ? (sd.kanriData as KanriKeikakuData) : getDefaultKanriKeikakuData
  )
  const [hygieneData, setHygieneData] = useState<HygieneGuidanceData>(
    sd?.hygieneData ? (sd.hygieneData as HygieneGuidanceData) : getDefaultHygieneGuidanceData
  )
  const [oralFunctionPlanData, setOralFunctionPlanData] = useState<OralFunctionPlanData>(
    sd?.oralFunctionPlanData ? (sd.oralFunctionPlanData as OralFunctionPlanData) : getDefaultOralFunctionPlanData
  )
  const [oralHygieneData, setOralHygieneData] = useState<OralHygieneManagementData>(
    sd?.oralHygieneData ? (sd.oralHygieneData as OralHygieneManagementData) : getDefaultOralHygieneManagementData
  )
  const [seimitsuData, setSeimitsuData] = useState<OralExamRecordData>(
    sd?.seimitsuData ? (sd.seimitsuData as OralExamRecordData) : {
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
    }
  )

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

  // 現在のテンプレートデータを取得
  const getCurrentTemplateData = (): Record<string, unknown> => {
    const dataMap: Record<string, unknown> = {
      doc_houmon_chiryou: { treatmentData },
      doc_kanrikeikaku: { kanriData },
      doc_houeishi: { hygieneData },
      doc_seimitsu_kensa: { seimitsuData },
      doc_koukuu_kanri: { oralFunctionPlanData },
      doc_kouei_kanri: { oralHygieneData },
    }
    return (dataMap[selectedType] || {}) as Record<string, unknown>
  }

  // テンプレートデータのonBlur即時保存
  const handleTemplateBlur = async () => {
    if (autoSaving || !selectedType) return
    setAutoSaving(true)
    try {
      const templateData = getCurrentTemplateData()
      const template = DOCUMENT_TEMPLATES[selectedType]
      if (currentSavedDocId) {
        // 既存レコードを更新
        await updateDentalSavedDocument(currentSavedDocId, { templateData })
      } else if (examination) {
        // 初回保存: レコード作成
        const newDoc = await createDentalSavedDocument({
          dentalClinicId: clinic?.id,
          dentalPatientId: patient?.id || 0,
          dentalExaminationId: examination.id,
          templateId: selectedType,
          templateName: template?.name || '',
          templateData,
        })
        if (newDoc) setCurrentSavedDocId(newDoc.id)
      }
      setIsDirty(false)
      // サイドバーの保存済み表示を更新
      if (selectedType && !savedTemplateIds.includes(selectedType)) {
        setSavedTemplateIds(prev => [...prev, selectedType])
      }
    } catch (e) {
      console.error('自動保存失敗:', e)
    } finally {
      setAutoSaving(false)
    }
  }

  // テンプレート変更時のisDirtyフラグ管理用ラッパー
  const wrapOnChange = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v)
    setIsDirty(true)
  }

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
      const templateData = getCurrentTemplateData()

      const result = await uploadDocumentPdf(base64, {
        clinicId: clinic?.id || 1,
        facilityId: facility?.id || 0,
        patientId: patient?.id || 0,
        examinationId: examination?.id || 0,
        documentType: selectedType,
        documentName: template?.name || '',
        visitDate: new Date().toISOString().slice(0, 10),
      })

      if (isEditMode && savedDocumentId) {
        await updateDentalSavedDocument(savedDocumentId, {
          templateData,
          pdfUrl: result.url,
        })
      } else {
        await createDentalSavedDocument({
          dentalClinicId: clinic?.id,
          dentalPatientId: patient?.id || 0,
          dentalExaminationId: examination?.id || 0,
          templateId: selectedType,
          templateName: template?.name || '',
          templateData,
          pdfUrl: result.url,
        })
      }

      router.refresh()
      router.push(HREF('/dental/document-list', {}, query))
    } catch (e) {
      console.error('PDF保存失敗:', e)
      window.alert('PDF保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  // 診察の実施項目から必要文書を判定
  const docRequirements = useMemo(() => {
    return calculateDocumentRequirements({
      procedureItems: examination?.procedureItems,
      dhSeconds: 0,
    })
  }, [examination])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={() => router.back()}>
            ← 戻る
          </Button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{isEditMode ? '文書編集' : '文書作成'}</h1>
            {patient && <p className="text-sm text-gray-500">患者: {getPatientName(patient)} 様</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => window.print()}>印刷</Button>
          <Button onClick={handleSave} disabled={saving || !selectedType}>
            {saving ? 'PDF保存中...' : '保存して閉じる'}
          </Button>
        </div>
      </div>

      <div className="flex print:block" style={{ height: 'calc(100vh - 57px)' }}>
        {/* 左パネル: 診察情報（読み取り専用） */}
        {examination && patient && clinic && (
          <div className="w-1/2 shrink-0 border-r border-gray-200 overflow-y-auto print:hidden">
            <ConsultationClient
              examination={examination}
              patient={patient}
              staff={staff}
              clinic={clinic}
              visitDate={visitDate}
              consultationMode="doctor"
              allExaminations={allExaminations}
              scoringHistories={scoringHistories}
              visitPlanId={visitPlanId}
              readOnly
            />
          </div>
        )}

        {/* テンプレートサイドバー */}
        <div className="w-48 shrink-0 border-r border-gray-200 bg-white overflow-y-auto print:hidden">
          <div className="p-2">
            <p className="text-xs font-bold text-gray-500 mb-2 px-1">文書テンプレート</p>
            <DocumentTemplateButtons
              docRequirements={docRequirements}
              savedTemplateIds={savedTemplateIds}
              selectedType={selectedType}
              onSelect={setSelectedType}
              variant="sidebar"
            />
          </div>
        </div>

        {/* 右パネル: テンプレート編集 */}
        <div className="flex-1 p-4 print:p-0 overflow-y-auto flex justify-center">
          {selectedType ? (
            <div ref={previewRef} onBlur={handleTemplateBlur} className={isDirty ? 'ring-2 ring-yellow-300 rounded' : ''}>
              {selectedType === 'doc_houmon_chiryou' && (
                <TreatmentContentTemplate data={treatmentData} onChange={wrapOnChange(setTreatmentData)} autoQuoteData={treatmentQuote} />
              )}
              {selectedType === 'doc_kanrikeikaku' && (
                <KanriKeikakuTemplate data={kanriData} onChange={wrapOnChange(setKanriData)} autoQuoteData={kanriQuote} />
              )}
              {selectedType === 'doc_houeishi' && (
                <HygieneGuidanceTemplate data={hygieneData} onChange={wrapOnChange(setHygieneData)} autoQuoteData={hygieneQuote} />
              )}
              {selectedType === 'doc_seimitsu_kensa' && (
                <OralExamRecordTemplate data={seimitsuData} autoQuoteData={seimitsuQuote} onAutoQuoted={setSeimitsuData} />
              )}
              {selectedType === 'doc_koukuu_kanri' && (
                <OralFunctionPlanTemplate data={oralFunctionPlanData} onChange={wrapOnChange(setOralFunctionPlanData)} autoQuoteData={oralFunctionPlanQuote} />
              )}
              {selectedType === 'doc_kouei_kanri' && (
                <OralHygieneManagementTemplate data={oralHygieneData} onChange={wrapOnChange(setOralHygieneData)} autoQuoteData={oralHygieneQuote} />
              )}
              {autoSaving && <div className="text-center text-xs text-gray-400 mt-2">保存中...</div>}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 text-sm">← サイドバーからテンプレートを選択してください</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DocumentCreateClient
