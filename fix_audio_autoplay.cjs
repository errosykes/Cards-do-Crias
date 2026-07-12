const fs = require('fs');
let code = fs.readFileSync('src/contexts/AudioContext.tsx', 'utf-8');

code = code.replace(
  "useEffect(() => {\n    setCurrentTrackIndex(0);\n  }, [currentPlaylist]);",
  `useEffect(() => {\n    setCurrentTrackIndex(0);\n  }, [currentPlaylist]);\n\n  useEffect(() => {\n    const handleInteraction = () => {\n      if (audioRef.current && audioRef.current.paused && currentPlaylist && currentPlaylist.length > 0 && audioRef.current.src) {\n        audioRef.current.play().catch(e => console.log('Still blocked', e));\n      }\n    };\n    window.addEventListener('click', handleInteraction);\n    window.addEventListener('keydown', handleInteraction);\n    return () => {\n      window.removeEventListener('click', handleInteraction);\n      window.removeEventListener('keydown', handleInteraction);\n    };\n  }, [currentPlaylist]);`
);

fs.writeFileSync('src/contexts/AudioContext.tsx', code);
console.log('Fixed AudioContext autoplay handler');
