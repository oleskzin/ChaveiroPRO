import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';
import { montarURLWhatsAppSeguro } from './utils/formatters';
import ConfirmModal from './components/ConfirmModal';
import ModalFechamento from './components/ModalFechamento';
import AbaPDV from './components/AbaPDV';
import AbaSimulador from './components/AbaSimulador';
import AbaOS from './components/AbaOS';
import AbaSocorros from './components/AbaSocorros';
import AbaOrcamentos from './components/AbaOrcamentos';
import AbaCaixa from './components/AbaCaixa';
import AbaEstoque from './components/AbaEstoque';
import AbaClientes from './components/AbaClientes';
import {
  Wrench, Package, DollarSign, Calendar, Users, FileText,
  Trash2, CheckCircle, RefreshCw, ShoppingCart, Share2,
  AlertCircle, X, LayoutDashboard, Zap, Clock, Award,
  Calculator, Settings, UserCheck, FolderClock, ExternalLink,
  Receipt, ClipboardCheck
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
      .channel('sincronizacao_luisinho_v4')
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
  };const salvarNovaChave = async (e) => {
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

  const transferirEstoqueEntrePontos = async (itemId, qtdMov, origemId, destinoId) => {
    const itemOrigem = estoque.find((e) => e.id === itemId && (e.unidade || 'ponto1') === origemId);
    if (!itemOrigem) return false;
    const qtdNum = Math.max(1, Number(qtdMov));
    if (qtdNum > Number(itemOrigem.qtd)) {
      mostrarToast(`Quantidade maior que o estoque disponível (${itemOrigem.qtd} un).`, 'erro');
      return false;
    }

    const novaQtdOrigem = Number(itemOrigem.qtd) - qtdNum;
    await supabase.from('estoque').update({ qtd: novaQtdOrigem }).eq('id', itemOrigem.id);

    const itemDestino = estoque.find(
      (e) => (e.unidade || 'ponto1') === destinoId && e.nome.toLowerCase() === itemOrigem.nome.toLowerCase()
    );

    if (itemDestino) {
      await supabase
        .from('estoque')
        .update({ qtd: Number(itemDestino.qtd || 0) + qtdNum })
        .eq('id', itemDestino.id);
    } else {
      const novoIdDestino = `${itemOrigem.id}-${destinoId === 'ponto2' ? 'P2' : 'P1'}-${Date.now().toString().slice(-3)}`;
      await supabase.from('estoque').insert([{
        id: novoIdDestino,
        nome: itemOrigem.nome,
        cat: itemOrigem.cat,
        qtd: qtdNum,
        minimo: itemOrigem.minimo || 3,
        custo: itemOrigem.custo || 0,
        venda: itemOrigem.venda || 0,
        vendas_total: 0,
        unidade: destinoId
      }]);
    }

    mostrarToast(`Transferido ${qtdNum}x ${itemOrigem.nome} para ${destinoId === 'ponto2' ? 'Ponto 2' : 'Ponto 1'}!`);
    carregarDados(true);
    return true;
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

  const reporTrocoAutomatico = (valorFaltante) => {
    if (valorFaltante <= 0) return;
    pedirConfirmacao(
      'Recompor Caixa de Troco',
      `Deseja transferir R$ ${valorFaltante.toFixed(2)} do dinheiro faturado para o Caixa de Troco?`,
      async () => {
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
      },
      'Confirmar Reposição',
      false
    );
  };

  const transferirTrocoEntrePontos = async (valorMov, origemId, destinoId) => {
    const valorNum = Number(valorMov);
    if (!valorNum || valorNum <= 0) return false;

    const agora = Date.now();
    const saidaOrigem = {
      id: agora,
      tipo: 'saida',
      origem_caixa: 'troco',
      desc: `[TROCO] Transferência para ${destinoId === 'ponto2' ? 'Ponto 2' : 'Ponto 1'}`,
      valor: valorNum,
      custo_insumo: 0,
      forma: 'Dinheiro',
      data: hojeStr,
      timestamp: agora,
      unidade: origemId
    };
    const entradaDestino = {
      id: agora + 1,
      tipo: 'entrada',
      origem_caixa: 'troco',
      desc: `[TROCO] Recebido de ${origemId === 'ponto2' ? 'Ponto 2' : 'Ponto 1'}`,
      valor: valorNum,
      custo_insumo: 0,
      forma: 'Dinheiro',
      data: hojeStr,
      timestamp: agora + 1,
      unidade: destinoId
    };

    const { error } = await supabase.from('transacoes').insert([saidaOrigem, entradaDestino]);
    if (error) {
      const { origem_caixa: o1, ...b1 } = saidaOrigem;
      const { origem_caixa: o2, ...b2 } = entradaDestino;
      await supabase.from('transacoes').insert([b1, b2]);
    }

    mostrarToast(`Troco de R$ ${valorNum.toFixed(2)} transferido para ${destinoId === 'ponto2' ? 'Ponto 2' : 'Ponto 1'}!`);
    carregarDados(true);
    return true;
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

  const excluirTransacao = (id) => {
    pedirConfirmacao('Excluir Lançamento', 'Deseja excluir esta movimentação do caixa?', async () => {
      await supabase.from('transacoes').delete().eq('id', id);
      mostrarToast('Lançamento excluído.');
      carregarDados(true);
    });
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

  const excluirContaPagar = (id) => {
    pedirConfirmacao('Excluir Boleto', 'Excluir este boleto da agenda?', async () => {
      await supabase.from('contas_pagar').delete().eq('id', id);
      mostrarToast('Boleto excluído.');
      carregarDados(true);
    });
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
    await supabase.from('fechamentos_caixa').upsert([novoFechamento]);

    if (acao === 'copiar') {
      try {
        await navigator.clipboard.writeText(relatorioTexto);
        mostrarToast('Relatório de fechamento copiado!');
      } catch {
        mostrarToast('Fechamento salvo!');
      }
    } else if (acao === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(relatorioTexto)}`, '_blank');
    } else {
      mostrarToast('Fechamento diário salvo na nuvem!');
    }
  };

  const excluirFechamentoHistorico = (id) => {
    pedirConfirmacao(
      'Excluir Fechamento',
      'Deseja apagar este relatório salvo do histórico?',
      async () => {
        const filtrada = historicoFechamentos.filter((f) => f.id !== id);
        setHistoricoFechamentos(filtrada);
        localStorage.setItem('luisinho_fechamentos_caixa', JSON.stringify(filtrada));
        await supabase.from('fechamentos_caixa').delete().eq('id', id);
        mostrarToast('Fechamento removido.');
      }
    );
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

  const excluirOrcamentoSalvo = (id) => {
    pedirConfirmacao('Excluir Orçamento', 'Remover este orçamento da lista?', async () => {
      await supabase.from('orcamentos').delete().eq('id', id);
      mostrarToast('Orçamento excluído.');
      carregarDados(true);
    });
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

      <ConfirmModal
        confirmacao={confirmacao}
        onFechar={() => setConfirmacao(null)}
      />

      <ModalFechamento
        aberto={modalFechamentoCaixa}
        onFechar={() => setModalFechamentoCaixa(false)}
        hojeStr={hojeStr}
        totalGavetaFisica={totalGavetaFisica}
        dinheiroContado={dinheiroContadoFechamento}
        setDinheiroContado={setDinheiroContadoFechamento}
        obsFechamento={obsFechamento}
        setObsFechamento={setObsFechamento}
        textoRelatorio={gerarTextoFechamentoDiario()}
        onSalvar={registrarESalvarFechamento}
        historico={historicoFechamentos}
        onExcluirHistorico={excluirFechamentoHistorico}
        mostrarToast={mostrarToast}
      />

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
                  v4.0
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
          <AbaPDV
            temaUnidade={temaUnidade}
            infoUnidadeAtual={infoUnidadeAtual}
            loading={loading}
            clientes={clientes}
            mostrarToast={mostrarToast}
            estoqueUnidade={estoqueUnidade}
            buscaPdv={buscaPdv}
            setBuscaPdv={setBuscaPdv}
            inputBuscaPdvRef={inputBuscaPdvRef}
            adicionarAoCarrinho={adicionarAoCarrinho}
            listaServicosBase={listaServicosBase}
            gerenciandoServicosPdv={gerenciandoServicosPdv}
            setGerenciandoServicosPdv={setGerenciandoServicosPdv}
            servicoRapidoForm={servicoRapidoForm}
            setServicoRapidoForm={setServicoRapidoForm}
            salvarServicoRapidoPdv={salvarServicoRapidoPdv}
            excluirItemTabelaPrecos={excluirItemTabelaPrecos}
            adicionarServicoAvulsoPdv={adicionarServicoAvulsoPdv}
            servicoAvulsoDesc={servicoAvulsoDesc}
            setServicoAvulsoDesc={setServicoAvulsoDesc}
            servicoAvulsoValor={servicoAvulsoValor}
            setServicoAvulsoValor={setServicoAvulsoValor}
            carrinho={carrinho}
            setCarrinho={setCarrinho}
            alterarQtdItemCarrinho={alterarQtdItemCarrinho}
            alterarPrecoItemCarrinho={alterarPrecoItemCarrinho}
            totalItensCarrinho={totalItensCarrinho}
            descontoPdv={descontoPdv}
            setDescontoPdv={setDescontoPdv}
            totalLiquidoPdv={totalLiquidoPdv}
            formaPgto={formaPgto}
            setFormaPgto={setFormaPgto}
            taxaCartaoIdPdv={taxaCartaoIdPdv}
            setTaxaCartaoIdPdv={setTaxaCartaoIdPdv}
            taxasCartaoDisponiveis={taxasCartaoDisponiveis}
            valorTaxaMaquininhaPdv={valorTaxaMaquininhaPdv}
            clientePdv={clientePdv}
            setClientePdv={setClientePdv}
            finalizarVendaPdv={finalizarVendaPdv}
            comandaMobileAberta={comandaMobileAberta}
            setComandaMobileAberta={setComandaMobileAberta}
          />
        )}

        {abaAtiva === 'simulador' && (
          <AbaSimulador
            temaUnidade={temaUnidade}
            clientes={clientes}
            mostrarToast={mostrarToast}
            listaServicosBase={listaServicosBase}
            calcServicoId={calcServicoId}
            setCalcServicoId={setCalcServicoId}
            listaPecasTabela={listaPecasTabela}
            calcPecaId={calcPecaId}
            setCalcPecaId={setCalcPecaId}
            estoqueUnidade={estoqueUnidade}
            calcEstoqueId={calcEstoqueId}
            setCalcEstoqueId={setCalcEstoqueId}
            calcValorExtraManual={calcValorExtraManual}
            setCalcValorExtraManual={setCalcValorExtraManual}
            listaAdicionais={listaAdicionais}
            calcAdicionaisIds={calcAdicionaisIds}
            setCalcAdicionaisIds={setCalcAdicionaisIds}
            calcRepassarTaxa={calcRepassarTaxa}
            setCalcRepassarTaxa={setCalcRepassarTaxa}
            calcTaxaId={calcTaxaId}
            setCalcTaxaId={setCalcTaxaId}
            taxasCartaoDisponiveis={taxasCartaoDisponiveis}
            montarResumoSimulador={montarResumoSimulador}
            valorBaseCalc={valorBaseCalc}
            valorAdicionaisCalc={valorAdicionaisCalc}
            subtotalSimulador={subtotalSimulador}
            taxaSimuladorObj={taxaSimuladorObj}
            totalFinalSimulador={totalFinalSimulador}
            calcCliente={calcCliente}
            setCalcCliente={setCalcCliente}
            salvarSimuladorEmStandby={salvarSimuladorEmStandby}
            enviarSimuladorParaPDV={enviarSimuladorParaPDV}
            enviarSimuladorParaOS={enviarSimuladorParaOS}
            tabelaPrecos={tabelaPrecos}
            formAberto={formAberto}
            toggleForm={toggleForm}
            novoItemTabela={novoItemTabela}
            setNovoItemTabela={setNovoItemTabela}
            salvarItemTabelaPrecos={salvarItemTabelaPrecos}
            excluirItemTabelaPrecos={excluirItemTabelaPrecos}
          />
        )}

        {abaAtiva === 'os' && (
          <AbaOS
            temaUnidade={temaUnidade}
            infoUnidadeAtual={infoUnidadeAtual}
            unidadeOperacional={unidadeOperacional}
            clientes={clientes}
            mostrarToast={mostrarToast}
            funcionarios={funcionarios}
            funcionarioPadraoUnidade={funcionarioPadraoUnidade}
            setModalConfigUnidades={setModalConfigUnidades}
            estoqueUnidade={estoqueUnidade}
            osPendentes={osPendentes}
            osConcluidas={osConcluidas}
            osUnidade={osUnidade}
            osExibidas={osExibidas}
            filtroStatusOS={filtroStatusOS}
            setFiltroStatusOS={setFiltroStatusOS}
            formAberto={formAberto}
            toggleForm={toggleForm}
            novaOS={novaOS}
            setNovaOS={setNovaOS}
            itemTempOS={itemTempOS}
            setItemTempOS={setItemTempOS}
            adicionarMaterialNaOS={adicionarMaterialNaOS}
            removerMaterialDaOS={removerMaterialDaOS}
            criarOS={criarOS}
            enviarDiretoParaFuncionario={enviarDiretoParaFuncionario}
            concluirOS={concluirOS}
            setComprovanteAtivo={setComprovanteAtivo}
            abrirPortalNFSe={abrirPortalNFSe}
            excluirOS={excluirOS}
          />
        )}

        {abaAtiva === 'agenda' && (
          <AbaSocorros
            temaUnidade={temaUnidade}
            infoUnidadeAtual={infoUnidadeAtual}
            unidadeOperacional={unidadeOperacional}
            clientes={clientes}
            mostrarToast={mostrarToast}
            funcionarios={funcionarios}
            funcionarioPadraoUnidade={funcionarioPadraoUnidade}
            estoqueUnidade={estoqueUnidade}
            socorrosPendentes={socorrosPendentes}
            socorrosConcluidos={socorrosConcluidos}
            agendaUnidade={agendaUnidade}
            socorrosExibidos={socorrosExibidos}
            filtroStatusAgenda={filtroStatusAgenda}
            setFiltroStatusAgenda={setFiltroStatusAgenda}
            formAberto={formAberto}
            toggleForm={toggleForm}
            novoAgendamento={novoAgendamento}
            setNovoAgendamento={setNovoAgendamento}
            itemTempAg={itemTempAg}
            setItemTempAg={setItemTempAg}
            adicionarMaterialNoSocorro={adicionarMaterialNoSocorro}
            removerMaterialDoSocorro={removerMaterialDoSocorro}
            criarAgendamento={criarAgendamento}
            enviarDiretoParaFuncionario={enviarDiretoParaFuncionario}
            concluirAgendamento={concluirAgendamento}
            setComprovanteAtivo={setComprovanteAtivo}
            excluirAgendamento={excluirAgendamento}
          />
        )}

        {abaAtiva === 'orcamento' && (
          <AbaOrcamentos
            temaUnidade={temaUnidade}
            infoUnidadeAtual={infoUnidadeAtual}
            unidadeOperacional={unidadeOperacional}
            clientes={clientes}
            mostrarToast={mostrarToast}
            formAberto={formAberto}
            toggleForm={toggleForm}
            orcamento={orcamento}
            setOrcamento={setOrcamento}
            adicionarLinhaOrcamento={adicionarLinhaOrcamento}
            removerLinhaOrcamento={removerLinhaOrcamento}
            atualizarItemOrcamento={atualizarItemOrcamento}
            totalOrcamento={totalOrcamento}
            salvarOrcamentoStandby={salvarOrcamentoStandby}
            filtroStatusOrcamento={filtroStatusOrcamento}
            setFiltroStatusOrcamento={setFiltroStatusOrcamento}
            orcamentosEmStandby={orcamentosEmStandby}
            orcamentosUnidade={orcamentosUnidade}
            aprovarOrcamentoVirarOS={aprovarOrcamentoVirarOS}
            dispararTextoOrcamentoWhatsApp={dispararTextoOrcamentoWhatsApp}
            carregarOrcamentoParaEdicao={carregarOrcamentoParaEdicao}
            excluirOrcamentoSalvo={excluirOrcamentoSalvo}
          />
        )}

        {abaAtiva === 'caixa' && (
          <AbaCaixa
            temaUnidade={temaUnidade}
            unidadeAtiva={unidadeAtiva}
            unidadeOperacional={unidadeOperacional}
            infoUnidadeAtual={infoUnidadeAtual}
            fundoTrocoBase={fundoTrocoBase}
            filtroPeriodoCaixa={filtroPeriodoCaixa}
            setFiltroPeriodoCaixa={setFiltroPeriodoCaixa}
            totalAReceber={totalAReceber}
            setModalFechamentoCaixa={setModalFechamentoCaixa}
            abrirPortalNFSe={abrirPortalNFSe}
            exportarCSVRelatorio={exportarCSVRelatorio}
            diferencaReposicaoTroco={diferencaReposicaoTroco}
            saldoTrocoAtual={saldoTrocoAtual}
            reporTrocoAutomatico={reporTrocoAutomatico}
            transferirTrocoEntrePontos={transferirTrocoEntrePontos}
            totalEntradas={totalEntradas}
            totalSaidasFaturado={totalSaidasFaturado}
            saldoOperacionalFaturado={saldoOperacionalFaturado}
            lucroRealPeriodo={lucroRealPeriodo}
            custoInsumosPeriodo={custoInsumosPeriodo}
            setModalConfigUnidades={setModalConfigUnidades}
            totalGavetaFisica={totalGavetaFisica}
            entradasPix={entradasPix}
            liquidoDinheiroFaturado={liquidoDinheiroFaturado}
            entradasCartao={entradasCartao}
            transacoesFiltradas={transacoesFiltradas}
            isMovimentacaoTroco={isMovimentacaoTroco}
            formAberto={formAberto}
            toggleForm={toggleForm}
            novaTransacao={novaTransacao}
            setNovaTransacao={setNovaTransacao}
            adicionarTransacaoManual={adicionarTransacaoManual}
            transacaoEditando={transacaoEditando}
            setTransacaoEditando={setTransacaoEditando}
            salvarEdicaoTransacao={salvarEdicaoTransacao}
            quitarPendenciaReceber={quitarPendenciaReceber}
            excluirTransacao={excluirTransacao}
            contasUnidade={contasUnidade}
            novaConta={novaConta}
            setNovaConta={setNovaConta}
            criarContaPagar={criarContaPagar}
            darBaixaBoleto={darBaixaBoleto}
            reabrirBoleto={reabrirBoleto}
            excluirContaPagar={excluirContaPagar}
            hojeISO={hojeISO}
          />
        )}

        {abaAtiva === 'estoque' && (
          <AbaEstoque
            temaUnidade={temaUnidade}
            infoUnidadeAtual={infoUnidadeAtual}
            unidadeOperacional={unidadeOperacional}
            unidadeAtiva={unidadeAtiva}
            estoqueUnidade={estoqueUnidade}
            itensEstoqueBaixo={itensEstoqueBaixo}
            gerarPedidoDistribuidorWhatsApp={gerarPedidoDistribuidorWhatsApp}
            apenasEstoqueBaixo={apenasEstoqueBaixo}
            setApenasEstoqueBaixo={setApenasEstoqueBaixo}
            capitalTotalEstoque={capitalTotalEstoque}
            potencialVendaEstoque={potencialVendaEstoque}
            formAberto={formAberto}
            toggleForm={toggleForm}
            editandoEstoqueId={editandoEstoqueId}
            cancelarEdicaoEstoque={cancelarEdicaoEstoque}
            salvarNovaChave={salvarNovaChave}
            novaChave={novaChave}
            setNovaChave={setNovaChave}
            buscaEstoque={buscaEstoque}
            setBuscaEstoque={setBuscaEstoque}
            filtroCatEstoque={filtroCatEstoque}
            setFiltroCatEstoque={setFiltroCatEstoque}
            estoqueFiltrado={estoqueFiltrado}
            alterarQtdEstoque={alterarQtdEstoque}
            iniciarEdicaoEstoque={iniciarEdicaoEstoque}
            excluirItemEstoque={excluirItemEstoque}
            transferirEstoqueEntrePontos={transferirEstoqueEntrePontos}
          />
        )}

        {abaAtiva === 'clientes' && (
          <AbaClientes
            temaUnidade={temaUnidade}
            clientes={clientes}
            transacoes={transacoes}
            formAberto={formAberto}
            toggleForm={toggleForm}
            novoCliente={novoCliente}
            setNovoCliente={setNovoCliente}
            salvarCliente={salvarCliente}
            iniciarEdicaoCliente={iniciarEdicaoCliente}
            cancelarEdicaoCliente={cancelarEdicaoCliente}
            excluirCliente={excluirCliente}
            buscaClienteCrm={buscaClienteCrm}
            setBuscaClienteCrm={setBuscaClienteCrm}
            clienteHistoricoSelecionado={clienteHistoricoSelecionado}
            setClienteHistoricoSelecionado={setClienteHistoricoSelecionado}
          />
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