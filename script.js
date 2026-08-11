/**
 * ==========================================================================
 * CPU SCHEDULING WORKSTATION — MAIN ENTERPRISE ENGINE
 * Vanilla ES6+ JavaScript engine implementation of 6 CPU scheduling algorithms,
 * real-time step simulation timer, live system monitor, Chart.js analytics,
 * particle animation background, hash view router, & DOM renderer.
 * ==========================================================================
 */

'use strict';

/* ==========================================================================
   1. CANVAS PARTICLE SYSTEM
   ========================================================================== */
class ParticleBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 40;
        this.animationFrameId = null;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.createParticles();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 2 + 1,
                vx: (Math.random() - 0.5) * 0.35,
                vy: (Math.random() - 0.5) * 0.35,
                alpha: Math.random() * 0.45 + 0.1
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const currentTheme = document.documentElement.getAttribute('data-theme');
        const isDark = currentTheme !== 'light';
        const color = isDark ? '59, 130, 246' : '37, 99, 235';

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${color}, ${p.alpha})`;
            this.ctx.fill();
        }

        this.animationFrameId = requestAnimationFrame(() => this.animate());
    }
}

/* ==========================================================================
   2. TOAST NOTIFICATION SYSTEM
   ========================================================================== */
class ToastManager {
    static show(message, type = 'info', duration = 2200) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        // Clear existing toasts for a clean uncluttered screen
        container.innerHTML = '';

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = `ℹ️`;
        if (type === 'success') icon = `✓`;
        if (type === 'warning') icon = `⚠️`;
        if (type === 'danger') icon = `✕`;

        toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }, duration);
    }
}


/* ==========================================================================
   3. PURE CPU SCHEDULING ALGORITHM ENGINE (6 POLICIES)
   ========================================================================== */
class SchedulingEngine {
    static getAlgorithmMeta(algoKey) {
        const meta = {
            fcfs: {
                name: "First-Come, First-Served (FCFS)",
                type: "Non-Preemptive",
                badgeClass: "tag-non-preemptive",
                description: "Processes are dispatched strictly according to their arrival time in the ready queue. The process that arrives first gets executed first until completion.",
                advantages: ["Simple and easy to understand/implement", "No starvation (every process executes)"],
                disadvantages: ["High Average Waiting Time (Convoy Effect)", "Poor performance for interactive time-sharing systems"],
                complexity: "O(N log N) — due to sorting by arrival time",
                useCases: "Batch processing systems where response time is not critical"
            },
            sjf: {
                name: "Shortest Job First (SJF)",
                type: "Non-Preemptive",
                badgeClass: "tag-non-preemptive",
                description: "Selects the process with the shortest burst time among all arrived processes. Non-preemptive execution ensures selected process runs to completion.",
                advantages: ["Provably optimal for minimum average waiting time", "Maximizes job completion rate"],
                disadvantages: ["Starvation for long CPU-bound processes", "Requires knowing/estimating burst times in advance"],
                complexity: "O(N log N) — queue selection sorting",
                useCases: "Long-term batch scheduling where job durations are pre-estimated"
            },
            srtf: {
                name: "Shortest Remaining Time First (SRTF)",
                type: "Preemptive SJF",
                badgeClass: "tag-preemptive",
                description: "Preemptive version of Shortest Job First. At every time tick, the process with the shortest remaining CPU burst time is allocated the core.",
                advantages: ["Extremely low waiting time", "Fast response for short interactive jobs"],
                disadvantages: ["Frequent context switching overhead", "Severe starvation risk for long processes"],
                complexity: "O(N log N) — dynamic remaining burst evaluation",
                useCases: "Interactive operating system schedulers prioritising short tasks"
            },
            priority: {
                name: "Priority Scheduling (Non-Preemptive)",
                type: "Non-Preemptive",
                badgeClass: "tag-non-preemptive",
                description: "Each process is assigned a numerical priority rank (lower number = higher priority). CPU is allocated to the highest priority arrived process.",
                advantages: ["Enforces strict application importance", "Flexible policy customization"],
                disadvantages: ["Starvation of low priority processes", "Requires priority assignment logic"],
                complexity: "O(N log N) — priority queue sorting",
                useCases: "Real-time systems with explicit process urgency rankings"
            },
            priority_p: {
                name: "Priority Scheduling (Preemptive)",
                type: "Preemptive",
                badgeClass: "tag-preemptive",
                description: "Preemptive priority ranking. If a process arrives with higher priority than the currently executing process, CPU is immediately preempted.",
                advantages: ["Instant execution for critical urgent tasks", "High system responsiveness"],
                disadvantages: ["High context switch count", "Potential priority inversion"],
                complexity: "O(N log N) — dynamic priority preemption",
                useCases: "Mission-critical OS kernels and real-time control systems"
            },
            rr: {
                name: "Round Robin (RR)",
                type: "Preemptive Slice",
                badgeClass: "tag-preemptive",
                description: "Allocates a fixed Time Quantum (TQ) slice to each ready process in cyclic FIFO order. If a process does not complete within TQ, it is preempted.",
                advantages: ["Guarantees fair CPU time distribution", "Excellent interactive response time without starvation"],
                disadvantages: ["Performance depends heavily on Time Quantum length", "Higher context switching count"],
                complexity: "O(N) — queue rotation per tick",
                useCases: "Time-sharing interactive desktop and mobile operating systems"
            }
        };
        return meta[algoKey] || meta.fcfs;
    }

    static run(algorithm, processes, timeQuantum = 2) {
        if (!processes || processes.length === 0) {
            return {
                processResults: [],
                ganttChart: [],
                avgWaitingTime: 0,
                avgTurnaroundTime: 0,
                avgResponseTime: 0,
                cpuUtilization: 0,
                throughput: 0,
                contextSwitches: 0,
                totalTime: 0,
                algorithmId: algorithm
            };
        }

        const clonedProcesses = processes.map(p => ({
            id: p.id,
            arrivalTime: Number(p.arrivalTime),
            burstTime: Number(p.burstTime),
            remainingTime: Number(p.burstTime),
            priority: Number(p.priority || 1),
            completionTime: 0,
            turnaroundTime: 0,
            waitingTime: 0,
            responseTime: -1,
            state: 'READY'
        }));

        switch (algorithm) {
            case 'sjf':
                return this.runSJF(clonedProcesses);
            case 'srtf':
                return this.runSRTF(clonedProcesses);
            case 'priority':
                return this.runPriority(clonedProcesses);
            case 'priority_p':
                return this.runPriorityPreemptive(clonedProcesses);
            case 'rr':
                return this.runRoundRobin(clonedProcesses, Math.max(1, Number(timeQuantum)));
            case 'fcfs':
            default:
                return this.runFCFS(clonedProcesses);
        }
    }

    // 1. FCFS Implementation
    static runFCFS(processes) {
        processes.sort((a, b) => a.arrivalTime - b.arrivalTime || a.id.localeCompare(b.id));

        let currentTime = 0;
        const ganttChart = [];
        let totalBusyTime = 0;

        processes.forEach(p => {
            if (currentTime < p.arrivalTime) {
                ganttChart.push({
                    processId: 'IDLE',
                    startTime: currentTime,
                    endTime: p.arrivalTime,
                    duration: p.arrivalTime - currentTime
                });
                currentTime = p.arrivalTime;
            }

            p.responseTime = currentTime - p.arrivalTime;
            const startTime = currentTime;
            currentTime += p.burstTime;
            totalBusyTime += p.burstTime;

            p.completionTime = currentTime;
            p.turnaroundTime = p.completionTime - p.arrivalTime;
            p.waitingTime = p.turnaroundTime - p.burstTime;
            p.state = 'COMPLETED';

            ganttChart.push({
                processId: p.id,
                startTime: startTime,
                endTime: currentTime,
                duration: p.burstTime
            });
        });

        return this.calculateMetrics(processes, ganttChart, totalBusyTime, currentTime, 'fcfs');
    }

    // 2. SJF Implementation (Non-Preemptive)
    static runSJF(processes) {
        let currentTime = 0;
        let completed = 0;
        const n = processes.length;
        const isVisited = new Array(n).fill(false);
        const ganttChart = [];
        let totalBusyTime = 0;

        while (completed < n) {
            let idx = -1;
            let minBurst = Infinity;

            for (let i = 0; i < n; i++) {
                if (!isVisited[i] && processes[i].arrivalTime <= currentTime) {
                    if (processes[i].burstTime < minBurst) {
                        minBurst = processes[i].burstTime;
                        idx = i;
                    } else if (processes[i].burstTime === minBurst) {
                        if (processes[i].arrivalTime < processes[idx].arrivalTime) {
                            idx = i;
                        }
                    }
                }
            }

            if (idx !== -1) {
                const p = processes[idx];
                p.responseTime = currentTime - p.arrivalTime;
                const startTime = currentTime;
                currentTime += p.burstTime;
                totalBusyTime += p.burstTime;

                p.completionTime = currentTime;
                p.turnaroundTime = p.completionTime - p.arrivalTime;
                p.waitingTime = p.turnaroundTime - p.burstTime;
                p.state = 'COMPLETED';

                isVisited[idx] = true;
                completed++;

                ganttChart.push({
                    processId: p.id,
                    startTime: startTime,
                    endTime: currentTime,
                    duration: p.burstTime
                });
            } else {
                let nextArrival = Infinity;
                for (let i = 0; i < n; i++) {
                    if (!isVisited[i] && processes[i].arrivalTime > currentTime) {
                        nextArrival = Math.min(nextArrival, processes[i].arrivalTime);
                    }
                }
                ganttChart.push({
                    processId: 'IDLE',
                    startTime: currentTime,
                    endTime: nextArrival,
                    duration: nextArrival - currentTime
                });
                currentTime = nextArrival;
            }
        }

        return this.calculateMetrics(processes, ganttChart, totalBusyTime, currentTime, 'sjf');
    }

    // 3. SRTF Implementation (Preemptive SJF)
    static runSRTF(processes) {
        let currentTime = 0;
        let completed = 0;
        const n = processes.length;
        const rawGantt = [];
        let totalBusyTime = 0;

        while (completed < n) {
            let idx = -1;
            let minRemaining = Infinity;

            for (let i = 0; i < n; i++) {
                if (processes[i].arrivalTime <= currentTime && processes[i].remainingTime > 0) {
                    if (processes[i].remainingTime < minRemaining) {
                        minRemaining = processes[i].remainingTime;
                        idx = i;
                    } else if (processes[i].remainingTime === minRemaining) {
                        if (processes[i].arrivalTime < processes[idx].arrivalTime) {
                            idx = i;
                        }
                    }
                }
            }

            if (idx !== -1) {
                const p = processes[idx];
                if (p.responseTime === -1) {
                    p.responseTime = currentTime - p.arrivalTime;
                }

                rawGantt.push({ processId: p.id, time: currentTime });
                p.remainingTime--;
                totalBusyTime++;
                currentTime++;

                if (p.remainingTime === 0) {
                    p.completionTime = currentTime;
                    p.turnaroundTime = p.completionTime - p.arrivalTime;
                    p.waitingTime = p.turnaroundTime - p.burstTime;
                    p.state = 'COMPLETED';
                    completed++;
                }
            } else {
                rawGantt.push({ processId: 'IDLE', time: currentTime });
                currentTime++;
            }
        }

        const ganttChart = this.compressGantt(rawGantt);
        return this.calculateMetrics(processes, ganttChart, totalBusyTime, currentTime, 'srtf');
    }

    // 4. Priority Non-Preemptive Implementation
    static runPriority(processes) {
        let currentTime = 0;
        let completed = 0;
        const n = processes.length;
        const isVisited = new Array(n).fill(false);
        const ganttChart = [];
        let totalBusyTime = 0;

        while (completed < n) {
            let idx = -1;
            let highestPriority = Infinity;

            for (let i = 0; i < n; i++) {
                if (!isVisited[i] && processes[i].arrivalTime <= currentTime) {
                    if (processes[i].priority < highestPriority) {
                        highestPriority = processes[i].priority;
                        idx = i;
                    } else if (processes[i].priority === highestPriority) {
                        if (processes[i].arrivalTime < processes[idx].arrivalTime) {
                            idx = i;
                        }
                    }
                }
            }

            if (idx !== -1) {
                const p = processes[idx];
                p.responseTime = currentTime - p.arrivalTime;
                const startTime = currentTime;
                currentTime += p.burstTime;
                totalBusyTime += p.burstTime;

                p.completionTime = currentTime;
                p.turnaroundTime = p.completionTime - p.arrivalTime;
                p.waitingTime = p.turnaroundTime - p.burstTime;
                p.state = 'COMPLETED';

                isVisited[idx] = true;
                completed++;

                ganttChart.push({
                    processId: p.id,
                    startTime: startTime,
                    endTime: currentTime,
                    duration: p.burstTime
                });
            } else {
                let nextArrival = Infinity;
                for (let i = 0; i < n; i++) {
                    if (!isVisited[i] && processes[i].arrivalTime > currentTime) {
                        nextArrival = Math.min(nextArrival, processes[i].arrivalTime);
                    }
                }
                ganttChart.push({
                    processId: 'IDLE',
                    startTime: currentTime,
                    endTime: nextArrival,
                    duration: nextArrival - currentTime
                });
                currentTime = nextArrival;
            }
        }

        return this.calculateMetrics(processes, ganttChart, totalBusyTime, currentTime, 'priority');
    }

    // 5. Priority Preemptive Implementation
    static runPriorityPreemptive(processes) {
        let currentTime = 0;
        let completed = 0;
        const n = processes.length;
        const rawGantt = [];
        let totalBusyTime = 0;

        while (completed < n) {
            let idx = -1;
            let highestPriority = Infinity;

            for (let i = 0; i < n; i++) {
                if (processes[i].arrivalTime <= currentTime && processes[i].remainingTime > 0) {
                    if (processes[i].priority < highestPriority) {
                        highestPriority = processes[i].priority;
                        idx = i;
                    } else if (processes[i].priority === highestPriority) {
                        if (processes[i].arrivalTime < processes[idx].arrivalTime) {
                            idx = i;
                        }
                    }
                }
            }

            if (idx !== -1) {
                const p = processes[idx];
                if (p.responseTime === -1) {
                    p.responseTime = currentTime - p.arrivalTime;
                }

                rawGantt.push({ processId: p.id, time: currentTime });
                p.remainingTime--;
                totalBusyTime++;
                currentTime++;

                if (p.remainingTime === 0) {
                    p.completionTime = currentTime;
                    p.turnaroundTime = p.completionTime - p.arrivalTime;
                    p.waitingTime = p.turnaroundTime - p.burstTime;
                    p.state = 'COMPLETED';
                    completed++;
                }
            } else {
                rawGantt.push({ processId: 'IDLE', time: currentTime });
                currentTime++;
            }
        }

        const ganttChart = this.compressGantt(rawGantt);
        return this.calculateMetrics(processes, ganttChart, totalBusyTime, currentTime, 'priority_p');
    }

    // 6. Round Robin Implementation
    static runRoundRobin(processes, tq) {
        processes.sort((a, b) => a.arrivalTime - b.arrivalTime || a.id.localeCompare(b.id));

        let currentTime = 0;
        let completed = 0;
        const n = processes.length;
        const readyQueue = [];
        const inQueue = new Array(n).fill(false);
        const rawGantt = [];
        let totalBusyTime = 0;

        const pushArrived = () => {
            for (let i = 0; i < n; i++) {
                if (processes[i].arrivalTime <= currentTime && processes[i].remainingTime > 0 && !inQueue[i]) {
                    readyQueue.push(i);
                    inQueue[i] = true;
                }
            }
        };

        pushArrived();

        while (completed < n) {
            if (readyQueue.length > 0) {
                const idx = readyQueue.shift();
                const p = processes[idx];

                if (p.responseTime === -1) {
                    p.responseTime = currentTime - p.arrivalTime;
                }

                const execTime = Math.min(p.remainingTime, tq);

                for (let t = 0; t < execTime; t++) {
                    rawGantt.push({ processId: p.id, time: currentTime + t });
                }

                currentTime += execTime;
                p.remainingTime -= execTime;
                totalBusyTime += execTime;

                pushArrived();

                if (p.remainingTime === 0) {
                    p.completionTime = currentTime;
                    p.turnaroundTime = p.completionTime - p.arrivalTime;
                    p.waitingTime = p.turnaroundTime - p.burstTime;
                    p.state = 'COMPLETED';
                    completed++;
                } else {
                    readyQueue.push(idx);
                }
            } else {
                rawGantt.push({ processId: 'IDLE', time: currentTime });
                currentTime++;
                pushArrived();
            }
        }

        const ganttChart = this.compressGantt(rawGantt);
        return this.calculateMetrics(processes, ganttChart, totalBusyTime, currentTime, 'rr');
    }

    static compressGantt(rawGantt) {
        if (!rawGantt || rawGantt.length === 0) return [];
        const compressed = [];
        let currentBlock = {
            processId: rawGantt[0].processId,
            startTime: rawGantt[0].time,
            endTime: rawGantt[0].time + 1,
            duration: 1
        };

        for (let i = 1; i < rawGantt.length; i++) {
            const item = rawGantt[i];
            if (item.processId === currentBlock.processId) {
                currentBlock.endTime = item.time + 1;
                currentBlock.duration++;
            } else {
                compressed.push(currentBlock);
                currentBlock = {
                    processId: item.processId,
                    startTime: item.time,
                    endTime: item.time + 1,
                    duration: 1
                };
            }
        }
        compressed.push(currentBlock);
        return compressed;
    }

    static calculateMetrics(processes, ganttChart, totalBusyTime, totalTime, algorithmId) {
        const n = processes.length;
        const totalWT = processes.reduce((acc, p) => acc + p.waitingTime, 0);
        const totalTAT = processes.reduce((acc, p) => acc + p.turnaroundTime, 0);
        const totalRT = processes.reduce((acc, p) => acc + (p.responseTime >= 0 ? p.responseTime : 0), 0);

        const avgWT = n > 0 ? (totalWT / n) : 0;
        const avgTAT = n > 0 ? (totalTAT / n) : 0;
        const avgRT = n > 0 ? (totalRT / n) : 0;
        const cpuUtil = totalTime > 0 ? ((totalBusyTime / totalTime) * 100) : 0;
        const throughput = totalTime > 0 ? (n / totalTime) : 0;
        
        let contextSwitches = 0;
        for (let i = 1; i < ganttChart.length; i++) {
            if (ganttChart[i].processId !== 'IDLE' && ganttChart[i - 1].processId !== 'IDLE' && ganttChart[i].processId !== ganttChart[i - 1].processId) {
                contextSwitches++;
            }
        }

        const executionOrder = ganttChart.filter(b => b.processId !== 'IDLE').map(b => b.processId);
        const meta = this.getAlgorithmMeta(algorithmId);

        return {
            algorithm: meta ? meta.name : algorithmId,
            algorithmId: algorithmId,
            processResults: processes,
            ganttChart: ganttChart,
            executionOrder: executionOrder,
            processCount: n,
            avgWaitingTime: Number(avgWT.toFixed(2)),
            avgTurnaroundTime: Number(avgTAT.toFixed(2)),
            avgResponseTime: Number(avgRT.toFixed(2)),
            cpuUtilization: Number(cpuUtil.toFixed(1)),
            throughput: Number(throughput.toFixed(3)),
            contextSwitches: contextSwitches,
            totalTime: totalTime
        };
    }
}

/* ==========================================================================
   4. SIMULATOR STATE STORE
   ========================================================================== */
class SimulatorState {
    constructor() {
        this.selectedAlgorithm = 'fcfs';
        this.timeQuantum = 2;
        this.processes = [];
        this.lastSimulationResult = null;
        this.comparisonResults = [];
        this.editingProcessId = null;
        this.activeTheme = 'dark';
        this.currentView = 'dashboard';
        this.processIdCounter = 0;

        // Simulation Player State
        this.isPlaying = false;
        this.currentTick = 0;
        this.speedMultiplier = 1.0;
        this.timerId = null;

        this.listeners = [];
        this.loadInitialWorkload();
    }

    subscribe(listener) {
        this.listeners.push(listener);
    }

    notify() {
        this.saveWorkload();
        this.listeners.forEach(fn => fn(this));
    }

    loadInitialWorkload() {
        try {
            const saved = localStorage.getItem('cpu_scheduler_workload');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    this.processes = parsed;
                    let maxNum = 0;
                    this.processes.forEach(p => {
                        const match = String(p.id).match(/\d+/);
                        if (match) {
                            const num = parseInt(match[0], 10);
                            if (num > maxNum) maxNum = num;
                        }
                    });
                    this.processIdCounter = maxNum;
                    return;
                }
            }
        } catch (e) {}
        this.processes = [];
        this.processIdCounter = 0;
    }

    saveWorkload() {
        try {
            if (this.processes && this.processes.length > 0) {
                localStorage.setItem('cpu_scheduler_workload', JSON.stringify(this.processes));
            } else {
                localStorage.removeItem('cpu_scheduler_workload');
            }
        } catch (e) {}
    }

    loadPresets() {
        this.resetSimulationState();
        this.processes = [
            { id: 'P1', arrivalTime: 0, burstTime: 5, priority: 2, remainingTime: 5, state: 'READY' },
            { id: 'P2', arrivalTime: 1, burstTime: 3, priority: 1, remainingTime: 3, state: 'READY' },
            { id: 'P3', arrivalTime: 2, burstTime: 8, priority: 4, remainingTime: 8, state: 'READY' },
            { id: 'P4', arrivalTime: 4, burstTime: 2, priority: 3, remainingTime: 2, state: 'READY' }
        ];
        this.processIdCounter = 4;
        this.lastSimulationResult = null;
        this.notify();
    }

    addProcess(process) {
        this.resetSimulationState();
        let pid = process.id;
        if (!pid) {
            this.processIdCounter++;
            pid = `P${this.processIdCounter}`;
        } else {
            const match = pid.match(/\d+/);
            if (match) {
                const num = parseInt(match[0], 10);
                if (num > this.processIdCounter) {
                    this.processIdCounter = num;
                }
            } else {
                this.processIdCounter++;
                pid = `P${this.processIdCounter}`;
            }
        }

        this.processes.push({
            id: pid,
            arrivalTime: Number(process.arrivalTime),
            burstTime: Number(process.burstTime),
            priority: Number(process.priority || 1),
            remainingTime: Number(process.burstTime),
            state: 'READY'
        });
        this.lastSimulationResult = null;
        ToastManager.show(`Process ${pid} added to ready queue.`, 'success');
        this.notify();
    }

    updateProcess(id, updated) {
        this.resetSimulationState();
        const idx = this.processes.findIndex(p => p.id === id);
        if (idx !== -1) {
            this.processes[idx] = {
                ...this.processes[idx],
                arrivalTime: Number(updated.arrivalTime),
                burstTime: Number(updated.burstTime),
                priority: Number(updated.priority || 1),
                remainingTime: Number(updated.burstTime)
            };
            this.lastSimulationResult = null;
            ToastManager.show(`Process ${id} updated successfully.`, 'info');
            this.notify();
        }
    }

    deleteProcess(id) {
        this.resetSimulationState();
        this.processes = this.processes.filter(p => p.id !== id);
        this.lastSimulationResult = null;
        ToastManager.show(`Process ${id} removed.`, 'warning');
        this.notify();
    }

    generateRandomProcesses(count = 10) {
        this.resetSimulationState();
        this.processes = [];
        this.processIdCounter = 0;
        const numCount = Math.max(1, Math.min(100, Number(count) || 10));
        for (let i = 1; i <= numCount; i++) {
            this.processIdCounter++;
            const arr = Math.floor(Math.random() * 10);
            const burst = Math.floor(Math.random() * 12) + 1;
            const prio = Math.floor(Math.random() * 5) + 1;
            this.processes.push({
                id: `P${this.processIdCounter}`,
                arrivalTime: arr,
                burstTime: burst,
                priority: prio,
                remainingTime: burst,
                state: 'READY'
            });
        }
        this.lastSimulationResult = null;
        ToastManager.show(`Generated ${numCount} random process workload batch.`, 'success');
        this.notify();
    }

    clearProcesses() {
        this.resetSimulationState();
        this.processes = [];
        this.processIdCounter = 0;
        this.lastSimulationResult = null;
        this.comparisonResults = [];
        localStorage.removeItem('cpu_scheduler_workload');
        ToastManager.show(`All processes cleared from workload.`, 'warning');
        this.notify();
    }

    setAlgorithm(algoKey) {
        if (this.selectedAlgorithm !== algoKey) {
            this.resetSimulationState();
            this.selectedAlgorithm = algoKey;
            this.lastSimulationResult = null;
            ToastManager.show(`Active policy set to ${SchedulingEngine.getAlgorithmMeta(algoKey).name}`, 'info');
            this.notify();
        }
    }

    setTimeQuantum(val) {
        this.resetSimulationState();
        this.timeQuantum = Math.max(1, Number(val));
        this.lastSimulationResult = null;
        this.notify();
    }

    resetSimulationState() {
        this.stopPlaybackTimer();
        this.isPlaying = false;
        this.currentTick = 0;
    }

    setSpeed(speed) {
        const val = parseFloat(speed);
        if (!isNaN(val) && val > 0) {
            this.speedMultiplier = val;
            if (this.isPlaying) {
                this.startPlaybackTimer();
            }
            ToastManager.show(`Simulation speed set to ${val}x`, 'info');
            this.notify();
        }
    }

    playSimulation() {
        const result = this.lastSimulationResult || this.runCurrentSimulation();
        const maxTime = result ? result.totalTime : 0;
        if (maxTime === 0) {
            ToastManager.show("Add processes to execute simulation.", "warning");
            return;
        }
        if (this.currentTick >= maxTime) {
            this.currentTick = 0;
        }
        this.isPlaying = true;
        this.startPlaybackTimer();

        // Trigger CPU core logo pulse & rotation animation
        document.querySelectorAll('.brand-icon').forEach(icon => {
            icon.classList.remove('sim-pulse');
            void icon.offsetWidth;
            icon.classList.add('sim-pulse');
            setTimeout(() => icon.classList.remove('sim-pulse'), 500);
        });

        ToastManager.show(`Simulation playing (${this.speedMultiplier}x)`, 'success');
        this.notify();
    }

    pauseSimulation() {
        this.stopPlaybackTimer();
        this.isPlaying = false;
        ToastManager.show("Simulation paused.", 'info');
        this.notify();
    }

    stepSimulation() {
        this.stopPlaybackTimer();
        this.isPlaying = false;
        const result = this.lastSimulationResult || this.runCurrentSimulation();
        const maxTime = result ? result.totalTime : 0;
        if (maxTime === 0) {
            ToastManager.show("Add processes to step simulation.", "warning");
            return;
        }
        if (this.currentTick < maxTime) {
            this.currentTick++;
            this.notify();
        } else {
            ToastManager.show("Reached end of execution timeline.", "info");
        }
    }

    resetSimulation() {
        this.stopPlaybackTimer();
        this.isPlaying = false;
        this.currentTick = 0;
        ToastManager.show("Simulation engine reset to T = 0.", "info");
        this.notify();
    }

    startPlaybackTimer() {
        this.stopPlaybackTimer();
        if (!this.isPlaying) return;
        const intervalMs = Math.max(50, Math.round(1000 / this.speedMultiplier));
        this.timerId = setInterval(() => {
            this.tick();
        }, intervalMs);
    }

    stopPlaybackTimer() {
        if (this.timerId !== null) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
    }

    tick() {
        const result = this.lastSimulationResult || this.runCurrentSimulation();
        const maxTime = result ? result.totalTime : 0;
        if (this.currentTick < maxTime) {
            this.currentTick++;
            this.notify();
        } else {
            this.stopPlaybackTimer();
            this.isPlaying = false;
            ToastManager.show("Simulation execution finished.", "success");
            this.notify();
        }
    }

    getNextProcessId() {
        return `P${this.processIdCounter + 1}`;
    }

    runCurrentSimulation() {
        const result = SchedulingEngine.run(
            this.selectedAlgorithm,
            this.processes,
            this.timeQuantum
        );
        this.lastSimulationResult = result;
        this.notify();
        return result;
    }

    runAllComparisons() {
        const algos = ['fcfs', 'sjf', 'srtf', 'priority', 'priority_p', 'rr'];
        this.comparisonResults = algos.map(algo => {
            return SchedulingEngine.run(algo, this.processes, this.timeQuantum);
        });
        this.notify();
        return this.comparisonResults;
    }
}

/* ==========================================================================
   5. CHART.JS ANALYTICS ENGINE
   ========================================================================== */
class AnalyticsEngine {
    constructor() {
        this.charts = {};
    }

    renderAnalytics(results, state) {
        if (typeof Chart === 'undefined') return;

        let simResult = results || (state ? state.lastSimulationResult : null);
        if (!simResult && state && state.processes && state.processes.length > 0) {
            simResult = state.runCurrentSimulation();
        }

        const processes = state ? state.processes : [];
        const pIds = simResult ? simResult.processResults.map(p => p.id) : processes.map(p => p.id);
        const wtData = simResult ? simResult.processResults.map(p => p.waitingTime) : [];
        const tatData = simResult ? simResult.processResults.map(p => p.turnaroundTime) : [];

        const defaultAnim = { duration: 750, easing: 'easeOutQuart' };

        // 1. CPU Utilization vs Idle Time Gauge Chart (Calculated Dynamically)
        const ctxCpu = document.getElementById('chart-cpu-utilization');
        if (ctxCpu) {
            if (this.charts.cpu) this.charts.cpu.destroy();
            const util = simResult ? simResult.cpuUtilization : 0;
            const idle = Math.max(0, Number((100 - util).toFixed(1)));
            this.charts.cpu = new Chart(ctxCpu, {
                type: 'doughnut',
                data: {
                    labels: ['Active Processing', 'Idle CPU'],
                    datasets: [{
                        data: [util, idle],
                        backgroundColor: ['#3B82F6', '#374151']
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, animation: defaultAnim }
            });
        }

        // 2. WT & TAT Bar Chart
        const ctxWtTat = document.getElementById('chart-wt-tat');
        if (ctxWtTat) {
            if (this.charts.wtTat) this.charts.wtTat.destroy();
            this.charts.wtTat = new Chart(ctxWtTat, {
                type: 'bar',
                data: {
                    labels: pIds,
                    datasets: [
                        { label: 'Waiting Time (WT)', data: wtData, backgroundColor: '#3B82F6' },
                        { label: 'Turnaround Time (TAT)', data: tatData, backgroundColor: '#8B5CF6' }
                    ]
                },
                options: { responsive: true, maintainAspectRatio: false, animation: defaultAnim }
            });
        }

        // 3. Algorithm Throughput Breakdown (Clean Horizontal Bar Chart)
        const ctxTp = document.getElementById('chart-throughput');
        if (ctxTp) {
            if (this.charts.throughput) this.charts.throughput.destroy();
            
            const algos = ['fcfs', 'sjf', 'srtf', 'priority', 'priority_p', 'rr'];
            const algoNames = [
                'FCFS',
                'SJF',
                'SRTF',
                'Priority (Non-Preemptive)',
                'Priority (Preemptive)',
                'Round Robin'
            ];
            const tq = state ? state.timeQuantum : 2;
            const procs = (processes && processes.length > 0) ? processes : [
                { id: 'P1', arrivalTime: 0, burstTime: 5, priority: 2 },
                { id: 'P2', arrivalTime: 1, burstTime: 3, priority: 1 }
            ];

            const tpData = algos.map(a => {
                const res = SchedulingEngine.run(a, procs, tq);
                return res.throughput;
            });

            this.charts.throughput = new Chart(ctxTp, {
                type: 'bar',
                data: {
                    labels: algoNames,
                    datasets: [{
                        label: 'Throughput (jobs/ms)',
                        data: tpData,
                        backgroundColor: ['#3B82F6', '#06B6D4', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'],
                        borderRadius: 6
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: defaultAnim,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (context) => `Throughput: ${context.raw} jobs/ms`
                            }
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                            grid: { color: 'rgba(255, 255, 255, 0.08)' },
                            ticks: { color: '#94A3B8' }
                        },
                        y: {
                            grid: { display: false },
                            ticks: { color: '#E2E8F0', font: { weight: '600' } }
                        }
                    }
                }
            });
        }

        // 4. Metrics Benchmark Comparison Chart
        const ctxBm = document.getElementById('chart-metrics-comparison');
        if (ctxBm) {
            if (this.charts.benchmark) this.charts.benchmark.destroy();

            const algos = ['fcfs', 'sjf', 'srtf', 'priority', 'priority_p', 'rr'];
            const algoNames = [
                'FCFS',
                'SJF',
                'SRTF',
                'Priority (Non-Preemptive)',
                'Priority (Preemptive)',
                'Round Robin'
            ];
            const tq = state ? state.timeQuantum : 2;
            const procs = (processes && processes.length > 0) ? processes : [
                { id: 'P1', arrivalTime: 0, burstTime: 5, priority: 2 },
                { id: 'P2', arrivalTime: 1, burstTime: 3, priority: 1 }
            ];

            const avgWtList = [];
            const avgTatList = [];

            algos.forEach(a => {
                const res = SchedulingEngine.run(a, procs, tq);
                avgWtList.push(res.avgWaitingTime);
                avgTatList.push(res.avgTurnaroundTime);
            });

            this.charts.benchmark = new Chart(ctxBm, {
                type: 'bar',
                data: {
                    labels: algoNames,
                    datasets: [
                        { label: 'Avg Waiting Time (ms)', data: avgWtList, backgroundColor: '#06B6D4' },
                        { label: 'Avg Turnaround Time (ms)', data: avgTatList, backgroundColor: '#3B82F6' }
                    ]
                },
                options: { responsive: true, maintainAspectRatio: false, animation: defaultAnim }
            });
        }
    }
}


/* ==========================================================================
   6. UI CONTROLLER & ROUTER
   ========================================================================== */
class UIController {
    constructor(state) {
        this.state = state;
        this.analytics = new AnalyticsEngine();

        // DOM Element Bindings
        this.sidebar = document.getElementById('app-sidebar');
        this.sidebarToggleBtn = document.getElementById('sidebar-toggle');
        this.breadcrumbCategory = document.getElementById('breadcrumb-category');
        this.breadcrumbCurrent = document.getElementById('breadcrumb-current');
        this.themeToggleBtn = document.getElementById('theme-toggle');
        this.themeLabel = document.getElementById('theme-label');
        this.themeSelectDropdown = document.getElementById('accent-theme-select');

        // Form Inputs
        this.processForm = document.getElementById('process-form');
        this.inputPid = document.getElementById('process-id');
        this.inputAt = document.getElementById('arrival-time');
        this.inputBt = document.getElementById('burst-time');
        this.inputPriority = document.getElementById('priority');
        this.btnAddProcess = document.getElementById('btn-add-process');
        this.btnUpdateProcess = document.getElementById('btn-update-process');
        this.btnCancelEdit = document.getElementById('btn-cancel-edit');
        this.btnSampleData = document.getElementById('btn-sample-data');
        this.btnClearAll = document.getElementById('btn-clear-all');

        // Tables
        this.processTableBody = document.getElementById('process-table-body');
        this.processTableEmpty = document.getElementById('process-table-empty');
        this.dashQueueBody = document.getElementById('dash-queue-table-body');
        this.dashQueueEmpty = document.getElementById('dash-queue-empty');

        // Search & Filters
        this.filterSearchPid = document.getElementById('filter-search-pid');
        this.filterState = document.getElementById('filter-state');
        this.filterPriority = document.getElementById('filter-priority');

        // Controls
        this.btnRunSim = document.getElementById('btn-run-simulation');
        this.btnResetSim = document.getElementById('btn-reset');
        this.btnCompare = document.getElementById('btn-compare');

        // Player Buttons
        this.btnSimPlay = document.getElementById('btn-sim-play');
        this.btnSimPause = document.getElementById('btn-sim-pause');
        this.btnSimStep = document.getElementById('btn-sim-step');
        this.btnSimStop = document.getElementById('btn-sim-stop');
        this.speedButtons = document.querySelectorAll('.btn-speed');

        // Exporters
        this.btnExportCsv = document.getElementById('btn-export-csv');
        this.btnExportExcel = document.getElementById('btn-export-excel');
        this.btnExportPdf = document.getElementById('btn-export-pdf');
    }

    init() {
        this.bindEvents();
        this.setupRouter();
        this.state.subscribe(() => this.render());
        this.resetForm();
        this.render();
    }

    setupRouter() {
        const handleHash = () => {
            const hash = window.location.hash.replace('#', '') || 'dashboard';
            this.switchView(hash);
        };

        window.addEventListener('hashchange', handleHash);
        handleHash();
    }

    switchView(viewId) {
        const targetView = document.getElementById(`view-${viewId}`);
        if (!targetView) return;

        document.querySelectorAll('.app-view').forEach(view => {
            view.classList.remove('active');
        });
        targetView.classList.add('active');

        document.querySelectorAll('.nav-item').forEach(item => {
            const isMatch = item.getAttribute('data-view-target') === viewId;
            item.classList.toggle('active', isMatch);
        });

        const viewNames = {
            dashboard: 'Dashboard',
            algorithm: 'Algorithms',
            'process-manager': 'Process Manager',
            simulation: 'Simulation Engine',
            results: 'Results & Metrics',
            gantt: 'Gantt Chart',
            analytics: 'Performance Analytics',
            comparison: 'Comparison Matrix',
            about: 'About & Viva'
        };

        this.state.currentView = viewId;

        let simResult = this.state.lastSimulationResult;
        if (!simResult && this.state.processes.length > 0) {
            simResult = this.state.runCurrentSimulation();
        }

        if (viewId === 'gantt' || viewId === 'simulation' || viewId === 'results') {
            if (simResult) {
                this.renderGantt(simResult);
            }
        }

        if (viewId === 'results') {
            if (simResult) {
                this.renderResults(simResult);
            }
        }

        if (viewId === 'comparison') {
            const compResults = this.state.runAllComparisons();
            this.renderComparison(compResults);
        }

        if (viewId === 'analytics') {
            this.analytics.renderAnalytics(simResult, this.state);
        }
    }


    bindEvents() {
        // Sidebar Toggle, Close Button & Mobile Overlay
        const overlay = document.getElementById('sidebar-overlay');
        const closeBtn = document.getElementById('sidebar-close-btn');

        const closeSidebar = () => {
            if (this.sidebar) {
                this.sidebar.classList.remove('open');
                if (window.innerWidth <= 992) {
                    this.sidebar.style.visibility = 'hidden';
                    this.sidebar.style.pointerEvents = 'none';
                }
            }
            if (overlay) {
                overlay.classList.remove('active');
                overlay.style.display = 'none';
                overlay.style.visibility = 'hidden';
                overlay.style.opacity = '0';
                overlay.style.pointerEvents = 'none';
            }
            document.body.style.overflow = '';
        };

        const openSidebar = () => {
            if (this.sidebar) {
                this.sidebar.classList.add('open');
                this.sidebar.style.visibility = 'visible';
                this.sidebar.style.pointerEvents = 'auto';
            }
            if (overlay) {
                overlay.classList.add('active');
                overlay.style.display = 'block';
                overlay.style.visibility = 'visible';
                overlay.style.opacity = '1';
                overlay.style.pointerEvents = 'auto';
            }
        };

        // Guarantee closed state on initial load
        closeSidebar();

        if (this.sidebarToggleBtn) {
            this.sidebarToggleBtn.addEventListener('click', () => {
                const isOpen = this.sidebar && this.sidebar.classList.contains('open');
                if (isOpen) {
                    closeSidebar();
                } else {
                    openSidebar();
                }
            });
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', closeSidebar);
        }
        if (overlay) {
            overlay.addEventListener('click', closeSidebar);
        }
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 992) {
                    closeSidebar();
                }
            });
        });

        // Theme Toggle Button & Dropdown Accent Switcher
        if (this.themeToggleBtn) {
            this.themeToggleBtn.addEventListener('click', () => {
                const current = document.documentElement.getAttribute('data-theme');
                const next = current === 'light' ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', next);
                if (this.themeLabel) this.themeLabel.textContent = next === 'light' ? 'Light Mode' : 'Dark Theme';
                ToastManager.show(`Switched to ${next.toUpperCase()} theme.`, 'info');
            });
        }

        if (this.themeSelectDropdown) {
            this.themeSelectDropdown.addEventListener('change', (e) => {
                const themeVal = e.target.value;
                document.documentElement.setAttribute('data-theme', themeVal);
                ToastManager.show(`Accent theme updated to ${themeVal.toUpperCase()}`, 'info');
            });
        }

        // Algorithm Cards Selection
        document.querySelectorAll('.algo-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.algo-card').forEach(c => {
                    c.classList.remove('active');
                    c.setAttribute('aria-checked', 'false');
                });
                card.classList.add('active');
                card.setAttribute('aria-checked', 'true');

                const algoKey = card.getAttribute('data-algorithm');
                this.state.setAlgorithm(algoKey);
            });
        });

        // Time Quantum Input
        const tqInput = document.getElementById('time-quantum');
        if (tqInput) {
            tqInput.addEventListener('input', (e) => {
                this.state.setTimeQuantum(e.target.value);
            });
        }

        // Form Action Buttons
        if (this.btnAddProcess) {
            this.btnAddProcess.addEventListener('click', () => this.handleAddProcess());
        }
        if (this.btnUpdateProcess) {
            this.btnUpdateProcess.addEventListener('click', () => this.handleUpdateProcess());
        }
        if (this.btnCancelEdit) {
            this.btnCancelEdit.addEventListener('click', () => this.resetForm());
        }
        if (this.btnSampleData) {
            this.btnSampleData.addEventListener('click', () => {
                this.state.loadPresets();
                ToastManager.show("Sample workload dataset loaded.", "info");
                this.render();
            });
        }
        if (this.btnClearAll) {
            this.btnClearAll.addEventListener('click', () => this.state.clearProcesses());
        }

        // Button Ripple Effect
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn');
            if (!btn) return;
            const rect = btn.getBoundingClientRect();
            const circle = document.createElement('span');
            const diameter = Math.max(rect.width, rect.height);
            const radius = diameter / 2;

            circle.style.width = circle.style.height = `${diameter}px`;
            circle.style.left = `${e.clientX - rect.left - radius}px`;
            circle.style.top = `${e.clientY - rect.top - radius}px`;
            circle.classList.add('ripple');

            const existing = btn.querySelector('.ripple');
            if (existing) existing.remove();

            btn.appendChild(circle);
            setTimeout(() => circle.remove(), 600);
        });

        // Simulation Run & Compare
        if (this.btnRunSim) {
            this.btnRunSim.addEventListener('click', () => {
                const result = this.state.runCurrentSimulation();
                this.renderResults(result);
                this.renderGantt(result);
                this.switchView('results');
            });
        }
        if (this.btnCompare) {
            this.btnCompare.addEventListener('click', async () => {
                const button = this.btnCompare;
                const originalText = button.innerHTML;
                button.disabled = true;

                try {
                    if (!this.state.processes || this.state.processes.length === 0) {
                        button.innerHTML = `⚠️ Add processes first`;
                        await new Promise(res => setTimeout(res, 1200));
                        return;
                    }

                    const steps = [
                        { label: 'Running Benchmarks...', delay: 180 },
                        { label: 'FCFS ✓', delay: 180 },
                        { label: 'SJF ✓', delay: 180 },
                        { label: 'SRTF ✓', delay: 180 },
                        { label: 'Priority NP ✓', delay: 180 },
                        { label: 'Priority P ✓', delay: 180 },
                        { label: 'Round Robin ✓', delay: 180 }
                    ];

                    for (let i = 0; i < steps.length; i++) {
                        button.innerHTML = `<span class="spinner"></span> ${steps[i].label}`;
                        await new Promise(res => setTimeout(res, steps[i].delay));
                    }

                    const compResults = this.state.runAllComparisons();
                    this.renderComparison(compResults);
                    this.switchView('comparison');
                } catch (err) {
                    button.innerHTML = `⚠️ Benchmark Error`;
                } finally {
                    button.disabled = false;
                    button.innerHTML = originalText;
                }
            });
        }

        // Player Controls (Play, Pause, Step, Stop/Reset, Speed)
        if (this.btnSimPlay) {
            this.btnSimPlay.addEventListener('click', () => {
                this.state.playSimulation();
            });
        }
        if (this.btnSimPause) {
            this.btnSimPause.addEventListener('click', () => {
                this.state.pauseSimulation();
            });
        }
        if (this.btnSimStep) {
            this.btnSimStep.addEventListener('click', () => {
                this.state.stepSimulation();
            });
        }
        if (this.btnSimStop) {
            this.btnSimStop.addEventListener('click', () => {
                this.state.resetSimulation();
            });
        }
        if (this.speedButtons && this.speedButtons.length > 0) {
            this.speedButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const speedVal = btn.getAttribute('data-speed');
                    this.state.setSpeed(speedVal);
                });
            });
        }

        // Random Process Batch Generator
        const btnGenRandom = document.getElementById('btn-generate-random');
        const selectRandomCount = document.getElementById('select-random-count');
        if (btnGenRandom) {
            btnGenRandom.addEventListener('click', () => {
                const count = selectRandomCount ? selectRandomCount.value : 10;
                this.state.generateRandomProcesses(count);
            });
        }

        // Gantt Action Toolbar
        const btnGanttZoomIn = document.getElementById('btn-gantt-zoom-in');
        const btnGanttZoomOut = document.getElementById('btn-gantt-zoom-out');
        const btnGanttResetZoom = document.getElementById('btn-gantt-reset-zoom');
        const btnGanttFullscreen = document.getElementById('btn-gantt-fullscreen');
        const btnGanttDownloadPng = document.getElementById('btn-gantt-download-png');

        let currentGanttZoom = 1.0;
        if (btnGanttZoomIn) {
            btnGanttZoomIn.addEventListener('click', () => {
                currentGanttZoom = Math.min(2.5, currentGanttZoom + 0.25);
                const bar = document.getElementById('gantt-bar-container');
                if (bar) bar.style.transform = `scaleX(${currentGanttZoom})`;
            });
        }
        if (btnGanttZoomOut) {
            btnGanttZoomOut.addEventListener('click', () => {
                currentGanttZoom = Math.max(0.5, currentGanttZoom - 0.25);
                const bar = document.getElementById('gantt-bar-container');
                if (bar) bar.style.transform = `scaleX(${currentGanttZoom})`;
            });
        }
        if (btnGanttResetZoom) {
            btnGanttResetZoom.addEventListener('click', () => {
                currentGanttZoom = 1.0;
                const bar = document.getElementById('gantt-bar-container');
                if (bar) bar.style.transform = `scaleX(1.0)`;
            });
        }
        if (btnGanttFullscreen) {
            btnGanttFullscreen.addEventListener('click', () => {
                const ganttWrap = document.querySelector('.gantt-wrapper');
                if (ganttWrap) {
                    ganttWrap.classList.toggle('gantt-fullscreen');
                }
            });
        }
        if (btnGanttDownloadPng) {
            btnGanttDownloadPng.addEventListener('click', () => this.downloadGanttPNG());
        }

        // Exporters
        if (this.btnExportCsv) {
            this.btnExportCsv.addEventListener('click', () => this.exportCSV());
        }
        if (this.btnExportExcel) {
            this.btnExportExcel.addEventListener('click', () => this.exportExcel());
        }
        if (this.btnExportPdf) {
            this.btnExportPdf.addEventListener('click', () => window.print());
        }

        this.initKeyboardShortcuts();

        // Search & Filters
        if (this.filterSearchPid) {
            this.filterSearchPid.addEventListener('input', () => this.renderProcessTable());
        }
        if (this.filterState) {
            this.filterState.addEventListener('change', () => this.renderProcessTable());
        }
        if (this.filterPriority) {
            this.filterPriority.addEventListener('input', () => this.renderProcessTable());
        }
    }

    renderResults(result) {
        const wtElem = document.getElementById('stat-avg-wt');
        const tatElem = document.getElementById('stat-avg-tat');
        const rtElem = document.getElementById('stat-avg-rt');
        const cpuUtilElem = document.getElementById('stat-cpu-util');

        if (wtElem) this.animateValue(wtElem, parseFloat(wtElem.textContent) || 0, result.avgWaitingTime, 450, 2);
        if (tatElem) this.animateValue(tatElem, parseFloat(tatElem.textContent) || 0, result.avgTurnaroundTime, 450, 2);
        if (rtElem) this.animateValue(rtElem, parseFloat(rtElem.textContent) || 0, result.avgResponseTime, 450, 2);
        if (cpuUtilElem) this.animateValue(cpuUtilElem, parseFloat(cpuUtilElem.textContent) || 0, result.cpuUtilization, 450, 1, '%');

        const body = document.getElementById('results-table-body');
        if (body) {
            body.innerHTML = '';
            result.processResults.forEach(p => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><span class="pid-badge">${p.id}</span></td>
                    <td>${p.arrivalTime}</td>
                    <td>${p.burstTime}</td>
                    <td>${p.priority}</td>
                    <td>${p.completionTime}</td>
                    <td>${p.turnaroundTime}</td>
                    <td>${p.waitingTime}</td>
                    <td>${p.responseTime}</td>
                `;
                body.appendChild(tr);
            });
        }
    }

    renderGantt(result, currentTick = 0) {
        const container = document.getElementById('gantt-bar-container');
        const timeline = document.getElementById('gantt-timeline-container');
        const legend = document.getElementById('gantt-legend');
        const algoBadge = document.getElementById('gantt-algo-name');

        if (!container || !timeline) return;
        container.innerHTML = '';
        timeline.innerHTML = '';
        if (legend) legend.innerHTML = '';

        if (!result) {
            result = this.state.lastSimulationResult;
        }
        if (!result && this.state.processes.length > 0) {
            result = this.state.runCurrentSimulation();
        }

        if (algoBadge && this.state.selectedAlgorithm) {
            const meta = SchedulingEngine.getAlgorithmMeta(this.state.selectedAlgorithm);
            if (meta) algoBadge.textContent = meta.name;
        }

        if (!result || !result.ganttChart || result.ganttChart.length === 0) {
            container.innerHTML = `<div class="empty-state" style="padding: 20px; width: 100%;"><div class="empty-desc">No execution timeline recorded. Add processes in Process Manager to view Gantt chart.</div></div>`;
            return;
        }

        const totalDuration = result.totalTime || 1;
        const colorMap = {};
        const pColors = ['#3B82F6', '#06B6D4', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#6366F1', '#14B8A6'];

        if (result.processResults) {
            result.processResults.forEach((p, idx) => {
                colorMap[p.id] = pColors[idx % pColors.length];
            });
        }
        colorMap['IDLE'] = '#374151';

        const activeTime = currentTick > 0 ? currentTick - 1 : 0;

        result.ganttChart.forEach((block) => {
            const widthPct = (block.duration / totalDuration) * 100;
            const div = document.createElement('div');
            
            let statusClass = '';
            if (currentTick > 0) {
                if (block.endTime <= currentTick) {
                    statusClass = 'gantt-block-completed';
                } else if (block.startTime <= activeTime && activeTime < block.endTime) {
                    statusClass = 'gantt-block-active';
                } else {
                    statusClass = 'gantt-block-pending';
                }
            }

            div.className = `gantt-block ${block.processId === 'IDLE' ? 'gantt-block-idle' : ''} ${statusClass}`.trim();
            div.style.width = `${widthPct}%`;

            if (block.processId !== 'IDLE') {
                div.style.backgroundColor = colorMap[block.processId] || '#3B82F6';
                div.innerHTML = `<span class="gantt-pid">${block.processId}</span><span class="gantt-time-range">[${block.startTime}–${block.endTime}]</span>`;
            } else {
                div.innerHTML = `<span class="gantt-pid">IDLE</span><span class="gantt-time-range">[${block.startTime}–${block.endTime}]</span>`;
            }

            div.title = `${block.processId}: Time [${block.startTime} ➔ ${block.endTime}] (Duration: ${block.duration} ms)`;
            div.setAttribute('data-pid', block.processId);

            container.appendChild(div);
        });

        if (currentTick > 0) {
            const cursor = document.createElement('div');
            cursor.className = 'gantt-playback-cursor';
            cursor.style.left = `${(currentTick / totalDuration) * 100}%`;
            container.appendChild(cursor);
        }

        for (let i = 0; i <= totalDuration; i++) {
            const tick = document.createElement('div');
            tick.className = 'gantt-tick';
            if (i === currentTick) tick.classList.add('active-tick');
            tick.style.left = `${(i / totalDuration) * 100}%`;
            tick.textContent = i;
            timeline.appendChild(tick);
        }

        if (legend && result.processResults) {
            result.processResults.forEach(p => {
                const item = document.createElement('div');
                item.className = 'legend-item';
                item.innerHTML = `
                    <span class="legend-color" style="background-color: ${colorMap[p.id]}"></span>
                    <span>${p.id}</span>
                `;
                legend.appendChild(item);
            });
            if (result.ganttChart.some(b => b.processId === 'IDLE')) {
                const item = document.createElement('div');
                item.className = 'legend-item';
                item.innerHTML = `
                    <span class="legend-color" style="background-color: #374151"></span>
                    <span>IDLE</span>
                `;
                legend.appendChild(item);
            }
        }
    }

    renderComparison(compResults) {
        if (!compResults || compResults.length === 0) {
            compResults = this.state.runAllComparisons();
        }

        const cardsGrid = document.getElementById('comparison-cards-grid');
        const barsContainer = document.getElementById('comparison-bars-container');
        const tableBody = document.getElementById('comparison-table-body');
        const tableWrapper = document.querySelector('#view-comparison .table-responsive');

        let emptyStateContainer = document.getElementById('comparison-empty-state');

        if (!this.state.processes || this.state.processes.length === 0 || !compResults || compResults.length === 0) {
            if (!emptyStateContainer) {
                emptyStateContainer = document.createElement('div');
                emptyStateContainer.id = 'comparison-empty-state';
                emptyStateContainer.className = 'empty-state glass-card';
                emptyStateContainer.style.cssText = 'padding: 48px 24px; text-align: center; margin: 24px 0; display: flex; flex-direction: column; align-items: center; gap: 14px;';
                emptyStateContainer.innerHTML = `
                    <div style="font-size: 2.5rem; color: var(--primary);">📊</div>
                    <h3 class="empty-title" style="font-size: 1.2rem; font-weight: 700; color: var(--text-primary); margin: 0;">No Benchmark Data Available</h3>
                    <p class="empty-desc" style="max-width: 520px; color: var(--text-muted); font-size: 0.9rem; margin: 0;">Add processes to your workload in Process Manager or click below to run performance benchmark across all 6 scheduling algorithms.</p>
                    <button type="button" id="btn-empty-run-benchmark" class="btn btn-primary btn-lg" style="margin-top: 8px;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        Run Benchmark
                    </button>
                `;
                const viewComparison = document.getElementById('view-comparison');
                if (viewComparison) viewComparison.appendChild(emptyStateContainer);
            } else {
                emptyStateContainer.style.display = 'flex';
            }

            if (cardsGrid) cardsGrid.style.display = 'none';
            if (barsContainer && barsContainer.parentElement) barsContainer.parentElement.style.display = 'none';
            if (tableWrapper) tableWrapper.style.display = 'none';

            const btnEmptyRun = document.getElementById('btn-empty-run-benchmark');
            if (btnEmptyRun && !btnEmptyRun.dataset.bound) {
                btnEmptyRun.dataset.bound = "true";
                btnEmptyRun.addEventListener('click', () => {
                    if (!this.state.processes || this.state.processes.length === 0) {
                        this.state.loadPresets();
                    }
                    const results = this.state.runAllComparisons();
                    this.renderComparison(results);
                    ToastManager.show("Benchmark executed successfully across all 6 algorithms.", "success");
                });
            }
            return;
        }

        if (emptyStateContainer) emptyStateContainer.style.display = 'none';
        if (cardsGrid) cardsGrid.style.display = 'grid';
        if (barsContainer && barsContainer.parentElement) barsContainer.parentElement.style.display = 'block';
        if (tableWrapper) tableWrapper.style.display = 'block';

        console.log("Complete Benchmark Results:", compResults);

        const sorted = [...compResults].sort((a, b) => a.avgWaitingTime - b.avgWaitingTime);
        const minWT = sorted[0].avgWaitingTime;
        const maxWT = sorted[sorted.length - 1].avgWaitingTime;

        if (cardsGrid) {
            cardsGrid.innerHTML = '';
            compResults.forEach(r => {
                const meta = SchedulingEngine.getAlgorithmMeta(r.algorithmId);
                const isBest = r.avgWaitingTime === minWT;
                const rank = sorted.findIndex(s => s.algorithmId === r.algorithmId) + 1;

                const card = document.createElement('div');
                card.className = `dash-card glass-card ${isBest ? 'best-performer-card' : ''}`;
                if (isBest) {
                    card.style.border = '1px solid #10B981';
                    card.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.3)';
                }

                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                        <div>
                            <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin: 0;">${meta.name}</h3>
                            <span class="algo-badge ${meta.badgeClass}" style="margin-top: 4px; display: inline-block;">${meta.type}</span>
                        </div>
                        ${isBest 
                            ? `<span class="best-badge" style="background: rgba(16,185,129,0.2); color: #10B981; border: 1px solid #10B981; box-shadow: 0 0 10px rgba(16,185,129,0.4);">★ Optimal / Best Policy</span>`
                            : `<span class="normal-badge">Rank #${rank}</span>`
                        }
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.85rem;">
                        <div><span style="color: var(--text-muted);">Avg Waiting:</span> <strong style="color: var(--primary);">${r.avgWaitingTime} ms</strong></div>
                        <div><span style="color: var(--text-muted);">Avg Turnaround:</span> <strong style="color: var(--secondary);">${r.avgTurnaroundTime} ms</strong></div>
                        <div><span style="color: var(--text-muted);">Avg Response:</span> <strong>${r.avgResponseTime} ms</strong></div>
                        <div><span style="color: var(--text-muted);">Throughput:</span> <strong>${r.throughput} jobs/ms</strong></div>
                        <div><span style="color: var(--text-muted);">CPU Util:</span> <strong>${r.cpuUtilization}%</strong></div>
                        <div><span style="color: var(--text-muted);">Context Switches:</span> <strong>${r.contextSwitches}</strong></div>
                        <div><span style="color: var(--text-muted);">Exec Time:</span> <strong>${r.totalTime} ms</strong></div>
                    </div>
                `;
                cardsGrid.appendChild(card);
            });
        }

        if (barsContainer) {
            barsContainer.innerHTML = '';
            compResults.forEach(r => {
                const meta = SchedulingEngine.getAlgorithmMeta(r.algorithmId);
                const isBest = r.avgWaitingTime === minWT;
                const maxVal = maxWT > 0 ? maxWT * 1.15 : 1;
                const widthPct = Math.max(8, (r.avgWaitingTime / maxVal) * 100);

                const item = document.createElement('div');
                item.style.display = 'flex';
                item.style.flexDirection = 'column';
                item.style.gap = '4px';

                item.innerHTML = `
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                        <span><strong>${meta.name}</strong> ${isBest ? '<span style="color:#10B981; font-weight:700;">(Best)</span>' : ''}</span>
                        <span style="color: var(--text-muted);">${r.avgWaitingTime} ms avg waiting</span>
                    </div>
                    <div style="width: 100%; height: 10px; background: rgba(255,255,255,0.06); border-radius: 9999px; overflow: hidden;">
                        <div style="width: ${widthPct}%; height: 100%; background: ${isBest ? 'linear-gradient(90deg, #10B981, #06B6D4)' : 'linear-gradient(90deg, #3B82F6, #8B5CF6)'}; border-radius: 9999px; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);"></div>
                    </div>
                `;
                barsContainer.appendChild(item);
            });
        }

        if (tableBody) {
            tableBody.innerHTML = '';
            compResults.forEach(r => {
                const meta = SchedulingEngine.getAlgorithmMeta(r.algorithmId);
                const rank = sorted.findIndex(s => s.algorithmId === r.algorithmId) + 1;
                const isBest = r.avgWaitingTime === minWT;
                const isWorst = r.avgWaitingTime === maxWT && sorted.length > 2;

                const tr = document.createElement('tr');
                if (isBest) tr.className = 'best-performer-row';
                else if (isWorst) tr.className = 'worst-performer-row';

                const seqText = r.executionOrder && r.executionOrder.length > 0 
                    ? r.executionOrder.join(' ➔ ') 
                    : r.ganttChart.filter(b => b.processId !== 'IDLE').map(b => b.processId).join(' ➔ ');

                let badgeHtml = `<span class="normal-badge">Rank #${rank}</span>`;
                if (rank === 1) badgeHtml = `<span class="best-badge badge-medal-gold">🥇 Gold Optimal (Lowest WT)</span>`;
                else if (rank === 2) badgeHtml = `<span class="best-badge badge-medal-silver">🥈 Silver Performer</span>`;
                else if (rank === 3) badgeHtml = `<span class="best-badge badge-medal-bronze">🥉 Bronze Performer</span>`;
                else if (isWorst) badgeHtml = `<span class="badge-tag tag-preemptive" style="background: rgba(239,68,68,0.2); color: var(--danger); border: 1px solid var(--danger);">⚠️ Lowest Efficiency</span>`;

                tr.innerHTML = `
                    <td><strong>${meta.name}</strong></td>
                    <td><span class="algo-badge ${meta.badgeClass}">${meta.type}</span></td>
                    <td><strong>${r.avgWaitingTime} ms</strong></td>
                    <td>${r.avgTurnaroundTime} ms</td>
                    <td>${r.avgResponseTime} ms</td>
                    <td>${r.throughput} jobs/ms</td>
                    <td>${r.cpuUtilization}%</td>
                    <td>${r.contextSwitches}</td>
                    <td><code>${seqText}</code></td>
                    <td>${badgeHtml}</td>
                `;
                tableBody.appendChild(tr);
            });
        }

        if (tableWrapper) {
            tableWrapper.scrollLeft = 0;
        }
    }

    handleAddProcess() {
        const arrivalTime = parseInt(this.inputAt.value, 10);
        const burstTime = parseInt(this.inputBt.value, 10);
        const priority = parseInt(this.inputPriority.value, 10) || 1;

        if (isNaN(arrivalTime) || arrivalTime < 0 || isNaN(burstTime) || burstTime <= 0) {
            ToastManager.show("Please enter valid positive numbers for Arrival and Burst time.", "danger");
            return;
        }

        const pid = this.state.getNextProcessId();
        this.state.addProcess({ id: pid, arrivalTime, burstTime, priority });
        this.resetForm();
    }

    handleUpdateProcess() {
        if (!this.state.editingProcessId) return;
        const arrivalTime = parseInt(this.inputAt.value, 10);
        const burstTime = parseInt(this.inputBt.value, 10);
        const priority = parseInt(this.inputPriority.value, 10) || 1;

        this.state.updateProcess(this.state.editingProcessId, { arrivalTime, burstTime, priority });
        this.resetForm();
    }

    startEditProcess(pid) {
        const process = this.state.processes.find(p => p.id === pid);
        if (!process) return;

        this.state.editingProcessId = pid;
        this.inputPid.value = process.id;
        this.inputAt.value = process.arrivalTime;
        this.inputBt.value = process.burstTime;
        this.inputPriority.value = process.priority;

        this.btnAddProcess.classList.add('hidden');
        this.btnUpdateProcess.classList.remove('hidden');
        this.btnCancelEdit.classList.remove('hidden');
    }

    resetForm() {
        this.state.editingProcessId = null;
        this.inputPid.value = this.state.getNextProcessId();
        this.inputAt.value = '0';
        this.inputBt.value = '5';
        this.inputPriority.value = '1';

        this.btnAddProcess.classList.remove('hidden');
        this.btnUpdateProcess.classList.add('hidden');
        this.btnCancelEdit.classList.add('hidden');
    }

    render() {
        if (!this.state.editingProcessId && this.inputPid) {
            this.inputPid.value = this.state.getNextProcessId();
        }

        let simResult = this.state.lastSimulationResult;
        if (!simResult && this.state.processes.length > 0) {
            simResult = this.state.runCurrentSimulation();
        }

        // Sync Speed buttons UI active highlight
        if (this.speedButtons) {
            this.speedButtons.forEach(btn => {
                const sp = parseFloat(btn.getAttribute('data-speed'));
                const isMatch = Math.abs(sp - this.state.speedMultiplier) < 0.01;
                btn.classList.toggle('active', isMatch);
            });
        }

        const currentTick = this.state.currentTick;
        const totalTime = simResult ? simResult.totalTime : 0;

        // Calculate dynamic process states & active CPU process at currentTick
        const processStateMap = {};
        let runningPid = 'IDLE';

        if (simResult && simResult.ganttChart && simResult.ganttChart.length > 0 && currentTick > 0) {
            const activeTime = currentTick - 1;
            const activeBlock = simResult.ganttChart.find(b => b.startTime <= activeTime && activeTime < b.endTime);
            if (activeBlock) {
                runningPid = activeBlock.processId;
            }
        }

        this.state.processes.forEach(p => {
            let executedUnits = 0;
            if (simResult && simResult.ganttChart) {
                simResult.ganttChart.forEach(block => {
                    if (block.processId === p.id) {
                        const execInBlock = Math.max(0, Math.min(block.endTime, currentTick) - block.startTime);
                        executedUnits += execInBlock;
                    }
                });
            }
            const remTime = Math.max(0, p.burstTime - executedUnits);
            let stateName = 'READY';
            if (currentTick < p.arrivalTime) {
                stateName = 'NOT ARRIVED';
            } else if (remTime === 0) {
                stateName = 'COMPLETED';
            } else if (p.id === runningPid) {
                stateName = 'RUNNING';
            } else {
                stateName = 'READY';
            }

            processStateMap[p.id] = {
                remainingTime: remTime,
                state: stateName
            };
        });

        this.renderProcessTable(processStateMap);
        this.renderDashboardQueue();
        this.renderSystemMonitor(simResult, currentTick, runningPid, processStateMap);
        this.renderReadyQueueFlow(runningPid, processStateMap);
        this.renderAlgorithmInfo();

        if (this.state.processes.length > 0 && simResult) {
            this.renderGantt(simResult, currentTick);
        }

        if (this.inputPid && !this.state.editingProcessId) {
            this.inputPid.value = this.state.getNextProcessId();
        }

        const totalProcElem = document.getElementById('dash-total-procs');
        if (totalProcElem) {
            totalProcElem.textContent = `${this.state.processes.length} Processes`;
        }

        const activeAlgoElem = document.getElementById('dash-active-algo');
        if (activeAlgoElem) {
            activeAlgoElem.textContent = SchedulingEngine.getAlgorithmMeta(this.state.selectedAlgorithm).name;
        }

        const activeTypeElem = document.getElementById('dash-active-type');
        if (activeTypeElem) {
            const meta = SchedulingEngine.getAlgorithmMeta(this.state.selectedAlgorithm);
            activeTypeElem.textContent = meta.type;
            activeTypeElem.className = `badge-tag ${meta.badgeClass || ''}`;
        }

        const lastRunElem = document.getElementById('dash-last-run');
        const lastRunSubElem = document.getElementById('dash-last-run-sub');
        if (lastRunElem) {
            if (simResult) {
                const meta = SchedulingEngine.getAlgorithmMeta(simResult.algorithmId);
                lastRunElem.textContent = meta.name;
                if (lastRunSubElem) lastRunSubElem.textContent = `Avg WT: ${simResult.avgWaitingTime} ms | CPU Util: ${simResult.cpuUtilization}%`;
            } else {
                lastRunElem.textContent = 'Not Run Yet';
                if (lastRunSubElem) lastRunSubElem.textContent = 'Click Simulation to execute';
            }
        }

        // Sim summary card items
        const simAlgoElem = document.getElementById('sim-selected-algo');
        if (simAlgoElem) {
            simAlgoElem.textContent = SchedulingEngine.getAlgorithmMeta(this.state.selectedAlgorithm).name;
        }

        const simProcCountElem = document.getElementById('sim-process-count');
        if (simProcCountElem) {
            simProcCountElem.textContent = `${this.state.processes.length} Processes`;
        }

        const simTqElem = document.getElementById('sim-tq-val');
        if (simTqElem) {
            simTqElem.textContent = this.state.selectedAlgorithm === 'rr' ? `${this.state.timeQuantum} ms` : 'N/A';
        }

        // Conditional Time Quantum visibility
        const tqBox = document.getElementById('time-quantum-container');
        if (tqBox) {
            tqBox.classList.toggle('hidden', this.state.selectedAlgorithm !== 'rr');
        }
        const tqInput = document.getElementById('time-quantum');
        if (tqInput && document.activeElement !== tqInput) {
            tqInput.value = this.state.timeQuantum;
        }
    }


    renderAlgorithmInfo() {
        const algoKey = this.state.selectedAlgorithm;
        const meta = SchedulingEngine.getAlgorithmMeta(algoKey);
        if (!meta) return;

        // Sync active card highlight
        document.querySelectorAll('.algo-card').forEach(c => {
            const isMatch = c.getAttribute('data-algorithm') === algoKey;
            c.classList.toggle('active', isMatch);
            c.setAttribute('aria-checked', isMatch ? 'true' : 'false');
        });

        const titleElem = document.getElementById('algo-info-title');
        const badgeElem = document.getElementById('algo-info-badge');
        const descElem = document.getElementById('algo-info-desc');
        const advElem = document.getElementById('algo-info-advantages');
        const disadvElem = document.getElementById('algo-info-disadvantages');
        const compElem = document.getElementById('algo-info-complexity');
        const useElem = document.getElementById('algo-info-usecases');

        if (titleElem) titleElem.textContent = meta.name;
        if (badgeElem) {
            badgeElem.textContent = meta.type;
            badgeElem.className = `badge-tag ${meta.badgeClass || ''}`;
        }
        if (descElem) descElem.textContent = meta.description;

        if (advElem) {
            advElem.innerHTML = meta.advantages.map(adv => `<li>${adv}</li>`).join('');
        }
        if (disadvElem) {
            disadvElem.innerHTML = meta.disadvantages.map(dis => `<li>${dis}</li>`).join('');
        }
        if (compElem) compElem.textContent = meta.complexity;
        if (useElem) useElem.textContent = meta.useCases;
    }



    renderSystemMonitor(res, currentTick = 0, runningPid = 'IDLE', processStateMap = null) {
        const cpuUtilElem = document.getElementById('sys-mon-cpu-val');
        const cpuFill = document.getElementById('sys-mon-cpu-fill');
        const readyVal = document.getElementById('sys-mon-ready-val');
        const runningVal = document.getElementById('sys-mon-running-val');
        const completedVal = document.getElementById('sys-mon-completed-val');
        const clockVal = document.getElementById('sys-mon-clock-val');
        const statusBadge = document.getElementById('sys-status-badge');

        // Dual CPU Core elements
        const core1Status = document.getElementById('core-1-status');
        const core1Pid = document.getElementById('core-1-pid');
        const core1Box = document.getElementById('cpu-core-1');
        const core2Status = document.getElementById('core-2-status');
        const core2Pid = document.getElementById('core-2-pid');
        const core2Box = document.getElementById('cpu-core-2');

        // Clock
        if (clockVal) {
            clockVal.textContent = `T = ${currentTick}`;
        }

        // Status Badge
        if (statusBadge) {
            if (this.state.isPlaying) {
                statusBadge.textContent = `Running (${this.state.speedMultiplier}x)`;
                statusBadge.className = 'badge-pill-outline badge-state-running';
            } else if (res && currentTick >= res.totalTime && res.totalTime > 0) {
                statusBadge.textContent = 'Completed';
                statusBadge.className = 'badge-pill-outline badge-state-completed';
            } else if (currentTick > 0) {
                statusBadge.textContent = 'Paused';
                statusBadge.className = 'badge-pill-outline badge-state-waiting';
            } else {
                statusBadge.textContent = 'Engine Ready';
                statusBadge.className = 'badge-pill-outline';
            }
        }

        // Calculate CPU busy time up to currentTick
        let busyUnits = 0;
        if (res && res.ganttChart && currentTick > 0) {
            res.ganttChart.forEach(block => {
                if (block.processId !== 'IDLE') {
                    const execInBlock = Math.max(0, Math.min(block.endTime, currentTick) - block.startTime);
                    busyUnits += execInBlock;
                }
            });
        }
        const utilPercent = currentTick > 0 ? Math.round((busyUnits / currentTick) * 100) : 0;

        if (cpuUtilElem) cpuUtilElem.textContent = `${utilPercent}%`;
        if (cpuFill) cpuFill.style.width = `${utilPercent}%`;

        // Running process PID display
        if (runningVal) {
            runningVal.textContent = runningPid;
        }

        // Dual Core visualizer update
        if (core1Box) {
            if (runningPid !== 'IDLE') {
                core1Box.classList.add('busy');
                if (core1Status) core1Status.textContent = 'RUNNING';
                if (core1Pid) core1Pid.textContent = runningPid;
            } else {
                core1Box.classList.remove('busy');
                if (core1Status) core1Status.textContent = 'IDLE';
                if (core1Pid) core1Pid.textContent = 'None';
            }
        }
        if (core2Box) {
            core2Box.classList.remove('busy');
            if (core2Status) core2Status.textContent = 'IDLE';
            if (core2Pid) core2Pid.textContent = 'None';
        }

        // Counts for completed and ready
        let completedCount = 0;
        let readyCount = 0;
        if (processStateMap) {
            Object.values(processStateMap).forEach(info => {
                if (info.state === 'COMPLETED') completedCount++;
                if (info.state === 'READY') readyCount++;
            });
        }

        if (completedVal) completedVal.textContent = `${completedCount}`;
        if (readyVal) readyVal.textContent = `${readyCount} Jobs`;
    }

    renderReadyQueueFlow(runningPid = 'IDLE', processStateMap = null) {
        const pipeline = document.getElementById('ready-queue-flow-pipeline');
        if (!pipeline) return;

        if (this.state.processes.length === 0) {
            pipeline.innerHTML = `<div class="flow-step empty">Ready Queue Empty</div>`;
            return;
        }

        const readyProcesses = this.state.processes.filter(p => {
            const stateInfo = processStateMap ? processStateMap[p.id] : null;
            if (stateInfo) {
                return stateInfo.state === 'READY';
            }
            return p.state === 'READY';
        });

        if (readyProcesses.length === 0) {
            pipeline.innerHTML = `<div class="flow-step empty">No Jobs in Ready Queue</div>`;
            return;
        }

        let html = '';
        readyProcesses.slice(0, 4).forEach(p => {
            const stateInfo = processStateMap ? processStateMap[p.id] : null;
            const remBt = stateInfo ? stateInfo.remainingTime : p.burstTime;
            html += `<div class="flow-step">${p.id} (BT:${remBt})</div>`;
            html += `<span class="flow-step arrow">➔</span>`;
        });

        html += `<div class="flow-step cpu-target">CPU Core</div>`;
        pipeline.innerHTML = html;
    }

    animateValue(elem, start, end, duration = 450, decimals = 2, suffix = '') {
        if (!elem) return;
        const startTime = performance.now();
        const startVal = parseFloat(start) || 0;
        const endVal = parseFloat(end) || 0;
        if (Math.abs(startVal - endVal) < 0.001) {
            elem.textContent = `${endVal.toFixed(decimals)}${suffix}`;
            return;
        }

        const step = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = startVal + (endVal - startVal) * easeProgress;
            elem.textContent = `${current.toFixed(decimals)}${suffix}`;
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                elem.textContent = `${endVal.toFixed(decimals)}${suffix}`;
            }
        };
        requestAnimationFrame(step);
    }

    renderProcessTable(processStateMap = null) {
        if (!this.processTableBody) return;
        this.processTableBody.innerHTML = '';

        let searchPid = (this.filterSearchPid ? this.filterSearchPid.value : '').toLowerCase().trim();
        let filterState = this.filterState ? this.filterState.value : 'ALL';
        let filterPrio = this.filterPriority ? parseInt(this.filterPriority.value, 10) : NaN;

        let filtered = this.state.processes.filter(p => {
            const stateInfo = processStateMap ? processStateMap[p.id] : null;
            const currentState = stateInfo ? stateInfo.state : p.state;

            if (searchPid && !p.id.toLowerCase().includes(searchPid)) return false;
            if (filterState !== 'ALL' && currentState !== filterState) return false;
            if (!isNaN(filterPrio) && p.priority !== filterPrio) return false;
            return true;
        });

        if (filtered.length === 0) {
            this.processTableEmpty.classList.remove('hidden');
            return;
        }
        this.processTableEmpty.classList.add('hidden');

        filtered.forEach(p => {
            const stateInfo = processStateMap ? processStateMap[p.id] : null;
            const remTime = stateInfo ? stateInfo.remainingTime : p.remainingTime;
            const currentState = stateInfo ? stateInfo.state : p.state;

            let badgeClass = 'badge-state-ready';
            if (currentState === 'RUNNING') badgeClass = 'badge-state-running';
            else if (currentState === 'COMPLETED') badgeClass = 'badge-state-completed';
            else if (currentState === 'NOT ARRIVED') badgeClass = 'badge-state-waiting';

            const tr = document.createElement('tr');
            if (currentState === 'RUNNING') {
                tr.classList.add('tr-running-process');
            }

            tr.innerHTML = `
                <td><span class="pid-badge">${p.id}</span></td>
                <td>${p.arrivalTime} ms</td>
                <td>${p.burstTime} ms</td>
                <td>${p.priority}</td>
                <td>${remTime} ms</td>
                <td><span class="badge-state ${badgeClass}">${currentState}</span></td>
                <td class="text-right">
                    <div class="table-actions">
                        <button class="btn btn-secondary btn-icon btn-edit" data-id="${p.id}" title="Edit Process">✏️</button>
                        <button class="btn btn-ghost-danger btn-icon btn-delete" data-id="${p.id}" title="Delete Process">🗑️</button>
                    </div>
                </td>
            `;

            tr.querySelector('.btn-edit').addEventListener('click', () => this.startEditProcess(p.id));
            tr.querySelector('.btn-delete').addEventListener('click', () => this.state.deleteProcess(p.id));

            this.processTableBody.appendChild(tr);
        });
    }

    renderDashboardQueue() {
        if (!this.dashQueueBody) return;
        this.dashQueueBody.innerHTML = '';

        if (this.state.processes.length === 0) {
            this.dashQueueEmpty.classList.remove('hidden');
            return;
        }
        this.dashQueueEmpty.classList.add('hidden');

        this.state.processes.slice(0, 5).forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span class="pid-badge">${p.id}</span></td>
                <td>${p.arrivalTime}</td>
                <td>${p.burstTime}</td>
                <td>${p.priority}</td>
            `;
            this.dashQueueBody.appendChild(tr);
        });
    }

    renderResults(result) {
        const wtElem = document.getElementById('stat-avg-wt');
        const tatElem = document.getElementById('stat-avg-tat');
        const rtElem = document.getElementById('stat-avg-rt');
        const cpuUtilElem = document.getElementById('stat-cpu-util');

        if (wtElem) this.animateValue(wtElem, parseFloat(wtElem.textContent) || 0, result.avgWaitingTime, 450, 2);
        if (tatElem) this.animateValue(tatElem, parseFloat(tatElem.textContent) || 0, result.avgTurnaroundTime, 450, 2);
        if (rtElem) this.animateValue(rtElem, parseFloat(rtElem.textContent) || 0, result.avgResponseTime, 450, 2);
        if (cpuUtilElem) this.animateValue(cpuUtilElem, parseFloat(cpuUtilElem.textContent) || 0, result.cpuUtilization, 450, 1, '%');

        const body = document.getElementById('results-table-body');
        if (body) {
            body.innerHTML = '';
            result.processResults.forEach(p => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><span class="pid-badge">${p.id}</span></td>
                    <td>${p.arrivalTime}</td>
                    <td>${p.burstTime}</td>
                    <td>${p.priority}</td>
                    <td>${p.completionTime}</td>
                    <td>${p.turnaroundTime}</td>
                    <td>${p.waitingTime}</td>
                    <td>${p.responseTime}</td>
                `;
                body.appendChild(tr);
            });
        }
    }

    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            const active = document.activeElement;
            if (active && (active.tagName === 'INPUT' || active.tagName === 'SELECT' || active.tagName === 'TEXTAREA')) {
                return;
            }

            if (e.code === 'Space') {
                e.preventDefault();
                if (this.state.isPlaying) this.state.pauseSimulation();
                else this.state.playSimulation();
            } else if (e.code === 'KeyR' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                this.state.resetSimulation();
            } else if (e.code === 'KeyN' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                this.switchView('process-manager');
                const atInput = document.getElementById('arrival-time');
                if (atInput) atInput.focus();
            } else if (e.code === 'Delete') {
                if (this.state.processes.length > 0) {
                    const last = this.state.processes[this.state.processes.length - 1];
                    this.state.deleteProcess(last.id);
                }
            } else if ((e.ctrlKey || e.metaKey) && e.code === 'KeyE') {
                e.preventDefault();
                this.exportCSV();
            } else if ((e.ctrlKey || e.metaKey) && e.code === 'KeyB') {
                e.preventDefault();
                if (this.btnCompare) this.btnCompare.click();
            }
        });
    }

    downloadGanttPNG() {
        const container = document.getElementById('gantt-bar-container');
        if (!container) return;

        const canvas = document.createElement('canvas');
        const width = Math.max(900, container.scrollWidth || 900);
        const height = 180;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#070A14';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('CPU SCHEDULER — GANTT TIMELINE REPORT', 20, 30);

        ctx.fillStyle = '#9CA3AF';
        ctx.font = '12px sans-serif';
        ctx.fillText(`Algorithm: ${this.state.selectedAlgorithm.toUpperCase()} | Generated: ${new Date().toLocaleString()}`, 20, 50);

        const result = this.state.lastSimulationResult;
        if (result && result.ganttChart) {
            const totalDuration = result.totalTime || 1;
            const barY = 70;
            const barHeight = 60;
            const startX = 20;
            const availableWidth = width - 40;

            const colorMap = {
                'P1': '#3B82F6', 'P2': '#06B6D4', 'P3': '#8B5CF6', 'P4': '#EC4899',
                'P5': '#10B981', 'P6': '#F59E0B', 'P7': '#6366F1', 'IDLE': '#374151'
            };

            result.ganttChart.forEach(block => {
                const blockWidth = ((block.endTime - block.startTime) / totalDuration) * availableWidth;
                const x = startX + (block.startTime / totalDuration) * availableWidth;

                ctx.fillStyle = colorMap[block.processId] || '#3B82F6';
                ctx.fillRect(x, barY, blockWidth, barHeight);

                ctx.strokeStyle = 'rgba(0,0,0,0.4)';
                ctx.strokeRect(x, barY, blockWidth, barHeight);

                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(block.processId, x + blockWidth / 2, barY + barHeight / 2 + 4);
            });
        }

        const link = document.createElement('a');
        link.download = `gantt_timeline_${this.state.selectedAlgorithm}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        ToastManager.show("Downloaded Gantt Chart PNG screenshot.", "success");
    }

    exportJSON() {
        const data = {
            metadata: {
                title: "CPU Scheduling Simulation Report",
                algorithm: this.state.selectedAlgorithm,
                timeQuantum: this.state.timeQuantum,
                timestamp: new Date().toISOString()
            },
            processes: this.state.processes,
            results: this.state.lastSimulationResult
        };
        const str = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const link = document.createElement('a');
        link.setAttribute("href", str);
        link.setAttribute("download", `cpu_simulation_${this.state.selectedAlgorithm}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        ToastManager.show("JSON Export downloaded successfully.", "success");
    }

    exportCSV() {
        const result = this.state.lastSimulationResult;
        if (!result) {
            ToastManager.show("Please run a simulation before exporting CSV.", "warning");
            return;
        }

        const headers = ["Process ID", "Arrival Time", "Burst Time", "Priority", "Completion Time", "Turnaround Time", "Waiting Time", "Response Time"];
        const rows = result.processResults.map(p => [
            p.id, p.arrivalTime, p.burstTime, p.priority, p.completionTime, p.turnaroundTime, p.waitingTime, p.responseTime
        ]);

        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `cpu_scheduling_${result.algorithmId}_report.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        ToastManager.show("CSV Export downloaded successfully.", "success");
    }

    exportExcel() {
        const result = this.state.lastSimulationResult;
        if (!result) {
            ToastManager.show("Please run a simulation before exporting Excel report.", "warning");
            return;
        }

        const headers = ["Process ID", "Arrival Time", "Burst Time", "Priority", "Completion Time", "Turnaround Time", "Waiting Time", "Response Time"];
        const rows = result.processResults.map(p => [
            p.id, p.arrivalTime, p.burstTime, p.priority, p.completionTime, p.turnaroundTime, p.waitingTime, p.responseTime
        ]);

        let csvContent = "\uFEFF" + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `cpu_scheduling_${result.algorithmId}_excel.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        ToastManager.show("Excel Report downloaded successfully.", "success");
    }
}

/* ==========================================================================
   7. STARTUP SPLASH SCREEN ANIMATION ENGINE
   ========================================================================== */
class SplashScreen {
    constructor() {
        this.splash = document.getElementById('splash-screen');
        this.progressBar = document.getElementById('splash-progress-bar');
        this.statusText = document.getElementById('splash-status-text');
        this.percentText = document.getElementById('splash-percent-text');
        this.terminalLog = document.getElementById('splash-terminal-log');
        if (!this.splash) return;

        this.bootSequence = [
            { text: 'Initializing Scheduler...', percent: 15 },
            { text: 'Loading Scheduling Algorithms...', percent: 30 },
            { text: 'Building Process Queue...', percent: 45 },
            { text: 'Starting Simulation Engine...', percent: 60 },
            { text: 'Loading Analytics Module...', percent: 75 },
            { text: 'Initializing Gantt Renderer...', percent: 88 },
            { text: 'Optimizing Performance...', percent: 96 },
            { text: 'System Ready', percent: 100 }
        ];

        this.initDotAnimation();
        this.playStartupChime();
        this.startBootSequence();
    }

    playStartupChime() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);

            gain.gain.setValueAtTime(0.04, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.45);
        } catch (e) {
            // Audio Context policy silently ignored
        }
    }

    initDotAnimation() {
        let dots = 1;
        this.dotInterval = setInterval(() => {
            dots = (dots % 3) + 1;
            const dotElem = document.querySelector('.dot-anim');
            if (dotElem) {
                dotElem.textContent = '.'.repeat(dots);
            }
        }, 250);
    }

    startBootSequence() {
        let stepIndex = 0;
        const totalSteps = this.bootSequence.length;

        const processStep = () => {
            if (stepIndex >= totalSteps) return;

            const step = this.bootSequence[stepIndex];

            // Add line to terminal log
            if (this.terminalLog) {
                const line = document.createElement('div');
                line.className = 'terminal-line active';
                line.innerHTML = `<span class="check-icon">✓</span> <span>${step.text}</span>`;
                this.terminalLog.appendChild(line);

                // Auto-scroll
                this.terminalLog.scrollTop = this.terminalLog.scrollHeight;

                // Mark finished after 150ms
                setTimeout(() => {
                    line.classList.add('done');
                }, 150);
            }

            // Update Progress Bar & Percentage
            if (this.progressBar) {
                this.progressBar.style.width = `${step.percent}%`;
            }
            if (this.percentText) {
                this.percentText.textContent = `${step.percent}%`;
            }

            if (step.percent === 100) {
                clearInterval(this.dotInterval);
                if (this.statusText) {
                    this.statusText.innerHTML = `<span style="color: var(--success); font-weight: 700;">✓ System Ready</span>`;
                }

                // Smooth 500ms pause, then fade out transition to dashboard
                setTimeout(() => {
                    if (this.splash) {
                        this.splash.classList.add('fade-out');
                    }
                }, 500);
            } else {
                stepIndex++;
                setTimeout(processStep, 210);
            }
        };

        // Start first step after 100ms
        setTimeout(processStep, 100);
    }
}

/* ==========================================================================
   8. INITIALIZATION
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    new SplashScreen();
    new ParticleBackground('particle-canvas');
    const state = new SimulatorState();
    const ui = new UIController(state);
    ui.init();
});
