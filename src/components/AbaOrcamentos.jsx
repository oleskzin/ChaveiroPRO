import React from 'react';
import {
  Plus,
  X,
  Trash2,
  FolderClock,
  Share2,
  Phone,
  MapPin,
  ShieldCheck,
  Edit2
} from 'lucide-react';
import ClienteAutocomplete from './ClienteAutocomplete';

export default function AbaOrcamentos({
  temaUnidade,
  infoUnidadeAtual,
  unidadeOperacional,
  clientes,
  mostrarToast,
  formAberto,
  toggleForm,
  orcamento,
  setOrcamento,
  adicionarLinhaOrcamento,
  removerLinhaOrcamento,
  atualizarItemOrcamento,
  totalOrcamento,
  salvarOrcamentoStandby,
  filtroStatusOrcamento,
  setFiltroStatusOrcamento,
  orcamentosEmStandby,
  orcamentosUnidade,
  aprovarOrcamentoVirarOS,
  dispararTextoOrcamentoWhatsApp,
  carregarOrcamentoParaEdicao,
  excluirOrcamentoSalvo
}) {
  const orcamentosFiltrados = orcamentosUnidade.filter((o) =>
    filtroStatusOrcamento === 'todos' ? true : o.status === filtroStatusOrcamento
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className={`font-bold text-base ${temaUnidade.textoDestaque}`}>
          Orçamentos em Standby — {infoUnidadeAtual.nome}
        </h2>
        <button
          type="button"
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
            <div className="flex flex-wrap items-center gap-2">
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
              <ClienteAutocomplete
                clientes={clientes}
                onSelecionar={(cli) => {
                  setOrcamento({
                    ...orcamento,
                    cliente: cli.nome,
                    tel: cli.tel || '',
                    endereco: cli.endereco || '',
                    tipo_cliente: cli.tipo || 'Residencial'
                  });
                  mostrarToast(`Cliente ${cli.nome} preenchido no Orçamento!`);
                }}
              />
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
                type="button"
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
          {orcamentosFiltrados.map((orc) => {
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
                        type="button"
                        onClick={() => aprovarOrcamentoVirarOS(orc)}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1"
                      >
                        <ShieldCheck size={13} /> Virar OS
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => dispararTextoOrcamentoWhatsApp({ ...orc, endereco: enderecoExibido })}
                      className="bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1"
                    >
                      <Share2 size={12} /> WhatsApp
                    </button>
                    <button type="button" onClick={() => carregarOrcamentoParaEdicao(orc)} className="bg-slate-800 text-amber-400 p-1.5 rounded-lg">
                      <Edit2 size={14} />
                    </button>
                    <button type="button" onClick={() => excluirOrcamentoSalvo(orc.id)} className="bg-slate-800 text-red-400 p-1.5 rounded-lg">
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
  );
}