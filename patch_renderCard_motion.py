import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

target = """    <div 
      key={`${card.id}-${keySuffix}`} 
      onClick={onClick}
      className={cn(
        `relative ${location === 'hand' ? 'w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-32' : 'w-12 h-16 sm:w-20 sm:h-28 md:w-24 md:h-32'} bg-[#3d3326] border sm:border-2 border-[#a67c52] rounded-md overflow-hidden group shadow-2xl flex flex-col shrink-0`,
        onClick && "cursor-pointer hover:-translate-y-4 hover:border-[#e2b17a] hover:shadow-[0_0_15px_rgba(226,177,122,0.5)] transition-all duration-300"
      )}
    >"""

replacement = """    <motion.div 
      key={`${card.id}-${keySuffix}`}
      layout
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
      whileHover={onClick ? { y: -10, scale: 1.05 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      onClick={onClick}
      className={cn(
        `relative ${location === 'hand' ? 'w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-32' : 'w-12 h-16 sm:w-20 sm:h-28 md:w-24 md:h-32'} bg-[#3d3326] border sm:border-2 border-[#a67c52] rounded-md overflow-hidden group shadow-2xl flex flex-col shrink-0`,
        onClick && "cursor-pointer hover:border-[#e2b17a] hover:shadow-[0_0_15px_rgba(226,177,122,0.5)] transition-colors duration-300"
      )}
    >"""

if target in content:
    content = content.replace(target, replacement)
    
    target_close = """        <Eye className="w-4 h-4" />
      </button>
    </div>
  );
  }"""

    replacement_close = """        <Eye className="w-4 h-4" />
      </button>
    </motion.div>
  );
  }"""
    
    content = content.replace(target_close, replacement_close)
    with open('src/pages/GameBoard.tsx', 'w') as f:
        f.write(content)
    print("done")
else:
    print("Target not found")
