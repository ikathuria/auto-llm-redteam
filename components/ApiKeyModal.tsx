import React, { useState } from 'react';
import { ApiKeys } from '../types';
import { X, Key, ShieldCheck, Eye, EyeOff } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: ApiKeys;
  onSave: (keys: ApiKeys) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, apiKeys, onSave }) => {
  const [gemini, setGemini] = useState(apiKeys.gemini || '');
  const [openai, setOpenai] = useState(apiKeys.openai || '');
  const [groq, setGroq] = useState(apiKeys.groq || '');

  const [showGemini, setShowGemini] = useState(false);
  const [showOpenai, setShowOpenai] = useState(false);
  const [showGroq, setShowGroq] = useState(false);

  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ gemini, openai, groq });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden relative z-10 transition-transform duration-300 transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-slate-100 text-lg">API Authentication</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed flex gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-300">Security & Privacy Note</p>
              <p>Your API keys are stored locally in your browser's <code className="text-slate-300 font-mono">localStorage</code>. They are sent directly to the model provider's API endpoints and are never transmitted to any third-party server.</p>
            </div>
          </div>

          {/* Gemini Key */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300">Google Gemini API Key</label>
              <a 
                href="https://aistudio.google.com/" 
                target="_blank" 
                rel="noreferrer" 
                className="text-[10px] text-indigo-400 hover:underline"
              >
                Get Key
              </a>
            </div>
            <div className="relative">
              <input
                type={showGemini ? "text" : "password"}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-3 pr-10 text-xs text-slate-200 focus:border-indigo-500 outline-none transition-colors"
                placeholder="AIzaSy..."
                value={gemini}
                onChange={(e) => setGemini(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowGemini(!showGemini)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
              >
                {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* OpenAI Key */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300">OpenAI API Key</label>
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noreferrer" 
                className="text-[10px] text-indigo-400 hover:underline"
              >
                Get Key
              </a>
            </div>
            <div className="relative">
              <input
                type={showOpenai ? "text" : "password"}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-3 pr-10 text-xs text-slate-200 focus:border-indigo-500 outline-none transition-colors"
                placeholder="sk-..."
                value={openai}
                onChange={(e) => setOpenai(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowOpenai(!showOpenai)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
              >
                {showOpenai ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Groq Key */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300">Groq API Key</label>
              <a 
                href="https://console.groq.com/keys" 
                target="_blank" 
                rel="noreferrer" 
                className="text-[10px] text-indigo-400 hover:underline"
              >
                Get Key
              </a>
            </div>
            <div className="relative">
              <input
                type={showGroq ? "text" : "password"}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-3 pr-10 text-xs text-slate-200 focus:border-indigo-500 outline-none transition-colors"
                placeholder="gsk_..."
                value={groq}
                onChange={(e) => setGroq(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowGroq(!showGroq)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
              >
                {showGroq ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 py-2 rounded-lg text-xs font-bold text-white transition-colors duration-300 flex justify-center items-center ${
                saved ? 'bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-500'
              }`}
            >
              {saved ? 'Settings Saved ✓' : 'Save Credentials'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyModal;
