import { describe, expect, it } from "vitest";
import type { AddressDbRow } from "../types";
import {
  getDistrictSuggestions,
  getSchoolSuggestions,
  getSubdistrictSuggestions,
  getUniqueContactProvinces,
  getUniqueSchoolProvinces,
  getZipcodeSuggestions,
} from "./suggestions";

const schools = [
  { name: "โรงเรียนเบญจมราชูทิศ", province: "ยะลา" },
  { name: "โรงเรียนเบญจมราชูทิศ ปัตตานี", province: "ปัตตานี" },
  { name: "โรงเรียนวิทยาศาสตร์", province: "กรุงเทพมหานคร" },
];

const addressDb: AddressDbRow[] = [
  ["สะเตง", "เมืองยะลา", "ยะลา", "95000"],
  ["สะเตงนอก", "เมืองยะลา", "ยะลา", "95000"],
  ["ควนลัง", "หาดใหญ่", "สงขลา", "90110"],
  ["สะเตง", "เมืองยะลา", "ยะลา", "95000"],
];

describe("apply suggestions", () => {
  it("returns school suggestions sorted by best match", () => {
    const matches = getSchoolSuggestions(schools, "เบญจ");
    expect(matches.map((s) => s.name)).toEqual([
      "โรงเรียนเบญจมราชูทิศ",
      "โรงเรียนเบญจมราชูทิศ ปัตตานี",
    ]);
  });

  it("returns school provinces sorted and unique", () => {
    expect(getUniqueSchoolProvinces(schools)).toEqual([
      "กรุงเทพมหานคร",
      "ปัตตานี",
      "ยะลา",
    ]);
  });

  it("returns address suggestions with uniqueness rules", () => {
    expect(getSubdistrictSuggestions(addressDb, "สะเต")).toHaveLength(3);

    const districts = getDistrictSuggestions(addressDb, "เมือง");
    expect(districts).toHaveLength(1);
    expect(districts[0]).toEqual(["สะเตง", "เมืองยะลา", "ยะลา", "95000"]);

    const zipcodes = getZipcodeSuggestions(addressDb, "95");
    expect(zipcodes).toHaveLength(2);
    expect(zipcodes[0][3]).toBe("95000");

    expect(getUniqueContactProvinces(addressDb)).toEqual(["ยะลา", "สงขลา"]);
  });
});
