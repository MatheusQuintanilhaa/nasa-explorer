import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">
                <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                  🚀 NASA Explorer
                </span>
              </h1>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                Powered by NASA API
              </Badge>
            </div>

            <nav className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:text-white"
              >
                Home
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:text-white"
              >
                Galeria
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:text-white"
              >
                Marte
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:text-white"
              >
                Asteroides
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 bg-slate-900/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <p className="text-slate-400 text-sm">
              © 2025 NASA Space Explorer. Dados fornecidos pela NASA API.
            </p>
            <div className="flex items-center space-x-4 mt-2 sm:mt-0">
              <a
                href="https://api.nasa.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                NASA API
              </a>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 text-sm">
                Feito com ❤️ e React
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
