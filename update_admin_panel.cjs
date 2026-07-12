const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminPanel.tsx', 'utf-8');

const anchor = `            {(effects.includes('Buff de área ranged') || effects.includes('Buff de área melee') || effects.includes('Trap campo Ranged') || effects.includes('Trap campo melee') || effects.includes('BUFF DE ESPECIFICO') || effects.includes('DBUFF DE ESPECIFICO')) && (
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#a67c52] mb-1">URL do Papel de Parede (Opcional - Efeito de Campo)</label>
                <input type="url" value={backgroundUrl} onChange={e => setBackgroundUrl(e.target.value)} className="w-full bg-black/50 border border-[#3d3326] rounded px-3 py-2 text-sm text-[#d4c3a1] focus:outline-none focus:border-[#a67c52]" placeholder="https://..." />
              </div>
            )}`;

const insert = `            {(effects.includes('Buff de área ranged') || effects.includes('Buff de área melee') || effects.includes('Trap campo Ranged') || effects.includes('Trap campo melee') || effects.includes('BUFF DE ESPECIFICO') || effects.includes('DBUFF DE ESPECIFICO')) && (
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#a67c52] mb-1">URL do Papel de Parede (Opcional - Efeito de Campo)</label>
                <input type="url" value={backgroundUrl} onChange={e => setBackgroundUrl(e.target.value)} className="w-full bg-black/50 border border-[#3d3326] rounded px-3 py-2 text-sm text-[#d4c3a1] focus:outline-none focus:border-[#a67c52]" placeholder="https://..." />
              </div>
            )}
            
            {type === 'Trap' && (
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#a67c52] mb-1">URL da parte de trás da carta (Trap)</label>
                <input type="url" value={backImageUrl} onChange={e => setBackImageUrl(e.target.value)} className="w-full bg-black/50 border border-[#3d3326] rounded px-3 py-2 text-sm text-[#d4c3a1] focus:outline-none focus:border-[#a67c52]" placeholder="https://..." />
              </div>
            )}`;

if (code.includes(anchor)) {
  code = code.replace(anchor, insert);
  fs.writeFileSync('src/pages/AdminPanel.tsx', code);
  console.log('Success admin update');
} else {
  console.log('Failed admin update');
}
