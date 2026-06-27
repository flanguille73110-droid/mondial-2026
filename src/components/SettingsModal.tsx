import React, { useState, useRef } from "react";
import { Team, Match, Stage } from "../types";
import { X, Download, Upload, Info, CheckCircle2, AlertCircle, Settings } from "lucide-react";
import * as XLSX from "xlsx";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  matches: Match[];
  onUpdateData: (updatedTeams: Team[], updatedMatches: Match[]) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  teams,
  matches,
  onUpdateData,
}: SettingsModalProps) {
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Export to Excel file
  const handleExport = () => {
    try {
      // 1. Prepare Teams sheet data
      const teamsData = teams.map((team) => ({
        "ID Équipe": team.id,
        "Nom": team.name,
        "Drapeau": team.flag,
        "Groupe": team.group,
        "Éliminé (VRAI/FAUX)": team.eliminated ? "VRAI" : "FAUX",
        "Rang FIFA": team.fifaRanking || "",
      }));
      const teamsWS = XLSX.utils.json_to_sheet(teamsData);

      // 2. Prepare Matches sheet data
      const matchesData = matches.map((match) => {
        const teamAObj = teams.find((t) => t.id === match.teamAId);
        const teamBObj = teams.find((t) => t.id === match.teamBId);
        return {
          "ID Match": match.id,
          "Phase": match.stage,
          "Groupe": match.group || "",
          "N° Match": match.matchNumber || "",
          "ID Équipe A": match.teamAId || "",
          "Nom Équipe A": teamAObj ? teamAObj.name : (match.teamANamePlaceholder || ""),
          "Score A": match.scoreA !== null ? match.scoreA : "",
          "Cartons Jaunes A": match.yellowCardsA !== null ? match.yellowCardsA : "",
          "Cartons Rouges A": match.redCardsA !== null ? match.redCardsA : "",
          "ID Équipe B": match.teamBId || "",
          "Nom Équipe B": teamBObj ? teamBObj.name : (match.teamBNamePlaceholder || ""),
          "Score B": match.scoreB !== null ? match.scoreB : "",
          "Cartons Jaunes B": match.yellowCardsB !== null ? match.yellowCardsB : "",
          "Cartons Rouges B": match.redCardsB !== null ? match.redCardsB : "",
          "Date": match.date,
          "Heure": match.time,
          "Chaîne": match.channel,
        };
      });
      const matchesWS = XLSX.utils.json_to_sheet(matchesData);

      // 3. Columns width helper for better spreadsheet display
      teamsWS["!cols"] = [
        { wch: 12 }, // ID Équipe
        { wch: 22 }, // Nom
        { wch: 10 }, // Drapeau
        { wch: 10 }, // Groupe
        { wch: 22 }, // Éliminé
        { wch: 12 }, // Rang FIFA
      ];
      
      matchesWS["!cols"] = [
        { wch: 12 }, // ID Match
        { wch: 20 }, // Phase
        { wch: 10 }, // Groupe
        { wch: 10 }, // N° Match
        { wch: 12 }, // ID Équipe A
        { wch: 20 }, // Nom Équipe A
        { wch: 10 }, // Score A
        { wch: 16 }, // Cartons Jaunes A
        { wch: 16 }, // Cartons Rouges A
        { wch: 12 }, // ID Équipe B
        { wch: 20 }, // Nom Équipe B
        { wch: 10 }, // Score B
        { wch: 16 }, // Cartons Jaunes B
        { wch: 16 }, // Cartons Rouges B
        { wch: 15 }, // Date
        { wch: 10 }, // Heure
        { wch: 15 }, // Chaîne
      ];

      // Create Workbook and Append Sheets
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, teamsWS, "Equipes");
      XLSX.utils.book_append_sheet(wb, matchesWS, "Matchs");

      // Write and download
      XLSX.writeFile(wb, "mondial_2026_data.xlsx");
      
      setStatusMessage({
        type: "success",
        text: "Données exportées avec succès dans le fichier 'mondial_2026_data.xlsx'.",
      });
    } catch (e: any) {
      console.error(e);
      setStatusMessage({
        type: "error",
        text: "Une erreur est survenue lors de l'exportation du fichier Excel.",
      });
    }
  };

  // Export group stage matches to Excel
  const handleExportGroups = () => {
    try {
      const groupMatches = matches.filter(m => m.stage === Stage.GROUPS);
      const data = groupMatches.map((match) => {
        const teamAObj = teams.find((t) => t.id === match.teamAId);
        const teamBObj = teams.find((t) => t.id === match.teamBId);
        return {
          "ID Match": match.id,
          "N° Match": match.matchNumber || "",
          "Groupe": match.group || "",
          "Nom Équipe A": teamAObj ? teamAObj.name : "",
          "Score A": match.scoreA !== null ? match.scoreA : "",
          "Cartons Jaunes A": match.yellowCardsA !== null ? match.yellowCardsA : "",
          "Cartons Rouges A": match.redCardsA !== null ? match.redCardsA : "",
          "Nom Équipe B": teamBObj ? teamBObj.name : "",
          "Score B": match.scoreB !== null ? match.scoreB : "",
          "Cartons Jaunes B": match.yellowCardsB !== null ? match.yellowCardsB : "",
          "Cartons Rouges B": match.redCardsB !== null ? match.redCardsB : "",
          "Date": match.date,
          "Heure": match.time,
        };
      });
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "PhaseGroupes");
      XLSX.writeFile(wb, "mondial_2026_groupes.xlsx");
      
      setStatusMessage({
        type: "success",
        text: "Données des groupes exportées avec succès dans le fichier 'mondial_2026_groupes.xlsx'.",
      });
    } catch (e: any) {
      console.error(e);
      setStatusMessage({
        type: "error",
        text: "Une erreur est survenue lors de l'exportation.",
      });
    }
  };

  // Import group stage matches from Excel
  const handleImportGroups = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatusMessage(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const ws = workbook.Sheets["PhaseGroupes"];
        
        if (!ws) {
          throw new Error("Onglet 'PhaseGroupes' non trouvé dans le fichier.");
        }

        const matchesJson: any[] = XLSX.utils.sheet_to_json(ws);
        let updatedMatchesList = [...matches];
        let importedMatchesCount = 0;

        matchesJson.forEach((row) => {
          const matchId = row["ID Match"];
          if (matchId) {
            const matchIndex = updatedMatchesList.findIndex((m) => m.id === matchId);
            if (matchIndex !== -1 && updatedMatchesList[matchIndex].stage === Stage.GROUPS) {
              const parseNum = (val: any) => {
                if (val === undefined || val === "" || val === null) return null;
                const n = Number(val);
                return isNaN(n) ? null : n;
              };

              updatedMatchesList[matchIndex] = {
                ...updatedMatchesList[matchIndex],
                scoreA: parseNum(row["Score A"]),
                scoreB: parseNum(row["Score B"]),
                yellowCardsA: parseNum(row["Cartons Jaunes A"]),
                redCardsA: parseNum(row["Cartons Rouges A"]),
                yellowCardsB: parseNum(row["Cartons Jaunes B"]),
                redCardsB: parseNum(row["Cartons Rouges B"]),
              };
              importedMatchesCount++;
            }
          }
        });

        onUpdateData(teams, updatedMatchesList);
        
        setStatusMessage({
          type: "success",
          text: `Importation réussie : ${importedMatchesCount} matchs de groupe mis à jour.`,
        });

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (err: any) {
        console.error(err);
        setStatusMessage({
          type: "error",
          text: "Erreur lors de l'importation des groupes : " + err.message,
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Import from Excel file
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatusMessage(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        let updatedTeamsList = [...teams];
        let updatedMatchesList = [...matches];
        let importedTeamsCount = 0;
        let importedMatchesCount = 0;

        // 1. Read Teams sheet
        const teamsWS = workbook.Sheets["Equipes"];
        if (teamsWS) {
          const teamsJson: any[] = XLSX.utils.sheet_to_json(teamsWS);
          teamsJson.forEach((row) => {
            const id = row["ID Équipe"];
            if (id) {
              const teamIndex = updatedTeamsList.findIndex((t) => t.id === id);
              if (teamIndex !== -1) {
                const elVal = row["Éliminé (VRAI/FAUX)"];
                const rankVal = row["Rang FIFA"];

                const isEliminated =
                  elVal === "VRAI" ||
                  elVal === true ||
                  elVal === "true" ||
                  elVal === 1 ||
                  (typeof elVal === "string" && elVal.toLowerCase() === "vrai");

                const ranking =
                  rankVal !== undefined && rankVal !== "" && rankVal !== null
                    ? Number(rankVal)
                    : undefined;

                updatedTeamsList[teamIndex] = {
                  ...updatedTeamsList[teamIndex],
                  eliminated: isEliminated,
                  fifaRanking: isNaN(ranking as number) ? undefined : ranking,
                };
                importedTeamsCount++;
              }
            }
          });
        }

        // 2. Read Matches sheet
        const matchesWS = workbook.Sheets["Matchs"];
        if (matchesWS) {
          const matchesJson: any[] = XLSX.utils.sheet_to_json(matchesWS);
          matchesJson.forEach((row) => {
            const matchId = row["ID Match"];
            if (matchId) {
              const matchIndex = updatedMatchesList.findIndex((m) => m.id === matchId);
              if (matchIndex !== -1) {
                const scoreAVal = row["Score A"];
                const scoreBVal = row["Score B"];
                const yellowAVal = row["Cartons Jaunes A"];
                const redAVal = row["Cartons Rouges A"];
                const yellowBVal = row["Cartons Jaunes B"];
                const redBVal = row["Cartons Rouges B"];

                const parseNum = (val: any) => {
                  if (val === undefined || val === "" || val === null) return null;
                  const n = Number(val);
                  return isNaN(n) ? null : n;
                };

                // ID team update if modified/provided separately
                const teamAId = row["ID Équipe A"] !== undefined ? row["ID Équipe A"] : updatedMatchesList[matchIndex].teamAId;
                const teamBId = row["ID Équipe B"] !== undefined ? row["ID Équipe B"] : updatedMatchesList[matchIndex].teamBId;

                updatedMatchesList[matchIndex] = {
                  ...updatedMatchesList[matchIndex],
                  teamAId: teamAId === "" ? null : teamAId,
                  teamBId: teamBId === "" ? null : teamBId,
                  scoreA: parseNum(scoreAVal),
                  scoreB: parseNum(scoreBVal),
                  yellowCardsA: parseNum(yellowAVal),
                  redCardsA: parseNum(redAVal),
                  yellowCardsB: parseNum(yellowBVal),
                  redCardsB: parseNum(redBVal),
                };
                importedMatchesCount++;
              }
            }
          });
        }

        // Apply and save
        onUpdateData(updatedTeamsList, updatedMatchesList);
        
        setStatusMessage({
          type: "success",
          text: `Félicitations ! Importation réussie : ${importedTeamsCount} équipes et ${importedMatchesCount} matchs mis à jour.`,
        });

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (err: any) {
        console.error(err);
        setStatusMessage({
          type: "error",
          text: "Erreur lors du traitement du fichier Excel. Assurez-vous d'utiliser un format de fichier valide.",
        });
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 transition-colors text-lg p-2 hover:bg-slate-800 rounded-lg cursor-pointer"
          title="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-xl">
            <Settings className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100">
              Paramètres du Tournoi
            </h2>
            <p className="text-xs text-slate-400">
              Contrôles d'importation, d'exportation et synchronisation Excel
            </p>
          </div>
        </div>

        {/* Informative block */}
        <div className="bg-slate-800/40 rounded-xl p-3.5 border border-slate-800/80 mb-6 space-y-2">
          <div className="flex items-start gap-2.5 text-xs text-slate-300">
            <Info className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-slate-200">À propos de l'import / export Excel :</span>
              <p>
                Vous pouvez exporter toutes les données de tournoi dans un seul fichier Excel contenant deux onglets (<strong className="text-emerald-400">Equipes</strong> et <strong className="text-emerald-400">Matchs</strong>).
              </p>
              <p>
                Modifiez ensuite les scores, cartons jaunes, cartons rouges et rangs FIFA directement dans ce fichier, puis réimportez-le ci-dessous pour propager les changements sans devoir tout retaper.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Export Box */}
          <div className="bg-slate-950/45 p-4 rounded-xl border border-slate-800/60 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-1.5">
                <Download className="w-4 h-4 text-emerald-400" />
                Exporter vers Excel
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Générez un classeur Excel complet de cette version pour créer une sauvegarde ou éditer manuellement les scores, cartons et rangs FIFA.
              </p>
            </div>
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 rounded-lg transition-colors border border-slate-700 hover:border-slate-600 shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Télécharger le fichier Excel
            </button>
          </div>

          {/* Export / Import Group Box */}
          <div className="bg-slate-950/45 p-4 rounded-xl border border-slate-800/60 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-1.5">
                <Settings className="w-4 h-4 text-emerald-400" />
                Groupes (Excel)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Gérer les scores et cartons des phases de groupes via Excel.
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={handleExportGroups}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 rounded-lg transition-colors border border-slate-700 hover:border-slate-600 shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Exporter
              </button>
              <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm cursor-pointer border border-emerald-500">
                <Upload className="w-4 h-4" />
                Importer
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImportGroups}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Import Box */}
          <div className="bg-slate-950/45 p-4 rounded-xl border border-slate-800/60 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-1.5">
                <Upload className="w-4 h-4 text-blue-400" />
                Importer depuis Excel
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sélectionnez un classeur Excel préalablement exporté. Les matchs, scores, cartons (jaune/rouge) et rangs FIFA modifiés seront réinjectés.
              </p>
            </div>
            <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm cursor-pointer border border-emerald-500">
              <Upload className="w-4 h-4" />
              Choisir & Importer
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Status Messages */}
        {statusMessage && (
          <div
            className={`mt-6 p-3.5 rounded-xl border flex items-start gap-3 text-xs animate-fade-in ${
              statusMessage.type === "success"
                ? "bg-emerald-950/40 border-emerald-800/80 text-emerald-300"
                : "bg-rose-950/40 border-rose-800/80 text-rose-300"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-semibold block mb-0.5">
                {statusMessage.type === "success" ? "Succès" : "Erreur"}
              </span>
              <p className="leading-normal">{statusMessage.text}</p>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-slate-800/60 flex justify-between items-center text-[10px] text-slate-500">
          <span>Version Excel v1.1.0</span>
          <span>Données sécurisées localement</span>
        </div>
      </div>
    </div>
  );
}
