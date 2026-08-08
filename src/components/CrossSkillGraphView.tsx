import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  crossSkillEngine,
  DependencyGraphData,
  CrossSkillBridgeNode,
  CrossSkillConnectionType
} from '../services/crossSkillEngine';
import {
  Network,
  ArrowRight,
  Sparkles,
  Mic,
  BookOpen,
  FileText,
  Headphones,
  AlertTriangle,
  CheckCircle,
  Play,
  Layers,
  Zap,
  Info,
  Link,
  ShieldCheck,
  Filter
} from 'lucide-react';

const connectionLabelMap: Record<CrossSkillConnectionType, { title: string; color: string; bg: string }> = {
  GRAMMAR_TO_SPEAKING: { title: 'Grammar → Speaking', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
  GRAMMAR_TO_WRITING: { title: 'Grammar → Writing', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  VOCABULARY_TO_SPEAKING: { title: 'Vocabulary → Speaking', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  VOCABULARY_TO_WRITING: { title: 'Vocabulary → Writing', color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' },
  SPEAKING_TO_GRAMMAR: { title: 'Speaking Oral Error → Grammar', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
  SPEAKING_TO_VOCABULARY: { title: 'Speaking Lexical Gap → Vocab', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  WRITING_TO_GRAMMAR: { title: 'Writing Error → Grammar Drill', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
  WRITING_TO_VOCABULARY: { title: 'Writing Gap → Vocab Upgrade', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  LISTENING_TO_VOCABULARY: { title: 'Listening Transcript → Vocab', color: 'text-cyan-700', bg: 'bg-cyan-50 border-cyan-200' }
};

export const CrossSkillGraphView: React.FC = () => {
  const { setActiveTab } = useApp();
  const [graphData, setGraphData] = useState<DependencyGraphData | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  useEffect(() => {
    refreshGraph();
  }, []);

  const refreshGraph = () => {
    const data = crossSkillEngine.buildDependencyGraph();
    setGraphData(data);
  };

  if (!graphData) return null;

  const filteredBridges = graphData.bridges.filter((b) => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'GRAMMAR') return b.sourceSkill === 'Grammar';
    if (selectedFilter === 'VOCABULARY') return b.sourceSkill === 'Vocabulary';
    if (selectedFilter === 'REMEDIATION') return b.sourceSkill === 'Speaking' || b.sourceSkill === 'Writing';
    if (selectedFilter === 'LISTENING') return b.sourceSkill === 'Listening';
    return true;
  });

  const handleLaunchTask = (bridge: CrossSkillBridgeNode) => {
    const target = bridge.targetSkill.toLowerCase();
    if (target === 'speaking' || target === 'writing' || target === 'grammar' || target === 'vocabulary') {
      setActiveTab(target as any);
    } else {
      setActiveTab('grammar');
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER BANNER */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Network className="w-6 h-6 text-indigo-400" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Cross-Skill Learning Dependency Graph
              </h2>
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Unforced Production Engine
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">
              Bidirectional learning connections linking Grammar & Vocabulary acquisition to natural Speaking/Writing production, and converting live Oral/Written errors into targeted remediation.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80">
            <div className="text-center px-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Active Bridges</span>
              <span className="text-2xl font-extrabold text-indigo-400">{graphData.summaryStats.totalActiveConnections}</span>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div className="text-center px-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Grammar → Prod</span>
              <span className="text-2xl font-extrabold text-emerald-400">{graphData.summaryStats.grammarToProductionCount}</span>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div className="text-center px-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Error Bridges</span>
              <span className="text-2xl font-extrabold text-rose-400">{graphData.summaryStats.feedbackToRemediationCount}</span>
            </div>
          </div>
        </div>

        {/* CONNECTION TYPE SUMMARY PILLS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-indigo-300 font-bold flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Grammar → Production
            </span>
            <p className="text-[11px] text-slate-400">
              Grammar topics mapped to authentic speaking & writing tasks.
            </p>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-emerald-300 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Vocab → Production
            </span>
            <p className="text-[11px] text-slate-400">
              New expressions integrated into workplace oral & written scenarios.
            </p>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-rose-300 font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Errors → Remediation
            </span>
            <p className="text-[11px] text-slate-400">
              Oral and written errors automatically converted into grammar drills.
            </p>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-cyan-300 font-bold flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5" /> Listening → Vocab Harvest
            </span>
            <p className="text-[11px] text-slate-400">
              Collocations harvested from audio transcripts for active review.
            </p>
          </div>
        </div>
      </div>

      {/* GRAPH FILTER BUTTONS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Filter Dependency Graph:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {[
            { id: 'ALL', label: `All Connections (${graphData.bridges.length})` },
            { id: 'GRAMMAR', label: `Grammar → Prod (${graphData.summaryStats.grammarToProductionCount})` },
            { id: 'VOCABULARY', label: `Vocab → Prod (${graphData.summaryStats.vocabToProductionCount})` },
            { id: 'REMEDIATION', label: `Error Remediation (${graphData.summaryStats.feedbackToRemediationCount})` },
            { id: 'LISTENING', label: `Listening Harvest (${graphData.summaryStats.listeningExtractedTermsCount})` }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                selectedFilter === f.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* DEPENDENCY BRIDGES GRID */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Link className="w-5 h-5 text-indigo-600" />
          Active Cross-Skill Bridges ({filteredBridges.length})
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredBridges.map((bridge) => {
            const labelMeta = connectionLabelMap[bridge.connectionType];
            const isSelected = activeNodeId === bridge.id;

            return (
              <div
                key={bridge.id}
                className={`bg-white rounded-2xl p-5 border shadow-xs transition-all space-y-4 relative ${
                  isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* TOP BADGE: Connection Type & CEFR */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${labelMeta.bg} ${labelMeta.color}`}>
                    {labelMeta.title}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded">
                    CEFR {bridge.recommendedCEFR}
                  </span>
                </div>

                {/* GRAPH CONNECTOR FLOW (Source Skill -> Target Skill) */}
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">From ({bridge.sourceSkill})</span>
                    <span className="font-extrabold text-slate-900">{bridge.sourceItemName}</span>
                  </div>

                  <div className="flex items-center gap-1 text-indigo-600 font-bold text-xs shrink-0 px-2">
                    <span className="text-[10px] uppercase tracking-wider text-indigo-400">Bridge</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>

                  <div className="space-y-0.5 text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">To ({bridge.targetSkill})</span>
                    <span className="font-extrabold text-indigo-900">{bridge.naturalContextScenario}</span>
                  </div>
                </div>

                {/* TASK PROMPT & RATIONALE */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block mb-1">Generated Production Task Prompt:</span>
                    <p className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 text-slate-800 leading-relaxed font-medium">
                      "{bridge.taskPrompt}"
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-[11px] text-slate-600 space-y-1">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Natural Usage Rationale (Unforced):
                    </span>
                    <p>{bridge.naturalUsageRationale}</p>
                  </div>
                </div>

                {/* TARGET PHRASES/STRUCTURES & ACTION BUTTON */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex flex-wrap items-center gap-1 text-[11px]">
                    <span className="text-slate-400 font-bold">Target:</span>
                    {bridge.targetPhrasesOrStructures.map((phrase, pIdx) => (
                      <span key={pIdx} className="bg-slate-100 text-slate-800 font-semibold px-2 py-0.5 rounded border border-slate-200">
                        {phrase}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => handleLaunchTask(bridge)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ml-auto"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Practice in {bridge.targetSkill}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
