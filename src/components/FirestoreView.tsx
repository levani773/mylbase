import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  FileJson, 
  Search, 
  Plus, 
  ChevronRight, 
  MoreHorizontal,
  Code,
  Save,
  Loader2,
  DatabaseZap
} from 'lucide-react';
import { PageHeader } from './PageHeader';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { FirestoreCollection } from '../types';
import { io } from 'socket.io-client';

const socket = io();

export const FirestoreView: React.FC = () => {
  const [data, setData] = useState<FirestoreCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedColId, setSelectedColId] = useState<string>('');
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [jsonValue, setJsonValue] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchCollections();

    socket.on('aura_sync', (event) => {
      if (event.type === 'db_changed') {
        setData(event.data);
      }
    });

    return () => {
      socket.off('aura_sync');
    };
  }, []);

  const fetchCollections = async () => {
    try {
      const res = await fetch('/api/db/collections');
      const collections: FirestoreCollection[] = await res.json();
      setData(collections);
      if (collections.length > 0) {
        setSelectedColId(collections[0].id);
        if (collections[0].docs.length > 0) {
          setSelectedDocId(collections[0].docs[0].id);
          setJsonValue(JSON.stringify(collections[0].docs[0].data, null, 2));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedCol = data.find(c => c.id === selectedColId);
  const selectedDoc = selectedCol?.docs.find(d => d.id === selectedDocId);

  const handleDocSelect = (docId: string) => {
    setSelectedDocId(docId);
    if (!selectedCol) return;
    const doc = selectedCol.docs.find(d => d.id === docId)!;
    setJsonValue(JSON.stringify(doc.data, null, 2));
  };

  const handleSave = async () => {
    try {
      const parsed = JSON.parse(jsonValue);
      const newData = data.map(col => {
        if (col.id === selectedColId) {
          return {
            ...col,
            docs: col.docs.map(doc => {
              if (doc.id === selectedDocId) {
                return { ...doc, data: parsed };
              }
              return doc;
            })
          };
        }
        return col;
      });
      
      const res = await fetch('/api/db/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collections: newData })
      });

      if (res.ok) {
        setData(newData);
        setSaveStatus('Success: Changes committed to AuraDB Engine');
      } else {
        throw new Error('Failed to save to server');
      }
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (e) {
      setSaveStatus('Error: ' + (e instanceof Error ? e.message : 'Invalid JSON'));
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-700">
      <PageHeader 
        title="Firestore Database" 
        subtitle="NoSQL cloud database powered by the local AuraDB Engine"
      />

      <div className="flex-1 min-h-0 bg-[#0F0F12] border border-[#1F1F23] rounded-2xl overflow-hidden flex shadow-2xl shadow-black/40">
        {/* Collections */}
        <div className="w-1/4 border-r border-[#1F1F23] flex flex-col bg-[#111116]">
          <div className="p-3 border-b border-[#1F1F23] flex items-center justify-between text-zinc-500 uppercase tracking-widest font-black text-[9px]">
            Collections
            <Plus className="w-3 h-3 cursor-pointer hover:text-white" />
          </div>
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-600" />
              <input 
                type="text" 
                placeholder="Filter collections..." 
                className="w-full bg-[#1A1A20] border border-[#2F2F37] rounded-md py-1 pl-8 text-xs text-zinc-400 focus:outline-none focus:border-blue-600/50"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {data.map(col => (
              <button
                key={col.id}
                onClick={() => {
                  setSelectedColId(col.id);
                  if (col.docs.length > 0) {
                    setSelectedDocId(col.docs[0].id);
                    setJsonValue(JSON.stringify(col.docs[0].data, null, 2));
                  } else {
                    setSelectedDocId('');
                    setJsonValue('');
                  }
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-4 py-2 text-sm transition-all text-left",
                  selectedColId === col.id ? "bg-blue-600/10 text-blue-400 font-medium border-l-2 border-blue-500" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
                )}
              >
                <Folder className="w-4 h-4" />
                <span className="truncate">{col.id}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div className="w-1/3 border-r border-[#1F1F23] flex flex-col bg-[#0D0D11]">
          <div className="p-3 border-b border-[#1F1F23] flex items-center justify-between text-zinc-500 uppercase tracking-widest font-black text-[9px]">
            Documents (/{selectedColId})
            <Plus className="w-3 h-3 cursor-pointer hover:text-white" />
          </div>
          <div className="flex-1 overflow-y-auto">
            {selectedCol?.docs.map(doc => (
              <button
                key={doc.id}
                onClick={() => handleDocSelect(doc.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-4 py-3 text-xs border-b border-[#1F1F23] transition-all",
                  selectedDocId === doc.id ? "bg-blue-600/5 text-blue-400 font-medium" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/20"
                )}
              >
                <FileJson className="w-3.5 h-3.5" />
                <span className="flex-1 text-left truncate">
                  {selectedColId === 'users' && doc.data?.name ? doc.data.name : doc.id}
                </span>
                <ChevronRight className="w-3 h-3 opacity-30" />
              </button>
            ))}
          </div>
        </div>

        {/* Data Editor */}
        <div className="flex-1 flex flex-col bg-[#0A0A0E]">
          <div className="p-3 border-b border-[#1F1F23] flex items-center justify-between">
            <div className="flex items-center gap-2 bg-[#1A1A22] border border-[#2F2F37] px-2 py-1 rounded text-[10px] text-zinc-400 font-mono">
              <span className="opacity-50">path:</span> {selectedColId}/{selectedDocId}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleSave}
                disabled={!selectedDocId}
                className="disabled:opacity-50 px-3 py-1 text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all uppercase tracking-widest rounded flex items-center gap-2 active:scale-95"
              >
                <Save className="w-3 h-3" />
                Save
              </button>
              <MoreHorizontal className="w-4 h-4 text-zinc-600 cursor-pointer" />
            </div>
          </div>
          <div className="flex-1 relative flex flex-col">
            <div className="absolute top-4 right-4 text-[10px] font-mono text-zinc-700 pointer-events-none uppercase tracking-widest z-10">
              Live Preview
            </div>
            {saveStatus && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "absolute bottom-4 right-4 px-4 py-2 rounded-lg text-xs font-bold z-20 shadow-2xl border",
                  saveStatus.includes('Error') ? "bg-red-500/10 border-red-500/50 text-red-500" : "bg-emerald-500/10 border-emerald-500/50 text-emerald-500"
                )}
              >
                {saveStatus}
              </motion.div>
            )}
            <textarea 
               value={jsonValue}
               onChange={(e) => setJsonValue(e.target.value)}
               className="flex-1 w-full bg-[#0B0B0F] p-6 font-mono text-sm leading-relaxed text-blue-300/80 outline-none resize-none scrollbar-thin scrollbar-thumb-zinc-800"
               spellCheck="false"
               disabled={!selectedDocId}
            />
          </div>
          <div className="p-4 border-t border-[#1F1F23] flex items-center gap-3">
             <Code className="w-4 h-4 text-blue-500" />
             <div className="text-[10px] text-zinc-500 italic">
               Hint: Changes are persisted to the server-side AuraDB Engine.
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
