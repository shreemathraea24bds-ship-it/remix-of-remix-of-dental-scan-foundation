import { useState, useCallback, useEffect, useRef } from "react";
import {
  type Monster, type DailyRecord, type Trophy, type ParentReward,
  type AntiCheatState, type IntegrityReport,
  TOOTH_SECTORS, TROPHIES, type MonsterAbility,
  getCurrentSeason, getSeasonalBestiary, type Season,
} from "@/components/monster-hunter/types";
import {
  sfxMonsterHit, sfxMonsterDefeated, sfxWarningHum, sfxPowerUp,
  sfxVictoryFanfare, sfxBlockMode, sfxMimicSpawn, sfxSectorClear,
} from "@/components/monster-hunter/sfx";
import {
  voiceEncouragement, voiceDirectional, voiceCompletion, voiceWarningTooFast,
  voiceWarningNoMotion, voiceWarningBlock, voiceVictory, voiceStreakLine, playVoiceMemo,
} from "@/components/monster-hunter/voiceLines";

const STORAGE_KEY = "dentascan-monster-hunter";

interface GameState {
  records: DailyRecord[];
  trophies: Trophy[];
  rewards: ParentReward[];
  currentStreak: number;
  totalBattles: number;
  collectedLoot: string[];
  lastIntegrityReport: IntegrityReport | null;
}

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { records: [], trophies: TROPHIES, rewards: [], currentStreak: 0, totalBattles: 0, collectedLoot: [], lastIntegrityReport: null };
}

function saveState(state: GameState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function calculateStreak(records: DailyRecord[]): number {
  const completed = records.filter((r) => r.completed).map((r) => r.date).sort().reverse();
  if (completed.length === 0) return 0;
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    if (completed.includes(dateStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

function pickAbility(): MonsterAbility {
  const roll = Math.random();
  if (roll < 0.2) return "bubble-shield";
  if (roll < 0.35) return "inviso-grime";
  if (roll < 0.45) return "multiplier";
  return null;
}

const INITIAL_ANTI_CHEAT: AntiCheatState = {
  attackTimestamps: [],
  sectorHits: {},
  totalHits: 0,
  mimicSpawned: false,
  mimicPenaltySeconds: 0,
  blockModeActive: false,
  dryBrushWarning: false,
  coverageWarnings: 0,
};

export function useMonsterHunter() {
  const [season] = useState<Season>(getCurrentSeason);
  const [state, setState] = useState<GameState>(loadState);
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [calibrated, setCalibrated] = useState(false);
  const [lootDrops, setLootDrops] = useState<string[]>([]);
  const [antiCheat, setAntiCheat] = useState<AntiCheatState>(INITIAL_ANTI_CHEAT);
  const [monsterTaunt, setMonsterTaunt] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const blockModeCountRef = useRef(0);
  const dryBrushCountRef = useRef(0);
  const mimicCountRef = useRef(0);
  const voiceMemoPlayedRef = useRef(false);
  const attackCountRef = useRef(0); // for periodic encouragement

  useEffect(() => { saveState(state); }, [state]);

  const playSound = useCallback((freq: number, duration: number) => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq / 4, ctx.currentTime + duration);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }, []);

  // --- Anti-cheat: Oscillation (rhythm) check ---
  const checkRhythm = useCallback((timestamps: number[]): boolean => {
    if (timestamps.length < 4) return true; // not enough data
    const recent = timestamps.slice(-6);
    const intervals: number[] = [];
    for (let i = 1; i < recent.length; i++) {
      intervals.push(recent[i] - recent[i - 1]);
    }
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    // Good rhythm: 300-600ms between taps (roughly 2-3 per second)
    // Too fast: < 150ms, too slow: > 1200ms
    if (avgInterval < 150 || avgInterval > 1200) return false;
    return true;
  }, []);

  // --- Anti-cheat: Coverage check (periodic) ---
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setAntiCheat((prev) => {
        const totalSectors = 8;
        const coveredSectors = Object.keys(prev.sectorHits).filter(
          (k) => prev.sectorHits[Number(k)] > 0
        ).length;

        // If past 60s and coverage < 40%, trigger warning
        if (elapsedSeconds > 60 && coveredSectors / totalSectors < 0.4 && !prev.dryBrushWarning) {
          setMonsterTaunt("🧪 A Hunter is nothing without their potions! Brush ALL zones!");
          sfxWarningHum();
          voiceWarningNoMotion();
          setTimeout(() => setMonsterTaunt(null), 3000);
          dryBrushCountRef.current++;
          return { ...prev, dryBrushWarning: true, coverageWarnings: prev.coverageWarnings + 1 };
        }
        return prev;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [isPlaying, elapsedSeconds]);

  // --- Anti-cheat: Mimic spawn (idle detection) ---
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setAntiCheat((prev) => {
        const now = Date.now();
        const recentAttacks = prev.attackTimestamps.filter((t) => now - t < 5000);
        // If no attacks in 5 seconds and game is running > 10s, spawn mimic
        if (recentAttacks.length === 0 && elapsedSeconds > 10 && !prev.mimicSpawned) {
          // Spawn mimic monster
          setMonsters((mPrev) => {
            const mimic: Monster = {
              id: `mimic-${Date.now()}`,
              name: "The Mimic",
              sector: Math.floor(Math.random() * 8),
              hp: 60,
              maxHp: 60,
              emoji: "🎭",
              color: "hsl(0 70% 50%)",
              defeated: false,
              x: 50 + (Math.random() * 20 - 10),
              y: 50 + (Math.random() * 20 - 10),
              habitat: "Closed Mouth",
              weakness: "Open Wide",
              weaknessTechnique: "The Guild Master sees all!",
              loot: "",
              lootEmoji: "",
              ability: null,
              shielded: false,
              invisible: false,
              spawnedMinion: false,
            };
            return [...mPrev, mimic];
          });
          // Add 5s penalty
          setElapsedSeconds((s) => Math.max(0, s - 5));
          mimicCountRef.current++;
          setMonsterTaunt("🎭 The Mimic steals 5 seconds! Open wide or lose more progress!");
          sfxMimicSpawn();
          voiceWarningNoMotion();
          setTimeout(() => setMonsterTaunt(null), 3500);
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
          return { ...prev, mimicSpawned: true, mimicPenaltySeconds: prev.mimicPenaltySeconds + 5 };
        }
        // Reset mimic flag after next attack
        return prev;
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [isPlaying, elapsedSeconds, playSound]);

  const spawnMonsters = useCallback(() => {
    const activeBestiary = getSeasonalBestiary(season);
    const count = 5 + Math.floor(Math.random() * 2);
    const shuffled = [...activeBestiary].sort(() => Math.random() - 0.5).slice(0, count);
    const usedSectors = new Set<number>();

    const spawned: Monster[] = shuffled.map((type, i) => {
      const validSectors = type.sectors.filter((s) => !usedSectors.has(s));
      const sector = validSectors.length > 0
        ? validSectors[Math.floor(Math.random() * validSectors.length)]
        : (() => { let s; do { s = Math.floor(Math.random() * 8); } while (usedSectors.has(s)); return s; })();
      usedSectors.add(sector);

      const pos = TOOTH_SECTORS[sector];
      const ability = pickAbility();

      return {
        id: `m-${Date.now()}-${i}`,
        name: type.name,
        sector,
        hp: type.hp,
        maxHp: type.hp,
        emoji: type.emoji,
        color: type.color,
        defeated: false,
        x: pos.x + (Math.random() * 8 - 4),
        y: pos.y + (Math.random() * 8 - 4),
        habitat: type.habitat,
        weakness: type.weakness,
        weaknessTechnique: type.weaknessTechnique,
        loot: type.loot,
        lootEmoji: type.lootEmoji,
        ability,
        shielded: ability === "bubble-shield",
        invisible: false,
        spawnedMinion: false,
      };
    });

    setMonsters(spawned);
    setLootDrops([]);
    setAntiCheat(INITIAL_ANTI_CHEAT);
    blockModeCountRef.current = 0;
    dryBrushCountRef.current = 0;
    mimicCountRef.current = 0;
  }, [season]);

  const startBattle = useCallback(() => {
    spawnMonsters();
    setIsPlaying(true);
    setElapsedSeconds(0);
    setMonsterTaunt(null);
    voiceMemoPlayedRef.current = false;
    attackCountRef.current = 0;
    timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
  }, [spawnMonsters]);

  /* ---- Ability: Inviso-Grime ---- */
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setMonsters((prev) =>
        prev.map((m) => {
          if (m.ability === "inviso-grime" && !m.defeated) {
            return { ...m, invisible: !m.invisible };
          }
          return m;
        })
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  /* ---- Ability: Multiplier — idle detection ---- */
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      if (!isPlaying) return;
      setMonsters((prev) => {
        const multiplier = prev.find((m) => m.ability === "multiplier" && !m.defeated && !m.spawnedMinion);
        if (!multiplier) return prev;
        const minion: Monster = {
          id: `minion-${Date.now()}`,
          name: "Plaque Minion",
          sector: multiplier.sector,
          hp: 40,
          maxHp: 40,
          emoji: "🪱",
          color: "hsl(38 92% 50%)",
          defeated: false,
          x: multiplier.x + (Math.random() > 0.5 ? 8 : -8),
          y: multiplier.y + (Math.random() > 0.5 ? 8 : -8),
          habitat: multiplier.habitat,
          weakness: "Quick Scrub",
          weaknessTechnique: "Fast brushing to squish",
          loot: "",
          lootEmoji: "",
          ability: null,
          shielded: false,
          invisible: false,
          spawnedMinion: false,
        };
        return [...prev.map((m) => m.id === multiplier.id ? { ...m, spawnedMinion: true } : m), minion];
      });
      playSound(300, 0.1);
    }, 5000);
  }, [isPlaying, playSound]);

  useEffect(() => {
    if (isPlaying) resetIdleTimer();
    return () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); };
  }, [isPlaying, resetIdleTimer]);

  const attackMonster = useCallback((monsterId: string, damage: number = 10) => {
    resetIdleTimer();
    const now = Date.now();
    attackCountRef.current++;

    // Play hit SFX
    sfxMonsterHit();

    // Periodic voice encouragement (every ~8 hits)
    if (attackCountRef.current % 8 === 0) {
      voiceEncouragement();
    }

    // Directional voice cue (every ~15 hits, tell them where to focus)
    if (attackCountRef.current % 15 === 0) {
      const uncoveredSectors = [0,1,2,3,4,5,6,7].filter(
        (s) => !(antiCheat.sectorHits[s] > 0)
      );
      if (uncoveredSectors.length > 0) {
        voiceDirectional(uncoveredSectors[0]);
      }
    }

    // Update anti-cheat state
    setAntiCheat((prev) => {
      const newTimestamps = [...prev.attackTimestamps, now].slice(-10);
      const monster = monsters.find((m) => m.id === monsterId);
      const sector = monster?.sector ?? 0;
      const newSectorHits = { ...prev.sectorHits, [sector]: (prev.sectorHits[sector] || 0) + 1 };

      // Rhythm check
      const goodRhythm = checkRhythm(newTimestamps);
      if (!goodRhythm && !prev.blockModeActive) {
        setMonsterTaunt("🛡️ Ha! Your strikes are too weak! Brush with rhythm to break my guard!");
        sfxBlockMode();
        voiceWarningTooFast();
        setTimeout(() => setMonsterTaunt(null), 2500);
        blockModeCountRef.current++;
      }

      return {
        ...prev,
        attackTimestamps: newTimestamps,
        sectorHits: newSectorHits,
        totalHits: prev.totalHits + 1,
        blockModeActive: !goodRhythm,
        mimicSpawned: false,
      };
    });

    setMonsters((prev) =>
      prev.map((m) => {
        if (m.id !== monsterId || m.defeated) return m;

        let actualDamage = damage;
        if (antiCheat.blockModeActive) {
          actualDamage = Math.round(damage * 0.3);
        }

        if (m.shielded) {
          if (m.hp > m.maxHp * 0.6) {
            actualDamage = Math.round(actualDamage * 0.5);
          }
        }

        const newHp = Math.max(0, m.hp - actualDamage);
        if (newHp <= 0) {
          sfxMonsterDefeated();
          voiceCompletion();
          if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
          if (m.loot) {
            setLootDrops((prev) => [...prev, m.lootEmoji]);
          }
          return { ...m, hp: 0, defeated: true, shielded: false, invisible: false };
        }
        return { ...m, hp: newHp, shielded: m.shielded && newHp > m.maxHp * 0.4 };
      })
    );
  }, [playSound, resetIdleTimer, checkRhythm, antiCheat.blockModeActive, monsters]);

  // Generate integrity report
  const generateIntegrityReport = useCallback((): IntegrityReport => {
    const sectorHits = antiCheat.sectorHits;
    const totalHits = antiCheat.totalHits;

    // Coverage: how many sectors got hits
    const sectorCounts = [0, 1, 2, 3, 4, 5, 6, 7].map((s) => sectorHits[s] || 0);
    const coveredSectors = sectorCounts.filter((c) => c > 0).length;
    const accuracy = Math.round((coveredSectors / 8) * 100);

    // Vigor: based on rhythm consistency (fewer block modes = better)
    const blockPenalty = blockModeCountRef.current * 10;
    const vigor = Math.max(0, Math.min(100, 100 - blockPenalty - (antiCheat.mimicPenaltySeconds * 3)));

    // Integrity: weighted average minus penalties
    const mimicPenalty = mimicCountRef.current * 15;
    const dryPenalty = dryBrushCountRef.current * 8;
    const integrityScore = Math.max(0, Math.min(100,
      Math.round(accuracy * 0.4 + vigor * 0.4 + 20 - mimicPenalty - dryPenalty)
    ));

    return {
      accuracy,
      vigor,
      integrityScore,
      zoneCoverage: {
        topLeft: sectorHits[0] || 0,
        topCenter: sectorHits[1] || 0,
        topRight: sectorHits[2] || 0,
        left: sectorHits[3] || 0,
        right: sectorHits[4] || 0,
        bottomLeft: sectorHits[5] || 0,
        bottomCenter: sectorHits[6] || 0,
        bottomRight: sectorHits[7] || 0,
      },
      mimicPenalties: mimicCountRef.current,
      blockModeTriggered: blockModeCountRef.current,
      dryBrushWarnings: dryBrushCountRef.current,
      totalAttacks: totalHits,
      duration: elapsedSeconds,
    };
  }, [antiCheat, elapsedSeconds]);

  // Voice memo playback at ~90 seconds (final 30s of a 2-min battle)
  useEffect(() => {
    if (isPlaying && elapsedSeconds === 90 && !voiceMemoPlayedRef.current) {
      voiceMemoPlayedRef.current = true;
      playVoiceMemo();
    }
  }, [isPlaying, elapsedSeconds]);

  const endBattle = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    setIsPlaying(false);
    setMonsterTaunt(null);

    // Victory SFX + voice
    const allDefeated = monsters.every((m) => m.defeated);
    if (allDefeated) {
      sfxVictoryFanfare();
      voiceVictory();
    }

    const report = generateIntegrityReport();

    const defeated = monsters.filter((m) => m.defeated);
    const total = monsters.length;
    const completed = defeated.length === total;
    const today = getToday();
    const collectedLoot = defeated.filter((m) => m.loot).map((m) => m.loot);

    setState((prev) => {
      const existingIdx = prev.records.findIndex((r) => r.date === today);
      const record: DailyRecord = {
        date: today,
        completed,
        monstersDefeated: defeated.length,
        totalMonsters: total,
        durationSeconds: elapsedSeconds,
        lootCollected: collectedLoot,
      };
      const records = [...prev.records];
      if (existingIdx >= 0) records[existingIdx] = record;
      else records.push(record);

      const newStreak = calculateStreak(records);
      const allLoot = [...new Set([...prev.collectedLoot, ...collectedLoot])];

      const trophies = prev.trophies.map((t) => {
        if (t.unlocked) return t;
        if (t.category === "streak" && newStreak >= t.requirement) {
          return { ...t, unlocked: true, unlockedDate: today };
        }
        if (t.category === "loot") {
          const lootMap: Record<string, string> = {
            "iron-jaw": "Iron Jaw Badge",
            "pink-shield": "Pink Shield Medal",
            "sparkle-gem": "Shine Sparkle Gem",
            "fresh-breath": "Fresh Breath Potion",
            "sweet-scrap": "Sticky Sweet Scrap",
          };
          if (allLoot.includes(lootMap[t.id])) {
            return { ...t, unlocked: true, unlockedDate: today };
          }
        }
        return t;
      });

      return {
        ...prev,
        records,
        trophies,
        currentStreak: newStreak,
        totalBattles: prev.totalBattles + 1,
        collectedLoot: allLoot,
        lastIntegrityReport: report,
      };
    });
  }, [monsters, elapsedSeconds, generateIntegrityReport]);

  // Auto-end if all defeated
  useEffect(() => {
    if (isPlaying && monsters.length > 0 && monsters.every((m) => m.defeated)) {
      setTimeout(() => endBattle(), 2000);
    }
  }, [monsters, isPlaying, endBattle]);

  const addReward = useCallback((description: string, streakRequired: number) => {
    setState((prev) => ({
      ...prev,
      rewards: [...prev.rewards, { id: `r-${Date.now()}`, streakRequired, description, claimed: false }],
    }));
  }, []);

  const removeReward = useCallback((id: string) => {
    setState((prev) => ({ ...prev, rewards: prev.rewards.filter((r) => r.id !== id) }));
  }, []);

  const claimReward = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      rewards: prev.rewards.map((r) => r.id === id ? { ...r, claimed: true } : r),
    }));
  }, []);

  const doubleDown = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      rewards: prev.rewards.map((r) =>
        r.id === id ? { ...r, streakRequired: Math.max(r.streakRequired * 2, 14) } : r
      ),
    }));
  }, []);

  const todayCompleted = state.records.some((r) => r.date === getToday() && r.completed);

  const hasGoldenBrush = state.currentStreak >= 3;
  const hasLightningEffect = state.currentStreak >= 7;
  const hasBossMode = state.currentStreak >= 14;

  return {
    monsters, isPlaying, elapsedSeconds, calibrated, lootDrops, season,
    startBattle, attackMonster, endBattle, setCalibrated,
    currentStreak: state.currentStreak,
    totalBattles: state.totalBattles,
    todayCompleted,
    records: state.records,
    trophies: state.trophies,
    rewards: state.rewards,
    collectedLoot: state.collectedLoot,
    addReward, removeReward, claimReward, doubleDown,
    hasGoldenBrush, hasLightningEffect, hasBossMode,
    // Anti-cheat
    antiCheat,
    monsterTaunt,
    lastIntegrityReport: state.lastIntegrityReport,
  };
}
