import sys

with open('src/components/FriendsModal.tsx', 'r') as f:
    content = f.read()

target = """                 {friends.map(friend => (
                   <div key={friend.uid} className="bg-[#0f0e0c] border border-[#3d3326] p-3 rounded flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        {friend.profile?.avatarUrl ? (
                          <img src={friend.profile.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full border border-[#3d3326] object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#3d3326] flex items-center justify-center font-bold">?</div>
                        )}
                        <div 
                          className={friend.profile?.font || "font-sans"} 
                          style={{ color: friend.profile?.color || "#d4c3a1", fontWeight: 'bold' }}
                        >
                          {friend.username}
                        </div>
                     </div>"""

replacement = """                 {friends.map(friend => (
                   <div key={friend.uid} className="bg-[#0f0e0c] border border-[#3d3326] p-3 rounded flex items-center justify-between relative overflow-hidden">
                     {friend.profile?.coverUrl && (
                        <img src={friend.profile?.coverUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-30 z-0" />
                     )}
                     <div className="flex items-center gap-3 relative z-10">
                        {friend.profile?.avatarUrl ? (
                          <img src={friend.profile.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full border border-[#3d3326] object-cover shadow" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#3d3326] flex items-center justify-center font-bold shadow">?</div>
                        )}
                        <div 
                          className={`${friend.profile?.font || "font-sans"} drop-shadow-md`}
                          style={{ color: friend.profile?.color || "#d4c3a1", fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                        >
                          {friend.username}
                        </div>
                     </div>"""

content = content.replace(target, replacement)

with open('src/components/FriendsModal.tsx', 'w') as f:
    f.write(content)
print("done")
