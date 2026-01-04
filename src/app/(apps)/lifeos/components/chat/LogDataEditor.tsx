'use client'

import React, { useState, useEffect } from 'react'
import { Save, X, Trash2 } from 'lucide-react'
import { Plan, Category, MultiPlan, LifeOSData } from '../../types'
import { useArchetype } from '../../hooks/useArchetype'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { Card } from '@cm/shadcn/ui/card'
import ShadModal from '@cm/shadcn/ui/Organisms/ShadModal'

export interface LogDataEditorProps {
  multiPlan: MultiPlan
  onUpdate: (updatedMultiPlan: MultiPlan) => void
  onSave: (multiPlan: MultiPlan) => void
  onCancel: () => void
}

export const LogDataEditor: React.FC<LogDataEditorProps> = ({
  multiPlan: initialMultiPlan,
  onUpdate,
  onSave,
  onCancel,
}) => {
  const [multiPlan, setMultiPlan] = useState<MultiPlan>(initialMultiPlan)
  const [expandedPlans, setExpandedPlans] = useState<Set<number>>(new Set())
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [selectedPlans, setSelectedPlans] = useState<Set<number>>(new Set())

  // カテゴリ一覧を取得
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/lifeos/api/categories')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setCategories(data.categories || [])
          }
        }
      } catch (error) {
        console.error('カテゴリ取得エラー:', error)
      } finally {
        setIsLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    setMultiPlan(initialMultiPlan)
    // すべてのプランを展開
    setExpandedPlans(new Set(initialMultiPlan.plans.map((_, index) => index)))
  }, [initialMultiPlan])

  const togglePlanExpansion = (index: number) => {
    const newExpanded = new Set(expandedPlans)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedPlans(newExpanded)
  }

  const togglePlanSelection = (index: number) => {
    const newSelected = new Set(selectedPlans)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedPlans(newSelected)
  }

  const selectAllPlans = () => {
    setSelectedPlans(new Set(multiPlan.plans.map((_, index) => index)))
  }

  const deselectAllPlans = () => {
    setSelectedPlans(new Set())
  }

  const updatePlan = (index: number, updatedPlan: Plan) => {
    const newPlans = [...multiPlan.plans]
    newPlans[index] = updatedPlan
    const updatedMultiPlan: MultiPlan = {
      ...multiPlan,
      plans: newPlans,
    }
    setMultiPlan(updatedMultiPlan)
    onUpdate(updatedMultiPlan)
  }

  const removePlan = (index: number) => {
    const newPlans = multiPlan.plans.filter((_, i) => i !== index)
    const updatedMultiPlan: MultiPlan = {
      ...multiPlan,
      plans: newPlans,
      totalRecords: newPlans.length,
    }
    setMultiPlan(updatedMultiPlan)
    onUpdate(updatedMultiPlan)
  }

  const handleSaveAll = () => {
    onSave(multiPlan)
  }

  const handleSaveSelected = () => {
    if (selectedPlans.size === 0) {
      alert('保存するログレコードを選択してください')
      return
    }
    const selectedPlansData = multiPlan.plans.filter((_, index) => selectedPlans.has(index))
    const selectedMultiPlan: MultiPlan = {
      ...multiPlan,
      plans: selectedPlansData,
      totalRecords: selectedPlansData.length,
    }
    onSave(selectedMultiPlan)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">ログデータの確認・編集</h2>
          <p className="text-sm text-gray-600 mt-1">
            {multiPlan.totalRecords}件のログレコードを抽出しました
          </p>
        </div>
        <div className="flex gap-2">
          {selectedPlans.size > 0 && (
            <button
              onClick={handleSaveSelected}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              選択した{selectedPlans.size}件を保存
            </button>
          )}
          <button
            onClick={handleSaveAll}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            すべて保存
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            キャンセル
          </button>
        </div>
      </div>

      {/* 一括操作 */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <R_Stack className="items-center gap-2">
          <button
            onClick={selectAllPlans}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            すべて選択
          </button>
          <button
            onClick={deselectAllPlans}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            選択解除
          </button>
          <span className="text-sm text-gray-600">
            {selectedPlans.size}件選択中
          </span>
        </R_Stack>
      </div>

      {/* 各ログレコード */}
      <C_Stack className="gap-4">
        {multiPlan.plans.map((plan, index) => (

          <PlanEditor
            key={index}

            plan={plan}
            index={index}
            isExpanded={expandedPlans.has(index)}
            isSelected={selectedPlans.has(index)}
            categories={categories}
            isLoadingCategories={isLoadingCategories}

            onToggleSelection={() => togglePlanSelection(index)}
            onUpdate={(updatedPlan) => updatePlan(index, updatedPlan)}
            onRemove={() => removePlan(index)}
          />

        ))}
      </C_Stack>
    </div>
  )
}

// 個別のPlan編集コンポーネント
interface PlanEditorProps {
  plan: Plan
  index: number
  isExpanded: boolean
  isSelected: boolean
  categories: Category[]
  isLoadingCategories: boolean

  onToggleSelection: () => void
  onUpdate: (plan: Plan) => void
  onRemove: () => void
}

const PlanEditor: React.FC<PlanEditorProps> = ({
  plan: initialPlan,
  index,
  isExpanded,
  isSelected,
  categories,
  isLoadingCategories,

  onToggleSelection,
  onUpdate,
  onRemove,
}) => {
  const [plan, setPlan] = useState<Plan>(initialPlan)


  useEffect(() => {
    setPlan(initialPlan)
  }, [initialPlan])


  const updateCategory = (category: string) => {
    const updated = { ...plan, category }
    setPlan(updated)
    onUpdate(updated)
  }

  const updateDataField = (key: string, value: unknown) => {
    const data = plan.data as Record<string, unknown>
    const updatedData = { ...data, [key]: value }
    const updated = { ...plan, data: updatedData }
    setPlan(updated)
    onUpdate(updated)
  }

  // const updateSchemaField = (key: string, value: unknown) => {
  //   const schema = { ...plan.schema, [key]: value }
  //   const updated = { ...plan, schema }
  //   setPlan(updated)
  //   onUpdate(updated)
  // }

  const dataObj = plan.data as Record<string, unknown>
  const schemaObj = plan.schema

  return (
    <Card key={index} className={` ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelection}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />

          <C_Stack className={`gap-0`}>
            <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>


          </C_Stack>

        </div>
        <button
          onClick={onRemove}
          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
          title="削除"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>




      <C_Stack>


        <ShadModal Trigger={
          <div className=" bg-yellow-50 border border-yellow-500 rounded p-2 cursor-pointer">
            <LogDataPreview plan={plan} />
          </div>

        }>
          <div className={` grid grid-cols-1  gap-8 max-w-[600px] `}>
            {/* カテゴリ編集 */}
            <div className="border-b border-gray-200 cursor-pointer bg-gray-100 p-3">
              <button className="w-full flex items-center justify-between text-left">
                <h4 className="font-semibold text-gray-900">カテゴリ</h4>
              </button>

              <div className="mt-2 space-y-2">
                {isLoadingCategories ? (
                  <p className="text-sm text-gray-500">カテゴリを読み込み中...</p>
                ) : (
                  <>
                    <select
                      value={plan.category}
                      onChange={(e) => updateCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name} {cat.description ? `- ${cat.description}` : ''}
                        </option>
                      ))}
                      <option value={plan.category}>{plan.category} (現在の値)</option>
                    </select>
                    <input
                      type="text"
                      value={plan.category}
                      onChange={(e) => updateCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="または新しいカテゴリ名を入力"
                    />
                  </>
                )}
                <p className="text-xs text-gray-500">アーキタイプ: {plan.archetype}</p>
              </div>

            </div>

            {/* データフィールド編集 */}
            <div className="border-b border-gray-200 cursor-pointer bg-gray-100 p-3">
              <button

                className="w-full flex items-center justify-between text-left"
              >
                <h4 className="font-semibold text-gray-900">データ</h4>

              </button>
              <div className="mt-2 space-y-3">
                {Object.entries(dataObj).map(([key, value]) => {
                  const schemaField = schemaObj[key] as { type?: string; unit?: string } | undefined
                  const fieldType = schemaField?.type || typeof value

                  return (
                    <div key={key} className="flex items-center gap-2">
                      <label className="w-32 text-sm font-medium text-gray-700">{key}:</label>
                      {fieldType === 'number' ? (
                        <input
                          type="number"
                          value={value as number}
                          onChange={(e) => updateDataField(key, parseFloat(e.target.value) || 0)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          step="any"
                        />
                      ) : fieldType === 'boolean' ? (
                        <input
                          type="checkbox"
                          checked={value as boolean}
                          onChange={(e) => updateDataField(key, e.target.checked)}
                          className="w-5 h-5"
                        />
                      ) : (
                        <input
                          type="text"
                          value={String(value)}
                          onChange={(e) => updateDataField(key, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                      {schemaField?.unit && (
                        <span className="text-sm text-gray-500">{schemaField.unit}</span>
                      )}
                    </div>
                  )
                })}
              </div>

            </div>



          </div>

        </ShadModal>



      </C_Stack>

    </Card>
  )
}

// プレビューコンポーネント
const LogDataPreview: React.FC<{ plan: Plan }> = ({ plan }) => {
  const { Component } = useArchetype({

    archetype: plan.archetype,
  })

  return (
    <C_Stack >
      <R_Stack className=" items-center  text-sm text-gray-600 justify-end">
        <span className="font-semibold">カテゴリ:</span>
        <span>{plan.category}</span>
        <span>|</span>
        <span className="font-semibold">アーキタイプ:</span>
        <span>{plan.archetype}</span>
      </R_Stack>
      <Component log={plan as unknown as LifeOSData} />
    </C_Stack>
  )
}
