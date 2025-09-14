import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import styles from './Home.module.css';

const Home = () => {
  const [valorVendidoDia, setValorVendidoDia] = useState(0);
  const [pedidosPendentes, setPedidosPendentes] = useState([]);
  const [estoqueBaixoCount, setEstoqueBaixoCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hoje = new Date().toLocaleDateString('pt-BR');

    const qVendas = query(
      collection(db, "vendas"),
      where("data", "==", hoje),
      where("status", "==", "Concluída")
    );
    const unsubVendas = onSnapshot(qVendas, (snapshot) => {
      const total = snapshot.docs.reduce((acc, doc) => {
        const valorStr = doc.data().total.replace('R$', '').replace(',', '.').trim();
        return acc + parseFloat(valorStr || 0);
      }, 0);
      setValorVendidoDia(total);
    });

    const qPendentes = query(
      collection(db, "vendas"),
      where("status", "==", "Pendente")
    );
    const unsubPendentes = onSnapshot(qPendentes, (snapshot) => {
        const listaPendentes = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
        setPedidosPendentes(listaPendentes);
    });

    const unsubEstoque = onSnapshot(collection(db, "estoque"), (snapshot) => {
      const count = snapshot.docs.filter(doc => {
        const item = doc.data();
        return item.estoque <= 10; 
      }).length;
      setEstoqueBaixoCount(count);
    });
    
    setLoading(false);

    return () => {
      unsubVendas();
      unsubPendentes();
      unsubEstoque();
    };
  }, []);

  if (loading) return <p>Carregando visão geral...</p>;

  return (
    <div>
      <header className={styles.header}>
        <h2 className={styles.title}>Visão Geral do Dia</h2>
      </header>

      <div className={styles.widgetsContainer}>
        <div className={styles.card}>
          <h3>Vendas no Dia</h3>
          <p className={styles.salesValue}>R$ {valorVendidoDia.toFixed(2)}</p>
        </div>
        <div className={styles.card}>
          <h3>Alerta de Estoque</h3>
          <p className={styles.stockValue}>{estoqueBaixoCount} itens</p>
        </div>
      </div>

      <div className={styles.pedidosSection}>
        <h2 className={styles.title}>Pedidos em Andamento</h2>
        {pedidosPendentes.length > 0 ? (
            <ul className={styles.pedidosList}>
                {pedidosPendentes.map(pedido => (
                    <li key={pedido.id} className={styles.pedidoItem}>
                      <span>{pedido.cliente}</span>
                      <strong>{pedido.total}</strong>
                    </li>
                ))}
            </ul>
        ) : (
            <div className={styles.emptyState}>
              <p>Nenhum pedido em andamento no momento. Tudo em dia!</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Home;