class Character {
  constructor(name, hp, atk, def, spd, team, skills) {
    this.name = name;
    this.maxHp = hp;
    this.hp = hp;
    this.atk = atk;
    this.origAtk = atk;
    this.def = def;
    this.origDef = def;
    this.spd = spd;
    this.origSpd = spd;
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
  
  // Scale stats berdasarkan set number (difficulty increases)
  let scaling = 1 + setNumber * 0.1;
  
  let monster = new Character(
    name,
    Math.floor(template.hp * scaling),
    Math.floor(template.atk * scaling),
    Math.floor(template.def * scaling),
    template.spd * (1 + setNumber * 0.03),
    "B",
    [...template.skills]
  );
  
  // Simpan original stats untuk reset
  monster.maxHp = monster.hp;
  monster.origAtk = monster.atk;
  monster.origDef = monster.def;
  monster.origSpd = monster.spd;
  
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
  
  let bossTemplates = BossTemplates[BaseAreas[area % 5]];
  let templates = Object.entries(bossTemplates);
  let [name, template] = random(templates);
  
  let boss = new Character(
    `${name} (BOSS)`,
    Math.floor(template.hp * bossScale),
    Math.floor(template.atk * bossScale),
    Math.floor(template.def * bossScale),
    template.spd,
    "B",
    [...template.skills]
  );
  
  boss.maxHp = boss.hp;
  boss.origAtk = boss.atk;
  boss.origDef = boss.def;
  boss.origSpd = boss.spd;
  
  return boss;
}

// ===== GRID SYSTEM =====
const GRID_SIZE = 8;
const GRID_TOTAL = GRID_SIZE * GRID_SIZE; // 64
let gridOccupancy = {}; // { "row-col": characterObject }
let heroStartPositions = {}; // Simpan posisi awal heroes saat battle dimulai

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

