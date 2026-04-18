import React from 'react';
import { Package, Copy, CheckCircle2, Terminal, Code2 } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { useState } from 'react';

export const SDKView: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const sdkCode = `import { AuraDB } from 'auradb-sdk';

const aura = new AuraDB({
  projectId: "aura-db-demo",
  apiKey: "aura_pk_live_8291...391"
});

// Real-time listener
aura.collection('users').onSnapshot((snapshot) => {
  console.log("Real-time users:", snapshot.docs);
});

// Storage upload
await aura.storage().upload('images/logo.png', file);`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sdkCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <PageHeader 
        title="AuraDB SDK" 
        subtitle="Connect your frontend applications to the AuraDB engine"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-[#111116] border border-[#1F1F23] rounded-2xl p-6 space-y-4 shadow-xl">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center">
                   <Package className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-white font-bold">NPM Installation</h3>
                  <p className="text-xs text-zinc-500">Add the AuraDB client to your project</p>
                </div>
             </div>
             
             <div className="bg-[#0B0B0F] border border-[#1F1F23] rounded-lg p-3 font-mono text-sm flex items-center justify-between group">
                <span className="text-blue-400">npm install <span className="text-white">auradb-sdk</span></span>
                <Terminal className="w-4 h-4 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
             </div>
          </div>

          <div className="bg-[#111116] border border-[#1F1F23] rounded-2xl p-6 space-y-4 shadow-xl">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/10 flex items-center justify-center">
                   <Code2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Quick Start</h3>
                  <p className="text-xs text-zinc-500">Initialize and connect in seconds</p>
                </div>
             </div>
             
             <div className="relative group">
                <pre className="bg-[#0B0B0F] border border-[#1F1F23] rounded-xl p-6 font-mono text-[11px] leading-relaxed text-blue-300/80 overflow-x-auto whitespace-pre">
                   {sdkCode}
                </pre>
                <button 
                  onClick={handleCopy}
                  className="absolute top-4 right-4 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all text-zinc-400 hover:text-white"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
             </div>
          </div>
        </div>

        <div className="bg-[#111116] border border-[#1F1F23] rounded-2xl p-8 space-y-6 shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
           <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">AuraDB Environment</h3>
           <div className="space-y-6">
              <div className="space-y-1">
                 <div className="text-xs text-zinc-400">Project ID</div>
                 <div className="text-sm text-white font-mono bg-[#1A1A22] border border-[#2F2F37] px-3 py-2 rounded">aura-db-demo</div>
              </div>
              <div className="space-y-1">
                 <div className="text-xs text-zinc-400">API Key</div>
                 <div className="text-sm text-white font-mono bg-[#1A1A22] border border-[#2F2F37] px-3 py-2 rounded truncate">aura_pk_live_8291f0...391a0b</div>
              </div>
              <div className="space-y-1">
                 <div className="text-xs text-zinc-400">API Endpoint</div>
                 <div className="text-sm text-white font-mono bg-[#1A1A22] border border-[#2F2F37] px-3 py-2 rounded">https://api.aura.db/v1</div>
              </div>
           </div>

           <div className="pt-6 border-t border-[#1F1F23] flex items-center gap-2 text-blue-500 text-xs font-medium cursor-pointer hover:underline">
              Download Credentials JSON
           </div>
        </div>
      </div>
    </div>
  );
};
