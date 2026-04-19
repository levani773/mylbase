import React, { useState } from 'react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate API call to register/login
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const user = {
        name: email.split('@')[0],
        email: email,
        initials: email.substring(0, 2).toUpperCase(),
        tier: 'Pro Tier'
      };

      localStorage.setItem('aura_admin_user', JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      setError('Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060608] flex items-center justify-center p-4 selection:bg-blue-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.05),transparent_50%)]"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[#0A0A0C] border border-[#1F1F23] rounded-3xl p-8 shadow-2xl shadow-black">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Database className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              {isLogin ? 'Welcome back to AuraDB' : 'Join AuraDB Platform'}
            </h1>
            <p className="text-zinc-500 text-sm">
              The high-performance NoSQL engine for the modern web.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full bg-[#16161A] border border-[#1F1F23] rounded-xl py-3 pl-10 pr-4 text-sm text-zinc-300 focus:outline-none focus:border-blue-600/50 focus:ring-1 focus:ring-blue-600/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Secret Key</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#16161A] border border-[#1F1F23] rounded-xl py-3 pl-10 pr-4 text-sm text-zinc-300 focus:outline-none focus:border-blue-600/50 focus:ring-1 focus:ring-blue-600/20 transition-all"
                />
              </div>
            </div>

            {error && <div className="text-red-400 text-xs text-center py-2">{error}</div>}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  {isLogin ? 'Access Console' : 'Initialize Account'}
                </>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1F1F23]"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="bg-[#0A0A0C] px-4 text-zinc-600 font-bold">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 bg-[#16161A] border border-[#1F1F23] hover:border-zinc-700 rounded-xl py-2.5 text-xs font-bold text-zinc-400 transition-all">
              <Chrome className="w-4 h-4 text-emerald-500" /> Google
            </button>
            <button className="flex items-center justify-center gap-2 bg-[#16161A] border border-[#1F1F23] hover:border-zinc-700 rounded-xl py-2.5 text-xs font-bold text-zinc-400 transition-all">
              <Github className="w-4 h-4 text-white" /> GitHub
            </button>
          </div>

          <p className="text-center mt-8 text-xs text-zinc-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-blue-500 hover:text-blue-400 font-bold"
            >
              {isLogin ? 'Register now' : 'Log in instead'}
            </button>
          </p>
        </div>

        <div className="mt-8 flex justify-center gap-8 text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
          <a href="#" className="hover:text-zinc-500">Security</a>
          <a href="#" className="hover:text-zinc-500">API Status</a>
          <a href="#" className="hover:text-zinc-500">Documentation</a>
        </div>
      </motion.div>
    </div>
  );
};
