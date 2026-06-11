# Supermarket Together Save Editor & Planogram Layout Planner

[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind--v4.0-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

A premium, data-driven, client-side web utility to edit save files and visually plan store layouts for the game **Supermarket Together**. Decrypt game saves, adjust store financials, max out employees, manage product licenses, and organize your store layout with an interactive visualizer and smart planogram recommendation engine.

---

## ✨ Features

- 🔐 **Secure Save Cryptography**: Decrypt, parse, and re-encrypt standard Unity Easy Save 3 (`.es3`) files completely client-side in your browser.
- 💵 **Financials Manager**: Instantly modify store funds, franchise level, experience points, store size, and difficulty tiers.
- 👥 **Employee Editor**: Adjust salary rates, individual skill stars (Cashier/Restock speeds, bag capacity, security, etc.), and max out statistics with one click. Generates lore-friendly random employee names.
- 📜 **Licenses & Recipes Tab**: Unlock product tiers (0–55) and manufacturing recipe structures (oven, salad bar) individually or in bulk.
- 🗺️ **2D Interactive Store Visualizer**: Renders an interactive 2D canvas grid of your supermarket storefront. View coordinates, detect shelf overlaps, click to inspect shelving slots, and search for specific product placements.
- 📊 **Smart Planogram Engine**: Automatically groups similar products (Beverages, Chilled Meats, Seafood, Dairy, Sweets) on your placed storefront shelves and lists rotational backup recommendations.

---

## 📂 Game Save Locations

Your game save files are typically stored in the following directory:

```plaintext
%UserProfile%\AppData\LocalLow\Sorendg\Supermarket Together\
```

Look for files named `StoreFile0.es3`, `StoreFile1.es3`, or `AutoSaveX.es3`. Make sure to **create a backup copy** of your saves before editing them.

---

## 🛠️ Development & Local Execution

This project is built using modern web standards. To run this project locally, ensure you have [Node.js](https://nodejs.org/) installed, then follow these steps:

### 1. Clone the Repository

```bash
git clone https://github.com/ralfarishi/supermarket-together-save-editor.git
cd supermarket-together-save-editor
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Run the Development Server

```bash
pnpm run dev
```

### 4. Build for Production

```bash
pnpm run build
```

---

## 🔒 Privacy & Safety

- **100% Client-Side Processing**: Decryption, save editing, and file rebuilding happen entirely in your browser.
- **No Telemetry**: No save file data, names, coordinates, or statistics are uploaded to external servers.
- **Save Integrity**: Easy Save 3 cryptographic standards are fully respected during re-serialization to avoid corrupted files.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
