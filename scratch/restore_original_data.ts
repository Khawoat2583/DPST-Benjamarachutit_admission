import { db } from "../src/db";
import {
  applications,
  courseGrades,
  attachments,
  examScores,
} from "../src/db/schema";
import fs from "fs/promises";
import path from "path";

async function main() {
  console.log("=== Starting Database Cleanup ===");
  // Clean up database tables
  await db.delete(examScores);
  await db.delete(courseGrades);
  await db.delete(attachments);
  await db.delete(applications);
  console.log("Database cleared successfully.");

  console.log("\n=== Restoring Original Pre-seeding Data ===");

  // Re-insert exact 3 original candidates that existed in your database
  const restoredApps = await db
    .insert(applications)
    .values([
      {
        id: 1,
        status: "submitted",
        nationalId: "1111111111119",
        title: "นาย",
        firstName: "abc",
        lastName: "def",
        announcementOrder: 123,
        email: "n@benjama.ac.th",
        phone: "123123121",
        guardianPhone: "321321321",
        addressNo: "123",
        addressMoo: "123",
        addressSoi: "123",
        addressRoad: "123",
        addressSubdistrict: "123",
        addressDistrict: "123",
        addressProvince: "123",
        addressZipcode: "12312",
        schoolName: "เบญจมราชูทิศ",
        schoolProvince: "นครศรีธรรมราช",
        gpax: "4.00",
        mathGpa: "3.68",
        scienceGpa: "3.32",
        englishGpa: "4.00",
        rejectionReason: null,
        submittedAt: new Date("2026-05-20T15:22:56.632Z"),
        createdAt: new Date("2026-05-20T15:04:20.522Z"),
        updatedAt: new Date("2026-05-21T07:05:10.528Z"),
      },
      {
        id: 2,
        status: "draft",
        nationalId: "1211111111118",
        title: "เด็กหญิง",
        firstName: "1234",
        lastName: "1234",
        announcementOrder: 445,
        email: null,
        phone: "",
        guardianPhone: "",
        addressNo: "",
        addressMoo: null,
        addressSoi: null,
        addressRoad: null,
        addressSubdistrict: "",
        addressDistrict: "",
        addressProvince: "",
        addressZipcode: "",
        schoolName: "",
        schoolProvince: "",
        gpax: null,
        mathGpa: null,
        scienceGpa: null,
        englishGpa: null,
        rejectionReason: null,
        createdAt: new Date("2026-05-21T06:05:03.815Z"),
        updatedAt: new Date("2026-05-21T06:13:24.073Z"),
      },
      {
        id: 3,
        status: "draft",
        nationalId: "1242453454567",
        title: "",
        firstName: "",
        lastName: "",
        announcementOrder: 0,
        email: null,
        phone: "",
        guardianPhone: "",
        addressNo: "",
        addressMoo: null,
        addressSoi: null,
        addressRoad: null,
        addressSubdistrict: "",
        addressDistrict: "",
        addressProvince: "",
        addressZipcode: "",
        schoolName: "",
        schoolProvince: "",
        gpax: null,
        mathGpa: null,
        scienceGpa: null,
        englishGpa: null,
        rejectionReason: null,
        createdAt: new Date("2026-05-21T06:13:32.345Z"),
        updatedAt: new Date("2026-05-21T06:18:25.532Z"),
      },
    ])
    .returning({
      id: applications.id,
      firstName: applications.firstName,
      lastName: applications.lastName,
    });

  console.log(`Successfully restored ${restoredApps.length} applications.`);

  console.log("\n=== Restoring Original Attachments ===");

  // Re-insert the exact attachment links
  await db.insert(attachments).values([
    {
      id: 1,
      applicationId: 1,
      documentType: "photo",
      originalName: "image (2).png",
      storedName: "65180ceb-0197-4485-a691-1c0fde55f687.png",
      mimeType: "image/png",
      fileSize: 2015544,
      createdAt: new Date("2026-05-20T15:04:20.532Z"),
    },
    {
      id: 2,
      applicationId: 1,
      documentType: "transcript",
      originalName: "image (1).png",
      storedName: "2f9faf52-af31-41df-8ae2-d29eac2d9bcb.png",
      mimeType: "image/png",
      fileSize: 2009428,
      createdAt: new Date("2026-05-20T15:04:22.807Z"),
    },
    {
      id: 4,
      applicationId: 1,
      documentType: "transcript",
      originalName: "img2.jpg",
      storedName: "44441ed5-eb1e-485d-a6f6-437ae6140565.jpg",
      mimeType: "image/jpeg",
      fileSize: 463825,
      createdAt: new Date("2026-05-20T15:04:33.883Z"),
    },
    {
      id: 5,
      applicationId: 1,
      documentType: "id_card",
      originalName: "logo.png",
      storedName: "303fb0fe-a35a-449a-9796-0280e240a0db.png",
      mimeType: "image/png",
      fileSize: 1273039,
      createdAt: new Date("2026-05-20T15:04:43.485Z"),
    },
  ]);

  console.log("Original attachments successfully linked to candidate #1.");

  // Delete physical temporary scores sheet from root to keep it clean
  const excelPath = path.join(process.cwd(), "dummy_scores.xlsx");
  try {
    await fs.unlink(excelPath);
    console.log(`\nRemoved temporary test file: ${excelPath}`);
  } catch {}

  console.log("\n=============================================");
  console.log("🎉 Database Successfully Restored to Original State!");
  console.log("=============================================");

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
