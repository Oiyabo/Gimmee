// ===== GAME LOOP WITH AREA/ROUND/SET SYSTEM =====
let running = false;
let lastTime = 0;
let isBoss = false;
let pendingRewards = [];
let inRestMode = false; // Track if currently in rest mode (allows equipment/skill changes)
let currentDifficulty = "normal"; // relax, normal, focus
let difficultyScaling = 1; // Difficulty multiplier for monsters

// Settings
let gameSettings = {
  autoEquipSelect: false,
  autoEquipPause: false,  // If true, don't pause during quick-rest
  autoSkillSelect: false,
  autoSkillPause: false   // If true, don't pause during long-rest
};

// Load settings from localStorage
function loadSettings() {
  let saved = localStorage.getItem('gameSettings');
  if (saved) {
    gameSettings = { ...gameSettings, ...JSON.parse(saved) };
  }
}

function applyStatus(char, delta) {
  // Use comprehensive status effects system
  updateStatusEffects(char, delta);
  updateStatusUI(char);
}

function loop(ts) {
  if (!running) return;
  
  // Skip update if paused
  if (isPaused) {
    requestAnimationFrame(loop);
    return;
  }
  
  let delta = (ts - lastTime) / 1000;
  lastTime = ts;
  
  let aliveHeroes = alive(heroes);
  let aliveMonsters = alive(monsters);
  
  // Check battle end conditions
  if (aliveHeroes.length === 0) {
    // GAME OVER
    running = false;
    petualanganAktif = false;
    showGameOverModal();
    return;
  }
  
  if (aliveMonsters.length === 0) {
    // Victory in this set
    running = false;
    currentSet++;
    
    // Check if round complete (3 sets per normal round, 1 set per boss round)
    let setPerRound = isBoss ? 1 : 3;
    if (currentSet % setPerRound === 0) {
      // Round complete - Pause and show rewards
      collectRoundRewards();
    } else {
      // Next set in same round - Continue immediately with 10% heal
      continueNextSet();
    }
    return;
  }

  [...heroes, ...monsters].forEach((c) => {
    if (!c.isAlive()) return;
    applyStatus(c, delta);
    c.cooldown -= delta;
    if (c.cooldown <= 0 && c.status.stun <= 0) {
      let allies = c.team === "A" ? heroes : monsters;
      let enemies = c.team === "A" ? monsters : heroes;
      let skill = random(c.skills);
      skill(c, allies, enemies);
      c.cooldown = 1 / c.spd;
    }
  });
  
  requestAnimationFrame(loop);
}

// ===== REST SYSTEM =====
function updateRestModeIndicator() {
  const indicator = document.getElementById("rest-mode-indicator");
  if (indicator) {
    if (inRestMode) {
      indicator.style.display = "block";
    } else {
      indicator.style.display = "none";
    }
  }
}

function quickRest(heroTeam, setNumber) {
  // Quick rest: 25% HP + 2*set, and 30% + 3*set for Sta/Mana
  let hpHeal = Math.floor(heroTeam[0].maxHp * 0.25) + (2 * setNumber);
  let staRestore = 0;
  let manaRestore = 0;
  
  heroTeam.forEach(h => {
    // Heal HP
    h.hp += hpHeal;
    if (h.hp > h.maxHp) h.hp = h.maxHp;
    
    // Restore Stamina
    staRestore = Math.floor(h.maxSta * 0.30) + (3 * setNumber);
    h.sta += staRestore;
    if (h.sta > h.maxSta) h.sta = h.maxSta;
    
    // Restore Mana
    manaRestore = Math.floor(h.maxMana * 0.30) + (3 * setNumber);
    h.mana += manaRestore;
    if (h.mana > h.maxMana) h.mana = h.maxMana;
    
    log(`✨ ${h.name}: +${hpHeal} HP, +${staRestore} Sta, +${manaRestore} Mana`);
    updateUI(h);
  });
}

function longRest(heroTeam) {
  // Long rest: Full heal and clear all negative effects
  heroTeam.forEach(h => {
    // Heal to full
    h.hp = h.maxHp;
    h.sta = h.maxSta;
    h.mana = h.maxMana;
    
    // Clear all negative effects
    clearAllStatuses(h);
    
    log(`⭐ ${h.name}: Fully healed and all negative effects cleared!`);
    updateUI(h);
  });
}

function collectRoundRewards() {
  log(`🎉 Round ${currentRound + 1} Complete!`);
  
  // Generate rewards
  let rewardText = "";
  pendingRewards = [];
  
  if (isBoss) {
    let expReward = 40 + currentArea * 10;
    let spPoints = 15 + currentArea * 5;
    heroes.forEach(h => {
      if (!h.statsPoints) h.statsPoints = 0;
      h.statsPoints += spPoints;
      h.exp += expReward;
    });
    rewardText += `+${expReward} EXP untuk setiap hero!\n`;
    rewardText += `+${spPoints} Stat Points untuk setiap hero! (BOSS REWARD)\n`;
  } else {
    let expReward = 15 + currentSet * 3;
    let spPoints = 5 + currentSet * 2;
    heroes.forEach(h => {
      if (!h.statsPoints) h.statsPoints = 0;
      h.statsPoints += spPoints;
      h.exp += expReward;
    });
    rewardText += `+${expReward} EXP untuk setiap hero!\n`;
    rewardText += `+${spPoints} Stat Points untuk setiap hero!\n`;
  }
  
  // Give equipment to 1-3 random heroes
  let heroPromise = Math.floor(Math.random() * 2) + 1; // 1-2 heroes
  for (let i = 0; i < heroPromise; i++) {
    let hero = random(heroes);
    let equip = getRandomEquipment();
    giveEquipmentToHero(hero, equip);
    pendingRewards.push(`${hero.name} got ${equip.name}!`);
  }
  
  showRoundTransition(rewardText);
}

function showRoundTransition(rewardText) {
  isRoundPaused = true;
  isPaused = true;
  inRestMode = true; // Enable equipment/skill changes
  updateRestModeIndicator();
  
  // Check if area complete (boss round is the 4th round)
  if (isBoss) {
    // Area complete
    showAreaTransition(rewardText);
  } else {
    // Just round transition - Apply quick rest
    quickRest(heroes, currentSet);
    
    let title = `🎊 Round ${currentRound + 1} Complete!`;
    let text = rewardText + "\n\n🌙 Quick Rest: Stamina and Mana partially restored!";
    
    // Check if should skip UI due to auto-selection
    if (gameSettings.autoEquipSelect && gameSettings.autoSkillSelect && gameSettings.autoEquipPause) {
      // Skip choice UI, auto-apply and continue
      autoApplyTransitionChoices();
      continueFromTransition();
    } else {
      // Show choice UI in profile
      openProfile(0); // Open profile UI first
      showTransitionChoices(title, text);
    }
  }
}

function showAreaTransition(rewardText) {
  inRestMode = true; // Enable equipment/skill changes
  updateRestModeIndicator();
  
  // Apply long rest
  longRest(heroes);
  
  let title = `🌟 Area ${currentArea + 1} Complete!`;
  let fullText = rewardText + "\n\n🛏️ Long Rest: Fully healed and all negative effects cleared!";
  
  // Check if should skip UI due to auto-selection
  if (gameSettings.autoEquipSelect && gameSettings.autoSkillSelect && gameSettings.autoSkillPause) {
    // Skip choice UI, auto-apply and continue
    autoApplyTransitionChoices();
    continueFromTransition();
  } else {
    // Show choice UI in profile
    openProfile(0); // Open profile UI first
    showTransitionChoices(title, fullText);
  }
}

function continueNextSet() {
  // Heal 10% HP
  heroes.forEach(h => {
    h.hp = Math.floor(h.maxHp * 1.1);
    if (h.hp > h.maxHp) h.hp = h.maxHp;
    updateUI(h);
    updateGridCharacterHP(h);
  });
  
  // Remove dead monsters from grid and container
  monsters.forEach(m => {
    if (!m.isAlive()) {
      removeCharacterFromGrid(m);
    }
  });
  
  // Generate new monster set
  let areaName = getAreaName(currentArea);
  let monsterTemplates = getAreaMonstersTemplate(areaName);
  monstersContainer.innerHTML = "";
  
  if (isBoss && currentSet % 4 === 0) {
    // Boss battle
    monsters = [generateBoss(currentRound, currentArea)];
    log(`🐉 BOSS BATTLE! Area ${currentArea + 1} (${areaName}) - Round ${currentRound + 1}`);
  } else {
    monsters = generateMonsterTeam(currentSet, monsterTemplates);
    log(`⚔ SET ${currentSet + 1} START - Area ${currentArea + 1} (${areaName}), Round ${currentRound + 1}`);
  }
  
  monsters.forEach(m => createUI(m, monstersContainer));
  
  // Keep using same spawn direction for entire round (3 sets)
  // Direction only changes when nextRound() is called
  monsters.forEach((m, idx) => {
    let pos = getRandomSpawnPosition(currentSpawnDirection);
    // Try to place, if occupied find nearby empty spot
    let attempts = 0;
    while (gridOccupancy[getGridKey(pos.row, pos.col)] && attempts < 3) {
      pos = getRandomSpawnPosition(currentSpawnDirection);
      attempts++;
    }
    placeCharacterOnGrid(m, pos.row, pos.col);
  });
  
  running = true;
  lastTime = performance.now();
  requestAnimationFrame(loop);
}

function nextRound() {
  isRoundPaused = false;
  document.getElementById("transition-modal").classList.remove("active");
  inRestMode = false; // Exit rest mode
  
  // Check if area transition
  if (isBoss) {
    // End of area - reset to next area
    currentArea++;
    currentRound = 0;
    currentSet = 0;
    isBoss = false;
    
    // Set new spawn direction for next area round 1
    currentSpawnDirection = randomSpawnDirection();
    updateSpawnDirectionDisplay();
    
    log(`\n🌟 Starting Area ${currentArea + 1}!\n`);
  } else {
    // Next normal round
    currentRound++;
    currentSet = 0;
    
    // Set new spawn direction for new round
    currentSpawnDirection = randomSpawnDirection();
    updateSpawnDirectionDisplay();
    
    // Check if next is boss round
    if (currentRound === 3) {
      isBoss = true;
      log(`\n👑 Boss Round ${currentRound + 1} - Area ${currentArea + 1}!\n`);
    } else {
      log(`\n⚔ Starting Round ${currentRound + 1} - Area ${currentArea + 1}!\n`);
    }
  }
  
  updateStageInfo();
  continueNextSet();
}

function continueFromTransition() {
  // Apply the selected equipment and skill
  applyTransitionChoices();
  
  // Hide choice UI
  document.getElementById("profile-choice-content").classList.remove("show-choices");
  document.getElementById("profile-normal-content").style.display = "flex";
  
  // Close profile
  closeProfile();
  
  // Resume game
  isPaused = false;
  inRestMode = false; // Exit rest mode, battle resuming
  updateRestModeIndicator();
  nextRound();
}

function togglePause() {
  if (!running) return;
  
  isPaused = !isPaused;
  let pauseBtn = document.getElementById("pause-btn");
  
  if (isPaused) {
    pauseBtn.textContent = "▶ Resume (SPACE)";
    pauseBtn.classList.add("paused");
    updateStageInfo();
    log("⏸ BATTLE PAUSED");
  } else {
    pauseBtn.textContent = "⏸ Pause (SPACE)";
    pauseBtn.classList.remove("paused");
    updateStageInfo();
    log("▶ BATTLE RESUMED");
    requestAnimationFrame(loop);
  }
}

// Keyboard shortcut for pause (Spacebar)
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    togglePause();
  }
});

function showGameOverModal() {
  let text = `Game selesai di Area ${currentArea + 1}, Round ${currentRound + 1}, Set ${currentSet + 1}`;
  document.getElementById("gameover-text").textContent = text;
  document.getElementById("gameover-modal").classList.add("active");
}

function continueFromGameOver() {
  // Just reset and start new game
  resetGame();
  startBattle();
}

function returnToMainMenu() {
  resetGame();
  document.getElementById("main-menu").classList.add("active");
}

function resetGame() {
  document.getElementById("gameover-modal").classList.remove("active");
  
  currentArea = 0;
  currentRound = 0;
  currentSet = 0;
  isBoss = false;
  isRoundPaused = false;
  isAreaPaused = false;
  running = false;
  isPaused = false;
  petualanganAktif = true;
  
  battleLog.innerHTML = "";
  
  // Reset grid (clear occupancy but keep DOM)
  gridOccupancy = {};
  heroStartPositions = {};
  for (let i = 0; i < GRID_TOTAL; i++) {
    const row = Math.floor(i / GRID_SIZE);
    const col = i % GRID_SIZE;
    const block = document.getElementById(`grid-${row}-${col}`);
    if (block) {
      block.innerHTML = "";
      block.classList.remove("occupied");
    }
  }
  
  // Reset heroes
  heroes.forEach(h => {
    h.hp = h.maxHp;
    h.atk = h.origAtk;
    h.def = h.origDef;
    h.spd = h.origSpd;
    h.cooldown = 0;
    h.statsPoints = 0;
    h.equipment = [];
    h.status = { 
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
    h.gridPosition = null;
    h.gridElement = null;
    h.element.classList.remove("dead");
    updateUI(h);
  });
  
  updateStageInfo();
  document.getElementById("start-btn").disabled = false;
  document.getElementById("pause-btn").style.display = "none";
  document.getElementById("pause-btn").classList.remove("paused");
  document.getElementById("next-round-btn").style.display = "none";
}

function updateStageInfo() {
  let roundType = isBoss ? "BOSS" : `Normal`;
  let areaName = getAreaName(currentArea);
  let pauseIndicator = isPaused ? '<span class="pause-indicator">⏸ PAUSED</span>' : '';
  document.getElementById("stage-info").innerHTML = 
    `Area ${currentArea + 1} (${areaName}) - Round ${currentRound + 1} (${roundType}) - Set ${currentSet + 1}${pauseIndicator}`;
}

function startGameWithDifficulty(difficulty) {
  currentDifficulty = difficulty;
  
  // Apply difficulty scaling
  if (difficulty === "relax") {
    difficultyScaling = 0.7;  // Monsters are 30% weaker
  } else if (difficulty === "focus") {
    difficultyScaling = 1.5;  // Monsters are 50% stronger
  } else {
    difficultyScaling = 1;    // Normal difficulty
  }
  
  // Store difficulty (locked after selection)
  localStorage.setItem('currentDifficulty', difficulty);
  
  // Close main menu and start battle
  document.getElementById("main-menu").classList.remove("active");
  loadSettings();
  startBattle();
}

function startBattle() {
  petualanganAktif = true;
  inRestMode = false; // Exit rest mode, battle is starting
  updateRestModeIndicator();
  closeProfile(); // Close profile if open
  
  // Clear grid occupancy only (keep hero blocks visual)
  gridOccupancy = {};
  
  // Restore heroes to grid from their page load positions
  heroes.forEach(h => {
    if (h.gridPosition) {
      heroStartPositions[h.name] = { ...h.gridPosition };
      // Re-occupy grid for heroes
      const key = getGridKey(h.gridPosition.row, h.gridPosition.col);
      gridOccupancy[key] = h;
    }
  });
  
  // Generate first monster set
  let areaName = getAreaName(currentArea);
  let monsterTemplates = getAreaMonstersTemplate(areaName);
  monstersContainer.innerHTML = "";
  monsters = generateMonsterTeam(currentSet, monsterTemplates);
  monsters.forEach(m => createUI(m, monstersContainer));
  
  // Use existing spawn direction (already set at page load)
  log(`🧭 Musuh datang dari: ${currentSpawnDirection}`);
  
  // Place monsters on grid (random within spawn zone)
  monsters.forEach((m, idx) => {
    let pos = getRandomSpawnPosition(currentSpawnDirection);
    // Try to place, if occupied find nearby empty spot
    let attempts = 0;
    while (gridOccupancy[getGridKey(pos.row, pos.col)] && attempts < 3) {
      pos = getRandomSpawnPosition(currentSpawnDirection);
      attempts++;
    }
    placeCharacterOnGrid(m, pos.row, pos.col);
  });
  
  updateStageInfo();
  
  running = true;
  lastTime = performance.now();
  log("Battle Started!");
  document.getElementById("start-btn").disabled = true;
  document.getElementById("pause-btn").style.display = "inline-block";
  document.getElementById("pause-btn").textContent = "⏸ Pause (SPACE)";
  document.getElementById("pause-btn").classList.remove("paused");
  isPaused = false;
  requestAnimationFrame(loop);
}

// Function to update spawn direction display
function updateSpawnDirectionDisplay() {
  const directionMap = {
    N: "⬆️ Utara",
    NE: "↗️ Timur Laut",
    E: "➡️ Timur",
    SE: "↘️ Tenggara",
    S: "⬇️ Selatan",
    SW: "↙️ Barat Daya",
    W: "⬅️ Barat",
    NW: "↖️ Barat Laut"
  };
  const indicator = document.getElementById("spawn-direction-indicator");
  if (indicator) {
    indicator.textContent = directionMap[currentSpawnDirection] || "🧭 --";
  }
}

// Initialize on load
loadSettings();
initializeSettings();
heroes.forEach(h => createUI(h, heroesContainer));
updateStageInfo();
initializeSpawnDirectionDisplay();

// Initialize function untuk spawn direction display
function initializeSpawnDirectionDisplay() {
  const indicator = document.getElementById("spawn-direction-indicator");
  if (indicator) {
    indicator.textContent = "🧭 --";
  }
}

// Initialize grid at page load
initializeGrid();

// Set initial spawn direction for round 1 (before battle starts)
currentSpawnDirection = randomSpawnDirection();
updateSpawnDirectionDisplay();

// Place heroes on grid from page load
let heroStartCols = [0, 1];
heroes.forEach((h, idx) => {
  let row = idx % 4;
  let col = heroStartCols[Math.floor(idx / 4)];
  placeCharacterOnGrid(h, row * 2, col);
});

// Setup keyboard and UI listeners
document.addEventListener("DOMContentLoaded", () => {
  // Keyboard listener is already setup above
  console.log("Game initialized - Press SPACE to pause/resume");
});
