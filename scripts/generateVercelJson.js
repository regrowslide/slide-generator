/**
 * vercel.jsonのcronジョブをbatchMaster.tsから動的に生成するスクリプト
 *
 * batchMaster.tsのBATCH_MASTERをテキスト解析し、effectOnが'batch'のエントリから
 * idとscheduleを抽出してcron設定を生成します。
 *
 * ※ npx tsxでの実行はハンドラーの依存ツリー（CSS, ブラウザ専用モジュール等）が
 *   Node.js環境で解決できないため、テキストパース方式を採用しています。
 *
 * 使用方法:
 *   node scripts/generateVercelJson.js
 *
 * または package.json の prebuild スクリプトで自動実行
 */

const fs = require('fs')
const path = require('path')

/**
 * batchMaster.tsをテキスト解析し、effectOn: 'batch' のエントリから
 * cron設定（path, schedule）を抽出する
 */
function parseBatchMasterCrons(filePath) {
  const rawContent = fs.readFileSync(filePath, 'utf8')

  // コメントアウトされた行を除外（行頭が // の行を削除）
  const content = rawContent
    .split('\n')
    .filter(line => !line.trimStart().startsWith('//'))
    .join('\n')

  // BATCH_MASTERオブジェクトの各エントリブロックを抽出
  // "key: {" から次の "}," までのブロックをマッチ
  const entryRegex = /(\w+):\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g
  const cronJobs = []

  let match
  while ((match = entryRegex.exec(content)) !== null) {
    const block = match[2]

    // effectOn: 'batch' のエントリのみ対象
    if (!/effectOn:\s*['"]batch['"]/.test(block)) continue

    // idを抽出
    const idMatch = block.match(/id:\s*['"]([^'"]+)['"]/)
    if (!idMatch) continue

    // scheduleを抽出
    const scheduleMatch = block.match(/schedule:\s*['"]([^'"]+)['"]/)
    if (!scheduleMatch) continue

    cronJobs.push({
      path: `/api/cron/execute/${idMatch[1]}`,
      schedule: scheduleMatch[1],
    })
  }

  // パスでソート（一貫性のため）
  cronJobs.sort((a, b) => a.path.localeCompare(b.path))
  return cronJobs
}

function generateVercelJson() {
  try {
    const vercelJsonPath = path.join(__dirname, '../vercel.json')
    const vercelJson = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'))

    const batchMasterPath = path.join(__dirname, '../src/non-common/cron/batchMaster.ts')

    try {
      const dynamicCrons = parseBatchMasterCrons(batchMasterPath)

      if (!Array.isArray(dynamicCrons) || dynamicCrons.length === 0) {
        throw new Error('No cron jobs found in batch master')
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
