import React, { useState } from 'react';
import { formatINR, formatINRCompact } from '../utils/formatCurrency';

export default function SpendChart({ data, fiscalYear }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!data || data.length === 0) {
    return <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Loading chart data...</div>;
  }

  // Dimensions
  const width = 640;
  const height = 230;
  const padding = { top: 30, right: 30, bottom: 45, left: 50 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxY = 150000;
  const yTicks = [150000, 100000, 50000, 0];

  const getX = (index) => padding.left + (index / (data.length - 1)) * chartWidth;
  const getY = (amount) => padding.top + chartHeight - (amount / maxY) * chartHeight;

  // Build smooth cubic bezier SVG path
  const points = data.map((d, i) => ({ x: getX(i), y: getY(d.amount), ...d }));

  const generateSmoothPath = (pts) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i < pts.length - 2 ? pts[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;

      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const linePath = generateSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  return (
    <div style={{ position: 'relative', width: '100%', userSelect: 'none' }}>
      <div className="chart-meta-label">FISCAL YEAR: {fiscalYear}</div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
          </linearGradient>
        </defs>

        {/* Horizontal Grid lines and Y labels */}
        {yTicks.map((val) => {
          const y = getY(val);
          return (
            <g key={val}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#f1f5f9"
                strokeWidth="1"
                strokeDasharray={val === 0 ? "none" : "2,2"}
              />
              <text
                x={padding.left - 12}
                y={y + 4}
                textAnchor="end"
                fontSize="11"
                fill="#94a3b8"
                fontWeight="500"
              >
                {val === 0 ? '₹0' : formatINRCompact(val)}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill="url(#spendGradient)" />

        {/* Spline line */}
        <path
          d={linePath}
          fill="none"
          stroke="#10b981"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((pt, i) => (
          <g key={i}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoveredPoint?.month === pt.month ? 5.5 : 4}
              fill="#ffffff"
              stroke="#10b981"
              strokeWidth="2.2"
              style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
            {/* X Axis Month Label */}
            <text
              x={pt.x}
              y={height - padding.bottom + 22}
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              fill={hoveredPoint?.month === pt.month ? "#1e293b" : "#64748b"}
            >
              {pt.month}
            </text>
          </g>
        ))}

        {/* Hover Tooltip inside SVG */}
        {hoveredPoint && (
          <g transform={`translate(${hoveredPoint.x}, ${hoveredPoint.y - 14})`}>
            <rect
              x="-55"
              y="-30"
              width="110"
              height="26"
              rx="6"
              fill="#1e293b"
              filter="drop-shadow(0 2px 5px rgba(0,0,0,0.2))"
            />
            <polygon points="-4,-4 4,-4 0,0" fill="#1e293b" />
            <text
              x="0"
              y="-13"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="11"
              fontWeight="700"
            >
              {formatINR(hoveredPoint.amount)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
