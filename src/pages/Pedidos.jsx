import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

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
      alert("Pedido salvo com sucesso!");
      // Limpar formulário
      setCliente('');
      setItensPedido([]);
    } catch (error) {
      alert("Erro ao salvar o pedido.");
      console.error("Erro: ", error);
    }
  };

  return (
    <div>
      <h2>Criar Novo Pedido</h2>
      
      <div>
        <h3>Cliente</h3>
        <input 
          type="text" 
          value={cliente} 
          onChange={(e) => setCliente(e.target.value)}
          placeholder="Nome do Cliente"
        />
      </div>

      <div>
        <h3>Itens do Cardápio</h3>
        {produtosCardapio.map(produto => (
          <button key={produto.id} onClick={() => handleAddProduto(produto)}>
            Adicionar {produto.nome} (R$ {produto.preco.toFixed(2)})
          </button>
        ))}
      </div>

      <div>
        <h3>Itens no Pedido</h3>
        <ul>
          {itensPedido.map((item, index) => (
            <li key={index}>
              {item.nome} - R$ {item.preco.toFixed(2)}
              <button onClick={() => handleRemoveProduto(index)}>Remover</button>
            </li>
          ))}
        </ul>
        <h4>Total: R$ {total.toFixed(2)}</h4>
      </div>

      <button onClick={handleSalvarPedido} style={{ marginTop: '20px', padding: '10px 20px' }}>
        Salvar Pedido
      </button>
    </div>
  );
};

export default Pedidos;