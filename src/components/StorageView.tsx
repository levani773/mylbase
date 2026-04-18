import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  File, 
  Image as ImageIcon, 
  HardDrive, 
  Plus, 
  MoreVertical,
  Upload,
  Search,
  Loader2
} from 'lucide-react';
import { PageHeader } from './PageHeader';

export const StorageView: React.FC = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchFiles();
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

  const filteredItems = files.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
      <PageHeader 
        title="Cloud Storage" 
        subtitle="Manage assets using the AuraDB Global CDN"
        action={
          <div className="flex gap-3">
             <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all">
              <Upload className="w-4 h-4" />
              Upload
            </button>
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20">
              <Plus className="w-4 h-4" />
              New Folder
            </button>
          </div>
        }
      />

      <div className="bg-[#111116] border border-[#1F1F23] rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-[#1F1F23] flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs">
            <span className="text-zinc-500 flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5" />
              Bucket:
            </span>
            <span className="text-white font-mono bg-[#1A1A22] px-2 py-0.5 rounded border border-[#2F2F37]">aura-prod-primary-bk</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search storage..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#16161C] border border-[#1F1F23] rounded-lg py-1.5 pl-9 pr-3 text-xs text-zinc-300 w-64 focus:outline-none focus:border-blue-500/50"
            />
          </div>
        </div>

        <div className="p-2">
            <table className="w-full text-left text-sm border-separate border-spacing-y-1">
              <thead className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Size</th>
                  <th className="px-6 py-3">Last Modified</th>
                  <th className="px-6 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                {filteredItems.map((item, i) => (
                  <tr key={i} className="group hover:bg-zinc-800/40 transition-all cursor-pointer">
                    <td className="px-6 py-3 rounded-l-xl">
                      <div className="flex items-center gap-3">
                        {item.type === 'folder' ? (
                          <Folder className="w-4 h-4 text-blue-400 fill-blue-400/20" />
                        ) : item.type === 'image' ? (
                          <ImageIcon className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <File className="w-4 h-4 text-zinc-400" />
                        )}
                        <span className="group-hover:text-white transition-colors underline-offset-4 group-hover:underline">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-[10px] tracking-wider uppercase font-bold text-zinc-600 group-hover:text-zinc-500">{item.type}</span>
                    </td>
                    <td className="px-6 py-3 text-zinc-500 tabular-nums">{item.size}</td>
                    <td className="px-6 py-3 text-zinc-500 tabular-nums">{item.modified}</td>
                    <td className="px-6 py-3 rounded-r-xl text-right">
                      <button className="p-1.5 text-zinc-600 hover:text-white hover:bg-zinc-700 rounded transition-all opacity-0 group-hover:opacity-100">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                   <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-600 italic">
                      No matching storage items...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};
