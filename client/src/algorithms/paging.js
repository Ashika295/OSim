
function validateInput(referenceString, frameCount) {
  if (!Array.isArray(referenceString) || referenceString.length === 0) {
    throw new Error("Enter a page reference string.");
  }

  if (!Number.isInteger(frameCount) || frameCount < 1 || frameCount > 20) {
    throw new Error("Frame count must be between 1 and 20.");
  }

  if (
    referenceString.some(
      (page) => !Number.isInteger(page) || page < 0
    )
  ) {
    throw new Error("Page numbers must be non-negative integers.");
  }
}

export function simulatePaging(
  referenceString,
  frameCount,
  algorithm = "FIFO"
) {
  validateInput(referenceString, frameCount);

  if (!["FIFO", "LRU", "OPTIMAL"].includes(algorithm)) {
    throw new Error("Unsupported page replacement algorithm.");
  }

  const frames = [];
  const history = [];
  let nextFIFO = 0;
  let hits = 0;
  let faults = 0;

  referenceString.forEach((page, index) => {
    const previousFrames = [...frames];
    const hit = frames.includes(page);
    let replaced = null;

    if (hit) {
      hits++;
    } else {
      faults++;

      if (frames.length < frameCount) {
        frames.push(page);
      } else {
        let replaceIndex = 0;

        if (algorithm === "FIFO") {
          replaceIndex = nextFIFO;
          nextFIFO = (nextFIFO + 1) % frameCount;
        } else if (algorithm === "LRU") {
          let oldestUse = Infinity;

          frames.forEach((framePage, frameIndex) => {
            const lastUsed = referenceString
              .slice(0, index)
              .lastIndexOf(framePage);

            if (lastUsed < oldestUse) {
              oldestUse = lastUsed;
              replaceIndex = frameIndex;
            }
          });
        } else {
          let farthestUse = -1;

          frames.forEach((framePage, frameIndex) => {
            const nextUse = referenceString.indexOf(framePage, index + 1);

            if (nextUse === -1) {
              replaceIndex = frameIndex;
              farthestUse = Infinity;
            } else if (farthestUse !== Infinity && nextUse > farthestUse) {
              farthestUse = nextUse;
              replaceIndex = frameIndex;
            }
          });
        }

        replaced = frames[replaceIndex];
        frames[replaceIndex] = page;
      }
    }

    history.push({
      step: index + 1,
      page,
      frames: [...frames],
      previousFrames,
      hit,
      fault: !hit,
      replaced,
    });
  });

  return {
    algorithm,
    referenceString: [...referenceString],
    frameCount,
    history,
    summary: {
      totalReferences: referenceString.length,
      hits,
      faults,
      hitRate: (hits / referenceString.length) * 100,
      faultRate: (faults / referenceString.length) * 100,
    },
  };
}

export function comparePagingAlgorithms(referenceString, frameCount) {
  return ["FIFO", "LRU", "OPTIMAL"].map((algorithm) =>
    simulatePaging(referenceString, frameCount, algorithm)
  );
}
