import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const enquiries = sqliteTable("enquiries", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  customerName: text("customer_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  address: text("address").notNull().default(""),
  postcode: text("postcode").notNull().default(""),
  notes: text("notes").notNull().default(""),
  service: text("service").notNull(),
  quoteJson: text("quote_json").notNull(),
  status: text("status").notNull().default("enquiry"),
  appointment: text("appointment"),
  marketingConsent: integer("marketing_consent").notNull().default(0),
  consentAt: text("consent_at"),
  consentText: text("consent_text"),
  invoiceNumber: text("invoice_number"),
  paid: integer("paid").notNull().default(0),
}, table => [index("idx_enquiries_owner_created").on(table.ownerId, table.createdAt)]);

export const media = sqliteTable("media", {
  id: text("id").primaryKey(),
  enquiryId: text("enquiry_id").notNull(),
  ownerId: text("owner_id").notNull(),
  kind: text("kind").notNull(),
  key: text("key").notNull(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  createdAt: text("created_at").notNull(),
}, table => [index("idx_media_owner_enquiry").on(table.ownerId, table.enquiryId)]);
