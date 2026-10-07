"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useApplyForm } from "../../apply-form-context";
import { formStyles } from "../../form-ui";
import { cn } from "@/lib/utils";

export function StepPersonal() {
  const { personal, setPersonal, markTouched, FieldError, fieldBorder } = useApplyForm();

  return (
    <div className={formStyles.stepSection}>
      <h2 className={formStyles.stepTitle}>ข้อมูลส่วนบุคคลของผู้สมัคร</h2>
      <div className={formStyles.fieldGrid}>
        <div>
          <Label className={formStyles.fieldLabel}>คำนำหน้านาม</Label>
          <select
            value={personal.title}
            onChange={(e) => setPersonal((prev) => ({ ...prev, title: e.target.value }))}
            onBlur={() => markTouched("title")}
            className={cn(formStyles.fieldInput, fieldBorder("title"))}
          >
            <option value="">เลือกคำนำหน้า</option>
            <option value="เด็กชาย">เด็กชาย</option>
            <option value="เด็กหญิง">เด็กหญิง</option>
            <option value="นาย">นาย</option>
            <option value="นางสาว">นางสาว</option>
          </select>
          <FieldError name="title" />
        </div>

        <div>
          <Label className={formStyles.fieldLabel}>ลำดับรายชื่อตามประกาศ พสวท. รอบแรก</Label>
          <Input
            type="number"
            min={1}
            placeholder="ระบุลำดับรายชื่อที่ได้ประกาศ"
            value={personal.announcementOrder}
            onChange={(e) =>
              setPersonal((prev) => ({ ...prev, announcementOrder: e.target.value }))
            }
            onBlur={() => markTouched("announcementOrder")}
            className={cn(formStyles.fieldInput, "h-auto py-3", fieldBorder("announcementOrder"))}
          />
          <FieldError name="announcementOrder" />
        </div>

        <div>
          <Label className={formStyles.fieldLabel}>ชื่อจริง (ภาษาไทย)</Label>
          <Input
            type="text"
            placeholder="กรอกชื่อจริง"
            value={personal.firstName}
            onChange={(e) => setPersonal((prev) => ({ ...prev, firstName: e.target.value }))}
            onBlur={() => markTouched("firstName")}
            className={cn(formStyles.fieldInput, "h-auto py-3", fieldBorder("firstName"))}
          />
          <FieldError name="firstName" />
        </div>

        <div>
          <Label className={formStyles.fieldLabel}>นามสกุล (ภาษาไทย)</Label>
          <Input
            type="text"
            placeholder="กรอกนามสกุล"
            value={personal.lastName}
            onChange={(e) => setPersonal((prev) => ({ ...prev, lastName: e.target.value }))}
            onBlur={() => markTouched("lastName")}
            className={cn(formStyles.fieldInput, "h-auto py-3", fieldBorder("lastName"))}
          />
          <FieldError name="lastName" />
        </div>
      </div>
    </div>
  );
}
