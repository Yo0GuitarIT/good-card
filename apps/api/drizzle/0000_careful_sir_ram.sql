CREATE TABLE "cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collection_id" uuid NOT NULL,
	"serial_number" integer NOT NULL,
	"label" text NOT NULL,
	"title" text NOT NULL,
	"total_stamps" integer DEFAULT 10 NOT NULL,
	"theme_id" text DEFAULT 'black-gold' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"locked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"view_token" text NOT NULL,
	"owner_name" text NOT NULL,
	"issuer_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "collections_view_token_unique" UNIQUE("view_token")
);
--> statement-breakpoint
CREATE TABLE "stamps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_id" uuid NOT NULL,
	"awarded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stamps" ADD CONSTRAINT "stamps_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cards_collection_serial_unique" ON "cards" USING btree ("collection_id","serial_number");--> statement-breakpoint
CREATE UNIQUE INDEX "cards_one_active_per_collection" ON "cards" USING btree ("collection_id") WHERE "cards"."locked_at" is null;