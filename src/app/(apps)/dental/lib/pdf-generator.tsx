'use client'

// =============================================================================
// PDF生成関数（HTML→PDF方式に統一）
// =============================================================================

/**
 * HTMLプレビュー要素からPDF Blobを生成（html2canvas + jsPDF版）
 * HTMLプレビューをそのままキャプチャするため、フォーマットずれが発生しない
 */
export const generatePdfBlobFromHtml = async (element: HTMLElement): Promise<Blob> => {
  const html2canvas = (await import('html2canvas-pro')).default
  const {jsPDF} = await import('jspdf')

  // キャプチャ対象: ref内のPageWrapper（A4サイズのdiv）を探す
  // PageWrapperは style="width: 210mm" を持つ最初の子要素
  const pageEl = element.querySelector<HTMLElement>('[style*="210mm"]') || element

  // print:hidden要素を一時非表示にする
  const hiddenEls: HTMLElement[] = []
  pageEl.querySelectorAll<HTMLElement>('.print\\:hidden').forEach(el => {
    hiddenEls.push(el)
    el.style.display = 'none'
  })

  // shadow-lgを一時的に除去（PDFに影が入らないように）
  const shadowEl = pageEl.classList.contains('shadow-lg') ? pageEl : pageEl.querySelector<HTMLElement>('.shadow-lg')
  if (shadowEl) shadowEl.classList.remove('shadow-lg')

  try {
    const canvas = await html2canvas(pageEl, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })

    const pdfDoc = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdfDoc.internal.pageSize.getWidth()
    const pdfHeight = pdfDoc.internal.pageSize.getHeight()

    // JPEG形式を使用（jsPDFとの互換性が高い）
    const imgData = canvas.toDataURL('image/jpeg', 0.95)

    // A4全幅に合わせ、高さはアスペクト比を維持
    const contentHeight = (canvas.height / canvas.width) * pdfWidth

    // 常に1ページに収める（A4高さに切り詰め）
    pdfDoc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(contentHeight, pdfHeight))

    return pdfDoc.output('blob')
  } finally {
    // 一時変更を元に戻す
    hiddenEls.forEach(el => { el.style.display = '' })
    if (shadowEl) shadowEl.classList.add('shadow-lg')
  }
}
