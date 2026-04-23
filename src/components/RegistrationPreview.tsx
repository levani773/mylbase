import React, { useState } from 'react';
import { Mail, User, Lock, Chrome, Info, CheckCircle2, ChevronRight, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useToast } from './Toast';

export const RegistrationPreview: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate registration using our own Auth API
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: 'u_' + Math.random().toString(36).substr(2, 9),
          email: formData.email,
          provider: 'password',
          created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          lastLogin: 'Just now'
        })
      });

      if (res.ok) {
        success('რეგისტრაცია წარმატებულია', `${formData.name}, თქვენი ანგარიში AuraDB-ში გააქტიურებულია!`);
        setFormData({ name: '', email: '', password: '' });
      } else {
        throw new Error();
      }
    } catch (err) {
      error('შეცდომა', 'რეგისტრაციის დროს დაფიქსირდა ხარვეზი.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[#16161A] border border-[#1F1F23] rounded-[2rem] overflow-hidden shadow-2xl shadow-black">
      <div className="p-8 pb-4 flex flex-col items-center text-center">
        <div className="w-full flex justify-end mb-2">
          <X className="w-5 h-5 text-zinc-600 cursor-not-allowed hover:text-zinc-400" />
        </div>
        <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">რეგისტრაცია</h2>
        <p className="text-blue-400/60 text-sm font-medium uppercase tracking-widest mb-8">შემოგვიერთდით დღესვე</p>

        {/* Warning/Info Box - AuraDB Styled */}
        <div className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 mb-8 text-left flex gap-3">
          <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide leading-relaxed">
              AuraDB-ის ავტორიზაცია გააქტიურებულია.
            </p>
            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-tighter mt-1">
               თქვენი მონაცემები უსაფრთხოდ შეინახება AuraDB Cloud-ში.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
            <input 
              required
              type="text" 
              placeholder="სახელი"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#0A0A0C] border border-[#2F2F37] rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all font-medium placeholder:text-zinc-700"
            />
          </div>

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
            <input 
              required
              type="email" 
              placeholder="ელ-ფოსტა"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-[#0A0A0C] border border-[#2F2F37] rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all font-medium placeholder:text-zinc-700"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
            <input 
              required
              type="password" 
              placeholder="პაროლი"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-[#0A0A0C] border border-[#2F2F37] rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all font-medium placeholder:text-zinc-700"
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-900/10 active:scale-95 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <User className="w-5 h-5" />}
            რეგისტრაცია
          </button>
        </form>

        <div className="w-full flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-zinc-800"></div>
          <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">ან</span>
          <div className="flex-1 h-px bg-zinc-800"></div>
        </div>

        <button className="w-full py-3.5 bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-900 rounded-2xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl shadow-black/10">
          <Chrome className="w-5 h-5 text-blue-500" />
          Google-ით შესვლა
        </button>

        <div className="mt-10 mb-4">
          <button className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 uppercase tracking-widest flex items-center gap-1 transition-all">
            უკვე გაქვთ ანგარიში? შესვლა
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
