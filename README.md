# 就活管理アプリ

応募先企業と選考状況を一元管理するWebアプリ。

## 技術スタック
- Frontend: React(Vite) + TypeScript
- Backend: Node.js + Express + TypeScript
- DB: PostgreSQL + Prisma

## セットアップ
1. `docker compose up -d`
2. `cd backend && npm install && npx prisma migrate dev`
3. `npm run dev` (backend)
4. `cd frontend && npm install && npm run dev`