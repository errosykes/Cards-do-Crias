const fs = require('fs');
let code = fs.readFileSync('src/components/HowToPlayModal.tsx', 'utf-8');

// Fix Dinheiro a Juros
code = code.replace(
  /<h4 className="font-bold text-\[#e2b17a\] mb-1">Dinheiro a Juros<\/h4>\n\s*<p className="text-xs">O oponente compra 1 carta e joga automaticamente no campo dele\. Você compra 2 cartas para sua mão\.<\/p>/g,
  '<h4 className="font-bold text-[#e2b17a] mb-1">Dinheiro a Juros</h4>\n                <p className="text-xs">O oponente ganha os pontos da carta, mas é forçado a comprar e jogar a carta do topo do baralho dele imediatamente.</p>'
);

// Add Espião Assassino
const addEspiaoAssassino = `              <div className="bg-black/30 p-3 rounded border border-[#3d3326]">
                <h4 className="font-bold text-[#e2b17a] mb-1">Espião Assassino</h4>
                <p className="text-xs">Você joga no campo inimigo. Destrói a carta normal mais forte do oponente e você compra 2 cartas do seu baralho.</p>
              </div>`;

code = code.replace(
  /<h4 className="font-bold text-\[#e2b17a\] mb-1">Espião<\/h4>/,
  addEspiaoAssassino + '\n              <div className="bg-black/30 p-3 rounded border border-[#3d3326]">\n                <h4 className="font-bold text-[#e2b17a] mb-1">Espião</h4>'
);

fs.writeFileSync('src/components/HowToPlayModal.tsx', code);
console.log('Fixed HowToPlayModal');
