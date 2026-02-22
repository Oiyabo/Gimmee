// ===== EQUIPMENT ABILITIES SYSTEM =====
const EquipmentAbilities = {
  // Offensive Abilities
  sharpness: {
    name: "Sharpness",
    description: "Attacks cause bleeding, dealing damage over time",
    type: "offensive",
    effect: (target) => {
      if (!target.status) target.status = {};
      target.status.bleeding = Math.max((target.status.bleeding || 0), 5);
    }
  },
  
  armorBreak: {
    name: "Armor Break",
    description: "Ignore 30% of enemy physical defense",
    type: "offensive",
    effect: null // Applied during damage calculation
  },
  
  magnetism: {
    name: "Magnetism",
    description: "Attacks reduce enemy magical defense by 20%",
    type: "offensive",
    effect: (target) => {
      if (!target.status) target.status = {};
      target.status.magnetized = (target.status.magnetized || 0) + 1;
    }
  },
  
  empower: {
    name: "Empower",
    description: "Increase all damage output by 15%",
    type: "offensive",
    effect: null // Flat damage multiplier
  },
  
  momentum: {
    name: "Momentum",
    description: "Damage increases by 5% for each consecutive hit (max 30%)",
    type: "offensive",
    effect: null // Stacking buff
  },
  
  // Defensive Abilities
  reflection: {
    name: "Reflection",
    description: "Reflect 25% of physical damage back to attacker",
    type: "defensive",
    effect: null // Applied when taking damage
  },
  
  thornReflection: {
    name: "Thorn Reflection",
    description: "When attacked, attacker takes 15% of damage as backlash",
    type: "defensive",
    effect: null // Passive reflection
  },
  
  resilience: {
    name: "Resilience",
    description: "Reduce all damage taken by 10%",
    type: "defensive",
    effect: null // Damage reduction
  },
  
  ward: {
    name: "Ward",
    description: "Magical attacks deal 20% less damage to wearer",
    type: "defensive",
    effect: null // Magic-specific reduction
  },
  
  fortify: {
    name: "Fortify",
    description: "Increase all defensive stats by 15%",
    type: "defensive",
    effect: null // Stat boost
  },
  
  // Utility Abilities
  lightWeight: {
    name: "Light Weight",
    description: "Stamina consumption reduced by 20%",
    type: "utility",
    effect: null // Cost modifier
  },
  
  manaRecharge: {
    name: "Mana Recharge",
    description: "Regenerate 10% mana per turn",
    type: "utility",
    effect: (self) => {
      if (!self.status) self.status = {};
      self.mana = Math.min(self.mana + Math.floor(self.maxMana * 0.1), self.maxMana);
    }
  },
  
  staminaPool: {
    name: "Stamina Pool",
    description: "Increase maximum stamina by 25",
    type: "utility",
    effect: null // Stat boost
  },
  
  vitality: {
    name: "Vitality",
    description: "Heal 5% max HP every turn",
    type: "utility",
    effect: (self) => {
      self.hp = Math.min(self.hp + Math.floor(self.maxHp * 0.05), self.maxHp);
    }
  },
  
  // Speed & Mobility
  swiftness: {
    name: "Swiftness",
    description: "Increase both physical and magical speed by 0.15",
    type: "mobility",
    effect: null // Speed boost
  },
  
  lightEssence: {
    name: "Light Essence",
    description: "Enemies have 20% reduced accuracy against wearer (less likely to hit)",
    type: "mobility",
    effect: null // Dodge chance
  },
  
  shiny: {
    name: "Shiny",
    description: "Enemies are 30% less likely to target wearer",
    type: "mobility",
    effect: null // Target priority reduction
  },
  
  // Critical & Precision
  focusing: {
    name: "Focusing",
    description: "Increase critical hit chance by 0.15 (15%)",
    type: "precision",
    effect: null // Crit boost
  },
  
  executioner: {
    name: "Executioner",
    description: "Critical damage multiplier increased by 0.5x",
    type: "precision",
    effect: null // Dcrit boost
  },
  
  precision: {
    name: "Precision",
    description: "Attacks ignore 20% of enemy defense",
    type: "precision",
    effect: null // Defense pen
  },
  
  // Lifesteal & Vampire
  vampirism: {
    name: "Vampirism",
    description: "Heal 20% of damage dealt",
    type: "lifesteal",
    effect: (self, damageDealt) => {
      self.hp = Math.min(self.hp + Math.floor(damageDealt * 0.2), self.maxHp);
    }
  },
  
  siphon: {
    name: "Siphon",
    description: "Drain 10% of enemy max HP as heal per hit",
    type: "lifesteal",
    effect: (self, target) => {
      let drain = Math.floor(target.maxHp * 0.1);
      self.hp = Math.min(self.hp + drain, self.maxHp);
    }
  },
  
  // Crowd Control
  hex: {
    name: "Hex",
    description: "Attackers are afflicted with random negative effects (burn, stun, paralyze)",
    type: "control",
    effect: (attacker) => {
      if (!attacker.status) attacker.status = {};
      let effects = ['burn', 'stun', 'paralyzed'];
      let chosen = effects[Math.floor(Math.random() * effects.length)];
      if (chosen === 'burn') attacker.status.burn = 3;
      if (chosen === 'stun') attacker.status.stun = 2;
      if (chosen === 'paralyzed') attacker.status.paralyzed = 3;
    }
  },
  
  weakness: {
    name: "Weakness",
    description: "Reduce enemy attack power by 15% for 4 turns",
    type: "control",
    effect: (target) => {
      if (!target.status) target.status = {};
      target.status.weakened = 4;
    }
  },
  
  nullify: {
    name: "Nullify",
    description: "Remove one random negative status effect automatically per turn",
    type: "control",
    effect: (self) => {
      if (!self.status) return;
      let negatives = [];
      if (self.status.burn > 0) negatives.push('burn');
      if (self.status.bleeding > 0) negatives.push('bleeding');
      if (self.status.stun > 0) negatives.push('stun');
      if (self.status.paralyzed > 0) negatives.push('paralyzed');
      if (self.status.weakened > 0) negatives.push('weakened');
      
      if (negatives.length > 0) {
        let toRemove = negatives[Math.floor(Math.random() * negatives.length)];
        self.status[toRemove] = 0;
      }
    }
  },
  
  // Evasion
  evasion: {
    name: "Evasion",
    description: "3 free dodges per battle, reset each round",
    type: "evasion",
    effect: null // Counter tracking
  },
  
  dodge: {
    name: "Dodge",
    description: "20% chance to completely avoid incoming damage",
    type: "evasion",
    effect: null // Passive dodge
  },
  
  // Counter Abilities
  counterAttack: {
    name: "Counter Attack",
    description: "50% chance to attack back when hit",
    type: "counter",
    effect: null // Automatic retaliation
  },
  
  riposte: {
    name: "Riposte",
    description: "When dodging, gain +20% damage on next attack",
    type: "counter",
    effect: null // Conditional boost
  },
  
  // Resource Management
  resourceful: {
    name: "Resourceful",
    description: "All skill resource costs reduced by 15%",
    type: "resource",
    effect: null // Cost modifier
  },
  
  efficiency: {
    name: "Efficiency",
    description: "Recover 5 stamina & 5 mana per turn",
    type: "resource",
    effect: (self) => {
      self.sta = Math.min(self.sta + 5, self.maxSta);
      self.mana = Math.min(self.mana + 5, self.maxMana);
    }
  },
  
  // Tanking
  taunt: {
    name: "Taunt",
    description: "Enemies focus attacks on wearer for 50% more frequency",
    type: "tanking",
    effect: null // Target priority boost
  },
  
  shieldMastery: {
    name: "Shield Mastery",
    description: "Gain protective barrier absorbing 15% of max HP at start of turn",
    type: "tanking",
    effect: (self) => {
      if (!self.status) self.status = {};
      self.status.shield = Math.floor(self.maxHp * 0.15);
    }
  },
  
  // Synergy/Combo
  synergy: {
    name: "Synergy",
    description: "Gain +10% damage for each ally still in battle",
    type: "synergy",
    effect: null // Dynamic multiplier
  },
  
  solidarity: {
    name: "Solidarity",
    description: "Share 5% of damage taken with all allies equally",
    type: "synergy",
    effect: null // Damage distribution
  }
};

// ===== EQUIPMENT DEFINITIONS (REFORMED) =====
const Equipment = {
  // Common Items
  IronSword: {
    name: "Iron Sword",
    type: "weapon",
    rarity: "common",
    lore: "A basic iron sword. Reliable, simple, and effective for beginners.",
    stats: { patk: 5 },
    ability: null,
  },
  
  LeatherArmor: {
    name: "Leather Armor",
    type: "armor",
    rarity: "common",
    lore: "Supple leather provides basic protection without restricting movement.",
    stats: { pdef: 3, hp: 10 },
    ability: null,
  },
  
  SpeedBoots: {
    name: "Speed Boots",
    type: "boots",
    rarity: "common",
    lore: "Lightweight boots designed for quick movements across the battlefield.",
    stats: { pspd: 0.15 },
    ability: null,
  },
  
  HealthGem: {
    name: "Health Gem",
    type: "accessory",
    rarity: "common",
    lore: "A small crystalline gem that strengthens the wearer's vitality.",
    stats: { hp: 20 },
    ability: null,
  },
  
  BronzeDagger: {
    name: "Bronze Dagger",
    type: "weapon",
    rarity: "common",
    lore: "A small but sharp dagger made of bronze. Quick and nimble strikes.",
    stats: { patk: 4, pspd: 0.1 },
    ability: null,
  },
  
  HardenedShell: {
    name: "Hardened Shell",
    type: "armor",
    rarity: "common",
    lore: "A reinforced shell exterior provides steady defense.",
    stats: { pdef: 4 },
    ability: null,
  },

  // Uncommon Items
  SteelSword: {
    name: "Steel Sword",
    type: "weapon",
    rarity: "uncommon",
    lore: "A well-crafted steel blade with improved sharpness and durability.",
    stats: { patk: 10, ccrit: 0.05 },
    ability: "sharpness",
  },
  
  ChainsArmor: {
    name: "Chain Mail",
    type: "armor",
    rarity: "uncommon",
    lore: "Interlocking metal rings provide solid protection against cuts.",
    stats: { pdef: 6, mdef: 3 },
    ability: null,
  },
  
  FocusRing: {
    name: "Focus Ring",
    type: "accessory",
    rarity: "uncommon",
    lore: "Grants clarity of mind, increasing spellcasting precision.",
    stats: { matk: 5, dcrit: 0.2 },
    ability: "focusing",
  },
  
  RestorePotion: {
    name: "Restore Potion",
    type: "consumable",
    rarity: "uncommon",
    lore: "A healing elixir that quickly mends wounds. Can be shared with allies.",
    stats: { hp: 30 },
    ability: null,
  },
  
  RunedGloves: {
    name: "Runed Gloves",
    type: "armor",
    rarity: "uncommon",
    lore: "Arcane runes woven into protective gloves enhance magical defenses.",
    stats: { mdef: 5, matk: 3 },
    ability: null,
  },
  
  SilverAmulet: {
    name: "Silver Amulet",
    type: "accessory",
    rarity: "uncommon",
    lore: "A silver charm offering lightweight protection and clarity.",
    stats: { pspd: 0.1, mspd: 0.1 },
    ability: "lightWeight",
  },

  // Rare Items
  MithrilSword: {
    name: "Mithril Sword",
    type: "weapon",
    rarity: "rare",
    lore: "A legendary metallic blade forged from mithril ore. Lighter than steel yet far superior.",
    stats: { patk: 15, pspd: 0.1, ccrit: 0.1 },
    ability: "armorBreak",
  },
  
  PlateArmor: {
    name: "Plate Armor",
    type: "armor",
    rarity: "rare",
    lore: "Heavy plated armor crafted for knights. Provides exceptional defense.",
    stats: { pdef: 10, hp: 20, mdef: 4 },
    ability: "fortify",
  },
  
  AgilityCloak: {
    name: "Agility Cloak",
    type: "armor",
    rarity: "rare",
    lore: "A shadowy cloak that enhances evasion and movement speed.",
    stats: { pspd: 0.2, mspd: 0.15, ccrit: 0.08 },
    ability: "dodge",
  },
  
  CriticalGem: {
    name: "Critical Gem",
    type: "accessory",
    rarity: "rare",
    lore: "A deep red gemstone that heightens striking power and precision.",
    stats: { patk: 8, ccrit: 0.15, dcrit: 0.3 },
    ability: "executioner",
  },
  
  LifeAmulet: {
    name: "Life Amulet",
    type: "accessory",
    rarity: "rare",
    lore: "An ancient amulet bound to the essence of life itself.",
    stats: { hp: 50, mdef: 3 },
    ability: "vitality",
  },
  
  EchoBooklet: {
    name: "Echo Booklet",
    type: "weapon",
    rarity: "rare",
    lore: "A mystical tome that echoes spells with greater power.",
    stats: { matk: 12, mspd: 0.15, dcrit: 0.2 },
    ability: "empower",
  },
  
  ReflectiveScutum: {
    name: "Reflective Scutum",
    type: "armor",
    rarity: "rare",
    lore: "A polished shield that sends attacks back to the assailant.",
    stats: { pdef: 8, mdef: 6, hp: 15 },
    ability: "reflection",
  },

  // Epic Items
  ExcaliburBlade: {
    name: "Excalibur",
    type: "weapon",
    rarity: "epic",
    lore: "The legendary blade of kings. Said to cut through any defense with divine authority.",
    stats: { patk: 25, dcrit: 0.5, ccrit: 0.15 },
    ability: "armorBreak",
  },
  
  DragonsPlate: {
    name: "Dragon Plate",
    type: "armor",
    rarity: "epic",
    lore: "Armor fashioned from dragon scales. Absorbs magical and physical assault.",
    stats: { pdef: 15, mdef: 12, hp: 40 },
    ability: "ward",
  },
  
  ShadowCloak: {
    name: "Shadow Cloak",
    type: "armor",
    rarity: "epic",
    lore: "A cloak woven from shadow itself. Grants the wearer supernatural evasion.",
    stats: { pspd: 0.2, mspd: 0.15, mdef: 8 },
    ability: "evasion",
  },
  
  PhoenixRing: {
    name: "Phoenix Ring",
    type: "accessory",
    rarity: "epic",
    lore: "Inscribed with the symbol of eternal rebirth. Grants life when death is near.",
    stats: { hp: 30, mdef: 8, ccrit: 0.1 },
    ability: "siphon",
  },
  
  MagiStaff: {
    name: "Magi Staff",
    type: "weapon",
    rarity: "epic",
    lore: "A staff infused with ancient magic. Channeling overwhelming arcane power.",
    stats: { matk: 20, mana: 20, dcrit: 0.4 },
    ability: "manaRecharge",
  },
  
  ThornedArmor: {
    name: "Thorned Armor",
    type: "armor",
    rarity: "epic",
    lore: "Jagged thorns cover this armor, injuring those foolish enough to attack the wearer.",
    stats: { pdef: 12, hp: 25, mdef: 6 },
    ability: "thornReflection",
  },
  
  SwiftSilverRing: {
    name: "Swift Silver Ring",
    type: "accessory",
    rarity: "epic",
    lore: "A ring of pure silver that accelerates the wearer's movements.",
    stats: { pspd: 0.25, sta: 15 },
    ability: "swiftness",
  },

  // Legendary Items
  SwordOfEternity: {
    name: "Sword of Eternity",
    type: "weapon",
    rarity: "legendary",
    lore: "A timeless blade that exists beyond mortal understanding. Drains life with every strike.",
    stats: { patk: 35, dcrit: 0.6, tatt: 5 },
    ability: "vampirism",
  },
  
  ArmorOfGods: {
    name: "Armor of Gods",
    type: "armor",
    rarity: "legendary",
    lore: "Divine protection woven by celestial beings. Nearly impenetrable.",
    stats: { pdef: 20, mdef: 18, hp: 100 },
    ability: "resilience",
  },
  
  CrownOfPower: {
    name: "Crown of Power",
    type: "accessory",
    rarity: "legendary",
    lore: "The crown of ancient kings. Grants mastery over all forms of combat.",
    stats: { patk: 10, matk: 10, pdef: 8, mdef: 8, pspd: 0.15, mspd: 0.15, hp: 50 },
    ability: "synergy",
  },
  
  VoidMantle: {
    name: "Void Mantle",
    type: "armor",
    rarity: "legendary",
    lore: "A cloak of pure void energy. The wearer exists partially beyond reality.",
    stats: { mdef: 20, mspd: 0.25, ccrit: 0.2 },
    ability: "lightEssence",
  },
  
  StaffOfTheArchmage: {
    name: "Staff of the Archmage",
    type: "weapon",
    rarity: "legendary",
    lore: "The ultimate magical implement. Each spell resonates with ancient power.",
    stats: { matk: 30, mana: 40, dcrit: 0.7, mspd: 0.2 },
    ability: "momentum",
  },
  
  HexbaneAmulet: {
    name: "Hexbane Amulet",
    type: "accessory",
    rarity: "legendary",
    lore: "An amulet blessed to repel curses and dark magic.",
    stats: { mdef: 15, hp: 40, pdef: 10 },
    ability: "nullify",
  }
};

// Equipment pool untuk setiap rarity
const EquipmentByRarity = {
  common: [
    Equipment.IronSword, Equipment.LeatherArmor, Equipment.SpeedBoots, Equipment.HealthGem,
    Equipment.BronzeDagger, Equipment.HardenedShell
  ],
  uncommon: [
    Equipment.SteelSword, Equipment.ChainsArmor, Equipment.FocusRing, Equipment.RestorePotion,
    Equipment.RunedGloves, Equipment.SilverAmulet
  ],
  rare: [
    Equipment.MithrilSword, Equipment.PlateArmor, Equipment.AgilityCloak, Equipment.CriticalGem, 
    Equipment.LifeAmulet, Equipment.EchoBooklet, Equipment.ReflectiveScutum
  ],
  epic: [
    Equipment.ExcaliburBlade, Equipment.DragonsPlate, Equipment.ShadowCloak, Equipment.PhoenixRing, 
    Equipment.MagiStaff, Equipment.ThornedArmor, Equipment.SwiftSilverRing
  ],
  legendary: [
    Equipment.SwordOfEternity, Equipment.ArmorOfGods, Equipment.CrownOfPower, Equipment.VoidMantle,
    Equipment.StaffOfTheArchmage, Equipment.HexbaneAmulet
  ],
};

// Available stat keys yang bisa dipilih
const STAT_KEYS = ['patk', 'matk', 'tatt', 'pdef', 'mdef', 'pspd', 'mspd', 'hp', 'ccrit', 'dcrit', 'sta', 'mana'];

// Stat distributions by rarity and type
const STAT_DISTRIBUTIONS = {
  common: {
    'patk': [3, 6],
    'matk': [2, 4],
    'tatt': [0, 1],
    'pdef': [2, 4],
    'mdef': [1, 3],
    'pspd': [0.08, 0.15],
    'mspd': [0.08, 0.15],
    'hp': [10, 20],
    'ccrit': [0.03, 0.08],
    'dcrit': [0.1, 0.2],
    'sta': [5, 10],
    'mana': [5, 10],
  },
  uncommon: {
    'patk': [8, 12],
    'matk': [6, 10],
    'tatt': [1, 2],
    'pdef': [5, 8],
    'mdef': [3, 6],
    'pspd': [0.1, 0.15],
    'mspd': [0.1, 0.15],
    'hp': [15, 30],
    'ccrit': [0.05, 0.12],
    'dcrit': [0.2, 0.35],
    'sta': [10, 15],
    'mana': [10, 15],
  },
  rare: {
    'patk': [12, 18],
    'matk': [10, 16],
    'tatt': [2, 4],
    'pdef': [8, 12],
    'mdef': [6, 10],
    'pspd': [0.12, 0.2],
    'mspd': [0.12, 0.2],
    'hp': [30, 50],
    'ccrit': [0.08, 0.15],
    'dcrit': [0.3, 0.5],
    'sta': [15, 25],
    'mana': [15, 25],
  },
  epic: {
    'patk': [18, 28],
    'matk': [16, 26],
    'tatt': [4, 7],
    'pdef': [12, 18],
    'mdef': [10, 15],
    'pspd': [0.15, 0.25],
    'mspd': [0.15, 0.25],
    'hp': [40, 70],
    'ccrit': [0.1, 0.18],
    'dcrit': [0.4, 0.6],
    'sta': [20, 35],
    'mana': [20, 35],
  },
  legendary: {
    'patk': [25, 40],
    'matk': [25, 40],
    'tatt': [5, 10],
    'pdef': [15, 25],
    'mdef': [15, 25],
    'pspd': [0.2, 0.35],
    'mspd': [0.2, 0.35],
    'hp': [50, 100],
    'ccrit': [0.15, 0.25],
    'dcrit': [0.5, 0.8],
    'sta': [30, 50],
    'mana': [30, 50],
  },
};

// Ability pools by rarity (probability-weighted)
const ABILITY_POOLS = {
  common: [null, null, null, null],  // 100% chance of no ability
  uncommon: [null, null, 'sharpness', 'lightWeight', 'focusing', 'dodge'],  // 33% chance of ability
  rare: ['sharpness', 'armorBreak', 'reflection', 'empower', 'focusing', 'dodge', 'swiftness', 'vitality', 'countering', 'manaRecharge'],
  epic: ['sharpness', 'armorBreak', 'reflection', 'vampirism', 'empower', 'momentum', 'dodge', 'evasion', 'ward', 'siphon', 'swiftness', 'thornReflection', 'manaRecharge', 'staminaPool', 'shieldMastery'],
  legendary: Object.keys(EquipmentAbilities).filter(key => EquipmentAbilities[key].type !== 'none'),
};

// Helper: Get random stat value
function getRandomStat(statKey, rarity) {
  const ranges = STAT_DISTRIBUTIONS[rarity] || STAT_DISTRIBUTIONS.common;
  if (!ranges[statKey]) return null;
  
  const [min, max] = ranges[statKey];
  if (typeof min === 'number' && typeof max === 'number') {
    return Math.floor(min + Math.random() * (max - min + 1));
  }
  return min;
}

// Helper: Generate random equipment stats (1-3 stats based on rarity)
function generateRandomEquipmentStats(rarity) {
  let statsCount;
  if (rarity === 'common') statsCount = 1;
  else if (rarity === 'uncommon') statsCount = 2;
  else if (rarity === 'rare') statsCount = Math.floor(Math.random() * 2) + 2; // 2-3
  else if (rarity === 'epic') statsCount = Math.floor(Math.random() * 2) + 2; // 2-3
  else statsCount = 3; // legendary: 3+ stats
  
  let selectedStats = {};
  let possibleStats = [...STAT_KEYS];
  
  for (let i = 0; i < statsCount && possibleStats.length > 0; i++) {
    let randomIdx = Math.floor(Math.random() * possibleStats.length);
    let statKey = possibleStats[randomIdx];
    selectedStats[statKey] = getRandomStat(statKey, rarity);
    possibleStats.splice(randomIdx, 1);
  }
  
  return selectedStats;
}

// Helper: Get random ability for equipment
function getRandomEquipmentAbility(rarity) {
  const abilityPool = ABILITY_POOLS[rarity] || ABILITY_POOLS.common;
  return abilityPool[Math.floor(Math.random() * abilityPool.length)];
}

// Helper: Generate full random equipment
function generateRandomEquipmentWithStats(rarity, typeFilter = null) {
  let selectedEquip = Equipment[Object.keys(Equipment)[Math.floor(Math.random() * Object.keys(Equipment).length)]];
  
  // If type filtered, try to find matching rarity
  if (typeFilter && EquipmentByRarity[rarity]) {
    let pool = EquipmentByRarity[rarity].filter(e => e.type === typeFilter);
    if (pool.length > 0) {
      selectedEquip = pool[Math.floor(Math.random() * pool.length)];
    }
  }
  
  return {
    ...selectedEquip,
    stats: generateRandomEquipmentStats(rarity),
    ability: getRandomEquipmentAbility(rarity)
  };
}


// Skill pool untuk setiap hero
const HeroSkillPools = {
  Knight: [
    { skill: Skills.moonswipe, name: "Moonswipe" },
    { skill: Skills.gauntletPunch, name: "Gauntlet Punch" },
    { skill: Skills.whirlwindStrike, name: "Whirlwind Strike" },
    { skill: Skills.counterAttack, name: "Counter Attack" },
    { skill: Skills.lastStand, name: "Last Stand" },
    { skill: Skills.vengeance, name: "Vengeance" },
    { skill: Skills.shieldBash, name: "Shield Bash" },
    { skill: Skills.ironWill, name: "Iron Will" },
  ],
  Priest: [
    { skill: Skills.divinePressure, name: "Divine Pressure" },
    { skill: Skills.divineRaise, name: "Divine Raise" },
    { skill: Skills.massHeal, name: "Mass Heal" },
    { skill: Skills.purification, name: "Purification" },
    { skill: Skills.blessings, name: "Blessings" },
    { skill: Skills.divinePulse, name: "Divine Pulse" },
    { skill: Skills.guardian, name: "Guardian" },
    { skill: Skills.lightArmor, name: "Light Armor" },
  ],
  Mage: [
    { skill: Skills.airCutting, name: "Air Cutting" },
    { skill: Skills.spellAmplify, name: "Spell Amplify" },
    { skill: Skills.meteorStorm, name: "Meteor Storm" },
    { skill: Skills.iceShards, name: "Ice Shards" },
    { skill: Skills.arcaneBarrier, name: "Arcane Barrier" },
    { skill: Skills.chainLightning, name: "Chain Lightning" },
    { skill: Skills.timeWarp, name: "Time Warp" },
    { skill: Skills.spellShield, name: "Spell Shield" },
  ],
  Rogue: [
    { skill: Skills.targetedSlice, name: "Targeted Slice" },
    { skill: Skills.gamblingSlice, name: "Gambling Slice" },
    { skill: Skills.shadowClone, name: "Shadow Clone" },
    { skill: Skills.deathFromShadow, name: "Death From Shadow" },
    { skill: Skills.shadowDance, name: "Shadow Dance" },
    { skill: Skills.poisonBlade, name: "Poison Blade" },
    { skill: Skills.nightblade, name: "Nightblade" },
    { skill: Skills.shadowBurst, name: "Shadow Burst" },
  ],
  Paladin: [
    { skill: Skills.martyr, name: "Martyr" },
    { skill: Skills.parry, name: "Parry" },
    { skill: Skills.holyAura, name: "Holy Aura" },
    { skill: Skills.consecration, name: "Consecration" },
    { skill: Skills.shieldReflect, name: "Shield Reflect" },
    { skill: Skills.divineStrike, name: "Divine Strike" },
    { skill: Skills.sanctity, name: "Sanctity" },
    { skill: Skills.retribution, name: "Retribution" },
  ],
  Archer: [
    { skill: Skills.fastShot, name: "Fast Shot" },
    { skill: Skills.arrowsRain, name: "Arrows Rain" },
    { skill: Skills.multiShot, name: "Multi Shot" },
    { skill: Skills.piercingShot, name: "Piercing Shot" },
    { skill: Skills.evasion, name: "Evasion" },
    { skill: Skills.explosiveArrow, name: "Explosive Arrow" },
    { skill: Skills.focusedFire, name: "Focused Fire" },
    { skill: Skills.archersMark, name: "Archer's Mark" },
  ],
};

function getRandomEquipment() {
  let rarities = ["common", "common", "common", "uncommon", "uncommon", "rare"];
  let rarity = random(rarities);
  let equips = EquipmentByRarity[rarity];
  return random(equips);
}

function getRandomSkillForHero(heroName) {
  let pool = HeroSkillPools[heroName];
  if (!pool) return null;
  return random(pool);
}
