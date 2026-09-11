# 実装計画書 (implementation-plan.md)

- 関連ドキュメント: `requirements.md`(要件定義書)
- 本書の位置づけ: `requirements.md`が「**何を作るか**」を定義するのに対し、本書は「**どの順番で・どう作るか**」を管理する(要件定義書 13.8参照)
- 運用ルール: 各タスクは着手前にGitHub Issueを起票し、`requirements.md` 15章(GitHub運用ルール)のブランチ命名・コミット規約・PR運用に従う

---

## 0. 使い方
- フェーズは基本的に上から順番に進める(依存関係があるため)
- 各フェーズの完了時に、末尾の「進捗管理表」のステータスを更新する
- 1つのIssueにつき必ず1つのブランチ・1つのPRを作成する(複数Issueを1ブランチにまとめない)
- フェーズ内に複数Issueがある場合は「Part A / Part B …」として分割し、依存関係がある場合は前のPartのマージ後に次のブランチを作成する

---

## Phase 0: プロジェクト初期セットアップ
対応ブランチ例: `chore/project-setup`

- [x] GitHubリポジトリ作成、`main`ブランチのBranch protection設定(PR必須・直接push禁止)
- [x] `.gitignore`配置(`node_modules/`, `.env`, `dist/`)
- [x] `docker-compose.yml`配置、PostgreSQL起動確認
- [x] `backend/`: npm init、TypeScript設定、Express雛形作成
- [x] `frontend/`: Vite + React + TypeScriptプロジェクト作成
- [x] Prisma初期化、`schema.prisma`に要件定義書11章のスキーマを反映
- [x] `npx prisma migrate dev --name init` 実行、DB反映確認
- [x] `.github/ISSUE_TEMPLATE/`、`.github/PULL_REQUEST_TEMPLATE.md`作成
- [x] `.github/workflows/ci.yml`作成(型チェック・Lintの自動実行)
- [x] backendにESLintを導入し、npm run lintを追加
- [x] backendのtsconfig.jsonでoutDir/rootDirを確認し、npm run buildを通す
- [x] frontendのnpm run lint・npm run buildを確認
- [x] ci.ymlをlint・型チェック・buildの3ステップに更新
- [x] `README.md`初版作成(プロジェクト概要・セットアップ手順)

---

## Phase 1: 認証機能
対応ブランチ例: `feature/auth-api`

- [x] Issue: 「ユーザー登録・ログインAPIの実装」を作成
- [x] bcryptによるパスワードハッシュ化処理を実装
- [x] JWT発行処理、および検証ミドルウェアを実装
- [x] `POST /api/auth/register` 実装
- [x] `POST /api/auth/login` 実装
- [x] `GET /api/auth/me` 実装
- [x] zodでリクエストバリデーションを実装
- [x] curl/Postman等で手動動作確認
- [ ] PR作成 → セルフレビュー → `main`にマージ

---

## Phase 2: 応募先企業(Company)CRUD
対応ブランチ例: `feature/company-crud`

- [x] Issue: 「Company CRUD APIの実装」を作成
- [x] `GET /api/companies`(検索・絞り込みクエリ対応)
- [x] `POST /api/companies`
- [x] `GET /api/companies/:id`
- [x] `PUT /api/companies/:id`
- [x] `DELETE /api/companies/:id`(論理削除、`deletedAt`設定)
- [x] zodバリデーション実装
- [x] 認証ミドルウェアを適用し、他ユーザーのデータにアクセスできないことを確認
- [x] PR作成 → セルフレビュー → `main`にマージ

---

## Phase 3: 選考フェーズ・タスク(説明会・カジュアル面談を含む)
### Part A: SelectionPhase API
対応ブランチ: `feature/selection-phase-api`

- [x] Issue: 「SelectionPhase APIの実装」を作成
- [ ] GET/POST /api/companies/:companyId/phases
- [ ] PUT/DELETE /api/phases/:id
- [ ] currentPhase算出ロジックを実装(要件定義書12.10の方針: アプリ側で都度算出)
- [ ] PR作成 → セルフレビュー → mainにマージ

### Part B: Task API
対応ブランチ: `feature/task-api`(Part Aマージ後に着手)

- [ ] Issue: 「Task APIの実装」を作成
- [ ] GET /api/tasks(?upcoming=true、?companyId=等の絞り込み対応)
- [ ] POST /api/companies/:companyId/tasks(締切/面接/説明会/その他に対応)
- [ ] PUT/DELETE /api/tasks/:id
- [ ] PR作成 → セルフレビュー → mainにマージ

---

## Phase 4: 書類・面接メモ
### Part A: Document API
対応ブランチ: `feature/document-api`

- [ ] Issue: 「Document APIの実装」を作成
- [ ] Document CRUD(isTemplate対応)
- [ ] POST /api/documents/:id/duplicate(テンプレート複製)
- [ ] PR作成 → セルフレビュー → mainにマージ

### Part B: InterviewNote API
対応ブランチ: `feature/interview-note-api`(Part Aマージ後に着手)

- [ ] Issue: 「InterviewNote APIの実装」を作成
- [ ] InterviewNote CRUD
- [ ] PR作成 → セルフレビュー → mainにマージ

---

## Phase 5: ダッシュボードAPI
対応ブランチ例: `feature/dashboard-api`

- [ ] Issue: 「ダッシュボード集約APIの実装」を作成
- [ ] `GET /api/dashboard`(応募中/選考中/内定/不採用の件数、直近タスク、フェーズ別件数を集計)
- [ ] PR作成 → セルフレビュー → `main`にマージ

---

## Phase 6: フロントエンド実装
### Part A: APIクライアント・認証状態管理
対応ブランチ: `feature/api-client-auth-state`

- [ ] Issue: 「APIクライアント・認証状態管理の実装」を作成
- [ ] APIクライアント(fetch/axiosラッパー)実装
- [ ] JWTの保持・認証状態管理を実装
- [ ] PR作成 → セルフレビュー → mainにマージ

### Part B: ログイン/新規登録画面
対応ブランチ: `feature/login-ui`(Part Aマージ後に着手)

- [ ] Issue: 「ログイン/新規登録画面の実装」を作成
- [ ] 要件定義書14.5のデザインに準拠して実装
- [ ] PR作成 → セルフレビュー → mainにマージ

### Part C: ダッシュボード画面
対応ブランチ: `feature/dashboard-ui`(Part Aマージ後に着手)

- [ ] Issue: 「ダッシュボード画面の実装」を作成
- [ ] 要件定義書14.2のデザインに準拠して実装
- [ ] PR作成 → セルフレビュー → mainにマージ

### Part D: 応募先一覧・カンバン画面
対応ブランチ: `feature/company-list-ui`(Part Aマージ後に着手)

- [ ] Issue: 「応募先一覧・カンバン画面の実装」を作成
- [ ] 要件定義書14.3の表示件数制御(5件+展開)を含めて実装
- [ ] PR作成 → セルフレビュー → mainにマージ

### Part E: 応募先詳細画面
対応ブランチ: `feature/company-detail-ui`(Part Aマージ後に着手)

- [ ] Issue: 「応募先詳細画面の実装」を作成
- [ ] 要件定義書14.4のデザインに準拠して実装
- [ ] PR作成 → セルフレビュー → mainにマージ

---

## Phase 7: 仕上げ
対応ブランチ例: `chore/polish`

- [ ] 一連の操作フロー(登録→応募先登録→選考進行→内定)を通しで手動確認
- [ ] `README.md`を充実させる(機能一覧、技術選定理由、スクリーンショット)
- [ ] 面接での説明ポイントを整理する(要件定義書16章参照)

---

## 進捗管理表

| Phase | 内容 | ステータス |
|---|---|---|
| 0 | プロジェクト初期セットアップ | 完了 |
| 1 | 認証機能 | 完了 |
| 2 | Company CRUD | 完了 |
| 3 | 選考フェーズ・タスク | 未着手 |
| 4 | 書類・面接メモ | 未着手 |
| 5 | ダッシュボードAPI | 未着手 |
| 6 | フロントエンド実装 | 未着手 |
| 7 | 仕上げ | 未着手 |
