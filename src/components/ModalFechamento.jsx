import React from 'react';
import { ClipboardCheck, X, Lock, Copy, Share2, Trash2, Cloud } from 'lucide-react';

export default function ModalFechamento({
  aberto,
  onFechar,
  hojeStr,
  totalGavetaFisica,
  dinheiroContado,
  setDinheiroContado,
  obsFechamento,
  setObsFechamento,
  textoRelatorio,
  onSalvar,
  historico,
  onExcluirHistorico,
  mostrarToast
}) {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 sm:p-5 max-w-xl w-full space-y-4 my-8 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-emerald-400 flex items-center gap-2 text-base">
              <ClipboardCheck size={20} /> Fechamento de Caixa Diário ({hojeStr})
            </h3>
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <Cloud size={11} className="text-sky-400" /> Sincronizado na nuvem (PC e Celular)
            </span>
          </div>
          <button type="button" onClick={onFechar} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
          <div>
            <label className="text-[11px] text-emerald-300 font-bold block mb-1">
              Conferência Física: Dinheiro Contado na Gaveta (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder={`Esperado: R$ ${totalGavetaFisica.toFixed(2)}`}
              value={dinheiroContado}
              onChange={(e) => setDinheiroContado(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-bold"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 font-bold block mb-1">
              Observação do Fechamento (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Tudo batendo / Troco ok"
              value={obsFechamento}
              onChange={(e) => setObsFechamento(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 max-h-64 overflow-y-auto">
          <pre className="text-xs text-slate-200 whitespace-pre-wrap font-mono leading-relaxed">
            {textoRelatorio}
          </pre>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onSalvar('salvar')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700"
          >
            <Lock size={14} /> Salvar na Nuvem
          </button>
          <button
            type="button"
            onClick={() => onSalvar('copiar')}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5"
          >
            <Copy size={14} /> Salvar & Copiar
          </button>
          <button
            type="button"
            onClick={() => onSalvar('whatsapp')}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5"
          >
            <Share2 size={14} /> Enviar WhatsApp
          </button>
        </div>

        {historico.length > 0 && (
          <div className="border-t border-slate-800 pt-3 space-y-2">
            <span className="text-[11px] font-bold uppercase text-slate-400 block">
              Últimos Fechamentos Salvos ({historico.length})
            </span>
            <div className="max-h-36 overflow-y-auto space-y-1.5">
              {historico.slice(0, 8).map((f) => (
                <div key={f.id} className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-300 truncate">
                    <strong>{f.data}</strong> às {f.hora} • {f.unidade}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(f.texto);
                          mostrarToast('Relatório antigo copiado!');
                        } catch {}
                      }}
                      className="text-amber-400 hover:underline font-semibold"
                    >
                      Copiar
                    </button>
                    <button
                      type="button"
                      onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(f.texto)}`, '_blank')}
                      className="text-emerald-400 hover:underline font-semibold"
                    >
                      Zap
                    </button>
                    <button
                      type="button"
                      onClick={() => onExcluirHistorico(f.id)}
                      className="text-red-400 hover:text-red-300 p-0.5"
                      title="Excluir fechamento"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}