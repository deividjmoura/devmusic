import express from "express";
import { createMusicController, getAllMusicsController } from "../controllers/musicController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createMusicController);
router.get("/", getAllMusicsController);

export default router;
