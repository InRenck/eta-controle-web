// src/pages/Login.jsx
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase';
import styles from './Login.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault(); // Previne o recarregamento da página
    console.log("Tentando fazer login com:", email); // Log para ver o e-mail usado
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Se a linha acima NÃO der erro, o login teve sucesso.
      console.log("Firebase disse que o login foi um SUCESSO!");
      // O redirecionamento é automático pelo App.jsx, não precisamos fazer nada aqui.

    } catch (err) {
      console.error("Firebase retornou um ERRO:", err.code); // Mostra o código de erro específico
      
      // Personaliza a mensagem de erro para o usuário
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('E-mail ou senha incorretos.');
      } else {
        setError('Ocorreu um erro ao tentar fazer login.');
      }
    }
  };

  return (
    <div className={styles.container}> 
      {/* Retornamos ao onSubmit, que é a forma padrão e mais correta */}
      <form onSubmit={handleLogin} className={styles.form}>
        <h2 className={styles.title}>Entrar</h2>
        <div className={styles.underline}></div>

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="demo@email.com"
            required
            className={styles.input}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Coloque a senha"
            required
            className={styles.input}
          />
        </div>

        {/* O botão volta a ser 'submit' para funcionar com o onSubmit do formulário */}
        <button type="submit" className={styles.button}>
          Login
        </button>

        {error && <p className={styles.error}>{error}</p>}
      </form>
    </div>
  );
};

export default Login;