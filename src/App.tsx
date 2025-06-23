import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./components/pages/Home";
import GaleriaAPOD from "./components/pages/GaleriaAPOD";
import MarsRovers from "./components/pages/MarsRovers";

// Componente placeholder para páginas ainda não implementadas
const ComingSoon: React.FC<{
  title: string;
  description: string;
  emoji: string;
}> = ({ title, description, emoji }) => (
  <div className="text-center py-20">
    <div className="text-8xl mb-6">{emoji}</div>
    <h1 className="text-4xl font-bold text-white mb-4">{title}</h1>
    <p className="text-slate-300 text-lg mb-8">{description}</p>
    <div className="inline-flex items-center px-4 py-2 bg-slate-800 rounded-lg">
      <span className="text-slate-400">🚧 Em desenvolvimento...</span>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/galeria" element={<GaleriaAPOD />} />
          <Route path="/marte" element={<MarsRovers />} />
          <Route
            path="/asteroides"
            element={
              <ComingSoon
                title="Asteroides Próximos"
                description="Monitore objetos próximos à Terra (NEOs) com dados da NASA"
                emoji="☄️"
              />
            }
          />
          {/* Rota para páginas não encontradas */}
          <Route
            path="*"
            element={
              <ComingSoon
                title="Página não encontrada"
                description="A página que você procura não existe"
                emoji="🌌"
              />
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
