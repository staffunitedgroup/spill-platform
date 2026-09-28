

export type SpillType =
  | "QUESTION"
  | "INSTRUCTION"
  | "CHALLENGE"
  | "OBSERVATION"
  | "SCENARIO"
  | "VISION";

export const TOTAL_SPILLS = 42;
export const PASSES_PER_PLAYER = 2;


function hashString(input: string): number {
  let h = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

export function seededRandom(seed: string): () => number {
  let a = hashString(seed);
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}


export type Level = {
  number: 1 | 2 | 3;
  name: string;
  tagline: string;
  startsAt: number;
  color: string;
};

export const LEVELS: Level[] = [
  {
    number: 1,
    name: "Warm up",
    tagline: "Easy openers. Get comfortable.",
    startsAt: 1,
    color: "#C0C4C8" /* SPILL Silver */,
  },
  {
    number: 2,
    name: "Deeper",
    tagline: "Less small talk. More real talk.",
    startsAt: 15,
    color: "#E8472F" /* SPILL Red */,
  },
  {
    number: 3,
    name: "All in",
    tagline: "No hiding now. SPILL it all.",
    startsAt: 29,
    color: "#FF5638" /* SPILL Neon */,
  },
];

export function getLevel(sequence: number): Level {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (sequence >= level.startsAt) current = level;
  }
  return current;
}

export function isLevelStart(sequence: number): boolean {
  return LEVELS.some((l) => l.startsAt === sequence && l.number > 1);
}


export type TwistId =
  | "HOT_SEAT"
  | "EVERYONE"
  | "REVERSE"
  | "SPEED"
  | "SWAP"
  | "POINT"
  | "FINAL";

export type Twist = {
  id: TwistId;
  title: string;
  rule: string;
  bonus?: string;
  timer?: number;
  countdown?: boolean;
  modes: ("TWO_PERSON" | "GROUP")[];
};

const TWISTS: Twist[] = [
  {
    id: "HOT_SEAT",
    title: "Hot seat",
    rule: "{name} answers — then everyone else gets ONE follow-up question. No dodging.",
    modes: ["TWO_PERSON", "GROUP"],
  },
  {
    id: "EVERYONE",
    title: "Everyone answers",
    rule: "Nobody is safe. Everyone answers this one, {name} goes first.",
    modes: ["TWO_PERSON", "GROUP"],
  },
  {
    id: "REVERSE",
    title: "Reverse",
    rule: "Everyone else answers first. {name} goes last and picks the best answer.",
    modes: ["GROUP"],
  },
  {
    id: "SPEED",
    title: "Speed round",
    rule: "{name} has 15 seconds. First thought wins. No editing.",
    timer: 15,
    modes: ["TWO_PERSON", "GROUP"],
  },
  {
    id: "SWAP",
    title: "Swap",
    rule: "{name} answers AS the other person. They score the accuracy from 1 to 10.",
    modes: ["TWO_PERSON"],
  },
  {
    id: "POINT",
    title: "On three, point",
    rule: "Bonus round before the card. On 3, everyone points at the answer — then {name} takes the SPILL.",
    countdown: true,
    modes: ["GROUP"],
  },
];

const FINAL_TWIST: Twist = {
  id: "FINAL",
  title: "Final SPILL",
  rule: "Last card. Everyone answers. {name} closes it out.",
  modes: ["TWO_PERSON", "GROUP"],
};

const POINT_PROMPTS = [
  "Who here is most likely to become famous?",
  "Who would survive longest on a desert island?",
  "Who is secretly the most competitive?",
  "Who would you call at 3am in an emergency?",
  "Who has the most chaotic phone gallery?",
  "Who would win a staring contest right now?",
  "Who is most likely to cry at a movie?",
  "Who gives the best advice?",
  "Who would be the best travel partner?",
  "Who is most likely to start a business this year?",
];

export const TWIST_CHANCE = 0.24;


export function getTwist(
  sessionId: string,
  sequence: number,
  mode: "TWO_PERSON" | "GROUP",
  previousHadTwist: boolean,
): Twist | null {
  if (sequence >= TOTAL_SPILLS) return FINAL_TWIST;
  if (sequence <= 2 || previousHadTwist) return null;

  const rand = seededRandom(`${sessionId}:twist:${sequence}`);
  const chance = TWIST_CHANCE + (getLevel(sequence).number - 1) * 0.06;
  if (rand() > chance) return null;

  const pool = TWISTS.filter((t) => t.modes.includes(mode));
  const twist = pool[Math.floor(rand() * pool.length)];
  if (twist.id === "POINT") {
    return {
      ...twist,
      bonus: POINT_PROMPTS[Math.floor(rand() * POINT_PROMPTS.length)],
    };
  }
  return twist;
}

export function fillName(text: string, name: string): string {
  return text.replaceAll("{name}", name);
}


export function pickSpotlight(
  sessionId: string,
  sequence: number,
  playerCount: number,
  history: number[],
): number {
  if (playerCount <= 1) return 0;
  const counts = Array.from({ length: playerCount }, () => 0);
  history.forEach((i) => {
    if (i >= 0 && i < playerCount) counts[i]++;
  });
  const last = history[history.length - 1];
  const min = Math.min(...counts);
  let candidates = counts
    .map((c, i) => ({ c, i }))
    .filter((x) => x.c === min && x.i !== last)
    .map((x) => x.i);
  if (candidates.length === 0) {
    candidates = counts.map((_, i) => i).filter((i) => i !== last);
  }
  const rand = seededRandom(`${sessionId}:spotlight:${sequence}`);
  return candidates[Math.floor(rand() * candidates.length)];
}


export function getTimerSeconds(
  type: SpillType,
  twist: Twist | null,
): number | null {
  if (twist?.timer) return twist.timer;
  switch (type) {
    case "INSTRUCTION":
      return 60;
    case "CHALLENGE":
      return 45;
    case "OBSERVATION":
      return 20;
    default:
      return null;
  }
}


const FORFEITS = [
  "Tell the table your most embarrassing autocorrect.",
  "The table picks your next drink or snack.",
  "Do your best impression of someone at this table.",
  "Show the last photo in your camera roll (you can veto one).",
  "Speak only in questions until the next card.",
  "Give a 10-second dramatic speech about the object nearest to you.",
  "Let the table read your screen-time stats out loud.",
  "Share the last thing you searched for.",
  "Compliment every person here — one sentence each.",
  "Hum a song until someone guesses it.",
];

export function getForfeit(sessionId: string, sequence: number): string {
  const rand = seededRandom(`${sessionId}:forfeit:${sequence}`);
  return FORFEITS[Math.floor(rand() * FORFEITS.length)];
}


export function getHeat(streak: number, sequence: number): number {
  const levelBonus = (getLevel(sequence).number - 1) * 10;
  return Math.max(0, Math.min(100, streak * 9 + levelBonus));
}

export function getHeatLabel(heat: number): string {
  if (heat >= 85) return "On fire";
  if (heat >= 60) return "Heating up";
  if (heat >= 30) return "Warm";
  return "Cool";
}

export const STREAK_MILESTONES = [5, 10, 15, 20, 30];


export type CardRecord = {
  sequence: number;
  type: SpillType;
  title: string;
  text: string;
  spotlight: number;
  twist: TwistId | null;
  passed: boolean;
};

export type GameState = {
  version: 1;
  startedAt: number;
  passesUsed: number[]; // index = player
  streak: number;
  bestStreak: number;
  cards: CardRecord[];
  saved: number[]; // sequences
};

export function createGameState(playerCount: number): GameState {
  return {
    version: 1,
    startedAt: Date.now(),
    passesUsed: Array.from({ length: playerCount }, () => 0),
    streak: 0,
    bestStreak: 0,
    cards: [],
    saved: [],
  };
}

export type GameSummary = {
  minutes: number;
  played: number;
  answered: number;
  passed: number;
  twists: number;
  bestStreak: number;
  mostSpotlighted: number | null;
};

export function summarize(state: GameState, playerCount: number): GameSummary {
  const counts = Array.from({ length: playerCount }, () => 0);
  state.cards.forEach((c) => {
    if (c.spotlight < playerCount) counts[c.spotlight]++;
  });
  const max = Math.max(0, ...counts);
  const leaders = counts.filter((c) => c === max).length;
  return {
    minutes: Math.max(1, Math.round((Date.now() - state.startedAt) / 60000)),
    played: state.cards.length,
    answered: state.cards.filter((c) => !c.passed).length,
    passed: state.cards.filter((c) => c.passed).length,
    twists: state.cards.filter((c) => c.twist).length,
    bestStreak: state.bestStreak,
    mostSpotlighted: max > 0 && leaders === 1 ? counts.indexOf(max) : null,
  };
}
