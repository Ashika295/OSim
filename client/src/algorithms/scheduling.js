
const compareProcesses = (a, b) =>
  a.arrivalTime - b.arrivalTime || a.id.localeCompare(b.id);

function validateProcesses(processes) {
  if (!Array.isArray(processes) || processes.length === 0) {
    throw new Error("Add at least one process.");
  }

  const ids = new Set();

  for (const p of processes) {
    if (!p.id || ids.has(p.id)) {
      throw new Error("Process IDs must be non-empty and unique.");
    }

    ids.add(p.id);

    if (!Number.isInteger(p.arrivalTime) || p.arrivalTime < 0) {
      throw new Error("Arrival times must be non-negative integers.");
    }

    if (!Number.isInteger(p.burstTime) || p.burstTime <= 0) {
      throw new Error("Burst times must be positive integers.");
    }

    if (!Number.isFinite(p.priority)) {
      throw new Error("Priorities must be valid numbers.");
    }
  }
}

function createState(processes) {
  return processes.map((p) => ({
    ...p,
    remaining: p.burstTime,
    completionTime: null,
    responseTime: null,
    firstStart: null,
  }));
}

function addSegment(timeline, id, start, end) {
  if (start === end) return;

  const last = timeline[timeline.length - 1];

  if (last && last.id === id && last.end === start) {
    last.end = end;
  } else {
    timeline.push({ id, start, end });
  }
}

function runNonPreemptive(processes, algorithm) {
  const jobs = createState(processes);
  const timeline = [];
  let time = 0;
  let completed = 0;

  while (completed < jobs.length) {
    const available = jobs.filter(
      (p) => p.completionTime === null && p.arrivalTime <= time
    );

    if (available.length === 0) {
      const nextArrival = Math.min(
        ...jobs
          .filter((p) => p.completionTime === null)
          .map((p) => p.arrivalTime)
      );

      addSegment(timeline, "IDLE", time, nextArrival);
      time = nextArrival;
      continue;
    }

    available.sort((a, b) => {
      if (algorithm === "SJF") {
        return a.burstTime - b.burstTime || compareProcesses(a, b);
      }

      if (algorithm === "PRIORITY") {
        return a.priority - b.priority || compareProcesses(a, b);
      }

      return compareProcesses(a, b);
    });

    const current = available[0];

    current.firstStart = time;
    current.responseTime = time - current.arrivalTime;

    addSegment(
      timeline,
      current.id,
      time,
      time + current.burstTime
    );

    time += current.burstTime;
    current.completionTime = time;
    completed++;
  }

  return { jobs, timeline };
}

function runSRTF(processes) {
  const jobs = createState(processes);
  const timeline = [];
  let time = 0;
  let completed = 0;

  while (completed < jobs.length) {
    const available = jobs.filter(
      (p) => p.completionTime === null && p.arrivalTime <= time
    );

    if (available.length === 0) {
      const nextArrival = Math.min(
        ...jobs
          .filter((p) => p.completionTime === null)
          .map((p) => p.arrivalTime)
      );

      addSegment(timeline, "IDLE", time, nextArrival);
      time = nextArrival;
      continue;
    }

    available.sort(
      (a, b) =>
        a.remaining - b.remaining || compareProcesses(a, b)
    );

    const current = available[0];

    if (current.firstStart === null) {
      current.firstStart = time;
      current.responseTime = time - current.arrivalTime;
    }

    addSegment(timeline, current.id, time, time + 1);

    current.remaining--;
    time++;

    if (current.remaining === 0) {
      current.completionTime = time;
      completed++;
    }
  }

  return { jobs, timeline };
}

function runRoundRobin(processes, quantum) {
  if (!Number.isInteger(quantum) || quantum <= 0) {
    throw new Error("Time quantum must be a positive integer.");
  }

  const jobs = createState(processes);
  const ordered = [...jobs].sort(compareProcesses);
  const timeline = [];
  const queue = [];
  let time = 0;
  let next = 0;
  let completed = 0;

  while (completed < jobs.length) {
    while (
      next < ordered.length &&
      ordered[next].arrivalTime <= time
    ) {
      queue.push(ordered[next++]);
    }

    if (queue.length === 0) {
      if (next < ordered.length) {
        const nextArrival = ordered[next].arrivalTime;
        addSegment(timeline, "IDLE", time, nextArrival);
        time = nextArrival;
        continue;
      }

      break;
    }

    const current = queue.shift();

    if (current.firstStart === null) {
      current.firstStart = time;
      current.responseTime = time - current.arrivalTime;
    }

    const duration = Math.min(quantum, current.remaining);
    addSegment(timeline, current.id, time, time + duration);

    time += duration;
    current.remaining -= duration;

    while (
      next < ordered.length &&
      ordered[next].arrivalTime <= time
    ) {
      queue.push(ordered[next++]);
    }

    if (current.remaining > 0) {
      queue.push(current);
    } else {
      current.completionTime = time;
      completed++;
    }
  }

  return { jobs, timeline };
}

export function simulateScheduling(
  processes,
  algorithm = "FCFS",
  quantum = 2
) {
  validateProcesses(processes);

  const supported = ["FCFS", "SJF", "SRTF", "PRIORITY", "RR"];

  if (!supported.includes(algorithm)) {
    throw new Error("Unsupported scheduling algorithm.");
  }

  const result =
    algorithm === "SRTF"
      ? runSRTF(processes)
      : algorithm === "RR"
        ? runRoundRobin(processes, quantum)
        : runNonPreemptive(processes, algorithm);

  const metrics = result.jobs
    .map((p) => {
      const turnaroundTime = p.completionTime - p.arrivalTime;
      const waitingTime = turnaroundTime - p.burstTime;

      return {
        id: p.id,
        arrivalTime: p.arrivalTime,
        burstTime: p.burstTime,
        priority: p.priority,
        completionTime: p.completionTime,
        turnaroundTime,
        waitingTime,
        responseTime: p.responseTime,
      };
    })
    .sort(compareProcesses);

  const totalBurst = processes.reduce(
    (sum, p) => sum + p.burstTime,
    0
  );

  const startTime = Math.min(...processes.map((p) => p.arrivalTime));
  const endTime = Math.max(...result.jobs.map((p) => p.completionTime));
  const elapsedTime = endTime - startTime;

  const average = (key) =>
    metrics.reduce((sum, p) => sum + p[key], 0) / metrics.length;

  return {
    algorithm,
    timeline: result.timeline,
    metrics,
    summary: {
      averageWaitingTime: average("waitingTime"),
      averageTurnaroundTime: average("turnaroundTime"),
      averageResponseTime: average("responseTime"),
      cpuUtilization: elapsedTime
        ? (totalBurst / elapsedTime) * 100
        : 0,
      throughput: elapsedTime ? metrics.length / elapsedTime : 0,
    },
  };
}
