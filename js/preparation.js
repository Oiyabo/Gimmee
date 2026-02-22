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
    this.skills = skills;
    this.learnedSkills = [];
    this.cooldown = 0;
    this.status = { 
      burn: 0, 
      shield: false, 
      bleeding: 0, 
      stun: 0, 
      paralyzed: 0, 
      taunt: false, 
      critical: 0, 
      buffed: 0,
      buffStats: { atk: 0, def: 0, spd: 0 }
    };
    this.equipment = [];
    this.statsBonus = { atk: 0, def: 0, spd: 0, hp: 0 };
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
  isAlive() {
    console.log(this.name, this.hp);
    return this.hp > 0;
  }
  takeDamage(amount) {
    if (this.status.shield) {
      this.status.shield = false;
      updateStatusUI(this);
      return 0;
    }
    let dmg = Math.max(0, amount - this.def);
    this.hp -= dmg;
    if (this.hp < 0) this.hp = 0;
    updateHPUI(this);
    updateDeadUI(this);
    return dmg;
  }
  heal(amount) {
    this.hp += amount;
    if (this.hp > this.maxHp) this.hp = this.maxHp;
    updateHPUI(this);
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
  
  // Scale stats based on set number (difficulty increases) and difficulty setting
  let baseScaling = 1 + setNumber * 0.1;
  let finalScaling = baseScaling * (typeof difficultyScaling !== 'undefined' ? difficultyScaling : 1);
  
  // Convert old template format to new stats format
  const stats = {
    hp: Math.floor(template.hp * finalScaling),
    sta: Math.floor(template.hp * 0.8 * finalScaling),      // Stamina ~80% of HP
    mana: Math.floor(template.hp * 0.4 * finalScaling),     // Mana ~40% of HP
    patk: Math.floor(template.atk * finalScaling * 0.7),    // Physical ATK ~70%
    matk: Math.floor(template.atk * finalScaling * 0.3),    // Magical ATK ~30%
    tatt: Math.floor(template.atk * finalScaling * 0.1),    // True ATK ~10%
    pdef: Math.floor(template.def * finalScaling),          // Physical DEF equal
    mdef: Math.floor(template.def * finalScaling * 0.6),    // Magical DEF ~60%
    pspd: template.spd,                                // Physical speed
    mspd: template.spd * (0.7 + (setNumber * 0.02)),   // Magical speed lower
    ccrit: 0.1,                                        // Critical chance 10%
    dcrit: 1.3                                         // Critical damage 30%
  };
  
  let monster = new Character(
    name,
    stats,
    "B",
    [...template.skills]
  );
  
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
  let finalBossScale = bossScale * (typeof difficultyScaling !== 'undefined' ? difficultyScaling : 1);
  
  let bossTemplates = BossTemplates[BaseAreas[area % 5]];
  let templates = Object.entries(bossTemplates);
  let [name, template] = random(templates);
  
  // Convert old template format to new stats format
  const stats = {
    hp: Math.floor(template.hp * finalBossScale),
    sta: Math.floor(template.hp * 0.9 * finalBossScale),      // Stamina ~90% of HP (bosses hardy)
    mana: Math.floor(template.hp * 0.5 * finalBossScale),     // Mana ~50% of HP
    patk: Math.floor(template.atk * finalBossScale * 0.7),    // Physical ATK ~70%
    matk: Math.floor(template.atk * finalBossScale * 0.3),    // Magical ATK ~30%
    tatt: Math.floor(template.atk * finalBossScale * 0.15),   // True ATK ~15% (bosses stronger)
    pdef: Math.floor(template.def * finalBossScale),          // Physical DEF equal
    mdef: Math.floor(template.def * finalBossScale * 0.65),   // Magical DEF ~65%
    pspd: template.spd,                                  // Physical speed maintained
    mspd: template.spd * 0.75,                           // Magical speed bit lower
    ccrit: 0.15,                                         // Boss critical chance 15%
    dcrit: 1.6                                           // Boss critical damage 60%
  };
  
  let boss = new Character(
    `${name} (BOSS)`,
    stats,
    "B",
    [...template.skills]
  );
  
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

