import React, { useState, useEffect } from "react";
import { nasaService, APODResponse } from "../services/nasa";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const GaleriaAPOD: React.FC = () => {
  const [apods, setApods] = useState<APODResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [viewMode, setViewMode] = useState<"single" | "range">("single");

  // Função para formatar data para o input
  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  // Inicializar com data de hoje
  useEffect(() => {
    const today = new Date();
    const todayStr = formatDateForInput(today);
    setSelectedDate(todayStr);

    // Para range, definir últimos 7 dias
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    setStartDate(formatDateForInput(weekAgo));
    setEndDate(todayStr);
  }, []);

  // Buscar APOD único
  const fetchSingleAPOD = async (date: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await nasaService.getAPOD(date);
      setApods([response]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar APOD");
      console.error("Erro ao buscar APOD:", err);
    } finally {
      setLoading(false);
    }
  };

  // Buscar range de APODs
  const fetchRangeAPOD = async (start: string, end: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await nasaService.getAPODRange(start, end);
      // Ordenar por data (mais recente primeiro)
      const sortedAPODs = Array.isArray(response)
        ? response.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        : [response];
      setApods(sortedAPODs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar APODs");
      console.error("Erro ao buscar APODs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handler para busca single
  const handleSingleSearch = () => {
    if (selectedDate) {
      fetchSingleAPOD(selectedDate);
    }
  };

  // Handler para busca range
  const handleRangeSearch = () => {
    if (startDate && endDate) {
      fetchRangeAPOD(startDate, endDate);
    }
  };

  // Carregar APOD inicial
  useEffect(() => {
    if (selectedDate) {
      fetchSingleAPOD(selectedDate);
    }
  }, []);

  // Função para quick dates
  const setQuickRange = (days: number) => {
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - days);

    setStartDate(formatDateForInput(pastDate));
    setEndDate(formatDateForInput(today));
    setViewMode("range");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          🌌 Galeria APOD
        </h1>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          Explore o arquivo histórico das fotos astronômicas da NASA
        </p>
      </div>

      {/* Controls */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            📅 Buscar por Data
          </CardTitle>
          <CardDescription>
            Escolha uma data específica ou um período para visualizar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === "single" ? "default" : "outline"}
              onClick={() => setViewMode("single")}
              size="sm"
            >
              Data Única
            </Button>
            <Button
              variant={viewMode === "range" ? "default" : "outline"}
              onClick={() => setViewMode("range")}
              size="sm"
            >
              Período
            </Button>
          </div>

          {/* Single Date Mode */}
          {viewMode === "single" && (
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Data
                </label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={formatDateForInput(new Date())}
                  min="1995-06-16" // Primeira APOD
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <Button
                onClick={handleSingleSearch}
                disabled={loading || !selectedDate}
              >
                {loading ? "Buscando..." : "🔍 Buscar"}
              </Button>
            </div>
          )}

          {/* Range Mode */}
          {viewMode === "range" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Data Inicial
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    max={endDate || formatDateForInput(new Date())}
                    min="1995-06-16"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Data Final
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    max={formatDateForInput(new Date())}
                    min={startDate || "1995-06-16"}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              {/* Quick Range Buttons */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setQuickRange(7)}
                >
                  Últimos 7 dias
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setQuickRange(30)}
                >
                  Último mês
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setQuickRange(365)}
                >
                  Último ano
                </Button>
              </div>

              <Button
                onClick={handleRangeSearch}
                disabled={loading || !startDate || !endDate}
                className="w-full"
              >
                {loading ? "Buscando..." : `🔍 Buscar Período`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-red-500/50 bg-red-950/20">
          <CardContent className="pt-6">
            <p className="text-red-400">❌ {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <div className="space-y-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-slate-800/50">
                <Skeleton className="aspect-video" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : apods.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                {apods.length === 1
                  ? "Resultado"
                  : `${apods.length} Resultados`}
              </h2>
              <Badge variant="outline">
                {apods.length === 1
                  ? new Date(apods[0].date).toLocaleDateString("pt-BR")
                  : `${new Date(
                      apods[apods.length - 1].date
                    ).toLocaleDateString("pt-BR")} - ${new Date(
                      apods[0].date
                    ).toLocaleDateString("pt-BR")}`}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apods.map((apod, index) => (
                <APODCard key={`${apod.date}-${index}`} apod={apod} />
              ))}
            </div>
          </>
        ) : (
          !loading && (
            <Card className="bg-slate-800/50">
              <CardContent className="pt-6 text-center">
                <p className="text-slate-400">
                  🔍 Selecione uma data ou período para começar
                </p>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
};

// Componente para cada card APOD
const APODCard: React.FC<{ apod: APODResponse }> = ({ apod }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer group">
          <div className="relative">
            {apod.media_type === "image" ? (
              <img
                src={apod.url}
                alt={apod.title}
                className="w-full aspect-video object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full aspect-video bg-slate-700 rounded-t-lg flex items-center justify-center">
                <span className="text-4xl">🎥</span>
              </div>
            )}
            <div className="absolute top-2 right-2">
              <Badge className="bg-black/70 text-white">
                {new Date(apod.date).toLocaleDateString("pt-BR")}
              </Badge>
            </div>
          </div>
          <CardHeader>
            <CardTitle className="text-white text-lg line-clamp-2">
              {apod.title}
            </CardTitle>
            {apod.copyright && (
              <CardDescription className="text-slate-400">
                📷 {apod.copyright}
              </CardDescription>
            )}
            <CardDescription className="text-slate-300 line-clamp-3">
              {apod.explanation}
            </CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">{apod.title}</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Badge variant="outline">
              {new Date(apod.date).toLocaleDateString("pt-BR")}
            </Badge>
            {apod.copyright && (
              <span className="text-slate-400">📷 {apod.copyright}</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {apod.media_type === "image" ? (
            <img
              src={apod.hdurl || apod.url}
              alt={apod.title}
              className="w-full rounded-lg shadow-lg"
            />
          ) : (
            <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <span className="text-6xl block mb-4">🎥</span>
                <p className="text-slate-400">
                  Vídeo disponível no link original
                </p>
                <Button asChild className="mt-4">
                  <a href={apod.url} target="_blank" rel="noopener noreferrer">
                    Ver Vídeo
                  </a>
                </Button>
              </div>
            </div>
          )}

          <div className="prose prose-invert max-w-none">
            <p className="text-slate-300 leading-relaxed">{apod.explanation}</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {apod.hdurl && (
              <Button asChild>
                <a href={apod.hdurl} target="_blank" rel="noopener noreferrer">
                  🖼️ Ver em HD
                </a>
              </Button>
            )}
            <Button variant="outline" asChild>
              <a href={apod.url} target="_blank" rel="noopener noreferrer">
                🔗 Link Original
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GaleriaAPOD;
