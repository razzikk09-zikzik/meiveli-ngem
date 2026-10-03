import React, { useRef, useEffect, useState, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

export default function NetworkGraph({ reports = [], selectedCampaign = null, onSelect = () => {}, width, height }) {
  const fgRef = useRef();
  
  // Transform reports into nodes and links
  const { nodes, links } = useMemo(() => {
    const nodeMap = new Map();
    const linksArr = [];
    
    reports.forEach(r => {
      // Create a node for the report itself
      const reportId = `report-${r.id}`;
      if (!nodeMap.has(reportId)) {
        nodeMap.set(reportId, {
          id: reportId,
          group: r.classification === 'Scam' ? 1 : 2,
          val: 2,
          name: `Report ${r.id.slice(0, 4)}`,
          type: 'report',
          campaign: r.classification === 'Scam' ? 'campaign-alpha' : 'campaign-beta' // Mock campaign clustering
        });
      }

      // Create a node for the indicator (URL/Phone/UPI)
      if (r.content) {
        const indId = `ind-${r.content}`;
        if (!nodeMap.has(indId)) {
          let indType = r.type === 'web' ? 'domain' : 'phone';
          nodeMap.set(indId, {
            id: indId,
            group: 3,
            val: 4,
            name: r.content,
            type: indType,
            campaign: r.classification === 'Scam' ? 'campaign-alpha' : 'campaign-beta'
          });
        }
        linksArr.push({ source: reportId, target: indId });
      }
    });

    return { nodes: Array.from(nodeMap.values()), links: linksArr };
  }, [reports]);

  // Center on select
  useEffect(() => {
    if (selectedCampaign && fgRef.current) {
       // Mock zooming to campaign nodes
       // fgRef.current.zoom(2, 1000);
    }
  }, [selectedCampaign]);

  if (!nodes.length) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8' }}>No network data available</div>;
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ForceGraph2D
        ref={fgRef}
        width={width || 600} // Force graph needs explicit dims or auto size wrapper
        height={height || 400}
        graphData={{ nodes, links }}
        nodeColor={node => {
          if (selectedCampaign && node.campaign !== selectedCampaign && selectedCampaign !== 'All') return '#E2E8F0';
          if (node.type === 'domain') return '#8B5CF6'; // purple for domains
          if (node.type === 'phone') return '#F59E0B'; // orange for phones
          if (node.group === 1) return '#EF4444'; // red for scam report
          return '#3B82F6'; // blue for susp report
        }}
        nodeRelSize={4}
        linkColor={() => '#CBD5E1'}
        onNodeClick={node => {
          onSelect({ type: 'campaign_from_network', campaign: node.campaign, node });
        }}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px var(--font-body)`;
          
          const size = node.val;
          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
          
          let color = '#3B82F6';
          if (selectedCampaign && node.campaign !== selectedCampaign && selectedCampaign !== 'All') color = '#E2E8F0';
          else if (node.type === 'domain') color = '#8B5CF6';
          else if (node.type === 'phone') color = '#F59E0B';
          else if (node.group === 1) color = '#EF4444';
          
          ctx.fillStyle = color;
          ctx.fill();
          
          // Draw masked label for indicators
          if (node.type !== 'report' && globalScale > 1.5) {
            let maskedLabel = label;
            if (node.type === 'phone' && label.length >= 10) maskedLabel = label.slice(0, 3) + '****' + label.slice(-3);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = selectedCampaign && node.campaign !== selectedCampaign ? '#94A3B8' : '#1E293B';
            ctx.fillText(maskedLabel, node.x, node.y + size + fontSize);
          }
        }}
      />
    </div>
  );
}
