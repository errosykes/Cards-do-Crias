const fs = require('fs');
let code = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

// revert the accidental addition in requestRematch
code = code.replace(
  `if (gameState?.isBotMatch) {\n        if (gameState?.campaignId && config.campaignMusic?.[gameState.campaignId]) {\n            setCurrentTrack(config.campaignMusic[gameState.campaignId]);\n        } else if (config.battleMusic) {\n            setCurrentTrack(config.battleMusic);\n        }`,
  `if (gameState?.isBotMatch) {`
);

// Add the hook and useEffect correctly
code = code.replace(
  "const { userData } = useAuth();",
  `const { userData } = useAuth();
  const { setCurrentTrack, config } = useAudio();

  useEffect(() => {
    if (gameState?.isBotMatch && gameState?.campaignId && config.campaignMusic?.[gameState.campaignId]) {
      setCurrentTrack(config.campaignMusic[gameState.campaignId]);
    } else if (config.battleMusic) {
      setCurrentTrack(config.battleMusic);
    }
    return () => setCurrentTrack(null);
  }, [config.battleMusic, setCurrentTrack, gameState?.isBotMatch, gameState?.campaignId, config.campaignMusic]);`
);

fs.writeFileSync('src/pages/GameBoard.tsx', code);
console.log('Fixed GameBoard audio 3');
