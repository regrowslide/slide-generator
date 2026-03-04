'use server'

import {put, list, del} from '@vercel/blob'

// =============================================================================
// 型定義
// =============================================================================

type DocumentMetadata = {
  clinicId: number
  facilityId: number
  patientId: number
  examinationId: number
  documentType: string
  documentName: string
  visitDate: string
}

type SavedDocumentRecord = {
  url: string
  pathname: string
  documentType: string
  documentName: string
  patientId: number
  facilityId: number
  examinationId: number
  visitDate: string
  createdAt: string
}

type DocumentFilter = {
  clinicId?: number
  facilityId?: number
  patientId?: number
  examinationId?: number
  documentType?: string
}

// =============================================================================
// Server Actions
// =============================================================================

/**
 * PDFをVercel Blobにアップロード
 * パス規則: dental/{clinicId}/{patientId}_{examId}_{docType}.pdf（固定パスで上書き可能）
 */
export const uploadDocumentPdf = async (pdfBase64: string, metadata: DocumentMetadata): Promise<SavedDocumentRecord> => {
  const now = new Date()
  const pathname = `dental/${metadata.clinicId}/${metadata.patientId}_${metadata.examinationId}_${metadata.documentType}.pdf`

  // Base64をBufferに変換
  const buffer = Buffer.from(pdfBase64, 'base64')

  const blob = await put(pathname, buffer, {
    access: 'public',
    contentType: 'application/pdf',
    allowOverwrite: true,
  })

  return {
    url: blob.url,
    pathname: blob.pathname,
    documentType: metadata.documentType,
    documentName: metadata.documentName,
    patientId: metadata.patientId,
    facilityId: metadata.facilityId,
    examinationId: metadata.examinationId,
    visitDate: metadata.visitDate,
    createdAt: now.toISOString(),
  }
}

/**
 * 保存済みPDF一覧を取得（プレフィックスでフィルタ）
 */
export const getDocumentPdfs = async (filter: DocumentFilter): Promise<SavedDocumentRecord[]> => {
  let prefix = 'dental/'
  if (filter.clinicId) prefix += `${filter.clinicId}/`

  const {blobs} = await list({prefix})

  return blobs.map(b => ({
    url: b.url,
    pathname: b.pathname,
    documentType: extractDocType(b.pathname),
    documentName: '',
    patientId: filter.patientId || 0,
    facilityId: filter.facilityId || 0,
    examinationId: filter.examinationId || 0,
    visitDate: '',
    createdAt: b.uploadedAt.toISOString(),
  }))
}

/**
 * PDFを削除
 */
export const deleteDocumentPdf = async (url: string): Promise<void> => {
  await del(url)
}

// =============================================================================
// ヘルパー
// =============================================================================

/** パス名から文書タイプを抽出 */
const extractDocType = (pathname: string): string => {
  const fileName = pathname.split('/').pop() || ''
  const docType = fileName.split('_')[0] || ''
  return docType
}
