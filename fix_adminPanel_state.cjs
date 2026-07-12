const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminPanel.tsx', 'utf-8');

const anchor = `  const [imageUrl, setImageUrl] = useState('');
  const [backgroundUrl,
      backImageUrl, setBackgroundUrl] = useState('');
  const [backImageUrl, setBackImageUrl] = useState('');`;

const insert = `  const [imageUrl, setImageUrl] = useState('');
  const [backgroundUrl, setBackgroundUrl] = useState('');
  const [backImageUrl, setBackImageUrl] = useState('');`;

code = code.replace(anchor, insert);
fs.writeFileSync('src/pages/AdminPanel.tsx', code);
console.log('Success AdminPanel state fix');
