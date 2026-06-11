import React, { useState, useMemo } from "react";
import {
  Layout,
  Warning,
  ShoppingCart,
  Carrot,
  Wine,
  Snowflake,
  ThermometerCold,
  Plant,
  Pill,
  BeerBottle,
  Cookie,
  Books,
  Package,
  Broom,
  ShoppingBag
} from "@phosphor-icons/react";
import type { ShelfData } from "../../utils/save-parser";
import { generatePlanogramRecommendations } from "../../utils/planogram-generator";
import type { ShelfGroupRecommendation } from "../../utils/planogram-generator";

interface PlanogramTabProps {
  shelves: ShelfData[];
  unlockedTiers: boolean[];
}

const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes("produce") || name.includes("fruit")) return <Carrot size={14} />;
  if (name.includes("wine") || name.includes("spirit")) return <Wine size={14} />;
  if (name.includes("chilled") || name.includes("dairy")) return <ThermometerCold size={14} />;
  if (name.includes("frozen")) return <Snowflake size={14} />;
  if (name.includes("pegboard") || name.includes("seeds")) return <Plant size={14} />;
  if (name.includes("pharmacy") || name.includes("first aid")) return <Pill size={14} />;
  if (name.includes("beer") || name.includes("bulk alcohol")) return <BeerBottle size={14} />;
  if (name.includes("cookie") || name.includes("snack")) return <Cookie size={14} />;
  if (name.includes("book") || name.includes("literature")) return <Books size={14} />;
  if (name.includes("pallet")) return <Package size={14} />;
  if (name.includes("cleaning") || name.includes("chemical")) return <Broom size={14} />;
  return <ShoppingBag size={14} />;
};

export const PlanogramTab: React.FC<PlanogramTabProps> = ({ shelves, unlockedTiers }) => {
  // Generate recommendations
  const recommendations = useMemo(() => {
    return generatePlanogramRecommendations(shelves, unlockedTiers);
  }, [shelves, unlockedTiers]);

  // Tab state for categories (recommendation groups)
  const [activeGroupIdx, setActiveGroupIdx] = useState<number>(0);

  // If no storefront shelves placed at all, show friendly fallback
  const totalStoreShelves = useMemo(() => {
    return shelves.filter(s => !s.isBackroom && s.type === 0).length;
  }, [shelves]);

  const activeGroup: ShelfGroupRecommendation | undefined = recommendations[activeGroupIdx];

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-off-white/10 pb-4 gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-off-white uppercase flex items-center gap-2">
            <Layout size={18} />
            <span>Store Planogram & Layout Guide</span>
          </h3>
          <p className="text-off-white/50 text-[11px] uppercase">
            Visual product placement planner optimized for your placed display shelves and unlocked license tiers.
          </p>
        </div>
      </div>

      {totalStoreShelves === 0 ? (
        <div className="p-8 border border-warning-brass/20 bg-warning-brass/5 text-warning-brass uppercase text-center font-bold space-y-2">
          <div>*** SYSTEM REPORT: NO DISPLAY SHELVES DETECTED ***</div>
          <div className="text-[10px] text-off-white/50 lowercase first-letter:uppercase">
            Please purchase and place storefront display shelves (Standard Shelves, Fridges, Freezers, Pegboards, or Produce bins) in your supermarket before using the planogram system.
          </div>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="p-8 border border-laser-red/20 bg-laser-red/5 text-laser-red uppercase text-center font-bold space-y-2">
          <div>*** RECOMMENDATION ALERTS: ALL PRODUCTS LOCKED ***</div>
          <div className="text-[10px] text-off-white/50 lowercase first-letter:uppercase">
            All your placed shelf categories are locked. Purchase licenses in the <span className="font-bold text-terminal-amber">[LICENSES]</span> tab to receive recommendations.
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Placed Shelves Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-bg-charcoal p-3 border border-off-white/5">
            <div className="border border-off-white/10 p-2.5 space-y-1">
              <span className="text-[9px] text-off-white/40 uppercase block">Total Placed Display Shelves</span>
              <span className="text-sm font-extrabold text-off-white">{totalStoreShelves}</span>
            </div>
            <div className="border border-off-white/10 p-2.5 space-y-1">
              <span className="text-[9px] text-off-white/40 uppercase block">Active Categories Available</span>
              <span className="text-sm font-extrabold text-terminal-amber">{recommendations.length}</span>
            </div>
            <div className="border border-off-white/10 p-2.5 space-y-1">
              <span className="text-[9px] text-off-white/40 uppercase block">Total Placed Capacity</span>
              <span className="text-sm font-extrabold text-led-green">
                {shelves.reduce((acc, s) => acc + (s.isBackroom ? 0 : (s.type === 0 ? (s.subType === 8 ? 10 : (s.subType === 3 ? 10 : (s.subType === 31 ? 10 : (s.subType === 9 ? 10 : (s.subType === 37 ? 28 : (s.subType === 16 ? 3 : (s.subType === 21 ? 1 : (s.subType === 22 ? 1 : 4)))))))) : 0)), 0)} slots
              </span>
            </div>
            <div className="border border-off-white/10 p-2.5 space-y-1">
              <span className="text-[9px] text-off-white/40 uppercase block">Licensing Enforcement Filter</span>
              <span className="text-[10px] font-extrabold text-info-blue uppercase">ACTIVE (LICENSES TIER)</span>
            </div>
          </div>

          {/* Horizontal Category Pill Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-off-white/10 pb-3">
            {recommendations.map((group, idx) => (
              <button
                key={idx}
                onClick={() => setActiveGroupIdx(idx)}
                className={`px-3 py-1.5 font-bold uppercase transition-all select-none cursor-pointer border text-[10px] flex items-center gap-1.5 ${
                  activeGroupIdx === idx
                    ? "border-terminal-amber bg-terminal-amber/10 text-terminal-amber font-extrabold"
                    : "border-off-white/10 text-off-white/50 hover:text-off-white hover:border-off-white/20"
                }`}
              >
                {getCategoryIcon(group.categoryName)}
                <span>{group.categoryName} ({group.totalPlaced})</span>
              </button>
            ))}
          </div>

          {activeGroup && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Category Info Panel */}
              <div className="bg-bg-card border-l-4 border-terminal-amber p-4 space-y-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase text-terminal-amber">
                  {getCategoryIcon(activeGroup.categoryName)}
                  <span>Category Placement Strategy: {activeGroup.categoryName}</span>
                </div>
                <div className="text-off-white/70 text-[11px] leading-relaxed">
                  {activeGroup.rationale}
                </div>
                <div className="text-[10px] text-off-white/40 uppercase pt-1 border-t border-off-white/5 flex gap-4">
                  <span>Target Shelf Prefabs: <strong className="text-off-white">{activeGroup.shelfModel}</strong></span>
                  <span>•</span>
                  <span>Total Placed: <strong className="text-off-white">{activeGroup.totalPlaced} unit(s)</strong></span>
                </div>
              </div>

              {/* Placed Shelves Grid */}
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {activeGroup.recommendations.map((rec, shelfIdx) => (
                  <div
                    key={rec.keyIndex}
                    className="border border-off-white/10 bg-bg-charcoal p-4 space-y-3"
                  >
                    {/* Shelf Metadata Header */}
                    <div className="flex justify-between items-center border-b border-off-white/5 pb-2">
                      <span className="font-extrabold uppercase text-off-white flex items-center gap-1.5">
                        <ShoppingCart size={13} className="text-led-green" />
                        <span>{rec.shelfName} #{shelfIdx + 1} ({rec.slots.length} Slots)</span>
                      </span>
                      <span className="text-[10px] text-off-white/40 uppercase">
                        Location Grid: <strong className="text-terminal-amber">{rec.grid}</strong> // ID: <strong className="text-off-white/50">{rec.keyIndex}</strong>
                      </span>
                    </div>

                    {/* Slots Allocation Visual Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                      {rec.slots.map((slot) => {
                        const isEmpty = slot.productId === -1;
                        return (
                          <div
                            key={slot.slotNumber}
                            className={`p-2.5 border flex flex-col justify-between min-h-[90px] ${
                              isEmpty
                                ? "border-off-white/5 bg-bg-card/25 text-off-white/20 select-none"
                                : "border-off-white/10 bg-bg-card hover:border-off-white/25 transition-all text-off-white"
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-[9px] uppercase tracking-wider text-off-white/35">
                                <span>Slot #{slot.slotNumber}</span>
                                {!isEmpty && <span className="text-terminal-amber">ID: {slot.productId}</span>}
                              </div>
                              <div className={`font-bold leading-tight ${isEmpty ? "text-off-white/20 uppercase italic" : "text-off-white uppercase"}`}>
                                {slot.productName}
                              </div>
                              {!isEmpty && (
                                <div className="text-[10px] text-off-white/40 lowercase first-letter:uppercase">
                                  {slot.brand}
                                </div>
                              )}
                            </div>

                            {!isEmpty && (
                              <div className="space-y-1.5 pt-1.5 border-t border-off-white/5 mt-1.5">
                                <div className="flex justify-between items-center">
                                  <span className="text-[9px] text-off-white/40 uppercase">Price</span>
                                  <span className="font-extrabold text-led-green">${slot.basePrice.toFixed(2)}</span>
                                </div>
                                <div className={`text-[8px] uppercase px-1 py-0.5 rounded-none font-bold text-center block w-full border ${
                                  slot.placementLevel.includes('Top')
                                    ? 'bg-terminal-amber/10 text-terminal-amber border-terminal-amber/20'
                                    : slot.placementLevel.includes('Middle') || slot.placementLevel.includes('Mid')
                                      ? 'bg-led-green/10 text-led-green border-led-green/20'
                                      : 'bg-bg-charcoal text-off-white/30 border-off-white/10'
                                }`}>
                                  {slot.placementLevel}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Rotational Backup Products List */}
              {activeGroup.backupProducts.length > 0 && (
                <div className="border border-warning-brass/35 bg-warning-brass/5 p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-warning-brass font-bold uppercase">
                    <Warning size={15} />
                    <span>Rotational Stock Alert: Shelving Over-Capacity ({activeGroup.backupProducts.length} Items)</span>
                  </div>
                  <div className="text-off-white/60 text-[11px] leading-relaxed">
                    You have unlocked more products than the slot capacity of your placed storefront shelves in this category. Keep these remaining products in your backroom storage or swap them in as seasonal inventory:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 pt-2">
                    {activeGroup.backupProducts.map((p) => (
                      <div
                        key={p.id}
                        className="bg-bg-card border border-off-white/10 p-2 text-off-white flex justify-between items-center"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold uppercase text-[10px] truncate max-w-[130px]">{p.name}</div>
                          <div className="text-[9px] text-off-white/40 uppercase">ID: {p.id} // {p.brand}</div>
                        </div>
                        <span className="font-black text-led-green text-[10px]">${p.basePrice.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
