/**
 * サーバーサイド用Excelパーサー（担当者別分析表）
 * fs.readFileSyncでファイルを読み込み、exceljsでパース
 */

import fs from 'fs'
import path from 'path'
import ExcelJS from 'exceljs'
import type {ExcelParseResult, StoreName, StaffRecord} from '../types'

/** セルの値を取得するヘルパー（1-indexed） */
const getCellValue = (ws: ExcelJS.Worksheet, row: number, col: number): string | number | undefined => {
  const cell = ws.getCell(row, col)
  return cell.value as string | number | undefined
}

/** Excelファイル1つをパース（サーバーサイド用） */
export const parseExcelFromPath = async (filePath: string, storeShortName: StoreName): Promise<ExcelParseResult> => {
  const fileBuffer = fs.readFileSync(filePath)
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength) as ArrayBuffer)
  const ws = wb.worksheets[0]

  // B1セルから店舗名取得（フルネーム）
  const storeCell = getCellValue(ws, 1, 2)
  const storeName = storeCell ? String(storeCell).replace('店舗名：', '') : storeShortName

  // V1セルから集計期間取得
  const periodCell = getCellValue(ws, 1, 22)
  let periodStart = ''
  let periodEnd = ''
  if (periodCell) {
    const periodText = String(periodCell).replace('集計期間：', '')
    const parts = periodText.split('～')
    if (parts.length === 2) {
      periodStart = parts[0].trim()
      periodEnd = parts[1].trim()
    }
  }

  // スタッフデータ抽出（3行パターン検出）
  const staffList: StaffRecord[] = []
  let rank = 1
  let row = 4 // 4行目から開始（1-indexed）

  while (row < 101) {
    const nameCell = getCellValue(ws, row, 1)
    if (!nameCell) break

    const nameStr = String(nameCell)
    if (nameStr.includes('総') && nameStr.includes('合') && nameStr.includes('計')) break

    // 順位を削除してスタッフ名を抽出
    const staffName = nameStr.replace(/^\d+位\n/, '').trim()

    // 行1: 売上実績（G列）、新規客数（W列）
    const sales = Number(getCellValue(ws, row, 7)) || 0
    const newCustomerCount = Number(getCellValue(ws, row, 23)) || 0

    // 行2: 客数（G列: 対応客数、C列: 指名数）
    const customerCount = Number(getCellValue(ws, row + 1, 7)) || 0
    const nominationCount = Number(getCellValue(ws, row + 1, 3)) || 0

    // 行3: 客単価（G列）
    const unitPrice = Number(getCellValue(ws, row + 2, 7)) || 0

    staffList.push({
      rank,
      staffName,
      storeName: storeShortName,
      sales,
      customerCount,
      newCustomerCount,
      nominationCount,
      unitPrice,
    })

    rank++
    row += 3
  }

  // 総合計行を検索
  let totalRow = row
  const totalNameCell = getCellValue(ws, totalRow, 1)
  if (!totalNameCell || !(String(totalNameCell).includes('総') && String(totalNameCell).includes('計'))) {
    totalRow++
    while (totalRow < row + 5) {
      const cell = getCellValue(ws, totalRow, 1)
      if (cell && String(cell).includes('合') && String(cell).includes('計')) break
      totalRow++
    }
  }

  // 総合計データ抽出
  const total = {
    sales: Number(getCellValue(ws, totalRow, 7)) || 0,
    customerCount: Number(getCellValue(ws, totalRow + 1, 7)) || 0,
    nominationCount: Number(getCellValue(ws, totalRow + 1, 3)) || 0,
    unitPrice: Number(getCellValue(ws, totalRow + 2, 7)) || 0,
  }

  return {
    storeName,
    storeShortName,
    periodStart,
    periodEnd,
    staffList,
    total,
  }
}

/** ファイル名パターン: YYYYMM_店舗名.xlsx */
const FILE_PATTERN = /^(\d{6})_(.+)\.xlsx$/

type ParsedFile = {
  yearMonth: string
  storeShortName: string
  result: ExcelParseResult
}

/** ディレクトリ内の全Excelをパースしてまとめて返す */
export const parseAllExcelFiles = async (dirPath: string): Promise<ParsedFile[]> => {
  const files = fs.readdirSync(dirPath).filter((f) => FILE_PATTERN.test(f)).sort()
  const results: ParsedFile[] = []

  for (const fileName of files) {
    const match = fileName.match(FILE_PATTERN)
    if (!match) continue

    const [, yyyymm, storeShortName] = match
    // YYYYMM → YYYY-MM
    const yearMonth = `${yyyymm.slice(0, 4)}-${yyyymm.slice(4, 6)}`
    const filePath = path.join(dirPath, fileName)

    const result = await parseExcelFromPath(filePath, storeShortName)
    results.push({yearMonth, storeShortName, result})
  }

  return results
}
