# Rest System Documentation

## Overview

The Rest System is a game mechanic that occurs at round and area transitions, allowing heroes to recover resources and manage their equipment/skills. The system prevents equipment modifications during battle and only allows changes during designated rest periods.

---

## Rest Modes

### 1. **Quick Rest** ⏱️
**When:** After completing each Round (3 sets of normal battles)

**What Heals:**
- **HP:** 25% of max HP + (2 × current Set number)
- **Stamina:** 30% of max Stamina + (3 × current Set number)
- **Mana:** 30% of max Mana + (3 × current Set number)

**What's Allowed:**
- ✅ Change equipment (unequip items)
- ✅ Buy stat upgrades (always available)
- ✅ Modify equipment configuration

**What's NOT Allowed:**
- ❌ Skill changes (only at Long Rest)
- ❌ Battle (must continue to next set)

**Log Message Example:**
```
✨ Knight: +28 HP, +30 Sta, +45 Mana
✨ Mage: +24 HP, +15 Sta, +54 Mana
💤 REST MODE - You can change equipment, enhance stats, or modify skills now!
🌙 Quick Rest: Stamina and Mana partially restored!
⚙️ You can now change equipment or enhance items.
```

### 2. **Long Rest** 🌟
**When:** After completing an Area (defeating boss)

**What Heals:**
- **HP:** Fully healed to max
- **Stamina:** Fully restored to max
- **Mana:** Fully restored to max
- **Status Effects:** ALL negative effects removed

**What's Allowed:**
- ✅ Change equipment (unequip items)
- ✅ Buy stat upgrades (always available)
- ✅ Learn new skills
- ✅ Modify equipment configuration
- ✅ Full status cleanup

**What's NOT Allowed:**
- ❌ Battle (must continue to next area)

**Log Message Example:**
```
⭐ Knight: Fully healed and all negative effects cleared!
⭐ Mage: Fully healed and all negative effects cleared!
📚 New Skills Learned:
Knight learned Sharpness!
Rogue learned Shadow Clone!
🎊 Area 2 Complete!
🏛️ Long Rest: Fully healed and all negative effects cleared!
⚙️ You can now change equipment, enhance items, or modify skills.
```

---

## Rest Mode Control

### Global Variable
```javascript
let inRestMode = false; // Tracks if we're in a rest period
```

### Status Indicator
A visual indicator appears on the screen when in rest mode:
```
💤 REST MODE - You can change equipment, enhance stats, or modify skills now!
```

**Styling:**
- 🟢 Green color (#10b981)
- 💫 Pulsing animation
- Appears below stage info
- Automatically hides when battle starts

---

## Activity Restrictions

### Equipment Changes

**Allowed Only During:**
- Quick Rest (after round)
- Long Rest (after area)

**Function:** `unequipItem(heroIndex, equipIndex)`

**Guard Code:**
```javascript
function unequipItem(heroIndex, equipIndex) {
  // Can only unequip during rest mode
  if (!inRestMode) {
    alert("⚠️ Equipment can only be changed during Rest (Round/Area transitions)!");
    return;
  }
  // ... rest of function
}
```

**Error Message:** 
```
⚠️ Equipment can only be changed during Rest (Round/Area transitions)!
```

### Stat Upgrades (Buying)

**Allowed:** ✅ **ALWAYS** (buy system is always available)

**Function:** `buyUpgrade(heroIndex, statType, cost)`

**Note:** No rest mode check needed - players can buy upgrades anytime!

**Example:**
```javascript
// Players can always do this:
buyUpgrade(0, "patk", 3); // Upgrade Knight's P.ATK
```

---

## Rest System Flow

```
Battle Ends (Set Complete)
        ↓
    3 Sets Done?
        ↓
    NO → Continue Next Set
        ↓
    YES → QUICK REST
         ├─ Apply healing (25% HP + 2*set)
         ├─ Restore Stamina (30% + 3*set)
         ├─ Restore Mana (30% + 3*set)
         ├─ inRestMode = true
         ├─ Show transition modal
         ├─ Allow equipment changes
         └─ Wait for player to click "Continue"
         ↓
    Area Complete?
        ↓
    NO → Continue to next round
        ├─ inRestMode = false
        ├─ Hide rest indicator
        └─ Generate new set
        ↓
    YES → LONG REST
         ├─ Apply healing (100% HP/Sta/Mana)
         ├─ Clear all statuses
         ├─ Learn random skills
         ├─ inRestMode = true
         ├─ Show area transition modal
         ├─ Allow all changes
         └─ Wait for player to click "Continue"
         ↓
    Move to Next Area
    ├─ inRestMode = false
    ├─ Hide rest indicator
    └─ Reset for new area
```

---

## Implementation Details

### Rest Trigger Points

**1. Quick Rest Trigger:**
```javascript
// In showRoundTransition()
quickRest(heroes, currentSet);
inRestMode = true;
updateRestModeIndicator();
```

**2. Long Rest Trigger:**
```javascript
// In showAreaTransition()
longRest(heroes);
inRestMode = true;
updateRestModeIndicator();
```

### Rest Exit Points

**1. From Quick Rest:**
```javascript
// In continueFromTransition()
inRestMode = false;
updateRestModeIndicator();
nextRound();
```

**2. From Battle Start:**
```javascript
// In startBattle()
inRestMode = false;
updateRestModeIndicator();
```

---

## Stamina & Mana System

### Rest Restoration Formula

**Quick Rest:**
```javascript
StaminaRestored = Math.floor(hero.maxSta * 0.30) + (3 * setNumber)
ManaRestored = Math.floor(hero.maxMana * 0.30) + (3 * setNumber)
```

**Example (Set 5):**
```
Knight (maxSta: 100, maxMana: 30)
- Stamina: floor(100 * 0.30) + (3 * 5) = 30 + 15 = 45
- Mana: floor(30 * 0.30) + (3 * 5) = 9 + 15 = 24

Priest (maxSta: 60, maxMana: 150)
- Stamina: floor(60 * 0.30) + 15 = 18 + 15 = 33
- Mana: floor(150 * 0.30) + 15 = 45 + 15 = 60
```

**Long Rest:**
```javascript
hero.hp = hero.maxHp;
hero.sta = hero.maxSta;
hero.mana = hero.maxMana;
```

---

## Status Effect Clearing

### Quick Rest
**Action:** ❌ Does NOT automatically clear status effects

**Note:** Only partial relief is provided; negative effects persist until Long Rest

### Long Rest
**Action:** ✅ Removes ALL status effects

**Function Call:**
```javascript
clearAllStatuses(hero); // Defined in statusEffects.js
```

**Effects Cleared:**
- All DoT effects (burn, bleeding, poison, etc.)
- All CC effects (stun, paralyzed, confused, etc.)
- All debuffs (weakened, vulnerable, exposed, etc.)
- All drain effects (vampired, mana shock, etc.)
- EXCEPT beneficial effects (regenerating, shielded, etc.) are also cleared

---

## UI Components

### Rest Mode Indicator

**HTML Element:**
```html
<div id="rest-mode-indicator" class="rest-mode-indicator" style="display:none;">
  💤 REST MODE - You can change equipment, enhance stats, or modify skills now!
</div>
```

**CSS Styling:**
```css
.rest-mode-indicator {
    text-align: center;
    font-size: 16px;
    font-weight: bold;
    color: #10b981;
    background: linear-gradient(135deg, #064e3b, #047857);
    padding: 12px 20px;
    border-radius: 8px;
    margin: 15px 0 0 0;
    border: 2px solid #10b981;
    animation: pulse-green 2s infinite;
}

@keyframes pulse-green {
    0%, 100% { box-shadow: 0 0 10px rgba(16, 185, 129, 0.5); }
    50% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.8); }
}
```

**Show/Hide Function:**
```javascript
function updateRestModeIndicator() {
  const indicator = document.getElementById("rest-mode-indicator");
  if (indicator) {
    indicator.style.display = inRestMode ? "block" : "none";
  }
}
```

---

## Transition Modals

### Quick Rest Modal
**Title:** `🎊 Round {N} Complete!`

**Content:**
```
{Reward Text}

🌙 Quick Rest: Stamina and Mana partially restored!
⚙️ You can now change equipment or enhance items.
```

**Reward Items Shown:**
- Stat points gained
- Equipment gained

### Long Rest Modal
**Title:** `🌟 Area {N} Complete!`

**Content:**
```
{Reward Text}

📚 New Skills Learned:
{Hero Name} learned {Skill Name}!

🏛️ Long Rest: Fully healed and all negative effects cleared!
⚙️ You can now change equipment, enhance items, or modify skills.
```

**Reward Items Shown:**
- Stat points gained
- Equipment gained
- Skills learned

---

## Example Use Cases

### Scenario 1: After Round 1 Completion

```
Round 1 completed (3 sets done)
↓
Quick Rest Triggered
├─ Knight HP: 85/130 → 110/130 (+25)
├─ Mage Mana: 120/180 → 165/180 (+45)
├─ inRestMode = true
├─ Rest indicator shows
└─ Player can unequip items

Player unequips weak armor from Knight
↓
Player clicks "Continue"
├─ inRestMode = false
├─ Rest indicator hides
└─ Round 2 begins
```

### Scenario 2: After Area 1 Completion (Boss Defeated)

```
Boss Defeated - Area 1 Complete
↓
Long Rest Triggered
├─ All heroes HP → maxHp
├─ All heroes Stamina → maxSta
├─ All heroes Mana → maxMana
├─ All statuses cleared
├─ Knight learned "Sharpness"
├─ Rogue learned "Shadow Clone"
├─ inRestMode = true
├─ Rest indicator shows
└─ Player can change equipment and learn skills

Player unequips 3 items and equips new ones
Player buys stat upgrades (always allowed)
Player clicks "Continue"
├─ inRestMode = false
├─ Rest indicator hides
└─ Area 2 Round 1 begins
```

---

## Integration Points

### Files Modified
1. **gameLoop.js**
   - Added `inRestMode` global variable
   - Added `updateRestModeIndicator()` function
   - Added `quickRest(heroTeam, setNumber)` function
   - Added `longRest(heroTeam)` function
   - Updated `showRoundTransition()` to call quickRest
   - Updated `showAreaTransition()` to call longRest
   - Updated `startBattle()` to exit rest mode

2. **UI.js**
   - Updated `unequipItem()` to check `inRestMode`
   - Added guard to prevent equipment changes during battle
   - Kept `buyUpgrade()` always available

3. **index.html**
   - Added rest mode indicator element

4. **style.css**
   - Added `.rest-mode-indicator` styling
   - Added `pulse-green` animation

---

## Testing Checklist

- [ ] Quick rest applies correct HP healing (25% + 2*set)
- [ ] Quick rest applies correct Sta restoration (30% + 3*set)
- [ ] Quick rest applies correct Mana restoration (30% + 3*set)
- [ ] Long rest heals to 100% HP/Sta/Mana
- [ ] Long rest clears all negative status effects
- [ ] Rest indicator appears when entering rest mode
- [ ] Rest indicator hides when exiting rest mode
- [ ] Equipment unequip blocked during battle
- [ ] Equipment unequip allowed during rest
- [ ] Stat upgrades always available (not blocked by rest)
- [ ] Skill learning happens at area transitions
- [ ] Transition modals show correct information
- [ ] Game flows correctly through multiple rounds/areas

---

## Possible Future Enhancements

1. **Skill Swapping** - Allow skill changes during rest
2. **Rest Bonuses** - Additional perks after resting (temp buffs)
3. **Long Rest Cost** - Require resources to access long rest
4. **Partial Rest** - Mid-round healing stations
5. **Rest Camping** - Optional rest between battles
6. **Recovery Items** - Healing items that partially restore outside rest
7. **Rest Events** - Random encounters during rest period
8. **Fatigue System** - Heroes get worse stats if they don't rest

---

**Last Updated:** After Rest System Implementation  
**Status:** ✅ Production Ready
