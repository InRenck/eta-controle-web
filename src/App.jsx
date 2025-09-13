// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

import Layout from './components/Layout';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import Estoque from './pages/Estoque';
import Vendas from './pages/Vendas';
import Pedidos from './pages/Pedidos';
import Produtos from './pages/Produtos';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Este "observador" do Firebase atualiza o currentUser sempre que o status de login muda
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Status de autenticação mudou:", user ? `Logado como ${user.email}` : "Deslogado");
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Componente que protege as rotas
  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* LÓGICA DE REDIRECIONAMENTO ADICIONADA AQUI */}
        <Route
          path="/login"
          element={
            currentUser ? <Navigate to="/" /> : <Login />
          }
        />
        <Route
          path="/signup"
          element={
            currentUser ? <Navigate to="/" /> : <SignUp />
          }
        />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="vendas" element={<Vendas />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="produtos" element={<Produtos />} />
          <Route path="estoque" element={<Estoque />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;