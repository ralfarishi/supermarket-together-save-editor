import React from 'react';
import { Users, CaretDown, Star } from '@phosphor-icons/react';
import type { Employee } from '../../utils/save-parser';

interface EmployeesTabProps {
  employees: Employee[];
  originalEmployees: Employee[];
  expandedEmployees: Record<number, boolean>;
  toggleEmployeeExpand: (idx: number) => void;
  handleEmployeeNameChange: (idx: number, val: string) => void;
  handleEmployeeSalaryChange: (idx: number, val: number) => void;
  handleEmployeeBaseStatChange: (empIndex: number, statIndex: number, val: number) => void;
  handleEmployeeXpStatChange: (empIndex: number, statIndex: number, val: number) => void;
  handleMaxSpecificStaff: (idx: number) => void;
  handleMaxAllStaff: () => void;
  handleEmployeeGenerateName: (idx: number) => void;
  handleGenerateNamelessStaff: () => void;
}

const STAT_LABELS = [
  'Cashier Speed',
  'Restock Speed',
  'Bag Capacity',
  'Security Level',
  'Movement Speed',
  'Utility Tier A',
  'Utility Tier B'
];

export const EmployeesTab: React.FC<EmployeesTabProps> = ({
  employees,
  originalEmployees,
  expandedEmployees,
  toggleEmployeeExpand,
  handleEmployeeNameChange,
  handleEmployeeSalaryChange,
  handleEmployeeBaseStatChange,
  handleEmployeeXpStatChange,
  handleMaxSpecificStaff,
  handleMaxAllStaff,
  handleEmployeeGenerateName,
  handleGenerateNamelessStaff,
}) => {
  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-off-white/10 pb-4 gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-off-white uppercase flex items-center gap-2">
            <Users size={18} />
            <span>Hired Employees Manager ({employees.length})</span>
          </h3>
          <p className="text-off-white/50 text-[11px] uppercase">
            Edit salaries, skill stars, and max out stats for hired staff.
          </p>
        </div>

        {employees.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {employees.some(emp => !emp.name || emp.name.trim() === '') && (
              <button
                onClick={handleGenerateNamelessStaff}
                className="w-full md:w-auto px-4 py-2 bg-terminal-amber/10 hover:bg-terminal-amber/20 border border-terminal-amber text-terminal-amber font-bold uppercase transition-all cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,0.4)] active:translate-y-[1px]"
              >
                Name Nameless Staff
              </button>
            )}
            <button
              onClick={handleMaxAllStaff}
              className="w-full md:w-auto px-4 py-2 bg-terminal-amber hover:bg-terminal-amber/90 text-bg-charcoal font-bold uppercase transition-all cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,0.4)] active:translate-y-[1px]"
            >
              MAX OUT ALL STAFF
            </button>
          </div>
        )}
      </div>

      {employees.length === 0 ? (
        <div className="p-6 border border-warning-brass/20 bg-warning-brass/5 text-warning-brass uppercase text-center font-bold">
          NO HIRED EMPLOYEES DETECTED IN THIS SAVE FILE. HIRE EMPLOYEES VIA MANAGER BLACKBOARD IN-GAME FIRST.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {employees.map((emp, empIdx) => {
            const isExpanded = !!expandedEmployees[empIdx];
            const originalEmp = originalEmployees[empIdx];
            const isEmpModified =
              originalEmp && (
                emp.name !== originalEmp.name ||
                emp.salary !== originalEmp.salary ||
                JSON.stringify(emp.baseStats) !== JSON.stringify(originalEmp.baseStats) ||
                JSON.stringify(emp.xpStats) !== JSON.stringify(originalEmp.xpStats)
              );

            return (
              <div 
                key={empIdx} 
                className={`border transition-all duration-300 bg-bg-charcoal shadow-[3px_3px_0px_0px_rgba(0,0,0,0.4)] ${
                  isEmpModified ? 'border-warning-brass border-l-4' : 'border-off-white/10'
                }`}
              >
                {/* Accordion Header */}
                <div 
                  onClick={() => toggleEmployeeExpand(empIdx)}
                  className="flex justify-between items-center p-4 cursor-pointer select-none hover:bg-white/[0.02] transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CaretDown
                      size={14}
                      className={`text-off-white/50 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                    />

                    {/* Status dot */}
                    <div className={`h-2.5 w-2.5 rounded-none flex-shrink-0 ${emp.assigned !== 0 ? 'bg-led-green animate-pulse' : 'bg-off-white/25'}`} />

                    <div className="min-w-0">
                      <span className="font-bold text-off-white uppercase truncate block text-[13px]">
                        {emp.name || `Employee #${empIdx + 1}`}
                      </span>
                      <span className="text-[10px] text-off-white/40 uppercase font-mono">
                        Type #{emp.type} — {emp.assigned === 0 ? 'STANDBY' : 'WORKING'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-off-white/40 uppercase hidden sm:inline">Salary:</span>
                      <input
                        type="number"
                        value={emp.salary}
                        onChange={(e) => handleEmployeeSalaryChange(empIdx, parseInt(e.target.value, 10) || 0)}
                        className={`bg-bg-card border p-1 text-[11px] font-bold outline-none focus:border-terminal-amber rounded-none w-16 text-center ${
                          originalEmp && emp.salary !== originalEmp.salary ? 'border-warning-brass border-l-4' : 'border-off-white/10'
                        }`}
                      />
                    </div>

                    <button
                      onClick={() => handleMaxSpecificStaff(empIdx)}
                      className="px-2.5 py-1.5 bg-led-green text-bg-charcoal text-[9px] font-extrabold uppercase hover:bg-led-green/90 active:scale-95 transition-all cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)]"
                    >
                      MAX STATS
                    </button>
                  </div>
                </div>

                {/* Accordion Body */}
                <div 
                  className={`transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden border-t border-off-white/5 bg-bg-card/40 ${
                    isExpanded ? 'max-h-[900px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="p-4 space-y-4 font-mono text-xs">
                    {/* Name Input */}
                    <div className="flex flex-col gap-1.5 max-w-sm">
                      <label className="text-off-white/40 uppercase">Edit Name</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={emp.name}
                          onChange={(e) => handleEmployeeNameChange(empIdx, e.target.value)}
                          className={`flex-1 p-1.5 bg-bg-charcoal border text-xs text-off-white outline-none rounded-none focus:border-terminal-amber ${
                            originalEmp && emp.name !== originalEmp.name ? 'border-warning-brass border-l-4' : 'border-off-white/10'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => handleEmployeeGenerateName(empIdx)}
                          className="px-3 bg-off-white/10 hover:bg-off-white/20 text-off-white border border-off-white/10 font-bold uppercase transition-all cursor-pointer text-[10px] rounded-none active:scale-95"
                          title="Generate Random Name"
                        >
                          Random
                        </button>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="space-y-3 pt-1">
                      <h4 className="text-[10px] uppercase font-bold text-off-white/40 border-b border-off-white/5 pb-1">
                        Skills & Experience Levels
                      </h4>

                      <div className="space-y-4">
                        {emp.baseStats.map((base, statIdx) => {
                          const originalBase = originalEmp?.baseStats[statIdx];
                          const originalXp = originalEmp?.xpStats[statIdx];
                          const isStatModified =
                            originalEmp && (
                              base !== originalBase ||
                              emp.xpStats[statIdx] !== originalXp
                            );

                          const xpPercent = Math.min(100, (emp.xpStats[statIdx] / 50000) * 100);

                          return (
                            <div 
                              key={statIdx} 
                              className={`p-2 border border-transparent transition-all ${
                                isStatModified ? 'border-warning-brass/25 border-l-warning-brass border-l-4 bg-warning-brass/5' : ''
                              }`}
                            >
                              <div className="flex justify-between items-center text-[10px] mb-1">
                                <span className="text-off-white/80 uppercase font-semibold">
                                  {STAT_LABELS[statIdx] || `Skill #${statIdx + 1}`}
                                </span>
                                <div className="flex items-center gap-3 text-off-white/40">
                                  <span className="flex items-center gap-0.5 text-warning-brass">
                                    <Star size={10} weight="fill" />
                                    <span className="font-bold">{base}/10</span>
                                  </span>
                                  <span>
                                    XP: <span className="text-led-green font-bold">{emp.xpStats[statIdx]}</span>
                                  </span>
                                </div>
                              </div>

                              {/* Progress Bar */}
                              <div className="w-full bg-bg-charcoal border border-off-white/10 h-1.5 relative mb-2">
                                <div 
                                  className="bg-led-green h-full transition-all duration-300" 
                                  style={{ width: `${xpPercent}%` }} 
                                />
                              </div>

                              {/* Sliders Grid */}
                              <div className="grid grid-cols-12 gap-2 items-center">
                                {/* Base Star Slider */}
                                <div className="col-span-6 flex items-center gap-1.5">
                                  <span className="text-[9px] text-off-white/30 uppercase">BASE</span>
                                  <input
                                    type="range"
                                    min={1}
                                    max={10}
                                    value={base}
                                    onChange={(e) => handleEmployeeBaseStatChange(empIdx, statIdx, parseInt(e.target.value, 10))}
                                    className="w-full accent-warning-brass h-1 bg-bg-charcoal rounded-none border border-off-white/5 cursor-pointer"
                                  />
                                </div>

                                {/* XP Input */}
                                <div className="col-span-6 flex items-center gap-1.5 justify-end">
                                  <span className="text-[9px] text-off-white/30 uppercase">XP</span>
                                  <input
                                    type="number"
                                    min={0}
                                    value={emp.xpStats[statIdx]}
                                    onChange={(e) => handleEmployeeXpStatChange(empIdx, statIdx, parseInt(e.target.value, 10) || 0)}
                                    className="bg-bg-charcoal border border-off-white/10 p-1 text-[10px] text-right font-mono text-led-green outline-none focus:border-led-green rounded-none w-20"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
