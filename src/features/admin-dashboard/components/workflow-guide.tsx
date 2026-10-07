import React from "react";
import { Compass } from "lucide-react";

const STEPS = [
  'ตรวจสอบใบสมัครที่มีสถานะ "ส่งใบสมัครแล้ว" โดยการอนุมัติหรือตีกลับแก้ไขในระบบ Review Canvas',
  "นำเข้าผลคะแนนสอบรอบแรกผ่านไฟล์ Excel (จากข้อสอบกลาง พสวท.) ในเมนูนำเข้าคะแนนสอบ",
  "ดำเนินการปิดระบบรับสมัคร (Manual Closing) และทำการฟรีซชุดข้อมูลใบสมัครที่ผ่านเกณฑ์",
  "ประมวลผลจัดเรียงอันดับ Ranking ตามเกณฑ์และทำการดึงตารางสรุปคอลัมน์ A ถึง N",
];

export function WorkflowGuide() {
  return (
    <div className="bg-[#08315f] border-t-4 border-t-yellow-400 p-6 text-white flex flex-col justify-between shadow-lg shadow-slate-950/20">
      <div className="space-y-4">
        <div className="p-2.5 bg-white/10 w-fit">
          <Compass className="h-5 w-5 text-yellow-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">ขั้นตอนการดำเนินงาน พสวท.</h2>
          <p className="text-xs text-blue-200 mt-1">สรุปขั้นตอนที่เจ้าหน้าที่ต้องทำตามหลักกติกาทีละเฟส</p>
        </div>
        <ul className="space-y-3 text-xs pl-0.5 text-slate-300">
          {STEPS.map((text, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="font-extrabold text-yellow-400 shrink-0">{idx + 1}.</span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
