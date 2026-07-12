const fs = require('fs');
let code = fs.readFileSync('src/components/AdminAudioTab.tsx', 'utf-8');

code = code.replace(
  'placeholder="Ex: https://example.com/menu-music.mp3"\n          />\n        </div>',
  'placeholder="Ex: https://example.com/menu-music.mp3"\n          />\n          <p className="text-[10px] text-gray-500 mt-1 uppercase">Atenção: O link deve ser direto para um arquivo de áudio (ex: .mp3). Links de páginas como YouTube ou SoundCloud não funcionarão.</p>\n        </div>'
);

code = code.replace(
  'placeholder="Ex: https://example.com/battle-music.mp3"\n          />\n        </div>',
  'placeholder="Ex: https://example.com/battle-music.mp3"\n          />\n          <p className="text-[10px] text-gray-500 mt-1 uppercase">O link deve ser direto para um arquivo de áudio (ex: .mp3).</p>\n        </div>'
);

fs.writeFileSync('src/components/AdminAudioTab.tsx', code);
console.log('Fixed msg');
