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

function updateEquipmentDisplay(char) {
  let equipText = "";
  if (char.equipment && char.equipment.length > 0) {
    equipText = "📦 " + char.equipment.map(e => e.name).join(", ");
  }
  if (char.element) {
    char.element.querySelector(".character-equipment").textContent = equipText;
  }
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
  if (char.element && char.hpFill) {
    char.hpFill.style.width = (char.hp / char.maxHp) * 100 + "%";
    char.element.querySelector(".stats").textContent =
      `HP ${char.hp}/${char.maxHp}`;
  }
  
  // Also update grid HP if character is on grid
  if (char.gridHPFill) {
    updateGridCharacterHP(char);
  }
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
  if (char.element) {
    char.element.querySelector(".status").textContent = statusText;
  }
}

function updateDeadUI(char) {
  if (!char.isAlive()) {
    if (char.element) {
      char.element.classList.add("dead");
    }
    if (char.gridElement) {
      char.gridElement.classList.add("dead");
      char.gridElement.style.opacity = "0.35";
    }
  } else {
    if (char.element) {
      char.element.classList.remove("dead");
    }
    if (char.gridElement) {
      char.gridElement.classList.remove("dead");
      char.gridElement.style.opacity = "1";
    }
  }
}

function updateUI(char) {
  updateHPUI(char);
  updateStatusUI(char);
  updateDeadUI(char);
  updateEquipmentDisplay(char);
}