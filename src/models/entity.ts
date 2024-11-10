import "dotenv/config";
import type { Merge, Except } from "type-fest";
import { eq, and, desc } from "drizzle-orm";
import { entitiesTable } from "../db/schema";
import { uuid, UUID } from "../id";
import { db } from "../db";
import { getKey, getKeyId } from "./key";

type SimpleMerge<Destination, Source> = {
  [Key in keyof Destination as Key extends keyof Source
    ? never
    : Key]: Destination[Key];
} & Source;

type Attributes = Record<string, unknown>;
export class Entity<A extends Attributes> {
  public readonly id: UUID;
  constructor(id?: UUID) {
    this.id = id ?? uuid();
  }

  async getAll(): Promise<A> {
    const rows = await db
      .select({ key: entitiesTable.key, value: entitiesTable.value })
      .from(entitiesTable)
      .where(
        and(eq(entitiesTable.id, this.id), eq(entitiesTable.retracted, false))
      )
      .then((rows) =>
        Promise.all(
          rows.map(async (row) => {
            const key = await getKey(row.key);
            if (!key) return null;
            return { key, value: row.value };
          })
        )
      );

    return rows.reduce((acc, row) => {
      if (!row) return acc;
      acc[row.key as keyof A] = row.value as A[keyof A];
      return acc;
    }, {} as A);
  }

  async get<K extends keyof A>(key: K): Promise<A[K]> {
    const keyId = await getKeyId(key as string);
    return await db
      .select({ value: entitiesTable.value })
      .from(entitiesTable)
      .where(
        and(
          eq(entitiesTable.id, this.id),
          eq(entitiesTable.key, keyId),
          eq(entitiesTable.retracted, false)
        )
      )
      .orderBy(desc(entitiesTable.version))
      .limit(1)
      .then(([entity]) => entity.value as A[K]);
  }

  async set<K extends string, V extends null | undefined>(
    key: K,
    value: V
  ): Promise<Entity<Except<A, K>>>;
  async set<K extends keyof A, V extends unknown>(
    key: K,
    value: V
  ): Promise<Entity<Merge<A, { [key in K]: V }>>>;
  async set<K extends string, V extends unknown>(
    key: K,
    value: V
  ): Promise<Entity<A & { [key in K]: V }>>;
  async set<K extends string, V extends unknown>(
    key: K,
    value: V
  ): Promise<unknown> {
    const keyId = await getKeyId(key);
    if (value === null || value === undefined) {
      await db.transaction(async (tx) => {
        const existing = await tx
          .select()
          .from(entitiesTable)
          .where(
            and(
              eq(entitiesTable.id, this.id),
              eq(entitiesTable.key, keyId),
              eq(entitiesTable.retracted, false)
            )
          )
          .limit(1);
        if (existing.length > 0) {
          await tx.insert(entitiesTable).values({
            id: this.id,
            key: keyId,
            value: null,
            retracted: true,
          });
        }
      });
    } else {
      await db.insert(entitiesTable).values({
        id: this.id,
        key: keyId,
        value,
      });
    }
    return this;
  }

  async remove<K extends keyof A>(key: K) {
    const keyId = await getKeyId(key as string);
    await db.insert(entitiesTable).values({
      id: this.id,
      key: keyId,
      value: null,
      retracted: true,
    });
    return this as Entity<Except<A, K>>;
  }
}
