'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { getExpenseById, updateExpense, uploadAttachment, linkAttachmentsToExpense } from '../../../../actions/expense-actions'
import CameraUpload from '../../../../components/CameraUpload'
import { useAllOptions } from '../../../../hooks/useOptions'
import ContentPlayer from '@cm/components/utils/ContentPlayer'
import { analyzeMultipleReceipts } from '@app/(apps)/keihi/actions/expense/analyzeReceipt'
import { generateInsightsDraft } from '@app/(apps)/keihi/actions/expense/insights'
import { ExpenseIntegratedForm } from '@app/(apps)/keihi/components/ExpenseIntegratedForm'
import { useJotaiByKey } from '@cm/hooks/useJotai'
import { Card } from '@cm/shadcn/ui/card'

interface ExpenseDetail {
  id: string
  date: Date
  amount: number
  counterparty?: string | null
  participants?: string | null
  conversationPurpose: string[]
  keywords: string[]
  conversationSummary?: string | null
  autoTags: string[]
  mfSubject?: string | null // 統合された科目フィールド
  mfSubAccount?: string | null
  mfTaxCategory?: string | null
  mfDepartment?: string | null
  summary?: string | null
  insight?: string | null
  status?: string | null

  KeihiAttachment: Array<{
    id: string
    filename: string
    originalName: string
    mimeType: string
    size: number
    url: string
  }>
}

interface FormData {
  date: string
  amount: string
  counterparty: string
  participants: string
  conversationPurpose: string[]
  keywords: string[]
  conversationSummary: string
  summary: string
  insight: string
  autoTags: string[]
  status: string
  mfSubject: string
  mfSubAccount: string
  mfTaxCategory: string
  mfDepartment: string
  // ハイライト表示用の変更フィールド記録
  _changedFields?: {
    summary?: boolean
    insight?: boolean
    conversationSummary?: boolean
    mfSubject?: boolean
    mfSubAccount?: boolean
  }
}

export default function ExpenseEditor({ expenseId, onUpdate }: { expenseId: string; onUpdate: () => void }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStatus, setAnalysisStatus] = useState('')
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)

  const [expense, setExpense] = useState<ExpenseDetail | null>(null)

  const [additionalInstruction, setAdditionalInstruction] = useState('')
  const [attachments, setAttachments] = useState<
    Array<{
      id: string
      filename: string
      originalName: string
      mimeType: string
      size: number
      url: string
    }>
  >([])
  const [newAttachments, setNewAttachments] = useState<
    Array<{
      id: string
      filename: string
      originalName: string
      mimeType: string
      size: number
      url: string
    }>
  >([])

  // マスタデータを取得
  const { allOptions, isLoading: isOptionsLoading, error: optionsError } = useAllOptions()

  // フォーム状態
  const [formData, setFormData] = useJotaiByKey<FormData>('keihiFormJotai', {
    date: '',
    amount: '',
    counterparty: '',
    participants: '',
    conversationPurpose: [],
    keywords: [],
    conversationSummary: '',
    summary: '',
    insight: '',
    autoTags: [],
    status: '',
    mfSubject: '',
    mfSubAccount: '',
    mfTaxCategory: '課仕 10%',
    mfDepartment: '',
  })

  // const expenseId = params?.id as string

  useEffect(() => {
    const fetchExpense = async () => {
      setIsLoading(true)
      try {
        const result = await getExpenseById(expenseId)

        if (result.success) {
          const data = result.data as ExpenseDetail
          setExpense(data)

          // 既存の添付ファイルを設定
          setAttachments(data.KeihiAttachment || [])

          // フォームデータを設定
          setFormData({
            date: new Date(data.date).toISOString().split('T')[0],
            amount: data.amount.toString(),
            counterparty: data.counterparty || '',
            participants: data.participants || '',
            conversationPurpose: data.conversationPurpose || [],
            keywords: data.keywords,
            conversationSummary: data.conversationSummary || '',
            summary: data.summary || '',
            insight: data.insight || '',
            autoTags: data.autoTags || [],
            status: data.status || '',
            mfSubject: data.mfSubject || '', // 統合された科目フィールド
            mfSubAccount: data.mfSubAccount || '',
            mfTaxCategory: data.mfTaxCategory || '',
            mfDepartment: data.mfDepartment || '',
          })

          // AIドラフトデータの設定は不要（統合フォームで直接管理）
        } else {
          toast.error(result.error || '記録の取得に失敗しました')
          router.push('/keihi')
        }
      } catch (error) {
        console.error('詳細取得エラー:', error)
        toast.error('記録の取得に失敗しました')
        router.push('/keihi')
      } finally {
        setIsLoading(false)
      }
    }

    if (expenseId) {
      fetchExpense()
    } else {
      setIsLoading(false)
    }
  }, [expenseId, router])

  // AIインサイト生成
  const handleGenerateInsights = async () => {
    setIsGeneratingInsights(true)

    try {
      const expenseFormData = {
        date: formData.date,
        amount: parseFloat(formData.amount) || 0,
        mfSubject: formData.mfSubject, // mfSubjectを使用
        counterparty: formData.counterparty,
        participants: formData.participants,
        conversationPurpose: formData.conversationPurpose,
        keywords: formData.keywords,
        conversationSummary: formData.conversationSummary,
      }

      const result = await generateInsightsDraft(expenseFormData, additionalInstruction || undefined)

      if (result.success && result.data) {
        // AIの結果を直接フォームデータに設定
        setFormData(prev => ({
          ...prev,
          summary: result.data?.summary || '',
          insight: result.data?.insight || '',
          conversationSummary: result.data?.conversationSummary || prev.conversationSummary || '',
          mfSubject: result.data?.mfSubject || prev.mfSubject || '',
          mfSubAccount: result.data?.mfSubAccount || prev.mfSubAccount || '',
          autoTags: result.data?.autoTags || [],
          keywords: [...new Set([...prev.keywords, ...(result.data?.generatedKeywords || [])])],
          // 変更された項目を記録（ハイライト表示用）
          _changedFields: {
            summary: true,
            insight: true,
            conversationSummary: !!result.data?.conversationSummary,
            mfSubject: !!result.data?.mfSubject,
            mfSubAccount: !!result.data?.mfSubAccount,
          },
        }))

        toast.success('AIインサイトを生成しました')
      } else {
        toast.error(result.error || 'AIインサイト生成に失敗しました')
      }
    } catch (error) {
      console.error('AIインサイト生成エラー:', error)
      toast.error('AIインサイト生成に失敗しました')
    } finally {
      setIsGeneratingInsights(false)
    }
  }

  // カメラ・画像アップロード＋AI解析
  const handleImageCapture = async (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'))

    if (imageFiles.length === 0) {
      toast.error('画像ファイルを選択してください')
      return
    }

    setIsAnalyzing(true)
    setAnalysisStatus('画像を解析・保存中...')

    try {
      const base64Images: string[] = []
      const uploadedAttachments: Array<{
        id: string
        filename: string
        originalName: string
        mimeType: string
        size: number
        url: string
      }> = []

      for (const file of imageFiles) {
        // Base64変換（AI解析用）
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = e => {
            const result = e.target?.result as string
            const base64Data = result.split(',')[1]
            resolve(base64Data)
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        base64Images.push(base64)

        // ファイルアップロード
        const formData = new FormData()
        formData.append('file', file)

        const uploadResult = await uploadAttachment(formData)
        if (uploadResult.success && uploadResult.data) {
          uploadedAttachments.push(uploadResult.data)
        } else {
          console.warn('ファイルアップロード失敗:', uploadResult.error)
        }
      }

      // 新しい添付ファイルリストに追加
      if (uploadedAttachments.length > 0) {
        setNewAttachments(prev => [...prev, ...uploadedAttachments])
        toast.success(`${uploadedAttachments.length}枚の画像を保存しました`)
      }

      // AI解析実行
      if (base64Images.length > 0) {
        const result = await analyzeMultipleReceipts(base64Images)

        if (result.success && result.data && result.data.receipts.length > 0) {
          const receipt = result.data.receipts[0]
          setFormData(prev => ({
            ...prev,
            date: receipt.date,
            amount: receipt.amount.toString(),
            mfSubject: receipt.mfSubject, // 統合された科目フィールド
            counterparty: receipt.counterparty || '',
            participants: receipt.participants || '',
            conversationPurpose: receipt.conversationPurpose || [],
            keywords: [...prev.keywords, ...(receipt.keywords || [])],
          }))
          toast.success('領収書を解析しました！内容を確認してください。')
        } else {
          toast.error(result.error || '画像解析に失敗しました')
        }
      }
    } catch (error) {
      console.error('画像処理エラー:', error)
      toast.error('画像の処理に失敗しました')
    } finally {
      setIsAnalyzing(false)
      setAnalysisStatus('')
    }
  }

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.date || !formData.amount || !formData.mfSubject || !formData.mfTaxCategory) {
      toast.error('必須項目（日付、金額、摘要、税区分、部門）を入力してください')
      return
    }

    setIsSaving(true)

    try {
      const updateData = {
        // 基本情報
        date: new Date(formData.date),
        amount: parseFloat(formData.amount),
        mfSubject: formData.mfSubject, // mfSubjectをsubjectとして保存
        counterparty: formData.counterparty || undefined,
        participants: formData.participants || undefined,
        conversationPurpose: formData.conversationPurpose,
        keywords: formData.keywords,
        conversationSummary: formData.conversationSummary || undefined,

        // AIインサイト（手動編集可能）
        summary: formData.summary || undefined,
        insight: formData.insight || undefined,
        autoTags: formData.autoTags || [],

        // MoneyForward用情報
        status: formData.status || undefined,
        mfSubAccount: formData.mfSubAccount || undefined,
        mfTaxCategory: formData.mfTaxCategory || undefined,
        mfDepartment: formData.mfDepartment || undefined,
      }

      const result = await updateExpense(expenseId, updateData)

      if (result.success) {
        // 新しく追加された添付ファイルがある場合は関連付け
        if (newAttachments.length > 0) {
          const attachmentIds = newAttachments.map(att => att.id)
          const linkResult = await linkAttachmentsToExpense(expenseId, attachmentIds)
          if (!linkResult.success) {
            console.warn('添付ファイルの関連付けに失敗:', linkResult.error)
            toast.warning('記録は更新されましたが、添付ファイルの関連付けに失敗しました')
          }
        }

        toast.success('記録を更新しました')

        onUpdate()
      } else {
        toast.error(result.error || '更新に失敗しました')
      }
    } catch (error) {
      console.error('更新エラー:', error)
      toast.error('更新に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  // ファイルサイズをフォーマット
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (isLoading) {
    return (
      <div>loading...</div>
      // <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      //   <div className="text-center">
      //     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      //     <p className="text-gray-600">読み込み中...</p>
      //   </div>
      // </div>
    )
  }

  // if (!expense) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <p className="text-gray-600 mb-4">記録が見つかりません</p>
  //         <button onClick={() => router.push('/keihi')} className="text-blue-600 hover:text-blue-800 underline">
  //           一覧に戻る
  //         </button>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div className=" w-[2000px] max-w-[90vw] mx-auto ">
      <div className=" mx-auto">
        <div className={`grid lg:grid-cols-2 gap-4`}>
          {/* //基本情報 */}
          <Card className={`max-h-[90vh] overflow-y-auto`}>
            {/* ヘッダー */}

            <form onSubmit={handleSubmit} className="px-2 space-y-8">
              {/* カメラ・画像アップロード */}
              <section>
                {/* <h2 className="text-lg font-semibold text-gray-900 mb-4">領収書の読み取り</h2> */}
                <CameraUpload onImageCapture={handleImageCapture} isAnalyzing={isAnalyzing} analysisStatus={analysisStatus} />
                <p className="text-sm text-gray-600 mt-2">追加の領収書を撮影すると、フォームの内容を自動更新します</p>
              </section>

              {/* 統合フォーム */}
              <ExpenseIntegratedForm
                formData={{
                  date: formData.date,
                  amount: parseInt(formData.amount) || 0,
                  counterparty: formData.counterparty,
                  participants: formData.participants,
                  conversationPurpose: formData.conversationPurpose,
                  keywords: formData.keywords,
                  conversationSummary: formData.conversationSummary,
                  summary: formData.summary,
                  insight: formData.insight,
                  autoTags: formData.autoTags,
                  status: formData.status,
                  mfSubject: formData.mfSubject,
                  mfSubAccount: formData.mfSubAccount,
                  mfTaxCategory: formData.mfTaxCategory,
                  mfDepartment: formData.mfDepartment,
                  _changedFields: formData._changedFields,
                }}
                setFormData={(field, value) => {
                  setFormData(prev => {
                    return { ...prev, [field]: value }
                  })
                }}
                allOptions={allOptions}
                isGeneratingInsights={isGeneratingInsights}
                additionalInstruction={additionalInstruction}
                setAdditionalInstruction={setAdditionalInstruction}
                onGenerateInsights={handleGenerateInsights}
              />

              {/* 送信ボタン */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.push('/keihi')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  disabled={isSaving}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  {isSaving ? '更新中...' : '更新'}
                </button>
              </div>
            </form>
          </Card>

          {/* 画像 */}
          <Card>
            {/* 添付ファイル */}
            <section>
              {/* <h2 className="text-lg font-semibold text-gray-900 mb-4">📎 撮影済み画像</h2> */}

              {/* 既存の添付ファイル */}
              {attachments.length > 0 && (
                <div className="mb-4">
                  {/* <h3 className="text-sm font-medium text-gray-700 mb-2">既存の画像</h3> */}
                  <div className="space-y-2">
                    {attachments.map(attachment => (
                      <div key={attachment.id} className="flex flex-col items-center justify-between">
                        <ContentPlayer
                          src={attachment.url}
                          styles={{
                            thumbnail: { width: '34vw', height: 'auto' },
                          }}
                        />
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium text-gray-900">{attachment.originalName}</p>
                            {/* <p className="text-sm text-gray-600">
                                {attachment.mimeType} • {formatFileSize(attachment.size)}
                              </p> */}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 新しく撮影した画像 */}
              {newAttachments.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">新しく撮影した画像</h3>
                  <div className="space-y-2">
                    {newAttachments.map(attachment => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🖼️</span>
                          <div>
                            <p className="font-medium text-gray-900">{attachment.originalName}</p>
                            <p className="text-sm text-gray-600">
                              {attachment.mimeType} • {formatFileSize(attachment.size)}
                            </p>
                          </div>
                        </div>
                        <ContentPlayer
                          src={attachment.url}
                          styles={{
                            thumbnail: { width: 300, height: 300 },
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </Card>
        </div>
      </div>
    </div>
  )
}
