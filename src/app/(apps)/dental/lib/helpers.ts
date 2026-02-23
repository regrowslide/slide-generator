import type {
  Patient,
  ProcedureItemSelection,
  DocumentRequirement,
  CalendarDay,
  Examination,
  SavedDocument,
  OralFunctionRecord,
} from './types'
import {DOCUMENT_TEMPLATES, getProcedureMaster, findMasterById} from './constants'

// =============================================================================
// プルダウン＋自由入力用の定型文選択肢
// =============================================================================

/** 訪問歯科治療内容説明書: 連絡事項の定型文 */
export const CONTACT_NOTES_PRESETS = [
  '口腔周囲の筋肉が硬いのでマッサージも行いました',
  '磨き残しが多く、全体のお掃除を行いました',
  'いつもと変わりなく、安定しています',
]

/** 訪問歯科治療内容説明書: 療養上の注意点の定型文 */
export const CARE_NOTES_PRESETS = [
  '磨き終わったころに見て、磨き残しがあったならば再度磨く指示を出してあげて下さい',
  '義歯の着脱は職員の方にお願いいたします',
  '食後のブラッシングを継続してください',
]

/** 歯在管管理計画書: 管理方針・治療方針の定型文 */
export const MANAGEMENT_POLICY_PRESETS = [
  '口腔機能の維持・改善のため、トレーニングもしていきます',
  '定期的に管理し、口腔衛生の維持と口腔機能の低下防止を目標とします',
  '歯周病の管理を継続し、残存歯の保全に努めます',
]

/** 訪問歯科衛生指導説明書: 注意事項の定型文 */
export const HYGIENE_CARE_NOTES_PRESETS = [
  'あいうべ体操が上手にできます。お口の状態はいつも通りです',
  '食後の歯磨きを継続してください',
  '口腔周囲筋のストレッチを日常的に行ってください',
]

/** 口腔機能管理計画書: 管理方針の定型文 */
export const ORAL_FUNCTION_MANAGEMENT_PRESETS = [
  '口腔機能の維持を目標に、定期的な管理とトレーニングを実施',
  '口腔衛生の改善と嚥下機能の維持を目指す',
  '残存歯の保全と咀嚼機能の回復を図る',
]

/** 患者名ヘルパー関数 */
export const getPatientName = (p: Patient): string => `${p.lastName} ${p.firstName}`

/** 患者名カナヘルパー関数 */
export const getPatientNameKana = (p: Patient): string => `${p.lastNameKana} ${p.firstNameKana}`

/**
 * 文書算定ロジック
 * 診察の実施項目とDH時間から、必要な提供文書を判定する
 */
export const calculateDocumentRequirements = ({
  procedureItems,
  dhSeconds,
}: {
  procedureItems: Record<string, ProcedureItemSelection> | undefined
  dhSeconds: number
}): Record<string, DocumentRequirement> => {
  const dhMinutes = Math.floor(dhSeconds / 60)
  const result: Record<string, DocumentRequirement> = {}

  // 管理計画書: 歯在管（shizaikan）がONの場合に必要
  const shizaikanSelected = !!procedureItems?.shizaikan
  result.doc_kanrikeikaku = {
    ...DOCUMENT_TEMPLATES.doc_kanrikeikaku,
    required: shizaikanSelected,
    reason: shizaikanSelected ? '歯在管が選択されています' : '歯在管が選択されていません',
  }

  // 訪問歯科衛生指導説明書: 訪衛指（houeishi）がON かつ DH20分以上の場合に必要
  const houeishiSelected = !!procedureItems?.houeishi
  const isDh20MinOver = dhMinutes >= 20
  const houeishiRequired = houeishiSelected && isDh20MinOver
  result.doc_houeishi = {
    ...DOCUMENT_TEMPLATES.doc_houeishi,
    required: houeishiRequired,
    dhMinutes,
    reason: !houeishiSelected
      ? '訪衛指が選択されていません'
      : !isDh20MinOver
        ? `DH施術時間が${dhMinutes}分です（20分以上必要）`
        : '訪衛指選択 + DH20分以上',
  }

  // 訪問歯科診療治療内容説明書: 歯訪（shihou）がONの場合に必要
  const shihouSelected = !!procedureItems?.shihou
  result.doc_houmon_chiryou = {
    ...DOCUMENT_TEMPLATES.doc_houmon_chiryou,
    required: shihouSelected,
    reason: shihouSelected ? '歯訪が選択されています' : '歯訪が選択されていません',
  }

  // 口腔機能精密検査記録用紙: 口腔機能低下症検査（koukuu_kensa）がONの場合に必要
  const koukuuKensaSelected = !!procedureItems?.koukuu_kensa
  result.doc_seimitsu_kensa = {
    ...DOCUMENT_TEMPLATES.doc_seimitsu_kensa,
    required: koukuuKensaSelected,
    reason: koukuuKensaSelected ? '口腔機能低下症検査が選択されています' : '口腔機能低下症検査が選択されていません',
  }

  // 口腔機能管理計画書: 口腔機能低下症検査（koukuu_kensa）がONの場合に必要
  result.doc_koukuu_kanri = {
    ...DOCUMENT_TEMPLATES.doc_koukuu_kanri,
    required: koukuuKensaSelected,
    reason: koukuuKensaSelected ? '口腔機能低下症検査が選択されています' : '口腔機能低下症検査が選択されていません',
  }

  // 口腔衛生管理加算: 手動追加のため常にオプション表示
  result.doc_kouei_kanri = {
    ...DOCUMENT_TEMPLATES.doc_kouei_kanri,
    required: false,
    reason: '必要に応じて手動で作成してください',
  }

  return result
}

/**
 * 日付をYYYY-MM-DD形式にフォーマット
 */
export const formatDate = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * 時刻をHH:MM:SS形式にフォーマット
 */
export const formatTime = (date: Date): string => {
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${h}:${m}:${s}`
}

/**
 * 秒数をMM:SS形式にフォーマット
 */
export const formatDuration = (seconds: number): string => {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')
  return `${m}:${s}`
}

/** 配列内の最大IDから次のIDを算出 */
export const nextId = (items: Array<{id: number}>): number => Math.max(0, ...items.map(i => i.id)) + 1

/** 口腔機能精密検査の該当項目数を算出 */
export const countApplicableItems = (record: OralFunctionRecord | null | undefined): number =>
  [
    record?.tongueCoatingApplicable,
    record?.oralDrynessApplicable,
    record?.biteForceApplicable,
    record?.oralMotorApplicable,
    record?.tonguePressureApplicable,
    record?.masticatoryApplicable,
    record?.swallowingApplicable,
  ].filter(Boolean).length

/**
 * カレンダーの日付配列を生成
 */
export const generateCalendarDays = (year: number, month: number): CalendarDay[] => {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDay = firstDay.getDay()
  const days: CalendarDay[] = []

  // 前月の日付
  for (let i = startDay - 1; i >= 0; i--) {
    const date = new Date(year, month, -i)
    days.push({date, isCurrentMonth: false})
  }

  // 当月の日付
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i)
    days.push({date, isCurrentMonth: true})
  }

  // 次月の日付（6週間分に揃える）
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(year, month + 1, i)
    days.push({date, isCurrentMonth: false})
  }

  return days
}

/**
 * 診察の合計点数を計算するヘルパー関数
 */
export const calculateExamPoints = (exam: Examination, visitDate: string): number => {
  if (!exam.procedureItems) return 0
  const master = getProcedureMaster(visitDate)
  let total = 0
  Object.entries(exam.procedureItems).forEach(([masterId, data]) => {
    const item = findMasterById(master, masterId)
    if (!item) return
    if (data.selectedSubItems) {
      data.selectedSubItems.forEach(subId => {
        const sub = item.subItems?.find(s => s.id === subId)
        if (sub) total += sub.points
      })
    } else if (item.defaultPoints) {
      total += item.defaultPoints
    }
  })
  return total
}

/**
 * 文書作成状況を取得するヘルパー関数
 */
export const getDocumentStatus = (
  exam: Examination,
  documents: SavedDocument[] | undefined,
  visitDate: string
): {required: number; completed: number} => {
  if (!exam.procedureItems) return {required: 0, completed: 0}
  const master = getProcedureMaster(visitDate)
  let required = 0
  let completed = 0
  Object.keys(exam.procedureItems).forEach(itemId => {
    const item = findMasterById(master, itemId)
    if (item?.documents?.length && item.documents.length > 0) {
      required += item.documents.length
      // 関連する文書が作成済みかチェック
      item.documents.forEach(doc => {
        const found = documents?.find(d => d.examinationId === exam.id && d.templateId === doc.id)
        if (found) completed++
      })
    }
  })
  return {required, completed}
}
