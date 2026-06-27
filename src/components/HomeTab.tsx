import React, { useState, useEffect } from "react";
import { Team, Match, Stage } from "../types";
import { Clock, Calendar, Tv, Plus, Minus, Trash2, HelpCircle, Flame, CheckCircle2, Eye, EyeOff } from "lucide-react";
import Flag from "./Flag";

interface HomeTabProps {
  teams: Team[];
  matches: Match[];
  onUpdateScore: (matchId: string, scoreA: number | null, scoreB: number | null) => void;
  onUpdateTeams: (matchId: string, teamAId: string | null, teamBId: string | null) => void;
  onUpdateCards: (matchId: string, type: "yellow" | "red", team: "A" | "B", val: number | null) => void;
  onValidateMatch: (matchId: string) => void;
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
  onValidateMatch,
}: HomeTabProps) {
  // Heure réelle en France mise à jour en temps réel
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  const [skippedMatchIds, setSkippedMatchIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("skipped_matches");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  // État pour masquer ou afficher chaque rencontre
  const [collapsedMatchIds, setCollapsedMatchIds] = useState<Record<number, boolean>>({});

  // Si tous les matchs ont des scores nuls (après réinitialisation), on vide les matchs ignorés
  useEffect(() => {
    const hasAnyScore = matches.some(m => m.scoreA !== null || m.scoreB !== null);
    if (!hasAnyScore && skippedMatchIds.length > 0) {
      setSkippedMatchIds([]);
      localStorage.removeItem("skipped_matches");
    }
  }, [matches, skippedMatchIds]);

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

  // Est-ce qu'il reste d'autres rencontres programmées dans le futur (non ignorées) ?
  const hasFutureMatches = sortedMatchesWithDate.some(
    ({ match, dateObj }) => dateObj.getTime() > nowMs && !skippedMatchIds.includes(match.id)
  );

  // SELECTION DES RENCONTRES ACTIVES
  // Une rencontre reste affichée en haut (dans l'accueil) si :
  // - Elle a déjà commencé (dateObj.getTime() <= nowMs)
  // - ET son coup d'envoi a eu lieu il y a moins de 5 heures (nowMs - dateObj.getTime() < 5h)
  // - ET elle n'a pas été ignorée par l'utilisateur (non présente dans skippedMatchIds)
  const cutoff5HoursMs = 5 * 60 * 60 * 1000;
  
  const activeOngoing = sortedMatchesWithDate.filter(({ match, dateObj }) => {
    const timeSinceStart = nowMs - dateObj.getTime();
    return timeSinceStart >= 0 && timeSinceStart < cutoff5HoursMs && !skippedMatchIds.includes(match.id);
  });

  // On peut également afficher les rencontres qui vont commencer dans moins de 15 minutes
  const activeImminent = sortedMatchesWithDate.filter(({ match, dateObj }) => {
    const timeToStart = dateObj.getTime() - nowMs;
    return timeToStart > 0 && timeToStart <= 15 * 60 * 1000 && !skippedMatchIds.includes(match.id);
  });

  // Combiner les rencontres en cours et imminentes
  let displayMatches = [...activeOngoing, ...activeImminent];

  // Si aucune rencontre n'est actuellement en cours ou imminente :
  if (displayMatches.length === 0) {
    // Trouver les prochaines rencontres à venir dans le futur (non ignorées)
    const upcoming = sortedMatchesWithDate.filter(({ match, dateObj }) => dateObj.getTime() > nowMs && !skippedMatchIds.includes(match.id));
    if (upcoming.length > 0) {
      // On affiche toutes les rencontres qui commencent au même moment le plus proche
      const earliestTime = upcoming[0].dateObj.getTime();
      displayMatches = upcoming.filter(({ dateObj }) => dateObj.getTime() === earliestTime);
    } else {
      // S'il n'y a plus aucun match futur ou s'ils sont tous ignorés, on affiche le ou les derniers matchs joués
      if (sortedMatchesWithDate.length > 0) {
        const lastTime = sortedMatchesWithDate[sortedMatchesWithDate.length - 1].dateObj.getTime();
        displayMatches = sortedMatchesWithDate.filter(({ dateObj }) => dateObj.getTime() === lastTime);
      }
    }
  }

  // Finaliser la liste des matchs actifs à afficher
  const activeMatches: Match[] = displayMatches.map(d => d.match);

  const finishedWithoutScore = sortedMatchesWithDate.filter(
      ({ match, dateObj }) => (dateObj.getTime() + cutoff5HoursMs) <= nowMs && (match.scoreA === null || match.scoreB === null || !match.validated)
  ).map(d => d.match);

  let statusText = "";
  let isLive = false;

  if (activeMatches.length > 0) {
    const matchesWithDates = activeMatches.map(match => {
      const d = sortedMatchesWithDate.find(item => item.match.id === match.id);
      return {
        match,
        startMs: d ? d.dateObj.getTime() : 0,
        endMs: d ? d.dateObj.getTime() + matchDurationMs : 0
      };
    });

    const anyLive = matchesWithDates.some(m => nowMs >= m.startMs && nowMs <= m.endMs);
    const allFuture = matchesWithDates.every(m => nowMs < m.startMs);
    const isPlural = activeMatches.length > 1;

    if (anyLive) {
      statusText = isPlural ? "RENCONTRES ACTUELLEMENT EN COURS" : "RENCONTRE ACTUELLEMENT EN COURS";
      isLive = true;
    } else if (allFuture) {
      statusText = isPlural ? "PROCHAINES RENCONTRES À VENIR" : "PROCHAINE RENCONTRE À VENIR";
      isLive = false;
    } else {
      const allScoresEntered = activeMatches.every(m => m.scoreA !== null && m.scoreB !== null);
      if (allScoresEntered) {
        statusText = isPlural ? "RENCONTRES TERMINÉES" : "RENCONTRE TERMINÉE";
      } else {
        statusText = isPlural ? "RENCONTRES EN ATTENTE DE SAISIE DES SCORES" : "RENCONTRE EN ATTENTE DE SAISIE DU SCORE";
      }
      isLive = false;
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
      {finishedWithoutScore.length > 0 && (
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between pl-1 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-4 bg-rose-500 rounded"></span>
              <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider">
                Rencontres terminées (Saisie requise)
              </h3>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {finishedWithoutScore.map((match) => {
              const matchTeamA = match.teamAId ? teamsMap.get(match.teamAId) : null;
              const matchTeamB = match.teamBId ? teamsMap.get(match.teamBId) : null;

              return (
                <div key={match.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col gap-4">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>Match #{match.matchNumber} • {match.stage} {match.group ? `• Groupe ${match.group}` : ""}</span>
                    <span>{match.date} • {match.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Flag emoji={matchTeamA?.flag || ""} name={matchTeamA?.name || ""} className="w-6 h-6" />
                      <span className="font-bold text-slate-200">{matchTeamA?.name || "?"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="number" min="0" className="w-12 bg-slate-950 border border-slate-800 rounded font-bold text-center py-1" value={match.scoreA ?? ""} onChange={(e) => {
                          const val = e.target.value;
                          onUpdateScore(match.id, val === "" ? null : parseInt(val, 10), match.scoreB);
                        }} />
                        <span className="text-slate-600">:</span>
                        <input type="number" min="0" className="w-12 bg-slate-950 border border-slate-800 rounded font-bold text-center py-1" value={match.scoreB ?? ""} onChange={(e) => {
                          const val = e.target.value;
                          onUpdateScore(match.id, match.scoreA, val === "" ? null : parseInt(val, 10));
                        }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{matchTeamB?.name || "?"}</span>
                      <Flag emoji={matchTeamB?.flag || ""} name={matchTeamB?.name || ""} className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center gap-4 text-[10px] text-slate-500 pt-2 border-t border-slate-800">
                    <div className="flex gap-2">
                      <span className="flex items-center gap-1">Cartons A:</span>
                      <input type="number" min="0" className="w-10 bg-slate-950 border border-slate-800 rounded text-center" value={match.yellowCardsA ?? ""} onChange={(e) => onUpdateCards(match.id, "yellow", "A", parseInt(e.target.value) || null)} placeholder="J" title="Jaunes" />
                      <input type="number" min="0" className="w-10 bg-slate-950 border border-slate-800 rounded text-center" value={match.redCardsA ?? ""} onChange={(e) => onUpdateCards(match.id, "red", "A", parseInt(e.target.value) || null)} placeholder="R" title="Rouges" />
                    </div>
                    <div className="flex gap-2">
                      <span className="flex items-center gap-1">Cartons B:</span>
                      <input type="number" min="0" className="w-10 bg-slate-950 border border-slate-800 rounded text-center" value={match.yellowCardsB ?? ""} onChange={(e) => onUpdateCards(match.id, "yellow", "B", parseInt(e.target.value) || null)} placeholder="J" title="Jaunes" />
                      <input type="number" min="0" className="w-10 bg-slate-950 border border-slate-800 rounded text-center" value={match.redCardsB ?? ""} onChange={(e) => onUpdateCards(match.id, "red", "B", parseInt(e.target.value) || null)} placeholder="R" title="Rouges" />
                    </div>
                  </div>
                  <button
                    onClick={() => onValidateMatch(match.id)}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 rounded-lg transition-all"
                  >
                    Envoyer au calendrier
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {activeMatches.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between pl-1 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-4 bg-emerald-500 rounded"></span>
              <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider">
                {statusText}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {activeMatches.map((match) => {
              const matchTeamA = match.teamAId ? teamsMap.get(match.teamAId) : null;
              const matchTeamB = match.teamBId ? teamsMap.get(match.teamBId) : null;
              const isTeamAEliminated = matchTeamA?.eliminated;
              const isTeamBEliminated = matchTeamB?.eliminated;
              const isCollapsed = collapsedMatchIds[match.id] !== false;

              return (
                <div
                  key={match.id}
                  id={`home-focus-match-card-${match.id}`}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between"
                >
                  {/* Visual shine card accent */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${isLive ? 'bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500' : 'bg-gradient-to-r from-emerald-500 to-blue-600'}`}></div>

                  {/* Match Header metadata */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center text-xs text-slate-400 border-b border-slate-800/80 pb-3.5 mb-5 mt-1 gap-3">
                    <span className="font-mono bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg text-slate-300 font-bold self-start sm:self-auto">
                      Match #{match.matchNumber} • {match.stage}
                      {match.group ? ` • Groupe ${match.group}` : ""}
                    </span>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Bouton de masquage / affichage */}
                      <button
                        onClick={() => {
                          setCollapsedMatchIds(prev => ({
                            ...prev,
                            [match.id]: isCollapsed ? false : true
                          }));
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-emerald-400 transition-all font-extrabold text-[11px] cursor-pointer"
                        title={isCollapsed ? "Dérouler la rencontre" : "Masquer la rencontre"}
                      >
                        {isCollapsed ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Voir</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                            <span>Masquer</span>
                          </>
                        )}
                      </button>

                      <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                        <Calendar className="w-4 h-4 text-emerald-500" />
                        {match.date}
                      </span>

                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold ${getChannelStyle(match.channel)}`}>
                        <Tv className="w-3.5 h-3.5" />
                        {match.channel}
                      </span>
                    </div>
                  </div>

                  {isCollapsed ? (
                    /* Vue compacte (masquée) */
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 bg-slate-950/40 rounded-xl border border-slate-850/60">
                      {/* Équipe A compacte */}
                      <div className="flex items-center gap-2.5 min-w-[140px] sm:min-w-[180px] justify-center sm:justify-start">
                        {matchTeamA ? (
                          <>
                            <Flag emoji={matchTeamA.flag} name={matchTeamA.name} className="w-7 h-7" />
                            <span className="text-sm font-bold text-slate-200">{matchTeamA.name}</span>
                          </>
                        ) : (
                          <>
                            <div className="w-7 h-7 rounded-full bg-slate-950 flex items-center justify-center border border-dashed border-slate-800">
                              <HelpCircle className="w-4 h-4 text-slate-600" />
                            </div>
                            <span className="text-xs text-slate-400 italic">{match.teamANamePlaceholder || "À déterminer"}</span>
                          </>
                        )}
                      </div>

                      {/* Score compact au centre */}
                      <div className="flex items-center gap-3 px-4 py-1.5 bg-slate-950 rounded-xl border border-slate-800/80 shadow-inner">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">{match.time}</span>
                        <div className="h-3.5 w-[1px] bg-slate-800"></div>
                        <span className="text-lg font-mono font-black text-emerald-400">
                          {match.scoreA !== null ? match.scoreA : "-"}
                        </span>
                        <span className="text-slate-600 font-bold">:</span>
                        <span className="text-lg font-mono font-black text-emerald-400">
                          {match.scoreB !== null ? match.scoreB : "-"}
                        </span>
                      </div>

                      {/* Équipe B compacte */}
                      <div className="flex items-center gap-2.5 min-w-[140px] sm:min-w-[180px] justify-center sm:justify-end">
                        {matchTeamB ? (
                          <>
                            <span className="text-sm font-bold text-slate-200">{matchTeamB.name}</span>
                            <Flag emoji={matchTeamB.flag} name={matchTeamB.name} className="w-7 h-7" />
                          </>
                        ) : (
                          <>
                            <span className="text-xs text-slate-400 italic">{match.teamBNamePlaceholder || "À déterminer"}</span>
                            <div className="w-7 h-7 rounded-full bg-slate-950 flex items-center justify-center border border-dashed border-slate-800">
                              <HelpCircle className="w-4 h-4 text-slate-600" />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Vue complète (déroulée) */
                    <>
                      {/* Core Match Row displaying Team A vs Team B */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 landscape:grid-cols-3 gap-6 items-center py-2">
                        
                        {/* Team A Input & Flag Column */}
                        <div className="flex flex-col items-center text-center space-y-3.5">
                          {matchTeamA ? (
                            <div className="flex flex-col items-center">
                              <Flag emoji={matchTeamA.flag} name={matchTeamA.name} className="w-16 h-16 mb-2.5 drop-shadow-xl animate-fade-in" />
                              <span className="text-md font-bold text-slate-100">{matchTeamA.name}</span>
                              <span className="text-[10px] text-slate-400 mt-1 font-mono uppercase bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                Rang FIFA: #{matchTeamA.fifaRanking || "N/A"}
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <div className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center border border-dashed border-slate-800 mb-2.5">
                                <HelpCircle className="w-7 h-7 text-slate-600" />
                              </div>
                              <span className="text-xs font-semibold text-slate-400 italic">
                                {match.teamANamePlaceholder || "À déterminer"}
                              </span>
                            </div>
                          )}

                          {/* Team Selection drop down in case they aren't seeded yet */}
                          <select
                            value={match.teamAId || ""}
                            onChange={(e) => onUpdateTeams(match.id, e.target.value || null, match.teamBId)}
                            translate="no"
                            className={`notranslate max-w-[200px] w-full text-center text-xs font-bold rounded-lg px-2.5 py-1.5 bg-slate-950 text-slate-300 border focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-colors ${
                              isTeamAEliminated ? "border-rose-800 text-rose-300 bg-rose-950/20" : "border-slate-800"
                            }`}
                          >
                            <option value="">{match.teamANamePlaceholder || "-- Choisir --"}</option>
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
                          {isTeamAEliminated && (
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
                                  value={match.yellowCardsA ?? ""}
                                  onChange={(e) => {
                                    const val = e.target.value === "" ? null : Math.max(0, parseInt(e.target.value) || 0);
                                    onUpdateCards(match.id, "yellow", "A", val);
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
                                  value={match.redCardsA ?? ""}
                                  onChange={(e) => {
                                    const val = e.target.value === "" ? null : Math.max(0, parseInt(e.target.value) || 0);
                                    onUpdateCards(match.id, "red", "A", val);
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
                            HEURE DU COUP D'ENVOI: {match.time}
                          </span>

                          <div className="flex items-center bg-slate-950 border-2 border-slate-800 rounded-2xl p-2 sm:p-3 shadow-2xl">
                            {/* Team A controls */}
                            <div className="flex flex-col items-center px-4 sm:px-6">
                              <button
                                onClick={() => adjustScore(match, "A", "inc")}
                                className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-emerald-400 hover:border-emerald-900 active:bg-emerald-950/30 transition-all cursor-pointer"
                                title="Plus"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                              <span className="text-3xl sm:text-4xl font-mono font-black text-slate-100 py-1.5 select-none">
                                {match.scoreA !== null ? match.scoreA : "-"}
                              </span>
                              <button
                                onClick={() => adjustScore(match, "A", "dec")}
                                className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-rose-400 hover:border-rose-950 active:bg-rose-950/30 transition-all cursor-pointer disabled:opacity-35"
                                disabled={match.scoreA === null || match.scoreA === 0}
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
                                onClick={() => adjustScore(match, "B", "inc")}
                                className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-emerald-400 hover:border-emerald-900 active:bg-emerald-950/30 transition-all cursor-pointer"
                                title="Plus"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                              <span className="text-3xl sm:text-4xl font-mono font-black text-slate-100 py-1.5 select-none">
                                {match.scoreB !== null ? match.scoreB : "-"}
                              </span>
                              <button
                                onClick={() => adjustScore(match, "B", "dec")}
                                className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-rose-400 hover:border-rose-950 active:bg-rose-950/30 transition-all cursor-pointer disabled:opacity-35"
                                disabled={match.scoreB === null || match.scoreB === 0}
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
                            {(match.scoreA !== null || match.scoreB !== null) && (
                              <button
                                onClick={() => onUpdateScore(match.id, null, null)}
                                className="mx-auto text-xs text-rose-400/90 hover:text-rose-400 flex items-center justify-center gap-1 font-bold transition-all px-3 py-1.5 bg-rose-950/20 hover:bg-rose-950/40 rounded-lg border border-rose-900/45 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Effacer le score du match
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Team B Input & Flag Column */}
                        <div className="flex flex-col items-center text-center space-y-3.5 border-t sm:border-t-0 landscape:border-t-0 border-slate-800/50 pt-5 sm:pt-0 landscape:pt-0">
                          {matchTeamB ? (
                            <div className="flex flex-col items-center">
                              <Flag emoji={matchTeamB.flag} name={matchTeamB.name} className="w-16 h-16 mb-2.5 drop-shadow-xl animate-fade-in" />
                              <span className="text-md font-bold text-slate-100">{matchTeamB.name}</span>
                              <span className="text-[10px] text-slate-400 mt-1 font-mono uppercase bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                Rang FIFA: #{matchTeamB.fifaRanking || "N/A"}
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <div className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center border border-dashed border-slate-800 mb-2.5">
                                <HelpCircle className="w-7 h-7 text-slate-600" />
                              </div>
                              <span className="text-xs font-semibold text-slate-400 italic">
                                {match.teamBNamePlaceholder || "À déterminer"}
                              </span>
                            </div>
                          )}

                          {/* Team Selection dropdown */}
                          <select
                            value={match.teamBId || ""}
                            onChange={(e) => onUpdateTeams(match.id, match.teamAId, e.target.value || null)}
                            translate="no"
                            className={`notranslate max-w-[200px] w-full text-center text-xs font-bold rounded-lg px-2.5 py-1.5 bg-slate-950 text-slate-300 border focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-colors ${
                              isTeamBEliminated ? "border-rose-800 text-rose-300 bg-rose-950/20" : "border-slate-800"
                            }`}
                          >
                            <option value="">{match.teamBNamePlaceholder || "-- Choisir --"}</option>
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
                          {isTeamBEliminated && (
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
                                  value={match.yellowCardsB ?? ""}
                                  onChange={(e) => {
                                    const val = e.target.value === "" ? null : Math.max(0, parseInt(e.target.value) || 0);
                                    onUpdateCards(match.id, "yellow", "B", val);
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
                                  value={match.redCardsB ?? ""}
                                  onChange={(e) => {
                                    const val = e.target.value === "" ? null : Math.max(0, parseInt(e.target.value) || 0);
                                    onUpdateCards(match.id, "red", "B", val);
                                  }}
                                  className="w-10 bg-slate-950 border border-slate-800 rounded font-mono font-bold text-xs text-slate-100 text-center py-1 focus:border-rose-500 focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </>
                  )}

                  {/* Check status info success messages on live score */}
                  {match.scoreA !== null && match.scoreB !== null && !isCollapsed && (
                    <div className="mt-4 p-3 bg-emerald-950/30 border border-emerald-900/40 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        Match mis à jour avec succès. Le score de <strong>{match.scoreA} - {match.scoreB}</strong> est répercuté en direct dans le calendrier et le classement.
                      </span>
                    </div>
                  )}

                  {/* Bouton Prochaine Rencontre individuel si les scores de cette rencontre spécifique sont saisis */}
                  {match.scoreA !== null && match.scoreB !== null && hasFutureMatches && (
                    <div className="mt-4 pt-3 border-t border-slate-800/60 flex justify-end">
                      <button
                        onClick={() => {
                          const updated = [...skippedMatchIds, match.id];
                          setSkippedMatchIds(updated);
                          localStorage.setItem("skipped_matches", JSON.stringify(updated));
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 hover:text-slate-900 font-extrabold text-xs px-4 py-2 rounded-xl shadow-md hover:shadow-emerald-900/20 transition-all flex items-center gap-1.5 cursor-pointer border border-emerald-500/30"
                        title="Passer cette rencontre et afficher la suite"
                      >
                        Prochaine rencontre ➔
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
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
