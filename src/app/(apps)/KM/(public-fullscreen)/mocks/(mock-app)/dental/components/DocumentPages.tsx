import { useState, useMemo, useRef } from 'react'

import { DOCUMENT_TEMPLATES } from './constants'
import { getPatientName, getPatientNameKana, countApplicableItems } from './helpers'
import { Button, Card, IconChevronLeft } from './ui-components'
import { generatePdfBlobFromHtml } from './pdf-generator'
import { uploadDocumentPdf } from './document-actions'
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

type DocumentDataInput = {
  patient?: Patient
  clinic?: { name: string; address: string; phone: string; representative: string }
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
  pdfUrl?: string
}

type DocumentCreatePageProps = {
  documentType: string
  documentData: DocumentDataInput
  onBack: () => void
  onSave?: (data: SavedDocData) => void
}


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
    const statusMap: Array<{ value: string; applicable: boolean }> = [
      { value: r.tongueCoatingPercent ? `${r.tongueCoatingPercent}%` : '', applicable: r.tongueCoatingApplicable },
      { value: r.oralMoistureValue || '', applicable: r.oralDrynessApplicable },
      { value: r.remainingTeeth ? `${r.remainingTeeth}本` : '', applicable: r.biteForceApplicable },
      { value: r.oralDiadochoPa ? `${r.oralDiadochoPa}回/秒` : '', applicable: r.oralMotorApplicable },
      { value: r.oralDiadochoTa ? `${r.oralDiadochoTa}回/秒` : '', applicable: r.oralMotorApplicable },
      { value: r.oralDiadochoKa ? `${r.oralDiadochoKa}回/秒` : '', applicable: r.oralMotorApplicable },
      { value: r.tonguePressureKPa ? `${r.tonguePressureKPa}kPa` : '', applicable: r.tonguePressureApplicable },
      { value: r.masticatoryAbilityMgDl ? `${r.masticatoryAbilityMgDl}mg/dL` : '', applicable: r.masticatoryApplicable },
      { value: r.swallowingEAT10Score ? `${r.swallowingEAT10Score}点` : '', applicable: r.swallowingApplicable },
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

export const DocumentCreatePage = ({ documentType, documentData, onBack, onSave }: DocumentCreatePageProps) => {
  const template = DOCUMENT_TEMPLATES[documentType] as DocumentTemplate | undefined
  const { patient, clinic, dhSeconds, visitCondition, oralFindings, treatment, nextPlan, facility, doctorName, treatmentPerformed } =
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

  /** 保存用のコンテンツを取得 */
  const getContentForSave = (): Record<string, unknown> => {
    if (documentType === 'doc_houmon_chiryou') return treatmentData as unknown as Record<string, unknown>
    if (documentType === 'doc_kanrikeikaku') return kanriData as unknown as Record<string, unknown>
    if (documentType === 'doc_houeishi') return hygieneData as unknown as Record<string, unknown>
    if (documentType === 'doc_seimitsu_kensa') return seimitsuData as unknown as Record<string, unknown>
    if (documentType === 'doc_koukuu_kanri') return oralFunctionPlanData as unknown as Record<string, unknown>
    if (documentType === 'doc_kouei_kanri') return oralHygieneData as unknown as Record<string, unknown>
    return {} as Record<string, unknown>
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
      if (!previewRef.current) {
        setUploadStatus('idle')
        return
      }
      const blob = await generatePdfBlobFromHtml(previewRef.current)
      const arrayBuffer = await blob.arrayBuffer()
      const bytes = new Uint8Array(arrayBuffer)
      let binary = ''
      const chunkSize = 8192
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
      }
      const base64 = btoa(binary)
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

  // 保存処理（PDF生成→Blobアップロード→onSaveにURL付きで返す）
  const handleSaveDocument = async () => {
    if (pdfGenerating) return
    setPdfGenerating(true)
    try {
      let pdfUrl = ''
      if (previewRef.current) {
        const blob = await generatePdfBlobFromHtml(previewRef.current)
        const arrayBuffer = await blob.arrayBuffer()
        const bytes = new Uint8Array(arrayBuffer)
        let binary = ''
        const chunkSize = 8192
        for (let i = 0; i < bytes.length; i += chunkSize) {
          binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
        }
        const base64 = btoa(binary)
        const result = await uploadDocumentPdf(base64, {
          clinicId: 1,
          facilityId: facility?.id || 0,
          patientId: patient?.id || 0,
          examinationId: 0,
          documentType,
          documentName: template?.name || '',
          visitDate: new Date().toISOString().slice(0, 10),
        })
        pdfUrl = result.url
      }
      if (onSave) {
        onSave({
          documentType,
          content: getContentForSave(),
          createdAt: new Date().toISOString(),
          pdfUrl,
        })
      }
      onBack()
    } catch (e) {
      console.error('PDF保存失敗:', e)
    } finally {
      setPdfGenerating(false)
    }
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
          <Button variant="primary" onClick={handleDownloadPdfFromHtml} disabled={pdfGenerating}>
            {pdfGenerating ? 'PDF生成中...' : 'PDFダウンロード'}
          </Button>
          <Button onClick={handleUploadPdf}>
            {uploadStatus === 'uploading' ? 'アップロード中...' : uploadStatus === 'done' ? '保存済み' : 'Blobに保存'}
          </Button>
          <Button onClick={handlePrint}>
            印刷
          </Button>
          <Button variant="success" onClick={handleSaveDocument} disabled={pdfGenerating}>
            {pdfGenerating ? 'PDF保存中...' : '保存して閉じる'}
          </Button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex justify-center p-4 print:p-0 print:block">
        <div className="flex-1 print:w-full">
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
        </div>
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

export const DocumentListPage = ({ documents, facilities, onMergePdfs }: DocumentListPageProps) => {
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
