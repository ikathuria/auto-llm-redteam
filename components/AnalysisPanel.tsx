import React from 'react';
import { JudgeVerdict, SimulationStatus, SimulationConfig } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, CheckCircle, XCircle, Activity, ShieldAlert, Cpu } from 'lucide-react';
import { AVAILABLE_MODELS } from '../constants';

interface AnalysisPanelProps {
  verdicts: JudgeVerdict[];
  status: SimulationStatus;
  currentRound: number;
  config: SimulationConfig;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ verdicts, status, currentRound, config }) => {
  const lastVerdict = verdicts[verdicts.length - 1];
  const chartData = verdicts.map(v => ({ round: `Round ${v.round}`, score: v.score }));

  // Calculated Stats
  const avgRisk = verdicts.length > 0 
    ? Math.round(verdicts.reduce((sum, v) => sum + v.score, 0) / verdicts.length) 
    : 0;

  const maxRisk = verdicts.length > 0
    ? Math.max(...verdicts.map(v => v.score))
    : 0;

  const isBreached = verdicts.some(v => v.attackerSuccess);

  const getSystemStatusLabel = () => {
    if (isBreached) return { text: "COMPROMISED", color: "text-rose-500", bg: "border-rose-900/40 bg-rose-950/10" };
    if (maxRisk > 70) return { text: "HIGH RISK", color: "text-amber-500 animate-pulse", bg: "border-amber-900/40 bg-amber-950/10" };
    if (maxRisk > 35) return { text: "ELEVATED THREAT", color: "text-blue-400", bg: "border-blue-900/40 bg-blue-950/10" };
    if (status === SimulationStatus.RUNNING) return { text: "ACTIVE MONITORING", color: "text-indigo-400 animate-pulse", bg: "border-indigo-900/40 bg-indigo-950/10" };
    return { text: "SECURE", color: "text-emerald-400", bg: "border-emerald-900/40 bg-emerald-950/10" };
  };

  const getModelLabel = (modelId: string) => {
    const found = AVAILABLE_MODELS.find(m => m.id === modelId);
    return found ? found.name.split(" (")[0] : modelId;
  };

  const systemStatus = getSystemStatusLabel();

  return (
    <div className="w-full md:w-80 border-l border-slate-800 bg-slate-900/50 flex flex-col h-full overflow-y-auto shrink-0 select-none">
      {/* Telemetry Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-2">
        <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
        <h2 className="font-bold text-slate-100 text-sm tracking-wide">Live Telemetry</h2>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Environment Specs */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Target Environment</span>
          </div>
          <div className="space-y-1 text-[10px] font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">ATTACKER:</span>
              <span className="text-rose-400 font-bold truncate max-w-[130px]" title={getModelLabel(config.attackerModel)}>
                {config.useMockMode ? "MOCK RUNNER" : getModelLabel(config.attackerModel)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">TARGET:</span>
              <span className="text-cyan-400 font-bold truncate max-w-[130px]" title={getModelLabel(config.targetModel)}>
                {config.useMockMode ? "MOCK DEVIATOR" : getModelLabel(config.targetModel)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ARBITER:</span>
              <span className="text-emerald-400 font-bold truncate max-w-[130px]" title={getModelLabel(config.judgeModel)}>
                {config.useMockMode ? "MOCK EVALUATOR" : getModelLabel(config.judgeModel)}
              </span>
            </div>
          </div>
        </div>

        {/* System Health / Status Card */}
        <div className={`border rounded-xl p-4 transition-all duration-300 ${systemStatus.bg}`}>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Defense Shield Status</div>
          <div className={`text-base font-mono font-bold flex items-center gap-2 ${systemStatus.color}`}>
            {systemStatus.text}
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isBreached ? 'bg-rose-400' : maxRisk > 70 ? 'bg-amber-400' : 'bg-indigo-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isBreached ? 'bg-rose-500' : maxRisk > 70 ? 'bg-amber-500' : 'bg-indigo-500'
              }`} />
            </span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 font-mono flex justify-between">
            <span>Simulation: {status}</span>
            <span>Round: {currentRound} / {config.maxRounds}</span>
          </div>
        </div>

        {/* Secondary Stats Row */}
        <div className="grid grid-cols-2 gap-2 font-mono">
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-center">
            <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Peak Risk</div>
            <div className={`text-base font-bold ${maxRisk > 70 ? 'text-rose-500' : maxRisk > 35 ? 'text-amber-500' : 'text-emerald-500'}`}>
              {maxRisk}%
            </div>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-center font-mono">
            <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Avg Risk</div>
            <div className="text-base font-bold text-slate-300">
              {avgRisk}%
            </div>
          </div>
        </div>

        {/* Verdict Details */}
        {lastVerdict ? (
          <div className={`bg-slate-950/60 border rounded-xl p-4 space-y-3 ${
            lastVerdict.attackerSuccess ? 'border-rose-900/30' : 'border-slate-800/80'
          }`}>
            <div className="flex justify-between items-center">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Latest Verdict</div>
              {lastVerdict.attackerSuccess ? (
                <div className="flex items-center gap-1 text-xs text-rose-400 font-mono font-bold">
                  <XCircle className="w-3.5 h-3.5 text-rose-500" />
                  <span>LEAK</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-emerald-400 font-mono font-bold">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>SECURE</span>
                </div>
              )}
            </div>
            
            <p className="text-[11px] text-slate-400 italic leading-relaxed border-l-2 border-slate-800 pl-2">
              "{lastVerdict.reasoning}"
            </p>
            
            <div>
              <div className="flex justify-between text-[9px] uppercase font-bold text-slate-500 mb-1 font-mono">
                <span>Intrusion Score</span>
                <span className={lastVerdict.score > 70 ? 'text-rose-400' : lastVerdict.score > 35 ? 'text-amber-400' : 'text-slate-400'}>
                  {lastVerdict.score}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${
                    lastVerdict.score > 70 ? 'bg-gradient-to-r from-rose-600 to-rose-400' : 
                    lastVerdict.score > 35 ? 'bg-gradient-to-r from-amber-600 to-amber-400' : 
                    'bg-gradient-to-r from-emerald-600 to-emerald-400'
                  }`} 
                  style={{ width: `${lastVerdict.score}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
            <ShieldAlert className="w-6 h-6 text-slate-700 mx-auto mb-1.5" />
            <p className="text-[10px] text-slate-500 font-mono">Waiting for Arbiter verdict...</p>
          </div>
        )}

        {/* Risk Chart */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-rose-500" />
            <span>Risk Trajectory</span>
          </div>
          <div className="h-32 w-full font-mono text-[9px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="round" stroke="#475569" tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} stroke="#475569" tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '10px' }} 
                    itemStyle={{ color: '#f43f5e' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#f43f5e" 
                    fillOpacity={1} 
                    fill="url(#colorRisk)" 
                    strokeWidth={1.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-700 italic text-[10px]">
                No trajectory data available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPanel;
