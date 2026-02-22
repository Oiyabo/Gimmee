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

  // ===== UPGRADED & NEW SKILLS =====
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

  preciseShotPlus: (self, allies, enemies) => {
    let targets = alive(enemies).slice(0, 2);
    targets.forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 1.7));
      log(`${self.name} uses Precise Shot+ on ${e.name} (${dmg})`);
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
  }
};

// ============================================
// === HELPER FUNCTIONS ===
// ============================================

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)] || null;
}

// ===== ALIVE HELPER =====
function alive(characters) {
  return characters.filter((c) => c.isAlive && c.isAlive());
}

// ===== GET NEAREST TARGETS =====
function getNearestTargets(self, targets) {
  // Sort targets by distance (if they have gridPosition)
  if (targets.length === 0) return [];
  
  // If no grid positions, just return in order
  if (!self.gridPosition) return targets;
  
  return targets.sort((a, b) => {
    if (!a.gridPosition || !b.gridPosition) return 0;
    const aDist = Math.abs(self.gridPosition.row - a.gridPosition.row) + 
                  Math.abs(self.gridPosition.col - a.gridPosition.col);
    const bDist = Math.abs(self.gridPosition.row - b.gridPosition.row) + 
                  Math.abs(self.gridPosition.col - b.gridPosition.col);
    return aDist - bDist;
  });
}