-- CreateEnum
CREATE TYPE "ChatChannel" AS ENUM ('WEB', 'WHATSAPP', 'INSTAGRAM', 'AI_CONCIERGE', 'EMAIL', 'PHONE', 'OTHER');

-- AlterTable
ALTER TABLE "ChatSession" ADD COLUMN "channel" "ChatChannel" NOT NULL DEFAULT 'WEB';
ALTER TABLE "ChatSession" ADD COLUMN "externalRef" TEXT;
ALTER TABLE "ChatSession" ADD COLUMN "visitorPhone" TEXT;

-- CreateIndex
CREATE INDEX "ChatSession_channel_idx" ON "ChatSession"("channel");
