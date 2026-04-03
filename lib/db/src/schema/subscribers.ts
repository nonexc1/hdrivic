import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { propertiesTable } from "./properties";

export const propertySubscribersTable = pgTable("property_subscribers", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => propertiesTable.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PropertySubscriber = typeof propertySubscribersTable.$inferSelect;
