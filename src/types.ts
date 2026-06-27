export enum Stage {
  GROUPS = "Phase de Groupes",
  ROUND_32 = "16èmes de Finale",
  ROUND_16 = "8èmes de Finale",
  QUARTERS = "Quarts de Finale",
  SEMIS = "Demi-Finales",
  THIRD_PLACE = "Match 3ème Place",
  FINAL = "Finale",
  TABLEAU = "Tableau"
}

export interface Team {
  id: string; // e.g. "FRA"
  name: string; // e.g. "France"
  flag: string; // Emoji flag, e.g. "🇫🇷"
  group: string; // "A" to "L"
  eliminated: boolean;
  fifaRanking?: number; // FIFA world ranking for tiebreakers
}

export interface Match {
  id: string;
  stage: Stage;
  group?: string; // only for Stage.GROUPS
  matchNumber?: number; // e.g. 1 to 104
  teamAId: string | null; // null if not yet selected (for knockout phases)
  teamBId: string | null;
  teamANamePlaceholder?: string; // e.g. "1er Groupe A" (for knockouts)
  teamBNamePlaceholder?: string; // e.g. "2ème Groupe B"
  scoreA: number | null; // null means match not played
  scoreB: number | null;
  validated?: boolean;
  yellowCardsA?: number | null;
  redCardsA?: number | null;
  yellowCardsB?: number | null;
  redCardsB?: number | null;
  date: string; // ISO date string or formatted date
  time: string; // e.g. "21:00" (heure française)
  channel: string; // e.g. "TF1", "M6", "beIN Sports"
}

export interface WorldCupState {
  teams: Team[];
  matches: Match[];
}
