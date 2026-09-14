import type { Response } from "express";
import { prisma } from "../lib/prisma.js";
import { createTaskSchema, updateTaskSchema } from "../schemas/task.js";
import type { AuthedRequest } from "../middlewares/requireAuth.js";
import type { TaskType } from "@prisma/client";

// GET /api/tasks?upcoming=true&companyId=&type=
export async function listTasks(req: AuthedRequest, res: Response) {
    // クエリパラメータの取得
    const { upcoming, companyId, type } = req.query as Record<string, string | undefined>;

    const userId = req.userId;  // 認証済みユーザーのIDを取得

    if (!userId) {
        return res.status(401).json({
            data: null,
            error: "認証が必要です",
        });
    }

    // タスクの一覧を取得
    const tasks = await prisma.task.findMany({
        where: {
            company: { userId, deletedAt: null },
            ...(companyId ? { companyId } : {}),
            ...(type ? { type: type as TaskType } : {}),
            ...(upcoming === "true" ? { isDone: false, dueAt: { gte: new Date() } } : {}),
        },
        include: { company: { select: { id: true, name: true } } },
        orderBy: { dueAt: "asc" },
    });

    res.json({ data: tasks, error: null });
}

// POST /api/companies/:companyId/tasks
export async function createTask(req: AuthedRequest, res: Response) {
    const id = req.params.companyId;  // クエリパラメータの取得

    if (!id || Array.isArray(id)) {
        return res.status(400).json({
            data: null,
            error: "不正なIDです",
        });
    }

    const userId = req.userId;  // 認証済みユーザーのIDを取得

    if (!userId) {
        return res.status(401).json({
            data: null,
            error: "認証が必要です",
        });
    }

    // 応募先が存在するか確認
    const company = await prisma.company.findFirst({
        where: { id, userId, deletedAt: null },
    });
    if (!company) {
        return res.status(404).json({ data: null, error: "応募先が見つかりません" });
    }

    const parsed = createTaskSchema.safeParse(req.body);  // バリデーション
    if (!parsed.success) {
        return res.status(400).json({ data: null, error: parsed.error.issues[0]?.message });
    }

    // タスクを作成
    const task = await prisma.task.create({
        data: {
            companyId: company.id,
            title: parsed.data.title,
            type: parsed.data.type,
            dueAt: parsed.data.dueAt,
            ...(parsed.data.phaseId !== undefined ? { phaseId: parsed.data.phaseId } : {}),
        },
    });

    res.status(201).json({ data: task, error: null });
}

// PUT /api/tasks/:id
export async function updateTask(req: AuthedRequest, res: Response) {
    const id = req.params.id;  // URLパラメータからIDを取得

    if (!id || Array.isArray(id)) {
        return res.status(400).json({
            data: null,
            error: "不正なIDです",
        });
    }

    const userId = req.userId;  // 認証済みユーザーのIDを取得

    if (!userId) {
        return res.status(401).json({
            data: null,
            error: "認証が必要です",
        });
    }

    const parsed = updateTaskSchema.safeParse(req.body);  // バリデーション
    if (!parsed.success) {
        return res.status(400).json({ data: null, error: parsed.error.issues[0]?.message });
    }

    // タスクが存在するか確認
    const task = await prisma.task.findFirst({
        where: { id, company: { userId, deletedAt: null } },
    });
    if (!task) {
        return res.status(404).json({ data: null, error: "タスクが見つかりません" });
    }

    // 更新するデータを作成（undefinedの値は除外）
    const data = {
        ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
        ...(parsed.data.type !== undefined ? { type: parsed.data.type } : {}),
        ...(parsed.data.dueAt !== undefined ? { dueAt: parsed.data.dueAt } : {}),
        ...(parsed.data.isDone !== undefined ? { isDone: parsed.data.isDone } : {}),
        ...(parsed.data.phaseId !== undefined ? { phaseId: parsed.data.phaseId } : {}),
    };

    // タスクを更新
    const updated = await prisma.task.update({
        where: { id },
        data,
    });

    res.json({ data: updated, error: null });
}

// DELETE /api/tasks/:id
export async function deleteTask(req: AuthedRequest, res: Response) {
    const id = req.params.id;  // URLパラメータからIDを取得

    if (!id || Array.isArray(id)) {
        return res.status(400).json({
            data: null,
            error: "不正なIDです",
        });
    }

    const userId = req.userId;  // 認証済みユーザーのIDを取得

    if (!userId) {
        return res.status(401).json({
            data: null,
            error: "認証が必要です",
        });
    }

    // タスクが存在するか確認
    const task = await prisma.task.findFirst({
        where: { id, company: { userId, deletedAt: null } },
    });
    if (!task) {
        return res.status(404).json({ data: null, error: "タスクが見つかりません" });
    }

    await prisma.task.delete({ where: { id: task.id } });  // タスクを削除

    res.json({ data: null, error: null });
}