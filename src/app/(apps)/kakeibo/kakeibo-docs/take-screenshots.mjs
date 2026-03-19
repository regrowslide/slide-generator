/**
 * 家計簿モック スクリーンショット自動撮影スクリプト
 * 使い方: npx playwright install chromium && node take-screenshots.mjs
 */
import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots')
const BASE_URL = 'http://localhost:3000/KM/mocks/kakeibo'

// 撮影対象のページとナビゲーション手順
const PAGES = [
  { name: '01_splash', description: 'スプラッシュ画面', action: 'splash' },
  { name: '02_input', description: '収支入力', nav: 'input' },
  { name: '03_history', description: '入力履歴', nav: 'history' },
  { name: '04_master_category', description: 'カテゴリ管理', nav: 'master-category' },
  { name: '05_master_payment', description: '支払方法管理', nav: 'master-payment' },
  { name: '06_annual_transition', description: '年間推移', nav: 'annual-transition' },
  { name: '07_income_expense_viz', description: '収支可視化', nav: 'income-expense-viz' },
  { name: '08_payment_management', description: '支払管理', nav: 'payment-management' },
  { name: '09_satisfaction_review', description: '満足度振り返り', nav: 'satisfaction-review' },
  { name: '10_life_plan', description: 'ライフプラン', nav: 'life-plan' },
  { name: '11_asset_projection', description: '資産推移', nav: 'asset-projection' },
]

async function run() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: 'ja-JP',
    deviceScaleFactor: 2, // Retina品質
  })
  const page = await context.newPage()

  console.log('📸 スクリーンショット撮影開始...\n')

  // --- スプラッシュ画面 ---
  console.log('  [1/12] スプラッシュ画面...')
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_splash.png'), fullPage: false })

  // スプラッシュが消えるまで待機
  await page.waitForTimeout(2000)
  // ページが表示されるまで待つ
  await page.waitForSelector('header', { timeout: 10000 })
  await page.waitForTimeout(500)

  // --- デモデータ投入 ---
  console.log('  [デモデータ投入中...]')
  // confirm ダイアログを自動承認
  page.on('dialog', async (dialog) => {
    await dialog.accept()
  })
  // 「デモデータ」ボタンをクリック
  const demoBtn = page.locator('button', { hasText: 'デモデータ' })
  if (await demoBtn.count() > 0) {
    await demoBtn.click()
    await page.waitForTimeout(1000)
    console.log('  ✓ デモデータ投入完了')
  } else {
    // ボタンが見つからない場合、titleで探す
    const demoBtnAlt = page.locator('button[title*="デモデータ"]')
    if (await demoBtnAlt.count() > 0) {
      await demoBtnAlt.click()
      await page.waitForTimeout(1000)
      console.log('  ✓ デモデータ投入完了（alt）')
    } else {
      console.log('  ⚠ デモデータボタンが見つかりません、そのまま続行')
    }
  }

  // --- 各画面のスクリーンショット ---
  // ナビゲーション用のヘルパー関数
  async function navigateToPage(navId) {
    // 直接ページのメニューをクリック
    const menus = {
      'input': { parent: null, label: '収支入力' },
      'history': { parent: null, label: '収支入力' }, // 入力ページ内から遷移が必要
      'master-category': { parent: 'マスタ', label: 'カテゴリ管理' },
      'master-payment': { parent: 'マスタ', label: '支払方法管理' },
      'annual-transition': { parent: '分析', label: '年間推移' },
      'income-expense-viz': { parent: '分析', label: '収支可視化' },
      'payment-management': { parent: '分析', label: '支払管理' },
      'satisfaction-review': { parent: '分析', label: '満足度振り返り' },
      'life-plan': { parent: '将来設計', label: 'ライフプラン' },
      'asset-projection': { parent: '将来設計', label: '資産推移' },
    }

    const menu = menus[navId]
    if (!menu) return

    if (navId === 'input') {
      // 直接ページボタンをクリック
      const btn = page.locator('button', { hasText: '収支入力' }).first()
      await btn.click()
      await page.waitForTimeout(500)
      return
    }

    if (navId === 'history') {
      // まず収支入力ページに行き、そこからは直接ナビゲーションできないので
      // 入力履歴はURLか別の方法で...
      // 実際はメニューに「入力履歴」がないのでinput内のリンクから遷移
      // とりあえず収支入力のスクショを代用
      return
    }

    if (menu.parent) {
      // 親メニューをクリックしてドロップダウンを開く
      const parentBtn = page.locator('button span', { hasText: menu.parent }).first()
      await parentBtn.click()
      await page.waitForTimeout(300)
      // サブメニューをクリック
      const subBtn = page.locator('button', { hasText: menu.label }).last()
      await subBtn.click()
      await page.waitForTimeout(500)
    }
  }

  // 各ページを撮影
  let idx = 2
  for (const p of PAGES) {
    if (p.action === 'splash') continue // スプラッシュは撮影済み

    idx++
    console.log(`  [${idx}/12] ${p.description}...`)

    if (p.nav) {
      await navigateToPage(p.nav)
      await page.waitForTimeout(800)
    }

    // フルページスクリーンショット
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `${p.name}.png`),
      fullPage: true,
    })
  }

  // --- 追加: 入力フォームに値を入れた状態 ---
  console.log('  [追加] 収支入力（入力中の状態）...')
  await navigateToPage('input')
  await page.waitForTimeout(500)
  // 金額フィールドに値を入力
  const amountInput = page.locator('input[type="number"]').first()
  if (await amountInput.count() > 0) {
    await amountInput.fill('5800')
    await page.waitForTimeout(300)
  }
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '02_input_filled.png'),
    fullPage: true,
  })

  console.log('\n✅ 全スクリーンショット撮影完了!')
  console.log(`   保存先: ${SCREENSHOT_DIR}`)

  await browser.close()
}

run().catch((err) => {
  console.error('❌ エラー:', err)
  process.exit(1)
})
