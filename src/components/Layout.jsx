import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import styles from './Layout.module.css'; 

const Layout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className={styles.layoutContainer}>
      <nav className={styles.sidebar}>
        <h3>ETA Controle</h3>
        <ul className={styles.navList}>
          {/* Usamos NavLink e uma função no className para o estilo ativo */}
          <li><NavLink to="/" className={({isActive}) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink} end>Visão Geral</NavLink></li>
          <li><NavLink to="/vendas" className={({isActive}) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>Vendas</NavLink></li>
          <li><NavLink to="/pedidos" className={({isActive}) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>Pedidos</NavLink></li>
          <li><NavLink to="/produtos" className={({isActive}) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>Produtos</NavLink></li>
          <li><NavLink to="/estoque" className={({isActive}) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>Estoque</NavLink></li>
        </ul>
        <button onClick={handleLogout} className={styles.logoutButton}>Sair</button>
      </nav>
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;