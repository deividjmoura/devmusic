import prisma from "../config/prisma.js";
import { AppError } from "../utils/appError.js";
import {
  getRandomDeezerTracks,
  getRecommendedDeezerTracks,
  searchTracksFromDeezer
} from "./deezerService.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const SORTABLE_FIELDS = new Set(["createdAt", "title", "artist"]);
const ONBOARDING_TARGET = 10;

const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
};

const normalizeListParams = (query) => {
  const page = toPositiveInt(query.page, DEFAULT_PAGE);
  const limit = Math.min(toPositiveInt(query.limit, DEFAULT_LIMIT), MAX_LIMIT);
  const sortBy = SORTABLE_FIELDS.has(query.sortBy) ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    sortBy,
    sortOrder,
    title: query.title?.trim() || undefined,
    artist: query.artist?.trim() || undefined,
    userId: query.userId ? Number.parseInt(query.userId, 10) : undefined,
    createdFrom: parseDate(query.createdFrom),
    createdTo: parseDate(query.createdTo)
  };
};

const buildWhereClause = ({ title, artist, userId, createdFrom, createdTo }) => {
  const where = {};

  if (title) {
    where.title = {
      contains: title,
      mode: "insensitive"
    };
  }

  if (artist) {
    where.artist = {
      contains: artist,
      mode: "insensitive"
    };
  }

  if (typeof userId === "number" && !Number.isNaN(userId)) {
    where.userId = userId;
  }

  if (createdFrom || createdTo) {
    where.createdAt = {
      ...(createdFrom && { gte: createdFrom }),
      ...(createdTo && { lte: createdTo })
    };
  }

  return where;
};

const formatPaginatedResponse = ({ data, total, page, limit }) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  };
};

export const createMusicService = async ({ title, artist, url, userId }) => {
  return prisma.music.create({
    data: {
      title,
      artist,
      url,
      userId
    }
  });
};

export const listMusicsService = async (query = {}) => {
  const params = normalizeListParams(query);
  const where = buildWhereClause(params);

  const [musics, total] = await Promise.all([
    prisma.music.findMany({
      where,
      skip: params.skip,
      take: params.limit,
      orderBy: {
        [params.sortBy]: params.sortOrder
      },
      include: { user: { select: { id: true, name: true, email: true } } }
    }),
    prisma.music.count({ where })
  ]);

  return formatPaginatedResponse({
    data: musics,
    total,
    page: params.page,
    limit: params.limit
  });
};

export const getUserMusicsService = async (userId, query = {}) => {
  const params = normalizeListParams({ ...query, userId });
  const where = buildWhereClause(params);

  const [musics, total] = await Promise.all([
    prisma.music.findMany({
      where,
      skip: params.skip,
      take: params.limit,
      orderBy: {
        [params.sortBy]: params.sortOrder
      }
    }),
    prisma.music.count({ where })
  ]);

  return formatPaginatedResponse({
    data: musics,
    total,
    page: params.page,
    limit: params.limit
  });
};

export const deleteMusicService = async (id, userId) => {
  const musicId = Number.parseInt(id, 10);
  if (Number.isNaN(musicId)) {
    throw new AppError(400, "ID da música inválido");
  }

  const music = await prisma.music.findUnique({
    where: { id: musicId }
  });

  if (!music) {
    throw new AppError(404, "Música não encontrada");
  }

  if (music.userId !== userId) {
    throw new AppError(403, "Não autorizado");
  }

  return prisma.music.delete({
    where: { id: musicId }
  });
};

export const updateMusicService = async (id, userId, payload) => {
  const musicId = Number.parseInt(id, 10);
  if (Number.isNaN(musicId)) {
    throw new AppError(400, "ID da música inválido");
  }

  const music = await prisma.music.findUnique({
    where: { id: musicId }
  });

  if (!music) {
    throw new AppError(404, "Música não encontrada");
  }

  if (music.userId !== userId) {
    throw new AppError(403, "Não autorizado");
  }

  const data = {
    ...(payload.title !== undefined && { title: payload.title }),
    ...(payload.artist !== undefined && { artist: payload.artist }),
    ...(payload.url !== undefined && { url: payload.url })
  };

  return prisma.music.update({
    where: { id: musicId },
    data
  });
};

export const searchDeezerTracksService = async (query, limit) => {
  return searchTracksFromDeezer({ query, limit });
};

export const getOnboardingTracksService = async (userId, count = ONBOARDING_TARGET) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { onboardingCompleted: true }
  });

  if (!user) {
    throw new AppError(404, "Usuário não encontrado");
  }

  if (user.onboardingCompleted) {
    return { completed: true, tracks: [] };
  }

  const tracks = await getRandomDeezerTracks(count);
  return { completed: false, tracks };
};

export const upsertPreferenceService = async (userId, payload) => {
  const preference = await prisma.userMusicPreference.upsert({
    where: {
      userId_deezerId: {
        userId,
        deezerId: payload.deezerId
      }
    },
    create: {
      userId,
      deezerId: payload.deezerId,
      title: payload.title,
      artist: payload.artist,
      artistId: payload.artistId,
      audioUrl: payload.audioUrl,
      imageUrl: payload.imageUrl,
      status: payload.status,
      source: payload.source
    },
    update: {
      title: payload.title,
      artist: payload.artist,
      artistId: payload.artistId,
      audioUrl: payload.audioUrl,
      imageUrl: payload.imageUrl,
      status: payload.status,
      source: payload.source
    }
  });

  if (payload.source === "ONBOARDING") {
    const onboardingVotes = await prisma.userMusicPreference.count({
      where: {
        userId,
        source: "ONBOARDING"
      }
    });

    if (onboardingVotes >= ONBOARDING_TARGET) {
      await prisma.user.update({
        where: { id: userId },
        data: { onboardingCompleted: true }
      });
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { onboardingCompleted: true }
  });

  return {
    preference,
    onboardingCompleted: Boolean(user?.onboardingCompleted)
  };
};

export const getLikedMusicsService = async (userId) => {
  return prisma.userMusicPreference.findMany({
    where: {
      userId,
      status: "LIKE"
    },
    orderBy: {
      updatedAt: "desc"
    }
  });
};

export const getRecommendationsService = async (userId, limit = 3) => {
  const likedTracks = await prisma.userMusicPreference.findMany({
    where: {
      userId,
      status: "LIKE"
    },
    orderBy: {
      updatedAt: "desc"
    },
    take: 30,
    select: {
      deezerId: true,
      artist: true,
      artistId: true
    }
  });

  if (likedTracks.length === 0) {
    return getRandomDeezerTracks(limit);
  }

  return getRecommendedDeezerTracks({ likedTracks, limit });
};
