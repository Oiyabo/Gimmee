# UI Profile System - Complete Implementation

## 🎯 Overview

Mengganti sistem Shop Tab dengan UI Profile yang lebih interaktif dan detail. Pemain sekarang bisa klik character-block untuk membuka profile khusus karakter dan mengelola stats, equipment, dan skills secara individual.

---

## ✨ Key Features

### 1. **Click-to-Open Profile**
- Klik character-block di Heroes section untuk membuka profile
- Hanya bisa dibuka saat:
  - Battle belum dimulai
  - Dalam Rest Mode (Quick-Rest atau Long-Rest)
- Satu profile ditampilkan sekaligus
- Bisa klik hero lain untuk switch profile

### 2. **Profile UI Layout**

**Left Panel:**
- 📊 Base Stats (menampilkan 8 stats)
- ⚔️ Equipment (list equipment yang equipped)

**Right Panel:**
- 🔮 Skills (list semua skill untuk dipilih)
- 💰 Upgrade Stats (beli stats dengan EXP)
- Deskripsi contextual untuk items/skills

### 3. **Equipment Management**
- **Lihat equipped items** dengan stats dan abilities
- **Click item** untuk melihat description detail
- **Unequip button** untuk setiap item (only during rest)
- Stats bonuses ditampilkan jelas

### 4. **Skill Selection System**
- Lihat semua available skills
- Click skill untuk toggle selection
- Selected skills highlighted ✓
- Show cost (resource + mana/stamina)
- Click skill untuk lihat description

### 5. **Dynamic Pricing System for Stats**

Setiap stat punya pricing yang berbeda dan naik setiap kali membeli:

```javascript
StatPricing = {
  maxHp: { base: 5, increment: 2 },      // 5, 7, 9, 11...
  maxSta: { base: 4, increment: 1.5 },   // 4, 5.5, 7, 8.5...
  maxMana: { base: 4, increment: 1.5 },  // 4, 5.5, 7, 8.5...
  patk: { base: 6, increment: 2 },       // 6, 8, 10, 12...
  matk: { base: 6, increment: 2 },       // 6, 8, 10, 12...
  pdef: { base: 5, increment: 1.5 },     // 5, 6.5, 8, 9.5...
  mdef: { base: 5, increment: 1.5 }      // 5, 6.5, 8, 9.5...
}
```

**Harga naik otomatis** dengan formula: `base + (increment × purchases)`

### 6. **EXP System**
- Heroes mendapat EXP setelah menyelesaikan round
- EXP digunakan untuk membeli stat upgrades
- Display EXP yang tersisa di profile

**EXP Rewards:**
- Normal Round: 15 + (currentSet × 3)
- Boss Round: 40 + (currentArea × 10)

### 7. **Description Panels**
Muncul saat click item/skill:
- **Skill Description:** Nama, lore, cost
- **Item Description:** Nama, rarity, stats, ability, lore

---

## 📁 Files Modified

### 1. **index.html**
**Perubahan:**
- ❌ Removed: `shop-tab-container` dengan tabs (stats/equipment)
- ✅ Added: `profile-container` dengan structure baru
  - Profile header (nama hero, tombol close)
  - Left panel (stats, equipment)
  - Right panel (skills, buy stats)
  - Description panels (skill & item)

```html
<div id="profile-container" class="profile-container">
  <div class="profile-header">...</div>
  <div class="profile-content">
    <div class="profile-left">...</div>
    <div class="profile-right">...</div>
  </div>
</div>
```

### 2. **style.css**
**Perubahan:**
- ❌ Removed: `.shop-tab-container`, `.shop-tab-btn`, `.shop-tab-content`
- ✅ Added: Profile styling
  - `.profile-container` - Main container
  - `.profile-header` - Top section
  - `.profile-content` - Two-column layout
  - `.profile-section` - Content sections
  - `.stat-row` - Individual stat display
  - `.equipment-option`, `.skill-option`, `.buy-option` - List items
  - `.description-panel` - Description shows
  - `.profile-left`, `.profile-right` - Layout columns

### 3. **js/preparation.js**
**Perubahan:**
- ✅ Added: `exp: 0` - EXP points untuk buying stats
- ✅ Added: `selectedSkills: [...]` - Active skills (default = starting skills)

```javascript
this.exp = 0;
this.selectedSkills = [...skills];
```

### 4. **js/gameLoop.js**
**Perubahan:**
- ✅ Added: EXP rewards ke `collectRoundRewards()`
  - Normal round: 15 + (set × 3)
  - Boss round: 40 + (area × 10)
- ✅ Modified: `startBattle()` - Close profile saat mulai battle
- ✅ Added call: `closeProfile()` di startBattle

```javascript
// Di collectRoundRewards():
h.exp += expReward;  // Add EXP to heroes
```

### 5. **js/UI.js**
**Perubahan: MASSIVE - 200+ lines baru**

**Modified functions:**
- `createUI()` - Added click handler untuk hero blocks
- `unequipItem()` - Already had rest mode check

**New functions:**
- `openProfile(heroIndex)` - Open profile untuk hero
- `closeProfile()` - Tutup profile
- `updateProfileDisplay()` - Update semua display
- `updateProfileStats()` - Display base stats
- `updateProfileEquipment()` - Display equipped items
- `updateProfileSkills()` - Display skill selection
- `updateProfileBuyStats()` - Display buy stats options
- `showItemDescription()` - Show item detail
- `showSkillDescription()` - Show skill detail
- `selectSkillForProfile()` - Toggle skill selection
- `unequipFromProfile()` - Unequip item via profile
- `buyStatFromProfile()` - Buy stat upgrade

**New variables:**
- `currentProfile: null` - Index hero yang ditampilkan
- `StatPricing: {}` - Pricing config untuk setiap stat
- `statPurchases: {}` - Track pembelian untuk harga dinamis

---

## 🎮 User Workflow

```
MAIN SCREEN
    ↓
[CLICK HERO] → PROFILE OPENS
    ↓
┌─────────────────────────────────────┐
│  Profile: Knight (Area 2)     [✕]  │
├─────────────────────────────────────┤
│ LEFT               │    RIGHT        │
│ 📊 Base Stats      │ 🔮 Skills      │
│ - Max HP: 150      │ ✓ Knight Slash│
│ - P.ATK: 20        │ - Shield Bash │
│ - M.DEF: 5         │ - Counter ... │
│                    │                │
│ ⚔️ Equipment      │ 💰 Buy Stats   │
│ - Sword [Unequip] │ ❤️ Max HP: 5  │
│   +3 P.ATK        │     EXP: 50 ✓  │
│ - Helmet [Unequip]│ ⚔️ P.ATK: 6   │
│   +2 P.DEF        │     EXP: 75 ✗  │
│                    │ ... more stats
└─────────────────────────────────────┘
    ↓
[CLICK ITEM] → Shows description
[CLICK SKILL] → Toggle selection + description
[CLICK BUY] → Buy stat upgrade (if enough EXP)
[CLICK UNEQUIP] → Remove equipment (only in rest)
    ↓
[✕] → PROFILE CLOSES
    ↓
MAIN SCREEN
```

---

## 💬 User Actions in Profile

### Open Profile
```
Click hero block → Opens profile (only if not in battle or in rest mode)
```

### View Equipment
```
Click equipped item → Shows:
- Name & Rarity
- Stat bonuses
- Special ability
- Lore description
- [Unequip] button
```

### Select Skills
```
Click available skill → Toggles selection
Shows:
- Skill name
- Cost (resource type + amount)
- Cooldown
- Description & lore

Selected skills used in battle, others ignored
```

### Buy Stat Upgrade
```
Click stat option → Purchases upgrade (if enough EXP)
Shows:
- Stat name with icon
- Current price (EXP cost)
- ✓ or ✗ availability

After purchase:
- EXP deducted
- Stat increased
- Price for next purchase increases automatically
```

### Unequip Item
```
Click [Unequip] button → Removes equipment
Only works during REST MODE
- Quick-Rest (after round)
- Long-Rest (after area)

Alert shown if tried during battle
```

---

## 📊 Stat Increment Values

When buying a stat, it increases by:
- **maxHp:** +10 per purchase
- **maxSta:** +8 per purchase
- **maxMana:** +8 per purchase
- **Patk:** +3 per purchase
- **Matk:** +3 per purchase
- **Pdef:** +2 per purchase
- **Mdef:** +2 per purchase

---

## 🔒 Access Restrictions

### Profile can be opened:
- ✅ Before battle starts
- ✅ During Rest Mode (Quick-Rest or Long-Rest)
- ❌ During active battle

### Equipment can be changed:
- ✅ Only during Rest Mode
- ❌ Shows alert during battle

### Stats can be bought:
- ✅ Only during Rest Mode
- ❌ Shows alert during battle

### Skills can be selected:
- ✅ Only during Rest Mode (anytime from profile)
- ✅ Available: all skills learned + unlockable

---

## 🔄 EXP Flow

```
BATTLE
    ↓
[VICTORY - ROUND]
    ↓
Hero.exp += (15 + currentSet × 3)       Normal: 15-21 EXP
    ↓
[VICTORY - BOSS ROUND]
    ↓
Hero.exp += (40 + currentArea × 10)     Boss: 40-90 EXP
    ↓
QUICK-REST or LONG-REST
    ↓
PROFILE OPENS (if player clicks hero)
    ↓
PLAYER BUYS STATS
    ↓
Hero.exp -= price
Price increases for next purchase
Next area/round continues
```

---

## 🎨 Visual Indicators

### Equipment Option
- 🟢 Green border = Equipped
- 🔵 Blue text = Equipment name
- 🟡 Yellow text = Rarity (Common/Uncommon/Rare/Epic/Legendary)
- 🟢 Green text = Stat bonuses
- 🟣 Purple text = Ability name

### Skill Option
- 🟢 Green border = Selected ✓
- 🟣 Purple text = Skill name
- ⚪ Gray text = Cost & cooldown

### Buy Option
- 🟢 Green price = Can afford
- 🔴 Red price = Cannot afford
- 🟡 Yellow icon = Stat type

---

## ⚙️ Configuration

### Modifiable Pricing
Edit `StatPricing` object in UI.js:
```javascript
const StatPricing = {
  maxHp: { base: 5, increment: 2 },
  // ... adjust as needed
};
```

### Modifiable EXP Rewards
Edit `collectRoundRewards()` in gameLoop.js:
```javascript
let expReward = 15 + currentSet * 3;  // Adjust formula
```

### Modifiable Stat Increases
Edit `buyStatFromProfile()` in UI.js:
```javascript
if (statType === 'maxHp') {
  hero.maxHp += 10;  // Change from 10 to any value
}
```

---

## 🐛 Troubleshooting

**Profile won't open:**
- Check if battle is running
- Check if in rest mode
- Verify `inRestMode` flag in console

**Equipment can't unequip:**
- Must be in rest mode (after round/area)
- Try during Quick-Rest or Long-Rest

**Can't buy stats:**
- Not enough EXP (check EXP display)
- Not in rest mode
- Check Console for warnings

**Skill selection not working:**
- Click on skill option to toggle
- Selected skills should have green border
- Check hero.selectedSkills in console

---

## 📈 Future Enhancements

1. **Skill Chaining** - Select multiple skills, chain them
2. **Equipment Customization** - Enchant/upgrade items
3. **Skill Upgrades** - Upgrade skill damage/cost
4. **Build Templates** - Save/load configurations
5. **Stat Presets** - Quick presets for tank/dps/healer
6. **Skill Preview** - Combat simulation before battle
7. **Cost Calculator** - Calculate total upgrade cost
8. **Achievement Tracking** - Track stat milestones

---

**Status:** ✅ **PRODUCTION READY**  
**Last Updated:** {current date}  
**Version:** 2.0 - Profile System Launch