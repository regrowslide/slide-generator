
import { basePath } from '@cm/lib/methods/common'
import { NextRequest } from 'next/server'
import { anyObject } from '@cm/types/utility-types'
import { headers } from 'next/headers'

/**
 * 共通の認証チェックロジック
 */
const checkAccess = (host: string | null, authorization: string | null): boolean => {
  const secretKey = process.env.NEXTAUTH_SECRET
  const accessFromApp = basePath?.includes(host ?? '')
  const accessWithAuth = authorization === secretKey
  return accessFromApp || accessWithAuth
}

/**
 * APIルート用の認証チェック
 */
export const isRouteAccessAllowed = async (req: NextRequest) => {
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host')
  const authorization = req.headers.get('authorization')
  return checkAccess(host, authorization) || await isByCronJob()
}

/**
 * Server Action用の認証チェック
 * アプリクライアントからのアクセスまたはauthorization headerがある場合のみ許可
 */
export const isServerActionAccessAllowed = async (): Promise<boolean> => {
  const headersList = await headers()
  const host = headersList.get('x-forwarded-host') ?? headersList.get('host')
  const authorization = headersList.get('authorization')
  return checkAccess(host, authorization) || await isByCronJob()
}

export const logObject = (obj: anyObject) => {
  let stringified = JSON.stringify(obj)
  stringified = stringified.replace(/\s+/g, ' ')
  return stringified
}


const isByCronJob = async () => {
  const headersList = await headers()
  const byCronJob = headersList.get('Authorization') === `Bearer ${process.env.CRON_SECRET}`

  return byCronJob
}


export const isCron = async ({ req }) => {
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host')
  const accessFromApp = basePath?.includes(host ?? '')
  const byCronJob = req.headers.get('Authorization') === `Bearer ${process.env.CRON_SECRET}`
  if (accessFromApp || byCronJob) return true

  console.log(`cron job unauthorized`)
  return false
}
