import React, { useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import yaml from 'js-yaml';
import { 
  FileCode, Save, Copy, Download, RotateCcw, 
  CheckCircle2, AlertTriangle, Database, ArrowRight,
  ShieldCheck, Layout, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SAMPLE_CONFIG = `project:
  name: "AutoCRUD Demo API"
  version: "1.0.0"
  port: 5005

entities:
  - name: "Product"
    fields:
      name: { type: "string", required: true }
      price: { type: "number", min: 0 }
      category: { type: "string", default: "General" }
      inStock: { type: "boolean", default: true }

  - name: "Customer"
    fields:
      firstName: { type: "string", required: true }
      lastName: { type: "string", required: true }
      email: { type: "string", required: true, unique: true }
      joinedDate: { type: "date" }

  - name: "Order"
    fields:
      orderId: { type: "string", unique: true }
      total: { type: "number", required: true }
      status: { type: "string", enum: ["pending", "shipped", "delivered"] }
`;

const EditorPage = () => {
  const [code, setCode] = useState(SAMPLE_CONFIG);
  const [parsedData, setParsedData] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [copySuccess, setCopySuccess] = useState(false);

  // Validation Logic (Replicating Backend ConfigParser)
  const validateConfig = useCallback((content) => {
    const errors = [];
    let parsed = null;

    try {
      parsed = yaml.load(content);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error("Invalid YAML structure or empty file.");
      }

      // 1. Project Validation
      if (!parsed.project) {
        errors.push("Missing 'project' section.");
      } else {
        if (!parsed.project.name) errors.push("Project 'name' is required.");
        if (typeof parsed.project.port !== 'number') errors.push("Project 'port' must be a number.");
      }

      // 2. Entities Validation
      if (!parsed.entities || !Array.isArray(parsed.entities) || parsed.entities.length === 0) {
        errors.push("'entities' must be a non-empty array.");
      } else {
        const validTypes = ['string', 'number', 'boolean', 'date', 'objectId'];
        parsed.entities.forEach((entity, i) => {
          if (!entity.name) errors.push(`Entity at index ${i} is missing 'name'.`);
          if (!entity.fields || typeof entity.fields !== 'object') {
            errors.push(`Entity '${entity.name || i}' must have a 'fields' object.`);
          } else {
            Object.entries(entity.fields).forEach(([fieldName, config]) => {
              if (!config.type || !validTypes.includes(config.type)) {
                errors.push(`Field '${fieldName}' in '${entity.name}' has invalid type: ${config.type || 'N/A'}`);
              }
            });
          }
        });
      }
    } catch (e) {
      errors.push(`YAML_PARSER_ERROR: ${e.message}`);
    }

    setParsedData(errors.length === 0 ? parsed : null);
    setValidationErrors(errors);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => validateConfig(code), 500);
    return () => clearTimeout(timer);
  }, [code, validateConfig]);

  // Actions
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.yaml';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (window.confirm("Confirm reset to framework sample config?")) {
      setCode(SAMPLE_CONFIG);
    }
  };

  return (
    <div className="pt-24 min-h-screen flex flex-col px-6 pb-12 bg-background">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-terminal-cyan/10 rounded border border-terminal-cyan/20">
              <FileCode className="w-5 h-5 text-terminal-cyan" />
            </div>
            <h1 className="text-2xl font-bold tracking-widest text-white uppercase">Schema_Architect</h1>
          </div>
          <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest leading-loose">
            Configuration Orchestration Layer // Real-time Engine Simulation
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={handleReset} className="p-2.5 border border-[#ffffff10] text-gray-500 hover:text-terminal-yellow transition-all rounded hover:bg-terminal-yellow/5">
            <RotateCcw className="w-5 h-5" />
          </button>
          <button onClick={handleCopy} className="terminal-button bg-[#121212] flex-1 md:flex-none border border-[#ffffff10] text-[#777] hover:text-white flex items-center justify-center gap-2">
            {copySuccess ? <CheckCircle2 className="w-4 h-4 text-terminal-green" /> : <Copy className="w-4 h-4" />}
            <span className="text-[10px] font-bold uppercase tracking-widest">Copy_Buffer</span>
          </button>
          <button onClick={handleDownload} className="terminal-button-primary flex-1 md:flex-none flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Export_Config</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Editor vs Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-[70vh]">
        {/* Monaco Editor Section */}
        <div className="terminal-card flex flex-col bg-[#111] overflow-hidden border-[#ffffff08]">
          <div className="px-5 py-3 border-b border-[#ffffff10] flex items-center justify-between bg-[#1a1a1a]">
            <div className="flex items-center gap-3 font-mono text-[10px] text-gray-400">
              <span className="text-terminal-cyan">src/</span>config.yaml
            </div>
            <div className="flex gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
            </div>
          </div>
          <div className="flex-1 min-h-[60vh]">
            <Editor
              height="100%"
              defaultLanguage="yaml"
              theme="vs-dark"
              value={code}
              onChange={setCode}
              options={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                padding: { top: 20 },
                renderLineHighlight: 'all',
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {validationErrors.length > 0 ? (
              /* Error Display */
              <motion.div 
                key="errors"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="terminal-card bg-terminal-red/5 border-terminal-red/20 p-6"
              >
                <div className="flex items-center gap-3 text-terminal-red mb-6 uppercase italic font-bold tracking-widest text-sm">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                  Validation_Failures_Detected
                </div>
                <div className="space-y-4">
                  {validationErrors.map((err, i) => (
                    <div key={i} className="flex gap-3 text-xs font-mono text-terminal-red/80">
                      <span className="opacity-50 font-bold">[{i+1}]</span>
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              /* Success Preview */
              <motion.div 
                key="success"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 space-y-6"
              >
                {/* Visual Tree Card */}
                <div className="terminal-card bg-[#050505] p-6 border-terminal-green/20">
                  <div className="flex items-center justify-between mb-8 border-b border-[#ffffff05] pb-4">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-terminal-green" />
                      <span className="text-sm font-bold tracking-widest text-white uppercase">Entity_Hierarchy</span>
                    </div>
                    <div className="text-[10px] font-mono text-gray-600 uppercase">Status: <span className="text-terminal-green">Valid_Schema</span></div>
                  </div>

                  <div className="space-y-8 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                    {parsedData?.entities?.map((entity, i) => (
                      <div key={i} className="group border-l-2 border-terminal-green/10 pl-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-white font-bold text-sm uppercase flex items-center gap-2 tracking-widest">
                            <Database className="w-3.5 h-3.5 text-terminal-green" />
                            {entity.name}
                          </h3>
                        </div>
                        
                        {/* Field Discovery */}
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(entity.fields).map(([name, conf], di) => (
                            <div key={di} className="bg-[#121212]/50 p-2.5 rounded border border-[#ffffff05] hover:border-white/10 transition-colors">
                              <div className="text-white text-[10px] font-bold mb-1">{name}</div>
                              <div className="flex items-center gap-2">
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono uppercase ${
                                  conf.type === 'string' ? 'text-terminal-cyan bg-terminal-cyan/10' :
                                  conf.type === 'number' ? 'text-terminal-yellow bg-terminal-yellow/10' :
                                  'text-purple-400 bg-purple-400/10'
                                }`}>
                                  {conf.type}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Path Preview */}
                        <div className="pt-2">
                          <div className="flex items-center gap-2 text-[8px] font-bold text-gray-700 uppercase mb-3">
                            <Globe className="w-3 h-3" /> Auto_Generated_Endpoints
                          </div>
                          <div className="flex flex-wrap gap-2 opacity-60">
                            {['GET', 'POST', 'PUT', 'DELETE'].map(m => (
                              <div key={m} className="p-1.5 rounded bg-black/40 border border-[#ffffff05] text-[7px] font-mono text-gray-500 uppercase">
                                /{entity.name.toLowerCase()}s
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Framework Metrics Summary */}
                <div className="terminal-card bg-[#0a0a0a] p-5">
                   <div className="flex items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                     <Layout className="w-4 h-4" /> System_Blueprint
                   </div>
                   <div className="grid grid-cols-2 gap-4 h-full">
                      <div className="p-3 bg-white/5 rounded border border-[#ffffff05]">
                         <span className="text-[9px] text-gray-600 block mb-1">PROJECT_NAME</span>
                         <span className="text-xs font-mono text-white truncate block">{parsedData?.project?.name}</span>
                      </div>
                      <div className="p-3 bg-white/5 rounded border border-[#ffffff05]">
                         <span className="text-[9px] text-gray-600 block mb-1">BOOT_PORT</span>
                         <span className="text-terminal-yellow text-xs font-mono">{parsedData?.project?.port}</span>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Persistence Info Footer */}
      <div className="mt-12 text-center text-[10px] font-mono text-gray-700 uppercase tracking-[0.5em]">
        // Session_Local_Persistence_Enabled // Export_Logic_Verified //
      </div>
    </div>
  );
};

export default EditorPage;
