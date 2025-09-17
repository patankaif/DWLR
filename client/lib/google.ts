// Type definitions for Google Maps API
declare global {
  interface Window {
    google?: {
      maps: {
        // Core map and marker types
        event: {
          clearInstanceListeners: (instance: any) => void;
        };
        Animation: {
          DROP: google.maps.Animation;
        };
        places: {
          AutocompleteService: new () => google.maps.places.AutocompleteService;
          PlacesService: new (attrContainer: HTMLDivElement) => google.maps.places.PlacesService;
        };
        LatLng: new (lat: number, lng: number) => google.maps.LatLng;
        LatLngBounds: new (sw?: google.maps.LatLng | google.maps.LatLngLiteral, ne?: google.maps.LatLng | google.maps.LatLngLiteral) => google.maps.LatLngBounds;
      };
    };
    initGoogleMapsCallback?: () => void;
  }
}

export interface LoadGoogleMapsOptions {
  apiKey: string;
  libraries?: ('drawing' | 'geometry' | 'localContext' | 'places' | 'visualization')[];
  version?: string;
  language?: string;
  region?: string;
  mapIds?: string[];
  authReferrerPolicy?: 'origin' | 'origin-when-cross-origin';
}

const GOOGLE_MAPS_LOADER_URL = 'https://maps.googleapis.com/maps/api/js';

/**
 * Load Google Maps API with the specified options
 */
let mapsPromise: Promise<typeof google.maps> | null = null;

export async function loadGoogleMaps({
  apiKey,
  libraries = ['places', 'geometry'],
  version = 'beta',
  language = 'en',
  region = 'IN',
  mapIds = [],
  authReferrerPolicy = 'origin',
}: LoadGoogleMapsOptions): Promise<typeof window.google.maps> {
  // Return existing promise if already loading
  if (mapsPromise) {
    return mapsPromise;
  }

  // Return if already loaded
  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  // Check for existing script
  const existingScript = document.getElementById('google-maps-script');
  if (existingScript) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Google Maps API load timeout'));
      }, 10000); // 10 second timeout

      existingScript.addEventListener('load', () => {
        clearTimeout(timeout);
        if (window.google?.maps) {
          resolve(window.google.maps);
        } else {
          reject(new Error('Google Maps API loaded but google.maps is not available'));
        }
      });
      
      existingScript.addEventListener('error', (error) => {
        clearTimeout(timeout);
        existingScript.remove();
        reject(new Error(`Failed to load Google Maps script: ${error}`));
      });
    });
  }

  // Create and configure the script element
  const script = document.createElement('script');
  script.id = 'google-maps-script';
  script.async = true;
  script.defer = true;
  const nonceMeta = document.querySelector('meta[name="csp-nonce"]');
  if (nonceMeta) {
    script.nonce = nonceMeta.getAttribute('content') || '';
  }

  // Build the API URL with parameters
  const params = new URLSearchParams({
    key: apiKey,
    v: version,
    language,
    region,
    loading: 'async',
    callback: 'initGoogleMapsCallback',
    auth_referrer_policy: authReferrerPolicy,
  });

  if (libraries.length > 0) {
    params.append('libraries', libraries.join(','));
  }

  if (mapIds.length > 0) {
    params.append('map_ids', mapIds.join(','));
  }

  // Add cache buster
  params.append('_', Date.now().toString());

  script.src = `${GOOGLE_MAPS_LOADER_URL}?${params.toString()}`;

  // Set up the promise
  mapsPromise = new Promise((resolve, reject) => {
    // Set timeout for script loading
    const timeoutId = setTimeout(() => {
      reject(new Error('Google Maps API load timeout'));
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      mapsPromise = null;
    }, 15000); // 15 second timeout

    // Global callback function
    window.initGoogleMapsCallback = () => {
      clearTimeout(timeoutId);
      
      if (!window.google) {
        const err = new Error('Google object not available after loading script');
        console.error(err);
        return reject(err);
      }
      
      if (!window.google.maps) {
        const err = new Error('Google Maps API not available after loading');
        console.error(err);
        return reject(err);
      }
      
      console.log('Google Maps API successfully loaded');
      
      // Clean up the global callback
      delete window.initGoogleMapsCallback;
      
      // Resolve with the maps API
      resolve(window.google.maps);
    };

    // Handle script load errors
    script.onerror = (error) => {
      clearTimeout(timeoutId);
      console.error('Google Maps script error:', error);
      
      // Clean up
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      delete window.initGoogleMapsCallback;
      mapsPromise = null;
      
      reject(new Error(`Failed to load Google Maps script: ${error?.toString() || 'Unknown error'}`));
    };

    // Add the script to the document
    document.head.appendChild(script);
  });

  return mapsPromise;
}

// Extend Window interface for our callback
declare global {
  interface Window {
    initGoogleMapsCallback?: () => void;
  }
}
  