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
    { id: 24, name: 'Copper Ore', cat: 'blocks' },
    { id: 25, name: 'Lapis Ore', cat: 'blocks' },
    { id: 26, name: 'Redstone Ore', cat: 'blocks' },
    { id: 27, name: 'Diamond Ore', cat: 'blocks' },
    { id: 28, name: 'Emerald Ore', cat: 'blocks' },
    { id: 10, name: 'Bedrock', cat: 'blocks' },
    { id: 14, name: 'Obsidian', cat: 'blocks' },
    { id: 11, name: 'Netherrack', cat: 'blocks' },
    { id: 19, name: 'Nether Bricks', cat: 'blocks' },
    { id: 20, name: 'Soul Sand', cat: 'blocks' },
    { id: 21, name: 'Nether Quartz Ore', cat: 'blocks' },
    { id: 22, name: 'Nether Gold Ore', cat: 'blocks' },
    { id: 23, name: 'Ancient Debris', cat: 'blocks' },
    { id: 34, name: 'Basalt', cat: 'blocks' },
    { id: 13, name: 'Glowstone', cat: 'blocks' },
    { id: 16, name: 'End Stone', cat: 'blocks' },
    { id: 40, name: 'Tall Grass', cat: 'blocks' },
    { id: 41, name: 'Red Poppy', cat: 'blocks' },
    { id: 42, name: 'Dandelion', cat: 'blocks' },
    { id: 29, name: 'Crafting Table', cat: 'blocks' },
    { id: 30, name: 'Furnace', cat: 'blocks' },
    { id: 31, name: 'Chest', cat: 'blocks' },
    { id: 32, name: 'TNT', cat: 'blocks' },
    { id: 33, name: 'Bookshelf', cat: 'blocks' },
    { id: 35, name: 'Redstone Block', cat: 'blocks' },
    { id: 36, name: 'Anvil', cat: 'blocks' },
    { id: 37, name: 'Enchanting Table', cat: 'blocks' },
    { id: 38, name: 'Beacon', cat: 'blocks' },
    { id: 39, name: 'Campfire', cat: 'blocks' },
    { id: 43, name: 'Torch', cat: 'blocks' },
    { id: 44, name: 'Redstone Torch', cat: 'blocks' },
    { id: 45, name: 'Rail', cat: 'blocks' },
    { id: 50, name: 'Bed', cat: 'blocks' },
    { id: 51, name: 'Ladder', cat: 'blocks' },
    { id: 52, name: 'Barrel', cat: 'blocks' },

    // Tools & Weapons
    { id: 163, name: 'Wooden Pickaxe', cat: 'tools' },
    { id: 104, name: 'Stone Pickaxe', cat: 'tools' },
    { id: 171, name: 'Iron Pickaxe', cat: 'tools' },
    { id: 176, name: 'Golden Pickaxe', cat: 'tools' },
    { id: 181, name: 'Diamond Pickaxe', cat: 'tools' },
    { id: 186, name: 'Netherite Pickaxe', cat: 'tools' },
    { id: 164, name: 'Wooden Sword', cat: 'tools' },
    { id: 105, name: 'Stone Sword', cat: 'tools' },
    { id: 172, name: 'Iron Sword', cat: 'tools' },
    { id: 177, name: 'Golden Sword', cat: 'tools' },
    { id: 182, name: 'Diamond Sword', cat: 'tools' },
    { id: 187, name: 'Netherite Sword', cat: 'tools' },
    { id: 165, name: 'Wooden Axe', cat: 'tools' },
    { id: 168, name: 'Stone Axe', cat: 'tools' },
    { id: 173, name: 'Iron Axe', cat: 'tools' },
    { id: 178, name: 'Golden Axe', cat: 'tools' },
    { id: 183, name: 'Diamond Axe', cat: 'tools' },
    { id: 188, name: 'Netherite Axe', cat: 'tools' },
    { id: 166, name: 'Wooden Shovel', cat: 'tools' },
    { id: 169, name: 'Stone Shovel', cat: 'tools' },
    { id: 174, name: 'Iron Shovel', cat: 'tools' },
    { id: 184, name: 'Diamond Shovel', cat: 'tools' },
    { id: 191, name: 'Bow', cat: 'tools' },
    { id: 192, name: 'Crossbow', cat: 'tools' },
    { id: 193, name: 'Arrow', cat: 'tools' },
    { id: 194, name: 'Shield', cat: 'tools' },
    { id: 195, name: 'Shears', cat: 'tools' },
    { id: 106, name: 'Flint & Steel', cat: 'tools' },
    { id: 196, name: 'Fishing Rod', cat: 'tools' },
    { id: 199, name: 'Spyglass', cat: 'tools' },
    { id: 200, name: 'Mace', cat: 'tools' },
    { id: 201, name: 'Brush', cat: 'tools' },
    { id: 108, name: 'Eye of Ender', cat: 'tools' },

    // Food & Materials
    { id: 101, name: 'Apple', cat: 'food' },
    { id: 102, name: 'Porkchop', cat: 'food' },
    { id: 103, name: 'Beef', cat: 'food' },
    { id: 149, name: 'Carrot', cat: 'food' },
    { id: 161, name: 'Golden Carrot', cat: 'food' },
    { id: 162, name: 'Glistering Melon', cat: 'food' },
    { id: 100, name: 'Coal', cat: 'materials' },
    { id: 131, name: 'Raw Copper', cat: 'materials' },
    { id: 145, name: 'Copper Ingot', cat: 'materials' },
    { id: 110, name: 'Iron Ingot', cat: 'materials' },
    { id: 136, name: 'Gold Ingot', cat: 'materials' },
    { id: 160, name: 'Gold Nugget', cat: 'materials' },
    { id: 132, name: 'Lapis Lazuli', cat: 'materials' },
    { id: 133, name: 'Redstone Dust', cat: 'materials' },
    { id: 134, name: 'Diamond', cat: 'materials' },
    { id: 135, name: 'Emerald', cat: 'materials' },
    { id: 144, name: 'Nether Quartz', cat: 'materials' },
    { id: 137, name: 'Netherite Scrap', cat: 'materials' },
    { id: 138, name: 'Netherite Ingot', cat: 'materials' },
    { id: 139, name: 'Stick', cat: 'materials' },
    { id: 140, name: 'String', cat: 'materials' },
    { id: 141, name: 'Feather', cat: 'materials' },
    { id: 142, name: 'Gunpowder', cat: 'materials' },
    { id: 143, name: 'Slimeball', cat: 'materials' },
    { id: 107, name: 'Blaze Powder', cat: 'materials' },
    { id: 109, name: 'Leather', cat: 'materials' },
    { id: 154, name: 'Bone', cat: 'materials' },
    { id: 156, name: 'Ghast Tear', cat: 'materials' },
    { id: 157, name: 'Magma Cream', cat: 'materials' },
    { id: 158, name: 'Fire Charge', cat: 'materials' },
    { id: 159, name: 'Glass Bottle', cat: 'materials' },

    // Armors
    { id: 111, name: 'Leather Cap', cat: 'armor' },
    { id: 112, name: 'Leather Tunic', cat: 'armor' },
    { id: 113, name: 'Leather Pants', cat: 'armor' },
    { id: 114, name: 'Leather Boots', cat: 'armor' },
    { id: 115, name: 'Iron Helmet', cat: 'armor' },
    { id: 116, name: 'Iron Chestplate', cat: 'armor' },
    { id: 117, name: 'Iron Leggings', cat: 'armor' },
    { id: 118, name: 'Iron Boots', cat: 'armor' },
    { id: 119, name: 'Golden Helmet', cat: 'armor' },
    { id: 120, name: 'Golden Chestplate', cat: 'armor' },
    { id: 121, name: 'Golden Leggings', cat: 'armor' },
    { id: 122, name: 'Golden Boots', cat: 'armor' },
    { id: 123, name: 'Diamond Helmet', cat: 'armor' },
    { id: 124, name: 'Diamond Chestplate', cat: 'armor' },
    { id: 125, name: 'Diamond Leggings', cat: 'armor' },
    { id: 126, name: 'Diamond Boots', cat: 'armor' },
    { id: 127, name: 'Netherite Helmet', cat: 'armor' },
    { id: 128, name: 'Netherite Chestplate', cat: 'armor' },
    { id: 129, name: 'Netherite Leggings', cat: 'armor' },
    { id: 130, name: 'Netherite Boots', cat: 'armor' },

    // Automation & Vehicles
    { id: 202, name: 'Minecart', cat: 'tools' },
    { id: 206, name: 'Boat', cat: 'tools' },
    { id: 214, name: 'Piston', cat: 'tools' },
    { id: 215, name: 'Sticky Piston', cat: 'tools' },
    { id: 218, name: 'Hopper', cat: 'tools' },
    { id: 226, name: 'Lever', cat: 'tools' },
    { id: 227, name: 'Pressure Plate', cat: 'tools' }
  ];

  function getMode(){
    return currentMode;
  }

  function getModeConfig(){
    return MODE_INFO[currentMode] || MODE_INFO.survival;
  }

  function setMode(newMode, silent, broadcast = true){
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

    if(broadcast && window.netSend){
      try { window.netSend({ t:'mode', mode: currentMode }); } catch(e){}
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
  const isPickaxe = id => [104, 163, 171, 176, 181, 186].includes(id);
  const isAxe = id => [165, 168, 173, 178, 183, 188].includes(id);
  const isSword = id => [105, 164, 172, 177, 182, 187, 195].includes(id);
  const isShovel = id => [166, 169, 174, 179, 184, 189].includes(id);

  function canHarvestBlock(blockId, heldItemId){
    if(currentMode !== MODES.ADVENTURE) return { allowed: true };

    // Stone, Ores, Obsidian, Bedrock -> Require Pickaxe
    if(blockId === 3 || blockId === 9 || blockId === 18 || blockId === 11 || blockId === 14 || blockId === 16 || (blockId >= 19 && blockId <= 28) || blockId === 34 || blockId === 35 || blockId === 36){
      if(isPickaxe(heldItemId)) return { allowed: true };
      return { allowed: false, reason: 'Adventure Mode: You need a Pickaxe to break this stone or ore!' };
    }

    // Wood & Planks -> Require Axe or Pickaxe
    if(blockId === 4 || blockId === 8 || blockId === 29 || blockId === 31 || blockId === 33 || blockId === 52){
      if(isAxe(heldItemId) || isPickaxe(heldItemId)) return { allowed: true };
      return { allowed: false, reason: 'Adventure Mode: You need an Axe to harvest wood!' };
    }

    // Leaves, Plants, Flowers -> Sword or shears
    if(blockId === 5 || (blockId >= 40 && blockId <= 42)){
      if(isSword(heldItemId) || heldItemId === 195) return { allowed: true };
      return { allowed: false, reason: 'Adventure Mode: You need a Sword or Shears to cut foliage!' };
    }

    // Sand, Dirt -> Shovel or bare hand
    if(blockId === 2 || blockId === 6 || blockId === 20){
      if(isShovel(heldItemId)) return { allowed: true };
      return { allowed: false, reason: 'Adventure Mode: You need a Shovel to dig soil!' };
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
