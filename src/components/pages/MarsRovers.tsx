import React, { useState, useEffect } from "react";
import { nasaService, MarsRoverPhoto } from "../services/nasa";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Informações sobre os rovers
const ROVERS_INFO = {
  curiosity: {
    name: "Curiosity",
    status: "Ativo",
    landing: "05/08/2012",
    location: "Cratera Gale",
    mission: "Procurar evidências de vida passada",
    emoji: "🤖",
    cameras: [
      { code: "FHAZ", name: "Front Hazard Avoidance Camera" },
      { code: "RHAZ", name: "Rear Hazard Avoidance Camera" },
      { code: "MAST", name: "Mast Camera" },
      { code: "CHEMCAM", name: "Chemistry and Camera Complex" },
      { code: "MAHLI", name: "Mars Hand Lens Imager" },
      { code: "MARDI", name: "Mars Descent Imager" },
      { code: "NAVCAM", name: "Navigation Camera" },
    ],
  },
  opportunity: {
    name: "Opportunity",
    status: "Inativo (2018)",
    landing: "25/01/2004",
    location: "Meridiani Planum",
    mission: "Procurar evidências de água passada",
    emoji: "🔋",
    cameras: [
      { code: "FHAZ", name: "Front Hazard Avoidance Camera" },
      { code: "RHAZ", name: "Rear Hazard Avoidance Camera" },
      { code: "NAVCAM", name: "Navigation Camera" },
      { code: "PANCAM", name: "Panoramic Camera" },
      { code: "MINITES", name: "Miniature Thermal Emission Spectrometer" },
    ],
  },
  spirit: {
    name: "Spirit",
    status: "Inativo (2010)",
    landing: "04/01/2004",
    location: "Cratera Gusev",
    mission: "Procurar evidências de água passada",
    emoji: "⚡",
    cameras: [
      { code: "FHAZ", name: "Front Hazard Avoidance Camera" },
      { code: "RHAZ", name: "Rear Hazard Avoidance Camera" },
      { code: "NAVCAM", name: "Navigation Camera" },
      { code: "PANCAM", name: "Panoramic Camera" },
      { code: "MINITES", name: "Miniature Thermal Emission Spectrometer" },
    ],
  },
};

const MarsRovers: React.FC = () => {
  const [photos, setPhotos] = useState<MarsRoverPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRover, setSelectedRover] = useState<
    "curiosity" | "opportunity" | "spirit"
  >("curiosity");
  const [selectedCamera, setSelectedCamera] = useState<string>("ALL");
  const [dateType, setDateType] = useState<"sol" | "earth">("sol");
  const [solDate, setSolDate] = useState<string>("1000");
  const [earthDate, setEarthDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  // Inicializar earth date
  useEffect(() => {
    const today = new Date();
    today.setDate(today.getDate() - 30);
    setEarthDate(today.toISOString().split("T")[0]);
  }, []);

  // Função para buscar fotos
  const fetchPhotos = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        rover: selectedRover,
        sol: dateType === "sol" ? parseInt(solDate) : undefined,
        earthDate: dateType === "earth" ? earthDate : undefined,
        camera: selectedCamera === "ALL" ? undefined : selectedCamera,
        page,
      };

      const response = await nasaService.getMarsRoverPhotos(
        params.rover,
        params.sol,
        params.earthDate,
        params.camera,
        params.page
      );

      if (page === 1) {
        setPhotos(response.photos);
      } else {
        setPhotos((prev) => [...prev, ...response.photos]);
      }
      setCurrentPage(page);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar fotos dos rovers"
      );
      console.error("Erro ao buscar fotos dos rovers:", err);
    } finally {
      setLoading(false);
    }
  };

  // Buscar fotos iniciais
  useEffect(() => {
    fetchPhotos(1);
  }, [selectedRover, selectedCamera, dateType, solDate, earthDate]);

  // Handler para carregar mais fotos
  const handleLoadMore = () => {
    fetchPhotos(currentPage + 1);
  };

  // Handler para busca rápida
  const handleQuickSearch = (
    rover: typeof selectedRover,
    sol?: number,
    earth?: string
  ) => {
    setSelectedRover(rover);
    if (sol) {
      setDateType("sol");
      setSolDate(sol.toString());
    }
    if (earth) {
      setDateType("earth");
      setEarthDate(earth);
    }
    setSelectedCamera("ALL");
  };

  return (
    <div className="space-y-8 constellation-pattern">
      {/* Header com gradiente Mars */}
      <div className="text-center nebula-bg rounded-2xl p-8 animate-float">
        <h1 className="text-5xl font-bold mb-4 gradient-text-mars animate-pulse-slow">
          🔴 Mars Rovers Explorer
        </h1>
        <p className="text-slate-300 text-xl max-w-3xl mx-auto">
          Descubra Marte através dos olhos dos rovers mais avançados da NASA
        </p>
      </div>

      {/* Rover Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(ROVERS_INFO).map(([key, rover]) => (
          <Card
            key={key}
            className={`space-card card-hover cursor-pointer transition-all duration-300 ${
              selectedRover === key
                ? "mars-accent border-red-500/50 animate-glow"
                : ""
            }`}
            onClick={() => setSelectedRover(key as typeof selectedRover)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  <span className="text-2xl">{rover.emoji}</span>
                  {rover.name}
                </CardTitle>
                <Badge
                  variant={
                    rover.status.includes("Ativo") ? "default" : "secondary"
                  }
                  className={
                    rover.status.includes("Ativo")
                      ? "bg-green-600 animate-pulse-slow"
                      : "bg-slate-600"
                  }
                >
                  {rover.status}
                </Badge>
              </div>
              <CardDescription className="space-y-2">
                <div className="text-sm space-y-1">
                  <p className="flex items-center gap-2">
                    <span>📅</span> Pouso: {rover.landing}
                  </p>
                  <p className="flex items-center gap-2">
                    <span>📍</span> Local: {rover.location}
                  </p>
                  <p className="flex items-center gap-2">
                    <span>🎯</span> Missão: {rover.mission}
                  </p>
                </div>
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="space-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-xl">
            <span className="animate-float">🎛️</span>
            Painel de Controle da Missão
          </CardTitle>
          <CardDescription>
            Configure os parâmetros de exploração
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs
            value={dateType}
            onValueChange={(value) => setDateType(value as "sol" | "earth")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
              <TabsTrigger value="sol" className="flex items-center gap-2">
                🔴 Sol (Dia Marciano)
              </TabsTrigger>
              <TabsTrigger value="earth" className="flex items-center gap-2">
                🌍 Data Terrestre
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sol" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Sol (Dia da Missão)
                  </label>
                  <Input
                    type="number"
                    value={solDate}
                    onChange={(e) => setSolDate(e.target.value)}
                    min="0"
                    max="4000"
                    className="space-input"
                    placeholder="Ex: 1000"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Sol 0 = primeiro dia em Marte
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Sistema de Câmeras
                  </label>
                  <Select
                    value={selectedCamera}
                    onValueChange={setSelectedCamera}
                  >
                    <SelectTrigger className="space-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="ALL">🔭 Todas as Câmeras</SelectItem>
                      {ROVERS_INFO[selectedRover].cameras.map((camera) => (
                        <SelectItem key={camera.code} value={camera.code}>
                          📸 {camera.code} - {camera.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quick Sol Buttons */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-300">
                  🚀 Momentos Históricos:
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSolDate("0")}
                    className="space-button text-sm"
                  >
                    Sol 0 (Pouso)
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSolDate("100")}
                    className="space-button text-sm"
                  >
                    Sol 100
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSolDate("1000")}
                    className="space-button text-sm"
                  >
                    Sol 1000
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSolDate("2000")}
                    className="space-button text-sm"
                  >
                    Sol 2000
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="earth" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Data Terrestre
                  </label>
                  <Input
                    type="date"
                    value={earthDate}
                    onChange={(e) => setEarthDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    min="2004-01-01"
                    className="space-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Sistema de Câmeras
                  </label>
                  <Select
                    value={selectedCamera}
                    onValueChange={setSelectedCamera}
                  >
                    <SelectTrigger className="space-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="ALL">🔭 Todas as Câmeras</SelectItem>
                      {ROVERS_INFO[selectedRover].cameras.map((camera) => (
                        <SelectItem key={camera.code} value={camera.code}>
                          📸 {camera.code} - {camera.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Quick Search Buttons */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <span className="animate-pulse">⚡</span>
              Explorações Rápidas:
            </p>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickSearch("curiosity", 1000)}
                className="hover:mars-accent transition-all"
              >
                🤖 Curiosity Sol 1000
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickSearch("opportunity", 100)}
                className="hover:mars-accent transition-all"
              >
                🔋 Opportunity Sol 100
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickSearch("spirit", 500)}
                className="hover:mars-accent transition-all"
              >
                ⚡ Spirit Sol 500
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleQuickSearch("curiosity", undefined, "2023-01-01")
                }
                className="hover:mars-accent transition-all"
              >
                🆕 Curiosity 2023
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-red-500/50 bg-red-950/20 mars-accent">
          <CardContent className="pt-6 text-center">
            <div className="text-6xl mb-4">🚨</div>
            <p className="text-red-400 text-lg mb-4">
              Falha na comunicação com Marte
            </p>
            <p className="text-red-300 mb-4">{error}</p>
            <Button onClick={() => fetchPhotos(1)} className="space-button">
              🔄 Reestabelecer Conexão
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <div className="space-y-6">
        {loading && photos.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-card loading-space">
                <Skeleton className="aspect-square rounded-t-lg loading-shimmer" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-6 w-3/4 loading-shimmer" />
                  <Skeleton className="h-4 w-1/2 loading-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : photos.length > 0 ? (
          <>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                <span className="animate-pulse">📡</span>
                {photos.length} Imagens Recebidas
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="bg-slate-800/50">
                  {ROVERS_INFO[selectedRover].emoji}{" "}
                  {ROVERS_INFO[selectedRover].name}
                </Badge>
                <Badge variant="secondary" className="bg-slate-700/50">
                  {dateType === "sol"
                    ? `Sol ${solDate}`
                    : new Date(earthDate).toLocaleDateString("pt-BR")}
                </Badge>
                {selectedCamera !== "ALL" && (
                  <Badge className="bg-blue-600">{selectedCamera}</Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map((photo, index) => (
                <RoverPhotoCard key={`${photo.id}-${index}`} photo={photo} />
              ))}
            </div>

            {/* Load More Button */}
            <div className="text-center">
              <Button
                onClick={handleLoadMore}
                disabled={loading}
                className="space-button text-lg px-8 py-4"
                size="lg"
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">🔄</span>
                    Carregando do Espaço...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🚀</span>
                    Carregar Mais Descobertas
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          !loading && (
            <Card className="space-card text-center py-12">
              <CardContent>
                <div className="text-8xl mb-6">🌌</div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Nenhuma transmissão recebida
                </h3>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">
                  Não foram encontradas imagens para os parâmetros selecionados.
                  Tente ajustar os filtros ou selecionar outra data.
                </p>
                <div className="flex gap-2 justify-center flex-wrap">
                  <Button
                    onClick={() => handleQuickSearch("curiosity", 1000)}
                    variant="outline"
                    className="hover:mars-accent"
                  >
                    🤖 Curiosity Popular
                  </Button>
                  <Button
                    onClick={() => handleQuickSearch("opportunity", 100)}
                    variant="outline"
                    className="hover:mars-accent"
                  >
                    🔋 Opportunity Clássico
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
};

// Componente para cada card de foto - ATUALIZADO
const RoverPhotoCard: React.FC<{ photo: MarsRoverPhoto }> = ({ photo }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="space-card card-hover cursor-pointer group">
          <div className="relative overflow-hidden rounded-t-lg">
            <img
              src={photo.img_src}
              alt={`${photo.rover.name} - ${photo.camera.full_name}`}
              className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-3 right-3">
              <Badge className="bg-black/70 text-white animate-pulse-slow">
                📸 {photo.camera.name}
              </Badge>
            </div>
            <div className="absolute bottom-3 left-3">
              <Badge variant="secondary" className="bg-red-600/80 text-white">
                Sol {photo.sol}
              </Badge>
            </div>
            <div className="absolute top-3 left-3">
              <Badge className="bg-blue-600/80 text-white">
                {
                  ROVERS_INFO[
                    photo.rover.name.toLowerCase() as keyof typeof ROVERS_INFO
                  ]?.emoji
                }{" "}
                {photo.rover.name}
              </Badge>
            </div>
          </div>
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <span className="text-red-500">🔴</span>
              Transmissão {photo.id}
            </CardTitle>
            <CardDescription className="space-y-1">
              <p className="text-slate-300 flex items-center gap-2">
                <span>📡</span> {photo.camera.full_name}
              </p>
              <p className="text-slate-400 flex items-center gap-2">
                <span>📅</span>{" "}
                {new Date(photo.earth_date).toLocaleDateString("pt-BR")}
              </p>
              <p className="text-slate-400 flex items-center gap-2">
                <span>🌍</span> Sol {photo.sol} • Marte
              </p>
            </CardDescription>
          </CardHeader>
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto bg-slate-900/95 border-slate-700 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl flex items-center gap-2">
            <span className="text-red-500 animate-pulse">🔴</span>
            {photo.rover.name} - Transmissão Detalhada
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="bg-slate-800/50">
              Sol {photo.sol}
            </Badge>
            <Badge variant="secondary" className="bg-slate-700/50">
              {new Date(photo.earth_date).toLocaleDateString("pt-BR")}
            </Badge>
            <Badge className="bg-blue-600">{photo.camera.name}</Badge>
            <span className="text-slate-400">ID: {photo.id}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="relative group">
            <img
              src={photo.img_src}
              alt={`${photo.rover.name} - ${photo.camera.full_name}`}
              className="w-full rounded-xl shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="space-card">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  🤖 Dados do Rover
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 min-w-[100px]">Nome:</span>
                  <span className="text-slate-300 font-semibold">
                    {photo.rover.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 min-w-[100px]">Status:</span>
                  <Badge
                    variant={
                      photo.rover.status === "active" ? "default" : "secondary"
                    }
                  >
                    {photo.rover.status === "active"
                      ? "🟢 Ativo"
                      : "🔴 Inativo"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 min-w-[100px]">Pouso:</span>
                  <span className="text-slate-300">
                    {new Date(photo.rover.landing_date).toLocaleDateString(
                      "pt-BR"
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 min-w-[100px]">
                    Lançamento:
                  </span>
                  <span className="text-slate-300">
                    {new Date(photo.rover.launch_date).toLocaleDateString(
                      "pt-BR"
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="space-card">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  📸 Sistema de Câmera
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 min-w-[100px]">Código:</span>
                  <Badge className="bg-blue-600">{photo.camera.name}</Badge>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400">Descrição:</span>
                  <span className="text-slate-300 text-sm leading-relaxed">
                    {photo.camera.full_name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 min-w-[100px]">Sol:</span>
                  <span className="text-slate-300 font-semibold">
                    {photo.sol}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 min-w-[100px]">
                    Data Terra:
                  </span>
                  <span className="text-slate-300">
                    {new Date(photo.earth_date).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-3 flex-wrap justify-center">
            <Button asChild className="space-button">
              <a href={photo.img_src} target="_blank" rel="noopener noreferrer">
                🖼️ Imagem Original
              </a>
            </Button>
            <Button variant="outline" asChild className="hover:space-accent">
              <a
                href={`https://mars.nasa.gov/mars2020/multimedia/images/`}
                target="_blank"
                rel="noopener noreferrer"
              >
                🔗 NASA Mars {photo.rover.name}
              </a>
            </Button>
            <Button variant="outline" className="hover:space-accent">
              💾 Salvar nos Favoritos
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MarsRovers;
