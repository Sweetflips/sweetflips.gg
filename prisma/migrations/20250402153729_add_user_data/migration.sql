/*
  Warnings:

  - You are about to drop the column `accessToken` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "accessToken",
ADD COLUMN     "refresh_token" TEXT,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "UserData" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "kickId" TEXT NOT NULL,
    "watchtime" INTEGER NOT NULL,
    "xp" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "followage" TEXT NOT NULL,
    "converted_tokens" INTEGER NOT NULL,
    "token_balance" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserData_kickId_key" ON "UserData"("kickId");
