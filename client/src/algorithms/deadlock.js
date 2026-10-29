
export function detectDeadlock(allocation, request) {
  if (
    !Array.isArray(allocation) ||
    !Array.isArray(request) ||
    allocation.length === 0 ||
    allocation.length !== request.length
  ) {
    throw new Error("Allocation and request matrices must have matching process rows.");
  }

  const resourceCount = allocation[0]?.length;

  if (
    !Number.isInteger(resourceCount) ||
    resourceCount === 0 ||
    allocation.some((row) => !Array.isArray(row) || row.length !== resourceCount) ||
    request.some((row) => !Array.isArray(row) || row.length !== resourceCount)
  ) {
    throw new Error("Allocation and request matrices must have consistent resource columns.");
  }

  if (
    [...allocation.flat(), ...request.flat()].some(
      (value) => !Number.isInteger(value) || value < 0
    )
  ) {
    throw new Error("Resource values must be non-negative integers.");
  }

  const available = Array.from(
    { length: resourceCount },
    (_, resource) =>
      allocation.reduce((sum, row) => sum + row[resource], 0)
  );

  const work = [...available];
  const finished = Array(allocation.length).fill(false);
  const sequence = [];

  let progress = true;

  while (progress) {
    progress = false;

    for (let process = 0; process < allocation.length; process++) {
      if (finished[process]) continue;

      const canFinish = request[process].every(
        (needed, resource) => needed <= work[resource]
      );

      if (canFinish) {
        allocation[process].forEach(
          (held, resource) => (work[resource] += held)
        );

        finished[process] = true;
        sequence.push(`P${process + 1}`);
        progress = true;
      }
    }
  }

  return {
    safe: finished.every(Boolean),
    sequence,
    deadlockedProcesses: finished
      .map((done, index) => (done ? null : `P${index + 1}`))
      .filter(Boolean),
    available: [...available],
    finalWork: work,
  };
}

export function bankersAlgorithm(available, allocation, maximum) {
  if (
    !Array.isArray(available) ||
    !Array.isArray(allocation) ||
    !Array.isArray(maximum) ||
    allocation.length === 0 ||
    allocation.length !== maximum.length
  ) {
    throw new Error("Invalid resource matrices or available vector.");
  }

  const resourceCount = available.length;

  if (
    resourceCount === 0 ||
    !Array.isArray(allocation[0]) ||
    allocation[0].length !== resourceCount ||
    allocation.some((row) => !Array.isArray(row) || row.length !== resourceCount) ||
    maximum.some((row) => !Array.isArray(row) || row.length !== resourceCount)
  ) {
    throw new Error("All resource rows must match the available vector.");
  }

  if (
    [...available, ...allocation.flat(), ...maximum.flat()].some(
      (value) => !Number.isInteger(value) || value < 0
    )
  ) {
    throw new Error("Resource values must be non-negative integers.");
  }

  if (
    maximum.some((row, process) =>
      row.some((value, resource) => value < allocation[process][resource])
    )
  ) {
    throw new Error("Maximum demand cannot be less than allocated resources.");
  }

  const need = maximum.map((row, process) =>
    row.map((value, resource) => value - allocation[process][resource])
  );

  const work = [...available];
  const finished = Array(allocation.length).fill(false);
  const sequence = [];

  while (sequence.length < allocation.length) {
    let found = false;

    for (let process = 0; process < allocation.length; process++) {
      if (finished[process]) continue;

      const canFinish = need[process].every(
        (needed, resource) => needed <= work[resource]
      );

      if (canFinish) {
        allocation[process].forEach(
          (held, resource) => (work[resource] += held)
        );

        finished[process] = true;
        sequence.push(`P${process + 1}`);
        found = true;
      }
    }

    if (!found) break;
  }

  return {
    safe: finished.every(Boolean),
    need,
    sequence,
    unfinishedProcesses: finished
      .map((done, index) => (done ? null : `P${index + 1}`))
      .filter(Boolean),
    available: [...available],
    finalWork: work,
  };
}
