/**
 * Excel（担当者別分析表）の共通パースロジック
 * クライアント側・サーバー側の両方から使用される
 */

import ExcelJS from 'exceljs'
import type {ExcelParseResult, StoreName, StaffRecord, StaffMenuRecord, MenuCategory} from '../types'

/** セルの値を取得するヘルパー（1-indexed） */
export const getCellValue = (ws: ExcelJS.Worksheet, row: number, col: number): string | number | undefined => {
  const cell = ws.getCell(row, col)
  return cell.value as string | number | undefined
}

/**
 * ExcelJS Workbookから担当者別分析表をパースする共通ロジック
 * ArrayBufferの読み込み・変換は呼び出し側で行い、ここではパースのみ担当
 */
export const parseWorkbook = (wb: ExcelJS.Workbook, storeShortName: StoreName, sourceLabel: string): ExcelParseResult => {
  const ws = wb.worksheets[0]

  if (!ws) {
    console.error(`[excel-parser] ワークシートが見つかりません: ${sourceLabel}`, {
      sheetCount: wb.worksheets.length,
    })
    throw new Error(`ワークシートが見つかりません: ${sourceLabel}`)
  }

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

  // メニュー列の定義（担当者別分析表の列構成）
  const MENU_COLUMNS: {category: MenuCategory; salesCol: number; ratioCol: number}[] = [
    {category: 'もみほぐし', salesCol: 10, ratioCol: 11},
    {category: 'タイ古式マッサージ', salesCol: 12, ratioCol: 13},
    {category: 'バリ式リンパマッサージ', salesCol: 14, ratioCol: 15},
    {category: 'オプション', salesCol: 16, ratioCol: 17},
    {category: 'その他', salesCol: 18, ratioCol: 19},
  ]

  // スタッフデータ抽出（3行パターン検出）
  const staffList: StaffRecord[] = []
  const staffMenuList: StaffMenuRecord[] = []
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

    // メニュー別データ抽出
    for (const {category, salesCol, ratioCol} of MENU_COLUMNS) {
      const menuSales = Number(getCellValue(ws, row, salesCol)) || 0 // 行1: メニュー別売上
      const menuCustomerCount = Number(getCellValue(ws, row + 1, salesCol)) || 0 // 行2: メニュー別客数
      const menuRatio = Number(getCellValue(ws, row + 1, ratioCol)) || 0 // 行2: 割合
      const menuUnitPrice = Number(getCellValue(ws, row + 2, salesCol)) || 0 // 行3: メニュー別客単価

      staffMenuList.push({
        staffName,
        storeName: storeShortName,
        menuCategory: category,
        sales: menuSales,
        customerCount: menuCustomerCount,
        ratio: menuRatio,
        unitPrice: menuUnitPrice,
      })
    }

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
    staffMenuList,
    total,
  }
}
