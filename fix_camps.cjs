const fs = require('fs');
let code = fs.readFileSync('src/components/AdminCampaignsTab.tsx', 'utf-8');

code = code.replace(
  'const resetCampForm = () => {',
  `const handleEditCamp = (camp: any) => {
    setIsEditingCamp(camp.id);
    setCampTitle(camp.title);
    setCampType(camp.type || 'tournament');
    setCampDesc(camp.description || '');
  };

  const handleDeleteCamp = async (id: string) => {
    if (!confirm('Excluir Campanha? Todos os NPCs dessa campanha ficarão sem campanha associada se não forem apagados.')) return;
    try {
      await deleteDoc(doc(db, 'campaigns', id));
      fetchData();
    } catch(e) {
      console.log('Erro ao apagar');
    }
  };

  const resetCampForm = () => {`
);

code = code.replace(
  /\{campaigns\.map\(c => \(\s*<button\s*key=\{c\.id\}\s*onClick=\{\(\) => \{ setSelectedCampaignId\(c\.id\); resetNpcForm\(\); \}\}\s*className=\{`p-2 text-left text-xs uppercase font-bold rounded border \$\{selectedCampaignId === c\.id \? 'bg-\[#3d3326\] border-\[#a67c52\] text-\[#e2b17a\]' : 'bg-\[#0f0e0c\] border-\[#3d3326\] text-\[#d4c3a1\]\/60'\} `\}\s*>\s*\[\{c\.type\}\] \{c\.title\}\s*<\/button>\s*\)\)\}/,
  `{campaigns.map(c => (
               <div key={c.id} className="flex flex-col mb-1">
                 <div className="flex">
                   <button 
                      onClick={() => { setSelectedCampaignId(c.id); resetNpcForm(); }}
                      className={\`p-2 flex-1 text-left text-xs uppercase font-bold rounded-l border \${selectedCampaignId === c.id ? 'bg-[#3d3326] border-[#a67c52] text-[#e2b17a]' : 'bg-[#0f0e0c] border-[#3d3326] border-r-0 text-[#d4c3a1]/60'}\`}
                   >
                     [{c.type}] {c.title}
                   </button>
                   <button onClick={() => handleEditCamp(c)} className="bg-[#1a1814] border-y border-r border-[#3d3326] px-2 text-blue-400 hover:bg-[#3d3326]">
                     <Edit className="w-3 h-3" />
                   </button>
                   <button onClick={() => handleDeleteCamp(c.id)} className="bg-[#1a1814] border-y border-r border-[#3d3326] rounded-r px-2 text-red-500 hover:bg-red-900/40">
                     <Trash2 className="w-3 h-3" />
                   </button>
                 </div>
               </div>
             ))}`
);

fs.writeFileSync('src/components/AdminCampaignsTab.tsx', code);
console.log('Fixed camps list');
