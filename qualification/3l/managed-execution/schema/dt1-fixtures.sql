-- Synthetic DT-1 prime fixtures only. These are not Product MAR DDL.

CREATE TABLE mar.dt1_owner_job_run (
  id uuid PRIMARY KEY,
  logical_occurrence_key text NOT NULL UNIQUE,
  release_ref text NOT NULL,
  job_revision_ref text NOT NULL,
  admissible boolean NOT NULL DEFAULT true,
  admitted_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE mar.dt1_owner_without_unique (
  id uuid PRIMARY KEY,
  logical_occurrence_key text NOT NULL,
  release_ref text NOT NULL,
  job_revision_ref text NOT NULL,
  admitted_at timestamptz NOT NULL DEFAULT now()
);
