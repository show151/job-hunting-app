import { z } from "zod";

// タスクのステータスを定義するEnum
export const taskStatusEnum = z.enum([
    "DEADLINE",
    "INTERVIEW",
    "EXPLANATION_SESSION",
    "OTHER",
]);

// タスクを作成するためのスキーマ
export const createTaskSchema = z.object({
    title: z.string().min(1, "タイトルを入力してください"),
    type: taskStatusEnum,
    dueAt: z.coerce.date(),
    phaseId: z.string().uuid().optional(),
});

// タスクを更新するためのスキーマ
export const updateTaskSchema = z.object({
    title: z.string().min(1).optional(),
    type: taskStatusEnum.optional(),
    dueAt: z.coerce.date().optional(),
    isDone: z.boolean().optional(),
    phaseId: z.string().uuid().nullable().optional(),
});

// Zodの型をTypeScriptの型に変換
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;