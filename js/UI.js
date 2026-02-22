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
  
  // Make hero blocks clickable to open profile
  if (container.id === "heroes") {
    div.style.cursor = "pointer";
    div.onclick = (e) => {
      e.stopPropagation();
      openProfile(heroes.indexOf(char));
    };
  }
  
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
  // Buy system is ALWAYS available, no rest mode check needed
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
  log(`🔧 ${hero.name} diperkuat! (${statType.toUpperCase()} +1)`);
}

function unequipItem(heroIndex, equipIndex) {
  // Can only unequip during rest mode
  if (!inRestMode) {
    alert("⚠️ Equipment can only be changed during Rest (Round/Area transitions)!");
    return;
  }
  
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
  
  log(`✅ ${hero.name} unequipped ${equip.name}!`);
  updateEquipmentDisplay(hero);
  updateEquipmentInventory();
  updateUI(hero);
}

function giveEquipmentToHero(hero, equip) {
  if (!hero.equipment) hero.equipment = [];
  if (!hero.maxEquipSlots) hero.maxEquipSlots = 7;
  
  // Enforce 7-slot limit
  if (hero.equipment.length >= hero.maxEquipSlots) {
    log(`⚠️ ${hero.name} is at max equipment capacity! Cannot receive ${equip.name}`);
    return false; // Equipment not given
  }
  
  hero.equipment.push(equip);
  
  // Initialize enhancement tracking
  if (!hero.equipmentLevels) hero.equipmentLevels = {};
  hero.equipmentLevels[equip.name] = 1;
  
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
  return true; // Equipment given successfully
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

// ===== PROFILE SYSTEM =====
let currentProfile = null; // Index of currently viewed hero

// Pricing system for stats - increases with purchases
const StatPricing = {
  maxHp: { base: 5, increment: 2 },
  maxSta: { base: 4, increment: 1.5 },
  maxMana: { base: 4, increment: 1.5 },
  patk: { base: 6, increment: 2 },
  matk: { base: 6, increment: 2 },
  pdef: { base: 5, increment: 1.5 },
  mdef: { base: 5, increment: 1.5 }
};

// Track purchases to calculate dynamic prices
let statPurchases = {
  maxHp: 0,
  maxSta: 0,
  maxMana: 0,
  patk: 0,
  matk: 0,
  pdef: 0,
  mdef: 0
};

function getStatPrice(statType) {
  let config = StatPricing[statType];
  if (!config) return 0;
  return Math.floor(config.base + (config.increment * statPurchases[statType]));
}

function openProfile(heroIndex) {
  // Only allow profile opening during rest mode or when not in battle
  if (running && !inRestMode) {
    alert("⚠️ You can only manage profiles during Rest periods!"); 
    return;
  }
  
  currentProfile = heroIndex;
  let hero = heroes[heroIndex];
  
  document.getElementById("profile-container").classList.add("active");
  updateProfileDisplay();
}

function closeProfile() {
  document.getElementById("profile-container").classList.remove("active");
  document.getElementById("skill-description").style.display = "none";
  document.getElementById("item-description").style.display = "none";
  currentProfile = null;
}

function updateProfileDisplay() {
  if (currentProfile === null) return;
  
  let hero = heroes[currentProfile];
  
  // Update header
  document.getElementById("profile-name").textContent = `${hero.name} (Area ${currentArea + 1})`;
  
  // Update base stats
  updateProfileStats(hero);
  
  // Update equipment
  updateProfileEquipment(hero);
  
  // Update skills
  updateProfileSkills(hero);
  
  // Update buy stats
  updateProfileBuyStats(hero);
}

function updateProfileStats(hero) {
  let html = `
    <div class="stat-row"><span class="stat-label">Max HP:</span> <span class="stat-value">${hero.maxHp}</span></div>
    <div class="stat-row"><span class="stat-label">Max Sta:</span> <span class="stat-value">${hero.maxSta}</span></div>
    <div class="stat-row"><span class="stat-label">Max Mana:</span> <span class="stat-value">${hero.maxMana}</span></div>
    <div class="stat-row"><span class="stat-label">P.ATK:</span> <span class="stat-value">${hero.patk}</span></div>
    <div class="stat-row"><span class="stat-label">M.ATK:</span> <span class="stat-value">${hero.matk}</span></div>
    <div class="stat-row"><span class="stat-label">P.DEF:</span> <span class="stat-value">${hero.pdef}</span></div>
    <div class="stat-row"><span class="stat-label">M.DEF:</span> <span class="stat-value">${hero.mdef}</span></div>
    <div class="stat-row"><span class="stat-label">P.SPD:</span> <span class="stat-value">${hero.pspd.toFixed(2)}</span></div>
  `;
  document.getElementById("profile-base-stats").innerHTML = html;
}

function updateProfileEquipment(hero) {
  let html = `<div style="color: #cbd5e1; font-size: 10px; margin-bottom: 8px; text-align: center;">
    📊 Equipment Slots: ${hero.equipment?.length || 0}/${hero.maxEquipSlots}
  </div>`;
  
  if (!hero.equipment || hero.equipment.length === 0) {
    html += '<p style="color: #94a3b8; font-size: 11px;">No equipment equipped</p>';
  } else {
    hero.equipment.forEach((equip, idx) => {
      let statsStr = equip.stats ? Object.entries(equip.stats).map(([k,v]) => `${k}+${v}`).join(", ") : "";
      let abilityStr = equip.ability && EquipmentAbilities[equip.ability] ? EquipmentAbilities[equip.ability].name : "";
      let enhanceLevel = hero.equipmentLevels && hero.equipmentLevels[equip.name] ? hero.equipmentLevels[equip.name] : 1;
      let enhanceLevelStr = enhanceLevel > 1 ? ` [+${enhanceLevel-1}]` : '';
      
      html += `
        <div class="equipment-option equipped" onclick="showItemDescription('${idx}', 'profile')">
          <div class="equipment-name">${equip.name}${enhanceLevelStr}</div>
          <div class="equipment-rarity">⭐ ${equip.rarity}</div>
          ${statsStr ? `<div style="color: #86efac; font-size: 10px;">${statsStr}</div>` : ''}
          ${abilityStr ? `<div style="color: #c084fc; font-size: 10px;">⚡ ${abilityStr}</div>` : ''}
          <button onclick="unequipFromProfile(${currentProfile}, ${idx})" style="width: 100%; padding: 4px; margin-top: 2px; font-size: 9px;">Unequip</button>
          <button onclick="openEnhanceUI(${currentProfile}, ${idx})" style="width: 100%; padding: 4px; margin-top: 2px; font-size: 9px; background: #7c3aed;">Enhance</button>
        </div>
      `;
    });
  }
  
  document.getElementById("profile-equipment-list").innerHTML = html;
}

function updateProfileSkills(hero) {
  let html = `<div style="color: #cbd5e1; font-size: 10px; margin-bottom: 8px; text-align: center;">
    📊 Skill Slots: ${hero.selectedSkills.length}/${hero.maxSkillSlots}
  </div>`;
  
  // Show available skills to select
  let allSkills = Object.values(Skills);
  
  allSkills.forEach((skill, idx) => {
    let isSelected = hero.selectedSkills.findIndex(s => s.name === skill.name) > -1;
    let className = `skill-option ${isSelected ? 'equipped' : ''}`;
    
    html += `
      <div class="${className}" onclick="selectSkillForProfile(${idx}); showSkillDescription('${skill.name}', '${skill.lore}', '${skill.resource}', ${skill.cost})">
        <div class="skill-name">${isSelected ? '✓ ' : ''}${skill.name}</div>
        <div class="skill-cost">${skill.resource} ${skill.cost} | CD: ${skill.cooldown}s</div>
      </div>
    `;
  });
  
  document.getElementById("profile-skills-list").innerHTML = html;
}

function showSkillDescription(name, lore, resource, cost) {
  document.getElementById("skill-desc-name").textContent = name;
  document.getElementById("skill-desc-text").innerHTML = `<strong>${resource} ${cost}</strong><br>${lore}`;
  document.getElementById("skill-description").style.display = "block";
}

function updateProfileBuyStats(hero) {
  let html = "";
  let statsTypes = [
    { key: 'maxHp', label: 'Max HP', symbol: '❤️' },
    { key: 'maxSta', label: 'Max Stamina', symbol: '⚡' },
    { key: 'maxMana', label: 'Max Mana', symbol: '✨' },
    { key: 'patk', label: 'P.ATK', symbol: '⚔️' },
    { key: 'matk', label: 'M.ATK', symbol: '🔮' },
    { key: 'pdef', label: 'P.DEF', symbol: '🛡️' },
    { key: 'mdef', label: 'M.DEF', symbol: '🔰' }
  ];
  
  document.getElementById("profile-exp").textContent = hero.exp;
  
  statsTypes.forEach(stat => {
    let price = getStatPrice(stat.key);
    let canBuy = hero.exp >= price;
    let priceClass = canBuy ? '' : 'unavailable';
    
    html += `
      <div class="buy-option" onclick="buyStatFromProfile(${currentProfile}, '${stat.key}')" style="${!canBuy ? 'opacity: 0.5; cursor: not-allowed;' : ''}">
        <div class="buy-stat-name">${stat.symbol} ${stat.label}</div>
        <div class="buy-stat-price ${priceClass}">Cost: ${price} EXP ${canBuy ? '✓' : '✗'}</div>
      </div>
    `;
  });
  
  document.getElementById("profile-buy-stats").innerHTML = html;
}

function showItemDescription(equipIdx, source) {
  if (currentProfile === null) return;
  
  let hero = heroes[currentProfile];
  if (!hero.equipment || !hero.equipment[equipIdx]) return;
  
  let equip = hero.equipment[equipIdx];
  let statsText = equip.stats ? Object.entries(equip.stats).map(([k,v]) => `${k} +${v}`).join(", ") : "No stat bonus";
  let abilityText = "";
  
  if (equip.ability && EquipmentAbilities[equip.ability]) {
    let ability = EquipmentAbilities[equip.ability];
    abilityText = `⚡ ${ability.name}: ${ability.description}`;
  }
  
  document.getElementById("item-desc-name").textContent = `${equip.name} (${equip.rarity})`;
  document.getElementById("item-desc-stats").innerHTML = `📊 ${statsText}`;
  document.getElementById("item-desc-ability").innerHTML = abilityText ? `${abilityText}` : "";
  document.getElementById("item-desc-lore").innerHTML = `"${equip.lore}"`;
  
  document.getElementById("item-description").style.display = "block";
}

function selectSkillForProfile(skillIdx) {
  if (currentProfile === null) return;
  
  if (!inRestMode) {
    alert("⚠️ Skills can only be changed during Rest!");
    return;
  }
  
  let hero = heroes[currentProfile];
  let allSkills = Object.values(Skills);
  let skill = allSkills[skillIdx];
  
  if (!skill) return;
  
  // Toggle skill selection with 4-slot limit
  let idx = hero.selectedSkills.findIndex(s => s.name === skill.name);
  if (idx > -1) {
    hero.selectedSkills.splice(idx, 1);
    log(`✓ ${hero.name} unselected ${skill.name}`);
  } else {
    if (hero.selectedSkills.length >= hero.maxSkillSlots) {
      alert(`⚠️ Maximum ${hero.maxSkillSlots} active skills reached! Remove one first.`);
      return;
    }
    hero.selectedSkills.push(skill);
    log(`✓ ${hero.name} selected ${skill.name}`);
  }
  
  updateProfileSkills(hero);
}

function unequipFromProfile(heroIdx, equipIdx) {
  if (!inRestMode) {
    alert("⚠️ Equipment can only be changed during Rest!");
    return;
  }
  
  let hero = heroes[heroIdx];
  if (!hero.equipment || !hero.equipment[equipIdx]) return;
  
  let equip = hero.equipment[equipIdx];
  
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
    if (hero.hp > hero.maxHp) hero.hp = hero.maxHp;
  }
  
  hero.equipment.splice(equipIdx, 1);
  updateProfileEquipment(hero);
  updateUI(hero);
  log(`✅ ${hero.name} unequipped ${equip.name}`);
}

function buyStatFromProfile(heroIdx, statType) {
  if (!inRestMode) {
    alert("⚠️ Stats can only be bought during Rest!");
    return;
  }
  
  let hero = heroes[heroIdx];
  let price = getStatPrice(statType);
  
  if (hero.exp < price) {
    alert(`❌ Not enough EXP! Need ${price}, have ${hero.exp}`);
    return;
  }
  
  // Deduct EXP
  hero.exp -= price;
  statPurchases[statType]++;
  
  // Increase stat
  if (statType === 'maxHp') {
    hero.maxHp += 10;
    hero.hp = Math.min(hero.hp + 10, hero.maxHp);
  } else if (statType === 'maxSta') {
    hero.maxSta += 8;
    hero.sta = Math.min(hero.sta + 8, hero.maxSta);
  } else if (statType === 'maxMana') {
    hero.maxMana += 8;
    hero.mana = Math.min(hero.mana + 8, hero.maxMana);
  } else if (statType === 'patk') {
    hero.patk += 3;
  } else if (statType === 'matk') {
    hero.matk += 3;
  } else if (statType === 'pdef') {
    hero.pdef += 2;
  } else if (statType === 'mdef') {
    hero.mdef += 2;
  }
  
  updateProfileDisplay();
  updateUI(hero);
  log(`🛠️ ${hero.name} bought ${statType}! (Cost: ${price} EXP)`);
}

// ===== EQUIPMENT ENHANCEMENT SYSTEM =====

function openEnhanceUI(heroIdx, equipIdx) {
  if (!inRestMode) {
    alert("⚠️ Equipment can only be enhanced during Rest!");
    return;
  }
  
  let hero = heroes[heroIdx];
  let equip = hero.equipment[equipIdx];
  
  if (!equip) return;
  
  let enhanceMessage = `
Enhance ${equip.name}?

You can burn another equipment to increase its stats.

Rarity Scaling:
• Common → +10% / +5% stats
• Uncommon → +15% / +8% stats
• Rare → +20% / +10% stats
• Epic → +25% / +12% stats
• Legendary → +30% / +15% stats

Choose an equipment to burn:
`;
  
  let options = ["Cancel"];
  hero.equipment.forEach((e, idx) => {
    if (idx !== equipIdx) {
      options.push(`${e.name} (${e.rarity})`);
    }
  });
  
  let choice = prompt(enhanceMessage + "\n" + options.join("\n"), "0");
  
  if (choice === null || choice === "0" || choice === "Cancel") return;
  
  let chosenIdx = parseInt(choice) - 1;
  if (isNaN(chosenIdx) || chosenIdx < 0) {
    // Try to find by name
    chosenIdx = hero.equipment.findIndex((e, idx) => {
      return idx !== equipIdx && (e.name + " (" + e.rarity + ")") === choice;
    });
  }
  
  if (chosenIdx < 0 || chosenIdx >= hero.equipment.length || chosenIdx === equipIdx) {
    alert("Invalid selection");
    return;
  }
  
  enhanceEquipment(heroIdx, equipIdx, chosenIdx);
}

function getEnhanceScaling(rarity) {
  // Returns [statScaling, abilityScaling]
  const scaling = {
    "Common": [0.1, 0.05],
    "Uncommon": [0.15, 0.08],
    "Rare": [0.2, 0.1],
    "Epic": [0.25, 0.12],
    "Legendary": [0.3, 0.15]
  };
  return scaling[rarity] || [0.1, 0.05];
}

function enhanceEquipment(heroIdx, equipToEnhanceIdx, equipToConsume) {
  let hero = heroes[heroIdx];
  let mainEquip = hero.equipment[equipToEnhanceIdx];
  let consumeEquip = hero.equipment[equipToConsume];
  
  if (!mainEquip || !consumeEquip) return;
  
  // Calculate enhancement bonus
  let [statScaling, abilityScaling] = getEnhanceScaling(consumeEquip.rarity);
  
  // Initialize enhancement level
  if (!hero.equipmentLevels) hero.equipmentLevels = {};
  if (!hero.equipmentLevels[mainEquip.name]) hero.equipmentLevels[mainEquip.name] = 1;
  
  // Boost main equipment stats
  if (mainEquip.stats) {
    Object.keys(mainEquip.stats).forEach(stat => {
      let currentValue = mainEquip.stats[stat];
      let boost = Math.max(1, Math.floor(currentValue * statScaling));
      mainEquip.stats[stat] += boost;
      log(`⚡ ${mainEquip.name} ${stat} +${boost} (Enhanced with ${consumeEquip.name})`);
    });
  }
  
  // Increment enhancement level
  hero.equipmentLevels[mainEquip.name]++;
  
  // Remove consumed equipment
  hero.equipment.splice(equipToConsume, 1);
  
  log(`🔥 ${hero.name} burned ${consumeEquip.name} to enhance ${mainEquip.name}! [+${hero.equipmentLevels[mainEquip.name] - 1}]`);
  
  // Update UI
  updateProfileDisplay();
  updateUI(hero);
}

// ===== TRANSITION CHOICE SYSTEM (eqChoice & skChoice) =====

let transitionState = {
  selectedEquip: null,
  selectedSkill: null,
  equipmentOptions: [],
  skillOptions: []
};

// ===== SETTINGS MANAGEMENT =====

function openSettings() {
  document.getElementById("settings-panel").classList.add("active");
}

function closeSettings() {
  document.getElementById("settings-panel").classList.remove("active");
}

function saveSettings() {
  gameSettings.autoEquipSelect = document.getElementById("auto-eq-select").checked;
  gameSettings.autoEquipPause = document.getElementById("auto-eq-pause").checked;
  gameSettings.autoSkillSelect = document.getElementById("auto-sk-select").checked;
  gameSettings.autoSkillPause = document.getElementById("auto-sk-pause").checked;
  
  // Show/hide pause options based on auto-select
  document.getElementById("auto-eq-pause-label").style.display = gameSettings.autoEquipSelect ? "flex" : "none";
  document.getElementById("auto-sk-pause-label").style.display = gameSettings.autoSkillSelect ? "flex" : "none";
  
  localStorage.setItem('gameSettings', JSON.stringify(gameSettings));
  log("⚙️ Settings saved!");
}

function initializeSettings() {
  loadSettings();
  
  // Set checkboxes to saved values
  document.getElementById("auto-eq-select").checked = gameSettings.autoEquipSelect;
  document.getElementById("auto-eq-pause").checked = gameSettings.autoEquipPause;
  document.getElementById("auto-sk-select").checked = gameSettings.autoSkillSelect;
  document.getElementById("auto-sk-pause").checked = gameSettings.autoSkillPause;
  
  // Show/hide pause options
  document.getElementById("auto-eq-pause-label").style.display = gameSettings.autoEquipSelect ? "flex" : "none";
  document.getElementById("auto-sk-pause-label").style.display = gameSettings.autoSkillSelect ? "flex" : "none";
}

function toggleBattleLog() {
  let logElement = document.getElementById("battle-log");
  if (logElement.style.display === "none" || logElement.style.display === "") {
    logElement.style.display = "block";
  } else {
    logElement.style.display = "none";
  }
}

function autoApplyTransitionChoices() {
  // Generate choices and automatically select based on settings
  let equipOptions = generateEquipmentChoices();
  let skillOptions = generateSkillChoices();
  
  if (gameSettings.autoEquipSelect && equipOptions.length > 0) {
    transitionState.selectedEquip = equipOptions[0];
    log(`✓ Auto-selected equipment: ${transitionState.selectedEquip.name}`);
  }
  
  if (gameSettings.autoSkillSelect && skillOptions.length > 0) {
    transitionState.selectedSkill = skillOptions[0];
    log(`✓ Auto-selected skill: ${transitionState.selectedSkill.name}`);
  }
  
  applyTransitionChoices();
}

function generateEquipmentChoices() {
  // Get all equipped equipment from all heroes
  let allEquipping = [];
  heroes.forEach(hero => {
    if (hero.equipment && hero.equipment.length > 0) {
      hero.equipment.forEach(eq => {
        allEquipping.push({ ...eq });
      });
    }
  });
  
  // Also include newly available equipment from rewards
  if (pendingRewards && pendingRewards.length > 0) {
    pendingRewards.forEach(itemName => {
      let found = false;
      for (let rarity in EquipmentList) {
        if (found) break;
        for (let item of EquipmentList[rarity]) {
          if (item.name === itemName) {
            allEquipping.push({ ...item });
            found = true;
            break;
          }
        }
      }
    });
  }
  
  // Pick 3 random equipment
  let choices = [];
  for (let i = 0; i < 3 && allEquipping.length > 0; i++) {
    let idx = Math.floor(Math.random() * allEquipping.length);
    choices.push(allEquipping[idx]);
    allEquipping.splice(idx, 1);
  }
  
  return choices;
}

function generateSkillChoices() {
  // Get all available skills from all heroes' learnedSkills/allSkills
  let allSkills = Object.values(Skills);
  
  if (allSkills.length < 3) return allSkills;
  
  let choices = [];
  let used = new Set();
  
  for (let i = 0; i < 3; i++) {
    let idx;
    do {
      idx = Math.floor(Math.random() * allSkills.length);
    } while (used.has(idx));
    
    choices.push(allSkills[idx]);
    used.add(idx);
  }
  
  return choices;
}

function showTransitionChoices(title, rewardText) {
  // Reset state
  transitionState.selectedEquip = null;
  transitionState.selectedSkill = null;
  
  // Generate choices
  transitionState.equipmentOptions = generateEquipmentChoices();
  transitionState.skillOptions = generateSkillChoices();
  
  // Auto-select equipment if setting enabled
  if (gameSettings.autoEquipSelect && transitionState.equipmentOptions.length > 0) {
    transitionState.selectedEquip = transitionState.equipmentOptions[0];
    log(`✓ Auto-selected equipment: ${transitionState.selectedEquip.name}`);
  }
  
  // Auto-select skill if setting enabled
  if (gameSettings.autoSkillSelect && transitionState.skillOptions.length > 0) {
    transitionState.selectedSkill = transitionState.skillOptions[0];
    log(`✓ Auto-selected skill: ${transitionState.selectedSkill.name}`);
  }
  
  // Update header
  document.getElementById("transition-title").textContent = title;
  document.getElementById("transition-rewards").textContent = rewardText;
  
  // Display equipment choices
  let eqHtml = "";
  transitionState.equipmentOptions.forEach((equip, idx) => {
    let statsStr = equip.stats ? Object.entries(equip.stats).map(([k,v]) => `${k}+${v}`).join(", ") : "";
    let abilityStr = equip.ability && EquipmentAbilities[equip.ability] ? EquipmentAbilities[equip.ability].name : "";
    let isSelected = transitionState.selectedEquip && transitionState.selectedEquip.name === equip.name ? " selected" : "";
    
    eqHtml += `
      <div class="equipment-option${isSelected}" onclick="selectEquipmentChoice(${idx})" style="cursor: pointer; border-left: 4px solid #3b82f6;">
        <div class="equipment-name">${equip.name}</div>
        <div class="equipment-rarity">⭐ ${equip.rarity}</div>
        ${statsStr ? `<div style="color: #86efac; font-size: 10px;">${statsStr}</div>` : ''}
        ${abilityStr ? `<div style="color: #c084fc; font-size: 10px;">⚡ ${abilityStr}</div>` : ''}
      </div>
    `;
  });
  document.getElementById("eq-choice-list").innerHTML = eqHtml;
  
  // Display skill choices
  let skHtml = "";
  transitionState.skillOptions.forEach((skill, idx) => {
    let isSelected = transitionState.selectedSkill && transitionState.selectedSkill.name === skill.name ? " selected" : "";
    skHtml += `
      <div class="skill-option${isSelected}" onclick="selectSkillChoice(${idx})" style="cursor: pointer; border-left: 4px solid #8b5cf6;">
        <div class="skill-name">${skill.name}</div>
        <div class="skill-cost">${skill.resource} ${skill.cost} | CD: ${skill.cooldown}s</div>
      </div>
    `;
  });
  document.getElementById("sk-choice-list").innerHTML = skHtml;
  
  // Show choice content, hide normal content
  document.getElementById("profile-normal-content").style.display = "none";
  document.getElementById("profile-choice-content").classList.add("show-choices");
  
  updateContinueButtonState();
}

function selectEquipmentChoice(idx) {
  transitionState.selectedEquip = transitionState.equipmentOptions[idx];
  
  // Visual feedback
  document.querySelectorAll("#eq-choice-list .equipment-option").forEach((el, i) => {
    if (i === idx) {
      el.style.background = "rgba(59, 130, 246, 0.3)";
      el.style.borderLeft = "4px solid #60a5fa";
    } else {
      el.style.background = "rgba(51, 65, 85, 0.6)";
      el.style.borderLeft = "4px solid #3b82f6";
    }
  });
  
  log(`✓ Selected equipment: ${transitionState.selectedEquip.name}`);
  updateContinueButtonState();
}

function selectSkillChoice(idx) {
  transitionState.selectedSkill = transitionState.skillOptions[idx];
  
  // Visual feedback
  document.querySelectorAll("#sk-choice-list .skill-option").forEach((el, i) => {
    if (i === idx) {
      el.style.background = "rgba(139, 92, 246, 0.3)";
      el.style.borderLeft = "4px solid #a78bfa";
    } else {
      el.style.background = "rgba(51, 65, 85, 0.6)";
      el.style.borderLeft = "4px solid #8b5cf6";
    }
  });
  
  log(`✓ Selected skill: ${transitionState.selectedSkill.name}`);
  updateContinueButtonState();
}

function updateContinueButtonState() {
  let btn = document.getElementById("continue-btn");
  if (transitionState.selectedEquip && transitionState.selectedSkill) {
    btn.disabled = false;
    btn.style.background = "#10b981";
    btn.style.color = "#fff";
  } else {
    btn.disabled = true;
    btn.style.background = "#64748b";
    btn.style.color = "#cbd5e1";
  }
}

function applyTransitionChoices() {
  // Give selected equipment to random hero
  if (transitionState.selectedEquip) {
    let lucky = random(heroes);
    if (giveEquipmentToHero(lucky, transitionState.selectedEquip)) {
      log(`🎁 ${lucky.name} received ${transitionState.selectedEquip.name}!`);
    }
  }
  
  // Give selected skill to random hero
  if (transitionState.selectedSkill) {
    let lucky = random(heroes);
    // Check if hero already has this skill
    if (lucky.selectedSkills && lucky.selectedSkills.findIndex(s => s.name === transitionState.selectedSkill.name) > -1) {
      // Strengthen the skill (upgrade scaling)
      lucky.skillScaling = lucky.skillScaling || {};
      lucky.skillScaling[transitionState.selectedSkill.name] = (lucky.skillScaling[transitionState.selectedSkill.name] || 1) + 0.1;
      log(`📚 ${lucky.name} strengthened ${transitionState.selectedSkill.name}! [x${(lucky.skillScaling[transitionState.selectedSkill.name]).toFixed(1)}]`);
    } else {
      // Add skill to hero's available skills if not already there
      if (!lucky.learnedSkills) lucky.learnedSkills = [];
      lucky.learnedSkills.push(transitionState.selectedSkill);
      log(`📚 ${lucky.name} learned ${transitionState.selectedSkill.name}!`);
    }
  }
}