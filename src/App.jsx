import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { 
  Wrench, Package, DollarSign, Calendar, Users, FileText, 
  Plus, Trash2, CheckCircle, Search, Phone, 
  MapPin, RefreshCw, ShoppingCart, ArrowUpCircle, ArrowDownCircle, Share2, AlertCircle
} from 'lucide-react';

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState('pdv');
  const [loading, setLoading] = useState(false);
  const [erroConexao, setErroConexao] = useState(null);

  // Estados das tabelas
  const [estoque, setEstoque] = useState([]);
  const [transacoes, setTransacoes] = useState([]);
  const [contasPagar, setContasPagar] = useState([]);
  const [ordensServico, setOrdensServico] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);

  // Estados do PDV
  const [buscaPdv, setBuscaPdv] = useState('');
  const [carrinho, setCarrinho] = useState([]);
  const [servicoAvulsoDesc, setServicoAvulsoDesc] = useState('');
  const [servicoAvulsoValor, setServicoAvulsoValor] = useState('');
  const [formaPgto, setFormaPgto] = useState('Pix');

  // Estados de Formulários
  const [novaChave, setNovaChave] = useState({ id: '', nome: '', cat: 'Yale / Comum', qtd: 10, minimo: 3, custo: 2.5, venda: 15 });
  const [novaOS, setNovaOS] = useState({ cliente: '', tel: '', desc: '', valor: '', custo_insumo: 0, chave_id: '', qtd_copias: 1 });
  const [novoAgendamento, setNovoAgendamento] = useState({ cliente: '', tel: '', endereco: '', servico: '', data: '', hora: '', taxa_deslocamento: 20, valor_estimado: 80 });
  const [novoCliente, setNovoCliente] = useState({ nome: '', tel: '', endereco: '', tipo: 'Residencial', obs: '' });
  const [novaTransacao, setNovaTransacao] = useState({ tipo: 'saida', desc: '', valor: '', forma: 'Pix' });
  const [novaConta, setNovaConta] = useState({ desc: '', valor: '', vencimento: '' });
  const [filtroPeriodoCaixa, setFiltroPeriodoCaixa] = useState('todos');
  const [orcamento, setOrcamento] = useState({ cliente: '', tel: '', itens: [{ desc: '', qtd: 1, valor: 0 }], obs: 'Validade do orçamento: 7 dias.' });

  // Carregar dados do Supabase
  const carregarDados = async () => {
    setLoading(true);
    setErroConexao(null);
    try {
      const { data: est, error: errEst } = await supabase.from('estoque').select('*').order('nome', { ascending: true });
      if (errEst) throw errEst;

      const [
        { data: trans },
        { data: contas },
        { data: os },
        { data: ag },
        { data: cli }
      ] = await Promise.all([
        supabase.from('transacoes').select('*').order('timestamp', { ascending: false }),
        supabase.from('contas_pagar').select('*').order('vencimento', { ascending: true }),
        supabase.from('ordens_servico').select('*').order('id', { ascending: false }),
        supabase.from('agendamentos').select('*').order('data', { ascending: true }),
        supabase.from('clientes').select('*').order('nome', { ascending: true })
      ]);

      if (est) setEstoque(est);
      if (trans) setTransacoes(trans);
      if (contas) setContasPagar(contas);
      if (os) setOrdensServico(os);
      if (ag) setAgendamentos(ag);
      if (cli) setClientes(cli);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setErroConexao(err.message || 'Falha ao conectar com o Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();

    const canal = supabase
      .channel('sincronizacao_chaveiro')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        carregarDados();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  // ================= FUNÇÕES DO PDV =================
  const adicionarAoCarrinho = (item) => {
    const existente = carrinho.find((i) => i.id === item.id);
    if (existente) {
      setCarrinho(carrinho.map((i) => i.id === item.id ? { ...i, qtdVenda: i.qtdVenda + 1 } : i));
    } else {
      setCarrinho([...carrinho, { ...item, qtdVenda: 1, tipoItem: 'estoque' }]);
    }
  };

  const adicionarServicoAvulsoPdv = () => {
    if (!servicoAvulsoDesc || !servicoAvulsoValor) return;
    const novoItem = {
      id: `srv_${Date.now()}`,
      nome: servicoAvulsoDesc,
      venda: Number(servicoAvulsoValor),
      custo: 0,
      qtdVenda: 1,
      tipoItem: 'servico'
    };
    setCarrinho([...carrinho, novoItem]);
    setServicoAvulsoDesc('');
    setServicoAvulsoValor('');
  };

  const finalizarVendaPdv = async () => {
    if (carrinho.length === 0) return;
    setLoading(true);

    const totalVenda = carrinho.reduce((acc, i) => acc + i.venda * i.qtdVenda, 0);
    const totalCusto = carrinho.reduce((acc, i) => acc + (i.custo || 0) * i.qtdVenda, 0);
    const resumoDesc = carrinho.map((i) => `${i.qtdVenda}x ${i.nome}`).join(', ');

    const novaTrans = {
      id: Date.now(),
      tipo: 'entrada',
      desc: `PDV: ${resumoDesc}`,
      valor: totalVenda,
      custo_insumo: totalCusto,
      forma: formaPgto,
      data: new Date().toLocaleDateString('pt-BR'),
      timestamp: Date.now()
    };

    // Atualiza na tela imediatamente
    setTransacoes((prev) => [novaTrans, ...prev]);

    const { error } = await supabase.from('transacoes').insert([novaTrans]);
    if (error) {
      alert('Erro ao salvar venda no Supabase: ' + error.message);
      setLoading(false);
      return;
    }

    for (const item of carrinho) {
      if (item.tipoItem === 'estoque') {
        const novaQtd = Math.max(0, Number(item.qtd) - Number(item.qtdVenda));
        const novasVendas = Number(item.vendas_total || 0) + Number(item.qtdVenda);
        setEstoque((prev) => prev.map((e) => e.id === item.id ? { ...e, qtd: novaQtd, vendas_total: novasVendas } : e));
        await supabase.from('estoque').update({ qtd: novaQtd, vendas_total: novasVendas }).eq('id', item.id);
      }
    }

    setCarrinho([]);
    await carregarDados();
    setLoading(false);
  };

  // ================= FUNÇÕES DO ESTOQUE =================
  const salvarNovaChave = async (e) => {
    e.preventDefault();
    if (!novaChave.nome) return;
    const idFinal = novaChave.id.trim() || `CH-${Date.now().toString().slice(-4)}`;
    const novoItem = {
      id: idFinal,
      nome: novaChave.nome,
      cat: novaChave.cat,
      qtd: Number(novaChave.qtd),
      minimo: Number(novaChave.minimo),
      custo: Number(novaChave.custo),
      venda: Number(novaChave.venda),
      vendas_total: 0
    };

    setEstoque((prev) => [...prev.filter((i) => i.id !== idFinal), novoItem]);

    const { error } = await supabase.from('estoque').upsert([novoItem]);
    if (error) {
      alert('Erro ao salvar no estoque: ' + error.message);
      return;
    }

    setNovaChave({ id: '', nome: '', cat: 'Yale / Comum', qtd: 10, minimo: 3, custo: 2.5, venda: 15 });
    carregarDados();
  };

  const alterarQtdEstoque = async (item, delta) => {
    const novaQtd = Math.max(0, Number(item.qtd) + delta);
    setEstoque((prev) => prev.map((e) => e.id === item.id ? { ...e, qtd: novaQtd } : e));
    const { error } = await supabase.from('estoque').update({ qtd: novaQtd }).eq('id', item.id);
    if (error) alert('Erro ao atualizar quantidade: ' + error.message);
    carregarDados();
  };

  const excluirItemEstoque = async (id) => {
    if (!window.confirm('Remover este item do estoque?')) return;
    setEstoque((prev) => prev.filter((e) => e.id !== id));
    const { error } = await supabase.from('estoque').delete().eq('id', id);
    if (error) alert('Erro ao excluir: ' + error.message);
    carregarDados();
  };

  // ================= FUNÇÕES DE ORDENS DE SERVIÇO (OS) =================
  const criarOS = async (e) => {
    e.preventDefault();
    if (!novaOS.cliente || !novaOS.desc || !novaOS.valor) return;
    const itemOS = {
      id: Date.now(),
      cliente: novaOS.cliente,
      tel: novaOS.tel,
      desc: novaOS.desc,
      valor: Number(novaOS.valor),
      custo_insumo: Number(novaOS.custo_insumo || 0),
      chave_id: novaOS.chave_id || null,
      qtd_copias: Number(novaOS.qtd_copias || 0),
      status: 'pendente',
      data: new Date().toLocaleDateString('pt-BR')
    };

    setOrdensServico((prev) => [itemOS, ...prev]);
    const { error } = await supabase.from('ordens_servico').insert([itemOS]);
    if (error) {
      alert('Erro ao salvar OS: ' + error.message);
      return;
    }
    setNovaOS({ cliente: '', tel: '', desc: '', valor: '', custo_insumo: 0, chave_id: '', qtd_copias: 1 });
    carregarDados();
  };

  const concluirOS = async (os) => {
    if (os.status === 'concluida') return;
    setOrdensServico((prev) => prev.map((o) => o.id === os.id ? { ...o, status: 'concluida' } : o));
    await supabase.from('ordens_servico').update({ status: 'concluida' }).eq('id', os.id);

    const novaTrans = {
      id: Date.now(),
      tipo: 'entrada',
      desc: `OS #${os.id.toString().slice(-4)} - ${os.cliente}: ${os.desc}`,
      valor: Number(os.valor),
      custo_insumo: Number(os.custo_insumo || 0),
      forma: 'Pix',
      data: new Date().toLocaleDateString('pt-BR'),
      timestamp: Date.now()
    };
    setTransacoes((prev) => [novaTrans, ...prev]);
    await supabase.from('transacoes').insert([novaTrans]);
    carregarDados();
  };

  const excluirOS = async (id) => {
    setOrdensServico((prev) => prev.filter((o) => o.id !== id));
    await supabase.from('ordens_servico').delete().eq('id', id);
    carregarDados();
  };

  // ================= FUNÇÕES DA AGENDA DE SOCORROS =================
  const criarAgendamento = async (e) => {
    e.preventDefault();
    if (!novoAgendamento.cliente || !novoAgendamento.endereco || !novoAgendamento.servico) return;
    const itemAg = {
      id: Date.now(),
      cliente: novoAgendamento.cliente,
      tel: novoAgendamento.tel,
      endereco: novoAgendamento.endereco,
      servico: novoAgendamento.servico,
      data: novoAgendamento.data || new Date().toISOString().split('T')[0],
      hora: novoAgendamento.hora || '14:00',
      taxa_deslocamento: Number(novoAgendamento.taxa_deslocamento || 0),
      valor_estimado: Number(novoAgendamento.valor_estimado || 0),
      status: 'agendado'
    };

    setAgendamentos((prev) => [...prev, itemAg]);
    const { error } = await supabase.from('agendamentos').insert([itemAg]);
    if (error) {
      alert('Erro ao salvar agendamento: ' + error.message);
      return;
    }
    setNovoAgendamento({ cliente: '', tel: '', endereco: '', servico: '', data: '', hora: '', taxa_deslocamento: 20, valor_estimado: 80 });
    carregarDados();
  };

  const concluirAgendamento = async (ag) => {
    setAgendamentos((prev) => prev.map((a) => a.id === ag.id ? { ...a, status: 'concluido' } : a));
    await supabase.from('agendamentos').update({ status: 'concluido' }).eq('id', ag.id);
    const novaTrans = {
      id: Date.now(),
      tipo: 'entrada',
      desc: `Socorro: ${ag.servico} (${ag.cliente})`,
      valor: Number(ag.valor_estimado) + Number(ag.taxa_deslocamento),
      custo_insumo: 0,
      forma: 'Pix',
      data: new Date().toLocaleDateString('pt-BR'),
      timestamp: Date.now()
    };
    setTransacoes((prev) => [novaTrans, ...prev]);
    await supabase.from('transacoes').insert([novaTrans]);
    carregarDados();
  };

  const excluirAgendamento = async (id) => {
    setAgendamentos((prev) => prev.filter((a) => a.id !== id));
    await supabase.from('agendamentos').delete().eq('id', id);
    carregarDados();
  };

  // ================= FUNÇÕES DE CLIENTES =================
  const criarCliente = async (e) => {
    e.preventDefault();
    if (!novoCliente.nome) return;
    const itemCli = { id: Date.now(), ...novoCliente };
    setClientes((prev) => [...prev, itemCli]);
    const { error } = await supabase.from('clientes').insert([itemCli]);
    if (error) {
      alert('Erro ao salvar cliente: ' + error.message);
      return;
    }
    setNovoCliente({ nome: '', tel: '', endereco: '', tipo: 'Residencial', obs: '' });
    carregarDados();
  };

  const excluirCliente = async (id) => {
    setClientes((prev) => prev.filter((c) => c.id !== id));
    await supabase.from('clientes').delete().eq('id', id);
    carregarDados();
  };

  // ================= FUNÇÕES DO CAIXA E BOLETOS =================
  const adicionarTransacaoManual = async (e) => {
    e.preventDefault();
    if (!novaTransacao.desc || !novaTransacao.valor) return;
    const itemTrans = {
      id: Date.now(),
      tipo: novaTransacao.tipo,
      desc: novaTransacao.desc,
      valor: Number(novaTransacao.valor),
      custo_insumo: 0,
      forma: novaTransacao.forma,
      data: new Date().toLocaleDateString('pt-BR'),
      timestamp: Date.now()
    };

    setTransacoes((prev) => [itemTrans, ...prev]);
    const { error } = await supabase.from('transacoes').insert([itemTrans]);
    if (error) {
      alert('Erro ao lançar no caixa: ' + error.message);
      return;
    }
    setNovaTransacao({ tipo: 'saida', desc: '', valor: '', forma: 'Pix' });
    carregarDados();
  };

  const criarContaPagar = async (e) => {
    e.preventDefault();
    if (!novaConta.desc || !novaConta.valor || !novaConta.vencimento) return;
    const itemConta = {
      id: Date.now(),
      desc: novaConta.desc,
      valor: Number(novaConta.valor),
      vencimento: novaConta.vencimento,
      status: 'pendente'
    };
    setContasPagar((prev) => [...prev, itemConta]);
    const { error } = await supabase.from('contas_pagar').insert([itemConta]);
    if (error) {
      alert('Erro ao salvar boleto: ' + error.message);
      return;
    }
    setNovaConta({ desc: '', valor: '', vencimento: '' });
    carregarDados();
  };

  const pagarBoleto = async (conta) => {
    if (conta.status === 'pago') return;
    setContasPagar((prev) => prev.map((c) => c.id === conta.id ? { ...c, status: 'pago' } : c));
    await supabase.from('contas_pagar').update({ status: 'pago' }).eq('id', conta.id);
    const novaTrans = {
      id: Date.now(),
      tipo: 'saida',
      desc: `Pagamento Boleto/Conta: ${conta.desc}`,
      valor: Number(conta.valor),
      custo_insumo: 0,
      forma: 'Boleto',
      data: new Date().toLocaleDateString('pt-BR'),
      timestamp: Date.now()
    };
    setTransacoes((prev) => [novaTrans, ...prev]);
    await supabase.from('transacoes').insert([novaTrans]);
    carregarDados();
  };

  const excluirContaPagar = async (id) => {
    setContasPagar((prev) => prev.filter((c) => c.id !== id));
    await supabase.from('contas_pagar').delete().eq('id', id);
    carregarDados();
  };

  // Filtro de Transações por Período
  const transacoesFiltradas = transacoes.filter((t) => {
    if (filtroPeriodoCaixa === 'todos') return true;
    const agora = Date.now();
    const diffDias = (agora - Number(t.timestamp)) / (1000 * 60 * 60 * 24);
    if (filtroPeriodoCaixa === 'hoje') return t.data === new Date().toLocaleDateString('pt-BR');
    if (filtroPeriodoCaixa === '7dias') return diffDias <= 7;
    if (filtroPeriodoCaixa === '30dias') return diffDias <= 30;
    return true;
  });

  const totalEntradas = transacoesFiltradas.filter((t) => t.tipo === 'entrada').reduce((acc, t) => acc + Number(t.valor), 0);
  const totalSaidas = transacoesFiltradas.filter((t) => t.tipo === 'saida').reduce((acc, t) => acc + Number(t.valor), 0);
  const saldoLiquido = totalEntradas - totalSaidas;

  // ================= FUNÇÕES DO ORÇAMENTO =================
  const adicionarLinhaOrcamento = () => {
    setOrcamento({ ...orcamento, itens: [...orcamento.itens, { desc: '', qtd: 1, valor: 0 }] });
  };

  const atualizarItemOrcamento = (index, campo, valor) => {
    const novosItens = [...orcamento.itens];
    novosItens[index][campo] = valor;
    setOrcamento({ ...orcamento, itens: novosItens });
  };

  const totalOrcamento = orcamento.itens.reduce((acc, i) => acc + Number(i.qtd) * Number(i.valor), 0);

  const enviarOrcamentoWhatsApp = () => {
    const linhas = orcamento.itens.map((i) => `- ${i.qtd}x ${i.desc}: R$ ${(i.qtd * i.valor).toFixed(2)}`).join('%0A');
    const texto = `*ORÇAMENTO - CHAVEIRO PRO*%0A*Cliente:* ${orcamento.cliente || 'Não informado'}%0A%0A*Itens/Serviços:*%0A${linhas}%0A%0A*Total:* R$ ${totalOrcamento.toFixed(2)}%0A_${orcamento.obs}_`;
    const numeroLimpo = orcamento.tel.replace(/\D/g, '');
    window.open(`https://wa.me/55${numeroLimpo}?text=${texto}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 md:pb-0">
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="bg-amber-500 p-2 rounded-lg text-slate-950 font-bold">
            <Wrench size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-amber-400">ChaveiroPRO</h1>
            {erroConexao ? (
              <span className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle size={12} /> Erro: {erroConexao}
              </span>
            ) : (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                ● Sincronizado na Nuvem
              </span>
            )}
          </div>
        </div>
        <button 
          onClick={carregarDados} 
          className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-xs px-3 py-2 rounded-lg border border-slate-700"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-amber-400' : ''} />
          Atualizar
        </button>
      </header>

      <nav className="bg-slate-900 border-b border-slate-800 px-2 py-2 flex overflow-x-auto gap-1 sticky top-14 z-10">
        {[
          { id: 'pdv', label: 'PDV / Balcão', icon: ShoppingCart },
          { id: 'estoque', label: 'Estoque', icon: Package },
          { id: 'os', label: 'Ordens (OS)', icon: Wrench },
          { id: 'agenda', label: 'Socorros', icon: Calendar },
          { id: 'caixa', label: 'Caixa / Contas', icon: DollarSign },
          { id: 'clientes', label: 'Clientes', icon: Users },
          { id: 'orcamento', label: 'Orçamentos', icon: FileText },
        ].map((aba) => {
          const Icone = aba.icon;
          return (
            <button
              key={aba.id}
              onClick={() => setAbaAtiva(aba.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                abaAtiva === aba.id 
                  ? 'bg-amber-500 text-slate-950 shadow' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icone size={15} />
              {aba.label}
            </button>
          );
        })}
      </nav>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 space-y-6">
        {abaAtiva === 'pdv' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <h2 className="font-bold text-amber-400 mb-3 flex items-center gap-2">
                  <Search size={18} /> Selecionar Chave ou Produto
                </h2>
                <input
                  type="text"
                  placeholder="Pesquisar chave por código, modelo ou categoria..."
                  value={buscaPdv}
                  onChange={(e) => setBuscaPdv(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm mb-3"
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto">
                  {estoque
                    .filter((i) => i.nome.toLowerCase().includes(buscaPdv.toLowerCase()) || i.id.toLowerCase().includes(buscaPdv.toLowerCase()))
                    .map((item) => (
                      <button
                        key={item.id}
                        onClick={() => adicionarAoCarrinho(item)}
                        className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition flex flex-col justify-between"
                      >
                        <div>
                          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">{item.id}</span>
                          <p className="font-semibold text-sm mt-1 text-slate-100">{item.nome}</p>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-amber-400 font-bold text-sm">R$ {Number(item.venda).toFixed(2)}</span>
                          <span className={`text-xs ${item.qtd <= item.minimo ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                            Est: {item.qtd}
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <h3 className="font-bold text-sm text-slate-300 mb-3">Adicionar Mão de Obra / abertura / serviço avulso</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Ex: Abertura de Porta Residencial"
                    value={servicoAvulsoDesc}
                    onChange={(e) => setServicoAvulsoDesc(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Valor (R$)"
                    value={servicoAvulsoValor}
                    onChange={(e) => setServicoAvulsoValor(e.target.value)}
                    className="w-full sm:w-32 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                  <button
                    onClick={adicionarServicoAvulsoPdv}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm"
                  >
                    + Incluir
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <h2 className="font-bold text-amber-400 mb-3 flex items-center gap-2">
                  <ShoppingCart size={18} /> Comanda Atual
                </h2>
                {carrinho.length === 0 ? (
                  <p className="text-slate-500 text-sm py-8 text-center">Nenhum item selecionado.</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {carrinho.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-sm">
                        <div>
                          <p className="font-medium">{item.nome}</p>
                          <span className="text-xs text-slate-400">
                            {item.qtdVenda}x R$ {Number(item.venda).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-400">R$ {(item.qtdVenda * item.venda).toFixed(2)}</span>
                          <button
                            onClick={() => setCarrinho(carrinho.filter((_, i) => i !== idx))}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-800 pt-4 mt-4 space-y-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-emerald-400">
                    R$ {carrinho.reduce((acc, i) => acc + i.venda * i.qtdVenda, 0).toFixed(2)}
                  </span>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Forma de Pagamento</label>
                  <select
                    value={formaPgto}
                    onChange={(e) => setFormaPgto(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  >
                    <option>Pix</option>
                    <option>Dinheiro</option>
                    <option>Cartão de Crédito</option>
                    <option>Cartão de Débito</option>
                  </select>
                </div>
                <button
                  onClick={finalizarVendaPdv}
                  disabled={carrinho.length === 0 || loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-3 rounded-lg transition"
                >
                  Confirmar Recebimento
                </button>
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'estoque' && (
          <div className="space-y-6">
            <form onSubmit={salvarNovaChave} className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
              <h2 className="font-bold text-amber-400 flex items-center gap-2">
                <Plus size={18} /> Cadastrar Novo Modelo ou Item no Estoque
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <input
                  type="text"
                  placeholder="Código (Ex: Y1, T12)"
                  value={novaChave.id}
                  onChange={(e) => setNovaChave({ ...novaChave, id: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Nome da Chave / Produto *"
                  required
                  value={novaChave.nome}
                  onChange={(e) => setNovaChave({ ...novaChave, nome: e.target.value })}
                  className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
                <select
                  value={novaChave.cat}
                  onChange={(e) => setNovaChave({ ...novaChave, cat: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                >
                  <option>Yale / Comum</option>
                  <option>Tetra</option>
                  <option>Automotiva / Canivete</option>
                  <option>Multiponto</option>
                  <option>Gorge / Antiga</option>
                  <option>Fechaduras / Cadeados</option>
                </select>
                <input
                  type="number"
                  placeholder="Qtd Inicial"
                  value={novaChave.qtd}
                  onChange={(e) => setNovaChave({ ...novaChave, qtd: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Preço Venda (R$)"
                  value={novaChave.venda}
                  onChange={(e) => setNovaChave({ ...novaChave, venda: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm">
                Salvar no Estoque
              </button>
            </form>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <h3 className="font-bold text-slate-200 mb-3">Itens Registados ({estoque.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs">
                      <th className="py-2">Cód.</th>
                      <th>Modelo / Descrição</th>
                      <th>Categoria</th>
                      <th>Qtd</th>
                      <th>Venda</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {estoque.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2.5 font-mono text-xs text-slate-400">{item.id}</td>
                        <td className="font-medium">{item.nome}</td>
                        <td className="text-xs text-slate-400">{item.cat}</td>
                        <td>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${item.qtd <= item.minimo ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-slate-800 text-emerald-400'}`}>
                            {item.qtd} un
                          </span>
                        </td>
                        <td className="text-amber-400 font-semibold">R$ {Number(item.venda).toFixed(2)}</td>
                        <td className="flex items-center gap-1 py-2">
                          <button onClick={() => alterarQtdEstoque(item, 1)} className="bg-slate-800 px-2 py-1 rounded hover:bg-slate-700 text-xs">+1</button>
                          <button onClick={() => alterarQtdEstoque(item, -1)} className="bg-slate-800 px-2 py-1 rounded hover:bg-slate-700 text-xs">-1</button>
                          <button onClick={() => excluirItemEstoque(item.id)} className="text-red-400 hover:text-red-300 ml-2">
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'os' && (
          <div className="space-y-6">
            <form onSubmit={criarOS} className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
              <h2 className="font-bold text-amber-400">Nova Ordem de Serviço (OS)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Nome do Cliente *"
                  required
                  value={novaOS.cliente}
                  onChange={(e) => setNovaOS({ ...novaOS, cliente: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Telefone / WhatsApp"
                  value={novaOS.tel}
                  onChange={(e) => setNovaOS({ ...novaOS, tel: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Descrição do Serviço *"
                  required
                  value={novaOS.desc}
                  onChange={(e) => setNovaOS({ ...novaOS, desc: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  placeholder="Valor Total (R$) *"
                  required
                  value={novaOS.valor}
                  onChange={(e) => setNovaOS({ ...novaOS, valor: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm">
                Gerar Ordem de Serviço
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ordensServico.map((os) => (
                <div key={os.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-mono text-slate-400">OS #{os.id.toString().slice(-4)} • {os.data}</span>
                      <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${os.status === 'concluida' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'}`}>
                        {os.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-base mt-1">{os.cliente}</h3>
                    <p className="text-sm text-slate-300 mt-1">{os.desc}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-800 pt-3 mt-4">
                    <span className="font-bold text-amber-400">R$ {Number(os.valor).toFixed(2)}</span>
                    <div className="flex gap-2">
                      {os.status !== 'concluida' && (
                        <button
                          onClick={() => concluirOS(os)}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                        >
                          <CheckCircle size={14} /> Concluir e Lançar Caixa
                        </button>
                      )}
                      <button onClick={() => excluirOS(os.id)} className="text-red-400 hover:text-red-300 p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {abaAtiva === 'agenda' && (
          <div className="space-y-6">
            <form onSubmit={criarAgendamento} className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
              <h2 className="font-bold text-amber-400">Agendar Socorro Externo / Atendimento</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Cliente *"
                  required
                  value={novoAgendamento.cliente}
                  onChange={(e) => setNovoAgendamento({ ...novoAgendamento, cliente: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Endereço / Localização *"
                  required
                  value={novoAgendamento.endereco}
                  onChange={(e) => setNovoAgendamento({ ...novoAgendamento, endereco: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Serviço (Ex: Abertura de Carro) *"
                  required
                  value={novoAgendamento.servico}
                  onChange={(e) => setNovoAgendamento({ ...novoAgendamento, servico: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="date"
                  value={novoAgendamento.data}
                  onChange={(e) => setNovoAgendamento({ ...novoAgendamento, data: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="time"
                  value={novoAgendamento.hora}
                  onChange={(e) => setNovoAgendamento({ ...novoAgendamento, hora: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  placeholder="Valor Estimado (R$)"
                  value={novoAgendamento.valor_estimado}
                  onChange={(e) => setNovoAgendamento({ ...novoAgendamento, valor_estimado: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm">
                Salvar na Agenda
              </button>
            </form>

            <div className="space-y-3">
              {agendamentos.map((ag) => (
                <div key={ag.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-amber-400 font-bold">{ag.data} às {ag.hora}</span>
                    <h3 className="font-bold text-base">{ag.cliente} — {ag.servico}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin size={13} /> {ag.endereco}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-emerald-400">
                      R$ {(Number(ag.valor_estimado) + Number(ag.taxa_deslocamento)).toFixed(2)}
                    </span>
                    {ag.status !== 'concluido' && (
                      <button
                        onClick={() => concluirAgendamento(ag)}
                        className="bg-emerald-500 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg"
                      >
                        Concluir Socorro
                      </button>
                    )}
                    <button onClick={() => excluirAgendamento(ag.id)} className="text-red-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {abaAtiva === 'caixa' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <ArrowUpCircle size={14} className="text-emerald-400" /> Entradas no Período
                </span>
                <p className="text-2xl font-bold text-emerald-400 mt-1">R$ {totalEntradas.toFixed(2)}</p>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <ArrowDownCircle size={14} className="text-red-400" /> Saídas / Despesas
                </span>
                <p className="text-2xl font-bold text-red-400 mt-1">R$ {totalSaidas.toFixed(2)}</p>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">Saldo Líquido</span>
                <p className={`text-2xl font-bold mt-1 ${saldoLiquido >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
                  R$ {saldoLiquido.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-amber-400">Extrato de Movimentações</h3>
                  <select
                    value={filtroPeriodoCaixa}
                    onChange={(e) => setFiltroPeriodoCaixa(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs"
                  >
                    <option value="todos">Todo o Histórico</option>
                    <option value="hoje">Apenas Hoje</option>
                    <option value="7dias">Últimos 7 Dias</option>
                    <option value="30dias">Últimos 30 Dias</option>
                  </select>
                </div>

                <form onSubmit={adicionarTransacaoManual} className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={novaTransacao.tipo}
                    onChange={(e) => setNovaTransacao({ ...novaTransacao, tipo: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-xs"
                  >
                    <option value="saida">Saída (-)</option>
                    <option value="entrada">Entrada (+)</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Descrição (Ex: Compra de matrizes)"
                    required
                    value={novaTransacao.desc}
                    onChange={(e) => setNovaTransacao({ ...novaTransacao, desc: e.target.value })}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Valor"
                    required
                    value={novaTransacao.valor}
                    onChange={(e) => setNovaTransacao({ ...novaTransacao, valor: e.target.value })}
                    className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs"
                  />
                  <button type="submit" className="bg-amber-500 text-slate-950 font-bold px-3 py-2 rounded-lg text-xs">
                    Lançar
                  </button>
                </form>

                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {transacoesFiltradas.map((t) => (
                    <div key={t.id} className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
                      <div>
                        <p className="font-semibold text-slate-200">{t.desc}</p>
                        <span className="text-slate-500">{t.data} • {t.forma}</span>
                      </div>
                      <span className={`font-bold ${t.tipo === 'entrada' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {t.tipo === 'entrada' ? '+' : '-'} R$ {Number(t.valor).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4">
                <h3 className="font-bold text-amber-400">Controle de Boletos / Contas a Pagar</h3>
                <form onSubmit={criarContaPagar} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Fornecedor / Conta *"
                    required
                    value={novaConta.desc}
                    onChange={(e) => setNovaConta({ ...novaConta, desc: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Valor (R$) *"
                    required
                    value={novaConta.valor}
                    onChange={(e) => setNovaConta({ ...novaConta, valor: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs"
                  />
                  <div className="flex gap-1">
                    <input
                      type="date"
                      required
                      value={novaConta.vencimento}
                      onChange={(e) => setNovaConta({ ...novaConta, vencimento: e.target.value })}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-xs"
                    />
                    <button type="submit" className="bg-amber-500 text-slate-950 font-bold px-3 rounded-lg text-xs">
                      +
                    </button>
                  </div>
                </form>

                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {contasPagar.map((c) => (
                    <div key={c.id} className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
                      <div>
                        <p className="font-semibold text-slate-200">{c.desc}</p>
                        <span className="text-slate-400">Vencimento: {c.vencimento}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-400">R$ {Number(c.valor).toFixed(2)}</span>
                        {c.status === 'pendente' ? (
                          <button
                            onClick={() => pagarBoleto(c)}
                            className="bg-emerald-500 text-slate-950 font-bold px-2.5 py-1 rounded"
                          >
                            Dar Baixa
                          </button>
                        ) : (
                          <span className="text-emerald-400 font-bold">Pago</span>
                        )}
                        <button onClick={() => excluirContaPagar(c.id)} className="text-red-400">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'clientes' && (
          <div className="space-y-6">
            <form onSubmit={criarCliente} className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
              <h2 className="font-bold text-amber-400">Cadastrar Cliente</h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Nome Completo / Empresa *"
                  required
                  value={novoCliente.nome}
                  onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="WhatsApp / Telefone"
                  value={novoCliente.tel}
                  onChange={(e) => setNovoCliente({ ...novoCliente, tel: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Endereço"
                  value={novoCliente.endereco}
                  onChange={(e) => setNovoCliente({ ...novoCliente, endereco: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
                <select
                  value={novoCliente.tipo}
                  onChange={(e) => setNovoCliente({ ...novoCliente, tipo: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                >
                  <option>Residencial</option>
                  <option>Comercial / Condomínio</option>
                  <option>Automotivo</option>
                </select>
              </div>
              <button type="submit" className="bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm">
                Guardar Cliente
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientes.map((c) => (
                <div key={c.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-start">
                  <div>
                    <span className="text-[10px] bg-slate-800 text-amber-400 px-2 py-0.5 rounded">{c.tipo}</span>
                    <h3 className="font-bold text-base mt-1">{c.nome}</h3>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Phone size={12} /> {c.tel || 'Sem telefone'}</p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><MapPin size={12} /> {c.endereco || 'Sem endereço'}</p>
                  </div>
                  <button onClick={() => excluirCliente(c.id)} className="text-red-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {abaAtiva === 'orcamento' && (
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4 max-w-3xl mx-auto">
            <h2 className="font-bold text-amber-400">Gerador Rápido de Orçamento (WhatsApp)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nome do Cliente"
                value={orcamento.cliente}
                onChange={(e) => setOrcamento({ ...orcamento, cliente: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="WhatsApp do Cliente (com DDD)"
                value={orcamento.tel}
                onChange={(e) => setOrcamento({ ...orcamento, tel: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              {orcamento.itens.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Serviço ou Chave"
                    value={item.desc}
                    onChange={(e) => atualizarItemOrcamento(index, 'desc', e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Qtd"
                    value={item.qtd}
                    onChange={(e) => atualizarItemOrcamento(index, 'qtd', e.target.value)}
                    className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Valor Un."
                    value={item.valor}
                    onChange={(e) => atualizarItemOrcamento(index, 'valor', e.target.value)}
                    className="w-28 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={adicionarLinhaOrcamento}
                className="text-xs text-amber-400 hover:underline font-semibold"
              >
                + Adicionar outro item
              </button>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-4">
              <span className="text-lg font-bold">Total: R$ {totalOrcamento.toFixed(2)}</span>
              <button
                type="button"
                onClick={enviarOrcamentoWhatsApp}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-2"
              >
                <Share2 size={16} /> Enviar no WhatsApp
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
