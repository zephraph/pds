CREATE TABLE `entities` (
	`id` blob NOT NULL,
	`key_id` blob NOT NULL,
	`value` blob NOT NULL,
	`retracted` integer DEFAULT false NOT NULL,
	`version` blob,
	FOREIGN KEY (`key_id`) REFERENCES `keys`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `entities_version_unique` ON `entities` (`version`);--> statement-breakpoint
CREATE INDEX `key_idx` ON `entities` (`id`,`key_id`,`retracted`);--> statement-breakpoint
CREATE TABLE `keys` (
	`id` blob PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`retracted` integer DEFAULT false NOT NULL,
	`version` blob
);
--> statement-breakpoint
CREATE UNIQUE INDEX `keys_version_unique` ON `keys` (`version`);--> statement-breakpoint
CREATE UNIQUE INDEX `keys_id_name_unique` ON `keys` (`id`,`name`);--> statement-breakpoint
CREATE VIEW `entities_view` AS select "entities"."id", "keys"."name", "entities"."value" from "entities" inner join "keys" on "entities"."key_id" = "keys"."id" where "entities"."retracted" = 0 order by "entities"."version" desc;