'use server'

import {NextRequest, NextResponse} from 'next/server'
import crypto from 'crypto'

// LINE Webhookの署名検証
function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.LINE_CHANNEL_SECRET
  if (!secret) return false
  const hash = crypto.createHmac('SHA256', secret).update(body).digest('base64')
  return hash === signature
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-line-signature') || ''

  // 署名検証（LINE_CHANNEL_SECRET が設定されている場合のみ）
  if (process.env.LINE_CHANNEL_SECRET && !verifySignature(body, signature)) {
    console.error('[LINE Webhook] 署名検証失敗')
    return NextResponse.json({error: '署名検証失敗'}, {status: 403})
  }

  const data = JSON.parse(body)
  const events = data.events || []

  for (const event of events) {
    const source = event.source || {}

    // グループ関連イベントをログ出力
    if (source.type === 'group') {
      console.log('========================================')
      console.log('[LINE Webhook] グループID検出')
      console.log(`  LINE_GROUP_ID=${source.groupId}`)
      console.log(`  イベント種別: ${event.type}`)
      console.log('========================================')
    }

    // ユーザーからのメッセージイベントもログ出力（デバッグ用）
    if (event.type === 'message') {
      console.log(`[LINE Webhook] メッセージ受信 - type: ${source.type}, groupId: ${source.groupId || 'なし'}, userId: ${source.userId || 'なし'}`)
    }
  }

  // LINE platformには必ず200を返す
  return NextResponse.json({status: 'ok'})
}
