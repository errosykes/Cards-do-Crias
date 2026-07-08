import React from 'react';
import { X, Shield, Swords, Zap, Crown, Target, AlertCircle, BookOpen } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export function HowToPlayModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1a1814] border border-[#a67c52] rounded shadow-[0_0_50px_rgba(166,124,82,0.2)] w-full max-w-4xl max-h-[90vh] flex flex-col font-serif relative">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-[#3d3326] sticky top-0 bg-[#1a1814] z-10">
          <h2 className="text-xl font-bold tracking-widest text-[#e2b17a] uppercase flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> Regras do Jogo
          </h2>
          <button 
            onClick={onClose} 
            className="text-[#d4c3a1]/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8 text-[#d4c3a1] text-sm md:text-base leading-relaxed">
          
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-[#e2b17a] uppercase flex items-center gap-2 border-b border-[#3d3326] pb-2">
              <Crown className="w-5 h-5" /> Como Ganhar
            </h3>
            <p>O jogo é no formato de "Melhor de 3". O objetivo é vencer 2 rodadas. Você vence uma rodada se, ao final dela, a soma dos pontos das suas cartas em campo for maior que a do adversário.</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-[#e2b17a] uppercase flex items-center gap-2 border-b border-[#3d3326] pb-2">
              <Target className="w-5 h-5" /> Turnos e Cartas
            </h3>
            <p>Os jogadores se alternam jogando apenas 1 carta por turno. Diferente da maioria dos jogos, <strong>você NÃO compra cartas a cada turno</strong>! As cartas que você comprou no início do jogo devem durar pelas 3 rodadas. Saber o momento de passar e economizar cartas é essencial.</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-[#e2b17a] uppercase flex items-center gap-2 border-b border-[#3d3326] pb-2">
              <Swords className="w-5 h-5" /> O Tabuleiro
            </h3>
            <p>O campo é dividido em duas fileiras para cada jogador:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Corpo a Corpo:</strong> Fica na frente. Só cartas com símbolo de espada podem ser jogadas nela.</li>
              <li><strong>À Distância:</strong> Fica atrás. Só cartas com símbolo de arco podem ser jogadas nela.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-[#e2b17a] uppercase flex items-center gap-2 border-b border-[#3d3326] pb-2">
              <AlertCircle className="w-5 h-5" /> Passar a Rodada
            </h3>
            <p>Em vez de jogar uma carta, você pode "Passar". Isso significa que você não vai jogar mais cartas na rodada atual. Seu oponente pode continuar jogando quantas cartas quiser para tentar ultrapassar sua pontuação. A rodada termina quando ambos passam.</p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-[#e2b17a] uppercase flex items-center gap-2 border-b border-[#3d3326] pb-2">
              <Zap className="w-5 h-5" /> Efeitos Especiais (Cartas Especiais)
            </h3>
            <p>Você pode ver o efeito de uma carta segurando o mouse em cima (ou tocando e segurando) da carta no seu inventário, ou até mesmo lendo os ícones na própria carta.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="bg-black/30 p-3 rounded border border-[#3d3326]">
                <h4 className="font-bold text-[#e2b17a] mb-1">Herói</h4>
                <p className="text-xs">Cartas douradas. Elas têm muito poder e são imunes a magias, armadilhas e cenários.</p>
              </div>
              <div className="bg-black/30 p-3 rounded border border-[#3d3326]">
                <h4 className="font-bold text-[#e2b17a] mb-1">Espião</h4>
                <p className="text-xs">Você joga a carta no campo do oponente (dando pontos a ele!), mas em troca, compra 2 cartas do seu baralho.</p>
              </div>
              <div className="bg-black/30 p-3 rounded border border-[#3d3326]">
                <h4 className="font-bold text-[#e2b17a] mb-1">Cenário</h4>
                <p className="text-xs">Cartas como Clima (Frio Congelante, Nevoeiro). Afetam todo o campo, dobrando a força de uma fileira específica ou mudando regras (afeta os dois jogadores).</p>
              </div>
              <div className="bg-black/30 p-3 rounded border border-[#3d3326]">
                <h4 className="font-bold text-[#e2b17a] mb-1">Queimar</h4>
                <p className="text-xs">Destrói a(s) carta(s) mais forte(s) em jogo.</p>
              </div>
              <div className="bg-black/30 p-3 rounded border border-[#3d3326]">
                <h4 className="font-bold text-[#e2b17a] mb-1">Médico</h4>
                <p className="text-xs">Ressuscita uma carta comum do seu cemitério e a coloca de volta na sua mão.</p>
              </div>
              <div className="bg-black/30 p-3 rounded border border-[#3d3326]">
                <h4 className="font-bold text-[#e2b17a] mb-1">Vínculo Estreito</h4>
                <p className="text-xs">A carta dobra seu poder se houver outra carta com o mesmo nome na mesma fileira.</p>
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#3d3326] bg-[#1a1814] flex justify-end">
          <button 
            onClick={onClose}
            className="bg-[#3d3326] hover:bg-[#a67c52] text-[#d4c3a1] hover:text-black py-2 px-6 rounded text-sm font-bold uppercase transition-colors"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
}
