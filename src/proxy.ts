import {NextRequest, NextResponse} from 'next/server'
import {HREF} from '@cm/lib/methods/urls'

/**
 * セッション検証関数の型定義
 */
type SessionValidator = (hasSession: boolean) => boolean

/**
 * リダイレクトURL生成関数の型定義
 */
type RedirectUrlBuilder = (origin: string, rootPath: string) => string

/**
 * パス検証設定
 */
const pathValidation = {
  isValid: (hasSession: boolean): boolean => {
    return hasSession
  },
  redirect: (origin: string, rootPath: string): string => {
    return `${origin}/not-found?rootPath=${rootPath}`
  },
} satisfies {
  isValid: SessionValidator
  redirect: RedirectUrlBuilder
}

/**
 * パス設定の型定義
 */
type PathConfig = {
  matcher: string
  isValid: SessionValidator
  redirect: RedirectUrlBuilder
}

type RootPathConfig = {
  rootPath: string
  paths: PathConfig[]
}

/**
 * 認証が必要なパスのマッチャーを生成（除外パス以外にマッチさせる）
 * @param rootPath - ルートパス名（例: 'ucar'）
 * @param pathArray - 認証不要なパスの配列（例: ['/sateiIdConverter']）
 *                    空文字 '' を含めるとルートパス自体（/rootPath, /rootPath/）も認証不要になる
 * @returns 正規表現パターン文字列
 */
const getFreePathsMatcher = (rootPath: string, pathArray: string[]): string => {
  if (rootPath.includes('/')) {
    throw new Error('rootPath cannot contain slash (/)')
  }
  // デフォルトで認証不要なパス（先頭スラッシュなし）
  const defaultFreePaths = [`.*api`, `seeder`]

  // 空文字を検出してフラグを立て、正規表現パターンからは除外
  // （空文字を含めると || が生成され、全パスがマッチしてしまう）
  const excludeRootPath = pathArray.includes('')

  // パスから先頭のスラッシュを除去（正規表現で /rootPath/ の後にマッチさせるため）
  const validPaths = pathArray.filter(p => p !== '' && p.length > 0).map(p => (p.startsWith('/') ? p.slice(1) : p))

  const allFreePaths = [...defaultFreePaths, ...validPaths]
  const excludedPathsPattern = allFreePaths.join('|')

  if (excludeRootPath) {
    // ルートパス自体を認証不要にする場合
    // /rootPath, /rootPath/ はマッチしない、/rootPath/xxx は除外パスでなければマッチ
    return `^/${rootPath}/(?!(?:${excludedPathsPattern})(?:/|$)).+$`
  }

  // 従来の動作: ルートパス含めて認証が必要（除外パス以外すべてマッチ）
  return `^/${rootPath}(?:/(?!(?:${excludedPathsPattern})(?:/|$)).*)?$`
}

export const rootPaths: RootPathConfig[] = [
  {
    rootPath: 'KM',
    paths: [
      {
        matcher: getFreePathsMatcher('KM', ['', '/demoDriven', '/services', '/testimonials', '/contact', '/mocks']),
        ...pathValidation,
      },
    ],
  },
  {
    rootPath: 'regrow',
    paths: [],
  },
  {
    rootPath: 'dental',
    paths: [
      {
        matcher: getFreePathsMatcher('dental', ['', '/']),
        ...pathValidation,
      },
    ],
  },
]

/**
 * better-auth のセッションCookieからセッション有無を判定
 */
const getSessionFromCookie = (req: NextRequest): boolean => {
  const sessionToken = req.cookies.get('better-auth.session_token')?.value
  return !!sessionToken
}

/**
 * Next.js proxy関数
 * 認証が必要なパスへのアクセスを検証し、未認証の場合はリダイレクト
 */
export async function proxy(req: NextRequest): Promise<NextResponse> {
  try {
    const hasSession = getSessionFromCookie(req)

    const {pathname, origin, searchParams} = req.nextUrl
    const query = {}
    searchParams.forEach((value, key) => {
      query[key] = value
    })

    const targetPathConfig = rootPaths.find(config => {
      const rootPathRegex = new RegExp(`^/${config.rootPath}`)
      return rootPathRegex.test(pathname)
    })

    if (!targetPathConfig) {
      return NextResponse.next()
    }

    if (targetPathConfig.paths.length > 0) {
      const matchedPathConfig = targetPathConfig.paths.find(pathConfig => {
        try {
          const matcherRegex = new RegExp(pathConfig.matcher)
          return matcherRegex.test(pathname)
        } catch (error) {
          console.error(`Invalid regex pattern: ${pathConfig.matcher}`, error)
          return false
        }
      })

      const isValid = matchedPathConfig?.isValid(hasSession)
      if (matchedPathConfig && !isValid) {
        const callBackUrl = encodeURIComponent(HREF(`${pathname}`, query, query))
        const redirectUrl = matchedPathConfig.redirect(origin, callBackUrl)

        return NextResponse.redirect(new URL(redirectUrl, req.url))
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.next()
  }
}

export default proxy
