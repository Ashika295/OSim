
import { useState } from "react";
import { detectDeadlock, bankersAlgorithm } from "./algorithms/deadlock";
import "./DeadlockPage.css";
import ResourceGraph from "./ResourceGraph";

const initialAvailable = "3, 3, 2";
const initialAllocation = "0, 1, 0; 2, 0, 0; 3, 0, 2; 2, 1, 1; 0, 0, 2";
const initialMaximum = "7, 5, 3; 3, 2, 2; 9, 0, 2; 2, 2, 2; 4, 3, 3";
const initialRequest = "0, 0, 0; 0, 2, 0; 0, 0, 0; 1, 0, 0; 0, 0, 2";

function parseMatrix(value, label) {
  const rows = value.trim().split(";");

  if (!value.trim()) {
    throw new Error(`${label} cannot be empty.`);
  }

  return rows.map((row) => {
    const parts = row.trim().split(/[,\s]+/);

    if (!parts.length || parts.some((part) => !/^\d+$/.test(part))) {
      throw new Error(`${label} must contain non-negative integers.`);
    }

    return parts.map(Number);
  });
}

function parseVector(value, label) {
  const vector = value.trim().split(/[,\s]+/);

  if (!value.trim() || vector.some((part) => !/^\d+$/.test(part))) {
    throw new Error(`${label} must contain non-negative integers.`);
  }

  return vector.map(Number);
}

export default function DeadlockPage() {
  const [availableInput, setAvailableInput] = useState(initialAvailable);
  const [allocationInput, setAllocationInput] = useState(initialAllocation);
  const [maximumInput, setMaximumInput] = useState(initialMaximum);
  const [requestInput, setRequestInput] = useState(initialRequest);
  const [mode, setMode] = useState("banker");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function runSimulation() {
    try {
      const allocation = parseMatrix(allocationInput, "Allocation matrix");

      let simulation;

      if (mode === "banker") {
        const available = parseVector(availableInput, "Available vector");
        const maximum = parseMatrix(maximumInput, "Maximum matrix");

        if (
          allocation.length !== maximum.length ||
          allocation.some((row, index) => row.length !== available.length) ||
          maximum.some((row) => row.length !== available.length)
        ) {
          throw new Error("Available, allocation, and maximum dimensions must match.");
        }

        simulation = bankersAlgorithm(available, allocation, maximum);
      } else {
        const request = parseMatrix(requestInput, "Request matrix");

        if (
          allocation.length !== request.length ||
          allocation.some((row, index) => row.length !== request[index].length)
        ) {
          throw new Error("Allocation and request matrices must have matching dimensions.");
        }

        simulation = detectDeadlock(allocation, request);
      }

      setResult(simulation);
      setError("");
    } catch (err) {
      setResult(null);
      setError(err.message || "Unable to run the simulation.");
    }
  }

  function resetSimulation() {
    setAvailableInput(initialAvailable);
    setAllocationInput(initialAllocation);
    setMaximumInput(initialMaximum);
    setRequestInput(initialRequest);
    setMode("banker");
    setResult(null);
    setError("");
  }

  const matrixForDisplay = mode === "banker" ? result?.need : null;

  return (
    <div className="deadlock-page">
      <section className="deadlock-intro">
        <div>
          <div className="deadlock-eyebrow">RESOURCE MANAGEMENT LAB</div>
          <h2>Deadlock Management</h2>
          <p>
            Explore safe execution sequences and identify processes that cannot
            proceed with the resources currently available.
          </p>
        </div>
        <div className="deadlock-live-badge">
          <span />
          SIMULATION READY
        </div>
      </section>

      <section className="deadlock-panel">
        <div className="deadlock-panel-heading">
          <div className="deadlock-step">01</div>
          <div>
            <h3>Simulation configuration</h3>
            <p>Enter resource values and choose the analysis method.</p>
          </div>
        </div>

        <label className="deadlock-field">
          <span>Analysis method</span>
          <select
            value={mode}
            onChange={(event) => {
              setMode(event.target.value);
              setResult(null);
              setError("");
            }}
          >
            <option value="banker">Banker's Algorithm — Safety Check</option>
            <option value="detect">Deadlock Detection Algorithm</option>
          </select>
        </label>

        <div className="deadlock-input-grid">
          {mode === "banker" && (
            <>
              <label className="deadlock-field">
                <span>Available vector</span>
                <input
                  value={availableInput}
                  onChange={(event) => setAvailableInput(event.target.value)}
                />
                <small>Comma-separated resource instances, e.g. 3, 3, 2.</small>
              </label>
              <label className="deadlock-field">
                <span>Maximum demand matrix</span>
                <textarea
                  rows={5}
                  value={maximumInput}
                  onChange={(event) => setMaximumInput(event.target.value)}
                />
                <small>One process per line; separate values with commas.</small>
              </label>
            </>
          )}

          <label className="deadlock-field">
            <span>Allocation matrix</span>
            <textarea
              rows={5}
              value={allocationInput}
              onChange={(event) => setAllocationInput(event.target.value)}
            />
            <small>One process per line; separate resource values with commas.</small>
          </label>

          {mode === "detect" && (
            <label className="deadlock-field">
              <span>Outstanding request matrix</span>
              <textarea
                rows={5}
                value={requestInput}
                onChange={(event) => setRequestInput(event.target.value)}
              />
              <small>Resources each process is still waiting to acquire.</small>
            </label>
          )}
        </div>

        <div className="deadlock-actions">
          <button className="deadlock-primary-button" onClick={runSimulation}>
            Run analysis
          </button>
          <button className="deadlock-reset-button" onClick={resetSimulation}>
            Reset
          </button>
        </div>

        {error && <div className="deadlock-error">{error}</div>}
      </section>

      {result && (
        <>
          <section className="deadlock-result-banner">
            <div className={result.safe ? "deadlock-result-icon safe" : "deadlock-result-icon unsafe"}>
              {result.safe ? "✓" : "!"}
            </div>
            <div>
              <span>ANALYSIS RESULT</span>
              <h3>{result.safe ? "Safe State" : mode === "banker" ? "Unsafe State" : "Deadlock Detected"}</h3>
              <p>
                {result.safe
                  ? "All processes can finish in a valid execution order."
                  : mode === "banker"
                    ? "A complete safe sequence could not be found for the current allocation."
                    : "Some processes cannot finish with the current outstanding requests."}
              </p>
            </div>
          </section>

          {mode === "banker" && result.need && (
            <section className="deadlock-panel">
              <div className="deadlock-panel-heading">
                <div className="deadlock-step">02</div>
                <div>
                  <h3>Need matrix</h3>
                  <p>Need = Maximum demand − Allocation.</p>
                </div>
              </div>
              <div className="deadlock-table-wrap">
                <table className="deadlock-table">
                  <thead>
                    <tr>
                      <th>Process</th>
                      {result.need[0].map((_, index) => (
                        <th key={index}>Resource {String.fromCharCode(65 + index)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.need.map((row, index) => (
                      <tr key={index}>
                        <td>P{index + 1}</td>
                        {row.map((value, resource) => (
                          <td key={resource}>{value}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section className="deadlock-panel">
            <div className="deadlock-panel-heading">
              <div className="deadlock-step">03</div>
              <div>
                <h3>Execution analysis</h3>
                <p>Processes are considered in order as resources become available.</p>
              </div>
            </div>

            {result.sequence.length > 0 ? (
              <div className="deadlock-sequence">
                {result.sequence.map((process, index) => (
                  <div className="deadlock-sequence-item" key={`${process}-${index}`}>
                    <span>{index + 1}</span>
                    <strong>{process}</strong>
                    {index < result.sequence.length - 1 && <i>→</i>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="deadlock-empty-sequence">No process can currently complete.</p>
            )}

            {result.deadlockedProcesses?.length > 0 && (
              <div className="deadlock-process-warning">
                Unable to complete: {result.deadlockedProcesses.join(", ")}
              </div>
            )}

            {result.unfinishedProcesses?.length > 0 && (
              <div className="deadlock-process-warning">
                Processes without a safe completion order: {result.unfinishedProcesses.join(", ")}
              </div>
            )}

            <div className="deadlock-resource-summary">
              <div>
                <span>Initial available</span>
                <strong>{result.available.join(", ")}</strong>
              </div>
              <div>
                <span>Final work vector</span>
                <strong>{result.finalWork.join(", ")}</strong>
              </div>
            </div>
          </section>
        </>
      )}

      {!result && !error && (
        <section className="deadlock-empty-state">
          <div className="deadlock-empty-icon">⌘</div>
          <h3>Ready to analyze resource allocation</h3>
          <p>
            Run the analysis to see the Need matrix, safe sequence, and
            unfinished processes.
          </p>
        </section>
      )}
      <section className="deadlock-panel">
  <ResourceGraph />
</section>
    </div>
  );
}
