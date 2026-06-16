import React, { useState, useMemo, useEffect } from "react";
import { Match, Team, Stage } from "../types";
import { Plus, Minus, Tv, Calendar, Trash2, HelpCircle } from "lucide-react";
import Flag from "./Flag";

interface MatchListProps {
  teams: Team[];
  matches: Match[];
  selectedStage: Stage;
  onUpdateScore: (matchId: string, scoreA: number | null, scoreB: number | null) => void;
  onUpdateTeams: (matchId: string, teamAId: string | null, teamBId: string | null) => void;
  onUpdateCards: (matchId: string, type: "yellow" | "red", team: "A" | "B", val: number | null) => void;
}

export default function MatchList({
  teams,
  matches,
  selectedStage,
  onUpdateScore,
  onUpdateTeams,
  onUpdateCards,
}: MatchListProps) {
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>("Tous");

  // Map teams by ID for instant O(1) lookups
  const teamsMap = useMemo(() => {
    const map = new Map<string, Team>();
    teams.forEach((t) => map.set(t.id, t));
    return map;
  }, [teams]);

  // List of all non-eliminated teams for dropdowns
  const availableTeams = useMemo(() => {
    return teams.filter((t) => !t.eliminated);
  }, [teams]);

  // Filter matches belonging to the selected stage
  const stageMatches = useMemo(() => {
    let filtered = matches.filter((m) => m.stage === selectedStage);
    if (selectedStage === Stage.GROUPS && selectedGroupFilter !== "Tous") {
      filtered = filtered.filter((m) => m.group === selectedGroupFilter);
    }
    return filtered;
  }, [matches, selectedStage, selectedGroupFilter]);

  // Trouver l'ID du premier match non rempli (scoreA ou scoreB est null)
  const firstUnfilledMatchId = useMemo(() => {
    return stageMatches.find((m) => m.scoreA === null || m.scoreB === null)?.id || null;
  }, [stageMatches]);

  // Défilement automatique fluide vers le premier match non saisi dès l'ouverture / changement de filtre
  useEffect(() => {
    if (firstUnfilledMatchId) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`match-card-${firstUnfilledMatchId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
    // On ne se fie qu'au montage inicial et au changement de phase/filtre pour éviter tout défilement intempestif pendant la saisie des scores.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStage, selectedGroupFilter]);

  // Handle score increment / decrement
  const adjustScore = (match: Match, team: "A" | "B", action: "inc" | "dec") => {
    let scoreA = match.scoreA;
    let scoreB = match.scoreB;

    if (team === "A") {
      if (scoreA === null) {
        scoreA = action === "inc" ? 1 : 0;
      } else {
        scoreA = action === "inc" ? scoreA + 1 : Math.max(0, scoreA - 1);
      }
    } else {
      if (scoreB === null) {
        scoreB = action === "inc" ? 1 : 0;
      } else {
        scoreB = action === "inc" ? scoreB + 1 : Math.max(0, scoreB - 1);
      }
    }

    // Force default counterpart score to 0 if null, so match starts counting
    if (team === "A" && scoreB === null) scoreB = 0;
    if (team === "B" && scoreA === null) scoreA = 0;

    onUpdateScore(match.id, scoreA, scoreB);
  };

  // Channel badge color picker
  const getChannelStyle = (channel: string) => {
    switch (channel) {
      case "TF1":
        return "bg-blue-950/70 text-blue-300 border-blue-800/80 hover:bg-blue-900/60";
      case "M6":
        return "bg-slate-900/90 text-slate-300 border-slate-700/80 hover:bg-slate-800";
      case "beIN Sports":
        return "bg-purple-950/70 text-purple-300 border-purple-800/80 hover:bg-purple-900/60";
      default:
        return "bg-slate-900 text-slate-400 border-slate-800";
    }
  };

  return (
    <div className="space-y-4">
      {/* Sub-filtering for Group stage matches */}
      {selectedStage === Stage.GROUPS && (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
          <div className="text-xs font-semibold text-slate-400 mb-2.5 flex items-center gap-1.5 justify-center sm:justify-start">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            Sélectionner un Groupe :
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1">
            {["Tous", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"].map((grp) => (
              <button
                key={grp}
                onClick={() => setSelectedGroupFilter(grp)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  selectedGroupFilter === grp
                    ? "bg-slate-800 text-emerald-400 border-emerald-500/60"
                    : "bg-slate-950/50 text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-950"
                }`}
              >
                {grp === "Tous" ? "Tous" : `Gr. ${grp}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stageMatches.map((match) => {
          const teamA = match.teamAId ? teamsMap.get(match.teamAId) : null;
          const teamB = match.teamBId ? teamsMap.get(match.teamBId) : null;

          // Check if selected team is marked as eliminated ensuite
          const isTeamAEliminatedConflict = teamA && teamA.eliminated;
          const isTeamBEliminatedConflict = teamB && teamB.eliminated;

          return (
            <div
              key={match.id}
              id={`match-card-${match.id}`}
              className="bg-slate-900/60 hover:bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 transition-all flex flex-col justify-between shadow-md"
            >
              {/* Metadata top row */}
              <div className="flex justify-between items-center text-[11px] text-slate-500 border-b border-slate-800/60 pb-2.5 mb-3">
                <span className="font-mono bg-slate-950/60 text-slate-400 font-semibold px-2 py-0.5 rounded border border-slate-800/40">
                  Match #{match.matchNumber}{" "}
                  {match.group ? (
                    <>
                      • Gr.{" "}
                      <span translate="no" className="notranslate inline-block">
                        {match.group}
                      </span>
                    </>
                  ) : ""}
                </span>
                <span className="flex items-center gap-1 font-semibold text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500/70" />
                  {match.date}
                </span>
                <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${getChannelStyle(match.channel)}`}>
                  <Tv className="w-3 h-3" />
                  {match.channel}
                </span>
              </div>

              {/* Match Play row (portrait/mobile safe) */}
              <div className="flex items-center gap-2 justify-between py-1">
                {/* Team A */}
                <div className="flex-1 flex flex-col items-center text-center max-w-[40%]">
                  <div className="flex flex-col items-center w-full">
                    {teamA ? (
                      <Flag emoji={teamA.flag} name={teamA.name} className="w-10 h-10 sm:w-12 sm:h-12 mb-1.5 animate-fade-in" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center border border-dashed border-slate-800 mb-1.5">
                        <HelpCircle className="w-5 h-5 text-slate-600" />
                      </div>
                    )}
                    
                    <select
                      value={match.teamAId || ""}
                      onChange={(e) => onUpdateTeams(match.id, e.target.value || null, match.teamBId)}
                      translate="no"
                      className={`notranslate w-full text-center text-xs font-bold rounded-lg px-1.5 py-1.5 bg-slate-950 text-slate-300 border focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-colors ${
                        isTeamAEliminatedConflict ? "border-rose-800 text-rose-300 bg-rose-950/20" : "border-slate-800"
                      }`}
                    >
                      <option value="">{match.teamANamePlaceholder || "-- Choisir --"}</option>
                      {/* Grouped by Group for visual ease */}
                      {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"].map((grpLetter) => {
                        const grpTeams = teams.filter(
                          (t) => t.group === grpLetter && (!t.eliminated || t.id === match.teamAId)
                        );
                        if (grpTeams.length === 0) return null;
                        return (
                          <optgroup key={grpLetter} label={`Groupe ${grpLetter}`} translate="no" className="notranslate">
                            {grpTeams.map((t) => (
                              <option key={t.id} value={t.id} translate="no" className="notranslate">
                                {t.flag} {t.name} {t.eliminated ? " (Éliminé)" : ""}
                              </option>
                            ))}
                          </optgroup>
                        );
                      })}
                    </select>
                    {isTeamAEliminatedConflict && (
                      <span className="text-[10px] text-rose-400 font-semibold mt-1">Éliminée !</span>
                    )}

                    {/* Cartons Jaune et Rouge */}
                    <div className="flex items-center gap-2 mt-2 bg-slate-950/40 p-1.5 rounded-lg border border-slate-800/40 w-full justify-center">
                      <div className="flex items-center gap-1">
                        <div className="w-2.5 h-3.5 bg-amber-400 rounded-sm shadow-sm" title="Cartons jaunes"></div>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={match.yellowCardsA ?? ""}
                          onChange={(e) => {
                            const val = e.target.value === "" ? null : Math.max(0, parseInt(e.target.value) || 0);
                            onUpdateCards(match.id, "yellow", "A", val);
                          }}
                          className="w-8 bg-slate-950/60 text-slate-200 border border-slate-800 rounded font-mono text-[10px] text-center py-0.5 focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2.5 h-3.5 bg-rose-600 rounded-sm shadow-sm" title="Cartons rouges"></div>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={match.redCardsA ?? ""}
                          onChange={(e) => {
                            const val = e.target.value === "" ? null : Math.max(0, parseInt(e.target.value) || 0);
                            onUpdateCards(match.id, "red", "A", val);
                          }}
                          className="w-8 bg-slate-950/60 text-slate-200 border border-slate-800 rounded font-mono text-[10px] text-center py-0.5 focus:border-rose-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Controls Column */}
                <div className="flex flex-col items-center justify-center min-w-[70px] sm:min-w-[100px]">
                  {/* Heure centrale */}
                  <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/30 border border-emerald-900/30 px-2 py-0.5 rounded mb-2 shadow">
                    {match.time}
                  </span>

                  {/* Increment row for team A and B */}
                  <div className="flex items-center gap-1 sm:gap-2">
                    {/* Score display box */}
                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg overflow-hidden p-1">
                      {/* Team A controls */}
                      <div className="flex flex-col items-center px-1 sm:px-2">
                        <button
                          onClick={() => adjustScore(match, "A", "inc")}
                          className="p-1 text-slate-400 hover:text-emerald-400 active:text-emerald-500 transition-colors"
                          title="Plus"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-base sm:text-lg font-mono font-bold text-slate-100 py-0.5">
                          {match.scoreA !== null ? match.scoreA : "-"}
                        </span>
                        <button
                          onClick={() => adjustScore(match, "A", "dec")}
                          className="p-1 text-slate-400 hover:text-rose-400 active:text-rose-500 transition-colors"
                          disabled={match.scoreA === null || match.scoreA === 0}
                          title="Moins"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Divider */}
                      <span className="text-slate-700 text-xs px-0.5 font-bold">:</span>

                      {/* Team B controls */}
                      <div className="flex flex-col items-center px-1 sm:px-2">
                        <button
                          onClick={() => adjustScore(match, "B", "inc")}
                          className="p-1 text-slate-400 hover:text-emerald-400 active:text-emerald-500 transition-colors"
                          title="Plus"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-base sm:text-lg font-mono font-bold text-slate-100 py-0.5">
                          {match.scoreB !== null ? match.scoreB : "-"}
                        </span>
                        <button
                          onClick={() => adjustScore(match, "B", "dec")}
                          className="p-1 text-slate-400 hover:text-rose-400 active:text-rose-500 transition-colors"
                          disabled={match.scoreB === null || match.scoreB === 0}
                          title="Moins"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Clear score action */}
                  {(match.scoreA !== null || match.scoreB !== null) && (
                    <button
                      onClick={() => onUpdateScore(match.id, null, null)}
                      className="mt-2 text-[10px] text-rose-400/80 hover:text-rose-400 flex items-center gap-0.5 font-semibold transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Effacer score
                    </button>
                  )}
                </div>

                {/* Team B */}
                <div className="flex-1 flex flex-col items-center text-center max-w-[40%]">
                  <div className="flex flex-col items-center w-full">
                    {teamB ? (
                      <Flag emoji={teamB.flag} name={teamB.name} className="w-10 h-10 sm:w-12 sm:h-12 mb-1.5 animate-fade-in" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center border border-dashed border-slate-800 mb-1.5">
                        <HelpCircle className="w-5 h-5 text-slate-600" />
                      </div>
                    )}
                    
                    <select
                      value={match.teamBId || ""}
                      onChange={(e) => onUpdateTeams(match.id, match.teamAId, e.target.value || null)}
                      translate="no"
                      className={`notranslate w-full text-center text-xs font-bold rounded-lg px-1.5 py-1.5 bg-slate-950 text-slate-300 border focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-colors ${
                        isTeamBEliminatedConflict ? "border-rose-800 text-rose-300 bg-rose-950/20" : "border-slate-800"
                      }`}
                    >
                      <option value="">{match.teamBNamePlaceholder || "-- Choisir --"}</option>
                      {/* Grouped by Group for visual ease */}
                      {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"].map((grpLetter) => {
                        const grpTeams = teams.filter(
                          (t) => t.group === grpLetter && (!t.eliminated || t.id === match.teamBId)
                        );
                        if (grpTeams.length === 0) return null;
                        return (
                          <optgroup key={grpLetter} label={`Groupe ${grpLetter}`} translate="no" className="notranslate">
                            {grpTeams.map((t) => (
                              <option key={t.id} value={t.id} translate="no" className="notranslate">
                                {t.flag} {t.name} {t.eliminated ? " (Éliminé)" : ""}
                              </option>
                            ))}
                          </optgroup>
                        );
                      })}
                    </select>
                    {isTeamBEliminatedConflict && (
                      <span className="text-[10px] text-rose-400 font-semibold mt-1">Éliminée !</span>
                    )}

                    {/* Cartons Jaune et Rouge */}
                    <div className="flex items-center gap-2 mt-2 bg-slate-950/40 p-1.5 rounded-lg border border-slate-800/40 w-full justify-center">
                      <div className="flex items-center gap-1">
                        <div className="w-2.5 h-3.5 bg-amber-400 rounded-sm shadow-sm" title="Cartons jaunes"></div>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={match.yellowCardsB ?? ""}
                          onChange={(e) => {
                            const val = e.target.value === "" ? null : Math.max(0, parseInt(e.target.value) || 0);
                            onUpdateCards(match.id, "yellow", "B", val);
                          }}
                          className="w-8 bg-slate-950/60 text-slate-200 border border-slate-800 rounded font-mono text-[10px] text-center py-0.5 focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2.5 h-3.5 bg-rose-600 rounded-sm shadow-sm" title="Cartons rouges"></div>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={match.redCardsB ?? ""}
                          onChange={(e) => {
                            const val = e.target.value === "" ? null : Math.max(0, parseInt(e.target.value) || 0);
                            onUpdateCards(match.id, "red", "B", val);
                          }}
                          className="w-8 bg-slate-950/60 text-slate-200 border border-slate-800 rounded font-mono text-[10px] text-center py-0.5 focus:border-rose-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
