/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { decryptSave, encryptSave, serializeEasySave3 } from "./utils/crypto-manager";
import {
	extractSaveFields,
	updateSaveFields,
	parseShelves,
	executeRestock,
} from "./utils/save-parser";
import type { SaveDataFields, ShelfData } from "./utils/save-parser";
import { ScannerTerminal } from "./components/ScannerTerminal";
import { SaveDashboard } from "./components/SaveDashboard";
import { ToastNotification } from "./components/ToastNotification";
import type { ToastMessage } from "./components/ToastNotification";
import { CustomModal } from "./components/CustomModal";
import {
	Barcode,
	Trash,
	HardDrive,
	SpeakerHigh,
	SpeakerSlash,
	GithubLogo,
	Warning,
} from "@phosphor-icons/react";

function App() {
	const [fileName, setFileName] = useState<string | null>(null);
	const [saveJson, setSaveJson] = useState<any | null>(null);
	const [originalFields, setOriginalFields] = useState<SaveDataFields | null>(null);
	const [shelves, setShelves] = useState<ShelfData[]>([]);
	const [isGzipped, setIsGzipped] = useState<boolean>(false);
	const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
	const [theme, setTheme] = useState<"receipt" | "mint" | "vintage" | "lcd">("receipt");

	// Animations & effects states
	const [isScanning, setIsScanning] = useState(false);
	const [isPrinting, setIsPrinting] = useState(false);

	useEffect(() => {
		document.documentElement.setAttribute("data-theme", theme);
	}, [theme]);

	// Notifications
	const [toasts, setToasts] = useState<ToastMessage[]>([]);
	const [modal, setModal] = useState<{
		isOpen: boolean;
		title: string;
		description: string;
		onConfirm: () => void;
		severity?: "warning" | "error" | "info";
	}>({
		isOpen: false,
		title: "",
		description: "",
		onConfirm: () => {},
	});

	// Toast helpers
	const addToast = (type: "success" | "error" | "info", text: string) => {
		const id = Math.random().toString(36).substring(2, 9);
		setToasts((prev) => [...prev, { id, type, text }]);
	};

	const removeToast = (id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	};

	// Synthetic beep sound (Checkout aesthetic)
	const playCheckoutBeep = () => {
		if (!isAudioEnabled) return;
		try {
			const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();

			osc.type = "sine";
			osc.frequency.setValueAtTime(1000, ctx.currentTime);
			gain.gain.setValueAtTime(0.08, ctx.currentTime);
			gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);

			osc.connect(gain);
			gain.connect(ctx.destination);

			osc.start();
			osc.stop(ctx.currentTime + 0.12);
		} catch (e) {
			console.warn("AudioContext failed", e);
		}
	};

	// Restock success double beep
	const playRestockBeep = () => {
		if (!isAudioEnabled) return;
		try {
			const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
			const playTone = (freq: number, start: number, duration: number) => {
				const osc = ctx.createOscillator();
				const gain = ctx.createGain();
				osc.type = "sine";
				osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
				gain.gain.setValueAtTime(0.05, ctx.currentTime + start);
				gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
				osc.connect(gain);
				gain.connect(ctx.destination);
				osc.start(ctx.currentTime + start);
				osc.stop(ctx.currentTime + start + duration);
			};
			playTone(880, 0, 0.08);
			playTone(1320, 0.1, 0.12);
		} catch {
			// ignore
		}
	};

	// File loading logic
	const handleFileLoaded = async (file: File) => {
		setIsScanning(true);
		setFileName(file.name);

		try {
			const arrayBuffer = await file.arrayBuffer();
			let decryptedText = "";

			// Check if file is already plain text (some users decrypt it beforehand)
			const isPlaintext = file.name.toLowerCase().endsWith(".txt");

			if (isPlaintext) {
				const decoder = new TextDecoder("utf-8");
				decryptedText = decoder.decode(arrayBuffer);

				// Check if it's formatted in ES3 raw style and sanitize it
				decryptedText = decryptedText.replace(
					/("__type"\s*:\s*"([^"]+)")\s*(true|false|[-+\d.eE]+|""|"[^"]*")/g,
					'$1, "value" : $3',
				);
				setIsGzipped(false);
			} else {
				// Decrypt using Web Crypto
				const result = await decryptSave(arrayBuffer);
				decryptedText = result.plaintext;
				setIsGzipped(result.wasGzipped);
			}

			// Parse JSON
			const parsedJson = JSON.parse(decryptedText);
			const fields = extractSaveFields(parsedJson);
			const parsedShelves = parseShelves(parsedJson);

			// Trigger success state
			setSaveJson(parsedJson);
			setOriginalFields(fields);
			setShelves(parsedShelves);

			// Checkout scanner visual & sound micro-interactions
			playCheckoutBeep();
			addToast("success", `SCAN COMPLETE: ${file.name.toUpperCase()} PARSED SUCCESSFULLY.`);
		} catch (err: any) {
			console.error(err);
			addToast("error", "DECRYPTION / PARSING FAILED. FILE CORRUPT OR INCORRECT PASSWORD KEY.");
			setFileName(null);
		} finally {
			// Keep scan laser animation visible for 600ms for tactile feedback
			setTimeout(() => {
				setIsScanning(false);
			}, 600);
		}
	};

	// One-Click Restock Shift Action
	const handleRestockShift = () => {
		if (!saveJson || shelves.length === 0) return null;

		const currentJson = JSON.parse(JSON.stringify(saveJson));
		const shifted = executeRestock(currentJson, shelves);

		if (shifted > 0) {
			setSaveJson(currentJson);
			// Re-parse shelves
			const updatedShelves = parseShelves(currentJson);
			setShelves(updatedShelves);

			playRestockBeep();
			addToast("success", `SHIFT CONVEYOR COMPLETE: ${shifted} PRODUCT SLOTS RESTOCKED.`);
			return { shiftedCount: shifted, updatedShelves };
		} else {
			addToast("info", "RESTOCK ACTION SKIPPED: NO EMPTY SLOTS FOUND OR ALL STOCK ALREADY PLACED.");
			return null;
		}
	};

	// Export and Save Action
	const handleSaveFields = async (editedFields: SaveDataFields) => {
		if (!saveJson) return;

		try {
			setIsPrinting(true);
			// Play a quick synth printing buzz sound
			if (isAudioEnabled) {
				try {
					const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
					const osc = ctx.createOscillator();
					const gain = ctx.createGain();
					osc.type = "triangle";
					osc.frequency.setValueAtTime(120, ctx.currentTime);
					gain.gain.setValueAtTime(0.06, ctx.currentTime);
					// Print buzz micro-vibrato
					for (let t = 0; t < 0.6; t += 0.05) {
						osc.frequency.setValueAtTime(t % 0.1 < 0.05 ? 140 : 100, ctx.currentTime + t);
					}
					gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
					osc.connect(gain);
					gain.connect(ctx.destination);
					osc.start();
					osc.stop(ctx.currentTime + 0.6);
				} catch {
					// ignore
				}
			}

			const finalJson = JSON.parse(JSON.stringify(saveJson));
			updateSaveFields(finalJson, editedFields);

			// Serialize into the exact custom Easy Save 3 JSON notation
			const serializedText = serializeEasySave3(finalJson);

			// Encrypt back to ArrayBuffer using Web Crypto API
			const encryptedBuffer = await encryptSave(serializedText, isGzipped);

			// Hold animation active for 800ms
			await new Promise((resolve) => setTimeout(resolve, 800));

			// Download file helper
			const blob = new Blob([encryptedBuffer], { type: "application/octet-stream" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = fileName || "StoreFile0.es3";
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);

			playCheckoutBeep();
			addToast("success", "EXPORT COMPLETED. SECURE FILE GENERATED.");
		} catch (err: any) {
			console.error(err);
			addToast("error", "ENCRYPTION / EXPORT WRITING FAILED.");
		} finally {
			setIsPrinting(false);
		}
	};

	const handleExportJson = (editedFields: SaveDataFields) => {
		if (!saveJson) return;

		try {
			setIsPrinting(true);
			const finalJson = JSON.parse(JSON.stringify(saveJson));
			updateSaveFields(finalJson, editedFields);

			// Format the JSON nicely for easy readability in external editors
			const jsonString = JSON.stringify(finalJson, null, 2);

			// Download file helper
			const blob = new Blob([jsonString], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			// Replace extension with .json or append it
			const baseName = fileName ? fileName.replace(/\.[^/.]+$/, "") : "StoreFile0";
			a.download = `${baseName}-decrypted.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);

			if (isAudioEnabled) {
				try {
					playCheckoutBeep();
				} catch {
					// ignore
				}
			}
			addToast("success", "JSON EXPORT COMPLETE. READABLE JSON GENERATED.");
		} catch (err: any) {
			console.error(err);
			addToast("error", "JSON EXPORT FAILED.");
		} finally {
			setIsPrinting(false);
		}
	};

	// Discard Session / Unload File
	const handleUnloadSession = () => {
		setModal({
			isOpen: true,
			title: "DISCARD SESSION",
			description:
				"ARE YOU SURE YOU WANT TO CLEAR THE CURRENT SCAN AND DISCARD ALL MODIFICATIONS? THIS CANNOT BE UNDONE.",
			severity: "warning",
			onConfirm: () => {
				setFileName(null);
				setSaveJson(null);
				setOriginalFields(null);
				setShelves([]);
				setModal((prev) => ({ ...prev, isOpen: false }));
				addToast("info", "TERMINAL RESET. READY FOR NEXT SCAN.");
			},
		});
	};

	return (
		<div
			data-theme={theme}
			className={`relative min-h-screen bg-bg-charcoal flex flex-col font-sans text-off-white selection:bg-terminal-amber/20 selection:text-terminal-amber transition-all duration-300 ${!saveJson ? "h-screen overflow-hidden" : ""}`}
		>
			{/* SCANNING LASER EFFECT */}
			{isScanning && (
				<div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-between">
					<div className="w-full h-1.5 bg-laser-red shadow-[0_0_12px_4px_rgba(239,68,68,0.85)] animate-[slide-down_0.6s_ease-in-out_infinite]" />
				</div>
			)}

			{/* HEADER BAR */}
			<header className="bg-bg-card border-b border-off-white/10 px-6 py-4 flex justify-between items-center shadow-md select-none">
				<div className="flex items-center gap-3">
					<div className="p-2 bg-laser-red/10 border border-laser-red text-laser-red">
						<Barcode size={22} className="animate-pulse" />
					</div>
					<div>
						<h1 className="text-sm font-extrabold uppercase tracking-widest leading-none font-mono">
							SUPERMARKET TOGETHER
						</h1>
						<span className="text-[10px] text-terminal-amber font-mono tracking-wider">
							SAVE EDITOR TERMINAL v1.1.0
						</span>
					</div>
				</div>

				<div className="flex items-center gap-3">
					{/* THEME SELECTOR */}
					<div className="flex items-center gap-1.5 font-mono text-[10px]">
						<span className="text-off-white/40 uppercase hidden sm:inline">Theme:</span>
						<select
							value={theme}
							onChange={(e) => setTheme(e.target.value as any)}
							className="px-2 py-1 bg-bg-charcoal border border-off-white/10 text-off-white font-bold uppercase cursor-pointer outline-none focus:border-terminal-amber transition-all"
						>
							<option value="receipt">Slip Paper</option>
							<option value="mint">Sage Bag</option>
							<option value="vintage">NCR Retro</option>
							<option value="lcd">CRT LCD</option>
						</select>
					</div>

					<a
						href="https://github.com/your-username/supermarket-together-save-editor"
						target="_blank"
						rel="noopener noreferrer"
						className="p-2 border border-off-white/10 hover:bg-off-white/5 text-off-white transition-all flex items-center justify-center"
						title="View GitHub Repository"
					>
						<GithubLogo size={18} />
					</a>

					<button
						onClick={() => setIsAudioEnabled(!isAudioEnabled)}
						className="p-2 border border-off-white/10 hover:bg-off-white/5 text-off-white cursor-pointer transition-all flex items-center justify-center"
						title={isAudioEnabled ? "Mute sound effects" : "Unmute sound effects"}
					>
						{isAudioEnabled ? (
							<SpeakerHigh size={18} />
						) : (
							<SpeakerSlash size={18} className="text-laser-red" />
						)}
					</button>

					{fileName && (
						<button
							onClick={handleUnloadSession}
							className="flex items-center gap-1.5 px-3 py-1.5 border border-laser-red/40 hover:bg-laser-red/10 text-laser-red font-mono text-[10px] uppercase font-bold transition-all cursor-pointer"
							title="Reset Terminal Session"
						>
							<Trash size={14} />
							<span>UNLOAD FILE</span>
						</button>
					)}
				</div>
			</header>

			{/* MAIN CONTAINER */}
			<main
				className={`flex-1 w-full max-w-5xl mx-auto px-6 flex flex-col justify-center items-center transition-all duration-300 ${!saveJson ? "py-4 gap-4" : "py-6 gap-6"}`}
			>
				{!saveJson ? (
					// SCANNER PANEL (FILE DROP)
					<div className="w-full flex flex-col gap-4 items-center">
						<div className="text-center max-w-lg space-y-1">
							<h2 className="text-lg font-bold uppercase tracking-wider text-off-white">
								Cash Register Scanner
							</h2>
							<p className="text-[11px] text-off-white/50 uppercase leading-normal font-mono">
								Scan your encrypted store save file (`StoreFile0.es3`) to unpack funds, franchise
								statistics, shelf coordinates, and unlock premium product licenses.
							</p>
						</div>
						<ScannerTerminal
							onFileLoaded={handleFileLoaded}
							onError={(msg) => addToast("error", msg)}
						/>

						<div className="max-w-lg w-full border p-4 font-mono text-xs text-laser-red space-y-1 mt-2 animate-warning-pulse">
							<div className="font-extrabold uppercase flex items-center gap-1.5">
								<Warning size={14} className="flex-shrink-0" />
								<span>SYSTEM NOTICE & DISCLAIMER</span>
							</div>
							<p className="text-[10px] uppercase leading-normal opacity-90">
								Data collected based on the developer's personal data and game save files. 
								If there is a discrepancy, it means I am not using that property (e.g., shelf type, cashier, or other property).
							</p>
						</div>
					</div>
				) : (
					// DASHBOARD CONTROLLER (TABS)
					originalFields && (
						<SaveDashboard
							originalFields={originalFields}
							shelves={shelves}
							onSave={handleSaveFields}
							onExportJson={handleExportJson}
							onRestock={handleRestockShift}
							saveJson={saveJson}
						/>
					)
				)}
			</main>

			{/* FOOTER */}
			<footer className="bg-bg-card border-t border-off-white/5 py-4 px-6 text-center font-mono text-[10px] text-off-white/20 select-none flex justify-between items-center">
				<span className="uppercase flex items-center gap-1">
					<HardDrive size={12} /> HOSTED CLIENT-SIDE // NO SERVER UPLOADS
				</span>
				<span className="uppercase flex items-center gap-3">
					<span>
						DEVELOPED BY{" "}
						<a
							href="https://alfarishi.my.id"
							target="_blank"
							rel="noopener noreferrer"
							className="text-off-white/40 hover:text-off-white underline decoration-dashed"
						>
							ralfarishi
						</a>
					</span>
					<span>•</span>
					<span>UNITY EASY SAVE 3 CRYPTOGRAPHIC INTEGRITY</span>
				</span>
			</footer>

			{/* TOAST SYSTEM CONTAINER */}
			<div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
				{toasts.map((toast) => (
					<ToastNotification key={toast.id} toast={toast} onClose={removeToast} />
				))}
			</div>

			{/* SYSTEM CONFIRMATION MODAL OVERLAYS */}
			<CustomModal
				isOpen={modal.isOpen}
				title={modal.title}
				description={modal.description}
				severity={modal.severity}
				onConfirm={modal.onConfirm}
				onCancel={() => setModal((prev) => ({ ...prev, isOpen: false }))}
			/>

			{/* RECEIPT PRINTING OVERLAY */}
			{isPrinting && (
				<div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-4">
					<div className="bg-bg-card border border-off-white/10 p-6 max-w-sm w-full font-mono text-center space-y-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.6)] animate-print-roll">
						<div className="w-12 h-1 bg-off-white/10 mx-auto rounded-none" />
						<div className="border-t-2 border-b-2 border-dashed border-off-white/30 py-4 my-2 text-off-white">
							<span className="text-xs font-extrabold uppercase tracking-widest block animate-pulse">
								*** PRINTING RECEIPT ***
							</span>
							<span className="text-[10px] text-off-white/50 block mt-1">
								COMPILING RE-ENTRY PAYLOAD...
							</span>
						</div>
						<div className="flex justify-center items-center gap-1.5 text-led-green text-xs font-bold uppercase">
							<Barcode size={24} className="animate-bounce" />
							<span>WRITING EASY SAVE 3 FILE</span>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default App;

