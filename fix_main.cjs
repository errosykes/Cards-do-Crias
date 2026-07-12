const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf-8');

const override = `
// Override confirm to prevent iframe blocking errors
const originalConfirm = window.confirm;
window.confirm = (msg) => {
  try {
    return originalConfirm(msg);
  } catch (e) {
    console.warn('Confirm blocked, auto-confirming:', msg);
    return true;
  }
};
`;

code = code.replace(
  "import './index.css';",
  "import './index.css';\n" + override
);

fs.writeFileSync('src/main.tsx', code);
console.log('Added confirm override to main.tsx');
