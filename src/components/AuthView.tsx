import React, { useState, useEffect } from 'react';
import { Mail, MoreVertical, Plus, Search, Loader2, Shield, Settings2, Globe, Github, Chrome, ShieldAlert, CheckCircle2, XCircle, User as UserIcon, Code } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { motion, AnimatePresence } from 'motion/react';
import { type User } from '../types';
import { useToast } from './Toast';
import { io } from 'socket.io-client';
import { cn } from '../lib/utils';
import { RegistrationPreview } from './RegistrationPreview';
import { Service } from '../types';

interface AuthViewProps {
  onNavigate?: (service: Service) => void;
}

type AuthTab = 'users' | 'providers' | 'settings' | 'templates';

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

export const AuthView: React.FC<AuthViewProps> = ({ onNavigate }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [activeTab, setActiveTab] = useState<AuthTab>('users');
  const { success, error: toastError, info } = useToast();

  useEffect(() => {
    fetchUsers();
    // ... rest of useEffect ...

    if (socket) {
      const handleSync = (event: any) => {
        if (event.type === 'auth_changed') {
          setUsers(event.data);
        }
      };

      socket.on('aura_sync', handleSync);

      return () => {
        socket.off('aura_sync', handleSync);
      };
    }
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/auth/users');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    
    const newUser = {
      uid: 'u' + Math.random().toString(36).substr(2, 9),
      email: newEmail,
      provider: 'password',
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      lastLogin: 'Never'
    };

    try {
      await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      await fetchUsers();
      setNewEmail('');
      setIsAdding(false);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (uid: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await fetch(`/api/auth/users/${uid}`, { method: 'DELETE' });
      await fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    u.uid.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="h-full flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="text-zinc-500 text-xs font-medium uppercase tracking-widest">AuraDB Initializing...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="h-full flex items-center justify-center min-h-[400px]">
      <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-xl max-w-md text-center">
        <div className="text-red-400 text-lg font-bold mb-2">Sync Error Detected</div>
        <div className="text-zinc-400 text-sm mb-6">{error}</div>
        <button 
          onClick={fetchUsers}
          className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all"
        >
          Re-establish Connection
        </button>
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <PageHeader 
        title="Authentication" 
        subtitle="Manage user access, identity providers and security policies"
        action={
          <div className="flex gap-3">
             <button 
              onClick={() => setIsAdding(!isAdding)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20 active:scale-95 uppercase tracking-widest"
            >
              <Plus className="w-3.5 h-3.5" />
              {isAdding ? 'Cancel' : 'New Identity'}
            </button>
          </div>
        }
      />

      {/* Auth Sub-navigation */}
      <div className="flex items-center gap-6 mb-8 border-b border-[#1F1F23]">
        {[
          { id: 'users', label: 'Users', icon: Mail },
          { id: 'providers', label: 'Providers', icon: Globe },
          { id: 'templates', label: 'Templates', icon: UserIcon },
          { id: 'settings', label: 'Settings', icon: Settings2 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as AuthTab)}
            className={cn(
              "flex items-center gap-2 px-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative",
              activeTab === tab.id ? "text-blue-400" : "text-zinc-600 hover:text-zinc-400"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="authTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'users' ? (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {isAdding && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-8 bg-blue-600/5 border border-blue-500/20 p-8 rounded-2xl overflow-hidden"
              >
                <form onSubmit={handleAddUser} className="flex gap-4 items-end max-w-2xl">
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Construct New Identity</label>
                    <input 
                      autoFocus
                      type="email" 
                      placeholder="e.g. engineer@aura.db"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full bg-[#0A0A0C] border border-[#2F2F37] rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-xl shadow-blue-900/40 transition-all active:scale-95"
                  >
                    Deploy Identity
                  </button>
                </form>
              </motion.div>
            )}

            <div className="bg-[#111116] border border-[#1F1F23] rounded-2xl overflow-hidden shadow-2xl border-t border-t-zinc-800/50">
              <div className="p-6 border-b border-[#1F1F23] flex items-center justify-between bg-[#16161C]/50">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-zinc-800/50 px-3 py-1 rounded">
                    Total Identities: {filteredUsers.length}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
                    <CheckCircle2 className="w-3 h-3" />
                    Engine Healthy
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                  <input 
                    type="text" 
                    placeholder="Search by UID or Email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-[#0A0A0C] border border-[#2F2F37] rounded-lg py-2 pl-10 pr-4 text-xs text-zinc-300 focus:outline-none focus:border-blue-500/50 transition-all w-80 placeholder:text-zinc-700"
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] font-black text-zinc-600 uppercase tracking-widest bg-[#16161C]/80">
                    <tr>
                      <th className="px-6 py-4">User Identity</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Provider</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F1F23]">
                    {filteredUsers.map((user) => (
                      <tr key={user.uid} className="hover:bg-blue-600/[0.03] transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500 group-hover:bg-blue-600/10 group-hover:text-blue-400 group-hover:border-blue-500/20 transition-all">
                              <UserIcon className="w-5 h-5" />
                            </div>
                            <div>
                               <div className="text-sm font-bold text-zinc-200">{user.email}</div>
                               <div className="text-[10px] text-zinc-600 font-mono mt-0.5">uid: {user.uid}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-2">
                              <Shield className="w-3 h-3 text-blue-500" />
                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                {user.uid === 'u3' ? 'System Admin' : user.uid === 'u1' ? 'Project Owner' : 'Developer'}
                              </span>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">Active</span>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 bg-zinc-800/50 self-start px-2 py-1 rounded border border-zinc-700/50">
                             {user.provider === 'google.com' ? <Globe className="w-3 h-3 text-blue-400" /> : <Mail className="w-3 h-3 text-zinc-500" />}
                             <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{user.provider}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                           <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-tighter">{user.uid}#aura</span>
                        </td>
                        <td className="px-6 py-5 text-[11px] text-zinc-500 font-medium">{user.created}</td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button className="p-2 text-zinc-600 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                                <Settings2 className="w-4 h-4" />
                             </button>
                             <button 
                              onClick={() => deleteUser(user.uid)}
                              className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-400/10 rounded-lg transition-all"
                             >
                              <XCircle className="w-4 h-4" />
                             </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : activeTab === 'providers' ? (
          <motion.div
            key="providers"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {[
              { id: 'email', name: 'Email / Password', icon: Mail, enabled: true, color: 'text-zinc-400' },
              { id: 'google', name: 'Google Login', icon: Globe, enabled: true, color: 'text-blue-400' },
              { id: 'github', name: 'GitHub Integration', icon: Github, enabled: false, color: 'text-white' },
              { id: 'anonymous', name: 'Anonymous Auth', icon: ShieldAlert, enabled: false, color: 'text-amber-500' },
            ].map(p => (
              <div key={p.id} className="bg-[#111116] border border-[#1F1F23] p-8 rounded-2xl flex flex-col justify-between hover:border-zinc-700 transition-colors">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={cn("p-3 bg-zinc-800 rounded-xl border border-zinc-700", p.color)}>
                       <p.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-widest">{p.name}</h4>
                      <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">{p.enabled ? 'Service Active' : 'Service Paused'}</p>
                    </div>
                  </div>
                  <div className={cn(
                    "w-12 h-6 rounded-full relative cursor-pointer transition-all border",
                    p.enabled ? "bg-blue-600 border-blue-500 shadow-[0_0_12px_rgba(37,99,235,0.2)]" : "bg-zinc-900 border-zinc-800"
                  )}>
                    <div className={cn(
                      "absolute top-1 w-3.5 h-3.5 bg-white rounded-full transition-all shadow-md",
                      p.enabled ? "right-1" : "left-1"
                    )} />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button className="flex-1 py-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all rounded-xl">
                    Configure API
                  </button>
                  <button className="flex-1 py-3 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest text-blue-400 transition-all rounded-xl">
                    View Docs
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        ) : activeTab === 'templates' ? (
          <motion.div
            key="templates"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center py-12"
          >
            <div className="mb-12 text-center max-w-2xl">
              <h3 className="text-xl font-black text-white uppercase tracking-[0.2em] mb-4">UI Components & Templates</h3>
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider leading-relaxed">
                AuraDB-ს აქვს მზა დიზაინები თქვენი აპლიკაციებისთვის. აირჩიეთ სასურველი ფორმა და დააინტეგრირეთ AuraDB-ის ავტორიზაცია ერთ წუთში.
              </p>
            </div>
            
            <RegistrationPreview onNavigate={onNavigate} />
            
            <div className="mt-16 bg-[#111116] border border-[#1F1F23] p-8 rounded-3xl w-full max-w-3xl">
               <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                     <Code className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest">In-App Implementation</h4>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Use our React SDK to sync this form with AuraDB</p>
                  </div>
               </div>
               <div className="bg-[#0A0A0C] p-6 rounded-2xl border border-[#1F1F23] font-mono text-[11px] text-blue-300 overflow-x-auto">
                  <pre>{`// Example: Connect this form to AuraDB
import { useAuraAuth } from '@auradb/sdk-react';

const { signUp } = useAuraAuth();

const handleRegister = async (data) => {
  const { user, error } = await signUp({
    email: data.email,
    password: data.password,
    name: data.name
  });

  if (user) console.log('AuraDB Identity Registered!');
};`}</pre>
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
             key="settings"
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -10 }}
             className="bg-[#111116] border border-[#1F1F23] rounded-2xl p-8"
          >
             <h3 className="text-lg font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-500" />
                Security Engine Policies
             </h3>
             <div className="space-y-8">
                {[
                  { title: 'One Account Per Email', desc: 'Prevent multiple auth providers from linking to same address', enabled: true },
                  { title: 'Email Enumeration Protection', desc: 'Mask whether an account exists during login attempts (Recommended)', enabled: true },
                  { title: 'Authorized Domains', desc: 'Allow requests only from verified domain roots', enabled: true },
                  { title: 'Session Persistence', desc: 'Automatically refresh tokens for persistent login', enabled: false },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-6 first:pt-0 last:pb-0 border-b last:border-0 border-zinc-800/50">
                    <div className="max-w-2xl">
                      <h4 className="text-sm font-bold text-white mb-1 uppercase tracking-tight">{s.title}</h4>
                      <p className="text-xs text-zinc-500 leading-relaxed">{s.desc}</p>
                    </div>
                    <button 
                      onClick={() => success('Policy Updated', `${s.title} has been ${s.enabled ? 'deactivated' : 'activated'}.`)}
                      className={cn(
                      "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                      s.enabled ? "bg-zinc-800 text-zinc-500 hover:text-white" : "bg-blue-600 text-white"
                    )}>
                      {s.enabled ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
