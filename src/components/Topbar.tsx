import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, HelpCircle, LogOut, Settings, User, Shield, CreditCard, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Service } from '../types';

interface TopbarProps {
  onNavigate: (service: Service) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onNavigate }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 border-b border-[#1F1F23] bg-[#0A0A0C] flex items-center justify-between px-8 sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
      <div className="flex items-center flex-1 max-w-xl">
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-600 mr-8">
           <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              Region: US-EAST1
           </div>
           <div className="w-1 h-1 bg-zinc-800 rounded-full"></div>
           <div className="text-blue-500/80">Env: Production</div>
        </div>
        <div className="relative w-full group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search documentation, databases, or help..."
            className="w-full bg-[#16161A] border border-[#1F1F23] rounded-lg py-2 pl-10 pr-4 text-sm text-zinc-300 focus:outline-none focus:border-blue-600/50 focus:ring-1 focus:ring-blue-600/20 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-zinc-400 hover:text-white transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>
        
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`p-2 transition-colors relative rounded-lg ${isNotificationsOpen ? 'bg-white/5 text-white' : 'text-zinc-400 hover:text-white'}`}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#0A0A0C]"></span>
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute right-0 mt-2 w-80 bg-[#16161A] border border-[#1F1F23] rounded-xl shadow-2xl overflow-hidden z-50 shadow-black/50"
              >
                <div className="p-4 border-b border-[#1F1F23] flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">Notifications</h3>
                  <button className="text-[10px] text-blue-400 hover:text-blue-300 font-medium">Mark all as read</button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {[
                    { title: 'Security Alert', desc: 'New API Key created for "Production-Main"', time: '2m ago', icon: Shield, color: 'text-amber-400' },
                    { title: 'Build Success', desc: 'AuraDB Functions successfully deployed', time: '1h ago', icon: Shield, color: 'text-emerald-400' },
                    { title: 'Usage Update', desc: 'You have reached 80% of your Firestore monthly quota', time: '12h ago', icon: CreditCard, color: 'text-blue-400' },
                  ].map((n, i) => (
                    <div key={i} className="p-4 hover:bg-white/5 border-b border-[#1F1F23] last:border-0 transition-colors cursor-pointer group">
                      <div className="flex gap-3">
                        <div className={`mt-1 ${n.color}`}>
                          <n.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[13px] font-medium text-white mb-0.5 group-hover:text-blue-400 transition-colors">{n.title}</div>
                          <div className="text-xs text-zinc-500 leading-relaxed">{n.desc}</div>
                          <div className="text-[10px] text-zinc-600 mt-2 font-mono uppercase">{n.time}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full py-3 bg-[#1F1F23]/50 hover:bg-[#1F1F23] text-[11px] font-bold text-zinc-400 uppercase tracking-widest transition-colors">
                  View All Activity
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-8 w-px bg-[#1F1F23] mx-2"></div>
        
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`flex items-center gap-3 pl-2 py-1.5 pr-2 rounded-xl transition-all ${isProfileOpen ? 'bg-white/5' : 'hover:bg-white/5'}`}
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white">Levani Ch.</p>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">Pro Tier</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border border-blue-500/30 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-blue-900/20 group-hover:scale-105 transition-transform">
              LC
            </div>
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute right-0 mt-2 w-64 bg-[#16161A] border border-[#1F1F23] rounded-xl shadow-2xl overflow-hidden z-50 shadow-black/50"
              >
                <div className="p-4 border-b border-[#1F1F23] bg-gradient-to-br from-zinc-800/20 to-transparent">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">LC</div>
                    <div>
                      <div className="text-sm font-bold text-white">Levani Ch.</div>
                      <div className="text-[11px] text-zinc-500">levani773@gmail.com</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      onNavigate('settings');
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg group cursor-pointer hover:bg-blue-500/20 transition-all"
                  >
                    <div className="flex items-center gap-2">
                       <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                       <span className="text-[10px] font-bold text-blue-100 uppercase tracking-wider">Upgrade to Enterprise</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                <div className="p-2">
                  {[
                    { label: 'Profile Settings', icon: User, action: () => onNavigate('settings') },
                    { label: 'Organization Settings', icon: Settings, action: () => onNavigate('settings') },
                    { label: 'Subscription & Billing', icon: CreditCard, action: () => onNavigate('settings') },
                    { label: 'Security & Access', icon: Shield, action: () => onNavigate('settings') },
                  ].map((item, i) => (
                    <button 
                      key={i} 
                      onClick={() => {
                        item.action();
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all text-sm group"
                    >
                      <item.icon className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>

                <div className="p-2 border-t border-[#1F1F23]">
                  <button 
                    onClick={() => {
                      alert('Logging out of AuraDB...');
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all text-sm group"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
