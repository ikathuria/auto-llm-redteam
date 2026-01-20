import React, { useEffect, useRef } from 'react';
import { Message, AgentRole } from '../types';
import { Bot, User, ShieldCheck } from 'lucide-react';

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
      case AgentRole.ATTACKER: return <User className="w-5 h-5 text-rose-500" />;
      case AgentRole.TARGET: return <Bot className="w-5 h-5 text-blue-500" />;
      case AgentRole.JUDGE: return <ShieldCheck className="w-5 h-5 text-emerald-500" />;
      default: return null;
    }
  };

  const getBubbleStyle = (role: AgentRole) => {
    switch (role) {
      case AgentRole.ATTACKER: return "border-rose-900/50 bg-rose-950/20 text-rose-100";
      case AgentRole.TARGET: return "border-blue-900/50 bg-blue-950/20 text-blue-100 ml-auto";
      case AgentRole.JUDGE: return "border-emerald-900/50 bg-emerald-950/10 text-emerald-200 w-full text-center text-xs italic opacity-80";
      default: return "bg-slate-800";
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-6 relative">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>

      <div className="space-y-6 relative z-10">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4 mt-20">
            <Bot className="w-16 h-16 opacity-20" />
            <p className="text-sm font-mono">Ready to initiate simulation sequence...</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.role === AgentRole.TARGET ? 'self-end ml-auto flex-row-reverse' : ''} ${msg.role === AgentRole.JUDGE ? 'mx-auto max-w-full' : ''}`}>

            {msg.role !== AgentRole.JUDGE && (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-slate-900 border border-slate-800 shrink-0`}>
                {getIcon(msg.role)}
              </div>
            )}

            <div className={`p-4 rounded-lg border text-sm leading-relaxed whitespace-pre-wrap ${getBubbleStyle(msg.role)}`}>
              {msg.role === AgentRole.JUDGE && <span className="font-bold text-emerald-500 block mb-1">JUDGE ANALYSIS:</span>}
              {msg.thought && (
                <details className="mb-2 p-2 bg-black/20 rounded text-xs text-slate-400 cursor-pointer">
                  <summary className="font-mono font-bold hover:text-slate-300">INTERNAL THOUGHT PROCESS</summary>
                  <p className="mt-1 italic">{msg.thought}</p>
                </details>
              )}
              {msg.content}
            </div>

          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default ChatFeed;
