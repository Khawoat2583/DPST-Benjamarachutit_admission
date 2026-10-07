/** Client-side Thai national ID checksum validation */
export function isValidNationalId(id: string): boolean {
  if (!/^\d{13}$/.test(id)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(id.charAt(i), 10) * (13 - i);
  }
  const checksum = (11 - (sum % 11)) % 10;
  return checksum === parseInt(id.charAt(12), 10);
}
