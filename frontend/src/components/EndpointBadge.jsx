import React from 'react';

const EndpointBadge = ({ method }) => {
  const styles = {
    GET: 'bg-terminal-green/10 text-terminal-green border-terminal-green/30',
    POST: 'bg-terminal-cyan/10 text-terminal-cyan border-terminal-cyan/30',
    PUT: 'bg-terminal-yellow/10 text-terminal-yellow border-terminal-yellow/30',
    DELETE: 'bg-terminal-red/10 text-terminal-red border-terminal-red/30',
    PATCH: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  };

  return (
    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold tracking-tighter ${styles[method.toUpperCase()] || 'bg-gray-500/10 text-gray-400 border-gray-500/30'}`}>
      {method.toUpperCase()}
    </span>
  );
};

export default EndpointBadge;
