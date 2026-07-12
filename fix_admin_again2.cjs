const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminPanel.tsx', 'utf-8');

code = code.replace(
  ") : activeTab === 'audio' ? (\n          <AdminAudioTab />\n      ) : activeTab === 'audio' ? (\n        <AdminAudioTab />\n      ) : activeTab === 'logs' ? (",
  ") : activeTab === 'audio' ? (\n        <AdminAudioTab />\n      ) : activeTab === 'logs' ? ("
);

code = code.replace(
  "import { AdminAudioTab } from \"../components/AdminAudioTab\";\nimport { Music } from \"lucide-react\";\n",
  ""
);

fs.writeFileSync('src/pages/AdminPanel.tsx', code);
console.log('Fixed double audio tab');
