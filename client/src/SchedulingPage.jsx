
import { useState } from "react";
import { simulateScheduling } from "./algorithms/scheduling";
import "./SchedulingPage.css";

const initialProcesses = [
  { id: "P1", arrivalTime: 0, burstTime: 5, priority: 2 },
  { id: "P2", arrivalTime: 1, burstTime: 3, priority: 1 },
  { id: "P3", arrivalTime: 2, burstTime: 1, priority: 3 },
];

const algorithms = [
  { value: "FCFS", label: "First Come First Serve" },
  { value: "SJF", label: "Shortest Job First" },
  { value: "SRTF", label: "Shortest Remaining Time First" },
  { value: "PRIORITY", label: "Priority Scheduling" },
  { value: "RR", label: "Round Robin" },
];

export default function SchedulingPage() {
  const [processes, setProcesses] = useState(initialProcesses);
  const [algorithm, setAlgorithm] = useState("FCFS");
  const [quantum, setQuantum] = useState(2);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [nextId, setNextId] = useState(4);

  function updateProcess(index, field, value) {
    setProcesses((current) =>
      current.map((process, i) =>
        i === index
          ? {
              ...process,
              [field]: field === "id" ? value : Number(value),
            }
          : process
      )
    );
    setResult(null);
    setError("");
  }

  function addProcess() {
    setProcesses((current) => [
      ...current,
      {
        id: `P${nextId}`,
        arrivalTime: 0,
        burstTime: 1,
        priority: 1,
      },
    ]);
    setNextId((current) => current + 1);
    setResult(null);
    setError("");
  }

  function removeProcess(index) {
    setProcesses((current) =>
      current.filter((_, i) => i !== index)
    );
    setResult(null);
    setError("");
  }

  function runSimulation() {
    try {
      setError("");
      setResult(simulateScheduling(processes, algorithm, Number(quantum)));
    } catch (err) {
      setResult(null);
      setError(err.message || "Unable to run the simulation.");
    }
  }

  function resetSimulation() {
    setProcesses(initialProcesses);
    setAlgorithm("FCFS");
    setQuantum(2);
    setResult(null);
    setError("");
    setNextId(4);
  }

  const summary = result?.summary;

  return (
    <div className="schedule-page">
      <div className="schedule-heading">
        <div>
          <p className="schedule-eyebrow">PROCESS MANAGEMENT</p>
          <h1>CPU Scheduling</h1>
          <p className="schedule-description">
            Configure processes, run scheduling algorithms, and compare performance.
          </p>
        </div>
        <div className="schedule-status">
          <span className="schedule-status-dot" />
          Simulation Ready
        </div>
      </div>

      <section className="schedule-panel">
        <div className="schedule-panel-heading">
          <div>
            <h2>Algorithm Configuration</h2>
            <p>Choose an algorithm and configure its parameters.</p>
          </div>
        </div>

        <div className="schedule-controls">
          <label>
            Scheduling Algorithm
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

          {algorithm === "RR" && (
            <label>
              Time Quantum
              <input
                type="number"
                min="1"
                step="1"
                value={quantum}
                onChange={(event) => {
                  setQuantum(event.target.value);
                  setResult(null);
                }}
              />
            </label>
          )}

          <div className="schedule-actions">
            <button className="schedule-run" onClick={runSimulation}>
              Run Simulation
            </button>
            <button className="schedule-reset" onClick={resetSimulation}>
              Reset
            </button>
          </div>
        </div>
      </section>

      <section className="schedule-panel">
        <div className="schedule-panel-heading">
          <div>
            <h2>Process Input</h2>
            <p>Arrival time and burst time must be non-negative and positive integers, respectively.</p>
          </div>
          <button className="schedule-add" onClick={addProcess}>
            + Add Process
          </button>
        </div>

        <div className="schedule-table-wrap">
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Process ID</th>
                <th>Arrival Time</th>
                <th>Burst Time</th>
                <th>Priority</th>
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
                      aria-label={`${process.id} arrival time`}
                      type="number"
                      min="0"
                      step="1"
                      value={process.arrivalTime}
                      onChange={(event) =>
                        updateProcess(index, "arrivalTime", event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      aria-label={`${process.id} burst time`}
                      type="number"
                      min="1"
                      step="1"
                      value={process.burstTime}
                      onChange={(event) =>
                        updateProcess(index, "burstTime", event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      aria-label={`${process.id} priority`}
                      type="number"
                      step="1"
                      value={process.priority}
                      onChange={(event) =>
                        updateProcess(index, "priority", event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <button
                      className="schedule-remove"
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
        <p className="schedule-hint">
          For Priority Scheduling, a smaller priority number means higher priority.
        </p>
      </section>

      {error && <div className="schedule-error">{error}</div>}

      {result && (
        <>
          <section className="schedule-panel">
            <div className="schedule-panel-heading">
              <div>
                <h2>Performance Summary</h2>
                <p>{algorithms.find((item) => item.value === algorithm)?.label}</p>
              </div>
            </div>

            <div className="schedule-metrics">
              <Metric label="Avg. Waiting Time" value={summary.averageWaitingTime.toFixed(2)} />
              <Metric label="Avg. Turnaround Time" value={summary.averageTurnaroundTime.toFixed(2)} />
              <Metric label="Avg. Response Time" value={summary.averageResponseTime.toFixed(2)} />
              <Metric label="CPU Utilization" value={`${summary.cpuUtilization.toFixed(2)}%`} />
              <Metric label="Throughput" value={summary.throughput.toFixed(3)} />
            </div>
          </section>

          <section className="schedule-panel">
            <div className="schedule-panel-heading">
              <div>
                <h2>Gantt Chart</h2>
                <p>Visual representation of CPU execution order.</p>
              </div>
            </div>

            <div className="schedule-gantt">
              {result.timeline.map((segment, index) => {
                const duration = segment.end - segment.start;
                return (
                  <div
                    className={`schedule-segment ${segment.id === "IDLE" ? "schedule-idle" : ""}`}
                    key={`${segment.id}-${segment.start}-${index}`}
                    style={{ flexGrow: duration, flexBasis: 0 }}
                    title={`${segment.id}: ${segment.start} to ${segment.end}`}
                  >
                    <strong>{segment.id}</strong>
                    <span>{duration} unit{duration === 1 ? "" : "s"}</span>
                  </div>
                );
              })}
            </div>

            <div className="schedule-time-labels">
              {result.timeline.map((segment, index) => (
                <span key={`${segment.start}-${index}`}>
                  {segment.start}
                </span>
              ))}
              <span>
                {result.timeline[result.timeline.length - 1]?.end ?? 0}
              </span>
            </div>
          </section>

          <section className="schedule-panel">
            <div className="schedule-panel-heading">
              <div>
                <h2>Process Metrics</h2>
                <p>Calculated values for every process.</p>
              </div>
            </div>

            <div className="schedule-table-wrap">
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th>Process</th>
                    <th>Arrival</th>
                    <th>Burst</th>
                    <th>Completion</th>
                    <th>Turnaround</th>
                    <th>Waiting</th>
                    <th>Response</th>
                  </tr>
                </thead>
                <tbody>
                  {result.metrics.map((process) => (
                    <tr key={process.id}>
                      <td>{process.id}</td>
                      <td>{process.arrivalTime}</td>
                      <td>{process.burstTime}</td>
                      <td>{process.completionTime}</td>
                      <td>{process.turnaroundTime}</td>
                      <td>{process.waitingTime}</td>
                      <td>{process.responseTime}</td>
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
    <div className="schedule-metric">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}
