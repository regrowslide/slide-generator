
'use client'

import React, { useState } from 'react'
import { C_Stack } from '@cm/components/styles/common-components/common-components'

import { ChatInterface } from '@app/(apps)/lifeos/components/chat/ChatInterface'
import { LogDataEditor } from '@app/(apps)/lifeos/components/chat/LogDataEditor'
import { useChat } from '@app/(apps)/lifeos/hooks/useChat'
import { useLifeOS } from '@app/(apps)/lifeos/hooks/useLifeOS'
import { toast } from 'react-toastify'
import { processNaturalLanguage } from '@app/(apps)/lifeos/actions'
import { LifeOSData, MultiPlan, DBCategory, EnrichedSchema } from '@app/(apps)/lifeos/types'
import { mockResultJson } from '@app/(apps)/lifeos/components/chat/mockResultJson'
import { detectSchemaChanges, mergeSchemaFields } from '@app/(apps)/lifeos/lib/schemaUtils'
import { ArchetypeType } from '@app/(apps)/lifeos/types'
const useMockData = false

export default function ChatPage() {
 const { state, addData } = useLifeOS()
 const [multiPlan, setMultiPlan] = useState<MultiPlan | null>(useMockData ? (mockResultJson as unknown as MultiPlan) : null)
 const [showPlanEditor, setShowPlanEditor] = useState(useMockData ? true : false)



 const { messages, isLoading, sendMessage, clearMessages } = useChat({
  onSendMessage: async (message: string) => {
   try {
    // Server Actionを呼び出して自然言語を処理
    const result = await processNaturalLanguage(message)

    console.log(result)  //logs

    if (result.success && result.multiPlan) {
     // 複数のログレコードが生成された場合は編集カードを表示
     setMultiPlan(result.multiPlan)
     setShowPlanEditor(true)
     return {
      success: true,
      response: `${result.multiPlan.totalRecords}件のログレコードを抽出しました。各レコードを確認・編集してから保存してください。`,
     }
    } else if (result.success && result.plans && result.plans.length > 0) {
     // plans配列が直接返された場合
     const multiPlan: MultiPlan = {
      title: `${result.plans.length}件のログレコードを抽出`,
      description: `入力テキストから${result.plans.length}件のログレコードを抽出しました。`,
      plans: result.plans,
      totalRecords: result.plans.length,
     }
     setMultiPlan(multiPlan)
     setShowPlanEditor(true)
     return {
      success: true,
      response: `${result.plans.length}件のログレコードを抽出しました。各レコードを確認・編集してから保存してください。`,
     }
    } else {
     return {
      success: false,
      error: result.message || '処理に失敗しました',
     }
    }
   } catch (error) {
    return {
     success: false,
     error: error instanceof Error ? error.message : 'Unknown error',
    }
   }
  },
 })

 // 複数Planデータを更新（編集時）
 const handleUpdateMultiPlan = (updatedMultiPlan: MultiPlan) => {
  setMultiPlan(updatedMultiPlan)
 }

 // 確定承認してデータベースに保存（複数ログレコード）
 const handleSaveMultiPlan = async (multiPlan: MultiPlan) => {
  try {
   if (multiPlan.plans.length === 0) {
    toast.error('保存するログレコードがありません')
    return
   }

   // 既存カテゴリを取得（スキーマ更新用）
   let existingCategories: DBCategory[] = []
   try {
    const categoriesResponse = await fetch('/lifeos/api/categories')
    if (categoriesResponse.ok) {
     const categoriesData = await categoriesResponse.json()
     if (categoriesData.success) {
      existingCategories = categoriesData.categories || []
     }
    }
   } catch (error) {
    console.error('カテゴリ取得エラー:', error)
   }

   // カテゴリごとにスキーマ更新とarchetype更新をまとめる
   const categorySchemaUpdates: Record<string, { categoryId: number; mergedSchema: EnrichedSchema; mergedArchetypes: ArchetypeType[] }> = {}

   // 各ログレコードを順番に保存
   const savePromises = multiPlan.plans.map(async (plan, index) => {
    try {
     // 既存カテゴリを検索
     const existingCategory = existingCategories.find((cat) => cat.name === plan.category)

     // スキーマ差分とarchetype差分を検出
     if (existingCategory) {
      const extractedSchema = plan.schema as EnrichedSchema
      const extractedArchetype = plan.archetype as ArchetypeType
      const changes = detectSchemaChanges(existingCategory.schema, extractedSchema)

      // archetypeの差分を検出
      const existingArchetypes = existingCategory.archetypes || []
      const hasNewArchetype = !existingArchetypes.includes(extractedArchetype)

      if (changes.hasChanges || hasNewArchetype) {
       // スキーマ更新が必要な場合、マージして保存
       const mergedSchema = changes.hasChanges
        ? mergeSchemaFields(existingCategory.schema, changes.newFields, changes.updatedFields)
        : existingCategory.schema

       // archetypeをマージ
       const mergedArchetypes = hasNewArchetype
        ? [...existingArchetypes, extractedArchetype]
        : existingArchetypes

       // カテゴリごとにまとめる（同じカテゴリの複数レコードがある場合に備える）
       if (!categorySchemaUpdates[plan.category]) {
        categorySchemaUpdates[plan.category] = {
         categoryId: existingCategory.id,
         mergedSchema,
         mergedArchetypes,
        }
       } else {
        // 既に同じカテゴリの更新がある場合、さらにマージ
        const currentMerged = categorySchemaUpdates[plan.category].mergedSchema
        const currentArchetypes = categorySchemaUpdates[plan.category].mergedArchetypes
        const additionalChanges = detectSchemaChanges(currentMerged, extractedSchema)
        const additionalArchetype = !currentArchetypes.includes(extractedArchetype) ? extractedArchetype : null

        categorySchemaUpdates[plan.category] = {
         categoryId: existingCategory.id,
         mergedSchema: additionalChanges.hasChanges
          ? mergeSchemaFields(currentMerged, additionalChanges.newFields, additionalChanges.updatedFields)
          : currentMerged,
         mergedArchetypes: additionalArchetype ? [...currentArchetypes, additionalArchetype] : currentArchetypes,
        }
       }
      }
     } else {
      // 新規カテゴリの場合、archetypeを設定
      const newCategoryArchetypes = [plan.archetype as ArchetypeType]
      if (!categorySchemaUpdates[plan.category]) {
       // 新規カテゴリは後で作成されるため、ここでは記録のみ
       // 実際の作成はAPI側で行われる
      }
     }

     // ログを保存（schemaとarchetypeフィールドは削除済み、カテゴリから参照）
     const response = await fetch('/lifeos/api/logs', {
      method: 'POST',
      headers: {
       'Content-Type': 'application/json',
      },
      body: JSON.stringify({
       category: plan.category,
       schema: plan.schema, // 新規カテゴリ作成時に使用
       archetype: plan.archetype, // 新規カテゴリ作成時に使用
       data: plan.data,
      }),
     })

     if (response.ok) {
      const result = await response.json()
      if (result.success) {
       // ローカルステートにも追加（即座にUIに反映）
       const newData = {
        id: result.log.id || `${Date.now()}-${index}`,
        category: plan.category,
        schema: plan.schema,
        archetype: plan.archetype,
        data: plan.data,
        createdAt: new Date(result.log.createdAt || Date.now()),
       }
       addData(newData as unknown as LifeOSData)
       return { success: true, index }
      } else {
       return { success: false, index, error: result.error }
      }
     } else {
      return { success: false, index, error: 'API呼び出しエラー' }
     }
    } catch (error) {
     console.error(`ログレコード ${index + 1} の保存エラー:`, error)
     return { success: false, index, error: error instanceof Error ? error.message : 'Unknown error' }
    }
   })

   const results = await Promise.all(savePromises)
   const successCount = results.filter(r => r.success).length
   const failureCount = results.filter(r => !r.success).length
   const failureDetails = results.filter(r => !r.success).map(r => `レコード${r.index + 1}: ${r.error}`)

   // カテゴリスキーマとarchetypesを更新
   const schemaUpdatePromises = Object.values(categorySchemaUpdates).map(async ({ categoryId, mergedSchema, mergedArchetypes }) => {
    try {
     const response = await fetch(`/lifeos/api/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
       'Content-Type': 'application/json',
      },
      body: JSON.stringify({ schema: mergedSchema, archetypes: mergedArchetypes }),
     })

     if (response.ok) {
      const result = await response.json()
      if (result.success) {
       return { success: true, categoryId }
      } else {
       return { success: false, categoryId, error: result.error }
      }
     } else {
      return { success: false, categoryId, error: 'API呼び出しエラー' }
     }
    } catch (error) {
     console.error(`カテゴリ ${categoryId} のスキーマ更新エラー:`, error)
     return { success: false, categoryId, error: error instanceof Error ? error.message : 'Unknown error' }
    }
   })

   const schemaUpdateResults = await Promise.all(schemaUpdatePromises)
   const schemaUpdateSuccessCount = schemaUpdateResults.filter(r => r.success).length

   if (successCount > 0) {
    let message = `${successCount}件のログレコードを保存しました`
    if (schemaUpdateSuccessCount > 0) {
     message += `（${schemaUpdateSuccessCount}件のカテゴリスキーマ・archetypeを更新）`
    }
    if (failureCount > 0) {
     message += `（${failureCount}件失敗）`
    }
    toast.success(message)
    if (failureCount > 0) {
     console.error('保存失敗の詳細:', failureDetails)
     failureDetails.forEach(detail => {
      console.error(detail)
     })
    }
    setShowPlanEditor(false)
    setMultiPlan(null)
   } else {
    const errorMessage = failureDetails.length > 0 ? failureDetails.join('; ') : 'Unknown error'
    toast.error(`すべてのログレコードの保存に失敗しました: ${errorMessage}`)
    console.error('保存失敗の詳細:', failureDetails)
   }
  } catch (error) {
   console.error('一括保存エラー:', error)
   toast.error(`保存に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
 }

 // キャンセル
 const handleCancelPlan = () => {
  setShowPlanEditor(false)
  setMultiPlan(null)
 }

 return (
  <div className="min-h-screen bg-gray-50 p-6">
   <C_Stack className="max-w-5xl mx-auto gap-6">
    {/* ヘッダー */}
    <div className="text-center">
     <h1 className="text-2xl font-bold text-gray-900 mb-2">LifeOS チャット</h1>
     <p className="text-gray-600">
      自然言語でログを入力してください。AIが自動的にカテゴリとスキーマを生成します。
     </p>
    </div>

    {/* ログデータ編集カード */}
    {showPlanEditor && multiPlan && (
     <LogDataEditor
      multiPlan={multiPlan}
      onUpdate={handleUpdateMultiPlan}
      onSave={handleSaveMultiPlan}
      onCancel={handleCancelPlan}
     />
    )}

    {/* チャットインターフェース */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ height: '600px' }}>
     <ChatInterface
      messages={messages}
      isLoading={isLoading}
      onSendMessage={sendMessage}
      placeholder="例: 今日は5km走った、体重は70kgだった..."
     />
    </div>

    {/* ヒント */}
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
     <h3 className="font-semibold text-blue-900 mb-2">使い方のヒント</h3>
     <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
      <li>自然な日本語でログを入力してください</li>
      <li>例: 「今日は5km走った」「体重70kg」「タスク: レポート作成を完了」</li>
      <li>AIが自動的にカテゴリとデータ構造を生成します</li>
      <li>生成された計画を確認してから保存できます</li>
      <li>
       <strong>音声入力:</strong> マイクアイコンをクリックして音声でログを追加できます（ブラウザのマイクアクセス許可が必要です）
      </li>
     </ul>
    </div>
   </C_Stack>
  </div>
 )
}

