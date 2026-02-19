'use client'

import {useState} from 'react'
import type {
  TreatmentContentData,
  KanriKeikakuData,
  HygieneGuidanceData,
  OralExamRecordData,
  OralFunctionPlanData,
  OralHygieneManagementData,
} from './types'

// =============================================================================
// 共通スタイル（A4用紙レイアウト）
// =============================================================================

const pageStyle = {
  width: '210mm',
  minHeight: '297mm',
  padding: '12mm 15mm',
} as const

const PageWrapper = ({children}: {children: React.ReactNode}) => (
  <div className="bg-white shadow-lg mx-auto print:shadow-none print:mx-0" style={pageStyle}>
    {children}
  </div>
)

/** チェックボックス（onToggle指定時はクリックで切り替え可能） */
const Chk = ({checked, label, onToggle}: {checked: boolean; label?: string; onToggle?: () => void}) => (
  <span
    className={`inline-flex items-center gap-0.5 text-xs ${onToggle ? 'cursor-pointer' : ''}`}
    onClick={onToggle}
  >
    <span className={`inline-block w-3 h-3 border border-gray-600 text-center leading-3 ${checked ? 'bg-gray-800 text-white' : ''}`}>
      {checked ? '✓' : ''}
    </span>
    {label && <span>{label}</span>}
  </span>
)

/** セクションヘッダー */
const SectionTitle = ({children}: {children: React.ReactNode}) => (
  <div className="text-xs font-bold border-b border-gray-800 pb-0.5 mb-1 mt-3">{children}</div>
)

/** 自動引用ボタンバー（各プレビュー共通） */
const AutoQuoteBar = ({onQuote, hasHighlights}: {onQuote: () => void; hasHighlights: boolean}) => (
  <div className="flex items-center gap-3 mb-2 print:hidden">
    <button
      onClick={onQuote}
      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
    >
      自動引用する
    </button>
    {hasHighlights && (
      <span className="text-[10px] text-gray-500">
        <span className="inline-block w-3 h-3 bg-yellow-100 border border-yellow-300 rounded mr-1 align-middle" />
        自動入力された項目
      </span>
    )}
  </div>
)

/** ハイライトクラス生成 */
const hlClass = (highlighted: Set<string>, field: string) => highlighted.has(field) ? 'bg-yellow-100 rounded px-0.5' : ''

// =============================================================================
// A. 訪問歯科診療治療内容説明書（PDF01準拠）
// =============================================================================

const DEFAULT_POSITIONS = {upper: false, lower: false, front: false, right: false, left: false}
const DEFAULT_POSITIONS_ALL = {all: false, upper: false, lower: false, front: false, right: false, left: false}

export const getDefaultTreatmentContentData = (): TreatmentContentData => ({
  documentNo: '',
  patientName: '',
  visitDate: '',
  startTime: '',
  endTime: '',
  anesthesia: false,
  anesthesiaPositions: {...DEFAULT_POSITIONS},
  gumTreatment: false,
  gumPositions: {...DEFAULT_POSITIONS},
  gumExam: false,
  gumScaling: false,
  rootTreatment: false,
  rootPositions: {...DEFAULT_POSITIONS},
  extraction: false,
  extractionPositions: {...DEFAULT_POSITIONS},
  extractionSuture: false,
  extractionRemoval: false,
  smallCavity: false,
  smallCavityPositions: {...DEFAULT_POSITIONS},
  crownBridge: false,
  crownPositions: {...DEFAULT_POSITIONS},
  crownMold: false,
  crownAttach: false,
  newDenture: false,
  newDenturePositions: {...DEFAULT_POSITIONS_ALL},
  newDentureMold: false,
  newDentureBite: false,
  newDentureTrial: false,
  newDentureAttach: false,
  dentureRepair: false,
  dentureRepairPositions: {...DEFAULT_POSITIONS_ALL},
  dentureReline: false,
  dentureRepairFix: false,
  dentureAdjust: false,
  dentureAdjustPositions: {...DEFAULT_POSITIONS},
  oralStretch: false,
  xray: false,
  medication: false,
  otherTreatment: false,
  otherTreatmentText: '',
  contactNotes: '',
  careNotes: '',
  clinicName: '',
  clinicAddress: '',
  clinicPhone: '',
  doctorName: '',
})

type HoumonChiryouProps = {
  data: TreatmentContentData
  onChange: (d: TreatmentContentData) => void
  /** 自動引用データ（ボタン押下で適用） */
  autoQuoteData?: Partial<TreatmentContentData>
}

export const HoumonChiryouPreview = ({data, onChange, autoQuoteData}: HoumonChiryouProps) => {
  /** 自動引用でハイライトされたフィールド */
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set())

  const toggle = (field: keyof TreatmentContentData) => {
    onChange({...data, [field]: !data[field as keyof TreatmentContentData]})
  }

  const togglePos = (field: string, key: string) => {
    const current = data[field as keyof TreatmentContentData] as Record<string, boolean>
    onChange({...data, [field]: {...current, [key]: !current[key]}})
  }

  /** 自動引用実行 */
  const handleAutoQuote = () => {
    if (!autoQuoteData) return
    const keys = Object.keys(autoQuoteData) as (keyof TreatmentContentData)[]
    const filledKeys = keys.filter(k => autoQuoteData[k] !== undefined && autoQuoteData[k] !== '')
    onChange({...data, ...autoQuoteData} as TreatmentContentData)
    setHighlighted(new Set(filledKeys))
  }

  const hl = (field: string) => hlClass(highlighted, field)

  /** チェックボックスラベル */
  const C = ({field, label}: {field: keyof TreatmentContentData; label: string}) => (
    <label className="inline-flex items-center gap-0.5 cursor-pointer whitespace-nowrap">
      <input type="checkbox" checked={!!data[field]} onChange={() => toggle(field)} className="w-3 h-3 accent-gray-800" />
      {label}
    </label>
  )

  /** 位置チェック（□上 □下 □前 □右 □左）*/
  const Pos = ({field, withAll}: {field: string; withAll?: boolean}) => {
    const keys = withAll ? ['all', 'upper', 'lower', 'front', 'right', 'left'] : ['upper', 'lower', 'front', 'right', 'left']
    const labels = withAll ? ['全', '上', '下', '前', '右', '左'] : ['上', '下', '前', '右', '左']
    return (
      <span className="inline-flex items-center gap-0.5">
        （
        {keys.map((k, i) => (
          <label key={k} className="inline-flex items-center gap-0 cursor-pointer mx-0.5">
            <input
              type="checkbox"
              checked={(data[field as keyof TreatmentContentData] as Record<string, boolean>)?.[k] || false}
              onChange={() => togglePos(field, k)}
              className="w-3 h-3 accent-gray-800"
            />
            {labels[i]}
          </label>
        ))}
        ）
      </span>
    )
  }

  const bdr = 'border-gray-700'

  return (
    <PageWrapper>
      {autoQuoteData && <AutoQuoteBar onQuote={handleAutoQuote} hasHighlights={highlighted.size > 0} />}

      {/* タイトル＋No. */}
      <div className="flex justify-between items-start mb-1">
        <div className="flex-1" />
        <h1 className="text-base font-bold tracking-widest">訪問歯科診療治療内容説明書</h1>
        <div className="flex-1 text-right text-[11px]">No.{data.documentNo || '______'}</div>
      </div>

      {/* 患者名 */}
      <div className={`text-[11px] mb-1 border-b border-gray-400 pb-0.5 inline-block ${hl('patientName')}`}>
        <input
          type="text"
          value={data.patientName}
          onChange={e => onChange({...data, patientName: e.target.value})}
          className="bg-transparent border-none outline-none w-32 text-[11px]"
          placeholder="患者名"
        />
        <span className="ml-1">様</span>
      </div>

      {/* メインテーブル（実施日〜フッターまで1つの連続テーブル） */}
      <table className={`w-full border-collapse border ${bdr} text-[11px] leading-relaxed`}>
        <tbody>
          {/* 実施日 */}
          <tr className={`border-b ${bdr}`}>
            <td className={`border-r ${bdr} w-[70px] py-1 px-2 align-middle text-center font-medium`}>実施日</td>
            <td className="py-1 px-2">
              <span className="inline-flex items-center gap-1 flex-wrap">
                <span className={hl('visitDate')}>
                  <input
                    type="text"
                    value={data.visitDate}
                    onChange={e => onChange({...data, visitDate: e.target.value})}
                    className="bg-transparent border-b border-gray-400 outline-none w-44 text-[11px]"
                    placeholder="令和○年○月○日（○）"
                  />
                </span>
                <span className="ml-6">開始</span>
                <span className={hl('startTime')}>
                  <input
                    type="text"
                    value={data.startTime}
                    onChange={e => onChange({...data, startTime: e.target.value})}
                    className="bg-transparent border-b border-gray-400 outline-none w-12 text-[11px] text-center"
                    placeholder="00:00"
                  />
                </span>
                <span>～</span>
                <span>終了</span>
                <span className={hl('endTime')}>
                  <input
                    type="text"
                    value={data.endTime}
                    onChange={e => onChange({...data, endTime: e.target.value})}
                    className="bg-transparent border-b border-gray-400 outline-none w-12 text-[11px] text-center"
                    placeholder="00:00"
                  />
                </span>
              </span>
            </td>
          </tr>

          {/* 本日の治療内容 */}
          <tr className={`border-b ${bdr}`}>
            <td className={`border-r ${bdr} py-2 px-2 align-top text-center font-medium leading-snug`}>
              本日の<br />治療内容
            </td>
            <td className="py-1.5 px-2 space-y-[3px]">
              {/* 麻酔 */}
              <div><C field="anesthesia" label="麻酔をしました" /> <Pos field="anesthesiaPositions" /></div>

              {/* 歯ぐきの治療 */}
              <div>
                <C field="gumTreatment" label="歯ぐきの治療をしました" /> <Pos field="gumPositions" />
                <div className="pl-[140px]">
                  <C field="gumExam" label="歯ぐきの検査をしました" />
                  <span className="ml-2"><C field="gumScaling" label="歯石をとりました" /></span>
                </div>
              </div>

              {/* 根の治療 */}
              <div><C field="rootTreatment" label="根の治療をしました" /> <Pos field="rootPositions" /></div>

              {/* 歯を抜きました */}
              <div>
                <C field="extraction" label="歯を抜きました" /> <Pos field="extractionPositions" />
                <div className="pl-[140px]">
                  <C field="extractionSuture" label="縫合しました" />
                  <span className="ml-2"><C field="extractionRemoval" label="抜糸しました" /></span>
                </div>
              </div>

              {/* 小さな虫歯 */}
              <div><C field="smallCavity" label="小さな虫歯の治療をしました" /> <Pos field="smallCavityPositions" /></div>

              {/* 冠・ブリッジ */}
              <div>
                <C field="crownBridge" label="冠・ブリッジを作ります" /> <Pos field="crownPositions" />
                <div className="pl-[140px]">
                  <C field="crownMold" label="型をとりました" />
                  <span className="ml-2"><C field="crownAttach" label="装着しました" /></span>
                </div>
              </div>

              {/* 新しい入れ歯 */}
              <div>
                <C field="newDenture" label="新しい入れ歯を作ります" /> <Pos field="newDenturePositions" withAll />
                <div className="pl-[140px]">
                  <C field="newDentureMold" label="型をとりました" />
                  <span className="ml-2"><C field="newDentureBite" label="かみ合わせを取りました" /></span>
                </div>
                <div className="pl-[140px]">
                  <C field="newDentureTrial" label="仮合わせをしました" />
                  <span className="ml-2"><C field="newDentureAttach" label="装着しました" /></span>
                </div>
              </div>

              {/* お持ちの入れ歯を修理 */}
              <div>
                <C field="dentureRepair" label="お持ちの入れ歯を修理します" /> <Pos field="dentureRepairPositions" withAll />
                <div className="pl-[140px]">
                  <C field="dentureReline" label="裏打ちしました" />
                  <span className="ml-2"><C field="dentureRepairFix" label="修理しました" /></span>
                </div>
              </div>

              {/* 入れ歯の調整 */}
              <div><C field="dentureAdjust" label="入れ歯の調整をしました" /> <Pos field="dentureAdjustPositions" /></div>

              {/* 口腔周囲筋ストレッチ＋レントゲン（同じ行） */}
              <div>
                <C field="oralStretch" label="口腔周囲筋ストレッチをしました" />
                <span className="ml-8"><C field="xray" label="レントゲンを撮影しました" /></span>
              </div>

              {/* お薬 */}
              <div><C field="medication" label="お薬をだしました" /></div>

              {/* その他 */}
              <div className="flex items-start gap-1">
                <C field="otherTreatment" label="その他" />
                <div className={`flex-1 border ${bdr} min-h-[24px] ml-2`}>
                  <input
                    type="text"
                    value={data.otherTreatmentText}
                    onChange={e => onChange({...data, otherTreatmentText: e.target.value})}
                    className="w-full bg-transparent border-none outline-none text-[11px] px-1 py-0.5"
                  />
                </div>
              </div>
            </td>
          </tr>

          {/* 連絡事項 */}
          <tr className={`border-b ${bdr}`}>
            <td className={`border-r ${bdr} py-1 px-2 align-top text-center font-medium`}>連絡事項</td>
            <td className="py-1 px-2">
              <textarea
                value={data.contactNotes}
                onChange={e => onChange({...data, contactNotes: e.target.value})}
                className="w-full bg-transparent border-none outline-none text-[11px] resize-none min-h-[60px] leading-relaxed"
                placeholder="連絡事項を入力..."
              />
            </td>
          </tr>

          {/* 療養上の注意点 */}
          <tr className={`border-b ${bdr}`}>
            <td className={`border-r ${bdr} py-1 px-2 align-top text-center font-medium leading-snug`}>
              療養上の<br />注意点
            </td>
            <td className="py-1 px-2">
              <textarea
                value={data.careNotes}
                onChange={e => onChange({...data, careNotes: e.target.value})}
                className="w-full bg-transparent border-none outline-none text-[11px] resize-none min-h-[50px] leading-relaxed"
                placeholder="療養上の注意点を入力..."
              />
            </td>
          </tr>

          {/* フッター */}
          <tr>
            <td className={`border-r ${bdr} py-1 px-1 align-middle text-center font-medium leading-snug text-[10px]`}>
              保険医療機関名<br />所在地・電話番号<br />担当歯科医
            </td>
            <td className="py-1.5 px-3">
              <div className={hl('clinicName')}>{data.clinicName || <span className="text-gray-300">医療機関名</span>}</div>
              <div className={hl('clinicAddress')}>{data.clinicAddress || <span className="text-gray-300">所在地</span>}</div>
              <div className={hl('clinicPhone')}>TEL　{data.clinicPhone || <span className="text-gray-300">電話番号</span>}</div>
              <div className={`mt-0.5 ${hl('doctorName')}`}>歯科医師　{data.doctorName || <span className="text-gray-300">医師名</span>}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </PageWrapper>
  )
}

// =============================================================================
// B. 歯在管管理計画書（PDF02準拠）
// =============================================================================

export const getDefaultKanriKeikakuData = (): KanriKeikakuData => ({
  documentNo: '',
  patientName: '',
  date: '',
  hasDiseases: false,
  diseaseNames: '',
  hasMedication: false,
  medicationNames: '',
  pneumoniaHistory: 'none',
  malnutritionRisk: 'none',
  dietType: '普通食',
  dietSubType: '',
  isNonOral: false,
  cleaningStatus: 'good',
  oralDryness: 'none',
  hasCavity: false,
  hasPeriodontal: false,
  periodontalInflammation: false,
  periodontalMobility: false,
  periodontalUrgency: false,
  hasSoftTissueDisease: false,
  softTissueUrgency: false,
  dentureUpperUsed: false,
  dentureUpperNotUsed: false,
  dentureLowerUsed: false,
  dentureLowerNotUsed: false,
  biteStability: false,
  dentureNeeded: false,
  specialNotes: '',
  masticationStatus: 'good',
  swallowingStatus: 'good',
  pronunciationStatus: 'good',
  tongueMovement: 'good',
  cleaningSelf: 'independent',
  tubeFeeding: false,
  seatRetention: 'good',
  mouthOpening: 'possible',
  gargling: 'possible',
  managementPolicy: '',
  clinicName: '',
  doctorName: '',
})

type KanriKeikakuProps = {
  data: KanriKeikakuData
  onChange: (d: KanriKeikakuData) => void
  autoQuoteData?: Partial<KanriKeikakuData>
}

export const KanriKeikakuPreviewNew = ({data, onChange, autoQuoteData}: KanriKeikakuProps) => {
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set())
  const hl = (field: string) => hlClass(highlighted, field)

  const handleAutoQuote = () => {
    if (!autoQuoteData) return
    const keys = Object.keys(autoQuoteData) as (keyof KanriKeikakuData)[]
    const filledKeys = keys.filter(k => autoQuoteData[k] !== undefined && autoQuoteData[k] !== '')
    onChange({...data, ...autoQuoteData} as KanriKeikakuData)
    setHighlighted(new Set(filledKeys))
  }

  const toggle = (field: keyof KanriKeikakuData) => {
    onChange({...data, [field]: !data[field]})
  }

  const Radio = ({name, value, current, label}: {name: string; value: string; current: string; label: string}) => (
    <label className="flex items-center gap-0.5 cursor-pointer">
      <input type="radio" name={name} checked={current === value} onChange={() => onChange({...data, [name]: value})} className="w-3 h-3 accent-gray-800" />
      <span>{label}</span>
    </label>
  )

  return (
    <PageWrapper>
      {autoQuoteData && <AutoQuoteBar onQuote={handleAutoQuote} hasHighlights={highlighted.size > 0} />}

      {/* ヘッダー */}
      <div className="text-[9px] mb-0.5">歯科疾患在宅療養管理・退院時共同指導</div>
      <div className="text-center mb-1">
        <h1 className="text-base font-bold">歯と口・口腔機能の治療管理</h1>
        <div className="text-right text-xs">No. {data.documentNo || '____'}</div>
      </div>
      <div className="flex justify-between text-xs mb-2">
        <div className={hl('patientName')}>お名前 <span className="border-b border-gray-400 px-2 inline-block min-w-[120px]">{data.patientName}</span> 様</div>
        <div className={hl('date')}>{data.date || '令和○年○月○日'}</div>
      </div>

      {/* 全身の状態 */}
      <SectionTitle>全身の状態</SectionTitle>
      <div className="border border-gray-600 text-[10px] mb-2">
        <div className={`flex border-b border-gray-300 p-1 ${hl('hasDiseases')}`}>
          <span className="w-24">治療中の疾患</span>
          <Chk checked={!data.hasDiseases} label="なし" onToggle={() => onChange({...data, hasDiseases: false})} />
          <span className="mx-2"><Chk checked={data.hasDiseases} label="あり" onToggle={() => onChange({...data, hasDiseases: true})} /></span>
          {data.hasDiseases && <span>疾患名: <input type="text" value={data.diseaseNames} onChange={e => onChange({...data, diseaseNames: e.target.value})} className="border-b border-gray-400 px-1 w-48" /></span>}
        </div>
        <div className={`flex border-b border-gray-300 p-1 ${hl('hasMedication')}`}>
          <span className="w-24">服薬</span>
          <Chk checked={!data.hasMedication} label="なし" onToggle={() => onChange({...data, hasMedication: false})} />
          <span className="mx-2"><Chk checked={data.hasMedication} label="あり" onToggle={() => onChange({...data, hasMedication: true})} /></span>
          {data.hasMedication && <span>薬剤名: <input type="text" value={data.medicationNames} onChange={e => onChange({...data, medicationNames: e.target.value})} className="border-b border-gray-400 px-1 w-48" /></span>}
        </div>
        <div className={`flex border-b border-gray-300 p-1 ${hl('pneumoniaHistory')}`}>
          <span className="w-24">肺炎の既往</span>
          <Radio name="pneumoniaHistory" value="none" current={data.pneumoniaHistory} label="なし" />
          <span className="mx-2"><Radio name="pneumoniaHistory" value="once" current={data.pneumoniaHistory} label="あり" /></span>
          <Radio name="pneumoniaHistory" value="repeat" current={data.pneumoniaHistory} label="繰り返しあり" />
        </div>
        <div className={`flex border-b border-gray-300 p-1 ${hl('malnutritionRisk')}`}>
          <span className="w-24">低栄養リスク</span>
          <Radio name="malnutritionRisk" value="none" current={data.malnutritionRisk} label="なし" />
          <span className="mx-2"><Radio name="malnutritionRisk" value="mild" current={data.malnutritionRisk} label="あり" /></span>
          <Radio name="malnutritionRisk" value="unknown" current={data.malnutritionRisk} label="不明" />
        </div>
        <div className={`flex p-1 ${hl('dietType')}`}>
          <span className="w-24">食事形態</span>
          <input type="text" value={data.dietType} onChange={e => onChange({...data, dietType: e.target.value})} className="border-b border-gray-400 px-1 w-48" />
        </div>
      </div>

      {/* 歯と口の状態 */}
      <SectionTitle>歯と口の状態</SectionTitle>
      <div className="border border-gray-600 text-[10px] mb-2">
        <div className="flex border-b border-gray-300 p-1">
          <span className="w-24">清掃の状況</span>
          <Radio name="cleaningStatus" value="good" current={data.cleaningStatus} label="良好" />
          <span className="mx-2"><Radio name="cleaningStatus" value="poor" current={data.cleaningStatus} label="不良" /></span>
          <Radio name="cleaningStatus" value="veryPoor" current={data.cleaningStatus} label="著しく不良" />
        </div>
        <div className="flex border-b border-gray-300 p-1">
          <span className="w-24">口腔乾燥</span>
          <Radio name="oralDryness" value="none" current={data.oralDryness} label="なし" />
          <span className="mx-2"><Radio name="oralDryness" value="mild" current={data.oralDryness} label="軽度" /></span>
          <Radio name="oralDryness" value="severe" current={data.oralDryness} label="重度" />
        </div>
        <div className="flex border-b border-gray-300 p-1">
          <span className="w-24">むし歯</span>
          <Chk checked={!data.hasCavity} label="なし" onToggle={() => onChange({...data, hasCavity: false})} />
          <span className="mx-2"><Chk checked={data.hasCavity} label="あり" onToggle={() => onChange({...data, hasCavity: true})} /></span>
        </div>
        <div className="flex border-b border-gray-300 p-1">
          <span className="w-24">歯周疾患</span>
          <Chk checked={!data.hasPeriodontal} label="なし" onToggle={() => onChange({...data, hasPeriodontal: false})} />
          <span className="mx-2"><Chk checked={data.hasPeriodontal} label="あり" onToggle={() => onChange({...data, hasPeriodontal: true})} /></span>
        </div>
        {data.hasPeriodontal && (
          <>
            <div className="flex border-b border-gray-300 p-1 pl-28">
              <span className="w-32">・歯肉の炎症</span>
              <Chk checked={!data.periodontalInflammation} label="なし" onToggle={() => toggle('periodontalInflammation')} />
              <span className="mx-2"><Chk checked={data.periodontalInflammation} label="あり" onToggle={() => toggle('periodontalInflammation')} /></span>
            </div>
            <div className="flex border-b border-gray-300 p-1 pl-28">
              <span className="w-32">・歯の動揺度</span>
              <Chk checked={!data.periodontalMobility} label="なし" onToggle={() => toggle('periodontalMobility')} />
              <span className="mx-2"><Chk checked={data.periodontalMobility} label="あり" onToggle={() => toggle('periodontalMobility')} /></span>
            </div>
          </>
        )}
        <div className="flex border-b border-gray-300 p-1">
          <span className="w-24">義歯の使用状況</span>
          <span className="mr-4">上顎 <Chk checked={data.dentureUpperUsed} label="あり" onToggle={() => onChange({...data, dentureUpperUsed: !data.dentureUpperUsed, dentureUpperNotUsed: data.dentureUpperUsed})} /> <Chk checked={data.dentureUpperNotUsed} label="なし" onToggle={() => onChange({...data, dentureUpperNotUsed: !data.dentureUpperNotUsed, dentureUpperUsed: data.dentureUpperNotUsed})} /></span>
          <span>下顎 <Chk checked={data.dentureLowerUsed} label="あり" onToggle={() => onChange({...data, dentureLowerUsed: !data.dentureLowerUsed, dentureLowerNotUsed: data.dentureLowerUsed})} /> <Chk checked={data.dentureLowerNotUsed} label="なし" onToggle={() => onChange({...data, dentureLowerNotUsed: !data.dentureLowerNotUsed, dentureLowerUsed: data.dentureLowerNotUsed})} /></span>
        </div>
        <div className="flex border-b border-gray-300 p-1">
          <span className="w-24">噛み合わせの安定</span>
          <Chk checked={data.biteStability} label="あり" onToggle={() => toggle('biteStability')} />
          <span className="mx-2"><Chk checked={!data.biteStability} label="なし" onToggle={() => toggle('biteStability')} /></span>
        </div>
        <div className="flex p-1">
          <span className="w-40">義歯製作（修理等）の必要性</span>
          <Chk checked={!data.dentureNeeded} label="なし" onToggle={() => onChange({...data, dentureNeeded: false})} />
          <span className="mx-2"><Chk checked={data.dentureNeeded} label="あり" onToggle={() => onChange({...data, dentureNeeded: true})} /></span>
        </div>
      </div>

      {/* 口腔機能の状態 */}
      <SectionTitle>口腔機能の状態</SectionTitle>
      <div className="border border-gray-600 text-[10px] mb-2">
        {(['masticationStatus', 'swallowingStatus', 'pronunciationStatus', 'tongueMovement'] as const).map((field, i) => {
          const labels = ['咀嚼機能', '摂食・嚥下機能', '発音機能', '舌・軟口蓋の動き']
          return (
            <div key={field} className={`flex p-1 ${i < 3 ? 'border-b border-gray-300' : ''}`}>
              <span className="w-32">{labels[i]}</span>
              <Radio name={field} value="good" current={data[field]} label="良好" />
              <span className="mx-2"><Radio name={field} value="slightlyPoor" current={data[field]} label="やや不調" /></span>
              <Radio name={field} value="poor" current={data[field]} label="不調" />
            </div>
          )
        })}
      </div>

      {/* 治療と口腔ケアの難しさ */}
      <SectionTitle>治療と口腔ケアの難しさ</SectionTitle>
      <div className="border border-gray-600 text-[10px] mb-2">
        <div className="flex border-b border-gray-300 p-1">
          <span className="w-32">・口腔清掃の状況</span>
          <Radio name="cleaningSelf" value="independent" current={data.cleaningSelf} label="自立" />
          <span className="mx-2"><Radio name="cleaningSelf" value="partial" current={data.cleaningSelf} label="一部介助" /></span>
          <Radio name="cleaningSelf" value="full" current={data.cleaningSelf} label="全介助" />
        </div>
        <div className="flex border-b border-gray-300 p-1">
          <span className="w-32">・座位保持</span>
          <Radio name="seatRetention" value="good" current={data.seatRetention} label="良好" />
          <span className="mx-2"><Radio name="seatRetention" value="slightlyPoor" current={data.seatRetention} label="やや不良" /></span>
          <Radio name="seatRetention" value="poor" current={data.seatRetention} label="不良" />
        </div>
        <div className="flex border-b border-gray-300 p-1">
          <span className="w-32">・開口保持</span>
          <Radio name="mouthOpening" value="possible" current={data.mouthOpening} label="可能" />
          <span className="mx-2"><Radio name="mouthOpening" value="difficult" current={data.mouthOpening} label="困難" /></span>
          <Radio name="mouthOpening" value="impossible" current={data.mouthOpening} label="不可能" />
        </div>
        <div className="flex p-1">
          <span className="w-32">・含嗽（ブクブクうがい）</span>
          <Radio name="gargling" value="possible" current={data.gargling} label="可能" />
          <span className="mx-2"><Radio name="gargling" value="difficult" current={data.gargling} label="困難" /></span>
          <Radio name="gargling" value="impossibleSwallow" current={data.gargling} label="不可能→むせ" />
        </div>
      </div>

      {/* 管理方針・治療方針 */}
      <SectionTitle>管理方針・治療方針</SectionTitle>
      <div className="border border-gray-600 p-2 mb-2 min-h-[60px]">
        <textarea
          value={data.managementPolicy}
          onChange={e => onChange({...data, managementPolicy: e.target.value})}
          className="w-full border-0 text-[10px] resize-none min-h-[50px] focus:outline-none"
          placeholder="管理方針・治療方針を入力..."
        />
      </div>

      {/* フッター */}
      <div className="text-xs text-right mt-2">
        <div>ご質問がありましたら、いつでもお申し出ください</div>
        <div className={`mt-1 ${hl('clinicName')}`}>医療機関名　{data.clinicName || <span className="text-gray-300">医療機関名</span>}</div>
        <div className={hl('doctorName')}>（担当歯科医）　{data.doctorName || <span className="text-gray-300">医師名</span>}</div>
      </div>
    </PageWrapper>
  )
}

// =============================================================================
// C. 訪問歯科衛生指導説明書（PDF03準拠）
// =============================================================================

export const getDefaultHygieneGuidanceData = (): HygieneGuidanceData => ({
  documentNo: '',
  patientName: '',
  date: '',
  visitType: 'facility',
  facilityName: '',
  oralCondition: {
    plaque: false, calculus: false, foodDebris: false, tongueCoating: false, oralBleeding: false, erosionUlcer: false,
    oralDryness: false, halitosis: false,
    dentureCleanGood: false, dentureCleanNeedsImprovement: false,
    dentureFitGood: false, dentureFitNeedsImprovement: false,
    dentureStorageGood: false, dentureStorageNeedsImprovement: false,
  },
  otherCondition: '',
  cleaningImportance: false,
  garglingBrushing: false,
  brushingMethod: {fones: false, scrubbing: false, bass: false, toothpick: false},
  instruments: {brush: false, sponge: false, tongue: false, electric: false},
  salivaryMassage: false,
  dentureCleaningGuidance: false,
  dentureCleaningDetails: {clasp: false, mucosa: false, posterior: false, artificial: false},
  residualTeethBrushing: false,
  dentureRemovalGuidance: false,
  dentureSleepHandling: false,
  dentureSleepOptions: {waterStorage: false, cleanserStorage: false, wearing: false},
  careNotes: '',
  hygienistName: '',
  startTime: '',
  endTime: '',
  clinicName: '',
  clinicAddress: '',
  clinicPhone: '',
  doctorName: '',
})

type HoueishiProps = {
  data: HygieneGuidanceData
  onChange: (d: HygieneGuidanceData) => void
  autoQuoteData?: Partial<HygieneGuidanceData>
}

export const HoueishiPreviewNew = ({data, onChange, autoQuoteData}: HoueishiProps) => {
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set())
  const hl = (field: string) => hlClass(highlighted, field)

  const handleAutoQuote = () => {
    if (!autoQuoteData) return
    const keys = Object.keys(autoQuoteData) as (keyof HygieneGuidanceData)[]
    const filledKeys = keys.filter(k => autoQuoteData[k] !== undefined && autoQuoteData[k] !== '')
    onChange({...data, ...autoQuoteData} as HygieneGuidanceData)
    setHighlighted(new Set(filledKeys))
  }

  const toggleOral = (key: keyof HygieneGuidanceData['oralCondition']) => {
    onChange({...data, oralCondition: {...data.oralCondition, [key]: !data.oralCondition[key]}})
  }
  const toggleBrush = (key: keyof HygieneGuidanceData['brushingMethod']) => {
    onChange({...data, brushingMethod: {...data.brushingMethod, [key]: !data.brushingMethod[key]}})
  }
  const toggleInstr = (key: keyof HygieneGuidanceData['instruments']) => {
    onChange({...data, instruments: {...data.instruments, [key]: !data.instruments[key]}})
  }
  const toggleSleep = (key: keyof HygieneGuidanceData['dentureSleepOptions']) => {
    onChange({...data, dentureSleepOptions: {...data.dentureSleepOptions, [key]: !data.dentureSleepOptions[key]}})
  }

  return (
    <PageWrapper>
      {autoQuoteData && <AutoQuoteBar onQuote={handleAutoQuote} hasHighlights={highlighted.size > 0} />}

      <div className="text-center mb-2">
        <h1 className="text-lg font-bold">訪問歯科衛生指導説明書</h1>
        <div className="text-right text-xs">No. {data.documentNo || '____'}</div>
      </div>
      <div className="flex justify-between text-xs mb-2">
        <div className={hl('patientName')}><span className="border-b border-gray-400 px-2 inline-block min-w-[120px]">{data.patientName}</span> 様</div>
        <div className={hl('date')}>{data.date || '令和○年○月○日'}</div>
      </div>

      {/* 訪問先 */}
      <div className="text-xs mb-2">
        訪問先
        <label className="cursor-pointer"><input type="radio" name="visitType" checked={data.visitType === 'home'} onChange={() => onChange({...data, visitType: 'home'})} className="w-3 h-3 accent-gray-800" /> 居宅</label>
        <span className="mx-2">
          <label className="cursor-pointer"><input type="radio" name="visitType" checked={data.visitType === 'facility'} onChange={() => onChange({...data, visitType: 'facility'})} className="w-3 h-3 accent-gray-800" /> 施設</label>
        </span>
        （<span className={hl('facilityName')}><input type="text" value={data.facilityName} onChange={e => onChange({...data, facilityName: e.target.value})} className="border-b border-gray-400 px-1 w-48" /></span>）
      </div>

      {/* 口腔の状況テーブル */}
      <SectionTitle>口腔の状況</SectionTitle>
      <div className="border border-gray-600 text-[10px] mb-2">
        <table className="w-full border-collapse">
          <tbody>
            {([
              [{label: '歯垢', hasKey: 'plaque' as const}, {label: '口腔乾燥', hasKey: 'oralDryness' as const}],
              [{label: '歯石', hasKey: 'calculus' as const}, {label: '口臭', hasKey: 'halitosis' as const}],
              [{label: '食物残渣', hasKey: 'foodDebris' as const}, {label: '義歯清掃状態', goodKey: 'dentureCleanGood' as const, badKey: 'dentureCleanNeedsImprovement' as const}],
              [{label: '舌苔', hasKey: 'tongueCoating' as const}, {label: '義歯装着状態', goodKey: 'dentureFitGood' as const, badKey: 'dentureFitNeedsImprovement' as const}],
              [{label: '口腔内出血', hasKey: 'oralBleeding' as const}, {label: '義歯保管状態', goodKey: 'dentureStorageGood' as const, badKey: 'dentureStorageNeedsImprovement' as const}],
              [{label: 'びらん・潰瘍', hasKey: 'erosionUlcer' as const}, null],
            ] as const).map((row, i) => {
              const col0 = row[0]!
              const col1 = row[1]
              return (
              <tr key={i} className="border-b border-gray-300">
                <td className="p-1 w-24 border-r border-gray-300">{col0.label}</td>
                {'hasKey' in col0 ? (
                  <>
                    <td className="p-1 w-16 border-r border-gray-300">
                      <label className="cursor-pointer" onClick={() => toggleOral(col0.hasKey)}><Chk checked={data.oralCondition[col0.hasKey]} label="有" /></label>
                    </td>
                    <td className="p-1 w-16 border-r border-gray-300">
                      <label className="cursor-pointer" onClick={() => toggleOral(col0.hasKey)}><Chk checked={!data.oralCondition[col0.hasKey]} label="無" /></label>
                    </td>
                  </>
                ) : (
                  <td className="p-1 border-r border-gray-300" colSpan={2}></td>
                )}
                {col1 ? (
                  <>
                    <td className="p-1 w-24 border-r border-gray-300">{col1.label}</td>
                    {'hasKey' in col1 ? (
                      <>
                        <td className="p-1 w-12 border-r border-gray-300">
                          <label className="cursor-pointer" onClick={() => toggleOral(col1.hasKey)}><Chk checked={data.oralCondition[col1.hasKey]} label="有" /></label>
                        </td>
                        <td className="p-1 w-12">
                          <label className="cursor-pointer" onClick={() => toggleOral(col1.hasKey)}><Chk checked={!data.oralCondition[col1.hasKey]} label="無" /></label>
                        </td>
                      </>
                    ) : 'goodKey' in col1 ? (
                      <>
                        <td className="p-1 w-12 border-r border-gray-300">
                          <label className="cursor-pointer" onClick={() => toggleOral(col1.goodKey)}><Chk checked={data.oralCondition[col1.goodKey]} label="良" /></label>
                        </td>
                        <td className="p-1 w-12">
                          <label className="cursor-pointer" onClick={() => toggleOral(col1.badKey)}><Chk checked={data.oralCondition[col1.badKey]} label="要改善" /></label>
                        </td>
                      </>
                    ) : null}
                  </>
                ) : (
                  <td colSpan={3}></td>
                )}
              </tr>
            )})}
          </tbody>
        </table>
        <div className="p-1">
          その他: <input type="text" value={data.otherCondition} onChange={e => onChange({...data, otherCondition: e.target.value})} className="border-b border-gray-400 px-1 w-64" />
        </div>
      </div>

      {/* 口腔の清掃について */}
      <SectionTitle>口腔の清掃について</SectionTitle>
      <div className="text-[10px] space-y-0.5 mb-2 ml-2">
        <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={data.cleaningImportance} onChange={() => onChange({...data, cleaningImportance: !data.cleaningImportance})} className="w-3 h-3 accent-gray-800" /> 口腔清掃の重要性</label>
        <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={data.garglingBrushing} onChange={() => onChange({...data, garglingBrushing: !data.garglingBrushing})} className="w-3 h-3 accent-gray-800" /> 含嗽、ブラッシング、歯肉マッサージ励行</label>
        <div className="flex items-center gap-2">
          <Chk checked={Object.values(data.brushingMethod).some(v => v)} label="ブラッシング方法" />
          <span className="ml-2">（</span>
          {(['fones', 'scrubbing', 'bass', 'toothpick'] as const).map(k => (
            <label key={k} className="flex items-center gap-0.5 cursor-pointer">
              <input type="checkbox" checked={data.brushingMethod[k]} onChange={() => toggleBrush(k)} className="w-3 h-3 accent-gray-800" />
              <span>{{fones: 'フォーンズ', scrubbing: 'スクラッビング', bass: 'バス', toothpick: 'ツマヨウジ'}[k]}</span>
            </label>
          ))}
          <span>）</span>
        </div>
        <div className="flex items-center gap-2">
          <Chk checked={Object.values(data.instruments).some(v => v)} label="使用器具" />
          <span className="ml-2">（</span>
          {(['brush', 'sponge', 'tongue', 'electric'] as const).map(k => (
            <label key={k} className="flex items-center gap-0.5 cursor-pointer">
              <input type="checkbox" checked={data.instruments[k]} onChange={() => toggleInstr(k)} className="w-3 h-3 accent-gray-800" />
              <span>{{brush: 'ブラシ', sponge: 'スポンジブラシ', tongue: '舌ブラシ', electric: '電動ブラシ'}[k]}</span>
            </label>
          ))}
          <span>）</span>
        </div>
        <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={data.salivaryMassage} onChange={() => onChange({...data, salivaryMassage: !data.salivaryMassage})} className="w-3 h-3 accent-gray-800" /> 唾液腺のマッサージ、舌・顔面体操、摂食・嚥下等の指導</label>
      </div>

      {/* 有床義歯清掃指導 */}
      <SectionTitle>有床義歯の清掃指導について</SectionTitle>
      <div className="text-[10px] space-y-0.5 mb-2 ml-2">
        <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={data.dentureCleaningGuidance} onChange={() => onChange({...data, dentureCleaningGuidance: !data.dentureCleaningGuidance})} className="w-3 h-3 accent-gray-800" /> 義歯の清掃</label>
        <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={data.residualTeethBrushing} onChange={() => onChange({...data, residualTeethBrushing: !data.residualTeethBrushing})} className="w-3 h-3 accent-gray-800" /> 鉤歯、残存歯、歯肉のブラッシング</label>
        <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={data.dentureRemovalGuidance} onChange={() => onChange({...data, dentureRemovalGuidance: !data.dentureRemovalGuidance})} className="w-3 h-3 accent-gray-800" /> 義歯の着脱指導・着脱介護指導</label>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={data.dentureSleepHandling} onChange={() => onChange({...data, dentureSleepHandling: !data.dentureSleepHandling})} className="w-3 h-3 accent-gray-800" /> 就寝時の扱い方　清掃後に</label>
          {(['waterStorage', 'cleanserStorage', 'wearing'] as const).map(k => (
            <label key={k} className="flex items-center gap-0.5 cursor-pointer">
              <input type="checkbox" checked={data.dentureSleepOptions[k]} onChange={() => toggleSleep(k)} className="w-3 h-3 accent-gray-800" />
              <span>{{waterStorage: '水中で保管', cleanserStorage: '洗浄剤中で保管', wearing: '装着'}[k]}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 注意事項 */}
      <SectionTitle>注意事項（食生活の改善等）</SectionTitle>
      <div className="border border-gray-600 p-2 mb-4 min-h-[50px]">
        <textarea value={data.careNotes} onChange={e => onChange({...data, careNotes: e.target.value})} className="w-full border-0 text-[10px] resize-none min-h-[40px] focus:outline-none" placeholder="注意事項を入力..." />
      </div>

      {/* フッター */}
      <div className="border-t border-gray-600 pt-2 text-xs">
        <div className="flex justify-between mb-2">
          <div>歯科衛生士　<input type="text" value={data.hygienistName} onChange={e => onChange({...data, hygienistName: e.target.value})} className="border-b border-gray-400 px-1 w-24" /></div>
          <div>
            時間　<input type="text" value={data.startTime} onChange={e => onChange({...data, startTime: e.target.value})} className="border-b border-gray-400 px-1 w-12" />
            　～　<input type="text" value={data.endTime} onChange={e => onChange({...data, endTime: e.target.value})} className="border-b border-gray-400 px-1 w-12" />
          </div>
        </div>
        <div className="border border-gray-600">
          <div className="flex">
            <div className="w-28 bg-gray-50 border-r border-gray-400 p-1.5 text-center text-[10px]">保険医療機関名<br />所在地・電話番号<br />担当歯科医</div>
            <div className="flex-1 p-1.5 text-[10px] space-y-0.5">
              <div className={hl('clinicName')}>{data.clinicName || <span className="text-gray-300">医療機関名</span>}</div>
              <div className={hl('clinicAddress')}>{data.clinicAddress || <span className="text-gray-300">所在地</span>}</div>
              <div className={hl('clinicPhone')}>TEL　{data.clinicPhone || <span className="text-gray-300">電話番号</span>}</div>
              <div className={hl('doctorName')}>歯科医師　{data.doctorName || <span className="text-gray-300">医師名</span>}</div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

// =============================================================================
// D. 口腔機能精密検査記録用紙（PDF04準拠） - 既存のOralFunctionRecordFormを活用
// =============================================================================

type SeimitsuKensaProps = {
  data: OralExamRecordData
  autoQuoteData?: Partial<OralExamRecordData>
  onAutoQuoted?: (d: OralExamRecordData) => void
}

export const SeimitsuKensaPreview = ({data, autoQuoteData, onAutoQuoted}: SeimitsuKensaProps) => {
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set())
  const hl = (field: string) => hlClass(highlighted, field)

  const handleAutoQuote = () => {
    if (!autoQuoteData) return
    const keys = Object.keys(autoQuoteData) as (keyof OralExamRecordData)[]
    const filledKeys = keys.filter(k => autoQuoteData[k] !== undefined && autoQuoteData[k] !== '')
    const newData = {...data, ...autoQuoteData} as OralExamRecordData
    onAutoQuoted?.(newData)
    setHighlighted(new Set(filledKeys))
  }

  const r = data.oralFunctionRecord
  return (
    <PageWrapper>
      {autoQuoteData && <AutoQuoteBar onQuote={handleAutoQuote} hasHighlights={highlighted.size > 0} />}

      <div className="text-right text-xs mb-2">No. {data.documentNo || '____'}</div>
      <div className="text-center mb-3">
        <h1 className="text-lg font-bold">口腔機能精密検査　記録用紙</h1>
        <div className={`text-right text-xs mt-1 ${hl('clinicName')}`}>{data.clinicName || <span className="text-gray-300">医療機関名</span>}</div>
      </div>

      {/* 患者情報 */}
      <div className="border border-gray-600 text-xs mb-3">
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="border border-gray-400 p-1 w-28">
                <div className="text-[8px] text-gray-500">フリガナ</div>
                <div className="text-[9px]">{data.patientNameKana}</div>
                <div className="text-[8px] text-gray-500 mt-0.5">患者氏名</div>
                <div className="font-medium">{data.patientName}</div>
              </td>
              <td className="border border-gray-400 p-1 text-center w-24">
                <div className="text-[8px] text-gray-500">生年月日</div>
                <div>{data.birthDate}</div>
              </td>
              <td className="border border-gray-400 p-1 text-center w-16">
                <div>（ {data.age} 歳）</div>
              </td>
              <td className="border border-gray-400 p-1 text-center w-12">
                {data.gender === 'male' ? '男' : '女'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="text-xs mb-3">計測日　{r.measureDate || '____年__月__日'}</div>

      {/* 検査テーブル */}
      <div className="border border-gray-600 text-[10px]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 p-1 w-24">下位症状</th>
              <th className="border border-gray-400 p-1">検査項目</th>
              <th className="border border-gray-400 p-1 w-28">該当基準</th>
              <th className="border border-gray-400 p-1 w-24">検査値</th>
              <th className="border border-gray-400 p-1 w-8">該当</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-400 p-1 text-center bg-gray-50" rowSpan={1}>① 口腔衛生<br />状態不良</td>
              <td className="border border-gray-400 p-1">舌苔の付着程度</td>
              <td className="border border-gray-400 p-1 text-center">50%以上</td>
              <td className="border border-gray-400 p-1 text-center">{r.tongueCoatingPercent ? `${r.tongueCoatingPercent}%` : ''}</td>
              <td className="border border-gray-400 p-1 text-center"><Chk checked={r.tongueCoatingApplicable} /></td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 text-center bg-gray-50" rowSpan={2}>② 口腔乾燥</td>
              <td className="border border-gray-400 p-1">口腔粘膜湿潤度</td>
              <td className="border border-gray-400 p-1 text-center">27未満</td>
              <td className="border border-gray-400 p-1 text-center">{r.oralMoistureValue}</td>
              <td className="border border-gray-400 p-1 text-center" rowSpan={2}><Chk checked={r.oralDrynessApplicable} /></td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1">唾液量</td>
              <td className="border border-gray-400 p-1 text-center">2g/2分以下</td>
              <td className="border border-gray-400 p-1 text-center">{r.salivaAmount ? `${r.salivaAmount}g` : ''}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 text-center bg-gray-50" rowSpan={2}>③ 咬合力低下</td>
              <td className="border border-gray-400 p-1">咬合力検査</td>
              <td className="border border-gray-400 p-1 text-center text-[8px]">500N未満</td>
              <td className="border border-gray-400 p-1 text-center">{r.biteForceN ? `${r.biteForceN}N` : ''}</td>
              <td className="border border-gray-400 p-1 text-center" rowSpan={2}><Chk checked={r.biteForceApplicable} /></td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1">残存歯数</td>
              <td className="border border-gray-400 p-1 text-center">20本未満</td>
              <td className="border border-gray-400 p-1 text-center">{r.remainingTeeth ? `${r.remainingTeeth}本` : ''}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 text-center bg-gray-50">④ 舌口唇運動<br />機能低下</td>
              <td className="border border-gray-400 p-1">オーラルディアドコキネシス</td>
              <td className="border border-gray-400 p-1 text-center text-[8px]">どれか1つでも<br />6回/秒未満</td>
              <td className="border border-gray-400 p-1 text-center text-[8px]">
                /pa/ {r.oralDiadochoPa || '__'}回/秒<br />
                /ta/ {r.oralDiadochoTa || '__'}回/秒<br />
                /ka/ {r.oralDiadochoKa || '__'}回/秒
              </td>
              <td className="border border-gray-400 p-1 text-center"><Chk checked={r.oralMotorApplicable} /></td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 text-center bg-gray-50">⑤ 低舌圧</td>
              <td className="border border-gray-400 p-1">舌圧検査</td>
              <td className="border border-gray-400 p-1 text-center">30kPa未満</td>
              <td className="border border-gray-400 p-1 text-center">{r.tonguePressureKPa ? `${r.tonguePressureKPa}kPa` : ''}</td>
              <td className="border border-gray-400 p-1 text-center"><Chk checked={r.tonguePressureApplicable} /></td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 text-center bg-gray-50" rowSpan={2}>⑥ 咀嚼機能<br />低下</td>
              <td className="border border-gray-400 p-1">咀嚼能力検査</td>
              <td className="border border-gray-400 p-1 text-center">100mg/dL未満</td>
              <td className="border border-gray-400 p-1 text-center">{r.masticatoryAbilityMgDl ? `${r.masticatoryAbilityMgDl}mg/dL` : ''}</td>
              <td className="border border-gray-400 p-1 text-center" rowSpan={2}><Chk checked={r.masticatoryApplicable} /></td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1">咀嚼能率スコア法</td>
              <td className="border border-gray-400 p-1 text-center">スコア 0, 1, 2</td>
              <td className="border border-gray-400 p-1 text-center">{r.masticatoryScoreMethod || ''}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1 text-center bg-gray-50" rowSpan={2}>⑦ 嚥下機能<br />低下</td>
              <td className="border border-gray-400 p-1">嚥下スクリーニング検査<br />(EAT-10)</td>
              <td className="border border-gray-400 p-1 text-center">3点以上</td>
              <td className="border border-gray-400 p-1 text-center">{r.swallowingEAT10Score ? `${r.swallowingEAT10Score}点` : ''}</td>
              <td className="border border-gray-400 p-1 text-center" rowSpan={2}><Chk checked={r.swallowingApplicable} /></td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-1">自記式質問票<br />(聖隷式嚥下質問紙)</td>
              <td className="border border-gray-400 p-1 text-center">Aが1項目以上</td>
              <td className="border border-gray-400 p-1 text-center">{r.swallowingQuestionnaireA || ''}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-3 text-xs">
        <div>該当項目が3項目以上で「口腔機能低下症」と診断する。</div>
        <div className={`text-base font-bold ${data.applicableCount >= 3 ? 'text-red-600' : ''}`}>
          該当項目数：{data.applicableCount}
        </div>
      </div>
    </PageWrapper>
  )
}

// =============================================================================
// E. 口腔機能管理計画書（PDF101準拠）
// =============================================================================

export const getDefaultOralFunctionPlanData = (): OralFunctionPlanData => ({
  documentNo: '',
  clinicName: '',
  patientNameKana: '',
  patientName: '',
  age: 0,
  gender: '',
  provideDate: '',
  bodyCondition: {
    diseases: [],
    medicationStatus: 'none',
    medicationNames: '',
    pneumoniaHistory: 'none',
    nutritionWeight: '',
    nutritionHeight: '',
    nutritionBMI: '',
    nutritionStatus: 'normal',
    weightChange: 'none',
    weightChangeDetail: '',
    dietType: '',
    appetite: 'yes',
    appetiteReason: '',
  },
  oralFunctionStatus: [
    {label: '口腔内の衛生状態', testName: '舌苔付着程度', value: '', reference: '基準値 50%以上', status: 'normal'},
    {label: '口腔内の乾燥程度', testName: '口腔粘膜湿潤度', value: '', reference: '基準値 27未満', status: 'normal'},
    {label: '咬む力の程度', testName: '残存歯数', value: '', reference: '基準値 20本未満', status: 'normal'},
    {label: '口唇の動きの程度', testName: 'パ発音速度', value: '', reference: '基準値 6.0回/秒未満', status: 'normal'},
    {label: '舌尖の動きの程度', testName: 'タ発音速度', value: '', reference: '基準値 6.0回/秒未満', status: 'normal'},
    {label: '奥舌の動きの程度', testName: 'カ発音速度', value: '', reference: '基準値 6.0回/秒未満', status: 'normal'},
    {label: '舌の力の程度', testName: '舌圧', value: '', reference: '基準値 30kPa未満', status: 'normal'},
    {label: '咀嚼の機能の程度', testName: '咀嚼能力検査', value: '', reference: '基準値 100mg/dL未満', status: 'normal'},
    {label: '嚥下の機能の程度', testName: 'EAT-10', value: '', reference: '基準値 3点以上', status: 'normal'},
  ],
  oralFunctionPlan: [
    {label: '口腔内の衛生', plan: 'noIssue'},
    {label: '口腔内の乾燥', plan: 'noIssue'},
    {label: '咬む力', plan: 'noIssue'},
    {label: '口唇の動き', plan: 'noIssue'},
    {label: '舌尖の動き', plan: 'noIssue'},
    {label: '奥舌の動き', plan: 'noIssue'},
    {label: '舌の力', plan: 'noIssue'},
    {label: '咀嚼の機能', plan: 'noIssue'},
    {label: '嚥下の機能', plan: 'noIssue'},
  ],
  managementGoal: '',
  reevaluationMonths: '',
  treatmentPeriod: '',
})

type KoukuuKanriProps = {
  data: OralFunctionPlanData
  onChange: (d: OralFunctionPlanData) => void
  autoQuoteData?: Partial<OralFunctionPlanData>
}

export const KoukuuKanriPreview = ({data, onChange, autoQuoteData}: KoukuuKanriProps) => {
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set())
  const hl = (field: string) => hlClass(highlighted, field)

  const handleAutoQuote = () => {
    if (!autoQuoteData) return
    const keys = Object.keys(autoQuoteData) as (keyof OralFunctionPlanData)[]
    const filledKeys = keys.filter(k => autoQuoteData[k] !== undefined && autoQuoteData[k] !== '')
    onChange({...data, ...autoQuoteData} as OralFunctionPlanData)
    setHighlighted(new Set(filledKeys))
  }

  const updatePlan = (index: number, plan: 'noIssue' | 'maintain' | 'improve') => {
    const newPlans = [...data.oralFunctionPlan]
    newPlans[index] = {...newPlans[index], plan}
    onChange({...data, oralFunctionPlan: newPlans})
  }

  const updateStatus = (index: number, status: 'normal' | 'decreased') => {
    const newStatus = [...data.oralFunctionStatus]
    newStatus[index] = {...newStatus[index], status}
    onChange({...data, oralFunctionStatus: newStatus})
  }

  return (
    <PageWrapper>
      {autoQuoteData && <AutoQuoteBar onQuote={handleAutoQuote} hasHighlights={highlighted.size > 0} />}

      <div className="text-right text-xs mb-1">No. {data.documentNo || '____'}</div>
      <div className="text-center mb-2">
        <h1 className="text-lg font-bold">管理計画書</h1>
        <div className={`text-right text-xs ${hl('clinicName')}`}>{data.clinicName || <span className="text-gray-300">医療機関名</span>}</div>
      </div>

      {/* 患者情報 */}
      <div className="border border-gray-600 text-xs mb-2">
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="border border-gray-400 p-1">
                <div className="text-[8px] text-gray-500">フリガナ</div>
                <div className="text-[9px]">{data.patientNameKana}</div>
                <div className="text-[8px] text-gray-500">患者氏名</div>
                <div className="font-medium">{data.patientName}</div>
              </td>
              <td className="border border-gray-400 p-1 text-center w-16">年齢　{data.age}歳</td>
              <td className="border border-gray-400 p-1 text-center w-16">性別　{data.gender === 'male' ? '男' : '女'}</td>
              <td className="border border-gray-400 p-1 text-center w-24">提供日<br />{data.provideDate}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 口腔機能の状態 */}
      <SectionTitle>【口腔機能の状態】</SectionTitle>
      <div className="border border-gray-600 text-[9px] mb-2">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-400 p-0.5 w-6"></th>
              <th className="border border-gray-400 p-0.5 w-28">項目</th>
              <th className="border border-gray-400 p-0.5">検査名</th>
              <th className="border border-gray-400 p-0.5 w-20">検査値</th>
              <th className="border border-gray-400 p-0.5 w-28">（基準）</th>
              <th className="border border-gray-400 p-0.5 w-16">正常範囲内</th>
              <th className="border border-gray-400 p-0.5 w-10">低下</th>
            </tr>
          </thead>
          <tbody>
            {data.oralFunctionStatus.map((item, i) => (
              <tr key={i}>
                <td className="border border-gray-400 p-0.5 text-center">{i + 1}</td>
                <td className="border border-gray-400 p-0.5">{item.label}</td>
                <td className="border border-gray-400 p-0.5">{item.testName}</td>
                <td className="border border-gray-400 p-0.5 text-center">{item.value}</td>
                <td className="border border-gray-400 p-0.5 text-center text-[8px]">{item.reference}</td>
                <td className="border border-gray-400 p-0.5 text-center cursor-pointer" onClick={() => updateStatus(i, 'normal')}><Chk checked={item.status === 'normal'} /></td>
                <td className="border border-gray-400 p-0.5 text-center cursor-pointer" onClick={() => updateStatus(i, 'decreased')}><Chk checked={item.status === 'decreased'} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 口腔機能管理計画 */}
      <SectionTitle>【口腔機能管理計画】</SectionTitle>
      <div className="border border-gray-600 text-[9px] mb-2">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-400 p-0.5 w-6"></th>
              <th className="border border-gray-400 p-0.5 w-28">項目</th>
              <th className="border border-gray-400 p-0.5 w-16">問題なし</th>
              <th className="border border-gray-400 p-0.5 w-24">機能維持を目指す</th>
              <th className="border border-gray-400 p-0.5 w-24">機能向上を目指す</th>
            </tr>
          </thead>
          <tbody>
            {data.oralFunctionPlan.map((item, i) => (
              <tr key={i}>
                <td className="border border-gray-400 p-0.5 text-center">{i + 1}</td>
                <td className="border border-gray-400 p-0.5">{item.label}</td>
                <td className="border border-gray-400 p-0.5 text-center cursor-pointer" onClick={() => updatePlan(i, 'noIssue')}><Chk checked={item.plan === 'noIssue'} /></td>
                <td className="border border-gray-400 p-0.5 text-center cursor-pointer" onClick={() => updatePlan(i, 'maintain')}><Chk checked={item.plan === 'maintain'} /></td>
                <td className="border border-gray-400 p-0.5 text-center cursor-pointer" onClick={() => updatePlan(i, 'improve')}><Chk checked={item.plan === 'improve'} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 管理方針・目標 */}
      <SectionTitle>【管理方針・目標（ゴール）・治療予定等】</SectionTitle>
      <div className="border border-gray-600 p-2 mb-2 min-h-[50px]">
        <textarea value={data.managementGoal} onChange={e => onChange({...data, managementGoal: e.target.value})} className="w-full border-0 text-[10px] resize-none min-h-[40px] focus:outline-none" placeholder="管理方針・目標を入力..." />
      </div>

      {/* 再評価の時期 */}
      <SectionTitle>【再評価の時期・治療期間】</SectionTitle>
      <div className="text-xs mb-2">
        再評価の時期：約（<input type="text" value={data.reevaluationMonths} onChange={e => onChange({...data, reevaluationMonths: e.target.value})} className="border-b border-gray-400 px-1 w-8" />）か月後　・　治療期間：（<input type="text" value={data.treatmentPeriod} onChange={e => onChange({...data, treatmentPeriod: e.target.value})} className="border-b border-gray-400 px-1 w-16" />）程度
      </div>
    </PageWrapper>
  )
}

// =============================================================================
// F. 口腔衛生管理加算 様式（PDF50準拠）
// =============================================================================

export const getDefaultOralHygieneManagementData = (): OralHygieneManagementData => ({
  documentNo: '',
  evaluationDate: '',
  patientName: '',
  patientNameKana: '',
  birthDate: '',
  gender: '',
  careLevel: '',
  diseaseName: '',
  dailyIndependencePhysical: '',
  dailyIndependenceDementia: '',
  hasFamilyDentist: false,
  hasRecentDentalVisit: false,
  dentureUse: 'none',
  nutritionMethod: 'oral',
  dietForm: '',
  oralHealthAssessment: {
    oralHygiene: false,
    oralFunction: {
      biteIssue: false, foodSpill: false, choking: false, oralDryness: false,
      gurglingDifficulty: false, brushingAfterMealDifficulty: false, tongueMovement: false,
    },
    teethCount: 0,
    toothIssues: {decay: false, fracture: false, restoration: false, residualRoot: false, other: false, otherText: ''},
    dentureIssues: {mismatch: false, broken: false, needed: false, notUsed: false, other: false, otherText: ''},
    periodontalDisease: false,
    mucosalDisease: false,
  },
  managementContent: {
    recorder: '',
    directingDoctorName: '',
    recordDate: '',
    goals: {
      dentalDisease: false, oralHygiene: false, caregiverSkill: false, oralFunction: false,
      dietForm: false, nutritionStatus: false, aspirationPrevention: false, other: false, otherText: '',
    },
    implementations: {
      oralCleaning: false, oralCleaningGuidance: false, dentureCleaning: false,
      dentureCleaningGuidance: false, oralFunctionGuidance: false, aspirationPrevention: false,
      other: false, otherText: '',
    },
    frequency: '',
  },
  implementationRecords: [],
  otherNotes: '',
  clinicName: '',
})

type KoueiKanriProps = {
  data: OralHygieneManagementData
  onChange: (d: OralHygieneManagementData) => void
  autoQuoteData?: Partial<OralHygieneManagementData>
}

export const KoueiKanriPreview = ({data, onChange, autoQuoteData}: KoueiKanriProps) => {
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set())
  const hl = (field: string) => hlClass(highlighted, field)

  const handleAutoQuote = () => {
    if (!autoQuoteData) return
    const keys = Object.keys(autoQuoteData) as (keyof OralHygieneManagementData)[]
    const filledKeys = keys.filter(k => autoQuoteData[k] !== undefined && autoQuoteData[k] !== '')
    onChange({...data, ...autoQuoteData} as OralHygieneManagementData)
    setHighlighted(new Set(filledKeys))
  }

  const updateGoal = (key: string, value: boolean) => {
    onChange({
      ...data,
      managementContent: {
        ...data.managementContent,
        goals: {...data.managementContent.goals, [key]: value},
      },
    })
  }
  const updateImpl = (key: string, value: boolean) => {
    onChange({
      ...data,
      managementContent: {
        ...data.managementContent,
        implementations: {...data.managementContent.implementations, [key]: value},
      },
    })
  }

  return (
    <PageWrapper>
      {autoQuoteData && <AutoQuoteBar onQuote={handleAutoQuote} hasHighlights={highlighted.size > 0} />}

      <div className="text-center mb-2">
        <h1 className="text-base font-bold">口腔衛生管理加算　様式（実施計画）</h1>
        <div className={`text-right text-xs ${hl('evaluationDate')}`}>評価日：{data.evaluationDate || '____年__月__日'}</div>
      </div>

      {/* 患者基本情報 */}
      <div className="border border-gray-600 text-[9px] mb-2">
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="border border-gray-400 p-0.5">氏名（ふりがな）</td>
              <td className={`border border-gray-400 p-0.5 ${hl('patientName')}`} colSpan={3}>{data.patientName}（{data.patientNameKana}）</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-0.5">生年月日・性別</td>
              <td className={`border border-gray-400 p-0.5 ${hl('birthDate')}`}>{data.birthDate}　・　{data.gender === 'male' ? '男' : '女'}</td>
              <td className="border border-gray-400 p-0.5">要介護度・病名等</td>
              <td className={`border border-gray-400 p-0.5 ${hl('careLevel')}`}>{data.careLevel}　病名：{data.diseaseName}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-0.5">日常生活自立度</td>
              <td className="border border-gray-400 p-0.5" colSpan={3}>
                障害高齢者：{data.dailyIndependencePhysical}　　認知症高齢者：{data.dailyIndependenceDementia}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 歯科受診 */}
      <div className="text-[9px] mb-1">
        現在の歯科受診について　かかりつけ歯科医 <Chk checked={data.hasFamilyDentist} label="あり" onToggle={() => onChange({...data, hasFamilyDentist: true})} /> <Chk checked={!data.hasFamilyDentist} label="なし" onToggle={() => onChange({...data, hasFamilyDentist: false})} />
        　直近1年間の歯科受診 <Chk checked={data.hasRecentDentalVisit} label="あり" onToggle={() => onChange({...data, hasRecentDentalVisit: true})} /> <Chk checked={!data.hasRecentDentalVisit} label="なし" onToggle={() => onChange({...data, hasRecentDentalVisit: false})} />
      </div>

      {/* 口腔衛生の管理内容 */}
      <div className="text-[9px] font-bold mt-2 mb-1">2　口腔衛生の管理内容</div>
      <div className="border border-gray-600 text-[9px] mb-2">
        <div className="border-b border-gray-400 p-1">
          記入者　<input type="text" value={data.managementContent.recorder} onChange={e => onChange({...data, managementContent: {...data.managementContent, recorder: e.target.value}})} className="border-b border-gray-400 px-1 w-24" />
          　（指示を行った歯科医師名：<input type="text" value={data.managementContent.directingDoctorName} onChange={e => onChange({...data, managementContent: {...data.managementContent, directingDoctorName: e.target.value}})} className="border-b border-gray-400 px-1 w-24" />）
        </div>
        <div className="border-b border-gray-400 p-1">
          <div className="font-medium mb-0.5">実施目標</div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 ml-2">
            {[
              {key: 'dentalDisease', label: '歯科疾患（重症化防止・改善）'},
              {key: 'oralHygiene', label: '口腔衛生（自立、介護者の口腔清掃の技術向上）'},
              {key: 'oralFunction', label: '摂食嚥下等の口腔機能（維持、改善）'},
              {key: 'dietForm', label: '食事形態（維持、改善）'},
              {key: 'nutritionStatus', label: '栄養状態（維持、改善）'},
              {key: 'aspirationPrevention', label: '誤嚥性肺炎の予防'},
            ].map(({key, label}) => (
              <label key={key} className="flex items-center gap-0.5 cursor-pointer">
                <input type="checkbox" checked={(data.managementContent.goals as unknown as Record<string, boolean>)[key]} onChange={e => updateGoal(key, e.target.checked)} className="w-3 h-3 accent-gray-800" />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="border-b border-gray-400 p-1">
          <div className="font-medium mb-0.5">実施内容</div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 ml-2">
            {[
              {key: 'oralCleaning', label: '口腔の清掃'},
              {key: 'oralCleaningGuidance', label: '口腔の清掃に関する指導'},
              {key: 'dentureCleaning', label: '義歯の清掃'},
              {key: 'dentureCleaningGuidance', label: '義歯の清掃に関する指導'},
              {key: 'oralFunctionGuidance', label: '摂食嚥下等の口腔機能に関する指導'},
              {key: 'aspirationPrevention', label: '誤嚥性肺炎の予防に関する指導'},
            ].map(({key, label}) => (
              <label key={key} className="flex items-center gap-0.5 cursor-pointer">
                <input type="checkbox" checked={(data.managementContent.implementations as unknown as Record<string, boolean>)[key]} onChange={e => updateImpl(key, e.target.checked)} className="w-3 h-3 accent-gray-800" />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="p-1">
          実施頻度　<input type="text" value={data.managementContent.frequency} onChange={e => onChange({...data, managementContent: {...data.managementContent, frequency: e.target.value}})} className="border-b border-gray-400 px-1 w-32" placeholder="月2回程度" />
        </div>
      </div>

      {/* 実施記録 */}
      <div className="text-[9px] font-bold mb-1">3　歯科衛生士が実施した口腔衛生等の管理及び介護職員への技術的助言等の内容</div>
      {data.implementationRecords.length === 0 ? (
        <div className="border border-gray-600 p-2 text-[9px] text-gray-400 text-center">
          実施記録はまだありません
        </div>
      ) : (
        data.implementationRecords.map((record, i) => (
          <div key={i} className="border border-gray-600 text-[9px] mb-1">
            <div className="border-b border-gray-400 p-1">
              実施日：{record.date}　（記入者：{record.recorder}）
            </div>
            <div className="p-1">
              <div className="font-medium">口腔衛生等の管理</div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 ml-2">
                {[
                  {key: 'oralCleaning', label: '口腔清掃'},
                  {key: 'oralCleaningGuidance', label: '口腔清掃に関する指導'},
                  {key: 'oralFunctionGuidance', label: '摂食嚥下等の口腔機能に関する指導'},
                  {key: 'aspirationPrevention', label: '誤嚥性肺炎の予防に関する指導'},
                ].map(({key, label}) => (
                  <span key={key}><Chk checked={(record.oralManagement as unknown as Record<string, boolean>)[key]} label={label} /></span>
                ))}
              </div>
              <div className="font-medium mt-1">介護職員への技術的助言等の内容</div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 ml-2">
                {[
                  {key: 'riskBasedCleaning', label: '入所者のリスクに応じた口腔清掃等の実施'},
                  {key: 'cleaningKnowledge', label: '口腔清掃にかかる知識、技術の習得の必要性'},
                  {key: 'oralFunctionImprovement', label: '摂食嚥下等の口腔機能の改善のための取組の実施'},
                  {key: 'dietConfirmation', label: '食事の状態の確認、食形態等の検討の必要性'},
                  {key: 'continueCurrent', label: '現在の取組の継続'},
                ].map(({key, label}) => (
                  <span key={key}><Chk checked={(record.technicalAdvice as unknown as Record<string, boolean>)[key]} label={label} /></span>
                ))}
              </div>
            </div>
          </div>
        ))
      )}

      {/* フッター */}
      <div className="text-right text-[9px] mt-2">{data.clinicName}</div>
    </PageWrapper>
  )
}
