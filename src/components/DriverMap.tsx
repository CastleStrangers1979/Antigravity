'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Truck, RefreshCw, Play, Pause } from 'lucide-react';

// Netherlands center coordinates
const NETHERLANDS_CENTER = { lat: 52.1326, lng: 5.2913 };

// Dutch cities for delivery lines
const CITY_LOCATIONS: Record<string, { lat: number; lng: number }> = {
  'Rotterdam': { lat: 51.9225, lng: 4.47917 },
  'The Hague': { lat: 52.0705, lng: 4.3007 },
  'Alkmaar': { lat: 52.6324, lng: 4.7534 },
  'Amsterdam': { lat: 52.3676, lng: 4.9041 },
  'Utrecht-Eindhoven': { lat: 52.0907, lng: 5.1214 },
  'Zwolle': { lat: 52.5168, lng: 6.0830 },
  'Enschede': { lat: 52.2215, lng: 6.8937 },
  'Arnhem': { lat: 51.9851, lng: 5.8987 },
  'West Germany': { lat: 51.9607, lng: 7.6261 },
};

interface DriverLocation {
  id: string;
  name: string;
  lineName: string;
  lat: number;
  lng: number;
  color: string;
}

interface DriverMapProps {
  drivers: Array<{
    id: string;
    name: string;
    deliveryLine?: { region: string; nameAr: string } | null;
  }>;
  language?: string;
}

// Generate random color for each driver
const getDriverColor = (index: number): string => {
  const colors = [
    '#D4A853', '#2D5A3D', '#E74C3C', '#3498DB', '#9B59B6',
    '#1ABC9C', '#F39C12', '#E91E63', '#00BCD4'
  ];
  return colors[index % colors.length];
};

export default function DriverMap({ drivers, language = 'ar' }: DriverMapProps) {
  const [driverLocations, setDriverLocations] = useState<DriverLocation[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize driver locations
  const initializedLocations = useRef<DriverLocation[]>([]);

  useEffect(() => {
    const locations = drivers.map((driver, index) => {
      const region = driver.deliveryLine?.region || 'Amsterdam';
      const cityLoc = CITY_LOCATIONS[region] || CITY_LOCATIONS['Amsterdam'];
      return {
        id: driver.id,
        name: driver.name,
        lineName: driver.deliveryLine?.nameAr || region,
        lat: cityLoc.lat + (Math.random() - 0.5) * 0.1,
        lng: cityLoc.lng + (Math.random() - 0.5) * 0.1,
        color: getDriverColor(index),
      };
    });
    // Only update if locations have changed
    if (JSON.stringify(initializedLocations.current) !== JSON.stringify(locations)) {
      initializedLocations.current = locations;
    }
    // Use functional update to avoid calling setState directly in effect
    setDriverLocations(() => initializedLocations.current);
  }, [drivers]);

  // Simulate driver movement
  const startSimulation = () => {
    setIsSimulating(true);
    intervalRef.current = setInterval(() => {
      setDriverLocations(prev => prev.map(loc => ({
        ...loc,
        lat: loc.lat + (Math.random() - 0.5) * 0.005,
        lng: loc.lng + (Math.random() - 0.5) * 0.005,
      })));
    }, 2000);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Simple map visualization using CSS
  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-[#2D5A3D] to-[#D4A853]" />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-[#3D3229] flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#2D5A3D]" />
            {language === 'ar' ? 'تتبع السائقين' : 'Driver Tracking'}
          </CardTitle>
          <Button
            size="sm"
            onClick={isSimulating ? stopSimulation : startSimulation}
            className={isSimulating ? 'bg-red-500 hover:bg-red-600' : 'green-gradient'}
          >
            {isSimulating ? (
              <>
                <Pause className="h-4 w-4 mr-1" />
                {language === 'ar' ? 'إيقاف' : 'Stop'}
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />
                {language === 'ar' ? 'محاكاة' : 'Simulate'}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Map Container - Simplified Visual Map */}
        <div 
          ref={mapRef}
          className="relative w-full h-[400px] rounded-xl overflow-hidden bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] border-2 border-[#A5D6A7]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(165, 214, 167, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(165, 214, 167, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        >
          {/* Netherlands outline shape (simplified) */}
          <svg 
            viewBox="0 0 200 250" 
            className="absolute inset-0 w-full h-full opacity-20"
            preserveAspectRatio="xMidYMid meet"
          >
            <path 
              d="M100,10 L150,30 L180,80 L170,150 L140,200 L100,240 L60,200 L30,150 L20,80 L50,30 Z"
              fill="#2D5A3D"
              stroke="#1B4332"
              strokeWidth="2"
            />
          </svg>

          {/* City markers */}
          {Object.entries(CITY_LOCATIONS).map(([city, coords]) => {
            // Convert coordinates to position (simplified projection for Netherlands)
            const x = ((coords.lng - 3.3) / 5) * 100;
            const y = ((53.5 - coords.lat) / 2.5) * 100;
            return (
              <div
                key={city}
                className="absolute w-3 h-3 bg-[#2D5A3D] rounded-full opacity-40"
                style={{ left: `${x}%`, top: `${y}%` }}
                title={city}
              />
            );
          })}

          {/* Driver markers */}
          {driverLocations.map((driver) => {
            // Convert coordinates to position
            const x = ((driver.lng - 3.3) / 5) * 100;
            const y = ((53.5 - driver.lat) / 2.5) * 100;
            const isSelected = selectedDriver === driver.id;
            
            return (
              <div
                key={driver.id}
                className={`absolute cursor-pointer transition-all duration-500 ${isSelected ? 'z-20 scale-125' : 'z-10'}`}
                style={{ left: `${Math.max(5, Math.min(95, x))}%`, top: `${Math.max(5, Math.min(95, y))}%` }}
                onClick={() => setSelectedDriver(isSelected ? null : driver.id)}
              >
                {/* Pulse animation for active drivers */}
                <div 
                  className={`absolute -inset-2 rounded-full opacity-30 ${isSimulating ? 'animate-ping' : ''}`}
                  style={{ backgroundColor: driver.color }}
                />
                <div 
                  className="relative w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                  style={{ backgroundColor: driver.color }}
                >
                  <Truck className="w-4 h-4 text-white" />
                </div>
                {isSelected && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl p-3 min-w-[150px] z-30">
                    <div className="font-bold text-[#3D3229]">{driver.name}</div>
                    <div className="text-sm text-[#7A6F63]">{driver.lineName}</div>
                    <div className="text-xs text-[#2D5A3D] mt-1 flex items-center gap-1">
                      <Navigation className="w-3 h-3" />
                      {driver.lat.toFixed(4)}, {driver.lng.toFixed(4)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Legend */}
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-md">
            <div className="text-xs font-medium text-[#3D3229] mb-1">
              {language === 'ar' ? 'السائقين النشطين' : 'Active Drivers'}
            </div>
            <div className="flex flex-wrap gap-1">
              {driverLocations.slice(0, 4).map(d => (
                <Badge key={d.id} className="text-xs" style={{ backgroundColor: d.color }}>
                  {d.name.split(' ')[0]}
                </Badge>
              ))}
              {driverLocations.length > 4 && (
                <Badge className="text-xs bg-gray-400">
                  +{driverLocations.length - 4}
                </Badge>
              )}
            </div>
          </div>

          {/* Simulation indicator */}
          {isSimulating && (
            <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-ping" />
              {language === 'ar' ? 'محاكاة نشطة' : 'Live Simulation'}
            </div>
          )}
        </div>

        {/* Driver List */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {driverLocations.map(driver => (
            <div
              key={driver.id}
              className={`p-2 rounded-lg cursor-pointer transition-all ${selectedDriver === driver.id ? 'bg-[#F5EDE0] ring-2 ring-[#D4A853]' : 'bg-gray-50 hover:bg-gray-100'}`}
              onClick={() => setSelectedDriver(selectedDriver === driver.id ? null : driver.id)}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: driver.color }}
                />
                <span className="text-sm font-medium text-[#3D3229] truncate">{driver.name}</span>
              </div>
              <div className="text-xs text-[#7A6F63] mt-1 truncate">{driver.lineName}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
