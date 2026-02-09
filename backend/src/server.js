import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import musicRoutes from "./routes/musicRoutes.js";
import { PrismaClient } from "@prisma/client";

dotenv.config();

export const prisma = new PrismaClient();

const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use("/api/users", userRoutes);
app.use("/api/musics", musicRoutes);

// Rota teste
app.get("/", (req, res) => {
  res.json({ message: "DevMusic API is running 🚀" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
