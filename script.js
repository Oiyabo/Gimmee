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
    this.element = null;
    this.hpFill = null;
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

let currentSet = 0;
let petualanganAktif = false;

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

// ===== SKILL DEFINITIONS =====
const Skills = {
  // === KNIGHT SKILLS ===
  knightSlash: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let dmg = target.takeDamage(Math.floor(self.atk * 1.2));
    log(`${self.name} uses Knight Slash on ${target.name} (${dmg})`);
  },
  shieldBarrier: (self, allies) => {
    let target = random(alive(allies));
    if (!target) return;
    target.status.shield = true;
    updateStatusUI(target);
    log(`${self.name} casts Shield Barrier on ${target.name}`);
  },
  moonswipe: (self, allies, enemies) => {
    let targets = alive(enemies).slice(0, 3);
    targets.forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 0.8));
      log(`${self.name} uses Moonswipe on ${e.name} (${dmg})`);
    });
  },
  gauntletPunch: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let dmg = target.takeDamage(Math.floor(self.atk * 1.3));
    target.status.bleeding = 3;
    updateStatusUI(target);
    log(`${self.name} uses Gauntlet Punch on ${target.name} (${dmg} + bleeding)`);
  },

  // === PRIEST SKILLS ===
  holyHeal: (self, allies) => {
    let target = random(alive(allies));
    if (!target) return;
    target.heal(Math.floor(self.atk * 1.5));
    log(`${self.name} casts Holy Heal on ${target.name} (+${Math.floor(self.atk * 1.5)})`);
  },
  resurrect: (self, allies, enemies) => {
    let deadAllies = allies.filter((a) => !a.isAlive());
    if (deadAllies.length === 0) return;
    let target = random(deadAllies);
    target.hp = Math.floor(target.maxHp * 0.5);
    updateHPUI(target);
    updateDeadUI(target);
    log(`${self.name} resurrects ${target.name} (HP +${Math.floor(target.maxHp * 0.5)})`);
  },
  divinePressure: (self, allies, enemies) => {
    let targets = alive(enemies).slice(0, 3);
    targets.forEach((e) => {
      e.status.stun = 1;
      updateStatusUI(e);
      log(`${self.name} casts Divine Pressure on ${e.name} (stunned)`);
    });
  },
  divineRaise: (self, allies) => {
    let target = random(alive(allies));
    if (!target) return;
    target.status.buffed = 4;
    target.status.buffStats = { atk: 5, def: 3, spd: 0.15 };
    target.atk += 5;
    target.def += 3;
    target.spd += 0.15;
    updateStatusUI(target);
    log(`${self.name} casts Divine Raise on ${target.name} (ATK +5, DEF +3, SPD +0.15)`);
  },

  // === MAGE SKILLS ===
  inferno: (self, allies, enemies) => {
    alive(enemies).forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * 1.3));
      e.status.burn = 3;
      updateStatusUI(e);
      log(`${self.name} uses Inferno on ${e.name} (${dmg} + burn)`);
    });
  },
  lightingStrike: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let dmg = target.takeDamage(Math.floor(self.atk * 1.1));
    if (Math.random() < 0.5) {
      target.status.paralyzed = 2;
      updateStatusUI(target);
      log(`${self.name} uses Lighting Strike on ${target.name} (${dmg} + paralyzed)`);
    } else {
      log(`${self.name} uses Lighting Strike on ${target.name} (${dmg})`);
    }
  },
  airCutting: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let dmg1 = target.takeDamage(Math.floor(self.atk * 0.5));
    let dmg2 = target.takeDamage(Math.floor(self.atk * 1.0));
    let dmg3 = target.takeDamage(Math.floor(self.atk * 1.5));
    log(`${self.name} uses Air Cutting on ${target.name} (${dmg1} + ${dmg2} + ${dmg3})`);
  },

  // === ROGUE SKILLS ===
  quickStrike: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let dmg = target.takeDamage(Math.floor(self.spd * 8));
    log(`${self.name} uses Quick Strike on ${target.name} (${dmg})`);
  },
  dodge: (self, allies) => {
    self.status.critical = 2;
    updateStatusUI(self);
    log(`${self.name} uses Dodge (avoid next attack)`);
  },
  targetedSlice: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let dmg = target.takeDamage(Math.floor(self.atk * (target.hp / target.maxHp)));
    log(`${self.name} uses Targeted Slice on ${target.name} (${dmg})`);
  },
  gamblingSlice: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    if (Math.random() < 0.5) {
      let dmg = target.takeDamage(Math.floor(self.atk * 2.5));
      log(`${self.name} uses Gambling Slice on ${target.name} (CRITICAL! ${dmg})`);
    } else {
      log(`${self.name} uses Gambling Slice on ${target.name} (FAILED!)`);
    }
  },

  // === PALADIN SKILLS ===
  heavySwing: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let dmg = target.takeDamage(Math.floor((self.maxHp * 0.15) + self.atk));
    log(`${self.name} uses Heavy Swing on ${target.name} (${dmg})`);
  },
  taunt: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    target.status.taunt = true;
    updateStatusUI(target);
    log(`${self.name} taunts ${target.name}`);
  },
  martyr: (self, allies, enemies) => {
    let totalDmg = 0;
    alive(allies).forEach((a) => {
      if (a !== self && a.status.buffed > 0) totalDmg += 10;
    });
    if (totalDmg > 0) self.status.buffed = 2;
    updateStatusUI(self);
    log(`${self.name} becomes Martyr! (Allies protected)`);
  },
  parry: (self, allies, enemies) => {
    self.status.shield = true;
    updateStatusUI(self);
    log(`${self.name} uses Parry (block and reflect)`);
  },

  // === ARCHER SKILLS ===
  preciseShot: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let dmg = target.takeDamage(Math.floor(self.atk * 1.4));
    log(`${self.name} uses Precise Shot on ${target.name} (${dmg})`);
  },
  heavyShot: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let dmg = target.takeDamage(Math.floor(self.atk + target.def * 0.8));
    log(`${self.name} uses Heavy Shot on ${target.name} (${dmg})`);
  },
  fastShot: (self, allies, enemies) => {
    let target = random(alive(enemies));
    if (!target) return;
    let dmg = target.takeDamage(Math.floor(self.atk * (target.maxHp / 150)));
    log(`${self.name} uses Fast Shot on ${target.name} (${dmg})`);
  },
  arrowsRain: (self, allies, enemies) => {
    let targets = alive(enemies);
    targets.forEach((e) => {
      let dmg = e.takeDamage(Math.floor(self.atk * (e.spd / 2)));
      log(`${self.name} uses Arrows Rain on ${e.name} (${dmg})`);
    });
  },
};

// ===== CHARACTERS =====
const heroes = [
  new Character("Knight", 130, 18, 6, 0.9, "A", [
    Skills.knightSlash,
    Skills.shieldBarrier,
    Skills.moonswipe,
    Skills.gauntletPunch,
  ]),
  new Character("Priest", 90, 10, 3, 1.1, "A", [
    Skills.holyHeal,
    Skills.resurrect,
    Skills.divinePressure,
    Skills.divineRaise,
  ]),
  new Character("Mage", 80, 26, 2, 1.2, "A", [
    Skills.inferno,
    Skills.lightingStrike,
    Skills.airCutting,
  ]),
  new Character("Rogue", 85, 22, 2, 1.4, "A", [
    Skills.quickStrike,
    Skills.dodge,
    Skills.targetedSlice,
    Skills.gamblingSlice,
  ]),
  new Character("Paladin", 140, 16, 8, 0.85, "A", [
    Skills.heavySwing,
    Skills.taunt,
    Skills.martyr,
    Skills.parry,
  ]),
  new Character("Archer", 95, 20, 4, 1.15, "A", [
    Skills.preciseShot,
    Skills.heavyShot,
    Skills.fastShot,
    Skills.arrowsRain,
  ]),
];

// ===== MONSTER GENERATOR =====
const MonsterTemplates = {
  Orc: {
    hp: 150,
    atk: 20,
    def: 5,
    spd: 0.8,
    skills: [Skills.knightSlash, Skills.gauntletPunch],
  },
  Warlock: {
    hp: 100,
    atk: 18,
    def: 3,
    spd: 1.0,
    skills: [Skills.lightingStrike, Skills.inferno],
  },
  Imp: {
    hp: 70,
    atk: 22,
    def: 2,
    spd: 1.6,
    skills: [Skills.quickStrike, Skills.quickStrike],
  },
};

function generateRandomMonster(setNumber) {
  let templates = Object.entries(MonsterTemplates);
  let [name, template] = random(templates);
  
  // Scale stats berdasarkan set number (difficulty increases)
  let scaling = 1 + setNumber * 0.15;
  
  let monster = new Character(
    name,
    Math.floor(template.hp * scaling),
    Math.floor(template.atk * scaling),
    Math.floor(template.def * scaling),
    template.spd * (1 + setNumber * 0.05),
    "B",
    template.skills
  );
  
  // Simpan original stats untuk reset
  monster.maxHp = monster.hp;
  monster.origAtk = monster.atk;
  monster.origDef = monster.def;
  monster.origSpd = monster.spd;
  
  return monster;
}

function generateMonsterTeam(setNumber) {
  let jumlahMonster = 2 + Math.floor(setNumber / 2); // 2, 2, 3, 3, 4, dst
  let team = [];
  for (let i = 0; i < jumlahMonster; i++) {
    team.push(generateRandomMonster(setNumber));
  }
  return team;
}

let monsters = [];

// ===== UI =====
function createUI(char, container) {
  let div = document.createElement("div");
  div.className = "character";
  div.innerHTML = `<strong>${char.name}</strong>
<div class="hp-bar"><div class="hp-fill"></div></div>
<div class="stats"></div>
<div class="status"></div>`;
  char.element = div;
  char.hpFill = div.querySelector(".hp-fill");
  container.appendChild(div);
}

function updateHeroStats() {
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

function showShop() {
  let shop = document.getElementById("shop-modal");
  shop.style.display = "flex";
  updateHeroStats();
}

function closeShop() {
  document.getElementById("shop-modal").style.display = "none";
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
  
  updateHeroStats();
  log(`${hero.name} diperkuat! (${statType.toUpperCase()} +1)`);
}

function startNextSet() {
  closeShop();
  
  // Heal 25% untuk semua hero
  heroes.forEach((h) => {
    h.hp = Math.floor(h.maxHp * 0.25) + h.hp;
    if (h.hp > h.maxHp) h.hp = h.maxHp;
    updateUI(h);
  });
  
  // Generate monster baru
  monstersContainer.innerHTML = "";
  monsters = generateMonsterTeam(currentSet);
  monsters.forEach((m) => createUI(m, monstersContainer));
  
  // Mulai battle
  running = true;
  lastTime = performance.now();
  log(`=== SET ${currentSet + 1} START ===`);
  requestAnimationFrame(loop);
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
}

// ===== GAME LOOP =====
let running = false,
  lastTime = 0;

function applyStatus(char, delta) {
  // Apply burn damage
  if (char.status.burn > 0) {
    let prevBurn = char.status.burn;
    char.status.burn -= delta;
    if (Math.floor(char.status.burn * 10) % 10 === 0) {
      let dmg = char.takeDamage(3);
      if (dmg > 0) log(`${char.name} takes burn damage (${dmg})`);
    }
    if (prevBurn > 0 && char.status.burn <= 0) {
      updateStatusUI(char);
    }
  }

  // Apply bleeding damage
  if (char.status.bleeding > 0) {
    let prevBleed = char.status.bleeding;
    char.status.bleeding -= delta;
    if (Math.floor(char.status.bleeding * 10) % 10 === 0) {
      let dmg = char.takeDamage(2);
      if (dmg > 0) log(`${char.name} takes bleeding damage (${dmg})`);
    }
    if (prevBleed > 0 && char.status.bleeding <= 0) {
      updateStatusUI(char);
    }
  }

  // Apply stun
  if (char.status.stun > 0) {
    char.status.stun -= delta;
    if (char.status.stun <= 0) {
      updateStatusUI(char);
    }
  }

  // Apply paralysis
  if (char.status.paralyzed > 0) {
    char.status.paralyzed -= delta;
    if (char.status.paralyzed <= 0) {
      updateStatusUI(char);
    }
  }

  // Remove buff and restore stats
  if (char.status.buffed > 0) {
    char.status.buffed -= delta;
    if (char.status.buffed <= 0) {
      char.atk -= char.status.buffStats.atk;
      char.def -= char.status.buffStats.def;
      char.spd -= char.status.buffStats.spd;
      updateStatusUI(char);
    }
  }
}

function loop(ts) {
  if (!running) return;
  let delta = (ts - lastTime) / 1000;
  lastTime = ts;
  let aliveHeroes = alive(heroes);
  let aliveMonsters = alive(monsters);
  
  // Check battle end conditions
  if (aliveHeroes.length === 0) {
    // GAME OVER - Heroes semua mati
    running = false;
    petualanganAktif = false;
    log("💀 GAME OVER - Hero Team Defeated!");
    log(`Game selesai di set ${currentSet + 1}. Klik Start untuk restart dari set 1.`);
    document.getElementById("start-btn").disabled = false;
    return;
  }
  
  if (aliveMonsters.length === 0) {
    // VICTORY - Seluruh monster team terkalahkan
    running = false;
    currentSet++;
    log(`🎉 Set ${currentSet} Complete! Semua monster kalah!`);
    
    // Give stat points
    let spPoints = 5 + currentSet * 2;
    heroes.forEach((h) => {
      if (!h.statsPoints) h.statsPoints = 0;
      h.statsPoints += spPoints;
    });
    log(`+${spPoints} Stat Points untuk setiap hero!`);
    
    // Show shop
    document.getElementById("set-info").textContent = `Set ${currentSet} Complete!`;
    showShop();
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

function reset() {
  battleLog.innerHTML = "";
  currentSet = 0;
  petualanganAktif = true;
  
  // Reset heroes
  heroes.forEach((c) => {
    c.hp = c.maxHp;
    c.atk = c.origAtk;
    c.def = c.origDef;
    c.spd = c.origSpd;
    c.cooldown = 0;
    c.statsPoints = 0;
    c.status = { 
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
    c.element.classList.remove("dead");
    updateUI(c);
  });
  
  // Generate first monster set
  monstersContainer.innerHTML = "";
  monsters = generateMonsterTeam(currentSet);
  monsters.forEach((m) => createUI(m, monstersContainer));
  
  document.getElementById("set-info").textContent = `Set ${currentSet + 1}`;
  log("=== ADVENTURE START ===");
}

function startBattle() {
  reset();
  running = true;
  lastTime = performance.now();
  log("Battle Started!");
  document.getElementById("start-btn").disabled = true;
  requestAnimationFrame(loop);
}

heroes.forEach((h) => createUI(h, heroesContainer));
reset();
