import React, { useState, useEffect } from "react";
import { INITIAL_TEAMS, generateInitialMatches } from "./initialData";
import { Team, Match, Stage } from "./types";
import Header from "./components/Header";
import MatchList from "./components/MatchList";
import TeamManagement from "./components/TeamManagement";
import Standings from "./components/Standings";
import { Calendar, Users, Info, HelpCircle, Trophy } from "lucide-react";

export default function App() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeTab, setActiveTab] = useState<"CALENDAR" | "TEAMS" | "STANDINGS">("CALENDAR");
  const [selectedStage, setSelectedStage] = useState<Stage>(Stage.GROUPS);
  const [showHowTo, setShowHowTo] = useState(false);

  // Load from LocalStorage or initialize with defaults
  useEffect(() => {
    const version = localStorage.getItem("wc2026_version_v5");
    
    if (version !== "true") {
      setTeams(INITIAL_TEAMS);
      setMatches(generateInitialMatches());
      localStorage.setItem("wc2026_teams", JSON.stringify(INITIAL_TEAMS));
      localStorage.setItem("wc2026_matches", JSON.stringify(generateInitialMatches()));
      localStorage.setItem("wc2026_version_v5", "true");
      return;
    }

    const savedTeamsStr = localStorage.getItem("wc2026_teams");
    const savedMatchesStr = localStorage.getItem("wc2026_matches");

    if (savedTeamsStr) {
      try {
        setTeams(JSON.parse(savedTeamsStr));
      } catch (e) {
        setTeams(INITIAL_TEAMS);
      }
    } else {
      setTeams(INITIAL_TEAMS);
    }

    if (savedMatchesStr) {
      try {
        setMatches(JSON.parse(savedMatchesStr));
      } catch (e) {
        setMatches(generateInitialMatches());
      }
    } else {
      setMatches(generateInitialMatches());
    }
  }, []);

  // Update Score Handler & save
  const handleUpdateScore = (matchId: string, scoreA: number | null, scoreB: number | null) => {
    const updatedMatches = matches.map((m) =>
      m.id === matchId ? { ...m, scoreA, scoreB } : m
    );
    setMatches(updatedMatches);
    localStorage.setItem("wc2026_matches", JSON.stringify(updatedMatches));
  };

  // Update Cards Handler & save
  const handleUpdateCards = (
    matchId: string,
    type: "yellow" | "red",
    team: "A" | "B",
    val: number | null
  ) => {
    const updatedMatches = matches.map((m) => {
      if (m.id !== matchId) return m;
      if (type === "yellow") {
        return team === "A"
          ? { ...m, yellowCardsA: val }
          : { ...m, yellowCardsB: val };
      } else {
        return team === "A"
          ? { ...m, redCardsA: val }
          : { ...m, redCardsB: val };
      }
    });
    setMatches(updatedMatches);
    localStorage.setItem("wc2026_matches", JSON.stringify(updatedMatches));
  };

  // Update knockout stage team selections & save
  const handleUpdateTeams = (matchId: string, teamAId: string | null, teamBId: string | null) => {
    const updatedMatches = matches.map((m) =>
      m.id === matchId ? { ...m, teamAId, teamBId } : m
    );
    setMatches(updatedMatches);
    localStorage.setItem("wc2026_matches", JSON.stringify(updatedMatches));
  };

  // Toggle eliminated team state & save
  const handleToggleEliminated = (teamId: string) => {
    const updatedTeams = teams.map((team) =>
      team.id === teamId ? { ...team, eliminated: !team.eliminated } : team
    );
    setTeams(updatedTeams);
    localStorage.setItem("wc2026_teams", JSON.stringify(updatedTeams));
  };

  // Change team group & save
  const handleUpdateTeamGroup = (teamId: string, newGroup: string) => {
    const updatedTeams = teams.map((team) =>
      team.id === teamId ? { ...team, group: newGroup } : team
    );
    setTeams(updatedTeams);
    localStorage.setItem("wc2026_teams", JSON.stringify(updatedTeams));
  };

  // Reset entire dashboard
  const handleResetAll = () => {
    const defaultMatches = generateInitialMatches();
    setTeams(INITIAL_TEAMS);
    setMatches(defaultMatches);
    localStorage.setItem("wc2026_teams", JSON.stringify(INITIAL_TEAMS));
    localStorage.setItem("wc2026_matches", JSON.stringify(defaultMatches));
    setSelectedStage(Stage.GROUPS);
    setActiveTab("CALENDAR");
  };

  // Computed metrics
  const completedCount = matches.filter((m) => m.scoreA !== null && m.scoreB !== null).length;
  const activeTeamsCount = teams.filter((t) => !t.eliminated).length;

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased relative overflow-hidden">
      {/* Visual background gradient accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-950/20 rounded-full filter blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-950/20 rounded-full filter blur-3xl pointer-events-none -z-10"></div>

      {/* Header component with metrics & reset toggle, including notice trigger */}
      <Header
        totalMatches={matches.length}
        completedMatches={completedCount}
        totalTeams={teams.length}
        activeTeams={activeTeamsCount}
        onReset={handleResetAll}
        onShowNotice={() => setShowHowTo(true)}
      />

      {/* Scrollable area for content and footer to keep Bottom Nav consistently fixed in viewport */}
      <div className="flex-1 overflow-y-auto min-h-0 w-full pb-24 pb-[calc(6.5rem+env(safe-area-inset-bottom))]">
        {/* Main Container */}
        <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
          {/* Notice Modal */}
          {showHowTo && (
            <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 max-w-lg w-full shadow-2xl relative max-h-[85vh] overflow-y-auto">
                <button
                  onClick={() => setShowHowTo(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 transition-colors text-lg"
                  title="Fermer"
                >
                  ✕
                </button>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl select-none">📖</span>
                  <h3 className="text-lg font-bold text-slate-200">Notice d'utilisation Mondial 2026</h3>
                </div>
                
                <div className="text-xs sm:text-sm text-slate-300 space-y-4 leading-relaxed">
                  <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/50 space-y-3">
                    <p>
                      ⚽ <strong>Calendrier des matchs :</strong> Retrouvez les horaires à l'<strong>heure française</strong> et les chaînes de télévision qui diffusent les matchs (TF1, M6 ou beIN Sports).
                    </p>
                    <p>
                      📊 <strong>Scores en direct :</strong> Renseignez les scores en cliquant sur les boutons <strong className="text-emerald-500 font-mono">+</strong> et <strong className="text-rose-400 font-mono">-</strong> ou en tapant le chiffre, l'enregistrement est automatique (sauvegardé sur votre téléphone).
                    </p>
                    <p>
                      ⚔️ <strong>Phases Finales :</strong> Utilisez les listes déroulantes pour planifier vos 16èmes, 8èmes, Quarts, Demi-finales et Finale en choisissant librement parmi les pays en lice.
                    </p>
                    <p>
                      ❌ <strong>Éliminations :</strong> Allez sur l'onglet <span className="text-slate-200 font-semibold">« Équipes »</span> pour cocher les pays éliminés. Les pays cochés <strong>disparaîtront immédiatement</strong> de tous les choix des listes déroulantes des phases finales !
                    </p>
                    <p className="text-[11px] text-emerald-400 font-medium pt-2 border-t border-slate-800">
                      📱 <strong>Astuce Mobile :</strong> Tournez votre téléphone de portrait en paysage pour profiter d'un affichage en grille à deux colonnes de vos matchs !
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowHowTo(false)}
                    className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg transition-colors"
                  >
                    Compris !
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick phase selection links if on Calendar view */}
          {activeTab === "CALENDAR" && (
            <div className="flex flex-col gap-2 bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-400 font-semibold pl-1 uppercase tracking-wider">Phases du Tournoi</span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none-touch">
                {[
                  { stage: Stage.GROUPS, text: "Groupes" },
                  { stage: Stage.ROUND_32, text: "16èmes" },
                  { stage: Stage.ROUND_16, text: "8èmes" },
                  { stage: Stage.QUARTERS, text: "Quarts" },
                  { stage: Stage.SEMIS, text: "Demis" },
                  { stage: Stage.FINAL, text: "Finales" },
                ].map((item) => (
                  <button
                    key={item.stage}
                    onClick={() => setSelectedStage(item.stage)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border ${
                      selectedStage === item.stage
                        ? "bg-emerald-600 border-emerald-500 text-white shadow"
                        : "bg-slate-950/40 text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/80"
                    }`}
                  >
                    {item.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content Section */}
          <div className="transition-all duration-300">
            {activeTab === "CALENDAR" ? (
              <div className="space-y-4">
                {/* Header Title for selected phase */}
                <div className="flex items-center justify-between">
                  <h2 className="text-md font-bold text-slate-200 flex items-center gap-2 pl-1">
                    <span className="w-1.5 h-3 bg-emerald-500 rounded"></span>
                    {selectedStage === Stage.FINAL
                      ? "Finale & Match de la 3ème Place"
                      : selectedStage}
                  </h2>
                  <span className="text-[10px] text-slate-500 font-mono font-medium">
                    {matches.filter((m) => m.stage === selectedStage).length} Matchs au total
                  </span>
                </div>

                {/* Match List component */}
                <MatchList
                  teams={teams}
                  matches={matches}
                  selectedStage={selectedStage}
                  onUpdateScore={handleUpdateScore}
                  onUpdateTeams={handleUpdateTeams}
                  onUpdateCards={handleUpdateCards}
                />
              </div>
            ) : activeTab === "STANDINGS" ? (
              /* Standings component with live rankings and rules */
              <Standings teams={teams} matches={matches} />
            ) : (
              /* Team grid check & select checkbox */
              <TeamManagement 
                teams={teams} 
                onToggleEliminated={handleToggleEliminated} 
                onChangeGroup={handleUpdateTeamGroup}
              />
            )}
          </div>
        </main>

        {/* Simple elegant footer */}
        <footer className="text-center text-[10px] text-slate-600 py-6 border-t border-slate-900 mt-12 bg-slate-950">
          <p>© 2026 Championnat du Monde Football • Heure Française de Diffusion</p>
        </footer>
      </div>

      {/* Sticky Bottom Navigation Bar - ALWAYS viewable at the viewport bottom on both mobile & desktop */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-md border-t border-slate-900/90 py-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] z-50 flex shadow-2xl justify-center">
        <div className="max-w-md w-full flex justify-around px-4">
          <button
            onClick={() => {
              setActiveTab("CALENDAR");
            }}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
              activeTab === "CALENDAR" 
                ? "text-emerald-400 bg-slate-900/60 scale-105" 
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-bold">Calendrier</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("STANDINGS");
            }}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
              activeTab === "STANDINGS" 
                ? "text-emerald-400 bg-slate-900/60 scale-105" 
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-bold">Classement</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("TEAMS");
            }}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
              activeTab === "TEAMS" 
                ? "text-emerald-400 bg-slate-900/60 scale-105" 
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-bold">Équipes ({activeTeamsCount})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
