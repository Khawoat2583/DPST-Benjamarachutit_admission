export function isCoreSubjectCode(courseCode: string): boolean {
  const code = (courseCode || "").trim();
  if (code.length !== 6) return false;
  
  const firstChar = code.charAt(0);
  if (!["ค", "ว", "อ"].includes(firstChar)) return false;
  
  const digits = Array.from(code).filter((char) => /[0-9]/.test(char));
  // Standard format has 5 digits (e.g. ค21101). The 3rd digit is digits[2].
  return digits[2] === "1";
}

export function getCourseCodeValidationError(courseCode: string): string | null {
  const code = (courseCode || "").trim();
  if (code.length === 0) return "กรุณากรอกรหัสวิชา";
  if (code.length !== 6) return "รหัสวิชาต้องมีความยาว 6 ตัวอักษร";
  
  const firstChar = code.charAt(0);
  if (!["ค", "ว", "อ"].includes(firstChar)) {
    return "ตัวแรกต้องเป็น ค, ว หรือ อ เท่านั้น";
  }
  
  const digits = Array.from(code).filter((char) => /[0-9]/.test(char));
  if (digits.length < 3) {
    return "รูปแบบรหัสวิชาไม่ถูกต้อง";
  }
  
  if (digits[2] !== "1") {
    return "ตัวเลขตัวที่ 3 ต้องเป็นเลข 1 เท่านั้น (เฉพาะรายวิชาพื้นฐาน)";
  }
  
  return null;
}
