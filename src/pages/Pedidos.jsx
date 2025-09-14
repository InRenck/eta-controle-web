// src/pages/Pedidos.jsx
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, Timestamp, query, where, getDocs, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import styles from './Pedidos.module.css';
import globalStyles from './Page.module.css';

const Pedidos = () => {
  const [produtosCardapio, setProdutosCardapio] = useState([]);
  const [itensPedido, setItensPedido] = useState([]);
  const [cliente, setCliente] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "produtos"), (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProdutosCardapio(items.filter(p => p.status === 'Ativo'));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const novoTotal = itensPedido.reduce((acc, item) => acc + item.preco, 0);
    setTotal(novoTotal);
  }, [itensPedido]);

  const handleAddProduto = (produto) => {
    setItensPedido([...itensPedido, produto]);
  };

  const handleRemoveProduto = (indexParaRemover) => {
    setItensPedido(itensPedido.filter((_, index) => index !== indexParaRemover));
  };

  const handleSalvarPedido = async () => {
    if (cliente.trim() === '' || itensPedido.length === 0) {
      alert("O nome do cliente e pelo menos um item são obrigatórios.");
      return;
    }

    const agora = new Date();
    const novaVenda = {
      cliente: cliente,
      data: agora.toLocaleDateString('pt-BR'),
      hora: agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      total: `R$${total.toFixed(2).replace('.', ',')}`,
      status: "Pendente",
      itens: itensPedido,
      timestamp: Timestamp.fromDate(agora)
    };

    try {
      await addDoc(collection(db, "vendas"), novaVenda);

      // --- LÓGICA CORRIGIDA E FUNCIONAL PARA DAR BAIXA NO ESTOQUE ---
      const contagemDeProdutos = itensPedido.reduce((acc, produto) => {
        // Assume que um produto sem ingredientes debita o estoque de um item com o mesmo nome
        if (!produto.ingredientes || produto.ingredientes.length === 0) {
          acc[produto.nome] = {
            quantidade: (acc[produto.nome]?.quantidade || 0) + 1,
            usaIngredientes: false
          };
        } else {
        // Se o produto usa ingredientes, debita cada ingrediente
          produto.ingredientes.forEach(ingrediente => {
            acc[ingrediente.nome] = {
              quantidade: (acc[ingrediente.nome]?.quantidade || 0) + ingrediente.quantidadeUsada,
              usaIngredientes: true
            };
          });
        }
        return acc;
      }, {});
      
      for (const nomeItem in contagemDeProdutos) {
        const { quantidade } = contagemDeProdutos[nomeItem];
        const q = query(collection(db, "estoque"), where("nome", "==", nomeItem));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const estoqueDoc = querySnapshot.docs[0];
          const estoqueRef = doc(db, "estoque", estoqueDoc.id);
          // Usa a função 'increment' do Firebase para uma atualização segura
          await updateDoc(estoqueRef, {
            estoque: increment(-quantidade)
          });
          console.log(`Baixa de ${quantidade} no estoque de ${nomeItem}`);
        } else {
          console.warn(`Item de estoque "${nomeItem}" não encontrado para dar baixa.`);
        }
      }
      // --- FIM DA LÓGICA DE ESTOQUE ---

      alert("Pedido salvo com sucesso!");
      setCliente('');
      setItensPedido([]);

    } catch (error) {
      alert("Erro ao salvar o pedido.");
      console.error("Erro ao salvar pedido ou dar baixa no estoque: ", error);
    }
  };

  return (
    <div>
      <header className={globalStyles.header}>
        <h2 className={globalStyles.title}>Criar Novo Pedido</h2>
      </header>

      <div className={styles.pageContainer}>
        <main>
          <div className={styles.formSection} style={{marginBottom: '1rem'}}>
            <h3>1. Informações do Cliente</h3>
            <input 
              type="text" 
              value={cliente} 
              onChange={(e) => setCliente(e.target.value)}
              placeholder="Nome do Cliente"
              className={styles.input}
            />
          </div>

          <div className={styles.formSection}>
            <h3>2. Adicionar Itens do Cardápio</h3>
            <div className={styles.cardapioGrid}>
                {produtosCardapio.map(produto => (
                <button key={produto.id} onClick={() => handleAddProduto(produto)} className={styles.produtoButton}>
                    <strong>{produto.nome}</strong><br/>
                    <span>R$ {produto.preco.toFixed(2)}</span>
                </button>
                ))}
            </div>
          </div>
        </main>

        <aside className={`${styles.formSection} ${styles.pedidoResumo}`}>
          <h3>3. Resumo do Pedido</h3>
          <ul className={styles.itensList}>
            {itensPedido.length > 0 ? itensPedido.map((item, index) => (
              <li key={index} className={styles.item}>
                <span>{item.nome}</span>
                <button onClick={() => handleRemoveProduto(index)} style={{background: 'none', border: 'none', color: 'red', cursor: 'pointer'}}>X</button>
              </li>
            )) : <p>Nenhum item adicionado.</p>}
          </ul>
          <p className={styles.total}>Total: R$ {total.toFixed(2)}</p>
          <button onClick={handleSalvarPedido} className={styles.salvarButton}>
            Salvar Pedido
          </button>
        </aside>
      </div>
    </div>
  );
};

export default Pedidos;