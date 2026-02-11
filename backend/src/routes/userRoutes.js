import express from "express";
import { registerUser, loginUser, getProfile } from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { loginUserBodySchema, registerUserBodySchema } from "../schemas/userSchemas.js";

const router = express.Router();

router.post("/register", validate(registerUserBodySchema), registerUser);
router.post("/login", validate(loginUserBodySchema), loginUser);
router.get("/profile", authMiddleware, getProfile);

export default router;
