import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import Layout from '../components/Layout';
import MusicList from '../components/MusicList';
import UploadModal from '../components/UploadModal';
import MusicPlayer from '../components/MusicPlayer';
import { Upload, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const process = require('process'); // Add this line to define 'process'

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Dashboard = () => {
  const [music, setMusic] = useState([]);
  const [filteredMusic, setFilteredMusic] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const navigate = useNavigate();

  const fetchMusic = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/music`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMusic(response.data);
      setFilteredMusic(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      } else {
        toast.error('Müzikler yüklenemedi');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMusic();
  }, [fetchMusic]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = music.filter(
        (track) =>
          track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (track.album && track.album.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredMusic(filtered);
    } else {
      setFilteredMusic(music);
    }
  }, [searchQuery, music]);

  const handleUploadSuccess = () => {
    fetchMusic();
    setUploadModalOpen(false);
  };

  const handleToggleFavorite = async (musicId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${BACKEND_URL}/api/music/${musicId}/favorite`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMusic(music.map(m => 
        m.id === musicId ? { ...m, is_favorite: !currentStatus } : m
      ));
    } catch (error) {
      toast.error('Favori işlemi başarısız');
    }
  };

  const handleDelete = async (musicId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BACKEND_URL}/api/music/${musicId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMusic(music.filter(m => m.id !== musicId));
      toast.success('Müzik silindi');
    } catch (error) {
      toast.error('Silme işlemi başarısız');
    }
  };

  return (
    <Layout>
      <div className="space-y-8 pb-32" data-testid="dashboard">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Kütüphanem</h1>
            <p className="text-muted-foreground">{music.length} şarkı</p>
          </div>

          <Button
            onClick={() => setUploadModalOpen(true)}
            className="gradient-primary neon-glow-hover rounded-full px-8 py-6 font-semibold transition-all duration-300"
            data-testid="upload-btn"
          >
            <Upload className="w-5 h-5 mr-2" />
            Müzik Yükle
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Şarkı, sanatçı veya albüm ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-white/5 border-white/10 focus:border-violet-500/50 text-white placeholder:text-white/30 h-14 text-lg rounded-2xl"
            data-testid="search-input"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredMusic.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              {searchQuery ? 'Sonuç bulunamadı' : 'Henüz müzik yüklemediniz'}
            </p>
          </div>
        ) : (
          <MusicList
            music={filteredMusic}
            onPlay={setCurrentTrack}
            onToggleFavorite={handleToggleFavorite}
            onDelete={handleDelete}
            currentTrack={currentTrack}
          />
        )}
      </div>

      <UploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      {currentTrack && (
        <MusicPlayer
          track={currentTrack}
          onNext={() => {
            const currentIndex = filteredMusic.findIndex(m => m.id === currentTrack.id);
            if (currentIndex < filteredMusic.length - 1) {
              setCurrentTrack(filteredMusic[currentIndex + 1]);
            }
          }}
          onPrevious={() => {
            const currentIndex = filteredMusic.findIndex(m => m.id === currentTrack.id);
            if (currentIndex > 0) {
              setCurrentTrack(filteredMusic[currentIndex - 1]);
            }
          }}
          onClose={() => setCurrentTrack(null)}
        />
      )}
    </Layout>
  );
};

export default Dashboard;
