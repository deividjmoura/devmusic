import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { createMusicController, getAllMusicsController, getMyMusicsController } from "../controllers/musicController.js";

const router = express.Router();

// Rotas protegidas por auth
router.post("/", authMiddleware, createMusicController);      // Criar música
router.get("/", authMiddleware, getMyMusicsController);       // Listar só músicas do usuário
router.get("/all", getAllMusicsController);                  // Listar todas as músicas (opcional)

export default router;
