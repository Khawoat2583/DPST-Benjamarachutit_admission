export const NEWS_TYPES = ["กิจกรรม", "การศึกษาต่อ", "ผลงานนักเรียน", "รับนักเรียน", "อื่น ๆ"] as const;
export type NewsType = (typeof NEWS_TYPES)[number];
