const fs = require('fs');
let code = fs.readFileSync('src/components/AdminCampaignsTab.tsx', 'utf-8');

const anchor = `{campaigns.map(c => (
               <button 
                  key={c.id} 
                  onClick={() => { setSelectedCampaignId(c.id); resetNpcForm(); }}
                  className={\`p-2 text-left text-xs uppercase font-bold rounded border \${selectedCampaignId === c.id ? 'bg-[#3d3326] border-[#a67c52] text-[#e2b17a]' : 'bg-[#0f0e0c] border-[#3d3326] text-[#d4c3a1]/60'}\`}
               >
                 [{c.type}] {c.title}
               </button>
             ))}`;

const replacement = `{campaigns.map(c => (
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
             ))}`;

code = code.replace(anchor, replacement);
fs.writeFileSync('src/components/AdminCampaignsTab.tsx', code);
console.log('Fixed campaigns edit/delete buttons');
