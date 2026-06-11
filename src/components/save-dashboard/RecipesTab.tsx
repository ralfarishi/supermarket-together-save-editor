import React, { useState } from 'react';
import { CookingPot, MagnifyingGlass, Snowflake, Wind } from '@phosphor-icons/react';
import productsData from '../../../database/products.json';
import recipesData from '../../../database/recipes.json';

interface RecipesTabProps {
  unlockedRecipes: boolean[];
  onToggleRecipe: (idx: number) => void;
  onBulkRecipes: (unlock: boolean) => void;
}

interface RecipeItem {
  id: number;
  name: string;
  formula: string;
  outputClass: number; // 0 = Ambient, 1 = Chilled
  itemsPerBox: number;
}

export const RecipesTab: React.FC<RecipesTabProps> = ({
  unlockedRecipes,
  onToggleRecipe,
  onBulkRecipes,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const getProductName = (idStr: string): string => {
    const prod = (productsData as Record<string, { name: string }>)[idStr];
    return prod ? prod.name : `#${idStr}`;
  };

  const getFormulaText = (formula: string): { display: string; full: string }[] => {
    return formula.split('|').map((slot) => {
      const ids = slot.split('-');
      const names = ids.map(id => getProductName(id));
      if (names.length === 1) {
        return { display: names[0], full: names[0] };
      }
      if (names.length === 2) {
        const display = `${names[0]} / ${names[1]}`;
        return { display, full: names.join(' / ') };
      }
      const display = `${names[0]} (+${names.length - 1} others)`;
      return { display, full: names.join(' / ') };
    });
  };

  const recipes: RecipeItem[] = Object.entries(recipesData).map(([key, value]) => ({
    id: parseInt(key, 10),
    name: value.name,
    formula: value.formula,
    outputClass: value.outputClass,
    itemsPerBox: value.itemsPerBox,
  }));

  const filteredRecipes = recipes.filter((recipe) => {
    const nameMatch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase());
    const idMatch = recipe.id.toString() === searchQuery;
    const ingredientMatch = getFormulaText(recipe.formula).some(ing => 
      ing.full.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return nameMatch || idMatch || ingredientMatch;
  });

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-off-white/10 pb-4 gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-off-white uppercase flex items-center gap-2">
            <CookingPot size={18} />
            <span>Manufacturing Recipes ({unlockedRecipes.filter(Boolean).length} / {unlockedRecipes.length})</span>
          </h3>
          <p className="text-off-white/50 text-[11px] uppercase">
            Toggle which recipes are unlocked for your oven, salad bar, and manufacturing stations.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <MagnifyingGlass size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-off-white/30" />
            <input
              type="text"
              placeholder="SEARCH RECIPES/INGREDIENTS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-bg-charcoal border border-off-white/10 text-off-white font-bold text-[10px] uppercase outline-none focus:border-terminal-amber transition-all"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onBulkRecipes(true)}
              className="px-3 py-1.5 border border-off-white/20 hover:bg-off-white/10 text-off-white font-bold text-[10px] uppercase transition-all cursor-pointer animate-in fade-in"
            >
              UNLOCK ALL
            </button>
            <button
              onClick={() => onBulkRecipes(false)}
              className="px-3 py-1.5 border border-off-white/20 hover:bg-off-white/10 text-off-white font-bold text-[10px] uppercase transition-all cursor-pointer animate-in fade-in"
            >
              LOCK ALL
            </button>
          </div>
        </div>
      </div>

      {unlockedRecipes.length === 0 ? (
        <div className="p-4 border border-laser-red/20 bg-laser-red/5 text-laser-red uppercase text-center font-bold">
          NO RECIPE DATA DETECTED IN THIS SAVE FILE.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[460px] overflow-y-auto p-1 bg-bg-charcoal border border-off-white/10">
          {filteredRecipes.map((recipe) => {
            const unlocked = unlockedRecipes[recipe.id] ?? false;
            const formulaSlots = getFormulaText(recipe.formula);

            return (
              <button
                key={recipe.id}
                onClick={() => onToggleRecipe(recipe.id)}
                className={`p-4 text-left border font-mono transition-all flex flex-col justify-between select-none cursor-pointer min-h-[160px] h-full group ${
                  unlocked
                    ? 'border-led-green bg-led-green/5 text-led-green'
                    : 'border-off-white/10 bg-bg-card text-off-white/40 hover:border-off-white/20'
                }`}
              >
                <div className="space-y-3 w-full">
                  <div className="flex justify-between items-start w-full">
                    <span className="text-[9px] uppercase tracking-wider text-off-white/40">Recipe #{recipe.id}</span>
                    <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded-none font-extrabold transition-all ${
                      unlocked ? 'bg-led-green text-bg-charcoal font-black' : 'bg-bg-charcoal text-off-white/30 border border-off-white/10'
                    }`}>
                      {unlocked ? 'UNLOCKED' : 'LOCKED'}
                    </span>
                  </div>

                  <div className={`text-xs font-extrabold leading-tight uppercase transition-all truncate ${unlocked ? 'text-off-white' : 'text-off-white/30'}`}>
                    {recipe.name}
                  </div>

                  <div className="space-y-1">
                    <div className="text-[9px] uppercase tracking-wider text-off-white/30 font-bold">Formula:</div>
                    <div 
                      className={`text-[10px] leading-relaxed transition-all break-words ${
                        unlocked ? 'text-off-white/70' : 'text-off-white/20'
                      }`}
                      title={formulaSlots.map((s, i) => `Slot ${i + 1}: ${s.full}`).join('\n')}
                    >
                      {formulaSlots.map((slot, idx) => (
                        <span key={idx} className="inline">
                          {idx > 0 && <span className="mx-1 text-terminal-amber/60 font-sans font-bold">+</span>}
                          <span className="underline decoration-dashed decoration-off-white/10 hover:decoration-off-white/30 transition-all">
                            {slot.display}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[9px] uppercase pt-2.5 border-t border-off-white/5 w-full mt-3 gap-2">
                  <span className="flex items-center gap-1 font-bold whitespace-nowrap">
                    {recipe.outputClass === 1 ? (
                      <span className="flex items-center gap-0.5 text-info-blue whitespace-nowrap">
                        <Snowflake size={10} /> Chilled
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-warning-brass whitespace-nowrap">
                        <Wind size={10} /> Ambient
                      </span>
                    )}
                  </span>
                  <span className="text-off-white/40 font-bold whitespace-nowrap">
                    Box: <span className={unlocked ? 'text-off-white font-bold' : 'text-off-white/20'}>{recipe.itemsPerBox}</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
