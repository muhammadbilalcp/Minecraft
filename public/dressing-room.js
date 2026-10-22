// 3D Dressing Room & Authentic Minecraft Pixel-Art Character Customizer
(function(window){
  "use strict";

  const SKIN_TONES = [
    { name: 'Peach', color: '#f5c396', shade: '#d69d6b' },
    { name: 'Fair', color: '#ffd1a4', shade: '#e2af7f' },
    { name: 'Tan', color: '#d9a77a', shade: '#b88256' },
    { name: 'Warm Bronze', color: '#b97f52', shade: '#945e35' },
    { name: 'Deep Cocoa', color: '#68432b', shade: '#4d2d1a' },
    { name: 'Dark Ebony', color: '#3d2516', shade: '#28170b' },
    { name: 'Zombie Pale', color: '#659163', shade: '#4a6e48' },
    { name: 'Ender Purple', color: '#442d59', shade: '#2d1c3d' },
    { name: 'Frost Ice', color: '#95cbe8', shade: '#6ea6c4' },
    { name: 'Orc Green', color: '#4e7a3b', shade: '#355925' },
    { name: 'Golden Champion', color: '#f5c842', shade: '#cfa025' },
    { name: 'Skeleton Bone', color: '#d8d8d8', shade: '#b0b0b0' }
  ];

  const HAIR_STYLES = [
    { id: 0, name: 'Classic Short' },
    { id: 1, name: 'Messy Bedhead' },
    { id: 2, name: 'Side Parted' },
    { id: 3, name: 'Punk Mohawk' },
    { id: 4, name: 'Anime Spikes' },
    { id: 5, name: 'Long Ponytail' },
    { id: 6, name: 'Curly Afro' },
    { id: 7, name: 'Bald / Clean' }
  ];

  const HAIR_COLORS = [
    '#3a2312', '#1a1a1a', '#5a361c', '#a8733b', '#e2be67',
    '#8b2f15', '#e8e8e8', '#387346', '#2b5ea8', '#7b2fa8', '#e83863'
  ];

  const EYE_COLORS = [
    { name: 'Sapphire Blue', color: '#2b5ea8' },
    { name: 'Emerald Green', color: '#2d8c4e' },
    { name: 'Chestnut Brown', color: '#4a2c16' },
    { name: 'Ender Violet', color: '#8831b8' },
    { name: 'Nether Red', color: '#c92b2b' },
    { name: 'Ghost White', color: '#f0f0f0' },
    { name: 'Golden Amber', color: '#e5a519' }
  ];

  const TOP_STYLES = [
    { id: 0, name: 'Tank Top / Sleeveless' },
    { id: 1, name: 'Classic Steve T-Shirt' },
    { id: 2, name: 'Winter Zip Hoodie' },
    { id: 3, name: 'Suit & Silk Tie' },
    { id: 4, name: 'Lumberjack Flannel' },
    { id: 5, name: 'Knight Diamond Tunic' },
    { id: 6, name: 'Creeper Face Shirt' }
  ];

  const PANTS_STYLES = [
    { id: 0, name: 'Denim Shorts' },
    { id: 1, name: 'Classic Blue Jeans' },
    { id: 2, name: 'Dark Slacks' },
    { id: 3, name: 'Camo Cargo Pants' },
    { id: 4, name: 'Sport Sweatpants' },
    { id: 5, name: 'Heavy Plate Greaves' }
  ];

  const SHOES_STYLES = [
    { id: 0, name: 'Barefoot' },
    { id: 1, name: 'Leather Boots' },
    { id: 2, name: 'Hi-Top Sneakers' },
    { id: 3, name: 'Reinforced Steel' },
    { id: 4, name: 'Casual Sandals' }
  ];

  const HATS_STYLES = [
    { id: 0, name: 'None' },
    { id: 1, name: 'Miner Helmet with Light' },
    { id: 2, name: 'Royal Gold Crown' },
    { id: 3, name: 'Wizard Pointed Hat' },
    { id: 4, name: 'Baseball Cap' },
    { id: 5, name: 'Steampunk Goggles' },
    { id: 6, name: 'Cat Ears Headband' },
    { id: 7, name: 'Pirate Captain Hat' }
  ];

  const CAPES_STYLES = [
    { id: 0, name: 'None' },
    { id: 1, name: 'Hero Red Cape' },
    { id: 2, name: 'Ender Dragon Wings' },
    { id: 3, name: 'Creeper Face Cape' },
    { id: 4, name: 'Rainbow Cloak' },
    { id: 5, name: 'Royal Gold Mantle' }
  ];

  function hexToRgb(hex){
    hex = (hex || '#ffffff').replace('#', '');
    if(hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    const n = parseInt(hex, 16) || 0;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function rgbToHex(r, g, b){
    const h = (1 << 24) + (Math.max(0,Math.min(255,r)) << 16) + (Math.max(0,Math.min(255,g)) << 8) + Math.max(0,Math.min(255,b));
    return '#' + h.toString(16).slice(1);
  }

  function adjustColor(hex, factor){
    const [r, g, b] = hexToRgb(hex);
    return rgbToHex(Math.round(r * factor), Math.round(g * factor), Math.round(b * factor));
  }

  // Generate authentic Minecraft pixel-art texture canvas (16x16 face, body, arms, legs)
  function createPixelTexture(w, h, paintFn){
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    paintFn(ctx, w, h);
    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    return tex;
  }

  // Paint realistic Minecraft Face texture (8x8 pixels per face)
  function makeHeadMaterial(skin){
    const tex = createPixelTexture(32, 16, (ctx) => {
      const sCol = skin.skinTone;
      const sShade = adjustColor(sCol, 0.85);
      const sLight = adjustColor(sCol, 1.12);
      const hCol = skin.hairColor;
      const hShade = adjustColor(hCol, 0.75);
      const eyeCol = skin.eyeColor;

      // Base skin fill
      ctx.fillStyle = sCol;
      ctx.fillRect(0, 0, 32, 16);

      // Pixel skin noise/shading on front face (8, 8 to 16, 16)
      for(let x=8; x<16; x++){
        for(let y=8; y<16; y++){
          if((x+y)%3 === 0){ ctx.fillStyle = sLight; ctx.fillRect(x,y,1,1); }
          else if((x*2+y)%4 === 0){ ctx.fillStyle = sShade; ctx.fillRect(x,y,1,1); }
        }
      }

      // Front Face details (x: 8 to 15, y: 8 to 15)
      // Hair top fringe
      ctx.fillStyle = hCol;
      ctx.fillRect(8, 8, 8, 2);
      if(skin.hairStyle !== 7){
        ctx.fillRect(8, 10, 2, 2); // left sideburn
        ctx.fillRect(14, 10, 2, 2); // right sideburn
        if(skin.hairStyle === 1) ctx.fillRect(11, 10, 2, 1); // messy bang
        if(skin.hairStyle === 2) ctx.fillRect(9, 10, 3, 1); // parted bang
      }

      // Eyes (x: 9,10 and 13,14; y: 12)
      ctx.fillStyle = '#ffffff'; // Sclera
      ctx.fillRect(9, 12, 2, 1);
      ctx.fillRect(13, 12, 2, 1);
      ctx.fillStyle = eyeCol; // Iris
      ctx.fillRect(10, 12, 1, 1);
      ctx.fillRect(13, 12, 1, 1);
      // Eyebrows
      ctx.fillStyle = hShade;
      ctx.fillRect(9, 11, 2, 1);
      ctx.fillRect(13, 11, 2, 1);

      // Nose subtle shadow (x: 11,12; y: 13)
      ctx.fillStyle = sShade;
      ctx.fillRect(11, 13, 2, 1);

      // Mouth (x: 10 to 13; y: 14)
      ctx.fillStyle = adjustColor(sCol, 0.70);
      ctx.fillRect(10, 14, 4, 1);

      // Sides of head (Hair coverage)
      if(skin.hairStyle !== 7){
        ctx.fillStyle = hCol;
        ctx.fillRect(0, 8, 8, 3); // Right side hair
        ctx.fillRect(16, 8, 8, 3); // Left side hair
        ctx.fillRect(24, 8, 8, 8); // Back of head hair
        ctx.fillStyle = hShade;
        ctx.fillRect(25, 9, 6, 6);
        // Top of head (x: 8 to 15, y: 0 to 7)
        ctx.fillStyle = hCol;
        ctx.fillRect(8, 0, 8, 8);
        ctx.fillStyle = hShade;
        ctx.fillRect(9, 1, 6, 6);
      }
    });

    return new THREE.MeshLambertMaterial({ map: tex });
  }

  // Paint realistic Minecraft Torso texture with shirt collar, seam lines, belt
  function makeTorsoMaterial(skin){
    const tex = createPixelTexture(32, 16, (ctx) => {
      const topCol = skin.topColor;
      const topShade = adjustColor(topCol, 0.82);
      const topLight = adjustColor(topCol, 1.15);
      const pantsCol = skin.pantsColor;

      // Base fill
      ctx.fillStyle = topCol;
      ctx.fillRect(0, 0, 32, 16);

      // Fabric pixel texture
      for(let x=0; x<32; x++){
        for(let y=0; y<14; y++){
          if((x+y)%3 === 0){ ctx.fillStyle = topLight; ctx.fillRect(x,y,1,1); }
          else if((x*2+y)%4 === 0){ ctx.fillStyle = topShade; ctx.fillRect(x,y,1,1); }
        }
      }

      // Front Face (x: 8 to 15, y: 0 to 15)
      // Neckline
      ctx.fillStyle = skin.skinTone;
      ctx.fillRect(10, 0, 4, 2);
      ctx.fillStyle = adjustColor(skin.skinTone, 0.85);
      ctx.fillRect(11, 2, 2, 1);

      // Shirt specific details
      if(skin.topStyle === 3){ // Suit & Tie
        ctx.fillStyle = '#ffffff'; // White shirt
        ctx.fillRect(10, 1, 4, 6);
        ctx.fillStyle = '#b81414'; // Red tie
        ctx.fillRect(11, 1, 2, 7);
        ctx.fillStyle = '#111111'; // Suit lapels
        ctx.fillRect(9, 1, 1, 7);
        ctx.fillRect(14, 1, 1, 7);
      } else if(skin.topStyle === 2){ // Hoodie
        ctx.fillStyle = topShade;
        ctx.fillRect(9, 8, 6, 4); // Kangaroo pocket
        ctx.fillStyle = '#ffffff'; // Drawstrings
        ctx.fillRect(10, 2, 1, 4);
        ctx.fillRect(13, 2, 1, 4);
      } else if(skin.topStyle === 4){ // Flannel plaid
        ctx.fillStyle = adjustColor(topCol, 0.65);
        ctx.fillRect(8, 4, 8, 2);
        ctx.fillRect(8, 8, 8, 2);
        ctx.fillRect(11, 0, 2, 14);
      } else if(skin.topStyle === 6){ // Creeper logo
        ctx.fillStyle = '#0a3814';
        ctx.fillRect(10, 4, 4, 4);
        ctx.fillStyle = '#111111';
        ctx.fillRect(11, 5, 1, 1);
        ctx.fillRect(12, 5, 1, 1);
        ctx.fillRect(11, 7, 2, 1);
      } else if(skin.topStyle === 5){ // Diamond armor crest
        ctx.fillStyle = '#4ae2dc';
        ctx.fillRect(11, 4, 2, 4);
        ctx.fillRect(10, 5, 4, 2);
      }

      // Belt at waist (y: 14, 15)
      ctx.fillStyle = '#3a2211';
      ctx.fillRect(0, 14, 32, 2);
      ctx.fillStyle = '#ffd700'; // Gold belt buckle
      ctx.fillRect(11, 14, 2, 2);
    });

    return new THREE.MeshLambertMaterial({ map: tex });
  }

  // Paint realistic Minecraft Legs texture (Jeans, pockets, knees, shoes)
  function makeLegMaterial(skin, isLeft){
    const tex = createPixelTexture(16, 16, (ctx) => {
      const pCol = skin.pantsColor;
      const pShade = adjustColor(pCol, 0.80);
      const pLight = adjustColor(pCol, 1.15);
      const sCol = skin.shoesColor;

      // Base pants fill
      ctx.fillStyle = pCol;
      ctx.fillRect(0, 0, 16, 12);

      // Denim jeans pixel shading
      for(let x=0; x<16; x++){
        for(let y=0; y<12; y++){
          if((x+y)%3 === 0){ ctx.fillStyle = pLight; ctx.fillRect(x,y,1,1); }
          else if((x*2+y)%4 === 0){ ctx.fillStyle = pShade; ctx.fillRect(x,y,1,1); }
        }
      }

      // Knee shading
      ctx.fillStyle = pShade;
      ctx.fillRect(1, 5, 2, 2);

      // Shoes (y: 12 to 15)
      if(skin.shoesStyle > 0){
        ctx.fillStyle = sCol;
        ctx.fillRect(0, 12, 16, 4);
        // Sole of shoe
        ctx.fillStyle = adjustColor(sCol, 0.60);
        ctx.fillRect(0, 15, 16, 1);
        if(skin.shoesStyle === 2){ // Sneaker white sole & toe
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 14, 16, 2);
          ctx.fillRect(1, 13, 2, 1);
        }
      } else {
        // Barefoot skin
        ctx.fillStyle = skin.skinTone;
        ctx.fillRect(0, 12, 16, 4);
      }
    });

    return new THREE.MeshLambertMaterial({ map: tex });
  }

  // Paint realistic Minecraft Arms texture (Sleeve + Skin hands)
  function makeArmMaterial(skin, isLeft){
    const tex = createPixelTexture(16, 16, (ctx) => {
      const topCol = skin.topColor;
      const topShade = adjustColor(topCol, 0.85);
      const sCol = skin.skinTone;
      const sShade = adjustColor(sCol, 0.85);

      // Sleeve (upper arm y: 0 to 9)
      if(skin.topStyle === 0){
        // Tank top (bare arm)
        ctx.fillStyle = sCol;
        ctx.fillRect(0, 0, 16, 16);
      } else {
        ctx.fillStyle = topCol;
        ctx.fillRect(0, 0, 16, 10);
        ctx.fillStyle = topShade;
        ctx.fillRect(0, 9, 16, 1); // Sleeve cuff seam

        // Hand & Lower Arm (y: 10 to 15)
        ctx.fillStyle = sCol;
        ctx.fillRect(0, 10, 16, 6);
        ctx.fillStyle = sShade;
        ctx.fillRect(1, 14, 2, 1); // Knuckle / finger shading
      }
    });

    return new THREE.MeshLambertMaterial({ map: tex });
  }

  let dressingScene, dressingCamera, dressingRenderer, dressingModelGroup, previewCanvas;
  let isDragging = false, lastMouseX = 0, modelRotY = 0;
  let currentSkin = { ...window.MCAuth.DEFAULT_SKIN };

  function initPreview(canvasEl){
    previewCanvas = canvasEl;
    const w = canvasEl.clientWidth || 320;
    const h = canvasEl.clientHeight || 420;

    dressingScene = new THREE.Scene();
    dressingCamera = new THREE.PerspectiveCamera(38, w / h, 0.1, 50);
    dressingCamera.position.set(0, 1.25, 4.0);
    dressingCamera.lookAt(0, 1.05, 0);

    dressingRenderer = new THREE.WebGLRenderer({ canvas: canvasEl, alpha: true, antialias: true });
    dressingRenderer.setSize(w, h);
    dressingRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const ambLight = new THREE.AmbientLight(0xffffff, 0.9);
    dressingScene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.65);
    dirLight.position.set(3, 7, 5);
    dressingScene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0x80a0d0, 0.4);
    backLight.position.set(-3, 3, -3);
    dressingScene.add(backLight);

    dressingModelGroup = new THREE.Group();
    dressingScene.add(dressingModelGroup);

    function onDown(e){
      isDragging = true;
      lastMouseX = e.touches ? e.touches[0].clientX : e.clientX;
    }
    function onMove(e){
      if(!isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const dx = clientX - lastMouseX;
      lastMouseX = clientX;
      modelRotY += dx * 0.015;
      if(dressingModelGroup) dressingModelGroup.rotation.y = modelRotY;
      renderPreview();
    }
    function onUp(){ isDragging = false; }

    canvasEl.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    canvasEl.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);

    renderPreview();
  }

  // Construct complete authentic Minecraft 3D character with pixel art textures
  function buildPlayer3D(skin, isPreview){
    const group = new THREE.Group();
    const isAlex = skin.model === 'alex';
    const armW = isAlex ? 0.20 : 0.25;
    const armOffset = isAlex ? 0.36 : 0.39;

    // 1. Head with pixel-art face and skin
    const headGeom = new THREE.BoxGeometry(0.50, 0.50, 0.50);
    const headMat = makeHeadMaterial(skin);
    const head = new THREE.Mesh(headGeom, headMat);
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.75, 0);
    headGroup.add(head);

    // 3D Hair layer with volume (Minecraft 2nd layer helmet)
    if(skin.hairStyle !== 7){
      const hairNum = parseInt((skin.hairColor || '#3a2312').replace('#',''), 16);
      const hairMat = new THREE.MeshLambertMaterial({ color: hairNum });
      const hairVolume = new THREE.Mesh(new THREE.BoxGeometry(0.53, 0.22, 0.53), hairMat);
      hairVolume.position.set(0, 0.16, 0);
      headGroup.add(hairVolume);

      if(skin.hairStyle === 3){ // Mohawk
        const mohawk = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.32, 0.55), hairMat);
        mohawk.position.set(0, 0.25, 0);
        headGroup.add(mohawk);
      } else if(skin.hairStyle === 4){ // Anime spikes
        const s1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.12), hairMat);
        s1.position.set(-0.14, 0.35, 0.05); headGroup.add(s1);
        const s2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.12), hairMat);
        s2.position.set(0.14, 0.35, 0.05); headGroup.add(s2);
      } else if(skin.hairStyle === 5){ // Ponytail
        const pt = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.44, 0.12), hairMat);
        pt.position.set(0, -0.05, -0.32); headGroup.add(pt);
      }
    }

    // Hats and accessories
    if(skin.hatStyle === 1){ // Miner Helmet
      const mMat = new THREE.MeshLambertMaterial({ color: 0xd4a017 });
      const helm = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.16, 0.56), mMat);
      helm.position.set(0, 0.28, 0); headGroup.add(helm);
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.08), new THREE.MeshBasicMaterial({ color: 0xfff59d }));
      lamp.position.set(0, 0.24, 0.30); headGroup.add(lamp);
    } else if(skin.hatStyle === 2){ // Royal Gold Crown
      const cMat = new THREE.MeshLambertMaterial({ color: 0xffd700 });
      const crown = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.12, 0.54), cMat);
      crown.position.set(0, 0.28, 0); headGroup.add(crown);
      const ruby = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.04), new THREE.MeshBasicMaterial({ color: 0xdd1111 }));
      ruby.position.set(0, 0.34, 0.28); headGroup.add(ruby);
    } else if(skin.hatStyle === 3){ // Wizard Hat
      const wMat = new THREE.MeshLambertMaterial({ color: 0x362159 });
      const brim = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.06, 0.70), wMat);
      brim.position.set(0, 0.27, 0); headGroup.add(brim);
      const cone = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.24, 0.36), wMat);
      cone.position.set(0, 0.40, 0); headGroup.add(cone);
      const tip = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.18), wMat);
      tip.position.set(0, 0.60, 0); headGroup.add(tip);
    } else if(skin.hatStyle === 4){ // Baseball Cap
      const capMat = new THREE.MeshLambertMaterial({ color: 0xba2323 });
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.14, 0.54), capMat);
      cap.position.set(0, 0.28, 0); headGroup.add(cap);
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.04, 0.26), capMat);
      visor.position.set(0, 0.23, 0.36); headGroup.add(visor);
    } else if(skin.hatStyle === 5){ // Steampunk Goggles
      const gMat = new THREE.MeshLambertMaterial({ color: 0xbf7b26 });
      const glass = new THREE.MeshBasicMaterial({ color: 0x88e0ff });
      const g1 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.08), gMat);
      g1.position.set(-0.14, 0.16, 0.27); headGroup.add(g1);
      const g2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.08), gMat);
      g2.position.set(0.14, 0.16, 0.27); headGroup.add(g2);
      const l1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.10, 0.02), glass);
      l1.position.set(-0.14, 0.16, 0.32); headGroup.add(l1);
      const l2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.10, 0.02), glass);
      l2.position.set(0.14, 0.16, 0.32); headGroup.add(l2);
    } else if(skin.hatStyle === 6){ // Cat Ears
      const earMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
      const e1 = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.14, 0.10), earMat);
      e1.position.set(-0.18, 0.35, 0.05); headGroup.add(e1);
      const e2 = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.14, 0.10), earMat);
      e2.position.set(0.18, 0.35, 0.05); headGroup.add(e2);
    } else if(skin.hatStyle === 7){ // Pirate Captain Hat
      const pMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
      const phat = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.14, 0.54), pMat);
      phat.position.set(0, 0.30, 0); headGroup.add(phat);
      const skull = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.10, 0.02), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      skull.position.set(0, 0.32, 0.28); headGroup.add(skull);
    }
    group.add(headGroup);

    // 2. Torso with authentic Minecraft pixel art shirt
    const torsoGeom = new THREE.BoxGeometry(0.55, 0.75, 0.30);
    const torsoMat = makeTorsoMaterial(skin);
    const torso = new THREE.Mesh(torsoGeom, torsoMat);
    torso.position.set(0, 1.125, 0);
    group.add(torso);

    // 3. Arms with sleeves & pixel hands
    const armGeom = new THREE.BoxGeometry(armW, 0.70, armW);
    const armMat = makeArmMaterial(skin, false);

    const leftArm = new THREE.Group();
    leftArm.position.set(-armOffset, 1.47, 0);
    const leftArmMesh = new THREE.Mesh(armGeom, armMat);
    leftArmMesh.position.set(0, -0.25, 0);
    leftArm.add(leftArmMesh);

    const rightArm = new THREE.Group();
    rightArm.position.set(armOffset, 1.47, 0);
    const rightArmMesh = new THREE.Mesh(armGeom, armMat);
    rightArmMesh.position.set(0, -0.25, 0);
    rightArm.add(rightArmMesh);

    group.add(leftArm); group.add(rightArm);

    // 4. Legs & Pants with pixel art jeans and shoes
    const legGeom = new THREE.BoxGeometry(0.25, 0.75, 0.25);
    const legMat = makeLegMaterial(skin, false);

    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.14, 0.75, 0);
    const leftLegMesh = new THREE.Mesh(legGeom, legMat);
    leftLegMesh.position.set(0, -0.375, 0);
    leftLeg.add(leftLegMesh);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.14, 0.75, 0);
    const rightLegMesh = new THREE.Mesh(legGeom, legMat);
    rightLegMesh.position.set(0, -0.375, 0);
    rightLeg.add(rightLegMesh);

    group.add(leftLeg); group.add(rightLeg);

    // 5. Flowing Cape
    if(skin.capeStyle > 0){
      const capeTex = createPixelTexture(16, 24, (ctx) => {
        const cColors = ['#111111', '#b81414', '#2d1445', '#0f4d1e', '#1e5ab8', '#d4af37'];
        const base = cColors[skin.capeStyle] || '#b81414';
        ctx.fillStyle = base; ctx.fillRect(0, 0, 16, 24);

        if(skin.capeStyle === 2){ // Ender Dragon Wings
          ctx.fillStyle = '#ba32dc';
          ctx.fillRect(2, 4, 12, 12);
          ctx.fillStyle = '#111111';
          ctx.fillRect(5, 7, 6, 6);
        } else if(skin.capeStyle === 3){ // Creeper Face
          ctx.fillStyle = '#0a3d16';
          ctx.fillRect(4, 6, 8, 8);
          ctx.fillStyle = '#111111';
          ctx.fillRect(5, 8, 2, 2); ctx.fillRect(9, 8, 2, 2);
          ctx.fillRect(7, 10, 2, 3); ctx.fillRect(6, 12, 4, 1);
        } else if(skin.capeStyle === 4){ // Rainbow stripes
          const rCols = ['#ee2222', '#ee8822', '#eeee22', '#22ee44', '#22aaee', '#8822ee'];
          for(let i=0; i<6; i++){
            ctx.fillStyle = rCols[i];
            ctx.fillRect(0, i*4, 16, 4);
          }
        }
      });
      const capeMat = new THREE.MeshLambertMaterial({ map: capeTex });
      const capeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.85, 0.03), capeMat);
      capeMesh.position.set(0, 1.05, -0.18);
      capeMesh.rotation.x = 0.08;
      group.add(capeMesh);
    }

    return {
      group,
      legs: [leftLeg, rightLeg],
      arms: [leftArm, rightArm],
      head: headGroup,
      torso
    };
  }

  function updatePreviewModel(){
    if(!dressingModelGroup) return;
    while(dressingModelGroup.children.length > 0){
      const child = dressingModelGroup.children[0];
      dressingModelGroup.remove(child);
    }
    const built = buildPlayer3D(currentSkin, true);
    dressingModelGroup.add(built.group);
    dressingModelGroup.rotation.y = modelRotY;
    renderPreview();
  }

  function renderPreview(){
    if(dressingRenderer && dressingScene && dressingCamera){
      dressingRenderer.render(dressingScene, dressingCamera);
    }
  }

  function openDressingRoom(){
    const modal = document.getElementById('dressingModal');
    if(!modal) return;
    const profile = window.MCAuth.getProfile();
    currentSkin = { ...window.MCAuth.DEFAULT_SKIN, ...(profile.skin || {}) };

    modal.style.display = 'flex';
    if(document.pointerLockElement) document.exitPointerLock();

    const canvas = document.getElementById('dressingCanvas');
    if(canvas && !dressingRenderer){
      initPreview(canvas);
    }
    updatePreviewModel();
    renderWardrobeTabs();
  }

  function closeDressingRoom(){
    const modal = document.getElementById('dressingModal');
    if(modal) modal.style.display = 'none';
  }

  function saveAndEquip(){
    window.MCAuth.saveProfile({ skin: currentSkin });
    if(window.refreshLocalPlayerSkin){
      window.refreshLocalPlayerSkin(currentSkin);
    }
    closeDressingRoom();
    if(window.toast) window.toast('Custom skin equipped & saved!', 2500);
  }

  function randomizeOutfit(){
    const tone = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)].color;
    const hair = Math.floor(Math.random() * HAIR_STYLES.length);
    const hairCol = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)];
    const eye = EYE_COLORS[Math.floor(Math.random() * EYE_COLORS.length)].color;
    const top = Math.floor(Math.random() * TOP_STYLES.length);
    const topCol = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6,'0');
    const pants = Math.floor(Math.random() * PANTS_STYLES.length);
    const pantsCol = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6,'0');
    const shoes = Math.floor(Math.random() * SHOES_STYLES.length);
    const shoesCol = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6,'0');
    const hat = Math.floor(Math.random() * HATS_STYLES.length);
    const cape = Math.floor(Math.random() * CAPES_STYLES.length);

    currentSkin = {
      model: Math.random() > 0.5 ? 'steve' : 'alex',
      skinTone: tone,
      hairStyle: hair,
      hairColor: hairCol,
      eyeColor: eye,
      topStyle: top,
      topColor: topCol,
      pantsStyle: pants,
      pantsColor: pantsCol,
      shoesStyle: shoes,
      shoesColor: shoesCol,
      hatStyle: hat,
      capeStyle: cape
    };
    updatePreviewModel();
    renderWardrobeTabs();
  }

  let activeTab = 'skin';

  function renderWardrobeTabs(){
    const container = document.getElementById('wardrobeContent');
    if(!container) return;

    let html = '';

    if(activeTab === 'skin'){
      html += '<div class="wardrobe-section"><label>Model Proportions:</label><div class="opt-row">';
      html += `<button class="mc-tab-btn ${currentSkin.model==='steve'?'active':''}" onclick="window.MCDressing.setModel('steve')">Steve (Classic 4px)</button>`;
      html += `<button class="mc-tab-btn ${currentSkin.model==='alex'?'active':''}" onclick="window.MCDressing.setModel('alex')">Alex (Slim 3px)</button>`;
      html += '</div></div>';

      html += '<div class="wardrobe-section"><label>Skin Tone:</label><div class="color-grid">';
      for(const t of SKIN_TONES){
        const isSel = currentSkin.skinTone.toLowerCase() === t.color.toLowerCase();
        html += `<div class="color-swatch ${isSel?'selected':''}" style="background:${t.color}" title="${t.name}" onclick="window.MCDressing.setSkinTone('${t.color}')"></div>`;
      }
      html += `</div><div class="color-picker-row"><label>Custom Skin Hex:</label><input type="color" value="${currentSkin.skinTone}" onchange="window.MCDressing.setSkinTone(this.value)"></div></div>`;

      html += '<div class="wardrobe-section"><label>Eye Color:</label><div class="color-grid">';
      for(const e of EYE_COLORS){
        const isSel = currentSkin.eyeColor.toLowerCase() === e.color.toLowerCase();
        html += `<div class="color-swatch ${isSel?'selected':''}" style="background:${e.color}" title="${e.name}" onclick="window.MCDressing.setEyeColor('${e.color}')"></div>`;
      }
      html += `</div></div>`;
    }
    else if(activeTab === 'hair'){
      html += '<div class="wardrobe-section"><label>Hair Style:</label><div class="style-list">';
      for(const h of HAIR_STYLES){
        const isSel = currentSkin.hairStyle === h.id;
        html += `<button class="mc-item-card ${isSel?'selected':''}" onclick="window.MCDressing.setHairStyle(${h.id})">${h.name}</button>`;
      }
      html += '</div></div>';

      html += '<div class="wardrobe-section"><label>Hair Color:</label><div class="color-grid">';
      for(const c of HAIR_COLORS){
        const isSel = currentSkin.hairColor.toLowerCase() === c.toLowerCase();
        html += `<div class="color-swatch ${isSel?'selected':''}" style="background:${c}" onclick="window.MCDressing.setHairColor('${c}')"></div>`;
      }
      html += `</div><div class="color-picker-row"><label>Custom Hair Tint:</label><input type="color" value="${currentSkin.hairColor}" onchange="window.MCDressing.setHairColor(this.value)"></div></div>`;
    }
    else if(activeTab === 'top'){
      html += '<div class="wardrobe-section"><label>Shirt & Top Style:</label><div class="style-list">';
      for(const s of TOP_STYLES){
        const isSel = currentSkin.topStyle === s.id;
        html += `<button class="mc-item-card ${isSel?'selected':''}" onclick="window.MCDressing.setTopStyle(${s.id})">${s.name}</button>`;
      }
      html += '</div></div>';
      html += `<div class="wardrobe-section"><label>Shirt Color:</label><div class="color-picker-row"><input type="color" value="${currentSkin.topColor}" onchange="window.MCDressing.setTopColor(this.value)"><span style="color:#222;font-size:12px;margin-left:8px">100% Free - pick any hue!</span></div></div>`;
    }
    else if(activeTab === 'pants'){
      html += '<div class="wardrobe-section"><label>Pants & Bottoms Style:</label><div class="style-list">';
      for(const p of PANTS_STYLES){
        const isSel = currentSkin.pantsStyle === p.id;
        html += `<button class="mc-item-card ${isSel?'selected':''}" onclick="window.MCDressing.setPantsStyle(${p.id})">${p.name}</button>`;
      }
      html += '</div></div>';
      html += `<div class="wardrobe-section"><label>Pants Color:</label><div class="color-picker-row"><input type="color" value="${currentSkin.pantsColor}" onchange="window.MCDressing.setPantsColor(this.value)"></div></div>`;
    }
    else if(activeTab === 'shoes'){
      html += '<div class="wardrobe-section"><label>Footwear Style:</label><div class="style-list">';
      for(const s of SHOES_STYLES){
        const isSel = currentSkin.shoesStyle === s.id;
        html += `<button class="mc-item-card ${isSel?'selected':''}" onclick="window.MCDressing.setShoesStyle(${s.id})">${s.name}</button>`;
      }
      html += '</div></div>';
      html += `<div class="wardrobe-section"><label>Shoes Color:</label><div class="color-picker-row"><input type="color" value="${currentSkin.shoesColor}" onchange="window.MCDressing.setShoesColor(this.value)"></div></div>`;
    }
    else if(activeTab === 'hats'){
      html += '<div class="wardrobe-section"><label>Hats & Accessories:</label><div class="style-list">';
      for(const h of HATS_STYLES){
        const isSel = currentSkin.hatStyle === h.id;
        html += `<button class="mc-item-card ${isSel?'selected':''}" onclick="window.MCDressing.setHatStyle(${h.id})">${h.name}</button>`;
      }
      html += '</div></div>';
    }
    else if(activeTab === 'capes'){
      html += '<div class="wardrobe-section"><label>Capes & Wings:</label><div class="style-list">';
      for(const c of CAPES_STYLES){
        const isSel = currentSkin.capeStyle === c.id;
        html += `<button class="mc-item-card ${isSel?'selected':''}" onclick="window.MCDressing.setCapeStyle(${c.id})">${c.name}</button>`;
      }
      html += '</div></div>';
    }

    container.innerHTML = html;

    const tabs = document.querySelectorAll('.wardrobe-nav-btn');
    tabs.forEach(t => {
      if(t.dataset.tab === activeTab) t.classList.add('active');
      else t.classList.remove('active');
    });
  }

  function setTab(tabName){ activeTab = tabName; renderWardrobeTabs(); }
  function setModel(m){ currentSkin.model = m; updatePreviewModel(); renderWardrobeTabs(); }
  function setSkinTone(c){ currentSkin.skinTone = c; updatePreviewModel(); renderWardrobeTabs(); }
  function setEyeColor(c){ currentSkin.eyeColor = c; updatePreviewModel(); renderWardrobeTabs(); }
  function setHairStyle(id){ currentSkin.hairStyle = id; updatePreviewModel(); renderWardrobeTabs(); }
  function setHairColor(c){ currentSkin.hairColor = c; updatePreviewModel(); renderWardrobeTabs(); }
  function setTopStyle(id){ currentSkin.topStyle = id; updatePreviewModel(); renderWardrobeTabs(); }
  function setTopColor(c){ currentSkin.topColor = c; updatePreviewModel(); renderWardrobeTabs(); }
  function setPantsStyle(id){ currentSkin.pantsStyle = id; updatePreviewModel(); renderWardrobeTabs(); }
  function setPantsColor(c){ currentSkin.pantsColor = c; updatePreviewModel(); renderWardrobeTabs(); }
  function setShoesStyle(id){ currentSkin.shoesStyle = id; updatePreviewModel(); renderWardrobeTabs(); }
  function setShoesColor(c){ currentSkin.shoesColor = c; updatePreviewModel(); renderWardrobeTabs(); }
  function setHatStyle(id){ currentSkin.hatStyle = id; updatePreviewModel(); renderWardrobeTabs(); }
  function setCapeStyle(id){ currentSkin.capeStyle = id; updatePreviewModel(); renderWardrobeTabs(); }

  window.MCDressing = {
    open: openDressingRoom,
    close: closeDressingRoom,
    saveAndEquip,
    randomizeOutfit,
    setTab,
    setModel, setSkinTone, setEyeColor,
    setHairStyle, setHairColor,
    setTopStyle, setTopColor,
    setPantsStyle, setPantsColor,
    setShoesStyle, setShoesColor,
    setHatStyle, setCapeStyle,
    buildPlayer3D,
    getSkin: () => ({ ...currentSkin })
  };

})(window);
