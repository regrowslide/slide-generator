import {useState, useMemo, useRef} from 'react'

import {DOCUMENT_TEMPLATES} from './constants'
import {getPatientName, getPatientNameKana, countApplicableItems} from './helpers'
import {Button, Card, TextArea, IconChevronLeft} from './ui-components'
import {PdfDownloadButton, generatePdfBlobFromHtml} from './pdf-generator'
import {uploadDocumentPdf} from './document-actions'
import {
  HoumonChiryouPreview,
  getDefaultTreatmentContentData,
  KanriKeikakuPreviewNew,
  getDefaultKanriKeikakuData,
  HoueishiPreviewNew,
  getDefaultHygieneGuidanceData,
  SeimitsuKensaPreview,
  KoukuuKanriPreview,
  getDefaultOralFunctionPlanData,
  KoueiKanriPreview,
  getDefaultOralHygieneManagementData,
} from './DocumentTemplates'
import type {
  Patient,
  Facility,
  DocumentTemplate,
  SavedDocumentEntry,
  TreatmentContentData,
  KanriKeikakuData,
  HygieneGuidanceData,
  OralExamRecordData,
  OralFunctionPlanData,
  OralHygieneManagementData,
  OralFunctionRecord,
} from './types'

// =============================================================================
// Props型定義
// =============================================================================

/** 旧文書用のコンテンツ型（houmon_jisseki, shizaikan_bunsho, zaishikan） */
type LegacyDocumentContent = {
  clinicName: string
  clinicAddress: string
  clinicPhone: string
  representative: string
  facilityName: string
  facilityAddress: string
  patientName: string
  patientNameKana: string
  patientBuilding: string
  patientFloor: string
  patientRoom: string
  teethCount: number
  hasDenture: string
  hasOralHypofunction: string
  visitCondition: string
  oralFindings: string
  treatment: string
  nextPlan: string
  dhMinutes: number
  createdAt: string
  doctorName?: string
  diseases?: string[]
  treatmentPerformed?: string[]
  managementPlan?: string
  oralHygieneGoal?: string
  guidanceContent?: string
  homeCareMethod?: string
  nextGuidancePlan?: string
  familyExplanation?: string
  managementPolicy?: string
}

type DocumentDataInput = {
  patient?: Patient
  clinic?: {name: string; address: string; phone: string; representative: string}
  facility?: Facility
  dhSeconds?: number
  visitCondition?: string
  oralFindings?: string
  treatment?: string
  nextPlan?: string
  doctorName?: string
  treatmentPerformed?: string[]
  drStartTime?: string
  drEndTime?: string
  dhStartTime?: string
  dhEndTime?: string
  oralFunctionRecord?: OralFunctionRecord | null
}

type SavedDocData = {
  documentType: string
  content: Record<string, unknown>
  createdAt: string
  patientId?: number
  examinationId?: number
}

type DocumentCreatePageProps = {
  documentType: string
  documentData: DocumentDataInput
  onBack: () => void
  onSave?: (data: SavedDocData) => void
}

/** 新しい文書タイプかどうか判定 */
const NEW_DOC_TYPES = ['doc_houmon_chiryou', 'doc_kanrikeikaku', 'doc_houeishi', 'doc_seimitsu_kensa', 'doc_koukuu_kanri', 'doc_kouei_kanri'] as const
type NewDocType = (typeof NEW_DOC_TYPES)[number]
const isNewDocType = (type: string): type is NewDocType => (NEW_DOC_TYPES as readonly string[]).includes(type)

// =============================================================================
// 初期データ生成ヘルパー
// =============================================================================

/** TreatmentContentData用の自動引用データを生成 */
const buildTreatmentQuoteData = (input: DocumentDataInput): Partial<TreatmentContentData> => {
  const today = new Date()
  const weekDay = ['日', '月', '火', '水', '木', '金', '土'][today.getDay()]
  const quote: Partial<TreatmentContentData> = {}
  if (input.patient) quote.patientName = getPatientName(input.patient)
  quote.visitDate = `令和${today.getFullYear() - 2018}年${today.getMonth() + 1}月${today.getDate()}日（${weekDay}）`
  if (input.drStartTime) quote.startTime = input.drStartTime
  if (input.drEndTime) quote.endTime = input.drEndTime
  if (input.clinic) {
    quote.clinicName = input.clinic.name
    quote.clinicAddress = input.clinic.address
    quote.clinicPhone = input.clinic.phone
  }
  if (input.doctorName) quote.doctorName = input.doctorName
  return quote
}

/** 和暦日付を生成 */
const toWareki = (d: Date) => {
  const weekDay = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]
  return `令和${d.getFullYear() - 2018}年${d.getMonth() + 1}月${d.getDate()}日（${weekDay}）`
}

/** KanriKeikaku用の自動引用データ */
const buildKanriKeikakuQuoteData = (input: DocumentDataInput): Partial<KanriKeikakuData> => {
  const q: Partial<KanriKeikakuData> = {}
  if (input.patient) q.patientName = getPatientName(input.patient)
  q.date = toWareki(new Date())
  if (input.clinic) q.clinicName = input.clinic.name
  if (input.doctorName) q.doctorName = input.doctorName
  if (input.patient?.diseases) {
    const diseaseList = Object.entries(input.patient.diseases).filter(([, v]) => v).map(([k]) => k)
    q.hasDiseases = diseaseList.length > 0
    q.diseaseNames = diseaseList.join('、')
  }
  if (input.patient?.assessment) {
    const a = input.patient.assessment
    q.hasMedication = (a.medications?.length || 0) > 0
    q.medicationNames = a.medications?.map(m => m.name).join('、') || ''
    if (a.aspirationPneumoniaHistory === 'あり') q.pneumoniaHistory = 'once'
    if (a.aspirationPneumoniaRepeat) q.pneumoniaHistory = 'repeat'
    if (a.malnutritionRisk === 'あり') q.malnutritionRisk = 'mild'
    q.dietType = a.mainDish || '普通食'
  }
  return q
}

/** Houeishi用の自動引用データ */
const buildHygieneQuoteData = (input: DocumentDataInput): Partial<HygieneGuidanceData> => {
  const q: Partial<HygieneGuidanceData> = {}
  if (input.patient) q.patientName = getPatientName(input.patient)
  q.date = toWareki(new Date())
  if (input.facility) q.facilityName = input.facility.name
  if (input.clinic) {
    q.clinicName = input.clinic.name
    q.clinicAddress = input.clinic.address
    q.clinicPhone = input.clinic.phone
  }
  if (input.doctorName) q.doctorName = input.doctorName
  if (input.dhStartTime) q.startTime = input.dhStartTime
  if (input.dhEndTime) q.endTime = input.dhEndTime
  return q
}

/** SeimitsuKensa用の自動引用データ */
const buildSeimitsuKensaQuoteData = (input: DocumentDataInput): Partial<OralExamRecordData> => {
  const q: Partial<OralExamRecordData> = {}
  if (input.clinic) q.clinicName = input.clinic.name
  if (input.patient) {
    q.patientNameKana = getPatientNameKana(input.patient)
    q.patientName = getPatientName(input.patient)
    q.birthDate = input.patient.birthDate
    q.age = input.patient.age
    q.gender = input.patient.gender
  }
  if (input.oralFunctionRecord) {
    q.oralFunctionRecord = input.oralFunctionRecord
    q.applicableCount = countApplicableItems(input.oralFunctionRecord)
    q.measureDate = input.oralFunctionRecord.measureDate || ''
  }
  return q
}

/** KoukuuKanri用の自動引用データ */
const buildOralFunctionPlanQuoteData = (input: DocumentDataInput): Partial<OralFunctionPlanData> => {
  const q: Partial<OralFunctionPlanData> = {}
  if (input.clinic) q.clinicName = input.clinic.name
  if (input.patient) {
    q.patientNameKana = getPatientNameKana(input.patient)
    q.patientName = getPatientName(input.patient)
    q.age = input.patient.age
    q.gender = input.patient.gender
  }
  q.provideDate = toWareki(new Date())
  // bodyConditionとoralFunctionStatusは深いネスト構造のため、引用時にマージが複雑
  // bodyConditionをまるごと生成
  if (input.patient) {
    const p = input.patient
    const diseaseList = Object.entries(p.diseases).filter(([, v]) => v).map(([k]) => k)
    const bc = getDefaultOralFunctionPlanData().bodyCondition
    bc.diseases = diseaseList
    if (p.assessment) {
      const a = p.assessment
      bc.medicationStatus = (a.medications?.length || 0) > 0 ? 'yes' : 'none'
      bc.medicationNames = a.medications?.map(m => m.name).join('、') || ''
      if (a.aspirationPneumoniaHistory === 'あり') bc.pneumoniaHistory = 'once'
      if (a.aspirationPneumoniaRepeat) bc.pneumoniaHistory = 'repeat'
      bc.nutritionWeight = a.weight || ''
      bc.nutritionHeight = a.height || ''
      bc.nutritionBMI = a.bmi || ''
      bc.dietType = a.mainDish || ''
    }
    q.bodyCondition = bc
  }
  if (input.oralFunctionRecord) {
    const r = input.oralFunctionRecord
    const statusMap: Array<{value: string; applicable: boolean}> = [
      {value: r.tongueCoatingPercent ? `${r.tongueCoatingPercent}%` : '', applicable: r.tongueCoatingApplicable},
      {value: r.oralMoistureValue || '', applicable: r.oralDrynessApplicable},
      {value: r.remainingTeeth ? `${r.remainingTeeth}本` : '', applicable: r.biteForceApplicable},
      {value: r.oralDiadochoPa ? `${r.oralDiadochoPa}回/秒` : '', applicable: r.oralMotorApplicable},
      {value: r.oralDiadochoTa ? `${r.oralDiadochoTa}回/秒` : '', applicable: r.oralMotorApplicable},
      {value: r.oralDiadochoKa ? `${r.oralDiadochoKa}回/秒` : '', applicable: r.oralMotorApplicable},
      {value: r.tonguePressureKPa ? `${r.tonguePressureKPa}kPa` : '', applicable: r.tonguePressureApplicable},
      {value: r.masticatoryAbilityMgDl ? `${r.masticatoryAbilityMgDl}mg/dL` : '', applicable: r.masticatoryApplicable},
      {value: r.swallowingEAT10Score ? `${r.swallowingEAT10Score}点` : '', applicable: r.swallowingApplicable},
    ]
    q.oralFunctionStatus = getDefaultOralFunctionPlanData().oralFunctionStatus.map((item, i) => ({
      ...item,
      value: statusMap[i].value,
      status: statusMap[i].applicable ? 'decreased' as const : 'normal' as const,
    }))
  }
  return q
}

/** KoueiKanri用の自動引用データ */
const buildOralHygieneQuoteData = (input: DocumentDataInput): Partial<OralHygieneManagementData> => {
  const today = new Date()
  const q: Partial<OralHygieneManagementData> = {}
  q.evaluationDate = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`
  if (input.clinic) q.clinicName = input.clinic.name
  if (input.patient) {
    const p = input.patient
    q.patientName = getPatientName(p)
    q.patientNameKana = getPatientNameKana(p)
    q.birthDate = p.birthDate
    q.gender = p.gender
    q.careLevel = p.careLevel
    const diseaseList = Object.entries(p.diseases).filter(([, v]) => v).map(([k]) => k)
    q.diseaseName = diseaseList.join('、')
  }
  return q
}

// =============================================================================
// DocumentCreatePage
// =============================================================================

export const DocumentCreatePage = ({documentType, documentData, onBack, onSave}: DocumentCreatePageProps) => {
  const template = DOCUMENT_TEMPLATES[documentType] as DocumentTemplate | undefined
  const {patient, clinic, dhSeconds, visitCondition, oralFindings, treatment, nextPlan, facility, doctorName, treatmentPerformed} =
    documentData || {}

  // 新しい文書タイプの状態管理
  const [treatmentData, setTreatmentData] = useState<TreatmentContentData>(getDefaultTreatmentContentData)
  const [kanriData, setKanriData] = useState<KanriKeikakuData>(getDefaultKanriKeikakuData)
  const [hygieneData, setHygieneData] = useState<HygieneGuidanceData>(getDefaultHygieneGuidanceData)
  const [oralFunctionPlanData, setOralFunctionPlanData] = useState<OralFunctionPlanData>(getDefaultOralFunctionPlanData)
  const [oralHygieneData, setOralHygieneData] = useState<OralHygieneManagementData>(getDefaultOralHygieneManagementData)

  // 精密検査表の状態（自動引用で更新可能に）
  const [seimitsuData, setSeimitsuData] = useState<OralExamRecordData>(() => ({
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
  }))

  // 自動引用データ（ボタン押下時に各プレビューへ流し込む）
  const treatmentQuoteData = useMemo(() => buildTreatmentQuoteData(documentData), [documentData])
  const kanriQuoteData = useMemo(() => buildKanriKeikakuQuoteData(documentData), [documentData])
  const hygieneQuoteData = useMemo(() => buildHygieneQuoteData(documentData), [documentData])
  const seimitsuQuoteData = useMemo(() => buildSeimitsuKensaQuoteData(documentData), [documentData])
  const oralFunctionPlanQuoteData = useMemo(() => buildOralFunctionPlanQuoteData(documentData), [documentData])
  const oralHygieneQuoteData = useMemo(() => buildOralHygieneQuoteData(documentData), [documentData])

  // 旧文書用のフォーム状態（doc_houmon_jisseki, doc_shizaikan_bunsho, doc_zaishikan）
  const [legacyFormData, setLegacyFormData] = useState<Record<string, string>>(() => {
    if (documentType === 'doc_shizaikan_bunsho') return {familyExplanation: ''} as Record<string, string>
    if (documentType === 'doc_zaishikan') return {managementPolicy: ''} as Record<string, string>
    return {} as Record<string, string>
  })

  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'done'>('idle')

  // 新文書タイプ用: HTMLプレビューのDOM参照
  const previewRef = useRef<HTMLDivElement>(null)

  // 新文書タイプ用: HTML→PDFダウンロード
  const [pdfGenerating, setPdfGenerating] = useState(false)
  const handleDownloadPdfFromHtml = async () => {
    if (!previewRef.current || pdfGenerating) return
    setPdfGenerating(true)
    try {
      const blob = await generatePdfBlobFromHtml(previewRef.current)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${template?.name || '文書'}_${patient ? getPatientName(patient) : ''}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('HTML→PDF変換失敗:', e)
    } finally {
      setPdfGenerating(false)
    }
  }

  const handleLegacyFormChange = (field: string, value: string) => {
    setLegacyFormData(prev => ({...prev, [field]: value}))
  }

  // 旧文書タイプ用のコンテンツ生成
  const getLegacyContent = (): LegacyDocumentContent => {
    const dhMinutes = Math.floor((dhSeconds || 0) / 60)
    const today = new Date()
    const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`
    return {
      clinicName: clinic?.name || '',
      clinicAddress: clinic?.address || '',
      clinicPhone: clinic?.phone || '',
      representative: clinic?.representative || '',
      facilityName: facility?.name || '',
      facilityAddress: facility?.address || '',
      patientName: patient ? getPatientName(patient) : '',
      patientNameKana: patient ? getPatientNameKana(patient) : '',
      patientBuilding: patient?.building || '',
      patientFloor: patient?.floor || '',
      patientRoom: patient?.room || '',
      teethCount: patient?.teethCount || 0,
      hasDenture: patient?.hasDenture ? 'あり' : 'なし',
      hasOralHypofunction: patient?.hasOralHypofunction ? 'あり' : 'なし',
      visitCondition: visitCondition || '',
      oralFindings: oralFindings || '',
      treatment: treatment || '',
      nextPlan: nextPlan || '',
      dhMinutes,
      doctorName: doctorName || '',
      diseases: patient?.diseases
        ? Object.entries(patient.diseases).filter(([, v]) => v).map(([k]) => k)
        : [],
      treatmentPerformed: treatmentPerformed || [],
      createdAt: dateStr,
      ...legacyFormData,
    }
  }

  /** 保存用のコンテンツを取得（すべての文書タイプに対応） */
  const getContentForSave = (): Record<string, unknown> => {
    if (documentType === 'doc_houmon_chiryou') return treatmentData as unknown as Record<string, unknown>
    if (documentType === 'doc_kanrikeikaku') return kanriData as unknown as Record<string, unknown>
    if (documentType === 'doc_houeishi') return hygieneData as unknown as Record<string, unknown>
    if (documentType === 'doc_seimitsu_kensa') return seimitsuData as unknown as Record<string, unknown>
    if (documentType === 'doc_koukuu_kanri') return oralFunctionPlanData as unknown as Record<string, unknown>
    if (documentType === 'doc_kouei_kanri') return oralHygieneData as unknown as Record<string, unknown>
    return getLegacyContent() as unknown as Record<string, unknown>
  }

  // 印刷
  const handlePrint = () => {
    window.print()
  }

  // Vercel Blobにアップロード
  const handleUploadPdf = async () => {
    if (uploadStatus === 'uploading') return
    setUploadStatus('uploading')
    try {
      let blob: Blob
      if (isNewDocType(documentType) && previewRef.current) {
        // 新文書タイプ: HTML→PDFキャプチャ
        blob = await generatePdfBlobFromHtml(previewRef.current)
      } else {
        // 旧文書タイプ: react-pdf
        const {generatePdfBlob} = await import('./pdf-generator')
        const content = getContentForSave()
        blob = await generatePdfBlob(documentType, content)
      }
      const arrayBuffer = await blob.arrayBuffer()
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
      await uploadDocumentPdf(base64, {
        clinicId: 1,
        facilityId: facility?.id || 0,
        patientId: patient?.id || 0,
        examinationId: 0,
        documentType,
        documentName: template?.name || '',
        visitDate: new Date().toISOString().slice(0, 10),
      })
      setUploadStatus('done')
    } catch (e) {
      console.error('PDF upload failed:', e)
      setUploadStatus('idle')
    }
  }

  // 保存処理
  const handleSaveDocument = () => {
    if (onSave) {
      onSave({
        documentType,
        content: getContentForSave(),
        createdAt: new Date().toISOString(),
      })
    }
    onBack()
  }

  if (!template) {
    return (
      <div className="p-4">
        <div className="text-red-500">文書テンプレートが見つかりません: {documentType}</div>
        <Button onClick={onBack} className="mt-4">
          戻る
        </Button>
      </div>
    )
  }

  const legacyContent = !isNewDocType(documentType) ? getLegacyContent() : null

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 rounded"
            aria-label="戻る"
          >
            <IconChevronLeft />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{template.fullName}</h1>
            <p className="text-sm text-gray-500">患者: {patient ? getPatientName(patient) : '-'} 様</p>
            {template.referenceUrl && (
              <a
                href={template.referenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
              >
                <span>🔗</span> 根拠・参考資料（外部サイト）
              </a>
            )}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {isNewDocType(documentType) ? (
            <Button variant="primary" onClick={handleDownloadPdfFromHtml} disabled={pdfGenerating}>
              {pdfGenerating ? 'PDF生成中...' : 'PDFダウンロード'}
            </Button>
          ) : (
            <PdfDownloadButton
              documentType={documentType}
              content={getContentForSave()}
              fileName={`${template.name}_${patient ? getPatientName(patient) : ''}.pdf`}
            />
          )}
          <Button variant="outline" onClick={handleUploadPdf}>
            {uploadStatus === 'uploading' ? 'アップロード中...' : uploadStatus === 'done' ? '保存済み' : 'Blobに保存'}
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            印刷
          </Button>
          <Button variant="success" onClick={handleSaveDocument}>
            保存して閉じる
          </Button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className={`${isNewDocType(documentType) ? 'flex justify-center' : 'flex gap-4'} p-4 print:p-0 print:block`}>
        {/* 左側: 入力フォーム（旧文書タイプのみ表示） */}
        <div className={`w-1/3 space-y-4 print:hidden ${isNewDocType(documentType) ? 'hidden' : ''}`}>
          {/* 自動流し込み項目 */}
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3 border-b pb-2">自動流し込み項目</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">医療機関名:</span>
                <span className="ml-2 text-gray-900">{clinic?.name || ''}</span>
              </div>
              <div>
                <span className="text-gray-500">患者氏名:</span>
                <span className="ml-2 text-gray-900">{patient ? getPatientName(patient) : ''}</span>
              </div>
              <div>
                <span className="text-gray-500">ふりがな:</span>
                <span className="ml-2 text-gray-900">{patient ? getPatientNameKana(patient) : ''}</span>
              </div>
              {isNewDocType(documentType) && (
                <div className="mt-2 px-3 py-2 bg-blue-50 rounded text-xs text-blue-700">
                  この文書は右側のプレビュー上で直接編集できます。
                </div>
              )}
              {/* 旧文書タイプ用の追加情報 */}
              {documentType === 'doc_houmon_jisseki' && (
                <>
                  <div>
                    <span className="text-gray-500">施設名:</span>
                    <span className="ml-2 text-gray-900">{facility?.name || ''}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">担当医:</span>
                    <span className="ml-2 text-gray-900">{doctorName || '（未設定）'}</span>
                  </div>
                </>
              )}
              {documentType === 'doc_zaishikan' && (
                <>
                  <div>
                    <span className="text-gray-500">基礎疾患:</span>
                    <span className="ml-2 text-gray-900">
                      {legacyContent?.diseases?.length ? legacyContent.diseases.join(', ') : '（なし）'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">実施治療:</span>
                    <span className="ml-2 text-gray-900">
                      {legacyContent?.treatmentPerformed?.length ? legacyContent.treatmentPerformed.join(', ') : '（なし）'}
                    </span>
                  </div>
                </>
              )}
              <div>
                <span className="text-gray-500">作成日:</span>
                <span className="ml-2 text-gray-900">{new Date().toLocaleDateString('ja-JP')}</span>
              </div>
            </div>
          </Card>

          {/* 診察記録からの流し込み（旧文書 + 一部の新文書で参考表示） */}
          {!isNewDocType(documentType) && (
            <Card className="p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3 border-b pb-2">診察記録からの流し込み</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500 block">訪問時の様子:</span>
                  <span className="text-gray-900 text-xs">{visitCondition || '（未入力）'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">口腔内所見:</span>
                  <span className="text-gray-900 text-xs">{oralFindings || '（未入力）'}</span>
                </div>
                {(documentType === 'doc_shizaikan_bunsho') && (
                  <>
                    <div>
                      <span className="text-gray-500 block">処置:</span>
                      <span className="text-gray-900 text-xs">{treatment || '（未入力）'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">次回予定:</span>
                      <span className="text-gray-900 text-xs">{nextPlan || '（未入力）'}</span>
                    </div>
                  </>
                )}
              </div>
            </Card>
          )}

          {/* 手動入力項目（旧文書タイプのみ） */}
          {!isNewDocType(documentType) && (
            <Card className="p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3 border-b pb-2">手動入力項目</h3>
              <div className="space-y-4">
                {documentType === 'doc_houmon_jisseki' && (
                  <p className="text-sm text-gray-500">この文書は自動流し込みのみで作成されます。手動入力項目はありません。</p>
                )}
                {documentType === 'doc_shizaikan_bunsho' && (
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">患者・ご家族への説明内容</label>
                    <TextArea
                      value={legacyFormData.familyExplanation}
                      onChange={(v: string) => handleLegacyFormChange('familyExplanation', v)}
                      placeholder="例: 管理計画の内容をご家族にわかりやすく説明..."
                      rows={4}
                    />
                  </div>
                )}
                {documentType === 'doc_zaishikan' && (
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">管理方針</label>
                    <TextArea
                      value={legacyFormData.managementPolicy}
                      onChange={(v: string) => handleLegacyFormChange('managementPolicy', v)}
                      placeholder="例: 基礎疾患を考慮した治療方針、注意事項..."
                      rows={4}
                    />
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* 新文書タイプ: seimitsu_kensa は読み取り専用の旨を表示 */}
          {documentType === 'doc_seimitsu_kensa' && (
            <Card className="p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3 border-b pb-2">口腔機能精密検査</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>検査データは診察記録の口腔機能検査から引用されます。</p>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">該当項目数:</span>
                  <span className={`font-bold ${seimitsuData.applicableCount >= 3 ? 'text-red-600' : 'text-gray-900'}`}>
                    {seimitsuData.applicableCount} / 7
                  </span>
                </div>
                {seimitsuData.applicableCount >= 3 && (
                  <div className="px-3 py-2 bg-red-50 rounded text-xs text-red-700">
                    口腔機能低下症の基準（3項目以上）に該当しています。
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* 右側: プレビュー */}
        <div className="flex-1 print:w-full">
          {/* 新しい文書プレビュー（HTML→PDFキャプチャ用にrefで囲む） */}
          {isNewDocType(documentType) && (
            <div ref={previewRef}>
              {documentType === 'doc_houmon_chiryou' && (
                <HoumonChiryouPreview data={treatmentData} onChange={setTreatmentData} autoQuoteData={treatmentQuoteData} />
              )}
              {documentType === 'doc_kanrikeikaku' && (
                <KanriKeikakuPreviewNew data={kanriData} onChange={setKanriData} autoQuoteData={kanriQuoteData} />
              )}
              {documentType === 'doc_houeishi' && (
                <HoueishiPreviewNew data={hygieneData} onChange={setHygieneData} autoQuoteData={hygieneQuoteData} />
              )}
              {documentType === 'doc_seimitsu_kensa' && (
                <SeimitsuKensaPreview data={seimitsuData} autoQuoteData={seimitsuQuoteData} onAutoQuoted={setSeimitsuData} />
              )}
              {documentType === 'doc_koukuu_kanri' && (
                <KoukuuKanriPreview data={oralFunctionPlanData} onChange={setOralFunctionPlanData} autoQuoteData={oralFunctionPlanQuoteData} />
              )}
              {documentType === 'doc_kouei_kanri' && (
                <KoueiKanriPreview data={oralHygieneData} onChange={setOralHygieneData} autoQuoteData={oralHygieneQuoteData} />
              )}
            </div>
          )}
          {/* 旧文書プレビュー */}
          {documentType === 'doc_houmon_jisseki' && legacyContent && <HoumonJissekiPreview content={legacyContent} />}
          {documentType === 'doc_shizaikan_bunsho' && legacyContent && <ShizaikanBunshoPreview content={legacyContent} />}
          {documentType === 'doc_zaishikan' && legacyContent && <ZaishikanPreview content={legacyContent} />}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// HoumonJissekiPreview - 歯科訪問診療実績表プレビューコンポーネント（旧）
// =============================================================================

const HoumonJissekiPreview = ({content}: {content: LegacyDocumentContent}) => {
  return (
    <div
      className="bg-white shadow-lg mx-auto print:shadow-none print:mx-0"
      style={{width: '210mm', minHeight: '297mm', padding: '15mm'}}
    >
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold border-b-2 border-black pb-2 inline-block">歯科訪問診療実績表</h1>
        <p className="text-sm text-gray-600 mt-2">作成日: {content.createdAt}</p>
      </div>
      <div className="border border-gray-400 mb-4">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-gray-300">
              <td className="px-3 py-2 w-28 bg-gray-50 text-gray-600">医療機関名</td>
              <td className="px-3 py-2" colSpan={3}>{content.clinicName}</td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="px-3 py-2 bg-gray-50 text-gray-600">施設名</td>
              <td className="px-3 py-2">{content.facilityName}</td>
              <td className="px-3 py-2 w-24 bg-gray-50 text-gray-600">施設住所</td>
              <td className="px-3 py-2">{content.facilityAddress}</td>
            </tr>
            <tr>
              <td className="px-3 py-2 bg-gray-50 text-gray-600">歯科医師名</td>
              <td className="px-3 py-2" colSpan={3}>{content.doctorName || '（未設定）'}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">訪問診療実績一覧</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="border-b border-r border-gray-300 px-3 py-2 text-left w-8">No.</th>
              <th className="border-b border-r border-gray-300 px-3 py-2 text-left">患者氏名</th>
              <th className="border-b border-r border-gray-300 px-3 py-2 text-left w-24">訪問日時</th>
              <th className="border-b border-r border-gray-300 px-3 py-2 text-left w-20">診療時間</th>
              <th className="border-b border-gray-300 px-3 py-2 text-left">処置概要</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-b border-r border-gray-300 px-3 py-2 text-center">1</td>
              <td className="border-b border-r border-gray-300 px-3 py-2">{content.patientName}</td>
              <td className="border-b border-r border-gray-300 px-3 py-2">{content.createdAt}</td>
              <td className="border-b border-r border-gray-300 px-3 py-2">-</td>
              <td className="border-b border-gray-300 px-3 py-2">{content.treatment || '-'}</td>
            </tr>
            {[2, 3, 4, 5].map(n => (
              <tr key={n}>
                <td className="border-b border-r border-gray-300 px-3 py-2 text-center text-gray-400">{n}</td>
                <td className="border-b border-r border-gray-300 px-3 py-2 min-h-[24px]">&nbsp;</td>
                <td className="border-b border-r border-gray-300 px-3 py-2">&nbsp;</td>
                <td className="border-b border-r border-gray-300 px-3 py-2">&nbsp;</td>
                <td className="border-b border-gray-300 px-3 py-2">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border border-gray-400">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">備考</div>
        <div className="p-3 text-sm min-h-[60px]">&nbsp;</div>
      </div>
    </div>
  )
}

// =============================================================================
// ShizaikanBunshoPreview - 管理計画説明文書プレビューコンポーネント（旧）
// =============================================================================

const ShizaikanBunshoPreview = ({content}: {content: LegacyDocumentContent}) => {
  return (
    <div
      className="bg-white shadow-lg mx-auto print:shadow-none print:mx-0"
      style={{width: '210mm', minHeight: '297mm', padding: '15mm'}}
    >
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold border-b-2 border-black pb-2 inline-block">歯科疾患在宅療養管理計画 説明文書</h1>
        <p className="text-sm text-gray-600 mt-2">作成日: {content.createdAt}</p>
      </div>
      <div className="border border-gray-400 mb-4">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-gray-300">
              <td className="px-3 py-2 w-28 bg-gray-50 text-gray-600">医療機関名</td>
              <td className="px-3 py-2" colSpan={3}>{content.clinicName}</td>
            </tr>
            <tr>
              <td className="px-3 py-2 bg-gray-50 text-gray-600">患者氏名</td>
              <td className="px-3 py-2">{content.patientName}</td>
              <td className="px-3 py-2 w-24 bg-gray-50 text-gray-600">ふりがな</td>
              <td className="px-3 py-2">{content.patientNameKana}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">口腔内の状態</div>
        <div className="p-3 text-sm min-h-[60px] whitespace-pre-wrap">{content.oralFindings || '（記載なし）'}</div>
      </div>
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">本日の処置内容</div>
        <div className="p-3 text-sm min-h-[60px] whitespace-pre-wrap">{content.treatment || '（記載なし）'}</div>
      </div>
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">今後の管理計画</div>
        <div className="p-3 text-sm min-h-[80px] whitespace-pre-wrap">{content.managementPlan || '（記載なし）'}</div>
      </div>
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">患者様・ご家族への説明内容</div>
        <div className="p-3 text-sm min-h-[100px] whitespace-pre-wrap">{content.familyExplanation || '（入力してください）'}</div>
      </div>
      <div className="border border-gray-400">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">次回診療予定</div>
        <div className="p-3 text-sm whitespace-pre-wrap">{content.nextPlan || '（記載なし）'}</div>
      </div>
      <div className="mt-8 text-sm text-gray-600 text-center">
        <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
        <p className="mt-1">{content.clinicName}</p>
      </div>
    </div>
  )
}

// =============================================================================
// ZaishikanPreview - 在歯管報告書プレビューコンポーネント（旧）
// =============================================================================

const ZaishikanPreview = ({content}: {content: LegacyDocumentContent}) => {
  return (
    <div
      className="bg-white shadow-lg mx-auto print:shadow-none print:mx-0"
      style={{width: '210mm', minHeight: '297mm', padding: '15mm'}}
    >
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold border-b-2 border-black pb-2 inline-block">在宅患者歯科治療総合医療管理報告書</h1>
        <p className="text-sm text-gray-600 mt-2">作成日: {content.createdAt}</p>
      </div>
      <div className="border border-gray-400 mb-4">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-gray-300">
              <td className="px-3 py-2 w-28 bg-gray-50 text-gray-600">医療機関名</td>
              <td className="px-3 py-2" colSpan={3}>{content.clinicName}</td>
            </tr>
            <tr>
              <td className="px-3 py-2 bg-gray-50 text-gray-600">患者氏名</td>
              <td className="px-3 py-2">{content.patientName}</td>
              <td className="px-3 py-2 w-24 bg-gray-50 text-gray-600">ふりがな</td>
              <td className="px-3 py-2">{content.patientNameKana}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">基礎疾患</div>
        <div className="p-3 text-sm min-h-[40px]">
          {content.diseases?.length ? (
            <div className="flex flex-wrap gap-2">
              {content.diseases.map(d => (
                <span key={d} className="px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded text-xs">{d}</span>
              ))}
            </div>
          ) : (
            <span className="text-gray-400">（基礎疾患の登録なし）</span>
          )}
        </div>
      </div>
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">実施した治療</div>
        <div className="p-3 text-sm min-h-[60px]">
          {content.treatmentPerformed?.length ? (
            <ul className="list-disc list-inside space-y-1">
              {content.treatmentPerformed.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          ) : (
            <span className="text-gray-400">（実施治療の登録なし）</span>
          )}
        </div>
      </div>
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">口腔内所見</div>
        <div className="p-3 text-sm min-h-[60px] whitespace-pre-wrap">{content.oralFindings || '（記載なし）'}</div>
      </div>
      <div className="border border-gray-400">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">管理方針</div>
        <div className="p-3 text-sm min-h-[100px] whitespace-pre-wrap">{content.managementPolicy || '（入力してください）'}</div>
      </div>
      <div className="mt-8 text-sm text-gray-600 text-center">
        <p>{content.clinicName}</p>
      </div>
    </div>
  )
}

// =============================================================================
// DocumentListPage - 文書管理・一括DL画面
// =============================================================================

type DocumentListPageProps = {
  documents: SavedDocumentEntry[]
  facilities: Facility[]
  onMergePdfs?: (pdfUrls: string[], fileName: string) => Promise<void>
}

export const DocumentListPage = ({documents, facilities, onMergePdfs}: DocumentListPageProps) => {
  const [filterFacility, setFilterFacility] = useState<string>('')
  const [filterDocType, setFilterDocType] = useState<string>('')
  const [filterMonth, setFilterMonth] = useState<string>('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const filtered = documents.filter(doc => {
    if (filterFacility && doc.facilityId !== Number(filterFacility)) return false
    if (filterDocType && doc.documentType !== filterDocType) return false
    if (filterMonth && !doc.visitDate.startsWith(filterMonth)) return false
    return true
  })

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map(d => d.id)))
    }
  }

  const [mergeStatus, setMergeStatus] = useState<'idle' | 'merging'>('idle')

  const handleBulkDownload = () => {
    const selected = filtered.filter(d => selectedIds.has(d.id) && d.pdfUrl)
    selected.forEach(doc => {
      const a = document.createElement('a')
      a.href = doc.pdfUrl
      a.download = `${doc.documentName}_${doc.patientName}.pdf`
      a.target = '_blank'
      a.click()
    })
    if (selected.length === 0) {
      window.alert('ダウンロード可能な文書が選択されていません。文書作成画面で「Blobに保存」を実行してください。')
    }
  }

  /** 選択した文書を1つのPDFに結合してダウンロード */
  const handleMergeDownload = async () => {
    if (!onMergePdfs) return
    const selected = filtered.filter(d => selectedIds.has(d.id) && d.pdfUrl)
    if (selected.length < 2) {
      window.alert('結合するには2つ以上のPDF保存済み文書を選択してください。')
      return
    }
    setMergeStatus('merging')
    try {
      const pdfUrls = selected.map(d => d.pdfUrl)
      const today = new Date().toISOString().slice(0, 10)
      await onMergePdfs(pdfUrls, `文書一括_${today}.pdf`)
    } catch (e) {
      console.error('PDF結合失敗:', e)
    } finally {
      setMergeStatus('idle')
    }
  }

  const documentTypeOptions = Object.entries(DOCUMENT_TEMPLATES).map(([id, t]) => ({
    value: id,
    label: t.name,
  }))

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-4">文書管理</h1>

      {/* フィルタ */}
      <Card className="p-4 mb-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs text-gray-600 mb-1">月</label>
            <input
              type="month"
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">施設</label>
            <select
              value={filterFacility}
              onChange={e => setFilterFacility(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm"
            >
              <option value="">すべて</option>
              {facilities.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">文書タイプ</label>
            <select
              value={filterDocType}
              onChange={e => setFilterDocType(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm"
            >
              <option value="">すべて</option>
              {documentTypeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={handleSelectAll}>
              {selectedIds.size === filtered.length ? '全解除' : '全選択'}
            </Button>
            <Button size="sm" variant="primary" onClick={handleBulkDownload} disabled={selectedIds.size === 0}>
              選択した文書をDL ({selectedIds.size}件)
            </Button>
            {onMergePdfs && (
              <Button
                size="sm"
                variant="primary"
                onClick={handleMergeDownload}
                disabled={selectedIds.size < 2 || mergeStatus === 'merging'}
              >
                {mergeStatus === 'merging' ? '結合中...' : `1つのPDFに結合 (${selectedIds.size}件)`}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* 文書一覧 */}
      {filtered.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          <p className="text-lg mb-2">保存済み文書がありません</p>
          <p className="text-sm">診療画面から文書を作成・保存すると、ここに表示されます。</p>
        </Card>
      ) : (
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-2 text-left w-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filtered.length && filtered.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 accent-emerald-600"
                  />
                </th>
                <th className="px-3 py-2 text-left">文書名</th>
                <th className="px-3 py-2 text-left">患者</th>
                <th className="px-3 py-2 text-left">施設</th>
                <th className="px-3 py-2 text-left">訪問日</th>
                <th className="px-3 py-2 text-left">作成日時</th>
                <th className="px-3 py-2 text-left w-20">PDF</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(doc => (
                <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(doc.id)}
                      onChange={() => handleToggleSelect(doc.id)}
                      className="w-4 h-4 accent-emerald-600"
                    />
                  </td>
                  <td className="px-3 py-2 font-medium">{doc.documentName}</td>
                  <td className="px-3 py-2">{doc.patientName}</td>
                  <td className="px-3 py-2">{doc.facilityName}</td>
                  <td className="px-3 py-2">{doc.visitDate}</td>
                  <td className="px-3 py-2 text-gray-500">{new Date(doc.createdAt).toLocaleString('ja-JP')}</td>
                  <td className="px-3 py-2">
                    {doc.pdfUrl ? (
                      <a
                        href={doc.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-xs"
                      >
                        DL
                      </a>
                    ) : (
                      <span className="text-gray-400 text-xs">未保存</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
