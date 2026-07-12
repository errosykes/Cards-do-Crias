const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

code = code.replace(
  "const { userData } = useAuth();",
  `const { userData } = useAuth();
  const { setCurrentPlaylist, config } = useAudio();

  useEffect(() => {
    if (config.menuMusic && config.menuMusic.length > 0) {
      setCurrentPlaylist(config.menuMusic);
    } else {
      setCurrentPlaylist(null);
    }
  }, [config.menuMusic, setCurrentPlaylist]);`
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log('Fixed dashboard audio start');
