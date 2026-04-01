import {
  pgTable,
  serial,
  text,
  numeric,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const propertiesTable = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 14, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull(),
  type: text("type").notNull(),
  district: text("district").notNull(),
  address: text("address").notNull(),
  area: numeric("area", { precision: 10, scale: 2 }),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  parkingSpaces: integer("parking_spaces"),
  featured: boolean("featured").notNull().default(false),
  images: text("images").array().notNull().default([]),
  videoUrl: text("video_url"),
  whatsappNumber: text("whatsapp_number").notNull().default("+51999999999"),
  tag: text("tag"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPropertySchema = createInsertSchema(propertiesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof propertiesTable.$inferSelect;
