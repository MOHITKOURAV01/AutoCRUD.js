import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Database, ArrowRight, Zap, Code, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [entityIndex, setEntityIndex] = useState(0);
  const entities = ['Product...', 'Customer...', 'Order...', 'Review...', 'Category...'];

  useEffect(() => {
    const timer = setInterval(() => {
      setEntityIndex((prev) => (prev + 1) % entities.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    { icon: Code, title: "1. WRITE_YAML", desc: "Define your entities and fields in a simple YAML file." },
    { icon: Database, title: "2. PARSE_LOGIC", desc: "Framework auto-manufactures Models, Controllers, and Validation." },
    { icon: Zap, title: "3. GO_LIVE", desc: "Full CRUD APIs are instantly accessible over HTTP." }
  ];

  return (
    <div className="min-h-screen bg-background pt-20 px-6">
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-terminal-green/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto py-20 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-terminal-green/10 border border-terminal-green/20 text-terminal-green text-[10px] font-bold tracking-[0.3em] mb-10"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-terminal-green animate-pulse" />
          SYSTEM_VERSION_1.0_READY
        </motion.div>

        <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tighter leading-tight mb-8">
          Generate APIs in <br />
          <span className="text-terminal-green">
            <AnimatePresence mode="wait">
              <motion.span
                key={entityIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {entities[entityIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-gray-500 font-mono text-lg mb-12">
          The industrial-grade <span className="text-terminal-cyan">Configuration-to-API</span> engine. 
          Stop writing boilerplate, start architecting systems.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link to="/dashboard" className="terminal-button-primary flex items-center gap-3 group">
            OPEN_DASHBOARD <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/editor" className="terminal-button bg-white/5 text-white hover:bg-white/10 flex items-center gap-3">
            ARCHITECT_SCHEMA
          </Link>
        </div>
      </section>

      {/* Live Demo Section */}
      <section className="max-w-6xl mx-auto py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: YAML Config */}
          <motion.div 
             initial={{ opacity: 0, x: -30 }}
             whileInView={{ opacity: 1, x: 0 }}
             className="terminal-card bg-[#050505]"
          >
            <div className="px-4 py-2 border-b border-[#ffffff10] flex items-center justify-between bg-[#121212]">
              <span className="text-[10px] font-mono text-gray-400 uppercase">sample.config.yaml</span>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
              </div>
            </div>
            <div className="p-6 overflow-hidden">
              <pre className="text-xs font-mono leading-relaxed">
                <span className="text-terminal-cyan">entities</span>:<br />
                &nbsp;&nbsp;- <span className="text-terminal-cyan">name</span>: <span className="text-terminal-green">"Product"</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-terminal-cyan">fields</span>:<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-terminal-cyan">name</span>: &#123; <span className="text-terminal-cyan">type</span>: <span className="text-terminal-green">"string"</span>, <span className="text-terminal-cyan">required</span>: <span className="text-purple-400">true</span> &#125;<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-terminal-cyan">price</span>: &#123; <span className="text-terminal-cyan">type</span>: <span className="text-terminal-green">"number"</span>, <span className="text-terminal-cyan">min</span>: <span className="text-purple-400">0</span> &#125;<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-terminal-cyan">category</span>: &#123; <span className="text-terminal-cyan">type</span>: <span className="text-terminal-green">"string"</span>, <span className="text-terminal-cyan">default</span>: <span className="text-terminal-green">"General"</span> &#125;
              </pre>
            </div>
          </motion.div>

          {/* Right: Generated Endpoints */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="terminal-card bg-[#050505] border-terminal-green/20"
          >
            <div className="px-4 py-2 border-b border-[#ffffff10] flex items-center justify-between bg-[#0a0a0a]">
              <span className="text-[10px] font-mono text-terminal-green uppercase">Generated_Rest_Apis</span>
              <ShieldCheck className="w-3.5 h-3.5 text-terminal-green" />
            </div>
            <div className="p-6 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-terminal-green/5 border border-terminal-green/10">
                <span className="text-terminal-green font-bold w-12 text-[10px]">GET</span>
                <span className="text-gray-400 flex-1 ml-4 truncate">/api/v1/products</span>
                <span className="text-[10px] text-gray-600">PAGINATION_READY</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-terminal-cyan/5 border border-terminal-cyan/10">
                <span className="text-terminal-cyan font-bold w-12 text-[10px]">POST</span>
                <span className="text-gray-400 flex-1 ml-4 truncate">/api/v1/products</span>
                <span className="text-[10px] text-gray-600">JOI_VALIDATED</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-terminal-yellow/5 border border-terminal-yellow/10">
                <span className="text-terminal-yellow font-bold w-12 text-[10px]">PUT</span>
                <span className="text-gray-400 flex-1 ml-4 truncate">/api/v1/products/:id</span>
                <span className="text-[10px] text-gray-600">ID_PARSED</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-terminal-red/5 border border-terminal-red/10">
                <span className="text-terminal-red font-bold w-12 text-[10px]">DEL</span>
                <span className="text-gray-400 flex-1 ml-4 truncate">/api/v1/products/:id</span>
                <span className="text-[10px] text-gray-600">CLEAN_EXIT</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works Visual Flow */}
      <section className="max-w-6xl mx-auto py-24 relative z-10 border-t border-[#ffffff05]">
        <div className="text-center mb-16">
          <h2 className="text-2xl font-bold text-white uppercase tracking-[0.2em] mb-4">Architecture_Flow</h2>
          <div className="h-1 w-20 bg-terminal-green mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, i) => (
            <div key={i} className="text-center space-y-4 relative">
              {i < 2 && <ArrowRight className="hidden md:block absolute top-10 -right-6 w-8 h-8 text-[#ffffff08]" />}
              <div className="w-20 h-20 mx-auto rounded-2xl bg-[#121212] border border-[#ffffff10] flex items-center justify-center group hover:border-terminal-green/50 hover:bg-terminal-green/5 transition-all">
                <step.icon className="w-10 h-10 text-terminal-cyan group-hover:text-terminal-green transition-colors" />
              </div>
              <h3 className="text-terminal-green font-bold tracking-widest text-sm uppercase">{step.title}</h3>
              <p className="text-xs text-gray-500 font-mono leading-relaxed px-4">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
