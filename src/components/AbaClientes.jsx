import React from 'react';
import {
  Plus,
  X,
  Phone,
  MapPin,
  Edit2,
  Trash2
} from 'lucide-react';

export default function AbaClientes({
  temaUnidade,
  clientes,
  transacoes,
  formAberto,
  toggleForm,
  novoCliente,
  setNovoCliente,
  salvarCliente,
  iniciarEdicaoCliente,
  cancelarEdicaoCliente,
  excluirCliente,
  buscaClienteCrm,
  setBuscaClienteCrm,
  clienteHistoricoSelecionado,
  setClienteHistoricoSelecionado
}) {
  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nome.toLowerCase().includes(buscaClienteCrm.toLowerCase()) ||
      (c.tel || '').includes(buscaClienteCrm) ||
      (c.obs || '').toLowerCase().includes(buscaClienteCrm.toLowerCase())
  );

  const historicoCliente = clienteHistoricoSelecionado
    ? transacoes.filter((t) =>
        t.desc.toLowerCase().includes(clienteHistoricoSelecionado.nome.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className={`font-bold text-base ${temaUnidade.textoDestaque}`}>
          Base de Clientes ({clientes.length})
        </h2>
        <button
          type="button"
          onClick={() => {
            if (formAberto.cliente) {
              cancelarEdicaoCliente();
            } else {
              setNovoCliente({ id: null, nome: '', tel: '', endereco: '', tipo: 'Residencial', obs: '' });
              toggleForm('cliente', true);
            }
          }}
          className={`${temaUnidade.botaoAtivo} font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow`}
        >
          {formAberto.cliente ? <><X size={16} /> Fechar Formulário</> : <><Plus size={16} /> Cadastrar Cliente</>}
        </button>
      </div>

      {formAberto.cliente && (
        <form onSubmit={salvarCliente} className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-amber-400">
              {novoCliente.id ? `Editando Cliente: ${novoCliente.nome}` : 'Novo Cadastro de Cliente'}
            </span>
            {novoCliente.id && (
              <button
                type="button"
                onClick={cancelarEdicaoCliente}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <X size={14} /> Cancelar Edição
              </button>
            )}
          </div>
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
              placeholder="Endereço Completo"
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
              placeholder="Obs (CPF/CNPJ, Placa, Fechadura)"
              value={novoCliente.obs}
              onChange={(e) => setNovoCliente({ ...novoCliente, obs: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
            />
          </div>
          <button type="submit" className={`${temaUnidade.botaoAtivo} font-bold px-5 py-2.5 rounded-lg text-sm`}>
            {novoCliente.id ? 'Salvar Alterações do Cliente' : 'Guardar Cliente'}
          </button>
        </form>
      )}

      {clienteHistoricoSelecionado && (
        <div className="bg-slate-900 p-4 rounded-xl border-2 border-amber-500 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-amber-400 text-sm">
              Histórico Completo (PDV, OS e Socorros): {clienteHistoricoSelecionado.nome}
            </h3>
            <button
              type="button"
              onClick={() => setClienteHistoricoSelecionado(null)}
              className="text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
          <div className="space-y-2 text-xs max-h-64 overflow-y-auto">
            {historicoCliente.map((t) => (
              <div key={t.id} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                <span>{t.data} — {t.desc}</span>
                <span className="text-emerald-400 font-bold shrink-0 ml-2">R$ {Number(t.valor).toFixed(2)}</span>
              </div>
            ))}
            {historicoCliente.length === 0 && (
              <p className="text-slate-500">Nenhuma movimentação encontrada para este nome.</p>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar cliente por nome, telefone ou observação..."
            value={buscaClienteCrm}
            onChange={(e) => setBuscaClienteCrm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-sm"
          />
          {buscaClienteCrm && (
            <button
              type="button"
              onClick={() => setBuscaClienteCrm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientesFiltrados.map((c) => (
            <div key={c.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-3">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] bg-slate-800 text-amber-400 px-2 py-0.5 rounded">{c.tipo}</span>
                  <h3 className="font-bold text-base mt-1 truncate">{c.nome}</h3>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Phone size={12} /> {c.tel || 'Sem telefone'}</p>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><MapPin size={12} /> {c.endereco || 'Sem endereço'}</p>
                  {c.obs && <p className="text-xs text-amber-300/80 mt-1 break-words">{c.obs}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => iniciarEdicaoCliente(c)}
                    className="bg-slate-950 hover:bg-slate-800 text-amber-400 p-1.5 rounded-lg border border-slate-800"
                    title="Editar dados do cliente"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => excluirCliente(c.id)}
                    className="bg-slate-950 hover:bg-slate-800 text-red-400 p-1.5 rounded-lg border border-slate-800"
                    title="Excluir cliente"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <button
                type="button"
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
  );
}