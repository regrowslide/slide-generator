'use client'

import {useState, useMemo, useCallback, useEffect} from 'react'
import useModal from '@cm/components/utils/modal/useModal'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {
  INITIAL_VITAL,
  ZAISHIKAN_TARGET_TREATMENTS,
  EXAMINATION_STATUS,
  getProcedureMaster,
  findMasterById,
} from './constants'
import {INITIAL_PAST_EXAMINATIONS} from './mock-data'
import {
  getPatientName,
  getPatientNameKana,
  formatDate,
  formatTime,
  formatDuration,
  countApplicableItems,
  calculateDocumentRequirements,
} from './helpers'
import {
  Button,
  Badge,
  Card,
  TextArea,
  IconChevronLeft,
} from './ui-components'
import type {
  Patient,
  Staff,
  Clinic,
  Examination,
  Vital,
  OralFunctionRecord,
  ProcedureItemSelection,
  ProcedureItemMaster,
} from './types'

// =============================================================================
// Props型定義（ローカル）
// =============================================================================

type VitalFormData = {
  bloodPressureHigh: string
  bloodPressureLow: string
  pulse: string
  spo2: string
  temperature: string
  measuredAt: string
}

type VitalFormProps = {
  vital: Vital | null
  type: 'before' | 'after'
  onSubmit: (data: VitalFormData) => void
  onClose: () => void
}

type VitalDisplayProps = {
  vital: Vital | null
  label: string
  onEdit: () => void
}

type OralFunctionRecordFormProps = {
  patient: Patient | null
  initialData: OralFunctionRecord | null
  onSave: (data: OralFunctionRecord) => void
  onClose: () => void
}

type ConsultationPageProps = {
  examination: Examination
  patient: Patient
  staff: Staff[]
  clinic: Clinic
  hasQualification: (qualId: string) => boolean
  onBack: () => void
  onUpdate: (examId: number, data: Partial<Examination>) => void
  onOpenDocument: (docType: string, context: Record<string, unknown>) => void
  onShowFinalReview: () => void
  consultationMode: 'doctor' | 'dh'
  allExaminations: Examination[]
  visitDate: string
}

type DocumentSectionProps = {
  procedureItems: Record<string, ProcedureItemSelection>
  dhSeconds: number
  onOpenDocument: (docType: string) => void
}

// =============================================================================
// コンポーネント
// =============================================================================

/**
 * バイタル入力フォーム
 */
export const VitalForm = ({vital, type, onSubmit, onClose}: VitalFormProps) => {
  const [formData, setFormData] = useState<VitalFormData>({
    bloodPressureHigh: vital?.bloodPressureHigh || '',
    bloodPressureLow: vital?.bloodPressureLow || '',
    pulse: vital?.pulse || '',
    spo2: vital?.spo2 || '',
    temperature: vital?.temperature || '',
    measuredAt: vital?.measuredAt || new Date().toTimeString().slice(0, 5),
  })

  const handleSubmit = () => {
    onSubmit(formData)
  }

  return (
    <div className="space-y-4">
      {/* 血圧と脈拍 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">血圧 (上/下)</label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={formData.bloodPressureHigh}
              onChange={e => setFormData({...formData, bloodPressureHigh: e.target.value})}
              placeholder="120"
              className="w-20 px-2 py-2 border border-gray-300 rounded-md text-sm text-center"
            />
            <span className="text-gray-500">/</span>
            <input
              type="number"
              value={formData.bloodPressureLow}
              onChange={e => setFormData({...formData, bloodPressureLow: e.target.value})}
              placeholder="80"
              className="w-20 px-2 py-2 border border-gray-300 rounded-md text-sm text-center"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">脈拍 (bpm)</label>
          <input
            type="number"
            value={formData.pulse}
            onChange={e => setFormData({...formData, pulse: e.target.value})}
            placeholder="72"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>

      {/* SpO2と体温 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SpO2 (%)</label>
          <input
            type="number"
            value={formData.spo2}
            onChange={e => setFormData({...formData, spo2: e.target.value})}
            placeholder="98"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">体温 (°C)</label>
          <input
            type="number"
            step="0.1"
            value={formData.temperature}
            onChange={e => setFormData({...formData, temperature: e.target.value})}
            placeholder="36.5"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>

      {/* 測定時刻 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">測定時刻</label>
        <input
          type="time"
          value={formData.measuredAt}
          onChange={e => setFormData({...formData, measuredAt: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onClose}>
          キャンセル
        </Button>
        <Button onClick={handleSubmit}>記録する</Button>
      </div>
    </div>
  )
}

/**
 * バイタル表示コンポーネント
 */
export const VitalDisplay = ({vital, label, onEdit}: VitalDisplayProps) => {
  const hasData = vital && (vital.bloodPressureHigh || vital.spo2 || vital.temperature)

  return (
    <div
      onClick={onEdit}
      className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-slate-300 hover:bg-slate-50 transition-colors"
    >
      <div className="text-xs text-gray-500 mb-2">{label}</div>
      {hasData ? (
        <div className="space-y-1 text-sm">
          {vital.bloodPressureHigh && (
            <div>
              血圧: {vital.bloodPressureHigh}/{vital.bloodPressureLow} mmHg
            </div>
          )}
          {vital.pulse && <div>脈拍: {vital.pulse} bpm</div>}
          {vital.spo2 && <div>SpO2: {vital.spo2}%</div>}
          {vital.temperature && <div>体温: {vital.temperature}°C</div>}
          {vital.measuredAt && <div className="text-gray-400 text-xs">測定: {vital.measuredAt}</div>}
        </div>
      ) : (
        <div className="text-gray-400 text-sm">未記録 (タップで入力)</div>
      )}
    </div>
  )
}

/**
 * 口腔機能精密検査 記録用紙フォームコンポーネント
 */
export const OralFunctionRecordForm = ({patient, initialData, onSave, onClose}: OralFunctionRecordFormProps) => {
  const [formData, setFormData] = useState<OralFunctionRecord>(
    initialData || {
      measureDate: formatDate(new Date()),
      tongueCoatingPercent: '',
      tongueCoatingApplicable: false,
      oralMoistureValue: '',
      salivaAmount: '',
      oralDrynessApplicable: false,
      biteForceN: '',
      remainingTeeth: String(patient?.teethCount || ''),
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

  // 該当項目数の自動計算
  const applicableCount = countApplicableItems(formData)
  const isOralHypofunction = applicableCount >= 3

  const inputCls =
    'w-16 px-1 py-0.5 border border-gray-300 rounded text-center text-sm focus:outline-none focus:ring-1 focus:ring-blue-400'
  const checkCls = 'w-4 h-4 accent-blue-600'

  return (
    <div className="space-y-4 ">
      {/* ヘッダー情報 */}
      <div className="border border-gray-400">
        <table className="w-full text-sm border-collapse">
          <tbody>
            <tr className="border-b border-gray-300">
              <td className="border-r border-gray-300 p-2 bg-gray-50 w-28">
                <div className="text-[10px] text-gray-500">フリガナ</div>
                <div className="text-xs">{patient ? getPatientNameKana(patient) : ''}</div>
                <div className="text-[10px] text-gray-500 mt-1">患者氏名</div>
                <div className="font-medium">{patient ? getPatientName(patient) : ''}</div>
              </td>
              <td className="border-r border-gray-300 p-2 bg-gray-50 text-center w-24">
                <div className="text-[10px] text-gray-500">患者番号</div>
                <div>{patient?.id || ''}</div>
              </td>
              <td className="border-r border-gray-300 p-2 bg-gray-50 text-center w-24">
                <div className="text-[10px] text-gray-500">生年月日</div>
                <div className="text-xs">{patient?.birthDate || ''}</div>
              </td>
              <td className="border-r border-gray-300 p-2 bg-gray-50 text-center w-16">
                <div className="text-[10px] text-gray-500">(歳)</div>
                <div>{patient?.age || ''}</div>
              </td>
              <td className="p-2 bg-gray-50 text-center w-16">
                <div>{patient?.gender === 'male' ? '男' : '女'}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 計測日 */}
      <div className="text-sm">
        計測日:{' '}
        <input
          type="date"
          value={formData.measureDate}
          onChange={e => handleChange('measureDate', e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        />
      </div>

      {/* 7つの下位症状テーブル */}
      <div className="border border-gray-400 overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-1.5 text-center w-24">下位症状</th>
              <th className="border border-gray-300 p-1.5 text-center">検査項目</th>
              <th className="border border-gray-300 p-1.5 text-center w-40">該当基準</th>
              <th className="border border-gray-300 p-1.5 text-center w-32">検査値</th>
              <th className="border border-gray-300 p-1.5 text-center w-12">該当</th>
            </tr>
          </thead>
          <tbody>
            {/* (1) 口腔衛生状態不良 */}
            <tr>
              <td className="border border-gray-300 p-1.5 text-center bg-gray-50">
                (1) 口腔衛生
                <br />
                状態不良
              </td>
              <td className="border border-gray-300 p-1.5">舌苔の付着程度</td>
              <td className="border border-gray-300 p-1.5 text-center">50%以上</td>
              <td className="border border-gray-300 p-1.5 text-center">
                <input
                  type="text"
                  value={formData.tongueCoatingPercent}
                  onChange={e => handleChange('tongueCoatingPercent', e.target.value)}
                  className={inputCls}
                />{' '}
                %
              </td>
              <td className="border border-gray-300 p-1.5 text-center">
                <input
                  type="checkbox"
                  checked={formData.tongueCoatingApplicable}
                  onChange={e => handleChange('tongueCoatingApplicable', e.target.checked)}
                  className={checkCls}
                />
              </td>
            </tr>
            {/* (2) 口腔乾燥 */}
            <tr>
              <td className="border border-gray-300 p-1.5 text-center bg-gray-50" rowSpan={2}>
                (2) 口腔乾燥
              </td>
              <td className="border border-gray-300 p-1.5">口腔粘膜湿潤度</td>
              <td className="border border-gray-300 p-1.5 text-center">27未満</td>
              <td className="border border-gray-300 p-1.5 text-center">
                <input
                  type="text"
                  value={formData.oralMoistureValue}
                  onChange={e => handleChange('oralMoistureValue', e.target.value)}
                  className={inputCls}
                />
              </td>
              <td className="border border-gray-300 p-1.5 text-center" rowSpan={2}>
                <input
                  type="checkbox"
                  checked={formData.oralDrynessApplicable}
                  onChange={e => handleChange('oralDrynessApplicable', e.target.checked)}
                  className={checkCls}
                />
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-1.5">唾液量</td>
              <td className="border border-gray-300 p-1.5 text-center">2g/2分以下</td>
              <td className="border border-gray-300 p-1.5 text-center">
                <input
                  type="text"
                  value={formData.salivaAmount}
                  onChange={e => handleChange('salivaAmount', e.target.value)}
                  className={inputCls}
                />{' '}
                g
              </td>
            </tr>
            {/* (3) 咬合力低下 */}
            <tr>
              <td className="border border-gray-300 p-1.5 text-center bg-gray-50" rowSpan={2}>
                (3) 咬合力低下
              </td>
              <td className="border border-gray-300 p-1.5">咬合力検査</td>
              <td className="border border-gray-300 p-1.5 text-xs leading-tight">
                350N未満(デンタルプレスケールII・フィルタあり)
                <br />
                500N未満(デンタルプレスケールII・フィルタなし)
                <br />
                200N未満(デンタルプレスケール)
                <br />
                375N未満(Orano-bf)
              </td>
              <td className="border border-gray-300 p-1.5 text-center">
                <input
                  type="text"
                  value={formData.biteForceN}
                  onChange={e => handleChange('biteForceN', e.target.value)}
                  className={inputCls}
                />{' '}
                N
              </td>
              <td className="border border-gray-300 p-1.5 text-center" rowSpan={2}>
                <input
                  type="checkbox"
                  checked={formData.biteForceApplicable}
                  onChange={e => handleChange('biteForceApplicable', e.target.checked)}
                  className={checkCls}
                />
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-1.5">残存歯数</td>
              <td className="border border-gray-300 p-1.5 text-center">20本未満</td>
              <td className="border border-gray-300 p-1.5 text-center">
                <input
                  type="text"
                  value={formData.remainingTeeth}
                  onChange={e => handleChange('remainingTeeth', e.target.value)}
                  className={inputCls}
                />{' '}
                本
              </td>
            </tr>
            {/* (4) 舌口唇運動機能低下 */}
            <tr>
              <td className="border border-gray-300 p-1.5 text-center bg-gray-50">
                (4) 舌口唇運動
                <br />
                機能低下
              </td>
              <td className="border border-gray-300 p-1.5">オーラルディアドコキネシス</td>
              <td className="border border-gray-300 p-1.5 text-center">
                どれか1つでも
                <br />
                6回/秒未満
              </td>
              <td className="border border-gray-300 p-1.5 text-center text-xs space-y-1">
                <div>
                  「パ」
                  <input
                    type="text"
                    value={formData.oralDiadochoPa}
                    onChange={e => handleChange('oralDiadochoPa', e.target.value)}
                    className="w-12 px-1 py-0.5 border border-gray-300 rounded text-center text-sm mx-1"
                  />
                  回/秒
                </div>
                <div>
                  「タ」
                  <input
                    type="text"
                    value={formData.oralDiadochoTa}
                    onChange={e => handleChange('oralDiadochoTa', e.target.value)}
                    className="w-12 px-1 py-0.5 border border-gray-300 rounded text-center text-sm mx-1"
                  />
                  回/秒
                </div>
                <div>
                  「カ」
                  <input
                    type="text"
                    value={formData.oralDiadochoKa}
                    onChange={e => handleChange('oralDiadochoKa', e.target.value)}
                    className="w-12 px-1 py-0.5 border border-gray-300 rounded text-center text-sm mx-1"
                  />
                  回/秒
                </div>
              </td>
              <td className="border border-gray-300 p-1.5 text-center">
                <input
                  type="checkbox"
                  checked={formData.oralMotorApplicable}
                  onChange={e => handleChange('oralMotorApplicable', e.target.checked)}
                  className={checkCls}
                />
              </td>
            </tr>
            {/* (5) 低舌圧 */}
            <tr>
              <td className="border border-gray-300 p-1.5 text-center bg-gray-50">(5) 低舌圧</td>
              <td className="border border-gray-300 p-1.5">舌圧検査</td>
              <td className="border border-gray-300 p-1.5 text-center">30kPa未満</td>
              <td className="border border-gray-300 p-1.5 text-center">
                <input
                  type="text"
                  value={formData.tonguePressureKPa}
                  onChange={e => handleChange('tonguePressureKPa', e.target.value)}
                  className={inputCls}
                />{' '}
                kPa
              </td>
              <td className="border border-gray-300 p-1.5 text-center">
                <input
                  type="checkbox"
                  checked={formData.tonguePressureApplicable}
                  onChange={e => handleChange('tonguePressureApplicable', e.target.checked)}
                  className={checkCls}
                />
              </td>
            </tr>
            {/* (6) 咀嚼機能低下 */}
            <tr>
              <td className="border border-gray-300 p-1.5 text-center bg-gray-50" rowSpan={2}>
                (6) 咀嚼機能
                <br />
                低下
              </td>
              <td className="border border-gray-300 p-1.5">咀嚼能力検査</td>
              <td className="border border-gray-300 p-1.5 text-center">100mg/dL未満</td>
              <td className="border border-gray-300 p-1.5 text-center">
                <input
                  type="text"
                  value={formData.masticatoryAbilityMgDl}
                  onChange={e => handleChange('masticatoryAbilityMgDl', e.target.value)}
                  className={inputCls}
                />{' '}
                mg/dL
              </td>
              <td className="border border-gray-300 p-1.5 text-center" rowSpan={2}>
                <input
                  type="checkbox"
                  checked={formData.masticatoryApplicable}
                  onChange={e => handleChange('masticatoryApplicable', e.target.checked)}
                  className={checkCls}
                />
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-1.5">咀嚼能率スコア法</td>
              <td className="border border-gray-300 p-1.5 text-center">スコア 0, 1, 2</td>
              <td className="border border-gray-300 p-1.5 text-center">
                <select
                  value={formData.masticatoryScoreMethod}
                  onChange={e => handleChange('masticatoryScoreMethod', e.target.value)}
                  className="border border-gray-300 rounded px-1 py-0.5 text-sm"
                >
                  <option value="">-</option>
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </td>
            </tr>
            {/* (7) 嚥下機能低下 */}
            <tr>
              <td className="border border-gray-300 p-1.5 text-center bg-gray-50" rowSpan={2}>
                (7) 嚥下機能
                <br />
                低下
              </td>
              <td className="border border-gray-300 p-1.5">
                嚥下スクリーニング検査
                <br />
                (EAT-10)
              </td>
              <td className="border border-gray-300 p-1.5 text-center">3点以上</td>
              <td className="border border-gray-300 p-1.5 text-center">
                <input
                  type="text"
                  value={formData.swallowingEAT10Score}
                  onChange={e => handleChange('swallowingEAT10Score', e.target.value)}
                  className={inputCls}
                />{' '}
                点
              </td>
              <td className="border border-gray-300 p-1.5 text-center" rowSpan={2}>
                <input
                  type="checkbox"
                  checked={formData.swallowingApplicable}
                  onChange={e => handleChange('swallowingApplicable', e.target.checked)}
                  className={checkCls}
                />
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-1.5">
                自記式質問票
                <br />
                (聖隷式嚥下質問紙)
              </td>
              <td className="border border-gray-300 p-1.5 text-center">Aが1項目以上</td>
              <td className="border border-gray-300 p-1.5 text-center">
                <input
                  type="text"
                  value={formData.swallowingQuestionnaireA}
                  onChange={e => handleChange('swallowingQuestionnaireA', e.target.value)}
                  className={inputCls}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* フッター */}
      <div className="flex items-center justify-between">
        <div className="text-sm">該当項目が3項目以上で「口腔機能低下症」と診断する。</div>
        <div className={`text-lg font-bold ${isOralHypofunction ? 'text-red-600' : 'text-gray-700'}`}>
          該当項目数: {applicableCount} {isOralHypofunction && '→ 口腔機能低下症'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          歯科医師名:{' '}
          <input
            type="text"
            value={formData.doctorName}
            onChange={e => handleChange('doctorName', e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-40"
          />
        </div>
        <div>
          歯科衛生士名:{' '}
          <input
            type="text"
            value={formData.hygienistName}
            onChange={e => handleChange('hygienistName', e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-40"
          />
        </div>
      </div>

      {/* 操作ボタン */}
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="secondary" onClick={onClose}>
          キャンセル
        </Button>
        <Button size="sm" variant="success" onClick={() => onSave(formData)}>
          保存
        </Button>
      </div>
    </div>
  )
}

/**
 * 診療画面
 */
export const ConsultationPage = ({
  examination,
  patient,
  staff,
  clinic,
  hasQualification,
  onBack,
  onUpdate,
  onOpenDocument,
  onShowFinalReview,
  consultationMode,
  allExaminations,
  visitDate,
}: ConsultationPageProps) => {
  // DHモード制限: DHログイン時は訪衛指と在口衛のみ操作可能（MTG 0206決定）
  const DH_ALLOWED_ITEMS = ['houeishi', 'zaikouei']
  const isDhMode = consultationMode === 'dh'
  const currentMaster = useMemo(() => getProcedureMaster(visitDate), [visitDate])
  const [drSeconds, setDrSeconds] = useState(0)
  const [dhSeconds, setDhSeconds] = useState(0)
  const [drRunning, setDrRunning] = useState(false)
  const [dhRunning, setDhRunning] = useState(false)
  const [vitalBefore, setVitalBefore] = useState<Vital>(examination.vitalBefore || INITIAL_VITAL)
  const [vitalAfter, setVitalAfter] = useState<Vital>(examination.vitalAfter || INITIAL_VITAL)
  // procedureItems: { [masterId]: { selectedSubItems: string[], isAutoSet: boolean } }
  const [procedureItems, setProcedureItems] = useState<Record<string, ProcedureItemSelection>>(examination.procedureItems || {})
  // 在歯管の実施治療選択
  const [treatmentPerformed, setTreatmentPerformed] = useState<string[]>(examination.treatmentPerformed || [])
  // 口腔機能精密検査記録用紙データ
  const [oralFunctionRecord, setOralFunctionRecord] = useState<OralFunctionRecord | null>(examination.oralFunctionRecord || null)
  // 実施記録・所見の4項目
  const [visitCondition, setVisitCondition] = useState(examination.visitCondition || '')
  const [oralFindings, setOralFindings] = useState(examination.oralFindings || '')
  const [treatment, setTreatment] = useState(examination.treatment || '')
  const [nextPlan, setNextPlan] = useState(examination.nextPlan || '')
  const [customTreatment, setCustomTreatment] = useState('')
  const [customTreatments, setCustomTreatments] = useState<string[]>([])
  // 解説テキストポップアップ
  const infoModal = useModal()
  // 口腔機能精密検査モーダル
  const oralRecordModal = useModal()
  const oralPlanModal = useModal()
  // 在歯管 対象の治療選択モーダル
  const zaishikanTreatmentModal = useModal()

  const vitalBeforeModal = useModal()
  const vitalAfterModal = useModal()

  // NST2: 過去実績がある場合に初期自動チェック
  useEffect(() => {
    const pastClaims = INITIAL_PAST_EXAMINATIONS.filter(p => p.patientId === patient.id)
    const hasNst2History = pastClaims.some(p => p.claimedItems?.includes('nst2'))
    if (hasNst2History && !procedureItems['nst2']) {
      setProcedureItems(prev => ({
        ...prev,
        nst2: {selectedSubItems: ['nst2-main'], isAutoSet: true},
      }))
    }
  }, [])

  const doctor = staff.find(s => s.id === examination.doctorId)

  // 同一日同一施設の患者数を算出
  const sameDayCount = useMemo(() => {
    const visitPlan = examination.visitPlanId
    // 同じvisitPlanに紐づく診察数 = 同一日同一施設の患者数
    return allExaminations?.filter(e => e.visitPlanId === visitPlan).length || 1
  }, [examination.visitPlanId, allExaminations])

  // 同月の施設内診療患者数（暫定: sameDayCountと同じ扱い）
  const sameMonthCount = sameDayCount

  // 操作結果が自動判定と異なる場合に確認ダイアログを表示
  // 自動判定結果がない項目（手動のみ・任意）は確認不要
  const confirmIfOverride = (masterId: string, willSelect: boolean): boolean => {
    const auto = autoJudgeResult[masterId]
    if (!auto) return true
    if (auto && !willSelect) {
      return window.confirm('自動条件判定を無視して切り替えますか？')
    }
    return true
  }

  // 実施項目のON/OFF切り替え（新構造: subItems対応）
  const handleToggleProcedure = (masterId: string) => {
    const isCurrentlySelected = !!procedureItems[masterId]
    if (!confirmIfOverride(masterId, !isCurrentlySelected)) return
    setProcedureItems(prev => {
      if (prev[masterId]) {
        const {[masterId]: _, ...rest} = prev
        return rest
      } else {
        return {...prev, [masterId]: {selectedSubItems: [], isAutoSet: false}}
      }
    })
  }

  // サブアイテムの選択変更
  const handleSelectSubItem = (masterId: string, subItemId: string, selectionMode: 'single' | 'multiple') => {
    // 変更後のsubItemsを事前計算して自動判定と比較
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
    // 変更後が自動判定と異なる場合に確認
    const auto = autoJudgeResult[masterId]
    if (auto) {
      const autoSorted = [...(auto.selectedSubItems || [])].sort().join(',')
      const newSorted = [...newSelected].sort().join(',')
      if (autoSorted !== newSorted && !window.confirm('自動条件判定を無視して切り替えますか？')) return
    }
    setProcedureItems(prev => ({...prev, [masterId]: {...current, selectedSubItems: newSelected, isAutoSet: false}}))
  }

  // 合計点数の計算（subItems構造対応）
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

  // 選択された項目の点数を取得
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

  // evaluate関数用コンテキスト構築
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
      pastClaims: INITIAL_PAST_EXAMINATIONS.filter(p => p.patientId === patient.id),
      currentMonth: '2026-01',
      oralFunctionRecord,
      currentItems: procedureItems,
      treatmentPerformed,
    }),
    [
      drSeconds,
      dhSeconds,
      sameDayCount,
      sameMonthCount,
      examination,
      clinic,
      patient,
      oralFunctionRecord,
      procedureItems,
      treatmentPerformed,
    ]
  )

  // 自動判定結果をリアルタイム計算
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

  // 全項目自動判定
  const handleAutoSetAll = () => {
    setProcedureItems(prev => ({...prev, ...autoJudgeResult}))
  }

  // 手動上書きかどうか判定（警告表示用）
  // 自動判定結果がない項目（手動のみ・任意）は警告不要
  const isManualOverride = (masterId: string) => {
    const auto = autoJudgeResult[masterId]
    if (!auto) return false
    const current = procedureItems[masterId]
    if (!current) return true
    const autoSorted = [...(auto.selectedSubItems || [])].sort().join(',')
    const currentSorted = [...(current.selectedSubItems || [])].sort().join(',')
    return autoSorted !== currentSorted
  }

  // 警告マークのtitleテキストを取得
  const getOverrideTitle = (masterId: string) => {
    const auto = autoJudgeResult[masterId]
    const current = procedureItems[masterId]
    if (auto && !current) return '自動条件判定では選択されます'
    return '自動条件判定と異なる区分が選択されています'
  }

  const handleAddCustomTreatment = () => {
    if (!customTreatment.trim()) return
    setCustomTreatments(prev => [...prev, customTreatment.trim()])
    setCustomTreatment('')
  }

  const handleRemoveCustomTreatment = (index: number) => {
    setCustomTreatments(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    onUpdate(examination.id, {
      vitalBefore,
      vitalAfter,
      procedureItems,
      treatmentPerformed,
      oralFunctionRecord,
      visitCondition,
      oralFindings,
      treatment,
      nextPlan,
      status: EXAMINATION_STATUS.DONE,
    })
    onBack()
  }

  const is20MinOver = drSeconds >= 1200 || dhSeconds >= 1200

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 rounded"
            aria-label="戻る"
          >
            <IconChevronLeft />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="primary">{patient.building}</Badge>
              <span className="text-xs text-gray-600">
                {patient.floor}-{patient.room}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{getPatientName(patient)} 様</h2>
          </div>
        </div>
        <div className="text-right text-sm">
          <div className="text-gray-500">
            担当: <span className="font-medium text-gray-900">{doctor?.name || '-'}</span>
          </div>
          <div className="text-gray-500">
            モード:{' '}
            <span className={`font-medium ${isDhMode ? 'text-amber-600' : 'text-slate-700'}`}>
              {isDhMode ? '歯科衛生士（DH）' : '歯科医師'}
            </span>
          </div>
        </div>
      </div>

      {/* タイマーセクション */}
      <Card className="mb-4 p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Badge variant={drRunning ? 'success' : 'default'}>DR</Badge>
            <span className={`text-2xl font-mono ${is20MinOver ? 'text-red-600' : 'text-gray-900'}`}>
              {formatDuration(drSeconds)}
            </span>
            <Button size="sm" variant={drRunning ? 'danger' : 'success'} onClick={() => setDrRunning(!drRunning)}>
              {drRunning ? '終了' : '開始'}
            </Button>
            {drRunning && drSeconds > 0 && <span className="text-xs text-gray-500">計測中 {formatTime(new Date())}</span>}
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={dhRunning ? 'success' : 'default'}>DH</Badge>
            <span className={`text-2xl font-mono ${is20MinOver ? 'text-red-600' : 'text-gray-900'}`}>
              {formatDuration(dhSeconds)}
            </span>
            <Button size="sm" variant={dhRunning ? 'danger' : 'success'} onClick={() => setDhRunning(!dhRunning)}>
              {dhRunning ? '終了' : '開始'}
            </Button>
          </div>
        </div>
        {is20MinOver && (
          <div className="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            ⚠ 20分を超過しています
          </div>
        )}
      </Card>

      {/* バイタル測定 */}
      <Card className="mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          <span className="text-red-500">♥</span>
          <span className="text-sm font-medium text-gray-700">バイタル測定</span>
        </div>
        <div className="p-4 grid grid-cols-2 gap-4">
          <VitalDisplay vital={vitalBefore} label="処置前" onEdit={() => vitalBeforeModal.handleOpen()} />
          <VitalDisplay vital={vitalAfter} label="処置後" onEdit={() => vitalAfterModal.handleOpen()} />
        </div>
      </Card>

      {/* バイタル入力モーダル */}
      <vitalBeforeModal.Modal title="処置前バイタル入力">
        <VitalForm
          vital={vitalBefore}
          type="before"
          onSubmit={data => {
            setVitalBefore(data)
            vitalBeforeModal.handleClose()
          }}
          onClose={vitalBeforeModal.handleClose}
        />
      </vitalBeforeModal.Modal>

      <vitalAfterModal.Modal title="処置後バイタル入力">
        <VitalForm
          vital={vitalAfter}
          type="after"
          onSubmit={data => {
            setVitalAfter(data)
            vitalAfterModal.handleClose()
          }}
          onClose={vitalAfterModal.handleClose}
        />
      </vitalAfterModal.Modal>

      {/* 実施記録・所見 */}
      <Card className="mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          <span className="text-slate-600">📋</span>
          <span className="text-sm font-medium text-gray-700">実施記録・所見</span>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <div className="text-xs text-gray-600 mb-1">1. 訪問時の様子</div>
            <TextArea value={visitCondition} onChange={setVisitCondition} placeholder="例: ベッド上臥位、覚醒良好..." rows={2} />
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">2. 口腔内所見</div>
            <TextArea value={oralFindings} onChange={setOralFindings} placeholder="例: 右下残根部発赤あり、PCR 40%..." rows={2} />
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">3. 処置</div>
            <TextArea value={treatment} onChange={setTreatment} placeholder="例: 義歯調整、口腔ケア、TBI..." rows={2} />
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">4. 次回予定</div>
            <TextArea value={nextPlan} onChange={setNextPlan} placeholder="例: 1週間後、義歯経過観察..." rows={2} />
          </div>
        </div>
      </Card>

      {/* DHモード注意バナー */}
      {isDhMode && (
        <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-300 rounded-lg flex items-center gap-2">
          <span className="text-amber-600 text-lg">⚠</span>
          <div>
            <div className="text-sm font-medium text-amber-800">DHモードで操作中</div>
            <div className="text-xs text-amber-600">操作可能な項目: 訪衛指・在口衛のみ</div>
          </div>
        </div>
      )}

      {/* 口腔機能精密検査 */}
      <R_Stack className="mb-2">
        <span className="text-sm font-medium text-gray-700">口腔機能精密検査</span>
        <Button size="sm" variant="outline" onClick={() => oralPlanModal.handleOpen()}>
          計画書を入力
        </Button>
        <Button size="sm" variant="outline" onClick={() => oralRecordModal.handleOpen()}>
          記録用紙を入力
        </Button>
        {oralFunctionRecord && (
          <Badge variant="success">
            記録済（該当{countApplicableItems(oralFunctionRecord)}項目）
          </Badge>
        )}
      </R_Stack>

      {/* 実施項目の選択（加算） - subItems対応 */}
      <Card className="mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span className="text-sm font-medium text-gray-700">実施項目の選択（加算）</span>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="outline" onClick={handleAutoSetAll}>
              全項目自動判定
            </Button>
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
                  {/* ON/OFFトグル + 項目名 + インフォマーク + 警告 */}
                  <div
                    className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                      isSelected ? 'bg-slate-50 border-slate-300' : 'bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => handleToggleProcedure(master.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-6 rounded-full relative transition-colors ${
                          isSelected ? 'bg-emerald-500' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            isSelected ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </div>
                      <span className={`font-medium ${isSelected ? 'text-slate-800' : 'text-gray-700'}`}>{master.name}</span>
                      {hasOverride && (
                        <span className="text-amber-500 text-sm" title={getOverrideTitle(master.id)}>
                          ⚠
                        </span>
                      )}
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          infoModal.handleOpen({name: master.fullName, text: master.infoText || ''})
                        }}
                        className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-slate-300 hover:text-slate-700 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                        aria-label={`${master.name}の解説を表示`}
                      >
                        i
                      </button>
                    </div>
                    {isSelected && points > 0 && (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">+{points}点</span>
                    )}
                  </div>

                  {/* 選択時: subItems表示 */}
                  {isSelected && master.subItems?.length > 0 && (
                    <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-3">
                      <div className="text-xs text-gray-600 mb-2">該当区分</div>
                      <div className="flex flex-wrap gap-2">
                        {master.subItems.map(sub => {
                          const isSubSelected = (itemData?.selectedSubItems || []).includes(sub.id)
                          const inputType = master.selectionMode === 'single' ? 'radio' : 'checkbox'
                          return (
                            <label
                              key={sub.id}
                              className={`flex items-center gap-2 px-3 py-2 border rounded cursor-pointer transition-colors ${
                                isSubSelected
                                  ? 'border-emerald-500 bg-emerald-50'
                                  : 'border-gray-300 bg-white hover:border-gray-400'
                              }`}
                            >
                              <input
                                type={inputType}
                                name={`sub-${master.id}`}
                                checked={isSubSelected}
                                onChange={() => handleSelectSubItem(master.id, sub.id, master.selectionMode)}
                                className="w-4 h-4 text-emerald-600 accent-emerald-600"
                              />
                              <span className="text-sm">{sub.name}</span>
                              <span className="text-xs text-gray-500">({sub.points}点)</span>
                              {sub.isManualOnly && (
                                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded">
                                  手動
                                </span>
                              )}
                            </label>
                          )
                        })}
                      </div>
                      {/* 在歯管の場合: 対象の治療ボタン */}
                      {master.id === 'zaishikan' && (() => {
                        const zaishikanHighlight = clinic.qualifications.zahoshin && Object.values(patient.diseases || {}).some(v => v)
                        return (
                          <div className="mt-2">
                            <Button
                              size="sm"
                              variant={zaishikanHighlight ? 'primary' : 'outline'}
                              onClick={() => {
                                zaishikanTreatmentModal.handleOpen()
                              }}
                            >
                              対象の治療を選択 {treatmentPerformed.length > 0 && `(${treatmentPerformed.length}件選択中)`}
                            </Button>
                          </div>
                        )
                      })()}
                    </div>
                  )}

                  {/* 項目ごとの注意書き・補足メッセージ（大カテゴリOFF時も表示） */}
                  {/* 訪衛指: DH時間20分未満の場合に警告 */}
                  {master.id === 'houeishi' && dhSeconds < 1200 && (
                    <div className="mx-3 mb-3 mt-1 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700">
                      ⚠ DH時間が20分未満です。在口衛の算定を検討してください。
                    </div>
                  )}
                  {/* 口腔機能検査: 3か月経過メッセージ */}
                  {master.id === 'koukuu_kensa' && (() => {
                    const pastClaims = INITIAL_PAST_EXAMINATIONS.filter(p => p.patientId === patient.id)
                    const messages = master.subItems.map(sub => {
                      const lastClaim = pastClaims
                        .filter(p => p.claimedItems.includes(sub.id))
                        .sort((a, b) => b.month.localeCompare(a.month))[0]
                      if (!lastClaim) {
                        return <div key={sub.id} className="text-xs text-blue-600">📋 {sub.name}: 過去実績なし — 今月算定できます</div>
                      }
                      const lastDate = new Date(lastClaim.month + '-01')
                      const now = new Date()
                      const monthsElapsed = (now.getFullYear() - lastDate.getFullYear()) * 12 + (now.getMonth() - lastDate.getMonth())
                      if (monthsElapsed >= 3) {
                        return <div key={sub.id} className="text-xs text-blue-600">📋 今月{sub.name}が算定できます（前回: {lastClaim.month}）</div>
                      }
                      return null
                    }).filter(Boolean)
                    if (messages.length === 0) return null
                    return <div className="mx-3 mb-3 mt-1 space-y-1">{messages}</div>
                  })()}
                  {/* 歯リハ3: 月2回上限メッセージ */}
                  {master.id === 'shiriha3' && (() => {
                    const now = new Date()
                    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
                    const shiriha3Count = INITIAL_PAST_EXAMINATIONS
                      .filter(p => p.patientId === patient.id && p.month === currentMonth)
                      .reduce((count, p) => count + p.claimedItems.filter(item => item === 'shiriha3').length, 0)
                    return (
                      <div className="mx-3 mb-3 mt-1 text-xs text-blue-600">
                        {shiriha3Count === 0 && '📋 1/2回目 算定しますか？'}
                        {shiriha3Count === 1 && '📋 2/2回目 算定しますか？'}
                        {shiriha3Count >= 2 && <span className="text-amber-700">⚠ 今月の算定上限（2回）に達しています</span>}
                      </div>
                    )
                  })()}
                </div>
              )
            }
          )}
        </div>
      </Card>

      {/* 提供文書セクション */}
      <DocumentSection
        procedureItems={procedureItems}
        dhSeconds={dhSeconds}
        onOpenDocument={docType => {
          if (typeof onOpenDocument === 'function') {
            onOpenDocument(docType, {patient, clinic, examination, dhSeconds, visitCondition, oralFindings, treatment, nextPlan})
          }
        }}
      />

      {/* 解説テキストポップアップ */}
      <infoModal.Modal title={infoModal.open?.name || '解説'}>
        <p className="text-sm text-gray-700 leading-relaxed">{infoModal.open?.text}</p>
        <div className="flex justify-end mt-4">
          <Button size="sm" variant="secondary" onClick={infoModal.handleClose}>
            閉じる
          </Button>
        </div>
      </infoModal.Modal>

      {/* 計画書モーダル */}
      <oralPlanModal.Modal title="口腔機能精密検査 計画書">
        <div className="p-4 text-center text-gray-500">
          <p className="text-lg font-medium mb-2">計画書機能未実装</p>
          <p className="text-sm">今後のバージョンアップで実装予定です。</p>
        </div>
        <div className="flex justify-end mt-4">
          <Button size="sm" variant="secondary" onClick={oralPlanModal.handleClose}>
            閉じる
          </Button>
        </div>
      </oralPlanModal.Modal>

      {/* 記録用紙モーダル */}
      <oralRecordModal.Modal title="口腔機能精密検査 記録用紙">
        <OralFunctionRecordForm
          patient={patient}
          initialData={oralFunctionRecord}
          onSave={data => {
            setOralFunctionRecord(data)
            oralRecordModal.handleClose()
          }}
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
                        if (e.target.checked) {
                          setTreatmentPerformed(prev => [...prev, item])
                        } else {
                          setTreatmentPerformed(prev => prev.filter(t => t !== item))
                        }
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
          <Button size="sm" variant="secondary" onClick={zaishikanTreatmentModal.handleClose}>
            閉じる
          </Button>
        </div>
      </zaishikanTreatmentModal.Modal>

      {/* 保存ボタン */}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onBack}>
          キャンセル
        </Button>
        <Button variant="success" onClick={handleSave}>
          診察完了・保存
        </Button>
      </div>
    </div>
  )
}

/**
 * 提供文書セクションコンポーネント
 */
export const DocumentSection = ({procedureItems, dhSeconds, onOpenDocument}: DocumentSectionProps) => {
  const docRequirements = calculateDocumentRequirements({procedureItems, dhSeconds})

  return (
    <Card className="mb-4">
      <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
        <span className="text-blue-500">📄</span>
        <span className="text-sm font-medium text-gray-700">提供文書</span>
      </div>
      <div className="p-4">
        <div className="flex flex-wrap gap-3">
          {Object.entries(docRequirements).map(([docId, doc]) => {
            const isRequired = doc.required
            return (
              <button
                key={docId}
                onClick={() => onOpenDocument(docId)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500 ${
                  isRequired
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    : 'border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                {isRequired && <span className="text-emerald-600">★</span>}
                <span className="font-medium">{doc.name}</span>
              </button>
            )
          })}
        </div>
        <div className="mt-3 text-xs text-gray-500 space-y-1">
          {Object.entries(docRequirements).map(([docId, doc]) => (
            <div key={docId} className={doc.required ? 'text-emerald-600' : ''}>
              • {doc.name}: {doc.reason}
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
