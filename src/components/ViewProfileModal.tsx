import React from 'react';
import { User } from '../types';
import { X, Trophy } from 'lucide-react';
import { HistoryModal } from './HistoryModal';

interface Props {
  user: User;
  onClose: () => void;
}

export function ViewProfileModal({ user, onClose }: Props) {
  const [showHistory, setShowHistory] = React.useState(false);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 font-serif">
      <div className="bg-[#1a1814] border-2 border-[#3d3326] w-full max-w-lg rounded-xl overflow-hidden shadow-2xl relative">
        <button 
           onClick={onClose}
           className="absolute top-2 right-2 p-2 bg-black/50 text-[#d4c3a1] hover:text-white rounded-full z-20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Cover */}
        <div className="h-40 w-full bg-[#0f0e0c] relative border-b-2 border-[#3d3326]">
          {user.profile?.coverUrl && (
            <img src={user.profile.coverUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
          )}
        </div>

        {/* Info */}
        <div className="px-6 pb-6 relative">
          <div className="flex justify-between items-end -mt-10 mb-4 relative z-10">
             {user.profile?.avatarUrl ? (
                <img src={user.profile.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-[#1a1814] object-cover shadow-lg bg-[#3d3326]" />
             ) : (
                <div className="w-24 h-24 rounded-full bg-[#3d3326] border-4 border-[#1a1814] flex items-center justify-center font-bold text-3xl shadow-lg">?</div>
             )}
             
             <button 
                onClick={() => setShowHistory(true)}
                className="mb-2 flex items-center gap-2 px-4 py-2 bg-[#3d3326] hover:bg-[#a67c52] text-[#d4c3a1] hover:text-[#141210] rounded uppercase font-bold text-xs transition-colors"
             >
                <Trophy className="w-4 h-4" /> Histórico
             </button>
          </div>
          
          <h2 
            className={`text-3xl uppercase tracking-widest ${user.profile?.font || 'font-sans'}`}
            style={{ color: user.profile?.color || '#d4c3a1', fontWeight: 'bold' }}
          >
            {user.username}
          </h2>
          
          <div className="mt-6 space-y-4">
             <div className="grid grid-cols-2 gap-4">
               <div className="bg-[#0f0e0c] border border-[#3d3326] rounded p-4 text-center">
                 <div className="text-xs text-[#d4c3a1]/60 uppercase font-bold mb-1">Cartas</div>
                 <div className="text-2xl font-black text-[#e2b17a]">{user.inventory?.length || 0}</div>
               </div>
               <div className="bg-[#0f0e0c] border border-[#3d3326] rounded p-4 text-center">
                 <div className="text-xs text-[#d4c3a1]/60 uppercase font-bold mb-1">Amigos</div>
                 <div className="text-2xl font-black text-[#e2b17a]">{user.friends?.length || 0}</div>
               </div>
             </div>
          </div>
        </div>
      </div>
      
      {showHistory && (
         <div className="fixed inset-0 z-[60]">
            <HistoryModal userData={user} onClose={() => setShowHistory(false)} />
         </div>
      )}
    </div>
  );
}
