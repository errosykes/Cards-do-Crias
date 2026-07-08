import React, { useMemo } from 'react';
import { User, MatchRecord } from '../types';
import { Trophy, Swords, X, Skull, Handshake } from 'lucide-react';

interface Props {
  userData: User;
  onClose: () => void;
}

export function HistoryModal({ userData, onClose }: Props) {
  const history = userData.matchHistory || [];

  const stats = useMemo(() => {
    let wins = 0;
    let losses = 0;
    let draws = 0;
    
    const opponentStats: Record<string, { name: string; wins: number; losses: number; draws: number }> = {};

    history.forEach(match => {
      if (match.result === 'win') wins++;
      else if (match.result === 'loss') losses++;
      else draws++;

      if (!opponentStats[match.opponentId]) {
        opponentStats[match.opponentId] = { name: match.opponentName, wins: 0, losses: 0, draws: 0 };
      }
      if (match.result === 'win') opponentStats[match.opponentId].wins++;
      else if (match.result === 'loss') opponentStats[match.opponentId].losses++;
      else opponentStats[match.opponentId].draws++;
    });

    return { wins, losses, draws, opponentStats: Object.values(opponentStats) };
  }, [history]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1814] border border-[#a67c52] w-full max-w-2xl max-h-[90vh] flex flex-col rounded shadow-[0_0_50px_rgba(166,124,82,0.2)]">
        <div className="flex justify-between items-center p-4 border-b border-[#3d3326]">
          <h2 className="text-xl font-bold uppercase tracking-widest text-[#e2b17a] flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Histórico de Batalhas
          </h2>
          <button onClick={onClose} className="text-[#a67c52] hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8 font-sans">
          
          {/* Suas Estatísticas Globais */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#a67c52] mb-4">Seu Desempenho Global</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-900/20 border border-green-900/50 p-4 rounded text-center">
                 <div className="text-2xl font-bold text-green-500">{stats.wins}</div>
                 <div className="text-[10px] uppercase font-bold text-green-500/70 tracking-widest">Vitórias</div>
              </div>
              <div className="bg-red-900/20 border border-red-900/50 p-4 rounded text-center">
                 <div className="text-2xl font-bold text-red-500">{stats.losses}</div>
                 <div className="text-[10px] uppercase font-bold text-red-500/70 tracking-widest">Derrotas</div>
              </div>
              <div className="bg-[#3d3326]/30 border border-[#3d3326] p-4 rounded text-center">
                 <div className="text-2xl font-bold text-[#d4c3a1]">{stats.draws}</div>
                 <div className="text-[10px] uppercase font-bold text-[#d4c3a1]/70 tracking-widest">Empates</div>
              </div>
            </div>
          </div>

          {/* Histórico Agrupado por Oponente */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#a67c52] mb-4">Contra Oponentes</h3>
            {stats.opponentStats.length === 0 ? (
              <div className="text-center text-[#d4c3a1]/50 py-8 border border-dashed border-[#3d3326] rounded">
                Nenhum registro de batalha encontrado.
              </div>
            ) : (
              <div className="space-y-3">
                {stats.opponentStats.map(opp => (
                  <div key={opp.name} className="flex items-center justify-between bg-black/50 border border-[#3d3326] p-4 rounded">
                     <div className="flex items-center gap-3">
                        <Swords className="w-5 h-5 text-[#a67c52]" />
                        <span className="font-bold text-[#e2b17a]">{opp.name}</span>
                     </div>
                     <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
                        <span className="text-green-500">{opp.wins} V</span>
                        <span className="text-[#3d3326] px-1">|</span>
                        <span className="text-red-500">{opp.losses} D</span>
                        {opp.draws > 0 && (
                          <>
                            <span className="text-[#3d3326] px-1">|</span>
                            <span className="text-[#d4c3a1]">{opp.draws} E</span>
                          </>
                        )}
                     </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Histórico Recente Completo */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#a67c52] mb-4">Últimas Batalhas</h3>
            {history.length === 0 ? (
              <div className="text-center text-[#d4c3a1]/50 py-8 border border-dashed border-[#3d3326] rounded">
                Nenhuma batalha recente.
              </div>
            ) : (
              <div className="space-y-2">
                {history.slice(0, 20).map((match, i) => (
                  <div key={i} className="flex justify-between items-center bg-[#141210] border border-[#3d3326] p-3 rounded text-sm">
                     <div className="flex items-center gap-2">
                        {match.result === 'win' ? <Trophy className="w-4 h-4 text-green-500" /> : match.result === 'loss' ? <Skull className="w-4 h-4 text-red-500" /> : <Handshake className="w-4 h-4 text-[#d4c3a1]" />}
                        <span className="text-[#d4c3a1]">
                          Contra <strong className="text-[#e2b17a]">{match.opponentName}</strong>
                        </span>
                     </div>
                     <div className="flex items-center gap-4">
                        <span className={`font-bold uppercase text-[10px] tracking-widest ${match.result === 'win' ? 'text-green-500' : match.result === 'loss' ? 'text-red-500' : 'text-[#d4c3a1]'}`}>
                           {match.result === 'win' ? 'Vitória' : match.result === 'loss' ? 'Derrota' : 'Empate'}
                        </span>
                        <span className="text-[10px] text-[#d4c3a1]/40">
                           {new Date(match.date).toLocaleDateString()}
                        </span>
                     </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
