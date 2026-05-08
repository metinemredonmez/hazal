-- CreateEnum
CREATE TYPE "BlogPostStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "BlogPostKind" AS ENUM ('ARTICLE', 'PRESS', 'VIDEO');

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "kind" "BlogPostKind" NOT NULL DEFAULT 'ARTICLE',
    "status" "BlogPostStatus" NOT NULL DEFAULT 'DRAFT',
    "titleTr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "excerptTr" TEXT,
    "excerptEn" TEXT,
    "bodyTr" TEXT NOT NULL DEFAULT '',
    "bodyEn" TEXT NOT NULL DEFAULT '',
    "coverImage" TEXT,
    "externalUrl" TEXT,
    "publishedAt" TIMESTAMP(3),
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_status_publishedAt_idx" ON "BlogPost"("status", "publishedAt");
