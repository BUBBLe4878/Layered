CREATE TABLE "ovenpheus_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"benchies" real NOT NULL,
	"layersReceived" real NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ovenpheus_log" ADD CONSTRAINT "ovenpheus_log_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;