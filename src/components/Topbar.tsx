import React from 'react';
import { Search, Bell, HelpCircle } from 'lucide-react';

export const Topbar: React.FC = () => {
  return (
    <header className="h-16 border-b border-[#1F1F23] bg-[#0A0A0C] flex items-center justify-between px-8 sticky top-0 z-10 backdrop-blur-md bg-opacity-80">
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
        <button className="p-2 text-zinc-400 hover:text-white relative transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#0A0A0C]"></span>
        </button>
        <div className="h-8 w-px bg-[#1F1F23] mx-2"></div>
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-white">Levani Ch.</p>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">Pro Tier</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border border-blue-500/30 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-blue-900/20">
            LC
          </div>
        </div>
      </div>
    </header>
  );
};
