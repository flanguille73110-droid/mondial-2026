import React, { useMemo, useState } from "react";
import { Team, Match, Stage } from "../types";
import Flag from "./Flag";
import { Trophy, HelpCircle, ShieldAlert, Award, Search } from "lucide-react";

interface StandingsProps {
  teams: Team[];
  matches: Match[];
  onToggleEliminated: (teamId: string) => void;
}

interface TeamStats {
  id: string;
  name: string;
  flag: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  yellowCards: number;
  redCards: number;
  fairPlayPenalty: number;
  fifaRanking: number;
  points: number;
  eliminated: boolean;
}

// Complete updated FIFA rankings lookup map for 2026 teams
const FIFA_RANKINGS: Record<string, number> = {
  ARG: 1, FRA: 2, BEL: 3, ENG: 4, BRA: 5, POR: 6, NED: 7, ESP: 8, CRO: 10, USA: 11,
  MAR: 12, COL: 13, URU: 14, MEX: 15, GER: 16, SEN: 17, JPN: 18, SUI: 19, IRN: 20, KOR: 22,
  AUS: 24, AUT: 25, TUR: 26, SWE: 28, ECU: 31, CZE: 36, EGY: 37, CIV: 38, SCO: 39, CAN: 40,
  TUN: 41, ALG: 43, PAN: 44, QAT: 46, NOR: 47, KSA: 53, PAR: 56, IRQ: 58, RSA: 59, COD: 61,
  UZB: 64, CPV: 65, GHA: 68, JOR: 71, BIH: 74, HAI: 85, CUW: 86, NZL: 107
};

export default function Standings({ teams, matches, onToggleEliminated }: StandingsProps) {
  const [selectedGroup, setSelectedGroup] = useState<string>("ALL");
  const [rankingMode, setRankingMode] = useState<"GROUP" | "GLOBAL" | "THIRD_PLACES">("GROUP");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const groupsList = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

  // Compute stats on the fly based on matches played in Stage.GROUPS
  const groupStandings = useMemo(() => {
    // 1. Initialize stats for all teams
    const statsMap = new Map<string, TeamStats>();
    teams.forEach((t) => {
      statsMap.set(t.id, {
        id: t.id,
        name: t.name,
        flag: t.flag,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDiff: 0,
        yellowCards: 0,
        redCards: 0,
        fairPlayPenalty: 0,
        fifaRanking: t.fifaRanking !== undefined ? t.fifaRanking : (FIFA_RANKINGS[t.id] || 99),
        points: 0,
        eliminated: t.eliminated,
      });
    });

    // 2. Accumulate match results
    const groupMatches = matches.filter((m) => m.stage === Stage.GROUPS);
    groupMatches.forEach((m) => {
      if (m.scoreA !== null && m.scoreB !== null) {
        const teamA = statsMap.get(m.teamAId || "");
        const teamB = statsMap.get(m.teamBId || "");

        if (teamA) {
          teamA.played += 1;
          teamA.goalsFor += m.scoreA;
          teamA.goalsAgainst += m.scoreB;
          teamA.yellowCards += m.yellowCardsA || 0;
          teamA.redCards += m.redCardsA || 0;

          if (m.scoreA > m.scoreB) {
            teamA.wins += 1;
            teamA.points += 3;
          } else if (m.scoreA === m.scoreB) {
            teamA.draws += 1;
            teamA.points += 1;
          } else {
            teamA.losses += 1;
          }
        }

        if (teamB) {
          teamB.played += 1;
          teamB.goalsFor += m.scoreB;
          teamB.goalsAgainst += m.scoreA;
          teamB.yellowCards += m.yellowCardsB || 0;
          teamB.redCards += m.redCardsB || 0;

          if (m.scoreB > m.scoreA) {
            teamB.wins += 1;
            teamB.points += 3;
          } else if (m.scoreB === m.scoreA) {
            teamB.draws += 1;
            teamB.points += 1;
          } else {
            teamB.losses += 1;
          }
        }
      }
    });

    // Calculate dynamic properties
    statsMap.forEach((s) => {
      s.goalDiff = s.goalsFor - s.goalsAgainst;
      // Fair Play Rule: jaunes = 1, rouges = 3
      s.fairPlayPenalty = s.yellowCards * 1 + s.redCards * 3;
    });

    // Group the computed stats by group letter
    const standingsByGroup: Record<string, TeamStats[]> = {};
    groupsList.forEach((letter) => {
      // Find teams belonging to this group
      const groupTeams = teams.filter((t) => t.group === letter);
      const teamStats = groupTeams.map((t) => statsMap.get(t.id)!).filter(Boolean);

      // Sort according to World Cup tiebreaker rules:
      // 1. Points
      // 2. Goal Difference
      // 3. Fair-play (fewer cards, so lower penalty)
      // 4. FIFA rank (lower number = better)
      teamStats.sort((x, y) => {
        // Points diff
        if (y.points !== x.points) {
          return y.points - x.points;
        }
        // Goal difference diff
        if (y.goalDiff !== x.goalDiff) {
          return y.goalDiff - x.goalDiff;
        }
        // Fair Play penalty diff (lower is better, so x - y)
        if (x.fairPlayPenalty !== y.fairPlayPenalty) {
          return x.fairPlayPenalty - y.fairPlayPenalty;
        }
        // FIFA ranking diff (lower number is better rank, so x - y)
        return x.fifaRanking - y.fifaRanking;
      });

      standingsByGroup[letter] = teamStats;
    });

    return standingsByGroup;
  }, [teams, matches]);
  
  const thirdPlacesStandings = useMemo(() => {
    const thirds: (TeamStats & { group: string })[] = [];
    groupsList.forEach(grp => {
      const stats = groupStandings[grp];
      if (stats && stats.length >= 3) {
        thirds.push({...stats[2], group: grp});
      }
    });
    
    thirds.sort((x, y) => {
      if (y.points !== x.points) return y.points - x.points;
      if (y.goalDiff !== x.goalDiff) return y.goalDiff - x.goalDiff;
      if (y.goalsFor !== x.goalsFor) return y.goalsFor - x.goalsFor;
      if (x.fairPlayPenalty !== y.fairPlayPenalty) return x.fairPlayPenalty - y.fairPlayPenalty;
      return x.fifaRanking - y.fifaRanking;
    });
    return thirds;
  }, [groupStandings]);

  // Compute global standings of all teams
  const globalStandings = useMemo(() => {
    const stats: (TeamStats & { group: string })[] = [];
    teams.forEach((t) => {
      const groupList = groupStandings[t.group || ""] || [];
      const teamStat = groupList.find((s) => s.id === t.id);
      if (teamStat) {
        stats.push({
          ...teamStat,
          group: t.group || "?",
        });
      }
    });

    // Sort globally by Tiebreaker rules: Points, Goal Diff, Goals For, Wins, Fair play, FIFA rank
    stats.sort((x, y) => {
      if (y.points !== x.points) {
        return y.points - x.points;
      }
      if (y.goalDiff !== x.goalDiff) {
        return y.goalDiff - x.goalDiff;
      }
      if (y.goalsFor !== x.goalsFor) {
        return y.goalsFor - x.goalsFor;
      }
      if (y.wins !== x.wins) {
        return y.wins - x.wins;
      }
      if (x.fairPlayPenalty !== y.fairPlayPenalty) {
        return x.fairPlayPenalty - y.fairPlayPenalty;
      }
      return x.fifaRanking - y.fifaRanking;
    });

    return stats;
  }, [teams, groupStandings]);

  // Filter global standings based on search bar
  const filteredGlobalStandings = useMemo(() => {
    if (!searchTerm.trim()) return globalStandings;
    const term = searchTerm.toLowerCase();
    return globalStandings.filter(
      (t) =>
        t.name.toLowerCase().includes(term) ||
        t.id.toLowerCase().includes(term) ||
        t.group.toLowerCase().includes(term)
    );
  }, [globalStandings, searchTerm]);

  // Helper to determine form
  const getTeamForm = (teamId: string) => {
    // Only look at group matches for now as per requirements
    const teamMatches = matches.filter(m => m.stage === Stage.GROUPS && (m.teamAId === teamId || m.teamBId === teamId));
    return teamMatches.map(m => {
      if (m.scoreA === null || m.scoreB === null) return { result: '?', color: 'bg-slate-400' };
      
      const isTeamA = m.teamAId === teamId;
      const score = isTeamA ? m.scoreA : m.scoreB;
      const opponentScore = isTeamA ? m.scoreB : m.scoreA;
      
      if (score > opponentScore) return { result: 'V', color: 'bg-emerald-600' };
      if (score < opponentScore) return { result: 'D', color: 'bg-rose-600' };
      return { result: 'N', color: 'bg-amber-500' };
    });
  };

  const displayedGroups = selectedGroup === "ALL" ? groupsList : [selectedGroup];

  return (
    <div className="space-y-6">
      {/* Sélecteur de mode de classement à 2 positions */}
      <div className="flex justify-center sm:justify-start">
        <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex gap-1 w-full sm:w-auto">
          <button
            onClick={() => setRankingMode("GROUP")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold rounded-lg transition-all ${
              rankingMode === "GROUP"
                ? "bg-slate-800 text-emerald-400 shadow-md border border-slate-700/50"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Par Groupe
          </button>
          <button
            onClick={() => setRankingMode("GLOBAL")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold rounded-lg transition-all ${
              rankingMode === "GLOBAL"
                ? "bg-slate-800 text-emerald-400 shadow-md border border-slate-700/50"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Classement Global
          </button>
          <button
            onClick={() => setRankingMode("THIRD_PLACES")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold rounded-lg transition-all ${
              rankingMode === "THIRD_PLACES"
                ? "bg-slate-800 text-emerald-400 shadow-md border border-slate-700/50"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Classement des 3èmes
          </button>
        </div>
      </div>

      {rankingMode === "GROUP" ? (
        <>
          {/* Group selector */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
            <div className="text-xs font-semibold text-slate-400 mb-2.5 flex items-center gap-1.5 justify-center sm:justify-start">
              <Trophy className="w-4 h-4 text-emerald-400" />
              Filtrer par Groupe :
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1">
              <button
                onClick={() => setSelectedGroup("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  selectedGroup === "ALL"
                    ? "bg-slate-800 text-emerald-400 border-emerald-500/60"
                    : "bg-slate-950/50 text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-950"
                }`}
              >
                Tous les Groupes
              </button>
              {groupsList.map((grp) => (
                <button
                  key={grp}
                  onClick={() => setSelectedGroup(grp)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    selectedGroup === grp
                      ? "bg-slate-800 text-emerald-400 border-emerald-500/60"
                      : "bg-slate-950/50 text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-950"
                  }`}
                >
                  Gr.{" "}
                  <span translate="no" className="notranslate inline-block">
                    {grp}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Rules Explainer */}
          <div className="bg-slate-900/30 border border-slate-800/60 rounded-xl p-3.5 space-y-2">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-500" />
              Règles de calcul et de départage officielles
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-[11px] text-slate-400">
              <div className="bg-slate-950/40 p-2 rounded border border-slate-800/40">
                <span className="font-bold text-slate-200 block mb-0.5">Points de match</span>
                Victoire = 3 pts • Nul = 1 pt • Défaite = 0 pt
              </div>
              <div className="bg-slate-950/40 p-2 rounded border border-slate-800/40">
                <span className="font-bold text-slate-200 block mb-0.5">1er tri : Différence</span>
                Buts marqués - Buts encaissés (Diff.)
              </div>
              <div className="bg-slate-950/40 p-2 rounded border border-slate-800/40">
                <span className="font-bold text-slate-200 block mb-0.5">2e tri : Fair-Play</span>
                Moins de cartons reçus (Jaune = 1 pt, Rouge = 3 pts)
              </div>
              <div className="bg-slate-950/40 p-2 rounded border border-slate-800/40">
                <span className="font-bold text-slate-200 block mb-0.5">3e tri : Classement FIFA</span>
                Rang mondial FIFA officiel (Le meilleur rang l'emporte)
              </div>
            </div>
          </div>

          {/* Action Button to Eliminate 4th Placed Teams */}
          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                const teamsToEliminate: string[] = [];
                groupsList.forEach(grp => {
                  const teamsInGroup = groupStandings[grp];
                  if (teamsInGroup && teamsInGroup.length >= 4) {
                    teamsToEliminate.push(teamsInGroup[3].id); // 4ème position (index 3)
                  }
                });

                let count = 0;
                teamsToEliminate.forEach(teamId => {
                  const team = teams.find(t => t.id === teamId);
                  if (team && !team.eliminated) {
                    onToggleEliminated(teamId);
                    count++;
                  }
                });
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-extrabold bg-rose-650 hover:bg-rose-600 active:bg-rose-700 text-white rounded-xl shadow-md border border-rose-500/20 transition-all hover:scale-[1.01] cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-rose-200" />
              Équipes a éliminées
            </button>
          </div>

          {/* Standings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayedGroups.map((groupLetter) => {
              const groupTeams = groupStandings[groupLetter] || [];
              return (
                <div
                  key={groupLetter}
                  className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 shadow-lg flex flex-col justify-between"
                  id={`group-standing-${groupLetter}`}
                >
                  <div>
                    {/* Header group standing */}
                    <div className="flex justify-between items-center border-b border-slate-800/80 pb-2 mb-3">
                      <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
                        <span className="w-2.5 h-4 bg-emerald-500 rounded-sm"></span>
                        GROUPE{" "}
                        <span translate="no" className="notranslate inline-block">
                          {groupLetter}
                        </span>
                      </h3>
                      <span className="text-[10px] text-slate-500 font-mono font-semibold">
                        Coupe du Monde 2026
                      </span>
                    </div>

                    {/* Table structure */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-sans">
                        <thead>
                          <tr className="text-slate-500 font-bold border-b border-slate-800/40 pb-2">
                            <th className="py-2 pr-1 w-6 text-center">Pos</th>
                            <th className="py-2">Équipe</th>
                            <th className="py-2 text-center w-8" title="Matchs Joués">MJ</th>
                            <th className="py-2 text-center w-10" title="Buts Marqués / Encaissés">Buts</th>
                            <th className="py-2 text-center w-8" title="Différence de buts">Diff</th>
                            <th className="py-2 text-center w-12" title="Cartons jaunes et rouges reçus">Cartons</th>
                            <th className="py-2 text-right w-8 pl-1 font-bold">Pts</th>
                            <th className="py-2 text-center w-16 pl-4">État de forme</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/30">
                          {groupTeams.map((team, idx) => {
                            const rankNumber = idx + 1;
                            // Qualifed if rank 1 or 2
                            const isQualifying = rankNumber <= 2;
                            const form = getTeamForm(team.id);

                            return (
                              <tr
                                key={team.id}
                                className={`hover:bg-slate-800/30 transition-colors ${
                                  team.eliminated ? "opacity-45 line-through decoration-slate-600" : ""
                                }`}
                              >
                                {/* Position */}
                                <td className="py-2.5 w-6 text-center font-mono">
                                  <span
                                    className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                                      isQualifying
                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                        : "bg-slate-950/45 text-slate-400 border border-slate-800/40"
                                    }`}
                                  >
                                    {rankNumber}
                                  </span>
                                </td>

                                {/* Team Name and flag */}
                                <td className="py-2.5 font-medium pr-1">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <Flag emoji={team.flag} name={team.name} className="w-5 h-5 shrink-0 rounded-sm" />
                                    <span className="truncate text-slate-200 font-semibold" title={team.name}>
                                      {team.name}
                                    </span>
                                  </div>
                                </td>

                                {/* Played */}
                                <td className="py-2.5 text-center font-mono text-slate-300">
                                  {team.played}
                                </td>

                                {/* Goals for-against */}
                                <td className="py-2.5 text-center font-mono text-slate-400 text-[11px]">
                                  {team.goalsFor}:{team.goalsAgainst}
                                </td>

                                {/* Goal difference */}
                                <td
                                  className={`py-2.5 text-center font-mono font-bold text-[11px] ${
                                    team.goalDiff > 0
                                      ? "text-emerald-400"
                                      : team.goalDiff < 0
                                      ? "text-rose-400"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {team.goalDiff > 0 ? `+${team.goalDiff}` : team.goalDiff}
                                </td>

                                {/* Yellow / Red Cards with small visually accurate indicators */}
                                <td className="py-2.5 text-center">
                                  <div className="flex items-center justify-center gap-1.5 font-mono text-[10px] text-slate-400">
                                    <span className="inline-flex items-center gap-0.5" title={`${team.yellowCards} Cartons jaunes`}>
                                      <span className="w-1.5 h-2.5 bg-amber-400 rounded-sm inline-block"></span>
                                      {team.yellowCards}
                                    </span>
                                    <span className="inline-flex items-center gap-0.5" title={`${team.redCards} Cartons rouges`}>
                                      <span className="w-1.5 h-2.5 bg-rose-600 rounded-sm inline-block"></span>
                                      {team.redCards}
                                    </span>
                                  </div>
                                </td>

                                {/* Points! */}
                                <td className="py-2.5 text-right pl-1 font-mono font-extrabold text-sm text-emerald-400">
                                  {team.points}
                                </td>
                                
                                {/* Form */}
                                <td className="py-2.5 text-center pl-4">
                                  <div className="flex justify-center gap-1">
                                    {form.map((f, i) => (
                                      <span
                                        key={i}
                                        className={`text-[10px] w-4 h-4 flex items-center justify-center font-bold text-white rounded ${f.color}`}
                                      >
                                        {f.result}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Card Footer indicator for qualification */}
                  <div className="mt-3 pt-2 border-t border-slate-800/40 flex justify-between items-center text-[10px] text-slate-500 font-sans">
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Top 2 qualifiés
                    </span>
                    <span className="font-mono text-slate-600">
                      Rangs FIFA : {groupTeams.map(t => `${t.id}:${t.fifaRanking}`).join(" • ")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : rankingMode === "THIRD_PLACES" ? (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 sm:p-5 shadow-lg flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <h3 className="text-sm font-extrabold text-slate-100">
              CLASSEMENT DES 3ÈMES (Qualifiés si dans le Top 8)
            </h3>
            <button
              onClick={() => {
                const teamsToEliminate = thirdPlacesStandings.slice(8, 12);
                teamsToEliminate.forEach(teamStats => {
                  const originalTeam = teams.find(t => t.id === teamStats.id);
                  if (originalTeam && !originalTeam.eliminated) {
                    onToggleEliminated(originalTeam.id);
                  }
                });
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-xs font-extrabold bg-rose-650 hover:bg-rose-600 active:bg-rose-700 text-white rounded-xl shadow-md border border-rose-500/20 transition-all hover:scale-[1.01] cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-rose-200" />
              Éliminé de 9 à 12
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans whitespace-nowrap">
              <thead>
                <tr className="text-slate-400 font-bold border-b border-slate-800/50 pb-2.5 text-[11px]">
                  <th className="py-3 px-2 w-12 text-center">Rang</th>
                  <th className="py-3 px-2">Équipe</th>
                  <th className="py-3 px-2 text-center">Groupe</th>
                  <th className="py-3 px-2 text-center">MJ</th>
                  <th className="py-3 px-2 text-center">G-N-P</th>
                  <th className="py-3 px-2 text-center">Buts</th>
                  <th className="py-3 px-2 text-center">Diff</th>
                  <th className="py-3 px-2 text-center">Cartons</th>
                  <th className="py-3 px-2 text-center">Rank FIFA</th>
                  <th className="py-3 px-2 text-right">Pts</th>
                  <th className="py-3 px-2 text-center">État de forme</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/20">
                {thirdPlacesStandings.map((team, idx) => (
                  <tr key={team.id} className={idx < 8 ? "bg-emerald-950/20" : ""}>
                    <td className="py-3 px-2 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-bold ${idx < 8 ? "border-2 border-emerald-500 text-emerald-400" : "text-slate-400"}`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-2 flex items-center gap-2">
                      <Flag emoji={team.flag} name={team.name} className="w-5 h-5 rounded-sm" />
                      {team.name}
                    </td>
                    <td className="py-3 px-2 text-center">Gr. {team.group}</td>
                    <td className="py-3 px-2 text-center">{team.played}</td>
                    <td className="py-3 px-2 text-center">{team.wins}-{team.draws}-{team.losses}</td>
                    <td className="py-3 px-2 text-center">{team.goalsFor}:{team.goalsAgainst}</td>
                    <td className="py-3 px-2 text-center">{team.goalDiff}</td>
                    <td className="py-3 px-2 text-center">
                        <div className="flex justify-center gap-1">
                          <span className="text-amber-400">{team.yellowCards}</span>
                          <span className="text-rose-600">{team.redCards}</span>
                        </div>
                    </td>
                    <td className="py-3 px-2 text-center">#{team.fifaRanking}</td>
                    <td className="py-3 px-2 text-right font-bold text-emerald-400">{team.points}</td>
                    <td className="py-3 px-2 text-center">
                      <div className="flex justify-center gap-1">
                        {getTeamForm(team.id).map((f, i) => (
                          <span key={i} className={`text-[10px] w-4 h-4 flex items-center justify-center font-bold text-white rounded ${f.color}`}>
                            {f.result}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          {/* Rules Explainer */}
          <div className="bg-slate-900/30 border border-slate-800/60 rounded-xl p-3.5 space-y-2">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-500" />
              Méthodologie du Classement Global de la Phase de Poules
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Toutes les équipes des 12 groupes (48 pays au total) sont départagées ici selon un classement global unifié.
              Les <strong className="text-emerald-400">32 premières équipes</strong> (les 2 meilleures de chaque groupe ainsi que les 8 meilleurs 3èmes) obtiennent leur qualification virtuelle pour la phase à élimination directe.
            </p>
          </div>

          {/* Global Standings Table container */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 sm:p-5 shadow-lg flex flex-col gap-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-800/80 pb-4">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-100 flex items-center gap-2">
                  <span className="w-2.5 h-5 bg-emerald-500 rounded-sm"></span>
                  CLASSEMENT GÉNÉRAL DES 48 PAYS
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Visualisez la hiérarchie en direct mise à jour selon vos scores saisis
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="Rechercher une équipe..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:outline-none rounded-lg pl-9 pr-8 py-2 text-xs text-slate-300 placeholder-slate-550 transition-colors"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Overall Leaders Table */}
            <div className="overflow-x-auto min-w-full">
              <table className="w-full text-left text-xs font-sans whitespace-nowrap">
                <thead>
                  <tr className="text-slate-400 font-bold border-b border-slate-800/50 pb-2.5 text-[11px]">
                    <th className="py-3 px-2 w-12 text-center">Rang</th>
                    <th className="py-3 px-2">Équipe</th>
                    <th className="py-3 px-2 text-center w-20">Groupe</th>
                    <th className="py-3 px-2 text-center w-12" title="Matchs Joués">MJ</th>
                    <th className="py-3 px-2 text-center w-20" title="Gagnés - Nuls - Perdus">G-N-P</th>
                    <th className="py-3 px-2 text-center w-16" title="Buts Marqués : Buts Encaissés">Buts</th>
                    <th className="py-3 px-2 text-center w-14" title="Différence de buts">Diff</th>
                    <th className="py-3 px-2 text-center w-20" title="Cartons jaunes et rouges">Cartons</th>
                    <th className="py-3 px-2 text-center w-14" title="Classement FIFA Mondial de référence">Rank FIFA</th>
                    <th className="py-3 px-3 text-right w-14 pl-1 font-bold text-emerald-400">Pts</th>
                    <th className="py-3 px-2 text-center">État de forme</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/20">
                  {filteredGlobalStandings.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-8 text-center text-slate-500 font-medium">
                        Aucun résultat pour la recherche "<strong>{searchTerm}</strong>"
                      </td>
                    </tr>
                  ) : (
                    filteredGlobalStandings.map((team) => {
                      const trueRank = globalStandings.findIndex((t) => t.id === team.id) + 1;
                      const isQualifying = trueRank <= 32;
                      const form = getTeamForm(team.id);

                      return (
                        <tr
                          key={team.id}
                          className={`hover:bg-slate-800/25 transition-all duration-150 ${
                            team.eliminated ? "opacity-35 line-through decoration-slate-600" : ""
                          }`}
                        >
                          {/* Rank badge */}
                          <td className="py-2 px-2 text-center font-mono">
                            <span
                              className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-[11px] font-extrabold ${
                                trueRank === 1
                                  ? "bg-amber-400/15 text-amber-400 border border-amber-450"
                                  : trueRank === 2
                                  ? "bg-slate-300/15 text-slate-350 border border-slate-350"
                                  : trueRank === 3
                                  ? "bg-amber-700/15 text-amber-600 border border-amber-750"
                                  : isQualifying
                                  ? "bg-emerald-500/5 text-emerald-400 border border-emerald-500/10"
                                  : "bg-slate-950/65 text-slate-500 border border-slate-850"
                              }`}
                            >
                              {trueRank}
                            </span>
                          </td>

                          {/* Flag & Name */}
                          <td className="py-2.5 px-2 font-medium">
                            <div className="flex items-center gap-2.5">
                              <Flag emoji={team.flag} name={team.name} className="w-5 h-5 shrink-0 rounded-sm" />
                              <span className="text-slate-100 font-semibold">{team.name}</span>
                              {isQualifying && !team.eliminated && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Qualifié virtuel" />
                              )}
                            </div>
                          </td>

                          {/* Group identifier */}
                          <td className="py-2.5 px-2 text-center">
                            <span className="inline-block text-[10px] bg-slate-950 text-slate-400 font-extrabold px-2 py-0.5 rounded border border-slate-850">
                              Groupe{" "}
                              <span translate="no" className="notranslate inline-block">
                                {team.group}
                              </span>
                            </span>
                          </td>

                          {/* Matchs Joués */}
                          <td className="py-2.5 px-2 text-center font-mono text-slate-300">
                            {team.played}
                          </td>

                          {/* Wins / Draws / Losses */}
                          <td className="py-2.5 px-2 text-center font-mono text-slate-400 text-[11px]">
                            {team.wins}-{team.draws}-{team.losses}
                          </td>

                          {/* Goals */}
                          <td className="py-2.5 px-2 text-center font-mono text-slate-450 text-[11px]">
                            {team.goalsFor}:{team.goalsAgainst}
                          </td>

                          {/* Goal Difference */}
                          <td
                            className={`py-2.5 px-2 text-center font-mono font-bold text-[11px] ${
                              team.goalDiff > 0
                                ? "text-emerald-400"
                                : team.goalDiff < 0
                                ? "text-rose-400"
                                : "text-slate-450"
                            }`}
                          >
                            {team.goalDiff > 0 ? `+${team.goalDiff}` : team.goalDiff}
                          </td>

                          {/* Cards indicators */}
                          <td className="py-2.5 px-2 text-center">
                            <div className="flex items-center justify-center gap-2 font-mono text-[10px] text-slate-400">
                              <span className="inline-flex items-center gap-0.5">
                                <span className="w-1.5 h-2.5 bg-amber-400 rounded-sm inline-block"></span>
                                {team.yellowCards}
                              </span>
                              <span className="inline-flex items-center gap-0.5">
                                <span className="w-1.5 h-2.5 bg-rose-600 rounded-sm inline-block"></span>
                                {team.redCards}
                              </span>
                            </div>
                          </td>

                          {/* Rank FIFA */}
                          <td className="py-2.5 px-2 text-center font-mono text-slate-500 text-[11px]">
                            #{team.fifaRanking}
                          </td>

                          {/* Points */}
                          <td className="py-2.5 px-3 text-right font-mono font-extrabold text-sm text-emerald-400">
                            {team.points}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <div className="flex justify-center gap-1">
                              {form.map((f, i) => (
                                <span key={i} className={`text-[10px] w-4 h-4 flex items-center justify-center font-bold text-white rounded ${f.color}`}>
                                  {f.result}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer and Legend info */}
            <div className="mt-2 pt-3 border-t border-slate-800/50 flex flex-wrap gap-4 items-center justify-between text-[11px] text-slate-500">
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-3">
                  <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Rangs 1 à 32 : Qualifiés Virtuels
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                    Rangs 33 à 48 : Éliminés
                  </span>
                </div>
                
                {/* Bouton élimination */}
                <button
                  onClick={() => {
                    const allMatchesPlayed = matches.filter(m => m.stage === Stage.GROUPS).every(m => m.scoreA !== null && m.scoreB !== null);
                    if (!allMatchesPlayed) {
                      alert("Toutes les rencontres de groupes ne sont pas encore remplies.");
                      return;
                    }

                    // Logique pour trouver les 4èmes de chaque groupe
                    // Utiliser groupStandings déjà calculé
                    const teamsToEliminate = new Set<string>();
                    groupsList.forEach(grp => {
                      const teamsInGroup = groupStandings[grp];
                      if (teamsInGroup && teamsInGroup.length >= 4) {
                        teamsToEliminate.add(teamsInGroup[3].id); // 4ème position (index 3)
                      }
                    });

                    // Appeler la fonction pour éliminer ces équipes
                    teamsToEliminate.forEach(teamId => {
                      const team = teams.find(t => t.id === teamId);
                      if (team && !team.eliminated) {
                        onToggleEliminated(teamId);
                      }
                    });
                  }}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-all"
                >
                  Éliminer les équipes 4èmes
                </button>
              </div>
              <span className="font-mono text-[10px] text-slate-600">
                Calculé selon les résultats officiels Mondial 2026
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
