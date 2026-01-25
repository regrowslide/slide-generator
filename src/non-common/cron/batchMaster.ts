/**
 * バッチ設定の型定義
 */
export type BatchConfig = {
  id: string // バッチ識別子（vercel.jsonのpathと対応）
  name: string // バッチ名称
  schedule?: string // Cronスケジュール（vercel.jsonと同期、effectOnが'batch'の場合必須）
  description?: string // 説明
  purpose?: string // 用途
  app: 'common' | 'ucar' | 'newCar' | 'qrbp' // アプリ識別
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
  // ============ newCar アプリ ============
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
