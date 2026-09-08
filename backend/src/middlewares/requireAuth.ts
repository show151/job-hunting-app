import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/auth.js";

// 認証済みのリクエストにuserIdを追加するための型
export interface AuthedRequest extends Request {
    userId?: string;
}

/*
認証が必要なルートで使用するミドルウェア
*/
export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
    const header = req.headers.authorization;  // Authorizationヘッダーからトークンを取得
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ data: null, error: "認証が必要です" });
    }

    const token = header.replace("Bearer ", "");  // トークン部分を抽出
    try {
        const payload = verifyToken(token);  // トークンを検証してペイロードを取得
        req.userId = payload.userId;  // リクエストにuserIdを追加
        next();
    } catch {
        return res.status(401).json({ data: null, error: "トークンが不正です" });
    }
}