import express from "express";
import { registerUser, loginUser } from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";


const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authMiddleware, async (req, res) => {
  return res.json({
    message: "Rota protegida funcionando",
    userId: req.userId
  });
});


export default router;
