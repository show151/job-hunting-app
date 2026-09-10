# Phase 2 実装手順書: 応募先企業(Company)CRUD

`implementation-plan.md`のPhase 2を、実際に書くコードレベルまで具体化した手順書です。`requirements.md` 4.1(応募先管理)・12.3(Company API)に対応します。

前提: Phase 1(認証機能)が完了し、`requireAuth`ミドルウェアが使える状態であること。

---

## Step 1. ブランチを作成する

```bash
git checkout main
git pull
git checkout -b feature/company-crud
```

Issue「Company CRUD APIの実装」(#3)を紐付けておく。

---

## Step 2. バリデーションスキーマ(zod)を定義する

`backend/src/schemas/company.ts`

```ts
import { z } from "zod";

export const applicationRouteEnum = z.enum([
  "DIRECT",
  "AGENCY",
  "REFERRAL",
  "CAMPUS",
  "OTHER",
]);

export const createCompanySchema = z.object({
  name: z.string().min(1, "企業名を入力してください"),
  industry: z.string().optional(),
  route: applicationRouteEnum.default("OTHER"),
  url: z.string().url("URLの形式が正しくありません").optional().or(z.literal("")),
  memo: z.string().optional(),
});

export const updateCompanySchema = createCompanySchema.partial();

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
```

---

## Step 3. コントローラーを実装する

`backend/src/controllers/companyController.ts`

```ts
import { Response } from "express";
import { prisma } from "../lib/prisma";
import { createCompanySchema, updateCompanySchema } from "../schemas/company";
import { AuthedRequest } from "../middlewares/requireAuth";

// GET /api/companies?keyword=&industry=&phase=
export async function listCompanies(req: AuthedRequest, res: Response) {
  const { keyword, industry, phase } = req.query as Record<string, string | undefined>;

  const companies = await prisma.company.findMany({
    where: {
      userId: req.userId,
      deletedAt: null,
      ...(keyword ? { name: { contains: keyword, mode: "insensitive" } } : {}),
      ...(industry ? { industry } : {}),
    },
    include: {
      phases: { orderBy: { changedAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  // currentPhaseをアプリ側で算出する(12.10の方針)
  let result = companies.map((c) => ({
    ...c,
    currentPhase: c.phases[0] ?? null,
  }));

  if (phase) {
    result = result.filter((c) => c.currentPhase?.phase === phase);
  }

  res.json({ data: result, error: null });
}

// POST /api/companies
export async function createCompany(req: AuthedRequest, res: Response) {
  const parsed = createCompanySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ data: null, error: parsed.error.issues[0].message });
  }

  const company = await prisma.company.create({
    data: { ...parsed.data, userId: req.userId! },
  });

  res.status(201).json({ data: company, error: null });
}

// GET /api/companies/:id
export async function getCompany(req: AuthedRequest, res: Response) {
  const company = await prisma.company.findFirst({
    where: { id: req.params.id, userId: req.userId, deletedAt: null },
    include: {
      phases: { orderBy: { changedAt: "desc" } },
      tasks: { orderBy: { dueAt: "asc" } },
      documents: true,
      interviewNotes: { orderBy: { interviewedAt: "desc" } },
    },
  });

  if (!company) {
    return res.status(404).json({ data: null, error: "応募先が見つかりません" });
  }

  const currentPhase = company.phases[0] ?? null;
  res.json({ data: { ...company, currentPhase }, error: null });
}

// PUT /api/companies/:id
export async function updateCompany(req: AuthedRequest, res: Response) {
  const parsed = updateCompanySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ data: null, error: parsed.error.issues[0].message });
  }

  const existing = await prisma.company.findFirst({
    where: { id: req.params.id, userId: req.userId, deletedAt: null },
  });
  if (!existing) {
    return res.status(404).json({ data: null, error: "応募先が見つかりません" });
  }

  const company = await prisma.company.update({
    where: { id: req.params.id },
    data: parsed.data,
  });

  res.json({ data: company, error: null });
}

// DELETE /api/companies/:id (論理削除)
export async function deleteCompany(req: AuthedRequest, res: Response) {
  const existing = await prisma.company.findFirst({
    where: { id: req.params.id, userId: req.userId, deletedAt: null },
  });
  if (!existing) {
    return res.status(404).json({ data: null, error: "応募先が見つかりません" });
  }

  await prisma.company.update({
    where: { id: req.params.id },
    data: { deletedAt: new Date() },
  });

  res.status(204).send();
}
```

> `deletedAt: null`を毎回のwhere条件に含めることで、論理削除済みのデータが誤って取得・更新されないようにしている。

---

## Step 4. ルーティングを設定する

`backend/src/routes/companies.ts`

```ts
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import {
  listCompanies,
  createCompany,
  getCompany,
  updateCompany,
  deleteCompany,
} from "../controllers/companyController";

const router = Router();

router.use(requireAuth); // このルーター配下は全て認証必須

router.get("/", listCompanies);
router.post("/", createCompany);
router.get("/:id", getCompany);
router.put("/:id", updateCompany);
router.delete("/:id", deleteCompany);

export default router;
```

`backend/src/index.ts`に追記する。

```ts
import companiesRouter from "./routes/companies";
// ...
app.use("/api/companies", companiesRouter);
```

---

## Step 5. 動作確認する

サーバーを起動し、Phase 1で発行したトークンを使って確認する。

```bash
npm run dev
```

```bash
TOKEN="<Phase1で取得したtoken>"

# 1. 作成
curl -X POST http://localhost:4000/api/companies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"株式会社サンプル","industry":"IT","route":"DIRECT"}'

# 2. 一覧取得
curl http://localhost:4000/api/companies \
  -H "Authorization: Bearer $TOKEN"

# 3. キーワード検索
curl "http://localhost:4000/api/companies?keyword=サンプル" \
  -H "Authorization: Bearer $TOKEN"

# 4. 詳細取得(上記で返ってきたidを使う)
curl http://localhost:4000/api/companies/<company-id> \
  -H "Authorization: Bearer $TOKEN"

# 5. 更新
curl -X PUT http://localhost:4000/api/companies/<company-id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"memo":"一次面接の日程調整中"}'

# 6. 削除(論理削除)
curl -X DELETE http://localhost:4000/api/companies/<company-id> \
  -H "Authorization: Bearer $TOKEN"

# 7. 削除後、一覧に出てこないことを確認
curl http://localhost:4000/api/companies \
  -H "Authorization: Bearer $TOKEN"
```

- Authorizationヘッダなしで叩くと401になることも確認する
- 他ユーザーのトークンで別ユーザーの企業idを指定すると404になることも確認する(userIdでの絞り込みが効いているか)

---

## Step 6. コミット・PR・マージする

```bash
git add .
git commit -m "feat: Company CRUD APIを実装"
git push -u origin feature/company-crud
```

GitHub上でPRを作成し(テンプレートに沿って記載)、CIが通ることを確認、セルフレビュー後に`main`へマージする。

---

## 完了チェックリスト

- [ ] `GET /api/companies` が一覧を返し、`keyword`・`industry`での絞り込みが動作する
- [ ] `POST /api/companies` で新規作成できる
- [ ] `GET /api/companies/:id` が選考フェーズ・タスク・書類・面接メモを含めて返す
- [ ] `PUT /api/companies/:id` で更新できる
- [ ] `DELETE /api/companies/:id` で論理削除され、以降一覧に出てこない
- [ ] 認証必須になっており、他ユーザーのデータにアクセスできない
- [ ] PRを作成し、CIが通り、`main`にマージできた

すべて完了したらIssue #3をクローズし、`implementation-plan.md`のPhase 2を「完了」に更新、Phase 3(選考フェーズ・タスク)に進んでください。
