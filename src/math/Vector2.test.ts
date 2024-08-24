import { describe, expect, it } from "vitest";

import { Vector2 } from "./Vector2";

describe("Vector2", () => {
  it("should calculate and change length correctly", () => {
    const vector = new Vector2(3, 4);
    expect(vector.length).toBe(5);

    vector.length = 10;
    expect(vector.x).toBeCloseTo(6);
    expect(vector.y).toBeCloseTo(8);
  });

  it("should calculate and change angle correctly", () => {
    const vector = new Vector2(1, 1);
    expect(vector.angle).toBeCloseTo(Math.PI / 4);

    vector.angle = Math.PI / 2;
    expect(vector.x).toBeCloseTo(0);
    expect(vector.y).toBeCloseTo(Math.sqrt(2));
  });
});
