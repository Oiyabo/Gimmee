# Game Configuration Guide

All game parameters can be adjusted in `gameConfig.js`. This document explains each setting and how it affects gameplay.

## Battle Speed Settings (BATTLE_CONFIG)

### turnExecutionDelay (milliseconds)
- **Default:** 500ms
- **Description:** Delay between monster turns and action execution
- **Effect:** Increase for slower battles, decrease for faster battles

### skillExecutionDelay (milliseconds)  
- **Default:** 600ms
- **Description:** Delay between skill execution and next turn
- **Effect:** Controls overall battle pacing

### transitionDelay (milliseconds)
- **Default:** 800ms
- **Description:** Delay before showing transitions (round/area complete)

### continueDelay (milliseconds)
- **Default:** 500ms
- **Description:** Delay before continuing from transition

---

## Difficulty Scaling Settings (DIFFICULTY_CONFIG)

Each difficulty (relax, normal, focus) has these parameters:

### monsterScaling
- **Relax:** 0.7 (30% weaker monsters)
- **Normal:** 1.0 (standard difficulty)
- **Focus:** 1.5 (50% stronger monsters)
- **Effect:** Multiplies all monster stats

### growthRate
- **Relax:** 0.05 (slow growth)
- **Normal:** 0.10 (normal growth)
- **Focus:** 0.15 (fast growth)
- **Effect:** Growth per area (+ per area)

### experienceMultiplier
- **Relax:** 0.8 (20% less EXP)
- **Normal:** 1.0 (standard EXP)
- **Focus:** 1.3 (30% more EXP)
- **Effect:** Multiplies EXP rewards from monsters

### statCostMultiplier
- **Relax:** 0.8 (cheaper stats)
- **Normal:** 1.0 (standard cost)
- **Focus:** 1.2 (more expensive stats)
- **Effect:** Multiplies stat purchase costs

---

## Monster Generation Settings (MONSTER_CONFIG)

### statVariation
- **Default:** 0.2 (±20%)
- **Description:** Random variation in monster stats
- **Effect:** Each monster differs by up to 20% from template

### skillRandomChance
- **Default:** 0.3 (30%)
- **Description:** Chance each monster gets a bonus random skill
- **Effect:** Adds variety to monsters

### baseScalingPerSet
- **Default:** 0.10 (+10%)
- **Description:** Growth multiplier per set number
- **Effect:** Monsters scale: 1.0, 1.1 (set 1), 1.2 (set 2), 1.3 (set 3)

### baseAreaGrowth
- **Default:** 0.15 (+15%)
- **Description:** Growth multiplier per area
- **Effect:** Monsters scale by area progression

### bossBaseMultiplier
- **Default:** 1.5
- **Description:** Boss stats start at 1.5x normal monster

### experienceBasePerMonster
- **Default:** 50
- **Description:** Base EXP reward per monster defeated

### experiencePerStat
- **Default:** 0.5
- **Description:** EXP multiplier per stat point

### experiencePerSkill
- **Default:** 10
- **Description:** Additional EXP per skill a monster has

---

## Stat Purchase Settings (STAT_PURCHASE_CONFIG)

### baseCosts
Each stat type has a base cost:
- maxHp: 60 EXP
- maxSta: 50 EXP
- maxMana: 50 EXP
- patk: 70 EXP
- matk: 70 EXP
- pdef: 60 EXP
- mdef: 60 EXP

### costIncrementMultiplier
- **Default:** 1.15 (15% increase per purchase)
- **Description:** Each purchase costs this much more than previous
- **Example:** 
  - 1st purchase: 60 EXP
  - 2nd purchase: 60 × 1.15 = 69 EXP
  - 3rd purchase: 69 × 1.15 = 79 EXP

---

## Equipment Enhancement Settings (ENHANCEMENT_CONFIG)

### rarityScaling
Each rarity level has different enhancement bonuses:
- **Common:** +10% stats, +5% ability
- **Uncommon:** +15% stats, +8% ability
- **Rare:** +20% stats, +10% ability
- **Epic:** +25% stats, +12% ability
- **Legendary:** +30% stats, +15% ability

---

## Character Settings (CHARACTER_CONFIG)

### maxEquipSlots
- **Default:** 7
- **Description:** Maximum equipment each hero can equip

### maxSkillSlots  
- **Default:** 4
- **Description:** Maximum active skills each hero can have selected

### startingExperience
- **Default:** 0
- **Description:** Starting EXP for each hero

---

## How to Adjust Difficulty

To change game difficulty, edit the DIFFICULTY_CONFIG section:

### Easier Game (Relax++)
```javascript
relax: {
  monsterScaling: 0.5,        // Even weaker
  growthRate: 0.03,           // Slower growth
  experienceMultiplier: 0.6,  // More EXP needed
  statCostMultiplier: 0.6     // Cheaper stats
}
```

### Harder Game (Focus++)
```javascript
focus: {
  monsterScaling: 2.0,        // Much stronger
  growthRate: 0.25,           // Faster scaling
  experienceMultiplier: 1.5,  // Less EXP
  statCostMultiplier: 1.5     // Expensive stats
}
```

---

## How to Slow Down Battle

To make battles slower (for humans to follow):

1. Increase BATTLE_CONFIG.skillExecutionDelay:
```javascript
skillExecutionDelay: 1000  // 1 second between actions
```

2. Increase BATTLE_CONFIG.turnExecutionDelay:
```javascript
turnExecutionDelay: 800    // 0.8 seconds before execution
```

3. Example for "slow mode":
```javascript
const BATTLE_CONFIG = {
  turnExecutionDelay: 800,
  skillExecutionDelay: 1200,
  transitionDelay: 1000,
  continueDelay: 500
};
```

---

## How to Adjust Monster Strength Per Area

Edit MONSTER_CONFIG values:

### Stronger Monsters
```javascript
baseScalingPerSet: 0.15,      // +15% per set (was 10%)
baseAreaGrowth: 0.20,         // +20% per area (was 15%)
```

### Weaker Monsters  
```javascript
baseScalingPerSet: 0.05,      // +5% per set (was 10%)
baseAreaGrowth: 0.10,         // +10% per area (was 15%)
```

---

## How to Adjust EXP System

To make stat buying easier or harder:

### More EXP from Monsters
```javascript
experienceBasePerMonster: 100,  // 2x more base EXP
experiencePerSkill: 20         // 2x more per skill
```

### Cheaper Stat Purchases
```javascript
baseCosts: {
  maxHp: 30,   // Half price
  patk: 35,
  // ... etc
}
```

### Harder Progression  
```javascript
costIncrementMultiplier: 1.25  // 25% increase per purchase
```
