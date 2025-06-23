import axios from "axios";

const NASA_API_KEY = "dtsBEJCfyQ8cOeWwoHPc5YOpxJIq0gq5Rzr352XE";
const BASE_URL = "https://api.nasa.gov";

const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: NASA_API_KEY,
  },
});

// Tipos TypeScript para as respostas
export interface APODResponse {
  copyright?: string;
  date: string;
  explanation: string;
  hdurl?: string;
  media_type: "image" | "video";
  service_version: string;
  title: string;
  url: string;
}

export interface MarsRoverPhoto {
  id: number;
  sol: number;
  camera: {
    id: number;
    name: string;
    rover_id: number;
    full_name: string;
  };
  img_src: string;
  earth_date: string;
  rover: {
    id: number;
    name: string;
    landing_date: string;
    launch_date: string;
    status: string;
  };
}

export interface NearEarthObject {
  id: string;
  neo_reference_id: string;
  name: string;
  nasa_jpl_url: string;
  absolute_magnitude_h: number;
  estimated_diameter: {
    kilometers: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
  };
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: Array<{
    close_approach_date: string;
    close_approach_date_full: string;
    epoch_date_close_approach: number;
    relative_velocity: {
      kilometers_per_second: string;
      kilometers_per_hour: string;
    };
    miss_distance: {
      astronomical: string;
      lunar: string;
      kilometers: string;
    };
  }>;
}

// Serviços da API
export const nasaService = {
  // APOD - Astronomy Picture of the Day
  async getAPOD(date?: string): Promise<APODResponse> {
    const response = await api.get("/planetary/apod", {
      params: date ? { date } : undefined,
    });
    return response.data;
  },

  // Range de APODs
  async getAPODRange(
    startDate: string,
    endDate: string
  ): Promise<APODResponse[]> {
    const response = await api.get("/planetary/apod", {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
    });
    return response.data;
  },

  // Mars Rover Photos
  async getMarsRoverPhotos(
    rover: "curiosity" | "opportunity" | "spirit" = "curiosity",
    sol?: number,
    earthDate?: string,
    camera?: string,
    page: number = 1
  ): Promise<{ photos: MarsRoverPhoto[] }> {
    const params: any = { page };

    if (sol) params.sol = sol;
    if (earthDate) params.earth_date = earthDate;
    if (camera) params.camera = camera;

    const response = await api.get(
      `/mars-photos/api/v1/rovers/${rover}/photos`,
      {
        params,
      }
    );
    return response.data;
  },

  // Near Earth Objects
  async getNearEarthObjects(
    startDate: string,
    endDate: string
  ): Promise<{ near_earth_objects: { [date: string]: NearEarthObject[] } }> {
    const response = await api.get("/neo/rest/v1/feed", {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
    });
    return response.data;
  },

  // ISS Current Location
  async getISSLocation(): Promise<{
    iss_position: { latitude: string; longitude: string };
    message: string;
    timestamp: number;
  }> {
    // Esta API não precisa de chave
    const response = await axios.get("http://api.open-notify.org/iss-now.json");
    return response.data;
  },
};

export default nasaService;
