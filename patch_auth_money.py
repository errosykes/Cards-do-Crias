import sys

with open('src/contexts/AuthContext.tsx', 'r') as f:
    content = f.read()

target = """          if ((user.email === 'adm@admin.com' || user.email === 'errosykes@gmail.com') && data.role !== 'admin') {
            data.role = 'admin';
            await setDoc(userDocRef, data, { merge: true });
          }"""

replacement = """          let needsUpdate = false;
          if ((user.email === 'adm@admin.com' || user.email === 'errosykes@gmail.com') && data.role !== 'admin') {
            data.role = 'admin';
            needsUpdate = true;
          }
          if (data.cruzeiros === undefined) {
            data.cruzeiros = 1000;
            needsUpdate = true;
          }
          if (needsUpdate) {
            await setDoc(userDocRef, data, { merge: true });
          }"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/contexts/AuthContext.tsx', 'w') as f:
        f.write(content)
    print("done")
else:
    print("Target not found")
