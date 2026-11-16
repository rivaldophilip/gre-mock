CREATE TABLE "study_marks" (
	"measure" text NOT NULL,
	"kind" text NOT NULL,
	"item_id" text NOT NULL,
	"state" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "study_marks_measure_kind_item_id_pk" PRIMARY KEY("measure","kind","item_id")
);
