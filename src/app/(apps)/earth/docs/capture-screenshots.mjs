// モック画面のスクリーンショット撮影スクリプト
import { chromium } from 'playwright'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const IMG_DIR = path.join(__dirname, 'images')
const BASE = 'http://localhost:3000/earth/mock'

// モーダルを閉じるヘルパー
async function closeModals(page) {
  await page.evaluate(() => {
    document.querySelectorAll('.fixed.inset-0').forEach(el => el.remove())
  })
  await page.waitForTimeout(300)
}

// サイドバーメニューをクリック（force: trueでオーバーレイ無視）
async function clickSidebar(page, text) {
  await closeModals(page)
  const btn = page.locator(`aside button:has-text("${text}")`).first()
  await btn.click({ force: true })
  await page.waitForTimeout(500)
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()

  // ページ読み込み + スプラッシュ待ち
  await page.goto(BASE)
  await page.waitForTimeout(2500)

  // 01: ダッシュボード
  await page.screenshot({ path: path.join(IMG_DIR, '01_dashboard.png'), fullPage: true })
  console.log('01_dashboard.png')

  // 02: オーナー管理
  await clickSidebar(page, 'オーナー管理')
  await page.screenshot({ path: path.join(IMG_DIR, '02_owner_list.png'), fullPage: true })
  console.log('02_owner_list.png')

  // 03: オーナー詳細
  await page.locator('td:has-text("山田太郎")').first().click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(IMG_DIR, '03_owner_detail.png'), fullPage: true })
  console.log('03_owner_detail.png')

  // 04: 物件管理
  await closeModals(page)
  await clickSidebar(page, '物件管理')
  await page.screenshot({ path: path.join(IMG_DIR, '04_property_list.png'), fullPage: true })
  console.log('04_property_list.png')

  // 05: ワークスペース（要対応事項タブ）
  await page.locator('td:has-text("サンプルマンションA")').first().click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(IMG_DIR, '05_workspace_actions.png'), fullPage: true })
  console.log('05_workspace_actions.png')

  // 06: 修繕記録タブ
  await page.locator('button:has-text("修繕記録")').click({ force: true })
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(IMG_DIR, '06_workspace_repairs.png'), fullPage: true })
  console.log('06_workspace_repairs.png')

  // 07: 社内チャットタブ
  await page.locator('button:has-text("社内チャット")').click({ force: true })
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(IMG_DIR, '07_workspace_internal_chat.png'), fullPage: true })
  console.log('07_workspace_internal_chat.png')

  // 08: ファイル保管タブ
  await page.locator('button:has-text("ファイル保管")').click({ force: true })
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(IMG_DIR, '08_workspace_files.png'), fullPage: true })
  console.log('08_workspace_files.png')

  // 09: オーナーチャットタブ
  await page.locator('button:has-text("オーナーチャット")').click({ force: true })
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(IMG_DIR, '09_workspace_owner_chat.png'), fullPage: true })
  console.log('09_workspace_owner_chat.png')

  // 10: 入居者チャットタブ
  await page.locator('button:has-text("入居者チャット")').click({ force: true })
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(IMG_DIR, '10_workspace_tenant_chat.png'), fullPage: true })
  console.log('10_workspace_tenant_chat.png')

  // 11: 修繕業者管理
  await clickSidebar(page, '修繕業者管理')
  await page.screenshot({ path: path.join(IMG_DIR, '11_vendor_management.png'), fullPage: true })
  console.log('11_vendor_management.png')

  // 12: 入居者管理
  await clickSidebar(page, '入居者管理')
  await page.screenshot({ path: path.join(IMG_DIR, '12_tenant_management.png'), fullPage: true })
  console.log('12_tenant_management.png')

  // 13: ポータル切替 → オーナーポータル
  await page.locator('button:has-text("社内")').first().click({ force: true })
  await page.waitForTimeout(300)
  await page.locator('button:has-text("オーナー：山田太郎")').click({ force: true })
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(IMG_DIR, '13_owner_portal.png'), fullPage: true })
  console.log('13_owner_portal.png')

  // 14: オーナーポータル物件詳細
  await page.locator('text=サンプルマンションA').first().click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(IMG_DIR, '14_owner_portal_detail.png'), fullPage: true })
  console.log('14_owner_portal_detail.png')

  // 15: ポータル切替 → 修繕業者ポータル
  await page.locator('button:has-text("オーナー")').first().click({ force: true })
  await page.waitForTimeout(300)
  await page.locator('button:has-text("修繕業者")').first().click({ force: true })
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(IMG_DIR, '15_vendor_portal.png'), fullPage: true })
  console.log('15_vendor_portal.png')

  // 16: 修繕業者ポータル依頼詳細
  const card = page.locator('.cursor-pointer').first()
  if (await card.count() > 0) {
    await card.click()
    await page.waitForTimeout(500)
    await page.screenshot({ path: path.join(IMG_DIR, '16_vendor_portal_detail.png'), fullPage: true })
    console.log('16_vendor_portal_detail.png')
  }

  await browser.close()
  console.log('Done!')
}

main().catch(e => { console.error(e); process.exit(1) })
