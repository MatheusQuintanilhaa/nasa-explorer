import React, { useState, useEffect } from "react";
import { nasaService, NEOResponse, NEOData } from "../services/nasa";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Asteroides: React.FC = () => {
  const [neos, setNeos] = useState<NEOData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [viewMode, setViewMode] = useState<"feed" | "lookup">("feed");
  const [asteroidId, setAsteroidId] = useState<string>("");
  const [singleAsteroid, setSingleAsteroid] = useState<NEOData | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Função para formatar data para o input
  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  // Inicializar com data de hoje e próximos dias
  useEffect(() => {
    const today = new Date();
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);

    setStartDate(formatDateForInput(today));
    setEndDate(formatDateForInput(endOfWeek));
  }, []);

  // Buscar NEOs por período
  const fetchNEOsFeed = async (start: string, end: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await nasaService.getNEOs(start, end);

      // Extrair todos os NEOs dos diferentes dias
      const allNEOs: NEOData[] = [];
      let total = 0;

      Object.keys(response.near_earth_objects).forEach((date) => {
        const dayNEOs = response.near_earth_objects[date];
        allNEOs.push(...dayNEOs);
        total += dayNEOs.length;
      });

      // Ordenar por data de aproximação mais próxima
      allNEOs.sort((a, b) => {
        const dateA = new Date(
          a.close_approach_data[0]?.close_approach_date || ""
        );
        const dateB = new Date(
          b.close_approach_data[0]?.close_approach_date || ""
        );
        return dateA.getTime() - dateB.getTime();
      });

      setNeos(allNEOs);
      setTotalCount(total);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar asteroides"
      );
      console.error("Erro ao buscar NEOs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Buscar asteroide específico
  const fetchSingleNEO = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await nasaService.getNEOById(id);
      setSingleAsteroid(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar asteroide"
      );
      console.error("Erro ao buscar NEO:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleFeedSearch = () => {
    if (startDate && endDate) {
      fetchNEOsFeed(startDate, endDate);
    }
  };

  const handleLookupSearch = () => {
    if (asteroidId.trim()) {
      fetchSingleNEO(asteroidId.trim());
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    if (startDate && endDate && viewMode === "feed") {
      fetchNEOsFeed(startDate, endDate);
    }
  }, []);

  // Função para quick ranges
  const setQuickRange = (days: number) => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + days);

    setStartDate(formatDateForInput(today));
    setEndDate(formatDateForInput(futureDate));
  };

  // Função para determinar nível de perigo
  const getDangerLevel = (neo: NEOData) => {
    if (neo.is_potentially_hazardous_asteroid) return "alto";

    const approach = neo.close_approach_data[0];
    if (!approach) return "baixo";

    const distance = parseFloat(approach.miss_distance.kilometers);
    const velocity = parseFloat(approach.relative_velocity.kilometers_per_hour);

    if (distance < 1000000 && velocity > 50000) return "médio";
    return "baixo";
  };

  // Função para cor do badge de perigo
  const getDangerColor = (level: string) => {
    switch (level) {
      case "alto":
        return "destructive";
      case "médio":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent">
          ☄️ Asteroides Próximos (NEOs)
        </h1>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          Monitore objetos próximos à Terra e asteroides potencialmente
          perigosos
        </p>
      </div>

      {/* Controls */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            🎯 Buscar Asteroides
          </CardTitle>
          <CardDescription>
            Explore asteroides por período ou busque um específico
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs
            value={viewMode}
            onValueChange={(value) => setViewMode(value as "feed" | "lookup")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="feed">Por Período</TabsTrigger>
              <TabsTrigger value="lookup">Asteroide Específico</TabsTrigger>
            </TabsList>

            <TabsContent value="feed" className="space-y-4">
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
                    min={formatDateForInput(new Date())}
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
                    min={startDate || formatDateForInput(new Date())}
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
                  Próximos 7 dias
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setQuickRange(30)}
                >
                  Próximo mês
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setQuickRange(90)}
                >
                  Próximos 3 meses
                </Button>
              </div>

              <Button
                onClick={handleFeedSearch}
                disabled={loading || !startDate || !endDate}
                className="w-full"
              >
                {loading ? "Buscando..." : "🔍 Buscar Asteroides"}
              </Button>
            </TabsContent>

            <TabsContent value="lookup" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  ID do Asteroide
                </label>
                <Input
                  type="text"
                  value={asteroidId}
                  onChange={(e) => setAsteroidId(e.target.value)}
                  placeholder="Ex: 3542519, 2021277, etc."
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Digite o ID numérico do asteroide
                </p>
              </div>

              {/* Quick ID Buttons */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setAsteroidId("3542519")}
                >
                  3542519
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setAsteroidId("2021277")}
                >
                  2021277
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setAsteroidId("3726710")}
                >
                  3726710
                </Button>
              </div>

              <Button
                onClick={handleLookupSearch}
                disabled={loading || !asteroidId.trim()}
                className="w-full"
              >
                {loading ? "Buscando..." : "🔍 Buscar Asteroide"}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Alert className="border-red-500/50 bg-red-950/20">
          <AlertDescription className="text-red-400">
            ❌ {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Results */}
      <div className="space-y-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-slate-800/50">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : viewMode === "feed" && neos.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                {totalCount} Asteroides Encontrados
              </h2>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {new Date(startDate).toLocaleDateString("pt-BR")} -{" "}
                  {new Date(endDate).toLocaleDateString("pt-BR")}
                </Badge>
                <Badge className="bg-red-600">
                  {
                    neos.filter((neo) => neo.is_potentially_hazardous_asteroid)
                      .length
                  }{" "}
                  Perigosos
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {neos.map((neo, index) => (
                <NEOCard key={`${neo.id}-${index}`} neo={neo} />
              ))}
            </div>
          </>
        ) : viewMode === "lookup" && singleAsteroid ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                Asteroide Encontrado
              </h2>
              <Badge variant="outline">ID: {singleAsteroid.id}</Badge>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <NEOCard neo={singleAsteroid} detailed />
            </div>
          </>
        ) : (
          !loading && (
            <Card className="bg-slate-800/50">
              <CardContent className="pt-6 text-center">
                <p className="text-slate-400 mb-2">
                  🔍{" "}
                  {viewMode === "feed"
                    ? "Selecione um período para buscar asteroides"
                    : "Digite o ID de um asteroide para buscar"}
                </p>
                <p className="text-sm text-slate-500">
                  {viewMode === "feed"
                    ? "Use os botões rápidos ou defina datas personalizadas"
                    : "Experimente os IDs de exemplo ou procure por um específico"}
                </p>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
};

// Componente para cada card NEO
const NEOCard: React.FC<{ neo: NEOData; detailed?: boolean }> = ({
  neo,
  detailed = false,
}) => {
  const dangerLevel = getDangerLevel(neo);
  const approach = neo.close_approach_data[0];

  // Funções helper
  const formatDistance = (km: string) => {
    const distance = parseFloat(km);
    if (distance > 1000000) {
      return `${(distance / 1000000).toFixed(2)} milhões km`;
    }
    return `${distance.toLocaleString()} km`;
  };

  const formatVelocity = (kmh: string) => {
    return `${parseFloat(kmh).toLocaleString()} km/h`;
  };

  const formatDiameter = (min: number, max: number) => {
    return `${min.toFixed(0)} - ${max.toFixed(0)} m`;
  };

  const getDangerLevel = (neo: NEOData) => {
    if (neo.is_potentially_hazardous_asteroid) return "alto";

    if (!approach) return "baixo";

    const distance = parseFloat(approach.miss_distance.kilometers);
    const velocity = parseFloat(approach.relative_velocity.kilometers_per_hour);

    if (distance < 1000000 && velocity > 50000) return "médio";
    return "baixo";
  };

  const getDangerColor = (level: string) => {
    switch (level) {
      case "alto":
        return "destructive";
      case "médio":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card
          className={`cursor-pointer transition-all hover:border-slate-600 ${
            neo.is_potentially_hazardous_asteroid
              ? "bg-red-950/20 border-red-500/30"
              : "bg-slate-800/50 border-slate-700"
          }`}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-white text-lg line-clamp-2">
                {neo.name}
              </CardTitle>
              <div className="flex flex-col gap-1">
                <Badge variant={getDangerColor(dangerLevel)}>
                  {dangerLevel === "alto"
                    ? "⚠️ Alto"
                    : dangerLevel === "médio"
                    ? "⚡ Médio"
                    : "✅ Baixo"}
                </Badge>
                {neo.is_potentially_hazardous_asteroid && (
                  <Badge className="bg-red-600 text-xs">PHA</Badge>
                )}
              </div>
            </div>
            <CardDescription>
              ID: {neo.id} •{" "}
              {approach
                ? `${neo.close_approach_data.length} aproximações`
                : "Sem dados"}
            </CardDescription>
          </CardHeader>

          {approach && (
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-400">📅 Próxima aproximação</p>
                  <p className="text-white font-medium">
                    {new Date(approach.close_approach_date).toLocaleDateString(
                      "pt-BR"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">📏 Distância</p>
                  <p className="text-white font-medium">
                    {formatDistance(approach.miss_distance.kilometers)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">⚡ Velocidade</p>
                  <p className="text-white font-medium">
                    {formatVelocity(
                      approach.relative_velocity.kilometers_per_hour
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">📐 Diâmetro</p>
                  <p className="text-white font-medium">
                    {formatDiameter(
                      neo.estimated_diameter.meters.estimated_diameter_min,
                      neo.estimated_diameter.meters.estimated_diameter_max
                    )}
                  </p>
                </div>
              </div>

              {detailed && (
                <div className="pt-3 border-t border-slate-700">
                  <p className="text-slate-400 text-sm">
                    ⭐ Magnitude absoluta: {neo.absolute_magnitude_h}
                  </p>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white text-xl flex items-center gap-2">
            {neo.name}
            {neo.is_potentially_hazardous_asteroid && (
              <Badge className="bg-red-600">⚠️ Potencialmente Perigoso</Badge>
            )}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">ID: {neo.id}</Badge>
            <Badge variant={getDangerColor(dangerLevel)}>
              Risco:{" "}
              {dangerLevel.charAt(0).toUpperCase() + dangerLevel.slice(1)}
            </Badge>
            <Badge variant="secondary">
              {neo.close_approach_data.length} aproximações registradas
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Características Gerais */}
          <Card className="bg-slate-800/50">
            <CardHeader>
              <CardTitle className="text-white text-lg">
                📊 Características
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400 text-sm">Magnitude Absoluta</p>
                <p className="text-white font-medium">
                  {neo.absolute_magnitude_h}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Diâmetro Estimado</p>
                <p className="text-white font-medium">
                  {formatDiameter(
                    neo.estimated_diameter.meters.estimated_diameter_min,
                    neo.estimated_diameter.meters.estimated_diameter_max
                  )}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">
                  Potencialmente Perigoso
                </p>
                <p className="text-white font-medium">
                  {neo.is_potentially_hazardous_asteroid ? "⚠️ Sim" : "✅ Não"}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Objeto Sentry</p>
                <p className="text-white font-medium">
                  {neo.is_sentry_object ? "🎯 Sim" : "❌ Não"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Aproximações */}
          {neo.close_approach_data.length > 0 && (
            <Card className="bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  🛰️ Aproximações à Terra
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {neo.close_approach_data
                    .slice(0, 5)
                    .map((approach, index) => (
                      <div
                        key={index}
                        className="p-4 bg-slate-700/50 rounded-lg"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-slate-400 text-sm">Data</p>
                            <p className="text-white font-medium">
                              {new Date(
                                approach.close_approach_date
                              ).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-sm">Distância</p>
                            <p className="text-white font-medium">
                              {formatDistance(
                                approach.miss_distance.kilometers
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-sm">Velocidade</p>
                            <p className="text-white font-medium">
                              {formatVelocity(
                                approach.relative_velocity.kilometers_per_hour
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-sm">
                              Corpo Orbital
                            </p>
                            <p className="text-white font-medium">
                              {approach.orbiting_body === "Earth"
                                ? "🌍 Terra"
                                : approach.orbiting_body}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                  {neo.close_approach_data.length > 5 && (
                    <p className="text-slate-400 text-center text-sm">
                      ... e mais {neo.close_approach_data.length - 5}{" "}
                      aproximações
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Links */}
          <div className="flex gap-2 flex-wrap">
            <Button asChild>
              <a
                href={`https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=${neo.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                🔗 NASA JPL Database
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a
                href={neo.nasa_jpl_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                📊 Dados Orbitais
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Asteroides;
