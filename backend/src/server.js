import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import musicRoutes from "./routes/musicRoutes.js";


dotenv.config();

const app = express();

app.use(express.json());
app.use("/api/musics", musicRoutes);
app.use(cors());
app.use("/api/users", userRoutes);


app.get("/", (req, res) => {
  res.json({ message: "DevMusic API is running 🚀" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
