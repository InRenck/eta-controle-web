import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const ProdutoForm = ({ produtoSelecionado, onSave, onCancel }) => {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState(0);
  const [status, setStatus] = useState('Ativo');

  useEffect(() => {
    if (produtoSelecionado) {
      setNome(produtoSelecionado.nome);
      setPreco(produtoSelecionado.preco);
      setStatus(produtoSelecionado.status);
    } else {
      setNome('');
      setPreco(0);
      setStatus('Ativo');
    }
  }, [produtoSelecionado]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ nome, preco, status: status === 'Ativo', ingredientes: produtoSelecionado?.ingredientes || [] });
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd' }}>
      <h3>{produtoSelecionado ? 'Editar Produto' : 'Adicionar Novo Produto'}</h3>
      <input
        type="text"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome do Produto"
        required
      />
      <input
        type="number"
        step="0.01"
        value={preco}
        onChange={(e) => setPreco(parseFloat(e.target.value))}
        placeholder="Preço"
        required
      />
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="Ativo">Ativo</option>
        <option value="Inativo">Inativo</option>
      </select>
      <button type="submit">Salvar</button>
      {produtoSelecionado && <button type="button" onClick={onCancel}>Cancelar Edição</button>}
    </form>
  );
};


const Produtos = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [produtoEditando, setProdutoEditando] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "produtos"), (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProdutos(items);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSaveProduto = async (data) => {
    const produtoData = {
      nome: data.nome,
      preco: data.preco,
      status: data.isAtivo ? 'Ativo' : 'Inativo',
      ingredientes: data.ingredientes
    };

    if (produtoEditando) {
      await updateDoc(doc(db, "produtos", produtoEditando.id), produtoData);
    } else {
      await addDoc(collection(db, "produtos"), produtoData);
    }
    setProdutoEditando(null); 
  };

  const handleDeleteProduto = async (id) => {
    if (window.confirm("Tem certeza que deseja deletar este produto?")) {
      await deleteDoc(doc(db, "produtos", id));
    }
  };

  if (loading) return <p>A carregar produtos...</p>;

  return (
    <div>
      <h2>Produtos do Cardápio</h2>
      <ProdutoForm 
        produtoSelecionado={produtoEditando}
        onSave={handleSaveProduto}
        onCancel={() => setProdutoEditando(null)}
      />
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Preço</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map(produto => (
            <tr key={produto.id}>
              <td>{produto.nome}</td>
              <td>R$ {produto.preco.toFixed(2)}</td>
              <td style={{ color: produto.status === 'Ativo' ? 'green' : 'red' }}>
                {produto.status}
              </td>
              <td>
                <button onClick={() => setProdutoEditando(produto)}>Editar</button>
                <button onClick={() => handleDeleteProduto(produto.id)}>Deletar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Produtos;