# CPU Scheduling Workstation — Enterprise OS Suite

An advanced desktop-grade, interactive **Enterprise CPU Scheduling Workstation** designed for Operating System algorithm visualization, live execution simulation, system monitoring, and performance benchmarking. Built purely with HTML5, Vanilla CSS3, and ES6+ JavaScript, with Chart.js analytics integration — requiring zero heavy frameworks or build steps.

---

## 🌟 Key Features & Architecture

- **Supported Scheduling Policies (6 Core Algorithms)**:
  1. **FCFS** (First-Come, First-Served — Non-Preemptive)
  2. **SJF** (Shortest Job First — Non-Preemptive)
  3. **SRTF** (Shortest Remaining Time First — Preemptive SJF)
  4. **Priority Non-Preemptive** (Lower # = Higher Priority Rank)
  5. **Priority Preemptive** (Preemptive by Priority Rank)
  6. **Round Robin** (Preemptive Time Slicing with Time Quantum)

- **9 Interactive Views**:
  1. **Dashboard** (`#dashboard`) — Live System Status Monitor, Dual CPU Core status, Ready Queue flow visualizer, 10 KPI stat counters, and Mini-Gantt preview.
  2. **Algorithms** (`#algorithm`) — 6 Policy selection cards, Time Quantum box, and algorithm advantages/disadvantages info panel.
  3. **Process Manager** (`#process-manager`) — Live Search PID, Priority & State filters, Remaining Time tracking, state badges (`Ready`, `Running`, `Completed`), and preset loader.
  4. **Simulation Engine** (`#simulation`) — Step-by-step player controls (Play, Pause, Step Forward, Reset) with speed selectors (`0.5x`, `1x`, `2x`, `4x`).
  5. **Results & Metrics** (`#results`) — Per-process metrics table (AT, BT, Priority, CT, TAT, WT, RT), KPI statistics, and CSV/Excel/PDF exporters.
  6. **Gantt Chart** (`#gantt`) — Visual clock timeline with scale grow-in animations, process color legend, idle period indicators, and tooltip hover details.
  7. **Performance Analytics** (`#analytics`) — Chart.js interactive charts evaluating CPU Utilization, Waiting/Turnaround breakdown, Throughput, and Context Switches.
  8. **Comparison Matrix** (`#comparison`) — Side-by-side performance evaluation benchmark table comparing all 6 algorithms on the active dataset with optimal rating badge.
  9. **About & Viva Guide** (`#about`) — Theoretical quick-reference formulas, trade-offs, and Top 15 Operating Systems Viva & Interview Q&A.

- **Theme Engine & Particle System**:
  - Translucent glassmorphism cards (`backdrop-filter: blur(16px)`).
  - 5 Multi-Theme Accent Modes: `🌌 Dark Futuristic` (Default), `⚡ Cyber Neon`, `🟢 Emerald OS`, `🔮 Violet Core`, and `☀️ Light Slate`.
  - Non-intrusive Toast Notification alert system (`ToastManager`).

---

## 📂 Folder Structure

```
CPU-Scheduling-Simulator/
│── index.html    # Multi-view HTML5 router structure & component layouts
│── style.css     # CSS variable design tokens, multi-theme styles, glassmorphism & keyframe animations
│── script.js     # Scheduling Engine (6 algorithms), Step player timer, Chart.js analytics & state store
└── README.md     # Comprehensive project documentation
```

---

## 🚀 How to Run

1. Open [index.html](file:///d:/mdm/CPU-Scheduling-Simulator/index.html) directly in any modern web browser (Google Chrome, Firefox, Microsoft Edge, Safari).
2. No Node.js server or npm build steps required!
