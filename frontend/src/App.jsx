import { useState, useEffect } from "react";

function App() {
  const [musics, setMusics] = useState([]);

  useEffect(() => {
    const fetchMusics = async () => {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/musics", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {

        setMusics(data.data);
      } else {
        alert("Erro ao buscar músicas");
      }
    };

    fetchMusics();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Minhas Músicas</h1>

      {musics.length === 0 ? (
        <p>Nenhuma música encontrada</p>
      ) : (
        musics.map((music) => (
          <div key={music.id}>
            <strong>{music.title}</strong> - {music.artist}
          </div>
        ))
      )}
    </div>
  );
}

export default App;
