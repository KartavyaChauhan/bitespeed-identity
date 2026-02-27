import { Router } from "express";
import { identifyController } from "../controllers/identity.controller";

const router = Router();

/**
 * POST /identify
 * Identifies and consolidates customer contacts
 */
router.post("/identify", identifyController);

/**
 * Health check endpoint
 */
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

export default router;
