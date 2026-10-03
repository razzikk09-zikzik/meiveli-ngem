// src/components/ScamMap.jsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../utils/supabase';

// Predefined localities to distribute our reports across (since they lack lat/lng)
const CHENNAI_LOCATIONS = [
  { name: 'Velachery', lat: 12.9815, lng: 80.2180, labelDir: 'top' },
  { name: 'Sholinganallur', lat: 12.9010, lng: 80.2279, labelDir: 'right' },
  { name: 'Adyar', lat: 13.0012, lng: 80.2565, labelDir: 'bottom' },
  { name: 'Anna Nagar', lat: 13.0850, lng: 80.2101, labelDir: 'top' },
  { name: 'T Nagar', lat: 13.0418, lng: 80.2341, labelDir: 'left' }
];

// Helper to render map bounds and handle resize
function MapController({ hotspots }) {
  const map = useMap();

  useEffect(() => {
    if (hotspots.length === 0) return;
    
    // Fit bounds to all hotspots
    const bounds = L.latLngBounds(hotspots.map(h => [h.lat, h.lng]));
    map.fitBounds(bounds, { padding: [40, 40] });

    // Handle container resize
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    
    const container = map.getContainer();
    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      if (container) {
        resizeObserver.unobserve(container);
      }
      resizeObserver.disconnect();
    };
  }, [map, hotspots]);

  return null;
}

export default function ScamMap() {
  const [hotspots, setHotspots] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      // We can fail gracefully if supabase URL is not set
      if (!import.meta.env.VITE_SUPABASE_URL) return;

      const { data } = await supabase.from('reports').select('*').in('classification', ['Scam', 'Suspicious']);
      if (!data) return;
      
      // Distribute real reports into our mock locations to simulate the heatmap
      const locCounts = CHENNAI_LOCATIONS.map(l => ({ ...l, reports: 0, id: l.name }));
      
      data.forEach((r, i) => {
        // Just use index to assign a location consistently
        const idx = i % CHENNAI_LOCATIONS.length;
        locCounts[idx].reports += 1;
      });
      
      const finalHotspots = locCounts
        .filter(h => h.reports > 0)
        .map(h => ({
          ...h,
          risk: h.reports > 5 ? 'high' : h.reports > 2 ? 'medium' : 'low'
        }));
        
      if (finalHotspots.length > 0) {
        setHotspots(finalHotspots);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '0.5rem', overflow: 'hidden' }}>
      <MapContainer
        center={[13.0, 80.2]} 
        zoom={11}
        zoomControl={false}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', background: '#F6F8FC' }}
        attributionControl={false}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController hotspots={hotspots} />

        {hotspots.map(spot => {
          let size = 20;
          let color = '#3B82F6';
          let shadow = 'rgba(59, 130, 246, 0.4)';
          let inner = '#EFF6FF';
          
          if (spot.risk === 'high') {
            size = 40;
            color = '#DC2626';
            shadow = 'rgba(220, 38, 38, 0.4)';
            inner = '#FEE2E2';
          } else if (spot.risk === 'medium') {
            size = 30;
            color = '#EA580C';
            shadow = 'rgba(234, 88, 12, 0.4)';
            inner = '#FFEDD5';
          }

          const iconHtml = `
            <div style="
              width: ${size}px;
              height: ${size}px;
              background: ${color};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 0 0 6px ${shadow};
              position: relative;
            ">
              ${spot.reports > 0 ? `
                <span style="color: white; font-size: ${size > 30 ? '0.75rem' : '0.625rem'}; font-weight: 700; font-family: var(--font-head); z-index: 2">
                  ${spot.reports}
                </span>
              ` : `
                <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
              `}
              
              <div style="
                position: absolute;
                inset: 0;
                border-radius: 50%;
                animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
                border: 2px solid ${color};
              "></div>
            </div>
            
            <style>
              @keyframes pulse-ring {
                0% { transform: scale(0.8); opacity: 0.8; }
                100% { transform: scale(2.5); opacity: 0; }
              }
            </style>
          `;

          const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-leaflet-marker',
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          });

          return (
            <Marker key={spot.id} position={[spot.lat, spot.lng]} icon={customIcon}>
              <Tooltip 
                direction={spot.labelDir || 'top'}
                offset={[0, -size/2]}
                opacity={1}
                permanent={false}
                className="custom-tooltip"
              >
                <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700 }}>
                  <div style={{ fontSize: '0.875rem', color: '#0f172a' }}>{spot.name}</div>
                  <div style={{ fontSize: '0.75rem', color: color }}>
                    {spot.reports} active {spot.reports === 1 ? 'report' : 'reports'}
                  </div>
                </div>
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Global overrides for leaflet tooltips */}
      <style>{`
        .leaflet-tooltip.custom-tooltip {
          background: white;
          border: 1px solid #E2E8F0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
        }
        .leaflet-tooltip-top.custom-tooltip::before { border-top-color: #E2E8F0; }
        .leaflet-tooltip-bottom.custom-tooltip::before { border-bottom-color: #E2E8F0; }
        .leaflet-tooltip-left.custom-tooltip::before { border-left-color: #E2E8F0; }
        .leaflet-tooltip-right.custom-tooltip::before { border-right-color: #E2E8F0; }
        
        /* Inner arrow to cover border */
        .leaflet-tooltip.custom-tooltip::after {
          content: '';
          position: absolute;
          border: 5px solid transparent;
        }
        .leaflet-tooltip-top.custom-tooltip::after {
          bottom: -4px; left: 50%; margin-left: -5px; border-top-color: white;
        }
        .leaflet-tooltip-bottom.custom-tooltip::after {
          top: -4px; left: 50%; margin-left: -5px; border-bottom-color: white;
        }
        .leaflet-tooltip-left.custom-tooltip::after {
          right: -4px; top: 50%; margin-top: -5px; border-left-color: white;
        }
        .leaflet-tooltip-right.custom-tooltip::after {
          left: -4px; top: 50%; margin-top: -5px; border-right-color: white;
        }
      `}</style>
    </div>
  );
}
