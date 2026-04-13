import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, Send, Database, Box, PlayCircle, Clock, 
  ChevronRight, ChevronDown, History as HistoryIcon, 
  ChevronUp, ShieldCheck, Zap
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import useApi from '../hooks/useApi';
import EndpointBadge from '../components/EndpointBadge';
import ResponseViewer from '../components/ResponseViewer';
import { motion, AnimatePresence } from 'framer-motion';

const ExplorerPage = () => {
  const [searchParams] = useSearchParams();
  const { 
    loading, data: responseData, status: responseStatus, 
    headers: responseHeaders, duration: responseTime, 
    error: apiError, request: executeRequest 
  } = useApi();
  
  const { data: routeData, request: fetchRoutes } = useApi();

  // Request State
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [idParam, setIdParam] = useState('');
  const [queryParams, setQueryParams] = useState({ page: 1, limit: 10, sort: 'createdAt', order: 'desc' });
  const [requestBody, setRequestBody] = useState('{\n  "name": "Sample",\n  "price": 0\n}');
  const [history, setHistory] = useState([]);
  const [expandedEntities, setExpandedEntities] = useState({});
  const [showHeaders, setShowHeaders] = useState(false);

  // Load Initial Routes & History
  useEffect(() => {
    fetchRoutes('get', '/api/v1/routes');
    const savedHistory = JSON.parse(localStorage.getItem('autocrud_history') || '[]');
    setHistory(savedHistory);
  }, []);

  // Grouped Routes calculation
  const groupedRoutes = useMemo(() => {
    if (!routeData?.success) return {};
    return routeData.data.reduce((acc, route) => {
      if (!acc[route.entity]) acc[route.entity] = [];
      acc[route.entity].push(route);
      return acc;
    }, {});
  }, [routeData]);

  // Handle route selection
  const selectRoute = (route) => {
    setSelectedRoute(route);
    // Reset inputs
    setIdParam('');
    if (route.method === 'POST') {
      setRequestBody('{\n  "name": "New Entity",\n  "status": "active"\n}');
    }
  };

  // Execution Logic
  const handleExecute = async () => {
    if (!selectedRoute) return;

    let finalPath = selectedRoute.path;
    if (finalPath.includes(':id')) {
      finalPath = finalPath.replace(':id', idParam);
    }

    // Append query params for GET (list)
    if (selectedRoute.method === 'GET' && !selectedRoute.path.includes(':id')) {
      const q = new URLSearchParams(queryParams).toString();
      finalPath += `?${q}`;
    }

    const startTime = new Date();
    try {
      const body = ['POST', 'PUT'].includes(selectedRoute.method) ? JSON.parse(requestBody) : null;
      const result = await executeRequest(selectedRoute.method, finalPath, body);
      
      // Save to History
      const historyItem = {
        id: Date.now(),
        method: selectedRoute.method,
        url: finalPath,
        status: 200,
        time: Math.round(new Date() - startTime),
        timestamp: new Date().toLocaleTimeString()
      };
      const newHistory = [historyItem, ...history].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem('autocrud_history', JSON.stringify(newHistory));
    } catch (err) {
      console.error('Execution Failed');
    }
  };

  const toggleEntity = (entity) => {
    setExpandedEntities(prev => ({ ...prev, [entity]: !prev[entity] }));
  };

  return (
    <div className="pt-20 h-screen flex bg-background overflow-hidden">
      {/* Sidebar - Route Navigator */}
      <aside className="w-72 border-r border-[#ffffff08] bg-[#0c0c0c] flex flex-col pt-4">
        <div className="px-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-4 h-4 text-terminal-cyan" />
            <span className="text-[11px] font-bold tracking-widest text-white uppercase">Endpoints_Registry</span>
          </div>
          <div className="h-px bg-white/5" />
        </div>

        <div className="flex-1 overflow-y-auto px-3 custom-scrollbar">
          {Object.entries(groupedRoutes).map(([entity, routes]) => (
            <div key={entity} className="mb-2">
              <button 
                onClick={() => toggleEntity(entity)}
                className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded transition-colors text-xs font-bold text-gray-400 uppercase tracking-tighter"
              >
                <div className="flex items-center gap-2">
                  <Database className="w-3 h-3 text-terminal-cyan" />
                  {entity}
                </div>
                {expandedEntities[entity] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
              
              <AnimatePresence>
                {expandedEntities[entity] && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden ml-4 mt-1 space-y-1"
                  >
                    {routes.map((route, i) => (
                      <button
                        key={i}
                        onClick={() => selectRoute(route)}
                        className={`w-full text-left p-2 rounded text-[10px] font-mono transition-all flex items-center gap-2
                          ${selectedRoute === route ? 'bg-terminal-green/10 text-terminal-green' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}
                        `}
                      >
                        <EndpointBadge method={route.method} />
                        <span className="truncate">{route.path}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Architect Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="fixed top-20 right-0 w-64 h-64 bg-terminal-cyan/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar pb-10">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Command Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-widest text-white uppercase">Command_Architect</h1>
                <p className="text-[10px] font-mono text-gray-500 uppercase mt-1">Configure and execute live REST instructions</p>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#121212] border border-white/5 rounded text-[10px] text-gray-500 font-mono">
                  <div className="w-1.5 h-1.5 rounded-full bg-terminal-green animate-pulse" />
                  CORE_UPLINK_STABLE
                </div>
              </div>
            </div>

            {selectedRoute ? (
              <div className="space-y-6">
                {/* Route URL Box */}
                <div className="terminal-card bg-[#050505] p-1 flex items-center gap-3">
                  <div className="bg-[#121212] px-4 py-2 rounded text-terminal-green font-bold text-xs border border-white/5">
                    {selectedRoute.method}
                  </div>
                  <div className="flex-1 font-mono text-xs text-gray-400">
                    {import.meta.env.VITE_API_URL || 'http://localhost:5005'}{selectedRoute.path.replace(':id', idParam || '{id}')}
                  </div>
                  <button 
                    onClick={handleExecute}
                    disabled={loading}
                    className="terminal-button-primary px-6 h-10 flex items-center gap-2 border-l border-white/10"
                  >
                    <Send className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'EXECUTING...' : 'RUN_COMMAND'}
                  </button>
                </div>

                {/* Parameters Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Path Parameters */}
                  {selectedRoute.path.includes(':id') && (
                    <div className="terminal-card p-5 bg-[#0a0a0a]">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase mb-4">
                        <Box className="w-3 h-3" /> Path_Parameters
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-mono text-gray-600 block">ID (24-char ObjectId)</label>
                        <input 
                          type="text"
                          value={idParam}
                          onChange={(e) => setIdParam(e.target.value)}
                          placeholder="e.g. 507f1f77bcf86cd799439011"
                          className="w-full terminal-input text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {/* Query Parameters (only for list endpoints) */}
                  {selectedRoute.method === 'GET' && !selectedRoute.path.includes(':id') && (
                    <div className="terminal-card p-5 bg-[#0a0a0a]">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase mb-4">
                        <Search className="w-3 h-3" /> Pagination_Query
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-mono text-gray-600 block">PAGE</label>
                          <input 
                            type="number"
                            value={queryParams.page}
                            onChange={(e) => setQueryParams(prev => ({ ...prev, page: e.target.value }))}
                            className="w-full terminal-input text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-mono text-gray-600 block">LIMIT</label>
                          <input 
                            type="number"
                            value={queryParams.limit}
                            onChange={(e) => setQueryParams(prev => ({ ...prev, limit: e.target.value }))}
                            className="w-full terminal-input text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Body Editor */}
                {['POST', 'PUT'].includes(selectedRoute.method) && (
                  <div className="terminal-card flex flex-col bg-[#111] h-64">
                    <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between bg-[#1a1a1a]">
                      <div className="flex items-center gap-2">
                        <PlayCircle className="w-3 h-3 text-terminal-cyan" />
                        <span className="text-[10px] font-mono text-gray-500">REQUEST_PAYLOAD.json</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <Editor
                        height="100%"
                        defaultLanguage="json"
                        theme="vs-dark"
                        value={requestBody}
                        onChange={setRequestBody}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 12,
                          fontFamily: 'JetBrains Mono',
                          scrollBeyondLastLine: false,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Response Viewer */}
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                          <Zap className="w-3.5 h-3.5 text-terminal-yellow" /> Telemetry_Report
                        </div>
                        {responseStatus && (
                          <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            responseStatus < 300 ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                            responseStatus < 500 ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                            'bg-red-500/10 text-red-500 border-red-500/20'
                          }`}>
                            STATUS_{responseStatus}
                          </div>
                        )}
                        {responseTime && (
                          <div className="text-[10px] font-mono text-gray-600">
                            LATENCY: <span className="text-terminal-cyan">{responseTime}MS</span>
                          </div>
                        )}
                     </div>
                     <button 
                       onClick={() => setShowHeaders(!showHeaders)}
                       className="text-[10px] font-mono text-gray-500 hover:text-white uppercase flex items-center gap-1"
                     >
                       {showHeaders ? 'HIDE_HEADERS' : 'SHOW_HEADERS'}
                       {showHeaders ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                     </button>
                   </div>

                   {showHeaders && responseHeaders && (
                     <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        className="overflow-hidden terminal-card p-4 bg-black/40 font-mono text-[9px] text-gray-500 grid grid-cols-2 gap-2"
                      >
                        {Object.entries(responseHeaders).map(([k, v]) => (
                          <div key={k} className="flex gap-2">
                            <span className="text-gray-600 uppercase italic">{k}:</span>
                            <span className="text-gray-400 truncate">{v}</span>
                          </div>
                        ))}
                      </motion.div>
                   )}

                   <div className="h-96">
                     <ResponseViewer data={responseData} loading={loading} />
                   </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center opacity-20">
                 <ShieldCheck className="w-24 h-24 mb-6" />
                 <h2 className="text-2xl font-bold tracking-[0.5em] uppercase">Select Uplink Route</h2>
                 <p className="font-mono text-sm mt-4 tracking-tighter italic">Awaiting terminal input instructions...</p>
              </div>
            )}
          </div>
        </div>

        {/* History / Status Diagnostic Footer */}
        <footer className="h-12 border-t border-white/5 bg-[#0c0c0c] px-6 flex items-center justify-between text-[9px] font-mono text-gray-600">
           <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-terminal-green" />
               <span>IO_BUFFER_CLEAN</span>
             </div>
             <div className="flex items-center gap-2">
               <HistoryIcon className="w-3 h-3" />
               <span>CACHE_ENTRIES: {history.length}</span>
             </div>
           </div>
           <div>DEVICE_UUID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
        </footer>
      </main>

      {/* Right Drawer - History */}
      <aside className="w-64 border-l border-[#ffffff08] bg-[#0c0c0c] flex flex-col pt-4">
        <div className="px-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-terminal-yellow" />
            <span className="text-[11px] font-bold tracking-widest text-white uppercase">History_Logs</span>
          </div>
          <div className="h-px bg-white/5" />
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-2 custom-scrollbar">
          {history.length > 0 ? history.map((h) => (
            <button 
              key={h.id}
              onClick={() => {
                // Find associated route
                const route = routeData.data.find(r => r.method === h.method && h.url.split('?')[0].includes(r.path.replace('/:id', '')));
                if (route) {
                  selectRoute(route);
                  // Extract ID if present
                  const parts = h.url.split('/');
                  const id = parts[parts.length - 1].split('?')[0];
                  if (id.length === 24) setIdParam(id);
                }
              }}
              className="w-full p-2 bg-black/40 border border-white/5 rounded hover:border-terminal-cyan/30 transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[9px] font-bold ${h.status < 400 ? 'text-terminal-green' : 'text-terminal-red'}`}>
                  {h.status}
                </span>
                <span className="text-[8px] text-gray-700">{h.timestamp}</span>
              </div>
              <div className="text-[10px] font-mono text-gray-500 truncate group-hover:text-gray-300">
                {h.method} {h.url}
              </div>
            </button>
          )) : (
            <div className="text-center py-10 opacity-10">
              <HistoryIcon className="w-12 h-12 mx-auto mb-2" />
              <span className="text-[10px] tracking-widest uppercase">No_History</span>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default ExplorerPage;
