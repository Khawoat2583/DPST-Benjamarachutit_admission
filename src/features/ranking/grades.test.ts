import { describe, expect, it } from "vitest";

import {
  calculateWeightedAverage,
  roundHalfUpToTwoDecimals,
} from "./grades";

describe("roundHalfUpToTwoDecimals", () => {
  it("rounds down when the third decimal is lower than 5", () => {
    expect(roundHalfUpToTwoDecimals(3.124)).toBe(3.12);
  });

  it("rounds up when the third decimal is 5 or higher", () => {
    expect(roundHalfUpToTwoDecimals(3.125)).toBe(3.13);
  });
});

describe("calculateWeightedAverage", () => {
  it("returns the weighted average rounded to two decimals", () => {
    expect(
      calculateWeightedAverage([
        { grade: 3.5, credit: 1 },
        { grade: 4, credit: 1.5 },
        { grade: 3, credit: 0.5 },
      ]),
    ).toBe(3.67);
  });

  it("rejects grades outside the 0.00 to 4.00 range", () => {
    expect(() =>
      calculateWeightedAverage([{ grade: 4.1, credit: 1 }]),
    ).toThrow("Grade must be between 0.00 and 4.00.");
  });

  it("rejects non-positive credits", () => {
    expect(() =>
      calculateWeightedAverage([{ grade: 3.5, credit: 0 }]),
    ).toThrow("Credit must be greater than zero.");
  });
});
