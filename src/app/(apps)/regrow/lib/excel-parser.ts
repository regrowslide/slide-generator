/**
 * Excel（担当者別分析表）のパース処理
 */

import ExcelJS from 'exceljs'
import type {ExcelParseResult, StoreName, StaffRecord} from '../types'
import {convertXlsToXlsx, isXlsFile} from './excel-converter'

/** セルの値を取得するヘルパー（1-indexed） */
const getCellValue = (ws: ExcelJS.Worksheet, row: number, col: number): string | number | undefined => {
  const cell = ws.getCell(row, col)
  return cell.value as string | number | undefined
}

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
  const ws = wb.worksheets[0]

  // B1セルから店舗名取得（フルネーム、表示用）
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
    // A列: 担当者名
    const nameCell = getCellValue(ws, row, 1)
    if (!nameCell) break

    const nameStr = String(nameCell)
    // 「総合計」行に到達したら終了
    if (nameStr.includes('総') && nameStr.includes('合') && nameStr.includes('計')) break

    // 順位を削除してスタッフ名を抽出
    const staffName = nameStr.replace(/^\d+位\n/, '').trim()

    // 行1: 売上実績（G列 = col 7）、新規客数（W列 = col 23）
    const sales = Number(getCellValue(ws, row, 7)) || 0
    const newCustomerCount = Number(getCellValue(ws, row, 23)) || 0

    // 行2: 客数（G列 = col 7: 対応客数、C列 = col 3: 指名数）
    const customerCount = Number(getCellValue(ws, row + 1, 7)) || 0
    const nominationCount = Number(getCellValue(ws, row + 1, 3)) || 0

    // 行3: 客単価（G列 = col 7）
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
    row += 3 // 次の3行パターンへ
  }

  // 総合計行を検索
  let totalRow = row
  const totalNameCell = getCellValue(ws, totalRow, 1)
  if (!totalNameCell || !(String(totalNameCell).includes('総') && String(totalNameCell).includes('計'))) {
    // 総合計行が見つからない場合、次の数行を探索
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
