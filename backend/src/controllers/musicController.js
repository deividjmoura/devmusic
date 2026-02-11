import {
  createMusicService,
  listMusicsService,
  getUserMusicsService,
  deleteMusicService,
  updateMusicService
} from "../services/musicService.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

export const createMusicController = asyncHandler(async (req, res) => {
  const { title, artist, url } = req.validated.body;

  const music = await createMusicService({
    title,
    artist,
    url,
    userId: req.userId
  });

  return res.status(201).json(music);
});

export const getAllMusicsController = asyncHandler(async (req, res) => {
  const result = await listMusicsService(req.validated.query);
  return res.json(result);
});

export const getMyMusicsController = asyncHandler(async (req, res) => {
  const result = await getUserMusicsService(req.userId, req.validated.query);
  return res.json(result);
});

export const deleteMusicController = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  await deleteMusicService(id, req.userId);

  return res.json({ message: "Música deletada com sucesso" });
});

export const updateMusicController = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;

  const updatedMusic = await updateMusicService(id, req.userId, req.validated.body);

  return res.json(updatedMusic);
});
