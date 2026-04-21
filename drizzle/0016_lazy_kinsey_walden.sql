CREATE TYPE "public"."market_order_status" AS ENUM('awaiting_approval', 'approved', 'fulfilled');--> statement-breakpoint
CREATE TABLE "market_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"createdBy" integer,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"image" text NOT NULL,
	"minRequiredShopScore" integer DEFAULT 0 NOT NULL,
	"minShopScore" integer NOT NULL,
	"maxShopScore" integer NOT NULL,
	"maxPrice" integer NOT NULL,
	"minPrice" integer NOT NULL,
	"isPublic" boolean DEFAULT false NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_item_order" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"addressId" text NOT NULL,
	"bricksPaid" integer NOT NULL,
	"status" "market_order_status" DEFAULT 'awaiting_approval' NOT NULL,
	"userNotes" text NOT NULL,
	"notes" text NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "market_item" ADD CONSTRAINT "market_item_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_item_order" ADD CONSTRAINT "market_item_order_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;