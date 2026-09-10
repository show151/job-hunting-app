import express from "express";
import cors from "cors";
import "dotenv/config";

import authRouter from "./routes/auth.js";

import companiesRouter from "./routes/companies.js";

import phasesRouter from "./routes/phases.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);

app.use("/api/companies", companiesRouter);

app.use("/api/phases", phasesRouter);

app.get("/api/health", (_req, res) => {
    res.json({ data: { status: "ok" }, error: null });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`server listening on :${port}`));