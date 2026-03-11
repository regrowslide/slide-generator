'use server'

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
    // DB保存（汎用的なContactテーブルがなければJSON形式でログ出力）
    console.log('[DentalLP問い合わせ]', {
      name,
      clinicName,
      email,
      phone,
      message,
      submittedAt: new Date().toISOString(),
    })

    return { success: true }
  } catch (error) {
    console.error('[DentalLP問い合わせエラー]', error)
    return { success: false, error: '送信に失敗しました。時間をおいて再度お試しください。' }
  }
}
