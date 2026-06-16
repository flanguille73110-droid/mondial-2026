import React, { useState } from "react";
import { Trophy, RefreshCw, Calendar, Users, Settings, ChevronUp, ChevronDown } from "lucide-react";

interface HeaderProps {
  totalMatches: number;
  completedMatches: number;
  totalTeams: number;
  activeTeams: number;
  onReset: () => void;
  onShowNotice: () => void;
  onShowSettings: () => void;
}

export default function Header({
  totalMatches,
  completedMatches,
  totalTeams,
  activeTeams,
  onReset,
  onShowNotice,
  onShowSettings,
}: HeaderProps) {
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem("header_expanded");
    return saved === "true";
  });

  const progressPercent = Math.round((completedMatches / totalMatches) * 100) || 0;

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    localStorage.setItem("header_expanded", (!isExpanded).toString());
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md relative transition-all duration-300">
      {isExpanded ? (
        <div className="max-w-7xl mx-auto px-4 pt-3 sm:pt-4 pb-5 sm:pb-6">
          {/* Main Brand Action Flex */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-900/40 animate-pulse-slow">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-emerald-100 to-emerald-400 bg-clip-text text-transparent">
                  Mondial 2026
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  Calendrier Interactif & Gestionnaire de Scores
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={onShowSettings}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 hover:border-slate-600 text-amber-400 rounded-lg transition-colors w-full sm:w-auto cursor-pointer"
                title="Ouvrir les paramètres de l'application"
              >
                <Settings className="w-3.5 h-3.5 text-amber-400" />
                Paramètres
              </button>
              <button
                onClick={onShowNotice}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 hover:border-slate-600 text-emerald-400 rounded-lg transition-colors w-full sm:w-auto"
                title="Afficher la notice d'utilisation"
              >
                <span className="text-base select-none">📖</span>
                Notice
              </button>
              <button
                onClick={onReset}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-lg text-rose-400 transition-colors w-full sm:w-auto cursor-pointer"
                title="Réinitialiser toutes les données"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Réinitialiser
              </button>
            </div>
          </div>

          {/* Tournament Dashboard Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800/60">
            <div className="bg-slate-950/40 border border-slate-800/40 rounded-lg p-2 flex items-center gap-2.5">
              <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-md">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Matchs Joués</div>
                <div className="text-sm font-semibold text-slate-200">
                  {completedMatches} <span className="text-slate-500 text-xs">/ {totalMatches} ({progressPercent}%)</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/40 border border-slate-800/40 rounded-lg p-2 flex items-center gap-2.5">
              <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-md">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Équipes Actives</div>
                <div className="text-sm font-semibold text-slate-200">
                  {activeTeams} <span className="text-slate-500 text-xs">/ {totalTeams} restants</span>
                </div>
              </div>
            </div>

            {/* Progress bar spans full width on mobile, 1 col on desktop */}
            <div className="col-span-2 sm:col-span-1 bg-slate-950/40 border border-slate-800/40 rounded-lg p-2 flex flex-col justify-center">
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1 flex justify-between">
                <span>Progression Coupe du Monde</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 py-0.5">
            <div className="p-1 bg-emerald-600 rounded-lg">
              <Trophy className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-bold text-slate-200 tracking-tight">
              Mondial 2026
            </span>
            <span className="hidden sm:inline text-[10px] text-slate-500 font-medium">
              • {completedMatches} / {totalMatches} matchs joués ({progressPercent}%)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onShowSettings}
              className="p-1 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer flex items-center"
              title="Paramètres"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onShowNotice}
              className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer flex items-center"
              title="Notice"
            >
              📖
            </button>
          </div>
        </div>
      )}

      {/* Flèche absolute pour masquer ou afficher l'encadré tout en haut de la page */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={toggleExpand}
          className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 font-bold p-1 rounded-full shadow-lg transition-all cursor-pointer flex items-center justify-center focus:outline-none"
          title={isExpanded ? "Masquer l'en-tête" : "Afficher l'en-tête"}
        >
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </header>
  );
}
