import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function MapController({ hotspots, selectedArea }) {
  const map = useMap();

  useEffect(() => {
    // Handle bounds when hotspots change
    if (hotspots.length > 0) {
      const bounds = L.latLngBounds(hotspots.map(h => [h.lat, h.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    } else {
      // If no markers, center on South Chennai
      map.setView([12.97, 80.23], 11);
    }


    // Handle container resize (for tabs and hidden views)
    const resizeObserver = new ResizeObserver(() => {
      if (map) {
        requestAnimationFrame(() => {
          map.invalidateSize();
        });
      }
    });
    
    // Also trigger immediately after mount
    setTimeout(() => {
      if (map) map.invalidateSize();
    }, 100);

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

export default function ThreatMap({ hotspots = [], selectedArea = 'All', onSelect = () => {}, mode = 'citizen', height = '100%' }) {
  
  const filteredHotspots = selectedArea === 'All' || selectedArea === 'All South Chennai'
    ? hotspots 
    : hotspots.filter(h => h.name === selectedArea);

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: mode === 'citizen' ? '0.5rem' : '0', overflow: 'hidden' }}>
      <MapContainer
        center={[13.0, 80.2]} 
        zoom={11}
        zoomControl={mode === 'analyst'}
        scrollWheelZoom={mode === 'analyst'}
        style={{ height: '100%', width: '100%', background: '#F6F8FC', zIndex: 0 }}
        attributionControl={false}
      >
        <TileLayer 
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" 
        />
        <MapController hotspots={filteredHotspots} selectedArea={selectedArea} />

        {filteredHotspots.map(spot => {
          // Heat effect without a new library (scaling halo based on count)
          // Baseline sizes
          let size = 20;
          let color = '#3B82F6'; // low
          let shadowColor = 'rgba(59, 130, 246, 0.4)';
          let pulseClass = 'pulse-ring-low';

          if (spot.risk === 'high') {
            size = 40;
            color = '#DC2626';
            shadowColor = 'rgba(220, 38, 38, 0.4)';
            pulseClass = 'pulse-ring-high';
          } else if (spot.risk === 'medium') {
            size = 30;
            color = '#EA580C';
            shadowColor = 'rgba(234, 88, 12, 0.4)';
            pulseClass = 'pulse-ring-medium';
          }

          // If analyst mode, scale the halo based on report count
          let haloSize = size + 12; // default
          if (mode === 'analyst') {
             haloSize = Math.min(100, 30 + (spot.reports * 2)); // scales with reports, max 100px
          }
          const haloOffset = (haloSize - size) / 2;

          const iconHtml = `
            <div style="position: relative; width: ${haloSize}px; height: ${haloSize}px;">
              <!-- Scaling halo -->
              <div style="
                position: absolute;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: radial-gradient(circle, ${shadowColor} 0%, rgba(255,255,255,0) 70%);
                border-radius: 50%;
                pointer-events: none;
                mix-blend-mode: multiply;
              "></div>
              
              <!-- Core Marker -->
              <div style="
                position: absolute;
                top: ${haloOffset}px;
                left: ${haloOffset}px;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 0 0 2px white;
              ">
                ${spot.reports > 0 ? `
                  <span style="color: white; font-size: ${size > 30 ? '0.75rem' : '0.625rem'}; font-weight: 700; font-family: var(--font-head); z-index: 2">
                    ${spot.reports}
                  </span>
                ` : `<div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>`}
                
                <div style="
                  position: absolute;
                  inset: -2px;
                  border-radius: 50%;
                  animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
                  border: 2px solid ${color};
                "></div>
              </div>
            </div>
            
            <style>
              @keyframes pulse-ring {
                0% { transform: scale(1); opacity: 0.8; }
                100% { transform: scale(2.5); opacity: 0; }
              }
            </style>
          `;

          const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-leaflet-marker',
            iconSize: [haloSize, haloSize],
            iconAnchor: [haloSize / 2, haloSize / 2],
          });

          return (
            <Marker 
              key={spot.name} 
              position={[spot.lat, spot.lng]} 
              icon={customIcon}
              eventHandlers={{ click: () => onSelect(spot) }}
            >
              {mode === 'citizen' ? (
                <Tooltip direction="top" offset={[0, -size/2]} opacity={1} permanent={false} className="custom-tooltip">
                  <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700 }}>
                    <div style={{ fontSize: '0.875rem', color: '#0f172a' }}>{spot.name}</div>
                    <div style={{ fontSize: '0.75rem', color: color }}>
                      {spot.reports} active {spot.reports === 1 ? 'report' : 'reports'}
                    </div>
                  </div>
                </Tooltip>
              ) : (
                <Popup className="analyst-popup">
                  <div style={{ fontFamily: 'var(--font-body)', minWidth: '150px' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#0F1B4C', fontFamily: 'var(--font-head)' }}>{spot.name}</h4>
                    <p style={{ margin: '2px 0', fontSize: '0.85rem' }}><strong>Reports:</strong> {spot.reports}</p>
                    <p style={{ margin: '2px 0', fontSize: '0.85rem' }}><strong>Top Threat:</strong> {spot.dominantType}</p>
                    {spot.latestTime && <p style={{ margin: '2px 0', fontSize: '0.75rem', color: '#64748B' }}>Last seen: {new Date(spot.latestTime).toLocaleTimeString()}</p>}
                    <button 
                      onClick={(e) => { e.stopPropagation(); onSelect({ type: 'campaign_from_map', location: spot.name }); }}
                      style={{ marginTop: '8px', padding: '4px 8px', width: '100%', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                      View Campaign
                    </button>
                  </div>
                </Popup>
              )}
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      {mode === 'citizen' && (
        <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', background: 'white', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 1000 }}>
           <div style={{ width: '120px', height: '8px', background: 'linear-gradient(to right, #3B82F6, #F59E0B, #EF4444)', borderRadius: '4px', marginBottom: '0.25rem' }}></div>
           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#64748B', fontWeight: '600' }}>
             <span>Low Reports</span>
             <span>High Reports</span>
           </div>
        </div>
      )}
      
      {mode === 'analyst' && (
        <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', background: 'white', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 1000 }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#DC2626' }}></div>
              <span style={{ fontSize: '0.75rem', color: '#0F1B4C', fontWeight: '600' }}>High (10+)</span>
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EA580C' }}></div>
              <span style={{ fontSize: '0.75rem', color: '#0F1B4C', fontWeight: '600' }}>Medium (5-9)</span>
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#3B82F6' }}></div>
              <span style={{ fontSize: '0.75rem', color: '#0F1B4C', fontWeight: '600' }}>Low (&lt;5)</span>
           </div>
        </div>
      )}

      <style>{`
        .leaflet-tooltip.custom-tooltip {
          background: white; border: 1px solid #E2E8F0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-radius: 0.5rem; padding: 0.5rem 0.75rem;
        }
        .leaflet-tooltip-top.custom-tooltip::before { border-top-color: #E2E8F0; }
        .leaflet-tooltip-top.custom-tooltip::after { content: ''; position: absolute; border: 5px solid transparent; bottom: -4px; left: 50%; margin-left: -5px; border-top-color: white; }
        
        .analyst-popup .leaflet-popup-content-wrapper {
           border-radius: 8px;
           box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}
