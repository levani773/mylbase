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
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { PageHeader } from './PageHeader';
import { Activity, AlertCircle, Clock, ExternalLink, Loader2, RefreshCw, TrendingUp } from 'lucide-react';
import { useToast } from './Toast';
import { io } from 'socket.io-client';

const socket = io();

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const AnalyticsView: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { info } = useToast();

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* Secondary Charts */}
        <div className="space-y-6">
          <div className="bg-[#111116] border border-[#1F1F23] p-6 rounded-2xl shadow-xl h-[180px]">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Latency Distribution</h4>
            <div className="h-24 w-full">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.history?.slice(-10) ?? []}>
                  <Bar dataKey="latency" radius={[4, 4, 0, 0]}>
                    {(stats?.history?.slice(-10) ?? []).map((entry: any, index: number) => (
                      <Cell key={index} fill={entry.latency > 100 ? '#EF4444' : '#10B981'} opacity={0.8} />
                    ))}
                  </Bar>
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ display: 'none' }} />
                </BarChart>
               </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[10px] text-zinc-600 font-mono">Last 10 frames</span>
              <span className="text-[11px] text-emerald-400 font-bold">Stable performance</span>
            </div>
          </div>

          <div className="bg-[#111116] border border-[#1F1F23] p-6 rounded-2xl shadow-xl">
             <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Global Traffic Distribution</h4>
                <TrendingUp className="w-4 h-4 text-zinc-700" />
             </div>
             <div className="flex items-center gap-8">
                <div className="w-20 h-20">
                   <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'US-East', value: 45 },
                          { name: 'EU-West', value: 30 },
                          { name: 'Asia-South', value: 25 },
                        ]}
                        innerRadius={25}
                        outerRadius={40}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} stroke="transparent" />
                        ))}
                      </Pie>
                    </PieChart>
                   </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                   {[
                     { label: 'US-East', value: '45%', color: 'bg-blue-500' },
                     { label: 'EU-West', value: '30%', color: 'bg-emerald-500' },
                     { label: 'Asia-South', value: '25%', color: 'bg-amber-500' },
                   ].map((region, i) => (
                     <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className={`w-1.5 h-1.5 rounded-full ${region.color}`}></div>
                           <span className="text-[10px] text-zinc-400">{region.label}</span>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-300 font-mono">{region.value}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
