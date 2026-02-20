// ===== MONSTER TEMPLATES ORGANIZED BY AREA =====
const BaseAreas = ["Forest", "Cavern", "Volcanic", "Frozen", "Abyss"];
const BossAreas = ["Forest", "Cavern", "Volcanic", "Frozen", "Abyss"];

function getAreaName(areaIndex) {
  if (areaIndex < 5) {
    return BaseAreas[areaIndex];
  } else {
    // Mixed areas after the 5 base areas
    let mixNum = areaIndex - 4;
    return `Mixed ${mixNum}`;
  }
}

function getAreaMonstersTemplate(areaName) {
  if (AreaMonsters[areaName]) {
    return AreaMonsters[areaName];
  }
  
  // For mixed areas, combine monsters from different areas
  if (areaName.startsWith("Mixed")) {
    return getMixedAreaMonsters();
  }
  
  return AreaMonsters.Forest; // fallback
}

function getMixedAreaMonsters() {
  let mixed = {};
  let sourceAreas = [
    random([BaseAreas[0], BaseAreas[1]]),
    random([BaseAreas[2], BaseAreas[3], BaseAreas[4]])
  ];
  
  // Take 3 monsters from first area
  let area1Monsters = Object.entries(AreaMonsters[sourceAreas[0]]).slice(0, 3);
  area1Monsters.forEach(([name, stats]) => {
    mixed[name] = stats;
  });
  
  // Take 2 monsters from second area
  let area2Monsters = Object.entries(AreaMonsters[sourceAreas[1]]).slice(0, 2);
  area2Monsters.forEach(([name, stats]) => {
    mixed[name] = stats;
  });
  
  return mixed;
}

const AreaMonsters = {
  Forest: {
    GoblinNormal: {
      hp: 60,
      atk: 14,
      def: 2,
      spd: 1.1,
      skills: [Skills.knightSlash, Skills.quickStrike],
    },
    GoblinSpear: {
      hp: 55,
      atk: 16,
      def: 1,
      spd: 1.4,
      skills: [Skills.quickStrike, Skills.targetedSlice],
    },
    WolfGray: {
      hp: 90,
      atk: 19,
      def: 4,
      spd: 1.3,
      skills: [Skills.quickStrike, Skills.targetedSlice],
    },
    WolfDire: {
      hp: 130,
      atk: 24,
      def: 6,
      spd: 1.2,
      skills: [Skills.heavySwing, Skills.quickStrike, Skills.moonswipe],
    },
    Spider: {
      hp: 75,
      atk: 18,
      def: 3,
      spd: 1.5,
      skills: [Skills.quickStrike, Skills.targetedSlice],
    },
  },

  Cavern: {
    SkeletonBroken: {
      hp: 50,
      atk: 12,
      def: 2,
      spd: 0.9,
      skills: [Skills.knightSlash, Skills.quickStrike],
    },
    SkeletonArcher: {
      hp: 65,
      atk: 18,
      def: 3,
      spd: 1.2,
      skills: [Skills.preciseShot, Skills.fastShot],
    },
    GolemStone: {
      hp: 200,
      atk: 15,
      def: 10,
      spd: 0.5,
      skills: [Skills.heavySwing, Skills.shieldBarrier],
    },
    Troll: {
      hp: 200,
      atk: 22,
      def: 6,
      spd: 0.7,
      skills: [Skills.heavySwing, Skills.gauntletPunch],
    },
    Centaur: {
      hp: 160,
      atk: 28,
      def: 5,
      spd: 1.4,
      skills: [Skills.arrowBarrage, Skills.quickStrike],
    },
  },

  Volcanic: {
    SlimeFireNormal: {
      hp: 80,
      atk: 20,
      def: 3,
      spd: 0.9,
      skills: [Skills.inferno, Skills.knightSlash],
    },
    Drake: {
      hp: 180,
      atk: 26,
      def: 8,
      spd: 1.1,
      skills: [Skills.inferno, Skills.airCutting, Skills.gauntletPunch],
    },
    GiantFire: {
      hp: 240,
      atk: 32,
      def: 7,
      spd: 0.7,
      skills: [Skills.inferno, Skills.groundSlam, Skills.crushingBlow],
    },
    Demon: {
      hp: 150,
      atk: 28,
      def: 7,
      spd: 1.2,
      skills: [Skills.inferno, Skills.lightingStrike, Skills.airCutting],
    },
    ImpFire: {
      hp: 75,
      atk: 25,
      def: 2,
      spd: 1.5,
      skills: [Skills.inferno, Skills.quickStrike],
    },
  },

  Frozen: {
    SlimeIceNormal: {
      hp: 85,
      atk: 18,
      def: 4,
      spd: 0.8,
      skills: [Skills.lightingStrike, Skills.moonswipe],
    },
    GiantFrost: {
      hp: 260,
      atk: 28,
      def: 9,
      spd: 0.6,
      skills: [Skills.lightingStrike, Skills.earthquake, Skills.groundSlam],
    },
    WarlockFrost: {
      hp: 105,
      atk: 20,
      def: 4,
      spd: 0.95,
      skills: [Skills.lightingStrike, Skills.moonswipe, Skills.inferno],
    },
    Wraith: {
      hp: 115,
      atk: 25,
      def: 3,
      spd: 1.4,
      skills: [Skills.etherealStrike, Skills.phaseShift],
    },
    Ghost: {
      hp: 80,
      atk: 16,
      def: 1,
      spd: 1.4,
      skills: [Skills.airCutting, Skills.lightingStrike],
    },
  },

  Abyss: {
    VampireLesser: {
      hp: 110,
      atk: 24,
      def: 5,
      spd: 1.2,
      skills: [Skills.lifeDrain, Skills.shadowStrike],
    },
    LichMage: {
      hp: 150,
      atk: 28,
      def: 6,
      spd: 1.0,
      skills: [Skills.inferno, Skills.deathCurse, Skills.soulDrain],
    },
    BanditAssassin: {
      hp: 100,
      atk: 28,
      def: 4,
      spd: 1.5,
      skills: [Skills.backstab, Skills.shadowStrike, Skills.smokeBomb],
    },
    GhoulWarrior: {
      hp: 140,
      atk: 25,
      def: 6,
      spd: 1.1,
      skills: [Skills.heavySwing, Skills.corpseExplosion, Skills.undeadRegeneration],
    },
    Basilisk: {
      hp: 180,
      atk: 28,
      def: 7,
      spd: 1.0,
      skills: [Skills.petrifyingGaze, Skills.poisonSpray, Skills.moonswipe],
    },
  },
};

const BossTemplates = {
  Forest: {
    WolfAlpha: {
      hp: 180,
      atk: 30,
      def: 8,
      spd: 1.3,
      skills: [Skills.heavySwing, Skills.gauntletPunch, Skills.airCutting],
    },
    GoblinKing: {
      hp: 180,
      atk: 28,
      def: 8,
      spd: 1.2,
      skills: [Skills.heavySwing, Skills.gauntletPunch, Skills.airCutting],
    },
  },

  Cavern: {
    SkeletonAbomination: {
      hp: 160,
      atk: 26,
      def: 7,
      spd: 1.0,
      skills: [Skills.heavySwing, Skills.gauntletPunch, Skills.moonswipe],
    },
    GolemIron: {
      hp: 230,
      atk: 18,
      def: 12,
      spd: 0.6,
      skills: [Skills.heavySwing, Skills.parry, Skills.gauntletPunch],
    },
    Minotaur: {
      hp: 210,
      atk: 30,
      def: 8,
      spd: 1.0,
      skills: [Skills.charge, Skills.hornStrike, Skills.heavySwing],
    },
  },

  Volcanic: {
    DragonRed: {
      hp: 250,
      atk: 35,
      def: 9,
      spd: 1.1,
      skills: [Skills.dragonBreath, Skills.heavySwing, Skills.tailWhip],
    },
    GiantFire: {
      hp: 240,
      atk: 32,
      def: 7,
      spd: 0.7,
      skills: [Skills.inferno, Skills.groundSlam, Skills.crushingBlow],
    },
    Phoenix: {
      hp: 200,
      atk: 31,
      def: 6,
      spd: 1.3,
      skills: [Skills.rebirth, Skills.blazing, Skills.dragonBreath],
    },
  },

  Frozen: {
    DragonIce: {
      hp: 260,
      atk: 32,
      def: 10,
      spd: 1.0,
      skills: [Skills.lightingStrike, Skills.tailWhip, Skills.dragonBreath],
    },
    GiantStone: {
      hp: 280,
      atk: 20,
      def: 12,
      spd: 0.5,
      skills: [Skills.earthquake, Skills.stoneSkin, Skills.parry],
    },
    Gargoyle: {
      hp: 230,
      atk: 26,
      def: 10,
      spd: 0.8,
      skills: [Skills.heavySwing, Skills.stoneSkin, Skills.petrify],
    },
  },

  Abyss: {
    VampireLord: {
      hp: 220,
      atk: 35,
      def: 8,
      spd: 1.4,
      skills: [Skills.vampiricBite, Skills.lifeDrain, Skills.shadowStrike, Skills.shadowCloak],
    },
    LichKing: {
      hp: 250,
      atk: 35,
      def: 9,
      spd: 1.1,
      skills: [Skills.inferno, Skills.deathCurse, Skills.soulDrain, Skills.deathNova],
    },
    BanditKing: {
      hp: 200,
      atk: 32,
      def: 7,
      spd: 1.4,
      skills: [Skills.heavySwing, Skills.backstab, Skills.shadowStrike, Skills.smokeBomb],
    },
    DragonBlack: {
      hp: 300,
      atk: 40,
      def: 11,
      spd: 1.1,
      skills: [Skills.dragonBreath, Skills.lightingStrike, Skills.heavySwing, Skills.dragonsRoar],
    },
    Kraken: {
      hp: 260,
      atk: 34,
      def: 8,
      spd: 0.9,
      skills: [Skills.tentacleWhip, Skills.drowning, Skills.heavySwing],
    },
  },
};

// Keep old MonsterTemplates for backward compatibility if needed
const MonsterTemplates = {
  // ===== GOBLIN FAMILY =====
  GoblinNormal: {
    hp: 60,
    atk: 14,
    def: 2,
    spd: 1.1,
    skills: [Skills.knightSlash, Skills.quickStrike],
  },
  GoblinSpear: {
    hp: 55,
    atk: 16,
    def: 1,
    spd: 1.4,
    skills: [Skills.quickStrike, Skills.targetedSlice],
  },
  GoblinShaman: {
    hp: 50,
    atk: 12,
    def: 2,
    spd: 1.0,
    skills: [Skills.lightingStrike, Skills.inferno],
  },
  GoblinKing: {
    hp: 180,
    atk: 28,
    def: 8,
    spd: 1.2,
    skills: [Skills.heavySwing, Skills.gauntletPunch, Skills.airCutting],
  },

  // ===== SLIME FAMILY =====
  SlimeFireNormal: {
    hp: 80,
    atk: 20,
    def: 3,
    spd: 0.9,
    skills: [Skills.inferno, Skills.knightSlash],
  },
  SlimeIceNormal: {
    hp: 85,
    atk: 18,
    def: 4,
    spd: 0.8,
    skills: [Skills.lightingStrike, Skills.moonswipe],
  },
  SlimeThunderNormal: {
    hp: 75,
    atk: 22,
    def: 2,
    spd: 1.3,
    skills: [Skills.lightingStrike, Skills.inferno],
  },
  SlimeNatureNormal: {
    hp: 90,
    atk: 15,
    def: 5,
    spd: 0.7,
    skills: [Skills.holyHeal, Skills.knightSlash],
  },

  // ===== SKELETON FAMILY =====
  SkeletonBroken: {
    hp: 50,
    atk: 12,
    def: 2,
    spd: 0.9,
    skills: [Skills.knightSlash, Skills.quickStrike],
  },
  SkeletonArcher: {
    hp: 65,
    atk: 18,
    def: 3,
    spd: 1.2,
    skills: [Skills.preciseShot, Skills.fastShot],
  },
  SkeletonAbomination: {
    hp: 160,
    atk: 26,
    def: 7,
    spd: 1.0,
    skills: [Skills.heavySwing, Skills.gauntletPunch, Skills.moonswipe],
  },

  // ===== ORC FAMILY =====
  OrcWarrior: {
    hp: 150,
    atk: 20,
    def: 5,
    spd: 0.8,
    skills: [Skills.knightSlash, Skills.gauntletPunch],
  },
  OrcBerserker: {
    hp: 170,
    atk: 28,
    def: 4,
    spd: 0.9,
    skills: [Skills.heavySwing, Skills.gauntletPunch, Skills.airCutting],
  },
  OrcShaman: {
    hp: 120,
    atk: 16,
    def: 4,
    spd: 1.0,
    skills: [Skills.inferno, Skills.lightingStrike, Skills.divinePressure],
  },

  // ===== WARLOCK FAMILY =====
  WarlockBasic: {
    hp: 100,
    atk: 18,
    def: 3,
    spd: 1.0,
    skills: [Skills.lightingStrike, Skills.inferno],
  },
  WarlockDark: {
    hp: 110,
    atk: 22,
    def: 3,
    spd: 1.1,
    skills: [Skills.inferno, Skills.airCutting, Skills.lightingStrike],
  },
  WarlockFrost: {
    hp: 105,
    atk: 20,
    def: 4,
    spd: 0.95,
    skills: [Skills.lightingStrike, Skills.moonswipe, Skills.inferno],
  },

  // ===== IMP FAMILY =====
  ImpSmall: {
    hp: 70,
    atk: 22,
    def: 2,
    spd: 1.6,
    skills: [Skills.quickStrike, Skills.quickStrike],
  },
  ImpFire: {
    hp: 75,
    atk: 25,
    def: 2,
    spd: 1.5,
    skills: [Skills.inferno, Skills.quickStrike],
  },
  ImpShadow: {
    hp: 80,
    atk: 28,
    def: 3,
    spd: 1.4,
    skills: [Skills.gamblingSlice, Skills.quickStrike],
  },

  // ===== WOLF FAMILY =====
  WolfGray: {
    hp: 90,
    atk: 19,
    def: 4,
    spd: 1.3,
    skills: [Skills.quickStrike, Skills.targetedSlice],
  },
  WolfDire: {
    hp: 130,
    atk: 24,
    def: 6,
    spd: 1.2,
    skills: [Skills.heavySwing, Skills.quickStrike, Skills.moonswipe],
  },
  WolfAlpha: {
    hp: 180,
    atk: 30,
    def: 8,
    spd: 1.3,
    skills: [Skills.heavySwing, Skills.gauntletPunch, Skills.airCutting],
  },
  WolfCrystal: {
    hp: 110,
    atk: 21,
    def: 7,
    spd: 1.1,
    skills: [Skills.lightingStrike, Skills.moonswipe],
  },

  // ===== GOLEM FAMILY =====
  GolemStone: {
    hp: 200,
    atk: 15,
    def: 10,
    spd: 0.5,
    skills: [Skills.heavySwing, Skills.shieldBarrier],
  },
  GolemIron: {
    hp: 230,
    atk: 18,
    def: 12,
    spd: 0.6,
    skills: [Skills.heavySwing, Skills.parry, Skills.gauntletPunch],
  },
  GolemLava: {
    hp: 210,
    atk: 22,
    def: 9,
    spd: 0.7,
    skills: [Skills.inferno, Skills.heavySwing],
  },
  GolemCrystal: {
    hp: 220,
    atk: 20,
    def: 11,
    spd: 0.65,
    skills: [Skills.lightingStrike, Skills.shieldBarrier],
  },

  // ===== ADDITIONAL MONSTERS =====
  Ghost: {
    hp: 80,
    atk: 16,
    def: 1,
    spd: 1.4,
    skills: [Skills.airCutting, Skills.lightingStrike],
  },
  Spider: {
    hp: 75,
    atk: 18,
    def: 3,
    spd: 1.5,
    skills: [Skills.quickStrike, Skills.targetedSlice],
  },
  Troll: {
    hp: 200,
    atk: 22,
    def: 6,
    spd: 0.7,
    skills: [Skills.heavySwing, Skills.gauntletPunch],
  },
  Drake: {
    hp: 180,
    atk: 26,
    def: 8,
    spd: 1.1,
    skills: [Skills.inferno, Skills.airCutting, Skills.gauntletPunch],
  },
  Demon: {
    hp: 150,
    atk: 28,
    def: 7,
    spd: 1.2,
    skills: [Skills.inferno, Skills.lightingStrike, Skills.airCutting],
  },

  // ===== GIANT FAMILY =====
  GiantNormal: {
    hp: 250,
    atk: 25,
    def: 8,
    spd: 0.6,
    skills: [Skills.groundSlam, Skills.crushingBlow],
  },
  GiantStone: {
    hp: 280,
    atk: 20,
    def: 12,
    spd: 0.5,
    skills: [Skills.earthquake, Skills.stoneSkin, Skills.parry],
  },
  GiantFire: {
    hp: 240,
    atk: 32,
    def: 7,
    spd: 0.7,
    skills: [Skills.inferno, Skills.groundSlam, Skills.crushingBlow],
  },
  GiantFrost: {
    hp: 260,
    atk: 28,
    def: 9,
    spd: 0.6,
    skills: [Skills.lightingStrike, Skills.earthquake, Skills.groundSlam],
  },

  // ===== VAMPIRE FAMILY =====
  VampireLesser: {
    hp: 110,
    atk: 24,
    def: 5,
    spd: 1.2,
    skills: [Skills.lifeDrain, Skills.shadowStrike],
  },
  VampireNosferatu: {
    hp: 170,
    atk: 30,
    def: 7,
    spd: 1.3,
    skills: [Skills.vampiricBite, Skills.lifeDrain, Skills.shadowCloak],
  },
  VampireLord: {
    hp: 220,
    atk: 35,
    def: 8,
    spd: 1.4,
    skills: [Skills.vampiricBite, Skills.lifeDrain, Skills.shadowStrike, Skills.shadowCloak],
  },
  VampireBat: {
    hp: 95,
    atk: 22,
    def: 3,
    spd: 1.6,
    skills: [Skills.quickStrike, Skills.lifeDrain],
  },

  // ===== BANDIT FAMILY =====
  BanditCommon: {
    hp: 85,
    atk: 20,
    def: 3,
    spd: 1.4,
    skills: [Skills.backstab, Skills.shadowStrike],
  },
  BanditLeader: {
    hp: 130,
    atk: 26,
    def: 5,
    spd: 1.3,
    skills: [Skills.heavySwing, Skills.backstab, Skills.smokeBomb],
  },
  BanditAssassin: {
    hp: 100,
    atk: 28,
    def: 4,
    spd: 1.5,
    skills: [Skills.backstab, Skills.shadowStrike, Skills.smokeBomb],
  },
  BanditKing: {
    hp: 200,
    atk: 32,
    def: 7,
    spd: 1.4,
    skills: [Skills.heavySwing, Skills.backstab, Skills.shadowStrike, Skills.smokeBomb],
  },

  // ===== DRAGON FAMILY =====
  DragonWyvern: {
    hp: 140,
    atk: 26,
    def: 6,
    spd: 1.2,
    skills: [Skills.dragonBreath, Skills.tailWhip],
  },
  DragonRed: {
    hp: 250,
    atk: 35,
    def: 9,
    spd: 1.1,
    skills: [Skills.dragonBreath, Skills.heavySwing, Skills.tailWhip],
  },
  DragonIce: {
    hp: 260,
    atk: 32,
    def: 10,
    spd: 1.0,
    skills: [Skills.lightingStrike, Skills.tailWhip, Skills.dragonBreath],
  },
  DragonBlack: {
    hp: 300,
    atk: 40,
    def: 11,
    spd: 1.1,
    skills: [Skills.dragonBreath, Skills.lightingStrike, Skills.heavySwing, Skills.dragonsRoar],
  },
  DragonGold: {
    hp: 320,
    atk: 38,
    def: 12,
    spd: 1.2,
    skills: [Skills.dragonBreath, Skills.tailWhip, Skills.heavySwing, Skills.dragonsRoar],
  },

  // ===== LICH FAMILY =====
  LichLesser: {
    hp: 120,
    atk: 22,
    def: 5,
    spd: 0.9,
    skills: [Skills.deathCurse, Skills.soulDrain],
  },
  LichMage: {
    hp: 150,
    atk: 28,
    def: 6,
    spd: 1.0,
    skills: [Skills.inferno, Skills.deathCurse, Skills.soulDrain],
  },
  LichKing: {
    hp: 250,
    atk: 35,
    def: 9,
    spd: 1.1,
    skills: [Skills.inferno, Skills.deathCurse, Skills.soulDrain, Skills.deathNova],
  },

  // ===== GHOUL FAMILY =====
  GhoulScout: {
    hp: 90,
    atk: 18,
    def: 3,
    spd: 1.3,
    skills: [Skills.quickStrike, Skills.decayingTouch],
  },
  GhoulWarrior: {
    hp: 140,
    atk: 25,
    def: 6,
    spd: 1.1,
    skills: [Skills.heavySwing, Skills.corpseExplosion, Skills.undeadRegeneration],
  },
  GhoulKing: {
    hp: 240,
    atk: 32,
    def: 8,
    spd: 1.2,
    skills: [Skills.heavySwing, Skills.corpseExplosion, Skills.decayingTouch],
  },

  // ===== OTHER CREATURES =====
  Cyclops: {
    hp: 220,
    atk: 32,
    def: 7,
    spd: 0.8,
    skills: [Skills.heavySwing, Skills.crushingBlow, Skills.knightSlash],
  },
  Centaur: {
    hp: 160,
    atk: 28,
    def: 5,
    spd: 1.4,
    skills: [Skills.arrowBarrage, Skills.trample, Skills.quickStrike],
  },
  Minotaur: {
    hp: 210,
    atk: 30,
    def: 8,
    spd: 1.0,
    skills: [Skills.charge, Skills.hornStrike, Skills.heavySwing],
  },
  Harpy: {
    hp: 95,
    atk: 21,
    def: 2,
    spd: 1.6,
    skills: [Skills.aerialStrike, Skills.windGust],
  },
  Chimera: {
    hp: 240,
    atk: 33,
    def: 7,
    spd: 1.1,
    skills: [Skills.inferno, Skills.multiStrike, Skills.hydraAttack],
  },
  Phoenix: {
    hp: 200,
    atk: 31,
    def: 6,
    spd: 1.3,
    skills: [Skills.rebirth, Skills.blazing, Skills.dragonBreath],
  },
  Gargoyle: {
    hp: 230,
    atk: 26,
    def: 10,
    spd: 0.8,
    skills: [Skills.heavySwing, Skills.stoneSkin, Skills.petrify],
  },
  Basilisk: {
    hp: 180,
    atk: 28,
    def: 7,
    spd: 1.0,
    skills: [Skills.petrifyingGaze, Skills.poisonSpray, Skills.moonswipe],
  },
  Kraken: {
    hp: 260,
    atk: 34,
    def: 8,
    spd: 0.9,
    skills: [Skills.tentacleWhip, Skills.drowning, Skills.heavySwing],
  },
  Banshee: {
    hp: 105,
    atk: 23,
    def: 2,
    spd: 1.5,
    skills: [Skills.deathScream, Skills.weaken],
  },
  Wraith: {
    hp: 115,
    atk: 25,
    def: 3,
    spd: 1.4,
    skills: [Skills.etherealStrike, Skills.phaseShift],
  },
};