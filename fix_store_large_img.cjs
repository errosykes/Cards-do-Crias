const fs = require('fs');
let code = fs.readFileSync('src/pages/Store.tsx', 'utf-8');

// Add viewingLargePackImage state
code = code.replace(
  'const [selectedCardToView, setSelectedCardToView] = useState<Card | null>(null);',
  `const [selectedCardToView, setSelectedCardToView] = useState<Card | null>(null);
  const [viewingLargePackImage, setViewingLargePackImage] = useState<string | null>(null);`
);

// Add click handler to pack image
code = code.replace(
  /<img src=\{viewingPack\.imageUrl\} alt=\{viewingPack\.name\} className="w-48 h-48 object-contain rounded-xl border border-\[#a67c52\] mb-4 shadow-lg shadow-black\/50" \/>/g,
  '<img src={viewingPack.imageUrl} alt={viewingPack.name} className="w-48 h-48 object-contain rounded-xl border border-[#a67c52] mb-4 shadow-lg shadow-black/50 cursor-pointer hover:scale-105 transition-transform" onClick={() => setViewingLargePackImage(viewingPack.imageUrl)} />'
);

// Add the large image modal
code = code.replace(
  /\{selectedCardToView && \(/,
  `{viewingLargePackImage && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 p-4" onClick={() => setViewingLargePackImage(null)}>
          <div className="relative max-w-7xl max-h-[90vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewingLargePackImage(null)} className="absolute -top-12 right-0 text-3xl text-white hover:text-[#e2b17a]">
              &times;
            </button>
            <img src={viewingLargePackImage} alt="Pack" className="max-w-full max-h-[85vh] object-contain rounded border-2 border-[#a67c52]" />
          </div>
        </div>
      )}

      {selectedCardToView && (`
);

fs.writeFileSync('src/pages/Store.tsx', code);
console.log('Fixed Store image zoom');
