import React from 'react';
import { Terminal as TerminalIcon, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const ResponseViewer = ({ data, loading }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="terminal-card h-full flex flex-col items-center justify-center p-8 gap-4">
        <div className="w-12 h-12 border-4 border-terminal-green/20 border-t-terminal-green rounded-full animate-spin" />
        <span className="text-terminal-green font-mono text-xs animate-pulse">EXECUTING_QUERY...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="terminal-card h-full flex flex-col items-center justify-center p-8 text-gray-600 font-mono text-center">
        <TerminalIcon className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-xs uppercase tracking-widest">Awaiting Command Input</p>
        <p className="text-[10px] mt-2 opacity-50">Select an endpoint and click 'EXECUTE' to view response</p>
      </div>
    );
  }

  return (
    <div className="terminal-card flex flex-col h-full bg-[#050505]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#ffffff10] bg-[#121212]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
          </div>
          <span className="text-[10px] font-mono text-gray-400 ml-2 uppercase tracking-tighter">JSON_RESPONSE.log</span>
        </div>
        <button 
          onClick={copyToClipboard}
          className="text-gray-500 hover:text-terminal-green transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      
      <div className="flex-1 p-4 overflow-auto custom-scrollbar">
        <pre className="text-[11px] font-mono leading-relaxed">
          {Object.entries(data).map(([key, value], i) => (
            <div key={i} className="mb-1">
              <span className="text-terminal-cyan">"{key}"</span>
              <span className="text-gray-400">: </span>
              {typeof value === 'object' ? (
                <span className="text-gray-500">{JSON.stringify(value, null, 2)}</span>
              ) : typeof value === 'string' ? (
                <span className="text-terminal-green">"{value}"</span>
              ) : (
                <span className="text-purple-400">{String(value)}</span>
              )}
            </div>
          ))}
        </pre>
      </div>

      <div className="px-4 py-1.5 border-t border-[#ffffff08] bg-[#0a0a0a] flex items-center justify-between text-[9px] font-mono text-gray-600">
        <span>SIZE: {(JSON.stringify(data).length / 1024).toFixed(2)} KB</span>
        <span className="text-terminal-green/50">EXIT_CODE: 0</span>
      </div>
    </div>
  );
};

export default ResponseViewer;
