import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const Estoque = () => {
  const [estoque, setEstoque] = useState([]);
  const [loading, setLoading] = useState(true);
  
  
  const [nomeItem, setNomeItem] = useState('');
  const [qtdItem, setQtdItem] = useState(0);
  const [valorItem, setValorItem] = useState(0);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "estoque"), (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEstoque(items);
      setLoading(false);
    });
    return () => unsub();
  }, []);
  
  const handleAddItem = async (e) => {
      e.preventDefault();
      if(nomeItem.trim() === '') return;
      
      const novoItem = {
          nome: nomeItem,
          estoque: Number(qtdItem),
          valor: Number(valorItem),
          dataAtualizacao: new Date().toLocaleDateString('pt-BR')
      };
      
      await addDoc(collection(db, "estoque"), novoItem);
      
      setNomeItem('');
      setQtdItem(0);
      setValorItem(0);
  }

  const handleDeleteItem = async (id) => {
      if(window.confirm("Tem certeza que deseja excluir este item?")) {
          await deleteDoc(doc(db, "estoque", id));
      }
  }

  if (loading) return <p>Carregando estoque...</p>;

  return (
    <div>
      <h2>Controle de Estoque</h2>

      {/* Formulário para adicionar novo item */}
      <form onSubmit={handleAddItem}>
          <h3>Adicionar Novo Item</h3>
          <input type="text" value={nomeItem} onChange={e => setNomeItem(e.target.value)} placeholder="Nome do Item"/>
          <input type="number" value={qtdItem} onChange={e => setQtdItem(e.target.value)} placeholder="Quantidade"/>
          <input type="number" step="0.01" value={valorItem} onChange={e => setValorItem(e.target.value)} placeholder="Valor"/>
          <button type="submit">Salvar Item</button>
      </form>
      
      <hr />

      {/* Tabela com a lista de itens */}
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Quantidade</th>
            <th>Valor</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {estoque.map(item => (
            <tr key={item.id}>
              <td>{item.nome}</td>
              <td>{item.estoque}</td>
              <td>R$ {item.valor.toFixed(2)}</td>
              <td>
                  <button onClick={() => handleDeleteItem(item.id)}>Excluir</button>
                  {/* Botão de editar pode ser adicionado aqui */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Estoque;