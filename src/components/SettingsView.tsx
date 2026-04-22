import React, { useState } from 'react';
import { PageHeader } from './PageHeader';
import { User, Settings, CreditCard, Shield, Bell, Globe, ChevronRight, Lock, Key, Mail, Smartphone } from 'lucide-react';
import { cn } from '../lib/utils';
import { useToast } from './Toast';

type Tab = 'profile' | 'organization' | 'billing' | 'security' | 'notifications' | 'custom-domain';

export const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const { success } = useToast();

  const menuItems = [
    { id: 'profile' as Tab, label: 'Profile', icon: User },
    { id: 'organization' as Tab, label: 'Organization', icon: Settings },
    { id: 'billing' as Tab, label: 'Billing', icon: CreditCard },
    { id: 'security' as Tab, label: 'Security', icon: Shield },
    { id: 'notifications' as Tab, label: 'Notifications', icon: Bell },
    { id: 'custom-domain' as Tab, label: 'Custom Domain', icon: Globe },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
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
                  <button 
                    onClick={() => success('Profile Updated', 'Your changes have been saved successfully.')}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-lg shadow-blue-900/20"
                  >
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
        );
      case 'organization':
        return (
          <div className="bg-[#111116] border border-[#1F1F23] rounded-xl p-8">
            <h3 className="text-lg font-bold text-white mb-6">Organization Settings</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Organization Name</label>
                <input type="text" defaultValue="AuraDB Labs" className="w-full bg-[#1A1A20] border border-[#2F2F37] rounded-lg py-2 px-4 text-sm text-zinc-300 focus:outline-none focus:border-blue-600/50" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Unique Slug</label>
                <div className="flex gap-2">
                  <div className="bg-[#1A1A20] border border-[#2F2F37] rounded-lg py-2 px-4 text-sm text-zinc-600 font-mono">aura.db/org/</div>
                  <input type="text" defaultValue="auradb-labs" className="flex-1 bg-[#1A1A20] border border-[#2F2F37] rounded-lg py-2 px-4 text-sm text-zinc-300 focus:outline-none focus:border-blue-600/50" />
                </div>
              </div>
              <div className="pt-4 border-t border-[#1F1F23]">
                <button 
                  onClick={() => success('Organization Saved', 'Corporate settings updated successfully.')}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-xs font-bold transition-all"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        );
      case 'billing':
        return (
          <div className="space-y-6">
            <div className="bg-[#111116] border border-[#1F1F23] rounded-xl p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-white">Billing & Subscription</h3>
                  <p className="text-xs text-zinc-500 mt-1">Manage your plan and payment methods</p>
                </div>
                <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-widest">
                  Enterprise Plan
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-[#0A0A0C] border border-[#1F1F23] rounded-xl">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Current Usage</p>
                  <p className="text-xl font-bold text-white">$142.50</p>
                  <div className="mt-2 w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="w-2/3 h-full bg-blue-600"></div>
                  </div>
                </div>
                <div className="p-4 bg-[#0A0A0C] border border-[#1F1F23] rounded-xl">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Days Remaining</p>
                  <p className="text-xl font-bold text-white">18 Days</p>
                  <p className="text-[10px] text-zinc-600 mt-2 font-mono">Next payout: May 10, 2026</p>
                </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Recent Invoices</h4>
                 {[
                   { id: 'INV-2026-004', amount: '$499.00', date: 'Apr 01, 2026', status: 'Paid' },
                   { id: 'INV-2026-003', amount: '$499.00', date: 'Mar 01, 2026', status: 'Paid' },
                 ].map((inv, i) => (
                   <div key={i} className="flex items-center justify-between p-3 bg-[#0A0A0C]/50 border border-[#1F1F23] rounded-lg group">
                      <div className="flex items-center gap-4">
                         <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-zinc-500 text-[10px] font-bold">PDF</div>
                         <div>
                            <p className="text-xs font-bold text-white">{inv.id}</p>
                            <p className="text-[10px] text-zinc-600">{inv.date}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <span className="text-xs font-bold text-white">{inv.amount}</span>
                         <div className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded text-[9px] font-bold uppercase">{inv.status}</div>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6">
            <div className="bg-[#111116] border border-[#1F1F23] rounded-xl p-8">
              <h3 className="text-lg font-bold text-white mb-6">Security & Access</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-[#0A0A0C] border border-[#1F1F23] rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-600/10 rounded-lg">
                      <Lock className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Two-Factor Authentication</p>
                      <p className="text-xs text-zinc-500">Secure your account with 2FA</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg">Enable</button>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#0A0A0C] border border-[#1F1F23] rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-zinc-800 rounded-lg">
                      <Key className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Reset Password</p>
                      <p className="text-xs text-zinc-500">Change your login credentials</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg">Reset</button>
                </div>
              </div>
            </div>
            
            <div className="bg-[#111116] border border-[#1F1F23] rounded-xl p-8">
               <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Active Sessions</h4>
               <div className="space-y-3">
                  {[
                    { device: 'MacBook Pro 16"', location: 'London, UK', status: 'Current', icon: Smartphone },
                    { device: 'iPhone 15 Pro', location: 'London, UK', status: 'Active', icon: Smartphone },
                  ].map((session, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-[#0A0A0C]/50 border border-[#1F1F23] rounded-lg">
                       <div className="flex items-center gap-3">
                          <session.icon className="w-4 h-4 text-zinc-500" />
                          <div>
                             <p className="text-xs font-bold text-white">{session.device}</p>
                             <p className="text-[10px] text-zinc-600">{session.location}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          <span className={`text-[9px] font-bold uppercase ${session.status === 'Current' ? 'text-blue-400' : 'text-zinc-600'}`}>{session.status}</span>
                          {session.status !== 'Current' && <button className="text-[9px] text-red-500 hover:underline">Revoke</button>}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="bg-[#111116] border border-[#1F1F23] rounded-xl p-8">
            <h3 className="text-lg font-bold text-white mb-6">Notification Preferences</h3>
            <div className="space-y-6">
              {[
                { title: 'Security Alerts', desc: 'Critical alerts about account security', icon: Mail, checked: true },
                { title: 'Billing Reports', desc: 'Monthly invoices and usage reports', icon: Mail, checked: true },
                { title: 'Marketing', desc: 'Updates about new features and ecosystem', icon: Mail, checked: false },
              ].map((notif, i) => (
                <div key={i} className="flex items-center justify-between py-4 border-b border-[#1F1F23] last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-zinc-800 rounded-lg">
                      <notif.icon className="w-4 h-4 text-zinc-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{notif.title}</p>
                      <p className="text-xs text-zinc-500">{notif.desc}</p>
                    </div>
                  </div>
                  <div 
                    className={cn(
                      "w-10 h-5 rounded-full relative cursor-pointer transition-colors",
                      notif.checked ? "bg-blue-600" : "bg-zinc-800"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-3 h-3 bg-white rounded-full transition-transform",
                      notif.checked ? "right-1" : "left-1"
                    )} />
                  </div>
                </div>
              ))}
              <div className="pt-4 flex justify-end">
                 <button 
                  onClick={() => success('Preferences Saved', 'Your notifications have been updated.')}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-xs font-bold transition-all"
                 >
                   Save Preferences
                 </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

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
              {menuItems.map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all mb-1",
                    activeTab === item.id 
                      ? 'bg-blue-600/10 text-blue-400 font-medium' 
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className={cn("w-3 h-3 transition-opacity", activeTab === item.id ? 'opacity-100' : 'opacity-30')} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};
