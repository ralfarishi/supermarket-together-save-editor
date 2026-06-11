import React from 'react';
import { Wrench, Coins, ArrowClockwise } from '@phosphor-icons/react';
import type { SaveDataFields } from '../../utils/save-parser';

interface FinancialsTabProps {
  fields: SaveDataFields;
  handleFieldChange: <K extends keyof SaveDataFields>(key: K, value: SaveDataFields[K]) => void;
  handleUndo: <K extends keyof SaveDataFields>(key: K) => void;
  isModified: <K extends keyof SaveDataFields>(key: K) => boolean;
}

export const FinancialsTab: React.FC<FinancialsTabProps> = ({
  fields,
  handleFieldChange,
  handleUndo,
  isModified,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Input Groups */}
      <div className="space-y-4 font-mono text-xs">
        <h3 className="text-sm font-bold border-b border-off-white/10 pb-2 text-off-white uppercase flex items-center gap-2">
          <Wrench size={16} />
          <span>Store Configurations</span>
        </h3>

        {/* Store Name */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="text-off-white/60 uppercase">Save Slot Name</label>
            {isModified('StoreName') && (
              <button
                onClick={() => handleUndo('StoreName')}
                className="text-warning-brass hover:text-warning-brass/80 flex items-center gap-1 cursor-pointer"
              >
                <ArrowClockwise size={12} /> Undo
              </button>
            )}
          </div>
          <input
            type="text"
            value={fields.StoreName}
            onChange={(e) => handleFieldChange('StoreName', e.target.value)}
            className={`p-2 bg-bg-charcoal border text-sm text-off-white outline-none rounded-none focus:border-terminal-amber ${
              isModified('StoreName') ? 'border-warning-brass border-l-4' : 'border-off-white/15'
            }`}
          />
        </div>

        {/* Supermarket Name */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="text-off-white/60 uppercase">Supermarket Brand Name</label>
            {isModified('SupermarketName') && (
              <button
                onClick={() => handleUndo('SupermarketName')}
                className="text-warning-brass hover:text-warning-brass/80 flex items-center gap-1 cursor-pointer"
              >
                <ArrowClockwise size={12} /> Undo
              </button>
            )}
          </div>
          <input
            type="text"
            value={fields.SupermarketName}
            onChange={(e) => handleFieldChange('SupermarketName', e.target.value)}
            className={`p-2 bg-bg-charcoal border text-sm text-off-white outline-none rounded-none focus:border-terminal-amber ${
              isModified('SupermarketName') ? 'border-warning-brass border-l-4' : 'border-off-white/15'
            }`}
          />
        </div>

        {/* Difficulty */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="text-off-white/60 uppercase">Difficulty multiplier (1-10)</label>
            {isModified('Difficulty') && (
              <button
                onClick={() => handleUndo('Difficulty')}
                className="text-warning-brass hover:text-warning-brass/80 flex items-center gap-1 cursor-pointer"
              >
                <ArrowClockwise size={12} /> Undo
              </button>
            )}
          </div>
          <input
            type="number"
            min={1}
            max={10}
            value={fields.Difficulty}
            onChange={(e) => handleFieldChange('Difficulty', parseInt(e.target.value, 10) || 1)}
            className={`p-2 bg-bg-charcoal border text-sm text-off-white outline-none rounded-none focus:border-terminal-amber ${
              isModified('Difficulty') ? 'border-warning-brass border-l-4' : 'border-off-white/15'
            }`}
          />
        </div>
      </div>

      {/* Financials & Progression */}
      <div className="space-y-4 font-mono text-xs">
        <h3 className="text-sm font-bold border-b border-off-white/10 pb-2 text-off-white uppercase flex items-center gap-2">
          <Coins size={16} />
          <span>Financials & Progress</span>
        </h3>

        {/* Funds */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="text-off-white/60 uppercase">Store Funds ($)</label>
            {isModified('Funds') && (
              <button
                onClick={() => handleUndo('Funds')}
                className="text-warning-brass hover:text-warning-brass/80 flex items-center gap-1 cursor-pointer"
              >
                <ArrowClockwise size={12} /> Undo
              </button>
            )}
          </div>
          <input
            type="number"
            step="0.01"
            value={fields.Funds}
            onChange={(e) => handleFieldChange('Funds', Math.min(2147483000, Math.max(0, parseFloat(e.target.value) || 0)))}
            className={`p-2 bg-bg-charcoal border text-sm text-terminal-amber outline-none rounded-none focus:border-terminal-amber ${
              isModified('Funds') ? 'border-warning-brass border-l-4' : 'border-off-white/15'
            }`}
          />
          <span className="text-[10px] text-off-white/40 mt-1 block leading-tight">
            Capped at $2,147,483,000.00 to prevent single-precision float rounding from overflowing the in-game signed 32-bit integer limit.
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Day */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-off-white/60 uppercase">Calendar Day</label>
              {isModified('Day') && (
                <button
                  onClick={() => handleUndo('Day')}
                  className="text-warning-brass flex items-center gap-0.5 cursor-pointer scale-90"
                >
                  <ArrowClockwise size={10} /> Undo
                </button>
              )}
            </div>
            <input
              type="number"
              value={fields.Day}
              onChange={(e) => handleFieldChange('Day', parseInt(e.target.value, 10) || 1)}
              className={`p-2 bg-bg-charcoal border text-sm text-off-white outline-none rounded-none focus:border-terminal-amber ${
                isModified('Day') ? 'border-warning-brass border-l-4' : 'border-off-white/15'
              }`}
            />
          </div>

          {/* Franchise Points */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-off-white/60 uppercase">Franchise Points</label>
              {isModified('FranchisePoints') && (
                <button
                  onClick={() => handleUndo('FranchisePoints')}
                  className="text-warning-brass flex items-center gap-0.5 cursor-pointer scale-90"
                >
                  <ArrowClockwise size={10} /> Undo
                </button>
              )}
            </div>
            <input
              type="number"
              value={fields.FranchisePoints}
              onChange={(e) => handleFieldChange('FranchisePoints', parseInt(e.target.value, 10) || 0)}
              className={`p-2 bg-bg-charcoal border text-sm text-off-white outline-none rounded-none focus:border-terminal-amber ${
                isModified('FranchisePoints') ? 'border-warning-brass border-l-4' : 'border-off-white/15'
              }`}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Franchise Exp */}
          <div className="flex flex-col gap-1.5">
            <label className="text-off-white/60 uppercase text-[10px]">Franchise EXP</label>
            <input
              type="number"
              value={fields.FranchiseExperience}
              onChange={(e) => handleFieldChange('FranchiseExperience', parseInt(e.target.value, 10) || 0)}
              className={`p-2 bg-bg-charcoal border text-xs text-off-white outline-none rounded-none focus:border-terminal-amber ${
                isModified('FranchiseExperience') ? 'border-warning-brass border-l-4' : 'border-off-white/15'
              }`}
            />
          </div>

          {/* Space Bought */}
          <div className="flex flex-col gap-1.5">
            <label className="text-off-white/60 uppercase text-[10px]">Store Expansion</label>
            <input
              type="number"
              value={fields.SpaceBought}
              onChange={(e) => handleFieldChange('SpaceBought', parseInt(e.target.value, 10) || 0)}
              className={`p-2 bg-bg-charcoal border text-xs text-off-white outline-none rounded-none focus:border-terminal-amber ${
                isModified('SpaceBought') ? 'border-warning-brass border-l-4' : 'border-off-white/15'
              }`}
            />
          </div>

          {/* Storage Bought */}
          <div className="flex flex-col gap-1.5">
            <label className="text-off-white/60 uppercase text-[10px]">Storage Expansion</label>
            <input
              type="number"
              value={fields.StorageBought}
              onChange={(e) => handleFieldChange('StorageBought', parseInt(e.target.value, 10) || 0)}
              className={`p-2 bg-bg-charcoal border text-xs text-off-white outline-none rounded-none focus:border-terminal-amber ${
                isModified('StorageBought') ? 'border-warning-brass border-l-4' : 'border-off-white/15'
              }`}
            />
          </div>
        </div>

        {/* Printed Thermal Receipt summary */}
        <div className="border border-dashed border-off-white/35 p-5 bg-bg-charcoal text-off-white font-mono space-y-3 relative mt-4 shadow-sm select-none">
          <div className="text-center font-bold tracking-wider uppercase border-b border-dashed border-off-white/25 pb-2 text-[11px] text-terminal-amber">
            *** ACTIVE TRANSLATION REGISTER SLIP ***
          </div>
          <div className="flex justify-between text-xs">
            <span className="uppercase text-off-white/50">Store ID:</span>
            <span className="font-bold uppercase">{fields.StoreName || 'UNNAMED'}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="uppercase text-off-white/50">Brand Name:</span>
            <span className="font-bold uppercase">{fields.SupermarketName || 'UNBRANDED'}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="uppercase text-off-white/50">Store Funds:</span>
            <span className="font-bold text-led-green">${fields.Funds.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="uppercase text-off-white/50">Operating Day:</span>
            <span className="font-bold text-off-white">DAY {fields.Day}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="uppercase text-off-white/50">Hired Employees:</span>
            <span className="font-bold">{fields.Employees.length} ACTIVE STAFF</span>
          </div>
          <div className="border-t border-dashed border-off-white/25 pt-2 text-[9px] text-center text-off-white/40 uppercase tracking-widest font-mono">
            THANK YOU FOR WORKING WITH US // ES3 SECURE
          </div>
        </div>
      </div>
    </div>
  );
};
