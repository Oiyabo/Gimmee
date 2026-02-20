// ===== EQUIPMENT DEFINITIONS =====
const Equipment = {
  // Common Items
  IronSword: {
    name: "Iron Sword",
    type: "weapon",
    rarity: "common",
    stats: { atk: 5, def: 0, spd: 0, hp: 0 },
    passive: null,
  },
  LeatherArmor: {
    name: "Leather Armor",
    type: "armor",
    rarity: "common",
    stats: { atk: 0, def: 3, spd: 0, hp: 10 },
    passive: null,
  },
  SpeedBoots: {
    name: "Speed Boots",
    type: "boots",
    rarity: "common",
    stats: { atk: 0, def: 0, spd: 0.15, hp: 0 },
    passive: null,
  },
  HealthGem: {
    name: "Health Gem",
    type: "accessory",
    rarity: "common",
    stats: { atk: 0, def: 0, spd: 0, hp: 20 },
    passive: null,
  },

  // Uncommon Items
  SteelSword: {
    name: "Steel Sword",
    type: "weapon",
    rarity: "uncommon",
    stats: { atk: 10, def: 0, spd: 0, hp: 0 },
    passive: null,
  },
  ChainsArmor: {
    name: "Chain Mail",
    type: "armor",
    rarity: "uncommon",
    stats: { atk: 0, def: 6, spd: -0.05, hp: 0 },
    passive: null,
  },
  FocusRing: {
    name: "Focus Ring",
    type: "accessory",
    rarity: "uncommon",
    stats: { atk: 0, def: 0, spd: 0.1, hp: 0 },
    passive: "Increase skill damage by 10%",
  },
  RestorePotion: {
    name: "Restore Potion",
    type: "consumable",
    rarity: "uncommon",
    stats: { atk: 0, def: 0, spd: 0, hp: 30 },
    passive: null,
  },

  // Rare Items
  MithrilSword: {
    name: "Mithril Sword",
    type: "weapon",
    rarity: "rare",
    stats: { atk: 15, def: 2, spd: 0.05, hp: 0 },
    passive: null,
  },
  PlateArmor: {
    name: "Plate Armor",
    type: "armor",
    rarity: "rare",
    stats: { atk: 0, def: 10, spd: -0.1, hp: 20 },
    passive: null,
  },
  AgilityCloak: {
    name: "Agility Cloak",
    type: "armor",
    rarity: "rare",
    stats: { atk: 2, def: 2, spd: 0.2, hp: 0 },
    passive: "Dodge chance increase 15%",
  },
  CriticalGem: {
    name: "Critical Gem",
    type: "accessory",
    rarity: "rare",
    stats: { atk: 8, def: 0, spd: 0, hp: 0 },
    passive: "Critical hit chance increase to 25%",
  },
  LifeAmulet: {
    name: "Life Amulet",
    type: "accessory",
    rarity: "rare",
    stats: { atk: 0, def: 0, spd: 0, hp: 50 },
    passive: "Heal 5% HP per round",
  },

  // Epic Items
  ExcaliburBlade: {
    name: "Excalibur",
    type: "weapon",
    rarity: "epic",
    stats: { atk: 25, def: 3, spd: 0.1, hp: 0 },
    passive: "Holy damage increase attack by 20%",
  },
  DragonsPlate: {
    name: "Dragon Plate",
    type: "armor",
    rarity: "epic",
    stats: { atk: 0, def: 15, spd: 0, hp: 40 },
    passive: "Reduce take damage by 10%",
  },
  ShadowCloak: {
    name: "Shadow Cloak",
    type: "armor",
    rarity: "epic",
    stats: { atk: 5, def: 8, spd: 0.15, hp: 0 },
    passive: "Evasion chance increase to 20%",
  },
  PhoenixRing: {
    name: "Phoenix Ring",
    type: "accessory",
    rarity: "epic",
    stats: { atk: 5, def: 5, spd: 0.05, hp: 30 },
    passive: "Ressurrect with 50% HP when defeated once per battle",
  },
  MagiStaff: {
    name: "Magi Staff",
    type: "weapon",
    rarity: "epic",
    stats: { atk: 20, def: 5, spd: 0.1, hp: 20 },
    passive: "Spell power increased by 25%",
  },

  // Legendary Items
  SwordOfEternity: {
    name: "Sword of Eternity",
    type: "weapon",
    rarity: "legendary",
    stats: { atk: 35, def: 5, spd: 0.15, hp: 0 },
    passive: "Every hit drain enemy HP 10% as heal",
  },
  ArmorOfGods: {
    name: "Armor of Gods",
    type: "armor",
    rarity: "legendary",
    stats: { atk: 5, def: 20, spd: 0, hp: 100 },
    passive: "Reflect 20% damage back to attacker",
  },
  CrownOfPower: {
    name: "Crown of Power",
    type: "accessory",
    rarity: "legendary",
    stats: { atk: 15, def: 10, spd: 0.2, hp: 50 },
    passive: "All stats increase by 15%",
  },
};

// Equipment pool untuk setiap rarity
const EquipmentByRarity = {
  common: [Equipment.IronSword, Equipment.LeatherArmor, Equipment.SpeedBoots, Equipment.HealthGem],
  uncommon: [Equipment.SteelSword, Equipment.ChainsArmor, Equipment.FocusRing, Equipment.RestorePotion],
  rare: [Equipment.MithrilSword, Equipment.PlateArmor, Equipment.AgilityCloak, Equipment.CriticalGem, Equipment.LifeAmulet],
  epic: [Equipment.ExcaliburBlade, Equipment.DragonsPlate, Equipment.ShadowCloak, Equipment.PhoenixRing, Equipment.MagiStaff],
  legendary: [Equipment.SwordOfEternity, Equipment.ArmorOfGods, Equipment.CrownOfPower],
};

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
