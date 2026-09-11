import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { updatePhase, deletePhase } from "../controllers/phaseController.js";

const router = Router();
router.use(requireAuth);

router.put("/:id", updatePhase);
router.delete("/:id", deletePhase);

export default router;