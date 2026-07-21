import React, { useEffect, useRef } from 'react';
import { Message, AgentRole } from '../types';
import { Bot, User, ShieldCheck, Terminal } from 'lucide-react';
import { AVAILABLE_MODELS } from '../constants';

interface ChatFeedProps {
  messages: Message[];
}

const ChatFeed: React.FC<ChatFeedProps> = ({ messages }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getIcon = (role: AgentRole) => {
    switch (role) {
      case AgentRole.ATTACKER: return <User className="w-4 h-4 text-rose-400" />;
      case AgentRole.TARGET: return <Bot className="w-4 h-4 text-cyan-400" />;
      case AgentRole.JUDGE: return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      default: return <Terminal className="w-4 h-4 text-slate-400" />;
    }
  };

  const getBubbleStyle = (role: AgentRole) => {
    switch (role) {
      case AgentRole.ATTACKER: 
        return "border-rose-500/20 bg-rose-950/10 text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.02)]";
      case AgentRole.TARGET: 
        return "border-cyan-500/20 bg-cyan-950/10 text-cyan-100 ml-auto shadow-[0_0_15px_rgba(6,182,212,0.02)]";
      case AgentRole.JUDGE: 
        return "border-emerald-500/20 bg-emerald-950/10 text-emerald-100 w-full text-center border-dashed";
      default: 
        return "border-slate-800 bg-slate-900/40 text-slate-300";
    }
  };

  const getModelLabel = (modelId?: string) => {
    if (!modelId) return "";
    const found = AVAILABLE_MODELS.find(m => m.id === modelId);
    return found ? found.name.split(" (")[0] : modelId;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-6 relative flex flex-col min-h-0 select-text">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none"></div>

      <div className="space-y-5 relative z-10 flex-1">
        {messages.length === 0 && (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-700 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg shadow-indigo-950/20">
              <Terminal className="w-8 h-8 text-indigo-500/40" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-mono font-bold text-slate-400">Sequence System Idle</p>
              <p className="text-[11px] text-slate-500">Configure parameters and start simulation in the panel.</p>
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isSystem = msg.role === AgentRole.SYSTEM;
          const isJudge = msg.role === AgentRole.JUDGE;
          const isTarget = msg.role === AgentRole.TARGET;

          if (isSystem) {
            return (
              <div key={msg.id} className="mx-auto max-w-xl text-center py-2 px-4 rounded bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                <span>{msg.content}</span>
              </div>
            );
          }

          return (
            <div 
              key={msg.id} 
              className={`flex gap-3 max-w-[85%] ${
                isTarget ? 'self-end ml-auto flex-row-reverse' : ''
              } ${
                isJudge ? 'mx-auto max-w-2xl w-full flex-col' : ''
              }`}
            >
              {/* Profile Icon */}
              {!isJudge && (
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-slate-900 border border-slate-800 shrink-0 shadow-md`}>
                  {getIcon(msg.role)}
                </div>
              )}

              {/* Message Bubble */}
              <div className={`p-4 rounded-xl border text-xs leading-relaxed whitespace-pre-wrap ${getBubbleStyle(msg.role)}`}>
                {/* Header info */}
                <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-800/60 font-mono text-[9px] text-slate-500 justify-between">
                  <span className={`font-bold ${
                    msg.role === AgentRole.ATTACKER ? 'text-rose-400' : 
                    isTarget ? 'text-cyan-400' : 'text-emerald-400'
                  }`}>
                    {msg.role.toUpperCase()}
                  </span>
                  {msg.modelName && (
                    <span className="bg-slate-900/80 border border-slate-800 px-1.5 py-0.5 rounded text-[8px] text-slate-400 font-bold uppercase">
                      {getModelLabel(msg.modelName)}
                    </span>
                  )}
                </div>

                {/* Attacker Thoughts */}
                {msg.thought && (
                  <details className="mb-3 p-2 bg-black/40 rounded-lg border border-rose-950/20 text-[11px] text-rose-300/80 cursor-pointer">
                    <summary className="font-mono font-bold hover:text-rose-200 outline-none select-none flex items-center gap-1.5 text-[9px] text-rose-400">
                      <span>▶</span> INTERNAL COGNITIVE LOGS
                    </summary>
                    <p className="mt-1.5 italic leading-relaxed font-sans">{msg.thought}</p>
                  </details>
                )}

                {/* Message Body */}
                <div className="text-slate-200 text-xs font-sans leading-relaxed selection:bg-indigo-600/30 selection:text-white">
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default ChatFeed;
