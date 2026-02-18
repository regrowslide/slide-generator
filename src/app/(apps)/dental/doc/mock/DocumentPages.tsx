import {useState} from 'react'

import {DOCUMENT_TEMPLATES} from './constants'
import {getPatientName, getPatientNameKana} from './helpers'
import {Button, Card, TextArea, IconChevronLeft} from './ui-components'
import {PdfDownloadButton} from './pdf-generator'
import {uploadDocumentPdf} from './document-actions'
import type {Patient, Facility, DocumentTemplate, SavedDocumentEntry} from './types'

// =============================================================================
// Props型定義
// =============================================================================

type DocumentContent = {
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
}

type SavedDocData = {
  documentType: string
  content: DocumentContent
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

type KanriKeikakuPreviewProps = {
  content: DocumentContent
}

type HoueishiPreviewProps = {
  content: DocumentContent
}

// =============================================================================
// DocumentCreatePage
// =============================================================================

export const DocumentCreatePage = ({documentType, documentData, onBack, onSave}: DocumentCreatePageProps) => {
  const template = DOCUMENT_TEMPLATES[documentType] as DocumentTemplate | undefined
  const {patient, clinic, dhSeconds, visitCondition, oralFindings, treatment, nextPlan, facility, doctorName, treatmentPerformed} =
    documentData || {}

  // 手動入力項目の状態
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    if (documentType === 'doc_kanrikeikaku') {
      return {managementPlan: '', oralHygieneGoal: ''} as Record<string, string>
    } else if (documentType === 'doc_houeishi') {
      return {guidanceContent: '', homeCareMethod: '', nextGuidancePlan: ''} as Record<string, string>
    } else if (documentType === 'doc_shizaikan_bunsho') {
      return {familyExplanation: ''} as Record<string, string>
    } else if (documentType === 'doc_zaishikan') {
      return {managementPolicy: ''} as Record<string, string>
    }
    return {}
  })

  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'done'>('idle')

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({...prev, [field]: value}))
  }

  // 文書データの集約
  const getDocumentContent = (): DocumentContent => {
    const dhMinutes = Math.floor((dhSeconds || 0) / 60)
    const today = new Date()
    const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`

    return {
      // 医院情報
      clinicName: clinic?.name || '',
      clinicAddress: clinic?.address || '',
      clinicPhone: clinic?.phone || '',
      representative: clinic?.representative || '',
      // 施設情報
      facilityName: facility?.name || '',
      facilityAddress: facility?.address || '',
      // 患者情報
      patientName: patient ? getPatientName(patient) : '',
      patientNameKana: patient ? getPatientNameKana(patient) : '',
      patientBuilding: patient?.building || '',
      patientFloor: patient?.floor || '',
      patientRoom: patient?.room || '',
      teethCount: patient?.teethCount || 0,
      hasDenture: patient?.hasDenture ? 'あり' : 'なし',
      hasOralHypofunction: patient?.hasOralHypofunction ? 'あり' : 'なし',
      // 診察情報
      visitCondition: visitCondition || '',
      oralFindings: oralFindings || '',
      treatment: treatment || '',
      nextPlan: nextPlan || '',
      dhMinutes,
      // 担当医
      doctorName: doctorName || '',
      // 疾患情報
      diseases: patient?.diseases
        ? Object.entries(patient.diseases)
            .filter(([, v]) => v)
            .map(([k]) => k)
        : [],
      // 実施治療
      treatmentPerformed: treatmentPerformed || [],
      // 日付
      createdAt: dateStr,
      // 手動入力項目
      ...formData,
    }
  }

  const content = getDocumentContent()

  // 印刷
  const handlePrint = () => {
    window.print()
  }

  // Vercel Blobにアップロード
  const handleUploadPdf = async () => {
    if (uploadStatus === 'uploading') return
    setUploadStatus('uploading')
    try {
      const {generatePdfBlob} = await import('./pdf-generator')
      const blob = await generatePdfBlob(documentType, content as unknown as Record<string, unknown>)
      // BlobをBase64に変換
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
        content,
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
          <PdfDownloadButton
            documentType={documentType}
            content={content}
            fileName={`${template.name}_${content.patientName || ''}.pdf`}
          />
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
      <div className="flex gap-4 p-4 print:p-0 print:block">
        {/* 左側: 入力フォーム */}
        <div className="w-1/3 space-y-4 print:hidden">
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3 border-b pb-2">自動流し込み項目</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">医療機関名:</span>
                <span className="ml-2 text-gray-900">{content.clinicName}</span>
              </div>
              <div>
                <span className="text-gray-500">患者氏名:</span>
                <span className="ml-2 text-gray-900">{content.patientName}</span>
              </div>
              <div>
                <span className="text-gray-500">ふりがな:</span>
                <span className="ml-2 text-gray-900">{content.patientNameKana}</span>
              </div>
              {documentType === 'doc_kanrikeikaku' && (
                <>
                  <div>
                    <span className="text-gray-500">歯数:</span>
                    <span className="ml-2 text-gray-900">{content.teethCount}歯</span>
                  </div>
                  <div>
                    <span className="text-gray-500">義歯:</span>
                    <span className="ml-2 text-gray-900">{content.hasDenture}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">口腔機能低下症:</span>
                    <span className="ml-2 text-gray-900">{content.hasOralHypofunction}</span>
                  </div>
                </>
              )}
              {documentType === 'doc_houeishi' && (
                <div>
                  <span className="text-gray-500">DH施術時間:</span>
                  <span className="ml-2 text-gray-900">{content.dhMinutes}分</span>
                </div>
              )}
              {documentType === 'doc_houmon_jisseki' && (
                <>
                  <div>
                    <span className="text-gray-500">施設名:</span>
                    <span className="ml-2 text-gray-900">{content.facilityName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">担当医:</span>
                    <span className="ml-2 text-gray-900">{content.doctorName || '（未設定）'}</span>
                  </div>
                </>
              )}
              {documentType === 'doc_zaishikan' && (
                <>
                  <div>
                    <span className="text-gray-500">基礎疾患:</span>
                    <span className="ml-2 text-gray-900">
                      {content.diseases?.length ? content.diseases.join(', ') : '（なし）'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">実施治療:</span>
                    <span className="ml-2 text-gray-900">
                      {content.treatmentPerformed?.length ? content.treatmentPerformed.join(', ') : '（なし）'}
                    </span>
                  </div>
                </>
              )}
              <div>
                <span className="text-gray-500">作成日:</span>
                <span className="ml-2 text-gray-900">{content.createdAt}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3 border-b pb-2">診察記録からの流し込み</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500 block">訪問時の様子:</span>
                <span className="text-gray-900 text-xs">{content.visitCondition || '（未入力）'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">口腔内所見:</span>
                <span className="text-gray-900 text-xs">{content.oralFindings || '（未入力）'}</span>
              </div>
              {(documentType === 'doc_kanrikeikaku' || documentType === 'doc_shizaikan_bunsho') && (
                <>
                  <div>
                    <span className="text-gray-500 block">処置:</span>
                    <span className="text-gray-900 text-xs">{content.treatment || '（未入力）'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">次回予定:</span>
                    <span className="text-gray-900 text-xs">{content.nextPlan || '（未入力）'}</span>
                  </div>
                </>
              )}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3 border-b pb-2">手動入力項目</h3>
            <div className="space-y-4">
              {documentType === 'doc_houmon_jisseki' && (
                <p className="text-sm text-gray-500">この文書は自動流し込みのみで作成されます。手動入力項目はありません。</p>
              )}
              {documentType === 'doc_kanrikeikaku' && (
                <>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">管理計画（今後の方針）</label>
                    <TextArea
                      value={formData.managementPlan}
                      onChange={(v: string) => handleFormChange('managementPlan', v)}
                      placeholder="例: 義歯の安定を図り、口腔機能の維持・向上を目指す..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">口腔衛生目標</label>
                    <TextArea
                      value={formData.oralHygieneGoal}
                      onChange={(v: string) => handleFormChange('oralHygieneGoal', v)}
                      placeholder="例: PCR 30%以下を維持..."
                      rows={2}
                    />
                  </div>
                </>
              )}
              {documentType === 'doc_houeishi' && (
                <>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">指導内容</label>
                    <TextArea
                      value={formData.guidanceContent}
                      onChange={(v: string) => handleFormChange('guidanceContent', v)}
                      placeholder="例: 口腔清掃指導、義歯の取り扱い説明..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">家庭でのケア方法</label>
                    <TextArea
                      value={formData.homeCareMethod}
                      onChange={(v: string) => handleFormChange('homeCareMethod', v)}
                      placeholder="例: 食後の歯磨き、義歯の毎日洗浄..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">次回指導予定</label>
                    <TextArea
                      value={formData.nextGuidancePlan}
                      onChange={(v: string) => handleFormChange('nextGuidancePlan', v)}
                      placeholder="例: 1週間後、継続して口腔ケア指導..."
                      rows={2}
                    />
                  </div>
                </>
              )}
              {documentType === 'doc_shizaikan_bunsho' && (
                <div>
                  <label className="block text-xs text-gray-600 mb-1">患者・ご家族への説明内容</label>
                  <TextArea
                    value={formData.familyExplanation}
                    onChange={(v: string) => handleFormChange('familyExplanation', v)}
                    placeholder="例: 管理計画の内容をご家族にわかりやすく説明..."
                    rows={4}
                  />
                </div>
              )}
              {documentType === 'doc_zaishikan' && (
                <div>
                  <label className="block text-xs text-gray-600 mb-1">管理方針</label>
                  <TextArea
                    value={formData.managementPolicy}
                    onChange={(v: string) => handleFormChange('managementPolicy', v)}
                    placeholder="例: 基礎疾患を考慮した治療方針、注意事項..."
                    rows={4}
                  />
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* 右側: プレビュー */}
        <div className="flex-1 print:w-full">
          {documentType === 'doc_kanrikeikaku' && <KanriKeikakuPreview content={content} />}
          {documentType === 'doc_houeishi' && <HoueishiPreview content={content} />}
          {documentType === 'doc_houmon_jisseki' && <HoumonJissekiPreview content={content} />}
          {documentType === 'doc_shizaikan_bunsho' && <ShizaikanBunshoPreview content={content} />}
          {documentType === 'doc_zaishikan' && <ZaishikanPreview content={content} />}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// KanriKeikakuPreview - 管理計画書プレビューコンポーネント
// =============================================================================

export const KanriKeikakuPreview = ({content}: KanriKeikakuPreviewProps) => {
  return (
    <div
      className="bg-white shadow-lg mx-auto print:shadow-none print:mx-0"
      style={{width: '210mm', minHeight: '297mm', padding: '15mm'}}
    >
      {/* タイトル */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold border-b-2 border-black pb-2 inline-block">歯科疾患在宅療養管理計画書</h1>
        <p className="text-sm text-gray-600 mt-2">作成日: {content.createdAt}</p>
      </div>

      {/* 医療機関情報 */}
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">医療機関情報</div>
        <div className="p-3 text-sm space-y-1">
          <div className="flex">
            <span className="w-24 text-gray-600">医療機関名:</span>
            <span>{content.clinicName}</span>
          </div>
          <div className="flex">
            <span className="w-24 text-gray-600">住所:</span>
            <span>{content.clinicAddress}</span>
          </div>
          <div className="flex">
            <span className="w-24 text-gray-600">電話番号:</span>
            <span>{content.clinicPhone}</span>
          </div>
          <div className="flex">
            <span className="w-24 text-gray-600">管理者:</span>
            <span>{content.representative}</span>
          </div>
        </div>
      </div>

      {/* 患者情報 */}
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">患者情報</div>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-gray-300">
              <td className="px-3 py-2 w-24 bg-gray-50 text-gray-600">氏名</td>
              <td className="px-3 py-2">{content.patientName}</td>
              <td className="px-3 py-2 w-24 bg-gray-50 text-gray-600">ふりがな</td>
              <td className="px-3 py-2">{content.patientNameKana}</td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="px-3 py-2 bg-gray-50 text-gray-600">建物</td>
              <td className="px-3 py-2">{content.patientBuilding}</td>
              <td className="px-3 py-2 bg-gray-50 text-gray-600">部屋</td>
              <td className="px-3 py-2">
                {content.patientFloor}-{content.patientRoom}
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2 bg-gray-50 text-gray-600">歯数</td>
              <td className="px-3 py-2">{content.teethCount}歯</td>
              <td className="px-3 py-2 bg-gray-50 text-gray-600">義歯</td>
              <td className="px-3 py-2">{content.hasDenture}</td>
            </tr>
          </tbody>
        </table>
        <div className="px-3 py-2 border-t border-gray-300 text-sm">
          <span className="text-gray-600">口腔機能低下症: </span>
          <span className={content.hasOralHypofunction === 'あり' ? 'font-medium text-red-600' : ''}>
            {content.hasOralHypofunction}
          </span>
        </div>
      </div>

      {/* 口腔内所見 */}
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">口腔内所見</div>
        <div className="p-3 text-sm min-h-[60px] whitespace-pre-wrap">{content.oralFindings || '（記載なし）'}</div>
      </div>

      {/* 処置内容 */}
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">処置内容</div>
        <div className="p-3 text-sm min-h-[60px] whitespace-pre-wrap">{content.treatment || '（記載なし）'}</div>
      </div>

      {/* 管理計画 */}
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">管理計画（今後の方針）</div>
        <div className="p-3 text-sm min-h-[80px] whitespace-pre-wrap">{content.managementPlan || '（入力してください）'}</div>
      </div>

      {/* 口腔衛生目標 */}
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">口腔衛生目標</div>
        <div className="p-3 text-sm min-h-[60px] whitespace-pre-wrap">{content.oralHygieneGoal || '（入力してください）'}</div>
      </div>

      {/* 次回予定 */}
      <div className="border border-gray-400">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">次回診療予定</div>
        <div className="p-3 text-sm whitespace-pre-wrap">{content.nextPlan || '（記載なし）'}</div>
      </div>
    </div>
  )
}

// =============================================================================
// HoueishiPreview - 訪問歯科衛生指導説明書プレビューコンポーネント
// =============================================================================

export const HoueishiPreview = ({content}: HoueishiPreviewProps) => {
  return (
    <div
      className="bg-white shadow-lg mx-auto print:shadow-none print:mx-0"
      style={{width: '210mm', minHeight: '297mm', padding: '15mm'}}
    >
      {/* タイトル */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold border-b-2 border-black pb-2 inline-block">訪問歯科衛生指導説明書</h1>
        <p className="text-sm text-gray-600 mt-2">指導日: {content.createdAt}</p>
      </div>

      {/* 医療機関・患者情報 */}
      <div className="border border-gray-400 mb-4">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-gray-300">
              <td className="px-3 py-2 w-28 bg-gray-50 text-gray-600">医療機関名</td>
              <td className="px-3 py-2" colSpan={3}>
                {content.clinicName}
              </td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="px-3 py-2 bg-gray-50 text-gray-600">患者氏名</td>
              <td className="px-3 py-2">{content.patientName}</td>
              <td className="px-3 py-2 w-24 bg-gray-50 text-gray-600">ふりがな</td>
              <td className="px-3 py-2">{content.patientNameKana}</td>
            </tr>
            <tr>
              <td className="px-3 py-2 bg-gray-50 text-gray-600">指導時間</td>
              <td className="px-3 py-2" colSpan={3}>
                <span className="font-medium">{content.dhMinutes}分</span>
                {content.dhMinutes >= 20 && <span className="ml-2 text-xs text-emerald-600">（20分以上）</span>}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 訪問時の様子 */}
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">訪問時の様子</div>
        <div className="p-3 text-sm min-h-[60px] whitespace-pre-wrap">{content.visitCondition || '（記載なし）'}</div>
      </div>

      {/* 口腔内所見 */}
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">口腔内所見</div>
        <div className="p-3 text-sm min-h-[60px] whitespace-pre-wrap">{content.oralFindings || '（記載なし）'}</div>
      </div>

      {/* 指導内容 */}
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">指導内容</div>
        <div className="p-3 text-sm min-h-[100px] whitespace-pre-wrap">{content.guidanceContent || '（入力してください）'}</div>
      </div>

      {/* 家庭でのケア方法 */}
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">ご家庭でのケア方法</div>
        <div className="p-3 text-sm min-h-[100px] whitespace-pre-wrap">{content.homeCareMethod || '（入力してください）'}</div>
      </div>

      {/* 次回指導予定 */}
      <div className="border border-gray-400">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">次回指導予定</div>
        <div className="p-3 text-sm whitespace-pre-wrap">{content.nextGuidancePlan || '（入力してください）'}</div>
      </div>

      {/* フッター */}
      <div className="mt-8 text-sm text-gray-600 text-center">
        <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
        <p className="mt-1">{content.clinicName}</p>
      </div>
    </div>
  )
}

// =============================================================================
// HoumonJissekiPreview - 歯科訪問診療実績表プレビューコンポーネント
// =============================================================================

const HoumonJissekiPreview = ({content}: {content: DocumentContent}) => {
  return (
    <div
      className="bg-white shadow-lg mx-auto print:shadow-none print:mx-0"
      style={{width: '210mm', minHeight: '297mm', padding: '15mm'}}
    >
      {/* タイトル */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold border-b-2 border-black pb-2 inline-block">歯科訪問診療実績表</h1>
        <p className="text-sm text-gray-600 mt-2">作成日: {content.createdAt}</p>
      </div>

      {/* 医療機関情報 */}
      <div className="border border-gray-400 mb-4">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-gray-300">
              <td className="px-3 py-2 w-28 bg-gray-50 text-gray-600">医療機関名</td>
              <td className="px-3 py-2" colSpan={3}>
                {content.clinicName}
              </td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="px-3 py-2 bg-gray-50 text-gray-600">施設名</td>
              <td className="px-3 py-2">{content.facilityName}</td>
              <td className="px-3 py-2 w-24 bg-gray-50 text-gray-600">施設住所</td>
              <td className="px-3 py-2">{content.facilityAddress}</td>
            </tr>
            <tr>
              <td className="px-3 py-2 bg-gray-50 text-gray-600">歯科医師名</td>
              <td className="px-3 py-2" colSpan={3}>
                {content.doctorName || '（未設定）'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 訪問診療実績一覧（テンプレート） */}
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
            {/* 現在の患者を1行目に表示 */}
            <tr>
              <td className="border-b border-r border-gray-300 px-3 py-2 text-center">1</td>
              <td className="border-b border-r border-gray-300 px-3 py-2">{content.patientName}</td>
              <td className="border-b border-r border-gray-300 px-3 py-2">{content.createdAt}</td>
              <td className="border-b border-r border-gray-300 px-3 py-2">-</td>
              <td className="border-b border-gray-300 px-3 py-2">{content.treatment || '-'}</td>
            </tr>
            {/* 空行（他の患者用） */}
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

      {/* 備考欄 */}
      <div className="border border-gray-400">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">備考</div>
        <div className="p-3 text-sm min-h-[60px]">&nbsp;</div>
      </div>
    </div>
  )
}

// =============================================================================
// ShizaikanBunshoPreview - 管理計画説明文書プレビューコンポーネント
// =============================================================================

const ShizaikanBunshoPreview = ({content}: {content: DocumentContent}) => {
  return (
    <div
      className="bg-white shadow-lg mx-auto print:shadow-none print:mx-0"
      style={{width: '210mm', minHeight: '297mm', padding: '15mm'}}
    >
      {/* タイトル */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold border-b-2 border-black pb-2 inline-block">歯科疾患在宅療養管理計画 説明文書</h1>
        <p className="text-sm text-gray-600 mt-2">作成日: {content.createdAt}</p>
      </div>

      {/* 医療機関・患者情報 */}
      <div className="border border-gray-400 mb-4">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-gray-300">
              <td className="px-3 py-2 w-28 bg-gray-50 text-gray-600">医療機関名</td>
              <td className="px-3 py-2" colSpan={3}>
                {content.clinicName}
              </td>
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

      {/* 口腔内所見（要約） */}
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">口腔内の状態</div>
        <div className="p-3 text-sm min-h-[60px] whitespace-pre-wrap">{content.oralFindings || '（記載なし）'}</div>
      </div>

      {/* 処置内容 */}
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">本日の処置内容</div>
        <div className="p-3 text-sm min-h-[60px] whitespace-pre-wrap">{content.treatment || '（記載なし）'}</div>
      </div>

      {/* 管理計画 */}
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">今後の管理計画</div>
        <div className="p-3 text-sm min-h-[80px] whitespace-pre-wrap">{content.managementPlan || '（記載なし）'}</div>
      </div>

      {/* 患者・ご家族への説明 */}
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">
          患者様・ご家族への説明内容
        </div>
        <div className="p-3 text-sm min-h-[100px] whitespace-pre-wrap">
          {content.familyExplanation || '（入力してください）'}
        </div>
      </div>

      {/* 次回予定 */}
      <div className="border border-gray-400">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">次回診療予定</div>
        <div className="p-3 text-sm whitespace-pre-wrap">{content.nextPlan || '（記載なし）'}</div>
      </div>

      {/* フッター */}
      <div className="mt-8 text-sm text-gray-600 text-center">
        <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
        <p className="mt-1">{content.clinicName}</p>
      </div>
    </div>
  )
}

// =============================================================================
// ZaishikanPreview - 在歯管報告書プレビューコンポーネント
// =============================================================================

const ZaishikanPreview = ({content}: {content: DocumentContent}) => {
  return (
    <div
      className="bg-white shadow-lg mx-auto print:shadow-none print:mx-0"
      style={{width: '210mm', minHeight: '297mm', padding: '15mm'}}
    >
      {/* タイトル */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold border-b-2 border-black pb-2 inline-block">
          在宅患者歯科治療総合医療管理報告書
        </h1>
        <p className="text-sm text-gray-600 mt-2">作成日: {content.createdAt}</p>
      </div>

      {/* 医療機関・患者情報 */}
      <div className="border border-gray-400 mb-4">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-gray-300">
              <td className="px-3 py-2 w-28 bg-gray-50 text-gray-600">医療機関名</td>
              <td className="px-3 py-2" colSpan={3}>
                {content.clinicName}
              </td>
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

      {/* 基礎疾患 */}
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">基礎疾患</div>
        <div className="p-3 text-sm min-h-[40px]">
          {content.diseases?.length ? (
            <div className="flex flex-wrap gap-2">
              {content.diseases.map(d => (
                <span key={d} className="px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded text-xs">
                  {d}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-400">（基礎疾患の登録なし）</span>
          )}
        </div>
      </div>

      {/* 実施した治療 */}
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

      {/* 口腔内所見 */}
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">口腔内所見</div>
        <div className="p-3 text-sm min-h-[60px] whitespace-pre-wrap">{content.oralFindings || '（記載なし）'}</div>
      </div>

      {/* 管理方針 */}
      <div className="border border-gray-400">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">管理方針</div>
        <div className="p-3 text-sm min-h-[100px] whitespace-pre-wrap">
          {content.managementPolicy || '（入力してください）'}
        </div>
      </div>

      {/* フッター */}
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
}

export const DocumentListPage = ({documents, facilities}: DocumentListPageProps) => {
  const [filterFacility, setFilterFacility] = useState<string>('')
  const [filterDocType, setFilterDocType] = useState<string>('')
  const [filterMonth, setFilterMonth] = useState<string>('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // フィルタリング
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

  const handleBulkDownload = () => {
    // PDF URLがある文書を個別にダウンロード
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
