import React from 'react';

/**
 * Pure SVG Attribute Radar Chart
 * Inspired by AttributeRadar.jsx in gpi-app(2).
 * Displays PAC, SHO, PAS, DRI, DEF, PHY with animated polygon.
 */
export default function SVGRadarChart({ attributes, size = 145, themeColor = '#10b981' }) {
  const keys = ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'];
  const values = keys.map((k) => attributes?.[k] ?? 70);

  const center = size / 2;
  const radius = (size / 2) - 24; // margin for labels

  // Compute (x, y) for an index and ratio (0 to 1)
  const getCoordinates = (index, ratio) => {
    // Top axis at -90 degrees
    const angle = (index * (360 / keys.length) - 90) * (Math.PI / 180);
    const r = radius * ratio;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Concentric levels (25%, 50%, 75%, 100%)
  const levels = [0.25, 0.5, 0.75, 1.0];
  const gridPolygons = levels.map((lvl) => {
    return keys
      .map((_, i) => {
        const { x, y } = getCoordinates(i, lvl);
        return `${x},${y}`;
      })
      .join(' ');
  });

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const isReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) {
      setMounted(true);
      return;
    }
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Data polygon points
  const dataPoints = keys.map((_, i) => {
    const val = Math.max(10, Math.min(99, values[i]));
    const targetRatio = val / 100;
    const ratio = mounted ? targetRatio : 0.12;
    return getCoordinates(i, ratio);
  });
  const dataPolygonString = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Background grid concentric polygons */}
        {gridPolygons.map((pts, idx) => (
          <polygon
            key={idx}
            points={pts}
            fill={idx === levels.length - 1 ? 'rgba(15, 23, 42, 0.45)' : 'none'}
            stroke="rgba(255, 255, 255, 0.14)"
            strokeWidth={idx === levels.length - 1 ? '1.5' : '1'}
            strokeDasharray={idx < 3 ? '2 2' : 'none'}
          />
        ))}

        {/* Spokes from center */}
        {keys.map((_, i) => {
          const { x, y } = getCoordinates(i, 1.0);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(255, 255, 255, 0.16)"
              strokeWidth="1"
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={dataPolygonString}
          fill={themeColor}
          fillOpacity="0.34"
          stroke={themeColor}
          strokeWidth="2.4"
          className="transition-all duration-700 ease-out"
        />

        {/* Vertex dots */}
        {dataPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3.5"
            fill="#ffffff"
            stroke={themeColor}
            strokeWidth="1.75"
            className="transition-all duration-700 ease-out"
          />
        ))}

        {/* Attribute Labels */}
        {keys.map((key, i) => {
          const { x, y } = getCoordinates(i, 1.20);
          const val = values[i];
          return (
            <g key={key} className="transition-all duration-500">
              <text
                x={x}
                y={y - 2}
                textAnchor="middle"
                dominantBaseline="central"
                fill="rgba(241, 245, 249, 0.95)"
                fontSize="10"
                fontWeight="800"
                fontFamily="Inter, system-ui, sans-serif"
                letterSpacing="0.05em"
              >
                {key}
              </text>
              <text
                x={x}
                y={y + 8}
                textAnchor="middle"
                dominantBaseline="central"
                fill={themeColor}
                fontSize="9"
                fontWeight="900"
                fontFamily="monospace"
              >
                {val}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
