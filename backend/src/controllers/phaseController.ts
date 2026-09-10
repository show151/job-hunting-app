import type { Response } from "express";
import { prisma } from "../lib/prisma.js";
import { createPhaseSchema, updatePhaseSchema } from "../schemas/phase.js";
import type { AuthedRequest } from "../middlewares/requireAuth.js";

// GET /api/companies/:companyId/phases
export async function listPhases(req: AuthedRequest, res: Response) {
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

    // 応募先の存在確認
    const company = await prisma.company.findFirst({
        where: { id, userId, deletedAt: null },
    });    
    if (!company) {
        return res.status(404).json({ data: null, error: "応募先が見つかりません" });
    }

    // 応募先に紐づく選考フェーズを取得
    const phases = await prisma.selectionPhase.findMany({
        where: { companyId: company.id },
        orderBy: { changedAt: "desc" },
    });

    res.json({ data: phases, error: null });
}

// POST /api/companies/:companyId/phases（=フェーズ進行の登録）
export async function createPhase(req: AuthedRequest, res: Response) {
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

    // 応募先の存在確認
    const company = await prisma.company.findFirst({
        where: { id, userId, deletedAt: null },
    });
    if (!company) {
        return res.status(404).json({ data: null, error: "応募先が見つかりません" });
    }

    // 応募先に紐づく選考フェーズを登録
    const parsed = createPhaseSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ data: null, error: parsed.error.issues[0]?.message });
    }

    // デフォルト値を設定して選考フェーズを作成
    const phase = await prisma.selectionPhase.create({
        data: { ...parsed.data, companyId: company.id, memo: parsed.data.memo ?? null, },
    });

    res.status(201).json({ data: phase, error: null });
}

// PUT /api/phases/:id
export async function updatePhase(req: AuthedRequest, res: Response) {
    const parsed = updatePhaseSchema.safeParse(req.body);  // バリデーション
    if (!parsed.success) {
        return res.status(400).json({ data: null, error: parsed.error.issues[0]?.message });
    }

    const id = req.params.id;  // クエリパラメータの取得

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

    const data: Record<string, unknown> = {};  // 更新するデータを格納するオブジェクト

    // ステータス更新
    if (parsed.data.status !== undefined) {
        data.status = parsed.data.status;
    }

    // メモ更新
    if (parsed.data.memo !== undefined) {
        data.memo = parsed.data.memo;
    }

    // 所持者の応募先に紐づく選考フェーズが存在するか確認
    const phase = await prisma.selectionPhase.findFirst({
        where: { id, company: { userId, deletedAt: null } },
    });
    if (!phase) {
        return res.status(404).json({ data: null, error: "選考フェーズが見つかりません" });
    }

    // 選考フェーズを更新
    const updated = await prisma.selectionPhase.update({
        where: { id },
        data: data,
    });

    res.json({ data: updated, error: null });
}

// DELETE /api/phases/:id
export async function deletePhase(req: AuthedRequest, res: Response) {
    const id = req.params.id;  // クエリパラメータの取得

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

    // 所持者の応募先に紐づく選考フェーズが存在するか確認
    const phase = await prisma.selectionPhase.findFirst({
        where: { id, company: { userId, deletedAt: null } },
    });
    if (!phase) {
        return res.status(404).json({ data: null, error: "選考フェーズが見つかりません" });
    }

    // 選考フェーズを削除
    await prisma.selectionPhase.delete({ where: { id } });
    res.status(204).send();
}