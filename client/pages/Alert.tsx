import { useState, useEffect } from "react";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Button } from "@/components/ui/button";
import { AlertCircle, Droplet, Calendar, AlertTriangle, MapPin } from "lucide-react";
import { useWaterLevel } from "@/context/WaterLevelContext";

const ALERT_THRESHOLD = 3000; // 3000 meters
const CRITICAL_THRESHOLD = 2000; // 2000 meters

const PRECAUTIONS = [
  "Limit non-essential water usage",
  "Fix any leaks immediately",
  "Use water-efficient appliances",
  "Collect and store rainwater",
  "Follow local water conservation guidelines"
];

const SEASONS = ["Summer", "Monsoon", "Winter"] as const;

type AlertData = {
  season: string;
  value: number;
  severity: 'low' | 'critical';
  date: string;
  location: string;
};

export default function Alert() {
  const { selectedLocation } = useWaterLevel();
  const locationName = selectedLocation?.description ? selectedLocation.description.split(',')[0] : "Current Location";
  const [showPrecautions, setShowPrecautions] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState<AlertData[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<AlertData | null>(null);
  
  useEffect(() => {
    // Generate mock alerts
    const mockAlerts: AlertData[] = [];
    const currentDate = new Date();
    
    SEASONS.forEach(season => {
      const value = Math.floor(Math.random() * 3500); // Random value up to 3500m
      if (value < ALERT_THRESHOLD) {
        mockAlerts.push({
          season,
          value,
          severity: value < CRITICAL_THRESHOLD ? 'critical' : 'low',
          date: currentDate.toLocaleDateString(),
          location: locationName
        });
      }
    });

    // Sort by severity (critical first) then by value (lowest first)
    mockAlerts.sort((a, b) => {
      if (a.severity === b.severity) {
        return a.value - b.value;
      }
      return a.severity === 'critical' ? -1 : 1;
    });

    setActiveAlerts(mockAlerts);
    if (mockAlerts.length > 0) {
      setSelectedAlert(mockAlerts[0]);
    }
  }, []);

  const getRandomPrecaution = () => {
    return PRECAUTIONS[Math.floor(Math.random() * PRECAUTIONS.length)];
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Water Level Alerts</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of water levels and seasonal alerts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-1.5">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{locationName}</span>
          </div>
        </div>
      </div>

      {selectedAlert && (
        <div className="space-y-4">
          <AlertBanner
            variant={selectedAlert.severity === 'critical' ? 'destructive' : 'warning'}
            title={
              selectedAlert.severity === 'critical'
                ? '🚨 Critical Water Level Alert! 🚨'
                : '⚠️ Low Water Level Alert'
            }
            description={
              `Water level is ${selectedAlert.severity === 'critical' ? 'critically ' : ''}low at ${selectedAlert.value}m. ` +
              `This is below the ${selectedAlert.severity === 'critical' ? 'critical' : 'recommended'} ` +
              `threshold of ${selectedAlert.severity === 'critical' ? CRITICAL_THRESHOLD : ALERT_THRESHOLD}m. ` +
              `Recommended action: ${getRandomPrecaution()}`
            }
            actions={
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Button 
                  size="sm" 
                  variant={selectedAlert.severity === 'critical' ? 'destructive' : 'outline'}
                  onClick={() => setShowPrecautions(!showPrecautions)}
                  className="flex items-center gap-1"
                >
                  <AlertCircle className="h-4 w-4" />
                  {showPrecautions ? 'Hide Precautions' : 'Show Precautions'}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                >
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">{locationName}</span>
                  </div>
                </Button>
              </div>
            }
          />
          
          {showPrecautions && (
            <div className="rounded-lg border bg-background p-4">
              <h4 className="mb-3 flex items-center gap-2 font-medium">
                <Droplet className="h-5 w-5 text-blue-500" />
                Water Conservation Tips
              </h4>
              <ul className="space-y-2 text-sm">
                {PRECAUTIONS.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Active Alerts
        </h2>
        
        {activeAlerts.length === 0 ? (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center text-green-800 dark:border-green-900 dark:bg-green-900/20 dark:text-green-200">
            No active alerts. Water levels are normal for all seasons.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeAlerts.map((alert, index) => (
              <div 
                key={index}
                onClick={() => setSelectedAlert(alert)}
                className={`cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md ${
                  selectedAlert?.season === alert.season 
                    ? 'ring-2 ring-primary' 
                    : 'hover:border-primary/50'
                } ${
                  alert.severity === 'critical' 
                    ? 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/10' 
                    : 'border-amber-100 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/10'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{alert.season} Water Level</h3>
                    <p className="text-sm text-muted-foreground">{alert.location} • {alert.date}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    alert.severity === 'critical'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200'
                  }`}>
                    {alert.severity === 'critical' ? 'Critical' : 'Warning'}
                  </span>
                </div>
                <div className="mt-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{alert.value}m</span>
                    <span className="text-sm text-muted-foreground">
                      (Threshold: {alert.severity === 'critical' ? CRITICAL_THRESHOLD : ALERT_THRESHOLD}m)
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div 
                      className={`h-full ${
                        alert.severity === 'critical' ? 'bg-red-500' : 'bg-amber-400'
                      }`}
                      style={{
                        width: `${Math.min(100, (alert.value / (alert.severity === 'critical' ? CRITICAL_THRESHOLD : ALERT_THRESHOLD)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
