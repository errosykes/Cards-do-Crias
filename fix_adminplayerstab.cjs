const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPlayersTab.tsx', 'utf-8');

// Add state for reset confirm
code = code.replace(
  'const handleResetAccount = async (player: User) => {',
  `const [resetConfirm, setResetConfirm] = useState<string | null>(null);
  
  const handleResetAccount = async (player: User) => {`
);

code = code.replace(
  /<button\s+onClick=\{\(\) => handleResetAccount\(player\)\}\s+className="w-full py-1.5 bg-red-900\/20[^>]+>\s*<RefreshCw className="w-3 h-3" \/>\s*Resetar Conta \(Apagar tudo\)\s*<\/button>/m,
  `{resetConfirm === player.uid ? (
                 <div className="flex gap-2">
                   <button
                     onClick={() => handleResetAccount(player)}
                     className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white border border-red-500 rounded text-[9px] uppercase font-bold tracking-widest transition-colors flex items-center justify-center"
                   >
                     Confirmar
                   </button>
                   <button
                     onClick={() => setResetConfirm(null)}
                     className="flex-1 py-1.5 bg-gray-600 hover:bg-gray-700 text-white border border-gray-500 rounded text-[9px] uppercase font-bold tracking-widest transition-colors flex items-center justify-center"
                   >
                     Cancelar
                   </button>
                 </div>
               ) : (
                 <button
                   onClick={() => setResetConfirm(player.uid)}
                   className="w-full py-1.5 bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-900/50 rounded text-[9px] uppercase font-bold tracking-widest transition-colors flex items-center justify-center gap-1"
                 >
                   <RefreshCw className="w-3 h-3" />
                   Resetar Conta (Apagar tudo)
                 </button>
               )}`
);

fs.writeFileSync('src/components/AdminPlayersTab.tsx', code);
console.log('Fixed Reset Confirm');
