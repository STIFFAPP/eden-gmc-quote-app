CREATE TABLE `enquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`customer_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`address` text DEFAULT '' NOT NULL,
	`postcode` text DEFAULT '' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`service` text NOT NULL,
	`quote_json` text NOT NULL,
	`status` text DEFAULT 'enquiry' NOT NULL,
	`appointment` text,
	`marketing_consent` integer DEFAULT 0 NOT NULL,
	`consent_at` text,
	`consent_text` text,
	`invoice_number` text,
	`paid` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`enquiry_id` text NOT NULL,
	`owner_id` text NOT NULL,
	`kind` text NOT NULL,
	`key` text NOT NULL,
	`filename` text NOT NULL,
	`mime_type` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`created_at` text NOT NULL
);
