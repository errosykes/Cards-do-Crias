import sys

with open('src/contexts/AuthContext.tsx', 'r') as f:
    content = f.read()

target = """          const newUser: User = {
            uid: user.uid,
            email: user.email || '',
            username: user.email?.split('@')[0] || 'Player',
            role: (isFirstUser || user.email === 'adm@admin.com' || user.email === 'errosykes@gmail.com') ? 'admin' : 'player', 
            inventory: [],
            deck: []
          };"""

replacement = """          const newUser: User = {
            uid: user.uid,
            email: user.email || '',
            username: user.email?.split('@')[0] || 'Player',
            role: (isFirstUser || user.email === 'adm@admin.com' || user.email === 'errosykes@gmail.com') ? 'admin' : 'player', 
            inventory: [],
            deck: [],
            cruzeiros: 1000
          };"""

content = content.replace(target, replacement)

with open('src/contexts/AuthContext.tsx', 'w') as f:
    f.write(content)
print("done")
