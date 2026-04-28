CREATE TABLE "weekly_award_round" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"weekStart" timestamp NOT NULL,
	"votingOpen" boolean DEFAULT false NOT NULL,
	"createdBy" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "weekly_award_round_weekStart_unique" UNIQUE("weekStart")
);
--> statement-breakpoint
CREATE TABLE "weekly_award_category" (
	"id" serial PRIMARY KEY NOT NULL,
	"roundId" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"bonusLayers" integer DEFAULT 50 NOT NULL,
	"createdBy" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "weekly_award_round_category_name_unique" UNIQUE("roundId", "name")
);
--> statement-breakpoint
CREATE TABLE "weekly_award_finalist" (
	"id" serial PRIMARY KEY NOT NULL,
	"categoryId" integer NOT NULL,
	"userId" integer NOT NULL,
	"reason" text,
	"createdBy" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "weekly_award_category_finalist_unique" UNIQUE("categoryId", "userId")
);
--> statement-breakpoint
CREATE TABLE "weekly_award_vote" (
	"id" serial PRIMARY KEY NOT NULL,
	"categoryId" integer NOT NULL,
	"finalistId" integer NOT NULL,
	"voterUserId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "weekly_award_category_vote_per_user_unique" UNIQUE("categoryId", "voterUserId")
);
--> statement-breakpoint
CREATE TABLE "weekly_award_payout" (
	"id" serial PRIMARY KEY NOT NULL,
	"categoryId" integer NOT NULL,
	"winnerUserId" integer NOT NULL,
	"layersGranted" real NOT NULL,
	"grantedBy" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "weekly_award_category_payout_unique" UNIQUE("categoryId")
);
--> statement-breakpoint
ALTER TABLE "weekly_award_round" ADD CONSTRAINT "weekly_award_round_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "weekly_award_category" ADD CONSTRAINT "weekly_award_category_roundId_weekly_award_round_id_fk" FOREIGN KEY ("roundId") REFERENCES "public"."weekly_award_round"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "weekly_award_category" ADD CONSTRAINT "weekly_award_category_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "weekly_award_finalist" ADD CONSTRAINT "weekly_award_finalist_categoryId_weekly_award_category_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."weekly_award_category"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "weekly_award_finalist" ADD CONSTRAINT "weekly_award_finalist_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "weekly_award_finalist" ADD CONSTRAINT "weekly_award_finalist_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "weekly_award_vote" ADD CONSTRAINT "weekly_award_vote_categoryId_weekly_award_category_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."weekly_award_category"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "weekly_award_vote" ADD CONSTRAINT "weekly_award_vote_finalistId_weekly_award_finalist_id_fk" FOREIGN KEY ("finalistId") REFERENCES "public"."weekly_award_finalist"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "weekly_award_vote" ADD CONSTRAINT "weekly_award_vote_voterUserId_user_id_fk" FOREIGN KEY ("voterUserId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "weekly_award_payout" ADD CONSTRAINT "weekly_award_payout_categoryId_weekly_award_category_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."weekly_award_category"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "weekly_award_payout" ADD CONSTRAINT "weekly_award_payout_winnerUserId_user_id_fk" FOREIGN KEY ("winnerUserId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "weekly_award_payout" ADD CONSTRAINT "weekly_award_payout_grantedBy_user_id_fk" FOREIGN KEY ("grantedBy") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;