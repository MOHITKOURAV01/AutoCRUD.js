import React from 'react';
import { Database, ArrowRight, Table } from 'lucide-react';
import { Link } from 'react-router-dom';

const EntityCard = ({ entity }) => {
  return (
    <div className="terminal-card group hover:border-terminal-green/30 transition-all duration-300 flex flex-col h-full">
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-terminal-green/10 rounded group-hover:bg-terminal-green/20 transition-colors">
              <Database className="w-5 h-5 text-terminal-green" />
            </div>
            <div>
              <h3 className="text-white font-bold tracking-wider uppercase text-sm">
                {entity.name}
              </h3>
              <p className="text-[10px] text-gray-500 font-mono">
                RESOURCE: <span className="text-terminal-cyan">{entity.name.toLowerCase()}s</span>
              </p>
            </div>
          </div>
          <Link 
            to={`/explorer?entity=${entity.name}`}
            className="p-1.5 text-gray-600 hover:text-terminal-green hover:bg-terminal-green/5 rounded transition-all"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 mb-1">
            <Table className="w-3 h-3" />
            <span>SCHEMA_FIELDS</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(entity.fields).map(([name, config], i) => (
              <div 
                key={i} 
                className="bg-[#0a0a0a] border border-[#ffffff08] p-2 rounded flex flex-col gap-0.5"
              >
                <span className="text-white text-[9px] font-medium truncate">{name}</span>
                <span className="text-terminal-green/50 text-[8px] font-mono lowercase">
                  {config.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="px-5 py-3 bg-[#0a0a0a] border-t border-[#ffffff08] flex items-center justify-between">
        <div className="flex -space-x-1">
          {['GET', 'POST', 'PUT', 'DEL'].map((m) => (
            <div 
              key={m}
              className="w-5 h-5 rounded-full bg-[#1a1a1a] border border-[#ffffff08] flex items-center justify-center text-[7px] font-bold text-gray-500"
            >
              {m[0]}
            </div>
          ))}
        </div>
        <span className="text-[9px] text-gray-600 font-mono">READY_SYSTEM_BOOT</span>
      </div>
    </div>
  );
};

export default EntityCard;
