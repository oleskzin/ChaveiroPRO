import React, { useState, useRef, useEffect } from 'react';
import { Search, UserCheck, Phone, MapPin, X } from 'lucide-react';

export default function ClienteAutocomplete({
  clientes = [],
  onSelecionar,
  placeholder = 'Buscar cliente salvo (nome, tel ou endereço)...'
}) {
  const [termo, setTermo] = useState('');
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const fecharAoClicarFora = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setAberto(false);
      }
    };
    document.addEventListener('mousedown', fecharAoClicarFora);
    return () => document.removeEventListener('mousedown', fecharAoClicarFora);
  }, []);

  if (!clientes || clientes.length === 0) return null;

  const termoLimpo = termo.trim().toLowerCase();
  const resultados = termoLimpo
    ? clientes.filter(
        (c) =>
          (c.nome || '').toLowerCase().includes(termoLimpo) ||
          (c.tel || '').includes(termoLimpo) ||
          (c.endereco || '').toLowerCase().includes(termoLimpo)
      )
    : clientes.slice(0, 6);

  const handleEscolher = (cli) => {
    onSelecionar(cli);
    setTermo('');
    setAberto(false);
  };

  return (
    <div ref={containerRef} className="relative w-full sm:w-72">
      <div className="relative">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={termo}
          onFocus={() => setAberto(true)}
          onChange={(e) => {
            setTermo(e.target.value);
            setAberto(true);
          }}
          placeholder={placeholder}
          className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition"
        />
        {termo && (
          <button
            type="button"
            onClick={() => setTermo('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {aberto && (
        <div className="absolute right-0 left-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-40 max-h-56 overflow-y-auto divide-y divide-slate-800">
          {resultados.length === 0 ? (
            <div className="px-3 py-2.5 text-xs text-slate-400">
              Nenhum cliente encontrado para "{termo}".
            </div>
          ) : (
            resultados.slice(0, 8).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleEscolher(c)}
                className="w-full text-left px-3 py-2 hover:bg-slate-800 transition flex flex-col gap-0.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-amber-300 flex items-center gap-1 truncate">
                    <UserCheck size={12} /> {c.nome}
                  </span>
                  <span className="text-[10px] bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded shrink-0">
                    {c.tipo || 'Residencial'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 truncate">
                  {c.tel && (
                    <span className="flex items-center gap-0.5 shrink-0">
                      <Phone size={10} /> {c.tel}
                    </span>
                  )}
                  {c.endereco && (
                    <span className="flex items-center gap-0.5 truncate">
                      <MapPin size={10} /> {c.endereco}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}