/**
 * Philippine National QR Standard (QRPH / EMVCo Merchant-Presented Mode)
 * Dynamic Amount QR Code Generator & Parser
 */

export interface TLV {
  tag: string;
  length: number;
  value: string;
}

/**
 * Calculates the standard EMVCo CRC-16/CCITT-FALSE checksum
 * Polynomial: 0x1021, Initial: 0xFFFF
 */
export function calculateCRC16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * Parses raw EMVCo MPM payload string into TLV (Tag-Length-Value) tokens
 */
export function parseEMVCo(payload: string): TLV[] {
  const result: TLV[] = [];
  let index = 0;

  while (index < payload.length) {
    if (index + 4 > payload.length) break;
    const tag = payload.slice(index, index + 2);
    const length = parseInt(payload.slice(index + 2, index + 4), 10);
    if (isNaN(length) || length < 0) break;
    const value = payload.slice(index + 4, index + 4 + length);
    result.push({ tag, length, value });
    index += 4 + length;
  }

  return result;
}

/**
 * Validates if a string looks like a standard EMVCo / QRPH payload
 */
export function isValidEMVCo(payload: string): boolean {
  if (!payload || payload.length < 20) return false;
  // EMVCo payloads must start with Tag 00 (Payload Format Indicator "01")
  return payload.startsWith("000201");
}

/**
 * Default QRPH Template decoded from Gcash_Owner.jpg
 * - Initiator: Static (010211)
 * - Provider: GXCHPHM2XXX (GCash / InstaPay)
 * - Currency: 608 (PHP)
 * - Country: PH
 * - Account Name: CL**T CE***C A.
 * - Location: Pigdaulan
 */
export const DEFAULT_QRPH_TEMPLATE =
  "00020101021127830012com.p2pqrpay0111GXCHPHM2XXX02089996440303152170200000006560417DWQM4TK3JDO8VAL6G5204601653036085802PH5915CL**T CE***C A.6009Pigdaulan610412346304331C";

export const QRPH_STORAGE_KEY = "blaise_cafe_merchant_qrph_template_v3";

/**
 * Extracts the merchant/account holder name (Tag 59) from the payload
 */
export function extractMerchantName(payload: string): string {
  try {
    const tlvs = parseEMVCo(payload);
    const tag59 = tlvs.find((t) => t.tag === "59");
    return tag59?.value || "Blaise Café";
  } catch {
    return "Blaise Café";
  }
}

/**
 * Generates a dynamic QRPH string with an exact amount injected
 *
 * @param basePayload The owner's base static QRPH payload from their standee
 * @param amount Exact peso total (e.g. 277.00)
 * @returns Fully formed EMVCo dynamic QRPH string with updated CRC-16 checksum
 */
export function generateDynamicQRPH(basePayload: string, amount: number): string {
  const cleanBase = (basePayload || "").trim();
  const rawBase = isValidEMVCo(cleanBase) ? cleanBase : DEFAULT_QRPH_TEMPLATE;

  const tlvs = parseEMVCo(rawBase);
  // Exclude existing Tag 63 (CRC)
  const filtered = tlvs.filter((t) => t.tag !== "63");

  // 1. Change Point of Initiation Method to "12" (Dynamic QR)
  const tag01 = filtered.find((t) => t.tag === "01");
  if (tag01) {
    tag01.value = "12";
    tag01.length = 2;
  } else {
    filtered.splice(1, 0, { tag: "01", length: 2, value: "12" });
  }

  // 2. Format amount to 2 decimal places (standard EMVCo requirement)
  const amountStr = amount.toFixed(2);
  const tag54 = filtered.find((t) => t.tag === "54");
  if (tag54) {
    tag54.value = amountStr;
    tag54.length = amountStr.length;
  } else {
    // Insert Tag 54 right after Tag 53 (Currency) or before Tag 58 (Country)
    const tag53Index = filtered.findIndex((t) => t.tag === "53");
    const insertIdx = tag53Index >= 0 ? tag53Index + 1 : filtered.length;
    filtered.splice(insertIdx, 0, {
      tag: "54",
      length: amountStr.length,
      value: amountStr,
    });
  }

  // 3. Assemble the raw payload string
  let output = "";
  for (const t of filtered) {
    const lenStr = t.length.toString().padStart(2, "0");
    output += `${t.tag}${lenStr}${t.value}`;
  }

  // 4. Append Tag 63 with length 04
  output += "6304";

  // 5. Calculate and append 4-character CRC-16 checksum
  const crc = calculateCRC16(output);
  return output + crc;
}
