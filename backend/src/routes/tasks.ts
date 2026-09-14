import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { listTasks, updateTask, deleteTask } from "../controllers/taskController.js";

const router = Router();
router.use(requireAuth);

router.get("/", listTasks);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;