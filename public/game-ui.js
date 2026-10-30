// Game UI & Modal Handlers for Minecraft (4 Modes, Account, Multiplayer, GTA-style Bilal Production)
(function(window){
  "use strict";

  const $ = id => document.getElementById(id);

  let activeAuthTab = 'guest';
  let selectedMode = 'survival';
  let pauseOpen = false;

  // --- Account & Auth Modal ---
  function openAuthModal(){
    const modal = $('authModal');
    if(!modal) return;
    modal.style.display = 'flex';
    if(document.pointerLockElement) document.exitPointerLock();

    const u = window.MCAuth ? window.MCAuth.getUser() : null;
    if(u && !u.isGuest){
      if($('authUsernameInput')) $('authUsernameInput').value = u.username || '';
      if($('authEmailInput')) $('authEmailInput').value = u.email || '';
      if($('authLogoutBtn')) $('authLogoutBtn').style.display = 'block';
    } else {
      if($('authLogoutBtn')) $('authLogoutBtn').style.display = 'none';
    }
  }

  function switchAuthTab(tab){
    activeAuthTab = tab;
    if($('authTabGuest')) $('authTabGuest').classList.toggle('active', tab==='guest');
    if($('authTabRegister')) $('authTabRegister').classList.toggle('active', tab==='register');
    if($('authTabLogin')) $('authTabLogin').classList.toggle('active', tab==='login');
    if($('authStatusMsg')) $('authStatusMsg').style.display = 'none';

    if(tab === 'guest'){
      if($('authUsernameRow')) $('authUsernameRow').style.display = 'block';
      if($('authEmailRow')) $('authEmailRow').style.display = 'none';
      if($('authPasswordRow')) $('authPasswordRow').style.display = 'none';
      if($('authSubmitBtn')) $('authSubmitBtn').textContent = 'Continue as Guest';
    } else if(tab === 'register'){
      if($('authUsernameRow')) $('authUsernameRow').style.display = 'block';
      if($('authEmailRow')) $('authEmailRow').style.display = 'block';
      if($('authPasswordRow')) $('authPasswordRow').style.display = 'block';
      if($('authSubmitBtn')) $('authSubmitBtn').textContent = 'Create Free Account';
    } else {
      if($('authUsernameRow')) $('authUsernameRow').style.display = 'none';
      if($('authEmailRow')) $('authEmailRow').style.display = 'block';
      if($('authPasswordRow')) $('authPasswordRow').style.display = 'block';
      if($('authSubmitBtn')) $('authSubmitBtn').textContent = 'Sign In';
    }
  }

  async function handleAuthSubmit(){
    const uName = $('authUsernameInput') ? $('authUsernameInput').value.trim() : '';
    const email = $('authEmailInput') ? $('authEmailInput').value.trim() : '';
    const pass = $('authPasswordInput') ? $('authPasswordInput').value : '';
    const statusMsg = $('authStatusMsg');

    if(statusMsg) statusMsg.style.display = 'none';

    if(activeAuthTab === 'guest'){
      if(window.MCAuth) await window.MCAuth.loginGuest(uName);
      $('authModal').style.display = 'none';
      if(window.toast) window.toast('Playing as: ' + (uName || 'Player'), 2500);
    } else if(activeAuthTab === 'register'){
      if(!uName){
        if(statusMsg){ statusMsg.textContent = 'Please choose a username.'; statusMsg.style.display = 'block'; }
        return;
      }
      if(window.MCAuth){
        const res = await window.MCAuth.registerUser(uName, email, pass);
        if(res.success){
          $('authModal').style.display = 'none';
          if(window.toast) window.toast('Account registered! Welcome, ' + res.user.username, 3500);
        } else {
          if(statusMsg){ statusMsg.textContent = res.error || 'Failed to create account'; statusMsg.style.display = 'block'; }
        }
      }
    } else if(activeAuthTab === 'login'){
      if(window.MCAuth){
        const res = await window.MCAuth.loginUser(email || uName, pass);
        if(res.success){
          $('authModal').style.display = 'none';
          if(window.toast) window.toast('Logged in as ' + res.user.username, 3000);
        } else {
          if(statusMsg){ statusMsg.textContent = res.error || 'Invalid credentials'; statusMsg.style.display = 'block'; }
        }
      }
    }
  }

  async function handleLogout(){
    if(window.MCAuth) await window.MCAuth.logoutUser();
    if($('authLogoutBtn')) $('authLogoutBtn').style.display = 'none';
    if(window.toast) window.toast('Logged out. Playing as Guest.', 2500);
    switchAuthTab('guest');
  }

  // --- World Setup Modal (4 Game Modes) ---
  // --- World Setup Modal (4 Game Modes) ---
  let isNewWorldFlow = true;
  let isHostFlow = false;

  async function quickLoginOwner(){
    if(window.MCAuth){
      await window.MCAuth.loginAsOwner();
      const modal = $('authModal');
      if(modal) modal.style.display = 'none';
      updateWorldSetupBanner();
      const u = window.MCAuth.getUser();
      if($('menuAccountName')) $('menuAccountName').textContent = '👑 ' + (u ? u.username : 'Muhammad Bilal');
      if($('menuAccountBtn')){
        $('menuAccountBtn').style.background = '#854d0e';
        $('menuAccountBtn').style.borderColor = '#ffd700';
      }
    }
  }
  window.quickLoginOwner = quickLoginOwner;

  function updateWorldSetupBanner(){
    const banner = $('worldSetupAccountBanner');
    const nameTagInput = $('worldSetupNameTag');
    const u = window.MCAuth ? window.MCAuth.getUser() : null;
    const isOwner = window.MCAuth ? window.MCAuth.isOwner() : false;
    const isGuest = !u || u.isGuest;

    if(nameTagInput){
      if(!nameTagInput.value || nameTagInput.value === 'Steve' || nameTagInput.value === 'Player'){
        nameTagInput.value = (u && u.username) ? u.username : (window.myName || 'Muhammad Bilal');
      }
    }

    if(!banner) return;
    if(isOwner){
      banner.style.background = '#fef9e7';
      banner.style.border = '2px solid #d4af37';
      banner.style.color = '#5a3d00';
      banner.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
          <div>
            <strong>👑 Emperor &amp; Game Owner (Muhammad Bilal):</strong> All worlds, the Grand Palace, and custom builds are backed up to your account!
          </div>
          <button type="button" class="mcbtn" style="width:auto;margin:0;padding:4px 10px;font-size:12px;background:#854d0e;border-color:#ffd700" onclick="openSavedWorldsModal()">📂 My Saved Worlds</button>
        </div>
      `;
    } else if(!isGuest && u){
      banner.style.background = '#e6f7ea';
      banner.style.border = '1px solid #52c41a';
      banner.style.color = '#135200';
      banner.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
          <div>
            <strong>✓ Signed In as ${escapeHtml(u.username)}:</strong> Your custom world, builds, and name tag will be <strong>permanently saved</strong> to your cloud account!
          </div>
          <button type="button" class="mcbtn" style="width:auto;margin:0;padding:4px 10px;font-size:12px;background:#389e0d" onclick="openSavedWorldsModal()">📂 My Saved Worlds</button>
        </div>
      `;
    } else {
      banner.style.background = '#fffbe6';
      banner.style.border = '1px solid #faad14';
      banner.style.color = '#873800';
      banner.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
          <div>
            <strong>⚠️ Playing as Temporary Guest:</strong> Your custom world will <strong>NOT be saved</strong> without an account!
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <button type="button" class="mcbtn" style="width:auto;margin:0;padding:4px 10px;font-size:12px;background:#854d0e;border-color:#ffd700" onclick="quickLoginOwner()">👑 Owner Login</button>
            <button type="button" class="mcbtn" style="width:auto;margin:0;padding:4px 10px;font-size:12px;background:#2b6bb0" onclick="openAuthModal('register')">Sign Up</button>
          </div>
        </div>
      `;
    }
  }

  function escapeHtml(str){
    return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function openWorldSetup(forHost, newWorld){
    isHostFlow = !!forHost;
    isNewWorldFlow = (newWorld !== undefined) ? !!newWorld : true;
    const modal = $('worldSetupModal');
    if(!modal) return;
    modal.style.display = 'flex';
    if(document.pointerLockElement) document.exitPointerLock();

    const titleEl = document.getElementById('worldSetupTitle');
    if(titleEl){
      titleEl.textContent = isHostFlow ? 'Host Online World (Choose Mode)' : 'World Setup & Game Mode';
    }

    const seedRow = document.getElementById('worldSetupSeedRow');
    if(seedRow){
      seedRow.style.display = 'block';
      if($('worldSetupSeed') && !$('worldSetupSeed').value){
        $('worldSetupSeed').value = Math.floor(100000 + Math.random() * 900000);
      }
    }

    if($('worldSetupName') && (!isHostFlow || !$('worldSetupName').value)){
      $('worldSetupName').value = 'World ' + Math.floor(100 + Math.random()*900);
    }

    updateWorldSetupBanner();
    selectWorldMode(selectedMode || 'survival');
  }

  function openNewWorldModal(){
    openWorldSetup(false, true);
  }

  function selectWorldMode(m){
    selectedMode = m;
    document.querySelectorAll('.mode-card').forEach(c => {
      c.classList.toggle('selected', c.dataset.mode === m);
    });
  }

  function startWorldWithSetup(thenHost){
    const host = (thenHost !== undefined) ? !!thenHost : isHostFlow;

    // Apply custom player name tag (account or temporary username)
    const nameTagInput = $('worldSetupNameTag');
    const customNameTag = nameTagInput ? nameTagInput.value.trim() : '';
    if(customNameTag){
      if(window.MCAuth) window.MCAuth.setTemporaryUsername(customNameTag);
      window.myName = customNameTag;
    }

    const worldNameInput = $('worldSetupName');
    const chosenWorldName = worldNameInput ? worldNameInput.value.trim() : 'My World';
    window.currentWorldName = chosenWorldName || 'My World';

    const modal = $('worldSetupModal');
    if(modal) modal.style.display = 'none';

    if(window.MCModes) window.MCModes.setMode(selectedMode, false, true);

    const seedInput = $('worldSetupSeed');
    const seed = seedInput ? seedInput.value.trim() : '';

    if(window.createWorld){
      window.createWorld(seed, host);
      return;
    }

    const menu = $('menu');
    if(menu) menu.style.display = 'none';
    if(window.startPlaying){
      window.startPlaying();
    }
    if(host && window.startHost){
      window.startHost();
    }
  }

  // --- Saved Worlds Modal ---
  async function openSavedWorldsModal(){
    const modal = $('savedWorldsModal');
    if(!modal) return;
    modal.style.display = 'flex';
    if(document.pointerLockElement) document.exitPointerLock();

    const u = window.MCAuth ? window.MCAuth.getUser() : null;
    const isGuest = !u || u.isGuest;
    const listContainer = $('savedWorldsList');
    if(!listContainer) return;

    if(isGuest){
      listContainer.innerHTML = `
        <div style="background:#fffbe6;border:1px solid #faad14;border-radius:4px;padding:16px;text-align:center;color:#873800">
          <h3 style="margin:0 0 8px;font-size:18px">No Saved Worlds (Guest Mode)</h3>
          <p style="margin:0 0 14px;font-size:13px">You are playing with a temporary guest username. Custom worlds are only saved permanently when you sign up with a free account!</p>
          <button class="mcbtn" style="width:auto;margin:0 auto;padding:10px 20px;background:#2b6bb0" onclick="document.getElementById('savedWorldsModal').style.display='none';openAuthModal('register')">🔑 Sign Up / Log In to Save Worlds</button>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = '<div style="text-align:center;padding:24px;color:#666">Loading your saved worlds...</div>';
    const worlds = await window.MCAuth.getSavedWorlds();

    if(!worlds || !worlds.length){
      listContainer.innerHTML = `
        <div style="background:#f4f4f4;border:1px dashed #aaa;border-radius:4px;padding:20px;text-align:center;color:#555">
          <h3 style="margin:0 0 8px;font-size:18px">No Saved Worlds Yet</h3>
          <p style="margin:0 0 14px;font-size:13px">You have an account ready! Create a custom world or click "Save World" from the Pause Menu while playing.</p>
          <button class="mcbtn" style="width:auto;margin:0 auto;padding:8px 18px;background:#4a8027" onclick="document.getElementById('savedWorldsModal').style.display='none';openNewWorldModal()">+ Create New World</button>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = '';
    for(const w of worlds){
      const card = document.createElement('div');
      card.style.cssText = 'background:#2c2c2c;color:#fff;border:2px solid #555;padding:12px;margin-bottom:10px;border-radius:4px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px';

      const dateStr = w.savedAt ? new Date(w.savedAt).toLocaleDateString() + ' ' + new Date(w.savedAt).toLocaleTimeString() : 'Recent';
      const modeUpper = (w.mode || 'survival').toUpperCase();
      const editsCount = (w.edits && w.edits.length) ? w.edits.length : 0;

      card.innerHTML = `
        <div>
          <div style="font-size:17px;font-weight:700;color:#9ff0ff">${escapeHtml(w.name || 'Custom World')} <span style="font-size:11px;background:#444;padding:2px 6px;border-radius:3px;color:#fff;font-weight:normal">${modeUpper}</span></div>
          <div style="font-size:12px;color:#aaa;margin-top:4px">Seed: ${w.seed || 'Classic'} • Edits: ${editsCount} blocks • Saved: ${dateStr}</div>
        </div>
        <div style="display:flex;gap:6px">
          <button class="mcbtn" style="width:auto;margin:0;padding:6px 14px;background:#4a8027;font-size:13px">▶ Play</button>
          <button class="mcbtn" style="width:auto;margin:0;padding:6px 12px;background:#3b587a;font-size:13px">🌐 Host</button>
          <button class="mcbtn" style="width:auto;margin:0;padding:6px 10px;background:#8a3a3a;font-size:13px">🗑️</button>
        </div>
      `;

      const btns = card.querySelectorAll('button');
      // Play
      btns[0].onclick = () => {
        $('savedWorldsModal').style.display = 'none';
        if(window.loadSavedWorld) window.loadSavedWorld(w, false);
      };
      // Host
      btns[1].onclick = () => {
        $('savedWorldsModal').style.display = 'none';
        if(window.loadSavedWorld) window.loadSavedWorld(w, true);
      };
      // Delete
      btns[2].onclick = async () => {
        if(confirm(`Are you sure you want to delete "${w.name}"?`)){
          await window.MCAuth.deleteWorld(w.id);
          openSavedWorldsModal();
        }
      };

      listContainer.appendChild(card);
    }
  }

  // --- In-Game Pause Menu & Save System ---
  function togglePauseMenu(){
    pauseOpen = !pauseOpen;
    const menu = $('pauseMenu');
    if(!menu) return;
    menu.style.display = pauseOpen ? 'flex' : 'none';

    if(pauseOpen){
      if(document.pointerLockElement) document.exitPointerLock();
      const current = window.MCModes ? window.MCModes.getMode() : 'survival';
      document.querySelectorAll('[data-pause-mode]').forEach(b => {
        b.classList.toggle('active', b.dataset.pauseMode === current);
      });
    } else {
      if(window.lockPointer) window.lockPointer();
    }
  }

  async function saveCurrentWorld(){
    const u = window.MCAuth ? window.MCAuth.getUser() : null;
    const isGuest = !u || u.isGuest;

    if(isGuest){
      if(document.pointerLockElement) document.exitPointerLock();
      if(confirm('⚠️ You are currently playing as a Temporary Guest. Custom worlds are only saved permanently with an account!\n\nWould you like to sign up or log in now to save your world?')){
        openAuthModal('register');
      }
      return;
    }

    if(window.getCurrentWorldData && window.MCAuth){
      const data = window.getCurrentWorldData();
      const res = await window.MCAuth.saveWorld(data);
      if(res.success){
        if(window.toast) window.toast(`💾 World "${data.name}" saved successfully to your account!`, 3500);
      } else {
        if(window.toast) window.toast('Failed to save world: ' + (res.message || 'Error'), 3000);
      }
    }
  }

  function resumeGame(){
    pauseOpen = false;
    const menu = $('pauseMenu');
    if(menu) menu.style.display = 'none';
    if(window.lockPointer) window.lockPointer();
  }

  function copyInviteLink(){
    const code = window.roomCode;
    if(!code){
      if(window.toast) window.toast('Host an online world first to generate an invite link!', 2500);
      return;
    }
    const url = window.location.origin + window.location.pathname + '?join=' + code;
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(url).then(() => {
        if(window.toast) window.toast('Invite link copied! Send it to your friends to play together.', 4000);
      }).catch(() => {
        if(window.toast) window.toast('Room code: ' + code, 3500);
      });
    } else {
      if(window.toast) window.toast('Room code: ' + code, 3500);
    }
  }

  async function exitToMainMenu(){
    // Auto-save if signed in
    const u = window.MCAuth ? window.MCAuth.getUser() : null;
    if(u && !u.isGuest && window.getCurrentWorldData && window.MCAuth){
      try {
        const data = window.getCurrentWorldData();
        await window.MCAuth.saveWorld(data);
      } catch(e){}
    }
    pauseOpen = false;
    if($('pauseMenu')) $('pauseMenu').style.display = 'none';
    if($('deathScreen')) $('deathScreen').style.display = 'none';
    if($('victory')) $('victory').style.display = 'none';
    document.body.classList.add('inmenu');
    if($('menu')) $('menu').style.display = 'flex';
    if(window.closeNet) window.closeNet();
  }

  function enterSpectatorMode(){
    if($('deathScreen')) $('deathScreen').style.display = 'none';
    if(window.MCModes) window.MCModes.setSpectator(true);
    if(window.player){
      window.player.alive = true;
      window.player.health = window.player.maxHealth;
    }
    if(window.lockPointer) window.lockPointer();
    if(window.toast) window.toast('Spectator Mode Active: Fly freely through blocks to inspect your world!', 4000);
  }

  // --- Creative Item Catalog in Inventory ---
  function switchInvTab(tab){
    if($('invTabSurvival')) $('invTabSurvival').classList.toggle('active', tab==='backpack');
    if($('invTabCreative')) $('invTabCreative').classList.toggle('active', tab==='creative');

    if(tab === 'creative'){
      if($('creativeCatalogGrid')) $('creativeCatalogGrid').style.display = 'grid';
      if($('invGrid')) $('invGrid').style.display = 'none';
      if($('recipes')) $('recipes').style.display = 'none';
      renderCreativeCatalog();
    } else {
      if($('creativeCatalogGrid')) $('creativeCatalogGrid').style.display = 'none';
      if($('invGrid')) $('invGrid').style.display = 'grid';
      if($('recipes')) $('recipes').style.display = 'flex';
    }
  }

  function renderCreativeCatalog(){
    const grid = $('creativeCatalogGrid');
    if(!grid || !window.MCModes) return;
    grid.innerHTML = '';
    const catalog = window.MCModes.CREATIVE_CATALOG;
    for(const item of catalog){
      const d = document.createElement('div');
      d.className = 'slot';
      d.title = item.name + ' (Click to take 64)';
      const img = document.createElement('img');
      img.src = window.getIcon ? window.getIcon(item.id) : '';
      d.appendChild(img);
      const count = document.createElement('div');
      count.className = 'count';
      count.textContent = '∞';
      d.appendChild(count);
      d.onclick = () => {
        if(window.addItem) window.addItem(item.id, 64);
        if(window.sfx) window.sfx('place');
        if(window.toast) window.toast('+ 64 ' + item.name, 1000);
      };
      grid.appendChild(d);
    }
  }

  // Export globally to window
  window.openAuthModal = openAuthModal;
  window.switchAuthTab = switchAuthTab;
  window.handleAuthSubmit = handleAuthSubmit;
  window.handleLogout = handleLogout;
  window.openWorldSetup = openWorldSetup;
  window.openNewWorldModal = openNewWorldModal;
  window.selectWorldMode = selectWorldMode;
  window.startWorldWithSetup = startWorldWithSetup;
  window.openSavedWorldsModal = openSavedWorldsModal;
  window.saveCurrentWorld = saveCurrentWorld;
  window.togglePauseMenu = togglePauseMenu;
  window.resumeGame = resumeGame;
  window.copyInviteLink = copyInviteLink;
  window.exitToMainMenu = exitToMainMenu;
  window.enterSpectatorMode = enterSpectatorMode;
  window.switchInvTab = switchInvTab;
  window.renderCreativeCatalog = renderCreativeCatalog;

  function updateUserUI(u, p){
    const isOwner = window.MCAuth ? window.MCAuth.isOwner(u) : false;
    const nameEl = $('menuAccountName');
    const accBtn = $('menuAccountBtn');
    const menuGateBtn = $('menuPalaceGateBtn');
    const pauseGateBtn = $('pausePalaceGateBtn');

    if(nameEl){
      nameEl.textContent = isOwner ? ('👑 ' + (u?.username || 'Muhammad Bilal')) : (u && !u.isGuest ? u.username : 'Guest');
    }
    if(accBtn){
      if(isOwner){
        accBtn.style.background = '#854d0e';
        accBtn.style.borderColor = '#ffd700';
        accBtn.style.color = '#fff';
      } else if(u && !u.isGuest){
        accBtn.style.background = '#2b6bb0';
        accBtn.style.borderColor = '#fff';
        accBtn.style.color = '#fff';
      } else {
        accBtn.style.background = '';
        accBtn.style.borderColor = '';
        accBtn.style.color = '';
      }
    }
    if(menuGateBtn){
      menuGateBtn.style.display = isOwner ? 'block' : 'none';
    }
    if(pauseGateBtn){
      pauseGateBtn.style.display = isOwner ? 'block' : 'none';
    }
    updateWorldSetupBanner();
  }
  window.updateUserUI = updateUserUI;

  // DOM ready hook
  window.addEventListener('DOMContentLoaded', () => {
    const submitBtn = $('authSubmitBtn');
    if(submitBtn) submitBtn.addEventListener('click', handleAuthSubmit);

    if(window.MCAuth && window.MCAuth.onProfileChange){
      window.MCAuth.onProfileChange(updateUserUI);
    }

    // Auto-check for invite link in URL (?join=CODE)
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if(joinCode && $('codeInput')){
      $('codeInput').value = joinCode.toUpperCase();
      setTimeout(() => {
        if(window.joinWorld) window.joinWorld(joinCode);
      }, 700);
    }
  });

})(window);
