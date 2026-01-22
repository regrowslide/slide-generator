'use client'

import React from 'react'
import { motion, Variants } from 'framer-motion'
import { CheckCircle2, XCircle, Building2, TrendingUp, Calendar, ArrowRight, Mail } from 'lucide-react'
import Link from 'next/link'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
}

// セクションコンポーネント
const Section = ({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode
  className?: string
  id?: string
}) => (
  <motion.section
    id={id}
    variants={fadeInUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-100px' }}
    className={`py-16 lg:py-24 ${className}`}
  >
    {children}
  </motion.section>
)

// ヒーローセクション
const HeroSection = () => {
  return (
    <Section className="bg-gradient-to-br from-blue-50 via-slate-50 to-amber-50">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div variants={itemVariants} className="text-center">

          <h1 className="mb-6 text-3xl font-bold text-slate-900 lg:text-5xl">
            既存ソフトでは届かない
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-amber-600 bg-clip-text text-transparent">
              「業務の隙間」
            </span>
            をシステム化する
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-slate-700 lg:text-xl">

            御社独自の「お作法」に合わせた現場特化型システムで、確実なコスト削減と業務効率化を実現します。
          </p>
        </motion.div>
      </div>
    </Section>
  )
}

// サービス適合判断セクション
const FitJudgmentSection = () => {
  const fitItems = [
    {
      title: 'デジタル化を進めたいが、何から手をつけて良いか不明確',
      description: '既存業務にあった改善のアイデアをともに考え、実現します。',
    },
    {
      title: '既存ソフトやパッケージでは自社の業務フローに対応しきれない',
      description: '御社独自の「お作法」に合わせたシステムを開発します。',
    },
    {
      title: '点在する複数ツールを自動連携させたい',
      description: '会計・カレンダー・LINE・メールなど、複数ツールの連携を実現します。',
    },
    {
      title: '大規模な受託開発は予算オーバー',
      description: '小規模から大規模まで対応可能です。まずはミニマルに始めて効果検証します。',
    },
  ]

  const notFitItems = [
    { title: 'エンターテインメント性のある華麗な装飾を必要とする改発', },
    { title: '不特定多数の一般消費者を対象としたBtoCアプリ開発', },


  ]

  return (
    <Section className="bg-white">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div variants={itemVariants} className="mb-12 text-center">

          <h2 className="mb-4 text-2xl font-bold text-slate-800 lg:text-4xl">
            以下の課題感をお持ちの企業様に
            <br className="hidden sm:block" />

          </h2>
        </motion.div>

        {/* 適合領域 */}
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <h3 className="mb-6 text-xl font-bold text-green-700">弊社サービスがフィットする領域</h3>
          <div className="mb-12 grid gap-6 md:grid-cols-2">
            {fitItems.map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative overflow-hidden rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-sm transition-all duration-300 hover:border-green-400 hover:shadow-lg"
              >
                <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-gradient-to-br from-green-200 to-transparent opacity-50 transition-transform duration-300 group-hover:scale-150" />
                <div className="relative z-10 flex items-start gap-4">
                  <CheckCircle2 className="mt-1 h-6 w-6 flex-shrink-0 text-green-600" />
                  <div>
                    <h4 className="mb-2 font-bold text-xl text-slate-800">{item.title}</h4>
                    <p className="text text-slate-600">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 対象外領域 */}
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <h3 className="mb-6 text-xl font-bold text-slate-500">対応が難しい領域</h3>
          <div className="grid gap-6 md:grid-cols-3">
            {notFitItems.map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-6 opacity-75"
              >
                <div className="flex items-start gap-4">
                  <XCircle className="mt-1 h-6 w-6 flex-shrink-0 text-slate-400" />
                  <div>
                    <h4 className="font-medium text-slate-600">{item.title}</h4>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </Section>
  )
}

// 業務改善カバー領域セクション
const CoverageAreaSection = () => {
  const [activeTab, setActiveTab] = React.useState<'backoffice' | 'sales' | 'field' | 'customer' | 'finance' | 'purchasing'>('backoffice')

  const tabs = [
    { id: 'backoffice' as const, label: 'バックオフィス', icon: Building2 },
    { id: 'sales' as const, label: '営業・販促', icon: TrendingUp },
    { id: 'field' as const, label: '計画・現場管理', icon: Calendar },
    { id: 'customer' as const, label: 'カスタマーサポート', icon: XCircle },
    { id: 'finance' as const, label: '財務・経理', icon: TrendingUp },
    { id: 'purchasing' as const, label: '購買・調達', icon: XCircle },
  ]

  const areas = {
    backoffice: [
      '備品・施設管理',
      '入退社・異動手続き',
      '勤怠・休暇管理',
      '会計・経費精算',
      '売掛・買掛管理',
      '請求書発行・支払い管理',
      '契約書管理',
    ],
    sales: [
      '問い合わせ自動集約',
      '商談履歴・見積作成',
      '顧客情報の一元管理',
      '定型メール一斉配信',
      '次回アクション通知',
      'リードスコアリング',
      'セールスレポート作成',
    ],
    field: [
      '製造ライン稼働計画',
      '配車・ルート最適化',
      '独自ルールのシフト生成',
      'スマホ日報入力',
      '現場写真報告',
      '安全点検チェックリスト',
    ],
    customer: [
      '問い合わせ管理・チケット発行',
      'FAQ自動応答',
      '対応履歴の記録',
      '顧客満足度アンケート集計',
      'チャット・メールサポート',
    ],

    hr: [
      '採用候補者管理',
      '従業員情報管理',
      '評価・目標進捗管理',
      '人事異動申請',
      '社内研修管理',
    ],
    finance: [
      '予算管理',
      '月次決算サポート',
      '帳簿・伝票入力',
      '支払い処理・銀行連携',
      '財務レポート作成',
    ],
    marketing: [
      'キャンペーン管理',
      '顧客分析レポート作成',
      'SNS投稿・反応集計',
      'アンケート自動集計',
      'コンテンツ配信スケジュール',
    ],
    purchasing: [
      '仕入れ先管理',
      '見積依頼・比較',
      '発注・納品管理',
      '在庫自動補充提案',
      '購買契約書管理',
    ],
  }

  return (
    <Section className="bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div variants={itemVariants} className="mb-12 text-center">

          <h2 className="mb-4 text-2xl font-bold text-slate-800 lg:text-4xl">
            現場の実務からバックオフィスまで、
            <br className="hidden sm:block" />
            データの「隙間」を埋めます
          </h2>
        </motion.div>

        {/* タブ */}
        <motion.div variants={itemVariants} className="mb-8 flex flex-wrap justify-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-full px-6 py-3 font-medium transition-all ${activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </motion.div>

        {/* コンテンツ */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {areas[activeTab].map((area, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
            >
              <p className="font-medium text-slate-800">{area}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </Section>
  )
}

// ケーススタディセクション
const CaseStudySection = () => {
  const caseStudies = [
    {
      industry: '建設・現場',
      title: 'スマホ日報と給与計算の完全連動',
      capabilities: [
        'GPS連動打刻: 現場エリア内に入った時のみ打刻可能にし、不正を防止',
        '日報の音声入力: 疲れた手での文字入力を廃止。音声で「本日の進捗」を吹き込むだけでデータ化',
        '給与計算連動: 残業・深夜・休日手当を自動計算し、給与ソフト（freee/MF等）へインポート可能なCSVをワンクリック出力',
      ],
      effects: [
        '現場監督の「月末の集計地獄」からの解放',
        '事務員の入力作業ゼロ化（月40時間の削減）',
      ],
    },
    {
      industry: '物流・配車',
      title: '予約メールからの配車表自動生成',
      capabilities: [
        'メール自動解析: 定型・非定型問わず、メール本文から「日時・場所・荷物量・車種」をAIが抽出',
        '配車表へのマッピング: 抽出データをWeb上の配車表へ自動配置。重複や無理なスケジュールはアラート表示',
        'ドライバー通知: 配車確定と同時に、担当ドライバーのLINEへ詳細を自動送信',
      ],
      effects: [
        '転記ミスによる「配車漏れ」リスクの根絶',
        '電話連絡の手間を廃止し、配車担当者がコア業務（折衝・計画）に集中可能に',
      ],
    },
    {
      industry: '人材・採用',
      title: '面接日程調整の完全自動化',
      capabilities: [
        '空き枠のリアルタイム提示: 担当者のGoogleカレンダーと連動し、「現在空いている枠」だけを候補者に提示',
        'ワンストップ確定: 候補者が枠を選んだ瞬間に、カレンダー登録・Zoom URL発行・確定メール送信・会議室予約まで完了',
        '自動リマインド: 面接前日と1時間前に、候補者へリマインドメールを自動送信',
      ],
      effects: [
        '「候補者との往復するメール調整」の消滅',
        'ダブルブッキングの防止と、面談キャンセルの予防',
      ],
    },
    {
      industry: '卸売・受発注',
      title: 'FAX・PDF注文書のデータ化 (AI-OCR)',
      capabilities: [
        '高精度読取: 手書きFAXやクセのあるPDF注文書をAI-OCRが読み取り、デジタルデータ化',
        'マスタ突合: 読み取った商品名を自社の商品マスタと照合し、正式な品番コードへ自動変換',
        '学習機能: 読み取りミスを人間が一度修正すれば、次回からAIが学習して正答率が向上',
      ],
      effects: [
        '受注入力業務の80%削減（人間は最終チェックのみ）',
        '「入力ミス」による誤配送・クレームの防止',
      ],
    },

    {
      industry: '製造・在庫',
      title: 'QRコードによる在庫・備品管理',
      capabilities: [
        'スマホがハンディに: 高価な専用端末不要。社員のスマホでQRコードをスキャンし「入庫・出庫・移動」を記録',
        '在庫切れアラート: 在庫数が閾値を下回った瞬間、発注担当者のChatwork/Slackへ通知',
        '検索機能: 「あの部品、どこにある？」をアプリで検索すれば、保管棚の場所を即座に表示',
      ],
      effects: [
        '棚卸し時間の半減と、発注漏れによるライン停止リスクの回避',
        '「モノを探す時間」の大幅削減',
      ],
    },

    {
      industry: '飲食・多店舗',
      title: '日次売上・日報のチャット通知',
      capabilities: [
        '簡易入力フォーム: 店長はスマホから「売上・客数・特記事項」を入れるだけ。PCを開く必要なし',
        '全店比較レポート: 全店舗の入力が揃った時点で、売上ランキングや前年比グラフを自動生成し、マネージャーへ通知',
        '異常値検知: 「売上が極端に低い」「人件費率が高い」などの異常値を検知し、アラートを発信',
      ],
      effects: [
        '閉店後の事務作業時間の短縮（店長の負担軽減）',
        '経営層が翌朝を待たずに、リアルタイムで全店状況を把握可能に',
      ],
    },
    {
      industry: '保守・メンテ',
      title: '音声入力による点検記録',
      capabilities: [
        'ハンズフリー入力: 手袋をしたままでも、マイクに向かって「項目3、異常なし」と言うだけでチェック完了',
        '証跡保存: 異常箇所は写真を撮って添付。音声メモもそのままテキスト化して保存',
        '報告書レス: 点検終了ボタンを押せば、自動で点検報告書がPDF化され、本部へ送信',
      ],
      effects: [
        '点検スピードの30%向上',
        '現場でのメモ書き紛失や、記憶頼りの不正確な報告を防止',
      ],
    },


    {
      industry: '飲食・製造',
      title: 'レシピ（手順・配合）の標準化と原価連動',
      capabilities: [
        'リッチレシピ: 動画や画像を用いた手順書をクラウド共有し、変更があれば即座に全拠点へ反映',
        '動的原価計算: 原材料の仕入れ価格が変動した際、全レシピの原価率・利益率を自動で再計算',
        '成分表示出力: レシピデータに基づき、アレルギー情報やカロリー計算を自動化',
      ],
      effects: [
        '「あの人しか作れない」という属人化の解消と、クオリティの均一化',
        '原価変動に対する迅速な価格改定判断（利益管理の精緻化）',
      ],
    },
    {
      industry: '営業・マーケティング',
      title: 'リード獲得から商談設定までの完全自動化',
      capabilities: [
        'LPフォーム連携: Webからの申込情報をデータベースに即時格納し、顧客属性を自動判定',
        'ステップメール配信: 「検討度合い」に応じて、最適なタイミングで事例紹介やセミナー案内を自動送信',
        'ホットリード通知: メール開封やリンククリックなどの行動を検知し、アプローチすべき顧客を営業へSlack通知',
      ],
      effects: [
        '問い合わせ対応の「即レス」化による、商談化率の向上',
        '営業担当者の「メール追客」業務をゼロにし、クロージング業務へ特化',
      ],
    },
    {
      industry: 'インフラ・調査',
      title: 'オフライン対応の現地調査・点検システム',
      capabilities: [
        'オフライン稼働: 電波の届かない地下や山間部でもアプリが動作し、データは端末内に一次保存（通信復帰時に自動同期）',
        '図面ピン留め機能: 図面データの特定箇所をタップし、写真や是正指示コメントを直接紐付け',
        '条件分岐フォーム: 回答内容に応じて、次に聞くべき項目（追加写真の要求など）を動的に変更',
      ],
      effects: [
        '現場での作業完結率100%（帰社後のデータ整理が不要に）',
        '調査項目の抜け漏れ防止による、再調査コストの削減',
      ],
    },
    {
      industry: '自動車・修理',
      title: '中古車修理プロセスの完全可視化システム',
      capabilities: [
        'QRコード工程管理: 車両ごとにQRコードを割り当て、各工程（入庫→見積→修理→検査→出庫）をスキャンで記録',
        '進捗リアルタイム共有: 顧客用マイページで「今どの工程か」をリアルタイムで確認可能',
        '写真付き作業記録: ビフォー・アフター写真を自動整理し、納品時の説明資料として活用',
      ],
      effects: [
        '「今どこまで進んでる？」という問い合わせ対応の削減',
        '工程の見える化による顧客満足度の向上と信頼性の確保',
      ],
    },


    {
      industry: '物流・運送',
      title: '運行管理基幹システム - 配車計画の自動最適化',
      capabilities: [
        'AI配車アルゴリズム: 荷物量・配送先・ドライバーの勤務時間を考慮した最適配車案を自動生成',
        '自動配布機能: 確定した配車表を各ドライバーのアプリへ自動配信',
        'GoogleMap連動: 配送ルートを地図上で可視化し、渋滞情報も反映した最適ルート提案',
      ],
      effects: [
        '配車担当者の業務時間を50%削減',
        '車両稼働率の向上と、ドライバーの残業時間削減による労務環境改善',
      ],
    },


    {
      industry: '受付・問い合わせ',
      title: 'GoogleForm申込顧客管理システム',
      capabilities: [
        'フォーム自動集約: 複数のGoogleFormからの申込情報を一元管理',
        'ステータス管理: 「未対応→対応中→完了」のステータスを可視化し、対応漏れを防止',
        'リマインド通知: 対応期限が近づいた案件を担当者へSlackやメールで自動通知',
      ],
      effects: [
        '申込対応漏れの完全防止',
        '顧客満足度の向上と、対応スピードの改善による商談化率アップ',
      ],
    },


    {
      industry: 'EC・受注管理',
      title: 'LP申込自動化 - メール返信 & 進捗管理',
      capabilities: [
        '申込即時対応: LPからの申込を検知し、確認メールを即座に自動返信',
        '進捗ステータス管理: 「申込→見積提出→受注→納品」の各段階を可視化',
        'リマインダー機能: 見積提出期限や納品期限をSlackやメールで通知し、対応遅延を防止',
      ],
      effects: [
        '初動対応の迅速化による受注率の向上',
        '案件管理の見える化による対応漏れの防止とプロジェクト進行のスムーズ化',
      ],
    },
    {
      industry: '人材・採用',
      title: '求人管理システム - 応募者一元管理',
      capabilities: [
        '複数媒体の一元管理: Indeed・マイナビ・自社サイトなど、複数経路からの応募を一括管理',
        '選考ステータス追跡: 「書類選考→一次面接→最終面接→内定」の進捗を可視化',
        '自動リマインド: 面接日前日に応募者と面接官の両方へリマインドメール送信',
      ],
      effects: [
        '応募者対応の迅速化による採用成功率の向上',
        '人事担当者の管理工数を50%削減し、面接の質向上に注力可能',
      ],
    },

    {
      industry: 'データ分析',
      title: '感情分析Webアプリ - テキストマイニング',
      capabilities: [
        'AI感情分析: 顧客の声やレビューをAIが解析し、ポジティブ/ネガティブを判定',
        'トレンド可視化: 時系列でのトレンド変化をグラフで表示し、傾向を把握',
        'キーワード抽出: 頻出単語や重要トピックを自動抽出し、改善ポイントを特定',
      ],
      effects: [
        '顧客の潜在ニーズの早期発見と対応',
        'データドリブンな意思決定の実現による商品・サービス改善',
      ],
    },
    {
      industry: '経理・会計',
      title: '売上管理ツール - Freee連携',
      capabilities: [
        'Freee自動同期: 会計ソフトfreeeから売上データを自動取得',
        'ダッシュボード可視化: 月次売上・前年比・利益率などを見やすくグラフ化',
        'アラート機能: 売上目標に対する達成率が低い場合に経営層へ通知',
      ],
      effects: [
        '経営判断に必要なデータをリアルタイムで把握',
        '経理担当者のレポート作成業務の削減と、経営層の意思決定スピード向上',
      ],
    },



    {
      industry: '製造・入出荷',
      title: '入出荷管理システム - バーコード連携',
      capabilities: [
        'バーコードスキャン: 入出荷時にバーコードをスキャンし、在庫を自動更新',
        '出荷指示書自動生成: 受注データから出荷指示書を自動作成',
        '在庫アラート: 在庫が閾値を下回った際に発注担当者へ自動通知',
      ],
      effects: [
        '入出荷作業時間の40%削減',
        '在庫精度の向上と、欠品による機会損失の防止',
      ],
    },
  ]

  return (
    <Section className="bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div variants={itemVariants} className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-800">
            導入実績・ケーススタディ
          </div>
          <h2 className="mb-4 text-2xl font-bold text-slate-800 lg:text-4xl">
            導入実績から
            <br className="hidden sm:block" />
            具体的な解決事例をご紹介
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {caseStudies.map((study, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-xl"
            >
              <div className="absolute right-0 top-0 h-32 w-32 -translate-y-12 translate-x-12 rounded-full bg-gradient-to-br from-blue-100 to-transparent opacity-50 transition-transform duration-300 group-hover:scale-150" />
              <div className="relative z-10">
                <div className="mb-3 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                  {study.industry}
                </div>
                <h3 className="mb-4 text-lg font-bold text-slate-800">{study.title}</h3>

                <div className="mb-4 space-y-2">
                  <h4 className="text-sm font-semibold text-slate-700">システムでできること:</h4>
                  <ul className="space-y-1.5">
                    {study.capabilities.map((cap, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg bg-amber-50 p-3">
                  <h4 className="mb-2 text-sm font-semibold text-amber-800">想定効果:</h4>
                  <ul className="space-y-1">
                    {study.effects.map((effect, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-amber-700">
                        <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-amber-500" />
                        <span>{effect}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  )
}

// CTAセクション
const CTASection = () => {
  return (
    <Section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <motion.div variants={itemVariants}>
          <h2 className="mb-6 text-3xl font-bold text-white lg:text-4xl">
            無料相談・試算依頼
          </h2>
          <p className="mb-8 text-lg text-blue-100">
            「このExcel作業がなくなれば楽になる」
            <br />
            まずはその小さな悩みからご相談ください。
            <br />
            御社の業務フローにおける「ボトルネック」を特定し、どの程度のコスト削減が可能か、無料で試算いたします。
          </p>
          <Link
            href="/KM/contact"
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-bold text-blue-700 shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
          >
            <Mail className="w-5 h-5" />
            <span>お問い合わせはこちら</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </Section>
  )
}

export const ServiceIntroduction = () => {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <FitJudgmentSection />
      <CoverageAreaSection />
      <CaseStudySection />
      <CTASection />
    </div>
  )
}

