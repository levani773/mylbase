import React, { useState, useEffect } from 'react';
import { Mail, MoreVertical, Plus, Search, Loader2 } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { motion } from 'motion/react';
import { User } from '../types';
import { io } from 'socket.io-client';

const socket = io();

export const AuthView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    fetchUsers();

    socket.on('aura_sync', (event) => {
      if (event.type === 'auth_changed') {
        setUsers(event.data);
      }
    });

    return () => {
      socket.off('aura_sync');
    };
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/auth/users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
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
    <div className="h-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <PageHeader 
        title="Authentication" 
        subtitle="User access control powered by AuraDB Identity Engine"
        action={
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            {isAdding ? 'Cancel' : 'Add User'}
          </button>
        }
      />

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 bg-blue-600/5 border border-blue-500/20 p-6 rounded-xl overflow-hidden"
        >
          <form onSubmit={handleAddUser} className="flex gap-4 items-end max-w-2xl">
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">New User Email</label>
              <input 
                autoFocus
                type="email" 
                placeholder="user@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full bg-[#1A1A22] border border-[#2F2F37] rounded-lg px-4 py-2 text-sm text-zinc-300 focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-900/20"
            >
              Construct User
            </button>
          </form>
        </motion.div>
      )}

      <div className="bg-[#111116] border border-[#1F1F23] rounded-xl overflow-hidden shadow-xl shadow-black/20">
        <div className="p-4 border-b border-[#1F1F23] flex items-center justify-between bg-[#16161C]">
          <div className="px-3 py-1 bg-zinc-800 rounded text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Users ({filteredUsers.length})
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Filter by identifier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#1D1D23] border border-[#2F2F37] rounded-md py-1.5 pl-9 pr-3 text-xs text-zinc-300 focus:outline-none focus:border-blue-500/50 transition-all w-64"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider bg-[#16161C]">
              <tr>
                <th className="px-6 py-4">Identifier</th>
                <th className="px-6 py-4">Providers</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4">Signed In</th>
                <th className="px-6 py-4">User UID</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F23]">
              {filteredUsers.map((user) => (
                <tr key={user.uid} className="hover:bg-blue-600/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-blue-600/10 group-hover:text-blue-400 transition-all">
                        <Mail className="w-4 h-4" />
                      </div>
                      <span className="text-zinc-200 font-medium">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700 capitalize">
                      {user.provider}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 tabular-nums">{user.created}</td>
                  <td className="px-6 py-4 text-zinc-400 tabular-nums">{user.lastLogin}</td>
                  <td className="px-6 py-4 font-mono text-xs text-zinc-600 group-hover:text-zinc-400 transition-colors uppercase tracking-tight">
                    {user.uid}........
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => deleteUser(user.uid)}
                      className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                   <td colSpan={6} className="px-6 py-20 text-center text-zinc-600 text-sm italic">
                      No users found matching "{search}"
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
