# TaskFlow — プロジェクト計画書

## 1. システム概要

### アプリ名
**TaskFlow** — シンプルなブラウザ完結型タスク管理アプリ

### 概要

タスクの作成・編集・完了管理ができる Web アプリ。  
フロントエンドとバックエンドを分離したモノレポ構成で開発し、データはブラウザの localStorage に保持する。データベースは不使用。ローカル環境での動作確認をゴールとする。

### 主要機能（モックより）

| 機能 | 説明 |
|------|------|
| タスク一覧表示 | 優先度順にソートして表示 |
| タスク作成 | タイトル・期限・優先度（高/中/低）を入力してタスクを作成 |
| タスク編集 | 既存タスクを編集モーダルで更新 |
| タスク完了 | タスクをリストから削除（完了扱い） |
| 統計パネル | タスク合計・期限超過・高優先度の件数を表示 |
| 期限ステータス | 期限超過・本日期限を色分け表示 |
| 空状態表示 | タスクが 0 件のときの案内画面 |

### タスクデータ構造

```typescript
type Priority = 'high' | 'medium' | 'low'

interface Task {
  id: string        // nanoid などで生成
  title: string     // 必須・空白不可
  deadline: string  // YYYY-MM-DD 形式（任意）
  priority: Priority
  createdAt: string // ISO8601
}
```

---

## 2. 技術スタック

| レイヤー | 技術 | バージョン | 用途 |
|----------|------|-----------|------|
| フロントエンド | React | 18.3.x | UI コンポーネント |
| フロントエンド | Vite | 6.x | バンドラー・開発サーバー |
| フロントエンド | TypeScript | 5.x | 型安全性 |
| バックエンド | Hono | 4.12.x | REST API サーバー |
| バックエンド | @hono/node-server | 2.0.x | Node.js アダプター |
| バックエンド | TypeScript | 5.x | 型安全性 |
| テスト（共通） | Vitest | 4.1.x | テストランナー |
| テスト（FE） | @testing-library/react | 16.3.x | React コンポーネントテスト |
| テスト（FE） | jsdom | 最新 | ブラウザ環境エミュレート |
| ランタイム | Node.js | 24.x | バックエンド実行環境 |
| パッケージ管理 | npm workspaces | 11.x | モノレポ管理 |

---

## 3. アーキテクチャ設計

### データフロー

```
ブラウザ
  └─ React UI
       ├─ 表示: localStorage → React State → DOM
       ├─ 操作: UI操作 → API呼び出し (fetch)
       │
       └─ Hono API サーバー (localhost:3000)
            ├─ GET    /api/tasks       タスク一覧取得
            ├─ POST   /api/tasks       タスク作成
            ├─ PUT    /api/tasks/:id   タスク更新
            └─ DELETE /api/tasks/:id   タスク削除（完了）

  永続化: フロントエンドが localStorage に同期（DB不使用）
  バックエンド: インメモリストレージ（再起動でリセット、ローカル開発用）
```

### 永続化戦略

- **localStorage**: フロントエンドが全タスクデータを `taskflow:tasks` キーで保存
- **初期化**: アプリ起動時に localStorage からデータを読み込み、バックエンドのインメモリに同期
- **更新**: CRUD 操作ごとに API を通じてインメモリを更新し、レスポンス後に localStorage を同期

> データベースは不使用。デモアプリのためブラウザを閉じてもデータは localStorage に残る。

---

## 4. ディレクトリ構造

```
task-manager-dev/
├── package.json                    # ワークスペースルート
├── CLAUDE.md
├── README.md
├── docs/
│   └── project-plan.md             # 本ファイル
├── mock/                           # 参照用 React モック（既存）
└── packages/
    ├── frontend/                   # React + Vite アプリ
    │   ├── package.json
    │   ├── vite.config.ts
    │   ├── tsconfig.json
    │   ├── index.html
    │   └── src/
    │       ├── main.tsx
    │       ├── App.tsx
    │       ├── App.css
    │       ├── index.css
    │       ├── types/
    │       │   └── task.ts         # Task 型定義
    │       ├── api/
    │       │   └── taskApi.ts      # バックエンド API クライアント
    │       ├── hooks/
    │       │   └── useTasks.ts     # タスク状態管理 + localStorage 同期
    │       ├── components/
    │       │   ├── TaskCard.tsx
    │       │   ├── TaskModal.tsx
    │       │   └── StatsPanel.tsx
    │       └── __tests__/
    │           ├── useTasks.test.ts
    │           ├── TaskCard.test.tsx
    │           ├── TaskModal.test.tsx
    │           └── StatsPanel.test.tsx
    └── backend/                    # Hono API サーバー
        ├── package.json
        ├── tsconfig.json
        └── src/
            ├── index.ts            # エントリーポイント
            ├── types/
            │   └── task.ts         # Task 型定義（共通）
            ├── storage/
            │   └── memory.ts       # インメモリストレージ
            ├── routes/
            │   └── tasks.ts        # /api/tasks ルート定義
            └── __tests__/
                ├── tasks.test.ts   # API エンドポイントテスト
                └── memory.test.ts  # ストレージロジックテスト
```

---

## 5. API 仕様

### ベース URL
`http://localhost:3000`

### エンドポイント

#### `GET /api/tasks`
全タスクを取得（優先度順ソート）

**Response 200**
```json
[
  {
    "id": "abc123",
    "title": "デザインレビューの準備",
    "deadline": "2026-05-20",
    "priority": "high",
    "createdAt": "2026-05-15T09:00:00.000Z"
  }
]
```

#### `POST /api/tasks`
タスクを作成

**Request Body**
```json
{
  "title": "新しいタスク",
  "deadline": "2026-05-20",
  "priority": "medium"
}
```

**Response 201** — 作成されたタスクオブジェクト

#### `PUT /api/tasks/:id`
タスクを更新

**Request Body** — 更新したいフィールドのみ
```json
{
  "title": "更新後のタイトル",
  "priority": "high"
}
```

**Response 200** — 更新後のタスクオブジェクト  
**Response 404** — タスクが存在しない場合

#### `DELETE /api/tasks/:id`
タスクを削除（完了）

**Response 204** — No Content  
**Response 404** — タスクが存在しない場合

---

## 6. 開発方針: TDD（テスト駆動開発）

### 原則

本プロジェクトは **TDD（Red → Green → Refactor）サイクル** で開発する。

```
1. Red   — 失敗するテストを書く
2. Green — テストが通る最小限の実装を書く
3. Refactor — コードをクリーンに整理する（テストは通し続ける）
```

### テスト戦略

| テスト種別 | ツール | 対象 |
|-----------|--------|------|
| ユニットテスト（BE） | Vitest | ストレージロジック・バリデーション |
| API テスト（BE） | Vitest + Hono test | 各エンドポイントの HTTP レベルテスト |
| ユニットテスト（FE） | Vitest + jsdom | hooks ロジック・ユーティリティ関数 |
| コンポーネントテスト（FE） | Vitest + RTL | React コンポーネントのレンダリング・操作 |

### テスト対象と観点

**バックエンド**
- `memory.ts`: CRUD 操作・バリデーション・優先度ソート
- `tasks.ts` (routes): 正常系・異常系（404、バリデーションエラー）

**フロントエンド**
- `useTasks.ts`: タスクの追加・編集・完了・localStorage 永続化
- `TaskCard`: 優先度バッジ・期限ステータス表示・編集/完了ボタン
- `TaskModal`: フォーム入力・バリデーション（タイトル必須）・送信
- `StatsPanel`: 件数カウント・danger 表示の条件

---

## 7. 実装ステップ

### Step 1: モノレポ基盤構築

- [ ] ルート `package.json` に `workspaces` 設定を追加
- [ ] `packages/frontend` を Vite + React + TypeScript でスキャフォールド
- [ ] `packages/backend` を Hono + TypeScript で初期化
- [ ] 各パッケージに Vitest を設定
- [ ] ルートの `npm run dev` で両パッケージを並列起動できるよう設定

### Step 2: バックエンド実装（TDD）

- [ ] **Red**: `memory.test.ts` — タスクの CRUD テストを先に記述
- [ ] **Green**: `memory.ts` を実装してテストを通す
- [ ] **Red**: `tasks.test.ts` — 各 API エンドポイントのテストを記述
- [ ] **Green**: `tasks.ts` ルートを実装
- [ ] **Red**: バリデーションテスト（タイトル空・不正優先度）
- [ ] **Green**: バリデーションロジックを追加
- [ ] **Refactor**: コードを整理

### Step 3: フロントエンド実装（TDD）

- [ ] `types/task.ts` を定義
- [ ] `api/taskApi.ts` — バックエンド API クライアントを実装
- [ ] **Red**: `useTasks.test.ts` — タスク操作・localStorage 同期のテストを記述
- [ ] **Green**: `useTasks.ts` を実装
- [ ] **Red**: `StatsPanel.test.tsx` — 件数表示のテストを記述
- [ ] **Green**: `StatsPanel.tsx` を実装
- [ ] **Red**: `TaskCard.test.tsx` — 表示・ボタン操作のテストを記述
- [ ] **Green**: `TaskCard.tsx` を実装
- [ ] **Red**: `TaskModal.test.tsx` — フォーム操作・バリデーションのテストを記述
- [ ] **Green**: `TaskModal.tsx` を実装
- [ ] `App.tsx` でコンポーネントを統合

### Step 4: スタイリング

- [ ] モックの `App.css` をベースに `packages/frontend/src/App.css` を移植
- [ ] レスポンシブ対応（モバイル対応は既存 CSS を踏襲）

### Step 5: 統合・動作確認

- [ ] フロントエンドとバックエンドを起動し、API 連携を確認
- [ ] localStorage の永続化を確認（ページリロード後もデータが残る）
- [ ] 全テストがグリーンであることを確認
- [ ] モックと見た目・動作を比較して差異がないことを確認

---

## 8. 開発環境のセットアップ・起動手順

```bash
# 依存インストール（全パッケージ）
npm install

# 開発サーバー起動（フロントエンド + バックエンド 並列）
npm run dev

# テスト実行（全パッケージ）
npm test

# 個別起動
npm run dev --workspace=packages/frontend   # http://localhost:5173
npm run dev --workspace=packages/backend    # http://localhost:3000
```

---

## 9. 完了条件

- [ ] `npm run dev` 一発でフロントエンド・バックエンドが起動する
- [ ] ブラウザで `http://localhost:5173` にアクセスしてアプリが表示される
- [ ] タスクの作成・編集・完了が動作する
- [ ] ページリロード後もデータが保持される（localStorage）
- [ ] 全テストがグリーン（`npm test` でエラーなし）
- [ ] TypeScript のコンパイルエラーがない
