CREATE TABLE `admin_users` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'GROUP_ADMIN' NOT NULL,
	`brand_ids` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `organization_groups`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_users_email_unique` ON `admin_users` (`email`);--> statement-breakpoint
CREATE TABLE `analytics_events` (
	`id` text PRIMARY KEY NOT NULL,
	`occurred_at` integer NOT NULL,
	`event_type` text NOT NULL,
	`group_id` text NOT NULL,
	`brand_id` text,
	`staff_id` text,
	`profile_id` text,
	`card_id` text,
	`locale` text,
	`device_category` text,
	`country_code` text,
	`metadata` text
);
--> statement-breakpoint
CREATE INDEX `analytics_events_group_occurred_idx` ON `analytics_events` (`group_id`,`occurred_at`);--> statement-breakpoint
CREATE INDEX `analytics_events_brand_type_idx` ON `analytics_events` (`brand_id`,`event_type`);--> statement-breakpoint
CREATE TABLE `approval_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`public_id` text NOT NULL,
	`group_id` text NOT NULL,
	`brand_id` text,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`field` text NOT NULL,
	`previous_value` text,
	`proposed_value` text NOT NULL,
	`requested_by_id` text,
	`reviewer_id` text,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`requested_at` integer NOT NULL,
	`reviewed_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `approval_requests_public_id_unique` ON `approval_requests` (`public_id`);--> statement-breakpoint
CREATE INDEX `approval_requests_brand_status_idx` ON `approval_requests` (`brand_id`,`status`);--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`brand_id` text,
	`actor_id` text,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`metadata` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `audit_logs_group_created_idx` ON `audit_logs` (`group_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `brand_themes` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`brand_id` text,
	`name` text NOT NULL,
	`values` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `organization_groups`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `brand_themes_group_brand_idx` ON `brand_themes` (`group_id`,`brand_id`);--> statement-breakpoint
CREATE TABLE `brands` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`name` text NOT NULL,
	`legal_name` text,
	`display_name` text NOT NULL,
	`short_name` text,
	`slug` text NOT NULL,
	`website` text,
	`email` text,
	`phone` text,
	`whatsapp` text,
	`logo_path` text,
	`socials` text DEFAULT '[]' NOT NULL,
	`default_language` text DEFAULT 'en' NOT NULL,
	`supported_languages` text DEFAULT '["en","ar"]' NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`archived_at` integer,
	FOREIGN KEY (`group_id`) REFERENCES `organization_groups`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `brands_group_slug_key` ON `brands` (`group_id`,`slug`);--> statement-breakpoint
CREATE INDEX `brands_group_status_idx` ON `brands` (`group_id`,`status`);--> statement-breakpoint
CREATE TABLE `cards` (
	`id` text PRIMARY KEY NOT NULL,
	`public_id` text NOT NULL,
	`brand_id` text NOT NULL,
	`profile_id` text,
	`display_number` text NOT NULL,
	`nfc_token` text NOT NULL,
	`status` text DEFAULT 'UNASSIGNED' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cards_public_id_unique` ON `cards` (`public_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `cards_nfc_token_unique` ON `cards` (`nfc_token`);--> statement-breakpoint
CREATE UNIQUE INDEX `cards_brand_display_number_key` ON `cards` (`brand_id`,`display_number`);--> statement-breakpoint
CREATE INDEX `cards_brand_status_idx` ON `cards` (`brand_id`,`status`);--> statement-breakpoint
CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`public_id` text NOT NULL,
	`brand_id` text NOT NULL,
	`staff_id` text,
	`profile_id` text,
	`status` text DEFAULT 'NEW' NOT NULL,
	`full_name` text NOT NULL,
	`email` text,
	`phone` text,
	`consent_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`staff_id`) REFERENCES `staff`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `leads_public_id_unique` ON `leads` (`public_id`);--> statement-breakpoint
CREATE INDEX `leads_brand_status_idx` ON `leads` (`brand_id`,`status`);--> statement-breakpoint
CREATE TABLE `organization_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`archived_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organization_groups_slug_unique` ON `organization_groups` (`slug`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`public_id` text NOT NULL,
	`slug` text NOT NULL,
	`staff_id` text NOT NULL,
	`brand_id` text NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`indexable` integer DEFAULT false NOT NULL,
	`job_title` text,
	`biography` text,
	`photo_path` text,
	`location` text,
	`office_address` text,
	`office_map_url` text,
	`published_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`staff_id`) REFERENCES `staff`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profiles_public_id_unique` ON `profiles` (`public_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `profiles_slug_unique` ON `profiles` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `profiles_staff_id_unique` ON `profiles` (`staff_id`);--> statement-breakpoint
CREATE INDEX `profiles_brand_status_idx` ON `profiles` (`brand_id`,`status`);--> statement-breakpoint
CREATE TABLE `staff` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`user_id` text,
	`employee_number` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`display_name` text NOT NULL,
	`work_email` text NOT NULL,
	`job_title_en` text NOT NULL,
	`job_title_ar` text,
	`phone` text,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`archived_at` integer,
	FOREIGN KEY (`group_id`) REFERENCES `organization_groups`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `staff_group_employee_number_key` ON `staff` (`group_id`,`employee_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `staff_group_work_email_key` ON `staff` (`group_id`,`work_email`);--> statement-breakpoint
CREATE INDEX `staff_group_status_idx` ON `staff` (`group_id`,`status`);--> statement-breakpoint
CREATE TABLE `staff_brands` (
	`id` text PRIMARY KEY NOT NULL,
	`staff_id` text NOT NULL,
	`brand_id` text NOT NULL,
	`department_id` text,
	`is_primary` integer DEFAULT false NOT NULL,
	`joined_at` integer NOT NULL,
	`left_at` integer,
	FOREIGN KEY (`staff_id`) REFERENCES `staff`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `staff_brands_staff_brand_key` ON `staff_brands` (`staff_id`,`brand_id`);--> statement-breakpoint
CREATE INDEX `staff_brands_brand_primary_idx` ON `staff_brands` (`brand_id`,`is_primary`);