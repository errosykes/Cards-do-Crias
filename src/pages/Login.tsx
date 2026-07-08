import React from "react";
import { useState } from 'react';
import { auth } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Swords } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isMasterLogin, setIsMasterLogin] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleMasterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (masterPassword === '27592457k') {
      try {
        await signInWithEmailAndPassword(auth, 'adm@admin.com', '27592457k');
        navigate('/');
      } catch (err: any) {
        try {
          await createUserWithEmailAndPassword(auth, 'adm@admin.com', '27592457k');
          navigate('/');
        } catch (err2: any) {
          setError('Erro ao criar conta master.');
        }
      }
    } else {
      setError('Senha master incorreta.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    let authEmail = email;
    if (email.trim().toUpperCase() === 'ADM') {
      authEmail = 'adm@admin.com';
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, authEmail, password);
      } else {
        await createUserWithEmailAndPassword(auth, authEmail, password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0e0c] p-4 font-serif">
      <div className="w-full max-w-md bg-[#1a1814] border border-[#3d3326] rounded-xl p-8 shadow-2xl relative">
        {!isMasterLogin && (
          <button 
            onClick={() => setIsMasterLogin(true)} 
            className="absolute top-4 right-4 text-[10px] font-sans uppercase tracking-widest text-[#a67c52]/70 hover:text-[#a67c52] transition-colors"
          >
            Login Master
          </button>
        )}
        
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[#a67c52]/10 p-3 rounded-full mb-4 border border-[#a67c52]/30">
            <Swords className="w-8 h-8 text-[#a67c52]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tighter text-[#a67c52] uppercase">Os Cria Cards</h1>
          <p className="text-[#d4c3a1]/60 text-sm mt-1 uppercase tracking-widest text-[10px]">Entre no campo de batalha</p>
        </div>

        {isMasterLogin ? (
          <form onSubmit={handleMasterSubmit} className="space-y-4 font-sans">
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#a67c52] mb-1">Senha Master</label>
              <input
                type="password"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                className="w-full bg-black/50 border border-[#3d3326] rounded px-4 py-2 text-[#d4c3a1] focus:outline-none focus:border-[#a67c52]"
                required
              />
            </div>
            
            {error && <p className="text-red-500 text-xs">{error}</p>}
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-900 to-[#805e3b] hover:from-red-800 hover:to-[#a67c52] text-white font-bold py-2 rounded shadow-lg border border-red-900/50 uppercase text-xs transition-colors mt-4"
            >
              Entrar como Master
            </button>
            <button
              type="button"
              onClick={() => { setIsMasterLogin(false); setError(''); }}
              className="w-full bg-transparent hover:bg-white/5 text-[#a67c52] font-bold py-2 rounded border border-[#3d3326] uppercase text-xs transition-colors mt-2"
            >
              Voltar
            </button>
          </form>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4 font-sans">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#a67c52] mb-1">Email ou Login</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/50 border border-[#3d3326] rounded px-4 py-2 text-[#d4c3a1] focus:outline-none focus:border-[#a67c52]"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#a67c52] mb-1">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-[#3d3326] rounded px-4 py-2 text-[#d4c3a1] focus:outline-none focus:border-[#a67c52]"
                  required
                />
              </div>

              {error && <p className="text-red-500 text-xs">{error}</p>}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#a67c52] to-[#805e3b] hover:from-[#e2b17a] hover:to-[#a67c52] text-black font-bold py-2 rounded shadow-lg border border-[#e2b17a] uppercase text-xs transition-colors mt-4"
              >
                {isLogin ? 'Entrar' : 'Criar Conta'}
              </button>
            </form>

            <div className="mt-4 font-sans flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="h-px bg-[#3d3326] flex-1"></div>
                <span className="text-[10px] uppercase text-[#a67c52]/50 font-bold">OU</span>
                <div className="h-px bg-[#3d3326] flex-1"></div>
              </div>
              
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full bg-white text-black hover:bg-gray-200 font-bold py-2 rounded shadow-lg uppercase text-xs transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Entrar com Google
              </button>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-[10px] font-sans uppercase tracking-widest text-[#a67c52]/70 hover:text-[#a67c52] transition-colors"
              >
                {isLogin ? "Não tem uma conta? Cadastre-se" : "Já tem uma conta? Entre"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
