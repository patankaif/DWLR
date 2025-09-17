import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Droplet, Thermometer, CloudRain, BarChart2, Calendar, MapPin } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function AnalysisPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get data from navigation state or redirect back if missing
  const { location: selectedLocation, data: waterData } = location.state || {};
  
  if (!selectedLocation || !waterData) {
    navigate('/location');
    return null;
  }

  // Prepare data for charts
  const forecastData = waterData.forecast.map(day => ({
    name: day.day,
    level: day.level,
    temperature: day.temperature,
    precipitation: day.precipitation,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Map
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Water Level Analysis</h1>
          <div className="mt-2 flex items-center text-muted-foreground">
            <MapPin className="mr-1 h-4 w-4" />
            <span>{selectedLocation.description}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplet className="h-5 w-5 text-blue-500" />
              <span>Current Water Level</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="text-sm font-medium text-blue-700">Current Level</p>
                  <p className="text-3xl font-bold text-blue-600">{waterData.currentLevel}m</p>
                  <p className="text-xs text-blue-500">Average: {waterData.averageLevel}m</p>
                </div>
                <div className="rounded-lg bg-amber-50 p-4">
                  <p className="text-sm font-medium text-amber-700">Status</p>
                  <p className="text-2xl font-bold text-amber-600 capitalize">{waterData.trend}ing</p>
                  <p className="text-xs text-amber-500">
                    {waterData.trend === 'up' ? 'Above average' : waterData.trend === 'down' ? 'Below average' : 'Stable'}
                  </p>
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-700">Last Updated</p>
                <p className="text-gray-600">{new Date(waterData.lastUpdated).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Forecast Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              <span>5-Day Forecast</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="level" 
                      name="Water Level (m)" 
                      stroke="#3b82f6" 
                      fill="#93c5fd" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-rose-600">Highest Level</p>
                  <p className="text-lg font-semibold">
                    {Math.max(...waterData.forecast.map(d => d.level))}m
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-600">Lowest Level</p>
                  <p className="text-lg font-semibold">
                    {Math.min(...waterData.forecast.map(d => d.level))}m
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Forecast */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-green-500" />
            <span>Detailed Forecast</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                <YAxis yAxisId="right" orientation="right" stroke="#ef4444" />
                <Tooltip />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="level" 
                  name="Water Level (m)" 
                  stroke="#3b82f6" 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="temperature" 
                  name="Temperature (°C)" 
                  stroke="#ef4444" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Precipitation Forecast */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <CloudRain className="h-4 w-4 text-blue-500" />
              <span>Precipitation Forecast</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {waterData.forecast.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{day.day}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 rounded-full bg-gray-200">
                      <div 
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${(day.precipitation / 30) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{day.precipitation}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Temperature Trends */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Thermometer className="h-4 w-4 text-red-500" />
              <span>Temperature Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="temperature" 
                    name="Temperature (°C)" 
                    stroke="#ef4444" 
                    fill="#fecaca" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
