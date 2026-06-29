import React, { useState, useEffect, useRef } from "react";
import { INITIAL_TEAMS, generateInitialMatches } from "./initialData";
import { Team, Match, Stage } from "./types";
import Header from "./components/Header";
import MatchList from "./components/MatchList";
import TeamManagement from "./components/TeamManagement";
import Standings from "./components/Standings";
import SettingsModal from "./components/SettingsModal";
import HomeTab from "./components/HomeTab";
import { Calendar, Users, Info, HelpCircle, Trophy, ChevronUp, ChevronDown, AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function App() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeTab, setActiveTab] = useState<"HOME" | "CALENDAR" | "TEAMS" | "STANDINGS">("HOME");
  const [selectedStage, setSelectedStage] = useState<Stage>(Stage.GROUPS);
  const [showHowTo, setShowHowTo] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isPhasesExpanded, setIsPhasesExpanded] = useState(true);
  const [showBottomNav, setShowBottomNav] = useState(false);
  
  // Ref to the main scrollable container to force scroll-to-top on tab changes
  const mainScrollRef = useRef<HTMLDivElement>(null);
  
  // Refs for tracking automatic scroll/selection to avoid loop updates during scoring
  const lastTabRef = useRef<string>("");
  const hasAutoSelectedRef = useRef<boolean>(false);

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
        let loadedTeams: Team[] = JSON.parse(savedTeamsStr);
        // Ensure fifaRanking is set on all loaded teams (migration for older storage)
        const hasMissingRanking = loadedTeams.some((t) => t.fifaRanking === undefined);
        if (hasMissingRanking) {
          loadedTeams = loadedTeams.map((t) => {
            const initial = INITIAL_TEAMS.find((it) => it.id === t.id);
            return {
              ...t,
              fifaRanking: t.fifaRanking !== undefined ? t.fifaRanking : (initial?.fifaRanking || 99),
            };
          });
          localStorage.setItem("wc2026_teams", JSON.stringify(loadedTeams));
        }
        setTeams(loadedTeams);
      } catch (e) {
        setTeams(INITIAL_TEAMS);
      }
    } else {
      setTeams(INITIAL_TEAMS);
    }

    if (savedMatchesStr) {
      try {
        let loadedMatches: Match[] = JSON.parse(savedMatchesStr);
        // Migration des anciens placeholders pour être plus courts
        loadedMatches = loadedMatches.map((m) => {
          let updated = { ...m };
          if (updated.teamANamePlaceholder) {
            updated.teamANamePlaceholder = updated.teamANamePlaceholder
              .replace("Vainqueur Match ", "Vainqueur #")
              .replace("Perdant Match ", "Perdant #");
          }
          if (updated.teamBNamePlaceholder) {
            updated.teamBNamePlaceholder = updated.teamBNamePlaceholder
              .replace("Vainqueur Match ", "Vainqueur #")
              .replace("Perdant Match ", "Perdant #");
          }
          return updated;
        });
        setMatches(loadedMatches);
      } catch (e) {
        setMatches(generateInitialMatches());
      }
    } else {
      setMatches(generateInitialMatches());
    }
  }, []);

  // Remonter en haut de page à chaque changement d'onglet (notamment pour Classement et Équipes)
  useEffect(() => {
    window.scrollTo({ top: 0 });
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0 });
    }
  }, [activeTab]);

  // Synchronise automatiquement l'onglet des phases du calendrier lors de l'ouverture
  useEffect(() => {
    if (activeTab === "CALENDAR" && matches.length > 0) {
      const isSwitchingTab = lastTabRef.current !== "CALENDAR";
      const isInitialAutoSelect = !hasAutoSelectedRef.current;

      if (isSwitchingTab || isInitialAutoSelect) {
        const STAGE_ORDER = [
          Stage.GROUPS,
          Stage.ROUND_32,
          Stage.ROUND_16,
          Stage.QUARTERS,
          Stage.SEMIS,
          Stage.FINAL
        ];

        const firstUnplayedStage = STAGE_ORDER.find((stage) => {
          const stageMatches = matches.filter((m) => {
            if (stage === Stage.FINAL) {
              return m.stage === Stage.FINAL || m.stage === Stage.THIRD_PLACE;
            }
            return m.stage === stage;
          });
          return stageMatches.some((m) => m.scoreA === null || m.scoreB === null);
        });

        if (firstUnplayedStage) {
          setSelectedStage(firstUnplayedStage);
        }
        hasAutoSelectedRef.current = true;
      }
    }
    lastTabRef.current = activeTab;
  }, [activeTab, matches]);

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

  // Update knockout match specific details like extra time, penalties and penalty scores
  const handleUpdateKnockoutDetails = (
    matchId: string,
    hasExtraTime: boolean,
    hasPenalties: boolean,
    penaltyScoreA: number | null,
    penaltyScoreB: number | null
  ) => {
    const updatedMatches = matches.map((m) =>
      m.id === matchId ? { ...m, hasExtraTime, hasPenalties, penaltyScoreA, penaltyScoreB } : m
    );
    setMatches(updatedMatches);
    localStorage.setItem("wc2026_matches", JSON.stringify(updatedMatches));
  };

  const [importSuccess, setImportSuccess] = useState(false);
  const handleImportTeams = (stage: Stage) => {
    if (stage === Stage.ROUND_32) {
      // Calculer les classements des groupes
      const groupStats: Record<string, any[]> = {};
      
      const groupMatches = matches.filter(m => m.stage === Stage.GROUPS);
      const teamsInGroups = new Map<string, any[]>();
      
      // Initialize groups
      "ABCDEFGHIJKL".split('').forEach(g => teamsInGroups.set(g, teams.filter(t => t.group === g).map(t => ({...t, points: 0, goalDiff: 0}))));

      // Simple Points/GoalDiff calculation (for brevity in this turn)
      groupMatches.forEach(m => {
        if (m.scoreA !== null && m.scoreB !== null) {
          const group = matches.find(ma => ma.id === m.id)?.group;
          if (group) {
            const groupTeams = teamsInGroups.get(group);
            if (groupTeams) {
              const tA = groupTeams.find(t => t.id === m.teamAId);
              const tB = groupTeams.find(t => t.id === m.teamBId);
              if (tA) {
                if (m.scoreA > m.scoreB) tA.points += 3;
                else if (m.scoreA === m.scoreB) tA.points += 1;
                tA.goalDiff += (m.scoreA - m.scoreB);
              }
              if (tB) {
                if (m.scoreB > m.scoreA) tB.points += 3;
                else if (m.scoreB === m.scoreA) tB.points += 1;
                tB.goalDiff += (m.scoreB - m.scoreA);
              }
            }
          }
        }
      });
      
      // Check if 3rd matches played for each group
      const groupsFullyPlayed = new Set<string>();
      "ABCDEFGHIJKL".split('').forEach(g => {
        const matchesInGroup = groupMatches.filter(m => m.group === g);
        // Assuming 3 matches in each group for 4 teams
        const played = matchesInGroup.filter(m => m.scoreA !== null && m.scoreB !== null).length;
        if (played === 6) {
          groupsFullyPlayed.add(g);
        }
      });
      
      // Sort teams
      teamsInGroups.forEach((groupTeams, g) => {
        groupTeams.sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff);
      });

      // Update matches
      const updatedMatches = matches.map(match => {
        if (match.stage !== Stage.ROUND_32) return match;

        let { teamAId, teamBId } = match;

        const parseLabel = (label: string) => {
          const matchResult = label.match(/(1er|2ème) Groupe ([A-L])/);
          if (matchResult) return { position: matchResult[1], group: matchResult[2] };
          return null;
        };

        if (match.teamANamePlaceholder && !teamAId) {
          const res = parseLabel(match.teamANamePlaceholder);
          if (res && groupsFullyPlayed.has(res.group)) {
            const groupTeams = teamsInGroups.get(res.group);
            if (groupTeams) {
              const idx = res.position === "1er" ? 0 : 1;
              if (groupTeams[idx]) teamAId = groupTeams[idx].id;
            }
          }
        }
        
        if (match.teamBNamePlaceholder && !teamBId) {
          const res = parseLabel(match.teamBNamePlaceholder);
          if (res && groupsFullyPlayed.has(res.group)) {
            const groupTeams = teamsInGroups.get(res.group);
            if (groupTeams) {
              const idx = res.position === "1er" ? 0 : 1;
              if (groupTeams[idx]) teamBId = groupTeams[idx].id;
            }
          }
        }

        return { ...match, teamAId, teamBId };
      });
      
      setMatches(updatedMatches);
      localStorage.setItem("wc2026_matches", JSON.stringify(updatedMatches));
      setImportSuccess(true);
      setTimeout(() => setImportSuccess(false), 3000);
      return;
    }

    // Default knockout progression logic
    let previousStage: Stage;
    switch(stage) {
      case Stage.QUARTERS: previousStage = Stage.ROUND_16; break;
      case Stage.SEMIS: previousStage = Stage.QUARTERS; break;
      case Stage.FINAL: previousStage = Stage.SEMIS; break;
      default: return;
    }

    const previousMatches = matches.filter(m => m.stage === previousStage);
    const currentMatches = matches.map(match => {
      if (match.stage !== stage) return match;

      // Extract match numbers from placeholders: "Vainqueur Match 89"
      const matchNumberA = match.teamANamePlaceholder ? parseInt(match.teamANamePlaceholder.replace(/\D/g, "")) : null;
      const matchNumberB = match.teamBNamePlaceholder ? parseInt(match.teamBNamePlaceholder.replace(/\D/g, "")) : null;

      let teamAId = match.teamAId;
      let teamBId = match.teamBId;

      const getMatchWinner = (m: Match) => {
        if (m.scoreA === null || m.scoreB === null) return null;
        if (m.scoreA > m.scoreB) return m.teamAId;
        if (m.scoreB > m.scoreA) return m.teamBId;
        if (m.hasPenalties && m.penaltyScoreA !== null && m.penaltyScoreB !== null) {
          if (m.penaltyScoreA > m.penaltyScoreB) return m.teamAId;
          if (m.penaltyScoreB > m.penaltyScoreA) return m.teamBId;
        }
        return null;
      };

      if (matchNumberA && !teamAId) {
        const prevMatch = previousMatches.find(m => m.matchNumber === matchNumberA);
        if (prevMatch) {
          const winnerId = getMatchWinner(prevMatch);
          if (winnerId) teamAId = winnerId;
        }
      }

      if (matchNumberB && !teamBId) {
        const prevMatch = previousMatches.find(m => m.matchNumber === matchNumberB);
        if (prevMatch) {
          const winnerId = getMatchWinner(prevMatch);
          if (winnerId) teamBId = winnerId;
        }
      }

      return { ...match, teamAId, teamBId };
    });

    setMatches(currentMatches);
    localStorage.setItem("wc2026_matches", JSON.stringify(currentMatches));
    setImportSuccess(true);
    setTimeout(() => setImportSuccess(false), 3000);
  };

  // Helper function to get match winner and loser
  const getMatchWinnerAndLoser = (m: Match): { winnerId: string | null; loserId: string | null } => {
    if (m.scoreA === null || m.scoreB === null || !m.teamAId || !m.teamBId) {
      return { winnerId: null, loserId: null };
    }
    if (m.scoreA > m.scoreB) {
      return { winnerId: m.teamAId, loserId: m.teamBId };
    }
    if (m.scoreB > m.scoreA) {
      return { winnerId: m.teamBId, loserId: m.teamAId };
    }
    if (m.hasPenalties && m.penaltyScoreA !== null && m.penaltyScoreB !== null) {
      if (m.penaltyScoreA > m.penaltyScoreB) {
        return { winnerId: m.teamAId, loserId: m.teamBId };
      }
      if (m.penaltyScoreB > m.penaltyScoreA) {
        return { winnerId: m.teamBId, loserId: m.teamAId };
      }
    }
    return { winnerId: null, loserId: null };
  };

  // Validate match
  const handleValidateMatch = (matchId: string) => {
    const targetMatch = matches.find((m) => m.id === matchId);
    if (!targetMatch) return;

    let updatedMatches = matches.map((m) =>
      m.id === matchId ? { ...m, validated: true } : m
    );

    let updatedTeams = [...teams];

    // Si c'est un match de phase finale (matchNumber >= 73)
    if (targetMatch.matchNumber && targetMatch.matchNumber >= 73 && targetMatch.matchNumber <= 104) {
      const { winnerId, loserId } = getMatchWinnerAndLoser(targetMatch);

      // Éliminer l'équipe perdante (sauf pour les demi-finales M101 et M102 car elles jouent la 3e place)
      if (loserId && targetMatch.matchNumber !== 101 && targetMatch.matchNumber !== 102) {
        updatedTeams = teams.map((t) =>
          t.id === loserId ? { ...t, eliminated: true } : t
        );
        setTeams(updatedTeams);
        localStorage.setItem("wc2026_teams", JSON.stringify(updatedTeams));
      }

      // Propager le vainqueur et/ou le perdant dans les matchs suivants
      if (winnerId || loserId) {
        updatedMatches = updatedMatches.map((m) => {
          let nextTeamAId = m.teamAId;
          let nextTeamBId = m.teamBId;

          // Analyse de teamANamePlaceholder
          if (m.teamANamePlaceholder) {
            const num = parseInt(m.teamANamePlaceholder.replace(/\D/g, ""), 10);
            if (num === targetMatch.matchNumber) {
              const isWinnerPlaceholder = m.teamANamePlaceholder.toLowerCase().includes("vainqueur");
              const isLoserPlaceholder = m.teamANamePlaceholder.toLowerCase().includes("perdant");
              if (isWinnerPlaceholder && winnerId) {
                nextTeamAId = winnerId;
              } else if (isLoserPlaceholder && loserId) {
                nextTeamAId = loserId;
              }
            }
          }

          // Analyse de teamBNamePlaceholder
          if (m.teamBNamePlaceholder) {
            const num = parseInt(m.teamBNamePlaceholder.replace(/\D/g, ""), 10);
            if (num === targetMatch.matchNumber) {
              const isWinnerPlaceholder = m.teamBNamePlaceholder.toLowerCase().includes("vainqueur");
              const isLoserPlaceholder = m.teamBNamePlaceholder.toLowerCase().includes("perdant");
              if (isWinnerPlaceholder && winnerId) {
                nextTeamBId = winnerId;
              } else if (isLoserPlaceholder && loserId) {
                nextTeamBId = loserId;
              }
            }
          }

          return { ...m, teamAId: nextTeamAId, teamBId: nextTeamBId };
        });
      }
    }

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

  // Update all teams array & save
  const handleUpdateAllTeams = (updatedTeams: Team[]) => {
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
    setActiveTab("HOME");
    setShowResetConfirm(false);
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
        onReset={() => setShowResetConfirm(true)}
        onShowNotice={() => setShowHowTo(true)}
        onShowSettings={() => setShowSettings(true)}
      />

      {/* Scrollable area for content and footer to keep Bottom Nav consistently fixed in viewport */}
      <div ref={mainScrollRef} className="flex-1 overflow-y-auto min-h-0 w-full pb-24 pb-[calc(6.5rem+env(safe-area-inset-bottom))]">
        {/* Main Container */}
        <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
          {/* Reset Confirmation Modal */}
          {showResetConfirm && (
            <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 bg-rose-600/20 text-rose-400 rounded-full">
                    <AlertTriangle className="w-10 h-10 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">Réinitialiser les données ?</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Cette action va réinitialiser l'intégralité du tournoi. Les scores, les cartons jaunes/rouges et les rangs FIFA d'origine seront remis à zéro.
                    </p>
                  </div>
                  <div className="bg-slate-950/40 border border-slate-800/80 p-3 rounded-xl w-full text-left text-[11px] text-slate-300 space-y-1">
                    <span className="font-semibold text-rose-400 block mb-1">Éléments qui seront remis à zéro :</span>
                    <p>• Tous les scores de match et l'arbre des phases finales</p>
                    <p>• L'ensemble des cartons jaunes et rouges encodés</p>
                    <p>• Les rangs FIFA des équipes à leurs valeurs initiales d'origine</p>
                  </div>
                  <div className="flex items-center gap-3 w-full pt-2">
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="flex-1 py-2.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 rounded-lg transition-colors cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleResetAll}
                      className="flex-1 py-2.5 text-xs font-bold bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Réinitialiser
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Modal */}
          <SettingsModal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            teams={teams}
            matches={matches}
            onUpdateData={(updatedTeamsList, updatedMatchesList) => {
              setTeams(updatedTeamsList);
              setMatches(updatedMatchesList);
              localStorage.setItem("wc2026_teams", JSON.stringify(updatedTeamsList));
              localStorage.setItem("wc2026_matches", JSON.stringify(updatedMatchesList));
            }}
          />

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
            <div className="sticky top-0 z-20 flex flex-col gap-2 bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-slate-800/80 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-semibold pl-1 uppercase tracking-wider">Phases du Tournoi</span>
                <button
                  type="button"
                  onClick={() => setIsPhasesExpanded(!isPhasesExpanded)}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-100 rounded-lg transition-colors cursor-pointer"
                  title={isPhasesExpanded ? "Masquer l'encadré" : "Afficher l'encadré"}
                >
                  {isPhasesExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
              
              {isPhasesExpanded && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none-touch">
                  {[
                    { stage: Stage.GROUPS, text: "Groupes" },
                    { stage: Stage.ROUND_32, text: "16èmes" },
                    { stage: Stage.ROUND_16, text: "8èmes" },
                    { stage: Stage.QUARTERS, text: "Quarts" },
                    { stage: Stage.SEMIS, text: "Demis" },
                    { stage: Stage.FINAL, text: "Finales" },
                    { stage: Stage.TABLEAU, text: "Tableau" },
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
              )}
            </div>
          )}

          {/* Content Section */}
          <div className="transition-all duration-300">
            {activeTab === "HOME" ? (
              <HomeTab
                teams={teams}
                matches={matches}
                onUpdateScore={handleUpdateScore}
                onUpdateTeams={handleUpdateTeams}
                onUpdateCards={handleUpdateCards}
                onValidateMatch={handleValidateMatch}
                onUpdateKnockoutDetails={handleUpdateKnockoutDetails}
              />
            ) : activeTab === "CALENDAR" ? (
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
                  onUpdateKnockoutDetails={handleUpdateKnockoutDetails}
                  onImportTeams={handleImportTeams}
                  importSuccess={importSuccess}
                />
              </div>
            ) : activeTab === "STANDINGS" ? (
              /* Standings component with live rankings and rules */
              <Standings teams={teams} matches={matches} onToggleEliminated={handleToggleEliminated} />
            ) : (
              /* Team grid check & select checkbox */
              <TeamManagement 
                teams={teams} 
                onToggleEliminated={handleToggleEliminated} 
                onChangeGroup={handleUpdateTeamGroup}
                onUpdateAllTeams={handleUpdateAllTeams}
              />
            )}
          </div>
        </main>

        {/* Simple elegant footer */}
        <footer className="text-center text-[10px] text-slate-600 py-6 border-t border-slate-900 mt-12 bg-slate-950">
          <p>© 2026 Championnat du Monde Football • Heure Française de Diffusion</p>
        </footer>
      </div>

      {/* Bouton flèche pour afficher ou masquer les onglets en bas de page */}
      <div className={`fixed z-50 transition-all duration-300 left-1/2 -translate-x-1/2 flex flex-col items-center ${
        showBottomNav 
          ? "bottom-[calc(76px+env(safe-area-inset-bottom))]" 
          : "bottom-3"
      }`}>
        <button
          onClick={() => setShowBottomNav(!showBottomNav)}
          className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-emerald-400 font-bold p-1.5 rounded-full shadow-lg hover:text-emerald-300 transition-all cursor-pointer flex items-center justify-center gap-1.5 text-[10px] px-3.5"
          title={showBottomNav ? "Masquer la navigation" : "Afficher la navigation"}
        >
          {showBottomNav ? (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Masquer</span>
            </>
          ) : (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Afficher les Onglets</span>
            </>
          )}
        </button>
      </div>

      {/* Sticky Bottom Navigation Bar - ALWAYS viewable at the viewport bottom on both mobile & desktop */}
      <div className={`fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-md border-t border-slate-900/90 py-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] z-50 flex shadow-2xl justify-center transition-transform duration-300 ${
        showBottomNav ? "translate-y-0" : "translate-y-full"
      }`}>
        <div className="max-w-md w-full flex justify-around px-4">
          <button
            onClick={() => {
              setActiveTab("HOME");
            }}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
              activeTab === "HOME" 
                ? "text-emerald-400 bg-slate-900/60 scale-105" 
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-bold">Accueil</span>
          </button>

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
