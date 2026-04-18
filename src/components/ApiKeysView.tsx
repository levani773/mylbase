import React, { useState, useEffect } from 'react';
import { Key, Plus, Trash2, Copy, Check, ShieldCheck, Loader2 } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { ApiKey } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export const ApiKeysView: React.FC = () => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/apikeys');
      const data = await res.json();
      setKeys(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    const name = prompt("Name for this API Key (e.g., Mobile App):", "Digital Plant App");
    if (!name) return;

    try {
      setIsCreating(true);
      const res = await fetch('/api/apikeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        fetchKeys();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this API key?")) return;
    try {
      const res = await fetch(`/api/apikeys/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setKeys(keys.filter(k => k.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    Navigator.prototype.clipboard ? navigator.clipboard.writeText(text) : console.log(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-700">
      <PageHeader 
        title="Access & API Keys" 
        subtitle="Manage secure tokens for external application integration"
        action={
          <button 
            onClick={handleCreate}
            disabled={isCreating}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-blue-600/20"
          >
            {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Generate New Key
          </button>
        }
      />

      <div className="grid gap-4">
        <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl flex items-start gap-4 mb-4">
          <div className="bg-blue-500/20 p-2 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-1">Security Enforcement</h4>
            <p className="text-xs text-zinc-500 max-w-2xl leading-relaxed">
              These keys grant full access to your AuraDB instance. Never expose them in public repositories.
              All requests using these keys are logged in real-time.
            </p>
          </div>
        </div>

        <AnimatePresence>
          {keys.map((key) => (
            <motion.div 
              key={key.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0F0F12] border border-[#1F1F23] p-4 rounded-xl flex items-center justify-between group hover:border-[#2F2F37] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#1A1A20] rounded-lg flex items-center justify-center">
                  <Key className="w-5 h-5 text-zinc-500 group-hover:text-blue-500 transition-colors" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">{key.name}</h3>
                  <div className="flex items-center gap-3">
                    <code className="text-[10px] font-mono text-zinc-400 bg-black/40 px-2 py-0.5 rounded border border-[#1F1F23]">
                      {key.key.replace(/(.{10}).+/, '$1****************')}
                    </code>
                    <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">Created: {key.created}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => copyToClipboard(key.key, key.id)}
                  className="p-2 hover:bg-[#1A1A20] rounded-lg text-zinc-500 hover:text-white transition-all flex items-center gap-2"
                >
                  {copiedId === key.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  <span className="text-[10px] font-bold uppercase">{copiedId === key.id ? 'Copied' : 'Copy Key'}</span>
                </button>
                <button 
                  onClick={() => handleDelete(key.id)}
                  className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-600 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {keys.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-[#1F1F23] rounded-2xl">
            <Key className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
            <h3 className="text-white font-bold mb-1">No API Keys Generated</h3>
            <p className="text-zinc-500 text-xs">Create a key to grant external applications access to your database.</p>
          </div>
        )}
      </div>
    </div>
  );
};
