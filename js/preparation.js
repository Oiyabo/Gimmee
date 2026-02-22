class Character {
  constructor(name, stats, team, skills) {
    this.name = name;
    
    // Health
    this.maxHp = stats.hp;
    this.hp = stats.hp;
    
    // Stamina (for physical skills)
    this.maxSta = stats.sta;
    this.sta = stats.sta;
    
    // Mana (for magical skills)
    this.maxMana = stats.mana;
    this.mana = stats.mana;
    
    // Physical Attack & Original
    this.patk = stats.patk;
    this.origPatk = stats.patk;
    
    // Magical Attack & Original
    this.matk = stats.matk;
    this.origMatk = stats.matk;
    
    // True Attack (ignores defenses) & Original
    this.tatt = stats.tatt || 0;
    this.origTatt = stats.tatt || 0;
    
    // Physical Defense & Original
    this.pdef = stats.pdef;
    this.origPdef = stats.pdef;
    this.def = stats.pdef; // Generic defense for takeDamage method
    
    // Magical Defense & Original
    this.mdef = stats.mdef;
    this.origMdef = stats.mdef;
    
    // Physical Speed (scaling for physical skill cooldown) & Original
    this.pspd = stats.pspd;
    this.origPspd = stats.pspd;
    
    // Magical Speed (scaling for magical skill cooldown) & Original
    this.mspd = stats.mspd;
    this.origMspd = stats.mspd;
    
    // Critical Chance (0-1 or 0-100 depending on use)
    this.ccrit = stats.ccrit || 0.1;
    
    // Critical Damage (multiplier, e.g., 1.5 = 50% more damage)
    this.dcrit = stats.dcrit || 1.5;
    
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
    this.gridElement = null;
    this.gridPosition = null; // { row: 0-7, col: 0-7 }
    this.exp = 0; // Experience points for buying stats
    this.selectedSkills = skills.slice(0, 4); // Max 4 active skills (new system)
    
    // Equipment & Skill Slot System (New)
    this.maxSkillSlots = 4;  // Maximum active skills
    this.maxEquipSlots = 7;  // Maximum equipped items
    
    // Equipment enhancement tracking
    this.equipmentLevels = {};  // { equipmentName: enhanceLevel }
    if (this.equipment.length > 0) {
      this.equipment.forEach(eq => {
        this.equipmentLevels[eq.name] = 1; // Start at level 1
      });
    }
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
    if (this.status.dodge.active && Math.random() < CONFIG.ABILITIES.DODGE.dodgeChance) {
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
  
  // Get difficulty configuration
  const diffConfig = getDifficultyConfig(currentDifficulty);
  
  // Calculate base scaling from set progression
  let baseScaling = 1 + setNumber * MONSTER_CONFIG.baseScalingPerSet;
  
  // Calculate area scaling growth
  let areaGrowth = 1 + (currentArea * MONSTER_CONFIG.baseAreaGrowth);
  
  // Apply difficulty scaling
  let difficultyScaling = diffConfig.monsterScaling;
  
  // Combined final scaling
  let finalScaling = baseScaling * areaGrowth * difficultyScaling;
  
  // Add randomization (±20% variation)
  let variation = 1 + (Math.random() - 0.5) * 2 * MONSTER_CONFIG.statVariation;
  finalScaling *= variation;
  
  // Convert old template format to new stats format with randomization
  const stats = {
    hp: Math.floor(template.hp * finalScaling),
    sta: Math.floor(template.hp * 0.8 * finalScaling),
    mana: Math.floor(template.hp * 0.4 * finalScaling),
    patk: Math.floor(template.atk * finalScaling * 0.7),
    matk: Math.floor(template.atk * finalScaling * 0.3),
    tatt: Math.floor(template.atk * finalScaling * 0.1),
    pdef: Math.floor(template.def * finalScaling),
    mdef: Math.floor(template.def * finalScaling * 0.6),
    pspd: template.spd,
    mspd: template.spd * (0.7 + (setNumber * 0.02)),
    ccrit: 0.1,
    dcrit: 1.3
  };
  
  let monster = new Character(
    name,
    stats,
    "B",
    [...template.skills]
  );
  
  // Randomize skills with some variation
  if (template.skills && template.skills.length > 0) {
    if (Math.random() < MONSTER_CONFIG.skillRandomChance && monster.selectedSkills.length < MONSTER_CONFIG.maxSkillsPerMonster) {
      // Get all available skills and pick a random one
      let allSkills = Object.values(Skills);
      let randomSkill = random(allSkills);
      if (!monster.selectedSkills.find(s => s.name === randomSkill.name)) {
        monster.selectedSkills.push(randomSkill);
      }
    }
  }
  
  // Calculate experience reward based on final monster strength
  monster.expReward = calculateMonsterExperience(monster, currentDifficulty);
  
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
  
  // Get difficulty configuration
  const diffConfig = getDifficultyConfig(currentDifficulty);
  
  // Calculate boss scaling with difficulty
  let bossBaseScale = MONSTER_CONFIG.bossBaseMultiplier;
  let areaBonus = (area * MONSTER_CONFIG.bossAreaScaling);
  let roundBonus = (round * MONSTER_CONFIG.bossSetScaling);
  let finalBossScale = (bossBaseScale + areaBonus + roundBonus) * diffConfig.monsterScaling;
  
  // Add randomization for variety
  let variation = 1 + (Math.random() - 0.5) * 2 * MONSTER_CONFIG.statVariation;
  finalBossScale *= variation;
  
  let bossTemplates = BossTemplates[BaseAreas[area % 5]];
  let templates = Object.entries(bossTemplates);
  let [name, template] = random(templates);
  
  // Convert old template format to new stats format
  const stats = {
    hp: Math.floor(template.hp * finalBossScale),
    sta: Math.floor(template.hp * 0.9 * finalBossScale),
    mana: Math.floor(template.hp * 0.5 * finalBossScale),
    patk: Math.floor(template.atk * finalBossScale * 0.7),
    matk: Math.floor(template.atk * finalBossScale * 0.3),
    tatt: Math.floor(template.atk * finalBossScale * 0.15),
    pdef: Math.floor(template.def * finalBossScale),
    mdef: Math.floor(template.def * finalBossScale * 0.65),
    pspd: template.spd,
    mspd: template.spd * 0.75,
    ccrit: 0.15,
    dcrit: 1.6
  };
  
  let boss = new Character(
    `${name} (BOSS)`,
    stats,
    "B",
    [...template.skills]
  );
  
  // Calculate boss experience reward (higher since it's harder)
  boss.expReward = Math.floor(calculateMonsterExperience(boss, currentDifficulty) * 2);
  
  return boss;
}

// ===== GRID SYSTEM =====
const GRID_SIZE = 8;
const GRID_TOTAL = GRID_SIZE * GRID_SIZE; // 64
let gridOccupancy = {}; // { "row-col": characterObject }
let heroStartPositions = {}; // Simpan posisi awal heroes saat battle dimulai

// Compass directions for monster spawning
const SPAWN_DIRECTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
let currentSpawnDirection = "E"; // Default spawn direction

// Get random spawn direction
function randomSpawnDirection() {
  return SPAWN_DIRECTIONS[Math.floor(Math.random() * SPAWN_DIRECTIONS.length)];
}

// Get spawn zone based on direction
function getSpawnZone(direction) {
  const zones = {
    N: { rowRange: [0, 2], colRange: [3, 4] },      // Center top
    NE: { rowRange: [0, 2], colRange: [5, 7] },     // Top right
    E: { rowRange: [2, 5], colRange: [5, 7] },      // Right center
    SE: { rowRange: [5, 7], colRange: [5, 7] },     // Bottom right
    S: { rowRange: [5, 7], colRange: [3, 4] },      // Center bottom
    SW: { rowRange: [5, 7], colRange: [0, 2] },     // Bottom left
    W: { rowRange: [2, 5], colRange: [0, 2] },      // Left center
    NW: { rowRange: [0, 2], colRange: [0, 2] }      // Top left
  };
  return zones[direction] || zones.E;
}

// Generate random position within spawn zone
function getRandomSpawnPosition(direction) {
  const zone = getSpawnZone(direction);
  const row = Math.floor(Math.random() * (zone.rowRange[1] - zone.rowRange[0] + 1)) + zone.rowRange[0];
  const col = Math.floor(Math.random() * (zone.colRange[1] - zone.colRange[0] + 1)) + zone.colRange[0];
  return { row, col };
}

// Calculate distance between two grid positions
function calculateDistance(pos1, pos2) {
  const rowDiff = Math.abs(pos1.row - pos2.row);
  const colDiff = Math.abs(pos1.col - pos2.col);
  // Euclidean distance
  return Math.sqrt(rowDiff * rowDiff + colDiff * colDiff);
}

// Get nearest character(s) from targets
function getNearestTargets(attacker, targets) {
  if (!attacker.gridPosition || targets.length === 0) return targets;
  
  const targetsWithDistance = targets.map(target => ({
    character: target,
    distance: calculateDistance(attacker.gridPosition, target.gridPosition)
  }));
  
  // Sort by distance (nearest first)
  targetsWithDistance.sort((a, b) => a.distance - b.distance);
  
  // Return only the nearest target(s), with higher probability for closest
  const nearest = targetsWithDistance[0];
  if (nearest) {
    return [nearest.character];
  }
  return targets;
}

function initializeGrid() {
  gridOccupancy = {};
  heroStartPositions = {};
  const battleMapGrid = document.getElementById("battle-map-grid");
  battleMapGrid.innerHTML = "";
  
  // Create 64 placement blocks
  for (let i = 0; i < GRID_TOTAL; i++) {
    const row = Math.floor(i / GRID_SIZE);
    const col = i % GRID_SIZE;
    const placementBlock = document.createElement("div");
    placementBlock.className = "placement-block";
    placementBlock.id = `grid-${row}-${col}`;
    placementBlock.dataset.row = row;
    placementBlock.dataset.col = col;
    
    // Add drop zone functionality
    placementBlock.addEventListener("dragover", (e) => handleDragOver(e));
    placementBlock.addEventListener("drop", (e) => handleDrop(e, row, col));
    placementBlock.addEventListener("dragleave", (e) => handleDragLeave(e));
    
    battleMapGrid.appendChild(placementBlock);
  }
}

function getGridKey(row, col) {
  return `${row}-${col}`;
}

function placeCharacterOnGrid(character, row, col) {
  const key = getGridKey(row, col);
  
  // Remove from old position if exists
  if (character.gridPosition) {
    const oldKey = getGridKey(character.gridPosition.row, character.gridPosition.col);
    delete gridOccupancy[oldKey];
    const oldBlock = document.getElementById(`grid-${character.gridPosition.row}-${character.gridPosition.col}`);
    if (oldBlock) {
      oldBlock.innerHTML = "";
      oldBlock.classList.remove("occupied");
    }
  }
  
  // Place on new position
  character.gridPosition = { row, col };
  gridOccupancy[key] = character;
  
  const placementBlock = document.getElementById(`grid-${row}-${col}`);
  if (placementBlock) {
    placementBlock.innerHTML = "";
    placementBlock.classList.add("occupied");
    
    const characterDiv = document.createElement("div");
    characterDiv.className = `character-in-grid ${character.team === "A" ? "hero" : "monster"}`;
    characterDiv.draggable = character.team === "A"; // Only heroes can be dragged
    characterDiv.id = `grid-char-${character.name.replace(/\s/g, "-")}`;
    
    if (character.team === "A") {
      characterDiv.draggable = true;
      characterDiv.addEventListener("dragstart", handleDragStart);
      characterDiv.addEventListener("dragend", handleDragEnd);
    }
    
    // Character name
    const nameDiv = document.createElement("div");
    nameDiv.className = "character-block-name";
    nameDiv.textContent = character.name.substring(0, 8);
    characterDiv.appendChild(nameDiv);
    
    // HP indicator
    const hpIndicator = document.createElement("div");
    hpIndicator.className = "character-hp-indicator";
    
    const hpFill = document.createElement("div");
    hpFill.className = "character-hp-fill";
    updateHPFillColor(hpFill, character);
    hpFill.style.width = (character.hp / character.maxHp) * 100 + "%";
    
    hpIndicator.appendChild(hpFill);
    characterDiv.appendChild(hpIndicator);
    
    character.gridElement = characterDiv;
    character.gridHPFill = hpFill;
    
    placementBlock.appendChild(characterDiv);
  }
}

function removeCharacterFromGrid(character) {
  if (character.gridPosition) {
    const key = getGridKey(character.gridPosition.row, character.gridPosition.col);
    delete gridOccupancy[key];
    
    const placementBlock = document.getElementById(`grid-${character.gridPosition.row}-${character.gridPosition.col}`);
    if (placementBlock) {
      placementBlock.innerHTML = "";
      placementBlock.classList.remove("occupied");
    }
    
    character.gridPosition = null;
    character.gridElement = null;
  }
}

function updateHPFillColor(hpFill, character) {
  const hpPercent = character.hp / character.maxHp;
  hpFill.classList.remove("low", "critical", "dead");
  
  if (character.hp <= 0) {
    hpFill.classList.add("dead");
  } else if (hpPercent <= 0.25) {
    hpFill.classList.add("critical");
  } else if (hpPercent <= 0.5) {
    hpFill.classList.add("low");
  }
}

function updateGridCharacterHP(character) {
  if (character.gridHPFill) {
    const newWidth = (character.hp / character.maxHp) * 100;
    character.gridHPFill.style.width = newWidth + "%";
    updateHPFillColor(character.gridHPFill, character);
  }
}

// Drag and Drop Handlers
let draggedCharacter = null;

function handleDragStart(e) {
  const characterElement = e.target.closest(".character-in-grid");
  if (characterElement) {
    draggedCharacter = Object.values(gridOccupancy).find(c => c.gridElement === characterElement);
    if (draggedCharacter) {
      e.dataTransfer.effectAllowed = "move";
      characterElement.classList.add("dragging");
    }
  }
}

function handleDragEnd(e) {
  const characterElement = e.target.closest(".character-in-grid");
  if (characterElement) {
    characterElement.classList.remove("dragging");
  }
  draggedCharacter = null;
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  e.target.closest(".placement-block")?.classList.add("highlight");
}

function handleDragLeave(e) {
  if (e.target.classList.contains("placement-block")) {
    e.target.classList.remove("highlight");
  }
}

function handleDrop(e, row, col) {
  e.preventDefault();
  
  const placementBlock = e.target.closest(".placement-block");
  if (placementBlock) {
    placementBlock.classList.remove("highlight");
  }
  
  if (!draggedCharacter) return;
  
  const key = getGridKey(row, col);
  
  // Check if position is occupied
  if (gridOccupancy[key] && gridOccupancy[key] !== draggedCharacter) {
    log(`Position sudah ditempati oleh ${gridOccupancy[key].name}!`);
    return;
  }
  
  placeCharacterOnGrid(draggedCharacter, row, col);
  log(`${draggedCharacter.name} dipindahkan ke grid [${row},${col}]`);
}

