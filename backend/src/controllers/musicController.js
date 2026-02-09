import { prisma } from "../server.js";

// Criar música
export const createMusicController = async (req, res) => {
  try {
    const { title, artist, url } = req.body;

    const music = await prisma.music.create({
      data: {
        title,
        artist,
        url,
        userId: req.userId // ⚠️ associa ao usuário logado
      }
    });

    return res.status(201).json(music);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error creating music" });
  }
};

// Listar todas as músicas (opcional)
export const getAllMusicsController = async (req, res) => {
  try {
    const musics = await prisma.music.findMany({
      include: { user: { select: { name: true, email: true } } }
    });

    return res.json(musics);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching all musics" });
  }
};

// Listar músicas do usuário logado
export const getMyMusicsController = async (req, res) => {
  try {
    const musics = await prisma.music.findMany({
      where: { userId: req.userId }
    });

    return res.json(musics);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching your musics" });
  }
};
