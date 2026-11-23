import React from 'react';
import {
  Search,
  X,
  Check,
  Edit2,
  Trash2,
  ShoppingCart,
  CreditCard,
  ChevronUp
} from 'lucide-react';
import ClienteAutocomplete from './ClienteAutocomplete';

export default function AbaPDV({
  temaUnidade,
  infoUnidadeAtual,
  loading,
  clientes,
  mostrarToast,
  estoqueUnidade,
  buscaPdv,
  setBuscaPdv,
  inputBuscaPdvRef,
  adicionarAoCarrinho,
  listaServicosBase,
  gerenciandoServicosPdv,
  setGerenciandoServicosPdv,
  servicoRapidoForm,
  setServicoRapidoForm,
  salvarServicoRapidoPdv,
  excluirItemTabelaPrecos,
  adicionarServicoAvulsoPdv,
  servicoAvulsoDesc,
  setServicoAvulsoDesc,
  servicoAvulsoValor,
  setServicoAvulsoValor,
  carrinho,
  setCarrinho,
  alterarQtdItemCarrinho,
  alterarPrecoItemCarrinho,
  totalItensCarrinho,
  descontoPdv,
  setDescontoPdv,
  totalLiquidoPdv,
  formaPgto,
  setFormaPgto,
  taxaCartaoIdPdv,
  setTaxaCartaoIdPdv,
  taxasCartaoDisponiveis,
  valorTaxaMaquininhaPdv,
  clientePdv,
  setClientePdv,
  finalizarVendaPdv,
  comandaMobileAberta,
  setComandaMobileAberta
}) {
  const renderComandaPDV = () => (
    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className={`font-bold flex items-center gap-2 ${temaUnidade.textoDestaque}`}>
            <ShoppingCart size={18} /> Comanda / Nota ({totalItensCarrinho})
          </h2>
          {comandaMobileAberta && (
            <button
              type="button"
              onClick={() => setComandaMobileAberta(false)}
              className="lg:hidden text-slate-400 p-1"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="space-y-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Cliente (Salva automático)</span>
          <ClienteAutocomplete
            clientes={clientes}
            placeholder="Puxar cliente salvo..."
            onSelecionar={(c) => {
              setClientePdv({ ...clientePdv, nome: c.nome, tel: c.tel || '' });
              mostrarToast(`Cliente ${c.nome} selecionado!`);
            }}
          />
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
                    type="button"
                    onClick={() => setCarrinho(carrinho.filter((_, i) => i !== idx))}
                    className="text-red-400 hover:text-red-300 p-0.5"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => alterarQtdItemCarrinho(idx, -1)}
                      className="bg-slate-800 px-2.5 py-1 rounded font-bold"
                    >
                      -
                    </button>
                    <span className="px-1.5 font-bold">{item.qtdVenda}x</span>
                    <button
                      type="button"
                      onClick={() => alterarQtdItemCarrinho(idx, 1)}
                      className="bg-slate-800 px-2.5 py-1 rounded font-bold"
                    >
                      +
                    </button>
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
          type="button"
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
                  type="button"
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
                type="button"
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
            type="button"
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
  );
}