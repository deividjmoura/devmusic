import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
const API_BASE_CANDIDATES = Array.from(
  new Set([
    ...(API_BASE_URL && API_BASE_URL !== "/api" ? [API_BASE_URL] : []),
    "http://127.0.0.1:5000/api",
    "http://localhost:5000/api"
  ])
);

const request = async ({ endpoint, method = "GET", token, body, timeoutMs = 0 }) => {
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  let lastError = null;

  for (const baseUrl of API_BASE_CANDIDATES) {
    const shouldUseTimeout = Number.isFinite(timeoutMs) && timeoutMs > 0;
    const controller = shouldUseTimeout ? new AbortController() : null;
    let didTimeout = false;
    const timeout = shouldUseTimeout
      ? setTimeout(() => {
          didTimeout = true;
          controller.abort();
        }, timeoutMs)
      : null;
    const requestUrl = `${baseUrl}${endpoint}`;

    try {
      console.log("[DevMusic][request] tentando", { method, url: requestUrl, hasToken: Boolean(token) });
      const response = await fetch(requestUrl, {
        method,
        ...(controller ? { signal: controller.signal } : {}),
        headers,
        ...(body ? { body: JSON.stringify(body) } : {})
      });

      const data = await response.json().catch(() => ({}));
      console.log("[DevMusic][request] resposta", {
        method,
        url: requestUrl,
        status: response.status,
        ok: response.ok,
        data
      });

      if (!response.ok) {
        throw new Error(data?.message || "Erro inesperado");
      }

      return data;
    } catch (error) {
      console.error("[DevMusic][request] erro", {
        method,
        url: requestUrl,
        rawError: error,
        errorType: typeof error,
        errorString: String(error),
        errorName: error?.name,
        errorMessage: error?.message,
        didTimeout
      });
      lastError = error;

      if (didTimeout) {
        continue;
      }

      if (error?.name !== "AbortError" && error?.message && error.message !== "Failed to fetch") {
        throw error;
      }
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }

  if (lastError?.name === "AbortError") {
    throw new Error("Servidor demorou para responder. Tente novamente.");
  }

  throw new Error(
    "Falha de conexão com o servidor. Verifique se o backend está rodando na porta 5000."
  );
};

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [notice, setNotice] = useState("");
  const [formVersion, setFormVersion] = useState(0);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setAuthError("");
    setNotice("");
    setFormVersion((current) => current + 1);
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    const form = new FormData(event.currentTarget);

    const endpoint = mode === "login" ? "/users/login" : "/users/register";
    const payload =
      mode === "login"
        ? {
            email: String(form.get("email") || "").trim(),
            password: String(form.get("password") || "")
          }
        : {
            name: String(form.get("name") || "").trim(),
            email: String(form.get("email") || "").trim(),
            password: String(form.get("password") || "")
          };

    try {
      console.log("[DevMusic][auth] submit", { mode, endpoint, payload });
      const data = await request({ endpoint, method: "POST", body: payload, timeoutMs: 0 });
      console.log("[DevMusic][auth] sucesso", { mode, endpoint, data });

      if (mode === "login") {
        localStorage.setItem("token", data.token);
        onLogin(data.token);
        return;
      }

      switchMode("login");
      setNotice("Conta criada com sucesso. Faça login para continuar.");
    } catch (error) {
      console.error("[DevMusic][auth] falha", {
        mode,
        endpoint,
        errorName: error?.name,
        errorMessage: error?.message
      });
      setAuthError(error.message || "Não foi possível continuar.");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-header">
          <p className="auth-kicker">DevMusic</p>
          <h1>{mode === "login" ? "Entrar na conta" : "Criar conta"}</h1>
          <p className="auth-subtitle">
            {mode === "login"
              ? "Faça login para descobrir músicas pelo Jamendo."
              : "Crie sua conta para começar recomendações personalizadas."}
          </p>
        </div>

        <div className="auth-switch">
          <button
            type="button"
            className={mode === "login" ? "switch-btn active" : "switch-btn"}
            onClick={() => switchMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === "register" ? "switch-btn active" : "switch-btn"}
            onClick={() => switchMode("register")}
          >
            Registro
          </button>
        </div>

        <form key={formVersion} className="auth-form" onSubmit={handleAuthSubmit}>
          {mode === "register" ? (
            <label className="field-group">
              <span>Nome</span>
              <input
                type="text"
                name="name"
                placeholder="Seu nome"
                required
              />
            </label>
          ) : null}

          <label className="field-group">
            <span>Email</span>
            <input
              type="email"
              name="email"
              placeholder="voce@email.com"
              required
            />
          </label>

          <label className="field-group">
            <span>Senha</span>
            <input
              type="password"
              name="password"
              placeholder="Sua senha"
              minLength={mode === "register" ? 6 : 1}
              required
            />
          </label>

          {notice ? <p className="status ok">{notice}</p> : null}
          {authError ? <p className="status error">{authError}</p> : null}

          <button type="submit" className="submit-btn" disabled={authLoading}>
            {authLoading ? "Carregando..." : mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>
      </section>
    </main>
  );
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");

  const [appLoading, setAppLoading] = useState(false);
  const [appError, setAppError] = useState("");
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [likedMusics, setLikedMusics] = useState([]);
  const [playlistMusics, setPlaylistMusics] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const [onboardingTracks, setOnboardingTracks] = useState([]);
  const [onboardingIndex, setOnboardingIndex] = useState(0);
  const [votingLoading, setVotingLoading] = useState(false);

  const [dashboardNotice, setDashboardNotice] = useState("");

  const inOnboarding = useMemo(
    () => Boolean(token && profile && !profile.onboardingCompleted),
    [token, profile]
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setProfile(null);
    setRecommendations([]);
    setLikedMusics([]);
    setPlaylistMusics([]);
    setSearchResults([]);
    setOnboardingTracks([]);
    setOnboardingIndex(0);
    setDashboardNotice("");
  };

  const loadLikedMusics = async (authToken) => {
    const liked = await request({ endpoint: "/musics/liked", token: authToken });
    setLikedMusics(liked.data || []);
  };

  const loadPlaylist = async (authToken) => {
    const playlist = await request({ endpoint: "/musics?limit=100", token: authToken });
    setPlaylistMusics(playlist.data || []);
  };

  const loadRecommendations = async (authToken) => {
    const rec = await request({ endpoint: "/musics/recommendations?limit=3", token: authToken });
    setRecommendations(rec.data || []);
  };

  const loadOnboardingTracks = async (authToken) => {
    const onboarding = await request({ endpoint: "/musics/onboarding?count=10", token: authToken });
    setOnboardingTracks(onboarding.tracks || []);
    setOnboardingIndex(0);
  };

  const loadDashboard = async (authToken) => {
    setAppLoading(true);
    setAppError("");

    try {
      const userProfile = await request({ endpoint: "/users/profile", token: authToken });
      setProfile(userProfile);

      await Promise.all([loadLikedMusics(authToken), loadPlaylist(authToken)]);
    } catch (error) {
      setAppError(error.message || "Erro ao carregar dados");
      if (error.message.toLowerCase().includes("token")) {
        handleLogout();
      }
    } finally {
      setAppLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !profile) {
      return;
    }

    if (profile.onboardingCompleted) {
      loadRecommendations(token).catch((error) => {
        setAppError(error.message || "Erro ao carregar recomendações");
      });
      return;
    }

    loadOnboardingTracks(token).catch((error) => {
      setAppError(error.message || "Erro ao carregar onboarding");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, profile?.onboardingCompleted]);

  useEffect(() => {
    if (!token) {
      return;
    }

    loadDashboard(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleVote = async ({ track, status, source }) => {
    if (!token) return;

    setVotingLoading(true);
    setAppError("");

    try {
      const payload = {
        jamendoId: track.jamendoId,
        title: track.title,
        artist: track.artist,
        audioUrl: track.audioUrl,
        imageUrl: track.imageUrl,
        source,
        status
      };

      const data = await request({
        endpoint: "/musics/preferences",
        method: "POST",
        token,
        body: payload
      });

      await loadLikedMusics(token);

      if (source === "ONBOARDING") {
        const isLast = onboardingIndex >= onboardingTracks.length - 1;

        if (data.onboardingCompleted || isLast) {
          const updatedProfile = { ...profile, onboardingCompleted: true };
          setProfile(updatedProfile);
          await loadRecommendations(token);
          setDashboardNotice("Onboarding concluído. Recomendações prontas na tela inicial.");
        } else {
          setOnboardingIndex((current) => current + 1);
        }
      } else if (profile?.onboardingCompleted) {
        await loadRecommendations(token);
      }
    } catch (error) {
      setAppError(error.message || "Não foi possível registrar a preferência");
    } finally {
      setVotingLoading(false);
    }
  };

  const handleSearch = async (event) => {
    event.preventDefault();

    if (!searchTerm.trim() || !token) {
      return;
    }

    setSearchLoading(true);
    setSearchError("");
    setHasSearched(true);

    try {
      const data = await request({
        endpoint: `/musics/search?q=${encodeURIComponent(searchTerm.trim())}&limit=12`,
        token
      });

      setSearchResults(data.data || []);
    } catch (error) {
      setSearchError(error.message || "Erro ao buscar músicas");
    } finally {
      setSearchLoading(false);
    }
  };

  const addToPlaylist = async (track) => {
    if (!token) return;

    try {
      await request({
        endpoint: "/musics",
        method: "POST",
        token,
        body: {
          title: track.title,
          artist: track.artist,
          url: track.audioUrl || undefined
        }
      });

      await loadPlaylist(token);
      setDashboardNotice(`"${track.title}" foi adicionada à playlist.`);
    } catch (error) {
      setAppError(error.message || "Não foi possível adicionar música à playlist");
    }
  };

  const currentOnboardingTrack = onboardingTracks[onboardingIndex];

  if (!token) {
    return <AuthScreen onLogin={setToken} />;
  }

  if (appLoading) {
    return (
      <main className="library-page centered">
        <p className="status">Carregando seu perfil musical...</p>
      </main>
    );
  }

  if (inOnboarding && currentOnboardingTrack) {
    return (
      <main className="library-page">
        <header className="library-header">
          <div>
            <p className="auth-kicker">DevMusic</p>
            <h1>Primeiros gostos musicais</h1>
            <p className="status">Escolha se você curte ou não 10 músicas aleatórias.</p>
          </div>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            Sair
          </button>
        </header>

        {appError ? <p className="status error content-width">{appError}</p> : null}

        <section className="onboarding-card content-width">
          <p className="progress-text">
            Música {onboardingIndex + 1} de {onboardingTracks.length}
          </p>
          {currentOnboardingTrack.imageUrl ? (
            <img
              className="cover"
              src={currentOnboardingTrack.imageUrl}
              alt={`Capa de ${currentOnboardingTrack.title}`}
            />
          ) : null}
          <h2>{currentOnboardingTrack.title}</h2>
          <p>{currentOnboardingTrack.artist}</p>
          {currentOnboardingTrack.audioUrl ? (
            <audio controls src={currentOnboardingTrack.audioUrl} />
          ) : (
            <p className="status">Prévia indisponível para esta faixa.</p>
          )}
          <div className="actions-row">
            <button
              type="button"
              className="vote-btn dislike"
              disabled={votingLoading}
              onClick={() => handleVote({ track: currentOnboardingTrack, status: "DISLIKE", source: "ONBOARDING" })}
            >
              Dislike
            </button>
            <button
              type="button"
              className="vote-btn like"
              disabled={votingLoading}
              onClick={() => handleVote({ track: currentOnboardingTrack, status: "LIKE", source: "ONBOARDING" })}
            >
              Like
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (inOnboarding && onboardingTracks.length === 0) {
    return (
      <main className="library-page centered">
        <p className="status">Carregando músicas do onboarding...</p>
      </main>
    );
  }

  return (
    <main className="library-page">
      <header className="library-header">
        <div>
          <p className="auth-kicker">DevMusic</p>
          <h1>Bem-vindo, {profile?.name}</h1>
          <p className="status">Sua descoberta musical conectada ao Jamendo.</p>
        </div>
        <button type="button" className="logout-btn" onClick={handleLogout}>
          Sair
        </button>
      </header>

      {dashboardNotice ? <p className="status ok content-width">{dashboardNotice}</p> : null}
      {appError ? <p className="status error content-width">{appError}</p> : null}

      <section className="content-width section-block">
        <h2>Recomendações para você</h2>
        {recommendations.length === 0 ? (
          <p className="status">Sem recomendações por enquanto.</p>
        ) : (
          <div className="banner-grid">
            {recommendations.map((track) => (
              <article key={track.jamendoId} className="banner-card">
                {track.imageUrl ? <img src={track.imageUrl} alt={track.title} /> : <div className="image-placeholder" />}
                <div className="banner-content">
                  <strong>{track.title}</strong>
                  <span>{track.artist}</span>
                  {track.audioUrl ? <audio controls src={track.audioUrl} /> : null}
                  <div className="actions-row">
                    <button
                      type="button"
                      className="vote-btn dislike"
                      onClick={() => handleVote({ track, status: "DISLIKE", source: "HOME" })}
                    >
                      Dislike
                    </button>
                    <button
                      type="button"
                      className="vote-btn like"
                      onClick={() => handleVote({ track, status: "LIKE", source: "HOME" })}
                    >
                      Like
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="content-width section-block">
        <h2>Buscar músicas</h2>
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Digite nome da música ou artista"
          />
          <button type="submit" className="submit-btn" disabled={searchLoading}>
            {searchLoading ? "Buscando..." : "Buscar"}
          </button>
        </form>
        {searchError ? <p className="status error">{searchError}</p> : null}
        {!searchLoading && !searchError && hasSearched && searchResults.length === 0 ? (
          <p className="status">Nenhuma música encontrada para essa busca.</p>
        ) : null}
        <div className="search-grid">
          {searchResults.map((track) => (
            <article key={track.jamendoId} className="music-item">
              <div>
                <strong>{track.title}</strong>
                <span>{track.artist}</span>
              </div>
              {track.audioUrl ? <audio controls src={track.audioUrl} /> : null}
              <div className="actions-row">
                <button type="button" className="small-btn" onClick={() => addToPlaylist(track)}>
                  Adicionar na playlist
                </button>
                <button
                  type="button"
                  className="vote-btn like"
                  onClick={() => handleVote({ track, status: "LIKE", source: "SEARCH" })}
                >
                  Like
                </button>
                <button
                  type="button"
                  className="vote-btn dislike"
                  onClick={() => handleVote({ track, status: "DISLIKE", source: "SEARCH" })}
                >
                  Dislike
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-width section-block two-cols">
        <div>
          <h2>Músicas curtidas</h2>
          {likedMusics.length === 0 ? (
            <p className="status">Você ainda não curtiu músicas.</p>
          ) : (
            <ul className="simple-list">
              {likedMusics.map((track) => (
                <li key={`${track.jamendoId}-${track.id}`}>
                  <strong>{track.title}</strong>
                  <span>{track.artist}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2>Minha playlist</h2>
          {playlistMusics.length === 0 ? (
            <p className="status">Sua playlist está vazia.</p>
          ) : (
            <ul className="simple-list">
              {playlistMusics.map((track) => (
                <li key={track.id}>
                  <strong>{track.title}</strong>
                  <span>{track.artist}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
