#!/bin/bash
# 全Issueを一括作成するスクリプト
# 前提: GitHub CLI (gh) がインストール・ログイン済みであること
# 前提: github-templates-and-labels.md のラベルが作成済みであること
# 実行: リポジトリのルートディレクトリで `bash create-issues.sh`

set -e

gh issue create \
  --title "プロジェクト初期セットアップ" \
  --label "chore,priority: must,phase: 0-setup" \
  --body "## 概要
リポジトリ作成からDocker・Prisma・.github設定までの初期セットアップを行う。

## 対応する要件
requirements.md 13章(開発環境セットアップ)、15章(GitHub運用ルール)

## 完了条件
- [ ] docker compose up -d でDBが起動する
- [ ] curl http://localhost:4000/api/health が応答する
- [ ] npx prisma studio でテーブルが確認できる
- [ ] http://localhost:5173 でVite初期画面が表示される
- [ ] PRを作成し、CIが通り、main にマージできた

## 参照
phase0-setup-guide.md"

gh issue create \
  --title "ユーザー登録・ログインAPIの実装" \
  --label "feature,priority: must,phase: 1-auth" \
  --body "## 概要
register / login / me の認証APIを実装する。

## 対応する要件
requirements.md 4.7、10.2、12.2

## 完了条件
- [ ] POST /api/auth/register で新規登録でき、トークンが返る
- [ ] 同じメールアドレスで再登録するとエラーになる
- [ ] POST /api/auth/login で正しい認証情報ならトークンが返り、誤りは401になる
- [ ] GET /api/auth/me はトークンありで自分の情報を返し、トークンなしでは401になる

## 参照
phase1-auth-guide.md"

gh issue create \
  --title "Company CRUD APIの実装" \
  --label "feature,priority: must,phase: 2-company" \
  --body "## 概要
応募先企業(Company)のCRUD APIを実装する。

## 対応する要件
requirements.md 4.1、12.3

## 完了条件
- [ ] GET/POST /api/companies が動作する(検索・絞り込み含む)
- [ ] GET/PUT/DELETE /api/companies/:id が動作する(削除は論理削除)
- [ ] zodによるバリデーションが効いている
- [ ] 認証必須になっており、他ユーザーのデータにアクセスできない

## 参照
implementation-plan.md Phase 2"

gh issue create \
  --title "SelectionPhase APIの実装" \
  --label "feature,priority: must,phase: 3-phase-task" \
  --body "## 概要
選考フェーズ(SelectionPhase)のAPIを実装する。カジュアル面談も対象。

## 対応する要件
requirements.md 4.2、12.4

## 完了条件
- [ ] GET/POST /api/companies/:companyId/phases が動作する
- [ ] PUT/DELETE /api/phases/:id が動作する
- [ ] currentPhase算出ロジックが実装されている(12.10の方針)

## 参照
implementation-plan.md Phase 3"

gh issue create \
  --title "Task APIの実装" \
  --label "feature,priority: must,phase: 3-phase-task" \
  --body "## 概要
タスク(Task)のAPIを実装する。締切/面接/説明会/その他に対応。

## 対応する要件
requirements.md 4.3、12.5

## 完了条件
- [ ] GET /api/tasks が絞り込みクエリ(upcoming, companyId, type)に対応している
- [ ] POST /api/companies/:companyId/tasks が動作する
- [ ] PUT/DELETE /api/tasks/:id が動作する

## 参照
implementation-plan.md Phase 3"

gh issue create \
  --title "Document APIの実装" \
  --label "feature,priority: should,phase: 4-doc-note" \
  --body "## 概要
書類(Document)のCRUD・複製APIを実装する。

## 対応する要件
requirements.md 4.4、12.6

## 完了条件
- [ ] Document CRUDが動作する(isTemplate対応)
- [ ] POST /api/documents/:id/duplicate で複製できる

## 参照
implementation-plan.md Phase 4"

gh issue create \
  --title "InterviewNote APIの実装" \
  --label "feature,priority: should,phase: 4-doc-note" \
  --body "## 概要
面接メモ(InterviewNote)のCRUD APIを実装する。

## 対応する要件
requirements.md 4.5、12.7

## 完了条件
- [ ] GET/POST /api/companies/:companyId/interview-notes が動作する
- [ ] PUT/DELETE /api/interview-notes/:id が動作する

## 参照
implementation-plan.md Phase 4"

gh issue create \
  --title "ダッシュボード集約APIの実装" \
  --label "feature,priority: must,phase: 5-dashboard" \
  --body "## 概要
ダッシュボード用のサマリ集約APIを実装する。

## 対応する要件
requirements.md 4.6、12.8

## 完了条件
- [ ] GET /api/dashboard が応募中/選考中/内定/不採用件数、直近タスク、フェーズ別件数を返す

## 参照
implementation-plan.md Phase 5"

gh issue create \
  --title "APIクライアント・認証状態管理の実装" \
  --label "feature,priority: must,phase: 6-frontend" \
  --body "## 概要
フロントエンドのAPIクライアントとJWTベースの認証状態管理を実装する。

## 完了条件
- [ ] fetch/axiosラッパーが実装されている
- [ ] JWTの保持・ログイン状態判定ができる

## 参照
implementation-plan.md Phase 6"

gh issue create \
  --title "ログイン/新規登録画面の実装" \
  --label "feature,priority: must,phase: 6-frontend" \
  --body "## 概要
requirements.md 14.5のデザインに沿って、ログイン/新規登録画面を実装する。

## 完了条件
- [ ] タブでログイン/新規登録を切り替えられる
- [ ] 未入力時にインラインでエラーメッセージが表示される
- [ ] ログイン成功でダッシュボードに遷移する

## 参照
implementation-plan.md Phase 6"

gh issue create \
  --title "ダッシュボード画面の実装" \
  --label "feature,priority: must,phase: 6-frontend" \
  --body "## 概要
requirements.md 14.2のデザインに沿って、ダッシュボード画面を実装する。

## 完了条件
- [ ] メトリクスカード、直近タスク、フェーズ別横棒グラフが表示される
- [ ] GET /api/dashboard のデータを反映している

## 参照
implementation-plan.md Phase 6"

gh issue create \
  --title "応募先一覧・カンバン画面の実装" \
  --label "feature,priority: must,phase: 6-frontend" \
  --body "## 概要
requirements.md 14.3のデザインに沿って、応募先一覧(カンバン)画面を実装する。

## 完了条件
- [ ] フェーズ別カンバンで企業カードが表示される
- [ ] 1列5件表示・「+N件を表示」での展開が動作する
- [ ] 検索・業界絞り込みが動作する

## 参照
implementation-plan.md Phase 6"

gh issue create \
  --title "応募先詳細画面の実装" \
  --label "feature,priority: must,phase: 6-frontend" \
  --body "## 概要
requirements.md 14.4のデザインに沿って、応募先詳細画面を実装する。

## 完了条件
- [ ] 選考フェーズ履歴がタイムライン表示される
- [ ] タスク・書類・面接メモが表示される

## 参照
implementation-plan.md Phase 6"

gh issue create \
  --title "仕上げ(動作確認・README・面接想定問答)" \
  --label "chore,priority: should,phase: 7-polish" \
  --body "## 概要
一連の操作フローの手動確認、README充実、面接説明ポイントの整理を行う。

## 完了条件
- [ ] 登録→応募先登録→選考進行→内定の一連の流れを手動確認した
- [ ] README.mdに機能一覧・技術選定理由・スクリーンショットを追記した
- [ ] requirements.md 16章を見返し、説明できる状態にした

## 参照
implementation-plan.md Phase 7"

echo "14件のIssueを作成しました。"
