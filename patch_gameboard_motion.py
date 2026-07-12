import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

import_target = "import { useState, useEffect } from 'react';"
import_replacement = "import { useState, useEffect } from 'react';\nimport { motion, AnimatePresence } from 'motion/react';"
content = content.replace(import_target, import_replacement)

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)
print("done")
