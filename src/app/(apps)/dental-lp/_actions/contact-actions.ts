'use server'

import prisma from 'src/lib/prisma'

type ContactFormData = {
  name: string
  clinicName: string
  email: string
  phone: string
  message: string
}

// 問い合わせ送信
export async function submitContactForm(data: ContactFormData) {
  const { name, clinicName, email, phone, message } = data

  // バリデーション
  if (!name || !email) {
    return { success: false, error: 'お名前とメールアドレスは必須です' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { success: false, error: 'メールアドレスの形式が正しくありません' }
  }

  try {
    await prisma.dentalContact.create({
      data: {
        name,
        clinicName: clinicName || '',
        email,
        phone: phone || '',
        message: message || '',
      },
    })

    return { success: true }
  } catch (error) {
    console.error('[DentalLP問い合わせエラー]', error)
    return { success: false, error: '送信に失敗しました。時間をおいて再度お試しください。' }
  }
}
