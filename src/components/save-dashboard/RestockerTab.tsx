import React from "react";
import { Package, Check, Warning } from "@phosphor-icons/react";
import type { ShelfData } from "../../utils/save-parser";
import productsData from "../../../database/products.json";

interface RestockerTabProps {
	shelves: ShelfData[];
	restockedCount: number | null;
	showRestockerDev: boolean;
	setShowRestockerDev: (val: boolean) => void;
	triggerRestock: () => void;
	alerts: { productId: number; quantity: number }[];
}

export const RestockerTab: React.FC<RestockerTabProps> = ({
	shelves,
	restockedCount,
	showRestockerDev,
	setShowRestockerDev,
	triggerRestock,
	alerts,
}) => {
	return (
		<div className="flex flex-col gap-6 font-mono text-xs">
			{/* Toggle showRestockerDev to switch between placeholder and full system */}
			{showRestockerDev ? (
				<>
					{/* Shelf Stats Card */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-off-white/10 p-4 bg-bg-charcoal">
						<div className="space-y-1">
							<p className="text-off-white/40 uppercase">Total Placed Shelves</p>
							<p className="text-2xl font-bold text-off-white font-mono">{shelves.length}</p>
						</div>
						<div className="space-y-1">
							<p className="text-off-white/40 uppercase">Storage Shelves</p>
							<p className="text-2xl font-bold text-off-white font-mono">
								{shelves.filter((s) => s.isBackroom).length}
							</p>
						</div>
						<div className="space-y-1">
							<p className="text-off-white/40 uppercase">Display Area Shelves</p>
							<p className="text-2xl font-bold text-off-white font-mono">
								{shelves.filter((s) => !s.isBackroom).length}
							</p>
						</div>
					</div>

					{/* Restock Shifter Console */}
					<div className="border border-off-white/10 p-5 bg-bg-charcoal space-y-4">
						<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
							<div className="space-y-1 w-full">
								<h3 className="text-sm font-bold text-off-white uppercase flex items-center gap-2">
									<Package size={18} className="text-terminal-amber" />
									<span>Conveyor Belt Shifter console</span>
								</h3>
								<p className="text-off-white/50 text-[11px] uppercase mt-2">
									Shifts previously undisplayed items on storage shelves onto empty slots in the main store display area.
								</p>
								<p className="text-warning-brass text-[10px] uppercase font-bold">
									NOTE: This console shifts undisplayed products from backroom racks to empty storefront display slots (with at least 1 unit). Already displayed products are left untouched.
								</p>
							</div>

							<div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-shrink-0">
								<button
									onClick={triggerRestock}
									className="w-full sm:w-auto px-5 py-2.5 bg-terminal-amber hover:bg-terminal-amber/90 text-bg-charcoal font-bold uppercase transition-all cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,0.4)] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.4)]"
								>
									ONE-CLICK RESTOCK
								</button>
								<button
									onClick={() => setShowRestockerDev(false)}
									className="w-full sm:w-auto px-4 py-2.5 border border-laser-red/30 hover:border-laser-red text-laser-red/80 hover:text-laser-red font-bold uppercase transition-all cursor-pointer text-xs"
								>
									LOCK CONSOLE
								</button>
							</div>
						</div>

						{restockedCount !== null && (
							<div className="p-3 bg-led-green/10 border border-led-green text-led-green text-xs uppercase font-bold animate-pulse flex items-center gap-2">
								<Check size={16} />
								<span>
									SUCCESS: RESTOCK COMPLETE. SHIFTED {restockedCount} ITEM SLOTS ONTO MAIN STORE
									SHELVES.
								</span>
							</div>
						)}
					</div>

					{/* Product Display Alerts */}
					<div className="space-y-3">
						<h3 className="text-sm font-bold uppercase text-off-white tracking-wider">
							Stuck Storage Items ({alerts.length})
						</h3>

						{alerts.length === 0 ? (
							<div className="p-4 border border-led-green/20 bg-led-green/5 text-led-green/80 uppercase font-mono text-[11px]">
								All storage items have at least one slot allocated in the main retail display area.
								Good job!
							</div>
						) : (
							<div className="border border-off-white/10 max-h-60 overflow-y-auto bg-bg-charcoal">
								<table className="w-full border-collapse text-left">
									<thead>
										<tr className="border-b border-off-white/10 text-off-white/40 uppercase text-[10px] tracking-wider">
											<th className="p-3 font-semibold">Product Name</th>
											<th className="p-3 font-semibold">Required Shelf</th>
											<th className="p-3 font-semibold text-center">Quantity in Storage</th>
											<th className="p-3 font-semibold text-laser-red text-right">Status</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-off-white/5">
										{alerts.map((alert) => {
											const product = (
												productsData as Record<string, { name: string; category: string }>
											)[alert.productId.toString()];
											const productName = product ? product.name : `Product #${alert.productId}`;
											const requiredShelf = product ? product.category : "General";
											return (
												<tr key={alert.productId} className="hover:bg-white/[0.02] text-xs">
													<td className="p-3 font-bold text-off-white">
														{productName}{" "}
														<span className="text-[10px] text-off-white/30 font-normal">
															#{alert.productId}
														</span>
													</td>
													<td className="p-3 text-off-white/70 font-semibold">{requiredShelf}</td>
													<td className="p-3 text-center text-off-white/70">
														{alert.quantity} units
													</td>
													<td className="p-3 text-laser-red uppercase font-semibold flex items-center justify-end gap-1.5">
														<Warning size={14} /> NOT ON DISPLAY
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</>
			) : (
				<div className="flex flex-col items-center justify-center p-12 border border-dashed border-off-white/20 bg-bg-charcoal text-center space-y-4 font-mono select-none">
					<div className="p-3 bg-warning-brass/10 border border-warning-brass text-warning-brass text-xs font-extrabold uppercase tracking-widest animate-pulse">
						*** WARNING: BETA RESTOCK CONSOLE ***
					</div>
					<div className="max-w-sm text-[11px] text-off-white/50 uppercase leading-normal">
						THE CONVEYOR BELT RESTOCK SHIFTER SYSTEM CONSOLE IS A BETA MODULE. DIRECT CONVEYOR BELT WRITING TO THE SAVE FILE CAN CAUSE SHELVED ITEMS TO SHIFT UNEXPECTEDLY. PLEASE USE WITH CAUTION AND BACK UP YOUR SAVE FILE BEFORE PROCEEDING.
					</div>
					<div className="text-[10px] text-terminal-amber/60 font-bold">
						SYS_STATUS: BETA_CALIBRATED_USE_WITH_CAUTION_
					</div>
					<button
						onClick={() => setShowRestockerDev(true)}
						className="px-4 py-2 border border-warning-brass text-warning-brass hover:bg-warning-brass hover:text-bg-charcoal font-bold uppercase transition-all cursor-pointer text-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] active:translate-y-[1px]"
					>
						INITIALIZE RADAR CONSOLE (USE WITH CAUTION)
					</button>
				</div>
			)}
		</div>
	);
};

