import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ confirmacao, onFechar }) {
  if (!confirmacao) return null;

  const {
    titulo = 'Confirmar ação',
    mensagem,
    onConfirmar,
    textoBotao = 'Confirmar',
    perigo = true
  } = confirmacao;

  const handleConfirmar = async () => {
    onFechar();
    if (onConfirmar) await onConfirmar();
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onFechar}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-md w-full space-y-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${perigo ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-amber-950 text-amber-400 border border-amber-800'}`}>
              <AlertTriangle size={20} />
            </div>
            <h3 className="font-bold text-base text-slate-100">{titulo}</h3>
          </div>
          <button
            type="button"
            onClick={onFechar}
            className="text-slate-400 hover:text-white p-1"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">{mensagem}</p>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onFechar}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-2.5 rounded-xl text-xs"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmar}
            className={`font-bold px-4 py-2.5 rounded-xl text-xs transition ${
              perigo
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
            }`}
          >
            {textoBotao}
          </button>
        </div>
      </div>
    </div>
  );
}