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
    today.setDate(today.getDate() - 30); // 30 dias atrás para ter mais chances de fotos
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
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-red-400 to-orange-600 bg-clip-text text-transparent">
          🔴 Mars Rovers
        </h1>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          Explore Marte através das câmeras dos rovers da NASA
        </p>
      </div>

      {/* Rover Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(ROVERS_INFO).map(([key, rover]) => (
          <Card
            key={key}
            className={`cursor-pointer transition-all ${
              selectedRover === key
                ? "bg-red-950/50 border-red-500/50"
                : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
            }`}
            onClick={() => setSelectedRover(key as typeof selectedRover)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">
                  {rover.name}
                </CardTitle>
                <Badge
                  variant={
                    rover.status.includes("Ativo") ? "default" : "secondary"
                  }
                >
                  {rover.status}
                </Badge>
              </div>
              <CardDescription>
                <div className="space-y-1 text-sm">
                  <p>📅 Pouso: {rover.landing}</p>
                  <p>📍 Local: {rover.location}</p>
                  <p>🎯 Missão: {rover.mission}</p>
                </div>
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            🎛️ Filtros de Busca
          </CardTitle>
          <CardDescription>Personalize sua exploração marciana</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs
            value={dateType}
            onValueChange={(value) => setDateType(value as "sol" | "earth")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sol">Sol (Dia Marciano)</TabsTrigger>
              <TabsTrigger value="earth">Data Terrestre</TabsTrigger>
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
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Ex: 1000"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Sol 0 = dia do pouso
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Câmera
                  </label>
                  <Select
                    value={selectedCamera}
                    onValueChange={setSelectedCamera}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todas as Câmeras</SelectItem>
                      {ROVERS_INFO[selectedRover].cameras.map((camera) => (
                        <SelectItem key={camera.code} value={camera.code}>
                          {camera.code} - {camera.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quick Sol Buttons */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSolDate("0")}
                >
                  Sol 0 (Pouso)
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSolDate("100")}
                >
                  Sol 100
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSolDate("1000")}
                >
                  Sol 1000
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSolDate("2000")}
                >
                  Sol 2000
                </Button>
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
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Câmera
                  </label>
                  <Select
                    value={selectedCamera}
                    onValueChange={setSelectedCamera}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todas as Câmeras</SelectItem>
                      {ROVERS_INFO[selectedRover].cameras.map((camera) => (
                        <SelectItem key={camera.code} value={camera.code}>
                          {camera.code} - {camera.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Quick Search Buttons */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-300">
              🚀 Buscas Rápidas:
            </p>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickSearch("curiosity", 1000)}
              >
                Curiosity Sol 1000
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickSearch("opportunity", 100)}
              >
                Opportunity Sol 100
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickSearch("spirit", 500)}
              >
                Spirit Sol 500
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleQuickSearch("curiosity", undefined, "2023-01-01")
                }
              >
                Curiosity 2023
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-red-500/50 bg-red-950/20">
          <CardContent className="pt-6">
            <p className="text-red-400">❌ {error}</p>
            <Button
              onClick={() => fetchPhotos(1)}
              variant="outline"
              className="mt-4"
            >
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <div className="space-y-4">
        {loading && photos.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-slate-800/50">
                <Skeleton className="aspect-square" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : photos.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                {photos.length} Fotos Encontradas
              </h2>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {ROVERS_INFO[selectedRover].name}
                </Badge>
                <Badge variant="secondary">
                  {dateType === "sol"
                    ? `Sol ${solDate}`
                    : new Date(earthDate).toLocaleDateString("pt-BR")}
                </Badge>
                {selectedCamera !== "ALL" && <Badge>{selectedCamera}</Badge>}
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
                variant="outline"
                size="lg"
              >
                {loading ? "Carregando..." : "🔄 Carregar Mais Fotos"}
              </Button>
            </div>
          </>
        ) : (
          !loading && (
            <Card className="bg-slate-800/50">
              <CardContent className="pt-6 text-center">
                <p className="text-slate-400 mb-4">
                  🔍 Nenhuma foto encontrada para os filtros selecionados
                </p>
                <p className="text-sm text-slate-500">
                  Tente ajustar os filtros ou selecionar outra data
                </p>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
};

// Componente para cada card de foto
const RoverPhotoCard: React.FC<{ photo: MarsRoverPhoto }> = ({ photo }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer group">
          <div className="relative">
            <img
              src={photo.img_src}
              alt={`${photo.rover.name} - ${photo.camera.full_name}`}
              className="w-full aspect-square object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute top-2 right-2">
              <Badge className="bg-black/70 text-white">
                {photo.camera.name}
              </Badge>
            </div>
            <div className="absolute bottom-2 left-2">
              <Badge variant="secondary">Sol {photo.sol}</Badge>
            </div>
          </div>
          <CardHeader>
            <CardTitle className="text-white text-lg">
              {photo.rover.name}
            </CardTitle>
            <CardDescription className="space-y-1">
              <p className="text-slate-300">📸 {photo.camera.full_name}</p>
              <p className="text-slate-400">
                📅 {new Date(photo.earth_date).toLocaleDateString("pt-BR")}
              </p>
              <p className="text-slate-400">
                🔴 Sol {photo.sol} • ID: {photo.id}
              </p>
            </CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">
            {photo.rover.name} - {photo.camera.full_name}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">Sol {photo.sol}</Badge>
            <Badge variant="secondary">
              {new Date(photo.earth_date).toLocaleDateString("pt-BR")}
            </Badge>
            <Badge>{photo.camera.name}</Badge>
            <span className="text-slate-400">ID: {photo.id}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <img
            src={photo.img_src}
            alt={`${photo.rover.name} - ${photo.camera.full_name}`}
            className="w-full rounded-lg shadow-lg"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-white text-lg">🤖 Rover</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-slate-300">
                  <strong>Nome:</strong> {photo.rover.name}
                </p>
                <p className="text-slate-300">
                  <strong>Status:</strong> {photo.rover.status}
                </p>
                <p className="text-slate-300">
                  <strong>Pouso:</strong>{" "}
                  {new Date(photo.rover.landing_date).toLocaleDateString(
                    "pt-BR"
                  )}
                </p>
                <p className="text-slate-300">
                  <strong>Lançamento:</strong>{" "}
                  {new Date(photo.rover.launch_date).toLocaleDateString(
                    "pt-BR"
                  )}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-white text-lg">📸 Câmera</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-slate-300">
                  <strong>Nome:</strong> {photo.camera.name}
                </p>
                <p className="text-slate-300">
                  <strong>Descrição:</strong> {photo.camera.full_name}
                </p>
                <p className="text-slate-300">
                  <strong>Sol:</strong> {photo.sol}
                </p>
                <p className="text-slate-300">
                  <strong>Data Terra:</strong>{" "}
                  {new Date(photo.earth_date).toLocaleDateString("pt-BR")}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button asChild>
              <a href={photo.img_src} target="_blank" rel="noopener noreferrer">
                🖼️ Ver Imagem Original
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a
                href={`https://mars.nasa.gov/mars2020/multimedia/images/`}
                target="_blank"
                rel="noopener noreferrer"
              >
                🔗 Mais sobre {photo.rover.name}
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MarsRovers;
