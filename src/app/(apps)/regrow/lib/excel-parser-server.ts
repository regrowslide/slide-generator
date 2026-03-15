/**
 * サーバーサイド用Excelパーサー（担当者別分析表）
 * fs.readFileSyncでファイルを読み込み、exceljsでパース
 */

import fs from 'fs'
import path from 'path'
import ExcelJS from 'exceljs'
import type {ExcelParseResult, StoreName} from '../types'
import {convertXlsToXlsx, isXlsFile} from './excel-converter'
import {parseWorkbook} from './excel-parser-core'

/** Excelファイル1つをパース（サーバーサイド用） */
export const parseExcelFromPath = async (filePath: string, storeShortName: StoreName): Promise<ExcelParseResult> => {
  const fileBuffer = fs.readFileSync(filePath)
  let arrayBuffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength) as ArrayBuffer
  // .xlsファイルの場合はxlsx形式に変換
  if (isXlsFile(filePath)) {
    arrayBuffer = convertXlsToXlsx(arrayBuffer)
  }
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(arrayBuffer)

  return parseWorkbook(wb, storeShortName, path.basename(filePath))
}

/** ファイル名パターン: YYYYMM_店舗名.xlsx または .xls */
const FILE_PATTERN = /^(\d{6})_(.+)\.xlsx?$/

type ParsedFile = {
  yearMonth: string
  storeShortName: string
  result: ExcelParseResult
}

/** ディレクトリ内の全Excelをパースしてまとめて返す */
export const parseAllExcelFiles = async (dirPath: string): Promise<ParsedFile[]> => {
  const files = fs
    .readdirSync(dirPath)
    .filter(f => FILE_PATTERN.test(f))
    .sort()
  const results: ParsedFile[] = []
  for (const fileName of files) {
    const match = fileName.match(FILE_PATTERN)
    if (!match) continue

    const [, yyyymm, rawStoreName] = match
    const storeShortName = rawStoreName.trim()
    // YYYYMM → YYYY-MM
    const yearMonth = `${yyyymm.slice(0, 4)}-${yyyymm.slice(4, 6)}`
    const filePath = path.join(dirPath, fileName)

    const result = await parseExcelFromPath(filePath, storeShortName)
    results.push({yearMonth, storeShortName, result})
  }

  return results
}
