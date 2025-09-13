import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; 
import { collection, onSnapshot } from 'firebase/firestore';

function ListaProdutos() {
  const [produtos, setProdutos] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  
    const unsub = onSnapshot(collection(db, 'produtos'), (snapshot) => {
      const listaDeProdutos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProdutos(listaDeProdutos);
      setLoading(false);
    });

    return () => unsub();
  }, []); 

  if (loading) {
    return <h1>Carregando produtos...</h1>;
  }

  return (
    <div>
      <h1>Cardápio</h1>
      <ul>
        {produtos.map(produto => (
          <li key={produto.id}>
            {produto.nome} - R$ {produto.preco}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListaProdutos;