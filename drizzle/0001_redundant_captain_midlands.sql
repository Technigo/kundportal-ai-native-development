-- SQLite cannot drop a foreign-key column, so rebuild `tickets`.
-- Existing rows keep their data: the requester is taken from the old customer.
CREATE TABLE `tickets_new` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`requester_name` text NOT NULL,
	`requester_email` text,
	`subject` text NOT NULL,
	`description` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`priority` text DEFAULT 'normal' NOT NULL,
	`created_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL
);
--> statement-breakpoint
INSERT INTO `tickets_new` (`id`, `requester_name`, `requester_email`, `subject`, `description`, `status`, `priority`, `created_at`)
SELECT `t`.`id`, `c`.`name`, `c`.`email`, `t`.`subject`, `t`.`description`, `t`.`status`, `t`.`priority`, `t`.`created_at`
FROM `tickets` `t` JOIN `customers` `c` ON `c`.`id` = `t`.`customer_id`;
--> statement-breakpoint
DROP TABLE `tickets`;
--> statement-breakpoint
DROP TABLE `customers`;
--> statement-breakpoint
ALTER TABLE `tickets_new` RENAME TO `tickets`;
--> statement-breakpoint
CREATE INDEX `tickets_created_idx` ON `tickets` (`created_at`);
