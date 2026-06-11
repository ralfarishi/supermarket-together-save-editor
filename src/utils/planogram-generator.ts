import productsData from '../../database/products.json';
import shelvesData from '../../database/shelves.json';
import { PRODUCT_LICENSES } from './constants';
import { getGridCoord } from './grid-utils';
import { getSlotPositionName } from './shelf-mappings';
import { getProductSubCategory } from './product-classifier';

const shelvesMap = shelvesData as Record<string, { name: string; slots: number }>;

export interface ShelfProductSlot {
  productId: number;
  quantity: number;
}

export interface ShelfRecommendation {
  keyIndex: number;
  grid: string;
  shelfName: string;
  subType: number;
  slots: {
    slotNumber: number;
    productId: number;
    productName: string;
    brand: string;
    basePrice: number;
    placementLevel: string;
  }[];
}

export interface ShelfGroupRecommendation {
  categoryName: string;
  shelfModel: string;
  rationale: string;
  totalPlaced: number;
  recommendations: ShelfRecommendation[];
  backupProducts: {
    id: number;
    name: string;
    brand: string;
    basePrice: number;
  }[];
}

// Check if a product ID is unlocked based on active license tiers
export function isProductUnlocked(productId: number, unlockedTiers: boolean[]): boolean {
  if (!unlockedTiers || unlockedTiers.length === 0) return true;

  for (let idx = 0; idx < unlockedTiers.length; idx++) {
    if (!unlockedTiers[idx]) continue;
    const license = PRODUCT_LICENSES[idx];
    if (!license || license.unlocks === "???") continue;

    if (license.unlocks.includes("-")) {
      const [start, end] = license.unlocks.split("-").map(Number);
      if (productId >= start && productId <= end) {
        return true;
      }
    }
  }
  return false;
}

interface ProductInfo {
  id: number;
  name: string;
  brand: string;
  basePrice: number;
  subCategory?: string;
}

export function generatePlanogramRecommendations(
  shelves: { keyIndex: number; x: number; z: number; isBackroom: boolean; type: number; subType: number }[],
  unlockedTiers: boolean[]
): ShelfGroupRecommendation[] {
  // 1. Filter storefront shelves (isBackroom === false, which means type === 0 in propdata)
  const activeStoreShelves = shelves.filter(s => !s.isBackroom && s.type === 0);

  // 2. Extract and categorize unlocked products
  const unlockedProducts: Record<number, ProductInfo[]> = {
    0: [], // Ambient
    1: [], // Chilled
    2: [], // Frozen
    3: [], // Fresh
    4: []  // Pegboard
  };

  const productsMap = productsData as Record<string, { name: string; brand?: string; basePrice?: number; containerClass?: number; subCategory?: string }>;

  Object.keys(productsData).forEach(idStr => {
    const id = parseInt(idStr, 10);
    const prod = productsMap[idStr];
    if (isProductUnlocked(id, unlockedTiers)) {
      const cc = prod.containerClass ?? 0;
      if (unlockedProducts[cc] !== undefined) {
        const subCat = getProductSubCategory({
          id,
          name: prod.name,
          containerClass: cc,
          subCategory: prod.subCategory
        });
        unlockedProducts[cc].push({
          id,
          name: prod.name,
          brand: prod.brand || 'Generic',
          basePrice: prod.basePrice ?? 1.0,
          subCategory: subCat
        });
      }
    }
  });

  // Sort products within each class (Ambient sorted by ID; Chilled, Frozen, Fresh, Pegboard sorted by subCategory first, then ID)
  Object.keys(unlockedProducts).forEach(ccKey => {
    const cc = Number(ccKey);
    unlockedProducts[cc].sort((a, b) => {
      if (cc === 0) {
        return a.id - b.id;
      }
      const catA = a.subCategory || '';
      const catB = b.subCategory || '';
      if (catA !== catB) {
        return catA.localeCompare(catB);
      }
      return a.id - b.id;
    });
  });

  // 3. Define the sub-groups for Ambient (Class 0)
  const ambientList = unlockedProducts[0];
  const ambientSubgroups: Record<string, ProductInfo[]> = {
    cleaning: [],
    hygiene: [],
    pharmacy: [],
    premium: [],
    beer: [],
    snacks: [],
    canned: [],
    books: [],
    breakfast: [],
    groceries: []
  };

  ambientList.forEach(p => {
    const subCat = p.subCategory;
    
    if (subCat === 'Cleaning Products') {
      ambientSubgroups.cleaning.push(p);
    } else if (subCat === 'Personal Care & Hygiene') {
      ambientSubgroups.hygiene.push(p);
    } else if (subCat === 'Pharmacy & Health') {
      ambientSubgroups.pharmacy.push(p);
    } else if (subCat === 'Wines & Spirits') {
      ambientSubgroups.premium.push(p);
    } else if (subCat === 'Beer & Cider') {
      ambientSubgroups.beer.push(p);
    } else if (subCat === 'Snacks & Sweets') {
      ambientSubgroups.snacks.push(p);
    } else if (subCat === 'Canned & Preserves' || subCat === 'Pet Care') {
      ambientSubgroups.canned.push(p);
    } else if (subCat === 'Books & Literature') {
      ambientSubgroups.books.push(p);
    } else if (subCat === 'Breakfast & Hot Drinks') {
      ambientSubgroups.breakfast.push(p);
    } else {
      // Grains & Pasta, Baking & Sugar, Condiments & Sauces, Bakery & Bread, Beverages, Baby Care, Seasonal & Holiday, Gardening, Electronics, etc.
      ambientSubgroups.groceries.push(p);
    }
  });

  // 4. Distribute function helper
  const distributeToShelves = (
    shelvesList: typeof activeStoreShelves,
    productsList: ProductInfo[],
    categoryName: string,
    shelfModel: string,
    rationale: string
  ): ShelfGroupRecommendation | null => {
    // If no shelves placed of this type, skip rendering the group entirely (per user design request)
    if (shelvesList.length === 0) return null;

    const recommendations: ShelfRecommendation[] = [];
    const backupProducts: ProductInfo[] = [];

    // Calculate total slots
    let totalSlots = 0;
    shelvesList.forEach(s => {
      totalSlots += shelvesMap[s.subType.toString()]?.slots ?? 4;
    });

    // Allocate products to slots
    const allocation: ProductInfo[] = [];
    if (productsList.length > 0) {
      // Loop to fill up the slots. Repeat products if slots > products list
      while (allocation.length < totalSlots) {
        productsList.forEach(p => {
          if (allocation.length < totalSlots) {
            allocation.push(p);
          }
        });
      }

      // If products list exceeds total slots, add excess to backup list
      if (productsList.length > totalSlots) {
        for (let idx = totalSlots; idx < productsList.length; idx++) {
          backupProducts.push(productsList[idx]);
        }
      }
    }

    // Sort shelves by grid coordinate then key index
    const sortedShelves = [...shelvesList].sort((a, b) => {
      const g1 = getGridCoord(a.x, a.z);
      const g2 = getGridCoord(b.x, b.z);
      if (g1 !== g2) return g1.localeCompare(g2);
      return a.keyIndex - b.keyIndex;
    });

    let currentAllocIndex = 0;
    sortedShelves.forEach((s) => {
      const slotsCount = shelvesMap[s.subType.toString()]?.slots ?? 4;
      const shelfName = shelvesMap[s.subType.toString()]?.name ?? "Display Shelf";
      const grid = getGridCoord(s.x, s.z);

      // Extract the allocated products for this specific shelf
      const shelfAllocatedProds: ProductInfo[] = [];
      for (let sIdx = 0; sIdx < slotsCount; sIdx++) {
        const p = allocation[currentAllocIndex++];
        if (p) shelfAllocatedProds.push(p);
      }

      // Sort products by subcategory first, then base price ascending (cheaper products go to lower slot numbers / bottom tiers, premium to higher slot numbers / top tiers)
      shelfAllocatedProds.sort((a, b) => {
        const catA = a.subCategory || '';
        const catB = b.subCategory || '';
        if (catA !== catB) {
          return catA.localeCompare(catB);
        }
        return a.basePrice - b.basePrice;
      });

      const slots: ShelfRecommendation['slots'] = [];
      for (let sIdx = 0; sIdx < slotsCount; sIdx++) {
        const p = shelfAllocatedProds[sIdx];
        const placementLevel = getSlotPositionName(s.subType, sIdx + 1);

        if (p) {
          slots.push({
            slotNumber: sIdx + 1,
            productId: p.id,
            productName: p.name,
            brand: p.brand,
            basePrice: p.basePrice,
            placementLevel
          });
        } else {
          slots.push({
            slotNumber: sIdx + 1,
            productId: -1,
            productName: "EMPTY",
            brand: "-",
            basePrice: 0,
            placementLevel
          });
        }
      }

      recommendations.push({
        keyIndex: s.keyIndex,
        grid,
        shelfName,
        subType: s.subType,
        slots
      });
    });

    return {
      categoryName,
      shelfModel,
      rationale,
      totalPlaced: shelvesList.length,
      recommendations,
      backupProducts
    };
  };

  const groups: ShelfGroupRecommendation[] = [];

  // Categorize shelves into groups and distribute products
  
  // A. Fresh produce (Class 3 shelves: 11, 13)
  const freshShelves = activeStoreShelves.filter(s => s.subType === 11 || s.subType === 13);
  const freshGroup = distributeToShelves(
    freshShelves,
    unlockedProducts[3],
    "Fresh Produce & Fruit Trays",
    "Produce Shelf A & B (subtypes 11, 13)",
    "Open ventilated shelves keep fresh fruits and vegetables highly visible, encouraging healthy impulse purchases. Sorted by color and size."
  );
  if (freshGroup) groups.push(freshGroup);

  // B. Pegboard display (Class 4 shelves: 17)
  const pegShelves = activeStoreShelves.filter(s => s.subType === 17);
  const pegGroup = distributeToShelves(
    pegShelves,
    unlockedProducts[4],
    "Pegboard Seeds & Accessories",
    "Pegboard Shelf (subtype 17)",
    "Hanging hook display is optimal for small, flat seed packets, hand tools, and small phone accessories/batteries to keep them organized and at eye level."
  );
  if (pegGroup) groups.push(pegGroup);

  // C. Chilled (Class 1 shelves: 2, 3)
  const chilledShelves = activeStoreShelves.filter(s => s.subType === 2 || s.subType === 3);
  const chilledGroup = distributeToShelves(
    chilledShelves,
    unlockedProducts[1],
    "Chilled Dairies, Meats & Drinks",
    "Basic & Double Fridges (subtypes 2, 3)",
    "Refrigerated cases house highly perishable dairy items, fresh meats, and ready-to-eat sushi. Sorted from dairy (left) to meats and sushi (right) for safety and style."
  );
  if (chilledGroup) groups.push(chilledGroup);

  // D. Frozen (Class 2 shelves: 4, 8)
  const frozenShelves = activeStoreShelves.filter(s => s.subType === 4 || s.subType === 8);
  const frozenGroup = distributeToShelves(
    frozenShelves,
    unlockedProducts[2],
    "Frozen Foods & Desserts",
    "Chest & Standing Freezers (subtypes 4, 8)",
    "Temperature-controlled freezers are grouped by desserts (ice creams) on one end and frozen dinner entrees (pizzas, lasagnas, fries) on the other to streamline path-to-purchase."
  );
  if (frozenGroup) groups.push(frozenGroup);

  // E. Premium Wine & Spirits (Class 0 shelves: 38, 39, 40)
  const premiumShelves = activeStoreShelves.filter(s => s.subType === 38 || s.subType === 39 || s.subType === 40);
  const premiumGroup = distributeToShelves(
    premiumShelves,
    ambientSubgroups.premium,
    "Premium Wines & Spirits",
    "Wooden Shelves A, B & C (subtypes 38, 39, 40)",
    "High-end alcoholic beverages (red/white wines, Japanese whisky, premium vodka) are placed on artisanal wooden shelves to project a premium, high-value brand image."
  );
  if (premiumGroup) groups.push(premiumGroup);

  // F. Checkout counters (Class 0 shelves: 9)
  const counterShelves = activeStoreShelves.filter(s => s.subType === 9);
  const counterGroup = distributeToShelves(
    counterShelves,
    ambientSubgroups.pharmacy,
    "Pharmacy, First Aid & Supplements",
    "Product Counter A (subtype 9)",
    "Small first aid items, vitamins, and pain relief pills are stored on eye-level product counters, often near checkout to prevent theft and encourage quick purchase."
  );
  if (counterGroup) groups.push(counterGroup);

  // G. Beers & Bulk alcohol packs (Class 0 shelves: 37)
  const bigShelves = activeStoreShelves.filter(s => s.subType === 37);
  const bigGroup = distributeToShelves(
    bigShelves,
    ambientSubgroups.beer,
    "Bulk Alcohol Packs & Heavy Goods",
    "The Big Shelf (subtype 37)",
    "Heavy beer packs and large wooden barrels are displayed on the lower levels of a wide, heavy-duty shelf (The Big Shelf) to handle the weight and facilitate easy loading."
  );
  if (bigGroup) groups.push(bigGroup);

  // H. Impulse sweet & candy tiered shelf (Class 0 shelves: 15)
  const tieredShelves = activeStoreShelves.filter(s => s.subType === 15);
  const tieredGroup = distributeToShelves(
    tieredShelves,
    ambientSubgroups.snacks,
    "Cookies, Snacks & Sweets",
    "Tiered Shelf (subtype 15)",
    "Visually appealing chocolate boxes, cookies, sweet jellies, and chips are displayed on a Tiered Shelf to create an attractive, multi-layered visual experience that triggers impulse buys."
  );
  if (tieredGroup) groups.push(tieredGroup);

  // I. Books & Small ambient (Class 0 shelves: 14, 16)
  const smallAmbientShelves = activeStoreShelves.filter(s => s.subType === 14 || s.subType === 16);
  const smallAmbientGroup = distributeToShelves(
    smallAmbientShelves,
    ambientSubgroups.books,
    "Books, Literature & Magazines",
    "Shelf Half & Wall Shelf (subtypes 14, 16)",
    "Books are arranged vertically on standard general display shelves, categorized by genre (educational, kids, general fiction) to allow customers to browse titles comfortably."
  );
  if (smallAmbientGroup) groups.push(smallAmbientGroup);

  // J. Pallets (Class 0 shelves: 21, 22)
  const palletShelves = activeStoreShelves.filter(s => s.subType === 21 || s.subType === 22);
  // We don't have a specific group for pallets, but let's allocate hygiene paper goods or bulk grocery packs
  const palletProds = ambientSubgroups.hygiene.filter(p => p.name.toLowerCase().includes('paper') || p.name.toLowerCase().includes('toilet') || p.name.toLowerCase().includes('towel'));
  const palletGroup = distributeToShelves(
    palletShelves,
    palletProds.length > 0 ? palletProds : ambientSubgroups.groceries.slice(0, 5),
    "Bulk Pallets (Toilet Paper & Towels)",
    "Pallet & Wooden Pallet (subtypes 21, 22)",
    "Heavy bulk items like multi-pack toilet papers and kitchen towels are placed directly on pallets on the floor for heavy-duty load management and wholesale aesthetic."
  );
  if (palletGroup) groups.push(palletGroup);

  // K. Household cleaning & hygiene plastic shelves (Class 0 shelves: 31, 32, 34)
  const plasticShelves = activeStoreShelves.filter(s => s.subType === 31 || s.subType === 32 || s.subType === 34);
  // Combine cleaning products and remaining hygiene items
  const cleanAndHygieneList = [...ambientSubgroups.cleaning, ...ambientSubgroups.hygiene.filter(p => !palletProds.includes(p))];
  const plasticGroup = distributeToShelves(
    plasticShelves,
    cleanAndHygieneList,
    "Cleaning Chemicals & Personal Care",
    "Plastic Shelves A, B & D (subtypes 31, 32, 34)",
    "Heavy detergents, laundry pods, personal hygiene liquids, and cleaning chemicals are stocked on heavy-duty plastic shelves to handle the weight and withstand any accidental chemical leaks."
  );
  if (plasticGroup) groups.push(plasticGroup);

  // L. General Groceries standard display shelf (Class 0 shelves: 1)
  const standardShelves = activeStoreShelves.filter(s => s.subType === 1);
  // Combine breakfast and grains/ staples
  const groceryList = [...ambientSubgroups.breakfast, ...ambientSubgroups.canned, ...ambientSubgroups.groceries];
  const standardGroup = distributeToShelves(
    standardShelves,
    groceryList,
    "General Groceries, Baking & Staples",
    "Display Shelf (subtype 1)",
    "Basic cooking staples like flour, sugar, pasta, rice, cooking oils, and morning items (cereals, coffee, tea) are positioned on middle-to-lower shelves. These are high-volume staple items that customers seek."
  );
  if (standardGroup) groups.push(standardGroup);

  // Sort groups by priority / category
  return groups;
}
