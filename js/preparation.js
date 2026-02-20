class Character {
  constructor(name, stats, team, skills = []) {
    this.name = name;
    this.team = team;
    
    // ===== CORE STATS =====
    this.maxHp = stats.maxHp || 100;
    this.hp = this.maxHp;
    this.maxSta = stats.maxSta || 50;
    this.sta = this.maxSta;
    this.maxMana = stats.maxMana || 50;
    this.mana = this.maxMana;
    
    // ===== COMBAT STATS =====
    this.patk = stats.patk || 10; // Physical Attack
    this.matk = stats.matk || 10; // Magical Attack
    this.pdef = stats.pdef || 5;  // Physical Defense
    this.mdef = stats.mdef || 5;  // Magical Defense
    this.tatt = stats.tatt || 0;  // True Attack (ignores defense)
    
    // ===== SPEED STATS =====
    this.pspd = stats.pspd || 1.0; // Physical Speed (cooldown reduction)
    this.mspd = stats.mspd || 1.0; // Mind Speed (cooldown reduction)
    
    // ===== ACTION COOLDOWN =====
    this.cooldown = 0; // Time remaining before next action
    
    // ===== CRITICAL STATS =====
    this.ccrit = stats.ccrit || 0.05; // Critical Chance
    this.dcrit = stats.dcrit || 1.5;  // Critical Damage multiplier
    
    // ===== SKILL & EQUIPMENT SYSTEM =====
    this.skills = skills; // All available skills
    this.activeSkills = []; // Active skill slots (max 4)
    this.equipment = []; // Equipped items (max 7)
    this.inventory = []; // Equipment inventory
    
    // ===== STAT BONUSES =====
    this.statBonus = {
      maxHp: 0, maxSta: 0, maxMana: 0,
      patk: 0, matk: 0, pdef: 0, mdef: 0,
      tatt: 0, pspd: 0, mspd: 0, ccrit: 0, dcrit: 0
    };
    
    // ===== EXPERIENCE & STAT PURCHASES =====
    this.experience = 0;
    this.statsLevel = {
      maxHp: 0, maxSta: 0, maxMana: 0,
      patk: 0, matk: 0, pdef: 0, mdef: 0
    };
    
    // ===== STATUS EFFECTS =====
    this.status = {
      // Negative Effects
      burn: 0,
      bleeding: 0,
      stun: 0,
      paralyzed: 0,
      vampired: 0,
      confused: 0,
      // Positive Effects
      shield: { active: false, duration: 0 },
      dodge: { active: false, duration: 0, countRemaining: 0 },
      taunt: { active: false, duration: 0 },
      regeneration: { active: false, duration: 0, hpPerSecond: 0 },
      buffed: { active: false, duration: 0, stats: {} }
    };
    
    // ===== POSITIONING =====
    this.gridX = 0;
    this.gridY = 0;
    this.isDead = false;
    
    // ===== UI REFERENCES =====
    this.element = null;
    this.hpFill = null;
    this.hpStroke = null;
  }

  // ===== CORE METHODS =====
  isAlive() {
    return this.hp > 0 && !this.isDead;
  }

  getEffectiveDefense(damageType = "physical") {
    if (damageType === "physical") {
      return Math.max(0, this.pdef + this.statBonus.pdef);
    } else if (damageType === "magical") {
      return Math.max(0, this.mdef + this.statBonus.mdef);
    }
    return 0;
  }

  getEffectiveAttack(attackType = "physical") {
    if (attackType === "physical") {
      return this.patk + this.statBonus.patk;
    } else if (attackType === "magical") {
      return this.matk + this.statBonus.matk;
    }
    return 0;
  }

  takeDamage(amount, damageType = "physical") {
    // Check for dodge
    if (this.status.dodge && this.status.dodge.active && Math.random() < CONFIG.ABILITIES.DODGE.dodgeChance) {
      this.status.dodge.countRemaining--;
      if (this.status.dodge.countRemaining <= 0) {
        this.status.dodge.active = false;
      }
      return 0;
    }

    // Calculate damage based on defense
    let defense = this.getEffectiveDefense(damageType);
    let dmg = Math.max(0, amount - defense + (this.tatt + this.statBonus.tatt));
    
    this.hp -= dmg;
    if (this.hp < 0) this.hp = 0;
    
    updateHPUI(this);
    return dmg;
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp + this.statBonus.maxHp, this.hp + amount);
    updateHPUI(this);
  }

  consumeStamina(amount) {
    this.sta = Math.max(0, this.sta - amount);
    return this.sta >= amount;
  }

  consumeMana(amount) {
    this.mana = Math.max(0, this.mana - amount);
    return this.mana >= amount;
  }

  restoreStamina(amount) {
    this.sta = Math.min(this.maxSta + this.statBonus.maxSta, this.sta + amount);
  }

  restoreMana(amount) {
    this.mana = Math.min(this.maxMana + this.statBonus.maxMana, this.mana + amount);
  }

  getGridDistance(other) {
    return Math.max(
      Math.abs(this.gridX - other.gridX),
      Math.abs(this.gridY - other.gridY)
    );
  }

  setGridPosition(x, y) {
    this.gridX = x;
    this.gridY = y;
  }

  equipItem(equipment) {
    if (this.equipment.length < CONFIG.EQUIPMENT.EQUIP_SLOTS) {
      this.equipment.push(equipment);
      this.applyEquipmentBonus(equipment);
      return true;
    }
    return false;
  }

  unequipItem(index) {
    if (index >= 0 && index < this.equipment.length) {
      let eq = this.equipment[index];
      this.removeEquipmentBonus(eq);
      this.equipment.splice(index, 1);
      return true;
    }
    return false;
  }

  applyEquipmentBonus(equipment) {
    if (equipment.stats) {
      for (let stat in equipment.stats) {
        if (this.statBonus[stat] !== undefined) {
          this.statBonus[stat] += equipment.stats[stat];
        }
      }
    }
  }

  removeEquipmentBonus(equipment) {
    if (equipment.stats) {
      for (let stat in equipment.stats) {
        if (this.statBonus[stat] !== undefined) {
          this.statBonus[stat] -= equipment.stats[stat];
        }
      }
    }
  }

  setActiveSkills(skillArray) {
    this.activeSkills = skillArray.slice(0, CONFIG.SKILLS.ACTIVE_SLOTS);
  }

  purchaseStat(statName) {
    let baseCost = CONFIG.STATS_PURCHASE.BASE_COST[statName];
    let currentLevel = this.statsLevel[statName] || 0;
    let cost = Math.ceil(baseCost * Math.pow(CONFIG.STATS_PURCHASE.COST_INCREASE, currentLevel));
    
    if (this.experience >= cost) {
      this.experience -= cost;
      this.statsLevel[statName]++;
      
      let increment = CONFIG.STATS_PURCHASE.STAT_INCREMENT[statName];
      switch(statName) {
        case "maxHp":
          this.maxHp += increment;
          this.hp += increment;
          break;
        case "maxSta":
          this.maxSta += increment;
          this.sta += increment;
          break;
        case "maxMana":
          this.maxMana += increment;
          this.mana += increment;
          break;
        case "patk":
          this.patk += increment;
          break;
        case "matk":
          this.matk += increment;
          break;
        case "pdef":
          this.pdef += increment;
          break;
        case "mdef":
          this.mdef += increment;
          break;
      }
      return true;
    }
    return false;
  }

  addExperience(amount) {
    this.experience += amount;
  }

  getStatCost(statName) {
    let baseCost = CONFIG.STATS_PURCHASE.BASE_COST[statName];
    let currentLevel = this.statsLevel[statName] || 0;
    return Math.ceil(baseCost * Math.pow(CONFIG.STATS_PURCHASE.COST_INCREASE, currentLevel));
  }

  getCurrentStats() {
    return {
      hp: this.hp,
      maxHp: this.maxHp + this.statBonus.maxHp,
      sta: this.sta,
      maxSta: this.maxSta + this.statBonus.maxSta,
      mana: this.mana,
      maxMana: this.maxMana + this.statBonus.maxMana,
      patk: this.patk + this.statBonus.patk,
      matk: this.matk + this.statBonus.matk,
      pdef: this.pdef + this.statBonus.pdef,
      mdef: this.mdef + this.statBonus.mdef,
      tatt: this.tatt + this.statBonus.tatt,
      pspd: this.pspd + this.statBonus.pspd,
      mspd: this.mspd + this.statBonus.mspd,
      ccrit: this.ccrit + this.statBonus.ccrit,
      dcrit: this.dcrit + this.statBonus.dcrit
    };
  }
}

const battleLog = document.getElementById("battle-log");
const heroesContainer = document.getElementById("heroes");
const monstersContainer = document.getElementById("monsters");

let currentArea = 0;
let currentRound = 0;
let currentSet = 0;
let isRoundPaused = false;
let isAreaPaused = false;
let petualanganAktif = false;
let monsters = [];
let isPaused = false;

function log(t) {
  if (!battleLog) return; // Safety check in case called before DOM ready
  let d = document.createElement("div");
  d.textContent = t;
  battleLog.appendChild(d);
  battleLog.scrollTop = battleLog.scrollHeight;
}

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function alive(team) {
  return team.filter((c) => c.isAlive());
}

function generateRandomMonster(setNumber, monsterTemplates) {
  let templates = Object.entries(monsterTemplates);
  let [name, template] = random(templates);
  
  // Scale stats berdasarkan set number (difficulty increases)
  let scaling = 1 + setNumber * 0.1;
  
  let monster = new Character(
    name,
    {
      maxHp: Math.floor(template.hp * scaling),
      maxSta: 50,
      maxMana: 30,
      patk: Math.floor(template.atk * scaling),
      matk: 10,
      pdef: Math.floor(template.def * scaling),
      mdef: 3,
      tatt: 0,
      pspd: template.spd * (1 + setNumber * 0.03),
      mspd: 1.0,
      ccrit: 0.1,
      dcrit: 1.5
    },
    "B",
    [...(template.skills || [])]
  );
  
  // Monsters don't need origAtk/origDef/origSpd (only used by old code)
  
  return monster;
}

function generateMonsterTeam(setNumber, monsterTemplates) {
  let jumlahMonster = 2 + Math.floor(setNumber / 2); // 2, 2, 3, 3, 4, dst
  let team = [];
  for (let i = 0; i < jumlahMonster; i++) {
    team.push(generateRandomMonster(setNumber, monsterTemplates));
  }
  return team;
}

function generateBoss(round, area) {
  // Setiap area dan round memiliki boss yang berbeda
  let areaName = getAreaName(area);
  let bossScale = 1.5 + (area * 0.3) + (round * 0.2);
  
  let bossArea = BaseAreas[area % 5] || "Forest";
  let bossMonsters = getAreaMonstersTemplate(bossArea);
  let templates = Object.entries(bossMonsters);
  let [name, template] = random(templates);
  
  let boss = new Character(
    `${name} (BOSS)`,
    {
      maxHp: Math.floor(template.hp * bossScale),
      maxSta: 80,
      maxMana: 50,
      patk: Math.floor(template.atk * bossScale),
      matk: 15,
      pdef: Math.floor(template.def * bossScale),
      mdef: 8,
      tatt: 5,
      pspd: (template.spd || 1.0) * 0.9,
      mspd: 1.0,
      ccrit: 0.15,
      dcrit: 1.8
    },
    "B",
    [...(template.skills || [])]
  );
  
  // Boss stats are set in constructor, no need for separate assignments
  
  return boss;
}
