import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createMusicService = async ({ title, artist, url, userId }) => {
  return await prisma.music.create({
    data: {
      title,
      artist,
      url,
      userId
    }
  });
};

export const getUserMusicsService = async (userId) => {
  return await prisma.music.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });
};

export const deleteMusicService = async (id, userId) => {
  const music = await prisma.music.findUnique({
    where: { id }
  });

  if (!music) {
    throw new Error("Música não encontrada");
  }

  if (music.userId !== userId) {
    throw new Error("Não autorizado");
  }

  return await prisma.music.delete({
    where: { id }
  });
};
