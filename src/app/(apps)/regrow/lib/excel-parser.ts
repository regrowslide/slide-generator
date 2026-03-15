/**
 * Excel（担当者別分析表）のパース処理（クライアントサイド用）
 */

import ExcelJS from 'exceljs'
import type {ExcelParseResult, StoreName} from '../types'
import {convertXlsToXlsx, isXlsFile} from './excel-converter'
import {parseWorkbook} from './excel-parser-core'

/**
 * 担当者別分析表のExcelファイルをパース
 * storeShortName: 手動選択された店舗名（ファイル名からの推測は行わない）
 */
export const parseStaffAnalysisExcel = async (file: File, storeShortName: StoreName): Promise<ExcelParseResult> => {
  let arrayBuffer = await file.arrayBuffer()
  // .xlsファイルの場合はxlsx形式に変換
  if (isXlsFile(file.name)) {
    arrayBuffer = convertXlsToXlsx(arrayBuffer)
  }
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(arrayBuffer)

  return parseWorkbook(wb, storeShortName, file.name)
}
