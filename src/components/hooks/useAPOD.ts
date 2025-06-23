import { useState, useEffect } from "react";
import { nasaService, APODResponse } from "../services/nasa";

interface UseAPODResult {
  data: APODResponse | null;
  loading: boolean;
  error: string | null;
  fetchAPOD: (date?: string) => Promise<void>;
}

export const useAPOD = (initialDate?: string): UseAPODResult => {
  const [data, setData] = useState<APODResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAPOD = async (date?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await nasaService.getAPOD(date);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar APOD");
      console.error("Erro ao buscar APOD:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAPOD(initialDate);
  }, [initialDate]);

  return { data, loading, error, fetchAPOD };
};
