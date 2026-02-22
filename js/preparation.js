class Character {
  static nextId = 1;
  
  constructor(name, hp, atk, def, spd, team, skills) {
    this.id = Character.nextId++;
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
    // Type classification: team 'A' = heroes, others = monsters
    this.type = team === 'A' ? 'hero' : 'monster';
    this.isDead = false;
    this.level = 1;
  }
  isAlive() {
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
    this.isDead = this.hp <= 0;
    updateHPUI(this);
    updateDeadUI(this);
    if (typeof updateCharacterDisplay === 'function') {
      updateCharacterDisplay(this);
    }
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
