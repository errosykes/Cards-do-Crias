import React, { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ChatMessage } from '../types';

interface Props {
  gameId: string;
  myUid: string;
  myName: string;
  messages: ChatMessage[];
  onClose: () => void;
}

export function ChatPanel({ gameId, myUid, myName, messages, onClose }: Props) {
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      senderId: myUid,
      senderName: myName,
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    setText('');

    await updateDoc(doc(db, 'games', gameId), {
      chatMessages: arrayUnion(newMessage)
    });
  };

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-[#141210] border-l border-[#3d3326] flex flex-col z-50 shadow-2xl">
      <div className="p-3 border-b border-[#3d3326] flex items-center justify-between bg-[#1a1814]">
        <h3 className="text-[#a67c52] font-bold uppercase tracking-widest text-xs">Chat</h3>
        <button onClick={onClose} className="text-[#d4c3a1]/60 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar flex flex-col">
        {messages.length === 0 ? (
          <div className="text-center text-[#d4c3a1]/40 text-xs my-auto">
            Nenhuma mensagem. Comece a conversar!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === myUid;
            return (
              <div key={msg.id} className={`flex flex-col max-w-[85%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                <span className="text-[9px] text-[#d4c3a1]/50 mb-0.5">{msg.senderName}</span>
                <div className={`p-2 rounded text-sm ${isMe ? 'bg-[#a67c52] text-[#141210]' : 'bg-[#2a241c] text-[#d4c3a1]'}`}>
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <div className="p-3 border-t border-[#3d3326] bg-[#1a1814]">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Digite uma mensagem..."
            className="flex-1 bg-black/50 border border-[#3d3326] rounded px-3 py-1.5 text-sm text-[#d4c3a1] focus:outline-none focus:border-[#a67c52]"
          />
          <button type="submit" disabled={!text.trim()} className="p-1.5 bg-[#3d3326] hover:bg-[#a67c52] text-[#d4c3a1] hover:text-[#141210] rounded transition-colors disabled:opacity-50 disabled:grayscale">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
