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
    equipText = "📦 " + char.equipment.map(e => {
      let abilityStr = (e.ability && EquipmentAbilities[e.ability]) ? ` [${EquipmentAbilities[e.ability].name}]` : "";
      return e.name + abilityStr;
    }).join(", ");
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
      <div style="font-size: 10px; margin: 5px 0;">
        P.ATK ${h.patk} | M.ATK ${h.matk} | P.DEF ${h.pdef} | M.DEF ${h.mdef} | P.SPD ${h.pspd.toFixed(2)} | M.SPD ${h.mspd.toFixed(2)}
      </div>
      <button onclick="buyUpgrade(${idx}, 'patk', 3)" ${(h.statsPoints || 0) < 3 ? "disabled" : ""}>P.ATK +5 (3 pts)</button>
      <button onclick="buyUpgrade(${idx}, 'pdef', 3)" ${(h.statsPoints || 0) < 3 ? "disabled" : ""}>P.DEF +3 (3 pts)</button>
      <button onclick="buyUpgrade(${idx}, 'pspd', 2)" ${(h.statsPoints || 0) < 2 ? "disabled" : ""}>P.SPD +0.2 (2 pts)</button>
      <button onclick="buyUpgrade(${idx}, 'matk', 3)" ${(h.statsPoints || 0) < 3 ? "disabled" : ""}>M.ATK +5 (3 pts)</button>
      <button onclick="buyUpgrade(${idx}, 'mdef', 3)" ${(h.statsPoints || 0) < 3 ? "disabled" : ""}>M.DEF +3 (3 pts)</button>
      <button onclick="buyUpgrade(${idx}, 'mspd', 2)" ${(h.statsPoints || 0) < 2 ? "disabled" : ""}>M.SPD +0.2 (2 pts)</button>
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
        let statsDisplay = "";
        if (equip.stats) {
          statsDisplay = Object.entries(equip.stats)
            .map(([key, val]) => `${key.toUpperCase()} +${val}`)
            .join(", ");
        }
        
        let abilityDisplay = "";
        if (equip.ability && EquipmentAbilities[equip.ability]) {
          let ability = EquipmentAbilities[equip.ability];
          abilityDisplay = `<div class="equipment-ability">⭐ ${ability.name}: ${ability.description}</div>`;
        }
        
        html += `
        <div class="equipment-item">
          <div class="equipment-item-header">${h.name} - ${equip.name}</div>
          <div class="equipment-item-rarity">⭐ ${equip.rarity.toUpperCase()}</div>
          <div class="equipment-item-lore" style="font-size: 10px; font-style: italic; margin: 5px 0;">"${equip.lore}"</div>
          <div class="equipment-item-stats">${statsDisplay}</div>
          ${abilityDisplay}
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
  if (statType === "patk") {
    hero.patk += 5;
  } else if (statType === "matk") {
    hero.matk += 5;
  } else if (statType === "pdef") {
    hero.pdef += 3;
  } else if (statType === "mdef") {
    hero.mdef += 3;
  } else if (statType === "pspd") {
    hero.pspd += 0.2;
  } else if (statType === "mspd") {
    hero.mspd += 0.2;
  }
  
  updateStatsDisplay();
  log(`${hero.name} diperkuat! (${statType.toUpperCase()} +1)`);
}

function unequipItem(heroIndex, equipIndex) {
  let hero = heroes[heroIndex];
  let equip = hero.equipment[equipIndex];
  
  // Remove stat bonuses
  if (equip.stats) {
    Object.entries(equip.stats).forEach(([key, value]) => {
      if (hero[key] !== undefined) {
        hero[key] -= value;
      }
    });
  }
  
  // Handle HP changes
  if (equip.stats && equip.stats.hp) {
    hero.maxHp -= equip.stats.hp;
    if (hero.hp > hero.maxHp) {
      hero.hp = hero.maxHp;
    }
  }
  
  // Remove from equipment list
  hero.equipment.splice(equipIndex, 1);
  
  updateEquipmentDisplay(hero);
  updateEquipmentInventory();
  updateUI(hero);
}

function giveEquipmentToHero(hero, equip) {
  if (!hero.equipment) hero.equipment = [];
  hero.equipment.push(equip);
  
  // Apply stat bonuses
  if (equip.stats) {
    Object.entries(equip.stats).forEach(([key, value]) => {
      if (hero[key] !== undefined) {
        hero[key] += value;
      }
    });
  }
  
  // Special handling for HP
  if (equip.stats && equip.stats.hp) {
    hero.maxHp += equip.stats.hp;
    if (hero.hp + equip.stats.hp > hero.maxHp) {
      hero.hp = hero.maxHp;
    } else {
      hero.hp += equip.stats.hp;
    }
  }
  
  updateEquipmentDisplay(hero);
  updateUI(hero);
}

function updateHPUI(char) {
  if (char.element && char.hpFill) {
    char.hpFill.style.width = (char.hp / char.maxHp) * 100 + "%";
    char.element.querySelector(".stats").textContent =
      `HP ${char.hp}/${char.maxHp} | Sta ${(char.sta || 0).toFixed(0)}/${char.maxSta || 0} | Mana ${(char.mana || 0).toFixed(0)}/${char.maxMana || 0}`;
  }
  
  // Also update grid HP if character is on grid
  if (char.gridHPFill) {
    updateGridCharacterHP(char);
  }
}

function updateStatusUI(char) {
  let statusText = "";
  
  if (char.status) {
    let activeStatuses = getActiveStatuses(char);
    
    activeStatuses.forEach(statusKey => {
      let effect = StatusEffects[statusKey];
      if (effect) {
        statusText += effect.icon + " ";
      }
    });
  }
  
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