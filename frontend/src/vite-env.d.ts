/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
  readonly VITE_GEMINI_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Google Maps types
interface Window {
  google?: {
    maps?: {
      LatLng: typeof google.maps.LatLng;
      places?: {
        AutocompleteService: new () => google.maps.places.AutocompleteService;
        PlacesService: new (element: HTMLDivElement) => google.maps.places.PlacesService;
        PlacesServiceStatus: {
          OK: string;
          ZERO_RESULTS: string;
          INVALID_REQUEST: string;
          OVER_QUERY_LIMIT: string;
          REQUEST_DENIED: string;
          UNKNOWN_ERROR: string;
        };
      };
    };
  };
}

declare namespace google {
  namespace maps {
    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    namespace places {
      interface AutocompletePrediction {
        description: string;
        place_id: string;
        structured_formatting: {
          main_text: string;
          secondary_text?: string;
        };
      }

      interface AutocompleteService {
        getPlacePredictions(
          request: {
            input: string;
            types?: string[];
            location?: google.maps.LatLng;
            radius?: number;
            locationRestriction?: {
              center: google.maps.LatLng;
              radius: number;
            };
            componentRestrictions?: {
              country?: string | string[];
            };
          },
          callback: (
            predictions: AutocompletePrediction[] | null,
            status: string
          ) => void
        ): void;
      }

      interface PlacesService {
        getDetails(
          request: { placeId: string },
          callback: (result: any, status: string) => void
        ): void;
      }
    }
  }
}
