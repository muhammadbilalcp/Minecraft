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
  let isNewWorldFlow = false;

  function openWorldSetup(newWorld){
    isNewWorldFlow = !!newWorld;
    const modal = $('worldSetupModal');
    if(!modal) return;
    modal.style.display = 'flex';
    if(document.pointerLockElement) document.exitPointerLock();

    const titleEl = document.getElementById('worldSetupTitle');
    if(titleEl){
      titleEl.textContent = isNewWorldFlow ? 'Create New World' : 'Choose Game Mode';
    }

    const seedRow = document.getElementById('worldSetupSeedRow');
    if(seedRow){
      seedRow.style.display = isNewWorldFlow ? 'block' : 'none';
      if(isNewWorldFlow && $('worldSetupSeed') && !$('worldSetupSeed').value){
        $('worldSetupSeed').value = Math.floor(100000 + Math.random() * 900000);
      }
    }

    // Default to currently selected mode
    selectWorldMode(selectedMode || 'survival');
  }

  function openNewWorldModal(){
    openWorldSetup(true);
  }

  function selectWorldMode(m){
    selectedMode = m;
    document.querySelectorAll('.mode-card').forEach(c => {
      c.classList.toggle('selected', c.dataset.mode === m);
    });
  }

  function startWorldWithSetup(thenHost){
    const modal = $('worldSetupModal');
    if(modal) modal.style.display = 'none';

    if(window.MCModes) window.MCModes.setMode(selectedMode, false);

    const seedInput = $('worldSetupSeed');
    const seed = (isNewWorldFlow && seedInput) ? seedInput.value.trim() : '';

    if(isNewWorldFlow && window.createWorld){
      window.createWorld(seed, !!thenHost);
      return;
    }

    // Continuing into world without resetting!
    const menu = $('menu');
    if(menu) menu.style.display = 'none';

    if(window.startPlaying){
      window.startPlaying();
    }
    if(thenHost && window.startHost){
      window.startHost();
    }
  }

  // --- In-Game Pause Menu ---
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

  function exitToMainMenu(){
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
  window.togglePauseMenu = togglePauseMenu;
  window.resumeGame = resumeGame;
  window.copyInviteLink = copyInviteLink;
  window.exitToMainMenu = exitToMainMenu;
  window.enterSpectatorMode = enterSpectatorMode;
  window.switchInvTab = switchInvTab;
  window.renderCreativeCatalog = renderCreativeCatalog;

  // DOM ready hook
  window.addEventListener('DOMContentLoaded', () => {
    const submitBtn = $('authSubmitBtn');
    if(submitBtn) submitBtn.addEventListener('click', handleAuthSubmit);

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
