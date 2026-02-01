# ビルドパフォーマンス分析レポート

## 概要

本プロジェクトのビルドが遅くなっている原因と解決策をまとめる。

## 現状分析

### プロジェクト規模

| 項目 | 数値 |
|------|------|
| TypeScript ファイル数 | 1,137 |
| Prisma スキーマファイル | 14 |
| Prisma スキーマ行数 | 2,679行 |
| サブアプリケーション数 | 11 |
| node_modules サイズ | 1.3GB |
| .next ディレクトリサイズ | 6.3GB |

### .next ディレクトリの内訳

| ディレクトリ | サイズ | 備考 |
|-------------|--------|------|
| cache/ | 3.3GB | webpack キャッシュが大部分 |
| dev/ | 2.8GB | 開発モードキャッシュ |
| server/ | 202MB | サーバーサイドバンドル |
| static/ | 9.3MB | 静的アセット |

### 重い依存関係 (Top 15)

| パッケージ | サイズ | 使用状況 |
|-----------|--------|----------|
| @prisma | 183MB | 必須 |
| next | 157MB | 必須 |
| googleapis | 122MB | 13ファイルで使用 |
| @next | 101MB | 必須 |
| lucide-react | 41MB | アイコン |
| date-fns | 38MB | 日付処理 |
| pdfjs-dist | 36MB | PDF表示 |
| prisma | 36MB | 必須 |
| effect | 32MB | 依存関係 |
| fabric | 31MB | **直接使用なし** |
| pdf-lib | 23MB | PDF生成 |
| @electric-sql | 23MB | 依存関係 |
| typescript | 22MB | 開発時のみ |
| canvas | 19MB | **直接使用なし** |

---

## 原因と解決策

### 1. キャッシュの肥大化

**原因**
- `.next/cache/webpack` が 3.3GB と異常に大きい
- Turbopack を使用しているのに webpack キャッシュが残存
- 開発モードキャッシュが蓄積

**解決策**

```bash
# キャッシュをクリア
rm -rf .next

# 定期的なキャッシュクリアをスクリプト化
# package.json に追加
"clean": "rm -rf .next && rm -rf node_modules/.cache"
```

**効果**: 初回ビルド後のキャッシュサイズを大幅削減

---

### 2. 未使用の重い依存関係

**原因**
- `canvas` (19MB) - ソースコードで直接インポートなし
- `fabric` (31MB) - ソースコードで直接インポートなし
- これらは他のパッケージの依存関係として入っている可能性

**解決策**

1. 依存関係の確認
```bash
npm why canvas
npm why fabric
```

2. 不要なら削除
```bash
npm uninstall canvas fabric
```

3. peerDependencies で入っている場合は、使用しているパッケージ自体を見直す

**効果**: node_modules を約50MB削減

---

### 3. 動的インポートの不足

**原因**
- 現在5箇所のみで `dynamic()` を使用
- 重いライブラリが初期バンドルに含まれている

**問題のある箇所**

| ライブラリ | 使用ファイル数 | 対応優先度 |
|-----------|---------------|----------|
| framer-motion | 19ファイル | 中 |
| recharts | 1ファイル | 高 |
| react-pdf/@react-pdf | 4ファイル | 高 |
| googleapis | 13ファイル | サーバー側のため低 |

**解決策**

```tsx
// ❌ 現状: 直接インポート
import { motion } from 'framer-motion'
import { LineChart } from 'recharts'

// ✅ 改善: 動的インポート
import dynamic from 'next/dynamic'

const MotionDiv = dynamic(
  () => import('framer-motion').then(mod => mod.motion.div),
  { ssr: false }
)

const LineChart = dynamic(
  () => import('recharts').then(mod => mod.LineChart),
  { ssr: false, loading: () => <div>Loading...</div> }
)
```

**特に効果的な対応箇所**
- `src/cm/hooks/useRecharts.tsx` - recharts のラッパー化
- PDF 関連コンポーネント - ssr: false で動的読み込み

**効果**: 初期バンドルサイズを20-30%削減可能

---

### 4. Prisma の最適化

**原因**
- 14個のスキーマファイルから単一クライアントを生成
- 生成ファイルが 9.4MB

**解決策**

1. 必要なモデルのみを生成（将来的な対応）
```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["prismaSchemaFolder"]
}
```

2. `prisma generate` のキャッシュ活用
```bash
# CI/CD では変更がない場合スキップ
if [ ! -f prisma/schema/generated/.prisma-client-version ] || \
   [ "$(cat prisma/schema/generated/.prisma-client-version)" != "$(npx prisma --version)" ]; then
  npx prisma generate
fi
```

---

### 5. tsconfig.json の最適化

**原因**
- include に重複がある

```json
// 現状
"include": [
  "src/**/*.ts",
  "src/**/*.tsx",
  "src/**/*"  // ← 上2つと重複
]
```

**解決策**

```json
{
  "include": [
    "next-env.d.ts",
    "src/**/*.ts",
    "src/**/*.tsx",
    ".next/types/**/*.ts"
  ]
}
```

---

### 6. バンドル分析の有効化

**原因**
- バンドルサイズの可視化ができていない

**解決策**

1. package.json に追加
```json
"analyze": "ANALYZE=true npm run build"
```

2. next.config.ts を修正
```typescript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

export default isProd
  ? withBundleAnalyzer(withPWA(nextConfig))
  : nextConfig
```

3. 実行して分析
```bash
npm run analyze
```

---

### 7. サブアプリケーションの分離検討

**現状**
| アプリ | ファイル数 |
|-------|-----------|
| tbm | 180 |
| KM | 84 |
| curious | 65 |
| training | 42 |
| hakobun | 39 |
| その他 | 59 |

**解決策（長期的）**
- 使用頻度の低いアプリを別リポジトリに分離
- Turborepo でモノレポ化し、パッケージ間の依存関係を明確化

---

## 推奨対応順序

### 即時対応（効果: 高、工数: 低）

1. `.next` ディレクトリの削除とリビルド
2. 未使用依存関係（canvas, fabric）の確認・削除
3. tsconfig.json の include 重複修正

### 短期対応（効果: 高、工数: 中）

4. recharts, react-pdf の動的インポート化
5. バンドル分析の有効化と調査
6. 定期的なキャッシュクリアの自動化

### 中期対応（効果: 中、工数: 中）

7. framer-motion の動的インポート化（19ファイル）
8. lucide-react のツリーシェイキング最適化
9. date-fns の部分インポート確認

### 長期対応（効果: 高、工数: 高）

10. サブアプリケーションの分離検討
11. Prisma スキーマの分割生成
12. Turborepo 導入

---

## 実行コマンドまとめ

```bash
# キャッシュクリア
rm -rf .next && rm -rf node_modules/.cache

# 依存関係の確認
npm why canvas
npm why fabric

# 未使用パッケージの確認
npx depcheck

# バンドル分析
ANALYZE=true npm run build

# ビルド時間計測
time npm run build
```

---

## 補足: 現在の設定で良い点

- Turbopack を開発時に使用している (`next dev --turbo`)
- `skipLibCheck: true` で型チェックを高速化
- `incremental: true` でインクリメンタルビルド有効
- 画像最適化を無効化 (`unoptimized: true`) で画像処理のオーバーヘッドなし
