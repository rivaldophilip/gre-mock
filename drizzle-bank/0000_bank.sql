CREATE TABLE "batches" (
	"id" text PRIMARY KEY NOT NULL,
	"measure" text NOT NULL,
	"kind" text NOT NULL,
	"brief" jsonb,
	"targets" jsonb,
	"status" text NOT NULL,
	"synced_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "figures" (
	"ref" text PRIMARY KEY NOT NULL,
	"source_id" text NOT NULL,
	"fid" text NOT NULL,
	"position" integer NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"body" jsonb NOT NULL,
	"hash" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "item_tags" (
	"ref" text NOT NULL,
	"kind" text NOT NULL,
	"tag_id" text NOT NULL,
	"role" text NOT NULL,
	CONSTRAINT "item_tags_ref_kind_tag_id_role_pk" PRIMARY KEY("ref","kind","tag_id","role")
);
--> statement-breakpoint
CREATE TABLE "items" (
	"ref" text PRIMARY KEY NOT NULL,
	"source_id" text NOT NULL,
	"qid" text NOT NULL,
	"measure" text NOT NULL,
	"type" text NOT NULL,
	"slot_type" text NOT NULL,
	"section" integer NOT NULL,
	"position" integer NOT NULL,
	"difficulty" integer NOT NULL,
	"solver_rating" integer,
	"primary_tag" text,
	"variant" text,
	"setup" text,
	"setup_group" text,
	"key_words" text[] DEFAULT '{}' NOT NULL,
	"revisits" text,
	"unit_id" text,
	"passage_id" text,
	"figure_id" text,
	"status" text DEFAULT 'active' NOT NULL,
	"body" jsonb NOT NULL,
	"hash" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meta" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "passages" (
	"ref" text PRIMARY KEY NOT NULL,
	"source_id" text NOT NULL,
	"pid" text NOT NULL,
	"position" integer NOT NULL,
	"kind" text NOT NULL,
	"paragraphs" integer NOT NULL,
	"domain" text,
	"status" text DEFAULT 'active' NOT NULL,
	"body" jsonb NOT NULL,
	"hash" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"measure" text NOT NULL,
	"title" text NOT NULL,
	"sections" jsonb NOT NULL,
	"position" integer NOT NULL,
	"hash" text NOT NULL,
	"synced_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" text PRIMARY KEY NOT NULL,
	"source_id" text NOT NULL,
	"measure" text NOT NULL,
	"shape" text NOT NULL,
	"n" integer NOT NULL,
	"min_level" integer NOT NULL,
	"max_level" integer NOT NULL,
	"section" integer NOT NULL,
	"status" text DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE INDEX "item_tags_tag_idx" ON "item_tags" USING btree ("kind","tag_id");--> statement-breakpoint
CREATE INDEX "items_source_idx" ON "items" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "items_primary_idx" ON "items" USING btree ("primary_tag");--> statement-breakpoint
CREATE INDEX "items_unit_idx" ON "items" USING btree ("unit_id");