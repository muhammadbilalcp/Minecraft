// Minecraft 4 Game Modes Engine: Survival, Creative, Adventure, Hardcore
(function(window){
  "use strict";

  const MODES = {
    SURVIVAL: 'survival',
    CREATIVE: 'creative',
    ADVENTURE: 'adventure',
    HARDCORE: 'hardcore'
  };

  const MODE_INFO = {
    survival: {
      name: 'Survival Mode',
      badge: 'Survival',
      desc: 'Gather resources, craft tools, manage hunger, and survive against night monsters. You can die and respawn.',
      canFly: false,
      invincible: false,
      instantBreak: false,
      infiniteItems: false,
      adventureLocked: false,
      hardcore: false
    },
    creative: {
      name: 'Creative Mode',
      badge: 'Creative',
      desc: 'Unlimited blocks and items, fly freely, instant break, and total invincibility. Built for pure creation and experimentation.',
      canFly: true,
      invincible: true,
      instantBreak: true,
      infiniteItems: true,
      adventureLocked: false,
      hardcore: false
    },
    adventure: {
      name: 'Adventure Mode',
      badge: 'Adventure',
      desc: 'For player-made custom maps. You cannot destroy or place blocks unless holding the designated harvest tool. Triggers & buttons remain interactive.',
      canFly: false,
      invincible: false,
      instantBreak: false,
      infiniteItems: false,
      adventureLocked: true,
      hardcore: false
    },
    hardcore: {
      name: 'Hardcore Mode',
      badge: 'Hardcore',
      desc: 'Survival locked on the hardest difficulty with exactly one life. If you die, your world is permanently lost to Spectator mode.',
      canFly: false,
      invincible: false,
      instantBreak: false,
      infiniteItems: false,
      adventureLocked: false,
      hardcore: true
    }
  };

  let currentMode = MODES.SURVIVAL;
  let isFlying = false;
  let isSpectator = false;
  let lastJumpTime = 0;
  let modeChangeCallbacks = [];

  // Creative Catalog: All blocks and items for infinite creative inventory
  const CREATIVE_CATALOG = [
    // Building Blocks & Ores
    { id: 1, name: 'Grass Block', cat: 'blocks' },
    { id: 2, name: 'Dirt', cat: 'blocks' },
    { id: 3, name: 'Stone', cat: 'blocks' },
    { id: 8, name: 'Oak Wood Planks', cat: 'blocks' },
    { id: 4, name: 'Oak Wood Log', cat: 'blocks' },
    { id: 5, name: 'Oak Leaves', cat: 'blocks' },
    { id: 6, name: 'Sand', cat: 'blocks' },
    { id: 7, name: 'Water Source', cat: 'blocks' },
    { id: 12, name: 'Lava Source', cat: 'blocks' },
    { id: 9, name: 'Coal Ore', cat: 'blocks' },
    { id: 18, name: 'Iron Ore', cat: 'blocks' },
    { id: 10, name: 'Bedrock', cat: 'blocks' },
    { id: 14, name: 'Obsidian', cat: 'blocks' },
    { id: 11, name: 'Netherrack', cat: 'blocks' },
    { id: 13, name: 'Glowstone', cat: 'blocks' },
    { id: 16, name: 'End Stone', cat: 'blocks' },
    { id: 40, name: 'Tall Grass', cat: 'blocks' },
    { id: 41, name: 'Red Poppy', cat: 'blocks' },
    { id: 42, name: 'Dandelion', cat: 'blocks' },

    // Tools & Weapons
    { id: 104, name: 'Stone Pickaxe', cat: 'tools' },
    { id: 105, name: 'Stone Sword', cat: 'tools' },
    { id: 106, name: 'Flint & Steel', cat: 'tools' },
    { id: 108, name: 'Eye of Ender', cat: 'tools' },

    // Food & Materials
    { id: 101, name: 'Apple', cat: 'food' },
    { id: 102, name: 'Porkchop', cat: 'food' },
    { id: 103, name: 'Beef', cat: 'food' },
    { id: 100, name: 'Coal', cat: 'materials' },
    { id: 110, name: 'Iron Ingot', cat: 'materials' },
    { id: 109, name: 'Leather', cat: 'materials' },
    { id: 107, name: 'Blaze Powder', cat: 'materials' },

    // Armors
    { id: 111, name: 'Leather Cap', cat: 'armor' },
    { id: 112, name: 'Leather Tunic', cat: 'armor' },
    { id: 113, name: 'Leather Pants', cat: 'armor' },
    { id: 114, name: 'Leather Boots', cat: 'armor' },
    { id: 115, name: 'Iron Helmet', cat: 'armor' },
    { id: 116, name: 'Iron Chestplate', cat: 'armor' },
    { id: 117, name: 'Iron Leggings', cat: 'armor' },
    { id: 118, name: 'Iron Boots', cat: 'armor' }
  ];

  function getMode(){
    return currentMode;
  }

  function getModeConfig(){
    return MODE_INFO[currentMode] || MODE_INFO.survival;
  }

  function setMode(newMode, silent){
    newMode = (newMode || '').toLowerCase().trim();
    if(newMode === '0' || newMode === 's') newMode = MODES.SURVIVAL;
    if(newMode === '1' || newMode === 'c') newMode = MODES.CREATIVE;
    if(newMode === '2' || newMode === 'a') newMode = MODES.ADVENTURE;
    if(newMode === '3' || newMode === 'hc') newMode = MODES.HARDCORE;

    if(!MODE_INFO[newMode]) newMode = MODES.SURVIVAL;
    currentMode = newMode;

    if(currentMode !== MODES.CREATIVE && !isSpectator){
      isFlying = false;
    }

    // Update HUD indicator and health bar posture
    updateModeHUD();

    if(!silent && window.toast){
      window.toast(`Game mode updated to ${MODE_INFO[currentMode].name}`, 2500);
    }

    for(const cb of modeChangeCallbacks){
      try { cb(currentMode, MODE_INFO[currentMode]); } catch(e){}
    }
  }

  function onModeChange(fn){
    if(typeof fn === 'function') modeChangeCallbacks.push(fn);
  }

  // Double-tap space handler for creative flight
  function handleJumpKey(){
    const now = performance.now();
    if(currentMode === MODES.CREATIVE || isSpectator){
      if(now - lastJumpTime < 350){ // Double tap within 350ms
        isFlying = !isFlying;
        if(window.toast){
          window.toast(isFlying ? 'Flying mode enabled (Space = up, Shift = down)' : 'Flying mode disabled', 1500);
        }
        lastJumpTime = 0;
        return true;
      }
      lastJumpTime = now;
    }
    return false;
  }

  function setFlying(flying){
    if(currentMode === MODES.CREATIVE || isSpectator){
      isFlying = !!flying;
    } else {
      isFlying = false;
    }
    updateModeHUD();
  }

  function setSpectator(spectating){
    isSpectator = !!spectating;
    if(isSpectator){
      isFlying = true;
    }
    updateModeHUD();
  }

  // Adventure Mode Tool Harvest Rules
  // Blocks can only be destroyed if holding the appropriate tool!
  function canHarvestBlock(blockId, heldItemId){
    if(currentMode !== MODES.ADVENTURE) return { allowed: true };

    // Stone, Ores, Obsidian, Bedrock -> Require Pickaxe (ID: 104)
    if(blockId === 3 || blockId === 9 || blockId === 18 || blockId === 11 || blockId === 14 || blockId === 16){
      if(heldItemId === 104) return { allowed: true };
      return { allowed: false, reason: 'Adventure Mode: You need a Stone Pickaxe to break this stone/ore!' };
    }

    // Wood & Planks -> Require Axe or Pickaxe
    if(blockId === 4 || blockId === 8){
      if(heldItemId === 104 || heldItemId === 105) return { allowed: true };
      return { allowed: false, reason: 'Adventure Mode: You need a tool to harvest wood!' };
    }

    // Leaves, Plants, Flowers -> Sword or shears
    if(blockId === 5 || (blockId >= 40 && blockId <= 42)){
      if(heldItemId === 105) return { allowed: true };
      return { allowed: false, reason: 'Adventure Mode: You need a Sword to cut foliage!' };
    }

    // Sand, Dirt -> Bare-handed or shovel
    if(blockId === 2 || blockId === 6){
      // In strict adventure mode, blocks cannot be modified without specific permissions
      return { allowed: false, reason: 'Adventure Mode: Terrain is protected from terraforming!' };
    }

    return { allowed: false, reason: 'Adventure Mode: You cannot destroy this block!' };
  }

  function canPlaceBlock(blockId){
    if(currentMode === MODES.ADVENTURE){
      return { allowed: false, reason: 'Adventure Mode: Block placement is restricted on adventure maps!' };
    }
    return { allowed: true };
  }

  // Update HUD game mode label
  function updateModeHUD(){
    const label = document.getElementById('gameModeLabel');
    if(label){
      const cfg = MODE_INFO[currentMode] || MODE_INFO.survival;
      let text = `Mode: ${cfg.badge}`;
      if(isSpectator) text = `Mode: Spectator (Noclip)`;
      else if(isFlying) text += ` [Flying]`;
      label.textContent = text;
    }

    // Creative mode hides health and hunger bars cleanly
    const healthBar = document.getElementById('healthBar');
    const hungerBar = document.getElementById('hungerBar');
    const airBar = document.getElementById('airBar');
    const isCreativeOrSpec = currentMode === MODES.CREATIVE || isSpectator;

    if(healthBar) healthBar.style.display = isCreativeOrSpec ? 'none' : 'flex';
    if(hungerBar) hungerBar.style.display = isCreativeOrSpec ? 'none' : 'flex';
    if(airBar && isCreativeOrSpec) airBar.style.display = 'none';

    // Update heart icons if Hardcore
    if(window.updateHudUI) window.updateHudUI();
  }

  // Process /gamemode console command
  function processCommand(cmd){
    cmd = (cmd || '').trim();
    if(!cmd.startsWith('/')) return false;

    const parts = cmd.slice(1).split(/\s+/);
    const action = parts[0].toLowerCase();

    if(action === 'gamemode' || action === 'gm'){
      const targetMode = parts[1];
      if(!targetMode){
        window.toast('Usage: /gamemode <survival|creative|adventure|hardcore>', 3000);
        return true;
      }
      setMode(targetMode);
      return true;
    }
    else if(action === 'fly'){
      if(currentMode === MODES.CREATIVE || isSpectator){
        isFlying = !isFlying;
        window.toast(`Flying ${isFlying?'enabled':'disabled'}`, 1500);
      } else {
        window.toast('Flight is only available in Creative mode (/gamemode creative)', 2500);
      }
      return true;
    }
    else if(action === 'clear'){
      if(window.inventory){
        window.inventory.fill(null);
        if(window.onInvChanged) window.onInvChanged();
        window.toast('Inventory cleared', 1500);
      }
      return true;
    }

    return false;
  }

  window.MCModes = {
    MODES,
    MODE_INFO,
    CREATIVE_CATALOG,
    getMode,
    getModeConfig,
    setMode,
    onModeChange,
    handleJumpKey,
    isFlying: () => isFlying,
    setFlying,
    isSpectator: () => isSpectator,
    setSpectator,
    isInvincible: () => isSpectator || (currentMode === MODES.CREATIVE),
    isInstantBreak: () => currentMode === MODES.CREATIVE,
    hasInfiniteItems: () => currentMode === MODES.CREATIVE,
    isHardcore: () => currentMode === MODES.HARDCORE,
    canHarvestBlock,
    canPlaceBlock,
    updateModeHUD,
    processCommand
  };

})(window);
