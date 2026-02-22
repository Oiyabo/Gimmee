// ===== GAME CONFIGURATION =====
// Central file for all adjustable game variables
// Edit these values to tweak game difficulty, speed, and progression

// ===== BATTLE SPEED CONFIG =====
const BATTLE_CONFIG = {
  // Delay in milliseconds between monster turn and action execution
  turnExecutionDelay: 500,
  
  // Delay in milliseconds between skill execution and next turn
  skillExecutionDelay: 600,
  
  // Delay before showing transition (round/area complete)
  transitionDelay: 800,
  
  // Delay before continuing from transition
  continueDelay: 500
};

// ===== DIFFICULTY SCALING CONFIG =====
const DIFFICULTY_CONFIG = {
  relax: {
    monsterScaling: 0.7,        // Monster stats multiplier
    growthRate: 0.05,           // Growth per area (5% per area)
    experienceMultiplier: 0.8,  // Experience reward multiplier
    statCostMultiplier: 0.8     // Stat purchase cost multiplier
  },
  normal: {
    monsterScaling: 1.0,        // Monster stats multiplier
    growthRate: 0.10,           // Growth per area (10% per area)
    experienceMultiplier: 1.0,  // Experience reward multiplier
    statCostMultiplier: 1.0     // Stat purchase cost multiplier
  },
  focus: {
    monsterScaling: 1.5,        // Monster stats multiplier
    growthRate: 0.15,           // Growth per area (15% per area)
    experienceMultiplier: 1.3,  // Experience reward multiplier
    statCostMultiplier: 1.2     // Stat purchase cost multiplier
  }
};

// ===== MONSTER GENERATION CONFIG =====
const MONSTER_CONFIG = {
  // Base stat randomization range (±%)
  statVariation: 0.2,           // ±20% variation from template
  
  // Skill randomization
  maxSkillsPerMonster: 3,
  skillRandomChance: 0.3,       // 30% chance to get extra skill
  
  // Set number scaling
  baseScalingPerSet: 0.10,      // +10% per set
  
  // Area scaling growth
  baseAreaGrowth: 0.15,         // +15% base growth per area
  
  // Boss scaling
  bossBaseMultiplier: 1.5,      // Boss starts at 1.5x normal monster
  bossAreaScaling: 0.30,        // +30% per area
  bossSetScaling: 0.20,         // +20% per set
  
  // Experience reward calculation
  experienceBasePerMonster: 50, // Base EXP for one monster
  experiencePerStat: 0.5,       // EXP *= (stat_multiplier * this)
  experiencePerSkill: 10        // Additional EXP per skill
};

// ===== STAT PURCHASE CONFIG =====
const STAT_PURCHASE_CONFIG = {
  // Base costs for each stat type
  baseCosts: {
    maxHp: 60,
    maxSta: 50,
    maxMana: 50,
    patk: 70,
    matk: 70,
    pdef: 60,
    mdef: 60
  },
  
  // Cost increment multiplier per purchase
  // costIncrementMultiplier: 1.1 means each purchase costs 10% more than previous
  costIncrementMultiplier: 1.15  // 15% increase per purchase
};

// ===== CHARACTER INITIAL CONFIG =====
const CHARACTER_CONFIG = {
  maxEquipSlots: 7,
  maxSkillSlots: 4,
  
  // Starting experience points
  startingExperience: 0
};

// ===== REST SYSTEM CONFIG =====
const REST_CONFIG = {
  quickRestHealing: {
    hpPercent: 0.25,            // 25% max HP
    hpFlat: 2,                  // + (2 * set number)
    staPercent: 0.30,           // 30% recovery
    staFlat: 3,                 // + (3 * set number)
    manaPercent: 0.30,          // 30% recovery
    manaFlat: 3                 // + (3 * set number)
  },
  
  longRestHealing: {
    hpPercent: 1.0,             // 100% heal
    staPercent: 1.0,            // 100% recovery
    manaPercent: 1.0,           // 100% recovery
    clearsAllNegativeEffects: true
  }
};

// ===== EQUIPMENT ENHANCEMENT CONFIG =====
const ENHANCEMENT_CONFIG = {
  rarityScaling: {
    "Common": { stat: 0.10, ability: 0.05 },
    "Uncommon": { stat: 0.15, ability: 0.08 },
    "Rare": { stat: 0.20, ability: 0.10 },
    "Epic": { stat: 0.25, ability: 0.12 },
    "Legendary": { stat: 0.30, ability: 0.15 }
  }
};

// ===== UTILS FOR GETTING CONFIG BY DIFFICULTY =====
function getDifficultyConfig(difficulty) {
  return DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.normal;
}

function getStatCost(statType, purchaseCount, difficulty) {
  const baseCost = STAT_PURCHASE_CONFIG.baseCosts[statType] || 50;
  const diffMultiplier = getDifficultyConfig(difficulty).statCostMultiplier;
  const increment = Math.pow(STAT_PURCHASE_CONFIG.costIncrementMultiplier, purchaseCount);
  return Math.floor(baseCost * diffMultiplier * increment);
}

function calculateMonsterExperience(monster, difficulty) {
  const baseEXP = MONSTER_CONFIG.experienceBasePerMonster;
  const statMultiplier = (monster.patk + monster.matk + monster.pdef + monster.mdef) / 50; // Normalize
  const skillBonus = (monster.selectedSkills ? monster.selectedSkills.length : 0) * MONSTER_CONFIG.experiencePerSkill;
  const diffMultiplier = getDifficultyConfig(difficulty).experienceMultiplier;
  return Math.floor((baseEXP + (statMultiplier * MONSTER_CONFIG.experiencePerStat) + skillBonus) * diffMultiplier);
}
