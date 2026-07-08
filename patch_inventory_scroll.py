import sys
import re

with open('src/pages/Dashboard.tsx', 'r') as f:
    content = f.read()

target = """        <div className="lg:col-span-2">
          <div className="bg-[#141210] border border-[#3d3326] p-6 rounded shadow-2xl min-h-[500px]">
            <h2 className="text-lg font-bold tracking-tighter text-[#a67c52] uppercase mb-1">Seu Inventário</h2>
            <p className="text-[10px] uppercase tracking-widest text-[#d4c3a1]/60 mb-6">Clique em uma carta para adicioná-la ou removê-la do seu baralho ativo.</p>
            
            {inventoryGrouped.length === 0 ? ("""

replacement = """        <div className="lg:col-span-2">
          <div className="bg-[#141210] border border-[#3d3326] p-6 rounded shadow-2xl min-h-[500px] h-[800px] max-h-[85vh] flex flex-col">
            <div className="flex-none">
              <h2 className="text-lg font-bold tracking-tighter text-[#a67c52] uppercase mb-1">Seu Inventário</h2>
              <p className="text-[10px] uppercase tracking-widest text-[#d4c3a1]/60 mb-6">Clique em uma carta para adicioná-la ou removê-la do seu baralho ativo.</p>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {inventoryGrouped.length === 0 ? ("""

content = content.replace(target, replacement)

target_end = """                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>"""

replacement_end = """                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            </div>
          </div>
        </div>"""

if "</div>\n          </div>\n        </div>" not in content and "<div className=\"flex-1 overflow-y-auto pr-2" in content:
    content = content.replace(target_end, replacement_end)

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(content)

print("done")
