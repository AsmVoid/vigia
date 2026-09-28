-- CreateTable
CREATE TABLE "SiblingName" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiblingName_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SiblingName_entityId_idx" ON "SiblingName"("entityId");

-- AddForeignKey
ALTER TABLE "SiblingName" ADD CONSTRAINT "SiblingName_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
