import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import styles from './Page.module.css';

const Vendas = () => {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "vendas"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVendas(items);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleChangeStatus = async (vendaId, statusAtual) => {
      const novoStatus = window.prompt("Digite o novo status (Pendente, Concluída, Cancelada):", statusAtual);
      if (novoStatus && ["Pendente", "Concluída", "Cancelada"].includes(novoStatus)) {
          await updateDoc(doc(db, "vendas", vendaId), { status: novoStatus });
      }
  };

  if (loading) return <p>A carregar histórico de vendas...</p>;

  return (
    <div>
        <header className={styles.header}>
            <h2 className={styles.title}>Histórico de Vendas</h2>
        </header>
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                <tr>
                    <th>Cliente</th>
                    <th>Data</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Ações</th>
                </tr>
                </thead>
                <tbody>
                {vendas.map(venda => (
                    <tr key={venda.id}>
                    <td>{venda.cliente}</td>
                    <td>{venda.data} às {venda.hora}</td>
                    <td>{venda.total}</td>
                    <td style={{ fontWeight: 'bold' }}>{venda.status}</td>
                    <td className={styles.actions}>
                        <button onClick={() => handleChangeStatus(venda.id, venda.status)}>
                        Alterar Status
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default Vendas;