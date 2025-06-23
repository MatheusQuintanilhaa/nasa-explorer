import React from "react";
import { useAPOD } from "../hooks/useAPOD";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  const { data: apod, loading, error, fetchAPOD } = useAPOD();

  const handleRefresh = () => {
    fetchAPOD();
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          Explore o Universo
        </h1>
        <p className="text-slate-300 text-xl max-w-2xl mx-auto">
          Descubra as maravilhas do espaço através dos olhos da NASA. Fotos
          astronômicas, rovers em Marte e muito mais!
        </p>
      </div>

      {/* APOD Section */}
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* APOD Image */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="aspect-video rounded-lg" />
            </div>
          ) : error ? (
            <Card className="border-red-500/50 bg-red-950/20">
              <CardContent className="pt-6">
                <p className="text-red-400">❌ Erro ao carregar: {error}</p>
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  className="mt-4"
                >
                  Tentar Novamente
                </Button>
              </CardContent>
            </Card>
          ) : apod ? (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold text-white">
                  📸 Foto Astronômica do Dia
                </h2>
                <Badge variant="outline">
                  {new Date(apod.date).toLocaleDateString("pt-BR")}
                </Badge>
                {apod.date === new Date().toISOString().split("T")[0] ? (
                  <Badge className="bg-green-600">Hoje</Badge>
                ) : (
                  <Badge variant="secondary">NASA Time</Badge>
                )}
              </div>
              {apod.media_type === "image" ? (
                <div className="relative group">
                  <img
                    src={apod.url}
                    alt={apod.title}
                    className="w-full rounded-lg shadow-2xl transition-transform group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ) : (
                <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center">
                  <p className="text-slate-400">
                    🎥 Vídeo disponível no link original
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* APOD Info */}
        <div className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : apod ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-white">
                    {apod.title}
                  </CardTitle>
                  {apod.copyright && (
                    <CardDescription>📷 {apod.copyright}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 leading-relaxed">
                    {apod.explanation}
                  </p>
                </CardContent>
              </Card>

              <div className="flex gap-3 flex-wrap">
                <Button onClick={handleRefresh} variant="outline">
                  🔄 Nova Foto
                </Button>
                {apod.hdurl && (
                  <Button asChild>
                    <a
                      href={apod.hdurl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      🖼️ HD
                    </a>
                  </Button>
                )}
                <Button
                  onClick={() => fetchAPOD("2025-06-21")}
                  variant="secondary"
                  size="sm"
                >
                  21/06
                </Button>
                <Button
                  onClick={() => fetchAPOD("2025-06-20")}
                  variant="secondary"
                  size="sm"
                >
                  20/06
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/galeria">
          <Card className="bg-gradient-to-br from-blue-950/50 to-blue-900/30 border-blue-500/20 hover:border-blue-400/40 transition-all cursor-pointer group">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <span className="text-2xl group-hover:scale-110 transition-transform">
                  🌌
                </span>
                <div>
                  <p className="text-sm font-medium text-blue-300">Galeria</p>
                  <p className="text-2xl font-bold text-white">APOD</p>
                  <p className="text-xs text-blue-400 mt-1">
                    Arquivo histórico
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/marte">
          <Card className="bg-gradient-to-br from-red-950/50 to-red-900/30 border-red-500/20 hover:border-red-400/40 transition-all cursor-pointer group">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <span className="text-2xl group-hover:scale-110 transition-transform">
                  🔴
                </span>
                <div>
                  <p className="text-sm font-medium text-red-300">Marte</p>
                  <p className="text-2xl font-bold text-white">Rovers</p>
                  <p className="text-xs text-red-400 mt-1">Fotos dos rovers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/asteroides">
          <Card className="bg-gradient-to-br from-amber-950/50 to-amber-900/30 border-amber-500/20 hover:border-amber-400/40 transition-all cursor-pointer group">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <span className="text-2xl group-hover:scale-110 transition-transform">
                  ☄️
                </span>
                <div>
                  <p className="text-sm font-medium text-amber-300">NEOs</p>
                  <p className="text-2xl font-bold text-white">Próximos</p>
                  <p className="text-xs text-amber-400 mt-1">
                    Asteroides perigosos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default Home;
