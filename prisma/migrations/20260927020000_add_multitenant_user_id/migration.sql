-- AlterTable
ALTER TABLE "ActivityLog" ADD COLUMN "userId" TEXT;

-- AlterTable
ALTER TABLE "Entity" ADD COLUMN "userId" TEXT;

-- AlterTable
ALTER TABLE "Group" ADD COLUMN "userId" TEXT;

-- Backfill userId for existing rows if any user exists
UPDATE "Group" SET "userId" = (SELECT id FROM "User" ORDER BY "createdAt" ASC LIMIT 1) WHERE "userId" IS NULL;
UPDATE "Entity" SET "userId" = (SELECT id FROM "User" ORDER BY "createdAt" ASC LIMIT 1) WHERE "userId" IS NULL;

-- AlterColumn to NOT NULL
ALTER TABLE "Entity" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Group" ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");

-- CreateIndex
CREATE INDEX "Entity_userId_idx" ON "Entity"("userId");

-- CreateIndex
CREATE INDEX "Group_userId_idx" ON "Group"("userId");

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entity" ADD CONSTRAINT "Entity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
