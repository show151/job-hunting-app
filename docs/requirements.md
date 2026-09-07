# 就活管理アプリ 要件定義書

- 版数: v0.2
- 作成日: 2026-09-03(最終更新: 2026-09-04)
- ステータス: レビュー完了・実装フェーズへ移行

---

## 1. 背景・目的

### 1.1 背景
就職活動では、応募企業数が数十社に及ぶことも珍しくなく、以下のような管理が煩雑になりやすい。

- 企業ごとの選考ステータス(ES提出済み/一次面接待ち/内定 等)がバラバラに管理される
- 締切(ES提出期限・面接日程)の見落とし
- 提出したES・履歴書の内容や面接での回答内容を後から見返せない
- スプレッドシートでは選考フローの可視化がしづらい

### 1.2 目的
就活生が **応募先企業と選考状況を一元管理** し、締切や次のアクションを見逃さず、選考の振り返りができる状態を実現する。

### 1.3 想定ユーザー
- 新卒/第二新卒として就職活動を行う個人ユーザー(1人 = 1アカウントで自分の就活を管理)
- チーム機能・他ユーザーとの共有は本バージョンではスコープ外

---

## 2. スコープ

### 2.1 対象とする範囲(In Scope / MVP)
| 分類 | 内容 |
|---|---|
| 応募先管理 | 企業・職種・応募ルートの登録、一覧、検索・絞り込み |
| 選考ステータス管理 | 選考フェーズ(エントリー〜内定/不採用)の管理とステータス変更履歴 |
| スケジュール管理 | 締切・面接日時の登録、リマインド通知 |
| 書類管理 | ES・履歴書などのメモ/テキスト保存、企業への提出内容の紐付け |
| 振り返りメモ | 面接内容・質問・手応えの記録 |
| ダッシュボード | 進行中の選考状況をひと目で把握できる一覧・カンバン表示 |
| アカウント | ユーザー登録・ログイン(個人利用前提) |

### 2.2 対象外(Out of Scope / 将来検討)
- 複数ユーザーでの共有・チーム機能
- 企業口コミ・求人情報の自動収集(スクレイピング等)
- ES自動添削・AIによる自己分析支援(将来拡張候補として記載のみ)
- ネイティブアプリ化(本バージョンはWebアプリのみ)

---

## 3. 用語定義

| 用語 | 定義 |
|---|---|
| 応募先 | ユーザーが選考に応募する企業・団体 |
| 選考フェーズ | カジュアル面談、エントリー、書類選考、一次面接、二次面接、最終面接、内定、不採用等の段階 |
| ステータス | 各選考フェーズにおける進捗状態(未提出/提出済み/合格/不合格/日程調整中 等) |
| タスク | 締切や面接、説明会など、期限のあるアクション項目 |
| 説明会 | 企業理解のために参加する、選考フローとは別のイベント。参加時点で応募するかは未確定 |
| カジュアル面談 | 選考色の強い面談。合否の概念は薄いが、選考フローの一部として扱う |

---

## 4. 機能要件

優先度: **Must(MVP必須) / Should(早期に欲しい) / Could(余裕があれば)**

### 4.1 応募先管理【Must】
- 企業名、業界、職種、応募ルート(マイナビ/直接応募/リファラル等)、企業URL、メモを登録できる
- 応募先の一覧表示、企業名・業界・ステータスでの検索/絞り込み
- 応募先の編集・削除(削除は論理削除を想定)

### 4.2 選考ステータス管理【Must】
- 応募先ごとに選考フェーズ(エントリー〜内定/不採用)を管理できる
- フェーズごとにステータス(未着手/進行中/合格/不合格/辞退)を設定できる
- ステータス変更履歴を時系列で保持する(いつ・どのフェーズが・どう変わったか)
- カンバン形式(フェーズを列、企業をカードとする)で選考状況を俯瞰できる【Should】
  - 1列あたりの初期表示は5件までとし、超過分は列内の「+N件を表示」ボタンで展開する(一覧画面への遷移はさせない)

### 4.3 スケジュール・タスク管理【Must】
- 締切(ES提出期限等)・面接日時をタスクとして登録できる
- タスクは応募先・選考フェーズに紐付く
- カレンダー表示で締切/面接日を確認できる【Should】
- 期限が近いタスクをダッシュボード上部に表示する【Must】
- リマインド通知は本バージョンでは対応しない(9章参照。タスク一覧・ダッシュボードでの手動確認を前提とする)

### 4.4 書類管理【Should】
- ES・履歴書の内容をテキストで保存できる
- 保存した書類を応募先に紐付けられる
- 過去に提出した書類をテンプレートとして再利用(コピーして編集)できる【Could】

### 4.5 振り返り・面接メモ【Should】
- 面接ごとに、聞かれた質問・回答内容・手応え・反省点を記録できる
- 過去の面接メモを企業横断で検索できる【Could】

### 4.6 ダッシュボード【Must】
- 進行中の選考数、直近の締切、内定/不採用の件数などをサマリ表示
- 選考フェーズ別の企業数を可視化(グラフ等)【Could】

### 4.7 アカウント・認証【Must】
- メールアドレス+パスワードでの会員登録・ログイン
- パスワードリセット
- ログアウト

---

## 5. 非機能要件

| 分類 | 要件 |
|---|---|
| ユーザビリティ | スマホのブラウザからも問題なく操作できるレスポンシブデザイン |
| パフォーマンス | 一覧表示・検索は体感1〜2秒以内に応答 |
| セキュリティ | パスワードはハッシュ化して保存、通信はHTTPS化、他ユーザーのデータへの不正アクセス防止 |
| 可用性 | 個人利用中心のためSLAは厳密には定めないが、データ消失を防ぐバックアップ方針を検討 |
| 保守性 | MVP後の機能追加(通知方式変更、AI機能追加等)を見据えた拡張しやすい設計 |
| データ保持 | 退会時のデータ削除方針(個人情報保護の観点)を定める |

---

## 6. 主要ユースケース

1. ユーザーが新しい応募先企業を登録する
2. ユーザーが応募先の選考フェーズを「一次面接」に更新する
3. ユーザーが一次面接の日程をタスクとして登録し、リマインドを受け取る
4. ユーザーが面接後に振り返りメモを記録する
5. ユーザーがダッシュボードで直近の締切と進行中の選考を確認する
6. ユーザーがES本文を保存し、別企業用にコピーして編集する

---

## 7. 画面一覧(想定)

| 画面 | 概要 |
|---|---|
| ログイン/新規登録 | 認証 |
| ダッシュボード | サマリ、直近タスク、選考状況カンバン |
| 応募先一覧 | 検索・絞り込み・新規登録導線 |
| 応募先詳細 | 選考フェーズ、タスク、書類、面接メモをまとめて表示 |
| タスク/カレンダー | 締切・面接日程の一覧・カレンダー表示 |
| 書類管理 | ES・履歴書の一覧・編集 |
| 設定 | アカウント情報、通知設定 |

---

## 8. データモデル(概略)

```
User (ユーザー)
 └─ Company (応募先企業) 1対多
     ├─ SelectionPhase (選考フェーズ履歴) 1対多
     ├─ Task (締切・面接タスク) 1対多
     ├─ Document (提出書類) 1対多
     └─ InterviewNote (面接メモ) 1対多
```

主要エンティティ(初期案):
- **User**: id, email, password_hash, name, created_at
- **Company**: id, user_id, name, industry, route(応募ルート), url, memo
- **SelectionPhase**: id, company_id, phase(enum), status(enum), changed_at
- **Task**: id, company_id, title, type(締切/面接/説明会/その他), due_at, done_flag
- **Document**: id, user_id, company_id(nullable), title, body, is_template
- **InterviewNote**: id, company_id, phase_id, question, answer, impression, interviewed_at

※詳細なテーブル設計・正規化は技術スタック確定後に別途設計する。

---

## 9. 今後決めること(オープンイシュー)

1. ~~技術スタック~~ → 10章で確定
2. リマインド通知の方式 → **MVPでは対応せず後回し**(手動でタスク一覧・カレンダーを確認する運用とする)
3. ~~認証方式~~ → 10章で確定(自前実装)
4. MVPとしてどこまでを初回リリース範囲とするか → **4章の優先度どおり確定**(Must項目を初回リリース範囲とする)
5. ホスティング先(Vercel等PaaS / VPS等) → 未定・実装がある程度進んでから検討
6. 面接で説明しやすいよう、設計上の技術的こだわりポイント(例: ステータス変更履歴の持たせ方、認証の実装方法)をどこに置くか → 継続検討

---

## 10. 技術スタック(確定)

React経験は少しあり・サーバーサイドはほぼ未経験という現状と、「面接で技術力を語れるようにしたい」という目的を踏まえ、フロントエンド/バックエンドを分離し、基礎から実装する構成を採用する。

| 層 | 技術 | 選定理由 |
|---|---|---|
| フロントエンド | React(Vite) + TypeScript | Reactの経験を活かしつつ型安全に実装。Viteで軽量に開発開始できる |
| バックエンド | Node.js + Express + TypeScript | REST APIをゼロから実装し、サーバーサイドの基礎(ルーティング・ミドルウェア・エラーハンドリング等)を体で理解する |
| データベース | PostgreSQL | 実務利用を意識。応募先(1)対選考フェーズ/タスク/書類/面接メモ(多)というリレーショナルな構造に適合 |
| ORM | Prisma | TypeScriptとの親和性が高く、型安全なDB操作が可能。スキーマ駆動設計を体験・説明できる |
| 認証 | 自前実装(bcryptでパスワードハッシュ化 + JWTでセッション管理) | 外部サービスに頼らず、認証の仕組みそのものを理解・説明できるようにするため |
| API通信 | REST API(JSON) | フロント/バック間の役割分担を明確にし、疎結合な設計を体験するため |
| ホスティング | 未定(実装が進んだ段階で改めて検討) | - |

### 10.1 ディレクトリ構成(想定)
```
job-hunting-app/
├─ frontend/   # React(Vite) + TypeScript
│  └─ src/
│     ├─ components/
│     ├─ pages/
│     ├─ api/       # バックエンドAPIを呼び出すクライアント
│     └─ types/      # バックエンドと共有したい型定義
└─ backend/    # Node.js + Express + TypeScript
   └─ src/
      ├─ routes/     # エンドポイント定義
      ├─ controllers/
      ├─ services/    # ビジネスロジック
      ├─ prisma/      # schema.prisma、マイグレーション
      └─ middlewares/ # 認証チェック等
```

### 10.2 認証設計の方針(概要)
1. 新規登録: パスワードをbcryptでハッシュ化してDB保存
2. ログイン: 入力パスワードとハッシュを照合し、成功時にJWTを発行
3. 認証が必要なAPI: リクエストヘッダのJWTをミドルウェアで検証
4. トークンの有効期限切れ・リフレッシュ方針は実装時に詳細設計する

### 10.3 補足
- CORS設定が必要(frontendとbackendが別オリジンで動くため)
- 開発環境ではDockerでPostgreSQLを起動する構成を推奨(環境差異を減らせる)

---

## 11. データモデル詳細設計(Prisma Schema)

8章の概略データモデルを、Prismaのschema.prismaとして具体化する。

### 11.1 設計方針
- **選考フェーズは「マスタ的な列挙」ではなく「履歴として都度レコードを積む」方式**を採用する。フェーズが進むたびに新しいSelectionPhaseレコードを作成し、現在のフェーズは最新レコードから判定する。これにより「いつ、どのフェーズに進んだか」を完全な履歴として保持でき、面接で「なぜこの設計にしたか(監査性・振り返りやすさ)」を語れる。
- Enum(列挙型)はPrismaのenum機能で型安全に定義し、フロント側とも型を共有しやすくする。
- 論理削除(deletedAt)を主要エンティティに持たせ、誤削除からの復旧や、統計上「応募したが削除した」履歴を残せるようにする(4.1の要件に対応)。
- **説明会**は、選考に応募するかどうかも決まっていない段階で参加することが多く、合否の概念もないため、選考フロー(SelectionPhase)とは切り離し、既存の**Task**モデル(予定管理)に種別として追加する形で表現する。`isDone`フラグで「予定/参加済み」を管理する。
- **カジュアル面談**は、実質的に一次選考に近い位置づけであることが多いため、選考フロー(SelectionPhaseType)の一部として追加する。ただし合否の概念は薄いため、`PhaseStatus`のうち`NOT_STARTED`(予定)/`IN_PROGRESS`(調整中)/`PASSED`(参加済み)のみを運用上使い、`FAILED`は基本的に使わない想定とする(スキーマ上は許容しつつ、アプリのUI/バリデーションで運用を制御する)。

### 11.2 schema.prisma(初期案)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ---------- Enum ----------

enum SelectionPhaseType {
  CASUAL_INTERVIEW // カジュアル面談(合否はないが実質選考に近いためフローに含める)
  ENTRY            // エントリー
  DOCUMENT         // 書類選考(ES)
  FIRST_INTERVIEW  // 一次面接
  SECOND_INTERVIEW // 二次面接
  FINAL_INTERVIEW  // 最終面接
  OFFER            // 内定
  REJECTED         // 不採用
  WITHDRAWN        // 辞退
}

enum PhaseStatus {
  NOT_STARTED  // 未着手
  IN_PROGRESS  // 進行中
  PASSED       // 合格
  FAILED       // 不合格
  WITHDRAWN    // 辞退
}

enum TaskType {
  DEADLINE            // 提出締切
  INTERVIEW           // 面接
  EXPLANATION_SESSION // 説明会(選考フローとは別に、企業理解のために参加するイベント)
  OTHER               // その他
}

enum ApplicationRoute {
  DIRECT      // 企業サイトから直接
  AGENCY      // 就活サイト経由
  REFERRAL    // リファラル・紹介
  CAMPUS      // 大学経由
  OTHER
}

// ---------- Model ----------

model User {
  id           String     @id @default(uuid())
  email        String     @unique
  passwordHash String
  name         String
  companies    Company[]
  documents    Document[]
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}

model Company {
  id             String            @id @default(uuid())
  user           User              @relation(fields: [userId], references: [id])
  userId         String
  name           String
  industry       String?
  route          ApplicationRoute  @default(OTHER)
  url            String?
  memo           String?
  phases         SelectionPhase[]
  tasks          Task[]
  documents      Document[]
  interviewNotes InterviewNote[]
  deletedAt      DateTime?
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt

  @@index([userId])
}

// 選考フェーズの履歴。フェーズが進むたびに新規レコードを作成する
model SelectionPhase {
  id             String              @id @default(uuid())
  company        Company             @relation(fields: [companyId], references: [id])
  companyId      String
  phase          SelectionPhaseType
  status         PhaseStatus         @default(NOT_STARTED)
  changedAt      DateTime            @default(now())
  memo           String?
  tasks          Task[]
  interviewNotes InterviewNote[]

  @@index([companyId])
}

model Task {
  id         String          @id @default(uuid())
  company    Company         @relation(fields: [companyId], references: [id])
  companyId  String
  phase      SelectionPhase? @relation(fields: [phaseId], references: [id])
  phaseId    String?
  title      String
  type       TaskType
  dueAt      DateTime
  isDone     Boolean         @default(false)
  createdAt  DateTime        @default(now())
  updatedAt  DateTime        @updatedAt

  @@index([companyId])
  @@index([dueAt])
}

model Document {
  id         String   @id @default(uuid())
  user       User     @relation(fields: [userId], references: [id])
  userId     String
  company    Company? @relation(fields: [companyId], references: [id])
  companyId  String?
  title      String
  body       String
  isTemplate Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([userId])
}

model InterviewNote {
  id            String          @id @default(uuid())
  company       Company         @relation(fields: [companyId], references: [id])
  companyId     String
  phase         SelectionPhase? @relation(fields: [phaseId], references: [id])
  phaseId       String?
  question      String?
  answer        String?
  impression    String?
  interviewedAt DateTime
  createdAt     DateTime        @default(now())

  @@index([companyId])
}
```

### 11.3 補足・今後の検討事項
- `SelectionPhase`を履歴として積む方式のため、「現在のステータス」を取得するクエリは「companyIdごとに最新のchangedAtを持つレコード」を取得するロジックが必要(Prismaの`groupBy`や、アプリ側での最新レコード抽出で対応)。実装時に具体化する。
- タスクの繰り返し・リマインドは9章の通り本バージョンでは対応しない。
- インデックスは検索・絞り込みで頻出するカラム(userId, companyId, dueAt)に設定済み。実装時にクエリパフォーマンスを見て調整する。
- 説明会(Task.type = EXPLANATION_SESSION)とカジュアル面談(SelectionPhase.phase = CASUAL_INTERVIEW)は概念上別モデルに属するため、ダッシュボードで両方をまとめて時系列表示する場合はアプリ側でマージするクエリが必要になる(実装時に具体化する)。

---

## 12. APIエンドポイント設計

11章のデータモデルを前提に、Express側のREST APIエンドポイントを設計する。認証が必要なエンドポイントは、リクエストヘッダのJWTをミドルウェアで検証する(10.2参照)。

### 12.1 設計方針
- リソースベースのREST設計とし、URLは名詞・複数形を基本とする(例: `/companies`)
- 親子関係が明確なリソース(選考フェーズ、タスク、面接メモ)は `/companies/:companyId/...` のネスト構造にし、必ず特定企業に紐づく形でアクセスさせる
- 更新系(PUT)は原則リソース全体の置き換えではなく、必要な項目のみ受け取る部分更新として実装する(実装時にPATCHとの使い分けを再検討してもよい)
- レスポンスは共通で `{ data, error }` の形式に統一し、フロント側のエラーハンドリングを一貫させる

### 12.2 認証

| Method | Path | 認証要否 | 概要 |
|---|---|---|---|
| POST | `/api/auth/register` | 不要 | 新規登録(email, password, name) |
| POST | `/api/auth/login` | 不要 | ログイン。成功時にJWTを返却 |
| GET | `/api/auth/me` | 要 | ログイン中ユーザー情報の取得 |

### 12.3 応募先企業(Company)

| Method | Path | 認証要否 | 概要 |
|---|---|---|---|
| GET | `/api/companies` | 要 | 応募先一覧取得(クエリパラメータで検索・絞り込み: `?keyword=&industry=&phase=`) |
| POST | `/api/companies` | 要 | 応募先の新規登録 |
| GET | `/api/companies/:id` | 要 | 応募先詳細取得(選考フェーズ・タスク・書類・面接メモを含めて返却) |
| PUT | `/api/companies/:id` | 要 | 応募先情報の更新 |
| DELETE | `/api/companies/:id` | 要 | 応募先の削除(論理削除。`deletedAt`を設定) |

### 12.4 選考フェーズ(SelectionPhase)

| Method | Path | 認証要否 | 概要 |
|---|---|---|---|
| GET | `/api/companies/:companyId/phases` | 要 | 指定企業の選考フェーズ履歴を時系列で取得 |
| POST | `/api/companies/:companyId/phases` | 要 | 新しい選考フェーズを追加(=フェーズ進行。カジュアル面談も`phase: CASUAL_INTERVIEW`として登録) |
| PUT | `/api/phases/:id` | 要 | フェーズのステータス・メモを更新(例: `IN_PROGRESS`→`PASSED`) |
| DELETE | `/api/phases/:id` | 要 | 誤登録したフェーズ履歴の削除 |

### 12.5 タスク(Task)※説明会もここに含む

| Method | Path | 認証要否 | 概要 |
|---|---|---|---|
| GET | `/api/tasks` | 要 | 自分の全タスク取得(クエリで絞り込み: `?upcoming=true`(直近の締切のみ)、`?companyId=`、`?type=EXPLANATION_SESSION`等) |
| POST | `/api/companies/:companyId/tasks` | 要 | タスクの新規登録(締切/面接/説明会/その他) |
| PUT | `/api/tasks/:id` | 要 | タスクの更新(日時変更、`isDone`の切り替え等) |
| DELETE | `/api/tasks/:id` | 要 | タスクの削除 |

### 12.6 書類(Document)

| Method | Path | 認証要否 | 概要 |
|---|---|---|---|
| GET | `/api/documents` | 要 | 自分の書類一覧取得(`?isTemplate=true`でテンプレートのみ絞り込み) |
| POST | `/api/documents` | 要 | 書類の新規作成(companyIdは任意。テンプレートの場合は未指定) |
| GET | `/api/documents/:id` | 要 | 書類詳細取得 |
| PUT | `/api/documents/:id` | 要 | 書類の更新 |
| DELETE | `/api/documents/:id` | 要 | 書類の削除 |
| POST | `/api/documents/:id/duplicate` | 要 | 既存書類(テンプレート等)を複製して新規作成(4.4のCould要件に対応) |

### 12.7 面接メモ(InterviewNote)

| Method | Path | 認証要否 | 概要 |
|---|---|---|---|
| GET | `/api/companies/:companyId/interview-notes` | 要 | 指定企業の面接メモ一覧取得 |
| POST | `/api/companies/:companyId/interview-notes` | 要 | 面接メモの新規登録(phaseIdで選考フェーズに紐付け可) |
| PUT | `/api/interview-notes/:id` | 要 | 面接メモの更新 |
| DELETE | `/api/interview-notes/:id` | 要 | 面接メモの削除 |

### 12.8 ダッシュボード

| Method | Path | 認証要否 | 概要 |
|---|---|---|---|
| GET | `/api/dashboard` | 要 | サマリ情報を集約して返却(進行中の選考数、直近タスクN件、フェーズ別企業数等) |

### 12.9 レスポンス例(参考)

```jsonc
// GET /api/companies/:id のレスポンス例
{
  "data": {
    "id": "uuid",
    "name": "株式会社サンプル",
    "industry": "IT",
    "route": "DIRECT",
    "currentPhase": { "phase": "FIRST_INTERVIEW", "status": "IN_PROGRESS" },
    "phases": [ /* SelectionPhase[] 時系列 */ ],
    "tasks": [ /* Task[] */ ],
    "documents": [ /* Document[] */ ],
    "interviewNotes": [ /* InterviewNote[] */ ]
  },
  "error": null
}
```

### 12.10 設計判断(確定)

| 論点 | 決定 | 理由 |
|---|---|---|
| `currentPhase`の算出方法 | **アプリ側で都度算出**する(DB非正規化はしない)。企業詳細は`findFirst({orderBy: changedAt desc})`で1件取得、一覧は全フェーズを1クエリで取得しJS側で企業ごとに最新をグルーピングする | 個人の就活管理では企業数が数十件規模に収まり、非正規化による書き込み時の不整合リスクを負うメリットが薄い。まずシンプルな設計とし、将来パフォーマンス課題が出た場合に非正規化や生SQL(Window関数)を検討する(YAGNI) |
| バリデーション | **zod**を導入し、各APIのリクエストボディをスキーマ定義で検証する。スキーマから型を推論し、Controller層の型定義にも活用する | TypeScript中心の構成と親和性が高く、スキーマ駆動でバリデーションと型定義を一元化できるため。実務でも広く使われており、設計意図を説明しやすい |

- エラーレスポンスのステータスコード・エラーコード体系は実装時に統一ルールを定める(zod導入によりバリデーションエラーは400、想定外エラーは500に統一する方針)

---

## 13. 開発環境セットアップ

### 13.1 前提ツール
- Node.js(LTS版)、npm
- Docker Desktop(PostgreSQLをローカルで起動するため)
- Git

### 13.2 リポジトリ構成(10.1を再掲・具体化)
```
job-hunting-app/
├─ docker-compose.yml
├─ frontend/     # React(Vite) + TypeScript
│  ├─ .env
│  └─ src/...
└─ backend/      # Node.js + Express + TypeScript
   ├─ .env
   ├─ prisma/
   │  └─ schema.prisma
   └─ src/...
```

### 13.3 docker-compose.yml(PostgreSQL)

```yaml
services:
  db:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app_password
      POSTGRES_DB: job_hunting_app
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

### 13.4 環境変数

**backend/.env**
```
DATABASE_URL="postgresql://app:app_password@localhost:5432/job_hunting_app"
JWT_SECRET="開発用の適当な文字列(本番では必ず変更)"
PORT=4000
```

**frontend/.env**
```
VITE_API_BASE_URL="http://localhost:4000/api"
```

### 13.5 セットアップ手順

1. `docker compose up -d` でPostgreSQLを起動
2. `cd backend && npm install`
3. `npx prisma migrate dev --name init` でスキーマ(11章)をDBに反映
4. `npm run dev`(backend)でAPIサーバー起動(例: `http://localhost:4000`)
5. `cd frontend && npm install`
6. `npm run dev`(frontend)でVite開発サーバー起動(例: `http://localhost:5173`)

### 13.6 package.json スクリプト例

**backend**
```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:studio": "prisma studio"
  }
}
```

**frontend**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

- `prisma studio`はDBの中身をGUIで確認できるため、開発初期の動作確認に活用する

### 13.7 .gitignore(要点)
```
node_modules/
.env
dist/
```
- `.env`はSecret情報を含むためコミットしない。代わりに`.env.example`をリポジトリに含め、必要な変数名だけ共有する

### 13.8 実装フェーズについて
実装の詳細な作業計画(タスク分解・チェックリスト)は、本書とは別に **`implementation-plan.md`** として管理する。本書(要件定義書)は「何を作るか」を定義し、実装計画書は「どの順番で・どう作るか」を管理する役割分担とする。

---

## 14. UI設計方針

### 14.1 デザインの方向性
「情報の見やすさ」を軸に、ITエンジニアらしい機能的な印象を目指す。過度な装飾は避け、数値やステータスを素早く把握できることを優先する。

- 数値(件数など)は等幅フォント(`font-mono`)で強調し、データが並んだときに桁が揃って読みやすいようにする
- カード型のUIでメトリクス(応募中/選考中/内定/不採用の件数)を表示する
- ステータスに応じた色分け(締切間近は警告色で強調 等)は最小限にとどめ、多用しない
- 一覧性が求められる箇所(タスク一覧、フェーズ別の件数比較)は、横棒グラフや行リストなど「値を横に並べて比較しやすい」表現を優先する(縦棒グラフより実務的な比較のしやすさを重視)
- タスクは種類(締切/面接/説明会/その他)ごとにアイコンを変え、一覧上で種類を判別しやすくする

### 14.2 ダッシュボード画面の確定デザイン
- 上部: 応募中/選考中/内定/不採用の件数をカード型メトリクスで表示(等幅フォントで数値を強調)
- 中央: 直近のタスク一覧(種類別アイコン、日付、締切間近の警告表示)
- 下部: 選考フェーズ別の応募先数を横棒グラフで表示

### 14.3 カンバン画面の表示件数制御
- 1列あたり初期表示5件、超過分は列内の展開ボタン(「+N件を表示」)でその場に追加表示する
- 別画面への遷移は行わず、俯瞰性を保ったままユーザーの操作で情報量を調整できるようにする

### 14.4 応募先詳細画面の確定デザイン
- 上部: 企業名・業界・応募ルート・企業URL、右上に現在の選考フェーズをバッジ表示
- 選考フェーズ履歴をタイムライン形式で表示する(合格は成功色、進行中はアクセント色、未着手はグレーの点で表現し、視覚的に選考の進み具合を追える)
- 左カラム: タスク一覧(完了タスクは取り消し線で表現)、書類一覧
- 右カラム: 面接メモ(どのフェーズ・いつの記録かを明示した上で、質問・回答を表示)

### 14.5 ログイン/新規登録画面の確定デザイン
- 1画面内でタブ切り替え(ログイン/新規登録)。別ページ遷移にはしない
- 入力必須項目が未入力のまま送信された場合、フォーム下部にインラインでエラーメッセージを表示する(ページ遷移や別ダイアログは使わない)
- ログイン画面に「パスワードを忘れた方」の導線を設置(4.7のパスワードリセット要件に対応)

### 14.6 未着手の画面(参考)
以下の画面はShould/Could要件が中心のため、本フェーズではモックアップ未作成。実装が進んだ段階で改めてデザインする。
- タスク/カレンダー(カレンダー表示は4.3のShould要件)
- 書類管理(4.4のShould要件)
- 設定(4.7の一部を除きShould相当)

---

## 15. 開発ワークフロー(GitHub運用ルール)

個人開発だが、チーム開発の経験・作法を学ぶことも目的の一つのため、実務のチーム開発を模したGitHub運用ルールを定める。1人開発でもこのルールに沿って進めることで、ブランチ運用・PRベースの開発・CIの経験を積み、面接でも「チーム開発を意識した開発フローを実践した」と語れるようにする。

### 15.1 ブランチ戦略
**GitHub Flow**を採用する(Git Flowほど複雑にせず、シンプルに運用する)。

- `main`: 常にデプロイ可能な状態を保つ保護ブランチ。直接pushはせず、必ずPR経由でマージする
- 作業ブランチは用途ごとにプレフィックスを付ける
  - `feature/xxx`: 新機能の追加(例: `feature/company-crud`)
  - `fix/xxx`: 不具合修正
  - `chore/xxx`: 設定変更、ドキュメント更新など機能に直接関係しない変更
- 1ブランチ1目的を意識し、レビューしやすい粒度でPRを作る

### 15.2 コミットメッセージ規約
**Conventional Commits**に準拠する。

```
<type>(<scope>): <概要>

例:
feat(backend): 応募先企業のCRUD APIを実装
fix(frontend): カンバン表示件数のバグを修正
chore: ESLint設定を追加
docs: READMEにセットアップ手順を追記
```

主な`type`: `feat`(機能追加) / `fix`(バグ修正) / `chore`(雑務) / `docs`(ドキュメント) / `refactor`(リファクタリング) / `test`(テスト)

### 15.3 プルリクエスト運用
- 個人開発のため最終承認は自分自身で行うが、**必ずPRを経由してmainにマージする**(直接pushしない)ことを徹底する
- PRテンプレートに沿って「変更内容」「関連するIssue」「動作確認方法」を記載する
- セルフレビューの習慣として、PR作成後に差分(diff)を見直してからマージする

### 15.4 Issue運用
- 実装するタスクは事前にIssueとして起票し、機能単位(4章の機能要件単位)で管理する
- バグ報告用・機能追加用のテンプレートを用意し、記載内容を統一する

### 15.5 CI(GitHub Actions)
- PR作成時に以下を自動実行する
  - TypeScriptの型チェック(`tsc --noEmit`)
  - Lint(ESLint)
  - (実装が進み次第)テストの自動実行
- CIが通らないPRはマージしない運用とする(将来的にはbranch protectionルールで強制する)

### 15.6 リポジトリ構成への反映
`.github/`ディレクトリにPRテンプレート・Issueテンプレート・CI設定を配置する(実装時に具体的なファイルを作成)。

---

## 16. 面接で語れるポイント(参考)

要件定義〜設計〜実装までを一貫して説明できるよう、以下の観点を意識すると良い。

- **なぜこの機能が必要か**を「就活生の課題」から説明できるか(背景→要件のつながり)
- **スコープを絞った理由**(MVPで何を削ったか、なぜか)
- **データモデルの設計判断**(例: ステータスを履歴として持たせた理由)
- **非機能要件への配慮**(セキュリティ、パフォーマンス)
- **開発フローそのものの設計判断**(個人開発でもPRベース・CI・Issue管理を採用した理由。チーム開発を見据えた practice であることを説明できるか)
