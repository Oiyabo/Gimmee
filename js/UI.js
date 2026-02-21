// ===== UI =====
function createUI(char, container) {
  let div = document.createElement("div");
  div.className = "character";
  div.innerHTML = `<strong>${char.name}</strong>
<div class="hp-bar"><div class="hp-fill"></div></div>
<div class="stats"></div>
<div class="character-equipment"></div>
<div class="status"></div>`;
  char.element = div;
  char.hpFill = div.querySelector(".hp-fill");
  container.appendChild(div);
}

/**
 * Display heroes on the battle map
 * @param {Array} heroList - Array of hero characters
 */
function displayHeroesOnMap(heroList) {
  const battleMap = document.getElementById('battle-map');
  if (!battleMap) return;
  
  initializeBattleMap();
  
  // Place heroes in random positions on the left side of the map
  for (let hero of heroList) {
    if (hero.isDead) continue;
    
    let placed = false;
    let attempts = 0;
    
    // Try to place heroes on the left side (columns 0-3)
    while (!placed && attempts < 30) {
      const row = Math.floor(Math.random() * 8);
      const col = Math.floor(Math.random() * 4);
      
      if (!isPositionOccupied(row, col)) {
        placeCharacterOnMap(hero, row, col);
        hero.mapPosition = { row, col };
        placed = true;
      }
      attempts++;
    }
  }
  
  updateHeroesPanel(heroList);
}

/**
 * Display monsters on the battle map
 * @param {Array} monsterList - Array of monster characters
 * @param {string} direction - Direction where monsters should spawn (N, S, E, W, NE, NW, SE, SW)
 */
function displayMonstersOnMap(monsterList, direction = 'E') {
  // Remove dead monsters from the map first
  removeDeadCharactersFromMap();
  
  // Place monsters in random positions on the right side of the map (columns 4-7)
  for (let monster of monsterList) {
    if (monster.isDead) continue;
    
    let placed = false;
    let attempts = 0;
    const directionMap = {
      'E': { minCol: 4, maxCol: 7, minRow: 0, maxRow: 7 },
      'W': { minCol: 0, maxCol: 3, minRow: 0, maxRow: 7 },
      'N': { minCol: 0, maxCol: 7, minRow: 0, maxRow: 3 },
      'S': { minCol: 0, maxCol: 7, minRow: 4, maxRow: 7 },
      'NE': { minCol: 4, maxCol: 7, minRow: 0, maxRow: 3 },
      'NW': { minCol: 0, maxCol: 3, minRow: 0, maxRow: 3 },
      'SE': { minCol: 4, maxCol: 7, minRow: 4, maxRow: 7 },
      'SW': { minCol: 0, maxCol: 3, minRow: 4, maxRow: 7 }
    };
    
    const bounds = directionMap[direction] || directionMap['E'];
    
    while (!placed && attempts < 30) {
      const row = bounds.minRow + Math.floor(Math.random() * (bounds.maxRow - bounds.minRow + 1));
      const col = bounds.minCol + Math.floor(Math.random() * (bounds.maxCol - bounds.minCol + 1));
      
      if (!isPositionOccupied(row, col)) {
        placeCharacterOnMap(monster, row, col);
        monster.mapPosition = { row, col };
        placed = true;
      }
      attempts++;
    }
  }
  
  updateMonstersPanel(monsterList);
}

/**
 * Update the heroes panel display
 * @param {Array} heroList
 */
function updateHeroesPanel(heroList) {
  const panel = document.getElementById('heroes');
  if (!panel) return;
  
  panel.innerHTML = '';
  
  for (let hero of heroList) {
    const div = document.createElement('div');
    div.className = 'character';
    div.innerHTML = `<strong>${hero.name}</strong>
    <div class="hp-bar"><div class="hp-fill"></div></div>
    <div class="stats"></div>
    <div class="character-equipment"></div>
    <div class="status"></div>`;
    
    hero.element = div;
    hero.hpFill = div.querySelector(".hp-fill");
    
    panel.appendChild(div);
  }
}

/**
 * Update the monsters panel display
 * @param {Array} monsterList
 */
function updateMonstersPanel(monsterList) {
  const panel = document.getElementById('monsters');
  if (!panel) return;
  
  panel.innerHTML = '';
  
  for (let monster of monsterList) {
    const div = document.createElement('div');
    div.className = 'character';
    div.innerHTML = `<strong>${monster.name}</strong>
    <div class="hp-bar"><div class="hp-fill"></div></div>
    <div class="stats"></div>
    <div class="character-equipment"></div>
    <div class="status"></div>`;
    
    monster.element = div;
    monster.hpFill = div.querySelector(".hp-fill");
    
    panel.appendChild(div);
  }
}

function updateEquipmentDisplay(char) {
  let equipText = "";
  if (char.equipment && char.equipment.length > 0) {
    equipText = "📦 " + char.equipment.map(e => e.name).join(", ");
  }
  char.element.querySelector(".character-equipment").textContent = equipText;
}

function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll(".shop-tab-content").forEach(tab => {
    tab.classList.remove("active");
  });
  document.querySelectorAll(".shop-tab-btn").forEach(btn => {
    btn.classList.remove("active");
  });
  
  // Show selected tab
  document.getElementById(tabName + "-tab").classList.add("active");
  event.target.classList.add("active");
  
  if (tabName === "stats") {
    updateStatsDisplay();
  } else if (tabName === "equipment") {
    updateEquipmentInventory();
  }
}

function updateStatsDisplay() {
  let html = "";
  heroes.forEach((h, idx) => {
    html += `
    <div class="upgrade-item">
      <strong>${h.name}</strong> - Points: ${h.statsPoints || 0}
      <div style="font-size: 10px; margin: 5px 0;">ATK ${h.atk} | DEF ${h.def} | SPD ${h.spd.toFixed(2)}</div>
      <button onclick="buyUpgrade(${idx}, 'atk', 3)" ${(h.statsPoints || 0) < 3 ? "disabled" : ""}>ATK +5 (3 pts)</button>
      <button onclick="buyUpgrade(${idx}, 'def', 3)" ${(h.statsPoints || 0) < 3 ? "disabled" : ""}>DEF +3 (3 pts)</button>
      <button onclick="buyUpgrade(${idx}, 'spd', 2)" ${(h.statsPoints || 0) < 2 ? "disabled" : ""}>SPD +0.2 (2 pts)</button>
    </div>
    `;
  });
  document.getElementById("upgrade-list").innerHTML = html;
}

function updateEquipmentInventory() {
  let html = "";
  heroes.forEach((h, heroIdx) => {
    if (h.equipment && h.equipment.length > 0) {
      h.equipment.forEach((equip, equipIdx) => {
        html += `
        <div class="equipment-item">
          <div class="equipment-item-header">${h.name}</div>
          <div class="equipment-item-header">${equip.name}</div>
          <div class="equipment-item-rarity">⭐ ${equip.rarity}</div>
          <div class="equipment-item-stats">
            ${equip.stats.atk > 0 ? `ATK +${equip.stats.atk} ` : ''}
            ${equip.stats.def > 0 ? `DEF +${equip.stats.def} ` : ''}
            ${equip.stats.spd > 0 ? `SPD +${equip.stats.spd.toFixed(2)} ` : ''}
            ${equip.stats.hp > 0 ? `HP +${equip.stats.hp}` : ''}
          </div>
          ${equip.passive ? `<div class="equipment-item-passive">${equip.passive}</div>` : ''}
          <button onclick="unequipItem(${heroIdx}, ${equipIdx})">Unequip</button>
        </div>
        `;
      });
    }
  });
  
  if (html === "") {
    html = "<p style='grid-column: 1/-1; text-align: center;'>No equipment yet</p>";
  }
  
  document.getElementById("equipment-list").innerHTML = html;
}

function buyUpgrade(heroIndex, statType, cost) {
  let hero = heroes[heroIndex];
  if (!hero.statsPoints || hero.statsPoints < cost) {
    alert("Stat Points tidak cukup!");
    return;
  }
  
  hero.statsPoints -= cost;
  if (statType === "atk") {
    hero.atk += 5;
    hero.origAtk += 5;
  } else if (statType === "def") {
    hero.def += 3;
    hero.origDef += 3;
  } else if (statType === "spd") {
    hero.spd += 0.2;
    hero.origSpd += 0.2;
  }
  
  updateStatsDisplay();
  log(`${hero.name} diperkuat! (${statType.toUpperCase()} +1)`);
}

function unequipItem(heroIndex, equipIndex) {
  let hero = heroes[heroIndex];
  let equip = hero.equipment[equipIndex];
  
  // Remove stat bonus
  hero.atk -= equip.stats.atk;
  hero.def -= equip.stats.def;
  hero.spd -= equip.stats.spd;
  hero.maxHp -= equip.stats.hp;
  
  // Remove from equipment list
  hero.equipment.splice(equipIndex, 1);
  
  updateEquipmentDisplay(hero);
  updateEquipmentInventory();
  updateUI(hero);
}

function giveEquipmentToHero(hero, equip) {
  if (!hero.equipment) hero.equipment = [];
  hero.equipment.push(equip);
  
  // Apply stat bonus
  hero.atk += equip.stats.atk;
  hero.def += equip.stats.def;
  hero.spd += equip.stats.spd;
  hero.maxHp += equip.stats.hp;
  
  if (hero.hp + equip.stats.hp > hero.maxHp) {
    hero.hp = hero.maxHp;
  } else {
    hero.hp += equip.stats.hp;
  }
  
  updateEquipmentDisplay(hero);
  updateUI(hero);
}

function updateHPUI(char) {
  char.hpFill.style.width = (char.hp / char.maxHp) * 100 + "%";
  char.element.querySelector(".stats").textContent =
    `HP ${char.hp}/${char.maxHp}`;
}

function updateStatusUI(char) {
  let statusText = "";
  if (char.status.burn > 0) statusText += "🔥Burn ";
  if (char.status.bleeding > 0) statusText += "🩸Bleed ";
  if (char.status.shield) statusText += "🛡Shield ";
  if (char.status.stun > 0) statusText += "⚡Stun ";
  if (char.status.paralyzed > 0) statusText += "💤Para ";
  if (char.status.taunt) statusText += "🎯Taunt ";
  if (char.status.critical > 0) statusText += "💥Crit ";
  if (char.status.buffed > 0) statusText += "⭐Buff ";
  char.element.querySelector(".status").textContent = statusText;
}

function updateDeadUI(char) {
  if (!char.isAlive()) {
    char.element.classList.add("dead");
  } else {
    char.element.classList.remove("dead");
  }
}

function updateUI(char) {
  updateHPUI(char);
  updateStatusUI(char);
  updateDeadUI(char);
  updateEquipmentDisplay(char);
  
  // Update map display if character is on map
  if (typeof updateCharacterDisplay === 'function') {
    updateCharacterDisplay(char);
  }
}