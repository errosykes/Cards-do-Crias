import React from "react";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './lib/sound';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import GameBoard from './pages/GameBoard';

function PrivateRoute({ children, requireAdmin }: { children: React.ReactNode, requireAdmin?: boolean }) {
  const { currentUser, userData, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">Loading...</div>;
  if (!currentUser) return <Navigate to="/login" />;
  if (requireAdmin && userData?.role !== 'admin') return <Navigate to="/" />;

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="h-full min-h-screen bg-[#0f0e0c] text-[#d4c3a1] font-serif selection:bg-[#a67c52]/30 flex flex-col flex-1 overflow-auto">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute requireAdmin><AdminPanel /></PrivateRoute>} />
            <Route path="/game/:gameId" element={<PrivateRoute><GameBoard /></PrivateRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}
