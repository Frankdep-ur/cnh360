import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import { Loader2 } from 'lucide-react';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface RealtimeMapProps {
  instructorLocation?: Coordinates | null;
  studentLocation?: Coordinates | null;
  destinationLocation?: Coordinates | null;
  showRoute?: boolean;
  className?: string;
  onRouteCalculated?: (distance: string, duration: string) => void;
}

export function RealtimeMap({
  instructorLocation,
  studentLocation,
  destinationLocation,
  showRoute = true,
  className = '',
  onRouteCalculated,
}: RealtimeMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const instructorMarker = useRef<mapboxgl.Marker | null>(null);
  const studentMarker = useRef<mapboxgl.Marker | null>(null);
  const destinationMarker = useRef<mapboxgl.Marker | null>(null);
  const routeLayerId = 'route';
  
  const { token, loading: tokenLoading, error: tokenError } = useMapboxToken();
  const [mapReady, setMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !token) return;

    mapboxgl.accessToken = token;

    // Default center (São Paulo)
    const defaultCenter: [number, number] = [-46.6333, -23.5505];
    
    // Calculate initial center based on available locations
    let center = defaultCenter;
    if (instructorLocation) {
      center = [instructorLocation.longitude, instructorLocation.latitude];
    } else if (studentLocation) {
      center = [studentLocation.longitude, studentLocation.latitude];
    } else if (destinationLocation) {
      center = [destinationLocation.longitude, destinationLocation.latitude];
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center,
      zoom: 14,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setMapReady(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
      setMapReady(false);
    };
  }, [token]);

  // Update instructor marker
  useEffect(() => {
    if (!map.current || !mapReady) return;

    if (instructorLocation) {
      const el = document.createElement('div');
      el.className = 'instructor-marker';
      const markerDiv = document.createElement('div');
      markerDiv.style.cssText = 'width:40px;height:40px;background:linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary)/0.8));border-radius:50%;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;';
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '20');
      svg.setAttribute('height', '20');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('fill', 'white');
      svg.setAttribute('stroke', 'white');
      svg.setAttribute('stroke-width', '2');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2');
      svg.appendChild(path);
      const c1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c1.setAttribute('cx', '7'); c1.setAttribute('cy', '17'); c1.setAttribute('r', '2');
      svg.appendChild(c1);
      const c2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c2.setAttribute('cx', '17'); c2.setAttribute('cy', '17'); c2.setAttribute('r', '2');
      svg.appendChild(c2);
      markerDiv.appendChild(svg);
      el.appendChild(markerDiv);

      if (instructorMarker.current) {
        instructorMarker.current.setLngLat([instructorLocation.longitude, instructorLocation.latitude]);
      } else {
        instructorMarker.current = new mapboxgl.Marker({ element: el })
          .setLngLat([instructorLocation.longitude, instructorLocation.latitude])
          .addTo(map.current);
      }

      // Center map on instructor with animation
      map.current.flyTo({
        center: [instructorLocation.longitude, instructorLocation.latitude],
        duration: 1000,
      });
    }
  }, [instructorLocation, mapReady]);

  // Update student marker
  useEffect(() => {
    if (!map.current || !mapReady) return;

    if (studentLocation) {
      const el = document.createElement('div');
      el.className = 'student-marker';
      const sDiv = document.createElement('div');
      sDiv.style.cssText = 'width:36px;height:36px;background:hsl(var(--accent));border-radius:50%;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;';
      const sSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      sSvg.setAttribute('width', '18');
      sSvg.setAttribute('height', '18');
      sSvg.setAttribute('viewBox', '0 0 24 24');
      sSvg.setAttribute('fill', 'white');
      sSvg.setAttribute('stroke', 'white');
      sSvg.setAttribute('stroke-width', '2');
      const sCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      sCircle.setAttribute('cx', '12'); sCircle.setAttribute('cy', '8'); sCircle.setAttribute('r', '5');
      sSvg.appendChild(sCircle);
      const sPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      sPath.setAttribute('d', 'M20 21a8 8 0 0 0-16 0');
      sSvg.appendChild(sPath);
      sDiv.appendChild(sSvg);
      el.appendChild(sDiv);

      if (studentMarker.current) {
        studentMarker.current.setLngLat([studentLocation.longitude, studentLocation.latitude]);
      } else {
        studentMarker.current = new mapboxgl.Marker({ element: el })
          .setLngLat([studentLocation.longitude, studentLocation.latitude])
          .addTo(map.current);
      }
    }
  }, [studentLocation, mapReady]);

  // Update destination marker
  useEffect(() => {
    if (!map.current || !mapReady) return;

    if (destinationLocation) {
      const el = document.createElement('div');
      el.className = 'destination-marker';
      const dDiv = document.createElement('div');
      dDiv.style.cssText = 'width:32px;height:32px;background:#ef4444;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;';
      const innerDot = document.createElement('div');
      innerDot.style.cssText = 'width:10px;height:10px;background:white;border-radius:50%;';
      dDiv.appendChild(innerDot);
      el.appendChild(dDiv);

      if (destinationMarker.current) {
        destinationMarker.current.setLngLat([destinationLocation.longitude, destinationLocation.latitude]);
      } else {
        destinationMarker.current = new mapboxgl.Marker({ element: el, offset: [0, -16] })
          .setLngLat([destinationLocation.longitude, destinationLocation.latitude])
          .addTo(map.current);
      }
    }
  }, [destinationLocation, mapReady]);

  // Draw route between instructor and destination
  useEffect(() => {
    if (!map.current || !mapReady || !showRoute || !token) return;
    if (!instructorLocation || !destinationLocation) return;

    const fetchRoute = async () => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${instructorLocation.longitude},${instructorLocation.latitude};${destinationLocation.longitude},${destinationLocation.latitude}?geometries=geojson&overview=full&access_token=${token}`
        );
        
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coordinates = route.geometry.coordinates;
          
          // Remove existing route layer
          if (map.current?.getLayer(routeLayerId)) {
            map.current.removeLayer(routeLayerId);
          }
          if (map.current?.getSource(routeLayerId)) {
            map.current.removeSource(routeLayerId);
          }

          // Add new route
          map.current?.addSource(routeLayerId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates,
              },
            },
          });

          map.current?.addLayer({
            id: routeLayerId,
            type: 'line',
            source: routeLayerId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': 'hsl(var(--primary))',
              'line-width': 5,
              'line-opacity': 0.8,
            },
          });

          // Calculate and notify distance/duration
          const distance = (route.distance / 1000).toFixed(1);
          const duration = Math.round(route.duration / 60);
          onRouteCalculated?.(`${distance} km`, `${duration} min`);

          // Fit bounds to show entire route
          const bounds = new mapboxgl.LngLatBounds();
          coordinates.forEach((coord: [number, number]) => bounds.extend(coord));
          map.current?.fitBounds(bounds, { padding: 50 });
        }
      } catch (err) {
        console.error('Error fetching route:', err);
      }
    };

    // Debounce route calculation
    const timeoutId = setTimeout(fetchRoute, 1000);
    return () => clearTimeout(timeoutId);
  }, [instructorLocation, destinationLocation, showRoute, mapReady, token, onRouteCalculated]);

  if (tokenLoading) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-xl ${className}`}>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-xl ${className}`}>
        <p className="text-muted-foreground text-sm">{tokenError}</p>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`}>
      <div ref={mapContainer} className="absolute inset-0" />
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
