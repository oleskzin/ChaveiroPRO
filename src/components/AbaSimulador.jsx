import React from 'react';
import {
  Calculator,
  CreditCard,
  Share2,
  FolderClock,
  Plus,
  X,
  Edit2,
  Trash2
} from 'lucide-react';
import ClienteAutocomplete from './ClienteAutocomplete';

export default function AbaSimulador({
  temaUnidade,
  clientes,
  mostrarToast,
  listaServicosBase,
  calcServicoId,
  setCalcServicoId,
  listaPecasTabela,
  calcPecaId,
  setCalcPecaId,
  estoqueUnidade,
  calcEstoqueId,
  setCalcEstoqueId,
  calcValorExtraManual,
  setCalcValorExtraManual,
  listaAdicionais,
  calcAdicionaisIds,
  setCalcAdicionaisIds,
  calcRepassarTaxa,
  setCalcRepassarTaxa,
  calcTaxaId,
  setCalcTaxaId,
  taxasCartaoDisponiveis,
  montarResumoSimulador,
  valorBaseCalc,
  valorAdicionaisCalc,
  subtotalSimulador,
  taxaSimuladorObj,
  totalFinalSimulador,
  calcCliente,
  setCalcCliente,
  salvarSimuladorEmStandby,
  enviarSimuladorParaPDV,
  enviarSimuladorParaOS,
  tabelaPrecos,
  formAberto,
  toggleForm,
  novoItemTabela,
  setNovoItemTabela,
  salvarItemTabelaPrecos,
  excluirItemTabelaPrecos
}) {
  return (
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
              <ClienteAutocomplete
                clientes={clientes}
                placeholder="Puxar cliente salvo para cotação..."
                onSelecionar={(c) => {
                  setCalcCliente({
                    nome: c.nome,
                    tel: c.tel || '',
                    endereco: c.endereco || ''
                  });
                  mostrarToast(`Cliente ${c.nome} carregado!`);
                }}
              />
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
            type="button"
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
                    <button type="button" onClick={() => setNovoItemTabela(item)} className="text-amber-400 p-1">
                      <Edit2 size={14} />
                    </button>
                    <button type="button" onClick={() => excluirItemTabelaPrecos(item.id)} className="text-red-400 p-1">
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
  );
}