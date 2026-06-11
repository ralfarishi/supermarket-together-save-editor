/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { getRestockAlerts } from "../utils/save-parser";
import type { SaveDataFields, ShelfData } from "../utils/save-parser";
import { StoreVisualizer } from "./StoreVisualizer";
import { Storefront, DownloadSimple } from "@phosphor-icons/react";
import { RANDOM_NAMES } from "../utils/constants";
import { FinancialsTab } from "./save-dashboard/FinancialsTab";
import { RestockerTab } from "./save-dashboard/RestockerTab";
import { LicensesTab } from "./save-dashboard/LicensesTab";
import { EmployeesTab } from "./save-dashboard/EmployeesTab";
import { RecipesTab } from "./save-dashboard/RecipesTab";
import { PlanogramTab } from "./save-dashboard/PlanogramTab";

interface SaveDashboardProps {
	originalFields: SaveDataFields;
	shelves: ShelfData[];
	onSave: (editedFields: SaveDataFields) => void;
	onExportJson: (editedFields: SaveDataFields) => void;
	onRestock: () => { shiftedCount: number; updatedShelves: ShelfData[] } | null;
	saveJson: any;
}

type TabType = "register" | "restocker" | "licenses" | "recipes" | "employees" | "visualizer" | "planogram";

export const SaveDashboard: React.FC<SaveDashboardProps> = ({
	originalFields,
	shelves,
	onSave,
	onExportJson,
	onRestock,
	saveJson,
}) => {
	const [activeTab, setActiveTab] = useState<TabType>("register");
	const [fields, setFields] = useState<SaveDataFields>({ ...originalFields });
	const [restockedCount, setRestockedCount] = useState<number | null>(null);
	const [expandedEmployees, setExpandedEmployees] = useState<Record<number, boolean>>({});
	const [showRestockerDev, setShowRestockerDev] = useState<boolean>(false);
	const [showVisualizerDev, setShowVisualizerDev] = useState<boolean>(false);

	const alerts = getRestockAlerts(shelves);

	// Field change helper
	const handleFieldChange = <K extends keyof SaveDataFields>(key: K, value: SaveDataFields[K]) => {
		setFields((prev) => ({ ...prev, [key]: value }));
	};

	// Undo helper
	const handleUndo = <K extends keyof SaveDataFields>(key: K) => {
		setFields((prev) => ({ ...prev, [key]: originalFields[key] }));
	};

	const toggleEmployeeExpand = (idx: number) => {
		setExpandedEmployees((prev) => ({ ...prev, [idx]: !prev[idx] }));
	};

	const isModified = <K extends keyof SaveDataFields>(key: K): boolean => {
		if (Array.isArray(fields[key])) {
			return JSON.stringify(fields[key]) !== JSON.stringify(originalFields[key]);
		}
		return fields[key] !== originalFields[key];
	};

	const handleTierToggle = (index: number) => {
		const nextTiers = [...fields.UnlockedTiers];
		nextTiers[index] = !nextTiers[index];
		handleFieldChange("UnlockedTiers", nextTiers);
	};

	const handleBulkLicense = (unlock: boolean) => {
		const nextTiers = fields.UnlockedTiers.map(() => unlock);
		handleFieldChange("UnlockedTiers", nextTiers);
	};

	const handleRecipeToggle = (index: number) => {
		const nextRecipes = [...fields.ManufacUnlockedRecipes];
		nextRecipes[index] = !nextRecipes[index];
		handleFieldChange("ManufacUnlockedRecipes", nextRecipes);
	};

	const handleBulkRecipes = (unlock: boolean) => {
		const nextRecipes = fields.ManufacUnlockedRecipes.map(() => unlock);
		handleFieldChange("ManufacUnlockedRecipes", nextRecipes);
	};

	const triggerRestock = () => {
		const result = onRestock();
		if (result) {
			setRestockedCount(result.shiftedCount);
		}
	};

	// Employee Modifications
	const handleEmployeeNameChange = (index: number, val: string) => {
		const nextEmployees = [...fields.Employees];
		nextEmployees[index] = { ...nextEmployees[index], name: val };
		handleFieldChange("Employees", nextEmployees);
	};

	const handleEmployeeSalaryChange = (index: number, val: number) => {
		const nextEmployees = [...fields.Employees];
		nextEmployees[index] = { ...nextEmployees[index], salary: val };
		handleFieldChange("Employees", nextEmployees);
	};

	const handleEmployeeBaseStatChange = (empIndex: number, statIndex: number, val: number) => {
		const nextEmployees = [...fields.Employees];
		const nextBase = [...nextEmployees[empIndex].baseStats];
		nextBase[statIndex] = Math.max(1, Math.min(10, val));
		nextEmployees[empIndex] = { ...nextEmployees[empIndex], baseStats: nextBase };
		handleFieldChange("Employees", nextEmployees);
	};

	const handleEmployeeXpStatChange = (empIndex: number, statIndex: number, val: number) => {
		const nextEmployees = [...fields.Employees];
		const nextXp = [...nextEmployees[empIndex].xpStats];
		nextXp[statIndex] = Math.max(0, val);
		nextEmployees[empIndex] = { ...nextEmployees[empIndex], xpStats: nextXp };
		handleFieldChange("Employees", nextEmployees);
	};

	const handleMaxSpecificStaff = (index: number) => {
		const nextEmployees = [...fields.Employees];
		nextEmployees[index] = {
			...nextEmployees[index],
			salary: 10, // Minimize wage cheat!
			baseStats: [10, 10, 10, 10, 10, 10, 10],
			xpStats: [50000, 50000, 50000, 50000, 50000, 50000, 50000],
		};
		handleFieldChange("Employees", nextEmployees);
	};

	const handleMaxAllStaff = () => {
		const nextEmployees = fields.Employees.map((emp) => ({
			...emp,
			salary: 10,
			baseStats: [10, 10, 10, 10, 10, 10, 10],
			xpStats: [50000, 50000, 50000, 50000, 50000, 50000, 50000],
		}));
		handleFieldChange("Employees", nextEmployees);
	};

	const handleEmployeeGenerateName = (index: number) => {
		const existingNames = fields.Employees.map((emp) => emp.name).filter(Boolean);
		const available = RANDOM_NAMES.filter((name) => !existingNames.includes(name));
		const pool = available.length > 0 ? available : RANDOM_NAMES;
		const randomName = pool[Math.floor(Math.random() * pool.length)];

		const nextEmployees = [...fields.Employees];
		nextEmployees[index] = { ...nextEmployees[index], name: randomName };
		handleFieldChange("Employees", nextEmployees);
	};

	const handleGenerateNamelessStaff = () => {
		const nextEmployees = [...fields.Employees];
		const existingNames = nextEmployees.map((emp) => emp.name).filter(Boolean);

		let modified = false;
		nextEmployees.forEach((emp, idx) => {
			if (!emp.name || emp.name.trim() === "") {
				const available = RANDOM_NAMES.filter((name) => !existingNames.includes(name));
				const pool = available.length > 0 ? available : RANDOM_NAMES;
				const randomName = pool[Math.floor(Math.random() * pool.length)];
				nextEmployees[idx] = { ...emp, name: randomName };
				existingNames.push(randomName);
				modified = true;
			}
		});

		if (modified) {
			handleFieldChange("Employees", nextEmployees);
		}
	};

	return (
		<div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-in fade-in duration-300">
			{/* Top Save Panel */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-bg-card border border-off-white/10 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] font-mono gap-4">
				<div>
					<h2 className="text-sm font-bold uppercase tracking-wider text-terminal-amber flex items-center gap-2">
						<Storefront size={16} />
						<span>Active Terminal Session</span>
					</h2>
					<p className="text-xs text-off-white/40 uppercase mt-0.5">
						Loaded: {originalFields.StoreName || "Unnamed Store"} (
						{originalFields.SupermarketName || "No Name"})
					</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
					<button
						onClick={() => onSave(fields)}
						className="w-full md:w-auto px-6 py-2.5 bg-led-green hover:bg-led-green/90 text-bg-charcoal font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,0.4)] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.4)] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.4)]"
					>
						<DownloadSimple size={16} weight="bold" />
						<span>EXPORT ES3 SAVE</span>
					</button>

					<button
						onClick={() => onExportJson(fields)}
						className="w-full md:w-auto px-6 py-2.5 bg-terminal-amber hover:bg-terminal-amber/90 text-bg-charcoal font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,0.4)] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.4)] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.4)]"
					>
						<DownloadSimple size={16} weight="bold" />
						<span>EXPORT JSON SAVE</span>
					</button>
				</div>
			</div>

			{/* Tabs Row */}
			<div className="flex border-b border-off-white/10 font-mono text-xs uppercase tracking-wider overflow-x-auto">
				<button
					onClick={() => setActiveTab("register")}
					className={`px-6 py-3 border-t-2 font-bold cursor-pointer transition-all ${
						activeTab === "register"
							? "border-terminal-amber bg-bg-card text-terminal-amber font-extrabold"
							: "border-transparent text-off-white/40 hover:text-off-white"
					}`}
				>
					[REGISTER]
				</button>
				<button
					onClick={() => setActiveTab("restocker")}
					className={`px-6 py-3 border-t-2 font-bold cursor-pointer transition-all flex items-center gap-2 ${
						activeTab === "restocker"
							? "border-terminal-amber bg-bg-card text-terminal-amber font-extrabold"
							: "border-transparent text-off-white/40 hover:text-off-white"
					}`}
				>
					<span>[RESTOCKER]</span>
					{alerts.length > 0 && (
						<span className="flex items-center justify-center px-1.5 py-0.5 bg-laser-red text-[9px] font-extrabold text-bg-charcoal rounded-none">
							{alerts.length}
						</span>
					)}
				</button>
				<button
					onClick={() => setActiveTab("licenses")}
					className={`px-6 py-3 border-t-2 font-bold cursor-pointer transition-all ${
						activeTab === "licenses"
							? "border-terminal-amber bg-bg-card text-terminal-amber font-extrabold"
							: "border-transparent text-off-white/40 hover:text-off-white"
					}`}
				>
					[LICENSES ({fields.UnlockedTiers.filter(Boolean).length}/{fields.UnlockedTiers.length})]
				</button>
				<button
					onClick={() => setActiveTab("recipes")}
					className={`px-6 py-3 border-t-2 font-bold cursor-pointer transition-all ${
						activeTab === "recipes"
							? "border-terminal-amber bg-bg-card text-terminal-amber font-extrabold"
							: "border-transparent text-off-white/40 hover:text-off-white"
					}`}
				>
					[RECIPES ({fields.ManufacUnlockedRecipes.filter(Boolean).length}/
					{fields.ManufacUnlockedRecipes.length})]
				</button>
				<button
					onClick={() => setActiveTab("employees")}
					className={`px-6 py-3 border-t-2 font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
						activeTab === "employees"
							? "border-terminal-amber bg-bg-card text-terminal-amber font-extrabold"
							: "border-transparent text-off-white/40 hover:text-off-white"
					}`}
				>
					<span>[STAFF ({fields.Employees.length})]</span>
				</button>
				<button
					onClick={() => setActiveTab("visualizer")}
					className={`px-6 py-3 border-t-2 font-bold cursor-pointer transition-all ${
						activeTab === "visualizer"
							? "border-terminal-amber bg-bg-card text-terminal-amber font-extrabold"
							: "border-transparent text-off-white/40 hover:text-off-white"
					}`}
				>
					[STORE MAP]
				</button>
				<button
					onClick={() => setActiveTab("planogram")}
					className={`px-6 py-3 border-t-2 font-bold cursor-pointer transition-all ${
						activeTab === "planogram"
							? "border-terminal-amber bg-bg-card text-terminal-amber font-extrabold"
							: "border-transparent text-off-white/40 hover:text-off-white"
					}`}
				>
					[PLANOGRAM]
				</button>
			</div>

			{/* Tab Panels */}
			<div className="bg-bg-card border border-off-white/10 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.5)]">
				{/* REGISTER TAB */}
				{activeTab === "register" && (
					<FinancialsTab
						fields={fields}
						handleFieldChange={handleFieldChange}
						handleUndo={handleUndo}
						isModified={isModified}
					/>
				)}

				{/* RESTOCKER TAB */}
				{activeTab === "restocker" && (
					<RestockerTab
						shelves={shelves}
						restockedCount={restockedCount}
						showRestockerDev={showRestockerDev}
						setShowRestockerDev={setShowRestockerDev}
						triggerRestock={triggerRestock}
						alerts={alerts}
					/>
				)}

				{/* LICENSES TAB */}
				{activeTab === "licenses" && (
					<LicensesTab
						unlockedTiers={fields.UnlockedTiers}
						onToggleTier={handleTierToggle}
						onBulkLicense={handleBulkLicense}
					/>
				)}

				{/* RECIPES TAB */}
				{activeTab === "recipes" && (
					<RecipesTab
						unlockedRecipes={fields.ManufacUnlockedRecipes}
						onToggleRecipe={handleRecipeToggle}
						onBulkRecipes={handleBulkRecipes}
					/>
				)}

				{/* EMPLOYEES STAFF TAB */}
				{activeTab === "employees" && (
					<EmployeesTab
						employees={fields.Employees}
						originalEmployees={originalFields.Employees}
						expandedEmployees={expandedEmployees}
						toggleEmployeeExpand={toggleEmployeeExpand}
						handleEmployeeNameChange={handleEmployeeNameChange}
						handleEmployeeSalaryChange={handleEmployeeSalaryChange}
						handleEmployeeBaseStatChange={handleEmployeeBaseStatChange}
						handleEmployeeXpStatChange={handleEmployeeXpStatChange}
						handleMaxSpecificStaff={handleMaxSpecificStaff}
						handleMaxAllStaff={handleMaxAllStaff}
						handleEmployeeGenerateName={handleEmployeeGenerateName}
						handleGenerateNamelessStaff={handleGenerateNamelessStaff}
					/>
				)}

				{/* VISUALIZER TAB */}
				{activeTab === "visualizer" && (
					<div className="animate-in fade-in duration-200">
						{showVisualizerDev ? (
							<div className="space-y-4">
								<div className="flex justify-between items-center font-mono">
									<span className="text-[10px] text-terminal-amber font-bold uppercase tracking-wider">
										*** WARNING: BETA COORDINATE GRID ACTIVE ***
									</span>
									<button
										onClick={() => setShowVisualizerDev(false)}
										className="px-2.5 py-1 border border-warning-brass/40 text-warning-brass/70 hover:text-warning-brass hover:border-warning-brass text-[9px] uppercase font-bold transition-all cursor-pointer rounded-none"
									>
										[ LOCK RADAR SYSTEM ]
									</button>
								</div>
								<StoreVisualizer saveJson={saveJson} />
							</div>
						) : (
							<div className="flex flex-col items-center justify-center p-12 border border-dashed border-off-white/20 bg-bg-charcoal text-center space-y-4 font-mono select-none">
								<div className="p-3 bg-warning-brass/10 border border-warning-brass text-warning-brass text-xs font-extrabold uppercase tracking-widest animate-pulse">
									*** WARNING: BETA RADAR MAP VISUALIZER ***
								</div>
								<div className="max-w-sm text-[11px] text-off-white/50 uppercase leading-normal">
									THE 2D SUPERMARKET RADAR VISUALIZER MAPPING MODULE IS A BETA SYSTEM. IT PROVIDES A
									1:1 COORDINATE PREVIEW OF PROPS DERIVED DIRECTLY FROM SAVE DATA. COORDINATE
									CORRELATION MAY VARY ON CUSTOM TILES. PLEASE USE WITH CAUTION.
								</div>
								<div className="text-[10px] text-terminal-amber/60 font-bold">
									SYS_STATUS: BETA_CALIBRATED_USE_WITH_CAUTION_
								</div>
								<button
									onClick={() => setShowVisualizerDev(true)}
									className="px-4 py-2 border border-warning-brass text-warning-brass hover:bg-warning-brass hover:text-bg-charcoal font-bold uppercase transition-all cursor-pointer text-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] active:translate-y-[1px]"
								>
									INITIALIZE RADAR MAP (USE WITH CAUTION)
								</button>
							</div>
						)}
					</div>
				)}

				{/* PLANOGRAM TAB */}
				{activeTab === "planogram" && (
					<PlanogramTab
						shelves={shelves}
						unlockedTiers={fields.UnlockedTiers}
					/>
				)}
			</div>
		</div>
	);
};

