export interface BodyData {
  id: string;
  name: string;
  kind: "star" | "rocky" | "gas" | "ice";
  typeLabel: string;
  color: string; // lit side
  colorDeep: string; // shadow side
  glow: string; // rgba glow
  radius: number; // draw radius in world units
  orbitAU: number; // 0 for the Sun
  orbitWorld: number; // rendered orbit radius in world units
  diameterKm: number;
  earthRatio: string;
  distanceMkm: number | null;
  distanceAU: number | null;
  periodDays: number; // real orbital period
  periodLabel: string;
  dayLength: string;
  moons: number;
  tempC: string;
  fact: string;
  ring?: { inner: number; outer: number; tilt: number };
  moon?: { dist: number; radius: number; periodDays: number };
  startAngle: number;
}

const orbitOf = (au: number) => Math.pow(au, 0.44) * 118;

export const SUN: BodyData = {
  id: "sun",
  name: "Sun",
  kind: "star",
  typeLabel: "G-type main-sequence star",
  color: "#ffd98c",
  colorDeep: "#ff8a2a",
  glow: "rgba(255,176,84,0.55)",
  radius: 30,
  orbitAU: 0,
  orbitWorld: 0,
  diameterKm: 1392700,
  earthRatio: "109× Earth",
  distanceMkm: null,
  distanceAU: null,
  periodDays: 0,
  periodLabel: "—",
  dayLength: "27 Earth days (equator)",
  moons: 0,
  tempC: "5,505 °C surface",
  fact: "The Sun holds 99.86% of all mass in the Solar System. Every second it fuses ~600 million tonnes of hydrogen into helium.",
  startAngle: 0,
};

export const PLANETS: BodyData[] = [
  {
    id: "mercury",
    name: "Mercury",
    kind: "rocky",
    typeLabel: "Terrestrial planet",
    color: "#c8b8a4",
    colorDeep: "#5d5245",
    glow: "rgba(200,184,164,0.5)",
    radius: 4.4,
    orbitAU: 0.39,
    orbitWorld: orbitOf(0.39),
    diameterKm: 4879,
    earthRatio: "0.38× Earth",
    distanceMkm: 57.9,
    distanceAU: 0.39,
    periodDays: 88,
    periodLabel: "88 days",
    dayLength: "59 Earth days",
    moons: 0,
    tempC: "−173 to 427 °C",
    fact: "A year on Mercury is just 88 days — but one solar day (sunrise to sunrise) lasts 176 Earth days, longer than its year.",
    startAngle: 0.9,
  },
  {
    id: "venus",
    name: "Venus",
    kind: "rocky",
    typeLabel: "Terrestrial planet",
    color: "#f3d489",
    colorDeep: "#8a5f2e",
    glow: "rgba(243,212,137,0.5)",
    radius: 6.3,
    orbitAU: 0.72,
    orbitWorld: orbitOf(0.72),
    diameterKm: 12104,
    earthRatio: "0.95× Earth",
    distanceMkm: 108.2,
    distanceAU: 0.72,
    periodDays: 224.7,
    periodLabel: "225 days",
    dayLength: "243 Earth days",
    moons: 0,
    tempC: "464 °C average",
    fact: "Venus spins backwards, and so slowly that its day outlasts its year. Crushing CO₂ atmosphere makes it the hottest planet.",
    startAngle: 3.6,
  },
  {
    id: "earth",
    name: "Earth",
    kind: "rocky",
    typeLabel: "Terrestrial planet",
    color: "#63a8f5",
    colorDeep: "#173a75",
    glow: "rgba(99,168,245,0.55)",
    radius: 6.7,
    orbitAU: 1,
    orbitWorld: orbitOf(1),
    diameterKm: 12756,
    earthRatio: "1.00× Earth",
    distanceMkm: 149.6,
    distanceAU: 1,
    periodDays: 365.25,
    periodLabel: "365.25 days",
    dayLength: "24 hours",
    moons: 1,
    tempC: "15 °C average",
    fact: "The only world known to host life. Liquid water covers 71% of its surface, and its large Moon steadies its axial tilt.",
    moon: { dist: 14, radius: 2.1, periodDays: 27.3 },
    startAngle: 5.4,
  },
  {
    id: "mars",
    name: "Mars",
    kind: "rocky",
    typeLabel: "Terrestrial planet",
    color: "#e57951",
    colorDeep: "#6e2c18",
    glow: "rgba(229,121,81,0.5)",
    radius: 5.2,
    orbitAU: 1.52,
    orbitWorld: orbitOf(1.52),
    diameterKm: 6792,
    earthRatio: "0.53× Earth",
    distanceMkm: 227.9,
    distanceAU: 1.52,
    periodDays: 687,
    periodLabel: "687 days",
    dayLength: "24.6 hours",
    moons: 2,
    tempC: "−63 °C average",
    fact: "Home to Olympus Mons, a volcano nearly 3× the height of Everest, and Valles Marineris, a canyon as long as the USA is wide.",
    startAngle: 2.2,
  },
  {
    id: "jupiter",
    name: "Jupiter",
    kind: "gas",
    typeLabel: "Gas giant",
    color: "#e2ae7b",
    colorDeep: "#6b4426",
    glow: "rgba(226,174,123,0.5)",
    radius: 15.5,
    orbitAU: 5.2,
    orbitWorld: orbitOf(5.2),
    diameterKm: 142984,
    earthRatio: "11.2× Earth",
    distanceMkm: 778.6,
    distanceAU: 5.2,
    periodDays: 4333,
    periodLabel: "11.9 years",
    dayLength: "9.9 hours",
    moons: 95,
    tempC: "−108 °C cloud tops",
    fact: "The Great Red Spot is a storm wider than Earth that has raged for centuries. Jupiter's gravity shields the inner planets from comets.",
    startAngle: 4.4,
  },
  {
    id: "saturn",
    name: "Saturn",
    kind: "gas",
    typeLabel: "Gas giant",
    color: "#eccf95",
    colorDeep: "#7c5c30",
    glow: "rgba(236,207,149,0.5)",
    radius: 13,
    orbitAU: 9.58,
    orbitWorld: orbitOf(9.58),
    diameterKm: 120536,
    earthRatio: "9.45× Earth",
    distanceMkm: 1433.5,
    distanceAU: 9.58,
    periodDays: 10759,
    periodLabel: "29.5 years",
    dayLength: "10.7 hours",
    moons: 146,
    tempC: "−139 °C average",
    fact: "Its dazzling rings are 280,000 km wide but only ~10 metres thick — countless shards of nearly pure water ice.",
    ring: { inner: 17.5, outer: 28, tilt: -0.36 },
    startAngle: 0.4,
  },
  {
    id: "uranus",
    name: "Uranus",
    kind: "ice",
    typeLabel: "Ice giant",
    color: "#9fdde0",
    colorDeep: "#2e6d78",
    glow: "rgba(159,221,224,0.5)",
    radius: 9.2,
    orbitAU: 19.19,
    orbitWorld: orbitOf(19.19),
    diameterKm: 51118,
    earthRatio: "4.0× Earth",
    distanceMkm: 2872.5,
    distanceAU: 19.19,
    periodDays: 30687,
    periodLabel: "84 years",
    dayLength: "17.2 hours",
    moons: 28,
    tempC: "−197 °C average",
    fact: "Uranus rolls around the Sun on its side — its axis is tilted 98°, likely knocked over by an ancient collision.",
    ring: { inner: 12.5, outer: 15.5, tilt: -1.2 },
    startAngle: 2.9,
  },
  {
    id: "neptune",
    name: "Neptune",
    kind: "ice",
    typeLabel: "Ice giant",
    color: "#7d95f7",
    colorDeep: "#23337c",
    glow: "rgba(125,149,247,0.55)",
    radius: 8.9,
    orbitAU: 30.07,
    orbitWorld: orbitOf(30.07),
    diameterKm: 49528,
    earthRatio: "3.88× Earth",
    distanceMkm: 4495.1,
    distanceAU: 30.07,
    periodDays: 60190,
    periodLabel: "164.8 years",
    dayLength: "16.1 hours",
    moons: 16,
    tempC: "−201 °C average",
    fact: "Supersonic winds here top 2,100 km/h — the fastest in the Solar System. Neptune was found by mathematics before any telescope.",
    startAngle: 5.9,
  },
];

export const BODIES: BodyData[] = [SUN, ...PLANETS];

export const bodyById = (id: string | null): BodyData | null =>
  id ? BODIES.find((b) => b.id === id) ?? null : null;

export const fmtInt = (n: number) => n.toLocaleString("en-US");

export const fmtDistance = (mkm: number) =>
  mkm >= 1000 ? `${fmtInt(Math.round(mkm * 10) / 10)} million km` : `${mkm} million km`;
