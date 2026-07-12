const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  "import { AuthProvider, useAuth } from './contexts/AuthContext';",
  "import { AuthProvider, useAuth } from './contexts/AuthContext';\nimport { AudioProvider } from './contexts/AudioContext';"
);

code = code.replace(
  /<AuthProvider>/,
  '<AuthProvider>\n      <AudioProvider>'
);

code = code.replace(
  /<\/AuthProvider>/,
  '      </AudioProvider>\n    </AuthProvider>'
);

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed App.tsx');
