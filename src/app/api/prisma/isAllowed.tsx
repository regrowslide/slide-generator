
import { basePath } from '@cm/lib/methods/common'
import { NextRequest } from 'next/server'
import { anyObject } from '@cm/types/utility-types'
import { headers } from 'next/headers'
import { auth } from 'src/lib/auth'

/**
 * better-authセッションによる認証チェック
 */
const checkSession = async (reqHeaders: Headers): Promise<boolean> => {
  try {
    const session = await auth.api.getSession({ headers: reqHeaders })
    return !!session?.user
  } catch {
    return false
  }
}

/**
 * APIルート用の認証チェック
 * better-authセッションまたはCronジョブからのアクセスを許可
 */
export const isRouteAccessAllowed = async (req: NextRequest) => {
  return await checkSession(req.headers) || await isByCronJob()
}

/**
 * Server Action用の認証チェック
 * better-authセッションまたはCronジョブからのアクセスを許可
 */
export const isServerActionAccessAllowed = async (): Promise<boolean> => {
  const headersList = await headers()
  return await checkSession(headersList) || await isByCronJob()
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
