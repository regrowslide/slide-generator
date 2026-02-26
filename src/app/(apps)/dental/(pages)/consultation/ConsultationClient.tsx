'use client'

import {useState, useMemo, useCallback} from 'react'
import {useRouter} from 'next/navigation'
import {HREF} from '@cm/lib/methods/urls'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useModal from '@cm/components/utils/modal/useModal'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {updateDentalExamination} from '@app/(apps)/dental/_actions/examination-actions'
import {useConsultationTimer} from '@app/(apps)/dental/(pages)/hooks/useConsultationTimer'
import {
  INITIAL_VITAL,
  ZAISHIKAN_TARGET_TREATMENTS,
  EXAMINATION_STATUS,
  getProcedureMaster,
  findMasterById,
} from '@app/(apps)/dental/lib/constants'
import {
  getPatientName,
  getPatientNameKana,
  formatDate,
  formatDuration,
  countApplicableItems,
  calculateDocumentRequirements,
} from '@app/(apps)/dental/lib/helpers'
import type {
  Patient,
  Staff,
  Clinic,
  Examination,
  Vital,
  OralFunctionRecord,
  ProcedureItemSelection,
  ProcedureItemMaster,
  ScoringHistoryItem,
} from '@app/(apps)/dental/lib/types'

type Props = {
  examination: Examination
  patient: Patient
  staff: Staff[]
  clinic: Clinic
  visitDate: string
  consultationMode: 'doctor' | 'dh'
  allExaminations: Examination[]
  scoringHistories: ScoringHistoryItem[]
  visitPlanId: number
}

// =============================================================================
// バイタル入力フォーム
// =============================================================================

type VitalFormData = {
  bloodPressureHigh: string
  bloodPressureLow: string
  pulse: string
  spo2: string
  temperature: string
  measuredAt: string
}

const VitalForm = ({
  vital,
  onSubmit,
  onClose,
}: {
  vital: Vital | null
  onSubmit: (data: VitalFormData) => void
  onClose: () => void
}) => {
  const [formData, setFormData] = useState<VitalFormData>({
    bloodPressureHigh: vital?.bloodPressureHigh || '',
    bloodPressureLow: vital?.bloodPressureLow || '',
    pulse: vital?.pulse || '',
    spo2: vital?.spo2 || '',
    temperature: vital?.temperature || '',
    measuredAt: vital?.measuredAt || new Date().toTimeString().slice(0, 5),
  })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">血圧 (上/下)</label>
          <div className="flex items-center gap-1">
            <input type="number" value={formData.bloodPressureHigh} onChange={e => setFormData({...formData, bloodPressureHigh: e.target.value})} placeholder="120" className="w-20 px-2 py-2 border border-gray-300 rounded-md text-sm text-center" />
            <span className="text-gray-500">/</span>
            <input type="number" value={formData.bloodPressureLow} onChange={e => setFormData({...formData, bloodPressureLow: e.target.value})} placeholder="80" className="w-20 px-2 py-2 border border-gray-300 rounded-md text-sm text-center" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">脈拍 (bpm)</label>
          <input type="number" value={formData.pulse} onChange={e => setFormData({...formData, pulse: e.target.value})} placeholder="72" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SpO2 (%)</label>
          <input type="number" value={formData.spo2} onChange={e => setFormData({...formData, spo2: e.target.value})} placeholder="98" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">体温 (C)</label>
          <input type="number" step="0.1" value={formData.temperature} onChange={e => setFormData({...formData, temperature: e.target.value})} placeholder="36.5" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">測定時刻</label>
        <input type="time" value={formData.measuredAt} onChange={e => setFormData({...formData, measuredAt: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">キャンセル</button>
        <button onClick={() => onSubmit(formData)} className="px-4 py-2 bg-slate-700 text-white rounded-md text-sm hover:bg-slate-800">記録する</button>
      </div>
    </div>
  )
}

// =============================================================================
// バイタル表示
// =============================================================================

const VitalDisplay = ({vital, label, onEdit}: {vital: Vital | null; label: string; onEdit: () => void}) => {
  const hasData = vital && (vital.bloodPressureHigh || vital.spo2 || vital.temperature)
  return (
    <div onClick={onEdit} className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-slate-300 hover:bg-slate-50 transition-colors">
      <div className="text-xs text-gray-500 mb-2">{label}</div>
      {hasData ? (
        <div className="space-y-1 text-sm">
          {vital.bloodPressureHigh && <div>血圧: {vital.bloodPressureHigh}/{vital.bloodPressureLow} mmHg</div>}
          {vital.pulse && <div>脈拍: {vital.pulse} bpm</div>}
          {vital.spo2 && <div>SpO2: {vital.spo2}%</div>}
          {vital.temperature && <div>体温: {vital.temperature}C</div>}
          {vital.measuredAt && <div className="text-gray-400 text-xs">測定: {vital.measuredAt}</div>}
        </div>
      ) : (
        <div className="text-gray-400 text-sm">未記録 (タップで入力)</div>
      )}
    </div>
  )
}

// =============================================================================
// 口腔機能精密検査 記録用紙フォーム
// =============================================================================

const OralFunctionRecordForm = ({
  patient,
  initialData,
  onSave,
  onClose,
}: {
  patient: Patient
  initialData: OralFunctionRecord | null
  onSave: (data: OralFunctionRecord) => void
  onClose: () => void
}) => {
  const [formData, setFormData] = useState<OralFunctionRecord>(
    initialData || {
      measureDate: formatDate(new Date()),
      tongueCoatingPercent: '',
      tongueCoatingApplicable: false,
      oralMoistureValue: '',
      salivaAmount: '',
      oralDrynessApplicable: false,
      biteForceN: '',
      remainingTeeth: String(patient.teethCount || ''),
      biteForceApplicable: false,
      oralDiadochoPa: '',
      oralDiadochoTa: '',
      oralDiadochoKa: '',
      oralMotorApplicable: false,
      tonguePressureKPa: '',
      tonguePressureApplicable: false,
      masticatoryAbilityMgDl: '',
      masticatoryScoreMethod: '',
      masticatoryApplicable: false,
      swallowingEAT10Score: '',
      swallowingQuestionnaireA: '',
      swallowingApplicable: false,
      doctorName: '',
      hygienistName: '',
    }
  )

  const handleChange = (field: keyof OralFunctionRecord, value: string | boolean) => {
    setFormData(prev => ({...prev, [field]: value}))
  }

  const applicableCount = countApplicableItems(formData)
  const isOralHypofunction = applicableCount >= 3
  const inputCls = 'w-16 px-1 py-0.5 border border-gray-300 rounded text-center text-sm'
  const checkCls = 'w-4 h-4 accent-blue-600'

  return (
    <div className="space-y-4">
      {/* ヘッダー情報 */}
      <div className="border border-gray-300 rounded p-3 text-sm">
        <div className="font-medium">{getPatientName(patient)}</div>
        <div className="text-xs text-gray-500">{getPatientNameKana(patient)} | {patient.birthDate} | {patient.age}歳</div>
      </div>

      <div className="text-sm">
        計測日: <input type="date" value={formData.measureDate} onChange={e => handleChange('measureDate', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm" />
      </div>

      {/* 7つの下位症状 */}
      <div className="border border-gray-300 overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-1.5 text-center w-24">下位症状</th>
              <th className="border border-gray-300 p-1.5 text-center">検査項目</th>
              <th className="border border-gray-300 p-1.5 text-center w-32">検査値</th>
              <th className="border border-gray-300 p-1.5 text-center w-12">該当</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-1.5 text-center bg-gray-50">(1) 口腔衛生</td>
              <td className="border border-gray-300 p-1.5">舌苔の付着程度 (50%以上)</td>
              <td className="border border-gray-300 p-1.5 text-center"><input type="text" value={formData.tongueCoatingPercent} onChange={e => handleChange('tongueCoatingPercent', e.target.value)} className={inputCls} /> %</td>
              <td className="border border-gray-300 p-1.5 text-center"><input type="checkbox" checked={formData.tongueCoatingApplicable} onChange={e => handleChange('tongueCoatingApplicable', e.target.checked)} className={checkCls} /></td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-1.5 text-center bg-gray-50">(2) 口腔乾燥</td>
              <td className="border border-gray-300 p-1.5">口腔粘膜湿潤度 (27未満) / 唾液量 (2g以下)</td>
              <td className="border border-gray-300 p-1.5 text-center"><input type="text" value={formData.oralMoistureValue} onChange={e => handleChange('oralMoistureValue', e.target.value)} className={inputCls} /></td>
              <td className="border border-gray-300 p-1.5 text-center"><input type="checkbox" checked={formData.oralDrynessApplicable} onChange={e => handleChange('oralDrynessApplicable', e.target.checked)} className={checkCls} /></td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-1.5 text-center bg-gray-50">(3) 咬合力低下</td>
              <td className="border border-gray-300 p-1.5">咬合力検査 / 残存歯数 (20本未満)</td>
              <td className="border border-gray-300 p-1.5 text-center"><input type="text" value={formData.biteForceN} onChange={e => handleChange('biteForceN', e.target.value)} className={inputCls} /> N / <input type="text" value={formData.remainingTeeth} onChange={e => handleChange('remainingTeeth', e.target.value)} className={inputCls} /> 本</td>
              <td className="border border-gray-300 p-1.5 text-center"><input type="checkbox" checked={formData.biteForceApplicable} onChange={e => handleChange('biteForceApplicable', e.target.checked)} className={checkCls} /></td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-1.5 text-center bg-gray-50">(4) 舌口唇運動機能低下</td>
              <td className="border border-gray-300 p-1.5">オーラルディアドコキネシス (6回/秒未満)</td>
              <td className="border border-gray-300 p-1.5 text-center text-xs space-y-1">
                <div>パ <input type="text" value={formData.oralDiadochoPa} onChange={e => handleChange('oralDiadochoPa', e.target.value)} className="w-12 px-1 py-0.5 border border-gray-300 rounded text-center text-sm mx-1" /> 回/秒</div>
                <div>タ <input type="text" value={formData.oralDiadochoTa} onChange={e => handleChange('oralDiadochoTa', e.target.value)} className="w-12 px-1 py-0.5 border border-gray-300 rounded text-center text-sm mx-1" /> 回/秒</div>
                <div>カ <input type="text" value={formData.oralDiadochoKa} onChange={e => handleChange('oralDiadochoKa', e.target.value)} className="w-12 px-1 py-0.5 border border-gray-300 rounded text-center text-sm mx-1" /> 回/秒</div>
              </td>
              <td className="border border-gray-300 p-1.5 text-center"><input type="checkbox" checked={formData.oralMotorApplicable} onChange={e => handleChange('oralMotorApplicable', e.target.checked)} className={checkCls} /></td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-1.5 text-center bg-gray-50">(5) 低舌圧</td>
              <td className="border border-gray-300 p-1.5">舌圧検査 (30kPa未満)</td>
              <td className="border border-gray-300 p-1.5 text-center"><input type="text" value={formData.tonguePressureKPa} onChange={e => handleChange('tonguePressureKPa', e.target.value)} className={inputCls} /> kPa</td>
              <td className="border border-gray-300 p-1.5 text-center"><input type="checkbox" checked={formData.tonguePressureApplicable} onChange={e => handleChange('tonguePressureApplicable', e.target.checked)} className={checkCls} /></td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-1.5 text-center bg-gray-50">(6) 咀嚼機能低下</td>
              <td className="border border-gray-300 p-1.5">咀嚼能力検査 (100mg/dL未満)</td>
              <td className="border border-gray-300 p-1.5 text-center"><input type="text" value={formData.masticatoryAbilityMgDl} onChange={e => handleChange('masticatoryAbilityMgDl', e.target.value)} className={inputCls} /> mg/dL</td>
              <td className="border border-gray-300 p-1.5 text-center"><input type="checkbox" checked={formData.masticatoryApplicable} onChange={e => handleChange('masticatoryApplicable', e.target.checked)} className={checkCls} /></td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-1.5 text-center bg-gray-50">(7) 嚥下機能低下</td>
              <td className="border border-gray-300 p-1.5">EAT-10 (3点以上)</td>
              <td className="border border-gray-300 p-1.5 text-center"><input type="text" value={formData.swallowingEAT10Score} onChange={e => handleChange('swallowingEAT10Score', e.target.value)} className={inputCls} /> 点</td>
              <td className="border border-gray-300 p-1.5 text-center"><input type="checkbox" checked={formData.swallowingApplicable} onChange={e => handleChange('swallowingApplicable', e.target.checked)} className={checkCls} /></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm">該当項目が3項目以上で「口腔機能低下症」と診断する。</div>
        <div className={`text-lg font-bold ${isOralHypofunction ? 'text-red-600' : 'text-gray-700'}`}>
          該当項目数: {applicableCount} {isOralHypofunction && '→ 口腔機能低下症'}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">キャンセル</button>
        <button onClick={() => onSave(formData)} className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700">保存</button>
      </div>
    </div>
  )
}

// =============================================================================
// メイン: 診療画面
// =============================================================================

const ConsultationClient = ({
  examination,
  patient,
  staff,
  clinic,
  visitDate,
  consultationMode,
  allExaminations,
  scoringHistories,
  visitPlanId,
}: Props) => {
  const router = useRouter()
  const {query} = useGlobal()
  const DH_ALLOWED_ITEMS = ['houeishi', 'zaikouei']
  const isDhMode = consultationMode === 'dh'
  const currentMaster = useMemo(() => getProcedureMaster(visitDate), [visitDate])

  const {drSeconds, dhSeconds, drRunning, dhRunning, toggleDr, toggleDh} = useConsultationTimer()

  const [vitalBefore, setVitalBefore] = useState<Vital>(examination.vitalBefore || INITIAL_VITAL)
  const [vitalAfter, setVitalAfter] = useState<Vital>(examination.vitalAfter || INITIAL_VITAL)
  const [procedureItems, setProcedureItems] = useState<Record<string, ProcedureItemSelection>>(examination.procedureItems || {})
  const [treatmentPerformed, setTreatmentPerformed] = useState<string[]>(examination.treatmentPerformed || [])
  const [oralFunctionRecord, setOralFunctionRecord] = useState<OralFunctionRecord | null>(examination.oralFunctionRecord || null)
  const [visitCondition, setVisitCondition] = useState(examination.visitCondition || '')
  const [oralFindings, setOralFindings] = useState(examination.oralFindings || '')
  const [treatment, setTreatment] = useState(examination.treatment || '')
  const [nextPlan, setNextPlan] = useState(examination.nextPlan || '')

  // 個別フィールドの即時保存
  const saveField = useCallback(
    async (data: Parameters<typeof updateDentalExamination>[1]) => {
      await updateDentalExamination(examination.id, data)
    },
    [examination.id]
  )


  const infoModal = useModal()
  const oralRecordModal = useModal()
  const zaishikanTreatmentModal = useModal()
  const vitalBeforeModal = useModal()
  const vitalAfterModal = useModal()

  const doctor = staff.find(s => s.id === examination.doctorId)

  // 同一日同一施設の患者数
  const sameDayCount = useMemo(() => allExaminations.length || 1, [allExaminations])
  const sameMonthCount = sameDayCount

  // 過去実績を算定履歴から構築
  const pastClaims = useMemo(() => {
    return scoringHistories.map(h => ({
      patientId: h.patientId,
      month: h.lastScoredAt.slice(0, 7),
      claimedItems: [h.procedureId],
    }))
  }, [scoringHistories])

  // evaluate関数用コンテキスト
  const buildEvalContext = useCallback(
    () => ({
      drSeconds,
      dhSeconds,
      sameDayCount,
      sameMonthCount,
      hasDoctor: !!examination.doctorId,
      hasHygienist: !!examination.hygienistId,
      clinic,
      patient,
      pastClaims,
      currentMonth: visitDate.slice(0, 7),
      oralFunctionRecord,
      currentItems: procedureItems,
      treatmentPerformed,
    }),
    [drSeconds, dhSeconds, sameDayCount, sameMonthCount, examination, clinic, patient, pastClaims, visitDate, oralFunctionRecord, procedureItems, treatmentPerformed]
  )

  // 自動判定結果
  const autoJudgeResult = useMemo(() => {
    const ctx = buildEvalContext()
    const result: Record<string, ProcedureItemSelection> = {}
    currentMaster.forEach((master: ProcedureItemMaster) => {
      const hitSubs = master.subItems.filter(sub => !sub.isManualOnly && sub.evaluate(ctx)).map(sub => sub.id)
      if (hitSubs.length > 0) {
        result[master.id] = {
          selectedSubItems: master.selectionMode === 'single' ? [hitSubs[0]] : hitSubs,
          isAutoSet: true,
        }
      }
    })
    return result
  }, [buildEvalContext, currentMaster])

  const confirmIfOverride = (masterId: string, willSelect: boolean): boolean => {
    const auto = autoJudgeResult[masterId]
    if (!auto) return true
    if (auto && !willSelect) {
      return window.confirm('自動条件判定を無視して切り替えますか？')
    }
    return true
  }

  const handleToggleProcedure = (masterId: string) => {
    const isCurrentlySelected = !!procedureItems[masterId]
    if (!confirmIfOverride(masterId, !isCurrentlySelected)) return
    let next: Record<string, ProcedureItemSelection>
    if (procedureItems[masterId]) {
      const {[masterId]: _, ...rest} = procedureItems
      next = rest
    } else {
      next = {...procedureItems, [masterId]: {selectedSubItems: [], isAutoSet: false}}
    }
    setProcedureItems(next)
    saveField({procedureItems: next as Record<string, unknown>})
  }

  const handleSelectSubItem = (masterId: string, subItemId: string, selectionMode: 'single' | 'multiple') => {
    const current = procedureItems[masterId]
    if (!current) return
    let newSelected: string[]
    if (selectionMode === 'single') {
      newSelected = [subItemId]
    } else {
      if (current.selectedSubItems.includes(subItemId)) {
        newSelected = current.selectedSubItems.filter(id => id !== subItemId)
      } else {
        newSelected = [...current.selectedSubItems, subItemId]
      }
    }
    const next = {...procedureItems, [masterId]: {...current, selectedSubItems: newSelected, isAutoSet: false}}
    setProcedureItems(next)
    saveField({procedureItems: next as Record<string, unknown>})
  }

  const handleAutoSetAll = () => {
    const next = {...procedureItems, ...autoJudgeResult}
    setProcedureItems(next)
    saveField({procedureItems: next as Record<string, unknown>})
  }

  const calculateTotalPoints = () => {
    let total = 0
    Object.entries(procedureItems).forEach(([masterId, data]) => {
      const master = findMasterById(currentMaster, masterId)
      if (!master) return
      ;(data.selectedSubItems || []).forEach(subId => {
        const sub = master.subItems.find(s => s.id === subId)
        if (sub) total += sub.points
      })
    })
    return total
  }

  const getItemPoints = (masterId: string) => {
    const master = findMasterById(currentMaster, masterId)
    const data = procedureItems[masterId]
    if (!master || !data) return 0
    let total = 0
    ;(data.selectedSubItems || []).forEach(subId => {
      const sub = master.subItems.find(s => s.id === subId)
      if (sub) total += sub.points
    })
    return total
  }

  const isManualOverride = (masterId: string) => {
    const auto = autoJudgeResult[masterId]
    if (!auto) return false
    const current = procedureItems[masterId]
    if (!current) return true
    const autoSorted = [...(auto.selectedSubItems || [])].sort().join(',')
    const currentSorted = [...(current.selectedSubItems || [])].sort().join(',')
    return autoSorted !== currentSorted
  }

  // 診療完了（statusをDONEに変更）
  const handleSave = async () => {
    await saveField({status: EXAMINATION_STATUS.DONE})
    router.push(HREF(`/dental/visit-detail`, {visitPlanId}, query))
    router.refresh()
  }

  const is20MinOver = drSeconds >= 1200 || dhSeconds >= 1200

  // 文書要件
  const docRequirements = calculateDocumentRequirements({procedureItems, dhSeconds})

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push(HREF(`/dental/visit-detail`, {visitPlanId}, query))} className="text-gray-400 hover:text-gray-600">&lt;</button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded">{patient.building}</span>
              <span className="text-xs text-gray-600">{patient.floor}-{patient.room}</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{getPatientName(patient)} 様</h2>
          </div>
        </div>
        <div className="text-right text-sm">
          <div className="text-gray-500">担当: <span className="font-medium text-gray-900">{doctor?.name || '-'}</span></div>
          <div className="text-gray-500">モード: <span className={`font-medium ${isDhMode ? 'text-amber-600' : 'text-slate-700'}`}>{isDhMode ? '歯科衛生士（DH）' : '歯科医師'}</span></div>
        </div>
      </div>

      {/* タイマーセクション */}
      <div className="bg-white rounded-lg border border-gray-200 mb-4 p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <span className={`px-2 py-0.5 text-xs rounded ${drRunning ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>DR</span>
            <span className={`text-2xl font-mono ${is20MinOver ? 'text-red-600' : 'text-gray-900'}`}>{formatDuration(drSeconds)}</span>
            <button onClick={toggleDr} className={`px-3 py-1 text-sm rounded ${drRunning ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>{drRunning ? '終了' : '開始'}</button>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-2 py-0.5 text-xs rounded ${dhRunning ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>DH</span>
            <span className={`text-2xl font-mono ${is20MinOver ? 'text-red-600' : 'text-gray-900'}`}>{formatDuration(dhSeconds)}</span>
            <button onClick={toggleDh} className={`px-3 py-1 text-sm rounded ${dhRunning ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>{dhRunning ? '終了' : '開始'}</button>
          </div>
        </div>
        {is20MinOver && (
          <div className="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">20分を超過しています</div>
        )}
      </div>

      {/* バイタル測定 */}
      <div className="bg-white rounded-lg border border-gray-200 mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">バイタル測定</span>
        </div>
        <div className="p-4 grid grid-cols-2 gap-4">
          <VitalDisplay vital={vitalBefore} label="処置前" onEdit={() => vitalBeforeModal.handleOpen()} />
          <VitalDisplay vital={vitalAfter} label="処置後" onEdit={() => vitalAfterModal.handleOpen()} />
        </div>
      </div>

      <vitalBeforeModal.Modal title="処置前バイタル入力">
        <VitalForm vital={vitalBefore} onSubmit={data => { setVitalBefore(data); saveField({vitalBefore: data as Record<string, unknown>}); vitalBeforeModal.handleClose() }} onClose={vitalBeforeModal.handleClose} />
      </vitalBeforeModal.Modal>
      <vitalAfterModal.Modal title="処置後バイタル入力">
        <VitalForm vital={vitalAfter} onSubmit={data => { setVitalAfter(data); saveField({vitalAfter: data as Record<string, unknown>}); vitalAfterModal.handleClose() }} onClose={vitalAfterModal.handleClose} />
      </vitalAfterModal.Modal>

      {/* 実施記録・所見 */}
      <div className="bg-white rounded-lg border border-gray-200 mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">実施記録・所見</span>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <div className="text-xs text-gray-600 mb-1">1. 訪問時の様子</div>
            <textarea value={visitCondition} onChange={e => setVisitCondition(e.target.value)} onBlur={e => saveField({visitCondition: e.target.value})} placeholder="例: ベッド上臥位、覚醒良好..." rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none" />
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">2. 口腔内所見</div>
            <textarea value={oralFindings} onChange={e => setOralFindings(e.target.value)} onBlur={e => saveField({oralFindings: e.target.value})} placeholder="例: 右下残根部発赤あり、PCR 40%..." rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none" />
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">3. 処置</div>
            <textarea value={treatment} onChange={e => setTreatment(e.target.value)} onBlur={e => saveField({treatment: e.target.value})} placeholder="例: 義歯調整、口腔ケア、TBI..." rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none" />
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">4. 次回予定</div>
            <textarea value={nextPlan} onChange={e => setNextPlan(e.target.value)} onBlur={e => saveField({nextPlan: e.target.value})} placeholder="例: 1週間後、義歯経過観察..." rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none" />
          </div>
        </div>
      </div>

      {/* DHモード注意バナー */}
      {isDhMode && (
        <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-300 rounded-lg">
          <div className="text-sm font-medium text-amber-800">DHモードで操作中</div>
          <div className="text-xs text-amber-600">操作可能な項目: 訪衛指・在口衛のみ</div>
        </div>
      )}

      {/* 口腔機能精密検査 */}
      <R_Stack className="mb-2 gap-2">
        <span className="text-sm font-medium text-gray-700">口腔機能精密検査</span>
        <button onClick={() => oralRecordModal.handleOpen()} className="px-3 py-1 border border-gray-300 rounded text-xs hover:bg-gray-50">記録用紙を入力</button>
        {oralFunctionRecord && (
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs rounded">記録済（該当{countApplicableItems(oralFunctionRecord)}項目）</span>
        )}
      </R_Stack>

      {/* 実施項目の選択（加算） */}
      <div className="bg-white rounded-lg border border-gray-200 mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">実施項目の選択（加算）</span>
          <div className="flex items-center gap-3">
            <button onClick={handleAutoSetAll} className="px-3 py-1 border border-gray-300 rounded text-xs hover:bg-gray-50">全項目自動判定</button>
            <div className="text-sm font-bold text-slate-700">合計: {calculateTotalPoints().toLocaleString()} 点</div>
          </div>
        </div>

        <div className="p-4 space-y-2">
          {(isDhMode ? currentMaster.filter((i: ProcedureItemMaster) => DH_ALLOWED_ITEMS.includes(i.id)) : currentMaster).map(
            (master: ProcedureItemMaster) => {
              const isSelected = !!procedureItems[master.id]
              const itemData = procedureItems[master.id]
              const points = getItemPoints(master.id)
              const hasOverride = isManualOverride(master.id)

              return (
                <div key={master.id} className="border rounded-lg overflow-hidden">
                  {/* ON/OFFトグル + 項目名 */}
                  <div
                    className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${isSelected ? 'bg-slate-50 border-slate-300' : 'bg-white hover:bg-gray-50'}`}
                    onClick={() => handleToggleProcedure(master.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-6 rounded-full relative transition-colors ${isSelected ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isSelected ? 'translate-x-7' : 'translate-x-1'}`} />
                      </div>
                      <span className={`font-medium ${isSelected ? 'text-slate-800' : 'text-gray-700'}`}>{master.name}</span>
                      {hasOverride && <span className="text-amber-500 text-sm" title="自動条件判定と異なります">!</span>}
                      <button
                        onClick={e => { e.stopPropagation(); infoModal.handleOpen({name: master.fullName, text: master.infoText || ''}) }}
                        className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-slate-300 text-xs"
                      >
                        i
                      </button>
                    </div>
                    {isSelected && points > 0 && (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">+{points}点</span>
                    )}
                  </div>

                  {/* サブアイテム表示 */}
                  {isSelected && master.subItems?.length > 0 && (
                    <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-3">
                      <div className="text-xs text-gray-600 mb-2">該当区分</div>
                      <div className="flex flex-wrap gap-2">
                        {master.subItems.map(sub => {
                          const isSubSelected = (itemData?.selectedSubItems || []).includes(sub.id)
                          const inputType = master.selectionMode === 'single' ? 'radio' : 'checkbox'
                          return (
                            <label key={sub.id} className={`flex items-center gap-2 px-3 py-2 border rounded cursor-pointer transition-colors ${isSubSelected ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 bg-white hover:border-gray-400'}`}>
                              <input type={inputType} name={`sub-${master.id}`} checked={isSubSelected} onChange={() => handleSelectSubItem(master.id, sub.id, master.selectionMode)} className="w-4 h-4 text-emerald-600 accent-emerald-600" />
                              <span className="text-sm">{sub.name}</span>
                              <span className="text-xs text-gray-500">({sub.points}点)</span>
                              {sub.isManualOnly && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded">手動</span>}
                            </label>
                          )
                        })}
                      </div>
                      {/* 在歯管の場合: 対象の治療ボタン */}
                      {master.id === 'zaishikan' && (
                        <div className="mt-2">
                          <button
                            onClick={() => zaishikanTreatmentModal.handleOpen()}
                            className={`px-3 py-1.5 text-sm rounded border ${
                              clinic.qualifications.zahoshin && Object.values(patient.diseases || {}).some(v => v)
                                ? 'bg-slate-700 text-white border-slate-700'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            対象の治療を選択 {treatmentPerformed.length > 0 && `(${treatmentPerformed.length}件選択中)`}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 訪衛指: DH時間20分未満の場合に警告 */}
                  {master.id === 'houeishi' && dhSeconds < 1200 && dhSeconds > 0 && (
                    <div className="mx-3 mb-3 mt-1 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700">
                      DH時間が20分未満です。在口衛の算定をしますか？
                    </div>
                  )}
                </div>
              )
            }
          )}
        </div>
      </div>

      {/* 提供文書セクション */}
      <div className="bg-white rounded-lg border border-gray-200 mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">提供文書</span>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-3">
            {Object.entries(docRequirements).map(([docId, doc]) => (
              <div key={docId} className="flex flex-col items-start gap-1">
                <button
                  onClick={() => router.push(HREF(`/dental/document-create`, {examinationId: examination.id, templateId: docId}, query))}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    doc.required ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-gray-300 bg-gray-50 text-gray-500'
                  }`}
                >
                  {doc.required && <span className="text-emerald-600">*</span>}
                  <span className="font-medium text-sm">{doc.name}</span>
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-gray-500 space-y-1">
            {Object.entries(docRequirements).map(([docId, doc]) => (
              <div key={docId} className={doc.required ? 'text-emerald-600' : ''}>
                {doc.name}: {doc.reason}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 解説テキストポップアップ */}
      <infoModal.Modal title={infoModal.open?.name || '解説'}>
        <p className="text-sm text-gray-700 leading-relaxed">{infoModal.open?.text}</p>
        <div className="flex justify-end mt-4">
          <button onClick={infoModal.handleClose} className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">閉じる</button>
        </div>
      </infoModal.Modal>

      {/* 記録用紙モーダル */}
      <oralRecordModal.Modal title="口腔機能精密検査 記録用紙">
        <OralFunctionRecordForm
          patient={patient}
          initialData={oralFunctionRecord}
          onSave={data => { setOralFunctionRecord(data); saveField({oralFunctionRecord: data as Record<string, unknown>}); oralRecordModal.handleClose() }}
          onClose={oralRecordModal.handleClose}
        />
      </oralRecordModal.Modal>

      {/* 在歯管 対象の治療選択モーダル */}
      <zaishikanTreatmentModal.Modal title="在歯管 算定対象治療の選択">
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {ZAISHIKAN_TARGET_TREATMENTS.map(cat => (
            <div key={cat.category}>
              <div className="text-sm font-medium text-gray-700 mb-2">{cat.category}</div>
              <div className="space-y-1">
                {cat.items.map(item => (
                  <label key={item} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={treatmentPerformed.includes(item)}
                      onChange={e => {
                        const next = e.target.checked
                          ? [...treatmentPerformed, item]
                          : treatmentPerformed.filter(t => t !== item)
                        setTreatmentPerformed(next)
                        saveField({treatmentPerformed: next as unknown[]})
                      }}
                      className="w-4 h-4 accent-emerald-600"
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={zaishikanTreatmentModal.handleClose} className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">閉じる</button>
        </div>
      </zaishikanTreatmentModal.Modal>

      {/* 保存ボタン */}
      <div className="flex justify-end gap-2">
        <button
          onClick={() => router.push(HREF(`/dental/visit-detail`, {visitPlanId}, query))}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
        >
          キャンセル
        </button>
        <button
          onClick={() => router.push(HREF(`/dental/document-create`, {examinationId: examination.id}, query))}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
        >
          文書作成へ
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700"
        >
          診察完了・保存
        </button>
      </div>
    </div>
  )
}

export default ConsultationClient
