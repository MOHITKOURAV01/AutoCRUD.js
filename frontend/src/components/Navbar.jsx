import React from 'react';
import { NavLink } from 'react-router-dom';
import { Terminal, LayoutDashboard, Search, FileCode2, HelpCircle } from 'lucide-react';

const Navbar = () => {
  const navItems = [
    { to: '/', label: 'HOME', icon: Terminal },
    { to: '/dashboard', label: 'SYSTEM', icon: LayoutDashboard },
    { to: '/editor', label: 'SCHEMA', icon: FileCode2 },
    { to: '/explorer', label: 'CONSOLE', icon: Search },
    { to: '/guide', label: 'GUIDE', icon: HelpCircle },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-[#ffffff10]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-terminal-green rounded flex items-center justify-center">
            <Terminal className="text-[#0a0a0a] w-5 h-5" />
          </div>
          <span className="font-bold tracking-widest text-white text-lg">
            AUTOCRUD<span className="text-terminal-green">.JS</span>
          </span>
        </div>

        <div className="flex gap-8">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-2 text-sm font-medium tracking-tighter transition-all
                ${isActive ? 'text-terminal-green scale-105' : 'text-gray-500 hover:text-terminal-cyan'}
              `}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
              {/* Terminal cursor style indicator */}
              <div className="w-1 h-3 bg-current transition-all animate-pulse" />
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-4 text-[10px] text-gray-500 font-mono">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" />
            <span>CORE_READY</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-terminal-cyan" />
            <span>V1.0.0</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
