"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SCHOOL_LIST } from "@/features/applicant/schools";
import { useApplyForm } from "../../apply-form-context";
import { formStyles } from "../../form-ui";
import { cn } from "@/lib/utils";

export function StepEducation() {
  const {
    school,
    setSchool,
    gpaxInput,
    setGpaxInput,
    markTouched,
    FieldError,
    fieldBorder,
    schoolSuggestions,
    uniqueProvinces,
  } = useApplyForm();

  return (
    <div className={formStyles.stepSection}>
      <h2 className={formStyles.stepTitle}>ข้อมูลโรงเรียนเดิมและผลการเรียนสะสม</h2>
      <div className={formStyles.fieldGrid}>
        <div>
          <Label className={formStyles.fieldLabel}>โรงเรียนเดิมที่กำลังศึกษา (ม.3)</Label>
          <Input
            type="text"
            placeholder="กรอกชื่อโรงเรียนเดิม"
            list="school-suggestions"
            value={school.schoolName}
            onChange={(e) => {
              const val = e.target.value;
              setSchool((prev) => {
                const nextSchool = { ...prev, schoolName: val };
                const matchedSchool = SCHOOL_LIST.find((s) => s.name === val);
                if (matchedSchool) {
                  nextSchool.schoolProvince = matchedSchool.province;
                }
                return nextSchool;
              });
            }}
            onBlur={() => markTouched("schoolName")}
            className={cn(formStyles.fieldInput, "h-auto py-3", fieldBorder("schoolName"))}
          />
          <datalist id="school-suggestions">
            {schoolSuggestions.map((sch) => (
              <option key={sch.name} value={sch.name} />
            ))}
          </datalist>
          <FieldError name="schoolName" />
        </div>

        <div>
          <Label className={formStyles.fieldLabel}>จังหวัดของโรงเรียนเดิม</Label>
          <Input
            type="text"
            placeholder="กรอกจังหวัดของโรงเรียน"
            list="province-suggestions"
            value={school.schoolProvince}
            onChange={(e) =>
              setSchool((prev) => ({ ...prev, schoolProvince: e.target.value }))
            }
            onBlur={() => markTouched("schoolProvince")}
            className={cn(formStyles.fieldInput, "h-auto py-3", fieldBorder("schoolProvince"))}
          />
          <datalist id="province-suggestions">
            {uniqueProvinces.map((prov) => (
              <option key={prov} value={prov} />
            ))}
          </datalist>
          <FieldError name="schoolProvince" />
        </div>
      </div>

      <div className={formStyles.sectionDivider} />

      <div>
        <Label className={formStyles.fieldLabel}>เกรดเฉลี่ยสะสมรวม 5 เทอมตาม ปพ.1 (GPAX)</Label>
        <Input
          type="number"
          step="0.01"
          min="0.00"
          max="4.00"
          placeholder="กรอกเกรดสะสมรวม เช่น 3.85"
          value={gpaxInput}
          onChange={(e) => setGpaxInput(e.target.value)}
          onBlur={() => markTouched("gpax")}
          className={cn(
            formStyles.fieldInput,
            "h-auto py-3.5 w-2/3 sm:w-1/3 font-mono text-lg text-center",
            fieldBorder("gpax")
          )}
        />
        <FieldError name="gpax" />
        <span className={formStyles.fieldHint}>
          * เกรดนี้อ้างอิงจากตัวเลขระบุบนใบ ปพ.1 ด้านหลัง สำหรับตรวจคุณสมบัติขั้นต่ำ (ต้องไม่ต่ำกว่า 3.00)
        </span>
      </div>
    </div>
  );
}
