'use client'

import { useState, useRef } from 'react'
import { submitContactForm } from '../_actions/contact-actions'

export default function ContactSection() {
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

    try {
      const result = await submitContactForm(data)

      if (result.success) {
        setFormState('success')
        formRef.current?.reset()
      } else {
        setFormState('error')
        setErrorMessage(result.error || '送信に失敗しました')
      }
    } catch {
      setFormState('error')
      setErrorMessage('通信エラーが発生しました。時間をおいて再度お試しください。')
    }
  }

  return (
    <section id='contact' className='scroll-mt-20 bg-slate-50 py-16 md:py-24'>
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
