import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Terminal, 
  Settings, 
  Database, 
  Send, 
  ChevronRight, 
  ChevronDown, 
  Copy, 
  Check, 
  Zap, 
  HelpCircle, 
  Search,
  ArrowUp,
  Cpu,
  Layers,
  Code2,
  Lock,
  Globe,
  Activity,
  Box,
  Hash,
  FileJson,
  ShieldCheck,
  Server
} from 'lucide-react';

// --- Data Structures ---

const SECTIONS = [
  { id: 'getting-started', title: '01_GETTING_STARTED', icon: Zap, subtitle: 'System initialization & core concepts.' },
  { id: 'writing-config', title: '02_CONFIG_BLUEPRINT', icon: Terminal, subtitle: 'Defining the YAML structure.' },
  { id: 'entities-fields', title: '03_ENTITY_MAPPING', icon: Layers, subtitle: 'Schema & validation reference.' },
  { id: 'generated-endpoints', title: '04_API_SPECIFICATIONS', icon: Code2, subtitle: 'Standardized REST routes.' },
  { id: 'api-explorer', title: '05_API_EXPLORER', icon: Send, subtitle: 'Interactive console operations.' },
  { id: 'schema-architect', title: '06_SCHEMA_ARCHITECT', icon: Settings, subtitle: 'Live builder & validator.' },
  { id: 'deployment-guide', title: '07_PROD_DEPLOYMENT', icon: Cpu, subtitle: 'Cloud & containerization.' },
  { id: 'faq', title: '08_CORE_FAQ', icon: HelpCircle, subtitle: 'Frequently asked questions.' },
];

const FIELD_TYPES = [
  { type: 'string', mongoose: 'String', joi: 'string()', example: '{ type: "string" }' },
  { type: 'number', mongoose: 'Number', joi: 'number()', example: '{ type: "number", min: 0 }' },
  { type: 'boolean', mongoose: 'Boolean', joi: 'boolean()', example: '{ default: true }' },
  { type: 'date', mongoose: 'Date', joi: 'date()', example: '{ type: "date" }' },
  { type: 'objectId', mongoose: 'Schema.Types.ObjectId', joi: 'string().hex()', example: '{ ref: "User" }' },
];

const VALIDATION_RULES = [
  { rule: 'required', type: 'Boolean', desc: 'Field must be present in request.', example: 'required: true' },
  { rule: 'min', type: 'Number', desc: 'Minimum value or string length.', example: 'min: 18' },
  { rule: 'max', type: 'Number', desc: 'Maximum value or string length.', example: 'max: 100' },
  { rule: 'default', type: 'Mixed', desc: 'Fallback value if field is missing.', example: 'default: "Active"' },
  { rule: 'unique', type: 'Boolean', desc: 'Ensures value is unique in DB.', example: 'unique: true' },
];

const ENDPOINTS_TEMPLATE = [
  { method: 'GET', path: '/api/v1/:resource', desc: 'Fetch all records with query params.', curl: 'curl -X GET "http://localhost:5005/api/v1/products?limit=10"' },
  { method: 'POST', path: '/api/v1/:resource', desc: 'Create a new validated record.', curl: 'curl -X POST -H "Content-Type: application/json" -d \'{"name":"Test"}\' http://localhost:5005/api/v1/products' },
  { method: 'GET', path: '/api/v1/:resource/:id', desc: 'Fetch a single record by its ID.', curl: 'curl -X GET http://localhost:5005/api/v1/products/123' },
  { method: 'PUT', path: '/api/v1/:resource/:id', desc: 'Update an existing record (partial allowed).', curl: 'curl -X PUT -d \'{"price": 99}\' http://localhost:5005/api/v1/products/123' },
  { method: 'DELETE', path: '/api/v1/:resource/:id', desc: 'Remove a record from the database.', curl: 'curl -X DELETE http://localhost:5005/api/v1/products/123' },
];

const DEPLOYMENT_STEPS = [
  { title: "Docker Containerization", platform: "Local / VPS", desc: "Use the root-level docker-compose.yml for a full-stack environment.", code: "docker-compose up --build" },
  { title: "Render Deployment", platform: "Backend", desc: "Connect GitHub, set MONGODB_URI and FRONTEND_URL environment variables.", link: "https://render.com" },
  { title: "Vercel Deployment", platform: "Frontend", desc: "Connect GitHub, set VITE_API_URL to your Render service URL.", link: "https://vercel.com" }
];

const FAQS = [
  { 
    q: "Can I add custom logic beyond CRUD?", 
    a: "Yes. While AutoCRUD handles the standard paths, you can extend the generated controllers in the backend/src/controllers folder or add custom routes in RouteGenerator.js if you need specific business logic." 
  },
  { 
    q: "Does it support authentication?", 
    a: "Out of the box, it focuses on API scaffolding. However, you can easily inject passport or JWT middleware into the RouteGenerator for global or per-entity protection." 
  },
  { 
    q: "How do I change the port?", 
    a: "Modify the 'port' field under 'project' in your config.yaml file. The application picks this up during the boot sequence." 
  },
  { 
    q: "What databases are supported?", 
    a: "Currently, AutoCRUD is optimized for MongoDB via Mongoose. Future patches may include support for SQL databases via Sequelize or Prisma." 
  },
  { 
    q: "How do I add relationships between entities?", 
    a: "Use the 'objectId' type and provide a 'ref' property matching the name of another entity. This automatically creates Mongoose population logic." 
  },
];

// --- Sub-components ---

const TerminalHeader = ({ path }) => (
  <div className="flex items-center gap-2 px-4 py-2 bg-[#0d0d0d] border border-[#ffffff08] rounded-t-xl font-mono text-[10px] text-gray-500 mb-0 shadow-sm">
    <Globe className="w-3 h-3 text-terminal-green/60" />
    <span className="tracking-widest uppercase opacity-70">{path}</span>
    <div className="ml-auto flex gap-1.5 px-2">
      <div className="w-2 h-2 rounded-full bg-red-900/20 border border-red-900/40" />
      <div className="w-2 h-2 rounded-full bg-yellow-900/20 border border-yellow-900/40" />
      <div className="w-2 h-2 rounded-full bg-green-900/20 border border-green-900/40" />
    </div>
  </div>
);

const CodeBlockByLabel = ({ code, label = 'BASH' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative bg-[#050505] border border-[#ffffff08] border-t-0 rounded-b-xl p-6 font-mono text-[11px] overflow-x-auto mb-8 transition-all hover:border-terminal-cyan/20 shadow-inner">
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={handleCopy} className="p-2 hover:bg-white/5 rounded-lg transition-colors border border-[#ffffff08]">
          {copied ? <Check className="w-3.5 h-3.5 text-terminal-green" /> : <Copy className="w-3.5 h-3.5 text-gray-600" />}
        </button>
      </div>
      <div className="text-gray-700 mb-4 border-b border-[#ffffff04] pb-2 uppercase tracking-widest text-[9px] font-bold flex justify-between items-center">
        <span>{label}</span>
        <span className="text-[8px] opacity-40">READ_ONLY</span>
      </div>
      <pre className="text-terminal-cyan/70 leading-relaxed whitespace-pre pl-2 border-l border-terminal-cyan/10">$ {code}</pre>
    </div>
  );
};

const SectionHeader = ({ icon: Icon, title, id, subtitle }) => (
  <div className="flex items-center gap-6 mb-12 pt-8 group">
    <div className="relative">
      <div className="absolute inset-0 bg-terminal-green/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative w-14 h-14 bg-[#0d0d0d] border border-[#ffffff08] rounded-2xl flex items-center justify-center group-hover:border-terminal-green/40 transition-all shadow-2xl">
        <Icon className="w-7 h-7 text-terminal-green" />
      </div>
    </div>
    <div>
      <div className="text-[10px] font-mono text-terminal-green/60 mb-1 tracking-[0.3em] uppercase">SECTION // {id.replace('-', '_').toUpperCase()}</div>
      <h1 className="text-3xl font-black text-white tracking-widest uppercase leading-none">{title}</h1>
      {subtitle && <p className="text-[10px] text-gray-600 mt-2 font-mono uppercase tracking-[0.1em]">{subtitle}</p>}
    </div>
  </div>
);

// --- Main Page Component ---

const GuidePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('getting-started');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [hoveredField, setHoveredField] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
      const sections = SECTIONS.map(s => document.getElementById(s.id));
      const current = sections.find(s => {
        if (!s) return false;
        const rect = s.getBoundingClientRect();
        return rect.top >= 0 && rect.top <= 300;
      });
      if (current) setActiveSection(current.id);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 120, behavior: 'smooth' });
    }
  };

  const filteredSections = useMemo(() => {
    if (!searchQuery) return SECTIONS;
    const lowerQuery = searchQuery.toLowerCase();
    return SECTIONS.filter(s => 
      s.title.toLowerCase().includes(lowerQuery) ||
      s.subtitle.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen pt-24 pb-48 bg-[#070707] text-gray-400 selection:bg-terminal-green selection:text-black font-sans">
      {/* Visual Enhancements: Vignette & Scanlines */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)] z-10" />
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#80808020_1px,transparent_1px),linear-gradient(to_bottom,#80808020_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="fixed inset-0 pointer-events-none opacity-[0.01] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-0" />

      <div className="max-w-7xl mx-auto px-10 relative z-20">
        
        {/* HEADER AREA */}
        <div className="mb-24 relative">
          <div className="absolute -left-10 top-0 bottom-0 w-[2px] bg-gradient-to-b from-terminal-green via-terminal-green/40 to-transparent" />
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-16">
            <div className="space-y-6 max-w-3xl">
              <div className="flex items-center gap-4">
                <div className="px-3 py-1 bg-terminal-green/10 text-terminal-green text-[10px] font-black rounded-lg border border-terminal-green/20 uppercase tracking-widest shadow-[0_0_15px_rgba(0,186,0,0.1)]">PROTOCOL_ACTIVE</div>
                <div className="text-[11px] font-mono text-gray-500 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-terminal-green" />
                  CORE_UPLINK // STABLE // 128.0.0.1
                </div>
              </div>
              <h1 className="text-6xl font-black text-white tracking-widest uppercase leading-none filter drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                OPERATIONAL <span className="text-terminal-green">GUIDE</span>
              </h1>
              <p className="text-gray-400 font-mono text-xs uppercase tracking-[0.2em] leading-relaxed border-l border-[#ffffff10] pl-6 py-2">
                Unified technical specifications and manufacturing protocols for the AutoCRUD platform.
              </p>
            </div>
            
            <div className="relative w-full lg:w-[450px] group">
              <div className="absolute inset-0 bg-terminal-green/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 transition-colors group-hover:text-terminal-green" />
                <input 
                  type="text"
                  placeholder="EXEC_SYSTEM_SEARCH..."
                  className="w-full bg-[#0a0a0a]/80 backdrop-blur-xl border border-[#ffffff08] rounded-2xl py-5 pl-14 pr-8 text-[12px] font-mono focus:border-terminal-green/40 outline-none transition-all placeholder:text-gray-800 shadow-2xl tracking-widest"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-20">
          {/* SIDEBAR NAVIGATION */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-36 h-fit">
            <div className="space-y-2 font-mono">
              {filteredSections.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className={`group flex flex-col items-start w-full px-5 py-5 rounded-2xl transition-all relative overflow-hidden ${
                    activeSection === s.id ? 'bg-terminal-green/5 ring-1 ring-terminal-green/30 shadow-[0_10px_30px_rgba(0,186,0,0.05)]' : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-4 mb-1.5 relative z-10">
                    <s.icon className={`w-4 h-4 transition-colors ${activeSection === s.id ? 'text-terminal-green' : 'text-gray-600 group-hover:text-gray-400'}`} />
                    <span className={`text-[11px] font-black tracking-widest uppercase ${activeSection === s.id ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                      {s.title}
                    </span>
                  </div>
                  <span className="text-[9px] text-gray-700 leading-tight block ml-8 uppercase font-bold tracking-tighter relative z-10 transition-colors group-hover:text-gray-500">
                    {s.subtitle}
                  </span>
                  {activeSection === s.id && <div className="absolute inset-0 bg-gradient-to-r from-terminal-green/10 to-transparent pointer-events-none" />}
                </button>
              ))}
            </div>
            
            <div className="mt-16 p-8 bg-gradient-to-br from-[#0a0a0a] to-[#0d0d0d] border border-[#ffffff08] rounded-[2.5rem] relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-terminal-green/10 blur-3xl rounded-full -translate-y-16 translate-x-16" />
              <ShieldCheck className="w-10 h-10 text-terminal-green/40 mb-6 transition-all group-hover:scale-110 group-hover:text-terminal-green" />
              <div className="text-[11px] font-black text-white mb-3 tracking-[0.2em] uppercase">Security Level 4</div>
              <p className="text-[10px] text-gray-600 leading-relaxed font-mono italic uppercase tracking-tighter">
                Access to core manufacturing protocols is restricted to authorized architects.
              </p>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <div className="col-span-12 lg:col-span-9 space-y-48">
            
            {/* 01_GETTING_STARTED */}
            <section id="getting-started" className="scroll-mt-40">
              <SectionHeader icon={Zap} title="System Initialization" id="getting-started" subtitle="01_GETTING_STARTED" />
              <div className="bg-[#0a0a0a] border border-[#ffffff05] rounded-[2rem] p-10 mb-16 relative overflow-hidden group shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
                <p className="text-gray-400 leading-loose text-sm mb-16 font-mono relative z-10 max-w-4xl">
                  AutoCRUD.js utilizes a declarative manufacturing sequence. Instead of traditional imperative controller development, architects define data constraints within a metadata-driven blueprint. The factory engine instantiates a production-ready REST layer with centralized error handling and Mongoose integration.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
                  {[
                    { title: "BLUEPRINT_YAML", icon: Terminal, desc: "Architectural mapping in single file" },
                    { title: "ASSEMBLY_LINE", icon: Settings, desc: "Booting sequence manufacturers logic" },
                    { title: "DISTRIBUTION", icon: Globe, desc: "Real-time deployment to production" }
                  ].map((step, idx) => (
                    <div key={idx} className="bg-[#070707] border border-[#ffffff08] p-8 rounded-2xl hover:border-terminal-green/40 transition-all flex flex-col items-center text-center group/card shadow-lg hover:-translate-y-1">
                      <div className="w-16 h-16 rounded-2xl bg-[#0d0d0d] border border-[#ffffff04] flex items-center justify-center mb-6 shadow-inner group-hover/card:bg-terminal-green/5 transition-all">
                        <step.icon className="w-6 h-6 text-gray-700 group-hover/card:text-terminal-green" />
                      </div>
                      <div className="text-[11px] font-black text-white uppercase tracking-[0.3em] mb-3 italic">STEP_0{idx+1} // {step.title}</div>
                      <div className="text-[10px] text-gray-500 font-mono tracking-tighter leading-relaxed uppercase">{step.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-terminal-cyan/5 border border-terminal-cyan/20 p-8 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-terminal-cyan/10 blur-[100px] rounded-full" />
                <h3 className="text-white text-xs font-black uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-terminal-cyan" />
                  Prerequisites_Matrix
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-[11px] font-mono text-terminal-cyan/70 list-none p-0 relative z-10">
                  <li className="flex items-center gap-3 m-0 opacity-80 hover:opacity-100 transition-opacity">
                    <div className="w-2 h-2 bg-terminal-cyan rounded-full shadow-[0_0_10px_rgba(0,255,255,0.4)]" /> NODE_VR: 18.0.0+
                  </li>
                  <li className="flex items-center gap-3 m-0 opacity-80 hover:opacity-100 transition-opacity">
                    <div className="w-2 h-2 bg-terminal-cyan rounded-full shadow-[0_0_10px_rgba(0,255,255,0.4)]" /> DATABASE: MONGODB_ATLAS / LOCAL
                  </li>
                  <li className="flex items-center gap-3 m-0 opacity-80 hover:opacity-100 transition-opacity">
                    <div className="w-2 h-2 bg-terminal-cyan rounded-full shadow-[0_0_10px_rgba(0,255,255,0.4)]" /> ENV_MANAGER: NPM / PNPM / YARN
                  </li>
                  <li className="flex items-center gap-3 m-0 opacity-80 hover:opacity-100 transition-opacity">
                    <div className="w-2 h-2 bg-terminal-cyan rounded-full shadow-[0_0_10px_rgba(0,255,255,0.4)]" /> CORE_KNOWLEDGE: REST_ARCH
                  </li>
                </ul>
              </div>
            </section>

            {/* 02_CONFIG_BLUEPRINT */}
            <section id="writing-config" className="scroll-mt-40">
              <SectionHeader icon={Terminal} title="The Blueprint" id="writing-config" subtitle="02_CONFIG_BLUEPRINT" />
              <div className="grid grid-cols-1 2xl:grid-cols-2 gap-16 items-start">
                <div className="space-y-6">
                  <TerminalHeader path="PROJECT/MANIFEST/CONFIG.YAML" />
                  <div className="bg-[#030303] border border-[#ffffff08] border-t-0 rounded-b-2xl p-10 font-mono text-[12px] leading-relaxed relative shadow-2xl">
                    <div className="absolute left-0 top-0 bottom-0 w-10 bg-[#070707] border-r border-[#ffffff04] flex flex-col items-center py-10 text-[10px] text-gray-800 pointer-events-none gap-1 opacity-50">
                      {["01", "02", "03", "04", "05", "06", "07", "08", "09"].map(n => <div key={n}>{n}</div>)}
                    </div>
                    <div className="pl-8 space-y-1.5">
                      <div className="text-terminal-green font-bold">entities:</div>
                      <div 
                        onMouseEnter={() => setHoveredField('Product')}
                        onMouseLeave={() => setHoveredField(null)}
                        className="pl-5 cursor-pointer hover:bg-terminal-green/10 transition-all p-1.5 rounded-lg inline-block w-full border border-transparent hover:border-terminal-green/20"
                      >
                        <span className="text-terminal-cyan">- name:</span> <span className="text-white font-black">"Product"</span>
                      </div>
                      <div className="pl-5 text-gray-700 italic text-[11px] mb-2 font-bold tracking-widest uppercase">fields:</div>
                      <div className="pl-10 text-terminal-cyan/90 transition-all hover:text-white">title: <span className="text-gray-600">{"{ type: 'string', required: true }"}</span></div>
                      <div className="pl-10 text-terminal-cyan/90 transition-all hover:text-white">price: <span className="text-gray-600">{"{ type: 'number', min: 0 }"}</span></div>
                      <div className="pl-10 text-terminal-cyan/90 transition-all hover:text-white">cat: <span className="text-gray-600">{"{ type: 'string', default: 'Gen' }"}</span></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <TerminalHeader path="SYSTEM/MANIFEST/API_RESULTS.LOG" />
                  <div className="bg-[#030303] border border-[#ffffff08] border-t-0 rounded-b-2xl overflow-hidden min-h-[300px] relative shadow-2xl">
                    <table className="w-full text-[11px] font-mono">
                      <thead className="bg-[#070707] border-b border-[#ffffff04]">
                        <tr>
                          <th className="px-8 py-5 text-left text-gray-600 font-bold uppercase tracking-[0.2em]">TYPE</th>
                          <th className="px-8 py-5 text-left text-gray-600 font-bold uppercase tracking-[0.2em]">ENDPOINT_PATH</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#ffffff04]">
                        {[
                          { m: 'GET', p: '/api/v1/products', h: 'Product' },
                          { m: 'POST', p: '/api/v1/products', h: 'Product' },
                          { m: 'PUT', p: '/api/v1/products/:id', h: 'Product' },
                          { m: 'DELETE', p: '/api/v1/products/:id', h: 'Product' }
                        ].map((r, i) => (
                          <tr key={i} className={`transition-all duration-500 ${hoveredField === r.h ? 'bg-terminal-green/[0.08] text-terminal-green' : 'opacity-80'}`}>
                            <td className={`px-8 py-5 font-black tracking-widest ${r.m === 'POST' ? 'text-terminal-cyan' : r.m === 'DELETE' ? 'text-red-900/80' : 'text-terminal-green'}`}>[{r.m}]</td>
                            <td className="px-8 py-5 text-gray-500 tracking-tighter hover:text-gray-300 transition-colors">{r.p}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            {/* 03_ENTITY_MAPPING */}
            <section id="entities-fields" className="scroll-mt-40">
              <SectionHeader icon={Layers} title="Verification Engine" id="entities-fields" subtitle="03_ENTITY_MAPPING" />
              <div className="bg-[#0a0a0a] border border-[#ffffff08] rounded-[2rem] overflow-hidden shadow-2xl relative">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                <table className="w-full text-[12px] font-mono relative z-10">
                  <thead className="bg-[#070707] border-b border-[#ffffff10]">
                    <tr>
                      <th className="px-8 py-6 text-left text-gray-500 font-black tracking-[0.3em] uppercase">MAPPING_ID</th>
                      <th className="px-8 py-6 text-left text-gray-500 font-black tracking-[0.3em] uppercase">CORE_DATATYPE</th>
                      <th className="px-8 py-6 text-left text-gray-500 font-black tracking-[0.3em] uppercase">TECHNICAL_SUMMARY</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ffffff04]">
                    {VALIDATION_RULES.map((v, i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-8 py-7">
                          <span className="text-terminal-green font-black tracking-[0.1em] flex items-center gap-2">
                            <span className="opacity-40">{i+1} //</span>
                            .{v.rule}
                          </span>
                        </td>
                        <td className="px-8 py-7">
                          <code className="text-terminal-cyan bg-terminal-cyan/10 border border-terminal-cyan/20 px-3 py-1 rounded-lg font-bold">[{v.type.toUpperCase()}]</code>
                        </td>
                        <td className="px-8 py-7">
                          <p className="text-gray-400 mb-3 leading-relaxed max-w-md">{v.desc}</p>
                          <div className="text-[10px] text-gray-600 bg-[#050505] px-3 py-1.5 rounded-lg border border-[#ffffff04] group-hover:border-terminal-green/30 transition-all font-bold">
                            ENTITY_SYNTAX: <span className="text-terminal-green/80 italic">{v.example}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 04_API_SPECIFICATIONS */}
            <section id="generated-endpoints" className="scroll-mt-40 text-center max-w-4xl mx-auto">
              <SectionHeader icon={Code2} title="API Specifications" id="generated-endpoints" />
              <div className="space-y-6 text-left">
                {ENDPOINTS_TEMPLATE.map((e, idx) => (
                  <div key={idx} className="bg-[#0a0a0a] border border-[#ffffff08] rounded-3xl p-8 group hover:border-terminal-cyan/40 transition-all shadow-xl hover:shadow-terminal-cyan/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-[40px] leading-none pointer-events-none group-hover:opacity-20 transition-opacity">0{idx+1}</div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
                      <div className="flex items-center gap-4">
                        <span className={`px-4 py-1.5 rounded-xl text-[11px] font-black border tracking-[0.2em] shadow-lg ${
                          ['GET', 'POST', 'PUT', 'DELETE'].indexOf(e.method) % 4 === 0 
                          ? 'bg-terminal-green/10 text-terminal-green border-terminal-green/30 shadow-terminal-green/10' 
                          : 'bg-terminal-cyan/10 text-terminal-cyan border-terminal-cyan/30 shadow-terminal-cyan/10'
                        }`}>
                          {e.method}
                        </span>
                        <span className="text-sm font-black font-mono text-white tracking-widest">{e.path}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-mono text-gray-700">
                        <Activity className="w-3 h-3" />
                        LATENCY_OPTIMIZED
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-8 max-w-2xl font-mono leading-relaxed uppercase italic">{e.desc}</p>
                    <CodeBlockByLabel code={e.curl} label="TERMINAL_COMMAND" />
                  </div>
                ))}
              </div>
            </section>

            {/* 07_PROD_DEPLOYMENT */}
            <section id="deployment-guide" className="scroll-mt-40">
              <SectionHeader icon={Cpu} title="Production Sequence" id="deployment-guide" subtitle="07_PROD_DEPLOYMENT" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {DEPLOYMENT_STEPS.map((s, i) => (
                  <div key={i} className="flex flex-col bg-[#0a0a0a] border border-[#ffffff08] rounded-[2.5rem] p-8 group hover:border-terminal-green/50 transition-all shadow-2xl relative overflow-hidden hover:-translate-y-2 duration-300">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-terminal-green/5 blur-3xl rounded-full group-hover:bg-terminal-green/10 transition-all" />
                    <div className="flex items-center justify-between mb-8">
                      <div className="px-4 py-1.5 bg-terminal-green/10 text-terminal-green text-[10px] font-black rounded-xl border border-terminal-green/30 uppercase tracking-[0.1em] shadow-lg shadow-terminal-green/10">{s.platform}</div>
                      <Server className="w-6 h-6 text-gray-700 group-hover:text-terminal-green transition-all transform group-hover:rotate-12" />
                    </div>
                    <h3 className="text-white text-sm font-black uppercase tracking-[0.2em] mb-4">{s.title}</h3>
                    <p className="text-[11px] text-gray-500 font-mono leading-loose mb-10 italic uppercase tracking-tighter">{s.desc}</p>
                    {s.code && (
                      <div className="mt-auto font-mono text-[11px] bg-[#050505] p-5 rounded-2xl text-terminal-cyan/90 border border-[#ffffff04] shadow-inner font-bold tracking-tighter">
                        <span className="opacity-40 mr-2 text-gray-600">%</span>
                        {s.code}
                      </div>
                    )}
                    {s.link && (
                      <a href={s.link} target="_blank" className="mt-auto flex items-center justify-center gap-3 py-4 bg-terminal-green/10 border border-terminal-green/30 text-terminal-green text-[10px] font-black rounded-xl hover:bg-terminal-green hover:text-black transition-all group/link">
                        CONNECT_PLATEFORM <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* 08_CORE_FAQ */}
            <section id="faq" className="scroll-mt-32">
              <SectionHeader icon={HelpCircle} title="Protocol FAQ" id="faq" subtitle="08_CORE_FAQ" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-4">
                {FAQS.map((faq, i) => (
                  <div key={i} className="group border-b border-[#ffffff04] py-10 transition-all hover:border-terminal-green/30">
                    <h4 className="text-white text-[12px] font-black uppercase tracking-[0.2em] mb-5 flex items-start gap-4 transition-colors group-hover:text-terminal-green">
                      <span className="text-terminal-green/30 font-mono text-[10px]">Q_0{i+1}</span>
                      {faq.q}
                    </h4>
                    <p className="pl-12 text-[11px] text-gray-600 font-mono leading-[1.8] uppercase tracking-tighter opacity-80 group-hover:opacity-100 transition-opacity">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* FOOTER CALL TO ACTION */}
            <div className="relative py-32 px-16 bg-[#0a0a0a] border border-terminal-green/30 rounded-[3rem] overflow-hidden text-center shadow-[0_-20px_100px_rgba(0,186,0,0.05)]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-terminal-green to-transparent" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-terminal-green/10 blur-[150px] rounded-full pointer-events-none -translate-y-1/2" />
              
              <h2 className="text-5xl font-black text-white tracking-[0.5em] mb-8 uppercase leading-none italic">
                INITIATE <span className="text-terminal-green">FACTORY</span>
              </h2>
              <p className="text-[13px] text-gray-500 mb-14 max-w-2xl mx-auto font-mono uppercase tracking-[0.3em] leading-[2.2] border-y border-[#ffffff05] py-8">
                Your blueprint is synchronized. The manufacturing sequence is primed for production instantiation. 
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
                <button 
                  onClick={() => scrollToSection('getting-started')}
                  className="px-16 py-6 bg-terminal-green text-[#050505] text-[11px] font-black uppercase tracking-[0.5em] rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-[0_20px_50px_rgba(0,186,0,0.3)] ring-4 ring-terminal-green/20"
                >
                  Start Build Protocol
                </button>
                <div className="flex flex-col items-center sm:items-start gap-2">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400 font-bold uppercase tracking-widest">
                    <Activity className="w-3.5 h-3.5 text-terminal-green animate-pulse" />
                    Status // System_Ready
                  </div>
                  <div className="text-[8px] font-mono text-gray-700 tracking-widest uppercase">Encryption // AES_256_ACTIVE</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* FLOAT BACK TO TOP */}
      {showScrollTop && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-12 right-12 w-16 h-16 bg-[#0a0a0a]/80 backdrop-blur-2xl border border-terminal-green/40 text-terminal-green rounded-[1.25rem] flex flex-col items-center justify-center hover:bg-terminal-green hover:text-[#050505] transition-all shadow-[0_0_50px_rgba(0,186,0,0.2)] z-50 group hover:-translate-y-2 duration-300"
        >
          <ArrowUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
          <span className="text-[9px] font-black mt-1 tracking-widest uppercase">CORE</span>
        </button>
      )}
    </div>
  );
};

export default GuidePage;
