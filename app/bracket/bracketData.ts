export type RegionGame = {
  id: string;
  teamA: { seed: number; name: string };
  teamB: { seed: number; name: string };
};

type Region = {
  name: string;
  round64: RegionGame[];
};

function buildRegion(name: string, teams: string[]): Region {
  // standard 1–16 bracket pairing
  const matchups = [
    [0, 15], // 1 vs 16
    [7, 8],  // 8 vs 9
    [4, 11], // 5 vs 12
    [3, 12], // 4 vs 13
    [5, 10], // 6 vs 11
    [2, 13], // 3 vs 14
    [6, 9],  // 7 vs 10
    [1, 14], // 2 vs 15
  ];

  const round64: RegionGame[] = matchups.map(([a, b], idx) => ({
    id: `g${idx + 1}`,
    teamA: { seed: a + 1, name: teams[a] },
    teamB: { seed: b + 1, name: teams[b] },
  }));

  return { name, round64 };
}

export const BRACKET_2026_PLACEHOLDER: Region[] = [
  buildRegion("South", [
    "Auburn",
    "Michigan State",
    "Iowa State",
    "Texas A&M",
    "Michigan",
    "Ole Miss",
    "Marquette",
    "Louisville",
    "Creighton",
    "New Mexico",
    "North Carolina",
    "UC San Diego",
    "Yale",
    "Lipscomb",
    "Bryant",
    "Alabama State",
  ]),

  buildRegion("West", [
    "Florida",
    "St. John's",
    "Texas Tech",
    "Maryland",
    "Memphis",
    "Missouri",
    "Kansas",
    "UConn",
    "Oklahoma",
    "Arkansas",
    "Drake",
    "Colorado State",
    "Grand Canyon",
    "UNC Wilmington",
    "Omaha",
    "Norfolk State",
  ]),

  buildRegion("East", [
    "Duke",
    "Alabama",
    "Wisconsin",
    "Arizona",
    "Oregon",
    "BYU",
    "Saint Mary's",
    "Mississippi State",
    "Baylor",
    "Vanderbilt",
    "VCU",
    "Liberty",
    "Akron",
    "Montana",
    "Robert Morris",
    "Mount St. Mary's",
  ]),

  buildRegion("Midwest", [
    "Houston",
    "Tennessee",
    "Kentucky",
    "Purdue",
    "Clemson",
    "Illinois",
    "UCLA",
    "Gonzaga",
    "Georgia",
    "Utah State",
    "Xavier",
    "McNeese State",
    "High Point",
    "Troy",
    "Wofford",
    "SIU Edwardsville",
  ]),
];
