/**
 * vercel.jsonのcronジョブをbatchMaster.tsから動的に生成するスクリプト
 *
 * batchMaster.tsのBATCH_MASTERから、effectOnが'batch'のアクションを抽出し、
 * scheduleとdescriptionからcron設定を生成します。
 *
 * 使用方法:
 *   node scripts/generateVercelJson.js
 *
 * または package.json の prebuild スクリプトで自動実行
 */

const fs = require('fs')
const path = require('path')

async function generateVercelJson() {
  try {
    const vercelJsonPath = path.join(__dirname, '../vercel.json')
    const vercelJson = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'))

    const {execSync} = require('child_process')

    // batchMaster.tsからcronジョブを取得
    try {
      // 一時的なTypeScriptファイルを作成
      const tempScriptPath = path.join(__dirname, 'temp-generate-crons.ts')
      const batchMasterCode = `import {BATCH_MASTER} from '../src/non-common/cron/batchMaster'

// effectOnが'batch'のアクションを抽出し、cron設定を生成
const cronJobs = []

for (const batch of Object.values(BATCH_MASTER)) {
  if (batch.effectOn === 'batch' && batch.schedule && batch.description) {
    // descriptionからAPIパスを取得（前後の空白を削除）
    const apiPath = batch.description.trim()
    cronJobs.push({
      path: apiPath,
      schedule: batch.schedule,
    })
  }
}

// パスでソート（一貫性のため）
cronJobs.sort((a, b) => a.path.localeCompare(b.path))

console.log(JSON.stringify(cronJobs))
`

      fs.writeFileSync(tempScriptPath, batchMasterCode, 'utf8')

      // DATABASE_URLが必要なモジュールがあるため、ダミー値を設定
      const env = {...process.env, DATABASE_URL: 'postgresql://dummy:dummy@localhost:5432/dummy'}

      const result = execSync(`npx tsx ${tempScriptPath}`, {
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8',
        env: env,
      })

      // 一時ファイルを削除
      fs.unlinkSync(tempScriptPath)

      const dynamicCrons = JSON.parse(result.trim())

      if (!Array.isArray(dynamicCrons) || dynamicCrons.length === 0) {
        // console.('No cron jobs found in batch master')
      }

      vercelJson.crons = dynamicCrons
      console.log(`✅ ${dynamicCrons.length}個のcronジョブをbatchMaster.tsから取得しました`)
    } catch (error) {
      console.error('❌ batchMaster.tsからのcronジョブ取得に失敗しました:', error.message)
      console.error(error.stack)
      process.exit(1)
    }

    // vercel.jsonを更新
    fs.writeFileSync(vercelJsonPath, JSON.stringify(vercelJson, null, 1) + '\n', 'utf8')
    console.log('✅ vercel.jsonを更新しました')
    console.log(`   ${vercelJson.crons.length}個のcronジョブを設定しました`)
  } catch (error) {
    console.error('❌ vercel.jsonの生成に失敗しました:', error)
    process.exit(1)
  }
}

generateVercelJson()
