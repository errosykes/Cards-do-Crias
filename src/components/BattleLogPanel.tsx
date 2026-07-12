import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface Props {
  logs: string[];
  onClose: () => void;
}

export function BattleLogPanel({ logs, onClose }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-[#141210] border-l border-[#3d3326] flex flex-col z-50 shadow-2xl">
      <div className="p-3 border-b border-[#3d3326] flex items-center justify-between bg-[#1a1814]">
        <h3 className="text-[#a67c52] font-bold uppercase tracking-widest text-xs">Registro de Batalha</h3>
        <button onClick={onClose} className="text-[#d4c3a1]/60 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar flex flex-col">
        {(!logs || logs.length === 0) ? (
          <div className="text-center text-[#d4c3a1]/40 text-xs my-auto">
            Nenhum evento registrado ainda.
          </div>
        ) : (
          logs.map((log, index) => {
            return (
              <div key={index} className="flex flex-col self-start items-start w-full">
                <div className="p-2 rounded text-xs bg-[#2a241c] text-[#d4c3a1] w-full border-l-2 border-[#a67c52]">
                  {log}
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
