/* eslint-disable @typescript-eslint/no-explicit-any */
import productsData from '../../database/products.json';
import shelvesData from '../../database/shelves.json';
import { parseUnityFloat } from './helpers';

export interface Employee {
  type: number;
  salary: number;
  baseStats: number[]; // 7 stats
  name: string;
  assigned: number;
  xpStats: number[]; // 7 stats
}

export interface SaveDataFields {
  StoreName: string;
  SupermarketName: string;
  Funds: number;
  Day: number;
  FranchiseExperience: number;
  FranchisePoints: number;
  SpaceBought: number;
  StorageBought: number;
  Difficulty: number;
  UnlockedTiers: boolean[];
  Employees: Employee[];
  ManufacUnlockedRecipes: boolean[];
}

export interface ShelfProductSlot {
  productId: number;
  quantity: number;
}

export interface ShelfData {
  keyIndex: number; // The X in propdataX / propinfoproductX
  x: number;
  z: number;
  isBackroom: boolean;
  slots: ShelfProductSlot[];
  type: number;
  subType: number;
}

/**
 * Extracts the editable fields from the parsed JSON save structure.
 */
export function extractSaveFields(json: any): SaveDataFields {
  const getVal = (key: string, defaultVal: any) => {
    return json[key] && json[key].value !== undefined ? json[key].value : defaultVal;
  };

  // Extract unlocked tiers
  let UnlockedTiers: boolean[] = [];
  if (
    json.UnlockedProductTiers &&
    json.UnlockedProductTiers.value &&
    Array.isArray(json.UnlockedProductTiers.value.array)
  ) {
    UnlockedTiers = json.UnlockedProductTiers.value.array.map((item: any) => !!item.value);
  }

  // Extract manufacturing recipes
  let ManufacUnlockedRecipes: boolean[] = [];
  if (
    json.ManufacUnlockedRecipes &&
    json.ManufacUnlockedRecipes.value &&
    Array.isArray(json.ManufacUnlockedRecipes.value.array)
  ) {
    ManufacUnlockedRecipes = json.ManufacUnlockedRecipes.value.array.map((item: any) => !!item.value);
  }

  // Extract hired employees
  const Employees: Employee[] = [];
  if (
    json.HiredEmployeesData &&
    json.HiredEmployeesData.value &&
    Array.isArray(json.HiredEmployeesData.value.array)
  ) {
    json.HiredEmployeesData.value.array.forEach((item: any) => {
      if (item && typeof item.value === 'string') {
        const parts = item.value.split('|');
        if (parts.length >= 11) {
          const type = parseInt(parts[0], 10) || 0;
          const salary = parseInt(parts[1], 10) || 0;
          const baseStats = parts.slice(2, 9).map((x: string) => parseInt(x, 10) || 0);
          const name = parts[9] || '';
          const assigned = parseInt(parts[10], 10) || 0;
          const xpStats = parts.slice(11).map((x: string) => parseInt(x, 10) || 0);

          Employees.push({
            type,
            salary,
            baseStats,
            name,
            assigned,
            xpStats,
          });
        }
      }
    });
  }

  return {
    StoreName: getVal('StoreName', ''),
    SupermarketName: getVal('SupermarketName', ''),
    Funds: getVal('Funds', 0),
    Day: getVal('Day', 1),
    FranchiseExperience: getVal('FranchiseExperience', 0),
    FranchisePoints: getVal('FranchisePoints', 0),
    SpaceBought: getVal('SpaceBought', 0),
    StorageBought: getVal('StorageBought', 0),
    Difficulty: getVal('Difficulty', 1),
    UnlockedTiers,
    Employees,
    ManufacUnlockedRecipes,
  };
}

/**
 * Updates the parsed JSON save structure with the edited fields.
 */
export function updateSaveFields(json: any, fields: SaveDataFields): void {
  const setVal = (key: string, val: any, type: string) => {
    if (!json[key]) {
      json[key] = { __type: type };
    }
    json[key].value = val;
  };

  setVal('StoreName', fields.StoreName, 'string');
  setVal('SupermarketName', fields.SupermarketName, 'string');
  setVal('Funds', fields.Funds, 'float');
  setVal('Day', fields.Day, 'int');
  setVal('FranchiseExperience', fields.FranchiseExperience, 'int');
  setVal('FranchisePoints', fields.FranchisePoints, 'int');
  setVal('SpaceBought', fields.SpaceBought, 'int');
  setVal('StorageBought', fields.StorageBought, 'int');
  setVal('Difficulty', fields.Difficulty, 'int');

  // Update unlocked tiers
  if (json.UnlockedProductTiers && json.UnlockedProductTiers.value) {
    if (!json.UnlockedProductTiers.value.array) {
      json.UnlockedProductTiers.value.array = [];
    }
    json.UnlockedProductTiers.value.array = fields.UnlockedTiers.map((val) => ({
      __type: 'bool',
      value: val,
    }));
  }

  // Update hired employees
  if (json.HiredEmployeesData && json.HiredEmployeesData.value) {
    json.HiredEmployeesData.value.array = fields.Employees.map((emp) => {
      const parts = [
        emp.type,
        emp.salary,
        ...emp.baseStats,
        emp.name,
        emp.assigned,
        ...emp.xpStats,
      ];
      return {
        __type: 'string',
        value: parts.join('|'),
      };
    });
  }

  // Update manufacturing recipes
  if (json.ManufacUnlockedRecipes && json.ManufacUnlockedRecipes.value) {
    if (!json.ManufacUnlockedRecipes.value.array) {
      json.ManufacUnlockedRecipes.value.array = [];
    }
    json.ManufacUnlockedRecipes.value.array = fields.ManufacUnlockedRecipes.map((val) => ({
      __type: 'bool',
      value: val,
    }));
  }
}

/**
 * Parses all shelf placements and product contents.
 */
export function parseShelves(json: any): ShelfData[] {
  const shelves: ShelfData[] = [];
  const keys = Object.keys(json);

  keys.forEach((key) => {
    const match = key.match(/^propdata(\d+)$/);
    if (match) {
      const idx = parseInt(match[1], 10);
      const propInfoKey = `propinfoproduct${idx}`;

      const propData = json[key];
      const propInfo = json[propInfoKey];

      if (propData && propData.value && propInfo && Array.isArray(propInfo.value)) {
        // Parse coordinates from value like: "0|1|8,445212|0|15,96098|180"
        const parts = propData.value.split('|');
        if (parts.length >= 5) {
          const type = parseInt(parts[0], 10) || 0;
          const subType = parseInt(parts[1], 10) || 0;
          const x = parseUnityFloat(parts[2]);
          const z = parseUnityFloat(parts[4]);
          const isBackroom = type === 1;

          // Parse slots
          const slots: ShelfProductSlot[] = [];
          const productArray = propInfo.value;
          for (let i = 0; i < productArray.length; i += 2) {
            slots.push({
              productId: productArray[i] ?? -1,
              quantity: productArray[i + 1] ?? 0,
            });
          }

          shelves.push({
            keyIndex: idx,
            x,
            z,
            isBackroom,
            slots,
            type,
            subType,
          });
        }
      }
    }
  });

  // Deduplicate overlapping shelves of the same room placement within 0.5m distance
  const uniqueShelves: ShelfData[] = [];
  shelves.forEach((shelf) => {
    const isDuplicate = uniqueShelves.some((ushelf) => {
      if (shelf.isBackroom !== ushelf.isBackroom) return false;
      const dx = shelf.x - ushelf.x;
      const dz = shelf.z - ushelf.z;
      return (dx * dx + dz * dz) < 0.25; // 0.5m threshold (0.5^2 = 0.25)
    });

    if (!isDuplicate) {
      uniqueShelves.push(shelf);
    }
  });

  return uniqueShelves;
}

/**
 * Computes backroom vs display metrics.
 * - Backroom products: present in a backroom shelf (X < -10) with qty > 0.
 * - Displayed products: present in a main store shelf (X >= -10) with qty > 0.
 * Returns products that are in the backroom but NOT displayed in the store.
 */
export function getRestockAlerts(shelves: ShelfData[]): { productId: number; quantity: number }[] {
  const backroomCounts = new Map<number, number>();
  const displayCounts = new Map<number, number>();

  shelves.forEach((shelf) => {
    shelf.slots.forEach((slot) => {
      if (slot.productId !== -1) {
        if (shelf.isBackroom) {
          const qty = slot.quantity >= 0 ? slot.quantity : 0;
          backroomCounts.set(slot.productId, (backroomCounts.get(slot.productId) || 0) + qty);
        } else {
          displayCounts.set(slot.productId, (displayCounts.get(slot.productId) || 0) + 1);
        }
      }
    });
  });

  const alerts: { productId: number; quantity: number }[] = [];
  backroomCounts.forEach((qty, prodId) => {
    // If it has 0 slots/quantity on display in the store
    if (!displayCounts.has(prodId)) {
      alerts.push({ productId: prodId, quantity: qty });
    }
  });

  // Sort by product ID ascending
  alerts.sort((a, b) => a.productId - b.productId);

  return alerts;
}

/**
 * Perform One-Click Restock:
 * Shifter algorithm: shifts items from backroom shelves into empty slots on store shelves.
 * Ensures that if a shifted product was previously undisplayed, it gets placed with AT LEAST 5 units.
 * Returns the count of items shifted.
 */
export function executeRestock(json: any, shelves: ShelfData[]): number {
  // Find all store shelves and their empty slots
  const storeShelves = shelves.filter((s) => !s.isBackroom);
  const backroomShelves = shelves.filter((s) => s.isBackroom);

  let shiftCount = 0;

  // Build a set of all product IDs currently displayed on store shelves (qty > 0)
  const displayedProductIds = new Set<number>();
  storeShelves.forEach((shelf) => {
    shelf.slots.forEach((slot) => {
      if (slot.productId !== -1 && slot.quantity > 0) {
        displayedProductIds.add(slot.productId);
      }
    });
  });

  // Dynamic Compatibility mapping based on existing storefront placements in the save file
  const dynamicCompatibility = new Map<number, Set<number>>();
  storeShelves.forEach((shelf) => {
    shelf.slots.forEach((slot) => {
      if (slot.productId !== -1) {
        if (!dynamicCompatibility.has(slot.productId)) {
          dynamicCompatibility.set(slot.productId, new Set<number>());
        }
        dynamicCompatibility.get(slot.productId)!.add(shelf.subType);
      }
    });
  });

  const isProductCompatible = (productId: number, subType: number): boolean => {
    // Storage Racks (subtype 5 and 10) are universal shelving
    if (subType === 5 || subType === 10) return true;

    // Check dynamic compatibility from current save storefront placements
    const allowedSubtypes = dynamicCompatibility.get(productId);
    if (allowedSubtypes && allowedSubtypes.has(subType)) {
      return true;
    }

    // Lookup compatibility from database
    const product = (productsData as Record<string, any>)[productId.toString()];
    const shelf = (shelvesData as Record<string, any>)[subType.toString()];

    if (product && shelf) {
      // Return true if container classes match
      return product.containerClass === shelf.containerClass;
    }

    // Default fallback to basic shelf if metadata not found
    return subType === 1;
  };

  // Find all backroom slots with products
  const backroomProducts: { shelfIdx: number; slotIdx: number; productId: number; quantity: number }[] = [];
  backroomShelves.forEach((shelf) => {
    shelf.slots.forEach((slot, slotIdx) => {
      if (slot.productId !== -1 && slot.quantity > 0) {
        backroomProducts.push({
          shelfIdx: shelf.keyIndex,
          slotIdx,
          productId: slot.productId,
          quantity: slot.quantity,
        });
      }
    });
  });

  // Find all empty slots on store shelves with their shelf index, slot index, and shelf subtype
  interface EmptyStoreSlot {
    shelfIdx: number;
    slotIdx: number;
    subType: number;
  }

  const emptyStoreSlots: EmptyStoreSlot[] = [];
  storeShelves.forEach((shelf) => {
    shelf.slots.forEach((slot, slotIdx) => {
      if (slot.productId === -1 || slot.quantity <= 0) {
        emptyStoreSlots.push({ 
          shelfIdx: shelf.keyIndex, 
          slotIdx,
          subType: shelf.subType
        });
      }
    });
  });

  // Track assigned empty slots to prevent double allocation
  const assignedSlots = new Set<string>();

  // Process shifts
  backroomProducts.forEach((source) => {
    // Only shift products that are NOT already displayed on the storefront display shelves
    if (displayedProductIds.has(source.productId)) {
      return;
    }

    // Find all compatible, unassigned target slots
    const compatibleTargets = emptyStoreSlots.filter((target) => {
      const slotKey = `${target.shelfIdx}-${target.slotIdx}`;
      if (assignedSlots.has(slotKey)) return false;
      return isProductCompatible(source.productId, target.subType);
    });

    if (compatibleTargets.length === 0) return;

    // Score compatible targets
    // Priority 1: Target shelf already contains source.productId in another slot (consolidate).
    // Priority 2: Target shelf is completely empty (no products assigned at all).
    // Priority 3: Target shelf has other products.
    const scoredTargets = compatibleTargets.map((target) => {
      const targetShelf = storeShelves.find((s) => s.keyIndex === target.shelfIdx);
      let score = 1; // Default low priority

      if (targetShelf) {
        const hasSameProduct = targetShelf.slots.some(
          (slot) => slot.productId === source.productId && slot.quantity > 0
        );
        const isCompletelyEmpty = targetShelf.slots.every(
          (slot) => slot.productId === -1 || slot.quantity <= 0
        );

        if (hasSameProduct) {
          score = 10;
        } else if (isCompletelyEmpty) {
          score = 5;
        }
      }

      return { target, score };
    });

    // Sort by score descending
    scoredTargets.sort((a, b) => b.score - a.score);

    // Pick the best target
    const bestTarget = scoredTargets[0].target;
    const slotKey = `${bestTarget.shelfIdx}-${bestTarget.slotIdx}`;
    assignedSlots.add(slotKey);

    // Perform the actual JSON write
    const sourceArrayKey = `propinfoproduct${source.shelfIdx}`;
    const targetArrayKey = `propinfoproduct${bestTarget.shelfIdx}`;

    const sourceArray = json[sourceArrayKey]?.value;
    const targetArray = json[targetArrayKey]?.value;

    if (sourceArray && targetArray) {
      const targetQuantity = Math.max(1, source.quantity);

      // Set target slot to source product
      targetArray[bestTarget.slotIdx * 2] = source.productId;
      targetArray[bestTarget.slotIdx * 2 + 1] = targetQuantity;

      // Clear source slot
      sourceArray[source.slotIdx * 2] = 0;
      sourceArray[source.slotIdx * 2 + 1] = 0;

      // Update local shelf state representation
      const sShelf = shelves.find((s) => s.keyIndex === bestTarget.shelfIdx);
      if (sShelf) {
        sShelf.slots[bestTarget.slotIdx] = { productId: source.productId, quantity: targetQuantity };
      }

      const bShelf = shelves.find((s) => s.keyIndex === source.shelfIdx);
      if (bShelf) {
        bShelf.slots[source.slotIdx] = { productId: 0, quantity: 0 };
      }

      displayedProductIds.add(source.productId);
      shiftCount++;
    }
  });

  return shiftCount;
}
