import React, { useState } from 'react';
import { SkillProgress } from '../types';

interface RadarChartProps {
  skills: SkillProgress[];
  size?: number;
}

export const RadarChart: React.FC<RadarChartProps> = ({ skills, size = 320 }) => {
  const [hoveredSkill, setHoveredSkill] = useState<SkillProgress | null>(null);

  const center = size / 2;
  const radius = (size / 2) - 45;
  const totalSkills = skills.length;

  // Helper to calculate coordinates
  const getCoordinates = (index: number, value: number) => {
    const angle = (Math.PI * 2 / totalSkills) * index - (Math.PI / 2);
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  // Generate grid webs (20%, 40%, 60%, 80%, 100%)
  const gridLevels = [20, 40, 60, 80, 100];

  // Points for current scores
  const currentPoints = skills.map((s, i) => {
    const { x, y } = getCoordinates(i, s.currentScore);
    return `${x},${y}`;
  }).join(' ');

  // Points for B2 target scores
  const targetPoints = skills.map((s, i) => {
    const { x, y } = getCoordinates(i, s.b2TargetScore);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="flex flex-col items-center justify-center relative w-full select-none">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="overflow-visible">
          {/* Background concentric webs */}
          {gridLevels.map((level) => {
            const points = skills.map((_, i) => {
              const { x, y } = getCoordinates(i, level);
              return `${x},${y}`;
            }).join(' ');
            return (
              <polygon
                key={level}
                points={points}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth={level === 80 ? "1.5" : "1"}
                strokeDasharray={level === 80 ? "3 3" : "none"}
              />
            );
          })}

          {/* Axes lines */}
          {skills.map((_, i) => {
            const { x, y } = getCoordinates(i, 100);
            return (
              <line
                key={`axis-${i}`}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#cbd5e1"
                strokeWidth="1"
              />
            );
          })}

          {/* B2 Target Area (Dashed green outline) */}
          <polygon
            points={targetPoints}
            fill="rgba(16, 185, 129, 0.08)"
            stroke="#10b981"
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          {/* Current Score Area (Solid indigo fill) */}
          <polygon
            points={currentPoints}
            fill="rgba(79, 70, 229, 0.25)"
            stroke="#4f46e5"
            strokeWidth="2.5"
            className="transition-all duration-300"
          />

          {/* Interactive Data Points */}
          {skills.map((s, i) => {
            const { x, y } = getCoordinates(i, s.currentScore);
            const { x: tx, y: ty } = getCoordinates(i, s.b2TargetScore);
            const isHovered = hoveredSkill?.skill === s.skill;

            return (
              <g key={`point-${s.skill}`} className="cursor-pointer">
                {/* Target point indicator */}
                <circle
                  cx={tx}
                  cy={ty}
                  r="3.5"
                  fill="#10b981"
                />

                {/* Current score point indicator */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? "7" : "5"}
                  fill="#4f46e5"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all duration-200"
                  onMouseEnter={() => setHoveredSkill(s)}
                  onMouseLeave={() => setHoveredSkill(null)}
                />
              </g>
            );
          })}

          {/* Skill Labels */}
          {skills.map((s, i) => {
            const { x, y, angle } = getCoordinates(i, 118);
            const isHovered = hoveredSkill?.skill === s.skill;

            // Anchor adjustment based on position
            let textAnchor: "start" | "middle" | "end" = "middle";
            if (Math.abs(Math.cos(angle)) > 0.3) {
              textAnchor = Math.cos(angle) > 0 ? "start" : "end";
            }

            return (
              <text
                key={`label-${s.skill}`}
                x={x}
                y={y + 4}
                textAnchor={textAnchor}
                className={`text-xs font-semibold tracking-wide transition-colors ${
                  isHovered ? 'fill-indigo-700 font-bold' : 'fill-slate-600'
                }`}
                onMouseEnter={() => setHoveredSkill(s)}
                onMouseLeave={() => setHoveredSkill(null)}
              >
                {s.skill} ({s.currentScore}%)
              </text>
            );
          })}
        </svg>

        {/* Hover Tooltip Card */}
        {hoveredSkill && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-900/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-xs shadow-xl pointer-events-none z-20 min-w-[160px] border border-slate-700 text-center">
            <p className="font-bold text-indigo-300">{hoveredSkill.skill}</p>
            <div className="flex justify-between my-1 text-[11px] text-slate-300">
              <span>Current: <strong className="text-white">{hoveredSkill.currentScore}%</strong></span>
              <span>B2 Goal: <strong className="text-emerald-400">{hoveredSkill.b2TargetScore}%</strong></span>
            </div>
            <p className="text-[10px] text-slate-400 italic mt-1 leading-tight">{hoveredSkill.keyFocus}</p>
          </div>
        )}
      </div>

      {/* Chart Legend */}
      <div className="flex items-center gap-6 mt-4 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block"></span>
          <span>Current Score (B1+)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full border-2 border-dashed border-emerald-500 bg-emerald-50 inline-block"></span>
          <span>B2 Target Standard</span>
        </div>
      </div>
    </div>
  );
};
