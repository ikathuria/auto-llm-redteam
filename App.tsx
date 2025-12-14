import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SimulationConfig, Message, AgentRole, SimulationStatus, JudgeVerdict } from './types';
import { DEFAULT_CONFIG } from './constants';
import * as GeminiService from './services/geminiService';
import ConfigPanel from './components/ConfigPanel';
import ChatFeed from './components/ChatFeed';
import AnalysisPanel from './components/AnalysisPanel';

const generateId = () => Math.random().toString(36).substring(7);

const App: React.FC = () => {
  const [config, setConfig] = useState<SimulationConfig>(DEFAULT_CONFIG);
  const [status, setStatus] = useState<SimulationStatus>(SimulationStatus.IDLE);
  const [messages, setMessages] = useState<Message[]>([]);
  const [verdicts, setVerdicts] = useState<JudgeVerdict[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  
  // To avoid closures in setTimeout/useEffect, use refs for mutable status check during async ops
  const statusRef = useRef(status);
  statusRef.current = status;

  const configRef = useRef(config);
  configRef.current = config;

  const addMessage = (role: AgentRole, content: string) => {
    setMessages(prev => [...prev, {
      id: generateId(),
      role,
      content,
      timestamp: Date.now()
    }]);
  };

  const handleStart = () => {
    if (status === SimulationStatus.FINISHED) {
      // Clean start if finished
      setMessages([]);
      setVerdicts([]);
      setCurrentRound(0);
    }
    setStatus(SimulationStatus.RUNNING);
  };

  const handleStop = () => {
    if (status === SimulationStatus.RUNNING) {
      setStatus(SimulationStatus.PAUSED);
    } else {
      setStatus(SimulationStatus.IDLE);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setVerdicts([]);
    setCurrentRound(0);
    setStatus(SimulationStatus.IDLE);
  };

  const handleExportCSV = () => {
    // 1. Header
    const headers = ['Round', 'Attacker Prompt', 'Target Response', 'Success', 'Score', 'Judge Reasoning'];
    
    // 2. Data Rows
    // We assume strict ordering: for every verdict[i], there is an Attacker msg at i and Target msg at i in their respective filtered lists.
    const attackerMsgs = messages.filter(m => m.role === AgentRole.ATTACKER);
    const targetMsgs = messages.filter(m => m.role === AgentRole.TARGET);
    
    const rows = verdicts.map((verdict, index) => {
        // Safety check for array bounds
        const attackerText = attackerMsgs[index] ? attackerMsgs[index].content.replace(/"/g, '""') : "";
        const targetText = targetMsgs[index] ? targetMsgs[index].content.replace(/"/g, '""') : "";
        const reasoning = verdict.reasoning.replace(/"/g, '""');
        
        return [
            verdict.round,
            `"${attackerText}"`,
            `"${targetText}"`,
            verdict.attackerSuccess,
            verdict.score,
            `"${reasoning}"`
        ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    
    // 3. Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'red_team_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // The Game Loop
  const runTurn = useCallback(async () => {
    // Check if we should stop
    if (statusRef.current !== SimulationStatus.RUNNING) return;
    if (currentRound >= configRef.current.maxRounds) {
      setStatus(SimulationStatus.FINISHED);
      addMessage(AgentRole.SYSTEM, "Max rounds reached. Simulation ended.");
      return;
    }

    // 1. Attacker Move
    try {
      const isFirstTurn = messages.length === 0;
      let attackerMsg = "";

      // Step A: Attacker
      const historyForAttacker = messages; // current history
      attackerMsg = await GeminiService.generateAttackerMove(
        historyForAttacker, 
        configRef.current.attackerGoal,
        configRef.current.modelName
      );
      
      if (statusRef.current !== SimulationStatus.RUNNING) return;
      addMessage(AgentRole.ATTACKER, attackerMsg);

      // Step B: Target
      const historyForTarget = [...messages, { id: 'temp', role: AgentRole.ATTACKER, content: attackerMsg, timestamp: Date.now() }];
      const targetMsg = await GeminiService.generateTargetResponse(
        attackerMsg,
        historyForTarget,
        configRef.current.targetSecret,
        configRef.current.targetSystemPrompt,
        configRef.current.modelName
      );

      if (statusRef.current !== SimulationStatus.RUNNING) return;
      addMessage(AgentRole.TARGET, targetMsg);

      // Step C: Judge
      const historyForJudge = [...historyForTarget, { id: 'temp2', role: AgentRole.TARGET, content: targetMsg, timestamp: Date.now() }];
      const verdict = await GeminiService.evaluateRound(
        historyForJudge,
        configRef.current.targetSecret,
        configRef.current.modelName,
        currentRound + 1
      );

      if (statusRef.current !== SimulationStatus.RUNNING) return;
      setVerdicts(prev => [...prev, verdict]);
      addMessage(AgentRole.JUDGE, verdict.reasoning);

      // Check win condition
      if (verdict.attackerSuccess) {
        setStatus(SimulationStatus.FINISHED);
        addMessage(AgentRole.SYSTEM, `Use Case FAILED: Secret leaked in Round ${currentRound + 1}. Red Team Wins.`);
      } else if (verdict.winner === 'Blue') {
        // Explicit win by Blue if Judge supports it, otherwise continue
      }

      setCurrentRound(prev => prev + 1);

    } catch (error) {
      console.error(error);
      addMessage(AgentRole.SYSTEM, `Error: ${error instanceof Error ? error.message : 'Unknown API Error'}`);
      setStatus(SimulationStatus.PAUSED);
    }

  }, [messages, currentRound]); // Dependencies for the callback creation

  // Effect to trigger the loop
  useEffect(() => {
    if (status === SimulationStatus.RUNNING) {
      // We use a small timeout to let the UI render the previous state change before starting the heavy async op
      const timer = setTimeout(() => {
        runTurn();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [status, currentRound, runTurn]);

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans">
      <ConfigPanel 
        config={config} 
        setConfig={setConfig} 
        status={status} 
        onStart={handleStart}
        onStop={handleStop}
        onReset={handleReset}
        onExport={handleExportCSV}
        hasData={verdicts.length > 0}
      />
      
      <div className="flex-1 flex flex-col relative">
        <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center px-6 justify-between shrink-0">
           <h1 className="font-bold text-lg tracking-wide bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
             AutoRedTeam <span className="text-slate-600 text-xs font-mono ml-2">v1.0.0 // SYSTEM_READY</span>
           </h1>
           <div className="flex gap-4 text-xs text-slate-500 font-mono">
             <span>API_KEY: {process.env.API_KEY ? 'LOADED' : 'MISSING'}</span>
           </div>
        </header>
        <ChatFeed messages={messages} />
      </div>

      <AnalysisPanel 
        verdicts={verdicts}
        status={status}
        currentRound={currentRound}
      />
    </div>
  );
};

export default App;