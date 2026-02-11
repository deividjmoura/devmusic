import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  createMusicController,
  getAllMusicsController,
  getMyMusicsController,
  deleteMusicController,
  updateMusicController
} from "../controllers/musicController.js";
import { validate } from "../middlewares/validate.js";
import {
  createMusicBodySchema,
  updateMusicBodySchema,
  listMusicsQuerySchema,
  musicIdParamsSchema
} from "../schemas/musicSchemas.js";

const router = express.Router();

router.post("/", authMiddleware, validate(createMusicBodySchema), createMusicController);
router.get("/", authMiddleware, validate(listMusicsQuerySchema, "query"), getMyMusicsController);
router.get("/all", validate(listMusicsQuerySchema, "query"), getAllMusicsController);
router.delete("/:id", authMiddleware, validate(musicIdParamsSchema, "params"), deleteMusicController);
router.put(
  "/:id",
  authMiddleware,
  validate(musicIdParamsSchema, "params"),
  validate(updateMusicBodySchema),
  updateMusicController
);

export default router;
