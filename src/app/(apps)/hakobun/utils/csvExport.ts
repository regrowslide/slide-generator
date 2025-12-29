import { TableRow, AnalysisResult, PendingGeneralCategory, PendingCategory } from '../types'

/**
 * CSVエクスポート用のデータを生成
 */
export interface CsvExportData {
  /** Voiceデータ */
  voices: Array<{
    voice_id: string
    raw_text: string
  }>
  /** Correctionデータ */
  corrections: Array<{
    voice_id: string
    extract_index: number
    original_sentence: string
    original_general_category?: string
    original_category?: string
    original_sentiment?: string
    correct_general_category?: string
    correct_category: string
    correct_sentiment: string
    reviewer_comment?: string
  }>
  /** 新規作成された一般カテゴリ */
  newGeneralCategories: Array<{
    name: string
    description?: string
  }>
  /** 新規作成されたカテゴリ */
  newCategories: Array<{
    general_category_name: string
    name: string
    description?: string
  }>
}

/**
 * CSV文字列を生成
 */
export function generateCsv(data: CsvExportData): string {
  const lines: string[] = []

  // BOMを追加（Excelで文字化けしないように）
  lines.push('\ufeff')

  // ヘッダー: Voiceデータ
  if (data.voices.length > 0) {
    lines.push('=== Voiceデータ ===')
    lines.push('voice_id,raw_text')
    data.voices.forEach(voice => {
      const rawText = escapeCsvField(voice.raw_text)
      lines.push(`${voice.voice_id},${rawText}`)
    })
    lines.push('')
  }

  // ヘッダー: Correctionデータ
  if (data.corrections.length > 0) {
    lines.push('=== 修正データ ===')
    lines.push(
      'voice_id,extract_index,original_sentence,original_general_category,original_category,original_sentiment,correct_general_category,correct_category,correct_sentiment,reviewer_comment'
    )
    data.corrections.forEach(correction => {
      const originalSentence = escapeCsvField(correction.original_sentence)
      const reviewerComment = escapeCsvField(correction.reviewer_comment || '')
      lines.push(
        `${correction.voice_id},${correction.extract_index},${originalSentence},${correction.original_general_category || ''},${correction.original_category || ''},${correction.original_sentiment || ''},${correction.correct_general_category || ''},${correction.correct_category},${correction.correct_sentiment},${reviewerComment}`
      )
    })
    lines.push('')
  }

  // ヘッダー: 新規一般カテゴリ
  if (data.newGeneralCategories.length > 0) {
    lines.push('=== 新規一般カテゴリ ===')
    lines.push('name,description')
    data.newGeneralCategories.forEach(gc => {
      const description = escapeCsvField(gc.description || '')
      lines.push(`${gc.name},${description}`)
    })
    lines.push('')
  }

  // ヘッダー: 新規カテゴリ
  if (data.newCategories.length > 0) {
    lines.push('=== 新規カテゴリ ===')
    lines.push('general_category_name,name,description')
    data.newCategories.forEach(cat => {
      const description = escapeCsvField(cat.description || '')
      lines.push(`${cat.general_category_name},${cat.name},${description}`)
    })
    lines.push('')
  }

  return lines.join('\n')
}

/**
 * CSVフィールドをエスケープ
 */
function escapeCsvField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`
  }
  return field
}

/**
 * CSVファイルをダウンロード
 */
export function downloadCsv(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * tableRowsとresultsからCSVエクスポート用データを生成
 */
export function prepareCsvData(
  tableRows: TableRow[],
  results: AnalysisResult[],
  savedGeneralCategories: PendingGeneralCategory[],
  savedCategories: PendingCategory[]
): CsvExportData {
  // Voiceデータ（重複除去）
  const voiceMap = new Map<string, string>()
  results.forEach(result => {
    const firstExtract = result.extracts[0]
    if (firstExtract?.raw_text) {
      voiceMap.set(result.voice_id, firstExtract.raw_text)
    }
  })

  // Correctionデータ（修正があったもののみ）
  const corrections = tableRows
    .filter(row => row.isModified)
    .map(row => ({
      voice_id: row.voiceId,
      extract_index: row.extractIndex,
      original_sentence: row.extract.sentence,
      original_general_category: row.extract.general_category || undefined,
      original_category: row.extract.category || undefined,
      original_sentiment: row.extract.sentiment || undefined,
      correct_general_category: row.feedbackGeneralCategory || undefined,
      correct_category: row.feedbackCategory,
      correct_sentiment: row.feedbackSentiment,
      reviewer_comment: row.feedbackComment || undefined,
    }))

  // 新規作成された一般カテゴリ
  const newGeneralCategories = savedGeneralCategories.map(pgc => ({
    name: pgc.name,
    description: pgc.description,
  }))

  // 新規作成されたカテゴリ
  const newCategories = savedCategories.map(pc => ({
    general_category_name: pc.generalCategoryName,
    name: pc.name,
    description: pc.description,
  }))

  return {
    voices: Array.from(voiceMap.entries()).map(([voice_id, raw_text]) => ({
      voice_id,
      raw_text,
    })),
    corrections,
    newGeneralCategories,
    newCategories,
  }
}

