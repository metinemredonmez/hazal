-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('LEAD', 'ACTIVE', 'CLIENT', 'INACTIVE', 'LOST');

-- CreateEnum
CREATE TYPE "CustomerSource" AS ENUM ('WEB', 'REFERRAL', 'SOCIAL', 'PHONE', 'WALK_IN', 'PARTNER', 'OTHER');

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "altPhone" TEXT,
    "whatsapp" TEXT,
    "status" "CustomerStatus" NOT NULL DEFAULT 'LEAD',
    "source" "CustomerSource" NOT NULL DEFAULT 'WEB',
    "budget" DECIMAL(14,2),
    "budgetCurrency" "Currency",
    "preferences" TEXT,
    "birthday" DATE,
    "interestedIn" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "districts" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferredContact" TEXT,
    "score" INTEGER NOT NULL DEFAULT 0,
    "scoreNote" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "altPhone" TEXT,
    "email" TEXT,
    "company" TEXT,
    "role" TEXT,
    "category" TEXT,
    "notes" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Customer_status_idx" ON "Customer"("status");

-- CreateIndex
CREATE INDEX "Customer_email_idx" ON "Customer"("email");

-- CreateIndex
CREATE INDEX "Customer_phone_idx" ON "Customer"("phone");

-- CreateIndex
CREATE INDEX "Contact_category_idx" ON "Contact"("category");

-- CreateIndex
CREATE INDEX "Contact_favorite_idx" ON "Contact"("favorite");

-- AlterTable
ALTER TABLE "Inquiry" ADD COLUMN "customerId" TEXT;
ALTER TABLE "Appointment" ADD COLUMN "customerId" TEXT;

-- CreateIndex
CREATE INDEX "Inquiry_customerId_idx" ON "Inquiry"("customerId");

-- CreateIndex
CREATE INDEX "Appointment_customerId_idx" ON "Appointment"("customerId");

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
