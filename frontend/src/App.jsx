import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Home from './Home';
import Register from './Register'; // ✅ Burayı ekledik

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} /> {/* ✅ Burayı ekledik */}
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;