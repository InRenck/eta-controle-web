// src/pages/Produtos.jsx
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import styles from './Page.module.css';

// O componente do formulário não precisa de alterações
const ProdutoForm = ({ produtoSelecionado, onSave, onCancel }) => {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [status, setStatus] = useState('Ativo');

  useEffect(() => {
    if (produtoSelecionado) {
      setNome(produtoSelecionado.nome);
      setPreco(produtoSelecionado.preco);
      setStatus(produtoSelecionado.status);
    } else {
      setNome('');
      setPreco('');
      setStatus('Ativo');
    }
  }, [produtoSelecionado]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ 
      nome, 
      preco: parseFloat(preco), 
      status, // Enviando o status como string ('Ativo' ou 'Inativo')
      // Mantemos os ingredientes se já existirem
      ingredientes: produtoSelecionado?.ingredientes || [] 
    });
  };

  return (
    <div className={styles.formContainer}>
        <h3>{produtoSelecionado ? 'Editar Produto' : 'Adicionar Novo Produto'}</h3>
        <form onSubmit={handleSubmit} className={styles.formFields}>
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
                onChange={(e) => setPreco(e.target.value)}
                placeholder="Preço"
                required
            />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
            </select>
            <button type="submit">Salvar</button>
            {produtoSelecionado && <button type="button" onClick={onCancel}>Cancelar</button>}
        </form>
    </div>
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
    // CORREÇÃO: A estrutura de dados agora está correta
    const produtoData = {
      nome: data.nome,
      preco: data.preco,
      status: data.status,
      ingredientes: data.ingredientes
    };

    try {
        if (produtoEditando) {
            const produtoRef = doc(db, "produtos", produtoEditando.id);
            await updateDoc(produtoRef, produtoData);
            alert("Produto atualizado com sucesso!");
        } else {
            await addDoc(collection(db, "produtos"), produtoData);
            alert("Produto adicionado com sucesso!");
        }
    } catch (error) {
        console.error("Erro ao salvar produto: ", error);
        alert("Ocorreu um erro ao salvar o produto.");
    } finally {
        setProdutoEditando(null); // Limpa o formulário após a operação
    }
  };

  const handleDeleteProduto = async (id) => {
    if (window.confirm("Tem certeza que deseja deletar este produto?")) {
        try {
            await deleteDoc(doc(db, "produtos", id));
            alert("Produto deletado com sucesso!");
        } catch (error) {
            console.error("Erro ao deletar produto: ", error);
            alert("Ocorreu um erro ao deletar o produto.");
        }
    }
  };

  if (loading) return <p>A carregar produtos...</p>;

  return (
    <div>
      <header className={styles.header}>
        <h2 className={styles.title}>Produtos do Cardápio</h2>
      </header>
      <ProdutoForm 
        produtoSelecionado={produtoEditando}
        onSave={handleSaveProduto}
        onCancel={() => setProdutoEditando(null)}
      />
      <div className={styles.tableContainer}>
        <table className={styles.table}>
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
                <td style={{ color: produto.status === 'Ativo' ? 'green' : 'red', fontWeight: 'bold' }}>
                    {produto.status}
                </td>
                <td className={styles.actions}>
                    <button onClick={() => setProdutoEditando(produto)}>Editar</button>
                    <button onClick={() => handleDeleteProduto(produto.id)}>Deletar</button>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default Produtos;