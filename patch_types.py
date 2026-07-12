import sys

with open('src/types.ts', 'r') as f:
    content = f.read()

target = "  hasAllCards?: boolean;\n}"
replacement = """  hasAllCards?: boolean;
  cruzeiros?: number;
}

export interface CardPackItem {
  cardId: string;
  weight: number; // probability weight
}

export interface CardPack {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  cards: CardPackItem[];
}"""

content = content.replace(target, replacement)

with open('src/types.ts', 'w') as f:
    f.write(content)
print("done")
