import sys

with open('src/components/ProfileModal.tsx', 'r') as f:
    content = f.read()

# Add coverUrl state
target_state = "const [avatarUrl, setAvatarUrl] = useState(userData.profile?.avatarUrl || '');"
replacement_state = target_state + "\n  const [coverUrl, setCoverUrl] = useState(userData.profile?.coverUrl || '');"
content = content.replace(target_state, replacement_state)

# Update save logic
target_save = """        'profile': {
          font,
          color,
          avatarUrl
        }"""
replacement_save = """        'profile': {
          font,
          color,
          avatarUrl,
          coverUrl
        }"""
content = content.replace(target_save, replacement_save)

# Add coverUrl input
target_input = """          <div>
            <label className="block text-xs uppercase font-bold text-[#a67c52] mb-1">Cor do Nome</label>"""
replacement_input = """          <div>
            <label className="block text-xs uppercase font-bold text-[#a67c52] mb-1">Foto de Capa (URL)</label>
            <p className="text-[10px] text-[#d4c3a1]/60 mb-1">Tamanho ideal: 600x200 pixels (Proporção 3:1)</p>
            <input 
              type="text" 
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              className="w-full bg-[#0f0e0c] border border-[#3d3326] rounded p-2 text-sm text-[#d4c3a1] focus:outline-none focus:border-[#a67c52] transition-colors"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-xs uppercase font-bold text-[#a67c52] mb-1">Cor do Nome</label>"""
content = content.replace(target_input, replacement_input)

# Update preview display
target_preview = """          <div className="mt-6 p-4 border border-[#3d3326] rounded bg-[#0f0e0c] flex items-center gap-4">
             {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-[#3d3326] object-cover" />
             ) : (
                <div className="w-12 h-12 rounded-full bg-[#3d3326] border-2 border-[#a67c52] flex items-center justify-center font-bold">?</div>
             )}
             <span className={font} style={{ color: color, fontWeight: 'bold', fontSize: '1.25rem' }}>{userData.username}</span>
          </div>"""
replacement_preview = """          <div 
            className="mt-6 p-6 border border-[#3d3326] rounded bg-[#0f0e0c] flex items-center gap-4 relative overflow-hidden h-32"
          >
             {coverUrl && (
                <img src={coverUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-50 z-0" />
             )}
             <div className="relative z-10 flex items-center gap-4 w-full">
                 {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full border-2 border-[#a67c52] object-cover shadow-lg" />
                 ) : (
                    <div className="w-16 h-16 rounded-full bg-[#3d3326] border-2 border-[#a67c52] flex items-center justify-center font-bold shadow-lg text-lg">?</div>
                 )}
                 <span className={`${font} drop-shadow-md`} style={{ color: color, fontWeight: 'bold', fontSize: '1.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{userData.username}</span>
             </div>
          </div>"""
content = content.replace(target_preview, replacement_preview)

with open('src/components/ProfileModal.tsx', 'w') as f:
    f.write(content)
print("done")
