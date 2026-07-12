const fs = require('fs');
let code = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

code = code.replace(
  `const { userData } = useAuth();\n  const { setCurrentTrack, config } = useAudio();\n\n  useEffect(() => {\n    if (gameState?.isBotMatch && gameState?.campaignId && config.campaignMusic?.[gameState.campaignId]) {\n      setCurrentTrack(config.campaignMusic[gameState.campaignId]);\n    } else if (config.battleMusic) {\n      setCurrentTrack(config.battleMusic);\n    }\n    return () => setCurrentTrack(null);\n  }, [config.battleMusic, setCurrentTrack, gameState?.isBotMatch, gameState?.campaignId, config.campaignMusic]);`,
  `const { userData } = useAuth();\n  const { setCurrentTrack, config } = useAudio();`
);

code = code.replace(
  "const [gameState, setGameState] = useState<GameState | null>(null);",
  "const [gameState, setGameState] = useState<GameState | null>(null);\n\n  useEffect(() => {\n    if (gameState?.isBotMatch && gameState?.campaignId && config.campaignMusic?.[gameState.campaignId]) {\n      setCurrentTrack(config.campaignMusic[gameState.campaignId]);\n    } else if (config.battleMusic) {\n      setCurrentTrack(config.battleMusic);\n    }\n    return () => setCurrentTrack(null);\n  }, [config.battleMusic, setCurrentTrack, gameState?.isBotMatch, gameState?.campaignId, config.campaignMusic]);"
);

fs.writeFileSync('src/pages/GameBoard.tsx', code);
console.log('Fixed GameBoard audio 4');
