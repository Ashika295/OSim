
import { useState } from "react";
import PagingPage from "./PagingPage";
import MemoryPage from "./MemoryPage";
import SchedulingPage from "./SchedulingPage";
import DeadlockPage from "./DeadlockPage";
import AnalysisPage from "./AnalysisPage";
import {
  Activity,
  Cpu,
  Layers3,
  Database,
  GitBranch,
  ChartNoAxesCombined,
  ChevronRight,
  CircleHelp,
  Clock3,
  MemoryStick,
  ArrowUpRight,
  Menu,
  X,
  Terminal,
  BookOpen,
  Settings,
  Zap,
} from "lucide-react";
import "./App.css";

const modules = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "process", label: "Process & CPU", icon: Cpu },
  { id: "memory", label: "Memory Management", icon: Layers3 },
  { id: "paging", label: "Virtual Memory", icon: Database },
  { id: "deadlock", label: "Deadlock & Resources", icon: GitBranch },
  { id: "analysis", label: "Analysis", icon: ChartNoAxesCombined },
];

const moduleInfo = {
  process: {
    title: "Process & CPU Scheduling",
    description:
      "Explore process execution, scheduling policies and performance metrics.",
    algorithms: ["FCFS", "SJF", "SRTF", "Priority", "Round Robin"],
    icon: Cpu,
  },
  memory: {
    title: "Memory Management",
    description:
      "Allocate memory blocks and investigate fragmentation and utilization.",
    algorithms: ["First Fit", "Best Fit", "Worst Fit"],
    icon: Layers3,
  },
  paging: {
    title: "Virtual Memory",
    description:
      "Simulate page replacement and inspect every frame transition.",
    algorithms: ["FIFO", "LRU", "Optimal"],
    icon: Database,
  },
  deadlock: {
    title: "Deadlock & Resources",
    description:
      "Explore resource allocation and determine whether a system is safe.",
    algorithms: ["Resource Allocation Graph", "Banker's Algorithm"],
    icon: GitBranch,
  },
  analysis: {
    title: "Performance Analysis",
    description:
      "Compare algorithms using consistent workloads and measurable results.",
    algorithms: ["Scheduling Comparison", "Page Fault Comparison", "Memory Analysis"],
    icon: ChartNoAxesCombined,
  },
};

function Sidebar({ active, onNavigate, open, onClose }) {
  return (
    <>
      {open && <div className="mobile-overlay" onClick={onClose} />}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon"><Terminal size={22} /></div>
          <div>
            <h1>OSim<span>.</span></h1>
            <p>OPERATING SYSTEM LAB</p>
          </div>
          <button className="mobile-close" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-label">WORKSPACE</div>
        <nav className="nav-list">
          {modules.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${active === item.id ? "active" : ""}`}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
              >
                <Icon size={19} strokeWidth={1.8} />
                <span>{item.label}</span>
                {active === item.id && <span className="active-indicator" />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="learning-card">
            <div className="learning-icon"><BookOpen size={18} /></div>
            <h3>Learn by exploring</h3>
            <p>Change inputs. Run algorithms. Understand why.</p>
          </div>
          <div className="sidebar-footer">
            <div className="status-dot" />
            <span>Simulation environment</span>
            <span className="version">v1.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}

function Overview({ onNavigate }) {
  const cards = [
    {
      id: "process",
      title: "CPU Scheduling",
      description: "Processes, execution order and waiting time.",
      icon: Cpu,
      color: "blue",
      tag: "5 ALGORITHMS",
    },
    {
      id: "memory",
      title: "Memory Management",
      description: "Allocation strategies and fragmentation.",
      icon: Layers3,
      color: "green",
      tag: "3 ALGORITHMS",
    },
    {
      id: "paging",
      title: "Virtual Memory",
      description: "Page faults, hits and replacement policies.",
      icon: Database,
      color: "purple",
      tag: "3 ALGORITHMS",
    },
    {
      id: "deadlock",
      title: "Deadlock & Resources",
      description: "Resource allocation and system safety.",
      icon: GitBranch,
      color: "orange",
      tag: "2 METHODS",
    },
  ];

  return (
    <>
      <section className="welcome-banner">
        <div className="welcome-content">
          <div className="eyebrow"><span /> INTERACTIVE LEARNING ENVIRONMENT</div>
          <h2>Understand the system.<br /><span>Master the algorithms.</span></h2>
          <p>
            An interactive laboratory for exploring operating system
            resource management, one simulation at a time.
          </p>
          <button className="primary-button" onClick={() => onNavigate("process")}>
            Explore CPU Scheduling <ChevronRight size={18} />
          </button>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit orbit-three" />
          <div className="hero-core"><Cpu size={42} /></div>
          <div className="orbit-node node-one"><Activity size={18} /></div>
          <div className="orbit-node node-two"><Database size={18} /></div>
          <div className="orbit-node node-three"><Layers3 size={18} /></div>
        </div>
      </section>
            <section className="dashboard-stats">
        <div className="dashboard-stat">
          <div className="dashboard-stat-icon blue">
            <Cpu size={20} />
          </div>
          <div>
            <p>Simulation Modules</p>
            <strong>04</strong>
            <span>Core OS concepts</span>
          </div>
        </div>

        <div className="dashboard-stat">
          <div className="dashboard-stat-icon purple">
            <Activity size={20} />
          </div>
          <div>
            <p>CPU Algorithms</p>
            <strong>05</strong>
            <span>Scheduling policies</span>
          </div>
        </div>

        <div className="dashboard-stat">
          <div className="dashboard-stat-icon green">
            <Database size={20} />
          </div>
          <div>
            <p>Paging Algorithms</p>
            <strong>03</strong>
            <span>Page replacement</span>
          </div>
        </div>

        <div className="dashboard-stat">
          <div className="dashboard-stat-icon orange">
            <Layers3 size={20} />
          </div>
          <div>
            <p>Memory Strategies</p>
            <strong>03</strong>
            <span>Allocation methods</span>
          </div>
        </div>
      </section>
      <div className="section-heading">
        <div>
          <h3>Simulation modules</h3>
          <p>Choose a subsystem to start exploring.</p>
        </div>
        <span className="section-count">04 MODULES</span>
      </div>

      <div className="module-grid">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              className="module-card"
              onClick={() => onNavigate(card.id)}
              style={{ "--card-index": index }}
            >
              <div className={`module-icon ${card.color}`}><Icon size={23} /></div>
              <div className="module-card-top"><span>{card.tag}</span><ArrowUpRight size={18} /></div>
              <h4>{card.title}</h4>
              <p>{card.description}</p>
              <div className="module-card-bottom">
                <span>Open module</span><ChevronRight size={17} />
              </div>
            </button>
          );
        })}
      </div>

      <section className="bottom-grid">
        <div className="panel quick-panel">
          <div className="panel-heading">
            <div><Zap size={18} /><h3>Getting started</h3></div>
          </div>
          <p className="panel-description">A simple workflow for every simulation.</p>
          <div className="workflow">
            <div><span>01</span><p><strong>Configure</strong><small>Define processes or resource inputs.</small></p></div>
            <ChevronRight size={16} />
            <div><span>02</span><p><strong>Simulate</strong><small>Run the selected algorithm.</small></p></div>
            <ChevronRight size={16} />
            <div><span>03</span><p><strong>Analyze</strong><small>Inspect results and compare policies.</small></p></div>
          </div>
        </div>
        <div className="panel status-panel">
          <div className="panel-heading">
            <div><Activity size={18} /><h3>System status</h3></div>
            <span className="live-label"><span /> READY</span>
          </div>
          <div className="status-row">
  <span>CPU scheduler</span>
  <span className="status-ready">Implemented</span>
</div>

<div className="status-row">
  <span>Memory simulator</span>
  <span className="status-ready">Implemented</span>
</div>

<div className="status-row">
  <span>Page replacement</span>
  <span className="status-ready">Implemented</span>
</div>

<div className="status-row">
  <span>Deadlock detection</span>
  <span className="status-ready">Implemented</span>
</div>
        </div>
      </section>
    </>
  );
}

function ModulePage({ id, onNavigate }) {
  if (id === "process") {
    return (
      <section className="module-workspace">
        <button
          className="secondary-button"
          onClick={() => onNavigate("overview")}
        >
          Back to overview
        </button>
        <SchedulingPage />
      </section>
    );
  }

  if (id === "memory") {
    return (
      <section className="module-workspace">
        <button
          className="secondary-button"
          onClick={() => onNavigate("overview")}
        >
          Back to overview
        </button>
        <MemoryPage />
      </section>
    );
  }
if (id === "paging") {
  return (
    <section className="module-workspace">
      <button
        className="secondary-button"
        onClick={() => onNavigate("overview")}
      >
        Back to overview
      </button>
      <PagingPage />
    </section>
  );
}
if (id === "deadlock") {
  return (
    <section className="module-workspace">
      <button
        className="secondary-button"
        onClick={() => onNavigate("overview")}
      >
        Back to overview
      </button>
      <DeadlockPage />
    </section>
  );
}
if (id === "analysis") {
  return <AnalysisPage />;
}
  const info = moduleInfo[id];
  const Icon = info.icon;

  return (
    <section className="module-workspace">
      <div className={`workspace-icon ${id}`}>
        <Icon size={28} />
      </div>

      <div className="eyebrow">
        <span /> SIMULATION WORKSPACE
      </div>

      <h2>{info.title}</h2>
      <p className="workspace-description">{info.description}</p>

      <div className="panel algorithm-panel">
        <div className="panel-heading">
          <div>
            <Zap size={18} />
            <h3>Available algorithms</h3>
          </div>
          <span className="section-count">
            {info.algorithms.length} OPTIONS
          </span>
        </div>

        <div className="algorithm-list">
          {info.algorithms.map((algorithm, index) => (
            <div className="algorithm-row" key={algorithm}>
              <span className="algorithm-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{algorithm}</span>
              <span className="algorithm-status">
                Implementation pending
              </span>
            </div>
          ))}
        </div>

        <div className="placeholder-note">
          <CircleHelp size={18} />
          <p>
            This workspace is ready for implementation.
            Interactive algorithms and results will be added
            in the next development stage.
          </p>
        </div>
      </div>

      <button
        className="secondary-button"
        onClick={() => onNavigate("overview")}
      >
        Back to overview
      </button>
    </section>
  );
}



export default function App() {
  const [active, setActive] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const currentModule = modules.find((item) => item.id === active);

  return (
    <div className="app-shell">
      <Sidebar
        active={active}
        onNavigate={setActive}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <Menu size={21} />
            </button>
            <div className="breadcrumb"><span>OSim</span><ChevronRight size={14} /><strong>{currentModule.label}</strong></div>
          </div>
          <div className="topbar-right">
            <div className="environment-label"><span /> LOCAL ENVIRONMENT</div>
            <div className="avatar">OS</div>
          </div>
        </header>

        <div className="page-content">
          {active === "overview" ? (
            <Overview onNavigate={setActive} />
          ) : (
            <ModulePage id={active} onNavigate={setActive} />
          )}
          <footer className="page-footer">
            <span>OSim <span className="footer-dot">•</span> Operating System Resource Management Simulator</span>
            <span><Clock3 size={13} /> Interactive learning environment</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

