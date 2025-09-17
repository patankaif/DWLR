import { useEffect, useMemo } from "react";
import { useWaterLevel } from "@/context/WaterLevelContext";
import LocationSearch, { PlaceResult } from "@/components/search/LocationSearch";
import { SeasonalCharts } from "@/components/charts/SeasonalCharts";

export default function Index() {
  const { selectedLocation, setSelectedLocation } = useWaterLevel();

  useEffect(() => {
    document.title = selectedLocation?.description 
      ? `${selectedLocation.description} – DWLR` 
      : "DWLR – Seasonal Water Insights";
  }, [selectedLocation?.description]);

  const seed = useMemo(() => {
    if (selectedLocation?.lat && selectedLocation?.lng) {
      return Math.floor((selectedLocation.lat + selectedLocation.lng) * 1000);
    }
    return 42;
  }, [selectedLocation?.lat, selectedLocation?.lng]);
  
  const handleSelect = (place: PlaceResult) => {
    setSelectedLocation(place);
  };

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <LocationSearch 
          onSelect={handleSelect} 
          value={selectedLocation?.description || ''} 
        />
        {selectedLocation && (
          <div className="rounded-xl border bg-secondary/30 px-4 py-2 text-sm text-foreground/80">
            Showing insights for: <strong>{selectedLocation.description}</strong>
          </div>
        )}
      </section>
      <section>
        <SeasonalCharts seed={seed} />
      </section>
    </div>
  );
}
