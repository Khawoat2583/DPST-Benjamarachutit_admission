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
  console.log("=== Starting Database Cleanup ===");
  // Clean up existing records in reverse dependency order
  await db.delete(examScores);
  await db.delete(courseGrades);
  await db.delete(attachments);
  await db.delete(applications);
  console.log("Database cleared successfully.");

  console.log("\n=== Seeding Dummy Applicants ===");

  // Define the 6 candidates representing all possible system statuses
  const seededApps = await db
    .insert(applications)
    .values([
      // 1. DRAFT - Candidate filling out draft
      {
        status: "draft",
        nationalId: "1200100055443",
        title: "เด็กชาย",
        firstName: "สมศักดิ์",
        lastName: "รักเรียน",
        announcementOrder: 1001,
        email: "somsak.rak@gmail.com",
        phone: "0812345678",
        guardianPhone: "0812345679",
        addressNo: "45/12",
        addressMoo: "3",
        addressSubdistrict: "ในเมือง",
        addressDistrict: "เมืองนครศรีธรรมราช",
        addressProvince: "นครศรีธรรมราช",
        addressZipcode: "80000",
        schoolName: "กัลยาณีศรีธรรมราช",
        schoolProvince: "นครศรีธรรมราช",
        gpax: null,
        mathGpa: null,
        scienceGpa: null,
        englishGpa: null,
        rejectionReason: null,
      },
      // 2. SUBMITTED - Applied and awaiting review
      {
        status: "submitted",
        nationalId: "1200100066778",
        title: "นาย",
        firstName: "วัลลภ",
        lastName: "สันติธรรม",
        announcementOrder: 1002,
        email: "wanlop.san@outlook.com",
        phone: "0898765432",
        guardianPhone: "0898765433",
        addressNo: "99/4",
        addressSubdistrict: "คลัง",
        addressDistrict: "เมืองนครศรีธรรมราช",
        addressProvince: "นครศรีธรรมราช",
        addressZipcode: "80000",
        schoolName: "เบญจมราชูทิศ",
        schoolProvince: "นครศรีธรรมราช",
        gpax: "3.90",
        mathGpa: "3.95",
        scienceGpa: "3.85",
        englishGpa: "3.90",
        rejectionReason: null,
        submittedAt: new Date(),
      },
      // 3. APPROVED - Checked by admin, waiting for exam score import / ranking
      {
        status: "approved",
        nationalId: "1200100077889",
        title: "เด็กหญิง",
        firstName: "สุภัทรา",
        lastName: "รุ่งเรือง",
        announcementOrder: 1003,
        email: "supattra.run@yahoo.com",
        phone: "0865432109",
        guardianPhone: "0865432108",
        addressNo: "12/5",
        addressMoo: "1",
        addressSubdistrict: "ศาลามีชัย",
        addressDistrict: "เมืองนครศรีธรรมราช",
        addressProvince: "นครศรีธรรมราช",
        addressZipcode: "80000",
        schoolName: "สาธิตเทศบาลวัดเพชรจริก",
        schoolProvince: "นครศรีธรรมราช",
        gpax: "3.85",
        mathGpa: "3.80",
        scienceGpa: "3.90",
        englishGpa: "3.85",
        rejectionReason: null,
        submittedAt: new Date(Date.now() - 86400000), // 1 day ago
        reviewedAt: new Date(),
      },
      // 4. REJECTED - Sent back for corrections
      {
        status: "rejected",
        nationalId: "1200100088990",
        title: "เด็กหญิง",
        firstName: "ธนาวรรณ",
        lastName: "ทิพย์วารี",
        announcementOrder: 1004,
        email: "thanawan.thip@gmail.com",
        phone: "0877778888",
        guardianPhone: "0877778889",
        addressNo: "201",
        addressSubdistrict: "ท่าวัง",
        addressDistrict: "เมืองนครศรีธรรมราช",
        addressProvince: "นครศรีธรรมราช",
        addressZipcode: "80000",
        schoolName: "กัลยาณีศรีธรรมราช",
        schoolProvince: "นครศรีธรรมราช",
        gpax: "3.75",
        mathGpa: "3.70",
        scienceGpa: "3.80",
        englishGpa: "3.75",
        rejectionReason: "ภาพถ่ายใบระเบียนแสดงผลการเรียน (ปพ.1) ไม่ชัดเจน กรุณาถ่ายภาพให้เห็นคะแนนวิชาวิทยาศาสตร์และคณิตศาสตร์แบบชัดเจนอีกครั้ง",
        submittedAt: new Date(Date.now() - 172800000), // 2 days ago
        reviewedAt: new Date(),
      },
      // 5. RANKED - Already has exam score imported and ranked
      {
        status: "ranked",
        nationalId: "1200100099112",
        title: "นาย",
        firstName: "ปิยวัฒน์",
        lastName: "ก้องสมุทร",
        announcementOrder: 1005,
        email: "piyawat.kong@outlook.com",
        phone: "0823334444",
        guardianPhone: "0823334445",
        addressNo: "88/8",
        addressSubdistrict: "ปากพูน",
        addressDistrict: "เมืองนครศรีธรรมราช",
        addressProvince: "นครศรีธรรมราช",
        addressZipcode: "80000",
        schoolName: "เบญจมราชูทิศ",
        schoolProvince: "นครศรีธรรมราช",
        gpax: "3.95",
        mathGpa: "4.00",
        scienceGpa: "3.90",
        englishGpa: "3.95",
        rejectionReason: null,
        submittedAt: new Date(Date.now() - 259200000), // 3 days ago
        reviewedAt: new Date(Date.now() - 86400000),
        rankedAt: new Date(),
      },
      // 6. EXPORTED - Application is finished and exported
      {
        status: "exported",
        nationalId: "1200100022334",
        title: "เด็กหญิง",
        firstName: "ชลดา",
        lastName: "นารีรัตน์",
        announcementOrder: 1006,
        email: "chonlada.na@gmail.com",
        phone: "0852221111",
        guardianPhone: "0852221112",
        addressNo: "7/1",
        addressSubdistrict: "ท่าวัง",
        addressDistrict: "เมืองนครศรีธรรมราช",
        addressProvince: "นครศรีธรรมราช",
        addressZipcode: "80000",
        schoolName: "สาธิตเทศบาลวัดเพชรจริก",
        schoolProvince: "นครศรีธรรมราช",
        gpax: "3.72",
        mathGpa: "3.65",
        scienceGpa: "3.80",
        englishGpa: "3.70",
        rejectionReason: null,
        submittedAt: new Date(Date.now() - 345600000), // 4 days ago
        reviewedAt: new Date(Date.now() - 172800000),
        rankedAt: new Date(Date.now() - 86400000),
        exportedAt: new Date(),
      },
    ])
    .returning({
      id: applications.id,
      status: applications.status,
      announcementOrder: applications.announcementOrder,
    });

  console.log(`Successfully seeded ${seededApps.length} applicants.`);

  // Mapping to link details by applicationId
  const appMap = new Map<string, number>();
  seededApps.forEach((app) => {
    appMap.set(app.status, app.id);
  });

  console.log("\n=== Seeding Course Grades & Mock Attachments ===");

  // Fill in grades & attachments for non-draft applicants
  const nonDraftStatuses = ["submitted", "approved", "rejected", "ranked", "exported"];
  const subjectGroups = ["math", "science", "english"] as const;

  for (const status of nonDraftStatuses) {
    const appId = appMap.get(status);
    if (!appId) continue;

    // 1. Seeding grades for 5 semesters (Semester 1 to 5)
    const gradesToInsert: Array<{
      applicationId: number;
      subjectGroup: "math" | "science" | "english";
      semester: number;
      courseCode: string;
      courseName: string;
      credit: string;
      grade: string;
    }> = [];
    for (const group of subjectGroups) {
      for (let sem = 1; sem <= 5; sem++) {
        gradesToInsert.push({
          applicationId: appId,
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
          grade: status === "ranked" ? "4.00" : "3.50", // Higher grades for ranked for realism
        });
      }
    }
    await db.insert(courseGrades).values(gradesToInsert);

    // 2. Seeding Mock Attachment Records
    await db.insert(attachments).values([
      {
        applicationId: appId,
        documentType: "photo",
        originalName: `${status}_face_photo.jpg`,
        storedName: `mock-${status}-photo-stored-key.jpg`,
        mimeType: "image/jpeg",
        fileSize: 48000,
      },
      {
        applicationId: appId,
        documentType: "transcript",
        originalName: `${status}_papo1_transcript.png`,
        storedName: `mock-${status}-transcript-stored-key.png`,
        mimeType: "image/png",
        fileSize: 152000,
      },
      {
        applicationId: appId,
        documentType: "id_card",
        originalName: `${status}_national_id_card.pdf`,
        storedName: `mock-${status}-idcard-stored-key.pdf`,
        mimeType: "application/pdf",
        fileSize: 220000,
      },
    ]);
  }
  console.log("Course Grades and Mock Attachments created for all active statuses.");

  console.log("\n=== Seeding Pre-existing Exam Scores ===");

  // Seed pre-existing score records for Ranked and Exported applicants
  await db.insert(examScores).values([
    {
      examId: "EX69104",
      announcementOrder: 1005, // Piyawat (ranked)
      mathScore: "95.00",
      scienceScore: "93.00",
    },
    {
      examId: "EX69105",
      announcementOrder: 1006, // Chonlada (exported)
      mathScore: "87.50",
      scienceScore: "90.00",
    },
  ]);
  console.log("Seeded exam scores for ranked/exported states.");

  console.log("\n=== Generating Dummy Excel Score File ===");
  // Generate dummy_scores.xlsx
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("First Round Exam Scores");

  // Format Headers
  worksheet.columns = [
    { header: "เลขประจำตัวสอบ", key: "examId", width: 20 },
    { header: "ลำดับประกาศ", key: "announcementOrder", width: 15 },
    { header: "คะแนนคณิตศาสตร์", key: "mathScore", width: 20 },
    { header: "คะแนนวิทยาศาสตร์", key: "scienceScore", width: 20 },
  ];

  // Make header bold and styled
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, name: "Calibri", size: 11 };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };

  // Add Row data
  const rows = [
    { examId: "EX69101", announcementOrder: 1002, mathScore: 78.50, scienceScore: 82.00 }, // Wanlop (submitted - will match)
    { examId: "EX69102", announcementOrder: 1003, mathScore: 91.00, scienceScore: 89.50 }, // Supattra (approved - will match)
    { examId: "EX69103", announcementOrder: 1004, mathScore: 65.00, scienceScore: 71.50 }, // Thanawan (rejected - will match)
    { examId: "EX69104", announcementOrder: 1005, mathScore: 95.00, scienceScore: 93.00 }, // Piyawat (ranked - will match)
    { examId: "EX69107", announcementOrder: 1007, mathScore: 88.00, scienceScore: 86.50 }, // Mismatch Case 1 (no applicant)
    { examId: "EX69108", announcementOrder: 1008, mathScore: 72.00, scienceScore: 75.00 }, // Mismatch Case 2 (no applicant)
  ];

  rows.forEach((r) => {
    worksheet.addRow([r.examId, r.announcementOrder, r.mathScore.toFixed(2), r.scienceScore.toFixed(2)]);
  });

  const outputPath = path.join(process.cwd(), "dummy_scores.xlsx");
  await workbook.xlsx.writeFile(outputPath);
  console.log(`Excel file 'dummy_scores.xlsx' successfully generated and saved to: ${outputPath}`);

  console.log("\n=============================================");
  console.log("🚀 Dummy Data Generation Completed Successfully!");
  console.log("---------------------------------------------");
  console.log("Summary of Seeded Database Applications:");
  console.log("1. draft     - สมศักดิ์ รักเรียน (ลำดับประกาศ 1001)");
  console.log("2. submitted - วัลลภ สันติธรรม (ลำดับประกาศ 1002) -> Match ใน Excel");
  console.log("3. approved  - สุภัทรา รุ่งเรือง (ลำดับประกาศ 1003) -> Match ใน Excel");
  console.log("4. rejected  - ธนาวรรณ ทิพย์วารี (ลำดับประกาศ 1004) -> Match ใน Excel");
  console.log("5. ranked    - ปิยวัฒน์ ก้องสมุทร (ลำดับประกาศ 1005) -> Match ใน Excel");
  console.log("6. exported  - ชลดา นารีรัตน์ (ลำดับประกาศ 1006)");
  console.log("\nExcel File 'dummy_scores.xlsx' Contains:");
  console.log("- 4 matching candidates (submitted, approved, rejected, ranked)");
  console.log("- 2 mismatch candidates (ลำดับประกาศ 1007, 1008) to test warnings.");
  console.log("=============================================");

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
