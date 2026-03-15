/**
 * .xlsファイルを.xlsx形式のArrayBufferに変換するユーティリティ
 * ExcelJSは.xlsxのみ対応のため、.xlsはSheetJS経由で変換する
 */

import * as XLSX from 'xlsx'

/** .xls の ArrayBuffer を .xlsx の ArrayBuffer に変換 */
export const convertXlsToXlsx = (xlsBuffer: ArrayBuffer): ArrayBuffer => {
  const wb = XLSX.read(new Uint8Array(xlsBuffer), {type: 'array', cellStyles: true})
  const xlsxOutput = XLSX.write(wb, {type: 'buffer', bookType: 'xlsx'}) as Buffer | Uint8Array
  // Uint8Array/Buffer から正確な範囲の ArrayBuffer を取得
  return xlsxOutput.buffer.slice(xlsxOutput.byteOffset, xlsxOutput.byteOffset + xlsxOutput.byteLength)
}

/** ファイル拡張子が .xls かどうか */
export const isXlsFile = (fileName: string): boolean => {
  return fileName.toLowerCase().endsWith('.xls') && !fileName.toLowerCase().endsWith('.xlsx')
}
