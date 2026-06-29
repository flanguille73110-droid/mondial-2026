import { Team, Match, Stage } from "./types";

export const INITIAL_TEAMS: Team[] = [
  // Group A
  { id: "RSA", name: "Afrique du Sud", flag: "🇿🇦", group: "A", eliminated: false, fifaRanking: 59 },
  { id: "KOR", name: "Corée du Sud", flag: "🇰🇷", group: "A", eliminated: false, fifaRanking: 22 },
  { id: "MEX", name: "Mexique", flag: "🇲🇽", group: "A", eliminated: false, fifaRanking: 15 },
  { id: "CZE", name: "Tchéquie", flag: "🇨🇿", group: "A", eliminated: false, fifaRanking: 36 },

  // Group B
  { id: "BIH", name: "Bosnie-Herzégovine", flag: "🇧🇦", group: "B", eliminated: false, fifaRanking: 74 },
  { id: "CAN", name: "Canada", flag: "🇨🇦", group: "B", eliminated: false, fifaRanking: 40 },
  { id: "QAT", name: "Qatar", flag: "🇶🇦", group: "B", eliminated: false, fifaRanking: 46 },
  { id: "SUI", name: "Suisse", flag: "🇨🇭", group: "B", eliminated: false, fifaRanking: 19 },

  // Group C
  { id: "BRA", name: "Brésil", flag: "🇧🇷", group: "C", eliminated: false, fifaRanking: 5 },
  { id: "MAR", name: "Maroc", flag: "🇲🇦", group: "C", eliminated: false, fifaRanking: 12 },
  { id: "HAI", name: "Haïti", flag: "🇭🇹", group: "C", eliminated: false, fifaRanking: 85 },
  { id: "SCO", name: "Écosse", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", group: "C", eliminated: false, fifaRanking: 39 },

  // Group D
  { id: "AUS", name: "Australie", flag: "🇦🇺", group: "D", eliminated: false, fifaRanking: 24 },
  { id: "USA", name: "États-Unis", flag: "🇺🇸", group: "D", eliminated: false, fifaRanking: 11 },
  { id: "PAR", name: "Paraguay", flag: "🇵🇾", group: "D", eliminated: false, fifaRanking: 56 },
  { id: "TUR", name: "Turquie", flag: "🇹🇷", group: "D", eliminated: false, fifaRanking: 26 },

  // Group E
  { id: "GER", name: "Allemagne", flag: "🇩🇪", group: "E", eliminated: false, fifaRanking: 16 },
  { id: "CUW", name: "Curaçao", flag: "🇨🇼", group: "E", eliminated: false, fifaRanking: 86 },
  { id: "CIV", name: "Côte d'Ivoire", flag: "🇨🇮", group: "E", eliminated: false, fifaRanking: 38 },
  { id: "ECU", name: "Équateur", flag: "🇪🇨", group: "E", eliminated: false, fifaRanking: 31 },

  // Group F
  { id: "NED", name: "Pays-Bas", flag: "🇳🇱", group: "F", eliminated: false, fifaRanking: 7 },
  { id: "JPN", name: "Japon", flag: "🇯🇵", group: "F", eliminated: false, fifaRanking: 18 },
  { id: "SWE", name: "Suède", flag: "🇸🇪", group: "F", eliminated: false, fifaRanking: 28 },
  { id: "TUN", name: "Tunisie", flag: "🇹🇳", group: "F", eliminated: false, fifaRanking: 41 },

  // Group G
  { id: "BEL", name: "Belgique", flag: "🇧🇪", group: "G", eliminated: false, fifaRanking: 3 },
  { id: "EGY", name: "Égypte", flag: "🇪🇬", group: "G", eliminated: false, fifaRanking: 37 },
  { id: "IRN", name: "Iran", flag: "🇮🇷", group: "G", eliminated: false, fifaRanking: 20 },
  { id: "NZL", name: "Nouvelle-Zélande", flag: "🇳🇿", group: "G", eliminated: false, fifaRanking: 107 },

  // Group H
  { id: "ESP", name: "Espagne", flag: "🇪🇸", group: "H", eliminated: false, fifaRanking: 8 },
  { id: "CPV", name: "Cap-Vert", flag: "🇨🇻", group: "H", eliminated: false, fifaRanking: 65 },
  { id: "KSA", name: "Arabie Saoudite", flag: "🇸🇦", group: "H", eliminated: false, fifaRanking: 53 },
  { id: "URU", name: "Uruguay", flag: "🇺🇾", group: "H", eliminated: false, fifaRanking: 14 },

  // Group I
  { id: "FRA", name: "France", flag: "🇫🇷", group: "I", eliminated: false, fifaRanking: 2 },
  { id: "SEN", name: "Sénégal", flag: "🇸🇳", group: "I", eliminated: false, fifaRanking: 17 },
  { id: "IRQ", name: "Irak", flag: "🇮🇶", group: "I", eliminated: false, fifaRanking: 58 },
  { id: "NOR", name: "Norvège", flag: "🇳🇴", group: "I", eliminated: false, fifaRanking: 47 },

  // Group J
  { id: "ARG", name: "Argentine", flag: "🇦🇷", group: "J", eliminated: false, fifaRanking: 1 },
  { id: "ALG", name: "Algérie", flag: "🇩🇿", group: "J", eliminated: false, fifaRanking: 43 },
  { id: "AUT", name: "Autriche", flag: "🇦🇹", group: "J", eliminated: false, fifaRanking: 25 },
  { id: "JOR", name: "Jordanie", flag: "🇯🇴", group: "J", eliminated: false, fifaRanking: 71 },

  // Group K
  { id: "POR", name: "Portugal", flag: "🇵🇹", group: "K", eliminated: false, fifaRanking: 6 },
  { id: "COD", name: "RD Congo", flag: "🇨🇩", group: "K", eliminated: false, fifaRanking: 61 },
  { id: "UZB", name: "Ouzbékistan", flag: "🇺🇿", group: "K", eliminated: false, fifaRanking: 64 },
  { id: "COL", name: "Colombie", flag: "🇨🇴", group: "K", eliminated: false, fifaRanking: 13 },

  // Group L
  { id: "ENG", name: "Angleterre", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "L", eliminated: false, fifaRanking: 4 },
  { id: "CRO", name: "Croatie", flag: "🇭🇷", group: "L", eliminated: false, fifaRanking: 10 },
  { id: "GHA", name: "Ghana", flag: "🇬🇭", group: "L", eliminated: false, fifaRanking: 68 },
  { id: "PAN", name: "Panama", flag: "🇵🇦", group: "L", eliminated: false, fifaRanking: 44 },
];

// Generate French dates dynamically from 11 Juin 2026 to 27 Juin 2026 for group stage
// French broadcasters usually split prestige games (TF1, M6) and the bulk on beIN Sports
const BROADCASTERS = ["beIN Sports", "TF1", "M6"];

export function generateInitialMatches(): Match[] {
  const matches: Match[] = [];
  let matchNumber = 1;

  const rawGroupStage = [
    // Jeudi 11 Juin 2026
    { g: "A", tA: "MEX", tB: "RSA", date: "11 Juin 2026", time: "21:00", ch: "TF1" },

    // Vendredi 12 Juin 2026
    { g: "A", tA: "KOR", tB: "CZE", date: "12 Juin 2026", time: "04:00", ch: "beIN Sports" },
    { g: "B", tA: "CAN", tB: "BIH", date: "12 Juin 2026", time: "21:00", ch: "beIN Sports" },

    // Samedi 13 Juin 2026
    { g: "D", tA: "USA", tB: "PAR", date: "13 Juin 2026", time: "03:00", ch: "TF1" },
    { g: "B", tA: "QAT", tB: "SUI", date: "13 Juin 2026", time: "21:00", ch: "M6" },

    // Dimanche 14 Juin 2026
    { g: "C", tA: "BRA", tB: "MAR", date: "14 Juin 2026", time: "00:00", ch: "TF1" },
    { g: "C", tA: "HAI", tB: "SCO", date: "14 Juin 2026", time: "03:00", ch: "beIN Sports" },
    { g: "D", tA: "AUS", tB: "TUR", date: "14 Juin 2026", time: "06:00", ch: "beIN Sports" },
    { g: "E", tA: "GER", tB: "CUW", date: "14 Juin 2026", time: "19:00", ch: "beIN Sports" },
    { g: "F", tA: "NED", tB: "JPN", date: "14 Juin 2026", time: "22:00", ch: "M6" },

    // Lundi 15 Juin 2026
    { g: "E", tA: "CIV", tB: "ECU", date: "15 Juin 2026", time: "01:00", ch: "beIN Sports" },
    { g: "F", tA: "SWE", tB: "TUN", date: "15 Juin 2026", time: "04:00", ch: "beIN Sports" },
    { g: "H", tA: "ESP", tB: "CPV", date: "15 Juin 2026", time: "18:00", ch: "beIN Sports" },
    { g: "G", tA: "BEL", tB: "EGY", date: "15 Juin 2026", time: "21:00", ch: "TF1" },

    // Mardi 16 Juin 2026
    { g: "H", tA: "KSA", tB: "URU", date: "16 Juin 2026", time: "00:00", ch: "beIN Sports" },
    { g: "G", tA: "IRN", tB: "NZL", date: "16 Juin 2026", time: "03:00", ch: "beIN Sports" },
    { g: "I", tA: "FRA", tB: "SEN", date: "16 Juin 2026", time: "21:00", ch: "TF1" },

    // Mercredi 17 Juin 2026
    { g: "I", tA: "IRQ", tB: "NOR", date: "17 Juin 2026", time: "00:00", ch: "beIN Sports" },
    { g: "J", tA: "ARG", tB: "ALG", date: "17 Juin 2026", time: "03:00", ch: "M6" },
    { g: "J", tA: "AUT", tB: "JOR", date: "17 Juin 2026", time: "06:00", ch: "beIN Sports" },
    { g: "K", tA: "POR", tB: "COD", date: "17 Juin 2026", time: "19:00", ch: "beIN Sports" },
    { g: "L", tA: "ENG", tB: "CRO", date: "17 Juin 2026", time: "22:00", ch: "TF1" },

    // Jeudi 18 Juin 2026
    { g: "L", tA: "GHA", tB: "PAN", date: "18 Juin 2026", time: "01:00", ch: "beIN Sports" },
    { g: "K", tA: "UZB", tB: "COL", date: "18 Juin 2026", time: "04:00", ch: "beIN Sports" },
    { g: "A", tA: "CZE", tB: "RSA", date: "18 Juin 2026", time: "18:00", ch: "beIN Sports" },
    { g: "B", tA: "SUI", tB: "BIH", date: "18 Juin 2026", time: "21:00", ch: "M6" },

    // Vendredi 19 Juin 2026
    { g: "B", tA: "CAN", tB: "QAT", date: "19 Juin 2026", time: "00:00", ch: "beIN Sports" },
    { g: "A", tA: "MEX", tB: "KOR", date: "19 Juin 2026", time: "03:00", ch: "beIN Sports" },
    { g: "D", tA: "USA", tB: "AUS", date: "19 Juin 2026", time: "21:00", ch: "TF1" },

    // Samedi 20 Juin 2026
    { g: "C", tA: "SCO", tB: "MAR", date: "20 Juin 2026", time: "00:00", ch: "beIN Sports" },
    { g: "C", tA: "BRA", tB: "HAI", date: "20 Juin 2026", time: "02:30", ch: "TF1" },
    { g: "D", tA: "TUR", tB: "PAR", date: "20 Juin 2026", time: "05:00", ch: "beIN Sports" },
    { g: "F", tA: "NED", tB: "SWE", date: "20 Juin 2026", time: "19:00", ch: "beIN Sports" },
    { g: "E", tA: "GER", tB: "CIV", date: "20 Juin 2026", time: "22:00", ch: "M6" },

    // Dimanche 21 Juin 2026
    { g: "E", tA: "ECU", tB: "CUW", date: "21 Juin 2026", time: "02:00", ch: "beIN Sports" },
    { g: "F", tA: "TUN", tB: "JPN", date: "21 Juin 2026", time: "06:00", ch: "beIN Sports" },
    { g: "H", tA: "ESP", tB: "KSA", date: "21 Juin 2026", time: "18:00", ch: "M6" },
    { g: "G", tA: "BEL", tB: "IRN", date: "21 Juin 2026", time: "21:00", ch: "beIN Sports" },

    // Lundi 22 Juin 2026
    { g: "H", tA: "URU", tB: "CPV", date: "22 Juin 2026", time: "00:00", ch: "beIN Sports" },
    { g: "G", tA: "NZL", tB: "EGY", date: "22 Juin 2026", time: "03:00", ch: "beIN Sports" },
    { g: "J", tA: "ARG", tB: "AUT", date: "22 Juin 2026", time: "19:00", ch: "TF1" },
    { g: "I", tA: "FRA", tB: "IRQ", date: "22 Juin 2026", time: "23:00", ch: "TF1" },

    // Mardi 23 Juin 2026
    { g: "I", tA: "NOR", tB: "SEN", date: "23 Juin 2026", time: "02:00", ch: "beIN Sports" },
    { g: "J", tA: "JOR", tB: "ALG", date: "23 Juin 2026", time: "05:00", ch: "beIN Sports" },
    { g: "K", tA: "POR", tB: "UZB", date: "23 Juin 2026", time: "19:00", ch: "M6" },
    { g: "L", tA: "ENG", tB: "GHA", date: "23 Juin 2026", time: "22:00", ch: "beIN Sports" },

    // Mercredi 24 Juin 2026
    { g: "L", tA: "PAN", tB: "CRO", date: "24 Juin 2026", time: "01:00", ch: "beIN Sports" },
    { g: "K", tA: "COL", tB: "COD", date: "24 Juin 2026", time: "04:00", ch: "beIN Sports" },
    { g: "B", tA: "SUI", tB: "CAN", date: "24 Juin 2026", time: "21:00", ch: "beIN Sports" },
    { g: "B", tA: "BIH", tB: "QAT", date: "24 Juin 2026", time: "21:00", ch: "beIN Sports" },

    // Jeudi 25 Juin 2026
    { g: "C", tA: "SCO", tB: "BRA", date: "25 Juin 2026", time: "00:00", ch: "TF1" },
    { g: "C", tA: "MAR", tB: "HAI", date: "25 Juin 2026", time: "00:00", ch: "beIN Sports" },
    { g: "A", tA: "CZE", tB: "MEX", date: "25 Juin 2026", time: "03:00", ch: "M6" },
    { g: "A", tA: "RSA", tB: "KOR", date: "25 Juin 2026", time: "03:00", ch: "beIN Sports" },
    { g: "E", tA: "CUW", tB: "CIV", date: "25 Juin 2026", time: "22:00", ch: "beIN Sports" },
    { g: "E", tA: "ECU", tB: "GER", date: "25 Juin 2026", time: "22:00", ch: "beIN Sports" },

    // Vendredi 26 Juin 2026
    { g: "F", tA: "JPN", tB: "SWE", date: "26 Juin 2026", time: "01:00", ch: "beIN Sports" },
    { g: "F", tA: "TUN", tB: "NED", date: "26 Juin 2026", time: "01:00", ch: "beIN Sports" },
    { g: "D", tA: "TUR", tB: "USA", date: "26 Juin 2026", time: "04:00", ch: "beIN Sports" },
    { g: "D", tA: "PAR", tB: "AUS", date: "26 Juin 2026", time: "04:00", ch: "beIN Sports" },
    { g: "I", tA: "NOR", tB: "FRA", date: "26 Juin 2026", time: "21:00", ch: "M6" },
    { g: "I", tA: "SEN", tB: "IRQ", date: "26 Juin 2026", time: "21:00", ch: "beIN Sports" },

    // Samedi 27 Juin 2026
    { g: "H", tA: "CPV", tB: "KSA", date: "27 Juin 2026", time: "02:00", ch: "beIN Sports" },
    { g: "H", tA: "URU", tB: "ESP", date: "27 Juin 2026", time: "02:00", ch: "TF1" },
    { g: "G", tA: "EGY", tB: "IRN", date: "27 Juin 2026", time: "05:00", ch: "beIN Sports" },
    { g: "G", tA: "NZL", tB: "BEL", date: "27 Juin 2026", time: "05:00", ch: "beIN Sports" },
    { g: "L", tA: "PAN", tB: "ENG", date: "27 Juin 2026", time: "23:00", ch: "beIN Sports" },
    { g: "L", tA: "CRO", tB: "GHA", date: "27 Juin 2026", time: "23:00", ch: "beIN Sports" },

    // Dimanche 28 Juin 2026
    { g: "K", tA: "COL", tB: "POR", date: "28 Juin 2026", time: "01:30", ch: "TF1" },
    { g: "K", tA: "COD", tB: "UZB", date: "28 Juin 2026", time: "01:30", ch: "beIN Sports" },
    { g: "J", tA: "ALG", tB: "AUT", date: "28 Juin 2026", time: "04:00", ch: "M6" },
    { g: "J", tA: "JOR", tB: "ARG", date: "28 Juin 2026", time: "04:00", ch: "beIN Sports" },
  ];

  rawGroupStage.forEach((item, index) => {
    matches.push({
      id: `G-${item.g}-${index + 1}`,
      stage: Stage.GROUPS,
      group: item.g,
      matchNumber: matchNumber++,
      teamAId: item.tA,
      teamBId: item.tB,
      scoreA: null,
      scoreB: null,
      date: item.date,
      time: item.time,
      channel: item.ch,
    });
  });

  // Sort Group stage matches by simulated match number/date
  matches.sort((a, b) => (a.matchNumber || 0) - (b.matchNumber || 0));

  // --- KNOCKOUT PATHS SETUP ---
  // 1. ROUND of 32 (16e de finale) - 16 matches (M73 to M88)
  const r32Placeholders = [
    { num: 73, labelA: "2ème Groupe A", labelB: "2ème Groupe B", date: "28 Juin 2026", time: "21:00", ch: "beIN Sports" },
    { num: 74, labelA: "1er Groupe E", labelB: "3ème Gr. A/B/C/D/F", date: "29 Juin 2026", time: "22:30", ch: "beIN Sports" },
    { num: 75, labelA: "1er Groupe F", labelB: "2ème Groupe C", date: "30 Juin 2026", time: "03:00", ch: "beIN Sports" },
    { num: 76, labelA: "1er Groupe C", labelB: "2ème Groupe F", date: "29 Juin 2026", time: "19:00", ch: "beIN Sports" },
    { num: 77, labelA: "1er Groupe I", labelB: "3ème Gr. C/D/F/G/H", date: "30 Juin 2026", time: "23:00", ch: "beIN Sports" },
    { num: 78, labelA: "2ème Groupe E", labelB: "2ème Groupe I", date: "30 Juin 2026", time: "19:00", ch: "beIN Sports" },
    { num: 79, labelA: "1er Groupe A", labelB: "3ème Gr. C/E/F/H/I", date: "1 Juillet 2026", time: "03:00", ch: "beIN Sports" },
    { num: 80, labelA: "1er Groupe L", labelB: "3ème Gr. E/H/I/J/K", date: "1 Juillet 2026", time: "18:00", ch: "beIN Sports" },
    { num: 81, labelA: "1er Groupe D", labelB: "3ème Gr. B/E/F/I/J", date: "2 Juillet 2026", time: "02:00", ch: "beIN Sports" },
    { num: 82, labelA: "1er Groupe G", labelB: "3ème Gr. A/E/H/I/J", date: "1 Juillet 2026", time: "22:00", ch: "beIN Sports" },
    { num: 83, labelA: "2ème Groupe K", labelB: "2ème Groupe L", date: "3 Juillet 2026", time: "01:00", ch: "beIN Sports" },
    { num: 84, labelA: "1er Groupe H", labelB: "2ème Groupe J", date: "2 Juillet 2026", time: "21:00", ch: "beIN Sports" },
    { num: 85, labelA: "1er Groupe B", labelB: "3ème Gr. E/F/G/H/I", date: "3 Juillet 2026", time: "05:00", ch: "beIN Sports" },
    { num: 86, labelA: "1er Groupe J", labelB: "2ème Groupe H", date: "4 Juillet 2026", time: "00:00", ch: "beIN Sports" },
    { num: 87, labelA: "1er Groupe K", labelB: "3ème Gr. D/E/I/J/L", date: "4 Juillet 2026", time: "03:30", ch: "beIN Sports" },
    { num: 88, labelA: "2ème Groupe D", labelB: "2ème Groupe G", date: "3 Juillet 2026", time: "20:00", ch: "beIN Sports" },
  ];

  r32Placeholders.forEach((p, idx) => {
    matches.push({
      id: `R32-${idx + 1}`,
      stage: Stage.ROUND_32,
      matchNumber: p.num,
      teamAId: null,
      teamBId: null,
      teamANamePlaceholder: p.labelA,
      teamBNamePlaceholder: p.labelB,
      scoreA: null,
      scoreB: null,
      date: p.date,
      time: p.time,
      channel: p.ch,
    });
  });

  // 2. ROUND of 16 (8e de finale) - 8 matches (M89 to M96)
  const r16Placeholders = [
    { num: 89, labelA: "Vainqueur #74", labelB: "Vainqueur #77", date: "4 Juillet 2026", time: "23:00", ch: "TF1" },
    { num: 90, labelA: "Vainqueur #73", labelB: "Vainqueur #75", date: "4 Juillet 2026", time: "19:00", ch: "M6" },
    { num: 91, labelA: "Vainqueur #76", labelB: "Vainqueur #78", date: "5 Juillet 2026", time: "22:00", ch: "TF1" },
    { num: 92, labelA: "Vainqueur #79", labelB: "Vainqueur #80", date: "6 Juillet 2026", time: "02:00", ch: "beIN Sports" },
    { num: 93, labelA: "Vainqueur #83", labelB: "Vainqueur #84", date: "6 Juillet 2026", time: "21:00", ch: "M6" },
    { num: 94, labelA: "Vainqueur #81", labelB: "Vainqueur #82", date: "7 Juillet 2026", time: "02:00", ch: "beIN Sports" },
    { num: 95, labelA: "Vainqueur #86", labelB: "Vainqueur #88", date: "7 Juillet 2026", time: "18:00", ch: "TF1" },
    { num: 96, labelA: "Vainqueur #85", labelB: "Vainqueur #87", date: "7 Juillet 2026", time: "22:00", ch: "M6" },
  ];

  r16Placeholders.forEach((p, idx) => {
    matches.push({
      id: `R16-${idx + 1}`,
      stage: Stage.ROUND_16,
      matchNumber: p.num,
      teamAId: null,
      teamBId: null,
      teamANamePlaceholder: p.labelA,
      teamBNamePlaceholder: p.labelB,
      scoreA: null,
      scoreB: null,
      date: p.date,
      time: p.time,
      channel: p.ch,
    });
  });

  // 3. QUARTERS - 4 matches (M97 to M100)
  const qfPlaceholders = [
    { num: 97, labelA: "Vainqueur #89", labelB: "Vainqueur #90", date: "9 Juillet 2026", time: "22:00", ch: "TF1" },
    { num: 98, labelA: "Vainqueur #93", labelB: "Vainqueur #94", date: "10 Juillet 2026", time: "21:00", ch: "M6" },
    { num: 99, labelA: "Vainqueur #91", labelB: "Vainqueur #92", date: "11 Juillet 2026", time: "23:00", ch: "TF1" },
    { num: 100, labelA: "Vainqueur #95", labelB: "Vainqueur #96", date: "12 Juillet 2026", time: "03:00", ch: "M6" },
  ];

  qfPlaceholders.forEach((p, idx) => {
    matches.push({
      id: `QF-${idx + 1}`,
      stage: Stage.QUARTERS,
      matchNumber: p.num,
      teamAId: null,
      teamBId: null,
      teamANamePlaceholder: p.labelA,
      teamBNamePlaceholder: p.labelB,
      scoreA: null,
      scoreB: null,
      date: p.date,
      time: p.time,
      channel: p.ch,
    });
  });

  // 4. SEMIS - 2 matches (M101 to M102)
  const sfPlaceholders = [
    { num: 101, labelA: "Vainqueur #97", labelB: "Vainqueur #98", date: "14 Juillet 2026", time: "21:00", ch: "TF1" },
    { num: 102, labelA: "Vainqueur #99", labelB: "Vainqueur #100", date: "15 Juillet 2026", time: "21:00", ch: "M6" },
  ];

  sfPlaceholders.forEach((p, idx) => {
    matches.push({
      id: `SF-${idx + 1}`,
      stage: Stage.SEMIS,
      matchNumber: p.num,
      teamAId: null,
      teamBId: null,
      teamANamePlaceholder: p.labelA,
      teamBNamePlaceholder: p.labelB,
      scoreA: null,
      scoreB: null,
      date: p.date,
      time: p.time,
      channel: p.ch,
    });
  });

  // 5. THIRD PLACE - 1 match (M103)
  matches.push({
    id: "TP-1",
    stage: Stage.THIRD_PLACE,
    matchNumber: 103,
    teamAId: null,
    teamBId: null,
    teamANamePlaceholder: "Perdant #101",
    teamBNamePlaceholder: "Perdant #102",
    scoreA: null,
    scoreB: null,
    date: "18 Juillet 2026",
    time: "23:00",
    channel: "TF1",
  });

  // 6. FINAL - 1 match (M104)
  matches.push({
    id: "F-1",
    stage: Stage.FINAL,
    matchNumber: 104,
    teamAId: null,
    teamBId: null,
    teamANamePlaceholder: "Vainqueur #101",
    teamBNamePlaceholder: "Vainqueur #102",
    scoreA: null,
    scoreB: null,
    date: "19 Juillet 2026",
    time: "21:00",
    channel: "TF1",
  });

  return matches;
}
