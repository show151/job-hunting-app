import { z } from "zod";

// 企業の申請経路の列挙型
export const applicationRouteEnum = z.enum([
    "DIRECT",
    "AGENCY",
    "REFERRAL",
    "CAMPUS",
    "OTHER",
]);

// 企業の作成・更新スキーマ
export const createCompanySchema = z.object({
    name: z.string().min(1, "企業名を入力してください"),
    industry: z.string().optional(),
    route: applicationRouteEnum.default("OTHER"),
    url: z.string().url("URLの形式が正しくありません").optional().or(z.literal("")),
    memo: z.string().optional(),
});

// 企業の更新スキーマ（作成スキーマの部分的なバージョン）
export const updateCompanySchema = createCompanySchema.partial();

// TypeScriptの型定義
export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;