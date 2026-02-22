// ===== MAP SYSTEM =====
// Manages the 8x8 battle grid and character positioning

const MAP_SIZE = 8;
const GRID_SIZE = MAP_SIZE * MAP_SIZE; // 64 placement blocks

// Store character positions: Map<characterId, {row, col}>
let characterPositions = new Map();
let canDragCharacters = true; // Enable dragging during transitions

/**
 * Initialize the battle map grid with 64 empty placement blocks
 */
function initializeBattleMap() {
    const battleMapContainer = document.getElementById('battle-map');
    battleMapContainer.innerHTML = '';
    
    for (let i = 0; i < GRID_SIZE; i++) {
        const row = Math.floor(i / MAP_SIZE);
        const col = i % MAP_SIZE;
        
        const placementBlock = document.createElement('div');
        placementBlock.className = 'placement-block';
        placementBlock.id = `placement-${row}-${col}`;
        placementBlock.dataset.row = row;
        placementBlock.dataset.col = col;
        placementBlock.addEventListener('dragover', handleDragOver);
        placementBlock.addEventListener('drop', (e) => handleDrop(e, row, col));
        
        battleMapContainer.appendChild(placementBlock);
    }
}

/**
 * Place a character on the battle map
 * @param {Object} character - Character object with id, name, type (hero/monster)
 * @param {number} row - Grid row (0-7)
 * @param {number} col - Grid column (0-7)
 */
function placeCharacterOnMap(character, row, col) {
    // Check if position is valid
    if (row < 0 || row >= MAP_SIZE || col < 0 || col >= MAP_SIZE) {
        console.warn(`Invalid position: ${row}, ${col}`);
        return false;
    }
    
    // Check if position is already occupied
    if (isPositionOccupied(row, col)) {
        console.warn(`Position ${row}, ${col} is already occupied`);
        return false;
    }
    
    // Remove character from old position if exists
    if (characterPositions.has(character.id)) {
        removeCharacterFromMap(character.id);
    }
    
    // Store new position
    characterPositions.set(character.id, { row, col });
    
    // Create character block element
    const placementBlock = document.getElementById(`placement-${row}-${col}`);
    const characterBlock = createCharacterBlock(character);
    placementBlock.appendChild(characterBlock);
    placementBlock.classList.add('occupied');
    
    return true;
}

/**
 * Remove character from map
 * @param {string} characterId - Character ID
 */
function removeCharacterFromMap(characterId) {
    const position = characterPositions.get(characterId);
    if (!position) return;
    
    const placementBlock = document.getElementById(`placement-${position.row}-${position.col}`);
    if (placementBlock) {
        placementBlock.innerHTML = '';
        placementBlock.classList.remove('occupied');
    }
    
    characterPositions.delete(characterId);
}

/**
 * Check if a position is occupied
 * @param {number} row
 * @param {number} col
 * @returns {boolean}
 */
function isPositionOccupied(row, col) {
    for (let [, pos] of characterPositions.entries()) {
        if (pos.row === row && pos.col === col) {
            return true;
        }
    }
    return false;
}

/**
 * Create a character block element
 * @param {Object} character
 * @returns {HTMLElement}
 */
function createCharacterBlock(character) {
    const div = document.createElement('div');
    div.className = `character-block ${character.type || 'hero'}`;
    div.id = `char-block-${character.id}`;
    // Heroes are always draggable
    div.draggable = character.type === 'hero';
    div.dataset.characterId = character.id;
    
    const hpPercentage = character.hp / character.maxHP * 100;
    
    div.innerHTML = `
        <div class="character-name">${character.name}</div>
        <div class="character-info">
            <div class="character-hp">${character.hp}/${character.maxHP}</div>
            <div class="character-level">Lv ${character.level || 1}</div>
        </div>
        <div class="character-hp-stroke hp-stroke" style="--hp-percentage: ${hpPercentage}%"></div>
    `;
    
    if (character.isDead) {
        div.classList.add('dead');
    }
    
    // Add drag listeners for heroes
    if (character.type === 'hero') {
        div.addEventListener('dragstart', handleDragStart);
        div.addEventListener('dragend', handleDragEnd);
    }
    
    return div;
}

/**
 * Get character position on map
 * @param {string} characterId
 * @returns {Object|null} {row, col} or null
 */
function getCharacterPosition(characterId) {
    return characterPositions.get(characterId) || null;
}

/**
 * Get all characters with their positions
 * @returns {Array}
 */
function getAllCharacterPositions() {
    return Array.from(characterPositions.entries()).map(([id, pos]) => ({
        characterId: id,
        ...pos
    }));
}

/**
 * Calculate distance between two positions
 * @param {number} row1, {number} col1
 * @param {number} row2, {number} col2
 * @returns {number} Euclidean distance
 */
function calculateDistance(row1, col1, row2, col2) {
    return Math.sqrt(Math.pow(row2 - row1, 2) + Math.pow(col2 - col1, 2));
}

/**
 * Find closest enemy to a character
 * @param {string} characterId
 * @param {Array} enemies - Array of enemy characters
 * @returns {Object|null} Closest enemy or null
 */
function findClosestEnemy(characterId, enemies) {
    const charPos = getCharacterPosition(characterId);
    if (!charPos) return null;
    
    let closest = null;
    let minDistance = Infinity;
    
    for (let enemy of enemies) {
        if (enemy.isDead) continue;
        
        const enemyPos = getCharacterPosition(enemy.id);
        if (!enemyPos) continue;
        
        const distance = calculateDistance(charPos.row, charPos.col, enemyPos.row, enemyPos.col);
        
        if (distance < minDistance) {
            minDistance = distance;
            closest = enemy;
        }
    }
    
    return closest;
}

/**
 * Find target with higher probability for closer targets
 * @param {string} characterId
 * @param {Array} enemies
 * @returns {Object|null}
 */
function findTargetWithDistanceBias(characterId, enemies) {
    const charPos = getCharacterPosition(characterId);
    if (!charPos) return null;
    
    let validTargets = [];
    
    for (let enemy of enemies) {
        if (enemy.isDead) continue;
        
        const enemyPos = getCharacterPosition(enemy.id);
        if (!enemyPos) continue;
        
        const distance = calculateDistance(charPos.row, charPos.col, enemyPos.row, enemyPos.col);
        const weight = 1 / (distance + 1); // Closer targets have higher weight
        
        validTargets.push({ enemy, weight });
    }
    
    if (validTargets.length === 0) return null;
    
    // Select random target weighted by proximity
    const totalWeight = validTargets.reduce((sum, t) => sum + t.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let t of validTargets) {
        random -= t.weight;
        if (random <= 0) return t.enemy;
    }
    
    return validTargets[validTargets.length - 1].enemy;
}

/**
 * Remove dead monsters from the map (NOT heroes - they stay even when dead)
 */
function removeDeadCharactersFromMap() {
    const deadCharacterIds = [];
    
    for (let [charId, pos] of characterPositions.entries()) {
        // Find the character in heroes or monsters
        let character = null;
        let isHero = false;
        
        for (let hero of heroes) {
            if (hero.id === charId) {
                character = hero;
                isHero = true;
                break;
            }
        }
        if (!character) {
            for (let monster of monsters) {
                if (monster.id === charId) {
                    character = monster;
                    break;
                }
            }
        }
        
        // Only remove dead MONSTERS from map (heroes stay even when dead)
        if (!character || (character.isDead && !isHero)) {
            const placementBlock = document.getElementById(`placement-${pos.row}-${pos.col}`);
            if (placementBlock) {
                placementBlock.innerHTML = '';
                placementBlock.classList.remove('occupied');
            }
            deadCharacterIds.push(charId);
        }
    }
    
    // Remove from tracking
    deadCharacterIds.forEach(id => characterPositions.delete(id));
}

/**
 * Enable or disable character dragging
 * @param {boolean} enable
 */
function setDragEnabled(enable) {
    canDragCharacters = enable;
}

// ===== DRAG AND DROP HANDLERS =====

let draggedCharacterId = null;

function handleDragStart(e) {
    draggedCharacterId = e.target.closest('.character-block').dataset.characterId;
    e.dataTransfer.effectAllowed = 'move';
    e.target.closest('.character-block').classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.closest('.character-block').classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.style.background = '#2d5a3d';
}

function handleDrop(e, row, col) {
    e.preventDefault();
    e.currentTarget.style.background = '';
    
    if (!draggedCharacterId) return;
    
    // Find the character object
    let character = null;
    for (let hero of heroes) {
        if (hero.id === parseInt(draggedCharacterId)) {
            console.log(character, hero);
            
            character = hero;
            break;
        }
    }
    
    if (character) {
        // Store current stats before moving to prevent any accidental resets
        const currentHp = character.hp;
        const currentMaxHp = character.maxHp;
        const currentStats = JSON.parse(JSON.stringify(character.status));
        
        // Place character on new position
        if (placeCharacterOnMap(character, row, col)) {
            // Restore all stats to prevent any resets during repositioning
            character.hp = currentHp;
            character.maxHp = currentMaxHp;
            character.status = currentStats;
            
            // Update display with preserved stats
            updateCharacterDisplay(character);
            if (typeof updateHeroesPanel === 'function') {
                updateHeroesPanel(heroes);
            }
        }
    }
    
    draggedCharacterId = null;
}

/**
 * Clear all characters from the map
 */
function clearMap() {
    characterPositions.clear();
    const battleMap = document.getElementById('battle-map');
    if (battleMap) {
        battleMap.querySelectorAll('.placement-block').forEach(block => {
            block.innerHTML = '';
            block.classList.remove('occupied');
        });
    }
}

/**
 * Update character display on map (refresh HP, status, etc)
 * @param {Object} character
 */
function updateCharacterDisplay(character) {
    const charBlock = document.getElementById(`char-block-${character.id}`);
    if (!charBlock) return;
    
    const hpPercentage = Math.max(0, character.hp / character.maxHP * 100);
    const hpStroke = charBlock.querySelector('.character-hp-stroke');
    const hpInfo = charBlock.querySelector('.character-hp');
    
    hpStroke.style.setProperty('--hp-percentage', hpPercentage + '%');
    if (hpInfo) hpInfo.textContent = `${character.hp}/${character.maxHP}`;
    
    if (character.isDead) {
        charBlock.classList.add('dead');
    } else {
        charBlock.classList.remove('dead');
    }
}

/**
 * Arrange characters randomly on map (for monsters or initial placement)
 * @param {Array} characters
 * @param {boolean} centerArea - If true, place in specific area of map
 * @param {string} direction - Direction (N, S, E, W, NE, NW, SE, SW)
 */
function arrangeCharactersRandomly(characters, centerArea = false, direction = null) {
    clearMap();
    
    for (let character of characters) {
        if (character.isDead) continue;
        
        let placed = false;
        let attempts = 0;
        const maxAttempts = 50;
        
        while (!placed && attempts < maxAttempts) {
            let row, col;
            
            if (centerArea && direction) {
                // Place in specific area based on direction
                const quarterSize = MAP_SIZE / 2;
                
                switch(direction) {
                    case 'E':
                        row = Math.floor(Math.random() * MAP_SIZE);
                        col = MAP_SIZE - 1 - Math.floor(Math.random() * quarterSize);
                        break;
                    case 'W':
                        row = Math.floor(Math.random() * MAP_SIZE);
                        col = Math.floor(Math.random() * quarterSize);
                        break;
                    case 'N':
                        row = Math.floor(Math.random() * quarterSize);
                        col = Math.floor(Math.random() * MAP_SIZE);
                        break;
                    case 'S':
                        row = MAP_SIZE - 1 - Math.floor(Math.random() * quarterSize);
                        col = Math.floor(Math.random() * MAP_SIZE);
                        break;
                    case 'NE':
                        row = Math.floor(Math.random() * quarterSize);
                        col = MAP_SIZE - 1 - Math.floor(Math.random() * quarterSize);
                        break;
                    case 'NW':
                        row = Math.floor(Math.random() * quarterSize);
                        col = Math.floor(Math.random() * quarterSize);
                        break;
                    case 'SE':
                        row = MAP_SIZE - 1 - Math.floor(Math.random() * quarterSize);
                        col = MAP_SIZE - 1 - Math.floor(Math.random() * quarterSize);
                        break;
                    case 'SW':
                        row = MAP_SIZE - 1 - Math.floor(Math.random() * quarterSize);
                        col = Math.floor(Math.random() * quarterSize);
                        break;
                    default:
                        row = Math.floor(Math.random() * MAP_SIZE);
                        col = Math.floor(Math.random() * MAP_SIZE);
                }
            } else {
                row = Math.floor(Math.random() * MAP_SIZE);
                col = Math.floor(Math.random() * MAP_SIZE);
            }
            
            if (!isPositionOccupied(row, col)) {
                placed = placeCharacterOnMap(character, row, col);
            }
            
            attempts++;
        }
    }
}
