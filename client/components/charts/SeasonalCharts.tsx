import { useState, useEffect, useCallback } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SeasonalData {
  label: string;
  value: number;
  year: number;
}

interface AlertData {
  season: string;
  value: number;
  year: string;
  severity: 'low' | 'critical';
}

const ALERT_THRESHOLD = 3000; // 3000 meters
const CRITICAL_THRESHOLD = 2000; // 2000 meters

const PRECAUTIONS = [
  "Limit non-essential water usage",
  "Fix any leaks immediately",
  "Use water-efficient appliances",
  "Collect and store rainwater",
  "Follow local water conservation guidelines"
];

function getRandomPrecaution() {
  return PRECAUTIONS[Math.floor(Math.random() * PRECAUTIONS.length)];
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wide text-foreground/80">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Chart({ data, color, yTicks, yDomain, yTickFormatter }: { data: SeasonalData[]; color: string; yTicks?: number[]; yDomain?: [number, number]; yTickFormatter?: (v: number) => string }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
          <YAxis width={40} tickLine={false} axisLine={false} domain={yDomain} ticks={yTicks} tickFormatter={yTickFormatter} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} fill={color} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SeasonalCharts({ seed = 0 }: { seed?: number }) {
  const [showPrecautions, setShowPrecautions] = useState(false);
  const [activeAlert, setActiveAlert] = useState<AlertData | null>(null);

  const rnd = (i: number, min: number, max: number) => {
    const x = Math.sin(i + seed) * 10000;
    return Math.floor((x - Math.floor(x)) * (max - min + 1) + min);
  };

  const checkForAlerts = (data: SeasonalData[], season: string): AlertData[] => {
    const currentYear = new Date().getFullYear().toString();
    return data
      .filter(item => {
        const isCurrentYear = item.label === currentYear;
        const isBelowThreshold = item.value < ALERT_THRESHOLD;
        return isCurrentYear && isBelowThreshold;
      })
      .map(item => ({
        season,
        value: item.value,
        year: item.label,
        severity: item.value < CRITICAL_THRESHOLD ? 'critical' : 'low'
      }));
  };

  // Generate 40 years of historical data (20 years back, 20 years forward)
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 19; // Last 20 years including current year
  const allYears = Array.from({ length: 20 }, (_, i) => String(startYear + i));
  
  // State for year range selection
  const [yearRange, setYearRange] = useState<[number, number]>([0, 19]); // Indices for allYears array
  
  // Generate all historical data (20 years)
  const allWaterLevel = allYears.map((label, idx) => ({ 
    label, 
    value: rnd(idx + 1, 200, 4800),
    year: parseInt(label)
  }));
  
  const allSummer = allYears.map((label, idx) => ({ 
    label: `Summer ${label}`, 
    value: rnd(idx + 20, 100, 4000),
    year: parseInt(label)
  }));
  
  const allMonsoon = allYears.map((label, idx) => ({ 
    label: `Monsoon ${label}`, 
    value: rnd(idx + 40, 500, 5000),
    year: parseInt(label)
  }));
  
  const allWinter = allYears.map((label, idx) => ({ 
    label: `Winter ${label}`, 
    value: rnd(idx + 60, 50, 3000),
    year: parseInt(label)
  }));
  
  // Filter data based on selected year range
  const filterDataByYearRange = useCallback((data: SeasonalData[]) => {
    const startYear = parseInt(allYears[yearRange[0]]);
    const endYear = parseInt(allYears[yearRange[1]]);
    return data.filter((item): item is SeasonalData => 
      item.year >= startYear && item.year <= endYear
    );
  }, [yearRange, allYears]);
  
  // Get filtered data for charts
  const waterLevel = filterDataByYearRange(allWaterLevel);
  const summer = filterDataByYearRange(allSummer);
  const monsoon = filterDataByYearRange(allMonsoon);
  const winter = filterDataByYearRange(allWinter);
  
  // Find the maximum value across all datasets to ensure consistent Y-axis scaling
  const maxValue = Math.max(
    ...allWaterLevel.map(d => d.value),
    ...allSummer.map(d => d.value),
    ...allMonsoon.map(d => d.value),
    ...allWinter.map(d => d.value)
  );
  
  // Round up to the nearest 500m for consistent Y-axis ticks
  const yTop = Math.ceil(maxValue / 500) * 500;
  const yTicks = Array.from({ length: yTop / 500 + 1 }, (_, i) => i * 500);
  
  // Use the same Y-axis scale for all charts
  const chartProps = {
    yDomain: [0, yTop] as [number, number],
    yTicks,
    yTickFormatter: (v: number) => `${v} m`
  };
  
  // Format year range for display
  const formatYearRange = () => {
    return `${allYears[yearRange[0]]} - ${allYears[yearRange[1]]}`;
  };

  // Check for low water level alerts (only check current year data for alerts)
  const currentYearData = {
    summer: allSummer.find(d => d.year === currentYear) || allSummer[allSummer.length - 1],
    monsoon: allMonsoon.find(d => d.year === currentYear) || allMonsoon[allMonsoon.length - 1],
    winter: allWinter.find(d => d.year === currentYear) || allWinter[allWinter.length - 1]
  };

  const alerts = [
    ...checkForAlerts([currentYearData.summer], 'Summer'),
    ...checkForAlerts([currentYearData.monsoon], 'Monsoon'),
    ...checkForAlerts([currentYearData.winter], 'Winter')
  ];

  // Set the most critical alert
  useEffect(() => {
    if (alerts.length > 0) {
      const criticalAlert = alerts.find(alert => alert.severity === 'critical') || alerts[0];
      setActiveAlert(criticalAlert);
    } else {
      setActiveAlert(null);
    }
  }, [seed]); // Re-run when seed changes

  return (
    <div className="space-y-6">
      {/* Year Range Slider */}
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium">Year Range: {formatYearRange()}</h3>
          <span className="text-sm text-muted-foreground">
            {yearRange[1] - yearRange[0] + 1} years selected
          </span>
        </div>
        <div className="px-2">
          <Slider
            min={0}
            max={19}
            step={1}
            value={[yearRange[0], yearRange[1]]}
            onValueChange={(value) => setYearRange([value[0], value[1]])}
            minStepsBetweenThumbs={1}
            className="py-4"
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{allYears[0]}</span>
          <span>{allYears[allYears.length - 1]}</span>
        </div>
      </div>

      {activeAlert && (
        <div className="animate-fade-in">
          <AlertBanner
            variant={activeAlert.severity === 'critical' ? 'destructive' : 'warning'}
            title={
              activeAlert.severity === 'critical'
                ? '🚨 Critical Water Level Alert! 🚨'
                : '⚠️ Low Water Level Alert'
            }
            description={`${activeAlert.season} ${activeAlert.year} water level is critically low (${activeAlert.value}m). ` + 
              `This is below the ${activeAlert.severity === 'critical' ? 'critical' : 'recommended'} threshold of ${activeAlert.severity === 'critical' ? CRITICAL_THRESHOLD : ALERT_THRESHOLD}m. ` +
              `${getRandomPrecaution()}.`}
            actions={
              <div className="mt-2 flex items-center space-x-2">
                <Button 
                  size="sm" 
                  variant={activeAlert.severity === 'critical' ? 'destructive' : 'outline'}
                  onClick={() => setShowPrecautions(!showPrecautions)}
                  className="flex items-center gap-1"
                >
                  <AlertCircle className="h-4 w-4" />
                  {showPrecautions ? 'Hide Precautions' : 'Show Precautions'}
                </Button>
              </div>
            }
          />
          
          {showPrecautions && (
            <div className="mt-4 rounded-lg border bg-background p-4">
              <h4 className="mb-3 font-medium">💧 Water Conservation Tips:</h4>
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
      
      {/* Full-width Annual Water Level Chart */}
      <SectionCard title={`Annual Water Level (${formatYearRange()})`}>
        <div className="h-80 w-full">
          <Chart 
            data={waterLevel}
            color="hsl(var(--chart-1))"
            yTicks={[0, 1000, 2000, 3000, 4000, 5000]}
            yDomain={[0, 5000]}
            yTickFormatter={(v: number) => `${v} m`}
          />
        </div>
      </SectionCard>

      {/* Seasonal Charts */}
      <div className="grid gap-6 md:grid-cols-3">
        <SectionCard title="Summer (Mar-Jun)">
          <Chart 
            data={summer} 
            color="#3b82f6" 
            yTicks={[0, 1000, 2000, 3000, 4000, 5000]} 
            yDomain={[0, 5000]} 
            yTickFormatter={(v: number) => `${v} m`} 
          />
        </SectionCard>
        <SectionCard title="Monsoon (Jul-Oct)">
          <Chart 
            data={monsoon} 
            color="#10b981" 
            yTicks={[0, 1000, 2000, 3000, 4000, 5000]} 
            yDomain={[0, 5000]} 
            yTickFormatter={(v: number) => `${v} m`} 
          />
        </SectionCard>
        <SectionCard title="Winter (Nov-Feb)">
          <Chart 
            data={winter} 
            color="#6366f1" 
            yTicks={[0, 1000, 2000, 3000, 4000, 5000]} 
            yDomain={[0, 5000]} 
            yTickFormatter={(v: number) => `${v} m`} 
          />
        </SectionCard>
      </div>
    </div>
  );
}
