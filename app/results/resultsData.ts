// app/results/resultsData.ts
// Fill these in as games finish: results[gameId] = "seed|Team Name"

export const ROUND_POINTS: Record<string, number> = {
  "64": 1,
  "32": 2,
  "S16": 4,
  "E8": 8,
  "FF": 16,
  "CHAMP": 32,
};

export const RESULTS: Record<string, string> = {
  // ======================
  // SOUTH REGION
  // ======================
  "South_64_g1": "1|Auburn",
  "South_64_g2": "8|Louisville",
  "South_64_g3": "5|Michigan",
  "South_64_g4": "4|Texas A&M",
  "South_64_g5": "6|Ole Miss",
  "South_64_g6": "3|Iowa State",
  "South_64_g7": "7|Marquette",
  "South_64_g8": "2|Michigan State",

  "South_32_0": "1|Auburn",
  "South_32_1": "5|Michigan",
  "South_32_2": "6|Ole Miss",
  "South_32_3": "7|Marquette",

  "South_S16_0": "1|Auburn",
  "South_S16_1": "6|Ole Miss",

  "South_E8_0": "1|Auburn",

  // ======================
  // WEST REGION
  // ======================
  "West_64_g1": "1|Florida",
  "West_64_g2": "8|UConn",
  "West_64_g3": "5|Memphis",
  "West_64_g4": "4|Maryland",
  "West_64_g5": "6|Missouri",
  "West_64_g6": "3|Texas Tech",
  "West_64_g7": "7|Kansas",
  "West_64_g8": "2|St. John's",

  "West_32_0": "1|Florida",
  "West_32_1": "5|Memphis",
  "West_32_2": "6|Missouri",
  "West_32_3": "7|Kansas",

  "West_S16_0": "1|Florida",
  "West_S16_1": "6|Missouri",

  "West_E8_0": "1|Florida",

  // ======================
  // EAST REGION
  // ======================
  "East_64_g1": "1|Duke",
  "East_64_g2": "8|Mississippi State",
  "East_64_g3": "5|Oregon",
  "East_64_g4": "4|Arizona",
  "East_64_g5": "6|BYU",
  "East_64_g6": "3|Wisconsin",
  "East_64_g7": "7|Saint Mary's",
  "East_64_g8": "2|Alabama",

  "East_32_0": "1|Duke",
  "East_32_1": "5|Oregon",
  "East_32_2": "6|BYU",
  "East_32_3": "7|Saint Mary's",

  "East_S16_0": "1|Duke",
  "East_S16_1": "6|BYU",

  "East_E8_0": "1|Duke",

  // ======================
  // MIDWEST REGION
  // ======================
  "Midwest_64_g1": "1|Houston",
  "Midwest_64_g2": "8|Gonzaga",
  "Midwest_64_g3": "5|Clemson",
  "Midwest_64_g4": "4|Purdue",
  "Midwest_64_g5": "6|Illinois",
  "Midwest_64_g6": "3|Kentucky",
  "Midwest_64_g7": "7|UCLA",
  "Midwest_64_g8": "2|Tennessee",

  "Midwest_32_0": "1|Houston",
  "Midwest_32_1": "5|Clemson",
  "Midwest_32_2": "6|Illinois",
  "Midwest_32_3": "7|UCLA",

  "Midwest_S16_0": "1|Houston",
  "Midwest_S16_1": "6|Illinois",

  "Midwest_E8_0": "1|Houston",

  // ======================
  // FINAL FOUR + TITLE
  // West vs South, East vs Midwest
  // ======================
  "FF_SEMI_1": "1|Florida",
  "FF_SEMI_2": "1|Duke",
  "FF_CHAMP": "1|Florida",
};

