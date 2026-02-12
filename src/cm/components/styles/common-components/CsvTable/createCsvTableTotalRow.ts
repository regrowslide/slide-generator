import type {CSSProperties} from 'react'

type CsvTableCol = {
  cellValue: any
  style?: CSSProperties
  [key: string]: any
}

type CsvTableRowInput = {
  csvTableRow: CsvTableCol[]
  [key: string]: any
}

/**
 * CsvTableのrecords配列から合計行を生成する。
 * 数値列は合算、文字列列は空欄にする。最初の列に「合計」ラベルを表示。
 */
export const createCsvTableTotalRow = (records: CsvTableRowInput[], labelText = '合計'): CsvTableRowInput => {
  if (records.length === 0) return {csvTableRow: []}

  const colCount = records[0].csvTableRow.length
  const boldStyle: CSSProperties = {fontWeight: 'bold'}

  return {
    csvTableRow: [
      {
        cellValue: '#',
        style: {
          fontWeight: 'bold',
        },
      },
      ...Array.from({length: colCount}, (_, i) => {
        const baseStyle = records[0].csvTableRow[i]?.style
        const mergedStyle: CSSProperties = {...baseStyle, ...boldStyle}

        if (i === 0) {
          return {cellValue: labelText, style: mergedStyle}
        }

        const firstValue = records[0].csvTableRow[i]?.cellValue
        if (typeof firstValue !== 'number') {
          return {cellValue: '', style: mergedStyle}
        }

        const sum = records.reduce((acc, row) => {
          return acc + (Number(row.csvTableRow[i]?.cellValue) || 0)
        }, 0)
        return {cellValue: sum, style: mergedStyle}
      }),
    ],
    style: {
      backgroundColor: '#e5e7eb',
      position: 'sticky',
      bottom: 0,
      zIndex: 10,
    },
  }
}
