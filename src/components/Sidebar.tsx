import React from 'react';
import { 
  Users, 
  Database, 
  HardDrive, 
  Globe, 
  Code2, 
  BarChart3, 
  Settings,
  ChevronRight,
  Zap,
  Package,
  Key
} from 'lucide-react';
import { Service } from '../types';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeService: Service;
  onServiceChange: (service: Service) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeService, onServiceChange }) => {
  const menuItems = [
    { id: 'auth', label: 'Authentication', icon: Users },
    { id: 'firestore', label: 'Firestore', icon: Database },
    { id: 'rules', label: 'Security Rules', icon: Settings },
    { id: 'storage', label: 'Storage', icon: HardDrive },
    { id: 'hosting', label: 'Hosting', icon: Globe },
    { id: 'functions', label: 'Functions', icon: Code2 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'sdk', label: 'Aura SDK', icon: Package },
    { id: 'apikeys', label: 'API Keys', icon: Key },
  ];

  return (
    <aside className="w-64 bg-[#0F0F12] border-r border-[#1F1F23] flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
          <Zap className="w-5 h-5 text-white fill-white" />
        </div>
        <span className="font-bold text-lg tracking-tight text-white">AuraDB</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        <p className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Build</p>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onServiceChange(item.id as Service)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200",
              activeService === item.id
                ? "bg-blue-600/10 text-blue-400 font-medium border border-blue-600/20 shadow-sm shadow-blue-900/10"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            )}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
            {activeService === item.id && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-[#1F1F23]">
        <button 
          onClick={() => onServiceChange('settings')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200",
            activeService === 'settings'
              ? "bg-blue-600/10 text-blue-400 font-medium border border-blue-600/20 shadow-sm shadow-blue-900/10"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
          )}
        >
          <Settings className="w-4 h-4" />
          <span>Project Settings</span>
        </button>
      </div>
    </aside>
  );
};
