import { AppError } from "../utils/appError.js";

const JAMENDO_BASE_URL = process.env.JAMENDO_BASE_URL || "https://api.jamendo.com/v3.0";

const getClientId = () => {
  const clientId = process.env.JAMENDO_CLIENT_ID;

  if (!clientId) {
    throw new AppError(500, "JAMENDO_CLIENT_ID não configurado no backend");
  }

  return clientId;
};

const pickImage = (track) => track.image || track.album_image || track.artist_image || null;

const mapTrack = (track) => ({
  jamendoId: String(track.id),
  title: track.name,
  artist: track.artist_name,
  audioUrl: track.audio || track.audiodownload || null,
  imageUrl: pickImage(track)
});

const callJamendo = async (resource, params = {}) => {
  try {
    const query = new URLSearchParams({
      client_id: getClientId(),
      format: "json",
      limit: String(params.limit ?? 20),
      ...Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
      )
    });

    const response = await fetch(`${JAMENDO_BASE_URL}/${resource}?${query.toString()}`);

    if (!response.ok) {
      throw new AppError(502, "Falha ao consultar Jamendo");
    }

    const payload = await response.json();
    const status = payload?.headers?.status;

    if (status && status !== "success") {
      const apiMessage = payload?.headers?.error_message || "Jamendo retornou erro de autenticação/consulta";
      throw new AppError(502, apiMessage);
    }

    if (!Array.isArray(payload?.results)) {
      return [];
    }

    return payload.results;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(502, "Falha de rede ao consultar Jamendo. Verifique conexão e credenciais.");
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

export const searchTracksFromJamendo = async ({ query, limit = 12 }) => {
  const results = await callJamendo("tracks", {
    namesearch: query,
    include: "musicinfo",
    limit,
    order: "popularity_total",
    type: "single albumtrack"
  });

  return results.map(mapTrack);
};

export const getRandomJamendoTracks = async (count = 10) => {
  const randomOffset = Math.floor(Math.random() * 1200);

  const results = await callJamendo("tracks", {
    include: "musicinfo",
    order: "releasedate",
    offset: randomOffset,
    limit: Math.max(count * 3, 30)
  });

  return shuffle(results).slice(0, count).map(mapTrack);
};

export const getRecommendedJamendoTracks = async ({ likedTracks, limit = 3 }) => {
  const likedArtists = Array.from(new Set(likedTracks.map((track) => track.artist).filter(Boolean))).slice(0, 3);

  const likedIds = new Set(likedTracks.map((track) => track.jamendoId));
  const recommendations = [];

  for (const artist of likedArtists) {
    const results = await callJamendo("tracks", {
      artist_name: artist,
      include: "musicinfo",
      order: "popularity_total",
      limit: 10
    });

    for (const result of results) {
      const mapped = mapTrack(result);

      if (likedIds.has(mapped.jamendoId) || recommendations.some((item) => item.jamendoId === mapped.jamendoId)) {
        continue;
      }

      recommendations.push(mapped);

      if (recommendations.length >= limit) {
        return recommendations;
      }
    }
  }

  if (recommendations.length < limit) {
    const fallback = await getRandomJamendoTracks(limit * 2);

    for (const track of fallback) {
      if (likedIds.has(track.jamendoId) || recommendations.some((item) => item.jamendoId === track.jamendoId)) {
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
