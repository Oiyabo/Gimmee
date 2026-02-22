# Negative Effect Status System - Complete Documentation

## Overview

Comprehensive status effects system with **35+ effects** covering:
- **Damage Over Time (DoT)** - burn, bleeding, poisoned, frostbite, cursed
- **Crowd Control (CC)** - stun, paralyzed, confused, slowed, rooted, silenced, disarmed, petrified
- **Stat Debuffs** - weakened, vulnerable, exhausted, brittle, exposed, blinded
- **Resource Drains** - vampired, manaShock, staminaDrain
- **Special Effects** - charmed, marked, regenerating, shielded, berserk, enlightened, stealth
- **Advanced Effects** - mindControlled, timeSlowed, timeHasted, nullified, cursedArtifact

---

## Status Effect Categories

### 1. Damage Over Time (DoT) - 5 Effects

#### burn 🔥
- **Severity:** High
- **Duration:** 5 seconds
- **Tick Interval:** Every 1 second
- **Damage:** 8-12% of max HP per tick
- **Description:** Intense heat dealing continuous damage
- **Source:** Fire-based spells, hot equipment

#### bleeding 🩸
- **Severity:** Medium
- **Duration:** 7 seconds
- **Tick Interval:** Every 1.5 seconds
- **Damage:** 5-8% of max HP per tick
- **Debuff:** Physical Speed -20%
- **Description:** Open wounds leaking vital essence
- **Source:** Sharp weapon abilities (Sharpness equipment ability)

#### poisoned ☠️
- **Severity:** Medium
- **Duration:** 8 seconds
- **Tick Interval:** Every 2 seconds
- **Damage:** 4% of max HP per tick
- **Description:** Toxic substance slowly destroying body
- **Source:** Poison-based skills, toxic equipment

#### frostbite ❄️
- **Severity:** Low
- **Duration:** 6 seconds
- **Tick Interval:** Every 1.5 seconds
- **Damage:** 3% of max HP per tick
- **Debuff:** Magical Speed -15%
- **Description:** Extreme cold slowing magical abilities
- **Source:** Ice/frost spells

#### cursed 👿
- **Severity:** High
- **Duration:** 10 seconds
- **Tick Interval:** Every 1 second
- **Damage:** 6% of max HP per tick
- **Debuff:** All stats -10%
- **Description:** Dark curse weakening all abilities
- **Source:** Cursed items, dark magic spells

---

### 2. Crowd Control (CC) - 8 Effects

#### stun ⚡ (CRITICAL)
- **Severity:** Critical
- **Duration:** 2 seconds
- **Effect:** Complete immobilization - NO SKILLS at all
- **Block:** All skills (physical + magical)
- **Description:** Stunned and unable to act
- **Source:** High-impact physical attacks, electric spells
- **Note:** Shortest CC duration but most restrictive

#### paralyzed 💤 (HIGH)
- **Severity:** High
- **Duration:** 4 seconds
- **Fail Chance:** 50% chance to fail any skill
- **Effect:** Skills may fail but not guaranteed
- **Description:** Nervous system overwhelmed
- **Source:** Lightning abilities, electrical equipment
- **Note:** Longer than stun but less restrictive

#### confused 😵
- **Severity:** High
- **Duration:** 5 seconds
- **Target Swap Chance:** 60% chance to attack allies
- **Effect:** Behavioral confusion
- **Description:** Mind scrambled, friendly fire possible
- **Source:** Mental magic, disorienting effects

#### slowed 🐌
- **Severity:** Medium
- **Duration:** 6 seconds
- **Debuff:** Physical Speed -60%, Magical Speed -60%
- **Effect:** All actions take longer
- **Description:** Movement and thought slowed
- **Source:** Cursing spells, thorny obstacles

#### rooted 🌳
- **Severity:** High
- **Duration:** 4 seconds
- **Debuff:** Physical Speed -60%
- **Effect:** Cannot move
- **Description:** Trapped in place
- **Source:** Nature magic, binding spells

#### silenced 🔇
- **Severity:** High
- **Duration:** 3 seconds
- **Block:** All magical skills
- **Effect:** Cannot cast spells
- **Description:** Vocal cords locked
- **Source:** Magic suppression, dimensional rifts

#### disarmed 🚫
- **Severity:** High
- **Duration:** 3 seconds
- **Block:** All physical skills
- **Effect:** Cannot use physical attacks
- **Description:** Weapons bound or stolen
- **Source:** Disarming abilities, magical locks

#### petrified 🪨 (CRITICAL)
- **Severity:** Critical
- **Duration:** 3 seconds
- **Effect:** Complete immobilization + Defense +200%
- **Block:** All actions
- **Special:** Cannot act but extremely defensive
- **Description:** Turned to solid stone
- **Source:** Petrifying gaze, ancient magic

---

### 3. Stat Reduction Debuffs - 6 Effects

#### weakened 💪
- **Severity:** Medium
- **Duration:** 5 seconds
- **Debuff:** Physical Attack -30%
- **Description:** Muscles weakened
- **Source:** Weakening spells, certain equipment abilities

#### vulnerable 🛡️❌
- **Severity:** High
- **Duration:** 4 seconds
- **Debuff:** Physical Defense -35%, Magical Defense -20%
- **Description:** Defenses compromised
- **Source:** Armor-breaking abilities, exposure spells

#### exhausted 😫
- **Severity:** High
- **Duration:** 6 seconds
- **Debuff:** All Speed -50%, Physical Attack -20%
- **Description:** Fatigued and worn out
- **Source:** Stamina-draining abilities, long battles

#### brittle ⛏️
- **Severity:** High
- **Duration:** 5 seconds
- **Effect:** Take 20% MORE physical damage
- **Description:** Structural integrity compromised
- **Source:** Shattering spells, brittle curse

#### exposed 👁️
- **Severity:** Medium
- **Duration:** 4 seconds
- **Debuff:** Magical Defense -40%
- **Description:** Magical shields stripped away
- **Source:** Dispelling magic, mage-killer abilities

#### blinded 👁️❌
- **Severity:** Medium
- **Duration:** 4 seconds
- **Debuff:** Accuracy -60%, Critical Hit Chance -50%
- **Effect:** Cannot see properly
- **Description:** Eyes obstructed or damaged
- **Source:** Blinding abilities, flashy effects

---

### 4. Resource Drain Effects - 3 Effects

#### vampired 🧛
- **Severity:** High
- **Duration:** 8 seconds
- **Tick Interval:** Every 1 second
- **Drain:** 3% max HP per tick
- **Callback:** Source gets 50% of drained HP
- **Description:** Lifeforce drained to heal attacker
- **Source:** Vampirism equipment ability, blood magic

#### manaShock ⚡📊
- **Severity:** Medium
- **Duration:** 6 seconds
- **Tick Interval:** Every 1 second
- **Drain:** 2% max Mana per tick
- **Description:** Magical energy disrupted
- **Source:** Anti-magic spells, mana disruption

#### staminaDrain 😤
- **Severity:** Medium
- **Duration:** 5 seconds
- **Tick Interval:** Every 1 second
- **Drain:** 3% max Stamina per tick
- **Description:** Physical reserves depleted
- **Source:** Energy-sapping abilities

---

### 5. Special Effects - 6 Effects

#### charmed 💕
- **Severity:** Medium
- **Duration:** 5 seconds
- **Effect:** 30% chance to attack weaker target or skip turn
- **Description:** Charmed or distracted
- **Source:** Charm spells, seduction magic

#### marked 🎯
- **Severity:** Medium
- **Duration:** 7 seconds
- **Debuff:** Enemies gain +25% Critical Hit Chance vs you
- **Description:** Marked as target
- **Source:** Mark abilities, hunter's mark skills

#### regenerating 💚 (BUFF)
- **Severity:** Positive
- **Duration:** 10 seconds
- **Tick Interval:** Every 1 second
- **Heal:** 4% max HP per tick
- **Description:** Continuous healing
- **Source:** Regeneration skills, healing abilities

#### shielded 🛡️ (BUFF)
- **Severity:** Positive
- **Duration:** 8 seconds
- **Boost:** Physical Defense +50%
- **Special:** Absorbs one attack
- **Description:** Protected by magical barrier
- **Source:** Shield spells, protection abilities

#### berserk 🔴 (MIXED)
- **Severity:** Mixed (positive + negative)
- **Duration:** 6 seconds
- **Boost:** Physical Attack +60%
- **Debuff:** Physical Defense -40%
- **Description:** Rage mode - more damage but vulnerable
- **Source:** Rage skills, berserker abilities

#### enlightened ✨ (BUFF)
- **Severity:** Positive
- **Duration:** 7 seconds
- **Boost:** Magical Attack +50%, Magical Speed +30%
- **Description:** Enhanced magical power
- **Source:** Enlightenment spells, mage buffs

#### stealth 🌑 (BUFF)
- **Severity:** Positive
- **Duration:** 8 seconds
- **Effect:** Enemies 80% less likely to target you
- **Special:** Breaks on attack
- **Description:** Hidden from notice
- **Source:** Stealth abilities, hiding spells

---

### 6. Advanced Effects - 5 Effects

#### mindControlled 🧠 (CRITICAL)
- **Severity:** Critical
- **Duration:** 3 seconds
- **Effect:** Full control passes to enemy
- **Block:** All player actions
- **Description:** Mind hijacked by enemy
- **Source:** Mind control spells, psychic attacks

#### timeSlowed ⏱️
- **Severity:** High
- **Duration:** 4 seconds
- **Multiplier:** Actions take 2x longer
- **Debuff:** All Speed -70%
- **Description:** Time moves slowly around you
- **Source:** Time magic, temporal spells

#### timeHasted ⚡⏱️ (BUFF)
- **Severity:** Positive
- **Duration:** 6 seconds
- **Multiplier:** Actions take 50% time
- **Boost:** Speed +50%
- **Description:** Time accelerates for you
- **Source:** Haste spells, speed buffs

#### nullified 🚫
- **Severity:** High
- **Duration:** 3 seconds
- **Effect:** Next skill is completely negated
- **Description:** Magical/physical nullification
- **Source:** Nullify abilities, magic suppression

#### cursedArtifact 🗿
- **Severity:** High
- **Duration:** 7 seconds
- **Effect:** Random stat reduced by 40% each turn
- **Description:** Corrupted by cursed item
- **Source:** Ancient curse items, cursed equipment

---

## Integration Guide

### Applying Status to Character

```javascript
// Basic status application
applyStatus(character, "burn");

// With custom duration
applyStatus(character, "burn", 8);

// With source tracking (for vampire, etc.)
applyStatus(target, "vampired", 8, sourceCharacter);
```

### Checking for Status

```javascript
// Check if character has specific status
if (hasStatus(character, "stun")) {
  // Character cannot act
}

// Get all active statuses
let statuses = getActiveStatuses(character);

// Get status string for display
let statusStr = getStatusInfoString(character); // "🔥 Burn (3.2s), 🩸 Bleeding (2.1s)"

// Get status icons only
let icons = getStatusIcon(character); // "🔥🩸"
```

### Removing Status

```javascript
// Remove one specific status
removeStatus(character, "burn");

// Clear all statuses
clearAllStatuses(character);
```

### Assigning to Skills

```javascript
// In skill effect function
mySkill: {
  name: "Blazing Inferno",
  effect: (self, allies, enemies) => {
    enemies.forEach(enemy => {
      applyStatus(enemy, "burn", 6, self);
    });
  }
}
```

### Assigning to Equipment Abilities

```javascript
// In equipment ability definition
fire_aura: {
  name: "Fire Aura",
  description: "Burn nearby enemies",
  effect: (character, allies, enemies) => {
    enemies.forEach(e => {
      if (calculateDistance(character.gridPosition, e.gridPosition) <= 3) {
        applyStatus(e, "burn", 5, character);
      }
    });
  }
}
```

---

## Effect Severity Levels

| Level | Color | Effects |
|-------|-------|---------|
| Critical | Red | stun, petrified, mindControlled |
| High | Orange | bleeding, vulnerable, paralyzed, rooted, silenced, disarmed, exhausted, brittle, cursed, timeSlowed, nullified, cursedArtifact |
| Medium | Yellow | poisoned, frostbite, weakened, exposed, blinded, charmed, marked, manaShock, staminaDrain, slowed |
| Low | Green | burn (spread out), frostbite |
| Positive | Blue | regenerating, shielded, enlightened, stealth, timeHasted |
| Mixed | Purple | berserk (high damage but low defense) |

---

## Status Duration Tiers

**Very Short (2-3s):** stun, petrified, mindControlled, silenced, disarmed, nullified  
**Short (4-5s):** paralyzed, rooted, vulnerable, exposed, blinded, charmed, timeSlowed  
**Medium (6-7s):** bleeding, frostbite, slowed, exhausted, brittle, marked  
**Long (8-10s):** vampired, shielded, stealth, burn, poisoned, cursed  

---

## Damage Calculation with Status Effects

When character with status takes damage:

```
baseDamage = attacker.patk vs defender.pdef

// Check if brittle (take 20% more)
if (hasStatus(defender, "brittle")) {
  baseDamage *= 1.2;
}

// Check if shielded (defense boost)
if (hasStatus(defender, "shielded")) {
  baseDamage *= 0.5; // 50% defense
}

// Check if berserk (defense reduction)
if (hasStatus(defender, "berserk")) {
  baseDamage *= 1.4; // -40% defense
}

finalDamage = Math.max(1, baseDamage - defender.pdef);
```

---

## Skill Failure with Status Effects

When character tries to use skill:

```
// Check if stun (100% block)
if (hasStatus(self, "stun")) {
  return; // Cannot act at all
}

// Check if silenced (block magic skills)
if (hasStatus(self, "silenced") && skill.resource === "mana") {
  return; // Cannot use magical skills
}

// Check if disarmed (block physical skills)
if (hasStatus(self, "disarmed") && skill.resource === "sta") {
  return; // Cannot use physical skills
}

// Check if paralyzed (50% fail chance)
if (hasStatus(self, "paralyzed")) {
  if (Math.random() < 0.5) {
    return; // Skill fails
  }
}

// Check if confused (60% chance to attack ally)
if (hasStatus(self, "confused")) {
  if (Math.random() < 0.6) {
    target = random(allies); // Attack ally instead
  }
}

// Execute skill normally
executeSkill(self, target, skill);
```

---

## Status Effect Interactions

**Stacking:** Multiple DoTs stack (burn + bleeding + poison = triple damage)  
**Overwrite:** Some statuses overwrite (timeHasted + timeSlowed = last applied wins)  
**Synergy:** Vulnerable + Brittle = massively increased incoming damage  
**Immunity:** petrified + shielded = invincible but cannot act  

---

## Equipment Ability Integration

Many equipment abilities apply status:

- **Sharpness** → bleeding
- **Hex** → random negative status
- **Weakness** → weakened
- **Nullify** → removes random negative status
- **Vampirism** → vampired (on target)
- **Empower** → berserk-like boost
- **Ward** → partial damage reduction (like shielded-lite)

---

## Future Enhancements

- Status immunity levels (boss immune to certain effects)
- Status effect chains (burn → poison after 5 sec)
- Cleanse/removal abilities
- Status boost items
- Condition-triggered effects (when 25% HP, apply stealth)
- Permanent curses
- Status effect resummoning system

