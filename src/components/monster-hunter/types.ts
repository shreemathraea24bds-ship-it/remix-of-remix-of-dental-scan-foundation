export interface Monster {
  id: string;
  name: string;
  sector: number;
  hp: number;
  maxHp: number;
  emoji: string;
  color: string;
  defeated: boolean;
  x: number;
  y: number;
  // Bestiary additions
  habitat: string;
  weakness: string;
  weaknessTechnique: string;
  loot: string;
  lootEmoji: string;
  // Ability system
  ability: MonsterAbility | null;
  shielded: boolean;
  invisible: boolean;
  spawnedMinion: boolean;
}

export type MonsterAbility = "bubble-shield" | "inviso-grime" | "multiplier" | null;

export interface DailyRecord {
  date: string;
  completed: boolean;
  monstersDefeated: number;
  totalMonsters: number;
  durationSeconds: number;
  lootCollected: string[];
}

export interface Trophy {
  id: string;
  name: string;
  description: string;
  emoji: string;
  requirement: number;
  unlocked: boolean;
  unlockedDate?: string;
  category: "streak" | "loot";
}

export interface ParentReward {
  id: string;
  streakRequired: number;
  description: string;
  claimed: boolean;
}

/* ------------------------------------------------------------------ */
/*  Anti-Cheat / Integrity                                             */
/* ------------------------------------------------------------------ */

export interface AntiCheatState {
  attackTimestamps: number[];       // timestamps of recent attacks for rhythm detection
  sectorHits: Record<number, number>; // hits per sector
  totalHits: number;
  mimicSpawned: boolean;
  mimicPenaltySeconds: number;      // seconds added due to mimic penalty
  blockModeActive: boolean;         // monster entered block mode (bad rhythm)
  dryBrushWarning: boolean;         // foam factor warning triggered
  coverageWarnings: number;         // how many times coverage was flagged
}

export interface IntegrityReport {
  accuracy: number;        // 0–100 coverage score
  vigor: number;           // 0–100 rhythm/pressure score
  integrityScore: number;  // 0–100 overall
  zoneCoverage: {
    topLeft: number;
    topCenter: number;
    topRight: number;
    left: number;
    right: number;
    bottomLeft: number;
    bottomCenter: number;
    bottomRight: number;
  };
  mimicPenalties: number;
  blockModeTriggered: number;
  dryBrushWarnings: number;
  totalAttacks: number;
  duration: number;
}

/* ------------------------------------------------------------------ */
/*  Seasonal themes                                                    */
/* ------------------------------------------------------------------ */

export type Season = "default" | "halloween" | "winter" | "summer";

export interface SeasonalSkin {
  season: Season;
  label: string;
  themeEmoji: string;
  bgClass: string;
  monsters: {
    name: string;
    emoji: string;
    color: string;
    habitat: string;
    habitatDetail: string;
    weakness: string;
    weaknessTechnique: string;
    loot: string;
    lootEmoji: string;
  }[];
}

export function getCurrentSeason(): Season {
  const month = new Date().getMonth(); // 0-indexed
  if (month === 9 || month === 10) return "halloween"; // Oct–Nov
  if (month === 11 || month === 0 || month === 1) return "winter"; // Dec–Feb
  if (month >= 5 && month <= 7) return "summer"; // Jun–Aug
  return "default";
}

export const SEASONAL_SKINS: Record<Season, SeasonalSkin> = {
  default: {
    season: "default",
    label: "Classic",
    themeEmoji: "🦷",
    bgClass: "",
    monsters: [],
  },
  halloween: {
    season: "halloween",
    label: "Halloween",
    themeEmoji: "🎃",
    bgClass: "from-[hsl(280,60%,10%)] via-[hsl(280,40%,15%)] to-[hsl(0,60%,10%)]",
    monsters: [
      { name: "Vampire Fang", emoji: "🧛", color: "hsl(0 70% 45%)", habitat: "Front Canines", habitatDetail: "The sharp canine teeth", weakness: "Garlic Scrub", weaknessTechnique: "Vigorous circular motion on canines", loot: "Fang Polish", lootEmoji: "🦷" },
      { name: "Zombie Gum", emoji: "🧟", color: "hsl(120 30% 35%)", habitat: "Gum Line", habitatDetail: "Lurks along the decaying gum line", weakness: "Resurrection Rinse", weaknessTechnique: "45° angle sweep along gums", loot: "Zombie Cure Vial", lootEmoji: "🧪" },
      { name: "Ghost Plaque", emoji: "👻", color: "hsl(220 20% 70%)", habitat: "Everywhere", habitatDetail: "Phases through all tooth surfaces", weakness: "Spirit Sweep", weaknessTechnique: "Long sweeping strokes across all teeth", loot: "Ecto-Sparkle", lootEmoji: "✨" },
      { name: "Pumpkin Rot", emoji: "🎃", color: "hsl(30 90% 50%)", habitat: "Back Molars", habitatDetail: "Nestled in molar crevices", weakness: "Carving Circles", weaknessTechnique: "Deep circular scrubbing on molars", loot: "Pumpkin Seed Shield", lootEmoji: "🛡️" },
      { name: "Candy Corn Creep", emoji: "🍬", color: "hsl(45 100% 55%)", habitat: "Flat Surfaces", habitatDetail: "Stuck on every flat surface", weakness: "Sugar Siege", weaknessTechnique: "15 seconds sustained contact", loot: "Candy Corn Crumb", lootEmoji: "🍭" },
    ],
  },
  winter: {
    season: "winter",
    label: "Winter Holidays",
    themeEmoji: "🎄",
    bgClass: "from-[hsl(210,50%,12%)] via-[hsl(200,40%,18%)] to-[hsl(180,30%,10%)]",
    monsters: [
      { name: "Gingerbread Grime", emoji: "🍪", color: "hsl(30 60% 45%)", habitat: "Back Molars", habitatDetail: "Sticky crumbs on chewing surfaces", weakness: "Cookie Crumble", weaknessTechnique: "Deep circular scrubbing", loot: "Gingerbread Badge", lootEmoji: "🍪" },
      { name: "Candy Cane Cavity", emoji: "🍭", color: "hsl(350 80% 55%)", habitat: "Between Teeth", habitatDetail: "Wedged in the front gaps", weakness: "Peppermint Flick", weaknessTechnique: "Up-and-down vertical motions", loot: "Minty Fresh Medal", lootEmoji: "🌿" },
      { name: "Frost Fang", emoji: "❄️", color: "hsl(200 80% 70%)", habitat: "Front Teeth", habitatDetail: "Icy buildup on front surfaces", weakness: "Warm Sweep", weaknessTechnique: "Gentle warming sweeps", loot: "Ice Crystal Gem", lootEmoji: "💎" },
      { name: "Hot Cocoa Sludge", emoji: "☕", color: "hsl(20 50% 30%)", habitat: "Tongue Surface", habitatDetail: "Chocolate residue on the tongue", weakness: "Tongue Thaw", weaknessTechnique: "Long sweep back to front", loot: "Cocoa Bean Token", lootEmoji: "🫘" },
      { name: "Snowflake Slime", emoji: "⛄", color: "hsl(210 30% 80%)", habitat: "Gum Line", habitatDetail: "Frosty buildup along gums", weakness: "De-Ice Angle", weaknessTechnique: "45° angle along gum line", loot: "Snowflake Star", lootEmoji: "⭐" },
    ],
  },
  summer: {
    season: "summer",
    label: "Summer Splash",
    themeEmoji: "🏖️",
    bgClass: "from-[hsl(40,70%,15%)] via-[hsl(190,50%,18%)] to-[hsl(30,60%,12%)]",
    monsters: [
      { name: "Ice Cream Stain", emoji: "🍦", color: "hsl(340 60% 70%)", habitat: "Front Teeth", habitatDetail: "Dripping down the front teeth", weakness: "Brain Freeze Blast", weaknessTechnique: "Quick up-and-down scrubbing", loot: "Sprinkle Shield", lootEmoji: "🛡️" },
      { name: "Popsicle Plaque", emoji: "🧊", color: "hsl(200 70% 60%)", habitat: "Tongue Surface", habitatDetail: "Blue tongue residue", weakness: "Melt Sweep", weaknessTechnique: "Long tongue sweep back to front", loot: "Cool Tongue Potion", lootEmoji: "🧪" },
      { name: "Watermelon Wedge", emoji: "🍉", color: "hsl(140 60% 45%)", habitat: "Between Teeth", habitatDetail: "Seeds stuck between teeth", weakness: "Seed Flick", weaknessTechnique: "Vertical flicking motions", loot: "Melon Gem", lootEmoji: "💎" },
      { name: "Sunburn Sludge", emoji: "☀️", color: "hsl(45 100% 55%)", habitat: "Flat Surfaces", habitatDetail: "Baked-on residue everywhere", weakness: "SPF Scrub", weaknessTechnique: "15 seconds sustained contact", loot: "Sun Medal", lootEmoji: "🏅" },
      { name: "Sand Grit", emoji: "🏖️", color: "hsl(40 50% 55%)", habitat: "Gum Line", habitatDetail: "Gritty buildup along gums", weakness: "Tide Wash", weaknessTechnique: "Angled sweeping along gums", loot: "Shell Charm", lootEmoji: "🐚" },
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Bestiary — The 5 canonical plaque monsters                         */
/* ------------------------------------------------------------------ */

export const BESTIARY = [
  {
    name: "Molar Mauler",
    emoji: "🦷",
    color: "hsl(280 70% 55%)",
    habitat: "Back Molars",
    habitatDetail: "Chewing surfaces of rear molars",
    weakness: "Scrub-a-Dub",
    weaknessTechnique: "Deep circular scrubbing",
    loot: "Iron Jaw Badge",
    lootEmoji: "🛡️",
    sectors: [0, 2, 5, 7], // corners — back teeth
    hp: 120,
  },
  {
    name: "Gum-line Grime-lin",
    emoji: "👹",
    color: "hsl(345 100% 76%)",
    habitat: "Gum Line",
    habitatDetail: "Where teeth meet gums",
    weakness: "45° Tilt",
    weaknessTechnique: "Angled brushing to sweep the trench",
    loot: "Pink Shield Medal",
    lootEmoji: "🩷",
    sectors: [3, 4], // sides — gum line
    hp: 100,
  },
  {
    name: "Gap-Gargoyle",
    emoji: "🗿",
    color: "hsl(38 92% 50%)",
    habitat: "Front Teeth Gaps",
    habitatDetail: "Between the front teeth",
    weakness: "Vertical Flick",
    weaknessTechnique: "Up-and-down motions",
    loot: "Shine Sparkle Gem",
    lootEmoji: "💎",
    sectors: [1, 6], // center — front teeth
    hp: 90,
  },
  {
    name: "Tongue-Troll",
    emoji: "👅",
    color: "hsl(145 40% 40%)",
    habitat: "Tongue Surface",
    habitatDetail: "The surface of the tongue",
    weakness: "Long Sweep",
    weaknessTechnique: "One final sweep back to front",
    loot: "Fresh Breath Potion",
    lootEmoji: "🧪",
    sectors: [1, 6], // center
    hp: 80,
  },
  {
    name: "Sugar-Saur",
    emoji: "🍬",
    color: "hsl(51 100% 50%)",
    habitat: "Flat Surfaces",
    habitatDetail: "Random flat tooth surfaces",
    weakness: "Patience",
    weaknessTechnique: "15 seconds of sustained contact",
    loot: "Sticky Sweet Scrap",
    lootEmoji: "🍭",
    sectors: [0, 1, 2, 3, 4, 5, 6, 7], // anywhere
    hp: 150, // tankier — requires patience
  },
] as const;

export const TOOTH_SECTORS = [
  { id: 0, label: "Upper Left", x: 20, y: 25 },
  { id: 1, label: "Upper Center", x: 50, y: 20 },
  { id: 2, label: "Upper Right", x: 80, y: 25 },
  { id: 3, label: "Left Side", x: 15, y: 50 },
  { id: 4, label: "Right Side", x: 85, y: 50 },
  { id: 5, label: "Lower Left", x: 20, y: 75 },
  { id: 6, label: "Lower Center", x: 50, y: 80 },
  { id: 7, label: "Lower Right", x: 80, y: 75 },
] as const;

// Keep for backward compat
export const MONSTER_TYPES = BESTIARY;

/**
 * Returns the active bestiary — seasonal skin monsters replace the defaults
 * but keep the same sector/hp structure from the canonical bestiary.
 */
export function getSeasonalBestiary(season?: Season) {
  const s = season ?? getCurrentSeason();
  const skin = SEASONAL_SKINS[s];
  if (s === "default" || skin.monsters.length === 0) return [...BESTIARY];

  // Map seasonal skins onto canonical bestiary (same sectors & hp)
  return BESTIARY.map((base, i) => {
    const skinMonster = skin.monsters[i % skin.monsters.length];
    return {
      ...base,
      name: skinMonster.name,
      emoji: skinMonster.emoji,
      color: skinMonster.color,
      habitat: skinMonster.habitat,
      habitatDetail: skinMonster.habitatDetail,
      weakness: skinMonster.weakness,
      weaknessTechnique: skinMonster.weaknessTechnique,
      loot: skinMonster.loot,
      lootEmoji: skinMonster.lootEmoji,
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Loot-based milestone rewards                                       */
/* ------------------------------------------------------------------ */

export const TROPHIES: Trophy[] = [
  // Streak rewards
  { id: "first-battle", name: "First Battle", description: "Complete your first brushing session", emoji: "⚔️", requirement: 1, unlocked: false, category: "streak" },
  { id: "golden-brush", name: "Golden Brush", description: "3-day streak — your toothbrush turns gold!", emoji: "✨", requirement: 3, unlocked: false, category: "streak" },
  { id: "lightning-effect", name: "Lightning Effect", description: "7-day streak — sparks fly when you attack!", emoji: "⚡", requirement: 7, unlocked: false, category: "streak" },
  { id: "boss-mode", name: "Boss Mode", description: "14-day streak — face King Cavity!", emoji: "👑", requirement: 14, unlocked: false, category: "streak" },
  { id: "legend", name: "Dental Legend", description: "30-day streak — ultimate champion!", emoji: "🌟", requirement: 30, unlocked: false, category: "streak" },
  // Loot rewards
  { id: "iron-jaw", name: "Iron Jaw Badge", description: "Defeat the Molar Mauler", emoji: "🛡️", requirement: 1, unlocked: false, category: "loot" },
  { id: "pink-shield", name: "Pink Shield Medal", description: "Defeat the Gum-line Grime-lin", emoji: "🩷", requirement: 1, unlocked: false, category: "loot" },
  { id: "sparkle-gem", name: "Shine Sparkle Gem", description: "Defeat the Gap-Gargoyle", emoji: "💎", requirement: 1, unlocked: false, category: "loot" },
  { id: "fresh-breath", name: "Fresh Breath Potion", description: "Defeat the Tongue-Troll", emoji: "🧪", requirement: 1, unlocked: false, category: "loot" },
  { id: "sweet-scrap", name: "Sticky Sweet Scrap", description: "Defeat the Sugar-Saur", emoji: "🍭", requirement: 1, unlocked: false, category: "loot" },
];

/* ------------------------------------------------------------------ */
/*  Monster abilities                                                  */
/* ------------------------------------------------------------------ */

export const ABILITY_INFO: Record<string, { name: string; description: string; emoji: string }> = {
  "bubble-shield": {
    name: "Bubble Shield",
    description: "Hold at medium speed — not too fast, not too slow!",
    emoji: "🫧",
  },
  "inviso-grime": {
    name: "Inviso-Grime",
    description: "Monster turns invisible! Brush where you last saw it!",
    emoji: "👻",
  },
  "multiplier": {
    name: "Multiplier",
    description: "Don't stop! Pausing spawns minions!",
    emoji: "🪱",
  },
};
