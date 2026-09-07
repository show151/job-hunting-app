# Phase 0 セットアップ手順書

`implementation-plan.md`のPhase 0を、実際に手を動かせるレベルまで具体化した手順書です。上から順番に進めてください。

前提: Node.js(LTS)、Docker Desktop、Gitがインストール済みであること。

---

## Step 1. GitHubリポジトリを作成する

1. GitHub上で新規リポジトリを作成する(例: `job-hunting-app`)。Public/Privateはどちらでも良いが、面接で見せる想定ならPublic推奨
2. ローカルにcloneする

```bash
git clone https://github.com/<your-account>/job-hunting-app.git
cd job-hunting-app
```

3. GitHubのリポジトリ設定 → **Settings > Branches** から、`main`ブランチに対して以下を設定する(Branch protection rule)
   - "Require a pull request before merging" を有効化(直接pushを禁止する)

> この時点ではCIをrequiredにする設定はまだ行わない(Step 9でci.ymlを作った後に追加設定する)

---

## Step 2. `.gitignore`を配置する

リポジトリ直下に`.gitignore`を作成する。

```
node_modules/
.env
dist/
```

```bash
git add .gitignore
git commit -m "chore: .gitignoreを追加"
git push
```

---

## Step 3. Docker ComposeでPostgreSQLを起動する

リポジトリ直下に`docker-compose.yml`を作成する。

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

起動して確認する。

```bash
docker compose up -d
docker compose ps   # dbコンテナがUp状態になっていればOK
```

---

## Step 4. バックエンド(Express + TypeScript)の雛形を作る

```bash
mkdir backend && cd backend
npm init -y
npm install express cors dotenv
npm install -D typescript tsx @types/node @types/express @types/cors
npx tsc --init
```

`backend/.env`を作成する。

```
DATABASE_URL="postgresql://app:app_password@localhost:5432/job_hunting_app"
JWT_SECRET="開発用の適当な文字列(本番では必ず変更)"
PORT=4000
```

`backend/src/index.ts`を作成する(動作確認用の最小構成)。

```ts
import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ data: { status: "ok" }, error: null });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`server listening on :${port}`));
```

`backend/package.json`の`scripts`に追記する。

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

動作確認する。

```bash
npm run dev
# 別ターミナルで
curl http://localhost:4000/api/health
# {"data":{"status":"ok"},"error":null} が返ればOK
```

---

## Step 5. Prismaを初期化し、スキーマを反映する

```bash
# backendディレクトリ内で
npm install -D prisma
npm install @prisma/client
npx prisma init
```

`backend/prisma/schema.prisma`の中身を、`requirements.md`の11.2に記載したスキーマ全体で置き換える。

マイグレーションを実行する。

```bash
npx prisma migrate dev --name init
```

正常に完了すると、PostgreSQL上にテーブルが作成される。以下で中身を確認できる。

```bash
npx prisma studio
```

---

## Step 6. フロントエンド(React + Vite + TypeScript)の雛形を作る

プロジェクトルート(backendの外)に戻って実行する。

```bash
cd ..   # job-hunting-app直下に戻る
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

`frontend/.env`を作成する。

```
VITE_API_BASE_URL="http://localhost:4000/api"
```

動作確認する。

```bash
npm run dev
# http://localhost:5173 をブラウザで開き、Vite初期画面が表示されればOK
```

---

## Step 7. `.github`配下にテンプレート・CI設定を追加する

リポジトリ直下に以下を作成する。

**`.github/PULL_REQUEST_TEMPLATE.md`**
```markdown
## 変更内容


## 関連Issue
Closes #

## 動作確認方法

```

**`.github/ISSUE_TEMPLATE/feature_request.md`**
```markdown
---
name: 機能追加
about: 新しい機能の実装タスク
---

## やりたいこと


## 完了条件

```

**`.github/workflows/ci.yml`**
```yaml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  backend-check:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npx tsc --noEmit

  frontend-check:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npx tsc --noEmit
```

> ESLint導入は後続フェーズで対応してよい。まずは型チェックのみのCIから始める。

---

## Step 8. README.mdの初版を作成する

リポジトリ直下の`README.md`に、最低限以下を書く。

```markdown
# 就活管理アプリ

応募先企業と選考状況を一元管理するWebアプリ。

## 技術スタック
- Frontend: React (Vite) + TypeScript
- Backend: Node.js + Express + TypeScript
- DB: PostgreSQL + Prisma

## セットアップ
1. `docker compose up -d`
2. `cd backend && npm install && npx prisma migrate dev`
3. `npm run dev` (backend)
4. `cd frontend && npm install && npm run dev`
```

---

## Step 9. ここまでの変更をコミット・PRする

初期セットアップ自体もGitHub Flowに沿って進める(15.1参照)。

```bash
git checkout -b chore/project-setup
git add .
git commit -m "chore: プロジェクト初期セットアップ"
git push -u origin chore/project-setup
```

GitHub上でPull Requestを作成し、CIが通ることを確認してからセルフレビュー→`main`にマージする。

---

## 完了チェックリスト

- [ ] `docker compose up -d` でDBが起動する
- [ ] `curl http://localhost:4000/api/health` が応答する
- [ ] `npx prisma studio` でテーブルが確認できる
- [ ] `http://localhost:5173` でVite初期画面が表示される
- [ ] PRを作成し、CIが通り、`main`にマージできた

すべて完了したら`implementation-plan.md`のPhase 0を「完了」に更新し、Phase 1(認証機能)に進んでください。
