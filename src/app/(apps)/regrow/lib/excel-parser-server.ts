/**
 * サーバーサイド用Excelパーサー（担当者別分析表）
 * fs.readFileSyncでファイルを読み込み、xlsxでパース
 */

import fs from 'fs'
import path from 'path'
import * as XLSX from 'xlsx'
import type {ExcelParseResult, StoreName, StaffRecord} from '../types'

/** Excelファイル1つをパース（サーバーサイド用） */
export const parseExcelFromPath = (filePath: string, storeShortName: StoreName): ExcelParseResult => {
  const buffer = fs.readFileSync(filePath)
  const wb = XLSX.read(buffer, {type: 'buffer'})
  const ws = wb.Sheets[wb.SheetNames[0]]

  // B1セルから店舗名取得（フルネーム）
  const storeCell = ws[XLSX.utils.encode_cell({r: 0, c: 1})]
  const storeName = storeCell?.v ? String(storeCell.v).replace('店舗名：', '') : storeShortName

  // V1セルから集計期間取得
  const periodCell = ws[XLSX.utils.encode_cell({r: 0, c: 21})]
  let periodStart = ''
  let periodEnd = ''
  if (periodCell?.v) {
    const periodText = String(periodCell.v).replace('集計期間：', '')
    const parts = periodText.split('～')
    if (parts.length === 2) {
      periodStart = parts[0].trim()
      periodEnd = parts[1].trim()
    }
  }

  // スタッフデータ抽出（3行パターン検出）
  const staffList: StaffRecord[] = []
  let rank = 1
  let row = 3 // 4行目から開始（0-indexed）

  while (row < 100) {
    const nameCell = ws[XLSX.utils.encode_cell({r: row, c: 0})]
    if (!nameCell?.v) break

    const nameStr = String(nameCell.v)
    if (nameStr.includes('総') && nameStr.includes('合') && nameStr.includes('計')) break

    // 順位を削除してスタッフ名を抽出
    const staffName = nameStr.replace(/^\d+位\n/, '').trim()

    // 行1: 売上実績（G列）、新規客数（W列）
    const sales = Number(ws[XLSX.utils.encode_cell({r: row, c: 6})]?.v) || 0
    const newCustomerCount = Number(ws[XLSX.utils.encode_cell({r: row, c: 22})]?.v) || 0

    // 行2: 客数（G列: 対応客数、C列: 指名数）
    const customerCount = Number(ws[XLSX.utils.encode_cell({r: row + 1, c: 6})]?.v) || 0
    const nominationCount = Number(ws[XLSX.utils.encode_cell({r: row + 1, c: 2})]?.v) || 0

    // 行3: 客単価（G列）
    const unitPrice = Number(ws[XLSX.utils.encode_cell({r: row + 2, c: 6})]?.v) || 0

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
  const totalNameCell = ws[XLSX.utils.encode_cell({r: totalRow, c: 0})]
  if (!totalNameCell?.v || !(String(totalNameCell.v).includes('総') && String(totalNameCell.v).includes('計'))) {
    totalRow++
    while (totalRow < row + 5) {
      const cell = ws[XLSX.utils.encode_cell({r: totalRow, c: 0})]
      if (cell?.v && String(cell.v).includes('合') && String(cell.v).includes('計')) break
      totalRow++
    }
  }

  // 総合計データ抽出
  const total = {
    sales: Number(ws[XLSX.utils.encode_cell({r: totalRow, c: 6})]?.v) || 0,
    customerCount: Number(ws[XLSX.utils.encode_cell({r: totalRow + 1, c: 6})]?.v) || 0,
    nominationCount: Number(ws[XLSX.utils.encode_cell({r: totalRow + 1, c: 2})]?.v) || 0,
    unitPrice: Number(ws[XLSX.utils.encode_cell({r: totalRow + 2, c: 6})]?.v) || 0,
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

/** ファイル名パターン: YYYYMM_店舗名.xls */
const FILE_PATTERN = /^(\d{6})_(.+)\.xls$/

type ParsedFile = {
  yearMonth: string
  storeShortName: string
  result: ExcelParseResult
}

/** ディレクトリ内の全Excelをパースしてまとめて返す */
export const parseAllExcelFiles = (dirPath: string): ParsedFile[] => {
  const files = fs.readdirSync(dirPath).filter((f) => FILE_PATTERN.test(f)).sort()
  const results: ParsedFile[] = []

  for (const fileName of files) {
    const match = fileName.match(FILE_PATTERN)
    if (!match) continue

    const [, yyyymm, storeShortName] = match
    // YYYYMM → YYYY-MM
    const yearMonth = `${yyyymm.slice(0, 4)}-${yyyymm.slice(4, 6)}`
    const filePath = path.join(dirPath, fileName)

    const result = parseExcelFromPath(filePath, storeShortName)
    results.push({yearMonth, storeShortName, result})
  }

  return results
}
