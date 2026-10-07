import { describe, expect, it } from "vitest";
import { rankApplicants, ApplicantForRanking } from "./ranking";

// Base template candidate
const baseCandidate: ApplicantForRanking = {
  id: 1,
  firstName: "A",
  lastName: "B",
  announcementOrder: 10,
  mathGpa: 3.50,
  scienceGpa: 3.50,
  englishGpa: 3.50,
  gpax: 3.50,
  examMathScore: 50.0,
  examScienceScore: 50.0,
  mathSciGpa: 3.50,
};

describe("rankApplicants tie-breaker hierarchy", () => {
  it("1. ranks by total exam score descending", () => {
    const candidateA = { ...baseCandidate, id: 1, examMathScore: 50, examScienceScore: 50, mathSciGpa: 3.50 }; // total = 100
    const candidateB = { ...baseCandidate, id: 2, examMathScore: 55, examScienceScore: 50, mathSciGpa: 3.50 }; // total = 105

    const ranked = rankApplicants([candidateA, candidateB]);
    expect(ranked[0].id).toBe(2); // Candidate B has higher total score
    expect(ranked[0].rank).toBe(1);
    expect(ranked[1].id).toBe(1);
    expect(ranked[1].rank).toBe(2);
  });

  it("2. ranks by math exam score descending if total score is tied", () => {
    // Total is tied at 100
    const candidateA = { ...baseCandidate, id: 1, examMathScore: 60, examScienceScore: 40, mathSciGpa: 3.50 }; // math = 60
    const candidateB = { ...baseCandidate, id: 2, examMathScore: 40, examScienceScore: 60, mathSciGpa: 3.50 }; // math = 40

    const ranked = rankApplicants([candidateB, candidateA]);
    expect(ranked[0].id).toBe(1); // Candidate A has higher math exam score
  });

  it("4. ranks by Math GPA descending if exam scores are tied", () => {
    const candidateA = { ...baseCandidate, id: 1, mathGpa: 3.80, mathSciGpa: 3.80 };
    const candidateB = { ...baseCandidate, id: 2, mathGpa: 3.50, mathSciGpa: 3.50 };

    const ranked = rankApplicants([candidateB, candidateA]);
    expect(ranked[0].id).toBe(1); // Candidate A has higher Math GPA
  });

  it("5. ranks by Science GPA descending if exam scores and Math GPA are tied", () => {
    const candidateA = { ...baseCandidate, id: 1, mathGpa: 3.50, scienceGpa: 3.90, mathSciGpa: 3.70 };
    const candidateB = { ...baseCandidate, id: 2, mathGpa: 3.50, scienceGpa: 3.60, mathSciGpa: 3.55 };

    const ranked = rankApplicants([candidateB, candidateA]);
    expect(ranked[0].id).toBe(1); // Candidate A has higher Science GPA
  });

  it("6. ranks by Math + Science GPA weighted average descending if all previous are tied", () => {
    const candidateA = { ...baseCandidate, id: 1, mathGpa: 3.50, scienceGpa: 3.50, mathSciGpa: 3.65 };
    const candidateB = { ...baseCandidate, id: 2, mathGpa: 3.50, scienceGpa: 3.50, mathSciGpa: 3.52 };

    const ranked = rankApplicants([candidateB, candidateA]);
    expect(ranked[0].id).toBe(1); // Candidate A has higher mathSciGpa (3.65 > 3.52)
  });

  it("7. ranks by English GPA descending if all previous are tied", () => {
    const candidateA = { ...baseCandidate, id: 1, englishGpa: 3.85 };
    const candidateB = { ...baseCandidate, id: 2, englishGpa: 3.50 };

    const ranked = rankApplicants([candidateB, candidateA]);
    expect(ranked[0].id).toBe(1); // Candidate A has higher English GPA
  });

  it("8. ranks by GPAX descending if all previous are tied", () => {
    const candidateA = { ...baseCandidate, id: 1, gpax: 3.95 };
    const candidateB = { ...baseCandidate, id: 2, gpax: 3.75 };

    const ranked = rankApplicants([candidateB, candidateA]);
    expect(ranked[0].id).toBe(1); // Candidate A has higher GPAX
  });

  it("9. ranks by announcement order ascending if all previous are tied", () => {
    // announcementOrder: 5 (better/earlier) vs 12 (later)
    const candidateA = { ...baseCandidate, id: 1, announcementOrder: 12 };
    const candidateB = { ...baseCandidate, id: 2, announcementOrder: 5 };

    const ranked = rankApplicants([candidateA, candidateB]);
    expect(ranked[0].id).toBe(2); // Candidate B has better order (5 < 12)
  });
});
