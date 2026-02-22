# Status Effects Integration Checklist

## System Status: ✅ READY FOR INTEGRATION

All core components are working. These tasks show how to connect status effects to your existing game systems.

---

## Phase 1: Skill Integration (PRIORITY)

Each skill should apply status effects. Here's what needs updating in `skills.js`:

### Knight Skills
- [ ] `shieldSlash` → Apply `weakened` to enemies
- [ ] `shieldBash` → Apply `stunned` (2s)
- [ ] `vortexSlash` → Apply `slowed` (6s)
- [ ] `shieldBarrier` → Apply `shielded` BUFF to self

### Priest Skills  
- [ ] `holyLight` → Apply `weakened` to enemies
- [ ] `divineShield` → Apply `shielded` BUFF to allies
- [ ] `holyCure` → Remove `burn`, `poisoned`, `blinded`
- [ ] `resurrection` → Apply `regenerating` BUFF to revived ally

### Mage Skills
- [ ] `fireBall` → Apply `burn` (6s)
- [ ] `frostbolt` → Apply `frostbite` (6s) + `slowed` (6s)
- [ ] `arcaneEruption` → Apply `confused` (5s) + `vulnerable` (4s)
- [ ] `manaShield` → Apply `shielded` BUFF to self

### Rogue Skills
- [ ] `shadowStrike` → Apply `bleeding` (5s)
- [ ] `poisonBlade` → Apply `poisoned` (8s)
- [ ] `shadowClone` → Apply `stealth` BUFF to self
- [ ] `backstab` → Apply `vulnerable` to target

### Paladin Skills
- [ ] `holyCross` → Apply `burn` (4s)
- [ ] `retribution` → Apply `marked` to attackers (7s)
- [ ] `holyAura` → Apply `regenerating` BUFF to allies
- [ ] `lastStand` → Apply `shielded` BUFF to self (high strength)

### Archer Skills
- [ ] `piercingShot` → Apply `bleeding` (6s)
- [ ] `multiShot` → Apply `weakened` to multiple (3s)
- [ ] `frostArrow` → Apply `frostbite` + `slowed`
- [ ] `arrowStorm` → Apply `exposed` to area (4s)

### Passive Skills
- [ ] `shieldBarrier` → Grant `shielded` BUFF constantly
- [ ] `regeneration` → Grant `regenerating` BUFF constantly
- [ ] `thorns` → Apply `bleeding` to attackers (auto-trigger)
- [ ] `counterAttack` → Apply `weakened` on counter
- [ ] `lifeSteal` → Apply `vampired` to self (BUFF) when healing
- [ ] `focus` → Grant `enlightened` BUFF for next skill

---

## Phase 2: Equipment Integration (PRIORITY)

Each equipment ability should apply status effects. In `equipment.js`, update abilities:

### Offensive Abilities
- [ ] `sharpness` → Apply `bleeding` (5s)
- [ ] `armorBreak` → Apply `vulnerable` (4s)
- [ ] `empower` → Grant `berserk` BUFF (6s)
- [ ] `executioner` → Apply `marked` (7s) - increases enemy crit vs you

### Defensive Abilities
- [ ] `resilience` → Grant `shielded` BUFF
- [ ] `fortify` → Grant `shielded` BUFF with high values
- [ ] `ward` → Apply `regenerating` BUFF constantly
- [ ] `reflection` → Apply `cursed` to attackers (auto-trigger)

### Utility Abilities
- [ ] `taunt` → Apply `charmed` effect (3s)
- [ ] `nullify` → Apply `nullified` to target (3s)
- [ ] `magnetism` → Apply `rooted` (3s)
- [ ] `weakness` → Apply `weakened` (4s)

### Control Abilities
- [ ] `hex` → Apply `cursed` (5s)
- [ ] `silence` → Apply `silenced` (3s)
- [ ] `petrify` → Apply `petrified` (3s) - very rare
- [ ] `mindControl` → Apply `mindControlled` (special)

---

## Phase 3: Monster AI Integration

In `monsterTemplate.js`, add status checks to AI:

```javascript
// Check before selecting skill
if (hasStatus(this, "stun")) {
  return; // Can't act at all
}

if (hasStatus(this, "silenced")) {
  canUseSkills = false; // Only physical attacks
}

if (hasStatus(this, "disarmed")) {
  canUseSkills = true; // Only magic attacks
}

if (hasStatus(this, "confused") && Math.random() < 0.6) {
  targetAlly = true; // Attack own team
}

if (hasStatus(this, "paralyzed") && Math.random() < 0.5) {
  skipTurn = true; // 50% chance to fail
}
```

---

## Phase 4: Passive Skill Mechanics

Passive skills should apply effects automatically each turn:

### In gameLoop.js, after applyStatus():
```javascript
// Trigger passive skills for each character
[...heroes, ...monsters].forEach(char => {
  if (char.isAlive()) {
    triggerPassiveSkills(char);
  }
});

function triggerPassiveSkills(char) {
  // Check which passive skills are active
  if (hasSkill(char, "shieldBarrier")) {
    applyStatus(char, "shielded", PASSIVE_DURATION);
  }
  if (hasSkill(char, "regeneration")) {
    applyStatus(char, "regenerating", PASSIVE_DURATION);
  }
  if (hasSkill(char, "thorns") && wasAttackedThisTurn(char)) {
    char.lastAttacker && applyStatus(char.lastAttacker, "bleeding", 3);
  }
}
```

---

## Phase 5: UI Polish

Current UI already displays:
- ✅ Status icons (automatic)
- ✅ Status durations (automatic)
- ✅ Status names on hover (ready to add)

Optional enhancements:
- [ ] Color-code status by severity (red=critical, yellow=medium)
- [ ] Show status effects in skill tooltips
- [ ] Show equipment ability effects in item description
- [ ] Add visual popup when status applied
- [ ] Add sound effects for critical statuses

---

## Phase 6: Monster Library Updates

Review each monster type and assign appropriate abilities:

### Example: Goblin Updates
- Remove basic status if it exists
- Add `bleeding` to attack (sharpness ability)
- Add `weakened` passive (natural weakness)
- Update loot to include status-applying weapons

### Example: Dragon Updates
- Add `burn` to fire attacks
- Add `confused` area effect
- Add `vulnerable` debuff resistance
- Custom `firebreath` applies 8s burn

---

## Implementation Sequence (RECOMMENDED)

### Week 1: Foundations
1. Add status effects to all hero skills (Knight → Archer)
2. Test each skill applies effect correctly
3. Verify durations work (effects expire on time)

### Week 2: Equipment
4. Add status effects to equipment abilities
5. Test equipment effects trigger properly
6. Verify stat bonuses + status stack correctly

### Week 3: AI & Monsters
7. Update monster AI to handle statuses
8. Add statuses to monster loot
9. Create monster abilities with statuses

### Week 4: Polish & Balance
10. UI enhancements (colors, tooltips)
11. Sound effects
12. Balance duration/damage values
13. Final testing

---

## Quick Template: How to Apply Status in a Skill

Copy this template and fill in the details:

```javascript
Skills.skillName = {
  name: "Skill Name",
  type: "active",
  resource: "stamina",
  cost: 30,
  cooldown: 2,
  lore: "Describe what happens",
  effect: (self, allies, enemies) => {
    // Calculate damage
    let damagePerEnemy = Math.floor(self.patk * 1.5);
    
    // Apply to enemies
    enemies.forEach(enemy => {
      // Damage
      if (Math.random() < self.ccrit) {
        damagePerEnemy *= self.dcrit;
      }
      enemy.takeDamage(damagePerEnemy);
      
      // PRIMARY STATUS
      applyStatus(enemy, "statusKey", 5, self);
      
      // SECONDARY STATUS (optional)
      applyStatus(enemy, "secondStatus", 4, self);
    });
    
    // Apply to allies (optional)
    allies.forEach(ally => {
      if (ally && ally.isAlive()) {
        applyStatus(ally, "buffStatus", 6, self);
      }
    });
  }
};
```

---

## Testing Checklist

Before considering status effects "complete":

### Combat Testing
- [ ] Skill applies status correctly
- [ ] Status effect appears in UI
- [ ] Duration counts down properly
- [ ] Status removes after duration expires
- [ ] Multiple statuses stack without conflicts
- [ ] Crit chance affects status damage (for DoT)

### AI Testing  
- [ ] Stunned enemies don't act
- [ ] Paralyzed enemies have 50% fail rate
- [ ] Confused enemies attack allies 60% of time
- [ ] Silenced enemies can't use magic
- [ ] Disarmed enemies can't use stamina skills

### Balance Testing
- [ ] Status durations feel fair (not too long)
- [ ] DoT damage is appropriate (not overpowered)
- [ ] CC effects aren't frustrating to players
- [ ] Buffs feel rewarding and useful

### Edge Cases
- [ ] Stun + Paralyzed = Stun behavior (stun wins)
- [ ] Confusion + Petrified = Petrified (can't act anyway)
- [ ] Multiple buffs = All apply
- [ ] Status on already-dead character = Ignored
- [ ] Status on immune target = Proper behavior

---

## Status Reference for Quick Integration

| Status | Effect | Duration | Icon |
|--------|--------|----------|------|
| burn | 8-12% HP/sec damage | 6s | 🔥 |
| bleeding | 5-8% HP/sec + -20% speed | 6s | 🩸 |
| poisoned | 4% HP/2sec | 8s | ☠️ |
| stun | NO SKILLS | 2s | ⚡ |
| paralyzed | 50% skill fail | 4s | 💤 |
| confused | 60% ally attack | 5s | 😵 |
| weakened | -30% attack | 5s | 💪 |
| vulnerable | -35% P.Def -20% M.Def | 4s | 🛡️❌ |
| slowed | -60% speed | 6s | 🐌 |
| shielded | +50% defense (BUFF) | 8s | 🛡️ |
| regenerating | +4% HP/sec (BUFF) | 10s | 💚 |
| enlightened | +50% M.Atk +30% Mspd (BUFF) | 7s | ✨ |

---

## Support Resources

- Read `NEGATIVE_EFFECT_STATUS_SYSTEM.md` for complete effect reference
- Check `statusEffects_EXAMPLES.js` for 10+ implementation examples
- Use `hasStatus()`, `applyStatus()`, `removeStatus()` helper functions
- All effects auto-expire (no manual cleanup needed)

---

## Notes for Developer

✅ Status system is **production-ready**  
✅ All helper functions are **defined and working**  
✅ Script loading order is **correct**  
✅ No syntax errors in any files  

⏳ Ready for skill/equipment/AI integration phase  
⏳ Recommend testing in battle before balance adjustments  

---

**Last Updated:** After Phase 3 implementation  
**Status:** Ready for Phase 4 (Integration & Testing)

