// middleware.ts
import {getToken} from 'next-auth/jwt'
import {NextRequest, NextResponse} from 'next/server'
import type {JWT} from 'next-auth/jwt'

/**
 * セッション検証関数の型定義
 */
type SessionValidator = (session: JWT | null) => boolean

/**
 * リダイレクトURL生成関数の型定義
 */
type RedirectUrlBuilder = (origin: string, rootPath: string) => string

/**
 * パス検証設定
 */
const pathValidation = {
  isValid: (session: JWT | null): boolean => {
    return Boolean(session?.email)
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
 * 認証不要なパスのマッチャーを生成
 * @param rootPath - ルートパス名
 * @param pathArray - 認証不要なパスの配列
 * @returns 正規表現パターン文字列
 */
const getFreePathsMatcher = (rootPath: string, pathArray: string[]): string => {
  const defaultFreePaths = [`/.*api`, `/seeder`]
  const allFreePaths = [...defaultFreePaths, ...pathArray]
  return `/${rootPath}(?!${allFreePaths.join(`|`)})/.+`
}

/**
 * ルートパス設定の配列
 */
export const rootPaths: RootPathConfig[] = [
  {
    rootPath: 'Grouping',
    paths: [
      {
        matcher: getFreePathsMatcher('Grouping', ['/game/main']),
        ...pathValidation,
      },
    ],
  },
  {
    rootPath: 'tbm',
    paths: [
      {
        matcher: getFreePathsMatcher('tbm', []),
        ...pathValidation,
      },
    ],
  },
  {
    rootPath: 'KM',
    paths: [
      {
        matcher: getFreePathsMatcher('KM', ['/demoDriven']),
        ...pathValidation,
      },
    ],
  },
]

/**
 * Next.js middleware関数
 * 認証が必要なパスへのアクセスを検証し、未認証の場合はリダイレクト
 */
export async function middleware(req: NextRequest): Promise<NextResponse> {
  try {
    // NextAuthからセッショントークンを取得
    const session: JWT | null = await getToken({req})

    const {pathname, origin} = req.nextUrl

    console.log(pathname) //logs

    // 対象となるルートパスを検索
    const targetPathConfig = rootPaths.find(config => {
      const rootPathRegex = new RegExp(`^/${config.rootPath}`)
      return rootPathRegex.test(pathname)
    })

    if (!targetPathConfig) {
      // 対象パスでない場合はそのまま通過
      return NextResponse.next()
    }

    // パス設定に一致するマッチャーを検索
    if (targetPathConfig.paths.length > 0) {
      const matchedPathConfig = targetPathConfig.paths.find(pathConfig => {
        try {
          const matcherRegex = new RegExp(pathConfig.matcher)
          return matcherRegex.test(pathname)
        } catch (error) {
          // 正規表現エラーの場合はログを出力してスキップ
          console.error(`Invalid regex pattern: ${pathConfig.matcher}`, error)
          return false
        }
      })

      // マッチしたパスで認証が必要な場合、セッションを検証
      if (matchedPathConfig && !matchedPathConfig.isValid(session)) {
        const redirectUrl = matchedPathConfig.redirect(origin, targetPathConfig.rootPath)

        return NextResponse.redirect(new URL(redirectUrl, req.url))
      }
    }

    return NextResponse.next()
  } catch (error) {
    // エラーが発生した場合はログを出力してそのまま通過
    // （本番環境では適切なエラーハンドリングを検討）
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

/**
 * Middleware設定
 * マッチャーで対象となるパスを指定
 * Next.jsのmiddlewareでは、config.matcherは静的な値である必要があります
 */
 const config = {
  matcher: ['/Grouping(.*)', '/tbm(.*)', '/KM(.*)', '/((?!api|_next/static|favicon.ico|manifest|next-js-icon).*)'],
} as const

export default middleware
