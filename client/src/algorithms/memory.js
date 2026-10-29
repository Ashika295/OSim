function validateInput(blocks, processes) {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    throw new Error("Add at least one memory block.");
  }

  if (!Array.isArray(processes) || processes.length === 0) {
    throw new Error("Add at least one process.");
  }

  for (const block of blocks) {
    if (!Number.isInteger(block.size) || block.size <= 0) {
      throw new Error("Memory block sizes must be positive integers.");
    }
  }

  const ids = new Set();

  for (const process of processes) {
    if (!process.id || ids.has(process.id)) {
      throw new Error("Process IDs must be non-empty and unique.");
    }

    ids.add(process.id);

    if (
      !Number.isInteger(process.size) ||
      process.size <= 0
    ) {
      throw new Error("Process sizes must be positive integers.");
    }
  }
}

export function simulateMemoryAllocation(
  blocks,
  processes,
  algorithm = "FIRST_FIT"
) {
  validateInput(blocks, processes);

  const supported = ["FIRST_FIT", "BEST_FIT", "WORST_FIT"];

  if (!supported.includes(algorithm)) {
    throw new Error("Unsupported memory allocation algorithm.");
  }

  const memoryBlocks = blocks.map((block, index) => ({
    id: block.id || `B${index + 1}`,
    size: block.size,
    remaining: block.size,
    allocatedProcesses: [],
  }));

  const results = processes.map((process) => {
    let selectedIndex = -1;

    for (let i = 0; i < memoryBlocks.length; i++) {
      const block = memoryBlocks[i];

      if (block.remaining < process.size) {
        continue;
      }

      if (algorithm === "FIRST_FIT") {
        selectedIndex = i;
        break;
      }

      if (selectedIndex === -1) {
        selectedIndex = i;
        continue;
      }

      const selectedBlock = memoryBlocks[selectedIndex];

      if (
        algorithm === "BEST_FIT" &&
        block.remaining < selectedBlock.remaining
      ) {
        selectedIndex = i;
      }

      if (
        algorithm === "WORST_FIT" &&
        block.remaining > selectedBlock.remaining
      ) {
        selectedIndex = i;
      }
    }

    if (selectedIndex === -1) {
      return {
        id: process.id,
        size: process.size,
        allocated: false,
        blockId: null,
        message: "Not allocated",
      };
    }

    const block = memoryBlocks[selectedIndex];

    block.remaining -= process.size;
    block.allocatedProcesses.push(process.id);

    return {
      id: process.id,
      size: process.size,
      allocated: true,
      blockId: block.id,
      message: `Allocated to ${block.id}`,
    };
  });

  const totalMemory = memoryBlocks.reduce(
    (sum, block) => sum + block.size,
    0
  );

  const allocatedMemory = memoryBlocks.reduce(
    (sum, block) => sum + block.size - block.remaining,
    0
  );

  const freeMemory = memoryBlocks.reduce(
    (sum, block) => sum + block.remaining,
    0
  );

  const successfulAllocations = results.filter(
    (process) => process.allocated
  ).length;

  return {
    algorithm,
    blocks: memoryBlocks,
    results,
    summary: {
      totalMemory,
      allocatedMemory,
      freeMemory,
      allocationCount: successfulAllocations,
      failedAllocations: results.length - successfulAllocations,
      utilization: totalMemory
        ? (allocatedMemory / totalMemory) * 100
        : 0,
    },
  };
}