# Phase 5 実装手順書: ダッシュボード集約API

`implementation-plan.md`のPhase 5を、実際に書くコードレベルまで具体化した手順書です。`requirements.md` 4.6(ダッシュボード)、12.8(API設計)、14.2(UIデザイン、参考)に対応します。

前提: Phase 2(Company CRUD)、Part A: SelectionPhase API(Phase 3)が完了していること。Task APIが未実装でも直近タスクは空配列を返すだけなので進められるが、Part B: Task APIまで完了していれば動作確認がしやすい。

---

## Step 1. ブランチを作成する

```bash
git checkout main
git pull
git checkout -b feature/dashboard-api
```

Issue #8「ダッシュボード集約APIの実装」を紐付ける。

---

## Step 2. 集計仕様を決める

14.2のダッシュボードデザインに対応させ、以下の値を返す。

| 項目 | 定義 |
|---|---|
| `summary.total` | 自分の応募先企業の総数(論理削除を除く) |
| `summary.inProgress` | `currentPhase.phase`が`OFFER`/`REJECTED`/`WITHDRAWN`以外の企業数(選考が進行中のもの) |
| `summary.offer` | `currentPhase.phase`が`OFFER`の企業数 |
| `summary.rejected` | `currentPhase.phase`が`REJECTED`の企業数 |
| `phaseDistribution` | `currentPhase.phase`ごとの企業数(例: `{ FIRST_INTERVIEW: 4, DOCUMENT: 6 }`) |
| `upcomingTasks` | 未完了かつ期限が今日以降のタスクを、期限が近い順に最大5件 |

`currentPhase`は12.10の方針どおり、都度アプリ側で算出する(非正規化しない)。

---

## Step 3. コントローラーを実装する

`backend/src/controllers/dashboardController.ts`

```ts
import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthedRequest } from "../middlewares/requireAuth";

const CLOSED_PHASES = ["OFFER", "REJECTED", "WITHDRAWN"];

export async function getDashboard(req: AuthedRequest, res: Response) {
  const companies = await prisma.company.findMany({
    where: { userId: req.userId, deletedAt: null },
    include: { phases: { orderBy: { changedAt: "desc" }, take: 1 } },
  });

  const withCurrentPhase = companies.map((c) => ({
    ...c,
    currentPhase: c.phases[0] ?? null,
  }));

  const total = withCurrentPhase.length;
  const offer = withCurrentPhase.filter((c) => c.currentPhase?.phase === "OFFER").length;
  const rejected = withCurrentPhase.filter((c) => c.currentPhase?.phase === "REJECTED").length;
  const inProgress = withCurrentPhase.filter(
    (c) => c.currentPhase && !CLOSED_PHASES.includes(c.currentPhase.phase)
  ).length;

  const phaseDistribution: Record<string, number> = {};
  for (const c of withCurrentPhase) {
    const phase = c.currentPhase?.phase;
    if (!phase) continue;
    phaseDistribution[phase] = (phaseDistribution[phase] ?? 0) + 1;
  }

  const upcomingTasks = await prisma.task.findMany({
    where: {
      company: { userId: req.userId, deletedAt: null },
      isDone: false,
      dueAt: { gte: new Date() },
    },
    include: { company: { select: { id: true, name: true } } },
    orderBy: { dueAt: "asc" },
    take: 5,
  });

  res.json({
    data: {
      summary: { total, inProgress, offer, rejected },
      phaseDistribution,
      upcomingTasks,
    },
    error: null,
  });
}
```

> 一覧の企業数は個人利用の規模(数十社程度)を前提としているため、Company一覧を1クエリで取得しアプリ側(JS)で集計している(12.10のYAGNIの考え方と同じ設計判断)。

---

## Step 4. ルーティングを設定する

`backend/src/routes/dashboard.ts`(新規)

```ts
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { getDashboard } from "../controllers/dashboardController";

const router = Router();
router.use(requireAuth);

router.get("/", getDashboard);

export default router;
```

`backend/src/index.ts`に追記する。

```ts
import dashboardRouter from "./routes/dashboard";
// ...
app.use("/api/dashboard", dashboardRouter);
```

---

## Step 5. 動作確認する

```bash
npm run dev
```

```bash
TOKEN="<取得済みのtoken>"

curl http://localhost:4000/api/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

以下のような形式のレスポンスが返ることを確認する。

```jsonc
{
  "data": {
    "summary": { "total": 3, "inProgress": 2, "offer": 1, "rejected": 0 },
    "phaseDistribution": { "FIRST_INTERVIEW": 1, "ENTRY": 1, "OFFER": 1 },
    "upcomingTasks": [
      { "id": "...", "title": "一次面接", "dueAt": "...", "company": { "id": "...", "name": "株式会社テック" } }
    ]
  },
  "error": null
}
```

- Phase 3・Task APIで登録した複数の企業・フェーズ・タスクを使い、件数が正しく集計されているか確認する
- 企業やタスクが0件の状態でも、エラーにならず空の集計結果(`total: 0`等)が返ることを確認する
- Authorizationヘッダなしで叩くと401になることも確認する

---

## Step 6. コミット・PR・マージする

```bash
git add .
git commit -m "feat: ダッシュボード集約APIを実装"
git push -u origin feature/dashboard-api
```

PRを作成し(`Closes #8`を記載)、CIが通ることを確認、セルフレビュー後に`main`へマージする。

---

## 完了チェックリスト

- [ ] `GET /api/dashboard` が`summary`・`phaseDistribution`・`upcomingTasks`を返す
- [ ] `summary`の各件数が実データと一致する
- [ ] 企業・タスクが0件でもエラーにならない
- [ ] 認証必須になっている
- [ ] PRを作成し、CIが通り、`main`にマージできた

すべて完了したらIssue #8をクローズし、`implementation-plan.md`のPhase 5を「完了」に更新してください。Phase 4(Should)は、Phase 6(フロントエンド)着手後、余裕を見て対応します。
