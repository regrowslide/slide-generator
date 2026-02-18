/**
 * Excel（担当者別分析表）のパース処理
 */

import * as XLSX from 'xlsx'
import type {ExcelParseResult, StoreName, StaffRecord} from '../types'

/**
 * ファイル名から店舗名を抽出
 * 例: "担当者別分析表_asian relaxation villa新潟西店_20260209.xlsx" → "新潟西店"
 */
export const extractStoreName = (filename: string): StoreName => {
  const match = filename.match(/villa(.*?)_/)
  if (!match) {
    // フォールバック: ファイル名に店舗名が含まれているか確認
    if (filename.includes('新潟西店')) return '新潟西店'
    if (filename.includes('三条店')) return '三条店'
    if (filename.includes('新潟中央店')) return '新潟中央店'
    throw new Error('ファイル名から店舗名を抽出できませんでした')
  }

  const extracted = match[1].trim()
  // 店舗名マッピング
  if (extracted.includes('新潟西') || extracted === '新潟西店') return '新潟西店'
  if (extracted.includes('三条') || extracted === '三条店') return '三条店'
  if (extracted.includes('新潟中央') || extracted === '新潟中央店') return '新潟中央店'

  throw new Error(`未知の店舗名: ${extracted}`)
}

/**
 * 担当者別分析表のExcelファイルをパース
 */
export const parseStaffAnalysisExcel = (file: File): Promise<ExcelParseResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const wb = XLSX.read(data, {type: 'array'})
        const ws = wb.Sheets[wb.SheetNames[0]]

        // 店舗名抽出
        let storeShortName: StoreName
        try {
          storeShortName = extractStoreName(file.name)
        } catch (error) {
          reject(error)
          return
        }

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
          // A列: 担当者名
          const nameCell = ws[XLSX.utils.encode_cell({r: row, c: 0})]
          if (!nameCell?.v) break

          const nameStr = String(nameCell.v)
          // 「総合計」行に到達したら終了
          if (nameStr.includes('総') && nameStr.includes('合') && nameStr.includes('計')) break

          // 順位を削除してスタッフ名を抽出
          const staffName = nameStr.replace(/^\d+位\n/, '').trim()

          // 行1: 売上実績（G列 = col 6）、新規客数（W列 = col 22）
          const sales = Number(ws[XLSX.utils.encode_cell({r: row, c: 6})]?.v) || 0
          const newCustomerCount = Number(ws[XLSX.utils.encode_cell({r: row, c: 22})]?.v) || 0

          // 行2: 客数（G列 = col 6: 対応客数、C列 = col 2: 指名数）
          const customerCount = Number(ws[XLSX.utils.encode_cell({r: row + 1, c: 6})]?.v) || 0
          const nominationCount = Number(ws[XLSX.utils.encode_cell({r: row + 1, c: 2})]?.v) || 0

          // 行3: 客単価（G列 = col 6）
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
          row += 3 // 次の3行パターンへ
        }

        // 総合計行を検索
        let totalRow = row
        const totalNameCell = ws[XLSX.utils.encode_cell({r: totalRow, c: 0})]
        if (!totalNameCell?.v || !(String(totalNameCell.v).includes('総') && String(totalNameCell.v).includes('計'))) {
          // 総合計行が見つからない場合、次の数行を探索
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

        resolve({
          storeName,
          storeShortName,
          periodStart,
          periodEnd,
          staffList,
          total,
        })
      } catch (err) {
        reject(new Error('Excelファイルのパースに失敗しました: ' + (err as Error).message))
      }
    }

    reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'))
    reader.readAsArrayBuffer(file)
  })
}
