/*
  Warnings:

  - You are about to drop the column `barcode` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the `Barcode` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `qr` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "barcode",
ADD COLUMN     "qr" TEXT NOT NULL;

-- DropTable
DROP TABLE "Barcode";

-- CreateTable
CREATE TABLE "Qr" (
    "id" SERIAL NOT NULL,
    "data" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Qr_pkey" PRIMARY KEY ("id")
);
