import React from 'react';
import { PageHeader } from './PageHeader';
import { User, Settings, CreditCard, Shield, Bell, Globe, ChevronRight } from 'lucide-react';

export const SettingsView: React.FC = () => {
  return (
    <div className="h-full flex flex-col animate-in fade-in duration-700">
      <PageHeader 
        title="Project Settings" 
        subtitle="Manage your organization, billing, and system preferences"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 space-y-4">
          <div className="bg-[#111116] border border-[#1F1F23] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#1F1F23] bg-[#0A0A0C]/50 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              General Settings
            </div>
            <div className="p-2">
              {[
                { label: 'Profile', icon: User, active: true },
                { label: 'Organization', icon: Settings },
                { label: 'Billing', icon: CreditCard },
                { label: 'Security', icon: Shield },
                { label: 'Notifications', icon: Bell },
                { label: 'Custom Domain', icon: Globe },
              ].map((item, i) => (
                <button 
                  key={i} 
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${item.active ? 'bg-blue-600/10 text-blue-400 font-medium' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'}`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className={`w-3 h-3 ${item.active ? 'opacity-100' : 'opacity-30'}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-[#111116] border border-[#1F1F23] rounded-xl p-8">
            <h3 className="text-lg font-bold text-white mb-6">Profile Settings</h3>
            
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border-4 border-[#1F1F23] flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                  LC
                </div>
                <div>
                  <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold transition-all mb-2">
                    Change Avatar
                  </button>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">JPG, PNG or GIF. Max 1MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Full Name</label>
                  <input type="text" defaultValue="Levani Ch." className="w-full bg-[#1A1A20] border border-[#2F2F37] rounded-lg py-2 px-4 text-sm text-zinc-300 focus:outline-none focus:border-blue-600/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Email Address</label>
                  <input type="email" defaultValue="levani773@gmail.com" disabled className="w-full bg-[#1A1A20] border border-[#2F2F37] rounded-lg py-2 px-4 text-sm text-zinc-500 cursor-not-allowed opacity-50" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Biography</label>
                <textarea rows={3} placeholder="Tell something about yourself..." className="w-full bg-[#1A1A20] border border-[#2F2F37] rounded-lg py-2 px-4 text-sm text-zinc-300 focus:outline-none focus:border-blue-600/50 resize-none" />
              </div>

              <div className="pt-4 border-t border-[#1F1F23] flex justify-end">
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-lg shadow-blue-900/20">
                  Save Profile
                </button>
              </div>
            </div>
          </div>

          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-8">
             <h3 className="text-lg font-bold text-red-400 mb-2">Danger Zone</h3>
             <p className="text-xs text-zinc-500 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
             <button className="border border-red-500/50 text-red-500 hover:bg-red-500/10 px-6 py-2 rounded-lg text-xs font-bold transition-all active:scale-95">
                Delete Account
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
