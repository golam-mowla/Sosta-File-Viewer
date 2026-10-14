# Sosta File Viewer 🚀

A lightning-fast, lightweight universal file explorer & document viewer crafted with **Rust**, **Tauri 2**, and **TypeScript + React**.

---

## 🛠️ Tech Stack

- **Rust** — Core engine for high performance directory scanning, fast file operations, metadata extraction, hex chunk streaming, and PSD header parsing.
- **Tauri 2** — Modern, lightweight desktop framework with secure IPC, tiny memory footprint, and native OS integration.
- **TypeScript + React** — Sleek dark-mode desktop UI featuring multi-tab browsing, interactive breadcrumbs, context menus, drag-and-drop, and real-time previews.

---

## ✨ Features

### 📁 File Management
- **Operations:** Open, select multiple, copy (Ctrl+C), cut (Ctrl+X), paste (Ctrl+V), move, rename (F2), delete (Del), duplicate (Ctrl+D).
- **Drag & Drop:** Drag files or folders directly into target directories.
- **In-place Rename:** Quick inline filename editing with keyboard confirm/cancel.

### 🧭 Navigation
- **Address Bar & Breadcrumbs:** Interactive breadcrumb navigation with clickable directory segments and direct path input.
- **Back / Forward / Up:** Complete directory history navigation.
- **Multi-Tab System:** Independent tabs with separate paths, history, view modes, and search states.
- **Sidebar:** Quick Access / Favorites, Drives & Storage, and expandable Folder Tree.

### 👁️ Universal Preview
- **PDF Viewer:** Embedded PDF presentation with page switching, zoom in/out, and document metadata.
- **Image Viewer:** PNG, JPG, WebP, SVG, GIF with zoom, 90° rotation, and fit-to-screen controls.
- **Code & Text:** Syntax highlighted code viewer with line numbers, copy button, and line count for Rust, TypeScript, JavaScript, Python, SQL, CSS, HTML, etc.
- **Markdown:** Live formatted renderer for headers, bullet points, blockquotes, code blocks, or raw view.
- **JSON Inspector:** Interactive collapsible tree view with type-colored values (strings, numbers, booleans) and formatted raw mode.
- **Office Documents:**
  - **XLSX Spreadsheets:** Tabular grid with numbered rows, columns, sheet switcher, and cell search.
  - **DOCX Word Documents:** Formatted document layout and executive summaries.
- **PSD (Photoshop):** Dedicated Adobe PSD inspector extracting 8BPS header signature, dimensions, color modes (RGB, CMYK, etc.), bit depth, and layer breakdowns.
- **Media Player:** Audio waveform visualizer and video player with full playback controls.

### ⚡ Productivity & Advanced
- **Hex Viewer:** Low-level hexadecimal inspector with byte offsets, 16 hex columns, ASCII decoding, and jump-to-offset navigation.
- **Archive Browser:** Inspect ZIP archive contents, folder structures, and compression ratios without unpacking.
- **Instant Search & Filters:** Real-time query search and category filters (Documents, Images, Code, Media, Archives).
- **File Properties & Integrity:** Detailed file properties modal with SHA-256 checksum calculation.
- **Keyboard Shortcuts:** Full suite of shortcuts (Space for preview, F2 for rename, Ctrl+F for search, etc.).

---

## 🚀 Getting Started

### 1. Web Preview Mode (Instant)
```bash
npm run dev
```
Open [http://localhost:1420](http://localhost:1420) in your browser. The app runs with the high-fidelity virtual filesystem and supports opening local disk folders via the browser's Directory Picker API.

### 2. Desktop Mode (Tauri 2 + Rust)
Make sure Rust and the C++ build tools are installed on your machine, then run:
```bash
npm run tauri dev
```

### 3. Build Production Executable
```bash
npm run tauri build
```
The compiled standalone binary installer (`.msi` / `.exe`) will be generated in `src-tauri/target/release/bundle/`.
