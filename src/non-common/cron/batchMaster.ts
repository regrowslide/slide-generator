/**
 * Prisma件数取得用の引数型定義
 */
export type BatchCountArgs = {
  model: string // Prismaモデル名
  where?: Record<string, any> // where条件（オプション）
}

/**
 * バッチ設定の型定義
 */
export type BatchConfig = {
  id: string // バッチ識別子（vercel.jsonのpathと対応）
  name: string // バッチ名称
  schedule?: string // Cronスケジュール（vercel.jsonと同期、effectOnが'batch'の場合必須）
  description?: string // 説明
  purpose?: string // 用途
  app: string
  effectOn: 'batch' | 'click' // 実行種別
  handler?: () => Promise<any> // 実行関数（effectOnが'batch'の場合必須）
  onClick?: {name: string; main: () => Promise<any>} // クリック実行関数（UI用）
  tableName?: string // テーブル名（カウント表示用）
  prismaArgs?: any // Prisma引数（カウント表示用）
}

/**
 * 全バッチ設定のマスター
 * vercel.jsonのcrons設定と同期
 */
export const BATCH_MASTER: Record<string, BatchConfig> = {
  tennisReminder3Days: {
    id: 'tennisReminder3Days',
    name: 'テニス 3日前リマインド',
    description: '3日後の予定に未定・未回答の人へLINEで回答促進通知を送信',
    purpose: '出欠未回答者への催促。毎日20:00 JSTに実行。',
    app: 'tennis',
    effectOn: 'batch',
    schedule: '0 11 * * *', // UTC 11:00 = JST 20:00
    handler: async () => {
      const {sendReminder3Days} = await import('@app/(apps)/tennis/_actions/line-notify-actions')
      return sendReminder3Days()
    },
  },
  tennisReminderNextDay: {
    id: 'tennisReminderNextDay',
    name: 'テニス 前日通知',
    description: '翌日の予定詳細（参加者一覧・コート情報）をLINEで参加者に通知',
    purpose: '前日のリマインドと参加者確認。毎日20:00 JSTに実行。',
    app: 'tennis',
    effectOn: 'batch',
    schedule: '0 11 * * *', // UTC 11:00 = JST 20:00
    handler: async () => {
      const {sendReminderNextDay} = await import('@app/(apps)/tennis/_actions/line-notify-actions')
      return sendReminderNextDay()
    },
  },
  tennisCourtUndecided: {
    id: 'tennisCourtUndecided',
    name: 'テニス コート未定警告',
    description: '2日前〜前日の予定でコートが未設定の場合にLINEグループに通知',
    purpose: 'コート予約漏れの防止。毎日18:00 JSTに実行。',
    app: 'tennis',
    effectOn: 'batch',
    schedule: '0 9 * * *', // UTC 9:00 = JST 18:00
    handler: async () => {
      const {sendCourtUndecidedWarning} = await import('@app/(apps)/tennis/_actions/line-notify-actions')
      return sendCourtUndecidedWarning()
    },
  },
}

/**
 * vercel.json生成用のヘルパー関数
 * BATCH_MASTERからvercel.jsonのcrons設定を生成する
 */
export const getVercelCronsConfig = () => {
  return Object.values(BATCH_MASTER)
    .filter(batch => batch.effectOn === 'batch' && batch.handler)
    .map(batch => ({
      path: `/api/cron/execute/${batch.id}`,
      schedule: batch.schedule,
    }))
}

/**
 * vercel.json生成用のJSON形式でエクスポート
 * スクリプトから直接読み込めるようにする
 */
export const BATCH_MASTER_JSON = Object.values(BATCH_MASTER)
  .filter(batch => batch.effectOn === 'batch' && batch.handler)
  .map(batch => ({
    path: `/api/cron/execute/${batch.id}`,
    schedule: batch.schedule,
  }))
