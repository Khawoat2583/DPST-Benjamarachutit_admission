export type GradeEntry = {
  grade: number;
  credit: number;
};

export function roundHalfUpToTwoDecimals(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateWeightedAverage(entries: GradeEntry[]): number {
  const totals = entries.reduce(
    (current, entry) => {
      if (entry.grade < 0 || entry.grade > 4) {
        throw new RangeError("Grade must be between 0.00 and 4.00.");
      }

      if (entry.credit <= 0) {
        throw new RangeError("Credit must be greater than zero.");
      }

      return {
        weighted: current.weighted + entry.grade * entry.credit,
        credits: current.credits + entry.credit,
      };
    },
    { weighted: 0, credits: 0 },
  );

  if (totals.credits === 0) {
    throw new RangeError("At least one grade entry is required.");
  }

  return roundHalfUpToTwoDecimals(totals.weighted / totals.credits);
}
