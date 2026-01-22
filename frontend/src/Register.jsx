import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css'; // Birazdan oluşturacağız

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Şifreler eşleşiyor mu kontrol et
    if (password !== confirmPassword) {
      setError("Şifreler birbiriyle uyuşmuyor!");
      return;
    }

    try {
      // 2. Backend'e kayıt isteği gönder
      const response = await fetch('http://127.0.0.1:8000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      // 3. Başarılıysa Login sayfasına yönlendir
      if (response.ok) {
        alert("Kayıt Başarılı! Şimdi giriş yapabilirsin.");
        navigate('/'); // Login sayfasına atar
      } else {
        // Backend'den gelen hatayı (örn: "Bu email zaten kayıtlı") göster
        const data = await response.json();
        setError(data.detail || "Kayıt başarısız oldu.");
      }
    } catch {
      setError("Sunucuya bağlanılamadı.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Aramıza Katıl 🎵</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleRegister}>
          <div className="input-group">
            <input 
              type="email" 
              placeholder="E-posta Adresi" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="input-group">
            <input 
              type="password" 
              placeholder="Şifre" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <div className="input-group">
            <input 
              type="password" 
              placeholder="Şifreyi Onayla" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="register-btn">Kayıt Ol</button>
        </form>

        <p className="login-link">
          Zaten hesabın var mı? <Link to="/">Giriş Yap</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;