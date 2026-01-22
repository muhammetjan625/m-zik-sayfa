
import React, { useState, useEffect } from 'react';
import Player from './components/Player';
import './Home.css';

function Home() {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Modal ve Yükleme State'leri
  const [showModal, setShowModal] = useState(false);
  const [musicFile, setMusicFile] = useState(null);
  const [autoData, setAutoData] = useState({ title: '', artist: '' });

  // ✅ DÜZELTME BURADA: fetchSongs fonksiyonunu useEffect'in ÜSTÜNE aldık.
  const fetchSongs = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/songs');
      if (res.ok) setSongs(await res.json());
    } catch (e) { console.error(e); }
  };

  // useEffect artık fetchSongs tanımlandıktan sonra çalışıyor
  useEffect(() => { 
    fetchSongs(); 
  }, []);

  // Şarkı Silme Fonksiyonu
  const handleDelete = async (e, songId) => {
    e.stopPropagation(); // Kartın tıklanmasını (çalmayı) engelle
    if (!window.confirm("Bu şarkıyı silmek istediğine emin misin?")) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/songs/${songId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        // Listeden anında kaldır
        setSongs(songs.filter(song => song.id !== songId));
        // Eğer silinen şarkı çalıyorsa playerı durdur
        if (currentSong?.id === songId) {
          setCurrentSong(null);
          setIsPlaying(false);
        }
      } else {
        alert("Silinemedi!");
      }
    } catch (err) {
      console.error("Silme hatası:", err);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMusicFile(file);
      let rawName = file.name.replace(/\.[^/.]+$/, "");
      let artist = "Bilinmeyen Sanatçı";
      let title = rawName;

      if (rawName.includes("-")) {
        const parts = rawName.split("-");
        artist = parts[0].trim();
        title = parts.slice(1).join("-").trim();
      }
      setAutoData({ title, artist });
    }
  };

  const handleUpload = async () => {
    if (!musicFile) return;
    const formData = new FormData();
    formData.append('title', autoData.title);
    formData.append('artist', autoData.artist);
    formData.append('file', musicFile);
    
    // Backend'de hata almamak için boş bir kapak dosyası gönderiyoruz
    // Backend zaten bunu algılayıp varsayılan resim atıyor.
    const emptyBlob = new Blob([""], { type: "image/png" });
    formData.append('cover', emptyBlob, "default.png");

    try {
      const res = await fetch('http://127.0.0.1:8000/upload', { method: 'POST', body: formData });
      if (res.ok) {
        setShowModal(false);
        setMusicFile(null);
        fetchSongs(); // Listeyi güncelle
      } else {
        alert("Yükleme başarısız!");
      }
    } catch (e) { alert("Sunucu hatası"); }
  };

  return (
    <div className="app-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo-area">
           <i className="fa-brands fa-spotify"></i> TuneKeep
        </div>
        
        <nav className="menu">
          <a href="#" className="menu-item active"><i className="fas fa-home"></i> Ana Sayfa</a>
          <a href="#" className="menu-item"><i className="fas fa-search"></i> Ara</a>
          <a href="#" className="menu-item"><i className="fas fa-layer-group"></i> Kitaplık</a>
        </nav>

        <button className="upload-btn-main" onClick={() => setShowModal(true)}>
            <i className="fas fa-plus"></i> Şarkı Ekle
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="header">
            <h2>Kitaplığın</h2>
            <div className="user-pill">Sokrates</div>
        </header>
        
        <div className="music-grid">
          {songs.length === 0 ? (
             <div className="empty-state">Henüz şarkı yok. Sol alttan ekle!</div>
          ) : (
             songs.map((song) => (
                <div key={song.id} className="music-card" onClick={() => setCurrentSong(song)}>
                  <div className="card-image-wrapper">
                    <img 
                      src={song.cover} 
                      onError={(e) => { e.target.onerror=null; e.target.src="https://placehold.co/300x300/282828/white?text=Music"; }} 
                      alt={song.title} 
                    />
                    
                    {/* Oynat Butonu */}
                    <div className="play-overlay">
                      <i className="fas fa-play"></i>
                    </div>

                    {/* SİLME BUTONU */}
                    <button className="delete-btn" onClick={(e) => handleDelete(e, song.id)}>
                        <i className="fas fa-trash"></i>
                    </button>
                  </div>
                  
                  <div className="card-info">
                    <h4>{song.title}</h4>
                    <p>{song.artist}</p>
                  </div>
                </div>
             ))
          )}
        </div>
      </main>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Müzik Yükle</h3>
            <div className="drop-zone">
              <input type="file" accept="audio/*" onChange={handleFileSelect} />
              <div className="drop-text">
                <i className="fas fa-cloud-upload-alt"></i>
                <p>{musicFile ? musicFile.name : "Dosyayı Buraya Bırak"}</p>
              </div>
            </div>
            
            {musicFile && (
               <div className="file-preview">
                  <span>Sanatçı: {autoData.artist}</span>
                  <span>Şarkı: {autoData.title}</span>
               </div>
            )}

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>İptal</button>
              <button className="btn-save" onClick={handleUpload} disabled={!musicFile}>Yükle</button>
            </div>
          </div>
        </div>
      )}

      <Player currentSong={currentSong} isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
    </div>
  );
}

export default Home;