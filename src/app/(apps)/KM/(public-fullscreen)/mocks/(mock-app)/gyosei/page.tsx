'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { FileUp, Link2, Bot, User, Loader2, CheckCircle2, AlertCircle, ClipboardList } from 'lucide-react'
import {
  SplashScreen,
  MockHeader,
  MockHeaderTitle,
  ResetButton,
  usePersistedState,
  type ThemeColor,
} from '../../_components'
import { analyzeSubsidyPlan, type TaskItem, type AnalysisResult } from './_actions'

// ===== 定数 =====

const THEME: ThemeColor = 'emerald'
const MAX_FILE_SIZE = 3 * 1024 * 1024 // 3MB

const STORAGE_KEYS = {
  STEP: 'gyosei-step',
  PLAN_FILE_NAME: 'gyosei-plan-file-name',
  PLAN_FILE_DATA: 'gyosei-plan-file-data',
  URL: 'gyosei-url',
  MESSAGES: 'gyosei-messages',
  RESULT: 'gyosei-result',
}

type MessageRole = 'ai' | 'user'

interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  type?: 'text' | 'file' | 'url' | 'loading' | 'error'
}

// ===== ステップインジケーター =====

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { num: 1, label: '計画書PDF' },
    { num: 2, label: '公募要領URL' },
    { num: 3, label: 'タスク生成' },
  ]

  return (
    <div className="flex items-center justify-center gap-2 py-4 px-4">
      {steps.map((step, idx) => (
        <React.Fragment key={step.num}>
          <div className="flex items-center gap-1.5">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep >= step.num
                  ? 'bg-emerald-500 text-white'
                  : 'bg-stone-200 text-stone-400'
              }`}
            >
              {currentStep > step.num ? (
                <CheckCircle2 size={16} />
              ) : (
                step.num
              )}
            </div>
            <span
              className={`text-xs font-medium hidden sm:inline ${
                currentStep >= step.num ? 'text-emerald-700' : 'text-stone-400'
              }`}
            >
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`w-8 h-0.5 ${
                currentStep > step.num ? 'bg-emerald-400' : 'bg-stone-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

// ===== チャットメッセージ =====

const ChatBubble = ({ message }: { message: ChatMessage }) => {
  const isAi = message.role === 'ai'

  if (message.type === 'loading') {
    return (
      <div className="flex items-start gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
          <Bot size={16} className="text-emerald-600" />
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2 text-stone-500 text-sm">
            <Loader2 size={14} className="animate-spin" />
            <span>分析中です...</span>
          </div>
        </div>
      </div>
    )
  }

  if (isAi) {
    return (
      <div className="flex items-start gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
          <Bot size={16} className="text-emerald-600" />
        </div>
        <div
          className={`rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%] shadow-sm ${
            message.type === 'error'
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-white border border-stone-200 text-stone-700'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-2.5 mb-4 justify-end">
      <div className="bg-emerald-500 text-white rounded-2xl rounded-tr-md px-4 py-3 max-w-[85%] shadow-sm">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
      </div>
      <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center shrink-0">
        <User size={16} className="text-stone-500" />
      </div>
    </div>
  )
}

// ===== ファイルアップロード =====

const FileUploadZone = ({
  onUpload,
}: {
  onUpload: (fileName: string, base64: string) => void
}) => {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(
    (file: File) => {
      if (file.type !== 'application/pdf') {
        alert('PDFファイルを選択してください。')
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        alert('ファイルサイズが3MBを超えています。軽量化してから再度お試しください。')
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        onUpload(file.name, reader.result as string)
      }
      reader.readAsDataURL(file)
    },
    [onUpload]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  return (
    <div className="px-4 pb-4">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          dragging
            ? 'border-emerald-400 bg-emerald-50'
            : 'border-stone-300 hover:border-emerald-400 hover:bg-emerald-50/50'
        }`}
      >
        <FileUp className="w-8 h-8 text-stone-400 mx-auto mb-2" />
        <p className="text-sm text-stone-600 font-medium">
          計画書PDFをドラッグ&ドロップ
        </p>
        <p className="text-xs text-stone-400 mt-1">
          またはクリックして選択（最大3MB）
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) processFile(file)
          }}
        />
      </div>
    </div>
  )
}

// ===== URL入力 =====

const UrlInputForm = ({ onSubmit }: { onSubmit: (url: string) => void }) => {
  const [url, setUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = url.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 pb-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="公募要領のURLを入力..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          disabled={!url.trim()}
          className="px-4 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          送信
        </button>
      </div>
    </form>
  )
}

// ===== タスク結果テーブル =====

const CATEGORY_COLORS: Record<string, string> = {
  '交付申請': 'bg-blue-100 text-blue-700',
  '経費管理': 'bg-amber-100 text-amber-700',
  '中間報告': 'bg-violet-100 text-violet-700',
  '実績報告': 'bg-emerald-100 text-emerald-700',
  'その他': 'bg-stone-100 text-stone-600',
}

const TaskResultTable = ({ tasks }: { tasks: TaskItem[] }) => {
  return (
    <div className="px-4 pb-4">
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-3 py-2.5 text-left font-medium text-stone-500 text-xs w-24">カテゴリ</th>
                <th className="px-3 py-2.5 text-left font-medium text-stone-500 text-xs">タスク</th>
                <th className="px-3 py-2.5 text-left font-medium text-stone-500 text-xs w-40">期限</th>
                <th className="px-3 py-2.5 text-left font-medium text-stone-500 text-xs w-24">担当</th>
                <th className="px-3 py-2.5 text-left font-medium text-stone-500 text-xs w-40">備考</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {tasks.map((task, idx) => (
                <tr key={idx} className="hover:bg-stone-50/50">
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                        CATEGORY_COLORS[task.category] || CATEGORY_COLORS['その他']
                      }`}
                    >
                      {task.category}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-stone-700">{task.task}</td>
                  <td className="px-3 py-2.5 text-stone-500 text-xs">{task.deadline}</td>
                  <td className="px-3 py-2.5 text-stone-600 text-xs font-medium">{task.responsible}</td>
                  <td className="px-3 py-2.5 text-stone-400 text-xs">{task.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ===== メインページ =====

const INITIAL_MESSAGE: ChatMessage = {
  id: 'init',
  role: 'ai',
  content:
    '補助金の採択おめでとうございます！\n\n採択後に必要な手続き・タスクを自動で洗い出します。\nまずは、計画書（事業計画書）のPDFを添付してください。',
}

export default function GyoseiPage() {
  const [ready, setReady] = useState(false)
  const [step, setStep] = usePersistedState<number>(STORAGE_KEYS.STEP, 1)
  const [planFileName, setPlanFileName] = usePersistedState<string>(STORAGE_KEYS.PLAN_FILE_NAME, '')
  const [planFileData, setPlanFileData] = usePersistedState<string>(STORAGE_KEYS.PLAN_FILE_DATA, '')
  const [guidelinesUrl, setGuidelinesUrl] = usePersistedState<string>(STORAGE_KEYS.URL, '')
  const [messages, setMessages] = usePersistedState<ChatMessage[]>(STORAGE_KEYS.MESSAGES, [INITIAL_MESSAGE])
  const [result, setResult] = usePersistedState<AnalysisResult | null>(STORAGE_KEYS.RESULT, null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // スプラッシュ → メイン
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 1200)
    return () => clearTimeout(timer)
  }, [])

  // チャット自動スクロール
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isAnalyzing])

  // メッセージ追加ヘルパー
  const addMessage = useCallback(
    (role: MessageRole, content: string, type?: ChatMessage['type']) => {
      const msg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role,
        content,
        type: type || 'text',
      }
      setMessages((prev) => [...prev, msg])
      return msg
    },
    [setMessages]
  )

  // Step1: PDFアップロード
  const handleFileUpload = useCallback(
    (fileName: string, base64: string) => {
      setPlanFileName(fileName)
      setPlanFileData(base64)
      addMessage('user', `📄 ${fileName}`, 'file')
      setTimeout(() => {
        addMessage(
          'ai',
          `「${fileName}」を受け取りました。\n\n次に、公募要領のURLを入力してください。\n（例: https://www.chusho.meti.go.jp/...）`
        )
        setStep(2)
      }, 500)
    },
    [setPlanFileName, setPlanFileData, addMessage, setStep]
  )

  // Step2: URL送信 → AI分析
  const handleUrlSubmit = useCallback(
    async (url: string) => {
      setGuidelinesUrl(url)
      addMessage('user', `🔗 ${url}`, 'url')
      setStep(3)

      setTimeout(() => {
        addMessage('ai', '計画書PDFと公募要領を分析して、やることリストを生成しています...\nしばらくお待ちください。', 'text')
      }, 300)

      setIsAnalyzing(true)

      try {
        const analysisResult = await analyzeSubsidyPlan(planFileData, url)
        setIsAnalyzing(false)

        if (analysisResult.success && analysisResult.tasks) {
          setResult(analysisResult)
          addMessage(
            'ai',
            `やることリストが完成しました！\n${analysisResult.tasks.length}件のタスクを生成しました。\n\n下のテーブルで内容をご確認ください。`
          )
        } else {
          addMessage('ai', analysisResult.error || 'エラーが発生しました。リセットして再度お試しください。', 'error')
        }
      } catch {
        setIsAnalyzing(false)
        addMessage('ai', 'エラーが発生しました。ネットワーク接続を確認のうえ、リセットして再度お試しください。', 'error')
      }
    },
    [setGuidelinesUrl, addMessage, setStep, planFileData, setResult]
  )

  if (!ready) {
    return <SplashScreen theme={THEME} systemName="補助金やることリスト生成AI" subtitle="AIが採択後のタスクを自動生成" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      {/* ヘッダー */}
      <MockHeader>
        <MockHeaderTitle
          icon={ClipboardList}
          title="補助金やることリスト"
          subtitle="AI タスク自動生成"
          theme={THEME}
        />
        <ResetButton storageKeys={STORAGE_KEYS} theme={THEME} />
      </MockHeader>

      {/* ステップインジケーター */}
      <StepIndicator currentStep={step} />

      {/* チャットエリア */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="py-4 space-y-0">
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
          {isAnalyzing && (
            <ChatBubble
              message={{ id: 'loading', role: 'ai', content: '', type: 'loading' }}
            />
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* タスク結果テーブル */}
      {result?.tasks && result.tasks.length > 0 && (
        <div className="max-w-5xl mx-auto mb-8">
          <TaskResultTable tasks={result.tasks} />
        </div>
      )}

      {/* 入力エリア */}
      <div className="max-w-2xl mx-auto">
        {step === 1 && <FileUploadZone onUpload={handleFileUpload} />}
        {step === 2 && <UrlInputForm onSubmit={handleUrlSubmit} />}
      </div>
    </div>
  )
}
