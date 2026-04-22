import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Users, 
  Database, 
  HardDrive, 
  ShieldCheck, 
  Code2, 
  TrendingUp, 
  Activity,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  Clock
} from 'lucide-react';
import { PageHeader } from './PageHeader';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface Stat {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: any;
  color: string;
}

export const DashboardView: React.FC<{ onNavigate: (service: any) => void }> = ({ onNavigate }) => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/analytics/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const dashboardStats: Stat[] = [
    { label: 'Active Users', value: '1,280', change: '+12%', trend: 'up', icon: Users, color: 'text-blue-400' },
    { label: 'DB Operations', value: stats?.totalRequests?.toLocaleString() || '0', change: '+24%', trend: 'up', icon: Database, color: 'text-emerald-400' },
    { label: 'Cloud Storage', value: '1.2 GB', change: '+0.4%', trend: 'up', icon: HardDrive, color: 'text-purple-400' },
    { label: 'Uptime', value: '99.99%', change: 'Stable', trend: 'up', icon: ShieldCheck, color: 'text-amber-400' },
  ];

  const quickLinks = [
    { id: 'firestore', label: 'Browse Data', icon: Database, desc: 'Manage NoSQL documents' },
    { id: 'storage', label: 'Asset Uplink', icon: HardDrive, desc: 'CDN binary management' },
    { id: 'functions', label: 'Cloud Logic', icon: Code2, desc: 'Serverless runtime engine' },
    { id: 'apikeys', label: 'Access Keys', icon: Zap, desc: 'API security management' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-blue-500 fill-blue-500/20" />
              Project Overview
           </h1>
           <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest">AuraDB Cloud Platform • aura-prod-01</p>
        </div>
        <div className="flex items-center gap-3 bg-[#111116] border border-[#1F1F23] px-4 py-2 rounded-xl">
           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
           <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Global Status: Online</span>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#111116] border border-[#1F1F23] p-6 rounded-2xl group hover:border-zinc-700 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2 bg-zinc-800 rounded-lg group-hover:scale-110 transition-transform", stat.color)}>
                 <stat.icon className="w-5 h-5" />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-[10px] font-black uppercase",
                stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500'
              )}>
                {stat.change}
                <ArrowUpRight className="w-3 h-3" />
              </div>
            </div>
            <div className="text-2xl font-black text-white tabular-nums mb-1">{stat.value}</div>
            <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Main Activity Chart Area */}
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#111116] border border-[#1F1F23] rounded-3xl p-8 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-3xl rounded-full -mr-32 -mt-32"></div>
               
               <div className="flex items-center justify-between mb-12">
                  <div>
                     <h3 className="text-white font-black uppercase tracking-widest text-[11px] mb-1">Traffic Analysis</h3>
                     <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest">Real-time throughput (Req/s)</p>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                     <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Last 24 Hours</span>
                     <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
               </div>

               <div className="h-64 flex items-end gap-2 group-hover:gap-3 transition-all duration-700">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-zinc-800/50 hover:bg-blue-600/50 transition-all rounded-t-sm"
                      style={{ height: `${Math.random() * 80 + 20}%` }}
                    />
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {quickLinks.map(link => (
                 <button 
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className="bg-[#111116] border border-[#1F1F23] p-6 rounded-2xl flex items-center gap-4 group hover:bg-blue-600/[0.03] hover:border-blue-500/30 transition-all text-left"
                 >
                    <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center group-hover:bg-blue-600/10 group-hover:scale-110 transition-all">
                       <link.icon className="w-5 h-5 text-zinc-500 group-hover:text-blue-500" />
                    </div>
                    <div className="flex-1">
                       <h4 className="text-sm font-bold text-zinc-200 uppercase tracking-tighter mb-0.5">{link.label}</h4>
                       <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">{link.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-800 group-hover:text-blue-500/50 group-hover:translate-x-1 transition-all" />
                 </button>
               ))}
            </div>
         </div>

         {/* Sidebar stats/info */}
         <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
               <Zap className="absolute top-4 right-4 w-12 h-12 text-white/10" />
               <h3 className="text-xl font-black uppercase leading-tight mb-4 tracking-tighter">Scale with<br />Expert Support</h3>
               <p className="text-blue-100/70 text-xs mb-8 font-medium leading-relaxed uppercase tracking-wider">Upgrade to Aura Global for multi-region clustering and 1ms latency guarantees.</p>
               <button className="w-full py-4 bg-white text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-100 transition-all shadow-xl active:scale-95">
                  Upgrade Tier
               </button>
            </div>

            <div className="bg-[#111116] border border-[#1F1F23] rounded-3xl p-6">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-6 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" /> Recent Infrastructure Events
               </h3>
               <div className="space-y-6">
                  {[
                    { time: '2m ago', event: 'New Storage Chunk Uploaded', sub: 'aura-prod-bk/assets' },
                    { time: '14m ago', event: 'Auth Token Refreshed', sub: 'admin@aura.db' },
                    { time: '1h ago', event: 'Rule Set Deployed (v24)', sub: 'production' },
                  ].map((log, i) => (
                    <div key={i} className="flex gap-4 group">
                       <div className="w-px bg-zinc-800 relative">
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                       </div>
                       <div className="pb-1">
                          <p className="text-[10px] font-black text-zinc-200 uppercase tracking-tight">{log.event}</p>
                          <p className="text-[9px] text-zinc-600 font-bold uppercase mt-1">{log.sub}</p>
                          <span className="text-[8px] font-mono text-zinc-800 uppercase mt-2 block">{log.time}</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
