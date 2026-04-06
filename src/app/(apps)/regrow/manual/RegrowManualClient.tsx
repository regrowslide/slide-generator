'use client'

import React, { useState, useEffect } from 'react'

/** 目次セクション定義 */
const TOC = [
  { id: 'about', label: '1. 本ツールについて' },
  { id: 'environment', label: '2. 動作環境・初期設定' },
  { id: 'screen', label: '3. 画面の見かた' },
  { id: 'excel-import', label: '4. Excel取込' },
  { id: 'data-confirm', label: '5. データ確認' },
  { id: 'manual-input', label: '6. 手動入力' },
  { id: 'target-sales', label: '7. 目標売上' },
  { id: 'slides', label: '8. スライド閲覧' },
  { id: 'master', label: '9. マスタ管理' },
  { id: 'flow', label: '10. 全体フロー' },
  { id: 'glossary', label: '用語集' },
] as const

/** バッジ */
const Badge = ({ color, children }: { color: 'green' | 'red' | 'blue' | 'amber' | 'gray'; children: React.ReactNode }) => {
  const colors = {
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    amber: 'bg-amber-100 text-amber-700',
    gray: 'bg-gray-100 text-gray-600',
  }
  return <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-semibold ${colors[color]}`}>{children}</span>
}

/** 注意ボックス */
const Note = ({ type = 'info', children }: { type?: 'info' | 'warn' | 'danger'; children: React.ReactNode }) => {
  const styles = {
    info: 'bg-blue-50 border-blue-400 text-blue-900',
    warn: 'bg-amber-50 border-amber-400 text-amber-900',
    danger: 'bg-red-50 border-red-400 text-red-900',
  }
  return <div className={`border-l-4 rounded-r-md p-4 my-4 text-sm ${styles[type]}`}>{children}</div>
}

/** セクション見出し */
const SectionTitle = ({ id, children }: { id: string; children: React.ReactNode }) => (
  <h2 id={id} className="text-xl font-bold text-gray-900 mt-14 mb-4 pb-2 border-b-[3px] border-red-500 scroll-mt-28">
    {children}
  </h2>
)

/** サブ見出し */
const SubTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-bold text-gray-800 mt-8 mb-3">{children}</h3>
)

/** テーブルラッパー */
const T = ({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) => (
  <div className="overflow-x-auto my-3">
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i} className="bg-gray-100 border border-gray-200 px-3 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri}>
            {row.map((cell, ci) => (
              <td key={ci} className="border border-gray-200 px-3 py-2 align-top">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

/** フローステップ */
const FlowStep = ({ num, children }: { num: number; children: React.ReactNode }) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-dashed border-gray-200 last:border-b-0">
    <span className="shrink-0 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">{num}</span>
    <span className="pt-0.5">{children}</span>
  </div>
)

const RegrowManualClient = () => {
  const [activeSection, setActiveSection] = useState('')

  // スクロール位置に応じて目次のアクティブ状態を更新
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px' }
    )
    TOC.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 print-target">
      {/* ヘッダー + 目次 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-6 md:px-10 pt-5 pb-3">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-0.5">Regrow — ユーザーマニュアル</h1>
          <p className="text-sm text-gray-500">
            月次業績レポートシステム&emsp;|&emsp;開発：合同会社 改善マニア&emsp;|&emsp;最終更新：2026-03-22
          </p>
        </div>
        <nav className="px-6 md:px-10 pb-2 flex gap-1 overflow-x-auto">
          {TOC.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeSection === id ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>

      {/* メインコンテンツ */}
      <main className="px-6 md:px-10 py-10 max-w-[960px] mx-auto">

        {/* ============================================================
            1. 本ツールについて
            ============================================================ */}
        <SectionTitle id="about">1. 本ツールについて</SectionTitle>

        <SubTitle>できること</SubTitle>
        <p className="mb-3">
          本ツールは<strong>月次業績レポートを自動生成する</strong>ためのシステムです。
          毎月のExcel「担当者別分析表」と、手動入力するKPIデータを組み合わせて、<strong>18枚のスライド資料</strong>（グラフ・テーブル付き）を自動で作成します。
        </p>

        <T
          headers={['機能', '説明']}
          rows={[
            ['Excelインポート', '担当者別分析表を取り込み、スタッフの売上・客数等を自動抽出'],
            ['手動データ入力', '店舗KPI（稼働率・コメント等）やスタッフ個別データを入力'],
            ['目標売上入力', 'スタッフ別の月間目標売上を入力し、達成率を自動算出'],
            ['スライド資料閲覧', '18枚構成のレポートスライドを自動生成・閲覧'],
            ['マスタ管理', '店舗・ユーザー・権限の管理'],
            ['月別データ管理', 'YYYY-MM単位でデータを管理し、過去月の閲覧・比較が可能'],
          ]}
        />

        <SubTitle>利用の流れ</SubTitle>
        <div className="bg-white border border-gray-200 rounded-lg p-5 my-4">
          <FlowStep num={1}>新しい月を作成</FlowStep>
          <FlowStep num={2}>各店舗のExcelファイルをインポート</FlowStep>
          <FlowStep num={3}>手動入力（スタッフ稼働率・CS登録数・コメント・お客様の声）</FlowStep>
          <FlowStep num={4}>目標売上を入力</FlowStep>
          <FlowStep num={5}>スライドを確認</FlowStep>
        </div>

        {/* ============================================================
            2. 動作環境・初期設定
            ============================================================ */}
        <SectionTitle id="environment">2. 初期設定</SectionTitle>

        <SubTitle>用意するもの</SubTitle>
        <T
          headers={['書類', '必須', '説明']}
          rows={[
            ['担当者別分析表（Excel）', '必須', '業務システムから出力される .xlsx / .xls ファイル。店舗ごとに1ファイル'],
            ['スタッフ稼働率', '必須', '各スタッフの月間稼働率（%）'],
            ['CS登録数', '必須', '各スタッフのCS登録件数'],
            ['お客様の声', '任意', 'お客様からのフィードバックテキスト'],
            ['スタッフ目標売上', '任意', 'スタッフ別の月間目標売上金額'],
          ]}
        />

        <SubTitle>権限（ロール）</SubTitle>
        <T
          headers={['ロール', '説明', 'できること']}
          rows={[
            [<Badge color="red">管理者（admin）</Badge>, 'システム管理者', '全機能の操作、マスタ管理、データ編集'],

          ]}
        />

        <Note>管理者のみが、Excel取込・データ確認・手動入力・目標売上タブを操作できます。</Note>

        {/* ============================================================
            3. 画面の見かた
            ============================================================ */}
        <SectionTitle id="screen">3. 画面の見かた</SectionTitle>

        <SubTitle>月選択バー</SubTitle>
        <p>画面最上部に表示される月選択バーから、対象月の切り替えと新規作成を行います。</p>
        <T
          headers={['要素', '説明']}
          rows={[
            ['対象月ドロップダウン', '表示する対象月を切り替えます'],
            ['「+ 新規作成」ボタン', '新しい月を作成します（YYYY-MM形式で入力）'],
          ]}
        />

        <SubTitle>タブナビゲーション</SubTitle>
        <p className="mb-3">月選択バーの下に、各機能タブが並びます。</p>
        <T
          headers={['タブ', '説明']}
          rows={[
            [<strong>Excel取込</strong>, 'Excelファイルのアップロード'],
            [<strong>データ確認</strong>, 'インポート済みデータの一覧表示'],
            [<strong>手動入力</strong>, '店舗KPI・スタッフ稼働率・CS登録数の入力'],
            [<strong>目標売上</strong>, 'スタッフ別目標売上の入力'],
            [<strong>スライド</strong>, '18枚のスライド資料を閲覧'],
          ]}
        />

        {/* ============================================================
            4. Excel取込
            ============================================================ */}
        <SectionTitle id="excel-import">4. Excel取込</SectionTitle>
        <p className="mb-3">Excelファイル（担当者別分析表）を取り込む画面です。</p>

        <SubTitle>操作手順</SubTitle>
        <ol className="list-decimal ml-6 space-y-1 mb-4">
          <li><strong>STEP 1</strong> で取込先の「年月」と「店舗」をドロップダウンから選択</li>
          <li><strong>STEP 2</strong> のエリアにExcelファイルをドラッグ＆ドロップ、またはクリックしてファイルを選択</li>
          <li>プレビュー画面が表示されるので、データ内容とスタッフのマッチング結果を確認</li>
          <li>問題がなければ<strong>「確認して取り込む」</strong>ボタンをクリック</li>
        </ol>

        <SubTitle>プレビュー画面の見かた</SubTitle>
        <ul className="list-disc ml-6 space-y-1 mb-4">
          <li><strong>取込先情報</strong>：選択した年月・店舗・集計期間</li>
          <li><strong>店舗合計</strong>：売上合計・対応客数・指名数・客単価</li>
          <li><strong>スタッフ一覧</strong>：各スタッフの売上データとマッチング状況</li>
        </ul>

        <h4 className="font-bold text-gray-700 mt-5 mb-2">マッチング状態</h4>
        <T
          headers={['アイコン', '状態', '説明']}
          rows={[
            ['✅', 'DB登録済', 'ユーザー名と一致するユーザーが見つかった'],
            ['⚠️', '未登録', 'ユーザー名と一致するユーザーがいない。先にマスタ管理で登録が必要'],
            ['🔄', '同名ユーザー', '同じ名前のユーザーが複数いるため、ドロップダウンで選択が必要'],
          ]}
        />

        <SubTitle>取込済みデータの表示</SubTitle>
        <p>画面下部に、現在の年月で取り込み済みの店舗がカードで表示されます。</p>
        <T
          headers={['表示項目', '説明']}
          rows={[
            ['店舗名 + ✅ 取込済バッジ', '取込完了した店舗'],
            ['スタッフ数', 'インポートされたスタッフの人数'],
            ['売上合計', '店舗の月間売上合計'],
            ['客単価', '店舗の平均客単価'],
            ['インポート日時', '取込実行日時'],
          ]}
        />

        <SubTitle>注意事項</SubTitle>
        <ul className="list-disc ml-6 space-y-1 mb-4">
          <li>同じ店舗・年月のデータを再度アップロードすると<strong>上書き</strong>されます</li>
          <li>未登録スタッフがいる場合は、プレビュー画面から<strong>「新規登録」</strong>ボタンでその場で登録できます</li>
          <li>対応ファイル形式：<code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">.xlsx</code> / <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">.xls</code></li>
        </ul>

        <SubTitle>Excelから抽出される項目</SubTitle>
        <T
          headers={['項目', '説明']}
          rows={[
            ['スタッフ名', '担当者の氏名'],
            ['売上合計', 'スタッフの月間売上'],
            ['新規客数', '新規のお客様数'],
            ['対応客数', '対応した総客数'],
            ['指名数', '指名された件数'],
            ['客単価', '1人あたりの単価'],
          ]}
        />

        {/* ============================================================
            5. データ確認
            ============================================================ */}
        <SectionTitle id="data-confirm">5. データ確認</SectionTitle>
        <p className="mb-3">取り込んだExcelデータを店舗別に一覧表示する画面です。</p>

        <SubTitle>操作手順</SubTitle>
        <ol className="list-decimal ml-6 space-y-1 mb-4">
          <li>画面上部の<strong>店舗タブ</strong>で確認したい店舗を選択</li>
          <li>スタッフ一覧がランキング順で表示されます</li>
        </ol>

        <SubTitle>テーブルの列</SubTitle>
        <T
          headers={['列', '説明']}
          rows={[
            ['順位', 'Excel上のランキング'],
            ['担当者名', 'スタッフ名'],
            ['売上合計', '月間売上金額'],
            ['客数', '対応客数'],
            ['指名数', '指名件数'],
            ['客単価', '1人あたりの平均単価'],
          ]}
        />

        <ul className="list-disc ml-6 space-y-1 mb-4">
          <li>テーブル最下行に<strong>店舗合計</strong>が表示されます</li>
          <li>画面下部にインポート日時とレコード数が確認できます</li>
          <li>未取込の店舗タブには<strong>「（未取込）」</strong>と表示されます</li>
        </ul>

        <Note>この画面は確認専用です。データの修正はできません。</Note>

        {/* ============================================================
            6. 手動入力
            ============================================================ */}
        <SectionTitle id="manual-input">6. 手動入力</SectionTitle>
        <p className="mb-3">Excelから自動取得できないデータを手動で入力する画面です。3つのサブタブに分かれています。</p>

        <SubTitle>6.1 店舗KPIタブ</SubTitle>
        <p>各店舗について以下が表示されます。</p>
        <T
          headers={['項目', '入力/自動', '説明']}
          rows={[
            ['稼働率 (%)', <Badge color="blue">自動計算</Badge>, 'スタッフ稼働率の平均値（編集不可）'],
            ['再来率 (%)', <Badge color="blue">自動計算</Badge>, '(対応客数 − 新規客数) ÷ 対応客数 × 100（編集不可）'],
            ['CS登録数', <Badge color="blue">自動計算</Badge>, 'スタッフCS登録数の合計（編集不可）'],
            ['コメント', <Badge color="green">手動入力</Badge>, '月次の店舗振り返りコメント'],
          ]}
        />
        <Note>稼働率・再来率・CS登録数は、次の「スタッフ稼働率・CS登録数」タブでスタッフ個別に入力すると自動で反映されます。</Note>

        <SubTitle>6.2 スタッフ稼働率・CS登録数タブ</SubTitle>
        <p>Excelをインポートすると、スタッフ一覧が自動で表示されます。</p>
        <T
          headers={['列', '入力/自動', '説明']}
          rows={[
            ['店舗', '自動表示', 'スタッフの所属店舗'],
            ['名前', '自動表示', 'スタッフ名'],
            ['稼働率 (%)', <Badge color="green">手動入力</Badge>, 'スタッフ個人の月間稼働率'],
            ['再来率 (%)', <Badge color="blue">自動計算</Badge>, '(対応客数 − 新規客数) ÷ 対応客数 × 100（編集不可）'],
            ['CS登録数', <Badge color="green">手動入力</Badge>, 'スタッフのCS登録件数'],
          ]}
        />

        <SubTitle>6.3 お客様の声タブ</SubTitle>
        <ul className="list-disc ml-6 space-y-1 mb-4">
          <li>テキストエリアにお客様からのフィードバックを自由に入力します</li>
          <li>この内容はスライド18「お客様の声」にそのまま反映されます</li>
        </ul>

        <SubTitle>自動保存</SubTitle>
        <ul className="list-disc ml-6 space-y-1 mb-4">
          <li>入力欄からフォーカスが外れた時点で<strong>自動保存</strong>されます（保存ボタンはありません）</li>
          <li>保存時に画面右上に「保存完了 ✅」が一時表示されます</li>
          <li>データはデータベースに直接保存されます</li>
        </ul>

        <SubTitle>自動計算の計算式</SubTitle>
        <T
          headers={['項目', '計算式']}
          rows={[
            ['スタッフ再来率', '(対応客数 − 新規客数) ÷ 対応客数 × 100（小数第1位まで）'],
            ['店舗再来率', '店舗内全スタッフの再来客数合計 ÷ 対応客数合計 × 100'],
            ['店舗稼働率', '店舗内全スタッフの稼働率の平均値（小数第1位まで）'],
            ['店舗CS登録数', '店舗内全スタッフのCS登録数の合計'],
          ]}
        />

        {/* ============================================================
            7. 目標売上
            ============================================================ */}
        <SectionTitle id="target-sales">7. 目標売上</SectionTitle>
        <p className="mb-3">スタッフ別の月間目標売上を入力する画面です。入力された目標値はスライドの「売上目標達成率」に反映されます。</p>

        <SubTitle>画面構成</SubTitle>

        <h4 className="font-bold text-gray-700 mt-5 mb-2">全体合計サマリー（画面上部・紫帯）</h4>
        <T
          headers={['項目', '説明']}
          rows={[
            ['目標合計', '全店舗の目標売上合計'],
            ['実績合計', '全店舗の実績売上合計（Excelインポートデータ）'],
            ['達成率', '実績合計 ÷ 目標合計 × 100'],
          ]}
        />

        <h4 className="font-bold text-gray-700 mt-5 mb-2">店舗別テーブル</h4>
        <p className="mb-2"><strong>店舗ヘッダー（黒帯）</strong>：店舗名、目標合計、実績合計、達成率バッジ</p>
        <T
          headers={['列', '入力/自動', '説明']}
          rows={[
            ['スタッフ名', '自動表示', 'スタッフ名'],
            ['目標売上（円）', <Badge color="green">手動入力</Badge>, '月間の目標売上金額'],
            ['実績売上', <Badge color="blue">自動表示</Badge>, 'Excelインポートデータの売上（編集不可）'],
            ['達成率', <Badge color="blue">自動計算</Badge>, '実績 ÷ 目標 × 100'],
          ]}
        />

        <h4 className="font-bold text-gray-700 mt-5 mb-2">達成率の色分け</h4>
        <p className="mb-2"><strong>店舗ヘッダーの達成率バッジ：</strong></p>
        <T
          headers={['色', '条件']}
          rows={[
            [<Badge color="green">緑</Badge>, '100%以上（目標達成）'],
            [<Badge color="amber">黄</Badge>, '100%未満（目標未達）'],
          ]}
        />
        <p className="mb-2"><strong>スタッフ行の達成率バッジ：</strong></p>
        <T
          headers={['色', '条件']}
          rows={[
            [<Badge color="green">緑</Badge>, '100%以上（目標達成）'],
            [<Badge color="red">赤</Badge>, '100%未満（目標未達）'],
          ]}
        />
        <p>手動入力と同様に、フォーカスが外れた時点で自動保存されます。</p>

        {/* ============================================================
            8. スライド閲覧
            ============================================================ */}
        <SectionTitle id="slides">8. スライド閲覧</SectionTitle>
        <p className="mb-3">ExcelデータとKPIデータから自動生成された18枚のスライド資料を閲覧する画面です。</p>

        <SubTitle>スライド構成（全18枚）</SubTitle>
        <T
          headers={['No.', 'タイトル', '内容']}
          rows={[
            ['1', 'タイトルスライド', '月次業績レポート、対象月の表示'],
            ['2', '目次', 'レポートの構成一覧'],
            ['3', '全体サマリー', '店舗別KPIテーブル（売上/稼働率/客単価/再来率）+ 店舗コメント'],
            ['4', '客単価 - 年間推移', '店舗別の客単価を月別折れ線グラフで比較'],
            ['5', '稼働率 - 年間推移', '店舗別の稼働率を月別折れ線グラフで比較'],
            ['6', '再来率 - 年間推移', '店舗別の再来率を月別折れ線グラフで比較'],
            ['7', '全指標統合 - 年間推移', '客単価・稼働率・再来率を1つのグラフに統合表示'],
            ['8', 'スタッフ別パフォーマンス', 'スタッフ別テーブル（売上・稼働率・指名率・再来率・CS登録率）'],
            ['9', 'スタッフ稼働率チャート', 'スタッフ稼働率の縦棒グラフ'],
            ['10', 'スタッフ別売上目標達成率（テーブル）', 'スタッフ別の目標売上・実績・差額・達成率テーブル'],
            ['11', 'スタッフ別売上目標達成率（グラフ）', '目標vs実績の横棒グラフ + 達成率ライン'],
            ['12', '店舗別売上目標達成率（テーブル）', '店舗別の目標合計・実績合計・差額・達成率テーブル'],
            ['13', '店舗別売上目標達成率（グラフ）', '目標vs実績の横棒グラフ + 達成率ライン'],
            ['14', 'スタッフ別累計比較①（テーブル）', '売上金額・指名件数の当月/累計平均/差分テーブル'],
            ['15', 'スタッフ別累計比較①（グラフ）', '売上（棒グラフ）+ 指名（折れ線）の複合グラフ'],
            ['16', 'スタッフ別累計比較②（テーブル）', '再来率・客単価の当月/累計平均/差分テーブル'],
            ['17', 'スタッフ別累計比較②（グラフ）', '客単価（棒グラフ）+ 再来率（折れ線）の複合グラフ'],
            ['18', 'お客様の声', '手動入力されたお客様のフィードバックを表示'],
          ]}
        />

        <SubTitle>閲覧モード</SubTitle>
        <T
          headers={['モード', '説明']}
          rows={[
            ['スクロール', '全18枚を縦に並べてスクロール表示（デフォルト）'],
            ['ページ切替', '1枚ずつ表示し、ボタンまたは矢印キーで前後移動'],
          ]}
        />

        <h4 className="font-bold text-gray-700 mt-5 mb-2">ページ切替モードの操作</h4>
        <T
          headers={['操作', '動作']}
          rows={[
            ['「次へ」ボタン / → キー / ↓ キー', '次のスライドへ'],
            ['「前へ」ボタン / ← キー / ↑ キー', '前のスライドへ'],
            ['スライド番号ドット', '任意のスライドに直接移動（画面下部に18個のドットが表示）'],
            ['「全画面」ボタン', '全画面表示に切り替え'],
            ['Escキー', '全画面を終了'],
          ]}
        />

        <SubTitle>店舗フィルタ</SubTitle>
        <ul className="list-disc ml-6 space-y-1 mb-4">
          <li>画面下部の店舗チェックボックスで、表示する店舗を絞り込めます</li>
          <li>複数店舗を同時に表示可能です</li>
          <li>チェックを外すと、その店舗とスタッフのデータが非表示になります</li>
        </ul>

        <SubTitle>スタッフフィルタ</SubTitle>
        <ul className="list-disc ml-6 space-y-1 mb-4">
          <li><strong>「スタッフ: 全員 ▼」</strong>をクリックすると、表示するスタッフを選択できます</li>
          <li>店舗ごとにグルーピングされたチェックボックスで選択します</li>
          <li>スタッフ別のスライド（8～17）に適用されます</li>
        </ul>

        <SubTitle>累計平均との比較</SubTitle>
        <p>スライド9（スタッフ稼働率チャート）およびスライド15・17（累計比較グラフ）には、グラフ内に「当月」「累計平均」の切替チェックボックスが表示されます。</p>
        <ul className="list-disc ml-6 space-y-1 mb-4">
          <li>デフォルトは「当月」のみ表示（「累計平均」はOFF）</li>
          <li>チェックを入れると、累計平均のバー／ラインがグラフに追加表示されます</li>
        </ul>

        {/* ============================================================
            9. マスタ管理
            ============================================================ */}
        <SectionTitle id="master">9. マスタ管理</SectionTitle>

        <SubTitle>アクセス方法</SubTitle>
        <p>サイドメニューから<strong>「マスタ管理」</strong>を選択します。管理者（admin）のみアクセス可能です。</p>

        <SubTitle>9.1 店舗マスタ</SubTitle>
        <p>店舗の登録・編集・削除を行います。</p>
        <T
          headers={['項目', '必須', '説明']}
          rows={[
            ['名前', '必須', '店舗の略称（スライドに表示される名前）'],
            ['有効/無効', '-', '無効にすると各画面で非表示になります'],
          ]}
        />

        <h4 className="font-bold text-gray-700 mt-5 mb-2">操作</h4>
        <ul className="list-disc ml-6 space-y-1 mb-4">
          <li><strong>「新規追加」</strong>ボタンで新しい店舗を登録（名前・有効/無効を入力）</li>
          <li>各行の鉛筆アイコンで編集</li>
          <li>各行のゴミ箱アイコンで削除（確認ダイアログあり）</li>
        </ul>

        <SubTitle>9.2 ユーザー・権限管理</SubTitle>
        <p>ユーザーの登録・編集・担当店舗の割当・非アクティブ化/解除の管理を行います。</p>

        <h4 className="font-bold text-gray-700 mt-5 mb-2">ユーザー一覧テーブル</h4>
        <T
          headers={['列', '説明']}
          rows={[
            ['名前', 'ユーザーの表示名'],
            ['メールアドレス', 'ログイン用メールアドレス'],
            ['担当店舗', 'ドロップダウンで店舗を選択（未設定も可）'],
            [<>状態</>, <>非アクティブの場合は <Badge color="red">非アクティブ</Badge> バッジが表示</>],
            ['操作', '編集・非アクティブ化/解除・削除ボタン'],
          ]}
        />

        <h4 className="font-bold text-gray-700 mt-5 mb-2">ユーザーの新規追加</h4>
        <T
          headers={['項目', '必須', '説明']}
          rows={[
            ['名前', '必須', 'ユーザーの表示名（Excel上のスタッフ名と一致させる）'],
            ['メールアドレス', '任意', 'ログイン用'],
            ['パスワード', '任意', 'ログイン用'],
          ]}
        />

        <Note type="warn">
          <strong>重要</strong>：ユーザー名はExcelインポート時のスタッフ名マッチングに使用されます。Excelの担当者名と<strong>完全一致</strong>する名前で登録してください。
        </Note>

        <h4 className="font-bold text-gray-700 mt-5 mb-2">操作</h4>
        <ul className="list-disc ml-6 space-y-1 mb-4">
          <li><strong>「新規追加」</strong>ボタンでユーザーを登録</li>
          <li><strong>鉛筆アイコン</strong>でユーザー情報を編集（名前・メールアドレス・パスワード変更）</li>
          <li><strong>担当店舗ドロップダウン</strong>で所属店舗を設定（即時反映）</li>
          <li><strong>盾アイコン（オレンジ）</strong>で非アクティブ化。非アクティブのユーザーはインポート時のマッチング対象外</li>
          <li><strong>盾アイコン（緑）</strong>で非アクティブ解除（アクティブに戻す）</li>
          <li><strong>ゴミ箱アイコン</strong>で完全削除</li>
        </ul>

        <Note type="danger">
          <strong>注意</strong>：ユーザーを削除すると、過去データのスタッフ紐付けが解除されます。退職者は「非アクティブ」にすることを推奨します。
        </Note>

        <SubTitle>9.3 権限割当</SubTitle>
        <p>権限割当テーブルで、各ユーザーにロール（admin / manager / viewer）を設定します。</p>

        <SubTitle>9.4 データ管理（管理者向け）</SubTitle>
        <p>マスタ管理画面のヘッダーに以下のボタンが用意されています。</p>
        <T
          headers={['ボタン', '説明']}
          rows={[
            [<Badge color="red">データリセット</Badge>, <>Regrowアプリの全データを削除。<strong>この操作は取り消せません。</strong></>],
            [<Badge color="blue">シードデータ投入</Badge>, '既存データをリセットした上で、デモ用のサンプルデータを投入'],
            [<Badge color="green">Excelからシード投入</Badge>, '既存データをリセットし、Excelファイルからシードデータを投入'],
          ]}
        />

        {/* ============================================================
            10. 全体フロー
            ============================================================ */}
        <SectionTitle id="flow">10. 月次レポート作成の全体フロー</SectionTitle>
        <p className="mb-3">毎月のレポート作成は以下の手順で行います。</p>

        <T
          headers={['手順', '操作', '完了条件']}
          rows={[
            ['① 新しい月を作成', '月選択バーの「+ 新規作成」ボタンから年月を入力', '月が一覧に追加される'],
            ['② Excelをインポート', '各店舗の担当者別分析表をアップロード', '全店舗分のデータがインポート済み'],
            ['③ 手動入力', 'スタッフ稼働率・CS登録数・コメント・お客様の声を入力', '全店舗・全スタッフ分の入力完了'],
            ['④ 目標売上を入力', 'スタッフ別の月間目標売上を入力', '全スタッフの目標値を設定'],
            ['⑤ スライドを確認', 'スライドタブで18枚を閲覧', 'データに問題がないことを確認'],
          ]}
        />






      </main>
    </div>
  )
}

export default RegrowManualClient
