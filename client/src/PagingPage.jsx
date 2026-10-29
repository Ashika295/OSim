
import { useState } from "react";
import { simulatePaging, comparePagingAlgorithms } from "./algorithms/paging";
import "./PagingPage.css";

const initialPages = "7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2";

const algorithmNames = {
  FIFO: "First In, First Out",
  LRU: "Least Recently Used",
  OPTIMAL: "Optimal Replacement",
};

export default function PagingPage() {
  const [pageInput, setPageInput] = useState(initialPages);
  const [frameCount, setFrameCount] = useState(3);
  const [algorithm, setAlgorithm] = useState("FIFO");
  const [result, setResult] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [error, setError] = useState("");

  function parsePages() {
    const parts = pageInput.trim().split(/[,\s]+/);

    if (!pageInput.trim() || parts.some((part) => !/^\d+$/.test(part))) {
      throw new Error("Enter page numbers separated by commas or spaces.");
    }

    return parts.map(Number);
  }

  function runSimulation() {
    try {
      const pages = parsePages();
      const simulation = simulatePaging(pages, Number(frameCount), algorithm);

      setResult(simulation);
      setComparison(null);
      setError("");
    } catch (err) {
      setResult(null);
      setError(err.message || "Unable to run the simulation.");
    }
  }

  function runComparison() {
    try {
      const pages = parsePages();
      const results = comparePagingAlgorithms(pages, Number(frameCount));

      setComparison(results);
      setResult(null);
      setError("");
    } catch (err) {
      setComparison(null);
      setError(err.message || "Unable to compare algorithms.");
    }
  }

  function resetSimulation() {
    setPageInput(initialPages);
    setFrameCount(3);
    setAlgorithm("FIFO");
    setResult(null);
    setComparison(null);
    setError("");
  }

  const activeHistory = result?.history || [];

  return (
    <div className="paging-page">
      <section className="paging-intro">
        <div>
          <div className="paging-eyebrow">VIRTUAL MEMORY LAB</div>
          <h2>Page Replacement Simulator</h2>
          <p>
            Explore how operating systems manage memory frames when pages
            are requested and physical memory is limited.
          </p>
        </div>
        <div className="paging-live-badge">
          <span />
          SIMULATION READY
        </div>
      </section>

      <section className="paging-panel paging-controls">
        <div className="paging-panel-heading">
          <div>
            <span className="paging-step">01</span>
            <div>
              <h3>Simulation configuration</h3>
              <p>Choose your page sequence and memory capacity.</p>
            </div>
          </div>
        </div>

        <label className="paging-field">
          <span>Page reference string</span>
          <input
            value={pageInput}
            onChange={(event) => setPageInput(event.target.value)}
            placeholder="Example: 7, 0, 1, 2, 0, 3"
          />
          <small>Separate page numbers using commas or spaces.</small>
        </label>

        <div className="paging-config-grid">
          <label className="paging-field">
            <span>Number of frames</span>
            <select
              value={frameCount}
              onChange={(event) => setFrameCount(Number(event.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
                <option value={count} key={count}>
                  {count} {count === 1 ? "frame" : "frames"}
                </option>
              ))}
            </select>
          </label>

          <label className="paging-field">
            <span>Replacement algorithm</span>
            <select
              value={algorithm}
              onChange={(event) => setAlgorithm(event.target.value)}
            >
              <option value="FIFO">FIFO</option>
              <option value="LRU">LRU</option>
              <option value="OPTIMAL">Optimal</option>
            </select>
          </label>
        </div>

        <div className="paging-actions">
          <button className="paging-primary-button" onClick={runSimulation}>
            Run simulation
          </button>
          <button className="paging-secondary-button" onClick={runComparison}>
            Compare algorithms
          </button>
          <button className="paging-reset-button" onClick={resetSimulation}>
            Reset
          </button>
        </div>

        {error && <div className="paging-error">{error}</div>}
      </section>

      {result && (
        <>
          <section className="paging-metrics">
            <div className="paging-metric-card">
              <span>Total references</span>
              <strong>{result.summary.totalReferences}</strong>
              <small>Pages requested</small>
            </div>
            <div className="paging-metric-card">
              <span>Page faults</span>
              <strong className="paging-fault-number">
                {result.summary.faults}
              </strong>
              <small>Pages not in memory</small>
            </div>
            <div className="paging-metric-card">
              <span>Page hits</span>
              <strong className="paging-hit-number">
                {result.summary.hits}
              </strong>
              <small>Pages already in memory</small>
            </div>
            <div className="paging-metric-card">
              <span>Fault rate</span>
              <strong>{result.summary.faultRate.toFixed(1)}%</strong>
              <small>
                Hit rate: {result.summary.hitRate.toFixed(1)}%
              </small>
            </div>
          </section>

          <section className="paging-panel">
            <div className="paging-panel-heading">
              <div>
                <span className="paging-step">02</span>
                <div>
                  <h3>Frame-by-frame simulation</h3>
                  <p>
                    {algorithmNames[result.algorithm]} · {result.frameCount} frames
                  </p>
                </div>
              </div>
              <span className="paging-result-count">
                {activeHistory.length} STEPS
              </span>
            </div>

            <div className="paging-reference-strip">
              {result.referenceString.map((page, index) => (
                <div className="paging-reference-item" key={index}>
                  <small>{index + 1}</small>
                  <strong>{page}</strong>
                  <span
                    className={
                      result.history[index].hit
                        ? "paging-hit-dot"
                        : "paging-fault-dot"
                    }
                  />
                </div>
              ))}
            </div>

            <div className="paging-table-wrap">
              <table className="paging-table">
                <thead>
                  <tr>
                    <th>Step</th>
                    <th>Page</th>
                    {Array.from({ length: result.frameCount }, (_, index) => (
                      <th key={index}>Frame {index + 1}</th>
                    ))}
                    <th>Status</th>
                    <th>Replaced</th>
                  </tr>
                </thead>
                <tbody>
                  {result.history.map((step) => (
                    <tr key={step.step}>
                      <td>{step.step}</td>
                      <td className="paging-page-number">{step.page}</td>
                      {Array.from({ length: result.frameCount }, (_, index) => (
                        <td key={index}>
                          <span
                            className={`paging-frame-cell ${
                              step.frames[index] !== undefined
                                ? "paging-frame-filled"
                                : ""
                            } ${
                              step.replaced !== null &&
                              step.frames[index] === step.page &&
                              !step.hit
                                ? "paging-frame-replaced"
                                : ""
                            }`}
                          >
                            {step.frames[index] ?? "—"}
                          </span>
                        </td>
                      ))}
                      <td>
                        <span
                          className={
                            step.hit
                              ? "paging-status-hit"
                              : "paging-status-fault"
                          }
                        >
                          {step.hit ? "HIT" : "FAULT"}
                        </span>
                      </td>
                      <td>{step.replaced ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="paging-legend">
              <span><i className="paging-hit-dot" /> Page hit</span>
              <span><i className="paging-fault-dot" /> Page fault</span>
            </div>
          </section>
        </>
      )}

      {comparison && (
        <section className="paging-panel">
          <div className="paging-panel-heading">
            <div>
              <span className="paging-step">03</span>
              <div>
                <h3>Algorithm comparison</h3>
                <p>All algorithms use the same reference string and frame count.</p>
              </div>
            </div>
          </div>

          <div className="paging-comparison-grid">
            {comparison.map((item) => (
              <article className="paging-comparison-card" key={item.algorithm}>
                <span className="paging-comparison-name">
                  {item.algorithm}
                </span>
                <h4>{algorithmNames[item.algorithm]}</h4>
                <div className="paging-comparison-stat">
                  <span>Page faults</span>
                  <strong>{item.summary.faults}</strong>
                </div>
                <div className="paging-comparison-stat">
                  <span>Page hits</span>
                  <strong>{item.summary.hits}</strong>
                </div>
                <div className="paging-comparison-stat">
                  <span>Fault rate</span>
                  <strong>{item.summary.faultRate.toFixed(1)}%</strong>
                </div>
              </article>
            ))}
          </div>

          <p className="paging-comparison-note">
            Optimal provides the theoretical minimum number of page faults
            for the given reference string and frame count.
          </p>
        </section>
      )}

      {!result && !comparison && !error && (
        <section className="paging-empty-state">
          <div className="paging-empty-icon">▦</div>
          <h3>Your simulation is ready</h3>
          <p>
            Run a simulation to inspect frame changes, page hits, and page
            faults, or compare all three replacement algorithms.
          </p>
        </section>
      )}
    </div>
  );
}
