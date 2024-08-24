export const interpolate = (start: number, end: number, progress: number): number => {
  return start + (end - start) * progress;
};
