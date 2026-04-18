import React, { useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { PageHeader } from './PageHeader';
import { Activity, AlertCircle, Clock, ExternalLink, Loader2 } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io();

export const AnalyticsView: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();

    socket.on('aura_sync', (event) => {
      if (event.type === 'stats_changed') {
        setStats(event.data);
      }
    });

    return () => {
      socket.off('aura_sync');
    };
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/analytics/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) return (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  const currentRequests = stats?.history?.length > 0 ? stats.history[stats.history.length - 1].requests : 0;
  const currentLatency = stats?.history?.length > 0 ? stats.history[stats.history.length - 1].latency : 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
      <PageHeader 
        title="Usage Statistics" 
        subtitle="Live performance metrics from the AuraDB Multi-Engine"
        action={
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-600/10 border border-blue-500/20 rounded text-[10px] text-blue-400 font-bold uppercase tracking-widest">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            Live Monitoring
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Requests', value: (stats?.totalRequests ?? 0).toLocaleString(), sub: `${currentRequests} current window`, icon: Activity, color: 'text-blue-500' },
          { label: 'System Errors', value: (stats?.totalErrors ?? 0).toLocaleString(), sub: '4xx/5xx responses', icon: AlertCircle, color: 'text-red-500' },
          { label: 'Avg Latency', value: `${currentLatency}ms`, sub: 'Server round-trip', icon: Clock, color: 'text-emerald-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#111116] border border-[#1F1F23] p-6 rounded-2xl shadow-lg border-l-4 border-l-blue-600/50">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={stat.color + " w-5 h-5"} />
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                Real-time
              </span>
            </div>
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-2xl font-bold text-white mt-1 tabular-nums">{stat.value}</h3>
            <p className="text-[10px] text-zinc-600 mt-2 font-mono italic">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Main Chart */}
        <div className="bg-[#111116] border border-[#1F1F23] p-6 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-sm font-bold text-white uppercase tracking-widest text-zinc-400">Throughput & Health History</h4>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Requests</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Errors</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.history ?? []}>
                <defs>
                  <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F23" vertical={false} />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#52525B" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#52525B" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181B', border: '1px solid #27272A', borderRadius: '8px', fontSize: '10px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="requests" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorReq)" 
                  animationDuration={500}
                />
                <Area 
                  type="monotone" 
                  dataKey="errors" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  fill="transparent"
                  strokeDasharray="5 5"
                  animationDuration={500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
