CREATE TABLE "contest" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"image" text NOT NULL,
	"status" text DEFAULT 'upcoming' NOT NULL,
	"prize" text NOT NULL,
	"deadline" timestamp NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contest_submission" (
	"id" serial PRIMARY KEY NOT NULL,
	"contest_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"project_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "devlog_comment" (
	"id" serial PRIMARY KEY NOT NULL,
	"devlog_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"comment" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "devlog_comment_unique" UNIQUE("devlog_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "devlog_like" (
	"id" serial PRIMARY KEY NOT NULL,
	"devlog_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "devlog_like_unique" UNIQUE("devlog_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "devlog_view" (
	"id" serial PRIMARY KEY NOT NULL,
	"devlog_id" integer NOT NULL,
	"user_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hiddenmarketitem" (
	"id" serial PRIMARY KEY NOT NULL,
	"createdby" integer,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"image" text NOT NULL,
	"minrequiredshopscore" integer DEFAULT 0 NOT NULL,
	"minshopscore" integer NOT NULL,
	"maxshopscore" integer NOT NULL,
	"maxprice" integer NOT NULL,
	"minprice" integer NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"createdat" timestamp DEFAULT now() NOT NULL,
	"updatedat" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_reaction" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"reaction" varchar(10) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_reaction_project_id_user_id_reaction_unique" UNIQUE("project_id","user_id","reaction")
);
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "profilePicture" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "previewImage" text;--> statement-breakpoint
ALTER TABLE "ship" ADD COLUMN "previewImage" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "firstName" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "lastName" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "state" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "zipCode" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "dateOfBirth" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "age" integer;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "gender" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "pronouns" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "organization" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "company" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "twitter" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "github" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "linkedin" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "journalStreak" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "journalStreakLastJournalAt" timestamp;--> statement-breakpoint
ALTER TABLE "contest_submission" ADD CONSTRAINT "contest_submission_contest_id_contest_id_fk" FOREIGN KEY ("contest_id") REFERENCES "public"."contest"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contest_submission" ADD CONSTRAINT "contest_submission_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contest_submission" ADD CONSTRAINT "contest_submission_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devlog_comment" ADD CONSTRAINT "devlog_comment_devlog_id_devlog_id_fk" FOREIGN KEY ("devlog_id") REFERENCES "public"."devlog"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devlog_comment" ADD CONSTRAINT "devlog_comment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devlog_like" ADD CONSTRAINT "devlog_like_devlog_id_devlog_id_fk" FOREIGN KEY ("devlog_id") REFERENCES "public"."devlog"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devlog_like" ADD CONSTRAINT "devlog_like_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devlog_view" ADD CONSTRAINT "devlog_view_devlog_id_devlog_id_fk" FOREIGN KEY ("devlog_id") REFERENCES "public"."devlog"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devlog_view" ADD CONSTRAINT "devlog_view_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hiddenmarketitem" ADD CONSTRAINT "hiddenmarketitem_createdby_user_id_fk" FOREIGN KEY ("createdby") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_reaction" ADD CONSTRAINT "project_reaction_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_reaction" ADD CONSTRAINT "project_reaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;