/** Create an array of numbers from start to end-1 (or from 0 to given number -1) */
export const range = (start: number, end?: number) => {
  if (end === undefined) {
    end = start;
    start = 0;
  }

  return Array.from({ length: end - start }, (_, i) => i + start);
};
