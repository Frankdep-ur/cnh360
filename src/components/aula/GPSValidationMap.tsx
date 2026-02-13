import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { MapPin, Navigation, AlertCircle } from "lucide-react";
import { AuditoriaEvento } from "@/hooks/useAulaAuditoria";
import { useMapboxToken } from "@/hooks/useMapboxToken";

interface GPSValidationMapProps {
  eventos: AuditoriaEvento[];
  pontoEncontro?: { lat: number; lng: number } | null;
  className?: string;
}

interface GPSPoint {
  lat: number;
  lng: number;
  label: string;
  color: string;
}

export function GPSValidationMap({ eventos, pontoEncontro, className }: GPSValidationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const { token, loading: tokenLoading } = useMapboxToken();
  const [mapLoaded, setMapLoaded] = useState(false);

  // Extract GPS points from audit events
  const gpsPoints: GPSPoint[] = eventos
    .filter((e) => e.latitude !== null && e.longitude !== null)
    .map((e) => {
      let color = "#6B7280"; // gray
      let label = e.evento;

      switch (e.evento) {
        case "em_rota":
          color = "#3B82F6"; // blue
          label = "Início da rota";
          break;
        case "cheguei":
          color = "#F59E0B"; // amber
          label = "Chegada";
          break;
        case "confirmacao_aluno":
          color = "#10B981"; // green
          label = "Confirmação";
          break;
        case "inicio":
          color = "#00C853"; // primary
          label = "Início da aula";
          break;
        case "fim":
          color = "#8B5CF6"; // violet
          label = "Fim da aula";
          break;
        case "qr_validado":
          color = "#059669"; // emerald
          label = "QR Validado";
          break;
      }

      return {
        lat: e.latitude!,
        lng: e.longitude!,
        label,
        color,
      };
    });

  // Add meeting point if available
  if (pontoEncontro) {
    gpsPoints.unshift({
      lat: pontoEncontro.lat,
      lng: pontoEncontro.lng,
      label: "Ponto de encontro agendado",
      color: "#EF4444", // red
    });
  }

  useEffect(() => {
    if (!token || !mapContainer.current || gpsPoints.length === 0) return;

    const initMap = async () => {
      const mapboxgl = await import("mapbox-gl");
      await import("mapbox-gl/dist/mapbox-gl.css");

      mapboxgl.default.accessToken = token;

      // Calculate bounds
      const lats = gpsPoints.map((p) => p.lat);
      const lngs = gpsPoints.map((p) => p.lng);
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

      const map = new mapboxgl.default.Map({
        container: mapContainer.current!,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [centerLng, centerLat],
        zoom: 14,
        interactive: true,
      });

      map.on("load", () => {
        // Add markers for each GPS point
        gpsPoints.forEach((point, index) => {
          // Create custom marker element
          const el = document.createElement("div");
          el.className = "gps-marker";
          el.style.cssText = `
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: ${point.color};
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
          `;
          el.textContent = String(index + 1);

          // Add popup with safe DOM construction
          const popupContent = document.createElement('div');
          popupContent.style.padding = '8px';
          const strong = document.createElement('strong');
          strong.textContent = point.label;
          popupContent.appendChild(strong);
          popupContent.appendChild(document.createElement('br'));
          const small = document.createElement('small');
          small.style.color = '#666';
          small.textContent = `${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}`;
          popupContent.appendChild(small);

          const popup = new mapboxgl.default.Popup({ offset: 25 }).setDOMContent(popupContent);

          new mapboxgl.default.Marker(el)
            .setLngLat([point.lng, point.lat])
            .setPopup(popup)
            .addTo(map);
        });

        // Draw line connecting points if more than 1
        if (gpsPoints.length > 1) {
          map.addSource("route", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: gpsPoints.map((p) => [p.lng, p.lat]),
              },
            },
          });

          map.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#00C853",
              "line-width": 3,
              "line-dasharray": [2, 2],
            },
          });
        }

        // Fit bounds to show all points
        if (gpsPoints.length > 1) {
          const bounds = new mapboxgl.default.LngLatBounds();
          gpsPoints.forEach((p) => bounds.extend([p.lng, p.lat]));
          map.fitBounds(bounds, { padding: 50 });
        }

        setMapLoaded(true);
      });

      mapRef.current = map;
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [token, gpsPoints.length]);

  if (gpsPoints.length === 0) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Nenhum dado GPS registrado para esta aula
        </p>
      </Card>
    );
  }

  if (tokenLoading) {
    return (
      <Card className={`h-64 flex items-center justify-center ${className}`}>
        <div className="animate-pulse flex items-center gap-2 text-muted-foreground">
          <Navigation className="w-5 h-5" />
          <span>Carregando mapa...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-3">
        {pontoEncontro && (
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Ponto agendado</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-muted-foreground">Chegada real</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-muted-foreground">Durante aula</span>
        </div>
      </div>

      {/* Map container */}
      <div
        ref={mapContainer}
        className="h-64 rounded-xl overflow-hidden border border-border"
      />
    </div>
  );
}
