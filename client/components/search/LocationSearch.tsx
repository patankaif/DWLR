import { useEffect, useRef, useState, useCallback } from "react";
import { loadGoogleMaps } from "@/lib/google";

export interface PlaceResult {
  description: string;
  place_id?: string;
  lat?: number;
  lng?: number;
  formatted_address?: string;
  name?: string;
}

interface AutocompletePrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface LocationSearchProps {
  onSelect: (place: PlaceResult) => void;
  value?: string;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ onSelect, value = '' }) => {
  const [inputValue, setInputValue] = useState(value);
  const [predictions, setPredictions] = useState<AutocompletePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  // Initialize Google Maps services
  useEffect(() => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
    if (!key) {
      setNotice("Google Maps API key is not configured. Please check your environment variables.");
      return;
    }

    const init = async () => {
      try {
        const googleMaps = await loadGoogleMaps({
          apiKey: key,
          libraries: ['places'],
          language: 'en',
          region: 'IN'
        });

        autocompleteService.current = new googleMaps.places.AutocompleteService();
        placesService.current = new googleMaps.places.PlacesService(
          document.createElement('div')
        );
      } catch (error) {
        console.error('Error initializing Google Maps:', error);
        setNotice('Failed to load Google Maps. Please try again later.');
      }
    };

    init();

    return () => {
      autocompleteService.current = null;
      placesService.current = null;
    };
  }, []);

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (!value || !autocompleteService.current) {
      setPredictions([]);
      return;
    }

    setIsLoading(true);

    autocompleteService.current.getPlacePredictions(
      {
        input: value,
        componentRestrictions: { country: 'in' },
        types: ['(regions)'],
      },
      (predictions: AutocompletePrediction[] | null, status: google.maps.places.PlacesServiceStatus) => {
        setIsLoading(false);

        if (status !== 'OK' || !predictions) {
          console.error('Error fetching predictions:', status);
          setPredictions([]);
          return;
        }

        setPredictions(predictions);
        setShowDropdown(true);
      }
    );
  }, []);

  const handleSelectPlace = useCallback((place: AutocompletePrediction) => {
    if (!placesService.current) return;
    
    setIsLoading(true);
    setInputValue(place.description);
    setShowDropdown(false);
    
    placesService.current.getDetails(
      {
        placeId: place.place_id,
        fields: ['geometry', 'name', 'formatted_address']
      },
      (result: google.maps.places.PlaceResult | null, status: google.maps.places.PlacesServiceStatus) => {
        setIsLoading(false);

        if (status !== 'OK' || !result) {
          console.error('Error getting place details:', status);
          return;
        }

        const location = result.geometry?.location;
        const selectedPlace: PlaceResult = {
          description: place.description,
          place_id: place.place_id,
          name: result.name,
          formatted_address: result.formatted_address,
          lat: location?.lat(),
          lng: location?.lng()
        };

        onSelect(selectedPlace);
      }
    );
  }, [onSelect]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (predictions.length > 0) {
      handleSelectPlace(predictions[0]);
    }
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(predictions.length > 0)}
          className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Search for a location in India..."
          disabled={isLoading}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="h-4 w-4 animate-spin text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </form>

      {showDropdown && predictions.length > 0 && (
        <ul 
          ref={dropdownRef}
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg"
        >
          {predictions.map((prediction) => (
            <li key={prediction.place_id}>
              <button
                type="button"
                className="w-full px-4 py-2 text-left hover:bg-gray-100"
                onClick={() => handleSelectPlace(prediction)}
              >
                <div className="font-medium">{prediction.structured_formatting.main_text}</div>
                <div className="text-xs text-gray-500">{prediction.structured_formatting.secondary_text}</div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {notice && (
        <p className="mt-1 text-xs text-amber-600">{notice}</p>
      )}
    </div>
  );
};

export default LocationSearch;
