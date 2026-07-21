import React from 'react';
import { SimulationConfig, SimulationStatus, ApiKeys } from '../types';
import { DEFAULT_CONFIG, AVAILABLE_MODELS, PLAYBOOKS } from '../constants';
import { Settings, ShieldAlert, Target, Database, Download, Key, HelpCircle, Sparkles } from 'lucide-react';

interface ConfigPanelProps {
  config: SimulationConfig;
  setConfig: (c: SimulationConfig) => void;
  status: SimulationStatus;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onExport: () => void;
  onExportMarkdown: () => void;
  hasData: boolean;
  onOpenKeyModal: () => void;
  apiKeys: ApiKeys;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({
  config, setConfig, status, onStart, onStop, onReset, onExport, onExportMarkdown, hasData, onOpenKeyModal, apiKeys
}) => {
  const isLocked = status === SimulationStatus.RUNNING || status === SimulationStatus.PAUSED;

  const handleChange = (field: keyof SimulationConfig, value: any) => {
    setConfig({ ...config, [field]: value });
  };

  const handlePlaybookChange = (playbookId: string) => {
    const selected = PLAYBOOKS.find(p => p.id === playbookId);
    if (selected) {
      setConfig({
        ...config,
        playbookId,
        targetSecret: selected.targetSecret,
        targetSystemPrompt: selected.targetSystemPrompt,
        attackerGoal: selected.attackerGoal
      });
    }
  };

  // Check which keys are set
  const keysCount = [apiKeys.gemini, apiKeys.openai, apiKeys.groq].filter(Boolean).length;

  return (
    <div className="bg-slate-900 border-r border-slate-800 w-full md:w-80 flex flex-col h-full overflow-y-auto shrink-0 select-none">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          <h2 className="font-bold text-slate-100 text-sm tracking-wide">Mission Control</h2>
        </div>
        <button
          onClick={onOpenKeyModal}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold border transition-colors ${
            keysCount > 0 
              ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-900/30' 
              : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-700'
          }`}
          title="Configure API Keys"
        >
          <Key className="w-3 h-3" />
          {keysCount > 0 ? `${keysCount} Keys` : 'Set Keys'}
        </button>
      </div>

      <div className="p-4 space-y-5 flex-1">
        {/* Playbook Playbook Selector */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-400">
            <Sparkles className="w-3 h-3" /> Vulnerability Scenario
          </label>
          <select
            disabled={isLocked}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white outline-none focus:border-indigo-500 transition-colors"
            value={config.playbookId}
            onChange={(e) => handlePlaybookChange(e.target.value)}
          >
            {PLAYBOOKS.map(playbook => (
              <option key={playbook.id} value={playbook.id}>
                {playbook.name}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-slate-400 italic mt-1 bg-slate-950/40 p-2 rounded border border-slate-800/80">
            {PLAYBOOKS.find(p => p.id === config.playbookId)?.description}
          </p>
        </div>

        {/* Secret Configuration */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            <Database className="w-3 h-3" /> Target Secret (Flag)
          </label>
          <textarea
            disabled={isLocked}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-300 focus:border-emerald-500 outline-none transition-colors"
            rows={1}
            value={config.targetSecret}
            onChange={(e) => handleChange('targetSecret', e.target.value)}
          />
        </div>

        {/* Target System Prompt */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-400">
            <ShieldAlert className="w-3 h-3" /> Blue Team System Prompt (Defense)
          </label>
          <textarea
            disabled={isLocked}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-300 focus:border-blue-500 outline-none transition-colors font-mono"
            rows={4}
            value={config.targetSystemPrompt}
            onChange={(e) => handleChange('targetSystemPrompt', e.target.value)}
          />
          <p className="text-[9px] text-slate-500">Inject code with <code className="text-slate-300 font-mono">{'{SECRET}'}</code>.</p>
        </div>

        {/* Attacker Goal */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-400">
            <Target className="w-3 h-3" /> Red Team Goal (Attack)
          </label>
          <textarea
            disabled={isLocked}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-300 focus:border-rose-500 outline-none transition-colors"
            rows={2}
            value={config.attackerGoal}
            onChange={(e) => handleChange('attackerGoal', e.target.value)}
          />
        </div>

        {/* Models Config Panel */}
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Agent Duel Configuration</h3>
          
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Red Team (Attacker)</label>
            <select
              disabled={isLocked || config.useMockMode}
              className="w-full bg-slate-950 border border-slate-700 rounded-md p-1.5 text-[11px] text-white outline-none disabled:opacity-50"
              value={config.attackerModel}
              onChange={(e) => handleChange('attackerModel', e.target.value)}
            >
              {AVAILABLE_MODELS.map(model => (
                <option key={`a-${model.id}`} value={model.id}>{model.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Blue Team (Target)</label>
            <select
              disabled={isLocked || config.useMockMode}
              className="w-full bg-slate-950 border border-slate-700 rounded-md p-1.5 text-[11px] text-white outline-none disabled:opacity-50"
              value={config.targetModel}
              onChange={(e) => handleChange('targetModel', e.target.value)}
            >
              {AVAILABLE_MODELS.map(model => (
                <option key={`t-${model.id}`} value={model.id}>{model.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Arbiter (Safety Judge)</label>
            <select
              disabled={isLocked || config.useMockMode}
              className="w-full bg-slate-950 border border-slate-700 rounded-md p-1.5 text-[11px] text-white outline-none disabled:opacity-50"
              value={config.judgeModel}
              onChange={(e) => handleChange('judgeModel', e.target.value)}
            >
              {AVAILABLE_MODELS.map(model => (
                <option key={`j-${model.id}`} value={model.id}>{model.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Mock Mode Toggle */}
        <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>Mock Simulation Mode</span>
            <HelpCircle className="w-3.5 h-3.5 text-slate-500 cursor-help" title="If enabled, uses pre-scripted high-fidelity simulation transcripts. Ideal for portfolio demos without setting up API keys." />
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              disabled={isLocked}
              checked={config.useMockMode}
              onChange={(e) => handleChange('useMockMode', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white peer-checked:after:border-indigo-600"></div>
          </label>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="p-4 border-t border-slate-800 space-y-2 bg-slate-950/40">
        {status === SimulationStatus.IDLE || status === SimulationStatus.FINISHED ? (
          <button
            onClick={onStart}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs transition-colors flex justify-center items-center gap-2 shadow-lg shadow-indigo-600/10"
          >
            Start Simulation
          </button>
        ) : (
          <button
            onClick={onStop}
            className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-xs transition-colors shadow-lg shadow-rose-600/10"
          >
            {status === SimulationStatus.PAUSED ? "Resume Simulation" : "Pause Simulation"}
          </button>
        )}

        <div className="flex gap-2">
          <button
            onClick={onReset}
            disabled={status === SimulationStatus.RUNNING}
            className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md font-bold text-[10px] tracking-wide transition-colors disabled:opacity-40"
          >
            Reset
          </button>

          <div className="flex-1 flex gap-1">
            <button
              onClick={onExport}
              disabled={!hasData}
              className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-md font-bold text-[10px] tracking-wide transition-colors disabled:opacity-40 flex items-center justify-center gap-1"
              title="Export to CSV"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
            <button
              onClick={onExportMarkdown}
              disabled={!hasData}
              className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-md font-bold text-[10px] tracking-wide transition-colors disabled:opacity-40 flex items-center justify-center gap-1"
              title="Export Report (Markdown)"
            >
              <Download className="w-3.5 h-3.5" /> MD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigPanel;