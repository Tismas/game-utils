export const deepEqual = <T>(a: T, b: T): boolean => {
  if (a === b) return true;

  if (typeof a !== "object" || typeof b !== "object") return false;
  if (!a || !b) return false;

  if (Object.keys(a).length !== Object.keys(b).length) return false;

  for (const key in a) {
    if (!deepEqual(a[key], b[key])) return false;
  }

  return true;
};
