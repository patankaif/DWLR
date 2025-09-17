import { createContext, useContext, useState, ReactNode } from 'react';
import { PlaceResult } from '@/components/search/LocationSearch';

interface WaterLevelData {
  currentLevel: number;
  averageLevel: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
  forecast: {
    day: string;
    level: number;
    precipitation: number;
    temperature: number;
  }[];
}

interface WaterLevelContextType {
  selectedLocation: PlaceResult | null;
  waterData: WaterLevelData | null;
  isLoading: boolean;
  error: string | null;
  setSelectedLocation: (location: PlaceResult | null) => void;
  setWaterData: (data: WaterLevelData | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchWaterData: (place: PlaceResult) => Promise<void>;
}

const WaterLevelContext = createContext<WaterLevelContextType | undefined>(undefined);

// Mock data generator for water levels
const generateMockWaterData = (): WaterLevelData => {
  const trends: ('up' | 'down' | 'stable')[] = ['up', 'down', 'stable'];
  const forecast = Array.from({ length: 5 }, (_, i) => ({
    day: ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5'][i],
    level: Math.floor(Math.random() * 1000) + 500,
    precipitation: Math.floor(Math.random() * 30),
    temperature: Math.floor(Math.random() * 15) + 15, // 15-30°C
  }));

  return {
    currentLevel: Math.floor(Math.random() * 1000) + 500,
    averageLevel: 1000,
    trend: trends[Math.floor(Math.random() * trends.length)],
    lastUpdated: new Date().toLocaleString(),
    forecast,
  };
};

// Helper function to safely parse localStorage
const getStoredData = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error parsing ${key} from localStorage:`, error);
    return defaultValue;
  }
};

export function WaterLevelProvider({ children }: { children: ReactNode }) {
  const [selectedLocation, setSelectedLocation] = useState<PlaceResult | null>(
    () => getStoredData<PlaceResult | null>('selectedLocation', null)
  );
  const [waterData, setWaterData] = useState<WaterLevelData | null>(
    () => getStoredData<WaterLevelData | null>('waterData', null)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Update localStorage when state changes
  const updateSelectedLocation = (location: PlaceResult | null) => {
    setSelectedLocation(location);
    if (location) {
      localStorage.setItem('selectedLocation', JSON.stringify(location));
    } else {
      localStorage.removeItem('selectedLocation');
    }
  };
  
  const updateWaterData = (data: WaterLevelData | null) => {
    setWaterData(data);
    if (data) {
      localStorage.setItem('waterData', JSON.stringify(data));
    } else {
      localStorage.removeItem('waterData');
    }
  };

  const fetchWaterData = async (place: PlaceResult) => {
    setIsLoading(true);
    setError(null);
    setSelectedLocation(place); // Set the selected location first
    
    try {
      // Simulate API call with 2000ms delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      const data = generateMockWaterData();
      setWaterData(data);
      
      // Save to localStorage for persistence
      localStorage.setItem('selectedLocation', JSON.stringify(place));
      localStorage.setItem('waterData', JSON.stringify(data));
    } catch (err) {
      setError('Failed to fetch water level data. Please try again.');
      console.error('Error fetching water data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WaterLevelContext.Provider
      value={{
        selectedLocation,
        waterData,
        isLoading,
        error,
        setSelectedLocation: updateSelectedLocation,
        setWaterData: updateWaterData,
        setIsLoading,
        setError,
        fetchWaterData,
      }}
    >
      {children}
    </WaterLevelContext.Provider>
  );
}

export function useWaterLevel() {
  const context = useContext(WaterLevelContext);
  if (context === undefined) {
    throw new Error('useWaterLevel must be used within a WaterLevelProvider');
  }
  return context;
}
