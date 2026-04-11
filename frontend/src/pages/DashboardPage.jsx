import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Server, Database, Globe, AlertTriangle, RefreshCw, Play } from 'lucide-react';
import useApi from '../hooks/useApi';
import { Link } from 'react-router-dom';
import EndpointBadge from '../components/EndpointBadge';

const DashboardPage = () => {
  const { data: healthData, loading: loadingHealth, error: healthError, request: fetchHealth } = useApi();
  const { data: routeData, loading: loadingRoutes, error: routeError, request: fetchRoutes } = useApi();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchHealth('get', '/api/v1/health'),
        fetchRoutes('get', '/api/v1/routes')
      ]);
    } catch (err) {
      console.error('Fetch failed');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [fetchHealth, fetchRoutes]);

  const isBackendHealthy = healthData && !healthError;

  if (healthError || routeError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="p-6 bg-terminal-red/10 border border-terminal-red/20 rounded-2xl max-w-md">
          <AlertTriangle className="w-12 h-12 text-terminal-red mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-2 font-mono">CONNECTION_LOST</h2>
          <p className="text-gray-500 font-mono text-sm leading-relaxed mb-6">
            Establishing uplink failed. Please ensure your AutoCRUD.js backend is running on port 5005 and MONGODB_URI is correctly configured.
          </p>
          <button 
            onClick={loadData}
            className="terminal-button bg-terminal-red text-background hover:bg-opacity-80 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            RETRY_UPLINK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
      <div className="flex items-center justify-between mb-12">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white uppercase tracking-tighter">
            System <span className="text-terminal-green">Dashboard</span>
          </h1>
          <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest leading-loose">
            Live telemetry from the AutoCRUD Engine // v1.0.0
          </p>
        </div>
        
        <button 
          onClick={loadData}
          disabled={loadingHealth}
          className="p-2 border border-[#ffffff10] text-gray-500 hover:text-terminal-green transition-all rounded hover:bg-terminal-green/5"
        >
          <RefreshCw className={`w-5 h-5 ${loadingHealth ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Status Deck */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="terminal-card p-6 bg-black/40">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Uptime_Status</span>
            <Activity className="w-4 h-4 text-terminal-green" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {healthData?.data?.uptime ? `${(healthData.data.uptime / 60).toFixed(2)} MIN` : '0.00 MIN'}
          </div>
        </div>

        <div className="terminal-card p-6 bg-black/40">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Connectivity</span>
            <div className={`w-3 h-3 rounded-full ${isBackendHealthy ? 'bg-terminal-green animate-pulse' : 'bg-gray-800'}`} />
          </div>
          <div className="text-2xl font-bold font-mono text-terminal-green">
            {isBackendHealthy ? 'STABLE' : 'UNSTABLE'}
          </div>
        </div>

        <div className="terminal-card p-6 bg-black/40 border-terminal-cyan/20">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Entities_Loaded</span>
            <Database className="w-4 h-4 text-terminal-cyan" />
          </div>
          <div className="text-2xl font-bold font-mono text-terminal-cyan">
             {(healthData?.data?.entities?.length || 0).toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Entities Grid */}
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Globe className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-bold text-white uppercase tracking-widest">Active_Pipelines</h2>
          <div className="h-px bg-white/5 flex-1" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {healthData?.data?.entities?.map((entityName) => {
            const entityRoutes = routeData?.data?.filter(r => r.entity === entityName) || [];
            return (
              <motion.div 
                key={entityName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="terminal-card flex flex-col hover:border-terminal-green/30 transition-all duration-300"
              >
                <div className="p-6 flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-col">
                      <h3 className="text-white font-bold text-lg uppercase tracking-wider">{entityName}</h3>
                      <span className="text-[9px] text-gray-600 font-mono">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                    </div>
                    <div className="p-2 bg-terminal-green/5 border border-terminal-green/10 rounded">
                      <Server className="w-4 h-4 text-terminal-green" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase mb-2">
                      <Globe className="w-3 h-3" /> Endpoints
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {/* Method Badges */}
                       {entityRoutes.map((route, idx) => (
                         <div key={idx} className="flex flex-col gap-1">
                           <EndpointBadge method={route.method} />
                         </div>
                       ))}
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-black/40 border-t border-[#ffffff05] flex items-center justify-between">
                   <span className="text-[9px] font-mono text-gray-700 uppercase">Status: <span className="text-terminal-green">Ready</span></span>
                   <Link 
                     to={`/explorer?entity=${entityName}`}
                     className="px-3 py-1.5 bg-terminal-green/10 hover:bg-terminal-green/20 text-terminal-green text-[10px] font-bold rounded flex items-center gap-2 transition-all"
                   >
                     <Play className="w-3 h-3 fill-current" />
                     TEST_API
                   </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
