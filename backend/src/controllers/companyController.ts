import type { Response } from "express";
import { prisma } from "../lib/prisma.js";
import { createCompanySchema, updateCompanySchema } from "../schemas/company.js";
import type { AuthedRequest } from "../middlewares/requireAuth.js";

// GET /api/companies?keyword=&industry=&phase=
export async function listCompanies(req: AuthedRequest, res: Response) {
    // クエリパラメータの取得
    const { keyword, industry, phase } = req.query as Record<string, string | undefined>;

    // 認証済みユーザーのIDを取得
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({
            data: null,
            error: "認証が必要です",
        });
    }

    // 応募先の一覧を取得
    const companies = await prisma.company.findMany({
        where: {
            userId,
            deletedAt: null,
            ...(keyword ? { name: { contains: keyword, mode: "insensitive" } } : {}),  // キーワード検索（大文字小文字を区別しない）
            ...(industry ? { industry } : {}),  // 業界でフィルタリング
        },
        include: {
            phases: { orderBy: { changedAt: "desc" }, take: 1 },
        },
        orderBy: { createdAt: "desc" },
    });

    // currentPhaseをアプリ側で算出する（12.10の方針）
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
    const userId = req.userId;  // 認証済みユーザーのIDを取得
    if (!userId) {
        return res.status(401).json({
            data: null,
            error: "認証が必要です",
        });
    }

    const parsed = createCompanySchema.safeParse(req.body);  // バリデーション
    if (!parsed.success) {
        return res.status(400).json({ data: null, error: parsed.error.issues[0]?.message });
    }

    // デフォルト値を設定して会社情報を作成
    const data = {
        ...parsed.data,
        industry: parsed.data.industry ?? null,
        url: parsed.data.url ?? null,
        memo: parsed.data.memo ?? null,
        userId,
    };

    // 応募先を作成
    const company = await prisma.company.create({
        data,
    });

    res.status(201).json({ data: company, error: null });
}

// GET /api/companies/:id
export async function getCompany(req: AuthedRequest, res: Response) {
    const userId = req.userId;  // 認証済みユーザーのIDを取得
    if (!userId) {
        return res.status(401).json({
            data: null,
            error: "認証が必要です",
        });
    }

    const id = req.params.id;  // URLパラメータからIDを取得
    if (!id || Array.isArray(id)) {
        return res.status(400).json({
            data: null,
            error: "不正なIDです",
        });
    }

    // 応募先を取得（論理削除されていないもののみ）
    const company = await prisma.company.findFirst({
        where: { id, userId, deletedAt: null },
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

    const currentPhase = company.phases[0] ?? null;  // 最新のフェーズを取得（存在しない場合はnull）
    res.json({ data: { ...company, currentPhase }, error: null });
}

// PUT /api/companies/:id
export async function updateCompany(req: AuthedRequest, res: Response) {
    const parsed = updateCompanySchema.safeParse(req.body);  // バリデーション
    if (!parsed.success) {
        return res.status(400).json({ data: null, error: parsed.error.issues[0]?.message });
    }

    const userId = req.userId;  // 認証済みユーザーのIDを取得
    if (!userId) {
        return res.status(401).json({
            data: null,
            error: "認証が必要です",
        });
    }

    const id = req.params.id;  // URLパラメータからIDを取得
    if (!id || Array.isArray(id)) {
        return res.status(400).json({
            data: null,
            error: "不正なIDです",
        });
    }

    // 応募先が存在するか確認（論理削除されていないもののみ）
    const existing = await prisma.company.findFirst({
        where: { id, userId, deletedAt: null },
    });
    if (!existing) {
        return res.status(404).json({ data: null, error: "応募先が見つかりません" });
    }

    const data: Record<string, unknown> = {};  // 更新するデータを格納するオブジェクト

    if (parsed.data.name !== undefined) {
        data.name = parsed.data.name;
    }

    if (parsed.data.route !== undefined) {
        data.route = parsed.data.route;
    }

    if (parsed.data.industry !== undefined) {
        data.industry = parsed.data.industry;
    }

    if (parsed.data.url !== undefined) {
        data.url = parsed.data.url;
    }

    if (parsed.data.memo !== undefined) {
        data.memo = parsed.data.memo;
    }

    // 応募先を更新
    const company = await prisma.company.update({
        where: { id },
        data,
    });

    res.json({ data: company, error: null });
}

// DELETE /api/companies/:id（論理削除）
export async function deleteCompany(req: AuthedRequest, res: Response) {
    const userId = req.userId;  // 認証済みユーザーのIDを取得
    if (!userId) {
        return res.status(401).json({
            data: null,
            error: "認証が必要です",
        });
    }

    const id = req.params.id;  // URLパラメータからIDを取得
    if (!id || Array.isArray(id)) {
        return res.status(400).json({
            data: null,
            error: "不正なIDです",
        });
    }

    // 応募先が存在するか確認（論理削除されていないもののみ）
    const existing = await prisma.company.findFirst({
        where: { id, userId, deletedAt: null },
    });
    if (!existing) {
        return res.status(404).json({ data: null, error: "応募先が見つかりません" });
    }

    // 応募先を論理削除
    await prisma.company.update({
        where: { id },
        data: { deletedAt: new Date() },
    });

    res.status(204).send();
}