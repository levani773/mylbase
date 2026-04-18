import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  Terminal, 
  Play, 
  Sparkles, 
  Loader2, 
  History,
  Cpu,
  CloudUpload,
  Activity
} from 'lucide-react';
import { PageHeader } from './PageHeader';
import { generateCloudFunction } from '../services/geminiService';
import { motion } from 'motion/react';

export const FunctionsView: React.FC = () => {
  const [funcName, setFuncName] = useState('helloWorld');
  const [prompt, setPrompt] = useState('Create a trigger that returns a message');
  const [code, setCode] = useState(`async (db, auth) => {
  return { message: "Hello from AuraDB Cloud!" };
}`);
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchFunctions();
  }, []);

  const fetchFunctions = async () => {
    try {
      const res = await fetch('/api/functions');
      const data = await res.json();
      if (data.length > 0) {
        setFuncName(data[0].name);
        setCode(data[0].code);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const generatedCode = await generateCloudFunction(prompt);
      if (generatedCode) setCode(generatedCode);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async () => {
    setDeploying(true);
    try {
      const res = await fetch('/api/functions/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: funcName, code })
      });
      if (res.ok) {
        setLogs([{ t: new Date().toLocaleTimeString(), m: `Deployed ${funcName} successfully`, s: 'emerald' }, ...logs]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeploying(false);
    }
  };

  const handleRun = async () => {
    setRunning(true);
    setOutput(null);
    try {
      const res = await fetch(`/api/functions/call/${funcName}`, { method: 'POST' });
      const data = await res.json();
      setOutput(data);
      setLogs([{ t: new Date().toLocaleTimeString(), m: `Execution complete: ${funcName}`, s: 'blue' }, ...logs]);
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6 animate-in zoom-in-95 duration-500">
      <PageHeader 
        title="Cloud Functions" 
        subtitle="Server-side logic execution powered by the AuraDB Edge Runtime"
        action={
          <div className="flex gap-4 items-center">
             <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Cpu className="w-3.5 h-3.5" />
                Runtime: Aura-Node v1
             </div>
             <button 
               onClick={handleDeploy}
               disabled={deploying}
               className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all disabled:opacity-50"
             >
              {deploying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
              Deploy function
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
           <div className="bg-[#111116] border border-[#1F1F23] p-4 rounded-xl">
              <h5 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                AI Copilot
              </h5>
              <div className="space-y-3">
                <div>
                   <label className="text-[10px] text-zinc-500 block mb-1 uppercase font-bold">Function Name</label>
                   <input 
                    value={funcName}
                    onChange={(e) => setFuncName(e.target.value)}
                    className="w-full bg-[#1A1A22] border border-[#2F2F37] rounded p-2 text-xs text-zinc-300 outline-none focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 block mb-1 uppercase font-bold">Prompt</label>
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full bg-[#1A1A22] border border-[#2F2F37] rounded-lg p-3 text-xs text-zinc-300 min-h-[80px] focus:outline-none focus:border-blue-500/50 resize-none"
                  />
                </div>
                <button 
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  Generate Logic
                </button>
              </div>
           </div>

           <div className="bg-[#111116] border border-[#1F1F23] p-4 rounded-xl max-h-[300px] overflow-hidden flex flex-col">
              <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <History className="w-3 h-3" />
                Runtime Logs
              </h5>
              <div className="space-y-3 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-zinc-800">
                 {logs.map((log, i) => (
                   <div key={i} className="flex gap-3 text-[10px]">
                      <span className="text-zinc-600 font-mono tracking-tighter whitespace-nowrap">{log.t}</span>
                      <span className={log.s === 'emerald' ? 'text-emerald-400' : 'text-blue-400'}>{log.m}</span>
                   </div>
                 ))}
                 {logs.length === 0 && <span className="text-[10px] text-zinc-600 italic">No logs yet...</span>}
              </div>
           </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[#0A0A0E] border border-[#1F1F23] rounded-2xl overflow-hidden flex flex-col shadow-2xl h-[400px]">
            <div className="bg-[#16161C] border-b border-[#1F1F23] p-3 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-[#1F1F28] rounded border border-[#2F2F37]">
                    <Code2 className="w-3 h-3 text-blue-400" />
                    <span className="text-[10px] font-mono text-zinc-300">{funcName}.ts</span>
                  </div>
                  <button 
                    onClick={handleRun}
                    disabled={running}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-600/10 text-blue-400 text-xs font-bold rounded hover:bg-blue-600/20 transition-all border border-blue-500/20"
                  >
                    {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    Run Test
                  </button>
               </div>
               <div className="flex items-center gap-3">
                 <Terminal className="w-4 h-4 text-zinc-600" />
               </div>
            </div>
            <div className="flex-1 p-0 flex">
               <textarea 
                 value={code}
                 onChange={(e) => setCode(e.target.value)}
                 className="flex-1 bg-transparent p-6 font-mono text-sm text-blue-100/90 leading-relaxed outline-none resize-none scrollbar-thin scrollbar-thumb-zinc-800"
                 spellCheck="false"
               />
            </div>
          </div>

          {output && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#111116] border border-[#1F1F23] rounded-2xl p-6 shadow-2xl space-y-4"
            >
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    Execution Output
                  </div>
                  <div className="text-[10px] text-zinc-600 font-mono tracking-tighter">
                    Timestamp: {output.timestamp}
                  </div>
               </div>
               <pre className="bg-[#0B0B0F] p-4 rounded-xl border border-[#1F1F23] font-mono text-sm text-emerald-400/90 overflow-x-auto">
                 {JSON.stringify(output.result, null, 2)}
               </pre>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
