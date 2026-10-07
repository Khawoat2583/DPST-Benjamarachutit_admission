import { db } from "../src/db";
import {
  applications,
  courseGrades,
  attachments,
  examScores,
} from "../src/db/schema";
import ExcelJS from "exceljs";
import path from "path";

async function main() {
  console.log("=== Starting Database Cleanup for Ranking Test ===");
  await db.delete(examScores);
  await db.delete(courseGrades);
  await db.delete(attachments);
  await db.delete(applications);
  console.log("Database cleared successfully.");

  console.log("\n=== Seeding Candidates to Test All Ranking & Tie-Breaker Rules ===");

  // Seed 9 eligible applicants in 'approved' status to be ranked, and 1 in 'submitted' status
  const seededApps = await db
    .insert(applications)
    .values([
      // Candidate 1: Highest Total Exam Score (Math + Science) -> Should be Rank 1
      {
        id: 11,
        status: "approved",
        nationalId: "2000000000001",
        title: "นาย",
        firstName: "เกียรติศักดิ์",
        lastName: "คะแนนรวมนำ",
        announcementOrder: 2006,
        email: "c1@example.com",
        phone: "0800000001",
        schoolName: "โรงเรียนสาธิต พสวท.",
        schoolProvince: "นครศรีธรรมราช",
        gpax: "3.50",
        mathGpa: "3.50",
        scienceGpa: "3.50",
        englishGpa: "3.50",
        submittedAt: new Date(),
        reviewedAt: new Date(),
      },
      // Candidate 2: Same Total as C3 (180), but higher Math Exam Score -> Should be Rank 2
      {
        id: 12,
        status: "approved",
        nationalId: "2000000000002",
        title: "นาย",
        firstName: "ขวัญชัย",
        lastName: "คณิตสอบนำ",
        announcementOrder: 2003,
        email: "c2@example.com",
        phone: "0800000002",
        schoolName: "โรงเรียนสาธิต พสวท.",
        schoolProvince: "นครศรีธรรมราช",
        gpax: "3.50",
        mathGpa: "3.50",
        scienceGpa: "3.50",
        englishGpa: "3.50",
        submittedAt: new Date(),
        reviewedAt: new Date(),
      },
      // Candidate 3: Same Total as C2 (180), but lower Math Exam Score -> Should be Rank 3
      {
        id: 13,
        status: "approved",
        nationalId: "2000000000003",
        title: "นาย",
        firstName: "คมสัน",
        lastName: "วิทย์สอบตาม",
        announcementOrder: 2005,
        email: "c3@example.com",
        phone: "0800000003",
        schoolName: "โรงเรียนสาธิต พสวท.",
        schoolProvince: "นครศรีธรรมราช",
        gpax: "3.50",
        mathGpa: "3.50",
        scienceGpa: "3.50",
        englishGpa: "3.50",
        submittedAt: new Date(),
        reviewedAt: new Date(),
      },
      // Candidate 4: Same Exam Scores as C5-C9, but has highest Math GPA -> Should be Rank 4
      {
        id: 14,
        status: "approved",
        nationalId: "2000000000004",
        title: "นางสาว",
        firstName: "จิราพร",
        lastName: "คณิตเกรดนำ",
        announcementOrder: 2004,
        email: "c4@example.com",
        phone: "0800000004",
        schoolName: "โรงเรียนสาธิต พสวท.",
        schoolProvince: "นครศรีธรรมราช",
        gpax: "3.50",
        mathGpa: "4.00",
        scienceGpa: "3.50",
        englishGpa: "3.50",
        submittedAt: new Date(),
        reviewedAt: new Date(),
      },
      // Candidate 5: Same Exam Scores, Math GPA = 3.50, but has Science GPA = 4.00 -> Should be Rank 5
      {
        id: 15,
        status: "approved",
        nationalId: "2000000000005",
        title: "นาย",
        firstName: "ฉัตรชัย",
        lastName: "วิทย์เกรดนำ",
        announcementOrder: 2001,
        email: "c5@example.com",
        phone: "0800000005",
        schoolName: "โรงเรียนสาธิต พสวท.",
        schoolProvince: "นครศรีธรรมราช",
        gpax: "3.50",
        mathGpa: "3.50",
        scienceGpa: "4.00",
        englishGpa: "3.50",
        submittedAt: new Date(),
        reviewedAt: new Date(),
      },
      // Candidate 6: Same Exam and Math/Sci GPAs, but has English GPA = 4.00 -> Should be Rank 6
      {
        id: 16,
        status: "approved",
        nationalId: "2000000000006",
        title: "นางสาว",
        firstName: "ชลิตา",
        lastName: "อังกฤษเกรดนำ",
        announcementOrder: 2008,
        email: "c6@example.com",
        phone: "0800000006",
        schoolName: "โรงเรียนสาธิต พสวท.",
        schoolProvince: "นครศรีธรรมราช",
        gpax: "3.50",
        mathGpa: "3.50",
        scienceGpa: "3.50",
        englishGpa: "4.00",
        submittedAt: new Date(),
        reviewedAt: new Date(),
      },
      // Candidate 7: Same Exam and Math/Sci/Eng GPAs, but has GPAX = 3.80 -> Should be Rank 7
      {
        id: 17,
        status: "approved",
        nationalId: "2000000000007",
        title: "นาย",
        firstName: "ณัฐพล",
        lastName: "เกรดสะสมนำ",
        announcementOrder: 2002,
        email: "c7@example.com",
        phone: "0800000007",
        schoolName: "โรงเรียนสาธิต พสวท.",
        schoolProvince: "นครศรีธรรมราช",
        gpax: "3.80",
        mathGpa: "3.50",
        scienceGpa: "3.50",
        englishGpa: "3.50",
        submittedAt: new Date(),
        reviewedAt: new Date(),
      },
      // Candidate 8: Same Exam & all GPAs, but has smaller Announcement Order (2008) -> Should be Rank 8
      {
        id: 18,
        status: "approved",
        nationalId: "2000000000008",
        title: "นาย",
        firstName: "ทรงพล",
        lastName: "ลำดับดีกว่า",
        announcementOrder: 2007,
        email: "c8@example.com",
        phone: "0800000008",
        schoolName: "โรงเรียนสาธิต พสวท.",
        schoolProvince: "นครศรีธรรมราช",
        gpax: "3.50",
        mathGpa: "3.50",
        scienceGpa: "3.50",
        englishGpa: "3.50",
        submittedAt: new Date(),
        reviewedAt: new Date(),
      },
      // Candidate 9: Same Exam & all GPAs, but has larger Announcement Order (2009) -> Should be Rank 9
      {
        id: 19,
        status: "approved",
        nationalId: "2000000000009",
        title: "นาย",
        firstName: "ธนพล",
        lastName: "ลำดับตามหลัง",
        announcementOrder: 2010,
        email: "c9@example.com",
        phone: "0800000009",
        schoolName: "โรงเรียนสาธิต พสวท.",
        schoolProvince: "นครศรีธรรมราช",
        gpax: "3.50",
        mathGpa: "3.50",
        scienceGpa: "3.50",
        englishGpa: "3.50",
        submittedAt: new Date(),
        reviewedAt: new Date(),
      },
      // Candidate 10: Unqualified (Math GPA is 2.50 < 3.00) -> Status is submitted, won't participate in ranking
      {
        id: 20,
        status: "submitted",
        nationalId: "2000000000010",
        title: "นาย",
        firstName: "บุญธรรม",
        lastName: "ตกคุณสมบัติ",
        announcementOrder: 2009,
        email: "c10@example.com",
        phone: "0800000010",
        schoolName: "โรงเรียนสาธิต พสวท.",
        schoolProvince: "นครศรีธรรมราช",
        gpax: "3.50",
        mathGpa: "2.50",
        scienceGpa: "3.50",
        englishGpa: "3.50",
        submittedAt: new Date(),
      },
    ])
    .returning({
      id: applications.id,
      firstName: applications.firstName,
      status: applications.status,
    });

  console.log(`Seeded ${seededApps.length} applicants successfully.`);

  // Insert mock course grades and attachments for all these 10 candidates
  console.log("Generating course grades and attachments for consistency...");
  for (let id = 11; id <= 20; id++) {
    const isUnqualified = id === 20;
    const grades: Array<{
      applicationId: number;
      subjectGroup: "math" | "science" | "english";
      semester: number;
      courseCode: string;
      courseName: string;
      credit: string;
      grade: string;
    }> = [];
    const subjects = ["math", "science", "english"] as const;

    for (const group of subjects) {
      let baseGrade = "3.50";
      if (group === "math" && id === 14) baseGrade = "4.00";
      if (group === "science" && id === 15) baseGrade = "4.00";
      if (group === "english" && id === 16) baseGrade = "4.00";
      if (group === "math" && isUnqualified) baseGrade = "2.50"; // Unqualified grade

      for (let sem = 1; sem <= 5; sem++) {
        grades.push({
          applicationId: id,
          subjectGroup: group,
          semester: sem,
          courseCode: group === "math" ? `ค2110${sem}` : group === "science" ? `ว2110${sem}` : `อ2110${sem}`,
          courseName:
            group === "math"
              ? "คณิตศาสตร์พื้นฐาน"
              : group === "science"
              ? "วิทยาศาสตร์พื้นฐาน"
              : "ภาษาอังกฤษพื้นฐาน",
          credit: "1.50",
          grade: baseGrade,
        });
      }
    }
    await db.insert(courseGrades).values(grades);

    await db.insert(attachments).values([
      {
        applicationId: id,
        documentType: "photo",
        originalName: "test_photo.jpg",
        storedName: `mock-test-${id}-photo.jpg`,
        mimeType: "image/jpeg",
        fileSize: 45000,
      },
      {
        applicationId: id,
        documentType: "transcript",
        originalName: "test_transcript.png",
        storedName: `mock-test-${id}-transcript.png`,
        mimeType: "image/png",
        fileSize: 135000,
      },
      {
        applicationId: id,
        documentType: "id_card",
        originalName: "test_idcard.pdf",
        storedName: `mock-test-${id}-idcard.pdf`,
        mimeType: "application/pdf",
        fileSize: 180000,
      },
    ]);
  }

  console.log("Mock grades and attachments inserted.");

  console.log("\n=== Generating Ranking Test Excel Score File ===");
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Ranking Test Scores");

  worksheet.columns = [
    { header: "เลขประจำตัวสอบ", key: "examId", width: 20 },
    { header: "ลำดับประกาศ", key: "announcementOrder", width: 15 },
    { header: "คะแนนคณิตศาสตร์", key: "mathScore", width: 20 },
    { header: "คะแนนวิทยาศาสตร์", key: "scienceScore", width: 20 },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: "center" };

  // Write exact exam scores designed for our tiebreaker chain
  const testScores = [
    { examId: "EX-T01", announcementOrder: 2006, mathScore: 95.00, scienceScore: 95.00 }, // C1: Total 190 (Rank 1)
    { examId: "EX-T02", announcementOrder: 2003, mathScore: 95.00, scienceScore: 85.00 }, // C2: Total 180, Math 95 (Rank 2)
    { examId: "EX-T03", announcementOrder: 2005, mathScore: 85.00, scienceScore: 95.00 }, // C3: Total 180, Math 85 (Rank 3)
    { examId: "EX-T04", announcementOrder: 2004, mathScore: 85.00, scienceScore: 85.00 }, // C4: Total 170, Math GPA 4.00 (Rank 4)
    { examId: "EX-T05", announcementOrder: 2001, mathScore: 85.00, scienceScore: 85.00 }, // C5: Total 170, Sci GPA 4.00 (Rank 5)
    { examId: "EX-T06", announcementOrder: 2008, mathScore: 85.00, scienceScore: 85.00 }, // C6: Total 170, Eng GPA 4.00 (Rank 6)
    { examId: "EX-T07", announcementOrder: 2002, mathScore: 85.00, scienceScore: 85.00 }, // C7: Total 170, GPAX 3.80 (Rank 7)
    { examId: "EX-T08", announcementOrder: 2007, mathScore: 85.00, scienceScore: 85.00 }, // C8: Total 170, Order 2008 (Rank 8)
    { examId: "EX-T09", announcementOrder: 2010, mathScore: 85.00, scienceScore: 85.00 }, // C9: Total 170, Order 2009 (Rank 9)
    { examId: "EX-T10", announcementOrder: 2009, mathScore: 99.00, scienceScore: 99.00 }, // C10: Unqualified (Status submitted, not ranked)
  ];

  testScores.forEach((s) => {
    worksheet.addRow([s.examId, s.announcementOrder, s.mathScore.toFixed(2), s.scienceScore.toFixed(2)]);
  });

  const outputPath = path.join(process.cwd(), "ranking_test_scores.xlsx");
  await workbook.xlsx.writeFile(outputPath);
  console.log(`Excel file 'ranking_test_scores.xlsx' generated at: ${outputPath}`);

  console.log("\n=======================================================");
  console.log("🏆 Ranking Test Seeding Completed Successfully!");
  console.log("-------------------------------------------------------");
  console.log("Expected Sorting Results (หลังจาก Import & Run Ranking):");
  console.log("Rank 1. เกียรติศักดิ์ คะแนนรวมนำ   (Total Exam 190.00)");
  console.log("Rank 2. ขวัญชัย คณิตสอบนำ       (Total Exam 180.00, คณิตสอบ 95.00)");
  console.log("Rank 3. คมสัน วิทย์สอบตาม       (Total Exam 180.00, คณิตสอบ 85.00)");
  console.log("Rank 4. จิราพร คณิตเกรดนำ       (Total Exam 170.00, เกรดคณิต 4.00)");
  console.log("Rank 5. ฉัตรชัย วิทย์เกรดนำ       (Total Exam 170.00, เกรดวิทย์ 4.00)");
  console.log("Rank 6. ชลิตา อังกฤษเกรดนำ       (Total Exam 170.00, เกรดอังกฤษ 4.00)");
  console.log("Rank 7. ณัฐพล เกรดสะสมนำ       (Total Exam 170.00, GPAX 3.80)");
  console.log("Rank 8. ทรงพล ลำดับดีกว่า         (Total Exam 170.00, ลำดับประกาศ 2008)");
  console.log("Rank 9. ธนพล ลำดับตามหลัง         (Total Exam 170.00, ลำดับประกาศ 2009)");
  console.log("\n* หมายเหตุ: บุญธรรม ตกคุณสมบัติ (ลำดับ 2010) จะไม่ถูกเข้าร่วมจัดอันดับ");
  console.log("  เนื่องจากสถานะเป็น 'submitted' (ยังไม่ได้รับการอนุมัติเอกสาร ปพ.1)");
  console.log("=======================================================");

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
