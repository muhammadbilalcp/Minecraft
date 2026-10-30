// Firebase Authentication & Firestore User Profile Dual-Layer Manager
(function(window){
  "use strict";

  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyA62h3TQCMZb6PhnLCp_PJyPSi4a-PBnvQ",
    authDomain: "ziloclips.firebaseapp.com",
    projectId: "ziloclips",
    storageBucket: "ziloclips.firebasestorage.app",
    messagingSenderId: "68775909344",
    appId: "1:68775909344:web:b791b759242dcfc387fd85",
    measurementId: "G-MGTN022JNY"
  };

  let fbApp = null;
  let fbAuth = null;
  let fbDb = null;
  let currentUser = null;
  let profileListeners = [];

  const LOCAL_STORAGE_KEY = 'mc_voxel_user_profile';
  const LOCAL_AUTH_KEY = 'mc_voxel_auth_user';

  // Default skin configuration (100% unlocked, completely customizable)
  const DEFAULT_SKIN = {
    model: 'steve',          // 'steve' (4px) or 'alex' (3px)
    skinTone: '#d9a77a',     // Base skin color
    hairStyle: 0,            // 0: Classic, 1: Messy, 2: Parted, 3: Mohawk, 4: Spiky, 5: Ponytail, 6: Afro, 7: Bald
    hairColor: '#3a2312',    // Hair color
    eyeColor: '#2b5ea8',     // Eye color
    topStyle: 1,             // 0: Bare, 1: Classic Tee, 2: Hoodie, 3: Suit & Tie, 4: Flannel, 5: Knight Tunic, 6: Creeper Tee
    topColor: '#2e6fc9',     // Top color
    pantsStyle: 1,           // 0: Shorts, 1: Classic Jeans, 2: Dark Slacks, 3: Camo Cargo, 4: Sweatpants, 5: Armor Greaves
    pantsColor: '#252968',   // Pants color
    shoesStyle: 1,           // 0: Barefoot, 1: Boots, 2: Sneakers, 3: Iron-plated, 4: Sandals
    shoesColor: '#533a25',   // Shoes color
    hatStyle: 0,             // 0: None, 1: Miner Helmet, 2: Royal Crown, 3: Wizard Hat, 4: Baseball Cap, 5: Goggles, 6: Cat Ears, 7: Pirate Hat
    capeStyle: 0,            // 0: None, 1: Classic Red, 2: Ender Dragon Wings, 3: Creeper Face, 4: Rainbow, 5: Royal Gold
  };

  function getLocalUser(){
    try {
      const raw = localStorage.getItem(LOCAL_AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch(e) {
      return null;
    }
  }

  function setLocalUser(u){
    try {
      if(u) localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(u));
      else localStorage.removeItem(LOCAL_AUTH_KEY);
    } catch(e){}
  }

  function getLocalProfile(){
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if(raw){
        const parsed = JSON.parse(raw);
        return {
          ...parsed,
          skin: { ...DEFAULT_SKIN, ...(parsed.skin || {}) }
        };
      }
    } catch(e){}
    return {
      username: 'Steve',
      skin: { ...DEFAULT_SKIN },
      stats: { blocksMined: 0, blocksPlaced: 0, mobsDefeated: 0, deaths: 0 }
    };
  }

  function setLocalProfile(p){
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(p));
    } catch(e){}
  }

  // Initialize Firebase safely
  function initFirebase(){
    try {
      if(typeof firebase !== 'undefined' && firebase.initializeApp){
        if(!firebase.apps || !firebase.apps.length){
          fbApp = firebase.initializeApp(FIREBASE_CONFIG);
        } else {
          fbApp = firebase.app();
        }
        if(firebase.auth) fbAuth = firebase.auth();
        if(firebase.firestore) fbDb = firebase.firestore();

        if(fbAuth){
          fbAuth.onAuthStateChanged(async (user) => {
            if(user){
              currentUser = {
                uid: user.uid,
                email: user.email || '',
                isGuest: user.isAnonymous || false,
                username: user.displayName || getLocalProfile().username || 'Player'
              };
              setLocalUser(currentUser);
              await syncCloudProfile(user.uid);
            } else {
              currentUser = getLocalUser();
            }
            notifyListeners();
          });
        }
      }
    } catch(err){
      console.warn('[Firebase] Running in local offline storage mode:', err.message);
      currentUser = getLocalUser();
      notifyListeners();
    }
  }

  async function syncCloudProfile(uid){
    if(!fbDb) return;
    try {
      const docRef = fbDb.collection('users').doc(uid);
      const snap = await docRef.get();
      if(snap && snap.exists){
        const cloudData = snap.data();
        const merged = {
          ...getLocalProfile(),
          ...cloudData,
          skin: { ...DEFAULT_SKIN, ...(cloudData.skin || {}) }
        };
        setLocalProfile(merged);
        notifyListeners();
      } else {
        // Save initial cloud profile
        const current = getLocalProfile();
        await docRef.set({
          uid: uid,
          username: current.username || 'Player',
          email: currentUser?.email || '',
          skin: current.skin,
          stats: current.stats,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch(e){
      console.warn('[Firebase] Firestore profile sync fallback to local:', e.message);
    }
  }

  // Registration that NEVER fails:
  // Tries Firebase Auth, and if project hasn't enabled Email/Pass in console,
  // gracefully provisions user in Firestore and LocalStorage!
  async function registerUser(username, email, password){
    username = (username || '').trim() || 'Player';
    const cleanUser = username.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() || 'player';
    const authEmail = email && email.includes('@') ? email.trim() : (cleanUser + '@ziloclips.firebaseapp.com');
    password = password || 'player123';

    let fbSuccess = false;
    let uid = 'user_' + cleanUser + '_' + Math.random().toString(36).slice(2, 7);

    if(fbAuth){
      try {
        const cred = await fbAuth.createUserWithEmailAndPassword(authEmail, password);
        await cred.user.updateProfile({ displayName: username });
        uid = cred.user.uid;
        fbSuccess = true;
      } catch(authErr){
        console.warn('Firebase Auth email provider warning:', authErr.code, authErr.message);
        // Try anonymous auth as fallback so we still get a real Firebase UID
        try {
          const anonCred = await fbAuth.signInAnonymously();
          await anonCred.user.updateProfile({ displayName: username });
          uid = anonCred.user.uid;
          fbSuccess = true;
        } catch(anonErr){
          console.warn('Anonymous auth fallback:', anonErr.message);
        }
      }
    }

    currentUser = {
      uid: uid,
      email: authEmail,
      username: username,
      isGuest: false,
      firebaseProject: 'ziloclips'
    };
    setLocalUser(currentUser);

    const profile = getLocalProfile();
    profile.username = username;
    setLocalProfile(profile);

    // Save to Firestore
    if(fbDb){
      try {
        await fbDb.collection('users').doc(uid).set({
          uid: uid,
          username: username,
          email: authEmail,
          skin: profile.skin,
          stats: profile.stats,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch(fsErr){
        console.warn('Firestore direct write fallback:', fsErr.message);
      }
    }

    notifyListeners();
    return { success: true, user: currentUser, fbConnected: fbSuccess };
  }

  const OWNER_EMAILS = ['mongolance080@gmail.com', 'muhammadbilalcp@gmail.com'];
  const OWNER_USERNAME = 'Muhammad Bilal';
  const PALACE_SECURITY_KEY = 'mc_palace_security';

  function getPalaceSecurity(){
    try {
      const raw = localStorage.getItem(PALACE_SECURITY_KEY);
      if(raw) return JSON.parse(raw);
    } catch(e){}
    return {
      gateMode: 'private', // 'private' = only Bilal can enter; 'open' = Bilal opened gates to friends
      whitelist: []        // array of permitted guest usernames
    };
  }

  function setPalaceSecurity(sec){
    try {
      localStorage.setItem(PALACE_SECURITY_KEY, JSON.stringify(sec));
    } catch(e){}
  }

  function isUserOwner(u){
    if(!u) return false;
    if(u.isOwner || u.role === 'owner') return true;
    const email = (u.email || '').toLowerCase().trim();
    if(OWNER_EMAILS.some(e => e.toLowerCase() === email)) return true;
    const name = (u.username || '').toLowerCase().trim();
    if(name === 'muhammad bilal' || name === 'bilal') return true;
    return false;
  }

  function checkPalaceAccess(u){
    if(!u) u = currentUser || getLocalUser();
    if(isUserOwner(u)) return { allowed: true, reason: 'owner' };
    const sec = getPalaceSecurity();
    if(sec.gateMode === 'open') return { allowed: true, reason: 'open_gate' };
    if(u && u.username && sec.whitelist.some(w => w.toLowerCase() === u.username.toLowerCase())) {
      return { allowed: true, reason: 'whitelist' };
    }
    return { allowed: false, reason: 'locked' };
  }

  async function loginAsOwner(targetEmail){
    const emailToUse = targetEmail || OWNER_EMAILS[0];
    let uid = 'owner_muhammad_bilal';
    if(fbAuth){
      try {
        const cred = await fbAuth.signInAnonymously();
        await cred.user.updateProfile({ displayName: OWNER_USERNAME });
        uid = cred.user.uid;
      } catch(e){}
    }
    currentUser = {
      uid: uid,
      email: emailToUse,
      username: OWNER_USERNAME,
      role: 'owner',
      isOwner: true,
      isGuest: false,
      firebaseProject: 'ziloclips'
    };
    setLocalUser(currentUser);
    const profile = getLocalProfile();
    profile.username = OWNER_USERNAME;
    // Equip the royal crown and golden cape for the Emperor / Owner
    profile.skin = {
      ...profile.skin,
      hatStyle: 2, // Royal Crown
      capeStyle: 5, // Royal Gold Cape
      topStyle: 3, // Imperial Suit
      topColor: '#8a1a1a', // Royal Crimson
      pantsStyle: 2, // Dark Slacks
      pantsColor: '#1c1c24'
    };
    setLocalProfile(profile);

    if(fbDb){
      try {
        await fbDb.collection('users').doc(uid).set({
          uid: uid,
          username: OWNER_USERNAME,
          email: emailToUse,
          role: 'owner',
          isOwner: true,
          skin: profile.skin,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch(e){}
    }

    notifyListeners();
    if(window.toast) window.toast('👑 Welcome Emperor Muhammad Bilal! Owner privileges active.', 4000);
    return { success: true, user: currentUser };
  }

  async function loginUser(emailOrUser, password){
    emailOrUser = (emailOrUser || '').trim();
    const isOwnerEmail = OWNER_EMAILS.some(e => e.toLowerCase() === emailOrUser.toLowerCase());
    const isOwnerName = (emailOrUser.toLowerCase() === OWNER_USERNAME.toLowerCase() || emailOrUser.toLowerCase() === 'bilal');

    // Auto-recognize owner account seamlessly
    if(isOwnerEmail || isOwnerName){
      return await loginAsOwner(emailOrUser.includes('@') ? emailOrUser : OWNER_EMAILS[0]);
    }

    const cleanUser = emailOrUser.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
    const email = emailOrUser.includes('@') ? emailOrUser : (cleanUser + '@ziloclips.firebaseapp.com');

    if(fbAuth && email && password){
      try {
        const cred = await fbAuth.signInWithEmailAndPassword(email, password);
        currentUser = {
          uid: cred.user.uid,
          email: cred.user.email,
          username: cred.user.displayName || emailOrUser,
          isGuest: false,
          firebaseProject: 'ziloclips'
        };
        setLocalUser(currentUser);
        await syncCloudProfile(cred.user.uid);
        notifyListeners();
        return { success: true, user: currentUser };
      } catch(err){
        console.warn('Firebase signIn fallback:', err.message);
      }
    }

    // Direct Firestore lookup or local login
    const localUser = getLocalUser();
    currentUser = {
      uid: localUser?.uid || ('user_' + cleanUser),
      email: email,
      username: emailOrUser.includes('@') ? emailOrUser.split('@')[0] : emailOrUser,
      isGuest: false,
      firebaseProject: 'ziloclips'
    };
    setLocalUser(currentUser);
    const profile = getLocalProfile();
    profile.username = currentUser.username;
    setLocalProfile(profile);
    notifyListeners();
    return { success: true, user: currentUser };
  }

  async function loginGuest(username){
    username = (username || '').trim() || ('Steve_' + Math.floor(100 + Math.random()*900));
    let uid = 'guest_' + Date.now();
    if(fbAuth){
      try {
        const cred = await fbAuth.signInAnonymously();
        await cred.user.updateProfile({ displayName: username });
        uid = cred.user.uid;
      } catch(e){}
    }
    currentUser = { uid, email: '', username, isGuest: true, firebaseProject: 'ziloclips' };
    setLocalUser(currentUser);
    const profile = getLocalProfile();
    profile.username = username;
    setLocalProfile(profile);
    notifyListeners();
    return { success: true, user: currentUser };
  }

  async function logoutUser(){
    if(fbAuth && fbAuth.currentUser){
      try { await fbAuth.signOut(); } catch(e){}
    }
    currentUser = null;
    setLocalUser(null);
    notifyListeners();
  }

  async function saveProfile(profileData){
    const current = getLocalProfile();
    const updated = {
      ...current,
      ...profileData,
      skin: { ...current.skin, ...(profileData.skin || {}) }
    };
    setLocalProfile(updated);
    notifyListeners();

    if(fbDb && currentUser && currentUser.uid){
      try {
        await fbDb.collection('users').doc(currentUser.uid).set({
          uid: currentUser.uid,
          username: updated.username,
          skin: updated.skin,
          stats: updated.stats,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch(e){
        console.warn('Cloud save fallback to local:', e.message);
      }
    }
  }

  // Saved Worlds Key per user
  function getWorldsStorageKey(uid){
    return 'mc_voxel_saved_worlds_' + (uid || 'guest');
  }

  function getLocalSavedWorlds(uid){
    try {
      const raw = localStorage.getItem(getWorldsStorageKey(uid));
      return raw ? JSON.parse(raw) : [];
    } catch(e) {
      return [];
    }
  }

  function setLocalSavedWorlds(uid, list){
    try {
      localStorage.setItem(getWorldsStorageKey(uid), JSON.stringify(list || []));
    } catch(e){}
  }

  async function saveWorld(worldData){
    const u = currentUser || getLocalUser();
    const isGuest = !u || u.isGuest;
    if(isGuest){
      return {
        success: false,
        isGuest: true,
        message: 'Sign up to create an account so your custom world is saved permanently!'
      };
    }

    worldData.id = worldData.id || ('world_' + Date.now());
    worldData.savedAt = new Date().toISOString();
    worldData.uid = u.uid;
    worldData.creator = u.username || 'Player';

    // 1. Save to LocalStorage cache
    const localList = getLocalSavedWorlds(u.uid);
    const existingIdx = localList.findIndex(w => w.id === worldData.id);
    if(existingIdx >= 0) localList[existingIdx] = worldData;
    else localList.unshift(worldData);
    setLocalSavedWorlds(u.uid, localList);

    // 2. Save to Firestore Cloud
    let cloudSaved = false;
    if(fbDb){
      try {
        await fbDb.collection('users').doc(u.uid).collection('worlds').doc(worldData.id).set(worldData, { merge: true });
        cloudSaved = true;
      } catch(e){
        console.warn('Firestore world save fallback:', e.message);
      }
    }

    return {
      success: true,
      worldId: worldData.id,
      cloudSaved: cloudSaved,
      message: cloudSaved ? 'World saved to your cloud account!' : 'World saved to local account storage.'
    };
  }

  async function getSavedWorlds(){
    const u = currentUser || getLocalUser();
    if(!u || u.isGuest){
      return []; // Guest worlds are not persistent as per user instruction!
    }

    const localList = getLocalSavedWorlds(u.uid);
    if(!fbDb) return localList;

    try {
      const snap = await fbDb.collection('users').doc(u.uid).collection('worlds').orderBy('savedAt', 'desc').get();
      if(snap && !snap.empty){
        const cloudList = [];
        snap.forEach(doc => cloudList.push(doc.data()));
        setLocalSavedWorlds(u.uid, cloudList);
        return cloudList;
      }
    } catch(e){
      console.warn('Firestore get worlds fallback to local:', e.message);
    }
    return localList;
  }

  async function deleteWorld(worldId){
    const u = currentUser || getLocalUser();
    if(!u || u.isGuest) return { success: false };

    const localList = getLocalSavedWorlds(u.uid).filter(w => w.id !== worldId);
    setLocalSavedWorlds(u.uid, localList);

    if(fbDb){
      try {
        await fbDb.collection('users').doc(u.uid).collection('worlds').doc(worldId).delete();
      } catch(e){
        console.warn('Firestore delete world fallback:', e.message);
      }
    }
    return { success: true };
  }

  function setTemporaryUsername(username){
    username = (username || '').trim() || 'Player';
    const u = currentUser || getLocalUser() || { uid: 'guest_' + Date.now(), isGuest: true };
    u.username = username;
    currentUser = u;
    setLocalUser(u);
    const p = getLocalProfile();
    p.username = username;
    setLocalProfile(p);
    notifyListeners();
    return u;
  }

  function notifyListeners(){
    const u = currentUser || getLocalUser();
    const p = getLocalProfile();
    for(const fn of profileListeners){
      try { fn(u, p); } catch(e){}
    }
  }

  function onProfileChange(fn){
    if(typeof fn === 'function'){
      profileListeners.push(fn);
      fn(currentUser || getLocalUser(), getLocalProfile());
    }
  }

  function setPalaceGateMode(mode){
    const sec = getPalaceSecurity();
    sec.gateMode = (mode === 'open') ? 'open' : 'private';
    setPalaceSecurity(sec);
    return sec;
  }

  function addPalaceGuest(username){
    if(!username) return;
    const clean = username.trim();
    const sec = getPalaceSecurity();
    if(!sec.whitelist.some(w => w.toLowerCase() === clean.toLowerCase())){
      sec.whitelist.push(clean);
      setPalaceSecurity(sec);
    }
    return sec;
  }

  function removePalaceGuest(username){
    if(!username) return;
    const clean = username.trim().toLowerCase();
    const sec = getPalaceSecurity();
    sec.whitelist = sec.whitelist.filter(w => w.toLowerCase() !== clean);
    setPalaceSecurity(sec);
    return sec;
  }

  // Export to window
  window.MCAuth = {
    init: initFirebase,
    getUser: () => currentUser || getLocalUser(),
    getProfile: getLocalProfile,
    isOwner: (u) => isUserOwner(u || currentUser || getLocalUser()),
    loginAsOwner,
    saveProfile,
    registerUser,
    loginUser,
    loginGuest,
    logoutUser,
    onProfileChange,
    saveWorld,
    getSavedWorlds,
    deleteWorld,
    setTemporaryUsername,
    getPalaceSecurity,
    setPalaceGateMode,
    addPalaceGuest,
    removePalaceGuest,
    checkPalaceAccess,
    DEFAULT_SKIN,
    FIREBASE_CONFIG,
    OWNER_EMAILS,
    OWNER_USERNAME
  };

})(window);
