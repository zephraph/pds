import { Tagged } from "type-fest";
import { ulid as ulidx } from "ulidx";

// MARK: Helpers

function stringToBytes(str: string): Uint8Array {
  const hex = str.replace(/-/g, "");
  if (hex.length > 32) {
    throw new Error("String too long for UUID conversion");
  }
  const bytes = new Uint8Array(16);

  for (let i = 0; i < 16; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }

  return bytes;
}

function bytesToString(bytes: Uint8Array): string {
  if (bytes.length !== 16) {
    throw new Error("Invalid blob length for UUID conversion");
  }

  // Convert bytes to hex string
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hex;
}

// MARK: UUID

export type UUIDString = `${string}-${string}-${string}-${string}-${string}`;
export type UUID = Tagged<Uint8Array, "UUIDBytes">;

export const uuid = (): UUID => {
  const uuid = crypto.randomUUID();
  return stringToBytes(uuid) as UUID;
};

/**
 * Convert a Uint8Array UUID to a UUID string
 */
export function uuidToString(uuid: UUID): UUIDString {
  const hex = bytesToString(uuid);

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join("-") as UUIDString;
}

// MARK: ULID

export type ULIDString = Tagged<string, "ULIDString">;
export type ULID = Tagged<Uint8Array, "ULIDBytes">;

export const ulid = (): ULID => {
  const ulid = ulidx();
  return stringToBytes(ulid) as ULID;
};

export function ulidToString(ulid: ULID): ULIDString {
  return bytesToString(ulid) as ULIDString;
}
