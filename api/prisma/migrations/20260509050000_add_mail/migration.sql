-- CreateEnum
CREATE TYPE "EmailDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('UNREAD', 'READ', 'DELETED');

-- CreateTable
CREATE TABLE "EmailMessage" (
    "id" TEXT NOT NULL,
    "direction" "EmailDirection" NOT NULL,
    "status" "EmailStatus" NOT NULL DEFAULT 'UNREAD',
    "imapUid" TEXT,
    "imapFolder" TEXT NOT NULL DEFAULT 'INBOX',
    "messageId" TEXT,
    "inReplyTo" TEXT,
    "threadKey" TEXT,
    "fromAddress" TEXT NOT NULL,
    "fromName" TEXT,
    "toAddresses" TEXT NOT NULL,
    "ccAddresses" TEXT,
    "subject" TEXT NOT NULL DEFAULT '',
    "bodyText" TEXT NOT NULL DEFAULT '',
    "bodyHtml" TEXT NOT NULL DEFAULT '',
    "hasAttachment" BOOLEAN NOT NULL DEFAULT false,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailMessage_imapFolder_imapUid_key" ON "EmailMessage"("imapFolder", "imapUid");

-- CreateIndex
CREATE INDEX "EmailMessage_direction_status_receivedAt_idx" ON "EmailMessage"("direction", "status", "receivedAt");

-- CreateIndex
CREATE INDEX "EmailMessage_threadKey_receivedAt_idx" ON "EmailMessage"("threadKey", "receivedAt");
