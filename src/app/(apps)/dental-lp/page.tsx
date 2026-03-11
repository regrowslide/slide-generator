'use client'

import { useState, useRef } from 'react'
import { submitContactForm } from './_actions/contact-actions'

// ============================
// 定数
// ============================

const HERO = {
  catchCopy: '訪問歯科の算定・書類作成を、\nもっとシンプルに。',
  subCopy:
    '42項目以上の算定を自動判定。提供文書をワンクリック生成。\n診療に集中できる環境を、VisitDental Pro が実現します。',
}

const PAIN_POINTS = [
  {
    icon: '📋',
    title: '算定項目の選定に時間がかかる',
    description:
      '歯訪診・歯在管・在口衛…複数の加算条件を毎回確認。医院の届出資格や患者の状態によって変わる算定項目を、すべて手作業で判断していませんか？',
  },
  {
    icon: '📄',
    title: '提供文書の作成が煩雑',
    description:
      '管理計画書、治療内容説明書、口腔機能検査表…。患者情報を毎回手入力し、書式を整えて印刷。1人あたり数十分の書類作業が発生していませんか？',
  },
  {
    icon: '⏱️',
    title: '診療時間の記録が曖昧',
    description:
      '20分ルールの管理、医師と衛生士の診療時間の記録…。手書きメモに頼った記録では、算定根拠として不十分になることも。',
  },
]

const FEATURES = [
  {
    icon: '🤖',
    title: '算定項目の自動判定',
    description:
      '医院の届出資格・患者の疾患・診療時間・訪問人数を基に、42項目以上の算定可否をリアルタイムで自動判定。選び忘れや算定漏れを防ぎます。',
    highlights: ['届出資格に連動', '患者状態を自動反映', '改定にも対応'],
  },
  {
    icon: '📝',
    title: '提供文書のワンクリック生成',
    description:
      '6種類の提供文書テンプレートに、患者情報・診療データを自動で流し込み。編集・印刷・PDF出力までシームレスに完結します。',
    highlights: ['6種類のテンプレート', '自動データ挿入', 'PDF出力対応'],
  },
  {
    icon: '⏱️',
    title: '診療時間の自動記録',
    description:
      '医師・衛生士それぞれの診療開始・終了をタイマーで自動記録。20分アラート機能付きで、算定根拠となる正確な時間管理を実現します。',
    highlights: ['ワンタップ計測', '20分アラート', '医師/衛生士別記録'],
  },
]

const BENEFITS = [
  {
    number: '70',
    unit: '%',
    label: '書類作成時間の削減',
    description: '手入力作業を自動化し、1患者あたりの書類作成を大幅に短縮',
  },
  {
    number: '0',
    unit: '件',
    label: '算定漏れ',
    description: '条件に基づく自動判定で、取り忘れていた加算を確実にキャッチ',
  },
  {
    number: '100',
    unit: '%',
    label: 'ペーパーレス管理',
    description: '算定台帳・提供文書・診療記録をすべてクラウドで一元管理',
  },
]

const FLOW_STEPS = [
  { step: '01', title: 'お問い合わせ', description: 'まずはお気軽にご連絡ください' },
  { step: '02', title: 'ヒアリング・デモ', description: '貴院の運用に合わせてデモをご案内' },
  { step: '03', title: '初期設定', description: '医院情報・施設・患者データを登録' },
  { step: '04', title: '運用開始', description: 'すぐに診療現場でご利用いただけます' },
]

// ============================
// コンポーネント
// ============================

export default function DentalLpPage() {
  return (
    <div className='font-sans'>
      <Header />
      <HeroSection />
      <PainPointSection />
      <FeatureSection />
      <BenefitSection />
      <FlowSection />
      <PricingSection />
      <ContactSection />
      <Footer />
    </div>
  )
}

// --- ヘッダー ---
function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  const navItems = [
    { label: 'こんなお悩みありませんか？', href: '#pain' },
    { label: '機能紹介', href: '#features' },
    { label: '導入メリット', href: '#benefits' },
    { label: '導入の流れ', href: '#flow' },
    { label: 'お問い合わせ', href: '#contact' },
  ]

  return (
    <header className='fixed top-0 z-50 w-full border-b border-slate-100 bg-white/95 backdrop-blur-sm'>
      <div className='mx-auto flex max-w-6xl items-center justify-between px-4 py-3'>
        <a href='#' className='text-xl font-bold text-slate-800'>
          <span className='text-teal-600'>Visit</span>Dental Pro
        </a>

        {/* PC ナビ */}
        <nav className='hidden items-center gap-6 md:flex'>
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className='text-sm text-slate-600 transition-colors hover:text-teal-600'
            >
              {item.label}
            </a>
          ))}
          <a
            href='#contact'
            className='rounded-full bg-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 hover:shadow-md'
          >
            無料で相談する
          </a>
        </nav>

        {/* モバイルメニューボタン */}
        <button
          className='flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 md:hidden'
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label='メニュー'
        >
          {menuOpen ? (
            <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <path d='M18 6L6 18M6 6l12 12' />
            </svg>
          ) : (
            <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <path d='M3 12h18M3 6h18M3 18h18' />
            </svg>
          )}
        </button>
      </div>

      {/* モバイルメニュー */}
      {menuOpen && (
        <div className='border-t border-slate-100 bg-white px-4 py-4 md:hidden'>
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className='block py-3 text-sm text-slate-600 hover:text-teal-600'
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <a
            href='#contact'
            className='mt-2 block rounded-full bg-teal-600 py-3 text-center text-sm font-semibold text-white'
            onClick={() => setMenuOpen(false)}
          >
            無料で相談する
          </a>
        </div>
      )}
    </header>
  )
}

// --- ヒーロー ---
function HeroSection() {
  return (
    <section className='relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-sky-50 pt-24'>
      <div className='mx-auto max-w-6xl px-4 py-16 md:py-24'>
        <div className='text-center'>
          <div className='mb-6 inline-block rounded-full bg-teal-100 px-4 py-1.5 text-sm font-medium text-teal-700'>
            訪問歯科診療 業務支援システム
          </div>
          <h1 className='mb-6 text-3xl leading-relaxed font-bold tracking-tight text-slate-900 md:text-5xl md:leading-relaxed'>
            {HERO.catchCopy.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i === 0 && <br />}
              </span>
            ))}
          </h1>
          <p className='mx-auto mb-10 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg'>
            {HERO.subCopy.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i === 0 && <br />}
              </span>
            ))}
          </p>
          <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
            <a
              href='#contact'
              className='w-full rounded-full bg-teal-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-teal-700 hover:shadow-xl sm:w-auto'
            >
              無料で相談してみる
            </a>
            <a
              href='#features'
              className='w-full rounded-full border border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-700 transition-all hover:border-teal-300 hover:text-teal-600 sm:w-auto'
            >
              機能を詳しく見る
            </a>
          </div>
        </div>
      </div>

      {/* 装飾 */}
      <div className='pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-teal-100 opacity-30 blur-3xl' />
      <div className='pointer-events-none absolute -bottom-10 -left-20 h-60 w-60 rounded-full bg-sky-100 opacity-40 blur-3xl' />

      {/* 波形の区切り */}
      <div className='mt-8'>
        <svg viewBox='0 0 1440 80' fill='none' className='w-full'>
          <path
            d='M0 40C360 80 720 0 1080 40C1260 60 1380 50 1440 40V80H0V40Z'
            fill='white'
          />
        </svg>
      </div>
    </section>
  )
}

// --- 課題提起 ---
function PainPointSection() {
  return (
    <section id='pain' className='bg-white py-16 md:py-24'>
      <div className='mx-auto max-w-6xl px-4'>
        <div className='mb-12 text-center'>
          <h2 className='mb-4 text-2xl font-bold text-slate-900 md:text-3xl'>
            こんなお悩み、ありませんか？
          </h2>
          <p className='text-slate-500'>訪問歯科の現場で多く聞かれる課題です</p>
        </div>

        <div className='grid gap-6 md:grid-cols-3'>
          {PAIN_POINTS.map((point, i) => (
            <div
              key={i}
              className='group rounded-2xl border border-slate-100 bg-slate-50 p-8 transition-all hover:border-teal-200 hover:bg-teal-50 hover:shadow-md'
            >
              <div className='mb-4 text-4xl'>{point.icon}</div>
              <h3 className='mb-3 text-lg font-bold text-slate-800'>{point.title}</h3>
              <p className='text-sm leading-relaxed text-slate-600'>{point.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// --- 機能紹介 ---
function FeatureSection() {
  return (
    <section id='features' className='bg-gradient-to-b from-white to-slate-50 py-16 md:py-24'>
      <div className='mx-auto max-w-6xl px-4'>
        <div className='mb-12 text-center'>
          <div className='mb-3 text-sm font-semibold tracking-wider text-teal-600'>FEATURES</div>
          <h2 className='mb-4 text-2xl font-bold text-slate-900 md:text-3xl'>
            VisitDental Pro の3つの強み
          </h2>
          <p className='text-slate-500'>訪問歯科に特化した機能で、業務を根本から改善します</p>
        </div>

        <div className='space-y-12 md:space-y-20'>
          {FEATURES.map((feature, i) => (
            <div
              key={i}
              className={`flex flex-col items-center gap-8 md:flex-row ${
                i % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* テキスト */}
              <div className='flex-1'>
                <div className='mb-3 text-4xl'>{feature.icon}</div>
                <h3 className='mb-4 text-xl font-bold text-slate-900 md:text-2xl'>
                  {feature.title}
                </h3>
                <p className='mb-6 leading-relaxed text-slate-600'>{feature.description}</p>
                <div className='flex flex-wrap gap-2'>
                  {feature.highlights.map((tag) => (
                    <span
                      key={tag}
                      className='rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700'
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* ビジュアルプレースホルダー */}
              <div className='flex aspect-[4/3] w-full flex-1 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-100 to-sky-100'>
                <div className='text-center'>
                  <div className='mb-2 text-6xl opacity-60'>{feature.icon}</div>
                  <p className='text-sm text-teal-600'>画面イメージ</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// --- 導入メリット ---
function BenefitSection() {
  return (
    <section id='benefits' className='bg-slate-900 py-16 text-white md:py-24'>
      <div className='mx-auto max-w-6xl px-4'>
        <div className='mb-12 text-center'>
          <div className='mb-3 text-sm font-semibold tracking-wider text-teal-400'>BENEFITS</div>
          <h2 className='mb-4 text-2xl font-bold md:text-3xl'>導入で変わる、3つの数字</h2>
          <p className='text-slate-400'>VisitDental Pro で実現できる改善効果</p>
        </div>

        <div className='grid gap-8 md:grid-cols-3'>
          {BENEFITS.map((benefit, i) => (
            <div key={i} className='text-center'>
              <div className='mb-4'>
                <span className='text-5xl font-bold text-teal-400 md:text-6xl'>
                  {benefit.number}
                </span>
                <span className='ml-1 text-2xl font-bold text-teal-400'>{benefit.unit}</span>
              </div>
              <h3 className='mb-2 text-lg font-bold'>{benefit.label}</h3>
              <p className='text-sm leading-relaxed text-slate-400'>{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// --- 導入の流れ ---
function FlowSection() {
  return (
    <section id='flow' className='bg-white py-16 md:py-24'>
      <div className='mx-auto max-w-6xl px-4'>
        <div className='mb-12 text-center'>
          <div className='mb-3 text-sm font-semibold tracking-wider text-teal-600'>FLOW</div>
          <h2 className='mb-4 text-2xl font-bold text-slate-900 md:text-3xl'>導入の流れ</h2>
          <p className='text-slate-500'>お問い合わせから最短1週間で運用開始</p>
        </div>

        <div className='relative mx-auto max-w-3xl'>
          {/* 縦線 */}
          <div className='absolute left-6 top-0 hidden h-full w-0.5 bg-teal-200 md:left-1/2 md:block' />

          <div className='space-y-8'>
            {FLOW_STEPS.map((item, i) => (
              <div
                key={i}
                className={`flex items-start gap-6 md:gap-12 ${
                  i % 2 === 1 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* ステップ番号 */}
                <div className='relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-600 font-bold text-white shadow-md md:mx-auto'>
                  {item.step}
                </div>
                {/* 内容 */}
                <div
                  className={`flex-1 rounded-xl border border-slate-100 bg-slate-50 p-6 ${
                    i % 2 === 1 ? 'md:text-right' : ''
                  }`}
                >
                  <h3 className='mb-1 text-lg font-bold text-slate-800'>{item.title}</h3>
                  <p className='text-sm text-slate-600'>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// --- 料金 ---
function PricingSection() {
  return (
    <section className='bg-gradient-to-b from-slate-50 to-white py-16 md:py-24'>
      <div className='mx-auto max-w-3xl px-4 text-center'>
        <div className='mb-3 text-sm font-semibold tracking-wider text-teal-600'>PRICING</div>
        <h2 className='mb-4 text-2xl font-bold text-slate-900 md:text-3xl'>料金プラン</h2>
        <p className='mb-8 text-slate-500'>
          医院の規模やご利用内容に合わせて、最適なプランをご提案いたします
        </p>

        <div className='rounded-2xl border border-teal-200 bg-white p-8 shadow-sm md:p-12'>
          <p className='mb-2 text-lg font-bold text-slate-800'>まずはお気軽にご相談ください</p>
          <p className='mb-8 text-sm text-slate-500'>
            導入規模・施設数・ご要望に応じてお見積もりいたします。
            <br />
            オンラインデモも無料で実施しております。
          </p>
          <a
            href='#contact'
            className='inline-block rounded-full bg-teal-600 px-8 py-4 font-semibold text-white shadow-md transition-all hover:bg-teal-700 hover:shadow-lg'
          >
            無料で相談する
          </a>
        </div>
      </div>
    </section>
  )
}

// --- 問い合わせフォーム ---
function ContactSection() {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormState('submitting')
    setErrorMessage('')

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      clinicName: formData.get('clinicName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      message: formData.get('message') as string,
    }

    const result = await submitContactForm(data)

    if (result.success) {
      setFormState('success')
      formRef.current?.reset()
    } else {
      setFormState('error')
      setErrorMessage(result.error || '送信に失敗しました')
    }
  }

  return (
    <section id='contact' className='bg-slate-50 py-16 md:py-24'>
      <div className='mx-auto max-w-2xl px-4'>
        <div className='mb-10 text-center'>
          <div className='mb-3 text-sm font-semibold tracking-wider text-teal-600'>CONTACT</div>
          <h2 className='mb-4 text-2xl font-bold text-slate-900 md:text-3xl'>お問い合わせ</h2>
          <p className='text-slate-500'>
            導入に関するご質問やデモのご依頼など、
            <br className='sm:hidden' />
            お気軽にお問い合わせください
          </p>
        </div>

        {formState === 'success' ? (
          <div className='rounded-2xl border border-teal-200 bg-white p-8 text-center shadow-sm'>
            <div className='mb-4 text-5xl'>✅</div>
            <h3 className='mb-2 text-xl font-bold text-slate-800'>
              お問い合わせありがとうございます
            </h3>
            <p className='mb-6 text-slate-600'>
              内容を確認の上、2営業日以内にご連絡いたします。
            </p>
            <button
              onClick={() => setFormState('idle')}
              className='text-sm text-teal-600 underline hover:text-teal-700'
            >
              新しいお問い合わせを送る
            </button>
          </div>
        ) : (
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-10'
          >
            <div className='space-y-5'>
              {/* お名前 */}
              <div>
                <label htmlFor='name' className='mb-1.5 block text-sm font-medium text-slate-700'>
                  お名前 <span className='text-red-500'>*</span>
                </label>
                <input
                  id='name'
                  name='name'
                  type='text'
                  required
                  placeholder='山田 太郎'
                  className='w-full rounded-lg border border-slate-300 px-4 py-3 text-sm transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none'
                />
              </div>

              {/* 医院名 */}
              <div>
                <label
                  htmlFor='clinicName'
                  className='mb-1.5 block text-sm font-medium text-slate-700'
                >
                  医院名
                </label>
                <input
                  id='clinicName'
                  name='clinicName'
                  type='text'
                  placeholder='〇〇歯科医院'
                  className='w-full rounded-lg border border-slate-300 px-4 py-3 text-sm transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none'
                />
              </div>

              {/* メールアドレス */}
              <div>
                <label htmlFor='email' className='mb-1.5 block text-sm font-medium text-slate-700'>
                  メールアドレス <span className='text-red-500'>*</span>
                </label>
                <input
                  id='email'
                  name='email'
                  type='email'
                  required
                  placeholder='example@clinic.jp'
                  className='w-full rounded-lg border border-slate-300 px-4 py-3 text-sm transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none'
                />
              </div>

              {/* 電話番号 */}
              <div>
                <label htmlFor='phone' className='mb-1.5 block text-sm font-medium text-slate-700'>
                  電話番号
                </label>
                <input
                  id='phone'
                  name='phone'
                  type='tel'
                  placeholder='03-1234-5678'
                  className='w-full rounded-lg border border-slate-300 px-4 py-3 text-sm transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none'
                />
              </div>

              {/* お問い合わせ内容 */}
              <div>
                <label
                  htmlFor='message'
                  className='mb-1.5 block text-sm font-medium text-slate-700'
                >
                  お問い合わせ内容
                </label>
                <textarea
                  id='message'
                  name='message'
                  rows={4}
                  placeholder='ご質問やご要望をお気軽にお書きください'
                  className='w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none'
                />
              </div>

              {/* エラーメッセージ */}
              {formState === 'error' && (
                <div className='rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600'>
                  {errorMessage}
                </div>
              )}

              {/* 送信ボタン */}
              <button
                type='submit'
                disabled={formState === 'submitting'}
                className='w-full rounded-full bg-teal-600 py-4 font-semibold text-white shadow-md transition-all hover:bg-teal-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60'
              >
                {formState === 'submitting' ? '送信中...' : '送信する'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}

// --- フッター ---
function Footer() {
  return (
    <footer className='bg-slate-900 py-8 text-center text-sm text-slate-400'>
      <div className='mx-auto max-w-6xl px-4'>
        <p className='mb-2 text-lg font-bold text-white'>
          <span className='text-teal-400'>Visit</span>Dental Pro
        </p>
        <p>訪問歯科診療 業務支援システム</p>
        <p className='mt-4'>&copy; {new Date().getFullYear()} VisitDental Pro. All rights reserved.</p>
      </div>
    </footer>
  )
}
