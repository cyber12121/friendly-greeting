import React from 'react';
import { SkillProgress } from '../types';

interface BarChartProps {
  skills: SkillProgress[];
}

export const BarChart: React.FC<BarChartProps> = ({ skills }) => {
  return (
    <div className="w-full space-y-4">
      {skills.map((s) => {
        const gap = s.b2TargetScore - s.currentScore;
        return (
          <div key={s.skill} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 hover:border-indigo-200 transition-all">
            <div className="flex justify-between items-center mb-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800">{s.skill}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  s.status === 'Mastered' ? 'bg-emerald-100 text-emerald-800' :
                  s.status === 'Near Target' ? 'bg-teal-100 text-teal-800' :
                  s.status === 'Improving' ? 'bg-indigo-100 text-indigo-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {s.status}
                </span>
              </div>
              <div className="text-slate-600 font-medium">
                <span className="text-indigo-600 font-bold">{s.currentScore}%</span>
                <span className="text-slate-400 mx-1">/</span>
                <span className="text-emerald-600">{s.b2TargetScore}% Goal</span>
              </div>
            </div>

            {/* Progress bar container */}
            <div className="relative h-3 w-full bg-slate-200 rounded-full overflow-hidden">
              {/* Target Marker */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-emerald-500 z-10 rounded-full"
                style={{ left: `${s.b2TargetScore}%` }}
                title={`B2 Goal: ${s.b2TargetScore}%`}
              />
              {/* Current Fill */}
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${s.currentScore}%` }}
              />
            </div>

            <div className="mt-2 flex justify-between items-center text-[11px] text-slate-500">
              <p className="truncate pr-2">{s.keyFocus}</p>
              <span className="shrink-0 font-medium text-indigo-600">
                {gap > 0 ? `${gap}% to B2` : 'Target Met!'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
