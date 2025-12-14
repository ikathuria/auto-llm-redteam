import React from 'react';
import { JudgeVerdict, SimulationStatus } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, CheckCircle, XCircle, Activity } from 'lucide-react';

interface AnalysisPanelProps {
  verdicts: JudgeVerdict[];
  status: SimulationStatus;
  currentRound: number;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ verdicts, status, currentRound }) => {
  const lastVerdict = verdicts[verdicts.length - 1];
  const chartData = verdicts.map(v => ({ round: `R${v.round}`, score: v.score }));

  return (
    <div className="w-full md:w-80 border-l border-slate-800 bg-slate-900/50 flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-slate-800 flex items-center gap-2">
        <Activity className="w-5 h-5 text-emerald-400" />
        <h2 className="font-bold text-slate-100">Live Telemetry</h2>
      </div>

      <div className="p-4 space-y-6">
        
        {/* Status Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
           <div className="text-xs font-bold text-slate-500 uppercase mb-1">Status</div>
           <div className={`text-lg font-mono font-bold flex items-center gap-2 ${
             status === SimulationStatus.RUNNING ? 'text-indigo-400 animate-pulse' :
             status === SimulationStatus.FINISHED ? 'text-slate-200' : 'text-slate-400'
           }`}>
             {status}
             {status === SimulationStatus.RUNNING && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
           </div>
           <div className="mt-2 text-xs text-slate-500">Round: {currentRound}</div>
        </div>

        {/* Verdict Card */}
        {lastVerdict ? (
          <div className={`bg-slate-950 border rounded-lg p-4 ${lastVerdict.attackerSuccess ? 'border-rose-900/50' : 'border-emerald-900/50'}`}>
             <div className="flex justify-between items-center mb-2">
               <div className="text-xs font-bold text-slate-500 uppercase">Latest Verdict</div>
               {lastVerdict.attackerSuccess ? 
                 <XCircle className="w-4 h-4 text-rose-500" /> : 
                 <CheckCircle className="w-4 h-4 text-emerald-500" />
               }
             </div>
             <div className="text-sm text-slate-200 font-medium mb-2">
               {lastVerdict.attackerSuccess ? "CRITICAL LEAK DETECTED" : "System Secure"}
             </div>
             <p className="text-xs text-slate-400 italic">"{lastVerdict.reasoning}"</p>
             
             <div className="mt-4">
                <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500 mb-1">
                   <span>Leak Probability</span>
                   <span>{lastVerdict.score}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                   <div 
                     className={`h-full transition-all duration-500 ${lastVerdict.score > 70 ? 'bg-rose-500' : lastVerdict.score > 30 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                     style={{ width: `${lastVerdict.score}%` }}
                   />
                </div>
             </div>
          </div>
        ) : (
          <div className="text-center p-6 border border-dashed border-slate-800 rounded-lg">
             <AlertTriangle className="w-8 h-8 text-slate-700 mx-auto mb-2" />
             <p className="text-xs text-slate-600">No judge analysis available yet.</p>
          </div>
        )}

        {/* Chart */}
        <div className="h-48 w-full mt-4">
          <div className="text-xs font-bold text-slate-500 uppercase mb-2">Risk Trajectory</div>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="round" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }} 
                itemStyle={{ color: '#f43f5e' }}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#f43f5e" 
                fillOpacity={1} 
                fill="url(#colorScore)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default AnalysisPanel;
