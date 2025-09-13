import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';

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

  if (loading) return <p>A carregar visão geral...</p>;

  return (
    <div>
      <h2>Visão Geral do Dia</h2>
      <div style={{ display: 'flex', gap: '2rem' }}>
        <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
          <h3>Vendas no Dia</h3>
          <p style={{ color: 'green', fontSize: '24px' }}>R$ {valorVendidoDia.toFixed(2)}</p>
        </div>
        <div style={{ border: '1px solid #ccc', padding: '1rem', background: '#F16D26', color: 'white' }}>
          <h3>Alerta de Estoque</h3>
          <p style={{ fontSize: '24px' }}>{estoqueBaixoCount} itens</p>
        </div>
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <h3>Pedidos em Andamento</h3>
        {pedidosPendentes.length > 0 ? (
            <ul>
                {pedidosPendentes.map(pedido => (
                    <li key={pedido.id}>{pedido.cliente} - {pedido.total}</li>
                ))}
            </ul>
        ) : (
            <p>Nenhum pedido em andamento.</p>
        )}
      </div>
    </div>
  );
};

export default Home;