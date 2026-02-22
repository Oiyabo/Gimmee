// ===== STATUS EFFECTS INTEGRATION EXAMPLES =====
// This file demonstrates how to use the new status effects system with skills and equipment

// ============================================
// EXAMPLE 1: Skill with Status Effect
// ============================================

// Skill that applies burn status
Skills.infernoFire = {
  name: "Inferno Fire",
  type: "active",
  resource: "mana",
  cost: 40,
  cooldown: 2,
  lore: "Summon flames that burn the target",
  effect: (self, allies, enemies) => {
    let targets = getNearestTargets(self, enemies);
    
    targets.forEach(target => {
      // Deal magical damage
      let baseDmg = self.matk * 1.5;
      let isCrit = Math.random() < self.ccrit;
      let dmg = Math.floor(isCrit ? baseDmg * self.dcrit : baseDmg);
      target.takeDamage(dmg);
      
      // Apply burn status (6 second duration)
      applyStatus(target, "burn", 6, self);
      
      log(`${target.name} burns! ${dmg} damage!`);
    });
  }
};

// ============================================
// EXAMPLE 2: Skill with Multiple Status Effects
// ============================================

Skills.cursedStrike = {
  name: "Cursed Strike",
  type: "active",
  resource: "sta",
  cost: 30,
  cooldown: 3,
  lore: "A dark strike that weakens and curses the enemy",
  effect: (self, allies, enemies) => {
    let target = getNearestTargets(self, enemies)[0];
    if (!target) return;
    
    // Physical damage
    let dmg = Math.floor(self.patk * 1.2);
    target.takeDamage(dmg);
    
    // Apply multiple status effects
    applyStatus(target, "weakened", 5, self);   // -30% ATK
    applyStatus(target, "cursed", 8, self);     // DoT + all stats -10%
    
    log(`${target.name} is cursed and weakened!`);
  }
};

// ============================================
// EXAMPLE 3: Crowd Control Skill
// ============================================

Skills.stunStrike = {
  name: "Stun Strike",
  type: "active",
  resource: "sta",
  cost: 25,
  cooldown: 4,
  lore: "A powerful strike that stuns the target",
  effect: (self, allies, enemies) => {
    let target = getNearestTargets(self, enemies)[0];
    if (!target) return;
    
    // Damage
    let dmg = Math.floor(self.patk * 0.8);
    target.takeDamage(dmg);
    
    // Apply stun (2 second - will block all skills)
    applyStatus(target, "stun", 2, self);
    
    log(`${target.name} is stunned!`);
  }
};

// ============================================
// EXAMPLE 4: Skill with Status Removal
// ============================================

Skills.cleanse = {
  name: "Cleanse",
  type: "active",
  resource: "mana",
  cost: 35,
  cooldown: 2,
  lore: "Remove all negative effects from an ally",
  effect: (self, allies, enemies) => {
    let target = allies[0]; // Lowest HP ally
    
    // Clear all status effects
    clearAllStatuses(target);
    
    // Heal bonus
    target.heal(Math.floor(self.matk * 0.5));
    
    log(`${target.name} is cleansed of all effects!`);
  }
};

// ============================================
// EXAMPLE 5: Passive Skill with Status Buff
// ============================================

Skills.regenerationAura = {
  name: "Regeneration Aura",
  type: "passive",
  resource: "mana",
  cost: 0,
  cooldown: 0,
  lore: "Constantly regenerate and protect allies",
  passive: { duration: 10, counter: 0 },
  effect: (self, allies, enemies) => {
    // Apply regenerating buff to all alive allies
    allies.forEach(ally => {
      if (ally && ally.isAlive()) {
        // Only apply if not already regenerating
        if (!hasStatus(ally, "regenerating")) {
          applyStatus(ally, "regenerating", 8, self);
        }
      }
    });
  }
};

// ============================================
// EXAMPLE 6: Equipment Ability with Status
// ============================================

// In equipment.js, integration example:

/*
EquipmentAbilities.fireEnchant = {
  name: "Fire Enchant",
  description: "All attacks have 40% chance to apply burn",
  type: "offensive",
  effect: (target, source) => {
    if (Math.random() < 0.4) {
      applyStatus(target, "burn", 5, source);
    }
  }
},

EquipmentAbilities.vampiricBite = {
  name: "Vampiric Bite",
  description: "Enemies take 20% more physical damage and get vampired",
  type: "offensive",
  effect: (target, source) => {
    applyStatus(target, "brittle", 4, source);      // Take 20% more damage
    applyStatus(target, "vampired", 6, source);     // Drain HP
  }
},

EquipmentAbilities.dispelShield = {
  name: "Dispel Shield",
  description: "When taking spell damage, remove one spell effect",
  type: "defensive",
  effect: (self) => {
    let statuses = getActiveStatuses(self);
    let magicStatuses = statuses.filter(s => {
      let effect = StatusEffects[s];
      return effect.type === "debuff" || effect.type === "control";
    });
    
    if (magicStatuses.length > 0) {
      removeStatus(self, magicStatuses[0]);
    }
  }
}
*/

// ============================================
// EXAMPLE 7: Monster AI with Status
// ============================================

/*
// In battle loop, when monster chooses action:

function monsterAI(monster, heroes, enemies) {
  // Check if stunned - cannot act
  if (hasStatus(monster, "stun")) {
    log(`${monster.name} is stunned!`);
    return false; // Skip action
  }
  
  // Check if paralyzed - 50% fail
  if (hasStatus(monster, "paralyzed")) {
    if (Math.random() < 0.5) {
      log(`${monster.name} is paralyzed!`);
      return false; // Skip action
    }
  }
  
  // Check if confused - 60% chance attack ally
  let target = heroes[0];
  if (hasStatus(monster, "confused")) {
    if (Math.random() < 0.6) {
      target = enemies[0]; // Attack own team
      log(`${monster.name} is confused and attacks an ally!`);
    }
  }
  
  // Normal action
  executeMonsterSkill(monster, target);
  return true;
}
*/

// ============================================
// EXAMPLE 8: Checking Status During Combat
// ============================================

function canUseSkill(character, skill) {
  // Stun blocks everything
  if (hasStatus(character, "stun")) {
    log(`${character.name} is stunned and cannot act!`);
    return false;
  }
  
  // Silenced blocks magical skills
  if (hasStatus(character, "silenced") && skill.resource === "mana") {
    log(`${character.name} is silenced and cannot cast spells!`);
    return false;
  }
  
  // Disarmed blocks physical skills
  if (hasStatus(character, "disarmed") && skill.resource === "sta") {
    log(`${character.name} is disarmed and cannot use physical skills!`);
    return false;
  }
  
  // Paralyzed has 50% fail chance
  if (hasStatus(character, "paralyzed")) {
    if (Math.random() < 0.5) {
      log(`${character.name} is paralyzed and the skill fails!`);
      return false;
    }
  }
  
  // Nullified negates next skill
  if (hasStatus(character, "nullified")) {
    log(`${character.name}'s skill is nullified!`);
    removeStatus(character, "nullified"); // Remove after use
    return false;
  }
  
  return true;
}

// ============================================
// EXAMPLE 9: Status Effect Duration Check
// ============================================

function getStatusDuration(character, statusKey) {
  if (!hasStatus(character, statusKey)) {
    return 0;
  }
  
  let statusData = character.status[statusKey];
  let remainingMs = statusData.expiryTime - Date.now();
  let remainingSec = Math.max(0, remainingMs / 1000);
  
  return remainingSec.toFixed(1);
}

function displayCharacterStatus(character) {
  console.log(`=== ${character.name} ===`);
  console.log(`HP: ${character.hp}/${character.maxHp}`);
  console.log(`Sta: ${character.sta}/${character.maxSta}`);
  console.log(`Mana: ${character.mana}/${character.maxMana}`);
  
  let statuses = getActiveStatuses(character);
  if (statuses.length === 0) {
    console.log("Statuses: None");
  } else {
    console.log("Statuses:");
    statuses.forEach(key => {
      let effect = StatusEffects[key];
      let duration = getStatusDuration(character, key);
      console.log(`  ${effect.icon} ${effect.name} (${duration}s)`);
    });
  }
}

// ============================================
// EXAMPLE 10: Complex Status Scenario
// ============================================

/*
// Scenario: Hero uses skill that applies multiple effects

function executeComplexSkill(self, target) {
  // Skill: "Arcane Torment"
  
  // Step 1: Deal damage
  let damage = self.matk * 1.8;
  if (Math.random() < self.ccrit) {
    damage *= self.dcrit;
  }
  target.takeDamage(damage);
  
  // Step 2: Apply primary status
  applyStatus(target, "confused", 5, self);  // 60% target allies
  
  // Step 3: Apply secondary debuff
  applyStatus(target, "vulnerable", 4, self); // -35% Pdef, -20% Mdef
  
  // Step 4: Conditional third effect
  if (hasStatus(target, "silenced")) {
    // If already silenced, also apply paralyzed
    applyStatus(target, "paralyzed", 3, self);
  } else {
    // Otherwise just silence
    applyStatus(target, "silenced", 3, self);
  }
  
  // Step 5: Team effect
  self.allies.forEach(ally => {
    if (ally && ally !== self) {
      // Ally gains magic boost
      applyStatus(ally, "enlightened", 6, self);
    }
  });
  
  log(`${target.name} is tormented!`);
}
*/

// ============================================
// QUICK REFERENCE
// ============================================

/*
// Apply status:
applyStatus(character, statusKey, duration, source)

// Check if has status:
hasStatus(character, statusKey)

// Remove status:
removeStatus(character, statusKey)

// Get all active:
getActiveStatuses(character)

// Get display string:
getStatusInfoString(character)

// Get icons only:
getStatusIcon(character)

// Clear all:
clearAllStatuses(character)

// Status keys (35 available):
burn, bleeding, poisoned, frostbite, cursed,
stun, paralyzed, confused, slowed, rooted, silenced, disarmed, petrified,
weakened, vulnerable, exhausted, brittle, exposed, blinded,
vampired, manaShock, staminaDrain,
charmed, marked, regenerating, shielded, berserk, enlightened, stealth,
mindControlled, timeSlowed, timeHasted, nullified, cursedArtifact
*/
