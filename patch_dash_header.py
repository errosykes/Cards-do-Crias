import sys

with open('src/pages/Dashboard.tsx', 'r') as f:
    content = f.read()

target = """      <div className="flex justify-between items-center bg-[#1a1814] border border-[#3d3326] p-4 rounded shadow-2xl flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            {isEditingUsername ? ("""

replacement = """      <div className="flex justify-between items-center bg-[#1a1814] border border-[#3d3326] p-4 rounded shadow-2xl flex-wrap gap-4 relative overflow-hidden">
        {userData?.profile?.coverUrl && (
           <img src={userData.profile.coverUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-30 z-0" />
        )}
        <div className="relative z-10 flex items-center gap-4">
          {userData?.profile?.avatarUrl && (
             <img src={userData.profile.avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full border border-[#a67c52] object-cover shadow" />
          )}
          <div>
            <div className="flex items-center gap-2">
              {isEditingUsername ? ("""

target_name = """              <h1 className="text-2xl font-bold tracking-tighter text-[#a67c52] uppercase">Bem-vindo, {userData?.username}</h1>"""

replacement_name = """              <h1 
                className={`text-2xl font-bold tracking-tighter uppercase ${userData?.profile?.font || ''}`}
                style={{ color: userData?.profile?.color || '#a67c52', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
              >
                Bem-vindo, {userData?.username}
              </h1>"""

content = content.replace(target, replacement)
content = content.replace(target_name, replacement_name)

# Make buttons relative z-10 so they are clickable
target_buttons = """        </div>
        <div className="flex gap-4">"""

replacement_buttons = """          </div>
        </div>
        <div className="flex gap-4 relative z-10">"""

content = content.replace(target_buttons, replacement_buttons)

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(content)
print("done")
