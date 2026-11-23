import React from 'react';
import {
  ClipboardCheck,
  Receipt,
  ExternalLink,
  Download,
  Edit2,
  Plus,
  X,
  Check,
  Trash2
} from 'lucide-react';

export default function AbaCaixa({
  temaUnidade,
  unidadeAtiva,
  infoUnidadeAtual,
  fundoTrocoBase,
  filtroPeriodoCaixa,
  setFiltroPeriodoCaixa,
  totalAReceber,
  setModalFechamentoCaixa,
  abrirPortalNFSe,
  exportarCSVRelatorio,
  diferencaReposicaoTroco,
  saldoTrocoAtual,
  reporTrocoAutomatico,
  totalEntradas,
  totalSaidasFaturado,
  saldoOperacionalFaturado,
  lucroRealPeriodo,
  custoInsumosPeriodo,
  setModalConfigUnidades,
  totalGavetaFisica,
  entradasPix,
  liquidoDinheiroFaturado,
  entradasCartao,
  transacoesFiltradas,
  isMovimentacaoTroco,
  formAberto,
  toggleForm,
  novaTransacao,
  setNovaTransacao,
  adicionarTransacaoManual,
  transacaoEditando,
  setTransacaoEditando,
  salvarEdicaoTransacao,
  quitarPendenciaReceber,
  excluirTransacao,
  contasUnidade,
  novaConta,
  setNovaConta,
  criarContaPagar,
  darBaixaBoleto,
  reabrirBoleto,
  excluirContaPagar,
  hojeISO
}) {
  return (
    <div className="space-y-5">
      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'hoje', label: 'Hoje' },
            { id: '7dias', label: '7 Dias' },
            { id: 'mes', label: 'Mês Atual' },
            { id: 'troco', label: 'Só Caixa Troco' },
            { id: 'areceber', label: `Fiado (R$ ${totalAReceber.toFixed(0)})` },
            { id: 'todos', label: 'Tudo' }
          ].map((periodo) => (
            <button
              key={periodo.id}
              type="button"
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
            type="button"
            onClick={() => setModalFechamentoCaixa(true)}
            className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow"
          >
            <ClipboardCheck size={14} /> Fechar Caixa do Dia
          </button>
          <button
            type="button"
            onClick={() => abrirPortalNFSe()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5"
          >
            <Receipt size={14} /> NFS-e <ExternalLink size={11} />
          </button>
          <button
            type="button"
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
            <h3 className={`font-bold text-sm ${temaUnidade.textoDestaque}`}>
              Movimentações ({transacoesFiltradas.length}) — {infoUnidadeAtual.nome}
            </h3>
            <button
              type="button"
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
                          <button type="button" onClick={salvarEdicaoTransacao} className="bg-emerald-500 text-slate-950 font-bold px-3 py-2 rounded-lg flex items-center gap-1">
                            <Check size={14} /> Salvar
                          </button>
                          <button type="button" onClick={() => setTransacaoEditando(null)} className="bg-slate-800 text-slate-300 px-3 py-2 rounded-lg flex items-center gap-1">
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
                              type="button"
                              onClick={() => abrirPortalNFSe({ cliente: 'Cliente', desc: t.desc, valor: t.valor })}
                              className="bg-indigo-950 hover:bg-indigo-900 text-indigo-300 px-2 py-1.5 rounded-lg border border-indigo-800 flex items-center gap-1 text-[11px] font-semibold"
                              title="Copiar dados e abrir Portal NFS-e"
                            >
                              <Receipt size={12} /> NFS-e
                            </button>
                          )}
                          {t.forma === 'A Receber (Fiado)' && (
                            <button type="button" onClick={() => quitarPendenciaReceber(t)} className="bg-purple-600 hover:bg-purple-500 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold">
                              Receber
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setTransacaoEditando({
                              ...t,
                              origem_caixa: isMovimentacaoTroco(t) ? 'troco' : 'faturado'
                            })}
                            className="bg-slate-900 text-amber-400 p-1.5 rounded-lg border border-slate-800"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button type="button" onClick={() => excluirTransacao(t.id)} className="bg-slate-900 text-red-400 p-1.5 rounded-lg border border-slate-800">
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
              type="button"
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
                        <button type="button" onClick={() => darBaixaBoleto(c, false)} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-2.5 py-1.5 rounded-lg text-xs">
                          Só Marcar Pago (Sem Caixa)
                        </button>
                        <button type="button" onClick={() => darBaixaBoleto(c, true)} className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold px-2.5 py-1.5 rounded-lg text-xs border border-slate-700">
                          Pagar c/ Caixa
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => reabrirBoleto(c)} className="text-emerald-400 font-bold hover:underline">
                        Quitado na Agenda (Toque p/ reabrir)
                      </button>
                    )}
                    <button type="button" onClick={() => excluirContaPagar(c.id)} className="text-red-400 p-1">
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
  );
}