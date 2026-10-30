import { BlockID } from "../Block";
import { World } from "../World";

export const PALACE_CENTER = { x: 0, y: 36, z: 0 };

/**
 * Procedurally constructs the 3-floor Grand Mountain Fortress and Palace
 * with a high arch bridge, throne hall, art gallery, library, penthouse suite,
 * and royal treasury vault.
 */
export function buildBilalRoyalPalace(
  world: World,
  ox: number = PALACE_CENTER.x,
  oy: number = PALACE_CENTER.y,
  oz: number = PALACE_CENTER.z
) {
  const setB = (x: number, y: number, z: number, id: BlockID) => {
    world.setBlock(x, y, z, id);
  };

  // 1. Level foundation & clear interior volume (3-floor palace volume)
  for (let x = ox - 26; x <= ox + 26; x++) {
    for (let z = oz - 32; z <= oz + 30; z++) {
      // Clear air above floor up to y = oy + 36
      for (let y = oy + 1; y <= oy + 36; y++) {
        setB(x, y, z, BlockID.Air);
      }
      // Solid foundation below
      for (let y = Math.max(1, oy - 6); y < oy; y++) {
        const cur = world.getBlock(x, y, z);
        if (cur === undefined || cur === BlockID.Air || cur === BlockID.Water) {
          setB(x, y, z, BlockID.Stone);
        }
      }
      // Ground level floor (y = oy)
      const isInterior = Math.abs(x - ox) <= 20 && z >= oz - 18 && z <= oz + 26;
      const floorBlock = isInterior
        ? (x + z) % 2 === 0
          ? BlockID.Sandstone
          : BlockID.StoneBrick
        : (x + z) % 4 === 0
        ? BlockID.Sandstone
        : BlockID.Stone;
      setB(x, oy, z, floorBlock);
    }
  }

  // 2. Courtyard Reflecting Pools & Fountains
  for (let x = ox - 18; x <= ox - 8; x++) {
    for (let z = oz - 30; z <= oz - 22; z++) {
      const isBorder = x === ox - 18 || x === ox - 8 || z === oz - 30 || z === oz - 22;
      if (isBorder) {
        setB(x, oy + 1, z, BlockID.StoneBrick);
      } else {
        setB(x, oy - 1, z, BlockID.RedstoneLamp);
        setB(x, oy, z, BlockID.Water);
      }
    }
  }
  setB(ox - 13, oy + 1, oz - 26, BlockID.StoneBrick);
  setB(ox - 13, oy + 2, oz - 26, BlockID.RedstoneLamp);

  // Right Pool
  for (let x = ox + 8; x <= ox + 18; x++) {
    for (let z = oz - 30; z <= oz - 22; z++) {
      const isBorder = x === ox + 8 || x === ox + 18 || z === oz - 30 || z === oz - 22;
      if (isBorder) {
        setB(x, oy + 1, z, BlockID.StoneBrick);
      } else {
        setB(x, oy - 1, z, BlockID.RedstoneLamp);
        setB(x, oy, z, BlockID.Water);
      }
    }
  }
  setB(ox + 13, oy + 1, oz - 26, BlockID.StoneBrick);
  setB(ox + 13, oy + 2, oz - 26, BlockID.RedstoneLamp);

  // 3. Royal Gardens (flowerbeds and hedges flanking path)
  for (let z = oz - 31; z <= oz - 20; z++) {
    setB(ox - 5, oy + 1, z, BlockID.Leaves);
    setB(ox - 6, oy + 1, z, z % 2 === 0 ? BlockID.FlowerRose : BlockID.FlowerDandelion);
    setB(ox + 5, oy + 1, z, BlockID.Leaves);
    setB(ox + 6, oy + 1, z, z % 2 === 0 ? BlockID.FlowerDandelion : BlockID.FlowerRose);
  }

  // 4. FLOOR 1: Outer Castle Walls (Height 8 blocks, y: oy+1 to oy+8)
  for (let y = oy + 1; y <= oy + 8; y++) {
    for (let x = ox - 20; x <= ox + 20; x++) {
      const isArch = Math.abs(x - ox) <= 3 && y <= oy + 6;
      if (!isArch) {
        const b = y === oy + 1 || y === oy + 8 ? BlockID.StoneBrick : y === oy + 5 ? BlockID.GoldOre : BlockID.Sandstone;
        setB(x, y, oz - 18, b);
      }
      const bb = y === oy + 1 || y === oy + 8 ? BlockID.StoneBrick : y === oy + 5 ? BlockID.GoldOre : BlockID.Sandstone;
      setB(x, y, oz + 26, bb);
    }
    for (let z = oz - 18; z <= oz + 26; z++) {
      const b = y === oy + 1 || y === oy + 8 ? BlockID.StoneBrick : y === oy + 5 ? BlockID.GoldOre : BlockID.Sandstone;
      setB(ox - 20, y, z, b);
      setB(ox + 20, y, z, b);
    }
  }

  // 5. Four Giant Corner Fortress Bastions (Height 26 blocks, y: oy+1 to oy+26)
  const towerCorners = [
    [ox - 23, oz - 22],
    [ox + 18, oz - 22],
    [ox - 23, oz + 21],
    [ox + 18, oz + 21],
  ];
  for (const tc of towerCorners) {
    const tx = tc[0], tz = tc[1];
    for (let y = oy + 1; y <= oy + 26; y++) {
      for (let dx = 0; dx <= 5; dx++) {
        for (let dz = 0; dz <= 5; dz++) {
          const isEdge = dx === 0 || dx === 5 || dz === 0 || dz === 5;
          if (isEdge) {
            const tb = y % 6 === 0 ? BlockID.GoldOre : y <= oy + 2 ? BlockID.StoneBrick : BlockID.Sandstone;
            setB(tx + dx, y, tz + dz, tb);
          } else if (y === oy + 9 || y === oy + 18 || y === oy + 25) {
            setB(tx + dx, y, tz + dz, BlockID.Stone);
          }
        }
      }
    }
    // Battlements atop bastions
    for (let dx = 0; dx <= 5; dx++) {
      for (let dz = 0; dz <= 5; dz++) {
        const isCorner = (dx === 0 || dx === 5) && (dz === 0 || dz === 5);
        if (isCorner) {
          setB(tx + dx, oy + 26, tz + dz, BlockID.RedstoneLamp);
        } else if ((dx === 0 || dx === 5 || dz === 0 || dz === 5) && (dx % 2 === 1 || dz % 2 === 1)) {
          setB(tx + dx, oy + 26, tz + dz, BlockID.StoneBrick);
        }
      }
    }
  }

  // 6. Colonnade Pillars & Vaulted Ceiling in Great Hall
  for (let z = oz - 14; z <= oz + 16; z += 6) {
    for (let y = oy + 1; y <= oy + 8; y++) {
      setB(ox - 8, y, z, BlockID.Sandstone);
      setB(ox + 8, y, z, BlockID.Sandstone);
    }
    setB(ox - 8, oy + 8, z, BlockID.RedstoneLamp);
    setB(ox + 8, oy + 8, z, BlockID.RedstoneLamp);
  }

  // Grand Hanging Chandeliers
  for (let cz = oz - 8; cz <= oz + 12; cz += 8) {
    setB(ox, oy + 7, cz, BlockID.Stone);
    setB(ox, oy + 6, cz, BlockID.RedstoneLamp);
    setB(ox - 1, oy + 6, cz, BlockID.GoldOre);
    setB(ox + 1, oy + 6, cz, BlockID.GoldOre);
  }

  // 7. Raised Throne Dais & Imperial Throne of Bilal
  for (let x = ox - 6; x <= ox + 6; x++) {
    for (let z = oz + 18; z <= oz + 24; z++) {
      setB(x, oy + 1, z, BlockID.Sandstone);
    }
  }
  for (let x = ox - 4; x <= ox + 4; x++) {
    for (let z = oz + 19; z <= oz + 24; z++) {
      setB(x, oy + 2, z, BlockID.GoldOre);
    }
  }
  for (let x = ox - 2; x <= ox + 2; x++) {
    for (let z = oz + 20; z <= oz + 24; z++) {
      setB(x, oy + 3, z, BlockID.RedstoneLamp);
    }
  }
  setB(ox, oy + 4, oz + 22, BlockID.GoldOre);
  setB(ox, oy + 5, oz + 22, BlockID.GoldOre);
  setB(ox - 1, oy + 4, oz + 22, BlockID.GoldOre);
  setB(ox + 1, oy + 4, oz + 22, BlockID.GoldOre);

  // 8. Grand Twin Sweeping Staircases to Floor 2
  for (let step = 0; step < 8; step++) {
    const sy = oy + 1 + step;
    const sz = oz - 2 + step * 2;
    for (let sx = ox - 16; sx <= ox - 12; sx++) {
      setB(sx, sy, sz, BlockID.StoneBrick);
      setB(sx, sy, sz + 1, BlockID.Sandstone);
    }
    for (let sx = ox + 12; sx <= ox + 16; sx++) {
      setB(sx, sy, sz, BlockID.StoneBrick);
      setB(sx, sy, sz + 1, BlockID.Sandstone);
    }
  }

  // 9. FLOOR 2: Gallery, Library & Bridge Deck (y = oy + 9)
  for (let x = ox - 20; x <= ox + 20; x++) {
    for (let z = oz - 18; z <= oz + 26; z++) {
      const isVoid = Math.abs(x - ox) <= 7 && z >= oz - 12 && z <= oz + 14;
      if (!isVoid) {
        const b = (x + z) % 2 === 0 ? BlockID.OakLog : BlockID.Sandstone;
        setB(x, oy + 9, z, b);
      }
    }
  }

  // Floor 2 Outer Walls (Height 8, y: oy+10 to oy+17)
  for (let y = oy + 10; y <= oy + 17; y++) {
    for (let x = ox - 20; x <= ox + 20; x++) {
      const isBridgeDoor = Math.abs(x - ox) <= 3 && y <= oy + 15;
      if (!isBridgeDoor) {
        setB(x, y, oz - 18, BlockID.StoneBrick);
      }
      setB(x, y, oz + 26, BlockID.StoneBrick);
    }
    for (let z = oz - 18; z <= oz + 26; z++) {
      setB(ox - 20, y, z, BlockID.StoneBrick);
      setB(ox + 20, y, z, BlockID.StoneBrick);
    }
  }

  // 10. HIGH ARCH BRIDGE (Spanning north from Floor 2 across the canyon)
  const bridgeZStart = oz - 18;
  const bridgeZEnd = oz - 48;
  for (let z = bridgeZStart; z >= bridgeZEnd; z--) {
    const t = (oz - 18 - z) / 30;
    const archLift = Math.round(Math.sin(t * Math.PI) * 5);
    const by = oy + 9 + archLift;

    for (let bx = ox - 4; bx <= ox + 4; bx++) {
      const isGuard = Math.abs(bx - ox) === 4;
      if (isGuard) {
        setB(bx, by + 1, z, BlockID.StoneBrick);
        if (z % 5 === 0) setB(bx, by + 2, z, BlockID.RedstoneLamp);
      } else {
        const deckMat = (bx + z) % 2 === 0 ? BlockID.Sandstone : BlockID.StoneBrick;
        setB(bx, by, z, deckMat);
      }
    }
  }

  // 11. FLOOR 3: Emperor's Penthouse Suite (y = oy + 18 to oy + 28)
  for (let x = ox - 14; x <= ox + 14; x++) {
    for (let z = oz - 10; z <= oz + 22; z++) {
      setB(x, oy + 18, z, BlockID.Sandstone);
    }
  }
  for (let y = oy + 19; y <= oy + 27; y++) {
    for (let x = ox - 14; x <= ox + 14; x++) {
      setB(x, y, oz - 10, BlockID.StoneBrick);
      setB(x, y, oz + 22, BlockID.StoneBrick);
    }
    for (let z = oz - 10; z <= oz + 22; z++) {
      setB(ox - 14, y, z, BlockID.StoneBrick);
      setB(ox + 14, y, z, BlockID.StoneBrick);
    }
  }

  // King-Size Canopy Bed
  for (let bx = ox - 2; bx <= ox + 2; bx++) {
    for (let bz = oz + 16; bz <= oz + 20; bz++) {
      setB(bx, oy + 19, bz, BlockID.Sandstone);
    }
  }
  setB(ox - 2, oy + 20, oz + 16, BlockID.OakLog);
  setB(ox + 2, oy + 20, oz + 16, BlockID.OakLog);
  setB(ox - 2, oy + 20, oz + 20, BlockID.OakLog);
  setB(ox + 2, oy + 20, oz + 20, BlockID.OakLog);

  // Cozy Fireplace & Chimney
  for (let cy = oy + 19; cy <= oy + 32; cy++) {
    for (let cx = ox - 11; cx <= ox - 9; cx++) {
      for (let cz = oz - 3; cz <= oz - 1; cz++) {
        setB(cx, cy, cz, BlockID.StoneBrick);
      }
    }
  }
  setB(ox - 10, oy + 19, oz - 2, BlockID.RedstoneLamp);

  // Royal Treasury Vault (Gold & Diamond reserves)
  for (let tx = ox + 6; tx <= ox + 12; tx++) {
    for (let tz = oz + 12; tz <= oz + 18; tz++) {
      setB(tx, oy + 19, tz, (tx + tz) % 2 === 0 ? BlockID.GoldOre : BlockID.DiamondOre);
    }
  }
}

/** Check if world coordinate is inside the palace domain */
export function isInsidePalace(x: number, z: number, ox: number = PALACE_CENTER.x, oz: number = PALACE_CENTER.z): boolean {
  return Math.abs(x - ox) <= 32 && Math.abs(z - oz) <= 45;
}
