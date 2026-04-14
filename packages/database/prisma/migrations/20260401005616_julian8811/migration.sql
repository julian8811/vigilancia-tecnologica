-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateEnum
CREATE TYPE "WorkspacePlan" AS ENUM ('free', 'pro', 'enterprise');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('admin', 'analyst', 'researcher', 'consultant', 'viewer');

-- CreateEnum
CREATE TYPE "RecordType" AS ENUM ('article', 'patent');

-- CreateEnum
CREATE TYPE "SearchRunStatus" AS ENUM ('pending', 'running', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "SearchRunTrigger" AS ENUM ('manual', 'scheduled', 'alert');

-- CreateEnum
CREATE TYPE "AlertFrequency" AS ENUM ('daily', 'weekly', 'monthly');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('technical', 'executive', 'bulletin', 'ficha_tecnologica', 'ficha_patente', 'state_of_art', 'competitive', 'comparison_matrix');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('draft', 'generating', 'ready', 'failed');

-- CreateEnum
CREATE TYPE "AIAnnotationType" AS ENUM ('summary', 'key_findings', 'technical_implications', 'cluster_label', 'trend_signal');

-- CreateEnum
CREATE TYPE "AuthorRole" AS ENUM ('author', 'inventor', 'applicant', 'assignee');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('active', 'archived');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clerk_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspaces" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "plan" "WorkspacePlan" NOT NULL DEFAULT 'free',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'viewer',
    "invited_by" UUID,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'active',
    "color" TEXT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_strategies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "current_version_id" UUID,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "search_strategies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strategy_versions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "strategy_id" UUID NOT NULL,
    "version_number" INTEGER NOT NULL,
    "query_text" TEXT NOT NULL,
    "query_ast" JSONB NOT NULL,
    "filters" JSONB NOT NULL DEFAULT '{}',
    "sources" TEXT[],
    "notes" TEXT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "strategy_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_runs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "strategy_id" UUID NOT NULL,
    "version_id" UUID NOT NULL,
    "status" "SearchRunStatus" NOT NULL DEFAULT 'pending',
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "total_results" INTEGER,
    "new_results" INTEGER,
    "error_log" JSONB,
    "triggered_by" "SearchRunTrigger" NOT NULL DEFAULT 'manual',

    CONSTRAINT "search_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_run_sources" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "run_id" UUID NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "result_count" INTEGER,
    "error_msg" TEXT,

    CONSTRAINT "search_run_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "normalized_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "record_type" "RecordType" NOT NULL,
    "title" TEXT NOT NULL,
    "abstract" TEXT,
    "year" INTEGER,
    "country" TEXT,
    "language" TEXT,
    "source_ids" JSONB NOT NULL DEFAULT '{}',
    "dedup_hash" TEXT NOT NULL,
    "raw_payload" JSONB NOT NULL,
    "normalized_payload" JSONB NOT NULL,
    "relevance_score" DOUBLE PRECISION,
    "is_open_access" BOOLEAN NOT NULL DEFAULT false,
    "citation_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "normalized_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scientific_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "normalized_record_id" UUID NOT NULL,
    "doi" TEXT,
    "journal" TEXT,
    "volume" TEXT,
    "issue" TEXT,
    "pages" TEXT,
    "document_type" TEXT,
    "thematic_area" TEXT,
    "affiliations" JSONB NOT NULL DEFAULT '[]',
    "referenced_works" TEXT[],
    "url" TEXT,

    CONSTRAINT "scientific_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patent_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "normalized_record_id" UUID NOT NULL,
    "publication_number" TEXT,
    "application_number" TEXT,
    "patent_family_id" TEXT,
    "legal_status" TEXT,
    "jurisdiction" TEXT,
    "filing_date" TIMESTAMP(3),
    "publication_date" TIMESTAMP(3),
    "grant_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "ipc_codes" TEXT[],
    "cpc_codes" TEXT[],
    "non_patent_literature" JSONB NOT NULL DEFAULT '[]',
    "official_url" TEXT,

    CONSTRAINT "patent_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authors" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "normalized_name" TEXT,
    "orcid" TEXT,
    "affiliation_id" UUID,
    "external_ids" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "authors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "record_authors" (
    "record_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "author_order" INTEGER NOT NULL DEFAULT 0,
    "role" "AuthorRole" NOT NULL DEFAULT 'author',

    CONSTRAINT "record_authors_pkey" PRIMARY KEY ("record_id","author_id","role")
);

-- CreateTable
CREATE TABLE "institutions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "normalized_name" TEXT,
    "ror_id" TEXT,
    "country" TEXT,
    "type" TEXT,

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "color" TEXT,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "record_tags" (
    "record_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "record_tags_pkey" PRIMARY KEY ("record_id","tag_id")
);

-- CreateTable
CREATE TABLE "ai_annotations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "record_id" UUID NOT NULL,
    "annotation_type" "AIAnnotationType" NOT NULL,
    "content" TEXT NOT NULL,
    "model_used" TEXT,
    "prompt_version" TEXT,
    "confidence_score" DOUBLE PRECISION,
    "is_edited_by_user" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_annotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clusters" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "run_id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "algorithm" TEXT,
    "record_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clusters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cluster_members" (
    "cluster_id" UUID NOT NULL,
    "record_id" UUID NOT NULL,

    CONSTRAINT "cluster_members_pkey" PRIMARY KEY ("cluster_id","record_id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "strategy_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "frequency" "AlertFrequency" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "min_new_results" INTEGER NOT NULL DEFAULT 1,
    "notify_email" BOOLEAN NOT NULL DEFAULT true,
    "notify_in_app" BOOLEAN NOT NULL DEFAULT true,
    "last_run_at" TIMESTAMP(3),
    "next_run_at" TIMESTAMP(3),
    "created_by" UUID NOT NULL,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_runs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "alert_id" UUID NOT NULL,
    "ran_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "new_results" INTEGER NOT NULL DEFAULT 0,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "error_msg" TEXT,

    CONSTRAINT "alert_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "report_type" "ReportType" NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'draft',
    "config" JSONB NOT NULL DEFAULT '{}',
    "file_url" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "run_records" (
    "run_id" UUID NOT NULL,
    "record_id" UUID NOT NULL,

    CONSTRAINT "run_records_pkey" PRIMARY KEY ("run_id","record_id")
);

-- CreateTable
CREATE TABLE "saved_collections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_items" (
    "collection_id" UUID NOT NULL,
    "record_id" UUID NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "collection_items_pkey" PRIMARY KEY ("collection_id","record_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_id_key" ON "users"("clerk_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "workspaces_slug_key" ON "workspaces"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_members_workspace_id_user_id_key" ON "workspace_members"("workspace_id", "user_id");

-- CreateIndex
CREATE INDEX "projects_workspace_id_idx" ON "projects"("workspace_id");

-- CreateIndex
CREATE INDEX "search_strategies_project_id_idx" ON "search_strategies"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "strategy_versions_strategy_id_version_number_key" ON "strategy_versions"("strategy_id", "version_number");

-- CreateIndex
CREATE INDEX "search_runs_strategy_id_idx" ON "search_runs"("strategy_id");

-- CreateIndex
CREATE INDEX "normalized_records_workspace_id_record_type_idx" ON "normalized_records"("workspace_id", "record_type");

-- CreateIndex
CREATE INDEX "normalized_records_dedup_hash_idx" ON "normalized_records"("dedup_hash");

-- CreateIndex
CREATE UNIQUE INDEX "scientific_records_normalized_record_id_key" ON "scientific_records"("normalized_record_id");

-- CreateIndex
CREATE UNIQUE INDEX "patent_records_normalized_record_id_key" ON "patent_records"("normalized_record_id");

-- CreateIndex
CREATE INDEX "authors_workspace_id_idx" ON "authors"("workspace_id");

-- CreateIndex
CREATE INDEX "institutions_workspace_id_idx" ON "institutions"("workspace_id");

-- CreateIndex
CREATE INDEX "ai_annotations_record_id_annotation_type_idx" ON "ai_annotations"("record_id", "annotation_type");

-- CreateIndex
CREATE INDEX "alerts_project_id_idx" ON "alerts"("project_id");

-- CreateIndex
CREATE INDEX "reports_project_id_idx" ON "reports"("project_id");

-- AddForeignKey
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_strategies" ADD CONSTRAINT "search_strategies_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategy_versions" ADD CONSTRAINT "strategy_versions_strategy_id_fkey" FOREIGN KEY ("strategy_id") REFERENCES "search_strategies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_runs" ADD CONSTRAINT "search_runs_strategy_id_fkey" FOREIGN KEY ("strategy_id") REFERENCES "search_strategies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_runs" ADD CONSTRAINT "search_runs_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "strategy_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_run_sources" ADD CONSTRAINT "search_run_sources_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "search_runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "normalized_records" ADD CONSTRAINT "normalized_records_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scientific_records" ADD CONSTRAINT "scientific_records_normalized_record_id_fkey" FOREIGN KEY ("normalized_record_id") REFERENCES "normalized_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patent_records" ADD CONSTRAINT "patent_records_normalized_record_id_fkey" FOREIGN KEY ("normalized_record_id") REFERENCES "normalized_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "authors" ADD CONSTRAINT "authors_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "authors" ADD CONSTRAINT "authors_affiliation_id_fkey" FOREIGN KEY ("affiliation_id") REFERENCES "institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_authors" ADD CONSTRAINT "record_authors_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "normalized_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_authors" ADD CONSTRAINT "record_authors_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "authors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institutions" ADD CONSTRAINT "institutions_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_tags" ADD CONSTRAINT "record_tags_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "normalized_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_tags" ADD CONSTRAINT "record_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_annotations" ADD CONSTRAINT "ai_annotations_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "normalized_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clusters" ADD CONSTRAINT "clusters_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clusters" ADD CONSTRAINT "clusters_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "search_runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cluster_members" ADD CONSTRAINT "cluster_members_cluster_id_fkey" FOREIGN KEY ("cluster_id") REFERENCES "clusters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cluster_members" ADD CONSTRAINT "cluster_members_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "normalized_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_strategy_id_fkey" FOREIGN KEY ("strategy_id") REFERENCES "search_strategies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_runs" ADD CONSTRAINT "alert_runs_alert_id_fkey" FOREIGN KEY ("alert_id") REFERENCES "alerts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "run_records" ADD CONSTRAINT "run_records_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "search_runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "run_records" ADD CONSTRAINT "run_records_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "normalized_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_collections" ADD CONSTRAINT "saved_collections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "saved_collections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "normalized_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
