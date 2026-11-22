import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';
import { montarURLWhatsAppSeguro } from './utils/formatters';
import { 
  Wrench, Package, DollarSign, Calendar, Users, FileText, 
  Plus, Trash2, Edit2, CheckCircle, Search, Phone, 
  MapPin, RefreshCw, ShoppingCart, Share2, AlertCircle, X, Check, 
  LayoutDashboard, Download, ShieldCheck, Zap, Clock, Award, Calculator, 
  Settings, CreditCard, UserCheck, Send, FolderClock, UserPlus, ChevronUp, 
  ExternalLink, Receipt, Lock, ClipboardCheck, Copy
} from 'lucide-react';

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState('dashboard');
  const [unidadeAtiva, setUnidadeAtiva] = useState('ponto1');
  const [loading, setLoading] = useState(false);
  const [erroConexao, setErroConexao] = useState(null);

  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const mostrarToast = (mensagem, tipo = 'sucesso') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ mensagem, tipo });
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  };

  const [formAberto, setFormAberto] = useState({
    os: false,
    agenda: false,
    orcamento: false,
    estoque: false,
    caixa: false,
    boleto: false,
    cliente: false,
    tabela: false
  });
  const toggleForm = (chave, valorForcado = null) => {
    setFormAberto((prev) => ({ ...prev, [chave]: valorForcado !== null ? valorForcado : !prev[chave] }));
  };
  const [comandaMobileAberta, setComandaMobileAberta] = useState(false);

  const temaUnidade = unidadeAtiva === 'ponto2'
    ? {
        bordaTopo: 'border-t-4 border-t-cyan-500',
        badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        botaoAtivo: 'bg-cyan-500 text-slate-950',
        textoDestaque: 'text-cyan-400',
        logoBg: 'bg-cyan-500'
      }
    : unidadeAtiva === 'todas'
    ? {
        bordaTopo: 'border-t-4 border-t-emerald-500',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        botaoAtivo: 'bg-emerald-500 text-slate-950',
        textoDestaque: 'text-emerald-400',
        logoBg: 'bg-emerald-500'
      }
    : {
        bordaTopo: 'border-t-4 border-t-amber-500',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        botaoAtivo: 'bg-amber-500 text-slate-950',
        textoDestaque: 'text-amber-400',
        logoBg: 'bg-amber-500'
      };

  const [unidadesConfig, setUnidadesConfig] = useState(() => {
    try {
      const salvo = localStorage.getItem('luisinho_unidades_config');
      if (salvo) return JSON.parse(salvo);
    } catch {}
    return [
      { id: 'ponto1', nome: 'Ponto 1 (Principal)', endereco: 'Endereço do Ponto 1 - Sepetiba', fundo_troco: 200 },
      { id: 'ponto2', nome: 'Ponto 2 (Filial)', endereco: 'Endereço do Ponto 2 - Sepetiba', fundo_troco: 200 }
    ];
  });
  const [modalConfigUnidades, setModalConfigUnidades] = useState(false);

  const [funcionarios, setFuncionarios] = useState(() => {
    try {
      const salvoLocal = localStorage.getItem('luisinho_funcionarios');
      return salvoLocal ? JSON.parse(salvoLocal) : [];
    } catch {
      return [];
    }
  });
  const [novoFuncionario, setNovoFuncionario] = useState({ nome: '', tel: '', unidade: 'ponto1' });

  const [estoque, setEstoque] = useState([]);
  const [transacoes, setTransacoes] = useState([]);
  const [contasPagar, setContasPagar] = useState([]);
  const [ordensServico, setOrdensServico] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [tabelaPrecos, setTabelaPrecos] = useState([]);
  const [orcamentosSalvos, setOrcamentosSalvos] = useState([]);

  const [comprovanteAtivo, setComprovanteAtivo] = useState(null);

  const [buscaPdv, setBuscaPdv] = useState('');
  const [carrinho, setCarrinho] = useState([]);
  const [descontoPdv, setDescontoPdv] = useState('');
  const [servicoAvulsoDesc, setServicoAvulsoDesc] = useState('');
  const [servicoAvulsoValor, setServicoAvulsoValor] = useState('');
  const [gerenciandoServicosPdv, setGerenciandoServicosPdv] = useState(false);
  const [servicoRapidoForm, setServicoRapidoForm] = useState({ id: null, nome: '', valor: '' });
  const [formaPgto, setFormaPgto] = useState('Pix');
  const [taxaCartaoIdPdv, setTaxaCartaoIdPdv] = useState('');
  const [clientePdv, setClientePdv] = useState({ nome: '', tel: '', obs: '' });
  const inputBuscaPdvRef = useRef(null);
  const finalizarVendaRef = useRef(null);

  const [calcServicoId, setCalcServicoId] = useState('');
  const [calcPecaId, setCalcPecaId] = useState('');
  const [calcEstoqueId, setCalcEstoqueId] = useState('');
  const [calcAdicionaisIds, setCalcAdicionaisIds] = useState([]);
  const [calcValorExtraManual, setCalcValorExtraManual] = useState('');
  const [calcRepassarTaxa, setCalcRepassarTaxa] = useState(false);
  const [calcTaxaId, setCalcTaxaId] = useState('');
  const [calcCliente, setCalcCliente] = useState({ nome: '', tel: '', endereco: '' });
  const [novoItemTabela, setNovoItemTabela] = useState({ id: null, grupo: 'servico', nome: '', marca: '', tipo_valor: 'fixo', valor: '' });

  const [novaChave, setNovaChave] = useState({ id: '', nome: '', cat: 'Yale / Comum', qtd: 10, minimo: 3, custo: '', venda: '' });
  const [editandoEstoqueId, setEditandoEstoqueId] = useState(null);
  const [buscaEstoque, setBuscaEstoque] = useState('');
  const [filtroCatEstoque, setFiltroCatEstoque] = useState('Todas');
  const [apenasEstoqueBaixo, setApenasEstoqueBaixo] = useState(false);

  const [filtroStatusOS, setFiltroStatusOS] = useState('pendente');
  const [filtroStatusAgenda, setFiltroStatusAgenda] = useState('pendente');

  const [novaOS, setNovaOS] = useState({
    cliente: '', tel: '', endereco: '', desc: '', valor: '',
    forma_pgto: 'Receber na Entrega (Pix/Cartão)',
    garantia: '90 dias', obs_tecnica: '',
    funcionario_id: '',
    itens_usados: []
  });
  const [itemTempOS, setItemTempOS] = useState({ chave_id: '', qtd: 1 });

  const [novoAgendamento, setNovoAgendamento] = useState({
    cliente: '', tel: '', endereco: '', servico: '', data: '', hora: '',
    taxa_deslocamento: 0, valor_estimado: 80,
    funcionario_id: '',
    itens_usados: []
  });
  const [itemTempAg, setItemTempAg] = useState({ chave_id: '', qtd: 1 });

  const [novoCliente, setNovoCliente] = useState({ id: null, nome: '', tel: '', endereco: '', tipo: 'Residencial', obs: '' });
  const [buscaClienteCrm, setBuscaClienteCrm] = useState('');
  const [clienteHistoricoSelecionado, setClienteHistoricoSelecionado] = useState(null);

  const [novaTransacao, setNovaTransacao] = useState({ tipo: 'saida', origem_caixa: 'faturado', desc: '', valor: '', forma: 'Dinheiro' });
  const [transacaoEditando, setTransacaoEditando] = useState(null);
  const [novaConta, setNovaConta] = useState({ desc: '', valor: '', vencimento: '' });
  const [filtroPeriodoCaixa, setFiltroPeriodoCaixa] = useState('hoje');
  const [modalFechamentoCaixa, setModalFechamentoCaixa] = useState(false);
  const [dinheiroContadoFechamento, setDinheiroContadoFechamento] = useState('');
  const [obsFechamento, setObsFechamento] = useState('');
  const [historicoFechamentos, setHistoricoFechamentos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('luisinho_fechamentos_caixa') || '[]');
    } catch {
      return [];
    }
  });

  const [orcamento, setOrcamento] = useState({
    id: null,
    cliente: '',
    tel: '',
    endereco: '',
    tipo_cliente: 'Residencial',
    forma_pgto: 'Pix / Dinheiro (À Vista)',
    itens: [{ desc: '', qtd: 1, valor: 0 }],
    obs: 'Validade: 7 dias. Garantia de 90 dias.'
  });
  const [filtroStatusOrcamento, setFiltroStatusOrcamento] = useState('standby');

  const unidadeOperacional = unidadeAtiva === 'todas' ? 'ponto1' : unidadeAtiva;
  const infoUnidadeAtual = unidadesConfig.find((u) => u.id === unidadeOperacional) || unidadesConfig[0];
  const funcionarioPadraoUnidade = funcionarios.find((f) => f.unidade === unidadeOperacional) || funcionarios[0] || null;

  const hojeStr = new Date().toLocaleDateString('pt-BR');
  const hojeISO = new Date().toISOString().split('T')[0];

  const fundoTrocoBase = unidadeAtiva === 'todas'
    ? unidadesConfig.reduce((acc, u) => acc + Number(u.fundo_troco ?? 200), 0)
    : Number(infoUnidadeAtual?.fundo_troco ?? 200);

  const isMovimentacaoTroco = (t) => {
    if (t.origem_caixa === 'troco') return true;
    return (t.desc || '').startsWith('[TROCO]');
  };

  const carregarDados = async (silencioso = false) => {
    if (!silencioso) setLoading(true);
    setErroConexao(null);
    try {
      const [
        { data: est, error: errEst },
        { data: trans },
        { data: contas },
        { data: os },
        { data: ag },
        { data: cli },
        { data: tab },
        { data: uni },
        { data: orcs },
        { data: funcs }
      ] = await Promise.all([
        supabase.from('estoque').select('*').order('nome', { ascending: true }),
        supabase.from('transacoes').select('*').order('timestamp', { ascending: false }),
        supabase.from('contas_pagar').select('*').order('vencimento', { ascending: true }),
        supabase.from('ordens_servico').select('*').order('id', { ascending: false }),
        supabase.from('agendamentos').select('*').order('data', { ascending: true }),
        supabase.from('clientes').select('*').order('nome', { ascending: true }),
        supabase.from('tabela_precos').select('*').order('id', { ascending: true }),
        supabase.from('unidades_config').select('*').order('id', { ascending: true }),
        supabase.from('orcamentos').select('*').order('id', { ascending: false }),
        supabase.from('funcionarios').select('*').order('nome', { ascending: true })
      ]);

      if (errEst) throw errEst;
      if (est) setEstoque(est);
      if (trans) setTransacoes(trans);
      if (contas) setContasPagar(contas);
      if (os) setOrdensServico(os);
      if (ag) setAgendamentos(ag);
      if (cli) setClientes(cli);
      if (tab) setTabelaPrecos(tab);
      if (uni && uni.length > 0) {
        const localSalvo = (() => {
          try { return JSON.parse(localStorage.getItem('luisinho_unidades_config') || '[]'); } catch { return []; }
        })();
        const mesclado = uni.map((u) => {
          const itemLocal = localSalvo.find((l) => l.id === u.id);
          return {
            ...u,
            fundo_troco: u.fundo_troco !== undefined && u.fundo_troco !== null
              ? Number(u.fundo_troco)
              : Number(itemLocal?.fundo_troco ?? 200)
          };
        });
        setUnidadesConfig(mesclado);
        localStorage.setItem('luisinho_unidades_config', JSON.stringify(mesclado));
      }
      if (orcs) setOrcamentosSalvos(orcs);
      if (funcs && funcs.length > 0) {
        setFuncionarios(funcs);
        localStorage.setItem('luisinho_funcionarios', JSON.stringify(funcs));
      }
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setErroConexao(err.message || 'Falha ao conectar com o Supabase.');
    } finally {
      if (!silencioso) setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados(false);
    const canal = supabase
      .channel('sincronizacao_luisinho_v33')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        carregarDados(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setAbaAtiva('pdv');
        setTimeout(() => inputBuscaPdvRef.current?.focus(), 100);
      } else if (e.key === 'F4' && abaAtiva === 'pdv' && carrinho.length > 0) {
        e.preventDefault();
        finalizarVendaRef.current?.();
      } else if (e.key === 'Escape') {
        setTransacaoEditando(null);
        setComandaMobileAberta(false);
        setModalFechamentoCaixa(false);
        setEditandoEstoqueId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [abaAtiva, carrinho.length]);

  const abrirPortalNFSe = async (dadosServico = null) => {
    const urlNFSe = 'https://www.nfse.gov.br/EmissorNacional/';
    if (dadosServico) {
      const resumo = [
        `Cliente: ${dadosServico.cliente || 'Consumidor'}`,
        `Servico: ${dadosServico.desc || 'Servicos de chaveiro'}`,
        `Valor: R$ ${Number(dadosServico.valor || 0).toFixed(2)}`
      ].join(' | ');
      try {
        await navigator.clipboard.writeText(resumo);
        mostrarToast('Dados do serviço copiados! Abrindo Portal NFS-e...');
      } catch {
        mostrarToast('Abrindo Portal Nacional da NFS-e...');
      }
    } else {
      mostrarToast('Abrindo Portal Nacional da NFS-e...');
    }
    window.open(urlNFSe, '_blank');
  };

  const abrirWhatsAppSeguro = (telefone, textoMensagem) => {
    const urlSegura = montarURLWhatsAppSeguro(telefone, textoMensagem);
    if (!urlSegura) {
      mostrarToast('Informe um WhatsApp com DDD válido.', 'erro');
      return;
    }
    window.open(urlSegura, '_blank');
  };

  const filtraUnidade = (item) => {
    if (unidadeAtiva === 'todas') return true;
    const u = item.unidade || 'ponto1';
    return u === unidadeAtiva;
  };

  const estoqueUnidade = estoque.filter(filtraUnidade);
  const transacoesUnidade = transacoes.filter(filtraUnidade);
  const osUnidade = ordensServico.filter(filtraUnidade);
  const agendaUnidade = agendamentos.filter(filtraUnidade);
  const contasUnidade = contasPagar.filter(filtraUnidade);
  const orcamentosUnidade = orcamentosSalvos.filter(filtraUnidade);

  const garantirCadastroCliente = async (nome, tel, endereco = '', obsExtra = '', tipoCli = 'Residencial') => {
    const nomeLimpo = (nome || '').trim();
    if (!nomeLimpo || nomeLimpo.toLowerCase() === 'consumidor' || nomeLimpo.toLowerCase() === 'cliente') return;

    const existente = clientes.find((c) => c.nome.toLowerCase() === nomeLimpo.toLowerCase());
    if (!existente) {
      const novoCli = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        nome: nomeLimpo,
        tel: (tel || '').trim(),
        endereco: (endereco || '').trim(),
        tipo: tipoCli || 'Residencial',
        obs: obsExtra
      };
      setClientes((prev) => [...prev, novoCli]);
      await supabase.from('clientes').insert([novoCli]);
    } else {
      const novoTel = (tel || '').trim() || existente.tel;
      const novoEnd = (endereco || '').trim() || existente.endereco;
      const novaObs = obsExtra && !existente.obs?.includes(obsExtra)
        ? [existente.obs, obsExtra].filter(Boolean).join(' | ')
        : existente.obs;
      if (novoTel !== existente.tel || novoEnd !== existente.endereco || novaObs !== existente.obs) {
        await supabase.from('clientes').update({ tel: novoTel, endereco: novoEnd, obs: novaObs }).eq('id', existente.id);
      }
    }
  };

  const dispararComprovanteWhatsApp = (dados) => {
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const uniObj = unidadesConfig.find((u) => u.id === (dados.unidade || unidadeOperacional)) || infoUnidadeAtual;
    const statusPgto = dados.forma === 'A Receber (Fiado)' ? 'Pendente / Faturado' : `Pago (${dados.forma})`;

    const linhas = [
      `*LUISINHO CHAVEIRO - COMPROVANTE*`,
      `----------------------------------`,
      `*Unidade:* ${uniObj.nome}`,
      `*Endereco:* ${uniObj.endereco}`,
      `*Data:* ${dataAtual}`,
      `*Cliente:* ${dados.cliente || 'Cliente'}`,
      `----------------------------------`,
      `*Servicos / Produtos:*`,
      dados.itensTexto,
      `----------------------------------`,
      `*Valor Total:* R$ ${Number(dados.total).toFixed(2)}`,
      `*Situacao:* ${statusPgto}`
    ];

    if (dados.garantia) linhas.push(`*Garantia:* ${dados.garantia}`);
    if (dados.obs) linhas.push(`*Obs:* ${dados.obs}`);
    linhas.push(``, `_Guarde este comprovante para sua garantia. Obrigado pela preferencia!_`);

    abrirWhatsAppSeguro(dados.tel, linhas.join('\n'));
  };

  const enviarDiretoParaFuncionario = (tipo, registro) => {
    const uniObj = unidadesConfig.find((u) => u.id === (registro.unidade || unidadeOperacional)) || infoUnidadeAtual;
    const telFunc = registro.funcionario_tel || funcionarioPadraoUnidade?.tel || '';
    const nomeFunc = registro.funcionario_nome || funcionarioPadraoUnidade?.nome || 'Funcionario';

    if (!telFunc) {
      mostrarToast('Cadastre o WhatsApp do funcionário em "Equipe / Lojas".', 'erro');
      setModalConfigUnidades(true);
      return;
    }

    const listaMat = Array.isArray(registro.itens_usados) && registro.itens_usados.length > 0
      ? registro.itens_usados.map((m) => `- ${m.qtd}x ${m.nome || m.id}`).join('\n')
      : '- Nenhum material especifico do estoque';

    const clienteCadastrado = clientes.find((c) => c.nome.toLowerCase() === (registro.cliente || '').toLowerCase());
    const enderecoFinal = (registro.endereco && registro.endereco.trim() !== '')
      ? registro.endereco
      : (clienteCadastrado?.endereco || 'Atendimento na Loja / Consultar cliente');
    const telefoneCliente = (registro.tel && registro.tel.trim() !== '')
      ? registro.tel
      : (clienteCadastrado?.tel || 'Nao informado');

    if (tipo === 'os') {
      const codigoOS = String(registro.id).slice(-4);
      const mensagemOS = [
        `*FICHA DE SERVICO - LUISINHO CHAVEIRO*`,
        `*Unidade:* ${uniObj.nome}`,
        `*Responsavel:* ${nomeFunc}`,
        `*Ordem de Servico:* Nº ${codigoOS}`,
        `*Data:* ${registro.data || hojeStr}`,
        `----------------------------------`,
        `*DADOS DO CLIENTE:*`,
        `*Cliente:* ${registro.cliente || 'Nao informado'}`,
        `*WhatsApp Cliente:* ${telefoneCliente}`,
        `*Endereco / Local:* ${enderecoFinal}`,
        `----------------------------------`,
        `*SERVICO A EXECUTAR:*`,
        `${registro.desc || 'Ver detalhes'}`,
        ``,
        `*MATERIAIS / CHAVES SEPARADAS:*`,
        `${listaMat}`,
        `----------------------------------`,
        `*FINANCEIRO / COBRANCA:*`,
        `*Valor Total:* R$ ${Number(registro.valor || 0).toFixed(2)}`,
        `*Condicao de Pagamento:* ${registro.forma_pgto || 'Receber na Entrega'}`
      ].join('\n');

      abrirWhatsAppSeguro(telFunc, mensagemOS);
    } else {
      const totalSoc = Number(registro.valor_estimado || 0) + Number(registro.taxa_deslocamento || 0);
      const mensagemSocorro = [
        `*CHAMADO DE SOCORRO - LUISINHO CHAVEIRO*`,
        `*Unidade:* ${uniObj.nome}`,
        `*Responsavel:* ${nomeFunc}`,
        `*Data e Hora:* ${registro.data} as ${registro.hora}`,
        `----------------------------------`,
        `*DADOS DO CLIENTE:*`,
        `*Cliente:* ${registro.cliente || 'Nao informado'}`,
        `*WhatsApp Cliente:* ${telefoneCliente}`,
        `*Endereco do Socorro:* ${registro.endereco || enderecoFinal}`,
        `----------------------------------`,
        `*SERVICO A EXECUTAR:*`,
        `${registro.servico}`,
        ``,
        `*MATERIAIS / PECAS:*`,
        `${listaMat}`,
        `----------------------------------`,
        `*FINANCEIRO / COBRANCA:*`,
        `*Valor Total a Cobrar:* R$ ${totalSoc.toFixed(2)}`
      ].join('\n');

      abrirWhatsAppSeguro(telFunc, mensagemSocorro);
    }
  };

  const adicionarFuncionario = async (e) => {
    e.preventDefault();
    if (!novoFuncionario.nome || !novoFuncionario.tel) return;
    const itemFunc = {
      id: Date.now(),
      nome: novoFuncionario.nome.trim(),
      tel: novoFuncionario.tel.trim(),
      unidade: novoFuncionario.unidade || 'ponto1'
    };

    const novaLista = [...funcionarios, itemFunc];
    setFuncionarios(novaLista);
    localStorage.setItem('luisinho_funcionarios', JSON.stringify(novaLista));
    await supabase.from('funcionarios').upsert([itemFunc]);
    setNovoFuncionario({ nome: '', tel: '', unidade: unidadeOperacional });
    mostrarToast('Funcionário salvo com sucesso!');
  };

  const removerFuncionario = async (id) => {
    if (!window.confirm('Remover este funcionário da lista?')) return;
    const novaLista = funcionarios.filter((f) => f.id !== id);
    setFuncionarios(novaLista);
    localStorage.setItem('luisinho_funcionarios', JSON.stringify(novaLista));
    await supabase.from('funcionarios').delete().eq('id', id);
    mostrarToast('Funcionário removido.');
  };

  const salvarConfigUnidades = async (e) => {
    e.preventDefault();
    localStorage.setItem('luisinho_unidades_config', JSON.stringify(unidadesConfig));
    for (const u of unidadesConfig) {
      const { error } = await supabase.from('unidades_config').upsert([{
        id: u.id,
        nome: u.nome,
        endereco: u.endereco,
        fundo_troco: Math.max(0, Number(u.fundo_troco || 0))
      }]);
      if (error) {
        await supabase.from('unidades_config').upsert([{ id: u.id, nome: u.nome, endereco: u.endereco }]);
      }
    }
    setModalConfigUnidades(false);
    mostrarToast('Unidades e Fundo de Troco atualizados!');
    carregarDados(true);
  };

  const taxasCartaoDisponiveis = tabelaPrecos.filter((t) => t.grupo === 'taxa_cartao');

  const adicionarAoCarrinho = (item) => {
    const existente = carrinho.find((i) => i.id === item.id);
    if (existente) {
      setCarrinho(carrinho.map((i) => i.id === item.id ? { ...i, qtdVenda: i.qtdVenda + 1 } : i));
    } else {
      setCarrinho([...carrinho, { ...item, precoEditado: Number(item.venda), qtdVenda: 1, tipoItem: 'estoque' }]);
    }
    mostrarToast(`+1 ${item.nome} na comanda`);
  };

  const adicionarServicoAvulsoPdv = (descCustom = null, valorCustom = null) => {
    const descFinal = descCustom || servicoAvulsoDesc;
    const valorFinal = valorCustom !== null ? valorCustom : servicoAvulsoValor;
    if (!descFinal || valorFinal === '' || Number(valorFinal) < 0) return;

    const novoItem = {
      id: `srv_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      nome: descFinal,
      venda: Number(valorFinal),
      precoEditado: Number(valorFinal),
      custo: 0,
      qtdVenda: 1,
      tipoItem: 'servico'
    };
    setCarrinho([...carrinho, novoItem]);
    if (!descCustom) {
      setServicoAvulsoDesc('');
      setServicoAvulsoValor('');
    }
    mostrarToast(`Serviço "${descFinal}" incluído`);
  };

  const salvarServicoRapidoPdv = async (e) => {
    e.preventDefault();
    if (!servicoRapidoForm.nome.trim() || servicoRapidoForm.valor === '' || Number(servicoRapidoForm.valor) < 0) {
      mostrarToast('Preencha o nome e um valor válido.', 'erro');
      return;
    }
    const item = {
      id: servicoRapidoForm.id || Date.now(),
      grupo: 'servico',
      nome: servicoRapidoForm.nome.trim(),
      marca: 'Geral',
      tipo_valor: 'fixo',
      valor: Number(servicoRapidoForm.valor)
    };
    const { error } = await supabase.from('tabela_precos').upsert([item]);
    if (error) {
      mostrarToast('Erro ao salvar serviço: ' + error.message, 'erro');
      return;
    }
    const eraEdicao = Boolean(servicoRapidoForm.id);
    setServicoRapidoForm({ id: null, nome: '', valor: '' });
    mostrarToast(eraEdicao ? 'Serviço rápido atualizado!' : 'Novo serviço rápido salvo!');
    carregarDados(true);
  };

  const alterarPrecoItemCarrinho = (idx, novoPreco) => {
    const copia = [...carrinho];
    copia[idx].precoEditado = novoPreco === '' ? '' : Math.max(0, Number(novoPreco));
    setCarrinho(copia);
  };

  const alterarQtdItemCarrinho = (idx, delta) => {
    const copia = [...carrinho];
    const novaQtd = Math.max(1, Number(copia[idx].qtdVenda) + delta);
    copia[idx].qtdVenda = novaQtd;
    setCarrinho(copia);
  };

  const totalItensCarrinho = carrinho.reduce((acc, i) => acc + Number(i.qtdVenda), 0);
  const subtotalCarrinho = carrinho.reduce((acc, i) => acc + Number(i.precoEditado || 0) * Number(i.qtdVenda), 0);
  const valorDescontoPdv = Math.max(0, Number(descontoPdv || 0));
  const totalLiquidoPdv = Math.max(0, subtotalCarrinho - valorDescontoPdv);

  const taxaSelecionadaObj = taxasCartaoDisponiveis.find((t) => t.id.toString() === taxaCartaoIdPdv.toString());
  const percentualTaxaPdv = (formaPgto.includes('Cartão') && taxaSelecionadaObj) ? Number(taxaSelecionadaObj.valor || 0) : 0;
  const valorTaxaMaquininhaPdv = (totalLiquidoPdv * percentualTaxaPdv) / 100;

  const finalizarVendaPdv = async () => {
    if (carrinho.length === 0) return;
    setLoading(true);

    const custoChaves = carrinho.reduce((acc, i) => acc + (Number(i.custo) || 0) * Number(i.qtdVenda), 0);
    const custoTotalComTaxa = custoChaves + valorTaxaMaquininhaPdv;

    const resumoDesc = carrinho.map((i) => `${i.qtdVenda}x ${i.nome}`).join(', ');
    const linhasRecibo = carrinho.map((i) => `- ${i.qtdVenda}x ${i.nome}: R$ ${(Number(i.qtdVenda) * Number(i.precoEditado)).toFixed(2)}`).join('\n');
    const linhaDesconto = valorDescontoPdv > 0 ? `\n*Desconto aplicado:* -R$ ${valorDescontoPdv.toFixed(2)}` : '';

    const prefixoCliente = clientePdv.nome ? ` (${clientePdv.nome})` : '';
    const detalheForma = (formaPgto.includes('Cartão') && taxaSelecionadaObj) ? `${formaPgto} - ${taxaSelecionadaObj.nome}` : formaPgto;

    const novaTrans = {
      id: Date.now(),
      tipo: 'entrada',
      origem_caixa: 'faturado',
      desc: `PDV${prefixoCliente}: ${resumoDesc}${clientePdv.obs ? ` [${clientePdv.obs}]` : ''}`,
      valor: totalLiquidoPdv,
      custo_insumo: custoTotalComTaxa,
      forma: detalheForma,
      data: hojeStr,
      timestamp: Date.now(),
      unidade: unidadeOperacional
    };

    setTransacoes((prev) => [novaTrans, ...prev]);
    const { error } = await supabase.from('transacoes').insert([novaTrans]);
    if (error) {
      const { origem_caixa, ...transBasica } = novaTrans;
      const resFallback = await supabase.from('transacoes').insert([transBasica]);
      if (resFallback.error) {
        mostrarToast('Erro ao salvar venda: ' + resFallback.error.message, 'erro');
        setLoading(false);
        return;
      }
    }

    for (const item of carrinho) {
      if (item.tipoItem === 'estoque') {
        const novaQtd = Math.max(0, Number(item.qtd) - Number(item.qtdVenda));
        const novasVendas = Number(item.vendas_total || 0) + Number(item.qtdVenda);
        await supabase.from('estoque').update({ qtd: novaQtd, vendas_total: novasVendas }).eq('id', item.id);
      }
    }

    if (clientePdv.nome) {
      await garantirCadastroCliente(clientePdv.nome, clientePdv.tel, '', `Compra PDV: ${resumoDesc}`);
    }

    setComprovanteAtivo({
      origem: 'Venda no Balcao (PDV)',
      cliente: clientePdv.nome || '',
      tel: clientePdv.tel || '',
      itensTexto: `${linhasRecibo}${linhaDesconto}`,
      total: totalLiquidoPdv,
      forma: detalheForma,
      obs: clientePdv.obs || '',
      garantia: '90 dias',
      unidade: unidadeOperacional
    });

    setCarrinho([]);
    setDescontoPdv('');
    setClientePdv({ nome: '', tel: '', obs: '' });
    setComandaMobileAberta(false);
    mostrarToast(`Venda de R$ ${totalLiquidoPdv.toFixed(2)} registrada!`);
    await carregarDados(true);
    setLoading(false);
  };

  finalizarVendaRef.current = finalizarVendaPdv;

  const listaServicosBase = tabelaPrecos.filter((t) => t.grupo === 'servico');
  const listaPecasTabela = tabelaPrecos.filter((t) => t.grupo === 'peca');
  const listaAdicionais = tabelaPrecos.filter((t) => t.grupo === 'adicional');

  const servicoBaseSel = listaServicosBase.find((s) => s.id.toString() === calcServicoId.toString());
  const pecaTabelaSel = listaPecasTabela.find((p) => p.id.toString() === calcPecaId.toString());
  const pecaEstoqueSel = estoqueUnidade.find((e) => e.id.toString() === calcEstoqueId.toString());

  const valorBaseCalc = (Number(servicoBaseSel?.valor || 0)) + (Number(pecaTabelaSel?.valor || 0)) + (Number(pecaEstoqueSel?.venda || 0)) + Number(calcValorExtraManual || 0);

  const valorAdicionaisCalc = calcAdicionaisIds.reduce((acc, idAd) => {
    const ad = listaAdicionais.find((a) => a.id === idAd);
    if (!ad) return acc;
    if (ad.tipo_valor === 'percentual') {
      return acc + (valorBaseCalc * Number(ad.valor)) / 100;
    }
    return acc + Number(ad.valor);
  }, 0);

  const subtotalSimulador = valorBaseCalc + valorAdicionaisCalc;
  const taxaSimuladorObj = taxasCartaoDisponiveis.find((t) => t.id.toString() === calcTaxaId.toString());
  const percTaxaSimulador = taxaSimuladorObj ? Number(taxaSimuladorObj.valor || 0) : 0;

  const totalFinalSimulador = (calcRepassarTaxa && percTaxaSimulador > 0 && percTaxaSimulador < 100)
    ? subtotalSimulador / (1 - percTaxaSimulador / 100)
    : subtotalSimulador;

  const montarResumoSimulador = () => {
    const partes = [];
    if (servicoBaseSel) partes.push(servicoBaseSel.nome);
    if (pecaTabelaSel) partes.push(`${pecaTabelaSel.nome} (${pecaTabelaSel.marca})`);
    if (pecaEstoqueSel) partes.push(pecaEstoqueSel.nome);
    calcAdicionaisIds.forEach((idAd) => {
      const ad = listaAdicionais.find((a) => a.id === idAd);
      if (ad) partes.push(ad.nome);
    });
    return partes.join(' + ') || 'Servico Personalizado';
  };

  const salvarSimuladorEmStandby = async (enviarNoZap = false) => {
    if (totalFinalSimulador <= 0) {
      mostrarToast('Selecione um serviço ou peça primeiro.', 'erro');
      return;
    }
    if (enviarNoZap && !calcCliente.tel.replace(/\D/g, '')) {
      mostrarToast('Digite o WhatsApp do cliente com DDD.', 'erro');
      return;
    }

    const resumo = montarResumoSimulador();
    const obsTexto = [
      calcCliente.endereco ? `Endereco: ${calcCliente.endereco}` : '',
      taxaSimuladorObj ? `Opcao Cartao: ${taxaSimuladorObj.nome}` : '',
      'Validade: 7 dias.'
    ].filter(Boolean).join(' | ');

    const novoOrcCompleto = {
      id: Date.now(),
      cliente: calcCliente.nome || 'Cliente Cotacao',
      tel: calcCliente.tel || '',
      endereco: calcCliente.endereco || '',
      itens: [{ desc: resumo, qtd: 1, valor: Number(totalFinalSimulador.toFixed(2)) }],
      total: Number(totalFinalSimulador.toFixed(2)),
      obs: obsTexto,
      status: 'standby',
      data: hojeStr,
      unidade: unidadeOperacional
    };

    const { error } = await supabase.from('orcamentos').insert([novoOrcCompleto]);
    if (error) {
      const { endereco, ...orcBasico } = novoOrcCompleto;
      await supabase.from('orcamentos').insert([orcBasico]);
    }

    if (calcCliente.nome) {
      await garantirCadastroCliente(calcCliente.nome, calcCliente.tel, calcCliente.endereco, `Orcamento em standby: ${resumo}`);
    }

    if (enviarNoZap) {
      const infoParcela = taxaSimuladorObj ? `\n*No Cartao (${taxaSimuladorObj.nome}):* R$ ${totalFinalSimulador.toFixed(2)}` : '';
      const linhaEnd = calcCliente.endereco ? `\n*Endereco do Servico:* ${calcCliente.endereco}` : '';
      const texto = [
        `*LUISINHO CHAVEIRO - ORCAMENTO*`,
        `*Unidade:* ${infoUnidadeAtual.nome}`,
        `*Local:* ${infoUnidadeAtual.endereco}`,
        `*Cliente:* ${novoOrcCompleto.cliente}${linhaEnd}`,
        `----------------------------------`,
        `*Servico cotado:*`,
        `- ${resumo}`,
        `----------------------------------`,
        `*Valor a vista (Pix/Dinheiro):* R$ ${subtotalSimulador.toFixed(2)}${infoParcela}`,
        ``,
        `_Seu orcamento ficou salvo em nosso sistema! Podemos confirmar?_`
      ].join('\n');

      abrirWhatsAppSeguro(calcCliente.tel, texto);
    }

    mostrarToast('Cotação salva na fila de Standby!');
    setCalcCliente({ nome: '', tel: '', endereco: '' });
    carregarDados(true);
  };

  const enviarSimuladorParaPDV = () => {
    if (totalFinalSimulador <= 0) return;
    adicionarServicoAvulsoPdv(montarResumoSimulador(), Number(totalFinalSimulador.toFixed(2)));
    if (calcEstoqueId && pecaEstoqueSel) {
      adicionarAoCarrinho(pecaEstoqueSel);
    }
    if (calcCliente.nome || calcCliente.tel) {
      setClientePdv({ ...clientePdv, nome: calcCliente.nome, tel: calcCliente.tel });
    }
    setAbaAtiva('pdv');
  };

  const enviarSimuladorParaOS = () => {
    if (totalFinalSimulador <= 0) return;
    const itensIniciais = pecaEstoqueSel
      ? [{ id: pecaEstoqueSel.id, nome: pecaEstoqueSel.nome, qtd: 1, custo: Number(pecaEstoqueSel.custo || 0) }]
      : [];
    setNovaOS({
      ...novaOS,
      cliente: calcCliente.nome || novaOS.cliente,
      tel: calcCliente.tel || novaOS.tel,
      endereco: calcCliente.endereco || novaOS.endereco,
      desc: montarResumoSimulador(),
      valor: totalFinalSimulador.toFixed(2),
      itens_usados: itensIniciais
    });
    toggleForm('os', true);
    setAbaAtiva('os');
  };

  const salvarItemTabelaPrecos = async (e) => {
    e.preventDefault();
    if (!novoItemTabela.nome || novoItemTabela.valor === '' || Number(novoItemTabela.valor) < 0) return;
    const item = {
      id: novoItemTabela.id || Date.now(),
      grupo: novoItemTabela.grupo,
      nome: novoItemTabela.nome,
      marca: novoItemTabela.marca || '',
      tipo_valor: novoItemTabela.tipo_valor,
      valor: Number(novoItemTabela.valor)
    };
    await supabase.from('tabela_precos').upsert([item]);
    setNovoItemTabela({ id: null, grupo: 'servico', nome: '', marca: '', tipo_valor: 'fixo', valor: '' });
    mostrarToast('Item salvo na tabela de preços!');
    carregarDados(true);
  };

  const excluirItemTabelaPrecos = async (id) => {
    if (!window.confirm('Excluir este item da tabela?')) return;
    await supabase.from('tabela_precos').delete().eq('id', id);
    mostrarToast('Item removido da tabela.');
    carregarDados(true);
  };

  const salvarNovaChave = async (e) => {
    e.preventDefault();
    if (!novaChave.nome) return;
    const idFinal = novaChave.id.trim() || `CH-${Date.now().toString().slice(-4)}`;
    const itemExistente = estoque.find((i) => i.id === idFinal);

    const novoItem = {
      id: idFinal,
      nome: novaChave.nome,
      cat: novaChave.cat,
      qtd: Math.max(0, Number(novaChave.qtd || 0)),
      minimo: Math.max(0, Number(novaChave.minimo || 3)),
      custo: Math.max(0, Number(novaChave.custo || 0)),
      venda: Math.max(0, Number(novaChave.venda || 0)),
      vendas_total: itemExistente ? Number(itemExistente.vendas_total || 0) : 0,
      unidade: editandoEstoqueId ? (itemExistente?.unidade || unidadeOperacional) : unidadeOperacional
    };

    const { error } = await supabase.from('estoque').upsert([novoItem]);
    if (error) {
      mostrarToast('Erro ao salvar no estoque: ' + error.message, 'erro');
      return;
    }

    setNovaChave({ id: '', nome: '', cat: 'Yale / Comum', qtd: 10, minimo: 3, custo: '', venda: '' });
    setEditandoEstoqueId(null);
    toggleForm('estoque', false);
    mostrarToast('Estoque atualizado!');
    carregarDados(true);
  };

  const iniciarEdicaoEstoque = (item) => {
    setEditandoEstoqueId(item.id);
    setNovaChave({
      id: item.id,
      nome: item.nome,
      cat: item.cat,
      qtd: item.qtd,
      minimo: item.minimo || 3,
      custo: item.custo || 0,
      venda: item.venda || 0
    });
    toggleForm('estoque', true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicaoEstoque = () => {
    setEditandoEstoqueId(null);
    setNovaChave({ id: '', nome: '', cat: 'Yale / Comum', qtd: 10, minimo: 3, custo: '', venda: '' });
  };

  const alterarQtdEstoque = async (item, delta) => {
    const novaQtd = Math.max(0, Number(item.qtd) + delta);
    await supabase.from('estoque').update({ qtd: novaQtd }).eq('id', item.id);
    carregarDados(true);
  };

  const excluirItemEstoque = async (id) => {
    if (!window.confirm('Remover este item do estoque?')) return;
    await supabase.from('estoque').delete().eq('id', id);
    mostrarToast('Item removido do estoque.');
    carregarDados(true);
  };

  const itensEstoqueBaixo = estoqueUnidade.filter((i) => Number(i.qtd) <= Number(i.minimo || 3));
  const gerarPedidoDistribuidorWhatsApp = () => {
    if (itensEstoqueBaixo.length === 0) return;
    const linhas = itensEstoqueBaixo.map((i) => {
      const sugerido = Math.max(5, Number(i.minimo || 3) * 3 - Number(i.qtd));
      return `- [${i.id}] ${i.nome} (Atual: ${i.qtd} un) -> Pedir: *${sugerido} un*`;
    }).join('\n');
    const texto = `*PEDIDO DE REPOSICAO - LUISINHO CHAVEIRO (${infoUnidadeAtual.nome})*\nOla! Gostaria de pedir os seguintes itens:\n\n${linhas}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`, '_blank');
  };

  const estoqueFiltrado = estoqueUnidade.filter((item) => {
    const bateBusca = item.nome.toLowerCase().includes(buscaEstoque.toLowerCase()) || item.id.toLowerCase().includes(buscaEstoque.toLowerCase());
    const bateCat = filtroCatEstoque === 'Todas' || item.cat === filtroCatEstoque;
    const bateBaixo = !apenasEstoqueBaixo || Number(item.qtd) <= Number(item.minimo || 3);
    return bateBusca && bateCat && bateBaixo;
  });

  const topChavesMaisVendidas = [...estoqueUnidade]
    .filter((i) => Number(i.vendas_total || 0) > 0)
    .sort((a, b) => Number(b.vendas_total || 0) - Number(a.vendas_total || 0))
    .slice(0, 5);

  const capitalTotalEstoque = estoqueUnidade.reduce((acc, i) => acc + Number(i.custo || 0) * Number(i.qtd || 0), 0);
  const potencialVendaEstoque = estoqueUnidade.reduce((acc, i) => acc + Number(i.venda || 0) * Number(i.qtd || 0), 0);

  const adicionarMaterialNaOS = () => {
    if (!itemTempOS.chave_id) return;
    const ch = estoqueUnidade.find((e) => e.id === itemTempOS.chave_id);
    if (!ch) return;
    const novoMat = {
      id: ch.id,
      nome: ch.nome,
      qtd: Math.max(1, Number(itemTempOS.qtd || 1)),
      custo: Number(ch.custo || 0),
      venda: Number(ch.venda || 0)
    };
    setNovaOS({ ...novaOS, itens_usados: [...novaOS.itens_usados, novoMat] });
    setItemTempOS({ chave_id: '', qtd: 1 });
  };

  const removerMaterialDaOS = (idx) => {
    setNovaOS({ ...novaOS, itens_usados: novaOS.itens_usados.filter((_, i) => i !== idx) });
  };

  const criarOS = async (e, encaminharAoFuncionario = false) => {
    if (e) e.preventDefault();
    if (!novaOS.cliente || !novaOS.desc || novaOS.valor === '' || Number(novaOS.valor) < 0) {
      mostrarToast('Preencha Cliente, Descrição e um Valor válido.', 'erro');
      return;
    }

    const funcObj = novaOS.funcionario_id
      ? funcionarios.find((f) => f.id.toString() === novaOS.funcionario_id.toString())
      : funcionarioPadraoUnidade;

    const custoTotalMateriais = novaOS.itens_usados.reduce((acc, m) => acc + Number(m.custo || 0) * Number(m.qtd || 1), 0);
    const detalheTecnico = [
      novaOS.garantia ? `Garantia: ${novaOS.garantia}` : '',
      novaOS.obs_tecnica ? `Obs: ${novaOS.obs_tecnica}` : ''
    ].filter(Boolean).join(' | ');

    const descCompleta = detalheTecnico ? `${novaOS.desc} (${detalheTecnico})` : novaOS.desc;

    const itemOSCompleto = {
      id: Date.now(),
      cliente: novaOS.cliente.trim(),
      tel: (novaOS.tel || '').trim(),
      endereco: (novaOS.endereco || '').trim(),
      desc: descCompleta,
      valor: Number(novaOS.valor),
      custo_insumo: custoTotalMateriais,
      chave_id: novaOS.itens_usados[0]?.id || null,
      qtd_copias: novaOS.itens_usados[0]?.qtd || 0,
      itens_usados: novaOS.itens_usados,
      forma_pgto: novaOS.forma_pgto || 'Receber na Entrega',
      funcionario_nome: funcObj?.nome || '',
      funcionario_tel: funcObj?.tel || '',
      status: 'pendente',
      data: hojeStr,
      unidade: unidadeOperacional
    };

    const { error } = await supabase.from('ordens_servico').insert([itemOSCompleto]);
    if (error) {
      const itemOSBasico = {
        id: itemOSCompleto.id,
        cliente: itemOSCompleto.cliente,
        tel: itemOSCompleto.tel,
        desc: `${itemOSCompleto.desc}${itemOSCompleto.endereco ? ` | End: ${itemOSCompleto.endereco}` : ''}`,
        valor: itemOSCompleto.valor,
        custo_insumo: itemOSCompleto.custo_insumo,
        chave_id: itemOSCompleto.chave_id,
        qtd_copias: itemOSCompleto.qtd_copias,
        status: 'pendente',
        data: itemOSCompleto.data
      };
      await supabase.from('ordens_servico').insert([itemOSBasico]);
    }

    await garantirCadastroCliente(itemOSCompleto.cliente, itemOSCompleto.tel, itemOSCompleto.endereco, `OS: ${descCompleta}`);

    if (encaminharAoFuncionario) {
      enviarDiretoParaFuncionario('os', itemOSCompleto);
    }

    setNovaOS({
      cliente: '', tel: '', endereco: '', desc: '', valor: '',
      forma_pgto: 'Receber na Entrega (Pix/Cartão)',
      garantia: '90 dias', obs_tecnica: '',
      funcionario_id: '',
      itens_usados: []
    });
    toggleForm('os', false);
    mostrarToast('Ordem de Serviço emitida!');
    carregarDados(true);
  };

  const concluirOS = async (os, formaRecebimento = 'Pix') => {
    if (os.status === 'concluida') return;
    await supabase.from('ordens_servico').update({ status: 'concluida' }).eq('id', os.id);

    const listaMat = Array.isArray(os.itens_usados) && os.itens_usados.length > 0
      ? os.itens_usados
      : (os.chave_id ? [{ id: os.chave_id, nome: os.chave_id, qtd: Number(os.qtd_copias || 1) }] : []);

    const textoMateriais = listaMat.length > 0
      ? ` [Mat: ${listaMat.map((m) => `${m.qtd}x ${m.nome || m.id}`).join(', ')}]`
      : '';

    const novaTrans = {
      id: Date.now(),
      tipo: 'entrada',
      origem_caixa: 'faturado',
      desc: `OS Nº ${os.id.toString().slice(-4)} (${os.cliente}): ${os.desc}${textoMateriais}`,
      valor: Number(os.valor),
      custo_insumo: Number(os.custo_insumo || 0),
      forma: formaRecebimento,
      data: hojeStr,
      timestamp: Date.now(),
      unidade: os.unidade || unidadeOperacional
    };
    const resTrans = await supabase.from('transacoes').insert([novaTrans]);
    if (resTrans.error) {
      const { origem_caixa, ...transBasica } = novaTrans;
      await supabase.from('transacoes').insert([transBasica]);
    }

    for (const mat of listaMat) {
      const chaveUsada = estoque.find((c) => c.id === mat.id);
      if (chaveUsada) {
        const novaQtd = Math.max(0, Number(chaveUsada.qtd) - Number(mat.qtd || 1));
        const novasVendas = Number(chaveUsada.vendas_total || 0) + Number(mat.qtd || 1);
        await supabase.from('estoque').update({ qtd: novaQtd, vendas_total: novasVendas }).eq('id', chaveUsada.id);
      }
    }

    await garantirCadastroCliente(os.cliente, os.tel, os.endereco || '', `OS Concluida: ${os.desc}`);

    const linhasReciboOS = [
      `- Servico: ${os.desc}`,
      ...listaMat.map((m) => `- Material: ${m.qtd}x ${m.nome || m.id}`)
    ].join('\n');

    setComprovanteAtivo({
      origem: `Ordem de Servico Nº ${os.id.toString().slice(-4)}`,
      cliente: os.cliente,
      tel: os.tel || '',
      itensTexto: linhasReciboOS,
      total: os.valor,
      forma: formaRecebimento,
      obs: os.endereco ? `Local: ${os.endereco}` : '',
      garantia: '90 dias',
      unidade: os.unidade || unidadeOperacional
    });

    mostrarToast('OS concluída e lançada no caixa!');
    carregarDados(true);
  };

  const excluirOS = async (id) => {
    if (!window.confirm('Excluir esta Ordem de Serviço?')) return;
    await supabase.from('ordens_servico').delete().eq('id', id);
    mostrarToast('OS excluída.');
    carregarDados(true);
  };

  const adicionarMaterialNoSocorro = () => {
    if (!itemTempAg.chave_id) return;
    const ch = estoqueUnidade.find((e) => e.id === itemTempAg.chave_id);
    if (!ch) return;
    const novoMat = {
      id: ch.id,
      nome: ch.nome,
      qtd: Math.max(1, Number(itemTempAg.qtd || 1)),
      custo: Number(ch.custo || 0)
    };
    setNovoAgendamento({ ...novoAgendamento, itens_usados: [...novoAgendamento.itens_usados, novoMat] });
    setItemTempAg({ chave_id: '', qtd: 1 });
  };

  const removerMaterialDoSocorro = (idx) => {
    setNovoAgendamento({ ...novoAgendamento, itens_usados: novoAgendamento.itens_usados.filter((_, i) => i !== idx) });
  };

  const criarAgendamento = async (e, encaminharAoFuncionario = false) => {
    if (e) e.preventDefault();
    if (!novoAgendamento.cliente || !novoAgendamento.endereco || !novoAgendamento.servico) {
      mostrarToast('Preencha Cliente, Endereço e Serviço.', 'erro');
      return;
    }

    const funcObj = novoAgendamento.funcionario_id
      ? funcionarios.find((f) => f.id.toString() === novoAgendamento.funcionario_id.toString())
      : funcionarioPadraoUnidade;

    const custoMateriais = novoAgendamento.itens_usados.reduce((acc, m) => acc + Number(m.custo || 0) * Number(m.qtd || 1), 0);

    const itemAg = {
      id: Date.now(),
      cliente: novoAgendamento.cliente.trim(),
      tel: (novoAgendamento.tel || '').trim(),
      endereco: novoAgendamento.endereco.trim(),
      servico: novoAgendamento.servico.trim(),
      data: novoAgendamento.data || hojeISO,
      hora: novoAgendamento.hora || '14:00',
      taxa_deslocamento: Math.max(0, Number(novoAgendamento.taxa_deslocamento || 0)),
      valor_estimado: Math.max(0, Number(novoAgendamento.valor_estimado || 0)),
      custo_insumo: custoMateriais,
      itens_usados: novoAgendamento.itens_usados,
      funcionario_nome: funcObj?.nome || '',
      funcionario_tel: funcObj?.tel || '',
      status: 'agendado',
      unidade: unidadeOperacional
    };

    const { error } = await supabase.from('agendamentos').insert([itemAg]);
    if (error) {
      const itemAgBasico = {
        id: itemAg.id,
        cliente: itemAg.cliente,
        tel: itemAg.tel,
        endereco: itemAg.endereco,
        servico: itemAg.servico,
        data: itemAg.data,
        hora: itemAg.hora,
        taxa_deslocamento: itemAg.taxa_deslocamento,
        valor_estimado: itemAg.valor_estimado,
        status: 'agendado'
      };
      await supabase.from('agendamentos').insert([itemAgBasico]);
    }

    await garantirCadastroCliente(itemAg.cliente, itemAg.tel, itemAg.endereco, `Socorro: ${itemAg.servico}`);

    if (encaminharAoFuncionario) {
      enviarDiretoParaFuncionario('socorro', itemAg);
    }

    setNovoAgendamento({ cliente: '', tel: '', endereco: '', servico: '', data: '', hora: '', taxa_deslocamento: 0, valor_estimado: 80, funcionario_id: '', itens_usados: [] });
    toggleForm('agenda', false);
    mostrarToast('Socorro agendado!');
    carregarDados(true);
  };

  const concluirAgendamento = async (ag, formaRecebimento = 'Pix') => {
    await supabase.from('agendamentos').update({ status: 'concluido' }).eq('id', ag.id);

    const listaMat = Array.isArray(ag.itens_usados) ? ag.itens_usados : [];
    const valorTotalSocorro = Number(ag.valor_estimado) + Number(ag.taxa_deslocamento);

    const novaTrans = {
      id: Date.now(),
      tipo: 'entrada',
      origem_caixa: 'faturado',
      desc: `Socorro (${ag.cliente}): ${ag.servico} - End: ${ag.endereco}`,
      valor: valorTotalSocorro,
      custo_insumo: Number(ag.custo_insumo || 0),
      forma: formaRecebimento,
      data: hojeStr,
      timestamp: Date.now(),
      unidade: ag.unidade || unidadeOperacional
    };
    const resTrans = await supabase.from('transacoes').insert([novaTrans]);
    if (resTrans.error) {
      const { origem_caixa, ...transBasica } = novaTrans;
      await supabase.from('transacoes').insert([transBasica]);
    }

    for (const mat of listaMat) {
      const chaveUsada = estoque.find((c) => c.id === mat.id);
      if (chaveUsada) {
        const novaQtd = Math.max(0, Number(chaveUsada.qtd) - Number(mat.qtd || 1));
        const novasVendas = Number(chaveUsada.vendas_total || 0) + Number(mat.qtd || 1);
        await supabase.from('estoque').update({ qtd: novaQtd, vendas_total: novasVendas }).eq('id', chaveUsada.id);
      }
    }

    await garantirCadastroCliente(ag.cliente, ag.tel, ag.endereco, `Socorro concluido: ${ag.servico}`);

    const linhasReciboSocorro = [
      `- Atendimento Externo: ${ag.servico}`,
      `- Local: ${ag.endereco}`,
      ...listaMat.map((m) => `- Material aplicado: ${m.qtd}x ${m.nome || m.id}`)
    ].join('\n');

    setComprovanteAtivo({
      origem: `Atendimento de Socorro (${ag.cliente})`,
      cliente: ag.cliente,
      tel: ag.tel || '',
      itensTexto: linhasReciboSocorro,
      total: valorTotalSocorro,
      forma: formaRecebimento,
      obs: `Endereco atendido: ${ag.endereco}`,
      garantia: '90 dias',
      unidade: ag.unidade || unidadeOperacional
    });

    mostrarToast('Socorro finalizado e lançado no caixa!');
    carregarDados(true);
  };

  const excluirAgendamento = async (id) => {
    if (!window.confirm('Excluir este agendamento de socorro?')) return;
    await supabase.from('agendamentos').delete().eq('id', id);
    mostrarToast('Socorro excluído.');
    carregarDados(true);
  };

  const salvarCliente = async (e) => {
    e.preventDefault();
    if (!novoCliente.nome.trim()) return;

    const itemCli = {
      id: novoCliente.id || Date.now(),
      nome: novoCliente.nome.trim(),
      tel: (novoCliente.tel || '').trim(),
      endereco: (novoCliente.endereco || '').trim(),
      tipo: novoCliente.tipo || 'Residencial',
      obs: (novoCliente.obs || '').trim()
    };

    const { error } = await supabase.from('clientes').upsert([itemCli]);
    if (error) {
      mostrarToast('Erro ao salvar cliente: ' + error.message, 'erro');
      return;
    }

    const eraEdicao = Boolean(novoCliente.id);
    setNovoCliente({ id: null, nome: '', tel: '', endereco: '', tipo: 'Residencial', obs: '' });
    toggleForm('cliente', false);
    mostrarToast(eraEdicao ? 'Dados do cliente atualizados!' : 'Cliente cadastrado!');
    carregarDados(true);
  };

  const iniciarEdicaoCliente = (cli) => {
    setNovoCliente({
      id: cli.id,
      nome: cli.nome || '',
      tel: cli.tel || '',
      endereco: cli.endereco || '',
      tipo: cli.tipo || 'Residencial',
      obs: cli.obs || ''
    });
    toggleForm('cliente', true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicaoCliente = () => {
    setNovoCliente({ id: null, nome: '', tel: '', endereco: '', tipo: 'Residencial', obs: '' });
    toggleForm('cliente', false);
  };

  const excluirCliente = async (id) => {
    if (!window.confirm('Excluir cliente?')) return;
    await supabase.from('clientes').delete().eq('id', id);
    if (clienteHistoricoSelecionado?.id === id) setClienteHistoricoSelecionado(null);
    mostrarToast('Cliente removido.');
    carregarDados(true);
  };

  const adicionarTransacaoManual = async (e) => {
    e.preventDefault();
    if (!novaTransacao.desc || novaTransacao.valor === '' || Number(novaTransacao.valor) <= 0) {
      mostrarToast('Informe descrição e valor maior que zero.', 'erro');
      return;
    }

    const ehTroco = novaTransacao.origem_caixa === 'troco';
    const descLimpa = novaTransacao.desc.replace(/^\[TROCO\]\s*/i, '').trim();
    const descFinal = ehTroco ? `[TROCO] ${descLimpa}` : descLimpa;

    const itemTrans = {
      id: Date.now(),
      tipo: novaTransacao.tipo,
      origem_caixa: novaTransacao.origem_caixa,
      desc: descFinal,
      valor: Number(novaTransacao.valor),
      custo_insumo: 0,
      forma: ehTroco ? 'Dinheiro' : novaTransacao.forma,
      data: hojeStr,
      timestamp: Date.now(),
      unidade: unidadeOperacional
    };

    const { error } = await supabase.from('transacoes').insert([itemTrans]);
    if (error) {
      const { origem_caixa, ...transBasica } = itemTrans;
      const resFallback = await supabase.from('transacoes').insert([transBasica]);
      if (resFallback.error) {
        mostrarToast('Erro ao lançar no caixa: ' + resFallback.error.message, 'erro');
        return;
      }
    }
    setNovaTransacao({ tipo: 'saida', origem_caixa: 'faturado', desc: '', valor: '', forma: 'Dinheiro' });
    toggleForm('caixa', false);
    mostrarToast(ehTroco ? 'Movimentação registrada no Caixa de Troco!' : 'Lançamento registrado no Faturado!');
    carregarDados(true);
  };

  const reporTrocoAutomatico = async (valorFaltante) => {
    if (valorFaltante <= 0) return;
    if (!window.confirm(`Deseja repor R$ ${valorFaltante.toFixed(2)} para o Caixa de Troco (abatendo R$ ${valorFaltante.toFixed(2)} do dinheiro faturado)?`)) return;

    const agora = Date.now();
    const saidaFaturado = {
      id: agora,
      tipo: 'saida',
      origem_caixa: 'faturado',
      desc: 'Transferência para recompor Caixa de Troco',
      valor: Number(valorFaltante.toFixed(2)),
      custo_insumo: 0,
      forma: 'Dinheiro',
      data: hojeStr,
      timestamp: agora,
      unidade: unidadeOperacional
    };
    const entradaTroco = {
      id: agora + 1,
      tipo: 'entrada',
      origem_caixa: 'troco',
      desc: '[TROCO] Reposição do fundo de troco',
      valor: Number(valorFaltante.toFixed(2)),
      custo_insumo: 0,
      forma: 'Dinheiro',
      data: hojeStr,
      timestamp: agora + 1,
      unidade: unidadeOperacional
    };

    const { error } = await supabase.from('transacoes').insert([saidaFaturado, entradaTroco]);
    if (error) {
      const { origem_caixa: o1, ...b1 } = saidaFaturado;
      const { origem_caixa: o2, ...b2 } = entradaTroco;
      await supabase.from('transacoes').insert([b1, b2]);
    }
    mostrarToast(`Troco recomposto (+R$ ${valorFaltante.toFixed(2)})!`);
    carregarDados(true);
  };

  const salvarEdicaoTransacao = async () => {
    if (!transacaoEditando || !transacaoEditando.desc || transacaoEditando.valor === '' || Number(transacaoEditando.valor) < 0) return;

    const ehTroco = transacaoEditando.origem_caixa === 'troco';
    const descLimpa = transacaoEditando.desc.replace(/^\[TROCO\]\s*/i, '').trim();
    const descFinal = ehTroco ? `[TROCO] ${descLimpa}` : descLimpa;

    const atualizada = {
      tipo: transacaoEditando.tipo,
      origem_caixa: transacaoEditando.origem_caixa || 'faturado',
      desc: descFinal,
      valor: Number(transacaoEditando.valor),
      forma: ehTroco ? 'Dinheiro' : transacaoEditando.forma
    };

    const { error } = await supabase.from('transacoes').update(atualizada).eq('id', transacaoEditando.id);
    if (error) {
      const { origem_caixa, ...basica } = atualizada;
      const resFallback = await supabase.from('transacoes').update(basica).eq('id', transacaoEditando.id);
      if (resFallback.error) {
        mostrarToast('Erro ao editar movimentação.', 'erro');
        return;
      }
    }
    setTransacaoEditando(null);
    mostrarToast('Movimentação atualizada!');
    carregarDados(true);
  };

  const quitarPendenciaReceber = async (trans) => {
    await supabase.from('transacoes').update({ forma: 'Pix' }).eq('id', trans.id);
    mostrarToast('Fiado marcado como recebido!');
    carregarDados(true);
  };

  const excluirTransacao = async (id) => {
    if (!window.confirm('Deseja excluir este lançamento do caixa?')) return;
    await supabase.from('transacoes').delete().eq('id', id);
    mostrarToast('Lançamento excluído.');
    carregarDados(true);
  };

  const criarContaPagar = async (e) => {
    e.preventDefault();
    if (!novaConta.desc || !novaConta.valor || !novaConta.vencimento || Number(novaConta.valor) <= 0) return;
    const itemConta = {
      id: Date.now(),
      desc: novaConta.desc,
      valor: Number(novaConta.valor),
      vencimento: novaConta.vencimento,
      status: 'pendente',
      unidade: unidadeOperacional
    };
    const { error } = await supabase.from('contas_pagar').insert([itemConta]);
    if (error) {
      mostrarToast('Erro ao salvar boleto.', 'erro');
      return;
    }
    setNovaConta({ desc: '', valor: '', vencimento: '' });
    toggleForm('boleto', false);
    mostrarToast('Boleto agendado no calendário!');
    carregarDados(true);
  };

  const darBaixaBoleto = async (conta, debitarDoCaixa = false) => {
    if (conta.status === 'pago') return;
    await supabase.from('contas_pagar').update({ status: 'pago' }).eq('id', conta.id);

    if (debitarDoCaixa) {
      const novaTrans = {
        id: Date.now(),
        tipo: 'saida',
        origem_caixa: 'faturado',
        desc: `Pagamento Boleto/Conta: ${conta.desc}`,
        valor: Number(conta.valor),
        custo_insumo: 0,
        forma: 'Boleto',
        data: hojeStr,
        timestamp: Date.now(),
        unidade: conta.unidade || unidadeOperacional
      };
      const res = await supabase.from('transacoes').insert([novaTrans]);
      if (res.error) {
        const { origem_caixa, ...basica } = novaTrans;
        await supabase.from('transacoes').insert([basica]);
      }
      mostrarToast('Boleto pago e debitado do caixa!');
    } else {
      mostrarToast('Boleto quitado na agenda (sem mexer no caixa)!');
    }
    carregarDados(true);
  };

  const reabrirBoleto = async (conta) => {
    await supabase.from('contas_pagar').update({ status: 'pendente' }).eq('id', conta.id);
    mostrarToast('Boleto reaberto.');
    carregarDados(true);
  };

  const excluirContaPagar = async (id) => {
    if (!window.confirm('Excluir este boleto da agenda?')) return;
    await supabase.from('contas_pagar').delete().eq('id', id);
    mostrarToast('Boleto excluído.');
    carregarDados(true);
  };

  const exportarCSVRelatorio = () => {
    const cabecalho = 'Unidade;Data;Caixa;Tipo;Descricao;Forma Pagamento;Valor (R$);Custo Insumo/Taxa (R$)\n';
    const linhas = transacoesFiltradas.map((t) =>
      `${t.unidade || 'ponto1'};${t.data};${isMovimentacaoTroco(t) ? 'TROCO' : 'FATURADO'};${t.tipo.toUpperCase()};"${t.desc}";${t.forma};${Number(t.valor).toFixed(2).replace('.', ',')};${Number(t.custo_insumo || 0).toFixed(2).replace('.', ',')}`
    ).join('\n');
    const blob = new Blob([cabecalho + linhas], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `luisinho_chaveiro_${unidadeAtiva}_${filtroPeriodoCaixa}.csv`;
    link.click();
    mostrarToast('Planilha CSV baixada!');
  };

  const transacoesFiltradas = transacoesUnidade.filter((t) => {
    if (filtroPeriodoCaixa === 'todos') return true;
    if (filtroPeriodoCaixa === 'areceber') return t.forma === 'A Receber (Fiado)';
    if (filtroPeriodoCaixa === 'troco') return isMovimentacaoTroco(t);
    const hoje = new Date();
    if (filtroPeriodoCaixa === 'hoje') return t.data === hojeStr;
    if (filtroPeriodoCaixa === '7dias') {
      const diffDias = (Date.now() - Number(t.timestamp)) / (1000 * 60 * 60 * 24);
      return diffDias <= 7;
    }
    if (filtroPeriodoCaixa === 'mes') {
      const partes = (t.data || '').split('/');
      if (partes.length === 3) {
        return Number(partes[1]) === hoje.getMonth() + 1 && Number(partes[2]) === hoje.getFullYear();
      }
      return false;
    }
    return true;
  });

  const transacoesFaturado = transacoesFiltradas.filter((t) => !isMovimentacaoTroco(t));

  const totalEntradas = transacoesFaturado.filter((t) => t.tipo === 'entrada' && t.forma !== 'A Receber (Fiado)').reduce((acc, t) => acc + Number(t.valor), 0);
  const totalAReceber = transacoesUnidade.filter((t) => !isMovimentacaoTroco(t) && t.tipo === 'entrada' && t.forma === 'A Receber (Fiado)').reduce((acc, t) => acc + Number(t.valor), 0);
  const totalSaidasFaturado = transacoesFaturado.filter((t) => t.tipo === 'saida').reduce((acc, t) => acc + Number(t.valor), 0);
  const custoInsumosPeriodo = transacoesFaturado.filter((t) => t.tipo === 'entrada').reduce((acc, t) => acc + Number(t.custo_insumo || 0), 0);
  const saldoOperacionalFaturado = totalEntradas - totalSaidasFaturado;
  const lucroRealPeriodo = totalEntradas - totalSaidasFaturado - custoInsumosPeriodo;

  const todasTransacoesTrocoUnidade = transacoesUnidade.filter((t) => isMovimentacaoTroco(t));
  const entradasTrocoGeral = todasTransacoesTrocoUnidade.filter((t) => t.tipo === 'entrada').reduce((acc, t) => acc + Number(t.valor), 0);
  const saidasTrocoGeral = todasTransacoesTrocoUnidade.filter((t) => t.tipo === 'saida').reduce((acc, t) => acc + Number(t.valor), 0);
  const saldoTrocoAtual = fundoTrocoBase + entradasTrocoGeral - saidasTrocoGeral;
  const diferencaReposicaoTroco = Math.max(0, fundoTrocoBase - saldoTrocoAtual);

  const entradasPix = transacoesFaturado.filter((t) => t.tipo === 'entrada' && t.forma.includes('Pix')).reduce((acc, t) => acc + Number(t.valor), 0);
  const entradasDinheiro = transacoesFaturado.filter((t) => t.tipo === 'entrada' && t.forma.includes('Dinheiro')).reduce((acc, t) => acc + Number(t.valor), 0);
  const saidasDinheiroFaturado = transacoesFaturado.filter((t) => t.tipo === 'saida' && t.forma.includes('Dinheiro')).reduce((acc, t) => acc + Number(t.valor), 0);
  const liquidoDinheiroFaturado = entradasDinheiro - saidasDinheiroFaturado;
  const totalGavetaFisica = saldoTrocoAtual + liquidoDinheiroFaturado;
  const entradasCartao = transacoesFaturado.filter((t) => t.tipo === 'entrada' && t.forma.includes('Cartão')).reduce((acc, t) => acc + Number(t.valor), 0);

  const gerarTextoFechamentoDiario = () => {
    const transHoje = transacoesUnidade.filter((t) => t.data === hojeStr);
    const fatHoje = transHoje.filter((t) => !isMovimentacaoTroco(t));
    const trocoHoje = transHoje.filter((t) => isMovimentacaoTroco(t));

    const entHoje = fatHoje.filter((t) => t.tipo === 'entrada' && t.forma !== 'A Receber (Fiado)').reduce((acc, t) => acc + Number(t.valor), 0);
    const pixHoje = fatHoje.filter((t) => t.tipo === 'entrada' && t.forma.includes('Pix')).reduce((acc, t) => acc + Number(t.valor), 0);
    const dinHoje = fatHoje.filter((t) => t.tipo === 'entrada' && t.forma.includes('Dinheiro')).reduce((acc, t) => acc + Number(t.valor), 0);
    const cartHoje = fatHoje.filter((t) => t.tipo === 'entrada' && t.forma.includes('Cartão')).reduce((acc, t) => acc + Number(t.valor), 0);
    const fiadoHoje = fatHoje.filter((t) => t.tipo === 'entrada' && t.forma === 'A Receber (Fiado)').reduce((acc, t) => acc + Number(t.valor), 0);

    const saidasFatHojeLista = fatHoje.filter((t) => t.tipo === 'saida');
    const totalSaidasFatHoje = saidasFatHojeLista.reduce((acc, t) => acc + Number(t.valor), 0);
    const saidasDinFatHoje = saidasFatHojeLista.filter((t) => t.forma.includes('Dinheiro')).reduce((acc, t) => acc + Number(t.valor), 0);

    const movTrocoHojeLista = trocoHoje;
    const sangriaTrocoHoje = trocoHoje.filter((t) => t.tipo === 'saida').reduce((acc, t) => acc + Number(t.valor), 0);
    const repTrocoHoje = trocoHoje.filter((t) => t.tipo === 'entrada').reduce((acc, t) => acc + Number(t.valor), 0);

    const gavetaEsperadaHoje = saldoTrocoAtual + (dinHoje - saidasDinFatHoje);
    const contadoNum = dinheiroContadoFechamento !== '' ? Number(dinheiroContadoFechamento) : null;
    const quebraCaixa = contadoNum !== null ? contadoNum - gavetaEsperadaHoje : null;

    const detalhesSaidasFat = saidasFatHojeLista.length > 0
      ? saidasFatHojeLista.map((s) => `- ${s.desc} (${s.forma}): -R$ ${Number(s.valor).toFixed(2)}`).join('\n')
      : '- Nenhuma retirada do faturado';

    const detalhesTroco = movTrocoHojeLista.length > 0
      ? movTrocoHojeLista.map((m) => `- ${m.tipo === 'saida' ? 'Retirada' : 'Entrada'}: ${m.desc.replace(/^\[TROCO\]\s*/i, '')} (${m.tipo === 'saida' ? '-' : '+'}R$ ${Number(m.valor).toFixed(2)})`).join('\n')
      : '- Nenhuma movimentacao no troco hoje';

    const linhas = [
      `*FECHAMENTO DE CAIXA DIARIO - LUISINHO CHAVEIRO*`,
      `*Unidade:* ${unidadeAtiva === 'todas' ? 'Consolidado (2 Pontos)' : infoUnidadeAtual.nome}`,
      `*Data:* ${hojeStr} as ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      `==================================`,
      `*1. FATURAMENTO DO DIA (VENDAS / OS):*`,
      `- Pix: R$ ${pixHoje.toFixed(2)}`,
      `- Dinheiro: R$ ${dinHoje.toFixed(2)}`,
      `- Cartao: R$ ${cartHoje.toFixed(2)}`,
      `*Total Recebido:* R$ ${entHoje.toFixed(2)}`,
      fiadoHoje > 0 ? `- Fiado / A Receber hoje: R$ ${fiadoHoje.toFixed(2)}` : null,
      `----------------------------------`,
      `*2. RETIRADAS / DESPESAS DO FATURADO:*`,
      detalhesSaidasFat,
      `*Total Saidas Faturado:* -R$ ${totalSaidasFatHoje.toFixed(2)}`,
      `*Saldo Operacional do Dia:* R$ ${(entHoje - totalSaidasFatHoje).toFixed(2)}`,
      `----------------------------------`,
      `*3. CAIXA DE TROCO (BASE R$ ${fundoTrocoBase.toFixed(2)}):*`,
      detalhesTroco,
      `- Retiradas do Troco hoje: -R$ ${sangriaTrocoHoje.toFixed(2)}`,
      `- Reposicoes no Troco hoje: +R$ ${repTrocoHoje.toFixed(2)}`,
      `*Saldo Atual do Troco:* R$ ${saldoTrocoAtual.toFixed(2)}`,
      `----------------------------------`,
      `*4. CONFERENCIA DA GAVETA FISICA:*`,
      `- Troco Atual na Gaveta: R$ ${saldoTrocoAtual.toFixed(2)}`,
      `- Dinheiro Liquido Vendas: R$ ${(dinHoje - saidasDinFatHoje).toFixed(2)}`,
      `*Total Esperado na Gaveta:* R$ ${gavetaEsperadaHoje.toFixed(2)}`,
      contadoNum !== null ? `*Dinheiro Contado:* R$ ${contadoNum.toFixed(2)}` : null,
      quebraCaixa !== null ? `*Diferenca (Quebra/Sobra):* ${quebraCaixa >= 0 ? '+' : ''}R$ ${quebraCaixa.toFixed(2)}` : null,
      obsFechamento ? `\n*Obs:* ${obsFechamento}` : null
    ].filter(Boolean);

    return linhas.join('\n');
  };

  const registrarESalvarFechamento = async (acao = 'salvar') => {
    const relatorioTexto = gerarTextoFechamentoDiario();

    const novoFechamento = {
      id: Date.now(),
      data: hojeStr,
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      unidade: unidadeAtiva === 'todas' ? 'Todos os Pontos' : infoUnidadeAtual.nome,
      texto: relatorioTexto
    };

    const listaAtualizada = [novoFechamento, ...historicoFechamentos].slice(0, 30);
    setHistoricoFechamentos(listaAtualizada);
    localStorage.setItem('luisinho_fechamentos_caixa', JSON.stringify(listaAtualizada));

    if (acao === 'copiar') {
      try {
        await navigator.clipboard.writeText(relatorioTexto);
        mostrarToast('Relatório de fechamento copiado!');
      } catch {
        mostrarToast('Fechamento salvo no histórico!');
      }
    } else if (acao === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(relatorioTexto)}`, '_blank');
    } else {
      mostrarToast('Fechamento diário registrado no histórico!');
    }
  };

  const adicionarLinhaOrcamento = () => {
    setOrcamento({ ...orcamento, itens: [...orcamento.itens, { desc: '', qtd: 1, valor: 0 }] });
  };

  const removerLinhaOrcamento = (index) => {
    if (orcamento.itens.length <= 1) return;
    setOrcamento({ ...orcamento, itens: orcamento.itens.filter((_, i) => i !== index) });
  };

  const atualizarItemOrcamento = (index, campo, valor) => {
    const novosItens = [...orcamento.itens];
    novosItens[index][campo] = campo === 'qtd' || campo === 'valor' ? Math.max(0, Number(valor)) : valor;
    setOrcamento({ ...orcamento, itens: novosItens });
  };

  const totalOrcamento = orcamento.itens.reduce((acc, i) => acc + Number(i.qtd) * Number(i.valor), 0);

  const dispararTextoOrcamentoWhatsApp = (orcObj) => {
    const uniObj = unidadesConfig.find((u) => u.id === (orcObj.unidade || unidadeOperacional)) || infoUnidadeAtual;
    const listaItens = Array.isArray(orcObj.itens) ? orcObj.itens : [];
    const linhas = listaItens.map((i) => `- ${i.qtd}x ${i.desc}: R$ ${(Number(i.qtd) * Number(i.valor)).toFixed(2)}`).join('\n');

    const texto = [
      `*LUISINHO CHAVEIRO - ORCAMENTO*`,
      `----------------------------------`,
      `*Unidade:* ${uniObj.nome}`,
      `*Local Loja:* ${uniObj.endereco}`,
      `----------------------------------`,
      `*DADOS DO CLIENTE:*`,
      `*Cliente:* ${orcObj.cliente || 'Cliente'}${orcObj.tipo_cliente ? ` (${orcObj.tipo_cliente})` : ''}`,
      orcObj.tel ? `*Contato:* ${orcObj.tel}` : null,
      orcObj.endereco ? `*Endereco / Local:* ${orcObj.endereco}` : null,
      `----------------------------------`,
      `*ITENS / SERVICOS COTADOS:*`,
      linhas,
      `----------------------------------`,
      `*Valor Total:* R$ ${Number(orcObj.total).toFixed(2)}`,
      orcObj.forma_pgto ? `*Condicao / Pagamento:* ${orcObj.forma_pgto}` : null,
      `_${orcObj.obs || 'Validade: 7 dias.'}_`
    ].filter(Boolean).join('\n');

    abrirWhatsAppSeguro(orcObj.tel, texto);
  };

  const salvarOrcamentoStandby = async (enviarZap = false) => {
    const itensValidos = orcamento.itens.filter((i) => i.desc.trim() !== '');
    if (itensValidos.length === 0 || totalOrcamento <= 0) {
      mostrarToast('Adicione pelo menos 1 item com valor.', 'erro');
      return;
    }
    if (enviarZap && !(orcamento.tel || '').replace(/\D/g, '')) {
      mostrarToast('Preencha o WhatsApp do cliente com DDD.', 'erro');
      return;
    }

    const registroOrcCompleto = {
      id: orcamento.id || Date.now(),
      cliente: (orcamento.cliente || 'Cliente s/ Nome').trim(),
      tel: (orcamento.tel || '').trim(),
      endereco: (orcamento.endereco || '').trim(),
      tipo_cliente: orcamento.tipo_cliente || 'Residencial',
      forma_pgto: orcamento.forma_pgto || 'Pix / Dinheiro (À Vista)',
      itens: itensValidos,
      total: totalOrcamento,
      obs: orcamento.obs,
      status: 'standby',
      data: hojeStr,
      unidade: unidadeOperacional
    };

    const { error } = await supabase.from('orcamentos').upsert([registroOrcCompleto]);
    if (error) {
      const obsComDadosExtras = [
        registroOrcCompleto.endereco ? `End: ${registroOrcCompleto.endereco}` : '',
        registroOrcCompleto.tipo_cliente ? `Tipo: ${registroOrcCompleto.tipo_cliente}` : '',
        registroOrcCompleto.forma_pgto ? `Pgto: ${registroOrcCompleto.forma_pgto}` : '',
        registroOrcCompleto.obs
      ].filter(Boolean).join(' | ');

      const registroBasico = {
        id: registroOrcCompleto.id,
        cliente: registroOrcCompleto.cliente,
        tel: registroOrcCompleto.tel,
        itens: registroOrcCompleto.itens,
        total: registroOrcCompleto.total,
        obs: obsComDadosExtras,
        status: 'standby',
        data: registroOrcCompleto.data,
        unidade: registroOrcCompleto.unidade
      };
      await supabase.from('orcamentos').upsert([registroBasico]);
    }

    if (orcamento.cliente) {
      await garantirCadastroCliente(
        orcamento.cliente,
        orcamento.tel,
        orcamento.endereco,
        `Orcamento (${orcamento.tipo_cliente || 'Residencial'}): R$ ${totalOrcamento.toFixed(2)}`,
        orcamento.tipo_cliente || 'Residencial'
      );
    }

    if (enviarZap) {
      dispararTextoOrcamentoWhatsApp(registroOrcCompleto);
    }

    setOrcamento({
      id: null,
      cliente: '',
      tel: '',
      endereco: '',
      tipo_cliente: 'Residencial',
      forma_pgto: 'Pix / Dinheiro (À Vista)',
      itens: [{ desc: '', qtd: 1, valor: 0 }],
      obs: 'Validade: 7 dias. Garantia de 90 dias.'
    });
    toggleForm('orcamento', false);
    mostrarToast('Orçamento salvo em Standby!');
    carregarDados(true);
  };

  const carregarOrcamentoParaEdicao = (orc) => {
    const cliCadastrado = clientes.find((c) => c.nome.toLowerCase() === (orc.cliente || '').toLowerCase());
    setOrcamento({
      id: orc.id,
      cliente: orc.cliente,
      tel: orc.tel || cliCadastrado?.tel || '',
      endereco: orc.endereco || cliCadastrado?.endereco || '',
      tipo_cliente: orc.tipo_cliente || cliCadastrado?.tipo || 'Residencial',
      forma_pgto: orc.forma_pgto || 'Pix / Dinheiro (À Vista)',
      itens: Array.isArray(orc.itens) && orc.itens.length > 0 ? orc.itens : [{ desc: '', qtd: 1, valor: 0 }],
      obs: orc.obs || 'Validade: 7 dias. Garantia de 90 dias.'
    });
    toggleForm('orcamento', true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const aprovarOrcamentoVirarOS = async (orc) => {
    const listaItens = Array.isArray(orc.itens) ? orc.itens : [];
    const resumoItens = listaItens.map((i) => `${i.qtd}x ${i.desc}`).join(', ');
    const cliCadastrado = clientes.find((c) => c.nome.toLowerCase() === (orc.cliente || '').toLowerCase());
    const enderecoEscolhido = orc.endereco || cliCadastrado?.endereco || '';

    const itemOS = {
      id: Date.now(),
      cliente: orc.cliente || 'Cliente Orcamento',
      tel: orc.tel || cliCadastrado?.tel || '',
      endereco: enderecoEscolhido,
      desc: resumoItens || 'Servico aprovado via Orcamento',
      valor: Number(orc.total),
      custo_insumo: 0,
      itens_usados: [],
      forma_pgto: orc.forma_pgto || 'Receber na Entrega (Pix/Cartao)',
      funcionario_nome: funcionarioPadraoUnidade?.nome || '',
      funcionario_tel: funcionarioPadraoUnidade?.tel || '',
      status: 'pendente',
      data: hojeStr,
      unidade: orc.unidade || unidadeOperacional
    };

    const { error } = await supabase.from('ordens_servico').insert([itemOS]);
    if (error) {
      const itemOSBasico = {
        id: itemOS.id,
        cliente: itemOS.cliente,
        tel: itemOS.tel,
        desc: `${itemOS.desc}${enderecoEscolhido ? ` | End: ${enderecoEscolhido}` : ''}`,
        valor: itemOS.valor,
        custo_insumo: 0,
        status: 'pendente',
        data: itemOS.data
      };
      await supabase.from('ordens_servico').insert([itemOSBasico]);
    }

    await supabase.from('orcamentos').update({ status: 'aprovado' }).eq('id', orc.id);

    if (orc.cliente) {
      await garantirCadastroCliente(orc.cliente, orc.tel, enderecoEscolhido, `Orcamento aprovado -> OS: ${resumoItens}`);
    }
    mostrarToast('Orçamento aprovado e convertido em OS!');
    setAbaAtiva('os');
    carregarDados(true);
  };

  const excluirOrcamentoSalvo = async (id) => {
    if (!window.confirm('Remover este orçamento da lista?')) return;
    await supabase.from('orcamentos').delete().eq('id', id);
    mostrarToast('Orçamento excluído.');
    carregarDados(true);
  };

  const faturamentoHoje = transacoesUnidade
    .filter((t) => !isMovimentacaoTroco(t) && t.tipo === 'entrada' && t.data === hojeStr && t.forma !== 'A Receber (Fiado)')
    .reduce((acc, t) => acc + Number(t.valor), 0);

  const osPendentes = osUnidade.filter((o) => o.status !== 'concluida');
  const osConcluidas = osUnidade.filter((o) => o.status === 'concluida');
  const osExibidas = filtroStatusOS === 'pendente'
    ? osPendentes
    : filtroStatusOS === 'concluida'
    ? osConcluidas
    : osUnidade;

  const socorrosPendentes = agendaUnidade.filter((a) => a.status !== 'concluido');
  const socorrosConcluidos = agendaUnidade.filter((a) => a.status === 'concluido');
  const socorrosExibidos = filtroStatusAgenda === 'pendente'
    ? socorrosPendentes
    : filtroStatusAgenda === 'concluido'
    ? socorrosConcluidos
    : agendaUnidade;

  const boletosPendentes = contasUnidade.filter((c) => c.status === 'pendente');
  const orcamentosEmStandby = orcamentosUnidade.filter((o) => o.status === 'standby');

  const abasMenu = [
    { id: 'dashboard', label: 'Hoje', icon: LayoutDashboard },
    { id: 'pdv', label: 'PDV', icon: ShoppingCart },
    { id: 'simulador', label: 'Tabela/Calc', icon: Calculator },
    { id: 'os', label: `OS (${osPendentes.length})`, icon: Wrench },
    { id: 'agenda', label: `Socorros (${socorrosPendentes.length})`, icon: Calendar },
    { id: 'orcamento', label: `Orçamentos (${orcamentosEmStandby.length})`, icon: FileText },
    { id: 'caixa', label: 'Caixa/Boletos', icon: DollarSign },
    { id: 'estoque', label: 'Estoque', icon: Package },
    { id: 'clientes', label: 'Clientes', icon: Users },
  ];

  const renderComandaPDV = () => (
    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className={`font-bold flex items-center gap-2 ${temaUnidade.textoDestaque}`}>
            <ShoppingCart size={18} /> Comanda / Nota ({totalItensCarrinho})
          </h2>
          {comandaMobileAberta && (
            <button onClick={() => setComandaMobileAberta(false)} className="lg:hidden text-slate-400 p-1">
              <X size={20} />
            </button>
          )}
        </div>

        <div className="space-y-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Cliente (Salva automático)</span>
            {clientes.length > 0 && (
              <select
                onChange={(e) => {
                  const c = clientes.find((cli) => cli.id.toString() === e.target.value);
                  if (c) setClientePdv({ ...clientePdv, nome: c.nome, tel: c.tel || '' });
                }}
                defaultValue=""
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-300 max-w-[140px]"
              >
                <option value="" disabled>Puxar salvo...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            )}
          </div>
          <input
            type="text"
            placeholder="Nome / Referência (Ex: Seu Paulinho)"
            value={clientePdv.nome}
            onChange={(e) => setClientePdv({ ...clientePdv, nome: e.target.value })}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="tel"
              placeholder="WhatsApp (com DDD)"
              value={clientePdv.tel}
              onChange={(e) => setClientePdv({ ...clientePdv, tel: e.target.value })}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Obs / Placa / Fechadura"
              value={clientePdv.obs}
              onChange={(e) => setClientePdv({ ...clientePdv, obs: e.target.value })}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        {carrinho.length === 0 ? (
          <p className="text-slate-500 text-xs py-6 text-center">Toque nas chaves ou serviços para montar a nota.</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {carrinho.map((item, idx) => (
              <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-xs text-slate-100">{item.nome}</p>
                  <button
                    onClick={() => setCarrinho(carrinho.filter((_, i) => i !== idx))}
                    className="text-red-400 hover:text-red-300 p-0.5"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => alterarQtdItemCarrinho(idx, -1)} className="bg-slate-800 px-2.5 py-1 rounded font-bold">-</button>
                    <span className="px-1.5 font-bold">{item.qtdVenda}x</span>
                    <button type="button" onClick={() => alterarQtdItemCarrinho(idx, 1)} className="bg-slate-800 px-2.5 py-1 rounded font-bold">+</button>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 text-[11px]">Un R$:</span>
                    <input
                      type="number"
                      step="0.01"
                      value={item.precoEditado}
                      onChange={(e) => alterarPrecoItemCarrinho(idx, e.target.value)}
                      className="w-20 bg-slate-900 border border-amber-500/40 rounded px-2 py-1 text-xs font-bold text-amber-400 text-right"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-slate-800 pt-3 space-y-3">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="text-slate-400">Desconto na venda (R$):</span>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            value={descontoPdv}
            onChange={(e) => setDescontoPdv(e.target.value)}
            className="w-24 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-right text-red-400 font-bold"
          />
        </div>

        <div className="flex justify-between text-lg font-bold">
          <span>Total Final:</span>
          <span className="text-emerald-400">R$ {totalLiquidoPdv.toFixed(2)}</span>
        </div>

        <div className="space-y-2">
          <select
            value={formaPgto}
            onChange={(e) => setFormaPgto(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
          >
            <option>Pix</option>
            <option>Dinheiro</option>
            <option>Cartão de Débito</option>
            <option>Cartão de Crédito</option>
            <option>A Receber (Fiado)</option>
          </select>

          {formaPgto.includes('Cartão') && (
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
              <label className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                <CreditCard size={12} /> Modalidade / Parcelas da Maquininha:
              </label>
              <select
                value={taxaCartaoIdPdv}
                onChange={(e) => setTaxaCartaoIdPdv(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs"
              >
                <option value="">Sem desconto de taxa (0%)</option>
                {taxasCartaoDisponiveis.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome} — Taxa: {t.valor}% (-R$ {((totalLiquidoPdv * Number(t.valor)) / 100).toFixed(2)})
                  </option>
                ))}
              </select>
              {valorTaxaMaquininhaPdv > 0 && (
                <p className="text-[11px] text-slate-400">
                  Você recebe líquido: <strong className="text-emerald-400">R$ {(totalLiquidoPdv - valorTaxaMaquininhaPdv).toFixed(2)}</strong>
                </p>
              )}
            </div>
          )}
        </div>

        <button
          onClick={finalizarVendaPdv}
          disabled={carrinho.length === 0 || loading}
          className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-3.5 rounded-xl text-sm transition shadow"
        >
          Confirmar Venda & Gerar Comprovante
        </button>
      </div>
    </div>
  );
  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-32 md:pb-8 ${temaUnidade.bordaTopo}`}>
      {toast && (
        <div className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl shadow-2xl border text-xs font-bold flex items-center gap-2 transition-all ${
          toast.tipo === 'erro'
            ? 'bg-red-950 border-red-500 text-red-200'
            : 'bg-emerald-950 border-emerald-500 text-emerald-200'
        }`}>
          {toast.tipo === 'erro' ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
          <span>{toast.mensagem}</span>
        </div>
      )}

      <header className="bg-slate-900 border-b border-slate-800 px-3 py-2.5 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`${temaUnidade.logoBg} p-2 rounded-lg text-slate-950 font-bold shrink-0 transition-colors`}>
              <Wrench size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`font-bold text-base sm:text-lg leading-tight ${temaUnidade.textoDestaque}`}>Luisinho Chaveiro</h1>
                <span className={`text-[10px] border px-1.5 py-0.5 rounded font-mono ${temaUnidade.badge}`}>
                  v3.3
                </span>
              </div>
              {erroConexao ? (
                <span className="text-[11px] text-red-400 flex items-center gap-1">
                  <AlertCircle size={11} /> {erroConexao}
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 block truncate max-w-[200px] sm:max-w-xs">
                  {unidadeAtiva === 'todas' ? 'Visão Consolidada (2 Pontos)' : infoUnidadeAtual.endereco}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
              {unidadesConfig.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setUnidadeAtiva(u.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${
                    unidadeAtiva === u.id
                      ? (u.id === 'ponto2' ? 'bg-cyan-500 text-slate-950' : 'bg-amber-500 text-slate-950')
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {u.nome.split(' ')[0]} {u.nome.split(' ')[1]}
                </button>
              ))}
              <button
                onClick={() => setUnidadeAtiva('todas')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${
                  unidadeAtiva === 'todas' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Todos
              </button>
            </div>

            <button
              onClick={() => setModalConfigUnidades(true)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1"
              title="Cadastrar Funcionários, Endereços e Fundo de Troco"
            >
              <Settings size={14} /> Equipe / Lojas
            </button>
            <button
              onClick={() => carregarDados(false)}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-slate-300"
              title="Atualizar dados"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin text-amber-400' : ''} />
            </button>
          </div>
        </div>
      </header>

      {modalConfigUnidades && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 max-w-lg w-full space-y-5 my-8">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-amber-400 flex items-center gap-2">
                <UserCheck size={18} /> Equipe, Endereços & Fundo de Troco
              </h3>
              <button type="button" onClick={() => setModalConfigUnidades(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-sky-400">
                1. Funcionários Salvos (Ficam gravados para todas as OS)
              </h4>
              <form onSubmit={adicionarFuncionario} className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
                <input
                  type="text"
                  placeholder="Nome do Funcionário *"
                  required
                  value={novoFuncionario.nome}
                  onChange={(e) => setNovoFuncionario({ ...novoFuncionario, nome: e.target.value })}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs"
                />
                <input
                  type="tel"
                  placeholder="WhatsApp c/ DDD *"
                  required
                  value={novoFuncionario.tel}
                  onChange={(e) => setNovoFuncionario({ ...novoFuncionario, tel: e.target.value })}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs"
                />
                <div className="flex gap-1.5">
                  <select
                    value={novoFuncionario.unidade}
                    onChange={(e) => setNovoFuncionario({ ...novoFuncionario, unidade: e.target.value })}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-2 text-xs"
                  >
                    <option value="ponto1">Ponto 1</option>
                    <option value="ponto2">Ponto 2</option>
                  </select>
                  <button type="submit" className="bg-sky-500 text-slate-950 font-bold px-3 py-2 rounded-lg text-xs">
                    + Salvar
                  </button>
                </div>
              </form>

              {funcionarios.length === 0 ? (
                <p className="text-xs text-slate-500">Nenhum funcionário cadastrado ainda. Adicione acima para envio em 1 clique.</p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {funcionarios.map((f) => (
                    <div key={f.id} className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-slate-100">{f.nome}</strong>
                        <span className="text-slate-400 ml-2">WhatsApp: {f.tel}</span>
                        <span className="ml-2 text-[10px] bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded uppercase">{f.unidade}</span>
                      </div>
                      <button onClick={() => removerFuncionario(f.id)} className="text-red-400 p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={salvarConfigUnidades} className="space-y-3 border-t border-slate-800 pt-4">
              <h4 className="text-xs font-bold uppercase text-amber-400">
                2. Endereços & Fundo de Troco Fixo por Unidade
              </h4>
              {unidadesConfig.map((uni, idx) => (
                <div key={uni.id} className="space-y-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-xs font-bold text-amber-400 uppercase">{uni.id}</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Nome da Unidade"
                      value={uni.nome}
                      onChange={(e) => {
                        const copia = [...unidadesConfig];
                        copia[idx].nome = e.target.value;
                        setUnidadesConfig(copia);
                      }}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs"
                    />
                    <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5">
                      <span className="text-[11px] text-emerald-400 font-bold whitespace-nowrap">Troco R$:</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={uni.fundo_troco ?? 200}
                        onChange={(e) => {
                          const copia = [...unidadesConfig];
                          copia[idx].fundo_troco = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                          setUnidadesConfig(copia);
                        }}
                        className="w-full bg-transparent text-xs font-bold text-white outline-none"
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Endereço Completo"
                    value={uni.endereco}
                    onChange={(e) => {
                      const copia = [...unidadesConfig];
                      copia[idx].endereco = e.target.value;
                      setUnidadesConfig(copia);
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              ))}
              <button type="submit" className="w-full bg-amber-500 text-slate-950 font-bold py-2.5 rounded-lg text-sm">
                Salvar Configurações & Fechar
              </button>
            </form>
          </div>
        </div>
      )}

      {modalFechamentoCaixa && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 sm:p-5 max-w-xl w-full space-y-4 my-8 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-emerald-400 flex items-center gap-2 text-base">
                <ClipboardCheck size={20} /> Fechamento de Caixa Diário ({hojeStr})
              </h3>
              <button type="button" onClick={() => setModalFechamentoCaixa(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div>
                <label className="text-[11px] text-emerald-300 font-bold block mb-1">
                  Conferência Física: Dinheiro Contado na Gaveta (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={`Esperado: R$ ${totalGavetaFisica.toFixed(2)}`}
                  value={dinheiroContadoFechamento}
                  onChange={(e) => setDinheiroContadoFechamento(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-bold block mb-1">
                  Observação do Fechamento (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Tudo batendo / Troco ok"
                  value={obsFechamento}
                  onChange={(e) => setObsFechamento(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 max-h-64 overflow-y-auto">
              <pre className="text-xs text-slate-200 whitespace-pre-wrap font-mono leading-relaxed">
                {gerarTextoFechamentoDiario()}
              </pre>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => registrarESalvarFechamento('salvar')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700"
              >
                <Lock size={14} /> Salvar no Histórico
              </button>
              <button
                type="button"
                onClick={() => registrarESalvarFechamento('copiar')}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                <Copy size={14} /> Salvar & Copiar
              </button>
              <button
                type="button"
                onClick={() => registrarESalvarFechamento('whatsapp')}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                <Share2 size={14} /> Enviar WhatsApp
              </button>
            </div>

            {historicoFechamentos.length > 0 && (
              <div className="border-t border-slate-800 pt-3 space-y-2">
                <span className="text-[11px] font-bold uppercase text-slate-400 block">
                  Últimos Fechamentos Salvos ({historicoFechamentos.length})
                </span>
                <div className="max-h-32 overflow-y-auto space-y-1.5">
                  {historicoFechamentos.slice(0, 5).map((f) => (
                    <div key={f.id} className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-300">
                        <strong>{f.data}</strong> às {f.hora} • {f.unidade}
                      </span>
                      <button
                        type="button"
                        onClick={async () => {
                          try { await navigator.clipboard.writeText(f.texto); mostrarToast('Relatório antigo copiado!'); } catch {}
                        }}
                        className="text-amber-400 hover:underline font-semibold"
                      >
                        Copiar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <nav className="bg-slate-900 border-b border-slate-800 px-2 py-2 flex overflow-x-auto gap-1 sticky top-[57px] z-20 no-scrollbar">
        {abasMenu.map((aba) => {
          const Icone = aba.icon;
          return (
            <button
              key={aba.id}
              onClick={() => setAbaAtiva(aba.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                abaAtiva === aba.id 
                  ? `${temaUnidade.botaoAtivo} shadow` 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icone size={15} />
              {aba.label}
            </button>
          );
        })}
      </nav>

      {comprovanteAtivo && (
        <div className="max-w-6xl w-full mx-auto px-4 pt-4">
          <div className="bg-emerald-950/90 border-2 border-emerald-500 p-4 rounded-xl space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-bold block">
                  {comprovanteAtivo.origem} Finalizado!
                </span>
                <h3 className="font-bold text-base text-white">
                  Enviar Comprovante Luisinho Chaveiro — R$ {Number(comprovanteAtivo.total).toFixed(2)}
                </h3>
              </div>
              <button onClick={() => setComprovanteAtivo(null)} className="text-slate-300 hover:text-white p-1">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Nome do Cliente"
                value={comprovanteAtivo.cliente}
                onChange={(e) => setComprovanteAtivo({ ...comprovanteAtivo, cliente: e.target.value })}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white"
              />
              <input
                type="tel"
                placeholder="WhatsApp com DDD (Ex: 21999998888)"
                value={comprovanteAtivo.tel}
                onChange={(e) => setComprovanteAtivo({ ...comprovanteAtivo, tel: e.target.value })}
                className="bg-slate-950 border border-emerald-500 rounded-lg px-3 py-2.5 text-sm text-white font-semibold"
              />
              <button
                onClick={() => dispararComprovanteWhatsApp(comprovanteAtivo)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2"
              >
                <Share2 size={16} /> Enviar no WhatsApp Agora
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-4 space-y-5">
        {abaAtiva === 'dashboard' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div onClick={() => setAbaAtiva('caixa')} className="cursor-pointer bg-slate-900 hover:border-emerald-500/50 transition p-3.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">Caixa Hoje ({unidadeAtiva === 'todas' ? '2 Pontos' : infoUnidadeAtual.nome.split(' ')[0]})</span>
                <p className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">R$ {faturamentoHoje.toFixed(2)}</p>
                <span className="text-[10px] text-slate-400">Troco atual: R$ {saldoTrocoAtual.toFixed(2)}</span>
              </div>

              <div onClick={() => setAbaAtiva('os')} className="cursor-pointer bg-slate-900 hover:border-amber-500/50 transition p-3.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">OS em Aberto</span>
                <p className="text-xl sm:text-2xl font-bold text-amber-400 mt-1">{osPendentes.length} serviço(s)</p>
              </div>

              <div onClick={() => setAbaAtiva('orcamento')} className="cursor-pointer bg-slate-900 hover:border-sky-500/50 transition p-3.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">Orçamentos em Standby</span>
                <p className="text-xl sm:text-2xl font-bold text-sky-400 mt-1">{orcamentosEmStandby.length} aguardando</p>
              </div>

              <div onClick={() => { setAbaAtiva('caixa'); setFiltroPeriodoCaixa('areceber'); }} className="cursor-pointer bg-slate-900 hover:border-purple-500/50 transition p-3.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">Fiado / A Receber</span>
                <p className="text-xl sm:text-2xl font-bold text-purple-400 mt-1">R$ {totalAReceber.toFixed(2)}</p>
              </div>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <h2 className={`font-bold text-sm mb-3 flex items-center gap-1.5 ${temaUnidade.textoDestaque}`}>
                <Zap size={16} /> Atalhos Rápidos ({infoUnidadeAtual.nome})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                <button onClick={() => setAbaAtiva('pdv')} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5">
                  <ShoppingCart size={16} /> Venda Balcão
                </button>
                <button onClick={() => setAbaAtiva('simulador')} className={`${temaUnidade.botaoAtivo} font-bold py-3 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5`}>
                  <Calculator size={16} /> Simular Preço
                </button>
                <button onClick={() => { setAbaAtiva('os'); toggleForm('os', true); }} className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold py-3 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700">
                  <Wrench size={16} /> Emitir OS
                </button>
                <button onClick={() => { setAbaAtiva('orcamento'); toggleForm('orcamento', true); }} className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold py-3 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700">
                  <FolderClock size={16} /> Orçamento
                </button>
                <button
                  onClick={() => setModalFechamentoCaixa(true)}
                  className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
                >
                  <ClipboardCheck size={16} /> Fechar Caixa
                </button>
                <button
                  onClick={() => abrirPortalNFSe()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
                >
                  <Receipt size={16} /> Emitir NFS-e <ExternalLink size={12} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className={`font-bold text-sm flex items-center gap-2 ${temaUnidade.textoDestaque}`}>
                  <Award size={16} /> Top Chaves Mais Vendidas
                </h3>
                {topChavesMaisVendidas.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4">As vendas feitas no PDV aparecerão aqui.</p>
                ) : (
                  <div className="space-y-2">
                    {topChavesMaisVendidas.map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded">{index + 1}º</span>
                          <div>
                            <p className="font-semibold text-slate-200">{item.nome}</p>
                            <span className="text-slate-500">Cód: {item.id} • Estoque: {item.qtd} un</span>
                          </div>
                        </div>
                        <span className="font-bold text-emerald-400">{item.vendas_total} un</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className={`font-bold text-sm flex items-center gap-2 ${temaUnidade.textoDestaque}`}>
                  <Clock size={16} /> Agenda de Boletos & Alertas de Estoque
                </h3>
                {boletosPendentes.length === 0 && itensEstoqueBaixo.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4">Tudo em dia nesta unidade!</p>
                ) : (
                  <div className="space-y-2 text-xs">
                    {itensEstoqueBaixo.length > 0 && (
                      <div onClick={() => { setAbaAtiva('estoque'); setApenasEstoqueBaixo(true); }} className="cursor-pointer bg-red-950/40 border border-red-800/70 p-2.5 rounded-lg flex justify-between items-center">
                        <span className="text-red-300 font-semibold">Alerta: {itensEstoqueBaixo.length} chave(s) com estoque baixo</span>
                        <span className="text-red-400 underline">Ver estoque</span>
                      </div>
                    )}
                    {boletosPendentes.slice(0, 4).map((b) => (
                      <div key={b.id} onClick={() => setAbaAtiva('caixa')} className="cursor-pointer bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-slate-200">{b.desc}</p>
                          <span className="text-slate-500">Vencimento: {b.vencimento}</span>
                        </div>
                        <span className="font-bold text-amber-400">R$ {Number(b.valor).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'pdv' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <h2 className={`font-bold mb-3 flex items-center gap-2 text-sm sm:text-base ${temaUnidade.textoDestaque}`}>
                  <Search size={18} /> Selecionar Chave / Produto ({infoUnidadeAtual.nome})
                </h2>

                <div className="relative mb-3">
                  <input
                    ref={inputBuscaPdvRef}
                    type="text"
                    placeholder="Buscar chave por código ou nome..."
                    value={buscaPdv}
                    onChange={(e) => setBuscaPdv(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-9 py-2.5 text-sm"
                  />
                  {buscaPdv && (
                    <button
                      type="button"
                      onClick={() => setBuscaPdv('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto">
                  {estoqueUnidade
                    .filter((i) => i.nome.toLowerCase().includes(buscaPdv.toLowerCase()) || i.id.toLowerCase().includes(buscaPdv.toLowerCase()))
                    .map((item) => (
                      <button
                        key={item.id}
                        onClick={() => adicionarAoCarrinho(item)}
                        className="p-3 bg-slate-950 hover:bg-slate-800 active:scale-[0.98] border border-slate-800 rounded-lg text-left transition flex flex-col justify-between"
                      >
                        <div>
                          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">{item.id}</span>
                          <p className="font-semibold text-xs sm:text-sm mt-1 text-slate-100 leading-snug">{item.nome}</p>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-amber-400 font-bold text-xs sm:text-sm">R$ {Number(item.venda).toFixed(2)}</span>
                          <span className={`text-[11px] ${item.qtd <= item.minimo ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                            Est: {item.qtd}
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-sm text-slate-200">
                    Serviços Rápidos da Tabela ou Mão de Obra Avulsa
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setGerenciandoServicosPdv(!gerenciandoServicosPdv);
                      setServicoRapidoForm({ id: null, nome: '', valor: '' });
                    }}
                    className={`text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 border transition ${
                      gerenciandoServicosPdv
                        ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                        : 'bg-slate-950 text-amber-400 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    {gerenciandoServicosPdv ? (
                      <><Check size={13} /> Concluir Edição</>
                    ) : (
                      <><Edit2 size={13} /> Editar Lista</>
                    )}
                  </button>
                </div>

                {gerenciandoServicosPdv ? (
                  <div className="space-y-3 bg-slate-950 p-3 rounded-xl border border-amber-500/40">
                    <form onSubmit={salvarServicoRapidoPdv} className="space-y-2">
                      <span className="text-[11px] font-bold uppercase text-amber-400 block">
                        {servicoRapidoForm.id ? 'Alterando serviço selecionado:' : 'Adicionar novo serviço rápido:'}
                      </span>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          placeholder="Nome do serviço (Ex: Abertura Residencial)"
                          required
                          value={servicoRapidoForm.nome}
                          onChange={(e) => setServicoRapidoForm({ ...servicoRapidoForm, nome: e.target.value })}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm"
                        />
                        <div className="flex gap-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Preço R$"
                            required
                            value={servicoRapidoForm.valor}
                            onChange={(e) => setServicoRapidoForm({ ...servicoRapidoForm, valor: e.target.value })}
                            className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm"
                          />
                          <button
                            type="submit"
                            className={`${temaUnidade.botaoAtivo} font-bold px-3.5 py-2 rounded-lg text-xs whitespace-nowrap`}
                          >
                            {servicoRapidoForm.id ? 'Atualizar' : '+ Salvar'}
                          </button>
                          {servicoRapidoForm.id && (
                            <button
                              type="button"
                              onClick={() => setServicoRapidoForm({ id: null, nome: '', valor: '' })}
                              className="bg-slate-800 text-slate-300 px-2.5 py-2 rounded-lg text-xs"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </form>

                    <div className="space-y-1.5 max-h-56 overflow-y-auto pt-1 border-t border-slate-800">
                      {listaServicosBase.length === 0 ? (
                        <p className="text-xs text-slate-500 py-2">Nenhum serviço rápido cadastrado ainda.</p>
                      ) : (
                        listaServicosBase.map((srv) => (
                          <div key={srv.id} className="bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 flex items-center justify-between gap-2 text-xs">
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-200 truncate">{srv.nome}</p>
                              <span className="text-emerald-400 font-bold">R$ {Number(srv.valor).toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => setServicoRapidoForm({ id: srv.id, nome: srv.nome, valor: srv.valor })}
                                className="bg-slate-950 text-amber-400 p-1.5 rounded-lg border border-slate-700"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => excluirItemTabelaPrecos(srv.id)}
                                className="bg-slate-950 text-red-400 p-1.5 rounded-lg border border-slate-700"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {listaServicosBase.length === 0 ? (
                      <p className="text-xs text-slate-500">Toque em "Editar Lista" para cadastrar seus serviços rápidos.</p>
                    ) : (
                      listaServicosBase.map((srv) => (
                        <button
                          key={srv.id}
                          type="button"
                          onClick={() => adicionarServicoAvulsoPdv(srv.nome, srv.valor)}
                          className="bg-slate-950 hover:bg-slate-800 active:scale-[0.98] border border-slate-700 text-xs px-2.5 py-1.5 rounded-lg text-amber-300 font-medium transition"
                        >
                          + {srv.nome} (R$ {Number(srv.valor).toFixed(2)})
                        </button>
                      ))
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-800/80">
                  <input
                    type="text"
                    placeholder="Descrição do serviço avulso (só para esta venda)..."
                    value={servicoAvulsoDesc}
                    onChange={(e) => setServicoAvulsoDesc(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Valor (R$)"
                      value={servicoAvulsoValor}
                      onChange={(e) => setServicoAvulsoValor(e.target.value)}
                      className="w-32 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                    />
                    <button
                      onClick={() => adicionarServicoAvulsoPdv()}
                      className={`flex-1 sm:flex-none ${temaUnidade.botaoAtivo} font-bold px-4 py-2.5 rounded-lg text-sm`}
                    >
                      + Incluir
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              {renderComandaPDV()}
            </div>

            {carrinho.length > 0 && !comandaMobileAberta && (
              <div className="lg:hidden fixed bottom-[60px] left-3 right-3 z-40">
                <button
                  onClick={() => setComandaMobileAberta(true)}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-3.5 rounded-xl shadow-2xl flex items-center justify-between"
                >
                  <span className="flex items-center gap-2 text-sm">
                    <ShoppingCart size={18} /> {totalItensCarrinho} {totalItensCarrinho === 1 ? 'item' : 'itens'} • R$ {totalLiquidoPdv.toFixed(2)}
                  </span>
                  <span className="flex items-center gap-1 text-xs bg-slate-950/20 px-2.5 py-1 rounded-lg">
                    Ver Comanda <ChevronUp size={15} />
                  </span>
                </button>
              </div>
            )}

            {comandaMobileAberta && (
              <div className="lg:hidden fixed inset-0 bg-black/80 z-50 flex items-end justify-center p-2">
                <div className="w-full max-h-[90vh] overflow-y-auto rounded-2xl">
                  {renderComandaPDV()}
                </div>
              </div>
            )}
          </div>
        )}

        {abaAtiva === 'simulador' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4">
                <h2 className={`font-bold flex items-center gap-2 ${temaUnidade.textoDestaque}`}>
                  <Calculator size={18} /> Calculadora Rápida de Serviço
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">1. Serviço Base (Mão de Obra)</label>
                    <select
                      value={calcServicoId}
                      onChange={(e) => setCalcServicoId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                    >
                      <option value="">Selecione o serviço...</option>
                      {listaServicosBase.map((s) => (
                        <option key={s.id} value={s.id}>{s.nome} — R$ {Number(s.valor).toFixed(2)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">2. Peça / Marca da Tabela (Opcional)</label>
                    <select
                      value={calcPecaId}
                      onChange={(e) => setCalcPecaId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                    >
                      <option value="">Apenas mão de obra (Sem peça)</option>
                      {listaPecasTabela.map((p) => (
                        <option key={p.id} value={p.id}>{p.nome} [{p.marca}] — +R$ {Number(p.valor).toFixed(2)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Ou Puxar Peça/Chave do Estoque Atual</label>
                    <select
                      value={calcEstoqueId}
                      onChange={(e) => setCalcEstoqueId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                    >
                      <option value="">Nenhum item do estoque</option>
                      {estoqueUnidade.map((e) => (
                        <option key={e.id} value={e.id}>[{e.id}] {e.nome} — +R$ {Number(e.venda).toFixed(2)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Ajuste Extra Manual (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Ex: +20 ou -10"
                      value={calcValorExtraManual}
                      onChange={(e) => setCalcValorExtraManual(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-2">3. Variáveis do Caso (Área de Cobertura / Horário / Dificuldade)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {listaAdicionais.map((ad) => {
                      const marcado = calcAdicionaisIds.includes(ad.id);
                      return (
                        <button
                          key={ad.id}
                          type="button"
                          onClick={() => {
                            if (marcado) setCalcAdicionaisIds(calcAdicionaisIds.filter((i) => i !== ad.id));
                            else setCalcAdicionaisIds([...calcAdicionaisIds, ad.id]);
                          }}
                          className={`p-2.5 rounded-lg border text-left text-xs flex items-center justify-between transition ${
                            marcado ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-300'
                          }`}
                        >
                          <span>{ad.nome}</span>
                          <span className="text-amber-400 ml-2 whitespace-nowrap">
                            +{ad.tipo_valor === 'percentual' ? `${ad.valor}%` : `R$ ${Number(ad.valor).toFixed(2)}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <CreditCard size={14} className="text-amber-400" /> 4. Simular Parcelamento / Taxa da Maquininha
                    </span>
                    <label className="flex items-center gap-2 text-xs text-amber-400 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={calcRepassarTaxa}
                        onChange={(e) => setCalcRepassarTaxa(e.target.checked)}
                        className="rounded"
                      />
                      Repassar taxa ao cliente
                    </label>
                  </div>
                  <select
                    value={calcTaxaId}
                    onChange={(e) => setCalcTaxaId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="">Pagamento à vista no Pix / Dinheiro (Sem taxa)</option>
                    {taxasCartaoDisponiveis.map((t) => (
                      <option key={t.id} value={t.id}>{t.nome} (Taxa cadastrada: {t.valor}%)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <h3 className={`font-bold ${temaUnidade.textoDestaque}`}>Resumo da Cotação</h3>
                  <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800">
                    {montarResumoSimulador()}
                  </p>

                  <div className="space-y-1 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Valor Base + Peça:</span>
                      <span>R$ {valorBaseCalc.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Acréscimos:</span>
                      <span>+ R$ {valorAdicionaisCalc.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-200 pt-1 border-t border-slate-800">
                      <span>À vista (Pix / Dinheiro):</span>
                      <span className="text-emerald-400">R$ {subtotalSimulador.toFixed(2)}</span>
                    </div>
                    {taxaSimuladorObj && (
                      <div className="flex justify-between font-bold text-amber-400 pt-1">
                        <span>No Cartão ({taxaSimuladorObj.nome}):</span>
                        <span>R$ {totalFinalSimulador.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 pt-2">
                    <input
                      type="text"
                      placeholder="Nome do Cliente"
                      value={calcCliente.nome}
                      onChange={(e) => setCalcCliente({ ...calcCliente, nome: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs"
                    />
                    <input
                      type="tel"
                      placeholder="WhatsApp com DDD"
                      value={calcCliente.tel}
                      onChange={(e) => setCalcCliente({ ...calcCliente, tel: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Endereço / Local do Serviço"
                      value={calcCliente.endereco}
                      onChange={(e) => setCalcCliente({ ...calcCliente, endereco: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => salvarSimuladorEmStandby(true)}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5"
                  >
                    <Share2 size={15} /> Salvar Standby & Enviar WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => salvarSimuladorEmStandby(false)}
                    className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5"
                  >
                    <FolderClock size={15} /> Só Salvar em Standby
                  </button>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={enviarSimuladorParaPDV}
                      className={`${temaUnidade.botaoAtivo} font-bold py-2 rounded-lg text-xs`}
                    >
                      Jogar pro PDV
                    </button>
                    <button
                      type="button"
                      onClick={enviarSimuladorParaOS}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold py-2 rounded-lg text-xs border border-slate-700"
                    >
                      Virar OS Direto
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className={`font-bold text-sm ${temaUnidade.textoDestaque}`}>
                  Tabela de Preços, Marcas e Taxas da Maquininha ({tabelaPrecos.length})
                </h3>
                <button
                  onClick={() => toggleForm('tabela')}
                  className={`${temaUnidade.botaoAtivo} text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1`}
                >
                  {formAberto.tabela ? <><X size={14} /> Fechar</> : <><Plus size={14} /> Editar / Adicionar Preços</>}
                </button>
              </div>

              {formAberto.tabela && (
                <>
                  <form onSubmit={salvarItemTabelaPrecos} className="grid grid-cols-1 sm:grid-cols-6 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <select
                      value={novoItemTabela.grupo}
                      onChange={(e) => setNovoItemTabela({ ...novoItemTabela, grupo: e.target.value, tipo_valor: e.target.value === 'taxa_cartao' ? 'percentual' : 'fixo' })}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-xs"
                    >
                      <option value="servico">Serviço Base</option>
                      <option value="peca">Peça / Fechadura / Miolo</option>
                      <option value="adicional">Acréscimo (Área/Urgência)</option>
                      <option value="taxa_cartao">Taxa Maquininha (%)</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Nome (Ex: Abertura / Cilindro) *"
                      required
                      value={novoItemTabela.nome}
                      onChange={(e) => setNovoItemTabela({ ...novoItemTabela, nome: e.target.value })}
                      className="sm:col-span-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Marca / Detalhe"
                      value={novoItemTabela.marca}
                      onChange={(e) => setNovoItemTabela({ ...novoItemTabela, marca: e.target.value })}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-xs"
                    />
                    <div className="flex gap-1">
                      <select
                        value={novoItemTabela.tipo_valor}
                        onChange={(e) => setNovoItemTabela({ ...novoItemTabela, tipo_valor: e.target.value })}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-2.5 text-xs"
                      >
                        <option value="fixo">R$</option>
                        <option value="percentual">%</option>
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Valor *"
                        required
                        value={novoItemTabela.valor}
                        onChange={(e) => setNovoItemTabela({ ...novoItemTabela, valor: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-2.5 text-xs"
                      />
                    </div>
                    <button type="submit" className={`${temaUnidade.botaoAtivo} font-bold py-2.5 px-3 rounded-lg text-xs`}>
                      {novoItemTabela.id ? 'Atualizar' : '+ Salvar'}
                    </button>
                  </form>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                    {tabelaPrecos.map((item) => (
                      <div key={item.id} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between gap-2 text-xs">
                        <div>
                          <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 mr-1.5">
                            {item.grupo}
                          </span>
                          <strong className="text-slate-200">{item.nome}</strong>
                          {item.marca && <span className="text-slate-400"> ({item.marca})</span>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-emerald-400">
                            {item.tipo_valor === 'percentual' ? `${item.valor}%` : `R$ ${Number(item.valor).toFixed(2)}`}
                          </span>
                          <button onClick={() => setNovoItemTabela(item)} className="text-amber-400 p-1">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => excluirItemTabelaPrecos(item.id)} className="text-red-400 p-1">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {abaAtiva === 'os' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className={`font-bold text-base ${temaUnidade.textoDestaque}`}>
                Ordens de Serviço — {infoUnidadeAtual.nome} ({osExibidas.length})
              </h2>
              <button
                onClick={() => toggleForm('os')}
                className={`${temaUnidade.botaoAtivo} font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow`}
              >
                {formAberto.os ? <><X size={16} /> Fechar Formulário</> : <><Plus size={16} /> Nova Ordem de Serviço</>}
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'pendente', label: `Pendentes (${osPendentes.length})` },
                { id: 'concluida', label: `Concluídas (${osConcluidas.length})` },
                { id: 'todas', label: `Todas (${osUnidade.length})` }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFiltroStatusOS(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    filtroStatusOS === f.id ? temaUnidade.botaoAtivo : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {formAberto.os && (
              <form onSubmit={(e) => criarOS(e, false)} className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-3 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase text-slate-400">Preencher Nova OS</span>
                  <div className="flex flex-wrap gap-2">
                    {clientes.length > 0 && (
                      <select
                        onChange={(e) => {
                          const cli = clientes.find((c) => c.id.toString() === e.target.value);
                          if (cli) setNovaOS({ ...novaOS, cliente: cli.nome, tel: cli.tel || '', endereco: cli.endereco || novaOS.endereco });
                        }}
                        defaultValue=""
                        className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300"
                      >
                        <option value="" disabled>Puxar cliente salvo...</option>
                        {clientes.map((c) => (
                          <option key={c.id} value={c.id}>{c.nome}</option>
                        ))}
                      </select>
                    )}
                    <button
                      type="button"
                      onClick={() => setModalConfigUnidades(true)}
                      className="bg-slate-950 border border-sky-700 text-sky-400 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                    >
                      <UserPlus size={13} /> Equipe ({funcionarios.length})
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Nome do Cliente *"
                    required
                    value={novaOS.cliente}
                    onChange={(e) => setNovaOS({ ...novaOS, cliente: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                  />
                  <input
                    type="tel"
                    placeholder="WhatsApp do Cliente (DDD)"
                    value={novaOS.tel}
                    onChange={(e) => setNovaOS({ ...novaOS, tel: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Endereço / Local do Serviço"
                    value={novaOS.endereco}
                    onChange={(e) => setNovaOS({ ...novaOS, endereco: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="O que será feito (Descrição) *"
                    required
                    value={novaOS.desc}
                    onChange={(e) => setNovaOS({ ...novaOS, desc: e.target.value })}
                    className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Valor Total (R$) *"
                    required
                    value={novaOS.valor}
                    onChange={(e) => setNovaOS({ ...novaOS, valor: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                  />
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-amber-400 block">
                    Materiais do estoque (Permite vários itens):
                  </span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={itemTempOS.chave_id}
                      onChange={(e) => setItemTempOS({ ...itemTempOS, chave_id: e.target.value })}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs"
                    >
                      <option value="">Selecionar item do estoque...</option>
                      {estoqueUnidade.map((item) => (
                        <option key={item.id} value={item.id}>
                          [{item.id}] {item.nome} (Est: {item.qtd})
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        value={itemTempOS.qtd}
                        onChange={(e) => setItemTempOS({ ...itemTempOS, qtd: e.target.value })}
                        className="w-20 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs"
                      />
                      <button
                        type="button"
                        onClick={adicionarMaterialNaOS}
                        className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold px-3 py-2 rounded-lg text-xs border border-slate-700"
                      >
                        + Incluir
                      </button>
                    </div>
                  </div>

                  {novaOS.itens_usados.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {novaOS.itens_usados.map((m, idx) => (
                        <span key={idx} className="bg-slate-900 border border-amber-500/40 text-amber-300 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                          {m.qtd}x {m.nome}
                          <button type="button" onClick={() => removerMaterialDaOS(idx)} className="text-red-400">
                            <X size={13} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <select
                    value={novaOS.funcionario_id}
                    onChange={(e) => setNovaOS({ ...novaOS, funcionario_id: e.target.value })}
                    className="bg-slate-950 border border-sky-800 rounded-lg px-3 py-2 text-xs text-sky-300 font-bold"
                  >
                    <option value="">
                      {funcionarioPadraoUnidade
                        ? `Funcionário: ${funcionarioPadraoUnidade.nome} (Padrão)`
                        : 'Sem funcionário selecionado'}
                    </option>
                    {funcionarios.map((f) => (
                      <option key={f.id} value={f.id}>
                        Funcionário: {f.nome} ({f.unidade.toUpperCase()})
                      </option>
                    ))}
                  </select>

                  <select
                    value={novaOS.forma_pgto}
                    onChange={(e) => setNovaOS({ ...novaOS, forma_pgto: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-amber-300 font-semibold"
                  >
                    <option value="Receber na Entrega (Pix/Cartão)">Pagamento: Receber na Entrega</option>
                    <option value="Já Pago Adiantado">Pagamento: Já Pago Adiantado</option>
                    <option value="Sinal 50% Pago / Cobrar Restante">Pagamento: Sinal 50% Pago</option>
                    <option value="Faturado / Condomínio">Pagamento: Faturado / Condomínio</option>
                  </select>

                  <select
                    value={novaOS.garantia}
                    onChange={(e) => setNovaOS({ ...novaOS, garantia: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300"
                  >
                    <option value="90 dias">Garantia: 90 dias</option>
                    <option value="6 meses">Garantia: 6 meses</option>
                    <option value="1 ano">Garantia: 1 ano</option>
                    <option value="Sem garantia">Sem garantia</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Placa / Fechadura / Obs"
                    value={novaOS.obs_tecnica}
                    onChange={(e) => setNovaOS({ ...novaOS, obs_tecnica: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs"
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button type="submit" className={`${temaUnidade.botaoAtivo} font-bold px-5 py-2.5 rounded-lg text-xs sm:text-sm`}>
                    Salvar OS
                  </button>
                  <button
                    type="button"
                    onClick={() => criarOS(null, true)}
                    className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-xs sm:text-sm flex items-center gap-1.5"
                  >
                    <Send size={15} /> Salvar & Enviar pro Funcionário
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {osExibidas.map((os) => {
                const listaMat = Array.isArray(os.itens_usados) && os.itens_usados.length > 0
                  ? os.itens_usados
                  : (os.chave_id ? [{ id: os.chave_id, nome: os.chave_id, qtd: os.qtd_copias }] : []);

                const nomeFuncExibido = os.funcionario_nome || funcionarioPadraoUnidade?.nome || '';

                return (
                  <div key={os.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-mono text-slate-400">OS Nº {os.id.toString().slice(-4)} • {os.data}</span>
                        <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${os.status === 'concluida' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'}`}>
                          {os.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-base mt-1">{os.cliente}</h3>
                      {os.tel && <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><Phone size={11} /> {os.tel}</p>}
                      {os.endereco && <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><MapPin size={11} /> {os.endereco}</p>}
                      <p className="text-sm text-slate-200 mt-1.5">{os.desc}</p>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {os.forma_pgto && <span className="text-[11px] text-amber-300 font-medium">Pgto: {os.forma_pgto}</span>}
                        {nomeFuncExibido && <span className="text-[11px] text-sky-400 font-bold">Resp: {nomeFuncExibido}</span>}
                      </div>
                      {listaMat.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {listaMat.map((m, i) => (
                            <span key={i} className="text-[11px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded">
                              {m.qtd}x {m.nome || m.id}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 border-t border-slate-800 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-base text-amber-400">R$ {Number(os.valor).toFixed(2)}</span>
                        <button
                          onClick={() => enviarDiretoParaFuncionario('os', os)}
                          className="bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow"
                        >
                          <Send size={13} /> Enviar p/ {nomeFuncExibido || 'Funcionário'}
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        {os.status !== 'concluida' ? (
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              onClick={() => concluirOS(os, 'Pix')}
                              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1"
                            >
                              <CheckCircle size={13} /> Concluir (Pago)
                            </button>
                            <button
                              onClick={() => concluirOS(os, 'A Receber (Fiado)')}
                              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3 py-2 rounded-lg"
                            >
                              Fiado
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              onClick={() => setComprovanteAtivo({
                                origem: `OS Nº ${os.id.toString().slice(-4)}`,
                                cliente: os.cliente,
                                tel: os.tel || '',
                                itensTexto: `- ${os.desc}`,
                                total: os.valor,
                                forma: 'Pix',
                                garantia: '90 dias',
                                unidade: os.unidade || unidadeOperacional
                              })}
                              className="bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1"
                            >
                              <Share2 size={13} /> Comprovante
                            </button>
                            <button
                              onClick={() => abrirPortalNFSe({ cliente: os.cliente, desc: os.desc, valor: os.valor })}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1"
                              title="Copia os dados e abre o portal oficial da NFS-e"
                            >
                              <Receipt size={13} /> NFS-e
                            </button>
                          </div>
                        )}
                        <button onClick={() => excluirOS(os.id)} className="text-red-400 hover:text-red-300 p-2">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {abaAtiva === 'agenda' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className={`font-bold text-base ${temaUnidade.textoDestaque}`}>
                Socorros Externos — {infoUnidadeAtual.nome} ({socorrosExibidos.length})
              </h2>
              <button
                onClick={() => toggleForm('agenda')}
                className={`${temaUnidade.botaoAtivo} font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow`}
              >
                {formAberto.agenda ? <><X size={16} /> Fechar Formulário</> : <><Plus size={16} /> Agendar Socorro</>}
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'pendente', label: `Pendentes (${socorrosPendentes.length})` },
                { id: 'concluido', label: `Concluídos (${socorrosConcluidos.length})` },
                { id: 'todos', label: `Todos (${agendaUnidade.length})` }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFiltroStatusAgenda(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    filtroStatusAgenda === f.id ? temaUnidade.botaoAtivo : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {formAberto.agenda && (
              <form onSubmit={(e) => criarAgendamento(e, false)} className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-400">Novo Atendimento Externo</span>
                  {clientes.length > 0 && (
                    <select
                      onChange={(e) => {
                        const cli = clientes.find((c) => c.id.toString() === e.target.value);
                        if (cli) setNovoAgendamento({ ...novoAgendamento, cliente: cli.nome, tel: cli.tel || '', endereco: cli.endereco || novoAgendamento.endereco });
                      }}
                      defaultValue=""
                      className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300"
                    >
                      <option value="" disabled>Puxar cliente salvo...</option>
                      {clientes.map((c) => (
                        <option key={c.id} value={c.id}>{c.nome}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Nome do Cliente *"
                    required
                    value={novoAgendamento.cliente}
                    onChange={(e) => setNovoAgendamento({ ...novoAgendamento, cliente: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                  />
                  <input
                    type="tel"
                    placeholder="WhatsApp (com DDD)"
                    value={novoAgendamento.tel}
                    onChange={(e) => setNovoAgendamento({ ...novoAgendamento, tel: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Endereço / Referência *"
                    required
                    value={novoAgendamento.endereco}
                    onChange={(e) => setNovoAgendamento({ ...novoAgendamento, endereco: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Serviço (Ex: Abertura + Miolo) *"
                    required
                    value={novoAgendamento.servico}
                    onChange={(e) => setNovoAgendamento({ ...novoAgendamento, servico: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                  />
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={novoAgendamento.data}
                      onChange={(e) => setNovoAgendamento({ ...novoAgendamento, data: e.target.value })}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-2.5 text-sm"
                    />
                    <input
                      type="time"
                      value={novoAgendamento.hora}
                      onChange={(e) => setNovoAgendamento({ ...novoAgendamento, hora: e.target.value })}
                      className="w-28 bg-slate-950 border border-slate-800 rounded-lg px-2 py-2.5 text-sm"
                    />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Valor Total Combinado (R$)"
                    value={novoAgendamento.valor_estimado}
                    onChange={(e) => setNovoAgendamento({ ...novoAgendamento, valor_estimado: e.target.value, taxa_deslocamento: 0 })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                  />
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-amber-400 block">Materiais levados no Socorro (Opcional):</span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={itemTempAg.chave_id}
                      onChange={(e) => setItemTempAg({ ...itemTempAg, chave_id: e.target.value })}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs"
                    >
                      <option value="">Selecionar peça/chave do estoque...</option>
                      {estoqueUnidade.map((item) => (
                        <option key={item.id} value={item.id}>[{item.id}] {item.nome} (Disp: {item.qtd})</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        value={itemTempAg.qtd}
                        onChange={(e) => setItemTempAg({ ...itemTempAg, qtd: e.target.value })}
                        className="w-20 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs"
                      />
                      <button
                        type="button"
                        onClick={adicionarMaterialNoSocorro}
                        className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold px-3 py-2 rounded-lg text-xs border border-slate-700"
                      >
                        + Incluir
                      </button>
                    </div>
                  </div>
                  {novoAgendamento.itens_usados.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {novoAgendamento.itens_usados.map((m, idx) => (
                        <span key={idx} className="bg-slate-900 border border-amber-500/40 text-amber-300 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                          {m.qtd}x {m.nome}
                          <button type="button" onClick={() => removerMaterialDoSocorro(idx)} className="text-red-400">
                            <X size={13} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <select
                    value={novoAgendamento.funcionario_id}
                    onChange={(e) => setNovoAgendamento({ ...novoAgendamento, funcionario_id: e.target.value })}
                    className="bg-slate-950 border border-sky-800 rounded-lg px-3 py-2.5 text-xs text-sky-300 font-bold"
                  >
                    <option value="">
                      {funcionarioPadraoUnidade
                        ? `Funcionário: ${funcionarioPadraoUnidade.nome} (Padrão)`
                        : 'Sem funcionário selecionado'}
                    </option>
                    {funcionarios.map((f) => (
                      <option key={f.id} value={f.id}>
                        Funcionário: {f.nome} ({f.unidade.toUpperCase()})
                      </option>
                    ))}
                  </select>

                  <div className="flex flex-wrap gap-2">
                    <button type="submit" className={`${temaUnidade.botaoAtivo} font-bold px-5 py-2.5 rounded-lg text-xs sm:text-sm`}>
                      Salvar Socorro
                    </button>
                    <button
                      type="button"
                      onClick={() => criarAgendamento(null, true)}
                      className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-xs sm:text-sm flex items-center gap-1.5"
                    >
                      <Send size={15} /> Salvar & Enviar p/ Funcionário
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {socorrosExibidos.map((ag) => {
                const totalSoc = Number(ag.valor_estimado || 0) + Number(ag.taxa_deslocamento || 0);
                const listaMat = Array.isArray(ag.itens_usados) ? ag.itens_usados : [];
                const nomeFuncSoc = ag.funcionario_nome || funcionarioPadraoUnidade?.nome || '';

                return (
                  <div key={ag.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs text-amber-400 font-bold">{ag.data} às {ag.hora}</span>
                      <h3 className="font-bold text-base">{ag.cliente} — {ag.servico}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin size={13} /> {ag.endereco} {ag.tel ? `• WhatsApp: ${ag.tel}` : ''}
                      </p>
                      {nomeFuncSoc && <span className="text-[11px] text-sky-400 font-bold block">Resp: {nomeFuncSoc}</span>}
                      {listaMat.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {listaMat.map((m, i) => (
                            <span key={i} className="text-[11px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded">
                              {m.qtd}x {m.nome}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
                      <span className="font-bold text-base text-emerald-400">R$ {totalSoc.toFixed(2)}</span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          onClick={() => enviarDiretoParaFuncionario('socorro', ag)}
                          className="bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1"
                        >
                          <Send size={12} /> Enviar p/ {nomeFuncSoc || 'Funcionário'}
                        </button>
                        {ag.status !== 'concluido' ? (
                          <button
                            onClick={() => concluirAgendamento(ag, 'Pix')}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1"
                          >
                            <CheckCircle size={14} /> Finalizar & Recibo
                          </button>
                        ) : (
                          <button
                            onClick={() => setComprovanteAtivo({
                              origem: `Socorro (${ag.cliente})`,
                              cliente: ag.cliente,
                              tel: ag.tel || '',
                              itensTexto: `- Socorro: ${ag.servico}\n- Local: ${ag.endereco}`,
                              total: totalSoc,
                              forma: 'Pix',
                              garantia: '90 dias',
                              unidade: ag.unidade || unidadeOperacional
                            })}
                            className="bg-slate-800 text-emerald-400 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1"
                          >
                            <Share2 size={13} /> Recibo Cliente
                          </button>
                        )}
                        <button onClick={() => excluirAgendamento(ag.id)} className="text-red-400 p-2">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {abaAtiva === 'orcamento' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className={`font-bold text-base ${temaUnidade.textoDestaque}`}>
                Orçamentos em Standby — {infoUnidadeAtual.nome}
              </h2>
              <button
                onClick={() => toggleForm('orcamento')}
                className={`${temaUnidade.botaoAtivo} font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow`}
              >
                {formAberto.orcamento ? <><X size={16} /> Fechar Formulário</> : <><Plus size={16} /> Novo Orçamento</>}
              </button>
            </div>

            {formAberto.orcamento && (
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-4 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-bold text-sm text-amber-400">
                    {orcamento.id ? `Editando Orçamento: ${orcamento.cliente}` : 'Montar Novo Orçamento'}
                  </span>
                  <div className="flex items-center gap-2">
                    {orcamento.id && (
                      <button
                        type="button"
                        onClick={() => setOrcamento({
                          id: null, cliente: '', tel: '', endereco: '', tipo_cliente: 'Residencial',
                          forma_pgto: 'Pix / Dinheiro (À Vista)', itens: [{ desc: '', qtd: 1, valor: 0 }],
                          obs: 'Validade: 7 dias. Garantia de 90 dias.'
                        })}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        <X size={14} /> Limpar
                      </button>
                    )}
                    {clientes.length > 0 && (
                      <select
                        onChange={(e) => {
                          const cli = clientes.find((c) => c.id.toString() === e.target.value);
                          if (cli) {
                            setOrcamento({
                              ...orcamento,
                              cliente: cli.nome,
                              tel: cli.tel || '',
                              endereco: cli.endereco || '',
                              tipo_cliente: cli.tipo || 'Residencial'
                            });
                          }
                        }}
                        defaultValue=""
                        className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300"
                      >
                        <option value="" disabled>Puxar cliente salvo...</option>
                        {clientes.map((c) => (
                          <option key={c.id} value={c.id}>{c.nome}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-amber-400 uppercase block">1. Dados do Cliente & Local</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Nome do Cliente / Condomínio *"
                      value={orcamento.cliente}
                      onChange={(e) => setOrcamento({ ...orcamento, cliente: e.target.value })}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                    />
                    <input
                      type="tel"
                      placeholder="WhatsApp (com DDD)"
                      value={orcamento.tel}
                      onChange={(e) => setOrcamento({ ...orcamento, tel: e.target.value })}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                    />
                    <select
                      value={orcamento.tipo_cliente}
                      onChange={(e) => setOrcamento({ ...orcamento, tipo_cliente: e.target.value })}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200"
                    >
                      <option value="Residencial">Cliente: Residencial</option>
                      <option value="Comercial / Condomínio">Cliente: Comercial / Condomínio</option>
                      <option value="Automotivo">Cliente: Automotivo</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Endereço Completo / Referência / Apto / Placa"
                      value={orcamento.endereco}
                      onChange={(e) => setOrcamento({ ...orcamento, endereco: e.target.value })}
                      className="sm:col-span-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                    />
                    <select
                      value={orcamento.forma_pgto}
                      onChange={(e) => setOrcamento({ ...orcamento, forma_pgto: e.target.value })}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-amber-300 font-semibold"
                    >
                      <option value="Pix / Dinheiro (À Vista)">Pgto: Pix / Dinheiro</option>
                      <option value="Cartão de Crédito / Débito">Pgto: Cartão</option>
                      <option value="Sinal 50% + Restante na Entrega">Pgto: Sinal 50% + Entrega</option>
                      <option value="Faturado / Boleto Condomínio">Pgto: Faturado / Condomínio</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-amber-400 uppercase block">2. Itens e Serviços</span>
                  {orcamento.itens.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <input
                        type="text"
                        placeholder="Serviço, Fechadura ou Chave"
                        value={item.desc}
                        onChange={(e) => atualizarItemOrcamento(index, 'desc', e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                      />
                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          min="1"
                          value={item.qtd}
                          onChange={(e) => atualizarItemOrcamento(index, 'qtd', e.target.value)}
                          className="w-20 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                        />
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Valor Un."
                          value={item.valor}
                          onChange={(e) => atualizarItemOrcamento(index, 'valor', e.target.value)}
                          className="flex-1 sm:w-28 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                        />
                        {orcamento.itens.length > 1 && (
                          <button type="button" onClick={() => removerLinhaOrcamento(index)} className="text-red-400 px-2">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={adicionarLinhaOrcamento} className="text-xs text-amber-400 hover:underline font-semibold">
                    + Adicionar mais um item
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Observações / Garantia / Prazo"
                  value={orcamento.obs}
                  onChange={(e) => setOrcamento({ ...orcamento, obs: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                />

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-3">
                  <span className="text-lg font-bold">Total: R$ {totalOrcamento.toFixed(2)}</span>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => salvarOrcamentoStandby(false)}
                      className="flex-1 sm:flex-none bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5"
                    >
                      <FolderClock size={16} /> Salvar em Standby
                    </button>
                    <button
                      type="button"
                      onClick={() => salvarOrcamentoStandby(true)}
                      className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5"
                    >
                      <Share2 size={16} /> Salvar & Enviar WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Filtrar Fila</span>
                <div className="flex gap-1.5">
                  {[
                    { id: 'standby', label: `Aguardando (${orcamentosEmStandby.length})` },
                    { id: 'aprovado', label: 'Aprovados' },
                    { id: 'todos', label: 'Todos' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFiltroStatusOrcamento(f.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        filtroStatusOrcamento === f.id ? temaUnidade.botaoAtivo : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {orcamentosUnidade
                  .filter((o) => filtroStatusOrcamento === 'todos' ? true : o.status === filtroStatusOrcamento)
                  .map((orc) => {
                    const listaItens = Array.isArray(orc.itens) ? orc.itens : [];
                    const cliCadastrado = clientes.find((c) => c.nome.toLowerCase() === (orc.cliente || '').toLowerCase());
                    const enderecoExibido = orc.endereco || cliCadastrado?.endereco || '';

                    return (
                      <div key={orc.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between gap-3">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[11px] text-slate-400">{orc.data} {orc.tipo_cliente ? `• ${orc.tipo_cliente}` : ''}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${orc.status === 'aprovado' ? 'bg-emerald-950 text-emerald-400' : 'bg-sky-950 text-sky-400'}`}>
                              {orc.status === 'standby' ? 'Em Standby' : orc.status}
                            </span>
                          </div>
                          <h4 className="font-bold text-base text-slate-100 mt-1">{orc.cliente}</h4>
                          {orc.tel && <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Phone size={11} /> {orc.tel}</p>}
                          {enderecoExibido && <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><MapPin size={11} /> {enderecoExibido}</p>}
                          {orc.forma_pgto && <p className="text-[11px] text-amber-300 mt-1">Pgto: {orc.forma_pgto}</p>}
                          <div className="mt-2 space-y-1 text-xs text-slate-300 bg-slate-900 p-2 rounded-lg">
                            {listaItens.map((it, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span>{it.qtd}x {it.desc}</span>
                                <span className="text-amber-400">R$ {(Number(it.qtd) * Number(it.valor)).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-900 pt-2">
                          <span className="font-bold text-base text-emerald-400">R$ {Number(orc.total).toFixed(2)}</span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {orc.status === 'standby' && (
                              <button
                                onClick={() => aprovarOrcamentoVirarOS(orc)}
                                className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1"
                              >
                                <ShieldCheck size={13} /> Virar OS
                              </button>
                            )}
                            <button
                              onClick={() => dispararTextoOrcamentoWhatsApp({ ...orc, endereco: enderecoExibido })}
                              className="bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1"
                            >
                              <Share2 size={12} /> WhatsApp
                            </button>
                            <button onClick={() => carregarOrcamentoParaEdicao(orc)} className="bg-slate-800 text-amber-400 p-1.5 rounded-lg">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => excluirOrcamentoSalvo(orc.id)} className="bg-slate-800 text-red-400 p-1.5 rounded-lg">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'caixa' && (
          <div className="space-y-5">
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'hoje', label: 'Hoje' },
                  { id: '7dias', label: '7 Dias' },
                  { id: 'mes', label: 'Mês Atual' },
                  { id: 'troco', label: 'Só Caixa Troco' },
                  { id: 'areceber', label: `Fiado (R$ ${totalAReceber.toFixed(0)})` },
                  { id: 'todos', label: 'Tudo' },
                ].map((periodo) => (
                  <button
                    key={periodo.id}
                    onClick={() => setFiltroPeriodoCaixa(periodo.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition ${
                      filtroPeriodoCaixa === periodo.id
                        ? temaUnidade.botaoAtivo
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {periodo.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setModalFechamentoCaixa(true)}
                  className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow"
                >
                  <ClipboardCheck size={14} /> Fechar Caixa do Dia
                </button>
                <button
                  onClick={() => abrirPortalNFSe()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5"
                >
                  <Receipt size={14} /> NFS-e <ExternalLink size={11} />
                </button>
                <button
                  onClick={exportarCSVRelatorio}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 border border-slate-700"
                >
                  <Download size={14} /> CSV
                </button>
              </div>
            </div>

            {diferencaReposicaoTroco > 0 && unidadeAtiva !== 'todas' && (
              <div className="bg-amber-950/50 border border-amber-600/70 p-3 rounded-xl flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs text-amber-200">
                  <strong>Caixa de Troco desfalcado:</strong> Saldo atual em <strong>R$ {saldoTrocoAtual.toFixed(2)}</strong> (Faltam <strong>R$ {diferencaReposicaoTroco.toFixed(2)}</strong> para completar a base de R$ {fundoTrocoBase.toFixed(2)}).
                </div>
                <button
                  type="button"
                  onClick={() => reporTrocoAutomatico(diferencaReposicaoTroco)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg"
                >
                  Repor R$ {diferencaReposicaoTroco.toFixed(2)} do Faturado
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">Faturado Bruto</span>
                <p className="text-lg sm:text-xl font-bold text-emerald-400 mt-1">R$ {totalEntradas.toFixed(2)}</p>
              </div>
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">Saídas Faturado</span>
                <p className="text-lg sm:text-xl font-bold text-red-400 mt-1">R$ {totalSaidasFaturado.toFixed(2)}</p>
              </div>
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">Saldo Faturado</span>
                <p className={`text-lg sm:text-xl font-bold mt-1 ${saldoOperacionalFaturado >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
                  R$ {saldoOperacionalFaturado.toFixed(2)}
                </p>
              </div>
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">Lucro Líquido Real</span>
                <p className={`text-lg sm:text-xl font-bold mt-1 ${lucroRealPeriodo >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  R$ {lucroRealPeriodo.toFixed(2)}
                </p>
                <span className="text-[10px] text-slate-500">Insumos: R$ {custoInsumosPeriodo.toFixed(2)}</span>
              </div>
              <div
                onClick={() => setModalConfigUnidades(true)}
                className="cursor-pointer bg-sky-950/30 hover:border-sky-500/60 transition p-3.5 rounded-xl border border-sky-800/70"
                title="Toque para configurar o valor base do Caixa de Troco"
              >
                <span className="text-xs text-sky-300 font-semibold flex items-center justify-between">
                  Caixa de Troco <Edit2 size={11} />
                </span>
                <p className={`text-lg sm:text-xl font-bold mt-1 ${saldoTrocoAtual < fundoTrocoBase ? 'text-amber-400' : 'text-sky-400'}`}>
                  R$ {saldoTrocoAtual.toFixed(2)}
                </p>
                <span className="text-[10px] text-slate-400">Base: R$ {fundoTrocoBase.toFixed(0)}</span>
              </div>
              <div className="bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-800/70">
                <span className="text-xs text-emerald-300 font-semibold block">Gaveta Física</span>
                <p className="text-lg sm:text-xl font-bold text-emerald-400 mt-1">R$ {totalGavetaFisica.toFixed(2)}</p>
                <span className="text-[10px] text-slate-400">Troco + Dinheiro Vendas</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block">Pix (Faturado):</span>
                <strong className="text-emerald-400">R$ {entradasPix.toFixed(2)}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Dinheiro (Faturado):</span>
                <strong className="text-amber-400">R$ {liquidoDinheiroFaturado.toFixed(2)}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Cartão (Faturado):</span>
                <strong className="text-sky-400">R$ {entradasCartao.toFixed(2)}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold text-sm ${temaUnidade.textoDestaque}`}>Movimentações ({transacoesFiltradas.length})</h3>
                  <button
                    onClick={() => toggleForm('caixa')}
                    className={`${temaUnidade.botaoAtivo} text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1`}
                  >
                    {formAberto.caixa ? <><X size={13} /> Fechar</> : <><Plus size={13} /> Movimentar Caixa</>}
                  </button>
                </div>

                {formAberto.caixa && (
                  <form onSubmit={adicionarTransacaoManual} className="space-y-2.5 bg-slate-950 p-3 rounded-xl border border-slate-700">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <select
                        value={novaTransacao.origem_caixa}
                        onChange={(e) => setNovaTransacao({
                          ...novaTransacao,
                          origem_caixa: e.target.value,
                          forma: e.target.value === 'troco' ? 'Dinheiro' : novaTransacao.forma
                        })}
                        className="bg-slate-900 border border-sky-700 rounded-lg px-3 py-2 text-xs font-bold text-sky-300"
                      >
                        <option value="faturado">Caixa: Faturado (Vendas)</option>
                        <option value="troco">Caixa: Troco (R$ {fundoTrocoBase})</option>
                      </select>

                      <select
                        value={novaTransacao.tipo}
                        onChange={(e) => setNovaTransacao({ ...novaTransacao, tipo: e.target.value })}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold"
                      >
                        <option value="saida">Retirada / Saída (-)</option>
                        <option value="entrada">Entrada / Reposição (+)</option>
                      </select>

                      <select
                        value={novaTransacao.origem_caixa === 'troco' ? 'Dinheiro' : novaTransacao.forma}
                        disabled={novaTransacao.origem_caixa === 'troco'}
                        onChange={(e) => setNovaTransacao({ ...novaTransacao, forma: e.target.value })}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs disabled:opacity-60"
                      >
                        <option>Dinheiro</option>
                        <option>Pix</option>
                        <option>Cartão de Débito</option>
                        <option>Cartão de Crédito</option>
                        <option>A Receber (Fiado)</option>
                      </select>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder={novaTransacao.origem_caixa === 'troco' ? 'Motivo (Ex: Troco p/ cliente / Sangria troco)' : 'Descrição (Ex: Compra de chaves / Almoço)'}
                        required
                        value={novaTransacao.desc}
                        onChange={(e) => setNovaTransacao({ ...novaTransacao, desc: e.target.value })}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="Valor R$"
                          required
                          value={novaTransacao.valor}
                          onChange={(e) => setNovaTransacao({ ...novaTransacao, valor: e.target.value })}
                          className="w-28 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                        />
                        <button type="submit" className={`${temaUnidade.botaoAtivo} font-bold px-4 py-2 rounded-lg text-xs`}>
                          Salvar
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                <div className="space-y-2.5 max-h-[460px] overflow-y-auto">
                  {transacoesFiltradas.map((t) => {
                    const ehTrocoItem = isMovimentacaoTroco(t);
                    return (
                      <div key={t.id} className={`bg-slate-950 p-3 rounded-xl border text-xs space-y-2 ${ehTrocoItem ? 'border-sky-800/70' : 'border-slate-800'}`}>
                        {transacaoEditando && transacaoEditando.id === t.id ? (
                          <div className="space-y-2.5">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <select
                                value={transacaoEditando.origem_caixa || (isMovimentacaoTroco(transacaoEditando) ? 'troco' : 'faturado')}
                                onChange={(e) => setTransacaoEditando({
                                  ...transacaoEditando,
                                  origem_caixa: e.target.value,
                                  forma: e.target.value === 'troco' ? 'Dinheiro' : transacaoEditando.forma
                                })}
                                className="bg-slate-900 border border-sky-700 rounded-lg px-2.5 py-2 text-xs text-sky-300 font-bold"
                              >
                                <option value="faturado">Caixa: Faturado</option>
                                <option value="troco">Caixa: Troco</option>
                              </select>
                              <select
                                value={transacaoEditando.tipo}
                                onChange={(e) => setTransacaoEditando({ ...transacaoEditando, tipo: e.target.value })}
                                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs"
                              >
                                <option value="entrada">Entrada (+)</option>
                                <option value="saida">Saída (-)</option>
                              </select>
                              <select
                                value={(transacaoEditando.origem_caixa === 'troco') ? 'Dinheiro' : transacaoEditando.forma}
                                disabled={transacaoEditando.origem_caixa === 'troco'}
                                onChange={(e) => setTransacaoEditando({ ...transacaoEditando, forma: e.target.value })}
                                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs disabled:opacity-60"
                              >
                                <option>Pix</option>
                                <option>Dinheiro</option>
                                <option>Cartão de Crédito</option>
                                <option>Cartão de Débito</option>
                                <option>Boleto</option>
                                <option>A Receber (Fiado)</option>
                              </select>
                            </div>
                            <input
                              type="text"
                              value={transacaoEditando.desc.replace(/^\[TROCO\]\s*/i, '')}
                              onChange={(e) => setTransacaoEditando({ ...transacaoEditando, desc: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                            />
                            <div className="flex items-center justify-between gap-2">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={transacaoEditando.valor}
                                onChange={(e) => setTransacaoEditando({ ...transacaoEditando, valor: e.target.value })}
                                className="w-32 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-amber-400"
                              />
                              <div className="flex gap-2">
                                <button onClick={salvarEdicaoTransacao} className="bg-emerald-500 text-slate-950 font-bold px-3 py-2 rounded-lg flex items-center gap-1">
                                  <Check size={14} /> Salvar
                                </button>
                                <button onClick={() => setTransacaoEditando(null)} className="bg-slate-800 text-slate-300 px-3 py-2 rounded-lg flex items-center gap-1">
                                  <X size={14} /> Cancelar
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div>
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${ehTrocoItem ? 'bg-sky-950 text-sky-300 border border-sky-700/60' : 'bg-slate-800 text-slate-300'}`}>
                                  {ehTrocoItem ? 'Caixa Troco' : 'Faturado'}
                                </span>
                                <span className="text-slate-500 text-[11px]">
                                  {t.data} • {t.forma} {unidadeAtiva === 'todas' ? `• ${(t.unidade || 'ponto1').toUpperCase()}` : ''}
                                </span>
                              </div>
                              <p className="font-semibold text-slate-100 text-sm leading-snug break-words">
                                {t.desc.replace(/^\[TROCO\]\s*/i, '')}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-900 pt-2">
                              <span className={`text-sm font-bold ${t.tipo === 'entrada' ? (t.forma === 'A Receber (Fiado)' ? 'text-purple-400' : 'text-emerald-400') : 'text-red-400'}`}>
                                {t.tipo === 'entrada' ? '+' : '-'} R$ {Number(t.valor).toFixed(2)}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {t.tipo === 'entrada' && !ehTrocoItem && (
                                  <button
                                    onClick={() => abrirPortalNFSe({ cliente: 'Cliente', desc: t.desc, valor: t.valor })}
                                    className="bg-indigo-950 hover:bg-indigo-900 text-indigo-300 px-2 py-1.5 rounded-lg border border-indigo-800 flex items-center gap-1 text-[11px] font-semibold"
                                    title="Copiar dados e abrir Portal NFS-e"
                                  >
                                    <Receipt size={12} /> NFS-e
                                  </button>
                                )}
                                {t.forma === 'A Receber (Fiado)' && (
                                  <button onClick={() => quitarPendenciaReceber(t)} className="bg-purple-600 hover:bg-purple-500 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold">
                                    Receber
                                  </button>
                                )}
                                <button
                                  onClick={() => setTransacaoEditando({
                                    ...t,
                                    origem_caixa: isMovimentacaoTroco(t) ? 'troco' : 'faturado'
                                  })}
                                  className="bg-slate-900 text-amber-400 p-1.5 rounded-lg border border-slate-800"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button onClick={() => excluirTransacao(t.id)} className="bg-slate-900 text-red-400 p-1.5 rounded-lg border border-slate-800">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold text-sm ${temaUnidade.textoDestaque}`}>Calendário de Boletos ({contasUnidade.length})</h3>
                  <button
                    onClick={() => toggleForm('boleto')}
                    className={`${temaUnidade.botaoAtivo} text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1`}
                  >
                    {formAberto.boleto ? <><X size={13} /> Fechar</> : <><Plus size={13} /> Agendar Boleto</>}
                  </button>
                </div>

                {formAberto.boleto && (
                  <form onSubmit={criarContaPagar} className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-700">
                    <input
                      type="text"
                      placeholder="Descrição do Boleto / Fornecedor / Aluguel *"
                      required
                      value={novaConta.desc}
                      onChange={(e) => setNovaConta({ ...novaConta, desc: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="Valor R$ *"
                        required
                        value={novaConta.valor}
                        onChange={(e) => setNovaConta({ ...novaConta, valor: e.target.value })}
                        className="w-32 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                      />
                      <input
                        type="date"
                        required
                        value={novaConta.vencimento}
                        onChange={(e) => setNovaConta({ ...novaConta, vencimento: e.target.value })}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                      />
                      <button type="submit" className={`${temaUnidade.botaoAtivo} font-bold px-4 rounded-lg text-xs`}>
                        Salvar
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-2.5 max-h-[460px] overflow-y-auto">
                  {contasUnidade.map((c) => {
                    const vencido = c.status === 'pendente' && c.vencimento < hojeISO;
                    const venceHoje = c.status === 'pendente' && c.vencimento === hojeISO;
                    return (
                      <div key={c.id} className={`p-3 rounded-xl border text-xs space-y-2 ${vencido ? 'bg-red-950/30 border-red-800' : venceHoje ? 'bg-amber-950/30 border-amber-700' : 'bg-slate-950 border-slate-800'}`}>
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <p className="font-bold text-sm text-slate-100">{c.desc}</p>
                            <span className="text-slate-400 block mt-0.5">
                              Vencimento: <strong>{c.vencimento}</strong>
                              {vencido && <span className="text-red-400 font-bold ml-1.5">(VENCIDO)</span>}
                              {venceHoje && <span className="text-amber-400 font-bold ml-1.5">(VENCE HOJE)</span>}
                            </span>
                          </div>
                          <span className="font-bold text-sm text-amber-400 shrink-0">R$ {Number(c.valor).toFixed(2)}</span>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-900 pt-2">
                          {c.status === 'pendente' ? (
                            <div className="flex flex-wrap gap-1.5">
                              <button onClick={() => darBaixaBoleto(c, false)} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-2.5 py-1.5 rounded-lg text-xs">
                                Só Marcar Pago (Sem Caixa)
                              </button>
                              <button onClick={() => darBaixaBoleto(c, true)} className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold px-2.5 py-1.5 rounded-lg text-xs border border-slate-700">
                                Pagar c/ Caixa
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => reabrirBoleto(c)} className="text-emerald-400 font-bold hover:underline">
                              Quitado na Agenda (Toque p/ reabrir)
                            </button>
                          )}
                          <button onClick={() => excluirContaPagar(c.id)} className="text-red-400 p-1">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'estoque' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className={`font-bold text-base ${temaUnidade.textoDestaque}`}>
                Estoque — {infoUnidadeAtual.nome} ({estoqueUnidade.length})
              </h2>
              <button
                onClick={() => toggleForm('estoque')}
                className={`${temaUnidade.botaoAtivo} font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow`}
              >
                {formAberto.estoque ? <><X size={16} /> Fechar Formulário</> : <><Plus size={16} /> Cadastrar Chave / Produto</>}
              </button>
            </div>

            {itensEstoqueBaixo.length > 0 && (
              <div className="bg-red-950/50 border border-red-800 p-3 rounded-xl flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-red-300 font-medium">
                  Alerta: <strong>{itensEstoqueBaixo.length} modelo(s)</strong> atingiram o estoque mínimo.
                </span>
                <div className="flex gap-2">
                  <button onClick={gerarPedidoDistribuidorWhatsApp} className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <Share2 size={13} /> Pedido WhatsApp
                  </button>
                  <button onClick={() => setApenasEstoqueBaixo(!apenasEstoqueBaixo)} className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                    {apenasEstoqueBaixo ? 'Ver Todos' : 'Filtrar Baixos'}
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">Modelos ({infoUnidadeAtual.nome})</span>
                <p className="text-xl font-bold text-slate-100 mt-1">{estoqueUnidade.length} itens</p>
              </div>
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">Capital Investido (Custo)</span>
                <p className="text-xl font-bold text-amber-400 mt-1">R$ {capitalTotalEstoque.toFixed(2)}</p>
              </div>
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">Potencial de Venda</span>
                <p className="text-xl font-bold text-emerald-400 mt-1">R$ {potencialVendaEstoque.toFixed(2)}</p>
              </div>
            </div>

            {formAberto.estoque && (
              <form onSubmit={salvarNovaChave} className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 text-sm">
                    {editandoEstoqueId ? `Editando Item: ${editandoEstoqueId}` : 'Cadastrar Novo Item'}
                  </span>
                  {editandoEstoqueId && (
                    <button type="button" onClick={cancelarEdicaoEstoque} className="text-xs text-slate-400 flex items-center gap-1">
                      <X size={14} /> Cancelar Edição
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
                  <input
                    type="text"
                    placeholder="Código (Ex: Y1)"
                    value={novaChave.id}
                    disabled={!!editandoEstoqueId}
                    onChange={(e) => setNovaChave({ ...novaChave, id: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm disabled:opacity-50"
                  />
                  <input
                    type="text"
                    placeholder="Nome da Chave / Fechadura *"
                    required
                    value={novaChave.nome}
                    onChange={(e) => setNovaChave({ ...novaChave, nome: e.target.value })}
                    className="col-span-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                  />
                  <select
                    value={novaChave.cat}
                    onChange={(e) => setNovaChave({ ...novaChave, cat: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
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
                    min="0"
                    placeholder="Qtd"
                    value={novaChave.qtd}
                    onChange={(e) => setNovaChave({ ...novaChave, qtd: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Custo R$"
                    value={novaChave.custo}
                    onChange={(e) => setNovaChave({ ...novaChave, custo: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Venda R$ *"
                    required
                    value={novaChave.venda}
                    onChange={(e) => setNovaChave({ ...novaChave, venda: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                  />
                </div>
                <button type="submit" className={`w-full sm:w-auto ${temaUnidade.botaoAtivo} font-bold px-5 py-2.5 rounded-lg text-sm`}>
                  {editandoEstoqueId ? 'Salvar Alterações' : 'Salvar no Estoque'}
                </button>
              </form>
            )}

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Buscar código ou nome..."
                    value={buscaEstoque}
                    onChange={(e) => setBuscaEstoque(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-9 py-2 text-xs"
                  />
                  {buscaEstoque && (
                    <button
                      type="button"
                      onClick={() => setBuscaEstoque('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <select
                  value={filtroCatEstoque}
                  onChange={(e) => setFiltroCatEstoque(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs"
                >
                  <option value="Todas">Todas as Categorias</option>
                  <option>Yale / Comum</option>
                  <option>Tetra</option>
                  <option>Automotiva / Canivete</option>
                  <option>Multiponto</option>
                  <option>Gorge / Antiga</option>
                  <option>Fechaduras / Cadeados</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {estoqueFiltrado.map((item) => {
                  const custo = Number(item.custo || 0);
                  const venda = Number(item.venda || 0);
                  const lucro = venda - custo;
                  return (
                    <div key={item.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col justify-between gap-2">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[11px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded mr-1.5">{item.id}</span>
                          <span className="text-[11px] text-slate-400">{item.cat}</span>
                          <h4 className="font-bold text-sm text-slate-100 mt-1">{item.nome}</h4>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 ${item.qtd <= item.minimo ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-slate-800 text-emerald-400'}`}>
                          {item.qtd} un
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-900 pt-2 text-xs">
                        <div className="space-x-3">
                          <span className="text-slate-400">Custo: <strong>R$ {custo.toFixed(2)}</strong></span>
                          <span className="text-amber-400">Venda: <strong>R$ {venda.toFixed(2)}</strong></span>
                          <span className="text-emerald-400">Lucro: <strong>+R$ {lucro.toFixed(2)}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => alterarQtdEstoque(item, 1)} className="bg-slate-800 px-2.5 py-1.5 rounded-lg font-bold">+1</button>
                          <button onClick={() => alterarQtdEstoque(item, -1)} className="bg-slate-800 px-2.5 py-1.5 rounded-lg font-bold">-1</button>
                          <button onClick={() => iniciarEdicaoEstoque(item)} className="bg-slate-900 text-amber-400 p-1.5 rounded-lg border border-slate-800">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => excluirItemEstoque(item.id)} className="bg-slate-900 text-red-400 p-1.5 rounded-lg border border-slate-800">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'clientes' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className={`font-bold text-base ${temaUnidade.textoDestaque}`}>
                Base de Clientes ({clientes.length})
              </h2>
              <button
                onClick={() => {
                  if (formAberto.cliente) {
                    cancelarEdicaoCliente();
                  } else {
                    setNovoCliente({ id: null, nome: '', tel: '', endereco: '', tipo: 'Residencial', obs: '' });
                    toggleForm('cliente', true);
                  }
                }}
                className={`${temaUnidade.botaoAtivo} font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow`}
              >
                {formAberto.cliente ? <><X size={16} /> Fechar Formulário</> : <><Plus size={16} /> Cadastrar Cliente</>}
              </button>
            </div>

            {formAberto.cliente && (
              <form onSubmit={salvarCliente} className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-amber-400">
                    {novoCliente.id ? `Editando Cliente: ${novoCliente.nome}` : 'Novo Cadastro de Cliente'}
                  </span>
                  {novoCliente.id && (
                    <button type="button" onClick={cancelarEdicaoCliente} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                      <X size={14} /> Cancelar Edição
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <input
                    type="text"
                    placeholder="Nome / Referência *"
                    required
                    value={novoCliente.nome}
                    onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                  />
                  <input
                    type="tel"
                    placeholder="WhatsApp (com DDD)"
                    value={novoCliente.tel}
                    onChange={(e) => setNovoCliente({ ...novoCliente, tel: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Endereço Completo"
                    value={novoCliente.endereco}
                    onChange={(e) => setNovoCliente({ ...novoCliente, endereco: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                  />
                  <select
                    value={novoCliente.tipo}
                    onChange={(e) => setNovoCliente({ ...novoCliente, tipo: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                  >
                    <option>Residencial</option>
                    <option>Comercial / Condomínio</option>
                    <option>Automotivo</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Obs (CPF/CNPJ, Placa, Fechadura)"
                    value={novoCliente.obs}
                    onChange={(e) => setNovoCliente({ ...novoCliente, obs: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                  />
                </div>
                <button type="submit" className={`${temaUnidade.botaoAtivo} font-bold px-5 py-2.5 rounded-lg text-sm`}>
                  {novoCliente.id ? 'Salvar Alterações do Cliente' : 'Guardar Cliente'}
                </button>
              </form>
            )}

            {clienteHistoricoSelecionado && (
              <div className="bg-slate-900 p-4 rounded-xl border-2 border-amber-500 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-amber-400 text-sm">
                    Histórico Completo (PDV, OS e Socorros): {clienteHistoricoSelecionado.nome}
                  </h3>
                  <button onClick={() => setClienteHistoricoSelecionado(null)} className="text-slate-400">
                    <X size={18} />
                  </button>
                </div>
                <div className="space-y-2 text-xs max-h-64 overflow-y-auto">
                  {transacoes
                    .filter((t) => t.desc.toLowerCase().includes(clienteHistoricoSelecionado.nome.toLowerCase()))
                    .map((t) => (
                      <div key={t.id} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                        <span>{t.data} — {t.desc}</span>
                        <span className="text-emerald-400 font-bold shrink-0 ml-2">R$ {Number(t.valor).toFixed(2)}</span>
                      </div>
                    ))}
                  {transacoes.filter((t) => t.desc.toLowerCase().includes(clienteHistoricoSelecionado.nome.toLowerCase())).length === 0 && (
                    <p className="text-slate-500">Nenhuma movimentação encontrada para este nome.</p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Pesquisar cliente por nome, telefone ou observação..."
                  value={buscaClienteCrm}
                  onChange={(e) => setBuscaClienteCrm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-sm"
                />
                {buscaClienteCrm && (
                  <button
                    type="button"
                    onClick={() => setBuscaClienteCrm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {clientes
                  .filter((c) => c.nome.toLowerCase().includes(buscaClienteCrm.toLowerCase()) || (c.tel || '').includes(buscaClienteCrm) || (c.obs || '').toLowerCase().includes(buscaClienteCrm.toLowerCase()))
                  .map((c) => (
                    <div key={c.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <span className="text-[10px] bg-slate-800 text-amber-400 px-2 py-0.5 rounded">{c.tipo}</span>
                          <h3 className="font-bold text-base mt-1 truncate">{c.nome}</h3>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Phone size={12} /> {c.tel || 'Sem telefone'}</p>
                          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><MapPin size={12} /> {c.endereco || 'Sem endereço'}</p>
                          {c.obs && <p className="text-xs text-amber-300/80 mt-1 break-words">{c.obs}</p>}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => iniciarEdicaoCliente(c)}
                            className="bg-slate-950 hover:bg-slate-800 text-amber-400 p-1.5 rounded-lg border border-slate-800"
                            title="Editar dados do cliente"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => excluirCliente(c.id)}
                            className="bg-slate-950 hover:bg-slate-800 text-red-400 p-1.5 rounded-lg border border-slate-800"
                            title="Excluir cliente"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => setClienteHistoricoSelecionado(c)}
                        className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-amber-400 font-semibold py-2 rounded-lg"
                      >
                        Ver Histórico & Garantias
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-2 py-1.5 grid grid-cols-5 gap-1 z-30">
        {[
          { id: 'dashboard', label: 'Hoje', icon: LayoutDashboard },
          { id: 'pdv', label: 'PDV', icon: ShoppingCart },
          { id: 'os', label: 'OS', icon: Wrench },
          { id: 'orcamento', label: 'Standby', icon: FolderClock },
          { id: 'caixa', label: 'Caixa', icon: DollarSign },
        ].map((item) => {
          const Icone = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setAbaAtiva(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 rounded-lg text-[10px] font-bold ${
                abaAtiva === item.id ? `${temaUnidade.textoDestaque} bg-slate-800/80` : 'text-slate-400'
              }`}
            >
              <Icone size={17} />
              <span className="mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}