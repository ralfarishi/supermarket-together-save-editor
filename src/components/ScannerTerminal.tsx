import React, { useState, useRef } from "react";
import { UploadSimple, FileCode, Warning } from "@phosphor-icons/react";

interface ScannerTerminalProps {
	onFileLoaded: (file: File) => void;
	onError: (msg: string) => void;
}

export const ScannerTerminal: React.FC<ScannerTerminalProps> = ({ onFileLoaded, onError }) => {
	const [isDragActive, setIsDragActive] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleDrag = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setIsDragActive(true);
		} else if (e.type === "dragleave") {
			setIsDragActive(false);
		}
	};

	const processFile = (file: File) => {
		const name = file.name.toLowerCase();
		if (!name.endsWith(".es3") && !name.endsWith(".txt")) {
			onError(
				"INVALID FILE TYPE. PLEASE SCAN AN EASY SAVE 3 FILE (*.ES3) OR DECRYPTED TEXT (*.TXT).",
			);
			return;
		}
		onFileLoaded(file);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragActive(false);

		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			processFile(e.dataTransfer.files[0]);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		if (e.target.files && e.target.files[0]) {
			processFile(e.target.files[0]);
		}
	};

	const triggerInput = () => {
		fileInputRef.current?.click();
	};

	return (
		<div className="w-full max-w-xl mx-auto flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-6 duration-300">
			<div
				onDragEnter={handleDrag}
				onDragOver={handleDrag}
				onDragLeave={handleDrag}
				onDrop={handleDrop}
				onClick={triggerInput}
				className={`relative overflow-hidden cursor-pointer flex flex-col items-center justify-center border-2 border-dashed p-4 h-44 bg-bg-card font-mono text-center transition-all duration-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.5)] ${
					isDragActive
						? "border-laser-red bg-laser-red/5 scale-[0.99]"
						: "border-terminal-amber/40 hover:border-terminal-amber hover:bg-white/[0.01]"
				}`}
			>
				<input
					ref={fileInputRef}
					type="file"
					className="hidden"
					accept=".es3,.txt"
					onChange={handleChange}
				/>

				{/* Laser Scanner animation line */}
				{isDragActive && (
					<div className="absolute left-0 right-0 h-1 bg-laser-red shadow-[0_0_8px_2px_rgba(239,68,68,0.8)] animate-bounce" />
				)}

				<div className="flex flex-col items-center gap-3">
					<div className="p-2.5 bg-bg-charcoal border border-off-white/10 rounded-none text-terminal-amber">
						<UploadSimple
							size={28}
							className={isDragActive ? "animate-pulse text-laser-red" : ""}
						/>
					</div>

					<div className="space-y-0.5">
						<p className="text-sm font-bold uppercase tracking-wider text-off-white">
							PLACE SAVE FILE ON CONVEYOR BELT
						</p>
						<p className="text-[10px] text-off-white/40 uppercase font-bold">
							DRAG & DROP OR CLICK TO SCAN FILE (StoreFile0.es3)
						</p>
					</div>
				</div>

				{/* Barcode graphic lines at the bottom for checkout theme */}
				<div className="absolute bottom-2 left-6 right-6 flex justify-between h-3 opacity-10">
					{[1, 2, 4, 1, 3, 1, 2, 1, 4, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 4].map((width, idx) => (
						<div key={idx} className="bg-off-white h-full" style={{ width: `${width * 3}px` }} />
					))}
				</div>
			</div>

			{/* Path Helper Details */}
			<div className="p-2.5 bg-bg-card border border-off-white/5 font-mono text-left space-y-1.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.4)]">
				<div className="flex items-center gap-2 text-xs font-bold text-terminal-amber uppercase">
					<FileCode size={14} />
					<span>Save File Directory Path</span>
				</div>
				<code className="block p-1.5 bg-bg-charcoal text-off-white/80 text-[11px] break-all border border-off-white/10 select-all font-mono">
					%USERPROFILE%\AppData\LocalLow\DDTNL\SupermarketTogether\
				</code>
				<p className="text-[10px] text-off-white/40 leading-normal uppercase">
					Copy the line above, paste it in File Explorer address bar, and press Enter to locate your
					save file (`StoreFile0.es3`).
				</p>

				<div className="flex items-start gap-2 pt-1.5 border-t border-off-white/5 text-[10px] text-warning-brass">
					<Warning size={12} className="mt-0.5 flex-shrink-0" />
					<p className="uppercase leading-tight">
						Backup your save file before making edits. Any changes are processed fully on your
						browser.
					</p>
				</div>
			</div>
		</div>
	);
};

