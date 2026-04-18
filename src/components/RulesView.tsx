import React, { useState, useEffect } from 'react';
import { Shield, Save, Loader2, Info, CheckCircle2 } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { motion } from 'motion/react';

export const RulesView: React.FC = () => {
  const [rules, setRules] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await fetch('/api/rules');
      const data = await res.json();
      setRules(data.rules);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules })
      });
      if (res.ok) {
        setSaveStatus('Rules published successfully');
      } else {
        throw new Error('Failed to publish');
      }
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      setSaveStatus('Error: Failed to publish rules');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="Security Rules" 
        subtitle="Manage access control for your database and storage"
        action={
          <button 
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-lg active:scale-95"
          >
            <Save className="w-4 h-4" />
            Publish
          </button>
        }
      />

      <div className="flex-1 flex gap-6 min-h-0">
        <div className="flex-1 bg-[#111116] border border-[#1F1F23] rounded-2xl overflow-hidden flex flex-col shadow-2xl">
          <div className="p-3 border-b border-[#1F1F23] bg-[#16161C] flex justify-between items-center">
             <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                <Shield className="w-3.5 h-3.5 text-blue-500" />
                aura.rules
             </div>
             {saveStatus && (
               <motion.span 
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="text-[10px] text-emerald-500 flex items-center gap-1 font-bold"
               >
                 <CheckCircle2 className="w-3 h-3" />
                 {saveStatus}
               </motion.span>
             )}
          </div>
          <textarea 
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            className="flex-1 w-full bg-[#0B0B0F] p-8 font-mono text-sm leading-relaxed text-blue-300/80 outline-none resize-none scrollbar-thin scrollbar-thumb-zinc-800"
            spellCheck="false"
          />
        </div>

        <div className="w-80 space-y-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
          <div className="bg-blue-600/5 border border-blue-500/20 p-4 rounded-xl space-y-3 font-sans">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-widest">
              <Info className="w-3.5 h-3.5" />
              Quick Reference
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Rules allow you to define granular access control for your collections.
            </p>
            <div className="space-y-2">
               <div className="p-2 bg-[#1A1A22] border border-[#2F2F37] rounded text-[10px] font-mono text-zinc-500">
                  allow read: if request.auth != null;
               </div>
               <div className="p-2 bg-[#1A1A22] border border-[#2F2F37] rounded text-[10px] font-mono text-zinc-500">
                  allow write: if resource.data.ownerId == request.auth.uid;
               </div>
            </div>
          </div>
          
          <div className="bg-zinc-800/10 border border-zinc-800 p-4 rounded-xl space-y-3">
             <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic">AuraDB Simulator</div>
             <p className="text-[11px] text-zinc-500 italic">Simulator coming soon to test rules against mock events.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
