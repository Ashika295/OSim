import { useState } from "react";
import { simulateMemoryAllocation } from "./algorithms/memory";
import "./MemoryPage.css";

const initialBlocks = [
  { id: "B1", size: 100 },
  { id: "B2", size: 250 },
  { id: "B3", size: 200 },
  { id: "B4", size: 300 },
  { id: "B5", size: 150 },
];

const initialProcesses = [
  { id: "P1", size: 115 },
  { id: "P2", size: 200 },
  { id: "P3", size: 90 },
  { id: "P4", size: 275 },
];

const algorithms = [
  { value: "FIRST_FIT", label: "First Fit" },
  { value: "BEST_FIT", label: "Best Fit" },
  { value: "WORST_FIT", label: "Worst Fit" },
];

export default function MemoryPage() {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [processes, setProcesses] = useState(initialProcesses);
  const [algorithm, setAlgorithm] = useState("FIRST_FIT");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [nextBlock, setNextBlock] = useState(6);
  const [nextProcess, setNextProcess] = useState(5);

  function updateBlock(index, field, value) {
    setBlocks((current) =>
      current.map((block, i) =>
        i === index
          ? { ...block, [field]: field === "id" ? value : Number(value) }
          : block
      )
    );
    setResult(null);
    setError("");
  }

  function updateProcess(index, field, value) {
    setProcesses((current) =>
      current.map((process, i) =>
        i === index
          ? { ...process, [field]: field === "id" ? value : Number(value) }
          : process
      )
    );
    setResult(null);
    setError("");
  }

  function addBlock() {
    setBlocks((current) => [
      ...current,
      { id: `B${nextBlock}`, size: 100 },
    ]);
    setNextBlock((current) => current + 1);
    setResult(null);
    setError("");
  }

  function addProcess() {
    setProcesses((current) => [
      ...current,
      { id: `P${nextProcess}`, size: 50 },
    ]);
    setNextProcess((current) => current + 1);
    setResult(null);
    setError("");
  }

  function removeBlock(index) {
    setBlocks((current) => current.filter((_, i) => i !== index));
    setResult(null);
    setError("");
  }

  function removeProcess(index) {
    setProcesses((current) => current.filter((_, i) => i !== index));
    setResult(null);
    setError("");
  }

  function runSimulation() {
    try {
      const simulation = simulateMemoryAllocation(
        blocks,
        processes,
        algorithm
      );
      setResult(simulation);
      setError("");
    } catch (err) {
      setResult(null);
      setError(err.message || "Unable to run the simulation.");
    }
  }

  function resetSimulation() {
    setBlocks(initialBlocks);
    setProcesses(initialProcesses);
    setAlgorithm("FIRST_FIT");
    setResult(null);
    setError("");
    setNextBlock(6);
    setNextProcess(5);
  }

  const summary = result?.summary;

  return (
    <div className="memory-page">
      <div className="memory-heading">
        <div>
          <p className="memory-eyebrow">MEMORY MANAGEMENT</p>
          <h1>Memory Allocation</h1>
          <p className="memory-description">
            Compare allocation strategies and inspect how memory is assigned
            to processes.
          </p>
        </div>
        <div className="memory-status">
          <span />
          Simulation Ready
        </div>
      </div>

      <section className="memory-panel">
        <div className="memory-panel-heading">
          <div>
            <h2>Algorithm Configuration</h2>
            <p>Select a strategy to control how processes receive memory.</p>
          </div>
        </div>

        <div className="memory-controls">
          <label>
            Allocation Algorithm
            <select
              value={algorithm}
              onChange={(event) => {
                setAlgorithm(event.target.value);
                setResult(null);
              }}
            >
              {algorithms.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <div className="memory-actions">
            <button className="memory-run" onClick={runSimulation}>
              Run Simulation
            </button>
            <button className="memory-reset" onClick={resetSimulation}>
              Reset
            </button>
          </div>
        </div>
      </section>

      <section className="memory-panel">
        <div className="memory-panel-heading">
          <div>
            <h2>Memory Blocks</h2>
            <p>Set the capacity of each available memory block.</p>
          </div>
          <button className="memory-add" onClick={addBlock}>
            + Add Block
          </button>
        </div>

        <div className="memory-table-wrap">
          <table className="memory-table">
            <thead>
              <tr>
                <th>Block ID</th>
                <th>Capacity (units)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {blocks.map((block, index) => (
                <tr key={`${index}-${block.id}`}>
                  <td>
                    <input
                      aria-label={`Block ${index + 1} ID`}
                      value={block.id}
                      onChange={(event) =>
                        updateBlock(index, "id", event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      aria-label={`${block.id} capacity`}
                      type="number"
                      min="1"
                      step="1"
                      value={block.size}
                      onChange={(event) =>
                        updateBlock(index, "size", event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <button
                      className="memory-remove"
                      disabled={blocks.length === 1}
                      onClick={() => removeBlock(index)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="memory-panel">
        <div className="memory-panel-heading">
          <div>
            <h2>Process Requests</h2>
            <p>Enter the amount of memory required by each process.</p>
          </div>
          <button className="memory-add" onClick={addProcess}>
            + Add Process
          </button>
        </div>

        <div className="memory-table-wrap">
          <table className="memory-table">
            <thead>
              <tr>
                <th>Process ID</th>
                <th>Requested Memory (units)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {processes.map((process, index) => (
                <tr key={`${index}-${process.id}`}>
                  <td>
                    <input
                      aria-label={`Process ${index + 1} ID`}
                      value={process.id}
                      onChange={(event) =>
                        updateProcess(index, "id", event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      aria-label={`${process.id} requested memory`}
                      type="number"
                      min="1"
                      step="1"
                      value={process.size}
                      onChange={(event) =>
                        updateProcess(index, "size", event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <button
                      className="memory-remove"
                      disabled={processes.length === 1}
                      onClick={() => removeProcess(index)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="memory-hint">
          Processes are allocated in the order shown above. All sizes must be
          positive integers.
        </p>
      </section>

      {error && <div className="memory-error">{error}</div>}

      {result && (
        <>
          <section className="memory-panel">
            <div className="memory-panel-heading">
              <div>
                <h2>Allocation Summary</h2>
                <p>
                  Results for{" "}
                  {algorithms.find((item) => item.value === algorithm)?.label}
                </p>
              </div>
            </div>

            <div className="memory-metrics">
              <Metric label="Total Memory" value={summary.totalMemory} />
              <Metric label="Allocated Memory" value={summary.allocatedMemory} />
              <Metric label="Free Memory" value={summary.freeMemory} />
              <Metric
                label="Memory Utilization"
                value={`${summary.utilization.toFixed(2)}%`}
              />
              <Metric label="Successful Allocations" value={summary.allocationCount} />
              <Metric label="Failed Allocations" value={summary.failedAllocations} />
            </div>
          </section>

          <section className="memory-panel">
            <div className="memory-panel-heading">
              <div>
                <h2>Memory Layout</h2>
                <p>Allocated and remaining capacity in each block.</p>
              </div>
            </div>

            <div className="memory-layout">
              {result.blocks.map((block) => {
                const used = block.size - block.remaining;
                const usedPercent = (used / block.size) * 100;

                return (
                  <div className="memory-block-visual" key={block.id}>
                    <div className="memory-block-title">
                      <strong>{block.id}</strong>
                      <span>{block.size} units</span>
                    </div>

                    <div className="memory-bar">
                      <div
                        className="memory-used"
                        style={{ width: `${usedPercent}%` }}
                      />
                    </div>

                    <div className="memory-block-details">
                      <span>Used: {used}</span>
                      <span>Free: {block.remaining}</span>
                    </div>

                    <div className="memory-allocations">
                      {block.allocatedProcesses.length > 0
                        ? block.allocatedProcesses.join(", ")
                        : "No processes allocated"}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="memory-hint">
              Each bar shows the proportion of its block currently allocated.
            </p>
          </section>

          <section className="memory-panel">
            <div className="memory-panel-heading">
              <div>
                <h2>Allocation Results</h2>
                <p>Check where each process was placed.</p>
              </div>
            </div>

            <div className="memory-table-wrap">
              <table className="memory-table">
                <thead>
                  <tr>
                    <th>Process</th>
                    <th>Requested Size</th>
                    <th>Assigned Block</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((process) => (
                    <tr key={process.id}>
                      <td>{process.id}</td>
                      <td>{process.size}</td>
                      <td>{process.blockId || "—"}</td>
                      <td>
                        <span
                          className={
                            process.allocated
                              ? "memory-result-success"
                              : "memory-result-failed"
                          }
                        >
                          {process.allocated ? "Allocated" : "Not allocated"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="memory-metric">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}