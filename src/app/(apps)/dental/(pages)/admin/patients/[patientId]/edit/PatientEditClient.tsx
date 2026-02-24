'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {HREF} from '@cm/lib/methods/urls'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import { Button } from '@cm/components/styles/common-components/Button'
import { Input } from '@shadcn/ui/input'
import { Card, CardContent } from '@shadcn/ui/card'
import { Checkbox } from '@shadcn/ui/checkbox'
import { updateDentalPatient } from '@app/(apps)/dental/_actions/patient-actions'
import { PATIENT_DISEASES, ASSESSMENT_OPTIONS, DEFAULT_ASSESSMENT } from '@app/(apps)/dental/lib/constants'
import type { Patient, Assessment } from '@app/(apps)/dental/lib/types'

type PatientEditClientProps = {
  patient: Patient
}

const PatientEditClient = ({ patient }: PatientEditClientProps) => {
  const router = useRouter()
  const {query} = useGlobal()
  const [form, setForm] = useState({
    lastName: patient.lastName,
    firstName: patient.firstName,
    lastNameKana: patient.lastNameKana,
    firstNameKana: patient.firstNameKana,
    birthDate: patient.birthDate,
    gender: patient.gender,
    careLevel: patient.careLevel || '',
    diseases: { ...patient.diseases } as Record<string, boolean>,
    assessment: { ...DEFAULT_ASSESSMENT, ...patient.assessment } as Assessment,
    notes: patient.notes || '',
  })

  const calcAge = (birthDate: string) => {
    if (!birthDate) return 0
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
  const updateDisease = (id: string, val: boolean) =>
    setForm(p => ({ ...p, diseases: { ...p.diseases, [id]: val } }))
  const updateAssessment = (field: string, value: string | boolean) => {
    setForm(p => {
      const newA = { ...p.assessment, [field]: value }
      if (field === 'height' || field === 'weight') {
        newA.bmi = calcBmi(
          field === 'height' ? (value as string) : newA.height,
          field === 'weight' ? (value as string) : newA.weight
        )
      }
      return { ...p, assessment: newA }
    })
  }

  const handleSave = async () => {
    if (!form.lastNameKana || !form.firstNameKana) return
    await updateDentalPatient(patient.id, {
      lastName: form.lastName,
      firstName: form.firstName,
      lastNameKana: form.lastNameKana,
      firstNameKana: form.firstNameKana,
      birthDate: form.birthDate || null,
      gender: form.gender,
      careLevel: form.careLevel,
      diseases: form.diseases as unknown as Record<string, unknown>,
      assessment: form.assessment as unknown as Record<string, unknown>,
      notes: form.notes,
    })
    router.push(HREF(`/dental/admin/patients/${patient.id}`, {}, query))
    router.refresh()
  }

  const RadioGroup = ({
    label,
    options,
    value,
    onChange,
    code,
  }: {
    label: string
    options: string[]
    value: string
    onChange: (v: string) => void
    code?: string
  }) => (
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
    <div className={`p-4`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="text-blue-600 text-sm">
            &#x2190; 戻る
          </button>
          <h2 className="text-xl font-bold text-gray-900">患者情報入力</h2>
        </div>
        <Button onClick={handleSave}>保存</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 左パネル: 患者情報入力 */}
        <div>
          <Card className="mb-4">
            <div className="p-3 border-b border-gray-200 bg-blue-600 rounded-t-lg">
              <span className="text-sm font-medium text-white">患者情報入力</span>
            </div>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">患者ID</label>
                  <Input value={String(patient.id)} disabled />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">姓</label>
                  <Input value={form.lastName} onChange={e => updateField('lastName', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">名</label>
                  <Input value={form.firstName} onChange={e => updateField('firstName', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">セイ（必須）</label>
                  <Input value={form.lastNameKana} onChange={e => updateField('lastNameKana', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">メイ（必須）</label>
                  <Input value={form.firstNameKana} onChange={e => updateField('firstNameKana', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">生年月日</label>
                  <Input type="date" value={form.birthDate} onChange={e => updateField('birthDate', e.target.value)} />
                </div>
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
                      <Checkbox
                        checked={!!form.diseases[d.id]}
                        onCheckedChange={() => updateDisease(d.id, !form.diseases[d.id])}
                      />
                      {d.name}
                    </label>
                  ))}
                </div>
              </div>

              {/* 加算チェック */}
              <div className="space-y-2 pt-2 border-t">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={!!form.assessment.hasInfoShareFee}
                    onCheckedChange={() => updateAssessment('hasInfoShareFee', !form.assessment.hasInfoShareFee)}
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
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={!!form.assessment.hasComprehensiveManagement}
                    onCheckedChange={() =>
                      updateAssessment('hasComprehensiveManagement', !form.assessment.hasComprehensiveManagement)
                    }
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

              <div>
                <label className="block text-xs text-gray-600 mb-1">申し送り</label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右パネル: アセスメント */}
        <div>
          <Card>
            <div className="p-3 border-b border-gray-200 bg-blue-600 rounded-t-lg">
              <span className="text-sm font-medium text-white">患者状態・アセスメント</span>
            </div>
            <CardContent className="p-4">
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
                  <div className="px-2 py-1 bg-gray-100 rounded text-sm">{form.assessment.bmi || '\u2014'}</div>
                </div>
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
              <RadioGroup
                label="主食"
                options={ASSESSMENT_OPTIONS.mainDish}
                value={form.assessment.mainDish}
                onChange={v => updateAssessment('mainDish', v)}
              />
              <RadioGroup
                label="おかず"
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
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button onClick={handleSave}>保存</Button>
      </div>
    </div>
  )
}

export default PatientEditClient
