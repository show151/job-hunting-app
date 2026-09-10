# CI更新手順書: Lint・Buildの追加

Phase 0で作成した`ci.yml`は型チェックのみだったため、`requirements.md` 15.5で本来定義していた「型チェック・Lint・ビルド」の構成に揃える。

---

## Step 1. ブランチを作成する

```bash
git checkout main
git pull
git checkout -b chore/ci-lint-build
```

Issueを1つ作成しておく(タイトル例: 「CIにLint・Buildを追加」、ラベル: `chore`, `priority: must`, `phase: 0-setup`)。

---

## Step 2. バックエンドにESLintを導入する

```bash
cd backend
npm install -D eslint typescript-eslint @eslint/js
```

`backend/eslint.config.js`

```js
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended
);
```

`backend/package.json`の`scripts`に追記する。

```json
{
  "scripts": {
    "lint": "eslint ."
  }
}
```

動作確認する。

```bash
npm run lint
```

---

## Step 3. バックエンドのビルド設定を確認する

`backend/tsconfig.json`で以下が設定されているか確認する(`npx tsc --init`直後はコメントアウトされているため、有効化する)。

```jsonc
{
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
    // ...
  }
}
```

ビルドが通ることを確認する。

```bash
npm run build
```

---

## Step 4. フロントエンドのLint・Buildを確認する

Vite(react-ts テンプレート)は標準でESLintが同梱されているため、既に`lint`スクリプトがあるか確認する。

```bash
cd ../frontend
cat package.json | grep lint
```

`"lint": "eslint ."`のような記述がなければ追加する。動作確認する。

```bash
npm run lint
npm run build
```

---

## Step 5. `ci.yml`を更新する

`.github/workflows/ci.yml`を以下に置き換える。

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
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm run build

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
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm run build
```

> テスト自動実行(Vitest)は、`requirements.md` 15.5の記載どおりPhase 6(フロントエンド実装)着手以降に追加する。現時点ではlint・型チェック・buildの3点をCIの必須項目とする。

---

## Step 6. コミット・PR・マージする

```bash
cd ..
git add .
git commit -m "chore: CIにLintとBuildのステップを追加"
git push -u origin chore/ci-lint-build
```

PRを作成し、CI(このPR自体でlint/build含む新しいci.ymlが走る)が通ることを確認、セルフレビュー後に`main`にマージする。

---

## 完了チェックリスト

- [ ] `backend`で`npm run lint`が動作する
- [ ] `backend`で`npm run build`が成功する(`dist/`が生成される)
- [ ] `frontend`で`npm run lint`が動作する
- [ ] `frontend`で`npm run build`が成功する
- [ ] `ci.yml`がlint・型チェック・buildの3ステップを実行する
- [ ] このPR自体がCIを通過し、`main`にマージできた

完了したら、`implementation-plan.md`のPhase 0に「CIにLint/Buildを追加(追補)」の完了チェックを追記しておく。
