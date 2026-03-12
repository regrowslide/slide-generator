/**
 * next-auth → better-auth 移行スクリプト
 *
 * Prismaを使わず pg クライアントで直接SQLを実行する。
 * DBスキーマ変更（prisma db push）の前に実行する想定。
 *
 * 実行方法:
 *   npx tsx scripts/migrate-to-better-auth.ts --dry-run   # プレビュー
 *   npx tsx scripts/migrate-to-better-auth.ts --execute    # 実行
 */

import pg from 'pg'
import crypto from 'crypto'
import { scrypt } from '@noble/hashes/scrypt.js'
import { bytesToHex } from '@noble/hashes/utils.js'
import dotenv from 'dotenv'

dotenv.config()

const { Client } = pg

// ============================================================================
// 設定
// ============================================================================

/** User.id を参照しているFKの一覧（実テーブル名・実カラム名） */
const DEPENDENT_COLUMNS: { table: string; column: string; nullable: boolean }[] = [
  { table: 'UserRole', column: 'userId', nullable: false },
  { table: 'ExerciseMaster', column: 'userId', nullable: false },
  { table: 'WorkoutLog', column: 'userId', nullable: false },
  { table: 'RgStaffRecord', column: 'userId', nullable: true },
  { table: 'RgStaffManualData', column: 'userId', nullable: true },
  { table: 'SbmReservation', column: 'userId', nullable: true },
  { table: 'SbmReservationChangeHistory', column: 'userId', nullable: true },
  { table: 'SbmDeliveryAssignment', column: 'userId', nullable: true },
  { table: 'sbm_delivery_groups', column: 'userId', nullable: false },
  { table: 'dental_examinations', column: 'doctorId', nullable: true },
  { table: 'dental_examinations', column: 'hygienistId', nullable: true },
  { table: 'CounselingSlot', column: 'userId', nullable: true },
  { table: 'yamanokai_events', column: 'clId', nullable: false },
  { table: 'yamanokai_events', column: 'slId', nullable: true },
  { table: 'yamanokai_attendances', column: 'userId', nullable: false },
  { table: 'yamanokai_attendances', column: 'approvedBy', nullable: true },
  { table: 'KidsChild', column: 'userId', nullable: false },
]

/** User.role の変換マッピング */
const ROLE_MAPPINGS: Record<string, string> = {
  '管理者': 'admin',
  'user': 'user',
}

/** bcryptハッシュかどうか判定 */
const isBcryptHash = (pw: string): boolean =>
  pw.startsWith('$2a$') || pw.startsWith('$2b$')

/** better-auth標準のscryptパラメータ */
const SCRYPT_PARAMS = { N: 16384, r: 16, p: 1, dkLen: 64 }

/** better-auth互換のscryptハッシュを生成 */
function hashPassword(password: string): string {
  const salt = bytesToHex(crypto.getRandomValues(new Uint8Array(16)))
  const key = scrypt(password, salt, SCRYPT_PARAMS)
  return `${salt}:${bytesToHex(key)}`
}

// ============================================================================
// メイン処理
// ============================================================================

async function main() {
  const isDryRun = process.argv.includes('--dry-run')
  const isExecute = process.argv.includes('--execute')

  if (!isDryRun && !isExecute) {
    console.error('使い方: npx tsx scripts/migrate-to-better-auth.ts [--dry-run | --execute]')
    process.exit(1)
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()

  console.log(`\n${'='.repeat(60)}`)
  console.log(`  better-auth 移行スクリプト (${isDryRun ? 'ドライラン' : '本番実行'})`)
  console.log(`${'='.repeat(60)}\n`)

  // 0. テーブル名確認
  const { rows: tables } = await client.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
  )
  const userTable = tables.find(t => t.tablename === 'User')
  if (!userTable) {
    console.log('利用可能なテーブル:')
    tables.forEach(t => console.log(`  ${t.tablename}`))
    console.error('\n❌ "User" テーブルが見つかりません')
    await client.end()
    process.exit(1)
  }
  console.log(`✅ Userテーブル確認済み`)

  // 1. 現在のユーザー情報を取得
  const { rows: users } = await client.query(
    `SELECT id, email, password, role, "lineUserId" FROM "User"`
  )
  console.log(`対象ユーザー数: ${users.length}`)

  // 2. 各テーブルの影響レコード数を集計
  console.log('\n--- FK参照テーブルの影響レコード数 ---')
  for (const dep of DEPENDENT_COLUMNS) {
    try {
      const { rows } = await client.query(
        `SELECT COUNT(*) as cnt FROM "${dep.table}" WHERE "${dep.column}" IS NOT NULL`
      )
      console.log(`  ${dep.table}."${dep.column}": ${rows[0].cnt}件`)
    } catch (e: any) {
      console.log(`  ⚠ ${dep.table}."${dep.column}": カウント失敗 (${e.message})`)
    }
  }

  // 3. パスワード状況の確認
  const passwordStats = { plain: 0, bcrypt: 0, empty: 0 }
  for (const user of users) {
    if (!user.password) {
      passwordStats.empty++
    } else if (isBcryptHash(user.password)) {
      passwordStats.bcrypt++
    } else {
      passwordStats.plain++
    }
  }
  console.log('\n--- パスワード状況 ---')
  console.log(`  プレーンテキスト: ${passwordStats.plain}件`)
  console.log(`  bcryptハッシュ済: ${passwordStats.bcrypt}件`)
  console.log(`  パスワードなし: ${passwordStats.empty}件`)

  // 4. ロール状況の確認
  const roleStats: Record<string, number> = {}
  for (const user of users) {
    const role = user.role ?? 'user'
    roleStats[role] = (roleStats[role] ?? 0) + 1
  }
  console.log('\n--- ロール状況 ---')
  for (const [role, count] of Object.entries(roleStats)) {
    const mapped = ROLE_MAPPINGS[role] ?? role
    console.log(`  ${role} → ${mapped}: ${count}件`)
  }

  // 5. Account生成対象の確認
  const lineUsers = users.filter(u => u.lineUserId)
  const emailUsers = users.filter(u => u.email)
  console.log('\n--- Account生成対象 ---')
  console.log(`  credentials（email）: ${emailUsers.length}件`)
  console.log(`  LINE: ${lineUsers.length}件`)

  // 6. ReleaseNotes.confirmedUserIds の確認
  try {
    const { rows } = await client.query(
      `SELECT COUNT(*) as cnt FROM "ReleaseNotes" WHERE array_length("confirmedUserIds", 1) > 0`
    )
    console.log(`\n--- ReleaseNotes ---`)
    console.log(`  confirmedUserIds が空でないレコード: ${rows[0].cnt}件`)
  } catch {
    console.log(`\n--- ReleaseNotes ---`)
    console.log(`  ⚠ 確認失敗`)
  }

  if (isDryRun) {
    console.log('\n✅ ドライラン完了。問題なければ --execute で実行してください。\n')
    await client.end()
    return
  }

  // ============================================================================
  // 本番実行
  // ============================================================================

  console.log('\n🚀 移行を開始します...\n')

  try {
    // Step A: User.role の変換
    console.log('Step A: User.role の変換...')
    for (const [oldRole, newRole] of Object.entries(ROLE_MAPPINGS)) {
      if (oldRole === newRole) continue
      const result = await client.query(
        `UPDATE "User" SET role = $1 WHERE role = $2`, [newRole, oldRole]
      )
      console.log(`  ${oldRole} → ${newRole}: ${result.rowCount}件`)
    }
    console.log(`  ✅ ロール変換完了`)

    // Step C: User.id Int → Text 変換（FK制約も含めて）
    console.log('Step C: User.id Int → Text 変換...')

    // C-1: FK制約を全て取得して削除
    console.log('  FK制約を一時的に削除...')
    const { rows: fkConstraints } = await client.query(`
      SELECT tc.constraint_name, tc.table_name, kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_name = 'User'
        AND ccu.column_name = 'id'
    `)

    for (const fk of fkConstraints) {
      console.log(`    DROP CONSTRAINT ${fk.constraint_name} ON ${fk.table_name}`)
      await client.query(`ALTER TABLE "${fk.table_name}" DROP CONSTRAINT "${fk.constraint_name}"`)
    }

    // C-2: 依存テーブルのFKカラムを Int → Text に変換
    console.log('  依存テーブルのFKカラムを変換...')
    for (const dep of DEPENDENT_COLUMNS) {
      try {
        await client.query(
          `ALTER TABLE "${dep.table}" ALTER COLUMN "${dep.column}" TYPE TEXT USING "${dep.column}"::TEXT`
        )
        console.log(`    ✅ ${dep.table}."${dep.column}"`)
      } catch (e: any) {
        console.log(`    ⚠ ${dep.table}."${dep.column}": ${e.message}`)
      }
    }

    // C-3: User.id を Int → Text に変換
    console.log('  User.id を変換...')
    await client.query(`ALTER TABLE "User" ALTER COLUMN "id" TYPE TEXT USING id::TEXT`)
    console.log('    ✅ User.id')

    // C-4: User.emailVerified カラムを追加（存在しない場合）
    try {
      await client.query(
        `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false`
      )
      console.log('    ✅ User.emailVerified 追加')
    } catch (e: any) {
      console.log(`    ⚠ User.emailVerified: ${e.message}`)
    }

    // C-5: User.image カラムを追加（存在しない場合）
    try {
      await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "image" TEXT`)
      console.log('    ✅ User.image 追加')
    } catch (e: any) {
      console.log(`    ⚠ User.image: ${e.message}`)
    }

    // C-6: FK制約を再作成
    console.log('  FK制約を再作成...')
    for (const fk of fkConstraints) {
      try {
        const dep = DEPENDENT_COLUMNS.find(
          d => d.table === fk.table_name && d.column === fk.column_name
        )
        const onDelete = dep?.nullable ? 'SET NULL' : 'CASCADE'

        await client.query(
          `ALTER TABLE "${fk.table_name}" ADD CONSTRAINT "${fk.constraint_name}"
           FOREIGN KEY ("${fk.column_name}") REFERENCES "User"("id")
           ON DELETE ${onDelete} ON UPDATE CASCADE`
        )
        console.log(`    ✅ ${fk.constraint_name}`)
      } catch (e: any) {
        console.log(`    ⚠ ${fk.constraint_name}: ${e.message}`)
      }
    }
    console.log(`  ✅ User.id Int → Text 変換完了`)

    // Step D: ReleaseNotes.confirmedUserIds Int[] → Text[] 変換
    console.log('Step D: ReleaseNotes.confirmedUserIds 変換...')
    try {
      await client.query(
        `ALTER TABLE "ReleaseNotes" ALTER COLUMN "confirmedUserIds" TYPE TEXT[]
         USING ARRAY(SELECT v::TEXT FROM unnest("confirmedUserIds") AS v)`
      )
      console.log('  ✅ confirmedUserIds Int[] → Text[] 変換完了')
    } catch (e: any) {
      console.log(`  ⚠ confirmedUserIds 変換失敗: ${e.message}`)
    }

    // Step E: Session / Account / Verification テーブル作成
    console.log('Step E: better-auth用テーブル作成...')

    await client.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "expiresAt" TIMESTAMP(3) NOT NULL,
        "token" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "userId" TEXT NOT NULL,
        "impersonatedBy" TEXT,
        CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `)
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "session_token_key" ON "session"("token")`)
    console.log('  ✅ session テーブル作成')

    await client.query(`
      CREATE TABLE IF NOT EXISTS "account" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "accountId" TEXT NOT NULL,
        "providerId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "accessToken" TEXT,
        "refreshToken" TEXT,
        "idToken" TEXT,
        "accessTokenExpiresAt" TIMESTAMP(3),
        "refreshTokenExpiresAt" TIMESTAMP(3),
        "scope" TEXT,
        "password" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `)
    console.log('  ✅ account テーブル作成')

    await client.query(`
      CREATE TABLE IF NOT EXISTS "verification" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "identifier" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "expiresAt" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3),
        "updatedAt" TIMESTAMP(3)
      )
    `)
    console.log('  ✅ verification テーブル作成')

    // Step F: Account レコード生成
    console.log('Step F: Account レコード生成...')

    // credentials Account（パスワードは set-account-passwords.ts で別途設定）
    const credResult = await client.query(`
      INSERT INTO "account" ("id", "userId", "accountId", "providerId", "createdAt", "updatedAt")
      SELECT gen_random_uuid()::text, id, email, 'credential', NOW(), NOW()
      FROM "User" WHERE email IS NOT NULL
      ON CONFLICT DO NOTHING
    `)
    console.log(`  ✅ credentials Account 生成: ${credResult.rowCount}件`)

    // LINE Account
    const lineResult = await client.query(`
      INSERT INTO "account" ("id", "userId", "accountId", "providerId", "createdAt", "updatedAt")
      SELECT gen_random_uuid()::text, id, "lineUserId", 'line', NOW(), NOW()
      FROM "User" WHERE "lineUserId" IS NOT NULL
      ON CONFLICT DO NOTHING
    `)
    console.log(`  ✅ LINE Account 生成: ${lineResult.rowCount}件`)

    // Step G: User.password を scrypt ハッシュ化して Account に設定
    console.log('Step G: Account パスワード設定（scryptハッシュ化）...')
    let pwUpdated = 0
    let pwSkipped = 0

    // 生成直後のAccountを取得
    const { rows: credAccounts } = await client.query(
      `SELECT "userId" FROM "account" WHERE "providerId" = 'credential'`
    )
    const credAccountUserIds = new Set(credAccounts.map(a => String(a.userId)))

    for (const user of users) {
      if (!user.password) {
        pwSkipped++
        continue
      }

      const userId = String(user.id)
      if (!credAccountUserIds.has(userId)) {
        pwSkipped++
        continue
      }

      // 既にハッシュ化済み（bcrypt/scrypt）の場合はプレーンテキストが不明なのでスキップ
      const isHashed = isBcryptHash(user.password) ||
        (user.password.includes(':') && user.password.length > 100)
      if (isHashed) {
        console.log(`  ⚠ ${user.email}: 既にハッシュ済み（スキップ）`)
        pwSkipped++
        continue
      }

      // プレーンテキスト → scryptハッシュ化してAccountに設定
      const scryptHash = hashPassword(user.password)
      await client.query(
        `UPDATE "account" SET password = $1, "updatedAt" = NOW()
         WHERE "userId" = $2 AND "providerId" = 'credential'`,
        [scryptHash, userId]
      )
      pwUpdated++
      console.log(`  ✅ ${user.email}`)
    }
    console.log(`  パスワード設定: ${pwUpdated}件、スキップ: ${pwSkipped}件`)

    console.log('\n✅ 移行完了!')
    console.log('次のステップ:')
    console.log('  1. npx prisma db push  （スキーマ同期）')
    console.log('  2. npx prisma generate')
    console.log('  3. better-auth コードをデプロイ')
  } catch (error) {
    console.error('\n❌ 移行中にエラーが発生しました:', error)
    throw error
  } finally {
    await client.end()
  }
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
