import React from 'react';
import { Map, MapPin } from 'lucide-react';
import { Card } from '../common/Card';

interface LocationPanelProps {
  location: {
    address: string;
    lat: number;
    lng: number;
  };
}

export const LocationPanel: React.FC<LocationPanelProps> = ({ location }) => {
  // Use OpenStreetMap's static map service to generate a real map image
  // It's centered on the coordinates, with a zoom level of 13, and a marker.
  const mapImageUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${location.lat},${location.lng}&zoom=13&size=400x200&maptype=mapnik&markers=${location.lat},${location.lng},lightblue1`;

  return (
    <Card title="Location Insights" icon={<Map className="h-6 w-6" />}>
      <div className="space-y-4">
        <div>
            <div className="flex items-center space-x-2 text-slate-200">
                <MapPin className="h-5 w-5 text-cyan-400" />
                <p className="font-semibold">{location.address}</p>
            </div>
            <p className="text-sm text-slate-400 ml-7">
                Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
            </p>
        </div>
        <div className="rounded-lg overflow-hidden border border-slate-700">
          <img 
            src={mapImageUrl} 
            alt={`Map of ${location.address}`} 
            className="w-full h-auto object-cover filter grayscale brightness-75"
          />
        </div>
         <p className="text-xs text-center text-slate-500">
            Map view is for representational purposes only.
         </p>
      </div>
    </Card>
  );
};