
import { useMemo, useState } from "react";
import "./ResourceGraph.css";

const initialProcesses = "P1, P2, P3";
const initialResources = "R1, R2";
const initialAllocations = "R1-P1, R2-P2";
const initialRequests = "P1-R2, P2-R1";

function parseNames(value, prefix) {
  const names = value
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

  if (
    names.length === 0 ||
    names.some((name) => !new RegExp(`^${prefix}\\d+$`, "i").test(name)) ||
    new Set(names.map((name) => name.toUpperCase())).size !== names.length
  ) {
    throw new Error(`Enter unique ${prefix} names separated by commas, e.g. ${prefix}1, ${prefix}2.`);
  }

  return names.map((name) => name.toUpperCase());
}

function parseEdges(value, leftNames, rightNames, type) {
  if (!value.trim()) return [];

  return value.split(",").map((entry) => {
    const parts = entry.trim().split("-").map((part) => part.trim().toUpperCase());

    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      throw new Error(`Use the format ${type === "allocation" ? "R1-P1" : "P1-R1"} for each edge.`);
    }

    const [left, right] = parts;

    if (!leftNames.includes(left) || !rightNames.includes(right)) {
      throw new Error(`Invalid edge "${entry.trim()}". Check that its names exist in the lists.`);
    }

    return { from: left, to: right, type };
  });
}

function findCycle(processes, resources, edges) {
  const graph = new Map(
    [...processes, ...resources].map((node) => [node, []])
  );

  edges.forEach((edge) => graph.get(edge.from).push(edge.to));

  const visiting = new Set();
  const visited = new Set();

  function visit(node) {
    if (visiting.has(node)) return true;
    if (visited.has(node)) return false;

    visiting.add(node);

    for (const next of graph.get(node)) {
      if (visit(next)) return true;
    }

    visiting.delete(node);
    visited.add(node);
    return false;
  }

  return [...graph.keys()].some((node) => visit(node));
}

export default function ResourceGraph() {
  const [processInput, setProcessInput] = useState(initialProcesses);
  const [resourceInput, setResourceInput] = useState(initialResources);
  const [allocationInput, setAllocationInput] = useState(initialAllocations);
  const [requestInput, setRequestInput] = useState(initialRequests);
  const [graphData, setGraphData] = useState(null);
  const [error, setError] = useState("");

  function buildGraph() {
    try {
      const processes = parseNames(processInput, "P");
      const resources = parseNames(resourceInput, "R");

      const allocations = parseEdges(
        allocationInput,
        resources,
        processes,
        "allocation"
      );

      const requests = parseEdges(
        requestInput,
        processes,
        resources,
        "request"
      );

      const edges = [...allocations, ...requests];

      setGraphData({
        processes,
        resources,
        edges,
        hasCycle: findCycle(processes, resources, edges),
      });

      setError("");
    } catch (err) {
      setGraphData(null);
      setError(err.message || "Unable to build the graph.");
    }
  }

  function resetGraph() {
    setProcessInput(initialProcesses);
    setResourceInput(initialResources);
    setAllocationInput(initialAllocations);
    setRequestInput(initialRequests);
    setGraphData(null);
    setError("");
  }

  const layout = useMemo(() => {
    if (!graphData) return null;

    const { processes, resources } = graphData;
    const width = 720;
    const height = Math.max(360, processes.length * 90, resources.length * 110);
    const leftX = 150;
    const rightX = 570;

    const positions = {};

    processes.forEach((name, index) => {
      positions[name] = {
        x: leftX,
        y: ((index + 1) * height) / (processes.length + 1),
      };
    });

    resources.forEach((name, index) => {
      positions[name] = {
        x: rightX,
        y: ((index + 1) * height) / (resources.length + 1),
      };
    });

    return { width, height, positions };
  }, [graphData]);

  return (
    <div className="rag-page">
      <section className="rag-intro">
        <div>
          <div className="rag-eyebrow">DEADLOCK VISUALIZATION</div>
          <h2>Resource Allocation Graph</h2>
          <p>
            Map which resources are allocated to processes and which resources
            they are requesting.
          </p>
        </div>
        <div className="rag-badge">GRAPH LAB</div>
      </section>

      <section className="rag-panel">
        <div className="rag-panel-heading">
          <span className="rag-step">01</span>
          <div>
            <h3>Graph configuration</h3>
            <p>Enter process and resource names, then define their edges.</p>
          </div>
        </div>

        <div className="rag-input-grid">
          <label className="rag-field">
            <span>Processes</span>
            <input value={processInput} onChange={(event) => setProcessInput(event.target.value)} />
          </label>
          <label className="rag-field">
            <span>Resources</span>
            <input value={resourceInput} onChange={(event) => setResourceInput(event.target.value)} />
          </label>
          <label className="rag-field">
            <span>Allocation edges</span>
            <input value={allocationInput} onChange={(event) => setAllocationInput(event.target.value)} />
            <small>Format: R1-P1, R2-P2 (resource → process).</small>
          </label>
          <label className="rag-field">
            <span>Request edges</span>
            <input value={requestInput} onChange={(event) => setRequestInput(event.target.value)} />
            <small>Format: P1-R2, P2-R1 (process → resource).</small>
          </label>
        </div>

        <div className="rag-actions">
          <button className="rag-primary-button" onClick={buildGraph}>Build graph</button>
          <button className="rag-reset-button" onClick={resetGraph}>Reset</button>
        </div>

        {error && <div className="rag-error">{error}</div>}
      </section>

      {graphData && layout && (
        <>
          <section className="rag-panel">
            <div className="rag-panel-heading">
              <span className="rag-step">02</span>
              <div>
                <h3>Live resource graph</h3>
                <p>Arrows show the direction of each allocation or request.</p>
              </div>
            </div>

            <div className="rag-legend">
              <span><i className="rag-process-swatch" /> Process</span>
              <span><i className="rag-resource-swatch" /> Resource</span>
              <span><i className="rag-allocation-swatch" /> Allocation</span>
              <span><i className="rag-request-swatch" /> Request</span>
            </div>

            <div className="rag-svg-wrap">
              <svg
                viewBox={`0 0 ${layout.width} ${layout.height}`}
                role="img"
                aria-label="Resource allocation graph"
              >
                <defs>
                  <marker id="rag-arrow-allocation" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill="#a78bfa" />
                  </marker>
                  <marker id="rag-arrow-request" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill="#fb7185" />
                  </marker>
                </defs>

                {graphData.edges.map((edge, index) => {
                  const from = layout.positions[edge.from];
                  const to = layout.positions[edge.to];
                  const isAllocation = edge.type === "allocation";
                  const radius = isAllocation ? 28 : 29;
                  const dx = to.x - from.x;
                  const dy = to.y - from.y;
                  const length = Math.sqrt(dx * dx + dy * dy) || 1;
                  const startX = from.x + (dx / length) * radius;
                  const startY = from.y + (dy / length) * radius;
                  const endX = to.x - (dx / length) * radius;
                  const endY = to.y - (dy / length) * radius;

                  return (
                    <line
                      key={`${edge.from}-${edge.to}-${index}`}
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                      stroke={isAllocation ? "#a78bfa" : "#fb7185"}
                      strokeWidth="2.5"
                      markerEnd={`url(#${isAllocation ? "rag-arrow-allocation" : "rag-arrow-request"})`}
                    />
                  );
                })}

                {graphData.processes.map((name) => {
                  const point = layout.positions[name];

                  return (
                    <g key={name}>
                      <circle cx={point.x} cy={point.y} r="29" fill="#211b36" stroke="#a78bfa" strokeWidth="2" />
                      <text x={point.x} y={point.y + 5} textAnchor="middle" fill="#e9ddff" fontSize="13" fontWeight="700">{name}</text>
                    </g>
                  );
                })}

                {graphData.resources.map((name) => {
                  const point = layout.positions[name];

                  return (
                    <g key={name}>
                      <rect x={point.x - 38} y={point.y - 25} width="76" height="50" rx="8" fill="#142c2a" stroke="#34d399" strokeWidth="2" />
                      <text x={point.x} y={point.y + 5} textAnchor="middle" fill="#a7f3d0" fontSize="13" fontWeight="700">{name}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </section>

          <section className={`rag-result ${graphData.hasCycle ? "rag-cycle" : "rag-no-cycle"}`}>
            <span>{graphData.hasCycle ? "CYCLE DETECTED" : "NO CYCLE DETECTED"}</span>
            <h3>{graphData.hasCycle ? "A cycle exists in the graph" : "No cycle found"}</h3>
            <p>
              {graphData.hasCycle
                ? "A cycle can indicate a possible deadlock. For single-instance resource types, a cycle implies deadlock; for multiple-instance resource types, a cycle alone is not conclusive."
                : "The current graph contains no directed cycle."}
            </p>
          </section>
        </>
      )}

      {!graphData && !error && (
        <section className="rag-empty">
          <h3>Your graph is ready to build</h3>
          <p>Use the default example to see a cycle between P1, P2, R1, and R2.</p>
        </section>
      )}
    </div>
  );
}
