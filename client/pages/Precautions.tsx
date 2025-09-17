import { AlertCircle, Droplets, Sun, CloudRain, Snowflake, MapPin } from "lucide-react";

const PRECAUTIONS = [
  "Fix leaky faucets and pipes immediately",
  "Install water-efficient fixtures and appliances",
  "Take shorter showers (5 minutes or less)",
  "Turn off the tap while brushing teeth or shaving",
  "Only run dishwashers and washing machines with full loads",
  "Water plants early in the morning or late in the evening",
  "Use a broom instead of a hose to clean driveways and sidewalks",
  "Collect rainwater for gardening and outdoor use",
  "Use a bucket instead of a running hose to wash your car",
  "Install a water-efficient irrigation system"
];

const SEASONAL_TIPS = {
  summer: [
    "Water plants in the early morning to reduce evaporation",
    "Use mulch in gardens to retain soil moisture",
    "Raise your lawn mower blade to keep grass longer and reduce water needs",
    "Check for leaks in outdoor faucets and hoses",
    "Use a pool cover to reduce evaporation"
  ],
  monsoon: [
    "Install rain barrels to collect rainwater",
    "Check for proper drainage to prevent waterlogging",
    "Clean gutters and downspouts regularly",
    "Avoid unnecessary watering during rainy periods",
    "Inspect your property for potential flood risks"
  ],
  winter: [
    "Insulate pipes to prevent freezing and bursting",
    "Drain and store hoses properly",
    "Check for leaks in indoor plumbing",
    "Set your water heater to 120°F (49°C) to save energy and water",
    "Use a timer for holiday light displays to save electricity"
  ]
};

const REGIONAL_TIPS = {
  urban: [
    "Report water leaks in public spaces to local authorities",
    "Participate in community water conservation programs",
    "Use car washes that recycle water",
    "Support local water conservation initiatives",
    "Educate others about water conservation"
  ],
  rural: [
    "Implement drip irrigation systems for crops",
    "Practice crop rotation to improve soil water retention",
    "Use drought-resistant crops in water-scarce areas",
    "Maintain proper drainage systems in agricultural fields",
    "Monitor soil moisture levels before irrigation"
  ]
};

export default function Precautions() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Water Conservation Tips</h1>
        <p className="text-muted-foreground">
          Essential water conservation measures and safety precautions for different seasons and regions.
        </p>
      </div>

      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Droplets className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-semibold">General Water Conservation Tips</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {PRECAUTIONS.map((tip, index) => (
            <div key={index} className="flex items-start gap-3 rounded-lg border p-4">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                {index + 1}
              </div>
              <p className="text-sm">{tip}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Seasonal Water Conservation</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {/* Summer Tips */}
          <div className="rounded-lg border p-6">
            <div className="mb-4 flex items-center gap-2">
              <Sun className="h-5 w-5 text-amber-500" />
              <h3 className="text-lg font-medium">Summer</h3>
            </div>
            <ul className="space-y-3">
              {SEASONAL_TIPS.summer.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Monsoon Tips */}
          <div className="rounded-lg border p-6">
            <div className="mb-4 flex items-center gap-2">
              <CloudRain className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-medium">Monsoon</h3>
            </div>
            <ul className="space-y-3">
              {SEASONAL_TIPS.monsoon.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Winter Tips */}
          <div className="rounded-lg border p-6">
            <div className="mb-4 flex items-center gap-2">
              <Snowflake className="h-5 w-5 text-cyan-500" />
              <h3 className="text-lg font-medium">Winter</h3>
            </div>
            <ul className="space-y-3">
              {SEASONAL_TIPS.winter.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <MapPin className="h-6 w-6 text-green-500" />
          <h2 className="text-2xl font-semibold">Regional Water Conservation</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Urban Tips */}
          <div className="rounded-lg border p-6">
            <h3 className="mb-4 text-lg font-medium">Urban Areas</h3>
            <ul className="space-y-3">
              {REGIONAL_TIPS.urban.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Rural Tips */}
          <div className="rounded-lg border p-6">
            <h3 className="mb-4 text-lg font-medium">Rural Areas</h3>
            <ul className="space-y-3">
              {REGIONAL_TIPS.rural.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-amber-900">Water Conservation Alert</h3>
            <p className="mt-1 text-sm text-amber-800">
              During critical water shortages, additional restrictions may apply. Please follow local water authority guidelines and restrictions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
