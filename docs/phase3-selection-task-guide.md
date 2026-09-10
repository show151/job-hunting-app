# Phase 3 実装手順書: 選考フェーズ・タスク(説明会・カジュアル面談を含む)

`implementation-plan.md`のPhase 3を、実際に書くコードレベルまで具体化した手順書です。`requirements.md` 4.2・4.3(機能要件)、12.4・12.5(API設計)、12.10(currentPhase算出方針)に対応します。

Issue #4(SelectionPhase)・#5(Task)に対応させ、**ブランチ・PRを分けて**進めます。

- Part A: `feature/selection-phase-api`(Issue #4)→ 先にマージ
- Part B: `feature/task-api`(Issue #5)→ Part Aマージ後に着手

前提: Phase 2(Company CRUD)、Phase 2.5(CI強化)が完了していること。

---

# Part A: SelectionPhase API(Issue #4)

## Step A1. ブランチを作成する

```bash
git checkout main
git pull
git checkout -b feature/selection-phase-api
```

Issue #4「SelectionPhase APIの実装」を紐付ける。

---

## Step A2. バリデーションスキーマ(zod)を定義する

`backend/src/schemas/phase.ts`

```ts
import { z } from "zod";

export const selectionPhaseTypeEnum = z.enum([
  "CASUAL_INTERVIEW",
  "ENTRY",
  "DOCUMENT",
  "FIRST_INTERVIEW",
  "SECOND_INTERVIEW",
  "FINAL_INTERVIEW",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
]);

export const phaseStatusEnum = z.enum([
  "NOT_STARTED",
  "IN_PROGRESS",
  "PASSED",
  "FAILED",
  "WITHDRAWN",
]);

export const createPhaseSchema = z.object({
  phase: selectionPhaseTypeEnum,
  status: phaseStatusEnum.default("NOT_STARTED"),
  memo: z.string().optional(),
});

export const updatePhaseSchema = z.object({
  status: phaseStatusEnum.optional(),
  memo: z.string().optional(),
});

export type CreatePhaseInput = z.infer<typeof createPhaseSchema>;
export type UpdatePhaseInput = z.infer<typeof updatePhaseSchema>;
```

---

## Step A3. コントローラーを実装する

`backend/src/controllers/phaseController.ts`

```ts
import { Response } from "express";
import { prisma } from "../lib/prisma";
import { createPhaseSchema, updatePhaseSchema } from "../schemas/phase";
import { AuthedRequest } from "../middlewares/requireAuth";

// GET /api/companies/:companyId/phases
export async function listPhases(req: AuthedRequest, res: Response) {
  const company = await prisma.company.findFirst({
    where: { id: req.params.companyId, userId: req.userId, deletedAt: null },
  });
  if (!company) {
    return res.status(404).json({ data: null, error: "応募先が見つかりません" });
  }

  const phases = await prisma.selectionPhase.findMany({
    where: { companyId: company.id },
    orderBy: { changedAt: "desc" },
  });

  res.json({ data: phases, error: null });
}

// POST /api/companies/:companyId/phases (=フェーズ進行の登録)
export async function createPhase(req: AuthedRequest, res: Response) {
  const company = await prisma.company.findFirst({
    where: { id: req.params.companyId, userId: req.userId, deletedAt: null },
  });
  if (!company) {
    return res.status(404).json({ data: null, error: "応募先が見つかりません" });
  }

  const parsed = createPhaseSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ data: null, error: parsed.error.issues[0].message });
  }

  const phase = await prisma.selectionPhase.create({
    data: { ...parsed.data, companyId: company.id },
  });

  res.status(201).json({ data: phase, error: null });
}

// PUT /api/phases/:id
export async function updatePhase(req: AuthedRequest, res: Response) {
  const parsed = updatePhaseSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ data: null, error: parsed.error.issues[0].message });
  }

  const phase = await prisma.selectionPhase.findFirst({
    where: { id: req.params.id, company: { userId: req.userId, deletedAt: null } },
  });
  if (!phase) {
    return res.status(404).json({ data: null, error: "選考フェーズが見つかりません" });
  }

  const updated = await prisma.selectionPhase.update({
    where: { id: phase.id },
    data: parsed.data,
  });

  res.json({ data: updated, error: null });
}

// DELETE /api/phases/:id
export async function deletePhase(req: AuthedRequest, res: Response) {
  const phase = await prisma.selectionPhase.findFirst({
    where: { id: req.params.id, company: { userId: req.userId, deletedAt: null } },
  });
  if (!phase) {
    return res.status(404).json({ data: null, error: "選考フェーズが見つかりません" });
  }

  await prisma.selectionPhase.delete({ where: { id: phase.id } });
  res.status(204).send();
}
```

> `company: { userId: req.userId }` のようにリレーション越しにwhere条件を書くことで、「自分の企業に紐づくフェーズか」をJOIN相当のクエリ1回で判定できる。

---

## Step A4. ルーティングを設定する

`backend/src/routes/companies.ts`に、ネストしたフェーズ関連ルートを追記する。

```ts
import { listPhases, createPhase } from "../controllers/phaseController";

// 既存のCRUDルートに加えて追記
router.get("/:companyId/phases", listPhases);
router.post("/:companyId/phases", createPhase);
```

`backend/src/routes/phases.ts`(新規)

```ts
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { updatePhase, deletePhase } from "../controllers/phaseController";

const router = Router();
router.use(requireAuth);

router.put("/:id", updatePhase);
router.delete("/:id", deletePhase);

export default router;
```

`backend/src/index.ts`に追記する。

```ts
import phasesRouter from "./routes/phases";
// ...
app.use("/api/phases", phasesRouter);
```

---

## Step A5. 動作確認する

```bash
npm run dev
```

```bash
TOKEN="<取得済みのtoken>"
COMPANY_ID="<Phase2で作成したcompanyのid>"

# 1. エントリーを選考フェーズとして登録
curl -X POST http://localhost:4000/api/companies/$COMPANY_ID/phases \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"phase":"ENTRY","status":"PASSED"}'

# 2. 一次面接フェーズを追加(進行中)
curl -X POST http://localhost:4000/api/companies/$COMPANY_ID/phases \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"phase":"FIRST_INTERVIEW","status":"IN_PROGRESS"}'

# 3. フェーズ履歴を取得(時系列で2件返ることを確認)
curl http://localhost:4000/api/companies/$COMPANY_ID/phases \
  -H "Authorization: Bearer $TOKEN"

# 4. フェーズのステータス更新(合格へ)
curl -X PUT http://localhost:4000/api/phases/<phase-id> \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"PASSED"}'

# 5. カジュアル面談も登録できることを確認
curl -X POST http://localhost:4000/api/companies/$COMPANY_ID/phases \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"phase":"CASUAL_INTERVIEW","status":"NOT_STARTED"}'

# 6. フェーズ削除
curl -X DELETE http://localhost:4000/api/phases/<phase-id> \
  -H "Authorization: Bearer $TOKEN"
```

- 他ユーザーの企業id/フェーズidを指定すると404になることを確認する

---

## Step A6. コミット・PR・マージする

```bash
git add .
git commit -m "feat: SelectionPhase APIを実装"
git push -u origin feature/selection-phase-api
```

PRを作成し(`Closes #4`を記載)、CIが通ることを確認、セルフレビュー後に`main`へマージする。

### 完了チェックリスト(Part A)
- [ ] `GET/POST /api/companies/:companyId/phases` が動作する(カジュアル面談も登録できる)
- [ ] `PUT/DELETE /api/phases/:id` が動作する
- [ ] 他ユーザーのリソースにアクセスすると404になる
- [ ] PRを作成し、CIが通り、`main`にマージできた

マージできたらIssue #4をクローズし、Part Bに進む。

---

# Part B: Task API(Issue #5)

## Step B1. ブランチを作成する

Part Aがマージされた最新の`main`から作業する。

```bash
git checkout main
git pull
git checkout -b feature/task-api
```

Issue #5「Task APIの実装」を紐付ける。

---

## Step B2. バリデーションスキーマ(zod)を定義する

`backend/src/schemas/task.ts`

```ts
import { z } from "zod";

export const taskTypeEnum = z.enum([
  "DEADLINE",
  "INTERVIEW",
  "EXPLANATION_SESSION",
  "OTHER",
]);

export const createTaskSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください"),
  type: taskTypeEnum,
  dueAt: z.coerce.date(),
  phaseId: z.string().uuid().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  type: taskTypeEnum.optional(),
  dueAt: z.coerce.date().optional(),
  isDone: z.boolean().optional(),
  phaseId: z.string().uuid().nullable().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
```

---

## Step B3. コントローラーを実装する

`backend/src/controllers/taskController.ts`

```ts
import { Response } from "express";
import { prisma } from "../lib/prisma";
import { createTaskSchema, updateTaskSchema } from "../schemas/task";
import { AuthedRequest } from "../middlewares/requireAuth";

// GET /api/tasks?upcoming=true&companyId=&type=
export async function listTasks(req: AuthedRequest, res: Response) {
  const { upcoming, companyId, type } = req.query as Record<string, string | undefined>;

  const tasks = await prisma.task.findMany({
    where: {
      company: { userId: req.userId, deletedAt: null },
      ...(companyId ? { companyId } : {}),
      ...(type ? { type: type as any } : {}),
      ...(upcoming === "true" ? { isDone: false, dueAt: { gte: new Date() } } : {}),
    },
    include: { company: { select: { id: true, name: true } } },
    orderBy: { dueAt: "asc" },
  });

  res.json({ data: tasks, error: null });
}

// POST /api/companies/:companyId/tasks
export async function createTask(req: AuthedRequest, res: Response) {
  const company = await prisma.company.findFirst({
    where: { id: req.params.companyId, userId: req.userId, deletedAt: null },
  });
  if (!company) {
    return res.status(404).json({ data: null, error: "応募先が見つかりません" });
  }

  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ data: null, error: parsed.error.issues[0].message });
  }

  const task = await prisma.task.create({
    data: { ...parsed.data, companyId: company.id },
  });

  res.status(201).json({ data: task, error: null });
}

// PUT /api/tasks/:id
export async function updateTask(req: AuthedRequest, res: Response) {
  const parsed = updateTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ data: null, error: parsed.error.issues[0].message });
  }

  const task = await prisma.task.findFirst({
    where: { id: req.params.id, company: { userId: req.userId, deletedAt: null } },
  });
  if (!task) {
    return res.status(404).json({ data: null, error: "タスクが見つかりません" });
  }

  const updated = await prisma.task.update({
    where: { id: task.id },
    data: parsed.data,
  });

  res.json({ data: updated, error: null });
}

// DELETE /api/tasks/:id
export async function deleteTask(req: AuthedRequest, res: Response) {
  const task = await prisma.task.findFirst({
    where: { id: req.params.id, company: { userId: req.userId, deletedAt: null } },
  });
  if (!task) {
    return res.status(404).json({ data: null, error: "タスクが見つかりません" });
  }

  await prisma.task.delete({ where: { id: task.id } });
  res.status(204).send();
}
```

---

## Step B4. ルーティングを設定する

`backend/src/routes/companies.ts`に、ネストしたタスク作成ルートを追記する。

```ts
import { createTask } from "../controllers/taskController";

// 既存のルートに加えて追記
router.post("/:companyId/tasks", createTask);
```

`backend/src/routes/tasks.ts`(新規)

```ts
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { listTasks, updateTask, deleteTask } from "../controllers/taskController";

const router = Router();
router.use(requireAuth);

router.get("/", listTasks);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
```

`backend/src/index.ts`に追記する。

```ts
import tasksRouter from "./routes/tasks";
// ...
app.use("/api/tasks", tasksRouter);
```

---

## Step B5. 動作確認する

```bash
npm run dev
```

```bash
TOKEN="<取得済みのtoken>"
COMPANY_ID="<Phase2で作成したcompanyのid>"

# 1. タスク(面接日程)を登録
curl -X POST http://localhost:4000/api/companies/$COMPANY_ID/tasks \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"一次面接","type":"INTERVIEW","dueAt":"2026-09-15T14:00:00.000Z"}'

# 2. 説明会タスクも登録できることを確認
curl -X POST http://localhost:4000/api/companies/$COMPANY_ID/tasks \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"会社説明会","type":"EXPLANATION_SESSION","dueAt":"2026-09-20T13:00:00.000Z"}'

# 3. タスク一覧(直近のみ)
curl "http://localhost:4000/api/tasks?upcoming=true" \
  -H "Authorization: Bearer $TOKEN"

# 4. companyId・typeでの絞り込み
curl "http://localhost:4000/api/tasks?companyId=$COMPANY_ID&type=INTERVIEW" \
  -H "Authorization: Bearer $TOKEN"

# 5. タスク完了に更新
curl -X PUT http://localhost:4000/api/tasks/<task-id> \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"isDone":true}'

# 6. タスク削除
curl -X DELETE http://localhost:4000/api/tasks/<task-id> \
  -H "Authorization: Bearer $TOKEN"
```

- 他ユーザーの企業id/タスクidを指定すると404になることを確認する

---

## Step B6. コミット・PR・マージする

```bash
git add .
git commit -m "feat: Task APIを実装"
git push -u origin feature/task-api
```

PRを作成し(`Closes #5`を記載)、CIが通ることを確認、セルフレビュー後に`main`へマージする。

### 完了チェックリスト(Part B)
- [ ] `GET /api/tasks` が`upcoming`・`companyId`・`type`の絞り込みに対応している(説明会も含む)
- [ ] `POST /api/companies/:companyId/tasks` が動作する
- [ ] `PUT/DELETE /api/tasks/:id` が動作する
- [ ] 他ユーザーのリソースにアクセスすると404になる
- [ ] PRを作成し、CIが通り、`main`にマージできた

マージできたらIssue #5をクローズし、`implementation-plan.md`のPhase 3を「完了」に更新、Phase 4(書類・面接メモ)に進んでください。
