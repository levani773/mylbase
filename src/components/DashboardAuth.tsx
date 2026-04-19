import React, { useState, useEffect } from 'react';
import { Database, Lock, Mail, UserPlus, LogIn, Loader2, Github, Chrome } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthProps {
  onLogin: (user: any) => void;
}

export const DashboardAuth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle Google Login
  const handleGoogleLogin = async () => {
    try {
      const response = await fetch('/api/auth/google/url');
      if (!response.ok) throw new Error('Failed to get auth URL');
      const { url } = await response.json();

      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      window.open(
        url,
        'google_oauth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
    } catch (err: any) {
      setError('Google Sign-In failed to initialize');
    }
  };

  // Handle GitHub Login
  const handleGithubLogin = async () => {
    try {
      const response = await fetch('/api/auth/github/url');
      if (!response.ok) throw new Error('Failed to get auth URL');
      const { url } = await response.json();

      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      window.open(
        url,
        'github_oauth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
    } catch (err: any) {
      setError('GitHub Sign-In failed to initialize');
    }
  };

  // Listen for OAuth Success Messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS' || event.data?.type === 'GITHUB_AUTH_SUCCESS') {
        const user = event.data.user;
        localStorage.setItem('aura_admin_user', JSON.stringify(user));
        onLogin(user);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/dashboard/login' : '/api/dashboard/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('aura_admin_user', JSON.stringify(data));
      onLogin(data);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060608] flex items-center justify-center p-4 selection:bg-blue-500/30 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.05),transparent_50%)]"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[#0A0A0C] border border-[#1F1F23] rounded-3xl p-10 shadow-2xl shadow-black ring-1 ring-white/10">
          <div className="flex justify-center mb-10">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-600/30 ring-4 ring-blue-600/10 active:scale-95 transition-transform cursor-pointer">
              <Database className="w-10 h-10 text-white" />
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
              {isLogin ? 'Welcome back' : 'Create Platform'}
            </h1>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-[280px] mx-auto">
              Initialize and manage your high-performance AuraDB infrastructure.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 text-center block">Admin Identity</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@aura.db"
                  required
                  className="w-full bg-[#111116] border border-[#1F1F23] rounded-2xl py-3.5 pl-12 pr-4 text-sm text-zinc-300 focus:outline-none focus:border-blue-600/50 focus:ring-1 focus:ring-blue-600/20 transition-all font-medium placeholder:text-zinc-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 text-center block">Platform Secret</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  className="w-full bg-[#111116] border border-[#1F1F23] rounded-2xl py-3.5 pl-12 pr-4 text-sm text-zinc-300 focus:outline-none focus:border-blue-600/50 focus:ring-1 focus:ring-blue-600/20 transition-all font-medium placeholder:text-zinc-700"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-[11px] font-medium text-center py-3 bg-red-400/5 border border-red-400/10 rounded-xl px-4"
              >
                {error}
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  {isLogin ? 'Access Console' : 'Initialize Account'}
                </>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1F1F23]"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em]">
              <span className="bg-[#0A0A0C] px-4 text-zinc-600 font-bold">Protocol OAuth</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-3 bg-[#111116] border border-[#1F1F23] hover:border-zinc-700 rounded-2xl py-3 text-xs font-bold text-zinc-400 transition-all hover:bg-white/5 active:scale-95"
            >
              <Chrome className="w-4 h-4 text-blue-500" /> Google
            </button>
            <button 
              onClick={handleGithubLogin}
              className="flex items-center justify-center gap-3 bg-[#111116] border border-[#1F1F23] hover:border-zinc-700 rounded-2xl py-3 text-xs font-bold text-zinc-400 transition-all hover:bg-white/5 active:scale-95"
            >
              <Github className="w-4 h-4 text-white" /> GitHub
            </button>
          </div>

          <div className="mt-10 pt-10 border-t border-[#1F1F23]">
            <p className="text-center text-xs text-zinc-500">
              {isLogin ? "New to AuraDB?" : "Already managed?"}
              <button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="ml-2 text-blue-500 hover:text-blue-400 font-bold underline underline-offset-4"
              >
                {isLogin ? 'Create Admin Account' : 'Sign in to Console'}
              </button>
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center flex flex-col items-center gap-4">
          <div className="px-4 py-1.5 bg-zinc-900/50 border border-zinc-800 rounded-full text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            System Status: Operational
          </div>
          <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
            Initial Secret: <span className="text-zinc-500 font-mono lower-case">admin123</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
