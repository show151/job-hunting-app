# 実装計画書 (implementation-plan.md)

- 関連ドキュメント: `requirements.md`(要件定義書)
- 本書の位置づけ: `requirements.md`が「**何を作るか**」を定義するのに対し、本書は「**どの順番で・どう作るか**」を管理する(要件定義書 13.8参照)
- 運用ルール: 各タスクは着手前にGitHub Issueを起票し、`requirements.md` 15章(GitHub運用ルール)のブランチ命名・コミット規約・PR運用に従う

---

## 0. 使い方
- フェーズは基本的に上から順番に進める(依存関係があるため)
- 各フェーズの完了時に、末尾の「進捗管理表」のステータスを更新する
- 1タスク(またはタスクのまとまり)ごとに1 Issue → 1ブランチ → 1PRを基本単位とする

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
- [x] PR作成 → セルフレビュー → `main`にマ
-

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
- [ ] PR作成 → セルフレビュー → `main`にマージ

---

## Phase 3: 選考フェーズ・タスク(説明会・カジュアル面談を含む)
対応ブランチ例: `feature/phase-task-api`

- [ ] Issue: 「SelectionPhase APIの実装」を作成
- [ ] Issue: 「Task APIの実装」を作成
- [ ] `GET/POST /api/companies/:companyId/phases`
- [ ] `PUT/DELETE /api/phases/:id`
- [ ] `currentPhase`算出ロジックを実装(要件定義書12.10の方針: アプリ側で都度算出)
- [ ] `GET /api/tasks`(`?upcoming=true`、`?companyId=`等の絞り込み対応)
- [ ] `POST /api/companies/:companyId/tasks`(締切/面接/説明会/その他に対応)
- [ ] `PUT/DELETE /api/tasks/:id`
- [ ] PR作成 → セルフレビュー → `main`にマージ

---

## Phase 4: 書類・面接メモ
対応ブランチ例: `feature/document-note-api`

- [ ] Issue: 「Document APIの実装」を作成
- [ ] Issue: 「InterviewNote APIの実装」を作成
- [ ] Document CRUD(`isTemplate`対応)
- [ ] `POST /api/documents/:id/duplicate`(テンプレート複製)
- [ ] InterviewNote CRUD
- [ ] PR作成 → セルフレビュー → `main`にマージ

---

## Phase 5: ダッシュボードAPI
対応ブランチ例: `feature/dashboard-api`

- [ ] Issue: 「ダッシュボード集約APIの実装」を作成
- [ ] `GET /api/dashboard`(応募中/選考中/内定/不採用の件数、直近タスク、フェーズ別件数を集計)
- [ ] PR作成 → セルフレビュー → `main`にマージ

---

## Phase 6: フロントエンド実装
対応ブランチ例: `feature/login-ui`, `feature/dashboard-ui`, `feature/company-list-ui`, `feature/company-detail-ui`

- [ ] Issue: 「APIクライアント・認証状態管理の実装」を作成
- [ ] APIクライアント(fetch/axiosラッパー)実装
- [ ] JWTの保持・認証状態管理を実装
- [ ] Issue: 「ログイン/新規登録画面の実装」を作成 → 要件定義書14.5のデザインに準拠して実装
- [ ] Issue: 「ダッシュボード画面の実装」を作成 → 14.2のデザインに準拠して実装
- [ ] Issue: 「応募先一覧・カンバン画面の実装」を作成 → 14.3の表示件数制御(5件+展開)を含めて実装
- [ ] Issue: 「応募先詳細画面の実装」を作成 → 14.4のデザインに準拠して実装
- [ ] 各画面ごとにPR作成 → セルフレビュー → `main`にマージ

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
| 0 | プロジェクト初期セットアップ | 未着手 |
| 1 | 認証機能 | 未着手 |
| 2 | Company CRUD | 未着手 |
| 3 | 選考フェーズ・タスク | 未着手 |
| 4 | 書類・面接メモ | 未着手 |
| 5 | ダッシュボードAPI | 未着手 |
| 6 | フロントエンド実装 | 未着手 |
| 7 | 仕上げ | 未着手 |
