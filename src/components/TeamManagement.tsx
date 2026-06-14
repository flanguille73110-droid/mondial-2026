import React, { useState, useMemo } from "react";
import { Team } from "../types";
import { Search, Ban, CheckCircle, Users, SlidersHorizontal } from "lucide-react";
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
}

export default function TeamManagement({ teams, onToggleEliminated, onChangeGroup }: TeamManagementProps) {
  const [search, setSearch] = useState("");
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

        {/* Stats segment */}
        <div className="flex items-center gap-2 text-xs bg-slate-900/80 border border-slate-800 p-1.5 rounded-lg w-full md:w-auto overflow-x-auto justify-between">
          <span className="px-2.5 py-1 rounded bg-slate-800/80 text-slate-300 font-medium shrink-0">
            Total : <strong className="text-emerald-400">{stats.total}</strong>
          </span>
          <span className="px-2.5 py-1 rounded bg-emerald-900/20 text-emerald-300 font-medium shrink-0">
            Actives : <strong>{stats.active}</strong>
          </span>
          <span className="px-2.5 py-1 rounded bg-rose-950/30 text-rose-300 font-medium shrink-0">
            Éliminées : <strong>{stats.eliminated}</strong>
          </span>
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
                {g === "Tous" ? "Tous les Groupes" : `Groupe ${g}`}
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
                      <span>FIFA #{TEAM_DETAILS[team.id]?.rank || 99}</span>
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
                          className="bg-slate-950 border border-slate-800 rounded px-1 py-0.5 text-[9px] font-bold text-slate-400 focus:outline-none"
                        >
                          {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"].map((g) => (
                            <option key={g} value={g}>{g}</option>
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
