'use client'

/**
 * Regrow 統合モックページ
 * 旧 /regrow/, /regrow/store, /regrow/staff, /regrow/input を1ページに統合。
 * activeSection で取込/確認/スライド/店舗/スタッフ/手入力を切替。
 */

import React, {useState, useCallback, useRef, useMemo} from 'react'
import * as XLSX from 'xlsx'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  LabelList,
} from 'recharts'
import {
  useRegrowData,
  STORE_NAMES,
  STAFF_MASTER,
  formatMonthLabel,
  formatYen,
  formatPercent,
  formatNumber,
  type StoreMonthlyInput,
  type StaffMonthlyInput,
  type LowReviewInput,
} from '../context/RegrowDataContext'

// ============================================================
// 型定義
// ============================================================

type StaffSalesData = {
  rank: number
  name: string
  sales: number
  customerCount: number
  nominationCount: number
  unitPrice: number
}

type ExcelParseResult = {
  storeName: string
  storeShortName: string
  periodStart: string
  periodEnd: string
  staffList: StaffSalesData[]
  total: Omit<StaffSalesData, 'rank' | 'name'>
}

type StaffKpiInput = {
  staffName: string
  storeName: string
  utilizationRate: number | null
  returnRate: number | null
  csRegistrationCount: number | null
  utilizationGrade: 'A' | 'B' | 'C' | 'D' | null
}

type StoreKpiInput = {
  storeName: string
  sales: number | null
  utilizationRate: number | null
  avgUnitPrice: number | null
  returnRate: number | null
  churnRate: number | null
  comment: string
}

type LocalLowReviewInput = {
  id: string
  storeName: string
  date: string
  content: string
  responseStatus: string
}

type SectionKey = 'import' | 'data' | 'slides' | 'store' | 'staff' | 'input'

// ============================================================
// 定数・カラー
// ============================================================

const STORE_NAMES_LOCAL = ['新潟西店', '三条店', '新潟中央店'] as const
const GRADE_OPTIONS = ['A', 'B', 'C', 'D'] as const
const ROW_COLORS = ['bg-pink-50', 'bg-amber-50', 'bg-green-50'] as const
const PURPLE_HEADER = '#8B78B5'
const NAVY = '#1a1a4e'
const RED_ACCENT = '#D14836'
const TOTAL_SLIDES = 15

// 店舗ごとのグラフカラー
const STORE_COLORS: Record<string, {current: string; prev: string}> = {
  新潟西店: {current: '#DC3545', prev: '#F5A0A8'},
  三条店: {current: '#4285F4', prev: '#A4C2F4'},
  新潟中央店: {current: '#34A853', prev: '#A8DAB5'},
}

const CHART_COLORS = {
  barToday: '#DC3545',
  barPrev: '#4285F4',
  lineOrange: '#F5A623',
  lineGreen: '#34A853',
}

// サンプル先月データ
const SAMPLE_PREV_STORE_KPI: Record<string, StoreKpiInput> = {
  新潟西店: {storeName: '新潟西店', sales: 420000, utilizationRate: 68, avgUnitPrice: 5100, returnRate: 42, churnRate: 15, comment: ''},
  三条店: {storeName: '三条店', sales: 380000, utilizationRate: 62, avgUnitPrice: 4800, returnRate: 38, churnRate: 18, comment: ''},
  新潟中央店: {storeName: '新潟中央店', sales: 350000, utilizationRate: 58, avgUnitPrice: 4600, returnRate: 35, churnRate: 20, comment: ''},
}

const SAMPLE_PREV_STAFF: Record<string, {sales: number; nominationCount: number; returnRate: number; unitPrice: number}> = {}

// ============================================================
// Excelパースロジック
// ============================================================

const parseExcelFile = (file: File): Promise<ExcelParseResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const wb = XLSX.read(data, {type: 'array'})
        const ws = wb.Sheets[wb.SheetNames[0]]
        const sheetName = wb.SheetNames[0]

        const storeCell = ws[XLSX.utils.encode_cell({r: 0, c: 1})]
        const periodCell = ws[XLSX.utils.encode_cell({r: 0, c: 21})]

        const storeName = storeCell?.v?.replace('店舗名：', '') || sheetName
        const storeShortName = storeName.replace(/.*villa/, '') || storeName

        let periodStart = ''
        let periodEnd = ''
        if (periodCell?.v) {
          const parts = String(periodCell.v).replace('集計期間：', '').split('～')
          if (parts.length === 2) {
            periodStart = parts[0].trim()
            periodEnd = parts[1].trim()
          }
        }

        const staffList: StaffSalesData[] = []
        let rank = 1
        let row = 3

        while (row < 100) {
          const nameCell = ws[XLSX.utils.encode_cell({r: row, c: 0})]
          if (!nameCell?.v) break
          const nameStr = String(nameCell.v)
          if (nameStr.includes('総') && nameStr.includes('合') && nameStr.includes('計')) break

          const name = nameStr.replace(/^\d+位\n/, '')
          const sales = Number(ws[XLSX.utils.encode_cell({r: row, c: 6})]?.v) || 0
          const customerCount = Number(ws[XLSX.utils.encode_cell({r: row + 1, c: 4})]?.v) || 0
          const nominationCount = Number(ws[XLSX.utils.encode_cell({r: row + 1, c: 2})]?.v) || 0
          const unitPrice = Number(ws[XLSX.utils.encode_cell({r: row + 2, c: 4})]?.v) || 0

          staffList.push({rank, name, sales, customerCount, nominationCount, unitPrice})
          rank++
          row += 3
        }

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

        const total = {
          sales: Number(ws[XLSX.utils.encode_cell({r: totalRow, c: 6})]?.v) || 0,
          customerCount: Number(ws[XLSX.utils.encode_cell({r: totalRow + 1, c: 4})]?.v) || 0,
          nominationCount: Number(ws[XLSX.utils.encode_cell({r: totalRow + 1, c: 2})]?.v) || 0,
          unitPrice: Number(ws[XLSX.utils.encode_cell({r: totalRow + 2, c: 4})]?.v) || 0,
        }

        resolve({storeName, storeShortName, periodStart, periodEnd, staffList, total})
      } catch (err) {
        reject(new Error('Excelファイルのパースに失敗しました: ' + (err as Error).message))
      }
    }
    reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'))
    reader.readAsArrayBuffer(file)
  })
}

// ============================================================
// ローカルユーティリティ
// ============================================================

const localFormatNumber = (n: number | null | undefined): string => {
  if (n == null) return '-'
  return n.toLocaleString('ja-JP')
}

const localFormatYen = (n: number | null | undefined): string => {
  if (n == null) return '-'
  return `¥${n.toLocaleString('ja-JP')}`
}

const localFormatPercent = (n: number | null | undefined): string => {
  if (n == null) return '-'
  return `${n}%`
}

const generateId = (): string => Math.random().toString(36).slice(2, 9)

// ============================================================
// セクション: Excel取込
// ============================================================

type ExcelImportSectionProps = {
  onParsed: (result: ExcelParseResult) => void
  parsedResults: ExcelParseResult[]
}

const ExcelImportSection = ({onParsed, parsedResults}: ExcelImportSectionProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setError('Excelファイル（.xlsx / .xls）を選択してください')
        return
      }
      setError(null)
      setIsLoading(true)
      try {
        const result = await parseExcelFile(file)
        onParsed(result)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setIsLoading(false)
      }
    },
    [onParsed]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-3">担当者別分析表（Excel）の取込</h2>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-red-300'
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />
        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-red-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500">パース中...</p>
          </div>
        ) : (
          <>
            <p className="text-gray-600 text-sm">
              ここにExcelファイルをドラッグ＆ドロップ
              <br />
              またはクリックしてファイルを選択
            </p>
            <p className="text-xs text-gray-400 mt-2">対応形式: .xlsx / .xls</p>
          </>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {parsedResults.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-2">取込済みデータ</h3>
          <div className="space-y-2">
            {parsedResults.map((r, i) => (
              <div key={i} className="bg-white border rounded p-2 text-sm flex items-center justify-between">
                <div>
                  <span className="font-medium">{r.storeShortName}</span>
                  <span className="text-gray-500 ml-2">{r.periodStart}～{r.periodEnd}</span>
                  <span className="text-gray-400 ml-2">（{r.staffList.length}名）</span>
                </div>
                <span className="text-green-600 text-xs">取込済</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// セクション: 元データ確認
// ============================================================

type DataViewSectionProps = {
  parsedResults: ExcelParseResult[]
  storeKpis: Record<string, StoreKpiInput>
  staffKpis: StaffKpiInput[]
  onStoreKpiChange: (storeName: string, field: keyof StoreKpiInput, value: any) => void
  onStaffKpiChange: (index: number, field: keyof StaffKpiInput, value: any) => void
}

const DataViewSection = ({parsedResults, storeKpis, staffKpis, onStoreKpiChange, onStaffKpiChange}: DataViewSectionProps) => {
  if (parsedResults.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>データがありません</p>
        <p className="text-sm mt-1">「Excel取込」からファイルをアップロードしてください</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      <section>
        <h2 className="text-lg font-bold mb-2">担当者別分析表データ</h2>
        {parsedResults.map((result, ri) => (
          <div key={ri} className="mb-4">
            <h3 className="text-sm font-semibold mb-1" style={{color: NAVY}}>{result.storeShortName}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr style={{backgroundColor: PURPLE_HEADER, color: '#fff'}}>
                    <th className="p-1 border border-purple-400">順位</th>
                    <th className="p-1 border border-purple-400">名前</th>
                    <th className="p-1 border border-purple-400 text-right">売上合計</th>
                    <th className="p-1 border border-purple-400 text-right">対応客数</th>
                    <th className="p-1 border border-purple-400 text-right">指名数</th>
                    <th className="p-1 border border-purple-400 text-right">客単価</th>
                  </tr>
                </thead>
                <tbody>
                  {result.staffList.map((s, i) => (
                    <tr key={s.rank} className={ROW_COLORS[i % 3]}>
                      <td className="p-1 border border-gray-200 text-center">{s.rank}</td>
                      <td className="p-1 border border-gray-200">{s.name}</td>
                      <td className="p-1 border border-gray-200 text-right">{localFormatYen(s.sales)}</td>
                      <td className="p-1 border border-gray-200 text-right">{s.customerCount}</td>
                      <td className="p-1 border border-gray-200 text-right">{s.nominationCount}</td>
                      <td className="p-1 border border-gray-200 text-right">{localFormatYen(s.unitPrice)}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-semibold">
                    <td className="p-1 border border-gray-200 text-center" colSpan={2}>合計</td>
                    <td className="p-1 border border-gray-200 text-right">{localFormatYen(result.total.sales)}</td>
                    <td className="p-1 border border-gray-200 text-right">{result.total.customerCount}</td>
                    <td className="p-1 border border-gray-200 text-right">{result.total.nominationCount}</td>
                    <td className="p-1 border border-gray-200 text-right">{localFormatYen(result.total.unitPrice)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-lg font-bold mb-2">店舗月次KPI（手入力）</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr style={{backgroundColor: PURPLE_HEADER, color: '#fff'}}>
                <th className="p-1 border border-purple-400">店舗</th>
                <th className="p-1 border border-purple-400">売上</th>
                <th className="p-1 border border-purple-400">稼働率(%)</th>
                <th className="p-1 border border-purple-400">客単価</th>
                <th className="p-1 border border-purple-400">再来率(%)</th>
                <th className="p-1 border border-purple-400">失客率(%)</th>
                <th className="p-1 border border-purple-400 min-w-[200px]">コメント</th>
              </tr>
            </thead>
            <tbody>
              {STORE_NAMES_LOCAL.map((store, i) => {
                const kpi = storeKpis[store]
                return (
                  <tr key={store} className={ROW_COLORS[i % 3]}>
                    <td className="p-1 border border-gray-200 font-medium">{store}</td>
                    <td className="p-1 border border-gray-200">
                      <input type="number" className="w-full text-right text-xs p-0.5 border rounded" value={kpi?.sales ?? ''}
                        onChange={(e) => onStoreKpiChange(store, 'sales', e.target.value ? Number(e.target.value) : null)} />
                    </td>
                    <td className="p-1 border border-gray-200">
                      <input type="number" className="w-full text-right text-xs p-0.5 border rounded" value={kpi?.utilizationRate ?? ''}
                        onChange={(e) => onStoreKpiChange(store, 'utilizationRate', e.target.value ? Number(e.target.value) : null)} />
                    </td>
                    <td className="p-1 border border-gray-200">
                      <input type="number" className="w-full text-right text-xs p-0.5 border rounded" value={kpi?.avgUnitPrice ?? ''}
                        onChange={(e) => onStoreKpiChange(store, 'avgUnitPrice', e.target.value ? Number(e.target.value) : null)} />
                    </td>
                    <td className="p-1 border border-gray-200">
                      <input type="number" className="w-full text-right text-xs p-0.5 border rounded" value={kpi?.returnRate ?? ''}
                        onChange={(e) => onStoreKpiChange(store, 'returnRate', e.target.value ? Number(e.target.value) : null)} />
                    </td>
                    <td className="p-1 border border-gray-200">
                      <input type="number" className="w-full text-right text-xs p-0.5 border rounded" value={kpi?.churnRate ?? ''}
                        onChange={(e) => onStoreKpiChange(store, 'churnRate', e.target.value ? Number(e.target.value) : null)} />
                    </td>
                    <td className="p-1 border border-gray-200">
                      <textarea className="w-full text-xs p-0.5 border rounded resize-none" rows={2} value={kpi?.comment ?? ''}
                        onChange={(e) => onStoreKpiChange(store, 'comment', e.target.value)} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-2">スタッフ追加KPI（手入力）</h2>
        {staffKpis.length === 0 ? (
          <p className="text-gray-500 text-sm">Excelを取り込むとスタッフが自動表示されます</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr style={{backgroundColor: PURPLE_HEADER, color: '#fff'}}>
                  <th className="p-1 border border-purple-400">店舗</th>
                  <th className="p-1 border border-purple-400">名前</th>
                  <th className="p-1 border border-purple-400">稼働率(%)</th>
                  <th className="p-1 border border-purple-400">再来率(%)</th>
                  <th className="p-1 border border-purple-400">CS登録数</th>
                  <th className="p-1 border border-purple-400">ABCD評価</th>
                </tr>
              </thead>
              <tbody>
                {staffKpis.map((sk, i) => (
                  <tr key={i} className={ROW_COLORS[i % 3]}>
                    <td className="p-1 border border-gray-200 text-xs">{sk.storeName}</td>
                    <td className="p-1 border border-gray-200 font-medium">{sk.staffName}</td>
                    <td className="p-1 border border-gray-200">
                      <input type="number" className="w-full text-right text-xs p-0.5 border rounded" value={sk.utilizationRate ?? ''}
                        onChange={(e) => onStaffKpiChange(i, 'utilizationRate', e.target.value ? Number(e.target.value) : null)} />
                    </td>
                    <td className="p-1 border border-gray-200">
                      <input type="number" className="w-full text-right text-xs p-0.5 border rounded" value={sk.returnRate ?? ''}
                        onChange={(e) => onStaffKpiChange(i, 'returnRate', e.target.value ? Number(e.target.value) : null)} />
                    </td>
                    <td className="p-1 border border-gray-200">
                      <input type="number" className="w-full text-right text-xs p-0.5 border rounded" value={sk.csRegistrationCount ?? ''}
                        onChange={(e) => onStaffKpiChange(i, 'csRegistrationCount', e.target.value ? Number(e.target.value) : null)} />
                    </td>
                    <td className="p-1 border border-gray-200">
                      <select className="w-full text-xs p-0.5 border rounded" value={sk.utilizationGrade ?? ''}
                        onChange={(e) => onStaffKpiChange(i, 'utilizationGrade', e.target.value || null)}>
                        <option value="">-</option>
                        {GRADE_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

// ============================================================
// スライド共通コンポーネント
// ============================================================

const SectionTitle = ({num, children}: {num: string; children: React.ReactNode}) => (
  <h2 className="text-xl font-bold mb-4" style={{color: NAVY}}>
    ◆{num}.{children}
  </h2>
)

const SlidePage = ({page, children}: {page: number; children: React.ReactNode}) => (
  <div className="bg-white rounded shadow-md relative" style={{minHeight: 400}}>
    {children}
    <div className="absolute bottom-3 right-4 text-xs text-gray-400">{page} / {TOTAL_SLIDES}</div>
  </div>
)

// ============================================================
// スライド1: タイトル
// ============================================================

const SectionTitleSlide = ({periodLabel}: {periodLabel: string}) => (
  <div className="bg-white py-8 px-6 text-center">
    <p className="text-sm text-gray-500 italic">アジアンリラクゼーションヴィラ</p>
    <h1 className="text-3xl font-bold mt-1" style={{color: NAVY}}>月次定例ミーティング資料</h1>
    <div className="mt-4 text-sm text-gray-600 space-y-1">
      <p>・Asian relaxation villa 新潟西店</p>
      <p>・Asian relaxation villa 三条店</p>
      <p>・Asian relaxation villa 新潟中央店</p>
    </div>
    {periodLabel && <p className="mt-3 text-lg font-semibold text-gray-700">{periodLabel}</p>}
  </div>
)

// ============================================================
// スライド2: 目次
// ============================================================

const SectionTableOfContents = () => (
  <div className="bg-white py-6 px-6">
    <h2 className="text-xl font-bold mb-6" style={{color: NAVY}}>
      定例ミーティング資料概要(3店舗・先月比入り／全国比なし)
    </h2>
    <div className="space-y-4">
      {[
        {num: '01', title: '全体サマリー(3店舗比較)', items: ['各店舗の売上額、客単価、稼働率、再来率、失客率、売上率、口コミ/アプリ登録増加数', '各店舗分析コメント、各種グラフ掲載']},
        {num: '02', title: 'スタッフ別パフォーマンス(先月比入り)', items: ['全スタッフの売上額、客単価、稼働率、再来率、売上率、出勤力', '全スタッフ分析コメント、各種グラフ掲載']},
        {num: '03', title: 'お客様の声・低評価共有', items: ['各店舗のお客様の声内容、対応状況', '各店舗分析コメント']},
      ].map((s) => (
        <div key={s.num}>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-lg font-bold" style={{color: RED_ACCENT}}>{s.num}</span>
            <span className="font-bold" style={{color: NAVY}}>{s.title}</span>
          </div>
          <div className="rounded px-4 py-2" style={{backgroundColor: '#FDF0ED'}}>
            {s.items.map((item, i) => (
              <p key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="mt-0.5" style={{color: RED_ACCENT}}>●</span>{item}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)

// ============================================================
// スライド3: 全体サマリー
// ============================================================

const SectionSummaryTable = ({storeKpis}: {storeKpis: Record<string, StoreKpiInput>}) => (
  <div className="bg-white py-6 px-6">
    <SectionTitle num="01">全体サマリー(3店舗比較)</SectionTitle>
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{backgroundColor: PURPLE_HEADER, color: '#fff'}}>
            <th className="p-2 border border-purple-400 text-left">店舗</th>
            <th className="p-2 border border-purple-400 text-right">売上</th>
            <th className="p-2 border border-purple-400 text-right">稼働率</th>
            <th className="p-2 border border-purple-400 text-right">客単価</th>
            <th className="p-2 border border-purple-400 text-right">再来率</th>
            <th className="p-2 border border-purple-400 text-right">失客率</th>
          </tr>
        </thead>
        <tbody>
          {STORE_NAMES_LOCAL.map((store, i) => {
            const kpi = storeKpis[store]
            return (
              <tr key={store} className={ROW_COLORS[i % 3]}>
                <td className="p-2 border border-gray-200 font-medium">{store}</td>
                <td className="p-2 border border-gray-200 text-right">{localFormatYen(kpi?.sales)}</td>
                <td className="p-2 border border-gray-200 text-right">{kpi?.utilizationRate != null ? `${kpi.utilizationRate.toFixed(2)}%` : '-'}</td>
                <td className="p-2 border border-gray-200 text-right">{localFormatNumber(kpi?.avgUnitPrice)}</td>
                <td className="p-2 border border-gray-200 text-right">{kpi?.returnRate != null ? `${kpi.returnRate.toFixed(2)}%` : '-'}</td>
                <td className="p-2 border border-gray-200 text-right">{kpi?.churnRate != null ? `${kpi.churnRate.toFixed(2)}%` : '-'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
    <div className="mt-4">
      <p className="font-bold text-sm mb-2">【分析コメント】</p>
      {STORE_NAMES_LOCAL.map((s) => (
        <p key={s} className="text-sm text-gray-700 mb-1">
          <span className="font-semibold">・{s}：</span>
          {storeKpis[s]?.comment || ''}
        </p>
      ))}
    </div>
  </div>
)

// ============================================================
// スライド4-7: 指標別3店舗比較グラフ（変更A）
// ============================================================

type MetricComparisonProps = {
  metricName: string
  metricKey: keyof StoreKpiInput
  storeKpis: Record<string, StoreKpiInput>
  prevKpis: Record<string, StoreKpiInput>
  unit: string
}

const SectionMetricComparison = ({metricName, metricKey, storeKpis, prevKpis, unit}: MetricComparisonProps) => {
  const chartData = STORE_NAMES_LOCAL.map((store) => {
    const current = storeKpis[store]
    const prev = prevKpis[store]
    return {
      store,
      今月: (current?.[metricKey] as number) ?? 0,
      先月: (prev?.[metricKey] as number) ?? 0,
    }
  })

  return (
    <div className="bg-white py-6 px-6">
      <h3 className="text-xl font-bold mb-1" style={{color: NAVY}}>{metricName} 3店舗比較</h3>
      <p className="text-xs text-gray-500 mb-4">今月 vs 先月（{unit}）</p>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="store" tick={{fontSize: 12}} />
            <YAxis tick={{fontSize: 12}} />
            <Tooltip formatter={(value: number) => `${localFormatNumber(value)}${unit}`} />
            <Legend wrapperStyle={{fontSize: 12}} />
            <Bar dataKey="今月" fill={RED_ACCENT} barSize={40}>
              <LabelList dataKey="今月" position="top" fontSize={11} formatter={(v: number) => `${localFormatNumber(v)}`} />
            </Bar>
            <Bar dataKey="先月" fill="#4285F4" barSize={40}>
              <LabelList dataKey="先月" position="top" fontSize={11} formatter={(v: number) => `${localFormatNumber(v)}`} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ============================================================
// スライド8: スタッフ別パフォーマンス一覧表
// ============================================================

const SectionStaffTable = ({parsedResults, staffKpis}: {parsedResults: ExcelParseResult[]; staffKpis: StaffKpiInput[]}) => {
  const allStaff = parsedResults.flatMap((r) =>
    r.staffList.map((s) => {
      const kpi = staffKpis.find((k) => k.staffName === s.name && k.storeName === r.storeShortName)
      return {...s, storeName: r.storeShortName, kpi}
    })
  )

  return (
    <div className="bg-white py-6 px-6">
      <SectionTitle num="02">スタッフ別パフォーマンスサマリー(一覧表)</SectionTitle>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr style={{backgroundColor: PURPLE_HEADER, color: '#fff'}}>
              <th className="p-1.5 border border-purple-400">スタッフ</th>
              <th className="p-1.5 border border-purple-400">店舗</th>
              <th className="p-1.5 border border-purple-400 text-right">売上</th>
              <th className="p-1.5 border border-purple-400 text-right">稼働率</th>
              <th className="p-1.5 border border-purple-400 text-right">対応客数</th>
              <th className="p-1.5 border border-purple-400 text-right">指名数</th>
              <th className="p-1.5 border border-purple-400 text-right">指名割合</th>
              <th className="p-1.5 border border-purple-400 text-right">客単価</th>
              <th className="p-1.5 border border-purple-400 text-right">再来率</th>
              <th className="p-1.5 border border-purple-400 text-right">CS登録数</th>
            </tr>
          </thead>
          <tbody>
            {allStaff.map((s, i) => {
              const nominationRate = s.customerCount > 0 ? ((s.nominationCount / s.customerCount) * 100).toFixed(2) + '%' : '-'
              return (
                <tr key={i} className={ROW_COLORS[i % 3]}>
                  <td className="p-1.5 border border-gray-200 font-medium">{s.name}</td>
                  <td className="p-1.5 border border-gray-200">{s.storeName}</td>
                  <td className="p-1.5 border border-gray-200 text-right">{localFormatYen(s.sales)}</td>
                  <td className="p-1.5 border border-gray-200 text-right">{s.kpi?.utilizationRate != null ? `${s.kpi.utilizationRate.toFixed(2)}%` : ''}</td>
                  <td className="p-1.5 border border-gray-200 text-right">{s.customerCount}</td>
                  <td className="p-1.5 border border-gray-200 text-right">{s.nominationCount}</td>
                  <td className="p-1.5 border border-gray-200 text-right">{nominationRate}</td>
                  <td className="p-1.5 border border-gray-200 text-right">{localFormatYen(s.unitPrice)}</td>
                  <td className="p-1.5 border border-gray-200 text-right">{s.kpi?.returnRate != null ? `${s.kpi.returnRate.toFixed(2)}%` : ''}</td>
                  <td className="p-1.5 border border-gray-200 text-right">{s.kpi?.csRegistrationCount ?? ''}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============================================================
// スライド9: スタッフ別稼働率 縦棒グラフ（変更B）
// ============================================================

const SectionUtilizationChart = ({staffKpis}: {staffKpis: StaffKpiInput[]}) => {
  const staffWithRate = staffKpis.filter((s) => s.utilizationRate != null)

  if (staffWithRate.length === 0) {
    return (
      <div className="bg-white py-6 px-6">
        <h3 className="text-lg font-bold mb-4" style={{color: NAVY}}>スタッフ別月間稼働率</h3>
        <p className="text-gray-400 text-sm">稼働率データが入力されていません</p>
      </div>
    )
  }

  const chartData = staffWithRate.map((s) => ({
    name: s.staffName,
    稼働率: s.utilizationRate ?? 0,
    storeName: s.storeName,
    fill: STORE_COLORS[s.storeName]?.current ?? '#999',
  }))

  return (
    <div className="bg-white py-6 px-6">
      <h3 className="text-xl font-bold mb-1" style={{color: NAVY}}>スタッフ別月間稼働率</h3>
      <div className="flex gap-4 mb-2">
        {STORE_NAMES_LOCAL.map((store) => (
          <div key={store} className="flex items-center gap-1 text-xs">
            <div className="w-3 h-3 rounded" style={{backgroundColor: STORE_COLORS[store]?.current}} />
            <span>{store}</span>
          </div>
        ))}
      </div>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{fontSize: 12}} />
            <YAxis tick={{fontSize: 12}} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
            <Bar dataKey="稼働率" barSize={30}>
              <LabelList dataKey="稼働率" position="top" fontSize={11} formatter={(v: number) => `${v.toFixed(1)}%`} />
              {chartData.map((entry, idx) => (
                <rect key={idx} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ============================================================
// スライド10/12: 先月比テーブル
// ============================================================

const SectionComparisonTable = ({
  title,
  parsedResults,
  staffKpis,
  metrics,
}: {
  title: string
  parsedResults: ExcelParseResult[]
  staffKpis: StaffKpiInput[]
  metrics: {label: string; getCurrent: (s: StaffSalesData, kpi?: StaffKpiInput) => number | null; getPrev: (name: string) => number | null; isYen?: boolean}[]
}) => {
  const allStaff = parsedResults.flatMap((r) =>
    r.staffList.map((s) => {
      const kpi = staffKpis.find((k) => k.staffName === s.name && k.storeName === r.storeShortName)
      return {...s, storeName: r.storeShortName, kpi}
    })
  )

  const fmt = (v: number | null, isYen?: boolean) => {
    if (v == null) return '-'
    return isYen ? localFormatYen(v) : localFormatNumber(v)
  }

  return (
    <div className="bg-white py-6 px-6">
      <h3 className="text-lg font-bold mb-4" style={{color: NAVY}}>{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr style={{backgroundColor: PURPLE_HEADER, color: '#fff'}}>
              <th className="p-1.5 border border-purple-400">スタッフ</th>
              <th className="p-1.5 border border-purple-400">店舗</th>
              {metrics.map((m) => (
                <React.Fragment key={m.label}>
                  <th className="p-1.5 border border-purple-400 text-right">{m.label}_今月</th>
                  <th className="p-1.5 border border-purple-400 text-right">{m.label}_先月</th>
                  <th className="p-1.5 border border-purple-400 text-right">{m.label}_差分</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {allStaff.map((s, i) => (
              <tr key={i} className={ROW_COLORS[i % 3]}>
                <td className="p-1.5 border border-gray-200 font-medium">{s.name}</td>
                <td className="p-1.5 border border-gray-200">{s.storeName}</td>
                {metrics.map((m) => {
                  const curr = m.getCurrent(s, s.kpi)
                  const prev = m.getPrev(s.name)
                  const diff = curr != null && prev != null ? curr - prev : null
                  return (
                    <React.Fragment key={m.label}>
                      <td className="p-1.5 border border-gray-200 text-right">{fmt(curr, m.isYen)}</td>
                      <td className="p-1.5 border border-gray-200 text-right text-gray-400">{fmt(prev, m.isYen)}</td>
                      <td className={`p-1.5 border border-gray-200 text-right font-semibold ${
                        diff != null && diff > 0 ? 'text-green-600' : diff != null && diff < 0 ? 'text-red-500' : ''
                      }`}>
                        {diff != null ? (diff > 0 ? '+' : '') + fmt(diff, m.isYen) : '-'}
                      </td>
                    </React.Fragment>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============================================================
// スライド11/13: 先月比グラフ
// ============================================================

const SectionComparisonChart = ({
  title,
  parsedResults,
  staffKpis,
  barLabel1,
  barLabel2,
  lineLabel1,
  lineLabel2,
  getBar1,
  getBar2,
  getLine1,
  getLine2,
}: {
  title: string
  parsedResults: ExcelParseResult[]
  staffKpis: StaffKpiInput[]
  barLabel1: string
  barLabel2: string
  lineLabel1?: string
  lineLabel2?: string
  getBar1: (s: StaffSalesData, kpi?: StaffKpiInput) => number
  getBar2: (name: string) => number
  getLine1?: (s: StaffSalesData, kpi?: StaffKpiInput) => number
  getLine2?: (name: string) => number
}) => {
  const allStaff = parsedResults.flatMap((r) =>
    r.staffList.map((s) => {
      const kpi = staffKpis.find((k) => k.staffName === s.name && k.storeName === r.storeShortName)
      return {...s, storeName: r.storeShortName, kpi}
    })
  )

  const chartData = allStaff.map((s) => {
    const d: any = {
      name: s.name,
      [barLabel1]: getBar1(s, s.kpi),
      [barLabel2]: getBar2(s.name),
    }
    if (getLine1 && lineLabel1) d[lineLabel1] = getLine1(s, s.kpi)
    if (getLine2 && lineLabel2) d[lineLabel2] = getLine2(s.name)
    return d
  })

  const hasLines = lineLabel1 && lineLabel2

  return (
    <div className="bg-white py-6 px-6">
      <h3 className="text-lg font-bold mb-4" style={{color: NAVY}}>{title}</h3>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{fontSize: 12}} />
            <YAxis yAxisId="left" tick={{fontSize: 12}} />
            {hasLines && <YAxis yAxisId="right" orientation="right" tick={{fontSize: 12}} />}
            <Tooltip />
            <Legend wrapperStyle={{fontSize: 12}} />
            <Bar yAxisId="left" dataKey={barLabel1} fill={CHART_COLORS.barToday}>
              <LabelList dataKey={barLabel1} position="top" fontSize={10} />
            </Bar>
            <Bar yAxisId="left" dataKey={barLabel2} fill={CHART_COLORS.barPrev}>
              <LabelList dataKey={barLabel2} position="top" fontSize={10} />
            </Bar>
            {hasLines && lineLabel1 && (
              <Line yAxisId="right" type="monotone" dataKey={lineLabel1} stroke={CHART_COLORS.lineOrange} strokeWidth={2} dot={{r: 3}} />
            )}
            {hasLines && lineLabel2 && (
              <Line yAxisId="right" type="monotone" dataKey={lineLabel2} stroke={CHART_COLORS.lineGreen} strokeWidth={2} dot={{r: 3}} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ============================================================
// スライド15: 口コミ低評価共有
// ============================================================

const SectionLowReview = ({
  reviews,
  onAdd,
  onUpdate,
  onDelete,
}: {
  reviews: LocalLowReviewInput[]
  onAdd: () => void
  onUpdate: (id: string, field: keyof LocalLowReviewInput, value: string) => void
  onDelete: (id: string) => void
}) => (
  <div className="bg-white py-6 px-6">
    <SectionTitle num="03">お客様の声・低評価共有</SectionTitle>
    <div className="space-y-3">
      {reviews.length === 0 && <p className="text-gray-400 text-sm">低評価データがありません</p>}
      {reviews.map((r) => (
        <div key={r.id} className="border rounded p-2 text-xs bg-gray-50 space-y-1">
          <div className="flex gap-2 items-center">
            <select className="border rounded p-0.5 text-xs" value={r.storeName}
              onChange={(e) => onUpdate(r.id, 'storeName', e.target.value)}>
              <option value="">店舗選択</option>
              {STORE_NAMES_LOCAL.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="date" className="border rounded p-0.5 text-xs" value={r.date}
              onChange={(e) => onUpdate(r.id, 'date', e.target.value)} />
            <input className="border rounded p-0.5 text-xs flex-1" placeholder="対応状況" value={r.responseStatus}
              onChange={(e) => onUpdate(r.id, 'responseStatus', e.target.value)} />
            <button className="text-red-400 hover:text-red-600 text-xs" onClick={() => onDelete(r.id)}>削除</button>
          </div>
          <textarea className="w-full border rounded p-1 text-xs resize-none" rows={2} placeholder="口コミ内容" value={r.content}
            onChange={(e) => onUpdate(r.id, 'content', e.target.value)} />
        </div>
      ))}
      <button className="text-xs hover:opacity-80 border rounded px-2 py-1" style={{color: RED_ACCENT, borderColor: RED_ACCENT}}
        onClick={onAdd}>
        + 低評価を追加
      </button>
    </div>
  </div>
)

// ============================================================
// スライドビュー（15ページ構成）
// ============================================================

type SlideViewSectionProps = {
  parsedResults: ExcelParseResult[]
  storeKpis: Record<string, StoreKpiInput>
  staffKpis: StaffKpiInput[]
  reviews: LocalLowReviewInput[]
  onAddReview: () => void
  onUpdateReview: (id: string, field: keyof LocalLowReviewInput, value: string) => void
  onDeleteReview: (id: string) => void
}

const SlideViewSection = ({
  parsedResults,
  storeKpis,
  staffKpis,
  reviews,
  onAddReview,
  onUpdateReview,
  onDeleteReview,
}: SlideViewSectionProps) => {
  const periodLabel = parsedResults.length > 0 ? `${parsedResults[0].periodStart}～${parsedResults[0].periodEnd}` : ''

  const salesNominationMetrics = [
    {label: '売上', getCurrent: (s: StaffSalesData) => s.sales, getPrev: (name: string) => SAMPLE_PREV_STAFF[name]?.sales ?? null, isYen: true},
    {label: '指名', getCurrent: (s: StaffSalesData) => s.nominationCount, getPrev: (name: string) => SAMPLE_PREV_STAFF[name]?.nominationCount ?? null},
  ]

  const returnUnitMetrics = [
    {label: '再来率', getCurrent: (_s: StaffSalesData, kpi?: StaffKpiInput) => kpi?.returnRate ?? null, getPrev: (name: string) => SAMPLE_PREV_STAFF[name]?.returnRate ?? null},
    {label: '客単価', getCurrent: (s: StaffSalesData) => s.unitPrice, getPrev: (name: string) => SAMPLE_PREV_STAFF[name]?.unitPrice ?? null, isYen: true},
  ]

  // 指標別比較グラフ用データ（スライド4-7）
  const metricSlides: MetricComparisonProps[] = [
    {metricName: '客単価', metricKey: 'avgUnitPrice', storeKpis, prevKpis: SAMPLE_PREV_STORE_KPI, unit: '円'},
    {metricName: '稼働率', metricKey: 'utilizationRate', storeKpis, prevKpis: SAMPLE_PREV_STORE_KPI, unit: '%'},
    {metricName: '再来率', metricKey: 'returnRate', storeKpis, prevKpis: SAMPLE_PREV_STORE_KPI, unit: '%'},
    {metricName: '失客率', metricKey: 'churnRate', storeKpis, prevKpis: SAMPLE_PREV_STORE_KPI, unit: '%'},
  ]

  return (
    <div className="space-y-6 py-6 bg-gray-300 px-4">
      {/* 1: タイトル */}
      <SlidePage page={1}>
        <SectionTitleSlide periodLabel={periodLabel} />
      </SlidePage>

      {/* 2: 目次 */}
      <SlidePage page={2}>
        <SectionTableOfContents />
      </SlidePage>

      {/* 3: 全体サマリー */}
      <SlidePage page={3}>
        <SectionSummaryTable storeKpis={storeKpis} />
      </SlidePage>

      {/* 4-7: 指標別3店舗比較グラフ */}
      {metricSlides.map((ms, i) => (
        <SlidePage key={ms.metricKey} page={4 + i}>
          <SectionMetricComparison {...ms} />
        </SlidePage>
      ))}

      {/* 8: スタッフ別パフォーマンス一覧表 */}
      <SlidePage page={8}>
        <SectionStaffTable parsedResults={parsedResults} staffKpis={staffKpis} />
      </SlidePage>

      {/* 9: スタッフ別月間稼働率（縦棒グラフ） */}
      <SlidePage page={9}>
        <SectionUtilizationChart staffKpis={staffKpis} />
      </SlidePage>

      {/* 10: 先月比①テーブル */}
      <SlidePage page={10}>
        <SectionComparisonTable
          title="スタッフ別先月比一覧表①(売上金額/指名件数)"
          parsedResults={parsedResults}
          staffKpis={staffKpis}
          metrics={salesNominationMetrics}
        />
      </SlidePage>

      {/* 11: 先月比①グラフ */}
      <SlidePage page={11}>
        <SectionComparisonChart
          title="スタッフ別先月比グラフ①(売上金額/指名件数)"
          parsedResults={parsedResults}
          staffKpis={staffKpis}
          barLabel1="売上_今月"
          barLabel2="売上_先月"
          lineLabel1="指名_今月"
          lineLabel2="指名_先月"
          getBar1={(s) => s.sales}
          getBar2={(name) => SAMPLE_PREV_STAFF[name]?.sales ?? 0}
          getLine1={(s) => s.nominationCount}
          getLine2={(name) => SAMPLE_PREV_STAFF[name]?.nominationCount ?? 0}
        />
      </SlidePage>

      {/* 12: 先月比②テーブル */}
      <SlidePage page={12}>
        <SectionComparisonTable
          title="スタッフ別先月比一覧表②(再来率/客単価)"
          parsedResults={parsedResults}
          staffKpis={staffKpis}
          metrics={returnUnitMetrics}
        />
      </SlidePage>

      {/* 13: 先月比②グラフ */}
      <SlidePage page={13}>
        <SectionComparisonChart
          title="スタッフ別先月比グラフ②(再来率/客単価)"
          parsedResults={parsedResults}
          staffKpis={staffKpis}
          barLabel1="客単価_今月"
          barLabel2="客単価_先月"
          lineLabel1="再来率_今月"
          lineLabel2="再来率_先月"
          getBar1={(s) => s.unitPrice}
          getBar2={(name) => SAMPLE_PREV_STAFF[name]?.unitPrice ?? 0}
          getLine1={(_s, kpi) => kpi?.returnRate ?? 0}
          getLine2={(name) => SAMPLE_PREV_STAFF[name]?.returnRate ?? 0}
        />
      </SlidePage>

      {/* 14: 予備 */}
      <SlidePage page={14}>
        <div className="bg-white py-6 px-6">
          <h3 className="text-lg font-bold" style={{color: NAVY}}>予備ページ</h3>
        </div>
      </SlidePage>

      {/* 15: お客様の声・低評価共有 */}
      <SlidePage page={15}>
        <SectionLowReview reviews={reviews} onAdd={onAddReview} onUpdate={onUpdateReview} onDelete={onDeleteReview} />
      </SlidePage>
    </div>
  )
}

// ============================================================
// セクション: 店舗データ（旧 StoreViewClient）
// ============================================================

const StoreDataSection = () => {
  const {storeMonthly, staffMonthly} = useRegrowData()
  const [selectedStore, setSelectedStore] = useState<string>(STORE_NAMES[0])

  const storeData = useMemo(
    () =>
      storeMonthly
        .filter((r) => r.storeName === selectedStore)
        .sort((a, b) => a.month.localeCompare(b.month)),
    [storeMonthly, selectedStore]
  )

  const latestMonth = storeData.length > 0 ? storeData[storeData.length - 1].month : null
  const latestStaffData = useMemo(
    () =>
      latestMonth
        ? staffMonthly
            .filter((r) => r.storeName === selectedStore && r.month === latestMonth)
            .sort((a, b) => (b.sales ?? 0) - (a.sales ?? 0))
        : [],
    [staffMonthly, selectedStore, latestMonth]
  )

  const storeStaff = useMemo(
    () => STAFF_MASTER.filter((s) => s.storeName === selectedStore),
    [selectedStore]
  )

  const chartData = useMemo(
    () =>
      storeData.map((r) => ({
        month: formatMonthLabel(r.month),
        客単価: r.avgUnitPrice ?? 0,
        稼働率: r.utilizationRate != null ? r.utilizationRate * 100 : 0,
        再来率: r.returnRate != null ? r.returnRate * 100 : 0,
        失客率: r.churnRate != null ? r.churnRate * 100 : 0,
      })),
    [storeData]
  )

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold" style={{color: NAVY}}>店舗データ</h1>
        <select className="border rounded px-3 py-1.5 text-sm" value={selectedStore}
          onChange={(e) => setSelectedStore(e.target.value)}>
          {STORE_NAMES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <section className="bg-white rounded shadow-sm p-4">
        <h2 className="text-lg font-bold mb-3" style={{color: NAVY}}>月次KPI推移</h2>
        {storeData.length === 0 ? (
          <p className="text-gray-400 text-sm">データがありません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr style={{backgroundColor: PURPLE_HEADER, color: '#fff'}}>
                  <th className="p-2 border border-purple-400">月</th>
                  <th className="p-2 border border-purple-400 text-right">売上</th>
                  <th className="p-2 border border-purple-400 text-right">稼働率</th>
                  <th className="p-2 border border-purple-400 text-right">客単価</th>
                  <th className="p-2 border border-purple-400 text-right">再来率</th>
                  <th className="p-2 border border-purple-400 text-right">失客率</th>
                </tr>
              </thead>
              <tbody>
                {storeData.map((r, i) => (
                  <tr key={r.id} className={ROW_COLORS[i % 3]}>
                    <td className="p-2 border border-gray-200 font-medium">{formatMonthLabel(r.month)}</td>
                    <td className="p-2 border border-gray-200 text-right">{formatYen(r.sales)}</td>
                    <td className="p-2 border border-gray-200 text-right">{formatPercent(r.utilizationRate)}</td>
                    <td className="p-2 border border-gray-200 text-right">{formatYen(r.avgUnitPrice)}</td>
                    <td className="p-2 border border-gray-200 text-right">{formatPercent(r.returnRate)}</td>
                    <td className="p-2 border border-gray-200 text-right">{formatPercent(r.churnRate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {chartData.length > 0 && (
        <section className="bg-white rounded shadow-sm p-4">
          <h2 className="text-lg font-bold mb-3" style={{color: NAVY}}>KPI推移グラフ</h2>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{fontSize: 12}} />
                <YAxis yAxisId="left" tick={{fontSize: 12}} />
                <YAxis yAxisId="right" orientation="right" tick={{fontSize: 12}} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip />
                <Legend wrapperStyle={{fontSize: 12}} />
                <Bar yAxisId="left" dataKey="客単価" fill="#4285F4" barSize={30} />
                <Line yAxisId="right" type="monotone" dataKey="稼働率" stroke="#DC3545" strokeWidth={2} dot={{r: 3}} />
                <Line yAxisId="right" type="monotone" dataKey="再来率" stroke="#F5A623" strokeWidth={2} dot={{r: 3}} />
                <Line yAxisId="right" type="monotone" dataKey="失客率" stroke="#34A853" strokeWidth={2} dot={{r: 3}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <section className="bg-white rounded shadow-sm p-4">
        <h2 className="text-lg font-bold mb-3" style={{color: NAVY}}>
          所属スタッフ{latestMonth ? `（${formatMonthLabel(latestMonth)}）` : ''}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr style={{backgroundColor: PURPLE_HEADER, color: '#fff'}}>
                <th className="p-2 border border-purple-400">スタッフ</th>
                <th className="p-2 border border-purple-400 text-right">売上</th>
                <th className="p-2 border border-purple-400 text-right">稼働率</th>
                <th className="p-2 border border-purple-400 text-right">対応客数</th>
                <th className="p-2 border border-purple-400 text-right">指名数</th>
                <th className="p-2 border border-purple-400 text-right">客単価</th>
                <th className="p-2 border border-purple-400 text-right">再来率</th>
                <th className="p-2 border border-purple-400 text-right">CS登録数</th>
              </tr>
            </thead>
            <tbody>
              {latestStaffData.length > 0 ? (
                latestStaffData.map((s, i) => (
                  <tr key={s.id} className={ROW_COLORS[i % 3]}>
                    <td className="p-2 border border-gray-200 font-medium">{s.staffName}</td>
                    <td className="p-2 border border-gray-200 text-right">{formatYen(s.sales)}</td>
                    <td className="p-2 border border-gray-200 text-right">{formatPercent(s.utilizationRate)}</td>
                    <td className="p-2 border border-gray-200 text-right">{formatNumber(s.customerCount)}</td>
                    <td className="p-2 border border-gray-200 text-right">{formatNumber(s.nominationCount)}</td>
                    <td className="p-2 border border-gray-200 text-right">{formatYen(s.unitPrice)}</td>
                    <td className="p-2 border border-gray-200 text-right">{formatPercent(s.returnRate)}</td>
                    <td className="p-2 border border-gray-200 text-right">{formatNumber(s.csRegistrationCount)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-gray-400">
                    {storeStaff.length > 0 ? 'スタッフ月次データがありません' : '所属スタッフがいません'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {storeStaff.length > 0 && latestStaffData.length === 0 && (
          <p className="text-xs text-gray-400 mt-2">
            登録スタッフ: {storeStaff.map((s) => s.name).join(', ')}
          </p>
        )}
      </section>
    </div>
  )
}

// ============================================================
// セクション: スタッフデータ（旧 StaffViewClient）
// ============================================================

const StaffDataSection = () => {
  const {staffMonthly} = useRegrowData()
  const [selectedStore, setSelectedStore] = useState<string>(STORE_NAMES[0])
  const [selectedStaff, setSelectedStaff] = useState<string>('')

  const storeStaff = useMemo(
    () => STAFF_MASTER.filter((s) => s.storeName === selectedStore),
    [selectedStore]
  )

  const handleStoreChange = (store: string) => {
    setSelectedStore(store)
    const firstStaff = STAFF_MASTER.find((s) => s.storeName === store)
    setSelectedStaff(firstStaff?.name ?? '')
  }

  useMemo(() => {
    if (!selectedStaff && storeStaff.length > 0) {
      setSelectedStaff(storeStaff[0].name)
    }
  }, [storeStaff, selectedStaff])

  const staffData = useMemo(
    () =>
      staffMonthly
        .filter((r) => r.storeName === selectedStore && r.staffName === selectedStaff)
        .sort((a, b) => a.month.localeCompare(b.month)),
    [staffMonthly, selectedStore, selectedStaff]
  )

  const chartData = useMemo(
    () =>
      staffData.map((r) => ({
        month: formatMonthLabel(r.month),
        売上: r.sales ?? 0,
        客単価: r.unitPrice ?? 0,
        指名数: r.nominationCount ?? 0,
        再来率: r.returnRate != null ? r.returnRate * 100 : 0,
      })),
    [staffData]
  )

  const comparisonData = useMemo(() => {
    if (staffData.length < 2) return null
    const latest = staffData[staffData.length - 1]
    const prev = staffData[staffData.length - 2]
    return {
      latest,
      prev,
      salesDiff: (latest.sales ?? 0) - (prev.sales ?? 0),
      nominationDiff: (latest.nominationCount ?? 0) - (prev.nominationCount ?? 0),
      unitPriceDiff: (latest.unitPrice ?? 0) - (prev.unitPrice ?? 0),
      returnRateDiff: (latest.returnRate ?? 0) - (prev.returnRate ?? 0),
    }
  }, [staffData])

  const diffColor = (v: number) => (v > 0 ? 'text-green-600' : v < 0 ? 'text-red-500' : 'text-gray-500')
  const diffSign = (v: number) => (v > 0 ? '+' : '')

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-xl font-bold" style={{color: NAVY}}>スタッフデータ</h1>
        <select className="border rounded px-3 py-1.5 text-sm" value={selectedStore}
          onChange={(e) => handleStoreChange(e.target.value)}>
          {STORE_NAMES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="border rounded px-3 py-1.5 text-sm" value={selectedStaff}
          onChange={(e) => setSelectedStaff(e.target.value)}>
          {storeStaff.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
        </select>
      </div>

      {comparisonData && (
        <section className="bg-white rounded shadow-sm p-4">
          <h2 className="text-lg font-bold mb-3" style={{color: NAVY}}>
            先月比サマリー（{formatMonthLabel(comparisonData.prev.month)} → {formatMonthLabel(comparisonData.latest.month)}）
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {label: '売上', current: formatYen(comparisonData.latest.sales), diff: comparisonData.salesDiff, diffStr: `${diffSign(comparisonData.salesDiff)}${formatYen(comparisonData.salesDiff)}`},
              {label: '指名数', current: String(comparisonData.latest.nominationCount ?? 0), diff: comparisonData.nominationDiff, diffStr: `${diffSign(comparisonData.nominationDiff)}${comparisonData.nominationDiff}`},
              {label: '客単価', current: formatYen(comparisonData.latest.unitPrice), diff: comparisonData.unitPriceDiff, diffStr: `${diffSign(comparisonData.unitPriceDiff)}${formatYen(comparisonData.unitPriceDiff)}`},
              {label: '再来率', current: formatPercent(comparisonData.latest.returnRate), diff: comparisonData.returnRateDiff, diffStr: `${diffSign(comparisonData.returnRateDiff)}${(comparisonData.returnRateDiff * 100).toFixed(1)}%`},
            ].map((item) => (
              <div key={item.label} className="border rounded p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                <p className="text-lg font-bold">{item.current}</p>
                <p className={`text-sm font-semibold ${diffColor(item.diff)}`}>{item.diffStr}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="bg-white rounded shadow-sm p-4">
        <h2 className="text-lg font-bold mb-3" style={{color: NAVY}}>月次データ履歴</h2>
        {staffData.length === 0 ? (
          <p className="text-gray-400 text-sm">データがありません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr style={{backgroundColor: PURPLE_HEADER, color: '#fff'}}>
                  <th className="p-2 border border-purple-400">月</th>
                  <th className="p-2 border border-purple-400 text-right">売上</th>
                  <th className="p-2 border border-purple-400 text-right">稼働率</th>
                  <th className="p-2 border border-purple-400 text-right">対応客数</th>
                  <th className="p-2 border border-purple-400 text-right">指名数</th>
                  <th className="p-2 border border-purple-400 text-right">客単価</th>
                  <th className="p-2 border border-purple-400 text-right">再来率</th>
                  <th className="p-2 border border-purple-400 text-right">CS登録数</th>
                </tr>
              </thead>
              <tbody>
                {staffData.map((r, i) => (
                  <tr key={r.id} className={ROW_COLORS[i % 3]}>
                    <td className="p-2 border border-gray-200 font-medium">{formatMonthLabel(r.month)}</td>
                    <td className="p-2 border border-gray-200 text-right">{formatYen(r.sales)}</td>
                    <td className="p-2 border border-gray-200 text-right">{formatPercent(r.utilizationRate)}</td>
                    <td className="p-2 border border-gray-200 text-right">{formatNumber(r.customerCount)}</td>
                    <td className="p-2 border border-gray-200 text-right">{formatNumber(r.nominationCount)}</td>
                    <td className="p-2 border border-gray-200 text-right">{formatYen(r.unitPrice)}</td>
                    <td className="p-2 border border-gray-200 text-right">{formatPercent(r.returnRate)}</td>
                    <td className="p-2 border border-gray-200 text-right">{formatNumber(r.csRegistrationCount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {chartData.length > 0 && (
        <section className="bg-white rounded shadow-sm p-4">
          <h2 className="text-lg font-bold mb-3" style={{color: NAVY}}>推移グラフ</h2>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{fontSize: 12}} />
                <YAxis yAxisId="left" tick={{fontSize: 12}} />
                <YAxis yAxisId="right" orientation="right" tick={{fontSize: 12}} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip />
                <Legend wrapperStyle={{fontSize: 12}} />
                <Bar yAxisId="left" dataKey="売上" fill="#4285F4" barSize={30} />
                <Line yAxisId="left" type="monotone" dataKey="指名数" stroke="#F5A623" strokeWidth={2} dot={{r: 3}} />
                <Line yAxisId="right" type="monotone" dataKey="再来率" stroke="#DC3545" strokeWidth={2} dot={{r: 3}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}
    </div>
  )
}

// ============================================================
// セクション: 手入力管理（旧 InputManagementClient）
// ============================================================

type InputTabKey = 'store' | 'staff' | 'review'

const StoreMonthlyTab = () => {
  const {storeMonthly, addStoreMonthly, updateStoreMonthly, deleteStoreMonthly} = useRegrowData()
  const [filterStore, setFilterStore] = useState<string>('')
  const [filterMonth, setFilterMonth] = useState<string>('')

  const availableMonths = useMemo(
    () => [...new Set(storeMonthly.map((r) => r.month))].sort(),
    [storeMonthly]
  )

  const filtered = useMemo(
    () =>
      storeMonthly
        .filter((r) => (!filterStore || r.storeName === filterStore) && (!filterMonth || r.month === filterMonth))
        .sort((a, b) => a.month.localeCompare(b.month) || a.storeName.localeCompare(b.storeName)),
    [storeMonthly, filterStore, filterMonth]
  )

  const handleAdd = () => {
    const now = new Date()
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    addStoreMonthly({month, storeName: STORE_NAMES[0], sales: null, utilizationRate: null, avgUnitPrice: null, returnRate: null, churnRate: null})
  }

  const handleCellChange = (id: string, field: keyof StoreMonthlyInput, value: string) => {
    if (field === 'month' || field === 'storeName') {
      updateStoreMonthly(id, {[field]: value})
    } else {
      updateStoreMonthly(id, {[field]: value === '' ? null : Number(value)})
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <select className="border rounded px-2 py-1 text-xs" value={filterStore} onChange={(e) => setFilterStore(e.target.value)}>
          <option value="">全店舗</option>
          {STORE_NAMES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="border rounded px-2 py-1 text-xs" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
          <option value="">全月</option>
          {availableMonths.map((m) => <option key={m} value={m}>{formatMonthLabel(m)}</option>)}
        </select>
        <button className="text-xs px-3 py-1 rounded border font-medium hover:opacity-80" style={{color: RED_ACCENT, borderColor: RED_ACCENT}} onClick={handleAdd}>+ 行追加</button>
        <span className="text-xs text-gray-400">{filtered.length}件</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr style={{backgroundColor: PURPLE_HEADER, color: '#fff'}}>
              <th className="p-1.5 border border-purple-400 w-24">月</th>
              <th className="p-1.5 border border-purple-400 w-24">店舗</th>
              <th className="p-1.5 border border-purple-400 text-right">売上</th>
              <th className="p-1.5 border border-purple-400 text-right">稼働率</th>
              <th className="p-1.5 border border-purple-400 text-right">客単価</th>
              <th className="p-1.5 border border-purple-400 text-right">再来率</th>
              <th className="p-1.5 border border-purple-400 text-right">失客率</th>
              <th className="p-1.5 border border-purple-400 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={r.id} className={ROW_COLORS[i % 3]}>
                <td className="p-1 border border-gray-200">
                  <input type="month" className="w-full text-xs p-0.5 border rounded" value={r.month} onChange={(e) => handleCellChange(r.id, 'month', e.target.value)} />
                </td>
                <td className="p-1 border border-gray-200">
                  <select className="w-full text-xs p-0.5 border rounded" value={r.storeName} onChange={(e) => handleCellChange(r.id, 'storeName', e.target.value)}>
                    {STORE_NAMES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-1 border border-gray-200"><input type="number" className="w-full text-right text-xs p-0.5 border rounded" value={r.sales ?? ''} onChange={(e) => handleCellChange(r.id, 'sales', e.target.value)} /></td>
                <td className="p-1 border border-gray-200"><input type="number" step="0.01" className="w-full text-right text-xs p-0.5 border rounded" value={r.utilizationRate ?? ''} onChange={(e) => handleCellChange(r.id, 'utilizationRate', e.target.value)} /></td>
                <td className="p-1 border border-gray-200"><input type="number" className="w-full text-right text-xs p-0.5 border rounded" value={r.avgUnitPrice ?? ''} onChange={(e) => handleCellChange(r.id, 'avgUnitPrice', e.target.value)} /></td>
                <td className="p-1 border border-gray-200"><input type="number" step="0.001" className="w-full text-right text-xs p-0.5 border rounded" value={r.returnRate ?? ''} onChange={(e) => handleCellChange(r.id, 'returnRate', e.target.value)} /></td>
                <td className="p-1 border border-gray-200"><input type="number" step="0.001" className="w-full text-right text-xs p-0.5 border rounded" value={r.churnRate ?? ''} onChange={(e) => handleCellChange(r.id, 'churnRate', e.target.value)} /></td>
                <td className="p-1 border border-gray-200 text-center"><button className="text-red-400 hover:text-red-600" onClick={() => deleteStoreMonthly(r.id)}>x</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const StaffMonthlyTab = () => {
  const {staffMonthly, addStaffMonthly, updateStaffMonthly, deleteStaffMonthly} = useRegrowData()
  const [filterStore, setFilterStore] = useState<string>('')
  const [filterMonth, setFilterMonth] = useState<string>('')
  const [filterStaff, setFilterStaff] = useState<string>('')

  const availableMonths = useMemo(() => [...new Set(staffMonthly.map((r) => r.month))].sort(), [staffMonthly])
  const availableStaff = useMemo(() => STAFF_MASTER.filter((s) => !filterStore || s.storeName === filterStore), [filterStore])

  const filtered = useMemo(
    () =>
      staffMonthly
        .filter((r) => (!filterStore || r.storeName === filterStore) && (!filterMonth || r.month === filterMonth) && (!filterStaff || r.staffName === filterStaff))
        .sort((a, b) => a.month.localeCompare(b.month) || a.storeName.localeCompare(b.storeName) || a.staffName.localeCompare(b.staffName)),
    [staffMonthly, filterStore, filterMonth, filterStaff]
  )

  const handleAdd = () => {
    const now = new Date()
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const firstStaff = STAFF_MASTER[0]
    addStaffMonthly({month, storeName: firstStaff.storeName, staffName: firstStaff.name, sales: null, utilizationRate: null, customerCount: null, nominationCount: null, unitPrice: null, returnRate: null, csRegistrationCount: null})
  }

  const handleCellChange = (id: string, field: keyof StaffMonthlyInput, value: string) => {
    if (field === 'month' || field === 'storeName' || field === 'staffName') {
      updateStaffMonthly(id, {[field]: value})
    } else {
      updateStaffMonthly(id, {[field]: value === '' ? null : Number(value)})
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <select className="border rounded px-2 py-1 text-xs" value={filterStore} onChange={(e) => { setFilterStore(e.target.value); setFilterStaff('') }}>
          <option value="">全店舗</option>
          {STORE_NAMES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="border rounded px-2 py-1 text-xs" value={filterStaff} onChange={(e) => setFilterStaff(e.target.value)}>
          <option value="">全スタッフ</option>
          {availableStaff.map((s) => <option key={s.name} value={s.name}>{s.name}（{s.storeName}）</option>)}
        </select>
        <select className="border rounded px-2 py-1 text-xs" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
          <option value="">全月</option>
          {availableMonths.map((m) => <option key={m} value={m}>{formatMonthLabel(m)}</option>)}
        </select>
        <button className="text-xs px-3 py-1 rounded border font-medium hover:opacity-80" style={{color: RED_ACCENT, borderColor: RED_ACCENT}} onClick={handleAdd}>+ 行追加</button>
        <span className="text-xs text-gray-400">{filtered.length}件</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr style={{backgroundColor: PURPLE_HEADER, color: '#fff'}}>
              <th className="p-1.5 border border-purple-400 w-24">月</th>
              <th className="p-1.5 border border-purple-400 w-20">店舗</th>
              <th className="p-1.5 border border-purple-400 w-16">スタッフ</th>
              <th className="p-1.5 border border-purple-400 text-right">売上</th>
              <th className="p-1.5 border border-purple-400 text-right">稼働率</th>
              <th className="p-1.5 border border-purple-400 text-right">対応客数</th>
              <th className="p-1.5 border border-purple-400 text-right">指名数</th>
              <th className="p-1.5 border border-purple-400 text-right">客単価</th>
              <th className="p-1.5 border border-purple-400 text-right">再来率</th>
              <th className="p-1.5 border border-purple-400 text-right">CS登録</th>
              <th className="p-1.5 border border-purple-400 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={r.id} className={ROW_COLORS[i % 3]}>
                <td className="p-1 border border-gray-200"><input type="month" className="w-full text-xs p-0.5 border rounded" value={r.month} onChange={(e) => handleCellChange(r.id, 'month', e.target.value)} /></td>
                <td className="p-1 border border-gray-200">
                  <select className="w-full text-xs p-0.5 border rounded" value={r.storeName} onChange={(e) => handleCellChange(r.id, 'storeName', e.target.value)}>
                    {STORE_NAMES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-1 border border-gray-200">
                  <select className="w-full text-xs p-0.5 border rounded" value={r.staffName} onChange={(e) => handleCellChange(r.id, 'staffName', e.target.value)}>
                    {STAFF_MASTER.filter((s) => s.storeName === r.storeName).map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
                  </select>
                </td>
                <td className="p-1 border border-gray-200"><input type="number" className="w-full text-right text-xs p-0.5 border rounded" value={r.sales ?? ''} onChange={(e) => handleCellChange(r.id, 'sales', e.target.value)} /></td>
                <td className="p-1 border border-gray-200"><input type="number" step="0.01" className="w-full text-right text-xs p-0.5 border rounded" value={r.utilizationRate ?? ''} onChange={(e) => handleCellChange(r.id, 'utilizationRate', e.target.value)} /></td>
                <td className="p-1 border border-gray-200"><input type="number" className="w-full text-right text-xs p-0.5 border rounded" value={r.customerCount ?? ''} onChange={(e) => handleCellChange(r.id, 'customerCount', e.target.value)} /></td>
                <td className="p-1 border border-gray-200"><input type="number" className="w-full text-right text-xs p-0.5 border rounded" value={r.nominationCount ?? ''} onChange={(e) => handleCellChange(r.id, 'nominationCount', e.target.value)} /></td>
                <td className="p-1 border border-gray-200"><input type="number" className="w-full text-right text-xs p-0.5 border rounded" value={r.unitPrice ?? ''} onChange={(e) => handleCellChange(r.id, 'unitPrice', e.target.value)} /></td>
                <td className="p-1 border border-gray-200"><input type="number" step="0.001" className="w-full text-right text-xs p-0.5 border rounded" value={r.returnRate ?? ''} onChange={(e) => handleCellChange(r.id, 'returnRate', e.target.value)} /></td>
                <td className="p-1 border border-gray-200"><input type="number" className="w-full text-right text-xs p-0.5 border rounded" value={r.csRegistrationCount ?? ''} onChange={(e) => handleCellChange(r.id, 'csRegistrationCount', e.target.value)} /></td>
                <td className="p-1 border border-gray-200 text-center"><button className="text-red-400 hover:text-red-600" onClick={() => deleteStaffMonthly(r.id)}>x</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const LowReviewTab = () => {
  const {lowReviews, addLowReview, updateLowReview, deleteLowReview} = useRegrowData()
  const [filterStore, setFilterStore] = useState<string>('')

  const filtered = useMemo(
    () => lowReviews.filter((r) => !filterStore || r.storeName === filterStore).sort((a, b) => b.date.localeCompare(a.date)),
    [lowReviews, filterStore]
  )

  const handleAdd = () => {
    addLowReview({date: '', storeName: STORE_NAMES[0], content: '', responseStatus: ''})
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <select className="border rounded px-2 py-1 text-xs" value={filterStore} onChange={(e) => setFilterStore(e.target.value)}>
          <option value="">全店舗</option>
          {STORE_NAMES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="text-xs px-3 py-1 rounded border font-medium hover:opacity-80" style={{color: RED_ACCENT, borderColor: RED_ACCENT}} onClick={handleAdd}>+ 口コミ追加</button>
        <span className="text-xs text-gray-400">{filtered.length}件</span>
      </div>
      {filtered.length === 0 ? (
        <p className="text-gray-400 text-sm">データがありません</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white border rounded p-3 space-y-2">
              <div className="flex items-center gap-2">
                <input type="date" className="border rounded px-2 py-1 text-xs" value={r.date} onChange={(e) => updateLowReview(r.id, {date: e.target.value})} />
                <select className="border rounded px-2 py-1 text-xs" value={r.storeName} onChange={(e) => updateLowReview(r.id, {storeName: e.target.value})}>
                  {STORE_NAMES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <input className="border rounded px-2 py-1 text-xs flex-1" placeholder="対応状況" value={r.responseStatus} onChange={(e) => updateLowReview(r.id, {responseStatus: e.target.value})} />
                <button className="text-red-400 hover:text-red-600 text-xs" onClick={() => deleteLowReview(r.id)}>削除</button>
              </div>
              <textarea className="w-full border rounded p-2 text-xs resize-none" rows={2} placeholder="口コミ内容" value={r.content} onChange={(e) => updateLowReview(r.id, {content: e.target.value})} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const InputManagementSection = () => {
  const [activeTab, setActiveTab] = useState<InputTabKey>('store')

  const tabs: {key: InputTabKey; label: string}[] = [
    {key: 'store', label: '店舗月次'},
    {key: 'staff', label: 'スタッフ月次'},
    {key: 'review', label: '口コミ低評価'},
  ]

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold" style={{color: NAVY}}>手入力データ管理</h1>
      <div className="flex border-b">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key ? '' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            style={activeTab === tab.key ? {borderColor: RED_ACCENT, color: RED_ACCENT} : {}}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === 'store' && <StoreMonthlyTab />}
      {activeTab === 'staff' && <StaffMonthlyTab />}
      {activeTab === 'review' && <LowReviewTab />}
    </div>
  )
}

// ============================================================
// メインコンポーネント
// ============================================================

const SECTIONS: {key: SectionKey; label: string}[] = [
  {key: 'import', label: 'Excel取込'},
  {key: 'data', label: '元データ確認'},
  {key: 'slides', label: 'スライド資料'},
  {key: 'store', label: '店舗データ'},
  {key: 'staff', label: 'スタッフデータ'},
  {key: 'input', label: '手入力管理'},
]

const RegrowMockUnified = () => {
  const [activeSection, setActiveSection] = useState<SectionKey>('import')
  const [parsedResults, setParsedResults] = useState<ExcelParseResult[]>([])
  const [storeKpis, setStoreKpis] = useState<Record<string, StoreKpiInput>>(() => {
    const initial: Record<string, StoreKpiInput> = {}
    STORE_NAMES_LOCAL.forEach((s) => {
      initial[s] = {storeName: s, sales: null, utilizationRate: null, avgUnitPrice: null, returnRate: null, churnRate: null, comment: ''}
    })
    return initial
  })
  const [staffKpis, setStaffKpis] = useState<StaffKpiInput[]>([])
  const [reviews, setReviews] = useState<LocalLowReviewInput[]>([])

  const handleParsed = useCallback((result: ExcelParseResult) => {
    setParsedResults((prev) => {
      const filtered = prev.filter((r) => r.storeShortName !== result.storeShortName)
      return [...filtered, result]
    })
    setStaffKpis((prev) => {
      const existingNames = prev.filter((k) => k.storeName === result.storeShortName).map((k) => k.staffName)
      const newKpis = result.staffList
        .filter((s) => !existingNames.includes(s.name))
        .map((s) => ({staffName: s.name, storeName: result.storeShortName, utilizationRate: null, returnRate: null, csRegistrationCount: null, utilizationGrade: null}))
      const otherStoreKpis = prev.filter((k) => k.storeName !== result.storeShortName)
      const thisStoreKpis = prev.filter((k) => k.storeName === result.storeShortName)
      return [...otherStoreKpis, ...thisStoreKpis, ...newKpis]
    })
    setActiveSection('data')
  }, [])

  const handleStoreKpiChange = useCallback((storeName: string, field: keyof StoreKpiInput, value: any) => {
    setStoreKpis((prev) => ({...prev, [storeName]: {...prev[storeName], [field]: value}}))
  }, [])

  const handleStaffKpiChange = useCallback((index: number, field: keyof StaffKpiInput, value: any) => {
    setStaffKpis((prev) => {
      const next = [...prev]
      next[index] = {...next[index], [field]: value}
      return next
    })
  }, [])

  const handleAddReview = useCallback(() => {
    setReviews((prev) => [...prev, {id: generateId(), storeName: '', date: '', content: '', responseStatus: ''}])
  }, [])

  const handleUpdateReview = useCallback((id: string, field: keyof LocalLowReviewInput, value: string) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? {...r, [field]: value} : r)))
  }, [])

  const handleDeleteReview = useCallback((id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id))
  }, [])

  return (
    <div className="max-w-6xl mx-auto">
      {/* セクション切替タブ */}
      <div className="flex border-b bg-white sticky top-0 z-10 overflow-x-auto">
        {SECTIONS.map((sec) => (
          <button
            key={sec.key}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeSection === sec.key ? 'text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            style={activeSection === sec.key ? {borderColor: RED_ACCENT, color: RED_ACCENT} : {}}
            onClick={() => setActiveSection(sec.key)}
          >
            {sec.label}
            {sec.key === 'import' && parsedResults.length > 0 && (
              <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full" style={{backgroundColor: '#FDF0ED', color: RED_ACCENT}}>
                {parsedResults.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* セクションコンテンツ */}
      {activeSection === 'import' && <ExcelImportSection onParsed={handleParsed} parsedResults={parsedResults} />}
      {activeSection === 'data' && (
        <DataViewSection
          parsedResults={parsedResults}
          storeKpis={storeKpis}
          staffKpis={staffKpis}
          onStoreKpiChange={handleStoreKpiChange}
          onStaffKpiChange={handleStaffKpiChange}
        />
      )}
      {activeSection === 'slides' && (
        <SlideViewSection
          parsedResults={parsedResults}
          storeKpis={storeKpis}
          staffKpis={staffKpis}
          reviews={reviews}
          onAddReview={handleAddReview}
          onUpdateReview={handleUpdateReview}
          onDeleteReview={handleDeleteReview}
        />
      )}
      {activeSection === 'store' && <StoreDataSection />}
      {activeSection === 'staff' && <StaffDataSection />}
      {activeSection === 'input' && <InputManagementSection />}
    </div>
  )
}

export default RegrowMockUnified
