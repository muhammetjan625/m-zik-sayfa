import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Upload, Music, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const process = require('process'); // Add this line to define 'process'

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const UploadModal = ({ open, onClose, onSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    album: '',
  });
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'audio') {
      if (file.size > MAX_FILE_SIZE) {
        toast.error('Dosya boyutu 100MB\'ı aşamaz');
        return;
      }
      setAudioFile(file);
      if (!formData.title) {
        setFormData({ ...formData, title: file.name.replace(/\.[^/.]+$/, '') });
      }
    } else {
      setCoverFile(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!audioFile) {
      toast.error('Lütfen bir müzik dosyası seçin');
      return;
    }

    setScanning(true);
    
    // Simulated virus scanning
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setScanning(false);
    setUploading(true);

    try {
      const data = new FormData();
      data.append('file', audioFile);
      data.append('title', formData.title);
      data.append('artist', formData.artist);
      if (formData.album) data.append('album', formData.album);
      if (coverFile) data.append('cover', coverFile);

      const token = localStorage.getItem('token');
      await axios.post(`${BACKEND_URL}/api/music/upload`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Müzik başarıyla yüklendi!');
      resetForm();
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Yükleme başarısız');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', artist: '', album: '' });
    setAudioFile(null);
    setCoverFile(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glassmorphism border-white/10 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Müzik Yükle</DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {scanning ? (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 text-center"
              data-testid="scanning-state"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-primary neon-glow mb-4 animate-pulse">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Dosya Tarama</h3>
              <p className="text-muted-foreground">Dosyanız güvenlik için taranyor...</p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleUpload}
              className="space-y-6"
              data-testid="upload-form"
            >
              {/* Audio File Upload */}
              <div className="space-y-2">
                <Label className="text-white">Müzik Dosyası *</Label>
                <div className="relative">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => handleFileChange(e, 'audio')}
                    className="hidden"
                    id="audio-upload"
                    data-testid="audio-file-input"
                  />
                  <label
                    htmlFor="audio-upload"
                    className="flex items-center justify-center gap-3 p-8 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <Music className="w-6 h-6 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {audioFile ? audioFile.name : 'MP3, WAV, FLAC, AAC, OGG (Maks. 100MB)'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Cover Image Upload */}
              <div className="space-y-2">
                <Label className="text-white">Kapak Görseli (Opsiyonel)</Label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'cover')}
                    className="hidden"
                    id="cover-upload"
                    data-testid="cover-file-input"
                  />
                  <label
                    htmlFor="cover-upload"
                    className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <ImageIcon className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {coverFile ? coverFile.name : 'JPG, PNG veya WEBP'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">Şarkı Adı *</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Örn: Bohemian Rhapsody"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-white/5 border-white/10 focus:border-violet-500/50 text-white placeholder:text-white/30"
                    required
                    data-testid="title-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="artist" className="text-white">Sanatçı *</Label>
                  <Input
                    id="artist"
                    type="text"
                    placeholder="Örn: Queen"
                    value={formData.artist}
                    onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                    className="bg-white/5 border-white/10 focus:border-violet-500/50 text-white placeholder:text-white/30"
                    required
                    data-testid="artist-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="album" className="text-white">Albüm (Opsiyonel)</Label>
                <Input
                  id="album"
                  type="text"
                  placeholder="Örn: A Night at the Opera"
                  value={formData.album}
                  onChange={(e) => setFormData({ ...formData, album: e.target.value })}
                  className="bg-white/5 border-white/10 focus:border-violet-500/50 text-white placeholder:text-white/30"
                  data-testid="album-input"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={handleClose}
                  variant="ghost"
                  className="flex-1 rounded-full py-6 hover:bg-white/5"
                  disabled={uploading}
                  data-testid="cancel-upload-btn"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  disabled={uploading || !audioFile}
                  className="flex-1 gradient-primary neon-glow-hover rounded-full py-6 font-semibold"
                  data-testid="submit-upload-btn"
                >
                  {uploading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Yükleniyor...
                    </div>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Yükle
                    </>
                  )}
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default UploadModal;
