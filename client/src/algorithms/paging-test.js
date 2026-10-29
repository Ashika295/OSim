import {
  simulatePaging,
  comparePagingAlgorithms,
} from "./paging.js";

const pages = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2];
const frames = 3;

for (const result of comparePagingAlgorithms(pages, frames)) {
  console.log(result.algorithm, result.summary);
}

console.log(
  simulatePaging(pages, frames, "FIFO").history
);