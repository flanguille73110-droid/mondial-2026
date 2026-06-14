import React, { useMemo, useState } from "react";
import { Team, Match, Stage } from "../types";
import Flag from "./Flag";
import { Trophy, HelpCircle, ShieldAlert, Award } from "lucide-react";

interface StandingsProps {
  teams: Team[];
  matches: Match[];
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

export default function Standings({ teams, matches }: StandingsProps) {
  const [selectedGroup, setSelectedGroup] = useState<string>("ALL");

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
        fifaRanking: FIFA_RANKINGS[t.id] || 99,
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

  const displayedGroups = selectedGroup === "ALL" ? groupsList : [selectedGroup];

  return (
    <div className="space-y-6">
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
              Gr. {grp}
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
                    GROUPE {groupLetter}
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
                        <th className="py-2 text-center w-14" title="Gagnés / Nuls / Perdus">G-N-P</th>
                        <th className="py-2 text-center w-10" title="Buts Marqués / Encaissés">Buts</th>
                        <th className="py-2 text-center w-8" title="Différence de buts">Diff</th>
                        <th className="py-2 text-center w-12" title="Cartons jaunes et rouges reçus">Cartons</th>
                        <th className="py-2 text-right w-8 pl-1 font-bold">Pts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/30">
                      {groupTeams.map((team, idx) => {
                        const rankNumber = idx + 1;
                        // Qualifed if rank 1 or 2
                        const isQualifying = rankNumber <= 2;

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

                            {/* G - N - P */}
                            <td className="py-2.5 text-center font-mono text-slate-400 text-[11px]">
                              {team.wins}-{team.draws}-{team.losses}
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
                  Rangs FIFA : {groupTeams.map(t => `${t.id}:${FIFA_RANKINGS[t.id] || 99}`).join(" • ")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
