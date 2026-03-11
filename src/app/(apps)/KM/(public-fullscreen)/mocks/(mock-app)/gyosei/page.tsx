'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Upload,
  Calendar,
  Sparkles,
  CheckCircle2,
  FileUp,
  X,
  Info,
  ChevronLeft,
  ChevronRight,
  FileText,
  ListChecks,
  BookOpen,
  Check,
  AlertTriangle,
  Printer,
  RotateCcw,
  Plus,
  Mail,
  FileSpreadsheet,
  Loader2,
} from 'lucide-react'
import {
  SplashScreen,
  usePersistedState,
  type ThemeColor,
} from '../../_components'
import {
  createGyoseiSession,
  getGyoseiSession,
  uploadGyoseiFile,
  removeGyoseiFile,
  analyzeSubsidyPlanII,
  updateGyoseiStep3,
  sendExcelByEmail,
  type TaskItem,
  type AnalysisResult,
  type GrantStatus,
} from './_actions'

// ===== 定数 =====

const THEME: ThemeColor = 'blue'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const STORAGE_KEYS = {
  AGREED: 'gyosei2-agreed',
  SESSION_UUID: 'gyosei2-session-uuid',
}

type FileSlot = { name: string; blobUrl: string; fileId: number }
const EMPTY_FILE: FileSlot = { name: '', blobUrl: '', fileId: 0 }

// 交付申請の状況選択肢
const GRANT_STATUS_OPTIONS: { value: GrantStatus; label: string; description: string; color: string; icon: typeof CheckCircle2 }[] = [
  {
    value: 'not-applied',
    label: '未申請',
    description: '採択通知は受けたが、まだ交付申請を行っていない',
    color: 'amber',
    icon: AlertTriangle,
  },
  {
    value: 'applied',
    label: '申請済み',
    description: '交付申請を提出済みだが、まだ交付決定が出ていない',
    color: 'blue',
    icon: Info,
  },
  {
    value: 'decided',
    label: '交付決定済み',
    description: '交付決定通知書を受け取っている',
    color: 'emerald',
    icon: CheckCircle2,
  },
]

// ===== ステップインジケーター =====

const STEPS = [
  { num: 1, label: '計画書アップロード', icon: Upload },
  { num: 2, label: '公募要領PDF', icon: FileText },
  { num: 3, label: '採択・交付情報', icon: Calendar },
  { num: 4, label: 'AI分析', icon: Sparkles },
]

const StepIndicator = ({ currentStep }: { currentStep: number }) => (
  <div className="flex items-center justify-center gap-1 sm:gap-2 py-6 px-4">
    {STEPS.map((step, idx) => {
      const Icon = step.icon
      const isActive = currentStep === step.num
      const isComplete = currentStep > step.num
      return (
        <React.Fragment key={step.num}>
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : isComplete
                    ? 'bg-blue-500 text-white'
                    : 'border-2 border-gray-300 text-gray-400'
              }`}
            >
              {isComplete ? <CheckCircle2 size={20} /> : <Icon size={18} />}
            </div>
            <span
              className={`text-[10px] sm:text-xs font-medium text-center leading-tight ${
                isActive ? 'text-blue-700' : isComplete ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              {step.label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div
              className={`w-6 sm:w-12 h-0.5 mt-[-18px] sm:mt-[-16px] ${
                isComplete ? 'bg-blue-400' : 'bg-gray-200'
              }`}
            />
          )}
        </React.Fragment>
      )
    })}
  </div>
)

// ===== PDFファイルアップロードゾーン =====

const PdfUploadZone = ({
  label,
  required,
  file,
  onUpload,
  onRemove,
  dashed = false,
  uploading = false,
}: {
  label: string
  required: boolean
  file: FileSlot
  onUpload: (f: File) => void
  onRemove: () => void
  dashed?: boolean
  uploading?: boolean
}) => {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(
    (f: File) => {
      if (f.type !== 'application/pdf') {
        alert('PDFファイルを選択してください。')
        return
      }
      if (f.size > MAX_FILE_SIZE) {
        alert('ファイルサイズが5MBを超えています。')
        return
      }
      onUpload(f)
    },
    [onUpload]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const f = e.dataTransfer.files[0]
      if (f) processFile(f)
    },
    [processFile]
  )

  if (uploading) {
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <Loader2 size={20} className="text-blue-500 shrink-0 animate-spin" />
          <span className="text-sm text-blue-700">アップロード中...</span>
        </div>
      </div>
    )
  }

  if (file.name) {
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {required ? (
            <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded font-medium">必須</span>
          ) : (
            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium">任意</span>
          )}
        </div>
        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <FileText size={20} className="text-blue-500 shrink-0" />
          <span className="text-sm text-blue-700 flex-1 truncate">{file.name}</span>
          <button
            onClick={onRemove}
            className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <X size={16} className="text-blue-400" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {required ? (
          <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded font-medium">必須</span>
        ) : (
          <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium">任意</span>
        )}
      </div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`rounded-xl p-6 text-center cursor-pointer transition-all ${
          dashed ? 'border-2 border-dashed' : 'border-2'
        } ${
          dragging
            ? 'border-blue-400 bg-blue-50'
            : dashed
              ? 'border-blue-300 hover:border-blue-400 hover:bg-blue-50/50'
              : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50/50'
        }`}
      >
        <FileUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">クリックまたはドラッグ＆ドロップ（PDF）</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) processFile(f)
            if (inputRef.current) inputRef.current.value = ''
          }}
        />
      </div>
    </div>
  )
}

// ===== プログレスステップ =====

const PROGRESS_STEPS = [
  { label: '計画書を読み込んでいます...', icon: FileText },
  { label: '公募要領を分析しています...', icon: FileText },
  { label: '実績報告期限を確認しています...', icon: Calendar },
  { label: 'やることリストを生成しています...', icon: ListChecks },
  { label: '実績報告ガイドを作成しています...', icon: BookOpen },
]

// ===== 結果表示: カテゴリ色 =====

const CATEGORY_COLORS: Record<string, string> = {
  '交付申請': 'bg-blue-100 text-blue-700',
  '経費管理': 'bg-amber-100 text-amber-700',
  '中間報告': 'bg-violet-100 text-violet-700',
  '実績報告': 'bg-emerald-100 text-emerald-700',
  'その他': 'bg-gray-100 text-gray-600',
}

const PRIORITY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  high: { bg: 'bg-red-50', text: 'text-red-600', label: '高' },
  medium: { bg: 'bg-yellow-50', text: 'text-yellow-600', label: '中' },
  low: { bg: 'bg-green-50', text: 'text-green-600', label: '低' },
}

// ===== 利用規約テキスト =====

const TERMS_TEXT = `保利国際法務事務所（以下「当事務所」といいます）が提供する「AI行政書士君Ⅱ」（以下「本ツール」といいます）をご利用いただくにあたり、以下の事項およびプライバシーポリシーを必ずお読みいただき、ご同意のうえでご利用ください。

第1条（利用条件および免責事項）
本ツールをご利用になるユーザーは、以下の事項を十分に理解し、同意するものとします。

■ 機密情報の取り扱いについて（マスキングのお願い）
入力するデータに、顧客の個人情報や企業の営業秘密などの機密情報が含まれる場合は、ユーザーご自身の責任において、必ず事前にマスキング（匿名化・伏せ字化等）を行ったうえで送信してください。

■ AIの特性と予期せぬ動作について
本ツールはAI（人工知能）技術を利用して回答を生成しているため、常に正確な回答を保証するものではなく、予期せぬ動作や事実と異なる内容を出力する可能性があります。

■ 成果物の確認の義務
本ツールによって生成された情報（ダウンロードしたPDFを含む）は、あくまで参考情報としてご活用ください。実際の業務や公的な手続き等に用いる場合は、必ずユーザーご自身で専門的な見地から内容の正確性や妥当性を確認してください。

■ データの利用について
ユーザーが本ツールに入力・送信したデータは、本ツールおよび当事務所が提供するサービスの品質向上の目的で利用される場合があります。

■ 免責事項・損害賠償請求の放棄
本ツールおよび生成された成果物を利用したことによって、ユーザーまたは第三者に何らかの不利益や損害が発生した場合であっても、当事務所は一切の責任を負いません。万が一損害が生じた場合は、すべてユーザーの自己責任において解決するものとし、当事務所に対して一切の損害賠償請求を行わないことに同意するものとします。

第2条（プライバシーポリシー）
当事務所は、当事務所が取得した個人情報の取扱いに関し、個人情報の保護に関する法律、個人情報保護に関するガイドライン等の指針、その他個人情報保護に関する関係法令を遵守します。

1．取得する情報およびその取得方法、利用目的
当事務所が取得するユーザー情報は、取得方法に応じて以下のとおりとなります。

（1）ユーザーから直接取得する情報と取得方法
当事務所は、当事務所が提供するインターネットサイト（以下「本サイト」といいます）の運営に必要な範囲で、本サイトの利用者（以下「ユーザー」といいます）から、個人情報保護法にいう「個人情報」を指すものとし、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日、住所、電話番号、連絡先その他の記述等により特定の個人を識別できる情報及び容貌、指紋、声紋にかかるデータ、及び健康保険証の保険者番号などの当該情報単体から特定の個人を識別できる情報（個人識別情報）（以下「個人情報」といいます）を取得することがあります。

（2）情報の利用目的
当事務所は、取得した個人情報を以下に定める目的のために使用します。

2．個人情報の管理
当事務所は、ユーザーから取得した個人情報の管理について、以下を徹底します。

（1）情報の正確性の確保
取得した個人情報については、常に正確かつ最新の情報となるよう努めます。

（2）安全管理措置
当事務所は、組織的な個人情報の管理については、社内規定による厳重な取扱方法を規定し、規定に基づいた取扱いと厳格な運用を徹底しています。

（3）個人情報管理の委託先の監督
個人情報の管理を外部委託する場合には、当事務所の規程に基づく委託先にのみ委託し適切に管理します。

（4）個人情報の保存期間と廃棄
取得した個人情報は、保存期間を設定し、保存期間終了後は廃棄します。

3．個人情報の第三者への提供
当事務所は、取得した個人情報を、第三者に提供することはありません。また、今後、第三者提供を行う場合は、提供する情報と目的を提示し、ユーザーの同意を得た場合のみ行います。

4．個人情報の共同利用
当事務所は、ユーザーの個人情報に関して、以下のとおり共同利用します。

5．個人情報の開示・訂正・利用停止
個人情報について、開示、訂正、利用停止等のお申し出があった場合には、本人の申し出であることを確認の上、当事務所所定の方法に基づき対応致します。具体的な方法は、個別にご案内しますので、下記受付窓口までお問い合わせください。

6．お問い合わせ先
本サービス、個人情報の取扱いについては、以下の窓口にご連絡ください。
窓口：〒815-0037 福岡県福岡市南区玉川町13-3　050-5526-5506

7．セキュリティ
当事務所は、ウェブサイト経由で、SSLによって個人情報を取得することがあります。`

// ===== メインページ =====

export default function GyoseiIIPage() {
  const [ready, setReady] = useState(false)
  const [agreed, setAgreed] = usePersistedState<boolean>(STORAGE_KEYS.AGREED, false)
  const [sessionUuid, setSessionUuid] = usePersistedState<string>(STORAGE_KEYS.SESSION_UUID, '')
  const [step, setStep] = useState(1)
  const [planFiles, setPlanFiles] = useState<FileSlot[]>([{ ...EMPTY_FILE }])
  const [guidelinesFiles, setGuidelinesFiles] = useState<FileSlot[]>([{ ...EMPTY_FILE }])
  const [guideFiles, setGuideFiles] = useState<FileSlot[]>([{ ...EMPTY_FILE }, { ...EMPTY_FILE }])
  const [grantStatus, setGrantStatus] = useState<GrantStatus | null>(null)
  const [adoptionDate, setAdoptionDate] = useState('')
  const [grantDecisionDate, setGrantDecisionDate] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)

  // アップロード中状態
  const [uploadingIndex, setUploadingIndex] = useState<string | null>(null) // "plan-0", "guidelines-0" 等

  // 利用規約スクロール検知
  const [scrolledToBottom, setScrolledToBottom] = useState(false)
  const [termsChecked, setTermsChecked] = useState(false)
  const termsRef = useRef<HTMLDivElement>(null)

  // AI分析中
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progressStep, setProgressStep] = useState(0)

  // 結果表示: タブ切替
  const [resultTab, setResultTab] = useState<'tasks' | 'guide'>('tasks')

  // Excel配信
  const [showEmailInput, setShowEmailInput] = useState(false)
  const [email, setEmail] = useState('')
  const [emailConfirm, setEmailConfirm] = useState('')
  const [emailSending, setEmailSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [emailError, setEmailError] = useState('')

  // スプラッシュ
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 1200)
    return () => clearTimeout(timer)
  }, [])

  // DB復元: セッションUUIDが存在する場合、DBからデータを復元
  useEffect(() => {
    if (!sessionUuid) return
    const restore = async () => {
      const session = await getGyoseiSession(sessionUuid)
      if (!session) {
        setSessionUuid('')
        return
      }

      // ファイル復元
      const plans = session.GyoseiFile.filter(f => f.fileType === 'plan')
      const guidelines = session.GyoseiFile.filter(f => f.fileType === 'guidelines')
      const guides = session.GyoseiFile.filter(f => f.fileType === 'guide')

      if (plans.length > 0) {
        setPlanFiles(plans.map(f => ({ name: f.fileName, blobUrl: f.blobUrl, fileId: f.id })))
      }
      if (guidelines.length > 0) {
        setGuidelinesFiles(guidelines.map(f => ({ name: f.fileName, blobUrl: f.blobUrl, fileId: f.id })))
      }
      if (guides.length > 0) {
        const restored = guides.map(f => ({ name: f.fileName, blobUrl: f.blobUrl, fileId: f.id }))
        // 手引きは2スロット確保
        while (restored.length < 2) restored.push({ ...EMPTY_FILE })
        setGuideFiles(restored)
      }

      // STEP3情報復元
      if (session.grantStatus) {
        setGrantStatus(session.grantStatus as GrantStatus)
        setAdoptionDate(session.adoptionDate || '')
        setGrantDecisionDate(session.grantDecisionDate || '')
      }

      // 分析結果復元
      if (session.status === 'completed' && session.analysisResult) {
        const ar = session.analysisResult as { tasks: TaskItem[]; reportGuide: string }
        setResult({ success: true, tasks: ar.tasks, reportGuide: ar.reportGuide })
        setStep(5)
      } else if (plans.length > 0 && guidelines.length > 0 && session.grantStatus) {
        setStep(4) // STEP3まで入力済み → STEP4から
      } else if (plans.length > 0 && guidelines.length > 0) {
        setStep(3)
      } else if (plans.length > 0) {
        setStep(2)
      }
    }
    restore()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 利用規約スクロール検知
  const handleTermsScroll = useCallback(() => {
    const el = termsRef.current
    if (!el) return
    const isBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 20
    if (isBottom) setScrolledToBottom(true)
  }, [])

  // セッション確保ヘルパー
  const ensureSession = useCallback(async (): Promise<string> => {
    if (sessionUuid) return sessionUuid
    const uuid = await createGyoseiSession()
    setSessionUuid(uuid)
    return uuid
  }, [sessionUuid, setSessionUuid])

  // ファイルアップロード共通ヘルパー
  const handleFileUpload = useCallback(
    async (file: File, fileType: string, index: number) => {
      const key = `${fileType}-${index}`
      setUploadingIndex(key)
      try {
        const uuid = await ensureSession()
        const formData = new FormData()
        formData.append('file', file)
        formData.append('sessionUuid', uuid)
        formData.append('fileType', fileType)
        formData.append('sortOrder', String(index))

        const result = await uploadGyoseiFile(formData)
        const newFile: FileSlot = { name: result.name, blobUrl: result.blobUrl, fileId: result.fileId }

        if (fileType === 'plan') {
          setPlanFiles(prev => prev.map((f, i) => (i === index ? newFile : f)))
        } else if (fileType === 'guidelines') {
          setGuidelinesFiles(prev => prev.map((f, i) => (i === index ? newFile : f)))
        } else if (fileType === 'guide') {
          setGuideFiles(prev => prev.map((f, i) => (i === index ? newFile : f)))
        }
      } catch (e) {
        console.error('アップロードエラー:', e)
        alert('ファイルのアップロードに失敗しました。もう一度お試しください。')
      } finally {
        setUploadingIndex(null)
      }
    },
    [ensureSession]
  )

  // ファイル削除共通ヘルパー
  const handleFileRemove = useCallback(
    async (fileType: string, index: number, fileSlot: FileSlot) => {
      if (fileSlot.fileId) {
        try {
          await removeGyoseiFile(fileSlot.fileId, fileSlot.blobUrl)
        } catch (e) {
          console.error('ファイル削除エラー:', e)
        }
      }
      if (fileType === 'plan') {
        setPlanFiles(prev => prev.map((f, i) => (i === index ? { ...EMPTY_FILE } : f)))
      } else if (fileType === 'guidelines') {
        setGuidelinesFiles(prev => prev.map((f, i) => (i === index ? { ...EMPTY_FILE } : f)))
      } else if (fileType === 'guide') {
        setGuideFiles(prev => prev.map((f, i) => (i === index ? { ...EMPTY_FILE } : f)))
      }
    },
    []
  )

  // planFile追加ヘルパー
  const addPlanFile = useCallback(() => {
    setPlanFiles((prev) => [...prev, { ...EMPTY_FILE }])
  }, [])

  // planFile削除ヘルパー（2番目以降のスロットのみ）
  const removePlanFileSlot = useCallback(
    (index: number) => {
      setPlanFiles((prev) => prev.filter((_, i) => i !== index))
    },
    []
  )

  // STEP1バリデーション: メインの計画書（1つ目）が必須
  const isStep1Valid = planFiles[0].name !== ''

  // STEP2バリデーション: 公募要領PDF（1つ目）が必須
  const isStep2Valid = guidelinesFiles[0].name !== ''

  // STEP3バリデーション
  const isStep3Valid = grantStatus !== null

  // デモモード: ダミーデータで次のステップに進む
  const handleDemoStep1 = useCallback(() => {
    setPlanFiles([{ name: '【デモ】事業計画書.pdf', blobUrl: 'demo', fileId: 0 }])
    setStep(2)
  }, [])

  const handleDemoStep2 = useCallback(() => {
    setGuidelinesFiles([{ name: '【デモ】公募要領.pdf', blobUrl: 'demo', fileId: 0 }])
    setStep(3)
  }, [])

  // デモモード判定
  const isDemoMode = planFiles[0]?.blobUrl === 'demo' || guidelinesFiles[0]?.blobUrl === 'demo'

  // AI分析実行
  const handleAnalyze = useCallback(async () => {
    setStep(4)
    setIsAnalyzing(true)
    setProgressStep(0)

    // STEP3データをDB保存（デモモード以外）
    if (!isDemoMode && sessionUuid && grantStatus) {
      await updateGyoseiStep3(sessionUuid, {
        grantStatus,
        adoptionDate: adoptionDate || undefined,
        grantDecisionDate: grantDecisionDate || undefined,
      })
    }

    // 擬似プログレス演出
    const intervals = isDemoMode ? [500, 1000, 1500, 2000] : [2000, 3000, 4000, 5000]
    intervals.forEach((delay, idx) => {
      setTimeout(() => setProgressStep(idx + 1), delay)
    })

    // デモモードの場合はモック結果を使う
    if (isDemoMode) {
      const demoResult: AnalysisResult = {
        success: true,
        tasks: [
          { priority: 'high', category: '交付申請', task: '交付申請書の作成・提出', deadline: '採択通知受領後30日以内', responsible: '事業者', notes: '事務局指定フォーマットで作成' },
          { priority: 'high', category: '交付申請', task: '経費明細書の作成', deadline: '交付申請と同時', responsible: '事業者', notes: '見積書を添付' },
          { priority: 'high', category: '経費管理', task: '補助対象経費の証憑書類整理ルール策定', deadline: '交付決定後すぐ', responsible: '経理担当', notes: '領収書・請求書・振込明細を一元管理' },
          { priority: 'high', category: '経費管理', task: '専用口座（または経理区分）の設定', deadline: '交付決定後すぐ', responsible: '経理担当', notes: '補助金専用の入出金管理を推奨' },
          { priority: 'medium', category: '経費管理', task: '相見積もり取得（50万円以上の発注）', deadline: '発注前', responsible: '事業者', notes: '原則2社以上から見積取得' },
          { priority: 'medium', category: '経費管理', task: '発注書・契約書の締結', deadline: '事業実施前', responsible: '事業者', notes: '交付決定日以降の日付であること' },
          { priority: 'medium', category: '中間報告', task: '遂行状況報告書の作成・提出', deadline: '事務局指定期日', responsible: '事業者', notes: '求められた場合のみ' },
          { priority: 'medium', category: '中間報告', task: '計画変更申請（必要な場合）', deadline: '変更が生じた時点で速やかに', responsible: '事業者', notes: '経費の流用・事業内容変更時' },
          { priority: 'high', category: '実績報告', task: '実績報告書の作成', deadline: '事業完了後30日以内または補助事業期間終了日', responsible: '事業者', notes: '早い方の日付が期限' },
          { priority: 'high', category: '実績報告', task: '経費エビデンスの最終チェック・整理', deadline: '実績報告前', responsible: '経理担当', notes: '支払証憑・成果物の写真等' },
          { priority: 'medium', category: '実績報告', task: '成果物・導入設備の写真撮影', deadline: '事業完了時', responsible: '事業者', notes: '導入前後の比較写真も有効' },
          { priority: 'low', category: 'その他', task: '確定検査への対応準備', deadline: '実績報告後', responsible: '事業者', notes: '書類の原本保管（5年間）' },
          { priority: 'low', category: 'その他', task: '事業化状況報告の準備', deadline: '補助事業終了後5年間', responsible: '事業者', notes: '毎年度の報告義務あり' },
        ],
        reportGuide: `## 実績報告ガイド（デモ）

### 1. 実績報告とは
補助事業が完了した後、事業の成果と経費の使途を事務局に報告する手続きです。

### 2. 提出期限
- 補助事業の完了日から**30日以内**
- または**補助事業期間の終了日**のいずれか早い方

### 3. 必要書類
- 実績報告書（事務局指定フォーマット）
- 経費エビデンス一式（領収書、請求書、振込明細書等）
- 成果物の写真・スクリーンショット
- その他事務局が指定する書類

### 4. 注意事項
- **交付決定日より前の支出は補助対象外**です
- 経費の支払いは原則として**銀行振込**で行ってください
- 見積書・発注書・納品書・請求書・支払証明の**5点セット**を揃えましょう
- 書類の原本は**5年間保管**が義務付けられています`,
      }
      setTimeout(() => {
        setProgressStep(4)
        setTimeout(() => {
          setIsAnalyzing(false)
          setResult(demoResult)
          setStep(5)
        }, 800)
      }, intervals[intervals.length - 1])
      return
    }

    try {
      const analysisResult = await analyzeSubsidyPlanII({ sessionUuid })
      setProgressStep(4)
      setTimeout(() => {
        setIsAnalyzing(false)
        setResult(analysisResult)
        setStep(5)
      }, 1500)
    } catch {
      setIsAnalyzing(false)
      setResult({
        success: false,
        error: 'エラーが発生しました。ネットワーク接続を確認のうえ、再度お試しください。',
      })
      setStep(5)
    }
  }, [
    sessionUuid,
    grantStatus,
    adoptionDate,
    grantDecisionDate,
    isDemoMode,
  ])

  // Excel配信
  const handleSendExcel = useCallback(async () => {
    setEmailError('')

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('有効なメールアドレスを入力してください。')
      return
    }
    if (email !== emailConfirm) {
      setEmailError('メールアドレスが一致しません。')
      return
    }

    // デモモードの場合はモック送信
    if (isDemoMode || !sessionUuid) {
      setEmailSent(true)
      setTimeout(() => {
        setShowEmailInput(false)
        setEmailSent(false)
        setEmail('')
        setEmailConfirm('')
      }, 3000)
      return
    }

    setEmailSending(true)
    try {
      const result = await sendExcelByEmail(sessionUuid, email)
      if (result.success) {
        setEmailSent(true)
        setTimeout(() => {
          setShowEmailInput(false)
          setEmailSent(false)
          setEmail('')
          setEmailConfirm('')
        }, 3000)
      } else {
        setEmailError(result.message)
      }
    } catch {
      setEmailError('送信中にエラーが発生しました。')
    } finally {
      setEmailSending(false)
    }
  }, [email, emailConfirm, isDemoMode, sessionUuid])

  // リセット
  const handleReset = useCallback(() => {
    if (!window.confirm('データを初期状態に戻しますか？')) return
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key))
    window.location.reload()
  }, [])

  // スプラッシュ
  if (!ready) {
    return (
      <SplashScreen
        theme={THEME}
        systemName="AI行政書士君 II"
        subtitle="補助金採択後やることリスト作成ツール"
      />
    )
  }

  // ===== 利用規約画面 =====
  if (!agreed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50">
        <Header />

        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* タイトル */}
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <FileText size={20} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">利用規約・プライバシーポリシー</h2>
                  <p className="text-xs text-gray-500">ご利用前に必ずお読みください</p>
                </div>
              </div>
            </div>

            {/* スクロールエリア */}
            <div
              ref={termsRef}
              onScroll={handleTermsScroll}
              className="px-6 py-4 max-h-[400px] overflow-y-auto text-sm text-gray-700 leading-relaxed whitespace-pre-wrap"
            >
              {TERMS_TEXT}
            </div>

            {/* 緑バナー */}
            {scrolledToBottom && (
              <div className="mx-6 mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 flex items-start gap-2">
                <Check size={18} className="shrink-0 mt-0.5" />
                <span>
                  最後まで読んでいただきありがとうございました。問題なければ下のチェックボックスにチェックして同意してください。
                </span>
              </div>
            )}

            {/* チェックボックス + ボタン */}
            <div className="px-6 py-5 border-t border-gray-100 space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsChecked}
                  onChange={(e) => setTermsChecked(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 leading-relaxed">
                  私は、上記の「利用条件および免責事項」ならびに「プライバシーポリシー」のすべての内容を理解し、これらに同意したうえで「AI行政書士君
                  II」を利用します。
                </span>
              </label>
              <button
                onClick={() => setAgreed(true)}
                disabled={!termsChecked}
                className="w-full py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                同意して利用を開始する
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ===== AI分析中画面 =====
  if (isAnalyzing && step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50">
        <Header onReset={handleReset} />

        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4">
          {/* AIアイコン */}
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-sky-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 animate-pulse">
            <Sparkles size={36} className="text-white" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">AIが分析中です...</h2>
          <p className="text-sm text-gray-500 text-center max-w-md mb-10 leading-relaxed">
            計画書と公募要領を読み込み、お客様の状況に合わせたやることリストを作成しています。
            <br />
            しばらくお待ちください（30秒〜1分程度）
          </p>

          {/* プログレスステップ */}
          <div className="w-full max-w-md space-y-3">
            {PROGRESS_STEPS.map((ps, idx) => {
              const Icon = ps.icon
              const isComplete = progressStep > idx
              const isCurrent = progressStep === idx
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isCurrent
                      ? 'bg-blue-50 border border-blue-200'
                      : isComplete
                        ? 'bg-white'
                        : 'bg-white opacity-50'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isComplete
                        ? 'bg-blue-500 text-white'
                        : isCurrent
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <span
                    className={`text-sm flex-1 ${
                      isCurrent ? 'text-blue-700 font-medium' : isComplete ? 'text-gray-700' : 'text-gray-400'
                    }`}
                  >
                    {ps.label}
                  </span>
                  {isComplete && <CheckCircle2 size={18} className="text-blue-500 shrink-0" />}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ===== 結果表示画面 =====
  if (step === 5 && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50">
        <Header onReset={handleReset} />

        <div className="max-w-5xl mx-auto px-4 py-8">
          {!result.success ? (
            // エラー表示
            <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 text-center">
              <AlertTriangle size={48} className="text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">分析に失敗しました</h2>
              <p className="text-sm text-gray-500 mb-6">{result.error}</p>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                最初からやり直す
              </button>
            </div>
          ) : (
            <>
              {/* タブ切替 */}
              <div className="flex items-center gap-2 mb-6 flex-wrap">
                <button
                  onClick={() => setResultTab('tasks')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    resultTab === 'tasks'
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <ListChecks size={16} />
                  やることリスト
                  {result.tasks && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        resultTab === 'tasks' ? 'bg-white/20' : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      {result.tasks.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setResultTab('guide')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    resultTab === 'guide'
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <BookOpen size={16} />
                  実績報告ガイド
                </button>

                <div className="flex-1" />

                {/* Excelで受け取るボタン */}
                <button
                  onClick={() => setShowEmailInput(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm"
                >
                  <FileSpreadsheet size={16} />
                  <span className="hidden sm:inline">Excelで受け取る</span>
                </button>

                {/* 印刷ボタン */}
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-600 border border-gray-200 rounded-xl text-sm font-medium hover:border-blue-300 transition-colors"
                >
                  <Printer size={16} />
                  <span className="hidden sm:inline">印刷</span>
                </button>

                {/* やり直しボタン */}
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-600 border border-gray-200 rounded-xl text-sm font-medium hover:border-red-300 transition-colors"
                >
                  <RotateCcw size={16} />
                  <span className="hidden sm:inline">最初から</span>
                </button>
              </div>

              {/* Excel配信モーダル */}
              {showEmailInput && (
                <div className="mb-6 bg-white rounded-2xl shadow-sm border border-emerald-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-emerald-100 rounded-xl">
                      <FileSpreadsheet size={20} className="text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-800">Excelファイルをメールで受け取る</h3>
                      <p className="text-xs text-gray-500">
                        やることリストをExcelファイルにまとめてお送りします
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowEmailInput(false)
                        setEmailSent(false)
                        setEmail('')
                        setEmailConfirm('')
                        setEmailError('')
                      }}
                      className="ml-auto p-1 hover:bg-gray-100 rounded-lg"
                    >
                      <X size={16} className="text-gray-400" />
                    </button>
                  </div>

                  {emailSent ? (
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <CheckCircle2 size={20} className="text-emerald-500" />
                      <span className="text-sm text-emerald-700 font-medium">
                        送信しました！メールをご確認ください。
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
                          placeholder="メールアドレスを入力"
                          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                        />
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          value={emailConfirm}
                          onChange={(e) => { setEmailConfirm(e.target.value); setEmailError('') }}
                          placeholder="メールアドレスを再入力（確認用）"
                          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSendExcel()
                          }}
                        />
                      </div>
                      {emailError && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertTriangle size={14} />
                          {emailError}
                        </p>
                      )}
                      <button
                        onClick={handleSendExcel}
                        disabled={emailSending}
                        className="w-full py-2.5 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-colors text-sm flex items-center justify-center gap-2"
                      >
                        {emailSending ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            送信中...
                          </>
                        ) : (
                          '送信する'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* やることリストタブ */}
              {resultTab === 'tasks' && result.tasks && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-gray-500 text-xs w-20">
                            優先度
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-500 text-xs w-24">
                            カテゴリ
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-500 text-xs">
                            タスク
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-500 text-xs w-40">
                            期限
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-500 text-xs w-24">
                            担当
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-500 text-xs w-44">
                            備考
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {result.tasks.map((task, idx) => {
                          const pStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium
                          return (
                            <tr key={idx} className={`hover:bg-gray-50/50 ${pStyle.bg}`}>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${pStyle.text} ${pStyle.bg} border ${
                                    task.priority === 'high'
                                      ? 'border-red-200'
                                      : task.priority === 'medium'
                                        ? 'border-yellow-200'
                                        : 'border-green-200'
                                  }`}
                                >
                                  {pStyle.label}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                                    CATEGORY_COLORS[task.category] || CATEGORY_COLORS['その他']
                                  }`}
                                >
                                  {task.category}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-800">{task.task}</td>
                              <td className="px-4 py-3 text-gray-500 text-xs">{task.deadline}</td>
                              <td className="px-4 py-3 text-gray-600 text-xs font-medium">
                                {task.responsible}
                              </td>
                              <td className="px-4 py-3 text-gray-400 text-xs">{task.notes}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 実績報告ガイドタブ */}
              {resultTab === 'guide' && result.reportGuide && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                  <div className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-gray-800">
                    <MarkdownRenderer text={result.reportGuide} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  // ===== ステップウィザード画面 (STEP 1〜3) =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50">
      <Header onReset={handleReset} />
      <StepIndicator currentStep={step} />

      <div className="max-w-2xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* ===== STEP 1: 計画書アップロード ===== */}
          {step === 1 && (
            <div className="p-6">
              <h2 className="text-lg font-bold text-blue-600 mb-2">
                STEP 1：計画書をアップロード
              </h2>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                補助金申請時に提出した計画書（事業計画書）を添付してください。複数ファイルに分かれている場合は、「追加」ボタンでファイル欄を増やせます。AIが内容を読み込み、個別の状況に合わせた対応リストを作成します。
              </p>

              {/* メインファイル（1つ目は必須・削除不可） */}
              <PdfUploadZone
                label="計画書（メインファイル）"
                required
                file={planFiles[0]}
                onUpload={(f) => handleFileUpload(f, 'plan', 0)}
                onRemove={() => handleFileRemove('plan', 0, planFiles[0])}
                uploading={uploadingIndex === 'plan-0'}
              />

              {/* 追加ファイル（動的） */}
              {planFiles.slice(1).map((file, idx) => (
                <div key={idx + 1} className="relative">
                  <PdfUploadZone
                    label={`計画書（追加ファイル${idx + 1}）`}
                    required={false}
                    file={file}
                    onUpload={(f) => handleFileUpload(f, 'plan', idx + 1)}
                    onRemove={() => handleFileRemove('plan', idx + 1, file)}
                    dashed
                    uploading={uploadingIndex === `plan-${idx + 1}`}
                  />
                  {/* スロット削除ボタン（ファイル未選択時のみ） */}
                  {!file.name && planFiles.length > 1 && (
                    <button
                      onClick={() => removePlanFileSlot(idx + 1)}
                      className="absolute top-0 right-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="この欄を削除"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}

              {/* 追加ボタン */}
              <button
                onClick={addPlanFile}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors mb-2"
              >
                <Plus size={16} />
                追加ファイル欄を増やす
              </button>

              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={handleDemoStep1}
                  className="flex items-center gap-2 px-4 py-2.5 text-blue-500 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors text-sm"
                >
                  <Sparkles size={16} />
                  デモデータで次へ
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!isStep1Valid}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  次へ進む
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ===== STEP 2: 公募要領PDFアップロード ===== */}
          {step === 2 && (
            <div className="p-6">
              <h2 className="text-lg font-bold text-blue-600 mb-2">
                STEP 2：公募要領・手引の添付
              </h2>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                採択された補助金の公募要領PDFをアップロードしてください（必須）。また、実績報告や交付申請の手引PDFがある場合もアップロードしてください。AIの精度が向上します。
              </p>

              {/* 公募要領PDF（必須） */}
              <PdfUploadZone
                label="公募要領PDF"
                required
                file={guidelinesFiles[0]}
                onUpload={(f) => handleFileUpload(f, 'guidelines', 0)}
                onRemove={() => handleFileRemove('guidelines', 0, guidelinesFiles[0])}
                uploading={uploadingIndex === 'guidelines-0'}
              />

              {/* ヒントボックス */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="flex items-start gap-2">
                  <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">公募要領のPDFはどこで入手できますか？</p>
                    <ul className="text-xs text-blue-600 space-y-0.5 list-disc list-inside">
                      <li>採択された補助金の事務局サイトからダウンロード</li>
                      <li>e-Gov、j-Grants等の電子申請サイトからダウンロード</li>
                      <li>申請時に保存したPDFファイル</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 手引きPDF */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-1">手引きPDFの添付（任意）</p>
                <p className="text-xs text-gray-400 mb-3">
                  採択直後はまだ公開されていない場合があります。取得できている場合はアップロードしてください。AIの回答精度が向上します。
                </p>

                <PdfUploadZone
                  label="実績報告の手引"
                  required={false}
                  file={guideFiles[0]}
                  onUpload={(f) => handleFileUpload(f, 'guide', 0)}
                  onRemove={() => handleFileRemove('guide', 0, guideFiles[0])}
                  uploading={uploadingIndex === 'guide-0'}
                />
                <PdfUploadZone
                  label="交付申請の手引"
                  required={false}
                  file={guideFiles[1]}
                  onUpload={(f) => handleFileUpload(f, 'guide', 1)}
                  onRemove={() => handleFileRemove('guide', 1, guideFiles[1])}
                  uploading={uploadingIndex === 'guide-1'}
                />
              </div>

              {/* ナビゲーション */}
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ChevronLeft size={18} />
                  戻る
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDemoStep2}
                    className="flex items-center gap-2 px-4 py-2.5 text-blue-500 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors text-sm"
                  >
                    <Sparkles size={16} />
                    デモデータで次へ
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!isStep2Valid}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    次へ進む
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===== STEP 3: 採択・交付決定の状況 ===== */}
          {step === 3 && (
            <div className="p-6">
              <h2 className="text-lg font-bold text-blue-600 mb-2">
                STEP 3：採択・交付決定の状況を教えてください
              </h2>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                日付情報をもとに、対応期限を具体的な日付で算出します。採択日や交付決定日が分かる書類（採択通知書・交付決定通知書）をご確認ください。
              </p>

              {/* 交付申請の状況（3値セレクト） */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">交付申請の状況</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {GRANT_STATUS_OPTIONS.map((option) => {
                    const Icon = option.icon
                    const isSelected = grantStatus === option.value
                    const colorMap: Record<string, { border: string; bg: string; icon: string }> = {
                      amber: { border: 'border-amber-400', bg: 'bg-amber-50', icon: 'text-amber-500' },
                      blue: { border: 'border-blue-400', bg: 'bg-blue-50', icon: 'text-blue-500' },
                      emerald: { border: 'border-emerald-400', bg: 'bg-emerald-50', icon: 'text-emerald-500' },
                    }
                    const colors = colorMap[option.color]
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setGrantStatus(option.value)
                          if (option.value !== 'decided') setGrantDecisionDate('')
                        }}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? `${colors.border} ${colors.bg}`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon
                            size={20}
                            className={isSelected ? colors.icon : 'text-gray-400'}
                          />
                          <span className="font-medium text-gray-800 text-sm">{option.label}</span>
                        </div>
                        <p className="text-xs text-gray-500 ml-7">{option.description}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 日付入力フィールド */}
              {grantStatus !== null && (
                <div className="space-y-4">
                  {/* 採択日 */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                      <Calendar size={16} className="text-gray-400" />
                      採択日（採択通知書に記載の日付）
                    </label>
                    <input
                      type="date"
                      value={adoptionDate}
                      onChange={(e) => setAdoptionDate(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      不明な場合は空欄でも構いません（期限が概算になります）
                    </p>
                  </div>

                  {/* 交付決定日（「交付決定済み」の場合のみ） */}
                  {grantStatus === 'decided' && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <label className="flex items-center gap-2 text-sm font-medium text-blue-700 mb-1.5">
                        <Calendar size={16} className="text-blue-500" />
                        交付決定日（交付決定通知書に記載の日付）
                      </label>
                      <input
                        type="date"
                        value={grantDecisionDate}
                        onChange={(e) => setGrantDecisionDate(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                      />
                      <p className="text-xs text-blue-500 mt-1">
                        交付決定日から補助対象期間が始まります。重要な基準日です。
                      </p>
                    </div>
                  )}

                  {/* 注意ボックス（「未申請」の場合） */}
                  {grantStatus === 'not-applied' && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex items-start gap-2">
                        <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-800 mb-1">
                            交付申請がまだの場合
                          </p>
                          <p className="text-xs text-amber-700 leading-relaxed">
                            採択されても、交付決定を受けるまでは補助対象経費の発注・契約・支出ができません。AIは交付申請に必要な手続きを優先的にリストアップします。
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 案内ボックス（「申請済み」の場合） */}
                  {grantStatus === 'applied' && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <div className="flex items-start gap-2">
                        <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-800 mb-1">
                            交付決定待ちの場合
                          </p>
                          <p className="text-xs text-blue-700 leading-relaxed">
                            交付決定が出るまでの間に準備できることをリストアップします。交付決定後にすぐ事業を開始できるよう、事前準備を進めましょう。
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ナビゲーション */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ChevronLeft size={18} />
                  戻る
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={!isStep3Valid}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Sparkles size={18} />
                  AIで分析する
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ===== ヘッダーコンポーネント =====

const Header = ({ onReset }: { onReset?: () => void }) => (
  <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <span className="text-white font-bold text-sm">AI</span>
        </div>
        <div>
          <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-sky-600">
            AI行政書士君 II
          </h1>
          <p className="text-[10px] text-gray-400 -mt-0.5">補助金採択後やることリスト作成ツール</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {onReset && (
          <button
            onClick={onReset}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="初期値に戻す"
          >
            <RotateCcw size={16} />
          </button>
        )}
        <span className="text-xs text-gray-500 hidden sm:inline">保利国際法務事務所</span>
      </div>
    </div>
  </header>
)

// ===== 簡易Markdownレンダラー =====

const MarkdownRenderer = ({ text }: { text: string }) => {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let listItems: string[] = []
  let listType: 'ul' | 'ol' | null = null

  const flushList = () => {
    if (listItems.length === 0) return
    const Tag = listType === 'ol' ? 'ol' : 'ul'
    const className = listType === 'ol' ? 'list-decimal list-inside space-y-1 mb-4' : 'list-disc list-inside space-y-1 mb-4'
    elements.push(
      <Tag key={`list-${elements.length}`} className={className}>
        {listItems.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </Tag>
    )
    listItems = []
    listType = null
  }

  const renderInline = (str: string): React.ReactNode => {
    const parts = str.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i}>{part.slice(1, -1)}</em>
      }
      return part
    })
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('### ')) {
      flushList()
      elements.push(
        <h4 key={i} className="text-base font-bold text-gray-800 mt-6 mb-2">
          {renderInline(line.slice(4))}
        </h4>
      )
    } else if (line.startsWith('## ')) {
      flushList()
      elements.push(
        <h3 key={i} className="text-lg font-bold text-gray-800 mt-6 mb-3">
          {renderInline(line.slice(3))}
        </h3>
      )
    } else if (line.startsWith('# ')) {
      flushList()
      elements.push(
        <h2 key={i} className="text-xl font-bold text-gray-800 mt-6 mb-3">
          {renderInline(line.slice(2))}
        </h2>
      )
    } else if (line.match(/^[-*] /)) {
      if (listType !== 'ul') {
        flushList()
        listType = 'ul'
      }
      listItems.push(line.replace(/^[-*] /, ''))
    } else if (line.match(/^\d+\. /)) {
      if (listType !== 'ol') {
        flushList()
        listType = 'ol'
      }
      listItems.push(line.replace(/^\d+\. /, ''))
    } else if (line.trim() === '') {
      flushList()
    } else {
      flushList()
      elements.push(
        <p key={i} className="mb-3 leading-relaxed">
          {renderInline(line)}
        </p>
      )
    }
  }
  flushList()

  return <>{elements}</>
}
