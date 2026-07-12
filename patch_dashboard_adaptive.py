import sys

with open('src/pages/Dashboard.tsx', 'r') as f:
    content = f.read()

target = """      const cardsSnapshot = await getDocs(collection(db, 'cards'));
      const allCards = cardsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const botDeck: Card[] = [...allCards].sort(() => 0.5 - Math.random()).slice(0, 10) as Card[];"""

replacement = """      const cardsSnapshot = await getDocs(collection(db, 'cards'));
      const allCards = cardsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Card[];
      let botDeck: Card[] = [];
      
      if (botDifficulty === 'adaptive') {
         // Try to load weights
         let cardWeights: Record<string, number> = {};
         try {
           const snap = await getDoc(doc(db, 'ai_data', 'learning'));
           if (snap.exists()) {
              cardWeights = snap.data().cardWeights || {};
           }
         } catch(e) {}
         
         const sortedCards = [...allCards].sort((a, b) => {
            const wa = cardWeights[a.name] || 0;
            const wb = cardWeights[b.name] || 0;
            // Also value base points
            return (wb + (b.points || 0) * 0.5) - (wa + (a.points || 0) * 0.5);
         });
         
         // Top 7 learned cards + 3 random for variety
         const bestCards = sortedCards.slice(0, 15).sort(() => 0.5 - Math.random()).slice(0, 7);
         const otherCards = sortedCards.slice(15).sort(() => 0.5 - Math.random()).slice(0, 3);
         botDeck = [...bestCards, ...otherCards].sort(() => 0.5 - Math.random());
      } else {
         botDeck = [...allCards].sort(() => 0.5 - Math.random()).slice(0, 10) as Card[];
      }"""

content = content.replace(target, replacement)

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(content)
print("done")
