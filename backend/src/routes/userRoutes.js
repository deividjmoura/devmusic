import express from "express";
import { registerUser, loginUser, getProfile } from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Registro e login
router.post("/register", registerUser);
router.post("/login", loginUser);

// Perfil do usuário logado
router.get("/profile", authMiddleware, getProfile);

export default router;
