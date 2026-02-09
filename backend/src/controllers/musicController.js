import { createMusic, getAllMusics } from "../services/musicService.js";
import { getMyMusics } from "../services/musicService.js";



export const createMusicController = async (req, res) => {
  try {
    const { title, artist, url } = req.body;

    const music = await createMusic({ title, artist, url });

    return res.status(201).json(music);

  } catch (error) {
    console.error("ERRO REAL CREATE:", error);
    return res.status(500).json({ message: "Erro ao criar música" });
  }
};


export const getAllMusicsController = async (req, res) => {
  try {
    const musics = await getAllMusics();
    return res.json(musics);
  } catch (error) {
  console.error("ERRO REAL:", error);
  return res.status(500).json({ message: "Erro ao criar música" });
}
};

export const getMyMusicsController = async (req, res) => {
  try {
    const musics = await getMyMusics(req.userId);
    return res.json(musics);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao buscar suas músicas" });
  }
};

import prisma from "../config/prisma.js";

export const listUserMusics = async (req, res) => {
  try {
    const userId = req.userId;

    const musics = await prisma.music.findMany({
      where: { userId }
    });

    return res.json(musics);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao listar músicas" });
  }
};
