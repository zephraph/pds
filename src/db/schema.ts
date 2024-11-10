import {
  int,
  sqliteTable,
  text,
  blob,
  index,
  view,
  unique,
} from "drizzle-orm/sqlite-core";
import { and, eq, desc } from "drizzle-orm";
import { ulid as newULID, ULID, uuid as newUUID, UUID } from "../id";

const ulid = <N extends string>(name: N) => {
  return blob(name).$type<ULID>();
};

const uuid = <N extends string>(name: N) => {
  return blob(name).$type<UUID>();
};

export const keysTable = sqliteTable(
  "keys",
  {
    id: uuid("id").primaryKey().$defaultFn(newUUID),
    name: text("name").notNull(),
    // type: int("type_id").references(() => typesTable.id),
    retracted: int("retracted", { mode: "boolean" }).notNull().default(false),
    version: ulid("version").unique().$defaultFn(newULID),
  },
  (table) => ({
    nameUnique: unique().on(table.id, table.name),
  })
);

export const entitiesTable = sqliteTable(
  "entities",
  {
    id: uuid("id").notNull().$defaultFn(newUUID),
    key: uuid("key_id")
      .references(() => keysTable.id)
      .notNull(),
    value: blob("value").notNull(),
    retracted: int("retracted", { mode: "boolean" }).notNull().default(false),
    version: ulid("version").unique().$defaultFn(newULID),
  },
  (table) => ({
    keyIdx: index("key_idx").on(table.id, table.key, table.retracted),
  })
);

export const entitiesView = view("entities_view").as((qb) =>
  qb
    .select({
      id: entitiesTable.id,
      key: keysTable.name,
      value: entitiesTable.value,
    })
    .from(entitiesTable)
    .innerJoin(keysTable, eq(entitiesTable.key, keysTable.id))
    .where(eq(entitiesTable.retracted, false))
    .orderBy(desc(entitiesTable.version))
);

// export const typesTable = sqliteTable("types", {
//   id: uuid("id").notNull().$defaultFn(newUUID),
//   name: text("name").notNull(),
//   check: text("check").notNull(),
//   retracted: int("retracted", { mode: "boolean" }).notNull().default(false),
//   version: ulid("version").$defaultFn(newULID),
// });

// export const typeConversionsTable = sqliteTable("type_conversions", {
//   id: uuid("id").notNull().$defaultFn(newUUID),
//   from: int("from_id").references(() => typesTable.id),
//   to: int("to_id").references(() => typesTable.id),
//   convert: text("convert").notNull(),
//   retracted: int("retracted", { mode: "boolean" }).notNull().default(false),
//   version: ulid("version").$defaultFn(newULID),
// });
