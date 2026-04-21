ALTER TABLE "printshop_item_order" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "printshop_item_order" ALTER COLUMN "status" SET DEFAULT 'awaiting_approval'::text;--> statement-breakpoint
DROP TYPE "public"."printshop_order_status";--> statement-breakpoint
CREATE TYPE "public"."printshop_order_status" AS ENUM('awaiting_approval', 'fulfilled', 'denied', 'refunded');--> statement-breakpoint
ALTER TABLE "printshop_item_order" ALTER COLUMN "status" SET DEFAULT 'awaiting_approval'::"public"."printshop_order_status";--> statement-breakpoint
ALTER TABLE "printshop_item_order" ALTER COLUMN "status" SET DATA TYPE "public"."printshop_order_status" USING "status"::"public"."printshop_order_status";