// ===== CHARACTERS =====
const heroes = [
  new Character("Knight", {
    hp: 130, sta: 100, mana: 30,
    patk: 18, matk: 8, tatt: 2,
    pdef: 10, mdef: 5,
    pspd: 0.9, mspd: 0.5,
    ccrit: 0.15, dcrit: 1.5
  }, "A", [
    Skills.knightSlash,
    Skills.shieldBarrier,
  ]),
  
  new Character("Priest", {
    hp: 90, sta: 60, mana: 150,
    patk: 10, matk: 16, tatt: 0,
    pdef: 5, mdef: 12,
    pspd: 0.6, mspd: 1.1,
    ccrit: 0.08, dcrit: 1.3
  }, "A", [
    Skills.holyHeal,
    Skills.resurrect,
  ]),
  
  new Character("Mage", {
    hp: 80, sta: 50, mana: 180,
    patk: 6, matk: 26, tatt: 1,
    pdef: 3, mdef: 14,
    pspd: 0.5, mspd: 1.2,
    ccrit: 0.12, dcrit: 1.8
  }, "A", [
    Skills.inferno,
    Skills.lightingStrike,
  ]),
  
  new Character("Rogue", {
    hp: 85, sta: 120, mana: 40,
    patk: 22, matk: 10, tatt: 3,
    pdef: 6, mdef: 4,
    pspd: 1.4, mspd: 0.7,
    ccrit: 0.25, dcrit: 2.0
  }, "A", [
    Skills.quickStrike,
    Skills.dodge,
  ]),
  
  new Character("Paladin", {
    hp: 140, sta: 110, mana: 50,
    patk: 16, matk: 10, tatt: 4,
    pdef: 14, mdef: 8,
    pspd: 0.85, mspd: 0.6,
    ccrit: 0.12, dcrit: 1.6
  }, "A", [
    Skills.heavySwing,
    Skills.taunt,
  ]),
  
  new Character("Archer", {
    hp: 95, sta: 130, mana: 35,
    patk: 20, matk: 8, tatt: 2,
    pdef: 7, mdef: 4,
    pspd: 1.15, mspd: 0.65,
    ccrit: 0.20, dcrit: 1.7
  }, "A", [
    Skills.preciseShot,
    Skills.heavyShot,
  ]),
];
