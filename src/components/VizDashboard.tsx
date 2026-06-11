import React, { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "motion/react";
import { SystemStats } from "../types";
import { Activity, Cpu, HardDrive, Zap } from "lucide-react";

export function VizDashboard({ isConnected }: { isConnected: boolean }) {
  const [data, setData] = useState<SystemStats[]>(() => {
    // initialize with some flat data
    return Array.from({ length: 20 }).map((_, i) => ({
      time: i.toString(),
      cpuUsage: 20,
      ramUsage: 45,
      vramUsage: 10,
      tokensPerSecond: 0,
    }));
  });

  useEffect(() => {
    if (!isConnected) return;
    
    // Simulate active system stats when connected
    const interval = setInterval(() => {
      setData((prev) => {
        const newData = [...prev.slice(1)];
        const last = prev[prev.length - 1];
        
        // random walk for realistic looking stats
        const nextCpu = Math.max(10, Math.min(95, last.cpuUsage + (Math.random() * 20 - 10)));
        const nextRam = Math.max(30, Math.min(80, last.ramUsage + (Math.random() * 5 - 2.5)));
        const nextVram = Math.max(10, Math.min(98, last.vramUsage + (Math.random() * 15 - 7)));
        const nextTps = Math.max(0, Math.min(60, last.tokensPerSecond + (Math.random() * 8 - 4)));
        
        newData.push({
          time: Date.now().toString(),
          cpuUsage: nextCpu,
          ramUsage: nextRam,
          vramUsage: nextVram,
          tokensPerSecond: nextTps,
        });
        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const currentStats = data[data.length - 1];

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<Cpu size={16} />} label="CORE UTIL" value={`${currentStats.cpuUsage.toFixed(1)}%`} color="text-cyan-400" />
        <StatCard icon={<HardDrive size={16} />} label="VRAM" value={`${currentStats.vramUsage.toFixed(1)}%`} color="text-purple-400" />
        <StatCard icon={<Activity size={16} />} label="RAM" value={`${currentStats.ramUsage.toFixed(1)}GB`} color="text-emerald-400" />
        <StatCard icon={<Zap size={16} />} label="SPEED" value={`${Math.round(currentStats.tokensPerSecond)} t/s`} color="text-amber-400" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-48 w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-xl"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        <div className="mb-2 text-xs font-semibold tracking-widest text-zinc-500">SYSTEM LOAD</div>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorVram" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c084fc" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#c084fc" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
              itemStyle={{ fontSize: '12px' }}
              labelStyle={{ display: 'none' }}
              cursor={{ stroke: '#3f3f46', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area type="monotone" dataKey="cpuUsage" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" isAnimationActive={false} />
            <Area type="monotone" dataKey="vramUsage" stroke="#c084fc" strokeWidth={2} fillOpacity={1} fill="url(#colorVram)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-3 shadow-inner shadow-zinc-800/20 backdrop-blur-md">
      <div className="flex items-center gap-2 text-zinc-500">
        {icon}
        <span className="text-[10px] font-bold tracking-widest">{label}</span>
      </div>
      <div className={`font-display text-xl font-semibold tracking-tight ${color}`}>
        {value}
      </div>
    </div>
  );
}
