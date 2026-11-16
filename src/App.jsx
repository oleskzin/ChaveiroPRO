import React, { useState, useEffect } from 'react';
import { 
  Wrench, Package, DollarSign, FileText, Plus, Minus, AlertTriangle, 
  Trash2, Download, CheckCircle, Share2, Search, Send, X, Edit3, 
  Calendar, CheckSquare, Clock, Users, MapPin, TrendingUp, Cpu, 
  Target, ClipboardList, Phone
} from 'lucide-react';

const CATALOGO_INICIAL = [
  // --- PLANAS / FECHADURAS E CADEADOS ---
  { id: 'pl-1', nome: '1 - Yale Lg.', cat: 'Plana' },
  { id: 'pl-2', nome: '2 - Yale', cat: 'Plana' },
  { id: 'pl-3', nome: '3 - Yale Peq.', cat: 'Plana' },
  { id: 'pl-4', nome: '4 - Yale Peq. Ct.', cat: 'Plana' },
  { id: 'pl-14', nome: '14 - La Fonte Lg. L.UM', cat: 'Plana' },
  { id: 'pl-15', nome: '15 - La Fonte Med. L.UM', cat: 'Plana' },
  { id: 'pl-16', nome: '16 - La Fonte Peq. L.Y', cat: 'Plana' },
  { id: 'pl-17', nome: '17 - Brasil L.UM', cat: 'Plana' },
  { id: 'pl-25', nome: '25 - Arouca Lg.', cat: 'Plana' },
  { id: 'pl-26', nome: '26 - Arouca Gde.', cat: 'Plana' },
  { id: 'pl-27', nome: '27 - Arouca Peq.', cat: 'Plana' },
  { id: 'pl-29', nome: '29 - Fama Gde. L.Y', cat: 'Plana' },
  { id: 'pl-31', nome: '31 - Aliança Gde. L.Y.', cat: 'Plana' },
  { id: 'pl-35', nome: '35 - Pado Fech. 6 Pinos L. UM', cat: 'Plana' },
  { id: 'pl-62', nome: '62 - Aliança Pacific', cat: 'Plana' },
  { id: 'pl-72', nome: '72 - Aliança Peq. L.Y.', cat: 'Plana' },
  { id: 'pl-290', nome: '290 - Aliança Gav. L.Y.', cat: 'Plana' },
  { id: 'pl-302', nome: '302 - Stam Fech. Med. L.Y', cat: 'Plana' },
  { id: 'pl-304', nome: '304 - Stam Med. L.UM', cat: 'Plana' },
  { id: 'pl-323', nome: '323 - Stam Fech. Gde. L.UM', cat: 'Plana' },
  { id: 'pl-325', nome: '325 - Stam Fech. Gde. L.Y', cat: 'Plana' },
  { id: 'pl-543', nome: '543 - Stam Fech. L.Y', cat: 'Plana' },
  { id: 'pl-544', nome: '544 - Stam Fech. L.UM', cat: 'Plana' },
  { id: 'cd-595', nome: '595 - Gold Cad. Med.', cat: 'Cadeado' },
  { id: 'cd-596', nome: '596 - Gold Cad. Gde.', cat: 'Cadeado' },
  { id: 'pl-682', nome: '682 - Pado', cat: 'Plana' },
  { id: 'cd-839', nome: '839 - Aliança Cad. Médio', cat: 'Cadeado' },
  { id: 'pl-1040', nome: '1040 - 3F Fech.', cat: 'Plana' },
  { id: 'pl-1071', nome: '1071 - AGL Fech. Elétrica', cat: 'Plana' },

  // --- CHAVES TETRAS ---
  { id: 'tr-1231', nome: '1231 - AGL Tetra', cat: 'Tetra' },
  { id: 'tr-580', nome: '580 - Aliança Tr. Seg.', cat: 'Tetra' },
  { id: 'tr-853', nome: '853 - Aliança Tetra Lg.', cat: 'Tetra' },
  { id: 'tr-445', nome: '445 - Arouca Tr. Seg.', cat: 'Tetra' },
  { id: 'tr-659', nome: '659 - Arouca Tetra', cat: 'Tetra' },
  { id: 'tr-706', nome: '706 - Arouca Cad. Peq.', cat: 'Tetra' },
  { id: 'tr-779', nome: '779 - Arouca Tetra', cat: 'Tetra' },
  { id: 'tr-1055', nome: '1055 - Arouca Multi-ponto Tetra', cat: 'Tetra' },
  { id: 'tr-524', nome: '524 - Brasil Tr. Seg. e Fech.', cat: 'Tetra' },
  { id: 'tr-959', nome: '959 - Brasília Cad. Tetra', cat: 'Tetra' },
  { id: 'tr-555', nome: '555 - César Cad. P. Aço', cat: 'Tetra' },
  { id: 'tr-637', nome: '637 - César Cad. Tetra Lg.', cat: 'Tetra' },
  { id: 'tr-859', nome: '859 - Delta Trava', cat: 'Tetra' },
  { id: 'tr-866', nome: '866 - Fama Cad. Tetra', cat: 'Tetra' },
  { id: 'tr-947', nome: '947 - Franzmar Tetra', cat: 'Tetra' },
  { id: 'tr-430', nome: '430 - Gold Cad. P. Aço e Cad. Milano', cat: 'Tetra' },
  { id: 'tr-572', nome: '572 - Gold Cad.', cat: 'Tetra' },
  { id: 'tr-606', nome: '606 - Gold Fech. Sobrepor', cat: 'Tetra' },
  { id: 'tr-660', nome: '660 - Gold Tetra', cat: 'Tetra' },
  { id: 'tr-1098', nome: '1098 - Gold Fech. Tetra Sobrepor', cat: 'Tetra' },
  { id: 'tr-770', nome: '770 - Haga Tetra', cat: 'Tetra' },
  { id: 'tr-794', nome: '794 - Haga Tetra Ct.', cat: 'Tetra' },
  { id: 'tr-819', nome: '819 - Haga Tetra', cat: 'Tetra' },
  { id: 'tr-1009', nome: '1009 - Haga Tetra', cat: 'Tetra' },
  { id: 'tr-1013', nome: '1013 - Hela Tetra', cat: 'Tetra' },
  { id: 'tr-1230', nome: '1230 - Imab Tetra', cat: 'Tetra' },
  { id: 'tr-865', nome: '865 - Líder Fech. Elet.', cat: 'Tetra' },
  { id: 'tr-1070', nome: '1070 - Líder Fech. Tetra', cat: 'Tetra' },
  { id: 'tr-403', nome: '403 - Lockwell Tr. Seg.', cat: 'Tetra' },
  { id: 'tr-418', nome: '418 - Lockwell Tr. Seg.', cat: 'Tetra' },
  { id: 'tr-633', nome: '633 - Pacri Tetra', cat: 'Tetra' },
  { id: 'tr-310', nome: '310 - Pado Estilo Colonial', cat: 'Tetra' },
  { id: 'tr-378', nome: '378 - Pado Tr. Seg.', cat: 'Tetra' },
  { id: 'tr-609', nome: '609 - Pado Tr. Seg. c/ Canal', cat: 'Tetra' },
  { id: 'tr-618', nome: '618 - Pado Tr. Seg. Lg. c/ Canal', cat: 'Tetra' },
  { id: 'tr-639', nome: '639 - Pado Tetra', cat: 'Tetra' },
  { id: 'tr-845', nome: '845 - Pado Tetra', cat: 'Tetra' },
  { id: 'tr-1046', nome: '1046 - Pado Tetra', cat: 'Tetra' },
  { id: 'tr-1094', nome: '1094 - Fech. Tetra Pado', cat: 'Tetra' },
  { id: 'tr-183', nome: '183 - Papaiz Tr. Seg. / Tetra', cat: 'Tetra' },
  { id: 'tr-327', nome: '327 - Papaiz Cil. Triang.', cat: 'Tetra' },
  { id: 'tr-364', nome: '364 - Papaiz Fech. p/ Móveis', cat: 'Tetra' },
  { id: 'tr-377', nome: '377 - Papaiz Cil. Triang.', cat: 'Tetra' },
  { id: 'tr-690', nome: '690 - Polyforte Tr.', cat: 'Tetra' },
  { id: 'tr-912', nome: '912 - Polyforte Tr.', cat: 'Tetra' },
  { id: 'tr-643', nome: '643 - Soprano Tetra', cat: 'Tetra' },
  { id: 'tr-677', nome: '677 - Soprano Cad. Tetra', cat: 'Tetra' },
  { id: 'tr-1116', nome: '1116 - Soprano Tetra', cat: 'Tetra' },
  { id: 'tr-1135', nome: '1135 - Soprano Fech. Sobrepor Tetra', cat: 'Tetra' },
  { id: 'tr-442', nome: '442 - Stam Tetra', cat: 'Tetra' },
  { id: 'tr-493', nome: '493 - Stam Tetra', cat: 'Tetra' },
  { id: 'tr-665', nome: '665 - Stam Tetra', cat: 'Tetra' },
  { id: 'tr-667', nome: '667 - Stam Tetra P. Aço', cat: 'Tetra' },
  { id: 'tr-672', nome: '672 - Stam Tetra', cat: 'Tetra' },
  { id: 'tr-713', nome: '713 - Stam Tetra', cat: 'Tetra' },
  { id: 'tr-873', nome: '873 - Stam Tetra', cat: 'Tetra' },
  { id: 'tr-933', nome: '933 - Stam Tetra', cat: 'Tetra' },
  { id: 'tr-1108', nome: '1108 - Stam Tetra', cat: 'Tetra' },
  { id: 'tr-604', nome: '604 - Trancalar Tetra', cat: 'Tetra' },
  { id: 'tr-628', nome: '628 - Trancalar Tetra', cat: 'Tetra' },

  // --- AUTOMOTIVAS PANTOGRÁFICAS ---
  { id: 'pa-471', nome: '471 - BMW (Pantográfica)', cat: 'Pantográfica' },
  { id: 'pa-452', nome: '452 - GM Omega/Vectra (Pantográfica)', cat: 'Pantográfica' },
  { id: 'pa-685', nome: '685 - GM Vectra/Omega (Pantográfica)', cat: 'Pantográfica' },
  { id: 'pa-823', nome: '823 - Honda Fit / Alpaca (Pantográfica)', cat: 'Pantográfica' },
  { id: 'pa-1102', nome: '1102 - Hyundai Azzera (Pantográfica)', cat: 'Pantográfica' },
  { id: 'pa-500', nome: '500 - Mercedes (Pantográfica)', cat: 'Pantográfica' },
  { id: 'pa-528', nome: '528 - Mercedes (Pantográfica)', cat: 'Pantográfica' },
  { id: 'pa-623', nome: '623 - Mercedes (Pantográfica)', cat: 'Pantográfica' },
  { id: 'pa-882', nome: '882 - Mercedes (Pantográfica)', cat: 'Pantográfica' },
  { id: 'pa-670', nome: '670 - Scania (Pantográfica)', cat: 'Pantográfica' },
  { id: 'pa-600', nome: '600 - Volvo (Pantográfica)', cat: 'Pantográfica' },
  { id: 'pa-683', nome: '683 - VW s/ Transponder (Pantográfica)', cat: 'Pantográfica' },

  // --- AUTOMOTIVAS PLÁSTICAS E METÁLICAS ---
  { id: 'au-367', nome: '367 - Fiat Uno', cat: 'Automotiva' },
  { id: 'au-448', nome: '448 - Fiat Tempra/Tipo', cat: 'Automotiva' },
  { id: 'au-597', nome: '597 - Fiat Palio s/ Transponder', cat: 'Automotiva' },
  { id: 'au-761', nome: '761 - Fiat Palio Logotipo', cat: 'Automotiva' },
  { id: 'au-830', nome: '830 - Fiat Palio Logotipo', cat: 'Automotiva' },
  { id: 'au-339', nome: '339 - Ford Escort', cat: 'Automotiva' },
  { id: 'au-551', nome: '551 - Ford Ranger', cat: 'Automotiva' },
  { id: 'au-598', nome: '598 - Ford Escort s/ Reb.', cat: 'Automotiva' },
  { id: 'au-151', nome: '151 - GM Chevette', cat: 'Automotiva' },
  { id: 'au-368', nome: '368 - GM Opala/Caravan', cat: 'Automotiva' },
  { id: 'au-407', nome: '407 - GM Kadett', cat: 'Automotiva' },
  { id: 'au-410', nome: '410 - GM Monza', cat: 'Automotiva' },
  { id: 'au-552', nome: '552 - GM S10', cat: 'Automotiva' },
  { id: 'au-569', nome: '569 - GM Astra', cat: 'Automotiva' },
  { id: 'au-621', nome: '621 - GM Corsa/Astra', cat: 'Automotiva' },
  { id: 'au-757', nome: '757 - GM Celta', cat: 'Automotiva' },
  { id: 'au-914', nome: '914 - GM Chevette/Monza Logotipo', cat: 'Automotiva' },
  { id: 'au-579', nome: '579 - Honda Titan', cat: 'Automotiva' },
  { id: 'au-640', nome: '640 - Honda P. Luvas', cat: 'Automotiva' },
  { id: 'au-692', nome: '692 - Honda CB 500', cat: 'Automotiva' },
  { id: 'au-1000', nome: '1000 - Honda Pop', cat: 'Automotiva' },
  { id: 'au-1056', nome: '1056 - Honda Biz', cat: 'Automotiva' },
  { id: 'au-1077', nome: '1077 - Honda Hornet/Shadow', cat: 'Automotiva' },
  { id: 'au-294', nome: '294 - VW Gol', cat: 'Automotiva' },
  { id: 'au-362', nome: '362 - VW Santana', cat: 'Automotiva' },
  { id: 'au-523', nome: '523 - VW Gol', cat: 'Automotiva' },
  { id: 'au-565', nome: '565 - VW Gol Cli', cat: 'Automotiva' },
  { id: 'au-587', nome: '587 - VW Gol Cli', cat: 'Automotiva' },
  { id: 'au-602', nome: '602 - VW Gol/Parati', cat: 'Automotiva' },
  { id: 'au-683', nome: '683 - VW s/ Transponder', cat: 'Automotiva' }
];

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState('inicio');

  // --- ESTADOS COM PERSISTÊNCIA ---
  const [estoque, setEstoque] = useState(() => {
    const salvo = localStorage.getItem('chaveiro_estoque_v15');
    if (salvo) return JSON.parse(salvo);
    return CATALOGO_INICIAL.map(c => ({
      ...c,
      qtd: 10,
      minimo: 3,
      custo: c.cat === 'Tetra' || c.cat === 'Pantográfica' ? 6.50 : 2.50,
      venda: c.cat === 'Tetra' || c.cat === 'Pantográfica' ? 25.00 : 12.00,
      vendasTotal: 0
    }));
  });

  const [transacoes, setTransacoes] = useState(() => {
    const salvo = localStorage.getItem('chaveiro_transacoes_v15');
    return salvo ? JSON.parse(salvo) : [
      { id: 1, tipo: 'entrada', desc: 'Cópia: 1 - Yale Lg. (Qtd: 2)', valor: 24.00, custoInsumo: 5.00, forma: 'Pix', data: new Date().toLocaleDateString(), timestamp: Date.now() }
    ];
  });

  const [contasPagar, setContasPagar] = useState(() => {
    const salvo = localStorage.getItem('chaveiro_contas_v15');
    return salvo ? JSON.parse(salvo) : [
      { id: 1, desc: 'Fornecedor de Chaves Gold', valor: 180.00, vencimento: '2026-11-25', status: 'pendente' }
    ];
  });

  const [metaDiaria, setMetaDiaria] = useState(() => {
    const salvo = localStorage.getItem('chaveiro_meta_v15');
    return salvo ? parseFloat(salvo) : 300.00;
  });

  const [ordensServico, setOrdensServico] = useState(() => {
    const salvo = localStorage.getItem('chaveiro_os_v15');
    return salvo ? JSON.parse(salvo) : [
      { id: 101, cliente: 'Oficina do Marcos', tel: '21999990000', desc: 'Confecção de chave pelo miolo + Chip ID48 (Gol G5)', valor: 280.00, status: 'em_andamento', data: new Date().toLocaleDateString() }
    ];
  });

  const [agendamentos, setAgendamentos] = useState(() => {
    const salvo = localStorage.getItem('chaveiro_agenda_v15');
    return salvo ? JSON.parse(salvo) : [
      { id: 1, cliente: 'Dona Maria', tel: '21988887777', endereco: 'Rua Principal, 120 - Campo Grande', servico: 'Troca de segredo fechadura Tetra', data: '2026-11-17', hora: '14:30', taxaDeslocamento: 30.00, valorEstimado: 150.00, status: 'agendado' }
    ];
  });

  const [clientes, setClientes] = useState(() => {
    const salvo = localStorage.getItem('chaveiro_clientes_v15');
    return salvo ? JSON.parse(salvo) : [
      { id: 1, nome: 'Condomínio Solar das Palmeiras', tel: '21977776666', endereco: 'Estr. de Sepetiba, 450', tipo: 'Condomínio', obs: 'Síndico Sr. Carlos - Sempre pede 10 cópias' }
    ];
  });

  // --- SINCRONIZAÇÃO COM LOCALSTORAGE ---
  useEffect(() => { localStorage.setItem('chaveiro_estoque_v15', JSON.stringify(estoque)); }, [estoque]);
  useEffect(() => { localStorage.setItem('chaveiro_transacoes_v15', JSON.stringify(transacoes)); }, [transacoes]);
  useEffect(() => { localStorage.setItem('chaveiro_contas_v15', JSON.stringify(contasPagar)); }, [contasPagar]);
  useEffect(() => { localStorage.setItem('chaveiro_meta_v15', metaDiaria.toString()); }, [metaDiaria]);
  useEffect(() => { localStorage.setItem('chaveiro_os_v15', JSON.stringify(ordensServico)); }, [ordensServico]);
  useEffect(() => { localStorage.setItem('chaveiro_agenda_v15', JSON.stringify(agendamentos)); }, [agendamentos]);
  useEffect(() => { localStorage.setItem('chaveiro_clientes_v15', JSON.stringify(clientes)); }, [clientes]);

  // --- ESTADOS DE FORMULÁRIOS E NAVEGAÇÃO INTERNA ---
  const [subAbaServicos, setSubAbaServicos] = useState('pdv'); // 'pdv' ou 'os'
  const [servicoTipo, setServicoTipo] = useState('copia');
  const [termoBuscaChave, setTermoBuscaChave] = useState('');
  const [chaveSelecionadaId, setChaveSelecionadaId] = useState(CATALOGO_INICIAL[0].id);
  const [mostrarDropdownChaves, setMostrarDropdownChaves] = useState(false);
  const [qtdCopias, setQtdCopias] = useState(1);
  const [numChaveRegistro, setNumChaveRegistro] = useState('');
  const [chipTransponder, setChipTransponder] = useState('');
  const [taxaDeslocamentoPDV, setTaxaDeslocamentoPDV] = useState('');
  const [clientePDV, setClientePDV] = useState('');
  const [salvarComoOS, setSalvarComoOS] = useState(false);

  const [nomeServico, setNomeServico] = useState('');
  const [descServico, setDescServico] = useState('');
  const [valorServico, setValorServico] = useState('');
  const [formaPagto, setFormaPagto] = useState('Pix');
  const [ultimoComprovante, setUltimoComprovante] = useState(null);

  // Estados de Estoque
  const [mostrarModalNovoItem, setMostrarModalNovoItem] = useState(false);
  const [novoNomeItem, setNovoNomeItem] = useState('');
  const [novaCatItem, setNovaCatItem] = useState('Plana');
  const [novaQtdItem, setNovaQtdItem] = useState(10);
  const [novoCustoItem, setNovoCustoItem] = useState(3.50);
  const [novoVendaItem, setNovoVendaItem] = useState(12.00);
  const [filtroEstoque, setFiltroEstoque] = useState('');
  const [filtroApenasBaixo, setFiltroApenasBaixo] = useState(false);

  // Estados de Agenda
  const [mostrarModalAgenda, setMostrarModalAgenda] = useState(false);
  const [agCliente, setAgCliente] = useState('');
  const [agTel, setAgTel] = useState('');
  const [agEndereco, setAgEndereco] = useState('');
  const [agServico, setAgServico] = useState('');
  const [agData, setAgData] = useState('');
  const [agHora, setAgHora] = useState('');
  const [agTaxa, setAgTaxa] = useState('');
  const [agValor, setAgValor] = useState('');

  // Estados de Clientes e Orçamentos
  const [subAbaClientes, setSubAbaClientes] = useState('lista'); // 'lista' ou 'orcamento'
  const [mostrarModalCliente, setMostrarModalCliente] = useState(false);
  const [cliNome, setCliNome] = useState('');
  const [cliTel, setCliTel] = useState('');
  const [cliEnd, setCliEnd] = useState('');
  const [cliTipo, setCliTipo] = useState('Particular');
  const [cliObs, setCliObs] = useState('');

  const [orcCliente, setOrcCliente] = useState('');
  const [orcTel, setOrcTel] = useState('');
  const [orcItens, setOrcItens] = useState([{ desc: 'Troca de segredo', qtd: 1, valor: 80.00 }]);
  const [orcItemDesc, setOrcItemDesc] = useState('');
  const [orcItemQtd, setOrcItemQtd] = useState(1);
  const [orcItemVal, setOrcItemVal] = useState('');
  const [orcDeslocamento, setOrcDeslocamento] = useState('');

  // Estados de Caixa
  const [subAbaCaixa, setSubAbaCaixa] = useState('extrato'); // 'extrato', 'boletos', 'lucro'
  const [mostrarModalCaixa, setMostrarModalCaixa] = useState(false);
  const [tipoMovCaixa, setTipoMovCaixa] = useState('entrada');
  const [descMovCaixa, setDescMovCaixa] = useState('');
  const [valorMovCaixa, setValorMovCaixa] = useState('');
  const [formaMovCaixa, setFormaMovCaixa] = useState('Dinheiro');

  const [mostrarModalBoleto, setMostrarModalBoleto] = useState(false);
  const [descBoleto, setDescBoleto] = useState('');
  const [valorBoleto, setValorBoleto] = useState('');
  const [vencBoleto, setVencBoleto] = useState('');

  const [editandoMeta, setEditandoMeta] = useState(false);
  const [novaMetaInput, setNovaMetaInput] = useState(metaDiaria);

  // --- CÁLCULOS FINANCEIROS E MÉTRICAS ---
  const hojeStr = new Date().toLocaleDateString();
  const transacoesHoje = transacoes.filter(t => t.data === hojeStr);
  const transacoesOutros = transacoes.filter(t => t.data !== hojeStr);

  const totalEntradas = transacoes.filter(t => t.tipo === 'entrada').reduce((acc, t) => acc + t.valor, 0);
  const totalSaidas = transacoes.filter(t => t.tipo === 'saida').reduce((acc, t) => acc + t.valor, 0);
  const saldoCaixa = totalEntradas - totalSaidas;

  const entradasHoje = transacoesHoje.filter(t => t.tipo === 'entrada').reduce((acc, t) => acc + t.valor, 0);
  const progressoMeta = Math.min(100, Math.round((entradasHoje / (metaDiaria || 1)) * 100));

  const custoInsumosTotal = transacoes.filter(t => t.tipo === 'entrada').reduce((acc, t) => acc + (t.custoInsumo || 0), 0);
  const lucroLiquidoReal = totalEntradas - totalSaidas - custoInsumosTotal;

  // Ranking de chaves mais consumidas
  const rankingConsumo = [...estoque].sort((a, b) => (b.vendasTotal || 0) - (a.vendasTotal || 0)).slice(0, 5);

  const alterarQtdEstoque = (id, delta, registrarVenda = false) => {
    setEstoque(prev => prev.map(item => {
      if (item.id === id) {
        const novaQtd = Math.max(0, item.qtd + delta);
        const novasVendas = registrarVenda ? (item.vendasTotal || 0) + Math.abs(delta) : (item.vendasTotal || 0);
        return { ...item, qtd: novaQtd, vendasTotal: novasVendas };
      }
      return item;
    }));
  };

  // --- FUNÇÕES DE REGISTRO ---
  const registrarServico = (e) => {
    e.preventDefault();
    const valorBase = parseFloat(valorServico) || 0;
    const valorTaxa = parseFloat(taxaDeslocamentoPDV) || 0;
    const valorFinal = valorBase + valorTaxa;

    if (valorFinal <= 0) {
      alert('Informe um valor válido para o serviço.');
      return;
    }

    let descFinal = '';
    let custoTotalInsumo = 0;

    if (servicoTipo === 'copia') {
      const itemEstoque = estoque.find(i => i.id === chaveSelecionadaId);
      if (!itemEstoque || itemEstoque.qtd < qtdCopias) {
        alert(`Estoque insuficiente ou chave inválida!`);
        return;
      }
      if (!salvarComoOS) {
        alterarQtdEstoque(chaveSelecionadaId, -qtdCopias, true);
      }
      custoTotalInsumo = (itemEstoque.custo || 2.50) * qtdCopias;
      descFinal = `Cópia: ${itemEstoque.nome} (Qtd: ${qtdCopias})`;
      if (numChaveRegistro.trim()) descFinal += ` [Num: ${numChaveRegistro}]`;
      if (chipTransponder.trim()) descFinal += ` [Chip/Transponder: ${chipTransponder}]`;
    } else {
      if (!nomeServico.trim()) {
        alert('Informe o nome do serviço.');
        return;
      }
      descFinal = `${nomeServico}${descServico ? ` - ${descServico}` : ''}`;
      if (numChaveRegistro.trim()) descFinal += ` [Num/Segredo: ${numChaveRegistro}]`;
      if (chipTransponder.trim()) descFinal += ` [Chip/Transponder: ${chipTransponder}]`;
    }

    if (valorTaxa > 0) {
      descFinal += ` (+ Deslocamento R$ ${valorTaxa.toFixed(2)})`;
    }
    if (clientePDV.trim()) {
      descFinal += ` | Cliente: ${clientePDV}`;
    }

    if (salvarComoOS) {
      const novaOS = {
        id: Math.floor(100 + Math.random() * 900),
        cliente: clientePDV.trim() || 'Cliente Balcão',
        tel: '',
        desc: descFinal,
        valor: valorFinal,
        custoInsumo: custoTotalInsumo,
        chaveId: servicoTipo === 'copia' ? chaveSelecionadaId : null,
        qtdCopias: servicoTipo === 'copia' ? qtdCopias : 0,
        status: 'pendente',
        data: hojeStr
      };
      setOrdensServico([novaOS, ...ordensServico]);
      setSubAbaServicos('os');
      alert('Ordem de Serviço (OS) aberta com sucesso!');
    } else {
      const novaTransacao = {
        id: Date.now(),
        tipo: 'entrada',
        desc: descFinal,
        valor: valorFinal,
        custoInsumo: custoTotalInsumo,
        forma: formaPagto,
        data: hojeStr,
        timestamp: Date.now()
      };
      setTransacoes([novaTransacao, ...transacoes]);
      setUltimoComprovante(novaTransacao);
      alert('Serviço concluído e lançado no caixa!');
    }

    setValorServico('');
    setTaxaDeslocamentoPDV('');
    setNumChaveRegistro('');
    setChipTransponder('');
    setNomeServico('');
    setDescServico('');
    setClientePDV('');
  };

  const concluirOS = (os) => {
    if (os.status === 'concluida') return;
    if (os.chaveId && os.qtdCopias > 0) {
      alterarQtdEstoque(os.chaveId, -os.qtdCopias, true);
    }
    setOrdensServico(ordensServico.map(item => item.id === os.id ? { ...item, status: 'concluida' } : item));
    const novaTransacao = {
      id: Date.now(),
      tipo: 'entrada',
      desc: `[OS #${os.id}] ${os.desc}`,
      valor: os.valor,
      custoInsumo: os.custoInsumo || 0,
      forma: 'Pix/Dinheiro',
      data: hojeStr,
      timestamp: Date.now()
    };
    setTransacoes([novaTransacao, ...transacoes]);
    setUltimoComprovante(novaTransacao);
    alert(`OS #${os.id} concluída e valor lançado no caixa!`);
  };

  const registrarPerda = () => {
    const itemEstoque = estoque.find(i => i.id === chaveSelecionadaId);
    if (!itemEstoque || itemEstoque.qtd <= 0) {
      alert('Selecione um item com estoque disponível na aba de Serviços.');
      return;
    }
    alterarQtdEstoque(chaveSelecionadaId, -1, false);
    const perda = {
      id: Date.now(),
      tipo: 'saida',
      desc: `Perda/Quebra na máquina: ${itemEstoque.nome}`,
      valor: itemEstoque.custo || 3.50,
      forma: 'Ajuste de Estoque',
      data: hojeStr,
      timestamp: Date.now()
    };
    setTransacoes([perda, ...transacoes]);
    alert(`Quebra de 1 un. de ${itemEstoque.nome} registrada!`);
  };

  const cadastrarNovoItemEstoque = (e) => {
    e.preventDefault();
    if (!novoNomeItem.trim()) return;
    const novoItem = {
      id: 'custom-' + Date.now(),
      nome: novoNomeItem.trim(),
      cat: novaCatItem,
      qtd: parseInt(novaQtdItem) || 5,
      minimo: 3,
      custo: parseFloat(novoCustoItem) || 3.00,
      venda: parseFloat(novoVendaItem) || 12.00,
      vendasTotal: 0
    };
    setEstoque([novoItem, ...estoque]);
    setNovoNomeItem('');
    setMostrarModalNovoItem(false);
  };

  const salvarAgendamento = (e) => {
    e.preventDefault();
    if (!agCliente.trim() || !agServico.trim()) return;
    const novoAg = {
      id: Date.now(),
      cliente: agCliente,
      tel: agTel,
      endereco: agEndereco,
      servico: agServico,
      data: agData || hojeStr,
      hora: agHora || '10:00',
      taxaDeslocamento: parseFloat(agTaxa) || 0,
      valorEstimado: parseFloat(agValor) || 0,
      status: 'agendado'
    };
    setAgendamentos([novoAg, ...agendamentos]);
    setAgCliente(''); setAgTel(''); setAgEndereco(''); setAgServico(''); setAgTaxa(''); setAgValor('');
    setMostrarModalAgenda(false);
  };

  const concluirAgendamento = (ag) => {
    const total = (ag.valorEstimado || 0) + (ag.taxaDeslocamento || 0);
    setAgendamentos(agendamentos.map(a => a.id === ag.id ? { ...a, status: 'concluido' } : a));
    if (total > 0) {
      const novaTrans = {
        id: Date.now(),
        tipo: 'entrada',
        desc: `Socorro/Visita: ${ag.servico} (${ag.cliente})`,
        valor: total,
        custoInsumo: 0,
        forma: 'Pix/Dinheiro',
        data: hojeStr,
        timestamp: Date.now()
      };
      setTransacoes([novaTrans, ...transacoes]);
      alert('Visita concluída e valor creditado no caixa!');
    }
  };

  const salvarCliente = (e) => {
    e.preventDefault();
    if (!cliNome.trim()) return;
    const novoCli = {
      id: Date.now(),
      nome: cliNome,
      tel: cliTel,
      endereco: cliEnd,
      tipo: cliTipo,
      obs: cliObs
    };
    setClientes([novoCli, ...clientes]);
    setCliNome(''); setCliTel(''); setCliEnd(''); setCliObs('');
    setMostrarModalCliente(false);
  };

  const adicionarItemOrcamento = () => {
    if (!orcItemDesc.trim() || !orcItemVal) return;
    setOrcItens([...orcItens, {
      desc: orcItemDesc,
      qtd: parseInt(orcItemQtd) || 1,
      valor: parseFloat(orcItemVal) || 0
    }]);
    setOrcItemDesc('');
    setOrcItemQtd(1);
    setOrcItemVal('');
  };

  const enviarOrcamentoWhatsApp = () => {
    const subtotal = orcItens.reduce((acc, i) => acc + (i.qtd * i.valor), 0);
    const desloc = parseFloat(orcDeslocamento) || 0;
    const total = subtotal + desloc;

    let texto = `*ORÇAMENTO - CHAVEIRO PRO*\n`;
    if (orcCliente) texto += `Cliente: ${orcCliente}\n`;
    texto += `Data: ${hojeStr}\n\n*ITENS DO SERVIÇO:*\n`;
    orcItens.forEach(i => {
      texto += `• ${i.qtd}x ${i.desc}: R$ ${(i.qtd * i.valor).toFixed(2)}\n`;
    });
    if (desloc > 0) texto += `• Taxa de Deslocamento: R$ ${desloc.toFixed(2)}\n`;
    texto += `\n*VALOR TOTAL: R$ ${total.toFixed(2)}*\n\nOrçamento válido por 7 dias. Aguardo sua confirmação!`;

    const foneLimpo = orcTel.replace(/\D/g, '');
    const url = foneLimpo ? `https://wa.me/55${foneLimpo}?text=${encodeURIComponent(texto)}` : `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  const adicionarMovimentoCaixa = (e) => {
    e.preventDefault();
    const val = parseFloat(valorMovCaixa);
    if (isNaN(val) || val <= 0 || !descMovCaixa.trim()) return;
    setTransacoes([{
      id: Date.now(),
      tipo: tipoMovCaixa,
      desc: descMovCaixa,
      valor: val,
      custoInsumo: 0,
      forma: formaMovCaixa,
      data: hojeStr,
      timestamp: Date.now()
    }, ...transacoes]);
    setDescMovCaixa(''); setValorMovCaixa(''); setMostrarModalCaixa(false);
  };

  const adicionarBoleto = (e) => {
    e.preventDefault();
    const val = parseFloat(valorBoleto);
    if (isNaN(val) || val <= 0 || !descBoleto.trim() || !vencBoleto) return;
    setContasPagar([{ id: Date.now(), desc: descBoleto, valor: val, vencimento: vencBoleto, status: 'pendente' }, ...contasPagar]);
    setDescBoleto(''); setValorBoleto(''); setVencBoleto(''); setMostrarModalBoleto(false);
  };

  const pagarBoleto = (id) => {
    const boleto = contasPagar.find(b => b.id === id);
    if (!boleto || boleto.status === 'pago') return;
    setContasPagar(contasPagar.map(b => b.id === id ? { ...b, status: 'pago' } : b));
    setTransacoes([{
      id: Date.now(),
      tipo: 'saida',
      desc: `Pagto Boleto/Conta: ${boleto.desc}`,
      valor: boleto.valor,
      forma: 'Caixa',
      data: hojeStr,
      timestamp: Date.now()
    }, ...transacoes]);
  };

  const exportarCSV = () => {
    let csv = 'ID,Tipo,Descricao,Valor,CustoInsumo,Forma,Data\n';
    transacoes.forEach(t => {
      csv += `${t.id},${t.tipo},"${t.desc}",${t.valor},${t.custoInsumo || 0},${t.forma},${t.data}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_chaveiro_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const chaveAtualObj = estoque.find(i => i.id === chaveSelecionadaId) || estoque[0];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans pb-24">
      
      {/* HEADER */}
      <header className="bg-slate-800 border-b border-slate-700 p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl font-bold tracking-wide text-white">Chaveiro<span className="text-amber-500">PRO</span></h1>
          </div>
          <button 
            onClick={() => setAbaAtiva('caixa')}
            className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-full text-amber-400 font-bold flex items-center gap-1 transition"
          >
            <DollarSign className="w-3.5 h-3.5" /> R$ {saldoCaixa.toFixed(2)}
          </button>
        </div>
      </header>

      <main className="max-w-md w-full mx-auto p-4 flex-1">

        {/* ==================== ABA 1: INÍCIO ==================== */}
        {abaAtiva === 'inicio' && (
          <div className="space-y-4">
            {/* Cartão Financeiro + Lucro Real */}
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-5 rounded-2xl shadow-lg text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-amber-100 text-xs font-medium uppercase tracking-wider">Saldo em Caixa</p>
                  <h2 className="text-3xl font-extrabold mt-0.5">R$ {saldoCaixa.toFixed(2)}</h2>
                </div>
                <button 
                  onClick={() => setAbaAtiva('caixa')}
                  className="bg-slate-900/30 hover:bg-slate-900/50 text-xs px-2.5 py-1 rounded-lg font-semibold"
                >
                  Ver Caixa & Boletos
                </button>
              </div>
              <div className="mt-4 pt-3 border-t border-amber-500/50 grid grid-cols-3 gap-2 text-[11px] text-amber-100">
                <div>Entradas:<br/><strong className="text-white">R$ {totalEntradas.toFixed(2)}</strong></div>
                <div>Saídas:<br/><strong className="text-white">R$ {totalSaidas.toFixed(2)}</strong></div>
                <div>Lucro Líquido:<br/><strong className="text-emerald-200">R$ {lucroLiquidoReal.toFixed(2)}</strong></div>
              </div>
            </div>

            {/* Painel de Meta Diária */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-amber-400" /> Meta Diária de Faturamento
                </span>
                <button 
                  onClick={() => setEditandoMeta(!editandoMeta)} 
                  className="text-[11px] text-amber-400 hover:underline"
                >
                  {editandoMeta ? 'Fechar' : `Meta: R$ ${metaDiaria.toFixed(2)}`}
                </button>
              </div>

              {editandoMeta && (
                <div className="flex gap-2 pt-1">
                  <input 
                    type="number" 
                    value={novaMetaInput} 
                    onChange={(e) => setNovaMetaInput(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white flex-1"
                  />
                  <button 
                    onClick={() => { setMetaDiaria(parseFloat(novaMetaInput) || 100); setEditandoMeta(false); }}
                    className="bg-amber-500 text-slate-950 font-bold px-3 rounded-lg text-xs"
                  >
                    Salvar
                  </button>
                </div>
              )}

              <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-300" 
                  style={{ width: `${progressoMeta}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Faturado hoje: <strong className="text-white">R$ {entradasHoje.toFixed(2)}</strong></span>
                <span className="text-amber-400 font-bold">{progressoMeta}% atingido</span>
              </div>
            </div>

            {/* Resumo Rápido de OS e Agenda */}
            <div className="grid grid-cols-2 gap-3">
              <div 
                onClick={() => { setAbaAtiva('servicos'); setSubAbaServicos('os'); }}
                className="bg-slate-800 border border-slate-700 p-3.5 rounded-2xl cursor-pointer hover:border-amber-500/50 transition"
              >
                <div className="flex justify-between items-center text-amber-400 mb-1">
                  <ClipboardList className="w-4 h-4" />
                  <span className="text-xs font-bold">{ordensServico.filter(o => o.status !== 'concluida').length} abertas</span>
                </div>
                <p className="text-xs font-bold text-white">Ordens de Serviço</p>
                <p className="text-[10px] text-slate-400">Bancada e codificação</p>
              </div>

              <div 
                onClick={() => setAbaAtiva('agenda')}
                className="bg-slate-800 border border-slate-700 p-3.5 rounded-2xl cursor-pointer hover:border-amber-500/50 transition"
              >
                <div className="flex justify-between items-center text-emerald-400 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-bold">{agendamentos.filter(a => a.status === 'agendado').length} visitas</span>
                </div>
                <p className="text-xs font-bold text-white">Agenda de Socorros</p>
                <p className="text-[10px] text-slate-400">Atendimentos na rua</p>
              </div>
            </div>

            {/* Alertas de Estoque Baixo + Consumo */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> Reposição de Estoque Crítico
                </h3>
                <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300">
                  {estoque.filter(i => i.qtd <= i.minimo).length} alertas
                </span>
              </div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {estoque.filter(i => i.qtd <= i.minimo).length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-2">Estoque em dia! Nenhuma chave em nível crítico.</p>
                ) : (
                  estoque.filter(i => i.qtd <= i.minimo).map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-slate-900/60 p-2 rounded-xl text-xs">
                      <span className="font-medium text-slate-200">{item.nome}</span>
                      <span className="bg-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded">
                        Restam: {item.qtd}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {ultimoComprovante && (
              <div className="bg-slate-800 border border-amber-500/40 rounded-2xl p-4 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-amber-400 font-bold uppercase flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Último Recibo Gerado
                  </span>
                  <span className="text-xs text-slate-400">{ultimoComprovante.data}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl text-xs space-y-1">
                  <p className="font-medium text-white">{ultimoComprovante.desc}</p>
                  <p className="text-amber-400 font-bold text-sm">R$ {ultimoComprovante.valor.toFixed(2)} ({ultimoComprovante.forma})</p>
                </div>
                <button
                  onClick={() => {
                    const texto = `*RECIBO DE ATENDIMENTO - CHAVEIRO PRO*\n\nServiço: ${ultimoComprovante.desc}\nValor Total: R$ ${ultimoComprovante.valor.toFixed(2)}\nPagamento: ${ultimoComprovante.forma}\nData: ${ultimoComprovante.data}\n\nObrigado pela preferência!`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition"
                >
                  <Share2 className="w-4 h-4" /> Enviar Recibo no WhatsApp
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================== ABA 2: PDV & ORDENS DE SERVIÇO ==================== */}
        {abaAtiva === 'servicos' && (
          <div className="space-y-4">
            <div className="flex gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setSubAbaServicos('pdv')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${subAbaServicos === 'pdv' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                Novo Atendimento (PDV)
              </button>
              <button
                onClick={() => setSubAbaServicos('os')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${subAbaServicos === 'os' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                Ordens de Serviço ({ordensServico.filter(o => o.status !== 'concluida').length})
              </button>
            </div>

            {subAbaServicos === 'pdv' ? (
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-sm">
                <div className="flex gap-2 mb-4 bg-slate-900 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setServicoTipo('copia')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${servicoTipo === 'copia' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400'}`}
                  >
                    Cópia de Chave
                  </button>
                  <button
                    type="button"
                    onClick={() => setServicoTipo('outro')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${servicoTipo === 'outro' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400'}`}
                  >
                    Abertura / Serviço Geral
                  </button>
                </div>

                <form onSubmit={registrarServico} className="space-y-3">
                  {servicoTipo === 'copia' ? (
                    <>
                      <div className="relative">
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Linha Digitável / Buscar Chave no Catálogo
                        </label>
                        <div className="relative">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            placeholder="Digite código ou modelo (ex: 580, Stam, Palio)..."
                            value={termoBuscaChave}
                            onChange={(e) => { setTermoBuscaChave(e.target.value); setMostrarDropdownChaves(true); }}
                            onFocus={() => setMostrarDropdownChaves(true)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-8 py-2.5 text-xs text-white focus:border-amber-500 outline-none"
                          />
                          {termoBuscaChave && (
                            <button type="button" onClick={() => setTermoBuscaChave('')} className="absolute right-3 top-3 text-slate-400">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {mostrarDropdownChaves && (
                          <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                            {estoque
                              .filter(item => item.nome.toLowerCase().includes(termoBuscaChave.toLowerCase()) || item.id.includes(termoBuscaChave) || item.cat.toLowerCase().includes(termoBuscaChave.toLowerCase()))
                              .map(item => (
                                <div
                                  key={item.id}
                                  onClick={() => {
                                    setChaveSelecionadaId(item.id);
                                    setTermoBuscaChave(item.nome);
                                    setValorServico((item.venda * qtdCopias).toFixed(2));
                                    setMostrarDropdownChaves(false);
                                  }}
                                  className="p-2.5 text-xs hover:bg-slate-800 cursor-pointer flex justify-between items-center border-b border-slate-800"
                                >
                                  <div>
                                    <span className="font-medium text-white">{item.nome}</span>
                                    <span className="ml-2 text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">{item.cat}</span>
                                  </div>
                                  <span className="text-[10px] text-amber-400 font-bold">Estoque: {item.qtd}</span>
                                </div>
                              ))}
                          </div>
                        )}
                        <p className="text-[10px] text-slate-400 mt-1">
                          Selecionada: <strong className="text-amber-400">{chaveAtualObj.nome}</strong> (Custo: R$ {(chaveAtualObj.custo || 2.5).toFixed(2)} | Est: {chaveAtualObj.qtd})
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">Quantidade</label>
                          <input
                            type="number"
                            min="1"
                            value={qtdCopias}
                            onChange={(e) => {
                              const q = parseInt(e.target.value) || 1;
                              setQtdCopias(q);
                              setValorServico(((chaveAtualObj.venda || 10) * q).toFixed(2));
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">Numeração da Chave</label>
                          <input
                            type="text"
                            placeholder="Ex: 01, Segredo 4521..."
                            value={numChaveRegistro}
                            onChange={(e) => setNumChaveRegistro(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Nome do Serviço</label>
                        <input
                          type="text"
                          placeholder="Ex: Abertura Automotiva, Instalação Fechadura..."
                          value={nomeServico}
                          onChange={(e) => setNomeServico(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Descrição / Material Utilizado</label>
                        <input
                          type="text"
                          placeholder="Ex: Cilindro Stam + Mão de obra"
                          value={descServico}
                          onChange={(e) => setDescServico(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                        />
                      </div>
                    </>
                  )}

                  {/* Campos Avançados: Transponder e Taxa de Deslocamento */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5 text-amber-400" /> Chip / Transponder
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: T19, ID48, PCF7936..."
                        value={chipTransponder}
                        onChange={(e) => setChipTransponder(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Taxa Deslocamento (R$)
                      </label>
                      <input
                        type="number"
                        step="1.00"
                        placeholder="0.00"
                        value={taxaDeslocamentoPDV}
                        onChange={(e) => setTaxaDeslocamentoPDV(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-emerald-400 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Valor do Serviço (R$)</label>
                      <input
                        type="number"
                        step="0.50"
                        placeholder="0.00"
                        value={valorServico}
                        onChange={(e) => setValorServico(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-amber-400 font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Pagamento</label>
                      <select
                        value={formaPagto}
                        onChange={(e) => setFormaPagto(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                      >
                        <option value="Pix">Pix</option>
                        <option value="Dinheiro">Dinheiro</option>
                        <option value="Cartão Débito">Cartão Débito</option>
                        <option value="Cartão Crédito">Cartão Crédito</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Cliente (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Nome do cliente ou condomínio..."
                      value={clientePDV}
                      onChange={(e) => setClientePDV(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-xs text-slate-300 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={salvarComoOS}
                      onChange={(e) => setSalvarComoOS(e.target.checked)}
                      className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                    />
                    Salvar como <strong>Ordem de Serviço (OS) em andamento</strong> (receber depois)
                  </label>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-xl text-xs transition shadow flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" /> {salvarComoOS ? 'Abrir Ordem de Serviço' : 'Concluir e Dar Baixa'}
                    </button>
                    <button
                      type="button"
                      onClick={registrarPerda}
                      title="Registrar chave quebrada na máquina"
                      className="bg-slate-700 hover:bg-red-500/20 hover:text-red-400 text-slate-300 px-3 rounded-xl text-xs transition flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* LISTA DE ORDENS DE SERVIÇO (OS) */
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-sm space-y-3">
                <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-amber-400" /> Controle de Ordens de Serviço (OS)
                </h2>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                  {ordensServico.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">Nenhuma OS registrada.</p>
                  ) : (
                    ordensServico.map(os => (
                      <div key={os.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-amber-400">OS #{os.id} • {os.cliente}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${os.status === 'concluida' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {os.status === 'concluida' ? 'Concluída' : 'Em Andamento'}
                          </span>
                        </div>
                        <p className="text-slate-300">{os.desc}</p>
                        <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                          <span className="font-bold text-white text-sm">R$ {os.valor.toFixed(2)}</span>
                          <div className="flex gap-2">
                            {os.status !== 'concluida' && (
                              <button
                                onClick={() => concluirOS(os)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg font-bold text-[11px]"
                              >
                                Receber & Dar Baixa
                              </button>
                            )}
                            <button
                              onClick={() => setOrdensServico(ordensServico.filter(i => i.id !== os.id))}
                              className="text-slate-500 hover:text-red-400 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== ABA 3: AGENDA DE SOCORROS ==================== */}
        {abaAtiva === 'agenda' && (
          <div className="space-y-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" /> Agenda de Socorros & Visitas
                </h2>
                <button
                  onClick={() => setMostrarModalAgenda(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Agendar Visita
                </button>
              </div>

              {mostrarModalAgenda && (
                <form onSubmit={salvarAgendamento} className="bg-slate-900 p-3 rounded-xl border border-slate-700 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-amber-400">Novo Chamado Externo</span>
                    <button type="button" onClick={() => setMostrarModalAgenda(false)}><X className="w-4 h-4 text-slate-400" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Nome do Cliente" value={agCliente} onChange={e => setAgCliente(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white" required />
                    <input type="text" placeholder="WhatsApp (ex: 2199999...)" value={agTel} onChange={e => setAgTel(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white" />
                  </div>
                  <input type="text" placeholder="Endereço e Bairro (ex: Rua X, Campo Grande)" value={agEndereco} onChange={e => setAgEndereco(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white" required />
                  <input type="text" placeholder="Serviço (ex: Abertura de Porta / Carro)" value={agServico} onChange={e => setAgServico(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white" required />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" value={agData} onChange={e => setAgData(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white" />
                    <input type="time" value={agHora} onChange={e => setAgHora(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" step="1" placeholder="Taxa Desloc. (R$)" value={agTaxa} onChange={e => setAgTaxa(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-emerald-400" />
                    <input type="number" step="1" placeholder="Valor Serviço (R$)" value={agValor} onChange={e => setAgValor(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-amber-400 font-bold" />
                  </div>
                  <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-lg text-xs font-bold">Confirmar Agendamento</button>
                </form>
              )}

              <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                {agendamentos.map(ag => (
                  <div key={ag.id} className={`p-3 rounded-xl border text-xs space-y-1.5 ${ag.status === 'concluido' ? 'bg-slate-900/40 border-slate-800 opacity-60' : 'bg-slate-900 border-slate-700'}`}>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white text-sm">{ag.cliente}</span>
                      <span className="text-[11px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-bold">
                        {ag.data} às {ag.hora}
                      </span>
                    </div>
                    <p className="text-slate-300 font-medium">{ag.servico}</p>
                    <p className="text-slate-400 text-[11px] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" /> {ag.endereco}
                    </p>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                      <div>
                        <span className="text-amber-400 font-bold">Total: R$ {((ag.valorEstimado || 0) + (ag.taxaDeslocamento || 0)).toFixed(2)}</span>
                        {ag.taxaDeslocamento > 0 && <span className="text-[10px] text-slate-400 ml-1">(Desloc: R$ {ag.taxaDeslocamento})</span>}
                      </div>
                      <div className="flex gap-1.5">
                        {ag.tel && (
                          <button
                            onClick={() => window.open(`https://wa.me/55${ag.tel.replace(/\D/g, '')}`, '_blank')}
                            className="bg-slate-800 hover:bg-slate-700 text-emerald-400 p-1.5 rounded-lg"
                            title="Chamar no WhatsApp"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {ag.status === 'agendado' && (
                          <button
                            onClick={() => concluirAgendamento(ag)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-bold text-[11px]"
                          >
                            Concluir
                          </button>
                        )}
                        <button
                          onClick={() => setAgendamentos(agendamentos.filter(item => item.id !== ag.id))}
                          className="text-slate-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== ABA 4: CLIENTES & ORÇAMENTOS ==================== */}
        {abaAtiva === 'clientes' && (
          <div className="space-y-4">
            <div className="flex gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setSubAbaClientes('lista')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${subAbaClientes === 'lista' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
              >
                Ficha de Clientes
              </button>
              <button
                onClick={() => setSubAbaClientes('orcamento')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${subAbaClientes === 'orcamento' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
              >
                Gerador de Orçamentos
              </button>
            </div>

            {subAbaClientes === 'lista' ? (
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-400" /> Clientes Cadastrados
                  </h2>
                  <button
                    onClick={() => setMostrarModalCliente(true)}
                    className="bg-amber-500 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Novo Cliente
                  </button>
                </div>

                {mostrarModalCliente && (
                  <form onSubmit={salvarCliente} className="bg-slate-900 p-3 rounded-xl border border-slate-700 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-amber-400">Cadastrar Cliente</span>
                      <button type="button" onClick={() => setMostrarModalCliente(false)}><X className="w-4 h-4 text-slate-400" /></button>
                    </div>
                    <input type="text" placeholder="Nome / Condomínio / Imobiliária" value={cliNome} onChange={e => setCliNome(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white" required />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="WhatsApp" value={cliTel} onChange={e => setCliTel(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white" />
                      <select value={cliTipo} onChange={e => setCliTipo(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white">
                        <option value="Particular">Particular</option>
                        <option value="Condomínio">Condomínio</option>
                        <option value="Imobiliária">Imobiliária</option>
                        <option value="Empresa">Empresa / Oficina</option>
                      </select>
                    </div>
                    <input type="text" placeholder="Endereço completo" value={cliEnd} onChange={e => setCliEnd(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white" />
                    <input type="text" placeholder="Observações (ex: Modelo de fechadura padrão)" value={cliObs} onChange={e => setCliObs(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white" />
                    <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-lg text-xs font-bold">Salvar Cliente</button>
                  </form>
                )}

                <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
                  {clientes.map(c => (
                    <div key={c.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">{c.nome}</span>
                        <span className="text-[10px] bg-slate-800 text-amber-400 px-2 py-0.5 rounded">{c.tipo}</span>
                      </div>
                      {c.endereco && <p className="text-slate-400 text-[11px]">{c.endereco}</p>}
                      {c.obs && <p className="text-slate-500 text-[11px] italic">{c.obs}</p>}
                      <div className="flex justify-between items-center pt-1.5">
                        <span className="text-slate-400 text-[11px]">{c.tel}</span>
                        <div className="flex gap-2">
                          {c.tel && (
                            <button
                              onClick={() => window.open(`https://wa.me/55${c.tel.replace(/\D/g, '')}`, '_blank')}
                              className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px] font-bold"
                            >
                              <Phone className="w-3 h-3" /> WhatsApp
                            </button>
                          )}
                          <button onClick={() => setClientes(clientes.filter(item => item.id !== c.id))} className="text-slate-600 hover:text-red-400">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* GERADOR DE ORÇAMENTOS PRÉVIOS */
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-sm space-y-3">
                <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" /> Montar Orçamento Prévio
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Nome do Cliente" value={orcCliente} onChange={e => setOrcCliente(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white" />
                  <input type="text" placeholder="WhatsApp do Cliente" value={orcTel} onChange={e => setOrcTel(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white" />
                </div>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-300">Adicionar Item ao Orçamento</span>
                  <input type="text" placeholder="Descrição (ex: Fechadura Tetra Stam + Instalação)" value={orcItemDesc} onChange={e => setOrcItemDesc(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white" />
                  <div className="flex gap-2">
                    <input type="number" min="1" placeholder="Qtd" value={orcItemQtd} onChange={e => setOrcItemQtd(e.target.value)} className="w-20 bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white" />
                    <input type="number" step="1" placeholder="Valor Unit. (R$)" value={orcItemVal} onChange={e => setOrcItemVal(e.target.value)} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-amber-400 font-bold" />
                    <button type="button" onClick={adicionarItemOrcamento} className="bg-amber-500 text-slate-950 px-3 rounded-lg text-xs font-bold">+</button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {orcItens.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-900/70 p-2 rounded-lg text-xs">
                      <span>{item.qtd}x {item.desc}</span>
                      <div className="flex items-center gap-2">
                        <strong className="text-amber-400">R$ {(item.qtd * item.valor).toFixed(2)}</strong>
                        <button onClick={() => setOrcItens(orcItens.filter((_, i) => i !== idx))} className="text-slate-500 hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                  <span className="text-xs text-slate-300">Taxa de Deslocamento (R$):</span>
                  <input type="number" placeholder="0.00" value={orcDeslocamento} onChange={e => setOrcDeslocamento(e.target.value)} className="w-28 bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-right text-emerald-400 font-bold" />
                </div>

                <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl">
                  <span className="text-xs font-bold text-slate-300">Total do Orçamento:</span>
                  <span className="text-lg font-extrabold text-amber-400">
                    R$ {(orcItens.reduce((acc, i) => acc + (i.qtd * i.valor), 0) + (parseFloat(orcDeslocamento) || 0)).toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={enviarOrcamentoWhatsApp}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition"
                >
                  <Share2 className="w-4 h-4" /> Enviar Orçamento via WhatsApp
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================== ABA 5: ESTOQUE ==================== */}
        {abaAtiva === 'estoque' && (
          <div className="space-y-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-400" /> Catálogo & Estoque ({estoque.length})
                </h2>
                <button
                  onClick={() => setMostrarModalNovoItem(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition shadow"
                >
                  <Plus className="w-3.5 h-3.5" /> Novo Item
                </button>
              </div>

              {mostrarModalNovoItem && (
                <form onSubmit={cadastrarNovoItemEstoque} className="bg-slate-900 p-3 rounded-xl border border-slate-700 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-amber-400">Criar Chave / Insumo Customizado</span>
                    <button type="button" onClick={() => setMostrarModalNovoItem(false)}><X className="w-4 h-4 text-slate-400" /></button>
                  </div>
                  <input type="text" placeholder="Nome / Código da Chave" value={novoNomeItem} onChange={e => setNovoNomeItem(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white" required />
                  <div className="grid grid-cols-2 gap-2">
                    <select value={novaCatItem} onChange={e => setNovaCatItem(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white">
                      <option value="Plana">Plana</option>
                      <option value="Tetra">Tetra</option>
                      <option value="Pantográfica">Pantográfica</option>
                      <option value="Automotiva">Automotiva</option>
                      <option value="Cadeado">Cadeado</option>
                      <option value="Transponder/Chip">Transponder / Chip</option>
                    </select>
                    <input type="number" min="1" placeholder="Qtd Inicial" value={novaQtdItem} onChange={e => setNovaQtdItem(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" step="0.50" placeholder="Custo Unit. (R$)" value={novoCustoItem} onChange={e => setNovoCustoItem(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white" />
                    <input type="number" step="0.50" placeholder="Venda Sugerida (R$)" value={novoVendaItem} onChange={e => setNovoVendaItem(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-amber-400 font-bold" />
                  </div>
                  <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-lg text-xs font-bold">Salvar no Estoque</button>
                </form>
              )}

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
                  <input
                    type="text"
                    placeholder="Filtrar por nome, número ou categoria..."
                    value={filtroEstoque}
                    onChange={(e) => setFiltroEstoque(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:border-amber-500 outline-none"
                  />
                </div>
                <button
                  onClick={() => setFiltroApenasBaixo(!filtroApenasBaixo)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${filtroApenasBaixo ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-slate-900 text-slate-300 border-slate-700'}`}
                >
                  Baixo
                </button>
              </div>

              <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
                {estoque
                  .filter(item => {
                    const matchNome = item.nome.toLowerCase().includes(filtroEstoque.toLowerCase()) || item.id.includes(filtroEstoque) || item.cat.toLowerCase().includes(filtroEstoque.toLowerCase());
                    const matchBaixo = filtroApenasBaixo ? item.qtd <= item.minimo : true;
                    return matchNome && matchBaixo;
                  })
                  .map(item => (
                    <div key={item.id} className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{item.nome}</span>
                          <span className="text-[10px] bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded">{item.cat}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Estoque: <strong className={item.qtd <= item.minimo ? 'text-red-400 font-bold' : 'text-emerald-400'}>{item.qtd} un</strong>
                          <span className="ml-2 text-slate-500">• Custo: R$ {(item.custo || 2.5).toFixed(2)}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button onClick={() => alterarQtdEstoque(item.id, -1)} className="bg-slate-800 hover:bg-slate-700 text-slate-200 w-8 h-8 rounded-lg flex items-center justify-center">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold">{item.qtd}</span>
                        <button onClick={() => alterarQtdEstoque(item.id, 1)} className="bg-slate-800 hover:bg-slate-700 text-slate-200 w-8 h-8 rounded-lg flex items-center justify-center">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== ABA 6: CAIXA, BOLETOS E RELATÓRIOS ==================== */}
        {abaAtiva === 'caixa' && (
          <div className="space-y-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex gap-1.5 bg-slate-900 p-1 rounded-xl">
                <button
                  onClick={() => setSubAbaCaixa('extrato')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${subAbaCaixa === 'extrato' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
                >
                  Extrato
                </button>
                <button
                  onClick={() => setSubAbaCaixa('boletos')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${subAbaCaixa === 'boletos' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
                >
                  Boletos ({contasPagar.filter(b => b.status === 'pendente').length})
                </button>
                <button
                  onClick={() => setSubAbaCaixa('lucro')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${subAbaCaixa === 'lucro' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
                >
                  Lucro & Consumo
                </button>
              </div>

              {subAbaCaixa === 'extrato' && (
                <>
                  <div className="flex items-center justify-between pt-1">
                    <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-amber-400" /> Fluxo de Caixa
                    </h2>
                    <div className="flex gap-1.5">
                      <button onClick={() => setMostrarModalCaixa(true)} className="bg-amber-500 text-slate-950 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1">
                        <Edit3 className="w-3.5 h-3.5" /> Lançar
                      </button>
                      <button onClick={exportarCSV} className="bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1">
                        <Download className="w-3.5 h-3.5" /> CSV
                      </button>
                    </div>
                  </div>

                  {mostrarModalCaixa && (
                    <form onSubmit={adicionarMovimentoCaixa} className="bg-slate-900 p-3 rounded-xl border border-slate-700 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-amber-400">Lançamento Manual</span>
                        <button type="button" onClick={() => setMostrarModalCaixa(false)}><X className="w-4 h-4 text-slate-400" /></button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <select value={tipoMovCaixa} onChange={e => setTipoMovCaixa(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white">
                          <option value="entrada">Entrada (Receita)</option>
                          <option value="saida">Saída (Despesa)</option>
                        </select>
                        <select value={formaMovCaixa} onChange={e => setFormaMovCaixa(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white">
                          <option value="Dinheiro">Dinheiro</option>
                          <option value="Pix">Pix</option>
                          <option value="Cartão">Cartão</option>
                        </select>
                      </div>
                      <input type="text" placeholder="Descrição" value={descMovCaixa} onChange={e => setDescMovCaixa(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white" required />
                      <div className="flex gap-2">
                        <input type="number" step="0.50" placeholder="Valor (R$)" value={valorMovCaixa} onChange={e => setValorMovCaixa(e.target.value)} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-amber-400 font-bold" required />
                        <button type="submit" className="bg-emerald-600 text-white px-4 rounded-lg text-xs font-bold">Salvar</button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-4 max-h-[52vh] overflow-y-auto pr-1">
                    <div>
                      <h3 className="text-xs font-bold text-amber-400 uppercase mb-2 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Hoje ({hojeStr})
                      </h3>
                      <div className="space-y-2">
                        {transacoesHoje.map(t => (
                          <div key={t.id} className="bg-slate-900 p-2.5 rounded-xl flex items-center justify-between text-xs border border-slate-800">
                            <div>
                              <p className="font-semibold text-white">{t.desc}</p>
                              <p className="text-[10px] text-slate-400">{t.forma}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`font-bold ${t.tipo === 'entrada' ? 'text-emerald-400' : 'text-red-400'}`}>
                                {t.tipo === 'entrada' ? '+' : '-'} R$ {t.valor.toFixed(2)}
                              </span>
                              <button onClick={() => setTransacoes(transacoes.filter(i => i.id !== t.id))} className="text-slate-600 hover:text-red-400">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {transacoesOutros.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Dias e Meses Anteriores
                        </h3>
                        <div className="space-y-2">
                          {transacoesOutros.map(t => (
                            <div key={t.id} className="bg-slate-900/70 p-2.5 rounded-xl flex items-center justify-between text-xs border border-slate-800/40">
                              <div>
                                <p className="font-semibold text-slate-200">{t.desc}</p>
                                <p className="text-[10px] text-slate-500">{t.data} • {t.forma}</p>
                              </div>
                              <span className={`font-bold ${t.tipo === 'entrada' ? 'text-emerald-400' : 'text-red-400'}`}>
                                {t.tipo === 'entrada' ? '+' : '-'} R$ {t.valor.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {subAbaCaixa === 'boletos' && (
                <>
                  <div className="flex items-center justify-between pt-1">
                    <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-amber-400" /> Contas e Boletos a Pagar
                    </h2>
                    <button onClick={() => setMostrarModalBoleto(true)} className="bg-amber-500 text-slate-950 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" /> Novo Boleto
                    </button>
                  </div>

                  {mostrarModalBoleto && (
                    <form onSubmit={adicionarBoleto} className="bg-slate-900 p-3 rounded-xl border border-slate-700 space-y-2">
                      <input type="text" placeholder="Fornecedor / Conta" value={descBoleto} onChange={e => setDescBoleto(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white" required />
                      <div className="grid grid-cols-2 gap-2">
                        <input type="number" step="0.50" placeholder="Valor (R$)" value={valorBoleto} onChange={e => setValorBoleto(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-amber-400 font-bold" required />
                        <input type="date" value={vencBoleto} onChange={e => setVencBoleto(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white" required />
                      </div>
                      <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-lg text-xs font-bold">Registrar Boleto</button>
                    </form>
                  )}

                  <div className="space-y-2 max-h-[52vh] overflow-y-auto pr-1">
                    {contasPagar.map(b => (
                      <div key={b.id} className={`p-3 rounded-xl flex items-center justify-between text-xs border ${b.status === 'pago' ? 'bg-slate-900/40 border-slate-800 opacity-60' : 'bg-slate-900 border-slate-700'}`}>
                        <div>
                          <p className={`font-semibold ${b.status === 'pago' ? 'line-through text-slate-400' : 'text-white'}`}>{b.desc}</p>
                          <p className="text-[10px] text-slate-400">Vence em: {b.vencimento}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-400">R$ {b.valor.toFixed(2)}</span>
                          {b.status === 'pendente' ? (
                            <button onClick={() => pagarBoleto(b.id)} className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold">Dar Baixa</button>
                          ) : (
                            <span className="text-[10px] text-emerald-400 font-bold">Pago</span>
                          )}
                          <button onClick={() => setContasPagar(contasPagar.filter(i => i.id !== b.id))} className="text-slate-600 hover:text-red-400">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {subAbaCaixa === 'lucro' && (
                <div className="space-y-4 pt-1">
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <h3 className="font-bold text-amber-400 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" /> Demonstrativo de Lucratividade Real
                    </h3>
                    <div className="flex justify-between text-slate-300">
                      <span>Receita Bruta Total:</span>
                      <strong className="text-emerald-400">+ R$ {totalEntradas.toFixed(2)}</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Custo de Chaves/Insumos Usados:</span>
                      <strong className="text-amber-400">- R$ {custoInsumosTotal.toFixed(2)}</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Saídas / Despesas / Perdas:</span>
                      <strong className="text-red-400">- R$ {totalSaidas.toFixed(2)}</strong>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-800 text-sm">
                      <span className="font-bold text-white">Lucro Líquido Real:</span>
                      <strong className="text-emerald-400">R$ {lucroLiquidoReal.toFixed(2)}</strong>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <h3 className="font-bold text-slate-200">Chaves Mais Vendidas (Giro de Estoque)</h3>
                    {rankingConsumo.map(item => (
                      <div key={item.id} className="flex justify-between items-center py-1 border-b border-slate-800/60 last:border-0">
                        <span className="text-slate-300">{item.nome}</span>
                        <span className="text-amber-400 font-bold">{item.vendasTotal || 0} saídas</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* NAVBAR INFERIOR COM 5 ABAS */}
      <nav className="bg-slate-800 border-t border-slate-700 fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-md mx-auto flex justify-around p-1.5">
          <button
            onClick={() => setAbaAtiva('inicio')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[11px] transition ${abaAtiva === 'inicio' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
          >
            <Wrench className="w-5 h-5" /> Início
          </button>
          <button
            onClick={() => setAbaAtiva('servicos')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[11px] transition ${abaAtiva === 'servicos' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
          >
            <FileText className="w-5 h-5" /> PDV / OS
          </button>
          <button
            onClick={() => setAbaAtiva('agenda')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[11px] transition ${abaAtiva === 'agenda' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
          >
            <MapPin className="w-5 h-5" /> Agenda
          </button>
          <button
            onClick={() => setAbaAtiva('clientes')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[11px] transition ${abaAtiva === 'clientes' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
          >
            <Users className="w-5 h-5" /> Clientes
          </button>
          <button
            onClick={() => setAbaAtiva('estoque')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[11px] transition ${abaAtiva === 'estoque' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
          >
            <Package className="w-5 h-5" /> Estoque
          </button>
        </div>
      </nav>

    </div>
  );
}