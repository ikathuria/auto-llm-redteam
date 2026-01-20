import React from 'react';
import { SimulationConfig, SimulationStatus } from '../types';
import { DEFAULT_CONFIG, AVAILABLE_MODELS } from '../constants';
import { Settings, ShieldAlert, Target, Database, Download } from 'lucide-react';

interface ConfigPanelProps {
  config: SimulationConfig;
  setConfig: (c: SimulationConfig) => void;
  status: SimulationStatus;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onExport: () => void;
  hasData: boolean;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({
  config, setConfig, status, onStart, onStop, onReset, onExport, hasData
}) => {
  const isLocked = status === SimulationStatus.RUNNING || status === SimulationStatus.PAUSED;

  const handleChange = (field: keyof SimulationConfig, value: any) => {
    setConfig({ ...config, [field]: value });
  };

  return (
    <div className="bg-slate-900 border-r border-slate-800 w-full md:w-80 flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-slate-800 flex items-center gap-2">
        <Settings className="w-5 h-5 text-indigo-400" />
        <h2 className="font-bold text-slate-100">Mission Control</h2>
      </div>

      <div className="p-4 space-y-6">
        {/* Secret Configuration */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase text-emerald-400">
            <Database className="w-3 h-3" /> Target Secret
          </label>
          <textarea
            disabled={isLocked}
            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-300 focus:border-emerald-500 outline-none transition-colors"
            rows={2}
            value={config.targetSecret}
            onChange={(e) => handleChange('targetSecret', e.target.value)}
          />
        </div>

        {/* Target System Prompt */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase text-blue-400">
            <ShieldAlert className="w-3 h-3" /> Blue Team Instructions
          </label>
          <textarea
            disabled={isLocked}
            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-300 focus:border-blue-500 outline-none transition-colors"
            rows={5}
            value={config.targetSystemPrompt}
            onChange={(e) => handleChange('targetSystemPrompt', e.target.value)}
          />
          <p className="text-[10px] text-slate-500">Note: Use {'{SECRET}'} as a placeholder.</p>
        </div>

        {/* Attacker Goal */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase text-rose-400">
            <Target className="w-3 h-3" /> Red Team Goal
          </label>
          <textarea
            disabled={isLocked}
            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-300 focus:border-rose-500 outline-none transition-colors"
            rows={3}
            value={config.attackerGoal}
            onChange={(e) => handleChange('attackerGoal', e.target.value)}
          />
        </div>

        {/* Settings */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Max Rounds</label>
            <input
              type="number"
              disabled={isLocked}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white"
              value={config.maxRounds}
              onChange={(e) => handleChange('maxRounds', parseInt(e.target.value))}
              min={1} max={20}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Model</label>
            <select
              disabled={isLocked}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white"
              value={config.modelName}
              onChange={(e) => handleChange('modelName', e.target.value)}
            >
              {AVAILABLE_MODELS.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-auto p-4 border-t border-slate-800 space-y-2">
        {status === SimulationStatus.IDLE || status === SimulationStatus.FINISHED ? (
          <button
            onClick={onStart}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold text-sm transition-colors flex justify-center items-center gap-2"
          >
            Start Simulation
          </button>
        ) : (
          <button
            onClick={onStop}
            className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold text-sm transition-colors"
          >
            {status === SimulationStatus.PAUSED ? "Resume" : "Stop / Pause"}
          </button>
        )}

        <div className="flex gap-2">
          <button
            onClick={onReset}
            disabled={status === SimulationStatus.RUNNING}
            className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold text-sm transition-colors disabled:opacity-50"
          >
            Reset
          </button>

          <button
            onClick={onExport}
            disabled={!hasData}
            className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            title="Download CSV Report"
          >
            <Download className="w-4 h-4" /> CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigPanel;