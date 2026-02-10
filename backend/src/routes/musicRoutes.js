import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { 
  createMusicController, 
  getAllMusicsController, 
  getMyMusicsController,
  deleteMusicController,
  updateMusic
} from "../controllers/musicController.js";
import { validateMusic } from "../middlewares/validateMusic.js";
import { validateUpdateMusic } from "../middlewares/validateUpdateMusic.js";



const router = express.Router();

// Rotas protegidas por auth
router.post(
  "/",
  authMiddleware,
  validateMusic,
  createMusicController
);    // Criar música
router.get("/", authMiddleware, getMyMusicsController);       // Listar só músicas do usuário
router.get("/all", getAllMusicsController);                  // Listar todas as músicas 
router.delete("/:id", authMiddleware, deleteMusicController);         // Deletar música 
router.put(
  "/:id",
  authMiddleware,
  validateUpdateMusic,
  updateMusic
);            // Editar música (opcional)


export default router;

