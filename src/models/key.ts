import { and, eq, desc } from "drizzle-orm";
import { db } from "../db";
import { keysTable } from "../db/schema";
import { UUID } from "../id";

const keyCache: Map<string, UUID> & Map<UUID, string> = new Map();
export const getKey = async (keyId: UUID): Promise<string | undefined> => {
  if (keyCache.has(keyId)) {
    return keyCache.get(keyId)!;
  }
  const key = (
    await db
      .select({ name: keysTable.name })
      .from(keysTable)
      .where(and(eq(keysTable.id, keyId), eq(keysTable.retracted, false)))
      .orderBy(desc(keysTable.version))
      .limit(1)
  )[0];
  if (!key) {
    return undefined;
  }
  keyCache.set(keyId, key.name);
  return key.name;
};
export const getKeyId = async (keyName: string): Promise<UUID> => {
  if (keyCache.has(keyName)) {
    return keyCache.get(keyName)!;
  }
  let key = (
    await db
      .select({ id: keysTable.id })
      .from(keysTable)
      .where(and(eq(keysTable.name, keyName), eq(keysTable.retracted, false)))
      .orderBy(desc(keysTable.version))
      .limit(1)
  )[0];
  if (!key) {
    key = (
      await db
        .insert(keysTable)
        .values({
          name: keyName,
        })
        .returning({ id: keysTable.id })
    )[0];
  }
  keyCache.set(keyName, key.id);
  return key.id;
};
