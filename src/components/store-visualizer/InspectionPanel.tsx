import React from 'react';
import { Info, Package, Wrench } from '@phosphor-icons/react';
import type { VisualProp } from './types';
import { getGridCoord } from '../../utils/grid-utils';
import productsData from '../../../database/products.json';
import shelvesData from '../../../database/shelves.json';
import registersData from '../../../database/registers.json';

interface InspectionPanelProps {
  selectedItem: VisualProp | null;
}

const getShelfTypeName = (category: string, type: number, subType: number): string => {
  if (type === 10) {
    const shelf = (shelvesData as Record<string, { name: string }>)[subType.toString()];
    if (shelf) return `${shelf.name} (MFG)`;
    return `Manufacturing Machine (ID: ${subType})`;
  }

  if (type === 11) {
    const shelf = (shelvesData as Record<string, { name: string }>)[subType.toString()];
    if (shelf) return `${shelf.name} (Mfg Shelf)`;
    return `Manufacturing Storage Shelf (ID: ${subType})`;
  }

  if (category === 'register') {
    const reg = (registersData as Record<string, { name: string }>)[subType.toString()];
    if (reg) return reg.name;
    const shelf = (shelvesData as Record<string, { name: string; slots: number }>)[subType.toString()];
    if (shelf) return shelf.name;
    return `Cash Register (ID: ${subType})`;
  }

  const shelf = (shelvesData as Record<string, { name: string; slots: number }>)[subType.toString()];
  if (shelf) {
    return `${shelf.name} (${shelf.slots} slots)`;
  }

  return `Unknown Prop (ID: ${subType})`;
};

export const InspectionPanel: React.FC<InspectionPanelProps> = ({ selectedItem }) => {
  return (
    <div className="lg:col-span-1 flex flex-col bg-bg-charcoal border border-off-white/10 p-4 justify-between h-[500px]">
      <div className="space-y-4 overflow-y-auto flex-1 pr-1">
        <h3 className="text-sm font-extrabold text-off-white border-b border-off-white/10 pb-2 uppercase flex items-center gap-1.5 sticky top-0 bg-bg-charcoal z-10">
          <Info size={16} />
          <span>Inspection Panel</span>
        </h3>

        {selectedItem ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <span className="text-[10px] uppercase text-off-white/40 block">Prop Category</span>
              <span className="text-xs font-bold text-terminal-amber uppercase block">
                {selectedItem.type === 10 ? 'Manufacturing Display' :
                 selectedItem.type === 11 ? 'Manufacturing Storage' :
                 selectedItem.category === 'shelf' ? 'Display Shelf' :
                 selectedItem.category === 'storage' ? 'Storage Rack/Freezer' : 'Cash Register'}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase text-off-white/40 block">Save Identifier Key</span>
              <span className="text-xs font-mono text-off-white block">{selectedItem.key}</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase text-off-white/40 block">Model Type / Description</span>
              <span className="text-xs font-bold text-off-white block">
                {getShelfTypeName(selectedItem.category, selectedItem.type, selectedItem.subType)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-[10px] uppercase text-off-white/40 block">Engine Type ID</span>
                <span className="text-xs font-mono text-off-white block">{selectedItem.type}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase text-off-white/40 block">Sub-Model ID</span>
                <span className="text-xs font-mono text-off-white block">{selectedItem.subType}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase text-off-white/40 block">Grid Position</span>
              <span className="text-xs font-extrabold text-terminal-amber block">
                Cell {getGridCoord(selectedItem.x, selectedItem.z)}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase text-off-white/40 block">Location Coordinates</span>
              <span className="text-xs font-mono text-off-white block">
                X: {selectedItem.x.toFixed(3)}<br />
                Y: {selectedItem.y.toFixed(3)} (Height)<br />
                Z: {selectedItem.z.toFixed(3)}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase text-off-white/40 block">Rotation Orientation</span>
              <span className="text-xs font-mono text-off-white block">{selectedItem.rot.toFixed(1)}°</span>
            </div>

            {/* Contents listing */}
            {selectedItem.slots.length > 0 && (
              <div className="border-t border-off-white/10 pt-3 space-y-1.5">
                <span className="text-[10px] uppercase text-off-white/40 flex items-center gap-1">
                  <Package size={12} /> Shelved Products
                </span>
                <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                  {selectedItem.slots.map((slot, idx) => {
                    const product = (productsData as Record<string, { name: string }>)[slot.productId.toString()];
                    const productName = product ? product.name : `Product #${slot.productId}`;
                    return (
                      <div 
                        key={idx} 
                        className={`flex justify-between items-center p-1.5 text-[10px] ${
                          slot.productId > 0 ? 'bg-off-white/5 text-off-white' : 'bg-transparent text-off-white/20'
                        }`}
                      >
                        <span>Slot #{idx + 1}</span>
                        <span className="font-bold">
                          {slot.productId > 0 ? `${productName} (${slot.quantity} qty)` : 'EMPTY'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-off-white/30 space-y-2 uppercase text-[10px]">
            <Wrench size={24} className="mx-auto text-off-white/10" />
            <p>Click on any physical shelf, rack, or register on the map to inspect its metadata and product contents.</p>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="border-t border-off-white/10 pt-3 space-y-2 text-[10px] text-off-white/50">
        <span className="font-bold text-off-white/70 block uppercase">Map Legend:</span>
        <div className="flex flex-wrap gap-x-3 gap-y-2">
          <div className="flex items-center gap-1.5 min-w-[65px]">
            <div className="w-3 h-2.5 bg-emerald-500 border border-emerald-700 flex-shrink-0" />
            <span>Shelves</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-[65px]">
            <div className="w-3 h-2.5 bg-blue-500 border border-blue-700 flex-shrink-0" />
            <span>Storage</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-[65px]">
            <div className="w-3 h-2.5 bg-orange-500 border border-orange-700 flex-shrink-0" />
            <span>Registers</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-[65px]">
            <div className="w-3 h-2.5 bg-violet-500 border border-violet-700 flex-shrink-0" />
            <span>Mfg (MFG)</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-[65px]">
            <div className="w-3 h-2.5 bg-pink-500 border border-pink-700 flex-shrink-0" />
            <span>Mfg Shelf</span>
          </div>
        </div>
      </div>
    </div>
  );
};
