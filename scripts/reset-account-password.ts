/**
 * 指定したemailのユーザーのAccountパスワードをscryptハッシュで上書きするスクリプト
 *
 * 実行方法:
 *   npx tsx scripts/reset-account-password.ts --email user@example.com --password newpass123
 */

import pg from 'pg'
import crypto from 'crypto'
import { scrypt } from '@noble/hashes/scrypt.js'
import { bytesToHex } from '@noble/hashes/utils.js'
import dotenv from 'dotenv'

dotenv.config()

const { Client } = pg

const SCRYPT_PARAMS = {
  N: 16384,
  r: 16,
  p: 1,
  dkLen: 64,
}

function hashPassword(password: string): string {
  const salt = bytesToHex(crypto.getRandomValues(new Uint8Array(16)))
  const key = scrypt(password, salt, SCRYPT_PARAMS)
  return `${salt}:${bytesToHex(key)}`
}

function getArg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`)
  if (idx === -1 || idx + 1 >= process.argv.length) return undefined
  return process.argv[idx + 1]
}

async function main() {
  const email = getArg('email')
  const password = getArg('password')

  if (!email || !password) {
    console.error('使い方: npx tsx scripts/reset-account-password.ts --email <email> --password <password>')
    process.exit(1)
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()

  try {
    // ユーザー確認
    const { rows: users } = await client.query(
      `SELECT id, email, name FROM "User" WHERE email = $1`, [email]
    )

    if (users.length === 0) {
      console.error(`❌ email "${email}" のユーザーが見つかりません`)
      process.exit(1)
    }

    const user = users[0]
    const userId = String(user.id)
    console.log(`対象ユーザー: ${user.name ?? ''} (${user.email}, id: ${userId})`)

    const scryptHash = hashPassword(password)

    // credential Accountの存在確認
    const { rows: accounts } = await client.query(
      `SELECT id FROM "account" WHERE "userId" = $1 AND "providerId" = 'credential'`,
      [userId]
    )

    if (accounts.length > 0) {
      await client.query(
        `UPDATE "account" SET password = $1, "updatedAt" = NOW()
         WHERE "userId" = $2 AND "providerId" = 'credential'`,
        [scryptHash, userId]
      )
      console.log(`✅ パスワードを更新しました`)
    } else {
      await client.query(
        `INSERT INTO "account" ("id", "userId", "accountId", "providerId", "password", "createdAt", "updatedAt")
         VALUES (gen_random_uuid()::text, $1, $2, 'credential', $3, NOW(), NOW())`,
        [userId, email, scryptHash]
      )
      console.log(`✅ credential Account を新規作成し、パスワードを設定しました`)
    }
  } finally {
    await client.end()
  }
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
