// ===== GAME CONFIGURATION =====
// This file contains all adjustable game variables for easy tuning

const CONFIG = {
  // ===== DIFFICULTY SETTINGS =====
  DIFFICULTY: {
    RELAX: { name: "Relax", monsterScaling: 0.08, spawnRate: 0.85 },
    NORMAL: { name: "Normal", monsterScaling: 0.12, spawnRate: 1.0 },
    FOCUS: { name: "Focus", monsterScaling: 0.18, spawnRate: 1.15 }
  },

  // ===== BATTLE TEMPO (milliseconds) =====
  BATTLE: {
    ACTION_DELAY: 1200, // Time between character actions (slower for readability)
    STATUS_TICK: 500, // Interval for status effect damage
    ANIMATION_SPEED: 150, // HP bar and UI animations
    TURN_RESOLUTION_DELAY: 800 // Delay between turn resolutions
  },

  // ===== REST SYSTEM =====
  REST: {
    QUICK_REST: {
      hpRestore: 0.25, // 25% HP restored
      hpBonusPerSet: 2,  // +2*set HP
      staRestore: 0.30, // 30% stamina restored
      staBonusPerSet: 3,  // +3*set stamina
      manaRestore: 0.30, // 30% mana restored
      manaBonusPerSet: 3  // +3*set mana
    },
    LONG_REST: {
      // Restores all HP and removes all negative effects
      fullRestore: true,
      removeNegativeEffects: true
    }
  },

  // ===== BATTLEFIELD GRID =====
  BATTLEFIELD: {
    GRID_SIZE: 8, // 8x8 grid = 64 blocks
    BLOCK_SIZE: 32, // pixels per block (visual)
    BLOCK_STROKE_WIDTH: 3 // HP bar stroke width
  },

  // ===== SKILL SYSTEM =====
  SKILLS: {
    ACTIVE_SLOTS: 4, // 4 active skill slots per hero
    MAX_SKILLS_POOL: 20 // Total available skills to learn
  },

  // ===== EQUIPMENT SYSTEM =====
  EQUIPMENT: {
    EQUIP_SLOTS: 7, // 7 equipment slots per hero
    STAT_BONUS_RANGE: [1, 3], // Equipment can have 1-3 stat bonuses
    SPECIAL_ABILITY_CHANCE: 0.4, // 40% chance for special ability
    // Ability rarity weights
    ABILITY_WEIGHTS: {
      common: 0.40,
      uncommon: 0.35,
      rare: 0.20,
      epic: 0.05
    }
  },

  // ===== ENHANCEMENT SYSTEM =====
  ENHANCEMENT: {
    RARITY_SCALING: {
      common: 1.0,
      uncommon: 1.2,
      rare: 1.4,
      epic: 1.7,
      legendary: 2.0
    }
  },

  // ===== EXPERIENCE & STATS PURCHASE =====
  STATS_PURCHASE: {
    BASE_COST: {
      maxHp: 10,
      maxSta: 10,
      maxMana: 10,
      patk: 12,
      matk: 12,
      pdef: 12,
      mdef: 12
    },
    COST_INCREASE: 1.12, // Cost multiplier per purchase
    STAT_INCREMENT: {
      maxHp: 10,
      maxSta: 5,
      maxMana: 5,
      patk: 2,
      matk: 2,
      pdef: 1,
      mdef: 1
    }
  },

  // ===== MONSTER SPAWNING =====
  MONSTER_SPAWN: {
    CARDINAL_DIRECTIONS: [
      "N", "NE", "E", "SE", "S", "SW", "W", "NW"
    ],
    SPAWN_ZONES: {
      N: { x: [2, 5], y: [0, 1] },
      NE: { x: [5, 7], y: [0, 2] },
      E: { x: [6, 7], y: [3, 4] },
      SE: { x: [5, 7], y: [5, 7] },
      S: { x: [2, 5], y: [6, 7] },
      SW: { x: [0, 2], y: [5, 7] },
      W: { x: [0, 1], y: [3, 4] },
      NW: { x: [0, 2], y: [0, 2] }
    }
  },

  // ===== NEGATIVE EFFECTS =====
  NEGATIVE_EFFECTS: {
    BURN: { dps: 1.5, duration: 4, pspeedReduction: 0 },
    BLEEDING: { dps: 1.0, duration: 5, pspeedReduction: 0.15 },
    STUN: { duration: 1, canAct: false },
    PARALYZED: { duration: 3, actionChance: 0.35 },
    VAMPIRED: { duration: 4, hpDrainPerSecond: 0.5 },
    CONFUSED: { duration: 3, allyAttackChance: 0.6 }
  },

  // ===== POSITIVE EFFECTS & EQUIPMENT ABILITIES =====
  ABILITIES: {
    SHARPNESS: { bleedingChance: 0.35, duration: 2 },
    LIGHT_ESSENCE: { blindChance: 0.4, accuracy_reduction: 0.25 },
    THORN: { damageReflect: 0.25 },
    SHINY: { attackChance_reduction: 0.2 },
    LIGHT_WEIGHT: { staminaCost_reduction: 0.2 },
    REGENERATION: { hpPerSecond: 0.8 },
    SHIELD_BARRIER: { duration: 1, blockOneAttack: true },
    DODGE: { duration: 3, dodgeCount: 4, dodgeChance: 0.8 },
    TAUNT: { duration: 5, enemyFocusChance: 0.95 }
  },

  // ===== REWARD SYSTEM =====
  REWARDS: {
    EQUIPMENT_CHOICE: 3, // 3 random items to choose from
    SKILL_CHOICE: 3, // 3 random skills to choose from
    SKILL_LEVEL_UP_SCALING: 0.15 // 15% increase per level
  },

  // ===== AUTO-SELECTION SETTINGS =====
  AUTO_SELECTION: {
    autoChooseEquipment: false,
    noPauseOnAutoEquipment: false,
    autoChooseSkill: false,
    noPauseOnAutoSkill: false
  },

  // ===== UI SETTINGS =====
  UI: {
    PROFILE_TAB_WIDTH: 350, // pixels
    EQUIPMENT_ITEM_DISPLAY: 5, // Items shown before scrolling
    CONSOLE_LOG_MAX_LINES: 50, // Maximum battle log lines
    CHARACTER_PREVIEW_SIZE: 40 // pixels
  },

  // ===== STAT LIMITS =====
  STAT_LIMITS: {
    maxHpCap: 500,
    maxStaCap: 300,
    maxManaCap: 300,
    patkCap: 200,
    matkCap: 200,
    pdefCap: 150,
    mdefCap: 150,
    tattCap: 150,
    pspdCap: 3.0,
    mspdCap: 3.0,
    ccritCap: 0.95,
    dcritCap: 3.0
  }
};

// ===== DIFFICULTY SELECTOR =====
let currentDifficulty = null;

function setDifficulty(difficultyKey) {
  currentDifficulty = CONFIG.DIFFICULTY[difficultyKey];
  localStorage.setItem("selectedDifficulty", difficultyKey);
  document.getElementById("difficulty-modal").classList.remove("active");
  startBattle();
}

function getDifficulty() {
  return currentDifficulty || CONFIG.DIFFICULTY.NORMAL;
}
