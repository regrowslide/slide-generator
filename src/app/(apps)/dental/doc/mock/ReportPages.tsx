import { useState, useMemo } from 'react'

import {
  EXAMINATION_STATUS,
  PATIENT_DISEASES,
  DEFAULT_ASSESSMENT,
  ASSESSMENT_OPTIONS,
  STAFF_ROLES,
  getProcedureMaster,
  getScoringSections,
  findMasterById,
} from './constants'
import { formatDate, formatTime, formatDuration, getPatientName, getPatientNameKana } from './helpers'
import { Button, Card, Badge, Input, Select, EmptyState } from './ui-components'
import type {
  Patient,
  Facility,
  Staff,
  VisitPlan,
  Examination,
  Clinic,
  ScoringHistoryItem,
  SavedDocument,
  Assessment,
  PatientDiseases,
} from './types'

// =============================================================================
// Props型定義
// =============================================================================

type DashboardPageProps = {
  onNavigate: (page: string) => void
  visitPlans: VisitPlan[]
  examinations: Examination[]
}

type PatientEditPageProps = {
  patient: Patient
  onSave: (patient: Patient) => void
  onBack: () => void
}

type PatientDetailPageProps = {
  patient: Patient
  facility: Facility | undefined
  examinations: Examination[]
  scoringHistory: ScoringHistoryItem[]
  documents: SavedDocument[]
  onBack: () => void
  onEdit?: () => void
}

type IndividualInputPageProps = {
  facilities: Facility[]
  patients: Patient[]
  staff: Staff[]
  onStartConsultation: (params: { patientId: number; facilityId: number; doctorId: number | null; hygienistId: number | null }) => void
}

type FinalReviewPageProps = {
  examination: Examination
  patient: Patient
  facility: Facility | undefined
  staff: Staff[]
  clinic: Clinic
  onBack: () => void
  onBackToSchedule: () => void
  visitDate?: string
}


// =============================================================================
// ヘルパー関数
// =============================================================================

/**
 * 診察の合計点数を計算するヘルパー関数
 */
const calculateExamPoints = (exam: Examination, visitDate?: string): number => {
  if (!exam.procedureItems) return 0
  const master = getProcedureMaster(visitDate || '')
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

// =============================================================================
// DashboardPage
// =============================================================================

export const DashboardPage = ({ onNavigate, visitPlans, examinations }: DashboardPageProps) => {
  const today = formatDate(new Date(2026, 0, 18))
  const todayPlans = visitPlans.filter(p => p.visitDate === today)
  const completedExams = examinations.filter(e => e.status === EXAMINATION_STATUS.DONE)

  const cards = [
    {
      id: 'schedule',
      icon: '📅',
      title: 'Schedule / Visits',
      sub: '訪問計画スケジュール',
      desc: '月間カレンダーで訪問計画を管理',
      stat: `本日の予定: ${todayPlans.length}件`,
    },
    {
      id: 'admin-patients',
      icon: '👥',
      title: 'Patient Master',
      sub: '利用者マスタ',
      desc: '利用者の検索・登録・編集・削除を行います',
    },
    { id: 'individual-input', icon: '✏️', title: 'Individual Input', sub: '個別入力', desc: '個人を選択して直接入力する場合' },
    {
      id: 'admin-clinic',
      icon: '⚙️',
      title: 'Master Data Management',
      sub: 'マスタデータ管理',
      desc: 'クリニック設定、施設、スタッフ、テンプレートの管理',
    },
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">ダッシュボード</h2>
        <p className="text-sm text-gray-500 mt-1">訪問歯科診療サポートアプリ</p>
      </div>

      {/* 統計サマリー */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="p-4">
          <div className="text-xs text-gray-500">本日の訪問予定</div>
          <div className="text-2xl font-bold text-slate-700">{todayPlans.length} 件</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-gray-500">診察完了</div>
          <div className="text-2xl font-bold text-emerald-600">{completedExams.length} 名</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-gray-500">今日の日付</div>
          <div className="text-lg font-bold text-slate-700">2026/01/18</div>
        </Card>
      </div>

      {/* メインナビゲーションカード */}
      <div className="grid grid-cols-2 gap-6 max-w-3xl">
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => onNavigate(card.id)}
            className="text-left p-6 rounded-lg border-2 border-gray-200 bg-white hover:border-slate-400 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
          >
            <div className="text-3xl mb-3">{card.icon}</div>
            <div className="text-base font-bold text-gray-900">{card.title}</div>
            <div className="text-sm font-medium text-slate-600 mt-0.5">{card.sub}</div>
            <div className="text-xs text-gray-500 mt-2">{card.desc}</div>
            {card.stat && <div className="text-xs text-emerald-600 font-medium mt-2">{card.stat}</div>}
          </button>
        ))}
      </div>
    </div>
  )
}

// =============================================================================
// PatientEditPage - 患者情報入力・編集画面
// =============================================================================

export const PatientEditPage = ({ patient, onSave, onBack }: PatientEditPageProps) => {
  const [form, setForm] = useState({
    lastName: patient.lastName,
    firstName: patient.firstName,
    lastNameKana: patient.lastNameKana,
    firstNameKana: patient.firstNameKana,
    birthDate: patient.birthDate,
    gender: patient.gender,
    careLevel: patient.careLevel || '',
    diseases: { ...patient.diseases },
    assessment: { ...DEFAULT_ASSESSMENT, ...patient.assessment },
    notes: patient.notes || '',
  })

  const calcAge = (birthDate: string) => {
    if (!birthDate) return ''
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
  }

  const calcBmi = (h: string, w: string) => {
    const hm = parseFloat(h) / 100
    const wk = parseFloat(w)
    if (!hm || !wk || hm <= 0) return ''
    return (wk / (hm * hm)).toFixed(1)
  }

  const updateField = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }))
  const updateDisease = (id: string, val: boolean) => setForm(p => ({ ...p, diseases: { ...p.diseases, [id]: val } }))
  const updateAssessment = (field: string, value: string | boolean) => {
    setForm(p => {
      const newA = { ...p.assessment, [field]: value }
      if (field === 'height' || field === 'weight') {
        newA.bmi = calcBmi(field === 'height' ? (value as string) : newA.height, field === 'weight' ? (value as string) : newA.weight)
      }
      return { ...p, assessment: newA }
    })
  }
  // お薬手帳の画像保存（MTG 0206決定: テキスト入力→画像保存に変更）
  const addMedicationImage = () => {
    // モック: ダミー画像URLを追加
    const dummyUrl = `/dental/mock-images/medication_${Date.now()}.jpg`
    setForm(p => ({
      ...p,
      assessment: {
        ...p.assessment,
        medicationImages: [...(p.assessment.medicationImages || []), { url: dummyUrl, addedAt: new Date().toISOString() }],
      },
    }))
  }
  const removeMedicationImage = (idx: number) => {
    setForm(p => ({
      ...p,
      assessment: {
        ...p.assessment,
        medicationImages: (p.assessment.medicationImages || []).filter((_: { url: string; addedAt: string }, i: number) => i !== idx),
      },
    }))
  }

  const handleSave = () => {
    if (!form.lastNameKana || !form.firstNameKana) return
    onSave({
      ...patient,
      lastName: form.lastName,
      firstName: form.firstName,
      lastNameKana: form.lastNameKana,
      firstNameKana: form.firstNameKana,
      birthDate: form.birthDate,
      gender: form.gender,
      age: calcAge(form.birthDate) as number,
      careLevel: form.careLevel,
      diseases: form.diseases as PatientDiseases,
      assessment: form.assessment as Assessment,
      notes: form.notes,
    })
  }

  // ラジオボタングループ
  const RadioGroup = ({ label, options, value, onChange, code }: { label: string; options: string[]; value: string; onChange: (v: string) => void; code?: string }) => (
    <div className="mb-3">
      <div className="text-sm font-medium text-gray-700 mb-1">
        {label}
        {code && <span className="text-xs text-gray-400 ml-1">({code})</span>}:
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {options.map(opt => (
          <label key={opt} className="flex items-center gap-1 cursor-pointer text-sm">
            <input type="radio" name={label} checked={value === opt} onChange={() => onChange(opt)} className="w-3.5 h-3.5" />
            {opt}
          </label>
        ))}
      </div>
    </div>
  )

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="text-blue-600 text-sm">
            ← 戻る
          </button>
          <h2 className="text-xl font-bold text-gray-900">患者情報入力</h2>
        </div>
        <Button onClick={handleSave}>保存</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 左パネル: 患者情報入力 */}
        <div>
          <Card className="mb-4">
            <div className="p-3 border-b border-gray-200 bg-blue-600">
              <span className="text-sm font-medium text-white">患者情報入力</span>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <Input label="患者ID" value={String(patient.id)} onChange={() => { }} disabled />
                <Input label="姓" value={form.lastName} onChange={(v: string) => updateField('lastName', v)} required />
                <Input label="名" value={form.firstName} onChange={(v: string) => updateField('firstName', v)} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="セイ（必須）" value={form.lastNameKana} onChange={(v: string) => updateField('lastNameKana', v)} required />
                <Input label="メイ（必須）" value={form.firstNameKana} onChange={(v: string) => updateField('firstNameKana', v)} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="生年月日" value={form.birthDate} onChange={(v: string) => updateField('birthDate', v)} type="date" />
                <div>
                  <label className="block text-xs text-gray-600 mb-1">年齢</label>
                  <div className="px-3 py-2 bg-gray-100 rounded text-sm">
                    {calcAge(form.birthDate)}歳 <span className="text-xs text-gray-400">月日から自動算出</span>
                  </div>
                </div>
              </div>

              {/* 基礎疾患 */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2 border-b pb-1">基礎疾患</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {PATIENT_DISEASES.map(d => (
                    <label key={d.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!(form.diseases as Record<string, boolean>)[d.id]}
                        onChange={() => updateDisease(d.id, !(form.diseases as Record<string, boolean>)[d.id])}
                        className="w-3.5 h-3.5"
                      />
                      {d.name}
                    </label>
                  ))}
                </div>
              </div>

              {/* お薬情報（お薬手帳画像の保存） */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2 border-b pb-1">お薬情報</div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(form.assessment.medicationImages || []).map((img: { url: string; addedAt: string }, i: number) => (
                    <div
                      key={i}
                      className="relative w-20 h-20 border border-gray-300 rounded bg-gray-100 flex items-center justify-center group"
                    >
                      <span className="text-2xl">💊</span>
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-[10px] text-center py-0.5 rounded-b">
                        {i + 1}枚目
                      </div>
                      <button
                        onClick={() => removeMedicationImage(i)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addMedicationImage}
                  className="px-3 py-1.5 border border-dashed border-gray-400 rounded text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-1"
                >
                  📷 お薬手帳の画像を追加
                </button>
                <p className="text-xs text-gray-400 mt-1">※ お薬手帳の写真を撮影・アップロードして保存できます</p>
              </div>

              {/* 加算チェック */}
              <div className="space-y-2 pt-2 border-t">
                <div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!form.assessment.hasInfoShareFee}
                      onChange={() => updateAssessment('hasInfoShareFee', !form.assessment.hasInfoShareFee)}
                      className="w-3.5 h-3.5"
                    />
                    診療情報等連携共有料（情共1）
                  </label>
                  {form.assessment.hasInfoShareFee && (
                    <div className="ml-6 mt-1 flex items-center gap-2">
                      <span className="text-xs text-gray-500">最終取得日:</span>
                      <input
                        type="date"
                        value={form.assessment.infoShareFeeLastDate || ''}
                        onChange={e => updateAssessment('infoShareFeeLastDate', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!form.assessment.hasComprehensiveManagement}
                      onChange={() => updateAssessment('hasComprehensiveManagement', !form.assessment.hasComprehensiveManagement)}
                      className="w-3.5 h-3.5"
                    />
                    総合医療管理加算（総医）
                  </label>
                  {form.assessment.hasComprehensiveManagement && (
                    <div className="ml-6 mt-1 flex items-center gap-2">
                      <span className="text-xs text-gray-500">最終取得日:</span>
                      <input
                        type="date"
                        value={form.assessment.comprehensiveManagementLastDate || ''}
                        onChange={e => updateAssessment('comprehensiveManagementLastDate', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 右パネル: 患者状態・アセスメント */}
        <div>
          <Card>
            <div className="p-3 border-b border-gray-200 bg-blue-600">
              <span className="text-sm font-medium text-white">← 患者状態・アセスメント</span>
            </div>
            <div className="p-4">
              {/* 基本情報 */}
              <div className="text-sm font-bold text-gray-900 mb-2 border-b pb-1">基本情報</div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="text-xs text-gray-500">身長</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={form.assessment.height}
                      onChange={e => updateAssessment('height', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                    <span className="text-sm">cm</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">体重</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={form.assessment.weight}
                      onChange={e => updateAssessment('weight', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                    <span className="text-sm">Kg</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">BMI</label>
                  <div className="px-2 py-1 bg-gray-100 rounded text-sm">{form.assessment.bmi || '—'}</div>
                </div>
              </div>

              {/* 誤嚥性肺炎の既往 */}
              <div className="mb-3">
                <div className="text-sm font-medium text-gray-700 mb-1">誤嚥性肺炎の既往:</div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  {['無し', 'あり'].map(opt => (
                    <label key={opt} className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="aspirationPneumonia"
                        checked={form.assessment.aspirationPneumoniaHistory === opt}
                        onChange={() => updateAssessment('aspirationPneumoniaHistory', opt)}
                        className="w-3.5 h-3.5"
                      />
                      {opt}
                    </label>
                  ))}
                  {form.assessment.aspirationPneumoniaHistory === 'あり' && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      いつ頃:{' '}
                      <input
                        type="date"
                        value={form.assessment.aspirationPneumoniaDate || ''}
                        onChange={e => updateAssessment('aspirationPneumoniaDate', e.target.value)}
                        className="border border-gray-300 rounded px-1 py-0.5 text-xs"
                      />
                    </span>
                  )}
                </div>
                <label className="flex items-center gap-1 text-sm mt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!form.assessment.aspirationPneumoniaRepeat}
                    onChange={() => updateAssessment('aspirationPneumoniaRepeat', !form.assessment.aspirationPneumoniaRepeat)}
                    className="w-3.5 h-3.5"
                  />
                  繰り返しあり
                  {form.assessment.aspirationPneumoniaRepeat && (
                    <span className="text-xs text-gray-500 flex items-center gap-1 ml-2">
                      最近:{' '}
                      <input
                        type="date"
                        value={form.assessment.aspirationPneumoniaRepeatDate || ''}
                        onChange={e => updateAssessment('aspirationPneumoniaRepeatDate', e.target.value)}
                        className="border border-gray-300 rounded px-1 py-0.5 text-xs"
                      />
                    </span>
                  )}
                </label>
              </div>

              {/* 身体・口腔状況 */}
              <div className="text-sm font-bold text-gray-900 mb-2 border-b pb-1">身体・口腔状況</div>
              <RadioGroup
                label="座位保持"
                code="JZ3-1"
                options={ASSESSMENT_OPTIONS.seatRetention}
                value={form.assessment.seatRetention}
                onChange={v => updateAssessment('seatRetention', v)}
              />
              <RadioGroup
                label="口腔清掃の状況"
                options={ASSESSMENT_OPTIONS.oralCleaning}
                value={form.assessment.oralCleaning}
                onChange={v => updateAssessment('oralCleaning', v)}
              />
              <RadioGroup
                label="お口の中の水分保持"
                options={ASSESSMENT_OPTIONS.moistureRetention}
                value={form.assessment.moistureRetention}
                onChange={v => updateAssessment('moistureRetention', v)}
              />
              <RadioGroup
                label="うがい"
                options={ASSESSMENT_OPTIONS.gargling}
                value={form.assessment.gargling}
                onChange={v => updateAssessment('gargling', v)}
              />

              {/* リスク・摂取 */}
              <div className="text-sm font-bold text-gray-900 mb-2 border-b pb-1 mt-4">リスク・摂取</div>
              <RadioGroup
                label="低栄養リスク"
                options={ASSESSMENT_OPTIONS.malnutritionRisk}
                value={form.assessment.malnutritionRisk}
                onChange={v => updateAssessment('malnutritionRisk', v)}
              />
              <RadioGroup
                label="むせ"
                options={ASSESSMENT_OPTIONS.choking}
                value={form.assessment.choking}
                onChange={v => updateAssessment('choking', v)}
              />
              <RadioGroup
                label="経口摂取の有無"
                options={ASSESSMENT_OPTIONS.oralIntake}
                value={form.assessment.oralIntake}
                onChange={v => updateAssessment('oralIntake', v)}
              />

              {/* 栄養・水分 */}
              <div className="text-sm font-bold text-gray-900 mb-2 border-b pb-1 mt-4">栄養・水分</div>
              <RadioGroup
                label="人工栄養法"
                options={ASSESSMENT_OPTIONS.artificialNutrition}
                value={form.assessment.artificialNutrition}
                onChange={v => updateAssessment('artificialNutrition', v)}
              />
              <RadioGroup
                label="水分"
                options={ASSESSMENT_OPTIONS.moisture}
                value={form.assessment.moisture}
                onChange={v => updateAssessment('moisture', v)}
              />

              {/* 食事・服薬 */}
              <div className="text-sm font-bold text-gray-900 mb-2 border-b pb-1 mt-4">食事・服薬</div>
              <div className="text-xs text-gray-500 mb-1">食形態</div>
              <RadioGroup
                label="主食"
                code="JZ12-1/JZ12-2/JZ12-3"
                options={ASSESSMENT_OPTIONS.mainDish}
                value={form.assessment.mainDish}
                onChange={v => updateAssessment('mainDish', v)}
              />
              <RadioGroup
                label="おかず"
                code="JZ12-4/JZ12-5"
                options={ASSESSMENT_OPTIONS.sideDish}
                value={form.assessment.sideDish}
                onChange={v => updateAssessment('sideDish', v)}
              />
              <RadioGroup
                label="飲み込み"
                options={ASSESSMENT_OPTIONS.swallowing}
                value={form.assessment.swallowing}
                onChange={v => updateAssessment('swallowing', v)}
              />
              <RadioGroup
                label="薬の服用(カプセル・錠剤)"
                options={ASSESSMENT_OPTIONS.medicationSwallowing}
                value={form.assessment.medicationSwallowing}
                onChange={v => updateAssessment('medicationSwallowing', v)}
              />
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button onClick={handleSave}>保存</Button>
      </div>
    </div>
  )
}

// =============================================================================
// PatientDetailPage - 個人情報の詳細（患者プロフィール）画面
// =============================================================================

export const PatientDetailPage = ({ patient, facility, examinations, scoringHistory, documents, onBack, onEdit }: PatientDetailPageProps) => {
  if (!patient) return null

  const patientExams = examinations.filter(e => e.patientId === patient.id)
  const patientHistory = scoringHistory.filter(h => h.patientId === patient.id)
  const patientDocs = documents.filter(d => d.patientId === patient.id)
  const activeDiseases = PATIENT_DISEASES.filter(d => patient.diseases?.[d.id as keyof PatientDiseases])

  // 元ファイルではスコープ外のcurrentMasterを参照していたため、ローカルで取得
  const currentMaster = getProcedureMaster(formatDate(new Date()))

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
          ← 患者管理に戻る
        </button>
        {onEdit && <Button onClick={onEdit}>✏️ 編集</Button>}
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">患者認識・アセスメント</h2>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* 基本情報 */}
        <Card>
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <span className="text-sm font-medium text-gray-700">基本情報</span>
          </div>
          <div className="p-4 space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-500">氏名:</span> <span className="font-medium">{getPatientName(patient)}</span>
              </div>
              <div>
                <span className="text-gray-500">カナ:</span> {getPatientNameKana(patient)}
              </div>
              <div>
                <span className="text-gray-500">性別:</span>{' '}
                {patient.gender === 'male' ? '男性' : patient.gender === 'female' ? '女性' : '-'}
              </div>
              <div>
                <span className="text-gray-500">年齢:</span> {patient.age || '-'}歳
              </div>
              <div>
                <span className="text-gray-500">生年月日:</span> {patient.birthDate || '-'}
              </div>
              <div>
                <span className="text-gray-500">介護度:</span> {patient.careLevel || '-'}
              </div>
            </div>
          </div>
        </Card>

        {/* 訪問先情報 */}
        <Card>
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <span className="text-sm font-medium text-gray-700">訪問先情報</span>
          </div>
          <div className="p-4 space-y-2 text-sm">
            <div>
              <span className="text-gray-500">施設:</span> <span className="font-medium">{facility?.name || '-'}</span>
            </div>
            <div>
              <span className="text-gray-500">居室:</span> {patient.building} {patient.floor} {patient.room}号室
            </div>
            <div>
              <span className="text-gray-500">申し送り:</span> <span className="text-amber-700">{patient.notes || 'なし'}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 既往歴・疾患 */}
      <Card className="mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">既往歴・疾患</span>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-2">
            {PATIENT_DISEASES.map(d => (
              <span
                key={d.id}
                className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${patient.diseases?.[d.id as keyof PatientDiseases] ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-400'
                  }`}
              >
                {patient.diseases?.[d.id as keyof PatientDiseases] ? '☑' : '☐'} {d.name}
              </span>
            ))}
          </div>
          {activeDiseases.length === 0 && <p className="text-sm text-gray-400 mt-2">登録されている疾患はありません</p>}
        </div>
      </Card>

      {/* 口腔状態 */}
      <Card className="mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">口腔状態</span>
        </div>
        <div className="p-4 flex gap-6 text-sm">
          <div>
            <span className="text-gray-500">残存歯数:</span>{' '}
            <span className="font-bold text-lg">{patient.teethCount ?? '-'}</span>本
          </div>
          <div>
            <span className="text-gray-500">義歯:</span>{' '}
            <Badge variant={patient.hasDenture ? 'info' : 'default'}>{patient.hasDenture ? 'あり' : 'なし'}</Badge>
          </div>
          <div>
            <span className="text-gray-500">口腔機能低下:</span>{' '}
            <Badge variant={patient.hasOralHypofunction ? 'warning' : 'default'}>
              {patient.hasOralHypofunction ? 'あり' : 'なし'}
            </Badge>
          </div>
        </div>
      </Card>

      {/* 算定履歴 */}
      <Card className="mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">算定履歴</span>
        </div>
        {patientHistory.length === 0 ? (
          <EmptyState message="算定履歴はありません" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">算定項目</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">最終算定日</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">点数</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {patientHistory.map(h => {
                  const proc = findMasterById(currentMaster, h.procedureId)
                  return (
                    <tr key={h.id}>
                      <td className="px-4 py-2 text-sm">{proc?.name || h.procedureId}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{h.lastScoredAt}</td>
                      <td className="px-4 py-2 text-sm text-right font-medium">{h.points}点</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 提供文書一覧 */}
      <Card className="mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">提供文書</span>
        </div>
        {patientDocs.length === 0 ? (
          <EmptyState message="提供文書はありません" />
        ) : (
          <ul className="divide-y divide-gray-200">
            {patientDocs.map(d => (
              <li key={d.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">{d.templateName}</span>
                  <span className="text-xs text-gray-500 ml-2">{d.createdAt}</span>
                </div>
                <Badge variant="success">作成済み</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* 経過記録 */}
      <Card>
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">経過記録</span>
        </div>
        {patientExams.length === 0 ? (
          <EmptyState message="診療記録はありません" />
        ) : (
          <ul className="divide-y divide-gray-200">
            {patientExams.map(e => (
              <li key={e.id} className="px-4 py-3">
                <div className="text-xs text-gray-500 mb-1">
                  診察ID: {e.id} / ステータス: {e.status}
                </div>
                {e.visitCondition && (
                  <div className="text-sm">
                    <span className="text-gray-500">様子:</span> {e.visitCondition}
                  </div>
                )}
                {e.oralFindings && (
                  <div className="text-sm">
                    <span className="text-gray-500">所見:</span> {e.oralFindings}
                  </div>
                )}
                {e.treatment && (
                  <div className="text-sm">
                    <span className="text-gray-500">処置:</span> {e.treatment}
                  </div>
                )}
                {e.nextPlan && (
                  <div className="text-sm">
                    <span className="text-gray-500">次回:</span> {e.nextPlan}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

// =============================================================================
// IndividualInputPage - 個別入力画面
// =============================================================================

export const IndividualInputPage = ({ facilities, patients, staff, onStartConsultation }: IndividualInputPageProps) => {
  const [selectedFacilityId, setSelectedFacilityId] = useState('')
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null)
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [selectedHygienistId, setSelectedHygienistId] = useState('')

  const facilityPatients = useMemo(() => {
    if (!selectedFacilityId) return []
    return patients.filter(p => p.facilityId === Number(selectedFacilityId))
  }, [patients, selectedFacilityId])

  // 建物×フロアでグルーピング
  const groupedPatients = useMemo(() => {
    const groups: Record<string, Patient[]> = {}
    facilityPatients.forEach(p => {
      const key = `${p.building} ${p.floor}`
      if (!groups[key]) groups[key] = []
      groups[key].push(p)
    })
    return groups
  }, [facilityPatients])

  const doctors = staff.filter(s => s.role === STAFF_ROLES.DOCTOR)
  const hygienists = staff.filter(s => s.role === STAFF_ROLES.HYGIENIST)

  const handleStart = () => {
    if (!selectedPatientId || !selectedFacilityId) return
    onStartConsultation({
      patientId: selectedPatientId,
      facilityId: Number(selectedFacilityId),
      doctorId: selectedDoctorId ? Number(selectedDoctorId) : null,
      hygienistId: selectedHygienistId ? Number(selectedHygienistId) : null,
    })
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">個別入力</h2>
      <p className="text-sm text-gray-500 mb-4">スケジュールを経由せず、患者を直接選択して診療入力を開始します。</p>

      {/* 施設選択 */}
      <Card className="mb-4 p-4">
        <Select
          label="施設選択"
          value={selectedFacilityId}
          onChange={(v: string) => {
            setSelectedFacilityId(v)
            setSelectedPatientId(null)
          }}
          options={[{ value: '', label: '施設を選択してください' }, ...facilities.map(f => ({ value: String(f.id), label: f.name }))]}
        />
      </Card>

      {/* 患者選択 */}
      {selectedFacilityId && (
        <Card className="mb-4">
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <span className="text-sm font-medium text-gray-700">患者を選択</span>
          </div>
          {Object.entries(groupedPatients).length === 0 ? (
            <EmptyState message="この施設に登録された患者はいません" />
          ) : (
            <div className="divide-y divide-gray-200">
              {Object.entries(groupedPatients).map(([group, pts]) => (
                <div key={group}>
                  <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500">{group}</div>
                  {pts.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPatientId(p.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${selectedPatientId === p.id ? 'bg-slate-100 border-l-4 border-slate-600' : 'hover:bg-gray-50'
                        }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs ${selectedPatientId === p.id ? 'border-slate-600 bg-slate-600 text-white' : 'border-gray-300'
                          }`}
                      >
                        {selectedPatientId === p.id && '✓'}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{getPatientName(p)}</span>
                      <span className="text-xs text-gray-500">({p.room})</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* 担当選択・開始 */}
      {selectedPatientId && (
        <Card className="p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Select
              label="担当Dr"
              value={selectedDoctorId}
              onChange={setSelectedDoctorId}
              options={[{ value: '', label: '選択なし' }, ...doctors.map(d => ({ value: String(d.id), label: d.name }))]}
            />
            <Select
              label="担当DH"
              value={selectedHygienistId}
              onChange={setSelectedHygienistId}
              options={[{ value: '', label: '選択なし' }, ...hygienists.map(h => ({ value: String(h.id), label: h.name }))]}
            />
          </div>
          <Button size="lg" className="w-full" onClick={handleStart}>
            診察を開始する
          </Button>
        </Card>
      )}
    </div>
  )
}

// =============================================================================
// FinalReviewPage - 最終提示画面
// =============================================================================

export const FinalReviewPage = ({ examination, patient, facility, staff, clinic, onBack, onBackToSchedule, visitDate }: FinalReviewPageProps) => {
  if (!examination || !patient) return null

  const currentMaster = useMemo(() => getProcedureMaster(visitDate || ''), [visitDate])
  const currentScoringSections = useMemo(() => getScoringSections(visitDate || ''), [visitDate])
  const totalPoints = useMemo(() => calculateExamPoints(examination, visitDate), [examination, visitDate])

  const drDuration =
    examination.drStartTime && examination.drEndTime
      ? Math.floor((new Date(examination.drEndTime).getTime() - new Date(examination.drStartTime).getTime()) / 1000)
      : null
  const dhDuration =
    examination.dhStartTime && examination.dhEndTime
      ? Math.floor((new Date(examination.dhEndTime).getTime() - new Date(examination.dhStartTime).getTime()) / 1000)
      : null

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4">
        ← 戻る
      </button>
      <h2 className="text-xl font-bold text-gray-900 mb-1">最終提示画面</h2>
      <p className="text-sm text-gray-500 mb-4">
        {getPatientName(patient)} 様 | {facility?.name || '-'} | 2026/01/18
      </p>

      {/* 診療情報 */}
      <Card className="mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">診療情報</span>
        </div>
        <div className="p-4 space-y-2 text-sm">
          {drDuration !== null && (
            <div>
              DR時間: {examination.drStartTime ? formatTime(new Date(examination.drStartTime)) : '--'} -{' '}
              {examination.drEndTime ? formatTime(new Date(examination.drEndTime)) : '--'} ({formatDuration(drDuration)})
            </div>
          )}
          {dhDuration !== null && (
            <div>
              DH時間: {examination.dhStartTime ? formatTime(new Date(examination.dhStartTime)) : '--'} -{' '}
              {examination.dhEndTime ? formatTime(new Date(examination.dhEndTime)) : '--'} ({formatDuration(dhDuration)})
            </div>
          )}
          {examination.vitalBefore && (
            <div>
              バイタル(前): BP {examination.vitalBefore.bloodPressure || '-'}, SpO2 {examination.vitalBefore.spo2 || '-'}
            </div>
          )}
          {examination.vitalAfter && (
            <div>
              バイタル(後): BP {examination.vitalAfter.bloodPressure || '-'}, SpO2 {examination.vitalAfter.spo2 || '-'}
            </div>
          )}
        </div>
      </Card>

      {/* 実施記録 */}
      <Card className="mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">実施記録</span>
        </div>
        <div className="p-4 space-y-2 text-sm">
          <div>
            <span className="text-gray-500">訪問時の様子:</span> {examination.visitCondition || '（未入力）'}
          </div>
          <div>
            <span className="text-gray-500">口腔内所見:</span> {examination.oralFindings || '（未入力）'}
          </div>
          <div>
            <span className="text-gray-500">処置:</span> {examination.treatment || '（未入力）'}
          </div>
          <div>
            <span className="text-gray-500">次回予定:</span> {examination.nextPlan || '（未入力）'}
          </div>
        </div>
      </Card>

      {/* 算定項目 */}
      <Card className="mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">算定項目</span>
          <span className="text-sm font-bold text-slate-700">合計: {totalPoints}点</span>
        </div>
        <ul className="divide-y divide-gray-200">
          {Object.entries(examination.procedureItems || {}).map(([masterId, data]) => {
            const master = findMasterById(currentMaster, masterId)
            if (!master) return null
            // 新構造: selectedSubItems
            const subs = (data.selectedSubItems || []).map(subId => master.subItems?.find(s => s.id === subId)).filter(Boolean)
            const points = subs.reduce((sum, s) => sum + (s?.points || 0), 0)
            return (
              <li key={masterId} className="px-4 py-2 flex justify-between items-center text-sm">
                <div>
                  <span className="font-medium">{master.name}</span>
                  {subs.length > 0 && <span className="text-gray-500 ml-2">({subs.map(s => s?.name).join(', ')})</span>}
                </div>
                <span className="font-medium">{points}点</span>
              </li>
            )
          })}
          {Object.keys(examination.procedureItems || {}).length === 0 && (
            <li className="px-4 py-3 text-sm text-gray-500">算定項目なし</li>
          )}
        </ul>
      </Card>

      {/* 操作ボタン */}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1">
          診療画面に戻る
        </Button>
        <Button variant="success" onClick={onBackToSchedule} className="flex-1">
          訪問計画に戻る
        </Button>
      </div>
    </div>
  )
}
