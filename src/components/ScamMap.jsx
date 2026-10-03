// src/components/ScamMap.jsx
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const hotspots = [
  { id: 'h1', name: 'Velachery', reports: 14, lat: 12.9815, lng: 80.2180, risk: 'high', labelDir: 'top' },
  { id: 'h2', name: 'Sholinganallur', reports: 3, lat: 12.9010, lng: 80.2279, risk: 'high', labelDir: 'right' },
  { id: 'h3', name: 'Adyar', reports: 3, lat: 13.0012, lng: 80.2565, risk: 'medium', labelDir: 'bottom' },
  { id: 'h4', name: 'Perungudi', reports: 0, lat: 12.9654, lng: 80.2461, risk: 'medium' },
  { id: 'h5', name: 'Medavakkam', reports: 0, lat: 12.9231, lng: 80.1925, risk: 'medium' },
  { id: 'h6', name: 'Tharamani', reports: 0, lat: 12.9850, lng: 80.2425, risk: 'low' }
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
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '0.5rem', overflow: 'hidden' }}>
      <MapContainer
        center={[12.95, 80.22]} // fallback center
        zoom={12}
        zoomControl={false}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', background: '#F6F8FC' }}
        attributionControl={true}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        />
        
        {hotspots.map((spot) => {
          let size = 30;
          let color = '#EA580C'; // medium / orange
          if (spot.risk === 'high') { size = 40; color = '#DC2626'; }
          if (spot.risk === 'low') { size = 30; color = '#CA8A04'; } // yellow

          // Custom HTML icon
          const htmlIcon = L.divIcon({
            html: `
              <div style="position: relative; width: ${size}px; height: ${size}px;">
                <div style="position: absolute; top: 50%; left: 50%; width: 10px; height: 10px; border-radius: 50%; background: ${color}; transform: translate(-50%,-50%); z-index: 2;"></div>
                <div style="position: absolute; top: 50%; left: 50%; width: ${size}px; height: ${size}px; border-radius: 50%; background: ${color}; opacity: 0.2; transform: translate(-50%,-50%); z-index: 1;"></div>
              </div>
            `,
            className: '',
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
            tooltipAnchor: [spot.labelDir === 'right' ? size / 2 : (spot.labelDir === 'left' ? -size / 2 : 0), spot.labelDir === 'bottom' ? size / 2 : (spot.labelDir === 'top' ? -size / 2 : 0)]
          });

          return (
            <Marker key={spot.id} position={[spot.lat, spot.lng]} icon={htmlIcon}>
              {spot.reports > 0 && (
                <Tooltip 
                  direction={spot.labelDir || 'right'} 
                  permanent 
                  className="custom-leaflet-tooltip"
                  offset={[
                    spot.labelDir === 'right' ? 5 : (spot.labelDir === 'left' ? -5 : 0),
                    spot.labelDir === 'bottom' ? 5 : (spot.labelDir === 'top' ? -5 : 0)
                  ]}
                >
                  <div style={{ padding: '0.125rem 0.25rem', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-head)', fontWeight: '700', fontSize: '0.75rem', color: '#0f172a' }}>
                      {spot.name}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.625rem', color: '#DC2626', marginTop: '0.0625rem', fontWeight: '700' }}>
                      {spot.reports} reports
                    </div>
                  </div>
                </Tooltip>
              )}
            </Marker>
          );
        })}

        <MapController hotspots={hotspots} />
      </MapContainer>

      {/* ── Custom CSS for Tooltips ── */}
      <style>{`
        .custom-leaflet-tooltip {
          background-color: rgba(255, 255, 255, 0.95);
          border: 1px solid #E6EAF2;
          box-shadow: 0 1px 3px rgba(16,24,40,0.05);
          border-radius: 0.375rem;
          padding: 0;
          opacity: 1 !important;
        }
        .custom-leaflet-tooltip::before {
          display: none; /* Hide default leaflet tooltip arrow */
        }
      `}</style>

      {/* ── Overlays ── */}
      <button
        style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          zIndex: 400,
          background: '#fff',
          padding: '0.375rem 0.75rem',
          borderRadius: '1.25rem',
          border: '1px solid #E6EAF2',
          boxShadow: '0 1px 3px rgba(16,24,40,0.05)',
          fontFamily: 'var(--font-head)',
          fontWeight: '600',
          fontSize: '0.6875rem',
          color: '#1e293b',
          cursor: 'pointer',
        }}
      >
        View all threats →
      </button>

      <div
        style={{
          position: 'absolute',
          bottom: '0.5rem',
          left: '0.5rem',
          zIndex: 400,
          background: '#fff',
          padding: '0.375rem 0.75rem',
          borderRadius: '1.25rem',
          display: 'flex',
          gap: '0.75rem',
          border: '1px solid #E6EAF2',
          boxShadow: '0 1px 3px rgba(16,24,40,0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ width: '0.375rem', height: '0.375rem', borderRadius: '50%', background: '#DC2626' }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#475569', fontWeight: '500' }}>High activity</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ width: '0.375rem', height: '0.375rem', borderRadius: '50%', background: '#EA580C' }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#475569', fontWeight: '500' }}>Medium activity</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ width: '0.375rem', height: '0.375rem', borderRadius: '50%', background: '#CA8A04' }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#475569', fontWeight: '500' }}>Low activity</span>
        </div>
      </div>
    </div>
  );
}
