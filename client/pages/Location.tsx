import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { loadGoogleMaps } from "@/lib/google";
import LocationSearch, { PlaceResult } from "@/components/search/LocationSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, Droplet, Thermometer, CloudRain, BarChart2 } from "lucide-react";
import { useWaterLevel } from "@/context/WaterLevelContext";

export default function LocationPage() {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [notice, setNotice] = useState<string | null>('Loading map...');
  
  const {
    selectedLocation,
    waterData,
    isLoading,
    error,
    setSelectedLocation,
    fetchWaterData,
    setError,
  } = useWaterLevel();

  // Initialize map and handle location selection
  useEffect(() => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
    if (!key) {
      setNotice("Google Maps API key is not configured. Please check your environment variables.");
      return;
    }
    
    setNotice('Loading map...');
    let mapInitialized = false;
    let mapCleanup = () => {};
    let observer: IntersectionObserver | null = null;
    let mapInstanceValue: google.maps.Map | null = null;

    // Clean up function for map resources
    const cleanupMap = () => {
      if (typeof mapCleanup === 'function') {
        mapCleanup();
      }
      
      // Clean up global callbacks
      if (window.initGoogleMapsCallback) {
        delete window.initGoogleMapsCallback;
      }
      
      mapInitialized = false;
    };

    const initMap = async () => {
      if (mapInitialized || !mapRef.current) return;
      
      try {
        setNotice('Loading Google Maps...');
        
        // Use the enhanced loadGoogleMaps utility
        const googleMaps = await loadGoogleMaps({
          apiKey: key,
          libraries: ['places', 'geometry'],
          language: 'en',
          region: 'IN',
          version: 'beta'
        });
        
        setNotice(null);
        
        // Set initial center (use stored location or default to India)
        const initialCenter = selectedLocation 
          ? { lat: selectedLocation.lat, lng: selectedLocation.lng }
          : { lat: 20.5937, lng: 78.9629 }; // Center of India
          
        // Initialize the map with proper options
        const mapOptions: google.maps.MapOptions = {
          center: initialCenter,
          zoom: selectedLocation ? 12 : 5,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_RIGHT
          },
          mapTypeId: 'roadmap',
          disableDefaultUI: false,
          clickableIcons: true,
          gestureHandling: 'auto',
          backgroundColor: '#f5f5f5',
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            },
            {
              featureType: 'transit',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        };
        
        mapInstanceValue = new googleMaps.Map(mapRef.current, mapOptions);
        
        // Add a marker if we have a location
        if (selectedLocation) {
          const position = { lat: selectedLocation.lat, lng: selectedLocation.lng };
          new googleMaps.Marker({
            position,
            map: mapInstanceValue,
            title: selectedLocation.description || 'Selected Location',
            animation: googleMaps.Animation.DROP
          });
          
          // Center the map on the marker
          mapInstanceValue.setCenter(position);
        }

        // Store the map instance in the ref
        mapInstance.current = mapInstanceValue;

        // Clean up function
        mapCleanup = () => {
          if (markerRef.current) {
            markerRef.current.setMap(null);
            markerRef.current = null;
          }
          
          if (mapInstanceValue) {
            googleMaps.event.clearInstanceListeners(mapInstanceValue);
            if (mapRef.current) {
              mapRef.current.innerHTML = '';
            }
            mapInstanceValue = null;
          }
          
          if (observer && mapRef.current) {
            observer.unobserve(mapRef.current);
            observer.disconnect();
            observer = null;
          }
        };
        
        mapInitialized = true;
        mapInstance.current = mapInstanceValue;
        
        // Set up IntersectionObserver for lazy loading
        const initObserver = () => {
          if ('IntersectionObserver' in window) {
            observer = new IntersectionObserver((entries) => {
              entries.forEach(entry => {
                if (entry.isIntersecting && mapRef.current && !mapInitialized) {
                  initMap();
                  if (observer && mapRef.current) {
                    observer.unobserve(mapRef.current);
                  }
                }
              });
            }, {
              root: null,
              rootMargin: '50px',
              threshold: 0.01
            });
            
            if (mapRef.current) {
              observer.observe(mapRef.current);
            }
          } else {
            // Fallback for browsers that don't support IntersectionObserver
            initMap();
          }
        };
        
        // Initialize the observer
        initObserver();
      } catch (error) {
        console.error("Error initializing map:", error);
        setNotice("Google Maps failed to load. Check API key and network.");
        cleanupMap();
      }
    };

    initMap();
    
    // Return cleanup function
    return () => {
      cleanupMap();
    };
  }, [selectedLocation]); // Re-run when selectedLocation changes

  const handleSelect = async (place: PlaceResult) => {
    if (!place.lat || !place.lng) return;
    
    try {
      // Update the selected location in context
      setSelectedLocation(place);
      
      // If map isn't initialized yet, wait for it
      if (!mapInstance.current) {
        await new Promise(resolve => {
          const checkMap = setInterval(() => {
            if (mapInstance.current) {
              clearInterval(checkMap);
              resolve(true);
            }
          }, 100);
        });
      }
      
      // Update the marker
      const pos = { lat: place.lat, lng: place.lng };
      if (markerRef.current) {
        markerRef.current.setPosition(pos);
        markerRef.current.setTitle(place.description);
        markerRef.current.setAnimation(window.google.maps.Animation.DROP);
      }
      
      // Pan and zoom to the selected location
      if (mapInstance.current) {
        mapInstance.current.panTo(pos);
        mapInstance.current.setZoom(12);
      }
      
      // Fetch water data through context
      await fetchWaterData(place);
    } catch (error) {
      console.error("Error selecting location:", error);
      setError("Failed to select location. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Water Level Tracker</h1>
        <p className="text-muted-foreground">Search any location to view water level data and forecasts</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          <LocationSearch 
            onSelect={handleSelect} 
            value={selectedLocation?.description || ''} 
          />
          {notice && <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">{notice}</div>}
          {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
          <div className="relative h-[500px] w-full overflow-hidden rounded-lg border shadow-sm bg-gray-50">
            <div 
              ref={mapRef} 
              className="absolute inset-0 h-full w-full"
              style={{ minHeight: '500px' }}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <AnimatePresence>
            {selectedLocation ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-blue-100 bg-blue-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                      <Droplet className="h-5 w-5" />
                      <span>Water Level Data</span>
                    </CardTitle>
                    <p className="text-sm text-blue-600">{selectedLocation.description}</p>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex h-40 items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
                      </div>
                    ) : error ? (
                      <div className="rounded-md bg-red-50 p-4 text-red-700">
                        <p className="text-sm">{error}</p>
                        <Button variant="outline" size="sm" className="mt-2" onClick={() => handleSelect(selectedLocation)}>
                          Retry
                        </Button>
                      </div>
                    ) : waterData ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="rounded-lg bg-white p-3 shadow-sm">
                            <p className="text-xs font-medium text-gray-500">Current Level</p>
                            <p className="text-2xl font-bold text-blue-600">{waterData.currentLevel}m</p>
                            <p className="text-xs text-gray-500">Avg: {waterData.averageLevel}m</p>
                          </div>
                          <div className="rounded-lg bg-white p-3 shadow-sm">
                            <p className="text-xs font-medium text-gray-500">Trend</p>
                            <div className="flex items-center gap-1">
                              {waterData.trend === 'up' && (
                                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                              )}
                              {waterData.trend === 'down' && (
                                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                              )}
                              {waterData.trend === 'stable' && (
                                <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                                </svg>
                              )}
                              <span className="font-medium capitalize">{waterData.trend}</span>
                            </div>
                            <p className="text-xs text-gray-500">Last updated: {new Date(waterData.lastUpdated).toLocaleTimeString()}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">5-Day Forecast</h4>
                          <div className="space-y-2">
                            {waterData.forecast.map((day, index) => (
                              <div key={index} className="flex items-center justify-between rounded-lg bg-white p-2 text-sm shadow-sm">
                                <span className="font-medium">{day.day}</span>
                                <div className="flex items-center gap-4">
                                  <span className="flex items-center gap-1 text-blue-600">
                                    <Droplet className="h-3.5 w-3.5" />
                                    {day.level}m
                                  </span>
                                  <span className="flex items-center gap-1 text-gray-600">
                                    <CloudRain className="h-3.5 w-3.5" />
                                    {day.precipitation}%
                                  </span>
                                  <span className="flex items-center gap-1 text-red-600">
                                    <Thermometer className="h-3.5 w-3.5" />
                                    {day.temperature}°C
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex justify-end pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs"
                            onClick={() => navigate('/analysis', { state: { location: selectedLocation, data: waterData } })}
                          >
                            <BarChart2 className="mr-1 h-3.5 w-3.5" />
                            View Detailed Analysis
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card className="h-full border-dashed">
                <CardContent className="flex h-full flex-col items-center justify-center p-8 text-center">
                  <Droplet className="mb-4 h-12 w-12 text-gray-300" />
                  <h3 className="mb-1 text-lg font-medium">No Location Selected</h3>
                  <p className="text-sm text-muted-foreground">Search and select a location to view water level data</p>
                </CardContent>
              </Card>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
