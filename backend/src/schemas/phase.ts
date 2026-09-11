import { z } from "zod";

// 選考フェーズの種類を定義するEnum
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

// 選考フェーズのステータスを定義するEnum
export const phaseStatusEnum = z.enum([
    "NOT_STARTED",
    "IN_PROGRESS",
    "PASSED",
    "FAILED",
    "WITHDRAWN",
]);

// 選考フェーズ作成時のバリデーションスキーマ
export const createPhaseSchema = z.object({
    phase: selectionPhaseTypeEnum,
    status: phaseStatusEnum.default("NOT_STARTED"),
    memo: z.string().optional(),
});

// 選考フェーズ更新時のバリデーションスキーマ
export const updatePhaseSchema = z.object({
    status: phaseStatusEnum.optional(),
    memo: z.string().optional(),
});

// Zodの型をTypeScriptの型に変換
export type CreatePhaseInput = z.infer<typeof createPhaseSchema>;
export type UpdatePhaseInput = z.infer<typeof updatePhaseSchema>;