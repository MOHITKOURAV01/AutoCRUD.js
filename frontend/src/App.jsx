import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import EditorPage from './pages/EditorPage';
import ExplorerPage from './pages/ExplorerPage';
import GuidePage from './pages/GuidePage';

/**
 * Main Application Component
 * Handles global routing and terminal layout wrapper.
 */
function App() {
  return (
    <Router>
      <div className="min-h-screen relative">
        {/* Persistent Navbar */}
        <Navbar />

        {/* Global Layout Container */}
        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/editor" element={<EditorPage />} />
            <Route path="/explorer" element={<ExplorerPage />} />
            <Route path="/guide" element={<GuidePage />} />
          </Routes>
        </main>

        {/* Diagnostic Overlay Footer */}
        <footer className="fixed bottom-0 left-0 w-full px-6 py-2 border-t border-[#ffffff08] bg-[#0a0a0a]/50 backdrop-blur-md flex justify-between items-center z-50">
          <div className="flex gap-4 text-[9px] font-mono text-gray-600">
            <span>REGION: US-EAST-1</span>
            <span>PING: 24MS</span>
            <span className="text-terminal-green">CRC: VALID</span>
          </div>
          <div className="text-[9px] font-mono text-gray-600 uppercase">
            © 2026 AUTOCRUD_CORE // PROVABLE_API_GENERATION
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
