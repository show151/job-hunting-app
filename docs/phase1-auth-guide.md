# Phase 1 実装手順書: 認証機能

`implementation-plan.md`のPhase 1を、実際に書くコードレベルまで具体化した手順書です。`requirements.md` 10.2(認証設計の方針)・12.2(認証API)・12.10(zod導入)に対応します。

前提: Phase 0が完了し、`backend`が起動する状態であること。

---

## Step 1. ブランチを作成する

```bash
git checkout main
git pull
git checkout -b feature/auth-api
```

GitHub上でIssue「ユーザー登録・ログインAPIの実装」を作成し、このブランチと紐付けておく(15.3参照)。

---

## Step 2. 必要なパッケージをインストールする

```bash
cd backend
npm install bcrypt jsonwebtoken zod @prisma/client
npm install -D @types/bcrypt @types/jsonwebtoken
```

---

## Step 3. Prisma Clientをシングルトンで用意する

`backend/src/lib/prisma.ts`

```ts
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
```

> 毎回`new PrismaClient()`すると接続過多になるため、1箇所でインスタンス化して使い回す。

---

## Step 4. バリデーションスキーマ(zod)を定義する

`backend/src/schemas/auth.ts`

```ts
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
  name: z.string().min(1, "名前を入力してください"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
```

---

## Step 5. パスワード・JWTのユーティリティ関数を実装する

`backend/src/lib/auth.ts`

```ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;
const SALT_ROUNDS = 10;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string } {
  return jwt.verify(token, JWT_SECRET) as { userId: string };
}
```

---

## Step 6. 認証ミドルウェアを実装する

`backend/src/middlewares/requireAuth.ts`

```ts
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/auth";

export interface AuthedRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ data: null, error: "認証が必要です" });
  }

  const token = header.replace("Bearer ", "");
  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ data: null, error: "トークンが不正です" });
  }
}
```

---

## Step 7. コントローラーを実装する

`backend/src/controllers/authController.ts`

```ts
import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { registerSchema, loginSchema } from "../schemas/auth";
import { hashPassword, comparePassword, generateToken } from "../lib/auth";
import { AuthedRequest } from "../middlewares/requireAuth";

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ data: null, error: parsed.error.issues[0].message });
  }
  const { email, password, name } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(400).json({ data: null, error: "このメールアドレスは既に登録されています" });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, name },
  });

  const token = generateToken(user.id);
  res.status(201).json({ data: { token, user: { id: user.id, email: user.email, name: user.name } }, error: null });
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ data: null, error: parsed.error.issues[0].message });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ data: null, error: "メールアドレスかパスワードが正しくありません" });
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ data: null, error: "メールアドレスかパスワードが正しくありません" });
  }

  const token = generateToken(user.id);
  res.json({ data: { token, user: { id: user.id, email: user.email, name: user.name } }, error: null });
}

export async function me(req: AuthedRequest, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) {
    return res.status(404).json({ data: null, error: "ユーザーが見つかりません" });
  }
  res.json({ data: { id: user.id, email: user.email, name: user.name }, error: null });
}
```

---

## Step 8. ルーティングを設定する

`backend/src/routes/auth.ts`

```ts
import { Router } from "express";
import { register, login, me } from "../controllers/authController";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, me);

export default router;
```

`backend/src/index.ts`に追記する。

```ts
import authRouter from "./routes/auth";
// ...
app.use("/api/auth", authRouter);
```

---

## Step 9. 動作確認する

サーバーを起動し、一連の流れをcurlで確認する。

```bash
npm run dev
```

```bash
# 1. 登録
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"就活太郎"}'
# トークンが返ってくることを確認

# 2. ログイン
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 3. me(上記で取得したtokenを使う)
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer <取得したtoken>"
```

- registerを2回同じメールアドレスで叩くとエラーになることも確認する
- 誤ったパスワードでloginするとエラーになることも確認する
- Authorizationヘッダなしで`/me`を叩くと401になることも確認する

---

## Step 10. コミット・PR・マージする

```bash
git add .
git commit -m "feat: ユーザー登録・ログイン・me取得APIを実装"
git push -u origin feature/auth-api
```

GitHub上でPRを作成し(テンプレートに沿って変更内容・関連Issue・動作確認方法を記載)、CIが通ることを確認、セルフレビュー後に`main`へマージする。

---

## 完了チェックリスト

- [ ] `POST /api/auth/register` で新規登録でき、トークンが返る
- [ ] 同じメールアドレスで再登録するとエラーになる
- [ ] `POST /api/auth/login` で正しい認証情報ならトークンが返る
- [ ] 誤ったパスワードでは401エラーになる
- [ ] `GET /api/auth/me` はトークンありで自分の情報を返し、トークンなしでは401になる
- [ ] PRを作成し、CIが通り、`main`にマージできた

すべて完了したら`implementation-plan.md`のPhase 1を「完了」に更新し、Phase 2(Company CRUD)に進んでください。
