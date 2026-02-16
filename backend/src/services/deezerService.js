import { AppError } from "../utils/appError.js";

const DEEZER_BASE_URL = process.env.DEEZER_BASE_URL || "https://api.deezer.com";

const mapTrack = (track) => ({
  deezerId: String(track.id),
  title: track.title,
  artist: track.artist?.name || "Artista desconhecido",
  artistId: track.artist?.id ? String(track.artist.id) : null,
  audioUrl: track.preview || null,
  imageUrl: track.album?.cover_xl || track.album?.cover_big || track.album?.cover_medium || null
});

const callDeezer = async (resource, params = {}) => {
  try {
    const query = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
      )
    );

    const response = await fetch(`${DEEZER_BASE_URL}/${resource}${query.toString() ? `?${query.toString()}` : ""}`);

    if (!response.ok) {
      throw new AppError(502, "Falha ao consultar Deezer");
    }

    const payload = await response.json();

    if (payload?.error?.message) {
      throw new AppError(502, payload.error.message);
    }

    return Array.isArray(payload?.data) ? payload.data : [];
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(502, "Falha de rede ao consultar Deezer.");
  }
};

const shuffle = (items) => {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[randomIndex]] = [copy[randomIndex], copy[i]];
  }

  return copy;
};

export const searchTracksFromDeezer = async ({ query, limit = 12 }) => {
  const results = await callDeezer("search", {
    q: query,
    limit
  });

  return results.map(mapTrack);
};

export const getRandomDeezerTracks = async (count = 10) => {
  const seeds = ["rock", "pop", "hip hop", "jazz", "indie", "electronic", "brasil", "soul"];
  const seed = seeds[Math.floor(Math.random() * seeds.length)];
  const index = Math.floor(Math.random() * 120);

  const results = await callDeezer("search", {
    q: seed,
    index,
    limit: Math.max(count * 3, 30)
  });

  return shuffle(results).slice(0, count).map(mapTrack);
};

export const getRecommendedDeezerTracks = async ({ likedTracks, limit = 3 }) => {
  const likedArtistIds = Array.from(
    new Set(likedTracks.map((track) => track.artistId).filter((artistId) => Boolean(artistId)))
  ).slice(0, 3);

  const likedIds = new Set(likedTracks.map((track) => track.deezerId));
  const recommendations = [];

  for (const artistId of likedArtistIds) {
    const results = await callDeezer(`artist/${artistId}/top`, {
      limit: 10
    });

    for (const result of results) {
      const mapped = mapTrack(result);

      if (likedIds.has(mapped.deezerId) || recommendations.some((item) => item.deezerId === mapped.deezerId)) {
        continue;
      }

      recommendations.push(mapped);

      if (recommendations.length >= limit) {
        return recommendations;
      }
    }
  }

  if (recommendations.length < limit) {
    const fallback = await getRandomDeezerTracks(limit * 2);

    for (const track of fallback) {
      if (likedIds.has(track.deezerId) || recommendations.some((item) => item.deezerId === track.deezerId)) {
        continue;
      }

      recommendations.push(track);

      if (recommendations.length >= limit) {
        break;
      }
    }
  }

  return recommendations.slice(0, limit);
};
