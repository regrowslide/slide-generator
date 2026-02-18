'use client'

import React from 'react'
import {pdf} from '@react-pdf/renderer'
import {PDFDownloadLink} from '@react-pdf/renderer'
import {PDF_TEMPLATE_MAP} from './pdf-templates'
import {Button} from './ui-components'

// =============================================================================
// PDF生成関数（Blob返却）
// =============================================================================

type DocumentContent = Record<string, unknown>

/**
 * 文書タイプとコンテンツからPDF Blobを生成
 */
export const generatePdfBlob = async (documentType: string, content: DocumentContent): Promise<Blob> => {
  const TemplateComponent = PDF_TEMPLATE_MAP[documentType]
  if (!TemplateComponent) {
    throw new Error(`PDF template not found: ${documentType}`)
  }
  const blob = await pdf(<TemplateComponent content={content as never} />).toBlob()
  return blob
}

// =============================================================================
// PDFダウンロードリンクコンポーネント
// =============================================================================

type PdfDownloadButtonProps = {
  documentType: string
  content: Record<string, unknown>
  fileName: string
}

export const PdfDownloadButton = ({documentType, content, fileName}: PdfDownloadButtonProps) => {
  const TemplateComponent = PDF_TEMPLATE_MAP[documentType]
  if (!TemplateComponent) return null

  return (
    <PDFDownloadLink document={<TemplateComponent content={content as never} />} fileName={fileName}>
      {({loading}) => (
        <Button variant="primary" disabled={loading}>
          {loading ? 'PDF生成中...' : 'PDFダウンロード'}
        </Button>
      )}
    </PDFDownloadLink>
  )
}
