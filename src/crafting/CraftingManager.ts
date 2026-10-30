import audioManager from "../audio/AudioManager";
import { BlockID } from "../Block";
import { Player } from "../Player";

export interface Recipe {
  id: string;
  name: string;
  count: number;
  ingredients: string;
  blockId: BlockID;
  icon: string;
}

export const RECIPES: Recipe[] = [
  {
    id: "wood_planks",
    name: "Wood Planks x4",
    count: 4,
    ingredients: "1 Wood Log",
    blockId: BlockID.OakLog,
    icon: "/textures/oak_log_side.png",
  },
  {
    id: "crafting_table",
    name: "Crafting Table",
    count: 1,
    ingredients: "4 Wood Planks",
    blockId: BlockID.OakLog,
    icon: "/textures/oak_log_top.png",
  },
  {
    id: "stick",
    name: "Stick x4",
    count: 4,
    ingredients: "2 Wood Planks",
    blockId: BlockID.OakLog,
    icon: "/textures/oak_log_side.png",
  },
  {
    id: "torch",
    name: "Torch x4",
    count: 4,
    ingredients: "1 Coal + 1 Stick",
    blockId: BlockID.RedstoneLamp,
    icon: "/textures/redstone_lamp.png",
  },
  {
    id: "soul_torch",
    name: "Soul Torch x4",
    count: 4,
    ingredients: "1 Soul Sand + 1 Stick + 1 Coal",
    blockId: BlockID.RedstoneLamp,
    icon: "/textures/redstone_lamp.png",
  },
  {
    id: "chest",
    name: "Chest",
    count: 1,
    ingredients: "8 Wood Planks",
    blockId: BlockID.OakLog,
    icon: "/textures/oak_log_side.png",
  },
  {
    id: "furnace",
    name: "Furnace",
    count: 1,
    ingredients: "8 Stone",
    blockId: BlockID.Stone,
    icon: "/textures/stone.png",
  },
  {
    id: "blast_furnace",
    name: "Blast Furnace",
    count: 1,
    ingredients: "1 Furnace + 5 Iron Ingot + 3 Stone",
    blockId: BlockID.StoneBrick,
    icon: "/textures/stonebrick.png",
  },
  {
    id: "smoker",
    name: "Smoker",
    count: 1,
    ingredients: "1 Furnace + 4 Wood Log",
    blockId: BlockID.StoneBrick,
    icon: "/textures/stonebrick.png",
  },
  {
    id: "campfire",
    name: "Campfire",
    count: 1,
    ingredients: "3 Stick + 1 Coal + 3 Wood Log",
    blockId: BlockID.RedstoneLamp,
    icon: "/textures/redstone_lamp.png",
  },
  {
    id: "stone_brick",
    name: "Stone Brick x4",
    count: 4,
    ingredients: "4 Stone",
    blockId: BlockID.StoneBrick,
    icon: "/textures/stonebrick.png",
  },
  {
    id: "sandstone",
    name: "Sandstone x4",
    count: 4,
    ingredients: "4 Sand",
    blockId: BlockID.Sandstone,
    icon: "/textures/sandstone_side.png",
  },
  {
    id: "redstone_lamp",
    name: "Redstone Lamp",
    count: 1,
    ingredients: "1 Redstone + 4 Glowstone",
    blockId: BlockID.RedstoneLamp,
    icon: "/textures/redstone_lamp.png",
  },
  {
    id: "gold_block",
    name: "Gold Ore Ingot",
    count: 1,
    ingredients: "1 Gold Ore + 1 Coal",
    blockId: BlockID.GoldOre,
    icon: "/textures/gold_ore.png",
  },
  {
    id: "diamond_block",
    name: "Diamond Ore",
    count: 1,
    ingredients: "1 Diamond Ingot",
    blockId: BlockID.DiamondOre,
    icon: "/textures/diamond_ore.png",
  },
];

export class CraftingManager {
  private player: Player;
  private container: HTMLElement | null = null;
  private searchFilter = "";
  private isVisible = false;

  constructor(player: Player) {
    this.player = player;
    this.initUI();
  }

  private initUI() {
    this.container = document.getElementById("crafting-modal");
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.id = "crafting-modal";
      this.container.innerHTML = `
        <div class="crafting-window">
          <div class="crafting-header">
            <h2>Crafting</h2>
            <button id="crafting-close" class="close-x">&times;</button>
          </div>
          <div class="crafting-search-wrap">
            <input type="text" id="crafting-search" placeholder="Search crafting recipes..." autocomplete="off" />
          </div>
          <div id="crafting-list" class="crafting-list"></div>
        </div>
      `;
      document.body.appendChild(this.container);

      document.getElementById("crafting-close")?.addEventListener("click", () => {
        this.hide();
      });

      const searchInput = document.getElementById("crafting-search") as HTMLInputElement;
      searchInput?.addEventListener("input", (e) => {
        this.searchFilter = (e.target as HTMLInputElement).value.toLowerCase();
        this.renderRecipes();
      });
    }

    this.renderRecipes();
  }

  toggle() {
    if (this.isVisible) this.hide();
    else this.show();
  }

  show() {
    this.isVisible = true;
    if (this.container) this.container.style.display = "flex";
    const input = document.getElementById("crafting-search") as HTMLInputElement;
    if (input) {
      input.value = "";
      this.searchFilter = "";
      input.focus();
    }
    this.renderRecipes();
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }

  hide() {
    this.isVisible = false;
    if (this.container) this.container.style.display = "none";
  }

  private renderRecipes() {
    const listEl = document.getElementById("crafting-list");
    if (!listEl) return;

    const filtered = RECIPES.filter((r) =>
      r.name.toLowerCase().includes(this.searchFilter) ||
      r.ingredients.toLowerCase().includes(this.searchFilter)
    );

    if (filtered.length === 0) {
      listEl.innerHTML = `<div class="craft-empty">No recipes found matching "${this.searchFilter}"</div>`;
      return;
    }

    listEl.innerHTML = filtered
      .map(
        (r) => `
        <div class="craft-card" data-id="${r.id}">
          <div class="craft-icon">
            <img src="${r.icon}" alt="${r.name}" onerror="this.src='/textures/stone.png'" />
          </div>
          <div class="craft-details">
            <div class="craft-title">${r.name}</div>
            <div class="craft-ingr">${r.ingredients}</div>
          </div>
          <button class="craft-btn" onclick="window.craftItem('${r.id}')">Craft</button>
        </div>
      `
      )
      .join("");
  }

  craft(recipeId: string) {
    const recipe = RECIPES.find((r) => r.id === recipeId);
    if (!recipe) return;

    // Equip or put in hotbar
    const hotbar = this.player.hotbar;
    hotbar.set(this.player.hotbar.selected, recipe.blockId);
    this.player.onHotbarChange();

    audioManager.play("ui.button.click");

    const toast = document.createElement("div");
    toast.className = "mc-toast";
    toast.textContent = `Crafted ${recipe.name}! Added to hotbar.`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2200);
  }
}
