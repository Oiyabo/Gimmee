# Profile System - Technical Documentation

## 🔧 Architecture Overview

```
┌─────────────────────────────────────────────────┐
│            PROFILE SYSTEM STACK                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  UI LAYER (UI.js)                             │
│  ├─ openProfile() / closeProfile()            │
│  ├─ updateProfileDisplay()                     │
│  └─ User interaction handlers                 │
│            ↓                                    │
│  DATA LAYER (preparation.js)                  │
│  ├─ hero.exp (currency)                       │
│  ├─ hero.selectedSkills (state)               │
│  └─ hero.equipment (state)                    │
│            ↓                                    │
│  REWARD LAYER (gameLoop.js)                   │
│  ├─ collectRoundRewards() → exp               │
│  └─ startBattle() → closeProfile()            │
│            ↓                                    │
│  VIEW LAYER (HTML/CSS)                        │
│  ├─ profile-container (DOM)                   │
│  └─ profile-* elements (styling)              │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 📋 Data Structures

### Character Class (preparation.js)
```javascript
class Character {
  // ... existing properties ...
  
  // NEW - Profile System
  this.exp = 0;                    // Experience points
  this.selectedSkills = [...];     // Active skills for battle
}
```

### Global Profile State (UI.js)
```javascript
let currentProfile = null;  // Hero index being viewed (0-5 or null)

const StatPricing = {
  maxHp:   { base: 5,  increment: 2 },
  maxSta:  { base: 4,  increment: 1.5 },
  maxMana: { base: 4,  increment: 1.5 },
  patk:    { base: 6,  increment: 2 },
  matk:    { base: 6,  increment: 2 },
  pdef:    { base: 5,  increment: 1.5 },
  mdef:    { base: 5,  increment: 1.5 }
};

let statPurchases = {
  maxHp:   0,  // # times bought
  maxSta:  0,
  maxMana: 0,
  patk:    0,
  matk:    0,
  pdef:    0,
  mdef:    0
};
```

---

## 🛠️ Core Functions Reference

### Profile Control

#### `openProfile(heroIndex: number): void`
Opens profile for specified hero with permission checks.

**Parameters:**
- `heroIndex` (0-5) - Which hero to display

**Guards:**
```javascript
if (running && !inRestMode) {
  alert("⚠️ You can only manage profiles during Rest periods!");
  return;
}
```

**Process:**
1. Check permissions
2. Set `currentProfile = heroIndex`
3. Setup DOM
4. Call `updateProfileDisplay()`

**Example:**
```javascript
// From createUI(), hero block onclick
div.onclick = (e) => {
  e.stopPropagation();
  openProfile(heroes.indexOf(char));
};
```

---

#### `closeProfile(): void`
Closes profile and resets state.

**Process:**
1. Hide profile container
2. Reset `currentProfile = null`
3. Clear description panels
4. Cleanup event listeners

**Auto-triggered:**
- When clicking close button [✕]
- When starting battle (in `startBattle()`)
- When switching to different hero

---

#### `updateProfileDisplay(): void`
Main refresh function - updates ALL profile sections.

**Called by:**
- `openProfile()` - Initial display
- `selectSkillForProfile()` - After skill toggle
- `unequipFromProfile()` - After equipment change
- `buyStatFromProfile()` - After stat purchase

**Process:**
```javascript
function updateProfileDisplay() {
  let hero = heroes[currentProfile];
  
  // Update all 4 sections
  updateProfileStats(hero);
  updateProfileEquipment(hero);
  updateProfileSkills(hero);
  updateProfileBuyStats(hero);
  
  // Update header
  document.getElementById("profile-name").textContent = 
    `${hero.name} (Area ${currentArea}) - EXP: ${hero.exp}`;
}
```

---

### Display Functions

#### `updateProfileStats(hero: Character): void`
Displays 8 base stats in grid format.

**HTML Generated:**
```html
<div class="profile-section">
  <h3>📊 Base Stats</h3>
  <div class="stat-row">
    <div><strong>Max HP:</strong> <span>150</span></div>
    <div><strong>P.ATK:</strong> <span>20</span></div>
  </div>
  <!-- ... more rows ... -->
</div>
```

**Stats shown:**
1. maxHp
2. patk
3. matk
4. tatt (magic attack/threat)
5. pdef
6. mdef
7. speed (fastest available)
8. ccrit (crit chance)

---

#### `updateProfileEquipment(hero: Character): void`
Lists all equipped items with unequip buttons.

**HTML Generated:**
```html
<div class="profile-section">
  <h3>⚔️ Equipment</h3>
  <div class="equipment-option" onclick="showItemDescription(0)">
    <div class="item-header">
      <strong>Sword</strong>
      <button onclick="unequipFromProfile(herIdx, 0)" class="unequip-btn">
        [Unequip]
      </button>
    </div>
    <div class="item-stats">+3 P.ATK, +1 P.DEF</div>
    <div class="item-ability">Ability: Double Strike (chance to attack twice)</div>
  </div>
  <!-- ... repeat for each equipped item ... -->
</div>
```

**Process:**
1. Iterate `hero.equipment[]`
2. For each item, get name, stats, ability
3. Add onclick to show description
4. Add unequip button with guard check

---

#### `updateProfileSkills(hero: Character): void`
Lists all skills with selection status.

**HTML Generated:**
```html
<div class="profile-section">
  <h3>🔮 Skills</h3>
  <div class="skill-option" onclick="showSkillDescription(...)">
    <div class="skill-header">
      <strong>⚔️ Knight Slash</strong>
      <span class="selected-badge">✓</span>  <!-- if selected -->
    </div>
    <div class="skill-cost">Costs: 20 Mana</div>
  </div>
  <!-- ... repeat for each available skill ... -->
</div>
```

**Selection logic:**
- ✓ appears if skill in `hero.selectedSkills`
- Click toggles via `selectSkillForProfile(skillIdx)`

---

#### `updateProfileBuyStats(hero: Character): void`
Lists 7 purchasable stats with prices and affordability.

**HTML Generated:**
```html
<div class="profile-section">
  <h3>💰 Upgrade Stats with EXP</h3>
  <div class="buy-option" onclick="buyStatFromProfile(heroIdx, 'maxHp')">
    <div class="stat-header">
      <strong>❤️ Max HP</strong>
      <span class="price-badge">+10 | Cost: 5 EXP</span>
    </div>
    <div class="affordability">✓ You have 150 EXP</div>
  </div>
  <!-- ... repeat for each stat ... -->
</div>
```

**Pricing calculation:**
```javascript
let price = getStatPrice('maxHp');  // 5, 7, 9, 11...
let canAfford = hero.exp >= price;

// Color coded:
// Green = can afford
// Red = cannot afford
```

---

### Pricing System

#### `getStatPrice(statType: string): number`
Calculates dynamic price with inflation.

**Formula:**
```
price = base + (increment × statPurchases[statType])
```

**Example (maxHp):**
```javascript
// Purchase #1: 5 + (2 × 0) = 5
// Purchase #2: 5 + (2 × 1) = 7
// Purchase #3: 5 + (2 × 2) = 9
// Purchase #4: 5 + (2 × 3) = 11
```

**Implementation:**
```javascript
function getStatPrice(statType) {
  let config = StatPricing[statType];
  let currentPurchases = statPurchases[statType];
  return Math.floor(
    config.base + (config.increment * currentPurchases)
  );
}
```

---

### Interaction Handlers

#### `selectSkillForProfile(skillIdx: number): void`
Toggles skill in active skill set.

**Process:**
1. Get skill from `skills[]` array
2. Check if in `hero.selectedSkills`
3. If present: remove
4. If absent: add
5. Call `updateProfileDisplay()`

**Code:**
```javascript
function selectSkillForProfile(skillIdx) {
  if (!inRestMode) {
    alert("⚠️ Skills can only be changed during Rest!");
    return;
  }
  
  let hero = heroes[currentProfile];
  let skill = skills[skillIdx];
  let idx = hero.selectedSkills.findIndex(s => s.name === skill.name);
  
  if (idx !== -1) {
    hero.selectedSkills.splice(idx, 1);  // Remove
  } else {
    hero.selectedSkills.push(skill);     // Add
  }
  
  updateProfileDisplay();
}
```

---

#### `unequipFromProfile(heroIdx: number, equipIdx: number): void`
Removes equipment with permission check.

**Guards:**
```javascript
if (!inRestMode) {
  alert("⚠️ Equipment can only be changed during Rest!");
  return;
}
```

**Process:**
1. Get hero & equipment
2. Remove from hero.equipment[]
3. Add to inventory (if exists)
4. Update display

---

#### `buyStatFromProfile(heroIdx: number, statType: string): void`
Purchases stat upgrade with EXP.

**Guards:**
```javascript
if (!inRestMode) {
  alert("⚠️ Stats can only be bought during Rest!");
  return;
}
```

**Process:**
1. Calculate price with `getStatPrice()`
2. Check hero has enough EXP
3. Deduct EXP
4. Increase stat value
5. Increment purchase counter
6. Heal proportionally
7. Update display

**Code Example (maxHp):**
```javascript
if (statType === 'maxHp') {
  let price = getStatPrice('maxHp');
  if (hero.exp < price) {
    alert(`Not enough EXP! Need ${price}, have ${hero.exp}`);
    return;
  }
  
  hero.exp -= price;
  hero.maxHp += 10;
  hero.hp = Math.min(hero.hp + 10, hero.maxHp);
  statPurchases.maxHp++;
  
  updateProfileDisplay();
}
```

---

#### `showItemDescription(equipIdx: number): void`
Displays equipment details in description panel.

**Shown:**
- Equipment name & rarity
- All stat bonuses
- Special ability & description
- Item lore

**HTML:**
```html
<div class="description-panel">
  <h3>⚔️ Sword</h3>
  <div class="item-info">
    <div>Rarity: <span class="rare">Rare</span></div>
    <div>Stats: +3 P.ATK, +1 P.DEF</div>
    <div>Ability: Double Strike</div>
    <div class="lore">A well-crafted sword...</div>
  </div>
</div>
```

---

#### `showSkillDescription(name: string, lore: string, resource: string, cost: number): void`
Displays skill details in description panel.

**Shown:**
- Skill name
- Resource type (Mana/Stamina)
- Cost amount
- Cooldown
- Skill lore/description

**HTML:**
```html
<div class="description-panel">
  <h3>⚔️ Knight Slash</h3>
  <div class="skill-info">
    <div>Cost: 20 <span class="mana">Mana</span></div>
    <div>Cooldown: 1 turn</div>
    <div class="lore">A powerful sword strike...</div>
  </div>
</div>
```

---

## 🔗 Integration Points

### preparation.js → UI.js
```javascript
// Character data accessed by profile
let hero = heroes[currentProfile];
hero.exp              // Display & modify
hero.equipment[]      // Display & unequip
hero.selectedSkills[] // Display & toggle
hero.skills[]         // Show available
```

### gameLoop.js → UI.js
```javascript
// Triggered from game loop
closeProfile();  // In startBattle()

// Access to globals
running          // Permission check
inRestMode       // Permission check
currentArea      // Display in header
currentSet       // Calculate EXP
```

### gameLoop.js → preparation.js
```javascript
// EXP generation
heroes.forEach(h => {
  h.exp += expReward;
});
```

---

## 🎯 State Transitions

### Profile Open State
```
currentProfile = null
          ↓
Player clicks hero
          ↓
openProfile(heroIdx) called
          ↓
Guard checks: running && !inRestMode?
          ↓
currentProfile = heroIdx
          ↓
DOM shown with profile-container
          ↓
User interacts (click skill/item/buy)
          ↓
Handler functions modify hero data
          ↓
updateProfileDisplay() refreshes UI
          ↓
Player clicks close or battle starts
          ↓
closeProfile() called
          ↓
currentProfile = null
          ↓
DOM hidden
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────┐
│  GAME STARTS        │
│  Heroes initialized │
│  hero.exp = 0       │
│  hero.selectedSkills│
│    = [...skills]    │
└──────────┬──────────┘
           │
          ▼
┌─────────────────────┐
│  BATTLE ROUND       │
│  Combat happens     │
└──────────┬──────────┘
           │
          ▼
┌─────────────────────────────────────┐
│  collectRoundRewards()              │
│  hero.exp += 15 + (set * 3)        │
│  OR                                 │
│  hero.exp += 40 + (area * 10)      │
└──────────┬──────────────────────────┘
           │
          ▼
┌─────────────────────────────────────┐
│  REST MODE ACTIVE                   │
│  Player can click hero to open       │
│  profile                            │
└──────────┬──────────────────────────┘
           │
          ▼
┌─────────────────────────────────────┐
│  PROFILE OPENED                     │
│  User sees:                         │
│  - Current EXP balance              │
│  - Available stat upgrades          │
│  - Equipment to manage              │
│  - Skills to select                 │
└──────────┬──────────────────────────┘
           │
       ┌───┴────────────────────────┐
       │                            │
      ▼                            ▼
┌──────────────────┐      ┌──────────────────┐
│  BUY STAT        │      │  SELECT SKILL    │
│  hero.exp        │      │  Toggle in       │
│  -= price        │      │  selectedSkills[]│
│  stat += value   │      │                  │
│  price ++        │      │                  │
└──────┬───────────┘      └──────┬───────────┘
       │                         │
       └───────────┬─────────────┘
                   │
                  ▼
        ┌──────────────────────┐
        │  updateProfile       │
        │  Display()           │
        │  All changes visible │
        └──────────┬───────────┘
                   │
              [continue]
                   │
                  ▼
        ┌──────────────────────┐
        │  NEXT ROUND          │
        │  Use selectedSkills[]│
        │  With new stats      │
        └──────────────────────┘
```

---

## 🔐 Permission System

```
ACTION          | REST | BATTLE | RESULT
─────────────────────────────────────────
Open profile    | ✅   | ❌     | Alert
Close profile   | ✅   | ✅     | Auto
Unequip         | ✅   | ❌     | Alert
Buy stat        | ✅   | ❌     | Alert
Select skill    | ✅   | ❌     | Alert
View item desc  | ✅   | ✅     | OK
View skill desc | ✅   | ✅     | OK
```

---

## 🧪 Testing Scenarios

### Scenario 1: Price Scaling
```javascript
// Test getStatPrice() scaling
console.log(getStatPrice('maxHp'));  // 5
statPurchases.maxHp = 1;
console.log(getStatPrice('maxHp'));  // 7
statPurchases.maxHp = 2;
console.log(getStatPrice('maxHp'));  // 9
```

### Scenario 2: EXP Flow
```javascript
// Before round
hero.exp = 0;

// After normal round (set 1)
// Expected: 15 + (1 × 3) = 18
hero.exp = 18;

// After boss round (area 2)
// Expected: 40 + (2 × 10) = 60
hero.exp += 60;  // Total 78
```

### Scenario 3: Stat Purchase
```javascript
// Initial state
hero.maxHp = 150;
hero.hp = 150;
hero.exp = 100;

// Buy maxHp
buyStatFromProfile(0, 'maxHp');

// Expected:
hero.maxHp = 160;    // +10
hero.hp = 160;       // proportional heal
hero.exp = 95;       // -5 (price)
```

### Scenario 4: Skill Toggle
```javascript
// Initial
hero.selectedSkills = [skills[0], skills[1]];

// Toggle skill[2] on
selectSkillForProfile(2);
// Result: [skills[0], skills[1], skills[2]]

// Toggle skill[0] off
selectSkillForProfile(0);
// Result: [skills[1], skills[2]]
```

---

## 🐛 Debug Commands (Console)

```javascript
// Check profile state
console.log('Current Profile:', currentProfile);
console.log('Profile Visible:', document.querySelector('.profile-container').style.display);

// Check hero EXP
console.log('Hero 0 EXP:', heroes[0].exp);

// Check pricing
console.log('Stat Pricing:', StatPricing);
console.log('Purchase Count:', statPurchases);

// Check selected skills
console.log('Hero 0 Selected Skills:', heroes[0].selectedSkills);

// Manually open profile (dev)
openProfile(0);

// Manually close profile (dev)
closeProfile();

// Force price recalculation
function debugPrice(stat) {
  let config = StatPricing[stat];
  let purchases = statPurchases[stat];
  console.log(`${stat}: ${config.base} + ${config.increment} × ${purchases} = ${config.base + config.increment * purchases}`);
}
```

---

## 📝 Modification Guide

### Add New Buyable Stat
1. Add to `StatPricing`:
```javascript
const StatPricing = {
  // ... existing ...
  newStat: { base: 10, increment: 2.5 }
};
```

2. Add to `statPurchases`:
```javascript
let statPurchases = {
  // ... existing ...
  newStat: 0
};
```

3. Add case in `buyStatFromProfile()`:
```javascript
if (statType === 'newStat') {
  hero.newStat += 5;  // Increment amount
  // ... rest of logic
}
```

4. Add to display in `updateProfileBuyStats()`:
```javascript
// Add HTML generation for new stat
```

### Change Price Formula
Edit `StatPricing`:
```javascript
// Current: base + (increment × purchases)
// Change increment for slower/faster scaling

maxHp: { base: 5, increment: 1 }  // Slower
maxHp: { base: 5, increment: 3 }  // Faster
```

### Adjust EXP Rewards
Edit `collectRoundRewards()` in gameLoop.js:
```javascript
// Change formula
let expReward = 20 + currentSet * 5;  // Different scaling
```

---

**Status:** ✅ **COMPLETE**  
**Version:** 1.0 - Technical Docs  
**Last Updated:** {current date}