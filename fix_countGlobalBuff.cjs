const fs = require('fs');
let code = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

const anchor = `  const countGlobalBuff = (board: any, buffName: string) => {
    if (!board) return 0;
    let count = 0;
    const checkCard = (c: Card) => c.effects?.includes(buffName);`;

const insert = `  const countGlobalBuff = (board: any, buffName: string) => {
    if (!board) return 0;
    let count = 0;
    const checkCard = (c: Card) => !c.isFacedown && c.effects?.includes(buffName);`;

code = code.replace(anchor, insert);
fs.writeFileSync('src/pages/GameBoard.tsx', code);
console.log('Success countGlobalBuff');
