import React from 'react';
import {
  Plus,
  X,
  UserPlus,
  Send,
  Phone,
  MapPin,
  CheckCircle,
  Share2,
  Receipt,
  Trash2
} from 'lucide-react';
import ClienteAutocomplete from './ClienteAutocomplete';

export default function AbaOS({
  temaUnidade,
  infoUnidadeAtual,
  unidadeOperacional,
  clientes,
  mostrarToast,
  funcionarios,
  funcionarioPadraoUnidade,
  setModalConfigUnidades,
  estoqueUnidade,
  osPendentes,
  osConcluidas,
  osUnidade,
  osExibidas,
  filtroStatusOS,
  setFiltroStatusOS,
  formAberto,
  toggleForm,
  novaOS,
  setNovaOS,
  itemTempOS,
  setItemTempOS,
  adicionarMaterialNaOS,
  removerMaterialDaOS,
  criarOS,
  enviarDiretoParaFuncionario,
  concluirOS,
  setComprovanteAtivo,
  abrirPortalNFSe,
  excluirOS
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className={`font-bold text-base ${temaUnidade.textoDestaque}`}>
          Ordens de Serviço — {infoUnidadeAtual.nome} ({osExibidas.length})
        </h2>
        <button
          type="button"
          onClick={() => toggleForm('os')}
          className={`${temaUnidade.botaoAtivo} font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow`}
        >
          {formAberto.os ? <><X size={16} /> Fechar Formulário</> : <><Plus size={16} /> Nova Ordem de Serviço</>}
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {[
          { id: 'pendente', label: `Pendentes (${osPendentes.length})` },
          { id: 'concluida', label: `Concluídas (${osConcluidas.length})` },
          { id: 'todas', label: `Todas (${osUnidade.length})` }
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFiltroStatusOS(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
              filtroStatusOS === f.id ? temaUnidade.botaoAtivo : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {formAberto.os && (
        <form onSubmit={(e) => criarOS(e, false)} className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-3 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase text-slate-400">Preencher Nova OS</span>
            <div className="flex flex-wrap items-center gap-2">
              <ClienteAutocomplete
                clientes={clientes}
                onSelecionar={(cli) => {
                  setNovaOS({
                    ...novaOS,
                    cliente: cli.nome,
                    tel: cli.tel || '',
                    endereco: cli.endereco || novaOS.endereco
                  });
                  mostrarToast(`Cliente ${cli.nome} preenchido na OS!`);
                }}
              />
              <button
                type="button"
                onClick={() => setModalConfigUnidades(true)}
                className="bg-slate-950 border border-sky-700 text-sky-400 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
              >
                <UserPlus size={13} /> Equipe ({funcionarios.length})
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
              placeholder="Endereço / Local do Serviço"
              value={novaOS.endereco}
              onChange={(e) => setNovaOS({ ...novaOS, endereco: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="O que será feito (Descrição) *"
              required
              value={novaOS.desc}
              onChange={(e) => setNovaOS({ ...novaOS, desc: e.target.value })}
              className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
            />
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Valor Total (R$) *"
              required
              value={novaOS.valor}
              onChange={(e) => setNovaOS({ ...novaOS, valor: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm"
            />
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-amber-400 block">
              Materiais do estoque (Permite vários itens):
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
                    [{item.id}] {item.nome} (Est: {item.qtd})
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={itemTempOS.qtd}
                  onChange={(e) => setItemTempOS({ ...itemTempOS, qtd: e.target.value })}
                  className="w-20 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs"
                />
                <button
                  type="button"
                  onClick={adicionarMaterialNaOS}
                  className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold px-3 py-2 rounded-lg text-xs border border-slate-700"
                >
                  + Incluir
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
              <option value="Sinal 50% Pago / Cobrar Restante">Pagamento: Sinal 50% Pago</option>
              <option value="Faturado / Condomínio">Pagamento: Faturado / Condomínio</option>
            </select>

            <select
              value={novaOS.garantia}
              onChange={(e) => setNovaOS({ ...novaOS, garantia: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300"
            >
              <option value="90 dias">Garantia: 90 dias</option>
              <option value="6 meses">Garantia: 6 meses</option>
              <option value="1 ano">Garantia: 1 ano</option>
              <option value="Sem garantia">Sem garantia</option>
            </select>

            <input
              type="text"
              placeholder="Placa / Fechadura / Obs"
              value={novaOS.obs_tecnica}
              onChange={(e) => setNovaOS({ ...novaOS, obs_tecnica: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button type="submit" className={`${temaUnidade.botaoAtivo} font-bold px-5 py-2.5 rounded-lg text-xs sm:text-sm`}>
              Salvar OS
            </button>
            <button
              type="button"
              onClick={() => criarOS(null, true)}
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-xs sm:text-sm flex items-center gap-1.5"
            >
              <Send size={15} /> Salvar & Enviar pro Funcionário
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {osExibidas.map((os) => {
          const listaMat = Array.isArray(os.itens_usados) && os.itens_usados.length > 0
            ? os.itens_usados
            : (os.chave_id ? [{ id: os.chave_id, nome: os.chave_id, qtd: os.qtd_copias }] : []);

          const nomeFuncExibido = os.funcionario_nome || funcionarioPadraoUnidade?.nome || '';

          return (
            <div key={os.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-mono text-slate-400">OS Nº {os.id.toString().slice(-4)} • {os.data}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${os.status === 'concluida' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'}`}>
                    {os.status}
                  </span>
                </div>
                <h3 className="font-bold text-base mt-1">{os.cliente}</h3>
                {os.tel && <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><Phone size={11} /> {os.tel}</p>}
                {os.endereco && <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><MapPin size={11} /> {os.endereco}</p>}
                <p className="text-sm text-slate-200 mt-1.5">{os.desc}</p>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {os.forma_pgto && <span className="text-[11px] text-amber-300 font-medium">Pgto: {os.forma_pgto}</span>}
                  {nomeFuncExibido && <span className="text-[11px] text-sky-400 font-bold">Resp: {nomeFuncExibido}</span>}
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
                    type="button"
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
                        type="button"
                        onClick={() => concluirOS(os, 'Pix')}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1"
                      >
                        <CheckCircle size={13} /> Concluir (Pago)
                      </button>
                      <button
                        type="button"
                        onClick={() => concluirOS(os, 'A Receber (Fiado)')}
                        className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3 py-2 rounded-lg"
                      >
                        Fiado
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setComprovanteAtivo({
                          origem: `OS Nº ${os.id.toString().slice(-4)}`,
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
                        <Share2 size={13} /> Comprovante
                      </button>
                      <button
                        type="button"
                        onClick={() => abrirPortalNFSe({ cliente: os.cliente, desc: os.desc, valor: os.valor })}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1"
                        title="Copia os dados e abre o portal oficial da NFS-e"
                      >
                        <Receipt size={13} /> NFS-e
                      </button>
                    </div>
                  )}
                  <button type="button" onClick={() => excluirOS(os.id)} className="text-red-400 hover:text-red-300 p-2">
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