import React, { useState, useEffect, useRef } from 'react';
import { 
  Folder, 
  File, 
  Image as ImageIcon, 
  HardDrive, 
  Plus, 
  MoreVertical,
  Upload,
  Search,
  Loader2,
  Trash2,
  Download,
  Eye,
  X,
  FileText,
  Video,
  ShieldCheck,
  Cloud,
  ChevronRight,
  Sparkles,
  Code
} from 'lucide-react';
import { PageHeader } from './PageHeader';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useToast } from './Toast';
import { io } from 'socket.io-client';

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

export const StorageView: React.FC = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success, error, info } = useToast();

  useEffect(() => {
    fetchFiles();

    if (socket) {
      const handleSync = (event: any) => {
        if (event.type === 'storage_changed') {
          setFiles(event.data);
          info('Storage Sync', 'Bucket contents refreshed via real-time uplink');
        }
      };
      socket.on('aura_sync', handleSync);
      return () => socket.off('aura_sync', handleSync);
    }
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/storage');
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let uploadedFiles: FileList | null = null;
    
    if ('files' in e.target && e.target.files) {
      uploadedFiles = e.target.files;
    } else if ('dataTransfer' in e) {
      e.preventDefault();
      uploadedFiles = e.dataTransfer.files;
    }

    if (!uploadedFiles) return;

    for (const file of Array.from(uploadedFiles)) {
      const type = file.type.includes('image') ? 'image' : 
                   file.type.includes('video') ? 'video' : 
                   file.type.includes('pdf') || file.type.includes('text') ? 'document' : 'file';
      
      const payload = {
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type
      };

      try {
        await fetch('/api/storage/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        success('Asset Deployed', `${file.name} successfully pushed to Storage Engine`);
      } catch (err) {
        error('Upload Failed', `Could not persist ${file.name}`);
      }
    }
    
    setIsDragging(false);
    fetchFiles();
  };

  const deleteFile = async (name: string) => {
    if (!confirm(`Permanently delete ${name}?`)) return;
    try {
      await fetch(`/api/storage/${name}`, { method: 'DELETE' });
      success('Asset Purged', `${name} removed from block storage`);
      fetchFiles();
    } catch (err) {
      error('Deletion Failed', 'Request rejected by Storage Engine');
    }
  };

  const filteredItems = files.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'folder': return <Folder className="w-4 h-4 text-blue-400 fill-blue-400/20" />;
      case 'image': return <ImageIcon className="w-4 h-4 text-emerald-400" />;
      case 'video': return <Video className="w-4 h-4 text-purple-400" />;
      case 'document': return <FileText className="w-4 h-4 text-amber-400" />;
      default: return <File className="w-4 h-4 text-zinc-500" />;
    }
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  return (
    <div 
      className="space-y-6 animate-in slide-in-from-top-4 duration-500 min-h-full pb-20"
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleUpload}
    >
      <PageHeader 
        title="Cloud Storage" 
        subtitle="Manage binary assets across the global AuraDB CDN nodes"
        action={
          <div className="flex gap-3">
             <button 
                onClick={() => info('Optimization', 'Aura AI is analyzing bucket efficiency...')}
                className="bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-purple-500/20 transition-all"
             >
              <Sparkles className="w-3.5 h-3.5" />
              Aura AI Optimize
            </button>
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-zinc-700"
             >
              <Upload className="w-3.5 h-3.5" />
              Upload
            </button>
            <input 
              type="file" 
              multiple 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleUpload} 
            />
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-blue-900/40 active:scale-95">
              <Plus className="w-3.5 h-3.5" />
              New Folder
            </button>
          </div>
        }
      />

      {/* Storage Context Bar */}
      <div className="flex flex-wrap items-center gap-4">
         {[
           { label: 'Storage Usage', value: '1.2 GB / 50 GB', color: 'bg-blue-500' },
           { label: 'Bandwidth', value: '450 MB / month', color: 'bg-emerald-500' },
           { label: 'Files Count', value: files.length.toString(), color: 'bg-purple-500' },
         ].map(stat => (
           <div key={stat.label} className="bg-[#111116] border border-[#1F1F23] px-4 py-3 rounded-xl flex items-center gap-4">
              <div className={cn("w-1 h-8 rounded-full", stat.color)} />
              <div>
                 <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{stat.label}</p>
                 <p className="text-xs font-bold text-zinc-300 mt-0.5">{stat.value}</p>
              </div>
           </div>
         ))}
      </div>

      <div className="bg-[#111116] border border-[#1F1F23] rounded-2xl overflow-hidden shadow-2xl relative">
        <AnimatePresence>
          {isDragging && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 z-50 bg-blue-600/20 backdrop-blur-sm border-4 border-dashed border-blue-500 m-2 rounded-xl flex flex-col items-center justify-center pointer-events-none"
            >
               <div className="bg-blue-600 p-6 rounded-full shadow-2xl animate-bounce">
                  <Upload className="w-12 h-12 text-white" />
               </div>
               <h3 className="text-white font-black text-2xl uppercase tracking-tighter mt-6">Engage Cloud Upload</h3>
               <p className="text-blue-200 text-sm mt-2">Release items to store in AuraDB Engine</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-4 border-b border-[#1F1F23] flex items-center justify-between bg-[#16161C]/50">
          <div className="flex items-center gap-3 text-xs">
            <div className="p-2 bg-zinc-800 rounded-lg">
                <Cloud className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex flex-col">
               <span className="text-zinc-600 font-black uppercase text-[9px] tracking-widest">Active Bucket</span>
               <span className="text-zinc-200 font-mono text-[10px]">aura-prod-primary-blk</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] font-black text-emerald-500 uppercase tracking-widest">
               <ShieldCheck className="w-3.5 h-3.5" />
               CDN Status: Healthy
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
              <input 
                type="text" 
                placeholder="Lookup assets in bucket..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#0A0A0C] border border-[#2F2F37] rounded-lg py-2 pl-10 pr-4 text-xs text-zinc-300 w-80 focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-zinc-700"
              />
            </div>
          </div>
        </div>

        <div className="p-2">
            <table className="w-full text-left text-sm border-separate border-spacing-y-1">
              <thead className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Identity</th>
                  <th className="px-6 py-4">MIME Type</th>
                  <th className="px-6 py-4">Physical Size</th>
                  <th className="px-6 py-4">Uplink Time</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                {filteredItems.map((item, i) => (
                  <tr key={item.name} className="group hover:bg-blue-600/[0.03] transition-all cursor-pointer">
                    <td className="px-6 py-4 rounded-l-2xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center group-hover:bg-blue-600/10 group-hover:border-blue-500/20 transition-all">
                           {getFileIcon(item.type)}
                        </div>
                        <div className="flex flex-col">
                           <span className="text-sm font-bold text-zinc-200 group-hover:text-blue-400 transition-colors">{item.name}</span>
                           <span className="text-[10px] text-zinc-600 uppercase tracking-tighter">perm: 0644</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] tracking-widest uppercase font-black text-zinc-600 group-hover:text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded border border-zinc-700/50">{item.type}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500 font-mono tabular-nums">{item.size}</td>
                    <td className="px-6 py-4 text-xs text-zinc-500 tabular-nums">{item.modified}</td>
                    <td className="px-6 py-4 rounded-r-2xl text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedFile(item); }}
                          className="p-2 text-zinc-600 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-zinc-600 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-all">
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteFile(item.name); }}
                          className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-400/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                   <tr>
                    <td colSpan={5} className="px-6 py-32 text-center">
                       <div className="flex flex-col items-center opacity-40">
                          <Cloud className="w-16 h-16 text-zinc-700 mb-4" />
                          <p className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Storage Bucket Vacant</p>
                          <p className="text-[10px] text-zinc-600 mt-2 uppercase tracking-widest">Drop files anywhere to initiate uplink</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
        </div>
      </div>

      {/* File Preview Overlay */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedFile(null)}
          >
            <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="bg-[#111116] border border-[#1F1F23] w-full max-w-4xl rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(37,99,235,0.15)] flex flex-col md:flex-row h-[600px]"
               onClick={e => e.stopPropagation()}
            >
               {/* Left: Preview Area */}
               <div className="flex-1 bg-[#0A0A0C] border-r border-[#1F1F23] flex items-center justify-center p-12 relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full"></div>
                  {selectedFile.type === 'image' ? (
                     <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                        <div className="relative bg-zinc-900 p-2 rounded-lg border border-zinc-700">
                           <ImageIcon className="w-48 h-48 text-zinc-800" />
                           <div className="absolute bottom-4 left-4 right-4 py-2 bg-black/60 backdrop-blur text-[10px] font-mono text-center text-zinc-400 rounded border border-white/5">
                              PREVIEW_UNAVAILABLE_LOCAL_CDN
                           </div>
                        </div>
                     </div>
                  ) : (
                    <div className="flex flex-col items-center">
                       <div className="w-32 h-32 bg-zinc-800/50 rounded-3xl flex items-center justify-center mb-6 border border-zinc-700/30">
                          {getFileIcon(selectedFile.type)}
                       </div>
                       <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Metadata View</p>
                    </div>
                  )}
               </div>

               {/* Right: Info Panel */}
               <div className="w-full md:w-96 p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-8">
                       <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest bg-zinc-800 px-3 py-1 rounded">Asset Manifest</span>
                       <button 
                        onClick={() => setSelectedFile(null)}
                        className="p-2 hover:bg-zinc-800 rounded-full transition-all"
                       >
                        <X className="w-5 h-5 text-zinc-500" />
                       </button>
                    </div>

                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">{selectedFile.name}</h3>
                    <p className="text-[10px] text-blue-400 font-mono mb-8">blob_id: {Math.random().toString(36).substr(2, 16)}</p>

                    <div className="space-y-4">
                       {[
                         { label: 'Asset Type', value: selectedFile.type, icon: Code },
                         { label: 'Payload Size', value: selectedFile.size, icon: HardDrive },
                         { label: 'Engine Path', value: `/storage/blk_01/${selectedFile.name}`, icon: Folder },
                         { label: 'CDN Security', value: 'AES-256-GCM', icon: ShieldCheck },
                       ].map(row => (
                         <div key={row.label} className="flex items-center justify-between py-3 border-b border-zinc-800/50">
                            <div className="flex items-center gap-2">
                               <row.icon className="w-3.5 h-3.5 text-zinc-600" />
                               <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{row.label}</span>
                            </div>
                            <span className="text-[10px] font-bold text-zinc-300 font-mono uppercase">{row.value}</span>
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                     <button className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-900/20 active:scale-95 transition-all">
                        Download Binary
                     </button>
                     <button 
                      onClick={() => deleteFile(selectedFile.name)}
                      className="p-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-2xl transition-all"
                     >
                        <Trash2 className="w-5 h-5" />
                     </button>
                  </div>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
