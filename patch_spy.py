import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

# Replace shouldDraw calculation
old_draw = """    let shouldDraw = 0;
    if (card.effects?.includes('Comprar 1')) shouldDraw += 1;
    if (card.effects?.includes('Comprar 2')) shouldDraw += 2;"""

new_draw_human = """    let shouldDraw = 0;
    if (card.effects?.includes('Comprar 1')) shouldDraw += 1;
    if (card.effects?.includes('Comprar 2')) shouldDraw += 2;
    if (isSpy) shouldDraw += 2;"""

old_draw_bot = """        let shouldDraw = 0;
        if (cardToPlay.effects?.includes('Comprar 1')) shouldDraw += 1;
        if (cardToPlay.effects?.includes('Comprar 2')) shouldDraw += 2;"""

new_draw_bot = """        let shouldDraw = 0;
        if (cardToPlay.effects?.includes('Comprar 1')) shouldDraw += 1;
        if (cardToPlay.effects?.includes('Comprar 2')) shouldDraw += 2;
        if (isSpy) shouldDraw += 2;"""

if old_draw in content:
    content = content.replace(old_draw, new_draw_human)
    print("Patched human draw")
    
if old_draw_bot in content:
    content = content.replace(old_draw_bot, new_draw_bot)
    print("Patched bot draw")

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)
