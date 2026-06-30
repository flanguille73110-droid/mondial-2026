import React from "react";
import { Match, Team } from "../types";
import Flag from "./Flag";

interface TournamentBracketProps {
  matches: Match[];
  teams: Team[];
}

const BracketMatchCard = ({ matchNum, matches, teams }: { matchNum: number; matches: Match[]; teams: Team[] }) => {
  const match = matches.find(m => m.matchNumber === matchNum);
  if (!match) return <div className="w-48 h-[76px] bg-slate-900/40 border border-slate-800/80 rounded-xl" />;

  const teamA = match.teamAId ? teams.find(t => t.id === match.teamAId) : null;
  const teamB = match.teamBId ? teams.find(t => t.id === match.teamBId) : null;

  const isTeamALoser = match.scoreA !== null && match.scoreB !== null && (
    match.scoreA < match.scoreB ||
    (match.scoreA === match.scoreB && !!match.hasPenalties && match.penaltyScoreA !== null && match.penaltyScoreB !== null && match.penaltyScoreA < match.penaltyScoreB)
  );

  const isTeamBLoser = match.scoreA !== null && match.scoreB !== null && (
    match.scoreB < match.scoreA ||
    (match.scoreA === match.scoreB && !!match.hasPenalties && match.penaltyScoreA !== null && match.penaltyScoreB !== null && match.penaltyScoreB < match.penaltyScoreA)
  );

  return (
    <div className="flex flex-col w-48 shrink-0 select-none">
      {/* Date, Heure et Numéro de match */}
      <div className="flex items-center justify-between px-1 mb-1 text-[10px] text-slate-400 font-medium">
        <span className="font-extrabold text-slate-500">M°{match.matchNumber}</span>
        <span className="flex items-center gap-1">
          <span>{match.date.replace(" Juin 2026", "/06").replace(" Juillet 2026", "/07")}</span>
          <span className="text-slate-600">•</span>
          <span>{match.time}</span>
        </span>
      </div>

      {/* Conteneur des Scores et Équipes */}
      <div className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800/80 rounded-xl p-2 shadow-md flex flex-col gap-1 transition-all duration-200 hover:border-slate-700/80 hover:shadow-lg">
        {/* Équipe A */}
        <div className="flex items-center justify-between gap-1.5 h-[22px]">
          <div className="flex items-center gap-1.5 overflow-hidden flex-1">
            {teamA ? (
              <>
                <Flag emoji={teamA.flag} name={teamA.name} className="w-4 h-3 shrink-0 rounded-[1.5px] shadow-sm" />
                <span className={`text-[11px] font-bold text-slate-200 truncate ${isTeamALoser ? 'opacity-40 line-through font-normal' : ''}`}>
                  {teamA.name}
                </span>
              </>
            ) : (
              <span className="text-[10px] font-medium text-slate-500 truncate italic">
                {match.teamANamePlaceholder || "TBD"}
              </span>
            )}
          </div>
          {match.scoreA !== null && (
            <div className="flex items-center gap-0.5 shrink-0 font-mono text-xs font-bold">
              <span className={isTeamALoser ? 'text-slate-500' : 'text-slate-100'}>
                {match.scoreA}
              </span>
              {match.hasPenalties && match.penaltyScoreA !== null && (
                <span className="text-[9px] text-amber-500 font-bold ml-0.5">({match.penaltyScoreA})</span>
              )}
            </div>
          )}
        </div>

        {/* Équipe B */}
        <div className="flex items-center justify-between gap-1.5 h-[22px]">
          <div className="flex items-center gap-1.5 overflow-hidden flex-1">
            {teamB ? (
              <>
                <Flag emoji={teamB.flag} name={teamB.name} className="w-4 h-3 shrink-0 rounded-[1.5px] shadow-sm" />
                <span className={`text-[11px] font-bold text-slate-200 truncate ${isTeamBLoser ? 'opacity-40 line-through font-normal' : ''}`}>
                  {teamB.name}
                </span>
              </>
            ) : (
              <span className="text-[10px] font-medium text-slate-500 truncate italic">
                {match.teamBNamePlaceholder || "TBD"}
              </span>
            )}
          </div>
          {match.scoreB !== null && (
            <div className="flex items-center gap-0.5 shrink-0 font-mono text-xs font-bold">
              <span className={isTeamBLoser ? 'text-slate-500' : 'text-slate-100'}>
                {match.scoreB}
              </span>
              {match.hasPenalties && match.penaltyScoreB !== null && (
                <span className="text-[9px] text-amber-500 font-bold ml-0.5">({match.penaltyScoreB})</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function TournamentBracket({ matches, teams }: TournamentBracketProps) {
  return (
    <div className="p-4 sm:p-6 bg-slate-950 rounded-2xl border border-slate-900 shadow-inner overflow-x-auto scrollbar-thin">
      <h2 className="text-lg font-black text-slate-100 mb-6 flex items-center gap-3">
        <span className="w-1.5 h-6 bg-emerald-500 rounded"></span>
        Tableau des Phases Finales
      </h2>

      {/* Arbre Symétrique de la Coupe du Monde */}
      <div className="flex gap-6 min-w-[1550px] justify-between items-stretch py-2 relative">
        
        {/* ================= AILE GAUCHE ================= */}
        <div className="flex gap-6 items-stretch">
          
          {/* COLONNE 1 : 16ÈMES DE FINALE (GAUCHE) */}
          <div className="flex flex-col justify-between w-48 py-2 h-[880px]">
            {/* Moitié Supérieure */}
            <div className="flex flex-col justify-between h-[410px]">
              {/* Paire 1 */}
              <div className="flex flex-col gap-6">
                <BracketMatchCard matchNum={74} matches={matches} teams={teams} />
                <BracketMatchCard matchNum={77} matches={matches} teams={teams} />
              </div>
              {/* Paire 2 */}
              <div className="flex flex-col gap-6">
                <BracketMatchCard matchNum={73} matches={matches} teams={teams} />
                <BracketMatchCard matchNum={75} matches={matches} teams={teams} />
              </div>
            </div>

            {/* Moitié Inférieure */}
            <div className="flex flex-col justify-between h-[410px]">
              {/* Paire 3 */}
              <div className="flex flex-col gap-6">
                <BracketMatchCard matchNum={83} matches={matches} teams={teams} />
                <BracketMatchCard matchNum={84} matches={matches} teams={teams} />
              </div>
              {/* Paire 4 */}
              <div className="flex flex-col gap-6">
                <BracketMatchCard matchNum={81} matches={matches} teams={teams} />
                <BracketMatchCard matchNum={82} matches={matches} teams={teams} />
              </div>
            </div>
          </div>

          {/* COLONNE 2 : 8ÈMES DE FINALE (GAUCHE) */}
          <div className="flex flex-col justify-between w-48 py-2 h-[880px]">
            {/* Moitié Supérieure */}
            <div className="flex flex-col justify-around h-[410px]">
              <BracketMatchCard matchNum={89} matches={matches} teams={teams} />
              <BracketMatchCard matchNum={90} matches={matches} teams={teams} />
            </div>

            {/* Moitié Inférieure */}
            <div className="flex flex-col justify-around h-[410px]">
              <BracketMatchCard matchNum={93} matches={matches} teams={teams} />
              <BracketMatchCard matchNum={94} matches={matches} teams={teams} />
            </div>
          </div>

          {/* COLONNE 3 : QUARTS DE FINALE (GAUCHE) */}
          <div className="flex flex-col justify-between w-48 py-2 h-[880px]">
            {/* Moitié Supérieure */}
            <div className="flex flex-col justify-center h-[410px]">
              <BracketMatchCard matchNum={97} matches={matches} teams={teams} />
            </div>

            {/* Moitié Inférieure */}
            <div className="flex flex-col justify-center h-[410px]">
              <BracketMatchCard matchNum={98} matches={matches} teams={teams} />
            </div>
          </div>

        </div>

        {/* ================= CENTRE (DEMI-FINALES & FINALE) ================= */}
        <div className="flex flex-col justify-between items-center w-[440px] py-4 h-[880px] border-x border-slate-900/40 px-4">
          
          {/* FINALE */}
          <div className="flex flex-col items-center gap-2 mt-4">
            <span className="text-xs font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full shadow-inner animate-pulse">
              Grande Finale
            </span>
            <BracketMatchCard matchNum={104} matches={matches} teams={teams} />
          </div>

          {/* DEMI-FINALES (Côte à côte au centre) */}
          <div className="flex gap-6 justify-center items-center w-full my-auto">
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Demi-Finale G.</span>
              <BracketMatchCard matchNum={101} matches={matches} teams={teams} />
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Demi-Finale D.</span>
              <BracketMatchCard matchNum={102} matches={matches} teams={teams} />
            </div>
          </div>

          {/* MATCH 3ÈME PLACE */}
          <div className="flex flex-col items-center gap-2 mb-4">
            <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase bg-slate-800/40 border border-slate-800/60 px-3 py-1 rounded-full">
              Match pour la 3ème place
            </span>
            <BracketMatchCard matchNum={103} matches={matches} teams={teams} />
          </div>

        </div>

        {/* ================= AILE DROITE ================= */}
        <div className="flex gap-6 items-stretch">
          
          {/* COLONNE 5 : QUARTS DE FINALE (DROITE) */}
          <div className="flex flex-col justify-between w-48 py-2 h-[880px]">
            {/* Moitié Supérieure */}
            <div className="flex flex-col justify-center h-[410px]">
              <BracketMatchCard matchNum={99} matches={matches} teams={teams} />
            </div>

            {/* Moitié Inférieure */}
            <div className="flex flex-col justify-center h-[410px]">
              <BracketMatchCard matchNum={100} matches={matches} teams={teams} />
            </div>
          </div>

          {/* COLONNE 6 : 8ÈMES DE FINALE (DROITE) */}
          <div className="flex flex-col justify-between w-48 py-2 h-[880px]">
            {/* Moitié Supérieure */}
            <div className="flex flex-col justify-around h-[410px]">
              <BracketMatchCard matchNum={91} matches={matches} teams={teams} />
              <BracketMatchCard matchNum={92} matches={matches} teams={teams} />
            </div>

            {/* Moitié Inférieure */}
            <div className="flex flex-col justify-around h-[410px]">
              <BracketMatchCard matchNum={95} matches={matches} teams={teams} />
              <BracketMatchCard matchNum={96} matches={matches} teams={teams} />
            </div>
          </div>

          {/* COLONNE 7 : 16ÈMES DE FINALE (DROITE) */}
          <div className="flex flex-col justify-between w-48 py-2 h-[880px]">
            {/* Moitié Supérieure */}
            <div className="flex flex-col justify-between h-[410px]">
              {/* Paire 1 */}
              <div className="flex flex-col gap-6">
                <BracketMatchCard matchNum={76} matches={matches} teams={teams} />
                <BracketMatchCard matchNum={78} matches={matches} teams={teams} />
              </div>
              {/* Paire 2 */}
              <div className="flex flex-col gap-6">
                <BracketMatchCard matchNum={79} matches={matches} teams={teams} />
                <BracketMatchCard matchNum={80} matches={matches} teams={teams} />
              </div>
            </div>

            {/* Moitié Inférieure */}
            <div className="flex flex-col justify-between h-[410px]">
              {/* Paire 3 */}
              <div className="flex flex-col gap-6">
                <BracketMatchCard matchNum={86} matches={matches} teams={teams} />
                <BracketMatchCard matchNum={88} matches={matches} teams={teams} />
              </div>
              {/* Paire 4 */}
              <div className="flex flex-col gap-6">
                <BracketMatchCard matchNum={85} matches={matches} teams={teams} />
                <BracketMatchCard matchNum={87} matches={matches} teams={teams} />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
