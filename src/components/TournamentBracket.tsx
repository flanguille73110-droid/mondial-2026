import React from "react";
import { Match, Team, Stage } from "../types";
import Flag from "./Flag";

interface TournamentBracketProps {
  matches: Match[];
  teams: Team[];
}

const BracketMatch = ({ match, teams }: { match: Match; teams: Team[]; key?: string }) => {
  const teamA = match.teamAId ? teams.find(t => t.id === match.teamAId) : null;
  const teamB = match.teamBId ? teams.find(t => t.id === match.teamBId) : null;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-[10px] w-36 shadow-sm">
      <div className="flex justify-between text-slate-400 mb-1">
        <span>#{match.matchNumber}</span>
        <span>{match.time}</span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 overflow-hidden">
            <Flag emoji={teamA?.flag || ""} name={teamA?.name || ""} className="w-4 h-3 shrink-0" />
            <span className="truncate">{teamA ? teamA.name : match.teamANamePlaceholder || "TBD"}</span>
          </div>
          <span className="font-bold text-white shrink-0">
            {match.scoreA ?? "-"}
            {match.hasPenalties && match.penaltyScoreA !== null && (
              <span className="text-[9px] text-amber-400 ml-1">({match.penaltyScoreA})</span>
            )}
          </span>
        </div>
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 overflow-hidden">
            <Flag emoji={teamB?.flag || ""} name={teamB?.name || ""} className="w-4 h-3 shrink-0" />
            <span className="truncate">{teamB ? teamB.name : match.teamBNamePlaceholder || "TBD"}</span>
          </div>
          <span className="font-bold text-white shrink-0">
            {match.scoreB ?? "-"}
            {match.hasPenalties && match.penaltyScoreB !== null && (
              <span className="text-[9px] text-amber-400 ml-1">({match.penaltyScoreB})</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function TournamentBracket({ matches, teams }: TournamentBracketProps) {
  const getStageMatches = (stage: Stage) => matches.filter(m => m.stage === stage);

  const stages = [
    { name: "16èmes", matches: getStageMatches(Stage.ROUND_32) },
    { name: "8èmes", matches: getStageMatches(Stage.ROUND_16) },
    { name: "Quarts", matches: getStageMatches(Stage.QUARTERS) },
    { name: "Demis", matches: getStageMatches(Stage.SEMIS) },
    { name: "Finale", matches: [...getStageMatches(Stage.FINAL), ...getStageMatches(Stage.THIRD_PLACE)] },
  ];

  return (
    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner overflow-x-auto">
      <h2 className="text-xl font-black text-slate-100 mb-4 flex items-center gap-3">
        <span className="w-1.5 h-6 bg-emerald-500 rounded"></span>
        Tableau des Phases Finales
      </h2>
      <div className="flex gap-4 min-w-max">
        {stages.map((stage) => (
          <div key={stage.name} className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-slate-500 text-center uppercase tracking-wider">{stage.name}</h3>
            <div className="flex flex-col gap-2">
              {stage.matches.map((match) => (
                <BracketMatch key={match.id} match={match} teams={teams} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
