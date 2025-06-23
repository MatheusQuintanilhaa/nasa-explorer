import { useState } from "react";
import { nasaService, MarsRoverPhoto } from "../services/nasa";

interface UseMarsRoversParams {
  rover: "curiosity" | "opportunity" | "spirit";
  sol?: number;
  earthDate?: string;
  camera?: string;
}

interface UseMarsRoversResult {
  photos: MarsRoverPhoto[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  fetchPhotos: (params: UseMarsRoversParams, page?: number) => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export const useMarsRovers = (): UseMarsRoversResult => {
  const [photos, setPhotos] = useState<MarsRoverPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastParams, setLastParams] = useState<UseMarsRoversParams | null>(
    null
  );
  const [hasMore, setHasMore] = useState(true);

  const fetchPhotos = async (params: UseMarsRoversParams, page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await nasaService.getMarsRoverPhotos(
        params.rover,
        params.sol,
        params.earthDate,
        params.camera === "ALL" ? undefined : params.camera,
        page
      );

      if (page === 1) {
        setPhotos(response.photos);
      } else {
        setPhotos((prev) => [...prev, ...response.photos]);
      }

      setCurrentPage(page);
      setLastParams(params);
      setHasMore(response.photos.length === 25); // NASA API retorna 25 por página
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar fotos dos rovers"
      );
      console.error("Erro ao buscar fotos dos rovers:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (lastParams && hasMore && !loading) {
      await fetchPhotos(lastParams, currentPage + 1);
    }
  };

  return {
    photos,
    loading,
    error,
    currentPage,
    fetchPhotos,
    loadMore,
    hasMore,
  };
};
