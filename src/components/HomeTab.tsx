import React, { useState, useEffect } from "react";
import { Team, Match, Stage } from "../types";
import { Clock, Calendar, Tv, Plus, Minus, Trash2, HelpCircle, Flame, CheckCircle2 } from "lucide-react";
import Flag from "./Flag";

interface HomeTabProps {
  teams: Team[];
  matches: Match[];
  onUpdateScore: (matchId: string, scoreA: number | null, scoreB: number | null) => void;
  onUpdateTeams: (matchId: string, teamAId: string | null, teamBId: string | null) => void;
  onUpdateCards: (matchId: string, type: "yellow" | "red", team: "A" | "B", val: number | null) => void;
}

// Map months for parsing date strings from matches
const monthsMap: Record<string, number> = {
  janvier: 0,
  fevrier: 1,
  février: 1,
  mars: 2,
  avril: 3,
  mai: 4,
  juin: 5,
  juillet: 6,
  aout: 7,
  août: 7,
  septembre: 8,
  octobre: 9,
  novembre: 10,
  decembre: 11,
  décembre: 11,
};

// Parser helper that converts a French date/time string from a match into a real Date object
function parseMatchDateTime(dateStr: string, timeStr: string): Date {
  const dateParts = dateStr.trim().split(/\s+/);
  const day = parseInt(dateParts[0], 10) || 1;
  const monthName = dateParts[1]?.toLowerCase() || "";
  const month = monthsMap[monthName] !== undefined ? monthsMap[monthName] : 5; // default to June (5)
  const year = parseInt(dateParts[2], 10) || 2026;

  const timeParts = timeStr.trim().split(":");
  const hours = parseInt(timeParts[0], 10) || 0;
  const minutes = parseInt(timeParts[1], 10) || 0;

  return new Date(year, month, day, hours, minutes);
}

export default function HomeTab({
  teams,
  matches,
  onUpdateScore,
  onUpdateTeams,
  onUpdateCards,
}: HomeTabProps) {
  // Heure réelle en France mise à jour en temps réel
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  useEffect(() => {
    // Horloge mise à jour dynamiquement à chaque seconde
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Find matches & select current/next
  const sortedMatchesWithDate = matches.map((match) => {
    return {
      match,
      dateObj: parseMatchDateTime(match.date, match.time),
    };
  }).sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  const nowMs = currentTime.getTime();
  const matchDurationMs = 120 * 60 * 1000; // 2 hours

  // 1. Check for matches in progress right now
  const matchesInProgress = sortedMatchesWithDate.filter(({ dateObj }) => {
    const start = dateObj.getTime();
    const end = start + matchDurationMs;
    return nowMs >= start && nowMs <= end;
  });

  let activeMatch: Match | null = null;
  let statusText = "";
  let isLive = false;

  if (matchesInProgress.length > 0) {
    activeMatch = matchesInProgress[0].match;
    statusText = "RENCONTRE ACTUELLEMENT EN COURS";
    isLive = true;
  } else {
    // 2. Find first upcoming match (starting after currentTime)
    const upcomingMatches = sortedMatchesWithDate.filter(({ dateObj }) => {
      return dateObj.getTime() > nowMs;
    });

    if (upcomingMatches.length > 0) {
      activeMatch = upcomingMatches[0].match;
      statusText = "PROCHAINE RENCONTRE À VENIR";
      isLive = false;
    } else {
      // 3. Last match of tournament fallback
      if (sortedMatchesWithDate.length > 0) {
        activeMatch = sortedMatchesWithDate[sortedMatchesWithDate.length - 1].match;
        statusText = "DERNIÈRE RENCONTRE DU TOURNOI";
        isLive = false;
      }
    }
  }

  // Map teams for instant lookup
  const teamsMap = new Map<string, Team>();
  teams.forEach((t) => teamsMap.set(t.id, t));

  // Channel badge style
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

  // Helper score adjuster
  const adjustScore = (match: Match, team: "A" | "B", action: "inc" | "dec") => {
    let currentScore = team === "A" ? match.scoreA : match.scoreB;
    if (currentScore === null) {
      currentScore = action === "inc" ? 0 : 0;
    } else {
      currentScore = action === "inc" ? currentScore + 1 : Math.max(0, currentScore - 1);
    }

    if (team === "A") {
      onUpdateScore(match.id, currentScore, match.scoreB);
    } else {
      onUpdateScore(match.id, match.scoreA, currentScore);
    }
  };

  const formatFrenchDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Europe/Paris"
    });
  };

  const activeTeamA = activeMatch?.teamAId ? teamsMap.get(activeMatch.teamAId) : null;
  const activeTeamB = activeMatch?.teamBId ? teamsMap.get(activeMatch.teamBId) : null;

  const isTeamAEliminatedConflict = activeTeamA?.eliminated;
  const isTeamBEliminatedConflict = activeTeamB?.eliminated;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest bg-emerald-600/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Tableau de Bord Accueil
            </span>
            {isLive && (
              <span className="flex items-center gap-1 text-[10px] bg-rose-600/25 border border-rose-500/20 text-rose-400 font-bold px-2 py-0.5 rounded-full animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                EN DIRECT
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
            Mondial 2026 : Le Match du Jour
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Cette page détecte automatiquement la rencontre en cours de diffusion ou le tout prochain événement selon la date et l'heure système. Saisissez ici les résultats pour synchroniser l'ensemble de l'application.
          </p>
        </div>

        {/* Current Date Display */}
        <div className="shrink-0 bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3 shadow-inner z-10">
          <Clock className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Date et heure actuelle (France)</span>
            <div className="text-xs font-mono font-bold text-emerald-400">
              {formatFrenchDate(currentTime)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Focus Match Area */}
      {activeMatch ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 pl-1 mb-2">
            <span className="w-2 h-4 bg-emerald-500 rounded"></span>
            <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider">
              {statusText}
            </h3>
          </div>

          <div
            id="home-focus-match-card"
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between"
          >
            {/* Visual shine card accent */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${isLive ? 'bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500' : 'bg-gradient-to-r from-emerald-500 to-blue-600'}`}></div>

            {/* Match Header metadata */}
            <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-800/80 pb-3.5 mb-5 mt-1">
              <span className="font-mono bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg text-slate-300 font-bold">
                Match #{activeMatch.matchNumber} • {activeMatch.stage}
                {activeMatch.group ? ` • Groupe ${activeMatch.group}` : ""}
              </span>
              
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  {activeMatch.date}
                </span>

                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold ${getChannelStyle(activeMatch.channel)}`}>
                  <Tv className="w-3.5 h-3.5" />
                  {activeMatch.channel}
                </span>
              </div>
            </div>

            {/* Core Match Row displaying Team A vs Team B */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center py-2">
              
              {/* Team A Input & Flag Column */}
              <div className="flex flex-col items-center text-center space-y-3.5">
                {activeTeamA ? (
                  <div className="flex flex-col items-center">
                    <Flag emoji={activeTeamA.flag} name={activeTeamA.name} className="w-16 h-16 mb-2.5 drop-shadow-xl animate-fade-in" />
                    <span className="text-md font-bold text-slate-100">{activeTeamA.name}</span>
                    <span className="text-[10px] text-slate-400 mt-1 font-mono uppercase bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      Rang FIFA: #{activeTeamA.fifaRanking || "N/A"}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center border border-dashed border-slate-800 mb-2.5">
                      <HelpCircle className="w-7 h-7 text-slate-600" />
                    </div>
                    <span className="text-xs font-semibold text-slate-400 italic">
                      {activeMatch.teamANamePlaceholder || "À déterminer"}
                    </span>
                  </div>
                )}

                {/* Team Selection drop down in case they aren't seeded yet */}
                <select
                  value={activeMatch.teamAId || ""}
                  onChange={(e) => onUpdateTeams(activeMatch!.id, e.target.value || null, activeMatch!.teamBId)}
                  translate="no"
                  className={`notranslate max-w-[200px] w-full text-center text-xs font-bold rounded-lg px-2.5 py-1.5 bg-slate-950 text-slate-300 border focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-colors ${
                    isTeamAEliminatedConflict ? "border-rose-800 text-rose-300 bg-rose-950/20" : "border-slate-800"
                  }`}
                >
                  <option value="">{activeMatch.teamANamePlaceholder || "-- Choisir --"}</option>
                  {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"].map((grpLetter) => {
                    const grpTeams = teams.filter(
                      (t) => t.group === grpLetter && (!t.eliminated || t.id === activeMatch!.teamAId)
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
                  <span className="text-xs text-rose-400 font-semibold mt-1">Équipe éliminée !</span>
                )}

                {/* Cards inputs (Yellow / Red) */}
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 w-full max-w-[180px] space-y-2">
                  <div className="text-[10px] font-bold text-slate-500 text-center uppercase tracking-wide">Cartons Équipe A</div>
                  <div className="flex items-center justify-around gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-4 bg-amber-400 rounded-sm shadow" title="Cartons jaunes"></div>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={activeMatch.yellowCardsA ?? ""}
                        onChange={(e) => {
                          const val = e.target.value === "" ? null : Math.max(0, parseInt(e.target.value) || 0);
                          onUpdateCards(activeMatch!.id, "yellow", "A", val);
                        }}
                        className="w-10 bg-slate-950 border border-slate-800 rounded font-mono font-bold text-xs text-slate-100 text-center py-1 focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-4 bg-rose-600 rounded-sm shadow" title="Cartons rouges"></div>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={activeMatch.redCardsA ?? ""}
                        onChange={(e) => {
                          const val = e.target.value === "" ? null : Math.max(0, parseInt(e.target.value) || 0);
                          onUpdateCards(activeMatch!.id, "red", "A", val);
                        }}
                        className="w-10 bg-slate-950 border border-slate-800 rounded font-mono font-bold text-xs text-slate-100 text-center py-1 focus:border-rose-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Central SCORE Adjuster Block */}
              <div className="flex flex-col items-center justify-center space-y-4">
                <span className="text-xs font-mono text-emerald-400 font-extrabold bg-emerald-950/40 border border-emerald-900/30 px-3 py-1 rounded-lg shadow uppercase">
                  HEURE DU COUP D'ENVOI: {activeMatch.time}
                </span>

                <div className="flex items-center bg-slate-950 border-2 border-slate-800 rounded-2xl p-2 sm:p-3 shadow-2xl">
                  {/* Team A controls */}
                  <div className="flex flex-col items-center px-4 sm:px-6">
                    <button
                      onClick={() => adjustScore(activeMatch!, "A", "inc")}
                      className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-emerald-400 hover:border-emerald-900 active:bg-emerald-950/30 transition-all cursor-pointer"
                      title="Plus"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <span className="text-3xl sm:text-4xl font-mono font-black text-slate-100 py-1.5 select-none">
                      {activeMatch.scoreA !== null ? activeMatch.scoreA : "-"}
                    </span>
                    <button
                      onClick={() => adjustScore(activeMatch!, "A", "dec")}
                      className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-rose-400 hover:border-rose-950 active:bg-rose-950/30 transition-all cursor-pointer disabled:opacity-35"
                      disabled={activeMatch.scoreA === null || activeMatch.scoreA === 0}
                      title="Moins"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Elegant Divider Colon */}
                  <span className="text-slate-700 text-3xl font-black px-1 select-none animate-pulse">:</span>

                  {/* Team B controls */}
                  <div className="flex flex-col items-center px-4 sm:px-6">
                    <button
                      onClick={() => adjustScore(activeMatch!, "B", "inc")}
                      className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-emerald-400 hover:border-emerald-900 active:bg-emerald-950/30 transition-all cursor-pointer"
                      title="Plus"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <span className="text-3xl sm:text-4xl font-mono font-black text-slate-100 py-1.5 select-none">
                      {activeMatch.scoreB !== null ? activeMatch.scoreB : "-"}
                    </span>
                    <button
                      onClick={() => adjustScore(activeMatch!, "B", "dec")}
                      className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-rose-400 hover:border-rose-950 active:bg-rose-950/30 transition-all cursor-pointer disabled:opacity-35"
                      disabled={activeMatch.scoreB === null || activeMatch.scoreB === 0}
                      title="Moins"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <p className="text-[10px] text-slate-500 font-medium">
                    Enregistrement automatique en direct des scores
                  </p>
                  {(activeMatch.scoreA !== null || activeMatch.scoreB !== null) && (
                    <button
                      onClick={() => onUpdateScore(activeMatch!.id, null, null)}
                      className="mx-auto text-xs text-rose-400/90 hover:text-rose-400 flex items-center justify-center gap-1 font-bold transition-all px-3 py-1.5 bg-rose-950/20 hover:bg-rose-950/40 rounded-lg border border-rose-900/45 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Effacer le score du match
                    </button>
                  )}
                </div>
              </div>

              {/* Team B Input & Flag Column */}
              <div className="flex flex-col items-center text-center space-y-3.5 border-t md:border-t-0 border-slate-800/50 pt-5 md:pt-0">
                {activeTeamB ? (
                  <div className="flex flex-col items-center">
                    <Flag emoji={activeTeamB.flag} name={activeTeamB.name} className="w-16 h-16 mb-2.5 drop-shadow-xl animate-fade-in" />
                    <span className="text-md font-bold text-slate-100">{activeTeamB.name}</span>
                    <span className="text-[10px] text-slate-400 mt-1 font-mono uppercase bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      Rang FIFA: #{activeTeamB.fifaRanking || "N/A"}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center border border-dashed border-slate-800 mb-2.5">
                      <HelpCircle className="w-7 h-7 text-slate-600" />
                    </div>
                    <span className="text-xs font-semibold text-slate-400 italic">
                      {activeMatch.teamBNamePlaceholder || "À déterminer"}
                    </span>
                  </div>
                )}

                {/* Team Selection dropdown */}
                <select
                  value={activeMatch.teamBId || ""}
                  onChange={(e) => onUpdateTeams(activeMatch!.id, activeMatch!.teamAId, e.target.value || null)}
                  translate="no"
                  className={`notranslate max-w-[200px] w-full text-center text-xs font-bold rounded-lg px-2.5 py-1.5 bg-slate-950 text-slate-300 border focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-colors ${
                    isTeamBEliminatedConflict ? "border-rose-800 text-rose-300 bg-rose-950/20" : "border-slate-800"
                  }`}
                >
                  <option value="">{activeMatch.teamBNamePlaceholder || "-- Choisir --"}</option>
                  {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"].map((grpLetter) => {
                    const grpTeams = teams.filter(
                      (t) => t.group === grpLetter && (!t.eliminated || t.id === activeMatch!.teamBId)
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
                  <span className="text-xs text-rose-400 font-semibold mt-1">Équipe éliminée !</span>
                )}

                {/* Cards inputs (Yellow / Red) */}
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 w-full max-w-[180px] space-y-2">
                  <div className="text-[10px] font-bold text-slate-500 text-center uppercase tracking-wide">Cartons Équipe B</div>
                  <div className="flex items-center justify-around gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-4 bg-amber-400 rounded-sm shadow" title="Cartons jaunes"></div>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={activeMatch.yellowCardsB ?? ""}
                        onChange={(e) => {
                          const val = e.target.value === "" ? null : Math.max(0, parseInt(e.target.value) || 0);
                          onUpdateCards(activeMatch!.id, "yellow", "B", val);
                        }}
                        className="w-10 bg-slate-950 border border-slate-800 rounded font-mono font-bold text-xs text-slate-100 text-center py-1 focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-4 bg-rose-600 rounded-sm shadow" title="Cartons rouges"></div>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={activeMatch.redCardsB ?? ""}
                        onChange={(e) => {
                          const val = e.target.value === "" ? null : Math.max(0, parseInt(e.target.value) || 0);
                          onUpdateCards(activeMatch!.id, "red", "B", val);
                        }}
                        className="w-10 bg-slate-950 border border-slate-800 rounded font-mono font-bold text-xs text-slate-100 text-center py-1 focus:border-rose-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Check status info success messages on live score */}
            {activeMatch.scoreA !== null && activeMatch.scoreB !== null && (
              <div className="mt-4 p-3 bg-emerald-950/30 border border-emerald-900/40 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Match mis à jour avec succès. Le score de <strong>{activeMatch.scoreA} - {activeMatch.scoreB}</strong> est répercuté en direct dans le calendrier et le classement.
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-slate-850 p-8 rounded-2xl text-center text-slate-400">
          <p>Aucune rencontre disponible pour la période sélectionnée.</p>
        </div>
      )}
    </div>
  );
}
