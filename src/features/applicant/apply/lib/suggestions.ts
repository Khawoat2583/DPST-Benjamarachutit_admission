import type { AddressDbRow } from "../types";

export type SchoolSuggestion = {
  name: string;
  province: string;
};

export function getSchoolSuggestions(
  schools: SchoolSuggestion[],
  schoolNameQuery: string,
  max = 10
): SchoolSuggestion[] {
  const query = (schoolNameQuery || "").trim().toLowerCase();
  if (!query) {
    return schools.slice(0, max);
  }

  const matches = schools.filter((school) => school.name.toLowerCase().includes(query));

  matches.sort((a, b) => {
    const aLower = a.name.toLowerCase();
    const bLower = b.name.toLowerCase();
    const aIndex = aLower.indexOf(query);
    const bIndex = bLower.indexOf(query);

    if (aIndex === 0 && bIndex !== 0) return -1;
    if (bIndex === 0 && aIndex !== 0) return 1;

    if (a.name.length !== b.name.length) {
      return a.name.length - b.name.length;
    }

    return aIndex - bIndex;
  });

  return matches.slice(0, max);
}

export function getUniqueSchoolProvinces(schools: SchoolSuggestion[]): string[] {
  return Array.from(new Set(schools.map((school) => school.province))).sort((a, b) =>
    a.localeCompare(b, "th")
  );
}

export function getSubdistrictSuggestions(
  addressDb: AddressDbRow[],
  query: string,
  max = 10
): AddressDbRow[] {
  const normalizedQuery = (query || "").trim();
  if (!normalizedQuery || addressDb.length === 0) return [];

  return addressDb.filter((row) => row[0].includes(normalizedQuery)).slice(0, max);
}

export function getDistrictSuggestions(
  addressDb: AddressDbRow[],
  query: string,
  max = 10
): AddressDbRow[] {
  const normalizedQuery = (query || "").trim();
  if (!normalizedQuery || addressDb.length === 0) return [];

  const matches = addressDb.filter((row) => row[1].includes(normalizedQuery));
  const seen = new Set<string>();
  const uniqueMatches: AddressDbRow[] = [];

  for (const row of matches) {
    const key = `${row[1]}-${row[2]}-${row[3]}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueMatches.push(row);
    }

    if (uniqueMatches.length >= max) break;
  }

  return uniqueMatches;
}

export function getZipcodeSuggestions(
  addressDb: AddressDbRow[],
  query: string,
  max = 10
): AddressDbRow[] {
  const normalizedQuery = (query || "").trim();
  if (!normalizedQuery || addressDb.length === 0) return [];

  const matches = addressDb.filter((row) => row[3].startsWith(normalizedQuery));
  const seen = new Set<string>();
  const uniqueMatches: AddressDbRow[] = [];

  for (const row of matches) {
    const key = `${row[0]}-${row[1]}-${row[2]}-${row[3]}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueMatches.push(row);
    }

    if (uniqueMatches.length >= max) break;
  }

  return uniqueMatches;
}

export function getUniqueContactProvinces(addressDb: AddressDbRow[]): string[] {
  if (addressDb.length === 0) return [];

  return Array.from(new Set(addressDb.map((row) => row[2]))).sort((a, b) =>
    a.localeCompare(b, "th")
  );
}
