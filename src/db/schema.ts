import { relations } from "drizzle-orm";
import {
  boolean,
  numeric,
  pgEnum,
  pgTable,
  integer,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

// 1. Enums Definitions
export const applicationStatus = pgEnum("application_status", [
  "draft",
  "submitted",
  "approved",
  "rejected",
  "ranked",
  "exported",
]);

export const subjectGroup = pgEnum("subject_group", [
  "math",
  "science",
  "english",
]);

export const documentType = pgEnum("document_type", [
  "photo",
  "transcript",
  "id_card",
]);

// 2. Main Applications Table
export const applications = pgTable(
  "applications",
  {
    id: serial("id").primaryKey(),
    status: applicationStatus("status").notNull().default("draft"),
    nationalId: varchar("national_id", { length: 13 }).notNull(),
    title: text("title"), // คำนำหน้านาม เช่น เด็กชาย, เด็กหญิง, นาย, นางสาว
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    announcementOrder: integer("announcement_order"), // ลำดับประกาศผลสอบรอบแรก
    passwordHash: text("password_hash"),
    resetPin: text("reset_pin"), // stores a PBKDF2 hash of the 6-digit reset PIN
    resetPinExpiresAt: timestamp("reset_pin_expires_at", { withTimezone: true }),
    
    // ข้อมูลติดต่อ
    email: text("email"),
    phone: varchar("phone", { length: 20 }),
    guardianPhone: varchar("guardian_phone", { length: 20 }),
    
    // ที่อยู่ปัจจุบัน / ทะเบียนบ้าน
    addressNo: text("address_no"),
    addressMoo: text("address_moo"),
    addressSoi: text("address_soi"),
    addressRoad: text("address_road"),
    addressSubdistrict: text("address_subdistrict"),
    addressDistrict: text("address_district"),
    addressProvince: text("address_province"),
    addressZipcode: varchar("address_zipcode", { length: 5 }),
    
    // ข้อมูลโรงเรียนเดิม
    schoolName: text("school_name"),
    schoolProvince: text("school_province"),
    
    // ผลการเรียนคำนวณสะสม (GPAX 5 เทอม)
    gpax: numeric("gpax", { precision: 4, scale: 2 }),
    
    // ผลการเรียนเฉลี่ยรายวิชาเฉพาะด้าน (ปัด 2 ตำแหน่ง) - ใช้สำหรับคัดคุณสมบัติและ Ranking
    mathGpa: numeric("math_gpa", { precision: 4, scale: 2 }),
    scienceGpa: numeric("science_gpa", { precision: 4, scale: 2 }),
    englishGpa: numeric("english_gpa", { precision: 4, scale: 2 }),
    
    // Rejection workflow
    rejectionReason: text("rejection_reason"), // เหตุผลที่เจ้าหน้าที่ส่งกลับแก้ไข
    
    // Workflow Timestamps
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    rankedAt: timestamp("ranked_at", { withTimezone: true }),
    exportedAt: timestamp("exported_at", { withTimezone: true }),
    
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("applications_national_id_unique").on(table.nationalId),
    uniqueIndex("applications_announcement_order_unique").on(
      table.announcementOrder,
    ),
  ],
);

// 3. Course Grades Table (เก็บเกรดเฉลี่ยรายเทอม/วิชา)
export const courseGrades = pgTable(
  "course_grades",
  {
    id: serial("id").primaryKey(),
    applicationId: integer("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    subjectGroup: subjectGroup("subject_group").notNull(),
    semester: integer("semester").notNull(), // 1-5 (ม.1 เทอม 1 ถึง ม.3 เทอม 1)
    courseCode: varchar("course_code", { length: 20 }).notNull(),
    courseName: text("course_name").notNull(),
    credit: numeric("credit", { precision: 3, scale: 2 }).notNull(), // e.g. 1.50
    grade: numeric("grade", { precision: 3, scale: 2 }).notNull(), // e.g. 4.00
    
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  }
);

// 4. Attachments Table (เก็บข้อมูลอัปโหลดไฟล์ส่วนบุคคลอย่างปลอดภัย)
export const attachments = pgTable(
  "attachments",
  {
    id: serial("id").primaryKey(),
    applicationId: integer("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    documentType: documentType("document_type").notNull(), // photo, transcript, id_card
    originalName: text("original_name").notNull(), // ชื่อไฟล์ดั้งเดิม
    storedName: text("stored_name").notNull(), // ชื่อไฟล์รหัสสุ่มฝั่ง VPS
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    fileSize: integer("file_size").notNull(), // ขนาดไฟล์ (bytes)
    
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  }
);

// 5. Exam Scores Table (ตารางนำเข้าคะแนนสอบรอบแรกภายนอกผ่าน Excel)
export const examScores = pgTable(
  "exam_scores",
  {
    id: serial("id").primaryKey(),
    examId: varchar("exam_id", { length: 50 }).notNull(), // เลขประจำตัวสอบรอบแรก
    announcementOrder: integer("announcement_order").notNull(), // ลำดับประกาศ
    mathScore: numeric("math_score", { precision: 6, scale: 2 }).notNull(), // คะแนนสอบคณิตรอบแรก
    scienceScore: numeric("science_score", { precision: 6, scale: 2 }).notNull(), // คะแนนสอบวิทย์รอบแรก
    
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("exam_scores_exam_id_unique").on(table.examId),
    uniqueIndex("exam_scores_announcement_order_unique").on(
      table.announcementOrder,
    ),
  ]
);

// 6. Drizzle Relations Definitions
export const applicationsRelations = relations(applications, ({ many }) => ({
  grades: many(courseGrades),
  attachments: many(attachments),
}));

export const courseGradesRelations = relations(courseGrades, ({ one }) => ({
  application: one(applications, {
    fields: [courseGrades.applicationId],
    references: [applications.id],
  }),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  application: one(applications, {
    fields: [attachments.applicationId],
    references: [applications.id],
  }),
}));

// 7. Audit Logs Table
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  adminUsername: varchar("admin_username", { length: 100 }),
  action: varchar("action", { length: 100 }).notNull(),
  details: text("details"),
  ipAddress: varchar("ip_address", { length: 50 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// 8. Login Attempts / Rate Limits Table
export const loginAttempts = pgTable("login_attempts", {
  id: serial("id").primaryKey(),
  ipAddress: varchar("ip_address", { length: 50 }).notNull(),
  attempts: integer("attempts").notNull().default(0),
  lastAttemptAt: timestamp("last_attempt_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  blockedUntil: timestamp("blocked_until", { withTimezone: true }),
}, (table) => [
  uniqueIndex("login_attempts_ip_address_unique").on(table.ipAddress),
]);

// 9. News Type Enum
export const newsTypeEnum = pgEnum("news_type", [
  "กิจกรรม",
  "การศึกษาต่อ",
  "ผลงานนักเรียน",
  "รับนักเรียน",
  "อื่น ๆ",
]);

// 10. News Posts Table
export const newsPosts = pgTable("news_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default(""),
  newsType: newsTypeEnum("news_type").notNull().default("อื่น ๆ"),
  isPinned: boolean("is_pinned").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// 10. News Images Table (Supports multiple images per post)
export const newsImages = pgTable("news_images", {
  id: serial("id").primaryKey(),
  postId: integer("post_id")
    .notNull()
    .references(() => newsPosts.id, { onDelete: "cascade" }),
  originalName: text("original_name").notNull(),
  storedName: text("stored_name").notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  fileSize: integer("file_size").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// 11. News Relations Definitions
export const newsPostsRelations = relations(newsPosts, ({ many }) => ({
  images: many(newsImages),
}));

export const newsImagesRelations = relations(newsImages, ({ one }) => ({
  post: one(newsPosts, {
    fields: [newsImages.postId],
    references: [newsPosts.id],
  }),
}));



