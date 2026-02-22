# 🚀 CRITICAL ACTION GUIDE - NEXT STEPS

## **IMMEDIATE TASKS** (Do These First!)

### 1. Complete `js/equipment.js` - CRITICAL

Replace the old equipment system with the new one:

```javascript
// Simplified Equipment Template
const Equipment = {
  // Common Weapons
  IronSword: {
    name: "Iron Sword",
    type: "weapon",
    rarity: "common",
    stats: { patk: 5 },
    ability: null,
    description: "A basic iron sword"
  },
  SteelSword: {
    name: "Steel Sword",
    type: "weapon",
    rarity: "uncommon",
    stats: { patk: 10 },
    ability: "sharpness",
    description: "Sharp steel blade with bleeding chance"
  },
  // ... add more equipment
};

function getEquipmentStats(equipment) {
  return equipment.stats || {};
}

function applyEquipmentAbility(equipment, character, target, enemies) {
  if (!equipment.ability) return;
  
  let abilityName = equipment.ability;
  let ability = CONFIG.ABILITIES[abilityName];
  
  if (abilityName === "sharpness" && Math.random() < ability.bleedingChance) {
    target.status.bleeding = Math.max(target.status.bleeding, ability.duration);
  }
  // ... add other abilities
}
```

### 2. Create Basic `js/gameLoop.js` Structure

```javascript
let currentArea = 1;
let currentRound = 1;
let currentSet = 1;
let isPaused = false;
let isGameRunning = false;
let monsters = [];
let battleLog = document.getElementById("battle-log");

function log(message) {
  if (!battleLog) battleLog = document.getElementById("battle-log");
  let div = document.createElement("div");
  div.textContent = message;
  battleLog.appendChild(div);
  battleLog.scrollTop = battleLog.scrollHeight;
}

function startBattle() {
  // Close difficulty modal
  document.getElementById("difficulty-modal").classList.remove("active");
  
  // Initialize heroes
  heroes = initializeHeroes();
  
  // Spawn first monsters
  spawnMonsters();
  
  // Start game loop
  isGameRunning = true;
  isPaused = false;
  
  log(`Battle Started! Area ${currentArea}, Round ${currentRound}`);
}

function spawnMonsters() {
  monsters = [];
  let difficulty = getDifficulty();
  let monsterCount = 2 + currentRound;
  
  for (let i = 0; i < monsterCount; i++) {
    // Create random monster with scaled stats
    // TODO: Implement random monster generation
    let newMonster = generateRandomMonster(currentSet, AreaMonsters);
    monsters.push(newMonster);
  }
}

function gameLoop(deltaTime) {
  if (!isGameRunning || isPaused) return;
  
  // Update statuses
  heroes.forEach(hero => applyStatusEffects(hero, deltaTime));
  monsters.forEach(monster => applyStatusEffects(monster, deltaTime));
  
  // Execute actions
  executeRound();
  
  // Check win/lose conditions
  checkBattleStatus();
}

function executeRound() {
  // Sort all characters by speed
  let allChars = [...heroes, ...monsters];
  allChars.sort((a, b) => {
    let speedA = a.pspd + a.mspd;
    let speedB = b.pspd + b.mspd;
    return speedB - speedA;
  });
  
  // Execute actions for each character
  allChars.forEach(char => {
    if (!char.isAlive()) return;
    
    let allies, enemies;
    if (char.team === "A") {
      allies = heroes;
      enemies = monsters;
    } else {
      allies = monsters;
      enemies = heroes;
    }
    
    // Choose and execute skill
    chooseAndExecuteSkill(char, allies, enemies);
  });
}

function chooseAndExecuteSkill(character, allies, enemies) {
  if (character.activeSkills.length === 0) return;
  
  // Choose random skill for now (can be improved with AI)
  let skill = random(character.activeSkills);
  if (skill && skill.execute) {
    executeSkill(skill, character, allies, enemies);
  }
}

function applyStatusEffects(character, deltaTime) {
  // Apply damage over time effects
  if (character.status.burn > 0) {
    let dmg = Math.floor(character.maxHp * 0.01);
    character.takeDamage(dmg, "physical");
    character.status.burn -= deltaTime;
  }
  
  if (character.status.bleeding > 0) {
    let dmg = Math.floor(character.maxHp * 0.01);
    character.takeDamage(dmg, "physical");
    character.status.bleeding -= deltaTime;
  }
  
  // Remove expired effects
  if (character.status.stun > 0) {
    character.status.stun -= deltaTime;
  }
  
  // Apply regeneration
  if (character.status.regeneration && character.status.regeneration.active) {
    let healAmount = character.status.regeneration.hpPerSecond * deltaTime;
    character.heal(healAmount);
    character.status.regeneration.duration -= deltaTime;
    if (character.status.regeneration.duration <= 0) {
      character.status.regeneration.active = false;
    }
  }
}

function checkBattleStatus() {
  let aliveHeroes = alive(heroes);
  let aliveMonsters = alive(monsters);
  
  // All monsters defeated
  if (aliveMonsters.length === 0) {
    endBattle("win");
  }
  
  // All heroes defeated
  if (aliveHeroes.length === 0) {
    endBattle("lose");
  }
}

function endBattle(result) {
  isGameRunning = false;
  
  if (result === "win") {
    log("Battle Won!");
    // Reward experience
    monsters.forEach(monster => {
      let exp = 10 + currentSet * 5; // Simplified
      heroes.forEach(hero => hero.addExperience(exp));
    });
    
    // Move to next round
    nextRound();
  } else {
    log("Battle Lost!");
    // Show game over
    showGameOver();
  }
}

function nextRound() {
  currentRound++;
  currentSet++;
  
  // Quick rest
  heroes.forEach(hero => {
    let hpRestore = Math.floor(hero.maxHp * 0.25) + (2 * currentSet);
    let staRestore = Math.floor(hero.maxSta * 0.30) + (3 * currentSet);
    let manaRestore = Math.floor(hero.maxMana * 0.30) + (3 * currentSet);
    
    hero.heal(hpRestore);
    hero.restoreStamina(staRestore);
    hero.restoreMana(manaRestore);
  });
  
  log(`Round ${currentRound} started!`);
  spawnMonsters();
}

function togglePause() {
  isPaused = !isPaused;
  let btn = document.getElementById("pause-btn");
  if (isPaused) {
    btn.classList.add("paused");
    btn.textContent = "▶ Resume";
  } else {
    btn.classList.remove("paused");
    btn.textContent = "⏸ Pause";
  }
}

// Main game loop
let lastTime = 0;
function update(currentTime) {
  let deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;
  
  if (deltaTime > 0.1) deltaTime = 0.1; // Cap deltaTime
  
  gameLoop(deltaTime);
  requestAnimationFrame(update);
}

requestAnimationFrame(update);
```

### 3. Create Basic `js/UI.js` Structure

```javascript
// ===== UI UPDATE FUNCTIONS =====

function updateHPUI(character) {
  if (!character.element) return;
  
  let hpPercent = (character.hp / character.maxHp) * 100;
  let hpFill = character.element.querySelector(".hp-fill");
  if (hpFill) {
    hpFill.style.width = hpPercent + "%";
  }
}

function updateStatusUI(character) {
  // Update status display
  if (!character.element) return;
  
  let statusDiv = character.element.querySelector(".status") || document.createElement("div");
  let statuses = [];
  
  if (character.status.burn > 0) statuses.push(`🔥Burn(${Math.ceil(character.status.burn)})`);
  if (character.status.bleeding > 0) statuses.push(`💧Bleed(${Math.ceil(character.status.bleeding)})`);
  if (character.status.stun > 0) statuses.push(`⚡Stun`);
  if (character.status.shield.active) statuses.push(`🛡️Shield`);
  
  statusDiv.textContent = statuses.join(" ");
  if (!character.element.querySelector(".status")) {
    character.element.appendChild(statusDiv);
  }
}

function createCharacterUI(character, container) {
  let div = document.createElement("div");
  div.className = "character";
  if (character.isDead || !character.isAlive()) {
    div.classList.add("dead");
  }
  
  div.innerHTML = `
    <strong>${character.name}</strong>
    <div class="hp-bar">
      <div class="hp-fill"></div>
    </div>
    <div class="stats"></div>
    <div class="status"></div>
  `;
  
  character.element = div;
  character.hpFill = div.querySelector(".hp-fill");
  container.appendChild(div);
  updateHPUI(character);
}

function renderBattlefield() {
  let grid = document.getElementById("battlefield-grid");
  if (!grid) return;
  
  grid.innerHTML = "";
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = `repeat(8, 1fr)`;
  grid.style.gridTemplateRows = `repeat(8, 1fr)`;
  
  // Create grid blocks
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      let block = document.createElement("div");
      block.className = "placement-block";
      block.id = `grid-${x}-${y}`;
      grid.appendChild(block);
    }
  }
  
  // Place heroes
  heroes.forEach((hero, idx) => {
    if (idx < 3) {
      hero.gridX = 1 + idx;
      hero.gridY = 7;
      placeCharacterOnGrid(hero);
    }
  });
  
  // Place monsters
  monsters.forEach((monster, idx) => {
    if (idx < 3) {
      monster.gridX = 1 + idx;
      monster.gridY = 0;
      placeCharacterOnGrid(monster);
    }
  });
}

function placeCharacterOnGrid(character) {
  let gridId = `grid-${character.gridX}-${character.gridY}`;
  let gridBlock = document.getElementById(gridId);
  
  if (!gridBlock) return;
  
  // Create character block
  let charBlock = document.createElement("div");
  charBlock.className = `character-block ${character.team === "A" ? "hero" : "monster"}`;
  if (character.isDead) charBlock.classList.add("dead");
  
  charBlock.innerHTML = `
    <span class="char-name">${character.name}</span>
    <div class="hp-stroke"></div>
  `;
  
  charBlock.onclick = () => {
    if (character.team === "A") {
      showCharacterProfile(character);
    }
  };
  
  gridBlock.innerHTML = "";
  gridBlock.appendChild(charBlock);
  
  // Update HP stroke
  let stroke = charBlock.querySelector(".hp-stroke");
  let hpPercent = (character.hp / character.maxHp) * 100;
  stroke.style.width = hpPercent + "%";
}

function showCharacterProfile(character) {
  let profileTab = document.getElementById("profile-tab");
  if (!profileTab) return;
  
  profileTab.classList.add("active");
  
  // Update profile content
  document.getElementById("profile-name").textContent = character.name;
  document.getElementById("stat-hp").textContent = `${character.hp}/${character.maxHp}`;
  document.getElementById("stat-sta").textContent = `${Math.floor(character.sta)}/${character.maxSta}`;
  document.getElementById("stat-mana").textContent = `${Math.floor(character.mana)}/${character.maxMana}`;
  document.getElementById("stat-patk").textContent = character.patk + character.statBonus.patk;
  document.getElementById("stat-matk").textContent = character.matk + character.statBonus.matk;
  document.getElementById("stat-pdef").textContent = character.pdef + character.statBonus.pdef;
  document.getElementById("stat-mdef").textContent = character.mdef + character.statBonus.mdef;
  document.getElementById("stat-ccrit").textContent = Math.round((character.ccrit + character.statBonus.ccrit) * 100) + "%";
  
  // Update experience
  document.getElementById("hero-exp").textContent = character.experience;
}

function closeProfile() {
  let profileTab = document.getElementById("profile-tab");
  if (profileTab) {
    profileTab.classList.remove("active");
  }
}

function switchProfileView(view) {
  // Hide all sections
  document.querySelectorAll(".profile-section").forEach(s => s.classList.remove("active"));
  document.querySelectorAll(".profile-tab-btn").forEach(b => b.classList.remove("active"));
  
  // Show selected
  document.getElementById(view + "-view").classList.add("active");
  event.target.classList.add("active");
}

function toggleBattleLog() {
  let panel = document.querySelector(".battle-log-panel");
  if (panel) {
    panel.classList.toggle("active");
  }
}

function showGameOver() {
  let modal = document.getElementById("gameover-modal");
  if (modal) {
    modal.classList.add("active");
    document.getElementById("gameover-text").textContent = 
      `You reached Area ${currentArea}, Round ${currentRound}`;
  }
}

function resetGame() {
  location.reload();
}

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    togglePause();
    e.preventDefault();
  }
});
```

### 4. Update `js/monsterTemplate.js` - Key Changes

Keep the existing structure but add these functions:

```javascript
function generateRandomMonster(setNumber, templates = AreaMonsters) {
  let templateEntries = Object.entries(templates);
  if (templateEntries.length === 0) return null;
  
  let [name, template] = random(templateEntries);
  
  let difficulty = getDifficulty();
  let scaling = 1 + (setNumber * (difficulty.monsterScaling || 0.12));
  
  let monster = new Character(
    name,
    {
      maxHp: Math.floor(template.hp * scaling),
      maxSta: Math.floor(template.sta * scaling),
      maxMana: Math.floor(template.mana * scaling),
      patk: Math.floor(template.patk * scaling),
      matk: Math.floor(template.matk * scaling),
      pdef: Math.floor(template.pdef * scaling),
      mdef: Math.floor(template.mdef * scaling),
      tatt: 0,
      pspd: template.pspd * (1 + setNumber * 0.05),
      mspd: template.mspd * (1 + setNumber * 0.05),
      ccrit: Math.min(0.3, 0.05 + setNumber * 0.02),
      dcrit: 1.3 + setNumber * 0.05
    },
    "B",
    template.skills || []
  );
  
  return monster;
}

function generateMonsterTeam(setNumber) {
  let difficulty = getDifficulty();
  let baseCount = 2 + Math.floor(setNumber / 2);
  let adjustedCount = Math.floor(baseCount * difficulty.spawnRate);
  
  let team = [];
  for (let i = 0; i < adjustedCount; i++) {
    team.push(generateRandomMonster(setNumber));
  }
  return team;
}
```

---

## **Implementation Priority**

1. ✅ **Done**: Config, Preparation, Heroes, HTML, CSS, Utils
2. **Next**: Equipment.js (30 min)
3. **Then**: GameLoop.js (1-2 hours)
4. **Then**: UI.js (1-2 hours)
5. **Then**: MonsterTemplate.js updates (30 min)
6. **Finally**: Skills.js completion (1 hour)

---

## **Testing Commands**

Once you have the basic structure:

```javascript
// In browser console
initializeHeroes();
heroes[0].takeDamage(10, "physical");
calculateDamage(heroes[0], heroes[1], "physical", 1.2);
getClosestEnemy(heroes[0], monsters);
```

Good luck! 🎮

