import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  createMusicController,
  getAllMusicsController,
  getMyMusicsController,
  deleteMusicController,
  updateMusicController,
  searchTracksController,
  getOnboardingTracksController,
  upsertPreferenceController,
  getLikedMusicsController,
  getRecommendationsController
} from "../controllers/musicController.js";
import { validate } from "../middlewares/validate.js";
import {
  createMusicBodySchema,
  updateMusicBodySchema,
  listMusicsQuerySchema,
  musicIdParamsSchema,
  searchTracksQuerySchema,
  onboardingTracksQuerySchema,
  upsertPreferenceBodySchema,
  recommendationsQuerySchema
} from "../schemas/musicSchemas.js";

const router = express.Router();

router.get("/search", authMiddleware, validate(searchTracksQuerySchema, "query"), searchTracksController);
router.get(
  "/onboarding",
  authMiddleware,
  validate(onboardingTracksQuerySchema, "query"),
  getOnboardingTracksController
);
router.post("/preferences", authMiddleware, validate(upsertPreferenceBodySchema), upsertPreferenceController);
router.get(
  "/recommendations",
  authMiddleware,
  validate(recommendationsQuerySchema, "query"),
  getRecommendationsController
);
router.get("/liked", authMiddleware, getLikedMusicsController);

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
