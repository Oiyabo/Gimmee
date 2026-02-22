// ===== UTILITY FUNCTIONS FOR REWORKED SYSTEM =====

function random(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

function alive(team) {
  if (!Array.isArray(team)) return [];
  return team.filter((c) => c && c.isAlive());
}

function calculateDamage(caster, target, damageType = "physical", multiplier = 1.0) {
  let baseDamage;
  let targetDef;

  if (damageType === "physical") {
    baseDamage = (caster.patk + caster.statBonus.patk) * multiplier;
    targetDef = Math.max(0, target.pdef + target.statBonus.pdef);
  } else if (damageType === "magical") {
    baseDamage = (caster.matk + caster.statBonus.matk) * multiplier;
    targetDef = Math.max(0, target.mdef + target.statBonus.mdef);
  } else {
    baseDamage = (caster.patk + caster.matk + caster.statBonus.patk + caster.statBonus.matk) * multiplier * 0.5;
    targetDef = (target.pdef + target.mdef + target.statBonus.pdef + target.statBonus.mdef) * 0.3;
  }

  // Add true attack bonus
  let trueAttackBonus = caster.tatt + caster.statBonus.tatt;
  let finalDamage = Math.max(1, baseDamage - targetDef * 0.7 + trueAttackBonus);

  // Critical hit calculation
  if (Math.random() < (caster.ccrit + caster.statBonus.ccrit)) {
    finalDamage *= (caster.dcrit + caster.statBonus.dcrit);
  }

  return Math.floor(finalDamage);
}

function getClosestEnemy(caster, enemies) {
  let alive_enemies = alive(enemies);
  if (alive_enemies.length === 0) return null;
  return alive_enemies.reduce((closest, current) => {
    let currentDist = caster.getGridDistance(current);
    let closestDist = caster.getGridDistance(closest);
    return currentDist < closestDist ? current : closest;
  });
}

function getLowestHpAlly(caster, allies) {
  let alive_allies = alive(allies).filter(a => a !== caster);
  if (alive_allies.length === 0) return caster;
  return alive_allies.reduce((lowest, current) => {
    return current.hp < lowest.hp ? current : lowest;
  });
}

function getLowestHpEnemy(caster, enemies) {
  let alive_enemies = alive(enemies);
  if (alive_enemies.length === 0) return null;
  return alive_enemies.reduce((lowest, current) => {
    return current.hp < lowest.hp ? current : lowest;
  });
}

function executeSkill(skill, caster, allies, enemies) {
  if (!skill || !skill.execute) return false;

  // Check requirements
  if (skill.cost) {
    if (skill.cost.sta && caster.sta < skill.cost.sta) return false;
    if (skill.cost.mana && caster.mana < skill.cost.mana) return false;
  }

  // Consume resources
  if (skill.cost) {
    if (skill.cost.sta) caster.sta = Math.max(0, caster.sta - skill.cost.sta);
    if (skill.cost.mana) caster.mana = Math.max(0, caster.mana - skill.cost.mana);
  }

  // Execute skill
  try {
    skill.execute(caster, allies, enemies);
  } catch (e) {
    console.error("Error executing skill:", skill.name, e);
  }

  return true;
}

function getGridDistance(x1, y1, x2, y2) {
  return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
}

function isValidGridPosition(x, y) {
  return x >= 0 && x < CONFIG.BATTLEFIELD.GRID_SIZE && y >= 0 && y < CONFIG.BATTLEFIELD.GRID_SIZE;
}

function getRandomSpawnPosition(direction) {
  let zone = CONFIG.MONSTER_SPAWN.SPAWN_ZONES[direction] || CONFIG.MONSTER_SPAWN.SPAWN_ZONES["E"];
  let x = Math.floor(Math.random() * (zone.x[1] - zone.x[0] + 1)) + zone.x[0];
  let y = Math.floor(Math.random() * (zone.y[1] - zone.y[0] + 1)) + zone.y[0];
  return { x, y };
}
