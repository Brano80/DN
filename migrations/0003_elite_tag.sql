ALTER TABLE "api_keys" RENAME COLUMN "client_id" TO "customer_name";--> statement-breakpoint
ALTER TABLE "api_keys" ALTER COLUMN "key_prefix" SET DATA TYPE varchar(16);