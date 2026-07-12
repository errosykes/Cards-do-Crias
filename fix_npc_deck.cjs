const fs = require('fs');
let code = fs.readFileSync('src/components/TournamentTab.tsx', 'utf-8');

// The function is `buildDeckForNpc`
code = code.replace(
  /while \(deck\.length < 22\) \{\n\s*deck\.push\(allCards\[Math\.floor\(Math\.random\(\) \* allCards\.length\)\]\);\n\s*\}\n\s*return deck\.slice\(0, 30\);/g,
  `while (deck.length < 10) {
        deck.push(allCards[Math.floor(Math.random() * allCards.length)]);
     }
     return deck.slice(0, 10);`
);

code = code.replace(
  /if \(card\) deck\.push\(card\);\n\s*\}\);\n\s*return deck;\n\s*\}/g,
  `if (card) deck.push(card);\n        });\n        while (deck.length < 10) { deck.push(allCards[Math.floor(Math.random() * allCards.length)]); }\n        return deck.slice(0, 10);\n     }`
);

fs.writeFileSync('src/components/TournamentTab.tsx', code);
console.log('Fixed tournament NPC deck size');
