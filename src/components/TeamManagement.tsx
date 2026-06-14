import React, { useState, useMemo } from "react";
import { Team } from "../types";
import { Search, Ban, CheckCircle, Users, SlidersHorizontal, ArrowUp, ArrowDown, ChevronLeft, ListOrdered } from "lucide-react";
import Flag from "./Flag";

const TEAM_DETAILS: Record<string, { confederation: string; rank: number }> = {
  ARG: { confederation: "CONMEBOL", rank: 1 },
  FRA: { confederation: "UEFA", rank: 2 },
  BEL: { confederation: "UEFA", rank: 3 },
  ENG: { confederation: "UEFA", rank: 4 },
  BRA: { confederation: "CONMEBOL", rank: 5 },
  POR: { confederation: "UEFA", rank: 6 },
  NED: { confederation: "UEFA", rank: 7 },
  ESP: { confederation: "UEFA", rank: 8 },
  CRO: { confederation: "UEFA", rank: 10 },
  USA: { confederation: "CONCACAF", rank: 11 },
  MAR: { confederation: "CAF", rank: 12 },
  COL: { confederation: "CONMEBOL", rank: 13 },
  URU: { confederation: "CONMEBOL", rank: 14 },
  MEX: { confederation: "CONCACAF", rank: 15 },
  GER: { confederation: "UEFA", rank: 16 },
  SEN: { confederation: "CAF", rank: 17 },
  JPN: { confederation: "AFC", rank: 18 },
  SUI: { confederation: "UEFA", rank: 19 },
  IRN: { confederation: "AFC", rank: 20 },
  KOR: { confederation: "AFC", rank: 22 },
  AUS: { confederation: "AFC", rank: 24 },
  AUT: { confederation: "UEFA", rank: 25 },
  TUR: { confederation: "UEFA", rank: 26 },
  SWE: { confederation: "UEFA", rank: 28 },
  ECU: { confederation: "CONMEBOL", rank: 31 },
  CZE: { confederation: "UEFA", rank: 36 },
  EGY: { confederation: "CAF", rank: 37 },
  CIV: { confederation: "CAF", rank: 38 },
  SCO: { confederation: "UEFA", rank: 39 },
  CAN: { confederation: "CONCACAF", rank: 40 },
  TUN: { confederation: "CAF", rank: 41 },
  ALG: { confederation: "CAF", rank: 43 },
  PAN: { confederation: "CONCACAF", rank: 44 },
  QAT: { confederation: "AFC", rank: 46 },
  NOR: { confederation: "UEFA", rank: 47 },
  KSA: { confederation: "AFC", rank: 53 },
  PAR: { confederation: "CONMEBOL", rank: 56 },
  IRQ: { confederation: "AFC", rank: 58 },
  RSA: { confederation: "CAF", rank: 59 },
  COD: { confederation: "CAF", rank: 61 },
  UZB: { confederation: "AFC", rank: 64 },
  CPV: { confederation: "CAF", rank: 65 },
  GHA: { confederation: "CAF", rank: 68 },
  JOR: { confederation: "AFC", rank: 71 },
  BIH: { confederation: "UEFA", rank: 74 },
  HAI: { confederation: "CONCACAF", rank: 85 },
  CUW: { confederation: "CONCACAF", rank: 86 },
  NZL: { confederation: "OFC", rank: 107 }
};

interface TeamManagementProps {
  teams: Team[];
  onToggleEliminated: (teamId: string) => void;
  onChangeGroup: (teamId: string, newGroup: string) => void;
  onUpdateAllTeams: (updatedTeams: Team[]) => void;
}

export default function TeamManagement({ teams, onToggleEliminated, onChangeGroup, onUpdateAllTeams }: TeamManagementProps) {
  const [search, setSearch] = useState("");
  const [searchFifa, setSearchFifa] = useState("");
  const [showFifaRanksView, setShowFifaRanksView] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>("Tous");
  const [sortBy, setSortBy] = useState<"default" | "asc" | "desc">("default");

  const groupsList = ["Tous", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

  // Search, group filtered teams & sorting options
  const filteredTeams = useMemo(() => {
    let result = teams.filter((team) => {
      const matchesSearch = team.name.toLowerCase().includes(search.toLowerCase()) || 
                            team.id.toLowerCase().includes(search.toLowerCase());
      const matchesGroup = selectedGroup === "Tous" || team.group === selectedGroup;
      return matchesSearch && matchesGroup;
    });

    if (sortBy === "asc") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name, "fr"));
    } else if (sortBy === "desc") {
      result = [...result].sort((a, b) => b.name.localeCompare(a.name, "fr"));
    }
    
    return result;
  }, [teams, search, selectedGroup, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const total = teams.length;
    const eliminated = teams.filter((t) => t.eliminated).length;
    const active = total - eliminated;
    return { total, active, eliminated };
  }, [teams]);

  if (showFifaRanksView) {
    const sortedFifaTeams = [...teams].sort(
      (a, b) => (a.fifaRanking ?? 99) - (b.fifaRanking ?? 99)
    );

    const filteredFifaTeams = sortedFifaTeams.filter(
      (t) =>
        t.name.toLowerCase().includes(searchFifa.toLowerCase()) ||
        t.id.toLowerCase().includes(searchFifa.toLowerCase())
    );

    const handleMoveRank = (teamId: string, direction: "up" | "down") => {
      const index = sortedFifaTeams.findIndex((t) => t.id === teamId);
      if (index === -1) return;

      if (direction === "up" && index > 0) {
        const currentTeam = sortedFifaTeams[index];
        const prevTeam = sortedFifaTeams[index - 1];

        const currentRank = currentTeam.fifaRanking ?? 99;
        const prevRank = prevTeam.fifaRanking ?? 99;

        const updated = teams.map((t) => {
          if (t.id === currentTeam.id) return { ...t, fifaRanking: prevRank };
          if (t.id === prevTeam.id) return { ...t, fifaRanking: currentRank };
          return t;
        });
        onUpdateAllTeams(updated);
      } else if (direction === "down" && index < sortedFifaTeams.length - 1) {
        const currentTeam = sortedFifaTeams[index];
        const nextTeam = sortedFifaTeams[index + 1];

        const currentRank = currentTeam.fifaRanking ?? 99;
        const nextRank = nextTeam.fifaRanking ?? 99;

        const updated = teams.map((t) => {
          if (t.id === currentTeam.id) return { ...t, fifaRanking: nextRank };
          if (t.id === nextTeam.id) return { ...t, fifaRanking: currentRank };
          return t;
        });
        onUpdateAllTeams(updated);
      }
    };

    return (
      <div className="bg-slate-950/20 rounded-2xl p-3 sm:p-5 border border-slate-800/80">
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowFifaRanksView(false);
                setSearchFifa("");
              }}
              className="p-2 bg-slate-905 bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition-all cursor-pointer"
              title="Retour aux Équipes"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-100">
                <ListOrdered className="w-5 h-5 text-emerald-500" />
                Rangs FIFA
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Modifiez l'ordre avec les flèches. La mise à jour s'applique instantanément partout de façon dynamique.
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un pays..."
              value={searchFifa}
              onChange={(e) => setSearchFifa(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-500 transition-all outline-none"
            />
          </div>
        </div>

        <div className="p-3 bg-emerald-950/10 border border-emerald-900/20 rounded-xl mb-4 text-xs text-slate-300 leading-relaxed">
          💡 En montant ou descendant les équipes, vous modifiez leur classement de départage pour l'onglet Classement.
        </div>

        <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
          {filteredFifaTeams.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl">
              <p className="text-slate-500 text-xs">Aucune équipe ne correspond.</p>
            </div>
          ) : (
            filteredFifaTeams.map((team) => {
              const globalIdx = sortedFifaTeams.findIndex((t) => t.id === team.id);
              const isFirst = globalIdx === 0;
              const isLast = globalIdx === sortedFifaTeams.length - 1;

              let badgeColor = "bg-slate-950 text-slate-400 border-slate-800/80";
              if (team.fifaRanking === 1) {
                badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold";
              } else if (team.fifaRanking === 2) {
                badgeColor = "bg-slate-200/10 text-slate-200 border-slate-300/20 font-bold";
              } else if (team.fifaRanking === 3) {
                badgeColor = "bg-amber-750/10 text-amber-500 border-amber-700/20 font-bold";
              }

              return (
                <div
                  key={team.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                    team.eliminated
                      ? "bg-slate-950/10 border-rose-950/15 opacity-40 text-slate-500"
                      : "bg-slate-900/40 hover:bg-slate-900/80 border-slate-800/40 text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs shrink-0 ${badgeColor}`}>
                      {team.fifaRanking}
                    </span>

                    <Flag emoji={team.flag} name={team.name} className="w-6.5 h-6.5 rounded shrink-0 shadow-sm" />

                    <div className="min-w-0">
                      <div className="font-bold text-xs flex items-center gap-1.5 truncate">
                        <span>{team.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({team.id})</span>
                      </div>
                      <div className="text-[9px] text-slate-500 font-medium mt-0.5">
                        Groupe {team.group} • {TEAM_DETAILS[team.id]?.confederation || "UEFA"} {team.eliminated && "• Éliminée"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleMoveRank(team.id, "up")}
                      disabled={isFirst}
                      className={`p-2 rounded-lg border transition-all ${
                        isFirst
                          ? "opacity-20 cursor-not-allowed bg-slate-900/10 border-transparent text-slate-650"
                          : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 cursor-pointer active:scale-95"
                      }`}
                      title="Monter d'un rang"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveRank(team.id, "down")}
                      disabled={isLast}
                      className={`p-2 rounded-lg border transition-all ${
                        isLast
                          ? "opacity-20 cursor-not-allowed bg-slate-900/10 border-transparent text-slate-650"
                          : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-rose-450 hover:border-rose-500/30 cursor-pointer active:scale-95"
                      }`}
                      title="Descendre d'un rang"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800/40 flex justify-end">
          <button
            onClick={() => {
              setShowFifaRanksView(false);
              setSearchFifa("");
            }}
            className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Retour aux Équipes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950/20 rounded-2xl p-3 sm:p-5 border border-slate-800/80">
      {/* Title & Stats Ribbon */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-100">
            <Users className="w-5 h-5 text-emerald-500" />
            Équipes du Mondial 2026
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gérez le statut des équipes. Les équipes éliminées disparaissent des sélections de la phase finale.
          </p>
        </div>

        {/* Stats segment and Rangs FIFA CTA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs bg-slate-900/80 border border-slate-800 p-1.5 rounded-lg overflow-x-auto justify-between flex-1 sm:flex-initial">
            <span className="px-2 font-semibold text-slate-450 whitespace-nowrap">Statut :</span>
            <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 font-medium shrink-0">
              Total : <strong className="text-emerald-400">{stats.total}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-900/20 text-emerald-300 font-medium shrink-0">
              Actives : <strong>{stats.active}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-950/30 text-rose-300 font-medium shrink-0">
              Éliminées : <strong>{stats.eliminated}</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowFifaRanksView(true)}
            className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl border border-emerald-500/40 shadow-md shadow-emerald-950/30 transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
          >
            <ListOrdered className="w-4 h-4" />
            <span>Rangs FIFA</span>
          </button>
        </div>
      </div>

      {/* Inputs controls (Search, Group filter & Sort) */}
      <div className="flex flex-col gap-3.5 mb-6">
        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4.5 h-4.5" />
            <input
              type="text"
              placeholder="Rechercher une équipe (ex: France, FRA, Brésil)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <label className="text-xs text-slate-400 font-semibold whitespace-nowrap">Trier par :</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-300 focus:outline-none focus:border-emerald-500/60 transition-colors cursor-pointer"
            >
              <option value="default">Par groupe (Par défaut)</option>
              <option value="asc">Nom (A vers Z)</option>
              <option value="desc">Nom (Z vers A)</option>
            </select>
          </div>
        </div>

        {/* Groups selection tags row (Horizontal scroll on phone) */}
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2 font-medium">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-500" />
            <span>Filtrer par Groupe :</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none-touch -mx-3 px-3">
            {groupsList.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGroup(g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                  selectedGroup === g
                    ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950/40"
                    : "bg-slate-900 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                {g === "Tous" ? (
                  "Tous les Groupes"
                ) : (
                  <>
                    Groupe{" "}
                    <span translate="no" className="notranslate inline-block">
                      {g}
                    </span>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Team Cards */}
      {filteredTeams.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl bg-slate-950/10">
          <p className="text-slate-500 text-sm">Aucune équipe ne correspond à votre recherche.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredTeams.map((team) => (
            <div
              key={team.id}
              onClick={() => onToggleEliminated(team.id)}
              className={`relative cursor-pointer select-none rounded-xl p-3.5 border transition-all flex items-center justify-between gap-3 ${
                team.eliminated
                  ? "bg-slate-950/40 border-rose-950/40 opacity-40 hover:opacity-60 text-slate-500"
                  : "bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 text-slate-100 hover:border-slate-700 shadow-sm"
              }`}
            >
              {/* Flag & Name */}
              <div className="flex items-center gap-2.5 min-w-0">
                <Flag emoji={team.flag} name={team.name} className="w-8 h-8 shrink-0 rounded-md" />
                <div className="min-w-0">
                  <div className="font-bold text-sm truncate">{team.name}</div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase flex flex-col gap-0.5 mt-0.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1 text-slate-400">
                      <span>{TEAM_DETAILS[team.id]?.confederation || "UEFA"}</span>
                      <span className="text-slate-700 font-normal">•</span>
                      <span>FIFA #{team.fifaRanking !== undefined ? team.fifaRanking : (TEAM_DETAILS[team.id]?.rank || 99)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-550 mt-0.5">
                      <span>{team.id}</span>
                      <span className="text-slate-800">•</span>
                      <span className="flex items-center gap-1">
                        Gr. 
                        <select
                          value={team.group}
                          onChange={(e) => {
                            e.stopPropagation();
                            onChangeGroup(team.id, e.target.value);
                          }}
                          translate="no"
                          className="notranslate bg-slate-950 border border-slate-800 rounded px-1 py-0.5 text-[9px] font-bold text-slate-400 focus:outline-none"
                        >
                          {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"].map((g) => (
                            <option key={g} value={g} translate="no" className="notranslate">
                              {g}
                            </option>
                          ))}
                        </select>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Elimination Toggle */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleEliminated(team.id);
                }}
                className={`p-2 rounded-lg transition-colors border ${
                  team.eliminated
                    ? "bg-rose-950/50 text-rose-400 border-rose-900/40"
                    : "bg-slate-800/60 hover:bg-slate-800 text-slate-400 border-slate-700/60"
                }`}
                title={team.eliminated ? "Marquer comme active" : "Marquer comme éliminée"}
              >
                {team.eliminated ? (
                  <Ban className="w-4 h-4 text-rose-500 shrink-0" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-emerald-500/40 hover:text-emerald-500 shrink-0" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
