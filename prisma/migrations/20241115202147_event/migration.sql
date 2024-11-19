/*
  Warnings:

  - Added the required column `hours` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "hours" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "approvedHours" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pendingHours" INTEGER NOT NULL DEFAULT 0;
