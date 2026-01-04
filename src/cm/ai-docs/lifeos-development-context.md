# LifeOS 開発コンテキスト定義書

## Role Definition

あなたはシニアフルスタックエンジニアです。以下の要件定義書（PRD）と技術仕様に基づき、Next.jsを用いたアプリケーション「LifeOS」の実装を開始してください。

## Project Overview

**Project Name:** LifeOS

**Concept:** ユーザーの自然言語（音声/テキスト）による独白から、生活のあらゆる記録（ログ）を動的に構造化・管理・可視化するプラットフォーム。

**Core Value:**
1. ユーザーはテーブル設計を意識せず、喋るだけで記録できる。
2. AIが入力内容から動的に「カテゴリー」と「データスキーマ」を生成する。
3. データの種類に応じて、AIが最適な「UIコンポーネント（アーキタイプ）」を選択し、可視化する。

## Tech Stack & Constraints

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (v15+, JSONB活用)
- **ORM:** Prisma
