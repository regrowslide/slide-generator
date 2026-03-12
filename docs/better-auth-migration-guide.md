# better-auth 移行ガイド（別プロジェクトへの適用手順）

このドキュメントは、KMKMプロジェクトで実装した better-auth ベースの認証基盤を、
同じ next-auth（v4, JWT戦略）で動いている別プロジェクトに適用する際の手順と注意点をまとめたものです。

---

## 目次

1. [前提条件](#1-前提条件)
2. [パッケージの変更](#2-パッケージの変更)
3. [コピーするファイル一覧](#3-コピーするファイル一覧)
4. [環境変数の設定](#4-環境変数の設定)
5. [Prismaスキーマの変更](#5-prismaスキーマの変更)
6. [データ移行スクリプトの実行](#6-データ移行スクリプトの実行)
7. [User CRUD ロジックの注意点](#7-user-crudロジックの注意点)
8. [認証フローの書き換え](#8-認証フローの書き換え)
9. [セッション管理の書き換え](#9-セッション管理の書き換え)
10. [RoleAllocationTable の設定](#10-rolealocationtableの設定)
11. [Googleログインの注意点](#11-googleログインの注意点)
12. [LINEログインの注意点](#12-lineログインの注意点)
13. [Userテーブルの不要項目](#13-userテーブルの不要項目)
14. [doStandardPrisma のパスワード処理](#14-dostandardprismaのパスワード処理)
15. [proxy.ts の認証チェック](#15-proxytsの認証チェック)
16. [なりすまし機能](#16-なりすまし機能)
17. [削除すべきファイル](#17-削除すべきファイル)
18. [型チェック・ビルド確認](#18-型チェックビルド確認)
19. [動作確認チェックリスト](#19-動作確認チェックリスト)
20. [トラブルシューティング](#20-トラブルシューティング)

---

## 1. 前提条件

- 移行元：next-auth v4（JWT戦略、Credentials + Google/LINE OAuth）
- 移行先：better-auth v1.5.5+（DBセッション + Cookie caching）
- DB：PostgreSQL + Prisma
- User.id：`Int @id @default(autoincrement())` → `String @id @default(uuid())`
- パスワード：プレーンテキスト or bcrypt → scrypt（better-auth標準）に統一

---

## 2. パッケージの変更

```bash
# インストール
npm install better-auth cookie @types/cookie

# アンインストール（全ての移行が完了してから）
npm uninstall next-auth
```

> **注意**: `next-auth` のアンインストールは全ての書き換えが完了し、動作確認後に行うこと。

---

## 3. コピーするファイル一覧

### 新規作成ファイル（コピー元 → 移行先に配置）

| ファイル | 内容 |
|---------|------|
| `src/lib/auth.ts` | better-auth サーバー設定（プロバイダ、セッション、プラグイン） |
| `src/lib/auth-client.ts` | better-auth クライアント設定（signIn, signOut, useSession） |
| `src/lib/services/AuthService.ts` | User + Account の作成・更新・パスワード管理 |
| `src/app/api/auth/[...all]/route.ts` | better-auth APIルートハンドラ |
| `scripts/migrate-to-better-auth.ts` | データ移行スクリプト（Int→String、パスワードハッシュ化等） |
| `src/cm/components/Impersonation/ImpersonationButton.tsx` | なりすまし用ユーザー選択ボタン + モーダル |
| `src/cm/components/Impersonation/ImpersonationBanner.tsx` | なりすまし中の解除バナー |

### 書き換え対象ファイル

| ファイル | 変更内容 |
|---------|---------|
| `src/cm/hooks/globalHooks/useMySession.tsx` | `useSession()` を better-auth 版に変更 |
| `src/cm/providers/AppRootProvider.tsx` | next-auth `SessionProvider` を除去 |
| `src/cm/providers/SessionContextProvider.tsx` | better-auth セッション対応 |
| `src/app/(utils)/login/components/CredintialLoginForm.tsx` | `authClient.signIn.email()` に変更 |
| `src/app/(utils)/login/components/GoogleLoginForm.tsx` | `authClient.signIn.social()` に変更 |
| `src/app/(utils)/login/components/LogInFormWrapper.tsx` | モード切替を維持 |
| `src/app/(utils)/login/page.tsx` | サーバーサイドセッション取得を変更 |
| `src/app/(utils)/logout/LogoutForm.tsx` | `authClient.signOut()` に変更 |
| `src/non-common/serverSideFunction.tsx` | `sessionOnServer()` を better-auth 版に変更 |
| `src/app/api/prisma/isAllowed.tsx` | `BETTER_AUTH_SECRET` 参照に変更 |
| `src/proxy.ts` | cookie名を `better-auth.session_token` に変更 |

---

## 4. 環境変数の設定

### 追加する環境変数

```env
BETTER_AUTH_SECRET=<シークレットキー>
BETTER_AUTH_URL=http://localhost:3000
```

### 不要になる環境変数

```env
# 移行完了後に削除
NEXTAUTH_SECRET=...
NEXTAUTH_URL=...
```

### 継続利用する環境変数

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
LINE_CLIENT_ID=...       # LINEログイン使用時
LINE_CLIENT_SECRET=...   # LINEログイン使用時
NEXT_PUBLIC_ALLOW_GOOGLE_LOGIN=true  # Googleログイン有効化
NEXT_PUBLIC_NO_LOGIN=false           # ログインなしモード
```

> **注意**: `BETTER_AUTH_URL` を設定しないと `Could not determine the base URL` 警告が出てOAuthコールバックが失敗する。

---

## 5. Prismaスキーマの変更

### 5-1. User.id の型変更（Int → String）

```prisma
// Before
model User {
  id Int @id @default(autoincrement())
  // ...
}

// After
model User {
  id String @id @default(uuid())
  // ...
}
```

### 5-2. better-auth 必須テーブルの追加

```prisma
model Session {
  id             String    @id @default(uuid())
  userId         String
  token          String    @unique
  expiresAt      DateTime
  ipAddress      String?
  userAgent      String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  impersonatedBy String?
  User           User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Account {
  id                    String    @id @default(uuid())
  userId                String
  accountId             String
  providerId            String
  accessToken           String?
  refreshToken          String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  idToken               String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  User                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Verification {
  id         String    @id @default(uuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime? @default(now())
  updatedAt  DateTime? @updatedAt
}
```

### 5-3. User モデルに better-auth 標準フィールドを追加

```prisma
model User {
  id            String    @id @default(uuid())
  email         String?   @unique
  emailVerified Boolean   @default(false)  // ← 追加
  image         String?                     // ← 追加（なければ）
  // ... 既存フィールド
  Session       Session[]                   // ← リレーション追加
  Account       Account[]                   // ← リレーション追加
}
```

### 5-4. 全FK参照の Int → String 変更

**対象**: User.id を参照する全モデルの全FKフィールド

```prisma
// Before
model UserRole {
  userId Int
}

// After
model UserRole {
  userId String
}
```

**影響モデル一覧（プロジェクトに応じて確認）:**

| モデル | FKフィールド | nullable |
|--------|-------------|----------|
| UserRole | userId | No |
| ExerciseMaster | userId | No |
| WorkoutLog | userId | No |
| RgStaffRecord | userId | Yes |
| RgStaffManualData | userId | Yes |
| SbmReservation | userId | Yes |
| SbmReservationChangeHistory | userId | Yes |
| SbmDeliveryAssignment | userId | Yes |
| SbmDeliveryGroup | userId | No |
| DentalExamination | doctorId, hygienistId | Yes |
| CounselingSlot | userId | Yes |
| YamanokaiEvent | clId, slId | clId:No, slId:Yes |
| YamanokaiAttendance | userId, approvedBy | userId:No, approvedBy:Yes |
| KidsChild | userId | No |

### 5-5. スキーマ反映の手順

```bash
# ⚠️ prisma db push は Int→String 変換時にデータを消すので、
# 先に移行スクリプトでDB上の型を変更してからスキーマを反映する
npx tsx scripts/migrate-to-better-auth.ts --dry-run   # まずプレビュー
npx tsx scripts/migrate-to-better-auth.ts --execute    # 本番実行
npx prisma db push                                     # スキーマ反映
npx prisma generate                                    # クライアント再生成
```

---

## 6. データ移行スクリプトの実行

移行スクリプト `scripts/migrate-to-better-auth.ts` は以下を実行する：

### 実行される処理

| Step | 内容 | 詳細 |
|------|------|------|
| A | User.role 変換 | `管理者` → `admin` に統一 |
| C | User.id Int → Text + カラム追加 | FK制約を一時削除 → 依存テーブル・User.idの型をALTER TABLE USING castで変更 → FK再作成 → emailVerified / image カラム追加 |
| D | ReleaseNotes配列変換 | confirmedUserIds: Int[] → Text[] |
| E | テーブル作成 | session, account, verification テーブルをCREATE TABLE |
| F | Account レコード生成 | 既存ユーザーの credential Account + LINE Account 作成 |
| G | パスワード scrypt ハッシュ化 | User.password → Account.password（scrypt形式、プレーンテキストのみ変換。bcrypt済みはスキップ） |

### 実行手順

```bash
# 1. 事前確認（ドライラン）
npx tsx scripts/migrate-to-better-auth.ts --dry-run

# 2. DBバックアップ取得
pg_dump -U <user> <database> > backup_before_migration.sql

# 3. 本番実行
npx tsx scripts/migrate-to-better-auth.ts --execute

# 4. Prismaスキーマ反映
npx prisma db push
npx prisma generate
```

### カスタマイズが必要な箇所

移行スクリプトをコピーする際、以下をプロジェクトに合わせて修正：

1. **FK参照テーブル一覧** (`DEPENDENT_COLUMNS` 定数) — プロジェクト固有のモデルに合わせる。テーブル名は Prisma モデル名ではなく **DBの実テーブル名**（`@@map` で指定された名前）を使うこと
2. **User.role の変換マッピング** — プロジェクトのロール名に合わせる
3. **LINE連携** — LINE OAuth を使っていない場合は Step F の LINE 部分を削除
4. **ReleaseNotes** — このモデルがない場合は Step D を削除
5. **DB接続情報** — `DATABASE_URL` 環境変数を確認

### User + Account の作成・パスワードリセット

移行後のユーザー作成やパスワードリセットは `AuthService` を使用する：

```typescript
import { AuthService } from 'src/lib/services/AuthService'

// ユーザー作成（シード・バッチ用）
await AuthService.createUserDirect({
  password: 'admin12345',
  prismaData: {
    name: '管理者',
    email: 'admin@gmail.com',
    role: 'admin',
  },
})

// 既存ユーザーの Upsert（存在すれば更新、なければ作成）
await AuthService.upsertUser({
  email: 'admin@gmail.com',
  name: '管理者',
  role: 'admin',
  password: 'admin12345',
})

// パスワードのみリセット
await AuthService.updatePassword(userId, 'new-password')
```

---

## 7. User CRUDロジックの注意点

### 7-1. 原則：全ての User 作成・更新は AuthService 経由

```typescript
import { AuthService } from 'src/lib/services/AuthService'

// ✅ ユーザー作成（管理画面、シード、バッチ処理）
await AuthService.createUserDirect({
  password: 'initial-password',
  prismaData: {
    name: '山田太郎',
    email: 'yamada@example.com',
    // ... その他フィールド
  },
})

// ✅ ユーザー更新（email変更時にAccount.accountIdも自動同期）
await AuthService.updateUser(
  { id: userId },
  { name: '新しい名前', email: 'new@example.com' },
  'new-password',  // パスワード変更がある場合のみ（省略可）
)

// ✅ パスワードのみ変更
await AuthService.updatePassword(userId, 'new-password')

// ❌ 禁止：prisma.user.create を直接呼ばない
// → Account レコードが作成されず、ログインできなくなる

// ❌ 禁止：prisma.user.update を直接呼ばない
// → email変更時にAccount.accountIdが不整合になる
```

### 7-2. AuthService の各メソッド

| メソッド | 用途 | セッション要否 |
|---------|------|-------------|
| `createUser()` | Admin Plugin 経由のユーザー作成 | 必要（管理者セッション） |
| `createUserDirect()` | Prisma直接のユーザー作成（シード・バッチ用） | 不要 |
| `upsertUser()` | email で Upsert（存在すれば更新、なければ作成） | 不要 |
| `updateUser()` | ユーザー情報更新（email同期 + PW変更対応） | 不要 |
| `updatePassword()` | パスワードのみ更新 | 不要 |
| `validateEmail()` | メール形式チェック（他メソッド内で自動呼出） | - |

### 7-3. emailバリデーション

`AuthService` の `createUser`, `createUserDirect`, `updateUser` は email 指定時に自動でバリデーションを実行する。
不正な形式の場合はエラーをスローする。

```typescript
// バリデーションロジック
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
```

### 7-4. パスワードの保存先

| 項目 | next-auth 時代 | better-auth |
|------|---------------|-------------|
| 保存先 | `User.password` | `Account.password` |
| ハッシュ | bcrypt or プレーンテキスト | scrypt（salt:hash形式） |
| ハッシュ関数 | `bcrypt.hash()` | `hashPassword()` from `better-auth/crypto` |

> **重要**: better-auth ではログイン時に `Account.password` を参照する。
> `User.password` は参照されないが、一部レガシー処理で残存する場合がある（後述）。

### 7-5. prisma.user.update の全箇所を洗い出す方法

```bash
# プロジェクト内の直接呼び出しを検索
grep -r "prisma\.user\.update" src/ --include="*.ts" --include="*.tsx"
grep -r "prisma\.user\.create" src/ --include="*.ts" --include="*.tsx"
grep -r "prisma\.user\.upsert" src/ --include="*.ts" --include="*.tsx"
```

検出された全箇所を `AuthService` 経由に変更する。
ただし `prisma.user.updateMany`（バルク操作、emailに関係しない場合）は例外として残してよい。

---

## 8. 認証フローの書き換え

### 8-1. ログイン（Credentials）

```typescript
// Before (next-auth)
import { signIn } from 'next-auth/react'
await signIn('credentials', { email, password, redirect: false })

// After (better-auth)
// authClient のほか signIn, signOut, signUp, useSession も直接エクスポートされている
import { authClient } from 'src/lib/auth-client'
const result = await authClient.signIn.email({ email, password })
if (result.data) { /* 成功 */ }
if (result.error) { /* 失敗 */ }
```

### 8-2. ログイン（Google OAuth）

```typescript
// Before (next-auth)
import { signIn } from 'next-auth/react'
await signIn('google', { callbackUrl: '/' })

// After (better-auth)
import { authClient } from 'src/lib/auth-client'
await authClient.signIn.social({ provider: 'google', callbackURL: '/' })
```

### 8-3. ログアウト

```typescript
// Before (next-auth)
import { signOut } from 'next-auth/react'
await signOut()

// After (better-auth)
import { authClient } from 'src/lib/auth-client'
await authClient.signOut()
```

### 8-4. サーバーサイドセッション取得

```typescript
// Before (next-auth)
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/constants/authOptions'
const session = await getServerSession(authOptions)

// After (better-auth)
import { auth } from 'src/lib/auth'
import { headers } from 'next/headers'
const sessionData = await auth.api.getSession({ headers: await headers() })
const session = sessionData?.user ?? null
```

### 8-5. APIルート

```typescript
// Before: src/app/api/auth/[...nextauth]/route.tsx
import NextAuth from 'next-auth'
import { authOptions } from './constants/authOptions'
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

// After: src/app/api/auth/[...all]/route.ts
import { toNextJsHandler } from 'better-auth/next-js'
import { auth } from 'src/lib/auth'
export const { POST, GET } = toNextJsHandler(auth)
```

---

## 9. セッション管理の書き換え

### 9-1. useMySession フック

```typescript
// Before (next-auth)
import { useSession } from 'next-auth/react'
const { data: session, status } = useSession()

// After (better-auth)
import { useSession } from 'src/lib/auth-client'
const { data: sessionData, isPending } = useSession()
const userData = (sessionData?.user ?? null) as unknown as User | null
```

### 9-2. AppRootProvider

```typescript
// Before: next-auth の SessionProvider でラップ
import { SessionProvider } from 'next-auth/react'
<SessionProvider session={session}>
  {children}
</SessionProvider>

// After: SessionProvider は不要（better-auth は Cookie ベース）
// AppRootProvider から SessionProvider を除去
```

### 9-3. セッション型

```typescript
// Before: next-auth の Session 型拡張（next-auth.d.ts）
declare module 'next-auth' {
  interface Session {
    user: { id: number; name: string; /* ... */ }
  }
}

// After: Prisma の User 型をそのまま使用
import type { User } from '@prisma/generated/prisma/client'
// session?.user は User 型
```

### 9-4. JWT → DB セッション

| 項目 | next-auth (JWT) | better-auth (DB) |
|------|----------------|-----------------|
| 保存場所 | Cookie (JWT) | DB (Session テーブル) + Cookie (token) |
| 有効期限 | JWT exp | Session.expiresAt |
| パフォーマンス | 検証のみ | Cookie caching (5分) で軽減 |
| Cookie名 | `next-auth.session-token` | `better-auth.session_token` |

### 9-5. セッション有効期限の設定

`src/lib/auth.ts` の `session.expiresIn` はアプリごとに条件分岐が可能：

```typescript
session: {
  expiresIn: process.env.NEXT_PUBLIC_ROOTPATH === 'Grouping'
    ? 3600        // 1時間（短期セッション用途）
    : 2592000,    // 30日（通常アプリ）
  cookieCache: {
    enabled: true,
    maxAge: 300,  // 5分間のCookieキャッシュ
  },
},
```

別プロジェクトに適用する際は、用途に合わせて `expiresIn` の値を調整すること。

---

## 10. RoleAllocationTableの設定

### 10-1. User.id String 化に伴う修正

RoleAllocationTable で `query.userId` を使ってユーザーを検索する箇所で、
`Number()` キャストを削除する必要がある。

```typescript
// Before（Int時代）
{ id: query.userId && Number(query.userId ?? 0) }

// After（String化後）
...(query.userId ? [{ id: query.userId }] : [])
```

### 10-2. createUserFetchProps のデフォルト値

```typescript
// RoleAllocationTable 内の fetchUsers デフォルト where句
const {
  where = {
    AND: [
      { apps: { has: useGlobalProps.rootPath } },
      ...(query.userId ? [{ id: query.userId }] : []),        // String型で直接比較
      ...(query.storeId ? [{ storeId: Number(query.storeId) }] : []),  // storeIdはInt型のまま
    ]
  },
  // ...
} = createUserFetchProps?.(query) ?? {}
```

### 10-3. アプリごとのカスタマイズ

各アプリで `createUserFetchProps` を指定してフィルタ条件をカスタマイズできる。
userId の比較は String のまま、それ以外のInt型FK（storeId等）は `Number()` で変換する。

---

## 11. Googleログインの注意点

### 11-1. OAuth コールバックURLの変更

```
# Before (next-auth)
/api/auth/callback/google

# After (better-auth)
/api/auth/callback/google   ← パスは同じだがハンドラが [...all] に変わる
```

Google Cloud Console でリダイレクトURIの設定変更は不要（パスが同一のため）。

### 11-2. 既存ユーザーのみ許可（未登録ユーザーの自動作成を抑止）

```typescript
// src/lib/auth.ts の socialProviders 設定
socialProviders: {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // ↓ 未登録メールでのログイン試行をブロックしたい場合はフックで制御
  },
},
```

### 11-3. Account テーブルとの連携

Google OAuth ログイン時、better-auth は自動的に Account レコードを作成する：
- `providerId: 'google'`
- `accountId: GoogleのサブジェクトID`
- `accessToken`, `refreshToken` 等も保存

既存ユーザーの Google Account レコードは、初回ログイン時に自動生成されるため、
移行スクリプトでの事前作成は不要。

### 11-4. accountLinking 設定

```typescript
// src/lib/auth.ts
account: {
  accountLinking: {
    trustedProviders: ['google', 'line'],
  },
},
```

同じメールアドレスの User に対して、credential と google の Account が自動的にリンクされる。

---

## 12. LINEログインの注意点

### 12-1. LINE Account の移行

移行スクリプトの Step F で、`User.lineUserId` が存在するユーザーの LINE Account レコードを自動生成する。

```sql
-- 移行スクリプトが実行する内容
INSERT INTO account (id, "userId", "accountId", "providerId", ...)
SELECT gen_random_uuid(), id, "lineUserId", 'line', ...
FROM "User" WHERE "lineUserId" IS NOT NULL
```

### 12-2. LINE ログインを使わないプロジェクト

`src/lib/auth.ts` から LINE プロバイダの設定を削除し、移行スクリプトの LINE 関連部分も削除する。

---

## 13. Userテーブルの不要項目

### 13-1. better-auth 移行後に不要になるフィールド

| フィールド | 理由 | 対応 |
|-----------|------|------|
| `User.password` | Account.password に移行済み | 段階的に廃止（後述） |
| `User.lineUserId` | Account テーブルの accountId で管理 | 段階的に廃止 |

### 13-2. User.password の段階的廃止

better-auth はログイン時に `Account.password` を参照するため、`User.password` は認証には使われない。
ただし以下の箇所が `User.password` を参照している可能性がある：

1. **`doStandardPrisma/lib.tsx`** — CRUD時に自動的に `User.password` をbcryptハッシュ化する処理がある（後述）
2. **旧ログイン処理の残存** — `checkLogin.tsx` 等でプレーンテキスト比較している場合

**推奨手順**:
1. 移行完了後、全てのログインが better-auth 経由で動作することを確認
2. `User.password` への書き込みを全て停止（AuthService経由に統一済みなら対応不要）
3. 十分な運用期間後、`User.password` カラムを nullable にする
4. 最終的にカラムを削除（影響範囲を確認してから）

### 13-3. better-auth が追加するフィールド

| フィールド | 型 | 用途 |
|-----------|-----|------|
| `User.emailVerified` | Boolean | メール認証済みフラグ |
| `User.image` | String? | プロフィール画像URL |

---

## 14. doStandardPrismaのパスワード処理

### 14-1. 現状の問題

`src/cm/lib/server-actions/common-server-actions/doStandardPrisma/lib.tsx` には、
CRUD時にパスワードを自動的にbcryptハッシュ化する処理がある：

```typescript
import { hashPassword } from 'src/cm/lib/crypt'  // bcrypt

// create/update/data 内の password フィールドを自動ハッシュ化
if (queryObject?.data?.password) {
  hasedPW = await hashPassword(queryObject.data.password)
}
```

### 14-2. 対応方針

この処理は `User` モデルだけでなく、password フィールドを持つ全モデルに適用される。

**選択肢A（推奨）**: `doStandardPrisma` 経由で User の create/update を行わないようにする。
AuthService を使うルールを徹底すれば、この自動ハッシュは User に対しては発動しない。

**選択肢B**: `doStandardPrisma` のパスワードハッシュを scrypt に変更する。
ただし User 以外のモデルへの影響を考慮する必要がある。

**選択肢C**: model が 'user' の場合はパスワードハッシュをスキップする条件分岐を追加する。

### 14-3. crypt.tsx のハッシュ関数

```typescript
// src/cm/lib/crypt.tsx — bcrypt ベース（better-auth とは互換性なし）
import bcrypt from 'bcrypt'
export async function hashPassword(password) {
  return await bcrypt.hash(password, 10)
}
```

better-auth は scrypt を使うため、この関数で生成したハッシュでは better-auth 経由のログインができない。
User のパスワード操作は必ず `AuthService` 経由で行うこと。

---

## 15. proxy.tsの認証チェック

### Cookie名の変更

```typescript
// Before (next-auth)
const sessionToken = req.cookies.get('next-auth.session-token')?.value

// After (better-auth)
const sessionToken = req.cookies.get('better-auth.session_token')?.value
```

### API認証ヘッダー

```typescript
// Before
const secretKey = process.env.NEXTAUTH_SECRET

// After
const secretKey = process.env.BETTER_AUTH_SECRET
```

---

## 16. なりすまし機能

### 16-1. 旧方式（廃止済み）

URLクエリパラメータ `__global__userId` でなりすましユーザーを指定し、
`FakeOrKeepSession` / `SessionFaker` / `GlobalIdSelector` でセッションを差し替えていた。
**この方式は完全に廃止済み。**

### 16-2. better-auth Admin Plugin 方式

better-auth の Admin Plugin が提供する impersonation 機能を使用する。
セッション自体が対象ユーザーに完全に切り替わるため、既存の `session.id` 参照が
修正なしで正しく動作する。

```typescript
// クライアント側
import { authClient } from 'src/lib/auth-client'

// なりすまし開始（role: 'admin' のユーザーのみ実行可能）
await authClient.admin.impersonateUser({ userId: targetUserId })
window.location.reload() // セッション切替後にページ全体をリロード

// なりすまし終了
await authClient.admin.stopImpersonating()
window.location.reload()
```

**動作の仕組み:**
- impersonation 開始で新しいセッションが作成され、Cookie が切り替わる
- `session.id` / `session.role` が対象ユーザーのものになる
- Session テーブルの `impersonatedBy` フィールドに元の管理者IDが記録される
- `impersonationSessionDuration`（`auth.ts` で設定、デフォルト1時間）で自動期限切れ

### 16-3. UI コンポーネント

| ファイル | 内容 |
|---------|------|
| `src/cm/components/Impersonation/ImpersonationButton.tsx` | ヘッダーの「ユーザー切替」ボタン + ユーザー選択モーダル |
| `src/cm/components/Impersonation/ImpersonationBanner.tsx` | なりすまし中の固定バナー（ユーザー名表示 + 解除ボタン） |

**Header.tsx での組み込み:**
- `ImpersonationButton` — `session.role === 'admin'` かつ impersonation 中でないとき表示
- `ImpersonationBanner` — `impersonatedBy` が存在するとき画面上部に表示

**useMySession での検出:**
```typescript
// sessionData.session.impersonatedBy でなりすまし中かを判定
const impersonatedBy = (sessionData?.session as anyObject)?.impersonatedBy as string | undefined
```

### 16-4. 廃止対象

| ファイル / 機能 | 状態 |
|---------|------|
| `src/non-common/scope-lib/FakeOrKeepSession.tsx` | 削除 |
| `src/non-common/SessionFaker.tsx` | 削除 |
| `src/app/api/prisma/login/checkLogin.tsx` | 削除 |
| `src/cm/components/GlobalIdSelector/GlobalIdSelector.tsx` | 削除 |
| `globalIds.globalUserId`（`__global__userId`） | 削除 |
| 各アプリ PageBuilder の `getGlobalIdSelector` | 削除 |
| `judgeIsAdmin` の `getGlobalUserId` / `adminSelf` | 削除 |
| `getScopes` の `query.__global__userId` 参照 | 削除 |

### 16-5. `globalIds` の残存項目

`__global__userId` は廃止したが、以下のフィルタ用 globalIds は維持:

- `__global__storeId` — 店舗フィルタ
- `__global__selectedUserId` — ユーザー選択フィルタ
- `__global__teacherId` — 講師フィルタ
- `__global__schoolId` — 学校フィルタ

これらは URL クエリベースのデータフィルタ機能であり、なりすましとは無関係。

---

## 17. 削除すべきファイル

### next-auth 関連（移行完了後に削除）

```
src/app/api/auth/[...nextauth]/route.tsx
src/app/api/auth/[...nextauth]/constants/authOptions.tsx
src/app/api/auth/[...nextauth]/constants/GoogleProvider.tsx
src/app/api/auth/[...nextauth]/constants/LineProvider.tsx
src/app/api/auth/[...nextauth]/constants/normalCredentialsProvider.tsx
src/types/next-auth.d.ts
```

### なりすまし関連（Admin Plugin 移行後に削除）

```
src/non-common/scope-lib/FakeOrKeepSession.tsx
src/non-common/SessionFaker.tsx
src/app/api/prisma/login/checkLogin.tsx
```

---

## 18. 型チェック・ビルド確認

### 修正後の確認手順

```bash
# 1. Prisma クライアント再生成
npx prisma generate

# 2. 型チェック
npx tsc --noEmit

# 3. ビルド
npm run build
```

### よくある型エラー

| エラー | 原因 | 対応 |
|--------|------|------|
| `Type 'number' is not assignable to type 'string'` | userId が Int → String に変わった | `Number()` キャストを削除、String として扱う |
| `Property 'xxx' does not exist on type 'UserCreateInput'` | FK直接指定は `UncheckedCreateInput` が必要 | `Prisma.UserUncheckedCreateInput` を使う |
| `Module '"next-auth"' has no exported member` | next-auth のimportが残っている | better-auth のimportに変更 |
| `Cannot find module 'src/lib/auth'` | auth.ts が未作成 | ファイルをコピー |

---

## 19. 動作確認チェックリスト

### 認証

- [ ] Credentials ログイン（email + password）
- [ ] Credentials ログアウト
- [ ] Google OAuth ログイン（使用する場合）
- [ ] LINE OAuth ログイン（使用する場合）
- [ ] セッション維持（ブラウザ再起動後）
- [ ] セッション有効期限

### 権限管理

- [ ] RoleAllocationTable が表示される
- [ ] 権限の割り当て/解除ができる
- [ ] RoleMaster の追加/編集/削除ができる（管理者のみ）
- [ ] 権限フィルタが動作する

### ユーザー管理

- [ ] 管理画面からのアカウント作成
- [ ] ユーザー情報の更新（name, email）
- [ ] パスワード変更
- [ ] メールアドレス形式のバリデーション

### 各アプリ

- [ ] セッション情報が正しく取得できる（session.id が String）
- [ ] userId を使った検索/フィルタが正常に動作する
- [ ] Server Actions が認証チェックを通過する

### API / プロキシ

- [ ] proxy.ts の認証チェックが動作する
- [ ] isAllowed の認証チェックが動作する
- [ ] Cron Job の認証が動作する

---

## 20. トラブルシューティング

### 「Could not determine the base URL」警告

→ `.env` に `BETTER_AUTH_URL=http://localhost:3000` を設定する。

### ログインしても認証されない

→ Account レコードが存在するか確認。移行スクリプトが正常に実行されたかチェック。

```sql
SELECT u.id, u.email, a.id as account_id, a."providerId"
FROM "User" u
LEFT JOIN account a ON u.id = a."userId"
WHERE u.email = 'xxx@example.com';
```

### パスワードが通らない

→ Account.password が scrypt 形式（`salt:hash`、160文字以上）になっているか確認。
bcrypt ハッシュ（`$2a$...`）のままだとログインできない。

```typescript
// パスワードをリセット（AuthService経由）
await AuthService.updatePassword(userId, 'newpass')

// または upsertUser でユーザーごと再作成/更新
await AuthService.upsertUser({
  email: 'user@example.com',
  name: 'ユーザー名',
  password: 'newpass',
})
```

### prisma db push でデータが消えた

→ Int → String の型変更を `prisma db push` で直接やると、カラムが DROP & CREATE されてデータが消失する。
必ず移行スクリプトを先に実行して ALTER TABLE で型を変更すること。

### Session テーブルが存在しない

→ 移行スクリプトの Step E でテーブル作成を行う。または `prisma db push` で作成。

### proxy.ts で認証が通らない

→ Cookie名を確認。`better-auth.session_token`（アンダースコア）であること。
next-auth は `next-auth.session-token`（ハイフン）だった。
