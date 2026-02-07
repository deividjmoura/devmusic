import prisma from "../config/prisma.js";

export const createMusic = async ({ title, artist, url }) => {
  return await prisma.music.create({
    data: {
      title,
      artist,
      url
    }
  });
};

export const getAllMusics = async () => {
  return await prisma.music.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });
};
    