import React, { useRef, useEffect, useState } from 'react';
import './Player.css';

function Player({ currentSong, isPlaying, setIsPlaying }) {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.src = currentSong.url;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((error) => console.log("Oynatma hatası:", error));
      }
    }
  }, [currentSong]);

  // Şarkı ilerledikçe süreyi güncelle
  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
    setDuration(audioRef.current.duration);
  };

  // Progress bar'a tıklayınca şarkıyı sar
  const handleSeek = (e) => {
    const seekTime = (audioRef.current.duration / 100) * e.target.value;
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const togglePlay = () => {
    if (!currentSong) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Saniye cinsinden süreyi dakika:saniye formatına çevir
  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Eğer şarkı seçili değilse player'ı hiç gösterme (Daha şık durur)
  if (!currentSong) return null;

  return (
    <div className="modern-player">
      <audio 
        ref={audioRef} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      {/* SOL: Şarkı Bilgisi */}
      <div className="player-left">
        <img src={currentSong.cover} alt="cover" className="player-cover-img" />
        <div className="player-info">
          <div className="player-title">{currentSong.title}</div>
          <div className="player-artist">{currentSong.artist}</div>
        </div>
      </div>

      {/* ORTA: Kontroller */}
      <div className="player-center">
        <div className="player-controls">
          <button className="ctrl-btn"><i className="fas fa-random"></i></button>
          <button className="ctrl-btn"><i className="fas fa-step-backward"></i></button>
          
          <button className="play-circle-btn" onClick={togglePlay}>
            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
          </button>
          
          <button className="ctrl-btn"><i className="fas fa-step-forward"></i></button>
          <button className="ctrl-btn"><i className="fas fa-redo"></i></button>
        </div>
        
        <div className="progress-container">
          <span className="time-text">{formatTime(currentTime)}</span>
          <input 
            type="range" 
            className="progress-slider"
            value={duration ? (currentTime / duration) * 100 : 0}
            onChange={handleSeek}
          />
          <span className="time-text">{formatTime(duration)}</span>
        </div>
      </div>

      {/* SAĞ: Ses Ayarı */}
      <div className="player-right">
        <i className="fas fa-volume-up"></i>
        <input type="range" className="volume-slider" />
      </div>
    </div>
  );
}

export default Player;