# Coding Rules & Engineering Standards
## ระบบรับสมัครนักเรียนโครงการ พสวท. สู่ความเป็นเลิศ

เอกสารนี้เป็นกฎกลางสำหรับการเขียนโค้ดของโปรเจกต์นี้ ทุกคนและทุก agent ที่แก้ระบบต้องยึดตามนี้ก่อนเริ่มงาน เพื่อให้โค้ดมีมาตรฐานเดียวกัน ปลอดภัย ตรวจสอบได้ และรองรับข้อมูลส่วนบุคคลของผู้สมัครอย่างเหมาะสม

---

## 1. Source of Truth

ก่อนเขียนโค้ดหรือแก้ behavior ต้องอ่านเอกสารใน `.context/` ตามลำดับนี้:

1.  `introduction.md` สำหรับ requirements, workflow, grading, ranking, import/export และสถานะใบสมัคร
2.  `tech-stack.md` สำหรับสถาปัตยกรรมและเครื่องมือที่เลือกใช้จริง
3.  `implementation-plan.md` สำหรับแผนเริ่มต้นและ verification scope
4.  `postgres-security-guide.md` สำหรับ security, PostgreSQL และ private file gateway
5.  `rule.md` สำหรับ coding rules ฉบับนี้

ห้าม implement จากความจำหรือ assumption หากเอกสารขัดกัน ให้ยึด `introduction.md` สำหรับ business rules และ `tech-stack.md` สำหรับ technical architecture แล้วปรับเอกสารที่ขัดกันก่อนเขียนโค้ด

---

## 2. Tech Stack ที่ต้องใช้

*   Framework: Next.js App Router + React + TypeScript
*   Styling: Shadcn UI + Tailwind CSS สำหรับ component พื้นฐาน และ CSS Modules สำหรับ layout/interaction เฉพาะทาง
*   Database: PostgreSQL self-hosted บน Linux VPS
*   ORM: Drizzle ORM
*   Validation: Zod
*   Unit tests: Vitest
*   E2E tests: Playwright
*   File storage: private upload directory นอก `public/` และอ่านผ่าน authenticated Next.js Route Handler เท่านั้น
*   Excel import/export: ใช้ library ที่อ่าน/เขียน `.xlsx` แบบ structured ห้าม parse ด้วย string ดิบ

ห้ามเพิ่ม service ใหม่ เช่น Supabase, Firebase, external object storage, auth provider หรือ queue service โดยไม่มีเหตุผลชัดเจนและไม่มีการแก้เอกสาร context ก่อน

---

## 3. Project Structure

ให้แยกโค้ดตาม responsibility ไม่ให้ไฟล์ใหญ่ทำทุกอย่าง:

```text
src/
  app/                 Next.js routes, layouts, route handlers, server actions
  components/          UI components ที่ reuse ได้
  features/            โมดูลตาม domain เช่น applicant, admin-review, ranking
  lib/                 shared utilities ที่ไม่ผูก domain หนัก
  server/              database, auth/session, file gateway, server-only services
  db/                  Drizzle schema, migrations, query helpers
  styles/              global styles และ design tokens
  tests/               test helpers และ fixtures
```

กฎการจัดไฟล์:

*   Business logic สำคัญ เช่น คำนวณเกรด, ranking, import validation ต้องอยู่ใน pure function หรือ service ที่ test ได้
*   React component ห้ามซ่อน business rule ซับซ้อนไว้ใน JSX
*   Route Handler/Server Action ต้องบางที่สุดเท่าที่ทำได้: validate input, call service, return result
*   ห้ามสร้าง utility กลางที่กว้างเกินไป เช่น `helpers.ts` หรือ `utils.ts` ที่รวมหลาย domain

---

## 4. TypeScript Standards

*   เปิด `strict` เสมอ
*   ห้ามใช้ `any` ยกเว้นมีเหตุผลเฉพาะและต้องจำกัด scope ให้แคบที่สุด
*   ใช้ `unknown` สำหรับข้อมูลจากภายนอก แล้ว validate ด้วย Zod ก่อนใช้งาน
*   ใช้ named export เป็นค่าเริ่มต้น ยกเว้น Next.js page/layout conventions
*   ใช้ discriminated union สำหรับสถานะที่มี flow ชัดเจน เช่น application status หรือ import result
*   ห้ามใช้ magic string สำหรับ status, role, subject type, file type ให้ประกาศ enum/constant กลาง

ตัวอย่าง:

```ts
export const APPLICATION_STATUSES = [
  "draft",
  "submitted",
  "approved",
  "rejected",
  "frozen",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
```

---

## 5. Validation Rules

ข้อมูลที่เข้าระบบทุกทางต้อง validate ด้วย Zod:

*   Applicant form
*   Admin edit form
*   Excel import
*   Route params/search params
*   File upload metadata
*   Environment variables

Validation ต้องเกิดทั้งที่ client เพื่อ UX และที่ server เพื่อ security ห้ามเชื่อข้อมูลจาก browser แม้ UI จะ disable field หรือคำนวณให้แล้ว

กฎสำคัญของระบบ:

*   เลขประจำตัวประชาชนต้องเป็นตัวเลข 13 หลัก และควรมี checksum validation
*   เกรดต้องอยู่ในช่วง `0.00` ถึง `4.00`
*   หน่วยกิตต้องเป็นตัวเลขบวก
*   รหัสวิชาพื้นฐานต้องตรวจตัวเลขหลักที่ 3 เป็น `1`
*   Matching คะแนนสอบใช้ `ลำดับรายชื่อตามประกาศ พสวท.` เท่านั้น
*   `Rejected` หมายถึงส่งกลับให้แก้ไข ไม่ใช่ตัดสิทธิ์ถาวร

---

## 6. Grading & Ranking Rules

สูตรคำนวณเกรดเฉลี่ยถ่วงน้ำหนัก:

```text
sum(grade * credit) / sum(credit)
```

กฎ implementation:

*   คำนวณด้วย number utility ที่ test แล้วเท่านั้น ห้ามคำนวณซ้ำหลายที่
*   ผลลัพธ์ GPAX และเกรดเฉลี่ยรายวิชาต้องปัดเป็นทศนิยม 2 ตำแหน่ง
*   ใช้กฎ "ต่ำกว่า 5 ปัดลง ตั้งแต่ 5 ขึ้นไปปัดขึ้น"
*   Ranking ต้องใช้ค่าที่ปัดแล้วเท่านั้น
*   Tie-break ต้องเรียงตาม `introduction.md` ทุกข้อ
*   ห้ามใช้ค่าที่แสดงผลคนละแบบกับค่าที่ ranking ใช้

ต้องมี unit tests สำหรับ:

*   weighted average ปกติ
*   หน่วยกิตหลายภาคเรียน
*   กรณีทศนิยมหลักที่ 3 ต่ำกว่า 5
*   กรณีทศนิยมหลักที่ 3 ตั้งแต่ 5 ขึ้นไป
*   tie-break ranking ทุกระดับ

---

## 7. Security & PDPA

ข้อมูลผู้สมัครเป็น sensitive personal data ต้องใช้แนวทาง secure by default:

*   ห้ามเก็บไฟล์อัปโหลดใน `public/`
*   ห้ามเปิด path จริงของไฟล์ให้ browser เห็น
*   การอ่านไฟล์ต้องผ่าน authenticated file gateway เท่านั้น
*   Route Handler สำหรับไฟล์ต้องตรวจ session, role, application ownership/status และสิทธิ์เสมอ
*   ตั้ง header สำหรับเอกสารส่วนบุคคล เช่น `Cache-Control: private, no-store`
*   ห้าม log เลขบัตรประชาชน เบอร์โทร path ไฟล์จริง หรือข้อมูลส่วนตัวเต็มรูปแบบ
*   ห้าม commit `.env`, `.env.local`, `.env.docker`, private key, password หรือข้อมูลจริงของผู้สมัคร
*   Error message ที่ส่งให้ผู้ใช้ต้องไม่เปิดเผย stack trace, SQL, file path หรือ internal id ที่ไม่จำเป็น

Runtime database user ต้องใช้ least privilege:

*   ใช้ user แยกสำหรับ migration และ runtime
*   Runtime user ไม่ควรมีสิทธิ์แก้ schema
*   หลีกเลี่ยง `DELETE` กับข้อมูลใบสมัคร ใช้ status transition หรือ soft delete ตามที่เอกสาร security กำหนด

---

## 8. Database & Drizzle

*   Schema ต้องอยู่ใน Drizzle schema files และเปลี่ยนผ่าน migration เท่านั้น
*   ห้ามแก้ production schema ด้วย SQL ad hoc โดยไม่บันทึก migration
*   ใช้ transaction สำหรับ operation ที่ต้องเปลี่ยนหลายตาราง เช่น submit application, approve/reject, run ranking, import scores
*   ตั้ง unique constraint สำหรับข้อมูลที่ห้ามซ้ำ เช่น ลำดับรายชื่อใน imported exam scores และ active application mapping
*   เก็บ timestamp สำคัญ เช่น `createdAt`, `updatedAt`, `submittedAt`, `reviewedAt`, `frozenAt`, `rankedAt`, `exportedAt`
*   ควรใช้ index กับ field ที่ query บ่อย เช่น status, applicant id, ranking order, announcement order

Query rules:

*   ห้าม N+1 query ในหน้า admin list/review
*   Pagination ต้องใช้กับ list ที่อาจยาว
*   หน้า admin review ต้อง load เฉพาะข้อมูลที่จำเป็นก่อน แล้ว lazy load ไฟล์/preview

---

## 9. State & Workflow Rules

Application status ต้องเปลี่ยนผ่าน service กลางเท่านั้น ห้าม component หรือ route เขียน status เองแบบกระจัดกระจาย

Flow หลัก:

```text
draft -> submitted -> approved
draft -> submitted -> rejected -> draft/submitted
approved -> frozen
frozen -> ranked -> exported
```

หลังปิดรับสมัคร:

*   Close application window ต้องปิดการ submit ใหม่และปิด edit จากฝั่งผู้สมัคร
*   Lock edit ต้องป้องกันการแก้ข้อมูลที่มีผลต่อ ranking
*   Run ranking ต้องเป็นปุ่ม manual ของเจ้าหน้าที่
*   Export Excel ต้องเป็นปุ่ม manual ของเจ้าหน้าที่

ห้ามทำ ranking/export อัตโนมัติเมื่อปิดรับสมัคร เพราะเจ้าหน้าที่ต้องควบคุมจังหวะด้วยตัวเอง

---

## 10. API, Server Actions & Route Handlers

*   ทุก endpoint ต้อง validate input และตรวจสิทธิ์
*   Mutating action ต้องเป็น server-side เท่านั้น
*   ห้ามให้ client ส่งค่าที่ระบบควรคำนวณเอง เช่น final subject average, ranking score, approval result
*   Server Action ต้อง return result ที่คาดเดาได้ เช่น `{ ok: true, data }` หรือ `{ ok: false, error }`
*   Route Handler สำหรับ upload/download ต้องจำกัด file type, file size และตรวจ MIME type
*   ใช้ id ภายในอย่างระมัดระวัง หากไม่จำเป็นไม่ควร expose sequential id สู่ public UI

---

## 11. Frontend & UI Standards

ระบบนี้เป็น admission/admin workflow ไม่ใช่ landing page:

*   UI ต้องเน้นกรอกง่าย ตรวจง่าย และลดความผิดพลาด
*   ใช้ Shadcn UI สำหรับ component พื้นฐาน เช่น button, dialog, table, input, alert
*   ใช้ CSS Modules สำหรับ layout เฉพาะ เช่น grade entry, side-by-side document review, dense admin screen
*   ใช้ lucide icons ในปุ่มที่เป็น action ชัดเจน
*   ปุ่ม destructive หรือ irreversible ต้องมี confirmation
*   หน้าผู้สมัครต้องแสดง validation สีแดง/เขียวแบบเข้าใจง่าย แต่ต้องไม่แทน server validation
*   หน้ากรอกเกรดต้องเน้นคำเตือนรหัสวิชาพื้นฐานตัวเลขหลักที่ 3 เป็น `1`
*   หน้า admin review ต้องเห็นข้อมูลที่กรอกและเอกสาร ปพ.1 หน้า/หลังใน workflow เดียวกัน
*   ข้อความ UI ต้องสั้น ชัด และเหมาะกับนักเรียน/เจ้าหน้าที่

Accessibility:

*   Form field ต้องมี label
*   Error ต้องผูกกับ field ที่ผิด
*   สีแดง/เขียวต้องมีข้อความหรือ icon ประกอบ ห้ามสื่อความหมายด้วยสีอย่างเดียว
*   Keyboard navigation ต้องใช้ได้ใน form และ dialog

---

## 12. File Upload & Document Preview

*   รองรับ PDF และรูปภาพตาม requirements
*   จำกัดขนาดไฟล์ตั้งแต่ server
*   ตรวจ MIME type และ extension ทั้งคู่
*   Generate safe filename ฝั่ง server ห้ามใช้ชื่อไฟล์ user upload ตรง ๆ เป็น path
*   เก็บ metadata ใน database เช่น owner, document type, original name, stored path, mime, size, uploadedAt
*   Preview เอกสารต้องโหลดผ่าน gateway
*   ควรทำ thumbnail/preview สำหรับ admin review เมื่อจำเป็นต่อ performance

---

## 13. Excel Import & Export

Import:

*   อ่าน `.xlsx` ด้วย library ที่รองรับ OpenXML
*   ต้องมี preflight validation ก่อน commit
*   ตรวจ header, required columns, numeric score, duplicate announcement order, empty row ผิดปกติ
*   Matching ใช้ลำดับรายชื่อตามประกาศ พสวท. เท่านั้น
*   ต้องแสดง summary ให้เจ้าหน้าที่เห็นก่อนยืนยัน เช่น imported, skipped, invalid, duplicate
*   ใช้ transaction เมื่อ commit import

Export:

*   Export เฉพาะข้อมูลจากชุดที่ ranked แล้ว
*   ลำดับ column ต้องตรงกับ `introduction.md`
*   ใช้ค่าคะแนนและเกรดที่ปัดแล้ว
*   ห้าม export ใบสมัครที่ยังไม่ approved/frozen ตามเงื่อนไข workflow

---

## 14. Error Handling & Logging

*   แยก user-facing error กับ internal error
*   User-facing error ต้องบอกวิธีแก้ เช่น "กรุณาอัปโหลดไฟล์ .xlsx ที่ไม่มีรหัสผ่าน"
*   Internal log ต้องมี context พอ debug แต่ต้อง redact PII
*   ห้าม swallow error เงียบ ๆ
*   Operation สำคัญควร return structured error code เช่น `INVALID_COURSE_CODE`, `DUPLICATE_ANNOUNCEMENT_ORDER`, `APPLICATION_LOCKED`

---

## 15. Testing Requirements

ต้องเขียน test ตามระดับความเสี่ยง:

*   Unit tests สำหรับ pure business rules
*   Integration tests สำหรับ database service/import/export ถ้ามี test DB
*   E2E tests สำหรับ workflow สำคัญ

Minimum test coverage ตาม feature:

*   Grade calculation: unit tests
*   Course code validation: unit tests
*   Thai citizen id validation: unit tests
*   Application status transitions: unit tests หรือ integration tests
*   Excel import preflight: unit/integration tests
*   Ranking and tie-break: unit tests
*   File gateway authorization: integration tests
*   Applicant submit flow: E2E tests
*   Admin approve/reject flow: E2E tests
*   Manual close/lock/ranking/export flow: E2E tests

ก่อนสรุปว่างานเสร็จ ต้องรันอย่างน้อย:

```bash
npm run lint
npm run test
npm run build
```

ถ้าเป็นงาน UI หรือ workflow สำคัญ ต้องรัน Playwright หรือทดสอบผ่าน browser ด้วย

---

## 16. Performance Rules

*   หน้า applicant form ต้องโหลดเร็วและไม่ block จากข้อมูล admin ที่ไม่จำเป็น
*   หน้า admin list ต้อง paginate/filter/search ได้
*   เอกสารแนบต้อง lazy load เฉพาะเมื่อเปิดดู
*   หลีกเลี่ยง client bundle ใหญ่โดยไม่จำเป็น
*   Component ที่ต้องเป็น client component เท่านั้นจึงใส่ `"use client"`
*   Server component เป็น default สำหรับหน้าอ่านข้อมูล
*   ใช้ streaming/file response สำหรับไฟล์ใหญ่
*   หลีกเลี่ยงการอ่านไฟล์ทั้งก้อนไว้ใน memory หากสามารถ stream ได้

---

## 17. Naming & Style

*   ชื่อไฟล์และ folder ใช้ `kebab-case`
*   React component ใช้ `PascalCase`
*   Function/variable ใช้ `camelCase`
*   Constant ใช้ `SCREAMING_SNAKE_CASE` เมื่อเป็นค่าคงที่ global
*   Database table/column ใช้ `snake_case`
*   Test file ใช้ `.test.ts` หรือ `.spec.ts`
*   CSS Module ใช้ `ComponentName.module.css` หรือ feature-specific name ที่อ่านรู้เรื่อง

Code style:

*   ใช้ ESLint + Prettier เป็นตัวตัดสิน formatting
*   ห้ามจัด format ด้วยมือถ้าขัดกับ tool
*   Comment เฉพาะจุดที่ logic ไม่ obvious
*   ห้ามทิ้ง commented-out code
*   ห้ามทิ้ง `console.log` ใน production path

---

## 18. Environment & Configuration

*   Environment variables ต้อง validate ตอน start ด้วย Zod
*   แยก `.env.local`, `.env.docker`, production env ชัดเจน
*   ห้าม commit env file จริง
*   ค่า default ที่ปลอดภัยต้องเป็นค่าที่ fail closed เช่น file gateway ปฏิเสธเมื่อ session ไม่ชัดเจน
*   Production ต้องใช้ HTTPS ผ่าน reverse proxy

---

## 19. Dependency Rules

*   เพิ่ม dependency เฉพาะเมื่อจำเป็นจริง
*   เลือก library ที่ maintenance ดีและเหมาะกับ Next.js/TypeScript
*   ห้ามเพิ่ม dependency เพื่อแก้ปัญหาเล็กที่ทำเองได้ปลอดภัยกว่า
*   Domain logic สำคัญ เช่น ranking, rounding, status transition ต้องเป็นโค้ดของโปรเจกต์และมี test ไม่ผูกกับ library แปลก ๆ

---

## 20. Review Checklist ก่อนจบงาน

ก่อนส่งงานหรือบอกว่างานเสร็จ ให้ตรวจ checklist นี้:

1.  Business rule ตรงกับ `.context/introduction.md`
2.  ไม่มีข้อมูลส่วนบุคคลใน log, URL, public path หรือ commit
3.  Input ทุกทาง validate ด้วย Zod
4.  Mutating operation ตรวจ role/session แล้ว
5.  Database operation สำคัญอยู่ใน transaction
6.  ไม่มี `any` โดยไม่จำเป็น
7.  ไม่มี business logic สำคัญฝังใน component อย่างเดียว
8.  มี tests สำหรับ logic ที่แตะ
9.  `npm run lint`, `npm run test`, `npm run build` ผ่าน หรือรายงานชัดเจนว่าทำไมรันไม่ได้
10.  เอกสาร context ถูกอัปเดตหาก behavior หรือ architecture เปลี่ยน

---

## 21. Non-Negotiable Rules

*   ห้ามเก็บไฟล์ผู้สมัครใน `public/`
*   ห้ามใช้ ranking จากค่าที่ยังไม่ปัด
*   ห้าม matching คะแนนสอบด้วยข้อมูลอื่นแทนลำดับรายชื่อ
*   ห้ามทำ ranking/export อัตโนมัติหลังปิดรับสมัคร
*   ห้ามให้ browser เป็นแหล่งความจริงของเกรดหรือสถานะใบสมัคร
*   ห้ามใช้ runtime database user เป็น superuser
*   ห้าม commit secret หรือข้อมูลผู้สมัครจริง
*   ห้ามแก้ business rule โดยไม่แก้ `.context/` ให้ตรงกัน

---

## 22. Admin Dashboard & Login Session Security (โครงสร้างแดชบอร์ดและความปลอดภัยของเจ้าหน้าที่)

การพัฒนาระบบหลังบ้านสำหรับเจ้าหน้าที่ (Admin) ในการตรวจสอบข้อมูลและสิทธิ์ ต้องปฏิบัติตามมาตรฐานการควบคุมความปลอดภัยขั้นสูง (Secure by Design) ดังนี้:

### 🛡️ มาตรฐานความปลอดภัยเซสชันของเจ้าหน้าที่ (Admin Authentication & Session Security)
*   **ระบบตรวจสอบสิทธิ์แยกเฉพาะ (Isolated Admin Session):** เซสชันของเจ้าหน้าที่ต้องแยกเด็ดขาดจากระบบเซสชันผู้สมัคร โดยต้องมีหน้าล็อกอินเข้าสู่ระบบ `/admin/login` และการรับรองสิทธิ์ของเจ้าหน้าที่เท่านั้น
*   **มาตรการ Cookie ปลอดภัยสูงสุด:** การจัดเก็บ Session Token หรือ JWT ของเจ้าหน้าที่ต้องเก็บในรูป HTTP-Only, Secure, SameSite="Strict" และผูกสิทธิ์เข้าถึงเฉพาะ Path `/admin` เพื่อป้องกันช่องโหว่ XSS และ CSRF
*   **การควบคุมการเข้าถึงตามบทบาท (Role-Based Access Control - RBAC):**
    *   ทุกหน้า (Layout, Page), API Endpoints และ Server Actions ในโฟลเดอร์ `/admin` ต้องถูกตรวจจับและป้องกันผ่าน middleware หรือ function ตรวจสอบสิทธิ์ตั้งแต่ระดับแรกสุด (Fail-Closed)
    *   หากตรวจพบเซสชันที่ไม่มีสิทธิ์ Admin ให้ทำการถอนการเชื่อมต่อ (Log out/Clear session) และผลักผู้ใช้ไปยังหน้าล็อกอินโดยทันที
*   **ระบบป้องกัน Brute Force & Session Expiration:**
    *   กำหนดจำกัดจำนวนครั้งในการทดลองกรอกรหัสผ่านผิดพลาด (Rate Limiting) ในหน้าล็อกอินเจ้าหน้าที่
    *   จำกัดเวลาการคงอยู่ของเซสชันเจ้าหน้าที่ (Session Inactivity Timeout) เช่น ให้เซสชันหมดอายุโดยอัตโนมัติหากไม่มีการโต้ตอบภายใน 1 ชั่วโมง หรือกำหนด Maximum Session Age ไม่เกิน 4 ชั่วโมง เพื่อสอดคล้องตามมาตรฐาน PDPA
*   **Security Headers & Cache Control:**
    *   ทุกหน้าของระบบหลังบ้านต้องตั้งค่า HTTP Headers ห้ามการเก็บ Cache ในคอมพิวเตอร์สาธารณะ (`Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate`)

### 🎛️ มาตรฐานโครงสร้างและการออกแบบแดชบอร์ด (Admin Dashboard & Main Layout)
*   **สถาปัตยกรรม UI แบบ Dense & Functional:**
    *   การจัดวางเลย์เอาท์หลักต้องใช้ Sidebar นำทางที่ตอบสนองรวดเร็ว ด้านหน้าแสดงตารางและแท็บสถิติแยกตามกลุ่มสถานะใบสมัคร
    *   ตารางผู้สมัครหลักต้องรอบรับระบบ Pagination แบบฝั่ง Server และรองรับการสืบค้นข้อมูล (Search & Filter) อย่างยืดหยุ่น โดยไม่เกิดปัญหา N+1 Query
*   **โครงสร้างจอตรวจสอบแบบคู่ขนาน (Side-by-Side Review Layout):**
    *   สำหรับฟังก์ชันการตรวจเช็คเอกสาร ปพ.1 ต้องออกแบบหน้าจอแบ่งครึ่งฝั่งซ้าย-ขวา (Split Panel)
    *   **ฝั่งซ้าย:** ตารางสรุปข้อมูลประวัติและเกรดคำนวณสะสมของผู้สมัครที่เชื่อมโยงกับฐานข้อมูล พร้อมปุ่มเครื่องมือแก้ไขคะแนนตรง
    *   **ฝั่งขวา:** พื้นที่สำหรับโหลดภาพเอกสารแนบ ปพ.1 ทั้งสองด้าน (ปพ.1 ด้านหน้า และ ปพ.1 ด้านหลัง) มาจัดวางแสดงผล **"เคียงข้างกัน"** หรือ **"ด้านบน-ล่างคู่กัน"** ในหน้าเดียว เพื่อให้เจ้าหน้าที่เปรียบเทียบตารางเกรดตัวเลขได้ทันทีโดยไม่ต้องคลิกเปิดหลายแท็บหรือสลับหน้าจอไปมา
*   **การจัดการสิทธิ์การดึงข้อมูลส่วนตัว (Authenticated PDF/Image Retrieval):**
    *   สิทธิ์ในการดึงภาพแนบ ปพ.1 ผ่าน Route Handler ในหน้าจอผู้ดูแลระบบ ต้องมีการผูกสิทธิ์ตรวจสอบเซสชันผู้ดูแลระบบ (Admin role) เพื่ออนุญาตให้เปิดดึงข้อมูลภาพจากไดเรกทอรี VPS นอกสาธารณะมาแสดงผลได้โดยไม่ละเมิดข้อจำกัดด้านความเป็นส่วนตัว
*   **การบันทึกประวัติการเข้าใช้งานและแก้ไข (Audit Logs):**
    *   ทุกการกระทำที่เป็นการแก้ไขข้อมูลส่วนบุคคลของผู้สมัคร หรือการเปลี่ยนสถานะใบสมัคร (Approve, Reject, Run Ranking) ต้องมีการบันทึกประวัติความปลอดภัย (Audit Logs) ลงฐานข้อมูลอย่างถาวร (บันทึก Admin ID, การแก้ไข, วันที่เวลา และ IP Address) เพื่อการตรวจสอบย้อนหลังได้โปร่งใส

