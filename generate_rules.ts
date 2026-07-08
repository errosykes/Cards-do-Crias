import fs from 'fs';

interface Rule {
  action: string;
  condition: string;
}

interface Collection {
  name: string;
  rules: Rule[];
}

interface Blueprint {
  collections: Collection[];
}

const blueprint: Blueprint = JSON.parse(fs.readFileSync('firebase-blueprint.json', 'utf8'));

let rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
`;

for (const collection of blueprint.collections) {
  rules += `    match /${collection.name}/{document} {\n`;
  for (const rule of collection.rules) {
    rules += `      allow ${rule.action}: if ${rule.condition};\n`;
  }
  rules += `    }\n`;
}

rules += `  }
}
`;

fs.writeFileSync('firestore.rules', rules);
console.log('firestore.rules generated.');
