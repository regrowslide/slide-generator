'use server'

import { basePath } from '../cm/lib/methods/common'
import { fileTypeFromBuffer } from 'file-type'
import { getScopes } from 'src/non-common/scope-lib/getScopes'
import { anyObject } from '@cm/types/utility-types'
import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import { Prisma } from '@prisma/generated/prisma/client'
import { headers } from 'next/headers'
import { auth } from 'src/lib/auth'

export const getUrlInfoInServer = async pathname => {
  const rootPath = pathname?.replace(basePath ?? '', '').split('/')[1] ?? ''
  return { pathname, rootPath }
}
export const getFileInfo = async fileOrPath => {
  const file = fileOrPath
  const { fieldname, originalname, encoding, mimetype, buffer, size } = file
  const fileType: any = await fileTypeFromBuffer(file.buffer)
  const { ext, mime } = fileType

  return {
    ext,
    fieldname,
    originalname,
    encoding,
    mimetype: mime,
    buffer,
    size,
  }
}

export const fetchUserRole = async ({ session }) => {
  const args: Prisma.UserRoleFindManyArgs = {
    select: {
      RoleMaster: {
        select: {
          name: true,
          description: true,
          color: true,
          apps: true,
        },
      },
    },
    where: {
      userId: session?.id ?? '',
    },
  }

  let { result: roles } = await doStandardPrisma(`userRole`, `findMany`, args)
  roles = roles?.map(v => {
    return {
      ...v,
      name: v.RoleMaster.name,
      color: v.RoleMaster.color,
    }
  })

  return { roles }
}

// 現在のリクエストのヘッダーからpathnameを取得
export const server_getPathname = async () => {
  try {
    const headersList = await headers()
    const referer = headersList.get('referer') || ''
    const url = new URL(referer)

    const pathName = url.pathname
    const rootPath = pathName.split('/')[1]
    return { rootPath, pathName }
  } catch (error) {
    return { rootPath: '/', pathName: '/' }
  }
}

/**server component関係 */

export const sessionOnServer = async () => {
  const sessionData = await auth.api.getSession({
    headers: await headers(),
  })


  const session: anyObject = (sessionData?.user as anyObject) ?? null


  return { session }
}

export const initServerComopnent = async ({ query }) => {
  const { session } = await sessionOnServer()

  const { roles } = await fetchUserRole({ session })

  const scopes = getScopes(session ?? {}, { query, roles })
  return { session, query, scopes }
}

export const getItem = async () => {
  return
}

export const isApiAccessAllowed = async props => {
  const { req, res } = props

  const body = req?.body ?? {}
  const { rawHeaders } = req

  const headerObject = {}
  for (let i = 0; i < rawHeaders.length; i += 2) {
    const key = rawHeaders[i]
    const value = rawHeaders[i + 1]
    headerObject[key] = value
  }

  const host = req.headers['x-forwarded-host'] ?? req.headers['host']
  const { referer, authorization } = req?.headers ?? {}

  const secretKey = process.env.BETTER_AUTH_SECRET
  const accessFromApp = basePath?.includes(host)
  const accessWithAuth = authorization === secretKey
  const isAllowed = accessFromApp || accessWithAuth

  if (!isAllowed) {
    const message = 'APIへのアクセスが禁止されています。'
    console.error({ host, basePath, referer, secretKey, authorization, message, body })
    console.error(message)
    return res.status(500).json({ succes: false, message: 'APIへのアクセスが禁止されています。' })
  }
  return true
}
