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
  Filter,
  ArrowUpDown,
  Trash2,
  Download,
  Database,
  Layers,
  Zap,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { PageHeader } from './PageHeader';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { FirestoreCollection } from '../types';
import { useToast } from './Toast';
import { io } from 'socket.io-client';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

let socket: any;
try {
  socket = io({ 
    transports: ['polling', 'websocket'],
    reconnectionAttempts: 5,
    timeout: 10000 
  });
} catch (e) {
  console.warn('Socket init failed', e);
}

export const FirestoreView: React.FC = () => {
  const [data, setData] = useState<FirestoreCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedColId, setSelectedColId] = useState<string>('');
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [jsonValue, setJsonValue] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isGeneratingMock, setIsGeneratingMock] = useState(false);
  
  const { success, error, info } = useToast();

  useEffect(() => {
    if (!jsonValue) {
      setJsonError(null);
      return;
    }
    try {
      JSON.parse(jsonValue);
      setJsonError(null);
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : 'Invalid JSON format');
    }
  }, [jsonValue]);

  useEffect(() => {
    fetchCollections();

    if (socket) {
      const handleSync = (event: any) => {
        if (event.type === 'db_changed') {
          setData(event.data);
          info('Cloud Sync', 'Database refreshed via real-time uplink');
        }
      };

      socket.on('aura_sync', handleSync);

      return () => {
        socket.off('aura_sync', handleSync);
      };
    }
  }, []);

  // Update editor if data changes externally
  useEffect(() => {
    if (selectedDocId && selectedColId) {
      const col = data.find(c => c.id === selectedColId);
      const doc = col?.docs.find(d => d.id === selectedDocId);
      if (doc) {
        const currentDataString = JSON.stringify(doc.data, null, 2);
        // Only update if someone else changed it (to avoid cursor jump while typing)
        if (jsonValue !== currentDataString && !jsonError) {
          setJsonValue(currentDataString);
        }
      }
    }
  }, [data]);

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
    if (jsonError) {
      error('Validation Error', 'Please fix JSON syntax errors before committing.');
      return;
    }

    try {
      const parsed = JSON.parse(jsonValue);
      
      // Data Integrity Validation
      if (Object.keys(parsed).length === 0) {
        info('Empty Document Warning', 'You are saving a document with no fields.');
      }

      // Check for forbidden characters in top-level keys (standard Firestore)
      for (const key of Object.keys(parsed)) {
        if (typeof key !== 'string' || /[\.\*\/\[\]\$\#]/.test(key)) {
          throw new Error(`Forbidden character in field name: "${key}"`);
        }
      }

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
        setJsonValue(JSON.stringify(parsed, null, 2)); // Re-format on success
        success('Changes Committed', 'Data has been successfully persisted to AuraDB Engine');
      } else {
        throw new Error('Failed to save to server');
      }
    } catch (e) {
      error('Engine Sync Failed', e instanceof Error ? e.message : 'Invalid JSON');
    }
  };

  const generateMockData = async () => {
    if (!selectedColId) {
      info('Context Required', 'Please select a collection first so Aura AI knows the schema target.');
      return;
    }

    setIsGeneratingMock(true);
    info('Aura AI', `Generating intelligent mock data for /${selectedColId}...`);

    try {
      const prompt = `Generate a realistic array of 5 JSON objects for a Firestore collection named "${selectedColId}". 
      Each object should have unique data. Return ONLY the JSON array, no extra text.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });

      const text = response.text || "[]";
      const cleanJson = text.replace(/```json|```/g, '').trim();
      const mockItems = JSON.parse(cleanJson);

      const newData = data.map(col => {
        if (col.id === selectedColId) {
          const newDocs = mockItems.map((item: any) => ({
            id: `mock_${Math.random().toString(36).substr(2, 5)}`,
            data: item
          }));
          return { ...col, docs: [...col.docs, ...newDocs] };
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
        success('AI Synthesis Complete', `Injected 5 synthetic records into /${selectedColId}`);
      }
    } catch (err) {
      console.error(err);
      error('AI Error', 'Simulation failed. Check API configuration.');
    } finally {
      setIsGeneratingMock(false);
    }
  };

  const filteredDocs = selectedCol?.docs.filter(d => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return d.id.toLowerCase().includes(q) || 
           (typeof d.data?.name === 'string' && d.data.name.toLowerCase().includes(q)) ||
           (typeof d.data?.title === 'string' && d.data.title.toLowerCase().includes(q));
  });

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
            {data.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="w-10 h-10 bg-zinc-800/50 rounded-lg flex items-center justify-center mx-auto mb-3 border border-zinc-700/30">
                  <Layers className="w-5 h-5 text-zinc-600" />
                </div>
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">No Collections</p>
                <p className="text-[8px] text-zinc-700 leading-tight">Start by defining your data root.</p>
              </div>
            ) : (
              data.map(col => (
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
              ))
            )}
          </div>
        </div>

        {/* Documents */}
        <div className="w-1/3 border-r border-[#1F1F23] flex flex-col bg-[#0D0D11]">
          <div className="p-3 border-b border-[#1F1F23] flex items-center justify-between text-zinc-500 uppercase tracking-widest font-black text-[9px]">
            Documents (/{selectedColId})
            <div className="flex items-center gap-2">
              <Plus className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={cn("p-0.5 rounded transition-colors", showFilters ? "text-blue-400 bg-blue-500/10" : "hover:text-white")}
              >
                <Filter className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-b border-[#1F1F23] bg-[#111116]/50"
              >
                <div className="p-3 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-600" />
                    <input 
                      type="text" 
                      value={filterQuery}
                      onChange={(e) => setFilterQuery(e.target.value)}
                      placeholder="Search ID, name, or title..." 
                      className="w-full bg-[#1A1A20] border border-[#2F2F37] rounded-md py-2 pl-8 text-[11px] text-zinc-400 focus:outline-none focus:border-blue-600/50"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-[#1A1A20] border border-[#2F2F37] rounded text-[9px] font-bold text-zinc-500 uppercase tracking-widest hover:text-zinc-300">
                      <ArrowUpDown className="w-3 h-3" /> Sort
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-[#1A1A20] border border-[#2F2F37] rounded text-[9px] font-bold text-zinc-500 uppercase tracking-widest hover:text-zinc-300">
                      <Download className="w-3 h-3" /> Export
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 overflow-y-auto">
            {(!filteredDocs || filteredDocs.length === 0) ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-[#0B0B0F]/50">
                <div className="w-12 h-12 bg-zinc-800/30 rounded-2xl flex items-center justify-center mb-4 border border-zinc-700/20">
                   <FileJson className="w-6 h-6 text-zinc-700" />
                </div>
                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">No Records Found</h4>
                <p className="text-[10px] text-zinc-600 leading-relaxed max-w-[180px] mx-auto italic">
                  {filterQuery ? `Nothing matches your search criteria in /${selectedColId}` : "This collection is currently empty."}
                </p>
                {!filterQuery && (
                   <button className="mt-6 flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-[9px] font-bold text-zinc-300 uppercase tracking-widest transition-all">
                      <Plus className="w-3 h-3" /> Insert Record
                   </button>
                )}
              </div>
            ) : (
              filteredDocs.map(doc => (
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
                    {(doc.data?.name || doc.data?.title) && typeof (doc.data?.name || doc.data?.title) === 'string' 
                      ? (doc.data.name || doc.data.title) 
                      : doc.id}
                  </span>
                  <ChevronRight className="w-3 h-3 opacity-30" />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Data Editor */}
        <div className="flex-1 flex flex-col bg-[#0A0A0E]">
          {selectedDocId ? (
            <>
              <div className="p-3 border-b border-[#1F1F23] flex items-center justify-between">
                <div className="flex items-center gap-2 bg-[#1A1A22] border border-[#2F2F37] px-2 py-1 rounded text-[10px] text-zinc-400 font-mono">
                  <span className="opacity-50">path:</span> {selectedColId}/{selectedDocId}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={generateMockData}
                    disabled={isGeneratingMock || !selectedColId}
                    className="disabled:opacity-50 px-3 py-1.5 text-[10px] font-bold text-blue-400 bg-blue-400/10 hover:bg-blue-400/20 transition-all uppercase tracking-widest rounded-lg flex items-center gap-2 border border-blue-500/20"
                  >
                    {isGeneratingMock ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    Aura AI Generate
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={!selectedDocId}
                    className="disabled:opacity-50 px-3 py-1.5 text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all uppercase tracking-widest rounded-lg flex items-center gap-2 active:scale-95 shadow-lg shadow-blue-900/40"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Commit Changes
                  </button>
                  <button className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex-1 relative flex flex-col">
                <div className="absolute top-4 right-4 text-[10px] font-mono text-zinc-700 pointer-events-none uppercase tracking-widest z-10 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Live Preview
                </div>
                <textarea 
                   value={jsonValue}
                   onChange={(e) => setJsonValue(e.target.value)}
                   className={cn(
                     "flex-1 w-full bg-[#0B0B0F] p-6 font-mono text-sm leading-relaxed outline-none resize-none scrollbar-thin scrollbar-thumb-zinc-800 transition-all",
                     jsonError ? "text-red-400/80 bg-red-500/[0.02]" : "text-blue-300/80"
                   )}
                   spellCheck="false"
                   disabled={!selectedDocId}
                />
                {jsonError && (
                  <div className="absolute bottom-4 left-6 right-6 bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-3 animate-in slide-in-from-bottom-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shrink-0"></span>
                    <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest truncate">
                      Syntax Error: {jsonError}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-[#1F1F23] flex items-center gap-3">
                 <Code className="w-4 h-4 text-blue-500" />
                 <div className="text-[10px] text-zinc-500 italic">
                   Hint: Changes are persisted to the server-side AuraDB Engine.
                 </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[#070709]">
               <div className="relative mb-12">
                  <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full"></div>
                  <Database className="w-16 h-16 text-blue-500/40 relative z-10" />
               </div>
               
               <h2 className="text-xl font-black text-white uppercase tracking-[0.2em] mb-4">AuraDB Intelligent Engine</h2>
               <p className="text-zinc-500 text-xs font-medium max-w-sm mx-auto leading-relaxed mb-12 uppercase tracking-wider">
                  Select a document from the hierarchy to begin low-latency data operations.
               </p>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                  {[
                    { title: 'Dynamic Schema', desc: 'Auto-detecting data structures', icon: Layers },
                    { title: 'Real-time Sync', desc: 'Sub-10ms distribution uplink', icon: Zap },
                    { title: 'Secure Access', desc: 'V3 Security Rules enforced', icon: ShieldCheck },
                    { title: 'JSON Native', desc: 'No-transform object storage', icon: FileJson },
                  ].map(feature => (
                    <div key={feature.title} className="p-6 bg-[#111116] border border-[#1F1F23] rounded-2xl text-left group hover:border-blue-500/30 transition-all">
                       <feature.icon className="w-5 h-5 text-zinc-600 mb-4 group-hover:text-blue-400 transition-colors" />
                       <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 group-hover:text-zinc-200 transition-colors">{feature.title}</h4>
                       <p className="text-[9px] text-zinc-600 uppercase tracking-wider">{feature.desc}</p>
                    </div>
                  ))}
               </div>
               
               <div className="mt-12 flex gap-4">
                  <button className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-blue-900/20 active:scale-95">
                    Create New Collection
                  </button>
                  <button className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-zinc-700 active:scale-95">
                    Import JSON
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
