CREATE INDEX `idx_enquiries_owner_created` ON `enquiries` (`owner_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_media_owner_enquiry` ON `media` (`owner_id`,`enquiry_id`);
