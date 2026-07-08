import sys

with open('src/components/TutorialOverlay.tsx', 'r') as f:
    content = f.read()

# Replace the steps with richer ones.
new_steps_content = """import { Shield, Target, Zap, Skull, Crown, Swords, BookOpen, AlertCircle } from 'lucide-react';
import React from 'react';
import { GameState } from '../types';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Props {
  gameState: GameState;
  isPlayer1: boolean;
}

export function TutorialOverlay({ gameState, isPlayer1 }: Props) {
  if (!gameState.isTutorial || !isPlayer1) return null;
  
  const step = gameState.tutorialStep || 0;
  
  const steps = [
    { 
      title: "Bem-vindo ao Arkano!", 
      icon: <Swords className="w-12 h-12 text-[#e2b17a] mb-4" />,
      text: "O objetivo de Arkano é simples: vencer 2 das 3 rodadas. Você vence uma rodada quando termina com uma pontuação maior que a do seu oponente no campo de batalha." 
    },
    { 
      title: "As Cartas e Pontos", 
      icon: <Target className="w-12 h-12 text-[#e2b17a] mb-4" />,
      text: "Cada carta de unidade possui uma Força (Pts). A sua pontuação total é a soma de todos os pontos das suas cartas em campo. Vence quem tiver mais poder no final da rodada." 
    },
    { 
      title: "O Tabuleiro", 
      icon: <Shield className="w-12 h-12 text-[#e2b17a] mb-4" />,
      text: "O campo de batalha é dividido em duas fileiras para cada jogador: Corpo a Corpo (espadas) e À Distância (arcos). Cada carta só pode ser jogada em sua respectiva fileira." 
    },
    { 
      title: "Turnos", 
      icon: <Crown className="w-12 h-12 text-[#e2b17a] mb-4" />,
      text: "Os jogadores alternam jogando apenas 1 carta por turno. Diferente de outros jogos, você não compra cartas a cada turno! Você deve gerenciar as 10 cartas do seu baralho durante as 3 rodadas inteiras." 
    },
    { 
      title: "Gerenciamento de Mão", 
      icon: <AlertCircle className="w-12 h-12 text-red-500 mb-4" />,
      text: "Se você gastar todas as suas cartas na primeira rodada, você não terá cartas para as rodadas seguintes! A grande estratégia do jogo é saber quando recuar e aceitar a derrota em uma rodada." 
    },
    { 
      title: "Passar a Rodada", 
      icon: <Skull className="w-12 h-12 text-[#e2b17a] mb-4" />,
      text: "A qualquer momento, em seu turno, você pode 'Passar'. Isso significa que você não jogará mais cartas nesta rodada. Seu oponente poderá jogar quantas cartas quiser até passar também. Quando ambos passam, a rodada acaba." 
    },
    { 
      title: "Magias, Armadilhas e Cenários", 
      icon: <Zap className="w-12 h-12 text-[#e2b17a] mb-4" />,
      text: "Existem cartas Especiais! Elas não vão para as fileiras. Magias aplicam buffs (fortalecem aliados) ou debuffs. Cartas de Cenário alteram o campo de batalha inteiro (como clima), afetando ambos os jogadores!" 
    },
    { 
      title: "Espiões e Heróis", 
      icon: <BookOpen className="w-12 h-12 text-[#e2b17a] mb-4" />,
      text: "Cartas Espião são jogadas no campo do inimigo (dando pontos a ele), mas permitem que você compre 2 novas cartas! Cartas Herói (com marca na cor dourada) não podem ser afetadas por magias, armadilhas ou cenários." 
    },
    { 
      title: "Você está pronto!", 
      icon: <Crown className="w-12 h-12 text-yellow-500 mb-4" />,
      text: "O Mestre Tutorial jogará contra você agora. Gerencie bem a sua mão de cartas, saiba a hora certa de passar, e saia vitorioso!" 
    }
  ];

  if (step >= steps.length) return null;

  const current = steps[step];

  const nextStep = async () => {
    await updateDoc(doc(db, 'games', gameState.id), {
      tutorialStep: step + 1
    });
  };

  const closeTutorial = async () => {
    await updateDoc(doc(db, 'games', gameState.id), {
      tutorialStep: steps.length
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto transition-all">
      <div className="bg-[#1a1814] border-2 border-[#a67c52] p-8 max-w-lg w-full rounded-lg shadow-[0_0_60px_rgba(166,124,82,0.4)] flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
        
        <div className="flex flex-col items-center">
          {current.icon}
          <h2 className="text-3xl font-bold text-[#e2b17a] uppercase tracking-widest mb-6 font-serif">{current.title}</h2>
        </div>

        <p className="text-[#d4c3a1] text-base md:text-lg leading-relaxed mb-10 min-h-[100px] flex items-center">
          {current.text}
        </p>

        <div className="flex gap-4 w-full">
          {step < steps.length - 1 && (
             <button onClick={closeTutorial} className="flex-1 bg-black text-[#d4c3a1]/70 hover:text-white py-3 rounded border border-[#3d3326] text-xs font-bold uppercase tracking-widest transition-colors hover:bg-black/50">
               Pular Tutorial
             </button>
          )}
          <button onClick={nextStep} className="flex-1 bg-gradient-to-r from-[#a67c52] to-[#805e3b] hover:from-[#e2b17a] hover:to-[#a67c52] text-black py-3 rounded text-sm font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(166,124,82,0.5)] transition-all transform hover:scale-[1.02]">
            {step < steps.length - 1 ? 'Próximo' : 'Ir para a Batalha!'}
          </button>
        </div>
        
        <div className="flex gap-1.5 mt-8">
           {steps.map((s, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-[#a67c52]' : i < step ? 'w-2 bg-[#a67c52]/50' : 'w-2 bg-[#3d3326]'}`} />
           ))}
        </div>
      </div>
    </div>
  );
}
"""

with open('src/components/TutorialOverlay.tsx', 'w') as f:
    f.write(new_steps_content)

print("done patching tutorial overlay")
