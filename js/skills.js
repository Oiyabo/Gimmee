// ===== SKILL SYSTEM OVERHAUL =====
// Skill structure:
// {
//   name: string,
//   type: "active" | "passive",
//   resource: "sta" | "mana",
//   cost: number,
//   cooldown: number,
//   effect: function(self, allies, enemies),
//   passive: { duration: seconds, counter: number } (for passive skills),
//   lore: string
// }
// 
// All skills now use differentiated stats:
// - Physical attacks: patk (Physical Attack), pdef (Physical Defense), pspd (Physical Speed)
// - Magical attacks: matk (Magical Attack), mdef (Magical Defense), mspd (Magical Speed)  
// - True damage: tatt (True Attack) - ignores defenses
// - Critical: ccrit (Critical Chance %), dcrit (Critical Damage multiplier)
// - Resources: sta (Stamina for physical), mana (Mana for magical)

const Skills = {
  // ============================================
  // === KNIGHT SKILLS - Physical Tank/DPS ===
  // ============================================
  
  // ACTIVE - Primary physical attack using Patk
  knightSlash: {
    name: "Knight Slash",
    type: "active",
    resource: "sta",
    cost: 20,
    cooldown: 1,
    lore: "A powerful slash with knightly honor. Cuts cleanly through defenses.",
    effect: (self, allies, enemies) => {
      let target = getNearestTargets(self, alive(enemies))[0];
      if (!target || self.sta < this.cost) return;
      
      self.sta -= this.cost;
      let baseDmg = self.patk * 1.3;
      let isCrit = Math.random() < self.ccrit;
      let dmg = Math.floor(isCrit ? baseDmg * self.dcrit : baseDmg);
      dmg = Math.max(dmg - Math.floor(target.pdef * 0.5), Math.floor(dmg * 0.3));
      target.takeDamage(dmg);
      
      updateHPUI(target);
      log(`⚔️ ${self.name} uses Knight Slash on ${target.name} (${dmg} DMG${isCrit ? ' CRIT!' : ''})`);
    }
  },

  shieldBarrier: {
    name: "Shield Barrier",
    type: "passive",
    resource: "mana",
    cost: 30,
    cooldown: 2,
    lore: "Summon a barrier of light to protect allies. Absorbs 1-2 hits before breaking.",
    effect: (self, allies, enemies) => {
      if (self.mana < this.cost) return;
      self.mana -= this.cost;
      
      allies.forEach(ally => {
        if (ally.isAlive && ally.isAlive()) {
          ally.status.barrier = { active: true, hits: Math.floor(Math.random() * 2) + 1 };
        }
      });
      log(`🛡️ ${self.name} casts Shield Barrier on team!`);
    }
  },

  moonswipe: {
    name: "Moonswipe",
    type: "active",
    resource: "sta",
    cost: 25,
    cooldown: 1.5,
    lore: "Strike with moonlight grace, hitting 3 foes in sweeping arc.",
    effect: (self, allies, enemies) => {
      if (self.sta < this.cost) return;
      self.sta -= this.cost;
      
      let targets = alive(enemies).slice(0, 3);
      targets.forEach(target => {
        let dmg = Math.floor(self.patk * 0.8 - target.pdef);
        target.takeDamage(dmg);
        updateHPUI(target);
      });
      log(`🌙 ${self.name} uses Moonswipe on ${targets.length} enemies!`);
    }
  },

  gauntletPunch: {
    name: "Gauntlet Punch",
    type: "active",
    resource: "sta",
    cost: 35,
    cooldown: 2,
    lore: "Devastating armored punch causing bleeding.",
    effect: (self, allies, enemies) => {
      if (self.sta < this.cost) return;
      self.sta -= this.cost;
      
      let target = getNearestTargets(self, alive(enemies))[0];
      if (!target) return;
      
      let dmg = Math.floor(self.patk * 1.5 - target.pdef);
      target.takeDamage(dmg);
      target.status.bleeding = (target.status.bleeding || 0) + 4;
      
      updateHPUI(target);
      log(`👊 ${self.name} uses Gauntlet Punch! (${dmg} DMG + BLEED!)`);
    }
  },

  // ============================================
  // === PRIEST SKILLS - Magic Support/Heal ===
  // ============================================

  holyHeal: {
    name: "Holy Heal",
    type: "active",
    resource: "mana",
    cost: 40,
    cooldown: 1,
    lore: "Divine light mends wounds of lowest HP ally.",
    effect: (self, allies, enemies) => {
      if (self.mana < this.cost) return;
      self.mana -= this.cost;
      
      let targets = alive(allies).sort((a, b) => a.hp - b.hp);
      if (targets.length === 0) return;
      
      let healAmount = Math.floor(self.matk * 1.8);
      targets[0].heal(healAmount);
      updateHPUI(targets[0]);
      log(`✨ ${self.name} casts Holy Heal (+${healAmount} HP)`);
    }
  },

  resurrect: {
    name: "Resurrect",
    type: "active",
    resource: "mana",
    cost: 80,
    cooldown: 4,
    lore: "Bring fallen allies back to life with 60% HP.",
    effect: (self, allies, enemies) => {
      if (self.mana < this.cost) return;
      self.mana -= this.cost;
      
      let dead = allies.filter(a => !a.isAlive || !a.isAlive());
      if (dead.length === 0) return;
      
      let target = dead[0];
      target.hp = Math.floor(target.maxHp * 0.6);
      updateHPUI(target);
      log(`⚰️ ${self.name} resurrects ${target.name}!`);
    }
  },

  divinePressure: {
    name: "Divine Pressure",
    type: "active",
    resource: "mana",
    cost: 45,
    cooldown: 2,
    lore: "Holy wrath damages all enemies.",
    effect: (self, allies, enemies) => {
      if (self.mana < this.cost) return;
      self.mana -= this.cost;
      
      alive(enemies).forEach(target => {
        let dmg = Math.floor(self.matk * 1.2 - target.mdef);
        target.takeDamage(dmg);
        updateHPUI(target);
      });
      log(`💫 ${self.name} uses Divine Pressure on all!`);
    }
  },

  regeneration: {
    name: "Regeneration",
    type: "passive",
    resource: "mana",
    cost: 20,
    cooldown: 0.5,
    lore: "Continuous healing aura for all allies.",
    effect: (self, allies, enemies) => {
      if (self.mana < this.cost) return;
      self.mana -= this.cost;
      
      allies.forEach(ally => {
        if (ally.isAlive && ally.isAlive() && ally.hp < ally.maxHp) {
          let heal = Math.floor(self.matk * 0.4);
          ally.heal(heal);
          updateHPUI(ally);
        }
      });
    }
  },

  // ============================================
  // === MAGE SKILLS - AoE Damage ===
  // ============================================

  inferno: {
    name: "Inferno",
    type: "active",
    resource: "mana",
    cost: 50,
    cooldown: 2,
    lore: "Rain fire on all enemies, causing burn.",
    effect: (self, allies, enemies) => {
      if (self.mana < this.cost) return;
      self.mana -= this.cost;
      
      alive(enemies).forEach(target => {
        let dmg = Math.floor(self.matk * 1.4 - target.mdef);
        target.takeDamage(dmg);
        target.status.burn = (target.status.burn || 0) + 3;
        updateHPUI(target);
      });
      log(`🔥 ${self.name} casts Inferno!`);
    }
  },

  lightingStrike: {
    name: "Lightning Strike",
    type: "active",
    resource: "mana",
    cost: 45,
    cooldown: 1.5,
    lore: "Strike with lightning, paralyzing target.",
    effect: (self, allies, enemies) => {
      if (self.mana < this.cost) return;
      self.mana -= this.cost;
      
      let target = getNearestTargets(self, alive(enemies))[0];
      if (!target) return;
      
      let dmg = Math.floor(self.matk * 1.3 - target.mdef);
      target.takeDamage(dmg);
      target.status.paralyzed = (target.status.paralyzed || 0) + 2;
      updateHPUI(target);
      log(`⚡ ${self.name} strikes ${target.name}! (${dmg} + PARALYZED)`);
    }
  },

  chainLightning: {
    name: "Chain Lightning",
    type: "active",
    resource: "mana",
    cost: 55,
    cooldown: 2,
    lore: "Lightning jumps between up to 4 enemies.",
    effect: (self, allies, enemies) => {
      if (self.mana < this.cost) return;
      self.mana -= this.cost;
      
      let targets = alive(enemies).slice(0, 4);
      targets.forEach(target => {
        let dmg = Math.floor(self.matk * 0.9 - target.mdef);
        target.takeDamage(dmg);
        updateHPUI(target);
      });
      log(`⚡ ${self.name} casts Chain Lightning on ${targets.length} enemies!`);
    }
  },

  arcaneBarrier: {
    name: "Arcane Barrier",
    type: "passive",
    resource: "mana",
    cost: 35,
    cooldown: 2,
    lore: "Mystical barrier blocks 2 magical attacks.",
    effect: (self, allies, enemies) => {
      if (self.mana < this.cost) return;
      self.mana -= this.cost;
      
      allies.forEach(ally => {
        if (ally.isAlive && ally.isAlive()) {
          ally.status.mageShield = { active: true, blocks: 2 };
        }
      });
      log(`🔮 ${self.name} casts Arcane Barrier!`);
    }
  },

  // ============================================
  // === ROGUE SKILLS - High Crit Physical ===
  // ============================================

  quickStrike: {
    name: "Quick Strike",
    type: "active",
    resource: "sta",
    cost: 15,
    cooldown: 0.8,
    lore: "Swift strike with bonus crit chance.",
    effect: (self, allies, enemies) => {
      if (self.sta < this.cost) return;
      self.sta -= this.cost;
      
      let target = getNearestTargets(self, alive(enemies))[0];
      if (!target) return;
      
      let crit = Math.random() < Math.min(self.ccrit + 0.2, 0.9);
      let dmg = Math.floor((crit ? self.patk * self.dcrit : self.patk) - target.pdef);
      target.takeDamage(dmg);
      updateHPUI(target);
      log(`💨 ${self.name} strikes! (${dmg}${crit ? ' CRIT!' : ''})`);
    }
  },

  dodge: {
    name: "Dodge",
    type: "passive",
    resource: "sta",
    cost: 25,
    cooldown: 1.5,
    lore: "Evade 2-4 incoming attacks.",
    effect: (self, allies, enemies) => {
      if (self.sta < this.cost) return;
      self.sta -= this.cost;
      
      let dodges = Math.floor(Math.random() * 3) + 2;
      self.status.evade = { active: true, dodges_left: dodges };
      log(`🏃 ${self.name} enters Dodge mode!`);
    }
  },

  targetedSlice: {
    name: "Targeted Slice",
    type: "active",
    resource: "sta",
    cost: 30,
    cooldown: 1.5,
    lore: "Precise attack ignoring 70% defense.",
    effect: (self, allies, enemies) => {
      if (self.sta < this.cost) return;
      self.sta -= this.cost;
      
      let target = getNearestTargets(self, alive(enemies))[0];
      if (!target) return;
      
      let dmg = Math.floor((self.patk * 0.8 + self.tatt * 1.5) - target.pdef * 0.3);
      target.takeDamage(dmg);
      updateHPUI(target);
      log(`🎯 ${self.name} slices ${target.name}! (${dmg})`);
    }
  },

  gamblingSlice: {
    name: "Gambling Slice",
    type: "active",
    resource: "sta",
    cost: 20,
    cooldown: 1,
    lore: "High variance attack - weak, normal, or massive!",
    effect: (self, allies, enemies) => {
      if (self.sta < this.cost) return;
      self.sta -= this.cost;
      
      let target = getNearestTargets(self, alive(enemies))[0];
      if (!target) return;
      
      let roll = Math.random();
      let mult = roll < 0.3 ? 0.5 : roll < 0.7 ? 1.2 : 2.0;
      let dmg = Math.floor(self.patk * mult - target.pdef);
      target.takeDamage(dmg);
      updateHPUI(target);
      let result = roll < 0.3 ? "Weak!" : roll < 0.7 ? "Normal" : "MASSIVE!";
      log(`🎲 ${self.name} gambles... ${result} (${dmg})`);
    }
  },

  // ============================================
  // === PALADIN SKILLS - Balanced Tank ===
  // ============================================

  heavySwing: {
    name: "Heavy Swing",
    type: "active",
    resource: "sta",
    cost: 40,
    cooldown: 2,
    lore: "Powerful swing combining strength and faith.",
    effect: (self, allies, enemies) => {
      if (self.sta < this.cost) return;
      self.sta -= this.cost;
      
      let target = getNearestTargets(self, alive(enemies))[0];
      if (!target) return;
      
      let dmg = Math.floor(self.patk * 1.4 - target.pdef);
      target.takeDamage(dmg);
      updateHPUI(target);
      log(`💪 ${self.name} swings heavily! (${dmg})`);
    }
  },

  taunt: {
    name: "Taunt",
    type: "passive",
    resource: "mana",
    cost: 30,
    cooldown: 2,
    lore: "Force all enemies to attack only you for 3-7 seconds.",
    effect: (self, allies, enemies) => {
      if (self.mana < this.cost) return;
      self.mana -= this.cost;
      
      let duration = Math.floor(Math.random() * 4) + 3;
      self.status.taunted = { active: true, duration: duration };
      alive(enemies).forEach(e => e.forcedTarget = self);
      log(`🎯 ${self.name} taunts all enemies!`);
    }
  },

  counterAttack: {
    name: "Counter Attack",
    type: "active",
    resource: "sta",
    cost: 25,
    cooldown: 1,
    lore: "Damage attacker while healing 50% of damage.",
    effect: (self, allies, enemies) => {
      if (self.sta < this.cost) return;
      self.sta -= this.cost;
      
      let target = getNearestTargets(self, alive(enemies))[0];
      if (!target) return;
      
      let dmg = Math.floor(self.patk * 0.6 + self.pdef * 0.3 - target.pdef);
      target.takeDamage(dmg);
      let heal = Math.floor(dmg * 0.5);
      self.heal(heal);
      
      updateHPUI(target);
      updateHPUI(self);
      log(`🛡️ ${self.name} counters! (${dmg} DMG, +${heal} HP)`);
    }
  },

  shieldReflect: {
    name: "Shield Reflect",
    type: "passive",
    resource: "mana",
    cost: 35,
    cooldown: 2,
    lore: "Reflect 30% of damage back to attackers for 8 seconds.",
    effect: (self, allies, enemies) => {
      if (self.mana < this.cost) return;
      self.mana -= this.cost;
      
      self.status.reflect = { active: true, percent: 0.3, duration: 8 };
      log(`✨ ${self.name} mirrors damage!`);
    }
  },

  // ============================================
  // === ARCHER SKILLS - Ranged Physical DPS ===
  // ============================================

  preciseShot: {
    name: "Precise Shot",
    type: "active",
    resource: "sta",
    cost: 20,
    cooldown: 1,
    lore: "Carefully aimed shot with high crit chance.",
    effect: (self, allies, enemies) => {
      if (self.sta < this.cost) return;
      self.sta -= this.cost;
      
      let target = getNearestTargets(self, alive(enemies))[0];
      if (!target) return;
      
      let crit = Math.random() < Math.min(self.ccrit + 0.25, 0.95);
      let dmg = Math.floor((crit ? self.patk * self.dcrit * 1.2 : self.patk * 1.1) - target.pdef * 0.2);
      target.takeDamage(dmg);
      updateHPUI(target);
      log(`🎯 ${self.name} shoots! (${dmg}${crit ? ' HEADSHOT!' : ''})`);
    }
  },

  heavyShot: {
    name: "Heavy Shot",
    type: "active",
    resource: "sta",
    cost: 35,
    cooldown: 2,
    lore: "Maximum force draw - devastating power.",
    effect: (self, allies, enemies) => {
      if (self.sta < this.cost) return;
      self.sta -= this.cost;
      
      let target = getNearestTargets(self, alive(enemies))[0];
      if (!target) return;
      
      let dmg = Math.floor(self.patk * 1.5 - target.pdef);
      target.takeDamage(dmg);
      updateHPUI(target);
      log(`💥 ${self.name} fires heavy shot! (${dmg})`);
    }
  },

  arrowBarrage: {
    name: "Arrow Barrage",
    type: "active",
    resource: "sta",
    cost: 45,
    cooldown: 2.5,
    lore: "Storm of arrows hitting all enemies.",
    effect: (self, allies, enemies) => {
      if (self.sta < this.cost) return;
      self.sta -= this.cost;
      
      let targets = alive(enemies);
      let hits = 0;
      targets.forEach(target => {
        if (Math.random() < 0.8) {
          let dmg = Math.floor(self.patk * 0.7 - target.pdef);
          target.takeDamage(dmg);
          updateHPUI(target);
          hits++;
        }
      });
      log(`🏹 ${self.name} fires arrows! ${hits} hit!`);
    }
  },

  evasion: {
    name: "Evasion",
    type: "passive",
    resource: "sta",
    cost: 30,
    cooldown: 1.5,
    lore: "Evade attacks while setting up counters.",
    effect: (self, allies, enemies) => {
      if (self.sta < this.cost) return;
      self.sta -= this.cost;
      
      let dodges = Math.floor(Math.random() * 2) + 3;
      self.status.evade = { active: true, dodges_left: dodges };
      log(`🏃 ${self.name} enters Evasion!`);
    }
  },

  // ============================================
  // === UTILITY & PASSIVE SKILLS ===
  // ============================================

  basicAttack: {
    name: "Basic Attack",
    type: "active",
    resource: "sta",
    cost: 10,
    cooldown: 0.5,
    effect: (self, allies, enemies) => {
      if (self.sta < this.cost) return;
      self.sta -= this.cost;
      
      let target = getNearestTargets(self, alive(enemies))[0];
      if (!target) return;
      
      let dmg = Math.floor(self.patk - target.pdef);
      target.takeDamage(dmg);
      updateHPUI(target);
    }
  },

  ironWill: {
    name: "Iron Will",
    type: "passive",
    resource: "mana",
    cost: 25,
    cooldown: 2,
    lore: "Reduce all damage by 25% for 6 seconds.",
    effect: (self, allies, enemies) => {
      if (self.mana < this.cost) return;
      self.mana -= this.cost;
      
      self.status.ironWill = { active: true, reduction: 0.25, duration: 6 };
      log(`💎 ${self.name} hardens spirit!`);
    }
  },

  blessings: {
    name: "Blessings",
    type: "passive",
    resource: "mana",
    cost: 30,
    cooldown: 1.5,
    lore: "Bless all allies, healing over time.",
    effect: (self, allies, enemies) => {
      if (self.mana < this.cost) return;
      self.mana -= this.cost;
      
      allies.forEach(ally => {
        if (ally.isAlive && ally.isAlive()) {
          ally.status.blessed = { active: true, duration: 10 };
        }
      });
      log(`✨ ${self.name} blesses the team!`);
    }
  },

  lifesteal: {
    name: "Lifesteal",
    type: "passive",
    resource: "mana",
    cost: 40,
    cooldown: 3,
    lore: "Drain life from enemies - gain 40% of damage as HP.",
    effect: (self, allies, enemies) => {
      if (self.mana < this.cost) return;
      self.mana -= this.cost;
      
      self.status.lifesteal = { active: true, percent: 0.4, duration: 8 };
      log(`🩸 ${self.name} gains Lifesteal!`);
    }
  },

  thorns: {
    name: "Thorns",
    type: "passive",
    resource: "mana",
    cost: 30,
    cooldown: 2,
    lore: "Hurt anyone who touches you - reflect 40% damage.",
    effect: (self, allies, enemies) => {
      if (self.mana < this.cost) return;
      self.mana -= this.cost;
      
      self.status.thorns = { active: true, percent: 0.4, duration: 7 };
      log(`🌹 ${self.name} gains Thorns!`);
    }
  },

  defensiveStance: {
    name: "Defensive Stance",
    type: "passive",
    resource: "sta",
    cost: 25,
    cooldown: 2,
    lore: "Increase DEF by 30%, reduce ATK for 6 seconds.",
    effect: (self, allies, enemies) => {
      if (self.sta < this.cost) return;
      self.sta -= this.cost;
      
      self.status.defensive = { active: true, def_mult: 1.3, duration: 6 };
      log(`🛡️ ${self.name} takes defensive stance!`);
    }
  },

  offensiveStance: {
    name: "Offensive Stance",
    type: "passive",
    resource: "sta",
    cost: 25,
    cooldown: 2,
    lore: "Increase ATK by 40%, reduce DEF for 6 seconds.",
    effect: (self, allies, enemies) => {
      if (self.sta < this.cost) return;
      self.sta -= this.cost;
      
      self.status.offensive = { active: true, atk_mult: 1.4, duration: 6 };
      log(`⚔️ ${self.name} takes offensive stance!`);
    }
  },
};

// ============================================
// === HELPER FUNCTIONS ===
// ============================================

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)] || null;
}

    let target = random(alive(allies));
    if (!target) return;
    target.status.shield = true;
    updateStatusUI(target);
    log(`${self.name} casts Shield Barrier on ${target.name}`);
  },
  moonswipe: (self, allies, enemies) => {
    let targets = alive(enemies).slice(0, 3);
    targets.forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 0.8));
      log(`${self.name} uses Moonswipe on ${e.name} (${dmg})`);
    });
  },
  gauntletPunch: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let dmg = target.takeDamage(Math.floor(self.atk * 1.3));
    target.status.bleeding = 3;
    updateStatusUI(target);
    log(`${self.name} uses Gauntlet Punch on ${target.name} (${dmg} + bleeding)`);
  },

  // === PRIEST SKILLS ===
  holyHeal: (self, allies) => {
    let target = random(alive(allies));
    if (!target) return;
    target.heal(Math.floor(self.atk * 1.5));
    log(`${self.name} casts Holy Heal on ${target.name} (+${Math.floor(self.atk * 1.5)})`);
  },
  resurrect: (self, allies, enemies) => {
    let deadAllies = allies.filter((a) => !a.isAlive());
    if (deadAllies.length === 0) return;
    let target = random(deadAllies);
    target.hp = Math.floor(target.maxHp * 0.5);
    updateHPUI(target);
    updateDeadUI(target);
    log(`${self.name} resurrects ${target.name} (HP +${Math.floor(target.maxHp * 0.5)})`);
  },
  divinePressure: (self, allies, enemies) => {
    let targets = alive(enemies).slice(0, 3);
    targets.forEach((e) => {
      e.status.stun = 1;
      updateStatusUI(e);
      log(`${self.name} casts Divine Pressure on ${e.name} (stunned)`);
    });
  },
  divineRaise: (self, allies) => {
    let target = random(alive(allies));
    if (!target) return;
    target.status.buffed = 4;
    target.status.buffStats = { atk: 5, def: 3, spd: 0.15 };
    target.atk += 5;
    target.def += 3;
    target.spd += 0.15;
    updateStatusUI(target);
    log(`${self.name} casts Divine Raise on ${target.name} (ATK +5, DEF +3, SPD +0.15)`);
  },

  // === MAGE SKILLS ===
  inferno: (self, allies, enemies) => {
    alive(enemies).forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 1.3));
      e.status.burn = 3;
      updateStatusUI(e);
      log(`${self.name} uses Inferno on ${e.name} (${dmg} + burn)`);
    });
  },
  lightingStrike: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let dmg = target.takeDamage(Math.floor(self.atk * 1.1));
    if (Math.random() < 0.5) {
      target.status.paralyzed = 2;
      updateStatusUI(target);
      log(`${self.name} uses Lighting Strike on ${target.name} (${dmg} + paralyzed)`);
    } else {
      log(`${self.name} uses Lighting Strike on ${target.name} (${dmg})`);
    }
  },
  airCutting: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let dmg1 = target.takeDamage(Math.floor(self.atk * 0.5));
    let dmg2 = target.takeDamage(Math.floor(self.atk * 1.0));
    let dmg3 = target.takeDamage(Math.floor(self.atk * 1.5));
    log(`${self.name} uses Air Cutting on ${target.name} (${dmg1} + ${dmg2} + ${dmg3})`);
  },

  // === ROGUE SKILLS ===
  quickStrike: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let dmg = target.takeDamage(Math.floor(self.spd * 8));
    log(`${self.name} uses Quick Strike on ${target.name} (${dmg})`);
  },
  dodge: (self, allies) => {
    self.status.critical = 2;
    updateStatusUI(self);
    log(`${self.name} uses Dodge (avoid next attack)`);
  },
  targetedSlice: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let dmg = target.takeDamage(Math.floor(self.atk * (target.hp / target.maxHp)));
    log(`${self.name} uses Targeted Slice on ${target.name} (${dmg})`);
  },
  gamblingSlice: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    if (Math.random() < 0.5) {
      let dmg = target.takeDamage(Math.floor(self.atk * 2.5));
      log(`${self.name} uses Gambling Slice on ${target.name} (CRITICAL! ${dmg})`);
    } else {
      log(`${self.name} uses Gambling Slice on ${target.name} (FAILED!)`);
    }
  },

  // === PALADIN SKILLS ===
  heavySwing: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let dmg = target.takeDamage(Math.floor((self.maxHp * 0.15) + self.atk));
    log(`${self.name} uses Heavy Swing on ${target.name} (${dmg})`);
  },
  taunt: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    target.status.taunt = true;
    updateStatusUI(target);
    log(`${self.name} taunts ${target.name}`);
  },
  martyr: (self, allies, enemies) => {
    let totalDmg = 0;
    alive(allies).forEach((a) => {
      if (a !== self && a.status.buffed > 0) totalDmg += 10;
    });
    if (totalDmg > 0) self.status.buffed = 2;
    updateStatusUI(self);
    log(`${self.name} becomes Martyr! (Allies protected)`);
  },
  parry: (self, allies, enemies) => {
    self.status.shield = true;
    updateStatusUI(self);
    log(`${self.name} uses Parry (block and reflect)`);
  },

  // === ARCHER SKILLS ===
  preciseShot: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let dmg = target.takeDamage(Math.floor(self.atk * 1.4));
    log(`${self.name} uses Precise Shot on ${target.name} (${dmg})`);
  },
  heavyShot: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let dmg = target.takeDamage(Math.floor(self.atk + target.def * 0.8));
    log(`${self.name} uses Heavy Shot on ${target.name} (${dmg})`);
  },
  fastShot: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let dmg = target.takeDamage(Math.floor(self.atk * (target.maxHp / 150)));
    log(`${self.name} uses Fast Shot on ${target.name} (${dmg})`);
  },
  arrowsRain: (self, allies, enemies) => {
    let targets = alive(enemies);
    targets.forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * (e.spd / 2)));
      log(`${self.name} uses Arrows Rain on ${e.name} (${dmg})`);
    });
  },

  // === GIANT SKILLS ===
  earthquake: (self, allies, enemies) => {
    alive(enemies).forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 0.9));
      e.status.stun = 1;
      updateStatusUI(e);
      log(`${self.name} uses Earthquake on ${e.name} (${dmg} + stunned)`);
    });
  },
  groundSlam: (self, allies, enemies) => {
    let targets = alive(enemies).slice(0, 4);
    targets.forEach((e) => {
      let dmg = e.takeDamage(Math.floor((self.maxHp * 0.1) + self.atk * 0.8));
      log(`${self.name} uses Ground Slam on ${e.name} (${dmg})`);
    });
  },
  crushingBlow: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let dmg = target.takeDamage(Math.floor(self.atk * 1.6));
    target.def = Math.max(0, target.def - 2);
    updateStatusUI(target);
    log(`${self.name} uses Crushing Blow on ${target.name} (${dmg} + DEF -2)`);
  },

  // === VAMPIRE SKILLS ===
  lifeDrain: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let dmg = target.takeDamage(Math.floor(self.atk * 1.1));
    let healAmount = Math.floor(dmg * 0.6);
    self.heal(healAmount);
    updateHPUI(self);
    log(`${self.name} uses Life Drain on ${target.name} (${dmg} damage, heals ${healAmount})`);
  },
  vampiricBite: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let dmg = target.takeDamage(Math.floor(self.atk * 1.25));
    target.status.bleeding = 2;
    let healAmount = Math.floor(dmg * 0.7);
    self.heal(healAmount);
    updateHPUI(self);
    updateStatusUI(target);
    log(`${self.name} uses Vampiric Bite on ${target.name} (${dmg} + bleeding, heals ${healAmount})`);
  },
  shadowCloak: (self, allies) => {
    self.status.buffed = 3;
    self.status.buffStats = { atk: 0, def: 4, spd: 0.2 };
    self.def += 4;
    self.spd += 0.2;
    updateStatusUI(self);
    log(`${self.name} uses Shadow Cloak (DEF +4, SPD +0.2)`);
  },

  // === BANDIT SKILLS ===
  backstab: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let baseDmg = self.atk * 1.8;
    let isCritical = Math.random() < 0.4;
    let dmg = isCritical 
      ? target.takeDamage(Math.floor(baseDmg * 1.5))
      : target.takeDamage(Math.floor(baseDmg));
    log(`${self.name} uses Backstab on ${target.name} (${dmg}${isCritical ? ' CRITICAL!' : ''})`);
  },
  smokeBomb: (self, allies, enemies) => {
    self.status.critical = 3;
    self.spd += 0.3;
    updateStatusUI(self);
    log(`${self.name} uses Smoke Bomb (evasion +3 turns, SPD +0.3)`);
  },
  shadowStrike: (self, allies, enemies) => {
    let targets = alive(enemies).slice(0, 2);
    targets.forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 1.3 + self.spd * 2));
      log(`${self.name} uses Shadow Strike on ${e.name} (${dmg})`);
    });
  },

  // === DRAGON SKILLS ===
  dragonBreath: (self, allies, enemies) => {
    alive(enemies).forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 1.4));
      e.status.burn = 2;
      updateStatusUI(e);
      log(`${self.name} uses Dragon Breath on ${e.name} (${dmg} + burn)`);
    });
  },
  tailWhip: (self, allies, enemies) => {
    let targets = alive(enemies).slice(0, 3);
    targets.forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 0.9));
      log(`${self.name} uses Tail Whip on ${e.name} (${dmg})`);
    });
  },
  dragonsRoar: (self, allies, enemies) => {
    alive(enemies).forEach((e) => {
      e.atk = Math.max(0, e.atk - 3);
      e.def = Math.max(0, e.def - 2);
      e.status.stun = 1;
      updateStatusUI(e);
      log(`${self.name} roars terrifyingly at ${e.name} (ATK -3, DEF -2, stunned)`);
    });
  },

  // === LICH SKILLS ===
  deathCurse: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    target.status.bleeding = 4;
    target.atk = Math.max(0, target.atk - 4);
    updateStatusUI(target);
    log(`${self.name} casts Death Curse on ${target.name} (bleeding +4, ATK -4)`);
  },
  soulDrain: (self, allies, enemies) => {
    let targets = alive(enemies).slice(0, 2);
    targets.forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 1.2));
      let enemyHeal = Math.floor(dmg * 0.5);
      self.heal(enemyHeal);
      updateHPUI(self);
      log(`${self.name} drains soul from ${e.name} (${dmg} damage, heals ${enemyHeal})`);
    });
  },
  deathNova: (self, allies, enemies) => {
    let dmg = Math.floor(self.maxHp * 0.2);
    self.takeDamage(dmg);
    alive(enemies).forEach((e) => {
      let targetDmg = e.takeDamage(Math.floor(self.atk * 2 + dmg));
      log(`${self.name} uses Death Nova on ${e.name} (${targetDmg})`);
    });
    updateHPUI(self);
  },

  // === GHOUL SKILLS ===
  decayingTouch: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let dmg = target.takeDamage(Math.floor(self.atk * 1.1));
    target.def = Math.max(0, target.def - 3);
    updateStatusUI(target);
    log(`${self.name} uses Decaying Touch on ${target.name} (${dmg}, DEF -3)`);
  },
  undeadRegeneration: (self, allies) => {
    let healAmount = Math.floor(self.maxHp * 0.25);
    self.heal(healAmount);
    updateHPUI(self);
    log(`${self.name} uses Undead Regeneration (+${healAmount} HP)`);
  },
  corpseExplosion: (self, allies, enemies) => {
    if (alive(enemies).length === 0) return;
    let target = random(alive(enemies));
    let dmg = target.takeDamage(Math.floor(self.atk * 1.5));
    alive(enemies).forEach((e) => {
      if (e !== target) {
        let splash = e.takeDamage(Math.floor(dmg * 0.5));
        log(`${self.name} explodes! ${e.name} takes splash (${splash})`);
      }
    });
    log(`${self.name} uses Corpse Explosion on ${target.name} (${dmg})`);
  },

  // === CENTAUR SKILLS ===
  arrowBarrage: (self, allies, enemies) => {
    let targets = alive(enemies);
    targets.forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 1.0 + self.spd * 3));
      log(`${self.name} fires arrows at ${e.name} (${dmg})`);
    });
  },
  trample: (self, allies, enemies) => {
    let targets = alive(enemies).slice(0, 3);
    targets.forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 0.7 + self.spd * 5));
      log(`${self.name} tramples on ${e.name} (${dmg})`);
    });
  },

  // === MINOTAUR SKILLS ===
  charge: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let dmg = target.takeDamage(Math.floor(self.atk * 1.4));
    target.status.stun = 1;
    updateStatusUI(target);
    log(`${self.name} uses Charge on ${target.name} (${dmg} + stunned)`);
  },
  hornStrike: (self, allies, enemies) => {
    let targets = alive(enemies).slice(0, 2);
    targets.forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 1.3));
      e.status.bleeding = 2;
      updateStatusUI(e);
      log(`${self.name} uses Horn Strike on ${e.name} (${dmg} + bleeding)`);
    });
  },

  // === HARPY SKILLS ===
  aerialStrike: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let dmg = target.takeDamage(Math.floor(self.atk * 1.2 + self.spd * 4));
    log(`${self.name} uses Aerial Strike on ${target.name} (${dmg})`);
  },
  windGust: (self, allies, enemies) => {
    let targets = alive(enemies).slice(0, 3);
    targets.forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 0.8));
      e.spd = Math.max(0.2, e.spd - 0.2);
      updateStatusUI(e);
      log(`${self.name} uses Wind Gust on ${e.name} (${dmg}, SPD -0.2)`);
    });
  },

  // === CHIMERA SKILLS ===
  multiStrike: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let dmg1 = target.takeDamage(Math.floor(self.atk * 0.8));
    let dmg2 = target.takeDamage(Math.floor(self.atk * 0.8));
    let dmg3 = target.takeDamage(Math.floor(self.atk * 1.0));
    log(`${self.name} uses Multi-Strike on ${target.name} (${dmg1} + ${dmg2} + ${dmg3})`);
  },
  hydraAttack: (self, allies, enemies) => {
    alive(enemies).forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 0.7));
      log(`${self.name} attacks ${e.name} with all heads (${dmg})`);
    });
  },

  // === PHOENIX SKILLS ===
  rebirth: (self, allies) => {
    let healAmount = Math.floor(self.maxHp * 0.4);
    self.heal(healAmount);
    self.status.buffed = 2;
    self.status.buffStats = { atk: 3, def: 2, spd: 0.1 };
    self.atk += 3;
    self.def += 2;
    self.spd += 0.1;
    updateHPUI(self);
    updateStatusUI(self);
    log(`${self.name} uses Rebirth (+${healAmount} HP, ATK +3, DEF +2, SPD +0.1)`);
  },
  blazing: (self, allies, enemies) => {
    alive(enemies).forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 1.5));
      e.status.burn = 3;
      updateStatusUI(e);
      log(`${self.name} uses Blazing on ${e.name} (${dmg} + burn)`);
    });
  },

  // === GARGOYLE SKILLS ===
  stoneSkin: (self, allies) => {
    self.status.buffed = 4;
    self.status.buffStats = { atk: 0, def: 6, spd: -0.3 };
    self.def += 6;
    self.spd = Math.max(0.2, self.spd - 0.3);
    updateStatusUI(self);
    log(`${self.name} uses Stone Skin (DEF +6, SPD -0.3)`);
  },
  petrify: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let dmg = target.takeDamage(Math.floor(self.atk * 1.0));
    target.status.stun = 2;
    target.spd = Math.max(0.1, target.spd * 0.5);
    updateStatusUI(target);
    log(`${self.name} uses Petrify on ${target.name} (${dmg}, stunned + SPD halved)`);
  },

  // === BASILISK SKILLS ===
  petrifyingGaze: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let dmg = target.takeDamage(Math.floor(self.atk * 1.1));
    target.status.stun = 2;
    updateStatusUI(target);
    log(`${self.name} uses Petrifying Gaze on ${target.name} (${dmg} + stunned)`);
  },
  poisonSpray: (self, allies, enemies) => {
    let targets = alive(enemies).slice(0, 3);
    targets.forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 0.8));
      e.status.bleeding = 2;
      updateStatusUI(e);
      log(`${self.name} sprays poison on ${e.name} (${dmg} + bleeding)`);
    });
  },

  // === KRAKEN SKILLS ===
  tentacleWhip: (self, allies, enemies) => {
    let targets = alive(enemies).slice(0, 4);
    targets.forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 0.85));
      log(`${self.name} whips ${e.name} with tentacles (${dmg})`);
    });
  },
  drowning: (self, allies, enemies) => {
    let targets = alive(enemies);
    targets.forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 1.2));
      e.status.stun = 1;
      updateStatusUI(e);
      log(`${self.name} drowns ${e.name} (${dmg} + stunned)`);
    });
  },

  // === BANSHEE SKILLS ===
  deathScream: (self, allies, enemies) => {
    alive(enemies).forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 1.0));
      e.status.stun = 1;
      e.atk = Math.max(0, e.atk - 2);
      updateStatusUI(e);
      log(`${self.name} screams! ${e.name} takes ${dmg} (stunned, ATK -2)`);
    });
  },
  weaken: (self, allies, enemies) => {
    let targets = alive(enemies).slice(0, 3);
    targets.forEach((e) => {
      e.atk = Math.max(0, e.atk - 4);
      e.def = Math.max(0, e.def - 2);
      updateStatusUI(e);
      log(`${self.name} weakens ${e.name} (ATK -4, DEF -2)`);
    });
  },

  // === WRAITH SKILLS ===
  etherealStrike: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let dmg = target.takeDamage(Math.floor(self.atk * 1.3 + self.spd * 3));
    log(`${self.name} uses Ethereal Strike on ${target.name} (${dmg})`);
  },
  phaseShift: (self, allies) => {
    self.status.critical = 3;
    self.def += 3;
    updateStatusUI(self);
    log(`${self.name} uses Phase Shift (evasion +3, DEF +3)`);
  },

  // ===== KNIGHT UPGRADED & NEW SKILLS =====
  knightSlashPlus: (self, allies, enemies) => {
    let targets = alive(enemies).slice(0, 2);
    targets.forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 1.5));
      log(`${self.name} uses Knight Slash+ on ${e.name} (${dmg})`);
    });
  },
  shieldBarrierPlus: (self, allies) => {
    let targets = alive(allies);
    targets.forEach((a) => {
      a.status.shield = true;
      updateStatusUI(a);
    });
    log(`${self.name} casts Shield Barrier+ on all allies`);
  },
  moonswipePlus: (self, allies, enemies) => {
    let targets = alive(enemies);
    targets.forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 1.0));
      log(`${self.name} uses Moonswipe+ on ${e.name} (${dmg})`);
    });
  },
  gauntletPunchPlus: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let dmg = target.takeDamage(Math.floor(self.atk * 1.6));
    target.status.bleeding = 5;
    target.status.stun = 1;
    updateStatusUI(target);
    log(`${self.name} uses Gauntlet Punch+ on ${target.name} (${dmg} + bleeding + stun)`);
  },
  whirlwindStrike: (self, allies, enemies) => {
    alive(enemies).forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 0.9));
      log(`${self.name} whirls around hitting ${e.name} (${dmg})`);
    });
  },
  counterAttack: (self, allies, enemies) => {
    self.status.buffed = 2;
    self.def += 4;
    updateStatusUI(self);
    log(`${self.name} takes a defensive stance (DEF +4, counter enabled)`);
  },
  lastStand: (self, allies, enemies) => {
    if (self.hp < self.maxHp * 0.3) {
      let dmg = Math.floor(self.maxHp * 0.5);
      alive(enemies).forEach((e) => {
        let targetDmg = e.takeDamage(dmg);
        log(`${self.name} makes Last Stand! ${e.name} takes ${targetDmg}`);
      });
    }
  },
  vengeance: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let healTaken = Math.floor(self.maxHp * 0.15);
    self.heal(healTaken);
    let dmg = target.takeDamage(Math.floor(self.atk * 1.4 + healTaken));
    updateHPUI(self);
    log(`${self.name} uses Vengeance on ${target.name} (${dmg})`);
  },
  shieldBash: (self, allies, enemies) => {
    let targets = alive(enemies).slice(0, 2);
    targets.forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 1.1));
      e.status.stun = 1;
      updateStatusUI(e);
      log(`${self.name} bashes ${e.name} with shield (${dmg} + stun)`);
    });
  },
  ironWill: (self, allies) => {
    self.status.buffed = 3;
    self.def += 5;
    self.atk += 2;
    updateStatusUI(self);
    log(`${self.name} manifests Iron Will (DEF +5, ATK +2)`);
  },

  // ===== PRIEST UPGRADED & NEW SKILLS =====
  holyHealPlus: (self, allies) => {
    let targets = alive(allies);
    targets.forEach((a) => {
      a.heal(Math.floor(self.atk * 2.0));
      updateHPUI(a);
    });
    log(`${self.name} casts Holy Heal+ on all allies`);
  },
  resurrectPlus: (self, allies, enemies) => {
    let deadAllies = allies.filter((a) => !a.isAlive());
    if (deadAllies.length === 0) return;
    deadAllies.forEach((a) => {
      a.hp = Math.floor(a.maxHp * 0.7);
      updateHPUI(a);
      updateDeadUI(a);
    });
    log(`${self.name} resurrects all fallen allies!`);
  },
  divinePressurePlus: (self, allies, enemies) => {
    alive(enemies).forEach((e) => {
      e.status.stun = 2;
      updateStatusUI(e);
    });
    log(`${self.name} casts Divine Pressure+ (all stunned)`);
  },
  divineRaisePlus: (self, allies) => {
    let targets = alive(allies);
    targets.forEach((a) => {
      a.status.buffed = 5;
      a.atk += 8;
      a.def += 4;
      a.spd += 0.2;
      updateStatusUI(a);
    });
    log(`${self.name} casts Divine Raise+ on all allies`);
  },
  massHeal: (self, allies) => {
    let healAmount = Math.floor(self.maxHp * 0.3);
    alive(allies).forEach((a) => {
      a.heal(healAmount);
      updateHPUI(a);
    });
    log(`${self.name} mass heals all allies (+${healAmount} HP each)`);
  },
  purification: (self, allies, enemies) => {
    alive(enemies).forEach((e) => {
      e.status.burn = 0;
      e.status.bleeding = 0;
      e.status.paralyzed = 0;
      e.atk = Math.max(0, e.atk - 3);
      updateStatusUI(e);
    });
    log(`${self.name} purifies the battlefield (enemies cleansed & weakened)`);
  },
  blessings: (self, allies) => {
    let targets = alive(allies);
    targets.forEach((a) => {
      a.status.buffed = 4;
      a.def += 3;
      a.spd += 0.1;
      updateStatusUI(a);
    });
    log(`${self.name} bestows Blessings on all allies`);
  },
  divinePulse: (self, allies, enemies) => {
    let healAmount = Math.floor(self.atk * 1.8);
    let target = random(alive(allies));
    if (!target) return;
    target.heal(healAmount);
    let dmg = Math.floor(healAmount * 0.8);
    alive(enemies).forEach((e) => {
      let targetDmg = e.takeDamage(dmg);
      log(`${self.name} Divine Pulse damages ${e.name} (${targetDmg})`);
    });
    updateHPUI(target);
  },
  guardian: (self, allies, enemies) => {
    let target = random(alive(allies));
    if (!target) return;
    target.status.shield = true;
    target.def += 6;
    updateStatusUI(target);
    log(`${self.name} becomes ${target.name}'s guardian (shield + DEF +6)`);
  },
  lightArmor: (self, allies) => {
    self.status.buffed = 3;
    self.def += 4;
    self.spd += 0.15;
    updateStatusUI(self);
    log(`${self.name} casts Light Armor (DEF +4, SPD +0.15)`);
  },

  // ===== MAGE UPGRADED & NEW SKILLS =====
  infernoPlus: (self, allies, enemies) => {
    alive(enemies).forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 1.6));
      e.status.burn = 4;
      updateStatusUI(e);
      log(`${self.name} uses Inferno+ on ${e.name} (${dmg} + burn)`);
    });
  },
  lightingStrikePlus: (self, allies, enemies) => {
    let targets = alive(enemies).slice(0, 2);
    targets.forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 1.4));
      e.status.paralyzed = 3;
      updateStatusUI(e);
      log(`${self.name} uses Lighting Strike+ on ${e.name} (${dmg} + paralyzed)`);
    });
  },
  airCuttingPlus: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let dmg1 = target.takeDamage(Math.floor(self.atk * 0.7));
    let dmg2 = target.takeDamage(Math.floor(self.atk * 1.2));
    let dmg3 = target.takeDamage(Math.floor(self.atk * 1.8));
    log(`${self.name} uses Air Cutting+ on ${target.name} (${dmg1} + ${dmg2} + ${dmg3})`);
  },
  spellAmplify: (self, allies) => {
    self.status.buffed = 4;
    self.atk += 8;
    updateStatusUI(self);
    log(`${self.name} amplifies spells (ATK +8)`);
  },
  meteorStorm: (self, allies, enemies) => {
    alive(enemies).forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 1.5));
      e.status.burn = 3;
      e.status.stun = 1;
      updateStatusUI(e);
      log(`${self.name} calls Meteor Storm on ${e.name} (${dmg} + burn + stun)`);
    });
  },
  iceShards: (self, allies, enemies) => {
    let targets = alive(enemies).slice(0, 3);
    targets.forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 1.2));
      e.spd = Math.max(0.2, e.spd - 0.1);
      updateStatusUI(e);
      log(`${self.name} shoots Ice Shards at ${e.name} (${dmg}, SPD -0.1)`);
    });
  },
  arcaneBarrier: (self, allies) => {
    self.status.buffed = 3;
    self.def += 5;
    updateStatusUI(self);
    log(`${self.name} creates Arcane Barrier (DEF +5)`);
  },
  chainLightning: (self, allies, enemies) => {
    alive(enemies).forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 1.1));
      if (Math.random() < 0.5) {
        e.status.paralyzed = 2;
        updateStatusUI(e);
      }
      log(`${self.name} Chain Lightning hits ${e.name} (${dmg})`);
    });
  },
  timeWarp: (self, allies) => {
    self.spd += 0.4;
    self.status.buffed = 2;
    updateStatusUI(self);
    log(`${self.name} uses Time Warp (SPD +0.4)`);
  },
  spellShield: (self, allies) => {
    self.status.critical = 4;
    self.def += 3;
    updateStatusUI(self);
    log(`${self.name} creates a Spell Shield (evasion +4, DEF +3)`);
  },

  // ===== ROGUE UPGRADED & NEW SKILLS =====
  quickStrikePlus: (self, allies, enemies) => {
    let targets = alive(enemies).slice(0, 2);
    targets.forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.spd * 12));
      log(`${self.name} uses Quick Strike+ on ${e.name} (${dmg})`);
    });
  },
  dodgePlus: (self, allies) => {
    self.status.critical = 4;
    self.spd += 0.4;
    updateStatusUI(self);
    log(`${self.name} uses Dodge+ (evasion +4, SPD +0.4)`);
  },
  targetedSlicePlus: (self, allies, enemies) => {
    let targets = alive(enemies);
    targets.forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * (e.hp / e.maxHp) * 1.5));
      log(`${self.name} uses Targeted Slice+ on ${e.name} (${dmg})`);
    });
  },
  gamblingSlicePlus: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    if (Math.random() < 0.6) {
      let dmg = target.takeDamage(Math.floor(self.atk * 3.0));
      log(`${self.name} uses Gambling Slice+ on ${target.name} (CRITICAL! ${dmg})`);
    } else {
      log(`${self.name} uses Gambling Slice+ on ${target.name} (FAILED!)`);
    }
  },
  shadowClone: (self, allies, enemies) => {
    self.status.critical = 3;
    let targets = alive(enemies).slice(0, 3);
    targets.forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 0.8));
      log(`${self.name}'s clone hits ${e.name} (${dmg})`);
    });
    log(`${self.name} creates a shadow clone!`);
  },
  deathFromShadow: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let dmg = target.takeDamage(Math.floor(self.atk * 2.2));
    if (Math.random() < 0.3) {
      target.hp = 0;
      log(`${self.name} strikes from shadow! ${target.name} is instantly defeated!`);
    } else {
      log(`${self.name} strikes from shadow on ${target.name} (${dmg})`);
    }
  },
  shadowDance: (self, allies) => {
    self.status.critical = 5;
    self.spd += 0.5;
    self.def += 2;
    updateStatusUI(self);
    log(`${self.name} performs Shadow Dance (evasion +5, SPD +0.5, DEF +2)`);
  },
  poisonBlade: (self, allies, enemies) => {
    let targets = alive(enemies);
    targets.forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 1.0));
      e.status.bleeding = 3;
      updateStatusUI(e);
      log(`${self.name} poisons ${e.name} (${dmg} + bleeding)`);
    });
  },
  nightblade: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let dmg = target.takeDamage(Math.floor(self.atk * 1.8 + self.spd * 5));
    log(`${self.name} uses Nightblade on ${target.name} (${dmg})`);
  },
  shadowBurst: (self, allies, enemies) => {
    alive(enemies).forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.spd * 10));
      log(`${self.name} shadow bursts ${e.name} (${dmg})`);
    });
  },

  // ===== PALADIN UPGRADED & NEW SKILLS =====
  heavySwingPlus: (self, allies, enemies) => {
    let targets = alive(enemies).slice(0, 2);
    targets.forEach((e) => {
      let dmg = e.takeDamage(Math.floor((self.maxHp * 0.2) + self.atk * 1.1));
      log(`${self.name} uses Heavy Swing+ on ${e.name} (${dmg})`);
    });
  },
  tauntPlus: (self, allies, enemies) => {
    alive(enemies).forEach((e) => {
      e.status.taunt = true;
      updateStatusUI(e);
    });
    log(`${self.name} taunts all enemies!`);
  },
  martyrPlus: (self, allies, enemies) => {
    let totalBuff = 0;
    alive(allies).forEach((a) => {
      if (a !== self && a.status.buffed > 0) totalBuff += 15;
    });
    if (totalBuff > 0) {
      self.status.buffed = 3;
      self.atk += 5;
      self.def += 3;
      updateStatusUI(self);
    }
    alive(enemies).forEach((e) => {
      let dmg = e.takeDamage(totalBuff);
      log(`${self.name} becomes Martyr+! ${e.name} takes ${dmg}`);
    });
  },
  parryPlus: (self, allies) => {
    self.status.shield = true;
    self.def += 5;
    self.status.buffed = 3;
    updateStatusUI(self);
    log(`${self.name} uses Parry+ (shield + DEF +5)`);
  },
  holyAura: (self, allies, enemies) => {
    let targets = alive(allies);
    targets.forEach((a) => {
      a.status.buffed = 4;
      a.def += 3;
      updateStatusUI(a);
    });
    alive(enemies).forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 0.7));
      log(`${self.name}'s Holy Aura damages ${e.name} (${dmg})`);
    });
  },
  consecration: (self, allies, enemies) => {
    alive(enemies).forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 1.2));
      e.status.stun = 1;
      updateStatusUI(e);
      log(`${self.name} consecrates! ${e.name} takes ${dmg} + stun`);
    });
  },
  shieldReflect: (self, allies, enemies) => {
    self.status.shield = true;
    self.def += 6;
    alive(enemies).forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.maxHp * 0.1));
      log(`${self.name}'s shield reflects to ${e.name} (${dmg})`);
    });
    updateStatusUI(self);
  },
  divineStrike: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let dmg = target.takeDamage(Math.floor(self.atk * 1.7));
    target.status.stun = 2;
    updateStatusUI(target);
    log(`${self.name} uses Divine Strike on ${target.name} (${dmg} + stun)`);
  },
  sanctity: (self, allies) => {
    self.status.buffed = 5;
    self.atk += 4;
    self.def += 4;
    self.spd += 0.1;
    updateStatusUI(self);
    log(`${self.name} reaches Sanctity (ATK +4, DEF +4, SPD +0.1)`);
  },
  retribution: (self, allies, enemies) => {
    alive(enemies).forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 1.3));
      log(`${self.name} brings Retribution to ${e.name} (${dmg})`);
    });
  },

  // ===== ARCHER UPGRADED & NEW SKILLS =====
  preciseShotPlus: (self, allies, enemies) => {
    let targets = alive(enemies).slice(0, 2);
    targets.forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 1.7));
      log(`${self.name} uses Precise Shot+ on ${e.name} (${dmg})`);
    });
  },
  heavyShotPlus: (self, allies, enemies) => {
    let targets = alive(enemies).slice(0, 2);
    targets.forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk + e.def * 1.2));
      log(`${self.name} uses Heavy Shot+ on ${e.name} (${dmg})`);
    });
  },
  fastShotPlus: (self, allies, enemies) => {
    let targets = alive(enemies);
    targets.forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * (e.maxHp / 100)));
      log(`${self.name} uses Fast Shot+ on ${e.name} (${dmg})`);
    });
  },
  arrowsRainPlus: (self, allies, enemies) => {
    let targets = alive(enemies);
    targets.forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 1.3 + e.spd * 2));
      log(`${self.name} uses Arrows Rain+ on ${e.name} (${dmg})`);
    });
  },
  multiShot: (self, allies, enemies) => {
    let targets = alive(enemies).slice(0, 4);
    targets.forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 1.1));
      log(`${self.name} fires Multi-Shot at ${e.name} (${dmg})`);
    });
  },
  piercingShot: (self, allies, enemies) => {
    let targets = alive(enemies);
    targets.forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 1.5));
      e.def = Math.max(0, e.def - 2);
      updateStatusUI(e);
      log(`${self.name} pierces ${e.name} (${dmg}, DEF -2)`);
    });
  },
  evasion: (self, allies) => {
    self.status.critical = 4;
    self.spd += 0.3;
    updateStatusUI(self);
    log(`${self.name} takes an evasive stance (evasion +4, SPD +0.3)`);
  },
  explosiveArrow: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let dmg = target.takeDamage(Math.floor(self.atk * 1.6));
    alive(enemies).forEach((e) => {
      if (e !== target) {
        let splash = e.takeDamage(Math.floor(dmg * 0.4));
        log(`${self.name} explosive arrow hits ${e.name} (splash ${splash})`);
      }
    });
    log(`${self.name} fires Explosive Arrow at ${target.name} (${dmg})`);
  },
  focusedFire: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let dmg = target.takeDamage(Math.floor(self.atk * 2.0));
    log(`${self.name} uses Focused Fire on ${target.name} (${dmg})`);
  },
  archersMark: (self, allies, enemies) => {
    let targets = alive(enemies).slice(0, 2);
    targets.forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 1.3));
      e.status.stun = 1;
      updateStatusUI(e);
      log(`${self.name} marks ${e.name} (${dmg} + stun)`);
    });
  },
  ricochet: (self, allies, enemies) => {
    let targets = alive(enemies);
    let dmg = 0;
    for (let i = 0; i < 3; i++) {
      let target = random(targets);
      if (target) {
        dmg += target.takeDamage(Math.floor(self.atk * 0.8));
      }
    }
    log(`${self.name} uses Ricochet (${dmg} total damage)`);
  },
};