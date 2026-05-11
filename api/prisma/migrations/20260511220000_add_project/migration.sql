-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "brandTr" TEXT NOT NULL DEFAULT '',
    "brandEn" TEXT NOT NULL DEFAULT '',
    "nameTr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "taglineTr" TEXT NOT NULL DEFAULT '',
    "taglineEn" TEXT NOT NULL DEFAULT '',
    "locationTr" TEXT NOT NULL DEFAULT '',
    "locationEn" TEXT NOT NULL DEFAULT '',
    "descriptionTr" TEXT NOT NULL DEFAULT '',
    "descriptionEn" TEXT NOT NULL DEFAULT '',
    "heroImage" TEXT NOT NULL DEFAULT '',
    "heroVideo" TEXT,
    "specs" JSONB NOT NULL DEFAULT '[]',
    "featuresTr" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "featuresEn" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "gallery" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "brochureUrl" TEXT,
    "statusTr" TEXT NOT NULL DEFAULT '',
    "statusEn" TEXT NOT NULL DEFAULT '',
    "statusTone" TEXT NOT NULL DEFAULT 'live',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_isPublished_order_idx" ON "Project"("isPublished", "order");

-- CreateIndex
CREATE INDEX "Project_slug_idx" ON "Project"("slug");
