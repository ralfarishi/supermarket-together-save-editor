import React from 'react';
import { MagnifyingGlass, Eye, EyeSlash } from '@phosphor-icons/react';

interface ControlBarProps {
  searchProductId: string;
  setSearchProductId: (val: string) => void;
  showShelves: boolean;
  setShowShelves: (val: boolean) => void;
  showStorage: boolean;
  setShowStorage: (val: boolean) => void;
  showRegisters: boolean;
  setShowRegisters: (val: boolean) => void;
  shelvesCount: number;
  storageCount: number;
  registersCount: number;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  searchProductId,
  setSearchProductId,
  showShelves,
  setShowShelves,
  showStorage,
  setShowStorage,
  showRegisters,
  setShowRegisters,
  shelvesCount,
  storageCount,
  registersCount
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-bg-charcoal p-3 border border-off-white/10">
      {/* Search for product */}
      <div className="relative w-full md:w-80">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-off-white/40">
          <MagnifyingGlass size={14} />
        </div>
        <input
          type="number"
          placeholder="SEARCH BY PRODUCT ID (HIGHLIGHTS SHELVES)"
          value={searchProductId}
          onChange={(e) => setSearchProductId(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 bg-bg-card border border-off-white/10 text-off-white outline-none focus:border-terminal-amber rounded-none uppercase text-[10px]"
        />
      </div>

      {/* View filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={() => setShowShelves(!showShelves)}
          className={`px-3 py-1 border flex items-center gap-1.5 transition-all text-[10px] uppercase font-bold cursor-pointer ${
            showShelves ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/5' : 'border-off-white/10 text-off-white/40'
          }`}
        >
          {showShelves ? <Eye size={12} /> : <EyeSlash size={12} />}
          <span>Shelves ({shelvesCount})</span>
        </button>
        
        <button
          onClick={() => setShowStorage(!showStorage)}
          className={`px-3 py-1 border flex items-center gap-1.5 transition-all text-[10px] uppercase font-bold cursor-pointer ${
            showStorage ? 'border-blue-500/50 text-blue-400 bg-blue-500/5' : 'border-off-white/10 text-off-white/40'
          }`}
        >
          {showStorage ? <Eye size={12} /> : <EyeSlash size={12} />}
          <span>Storage ({storageCount})</span>
        </button>

        <button
          onClick={() => setShowRegisters(!showRegisters)}
          className={`px-3 py-1 border flex items-center gap-1.5 transition-all text-[10px] uppercase font-bold cursor-pointer ${
            showRegisters ? 'border-orange-500/50 text-orange-400 bg-orange-500/5' : 'border-off-white/10 text-off-white/40'
          }`}
        >
          {showRegisters ? <Eye size={12} /> : <EyeSlash size={12} />}
          <span>Registers ({registersCount})</span>
        </button>
      </div>
    </div>
  );
};
