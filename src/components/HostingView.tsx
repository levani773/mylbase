import React from 'react';
import { 
  Globe, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  GitBranch,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { PageHeader } from './PageHeader';

export const HostingView: React.FC = () => {
  const deployments = [
    { version: 'v1.4.2', time: '1 hour ago', status: 'Live', branch: 'main', url: 'aura-app-f92.web.app' },
    { version: 'v1.4.1', time: '2 days ago', status: 'Reverted', branch: 'main', url: 'aura-app-old.web.app' },
    { version: 'v1.4.0', time: '4 days ago', status: 'Archived', branch: 'feat/new-ui', url: 'preview-feat-ui.web.app' },
  ];

  return (
    <div className="space-y-6 animate-in slide-in-from-left-4 duration-500">
      <PageHeader 
        title="Hosting" 
        subtitle="Secure and fast global content delivery network for your web apps"
        action={
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20">
            <Zap className="w-4 h-4" />
            Connect Custom Domain
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
           <div className="bg-[#111116] border border-[#1F1F23] rounded-2xl overflow-hidden shadow-xl">
              <div className="p-6 bg-[#16161C] border-b border-[#1F1F23] flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                       <Globe className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                       <h3 className="text-white font-bold text-lg">Current Deployment</h3>
                       <p className="text-zinc-500 text-xs">Serving globally on 154 edge nodes</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">
                       <CheckCircle2 className="w-3 h-3" />
                       Running
                    </span>
                 </div>
              </div>
              <div className="p-8 flex items-center justify-between group cursor-pointer hover:bg-blue-600/[0.02] transition-all">
                 <div className="space-y-1">
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Site URL</p>
                    <div className="text-2xl font-bold text-white flex items-center gap-2">
                       aura-app-f92.web.app
                       <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-blue-400 transition-colors" />
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Modified</p>
                    <p className="text-zinc-200">1 hour ago by Levani Ch.</p>
                 </div>
              </div>
           </div>

           <div className="bg-[#111116] border border-[#1F1F23] rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 bg-[#16161C] border-b border-[#1F1F23]">
                 <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Deployment History</h4>
              </div>
              <div className="divide-y divide-[#1F1F23]">
                 {deployments.map((d, i) => (
                   <div key={i} className="p-4 flex items-center justify-between hover:bg-zinc-800/10 transition-all">
                      <div className="flex items-center gap-4">
                         <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500">
                            <GitBranch className="w-4 h-4" />
                         </div>
                         <div>
                            <p className="text-sm font-medium text-white">{d.version}</p>
                            <p className="text-[10px] text-zinc-500 font-mono">{d.url}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-8">
                         <div className="text-right">
                            <p className="text-xs text-zinc-400">{d.time}</p>
                            <p className="text-[10px] text-zinc-600">{d.branch}</p>
                         </div>
                         <span className={`text-[10px] font-bold px-2 py-0.5 rounded border border-${d.status === 'Live' ? 'emerald' : 'zinc'}-500/20 text-${d.status === 'Live' ? 'emerald' : 'zinc'}-500 bg-${d.status === 'Live' ? 'emerald' : 'zinc'}-500/10`}>
                           {d.status}
                         </span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-gradient-to-br from-indigo-900/40 to-blue-900/40 border border-blue-500/20 p-6 rounded-2xl shadow-xl">
              <ShieldCheck className="w-8 h-8 text-blue-400 mb-4" />
              <h4 className="text-white font-bold text-base mb-2">Automated SSL</h4>
              <p className="text-xs text-blue-200/60 leading-relaxed mb-4">Every deployment gets a free SSL certificate automatically provisioned and renewed by AuraDB.</p>
              <button className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-white transition-colors">Documentation &rarr;</button>
           </div>
           
           <div className="bg-[#111116] border border-[#1F1F23] p-6 rounded-2xl">
              <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Fast Stats</h5>
              <div className="space-y-4">
                 <div>
                    <div className="flex justify-between text-[10px] font-bold mb-1.5 uppercase tracking-wider">
                       <span className="text-zinc-500">Bandwidth Used</span>
                       <span className="text-white">4.2 GB / 10 GB</span>
                    </div>
                    <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-600 w-[42%]"></div>
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-[10px] font-bold mb-1.5 uppercase tracking-wider">
                       <span className="text-zinc-500">Global Uptime</span>
                       <span className="text-white">99.98%</span>
                    </div>
                    <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-600 w-[99.9%]"></div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
