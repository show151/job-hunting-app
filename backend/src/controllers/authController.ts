import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { registerSchema, loginSchema } from "../schemas/auth.js";
import { hashPassword, comparePassword, generateToken } from "../lib/auth.js";
import type { AuthedRequest } from "../middlewares/requireAuth.js";

/*
ユーザー登録API
*/
export async function register(req: Request, res: Response) {
    const parsed = registerSchema.safeParse(req.body);  // バリデーションを実行
    if (!parsed.success) {
        return res.status(400).json({ data: null, error: parsed.error.issues[0]?.message });
    }
    const { email, password, name } = parsed.data;  // バリデーション済みのデータを取得

    const existing = await prisma.user.findUnique({ where: { email } });  // 既に同じメールアドレスのユーザーが存在するか確認
    if (existing) {
        return res.status(400).json({ data: null, error: "このメールアドレスは既に登録されています" });
    }

    const passwordHash = await hashPassword(password);  // パスワードをハッシュ化

    // ユーザーをデータベースに作成
    const user = await prisma.user.create({
        data: { email, passwordHash, name },
    });

    const token = generateToken(user.id);  // JWTトークンを生成
    return res.status(201).json({ data: { token, user: { id: user.id, email: user.email, name: user.name } }, error: null });
}

/*
ログインAPI
*/
export async function login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);  // バリデーションを実行
    if (!parsed.success) {
        return res.status(400).json({ data: null, error: parsed.error.issues[0]?.message });
    }
    const { email, password } = parsed.data;  // バリデーション済みのデータを取得

    const user = await prisma.user.findUnique({ where: { email } });  // メールアドレスに対応するユーザーをデータベースから取得
    if (!user) {
        return res.status(400).json({ data: null, error: "メールアドレスかパスワードが正しくありません" });
    }

    const valid = await comparePassword(password, user.passwordHash);  // パスワードのハッシュを比較して正しいか確認
    if (!valid) {
        return res.status(400).json({ data: null, error: "メールアドレスかパスワードが正しくありません" });
    }

    const token = generateToken(user.id);  // JWTトークンを生成
    return res.json({ data: { token, user: { id: user.id, email: user.email, name: user.name } }, error: null });
}

/*
認証済みユーザー情報取得API
*/
export async function me(req: AuthedRequest, res: Response) {
    // 認証済みのリクエストでuserIdが存在するか確認
    if (!req.userId) {
        return res.status(401).json({ data: null, error: "認証が必要です" });
    }
    const user = await prisma.user.findUnique({ where: { id: req.userId } });  // 認証済みユーザーの情報をデータベースから取得
    if (!user) {
        return res.status(404).json({ data: null, error: "ユーザーが見つかりません" });
    }
    res.json({ data: { id: user.id, email: user.email, name: user.name }, error: null });
}