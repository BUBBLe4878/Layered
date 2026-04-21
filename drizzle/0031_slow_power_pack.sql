CREATE TABLE "currency_audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"adminUserId" integer NOT NULL,
	"targetUserId" integer NOT NULL,
	"reason" text NOT NULL,
	"oldBenchies" real NOT NULL,
	"oldLayer" real NOT NULL,
	"oldShopScore" real NOT NULL,
	"newBenchies" real NOT NULL,
	"newLayer" real NOT NULL,
	"newShopScore" real NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "currency_audit_log" ADD CONSTRAINT "currency_audit_log_adminUserId_user_id_fk" FOREIGN KEY ("adminUserId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "currency_audit_log" ADD CONSTRAINT "currency_audit_log_targetUserId_user_id_fk" FOREIGN KEY ("targetUserId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;