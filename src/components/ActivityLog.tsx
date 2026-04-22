import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, Database, User, Shield, Terminal, Zap } from 'lucide-react';

interface Activity {
  id: string;
  type: 'db' | 'user' | 'security' | 'system';
  message: string;
  user: string;
  time: string;
  status: 'success' | 'warning' | 'error';
}

const MOCK_ACTIVITIES: Activity[] = [
  { id: '1', type: 'db', message: 'Document updated in /users/u1', user: 'Levani Ch.', time: '2m ago', status: 'success' },
  { id: '2', type: 'security', message: 'New Security Rules deployed', user: 'System', time: '15m ago', status: 'success' },
  { id: '3', type: 'user', message: 'Sarah logged in from new device', user: 'Sarah', time: '1h ago', status: 'warning' },
  { id: '4', type: 'db', message: 'Bulk import to /plants complete', user: 'Levani Ch.', time: '4h ago', status: 'success' },
  { id: '5', type: 'system', message: 'AuraDB Engine auto-scaling started', user: 'Orchestrator', time: '6h ago', status: 'success' },
  { id: '6', type: 'security', message: 'Blocked unusual traffic node (x.x.x.x)', user: 'WAF', time: '12h ago', status: 'error' },
];

interface ActivityLogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 w-96 h-full bg-[#0A0A0C] border-l border-[#1F1F23] z-[90] flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-[#1F1F23] flex items-center justify-between bg-[#111116]">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-blue-400" />
                  Activity Log
                </h3>
                <p className="text-[10px] text-zinc-500 uppercase font-bold mt-1">Real-time system events</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {MOCK_ACTIVITIES.map((activity) => (
                <div 
                  key={activity.id} 
                  className="bg-[#111116] border border-[#1F1F23] rounded-xl p-4 hover:border-zinc-700 transition-colors group cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 p-2 rounded-lg ${
                      activity.type === 'db' ? 'bg-blue-600/10 text-blue-400' :
                      activity.type === 'security' ? 'bg-amber-600/10 text-amber-400' :
                      activity.type === 'user' ? 'bg-emerald-600/10 text-emerald-400' : 'bg-zinc-600/10 text-zinc-400'
                    }`}>
                      {activity.type === 'db' && <Database className="w-4 h-4" />}
                      {activity.type === 'security' && <Shield className="w-4 h-4" />}
                      {activity.type === 'user' && <User className="w-4 h-4" />}
                      {activity.type === 'system' && <Zap className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-tighter">{activity.user}</span>
                        <span className="text-[9px] text-zinc-700 font-mono">{activity.time}</span>
                      </div>
                      <p className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors">{activity.message}</p>
                      <div className="mt-3 flex items-center gap-2">
                         <div className={`w-1.5 h-1.5 rounded-full ${
                           activity.status === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' :
                           activity.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                         }`}></div>
                         <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{activity.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-[#1F1F23] bg-[#111116]">
              <button className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all active:scale-95">
                Download Audit Log
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
