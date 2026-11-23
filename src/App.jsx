import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';
import { montarURLWhatsAppSeguro } from './utils/formatters';
import ConfirmModal from './components/ConfirmModal';
import ModalFechamento from './components/ModalFechamento';
import ClienteAutocomplete from './components/ClienteAutocomplete';
import { 
  Wrench, Package, DollarSign, Calendar, Users, FileText, 
  Plus, Trash2, Edit2, CheckCircle, Search, Phone, 
  MapPin, RefreshCw, ShoppingCart, Share2, AlertCircle, X, Check, 
  LayoutDashboard, Download, ShieldCheck, Zap, Clock, Award, Calculator, 
  Settings, CreditCard, UserCheck, Send, FolderClock, UserPlus, ChevronUp, 
  ExternalLink, Receipt, ClipboardCheck
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

  const [confirmacao, setConfirmacao] = useState(null);
  const pedirConfirmacao = (titulo, mensagem, onConfirmar, textoBotao = 'Excluir', perigo = true) => {
    setConfirmacao({ titulo, mensagem, onConfirmar, textoBotao, perigo });
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
        { data: funcs },
        { data: fech }
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
        supabase.from('funcionarios').select('*').order('nome', { ascending: true }),
        supabase.from('fechamentos_caixa').select('*').order('id', { ascending: false }).limit(30)
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
      if (fech && fech.length > 0) {
        setHistoricoFechamentos(fech);
        localStorage.setItem('luisinho_fechamentos_caixa', JSON.stringify(fech));
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
      .channel('sincronizacao_luisinho_v35')
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
        setConfirmacao(null);
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

  const removerFuncionario = (id) => {
    pedirConfirmacao('Remover Funcionário', 'Remover este funcionário da lista?', async () => {
      const novaLista = funcionarios.filter((f) => f.id !== id);
      setFuncionarios(novaLista);
      localStorage.setItem('luisinho_funcionarios', JSON.stringify(novaLista));
      await supabase.from('funcionarios').delete().eq('id', id);
      mostrarToast('Funcionário removido.');
    });
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

  const excluirItemTabelaPrecos = (id) => {
    pedirConfirmacao('Excluir Item da Tabela', 'Remover este item da tabela de preços?', async () => {
      await supabase.from('tabela_precos').delete().eq('id', id);
      mostrarToast('Item removido da tabela.');
      carregarDados(true);
    });
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

  const excluirItemEstoque = (id) => {
    pedirConfirmacao('Remover do Estoque', 'Tem certeza que deseja remover este item do estoque?', async () => {
      await supabase.from('estoque').delete().eq('id', id);
      mostrarToast('Item removido do estoque.');
      carregarDados(true);
    });
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

  const excluirOS = (id) => {
    pedirConfirmacao('Excluir Ordem de Serviço', 'Deseja excluir permanentemente esta OS?', async () => {
      await supabase.from('ordens_servico').delete().eq('id', id);
      mostrarToast('OS excluída.');
      carregarDados(true);
    });
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

  const excluirAgendamento = (id) => {
    pedirConfirmacao('Excluir Socorro', 'Remover este agendamento de socorro?', async () => {
      await supabase.from('agendamentos').delete().eq('id', id);
      mostrarToast('Socorro excluído.');
      carregarDados(true);
    });
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

  const excluirCliente = (id) => {
    pedirConfirmacao('Excluir Cliente', 'Remover este cliente do cadastro?', async () => {
      await supabase.from('clientes').delete().eq('id', id);
      if (clienteHistoricoSelecionado?.id === id) setClienteHistoricoSelecionado(null);
      mostrarToast('Cliente removido.');
      carregarDados(true);
    });
  };
