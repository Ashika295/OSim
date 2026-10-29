
import { useState } from "react";
import "./AnalysisPage.css";
import { comparePagingAlgorithms } from "./algorithms/paging";
import { simulateScheduling } from "./algorithms/scheduling";
import { simulateMemoryAllocation } from "./algorithms/memory";

function MetricCards({ items }) {
  return (
    <div className="analysis-metrics">
      {items.map((item) => (
        <div className="analysis-metric-card" key={item.label}>
          <span className="analysis-metric-label">{item.label}</span>
          <strong className="analysis-metric-value">{item.value}</strong>
          <span className="analysis-metric-note">{item.note}</span>
        </div>
      ))}
    </div>
  );
}

function ComparisonChart({ title, results, getValue, valueLabel }) {
  if (!results || results.length === 0) return null;

  const values = results.map(getValue);
  const maxValue = Math.max(...values, 1);

  return (
    <div className="analysis-chart-card">
      <h4>{title}</h4>

      <div className="analysis-chart">
        {results.map((result, index) => {
          const value = getValue(result);
          const width = Math.max((value / maxValue) * 100, 2);

          return (
            <div className="analysis-chart-row" key={result.algorithm}>
              <span className="analysis-chart-label">
                {result.algorithm.replaceAll("_", " ")}
              </span>

              <div className="analysis-chart-track">
                <div
                  className="analysis-chart-bar"
                  style={{ width: `${width}%` }}
                />
              </div>

              <strong className="analysis-chart-value">
                {value.toFixed(2)} {valueLabel}
              </strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MemoryDonutChart({ result, totalMemory }) {
  const used = Number(result.summary.allocatedMemory) || 0;
  const free = Number(result.summary.freeMemory) || 0;

  const efficiency =
    totalMemory > 0 ? Math.min((used / totalMemory) * 100, 100) : 0;

  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const usedLength = (efficiency / 100) * circumference;

  return (
    <div className="memory-donut-card">
      <h4>{result.algorithm.replaceAll("_", " ")}</h4>

      <div className="memory-donut">
        <svg viewBox="0 0 150 150" role="img">
          <circle
            className="memory-donut-track"
            cx="75"
            cy="75"
            r={radius}
          />

          <circle
            className="memory-donut-used"
            cx="75"
            cy="75"
            r={radius}
            strokeDasharray={`${usedLength} ${circumference}`}
          />
        </svg>

        <div className="memory-donut-center">
          <strong>{efficiency.toFixed(1)}%</strong>
          <span>Utilization</span>
        </div>
      </div>

      <div className="memory-donut-legend">
        <div>
          <span className="memory-legend-dot used" />
          <span>Used Memory</span>
          <strong>{used}</strong>
        </div>

        <div>
          <span className="memory-legend-dot free" />
          <span>Free Memory</span>
          <strong>{free}</strong>
        </div>
      </div>

      <p className="memory-efficiency-note">
        Allocation efficiency: {efficiency.toFixed(2)}%
      </p>
    </div>
  );
}

function AnalysisPage() {
  const [section, setSection] = useState("cpu");

  return (
    <div className="analysis-page">
      <div className="analysis-header">
        <h1>Performance Analysis</h1>
        <p>
          Compare operating system algorithms and evaluate their performance.
        </p>
      </div>

      <div className="analysis-summary">
        <button
          type="button"
          className={`analysis-card ${section === "cpu" ? "selected" : ""}`}
          onClick={() => setSection("cpu")}
        >
          <h3>CPU Scheduling</h3>
          <p>Compare waiting time, turnaround time, and response time.</p>
          <span>5 Algorithms</span>
        </button>

        <button
          type="button"
          className={`analysis-card ${section === "paging" ? "selected" : ""}`}
          onClick={() => setSection("paging")}
        >
          <h3>Page Replacement</h3>
          <p>Compare page faults, hits, and replacement efficiency.</p>
          <span>3 Algorithms</span>
        </button>

        <button
          type="button"
          className={`analysis-card ${section === "memory" ? "selected" : ""}`}
          onClick={() => setSection("memory")}
        >
          <h3>Memory Allocation</h3>
          <p>Compare memory utilization and allocation success.</p>
          <span>3 Algorithms</span>
        </button>
      </div>

      <div className="analysis-placeholder">
        <h2>Algorithm Comparison</h2>
        <p>Choose a category to explore algorithm performance.</p>

        <div className="analysis-tabs">
          <button
            type="button"
            className={section === "cpu" ? "active" : ""}
            onClick={() => setSection("cpu")}
          >
            CPU Scheduling
          </button>

          <button
            type="button"
            className={section === "paging" ? "active" : ""}
            onClick={() => setSection("paging")}
          >
            Page Replacement
          </button>

          <button
            type="button"
            className={section === "memory" ? "active" : ""}
            onClick={() => setSection("memory")}
          >
            Memory Allocation
          </button>
        </div>

        {section === "cpu" && <CpuComparison />}
        {section === "paging" && <PagingComparison />}
        {section === "memory" && <MemoryComparison />}
      </div>
    </div>
  );
}

function CpuComparison() {
  const [quantum, setQuantum] = useState(2);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [chartMetric, setChartMetric] = useState("averageWaitingTime");
  const processes = [
    { id: "P1", arrivalTime: 0, burstTime: 5, priority: 2 },
    { id: "P2", arrivalTime: 1, burstTime: 3, priority: 1 },
    { id: "P3", arrivalTime: 2, burstTime: 1, priority: 3 },
    { id: "P4", arrivalTime: 3, burstTime: 2, priority: 2 },
  ];

  function runComparison() {
    try {
      if (!Number.isInteger(quantum) || quantum < 1) {
        throw new Error("Time quantum must be a positive integer.");
      }

      const algorithms = ["FCFS", "SJF", "SRTF", "PRIORITY", "RR"];

      const comparison = algorithms.map((algorithm) =>
        simulateScheduling(processes, algorithm, quantum)
      );

      setResults(comparison);
      setError("");
    } catch (err) {
      setResults(null);
      setError(err.message || "Unable to compare scheduling algorithms.");
    }
  }

  return (
    <div className="comparison-content">
      <h3>CPU Scheduling Comparison</h3>
      <p>
        All five algorithms use the same four processes for a fair comparison.
        Lower average waiting and turnaround times are generally preferable.
      </p>

      <div className="analysis-process-list">
        {processes.map((process) => (
          <div key={process.id} className="analysis-process">
            <strong>{process.id}</strong>
            <span>Arrival: {process.arrivalTime}</span>
            <span>Burst: {process.burstTime}</span>
            <span>Priority: {process.priority}</span>
          </div>
        ))}
      </div>

      <label className="analysis-field">
        Round Robin Time Quantum
        <input
          type="number"
          min="1"
          step="1"
          value={quantum}
          onChange={(e) => setQuantum(Number(e.target.value))}
        />
      </label>

      <button
        type="button"
        className="analysis-run-button"
        onClick={runComparison}
      >
        Compare Scheduling Algorithms
      </button>

      {error && <p className="analysis-error">{error}</p>}

      {results && (
  <>
    <MetricCards
      items={[
        {
          label: "Best Avg. Waiting",
          value: Math.min(
            ...results.map((result) => result.summary.averageWaitingTime)
          ).toFixed(2),
          note: "Lower is better",
        },
        {
          label: "Best Avg. Turnaround",
          value: Math.min(
            ...results.map((result) => result.summary.averageTurnaroundTime)
          ).toFixed(2),
          note: "Lower is better",
        },
        {
          label: "Best Avg. Response",
          value: Math.min(
            ...results.map((result) => result.summary.averageResponseTime)
          ).toFixed(2),
          note: "Lower is better",
        },
        {
          label: "Highest CPU Utilization",
          value: `${Math.max(
            ...results.map((result) => result.summary.cpuUtilization)
          ).toFixed(2)}%`,
          note: "Higher is better",
        },
      ]}
    />

    <div className="analysis-table-wrap">
      <table className="analysis-table">
        <thead>
          <tr>
            <th>Algorithm</th>
            <th>Avg. Waiting</th>
            <th>Avg. Turnaround</th>
            <th>Avg. Response</th>
            <th>CPU Utilization</th>
          </tr>
        </thead>

        <tbody>
          {results.map((result) => (
            <tr key={result.algorithm}>
              <td>
                {result.algorithm === "PRIORITY"
                  ? "Priority"
                  : result.algorithm === "RR"
                    ? "Round Robin"
                    : result.algorithm}
              </td>
              <td>{result.summary.averageWaitingTime.toFixed(2)}</td>
              <td>{result.summary.averageTurnaroundTime.toFixed(2)}</td>
              <td>{result.summary.averageResponseTime.toFixed(2)}</td>
              <td>{result.summary.cpuUtilization.toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

<div className="analysis-chart-section">
  <div className="analysis-chart-heading">
    <div>
      <h4>CPU Performance Comparison</h4>
      <p>Explore how each scheduling algorithm performs.</p>
    </div>

    <select
      className="analysis-chart-select"
      value={chartMetric}
      onChange={(e) => setChartMetric(e.target.value)}
    >
      <option value="averageWaitingTime">Average Waiting Time</option>
      <option value="averageTurnaroundTime">Average Turnaround Time</option>
      <option value="averageResponseTime">Average Response Time</option>
      <option value="cpuUtilization">CPU Utilization</option>
    </select>
  </div>

  <ComparisonChart
    title={
      chartMetric === "averageWaitingTime"
        ? "Average Waiting Time"
        : chartMetric === "averageTurnaroundTime"
          ? "Average Turnaround Time"
          : chartMetric === "averageResponseTime"
            ? "Average Response Time"
            : "CPU Utilization"
    }
    results={results}
    getValue={(result) => result.summary[chartMetric]}
    valueLabel={chartMetric === "cpuUtilization" ? "%" : "units"}
  />
</div>
```
  </>
)}
    </div>
  );
}

function PagingComparison() {
  const [pages, setPages] = useState(
    "7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2"
  );
  const [frameCount, setFrameCount] = useState(3);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  function runComparison() {
    try {
      const pageList = pages.split(",").map((value) => value.trim());

      if (
        pageList.some(
          (value) => value === "" || !Number.isInteger(Number(value))
        )
      ) {
        throw new Error("Enter valid page numbers separated by commas.");
      }

      if (pageList.length === 0 || pages.trim() === "") {
        throw new Error("Enter a page reference string.");
      }

      if (!Number.isInteger(frameCount) || frameCount < 1) {
        throw new Error("Number of frames must be a positive integer.");
      }

      const comparison = comparePagingAlgorithms(
        pageList.map(Number),
        frameCount
      );

      setResults(comparison);
      setError("");
    } catch (err) {
      setResults(null);
      setError(err.message || "Unable to compare page replacement algorithms.");
    }
  }

  return (
    <div className="comparison-content">
      <h3>Page Replacement Comparison</h3>
      <p>
        Compare FIFO, LRU, and Optimal using the same page reference string.
      </p>

      <label className="analysis-field">
        Page reference string
        <input
          value={pages}
          onChange={(e) => setPages(e.target.value)}
          placeholder="Example: 7, 0, 1, 2, 0"
        />
      </label>

      <label className="analysis-field">
        Number of frames
        <input
          type="number"
          min="1"
          step="1"
          value={frameCount}
          onChange={(e) => setFrameCount(Number(e.target.value))}
        />
      </label>

      <button
        type="button"
        className="analysis-run-button"
        onClick={runComparison}
      >
        Compare Algorithms
      </button>

      {error && <p className="analysis-error">{error}</p>}

      {results && (
  <>
    <MetricCards
      items={[
        {
          label: "Lowest Page Faults",
          value: Math.min(
            ...results.map((result) => result.summary.faults)
          ),
          note: "Lower is better",
        },
        {
          label: "Highest Page Hits",
          value: Math.max(
            ...results.map((result) => result.summary.hits)
          ),
          note: "Higher is better",
        },
        {
          label: "Lowest Fault Rate",
          value: `${Math.min(
            ...results.map((result) => result.summary.faultRate)
          ).toFixed(2)}%`,
          note: "Lower is better",
        },
      ]}
    />

    <div className="analysis-table-wrap">
      <table className="analysis-table">
        <thead>
          <tr>
            <th>Algorithm</th>
            <th>Page Faults</th>
            <th>Hits</th>
            <th>Fault Rate</th>
          </tr>
        </thead>

        <tbody>
          {results.map((result) => (
            <tr key={result.algorithm}>
              <td>{result.algorithm}</td>
              <td>{result.summary.faults}</td>
              <td>{result.summary.hits}</td>
              <td>{result.summary.faultRate.toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <ComparisonChart
      title="Page Fault Comparison"
      results={results}
      getValue={(result) => result.summary.faults}
      valueLabel="faults"
    />
  </>
)}
    </div>
  );
}

function MemoryComparison() {
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const blocks = [
    { id: "B1", size: 100 },
    { id: "B2", size: 250 },
    { id: "B3", size: 200 },
    { id: "B4", size: 300 },
    { id: "B5", size: 150 },
  ];
  const totalMemory = blocks.reduce((total, block) => total + block.size, 0);
  const processes = [
    { id: "P1", size: 115 },
    { id: "P2", size: 200 },
    { id: "P3", size: 90 },
    { id: "P4", size: 275 },
  ];

  function runComparison() {
    try {
      const algorithms = ["FIRST_FIT", "BEST_FIT", "WORST_FIT"];

      const comparison = algorithms.map((algorithm) =>
        simulateMemoryAllocation(blocks, processes, algorithm)
      );

      setResults(comparison);
      setError("");
    } catch (err) {
      setResults(null);
      setError(err.message || "Unable to compare memory algorithms.");
    }
  }

  return (
    <div className="comparison-content">
      <h3>Memory Allocation Comparison</h3>
      <p>
        Compare how First Fit, Best Fit, and Worst Fit allocate the same
        processes to the available memory blocks.
      </p>

      <h4>Memory Blocks</h4>
      <div className="analysis-process-list">
        {blocks.map((block) => (
          <div key={block.id} className="analysis-process">
            <strong>{block.id}</strong>
            <span>Size: {block.size}</span>
          </div>
        ))}
      </div>

      <h4>Processes</h4>
      <div className="analysis-process-list">
        {processes.map((process) => (
          <div key={process.id} className="analysis-process">
            <strong>{process.id}</strong>
            <span>Size: {process.size}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="analysis-run-button"
        onClick={runComparison}
      >
        Compare Memory Algorithms
      </button>

      {error && <p className="analysis-error">{error}</p>}

      {results && (
  <>
    <MetricCards
      items={[
        {
          label: "Highest Utilization",
          value: `${Math.max(
            ...results.map((result) => result.summary.utilization)
          ).toFixed(2)}%`,
          note: "Memory used",
        },
        {
          label: "Most Allocated",
          value: Math.max(
            ...results.map((result) => result.summary.allocationCount)
          ),
          note: "Processes allocated",
        },
        {
          label: "Fewest Failures",
          value: Math.min(
            ...results.map((result) => result.summary.failedAllocations)
          ),
          note: "Failed allocations",
        },
      ]}
    />

    <div className="analysis-table-wrap">
      <table className="analysis-table">
        <thead>
          <tr>
            <th>Algorithm</th>
            <th>Allocated</th>
            <th>Failed</th>
            <th>Memory Used</th>
            <th>Free Memory</th>
            <th>Utilization</th>
          </tr>
        </thead>

        <tbody>
          {results.map((result) => (
            <tr key={result.algorithm}>
              <td>{result.algorithm.replaceAll("_", " ")}</td>
              <td>{result.summary.allocationCount}</td>
              <td>{result.summary.failedAllocations}</td>
              <td>{result.summary.allocatedMemory}</td>
              <td>{result.summary.freeMemory}</td>
              <td>{result.summary.utilization.toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <ComparisonChart
      title="Memory Utilization Comparison"
      results={results}
      getValue={(result) => result.summary.utilization}
      valueLabel="%"
    />
    <div className="memory-donut-section">
  <div className="memory-donut-heading">
    <h3>Memory Utilization Breakdown</h3>
    <p>
      Compare allocated and remaining memory for each allocation strategy.
    </p>
  </div>

  <div className="memory-donut-grid">
    {results.map((result) => (
      <MemoryDonutChart
        key={result.algorithm}
        result={result}
        totalMemory={totalMemory}
      />
    ))}
  </div>
</div>

    {results.map((result) => (
      <div
        key={result.algorithm}
        className="analysis-allocation-result"
      >
        <h4>{result.algorithm.replaceAll("_", " ")}</h4>

        {result.results.map((process) => (
          <p key={process.id}>
            <strong>{process.id}</strong> ({process.size}) —{" "}
            {process.message}
          </p>
        ))}
      </div>
    ))}
  </>
)}
    </div>
  );
}

export default AnalysisPage;
