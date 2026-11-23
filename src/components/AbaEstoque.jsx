import React from 'react';
import {
  Plus,
  X,
  Share2,
  Edit2,
  Trash2
} from 'lucide-react';

export default function AbaEstoque({
  temaUnidade,
  infoUnidadeAtual,
  estoqueUnidade,
  itensEstoqueBaixo,
  gerarPedidoDistribuidorWhatsApp,
  apenasEstoqueBaixo,
  setApenasEstoqueBaixo,
  capitalTotalEstoque,
  potencialVendaEstoque,
  formAberto,
  toggleForm,
  editandoEstoqueId,
  cancelarEdicaoEstoque,
  salvarNovaChave,
  novaChave,
  setNovaChave,
  buscaEstoque,
  setBuscaEstoque,
  filtroCatEstoque,
  setFiltroCatEstoque,
  estoqueFiltrado,
  alterarQtdEstoque,
  iniciarEdicaoEstoque,
  excluirItemEstoque
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className={`font-bold text-base ${temaUnidade.textoDestaque}`}>
          Estoque — {infoUnidadeAtual.nome} ({estoqueUnidade.length})
        </h2>
        <button
          type="button"
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
            <button
              type="button"
              onClick={gerarPedidoDistribuidorWhatsApp}
              className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
            >
              <Share2 size={13} /> Pedido WhatsApp
            </button>
            <button
              type="button"
              onClick={() => setApenasEstoqueBaixo(!apenasEstoqueBaixo)}
              className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
            >
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
                    <button type="button" onClick={() => alterarQtdEstoque(item, 1)} className="bg-slate-800 px-2.5 py-1.5 rounded-lg font-bold">+1</button>
                    <button type="button" onClick={() => alterarQtdEstoque(item, -1)} className="bg-slate-800 px-2.5 py-1.5 rounded-lg font-bold">-1</button>
                    <button type="button" onClick={() => iniciarEdicaoEstoque(item)} className="bg-slate-900 text-amber-400 p-1.5 rounded-lg border border-slate-800">
                      <Edit2 size={14} />
                    </button>
                    <button type="button" onClick={() => excluirItemEstoque(item.id)} className="bg-slate-900 text-red-400 p-1.5 rounded-lg border border-slate-800">
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