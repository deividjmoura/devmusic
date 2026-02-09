import express from "express";
import { createMusicController, getAllMusicsController } from "../controllers/musicController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { listUserMusics } from "../controllers/musicController.js";


const router = express.Router();

router.post("/", authMiddleware, createMusicController);
router.get("/", getAllMusicsController);
router.get("/", authMiddleware, listUserMusics);

export default router;
