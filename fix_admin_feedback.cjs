const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPlayersTab.tsx', 'utf-8');

code = code.replace(
  'export function AdminPlayersTab({ players, cards, fetchPlayers }: Props) {',
  `export function AdminPlayersTab({ players, cards, fetchPlayers }: Props) {
  const [message, setMessage] = useState('');
  
  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };
  `
);

code = code.replace(/console\.log\("Success"\);/g, 'showMessage("Ação concluída com sucesso!");');
code = code.replace(/alert\([^)]+\);/g, 'showMessage("Ação concluída");');

code = code.replace(
  '<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">',
  `{message && <div className="mb-4 p-2 bg-green-900/50 text-green-500 border border-green-500/50 rounded text-center text-sm font-bold">{message}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">`
);

fs.writeFileSync('src/components/AdminPlayersTab.tsx', code);
console.log('Fixed admin feedback');
