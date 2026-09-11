import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import {
    listCompanies,
    createCompany,
    getCompany,
    updateCompany,
    deleteCompany,
} from "../controllers/companyController.js";

import { listPhases, createPhase } from "../controllers/phaseController.js";

const router = Router();

router.use(requireAuth);  // このルーター配下は全て認証必須

router.get("/", listCompanies);
router.post("/", createCompany);
router.get("/:id", getCompany);
router.put("/:id", updateCompany);
router.delete("/:id", deleteCompany);

router.get("/:companyId/phases", listPhases);
router.post("/:companyId/phases", createPhase);

export default router;