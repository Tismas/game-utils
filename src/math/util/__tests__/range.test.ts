import { describe, expect, it } from "vitest";

import { range } from "../range";

describe("range", () => {
  it("should create range from 0 to n", () => {
    expect(range(5)).toEqual([0, 1, 2, 3, 4]);
  });

  it("should create range from x to y", () => {
    expect(range(2, 5)).toEqual([2, 3, 4]);
  });
});
