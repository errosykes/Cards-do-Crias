import sys

with open('src/pages/AdminPanel.tsx', 'r') as f:
    content = f.read()

# Fix PREDEFINED_EFFECTS array
content = content.replace(
    "'Trap campo Ranged'\n];",
    "'Trap campo Ranged',\n  'BUFF DE ESPECIFICO',\n  'DBUFF DE ESPECIFICO'\n];"
)

# Add to EFFECT_DESCRIPTIONS
content = content.replace(
    "'Trap campo Ranged': 'Tira metade dos pontos (arredondado para cima) de todas as cartas da área Ranged.'\n};",
    "'Trap campo Ranged': 'Tira metade dos pontos (arredondado para cima) de todas as cartas da área Ranged.',\n  'BUFF DE ESPECIFICO': '+1 ponto para uma carta específica do campo.',\n  'DBUFF DE ESPECIFICO': '-1 ponto para uma carta específica do campo.'\n};"
)

with open('src/pages/AdminPanel.tsx', 'w') as f:
    f.write(content)
