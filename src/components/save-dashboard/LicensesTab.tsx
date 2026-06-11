import React from 'react';
import { ListChecks } from '@phosphor-icons/react';
import productsData from '../../../database/products.json';
import { PRODUCT_LICENSES } from '../../utils/constants';

interface LicensesTabProps {
  unlockedTiers: boolean[];
  onToggleTier: (idx: number) => void;
  onBulkLicense: (unlock: boolean) => void;
}

export const LicensesTab: React.FC<LicensesTabProps> = ({
  unlockedTiers,
  onToggleTier,
  onBulkLicense,
}) => {
  const getUnlockedProductNames = (unlocksStr: string): string[] => {
    if (unlocksStr === "???") return [];
    if (unlocksStr.includes("-")) {
      const [start, end] = unlocksStr.split("-").map(Number);
      const names: string[] = [];
      for (let i = start; i <= end; i++) {
        const prod = (productsData as Record<string, { name: string }>)[i.toString()];
        if (prod) {
          names.push(prod.name);
        }
      }
      return names;
    }
    return [];
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-off-white/10 pb-4 gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-off-white uppercase flex items-center gap-2">
            <ListChecks size={18} />
            <span>Licensed Product Tiers ({unlockedTiers.filter(Boolean).length} / {unlockedTiers.length})</span>
          </h3>
          <p className="text-off-white/50 text-[11px] uppercase">
            Toggle which product categories/tiers are unlocked and purchaseable in your game.
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => onBulkLicense(true)}
            className="px-3 py-1.5 border border-off-white/20 hover:bg-off-white/10 text-off-white font-bold text-[10px] uppercase transition-all cursor-pointer"
          >
            UNLOCK ALL
          </button>
          <button
            onClick={() => onBulkLicense(false)}
            className="px-3 py-1.5 border border-off-white/20 hover:bg-off-white/10 text-off-white font-bold text-[10px] uppercase transition-all cursor-pointer"
          >
            LOCK ALL
          </button>
        </div>
      </div>

      {unlockedTiers.length === 0 ? (
        <div className="p-4 border border-laser-red/20 bg-laser-red/5 text-laser-red uppercase text-center font-bold">
          NO PRODUCT TIER DATA DETECTED IN THIS SAVE FILE.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-1 bg-bg-charcoal border border-off-white/10">
          {unlockedTiers.map((unlocked, idx) => {
            const license = PRODUCT_LICENSES[idx] || { name: `Tier ${idx}`, unlocks: "???" };
            const productNames = getUnlockedProductNames(license.unlocks);
            
            return (
              <button
                key={idx}
                onClick={() => onToggleTier(idx)}
                className={`p-3 text-left border font-mono transition-all flex flex-col justify-between gap-1 select-none cursor-pointer min-h-[115px] ${
                  unlocked
                    ? 'border-led-green bg-led-green/5 text-led-green'
                    : 'border-off-white/10 bg-bg-card text-off-white/40 hover:border-off-white/20'
                }`}
                title={productNames.length > 0 ? `Unlocks:\n- ${productNames.join('\n- ')}` : undefined}
              >
                <div className="space-y-1 w-full">
                  <div className="flex justify-between items-start w-full">
                    <span className="text-[9px] uppercase tracking-wider text-off-white/40">Tier #{idx}</span>
                    <span className={`text-[8px] uppercase px-1 py-0.5 rounded-none font-extrabold ${
                      unlocked ? 'bg-led-green text-bg-charcoal font-black' : 'bg-bg-charcoal text-off-white/30 border border-off-white/10'
                    }`}>
                      {unlocked ? 'ACTIVE' : 'LOCKED'}
                    </span>
                  </div>
                  <div className={`text-xs font-bold leading-tight uppercase ${unlocked ? 'text-off-white' : 'text-off-white/30'}`}>
                    {license.name}
                  </div>
                  {productNames.length > 0 && (
                    <div className={`text-[10px] leading-tight line-clamp-2 mt-1 lowercase first-letter:uppercase ${
                      unlocked ? 'text-off-white/50' : 'text-off-white/25'
                    }`}>
                      {productNames.join(', ')}
                    </div>
                  )}
                </div>
                <div className="text-[9px] uppercase text-off-white/40 pt-1 border-t border-off-white/5 mt-1">
                  Unlocks: <span className={unlocked ? 'text-terminal-amber font-bold' : 'text-off-white/20'}>{license.unlocks}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
