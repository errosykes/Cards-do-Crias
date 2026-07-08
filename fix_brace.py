import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

bad_str = """  const acceptRematch = async () => {    }
  };

  const acceptRematch = async () => {"""

if bad_str in content:
    content = content.replace(bad_str, "  const acceptRematch = async () => {")
    with open('src/pages/GameBoard.tsx', 'w') as f:
        f.write(content)
    print("Fixed brace")
else:
    print("Bad str not found")

