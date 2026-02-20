// ===== HERO DEFINITIONS =====
const HERO_TEMPLATES = {
  knight: {
    name: "Knight",
    stats: {
      maxHp: 130, maxSta: 60, maxMana: 20,
      patk: 18, matk: 8, pdef: 8, mdef: 4,
      tatt: 0, pspd: 0.9, mspd: 0.8,
      ccrit: 0.08, dcrit: 1.3
    },
    initialSkills: ["knightSlash", "shieldBarrier", "moonswipe", "heavySwing"]
  },
  priest: {
    name: "Priest",
    stats: {
      maxHp: 90, maxSta: 40, maxMana: 80,
      patk: 8, matk: 14, pdef: 4, mdef: 8,
      tatt: 0, pspd: 0.9, mspd: 1.2,
      ccrit: 0.05, dcrit: 1.2
    },
    initialSkills: ["holyHeal", "blessings", "resurrect", "divinePressure"]
  },
  mage: {
    name: "Mage",
    stats: {
      maxHp: 70, maxSta: 30, maxMana: 100,
      patk: 6, matk: 26, pdef: 2, mdef: 6,
      tatt: 0, pspd: 0.8, mspd: 1.3,
      ccrit: 0.10, dcrit: 1.5
    },
    initialSkills: ["inferno", "lightingStrike", "airCutting", "spellShield"]
  },
  rogue: {
    name: "Rogue",
    stats: {
      maxHp: 85, maxSta: 80, maxMana: 30,
      patk: 24, matk: 10, pdef: 3, mdef: 3,
      tatt: 0, pspd: 1.4, mspd: 0.9,
      ccrit: 0.25, dcrit: 1.8
    },
    initialSkills: ["quickStrike", "evasion", "shadowStrike", "targetedSlice"]
  },
  paladin: {
    name: "Paladin",
    stats: {
      maxHp: 150, maxSta: 70, maxMana: 50,
      patk: 16, matk: 12, pdef: 10, mdef: 10,
      tatt: 0, pspd: 0.85, mspd: 0.95,
      ccrit: 0.12, dcrit: 1.4
    },
    initialSkills: ["heavySwing", "taunt", "martyr", "parry"]
  },
  archer: {
    name: "Archer",
    stats: {
      maxHp: 95, maxSta: 75, maxMana: 40,
      patk: 22, matk: 11, pdef: 4, mdef: 4,
      tatt: 0, pspd: 1.15, mspd: 1.0,
      ccrit: 0.20, dcrit: 1.6
    },
    initialSkills: ["preciseShot", "multiShot", "piercingShot", "evasion"]
  }
};

// ===== HERO INITIALIZATION =====
let heroes = [];

function initializeHeroes() {
  heroes = [];
  for (let heroKey in HERO_TEMPLATES) {
    let template = HERO_TEMPLATES[heroKey];
    let hero = new Character(template.name, template.stats, "A", []);
    
    // Initialize active skills (add them to the skillbar if available)
    let skillNames = template.initialSkills;
    let skillsToAdd = [];
    for (let skillName of skillNames) {
      if (Skills[skillName]) {
        skillsToAdd.push(Skills[skillName]);
      }
    }
    hero.setActiveSkills(skillsToAdd);
    heroes.push(hero);
  }
  return heroes;
}

// Auto-initialize heroes when script loads
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initializeHeroes);
}