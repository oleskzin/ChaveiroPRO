import React, { useState } from 'react';
import {
  Plus,
  X,
  Send,
  MapPin,
  CheckCircle,
  Share2,
  Trash2,
  Search,
  Navigation,
  MessageCircle
} from 'lucide-react';
import ClienteAutocomplete from './ClienteAutocomplete';
import { montarURLWhatsAppSeguro } from '../utils/formatters';

export default function AbaSocorros({
  temaUnidade,
  infoUnidadeAtual,
  unidadeOperacional,
  clientes,
  mostrarToast,
  funcionarios,
  funcionarioPadraoUnidade,
  estoqueUnidade,
  socorrosPendentes,
  socorrosConcluidos,
  agendaUnidade,
  socorrosExibidos,
  filtroStatusAgenda,
  setFiltroStatusAgenda,
  formAberto,
  toggleForm,
  novoAgendamento,
  setNovoAgendamento,
  itemTempAg,
  setItemTempAg,
  adicionarMaterialNoSocorro,
  removerMaterialDoSocorro,
  criarAgendamento,
  enviarDiretoParaFuncionario,
  concluirAgendamento,
  setComprovanteAtivo,
  excluirAgendamento
}) {
  const [buscaSocorro, setBuscaSocorro] = useState('');

  const termoLimpo = buscaSocorro.trim().toLowerCase();
  const socorrosFiltradosBusca = termoLimpo
    ? socorrosExibidos.filter(
        (ag) =>
          (ag.cliente || '').toLowerCase().includes(termoLimpo) ||
          (ag.tel || '').includes(termoLimpo) ||
          (ag.endereco || '').toLowerCase().includes(termoLimpo) ||
          (ag.servico || '').toLowerCase().includes(termoLimpo)
      )
    : socorrosExibidos;

  const abrirNoMapa = (endereco) => {
    if (!endereco) return;
    const query = encodeURIComponent(`${endereco}, Rio de Janeiro - RJ`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const chamarClienteSocorroWhatsApp = (ag) => {
    const msg = `Olá ${ag.cliente || ''}! Aqui é do *Luisinho Chaveiro*. Sobre seu atendimento de socorro (${ag.servico}) no endereço ${ag.endereco}: `;
    const url = montarURLWhatsAppSeguro(ag.tel, msg);
    if (!url) {
      mostrarToast('Cliente sem WhatsApp válido neste socorro.', 'erro');
      return;
    }
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className={`font-bold text-base ${temaUnidade.textoDestaque}`}>
          Socorros Externos — {infoUnidadeAtual.nome} ({socorrosFiltradosBusca.length})
        </h2>
        <button
          type="button"
          onClick={() => toggleForm('agenda')}
          className={`${temaUnidade.botaoAtivo} font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow`}
        >
          {formAberto.agenda ? <><X size={16} /> Fechar Formulário</> : <><Plus size={16} /> Agendar Socorro</>}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'pendente', label: `Pendentes (${socorrosPendentes.length})` },
            { id: 'concluido', label: `Concluídos (${socorrosConcluidos.length})` },
            { id: 'todos', label: `Todos (${agendaUnidade.length})` }
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFiltroStatusAgenda(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                filtroStatusAgenda === f.id ? temaUnidade.botaoAtivo : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar socorro (cliente, rua, serviço)..."
            value={buscaSocorro}
            onChange={(e) => setBuscaSocorro(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-8 py-1.5 text-xs text-slate-200"
          />
          {buscaSocorro && (
            <button
              type="button"
              onClick={() => setBuscaSocorro('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {formAberto.agenda && (
        <form onSubmit={(e) => criarAgendamento(e, false)} className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-3 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase text-slate-400">Novo Atendimento Externo</span>
            <ClienteAutocomplete
              clientes={clientes}
              onSelecionar={(cli) => {
                setNovoAgendamento({
                  ...novoAgendamento,
                  cliente: cli.nome,
                  tel: cli.tel || '',
                  endereco: cli.endereco || novoAgendamento.endereco
                });
                mostrarToast(`Cliente ${cli.nome} preenchido no Socorro!`);
              }}
            />
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
        {socorrosFiltradosBusca.map((ag) => {
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
                  {ag.endereco && (
                    <button
                      type="button"
                      onClick={() => abrirNoMapa(ag.endereco)}
                      className="bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold px-2.5 py-2 rounded-lg flex items-center gap-1 border border-slate-700"
                      title="Abrir endereço no Google Maps"
                    >
                      <Navigation size={12} /> Maps
                    </button>
                  )}
                  {ag.tel && (
                    <button
                      type="button"
                      onClick={() => chamarClienteSocorroWhatsApp(ag)}
                      className="bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold px-2.5 py-2 rounded-lg flex items-center gap-1 border border-slate-700"
                      title="Chamar cliente no WhatsApp"
                    >
                      <MessageCircle size={12} /> Cliente
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => enviarDiretoParaFuncionario('socorro', ag)}
                    className="bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1"
                  >
                    <Send size={12} /> Enviar p/ {nomeFuncSoc || 'Funcionário'}
                  </button>
                  {ag.status !== 'concluido' ? (
                    <button
                      type="button"
                      onClick={() => concluirAgendamento(ag, 'Pix')}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1"
                    >
                      <CheckCircle size={14} /> Finalizar & Recibo
                    </button>
                  ) : (
                    <button
                      type="button"
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
                  <button type="button" onClick={() => excluirAgendamento(ag.id)} className="text-red-400 p-2">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}