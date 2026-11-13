CREATE TABLE `ticket_note_comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`note_id` integer NOT NULL,
	`body` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL,
	FOREIGN KEY (`note_id`) REFERENCES `ticket_notes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `ticket_note_comments_note_created_idx` ON `ticket_note_comments` (`note_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `ticket_notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ticket_id` integer NOT NULL,
	`body` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL,
	FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `ticket_notes_ticket_created_idx` ON `ticket_notes` (`ticket_id`,`created_at`);