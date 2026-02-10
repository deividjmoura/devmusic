import { prisma } from "../server.js";
import {
  createMusicService,
  getUserMusicsService,
  deleteMusicService
} from "../services/musicService.js";


// Criar música
export const createMusicController = async (req, res) => {
  try {
    const { title, artist, url } = req.body;

    if (!title || !artist) {
      return res.status(400).json({ message: "Título e artista são obrigatórios" });
    }

    const music = await createMusicService({
      title,
      artist,
      url,
      userId: req.userId
    });

    return res.status(201).json(music);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao criar música" });
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
    const musics = await getUserMusicsService(req.userId);
    return res.json(musics);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao buscar músicas" });
  }
};



// Deletar música
export const deleteMusicController = async (req, res) => {
  try {
    const { id } = req.params;

    await deleteMusicService(Number(id), req.userId);

    return res.json({ message: "Música deletada com sucesso" });

  } catch (error) {
    if (error.message === "Música não encontrada") {
      return res.status(404).json({ message: error.message });
    }

    if (error.message === "Não autorizado") {
      return res.status(403).json({ message: error.message });
    }

    console.error(error);
    return res.status(500).json({ message: "Erro ao deletar música" });
  }
};


export const updateMusic = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { title, artist, url } = req.body;

    const music = await prisma.music.findUnique({
      where: { id }
    });

    if (!music) {
      return res.status(404).json({ message: "Música não encontrada" });
    }

    if (music.userId !== userId) {
      return res.status(403).json({ message: "Não autorizado" });
    }

    const updatedMusic = await prisma.music.update({
  where: { id },
  data: {
    ...(title && { title }),
    ...(artist && { artist }),
    ...(url && { url })
    }
    });

    return res.json(updatedMusic);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao atualizar música" });
  }
};
