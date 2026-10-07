export interface ApplicantForRanking {
  id: number;
  firstName: string;
  lastName: string;
  announcementOrder: number;
  mathGpa: number;
  scienceGpa: number;
  englishGpa: number;
  gpax: number;
  examMathScore: number;
  examScienceScore: number;
  mathSciGpa: number;
}

export interface RankedApplicant extends ApplicantForRanking {
  totalExamScore: number;
  rank: number;
}

/**
 * Compare two applicants based on DPST's strict tie-breaker hierarchy:
 * 1. Total Exam Score (Math + Science exam score) (Descending)
 * 2. Math Exam Score (Descending)
 * 3. Science Exam Score (Descending)
 * 4. Math GPA 5 semesters (Descending)
 * 5. Science GPA 5 semesters (Descending)
 * 6. Math + Science GPA 5 semesters (Descending)
 * 7. English GPA 5 semesters (Descending)
 * 8. Overall GPAX 5 semesters (Descending)
 * 9. Announcement List Order (Ascending - smaller number/earlier list rank is higher priority)
 */
export function compareApplicants(a: ApplicantForRanking, b: ApplicantForRanking): number {
  // 1. Total Exam Score (Math + Science exam score) (Descending)
  const totalA = a.examMathScore + a.examScienceScore;
  const totalB = b.examMathScore + b.examScienceScore;
  if (totalA !== totalB) {
    return totalB - totalA;
  }

  // 2. Math Exam Score (Descending)
  if (a.examMathScore !== b.examMathScore) {
    return b.examMathScore - a.examMathScore;
  }

  // 3. Science Exam Score (Descending)
  if (a.examScienceScore !== b.examScienceScore) {
    return b.examScienceScore - a.examScienceScore;
  }

  // 4. Math GPA (Descending)
  if (a.mathGpa !== b.mathGpa) {
    return b.mathGpa - a.mathGpa;
  }

  // 5. Science GPA (Descending)
  if (a.scienceGpa !== b.scienceGpa) {
    return b.scienceGpa - a.scienceGpa;
  }

  // 6. Math + Science GPA (Descending)
  if (a.mathSciGpa !== b.mathSciGpa) {
    return b.mathSciGpa - a.mathSciGpa;
  }

  // 7. English GPA (Descending)
  if (a.englishGpa !== b.englishGpa) {
    return b.englishGpa - a.englishGpa;
  }

  // 8. Overall GPAX (Descending)
  if (a.gpax !== b.gpax) {
    return b.gpax - a.gpax;
  }

  // 9. Announcement Order (Ascending - smaller order value is better)
  return a.announcementOrder - b.announcementOrder;
}

/**
 * Sorts and ranks applicants strictly according to the tie-breaking guidelines.
 */
export function rankApplicants(applicants: ApplicantForRanking[]): RankedApplicant[] {
  const sorted = [...applicants].sort(compareApplicants);
  return sorted.map((applicant, index) => ({
    ...applicant,
    totalExamScore: applicant.examMathScore + applicant.examScienceScore,
    rank: index + 1,
  }));
}
