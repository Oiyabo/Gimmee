// ===== CHARACTERS =====
const heroes = [
  new Character("Knight", 130, 18, 6, 0.9, "A", [
    Skills.knightSlash,
    Skills.shieldBarrier,
  ]),
  new Character("Priest", 90, 10, 3, 1.1, "A", [
    Skills.holyHeal,
    Skills.resurrect,
  ]),
  new Character("Mage", 80, 26, 2, 1.2, "A", [
    Skills.inferno,
    Skills.lightingStrike,
  ]),
  new Character("Rogue", 85, 22, 2, 1.4, "A", [
    Skills.quickStrike,
    Skills.dodge,
  ]),
  new Character("Paladin", 140, 16, 8, 0.85, "A", [
    Skills.heavySwing,
    Skills.taunt,
  ]),
  new Character("Archer", 95, 20, 4, 1.15, "A", [
    Skills.preciseShot,
    Skills.heavyShot,
  ]),
];