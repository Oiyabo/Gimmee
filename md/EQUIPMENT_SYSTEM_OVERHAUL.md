# Equipment System Overhaul - Complete Documentation

## Overview
Equipment system has been completely refactored from a simple passive system to a comprehensive dynamic system featuring:
- **Differentiated stats** (Patk, Matk, Tatt, Pdef, Mdef, Pspd, Mspd, HP, Ccrit, Dcrit, Sta, Mana)
- **1-3 random stat bonuses** per equipment piece
- **Special abilities** (0-1 per equipment) with unique mechanics
- **Rarity-based scaling** (Common → Uncommon → Rare → Epic → Legendary)
- **Lore descriptions** for every equipment piece

---

## Equipment Structure Format

### New Format
```javascript
EquipmentName: {
  name: "Display Name",
  type: "weapon|armor|boots|accessory|consumable",
  rarity: "common|uncommon|rare|epic|legendary",
  lore: "Flavor text describing the equipment",
  stats: {
    patk: 5,      // Physical Attack
    pdef: 3,      // Physical Defense
    pspd: 0.15,   // Physical Speed
    // ... 1-3 stats picked from available list
  },
  ability: null   // "abilityName" or null if no ability
}
```

### Old Format (DEPRECATED)
```javascript
EquipmentName: {
  name: "Name",
  type: "weapon",
  rarity: "common",
  stats: { atk: 5, def: 0, spd: 0, hp: 0 },
  passive: "Text description"
}
```

---

## Equipment Abilities System

### 27 Special Abilities Implemented

#### **Offensive Abilities** (6)
| Ability | Effect | Rarity |
|---------|--------|--------|
| **Sharpness** | Attacks cause bleeding (5 turn damage) | Uncommon+ |
| **Armor Break** | Ignore 30% of enemy physical defense | Rare+ |
| **Magnetism** | Reduce enemy magical defense by 20% | Rare+ |
| **Empower** | Increase all damage output by 15% | Rare+ |
| **Momentum** | Damage increases 5% per hit (max 30%) | Epic+ |
| **Executioner** | Critical damage multiplier +0.5x | Epic+ |

#### **Defensive Abilities** (5)
| Ability | Effect | Rarity |
|---------|--------|--------|
| **Reflection** | Reflect 25% of physical damage to attacker | Rare+ |
| **Thorn Reflection** | Attacker takes 15% damage as backlash | Epic+ |
| **Resilience** | Reduce all damage by 10% | Epic+ |
| **Ward** | Magic attacks deal 20% less damage | Epic+ |
| **Fortify** | Increase all defensive stats by 15% | Rare+ |

#### **Utility Abilities** (5)
| Ability | Effect | Rarity |
|---------|--------|--------|
| **Light Weight** | Stamina consumption reduced by 20% | Uncommon+ |
| **Mana Recharge** | Regenerate 10% mana per turn | Rare+ |
| **Stamina Pool** | Increase max stamina by 25 | Epic+ |
| **Vitality** | Heal 5% max HP every turn | Rare+ |
| **Efficiency** | Recover 5 stamina & 5 mana per turn | Epic+ |

#### **Speed & Mobility** (3)
| Ability | Effect | Rarity |
|---------|--------|--------|
| **Swiftness** | Increase Pspd & Mspd by 0.15 | Epic+ |
| **Light Essence** | Enemies 20% less accurate against wearer | Rare+ |
| **Shiny** | Enemies 30% less likely to target wearer | Epic+ |

#### **Precision & Critical** (3)
| Ability | Effect | Rarity |
|---------|--------|--------|
| **Focusing** | Critical hit chance +0.15 (15%) | Rare+ |
| **Precision** | Attacks ignore 20% of enemy defense | Rare+ |
| **Riposte** | Dodging grants +20% damage next hit | Epic+ |

#### **Lifesteal & Vampire** (2)
| Ability | Effect | Rarity |
|---------|--------|--------|
| **Vampirism** | Heal 20% of damage dealt | Epic+ |
| **Siphon** | Drain 10% of enemy max HP as heal | Epic+ |

#### **Crowd Control** (3)
| Ability | Effect | Rarity |
|---------|--------|--------|
| **Hex** | Attackers afflicted with random negative effects | Epic+ |
| **Weakness** | Reduce enemy attack 15% for 4 turns | Epic+ |
| **Nullify** | Remove one random negative status per turn | Epic+ |

#### **Evasion** (2)
| Ability | Effect | Rarity |
|---------|--------|--------|
| **Evasion** | 3 free dodges per battle (reset per round) | Rare+ |
| **Dodge** | 20% chance to completely avoid damage | Rare+ |

#### **Counter Abilities** (2)
| Ability | Effect | Rarity |
|---------|--------|--------|
| **Counter Attack** | 50% chance to attack back when hit | Epic+ |
| **Shield Mastery** | Gain barrier absorbing 15% max HP/turn | Epic+ |

#### **Synergy/Team** (2)
| Ability | Effect | Rarity |
|---------|--------|--------|
| **Synergy** | +10% damage for each alive ally | Legendary |
| **Solidarity** | Share 5% damage with all allies equally | Legendary |

---

## Stat System

### Available Stat Keys
```
Physical:  patk (Physical Attack), pdef (Physical Defense), pspd (Physical Speed)
Magical:   matk (Magical Attack), mdef (Magical Defense), mspd (Magical Speed)
True Dmg:  tatt (True Attack - ignores defenses)
Critical:  ccrit (Critical Chance %), dcrit (Critical Damage multiplier)
Resources: hp, sta (Stamina), mana (Mana)
```

### Stat Ranges by Rarity

#### Common (1 stat)
- patk: 3-6
- matk: 2-4
- pdef: 2-4
- mdef: 1-3
- pspd: 0.08-0.15
- hp: 10-20

#### Uncommon (2 stats)
- patk: 8-12
- matk: 6-10
- pdef: 5-8
- mdef: 3-6
- pspd: 0.10-0.15
- hp: 15-30

#### Rare (2-3 stats)
- patk: 12-18
- matk: 10-16
- pdef: 8-12
- mdef: 6-10
- pspd: 0.12-0.20
- hp: 30-50

#### Epic (2-3 stats)
- patk: 18-28
- matk: 16-26
- pdef: 12-18
- mdef: 10-15
- pspd: 0.15-0.25
- hp: 40-70

#### Legendary (3+ stats)
- patk: 25-40
- matk: 25-40
- pdef: 15-25
- mdef: 15-25
- pspd: 0.20-0.35
- hp: 50-100

---

## Equipment Items by Rarity

### Common (6 items) - No abilities
- Iron Sword (Patk 5)
- Leather Armor (Pdef 3, HP 10)
- Speed Boots (Pspd 0.15)
- Health Gem (HP 20)
- Bronze Dagger (Patk 4, Pspd 0.1)
- Hardened Shell (Pdef 4)

### Uncommon (6 items) - 33% chance of ability
- Steel Sword → **Sharpness** (bleeding)
- Chain Mail
- Focus Ring → **Focusing** (crit boost)
- Restore Potion
- Runed Gloves
- Silver Amulet → **Light Weight** (stamina reduction)

### Rare (7 items) - Variable abilities
- Mithril Sword → **Armor Break**
- Plate Armor → **Fortify**
- Agility Cloak → **Dodge**
- Critical Gem → **Executioner** (crit damage)
- Life Amulet → **Vitality** (HP regen)
- Echo Booklet (Matk-focused)
- Reflective Scutum → **Reflection** (damage bouncing)

### Epic (7 items) - Most abilities
- Excalibur → **Armor Break** (legendary physical)
- Dragon Plate → **Ward** (magical defense)
- Shadow Cloak → **Evasion** (3 dodges/round)
- Phoenix Ring → **Siphon** (life drain)
- Magi Staff → **Mana Recharge**
- Thorned Armor → **Thorn Reflection**
- Swift Silver Ring → **Swiftness**

### Legendary (6 items) - Powerful synergies
- Sword of Eternity → **Vampirism** (20% heal)
- Armor of Gods → **Resilience** (10% dmg reduction)
- Crown of Power → **Synergy** (team buff)
- Void Mantle → **Light Essence** (evasion)
- Staff of the Archmage → **Momentum** (stacking damage)
- Hexbane Amulet → **Nullify** (cleanse debuffs)

---

## New Helper Functions

### `generateRandomEquipmentStats(rarity)`
- Picks 1-3 random stats based on rarity
- Returns object: `{ patk: 5, pdef: 3, ... }`

### `getRandomEquipmentAbility(rarity)`
- Picks random ability from rarity pool
- Returns ability key string or null

### `generateRandomEquipmentWithStats(rarity, typeFilter)`
- Generates complete equipment with random stats AND ability
- If typeFilter provided, picks from matching equipment types
- Returns full equipment object with dynamically rolled stats

### `getRandomEquipment()` [UPDATED]
- Now returns one of predefined equipment from EquipmentByRarity pools
- Can be extended to use `generateRandomEquipmentWithStats()`

---

## Integration with Character System

### Equipment Application
```javascript
// Equipping an item
function giveEquipmentToHero(hero, equip) {
  // Apply each stat from equipment
  Object.entries(equip.stats).forEach(([key, value]) => {
    if (hero[key] !== undefined) {
      hero[key] += value;
    }
  });
  
  // Store equipment reference
  if (!hero.equipment) hero.equipment = [];
  hero.equipment.push(equip);
}
```

### Equipment Removal
```javascript
// Unequipping removes all stat bonuses
function unequipItem(heroIndex, equipIndex) {
  let hero = heroes[heroIndex];
  let equip = hero.equipment[equipIndex];
  
  // Reverse stat bonuses
  Object.entries(equip.stats).forEach(([key, value]) => {
    if (hero[key] !== undefined) {
      hero[key] -= value;
    }
  });
  
  hero.equipment.splice(equipIndex, 1);
}
```

---

## UI Display Updates

### Equipment Card Display
Shows:
- Hero name + Equipment name
- Rarity (COMMON, UNCOMMON, RARE, EPIC, LEGENDARY)
- Lore text (italic flavor description)
- Stat bonuses (e.g., "PATK +5, PDEF +3")
- Ability name & description (if present)
- Unequip button

### Example Display
```
Knight - Iron Sword
⭐ COMMON
"A basic iron sword. Reliable, simple, and effective for beginners."
PATK +5
```

---

## Ability Implementation Guidelines

### For Battle Integration
Each ability's `effect` function should follow pattern:
```javascript
effect: (self, allies, enemies) => {
  // Apply ability logic
  // Modify target status/stats
  // Trigger any special mechanics
}
```

### Passive vs Active
- **Passive Abilities**: Applied automatically each turn (vitality, mana recharge)
- **Counter Abilities**: Trigger when specific condition met (counter attack, reflection)
- **Status Abilities**: Apply effect to attacker (hex, weakness)

---

## Changelog

### What Changed
✅ Replaced 4-stat system (atk/def/spd/hp) with 12-stat differentiated system  
✅ Added 1-3 random stat rolls per equipment by rarity  
✅ Added 27 special abilities covering all gameplay aspects  
✅ Added lore to all 32 equipment items  
✅ Converted from `passive` property to `ability` property  
✅ Updated UI.js to display new stats and ability descriptions  
✅ Created random generation functions for procedural equipment  

### Files Modified
- `equipment.js` - Complete restructure (~1000 lines)
- `UI.js` - Updated stat display & equipment card UI

### Backward Compatibility
❌ **NOT backward compatible** - old equipment object structure will not work  
✅ Conversion can be done by importing old equipment and wrapping with new format  

---

## Example: Creating New Equipment

```javascript
// Static equipment definition
MyNewSword: {
  name: "My Sword",
  type: "weapon",
  rarity: "epic",
  lore: "A legendary blade with untold power.",
  stats: {
    patk: 25,
    dcrit: 0.35,
    ccrit: 0.1
  },
  ability: "armorBreak"
}

// Or generate dynamically
let randomEquip = generateRandomEquipmentWithStats("rare", "weapon");
```

---

## Balance Notes

### Rarity Distribution (in `getRandomEquipment`)
- 60% Common
- 24% Uncommon  
- 12% Rare
- 3% Epic
- 1% Legendary

### Stat Scaling
- Each rarity tier roughly 1.3-1.5x stronger than previous
- Legendary can have triple the stats of Common

### Ability Availability
- Common: No abilities
- Uncommon: 33% chance (6 abilities)
- Rare: High chance (10 abilities)
- Epic: Very high (15 abilities)
- Legendary: Guaranteed (27 abilities)

---

## Future Enhancements

Potential additions:
- Set bonuses (equip 3 items for extra effect)
- Equipment rarity drop tables by area
- Equipment upgrade/enchantment system
- Equipment crafting from materials
- Unique legendary equipment with story
- Equipment synergy bonuses with skills
- Cursed equipment with penalties
- Equipment transformation/transmutation

