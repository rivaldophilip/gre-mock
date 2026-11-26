CREATE TABLE "quizzes" (
	"id" serial PRIMARY KEY NOT NULL,
	"measure" text NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"spec" jsonb NOT NULL,
	"seed" integer NOT NULL,
	"bank_version" integer NOT NULL,
	"layout" jsonb NOT NULL,
	"fallbacks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shortfalls" (
	"id" serial PRIMARY KEY NOT NULL,
	"quiz_id" integer NOT NULL,
	"slot_id" text NOT NULL,
	"measure" text NOT NULL,
	"slot_type" text NOT NULL,
	"wanted_kind" text NOT NULL,
	"wanted_id" text,
	"wanted_level" integer,
	"step" integer NOT NULL,
	"got_ref" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "responses" ADD COLUMN "reused" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "shortfalls_open_idx" ON "shortfalls" USING btree ("resolved_at");