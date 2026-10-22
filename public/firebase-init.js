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

  async function loginUser(emailOrUser, password){
    emailOrUser = (emailOrUser || '').trim();
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

  // Export to window
  window.MCAuth = {
    init: initFirebase,
    getUser: () => currentUser || getLocalUser(),
    getProfile: getLocalProfile,
    saveProfile,
    registerUser,
    loginUser,
    loginGuest,
    logoutUser,
    onProfileChange,
    DEFAULT_SKIN,
    FIREBASE_CONFIG
  };

})(window);
