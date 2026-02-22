// ===== COMPREHENSIVE STATUS EFFECTS SYSTEM =====
// Status effects dapat di-trigger oleh skills, equipment abilities, atau musuh abilities
// Setiap effect memiliki duration dan dapat di-remove dengan berbagai cara

const StatusEffects = {
  // ===== DAMAGE OVER TIME EFFECTS =====
  
  burn: {
    name: "Burn",
    description: "Taking 8-12% max HP damage per turn",
    type: "dot",
    severity: "high",
    icon: "🔥",
    defaultDuration: 5, // seconds
    tickInterval: 1,    // damage setiap 1 detik
    effect: (character, deltaTime) => {
      if (!character.status.burnTicks) character.status.burnTicks = 0;
      character.status.burnTicks += deltaTime;
      
      if (character.status.burnTicks >= 1) {
        let damage = Math.floor(character.maxHp * (0.08 + Math.random() * 0.04));
        character.takeDamage(damage);
        character.status.burnTicks = 0;
      }
    }
  },
  
  bleeding: {
    name: "Bleeding",
    description: "Taking 5-8% max HP damage per turn + Physical Speed -20%",
    type: "dot",
    severity: "medium",
    icon: "🩸",
    defaultDuration: 7,
    tickInterval: 1.5,
    effect: (character, deltaTime) => {
      if (!character.status.bleedingTicks) character.status.bleedingTicks = 0;
      character.status.bleedingTicks += deltaTime;
      
      if (character.status.bleedingTicks >= 1.5) {
        let damage = Math.floor(character.maxHp * (0.05 + Math.random() * 0.03));
        character.takeDamage(damage);
        character.status.bleedingTicks = 0;
      }
      
      // Reduce Physical Speed
      if (character.pspd) {
        character.pspd = character.pspd * 0.8; // -20% speed
      }
    }
  },
  
  poisoned: {
    name: "Poisoned",
    description: "Taking 4% max HP damage per turn for extended duration",
    type: "dot",
    severity: "medium",
    icon: "☠️",
    defaultDuration: 8,
    tickInterval: 2,
    effect: (character, deltaTime) => {
      if (!character.status.poisonTicks) character.status.poisonTicks = 0;
      character.status.poisonTicks += deltaTime;
      
      if (character.status.poisonTicks >= 2) {
        let damage = Math.floor(character.maxHp * 0.04);
        character.takeDamage(damage);
        character.status.poisonTicks = 0;
      }
    }
  },
  
  frostbite: {
    name: "Frostbite",
    description: "Taking 3% max HP damage per turn + Magical Speed -15%",
    type: "dot",
    severity: "low",
    icon: "❄️",
    defaultDuration: 6,
    tickInterval: 1.5,
    effect: (character, deltaTime) => {
      if (!character.status.frostbiteTicks) character.status.frostbiteTicks = 0;
      character.status.frostbiteTicks += deltaTime;
      
      if (character.status.frostbiteTicks >= 1.5) {
        let damage = Math.floor(character.maxHp * 0.03);
        character.takeDamage(damage);
        character.status.frostbiteTicks = 0;
      }
      
      // Reduce Magical Speed
      if (character.mspd) {
        character.mspd = character.mspd * 0.85;
      }
    }
  },
  
  cursed: {
    name: "Cursed",
    description: "Taking 6% max HP damage per turn + All stats -10%",
    type: "dot",
    severity: "high",
    icon: "👿",
    defaultDuration: 10,
    tickInterval: 1,
    effect: (character, deltaTime) => {
      if (!character.status.curseTicks) character.status.curseTicks = 0;
      character.status.curseTicks += deltaTime;
      
      if (character.status.curseTicks >= 1) {
        let damage = Math.floor(character.maxHp * 0.06);
        character.takeDamage(damage);
        character.status.curseTicks = 0;
      }
      
      // Apply stat reduction
      if (!character.status.curseApplied) {
        character.patk *= 0.9;
        character.matk *= 0.9;
        character.pdef *= 0.9;
        character.mdef *= 0.9;
        character.status.curseApplied = true;
      }
    }
  },
  
  // ===== CROWD CONTROL EFFECTS =====
  
  stun: {
    name: "Stun",
    description: "Cannot use any skills. Completely immobilized.",
    type: "cc",
    severity: "critical",
    icon: "⚡",
    defaultDuration: 2,
    blockSkills: true,
    effect: (character) => {
      // Complete skill lockout - handled in skill execution
    }
  },
  
  paralyzed: {
    name: "Paralyzed",
    description: "50% chance to fail skill execution. Longer duration than stun.",
    type: "cc",
    severity: "high",
    icon: "💤",
    defaultDuration: 4,
    failChance: 0.5,
    effect: (character) => {
      // 50% chance handled in skill execution
    }
  },
  
  confused: {
    name: "Confused",
    description: "60% chance to attack allies instead of enemies",
    type: "cc",
    severity: "high",
    icon: "😵",
    defaultDuration: 5,
    targetSwapChance: 0.6,
    effect: (character) => {
      // Target swapping handled in combat action
    }
  },
  
  slowed: {
    name: "Slowed",
    description: "Physical Speed -40%, Magical Speed -40%",
    type: "cc",
    severity: "medium",
    icon: "🐌",
    defaultDuration: 6,
    effect: (character) => {
      character.pspd = character.pspd * 0.6;
      character.mspd = character.mspd * 0.6;
    }
  },
  
  rooted: {
    name: "Rooted",
    description: "Cannot move. Physical Speed -60%",
    type: "cc",
    severity: "high",
    icon: "🌳",
    defaultDuration: 4,
    effect: (character) => {
      character.pspd = character.pspd * 0.4;
      // Prevent movement
    }
  },
  
  silenced: {
    name: "Silenced",
    description: "Cannot cast magical skills",
    type: "cc",
    severity: "high",
    icon: "🔇",
    defaultDuration: 3,
    blockMagic: true,
    effect: (character) => {
      // Magical skill blocking handled in skill execution
    }
  },
  
  disarmed: {
    name: "Disarmed",
    description: "Cannot use physical skills",
    type: "cc",
    severity: "high",
    icon: "🚫",
    defaultDuration: 3,
    blockPhysical: true,
    effect: (character) => {
      // Physical skill blocking handled in skill execution
    }
  },
  
  // ===== STAT REDUCTION EFFECTS =====
  
  weakened: {
    name: "Weakened",
    description: "Physical Attack -30%",
    type: "debuff",
    severity: "medium",
    icon: "💪",
    defaultDuration: 5,
    effect: (character) => {
      character.patk = character.patk * 0.7;
    }
  },
  
  vulnerable: {
    name: "Vulnerable",
    description: "Physical Defense -35%, Magical Defense -20%",
    type: "debuff",
    severity: "high",
    icon: "🛡️❌",
    defaultDuration: 4,
    effect: (character) => {
      character.pdef = character.pdef * 0.65;
      character.mdef = character.mdef * 0.8;
    }
  },
  
  exhausted: {
    name: "Exhausted",
    description: "All Speed -50%, Physical Attack -20%",
    type: "debuff",
    severity: "high",
    icon: "😫",
    defaultDuration: 6,
    effect: (character) => {
      character.pspd = character.pspd * 0.5;
      character.mspd = character.mspd * 0.5;
      character.patk = character.patk * 0.8;
    }
  },
  
  brittle: {
    name: "Brittle",
    description: "Taking 20% more physical damage",
    type: "debuff",
    severity: "high",
    icon: "⛏️",
    defaultDuration: 5,
    damageTaken: 1.2, // Take 120% damage
    effect: (character) => {
      // Damage multiplier applied during takeDamage
    }
  },
  
  exposed: {
    name: "Exposed",
    description: "Magical Defense -40%",
    type: "debuff",
    severity: "medium",
    icon: "👁️",
    defaultDuration: 4,
    effect: (character) => {
      character.mdef = character.mdef * 0.6;
    }
  },
  
  // ===== RESOURCE DRAIN EFFECTS =====
  
  vampired: {
    name: "Vampired",
    description: "Drain 3% max HP per turn + opponent gets 50% of drained HP",
    type: "drain",
    severity: "high",
    icon: "🧛",
    defaultDuration: 8,
    tickInterval: 1,
    drainPercentage: 0.03,
    effect: (character, deltaTime, source) => {
      if (!character.status.vampireTicks) character.status.vampireTicks = 0;
      character.status.vampireTicks += deltaTime;
      
      if (character.status.vampireTicks >= 1) {
        let drained = Math.floor(character.maxHp * 0.03);
        character.takeDamage(drained);
        
        // Give 50% of drain to vampired source
        if (source && source.hp !== undefined) {
          source.hp = Math.min(source.hp + Math.floor(drained * 0.5), source.maxHp);
        }
        character.status.vampireTicks = 0;
      }
    }
  },
  
  manaShock: {
    name: "Mana Shock",
    description: "Draining 2% max Mana per turn",
    type: "drain",
    severity: "medium",
    icon: "⚡📊",
    defaultDuration: 6,
    tickInterval: 1,
    effect: (character, deltaTime) => {
      if (!character.status.shockTicks) character.status.shockTicks = 0;
      character.status.shockTicks += deltaTime;
      
      if (character.status.shockTicks >= 1) {
        let drain = Math.floor(character.maxMana * 0.02);
        character.mana = Math.max(0, character.mana - drain);
        character.status.shockTicks = 0;
      }
    }
  },
  
  staminaDrain: {
    name: "Stamina Drain",
    description: "Draining 3% max Stamina per turn",
    type: "drain",
    severity: "medium",
    icon: "😤",
    defaultDuration: 5,
    tickInterval: 1,
    effect: (character, deltaTime) => {
      if (!character.status.staminaDrainTicks) character.status.staminaDrainTicks = 0;
      character.status.staminaDrainTicks += deltaTime;
      
      if (character.status.staminaDrainTicks >= 1) {
        let drain = Math.floor(character.maxSta * 0.03);
        character.sta = Math.max(0, character.sta - drain);
        character.status.staminaDrainTicks = 0;
      }
    }
  },
  
  // ===== SPECIAL EFFECTS =====
  
  blinded: {
    name: "Blinded",
    description: "Accuracy -60%, Critical Hit Chance -50%",
    type: "debuff",
    severity: "medium",
    icon: "👁️❌",
    defaultDuration: 4,
    accuracy: 0.4, // 40% hit rate
    ccritPenalty: -0.5,
    effect: (character) => {
      character.ccrit = Math.max(0, character.ccrit - 0.5);
    }
  },
  
  petrified: {
    name: "Petrified",
    description: "Complete immobilization. Physical Defense +200% but no action possible.",
    type: "cc",
    severity: "critical",
    icon: "🪨",
    defaultDuration: 3,
    blockSkills: true,
    defenseBoost: 3, // 300% defense
    effect: (character) => {
      character.pdef = character.pdef * 3;
      // But cannot act
    }
  },
  
  charmed: {
    name: "Charmed",
    description: "30% chance to attack weaker target or skip turn",
    type: "cc",
    severity: "medium",
    icon: "💕",
    defaultDuration: 5,
    effect: (character) => {
      // Behavioral change handling in combat
    }
  },
  
  marked: {
    name: "Marked",
    description: "Enemies gain +25% Critical Hit Chance against you",
    type: "debuff",
    severity: "medium",
    icon: "🎯",
    defaultDuration: 7,
    enemyCCritBonus: 0.25,
    effect: (character) => {
      // Effect applied to attackers
    }
  },
  
  regenerating: {
    name: "Regenerating",
    description: "Heal 4% max HP per turn (BUFF - but marking as status for tracking)",
    type: "buff",
    severity: "positive",
    icon: "💚",
    defaultDuration: 10,
    tickInterval: 1,
    effect: (character, deltaTime) => {
      if (!character.status.regenTicks) character.status.regenTicks = 0;
      character.status.regenTicks += deltaTime;
      
      if (character.status.regenTicks >= 1) {
        let heal = Math.floor(character.maxHp * 0.04);
        character.hp = Math.min(character.hp + heal, character.maxHp);
        character.status.regenTicks = 0;
      }
    }
  },
  
  shielded: {
    name: "Shielded",
    description: "Physical Defense +50%, absorbs one attack",
    type: "buff",
    severity: "positive",
    icon: "🛡️",
    defaultDuration: 8,
    effect: (character) => {
      character.pdef = character.pdef * 1.5;
      character.status.shieldAbsorb = true;
    }
  },
  
  berserk: {
    name: "Berserk",
    description: "Physical Attack +60% but Physical Defense -40%",
    type: "buff",
    severity: "mixed",
    icon: "🔴",
    defaultDuration: 6,
    effect: (character) => {
      character.patk = character.patk * 1.6;
      character.pdef = character.pdef * 0.6;
    }
  },
  
  enlightened: {
    name: "Enlightened",
    description: "Magical Attack +50%, Magical Speed +30%",
    type: "buff",
    severity: "positive",
    icon: "✨",
    defaultDuration: 7,
    effect: (character) => {
      character.matk = character.matk * 1.5;
      character.mspd = character.mspd * 1.3;
    }
  },
  
  stealth: {
    name: "Stealth",
    description: "Enemies 80% less likely to target you. Breaks on attack.",
    type: "buff",
    severity: "positive",
    icon: "🌑",
    defaultDuration: 8,
    targetPriority: -8,
    effect: (character) => {
      // Target avoidance
    }
  },
  
  // ===== ADVANCED EFFECTS =====
  
  mindControlled: {
    name: "Mind Controlled",
    description: "Full control passed to enemy for 3 turns",
    type: "cc",
    severity: "critical",
    icon: "🧠",
    defaultDuration: 3,
    blockSkills: true,
    controlledBy: null,
    effect: (character) => {
      // Full control transfer
    }
  },
  
  timeSlowed: {
    name: "Time Slowed",
    description: "All actions take 2x longer. Speed -70%",
    type: "cc",
    severity: "high",
    icon: "⏱️",
    defaultDuration: 4,
    actionMultiplier: 2,
    effect: (character) => {
      character.pspd = character.pspd * 0.3;
      character.mspd = character.mspd * 0.3;
    }
  },
  
  timeHasted: {
    name: "Time Hasted",
    description: "All actions take 50% time. Speed +50%",
    type: "buff",
    severity: "positive",
    icon: "⚡⏱️",
    defaultDuration: 6,
    actionMultiplier: 0.5,
    effect: (character) => {
      character.pspd = character.pspd * 1.5;
      character.mspd = character.mspd * 1.5;
    }
  },
  
  nullified: {
    name: "Nullified",
    description: "Next skill is completely negated and wasted",
    type: "cc",
    severity: "high",
    icon: "🚫",
    defaultDuration: 3,
    negateNextSkill: true,
    effect: (character) => {
      // Negation handled in skill execution
    }
  },
  
  cursedArtifact: {
    name: "Cursed Artifact",
    description: "Random stat reduced by 40% each turn",
    type: "debuff",
    severity: "high",
    icon: "🗿",
    defaultDuration: 7,
    effect: (character) => {
      let stats = ['patk', 'matk', 'pdef', 'mdef', 'pspd', 'mspd'];
      let randomStat = stats[Math.floor(Math.random() * stats.length)];
      if (character[randomStat]) {
        character[randomStat] = character[randomStat] * 0.6;
      }
    }
  }
};

// ===== STATUS MANAGEMENT HELPERS =====

function applyStatus(character, statusKey, duration = null, source = null) {
  if (!StatusEffects[statusKey]) {
    console.warn(`Status effect "${statusKey}" not found`);
    return;
  }
  
  if (!character.status) character.status = {};
  
  let effect = StatusEffects[statusKey];
  duration = duration || effect.defaultDuration;
  
  // Store status with expiry time
  character.status[statusKey] = {
    duration: duration,
    startTime: Date.now(),
    expiryTime: Date.now() + (duration * 1000),
    source: source,
    active: true
  };
}

function removeStatus(character, statusKey) {
  if (character.status && character.status[statusKey]) {
    character.status[statusKey].active = false;
    delete character.status[statusKey];
  }
}

function hasStatus(character, statusKey) {
  return character.status && character.status[statusKey] && character.status[statusKey].active;
}

function updateStatusEffects(character, deltaTime) {
  if (!character.status) return;
  
  // Update and apply active statuses
  Object.keys(character.status).forEach(statusKey => {
    let statusData = character.status[statusKey];
    if (!statusData || !statusData.active) return;
    
    let effect = StatusEffects[statusKey];
    if (!effect) return;
    
    // Check expiry
    if (Date.now() >= statusData.expiryTime) {
      removeStatus(character, statusKey);
      return;
    }
    
    // Apply effect
    if (effect.effect) {
      effect.effect(character, deltaTime, statusData.source);
    }
  });
}

function clearAllStatuses(character) {
  character.status = {};
}

function getActiveStatuses(character) {
  if (!character.status) return [];
  return Object.keys(character.status).filter(key => 
    character.status[key] && character.status[key].active
  );
}

function getStatusInfoString(character) {
  let statuses = getActiveStatuses(character);
  if (statuses.length === 0) return "None";
  
  return statuses.map(key => {
    let effect = StatusEffects[key];
    let statusData = character.status[key];
    let remainingTime = Math.max(0, (statusData.expiryTime - Date.now()) / 1000).toFixed(1);
    return `${effect.icon} ${effect.name} (${remainingTime}s)`;
  }).join(", ");
}

function getStatusIcon(character) {
  let statuses = getActiveStatuses(character);
  if (statuses.length === 0) return "";
  
  return statuses.map(key => StatusEffects[key].icon).join("");
}
