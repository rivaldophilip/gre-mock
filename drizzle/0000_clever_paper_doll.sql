CREATE TABLE "attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"test_id" text NOT NULL,
	"mode" text NOT NULL,
	"timer_on" boolean DEFAULT true NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"finished_at" timestamp,
	"current_position" integer DEFAULT 0 NOT NULL,
	"section_state" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "concepts" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"area" text NOT NULL,
	"ets_section" text,
	"yield" real DEFAULT 0.5 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "item_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"item_id" text NOT NULL,
	"event" text NOT NULL,
	"weight" real NOT NULL,
	"response_id" integer,
	"attempt_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_items" (
	"question_id" text NOT NULL,
	"kind" text NOT NULL,
	"item_id" text NOT NULL,
	"role" text NOT NULL,
	CONSTRAINT "question_items_question_id_kind_item_id_role_pk" PRIMARY KEY("question_id","kind","item_id","role")
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" text PRIMARY KEY NOT NULL,
	"test_id" text NOT NULL,
	"section" integer NOT NULL,
	"position" integer NOT NULL,
	"type" text NOT NULL,
	"difficulty" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "responses" (
	"id" serial PRIMARY KEY NOT NULL,
	"attempt_id" integer NOT NULL,
	"question_id" text NOT NULL,
	"answer" jsonb,
	"is_correct" boolean DEFAULT false NOT NULL,
	"time_ms" integer DEFAULT 0 NOT NULL,
	"guessed" boolean DEFAULT false NOT NULL,
	"marked" boolean DEFAULT false NOT NULL,
	"finalized" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tests" (
	"id" text PRIMARY KEY NOT NULL,
	"measure" text NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"brief" jsonb
);
--> statement-breakpoint
CREATE TABLE "vocab" (
	"id" text PRIMARY KEY NOT NULL,
	"lemma" text NOT NULL,
	"variants" text[] DEFAULT '{}' NOT NULL,
	"pos" text,
	"senses" jsonb,
	"is_secondary" boolean DEFAULT false NOT NULL,
	"meaning_group" text,
	"sources" text[] DEFAULT '{}' NOT NULL,
	"source_count" integer DEFAULT 0 NOT NULL,
	"pink" boolean DEFAULT false NOT NULL,
	"tier" text DEFAULT 'core' NOT NULL,
	"yield" real DEFAULT 0.5 NOT NULL
);
--> statement-breakpoint
CREATE INDEX "attempts_test_idx" ON "attempts" USING btree ("test_id");--> statement-breakpoint
CREATE INDEX "ie_item_idx" ON "item_events" USING btree ("kind","item_id");--> statement-breakpoint
CREATE INDEX "ie_resp_idx" ON "item_events" USING btree ("response_id");--> statement-breakpoint
CREATE INDEX "qi_item_idx" ON "question_items" USING btree ("kind","item_id");--> statement-breakpoint
CREATE INDEX "questions_test_idx" ON "questions" USING btree ("test_id");--> statement-breakpoint
CREATE UNIQUE INDEX "responses_attempt_q" ON "responses" USING btree ("attempt_id","question_id");