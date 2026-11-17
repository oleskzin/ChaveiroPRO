import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';
import { 
  Wrench, Package, DollarSign, Calendar, Users, FileText, 
  Plus, Trash2, Edit2, CheckCircle, Search, Phone, 
  MapPin, RefreshCw, ShoppingCart, ArrowUpCircle, ArrowDownCircle, 
  Share2, AlertCircle, X, Check, AlertTriangle, Filter, LayoutDashboard,
  Download, ShieldCheck, Zap, Clock, Award, Calculator, Building2, Settings,
  CreditCard, UserCheck, Send, FolderClock, UserPlus
} from 'lucide-react';

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState('dashboard');
  const [unidadeAtiva, setUnidadeAtiva] = useState('ponto1'); // 'ponto1', 'ponto2' ou 'todas'
  const [loading, setLoading] = useState(false);
  const [erroConexao, setErroConexao] = useState(null);

  // Configuração das Unidades (editável no app)
  const [unidadesConfig, setUnidadesConfig] = useState([
    { id: 'ponto1', nome: 'Ponto 1 (Principal)', endereco: 'Endereço do Ponto 1 - Sepetiba' },
    { id: 'ponto2', nome: 'Ponto 2 (Filial)', endereco: 'Endereço do Ponto 2 - Sepetiba' }
  ]);
  const [modalConfigUnidades, setModalConfigUnidades] = useState(false);

  // Lista permanente de Funcionários cadastrados
  const [funcionarios, setFuncionarios] = useState(() => {
    const salvoLocal = localStorage.getItem('luisinho_funcionarios');
    return salvoLocal ? JSON.parse(salvoLocal) : [];
  });
  const [novoFuncionario, setNovoFuncionario] = useState({ nome: '', tel: '', unidade: 'ponto1' });

  // Estados das tabelas no Supabase
  const [estoque, setEstoque] = useState([]);
  const [transacoes, setTransacoes] = useState([]);
  const [contasPagar, setContasPagar] = useState([]);
  const [ordensServico, setOrdensServico] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [tabelaPrecos, setTabelaPrecos] = useState([]);
  const [orcamentosSalvos, setOrcamentosSalvos] = useState([]);

  // ================= ESTADOS GLOBAIS DE ENVIO WHATSAPP =================
  const [comprovanteAtivo, setComprovanteAtivo] = useState(null);

  // ================= ESTADOS DO PDV =================
  const [buscaPdv, setBuscaPdv] = useState('');
  const [carrinho, setCarrinho] = useState([]);
  const [descontoPdv, setDescontoPdv] = useState('');
  const [servicoAvulsoDesc, setServicoAvulsoDesc] = useState('');
  const [servicoAvulsoValor, setServicoAvulsoValor] = useState('');
  const [formaPgto, setFormaPgto] = useState('Pix');
  const [taxaCartaoIdPdv, setTaxaCartaoIdPdv] = useState('');
  const [clientePdv, setClientePdv] = useState({ nome: '', tel: '', obs: '' });
  const inputBuscaPdvRef = useRef(null);

  // ================= ESTADOS DA CALCULADORA / TABELA DE PREÇOS =================
  const [calcServicoId, setCalcServicoId] = useState('');
  const [calcPecaId, setCalcPecaId] = useState('');
  const [calcEstoqueId, setCalcEstoqueId] = useState('');
  const [calcAdicionaisIds, setCalcAdicionaisIds] = useState([]);
  const [calcValorExtraManual, setCalcValorExtraManual] = useState('');
  const [calcRepassarTaxa, setCalcRepassarTaxa] = useState(false);
  const [calcTaxaId, setCalcTaxaId] = useState('');
  const [calcCliente, setCalcCliente] = useState({ nome: '', tel: '' });

  const [novoItemTabela, setNovoItemTabela] = useState({ id: null, grupo: 'servico', nome: '', marca: '', tipo_valor: 'fixo', valor: '' });

  // ================= ESTADOS DO ESTOQUE =================
  const [novaChave, setNovaChave] = useState({ id: '', nome: '', cat: 'Yale / Comum', qtd: 10, minimo: 3, custo: '', venda: '' });
  const [editandoEstoqueId, setEditandoEstoqueId] = useState(null);
  const [buscaEstoque, setBuscaEstoque] = useState('');
  const [filtroCatEstoque, setFiltroCatEstoque] = useState('Todas');
  const [apenasEstoqueBaixo, setApenasEstoqueBaixo] = useState(false);

  // ================= ESTADOS DE OS, AGENDA E CLIENTES =================
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

  const [novoCliente, setNovoCliente] = useState({ nome: '', tel: '', endereco: '', tipo: 'Residencial', obs: '' });
  const [buscaClienteCrm, setBuscaClienteCrm] = useState('');
  const [clienteHistoricoSelecionado, setClienteHistoricoSelecionado] = useState(null);

  // ================= ESTADOS DO CAIXA E BOLETOS =================
  const [novaTransacao, setNovaTransacao] = useState({ tipo: 'saida', desc: '', valor: '', forma: 'Pix' });
  const [transacaoEditando, setTransacaoEditando] = useState(null);
  const [novaConta, setNovaConta] = useState({ desc: '', valor: '', vencimento: '' });
  const [filtroPeriodoCaixa, setFiltroPeriodoCaixa] = useState('hoje');

  // ================= ESTADOS DO ORÇAMENTO (COM STANDBY) =================
  const [orcamento, setOrcamento] = useState({
    id: null,
    cliente: '',
    tel: '',
    itens: [{ desc: '', qtd: 1, valor: 0 }],
    obs: 'Validade: 7 dias. Garantia de 90 dias.'
  });
  const [filtroStatusOrcamento, setFiltroStatusOrcamento] = useState('standby');

  const unidadeOperacional = unidadeAtiva === 'todas' ? 'ponto1' : unidadeAtiva;
  const infoUnidadeAtual = unidadesConfig.find((u) => u.id === unidadeOperacional) || unidadesConfig[0];

  // Funcionário padrão da unidade ativa (para já vir selecionado automaticamente)
  const funcionarioPadraoUnidade = funcionarios.find((f) => f.unidade === unidadeOperacional) || funcionarios[0] || null;

  // Carregar dados do Supabase
  const carregarDados = async () => {
    setLoading(true);
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
      if (uni && uni.length > 0) setUnidadesConfig(uni);
      if (orcs) setOrcamentosSalvos(orcs);
      if (funcs && funcs.length > 0) {
        setFuncionarios(funcs);
        localStorage.setItem('luisinho_funcionarios', JSON.stringify(funcs));
      }
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
      .channel('sincronizacao_luisinho_chaveiro')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        carregarDados();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  // Atalhos de Teclado no PC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setAbaAtiva('pdv');
        setTimeout(() => inputBuscaPdvRef.current?.focus(), 100);
      } else if (e.key === 'F4' && abaAtiva === 'pdv' && carrinho.length > 0) {
        e.preventDefault();
        finalizarVendaPdv();
      } else if (e.key === 'Escape') {
        setTransacaoEditando(null);
        cancelarEdicaoEstoque();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // ================= HELPER: ABRIR WHATSAPP COM CODIFICAÇÃO SEGURA (NÃO CORTA # NEM EMOJIS) =================
  const abrirWhatsAppSeguro = (telefone, textoMensagem) => {
    const numeroLimpo = (telefone || '').replace(/\D/g, '');
    if (!numeroLimpo) {
      alert('Informe um número de WhatsApp com DDD válido.');
      return;
    }
    const numeroComDDI = numeroLimpo.startsWith('55') && numeroLimpo.length >= 12 ? numeroLimpo : `55${numeroLimpo}`;
    const urlSegura = `https://api.whatsapp.com/send?phone=${numeroComDDI}&text=${encodeURIComponent(textoMensagem)}`;
    window.open(urlSegura, '_blank');
  };

  // ================= FILTROS POR UNIDADE =================
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

  // ================= HELPER: AUTO-CADASTRO DE CLIENTE =================
  const garantirCadastroCliente = async (nome, tel, endereco = '', obsExtra = '') => {
    const nomeLimpo = (nome || '').trim();
    if (!nomeLimpo || nomeLimpo.toLowerCase() === 'consumidor' || nomeLimpo.toLowerCase() === 'cliente') return;

    const existente = clientes.find((c) => c.nome.toLowerCase() === nomeLimpo.toLowerCase());
    if (!existente) {
      const novoCli = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        nome: nomeLimpo,
        tel: (tel || '').trim(),
        endereco: (endereco || '').trim(),
        tipo: 'Residencial',
        obs: obsExtra
      };
      setClientes((prev) => [...prev, novoCli]);
      await supabase.from('clientes').insert([novoCli]);
    } else {
      const novoTel = existente.tel || (tel || '').trim();
      const novoEnd = existente.endereco || (endereco || '').trim();
      const novaObs = obsExtra && !existente.obs?.includes(obsExtra)
        ? [existente.obs, obsExtra].filter(Boolean).join(' | ')
        : existente.obs;
      if (novoTel !== existente.tel || novoEnd !== existente.endereco || novaObs !== existente.obs) {
        await supabase.from('clientes').update({ tel: novoTel, endereco: novoEnd, obs: novaObs }).eq('id', existente.id);
      }
    }
  };

  // ================= HELPER: ENVIAR COMPROVANTE AO CLIENTE =================
  const dispararComprovanteWhatsApp = (dados) => {
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const uniObj = unidadesConfig.find((u) => u.id === (dados.unidade || unidadeOperacional)) || infoUnidadeAtual;
    const statusPgto = dados.forma === 'A Receber (Fiado)' ? 'Pendente / Faturado' : `Pago (${dados.forma})`;

    const linhas = [
      `*LUISINHO CHAVEIRO - COMPROVANTE*`,
      `*Unidade:* ${uniObj.nome}`,
      `*Local:* ${uniObj.endereco}`,
      `*Data:* ${dataAtual}`,
      `*Cliente:* ${dados.cliente || 'Cliente'}`,
      ``,
      `*Serviços / Produtos:*`,
      dados.itensTexto,
      ``,
      `*Valor Total:* R$ ${Number(dados.total).toFixed(2)}`,
      `*Situação:* ${statusPgto}`
    ];

    if (dados.garantia) linhas.push(`*Garantia:* ${dados.garantia}`);
    if (dados.obs) linhas.push(`*Obs:* ${dados.obs}`);
    linhas.push(``, `_Guarde este comprovante para sua garantia. Obrigado pela preferência!_`);

    abrirWhatsAppSeguro(dados.tel, linhas.join('\n'));
  };

  // ================= HELPER: ENVIAR FICHA COMPLETA DIRETO PRO WHATSAPP DO FUNCIONÁRIO =================
  const enviarDiretoParaFuncionario = (tipo, registro) => {
    const uniObj = unidadesConfig.find((u) => u.id === (registro.unidade || unidadeOperacional)) || infoUnidadeAtual;

    // 1. Tenta pegar o funcionário gravado na própria OS/Socorro; se não tiver, pega o funcionário padrão da unidade
    const telFunc = registro.funcionario_tel || funcionarioPadraoUnidade?.tel || '';
    const nomeFunc = registro.funcionario_nome || funcionarioPadraoUnidade?.nome || 'Funcionário';

    if (!telFunc) {
      alert('Cadastre o nome e o WhatsApp do seu funcionário clicando no botão de Engrenagem/Equipe no topo da tela (você só precisa fazer isso uma única vez!).');
      setModalConfigUnidades(true);
      return;
    }

    const listaMat = Array.isArray(registro.itens_usados) && registro.itens_usados.length > 0
      ? registro.itens_usados.map((m) => `- ${m.qtd}x ${m.nome || m.id}`).join('\n')
      : '- Nenhum material específico do estoque';

    // Procura endereço do cliente no cadastro caso não esteja preenchido na OS
    const clienteCadastrado = clientes.find((c) => c.nome.toLowerCase() === (registro.cliente || '').toLowerCase());
    const enderecoFinal = registro.endereco || clienteCadastrado?.endereco || 'Atendimento na Loja / Consultar cliente';
    const telefoneCliente = registro.tel || clienteCadastrado?.tel || 'Não informado';

    if (tipo === 'os') {
      const codigoOS = registro.id.toString().slice(-4);
      const mensagemOS = [
        `*FICHA DE SERVIÇO - LUISINHO CHAVEIRO*`,
        `*Unidade:* ${uniObj.nome}`,
        `*Responsável:* ${nomeFunc}`,
        `*Ref:* Ordem de Serviço N° ${codigoOS}`,
        `*Data:* ${registro.data}`,
        `----------------------------------`,
        `*DADOS DO CLIENTE:*`,
        `*Nome:* ${registro.cliente}`,
        `*WhatsApp Cliente:* ${telefoneCliente}`,
        `*Endereço / Local:* ${enderecoFinal}`,
        `----------------------------------`,
        `*SERVIÇO A REALIZAR:*`,
        `${registro.desc}`,
        ``,
        `*MATERIAIS / CHAVES:*`,
        `${listaMat}`,
        `----------------------------------`,
        `*FINANCEIRO / COBRANÇA:*`,
        `*Valor Total:* R$ ${Number(registro.valor).toFixed(2)}`,
        `*Forma / Condição:* ${registro.forma_pgto || 'Receber na Entrega'}`
      ].join('\n');

      abrirWhatsAppSeguro(telFunc, mensagemOS);
    } else {
      const totalSoc = Number(registro.valor_estimado || 0) + Number(registro.taxa_deslocamento || 0);
      const mensagemSocorro = [
        `*CHAMADO DE SOCORRO - LUISINHO CHAVEIRO*`,
        `*Unidade:* ${uniObj.nome}`,
        `*Responsável:* ${nomeFunc}`,
        `*Data e Hora:* ${registro.data} às ${registro.hora}`,
        `----------------------------------`,
        `*DADOS DO CLIENTE:*`,
        `*Nome:* ${registro.cliente}`,
        `*WhatsApp Cliente:* ${telefoneCliente}`,
        `*Endereço do Socorro:* ${registro.endereco}`,
        `----------------------------------`,
        `*SERVIÇO A REALIZAR:*`,
        `${registro.servico}`,
        ``,
        `*MATERIAIS / PEÇAS:*`,
        `${listaMat}`,
        `----------------------------------`,
        `*FINANCEIRO / COBRANÇA:*`,
        `*Valor Total a Cobrar:* R$ ${totalSoc.toFixed(2)}`
      ].join('\n');

      abrirWhatsAppSeguro(telFunc, mensagemSocorro);
    }
  };

  // ================= GERENCIAR FUNCIONÁRIOS E UNIDADES =================
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
    carregarDados();
  };

  const removerFuncionario = async (id) => {
    if (!window.confirm('Remover este funcionário da lista?')) return;
    const novaLista = funcionarios.filter((f) => f.id !== id);
    setFuncionarios(novaLista);
    localStorage.setItem('luisinho_funcionarios', JSON.stringify(novaLista));
    await supabase.from('funcionarios').delete().eq('id', id);
    carregarDados();
  };

  const salvarConfigUnidades = async (e) => {
    e.preventDefault();
    for (const u of unidadesConfig) {
      await supabase.from('unidades_config').upsert([{ id: u.id, nome: u.nome, endereco: u.endereco }]);
    }
    setModalConfigUnidades(false);
    carregarDados();
  };

  // ================= FUNÇÕES DO PDV =================
  const taxasCartaoDisponiveis = tabelaPrecos.filter((t) => t.grupo === 'taxa_cartao');

  const adicionarAoCarrinho = (item) => {
    const existente = carrinho.find((i) => i.id === item.id);
    if (existente) {
      setCarrinho(carrinho.map((i) => i.id === item.id ? { ...i, qtdVenda: i.qtdVenda + 1 } : i));
    } else {
      setCarrinho([...carrinho, { ...item, precoEditado: Number(item.venda), qtdVenda: 1, tipoItem: 'estoque' }]);
    }
  };

  const adicionarServicoAvulsoPdv = (descCustom = null, valorCustom = null) => {
    const descFinal = descCustom || servicoAvulsoDesc;
    const valorFinal = valorCustom !== null ? valorCustom : servicoAvulsoValor;
    if (!descFinal || valorFinal === '') return;

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
  };

  const alterarPrecoItemCarrinho = (idx, novoPreco) => {
    const copia = [...carrinho];
    copia[idx].precoEditado = novoPreco === '' ? '' : Number(novoPreco);
    setCarrinho(copia);
  };

  const alterarQtdItemCarrinho = (idx, delta) => {
    const copia = [...carrinho];
    const novaQtd = Math.max(1, Number(copia[idx].qtdVenda) + delta);
    copia[idx].qtdVenda = novaQtd;
    setCarrinho(copia);
  };

  const subtotalCarrinho = carrinho.reduce((acc, i) => acc + Number(i.precoEditado || 0) * Number(i.qtdVenda), 0);
  const valorDescontoPdv = Number(descontoPdv || 0);
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
      desc: `PDV${prefixoCliente}: ${resumoDesc}${clientePdv.obs ? ` [${clientePdv.obs}]` : ''}`,
      valor: totalLiquidoPdv,
      custo_insumo: custoTotalComTaxa,
      forma: detalheForma,
      data: new Date().toLocaleDateString('pt-BR'),
      timestamp: Date.now(),
      unidade: unidadeOperacional
    };

    setTransacoes((prev) => [novaTrans, ...prev]);
    const { error } = await supabase.from('transacoes').insert([novaTrans]);
    if (error) {
      alert('Erro ao salvar venda: ' + error.message);
      setLoading(false);
      return;
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
      origem: 'Venda no Balcão (PDV)',
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
    await carregarDados();
    setLoading(false);
  };

  // ================= FUNÇÕES DA CALCULADORA / TABELA DE PREÇOS =================
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
    return partes.join(' + ') || 'Serviço Personalizado';
  };

  const salvarSimuladorEmStandby = async (enviarNoZap = false) => {
    if (totalFinalSimulador <= 0) return;
    if (enviarNoZap && !calcCliente.tel.replace(/\D/g, '')) {
      alert('Digite o WhatsApp do cliente com DDD para enviar a cotação.');
      return;
    }

    const resumo = montarResumoSimulador();
    const novoOrc = {
      id: Date.now(),
      cliente: calcCliente.nome || 'Cliente Cotação',
      tel: calcCliente.tel || '',
      itens: [{ desc: resumo, qtd: 1, valor: Number(totalFinalSimulador.toFixed(2)) }],
      total: Number(totalFinalSimulador.toFixed(2)),
      obs: taxaSimuladorObj ? `Opção Cartão: ${taxaSimuladorObj.nome} | Validade: 7 dias.` : 'Validade: 7 dias. Garantia: 90 dias.',
      status: 'standby',
      data: new Date().toLocaleDateString('pt-BR'),
      unidade: unidadeOperacional
    };

    await supabase.from('orcamentos').insert([novoOrc]);
    if (calcCliente.nome) {
      await garantirCadastroCliente(calcCliente.nome, calcCliente.tel, '', `Orçamento em standby: ${resumo}`);
    }

    if (enviarNoZap) {
      const infoParcela = taxaSimuladorObj ? `\n*No Cartão (${taxaSimuladorObj.nome}):* R$ ${totalFinalSimulador.toFixed(2)}` : '';
      const texto = [
        `*LUISINHO CHAVEIRO - ORÇAMENTO*`,
        `*Unidade:* ${infoUnidadeAtual.nome}`,
        `*Cliente:* ${novoOrc.cliente}`,
        ``,
        `*Serviço cotado:*`,
        `- ${resumo}`,
        ``,
        `*Valor à vista (Pix/Dinheiro):* R$ ${subtotalSimulador.toFixed(2)}${infoParcela}`,
        ``,
        `_Seu orçamento ficou salvo em nosso sistema! Podemos confirmar?_`
      ].join('\n');

      abrirWhatsAppSeguro(calcCliente.tel, texto);
    } else {
      alert('Cotação salva na fila de Orçamentos em Standby!');
    }

    setCalcCliente({ nome: '', tel: '' });
    carregarDados();
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
      desc: montarResumoSimulador(),
      valor: totalFinalSimulador.toFixed(2),
      itens_usados: itensIniciais
    });
    setAbaAtiva('os');
  };

  const salvarItemTabelaPrecos = async (e) => {
    e.preventDefault();
    if (!novoItemTabela.nome || novoItemTabela.valor === '') return;
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
    carregarDados();
  };

  const excluirItemTabelaPrecos = async (id) => {
    if (!window.confirm('Excluir este item da tabela?')) return;
    await supabase.from('tabela_precos').delete().eq('id', id);
    carregarDados();
  };

  // ================= FUNÇÕES DO ESTOQUE =================
  const salvarNovaChave = async (e) => {
    e.preventDefault();
    if (!novaChave.nome) return;
    const idFinal = novaChave.id.trim() || `CH-${Date.now().toString().slice(-4)}`;
    const itemExistente = estoque.find((i) => i.id === idFinal);

    const novoItem = {
      id: idFinal,
      nome: novaChave.nome,
      cat: novaChave.cat,
      qtd: Number(novaChave.qtd || 0),
      minimo: Number(novaChave.minimo || 3),
      custo: Number(novaChave.custo || 0),
      venda: Number(novaChave.venda || 0),
      vendas_total: itemExistente ? Number(itemExistente.vendas_total || 0) : 0,
      unidade: editandoEstoqueId ? (itemExistente?.unidade || unidadeOperacional) : unidadeOperacional
    };

    const { error } = await supabase.from('estoque').upsert([novoItem]);
    if (error) {
      alert('Erro ao salvar no estoque: ' + error.message);
      return;
    }

    setNovaChave({ id: '', nome: '', cat: 'Yale / Comum', qtd: 10, minimo: 3, custo: '', venda: '' });
    setEditandoEstoqueId(null);
    carregarDados();
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicaoEstoque = () => {
    setEditandoEstoqueId(null);
    setNovaChave({ id: '', nome: '', cat: 'Yale / Comum', qtd: 10, minimo: 3, custo: '', venda: '' });
  };

  const alterarQtdEstoque = async (item, delta) => {
    const novaQtd = Math.max(0, Number(item.qtd) + delta);
    await supabase.from('estoque').update({ qtd: novaQtd }).eq('id', item.id);
    carregarDados();
  };

  const excluirItemEstoque = async (id) => {
    if (!window.confirm('Remover este item do estoque?')) return;
    await supabase.from('estoque').delete().eq('id', id);
    carregarDados();
  };

  const itensEstoqueBaixo = estoqueUnidade.filter((i) => Number(i.qtd) <= Number(i.minimo || 3));
  const gerarPedidoDistribuidorWhatsApp = () => {
    if (itensEstoqueBaixo.length === 0) return;
    const linhas = itensEstoqueBaixo.map((i) => {
      const sugerido = Math.max(5, Number(i.minimo || 3) * 3 - Number(i.qtd));
      return `- [${i.id}] ${i.nome} (Atual: ${i.qtd} un) -> Pedir: *${sugerido} un*`;
    }).join('\n');
    const texto = `*PEDIDO DE REPOSIÇÃO - LUISINHO CHAVEIRO (${infoUnidadeAtual.nome})*\nOlá! Gostaria de pedir os seguintes itens:\n\n${linhas}`;
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

  // ================= FUNÇÕES DE ORDENS DE SERVIÇO (COM FUNCIONÁRIO SALVO E MULTI-ITENS) =================
  const adicionarMaterialNaOS = () => {
    if (!itemTempOS.chave_id) return;
    const ch = estoqueUnidade.find((e) => e.id === itemTempOS.chave_id);
    if (!ch) return;
    const novoMat = {
      id: ch.id,
      nome: ch.nome,
      qtd: Number(itemTempOS.qtd || 1),
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
    if (!novaOS.cliente || !novaOS.desc || !novaOS.valor) {
      alert('Preencha o Nome do Cliente, a Descrição do Serviço e o Valor Total.');
      return;
    }

    // Identifica o funcionário escolhido no seletor ou usa o funcionário padrão da unidade
    const funcObj = novaOS.funcionario_id
      ? funcionarios.find((f) => f.id.toString() === novaOS.funcionario_id.toString())
      : funcionarioPadraoUnidade;

    const custoTotalMateriais = novaOS.itens_usados.reduce((acc, m) => acc + Number(m.custo || 0) * Number(m.qtd || 1), 0);
    const detalheTecnico = [
      novaOS.garantia ? `Garantia: ${novaOS.garantia}` : '',
      novaOS.obs_tecnica ? `Obs: ${novaOS.obs_tecnica}` : ''
    ].filter(Boolean).join(' | ');

    const descCompleta = detalheTecnico ? `${novaOS.desc} (${detalheTecnico})` : novaOS.desc;

    const itemOS = {
      id: Date.now(),
      cliente: novaOS.cliente,
      tel: novaOS.tel,
      endereco: novaOS.endereco || '',
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
      data: new Date().toLocaleDateString('pt-BR'),
      unidade: unidadeOperacional
    };

    const { error } = await supabase.from('ordens_servico').insert([itemOS]);
    if (error) {
      alert('Erro ao salvar OS: ' + error.message);
      return;
    }

    await garantirCadastroCliente(novaOS.cliente, novaOS.tel, novaOS.endereco, `OS: ${descCompleta}`);

    if (encaminharAoFuncionario) {
      enviarDiretoParaFuncionario('os', itemOS);
    }

    setNovaOS({
      cliente: '', tel: '', endereco: '', desc: '', valor: '',
      forma_pgto: 'Receber na Entrega (Pix/Cartão)',
      garantia: '90 dias', obs_tecnica: '',
      funcionario_id: '',
      itens_usados: []
    });
    carregarDados();
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
      desc: `OS N° ${os.id.toString().slice(-4)} (${os.cliente}): ${os.desc}${textoMateriais}`,
      valor: Number(os.valor),
      custo_insumo: Number(os.custo_insumo || 0),
      forma: formaRecebimento,
      data: new Date().toLocaleDateString('pt-BR'),
      timestamp: Date.now(),
      unidade: os.unidade || unidadeOperacional
    };
    await supabase.from('transacoes').insert([novaTrans]);

    for (const mat of listaMat) {
      const chaveUsada = estoque.find((c) => c.id === mat.id);
      if (chaveUsada) {
        const novaQtd = Math.max(0, Number(chaveUsada.qtd) - Number(mat.qtd || 1));
        const novasVendas = Number(chaveUsada.vendas_total || 0) + Number(mat.qtd || 1);
        await supabase.from('estoque').update({ qtd: novaQtd, vendas_total: novasVendas }).eq('id', chaveUsada.id);
      }
    }

    await garantirCadastroCliente(os.cliente, os.tel, os.endereco || '', `OS Concluída: ${os.desc}`);

    const linhasReciboOS = [
      `- Serviço: ${os.desc}`,
      ...listaMat.map((m) => `- Material: ${m.qtd}x ${m.nome || m.id}`)
    ].join('\n');

    setComprovanteAtivo({
      origem: `Ordem de Serviço N° ${os.id.toString().slice(-4)}`,
      cliente: os.cliente,
      tel: os.tel || '',
      itensTexto: linhasReciboOS,
      total: os.valor,
      forma: formaRecebimento,
      obs: os.endereco ? `Local: ${os.endereco}` : '',
      garantia: '90 dias',
      unidade: os.unidade || unidadeOperacional
    });

    carregarDados();
  };

  const excluirOS = async (id) => {
    if (!window.confirm('Excluir esta Ordem de Serviço?')) return;
    await supabase.from('ordens_servico').delete().eq('id', id);
    carregarDados();
  };

  // ================= FUNÇÕES DA AGENDA DE SOCORROS =================
  const adicionarMaterialNoSocorro = () => {
    if (!itemTempAg.chave_id) return;
    const ch = estoqueUnidade.find((e) => e.id === itemTempAg.chave_id);
    if (!ch) return;
    const novoMat = {
      id: ch.id,
      nome: ch.nome,
      qtd: Number(itemTempAg.qtd || 1),
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
      alert('Preencha Cliente, Endereço e Serviço.');
      return;
    }

    const funcObj = novoAgendamento.funcionario_id
      ? funcionarios.find((f) => f.id.toString() === novoAgendamento.funcionario_id.toString())
      : funcionarioPadraoUnidade;

    const custoMateriais = novoAgendamento.itens_usados.reduce((acc, m) => acc + Number(m.custo || 0) * Number(m.qtd || 1), 0);

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
      custo_insumo: custoMateriais,
      itens_usados: novoAgendamento.itens_usados,
      funcionario_nome: funcObj?.nome || '',
      funcionario_tel: funcObj?.tel || '',
      status: 'agendado',
      unidade: unidadeOperacional
    };

    const { error } = await supabase.from('agendamentos').insert([itemAg]);
    if (error) {
      alert('Erro ao salvar socorro: ' + error.message);
      return;
    }

    await garantirCadastroCliente(novoAgendamento.cliente, novoAgendamento.tel, novoAgendamento.endereco, `Socorro: ${novoAgendamento.servico}`);

    if (encaminharAoFuncionario) {
      enviarDiretoParaFuncionario('socorro', itemAg);
    }

    setNovoAgendamento({ cliente: '', tel: '', endereco: '', servico: '', data: '', hora: '', taxa_deslocamento: 0, valor_estimado: 80, funcionario_id: '', itens_usados: [] });
    carregarDados();
  };

  const concluirAgendamento = async (ag, formaRecebimento = 'Pix') => {
    await supabase.from('agendamentos').update({ status: 'concluido' }).eq('id', ag.id);

    const listaMat = Array.isArray(ag.itens_usados) ? ag.itens_usados : [];
    const valorTotalSocorro = Number(ag.valor_estimado) + Number(ag.taxa_deslocamento);

    const novaTrans = {
      id: Date.now(),
      tipo: 'entrada',
      desc: `Socorro (${ag.cliente}): ${ag.servico} - End: ${ag.endereco}`,
      valor: valorTotalSocorro,
      custo_insumo: Number(ag.custo_insumo || 0),
      forma: formaRecebimento,
      data: new Date().toLocaleDateString('pt-BR'),
      timestamp: Date.now(),
      unidade: ag.unidade || unidadeOperacional
    };
    await supabase.from('transacoes').insert([novaTrans]);

    for (const mat of listaMat) {
      const chaveUsada = estoque.find((c) => c.id === mat.id);
      if (chaveUsada) {
        const novaQtd = Math.max(0, Number(chaveUsada.qtd) - Number(mat.qtd || 1));
        const novasVendas = Number(chaveUsada.vendas_total || 0) + Number(mat.qtd || 1);
        await supabase.from('estoque').update({ qtd: novaQtd, vendas_total: novasVendas }).eq('id', chaveUsada.id);
      }
    }

    await garantirCadastroCliente(ag.cliente, ag.tel, ag.endereco, `Socorro concluído: ${ag.servico}`);

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
      obs: `Endereço atendido: ${ag.endereco}`,
      garantia: '90 dias',
      unidade: ag.unidade || unidadeOperacional
    });

    carregarDados();
  };

  const excluirAgendamento = async (id) => {
    if (!window.confirm('Excluir este agendamento de socorro?')) return;
    await supabase.from('agendamentos').delete().eq('id', id);
    carregarDados();
  };

  // ================= FUNÇÕES DE CLIENTES =================
  const criarCliente = async (e) => {
    e.preventDefault();
    if (!novoCliente.nome) return;
    const itemCli = { id: Date.now(), ...novoCliente };
    const { error } = await supabase.from('clientes').insert([itemCli]);
    if (error) {
      alert('Erro ao salvar cliente: ' + error.message);
      return;
    }
    setNovoCliente({ nome: '', tel: '', endereco: '', tipo: 'Residencial', obs: '' });
    carregarDados();
  };

  const excluirCliente = async (id) => {
    if (!window.confirm('Excluir cliente?')) return;
    await supabase.from('clientes').delete().eq('id', id);
    if (clienteHistoricoSelecionado?.id === id) setClienteHistoricoSelecionado(null);
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
      timestamp: Date.now(),
      unidade: unidadeOperacional
    };

    const { error } = await supabase.from('transacoes').insert([itemTrans]);
    if (error) {
      alert('Erro ao lançar no caixa: ' + error.message);
      return;
    }
    setNovaTransacao({ tipo: 'saida', desc: '', valor: '', forma: 'Pix' });
    carregarDados();
  };

  const salvarEdicaoTransacao = async () => {
    if (!transacaoEditando || !transacaoEditando.desc || transacaoEditando.valor === '') return;
    const atualizada = {
      tipo: transacaoEditando.tipo,
      desc: transacaoEditando.desc,
      valor: Number(transacaoEditando.valor),
      forma: transacaoEditando.forma
    };

    const { error } = await supabase.from('transacoes').update(atualizada).eq('id', transacaoEditando.id);
    if (error) {
      alert('Erro ao editar movimentação: ' + error.message);
      return;
    }
    setTransacaoEditando(null);
    carregarDados();
  };

  const quitarPendenciaReceber = async (trans) => {
    await supabase.from('transacoes').update({ forma: 'Pix' }).eq('id', trans.id);
    carregarDados();
  };

  const excluirTransacao = async (id) => {
    if (!window.confirm('Deseja excluir este lançamento do caixa?')) return;
    await supabase.from('transacoes').delete().eq('id', id);
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
      status: 'pendente',
      unidade: unidadeOperacional
    };
    const { error } = await supabase.from('contas_pagar').insert([itemConta]);
    if (error) {
      alert('Erro ao salvar boleto: ' + error.message);
      return;
    }
    setNovaConta({ desc: '', valor: '', vencimento: '' });
    carregarDados();
  };

  const darBaixaBoleto = async (conta, debitarDoCaixa = false) => {
    if (conta.status === 'pago') return;
    await supabase.from('contas_pagar').update({ status: 'pago' }).eq('id', conta.id);

    if (debitarDoCaixa) {
      const novaTrans = {
        id: Date.now(),
        tipo: 'saida',
        desc: `Pagamento Boleto/Conta: ${conta.desc}`,
        valor: Number(conta.valor),
        custo_insumo: 0,
        forma: 'Boleto',
        data: new Date().toLocaleDateString('pt-BR'),
        timestamp: Date.now(),
        unidade: conta.unidade || unidadeOperacional
      };
      await supabase.from('transacoes').insert([novaTrans]);
    }
    carregarDados();
  };

  const reabrirBoleto = async (conta) => {
    await supabase.from('contas_pagar').update({ status: 'pendente' }).eq('id', conta.id);
    carregarDados();
  };

  const excluirContaPagar = async (id) => {
    if (!window.confirm('Excluir este boleto da agenda?')) return;
    await supabase.from('contas_pagar').delete().eq('id', id);
    carregarDados();
  };

  const exportarCSVRelatorio = () => {
    const cabecalho = 'Unidade;Data;Tipo;Descricao;Forma Pagamento;Valor (R$);Custo Insumo/Taxa (R$)\n';
    const linhas = transacoesFiltradas.map((t) =>
      `${t.unidade || 'ponto1'};${t.data};${t.tipo.toUpperCase()};"${t.desc}";${t.forma};${Number(t.valor).toFixed(2).replace('.', ',')};${Number(t.custo_insumo || 0).toFixed(2).replace('.', ',')}`
    ).join('\n');
    const blob = new Blob([cabecalho + linhas], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `luisinho_chaveiro_${unidadeAtiva}_${filtroPeriodoCaixa}.csv`;
    link.click();
  };

  const transacoesFiltradas = transacoesUnidade.filter((t) => {
    if (filtroPeriodoCaixa === 'todos') return true;
    if (filtroPeriodoCaixa === 'areceber') return t.forma === 'A Receber (Fiado)';
    const hoje = new Date();
    const hojeStr = hoje.toLocaleDateString('pt-BR');

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

  const totalEntradas = transacoesFiltradas.filter((t) => t.tipo === 'entrada' && t.forma !== 'A Receber (Fiado)').reduce((acc, t) => acc + Number(t.valor), 0);
  const totalAReceber = transacoesUnidade.filter((t) => t.tipo === 'entrada' && t.forma === 'A Receber (Fiado)').reduce((acc, t) => acc + Number(t.valor), 0);
  const totalSaidas = transacoesFiltradas.filter((t) => t.tipo === 'saida').reduce((acc, t) => acc + Number(t.valor), 0);
  const custoInsumosPeriodo = transacoesFiltradas.filter((t) => t.tipo === 'entrada').reduce((acc, t) => acc + Number(t.custo_insumo || 0), 0);
  const saldoLiquido = totalEntradas - totalSaidas;
  const lucroRealPeriodo = totalEntradas - totalSaidas - custoInsumosPeriodo;

  const entradasPix = transacoesFiltradas.filter((t) => t.tipo === 'entrada' && t.forma.includes('Pix')).reduce((acc, t) => acc + Number(t.valor), 0);
  const entradasDinheiro = transacoesFiltradas.filter((t) => t.tipo === 'entrada' && t.forma.includes('Dinheiro')).reduce((acc, t) => acc + Number(t.valor), 0);
  const entradasCartao = transacoesFiltradas.filter((t) => t.tipo === 'entrada' && t.forma.includes('Cartão')).reduce((acc, t) => acc + Number(t.valor), 0);

  // ================= FUNÇÕES DO ORÇAMENTO (COM FILA DE STANDBY) =================
  const adicionarLinhaOrcamento = () => {
    setOrcamento({ ...orcamento, itens: [...orcamento.itens, { desc: '', qtd: 1, valor: 0 }] });
  };

  const removerLinhaOrcamento = (index) => {
    if (orcamento.itens.length <= 1) return;
    setOrcamento({ ...orcamento, itens: orcamento.itens.filter((_, i) => i !== index) });
  };

  const atualizarItemOrcamento = (index, campo, valor) => {
    const novosItens = [...orcamento.itens];
    novosItens[index][campo] = valor;
    setOrcamento({ ...orcamento, itens: novosItens });
  };

  const totalOrcamento = orcamento.itens.reduce((acc, i) => acc + Number(i.qtd) * Number(i.valor), 0);

  const dispararTextoOrcamentoWhatsApp = (orcObj) => {
    const uniObj = unidadesConfig.find((u) => u.id === (orcObj.unidade || unidadeOperacional)) || infoUnidadeAtual;
    const listaItens = Array.isArray(orcObj.itens) ? orcObj.itens : [];
    const linhas = listaItens.map((i) => `- ${i.qtd}x ${i.desc}: R$ ${(Number(i.qtd) * Number(i.valor)).toFixed(2)}`).join('\n');

    const texto = [
      `*LUISINHO CHAVEIRO - ORÇAMENTO*`,
      `*Unidade:* ${uniObj.nome}`,
      `*Local:* ${uniObj.endereco}`,
      `*Cliente:* ${orcObj.cliente || 'Cliente'}`,
      ``,
      `*Itens / Serviços:*`,
      linhas,
      ``,
      `*Total:* R$ ${Number(orcObj.total).toFixed(2)}`,
      `_${orcObj.obs || 'Validade: 7 dias.'}_`
    ].join('\n');

    abrirWhatsAppSeguro(orcObj.tel, texto);
  };

  const salvarOrcamentoStandby = async (enviarZap = false) => {
    const itensValidos = orcamento.itens.filter((i) => i.desc.trim() !== '');
    if (itensValidos.length === 0 || totalOrcamento <= 0) {
      alert('Adicione pelo menos 1 item com descrição e valor no orçamento.');
      return;
    }
    if (enviarZap && !(orcamento.tel || '').replace(/\D/g, '')) {
      alert('Preencha o WhatsApp do cliente com DDD antes de enviar.');
      return;
    }

    const registroOrc = {
      id: orcamento.id || Date.now(),
      cliente: orcamento.cliente || 'Cliente s/ Nome',
      tel: orcamento.tel || '',
      itens: itensValidos,
      total: totalOrcamento,
      obs: orcamento.obs,
      status: 'standby',
      data: new Date().toLocaleDateString('pt-BR'),
      unidade: unidadeOperacional
    };

    const { error } = await supabase.from('orcamentos').upsert([registroOrc]);
    if (error) {
      alert('Erro ao salvar orçamento: ' + error.message);
      return;
    }

    if (orcamento.cliente) {
      await garantirCadastroCliente(orcamento.cliente, orcamento.tel, '', 'Orçamento em Standby');
    }

    if (enviarZap) {
      dispararTextoOrcamentoWhatsApp(registroOrc);
    }

    setOrcamento({
      id: null,
      cliente: '',
      tel: '',
      itens: [{ desc: '', qtd: 1, valor: 0 }],
      obs: 'Validade: 7 dias. Garantia de 90 dias.'
    });
    carregarDados();
  };

  const carregarOrcamentoParaEdicao = (orc) => {
    setOrcamento({
      id: orc.id,
      cliente: orc.cliente,
      tel: orc.tel || '',
      itens: Array.isArray(orc.itens) && orc.itens.length > 0 ? orc.itens : [{ desc: '', qtd: 1, valor: 0 }],
      obs: orc.obs || 'Validade: 7 dias. Garantia de 90 dias.'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const aprovarOrcamentoVirarOS = async (orc) => {
    const listaItens = Array.isArray(orc.itens) ? orc.itens : [];
    const resumoItens = listaItens.map((i) => `${i.qtd}x ${i.desc}`).join(', ');
    const cliCadastrado = clientes.find((c) => c.nome.toLowerCase() === (orc.cliente || '').toLowerCase());

    const itemOS = {
      id: Date.now(),
      cliente: orc.cliente || 'Cliente Orçamento',
      tel: orc.tel || cliCadastrado?.tel || '',
      endereco: cliCadastrado?.endereco || '',
      desc: resumoItens || 'Serviço aprovado via Orçamento',
      valor: Number(orc.total),
      custo_insumo: 0,
      itens_usados: [],
      forma_pgto: 'Receber na Entrega (Pix/Cartão)',
      funcionario_nome: funcionarioPadraoUnidade?.nome || '',
      funcionario_tel: funcionarioPadraoUnidade?.tel || '',
      status: 'pendente',
      data: new Date().toLocaleDateString('pt-BR'),
      unidade: orc.unidade || unidadeOperacional
    };

    await supabase.from('ordens_servico').insert([itemOS]);
    await supabase.from('orcamentos').update({ status: 'aprovado' }).eq('id', orc.id);

    if (orc.cliente) {
      await garantirCadastroCliente(orc.cliente, orc.tel, '', `Orçamento aprovado -> OS: ${resumoItens}`);
    }
    setAbaAtiva('os');
    carregarDados();
  };

  const excluirOrcamentoSalvo = async (id) => {
    if (!window.confirm('Remover este orçamento da lista?')) return;
    await supabase.from('orcamentos').delete().eq('id', id);
    carregarDados();
  };

  // ================= DADOS DO DASHBOARD =================
  const hojeStr = new Date().toLocaleDateString('pt-BR');
  const hojeISO = new Date().toISOString().split('T')[0];
  const faturamentoHoje = transacoesUnidade
    .filter((t) => t.tipo === 'entrada' && t.data === hojeStr && t.forma !== 'A Receber (Fiado)')
    .reduce((acc, t) => acc + Number(t.valor), 0);
  const osPendentes = osUnidade.filter((o) => o.status !== 'concluida');
  const socorrosPendentes = agendaUnidade.filter((a) => a.status !== 'concluido');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-24 md:pb-8">
      {/* CABEÇALHO COM SELETOR DE UNIDADES + BOTÃO DE EQUIPE/FUNCIONÁRIOS */}
      <header className="bg-slate-900 border-b border-slate-800 px-3 py-2.5 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-amber-500 p-2 rounded-lg text-slate-950 font-bold shrink-0">
              <Wrench size={18} />
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg leading-tight text-amber-400">Luisinho Chaveiro</h1>
              {erroConexao ? (
                <span className="text-[11px] text-red-400 flex items-center gap-1">
                  <AlertCircle size={11} /> {erroConexao}
                </span>
              ) : (
                <span className="text-[11px] text-emerald-400 block truncate max-w-[200px] sm:max-w-xs">
                  ● {unidadeAtiva === 'todas' ? 'Visão Consolidada (2 Pontos)' : infoUnidadeAtual.endereco}
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
                    unidadeAtiva === u.id ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
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
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-amber-400 text-xs font-bold flex items-center gap-1"
              title="Cadastrar Funcionários e Endereços das Unidades"
            >
              <Settings size={14} /> Equipe / Lojas
            </button>
            <button
              onClick={carregarDados}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-slate-300"
              title="Atualizar dados"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin text-amber-400' : ''} />
            </button>
          </div>
        </div>
      </header>

      {/* MODAL PARA CADASTRAR FUNCIONÁRIOS FIXOS E ENDEREÇOS DAS LOJAS */}
      {modalConfigUnidades && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 max-w-lg w-full space-y-5 my-8">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-amber-400 flex items-center gap-2">
                <UserCheck size={18} /> Equipe de Funcionários & Endereços
              </h3>
              <button type="button" onClick={() => setModalConfigUnidades(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* CADASTRO PERMANENTE DE FUNCIONÁRIOS */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-sky-400">
                1. Funcionários Salvos (Não precisa redigitar na OS)
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

            {/* ENDEREÇOS DOS 2 PONTOS */}
            <form onSubmit={salvarConfigUnidades} className="space-y-3 border-t border-slate-800 pt-4">
              <h4 className="text-xs font-bold uppercase text-amber-400">
                2. Endereços das Unidades (Saem no Comprovante)
              </h4>
              {unidadesConfig.map((uni, idx) => (
                <div key={uni.id} className="space-y-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-xs font-bold text-amber-400 uppercase">{uni.id}</span>
                  <input
                    type="text"
                    placeholder="Nome da Unidade"
                    value={uni.nome}
                    onChange={(e) => {
                      const copia = [...unidadesConfig];
                      copia[idx].nome = e.target.value;
                      setUnidadesConfig(copia);
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs"
                  />
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
                Salvar Endereços & Fechar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BARRA DE NAVEGAÇÃO SUPERIOR */}
      <nav className="bg-slate-900 border-b border-slate-800 px-2 py-2 flex overflow-x-auto gap-1 sticky top-[57px] z-20 no-scrollbar">
        {abasMenu.map((aba) => {
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

      {/* PAINEL GLOBAL: ENVIO DE COMPROVANTE WHATSAPP AO CLIENTE */}
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

      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-4 space-y-6">
        {/* ================= ABA 0: DASHBOARD EXECUTIVO ================= */}
        {abaAtiva === 'dashboard' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div onClick={() => setAbaAtiva('caixa')} className="cursor-pointer bg-slate-900 hover:border-emerald-500/50 transition p-3.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">Caixa Hoje ({unidadeAtiva === 'todas' ? '2 Pontos' : infoUnidadeAtual.nome.split(' ')[0]})</span>
                <p className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">R$ {faturamentoHoje.toFixed(2)}</p>
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
              <h2 className="font-bold text-sm text-amber-400 mb-3 flex items-center gap-1.5">
                <Zap size={16} /> Atalhos Rápidos ({infoUnidadeAtual.nome})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button onClick={() => setAbaAtiva('pdv')} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5">
                  <ShoppingCart size={16} /> Venda Balcão
                </button>
                <button onClick={() => setAbaAtiva('simulador')} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5">
                  <Calculator size={16} /> Simular Preço
                </button>
                <button onClick={() => setAbaAtiva('os')} className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold py-3 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700">
                  <Wrench size={16} /> Emitir OS
                </button>
                <button onClick={() => setAbaAtiva('orcamento')} className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold py-3 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700">
                  <FolderClock size={16} /> Orçamentos ({orcamentosEmStandby.length})
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
                  <Award size={16} /> Top Chaves Mais Vendidas
                </h3>
                {topChavesMaisVendidas.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4">As vendas feitas no PDV aparecerão aqui.</p>
                ) : (
                  <div className="space-y-2">
                    {topChavesMaisVendidas.map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded">#{index + 1}</span>
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
                <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
                  <Clock size={16} /> Agenda de Boletos & Alertas de Estoque
                </h3>
                {boletosPendentes.length === 0 && itensEstoqueBaixo.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4">Tudo em dia nesta unidade!</p>
                ) : (
                  <div className="space-y-2 text-xs">
                    {itensEstoqueBaixo.length > 0 && (
                      <div onClick={() => { setAbaAtiva('estoque'); setApenasEstoqueBaixo(true); }} className="cursor-pointer bg-red-950/40 border border-red-800/70 p-2.5 rounded-lg flex justify-between items-center">
                        <span className="text-red-300 font-semibold">⚠ {itensEstoqueBaixo.length} chave(s) com estoque baixo</span>
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

        {/* ================= ABA 1: PDV / BALCÃO ================= */}
        {abaAtiva === 'pdv' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <h2 className="font-bold text-amber-400 mb-3 flex items-center justify-between text-sm sm:text-base">
                  <span className="flex items-center gap-2"><Search size={18} /> Selecionar Chave / Produto ({infoUnidadeAtual.nome})</span>
                </h2>
                <input
                  ref={inputBuscaPdvRef}
                  type="text"
                  placeholder="Buscar chave por código ou nome..."
                  value={buscaPdv}
                  onChange={(e) => setBuscaPdv(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm mb-3"
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {estoqueUnidade
                    .filter((i) => i.nome.toLowerCase().includes(buscaPdv.toLowerCase()) || i.id.toLowerCase().includes(buscaPdv.toLowerCase()))
                    .map((item) => (
                      <button
                        key={item.id}
                        onClick={() => adicionarAoCarrinho(item)}
                        className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition flex flex-col justify-between"
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
                <h3 className="font-bold text-sm text-slate-300">Serviços Rápidos da Tabela ou Mão de Obra Avulsa</h3>
                <div className="flex flex-wrap gap-1.5">
                  {listaServicosBase.slice(0, 6).map((srv) => (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => adicionarServicoAvulsoPdv(srv.nome, srv.valor)}
                      className="bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs px-2.5 py-1.5 rounded-lg text-amber-300 font-medium"
                    >
                      + {srv.nome} (R$ {srv.valor})
                    </button>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Descrição do serviço avulso..."
                    value={servicoAvulsoDesc}
                    onChange={(e) => setServicoAvulsoDesc(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Valor (R$)"
                      value={servicoAvulsoValor}
                      onChange={(e) => setServicoAvulsoValor(e.target.value)}
                      className="w-32 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                    />
                    <button
                      onClick={() => adicionarServicoAvulsoPdv()}
                      className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-sm"
                    >
                      + Incluir
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <h2 className="font-bold text-amber-400 flex items-center gap-2">
                  <ShoppingCart size={18} /> Comanda / Nota de Venda
                </h2>

                <div className="space-y-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-400 uppercase">Cliente (Salva automático na base)</span>
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
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
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
                            <button type="button" onClick={() => alterarQtdItemCarrinho(idx, -1)} className="bg-slate-800 px-2 py-1 rounded font-bold">-</button>
                            <span className="px-1.5 font-bold">{item.qtdVenda}x</span>
                            <button type="button" onClick={() => alterarQtdItemCarrinho(idx, 1)} className="bg-slate-800 px-2 py-1 rounded font-bold">+</button>
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
                  <label className="text-xs text-slate-400 block">Forma de Pagamento</label>
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
          </div>
        )}

        {/* ================= ABA 2: SIMULADOR DE PREÇOS & TABELA EDITÁVEL ================= */}
        {abaAtiva === 'simulador' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4">
                <h2 className="font-bold text-amber-400 flex items-center gap-2">
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
                  <h3 className="font-bold text-amber-400">Resumo da Cotação</h3>
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
                    className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5"
                  >
                    <FolderClock size={15} /> Só Salvar em Standby
                  </button>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={enviarSimuladorParaPDV}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 rounded-lg text-xs"
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
              <h3 className="font-bold text-amber-400">
                Gerenciar Repertório de Preços, Marcas de Fechaduras e Taxas da Maquininha
              </h3>
              <form onSubmit={salvarItemTabelaPrecos} className="grid grid-cols-1 sm:grid-cols-6 gap-2">
                <select
                  value={novoItemTabela.grupo}
                  onChange={(e) => setNovoItemTabela({ ...novoItemTabela, grupo: e.target.value, tipo_valor: e.target.value === 'taxa_cartao' ? 'percentual' : 'fixo' })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-xs"
                >
                  <option value="servico">Serviço Base</option>
                  <option value="peca">Peça / Fechadura / Miolo</option>
                  <option value="adicional">Acréscimo (Área/Urgência)</option>
                  <option value="taxa_cartao">Taxa Maquininha (%)</option>
                </select>
                <input
                  type="text"
                  placeholder="Nome (Ex: Abertura / Cilindro / Crédito 3x) *"
                  required
                  value={novoItemTabela.nome}
                  onChange={(e) => setNovoItemTabela({ ...novoItemTabela, nome: e.target.value })}
                  className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-xs"
                />
                <input
                  type="text"
                  placeholder="Marca / Detalhe (Ex: Stam, Papaiz)"
                  value={novoItemTabela.marca}
                  onChange={(e) => setNovoItemTabela({ ...novoItemTabela, marca: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-xs"
                />
                <div className="flex gap-1">
                  <select
                    value={novoItemTabela.tipo_valor}
                    onChange={(e) => setNovoItemTabela({ ...novoItemTabela, tipo_valor: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-2.5 text-xs"
                  >
                    <option value="fixo">R$</option>
                    <option value="percentual">%</option>
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Valor *"
                    required
                    value={novoItemTabela.valor}
                    onChange={(e) => setNovoItemTabela({ ...novoItemTabela, valor: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2.5 text-xs"
                  />
                </div>
                <button type="submit" className="bg-amber-500 text-slate-950 font-bold py-2.5 px-3 rounded-lg text-xs">
                  {novoItemTabela.id ? 'Atualizar' : '+ Cadastrar'}
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
            </div>
          </div>
        )}

        {/* ================= ABA 3: ORDENS DE SERVIÇO (COM FUNCIONÁRIO AUTOMÁTICO E ENDEREÇO) ================= */}
        {abaAtiva === 'os' && (
          <div className="space-y-6">
            <form onSubmit={(e) => criarOS(e, false)} className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="font-bold text-amber-400">Emitir Ordem de Serviço ({infoUnidadeAtual.nome})</h2>
                <div className="flex flex-wrap gap-2">
                  {clientes.length > 0 && (
                    <select
                      onChange={(e) => {
                        const cli = clientes.find((c) => c.id.toString() === e.target.value);
                        if (cli) setNovaOS({ ...novaOS, cliente: cli.nome, tel: cli.tel || '', endereco: cli.endereco || novaOS.endereco });
                      }}
                      defaultValue=""
                      className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300"
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
                    className="bg-slate-950 border border-sky-700 text-sky-400 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1"
                  >
                    <UserPlus size={13} /> {funcionarios.length === 0 ? 'Cadastrar Funcionário' : `Funcionários (${funcionarios.length})`}
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
                  placeholder="Endereço / Local do Serviço (Sai na ficha)"
                  value={novaOS.endereco}
                  onChange={(e) => setNovaOS({ ...novaOS, endereco: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="O que será feito (Descrição detalhada) *"
                  required
                  value={novaOS.desc}
                  onChange={(e) => setNovaOS({ ...novaOS, desc: e.target.value })}
                  className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Valor Total Cobrado (R$) *"
                  required
                  value={novaOS.valor}
                  onChange={(e) => setNovaOS({ ...novaOS, valor: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-amber-400 block">
                  Materiais / Chaves / Fechaduras do estoque (Permite vários itens):
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
                        [{item.id}] {item.nome} (Estoque: {item.qtd})
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qtd"
                      value={itemTempOS.qtd}
                      onChange={(e) => setItemTempOS({ ...itemTempOS, qtd: e.target.value })}
                      className="w-20 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs"
                    />
                    <button
                      type="button"
                      onClick={adicionarMaterialNaOS}
                      className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold px-3 py-2 rounded-lg text-xs border border-slate-700 whitespace-nowrap"
                    >
                      + Incluir Material
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
                {/* SELETOR DE FUNCIONÁRIO JÁ SALVO */}
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
                  <option value="Sinal 50% Pago / Cobrar Restante">Pagamento: Sinal 50% Pago (Cobrar resto)</option>
                  <option value="Faturado / Condomínio">Pagamento: Faturado / Condomínio</option>
                </select>

                <select
                  value={novaOS.garantia}
                  onChange={(e) => setNovaOS({ ...novaOS, garantia: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300"
                >
                  <option value="90 dias">Garantia Legal: 90 dias</option>
                  <option value="6 meses">Garantia: 6 meses</option>
                  <option value="1 ano">Garantia: 1 ano</option>
                  <option value="Sem garantia">Sem garantia</option>
                </select>

                <input
                  type="text"
                  placeholder="Placa / Modelo Fechadura / Obs"
                  value={novaOS.obs_tecnica}
                  onChange={(e) => setNovaOS({ ...novaOS, obs_tecnica: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-lg text-xs sm:text-sm">
                  Gerar Ordem de Serviço
                </button>
                <button
                  type="button"
                  onClick={() => criarOS(null, true)}
                  className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-xs sm:text-sm flex items-center gap-1.5"
                >
                  <Send size={15} /> Gerar OS & Já Abrir WhatsApp do Funcionário
                </button>
              </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {osUnidade.map((os) => {
                const listaMat = Array.isArray(os.itens_usados) && os.itens_usados.length > 0
                  ? os.itens_usados
                  : (os.chave_id ? [{ id: os.chave_id, nome: os.chave_id, qtd: os.qtd_copias }] : []);

                const nomeFuncExibido = os.funcionario_nome || funcionarioPadraoUnidade?.nome || '';

                return (
                  <div key={os.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-mono text-slate-400">OS N° {os.id.toString().slice(-4)} • {os.data}</span>
                        <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${os.status === 'concluida' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'}`}>
                          {os.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-base mt-1">{os.cliente}</h3>
                      {os.tel && <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><Phone size={11} /> {os.tel}</p>}
                      {os.endereco && <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><MapPin size={11} /> {os.endereco}</p>}
                      <p className="text-sm text-slate-200 mt-1.5">{os.desc}</p>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {os.forma_pgto && (
                          <span className="text-[11px] text-amber-300 font-medium">💳 {os.forma_pgto}</span>
                        )}
                        {nomeFuncExibido && (
                          <span className="text-[11px] text-sky-400 font-bold">🔧 Resp: {nomeFuncExibido}</span>
                        )}
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
                          <button
                            onClick={() => setComprovanteAtivo({
                              origem: `OS N° ${os.id.toString().slice(-4)}`,
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
                            <Share2 size={13} /> Comprovante Cliente
                          </button>
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

        {/* ================= ABA 4: AGENDA DE SOCORROS ================= */}
        {abaAtiva === 'agenda' && (
          <div className="space-y-6">
            <form onSubmit={(e) => criarAgendamento(e, false)} className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="font-bold text-amber-400">Agendar Socorro Externo ({infoUnidadeAtual.nome})</h2>
                {clientes.length > 0 && (
                  <select
                    onChange={(e) => {
                      const cli = clientes.find((c) => c.id.toString() === e.target.value);
                      if (cli) setNovoAgendamento({ ...novoAgendamento, cliente: cli.nome, tel: cli.tel || '', endereco: cli.endereco || novoAgendamento.endereco });
                    }}
                    defaultValue=""
                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300"
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
                  placeholder="Serviço (Ex: Abertura + Troca Miolo) *"
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
                  placeholder="Valor Total Combinado (R$)"
                  value={novoAgendamento.valor_estimado}
                  onChange={(e) => setNovoAgendamento({ ...novoAgendamento, valor_estimado: e.target.value, taxa_deslocamento: 0 })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-amber-400 block">
                  Materiais do Estoque levados no Socorro (Opcional):
                </span>
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
                      + Incluir Peça
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
                  <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-lg text-xs sm:text-sm">
                    Salvar Socorro na Agenda
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

            <div className="space-y-3">
              {agendaUnidade.map((ag) => {
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
                      {nomeFuncSoc && (
                        <span className="text-[11px] text-sky-400 font-bold block">🔧 Resp: {nomeFuncSoc}</span>
                      )}
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

        {/* ================= ABA 5: ORÇAMENTOS COM FILA DE STANDBY ================= */}
        {abaAtiva === 'orcamento' && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="font-bold text-amber-400">
                  {orcamento.id ? `Editando Orçamento de: ${orcamento.cliente}` : `Novo Orçamento — Luisinho Chaveiro (${infoUnidadeAtual.nome})`}
                </h2>
                <div className="flex items-center gap-2">
                  {orcamento.id && (
                    <button
                      type="button"
                      onClick={() => setOrcamento({ id: null, cliente: '', tel: '', itens: [{ desc: '', qtd: 1, valor: 0 }], obs: 'Validade: 7 dias. Garantia de 90 dias.' })}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <X size={14} /> Limpar / Novo
                    </button>
                  )}
                  {clientes.length > 0 && (
                    <select
                      onChange={(e) => {
                        const cli = clientes.find((c) => c.id.toString() === e.target.value);
                        if (cli) setOrcamento({ ...orcamento, cliente: cli.nome, tel: cli.tel || '' });
                      }}
                      defaultValue=""
                      className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300"
                    >
                      <option value="" disabled>Puxar cliente salvo...</option>
                      {clientes.map((c) => (
                        <option key={c.id} value={c.id}>{c.nome}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Nome do Cliente / Empresa *"
                  value={orcamento.cliente}
                  onChange={(e) => setOrcamento({ ...orcamento, cliente: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                />
                <input
                  type="tel"
                  placeholder="WhatsApp do Cliente (com DDD)"
                  value={orcamento.tel}
                  onChange={(e) => setOrcamento({ ...orcamento, tel: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                />
              </div>

              <div className="space-y-2">
                {orcamento.itens.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <input
                      type="text"
                      placeholder="Serviço ou Chave cotada"
                      value={item.desc}
                      onChange={(e) => atualizarItemOrcamento(index, 'desc', e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Qtd"
                        value={item.qtd}
                        onChange={(e) => atualizarItemOrcamento(index, 'qtd', e.target.value)}
                        className="w-20 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                      />
                      <input
                        type="number"
                        step="0.01"
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
                <button
                  type="button"
                  onClick={adicionarLinhaOrcamento}
                  className="text-xs text-amber-400 hover:underline font-semibold"
                >
                  + Adicionar mais um item ao orçamento
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
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
                    <Share2 size={16} /> Salvar Standby & Enviar WhatsApp
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold text-amber-400 flex items-center gap-2">
                  <FolderClock size={18} /> Fila de Orçamentos Salvos / Em Standby
                </h3>
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
                        filtroStatusOrcamento === f.id ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400 border border-slate-800'
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
                    return (
                      <div key={orc.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between gap-3">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[11px] text-slate-400">{orc.data}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${orc.status === 'aprovado' ? 'bg-emerald-950 text-emerald-400' : 'bg-sky-950 text-sky-400'}`}>
                              {orc.status === 'standby' ? 'Em Standby' : orc.status}
                            </span>
                          </div>
                          <h4 className="font-bold text-base text-slate-100 mt-1">{orc.cliente}</h4>
                          {orc.tel && <p className="text-xs text-slate-400 flex items-center gap-1"><Phone size={11} /> {orc.tel}</p>}
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
                                <ShieldCheck size={13} /> Aprovar & Virar OS
                              </button>
                            )}
                            <button
                              onClick={() => dispararTextoOrcamentoWhatsApp(orc)}
                              className="bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1"
                            >
                              <Share2 size={12} /> WhatsApp
                            </button>
                            <button
                              onClick={() => carregarOrcamentoParaEdicao(orc)}
                              className="bg-slate-800 text-amber-400 p-1.5 rounded-lg"
                              title="Editar este orçamento"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => excluirOrcamentoSalvo(orc.id)}
                              className="bg-slate-800 text-red-400 p-1.5 rounded-lg"
                              title="Excluir orçamento"
                            >
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

        {/* ================= ABA 6: CAIXA & AGENDA DE BOLETOS ================= */}
        {abaAtiva === 'caixa' && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'hoje', label: 'Hoje' },
                  { id: '7dias', label: '7 Dias' },
                  { id: 'mes', label: 'Mês Atual' },
                  { id: 'areceber', label: `Fiado (R$ ${totalAReceber.toFixed(0)})` },
                  { id: 'todos', label: 'Tudo' },
                ].map((periodo) => (
                  <button
                    key={periodo.id}
                    onClick={() => setFiltroPeriodoCaixa(periodo.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition ${
                      filtroPeriodoCaixa === periodo.id
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {periodo.label}
                  </button>
                ))}
              </div>
              <button
                onClick={exportarCSVRelatorio}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 border border-slate-700"
              >
                <Download size={14} /> Baixar CSV
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">Entradas Brutas</span>
                <p className="text-lg sm:text-xl font-bold text-emerald-400 mt-1">R$ {totalEntradas.toFixed(2)}</p>
              </div>
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">Saídas / Despesas</span>
                <p className="text-lg sm:text-xl font-bold text-red-400 mt-1">R$ {totalSaidas.toFixed(2)}</p>
              </div>
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">Saldo em Caixa</span>
                <p className={`text-lg sm:text-xl font-bold mt-1 ${saldoLiquido >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
                  R$ {saldoLiquido.toFixed(2)}
                </p>
              </div>
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">Lucro Líquido Real</span>
                <p className={`text-lg sm:text-xl font-bold mt-1 ${lucroRealPeriodo >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  R$ {lucroRealPeriodo.toFixed(2)}
                </p>
                <span className="text-[10px] text-slate-500">Chaves + Taxas: R$ {custoInsumosPeriodo.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block">Pix:</span>
                <strong className="text-emerald-400">R$ {entradasPix.toFixed(2)}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Dinheiro:</span>
                <strong className="text-amber-400">R$ {entradasDinheiro.toFixed(2)}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Cartão:</span>
                <strong className="text-sky-400">R$ {entradasCartao.toFixed(2)}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4">
                <h3 className="font-bold text-amber-400">Movimentações do Caixa ({transacoesFiltradas.length})</h3>

                <form onSubmit={adicionarTransacaoManual} className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={novaTransacao.tipo}
                      onChange={(e) => setNovaTransacao({ ...novaTransacao, tipo: e.target.value })}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-xs font-bold"
                    >
                      <option value="saida">Saída / Despesa (-)</option>
                      <option value="entrada">Entrada Avulsa (+)</option>
                    </select>
                    <select
                      value={novaTransacao.forma}
                      onChange={(e) => setNovaTransacao({ ...novaTransacao, forma: e.target.value })}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-xs"
                    >
                      <option>Pix</option>
                      <option>Dinheiro</option>
                      <option>Cartão de Débito</option>
                      <option>Cartão de Crédito</option>
                      <option>A Receber (Fiado)</option>
                    </select>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Descrição (Ex: Compra de chaves / Gasolina)"
                      required
                      value={novaTransacao.desc}
                      onChange={(e) => setNovaTransacao({ ...novaTransacao, desc: e.target.value })}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Valor R$"
                        required
                        value={novaTransacao.valor}
                        onChange={(e) => setNovaTransacao({ ...novaTransacao, valor: e.target.value })}
                        className="w-28 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                      />
                      <button type="submit" className="flex-1 sm:flex-none bg-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-xs">
                        Lançar
                      </button>
                    </div>
                  </div>
                </form>

                <div className="space-y-2.5 max-h-[460px] overflow-y-auto">
                  {transacoesFiltradas.map((t) => (
                    <div key={t.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-2">
                      {transacaoEditando && transacaoEditando.id === t.id ? (
                        <div className="space-y-2.5">
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={transacaoEditando.tipo}
                              onChange={(e) => setTransacaoEditando({ ...transacaoEditando, tipo: e.target.value })}
                              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs"
                            >
                              <option value="entrada">Entrada (+)</option>
                              <option value="saida">Saída (-)</option>
                            </select>
                            <select
                              value={transacaoEditando.forma}
                              onChange={(e) => setTransacaoEditando({ ...transacaoEditando, forma: e.target.value })}
                              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs"
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
                            value={transacaoEditando.desc}
                            onChange={(e) => setTransacaoEditando({ ...transacaoEditando, desc: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                          />
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="number"
                              step="0.01"
                              value={transacaoEditando.valor}
                              onChange={(e) => setTransacaoEditando({ ...transacaoEditando, valor: e.target.value })}
                              className="w-32 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-amber-400"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={salvarEdicaoTransacao}
                                className="bg-emerald-500 text-slate-950 font-bold px-3 py-2 rounded-lg flex items-center gap-1"
                              >
                                <Check size={14} /> Salvar
                              </button>
                              <button
                                onClick={() => setTransacaoEditando(null)}
                                className="bg-slate-800 text-slate-300 px-3 py-2 rounded-lg flex items-center gap-1"
                              >
                                <X size={14} /> Cancelar
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>
                            <p className="font-semibold text-slate-100 text-sm leading-snug break-words">{t.desc}</p>
                            <span className="text-slate-500 text-[11px] block mt-0.5">
                              {t.data} • {t.forma} {unidadeAtiva === 'todas' ? `• ${(t.unidade || 'ponto1').toUpperCase()}` : ''}
                            </span>
                          </div>
                          <div className="flex items-center justify-between border-t border-slate-900 pt-2">
                            <span className={`text-sm font-bold ${t.tipo === 'entrada' ? (t.forma === 'A Receber (Fiado)' ? 'text-purple-400' : 'text-emerald-400') : 'text-red-400'}`}>
                              {t.tipo === 'entrada' ? '+' : '-'} R$ {Number(t.valor).toFixed(2)}
                            </span>
                            <div className="flex items-center gap-2">
                              {t.forma === 'A Receber (Fiado)' && (
                                <button
                                  onClick={() => quitarPendenciaReceber(t)}
                                  className="bg-purple-600 hover:bg-purple-500 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold"
                                >
                                  Receber Fiado
                                </button>
                              )}
                              <button
                                onClick={() => setTransacaoEditando({ ...t })}
                                className="bg-slate-900 hover:bg-slate-800 text-amber-400 px-2.5 py-1.5 rounded-lg border border-slate-800 flex items-center gap-1"
                              >
                                <Edit2 size={13} /> Editar
                              </button>
                              <button
                                onClick={() => excluirTransacao(t.id)}
                                className="bg-slate-900 hover:bg-slate-800 text-red-400 px-2.5 py-1.5 rounded-lg border border-slate-800"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4">
                <div>
                  <h3 className="font-bold text-amber-400">Calendário de Boletos & Obrigações</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Você pode dar baixa apenas para organizar sua agenda (sem descontar do caixa) ou optar por debitar do caixa.
                  </p>
                </div>

                <form onSubmit={criarContaPagar} className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <input
                    type="text"
                    placeholder="Descrição do Boleto / Fornecedor / Aluguel *"
                    required
                    value={novaConta.desc}
                    onChange={(e) => setNovaConta({ ...novaConta, desc: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Valor R$ *"
                      required
                      value={novaConta.valor}
                      onChange={(e) => setNovaConta({ ...novaConta, valor: e.target.value })}
                      className="w-32 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                    />
                    <input
                      type="date"
                      required
                      value={novaConta.vencimento}
                      onChange={(e) => setNovaConta({ ...novaConta, vencimento: e.target.value })}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                    />
                    <button type="submit" className="bg-amber-500 text-slate-950 font-bold px-4 rounded-lg text-xs">
                      + Agendar
                    </button>
                  </div>
                </form>

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
                              <button
                                onClick={() => darBaixaBoleto(c, false)}
                                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-2.5 py-1.5 rounded-lg text-xs"
                              >
                                ✓ Só Marcar Pago (Sem Caixa)
                              </button>
                              <button
                                onClick={() => darBaixaBoleto(c, true)}
                                className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold px-2.5 py-1.5 rounded-lg text-xs border border-slate-700"
                              >
                                Pagar c/ Caixa da Loja
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => reabrirBoleto(c)}
                              className="text-emerald-400 font-bold hover:underline"
                            >
                              ✓ Quitado na Agenda (Toque p/ reabrir)
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

        {/* ================= ABA 7: ESTOQUE MOBILE-FIRST ================= */}
        {abaAtiva === 'estoque' && (
          <div className="space-y-6">
            {itensEstoqueBaixo.length > 0 && (
              <div className="bg-red-950/50 border border-red-800 p-3 rounded-xl flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-red-300 font-medium">
                  ⚠ <strong>{itensEstoqueBaixo.length} modelo(s)</strong> atingiram o estoque mínimo nesta unidade.
                </span>
                <div className="flex gap-2">
                  <button onClick={gerarPedidoDistribuidorWhatsApp} className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <Share2 size={13} /> Gerar Pedido WhatsApp
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

            <form onSubmit={salvarNovaChave} className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-amber-400 text-sm sm:text-base">
                  {editandoEstoqueId ? `Editando Item: ${editandoEstoqueId}` : `Cadastrar Chave / Produto (${infoUnidadeAtual.nome})`}
                </h2>
                {editandoEstoqueId && (
                  <button type="button" onClick={cancelarEdicaoEstoque} className="text-xs text-slate-400 flex items-center gap-1">
                    <X size={14} /> Cancelar
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
                  placeholder="Qtd"
                  value={novaChave.qtd}
                  onChange={(e) => setNovaChave({ ...novaChave, qtd: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Custo R$"
                  value={novaChave.custo}
                  onChange={(e) => setNovaChave({ ...novaChave, custo: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Venda R$ *"
                  required
                  value={novaChave.venda}
                  onChange={(e) => setNovaChave({ ...novaChave, venda: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                />
              </div>
              <button type="submit" className="w-full sm:w-auto bg-amber-500 text-slate-950 font-bold px-5 py-2.5 rounded-lg text-sm">
                {editandoEstoqueId ? 'Salvar Alterações' : 'Salvar no Estoque'}
              </button>
            </form>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="font-bold text-slate-200">Itens no Estoque ({estoqueFiltrado.length})</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Buscar código ou nome..."
                    value={buscaEstoque}
                    onChange={(e) => setBuscaEstoque(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs"
                  />
                  <select
                    value={filtroCatEstoque}
                    onChange={(e) => setFiltroCatEstoque(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-xs"
                  >
                    <option value="Todas">Todas</option>
                    <option>Yale / Comum</option>
                    <option>Tetra</option>
                    <option>Automotiva / Canivete</option>
                    <option>Multiponto</option>
                    <option>Gorge / Antiga</option>
                    <option>Fechaduras / Cadeados</option>
                  </select>
                </div>
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

        {/* ================= ABA 8: CRM DE CLIENTES UNIFICADO ================= */}
        {abaAtiva === 'clientes' && (
          <div className="space-y-6">
            <form onSubmit={criarCliente} className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
              <h2 className="font-bold text-amber-400">Cadastrar Cliente Manualmente</h2>
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
                  placeholder="Endereço"
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
                  placeholder="Obs (Placa / Fechadura)"
                  value={novoCliente.obs}
                  onChange={(e) => setNovoCliente({ ...novoCliente, obs: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
                />
              </div>
              <button type="submit" className="bg-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-sm">
                Guardar Cliente
              </button>
            </form>

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
              <input
                type="text"
                placeholder="Pesquisar cliente por nome, telefone ou observação..."
                value={buscaClienteCrm}
                onChange={(e) => setBuscaClienteCrm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {clientes
                  .filter((c) => c.nome.toLowerCase().includes(buscaClienteCrm.toLowerCase()) || (c.tel || '').includes(buscaClienteCrm) || (c.obs || '').toLowerCase().includes(buscaClienteCrm.toLowerCase()))
                  .map((c) => (
                    <div key={c.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] bg-slate-800 text-amber-400 px-2 py-0.5 rounded">{c.tipo}</span>
                          <h3 className="font-bold text-base mt-1">{c.nome}</h3>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Phone size={12} /> {c.tel || 'Sem telefone'}</p>
                          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><MapPin size={12} /> {c.endereco || 'Sem endereço'}</p>
                          {c.obs && <p className="text-xs text-amber-300/80 mt-1">{c.obs}</p>}
                        </div>
                        <button onClick={() => excluirCliente(c.id)} className="text-red-400 p-1">
                          <Trash2 size={16} />
                        </button>
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

      {/* BARRA DE NAVEGAÇÃO INFERIOR FIXA PARA CELULAR */}
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
                abaAtiva === item.id ? 'text-amber-400 bg-slate-800/80' : 'text-slate-400'
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