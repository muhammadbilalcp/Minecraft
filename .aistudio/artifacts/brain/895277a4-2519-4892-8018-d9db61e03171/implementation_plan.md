# Minecraft: Dressing Room, 4 Game Modes & Multiplayer

A comprehensive expansion to Minecraft Voxel Survival introducing player registration and profiles, a 3D character dressing room with 100% free outfits and accessories, enhanced multiplayer with friends, and full implementation of all four Minecraft game modes (Survival, Creative with flight and infinite blocks, Adventure with rule-based breaking/interaction, and Hardcore with permanent death and spectator mode).

### User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed based on your preferences:
> - **Account & Profile Storage**: Firebase-backed user accounts and profiles with instant guest fallback, allowing seamless registration, login, and cloud persistence for custom skins and stats.
> - **3D Dressing Room**: Full interactive 3D character preview model featuring unlocked skin tones, hair styles, tops/hoodies, pants, boots, capes, hats, and RGB color palettes—all completely free.
> - **Four Game Modes**: Full implementation of Survival, Creative (flying with double-tap Space, instant block break, creative item palette, invincibility), Adventure (block protection requiring specific harvest tools, interaction with buttons/levers), and Hardcore (locked hard difficulty, single life, permadeath into spectator mode). Modes are selectable at world creation and switchable via pause menu or `/gamemode` commands.
> - **Multiplayer Playing with Friends**: Room code generation, direct link sharing, and live player presence so friends see each other's custom dressed-up 3D skins in real time.

---

### 1. Overview & Core Concept

- **What It Does**: Transforms the existing voxel engine into a full-featured sandbox survival game where players can register an account, dress up their 3D block avatar with unlimited free outfits and colors, host or join online multiplayer worlds with friends via simple invite codes, and play across all four classic Minecraft game modes.
- **Target Audience / Persona**: Minecraft fans, sandbox builders, survival enthusiasts, and friends who want to explore, build, and fight bosses together in their browser without paywalls or restrictive downloads.
- **Key Value**: Everything is unlocked and free. Players have total creative freedom over their avatar's appearance and how they experience their world—whether testing survival skills in Hardcore, flying and building colossal structures in Creative, creating map adventures, or surviving the night together in multiplayer.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Registration & Dressing Room Flow**:
   - The user opens the game menu and clicks **"Profile & Dressing Room"**.
   - If not signed in, they can register with a username, email, and password, or play as an instant guest.
   - The Dressing Room presents a rotatable 3D player model (Steve/Alex proportions). The player selects categories (Skin Tone, Hair, Top/Shirt, Pants, Shoes, Hats/Helmets, Capes, and Accessories). Everything is 100% free with live color tint pickers.
   - Clicking **"Save & Equip"** saves the skin to their profile and equips it on their in-game 3D model, visible to themselves and multiplayer peers.

2. **World Creation & Game Mode Selection Flow**:
   - Player clicks **"Create New World"** or **"Play"**.
   - A mode selection banner displays the 4 distinct modes with iconic descriptions:
     - **Survival**: Health, hunger, resource mining, crafting, mobs, and respawning.
     - **Creative**: Infinite blocks hotbar/catalog, flight (double Space to toggle flying, Space/Shift to ascend/descend), instant break, zero damage.
     - **Adventure**: Adventure map mode where world blocks cannot be destroyed or placed by hand without corresponding tools, but interactive items (doors, chests, levers, portals) work.
     - **Hardcore**: Hard survival with heart icons showing hardcore markings, exactly 1 life. On death, respawn is disabled and replaced with **"Spectate World"**.
   - Players can choose their world seed and start immediately.

3. **Multiplayer Playing with Friends Flow**:
   - Host clicks **"Host Online World"**; a clean 6-character room code and 1-click invite link are generated.
   - Friends enter the code or click the invite link to connect directly.
   - Each player's 3D avatar renders their customized dressing-room skin, nametag, current held item, and movement.
   - Chat and player list show connected friends.

4. **In-Game Mode Switcher & Pause Menu Flow**:
   - Pressing `Esc` or clicking the menu button opens the pause screen with an interactive **Game Mode Selector** (`Survival`, `Creative`, `Adventure`, `Hardcore`), world settings, and return to game.

#### Visual Identity & Theme
- **Aesthetic Direction**: Authentic voxel survival aesthetic with Minecraft-inspired tactile slate UI, stone-beveled borders, pixelated accents, and crisp typography (`Press Start 2P` for titles, `VT323` and clean tabular monospace for HUD and labels).
- **Color Palette & Mood**:
  - Dominant Neutral Canvas: Deep obsidian stone (`#141414`), charcoal slate (`#242424`), and warm silver (`#c6c6c6`).
  - Structural Surfaces: Classic beveled Minecraft button gradients (`#7d7d7d` with `#b4b4b4` top/left highlight and `#4f4f4f` bottom/right shadow).
  - Accent Colors: Minecraft emerald green (`#5fa02f`) for primary actions, gold (`#ffd54a`) for selected items/modes, and nether crimson (`#b02bd6` / `#c0392b`) for Hardcore alerts and boss states.
- **Dressing Room UI**:
  - Split viewport: Left side features an interactive Three.js 3D character turntable (drag to spin, zoom to inspect details).
  - Right side features a clean tabbed wardrobe panel: **Base & Skin**, **Hair & Face**, **Tops & Jackets**, **Bottoms**, **Footwear**, **Headwear & Hats**, **Capes & Wings**, and **Color Tint Wheel**.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Client & Cloud Profile Dual-Layer Architecture**
  - *Chosen Approach*: Implement Firebase Auth + Firestore profile document synchronization paired with automatic local `localStorage` caching.
  - *Why*: Allows instant offline / zero-friction play for casual users while preserving full cloud sync for registered accounts so custom outfits and achievements persist anywhere.
- **Decision 2: 3D Layered Canvas Skin Renderer vs Static Textures**
  - *Chosen Approach*: Dynamic canvas-composited 64x64 texture atlas generator combined with optional 3D accessory meshes (hats, capes, 3D armor layers) on the player model.
  - *Why*: Enables unlimited color customization, hair styles, and modular outfit combinations rendered smoothly on Three.js geometry without requiring external image hosting.
- **Decision 3: Complete 4 Game Modes Logic Engine**
  - *Chosen Approach*: Centralized `gameMode` state machine (`'survival' | 'creative' | 'adventure' | 'hardcore'`) governing player capabilities:
    - *Creative*: `canFly = true`, `isFlying`, `infiniteReach`, `instantBreak`, `invulnerable = true`, creative inventory popup.
    - *Adventure*: `canBreakWithoutTool = false`, `canPlace = false` (unless builder permissions enabled).
    - *Hardcore*: `difficulty = 'hard'`, `lives = 1`, permadeath triggers spectator camera with no collision and fly-through-world mode.
  - *Why*: Provides exact parity with the user's detailed specification for each game mode.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Minecraft Client (Browser)                      │
│                                                                        │
│  ┌───────────────────────┐  ┌────────────────────────────────────────┐ │
│  │   3D Engine (Three)   │  │              UI & Modals               │ │
│  │  - World & Voxel Mesh │  │  - Main Menu & Mode Selector (4 Modes) │ │
│  │  - Dynamic Weather/Sky│  │  - 3D Dressing Room & Wardrobe         │ │
│  │  - 3D Player Avatar   │  │  - Sign Up / Login / Guest Modal       │ │
│  │  - Remote Peer Models │  │  - Creative Item Picker & HUD          │ │
│  │  - Flight Controller  │  │  - Hardcore Spectator Screen           │ │
│  └───────────┬───────────┘  └───────────────────┬────────────────────┘ │
│              │                                  │                      │
│  ┌───────────┴──────────────────────────────────┴────────────────────┐ │
│  │                       Game Core State Machine                     │ │
│  │  - Mode Rules: Survival | Creative | Adventure | Hardcore         │ │
│  │  - Inventory & Creative Palette Store                             │ │
│  │  - Player Skin & Outfit State Store                               │ │
│  └───────────┬──────────────────────────────────┬────────────────────┘ │
│              │                                  │                      │
│  ┌───────────┴──────────┐            ┌──────────┴────────────────────┐ │
│  │ Multiplayer (PeerJS) │            │     Firebase & Local Store    │ │
│  │ - P2P Mesh Sync      │            │ - User Auth (Sign up / Login) │ │
│  │ - Skin & Outfit Data │            │ - Cloud Skin & World Storage  │ │
│  │ - Block Edit Events  │            │ - Offline Local Fallback      │ │
│  └──────────────────────┘            └───────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

#### Core Data Models
- **`UserProfile`**:
  ```typescript
  interface UserProfile {
    uid: string;
    username: string;
    email?: string;
    skin: {
      model: 'steve' | 'alex';
      skinTone: string;
      hairStyle: number;
      hairColor: string;
      topStyle: number;
      topColor: string;
      pantsStyle: number;
      pantsColor: string;
      shoesStyle: number;
      shoesColor: string;
      hatStyle: number;
      capeStyle: number;
      eyeColor: string;
    };
    stats: {
      blocksMined: number;
      mobsDefeated: number;
      dragonsSlain: number;
    };
  }
  ```
- **`GameModeConfig`**:
  ```typescript
  interface GameModeConfig {
    mode: 'survival' | 'creative' | 'adventure' | 'hardcore';
    canFly: boolean;
    flying: boolean;
    invincible: boolean;
    instantBreak: boolean;
    consumeItems: boolean;
    hungerDrain: boolean;
    blockBreakAllowed: boolean;
    blockPlaceAllowed: boolean;
    permadeath: boolean;
  }
  ```

#### Component & State Transitions
- **Dressing Room Live Preview**: Updating any hair, shirt, pants, hat, or color in the UI re-bakes the player's 64x64 canvas texture and material layers in under 16ms, immediately rendering on the preview avatar and player hands.
- **Flight & Creative Controls**: Double-pressing `Space` within 300ms toggles flight mode on/off. When flying, `Space` ascends and `Shift` descends without vertical gravity.
- **Creative Inventory**: Pressing `E` in Creative mode displays the full creative catalog containing every single block and item with unlimited stacks.
- **Adventure Protection**: Raycast block targeting checks `gameMode === 'adventure'`; left clicks trigger shake/click sounds with a warning toast unless holding a valid mining tool.
- **Hardcore Death**: When health hits 0 in Hardcore mode, the death screen displays `"Game Over - Your journey has ended"` with the `"Spectate World"` button, transitioning player collision to noclip flight mode.
- **Multiplayer Skin Synchronization**: Peer connection handshake broadcasts the local player's skin configuration so remote players render the exact customized skin and cape.
