import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { Plus, Minus, ArrowCounterClockwise } from "@phosphor-icons/react";
import type { ShelfProductSlot, VisualProp, StoreVisualizerProps } from "./store-visualizer/types";
import { getGridCoord } from "../utils/grid-utils";
import { ControlBar } from "./store-visualizer/ControlBar";
import { InspectionPanel } from "./store-visualizer/InspectionPanel";
import { drawStoreMap } from "./store-visualizer/draw-utils";
import { DIMENSION_DB } from "../utils/constants";
import { parseUnityFloat } from "../utils/helpers";

const getDimensions = (category: string, subType: number) => {
	if (DIMENSION_DB[subType]) {
		return DIMENSION_DB[subType];
	}
	if (category === "storage") return { width: 1.0, length: 2.4 };
	if (category === "register") return { width: 1.2, length: 2.2 };
	return { width: 0.8, length: 2.0 };
};

export const StoreVisualizer: React.FC<StoreVisualizerProps> = ({ saveJson }) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	// Viewport state (Zoom & Pan)
	const [zoom, setZoom] = useState<number>(8); // Pixels per game unit
	const [panX, setPanX] = useState<number>(250);
	const [panY, setPanY] = useState<number>(450);
	const [isDragging, setIsDragging] = useState<boolean>(false);
	const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

	// Filters and search
	const [searchProductId, setSearchProductId] = useState<string>("");
	const [showShelves, setShowShelves] = useState<boolean>(true);
	const [showStorage, setShowStorage] = useState<boolean>(true);
	const [showRegisters, setShowRegisters] = useState<boolean>(true);

	// Interaction
	const [hoveredItem, setHoveredItem] = useState<VisualProp | null>(null);
	const [selectedItem, setSelectedItem] = useState<VisualProp | null>(null);

	// Parse props from saveJson
	const parsedProps = useMemo<VisualProp[]>(() => {
		if (!saveJson) return [];

		const keys = Object.keys(saveJson);
		const list: VisualProp[] = [];

		// Temporary storage for products to map them to shelves
		const shelfProducts = new Map<number, ShelfProductSlot[]>();
		const storageProducts = new Map<number, ShelfProductSlot[]>();

		keys.forEach((key) => {
			// Parse shelf product contents
			const shelfMatch = key.match(/^propinfoproduct(\d+)$/);
			if (shelfMatch) {
				const idx = parseInt(shelfMatch[1], 10);
				const val = saveJson[key]?.value;
				if (Array.isArray(val)) {
					const slots: ShelfProductSlot[] = [];
					for (let i = 0; i < val.length; i += 2) {
						slots.push({
							productId: val[i] ?? -1,
							quantity: val[i + 1] ?? 0,
						});
					}
					shelfProducts.set(idx, slots);
				}
			}

			// Parse storage rack product contents
			const storageMatch = key.match(/^mpropinfoproduct(\d+)$/);
			if (storageMatch) {
				const idx = parseInt(storageMatch[1], 10);
				const val = saveJson[key]?.value;
				if (Array.isArray(val)) {
					const slots: ShelfProductSlot[] = [];
					for (let i = 0; i < val.length; i += 2) {
						slots.push({
							productId: val[i] ?? -1,
							quantity: val[i + 1] ?? 0,
						});
					}
					storageProducts.set(idx, slots);
				}
			}
		});

		keys.forEach((key) => {
			let category: "shelf" | "storage" | "register" | "manufacturing" | "market";
			let index: number;

			let keyCategory: "prop" | "mprop";
			if (/^propdata\d+$/.test(key)) {
				keyCategory = "prop";
				index = parseInt(key.replace("propdata", ""), 10);
			} else if (/^mpropdata\d+$/.test(key)) {
				keyCategory = "mprop";
				index = parseInt(key.replace("mpropdata", ""), 10);
			} else {
				return; // Skip non-placement keys
			}

			const val = saveJson[key]?.value;
			if (typeof val === "string") {
				const parts = val.split("|");
				if (parts.length >= 6) {
					const type = parseInt(parts[0], 10);
					const subType = parseInt(parts[1], 10);

					// Map category based on category type ID in save value
					if (keyCategory === "prop") {
						if (type === 0)
							category = "shelf"; // storefront display
						else if (type === 1)
							category = "storage"; // storage shelves
						else if (type === 2)
							category = "register"; // checkout counter
						else return; // skip other types in propdata
					} else if (keyCategory === "mprop") {
						if (type === 10) category = "shelf"; // manufacturing display shelf
						else if (type === 11) category = "storage"; // manufacturing storage shelf
						else category = "storage"; // fallback
					} else {
						return;
					}

					const x = parseUnityFloat(parts[2]);
					const y = parseUnityFloat(parts[3]);
					const z = parseUnityFloat(parts[4]);
					const rot = parseUnityFloat(parts[5]);

					// Get dimensions from DIMENSION_DB
					const { width, length } = getDimensions(category, subType);

					// Get slots content
					let slots: ShelfProductSlot[] = [];
					if (keyCategory === "prop") {
						slots = shelfProducts.get(index) || [];
					} else if (keyCategory === "mprop") {
						slots = storageProducts.get(index) || [];
					}

					list.push({
						key,
						category,
						type,
						subType,
						x,
						y,
						z,
						rot,
						width,
						length,
						slots,
					});
				}
			}
		});

		// Deduplicate overlapping props of the same category within 0.5m distance (e.g. stacked checkouts/shelves)
		const uniqueList: VisualProp[] = [];

		list.forEach(prop => {
			const isDuplicate = uniqueList.some(uprop => {
				if (prop.category !== uprop.category) return false;
				const dx = prop.x - uprop.x;
				const dz = prop.z - uprop.z;
				return (dx * dx + dz * dz) < 0.25; // 0.5m threshold (0.5^2 = 0.25)
			});

			if (!isDuplicate) {
				uniqueList.push(prop);
			}
		});

		return uniqueList;
	}, [saveJson]);

	// Compute map bounds (fixed to the game's full 60x70 building grid: X in [-22, 38] and Z in [-10, 60], padded for labels)
	const bounds = { minX: -25, maxX: 41, minZ: -15, maxZ: 65 };

	// Center the view on the loaded store layout
	const resetView = useCallback(() => {
		if (!canvasRef.current) return;
		const canvas = canvasRef.current;

		// Scale fitting
		const rangeX = bounds.maxX - bounds.minX;
		const rangeZ = bounds.maxZ - bounds.minZ;
		const scale = Math.min(canvas.width / rangeX, canvas.height / rangeZ) * 0.85;

		setZoom(scale);
		setPanX(canvas.width / 2 - ((bounds.minX + bounds.maxX) / 2) * scale);
		setPanY(canvas.height / 2 + ((bounds.minZ + bounds.maxZ) / 2) * scale); // Invert Z to screen Y
	}, [bounds.maxX, bounds.minX, bounds.maxZ, bounds.minZ]);

	// Trigger auto-fit once loaded
	useEffect(() => {
		if (parsedProps.length > 0) {
			resetView();
		}
	}, [parsedProps, resetView]);

	// Drawing loop
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		drawStoreMap(
			ctx,
			canvas.width,
			canvas.height,
			parsedProps,
			zoom,
			panX,
			panY,
			showShelves,
			showStorage,
			showRegisters,
			hoveredItem,
			selectedItem,
			searchProductId,
		);
	}, [
		parsedProps,
		zoom,
		panX,
		panY,
		showShelves,
		showStorage,
		showRegisters,
		hoveredItem,
		selectedItem,
		searchProductId,
	]);

	// Helper to convert screen coordinates to game coordinates
	const screenToGame = (sx: number, sy: number) => {
		const x = (sx - panX) / zoom;
		const z = -(sy - panY) / zoom; // Inverted Z axis
		return { x, z };
	};

	// Mouse Handlers
	const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
		if (e.button !== 0) return; // Only drag on left click
		setIsDragging(true);
		dragStart.current = { x: e.clientX, y: e.clientY };
	};

	const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		
		// Scale mouse coordinates from CSS/viewport pixels to canvas drawing buffer pixels
		const scaleX = canvas.width / rect.width;
		const scaleY = canvas.height / rect.height;
		const mouseX = (e.clientX - rect.left) * scaleX;
		const mouseY = (e.clientY - rect.top) * scaleY;

		if (isDragging) {
			const dx = e.clientX - dragStart.current.x;
			const dy = e.clientY - dragStart.current.y;
			setPanX((prev) => prev + dx * scaleX);
			setPanY((prev) => prev + dy * scaleY);
			dragStart.current = { x: e.clientX, y: e.clientY };
		} else {
			// Collision detection for hovering
			const gameCoords = screenToGame(mouseX, mouseY);
			let found: VisualProp | null = null;

			// Search in reverse order to hover elements drawn on top first
			for (let i = parsedProps.length - 1; i >= 0; i--) {
				const prop = parsedProps[i];

				// Skip if not visible
				if (prop.category === "shelf" && !showShelves) continue;
				if (prop.category === "storage" && !showStorage) continue;
				if (prop.category === "register" && !showRegisters) continue;

				const isHorizontal = Math.abs(Math.sin((prop.rot * Math.PI) / 180)) > 0.7;
				const w = isHorizontal ? prop.length : prop.width;
				const h = isHorizontal ? prop.width : prop.length;

				// Check bounding box
				if (
					gameCoords.x >= prop.x - w / 2 &&
					gameCoords.x <= prop.x + w / 2 &&
					gameCoords.z >= prop.z - h / 2 &&
					gameCoords.z <= prop.z + h / 2
				) {
					found = prop;
					break;
				}
			}

			if (hoveredItem?.key !== found?.key) {
				setHoveredItem(found);
			}
		}
	};

	const handleMouseUp = () => {
		setIsDragging(false);

		// Trigger select item
		if (hoveredItem) {
			setSelectedItem(hoveredItem);
		} else {
			setSelectedItem(null);
		}
	};

	const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
		e.preventDefault();
		const canvas = canvasRef.current;
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		
		// Scale mouse coordinates from CSS/viewport pixels to canvas drawing buffer pixels
		const scaleX = canvas.width / rect.width;
		const scaleY = canvas.height / rect.height;
		const mouseX = (e.clientX - rect.left) * scaleX;
		const mouseY = (e.clientY - rect.top) * scaleY;

		// Get current game coordinates under mouse cursor
		const gameCoords = screenToGame(mouseX, mouseY);

		// Zoom multiplier
		const factor = e.deltaY < 0 ? 1.15 : 0.85;
		const nextZoom = Math.max(1.5, Math.min(60, zoom * factor));

		setZoom(nextZoom);
		// Readjust pan so the cursor stays in the same game position after zoom
		setPanX(mouseX - gameCoords.x * nextZoom);
		setPanY(mouseY + gameCoords.z * nextZoom);
	};

	const handleZoomBtn = (factor: number) => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const mouseX = canvas.width / 2;
		const mouseY = canvas.height / 2;
		const gameCoords = screenToGame(mouseX, mouseY);
		const nextZoom = Math.max(1.5, Math.min(60, zoom * factor));
		setZoom(nextZoom);
		setPanX(mouseX - gameCoords.x * nextZoom);
		setPanY(mouseY + gameCoords.z * nextZoom);
	};

	return (
		<div className="w-full flex flex-col gap-4 font-mono text-xs">
			{/* Search and control bar */}
			<ControlBar
				searchProductId={searchProductId}
				setSearchProductId={setSearchProductId}
				showShelves={showShelves}
				setShowShelves={setShowShelves}
				showStorage={showStorage}
				setShowStorage={setShowStorage}
				showRegisters={showRegisters}
				setShowRegisters={setShowRegisters}
				shelvesCount={parsedProps.filter((p) => p.category === "shelf").length}
				storageCount={parsedProps.filter((p) => p.category === "storage").length}
				registersCount={parsedProps.filter((p) => p.category === "register").length}
			/>

			<div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
				{/* Canvas Visualizer Window */}
				<div className="lg:col-span-3 relative bg-zinc-900 border border-off-white/10 h-[500px] overflow-hidden select-none">
					<canvas
						ref={canvasRef}
						width={700}
						height={500}
						className="w-full h-full cursor-grab active:cursor-grabbing"
						onMouseDown={handleMouseDown}
						onMouseMove={handleMouseMove}
						onMouseUp={handleMouseUp}
						onWheel={handleWheel}
					/>

					{/* Interactive controls overlaid on canvas */}
					<div className="absolute bottom-4 left-4 flex gap-1 bg-bg-card border border-off-white/10 p-1">
						<button
							onClick={() => handleZoomBtn(1.2)}
							className="p-1.5 hover:bg-off-white/10 text-off-white cursor-pointer"
							title="Zoom In"
						>
							<Plus size={14} />
						</button>
						<button
							onClick={() => handleZoomBtn(0.8)}
							className="p-1.5 hover:bg-off-white/10 text-off-white cursor-pointer"
							title="Zoom Out"
						>
							<Minus size={14} />
						</button>
						<button
							onClick={resetView}
							className="p-1.5 hover:bg-off-white/10 text-off-white cursor-pointer"
							title="Recenter Map"
						>
							<ArrowCounterClockwise size={14} />
						</button>
					</div>

					{/* Floating Live Hover Tooltip */}
					{hoveredItem && (
						<div className="absolute top-4 left-4 bg-bg-card/95 border border-off-white/15 px-3 py-2 text-[10px] space-y-1 shadow-lg max-w-xs pointer-events-none">
							<div className="font-extrabold uppercase text-terminal-amber">
								{hoveredItem.category === "shelf"
									? "🏪 Display Shelf"
									: hoveredItem.category === "storage"
										? "📦 Storage Rack"
										: hoveredItem.category === "manufacturing"
											? "⚙️ Manufacturing"
											: hoveredItem.category === "market"
												? "⚖️ Special Market"
												: "🏪 Cash Register"}
							</div>
							<div className="text-off-white/60">
								Grid:{" "}
								<span className="text-terminal-amber font-bold">
									{getGridCoord(hoveredItem.x, hoveredItem.z)}
								</span>
							</div>
							<div className="text-off-white/60">
								Index: <span className="text-off-white">{hoveredItem.key}</span>
							</div>
							<div className="text-off-white/60">
								Coords:{" "}
								<span className="text-off-white">
									X:{hoveredItem.x.toFixed(2)}, Z:{hoveredItem.z.toFixed(2)}
								</span>
							</div>
							{hoveredItem.slots.length > 0 && (
								<div className="border-t border-off-white/10 pt-1 mt-1">
									<div className="font-semibold text-off-white">Stock Allocation:</div>
									{hoveredItem.slots.map((slot, sidx) => (
										<div
											key={sidx}
											className={slot.productId > 0 ? "text-led-green" : "text-off-white/30"}
										>
											Slot #{sidx + 1}:{" "}
											{slot.productId > 0
												? `Prod #${slot.productId} (${slot.quantity} qty)`
												: "Empty"}
										</div>
									))}
								</div>
							)}
						</div>
					)}
				</div>

				{/* Selected Item Sidebar Panel */}
				<InspectionPanel selectedItem={selectedItem} />
			</div>
		</div>
	);
};

