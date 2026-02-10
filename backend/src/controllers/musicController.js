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

// Deletar música
export const deleteMusic = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const music = await prisma.music.findUnique({
      where: { id }
    });

    if (!music) {
      return res.status(404).json({ message: "Música não encontrada" });
    }

    if (music.userId !== userId) {
      return res.status(403).json({ message: "Não autorizado" });
    }

    await prisma.music.delete({
      where: { id }
    });

    return res.json({ message: "Música deletada com sucesso" });

  } catch (error) {
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
