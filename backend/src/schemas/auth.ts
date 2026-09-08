import { z } from "zod";

// 登録時のバリデーションスキーマ
export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, "パスワードは8文字以上で入力してください"),
    name: z.string().min(1, "名前を入力してください"),
});

// ログイン時のバリデーションスキーマ
export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, "パスワードを入力してください"),
});

// Zodの型をTypeScriptの型に変換
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;